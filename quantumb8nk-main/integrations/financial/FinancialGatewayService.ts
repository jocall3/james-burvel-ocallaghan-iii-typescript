// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// This file implements a robust and unified service layer for interacting with Stripe, Plaid,
// Modern Treasury, and Citibank APIs. It standardizes all financial data fetching, authentication,
// and transaction management, providing high business value for the 'citibankdemobusiness.dev' owner.
// Adhering to strict project requirements, this service is designed to be self-contained with no
// external dependencies (npm packages) or direct import statements for external libraries.
// All necessary types, helper functions, and a minimalistic HTTP client are implemented within this file.
// Real-world implementations would typically leverage dedicated SDKs for each financial service
// and a robust HTTP client library.

/**
 * Global configuration and constants for the financial gateway service.
 * In a real-world, production-grade application, sensitive keys and URLs would be
 * securely loaded from environment variables or a dedicated secrets management system.
 * The 'citibankdemobusiness.dev' domain serves as the base for internal Citibank routes.
 */
const CONFIG = {
  STRIPE_SECRET_KEY: "sk_test_mock_stripe_key_12345", // Placeholder: Replace with actual Stripe secret key
  STRIPE_API_BASE_URL: "https://api.stripe.com/v1",

  PLAID_CLIENT_ID: "plaid_client_id_mock_67890", // Placeholder: Replace with actual Plaid client ID
  PLAID_SECRET: "plaid_secret_mock_abcde", // Placeholder: Replace with actual Plaid secret
  PLAID_API_BASE_URL: "https://sandbox.plaid.com", // Using sandbox environment for demonstration

  MODERN_TREASURY_ORGANIZATION_ID: "mt_org_id_mock_fghij", // Placeholder: Replace with actual Modern Treasury Org ID
  MODERN_TREASURY_API_KEY: "mt_api_key_mock_klmno", // Placeholder: Replace with actual Modern Treasury API key
  MODERN_TREASURY_API_BASE_URL: "https://api.moderntreasury.com",

  CITIBANK_API_KEY: "citi_api_key_mock_pqrst", // Placeholder: Replace with actual Citibank API key for internal services
  CITIBANK_API_BASE_URL: "https://api.citibankdemobusiness.dev/v1", // Internal API endpoint for Citibank Demo Business

  OWNER_BASE_URL: "https://citibankdemobusiness.dev", // The foundational domain for all routes owned by the business
};

/**
 * Custom Error Classes for providing structured, readable, and actionable error responses.
 * These errors enhance debugging and allow for targeted error handling logic within the application.
 */
class FinancialGatewayError extends Error {
  public readonly code: string;
  public readonly details?: object;
  public readonly originalError?: Error;

  constructor(message: string, code: string, details?: object, originalError?: Error) {
    super(message);
    this.name = "FinancialGatewayError";
    this.code = code;
    this.details = details;
    this.originalError = originalError;
    // Maintains proper prototype chain for 'instanceof' checks
    Object.setPrototypeOf(this, FinancialGatewayError.prototype);
  }
}

class StripeError extends FinancialGatewayError {
  constructor(message: string, details?: object, originalError?: Error) {
    super(message, "STRIPE_ERROR", details, originalError);
    this.name = "StripeError";
    Object.setPrototypeOf(this, StripeError.prototype);
  }
}

class PlaidError extends FinancialGatewayError {
  constructor(message: string, details?: object, originalError?: Error) {
    super(message, "PLAID_ERROR", details, originalError);
    this.name = "PlaidError";
    Object.setPrototypeOf(this, PlaidError.prototype);
  }
}

class ModernTreasuryError extends FinancialGatewayError {
  constructor(message: string, details?: object, originalError?: Error) {
    super(message, "MODERN_TREASURY_ERROR", details, originalError);
    this.name = "ModernTreasuryError";
    Object.setPrototypeOf(this, ModernTreasuryError.prototype);
  }
}

class CitibankError extends FinancialGatewayError {
  constructor(message: string, details?: object, originalError?: Error) {
    super(message, "CITIBANK_ERROR", details, originalError);
    this.name = "CitibankError";
    Object.setPrototypeOf(this, CitibankError.prototype);
  }
}

