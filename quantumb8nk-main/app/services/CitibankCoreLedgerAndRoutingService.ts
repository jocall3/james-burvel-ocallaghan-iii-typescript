// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// This file serves as the central financial ledger and routing hub for Citibank Demo Business Inc.
// It orchestrates transactions, enforces business rules, and manages interactions with external
// financial service providers like Stripe, Plaid, and Modern Treasury.
// All internal routing and conceptual ownership is tied to the citibankdemobusiness.dev domain.

/**
 * Utility functions reimplemented internally to adhere to the "no imports" constraint.
 * These would typically be imported from libraries like lodash or a utility module.
 */

/**
 * Converts a string to snake_case.
 * Example: "MultiAccountSelect" -> "multi_account_select"
 */
function toSnakeCase(str: string): string {
  if (!str) return "";
  return str
    .replace(/\W+/g, " ") // Replace non-alphanumeric with spaces
    .split(/ |\B(?=[A-Z])/) // Split on spaces or before uppercase letters
    .map((word) => word.toLowerCase())
    .join("_");
}

/**
 * Generates a simple UUID (v4-like) for unique identifiers.
 * This is a basic implementation and not cryptographically secure.
 */
function generateUuid(): string {
  let dt = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

/**
 * Creates a unique identifier for a transaction based on its properties.
 * This is crucial for idempotency and tracing.
 */
function createTransactionIdentifier(
  externalId: string,
  provider: ExternalServiceProvider,
  type: TransactionType
): string {
  return `${toSnakeCase(provider)}_${toSnakeCase(type)}_${externalId}`;
}

/**
 * Simulates a delay for asynchronous operations, mimicking network latency.
 */
async function simulateNetworkDelay(minMs: number = 50, maxMs: number = 300): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Global Constants and Enumerations for the Ledger System.
 */

/**
 * Defines the types of external financial service providers integrated.
 */
type ExternalServiceProvider = "STRIPE" | "PLAID" | "MODERN_TREASURY" | "CITIBANK_DEMO_BUSINESS_INTERNAL";

/**
 * Defines the various statuses a transaction can go through.
 */
type TransactionStatus =
  | "PENDING_APPROVAL"
  | "PENDING_EXTERNAL_PROCESSING"
  | "EXTERNAL_PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "DECLINED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "REVERSED"
  | "VOIDED"
  | "ON_HOLD"
  | "FRAUD_SUSPECTED";

/**
 * Defines the types of financial transactions supported by the ledger.
 */
type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "PAYMENT"
  | "REFUND"
  | "CHARGEBACK"
  | "ADJUSTMENT"
  | "FEE"
  | "TRANSFER_INTERNAL"
  | "TRANSFER_EXTERNAL_ACH"
  | "TRANSFER_EXTERNAL_WIRE"
  | "CARD_PAYMENT_INBOUND"
  | "CARD_PAYMENT_OUTBOUND"
  | "PAYROLL_DISBURSEMENT"
  | "LOAN_DISBURSEMENT"
  | "LOAN_REPAYMENT";

/**
 * Defines the currency types supported.
 */
type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "MXN";

/**
 * Defines the directions of funds flow.
 */
type FlowDirection = "INBOUND" | "OUTBOUND";

/**
 * Error codes specific to the Citibank Core Ledger service.
 */
type LedgerErrorCode =
  | "UNKNOWN_ERROR"
  | "INVALID_TRANSACTION_STATE"
  | "INSUFFICIENT_FUNDS"
  | "BUSINESS_RULE_VIOLATION"
  | "EXTERNAL_SERVICE_FAILURE"
  | "TRANSACTION_NOT_FOUND"
  | "ACCOUNT_NOT_FOUND"
  | "ROUTING_UNAVAILABLE"
  | "FRAUD_DETECTION_TRIGGERED"
  | "UNAUTHORIZED_ACTION"
  | "DUPLICATE_TRANSACTION_ID"
  | "INVALID_AMOUNT"
  | "CURRENCY_MISMATCH";

/**
 * Core Data Models (Interfaces and Types).
 * These define the structure of data managed by the ledger.
 */

/**
 * Represents a user profile within the system.
 */
interface UserProfile {
  userId: string;
  name: string;
  email: string;
  organizationId: string;
  kycStatus: "VERIFIED" | "PENDING" | "REJECTED";
  riskScore: number; // Calculated based on various factors
}

/**
 * Represents an internal account managed by Citibank Demo Business.
 * Each account has a unique ID, balance, and association with a user/organization.
 */
interface InternalAccount {
  accountId: string;
  userId: string; // Owner of the account
  accountName: string;
  currency: Currency;
  currentBalance: number;
  availableBalance: number;
  onHoldBalance: number;
  status: "ACTIVE" | "INACTIVE" | "FROZEN" | "CLOSED";
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  accountType: "CHECKING" | "SAVINGS" | "CREDIT" | "MERCHANT" | "RESERVE";
}

/**
 * Represents a payment method or external bank account linked to an internal account.
 * This is typically managed via Plaid for bank accounts or Stripe for cards.
 */
interface ExternalAccountLink {
  linkId: string;
  accountId: string; // Internal account it links to
  externalId: string; // ID from Plaid, Stripe, etc.
  provider: ExternalServiceProvider;
  accountName: string; // e.g., "Chase Checking", "Visa ****1234"
  accountType: "BANK" | "CARD";
  bankName?: string;
  last4?: string; // Last 4 digits for cards
  currency: Currency;
  status: "ACTIVE" | "INACTIVE" | "REQUIRES_REAUTH";
  createdAt: number;
  updatedAt: number;
}

/**
 * Represents a single financial transaction.
 * This is the core record in the ledger.
 */
interface Transaction {
  transactionId: string; // Unique ID for this ledger transaction
  externalId: string | null; // ID from external provider if applicable
  idempotencyKey: string; // Key for ensuring unique processing
  originatorId: string; // The entity initiating the transaction (e.g., user ID, system ID)
  sourceAccountId: string | null; // Internal account ID, if funds originate internally
  destinationAccountId: string | null; // Internal account ID, if funds terminate internally
  amount: number; // Transaction amount (positive for INBOUND, negative for OUTBOUND from ledger perspective)
  currency: Currency;
  type: TransactionType;
  flowDirection: FlowDirection; // INBOUND or OUTBOUND from the perspective of Citibank Demo Business Inc.
  status: TransactionStatus;
  provider: ExternalServiceProvider; // Which external service handled it or "CITIBANK_DEMO_BUSINESS_INTERNAL"
  fees: number; // Any fees applied to this transaction by us or external providers
  netAmount: number; // amount - fees
  description: string;
  metadata: Record<string, any>; // Flexible field for additional data
  createdAt: number;
  updatedAt: number;
  processedAt: number | null;
  failureReason: string | null; // Reason for failure or decline
  relatedTransactionIds: string[]; // For refunds, chargebacks, etc.
  requiresApproval: boolean; // Does this transaction need manual review?
  approvalUserId: string | null; // Who approved it
  approvedAt: number | null;
}

/**
 * Represents a financial connection to an external service provider.
 * This stores configuration and API keys (mocked for this exercise).
 */
interface FinancialConnection {
  provider: ExternalServiceProvider;
  apiKey: string; // Mock API key
  webhookSecret: string; // Mock webhook secret
  baseUrl: string; // Base URL for the provider's API
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  lastConnectionAttempt: number | null;
  config: Record<string, any>; // Provider-specific configuration
}

/**
 * Defines a routing rule for transactions.
 * Rules dictate which external provider to use based on transaction criteria.
 */
interface RoutingRule {
  ruleId: string;
  priority: number; // Lower number means higher priority
  transactionType: TransactionType | "ANY";
  minAmount: number | null;
  maxAmount: number | null;
  currency: Currency | "ANY";
  flowDirection: FlowDirection | "ANY";
  destinationProvider: ExternalServiceProvider | "CITIBANK_DEMO_BUSINESS_INTERNAL";
  isActive: boolean;
  criteria: Record<string, any>; // Additional flexible criteria (e.g., "country": "US")
}

/**
 * Represents a webhook event from an external service.
 * These are queued and processed by the ledger.
 */
interface WebhookEvent {
  eventId: string;
  provider: ExternalServiceProvider;
  eventType: string; // e.g., "charge.succeeded", "payment_intent.created"
  payload: Record<string, any>;
  receivedAt: number;
  processedAt: number | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  error: string | null;
  deliveryAttempts: number;
}

/**
 * In-Memory Data Stores.
 * These objects simulate a database for the ledger's internal state.
 * In a real application, these would be replaced by actual database calls.
 */
interface LedgerDataStore {
  users: Record<string, UserProfile>;
  accounts: Record<string, InternalAccount>;
  transactions: Record<string, Transaction>;
  externalAccountLinks: Record<string, ExternalAccountLink>;
  financialConnections: Record<string, FinancialConnection>;
  routingRules: Record<string, RoutingRule>;
  webhookEvents: Record<string, WebhookEvent>;
}

// Initialize the in-memory data store with some mock data.
const internalDataStore: LedgerDataStore = {
  users: {
    "user_123": {
      userId: "user_123",
      name: "Alice Johnson",
      email: "alice@citibankdemobusiness.dev",
      organizationId: "org_alpha",
      kycStatus: "VERIFIED",
      riskScore: 20,
    },
    "user_456": {
      userId: "user_456",
      name: "Bob Smith",
      email: "bob@citibankdemobusiness.dev",
      organizationId: "org_beta",
      kycStatus: "VERIFIED",
      riskScore: 35,
    },
    "user_789": {
      userId: "user_789",
      name: "Charlie Brown",
      email: "charlie@citibankdemobusiness.dev",
      organizationId: "org_alpha",
      kycStatus: "PENDING",
      riskScore: 70,
    },
  },
  accounts: {
    "acc_001_usd": {
      accountId: "acc_001_usd",
      userId: "user_123",
      accountName: "Alice Checking USD",
      currency: "USD",
      currentBalance: 15000.75,
      availableBalance: 14900.75, // 100 on hold
      onHoldBalance: 100.00,
      status: "ACTIVE",
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 5,
      accountType: "CHECKING",
    },
    "acc_002_eur": {
      accountId: "acc_002_eur",
      userId: "user_123",
      accountName: "Alice Savings EUR",
      currency: "EUR",
      currentBalance: 2500.50,
      availableBalance: 2500.50,
      onHoldBalance: 0,
      status: "ACTIVE",
      createdAt: Date.now() - 86400000 * 60,
      updatedAt: Date.now() - 86400000 * 10,
      accountType: "SAVINGS",
    },
    "acc_003_usd": {
      accountId: "acc_003_usd",
      userId: "user_456",
      accountName: "Bob Merchant USD",
      currency: "USD",
      currentBalance: 8000.00,
      availableBalance: 7500.00,
      onHoldBalance: 500.00,
      status: "ACTIVE",
      createdAt: Date.now() - 86400000 * 15,
      updatedAt: Date.now(),
      accountType: "MERCHANT",
    },
  },
  transactions: {
    "tx_mock_1": {
      transactionId: "tx_mock_1",
      externalId: "stripe_ch_xyz123",
      idempotencyKey: "mock_idempotency_1",
      originatorId: "user_123",
      sourceAccountId: null,
      destinationAccountId: "acc_001_usd",
      amount: 150.00,
      currency: "USD",
      type: "CARD_PAYMENT_INBOUND",
      flowDirection: "INBOUND",
      status: "COMPLETED",
      provider: "STRIPE",
      fees: 4.50,
      netAmount: 145.50,
      description: "Customer payment via Stripe",
      metadata: { customerEmail: "customer@example.com" },
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 2,
      processedAt: Date.now() - 86400000 * 2,
      failureReason: null,
      relatedTransactionIds: [],
      requiresApproval: false,
      approvalUserId: null,
      approvedAt: null,
    },
    "tx_mock_2": {
      transactionId: "tx_mock_2",
      externalId: "mt_pay_abc456",
      idempotencyKey: "mock_idempotency_2",
      originatorId: "user_456",
      sourceAccountId: "acc_003_usd",
      destinationAccountId: null,
      amount: 500.00,
      currency: "USD",
      type: "TRANSFER_EXTERNAL_ACH",
      flowDirection: "OUTBOUND",
      status: "PENDING_EXTERNAL_PROCESSING",
      provider: "MODERN_TREASURY",
      fees: 0.50,
      netAmount: 499.50,
      description: "Vendor payout via ACH",
      metadata: { vendorId: "vendor_xyz" },
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now(),
      processedAt: null,
      failureReason: null,
      relatedTransactionIds: [],
      requiresApproval: false,
      approvalUserId: null,
      approvedAt: null,
    },
  },
  externalAccountLinks: {
    "link_stripe_001": {
      linkId: "link_stripe_001",
      accountId: "acc_001_usd",
      externalId: "acct_12345",
      provider: "STRIPE",
      accountName: "Stripe Connect Account",
      accountType: "MERCHANT",
      currency: "USD",
      status: "ACTIVE",
      createdAt: Date.now() - 86400000 * 20,
      updatedAt: Date.now() - 86400000 * 3,
    },
    "link_plaid_002": {
      linkId: "link_plaid_002",
      accountId: "acc_001_usd",
      externalId: "access-token-123",
      provider: "PLAID",
      accountName: "Bank of America Checking",
      accountType: "BANK",
      bankName: "Bank of America",
      last4: "5678",
      currency: "USD",
      status: "ACTIVE",
      createdAt: Date.now() - 86400000 * 25,
      updatedAt: Date.now() - 86400000 * 7,
    },
  },
  financialConnections: {
    "STRIPE": {
      provider: "STRIPE",
      apiKey: "sk_test_mock_stripe_key_123",
      webhookSecret: "whsec_mock_stripe_secret_456",
      baseUrl: "https://api.stripe.com",
      status: "CONNECTED",
      lastConnectionAttempt: Date.now(),
      config: { region: "US" },
    },
    "PLAID": {
      provider: "PLAID",
      apiKey: "client_id_mock_plaid_key_789",
      webhookSecret: "plaid_webhook_secret_abc",
      baseUrl: "https://sandbox.plaid.com",
      status: "CONNECTED",
      lastConnectionAttempt: Date.now(),
      config: { environment: "sandbox" },
    },
    "MODERN_TREASURY": {
      provider: "MODERN_TREASURY",
      apiKey: "org_id_mock_mt_key_def",
      webhookSecret: "mt_webhook_secret_xyz",
      baseUrl: "https://api.moderntreasury.com",
      status: "CONNECTED",
      lastConnectionAttempt: Date.now(),
      config: { accountLedger: "citibank_demo_business_ledger" },
    },
  },
  routingRules: {
    "rule_card_usd_stripe": {
      ruleId: "rule_card_usd_stripe",
      priority: 10,
      transactionType: "CARD_PAYMENT_INBOUND",
      minAmount: 1,
      maxAmount: 10000,
      currency: "USD",
      flowDirection: "INBOUND",
      destinationProvider: "STRIPE",
      isActive: true,
      criteria: { payment_method_type: "card" },
    },
    "rule_ach_out_mt": {
      ruleId: "rule_ach_out_mt",
      priority: 20,
      transactionType: "TRANSFER_EXTERNAL_ACH",
      minAmount: 1,
      maxAmount: null,
      currency: "USD",
      flowDirection: "OUTBOUND",
      destinationProvider: "MODERN_TREASURY",
      isActive: true,
      criteria: { payment_rail: "ACH" },
    },
    "rule_wire_out_mt": {
      ruleId: "rule_wire_out_mt",
      priority: 25,
      transactionType: "TRANSFER_EXTERNAL_WIRE",
      minAmount: 1000,
      maxAmount: null,
      currency: "ANY",
      flowDirection: "OUTBOUND",
      destinationProvider: "MODERN_TREASURY",
      isActive: true,
      criteria: { payment_rail: "WIRE" },
    },
    "rule_internal_transfer": {
      ruleId: "rule_internal_transfer",
      priority: 5,
      transactionType: "TRANSFER_INTERNAL",
      minAmount: 0.01,
      maxAmount: null,
      currency: "ANY",
      flowDirection: "ANY",
      destinationProvider: "CITIBANK_DEMO_BUSINESS_INTERNAL",
      isActive: true,
      criteria: {},
    },
    "rule_plaid_balance_sync": {
      ruleId: "rule_plaid_balance_sync",
      priority: 1,
      transactionType: "DEPOSIT", // Placeholder for balance sync type
      minAmount: null,
      maxAmount: null,
      currency: "ANY",
      flowDirection: "INBOUND",
      destinationProvider: "PLAID",
      isActive: true,
      criteria: { purpose: "balance_sync" },
    },
  },
  webhookEvents: {},
};

/**
 * --- External Service Simulators ---
 * These classes simulate the behavior of external financial service providers.
 * In a real application, these would be SDK calls or HTTP requests to actual APIs.
 */

class StripeServiceSimulator {
  private _apiKey: string;
  private _baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this._apiKey = apiKey;
    this._baseUrl = baseUrl;
    console.log(`[StripeServiceSimulator] Initialized with API Key: ${apiKey} and Base URL: ${baseUrl}`);
  }

  /**
   * Simulates creating a payment intent.
   * @param amount The amount to charge.
   * @param currency The currency.
   * @param description A description for the payment.
   * @param metadata Optional metadata.
   * @returns A simulated Stripe PaymentIntent object.
   */
  async createPaymentIntent(
    amount: number,
    currency: Currency,
    description: string,
    metadata: Record<string, any>
  ): Promise<{ id: string; status: string; client_secret: string; amount: number; currency: Currency; charges: any[] }> {
    await simulateNetworkDelay();
    console.log(`[StripeServiceSimulator] Creating Payment Intent for ${amount} ${currency}...`);
    const intentId = `pi_${generateUuid().replace(/-/g, "")}`;
    const clientSecret = `cs_${intentId}_secret`;
    // Simulate some failures based on amount
    if (amount > 10000 && Math.random() < 0.2) {
      console.warn(`[StripeServiceSimulator] Payment Intent ${intentId} failed due to large amount risk.`);
      throw new Error("Stripe: Payment Intent creation failed due to risk assessment.");
    }
    console.log(`[StripeServiceSimulator] Payment Intent ${intentId} created successfully. Status: requires_payment_method`);
    return {
      id: intentId,
      status: "requires_payment_method",
      client_secret: clientSecret,
      amount: amount,
      currency: currency,
      charges: [],
      ...metadata,
    };
  }

  /**
   * Simulates confirming a payment intent (e.g., after card details are provided).
   * @param paymentIntentId The ID of the payment intent.
   * @param paymentMethodId A mock payment method ID.
   * @returns Updated PaymentIntent object.
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<{ id: string; status: string; amount: number; currency: Currency; charges: any[] }> {
    await simulateNetworkDelay();
    console.log(`[StripeServiceSimulator] Confirming Payment Intent ${paymentIntentId} with Payment Method ${paymentMethodId}...`);

    // Simulate different outcomes
    const outcome = Math.random();
    if (outcome < 0.1) {
      console.warn(`[StripeServiceSimulator] Payment Intent ${paymentIntentId} failed during confirmation.`);
      throw new Error("Stripe: Payment confirmation declined by bank.");
    } else if (outcome < 0.3) {
      console.warn(`[StripeServiceSimulator] Payment Intent ${paymentIntentId} requires additional action.`);
      return {
        id: paymentIntentId,
        status: "requires_action",
        amount: 500.00, // example amount, should come from initial intent
        currency: "USD",
        charges: [],
      };
    }

    const chargeId = `ch_${generateUuid().replace(/-/g, "")}`;
    console.log(`[StripeServiceSimulator] Payment Intent ${paymentIntentId} confirmed. Charge ${chargeId} successful.`);
    return {
      id: paymentIntentId,
      status: "succeeded",
      amount: 500.00, // Example, should be passed or retrieved
      currency: "USD", // Example
      charges: [{ id: chargeId, status: "succeeded", amount: 500.00 }],
    };
  }

  /**
   * Simulates refunding a charge.
   * @param chargeId The ID of the charge to refund.
   * @param amount The amount to refund.
   * @returns A simulated Stripe Refund object.
   */
  async createRefund(chargeId: string, amount: number): Promise<{ id: string; charge: string; amount: number; status: string }> {
    await simulateNetworkDelay();
    console.log(`[StripeServiceSimulator] Creating refund for charge ${chargeId} with amount ${amount}...`);
    const refundId = `re_${generateUuid().replace(/-/g, "")}`;

    if (Math.random() < 0.1) {
      console.error(`[StripeServiceSimulator] Refund ${refundId} failed for charge ${chargeId}.`);
      throw new Error("Stripe: Refund failed, insufficient funds or charge already refunded.");
    }

    console.log(`[StripeServiceSimulator] Refund ${refundId} created successfully for charge ${chargeId}. Status: succeeded`);
    return {
      id: refundId,
      charge: chargeId,
      amount: amount,
      status: "succeeded",
    };
  }
}

