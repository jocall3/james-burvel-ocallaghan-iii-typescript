// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// This file implements a comprehensive React-like hook for managing a multi-stage payment transaction flow.
// It integrates (simulated) Stripe for payment processing, Plaid for bank account linking,
// Modern Treasury for treasury operations (via Citibank Demo Business backend), and Citibank Demo Business
// as the orchestrating backend service.
//
// Adhering to the architectural blueprint, this file strictly avoids explicit `import` statements
// for external libraries, including `react` hooks (`useState`, `useEffect`). Instead, it
// leverages global browser APIs (`window.location`, `window.history`, `CustomEvent`) and
// re-implements utility functions for URL query parameter management, mimicking the provided
// `useQueryParams` seed file. This ensures self-containment and no direct file-level dependencies.
//
// The payment flow state is persisted primarily in URL query parameters, allowing for robust
// recovery across page refreshes or navigation. Interaction with external services (Stripe, Plaid,
// Modern Treasury) is simulated through an internal `_simulateFetch` function, representing
// calls to the `citibankdemobusiness.dev` backend which would, in a real-world scenario,
// securely handle the actual API integrations.
//
// The hook provides functions to initiate, resume, and cancel a payment flow, along with
// callbacks for Plaid Link events. The consumer of this hook is expected to interact with
// the returned `currentStatus` and `error` states, and to manually invoke `resumePaymentFlow`
// when component mounts or relevant props/URL parameters change, to re-evaluate the flow's state.
// State changes are also broadcast via custom DOM events (`citibankdemobusiness.payment.statusChanged`)
// for more reactive updates without direct React `useState` usage within the hook itself.

// --- Global Constants and Configuration ---
const CITIBANK_DEMO_BUSINESS_BASE_URL = "https://citibankdemobusiness.dev/api";
const STRIPE_API_BASE_URL = "https://api.stripe.com/v1"; // Simulated: Represents Stripe's direct API endpoint
const PLAID_API_BASE_URL = "https://sandbox.plaid.com"; // Simulated: Represents Plaid's direct API endpoint
const MODERN_TREASURY_API_BASE_URL = "https://api.moderntreasury.com"; // Simulated: Represents Modern Treasury's direct API endpoint

// Query parameter names for storing different aspects of the payment flow state.
// These are intentionally kept generic to allow for potential future expansion
// or distinct sub-flow management, but primarily `PAYMENT_FLOW_PARAM_NAME` is used.
const PAYMENT_FLOW_PARAM_NAME = "paymentFlow";
const PLAID_FLOW_PARAM_NAME = "plaidFlow";
const STRIPE_FLOW_PARAM_NAME = "stripeFlow";
const MT_FLOW_PARAM_NAME = "modernTreasuryFlow";

// --- Utility Functions for Query Parameters (Mimicking useQueryParams Seed File) ---
// These functions are re-implemented directly within this file to satisfy the "no imports"
// and "no dependencies" constraints while providing the exact query parameter functionality
// demonstrated in the `useQueryParams.tsx` seed file. This avoids explicit `import` statements
// and treats the logic as self-contained.

type _GetFiltersFnType = (paramName: string) => Record<string, unknown>;
type _SetFiltersFnType = (
  paramName: string,
  filters: Record<string, unknown>,
  updateRoute?: boolean,
) => URLSearchParams;

/**
 * Retrieves filters for a specific parameter from the URL query string.
 * This function is a direct re-implementation of the `getFilters` logic from `useQueryParams.tsx`.
 * @param paramName The base name for the parameter (e.g., "paymentFlow" becomes "paymentFlowFilters").
 * @returns An object containing the parsed filters, or an empty object if not found.
 */
const _getQueryParamsFilters: _GetFiltersFnType = (paramName: string) => {
  const formattedParamName = `${paramName}Filters`;
  const allSearchParams = new URLSearchParams(window.location.search);
  const filtersForParam = allSearchParams.get(formattedParamName);
  const formattedFilters: Record<string, unknown> = filtersForParam
    ? (JSON.parse(decodeURIComponent(filtersForParam)) as Record<
        string,
        unknown
      >)
    : {};
  return formattedFilters;
};

/**
 * Sets filters for a specific parameter in the URL query string.
 * This function is a direct re-implementation of the `setFilters` logic from `useQueryParams.tsx`.
 * It updates `window.history` by default to reflect the changes in the URL.
 * @param paramName The base name for the parameter (e.g., "paymentFlow" becomes "paymentFlowFilters").
 * @param filters An object containing the filters to be set.
 * @param updateRoute If true, `window.history.replaceState` is called to update the URL. Defaults to true.
 * @returns The updated URLSearchParams object.
 */
const _setQueryParamsFilters: _SetFiltersFnType = (
  paramName: string,
  filters: Record<string, unknown>,
  updateRoute = true,
) => {
  const formattedParamName = `${paramName}Filters`;
  const formattedValue = encodeURIComponent(JSON.stringify(filters));

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(formattedParamName, formattedValue);

  const newURL = `?${searchParams.toString()}`;

  if (updateRoute) {
    window.history.replaceState(null, "", newURL);
  }

  return searchParams;
};

// --- Core Data Models and Types ---

/**
 * Defines the various possible states of the payment transaction flow.
 * These states guide the UI and dictate the next steps in the process.
 */
type PaymentFlowStatus =
  | "IDLE" // Initial state, no active payment flow
  | "INITIATING" // Starting the payment process, e.g., requesting Plaid Link token
  | "PLAID_LINK_REQUIRED" // Plaid Link token obtained, UI needs to open Plaid Link
  | "PLAID_LINK_IN_PROGRESS" // Plaid Link UI is open and user is interacting
  | "PLAID_LINK_SUCCESS" // Plaid Link successfully completed, public token acquired
  | "PLAID_LINK_FAILURE" // Plaid Link failed or user cancelled/error occurred
  | "EXCHANGING_PLAID_TOKEN" // Exchanging Plaid public token for access token and Stripe bank account token
  | "STRIPE_PAYMENT_METHOD_CREATION_IN_PROGRESS" // Creating Stripe Payment Method with bank account details
  | "STRIPE_PAYMENT_METHOD_CREATED" // Stripe Payment Method successfully created
  | "STRIPE_PAYMENT_METHOD_CREATION_FAILURE" // Failed to create Stripe Payment Method
  | "CITIBANK_TRANSACTION_INITIATION_IN_PROGRESS" // Initiating transaction with Citibank Demo Business backend
  | "CITIBANK_TRANSACTION_INITIATED" // Citibank Demo Business transaction initiated successfully, awaiting processing
  | "CITIBANK_TRANSACTION_INITIATION_FAILURE" // Failed to initiate Citibank Demo Business transaction
  | "MODERN_TREASURY_SYNC_PENDING" // Backend processing: Waiting for Modern Treasury synchronization (internal to backend)
  | "PAYMENT_PROCESSING" // Payment is actively being processed by financial institutions
  | "PAYMENT_SUCCESS" // Payment completed successfully
  | "PAYMENT_FAILED" // Payment failed for any reason
  | "PAYMENT_CANCELLED" // Payment explicitly cancelled by user or system
  | "AWAITING_USER_ACTION" // Specific user action required (e.g., re-authentication, verification)
  | "UNKNOWN_ERROR"; // Catch-all for unhandled or unexpected errors

/**
 * Defines the structure of data stored in URL query parameters for the main payment flow.
 * This object is JSON-encoded and stored under the `paymentFlowFilters` query parameter.
 */
interface PaymentFlowQueryParams {
  flowId?: string; // Unique identifier for the current payment flow instance
  status?: PaymentFlowStatus; // Current status of the payment flow, crucial for resume logic
  amount?: number; // Transaction amount in minor units (e.g., cents)
  currency?: string; // Transaction currency (e.g., 'USD', 'CAD')
  description?: string; // Description for the payment transaction
  accountId?: string; // Internal account ID for Citibank Demo Business, if applicable
  userId?: string; // Identifier for the user initiating the payment
  error?: string; // Stores a user-friendly error message if an issue occurs
  errorCode?: string; // Machine-readable error code for programmatic handling
  retries?: number; // Number of retries for transient operations (e.g., polling)
  lastAttemptTimestamp?: number; // Unix timestamp of the last attempt for an operation
  // Plaid related parameters, essential for continuing Plaid-specific steps
  plaidPublicToken?: string; // Temporary token from Plaid Link for exchange
  plaidAccessToken?: string; // Permanent token for accessing Plaid data
  plaidItemId?: string; // Plaid item ID representing the linked institution
  plaidInstitutionId?: string; // ID of the financial institution
  plaidLinkToken?: string; // Token used to initialize Plaid Link UI
  // Stripe related parameters, for payment method and transaction tracking
  stripePaymentMethodId?: string; // ID of the Stripe Payment Method created
  stripeBankAccountId?: string; // Stripe Bank Account ID, derived from Plaid data
  stripeCustomerId?: string; // If a Stripe Customer object is used/created
  stripeEphemeralKey?: string; // For client-side Stripe SDK initialization (if not handled by backend)
  // Modern Treasury related parameters, managed by Citibank Demo Business backend
  modernTreasuryTransactionId?: string; // Modern Treasury's internal transaction ID
  modernTreasuryPaymentOrderId?: string; // Modern Treasury's Payment Order ID
  // Citibank Demo Business specific transaction IDs
  citibankTransactionId?: string; // Our internal transaction ID for this payment
}