class ValidationError extends FinancialGatewayError {
  constructor(message: string, details?: object) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Minimalist HTTP Client implementation, designed to strictly adhere to the "no dependencies" rule.
 * This helper function simulates the behavior of 'fetch' and provides basic response parsing and error handling.
 * In a professional environment, this would be replaced by a battle-tested library like 'axios' or 'node-fetch'.
 */
interface HttpResponse<T> extends Response {
  readonly parsedBody?: T;
}

/**
 * Executes an HTTP request using the global `fetch` API.
 * Includes basic JSON parsing and error detection for HTTP status codes.
 * @param request The URL or Request object.
 * @param init Optional RequestInit object for configuring the request.
 * @returns A Promise that resolves to an HttpResponse with a parsed body.
 * @throws FinancialGatewayError for network issues or non-2xx responses.
 */
async function http<T>(
  request: RequestInfo,
  init?: RequestInit,
): Promise<HttpResponse<T>> {
  try {
    const response: HttpResponse<T> = await fetch(request, init);

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      response.parsedBody = await response.json();
    } else {
      // Fallback: Attempt to parse as text if not JSON. Useful for simple string responses.
      const textBody = await response.text();
      response.parsedBody = (textBody ? textBody : undefined) as unknown as T;
    }

    if (!response.ok) {
      const errorDetails = response.parsedBody || { message: response.statusText, status: response.status };
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`, { cause: errorDetails });
    }

    return response;
  } catch (error) {
    // Distinguish network errors from application-level HTTP errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new FinancialGatewayError(
        "Network error or CORS issue. Please check connectivity and API reachability.",
        "NETWORK_ERROR",
        { originalErrorMessage: error.message },
        error
      );
    }
    const errorCause = (error as any).cause;
    if (errorCause && typeof errorCause === 'object' && errorCause.message) {
      throw new FinancialGatewayError(
        `Request to external API failed: ${errorCause.message}`,
        "EXTERNAL_API_REQUEST_FAILED",
        errorCause,
        error as Error
      );
    }
    throw new FinancialGatewayError(
      `An unexpected HTTP client error occurred: ${(error as Error).message}`,
      "UNEXPECTED_HTTP_CLIENT_ERROR",
      { originalErrorMessage: (error as Error).message },
      error as Error
    );
  }
}

/**
 * Interface definitions for standardizing financial data across various providers.
 * These types provide a common language and structure for entities like transactions,
 * accounts, and payment methods, facilitating unified processing.
 */

// Common Enums for Financial Operations
enum TransactionType {
  CREDIT = "credit",
  DEBIT = "debit",
  TRANSFER = "transfer",
  PAYMENT = "payment",
  FEE = "fee",
  REFUND = "refund",
  ADJUSTMENT = "adjustment",
}

enum TransactionStatus {
  PENDING = "pending",
  POSTED = "posted",
  FAILED = "failed",
  CANCELLED = "cancelled",
  SETTLED = "settled",
  PROCESSING = "processing",
  REVERSED = "reversed",
}

enum PaymentIntentStatus {
  REQUIRES_PAYMENT_METHOD = "requires_payment_method",
  REQUIRES_CONFIRMATION = "requires_confirmation",
  REQUIRES_ACTION = "requires_action",
  PROCESSING = "processing",
  SUCCEEDED = "succeeded",
  CANCELED = "canceled",
  FAILED = "failed",
}

enum ModernTreasuryPaymentOrderType {
  ACH = "ach",
  WIRE = "wire",
  BOOK = "book",
  SEPA = "sepa",
  RTP = "rtp",
  SWIFT = "swift",
  SEN = "sen", // Signature Exempt Network
}

enum ModernTreasuryPaymentOrderStatus {
  PENDING = "pending",
  APPROVED = "approved",
  COMPLETED = "completed",
  RETURNED = "returned",
  CANCELLED = "cancelled",
  DENIED = "denied",
  PROCESSING = "processing",
}

// Unified Financial Entity Interfaces
interface FinancialTransaction {
  id: string;
  accountId: string;
  amount: number; // Stored in base units (e.g., cents for USD) to avoid floating point issues
  currency: string; // ISO 4217 currency code (e.g., "USD")
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  date: string; // ISO 8601 date string (YYYY-MM-DD)
  postedDate?: string; // Optional: date when the transaction was officially posted
  source: "Plaid" | "Stripe" | "ModernTreasury" | "Citibank" | "Manual"; // Origin of the transaction data
  category?: string[]; // Categorization from source (e.g., Plaid)
  metadata?: Record<string, unknown>; // Additional arbitrary key-value data
}

interface FinancialAccount {
  id: string;
  name: string;
  mask?: string; // Last 4 digits of account number for display
  officialName?: string; // Official name from institution
  subtype: "checking" | "savings" | "credit card" | "loan" | "brokerage" | "investment" | "line of credit" | "other";
  type: "depository" | "credit" | "loan" | "investment" | "brokerage" | "other";
  currentBalance: number; // Current ledger balance
  availableBalance?: number; // Balance available for spending (e.g., excludes holds)
  currency: string;
  institutionId?: string; // Identifier for the financial institution
  institutionName?: string; // Name of the financial institution
  createdAt?: string; // ISO 8601 creation date
  lastUpdated?: string; // ISO 8601 last update date
  source: "Plaid" | "Citibank" | "ModernTreasury" | "Manual"; // Origin of the account data
  metadata?: Record<string, unknown>;
}

interface FinancialPaymentMethod {
  id: string;
  type: "card" | "bank_account" | "digital_wallet" | "other";
  details: Record<string, unknown>; // Contains specific details like card last 4, bank account number, etc.
  customerId?: string; // Associated customer ID in the gateway (e.g., Stripe Customer ID)
  fingerprint?: string; // A unique, reusable identifier for the payment method across systems
  billingDetails?: {
    name?: string;
    email?: string;
    address?: { line1?: string; city?: string; state?: string; postal_code?: string; country?: string; };
  };
  createdAt?: string; // ISO 8601 creation date
  metadata?: Record<string, unknown>;
  isDefault?: boolean;
}

interface CustomerInfo {
  id: string;
  name?: string;
  email?: string;
  description?: string;
  createdAt?: string; // ISO 8601 creation date
  metadata?: Record<string, unknown>;
}

// Unified Payment Intent Request/Response
interface CreatePaymentIntentRequest {
  amount: number; // In base units
  currency: string;
  description?: string;
  customerId?: string; // Gateway's customer ID
  paymentMethodId?: string; // Gateway's payment method ID
  captureMethod?: "automatic" | "manual"; // How funds are captured
  confirmationMethod?: "automatic" | "manual"; // How confirmation is handled (e.g., client-side 3DS)
  returnUrl?: string; // URL for redirect after 3DS, etc.
  metadata?: Record<string, unknown>;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  description?: string;
  customerId?: string;
  paymentMethodId?: string;
  clientSecret?: string; // For client-side confirmation (e.g., Stripe.js)
  nextAction?: Record<string, unknown>; // Details for required next steps (e.g., 3DS URL)
  metadata?: Record<string, unknown>;
  createdAt: string; // ISO 8601 date string
  updatedAt?: string; // ISO 8601 date string
  gateway: "Stripe" | "ModernTreasury" | "Citibank"; // Indicates which gateway processed it
}

// Plaid Specific Types (simplified for integration)
interface PlaidLinkTokenCreateRequest {
  userId: string; // Internal user ID
  products: Array<"auth" | "transactions" | "identity" | "investments" | "liabilities" | "payments">;
  countryCodes: string[]; // e.g., ["US", "CA"]
  language: string; // e.g., "en"
  webhook?: string; // URL for receiving webhook events
  redirectUri?: string; // For OAuth flows
  clientName?: string; // Name of the application
}

interface PlaidLinkTokenCreateResponse {
  linkToken: string;
  expiration: string; // ISO 8601 datetime
  requestId: string;
}

interface PlaidExchangePublicTokenRequest {
  publicToken: string;
}

interface PlaidExchangePublicTokenResponse {
  accessToken: string;
  itemId: string;
  requestId: string;
}

interface PlaidAccount {
  account_id: string;
  mask: string | null;
  name: string;
  official_name: string | null;
  subtype: string;
  type: string; // e.g., "depository", "credit"
  balances: {
    current: number;
    available: number | null;
    iso_currency_code: string | null;
    limit: number | null;
  };
  persisted_as_financial_account?: FinancialAccount; // Reference to unified type
}

interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number; // Plaid amounts can be positive (debits) or negative (credits)
  iso_currency_code: string | null;
  date: string; // YYYY-MM-DD
  authorized_date: string | null; // YYYY-MM-DD
  name: string;
  merchant_name: string | null;
  pending: boolean;
  category: string[] | null;
  category_id: string | null;
  transaction_type: "digital" | "place" | "special" | null;
  payment_channel: "online" | "in store" | "other" | null;
  logo_url: string | null;
  website: string | null;
  personal_finance_category: {
    primary: string;
    detailed: string;
    confidence_level: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | null;
  } | null;
}

// Modern Treasury Specific Types (simplified)
interface ModernTreasuryExternalAccount {
  id: string;
  account_type: "checking" | "savings" | "other";
  account_number: string;
  routing_number: string;
  account_holder_name: string;
  currency: string;
  party_name: string; // Name of the bank
  metadata?: Record<string, unknown>;
}

interface ModernTreasuryInternalAccount {
  id: string;
  account_type: "checking" | "savings";
  account_number: string;
  routing_number: string;
  party_name: string;
  currency: string;
  bank_name: string;
  ledger_account_id?: string;
  metadata?: Record<string, unknown>;
}

interface ModernTreasuryPaymentOrderRequest {
  amount: number; // In cents
  currency: string;
  direction: "credit" | "debit";
  originating_account_id: string; // Modern Treasury Internal Account ID
  receiving_account_id: string; // Modern Treasury External Account ID
  type: ModernTreasuryPaymentOrderType;
  description?: string;
  priority?: "high" | "normal";
  send_remittance_advice?: boolean; // Whether to send an email to the counterparty
  remittance_information?: string;
  statement_descriptor?: string; // Appears on the bank statement
  metadata?: Record<string, unknown>;
}

interface ModernTreasuryPaymentOrder {
  id: string;
  amount: number;
  currency: string;
  direction: "credit" | "debit";
  status: ModernTreasuryPaymentOrderStatus;
  type: ModernTreasuryPaymentOrderType;
  description?: string;
  createdAt: string;
  updatedAt: string;
  processed_at?: string;
  metadata?: Record<string, unknown>;
}

interface ModernTreasuryExpectedPaymentRequest {
  amount_lower_bound?: number; // In cents
  amount_upper_bound?: number; // In cents
  currency: string;
  direction: "credit" | "debit";
  description: string;
  counterparty_id: string; // Modern Treasury Counterparty ID
  type: ModernTreasuryPaymentOrderType;
  internal_account_id: string; // Modern Treasury Internal Account ID
  expected_date: string; // YYYY-MM-DD
  metadata?: Record<string, unknown>;
  statement_descriptor?: string;
  // Many more fields like remittance_information, originators, etc.
}

interface ModernTreasuryExpectedPayment {
  id: string;
  amount_lower_bound: number | null;
  amount_upper_bound: number | null;
  currency: string;
  description: string;
  status: "pending" | "reconciled" | "archived" | "cancelled";
  internal_account_id: string;
  expected_date: string; // YYYY-MM-DD
  type: ModernTreasuryPaymentOrderType;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Citibank Demo Business API Specific Types (simplified)
interface CitibankWireTransferRequest {
  fromAccountId: string; // Internal Citibank account ID
  toAccountNumber: string;
  toRoutingNumber?: string; // For US wires (ABA)
  toSwiftCode?: string; // For international wires (BIC)
  toBankName: string;
  toAccountHolderName: string;
  amount: number; // In base units
  currency: string;
  reference: string; // Payment reference or description
  purposeCode?: string; // E.g., ISO 20022 purpose codes
  remittanceInformation?: string;
  metadata?: Record<string, unknown>;
}

interface CitibankWireTransferResponse {
  transferId: string;
  status: "initiated" | "pending" | "completed" | "failed" | "rejected";
  initiationTime: string; // ISO 8601
  amount: number;
  currency: string;
  feeAmount?: number;
  confirmationCode?: string;
  metadata?: Record<string, unknown>;
}

interface CitibankAccountBalance {
  accountId: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
  lastUpdated: string; // ISO 8601
}

interface CitibankStatementEntry {
  transactionId: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // Debit amounts are typically negative, credits positive here.
  currency: string;
  type: "DEBIT" | "CREDIT";
  balanceAfterTransaction: number;
  referenceNumber?: string;
  category?: string;
}

interface CitibankVirtualCardRequest {
  fundingAccountId: string; // Internal Citibank account ID for funding
  cardHolderName: string;
  spendingLimit: number; // Maximum amount that can be spent
  currency: string;
  expirationDate: string; // YYYY-MM-DD, e.g., "2025-12-31"
  usageRestrictions?: {
    singleUse?: boolean;
    merchantId?: string;
    merchantCategoryCode?: string;
    maxTransactions?: number;
  };
  metadata?: Record<string, unknown>;
}

interface CitibankVirtualCard {
  cardId: string;
  last4: string;
  fullCardNumber?: string; // Only returned on creation for security reasons
  expirationMonth: string; // MM format
  expirationYear: string; // YYYY format
  cvv: string; // Only returned on creation
  status: "active" | "inactive" | "suspended" | "canceled";
  spendingLimit: number;
  currentSpend: number;
  currency: string;
  fundingAccountId: string;
  createdAt: string; // ISO 8601
  activatedAt?: string;
  metadata?: Record<string, unknown>;
}

/**
 * The core FinancialGatewayService class.
 * This class orchestrates interactions with various financial APIs, providing a unified interface
 * for common operations like payments, account information, and transaction management.
 * All API calls are simulated using the internal `http` function to adhere to the "no dependencies" rule.
 */
class FinancialGatewayService {
  private readonly stripeSecretKey: string;
  private readonly stripeApiBaseUrl: string;
  private readonly plaidClientId: string;
  private readonly plaidSecret: string;
  private readonly plaidApiBaseUrl: string;
  private readonly modernTreasuryOrgId: string;
  private readonly modernTreasuryApiKey: string;
  private readonly modernTreasuryApiBaseUrl: string;
  private readonly citibankApiKey: string;
  private readonly citibankApiBaseUrl: string;
  private readonly ownerBaseUrl: string;

  constructor() {
    // Initialize API keys and base URLs from the global CONFIG object.
    // In a production environment, these would typically be securely injected
    // through environment variables or a secrets manager.
    this.stripeSecretKey = CONFIG.STRIPE_SECRET_KEY;
    this.stripeApiBaseUrl = CONFIG.STRIPE_API_BASE_URL;
    this.plaidClientId = CONFIG.PLAID_CLIENT_ID;
    this.plaidSecret = CONFIG.PLAID_SECRET;
    this.plaidApiBaseUrl = CONFIG.PLAID_API_BASE_URL;
    this.modernTreasuryOrgId = CONFIG.MODERN_TREASURY_ORGANIZATION_ID;
    this.modernTreasuryApiKey = CONFIG.MODERN_TREASURY_API_KEY;
    this.modernTreasuryApiBaseUrl = CONFIG.MODERN_TREASURY_API_BASE_URL;
    this.citibankApiKey = CONFIG.CITIBANK_API_KEY;
    this.citibankApiBaseUrl = CONFIG.CITIBANK_API_BASE_URL;
    this.ownerBaseUrl = CONFIG.OWNER_BASE_URL;

    // Perform basic validation of configuration to alert developers to missing critical settings.
    this.validateConfiguration();
  }

  /**
   * Internal method to check if essential API configurations are present.
   * Logs warnings if critical keys or URLs are missing, indicating potential service limitations.
   */
  private validateConfiguration(): void {
    if (!this.stripeSecretKey || !this.stripeApiBaseUrl || this.stripeSecretKey.includes("mock")) {
      console.warn("Stripe configuration incomplete or using mock keys. Stripe features may be unavailable.");
    }
    if (!this.plaidClientId || !this.plaidSecret || !this.plaidApiBaseUrl || this.plaidSecret.includes("mock")) {
      console.warn("Plaid configuration incomplete or using mock keys. Plaid features may be unavailable.");
    }
    if (!this.modernTreasuryOrgId || !this.modernTreasuryApiKey || !this.modernTreasuryApiBaseUrl || this.modernTreasuryApiKey.includes("mock")) {
      console.warn("Modern Treasury configuration incomplete or using mock keys. Modern Treasury features may be unavailable.");
    }
    if (!this.citibankApiKey || !this.citibankApiBaseUrl || this.citibankApiKey.includes("mock")) {
      console.warn("Citibank configuration incomplete or using mock keys. Citibank features may be unavailable.");
    }
    if (!this.ownerBaseUrl || !this.ownerBaseUrl.includes("citibankdemobusiness.dev")) {
      console.warn("Owner Base URL is not correctly set. Internal URL generation and branding might be impacted.");
    }
  }

  /**
   * Utility to encode a string to base64, primarily for Basic Authentication.
   * This is a simple implementation to adhere to the "no dependencies" rule.
   * In Node.js, `Buffer.from(input).toString('base64')` would be used.
   */
  private base64Encode(input: string): string {
    // Check if Buffer is available (Node.js environment)
    if (typeof Buffer !== 'undefined' && Buffer.from) {
      return Buffer.from(input).toString('base64');
    }
    // Fallback for browser-like environments or where Buffer isn't globally available
    if (typeof globalThis.btoa === 'function') {
      return globalThis.btoa(input);
    }
    // A rudimentary polyfill for extremely constrained environments (not recommended for production)
    // This polyfill is NOT robust for all character sets and primarily serves the "no imports" constraint.
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = String(input);
    let output = '';
    let i = 0;
    let a, b, c, d, e, f;

    do {
      a = str.charCodeAt(i++);
      b = str.charCodeAt(i++);
      c = str.charCodeAt(i++);

      e = a >> 2;
      f = ((a & 3) << 4) | (b >> 4);
      d = ((b & 15) << 2) | (c >> 6);
      e = c & 63;

      if (isNaN(b)) {
        d = e = 64;
      } else if (isNaN(c)) {
        e = 64;
      }

      output += chars.charAt(e) + chars.charAt(f) + chars.charAt(d) + chars.charAt(e);
    } while (i < str.length);

    return output;
  }

  // --- Stripe Integration ---

  /**
   * Creates a new Stripe Payment Intent, representing the intent to collect payment.
   * This is the first step in a payment flow, before a payment method is confirmed.
   * @param request - `CreatePaymentIntentRequest` containing payment details.
   * @returns A promise resolving to the created `PaymentIntent`.
   * @throws `StripeError` on API failure or `ValidationError` for missing parameters.
   */
  public async createStripePaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    if (!request.amount || !request.currency) {
      throw new ValidationError("Amount and currency are essential for creating a Stripe Payment Intent.");
    }
    try {
      const bodyParams = new URLSearchParams({
        amount: request.amount.toString(),
        currency: request.currency,
        ...(request.customerId && { customer: request.customerId }),
        ...(request.paymentMethodId && { payment_method: request.paymentMethodId }),
        ...(request.captureMethod && { capture_method: request.captureMethod }),
        ...(request.confirmationMethod && { confirmation_method: request.confirmationMethod }),
        ...(request.returnUrl && { return_url: request.returnUrl }),
        ...(request.description && { description: request.description }),
        ...(request.metadata && { metadata: JSON.stringify(request.metadata) }),
      });

      const response = await http<{
        id: string; amount: number; currency: string; status: PaymentIntentStatus;
        customer?: string; payment_method?: string; client_secret?: string; next_action?: object;
        description?: string; metadata?: Record<string, unknown>; created: number;
        last_payment_error?: object;
      }>(`${this.stripeApiBaseUrl}/payment_intents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.stripeSecretKey}`,
        },
        body: bodyParams.toString(),
      });

      const data = response.parsedBody!;
      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        description: data.description,
        customerId: data.customer,
        paymentMethodId: data.payment_method,
        clientSecret: data.client_secret,
        nextAction: data.next_action,
        metadata: data.metadata,
        createdAt: new Date(data.created * 1000).toISOString(),
        gateway: "Stripe",
      };
    } catch (error) {
      const errorMessage = `Failed to create Stripe Payment Intent: ${(error as Error).message}`;
      console.error(errorMessage, { originalError: error });
      throw new StripeError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Confirms an existing Stripe Payment Intent, typically after a payment method has been attached.
   * This step finalizes the payment attempt.
   * @param paymentIntentId - The ID of the Payment Intent to confirm.
   * @param paymentMethodId - The ID of the payment method to use for confirmation.
   * @param setupFutureUsage - Optional: Indicates if the payment method should be saved for future use.
   * @returns A promise resolving to the confirmed `PaymentIntent`.
   * @throws `StripeError` on API failure.
   */
  public async confirmStripePaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string, // Optional, if PM is already attached to PI
    setupFutureUsage?: "off_session" | "on_session",
    returnUrl?: string
  ): Promise<PaymentIntent> {
    if (!paymentIntentId) {
      throw new ValidationError("Payment Intent ID is required for confirmation.");
    }
    const bodyParams = new URLSearchParams({
      ...(paymentMethodId && { payment_method: paymentMethodId }),
      ...(setupFutureUsage && { setup_future_usage: setupFutureUsage }),
      ...(returnUrl && { return_url: returnUrl }),
    });

    try {
      const response = await http<{
        id: string; amount: number; currency: string; status: PaymentIntentStatus;
        customer?: string; payment_method?: string; client_secret?: string; next_action?: object;
        description?: string; metadata?: Record<string, unknown>; created: number;
      }>(`${this.stripeApiBaseUrl}/payment_intents/${paymentIntentId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.stripeSecretKey}`,
        },
        body: bodyParams.toString(),
      });

      const data = response.parsedBody!;
      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        description: data.description,
        customerId: data.customer,
        paymentMethodId: data.payment_method,
        clientSecret: data.client_secret,
        nextAction: data.next_action,
        metadata: data.metadata,
        createdAt: new Date(data.created * 1000).toISOString(),
        gateway: "Stripe",
      };
    } catch (error) {
      const errorMessage = `Failed to confirm Stripe Payment Intent ${paymentIntentId}: ${(error as Error).message}`;
      console.error(errorMessage, { paymentIntentId, originalError: error });
      throw new StripeError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Retrieves a Stripe Payment Intent by its unique identifier.
   * @param paymentIntentId - The ID of the Payment Intent to retrieve.
   * @returns A promise resolving to the `PaymentIntent`.
   * @throws `StripeError` on API failure.
   */
  public async retrieveStripePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    if (!paymentIntentId) {
      throw new ValidationError("Payment Intent ID is required for retrieval.");
    }
    try {
      const response = await http<{
        id: string; amount: number; currency: string; status: PaymentIntentStatus;
        customer?: string; payment_method?: string; client_secret?: string; next_action?: object;
        description?: string; metadata?: Record<string, unknown>; created: number;
      }>(`${this.stripeApiBaseUrl}/payment_intents/${paymentIntentId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${this.stripeSecretKey}` },
      });

      const data = response.parsedBody!;
      return {
        id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        description: data.description,
        customerId: data.customer,
        paymentMethodId: data.payment_method,
        clientSecret: data.client_secret,
        nextAction: data.next_action,
        metadata: data.metadata,
        createdAt: new Date(data.created * 1000).toISOString(),
        gateway: "Stripe",
      };
    } catch (error) {
      const errorMessage = `Failed to retrieve Stripe Payment Intent ${paymentIntentId}: ${(error as Error).message}`;
      console.error(errorMessage, { paymentIntentId, originalError: error });
      throw new StripeError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Creates a new Stripe customer record.
   * Customers are reusable entities to associate payments and payment methods.
   * @param email - The customer's email address.
   * @param name - Optional: The customer's full name.
   * @param description - Optional: A descriptive string for the customer.
   * @param metadata - Optional: Custom key-value pairs to store with the customer.
   * @returns A promise resolving to the created `CustomerInfo`.
   * @throws `StripeError` on API failure or `ValidationError` for missing email.
   */
  public async createStripeCustomer(
    email: string,
    name?: string,
    description?: string,
    metadata?: Record<string, unknown>
  ): Promise<CustomerInfo> {
    if (!email) {
      throw new ValidationError("Customer email is a mandatory field for creating a Stripe customer.");
    }
    const bodyParams = new URLSearchParams({
      email: email,
      ...(name && { name: name }),
      ...(description && { description: description }),
      ...(metadata && { metadata: JSON.stringify(metadata) }),
    });

    try {
      const response = await http<{
        id: string; email: string; name: string | null; description: string | null;
        metadata: Record<string, unknown>; created: number;
      }>(`${this.stripeApiBaseUrl}/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.stripeSecretKey}`,
        },
        body: bodyParams.toString(),
      });

      const data = response.parsedBody!;
      return {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        description: data.description || undefined,
        metadata: data.metadata,
        createdAt: new Date(data.created * 1000).toISOString(),
      };
    } catch (error) {
      const errorMessage = `Failed to create Stripe customer with email ${email}: ${(error as Error).message}`;
      console.error(errorMessage, { email, originalError: error });
      throw new StripeError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Attaches a Stripe Payment Method to a specified Stripe Customer.
   * This enables the customer to reuse the payment method for future transactions.
   * @param customerId - The ID of the Stripe customer.
   * @param paymentMethodId - The ID of the Stripe Payment Method (e.g., card, bank account).
   * @returns A promise resolving to a `FinancialPaymentMethod` representing the attached method.
   * @throws `StripeError` on API failure or `ValidationError` for missing IDs.
   */
  public async attachStripePaymentMethodToCustomer(
    customerId: string,
    paymentMethodId: string
  ): Promise<FinancialPaymentMethod> {
    if (!customerId || !paymentMethodId) {
      throw new ValidationError("Both Customer ID and Payment Method ID are required for attachment.");
    }
    const bodyParams = new URLSearchParams({
      customer: customerId,
    });

    try {
      const response = await http<{
        id: string; type: string; customer: string; created: number;
        card?: { last4: string; brand: string; exp_month: number; exp_year: number; country: string; };
        billing_details?: { email?: string; name?: string; address?: object; };
        us_bank_account?: { last4: string; bank_name: string; account_holder_type: string; account_type: string; };
        metadata?: Record<string, unknown>;
      }>(`${this.stripeApiBaseUrl}/payment_methods/${paymentMethodId}/attach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.stripeSecretKey}`,
        },
        body: bodyParams.toString(),
      });

      const data = response.parsedBody!;
      let paymentMethodDetails: Record<string, unknown> = {};
      let paymentMethodType: FinancialPaymentMethod["type"] = "other";

      if (data.card) {
        paymentMethodType = "card";
        paymentMethodDetails = {
          last4: data.card.last4,
          brand: data.card.brand,
          expMonth: data.card.exp_month,
          expYear: data.card.exp_year,
          country: data.card.country,
        };
      } else if (data.us_bank_account) {
        paymentMethodType = "bank_account";
        paymentMethodDetails = {
          last4: data.us_bank_account.last4,
          bankName: data.us_bank_account.bank_name,
          accountType: data.us_bank_account.account_type,
          accountHolderType: data.us_bank_account.account_holder_type,
        };
      }
      // Expand this mapping for other Stripe payment method types as needed

      return {
        id: data.id,
        type: paymentMethodType,
        details: paymentMethodDetails,
        customerId: data.customer,
        billingDetails: data.billing_details ? {
          name: data.billing_details.name || undefined,
          email: data.billing_details.email || undefined,
          address: data.billing_details.address as FinancialPaymentMethod["billingDetails"]["address"] || undefined,
        } : undefined,
        metadata: data.metadata,
        createdAt: new Date(data.created * 1000).toISOString(),
      };
    } catch (error) {
      const errorMessage = `Failed to attach Stripe Payment Method ${paymentMethodId} to customer ${customerId}: ${(error as Error).message}`;
      console.error(errorMessage, { customerId, paymentMethodId, originalError: error });
      throw new StripeError(errorMessage, (error as any).cause, error as Error);
    }
  }

  // --- Plaid Integration ---

  /**
   * Creates a Plaid Link Token, which is a short-lived, one-time token used to initialize Plaid Link
   * on the client-side, enabling users to securely connect their bank accounts.
   * @param request - `PlaidLinkTokenCreateRequest` containing user and product details.
   * @returns A promise resolving to `PlaidLinkTokenCreateResponse`.
   * @throws `PlaidError` on API failure or `ValidationError` for missing parameters.
   */
  public async createPlaidLinkToken(request: PlaidLinkTokenCreateRequest): Promise<PlaidLinkTokenCreateResponse> {
    if (!request.userId || !request.products || request.products.length === 0 ||
        !request.countryCodes || request.countryCodes.length === 0 || !request.language) {
      throw new ValidationError("User ID, products, country codes, and language are required for Plaid Link Token creation.");
    }
    try {
      const response = await http<PlaidLinkTokenCreateResponse>(`${this.plaidApiBaseUrl}/link/token/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.plaidClientId,
          secret: this.plaidSecret,
          user: { client_user_id: request.userId },
          products: request.products,
          country_codes: request.countryCodes,
          language: request.language,
          client_name: request.clientName || this.ownerBaseUrl.replace("https://", "").split('.')[0], // Use base URL as client name
          ...(request.webhook && { webhook: request.webhook }),
          ...(request.redirectUri && { redirect_uri: request.redirectUri }),
        }),
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to create Plaid Link Token for user ${request.userId}: ${(error as Error).message}`;
      console.error(errorMessage, { userId: request.userId, originalError: error });
      throw new PlaidError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Exchanges a Plaid Public Token (obtained from the client-side after a successful Link flow)
   * for a persistent Access Token. This Access Token is then used for subsequent API calls
   * to fetch account data for that linked Item.
   * @param request - `PlaidExchangePublicTokenRequest` containing the public token.
   * @returns A promise resolving to `PlaidExchangePublicTokenResponse` with the access token.
   * @throws `PlaidError` on API failure or `ValidationError` for missing public token.
   */
  public async exchangePlaidPublicToken(request: PlaidExchangePublicTokenRequest): Promise<PlaidExchangePublicTokenResponse> {
    if (!request.publicToken) {
      throw new ValidationError("Public token is required for exchange.");
    }
    try {
      const response = await http<PlaidExchangePublicTokenResponse>(`${this.plaidApiBaseUrl}/item/public_token/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.plaidClientId,
          secret: this.plaidSecret,
          public_token: request.publicToken,
        }),
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to exchange Plaid Public Token: ${(error as Error).message}`;
      console.error(errorMessage, { originalError: error });
      throw new PlaidError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Retrieves detailed account information for a given Plaid Item using its access token.
   * @param accessToken - The Plaid access token for the Item.
   * @returns A promise resolving to an array of `PlaidAccount` objects.
   * @throws `PlaidError` on API failure or `ValidationError` for missing access token.
   */
  public async getPlaidAccounts(accessToken: string): Promise<PlaidAccount[]> {
    if (!accessToken) {
      throw new ValidationError("Access token is required to retrieve Plaid accounts.");
    }
    try {
      const response = await http<{ accounts: PlaidAccount[]; item: object }>(`${this.plaidApiBaseUrl}/accounts/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.plaidClientId,
          secret: this.plaidSecret,
          access_token: accessToken,
        }),
      });
      return response.parsedBody!.accounts;
    } catch (error) {
      const errorMessage = `Failed to retrieve Plaid accounts: ${(error as Error).message}`;
      console.error(errorMessage, { originalError: error });
      throw new PlaidError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Fetches transaction history for a Plaid Item within a specified date range.
   * @param accessToken - The Plaid access token for the Item.
   * @param startDate - The start date for transactions (YYYY-MM-DD).
   * @param endDate - The end date for transactions (YYYY-MM-DD).
   * @param options - Optional parameters like specific account IDs, pagination (count, offset).
   * @returns A promise resolving to an array of `PlaidTransaction` objects.
   * @throws `PlaidError` on API failure or `ValidationError` for missing parameters.
   */
  public async getPlaidTransactions(
    accessToken: string,
    startDate: string,
    endDate: string,
    options?: { accountIds?: string[]; count?: number; offset?: number; }
  ): Promise<PlaidTransaction[]> {
    if (!accessToken || !startDate || !endDate) {
      throw new ValidationError("Access token, start date, and end date are required for Plaid transactions.");
    }
    try {
      const response = await http<{ transactions: PlaidTransaction[]; accounts: PlaidAccount[]; total_transactions: number }>(`${this.plaidApiBaseUrl}/transactions/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.plaidClientId,
          secret: this.plaidSecret,
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          options: {
            ...(options?.accountIds && { account_ids: options.accountIds }),
            count: options?.count || 250, // Default to a reasonable limit
            offset: options?.offset || 0,
            include_personal_finance_category: true, // Request PFM categories
            include_original_description: true,
          },
        }),
      });
      return response.parsedBody!.transactions;
    } catch (error) {
      const errorMessage = `Failed to retrieve Plaid transactions: ${(error as Error).message}`;
      console.error(errorMessage, { originalError: error });
      throw new PlaidError(errorMessage, (error as any).cause, error as Error);
    }
  }

  // --- Modern Treasury Integration ---

  /**
   * Creates a payment order in Modern Treasury. Payment orders represent a single instruction
   * to move money between an internal account (your bank account) and an external account (counterparty's bank account).
   * @param request - `ModernTreasuryPaymentOrderRequest` detailing the payment.
   * @returns A promise resolving to the created `ModernTreasuryPaymentOrder`.
   * @throws `ModernTreasuryError` on API failure or `ValidationError` for missing parameters.
   */
  public async createModernTreasuryPaymentOrder(request: ModernTreasuryPaymentOrderRequest): Promise<ModernTreasuryPaymentOrder> {
    if (!request.amount || !request.currency || !request.direction || !request.originating_account_id ||
        !request.receiving_account_id || !request.type) {
      throw new ValidationError("Amount, currency, direction, originating/receiving account IDs, and type are all required for a Modern Treasury payment order.");
    }
    try {
      const response = await http<ModernTreasuryPaymentOrder>(`${this.modernTreasuryApiBaseUrl}/api/payment_orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${this.base64Encode(`${this.modernTreasuryOrgId}:${this.modernTreasuryApiKey}`)}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          direction: request.direction,
          originating_account_id: request.originating_account_id,
          receiving_account_id: request.receiving_account_id,
          type: request.type,
          description: request.description,
          priority: request.priority,
          send_remittance_advice: request.send_remittance_advice,
          remittance_information: request.remittance_information,
          statement_descriptor: request.statement_descriptor,
          metadata: request.metadata,
        }),
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to create Modern Treasury Payment Order: ${(error as Error).message}`;
      console.error(errorMessage, { request, originalError: error });
      throw new ModernTreasuryError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Retrieves a specific payment order from Modern Treasury by its ID.
   * @param paymentOrderId - The ID of the payment order.
   * @returns A promise resolving to the `ModernTreasuryPaymentOrder`.
   * @throws `ModernTreasuryError` on API failure or `ValidationError` for missing ID.
   */
  public async retrieveModernTreasuryPaymentOrder(paymentOrderId: string): Promise<ModernTreasuryPaymentOrder> {
    if (!paymentOrderId) {
      throw new ValidationError("Payment Order ID is required for retrieval.");
    }
    try {
      const response = await http<ModernTreasuryPaymentOrder>(`${this.modernTreasuryApiBaseUrl}/api/payment_orders/${paymentOrderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${this.base64Encode(`${this.modernTreasuryOrgId}:${this.modernTreasuryApiKey}`)}`,
        },
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to retrieve Modern Treasury Payment Order ${paymentOrderId}: ${(error as Error).message}`;
      console.error(errorMessage, { paymentOrderId, originalError: error });
      throw new ModernTreasuryError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Lists all external accounts configured within Modern Treasury. These typically represent
   * counterparty bank accounts that your organization sends or receives funds from.
   * @param queryParams - Optional. Parameters for filtering and pagination.
   * @returns A promise resolving to an array of `ModernTreasuryExternalAccount` objects.
   * @throws `ModernTreasuryError` on API failure.
   */
  public async listModernTreasuryExternalAccounts(queryParams?: {
    account_number?: string;
    account_type?: string;
    party_name?: string;
    per_page?: number;
    page?: number;
  }): Promise<ModernTreasuryExternalAccount[]> {
    const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();
    try {
      const response = await http<ModernTreasuryExternalAccount[]>(
        `${this.modernTreasuryApiBaseUrl}/api/external_accounts?${queryString}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${this.base64Encode(`${this.modernTreasuryOrgId}:${this.modernTreasuryApiKey}`)}`,
          },
        }
      );
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to list Modern Treasury External Accounts: ${(error as Error).message}`;
      console.error(errorMessage, { originalError: error });
      throw new ModernTreasuryError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Creates an expected payment entry in Modern Treasury. This is crucial for automated
   * reconciliation, allowing the system to anticipate incoming funds and match them
   * against actual bank statement entries.
   * @param request - `ModernTreasuryExpectedPaymentRequest` detailing the incoming payment.
   * @returns A promise resolving to the created `ModernTreasuryExpectedPayment`.
   * @throws `ModernTreasuryError` on API failure or `ValidationError` for missing parameters.
   */
  public async createModernTreasuryExpectedPayment(request: ModernTreasuryExpectedPaymentRequest): Promise<ModernTreasuryExpectedPayment> {
    if ((!request.amount_lower_bound && !request.amount_upper_bound) || !request.currency || !request.description ||
        !request.direction || !request.counterparty_id || !request.type || !request.internal_account_id || !request.expected_date) {
      throw new ValidationError("Currency, description, direction, counterparty ID, type, internal account ID, expected date, and at least one amount bound are all required for an expected payment.");
    }
    try {
      const response = await http<ModernTreasuryExpectedPayment>(`${this.modernTreasuryApiBaseUrl}/api/expected_payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${this.base64Encode(`${this.modernTreasuryOrgId}:${this.modernTreasuryApiKey}`)}`,
        },
        body: JSON.stringify({
          amount_lower_bound: request.amount_lower_bound,
          amount_upper_bound: request.amount_upper_bound,
          currency: request.currency,
          description: request.description,
          direction: request.direction,
          counterparty_id: request.counterparty_id,
          type: request.type,
          internal_account_id: request.internal_account_id,
          expected_date: request.expected_date,
          metadata: request.metadata,
          statement_descriptor: request.statement_descriptor,
        }),
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to create Modern Treasury Expected Payment: ${(error as Error).message}`;
      console.error(errorMessage, { request, originalError: error });
      throw new ModernTreasuryError(errorMessage, (error as any).cause, error as Error);
    }
  }

  // --- Citibank Demo Business API Integration ---
  // These APIs represent internal banking operations specific to Citibank Demo Business,
  // designed to mirror real-world core banking functionalities.

  /**
   * Initiates a wire transfer through the internal Citibank Demo Business API.
   * This facilitates high-value, irreversible transfers.
   * @param request - `CitibankWireTransferRequest` containing transfer details.
   * @returns A promise resolving to the `CitibankWireTransferResponse`.
   * @throws `CitibankError` on API failure or `ValidationError` for missing parameters.
   */
  public async initiateCitibankWireTransfer(request: CitibankWireTransferRequest): Promise<CitibankWireTransferResponse> {
    if (!request.fromAccountId || !request.toAccountNumber || !request.toAccountHolderName ||
        !request.amount || !request.currency || !request.reference) {
      throw new ValidationError("All core fields (fromAccountId, toAccountNumber, toAccountHolderName, amount, currency, reference) are required for a Citibank wire transfer.");
    }
    try {
      const response = await http<CitibankWireTransferResponse>(`${this.citibankApiBaseUrl}/transfers/wire`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.citibankApiKey,
          "User-Agent": `${this.ownerBaseUrl} FinancialGatewayService`,
        },
        body: JSON.stringify(request),
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to initiate Citibank Wire Transfer from account ${request.fromAccountId}: ${(error as Error).message}`;
      console.error(errorMessage, { fromAccountId: request.fromAccountId, originalError: error });
      throw new CitibankError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Retrieves the current balance for a specified internal Citibank account.
   * @param accountId - The internal ID of the Citibank account.
   * @returns A promise resolving to `CitibankAccountBalance`.
   * @throws `CitibankError` on API failure or `ValidationError` for missing account ID.
   */
  public async getCitibankAccountBalance(accountId: string): Promise<CitibankAccountBalance> {
    if (!accountId) {
      throw new ValidationError("Account ID is required to retrieve Citibank account balance.");
    }
    try {
      const response = await http<CitibankAccountBalance>(`${this.citibankApiBaseUrl}/accounts/${accountId}/balance`, {
        method: "GET",
        headers: {
          "X-Api-Key": this.citibankApiKey,
          "User-Agent": `${this.ownerBaseUrl} FinancialGatewayService`,
        },
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to retrieve Citibank account balance for ${accountId}: ${(error as Error).message}`;
      console.error(errorMessage, { accountId, originalError: error });
      throw new CitibankError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Fetches transaction statements for a Citibank account within a specified date range.
   * This provides a detailed ledger of account activity.
   * @param accountId - The internal ID of the Citibank account.
   * @param startDate - The start date for the statement (YYYY-MM-DD).
   * @param endDate - The end date for the statement (YYYY-MM-DD).
   * @returns A promise resolving to an array of `CitibankStatementEntry`.
   * @throws `CitibankError` on API failure or `ValidationError` for missing parameters.
   */
  public async getCitibankAccountStatement(accountId: string, startDate: string, endDate: string): Promise<CitibankStatementEntry[]> {
    if (!accountId || !startDate || !endDate) {
      throw new ValidationError("Account ID, start date, and end date are required for Citibank statement retrieval.");
    }
    try {
      const url = new URL(`${this.citibankApiBaseUrl}/accounts/${accountId}/statements`);
      url.searchParams.append('startDate', startDate);
      url.searchParams.append('endDate', endDate);

      const response = await http<CitibankStatementEntry[]>(url.toString(), {
        method: "GET",
        headers: {
          "X-Api-Key": this.citibankApiKey,
          "User-Agent": `${this.ownerBaseUrl} FinancialGatewayService`,
        },
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to retrieve Citibank account statement for ${accountId} from ${startDate} to ${endDate}: ${(error as Error).message}`;
      console.error(errorMessage, { accountId, startDate, endDate, originalError: error });
      throw new CitibankError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Creates a virtual credit card linked to a Citibank account. Virtual cards are useful for
   * enhanced security in online transactions, budgeting, and managing subscriptions.
   * @param request - `CitibankVirtualCardRequest` detailing the virtual card properties.
   * @returns A promise resolving to the created `CitibankVirtualCard`.
   * @throws `CitibankError` on API failure or `ValidationError` for missing parameters.
   */
  public async createCitibankVirtualCard(request: CitibankVirtualCardRequest): Promise<CitibankVirtualCard> {
    if (!request.fundingAccountId || !request.cardHolderName || !request.spendingLimit ||
        !request.currency || !request.expirationDate) {
      throw new ValidationError("All core fields are required for creating a Citibank virtual card.");
    }
    try {
      const response = await http<CitibankVirtualCard>(`${this.citibankApiBaseUrl}/cards/virtual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.citibankApiKey,
          "User-Agent": `${this.ownerBaseUrl} FinancialGatewayService`,
        },
        body: JSON.stringify(request),
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to create Citibank Virtual Card for account ${request.fundingAccountId}: ${(error as Error).message}`;
      console.error(errorMessage, { fundingAccountId: request.fundingAccountId, originalError: error });
      throw new CitibankError(errorMessage, (error as any).cause, error as Error);
    }
  }

  /**
   * Retrieves details of a specific virtual card by its ID from Citibank.
   * @param cardId - The unique ID of the virtual card.
   * @returns A promise resolving to the `CitibankVirtualCard` details.
   * @throws `CitibankError` on API failure or `ValidationError` for missing card ID.
   */
  public async getCitibankVirtualCard(cardId: string): Promise<CitibankVirtualCard> {
    if (!cardId) {
      throw new ValidationError("Card ID is required to retrieve Citibank virtual card.");
    }
    try {
      const response = await http<CitibankVirtualCard>(`${this.citibankApiBaseUrl}/cards/virtual/${cardId}`, {
        method: "GET",
        headers: {
          "X-Api-Key": this.citibankApiKey,
          "User-Agent": `${this.ownerBaseUrl} FinancialGatewayService`,
        },
      });
      return response.parsedBody!;
    } catch (error) {
      const errorMessage = `Failed to retrieve Citibank Virtual Card ${cardId}: ${(error as Error).message}`;
      console.error(errorMessage, { cardId, originalError: error });
      throw new CitibankError(errorMessage, (error as any).cause, error as Error);
    }
  }

  // --- Unified Financial Operations ---
  // These methods abstract away the underlying service provider, offering a single,
  // intelligent interface for common financial operations.

  /**
   * Processes a payment through the most appropriate financial gateway (Stripe for cards,
   * Modern Treasury or Citibank for bank transfers/wires). This method implements
   * intelligent routing and standardization of payment requests.
   * @param amount - The payment amount in base units.
   * @param currency - The ISO 4217 currency code.
   * @param paymentMethod - A unified object describing the payment method (type and source ID).
   * @param description - A description for the payment.
   * @param customerReferenceId - Optional: An internal customer identifier to associate with the payment.
   * @returns A promise resolving to a standardized object containing the transaction ID, status, and gateway used.
   * @throws `FinancialGatewayError` if no suitable gateway is found or payment fails.
   */
  public async processUnifiedPayment(
    amount: number,
    currency: string,
    paymentMethod: { type: FinancialPaymentMethod["type"]; sourceId: string; customerId?: string; },
    description?: string,
    customerReferenceId?: string
  ): Promise<{ transactionId: string; status: PaymentIntentStatus | ModernTreasuryPaymentOrderStatus | CitibankWireTransferResponse["status"]; gateway: string }> {
    if (!amount || !currency || !paymentMethod?.type || !paymentMethod?.sourceId) {
      throw new ValidationError("Amount, currency, payment method type, and source ID are all required for unified payment processing.");
    }

    try {
      if (paymentMethod.type === "card") {
        // Route card payments to Stripe
        console.log(`Processing card payment via Stripe for ${amount} ${currency}.`);
        const stripeCustomerId = customerReferenceId || paymentMethod.customerId; // Prioritize internal reference if provided

        const stripePaymentIntent = await this.createStripePaymentIntent({
          amount,
          currency,
          description,
          customerId: stripeCustomerId,
          paymentMethodId: paymentMethod.sourceId,
          captureMethod: "automatic",
          confirmationMethod: "automatic", // For server-side, assume direct confirmation
        });

        // For client-side action (e.g., 3DS), the 'nextAction' and 'clientSecret' would be returned
        // for the client to handle. For a fully server-side flow, it might go directly to 'succeeded' or 'processing'.
        if (stripePaymentIntent.status === PaymentIntentStatus.REQUIRES_ACTION) {
          console.warn(`Stripe Payment Intent ${stripePaymentIntent.id} requires client-side action (e.g., 3DS).`);
          // In a real system, this would trigger a client-side redirect or modal.
          // For now, we'll return its current status.
        }

        return {
          transactionId: stripePaymentIntent.id,
          status: stripePaymentIntent.status,
          gateway: "Stripe",
        };
      } else if (paymentMethod.type === "bank_account") {
        // Route bank account payments to Modern Treasury or Citibank based on context
        // This is a complex routing decision. For demonstration:
        // Assume Modern Treasury for general ACH/wire, Citibank for internal wire transfers.
        // If paymentMethod.sourceId is a Modern Treasury External Account ID:
        if (this.modernTreasuryApiBaseUrl && paymentMethod.sourceId.startsWith("ea_")) { // Modern Treasury external account ID prefix
          console.log(`Processing bank payment via Modern Treasury for ${amount} ${currency}.`);

          // For unified payment, we assume an outgoing debit from our internal MT account.
          // `defaultOriginatingMTAccountId` must be configured for the MT integration.
          const defaultOriginatingMTAccountId = "ia_YOUR_DEFAULT_INTERNAL_ACCOUNT_ID"; // **IMPORTANT: Replace with an actual Modern Treasury Internal Account ID**
          if (defaultOriginatingMTAccountId.includes("YOUR_DEFAULT_INTERNAL_ACCOUNT_ID")) {
            throw new FinancialGatewayError("Modern Treasury originating account ID not configured for unified payment.", "MT_CONFIG_ERROR");
          }

          const mtPaymentOrder = await this.createModernTreasuryPaymentOrder({
            amount,
            currency,
            direction: "debit", // Assuming an outgoing payment from our platform
            originating_account_id: defaultOriginatingMTAccountId,
            receiving_account_id: paymentMethod.sourceId, // This is the customer's bank account in MT
            type: ModernTreasuryPaymentOrderType.ACH, // Defaulting to ACH for typical bank payments
            description,
            metadata: customerReferenceId ? { customerRef: customerReferenceId } : undefined,
          });

          return {
            transactionId: mtPaymentOrder.id,
            status: mtPaymentOrder.status,
            gateway: "Modern Treasury",
          };
        } else if (this.citibankApiBaseUrl && paymentMethod.sourceId.startsWith("citi_acc_")) { // Assume custom Citibank internal account ID prefix
          // Route to Citibank API for internal wire transfers
          console.log(`Processing internal bank transfer via Citibank for ${amount} ${currency}.`);

          // For simplicity, `paymentMethod.sourceId` could be the `fromAccountId` (our internal Citi account)
          // and we'd need `toAccountNumber`, `toBankName`, etc. from further context or other parameters.
          // This highly depends on how unified `paymentMethod` is structured.
          // For now, let's assume `paymentMethod.sourceId` identifies our `fromAccountId`.
          // And assume required `to` details are present in `paymentMethod.details` or passed separately.

          // This example requires more specific `paymentMethod.details` for a complete wire request.
          // We'll simulate a basic wire transfer assuming required details are magically present.
          const simulatedToAccountDetails = paymentMethod.details; // Placeholder, real data needed
          if (!simulatedToAccountDetails.toAccountNumber || !simulatedToAccountDetails.toAccountHolderName || !simulatedToAccountDetails.toBankName) {
            throw new ValidationError("Missing beneficiary details for Citibank wire transfer in unified payment.");
          }

          const citiWireTransfer = await this.initiateCitibankWireTransfer({
            fromAccountId: paymentMethod.sourceId, // Our internal Citibank account
            toAccountNumber: simulatedToAccountDetails.toAccountNumber as string,
            toAccountHolderName: simulatedToAccountDetails.toAccountHolderName as string,
            toBankName: simulatedToAccountDetails.toBankName as string,
            amount,
            currency,
            reference: description || `Unified Payment for ${customerReferenceId || 'N/A'}`,
            toRoutingNumber: simulatedToAccountDetails.toRoutingNumber as string | undefined,
            toSwiftCode: simulatedToAccountDetails.toSwiftCode as string | undefined,
            metadata: customerReferenceId ? { customerRef: customerReferenceId } : undefined,
          });

          return {
            transactionId: citiWireTransfer.transferId,
            status: citiWireTransfer.status,
            gateway: "Citibank",
          };
        } else {
          throw new ValidationError(`Unsupported or unroutable bank account source ID: ${paymentMethod.sourceId}.`);
        }
      } else if (paymentMethod.type === "digital_wallet") {
        // Future expansion: Integrate with digital wallet providers (e.g., Apple Pay, Google Pay via Stripe)
        throw new FinancialGatewayError(`Digital wallet payments are not yet implemented for unified processing.`, "UNSUPPORTED_PAYMENT_METHOD");
      } else {
        throw new ValidationError(`Unsupported payment method type for unified processing: ${paymentMethod.type}`);
      }
    } catch (error) {
      if (error instanceof FinancialGatewayError) {
        throw error;
      }
      const errorMessage = `Unified payment processing failed for amount ${amount} ${currency}: ${(error as Error).message}`;
      console.error(errorMessage, { amount, currency, paymentMethod, originalError: error });
      throw new FinancialGatewayError(errorMessage, "UNIFIED_PAYMENT_FAILURE", (error as any).cause, error as Error);
    }
  }

  /**
   * Fetches the current balance for a financial account, abstracting the source.
   * Prioritizes internal Citibank accounts, then external accounts via Plaid if configured.
   * This provides a unified view of account balances across different institutions.
   * @param accountIdentifier - An object that can identify the account, e.g., `citibankAccountId` or `plaidAccessToken` + `plaidAccountId`.
   * @returns A promise resolving to a `FinancialAccount` object with balance details.
   * @throws `FinancialGatewayError` if the account cannot be found or balance fetching fails.
   */
  public async fetchUnifiedAccountBalance(
    accountIdentifier: { citibankAccountId?: string; plaidAccessToken?: string; plaidAccountId?: string; }
  ): Promise<FinancialAccount> {
    if (!accountIdentifier.citibankAccountId && !(accountIdentifier.plaidAccessToken && accountIdentifier.plaidAccountId)) {
      throw new ValidationError("Either a Citibank account ID or both Plaid access token and account ID are required to fetch a unified balance.");
    }

    try {
      if (accountIdentifier.citibankAccountId) {
        console.log(`Attempting to fetch balance for Citibank account: ${accountIdentifier.citibankAccountId}`);
        const citiBalance = await this.getCitibankAccountBalance(accountIdentifier.citibankAccountId);
        return {
          id: citiBalance.accountId,
          name: `Citibank Account ${citiBalance.accountId.slice(-4)}`, // Generic name
          mask: citiBalance.accountId.slice(-4), // Assuming last 4 digits of ID for mask
          type: "depository", // Default type for Citibank accounts
          subtype: "checking", // Default subtype
          currentBalance: citiBalance.currentBalance,
          availableBalance: citiBalance.availableBalance,
          currency: citiBalance.currency,
          institutionId: "CITIBANKDEMOBUSINESS_ID", // Internal institutional ID
          institutionName: "Citibank Demo Business",
          lastUpdated: citiBalance.lastUpdated,
          source: "Citibank",
          metadata: {},
        };
      } else if (accountIdentifier.plaidAccessToken && accountIdentifier.plaidAccountId) {
        console.log(`Attempting to fetch balance for Plaid account: ${accountIdentifier.plaidAccountId}.`);
        const plaidAccounts = await this.getPlaidAccounts(accountIdentifier.plaidAccessToken);
        const targetAccount = plaidAccounts.find(acc => acc.account_id === accountIdentifier.plaidAccountId);

        if (!targetAccount) {
          throw new FinancialGatewayError(
            `Plaid account with ID ${accountIdentifier.plaidAccountId} not found for the provided access token.`,
            "PLAID_ACCOUNT_NOT_FOUND"
          );
        }

        return {
          id: targetAccount.account_id,
          name: targetAccount.name,
          mask: targetAccount.mask || undefined,
          officialName: targetAccount.official_name || undefined,
          subtype: targetAccount.subtype as FinancialAccount["subtype"], // Cast to unified subtype
          type: targetAccount.type === "depository" ? "depository" : (targetAccount.type as FinancialAccount["type"]),
          currentBalance: targetAccount.balances.current,
          availableBalance: targetAccount.balances.available || undefined,
          currency: targetAccount.balances.iso_currency_code || "USD", // Default if null
          institutionId: "PLAID_EXTERNAL_INST", // Placeholder for Plaid's institution ID
          institutionName: "External Bank via Plaid", // Placeholder
          source: "Plaid",
          metadata: { limit: targetAccount.balances.limit },
        };
      } else {
        throw new FinancialGatewayError("No valid account identifier combination provided for balance inquiry.", "INVALID_ACCOUNT_IDENTIFIER");
      }
    } catch (error) {
      if (error instanceof FinancialGatewayError) {
        throw error;
      }
      const errorMessage = `Failed to fetch unified account balance: ${(error as Error).message}`;
      console.error(errorMessage, { accountIdentifier, originalError: error });
      throw new FinancialGatewayError(errorMessage, "UNIFIED_BALANCE_FAILURE", (error as any).cause, error as Error);
    }
  }

  /**
   * Retrieves unified transaction history for a specified account across different providers.
   * This method aggregates and normalizes transactions into a common `FinancialTransaction` format.
   * @param accountIdentifier - An object identifying the account (Citibank or Plaid details).
   * @param startDate - Start date for transactions (YYYY-MM-DD).
   * @param endDate - End date for transactions (YYYY-MM-DD).
   * @returns A promise resolving to an array of `FinancialTransaction` objects, sorted by date.
   * @throws `FinancialGatewayError` if transaction history fetching fails.
   */
  public async getUnifiedTransactionHistory(
    accountIdentifier: { citibankAccountId?: string; plaidAccessToken?: string; plaidAccountId?: string; },
    startDate: string,
    endDate: string
  ): Promise<FinancialTransaction[]> {
    if (!startDate || !endDate) {
      throw new ValidationError("Start date and end date are required for unified transaction history.");
    }
    if (!accountIdentifier.citibankAccountId && !(accountIdentifier.plaidAccessToken && accountIdentifier.plaidAccountId)) {
      throw new ValidationError("Either a Citibank account ID or both Plaid access token and account ID are required for transaction history retrieval.");
    }

    try {
      let transactions: FinancialTransaction[] = [];

      if (accountIdentifier.citibankAccountId) {
        console.log(`Fetching Citibank transactions for account: ${accountIdentifier.citibankAccountId}.`);
        const citiTransactions = await this.getCitibankAccountStatement(accountIdentifier.citibankAccountId, startDate, endDate);
        transactions = citiTransactions.map(t => ({
          id: t.transactionId,
          accountId: accountIdentifier.citibankAccountId!,
          amount: t.amount,
          currency: t.currency,
          description: t.description,
          type: t.type === "CREDIT" ? TransactionType.CREDIT : TransactionType.DEBIT,
          status: TransactionStatus.POSTED, // Statements typically contain posted transactions
          date: t.date, // Already YYYY-MM-DD
          postedDate: t.date,
          source: "Citibank",
          metadata: {
            balanceAfter: t.balanceAfterTransaction,
            referenceNumber: t.referenceNumber,
            category: t.category,
          },
        }));
      } else if (accountIdentifier.plaidAccessToken && accountIdentifier.plaidAccountId) {
        console.log(`Fetching Plaid transactions for account: ${accountIdentifier.plaidAccountId}.`);
        const plaidTransactions = await this.getPlaidTransactions(
          accountIdentifier.plaidAccessToken,
          startDate,
          endDate,
          { accountIds: [accountIdentifier.plaidAccountId] }
        );

        transactions = plaidTransactions.map(t => ({
          id: t.transaction_id,
          accountId: t.account_id,
          amount: Math.abs(t.amount), // Standardize to positive amount, type defines credit/debit
          currency: t.iso_currency_code || "USD", // Default if null
          description: t.name,
          // Plaid amounts can be positive for debits, negative for credits, or vice-versa
          // depending on configuration. Standardize here:
          type: t.amount < 0 ? TransactionType.CREDIT : TransactionType.DEBIT, // Assuming negative for credits
          status: t.pending ? TransactionStatus.PENDING : TransactionStatus.POSTED,
          date: t.date, // Already YYYY-MM-DD
          postedDate: t.authorized_date || t.date,
          source: "Plaid",
          category: t.category || (t.personal_finance_category ? [t.personal_finance_category.primary, t.personal_finance_category.detailed] : undefined),
          metadata: {
            merchantName: t.merchant_name,
            transactionType: t.transaction_type,
            paymentChannel: t.payment_channel,
            logoUrl: t.logo_url,
            website: t.website,
          },
        }));
      } else {
        throw new FinancialGatewayError("No valid account identifier combination provided for transaction history retrieval.", "INVALID_TRANSACTION_HISTORY_IDENTIFIER");
      }

      // Sort all transactions by date for a consistent chronological history
      return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      if (error instanceof FinancialGatewayError) {
        throw error;
      }
      const errorMessage = `Failed to retrieve unified transaction history: ${(error as Error).message}`;
      console.error(errorMessage, { accountIdentifier, startDate, endDate, originalError: error });
      throw new FinancialGatewayError(errorMessage, "UNIFIED_TRANSACTION_FAILURE", (error as any).cause, error as Error);
    }
  }

  /**
   * Manages lifecycle of a customer across integrated financial gateways.
   * This includes creating a customer in Stripe if needed, or associating existing IDs.
   * @param email - Customer's email.
   * @param name - Customer's name.
   * @param internalCustomerId - An internal identifier for your customer.
   * @returns A promise resolving to a map of gateway customer IDs.
   * @throws `FinancialGatewayError` on failure to create/manage customer in any gateway.
   */
  public async manageUnifiedCustomer(
    email: string,
    name?: string,
    internalCustomerId?: string
  ): Promise<{ stripeCustomerId?: string; modernTreasuryCounterpartyId?: string; }> {
    if (!email) {
      throw new ValidationError("Customer email is required to manage a unified customer profile.");
    }
    const customerGatewayIds: { stripeCustomerId?: string; modernTreasuryCounterpartyId?: string; } = {};

    try {
      // 1. Create/manage Stripe Customer
      if (this.stripeSecretKey && !this.stripeSecretKey.includes("mock")) {
        console.log(`Managing Stripe customer for email: ${email}`);
        const stripeCustomer = await this.createStripeCustomer(email, name, `Customer managed by ${this.ownerBaseUrl}`, { internalCustomerId });
        customerGatewayIds.stripeCustomerId = stripeCustomer.id;
        console.log(`Stripe Customer ID: ${stripeCustomer.id}`);
      } else {
        console.warn("Stripe API not fully configured, skipping Stripe customer creation.");
      }

      // 2. Create/manage Modern Treasury Counterparty (simplified)
      // Modern Treasury uses "Counterparties" for entities involved in payments.
      // This part would involve checking if a Counterparty already exists for the internalCustomerId/email.
      // For demonstration, we'll skip creating a Counterparty directly via API here
      // as it's more complex (requires setting up accounts for them) and might not be
      // a direct 1:1 match with 'CustomerInfo'. It's often handled when creating External Accounts.
      // However, a robust implementation would include this logic.
      if (this.modernTreasuryApiKey && !this.modernTreasuryApiKey.includes("mock")) {
        console.log("Modern Treasury Counterparty management logic skipped for brevity. In a full system, a Counterparty would be created/linked here.");
        // A real implementation would:
        // 1. Search for existing counterparty by email or internalCustomerId.
        // 2. If not found, create a new counterparty.
        // 3. Store the MT Counterparty ID.
        customerGatewayIds.modernTreasuryCounterpartyId = "cp_MOCK_MT_COUNTERPARTY_ID"; // Placeholder
      } else {
        console.warn("Modern Treasury API not fully configured, skipping MT counterparty management.");
      }

      return customerGatewayIds;
    } catch (error) {
      if (error instanceof FinancialGatewayError) {
        throw error;
      }
      const errorMessage = `Failed to manage unified customer for email ${email}: ${(error as Error).message}`;
      console.error(errorMessage, { email, originalError: error });
      throw new FinancialGatewayError(errorMessage, "UNIFIED_CUSTOMER_MANAGEMENT_FAILURE", (error as any).cause, error as Error);
    }
  }
}

// Export a singleton instance of the service for easy access throughout the application.
// This ensures that configuration and state (if any) are managed centrally, following common
// patterns for service layers in larger applications.
const financialGatewayService = new FinancialGatewayService();
export default financialGatewayService;