class PlaidServiceSimulator {
  private _clientId: string;
  private _baseUrl: string;

  constructor(clientId: string, baseUrl: string) {
    this._clientId = clientId;
    this._baseUrl = baseUrl;
    console.log(`[PlaidServiceSimulator] Initialized with Client ID: ${clientId} and Base URL: ${baseUrl}`);
  }

  /**
   * Simulates the Plaid Link flow to exchange a public token for an access token.
   * @param publicToken A mock public token.
   * @returns A simulated Plaid access token and item ID.
   */
  async exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string }> {
    await simulateNetworkDelay();
    console.log(`[PlaidServiceSimulator] Exchanging public token ${publicToken} for access token...`);
    if (!publicToken || publicToken.startsWith("fail_")) {
      console.error(`[PlaidServiceSimulator] Public token exchange failed for ${publicToken}.`);
      throw new Error("Plaid: Invalid public token provided.");
    }
    const accessToken = `access-token-${generateUuid()}`;
    const itemId = `item-id-${generateUuid()}`;
    console.log(`[PlaidServiceSimulator] Public token exchanged. Item ID: ${itemId}`);
    return { accessToken, itemId };
  }

  /**
   * Simulates fetching account balances for a given Plaid item.
   * @param accessToken The Plaid access token.
   * @returns A simulated list of account balances.
   */
  async getAccountBalances(
    accessToken: string
  ): Promise<Array<{ accountId: string; balance: number; currency: Currency; type: string }>> {
    await simulateNetworkDelay();
    console.log(`[PlaidServiceSimulator] Fetching account balances for item with access token ${accessToken.substring(0, 10)}...`);

    if (!accessToken || accessToken.startsWith("fail_")) {
      console.error(`[PlaidServiceSimulator] Failed to fetch balances: invalid access token.`);
      throw new Error("Plaid: Invalid access token.");
    }

    // Generate mock balances
    const mockAccounts = [
      { accountId: `pl_acc_${generateUuid()}`, balance: 1234.56, currency: "USD", type: "depository" },
      { accountId: `pl_acc_${generateUuid()}`, balance: 789.00, currency: "USD", type: "credit" },
      { accountId: `pl_acc_${generateUuid()}`, balance: 500.25, currency: "EUR", type: "depository" },
    ];
    console.log(`[PlaidServiceSimulator] Successfully fetched ${mockAccounts.length} account balances.`);
    return mockAccounts;
  }

  /**
   * Simulates fetching transaction history for a given Plaid item.
   * @param accessToken The Plaid access token.
   * @param startDate The start date for transactions.
   * @param endDate The end date for transactions.
   * @returns A simulated list of transactions.
   */
  async getTransactions(
    accessToken: string,
    startDate: string, // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
  ): Promise<Array<{ transactionId: string; accountId: string; amount: number; currency: Currency; description: string; date: string }>> {
    await simulateNetworkDelay();
    console.log(`[PlaidServiceSimulator] Fetching transactions for item with access token ${accessToken.substring(0, 10)} from ${startDate} to ${endDate}...`);

    if (!accessToken || accessToken.startsWith("fail_")) {
      console.error(`[PlaidServiceSimulator] Failed to fetch transactions: invalid access token.`);
      throw new Error("Plaid: Invalid access token.");
    }

    // Generate mock transactions
    const mockTransactions = [
      { transactionId: `pl_tx_${generateUuid()}`, accountId: `pl_acc_${generateUuid()}`, amount: 50.00, currency: "USD", description: "Coffee Shop", date: "2023-10-26" },
      { transactionId: `pl_tx_${generateUuid()}`, accountId: `pl_acc_${generateUuid()}`, amount: 120.00, currency: "USD", description: "Grocery Store", date: "2023-10-25" },
      { transactionId: `pl_tx_${generateUuid()}`, accountId: `pl_acc_${generateUuid()}`, amount: -75.00, currency: "USD", description: "Online Subscription", date: "2023-10-24" },
    ];
    console.log(`[PlaidServiceSimulator] Successfully fetched ${mockTransactions.length} transactions.`);
    return mockTransactions;
  }
}

