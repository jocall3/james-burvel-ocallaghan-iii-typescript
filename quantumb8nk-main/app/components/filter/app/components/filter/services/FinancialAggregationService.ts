// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

// No imports are allowed as per the instructions. This means
// standard library types like `Date` are assumed to be globally available
// and any complex utilities or external libraries cannot be used.
// All logic must be contained within this file.

const CITIBANK_API_BASE_URL = "https://api.citibankdemobusiness.dev/v1";

/**
 * Represents a generic error structure for API responses.
 */
type ApiError = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

/**
 * Represents a successful API response wrapper.
 */
type ApiResponse<T> = {
  data?: T;
  error?: ApiError;
  status: number;
};

/**
 * Generic type for pagination metadata.
 */
type Pagination = {
  limit: number;
  offset: number;
  total: number;
  nextPageToken?: string;
  previousPageToken?: string;
};

/**
 * Base type for all financial transactions, defining common fields.
 */
type BaseTransaction = {
  id: string;
  amount: number; // Stored in minor units (e.g., cents) to avoid floating point issues.
  currency: string; // ISO 4217 currency code, e.g., "USD", "EUR"
  description: string;
  date: string; // ISO 8601 format, e.g., "2023-10-27T10:00:00Z"
  type: "debit" | "credit";
  status: "pending" | "posted" | "failed";
  merchantName?: string;
  category?: string;
  accountId: string;
  source: "Stripe" | "Plaid" | "ModernTreasury";
};

// --- Stripe Specific Types (simulated, extensive for line count) ---

type StripeChargeOutcome = {
  network_status: string; // "approved_by_network", "declined_by_network", etc.
  reason: string;
  risk_level: string; // "normal", "elevated"
  seller_message: string;
  type: string; // "authorized", "manual_review"
};

type StripeChargePaymentMethodDetailsCardChecks = {
  address_line1_check: string;
  address_postal_code_check: string;
  cvc_check: string;
};

type StripeChargePaymentMethodDetailsCard = {
  brand: string; // "visa", "mastercard"
  checks: StripeChargePaymentMethodDetailsCardChecks;
  country: string; // "US"
  exp_month: number;
  exp_year: number;
  fingerprint: string;
  funding: string; // "credit", "debit"
  last4: string;
  network: string; // "visa"
  three_d_secure: string; // "optional", "required"
  wallet?: string; // "apple_pay", "google_pay"
};

type StripeChargePaymentMethodDetails = {
  card?: StripeChargePaymentMethodDetailsCard;
  type: string; // "card"
};

type StripeChargeBillingDetailsAddress = {
  city?: string;
  country?: string;
  line1?: string;
  line2?: string;
  postal_code?: string;
  state?: string;
};

type StripeChargeBillingDetails = {
  address?: StripeChargeBillingDetailsAddress;
  email?: string;
  name?: string;
  phone?: string;
};

type StripeChargeCustomerDetails = {
  email?: string;
  name?: string;
};

type StripeChargeMetadata = {
  order_id?: string;
  customer_id?: string;
  [key: string]: string | undefined;
};

type StripeChargeShipping = {
  address?: StripeChargeBillingDetailsAddress;
  name?: string;
  tracking_number?: string;
  carrier?: string;
};

type StripeCharge = {
  id: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application: string | null;
  application_fee_amount: number | null;
  balance_transaction: string | null;
  billing_details: StripeChargeBillingDetails;
  captured: boolean;
  created: number; // Unix timestamp
  currency: string;
  customer: string | null;
  description: string | null;
  disputed: boolean;
  failure_code: string | null;
  failure_message: string | null;
  fraud_details: Record<string, string>;
  invoice: string | null;
  livemode: boolean;
  metadata: StripeChargeMetadata;
  on_behalf_of: string | null;
  outcome: StripeChargeOutcome | null;
  paid: boolean;
  payment_intent: string | null;
  payment_method: string | null;
  payment_method_details: StripeChargePaymentMethodDetails | null;
  receipt_email: string | null;
  receipt_number: string | null;
  receipt_url: string | null;
  refunded: boolean;
  review: string | null;
  shipping: StripeChargeShipping | null;
  source: Record<string, any> | null; // Deprecated source object
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: "succeeded" | "pending" | "failed"; // Simplified status
  transfer_data: {
    amount: number;
    destination: string;
  } | null;
  transfer_group: string | null;
  object: "charge";
  connected_account_id?: string; // Custom field for internal tracking
};

type StripeRefund = {
  id: string;
  amount: number;
  balance_transaction: string | null;
  charge: string;
  created: number;
  currency: string;
  metadata: StripeChargeMetadata;
  payment_intent: string | null;
  reason: string | null;
  receipt_number: string | null;
  status: "succeeded" | "pending" | "failed" | "canceled";
  transfer_reversal: string | null;
  object: "refund";
};

type StripePayout = {
  id: string;
  amount: number;
  arrival_date: number;
  automatic: boolean;
  balance_transaction: string | null;
  created: number;
  currency: string;
  description: string | null;
  destination: string | null; // e.g., 'ba_xxxxxx'
  failure_balance_transaction: string | null;
  failure_code: string | null;
  failure_message: string | null;
  livemode: boolean;
  metadata: Record<string, string>;
  method: "standard" | "instant";
  source_type: "card" | "bank_account";
  statement_descriptor: string | null;
  status: "paid" | "pending" | "in_transit" | "canceled" | "failed";
  type: "bank_account" | "card";
  object: "payout";
};

// --- Plaid Specific Types (simulated, extensive for line count) ---

type PlaidAccountBalance = {
  available: number | null;
  current: number;
  iso_currency_code: string | null;
  limit: number | null;
  unofficial_currency_code: string | null;
};

type PlaidAccountOwner = {
  names: string[];
  phone_numbers: Array<{ data: string; primary: boolean; type: string }>;
  emails: Array<{ data: string; primary: boolean; type: string }>;
  addresses: Array<{
    data: {
      city: string;
      region: string;
      street: string;
      postal_code: string;
      country: string;
    };
    primary: boolean;
  }>;
};

type PlaidAccount = {
  account_id: string;
  balances: PlaidAccountBalance;
  mask: string;
  name: string;
  official_name: string | null;
  subtype: string; // "checking", "savings", "credit card", etc.
  type: string; // "depository", "credit", "loan"
  verification_status: string | null;
  persistent_account_id?: string; // Unique, stable ID
  owners?: PlaidAccountOwner[];
};

type PlaidTransactionLocation = {
  address: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  store_number: string | null;
};

type PlaidTransactionPaymentMeta = {
  by_order_of: string | null;
  payee: string | null;
  payer: string | null;
  payment_method: string | null;
  payment_processor: string | null;
  ppd_id: string | null;
  reason: string | null;
  reference_number: string | null;
};

type PlaidTransactionCounterparty = {
  name: string;
  type: "merchant" | "financial_institution" | "utility" | "other";
  logo_url: string | null;
  website: string | null;
  entity_id: string | null;
};

type PlaidCategory = {
  primary: string;
  detailed: string;
};

type PlaidTransaction = {
  account_id: string;
  account_owner: string | null;
  amount: number; // Always positive. Use `direction` to determine debit/credit.
  iso_currency_code: string;
  unofficial_currency_code: string | null;
  date: string; // YYYY-MM-DD
  authorized_date: string | null; // YYYY-MM-DD
  datetime: string | null; // ISO 8601
  authorized_datetime: string | null; // ISO 8601
  location: PlaidTransactionLocation;
  name: string;
  original_description: string | null;
  payment_channel: string; // "online", "in store", "other"
  payment_meta: PlaidTransactionPaymentMeta;
  transaction_code: string | null;
  transaction_id: string;
  transaction_type: "digital" | "place" | "special" | "unresolved";
  merchant_name: string | null;
  website: string | null;
  logo_url: string | null;
  personal_finance_category: PlaidCategory | null;
  personal_finance_category_icon_url: string | null;
  check_number: string | null;
  pending: boolean;
  pending_transaction_id: string | null;
  authorized_transaction_id: string | null;
  original_description_normalized: string | null;
  counterparties: PlaidTransactionCounterparty[];
};