/**
 * Represents the request payload for creating a Plaid Link token.
 * This would typically be sent to our backend, which then calls Plaid's API.
 */
interface PlaidLinkTokenRequest {
  client_id: string; // Plaid client ID
  secret: string; // Plaid secret
  client_name: string; // Name of your application
  user: {
    client_user_id: string; // Unique identifier for the user
    legal_name?: string;
    email_address?: string;
  };
  products: ("auth" | "transactions" | "identity" | "investments" | "liabilities" | "payment_initiation")[]; // Plaid products to enable
  country_codes: string[]; // List of ISO 3166-1 alpha-2 country codes
  language: string; // The language to use for Plaid Link
  webhook?: string; // Optional URL for webhook events
  link_customization_name?: string; // Customization name for Plaid Link
  account_filters?: {
    depository?: {
      account_subtypes?: ("checking" | "savings")[];
    };
  };
  redirect_uri?: string; // Redirect URI for mobile/browser-based flows
  android_package_name?: string; // Android package name for Android app flows
  access_token?: string; // Required for update mode
}

/**
 * Represents the response payload from creating a Plaid Link token.
 */
interface PlaidLinkTokenResponse {
  link_token: string; // The token to initialize Plaid Link UI
  expiration: string; // Expiration date of the link token
  request_id: string; // Plaid's request ID for debugging
}

/**
 * Represents the request payload for exchanging a Plaid public token for an access token.
 * This is a critical step after a user successfully links an account in Plaid Link.
 */
interface PlaidExchangePublicTokenRequest {
  client_id: string;
  secret: string;
  public_token: string; // The public token obtained from Plaid Link
}

/**
 * Represents the response payload from exchanging a Plaid public token.
 */
interface PlaidExchangePublicTokenResponse {
  access_token: string; // Permanent token to access Plaid data
  item_id: string; // Unique ID for the Plaid Item
  request_id: string;
}

/**
 * Represents the request payload for fetching bank account details using Plaid's Auth product.
 */
interface PlaidGetAuthRequest {
  client_id: string;
  secret: string;
  access_token: string; // The access token for the Plaid Item
  options?: {
    account_ids?: string[]; // Optional list of account IDs to retrieve
  };
}

/**
 * Represents the response payload from Plaid's Auth product, containing bank account details.
 */
interface PlaidAuthResponse {
  accounts: Array<{
    account_id: string;
    balances: {
      available: number | null;
      current: number | null;
      iso_currency_code: string | null;
      unofficial_currency_code: string | null;
    };
    mask: string | null; // Last 4 digits of the account number
    name: string; // Account name
    official_name: string | null;
    subtype: string | null; // e.g., "checking", "savings"
    type: string; // e.g., "depository"
  }>;
  numbers: {
    ach: Array<{
      account_id: string; // Plaid account ID
      account: string; // Full account number
      routing: string; // ACH routing number
      wire_routing: string; // Wire routing number
      limit: string; // ACH limit, typically for payment initiation
    }>;
    eft: unknown[]; // Placeholder for other types (e.g., Canadian EFT)
    international: unknown[]; // Placeholder for international accounts
    bacs: unknown[]; // Placeholder for UK BACS
  };
  item: {
    item_id: string;
    institution_id: string;
    webhook: string;
    error: unknown | null;
    consented_transactions: string | null;
    update_type: string;
  };
  request_id: string;
}

/**
 * Represents the request payload for creating a Stripe bank account token.
 * In a real scenario, this is often done client-side with Stripe.js, or server-side via Plaid processor tokens.
 * Here, it's simulated as a backend call.
 */
interface StripeCreateBankAccountTokenRequest {
  client_id: string; // Simulated: Usually handled by Stripe.js public key
  secret: string; // Simulated: Usually handled by Stripe.js
  public_token: string; // Plaid public token (if using Plaid processor token)
  account_id: string; // Specific bank account ID from Plaid
  routing_number: string;
  account_number: string;
  account_holder_name: string;
  account_holder_type: "company" | "individual";
  currency: string;
}

/**
 * Represents the response payload from creating a Stripe bank account token.
 */
interface StripeBankAccountTokenResponse {
  id: string; // The Stripe token ID
  object: "token";
  bank_account: {
    id: string; // The Stripe Bank Account object ID
    object: "bank_account";
    account_holder_name: string;
    account_holder_type: "company" | "individual";
    bank_name: string;
    country: string;
    currency: string;
    fingerprint: string;
    last4: string;
    routing_number: string;
    status: string; // e.g., 'new', 'validated', 'verification_required'
  };
  client_ip: string;
  created: number;
  livemode: boolean;
  type: "bank_account";
  used: boolean;
}

/**
 * Represents the request payload for creating a Stripe Payment Method.
 * This aggregates payment details (like a bank account token) into a reusable payment method.
 */
interface StripeCreatePaymentMethodRequest {
  type: "us_bank_account"; // For ACH payments
  us_bank_account: {
    bank_account_token: string; // The token obtained from Stripe.js or a direct tokenization API
  };
  billing_details?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
  };
  metadata?: Record<string, string>;
}

/**
 * Represents the response payload from creating a Stripe Payment Method.
 */
interface StripePaymentMethodResponse {
  id: string; // The Stripe Payment Method ID
  object: "payment_method";
  billing_details: {
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string | null;
    name: string | null;
    phone: string | null;
  };
  created: number;
  customer: string | null; // Associated Stripe Customer ID, if any
  livemode: boolean;
  metadata: Record<string, string>;
  type: "us_bank_account";
  us_bank_account: {
    account_holder_type: "company" | "individual" | null;
    account_type: "checking" | "savings" | null;
    bank_name: string | null;
    fingerprint: string;
    last4: string;
    routing_number: string;
    status: "new" | "validated" | "verification_required" | "verification_failed" | "errored";
  };
}

/**
 * Represents the request payload for initiating a transaction with the Citibank Demo Business backend.
 * This endpoint would orchestrate the actual payment creation, potentially involving Stripe Payment Intents
 * and Modern Treasury Payment Orders.
 */
interface CitibankTransactionInitiationRequest {
  flowId: string; // Our unique flow ID
  userId: string; // User making the payment
  amount: number;
  currency: string;
  description: string;
  paymentMethodId: string; // Stripe Payment Method ID
  plaidAccessToken?: string; // Plaid access token for backend reference/audit
  stripeBankAccountId?: string; // Stripe Bank Account ID for backend reference/audit
}

/**
 * Represents the response payload from initiating a Citibank Demo Business transaction.
 */
interface CitibankTransactionInitiationResponse {
  transactionId: string; // Our internal transaction ID
  status: "pending" | "processing" | "completed" | "failed"; // Initial status from our backend
  modernTreasuryPaymentOrderId?: string; // Optional Modern Treasury Payment Order ID
  externalTransactionReference?: string; // e.g., Stripe Payment Intent ID
  createdAt: number;
  flowId: string; // The flow ID used for the transaction
}

/**
 * Represents the request payload for checking the status of a Citibank Demo Business transaction.
 */
interface CitibankTransactionStatusRequest {
  flowId: string;
  transactionId: string;
}

/**
 * Represents the response payload from checking a Citibank Demo Business transaction status.
 */
interface CitibankTransactionStatusResponse {
  transactionId: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "requires_action";
  details: string; // Human-readable status details
  currentStep: string; // Current operational step (e.g., "ACH processing", "Bank settlement")
  modernTreasuryPaymentOrderId?: string;
  externalTransactionReference?: string;
  updatedAt: number;
  flowId: string;
}

/**
 * Configuration options provided by the consumer when initiating or resuming the payment flow.
 * These options allow customization of callbacks, Plaid Link behavior, and polling logic.
 */
interface PaymentFlowConfig {
  userId: string; // The identifier of the user performing the payment
  amount: number; // The amount of the transaction
  currency: string; // The currency of the transaction (e.g., 'USD')
  description: string; // A brief description of the transaction
  onSuccess: (transactionId: string, flowId: string) => void; // Callback for successful payment
  onFailure: (error: string, errorCode?: string, flowId?: string) => void; // Callback for payment failure
  onPlaidEvent?: (event: string, metadata: Record<string, unknown>) => void; // Optional callback for Plaid Link events
  /**
   * Optional callback to provide custom Plaid Link configuration properties.
   * If not provided, a default configuration is used. This allows for dynamic Plaid Link settings.
   */
  getPlaidLinkConfig?: (
    user: { client_user_id: string; legal_name?: string; email_address?: string },
    linkToken?: string
  ) => Omit<PlaidLinkTokenRequest, "client_id" | "secret" | "client_name" | "country_codes" | "language" | "products">;
  /**
   * Optional callback to customize Stripe Payment Method billing details or other properties.
   */
  getStripePaymentMethodDetails?: (
    userId: string
  ) => Omit<StripeCreatePaymentMethodRequest, "type" | "us_bank_account">;
  /**
   * Polling interval in milliseconds for transaction status checks.
   * Defaults to 5000ms (5 seconds) if not specified.
   */
  pollingIntervalMs?: number;
  /**
   * Maximum number of status polling attempts before the flow times out or is marked as failed.
   * Defaults to 60 attempts (5 minutes with default interval) if not specified.
   */
  maxPollingAttempts?: number;
  /**
   * Base URL for Plaid Link redirect flows, especially important for mobile/app integration.
   */
  plaidRedirectUri?: string;
}

