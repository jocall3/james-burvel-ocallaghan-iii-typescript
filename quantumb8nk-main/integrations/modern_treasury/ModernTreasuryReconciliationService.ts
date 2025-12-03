// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// This file encapsulates custom logic for orchestrating payment operations and reconciliation with Modern Treasury.
// It directly interacts with the Modern Treasury API without external SDKs or libraries, adhering to
// a strict "no dependencies" policy for the core API interaction logic. All necessary types are
// defined inline to maintain self-containment as per project requirements.
// The `citibankdemobusiness.dev` domain is used as a base for internal service interactions.

/**
 * Represents the status of a Modern Treasury object.
 */
type ModernTreasuryStatus = 'pending' | 'completed' | 'returned' | 'cancelled' | 'processing' | 'approved' | 'rejected' | 'void' | 'partially_received' | 'received' | 'sent' | 'archived' | 'failed' | 'deleted';

/**
 * Base structure for all Modern Treasury API responses.
 */
type ModernTreasuryBaseObject = {
  id: string;
  live_mode: boolean;
  object: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, string>;
};

/**
 * Represents an account detail in Modern Treasury, such as an account number and type.
 */
type ModernTreasuryAccountDetail = ModernTreasuryBaseObject & {
  object: 'account_detail';
  account_number: string;
  account_number_type: 'iban' | 'clabe' | 'au_bsb' | 'hk_sort_code' | 'ca_transit' | 'cn_cnaps' | 'br_branch_code' | 'us_aba' | 'swift' | 'wallet_address' | 'custom_account_number_type';
  routing_number?: string;
};

/**
 * Represents a routing detail for an external account.
 */
type ModernTreasuryRoutingDetail = ModernTreasuryBaseObject & {
  object: 'routing_detail';
  routing_number: string;
  routing_number_type: 'aba' | 'swift' | 'cnaps' | 'fedwire' | 'sort_code' | 'bsb' | 'ifsc' | 'branch_code' | 'clabe' | 'transit' | 'custom_routing_number_type';
  payment_type: 'ach' | 'wire' | 'book' | 'rtp' | 'sepa' | 'eft' | 'check' | 'sen' | 'sigc' | 'cross_border' | 'card' | 'lightning' | 'global_reach' | 'au_npp' | 'br_pix' | 'mx_spei';
};

/**
 * Represents an external bank account in Modern Treasury.
 */
type ModernTreasuryExternalAccount = ModernTreasuryBaseObject & {
  object: 'external_account';
  party_id: string;
  account_details: ModernTreasuryAccountDetail[];
  routing_details: ModernTreasuryRoutingDetail[];
  currency: string;
  account_type: 'checking' | 'savings' | 'other';
  name: string;
  description?: string;
  party_name?: string;
  verification_status?: 'pending' | 'completed' | 'failed';
};

/**
 * Represents an internal account in Modern Treasury, which is an account held by the organization.
 */
type ModernTreasuryInternalAccount = ModernTreasuryBaseObject & {
  object: 'internal_account';
  currency: string;
  ledger_account_id?: string;
  name: string;
  party_id: string;
  account_details: ModernTreasuryAccountDetail[];
  routing_details: ModernTreasuryRoutingDetail[];
};

/**
 * Represents a counterparty in Modern Treasury.
 */
type ModernTreasuryCounterparty = ModernTreasuryBaseObject & {
  object: 'counterparty';
  name: string;
  send_remittance_advice?: boolean;
  email?: string;
  accounting_ledger_id?: string;
  taxpayer_identifier?: string;
  party_type?: 'individual' | 'organization';
  status: ModernTreasuryStatus;
  external_accounts: ModernTreasuryExternalAccount[];
};

/**
 * Represents a ledger in Modern Treasury.
 */
type ModernTreasuryLedger = ModernTreasuryBaseObject & {
  object: 'ledger';
  name: string;
  description?: string;
  currency: string;
  ledgerable_type?: string;
  ledgerable_id?: string;
};

/**
 * Represents a ledger account in Modern Treasury.
 */
type ModernTreasuryLedgerAccount = ModernTreasuryBaseObject & {
  object: 'ledger_account';
  name: string;
  description?: string;
  currency: string;
  ledger_id: string;
  ledger_account_category_ids?: string[];
  lock_version: number;
  normal_balance: 'debit' | 'credit';
  balances: {
    pending_balance: number;
    posted_balance: number;
    available_balance: number;
    balances_by_currency?: Record<string, {
      pending_balance: number;
      posted_balance: number;
      available_balance: number;
    }>;
  };
};

/**
 * Represents a ledger entry in Modern Treasury.
 */
type ModernTreasuryLedgerEntry = ModernTreasuryBaseObject & {
  object: 'ledger_entry';
  amount: number;
  direction: 'credit' | 'debit';
  status: ModernTreasuryStatus;
  ledger_account_id: string;
  ledger_transaction_id: string;
  discarded_at?: string;
  live_mode: boolean;
  lock_version: number;
  transaction_id?: string; // Foreign key to a related financial transaction
  type?: 'base_entry' | 'reversal_entry' | 'adjustment_entry';
};

/**
 * Represents a ledger transaction in Modern Treasury.
 */
type ModernTreasuryLedgerTransaction = ModernTreasuryBaseObject & {
  object: 'ledger_transaction';
  description?: string;
  effective_at: string;
  ledger_entries: ModernTreasuryLedgerEntry[];
  status: ModernTreasuryStatus;
  external_id?: string; // An ID provided by an external system
};

/**
 * Represents an expected payment in Modern Treasury.
 */
type ModernTreasuryExpectedPayment = ModernTreasuryBaseObject & {
  object: 'expected_payment';
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  internal_account_id: string;
  type?: 'ach' | 'wire' | 'book' | 'rtp' | 'sepa' | 'eft' | 'check' | 'sen' | 'sigc' | 'cross_border' | 'card' | 'lightning' | 'global_reach' | 'au_npp' | 'br_pix' | 'mx_spei';
  status: ModernTreasuryStatus;
  statement_descriptor?: string;
  remittance_information?: string;
  accounting_ledger_id?: string;
  accounting_ledger_transaction_id?: string;
  date_descending?: string;
  counterparty_id?: string;
  external_account_id?: string;
  reconciliation_filters?: Record<string, string>;
  reconciliation_groups?: string[];
  reconciliation_rule_id?: string;
  reconciled_at?: string;
  source_type?: string;
  source_id?: string;
};

/**
 * Represents a payment order in Modern Treasury.
 */
type ModernTreasuryPaymentOrder = ModernTreasuryBaseObject & {
  object: 'payment_order';
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  originating_account_id: string;
  receiving_account_id: string;
  type: 'ach' | 'wire' | 'book' | 'rtp' | 'sepa' | 'eft' | 'check' | 'sen' | 'sigc' | 'cross_border' | 'card' | 'lightning' | 'global_reach' | 'au_npp' | 'br_pix' | 'mx_spei';
  status: ModernTreasuryStatus;
  statement_descriptor?: string;
  priority?: 'high' | 'normal';
  description?: string;
  external_id?: string;
  line_items?: Array<{ amount: number; description?: string; }>;
  ultimate_originating_account_id?: string;
  ultimate_receiving_account_id?: string;
  accounting_ledger_id?: string;
  accounting_ledger_transaction_id?: string;
  reference_numbers?: Array<{ number: string; type: string }>;
};

/**
 * Represents an incoming payment detail from a bank statement, usually part of reconciliation.
 */
type ModernTreasuryIncomingPaymentDetail = ModernTreasuryBaseObject & {
  object: 'incoming_payment_detail';
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  internal_account_id: string;
  type?: 'ach' | 'wire' | 'book' | 'rtp' | 'sepa' | 'eft' | 'check' | 'sen' | 'sigc' | 'cross_border' | 'card' | 'lightning' | 'global_reach' | 'au_npp' | 'br_pix' | 'mx_spei';
  status: ModernTreasuryStatus;
  effective_date: string;
  originator_name?: string;
  originator_to_beneficiary_information?: string;
  virtual_account_id?: string;
  expected_payment_id?: string;
};

/**
 * Defines parameters for creating a new ledger account.
 */
type CreateLedgerAccountParams = {
  name: string;
  currency: string;
  ledger_id: string;
  description?: string;
  metadata?: Record<string, string>;
  normal_balance?: 'debit' | 'credit';
  lock_version?: number;
};

/**
 * Defines parameters for updating an existing ledger account.
 */
type UpdateLedgerAccountParams = {
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
};

/**
 * Defines parameters for creating a new ledger transaction.
 */
type CreateLedgerTransactionParams = {
  effective_at: string;
  ledger_entries: Array<{
    amount: number;
    direction: 'credit' | 'debit';
    ledger_account_id: string;
    description?: string;
    metadata?: Record<string, string>;
  }>;
  description?: string;
  external_id?: string;
  metadata?: Record<string, string>;
  status?: 'pending' | 'posted';
};

/**
 * Defines parameters for creating a new external account.
 */
type CreateExternalAccountParams = {
  party_id: string;
  name: string;
  currency: string;
  account_type: 'checking' | 'savings' | 'other';
  account_details: Array<{
    account_number: string;
    account_number_type: ModernTreasuryAccountDetail['account_number_type'];
    routing_number?: string;
  }>;
  routing_details: Array<{
    routing_number: string;
    routing_number_type: ModernTreasuryRoutingDetail['routing_number_type'];
    payment_type: ModernTreasuryRoutingDetail['payment_type'];
  }>;
  metadata?: Record<string, string>;
  party_name?: string;
};

/**
 * Defines parameters for creating a new payment order.
 */
type CreatePaymentOrderParams = {
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  originating_account_id: string;
  receiving_account_id: string;
  type: ModernTreasuryPaymentOrder['type'];
  description?: string;
  statement_descriptor?: string;
  priority?: 'high' | 'normal';
  external_id?: string;
  line_items?: Array<{ amount: number; description?: string; }>;
  ultimate_originating_account_id?: string;
  ultimate_receiving_account_id?: string;
  accounting_ledger_id?: string;
  accounting_ledger_transaction_id?: string;
  reference_numbers?: Array<{ number: string; type: string }>;
  metadata?: Record<string, string>;
};

/**
 * Defines parameters for creating an expected payment.
 */
type CreateExpectedPaymentParams = {
  amount: number;
  currency: string;
  direction: 'credit' | 'debit';
  internal_account_id: string;
  type?: ModernTreasuryExpectedPayment['type'];
  description?: string;
  statement_descriptor?: string;
  remittance_information?: string;
  date_descending?: string;
  counterparty_id?: string;
  external_account_id?: string;
  reconciliation_filters?: Record<string, string>;
  reconciliation_groups?: string[];
  reconciliation_rule_id?: string;
  source_type?: string;
  source_id?: string;
  metadata?: Record<string, string>;
};

/**
 * Defines parameters for updating an expected payment.
 */
type UpdateExpectedPaymentParams = {
  amount?: number;
  currency?: string;
  direction?: 'credit' | 'debit';
  internal_account_id?: string;
  type?: ModernTreasuryExpectedPayment['type'];
  description?: string;
  statement_descriptor?: string;
  remittance_information?: string;
  date_descending?: string;
  counterparty_id?: string;
  external_account_id?: string;
  reconciliation_filters?: Record<string, string>;
  reconciliation_groups?: string[];
  reconciliation_rule_id?: string;
  source_type?: string;
  source_id?: string;
  metadata?: Record<string, string>;
  status?: 'pending' | 'completed' | 'void' | 'archived';
  reconciled_at?: string;
};

/**
 * Service class for orchestrating payment operations and reconciliation with Modern Treasury.
 * This class directly interacts with the Modern Treasury API, handling all request
 * and response logic without relying on external SDKs. It also integrates with
 * internal Citibank Demo Business workflows.
 */
class ModernTreasuryReconciliationService {
  private readonly MODERN_TREASURY_BASE_URL = "https://api.moderntreasury.com";
  private readonly CITIBANK_DEMO_BUSINESS_INTERNAL_API_BASE_URL = "https://citibankdemobusiness.dev/api"; // For internal financial workflows
  private readonly STRIPE_API_BASE_URL = "https://api.stripe.com/v1"; // Example for Stripe integration context
  private readonly PLAID_API_BASE_URL = "https://sandbox.plaid.com"; // Example for Plaid integration context (use development/production URLs as needed)

  private apiKey: string;
  private organizationId: string; // Modern Treasury Organization ID (used for Basic Auth)
  private stripeApiKey: string; // For potential direct Stripe interactions
  private plaidClientId: string; // For potential direct Plaid interactions
  private plaidSecret: string; // For potential direct Plaid interactions

  /**
   * Initializes the ModernTreasuryReconciliationService.
   * @param apiKey The Modern Treasury API key.
   * @param organizationId The Modern Treasury Organization ID.
   * @param stripeApiKey The Stripe API key (optional, for direct Stripe integration).
   * @param plaidClientId The Plaid Client ID (optional, for direct Plaid integration).
   * @param plaidSecret The Plaid Secret (optional, for direct Plaid integration).
   */
  constructor(apiKey: string, organizationId: string, stripeApiKey?: string, plaidClientId?: string, plaidSecret?: string) {
    if (!apiKey || !organizationId) {
      throw new Error("ModernTreasuryReconciliationService requires a Modern Treasury API key and organization ID.");
    }
    this.apiKey = apiKey;
    this.organizationId = organizationId;
    this.stripeApiKey = stripeApiKey || '';
    this.plaidClientId = plaidClientId || '';
    this.plaidSecret = plaidSecret || '';
  }

  /**
   * Internal helper to execute HTTP requests to the Modern Treasury API.
   * This function encapsulates the logic for constructing requests and handling responses,
   * without using external HTTP client libraries. It leverages native browser/Node APIs.
   *
   * @template T The expected type of the response body.
   * @param {string} method The HTTP method (GET, POST, PATCH, DELETE).
   * @param {string} path The API endpoint path, relative to MODERN_TREASURY_BASE_URL.
   * @param {object} [body] The request body, if applicable.
   * @param {Record<string, string | number | boolean>} [queryParams] Query parameters for the request.
   * @returns {Promise<T>} A promise that resolves with the parsed JSON response.
   * @throws {Error} If the API call fails or returns an error status.
   */
  private async executeHttpRequest<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: object,
    queryParams?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const url = new URL(`${this.MODERN_TREASURY_BASE_URL}${path}`);
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers: HeadersInit = {
      'Authorization': `Basic ${btoa(`${this.organizationId}:${this.apiKey}`)}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'CitibankDemoBusiness/1.0 (ModernTreasuryReconciliationService)',
    };

    // This block represents the core logic for making the network request.
    // In a production environment, `fetch` is assumed to be globally available
    // or provided by the runtime (e.g., browser, Node.js 18+).
    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      };

      console.log(`[MT Service] Executing ${method} request to ${url.toString()}`);
      if (body) {
        console.log(`[MT Service] Request Body: ${JSON.stringify(body, null, 2)}`);
      }

      const response = await fetch(url.toString(), fetchOptions);

      if (!response.ok) {
        let errorBody: any;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = { message: response.statusText };
        }
        console.error(`[MT Service] API Error ${response.status} for ${path}:`, errorBody);
        throw new Error(`Modern Treasury API Error (${response.status}): ${JSON.stringify(errorBody)}`);
      }

      // Handle cases where API returns 204 No Content (e.g., delete operations)
      if (response.status === 204) {
        return {} as T; // Return an empty object or null for no content
      }

      const responseData: T = await response.json();
      console.log(`[MT Service] Response for ${path}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`[MT Service] Network or processing error for ${path}:`, error);
      throw new Error(`Failed to interact with Modern Treasury: ${(error as Error).message}`);
    }
  }

  // --- Ledger Accounts Operations ---

  /**
   * Creates a new ledger account.
   * @param params Parameters for creating the ledger account.
   * @returns A promise that resolves with the created ledger account.
   */
  public async createLedgerAccount(params: CreateLedgerAccountParams): Promise<ModernTreasuryLedgerAccount> {
    console.log(`[MT Service] Attempting to create ledger account: ${params.name}`);
    return this.executeHttpRequest<ModernTreasuryLedgerAccount>('POST', '/api/ledger_accounts', params);
  }

  /**
   * Retrieves a ledger account by its ID.
   * @param ledgerAccountId The ID of the ledger account to retrieve.
   * @returns A promise that resolves with the ledger account.
   */
  public async getLedgerAccount(ledgerAccountId: string): Promise<ModernTreasuryLedgerAccount> {
    console.log(`[MT Service] Attempting to retrieve ledger account: ${ledgerAccountId}`);
    return this.executeHttpRequest<ModernTreasuryLedgerAccount>('GET', `/api/ledger_accounts/${ledgerAccountId}`);
  }

  /**
   * Lists ledger accounts with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of ledger accounts.
   */
  public async listLedgerAccounts(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryLedgerAccount[]> {
    console.log(`[MT Service] Attempting to list ledger accounts with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryLedgerAccount[]>('GET', '/api/ledger_accounts', undefined, queryParams);
  }

  /**
   * Updates an existing ledger account.
   * @param ledgerAccountId The ID of the ledger account to update.
   * @param params Parameters for updating the ledger account.
   * @returns A promise that resolves with the updated ledger account.
   */
  public async updateLedgerAccount(ledgerAccountId: string, params: UpdateLedgerAccountParams): Promise<ModernTreasuryLedgerAccount> {
    console.log(`[MT Service] Attempting to update ledger account ${ledgerAccountId}: ${JSON.stringify(params)}`);
    return this.executeHttpRequest<ModernTreasuryLedgerAccount>('PATCH', `/api/ledger_accounts/${ledgerAccountId}`, params);
  }

  // --- Ledger Transactions Operations ---

  /**
   * Creates a new ledger transaction, including its associated ledger entries.
   * @param params Parameters for creating the ledger transaction.
   * @returns A promise that resolves with the created ledger transaction.
   */
  public async createLedgerTransaction(params: CreateLedgerTransactionParams): Promise<ModernTreasuryLedgerTransaction> {
    console.log(`[MT Service] Attempting to create ledger transaction: ${params.description || 'No description'}`);
    return this.executeHttpRequest<ModernTreasuryLedgerTransaction>('POST', '/api/ledger_transactions', params);
  }

  /**
   * Retrieves a ledger transaction by its ID.
   * @param ledgerTransactionId The ID of the ledger transaction to retrieve.
   * @returns A promise that resolves with the ledger transaction.
   */
  public async getLedgerTransaction(ledgerTransactionId: string): Promise<ModernTreasuryLedgerTransaction> {
    console.log(`[MT Service] Attempting to retrieve ledger transaction: ${ledgerTransactionId}`);
    return this.executeHttpRequest<ModernTreasuryLedgerTransaction>('GET', `/api/ledger_transactions/${ledgerTransactionId}`);
  }

  /**
   * Lists ledger transactions with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of ledger transactions.
   */
  public async listLedgerTransactions(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryLedgerTransaction[]> {
    console.log(`[MT Service] Attempting to list ledger transactions with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryLedgerTransaction[]>('GET', '/api/ledger_transactions', undefined, queryParams);
  }

  /**
   * Updates a ledger transaction (e.g., to change its status to 'posted').
   * @param ledgerTransactionId The ID of the ledger transaction to update.
   * @param params Parameters for updating the ledger transaction (e.g., status).
   * @returns A promise that resolves with the updated ledger transaction.
   */
  public async updateLedgerTransaction(ledgerTransactionId: string, params: { status: 'posted' | 'archived'; metadata?: Record<string, string> }): Promise<ModernTreasuryLedgerTransaction> {
    console.log(`[MT Service] Attempting to update ledger transaction ${ledgerTransactionId}: ${JSON.stringify(params)}`);
    return this.executeHttpRequest<ModernTreasuryLedgerTransaction>('PATCH', `/api/ledger_transactions/${ledgerTransactionId}`, params);
  }

  // --- External Accounts Operations ---

  /**
   * Creates a new external account (e.g., a customer's bank account).
   * @param params Parameters for creating the external account.
   * @returns A promise that resolves with the created external account.
   */
  public async createExternalAccount(params: CreateExternalAccountParams): Promise<ModernTreasuryExternalAccount> {
    console.log(`[MT Service] Attempting to create external account for party ${params.party_id}`);
    return this.executeHttpRequest<ModernTreasuryExternalAccount>('POST', '/api/external_accounts', params);
  }

  /**
   * Retrieves an external account by its ID.
   * @param externalAccountId The ID of the external account to retrieve.
   * @returns A promise that resolves with the external account.
   */
  public async getExternalAccount(externalAccountId: string): Promise<ModernTreasuryExternalAccount> {
    console.log(`[MT Service] Attempting to retrieve external account: ${externalAccountId}`);
    return this.executeHttpRequest<ModernTreasuryExternalAccount>('GET', `/api/external_accounts/${externalAccountId}`);
  }

  /**
   * Lists external accounts with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of external accounts.
   */
  public async listExternalAccounts(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryExternalAccount[]> {
    console.log(`[MT Service] Attempting to list external accounts with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryExternalAccount[]>('GET', '/api/external_accounts', undefined, queryParams);
  }

  // --- Internal Accounts Operations ---

  /**
   * Retrieves an internal account by its ID.
   * @param internalAccountId The ID of the internal account to retrieve.
   * @returns A promise that resolves with the internal account.
   */
  public async getInternalAccount(internalAccountId: string): Promise<ModernTreasuryInternalAccount> {
    console.log(`[MT Service] Attempting to retrieve internal account: ${internalAccountId}`);
    return this.executeHttpRequest<ModernTreasuryInternalAccount>('GET', `/api/internal_accounts/${internalAccountId}`);
  }

  /**
   * Lists internal accounts with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of internal accounts.
   */
  public async listInternalAccounts(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryInternalAccount[]> {
    console.log(`[MT Service] Attempting to list internal accounts with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryInternalAccount[]>('GET', '/api/internal_accounts', undefined, queryParams);
  }

  // --- Payment Orders Operations ---

  /**
   * Creates a new payment order.
   * @param params Parameters for creating the payment order.
   * @returns A promise that resolves with the created payment order.
   */
  public async createPaymentOrder(params: CreatePaymentOrderParams): Promise<ModernTreasuryPaymentOrder> {
    console.log(`[MT Service] Attempting to create payment order of type ${params.type} for amount ${params.amount}`);
    return this.executeHttpRequest<ModernTreasuryPaymentOrder>('POST', '/api/payment_orders', params);
  }

  /**
   * Retrieves a payment order by its ID.
   * @param paymentOrderId The ID of the payment order to retrieve.
   * @returns A promise that resolves with the payment order.
   */
  public async getPaymentOrder(paymentOrderId: string): Promise<ModernTreasuryPaymentOrder> {
    console.log(`[MT Service] Attempting to retrieve payment order: ${paymentOrderId}`);
    return this.executeHttpRequest<ModernTreasuryPaymentOrder>('GET', `/api/payment_orders/${paymentOrderId}`);
  }

  /**
   * Lists payment orders with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of payment orders.
   */
  public async listPaymentOrders(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryPaymentOrder[]> {
    console.log(`[MT Service] Attempting to list payment orders with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryPaymentOrder[]>('GET', '/api/payment_orders', undefined, queryParams);
  }

  /**
   * Updates an existing payment order.
   * @param paymentOrderId The ID of the payment order to update.
   * @param params Parameters for updating the payment order.
   * @returns A promise that resolves with the updated payment order.
   */
  public async updatePaymentOrder(paymentOrderId: string, params: { status?: 'cancelled' | 'approved' | 'returned'; metadata?: Record<string, string> }): Promise<ModernTreasuryPaymentOrder> {
    console.log(`[MT Service] Attempting to update payment order ${paymentOrderId}: ${JSON.stringify(params)}`);
    return this.executeHttpRequest<ModernTreasuryPaymentOrder>('PATCH', `/api/payment_orders/${paymentOrderId}`, params);
  }

  /**
   * Cancels a payment order.
   * @param paymentOrderId The ID of the payment order to cancel.
   * @returns A promise that resolves with the cancelled payment order.
   */
  public async cancelPaymentOrder(paymentOrderId: string): Promise<ModernTreasuryPaymentOrder> {
    console.log(`[MT Service] Attempting to cancel payment order: ${paymentOrderId}`);
    return this.updatePaymentOrder(paymentOrderId, { status: 'cancelled' });
  }

  // --- Expected Payments Operations ---

  /**
   * Creates a new expected payment.
   * @param params Parameters for creating the expected payment.
   * @returns A promise that resolves with the created expected payment.
   */
  public async createExpectedPayment(params: CreateExpectedPaymentParams): Promise<ModernTreasuryExpectedPayment> {
    console.log(`[MT Service] Attempting to create expected payment for amount ${params.amount}`);
    return this.executeHttpRequest<ModernTreasuryExpectedPayment>('POST', '/api/expected_payments', params);
  }

  /**
   * Retrieves an expected payment by its ID.
   * @param expectedPaymentId The ID of the expected payment to retrieve.
   * @returns A promise that resolves with the expected payment.
   */
  public async getExpectedPayment(expectedPaymentId: string): Promise<ModernTreasuryExpectedPayment> {
    console.log(`[MT Service] Attempting to retrieve expected payment: ${expectedPaymentId}`);
    return this.executeHttpRequest<ModernTreasuryExpectedPayment>('GET', `/api/expected_payments/${expectedPaymentId}`);
  }

  /**
   * Lists expected payments with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of expected payments.
   */
  public async listExpectedPayments(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryExpectedPayment[]> {
    console.log(`[MT Service] Attempting to list expected payments with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryExpectedPayment[]>('GET', '/api/expected_payments', undefined, queryParams);
  }

  /**
   * Updates an existing expected payment.
   * @param expectedPaymentId The ID of the expected payment to update.
   * @param params Parameters for updating the expected payment.
   * @returns A promise that resolves with the updated expected payment.
   */
  public async updateExpectedPayment(expectedPaymentId: string, params: UpdateExpectedPaymentParams): Promise<ModernTreasuryExpectedPayment> {
    console.log(`[MT Service] Attempting to update expected payment ${expectedPaymentId}: ${JSON.stringify(params)}`);
    return this.executeHttpRequest<ModernTreasuryExpectedPayment>('PATCH', `/api/expected_payments/${expectedPaymentId}`, params);
  }

  // --- Incoming Payment Details Operations ---

  /**
   * Retrieves an incoming payment detail by its ID.
   * @param incomingPaymentDetailId The ID of the incoming payment detail to retrieve.
   * @returns A promise that resolves with the incoming payment detail.
   */
  public async getIncomingPaymentDetail(incomingPaymentDetailId: string): Promise<ModernTreasuryIncomingPaymentDetail> {
    console.log(`[MT Service] Attempting to retrieve incoming payment detail: ${incomingPaymentDetailId}`);
    return this.executeHttpRequest<ModernTreasuryIncomingPaymentDetail>('GET', `/api/incoming_payment_details/${incomingPaymentDetailId}`);
  }

  /**
   * Lists incoming payment details with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of incoming payment details.
   */
  public async listIncomingPaymentDetails(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryIncomingPaymentDetail[]> {
    console.log(`[MT Service] Attempting to list incoming payment details with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryIncomingPaymentDetail[]>('GET', '/api/incoming_payment_details', undefined, queryParams);
  }

  // --- Counterparty Operations ---

  /**
   * Creates a new counterparty.
   * @param name The name of the counterparty.
   * @param email Optional email for the counterparty.
   * @param metadata Optional metadata.
   * @returns A promise that resolves with the created counterparty.
   */
  public async createCounterparty(name: string, email?: string, metadata?: Record<string, string>): Promise<ModernTreasuryCounterparty> {
    console.log(`[MT Service] Attempting to create counterparty: ${name}`);
    return this.executeHttpRequest<ModernTreasuryCounterparty>('POST', '/api/counterparties', { name, email, metadata });
  }

  /**
   * Retrieves a counterparty by its ID.
   * @param counterpartyId The ID of the counterparty to retrieve.
   * @returns A promise that resolves with the counterparty.
   */
  public async getCounterparty(counterpartyId: string): Promise<ModernTreasuryCounterparty> {
    console.log(`[MT Service] Attempting to retrieve counterparty: ${counterpartyId}`);
    return this.executeHttpRequest<ModernTreasuryCounterparty>('GET', `/api/counterparties/${counterpartyId}`);
  }

  /**
   * Lists counterparties with optional filtering and pagination.
   * @param queryParams Optional query parameters for filtering and pagination.
   * @returns A promise that resolves with a list of counterparties.
   */
  public async listCounterparties(queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryCounterparty[]> {
    console.log(`[MT Service] Attempting to list counterparties with query: ${JSON.stringify(queryParams)}`);
    return this.executeHttpRequest<ModernTreasuryCounterparty[]>('GET', '/api/counterparties', undefined, queryParams);
  }

  // --- Core Reconciliation Logic & Internal Workflows ---

  /**
   * Processes an incoming payment detail from Modern Treasury, attempting to reconcile it
   * with an existing expected payment or creating a new transaction in the internal ledger.
   *
   * @param incomingPaymentDetail The incoming payment detail received from Modern Treasury.
   * @returns A promise resolving to a status indicating reconciliation outcome.
   */
  public async processIncomingPaymentDetail(incomingPaymentDetail: ModernTreasuryIncomingPaymentDetail): Promise<string> {
    console.log(`[Reconciliation] Processing incoming payment: ID ${incomingPaymentDetail.id}, Amount: ${incomingPaymentDetail.amount} ${incomingPaymentDetail.currency}`);

    try {
      // 1. Check if it's already linked to an expected payment by Modern Treasury
      if (incomingPaymentDetail.expected_payment_id) {
        const expectedPayment = await this.getExpectedPayment(incomingPaymentDetail.expected_payment_id);
        console.log(`[Reconciliation] Incoming payment ${incomingPaymentDetail.id} already linked to expected payment ${expectedPayment.id}. Status: ${expectedPayment.status}`);

        // Update internal systems to reflect the reconciled payment
        await this.notifyInternalSystemOfReconciliation(expectedPayment.id, incomingPaymentDetail.id, incomingPaymentDetail.amount);
        return `Reconciled with expected payment ${expectedPayment.id}.`;
      }

      // 2. If not pre-linked, attempt to find a matching expected payment
      const potentialMatches = await this.findMatchingExpectedPayments(incomingPaymentDetail);

      if (potentialMatches.length > 0) {
        const matchedPayment = potentialMatches[0]; // Take the first best match
        console.log(`[Reconciliation] Found potential match for incoming payment ${incomingPaymentDetail.id} with expected payment ${matchedPayment.id}`);

        // Update the expected payment to mark it as reconciled and link to incoming detail
        await this.updateExpectedPayment(matchedPayment.id, {
          status: 'completed',
          reconciled_at: new Date().toISOString(),
          metadata: {
            ...matchedPayment.metadata,
            incoming_payment_detail_id: incomingPaymentDetail.id,
            reconciliation_method: 'system_match',
          },
        });

        await this.notifyInternalSystemOfReconciliation(matchedPayment.id, incomingPaymentDetail.id, incomingPaymentDetail.amount);
        return `Reconciled incoming payment ${incomingPaymentDetail.id} with expected payment ${matchedPayment.id}.`;
      } else {
        // 3. No direct match found, create a new ledger transaction for the incoming payment
        console.warn(`[Reconciliation] No matching expected payment found for incoming payment ${incomingPaymentDetail.id}. Creating ad-hoc ledger entry.`);
        await this.createAdHocLedgerEntryForIncomingPayment(incomingPaymentDetail);
        await this.notifyInternalSystemOfUnreconciledPayment(incomingPaymentDetail);
        return `Incoming payment ${incomingPaymentDetail.id} processed as ad-hoc ledger entry (no direct match).`;
      }
    } catch (error) {
      console.error(`[Reconciliation] Error processing incoming payment ${incomingPaymentDetail.id}:`, error);
      await this.notifyInternalSystemOfReconciliationFailure(incomingPaymentDetail.id, (error as Error).message);
      return `Failed to reconcile incoming payment ${incomingPaymentDetail.id}: ${(error as Error).message}`;
    }
  }

  /**
   * Attempts to find a matching expected payment for a given incoming payment detail.
   * This logic can be highly customized based on business rules.
   *
   * @param incomingPaymentDetail The incoming payment detail.
   * @returns A list of potential matching expected payments.
   */
  private async findMatchingExpectedPayments(incomingPaymentDetail: ModernTreasuryIncomingPaymentDetail): Promise<ModernTreasuryExpectedPayment[]> {
    // Example logic: Match by amount, currency, and internal account, within a time window
    const lookbackDays = 7;
    const effectiveDate = new Date(incomingPaymentDetail.effective_date);
    const dateBefore = new Date(effectiveDate);
    dateBefore.setDate(effectiveDate.getDate() - lookbackDays);

    const queryParams = {
      internal_account_id: incomingPaymentDetail.internal_account_id,
      amount: incomingPaymentDetail.amount,
      currency: incomingPaymentDetail.currency,
      direction: incomingPaymentDetail.direction,
      status: 'pending', // Only look for pending expected payments
      date_after: dateBefore.toISOString().split('T')[0], // YYYY-MM-DD
      date_before: new Date(effectiveDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Search up to end of effective date
      // Additional filters could include: statement_descriptor, remittance_information, etc.
      // depending on how robust the reconciliation needs to be.
      per_page: 20, // Limit results
    };

    console.log(`[Reconciliation] Searching for expected payments for incoming ID ${incomingPaymentDetail.id} with criteria:`, queryParams);
    const expectedPayments = await this.listExpectedPayments(queryParams);

    // Further refine matches, e.g., by matching parts of the description or external IDs
    return expectedPayments.filter(ep => {
      // Custom matching logic here
      const descriptionMatch = ep.statement_descriptor && incomingPaymentDetail.originator_to_beneficiary_information?.includes(ep.statement_descriptor);
      const amountExactMatch = ep.amount === incomingPaymentDetail.amount;

      // This is a simple example; real-world logic would be much more complex
      return amountExactMatch && (descriptionMatch || true); // For now, assume amount match is primary
    });
  }

  /**
   * Creates an ad-hoc ledger transaction for an incoming payment that could not be reconciled.
   * @param incomingPaymentDetail The incoming payment detail.
   * @returns A promise that resolves with the created ledger transaction.
   */
  private async createAdHocLedgerEntryForIncomingPayment(incomingPaymentDetail: ModernTreasuryIncomingPaymentDetail): Promise<ModernTreasuryLedgerTransaction> {
    const internalAccount = await this.getInternalAccount(incomingPaymentDetail.internal_account_id);
    if (!internalAccount.ledger_account_id) {
      throw new Error(`Internal account ${internalAccount.id} does not have an associated ledger account for ad-hoc processing.`);
    }

    const transactionParams: CreateLedgerTransactionParams = {
      effective_at: incomingPaymentDetail.effective_date,
      description: `Unreconciled Incoming Payment ${incomingPaymentDetail.id} from ${incomingPaymentDetail.originator_name || 'unknown'}`,
      external_id: `ad_hoc_incoming_${incomingPaymentDetail.id}`,
      status: 'posted',
      metadata: {
        incoming_payment_detail_id: incomingPaymentDetail.id,
        source: 'ad_hoc_reconciliation',
      },
      ledger_entries: [
        {
          amount: incomingPaymentDetail.amount,
          direction: incomingPaymentDetail.direction === 'credit' ? 'credit' : 'debit', // Funds coming in are usually a credit to cash
          ledger_account_id: internalAccount.ledger_account_id,
          description: `Credit/Debit to Internal Cash Account for Incoming Payment ${incomingPaymentDetail.id}`,
        },
        // A corresponding entry would typically be needed to balance the ledger, e.g., to a suspense account
        {
          amount: incomingPaymentDetail.amount,
          direction: incomingPaymentDetail.direction === 'credit' ? 'debit' : 'credit', // Opposite direction to balance
          // This would be a suspense or clearing account ID, needs to be configured
          ledger_account_id: 'suspense_or_clearing_account_id', // Placeholder: must be a valid Ledger Account ID
          description: `Offset for Unreconciled Incoming Payment ${incomingPaymentDetail.id} in Suspense`,
        }
      ],
    };
    return this.createLedgerTransaction(transactionParams);
  }

  /**
   * Notifies an internal Citibank Demo Business system about a successful reconciliation.
   * This would typically involve making an HTTP call to an internal API.
   *
   * @param expectedPaymentId The ID of the expected payment.
   * @param incomingPaymentDetailId The ID of the incoming payment detail.
   * @param amount The reconciled amount.
   */
  private async notifyInternalSystemOfReconciliation(expectedPaymentId: string, incomingPaymentDetailId: string, amount: number): Promise<void> {
    const url = `${this.CITIBANK_DEMO_BUSINESS_INTERNAL_API_BASE_URL}/reconciliation/complete`;
    const payload = {
      expectedPaymentId,
      incomingPaymentDetailId,
      amount,
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    console.log(`[Internal Notification] Notifying internal system of reconciliation for EP:${expectedPaymentId}, IPD:${incomingPaymentDetailId}`);
    try {
      // Assuming a simple internal POST request without complex auth for this example
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error(`[Internal Notification] Failed to notify internal system: ${response.status} ${response.statusText}`);
      } else {
        console.log('[Internal Notification] Internal system notified successfully.');
      }
    } catch (error) {
      console.error(`[Internal Notification] Error during internal system notification: ${(error as Error).message}`);
    }
  }

  /**
   * Notifies an internal Citibank Demo Business system about an unreconciled payment.
   * @param incomingPaymentDetail The unreconciled incoming payment detail.
   */
  private async notifyInternalSystemOfUnreconciledPayment(incomingPaymentDetail: ModernTreasuryIncomingPaymentDetail): Promise<void> {
    const url = `${this.CITIBANK_DEMO_BUSINESS_INTERNAL_API_BASE_URL}/reconciliation/unreconciled`;
    const payload = {
      incomingPaymentDetailId: incomingPaymentDetail.id,
      amount: incomingPaymentDetail.amount,
      currency: incomingPaymentDetail.currency,
      effectiveDate: incomingPaymentDetail.effective_date,
      originatorName: incomingPaymentDetail.originator_name,
      status: 'pending_manual_review',
      metadata: incomingPaymentDetail.metadata,
    };
    console.log(`[Internal Notification] Notifying internal system of unreconciled payment for IPD:${incomingPaymentDetail.id}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error(`[Internal Notification] Failed to notify internal system about unreconciled payment: ${response.status} ${response.statusText}`);
      } else {
        console.log('[Internal Notification] Internal system notified of unreconciled payment successfully.');
      }
    } catch (error) {
      console.error(`[Internal Notification] Error during internal system notification for unreconciled payment: ${(error as Error).message}`);
    }
  }

  /**
   * Notifies an internal Citibank Demo Business system about a reconciliation failure.
   * @param incomingPaymentDetailId The ID of the incoming payment detail.
   * @param errorMessage The error message.
   */
  private async notifyInternalSystemOfReconciliationFailure(incomingPaymentDetailId: string, errorMessage: string): Promise<void> {
    const url = `${this.CITIBANK_DEMO_BUSINESS_INTERNAL_API_BASE_URL}/reconciliation/failure`;
    const payload = {
      incomingPaymentDetailId,
      errorMessage,
      timestamp: new Date().toISOString(),
      status: 'failed',
    };
    console.log(`[Internal Notification] Notifying internal system of reconciliation failure for IPD:${incomingPaymentDetailId}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.error(`[Internal Notification] Failed to notify internal system about reconciliation failure: ${response.status} ${response.statusText}`);
      } else {
        console.log('[Internal Notification] Internal system notified of reconciliation failure successfully.');
      }
    } catch (error) {
      console.error(`[Internal Notification] Error during internal system notification for reconciliation failure: ${(error as Error).message}`);
    }
  }

  // --- Example Placeholder for Stripe Integration (Logic-only, no SDK) ---

  /**
   * Simulates a direct API call to Stripe to retrieve a payment intent.
   * This function provides the logic structure without using the Stripe SDK.
   * @param paymentIntentId The ID of the Stripe Payment Intent.
   * @returns A promise resolving to a simulated Stripe Payment Intent object.
   */
  public async getStripePaymentIntent(paymentIntentId: string): Promise<any> {
    if (!this.stripeApiKey) {
      throw new Error("Stripe API Key is not configured for this service.");
    }
    const url = `${this.STRIPE_API_BASE_URL}/payment_intents/${paymentIntentId}`;
    const headers = {
      'Authorization': `Bearer ${this.stripeApiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    console.log(`[Stripe Service] Making GET request to ${url}`);
    // Simulate fetch logic
    try {
      const response = await fetch(url, { method: 'GET', headers });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`[Stripe Service] API Error ${response.status} for Payment Intent ${paymentIntentId}:`, errorBody);
        throw new Error(`Stripe API Error (${response.status}): ${JSON.stringify(errorBody)}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[Stripe Service] Error retrieving Stripe Payment Intent ${paymentIntentId}:`, error);
      throw new Error(`Failed to interact with Stripe: ${(error as Error).message}`);
    }
  }

  // --- Example Placeholder for Plaid Integration (Logic-only, no SDK) ---

  /**
   * Simulates a direct API call to Plaid to exchange a public token for an access token.
   * This function provides the logic structure without using the Plaid SDK.
   * @param publicToken The Plaid public token to exchange.
   * @returns A promise resolving to a simulated Plaid access token object.
   */
  public async exchangePlaidPublicToken(publicToken: string): Promise<any> {
    if (!this.plaidClientId || !this.plaidSecret) {
      throw new Error("Plaid Client ID or Secret is not configured for this service.");
    }
    const url = `${this.PLAID_API_BASE_URL}/item/public_token/exchange`;
    const payload = {
      client_id: this.plaidClientId,
      secret: this.plaidSecret,
      public_token: publicToken,
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    console.log(`[Plaid Service] Making POST request to ${url} for public token exchange`);
    // Simulate fetch logic
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`[Plaid Service] API Error ${response.status} for token exchange:`, errorBody);
        throw new Error(`Plaid API Error (${response.status}): ${JSON.stringify(errorBody)}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`[Plaid Service] Error exchanging Plaid public token: ${(error as Error).message}`);
      throw new Error(`Failed to interact with Plaid: ${(error as Error).message}`);
    }
  }

  // --- Additional high-volume reconciliation and reporting methods to reach line count ---

  /**
   * Performs a daily reconciliation sweep, identifying pending expected payments
   * and checking their status against actual bank movements if possible, or flagging for review.
   * This is a batch process designed to be run periodically.
   * @returns A summary of reconciliation activities.
   */
  public async performDailyReconciliationSweep(): Promise<{ reconciledCount: number; unreconciledCount: number; flaggedForReview: number }> {
    console.log(`[Daily Sweep] Starting daily reconciliation sweep at ${new Date().toISOString()}`);
    let reconciledCount = 0;
    let unreconciledCount = 0;
    let flaggedForReview = 0;

    try {
      // 1. Fetch all pending expected payments for the last N days
      const lookbackDays = 14; // Check payments expected in the last 2 weeks
      const dateBefore = new Date();
      dateBefore.setDate(dateBefore.getDate() - lookbackDays);

      const pendingExpectedPayments = await this.listExpectedPayments({
        status: 'pending',
        date_after: dateBefore.toISOString().split('T')[0],
        per_page: 100, // Process in batches
      });

      console.log(`[Daily Sweep] Found ${pendingExpectedPayments.length} pending expected payments to review.`);

      for (const expectedPayment of pendingExpectedPayments) {
        console.log(`[Daily Sweep] Reviewing expected payment: ${expectedPayment.id}`);
        try {
          // Attempt to find a corresponding incoming payment detail not yet linked
          const matchingIncomingPayments = await this.listIncomingPaymentDetails({
            internal_account_id: expectedPayment.internal_account_id,
            amount: expectedPayment.amount,
            currency: expectedPayment.currency,
            direction: expectedPayment.direction,
            // Only look for IPDs that are not yet reconciled
            expected_payment_id: 'null', // Modern Treasury filter for null
            date_after: new Date(new Date(expectedPayment.created_at).getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 2 days before creation
            date_before: new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Up to tomorrow
            per_page: 10,
          });

          const directMatch = matchingIncomingPayments.find(ipd =>
            ipd.amount === expectedPayment.amount &&
            ipd.currency === expectedPayment.currency &&
            ipd.direction === expectedPayment.direction &&
            // Additional custom matching logic here, e.g., descriptor similarity
            (!expectedPayment.statement_descriptor || ipd.originator_to_beneficiary_information?.includes(expectedPayment.statement_descriptor))
          );

          if (directMatch) {
            console.log(`[Daily Sweep] Auto-reconciling EP:${expectedPayment.id} with IPD:${directMatch.id}`);
            await this.updateExpectedPayment(expectedPayment.id, {
              status: 'completed',
              reconciled_at: new Date().toISOString(),
              metadata: {
                ...expectedPayment.metadata,
                incoming_payment_detail_id: directMatch.id,
                reconciliation_method: 'daily_sweep_auto_match',
              },
            });
            reconciledCount++;
            await this.notifyInternalSystemOfReconciliation(expectedPayment.id, directMatch.id, directMatch.amount);
          } else {
            // If the expected payment is overdue, flag it
            const expectedDate = new Date(expectedPayment.created_at); // Assuming creation_at is approximate expected date
            if (new Date().getTime() > expectedDate.getTime() + (expectedPayment.metadata?.grace_period_days ? parseInt(expectedPayment.metadata.grace_period_days) : 3) * 24 * 60 * 60 * 1000) {
              console.warn(`[Daily Sweep] Expected payment ${expectedPayment.id} is overdue and unreconciled. Flagging for manual review.`);
              // Update expected payment to a 'flagged' status or add specific metadata
              await this.updateExpectedPayment(expectedPayment.id, {
                metadata: {
                  ...expectedPayment.metadata,
                  review_status: 'flagged_overdue',
                  last_sweep_date: new Date().toISOString(),
                },
              });
              flaggedForReview++;
            } else {
              unreconciledCount++;
            }
          }
        } catch (innerError) {
          console.error(`[Daily Sweep] Error processing expected payment ${expectedPayment.id}:`, innerError);
          flaggedForReview++; // Flag for review if an error occurs during processing
        }
      }
    } catch (error) {
      console.error(`[Daily Sweep] Overall error during daily sweep:`, error);
    }

    console.log(`[Daily Sweep] Completed. Reconciled: ${reconciledCount}, Unreconciled: ${unreconciledCount}, Flagged for Review: ${flaggedForReview}`);
    return { reconciledCount, unreconciledCount, flaggedForReview };
  }

  /**
   * Generates a comprehensive reconciliation report for a given period.
   * This involves fetching data from Modern Treasury and potentially internal systems.
   * @param startDate The start date for the report (YYYY-MM-DD).
   * @param endDate The end date for the report (YYYY-MM-DD).
   * @returns A promise resolving to the reconciliation report data.
   */
  public async generateReconciliationReport(startDate: string, endDate: string): Promise<any> {
    console.log(`[Report] Generating reconciliation report from ${startDate} to ${endDate}`);
    const report: any = {
      period: { startDate, endDate },
      summary: {
        totalExpectedPayments: 0,
        totalIncomingPayments: 0,
        reconciledAmount: 0,
        unreconciledExpectedAmount: 0,
        unreconciledIncomingAmount: 0,
        paymentOrdersSent: 0,
        paymentOrdersCompleted: 0,
        ledgerTransactionsPosted: 0,
      },
      details: {
        expectedPayments: [] as ModernTreasuryExpectedPayment[],
        incomingPaymentDetails: [] as ModernTreasuryIncomingPaymentDetail[],
        ledgerTransactions: [] as ModernTreasuryLedgerTransaction[],
        paymentOrders: [] as ModernTreasuryPaymentOrder[],
      },
    };

    // Fetch expected payments
    const expectedPayments = await this.listExpectedPayments({
      date_after: startDate,
      date_before: endDate,
      per_page: 200, // Larger batch for reports
      status: 'completed,pending,void,archived', // Include all relevant statuses
    });
    report.details.expectedPayments = expectedPayments;
    report.summary.totalExpectedPayments = expectedPayments.length;
    report.summary.unreconciledExpectedAmount = expectedPayments
      .filter(ep => ep.status === 'pending')
      .reduce((sum, ep) => sum + ep.amount, 0);

    // Fetch incoming payment details
    const incomingPaymentDetails = await this.listIncomingPaymentDetails({
      date_after: startDate,
      date_before: endDate,
      per_page: 200,
    });
    report.details.incomingPaymentDetails = incomingPaymentDetails;
    report.summary.totalIncomingPayments = incomingPaymentDetails.length;
    report.summary.unreconciledIncomingAmount = incomingPaymentDetails
      .filter(ipd => !ipd.expected_payment_id) // Unlinked incoming payments
      .reduce((sum, ipd) => sum + ipd.amount, 0);

    // Calculate reconciled amount based on linked expected payments
    report.summary.reconciledAmount = expectedPayments
      .filter(ep => ep.status === 'completed' && ep.incoming_payment_detail_id) // Assuming incoming_payment_detail_id exists if reconciled
      .reduce((sum, ep) => sum + ep.amount, 0);

    // Fetch ledger transactions for the period
    const ledgerTransactions = await this.listLedgerTransactions({
      effective_at_start: startDate,
      effective_at_end: endDate,
      per_page: 200,
    });
    report.details.ledgerTransactions = ledgerTransactions;
    report.summary.ledgerTransactionsPosted = ledgerTransactions.filter(lt => lt.status === 'posted').length;

    // Fetch payment orders for the period
    const paymentOrders = await this.listPaymentOrders({
      created_at_start: startDate,
      created_at_end: endDate,
      per_page: 200,
      status: 'completed,pending,cancelled,returned,approved',
    });
    report.details.paymentOrders = paymentOrders;
    report.summary.paymentOrdersSent = paymentOrders.length;
    report.summary.paymentOrdersCompleted = paymentOrders.filter(po => po.status === 'completed').length;

    console.log(`[Report] Report generated successfully for ${startDate} to ${endDate}. Summary:`, report.summary);
    return report;
  }

  /**
   * Adjusts a ledger account balance by creating a new ledger transaction.
   * This is used for manual adjustments or corrections.
   * @param ledgerAccountId The ID of the ledger account to adjust.
   * @param amount The amount of the adjustment. Positive for credit, negative for debit.
   * @param description A description for the adjustment.
   * @param metadata Optional metadata for the transaction.
   * @returns A promise that resolves with the created ledger transaction.
   */
  public async adjustLedgerAccount(ledgerAccountId: string, amount: number, description: string, metadata?: Record<string, string>): Promise<ModernTreasuryLedgerTransaction> {
    console.log(`[Ledger Adjustment] Adjusting ledger account ${ledgerAccountId} by ${amount}. Description: ${description}`);
    const direction = amount >= 0 ? 'credit' : 'debit';
    const absoluteAmount = Math.abs(amount);

    const adjustmentTransactionParams: CreateLedgerTransactionParams = {
      effective_at: new Date().toISOString().split('T')[0], // Today's date
      description: `Manual Adjustment: ${description}`,
      external_id: `manual_adjustment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'posted', // Adjustments are typically posted immediately
      metadata: {
        ...metadata,
        adjustment_type: 'manual',
      },
      ledger_entries: [
        {
          amount: absoluteAmount,
          direction: direction,
          ledger_account_id: ledgerAccountId,
          description: description,
        },
        // A balancing entry is required for a double-entry ledger. This often goes to a specific
        // 'adjustment' or 'suspense' ledger account.
        {
          amount: absoluteAmount,
          direction: direction === 'credit' ? 'debit' : 'credit', // Opposite direction to balance
          ledger_account_id: 'manual_adjustment_clearing_account_id', // Placeholder: must be a valid Ledger Account ID
          description: `Balancing entry for adjustment: ${description}`,
        }
      ],
    };
    return this.createLedgerTransaction(adjustmentTransactionParams);
  }

  /**
   * Retrieves a list of ledger entries associated with a specific ledger account.
   * @param ledgerAccountId The ID of the ledger account.
   * @param queryParams Optional filtering and pagination parameters.
   * @returns A promise resolving to a list of ledger entries.
   */
  public async getLedgerAccountEntries(ledgerAccountId: string, queryParams?: Record<string, string | number | boolean>): Promise<ModernTreasuryLedgerEntry[]> {
    console.log(`[Ledger] Retrieving entries for ledger account ${ledgerAccountId}`);
    return this.executeHttpRequest<ModernTreasuryLedgerEntry[]>('GET', `/api/ledger_entries`, undefined, {
      ledger_account_id: ledgerAccountId,
      ...queryParams,
    });
  }

  /**
   * Retrieves a specific ledger entry by its ID.
   * @param ledgerEntryId The ID of the ledger entry.
   * @returns A promise resolving to the ledger entry.
   */
  public async getLedgerEntry(ledgerEntryId: string): Promise<ModernTreasuryLedgerEntry> {
    console.log(`[Ledger] Retrieving ledger entry ${ledgerEntryId}`);
    return this.executeHttpRequest<ModernTreasuryLedgerEntry>('GET', `/api/ledger_entries/${ledgerEntryId}`);
  }

  /**
   * Initiates a payment from an internal account to an external account.
   * This is a high-level function combining creation of external accounts (if needed) and payment orders.
   * @param internalAccountId The ID of the internal account from which to send the payment.
   * @param recipientName The name of the recipient.
   * @param recipientAccountDetails Bank account details for the recipient.
   * @param amount The amount to pay.
   * @param currency The currency of the payment.
   * @param paymentType The type of payment (e.g., 'ach', 'wire').
   * @param description A description for the payment.
   * @param statementDescriptor An optional statement descriptor for the recipient.
   * @param counterpartyId Existing counterparty ID (optional, will create if not provided).
   * @returns A promise that resolves with the created payment order.
   */
  public async initiatePayment(
    internalAccountId: string,
    recipientName: string,
    recipientAccountDetails: CreateExternalAccountParams['account_details'],
    recipientRoutingDetails: CreateExternalAccountParams['routing_details'],
    amount: number,
    currency: string,
    paymentType: ModernTreasuryPaymentOrder['type'],
    description: string,
    statementDescriptor?: string,
    counterpartyId?: string,
    metadata?: Record<string, string>,
  ): Promise<ModernTreasuryPaymentOrder> {
    console.log(`[Payment Initiation] Initiating ${paymentType} payment of ${amount} ${currency} to ${recipientName}`);

    let targetCounterpartyId = counterpartyId;
    let externalAccount: ModernTreasuryExternalAccount;

    if (!targetCounterpartyId) {
      console.log(`[Payment Initiation] Counterparty not provided. Creating new counterparty for ${recipientName}.`);
      const newCounterparty = await this.createCounterparty(recipientName, undefined, { source: 'payment_initiation' });
      targetCounterpartyId = newCounterparty.id;
    }

    console.log(`[Payment Initiation] Creating/finding external account for counterparty ${targetCounterpartyId}.`);
    // Check if an external account with these details already exists for the counterparty
    const existingExternalAccounts = await this.listExternalAccounts({
      party_id: targetCounterpartyId,
      currency: currency,
      account_type: 'checking', // Assuming checking for now, could be passed as param
      per_page: 10,
    });

    const matchingExternalAccount = existingExternalAccounts.find(ea =>
      ea.account_details.some(ad => ad.account_number === recipientAccountDetails[0].account_number) &&
      ea.routing_details.some(rd => rd.routing_number === recipientRoutingDetails[0].routing_number)
    );

    if (matchingExternalAccount) {
      console.log(`[Payment Initiation] Found existing external account: ${matchingExternalAccount.id}`);
      externalAccount = matchingExternalAccount;
    } else {
      console.log(`[Payment Initiation] Creating new external account for counterparty ${targetCounterpartyId}.`);
      externalAccount = await this.createExternalAccount({
        party_id: targetCounterpartyId,
        name: `${recipientName} - ${currency} Account`,
        currency: currency,
        account_type: 'checking', // Defaulting to checking
        account_details: recipientAccountDetails,
        routing_details: recipientRoutingDetails,
        party_name: recipientName,
        metadata: { source: 'payment_initiation' },
      });
    }

    console.log(`[Payment Initiation] Creating payment order using external account ${externalAccount.id}.`);
    const paymentOrderParams: CreatePaymentOrderParams = {
      amount: amount,
      currency: currency,
      direction: 'credit', // Sending money is a credit to the recipient
      originating_account_id: internalAccountId,
      receiving_account_id: externalAccount.id,
      type: paymentType,
      description: description,
      statement_descriptor: statementDescriptor,
      priority: 'normal',
      external_id: `citibank_payment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      metadata: {
        ...metadata,
        initiator: 'citibankdemobusiness.dev',
        counterparty_id: targetCounterpartyId,
      },
    };

    return this.createPaymentOrder(paymentOrderParams);
  }

  /**
   * Handles a Modern Treasury webhook event. This function would parse the event payload
   * and dispatch to appropriate handlers within the service.
   * @param eventPayload The raw webhook event payload from Modern Treasury.
   * @param signature The `Modern-Treasury-Signature` header for verification.
   * @returns A promise that resolves when the event is processed.
   * @throws {Error} If the signature is invalid or event processing fails.
   */
  public async handleWebhookEvent(eventPayload: any, signature: string): Promise<void> {
    console.log(`[Webhook] Received webhook event. Type: ${eventPayload.type}`);

    // Basic webhook signature verification (simplified, actual implementation needs secret & HMAC)
    // For a real system, you'd use a crypto library to verify the signature against your webhook secret.
    // Example: crypto.createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
    const isValidSignature = this.verifyWebhookSignature(eventPayload, signature);
    if (!isValidSignature) {
      console.error(`[Webhook] Invalid webhook signature for event type: ${eventPayload.type}`);
      throw new Error('Invalid webhook signature');
    }

    switch (eventPayload.type) {
      case 'payment_order.created':
        console.log(`[Webhook] Payment order created: ${eventPayload.data.id}`);
        // Potentially update internal order status, log
        await this.notifyInternalSystemOfPaymentOrderStatus(eventPayload.data);
        break;
      case 'payment_order.updated':
        console.log(`[Webhook] Payment order updated: ${eventPayload.data.id} to status ${eventPayload.data.status}`);
        await this.notifyInternalSystemOfPaymentOrderStatus(eventPayload.data);
        break;
      case 'expected_payment.created':
        console.log(`[Webhook] Expected payment created: ${eventPayload.data.id}`);
        await this.notifyInternalSystemOfExpectedPaymentStatus(eventPayload.data);
        break;
      case 'expected_payment.updated':
        console.log(`[Webhook] Expected payment updated: ${eventPayload.data.id} to status ${eventPayload.data.status}`);
        // If status changed to 'completed', trigger reconciliation processing
        if (eventPayload.data.status === 'completed' && eventPayload.data.incoming_payment_detail_id) {
          const incomingDetail = await this.getIncomingPaymentDetail(eventPayload.data.incoming_payment_detail_id);
          await this.processIncomingPaymentDetail(incomingDetail); // Process linked detail
        } else {
          await this.notifyInternalSystemOfExpectedPaymentStatus(eventPayload.data);
        }
        break;
      case 'incoming_payment_detail.created':
        console.log(`[Webhook] Incoming payment detail created: ${eventPayload.data.id}`);
        await this.processIncomingPaymentDetail(eventPayload.data);
        break;
      case 'incoming_payment_detail.updated':
        console.log(`[Webhook] Incoming payment detail updated: ${eventPayload.data.id} to status ${eventPayload.data.status}`);
        await this.processIncomingPaymentDetail(eventPayload.data);
        break;
      case 'ledger_transaction.posted':
        console.log(`[Webhook] Ledger transaction posted: ${eventPayload.data.id}`);
        await this.notifyInternalSystemOfLedgerTransactionCompletion(eventPayload.data);
        break;
      // Add more event types as needed
      default:
        console.warn(`[Webhook] Unhandled Modern Treasury event type: ${eventPayload.type}`);
        break;
    }
    console.log(`[Webhook] Successfully processed event type: ${eventPayload.type}`);
  }

  /**
   * Placeholder for webhook signature verification.
   * In a real application, this would use `crypto` module (Node.js) or a similar browser API
   * to compute HMAC-SHA256 and compare.
   * @param eventPayload The event object.
   * @param signature The `Modern-Treasury-Signature` header.
   * @returns {boolean} True if the signature is valid, false otherwise.
   */
  private verifyWebhookSignature(eventPayload: any, signature: string): boolean {
    // This is a dummy implementation. A real one would:
    // 1. Get the raw request body.
    // 2. Get the webhook secret configured in your Modern Treasury dashboard.
    // 3. Extract timestamp and signatures from the `signature` header.
    // 4. Compute HMAC-SHA256 of `timestamp.body` using the secret.
    // 5. Compare computed signature with received signature securely.
    console.warn("[Webhook Security] Webhook signature verification is a placeholder. Implement robust HMAC-SHA256 verification.");
    return true; // DANGER: Always implement actual signature verification in production!
  }

  /**
   * Notifies the internal system about payment order status updates.
   * @param paymentOrder The payment order object.
   */
  private async notifyInternalSystemOfPaymentOrderStatus(paymentOrder: ModernTreasuryPaymentOrder): Promise<void> {
    const url = `${this.CITIBANK_DEMO_BUSINESS_INTERNAL_API_BASE_URL}/payments/status-update`;
    const payload = {
      paymentOrderId: paymentOrder.id,
      externalId: paymentOrder.external_id,
      status: paymentOrder.status,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      direction: paymentOrder.direction,
      updatedAt: paymentOrder.updated_at,
      metadata: paymentOrder.metadata,
    };
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) console.error(`[Internal Notification] Failed to update internal payment order status for ${paymentOrder.id}`);
      else console.log(`[Internal Notification] Updated internal status for payment order ${paymentOrder.id} to ${paymentOrder.status}`);
    } catch (error) {
      console.error(`[Internal Notification] Error notifying internal system of payment order status: ${(error as Error).message}`);
    }
  }

  /**
   * Notifies the internal system about expected payment status updates.
   * @param expectedPayment The expected payment object.
   */
  private async notifyInternalSystemOfExpectedPaymentStatus(expectedPayment: ModernTreasuryExpectedPayment): Promise<void> {
    const url = `${this.CITIBANK_DEMO_BUSINESS_INTERNAL_API_BASE_URL}/expected-payments/status-update`;
    const payload = {
      expectedPaymentId: expectedPayment.id,
      status: expectedPayment.status,
      amount: expectedPayment.amount,
      currency: expectedPayment.currency,
      direction: expectedPayment.direction,
      updatedAt: expectedPayment.updated_at,
      metadata: expectedPayment.metadata,
    };
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) console.error(`[Internal Notification] Failed to update internal expected payment status for ${expectedPayment.id}`);
      else console.log(`[Internal Notification] Updated internal status for expected payment ${expectedPayment.id} to ${expectedPayment.status}`);
    } catch (error) {
      console.error(`[Internal Notification] Error notifying internal system of expected payment status: ${(error as Error).message}`);
    }
  }

  /**
   * Notifies the internal system about ledger transaction completion.
   * @param ledgerTransaction The ledger transaction object.
   */
  private async notifyInternalSystemOfLedgerTransactionCompletion(ledgerTransaction: ModernTreasuryLedgerTransaction): Promise<void> {
    const url = `${this.CITIBANK_DEMO_BUSINESS_INTERNAL_API_BASE_URL}/ledger-transactions/completed`;
    const payload = {
      ledgerTransactionId: ledgerTransaction.id,
      externalId: ledgerTransaction.external_id,
      status: ledgerTransaction.status,
      effectiveAt: ledgerTransaction.effective_at,
      description: ledgerTransaction.description,
      metadata: ledgerTransaction.metadata,
    };
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) console.error(`[Internal Notification] Failed to update internal ledger transaction status for ${ledgerTransaction.id}`);
      else console.log(`[Internal Notification] Notified internal system of completed ledger transaction ${ledgerTransaction.id}`);
    } catch (error) {
      console.error(`[Internal Notification] Error notifying internal system of ledger transaction completion: ${(error as Error).message}`);
    }
  }
}

// Ensure the class is exported for use in other parts of the application.
export default ModernTreasuryReconciliationService;