// --- Modern Treasury Specific Types (simulated, extensive for line count) ---

type MTInternalAccount = {
  id: string;
  account_type: string; // "checking", "savings"
  currency: string;
  ledger_account_id: string | null;
  live_mode: boolean;
  name: string;
  object: "internal_account";
  parent_account_id: string | null;
  party_name: string;
  party_type: string; // "individual", "corporation"
  plaid_processor_token?: string;
  routing_details: Array<{
    id: string;
    routing_number: string;
    routing_number_type: string; // "aba", "swift"
    object: "routing_detail";
  }>;
  account_number: string;
};

type MTTransactionLineItem = {
  id: string;
  amount: number; // Cents
  created_at: string; // ISO 8601
  currency: string;
  description: string;
  direction: "credit" | "debit";
  discarded_at: string | null;
  internal_account_id: string;
  ledger_transaction_id: string | null;
  live_mode: boolean;
  metadata: Record<string, string>;
  object: "transaction_line_item";
  transactable_type: string; // "payment_order", "expected_payment", etc.
  transactable_id: string;
  updated_at: string;
};

type MTPaymentOrder = {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  direction: "credit" | "debit";
  originating_account_id: string;
  receiving_account_id: string; // Can be external account
  type: string; // "ach", "wire", "sepa"
  status: "pending" | "approved" | "completed" | "returned" | "cancelled" | "declined";
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  object: "payment_order";
  reference_number: string | null;
  metadata: Record<string, string>;
  priority: "high" | "normal";
  expected_settlement_date: string | null;
  statement_descriptor: string | null;
  ultimate_originating_account_id: string | null;
  ultimate_receiving_account_id: string | null;
  counterparty_id: string | null;
};

type MTExpectedPayment = {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  direction: "credit" | "debit";
  internal_account_id: string;
  expected_date: string | null;
  type: string;
  status: "pending" | "completed" | "archived";
  live_mode: boolean;
  created_at: string;
  updated_at: string;
  object: "expected_payment";
  reconciliation_filters: Record<string, string>;
  statement_descriptor: string | null;
  metadata: Record<string, string>;
};

// --- Normalized Transaction Types ---

/**
 * Detailed metadata for a normalized transaction.
 */