class ModernTreasuryServiceSimulator {
  private _apiKey: string;
  private _baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this._apiKey = apiKey;
    this._baseUrl = baseUrl;
    console.log(`[ModernTreasuryServiceSimulator] Initialized with API Key: ${apiKey} and Base URL: ${baseUrl}`);
  }

  /**
   * Simulates creating a payment order in Modern Treasury.
   * @param amount The amount of the payment.
   * @param currency The currency.
   * @param direction INBOUND or OUTBOUND.
   * @param paymentType ACH, WIRE, etc.
   * @param originator Information about the sender.
   * @param beneficiary Information about the recipient.
   * @param metadata Optional metadata.
   * @returns A simulated Modern Treasury Payment Order object.
   */
  async createPaymentOrder(
    amount: number,
    currency: Currency,
    direction: FlowDirection,
    paymentType: "ACH" | "WIRE",
    originator: { id: string; name: string; accountNumber: string; routingNumber: string }, // Mock originator
    beneficiary: { name: string; accountNumber: string; routingNumber: string; bankName?: string }, // Mock beneficiary
    metadata: Record<string, any>
  ): Promise<{ id: string; status: string; amount: number; currency: Currency; type: string }> {
    await simulateNetworkDelay();
    console.log(`[ModernTreasuryServiceSimulator] Creating ${paymentType} payment order for ${amount} ${currency} (${direction})...`);
    const paymentOrderId = `po_${generateUuid().replace(/-/g, "")}`;

    // Simulate different outcomes based on amount or specific beneficiary details
    if (amount > 50000 || beneficiary.name.includes("Fraudulent")) {
      console.warn(`[ModernTreasuryServiceSimulator] Payment order ${paymentOrderId} declined due to high amount or suspicious beneficiary.`);
      throw new Error("Modern Treasury: Payment order declined by risk engine.");
    }

    if (Math.random() < 0.15) {
      console.warn(`[ModernTreasuryServiceSimulator] Payment order ${paymentOrderId} is pending approval.`);
      return {
        id: paymentOrderId,
        status: "pending_approval",
        amount: amount,
        currency: currency,
        type: paymentType,
        ...metadata,
      };
    }

    console.log(`[ModernTreasuryServiceSimulator] Payment order ${paymentOrderId} created. Status: initiated`);
    return {
      id: paymentOrderId,
      status: "initiated",
      amount: amount,
      currency: currency,
      type: paymentType,
      ...metadata,
    };
  }

  /**
   * Simulates retrieving the status of a payment order.
   * @param paymentOrderId The ID of the payment order.
   * @returns The status of the payment order.
   */
  async getPaymentOrderStatus(paymentOrderId: string): Promise<{ id: string; status: string }> {
    await simulateNetworkDelay(100, 500); // Longer delay for status checks
    console.log(`[ModernTreasuryServiceSimulator] Getting status for payment order ${paymentOrderId}...`);

    if (!paymentOrderId || paymentOrderId.startsWith("fail_")) {
      console.error(`[ModernTreasuryServiceSimulator] Failed to get status: invalid payment order ID.`);
      throw new Error("Modern Treasury: Payment Order not found.");
    }

    // Simulate state transitions over time or randomly
    const statuses: Array<string> = ["initiated", "sent", "completed", "returned"];
    const simulatedStatus = statuses[Math.floor(Math.random() * statuses.length)];

    console.log(`[ModernTreasuryServiceSimulator] Payment order ${paymentOrderId} status: ${simulatedStatus}`);
    return { id: paymentOrderId, status: simulatedStatus };
  }
}

/**
 * --- Ledger Core Services ---
 * These classes manage the internal state and business logic of the ledger.
 */

class AccountManager {
  private _dataStore: LedgerDataStore;

  constructor(dataStore: LedgerDataStore) {
    this._dataStore = dataStore;
    console.log("[AccountManager] Initialized.");
  }

  /**
   * Retrieves an internal account by its ID.
   * @param accountId The ID of the account.
   * @returns The InternalAccount object or undefined if not found.
   */
  getAccount(accountId: string): InternalAccount | undefined {
    return this._dataStore.accounts[accountId];
  }

  /**
   * Updates an account's balance, applying a transaction.
   * This is a critical atomic operation in a real ledger.
   * @param accountId The ID of the account to update.
   * @param amount The amount to add (positive) or subtract (negative).
   * @param isHold If true, moves to/from onHoldBalance instead of currentBalance.
   * @param releaseHoldAmount If positive, releases this amount from onHold to available.
   * @returns The updated account, or throws an error if not found or insufficient funds.
   */
  updateAccountBalance(
    accountId: string,
    amount: number,
    isHold: boolean = false,
    releaseHoldAmount: number = 0
  ): InternalAccount {
    const account = this.getAccount(accountId);
    if (!account) {
      console.error(`[AccountManager] Account ${accountId} not found for balance update.`);
      throw new Error("Account not found.");
    }

    console.log(`[AccountManager] Updating balance for account ${accountId}: Amount=${amount}, IsHold=${isHold}, ReleaseHold=${releaseHoldAmount}`);

    const newCurrentBalance = account.currentBalance + amount;

    if (newCurrentBalance < 0) {
      console.error(`[AccountManager] Insufficient funds in account ${accountId}. Attempted to subtract ${Math.abs(amount)}, current available: ${account.availableBalance}`);
      throw new Error("Insufficient funds.");
    }

    if (isHold) {
      account.onHoldBalance += amount;
      if (account.onHoldBalance < 0) {
        console.error(`[AccountManager] Error: onHoldBalance for ${accountId} would become negative. This indicates a ledger inconsistency.`);
        account.onHoldBalance -= amount; // Revert change
        throw new Error("Invalid hold operation.");
      }
      account.availableBalance -= amount;
      if (account.availableBalance < 0) {
         console.error(`[AccountManager] Insufficient available funds in account ${accountId} for hold. Attempted to hold ${amount}, current available: ${account.availableBalance + amount}`);
         account.onHoldBalance -= amount; // Revert hold
         account.availableBalance += amount; // Revert available
         throw new Error("Insufficient available funds for hold.");
      }
    } else {
      account.currentBalance = newCurrentBalance;
      account.availableBalance = newCurrentBalance - account.onHoldBalance;
    }

    if (releaseHoldAmount > 0) {
      if (account.onHoldBalance < releaseHoldAmount) {
        console.error(`[AccountManager] Not enough funds on hold in account ${accountId} to release ${releaseHoldAmount}. Current hold: ${account.onHoldBalance}`);
        throw new Error("Not enough funds on hold.");
      }
      account.onHoldBalance -= releaseHoldAmount;
      account.availableBalance += releaseHoldAmount;
      console.log(`[AccountManager] Released ${releaseHoldAmount} from hold for account ${accountId}. New on-hold: ${account.onHoldBalance}, New available: ${account.availableBalance}`);
    }

    account.updatedAt = Date.now();
    this._dataStore.accounts[accountId] = account; // Persist update
    console.log(`[AccountManager] Account ${accountId} updated. Current: ${account.currentBalance}, Available: ${account.availableBalance}, OnHold: ${account.onHoldBalance}`);
    return account;
  }

  /**
   * Locks an amount from available balance by moving it to onHoldBalance.
   * @param accountId The account ID.
   * @param amount The amount to lock.
   * @returns The updated account.
   */
  lockFunds(accountId: string, amount: number): InternalAccount {
    console.log(`[AccountManager] Attempting to lock ${amount} from account ${accountId}.`);
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error("Account not found.");
    }
    if (account.availableBalance < amount) {
      throw new Error("Insufficient available funds to lock.");
    }
    account.onHoldBalance += amount;
    account.availableBalance -= amount;
    account.updatedAt = Date.now();
    console.log(`[AccountManager] Funds locked in ${accountId}. New on-hold: ${account.onHoldBalance}, New available: ${account.availableBalance}`);
    return account;
  }

  /**
   * Releases an amount from onHoldBalance back to available balance.
   * @param accountId The account ID.
   * @param amount The amount to release.
   * @returns The updated account.
   */
  releaseFunds(accountId: string, amount: number): InternalAccount {
    console.log(`[AccountManager] Attempting to release ${amount} from hold for account ${accountId}.`);
    const account = this.getAccount(accountId);
    if (!account) {
      throw new Error("Account not found.");
    }
    if (account.onHoldBalance < amount) {
      throw new Error("Insufficient funds on hold to release.");
    }
    account.onHoldBalance -= amount;
    account.availableBalance += amount;
    account.updatedAt = Date.now();
    console.log(`[AccountManager] Funds released in ${accountId}. New on-hold: ${account.onHoldBalance}, New available: ${account.availableBalance}`);
    return account;
  }

  /**
   * Adds a new internal account.
   * @param userId The ID of the user owning the account.
   * @param accountName The name of the account.
   * @param currency The currency of the account.
   * @param initialBalance The initial balance.
   * @returns The newly created account.
   */
  createAccount(
    userId: string,
    accountName: string,
    currency: Currency,
    accountType: InternalAccount["accountType"],
    initialBalance: number = 0
  ): InternalAccount {
    const newAccountId = `acc_${generateUuid().slice(0, 8)}_${toSnakeCase(currency)}`;
    const now = Date.now();
    const newAccount: InternalAccount = {
      accountId: newAccountId,
      userId: userId,
      accountName: accountName,
      currency: currency,
      currentBalance: initialBalance,
      availableBalance: initialBalance,
      onHoldBalance: 0,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
      accountType: accountType,
    };
    this._dataStore.accounts[newAccountId] = newAccount;
    console.log(`[AccountManager] Created new account: ${newAccountId} for user ${userId} with initial balance ${initialBalance} ${currency}.`);
    return newAccount;
  }

  /**
   * Retrieves external account links for a given internal account.
   * @param accountId The internal account ID.
   * @param provider Optional filter by provider.
   * @returns Array of external account links.
   */
  getExternalAccountLinks(accountId: string, provider?: ExternalServiceProvider): ExternalAccountLink[] {
    return Object.values(this._dataStore.externalAccountLinks).filter(
      (link) => link.accountId === accountId && (!provider || link.provider === provider)
    );
  }

  /**
   * Adds or updates an external account link.
   * @param link The ExternalAccountLink object to add/update.
   * @returns The added/updated link.
   */
  addOrUpdateExternalAccountLink(link: ExternalAccountLink): ExternalAccountLink {
    this._dataStore.externalAccountLinks[link.linkId] = link;
    console.log(`[AccountManager] External account link ${link.linkId} for account ${link.accountId} via ${link.provider} added/updated.`);
    return link;
  }
}

class TransactionManager {
  private _dataStore: LedgerDataStore;
  private _accountManager: AccountManager;

  constructor(dataStore: LedgerDataStore, accountManager: AccountManager) {
    this._dataStore = dataStore;
    this._accountManager = accountManager;
    console.log("[TransactionManager] Initialized.");
  }

  /**
   * Creates a new transaction record in a PENDING state.
   * This is the first step before actual processing.
   * @param transactionDetails Details for the new transaction.
   * @returns The created Transaction object.
   */
  createPendingTransaction(transactionDetails: Omit<Transaction, "transactionId" | "status" | "createdAt" | "updatedAt" | "processedAt" | "failureReason" | "relatedTransactionIds" | "approvalUserId" | "approvedAt">): Transaction {
    const now = Date.now();
    const newTransactionId = `tx_${generateUuid()}`;

    // Check for idempotency key to prevent duplicate submissions
    const existingTransaction = Object.values(this._dataStore.transactions).find(
      (tx) => tx.idempotencyKey === transactionDetails.idempotencyKey
    );
    if (existingTransaction) {
      console.warn(`[TransactionManager] Duplicate transaction submission detected with idempotency key ${transactionDetails.idempotencyKey}. Returning existing transaction ${existingTransaction.transactionId}.`);
      return existingTransaction;
    }

    const newTransaction: Transaction = {
      ...transactionDetails,
      transactionId: newTransactionId,
      status: transactionDetails.requiresApproval ? "PENDING_APPROVAL" : "PENDING_EXTERNAL_PROCESSING",
      createdAt: now,
      updatedAt: now,
      processedAt: null,
      failureReason: null,
      relatedTransactionIds: [],
      approvalUserId: null,
      approvedAt: null,
    };
    this._dataStore.transactions[newTransactionId] = newTransaction;
    console.log(`[TransactionManager] Created new pending transaction ${newTransactionId}. Type: ${newTransaction.type}, Amount: ${newTransaction.amount} ${newTransaction.currency}. Status: ${newTransaction.status}.`);
    return newTransaction;
  }

  /**
   * Updates the status and details of an existing transaction.
   * @param transactionId The ID of the transaction to update.
   * @param newStatus The new status.
   * @param externalId Optional external ID from provider.
   * @param failureReason Optional reason if failed.
   * @param processedAt Optional timestamp for processing.
   * @returns The updated Transaction object.
   */
  updateTransactionStatus(
    transactionId: string,
    newStatus: TransactionStatus,
    externalId: string | null = null,
    failureReason: string | null = null,
    processedAt: number | null = null,
    metadataUpdates: Record<string, any> = {}
  ): Transaction {
    const transaction = this._dataStore.transactions[transactionId];
    if (!transaction) {
      console.error(`[TransactionManager] Transaction ${transactionId} not found for status update.`);
      throw new Error("Transaction not found.");
    }

    console.log(`[TransactionManager] Updating transaction ${transactionId} status from ${transaction.status} to ${newStatus}.`);

    transaction.status = newStatus;
    transaction.updatedAt = Date.now();
    if (externalId) {
      transaction.externalId = externalId;
    }
    if (failureReason) {
      transaction.failureReason = failureReason;
    }
    if (processedAt) {
      transaction.processedAt = processedAt;
    }
    if (Object.keys(metadataUpdates).length > 0) {
      transaction.metadata = { ...transaction.metadata, ...metadataUpdates };
    }

    this._dataStore.transactions[transactionId] = transaction;
    return transaction;
  }

  /**
   * Retrieves a transaction by its ID.
   * @param transactionId The ID of the transaction.
   * @returns The Transaction object or undefined.
   */
  getTransaction(transactionId: string): Transaction | undefined {
    return this._dataStore.transactions[transactionId];
  }

  /**
   * Retrieves all transactions for a given account.
   * @param accountId The account ID.
   * @returns An array of transactions.
   */
  getTransactionsForAccount(accountId: string): Transaction[] {
    return Object.values(this._dataStore.transactions).filter(
      (tx) => tx.sourceAccountId === accountId || tx.destinationAccountId === accountId
    );
  }

  /**
   * Processes an internal transfer between two internal accounts.
   * This is an atomic debit/credit operation.
   * @param transaction The internal transfer transaction.
   * @returns The completed transaction.
   */
  processInternalTransfer(transaction: Transaction): Transaction {
    console.log(`[TransactionManager] Processing internal transfer ${transaction.transactionId}.`);
    if (!transaction.sourceAccountId || !transaction.destinationAccountId) {
      throw new Error("Internal transfer requires both source and destination accounts.");
    }
    if (transaction.status !== "PENDING_EXTERNAL_PROCESSING") {
      throw new Error(`Invalid transaction state for internal transfer: ${transaction.status}`);
    }
    if (transaction.amount <= 0) {
      throw new Error("Internal transfer amount must be positive.");
    }

    try {
      // Debit source account
      this._accountManager.updateAccountBalance(transaction.sourceAccountId, -transaction.amount);
      // Credit destination account
      this._accountManager.updateAccountBalance(transaction.destinationAccountId, transaction.amount);

      return this.updateTransactionStatus(
        transaction.transactionId,
        "COMPLETED",
        transaction.transactionId, // Internal transactions use their own ID as external
        null,
        Date.now()
      );
    } catch (error: any) {
      console.error(`[TransactionManager] Internal transfer ${transaction.transactionId} failed: ${error.message}`);
      return this.updateTransactionStatus(
        transaction.transactionId,
        "FAILED",
        null,
        `Ledger internal error: ${error.message}`,
        Date.now()
      );
    }
  }

  /**
   * Applies an adjustment to an account balance, creating an ADJUSMENT transaction.
   * @param accountId The account to adjust.
   * @param amount The adjustment amount (positive for credit, negative for debit).
   * @param description A description for the adjustment.
   * @param originatorId The entity initiating the adjustment.
   * @param metadata Optional metadata.
   * @returns The completed adjustment transaction.
   */
  applyAdjustment(
    accountId: string,
    amount: number,
    description: string,
    originatorId: string,
    metadata: Record<string, any> = {}
  ): Transaction {
    console.log(`[TransactionManager] Applying adjustment of ${amount} to account ${accountId}.`);
    const account = this._accountManager.getAccount(accountId);
    if (!account) {
      throw new Error("Account not found for adjustment.");
    }

    const adjustmentTx: Omit<Transaction, "transactionId" | "status" | "createdAt" | "updatedAt" | "processedAt" | "failureReason" | "relatedTransactionIds" | "approvalUserId" | "approvedAt"> = {
      idempotencyKey: `adj_${generateUuid()}`,
      originatorId: originatorId,
      sourceAccountId: amount < 0 ? accountId : null,
      destinationAccountId: amount > 0 ? accountId : null,
      amount: Math.abs(amount),
      currency: account.currency,
      type: "ADJUSTMENT",
      flowDirection: amount > 0 ? "INBOUND" : "OUTBOUND",
      provider: "CITIBANK_DEMO_BUSINESS_INTERNAL",
      fees: 0,
      netAmount: amount,
      description: description,
      metadata: metadata,
      requiresApproval: false,
    };

    const newTx = this.createPendingTransaction(adjustmentTx);

    try {
      this._accountManager.updateAccountBalance(accountId, amount);
      return this.updateTransactionStatus(newTx.transactionId, "COMPLETED", newTx.transactionId, null, Date.now());
    } catch (error: any) {
      console.error(`[TransactionManager] Adjustment ${newTx.transactionId} failed: ${error.message}`);
      return this.updateTransactionStatus(newTx.transactionId, "FAILED", null, `Ledger internal error: ${error.message}`, Date.now());
    }
  }

  /**
   * Marks a transaction for approval.
   * @param transactionId The ID of the transaction.
   * @param reason The reason for requiring approval.
   * @returns The updated transaction.
   */
  requireApproval(transactionId: string, reason: string): Transaction {
    const transaction = this._dataStore.transactions[transactionId];
    if (!transaction) {
      throw new Error("Transaction not found.");
    }
    if (transaction.status !== "PENDING_EXTERNAL_PROCESSING" && transaction.status !== "PENDING_APPROVAL") {
      console.warn(`[TransactionManager] Transaction ${transactionId} in status ${transaction.status} cannot be directly moved to PENDING_APPROVAL. Forcing.`);
    }
    transaction.requiresApproval = true;
    transaction.status = "PENDING_APPROVAL";
    transaction.metadata.approvalReason = reason;
    transaction.updatedAt = Date.now();
    this._dataStore.transactions[transactionId] = transaction;
    console.log(`[TransactionManager] Transaction ${transactionId} now requires approval. Reason: ${reason}`);
    return transaction;
  }

  /**
   * Approves a pending transaction.
   * @param transactionId The ID of the transaction.
   * @param approverUserId The ID of the user who approved it.
   * @returns The approved transaction.
   */
  approveTransaction(transactionId: string, approverUserId: string): Transaction {
    const transaction = this._dataStore.transactions[transactionId];
    if (!transaction) {
      throw new Error("Transaction not found.");
    }
    if (transaction.status !== "PENDING_APPROVAL") {
      throw new Error(`Transaction ${transactionId} is not in PENDING_APPROVAL status.`);
    }

    transaction.status = "PENDING_EXTERNAL_PROCESSING";
    transaction.approvalUserId = approverUserId;
    transaction.approvedAt = Date.now();
    transaction.updatedAt = Date.now();
    this._dataStore.transactions[transactionId] = transaction;
    console.log(`[TransactionManager] Transaction ${transactionId} approved by ${approverUserId}. Moving to PENDING_EXTERNAL_PROCESSING.`);
    return transaction;
  }

  /**
   * Declines a pending transaction.
   * @param transactionId The ID of the transaction.
   * @param reason The reason for declining.
   * @param declinerUserId The ID of the user who declined it.
   * @returns The declined transaction.
   */
  declineTransaction(transactionId: string, reason: string, declinerUserId: string): Transaction {
    const transaction = this._dataStore.transactions[transactionId];
    if (!transaction) {
      throw new Error("Transaction not found.");
    }
    if (transaction.status !== "PENDING_APPROVAL") {
      throw new Error(`Transaction ${transactionId} is not in PENDING_APPROVAL status.`);
    }

    transaction.status = "DECLINED";
    transaction.failureReason = reason;
    transaction.approvalUserId = declinerUserId; // Using approvalUserId for decliner as well
    transaction.approvedAt = Date.now(); // Record when action was taken
    transaction.updatedAt = Date.now();
    this._dataStore.transactions[transactionId] = transaction;

    // If funds were locked, release them
    if (transaction.flowDirection === "OUTBOUND" && transaction.sourceAccountId) {
      try {
        this._accountManager.releaseFunds(transaction.sourceAccountId, transaction.amount);
        console.log(`[TransactionManager] Released locked funds for declined transaction ${transactionId}.`);
      } catch (error: any) {
        console.error(`[TransactionManager] Error releasing funds for declined transaction ${transactionId}: ${error.message}`);
      }
    }

    console.log(`[TransactionManager] Transaction ${transactionId} declined by ${declinerUserId}. Reason: ${reason}`);
    return transaction;
  }
}

class RoutingEngine {
  private _dataStore: LedgerDataStore;

  constructor(dataStore: LedgerDataStore) {
    this._dataStore = dataStore;
    console.log("[RoutingEngine] Initialized.");
  }

  /**
   * Determines the optimal external service provider for a given transaction.
   * @param transaction The transaction details.
   * @returns The selected ExternalServiceProvider or null if no route found.
   */
  determineProvider(transaction: Omit<Transaction, "transactionId" | "status" | "createdAt" | "updatedAt" | "processedAt" | "failureReason" | "relatedTransactionIds" | "approvalUserId" | "approvedAt">): ExternalServiceProvider | null {
    console.log(`[RoutingEngine] Determining provider for transaction type: ${transaction.type}, amount: ${transaction.amount} ${transaction.currency}, direction: ${transaction.flowDirection}`);

    const activeRules = Object.values(this._dataStore.routingRules)
      .filter((rule) => rule.isActive)
      .sort((a, b) => a.priority - b.priority); // Higher priority (lower number) first

    for (const rule of activeRules) {
      let matches = true;

      // Match Transaction Type
      if (rule.transactionType !== "ANY" && rule.transactionType !== transaction.type) {
        matches = false;
      }
      // Match Currency
      if (matches && rule.currency !== "ANY" && rule.currency !== transaction.currency) {
        matches = false;
      }
      // Match Flow Direction
      if (matches && rule.flowDirection !== "ANY" && rule.flowDirection !== transaction.flowDirection) {
        matches = false;
      }
      // Match Amount Range
      if (matches && rule.minAmount !== null && transaction.amount < rule.minAmount) {
        matches = false;
      }
      if (matches && rule.maxAmount !== null && transaction.amount > rule.maxAmount) {
        matches = false;
      }

      // Match custom criteria (metadata)
      if (matches) {
        for (const key in rule.criteria) {
          if (rule.criteria.hasOwnProperty(key)) {
            if (transaction.metadata[key] !== rule.criteria[key]) {
              matches = false;
              break;
            }
          }
        }
      }

      if (matches) {
        console.log(`[RoutingEngine] Matched rule ${rule.ruleId}. Selected provider: ${rule.destinationProvider}`);
        return rule.destinationProvider;
      }
    }

    console.warn(`[RoutingEngine] No suitable provider found for transaction type ${transaction.type} and amount ${transaction.amount}.`);
    return null;
  }

  /**
   * Adds or updates a routing rule.
   * @param rule The RoutingRule object.
   * @returns The updated rule.
   */
  addOrUpdateRoutingRule(rule: RoutingRule): RoutingRule {
    this._dataStore.routingRules[rule.ruleId] = rule;
    console.log(`[RoutingEngine] Routing rule ${rule.ruleId} added/updated.`);
    return rule;
  }

  /**
   * Retrieves all active routing rules.
   * @returns An array of active routing rules.
   */
  getActiveRoutingRules(): RoutingRule[] {
    return Object.values(this._dataStore.routingRules).filter((rule) => rule.isActive);
  }
}

class BusinessRulesEngine {
  private _dataStore: LedgerDataStore;

  constructor(dataStore: LedgerDataStore) {
    this._dataStore = dataStore;
    console.log("[BusinessRulesEngine] Initialized.");
  }

  /**
   * Evaluates various business rules for a given transaction.
   * @param transaction The transaction to evaluate.
   * @returns An object indicating if approval is required and any failure reasons.
   */
  evaluateTransaction(transaction: Transaction): { requiresApproval: boolean; failureReason: LedgerErrorCode | null; details: string | null } {
    console.log(`[BusinessRulesEngine] Evaluating transaction ${transaction.transactionId}...`);

    const user = this._dataStore.users[transaction.originatorId];
    if (!user) {
      console.warn(`[BusinessRulesEngine] User ${transaction.originatorId} not found for transaction ${transaction.transactionId}.`);
      return { requiresApproval: true, failureReason: "UNAUTHORIZED_ACTION", details: "Originating user not found." };
    }

    // Rule 1: KYC Status Check
    if (user.kycStatus !== "VERIFIED") {
      console.warn(`[BusinessRulesEngine] Transaction ${transaction.transactionId} requires approval: User ${user.userId} KYC not verified.`);
      return { requiresApproval: true, failureReason: "BUSINESS_RULE_VIOLATION", details: `User KYC status is ${user.kycStatus}.` };
    }

    // Rule 2: High Risk Score User
    if (user.riskScore > 50 && transaction.amount > 1000) {
      console.warn(`[BusinessRulesEngine] Transaction ${transaction.transactionId} requires approval: High-risk user (${user.riskScore}) with large transaction.`);
      return { requiresApproval: true, failureReason: "FRAUD_DETECTION_TRIGGERED", details: `User risk score ${user.riskScore} exceeds threshold for amount.` };
    }

    // Rule 3: Large Transaction Amount Thresholds (Example: USD $10,000 for any single transaction)
    if (transaction.currency === "USD" && transaction.amount > 10000) {
      console.warn(`[BusinessRulesEngine] Transaction ${transaction.transactionId} requires approval: Large USD transaction amount.`);
      return { requiresApproval: true, failureReason: "BUSINESS_RULE_VIOLATION", details: "Transaction amount exceeds automatic processing limit." };
    }
    // Example: EUR 5,000 threshold
    if (transaction.currency === "EUR" && transaction.amount > 5000) {
      console.warn(`[BusinessRulesEngine] Transaction ${transaction.transactionId} requires approval: Large EUR transaction amount.`);
      return { requiresApproval: true, failureReason: "BUSINESS_RULE_VIOLATION", details: "Transaction amount exceeds automatic processing limit." };
    }

    // Rule 4: Suspicious Transaction Patterns (simple mock)
    // E.g., multiple large transactions to new beneficiaries within a short period
    // This would require a more complex history analysis. For now, a placeholder.
    if (Math.random() < 0.01 && transaction.type === "TRANSFER_EXTERNAL_WIRE") { // 1% chance of fraud for wires
      console.warn(`[BusinessRulesEngine] Transaction ${transaction.transactionId} requires approval: Suspected fraud pattern.`);
      return { requiresApproval: true, failureReason: "FRAUD_DETECTION_TRIGGERED", details: "System detected potential fraud pattern." };
    }

    // Rule 5: Internal Account Status Check
    if (transaction.sourceAccountId) {
      const sourceAccount = this._dataStore.accounts[transaction.sourceAccountId];
      if (sourceAccount && sourceAccount.status !== "ACTIVE") {
        console.error(`[BusinessRulesEngine] Transaction ${transaction.transactionId} failed: Source account ${sourceAccount.accountId} is ${sourceAccount.status}.`);
        return { requiresApproval: false, failureReason: "ACCOUNT_NOT_FOUND", details: `Source account status is ${sourceAccount.status}.` }; // Treat as failure, not approval
      }
    }
    if (transaction.destinationAccountId) {
      const destinationAccount = this._dataStore.accounts[transaction.destinationAccountId];
      if (destinationAccount && destinationAccount.status !== "ACTIVE") {
        console.error(`[BusinessRulesEngine] Transaction ${transaction.transactionId} failed: Destination account ${destinationAccount.accountId} is ${destinationAccount.status}.`);
        return { requiresApproval: false, failureReason: "ACCOUNT_NOT_FOUND", details: `Destination account status is ${destinationAccount.status}.` }; // Treat as failure
      }
    }

    console.log(`[BusinessRulesEngine] Transaction ${transaction.transactionId} passed all immediate business rules checks.`);
    return { requiresApproval: false, failureReason: null, details: null };
  }
}

/**
 * --- Main Citibank Core Ledger and Routing Service ---
 * This class orchestrates all components to provide the ledger functionality.
 */
class CitibankCoreLedgerAndRoutingService {
  private _dataStore: LedgerDataStore;
  private _accountManager: AccountManager;
  private _transactionManager: TransactionManager;
  private _routingEngine: RoutingEngine;
  private _businessRulesEngine: BusinessRulesEngine;

  private _stripeSimulator: StripeServiceSimulator;
  private _plaidSimulator: PlaidServiceSimulator;
  private _modernTreasurySimulator: ModernTreasuryServiceSimulator;

  constructor() {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log("Initializing Citibank Core Ledger and Routing Service (citibankdemobusiness.dev)");
    console.log("--------------------------------------------------------------------------------------------------");

    this._dataStore = internalDataStore; // Use the globally defined in-memory data store

    // Initialize core managers
    this._accountManager = new AccountManager(this._dataStore);
    this._transactionManager = new TransactionManager(this._dataStore, this._accountManager);
    this._routingEngine = new RoutingEngine(this._dataStore);
    this._businessRulesEngine = new BusinessRulesEngine(this._dataStore);

    // Initialize external service simulators using configurations from the data store
    const stripeConn = this._dataStore.financialConnections["STRIPE"];
    this._stripeSimulator = new StripeServiceSimulator(stripeConn.apiKey, stripeConn.baseUrl);

    const plaidConn = this._dataStore.financialConnections["PLAID"];
    this._plaidSimulator = new PlaidServiceSimulator(plaidConn.apiKey, plaidConn.baseUrl);

    const modernTreasuryConn = this._dataStore.financialConnections["MODERN_TREASURY"];
    this._modernTreasurySimulator = new ModernTreasuryServiceSimulator(modernTreasuryConn.apiKey, modernTreasuryConn.baseUrl);

    console.log("Citibank Core Ledger and Routing Service initialized successfully.");
  }

  /**
   * Initiates a new financial transaction.
   * This is the entry point for all new transaction requests.
   * @param originatorId The ID of the user or system initiating the transaction.
   * @param idempotencyKey A unique key to prevent duplicate submissions.
   * @param amount The transaction amount.
   * @param currency The currency.
   * @param type The type of transaction.
   * @param flowDirection The direction of funds flow (INBOUND/OUTBOUND for citibankdemobusiness.dev).
   * @param description A description of the transaction.
   * @param sourceAccountId Optional internal source account ID.
   * @param destinationAccountId Optional internal destination account ID.
   * @param metadata Optional additional metadata.
   * @returns The created Transaction object, potentially in PENDING_APPROVAL or PENDING_EXTERNAL_PROCESSING state.
   */
  async initiateTransaction(
    originatorId: string,
    idempotencyKey: string,
    amount: number,
    currency: Currency,
    type: TransactionType,
    flowDirection: FlowDirection,
    description: string,
    sourceAccountId: string | null = null,
    destinationAccountId: string | null = null,
    metadata: Record<string, any> = {}
  ): Promise<Transaction> {
    console.log(`\n--- Initiating Transaction: ${idempotencyKey} (${type} ${amount} ${currency}) ---`);

    // 1. Basic Validation
    if (amount <= 0) {
      throw new Error("Transaction amount must be positive.");
    }
    if (!originatorId) {
      throw new Error("Originator ID is required.");
    }
    if (type === "TRANSFER_INTERNAL" && (!sourceAccountId || !destinationAccountId)) {
      throw new Error("Internal transfers require both source and destination accounts.");
    }
    if (type !== "TRANSFER_INTERNAL" && (!sourceAccountId && !destinationAccountId)) {
        throw new Error("External transactions must specify at least one internal account (source or destination).");
    }

    const txDetails: Omit<Transaction, "transactionId" | "status" | "createdAt" | "updatedAt" | "processedAt" | "failureReason" | "relatedTransactionIds" | "approvalUserId" | "approvedAt"> = {
      idempotencyKey,
      originatorId,
      sourceAccountId,
      destinationAccountId,
      amount,
      currency,
      type,
      flowDirection,
      provider: "CITIBANK_DEMO_BUSINESS_INTERNAL", // Default, will be updated by routing
      fees: 0, // Calculated later
      netAmount: amount, // Adjusted later
      description,
      metadata,
      requiresApproval: false,
    };

    // 2. Determine Service Provider (Routing)
    let provider: ExternalServiceProvider | null = null;
    if (type !== "TRANSFER_INTERNAL") { // Internal transfers are handled directly
      provider = this._routingEngine.determineProvider(txDetails);
      if (!provider) {
        throw new Error("ROUTING_UNAVAILABLE: No suitable external service provider found for this transaction.");
      }
      txDetails.provider = provider;
    } else {
      txDetails.provider = "CITIBANK_DEMO_BUSINESS_INTERNAL";
    }

    // 3. Create Pending Transaction in Ledger
    let transaction = this._transactionManager.createPendingTransaction(txDetails);
    console.log(`[Service] Transaction ${transaction.transactionId} created in ledger. Status: ${transaction.status}`);

    // 4. Apply Business Rules
    const ruleResult = this._businessRulesEngine.evaluateTransaction(transaction);
    if (ruleResult.failureReason) {
      console.error(`[Service] Business rule violation for transaction ${transaction.transactionId}: ${ruleResult.details}`);
      this._transactionManager.updateTransactionStatus(transaction.transactionId, "DECLINED", null, ruleResult.details, Date.now());
      throw new Error(`BUSINESS_RULE_VIOLATION: ${ruleResult.details}`);
    }
    if (ruleResult.requiresApproval) {
      transaction = this._transactionManager.requireApproval(transaction.transactionId, ruleResult.details || "Requires manual review.");
      console.log(`[Service] Transaction ${transaction.transactionId} requires manual approval. Status: PENDING_APPROVAL`);
      return transaction;
    }

    // 5. Pre-Process Funds (e.g., lock funds for outbound transactions)
    if (transaction.flowDirection === "OUTBOUND" && transaction.sourceAccountId) {
      try {
        this._accountManager.lockFunds(transaction.sourceAccountId, transaction.amount);
        console.log(`[Service] Funds ${transaction.amount} locked in source account ${transaction.sourceAccountId}.`);
      } catch (error: any) {
        console.error(`[Service] Failed to lock funds for transaction ${transaction.transactionId}: ${error.message}`);
        this._transactionManager.updateTransactionStatus(transaction.transactionId, "DECLINED", null, `Insufficient funds or account error: ${error.message}`, Date.now());
        throw new Error(`INSUFFICIENT_FUNDS: ${error.message}`);
      }
    }

    // 6. If not requiring approval, proceed to external processing
    if (transaction.status === "PENDING_EXTERNAL_PROCESSING") {
      // In a real system, this might trigger an async job. For simulation, we proceed.
      transaction = await this._processExternalTransaction(transaction);
    }

    console.log(`[Service] Transaction initiation complete for ${transaction.transactionId}. Final status: ${transaction.status}`);
    return transaction;
  }

  /**
   * Internal method to handle interaction with external service providers.
   * This logic is abstracted here to keep `initiateTransaction` cleaner.
   * @param transaction The transaction to process externally.
   * @returns The updated transaction after external processing.
   */
  private async _processExternalTransaction(transaction: Transaction): Promise<Transaction> {
    console.log(`[Service] Processing external transaction ${transaction.transactionId} via ${transaction.provider}.`);
    this._transactionManager.updateTransactionStatus(transaction.transactionId, "EXTERNAL_PROCESSING");

    try {
      let externalTxResult;
      let externalId: string | null = null;
      let actualFees = 0;

      switch (transaction.provider) {
        case "CITIBANK_DEMO_BUSINESS_INTERNAL":
          console.log(`[Service] Handling internal transfer for ${transaction.transactionId}.`);
          externalTxResult = this._transactionManager.processInternalTransfer(transaction);
          externalId = externalTxResult.transactionId;
          break;

        case "STRIPE":
          if (transaction.flowDirection === "INBOUND" && transaction.type === "CARD_PAYMENT_INBOUND") {
            // Assume payment method details are in metadata for this mock
            const paymentMethodId = transaction.metadata.paymentMethodId || "pm_mock_card_123";
            const paymentIntent = await this._stripeSimulator.createPaymentIntent(
              transaction.amount,
              transaction.currency,
              transaction.description,
              { idempotency_key: transaction.idempotencyKey, ...transaction.metadata }
            );
            externalId = paymentIntent.id;
            // Simulate confirmation immediately after creation for this mock
            const confirmedIntent = await this._stripeSimulator.confirmPaymentIntent(paymentIntent.id, paymentMethodId);

            if (confirmedIntent.status === "succeeded") {
              // Stripe fees typically ~2.9% + 30 cents for card payments
              actualFees = Math.min(transaction.amount * 0.029 + 0.30, transaction.amount);
              transaction = this._transactionManager.updateTransactionStatus(
                transaction.transactionId,
                "COMPLETED",
                confirmedIntent.id,
                null,
                Date.now(),
                { stripeChargeId: confirmedIntent.charges[0]?.id }
              );
              // Update internal account balance for INBOUND
              if (transaction.destinationAccountId) {
                this._accountManager.updateAccountBalance(transaction.destinationAccountId, transaction.netAmount);
              }
            } else if (confirmedIntent.status === "requires_action") {
              transaction = this._transactionManager.updateTransactionStatus(
                transaction.transactionId,
                "ON_HOLD", // Or a specific status like 'PENDING_SCA'
                confirmedIntent.id,
                "Stripe requires additional action (e.g., 3DS)",
                Date.now()
              );
            } else {
              throw new Error(`Stripe payment failed with status: ${confirmedIntent.status}`);
            }
          } else if (transaction.flowDirection === "OUTBOUND" && transaction.type === "REFUND") {
            const originalChargeId = transaction.metadata.originalChargeId;
            if (!originalChargeId) {
              throw new Error("Original charge ID required for Stripe refund.");
            }
            const refundResult = await this._stripeSimulator.createRefund(originalChargeId, transaction.amount);
            externalId = refundResult.id;
            // Stripe refund fees can be complex, often original fees are not returned
            actualFees = transaction.fees; // Assume existing fees for simplicity in mock
            transaction = this._transactionManager.updateTransactionStatus(
              transaction.transactionId,
              "COMPLETED",
              refundResult.id,
              null,
              Date.now(),
              { stripeRefundId: refundResult.id }
            );
            // Update internal account balance for OUTBOUND (refund)
            if (transaction.sourceAccountId) {
                // If the original transaction debited, a refund would credit
                // This logic might need to be reversed depending on how refund amounts are modeled.
                // For simplicity here, assuming 'amount' for refund is still positive, meaning money leaves the system,
                // so we update source account for the 'outbound' flow.
                this._accountManager.updateAccountBalance(transaction.sourceAccountId, -transaction.amount);
                this._accountManager.releaseFunds(transaction.sourceAccountId, transaction.amount); // Release any funds held for refund
            }

          } else {
            throw new Error(`Unsupported Stripe transaction type/direction: ${transaction.type}/${transaction.flowDirection}`);
          }
          break;

        case "PLAID":
          // Plaid is typically for linking accounts and fetching data, not direct payments/transfers.
          // For the purpose of this service, simulate account linking flow.
          if (transaction.type === "DEPOSIT" && transaction.metadata.purpose === "balance_sync") {
            // This case handles a *conceptual* transaction for Plaid fetching data.
            // No direct money movement via Plaid itself.
            console.log(`[Service] Simulating Plaid balance sync for account ${transaction.destinationAccountId}.`);
            // Assume we have an accessToken for the target account, e.g., from metadata or a lookup
            const linkedAccount = this._accountManager.getExternalAccountLinks(
              transaction.destinationAccountId!,
              "PLAID"
            ).find(link => link.accountType === "BANK");

            if (!linkedAccount) {
              throw new Error(`Plaid: No linked bank account found for internal account ${transaction.destinationAccountId}`);
            }

            const balances = await this._plaidSimulator.getAccountBalances(linkedAccount.externalId);
            const primaryBalance = balances.find(b => b.currency === transaction.currency && b.type === "depository");

            if (!primaryBalance) {
              console.warn(`[Service] No matching primary balance found for ${transaction.currency} in Plaid for ${linkedAccount.externalId}.`);
              transaction = this._transactionManager.updateTransactionStatus(
                transaction.transactionId,
                "FAILED",
                null,
                "No matching balance found in Plaid.",
                Date.now(),
                { plaid_sync_status: "failed" }
              );
            } else {
              // Here, we would *reconcile* the balance, not just apply a 'deposit' transaction.
              // For simulation, let's assume this means updating our internal account's recorded balance
              // to match Plaid's reported balance if there's a discrepancy, and generating an 'ADJUSTMENT'
              // transaction if a delta exists. For now, we'll mark the 'sync' as completed.
              const internalAccount = this._accountManager.getAccount(transaction.destinationAccountId!);
              if (internalAccount && internalAccount.currentBalance !== primaryBalance.balance) {
                const diff = primaryBalance.balance - internalAccount.currentBalance;
                console.log(`[Service] Plaid balance for ${internalAccount.accountId} is ${primaryBalance.balance}, internal is ${internalAccount.currentBalance}. Diff: ${diff}. Creating adjustment.`);
                this._transactionManager.applyAdjustment(
                  internalAccount.accountId,
                  diff,
                  `Plaid balance reconciliation for ${linkedAccount.accountName}`,
                  "system_plaid_sync",
                  { originalPlaidBalance: primaryBalance.balance, originalInternalBalance: internalAccount.currentBalance }
                );
              }
              transaction = this._transactionManager.updateTransactionStatus(
                transaction.transactionId,
                "COMPLETED",
                `plaid_sync_${linkedAccount.itemId}_${Date.now()}`,
                null,
                Date.now(),
                { plaid_sync_status: "succeeded", reportedBalance: primaryBalance.balance }
              );
            }
          } else {
            throw new Error(`Unsupported Plaid transaction type: ${transaction.type}`);
          }
          break;

        case "MODERN_TREASURY":
          if (transaction.flowDirection === "OUTBOUND" && (transaction.type === "TRANSFER_EXTERNAL_ACH" || transaction.type === "TRANSFER_EXTERNAL_WIRE")) {
            // Assume beneficiary and originator details are in metadata or from linked accounts
            const mockOriginator = { id: "cbd_orig_1", name: "Citibank Demo Business", accountNumber: "123456789", routingNumber: "987654321" };
            const mockBeneficiary = transaction.metadata.beneficiary || { name: "Example Vendor", accountNumber: "987654321", routingNumber: "123456789" };

            const paymentOrder = await this._modernTreasurySimulator.createPaymentOrder(
              transaction.amount,
              transaction.currency,
              transaction.flowDirection,
              transaction.type === "TRANSFER_EXTERNAL_ACH" ? "ACH" : "WIRE",
              mockOriginator,
              mockBeneficiary,
              { idempotencyKey: transaction.idempotencyKey, ...transaction.metadata }
            );
            externalId = paymentOrder.id;

            // MT payment orders go through multiple statuses. For this simulation, we'll assume 'initiated'
            // and then an async webhook would update it to 'completed' or 'returned'.
            // For now, mark as PENDING_EXTERNAL_PROCESSING, and the webhook listener would finalize.
            transaction = this._transactionManager.updateTransactionStatus(
              transaction.transactionId,
              "PENDING_EXTERNAL_PROCESSING",
              paymentOrder.id,
              null,
              Date.now(),
              { mtPaymentOrderStatus: paymentOrder.status }
            );
            // Funds are already locked. They will be debited from source account when webhook confirms 'completed'.
          } else if (transaction.flowDirection === "INBOUND" && transaction.type === "DEPOSIT") {
            // Modern Treasury can handle inbound payments too.
            // For simplicity, let's assume an inbound payment already happened externally, and we're just
            // recording it or reconciling it. This would usually be driven by a webhook.
            console.log(`[Service] Simulating inbound deposit via Modern Treasury. This would typically be a webhook event.`);
            // For a 'deposit' transaction via MT, we'd expect an external_id from MT's side already.
            // If the transaction starts without it, it's pending external event.
            if (!transaction.externalId) {
              transaction = this._transactionManager.updateTransactionStatus(
                transaction.transactionId,
                "PENDING_EXTERNAL_PROCESSING",
                null,
                "Waiting for Modern Treasury inbound payment confirmation (webhook).",
                Date.now()
              );
            } else {
              // Assume external event already processed and we're just recording/finalizing
              actualFees = Math.min(transaction.amount * 0.001, 1); // Small mock fee for ACH/wire
              transaction = this._transactionManager.updateTransactionStatus(
                transaction.transactionId,
                "COMPLETED",
                transaction.externalId,
                null,
                Date.now()
              );
              if (transaction.destinationAccountId) {
                this._accountManager.updateAccountBalance(transaction.destinationAccountId, transaction.netAmount);
              }
            }
          } else {
            throw new Error(`Unsupported Modern Treasury transaction type/direction: ${transaction.type}/${transaction.flowDirection}`);
          }
          break;

        default:
          throw new Error(`ROUTING_UNAVAILABLE: Unhandled provider: ${transaction.provider}`);
      }

      // Update fees and net amount after external service interaction
      if (actualFees > 0) {
          transaction.fees = actualFees;
          transaction.netAmount = transaction.amount - actualFees;
      }

      console.log(`[Service] External processing for ${transaction.transactionId} finished. Status: ${transaction.status}`);
      return transaction;

    } catch (error: any) {
      console.error(`[Service] External service processing failed for transaction ${transaction.transactionId} via ${transaction.provider}: ${error.message}`);

      // If funds were locked for an outbound transaction, attempt to release them
      if (transaction.flowDirection === "OUTBOUND" && transaction.sourceAccountId) {
        try {
          this._accountManager.releaseFunds(transaction.sourceAccountId, transaction.amount);
          console.warn(`[Service] Released locked funds for failed transaction ${transaction.transactionId}.`);
        } catch (releaseError: any) {
          console.error(`[Service] CRITICAL: Failed to release funds for failed transaction ${transaction.transactionId}: ${releaseError.message}`);
          // This would trigger an alert in a real system for manual intervention
          transaction.status = "ON_HOLD"; // Put on hold for manual review
          transaction.metadata.criticalError = "Failed to release funds after external processing failure.";
        }
      }

      return this._transactionManager.updateTransactionStatus(
        transaction.transactionId,
        "FAILED",
        null, // External ID might not be available or relevant on failure
        `External service failure: ${error.message}`,
        Date.now()
      );
    }
  }

  /**
   * Processes an incoming webhook event from an external service.
   * This is critical for updating transaction statuses asynchronously.
   * @param provider The source provider of the webhook.
   * @param eventType The type of webhook event (e.g., "charge.succeeded").
   * @param payload The raw payload from the webhook.
   * @param signature The webhook signature for verification (mocked here).
   * @returns The updated transaction (if linked) or a status message.
   */
  async processIncomingWebhook(
    provider: ExternalServiceProvider,
    eventType: string,
    payload: Record<string, any>,
    signature: string
  ): Promise<{ transaction?: Transaction; status: string; message: string }> {
    console.log(`\n--- Processing Webhook from ${provider}: ${eventType} ---`);

    const eventId = `wh_event_${generateUuid()}`;
    const receivedAt = Date.now();
    this._dataStore.webhookEvents[eventId] = {
      eventId,
      provider,
      eventType,
      payload,
      receivedAt,
      processedAt: null,
      status: "PENDING",
      error: null,
      deliveryAttempts: 1,
    };

    // 1. Validate Webhook Signature (mocked)
    const storedConnection = this._dataStore.financialConnections[provider];
    if (!storedConnection || storedConnection.webhookSecret !== "mock_webhook_secret_valid" /* Simplified mock */ && signature !== "valid_signature") {
      console.error(`[Service] Webhook from ${provider} failed signature verification.`);
      this._dataStore.webhookEvents[eventId].status = "FAILED";
      this._dataStore.webhookEvents[eventId].error = "Invalid webhook signature.";
      return { status: "error", message: "Invalid webhook signature." };
    }
    console.log(`[Service] Webhook signature verified for ${provider}.`);

    let linkedTransaction: Transaction | undefined;
    let externalId: string | null = null;
    let newLedgerStatus: TransactionStatus | null = null;
    let failureReason: string | null = null;
    let feesUpdate = 0;

    try {
      switch (provider) {
        case "STRIPE":
          if (eventType === "charge.succeeded" && payload.data?.object?.id) {
            externalId = payload.data.object.payment_intent;
            newLedgerStatus = "COMPLETED";
            // Stripe charge object contains fees in 'balance_transaction' (fetch required for accuracy)
            // For mock, let's assume we can derive fees if not present in primary payload
            feesUpdate = payload.data.object.amount_captured - payload.data.object.amount_payout; // Simplified
            console.log(`[Service] Stripe charge.succeeded webhook received for charge ${payload.data.object.id}.`);
          } else if (eventType === "charge.refunded" && payload.data?.object?.id) {
            externalId = payload.data.object.id; // Refund ID
            newLedgerStatus = "REFUNDED";
            console.log(`[Service] Stripe charge.refunded webhook received for charge ${payload.data.object.id}.`);
          } else if (eventType === "charge.failed" && payload.data?.object?.id) {
            externalId = payload.data.object.payment_intent;
            newLedgerStatus = "FAILED";
            failureReason = payload.data.object.failure_message || "Charge failed.";
            console.log(`[Service] Stripe charge.failed webhook received for charge ${payload.data.object.id}.`);
          } else {
            console.warn(`[Service] Unhandled Stripe event type: ${eventType}.`);
            return { status: "ignored", message: `Unhandled Stripe event type: ${eventType}.` };
          }
          break;

        case "MODERN_TREASURY":
          if (eventType === "payment_order.completed" && payload.data?.id) {
            externalId = payload.data.id;
            newLedgerStatus = "COMPLETED";
            // MT's fees can be complex depending on payment rail. Mock a small fee.
            feesUpdate = 0.50; // Example for ACH
            console.log(`[Service] Modern Treasury payment_order.completed webhook received for PO ${payload.data.id}.`);
          } else if (eventType === "payment_order.returned" && payload.data?.id) {
            externalId = payload.data.id;
            newLedgerStatus = "FAILED"; // Or REVERSED
            failureReason = payload.data.return_reason || "Payment order returned.";
            console.log(`[Service] Modern Treasury payment_order.returned webhook received for PO ${payload.data.id}.`);
          } else {
            console.warn(`[Service] Unhandled Modern Treasury event type: ${eventType}.`);
            return { status: "ignored", message: `Unhandled Modern Treasury event type: ${eventType}.` };
          }
          break;

        case "PLAID":
          if (eventType === "TRANSACTIONS_REMOVED" || eventType === "TRANSACTIONS_SYNC_UPDATED") {
            // Plaid webhooks usually trigger a re-sync of transactions/balances
            console.log(`[Service] Plaid transactions webhook received for item ${payload.item_id}. Triggering re-sync process.`);
            // This would trigger an internal process to fetch new transactions/balances
            // For this simulation, we just acknowledge. No direct ledger transaction update here.
            this._dataStore.webhookEvents[eventId].status = "COMPLETED";
            this._dataStore.webhookEvents[eventId].processedAt = Date.now();
            return { status: "processed", message: `Plaid sync webhook processed for item ${payload.item_id}.` };
          } else {
            console.warn(`[Service] Unhandled Plaid event type: ${eventType}.`);
            return { status: "ignored", message: `Unhandled Plaid event type: ${eventType}.` };
          }

        default:
          throw new Error(`Unhandled provider for webhook: ${provider}.`);
      }

      // Find the associated ledger transaction by external ID and provider
      linkedTransaction = Object.values(this._dataStore.transactions).find(
        (tx) => tx.externalId === externalId && tx.provider === provider && tx.status === "PENDING_EXTERNAL_PROCESSING"
      );

      if (!linkedTransaction) {
        console.warn(`[Service] No pending ledger transaction found for external ID ${externalId} from ${provider}.`);
        // It's possible for an external event to initiate a transaction (e.g., direct deposit not initiated by us)
        // In such cases, we'd create a new INBOUND transaction here.
        if (newLedgerStatus === "COMPLETED" && (provider === "STRIPE" || provider === "MODERN_TREASURY")) {
            console.log(`[Service] Creating new INBOUND transaction from webhook event for provider ${provider}, external ID ${externalId}.`);
            // This assumes a default destination account for unlinked inbound funds
            const defaultInboundAccountId = "acc_003_usd"; // Example merchant account
            if (!this._accountManager.getAccount(defaultInboundAccountId)) {
                throw new Error(`Default inbound account ${defaultInboundAccountId} not found for webhook-initiated transaction.`);
            }
            const webhookInitiatedTxDetails: Omit<Transaction, "transactionId" | "status" | "createdAt" | "updatedAt" | "processedAt" | "failureReason" | "relatedTransactionIds" | "approvalUserId" | "approvedAt"> = {
                idempotencyKey: `webhook_${provider}_${externalId}`,
                originatorId: `system_${toSnakeCase(provider)}_webhook`,
                sourceAccountId: null,
                destinationAccountId: defaultInboundAccountId,
                amount: payload.data.object.amount / 100, // Stripe amounts are in cents
                currency: payload.data.object.currency.toUpperCase() as Currency,
                type: "DEPOSIT", // Generic deposit
                flowDirection: "INBOUND",
                provider: provider,
                fees: feesUpdate,
                netAmount: (payload.data.object.amount / 100) - feesUpdate,
                description: `Webhook-initiated deposit from ${provider}.`,
                metadata: payload,
                requiresApproval: false,
            };
            let newTx = this._transactionManager.createPendingTransaction(webhookInitiatedTxDetails);
            newTx = await this._transactionManager.updateTransactionStatus(newTx.transactionId, "COMPLETED", externalId, null, Date.now());
            this._accountManager.updateAccountBalance(defaultInboundAccountId, newTx.netAmount);
            linkedTransaction = newTx;
            console.log(`[Service] Successfully created and completed new transaction ${linkedTransaction.transactionId} from webhook.`);
        } else {
            this._dataStore.webhookEvents[eventId].status = "FAILED";
            this._dataStore.webhookEvents[eventId].error = "No matching pending transaction to update.";
            return { status: "error", message: `No matching pending transaction to update for external ID ${externalId}.` };
        }
      }

      if (linkedTransaction && newLedgerStatus) {
        // Update transaction status
        linkedTransaction = this._transactionManager.updateTransactionStatus(
          linkedTransaction.transactionId,
          newLedgerStatus,
          externalId,
          failureReason,
          Date.now(),
          { ...linkedTransaction.metadata, webhookPayload: payload } // Store webhook payload for audit
        );

        // Perform balance updates based on the final status and flow
        if (newLedgerStatus === "COMPLETED") {
          if (linkedTransaction.flowDirection === "OUTBOUND" && linkedTransaction.sourceAccountId) {
            // Debit the source account (if not already debited) and release any held funds
            this._accountManager.updateAccountBalance(linkedTransaction.sourceAccountId, -linkedTransaction.amount); // Debit current balance
            this._accountManager.releaseFunds(linkedTransaction.sourceAccountId, linkedTransaction.amount); // Release held funds
            console.log(`[Service] Account ${linkedTransaction.sourceAccountId} debited and funds released for ${linkedTransaction.transactionId}.`);
          } else if (linkedTransaction.flowDirection === "INBOUND" && linkedTransaction.destinationAccountId) {
            // Credit the destination account
            this._accountManager.updateAccountBalance(linkedTransaction.destinationAccountId, linkedTransaction.netAmount);
            console.log(`[Service] Account ${linkedTransaction.destinationAccountId} credited for ${linkedTransaction.transactionId}.`);
          }
        } else if (newLedgerStatus === "FAILED" || newLedgerStatus === "DECLINED" || newLedgerStatus === "REVERSED") {
          // If transaction failed, release any held funds
          if (linkedTransaction.flowDirection === "OUTBOUND" && linkedTransaction.sourceAccountId) {
            this._accountManager.releaseFunds(linkedTransaction.sourceAccountId, linkedTransaction.amount);
            console.warn(`[Service] Released held funds for failed transaction ${linkedTransaction.transactionId}.`);
          }
        }
      }

      this._dataStore.webhookEvents[eventId].status = "COMPLETED";
      this._dataStore.webhookEvents[eventId].processedAt = Date.now();
      return { transaction: linkedTransaction, status: "success", message: "Webhook processed successfully." };

    } catch (error: any) {
      console.error(`[Service] Error processing webhook from ${provider} (${eventType}): ${error.message}`);
      this._dataStore.webhookEvents[eventId].status = "FAILED";
      this._dataStore.webhookEvents[eventId].error = error.message;
      return { status: "error", message: `Error processing webhook: ${error.message}` };
    }
  }

  /**
   * Retrieves an internal account's current balance.
   * @param accountId The ID of the account.
   * @returns The InternalAccount object.
   */
  getAccountDetails(accountId: string): InternalAccount {
    const account = this._accountManager.getAccount(accountId);
    if (!account) {
      throw new Error(`ACCOUNT_NOT_FOUND: Account with ID ${accountId} does not exist.`);
    }
    return account;
  }

  /**
   * Retrieves all transactions associated with a specific internal account.
   * @param accountId The ID of the account.
   * @returns An array of Transaction objects.
   */
  getTransactionsByAccount(accountId: string): Transaction[] {
    console.log(`[Service] Fetching all transactions for account ${accountId}.`);
    return this._transactionManager.getTransactionsForAccount(accountId);
  }

  /**
   * Links an external bank account (e.g., via Plaid) to an internal account.
   * @param accountId The internal account ID to link to.
   * @param publicToken The public token from Plaid Link (mocked).
   * @param bankName The name of the bank.
   * @param last4 The last 4 digits of the account number.
   * @param currency The currency of the external account.
   * @returns The newly created ExternalAccountLink.
   */
  async linkExternalBankAccount(
    accountId: string,
    publicToken: string,
    bankName: string,
    last4: string,
    currency: Currency
  ): Promise<ExternalAccountLink> {
    console.log(`[Service] Linking external bank account to internal account ${accountId} via Plaid.`);
    const internalAccount = this._accountManager.getAccount(accountId);
    if (!internalAccount) {
      throw new Error(`ACCOUNT_NOT_FOUND: Internal account ${accountId} not found.`);
    }

    try {
      const { accessToken, itemId } = await this._plaidSimulator.exchangePublicToken(publicToken);
      const linkId = `link_plaid_${generateUuid()}`;
      const newLink: ExternalAccountLink = {
        linkId: linkId,
        accountId: accountId,
        externalId: accessToken, // Plaid accessToken stored here
        provider: "PLAID",
        accountName: `${bankName} **${last4}`,
        accountType: "BANK",
        bankName: bankName,
        last4: last4,
        currency: currency,
        status: "ACTIVE",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      this._accountManager.addOrUpdateExternalAccountLink(newLink);
      console.log(`[Service] Successfully linked Plaid item ${itemId} to internal account ${accountId}.`);
      return newLink;
    } catch (error: any) {
      console.error(`[Service] Failed to link external bank account: ${error.message}`);
      throw new Error(`EXTERNAL_SERVICE_FAILURE: Plaid link failed - ${error.message}`);
    }
  }

  /**
   * Triggers a manual synchronization of transactions and balances for a Plaid-linked account.
   * This is typically done periodically or on demand.
   * @param linkId The ID of the external account link.
   * @returns Status of the sync operation.
   */
  async syncPlaidAccount(linkId: string): Promise<{ status: string; message: string }> {
    console.log(`[Service] Initiating Plaid account sync for link ${linkId}.`);
    const link = this._dataStore.externalAccountLinks[linkId];
    if (!link || link.provider !== "PLAID") {
      throw new Error("Invalid or non-Plaid external account link.");
    }
    if (link.status !== "ACTIVE") {
      throw new Error(`Plaid link ${linkId} is not active. Status: ${link.status}`);
    }

    try {
      const balances = await this._plaidSimulator.getAccountBalances(link.externalId);
      const today = new Date();
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      const transactions = await this._plaidSimulator.getTransactions(
        link.externalId,
        thirtyDaysAgo.toISOString().slice(0, 10),
        new Date().toISOString().slice(0, 10)
      );

      console.log(`[Service] Plaid sync for ${link.accountName} completed. Balances: ${balances.length}, Transactions: ${transactions.length}.`);

      // Here, complex reconciliation logic would occur:
      // 1. Update internal account balance based on primary Plaid balance.
      // 2. Compare fetched transactions with ledger to identify new ones.
      // 3. Create new internal transactions for any new inbound/outbound activities found.
      const internalAccount = this._accountManager.getAccount(link.accountId);
      if (internalAccount) {
        const matchingBalance = balances.find(b => b.currency === internalAccount.currency && b.type === "depository");
        if (matchingBalance && internalAccount.currentBalance !== matchingBalance.balance) {
          const diff = matchingBalance.balance - internalAccount.currentBalance;
          console.log(`[Service] Detected balance discrepancy for ${internalAccount.accountId}. Creating adjustment.`);
          this._transactionManager.applyAdjustment(
            internalAccount.accountId,
            diff,
            `Plaid sync reconciliation for ${link.accountName}`,
            "system_plaid_sync",
            { plaidReportedBalance: matchingBalance.balance, internalLedgerBalance: internalAccount.currentBalance }
          );
        }

        // For transactions, we would typically check if each Plaid transaction exists in our ledger
        // (using Plaid's transaction_id or a unique composite key) and create new ledger transactions
        // for any new ones. This is a simplified placeholder.
        transactions.forEach(plaidTx => {
            const existingTx = Object.values(this._dataStore.transactions).find(
                tx => tx.metadata.plaidTransactionId === plaidTx.transactionId
            );
            if (!existingTx) {
                const flowDir: FlowDirection = plaidTx.amount < 0 ? "OUTBOUND" : "INBOUND";
                const newTxDetails: Omit<Transaction, "transactionId" | "status" | "createdAt" | "updatedAt" | "processedAt" | "failureReason" | "relatedTransactionIds" | "approvalUserId" | "approvedAt"> = {
                    idempotencyKey: `plaid_tx_sync_${plaidTx.transactionId}`,
                    originatorId: `system_plaid_sync_${link.itemId}`,
                    sourceAccountId: flowDir === "OUTBOUND" ? link.accountId : null,
                    destinationAccountId: flowDir === "INBOUND" ? link.accountId : null,
                    amount: Math.abs(plaidTx.amount),
                    currency: plaidTx.currency,
                    type: flowDir === "INBOUND" ? "DEPOSIT" : "WITHDRAWAL",
                    flowDirection: flowDir,
                    provider: "PLAID",
                    fees: 0,
                    netAmount: Math.abs(plaidTx.amount),
                    description: `Plaid sync: ${plaidTx.description}`,
                    metadata: {
                        plaidTransactionId: plaidTx.transactionId,
                        plaidAccountId: plaidTx.accountId,
                        plaidDate: plaidTx.date,
                    },
                    requiresApproval: false,
                };
                const newLedgerTx = this._transactionManager.createPendingTransaction(newTxDetails);
                this._transactionManager.updateTransactionStatus(newLedgerTx.transactionId, "COMPLETED", `plaid_${plaidTx.transactionId}`, null, Date.parse(plaidTx.date));
                console.log(`[Service] Created ledger transaction ${newLedgerTx.transactionId} from Plaid sync.`);
            }
        });
      }


      this._accountManager.addOrUpdateExternalAccountLink({ ...link, updatedAt: Date.now() });
      return { status: "success", message: "Plaid account synchronized." };
    } catch (error: any) {
      console.error(`[Service] Plaid account sync failed for link ${linkId}: ${error.message}`);
      this._accountManager.addOrUpdateExternalAccountLink({ ...link, status: "ERROR", updatedAt: Date.now() });
      throw new Error(`EXTERNAL_SERVICE_FAILURE: Plaid sync failed - ${error.message}`);
    }
  }

  /**
   * Updates an existing routing rule.
   * @param ruleId The ID of the rule to update.
   * @param updates Partial updates to the rule.
   * @returns The updated RoutingRule.
   */
  updateRoutingRule(ruleId: string, updates: Partial<RoutingRule>): RoutingRule {
    console.log(`[Service] Updating routing rule ${ruleId}.`);
    const existingRule = this._dataStore.routingRules[ruleId];
    if (!existingRule) {
      throw new Error(`ROUTING_UNAVAILABLE: Routing rule ${ruleId} not found.`);
    }
    const updatedRule = { ...existingRule, ...updates };
    this._routingEngine.addOrUpdateRoutingRule(updatedRule); // Uses addOrUpdate to persist
    console.log(`[Service] Routing rule ${ruleId} updated successfully.`);
    return updatedRule;
  }

  /**
   * Retrieves a list of all current routing rules.
   * @returns An array of RoutingRule objects.
   */
  getAllRoutingRules(): RoutingRule[] {
    console.log("[Service] Retrieving all routing rules.");
    return this._routingEngine.getActiveRoutingRules();
  }

  /**
   * Retrieves a specific transaction by its ID.
   * @param transactionId The ID of the transaction.
   * @returns The Transaction object.
   */
  getTransactionById(transactionId: string): Transaction {
    const transaction = this._transactionManager.getTransaction(transactionId);
    if (!transaction) {
      throw new Error(`TRANSACTION_NOT_FOUND: Transaction with ID ${transactionId} does not exist.`);
    }
    return transaction;
  }

  /**
   * Creates a new internal account.
   * @param userId The ID of the user who owns this account.
   * @param accountName A descriptive name for the account.
   * @param currency The currency of the account.
   * @param accountType The type of internal account (e.g., CHECKING, MERCHANT).
   * @param initialBalance Initial balance for the account.
   * @returns The newly created InternalAccount.
   */
  createInternalAccount(
    userId: string,
    accountName: string,
    currency: Currency,
    accountType: InternalAccount["accountType"],
    initialBalance: number = 0
  ): InternalAccount {
    console.log(`[Service] Creating new internal account for user ${userId}: ${accountName} (${currency}).`);
    const user = this._dataStore.users[userId];
    if (!user) {
      throw new Error(`USER_NOT_FOUND: User with ID ${userId} does not exist.`);
    }
    const newAccount = this._accountManager.createAccount(userId, accountName, currency, accountType, initialBalance);
    console.log(`[Service] Internal account ${newAccount.accountId} created.`);
    return newAccount;
  }

  /**
   * Simulates a comprehensive daily reconciliation process across all accounts and providers.
   * This would typically involve:
   * 1. Fetching latest balances/transactions from all connected Plaid items.
   * 2. Reconciling all "PENDING_EXTERNAL_PROCESSING" transactions by querying provider statuses or waiting for webhooks.
   * 3. Identifying and flagging discrepancies.
   * 4. Generating audit reports.
   */
  async runDailyReconciliation(): Promise<{ status: string; report: Record<string, any> }> {
    console.log(`\n--- Running Daily Reconciliation for Citibank Demo Business ---`);
    const reconciliationReport: Record<string, any> = {
      timestamp: Date.now(),
      accountsReconciled: 0,
      transactionsUpdated: 0,
      discrepanciesFound: [],
      providerSyncs: {},
    };

    // Phase 1: Reconcile Plaid-linked accounts
    console.log("[Reconciliation] Phase 1: Reconciling Plaid-linked accounts...");
    const plaidLinks = Object.values(this._dataStore.externalAccountLinks).filter(link => link.provider === "PLAID");
    for (const link of plaidLinks) {
      try {
        await this.syncPlaidAccount(link.linkId);
        reconciliationReport.providerSyncs[`Plaid_${link.linkId}`] = "success";
        reconciliationReport.accountsReconciled++;
      } catch (error: any) {
        reconciliationReport.providerSyncs[`Plaid_${link.linkId}`] = `failed: ${error.message}`;
        reconciliationReport.discrepanciesFound.push(`Plaid sync failed for ${link.accountName}: ${error.message}`);
      }
    }

    // Phase 2: Update status for PENDING_EXTERNAL_PROCESSING transactions
    console.log("[Reconciliation] Phase 2: Updating pending external transactions...");
    const pendingExternalTransactions = Object.values(this._dataStore.transactions).filter(
      tx => tx.status === "PENDING_EXTERNAL_PROCESSING" && tx.externalId && tx.provider !== "CITIBANK_DEMO_BUSINESS_INTERNAL"
    );

    for (const tx of pendingExternalTransactions) {
      console.log(`[Reconciliation] Checking status for transaction ${tx.transactionId} (External ID: ${tx.externalId}) via ${tx.provider}.`);
      try {
        let externalStatus: string | null = null;
        if (tx.provider === "MODERN_TREASURY") {
          const statusResult = await this._modernTreasurySimulator.getPaymentOrderStatus(tx.externalId!);
          externalStatus = statusResult.status;
          console.log(`[Reconciliation] MT status for ${tx.externalId}: ${externalStatus}`);

          // Simulate webhook processing based on status
          if (externalStatus === "completed") {
            await this.processIncomingWebhook("MODERN_TREASURY", "payment_order.completed", { data: { id: tx.externalId, amount: tx.amount * 100, currency: tx.currency } }, "valid_signature");
            reconciliationReport.transactionsUpdated++;
          } else if (externalStatus === "returned") {
            await this.processIncomingWebhook("MODERN_TREASURY", "payment_order.returned", { data: { id: tx.externalId, return_reason: "Funds returned by bank" } }, "valid_signature");
            reconciliationReport.transactionsUpdated++;
          } else {
             console.log(`[Reconciliation] MT transaction ${tx.transactionId} still ${externalStatus}. No action taken.`);
          }
        } else if (tx.provider === "STRIPE") {
            // Stripe typically pushes webhooks immediately, direct polling for status is less common
            // but can be done for PaymentIntents. For this mock, assume webhooks handle it,
            // or if no webhook received, we might query the PaymentIntent.
            // Simplified: If it's been pending for too long, consider it a potential issue.
            if (Date.now() - tx.updatedAt > 86400000) { // If pending for more than 24 hours
                reconciliationReport.discrepanciesFound.push(`Stripe transaction ${tx.transactionId} (PI: ${tx.externalId}) pending for >24h. Manual review needed.`);
            }
        }
      } catch (error: any) {
        console.error(`[Reconciliation] Error checking external status for ${tx.transactionId}: ${error.message}`);
        reconciliationReport.discrepanciesFound.push(`Failed to check external status for transaction ${tx.transactionId}: ${error.message}`);
      }
    }

    // Phase 3: Check for internal ledger discrepancies (e.g., balances not matching sum of transactions)
    console.log("[Reconciliation] Phase 3: Checking internal ledger consistency...");
    for (const accountId in this._dataStore.accounts) {
      const account = this._dataStore.accounts[accountId];
      const transactions = this._transactionManager.getTransactionsForAccount(accountId)
        .filter(tx => tx.status === "COMPLETED"); // Only completed transactions affect final balance

      let calculatedBalance = transactions.reduce((sum, tx) => {
        // If funds moved OUT of this account, it's a debit. If IN, it's a credit.
        if (tx.sourceAccountId === accountId) {
            return sum - (tx.amount + tx.fees); // Debit
        } else if (tx.destinationAccountId === accountId) {
            return sum + (tx.amount - tx.fees); // Credit (net amount)
        }
        return sum;
      }, 0); // Starting from 0 for calculation. In a real system, you'd calculate from initial balance.
             // For this simulation, assuming initial balance is implicitly included in `currentBalance`
             // or we need a way to get the "absolute" initial balance.

      // For a more accurate test, we need to sum from an 'initial balance' point in time.
      // Let's simplify: check if recorded current balance roughly matches what transactions imply from a recent point.
      // Or, more practically, ensure `currentBalance` equals `availableBalance + onHoldBalance`.
      if (Math.abs(account.currentBalance - (account.availableBalance + account.onHoldBalance)) > 0.01) {
          reconciliationReport.discrepanciesFound.push(`Account ${accountId}: Current balance mismatch (Current: ${account.currentBalance}, Available+OnHold: ${account.availableBalance + account.onHoldBalance}).`);
          // Attempt to fix this simple discrepancy
          account.currentBalance = account.availableBalance + account.onHoldBalance;
          console.warn(`[Reconciliation] Fixed current balance for ${accountId} to match sum of available and on-hold.`);
      }

      // Deeper reconciliation would involve summing all credits and debits from transaction history
      // and comparing against the `currentBalance` for the account since its inception.
      // This requires more sophisticated ledger logic, including handling fees and net amounts carefully.
    }

    console.log(`[Reconciliation] Daily reconciliation complete. Report:`, reconciliationReport);
    return { status: "completed", report: reconciliationReport };
  }
}

// Export a singleton instance of the service.
// This ensures that the in-memory data store is consistent across all uses.
// In a real application, dependency injection or a factory would manage this.
const citibankCoreLedgerAndRoutingService = new CitibankCoreLedgerAndRoutingService();
export default citibankCoreLedgerAndRoutingService;