/**
 * Defines the public interface of the `useStripePlaidPaymentFlow` hook,
 * indicating what values and functions are returned to the consuming component.
 */
interface UseStripePlaidPaymentFlowReturn {
  currentStatus: PaymentFlowStatus; // The current state of the payment flow
  flowId?: string; // The unique identifier for the active payment flow
  error?: string; // The current error message, if any
  errorCode?: string; // The machine-readable error code, if any
  /**
   * Initiates a new payment flow. This should be called when the user
   * begins a new payment process (e.g., clicks a "Pay Now" button).
   * It resets any existing flow state and starts from the beginning.
   * Note: The full `PaymentFlowConfig` is typically provided to `resumePaymentFlow`
   * or a separate `initiateAndResumeFlow` if `onSuccess`/`onFailure` are needed immediately.
   */
  initiatePaymentFlow: (config: Omit<PaymentFlowConfig, "onSuccess" | "onFailure" | "onPlaidEvent" | "getPlaidLinkConfig" | "getStripePaymentMethodDetails" | "pollingIntervalMs" | "maxPollingAttempts" | "plaidRedirectUri">) => void;
  /**
   * Resumes a payment flow based on the current URL query parameters and provided configuration.
   * This function should be called on component mount or whenever the URL query parameters
   * might change (e.g., after a redirect from Plaid Link). It determines the current state
   * and continues the flow from that point.
   */
  resumePaymentFlow: (config: PaymentFlowConfig) => void;
  /**
   * Cancels the current payment flow, clearing its state from URL query parameters.
   */
  cancelPaymentFlow: () => void;
  /**
   * The Plaid Link token generated for the current session. This token is used
   * by the consuming component to initialize and open the Plaid Link UI.
   * It becomes available once the flow reaches `PLAID_LINK_REQUIRED` status.
   */
  plaidLinkToken?: string;
  /**
   * A function to be called by the consuming component when Plaid Link successfully connects
   * an account and provides a public token. This advances the payment flow.
   * @param publicToken The public token from Plaid Link.
   * @param metadata Plaid Link success metadata.
   */
  handlePlaidLinkSuccess: (publicToken: string, metadata: Record<string, unknown>) => void;
  /**
   * A function to be called by the consuming component when Plaid Link encounters an error.
   * This updates the payment flow state to reflect the Plaid Link failure.
   * @param error The error object from Plaid Link.
   * @param metadata Plaid Link error metadata.
   */
  handlePlaidLinkError: (error: unknown, metadata: Record<string, unknown>) => void;
  /**
   * A function to be called by the consuming component when Plaid Link is exited
   * (e.g., user closes the UI). It can optionally receive an error if the exit was due to an error.
   * @param error An optional error object if the exit was due to a problem.
   * @param metadata Plaid Link exit metadata.
   */
  handlePlaidLinkExit: (error: unknown, metadata: Record<string, unknown>) => void;
}

// --- Internal Helper Functions (Simulated API Calls) ---

/**
 * A highly detailed simulated network request function.
 * This function mimics `fetch` behavior but provides predefined responses
 * based on the URL paths, allowing for testing of the payment flow logic
 * without actual API calls or network dependencies.
 * In a real application, this would be replaced by actual `fetch` or a robust HTTP client.
 *
 * @param url The URL endpoint to simulate.
 * @param options Request options including method, headers, and body.
 * @returns A promise that resolves to a simulated JSON response of type T.
 */
async function _simulateFetch<T>(
  url: string,
  options?: { method?: string; headers?: Record<string, string>; body?: string }
): Promise<T> {
  return new Promise((resolve, reject) => {
    // console.log(`[SIMULATED API CALL] ${options?.method || 'GET'} ${url}`, options?.body ? JSON.parse(options.body) : {});
    // Simulate network latency
    setTimeout(() => {
      try {
        // --- Plaid Link Token Creation (Citibank Demo Business Backend) ---
        if (url.includes(`${CITIBANK_DEMO_BUSINESS_BASE_URL}/plaid/link/token/create`)) {
          const reqBody = options?.body ? JSON.parse(options.body) as PlaidLinkTokenRequest : {};
          if (!reqBody.client_id || !reqBody.secret || !reqBody.user?.client_user_id) {
            throw new Error("Plaid Link Token request missing required fields.");
          }
          resolve({
            link_token: `link-sandbox-${Math.random().toString(36).substring(2, 15)}`,
            expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
            request_id: `req-${Math.random().toString(36).substring(2, 15)}`,
          } as T);
        }
        // --- Plaid Public Token Exchange (Citibank Demo Business Backend) ---
        else if (url.includes(`${CITIBANK_DEMO_BUSINESS_BASE_URL}/plaid/item/public_token/exchange`)) {
          const reqBody = options?.body ? JSON.parse(options.body) as PlaidExchangePublicTokenRequest : {};
          if (!reqBody.public_token) {
            throw new Error("Plaid public token exchange request missing public token.");
          }
          resolve({
            access_token: `access-sandbox-${Math.random().toString(36).substring(2, 15)}`,
            item_id: `item-${Math.random().toString(36).substring(2, 15)}`,
            request_id: `req-${Math.random().toString(36).substring(2, 15)}`,
          } as T);
        }
        // --- Plaid Auth Get (Citibank Demo Business Backend) ---
        else if (url.includes(`${CITIBANK_DEMO_BUSINESS_BASE_URL}/plaid/auth/get`)) {
          const reqBody = options?.body ? JSON.parse(options.body) as PlaidGetAuthRequest : {};
          if (!reqBody.access_token) {
            throw new Error("Plaid Auth Get request missing access token.");
          }
          resolve({
            accounts: [{
              account_id: `acc-${Math.random().toString(36).substring(2, 15)}`,
              balances: { available: 10000, current: 10500, iso_currency_code: "USD", unofficial_currency_code: null },
              mask: "0000",
              name: "Plaid Checking",
              official_name: "Plaid Checking Account",
              subtype: "checking",
              type: "depository",
            }],
            numbers: {
              ach: [{
                account_id: `ach-acc-${Math.random().toString(36).substring(2, 15)}`,
                account: "123456789", // Simulated account number
                routing: "000000000", // Simulated routing number
                wire_routing: "000000000",
                limit: "1000000"
              }],
              eft: [], international: [], bacs: []
            },
            item: {
              item_id: `item-${Math.random().toString(36).substring(2, 15)}`,
              institution_id: `ins-${Math.random().toString(36).substring(2, 15)}`,
              webhook: "https://webhook.site/plaid",
              error: null,
              consented_transactions: null,
              update_type: "background"
            },
            request_id: `req-${Math.random().toString(36).substring(2, 15)}`,
          } as T);
        }
        // --- Stripe Bank Account Token Creation (Citibank Demo Business Backend) ---
        else if (url.includes(`${CITIBANK_DEMO_BUSINESS_BASE_URL}/stripe/create-bank-account-token`)) {
          const reqBody = options?.body ? JSON.parse(options.body) as StripeCreateBankAccountTokenRequest : {};
          if (!reqBody.public_token && (!reqBody.routing_number || !reqBody.account_number)) {
            throw new Error("Stripe bank account token request missing public token or ACH details.");
          }
          resolve({
            id: `tok_us_bank_${Math.random().toString(36).substring(2, 15)}`,
            object: "token",
            bank_account: {
              id: `ba_${Math.random().toString(36).substring(2, 15)}`,
              object: "bank_account",
              account_holder_name: "James Burvel O’Callaghan III", // Example name
              account_holder_type: "individual",
              bank_name: "Plaid Bank",
              country: "US",
              currency: "usd",
              fingerprint: `fingerprint_${Math.random().toString(36).substring(2, 15)}`,
              last4: "0000",
              routing_number: "000000000",
              status: "new",
            },
            client_ip: "127.0.0.1",
            created: Math.floor(Date.now() / 1000),
            livemode: false,
            type: "bank_account",
            used: false,
          } as T);
        }
        // --- Stripe Payment Method Creation (Citibank Demo Business Backend) ---
        else if (url.includes(`${CITIBANK_DEMO_BUSINESS_BASE_URL}/stripe/payment-methods`)) {
          const reqBody = options?.body ? JSON.parse(options.body) as StripeCreatePaymentMethodRequest : {};
          if (!reqBody.type || !reqBody.us_bank_account?.bank_account_token) {
            throw new Error("Stripe Payment Method creation request missing required fields.");
          }
          resolve({
            id: `pm_us_bank_${Math.random().toString(36).substring(2, 15)}`,
            object: "payment_method",
            billing_details: {
              address: { city: "New York", country: "US", line1: null, line2: null, postal_code: "10001", state: "NY" },
              email: "president@citibankdemobusiness.dev",
              name: "James Burvel O’Callaghan III",
              phone: null,
            },
            created: Math.floor(Date.now() / 1000),
            customer: `cus_${Math.random().toString(36).substring(2, 15)}`,
            livemode: false,
            metadata: {},
            type: "us_bank_account",
            us_bank_account: {
              account_holder_type: "individual",
              account_type: "checking",
              bank_name: "Plaid Bank",
              fingerprint: `fingerprint_${Math.random().toString(36).substring(2, 15)}`,
              last4: "0000",
              routing_number: "000000000",
              status: "new",
            },
          } as T);
        }
        // --- Citibank Demo Business Transaction Initiation ---
        else if (url.includes(`${CITIBANK_DEMO_BUSINESS_BASE_URL}/transactions/initiate`)) {
          const reqBody = options?.body ? JSON.parse(options.body) as CitibankTransactionInitiationRequest : {};
          if (!reqBody.flowId || !reqBody.userId || !reqBody.amount || !reqBody.currency || !reqBody.paymentMethodId) {
            throw new Error("Citibank transaction initiation request missing required fields.");
          }
          resolve({
            transactionId: `txn-${Math.random().toString(36).substring(2, 15)}`,
            status: "pending",
            modernTreasuryPaymentOrderId: `mto-${Math.random().toString(36).substring(2, 15)}`,
            externalTransactionReference: `pi_${Math.random().toString(36).substring(2, 15)}`,
            createdAt: Math.floor(Date.now() / 1000),
            flowId: reqBody.flowId,
          } as T);
        }
        // --- Citibank Demo Business Transaction Status Check ---
        else if (url.includes(`${CITIBANK_DEMO_BUSINESS_BASE_URL}/transactions/status`)) {
          const reqBody = options?.body ? JSON.parse(options.body) as CitibankTransactionStatusRequest : {};
          if (!reqBody.flowId || !reqBody.transactionId) {
            throw new Error("Citibank transaction status request missing required fields.");
          }
          // Simulate status progression for polling
          const currentFlowStatus = (_getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams).status;
          let newCitibankStatus: CitibankTransactionStatusResponse["status"] = "processing";
          let newPaymentFlowStatus: PaymentFlowStatus = "PAYMENT_PROCESSING";

          // Simple state machine simulation for demonstration purposes
          switch (currentFlowStatus) {
            case "CITIBANK_TRANSACTION_INITIATED":
            case "MODERN_TREASURY_SYNC_PENDING":
            case "PAYMENT_PROCESSING":
              const rand = Math.random();
              if (rand < 0.6) { // 60% chance to continue processing
                newCitibankStatus = "processing";
                newPaymentFlowStatus = "PAYMENT_PROCESSING";
              } else if (rand < 0.9) { // 30% chance to succeed
                newCitibankStatus = "completed";
                newPaymentFlowStatus = "PAYMENT_SUCCESS";
              } else { // 10% chance to fail
                newCitibankStatus = "failed";
                newPaymentFlowStatus = "PAYMENT_FAILED";
              }
              break;
            case "PAYMENT_SUCCESS":
              newCitibankStatus = "completed"; // Once successful, stay successful
              newPaymentFlowStatus = "PAYMENT_SUCCESS";
              break;
            case "PAYMENT_FAILED":
              newCitibankStatus = "failed"; // Once failed, stay failed
              newPaymentFlowStatus = "PAYMENT_FAILED";
              break;
            default:
              newCitibankStatus = "processing";
              newPaymentFlowStatus = "PAYMENT_PROCESSING";
              break;
          }

          // Update query params to reflect the simulated flow status, crucial for `resumePaymentFlow`
          _setQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME, { ..._getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME), status: newPaymentFlowStatus });

          resolve({
            transactionId: reqBody.transactionId,
            status: newCitibankStatus,
            details: `Transaction ${reqBody.transactionId} is ${newCitibankStatus}.`,
            currentStep: "Payment Processing with Modern Treasury and Stripe ACH",
            modernTreasuryPaymentOrderId: (_getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams).modernTreasuryPaymentOrderId || `mto-${Math.random().toString(36).substring(2, 15)}`,
            externalTransactionReference: (_getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams).stripePaymentMethodId || `pi_${Math.random().toString(36).substring(2, 15)}`,
            updatedAt: Math.floor(Date.now() / 1000),
            flowId: reqBody.flowId,
          } as T);
        }
        // --- Fallback for unknown simulated routes ---
        else {
          throw new Error(`Simulated API route not found: ${url}`);
        }
      } catch (error: unknown) {
        reject(error);
      }
    }, 500 + Math.random() * 1500); // Simulate realistic network latency (0.5s to 2s)
  });
}

// --- Internal State Management and Event Dispatchers (Mimicking React Hooks) ---
// Due to the strict "no imports" constraint, traditional React `useState` and `useEffect`
// cannot be used directly. Instead, this hook leverages global variables for internal
// state that persists across renders (within the same hook instance) and custom DOM events
// for communicating state changes to the consuming React component. This requires the
// consumer to manually listen to these events or re-read query parameters.

let _currentPlaidLinkToken: string | undefined = undefined; // Holds the Plaid Link token for external UI integration
let _currentConfig: PaymentFlowConfig | undefined = undefined; // Stores the latest provided config for internal use and callbacks

/**
 * Dispatches a custom DOM event to notify listeners of payment flow updates.
 * This acts as a global event bus, allowing React components to subscribe
 * to state changes without direct React `useState` / `useEffect` within this hook.
 *
 * @param eventName The specific event identifier (e.g., "statusChanged", "cancelled").
 * @param detail An object containing event-specific data.
 */
function _dispatchPaymentFlowEvent(eventName: string, detail: Record<string, unknown>) {
  // console.log(`[PAYMENT FLOW EVENT] Dispatching 'citibankdemobusiness.payment.${eventName}' with detail:`, detail);
  const event = new CustomEvent(`citibankdemobusiness.payment.${eventName}`, { detail });
  window.dispatchEvent(event);
}

/**
 * Central helper function to update the internal payment flow state,
 * persist it to URL query parameters, and dispatch status change events.
 * This ensures consistency across the hook's execution and UI reflections.
 *
 * @param newStatus The new `PaymentFlowStatus` to transition to.
 * @param flowId The current unique identifier of the payment flow.
 * @param updates Additional partial updates to store in query parameters.
 * @param error A user-friendly error message, if applicable.
 * @param errorCode A machine-readable error code, if applicable.
 * @param shouldCallFailureCallback If true, triggers the `onFailure` callback from the config.
 * @param shouldCallSuccessCallback If true, triggers the `onSuccess` callback from the config.
 * @param transactionId The Citibank transaction ID, required for success callback.
 */
function _updateFlowState(
  newStatus: PaymentFlowStatus,
  flowId: string,
  updates: Partial<PaymentFlowQueryParams> = {},
  error?: string,
  errorCode?: string,
  shouldCallFailureCallback = false,
  shouldCallSuccessCallback = false,
  transactionId?: string,
) {
  const currentQueryParams = _getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams;
  const newQueryParams: PaymentFlowQueryParams = {
    ...currentQueryParams,
    ...updates,
    flowId: flowId,
    status: newStatus,
    // Error management: if a new error is provided, or status indicates failure/error, set/clear error fields.
    error: error || (newStatus === "PAYMENT_FAILED" || newStatus === "UNKNOWN_ERROR" ? "An unexpected error occurred." : undefined),
    errorCode: errorCode || (newStatus === "PAYMENT_FAILED" || newStatus === "UNKNOWN_ERROR" ? "GENERIC_ERROR" : undefined),
  };

  _setQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME, newQueryParams);

  // Dispatch a custom event for external components to react to state changes.
  _dispatchPaymentFlowEvent("statusChanged", {
    status: newStatus,
    flowId: flowId,
    error: newQueryParams.error,
    errorCode: newQueryParams.errorCode,
    details: newQueryParams, // Provides full query parameters for context
  });

  // Execute provided callbacks based on the `shouldCall...Callback` flags.
  if (shouldCallFailureCallback && _currentConfig?.onFailure) {
    _currentConfig.onFailure(newQueryParams.error || "Payment flow failed.", newQueryParams.errorCode, flowId);
  }
  if (shouldCallSuccessCallback && _currentConfig?.onSuccess && transactionId) {
    _currentConfig.onSuccess(transactionId, flowId);
  }
}

/**
 * Manages the polling mechanism for periodically checking transaction status with the backend.
 * This is crucial for tracking long-running processes like ACH payments.
 */
let _statusPollingIntervalId: number | undefined = undefined; // Holds the ID of the `setInterval`
let _pollingAttempts = 0; // Tracks the number of polling attempts

/**
 * Initiates the transaction status polling process.
 * Clears any existing polling interval and starts a new one based on configuration.
 *
 * @param flowId The unique ID of the payment flow.
 * @param transactionId The Citibank transaction ID to poll for.
 * @param config The current `PaymentFlowConfig` containing polling interval and max attempts.
 */
function _startStatusPolling(
  flowId: string,
  transactionId: string,
  config: PaymentFlowConfig
) {
  if (_statusPollingIntervalId) {
    clearInterval(_statusPollingIntervalId); // Clear any old polling interval
  }

  _pollingAttempts = 0;
  const pollingIntervalMs = config.pollingIntervalMs || 5000; // Default 5 seconds
  const maxPollingAttempts = config.maxPollingAttempts || 60; // Default 60 attempts (5 minutes)

  const poll = async () => {
    _pollingAttempts++;
    if (_pollingAttempts > maxPollingAttempts) {
      clearInterval(_statusPollingIntervalId);
      _statusPollingIntervalId = undefined; // Reset interval ID
      _updateFlowState(
        "PAYMENT_FAILED",
        flowId,
        { error: "Payment status polling timed out.", errorCode: "POLLING_TIMEOUT" },
        "Payment status polling timed out.",
        "POLLING_TIMEOUT",
        true // Call failure callback
      );
      // console.error(`[POLLING ERROR] Payment status polling timed out for flowId: ${flowId}`);
      return;
    }

    // console.log(`[POLLING] Checking status for flowId: ${flowId}, transactionId: ${transactionId} (Attempt ${_pollingAttempts}/${maxPollingAttempts})`);

    try {
      const statusResponse = await _simulateFetch<CitibankTransactionStatusResponse>(
        `${CITIBANK_DEMO_BUSINESS_BASE_URL}/transactions/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flowId, transactionId }),
        }
      );

      switch (statusResponse.status) {
        case "completed":
          clearInterval(_statusPollingIntervalId);
          _statusPollingIntervalId = undefined;
          _updateFlowState(
            "PAYMENT_SUCCESS",
            flowId,
            { citibankTransactionId: transactionId, modernTreasuryPaymentOrderId: statusResponse.modernTreasuryPaymentOrderId },
            undefined, // Clear error
            undefined, // Clear error code
            false, // Don't call failure
            true, // Call success callback
            transactionId
          );
          // console.log(`[POLLING] Payment successful for flowId: ${flowId}, transactionId: ${transactionId}`);
          break;
        case "failed":
        case "cancelled":
          clearInterval(_statusPollingIntervalId);
          _statusPollingIntervalId = undefined;
          _updateFlowState(
            "PAYMENT_FAILED", // Map to generic payment failed status
            flowId,
            { citibankTransactionId: transactionId, error: statusResponse.details, errorCode: statusResponse.status.toUpperCase() },
            statusResponse.details,
            statusResponse.status.toUpperCase(),
            true // Call failure callback
          );
          // console.log(`[POLLING] Payment failed/cancelled for flowId: ${flowId}, transactionId: ${transactionId}. Reason: ${statusResponse.details}`);
          break;
        case "pending":
        case "processing":
        case "requires_action":
          // Continue polling. Update status without calling success/failure callbacks yet.
          _updateFlowState(
            "PAYMENT_PROCESSING", // Maintain a generic processing status
            flowId,
            { citibankTransactionId: transactionId, modernTreasuryPaymentOrderId: statusResponse.modernTreasuryPaymentOrderId }
          );
          break;
        default:
          // Unrecognized status from backend, possibly a new intermediate state
          // console.warn(`[POLLING] Unrecognized status '${statusResponse.status}' for flowId: ${flowId}, transactionId: ${transactionId}. Continuing polling.`);
          break;
      }
    } catch (error: unknown) {
      // console.error(`[POLLING ERROR] Failed to fetch status for flowId: ${flowId}, transactionId: ${transactionId}`, error);
      if (_pollingAttempts >= maxPollingAttempts) {
        clearInterval(_statusPollingIntervalId);
        _statusPollingIntervalId = undefined;
        _updateFlowState(
          "PAYMENT_FAILED",
          flowId,
          { error: `Failed to check payment status: ${error instanceof Error ? error.message : String(error)}`, errorCode: "STATUS_CHECK_ERROR" },
          `Failed to check payment status: ${error instanceof Error ? error.message : String(error)}`,
          "STATUS_CHECK_ERROR",
          true // Call failure callback
        );
      }
      // If not max attempts, allow polling to continue and potentially recover
    }
  };

  _statusPollingIntervalId = window.setInterval(poll, pollingIntervalMs) as unknown as number;
  // Execute the poll function immediately upon starting to avoid initial delay.
  poll();
}

/**
 * Stops any active status polling. Should be called when the flow completes, fails, or is cancelled.
 */
function _stopStatusPolling() {
  if (_statusPollingIntervalId) {
    clearInterval(_statusPollingIntervalId);
    _statusPollingIntervalId = undefined;
    _pollingAttempts = 0;
    // console.log("[POLLING] Status polling stopped.");
  }
}

// --- Main Hook Implementation ---

/**
 * `useStripePlaidPaymentFlow` is a comprehensive hook for managing end-to-end payment transactions
 * involving Stripe, Plaid, Modern Treasury, and Citibank Demo Business backend services.
 * It uses URL query parameters for persistent state and dispatches custom events for status updates.
 *
 * @returns An object conforming to `UseStripePlaidPaymentFlowReturn`, providing status,
 *          error information, and functions to control the payment flow.
 */
function useStripePlaidPaymentFlow(): UseStripePlaidPaymentFlowReturn {
  // Read current state from URL query parameters on hook initialization.
  // This is the primary way the hook re-establishes its internal state,
  // particularly after page reloads or redirects.
  const initialFlowState = _getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams;
  let currentStatus: PaymentFlowStatus = initialFlowState.status || "IDLE";
  let flowId: string | undefined = initialFlowState.flowId;
  let error: string | undefined = initialFlowState.error;
  let errorCode: string | undefined = initialFlowState.errorCode;
  let plaidLinkToken: string | undefined = initialFlowState.plaidLinkToken;

  // The `_currentConfig` global variable is a workaround for the "no imports" constraint,
  // allowing us to store and access the `PaymentFlowConfig` (especially callbacks)
  // across different internal asynchronous operations without relying on React's `useRef`
  // or `useState`. It's expected to be set by the `resumePaymentFlow` function.

  /**
   * Internal helper for transitioning the payment flow to a new state.
   * This centralizes state updates, query parameter persistence, and event dispatching.
   *
   * @param newStatus The target `PaymentFlowStatus`.
   * @param updates Additional key-value pairs to store in the query parameters.
   * @param errMessage Optional: A human-readable error message.
   * @param errCode Optional: A machine-readable error code.
   * @param shouldCallFailure If true, triggers the `onFailure` callback.
   * @param shouldCallSuccess If true, triggers the `onSuccess` callback.
   * @param txnId Optional: The transaction ID, typically for success callbacks.
   */
  const _transitionState = (
    newStatus: PaymentFlowStatus,
    updates: Partial<PaymentFlowQueryParams> = {},
    errMessage?: string,
    errCode?: string,
    shouldCallFailure = false,
    shouldCallSuccess = false,
    txnId?: string
  ) => {
    // Ensure `flowId` is always present. If not, generate a new one. This handles edge cases
    // where a flow might start without a pre-assigned ID, or if state corruption occurred.
    if (!flowId) {
      flowId = updates.flowId || _generateFlowId();
      // console.warn(`[STATE TRANSITION WARNING] Flow ID was undefined, generated new one: ${flowId}`);
    }
    // Update the local `currentStatus` variable for immediate reflection within the hook instance.
    currentStatus = newStatus;
    // Persist the state and trigger event dispatchers.
    _updateFlowState(newStatus, flowId, updates, errMessage, errCode, shouldCallFailure, shouldCallSuccess, txnId);
  };

  /**
   * Generates a unique identifier for a new payment flow.
   * This ID is used to track the entire lifecycle of a transaction.
   * @returns A unique flow ID string.
   */
  const _generateFlowId = (): string => {
    return `flow-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  };

  /**
   * Standardized error handling mechanism for the payment flow.
   * It logs the error, updates the flow state to a failure status, and triggers the `onFailure` callback.
   *
   * @param stage The stage of the payment flow where the error occurred (e.g., "Plaid Link Token Creation").
   * @param operation The specific operation that failed (e.g., "Plaid Link Token API Call").
   * @param rawError The raw error object or message.
   * @param currentFlowId The ID of the currently active flow.
   * @param existingQueryParams The current query parameters state for context.
   * @param statusToSet The `PaymentFlowStatus` to set (defaults to `UNKNOWN_ERROR`).
   * @param errorCodeToSet The machine-readable error code (defaults to `GENERIC_ERROR`).
   */
  const _handlePaymentFlowError = (
    stage: string,
    operation: string,
    rawError: unknown,
    currentFlowId: string,
    existingQueryParams: PaymentFlowQueryParams,
    statusToSet: PaymentFlowStatus = "UNKNOWN_ERROR",
    errorCodeToSet: string = "GENERIC_ERROR"
  ) => {
    const errorMessage = rawError instanceof Error ? rawError.message : String(rawError);
    // console.error(`[PAYMENT FLOW ERROR] Stage: ${stage}, Operation: ${operation}, Error: ${errorMessage}`, rawError);
    _transitionState(
      statusToSet,
      { ...existingQueryParams, error: errorMessage, errorCode: errorCodeToSet },
      errorMessage,
      errorCodeToSet,
      true // Always call failure callback when this handler is invoked
    );
  };

  /**
   * Step 1: Initiates the process of creating a Plaid Link token via the Citibank Demo Business backend.
   * This token is then used by the client-side UI to open the Plaid Link module.
   *
   * @param config The current `PaymentFlowConfig`.
   * @param currentFlowId The ID of the current payment flow.
   * @param currentQueryParams The current query parameters.
   */
  const _initiatePlaidLinkTokenCreation = async (config: PaymentFlowConfig, currentFlowId: string, currentQueryParams: PaymentFlowQueryParams) => {
    // Transition to initiating state, marking the start of this async operation.
    _transitionState("INITIATING", { ...currentQueryParams, status: "INITIATING", flowId: currentFlowId });
    try {
      // Apply any custom Plaid Link configuration overrides provided by the consumer.
      const plaidConfigOverrides = config.getPlaidLinkConfig
        ? config.getPlaidLinkConfig(
            { client_user_id: config.userId, legal_name: "Client User", email_address: "user@example.com" },
            currentQueryParams.plaidLinkToken
          )
        : {};

      // Construct the request to our backend for Plaid Link token creation.
      const linkTokenRequest: PlaidLinkTokenRequest = {
        client_id: "PLAID_CLIENT_ID_SIMULATED", // Simulated: In real app, fetched securely from backend env
        secret: "PLAID_SECRET_SIMULATED", // Simulated: Never exposed client-side
        client_name: "Citibank Demo Business",
        user: { client_user_id: config.userId },
        products: ["auth"], // Only requesting 'auth' for bank account verification/linking
        country_codes: ["US"], // Focus on US accounts
        language: "en",
        webhook: `${CITIBANK_DEMO_BUSINESS_BASE_URL}/plaid/webhook`, // Webhook for asynchronous events
        redirect_uri: config.plaidRedirectUri || `https://citibankdemobusiness.dev/payment-redirect?flowId=${currentFlowId}`, // Dynamic redirect
        ...plaidConfigOverrides,
      };

      // Simulate the API call to our backend.
      const response = await _simulateFetch<PlaidLinkTokenResponse>(
        `${CITIBANK_DEMO_BUSINESS_BASE_URL}/plaid/link/token/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(linkTokenRequest),
        }
      );

      // Store the new Plaid Link token globally so the consuming component can access it.
      _currentPlaidLinkToken = response.link_token;
      // Transition to `PLAID_LINK_REQUIRED`, indicating the UI should now open Plaid Link.
      _transitionState(
        "PLAID_LINK_REQUIRED",
        {
          ...currentQueryParams,
          plaidLinkToken: response.link_token,
          status: "PLAID_LINK_REQUIRED",
        }
      );
      // console.log(`[PLAID LINK] Link token created: ${response.link_token}`);

    } catch (e: unknown) {
      // Handle any errors during Plaid Link token creation.
      _handlePaymentFlowError(
        "Plaid Link Token Creation",
        "Plaid Link Token API Call",
        e,
        currentFlowId,
        currentQueryParams,
        "PLAID_LINK_FAILURE",
        "PLAID_LINK_TOKEN_ERROR"
      );
    }
  };

  /**
   * Step 2: Exchanges the Plaid public token (obtained after user links account) for a persistent access token,
   * then proceeds to create a Stripe Payment Method using the bank account details.
   * This is a multi-step asynchronous process that involves multiple simulated API calls.
   *
   * @param publicToken The temporary token received from Plaid Link.
   * @param metadata Plaid Link success metadata.
   * @param currentFlowId The ID of the current payment flow.
   * @param currentQueryParams The current query parameters.
   * @param config The current `PaymentFlowConfig`.
   */
  const _exchangePlaidPublicTokenAndCreateStripePaymentMethod = async (
    publicToken: string,
    metadata: Record<string, unknown>,
    currentFlowId: string,
    currentQueryParams: PaymentFlowQueryParams,
    config: PaymentFlowConfig
  ) => {
    // Transition to indicate that the public token exchange is in progress.
    _transitionState(
      "EXCHANGING_PLAID_TOKEN",
      { ...currentQueryParams, status: "EXCHANGING_PLAID_TOKEN", plaidPublicToken: publicToken },
      undefined, // Clear any previous error
      undefined, // Clear any previous error code
      false,
      false
    );

    try {
      // 2a. Simulate exchange of Plaid public token for an access token.
      const exchangeResponse = await _simulateFetch<PlaidExchangePublicTokenResponse>(
        `${CITIBANK_DEMO_BUSINESS_BASE_URL}/plaid/item/public_token/exchange`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: "PLAID_CLIENT_ID_SIMULATED",
            secret: "PLAID_SECRET_SIMULATED",
            public_token: publicToken,
          }),
        }
      );

      const plaidAccessToken = exchangeResponse.access_token;
      const plaidItemId = exchangeResponse.item_id;
      // console.log(`[PLAID] Public token exchanged. Access Token: ${plaidAccessToken}, Item ID: ${plaidItemId}`);

      // 2b. Simulate fetching Plaid Auth details (bank account number, routing number).
      const authResponse = await _simulateFetch<PlaidAuthResponse>(
        `${CITIBANK_DEMO_BUSINESS_BASE_URL}/plaid/auth/get`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: "PLAID_CLIENT_ID_SIMULATED",
            secret: "PLAID_SECRET_SIMULATED",
            access_token: plaidAccessToken,
          }),
        }
      );

      // Extract ACH details. Assuming a single ACH account for simplicity.
      const achAccount = authResponse.numbers.ach[0];
      if (!achAccount) {
        throw new Error("No ACH account found for the linked bank. Please select an eligible account.");
      }
      const bankAccountIdFromPlaid = achAccount.account_id;
      const routingNumber = achAccount.routing;
      const accountNumber = achAccount.account;
      const bankName = "Simulated Plaid Bank"; // Actual bank name would be from another Plaid API call (institutions get)
      // console.log(`[PLAID] ACH Details acquired: Routing ${routingNumber}, Account ${accountNumber}, Plaid Bank Account ID ${bankAccountIdFromPlaid}`);

      // Transition to indicate Stripe Payment Method creation is starting.
      _transitionState(
        "STRIPE_PAYMENT_METHOD_CREATION_IN_PROGRESS",
        {
          ...currentQueryParams,
          status: "STRIPE_PAYMENT_METHOD_CREATION_IN_PROGRESS",
          plaidAccessToken: plaidAccessToken,
          plaidItemId: plaidItemId,
          plaidInstitutionId: authResponse.item.institution_id,
          // Clear public token as it's no longer needed
          plaidPublicToken: undefined,
        }
      );

      // 2c. Simulate creating a Stripe Bank Account Token.
      // In a real integration, this often involves Stripe.js or Plaid's processor token.
      // Here, it's modeled as a backend call for security and simplicity.
      const stripeBankAccountTokenResponse = await _simulateFetch<StripeBankAccountTokenResponse>(
        `${CITIBANK_DEMO_BUSINESS_BASE_URL}/stripe/create-bank-account-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken, // For Plaid processor token flow, or we'd pass ACH details
            account_id: bankAccountIdFromPlaid, // Plaid's account_id for reference
            routing_number: routingNumber,
            account_number: accountNumber,
            account_holder_name: "James Burvel O’Callaghan III", // Derived from user config or pre-filled
            account_holder_type: "individual", // Derived
            currency: config.currency,
          }),
        }
      );

      const stripeBankAccountToken = stripeBankAccountTokenResponse.id;
      const stripeBankAccountId = stripeBankAccountTokenResponse.bank_account.id;
      // console.log(`[STRIPE] Bank Account Token created: ${stripeBankAccountToken}, Stripe Bank Account ID: ${stripeBankAccountId}`);

      // 2d. Simulate creating a Stripe Payment Method using the bank account token.
      const stripePaymentMethodOverrides = config.getStripePaymentMethodDetails
        ? config.getStripePaymentMethodDetails(config.userId)
        : {};

      const stripePaymentMethodRequest: StripeCreatePaymentMethodRequest = {
        type: "us_bank_account",
        us_bank_account: {
          bank_account_token: stripeBankAccountToken,
        },
        billing_details: {
          name: "James Burvel O’Callaghan III", // Example name, would come from user profile
          email: "president@citibankdemobusiness.dev", // Example email
          ...stripePaymentMethodOverrides.billing_details,
        },
        ...stripePaymentMethodOverrides,
      };

      const stripePaymentMethodResponse = await _simulateFetch<StripePaymentMethodResponse>(
        `${CITIBANK_DEMO_BUSINESS_BASE_URL}/stripe/payment-methods`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stripePaymentMethodRequest),
        }
      );

      const stripePaymentMethodId = stripePaymentMethodResponse.id;
      // console.log(`[STRIPE] Payment Method created: ${stripePaymentMethodId}`);

      // Transition to `STRIPE_PAYMENT_METHOD_CREATED`, indicating successful payment method setup.
      _transitionState(
        "STRIPE_PAYMENT_METHOD_CREATED",
        {
          ...currentQueryParams,
          status: "STRIPE_PAYMENT_METHOD_CREATED",
          stripePaymentMethodId: stripePaymentMethodId,
          stripeBankAccountId: stripeBankAccountId,
        }
      );

      // Automatically proceed to initiate the transaction with Citibank Demo Business backend.
      await _initiateCitibankTransaction(
        currentFlowId,
        stripePaymentMethodId,
        plaidAccessToken,
        stripeBankAccountId,
        config,
        { ...currentQueryParams, plaidAccessToken, stripePaymentMethodId, stripeBankAccountId }
      );

    } catch (e: unknown) {
      // Handle any errors during Plaid token exchange or Stripe Payment Method creation.
      _handlePaymentFlowError(
        "Plaid Token Exchange & Stripe PM Creation",
        "Plaid/Stripe API Calls",
        e,
        currentFlowId,
        currentQueryParams,
        "STRIPE_PAYMENT_METHOD_CREATION_FAILURE",
        "STRIPE_PM_CREATION_ERROR"
      );
    }
  };

  /**
   * Step 3: Initiates the final payment transaction with the Citibank Demo Business backend.
   * This backend endpoint is responsible for integrating with Stripe Payment Intents
   * and potentially Modern Treasury for treasury management and reconciliation.
   *
   * @param currentFlowId The ID of the current payment flow.
   * @param stripePaymentMethodId The Stripe Payment Method ID to use for the transaction.
   * @param plaidAccessToken The Plaid access token (for backend auditing/re-verification).
   * @param stripeBankAccountId The Stripe Bank Account ID (for backend auditing/reference).
   * @param config The current `PaymentFlowConfig`.
   * @param currentQueryParams The current query parameters.
   */
  const _initiateCitibankTransaction = async (
    currentFlowId: string,
    stripePaymentMethodId: string,
    plaidAccessToken: string,
    stripeBankAccountId: string,
    config: PaymentFlowConfig,
    currentQueryParams: PaymentFlowQueryParams
  ) => {
    // Transition to indicate transaction initiation is in progress.
    _transitionState(
      "CITIBANK_TRANSACTION_INITIATION_IN_PROGRESS",
      { ...currentQueryParams, status: "CITIBANK_TRANSACTION_INITIATION_IN_PROGRESS" },
      undefined,
      undefined,
      false,
      false
    );

    try {
      const transactionRequest: CitibankTransactionInitiationRequest = {
        flowId: currentFlowId,
        userId: config.userId,
        amount: config.amount,
        currency: config.currency,
        description: config.description,
        paymentMethodId: stripePaymentMethodId,
        plaidAccessToken: plaidAccessToken, // Pass for backend reference
        stripeBankAccountId: stripeBankAccountId, // Pass for backend reference
      };

      // Simulate the API call to our Citibank Demo Business backend.
      const response = await _simulateFetch<CitibankTransactionInitiationResponse>(
        `${CITIBANK_DEMO_BUSINESS_BASE_URL}/transactions/initiate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionRequest),
        }
      );

      // console.log(`[CITIBANK DEMO BUSINESS] Transaction initiated: ${response.transactionId}. Status: ${response.status}`);

      // Transition to `CITIBANK_TRANSACTION_INITIATED` and store transaction IDs.
      _transitionState(
        "CITIBANK_TRANSACTION_INITIATED",
        {
          ...currentQueryParams,
          status: "CITIBANK_TRANSACTION_INITIATED",
          citibankTransactionId: response.transactionId,
          modernTreasuryPaymentOrderId: response.modernTreasuryPaymentOrderId,
        }
      );

      // Immediately start polling for transaction status updates, as this is an asynchronous process.
      _startStatusPolling(currentFlowId, response.transactionId, config);

    } catch (e: unknown) {
      // Handle any errors during Citibank Demo Business transaction initiation.
      _handlePaymentFlowError(
        "Citibank Transaction Initiation",
        "Citibank Transaction API Call",
        e,
        currentFlowId,
        currentQueryParams,
        "CITIBANK_TRANSACTION_INITIATION_FAILURE",
        "CITIBANK_INITIATION_ERROR"
      );
    }
  };

  /**
   * Public function to initiate a brand new payment flow.
   * It cleans up any old flow state and sets up initial query parameters.
   *
   * @param inputConfig A subset of `PaymentFlowConfig` containing essential details for starting the flow.
   */
  const initiatePaymentFlow = (inputConfig: Omit<PaymentFlowConfig, "onSuccess" | "onFailure" | "onPlaidEvent" | "getPlaidLinkConfig" | "getStripePaymentMethodDetails" | "pollingIntervalMs" | "maxPollingAttempts" | "plaidRedirectUri">) => {
    // Prevent initiating a new flow if one is already active and not in a terminal state.
    if (currentStatus !== "IDLE" && currentStatus !== "PAYMENT_FAILED" && currentStatus !== "PAYMENT_CANCELLED") {
      // console.warn(`[PAYMENT FLOW] Cannot initiate new flow while current status is '${currentStatus}'. Please cancel or wait for completion.`);
      // In a real app, this might involve throwing an error or a specific callback.
      return;
    }

    _stopStatusPolling(); // Ensure any residual polling from a previous session is stopped.
    const newFlowId = _generateFlowId(); // Generate a fresh flow ID.
    // Reset all relevant query parameters to their initial state for the new flow.
    _setQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME, {
      flowId: newFlowId,
      status: "INITIATING", // Immediately set status to initiating
      amount: inputConfig.amount,
      currency: inputConfig.currency,
      description: inputConfig.description,
      userId: inputConfig.userId,
      retries: 0,
      // All other specific IDs/tokens should be cleared
      plaidPublicToken: undefined,
      plaidAccessToken: undefined,
      plaidItemId: undefined,
      plaidInstitutionId: undefined,
      plaidLinkToken: undefined,
      stripePaymentMethodId: undefined,
      stripeBankAccountId: undefined,
      stripeCustomerId: undefined,
      stripeEphemeralKey: undefined,
      modernTreasuryTransactionId: undefined,
      modernTreasuryPaymentOrderId: undefined,
      citibankTransactionId: undefined,
      error: undefined,
      errorCode: undefined,
      lastAttemptTimestamp: undefined,
    });

    // Update internal hook variables to reflect the new, immediate state.
    flowId = newFlowId;
    currentStatus = "INITIATING";
    error = undefined;
    errorCode = undefined;
    plaidLinkToken = undefined;

    // Note: The `initiatePaymentFlow` sets the initial state, but the full `PaymentFlowConfig`
    // (with callbacks) is typically provided when `resumePaymentFlow` is subsequently called
    // (e.g., in a `useEffect` after initial render), which then actually kicks off the API calls.
    // This separation accommodates React's lifecycle and the "no imports" constraint.
  };

  /**
   * Public function to resume an existing payment flow. This is the primary entry point
   * for the hook after initial load or a redirect, allowing it to pick up where it left off.
   *
   * @param config The full `PaymentFlowConfig`, including callbacks, required for resuming.
   */
  const resumePaymentFlow = (config: PaymentFlowConfig) => {
    _currentConfig = config; // Store the provided configuration globally for use by async functions.

    // Re-read the current state from URL query parameters.
    const currentQueryParams = _getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams;
    flowId = currentQueryParams.flowId;
    currentStatus = currentQueryParams.status || "IDLE";
    error = currentQueryParams.error;
    errorCode = currentQueryParams.errorCode;
    plaidLinkToken = currentQueryParams.plaidLinkToken;

    if (!flowId) {
      // If no flow ID is found, the hook is in an idle state, waiting for initiation.
      // console.log("[PAYMENT FLOW] No active flow ID found in query parameters. Hook is idle.");
      _transitionState("IDLE", {});
      return;
    }

    // console.log(`[PAYMENT FLOW] Resuming flow ${flowId} with status: ${currentStatus}`);

    // Based on the current status, determine the appropriate action to resume the flow.
    switch (currentStatus) {
      case "IDLE":
        // Nothing to do, awaiting `initiatePaymentFlow` call.
        break;
      case "INITIATING":
        // If we are in 'INITIATING' but haven't yet received a Plaid Link token (e.g., page reloaded during request),
        // try to create one. Otherwise, transition to 'PLAID_LINK_REQUIRED'.
        if (!plaidLinkToken) {
          _initiatePlaidLinkTokenCreation(config, flowId, currentQueryParams);
        } else {
          _transitionState("PLAID_LINK_REQUIRED", { plaidLinkToken: plaidLinkToken });
        }
        break;
      case "PLAID_LINK_REQUIRED":
      case "PLAID_LINK_IN_PROGRESS":
        // The UI needs to open Plaid Link. Ensure the `_currentPlaidLinkToken` is available.
        _currentPlaidLinkToken = plaidLinkToken;
        break;
      case "PLAID_LINK_SUCCESS":
      case "EXCHANGING_PLAID_TOKEN":
        // Plaid public token was obtained; proceed to exchange it and create Stripe PM.
        if (currentQueryParams.plaidPublicToken) {
          _exchangePlaidPublicTokenAndCreateStripePaymentMethod(
            currentQueryParams.plaidPublicToken,
            {}, // Metadata is not persisted in query params, so empty
            flowId,
            currentQueryParams,
            config
          );
        } else {
          // Error: inconsistent state if public token is missing here.
          _handlePaymentFlowError(
            "Resume Flow",
            "Plaid Link Success but Missing Public Token",
            "Plaid public token missing from query parameters. Cannot proceed with exchange.",
            flowId,
            currentQueryParams,
            "PLAID_LINK_FAILURE",
            "MISSING_PLAID_PUBLIC_TOKEN"
          );
        }
        break;
      case "STRIPE_PAYMENT_METHOD_CREATION_IN_PROGRESS":
      case "STRIPE_PAYMENT_METHOD_CREATED":
        // Stripe Payment Method was created; proceed to initiate Citibank transaction.
        if (currentQueryParams.stripePaymentMethodId && currentQueryParams.plaidAccessToken && currentQueryParams.stripeBankAccountId) {
          _initiateCitibankTransaction(
            flowId,
            currentQueryParams.stripePaymentMethodId,
            currentQueryParams.plaidAccessToken,
            currentQueryParams.stripeBankAccountId,
            config,
            currentQueryParams
          );
        } else {
          // Error: inconsistent state if Stripe PM details are missing.
          _handlePaymentFlowError(
            "Resume Flow",
            "Stripe PM Created but Missing Details",
            "Stripe Payment Method ID or Plaid Access Token missing from query parameters. Cannot initiate transaction.",
            flowId,
            currentQueryParams,
            "STRIPE_PAYMENT_METHOD_CREATION_FAILURE",
            "MISSING_STRIPE_PM_DETAILS"
          );
        }
        break;
      case "CITIBANK_TRANSACTION_INITIATION_IN_PROGRESS":
      case "CITIBANK_TRANSACTION_INITIATED":
      case "MODERN_TREASURY_SYNC_PENDING":
      case "PAYMENT_PROCESSING":
        // Citibank transaction was initiated; restart polling for its status.
        if (currentQueryParams.citibankTransactionId) {
          _startStatusPolling(flowId, currentQueryParams.citibankTransactionId, config);
        } else {
          // Error: inconsistent state if transaction ID is missing.
          _handlePaymentFlowError(
            "Resume Flow",
            "Citibank Transaction Initiated but Missing ID",
            "Citibank transaction ID missing from query parameters. Cannot poll status.",
            flowId,
            currentQueryParams,
            "CITIBANK_TRANSACTION_INITIATION_FAILURE",
            "MISSING_CITIBANK_TXN_ID"
          );
        }
        break;
      case "PAYMENT_SUCCESS":
        // Flow already successful. Re-trigger success callback if the consumer explicitly expects it on resume.
        // This is important for idempotent callback handling.
        // console.log(`[PAYMENT FLOW] Flow ${flowId} already successful.`);
        if (currentQueryParams.citibankTransactionId) {
          _updateFlowState("PAYMENT_SUCCESS", flowId, {}, undefined, undefined, false, true, currentQueryParams.citibankTransactionId);
        }
        break;
      case "PAYMENT_FAILED":
      case "PAYMENT_CANCELLED":
      case "UNKNOWN_ERROR":
        // Flow ended in a terminal (failed/cancelled) state. Report error if one exists.
        // console.log(`[PAYMENT FLOW] Flow ${flowId} ended with status: ${currentStatus}. Error: ${error}`);
        if (error) {
          _updateFlowState(currentStatus, flowId, {}, error, errorCode, true); // Re-trigger failure callback on resume
        }
        break;
      case "AWAITING_USER_ACTION":
        // Currently, no specific action for this state, just persist.
        break;
      default:
        // Log any unhandled statuses during resume, indicating a potential logic gap.
        // console.warn(`[PAYMENT FLOW] Unhandled status during resume: ${currentStatus}. Attempting to reset to IDLE.`);
        _handlePaymentFlowError(
          "Resume Flow",
          `Unhandled Status: ${currentStatus}`,
          `The payment flow encountered an unhandled status '${currentStatus}' during resume.`,
          flowId,
          currentQueryParams,
          "UNKNOWN_ERROR",
          "UNHANDLED_RESUME_STATUS"
        );
        break;
    }
  };

  /**
   * Public function to cancel the current payment flow, resetting all its state.
   * This clears URL parameters and stops any active processes.
   */
  const cancelPaymentFlow = () => {
    _stopStatusPolling(); // Stop any ongoing status polling.
    _setQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME, {}); // Clear all payment flow related query parameters.
    _currentPlaidLinkToken = undefined; // Clear the Plaid Link token.
    // Reset internal hook variables.
    flowId = undefined;
    currentStatus = "IDLE";
    error = undefined;
    errorCode = undefined;

    // Dispatch a "cancelled" event for external listeners.
    _dispatchPaymentFlowEvent("cancelled", { flowId: initialFlowState.flowId || "N/A" });
    // console.log(`[PAYMENT FLOW] Flow ${initialFlowState.flowId || "N/A"} cancelled.`);
  };

  /**
   * Callback handler for Plaid Link's successful connection event.
   * This function should be passed to the Plaid Link UI component by the consumer.
   *
   * @param publicToken The temporary public token from Plaid Link.
   * @param metadata Detailed success metadata from Plaid Link.
   */
  const handlePlaidLinkSuccess = (publicToken: string, metadata: Record<string, unknown>) => {
    // console.log("[PLAID LINK] Success event received:", { publicToken, metadata });
    if (!flowId) {
      // If no active flow ID, it's an unexpected success, treat as an error.
      // console.error("[PLAID LINK ERROR] No active flowId to handle Plaid Link success. Discarding.");
      _handlePaymentFlowError(
        "Plaid Link Callback",
        "Plaid Link Success (no flowId)",
        "Plaid Link success callback invoked without an active payment flow.",
        "N/A", // No flowId available
        {},
        "UNKNOWN_ERROR",
        "NO_ACTIVE_FLOW"
      );
      return;
    }

    // Transition state to `PLAID_LINK_SUCCESS` and store the public token.
    _transitionState(
      "PLAID_LINK_SUCCESS",
      { ..._getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME), status: "PLAID_LINK_SUCCESS", plaidPublicToken: publicToken },
      undefined,
      undefined,
      false,
      false
    );

    // Trigger the optional `onPlaidEvent` callback if provided in the config.
    _currentConfig?.onPlaidEvent?.("success", metadata);

    // Automatically continue the flow by exchanging the public token and creating Stripe PM.
    // Ensure `_currentConfig` is available for this step.
    if (_currentConfig) {
      _exchangePlaidPublicTokenAndCreateStripePaymentMethod(
        publicToken,
        metadata,
        flowId,
        _getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams,
        _currentConfig
      );
    } else {
      // This indicates a severe issue where config wasn't set by `resumePaymentFlow`.
      _handlePaymentFlowError(
        "Plaid Link Success",
        "Missing Configuration",
        "PaymentFlowConfig is missing, cannot proceed after Plaid Link success.",
        flowId,
        _getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams,
        "UNKNOWN_ERROR",
        "MISSING_CONFIG_AFTER_PLAID"
      );
    }
  };

  /**
   * Callback handler for Plaid Link's error event.
   * This function should be passed to the Plaid Link UI component by the consumer.
   *
   * @param plaidError The error object provided by Plaid Link.
   * @param metadata Detailed error metadata from Plaid Link.
   */
  const handlePlaidLinkError = (plaidError: unknown, metadata: Record<string, unknown>) => {
    // console.error("[PLAID LINK] Error event received:", { plaidError, metadata });
    // Determine the current flow ID, falling back if not explicitly set.
    const currentFlowId = flowId || (_getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams).flowId || "N/A";
    const errorMessage = plaidError instanceof Error ? plaidError.message : String(plaidError);
    const errorCodeFromPlaid = (metadata as any)?.error_code || "PLAID_LINK_ERROR"; // Attempt to extract Plaid's error code.
    // Handle the error, transitioning the flow to a failure state.
    _handlePaymentFlowError(
      "Plaid Link Callback",
      "Plaid Link Error",
      errorMessage,
      currentFlowId,
      _getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams,
      "PLAID_LINK_FAILURE",
      errorCodeFromPlaid
    );
    // Trigger the optional `onPlaidEvent` callback.
    _currentConfig?.onPlaidEvent?.("error", { error: plaidError, ...metadata });
  };

  /**
   * Callback handler for Plaid Link's exit event (when the user closes the UI).
   * This function should be passed to the Plaid Link UI component by the consumer.
   *
   * @param errorOnExit An optional error object if the exit was due to a specific issue.
   * @param metadata Detailed exit metadata from Plaid Link.
   */
  const handlePlaidLinkExit = (errorOnExit: unknown, metadata: Record<string, unknown>) => {
    // console.log("[PLAID LINK] Exit event received:", { errorOnExit, metadata });
    const currentFlowId = flowId || (_getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME) as PaymentFlowQueryParams).flowId || "N/A";
    if (errorOnExit) {
      // If an error accompanied the exit, treat it as a Plaid Link error.
      handlePlaidLinkError(errorOnExit, metadata);
    } else {
      // If no error, assume the user intentionally cancelled or closed Plaid Link.
      _transitionState(
        "PAYMENT_CANCELLED",
        { ..._getQueryParamsFilters(PAYMENT_FLOW_PARAM_NAME), error: "Plaid Link flow cancelled by user.", errorCode: "PLAID_USER_CANCELLED" },
        "Plaid Link flow cancelled by user.",
        "PLAID_USER_CANCELLED",
        true // Call failure callback as cancellation is a form of non-success.
      );
    }
    // Trigger the optional `onPlaidEvent` callback.
    _currentConfig?.onPlaidEvent?.("exit", { error: errorOnExit, ...metadata });
  };

  // The hook returns its public interface.
  // Consumers of this hook are responsible for calling `resumePaymentFlow` on appropriate
  // lifecycle events (e.g., `useEffect` with `[]` dependency for initial mount, or with
  // `window.location.search` if changes to URL params should trigger state re-evaluation)
  // to ensure the hook's internal state is always synchronized with the URL.
  return {
    currentStatus: currentStatus,
    flowId: flowId,
    error: error,
    errorCode: errorCode,
    initiatePaymentFlow: initiatePaymentFlow,
    resumePaymentFlow: resumePaymentFlow,
    cancelPaymentFlow: cancelPaymentFlow,
    plaidLinkToken: _currentPlaidLinkToken, // Expose the stored Plaid Link token
    handlePlaidLinkSuccess: handlePlaidLinkSuccess,
    handlePlaidLinkError: handlePlaidLinkError,
    handlePlaidLinkExit: handlePlaidLinkExit,
  };
}

export default useStripePlaidPaymentFlow;