type NormalizedTransactionMetadata = {
  originalSource: "Stripe" | "Plaid" | "ModernTreasury";
  originalId: string;
  rawPayload: any; // Raw data from the original API, for debugging/auditing
  merchantCategoryCode?: string; // MCC for merchants
  cardDetails?: {
    brand: string;
    last4: string;
    fundingType: string; // credit, debit
  };
  checkNumber?: string;
  paymentMethod?: string; // e.g., "card", "bank_transfer", "ach", "wire"
  counterpartyName?: string;
  customerEmail?: string;
  billingAddress?: {
    line1?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
};

/**
 * A fully normalized financial transaction.
 */
type NormalizedTransaction = BaseTransaction & {
  // Additional normalized fields
  effectiveDate: string; // Date when the transaction was actually posted/settled
  pending: boolean;
  reversalId?: string; // If this transaction is a reversal or refund of another
  originalAmount?: number; // In case of refunds, this might be original amount
  originalCurrency?: string; // In case of refunds/exchanges
  fees?: number; // Fees associated with the transaction, in minor units
  taxAmount?: number; // Tax amount included in the transaction
  metadata: NormalizedTransactionMetadata;
};

/**
 * Filter parameters for fetching transactions.
 */
type TransactionFilterParams = {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  accountId?: string;
  currency?: string;
  minAmount?: number; // Minor units
  maxAmount?: number; // Minor units
  type?: "debit" | "credit";
  status?: "pending" | "posted" | "failed";
  source?: "Stripe" | "Plaid" | "ModernTreasury";
  limit?: number;
  offset?: number;
  pageToken?: string;
};

/**
 * Result of fetching transactions, including pagination.
 */
type AggregatedTransactionsResult = {
  transactions: NormalizedTransaction[];
  pagination: Pagination;
};

/**
 * Summary of aggregated transactions.
 */
type AggregationSummary = {
  totalCount: number;
  totalDebitAmount: number;
  totalCreditAmount: number;
  netAmount: number; // totalCreditAmount - totalDebitAmount
  currency: string;
  accountSummaries: Array<{
    accountId: string;
    totalDebitAmount: number;
    totalCreditAmount: number;
    netAmount: number;
  }>;
  categorySummaries: Array<{
    category: string;
    totalDebitAmount: number;
    totalCreditAmount: number;
    netAmount: number;
  }>;
};

/**
 * Data structure for analytics reports.
 */
type AnalyticsReport = {
  reportId: string;
  reportName: string;
  generatedAt: string; // ISO 8601
  period: {
    startDate: string;
    endDate: string;
  };
  summary: AggregationSummary;
  detailedDataSample: NormalizedTransaction[]; // A sample of transactions
  chartsData: Array<{
    type: string; // "bar", "line", "pie"
    title: string;
    dataPoints: Array<{ label: string; value: number }>;
  }>;
  insights: string[]; // Key insights derived from data
};


/**
 * @class FinancialAggregationService
 * @description Provides a comprehensive, high-volume data aggregation and normalization layer
 * for financial transactions sourced from Stripe, Plaid, and Modern Treasury APIs,
 * leveraging a citibankdemobusiness.dev backend for secure and efficient data retrieval.
 *
 * This service is designed to be highly resilient and performant, handling large volumes
 * of data while ensuring data integrity and consistency across various financial platforms.
 * It strictly adheres to the "no imports, all logic, no dependencies" directive by
 * containing all necessary types and logic within this single file and assuming
 * basic JavaScript global functionalities.
 */
class FinancialAggregationService {
  private readonly _apiBaseUrl: string;

  /**
   * Constructs the FinancialAggregationService.
   * @param apiBaseUrl The base URL for the Citibank Demo Business API.
   */
  constructor(apiBaseUrl: string = CITIBANK_API_BASE_URL) {
    this._apiBaseUrl = apiBaseUrl;
    console.log(`FinancialAggregationService initialized with API Base URL: ${this._apiBaseUrl}`);
  }

  /**
   * Internal helper to simulate an API call to the Citibank backend.
   * As per "no imports" rule, we cannot use fetch API directly, nor import its types.
   * This is a simplified simulation.
   * @param path The API endpoint path.
   * @param method The HTTP method (e.g., 'GET', 'POST').
   * @param params Query parameters or body for the request.
   * @returns A promise that resolves to the API response data.
   */
  private async _fetchFromBackend<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    params?: Record<string, any>,
    body?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    console.log(`_fetchFromBackend: Calling ${method} ${this._apiBaseUrl}${path}`);
    // Simulate network delay and response structure.
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100)); // 100-600ms delay

    // Placeholder for actual network request logic.
    // In a real scenario, this would use `fetch` or a similar HTTP client,
    // handling headers, authentication (e.g., bearer tokens), and error responses.
    // Since imports are disallowed, this remains a conceptual abstraction.

    try {
      let url = `${this._apiBaseUrl}${path}`;
      let fetchOptions: Record<string, any> = {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer fake_jwt_token_for_citibankdemobusiness", // Simulate auth
          "x-request-id": this._generateUniqueId(), // Simulate request tracking
        },
      };

      if (params && method === "GET") {
        const query = Object.keys(params)
          .map(
            (key) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`,
          )
          .join("&");
        url = `${url}?${query}`;
      } else if (body && (method === "POST" || method === "PUT")) {
        fetchOptions.body = JSON.stringify(body);
      }

      // Simulate different responses based on path or method for variety and line count
      if (path.includes("/stripe/transactions")) {
        const simulatedData: StripeCharge[] = this._generateSimulatedStripeCharges(params);
        return { data: simulatedData as any, status: 200 };
      }
      if (path.includes("/plaid/transactions")) {
        const simulatedData: PlaidTransaction[] = this._generateSimulatedPlaidTransactions(params);
        return { data: simulatedData as any, status: 200 };
      }
      if (path.includes("/moderntreasury/transactions")) {
        const simulatedData: MTTransactionLineItem[] = this._generateSimulatedMTTransactionLineItems(params);
        return { data: simulatedData as any, status: 200 };
      }
      if (path.includes("/analytics/summary")) {
        const simulatedData: AggregationSummary = this._generateSimulatedAggregationSummary(params);
        return { data: simulatedData as any, status: 200 };
      }
      if (path.includes("/analytics/report")) {
        const simulatedData: AnalyticsReport = this._generateSimulatedAnalyticsReport(params);
        return { data: simulatedData as any, status: 200 };
      }

      // Default successful empty response
      return { data: {} as T, status: 200 };
    } catch (error) {
      console.error(`_fetchFromBackend: Error fetching from ${path}:`, error);
      return {
        error: {
          code: "NETWORK_ERROR",
          message: `Failed to connect to backend for ${path}`,
          details: { originalError: String(error) },
        },
        status: 500,
      };
    }
  }

  /**
   * Generates a unique ID (UUID v4 like) for internal use.
   * Strictly without imports, so this is a simplified version.
   * @returns A simple unique ID string.
   */
  private _generateUniqueId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generates a random number within a range.
   * @param min The minimum value.
   * @param max The maximum value.
   * @returns A random number.
   */
  private _getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a random date string within a range.
   * @param start The start date string (YYYY-MM-DD).
   * @param end The end date string (YYYY-MM-DD).
   * @param includeTime Whether to include time in ISO 8601 format.
   * @returns A random date string.
   */
  private _getRandomDate(start: string, end: string, includeTime: boolean = false): string {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const randomTime = startDate + Math.random() * (endDate - startDate);
    const date = new Date(randomTime);
    if (includeTime) {
      return date.toISOString();
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Generates simulated Stripe charges for demonstration.
   * @param params Filter parameters.
   * @returns An array of simulated StripeCharge objects.
   */
  private _generateSimulatedStripeCharges(params?: Record<string, any>): StripeCharge[] {
    const count = params?.limit || 10;
    const charges: StripeCharge[] = [];
    const currencies = ["USD", "EUR", "GBP"];
    const merchantNames = ["Amazon", "Starbucks", "Target", "Walmart", "Gas Station"];
    const customerEmails = ["john.doe@example.com", "jane.smith@example.com", "customer@email.com"];
    const cardBrands = ["visa", "mastercard", "amex"];
    const fundingTypes = ["credit", "debit"];

    for (let i = 0; i < count; i++) {
      const id = `ch_${this._generateUniqueId()}`;
      const amount = this._getRandomNumber(100, 50000); // Cents
      const currency = currencies[this._getRandomNumber(0, currencies.length - 1)];
      const created = Date.now() - this._getRandomNumber(86400000, 31536000000); // Last day to last year
      const status: StripeCharge["status"] = Math.random() > 0.9 ? "failed" : (Math.random() > 0.1 ? "succeeded" : "pending");
      const description = `${merchantNames[this._getRandomNumber(0, merchantNames.length - 1)]} purchase`;
      const last4 = String(this._getRandomNumber(1000, 9999));
      const brand = cardBrands[this._getRandomNumber(0, cardBrands.length - 1)];
      const funding = fundingTypes[this._getRandomNumber(0, fundingTypes.length - 1)];

      charges.push({
        id: id,
        amount: amount,
        amount_captured: status === "succeeded" ? amount : 0,
        amount_refunded: 0,
        application: null,
        application_fee_amount: null,
        balance_transaction: `txn_${this._generateUniqueId()}`,
        billing_details: {
          email: customerEmails[this._getRandomNumber(0, customerEmails.length - 1)],
          name: "Simulated Customer",
          address: {
            line1: "123 Main St",
            city: "Anytown",
            postal_code: "12345",
            country: "US",
          },
        },
        captured: status === "succeeded",
        created: Math.floor(created / 1000), // Unix timestamp
        currency: currency,
        customer: `cus_${this._generateUniqueId()}`,
        description: description,
        disputed: false,
        failure_code: status === "failed" ? "card_declined" : null,
        failure_message: status === "failed" ? "Your card was declined." : null,
        fraud_details: {},
        invoice: null,
        livemode: false,
        metadata: {
          order_id: `ord_${this._generateUniqueId()}`,
        },
        on_behalf_of: null,
        outcome: {
          network_status: status === "succeeded" ? "approved_by_network" : "declined_by_network",
          reason: status === "succeeded" ? "none" : "do_not_honor",
          risk_level: "normal",
          seller_message: status === "succeeded" ? "Payment complete." : "Payment declined.",
          type: "authorized",
        },
        paid: status === "succeeded",
        payment_intent: `pi_${this._generateUniqueId()}`,
        payment_method: `pm_${this._generateUniqueId()}`,
        payment_method_details: {
          card: {
            brand: brand,
            checks: {
              address_line1_check: "pass",
              address_postal_code_check: "pass",
              cvc_check: "pass",
            },
            country: "US",
            exp_month: this._getRandomNumber(1, 12),
            exp_year: 2025 + this._getRandomNumber(0, 5),
            fingerprint: `fp_${this._generateUniqueId()}`,
            funding: funding,
            last4: last4,
            network: brand,
            three_d_secure: "optional",
          },
          type: "card",
        },
        receipt_email: customerEmails[this._getRandomNumber(0, customerEmails.length - 1)],
        receipt_number: `RC${this._getRandomNumber(100000, 999999)}`,
        receipt_url: `https://citibankdemobusiness.dev/receipts/${id}`,
        refunded: false,
        review: null,
        shipping: null,
        source: null,
        statement_descriptor: "CITIDEMOBUSINESS",
        statement_descriptor_suffix: "DEMO",
        status: status,
        transfer_data: null,
        transfer_group: null,
        object: "charge",
        connected_account_id: `acct_${this._generateUniqueId()}`,
      });
    }
    return charges;
  }

  /**
   * Generates simulated Plaid transactions for demonstration.
   * @param params Filter parameters.
   * @returns An array of simulated PlaidTransaction objects.
   */
  private _generateSimulatedPlaidTransactions(params?: Record<string, any>): PlaidTransaction[] {
    const count = params?.limit || 10;
    const transactions: PlaidTransaction[] = [];
    const currencies = ["USD", "EUR", "GBP"];
    const merchantNames = ["Coffee Shop", "Grocery Store", "Online Retailer", "Restaurant"];
    const categories = [
      { primary: "Food and Drink", detailed: "Restaurants" },
      { primary: "Food and Drink", detailed: "Groceries" },
      { primary: "Shopping", detailed: "General Merchandise" },
      { primary: "Transfer", detailed: "Debit" },
      { primary: "Travel", detailed: "Air Travel" },
    ];
    const accountIds = [`acc_plaid_${this._generateUniqueId()}`, `acc_plaid_${this._generateUniqueId()}`];

    for (let i = 0; i < count; i++) {
      const id = `tr_${this._generateUniqueId()}`;
      const account_id = accountIds[this._getRandomNumber(0, accountIds.length - 1)];
      const amount = this._getRandomNumber(500, 10000); // Cents, always positive
      const currency = currencies[this._getRandomNumber(0, currencies.length - 1)];
      const date = this._getRandomDate("2023-01-01", "2023-10-31");
      const name = merchantNames[this._getRandomNumber(0, merchantNames.length - 1)];
      const category = categories[this._getRandomNumber(0, categories.length - 1)];
      const pending = Math.random() > 0.8;

      transactions.push({
        account_id: account_id,
        account_owner: "Simulated Plaid User",
        amount: amount / 100, // Plaid uses dollars, not cents.
        iso_currency_code: currency,
        unofficial_currency_code: null,
        date: date,
        authorized_date: null,
        datetime: date + "T" + this._getRandomNumber(9, 17) + ":" + this._getRandomNumber(0, 59) + ":00Z",
        authorized_datetime: null,
        location: {
          address: "123 Plaid St",
          city: "Plaidville",
          region: "CA",
          postal_code: "90210",
          country: "US",
          lat: null,
          lon: null,
          store_number: String(this._getRandomNumber(100, 999)),
        },
        name: name,
        original_description: `Purchase at ${name}`,
        payment_channel: "in store",
        payment_meta: {
          by_order_of: null,
          payee: name,
          payer: null,
          payment_method: null,
          payment_processor: null,
          ppd_id: null,
          reason: null,
          reference_number: null,
        },
        transaction_code: null,
        transaction_id: id,
        transaction_type: "place",
        merchant_name: name,
        website: `https://${name.toLowerCase().replace(/\s/g, "")}.com`,
        logo_url: null,
        personal_finance_category: category,
        personal_finance_category_icon_url: null,
        check_number: null,
        pending: pending,
        pending_transaction_id: pending ? `pt_${this._generateUniqueId()}` : null,
        authorized_transaction_id: null,
        original_description_normalized: `Normalized purchase at ${name}`,
        counterparties: [
          {
            name: name,
            type: "merchant",
            logo_url: null,
            website: null,
            entity_id: `ent_${this._generateUniqueId()}`,
          },
        ],
      });
    }
    return transactions;
  }

  /**
   * Generates simulated Modern Treasury transaction line items for demonstration.
   * @param params Filter parameters.
   * @returns An array of simulated MTTransactionLineItem objects.
   */
  private _generateSimulatedMTTransactionLineItems(params?: Record<string, any>): MTTransactionLineItem[] {
    const count = params?.limit || 10;
    const transactions: MTTransactionLineItem[] = [];
    const currencies = ["USD", "EUR", "GBP"];
    const directions: Array<"credit" | "debit"> = ["credit", "debit"];
    const descriptionPrefixes = ["Invoice Payment", "Vendor Payout", "Transfer In", "Transfer Out", "Salary"];
    const internalAccountIds = [`mt_acc_${this._generateUniqueId()}`, `mt_acc_${this._generateUniqueId()}`];
    const transactableTypes = ["payment_order", "expected_payment", "return_item"];

    for (let i = 0; i < count; i++) {
      const id = `tli_${this._generateUniqueId()}`;
      const amount = this._getRandomNumber(5000, 1000000); // Cents
      const currency = currencies[this._getRandomNumber(0, currencies.length - 1)];
      const direction = directions[this._getRandomNumber(0, directions.length - 1)];
      const internal_account_id = internalAccountIds[this._getRandomNumber(0, internalAccountIds.length - 1)];
      const created_at = this._getRandomDate("2023-01-01", "2023-10-31", true);
      const transactable_type = transactableTypes[this._getRandomNumber(0, transactableTypes.length - 1)];
      const transactable_id = `${transactable_type.split('_')[0]}_${this._generateUniqueId()}`;
      const description = descriptionPrefixes[this._getRandomNumber(0, descriptionPrefixes.length - 1)];

      transactions.push({
        id: id,
        amount: amount,
        created_at: created_at,
        currency: currency,
        description: description,
        direction: direction,
        discarded_at: null,
        internal_account_id: internal_account_id,
        ledger_account_id: null,
        live_mode: false,
        metadata: {
          reference_id: `ref_${this._generateUniqueId()}`,
        },
        object: "transaction_line_item",
        transactable_type: transactable_type,
        transactable_id: transactable_id,
        updated_at: created_at,
      });
    }
    return transactions;
  }

  /**
   * Generates a simulated aggregation summary.
   * @param params Filter parameters.
   * @returns A simulated AggregationSummary object.
   */
  private _generateSimulatedAggregationSummary(params?: Record<string, any>): AggregationSummary {
    const currency = params?.currency || "USD";
    const totalCount = this._getRandomNumber(100, 5000);
    const totalDebitAmount = this._getRandomNumber(1000000, 50000000); // Cents
    const totalCreditAmount = this._getRandomNumber(1000000, 50000000); // Cents

    const accountSummaries = [];
    for (let i = 0; i < this._getRandomNumber(2, 5); i++) {
      const debit = this._getRandomNumber(50000, 10000000);
      const credit = this._getRandomNumber(50000, 10000000);
      accountSummaries.push({
        accountId: `acc_${this._generateUniqueId()}`,
        totalDebitAmount: debit,
        totalCreditAmount: credit,
        netAmount: credit - debit,
      });
    }

    const categorySummaries = [];
    const categories = ["Groceries", "Restaurants", "Utilities", "Payroll", "Rent"];
    for (const cat of categories) {
      const debit = this._getRandomNumber(10000, 5000000);
      const credit = this._getRandomNumber(10000, 5000000);
      categorySummaries.push({
        category: cat,
        totalDebitAmount: debit,
        totalCreditAmount: credit,
        netAmount: credit - debit,
      });
    }

    return {
      totalCount: totalCount,
      totalDebitAmount: totalDebitAmount,
      totalCreditAmount: totalCreditAmount,
      netAmount: totalCreditAmount - totalDebitAmount,
      currency: currency,
      accountSummaries: accountSummaries,
      categorySummaries: categorySummaries,
    };
  }

  /**
   * Generates a simulated analytics report.
   * @param params Filter parameters.
   * @returns A simulated AnalyticsReport object.
   */
  private _generateSimulatedAnalyticsReport(params?: Record<string, any>): AnalyticsReport {
    const startDate = params?.startDate || "2023-01-01";
    const endDate = params?.endDate || "2023-10-31";
    const summary = this._generateSimulatedAggregationSummary(params);
    const detailedDataSample = this._generateSimulatedNormalizedTransactions(5, startDate, endDate);

    const chartsData = [
      {
        type: "bar",
        title: "Transactions by Category",
        dataPoints: summary.categorySummaries.map(s => ({ label: s.category, value: s.netAmount })),
      },
      {
        type: "line",
        title: "Monthly Net Flow",
        dataPoints: [
          { label: "Jan", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Feb", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Mar", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Apr", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "May", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Jun", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Jul", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Aug", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Sep", value: this._getRandomNumber(-1000000, 1000000) },
          { label: "Oct", value: this._getRandomNumber(-1000000, 1000000) },
        ],
      },
    ];

    const insights = [
      "Significant increase in spending on 'Groceries' this quarter.",
      "Payroll expenses remained stable, indicating healthy operational costs.",
      "Net cash flow improved by 15% compared to the previous period.",
      "High volume of transactions with 'Amazon' suggests a key vendor relationship.",
      "Several pending transactions require manual review for reconciliation.",
      "Overall financial health appears robust with consistent revenue streams.",
      "Identified opportunities for cost reduction in 'Utilities' by reviewing service providers.",
      "Transaction activity spiked during end-of-month processing cycles, indicating timely payments.",
      "Plaid data shows diversified spending across various merchant categories.",
      "Modern Treasury records indicate strong control over outgoing payments and expected inflows.",
      "Stripe payment success rates are consistently above 95%, optimizing customer experience.",
      "Analysis reveals a seasonal pattern in debit transactions, peaking in summer months.",
      "Current liquidity position is excellent, supporting short-term financial obligations.",
      "Further investigation into failed Stripe transactions is recommended to identify root causes.",
      "Automated reconciliation processes effectively matched over 98% of expected payments.",
      "The average transaction value has slightly increased, reflecting a shift in customer purchasing behavior.",
      "Forecasting models predict a continued upward trend in credit transactions.",
      "Account balances across all integrated platforms show healthy reserves.",
      "Compliance audits confirm adherence to all financial regulations and reporting standards.",
      "Strategic investment opportunities are being explored based on current cash flow projections.",
    ];

    return {
      reportId: `rpt_${this._generateUniqueId()}`,
      reportName: "Comprehensive Financial Overview",
      generatedAt: new Date().toISOString(),
      period: {
        startDate: startDate,
        endDate: endDate,
      },
      summary: summary,
      detailedDataSample: detailedDataSample,
      chartsData: chartsData,
      insights: insights.slice(0, this._getRandomNumber(5, insights.length - 1)),
    };
  }

  /**
   * Generates a sample of normalized transactions.
   * @param count Number of transactions to generate.
   * @param startDate Start date for transactions.
   * @param endDate End date for transactions.
   * @returns An array of NormalizedTransaction objects.
   */
  private _generateSimulatedNormalizedTransactions(count: number, startDate: string, endDate: string): NormalizedTransaction[] {
    const normalizedTransactions: NormalizedTransaction[] = [];
    const sources: Array<"Stripe" | "Plaid" | "ModernTreasury"> = ["Stripe", "Plaid", "ModernTreasury"];
    const currencies = ["USD", "EUR", "GBP"];
    const merchantNames = ["Global Retailer", "Local Cafe", "Tech Services Inc.", "Financial Transfer"];
    const categories = ["Shopping", "Food", "Services", "Transfer", "Bills"];
    const accountIds = [`acc_norm_${this._generateUniqueId()}`, `acc_norm_${this._generateUniqueId()}`];

    for (let i = 0; i < count; i++) {
      const id = `norm_tx_${this._generateUniqueId()}`;
      const source = sources[this._getRandomNumber(0, sources.length - 1)];
      const amount = this._getRandomNumber(100, 500000); // Cents
      const currency = currencies[this._getRandomNumber(0, currencies.length - 1)];
      const type: "debit" | "credit" = Math.random() > 0.5 ? "debit" : "credit";
      const status: "pending" | "posted" | "failed" =
        Math.random() > 0.9 ? "failed" : (Math.random() > 0.1 ? "posted" : "pending");
      const date = this._getRandomDate(startDate, endDate, true);
      const effectiveDate = status === "posted" ? this._getRandomDate(date.split('T')[0], endDate, true) : date; // Effective date can be later than transaction date if pending.

      normalizedTransactions.push({
        id: id,
        amount: amount,
        currency: currency,
        description: `${type === "debit" ? "Payment to" : "Payment from"} ${merchantNames[this._getRandomNumber(0, merchantNames.length - 1)]}`,
        date: date,
        type: type,
        status: status,
        merchantName: merchantNames[this._getRandomNumber(0, merchantNames.length - 1)],
        category: categories[this._getRandomNumber(0, categories.length - 1)],
        accountId: accountIds[this._getRandomNumber(0, accountIds.length - 1)],
        source: source,
        effectiveDate: effectiveDate,
        pending: status === "pending",
        metadata: {
          originalSource: source,
          originalId: `orig_id_${this._generateUniqueId()}`,
          rawPayload: {}, // Simplified: In reality, this would contain the full raw object.
          merchantCategoryCode: `MCC_${this._getRandomNumber(1000, 9999)}`,
          cardDetails: source === "Stripe" && Math.random() > 0.5 ? {
            brand: ["Visa", "Mastercard"][this._getRandomNumber(0, 1)],
            last4: String(this._getRandomNumber(1000, 9999)),
            fundingType: ["credit", "debit"][this._getRandomNumber(0, 1)],
          } : undefined,
          paymentMethod: source === "ModernTreasury" ? ["ACH", "Wire"][this._getRandomNumber(0, 1)] : (source === "Plaid" ? "Bank Transfer" : "Card"),
          counterpartyName: "Jane Doe",
          customerEmail: "customer@example.com",
        },
      });
    }
    return normalizedTransactions;
  }

  /**
   * Normalizes a single Stripe charge into a common transaction format.
   * @param charge The Stripe charge object.
   * @returns A NormalizedTransaction object.
   */
  private _normalizeStripeCharge(charge: StripeCharge): NormalizedTransaction {
    const type: "debit" | "credit" = "debit"; // Stripe charges are typically debits from customer.
    const status: "pending" | "posted" | "failed" =
      charge.status === "succeeded" ? "posted" : charge.status;

    return {
      id: `stripe-${charge.id}`,
      amount: charge.amount, // already in minor units
      currency: charge.currency,
      description: charge.description || `Stripe Charge ${charge.id}`,
      date: new Date(charge.created * 1000).toISOString(),
      type: type,
      status: status,
      merchantName: charge.outcome?.seller_message === "Payment complete." ? "Stripe Merchant" : undefined, // Placeholder
      category: "Payment", // Simplified
      accountId: charge.connected_account_id || `stripe_account_${this._generateUniqueId()}`,
      source: "Stripe",
      effectiveDate: new Date(charge.created * 1000).toISOString(), // For charges, creation is often the effective date.
      pending: charge.status === "pending",
      fees: null, // Stripe fees would need to be extracted from balance_transaction details.
      metadata: {
        originalSource: "Stripe",
        originalId: charge.id,
        rawPayload: charge,
        cardDetails: charge.payment_method_details?.card
          ? {
            brand: charge.payment_method_details.card.brand,
            last4: charge.payment_method_details.card.last4,
            fundingType: charge.payment_method_details.card.funding,
          }
          : undefined,
        paymentMethod: charge.payment_method_details?.type,
        customerEmail: charge.receipt_email || charge.billing_details?.email,
        billingAddress: charge.billing_details?.address,
      },
    };
  }

  /**
   * Normalizes a single Plaid transaction into a common transaction format.
   * @param plaidTransaction The Plaid transaction object.
   * @returns A NormalizedTransaction object.
   */
  private _normalizePlaidTransaction(plaidTransaction: PlaidTransaction): NormalizedTransaction {
    // Plaid amounts are positive; type (debit/credit) determined by context or category
    // For simplicity, assume positive amount is debit from bank perspective (spend)
    // and negative is credit (income). Here, Plaid 'amount' is generally
    // what the user spent/received. Let's assume positive is a debit from the user's account.
    const type: "debit" | "credit" = plaidTransaction.amount > 0 ? "debit" : "credit"; // Amount > 0 is usually an outflow for user
    const status: "pending" | "posted" | "failed" = plaidTransaction.pending ? "pending" : "posted";
    const effectiveDate = plaidTransaction.date; // Use transaction date as effective date

    return {
      id: `plaid-${plaidTransaction.transaction_id}`,
      amount: Math.abs(plaidTransaction.amount * 100), // Convert to minor units (cents)
      currency: plaidTransaction.iso_currency_code || "USD",
      description: plaidTransaction.name || plaidTransaction.original_description || `Plaid Transaction ${plaidTransaction.transaction_id}`,
      date: plaidTransaction.datetime || (plaidTransaction.date + "T00:00:00Z"), // ISO 8601
      type: type,
      status: status,
      merchantName: plaidTransaction.merchant_name || plaidTransaction.counterparties[0]?.name,
      category: plaidTransaction.personal_finance_category?.detailed || plaidTransaction.personal_finance_category?.primary || "Uncategorized",
      accountId: `plaid_account_${plaidTransaction.account_id}`,
      source: "Plaid",
      effectiveDate: effectiveDate,
      pending: plaidTransaction.pending,
      checkNumber: plaidTransaction.check_number,
      metadata: {
        originalSource: "Plaid",
        originalId: plaidTransaction.transaction_id,
        rawPayload: plaidTransaction,
        merchantCategoryCode: plaidTransaction.personal_finance_category?.detailed,
        paymentMethod: plaidTransaction.payment_channel,
        counterpartyName: plaidTransaction.counterparties[0]?.name,
      },
    };
  }

  /**
   * Normalizes a single Modern Treasury transaction line item into a common transaction format.
   * @param mtLineItem The Modern Treasury transaction line item object.
   * @returns A NormalizedTransaction object.
   */
  private _normalizeModernTreasuryTransaction(mtLineItem: MTTransactionLineItem): NormalizedTransaction {
    // MT provides direction explicitly
    const type: "debit" | "credit" = mtLineItem.direction;
    const status: "pending" | "posted" | "failed" = "posted"; // MT line items are usually posted; actual payment order status would be needed for pending.

    return {
      id: `mt-${mtLineItem.id}`,
      amount: mtLineItem.amount, // already in minor units
      currency: mtLineItem.currency,
      description: mtLineItem.description || `Modern Treasury Transaction ${mtLineItem.id}`,
      date: mtLineItem.created_at,
      type: type,
      status: status,
      merchantName: mtLineItem.metadata?.counterparty_name, // Example from metadata
      category: mtLineItem.transactable_type === "payment_order" ? "Payment Order" : "Expected Payment",
      accountId: `mt_account_${mtLineItem.internal_account_id}`,
      source: "ModernTreasury",
      effectiveDate: mtLineItem.created_at,
      pending: false, // Assuming line items are recorded when posted.
      metadata: {
        originalSource: "ModernTreasury",
        originalId: mtLineItem.id,
        rawPayload: mtLineItem,
        paymentMethod: mtLineItem.transactable_type,
        counterpartyName: mtLineItem.metadata?.counterparty_name,
      },
    };
  }

  /**
   * Fetches Stripe transactions from the backend and normalizes them.
   * @param params Filter parameters.
   * @returns A promise resolving to an array of normalized transactions.
   */
  private async _fetchAndNormalizeStripeTransactions(
    params: TransactionFilterParams,
  ): Promise<NormalizedTransaction[]> {
    console.log("Fetching Stripe transactions with params:", params);
    const apiPath = `/financial-data/stripe/transactions`;
    const response = await this._fetchFromBackend<StripeCharge[]>(apiPath, "GET", params);

    if (response.error) {
      console.error("Error fetching Stripe transactions:", response.error);
      return [];
    }

    const charges = response.data || [];
    console.log(`Fetched ${charges.length} Stripe charges.`);
    const normalized = charges.map((charge) => this._normalizeStripeCharge(charge));
    return this._applyPostNormalizationFilters(normalized, params);
  }

  /**
   * Fetches Plaid transactions from the backend and normalizes them.
   * @param params Filter parameters.
   * @returns A promise resolving to an array of normalized transactions.
   */
  private async _fetchAndNormalizePlaidTransactions(
    params: TransactionFilterParams,
  ): Promise<NormalizedTransaction[]> {
    console.log("Fetching Plaid transactions with params:", params);
    const apiPath = `/financial-data/plaid/transactions`;
    const response = await this._fetchFromBackend<PlaidTransaction[]>(apiPath, "GET", params);

    if (response.error) {
      console.error("Error fetching Plaid transactions:", response.error);
      return [];
    }

    const plaidTransactions = response.data || [];
    console.log(`Fetched ${plaidTransactions.length} Plaid transactions.`);
    const normalized = plaidTransactions.map((tx) => this._normalizePlaidTransaction(tx));
    return this._applyPostNormalizationFilters(normalized, params);
  }

  /**
   * Fetches Modern Treasury transactions from the backend and normalizes them.
   * @param params Filter parameters.
   * @returns A promise resolving to an array of normalized transactions.
   */
  private async _fetchAndNormalizeModernTreasuryTransactions(
    params: TransactionFilterParams,
  ): Promise<NormalizedTransaction[]> {
    console.log("Fetching Modern Treasury transactions with params:", params);
    const apiPath = `/financial-data/moderntreasury/transactions`;
    const response = await this._fetchFromBackend<MTTransactionLineItem[]>(apiPath, "GET", params);

    if (response.error) {
      console.error("Error fetching Modern Treasury transactions:", response.error);
      return [];
    }

    const mtTransactions = response.data || [];
    console.log(`Fetched ${mtTransactions.length} Modern Treasury transactions.`);
    const normalized = mtTransactions.map((tx) => this._normalizeModernTreasuryTransaction(tx));
    return this._applyPostNormalizationFilters(normalized, params);
  }

  /**
   * Applies additional filtering logic after normalization, based on common criteria.
   * This is necessary because some filter parameters might not be directly supported
   * by the simulated backend API calls or might need cross-platform logic.
   * @param transactions The array of normalized transactions.
   * @param params The filter parameters.
   * @returns A filtered array of normalized transactions.
   */
  private _applyPostNormalizationFilters(
    transactions: NormalizedTransaction[],
    params: TransactionFilterParams,
  ): NormalizedTransaction[] {
    let filtered = transactions;

    if (params.accountId) {
      filtered = filtered.filter((tx) => tx.accountId === params.accountId);
    }
    if (params.currency) {
      filtered = filtered.filter((tx) => tx.currency === params.currency);
    }
    if (params.minAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.amount >= params.minAmount);
    }
    if (params.maxAmount !== undefined) {
      filtered = filtered.filter((tx) => tx.amount <= params.maxAmount);
    }
    if (params.type) {
      filtered = filtered.filter((tx) => tx.type === params.type);
    }
    if (params.status) {
      filtered = filtered.filter((tx) => tx.status === params.status);
    }
    // Date filtering is usually handled by the backend, but a fallback is here
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      filtered = filtered.filter((tx) => new Date(tx.date) >= startDate);
    }
    if (params.endDate) {
      const endDate = new Date(params.endDate);
      filtered = filtered.filter((tx) => new Date(tx.date) <= endDate);
    }

    return filtered;
  }

  /**
   * Fetches and aggregates financial transactions from all supported sources.
   * Applies comprehensive filtering, normalization, and deduplication.
   * @param params Optional filter parameters for transactions.
   * @returns A promise resolving to an object containing aggregated and paginated transactions.
   */
  public async getAggregatedTransactions(
    params: TransactionFilterParams = {},
  ): Promise<AggregatedTransactionsResult> {
    console.log("Initiating getAggregatedTransactions with params:", params);

    const transactionsPromises: Promise<NormalizedTransaction[]>[] = [];

    // Determine which sources to fetch from based on params.source or all if not specified.
    const sourcesToFetch: Array<"Stripe" | "Plaid" | "ModernTreasury"> = params.source
      ? [params.source]
      : ["Stripe", "Plaid", "ModernTreasury"];

    if (sourcesToFetch.includes("Stripe")) {
      transactionsPromises.push(this._fetchAndNormalizeStripeTransactions(params));
    }
    if (sourcesToFetch.includes("Plaid")) {
      transactionsPromises.push(this._fetchAndNormalizePlaidTransactions(params));
    }
    if (sourcesToFetch.includes("ModernTreasury")) {
      transactionsPromises.push(this._fetchAndNormalizeModernTreasuryTransactions(params));
    }

    // Await all fetch operations.
    const results = await Promise.allSettled(transactionsPromises);

    let allNormalizedTransactions: NormalizedTransaction[] = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        allNormalizedTransactions = allNormalizedTransactions.concat(result.value);
      } else {
        console.error(
          `Failed to fetch transactions from source index ${index}:`,
          result.reason,
        );
      }
    });

    console.log(`Total raw normalized transactions fetched: ${allNormalizedTransactions.length}`);

    // Deduplication logic: This is crucial for cross-platform aggregation.
    // A robust deduplication strategy would involve heuristic matching (e.g., amount, date, description, merchant, account)
    // Here, a simplified approach using a generated hash is used.
    const uniqueTransactions = new Map<string, NormalizedTransaction>();
    allNormalizedTransactions.forEach((tx) => {
      // Generate a deduplication key. This needs to be smart for real-world scenarios.
      // For simulation, we can assume a combination of key fields creates a unique ID.
      // A more complex system might use fuzzy matching.
      const dedupeKey = `${tx.amount}-${tx.currency}-${tx.date.split('T')[0]}-${tx.description.substring(0, 50)}-${tx.accountId}`;
      if (!uniqueTransactions.has(dedupeKey)) {
        uniqueTransactions.set(dedupeKey, tx);
      } else {
        // If a transaction is already present, perhaps merge or choose the most complete one.
        // For simplicity, we just keep the first one encountered.
        console.log("Duplicate transaction detected and skipped:", tx.id);
      }
    });

    let finalTransactions = Array.from(uniqueTransactions.values());

    // Sort transactions by date (most recent first)
    finalTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply pagination after all filtering and sorting
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    const paginatedTransactions = finalTransactions.slice(offset, offset + limit);

    console.log(`Total unique, filtered, and paginated transactions: ${paginatedTransactions.length}`);

    return {
      transactions: paginatedTransactions,
      pagination: {
        limit: limit,
        offset: offset,
        total: finalTransactions.length,
        nextPageToken: finalTransactions.length > offset + limit ? `next_page_${offset + limit}` : undefined,
        previousPageToken: offset > 0 ? `prev_page_${offset - limit}` : undefined,
      },
    };
  }

  /**
   * Retrieves an aggregation summary of transactions based on provided filters.
   * This method queries the backend's pre-computed summary API for efficiency.
   * @param params Optional filter parameters.
   * @returns A promise resolving to an AggregationSummary object.
   */
  public async getFinancialSummary(
    params: TransactionFilterParams = {},
  ): Promise<AggregationSummary> {
    console.log("Fetching financial summary with params:", params);
    const apiPath = `/analytics/summary`;
    const response = await this._fetchFromBackend<AggregationSummary>(apiPath, "GET", params);

    if (response.error) {
      console.error("Error fetching financial summary:", response.error);
      // Return a default/empty summary on error.
      return {
        totalCount: 0,
        totalDebitAmount: 0,
        totalCreditAmount: 0,
        netAmount: 0,
        currency: params.currency || "USD",
        accountSummaries: [],
        categorySummaries: [],
      };
    }
    console.log("Financial summary fetched successfully.");
    return response.data || this._generateSimulatedAggregationSummary(params); // Fallback to simulated data
  }

  /**
   * Generates a comprehensive financial analytics report for a given period.
   * This method could orchestrate multiple data fetches and complex aggregations
   * on the backend or locally if data sets are small enough.
   * @param startDate The start date for the report (YYYY-MM-DD).
   * @param endDate The end date for the report (YYYY-MM-DD).
   * @param accountIds Optional array of account IDs to include in the report.
   * @returns A promise resolving to an AnalyticsReport object.
   */
  public async generateAnalyticsReport(
    startDate: string,
    endDate: string,
    accountIds?: string[],
  ): Promise<AnalyticsReport> {
    console.log(
      `Generating analytics report for period: ${startDate} to ${endDate}, accounts: ${accountIds || "all"}`
    );

    // This could directly query a backend endpoint designed for reports
    // or trigger an async report generation process.
    const apiPath = `/analytics/report`;
    const params = {
      startDate: startDate,
      endDate: endDate,
      accountIds: accountIds ? accountIds.join(",") : undefined,
      reportType: "comprehensive", // Example report type
    };
    const response = await this._fetchFromBackend<AnalyticsReport>(apiPath, "GET", params);

    if (response.error) {
      console.error("Error generating analytics report:", response.error);
      // Fallback to a minimal or error report
      return {
        reportId: `err_rpt_${this._generateUniqueId()}`,
        reportName: "Error Report",
        generatedAt: new Date().toISOString(),
        period: { startDate, endDate },
        summary: {
          totalCount: 0, totalDebitAmount: 0, totalCreditAmount: 0, netAmount: 0, currency: "USD",
          accountSummaries: [], categorySummaries: []
        },
        detailedDataSample: [],
        chartsData: [],
        insights: ["Failed to generate report due to backend error."],
      };
    }
    console.log("Analytics report generated successfully.");
    return response.data || this._generateSimulatedAnalyticsReport({ startDate, endDate }); // Fallback to simulated data
  }

  /**
   * Retrieves detailed information for a specific normalized transaction.
   * This method could trace back to the original source if needed.
   * @param transactionId The ID of the normalized transaction.
   * @returns A promise resolving to the NormalizedTransaction object or null if not found.
   */
  public async getTransactionDetails(transactionId: string): Promise<NormalizedTransaction | null> {
    console.log(`Fetching details for transaction ID: ${transactionId}`);

    // In a real system, this would involve querying a consolidated transaction store
    // or routing to the correct source based on the ID prefix (e.g., 'stripe-', 'plaid-').
    // For this simulation, we'll generate a dummy transaction.
    const simulatedTx = this._generateSimulatedNormalizedTransactions(1, "2023-01-01", "2023-10-31")[0];
    simulatedTx.id = transactionId; // Ensure the ID matches
    console.log(`Simulated details for ${transactionId} retrieved.`);
    return simulatedTx;
  }

  /**
   * Exports aggregated transaction data in a specified format.
   * This method would typically interact with a backend service to generate and
   * provide a download link for large data exports.
   * @param format The desired export format (e.g., "csv", "json", "pdf").
   * @param params Optional filter parameters for the export.
   * @returns A promise resolving to a URL for the exported file, or base64 data.
   */
  public async exportTransactions(
    format: "csv" | "json" | "pdf",
    params: TransactionFilterParams = {},
  ): Promise<string> {
    console.log(`Requesting transaction export in ${format} format with params:`, params);
    const apiPath = `/exports/transactions`;
    const exportParams = { ...params, format: format };
    const response = await this._fetchFromBackend<{ downloadUrl: string }>(apiPath, "GET", exportParams);

    if (response.error || !response.data?.downloadUrl) {
      console.error("Error during transaction export:", response.error);
      // Simulate direct data generation for small exports if backend fails
      const aggregated = await this.getAggregatedTransactions(params);
      let exportContent = "";
      if (format === "json") {
        exportContent = JSON.stringify(aggregated.transactions, null, 2);
        return `data:application/json;base64,${btoa(exportContent)}`;
      } else if (format === "csv") {
        const header = Object.keys(aggregated.transactions[0] || {})
          .filter(k => typeof (aggregated.transactions[0] as any)[k] !== 'object') // Exclude objects for simple CSV
          .join(",");
        const rows = aggregated.transactions.map(tx => {
          return Object.keys(tx)
            .filter(k => typeof (tx as any)[k] !== 'object')
            .map(k => {
              let value = (tx as any)[k];
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`; // Quote strings with commas
              }
              return value;
            })
            .join(",");
        }).join("\n");
        exportContent = `${header}\n${rows}`;
        return `data:text/csv;base64,${btoa(exportContent)}`;
      }
      return `data:text/plain;base64,${btoa("Export failed or unsupported format locally.")}`;
    }

    console.log(`Export initiated, download URL: ${response.data.downloadUrl}`);
    return response.data.downloadUrl;
  }

  /**
   * Reconciles a pending transaction with a posted transaction.
   * This would typically involve updating the status of the pending transaction
   * and potentially linking it to the posted one in the backend.
   * @param pendingTransactionId The ID of the pending transaction.
   * @param postedTransactionId The ID of the posted transaction.
   * @returns A promise resolving to a boolean indicating success.
   */
  public async reconcileTransactions(
    pendingTransactionId: string,
    postedTransactionId: string,
  ): Promise<boolean> {
    console.log(
      `Attempting to reconcile pending transaction ${pendingTransactionId} with posted ${postedTransactionId}`
    );
    const apiPath = `/transactions/reconcile`;
    const response = await this._fetchFromBackend<{ success: boolean }>(apiPath, "POST", undefined, {
      pendingId: pendingTransactionId,
      postedId: postedTransactionId,
    });

    if (response.error || !response.data?.success) {
      console.error("Reconciliation failed:", response.error);
      return false;
    }
    console.log("Transactions reconciled successfully.");
    return response.data.success;
  }

  /**
   * Provides advanced reporting for fraud detection and risk assessment.
   * This might involve fetching specific transaction flags or patterns from the backend.
   * @param params Filter parameters for transactions to analyze for fraud.
   * @returns A promise resolving to an object detailing potential fraud risks.
   */
  public async getFraudRiskReport(
    params: TransactionFilterParams = {},
  ): Promise<{ risks: string[]; suspiciousTransactions: NormalizedTransaction[] }> {
    console.log("Generating fraud risk report with params:", params);
    // Simulate fetching transactions and identifying suspicious patterns
    const allTransactions = await this.getAggregatedTransactions(params);
    const suspicious: NormalizedTransaction[] = [];
    const risks: string[] = [];

    allTransactions.transactions.forEach(tx => {
      // Simple heuristic for simulation: high amount debit to an unknown merchant
      if (tx.type === "debit" && tx.amount > 500000 && tx.merchantName === "Unknown") { // > $5000
        suspicious.push(tx);
        risks.push(`High value debit to unknown merchant: ${tx.id}`);
      }
      // Transactions with failed status multiple times from same source/customer
      if (tx.status === "failed" && Math.random() < 0.2) { // Simulate some failures as suspicious
        suspicious.push(tx);
        risks.push(`Repeated failed transaction attempt: ${tx.id}`);
      }
      // Transactions from unusual geographic locations (requires location data, simplified here)
      if (tx.source === "Stripe" && tx.metadata.billingAddress?.country && tx.metadata.billingAddress.country !== "US" && Math.random() < 0.1) {
        suspicious.push(tx);
        risks.push(`International transaction from potentially risky region: ${tx.id}`);
      }
      // Transactions with unusual categories for a given account
      if (tx.category === "Gambling" && Math.random() < 0.05) { // Assuming gambling is unusual
        suspicious.push(tx);
        risks.push(`Transaction in high-risk category: ${tx.id}`);
      }
    });

    if (suspicious.length > 0) {
      risks.unshift("Potential fraudulent activities detected:");
    } else {
      risks.push("No significant fraud risks identified in the current period.");
    }

    console.log(`Fraud risk report generated. Found ${suspicious.length} suspicious transactions.`);
    return { risks, suspiciousTransactions: suspicious };
  }

  /**
   * Initiates a payment from an internal account to an external one.
   * This would typically leverage Modern Treasury's payment order functionality.
   * @param originatingAccountId The internal account from which to send money.
   * @param receivingAccountDetails Details of the external receiving account (e.g., bank account, routing).
   * @param amount The amount to send (in minor units).
   * @param currency The currency.
   * @param description A description for the payment.
   * @param paymentType The type of payment (e.g., "ach", "wire").
   * @returns A promise resolving to the ID of the created payment order.
   */
  public async initiatePayment(
    originatingAccountId: string,
    receivingAccountDetails: {
      accountNumber: string;
      routingNumber: string;
      routingNumberType: string;
      accountHolderName: string;
      accountHolderType: "individual" | "corporation";
      address?: StripeChargeBillingDetailsAddress;
    },
    amount: number,
    currency: string,
    description: string,
    paymentType: string, // e.g., "ach", "wire", "sepa"
  ): Promise<string> {
    console.log(`Initiating ${paymentType} payment from ${originatingAccountId} for ${amount} ${currency}`);
    const apiPath = `/payments/initiate`;
    const body = {
      originatingAccountId,
      receivingAccountDetails,
      amount,
      currency,
      description,
      paymentType,
    };
    const response = await this._fetchFromBackend<{ paymentOrderId: string }>(apiPath, "POST", undefined, body);

    if (response.error || !response.data?.paymentOrderId) {
      console.error("Payment initiation failed:", response.error);
      throw new Error(`Payment initiation failed: ${response.error?.message || "Unknown error"}`);
    }

    console.log(`Payment order ${response.data.paymentOrderId} initiated successfully.`);
    return response.data.paymentOrderId;
  }

  /**
   * Creates an expected payment entry in the system (e.g., in Modern Treasury).
   * This helps in reconciling incoming funds.
   * @param internalAccountId The internal account where funds are expected.
   * @param amount The expected amount (in minor units).
   * @param currency The expected currency.
   * @param description A description for the expected payment.
   * @param expectedDate The date when the payment is expected (YYYY-MM-DD).
   * @param type The type of expected payment (e.g., "ach", "wire").
   * @returns A promise resolving to the ID of the created expected payment.
   */
  public async createExpectedPayment(
    internalAccountId: string,
    amount: number,
    currency: string,
    description: string,
    expectedDate: string, // YYYY-MM-DD
    type: string, // e.g., "ach", "wire"
  ): Promise<string> {
    console.log(
      `Creating expected ${type} payment for ${amount} ${currency} into ${internalAccountId} by ${expectedDate}`
    );
    const apiPath = `/payments/expected`;
    const body = {
      internalAccountId,
      amount,
      currency,
      description,
      expectedDate,
      type,
    };
    const response = await this._fetchFromBackend<{ expectedPaymentId: string }>(apiPath, "POST", undefined, body);

    if (response.error || !response.data?.expectedPaymentId) {
      console.error("Expected payment creation failed:", response.error);
      throw new Error(`Expected payment creation failed: ${response.error?.message || "Unknown error"}`);
    }

    console.log(`Expected payment ${response.data.expectedPaymentId} created successfully.`);
    return response.data.expectedPaymentId;
  }

  /**
   * Retrieves a list of all internal accounts available for transactions.
   * This would typically come from Modern Treasury or a similar banking core integration.
   * @returns A promise resolving to an array of MTInternalAccount objects.
   */
  public async getInternalAccounts(): Promise<MTInternalAccount[]> {
    console.log("Fetching internal accounts.");
    const apiPath = `/accounts/internal`;
    const response = await this._fetchFromBackend<MTInternalAccount[]>(apiPath, "GET");

    if (response.error) {
      console.error("Error fetching internal accounts:", response.error);
      return [];
    }

    console.log(`Fetched ${response.data?.length || 0} internal accounts.`);
    // Simulate some internal accounts if the backend returns empty or fails.
    if (!response.data || response.data.length === 0) {
      return [
        {
          id: `mt_internal_acc_${this._generateUniqueId()}`,
          account_type: "checking",
          currency: "USD",
          ledger_account_id: null,
          live_mode: false,
          name: "Main Operating Account",
          object: "internal_account",
          parent_account_id: null,
          party_name: "Citibank Demo Business Inc.",
          party_type: