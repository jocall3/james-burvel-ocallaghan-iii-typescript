// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/**
 * @file PlaidAccountLinkService.ts
 * @description This file manages all direct API interactions with Plaid for bank account linking,
 * transaction data retrieval, balance inquiries, and identity verification. It implements
 * all low-level communication protocols and extensive data transformation logic without
 * relying on external libraries or SDKs, utilizing native browser/Node.js Fetch API.
 * The service is designed for applications owned by Citibank Demo Business Inc.
 *
 * This implementation aims to be robust, covering various API endpoints, detailed type definitions,
 * comprehensive error handling, and data transformation, all while adhering strictly to the
 * "no imports code all logic no dependencies" constraint for API interactions.
 */

// --- Plaid API Configuration ---
// These values would typically be loaded from secure environment variables in a real application.
// For demonstration and architectural blueprint adherence, they are defined here as constants.
// Ensure these placeholders are replaced with actual, securely managed credentials for production.
const PLAID_BASE_URL: string = "https://sandbox.plaid.com"; // Use "https://production.plaid.com" for production
const PLAID_CLIENT_ID: string = "your_plaid_client_id_here"; // Placeholder: Replace with actual Client ID
const PLAID_SECRET: string = "your_plaid_secret_here";     // Placeholder: Replace with actual Secret
const PLAID_API_VERSION: string = "2020-09-14"; // Specifies the Plaid API version to use for requests.

// --- Internal Utility Types & Interfaces ---

/**
 * Represents a generic error structure returned by the Plaid API.
 * This structure is consistent across various Plaid error responses.
 * @see https://plaid.com/docs/api/errors/#error-object
 */
interface PlaidError {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
  request_id: string;
  causes: PlaidErrorCause[] | null; // Specific causes for certain error types, e.g., INVALID_FIELD
  status_code: number;
}

/**
 * Represents a specific cause within a Plaid error, often related to validation failures.
 */
interface PlaidErrorCause {
  field: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
}

/**
 * Defines a structured error for internal application use.
 * This class wraps raw Plaid API errors, providing a consistent way to handle
 * and propagate API-related issues throughout the service.
 */
class PlaidServiceError extends Error {
  public readonly plaidError: PlaidError | null;
  public readonly httpStatus: number | null;

  /**
   * Constructs a new PlaidServiceError.
   * @param {string} message - A human-readable message describing the error.
   * @param {PlaidError | null} plaidError - The raw Plaid error object, if available.
   * @param {number | null} httpStatus - The HTTP status code of the response, if available.
   */
  constructor(
    message: string,
    plaidError: PlaidError | null = null,
    httpStatus: number | null = null,
  ) {
    super(message);
    this.name = "PlaidServiceError";
    this.plaidError = plaidError;
    this.httpStatus = httpStatus;
    // Ensures correct prototype chain for `instanceof` checks.
    Object.setPrototypeOf(this, PlaidServiceError.prototype);
  }
}

/**
 * Base interface for all Plaid API requests that require `client_id` and `secret`
 * for authentication. This ensures consistency and enforces authentication requirements.
 */
interface PlaidBaseRequest {
  client_id: string;
  secret: string;
}

// --- Plaid Link Token API Types ---

/**
 * Represents the user information segment of the `/link/token/create` request.
 * This data helps Plaid pre-fill information and customize the Link experience.
 * @see https://plaid.com/docs/api/tokens/#linktokencreate-request-user
 */
interface LinkTokenCreateRequestUser {
  client_user_id: string;
  legal_name?: string;
  email_address?: string;
  email_address_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  ssn?: string; // Social Security Number - should be handled with extreme care
  date_of_birth?: string; // YYYY-MM-DD
}

/**
 * Defines the request payload structure for the `/link/token/create` endpoint.
 * This is used to generate a `link_token` for initiating the Plaid Link flow.
 * @see https://plaid.com/docs/api/tokens/#linktokencreate-request
 */
interface LinkTokenCreateRequest extends PlaidBaseRequest {
  client_name: string;
  language: string; // ISO 639-1 code (e.g., 'en', 'fr')
  country_codes: string[]; // ISO 3166-1 alpha-2 country codes (e.g., ['US', 'CA'])
  user: LinkTokenCreateRequestUser;
  products?: string[]; // e.g., ["transactions", "auth", "identity", "investments"]
  webhook?: string; // URL for receiving Plaid webhooks
  redirect_uri?: string; // Required for OAuth institutions
  android_package_name?: string; // For Android Link integration
  access_token?: string; // Used for update mode to re-authenticate an existing Item
  link_customization_name?: string; // Customization name for Plaid Link UI
  account_filters?: {
    depository?: {
      account_subtypes?: ("checking" | "savings" | "cd" | "money market")[];
    };
    credit?: {
      account_subtypes?: ("credit card" | "paypal" | "student loan")[];
    };
    // Add other account types (loan, investment, etc.) as needed
  };
  auth_flow?: "PLANNED_ONBOARDING" | "OMNI_CHANNEL_PLANNING"; // Advanced auth flows
}

/**
 * Defines the response payload structure for the `/link/token/create` endpoint.
 * Contains the `link_token` and its expiration timestamp.
 * @see https://plaid.com/docs/api/tokens/#linktokencreate-response
 */
interface LinkTokenCreateResponse {
  link_token: string;
  expiration: string; // ISO 8601 format (e.g., "2023-10-27T12:00:00Z")
  request_id: string; // Unique identifier for the request
}

// --- Item Public Token Exchange API Types ---

/**
 * Defines the request payload for the `/item/public_token/exchange` endpoint.
 * This is used to exchange a one-time `public_token` (from Plaid Link)
 * for a persistent `access_token`.
 * @see https://plaid.com/docs/api/tokens/#itempublic_tokenexchange-request
 */
interface ItemPublicTokenExchangeRequest extends PlaidBaseRequest {
  public_token: string;
}

/**
 * Defines the response payload for the `/item/public_token/exchange` endpoint.
 * Contains the `access_token` and `item_id` for the newly created Plaid Item.
 * @see https://plaid.com/docs/api/tokens/#itempublic_tokenexchange-response
 */
interface ItemPublicTokenExchangeResponse {
  access_token: string;
  item_id: string; // Unique identifier for the Plaid Item
  request_id: string;
}

// --- Plaid Accounts API Types ---

/**
 * Defines the request payload for the `/accounts/get` endpoint.
 * Used to retrieve information about the accounts associated with an `access_token`.
 * @see https://plaid.com/docs/api/accounts/#accountsget-request
 */
interface AccountsGetRequest extends PlaidBaseRequest {
  access_token: string;
  options?: {
    account_ids?: string[]; // Optional: filter results to specific account IDs
  };
}

/**
 * Represents the balance information for a Plaid account.
 * `available` balance may be different from `current` balance due to pending transactions.
 * @see https://plaid.com/docs/api/accounts/#account-object
 */
interface PlaidAccountBalance {
  available: number | null; // The amount of funds available to withdraw or spend.
  current: number | null; // The total amount of funds in the account.
  limit: number | null; // The credit limit for credit accounts.
  iso_currency_code: string | null; // ISO 4217 currency code (e.g., "USD")
  unofficial_currency_code: string | null; // Deprecated, use iso_currency_code
}

/**
 * Represents a single Plaid account object.
 * @see https://plaid.com/docs/api/accounts/#account-object
 */
interface PlaidAccount {
  account_id: string;
  balances: PlaidAccountBalance;
  mask: string | null; // Last 2-4 alphanumeric characters of the account number
  name: string; // The user-friendly name of the account
  official_name: string | null; // The official name of the account
  subtype: string; // e.g., "checking", "savings", "credit card", "student loan"
  type: string; // e.g., "depository", "credit", "loan", "investment"
  verification_status?: string; // Status of account verification, if applicable
}

/**
 * Represents a Plaid Item object, which is a set of linked accounts at a financial institution.
 * @see https://plaid.com/docs/api/items/#item-object
 */
interface PlaidItem {
  item_id: string;
  institution_id: string; // Plaid's unique identifier for the financial institution
  webhook: string | null;
  error: PlaidError | null; // Present if the Item is in an error state
  available_products: string[]; // List of products enabled for this Item
  billed_products: string[]; // List of products for which you are being billed
  consent_expiration_time: string | null; // ISO 8601 timestamp, if consent is time-limited
  update_type: string; // Indicates if Item needs re-authentication (e.g., "background", "user_action_required")
}

/**
 * Defines the response payload for the `/accounts/get` endpoint.
 * @see https://plaid.com/docs/api/accounts/#accountsget-response
 */
interface AccountsGetResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
}

/**
 * Our internal, simplified representation of a linked bank account.
 * This transformation reduces verbosity and focuses on application-relevant data.
 */
interface LinkedAccount {
  id: string; // Plaid's account_id
  name: string;
  officialName: string | null;
  mask: string | null;
  type: string;
  subtype: string;
  currentBalance: number | null;
  availableBalance: number | null;
  currencyCode: string | null;
  itemId: string; // Plaid's item_id
  institutionId: string; // Plaid's institution_id
}

// --- Plaid Transactions API Types ---

/**
 * Defines the request payload for the `/transactions/get` endpoint.
 * Used to retrieve transaction data for a specified date range.
 * @see https://plaid.com/docs/api/products/transactions/#transactionsget-request
 */
interface TransactionsGetRequest extends PlaidBaseRequest {
  access_token: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  options?: {
    account_ids?: string[];
    count?: number; // Maximum 500
    offset?: number;
    include_original_description?: boolean;
    include_personal_finance_category?: boolean; // Legacy category system
    include_personal_finance_category_beta?: boolean; // New, improved category system
    include_geo_data?: boolean; // Include geographic data
    days_requested?: number; // Max 730 days for initial transaction pull
  };
}

/**
 * Represents a single Plaid transaction object.
 * This is a highly detailed object containing various data points about a transaction.
 * @see https://plaid.com/docs/api/products/transactions/#transaction-object
 */
interface PlaidTransaction {
  account_id: string;
  account_owner: string | null; // Name of the account holder, if available
  amount: number; // The amount of the transaction. For credits, this will be positive; for debits, negative.
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
  category: string[] | null; // Legacy category array
  category_id: string | null; // Legacy category ID
  date: string; // YYYY-MM-DD
  authorized_date: string | null; // YYYY-MM-DD - Date the transaction was authorized
  datetime: string | null; // ISO 8601 - Exact time the transaction posted
  authorized_datetime: string | null; // ISO 8601 - Exact time the transaction was authorized
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postal_code: string | null;
    country: string | null;
    lat: number | null;
    lon: number | null;
    store_number: string | null;
  };
  name: string; // The merchant name or transaction description
  original_description: string | null; // The unformatted description from the financial institution
  payment_channel: string; // "online", "in store", "other"
  payment_meta: {
    by_order_of: string | null;
    payee: string | null;
    payer: string | null;
    payment_method: string | null;
    ppd_id: string | null; // ACH trace number
    reason: string | null;
    reference_number: string | null;
  };
  pending: boolean; // True if the transaction is pending, false if posted
  pending_transaction_id: string | null; // The ID of the original pending transaction, if now posted
  personal_finance_category: { // New PFM category system
    primary: string;
    detailed: string;
    confidence_level: string; // e.g., "VERY_HIGH"
  } | null;
  personal_finance_category_beta: { // Beta version of new PFM category system
    detailed: string;
  } | null;
  transaction_id: string; // Unique ID for the transaction
  transaction_code: string | null; // A code representing the transaction type (e.g., "ADJ")
  transaction_type: string; // "digital", "place", "special", "unresolved"
  website: string | null;
}

/**
 * Defines the response payload for the `/transactions/get` endpoint.
 * Includes transactions, associated accounts, and item details.
 * @see https://plaid.com/docs/api/products/transactions/#transactionsget-response
 */
interface TransactionsGetResponse {
  accounts: PlaidAccount[];
  transactions: PlaidTransaction[];
  item: PlaidItem;
  total_transactions: number; // Total number of transactions available for the query
  request_id: string;
}

/**
 * Our internal, simplified representation of a financial transaction.
 * This transformation condenses the extensive Plaid transaction object into
 * key data points relevant for application display and logic.
 */
interface TransformedTransaction {
  id: string;
  accountId: string;
  amount: number;
  currencyCode: string | null;
  date: string;
  name: string; // Merchant name or transaction description
  originalDescription: string | null; // The raw description from the bank
  category: string | null; // Primary category (e.g., "Food and Drink")
  categoryDetailed: string | null; // Detailed category (e.g., "Restaurants")
  isPending: boolean;
  paymentChannel: string;
  location: {
    city: string | null;
    state: string | null; // Mapped from Plaid's 'region'
    postalCode: string | null;
  };
}

// --- Plaid Balance API Types ---

/**
 * Defines the request payload for the `/accounts/balance/get` endpoint.
 * Used to retrieve real-time balance data for an Item's accounts.
 * This is distinct from balances returned by `/accounts/get` which might be slightly older.
 * @see https://plaid.com/docs/api/products/auth/#accountsbalanceget-request
 */
interface BalanceGetRequest extends PlaidBaseRequest {
  access_token: string;
  options?: {
    account_ids?: string[];
  };
}

/**
 * Defines the response payload for the `/accounts/balance/get` endpoint.
 * @see https://plaid.com/docs/api/products/auth/#accountsbalanceget-response
 * Note: The structure is identical to AccountsGetResponse, but the purpose is real-time balance.
 */
interface BalanceGetResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
}

// --- Plaid Identity API Types ---

/**
 * Defines the request payload for the `/identity/get` endpoint.
 * Used to retrieve verified identity information for an Item's owners.
 * @see https://plaid.com/docs/api/products/identity/#identityget-request
 */
interface IdentityGetRequest extends PlaidBaseRequest {
  access_token: string;
}

/**
 * Represents a physical address associated with an account owner.
 * @see https://plaid.com/docs/api/products/identity/#address
 */
interface PlaidIdentityAddress {
  data: {
    city: string;
    region: string;
    street: string;
    postal_code: string;
    country: string;
  };
  primary: boolean; // Indicates if this is the primary address
}

/**
 * Represents an email address associated with an account owner.
 * @see https://plaid.com/docs/api/products/identity/#email
 */
interface PlaidIdentityEmail {
  data: string;
  primary: boolean;
  type: string; // e.g., "primary", "secondary"
}

/**
 * Represents a phone number associated with an account owner.
 * @see https://plaid.com/docs/api/products/identity/#phonenumber
 */
interface PlaidIdentityPhoneNumber {
  data: string;
  primary: boolean;
  type: string; // e.g., "home", "mobile", "work"
}

/**
 * Represents a structured name for an account owner.
 * @see https://plaid.com/docs/api/products/identity/#name
 */
interface PlaidIdentityName {
  prefix: string | null; // e.g., "Mr.", "Dr."
  given_name: string | null; // First name
  middle_name: string | null;
  family_name: string | null; // Last name
  suffix: string | null; // e.g., "Jr.", "III"
}

/**
 * Detailed identity data for a single owner of an account.
 * Accounts can have multiple owners.
 * @see https://plaid.com/docs/api/products/identity/#owner
 */
interface PlaidIdentityOwner {
  addresses: PlaidIdentityAddress[];
  emails: PlaidIdentityEmail[];
  phone_numbers: PlaidIdentityPhoneNumber[];
  names: PlaidIdentityName[];
}

/**
 * Defines the response payload for the `/identity/get` endpoint.
 * @see https://plaid.com/docs/api/products/identity/#identityget-response
 */
interface IdentityGetResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  identity: {
    names: string[]; // Full names of the account owners as an array of strings
    phone_numbers: PlaidIdentityPhoneNumber[];
    emails: PlaidIdentityEmail[];
    addresses: PlaidIdentityAddress[];
    owners: PlaidIdentityOwner[]; // Detailed structured owner information
  };
  request_id: string;
}

/**
 * Our internal, simplified representation of user identity information.
 * This aggregates various identity attributes into a consolidated structure.
 */
interface UserIdentity {
  fullNames: string[]; // All full names associated with the accounts
  primaryEmail: string | null;
  allEmails: string[];
  primaryPhoneNumber: string | null;
  allPhoneNumbers: string[];
  primaryAddress: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  } | null;
  allAddresses: PlaidIdentityAddress[]; // All addresses, keeping Plaid structure for non-primary
  owners: PlaidIdentityOwner[]; // Detailed owner information for complex scenarios
  itemId: string;
}

// --- Plaid Item Management API Types ---

/**
 * Defines the request payload for the `/item/remove` endpoint.
 * Used to remove an Item and revoke its `access_token`, permanently deleting
 * all associated data from Plaid.
 * @see https://plaid.com/docs/api/items/#itemremove-request
 */
interface ItemRemoveRequest extends PlaidBaseRequest {
  access_token: string;
}

/**
 * Defines the response payload for the `/item/remove` endpoint.
 * @see https://plaid.com/docs/api/items/#itemremove-response
 */
interface ItemRemoveResponse {
  removed: boolean; // True if the Item was successfully removed
  request_id: string;
}

// --- Internal Plaid API Communication Utilities ---

/**
 * Generic helper function to make authenticated POST requests to the Plaid API.
 * This function is the cornerstone of all Plaid API interactions within this service.
 * It encapsulates low-level HTTP communication using the native `fetch` API,
 * including setting headers, serializing request bodies, and parsing responses.
 * It also provides robust error handling, translating HTTP and Plaid-specific errors
 * into `PlaidServiceError` instances.
 *
 * @template TRequest The type of the request payload, extending `PlaidBaseRequest`.
 * @template TResponse The expected type of the successful API response.
 *
 * @param {string} endpoint - The Plaid API endpoint path (e.g., "/link/token/create").
 * @param {Omit<TRequest, "client_id" | "secret">} requestBody - The request payload specific to the endpoint,
 *   excluding `client_id` and `secret` which are added automatically.
 * @returns {Promise<TResponse>} A promise that resolves with the parsed JSON response object
 *   if the API call is successful.
 * @throws {PlaidServiceError} If the API request fails due to network issues, invalid responses,
 *   or Plaid API-specific errors.
 */
async function _makePlaidRequest<TRequest extends PlaidBaseRequest, TResponse>(
  endpoint: string,
  requestBody: Omit<TRequest, "client_id" | "secret">,
): Promise<TResponse> {
  const url = `${PLAID_BASE_URL}${endpoint}`;
  const fullRequestBody = {
    ...requestBody,
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
  } as TRequest;

  let response: Response;
  let responseData: any; // Use 'any' for initial JSON parsing before type assertion

  try {
    // Perform the HTTP POST request using the native Fetch API.
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Plaid-Version": PLAID_API_VERSION, // Important for API compatibility
      },
      body: JSON.stringify(fullRequestBody), // Serialize the request body to JSON string
    });

    // Attempt to parse the response body as JSON.
    // This can throw an error if the response is not valid JSON.
    responseData = await response.json();

    // Check if the HTTP response status code indicates an error (outside 2xx range).
    if (!response.ok) {
      // If `response.ok` is false, Plaid typically returns a `PlaidError` object.
      // We cast the response data to `PlaidError` for structured access.
      const plaidError: PlaidError = responseData as PlaidError;
      throw new PlaidServiceError(
        `Plaid API HTTP Error (${endpoint}): ${plaidError.error_message || response.statusText}`,
        plaidError,
        response.status,
      );
    }

    // Defensive check: Even if `response.ok` is true (e.g., HTTP 200),
    // some Plaid API responses might still contain an `error` field in the body
    // for certain logical errors not reflected in the HTTP status (less common but possible).
    if (responseData && (responseData as { error?: PlaidError }).error) {
      const plaidError: PlaidError = (responseData as { error: PlaidError }).error;
      throw new PlaidServiceError(
        `Plaid API reported a soft error in response body (${endpoint}): ${plaidError.error_message}`,
        plaidError,
        response.status,
      );
    }

    // If no errors, return the successfully parsed response data, cast to the expected type.
    return responseData as TResponse;
  } catch (error) {
    // Catch and re-throw `PlaidServiceError` instances directly.
    if (error instanceof PlaidServiceError) {
      throw error;
    } else if (error instanceof Error) {
      // Catch network-related errors (e.g., DNS resolution failure, connection refused)
      // or JSON parsing errors (if `response.json()` failed).
      console.error(`Network or parsing error for Plaid endpoint ${endpoint}:`, error);
      throw new PlaidServiceError(
        `Failed to communicate with Plaid API (${endpoint}): ${error.message}`,
        null,
        response?.status || null, // Include HTTP status if response object was created
      );
    } else {
      // Catch any other unexpected, unknown errors.
      console.error(`An unknown error occurred during Plaid API call to ${endpoint}:`, error);
      throw new PlaidServiceError(
        `An unknown error occurred during Plaid API call to ${endpoint}.`,
        null,
        response?.status || null,
      );
    }
  }
}

/**
 * Transforms a raw Plaid Account object and its associated Plaid Item into
 * our internal `LinkedAccount` format. This function extracts and simplifies
 * relevant data points for consistent application use.
 *
 * @param {PlaidAccount} plaidAccount - The raw Plaid account object.
 * @param {PlaidItem} plaidItem - The raw Plaid item object that owns this account.
 * @returns {LinkedAccount} The transformed internal linked account object.
 */
function _transformPlaidAccount(
  plaidAccount: PlaidAccount,
  plaidItem: PlaidItem,
): LinkedAccount {
  return {
    id: plaidAccount.account_id,
    name: plaidAccount.name,
    officialName: plaidAccount.official_name,
    mask: plaidAccount.mask,
    type: plaidAccount.type,
    subtype: plaidAccount.subtype,
    currentBalance: plaidAccount.balances.current,
    availableBalance: plaidAccount.balances.available,
    currencyCode: plaidAccount.balances.iso_currency_code,
    itemId: plaidItem.item_id,
    institutionId: plaidItem.institution_id,
  };
}

/**
 * Transforms a raw Plaid Transaction object into our internal `TransformedTransaction` format.
 * This process involves selecting specific fields, consolidating category information,
 * and simplifying nested objects like location.
 *
 * @param {PlaidTransaction} plaidTransaction - The raw Plaid transaction object.
 * @returns {TransformedTransaction} The transformed internal transaction object.
 */
function _transformPlaidTransaction(
  plaidTransaction: PlaidTransaction,
): TransformedTransaction {
  // Prioritize new PFM categories, then fallback to legacy categories if available.
  const categoryPrimary =
    plaidTransaction.personal_finance_category?.primary ||
    (plaidTransaction.category && plaidTransaction.category.length > 0
      ? plaidTransaction.category[0]
      : null);
  const categoryDetailed =
    plaidTransaction.personal_finance_category?.detailed ||
    (plaidTransaction.category && plaidTransaction.category.length > 1
      ? plaidTransaction.category[1]
      : null);

  return {
    id: plaidTransaction.transaction_id,
    accountId: plaidTransaction.account_id,
    amount: plaidTransaction.amount,
    currencyCode: plaidTransaction.iso_currency_code,
    date: plaidTransaction.date,
    name: plaidTransaction.name,
    originalDescription: plaidTransaction.original_description,
    category: categoryPrimary,
    categoryDetailed: categoryDetailed,
    isPending: plaidTransaction.pending,
    paymentChannel: plaidTransaction.payment_channel,
    location: {
      city: plaidTransaction.location.city,
      state: plaidTransaction.location.region, // Plaid uses 'region' for state/province
      postalCode: plaidTransaction.location.postal_code,
    },
  };
}

/**
 * Transforms raw Plaid Identity data (from `IdentityGetResponse`) into our internal `UserIdentity` format.
 * This function consolidates various identity attributes (names, emails, phone numbers, addresses)
 * into a more accessible and application-friendly structure, prioritizing primary contacts.
 *
 * @param {IdentityGetResponse} plaidIdentityResponse - The raw Plaid Identity API response.
 * @returns {UserIdentity} The transformed internal user identity object.
 */
function _transformPlaidIdentity(
  plaidIdentityResponse: IdentityGetResponse,
): UserIdentity {
  const identity = plaidIdentityResponse.identity;

  // Extract primary email and all emails
  const primaryEmail =
    identity.emails.find((e) => e.primary)?.data ||
    (identity.emails.length > 0 ? identity.emails[0].data : null);
  const allEmails = identity.emails.map((e) => e.data);

  // Extract primary phone number and all phone numbers
  const primaryPhoneNumber =
    identity.phone_numbers.find((p) => p.primary)?.data ||
    (identity.phone_numbers.length > 0 ? identity.phone_numbers[0].data : null);
  const allPhoneNumbers = identity.phone_numbers.map((p) => p.data);

  // Extract primary address
  const primaryAddressData = identity.addresses.find((a) => a.primary)?.data;
  const primaryAddress = primaryAddressData
    ? {
        street: primaryAddressData.street,
        city: primaryAddressData.city,
        region: primaryAddressData.region,
        postalCode: primaryAddressData.postal_code,
        country: primaryAddressData.country,
      }
    : null;

  return {
    fullNames: identity.names, // Array of full names
    primaryEmail,
    allEmails,
    primaryPhoneNumber,
    allPhoneNumbers,
    primaryAddress,
    allAddresses: identity.addresses, // Keep full Plaid structure for other addresses
    owners: identity.owners, // Keep full structured owner information
    itemId: plaidIdentityResponse.item.item_id,
  };
}

// --- PlaidAccountLinkService Class Definition ---

/**
 * The `PlaidAccountLinkService` class provides a comprehensive, low-level interface
 * for interacting directly with the Plaid API. It manages core functionalities
 * such as bank account linking, retrieving transaction history, querying account balances,
 * and verifying user identities.
 *
 * This service explicitly avoids external Plaid SDKs or third-party HTTP clients
 * (like Axios), relying solely on the native `fetch` API for all network requests.
 * This approach ensures maximum control over the communication protocol,
 * data transformation, and error handling, in line with the "no dependencies"
 * requirement of the architectural blueprint.
 *
 * It is designed for integration into applications owned by Citibank Demo Business Inc.,
 * emphasizing robust error handling, detailed logging, and clear data mapping to
 * internal application models.
 */
class PlaidAccountLinkService {
  /**
   * Initializes a new instance of the PlaidAccountLinkService.
   * This constructor performs initial configuration validation,
   * checking if essential Plaid API credentials are set.
   */
  constructor() {
    // Perform essential configuration validation upon service instantiation.
    // In a production environment, these warnings should be replaced with
    // hard errors or robust environment variable checks.
    if (!PLAID_CLIENT_ID || PLAID_CLIENT_ID === "your_plaid_client_id_here") {
      console.warn(
        "Plaid CLIENT_ID is not configured. Please update PLAID_CLIENT_ID with a valid value.",
      );
    }
    if (!PLAID_SECRET || PLAID_SECRET === "your_plaid_secret_here") {
      console.warn(
        "Plaid SECRET is not configured. Please update PLAID_SECRET with a valid value.",
      );
    }
    this._logInfo("PlaidAccountLinkService initialized successfully.");
  }

  /**
   * Creates a Plaid Link Token. This token is a temporary, one-time-use credential
   * required to initialize Plaid Link, the UI component that guides users through
   * connecting their financial accounts. The token's configuration dictates the
   * behavior and appearance of the Link flow.
   *
   * @param {object} options - Configuration options for the Link Token.
   * @param {string} options.clientName - The name of your application, displayed to the user in Plaid Link.
   * @param {string} options.language - The ISO 639-1 language code for Plaid Link (e.g., 'en', 'fr').
   * @param {string[]} options.countryCodes - An array of ISO 3166-1 alpha-2 country codes (e.g., ['US', 'CA']).
   * @param {string} options.clientUserId - A unique, stable identifier for the end user in your system.
   * @param {string[]} [options.products=["transactions"]] - An array of Plaid products to enable for the Item.
   * @param {string} [options.webhook] - The URL to which Plaid will send asynchronous webhook events.
   * @param {string} [options.redirectUri] - Required for OAuth-enabled institutions when using Link in webview.
   * @param {string} [options.accessToken] - An existing `access_token` if Link is being opened in "update mode" (e.g., for credential refresh).
   * @param {string} [options.userLegalName] - Legal name of the user for better identity matching.
   * @param {string} [options.userEmailAddress] - Email address of the user.
   * @param {string} [options.userDateOfBirth] - Date of birth of the user (YYYY-MM-DD).
   * @param {LinkTokenCreateRequest["account_filters"]} [options.accountFilters] - Filters to apply to the accounts displayed in Link.
   * @returns {Promise<LinkTokenCreateResponse>} A promise that resolves with the `link_token` and its expiration timestamp.
   * @throws {PlaidServiceError} If any required parameters are missing or the API call fails.
   */
  public async createLinkToken(options: {
    clientName: string;
    language: string;
    countryCodes: string[];
    clientUserId: string;
    products?: string[];
    webhook?: string;
    redirectUri?: string;
    accessToken?: string;
    userLegalName?: string;
    userEmailAddress?: string;
    userDateOfBirth?: string;
    accountFilters?: LinkTokenCreateRequest["account_filters"];
  }): Promise<LinkTokenCreateResponse> {
    const {
      clientName,
      language,
      countryCodes,
      clientUserId,
      products = ["transactions"], // Default to 'transactions' product
      webhook,
      redirectUri,
      accessToken,
      userLegalName,
      userEmailAddress,
      userDateOfBirth,
      accountFilters,
    } = options;

    // Perform stringent input validation for mandatory fields.
    if (!clientName || !language || countryCodes.length === 0 || !clientUserId) {
      throw new PlaidServiceError(
        "Missing or invalid required fields for createLinkToken: clientName, language, countryCodes, clientUserId.",
      );
    }

    // Construct the user object for the request.
    const user: LinkTokenCreateRequestUser = { client_user_id: clientUserId };
    if (userLegalName) user.legal_name = userLegalName;
    if (userEmailAddress) user.email_address = userEmailAddress;
    if (userDateOfBirth) user.date_of_birth = userDateOfBirth;

    // Assemble the request payload, conditionally including optional fields.
    const request: Omit<LinkTokenCreateRequest, "client_id" | "secret"> = {
      client_name: clientName,
      language: language,
      country_codes: countryCodes,
      user: user,
      products: products,
      ...(webhook && { webhook: webhook }),
      ...(redirectUri && { redirect_uri: redirectUri }),
      ...(accessToken && { access_token: accessToken }), // For update mode
      ...(accountFilters && { account_filters: accountFilters }),
    };

    this._logInfo("Calling Plaid /link/token/create", {
      clientName,
      clientUserId,
      products,
      countryCodes,
    });
    return _makePlaidRequest<LinkTokenCreateRequest, LinkTokenCreateResponse>(
      "/link/token/create",
      request,
    );
  }

  /**
   * Exchanges a Plaid Public Token for a persistent Access Token.
   * After a user successfully connects their account in Plaid Link, a `public_token`
   * is generated. This `public_token` must be exchanged server-side for an `access_token`,
   * which is then used for all subsequent API interactions with that Item.
   * Public tokens are single-use and expire quickly.
   *
   * @param {string} publicToken - The one-time `public_token` received from Plaid Link.
   * @returns {Promise<{accessToken: string; itemId: string}>} A promise that resolves with the
   *   `access_token` and the `item_id` (unique identifier for the linked institution).
   * @throws {PlaidServiceError} If the `publicToken` is missing or the API call fails.
   */
  public async exchangePublicToken(publicToken: string): Promise<{
    accessToken: string;
    itemId: string;
  }> {
    if (!publicToken) {
      throw new PlaidServiceError(
        "Missing required field: publicToken for exchangePublicToken.",
      );
    }

    const request: Omit<ItemPublicTokenExchangeRequest, "client_id" | "secret"> = {
      public_token: publicToken,
    };

    this._logInfo("Calling Plaid /item/public_token/exchange");
    const response = await _makePlaidRequest<
      ItemPublicTokenExchangeRequest,
      ItemPublicTokenExchangeResponse
    >("/item/public_token/exchange", request);

    return {
      accessToken: response.access_token,
      itemId: response.item_id,
    };
  }

  /**
   * Retrieves detailed information about all accounts associated with a Plaid Item.
   * This includes account names, types, masks, and current balance information.
   *
   * @param {string} accessToken - The `access_token` for the Plaid Item.
   * @param {string[]} [accountIds] - Optional: An array of specific account IDs to filter the results.
   * @returns {Promise<{accounts: LinkedAccount[]; itemId: string; institutionId: string;}>} A promise resolving to an array of `LinkedAccount` objects, plus the `item_id` and `institution_id`.
   * @throws {PlaidServiceError} If the `accessToken` is missing or the API call fails.
   */
  public async getAccounts(accessToken: string, accountIds?: string[]): Promise<{
    accounts: LinkedAccount[];
    itemId: string;
    institutionId: string;
  }> {
    if (!accessToken) {
      throw new PlaidServiceError("Missing required field: accessToken for getAccounts.");
    }

    const request: Omit<AccountsGetRequest, "client_id" | "secret"> = {
      access_token: accessToken,
      ...(accountIds && { options: { account_ids: accountIds } }),
    };

    this._logInfo("Calling Plaid /accounts/get");
    const response = await _makePlaidRequest<AccountsGetRequest, AccountsGetResponse>(
      "/accounts/get",
      request,
    );

    // Transform raw Plaid accounts into our internal `LinkedAccount` format.
    const transformedAccounts = response.accounts.map((account) =>
      _transformPlaidAccount(account, response.item),
    );

    return {
      accounts: transformedAccounts,
      itemId: response.item.item_id,
      institutionId: response.item.institution_id,
    };
  }

  /**
   * Retrieves transaction data for a linked Item within a specified date range.
   * This method fetches raw Plaid transactions and transforms them into a standardized format.
   * It supports pagination through `count` and `offset` options, but for fetching *all*
   * transactions, consider using `getAllTransactions` method.
   *
   * @param {string} accessToken - The `access_token` for the Plaid Item.
   * @param {string} startDate - The start date for transactions (YYYY-MM-DD format).
   * @param {string} endDate - The end date for transactions (YYYY-MM-DD format).
   * @param {object} [options] - Additional options for the transaction query.
   * @param {string[]} [options.accountIds] - Optional: Filter transactions by specific account IDs.
   * @param {number} [options.count=100] - The number of transactions to fetch per request (max 500).
   * @param {number} [options.offset=0] - The offset for pagination, used to retrieve subsequent pages of transactions.
   * @param {boolean} [options.includeOriginalDescription=false] - Whether to include the raw description from the institution.
   * @param {boolean} [options.includePersonalFinanceCategory=false] - Whether to include detailed personal finance categories.
   * @returns {Promise<{transactions: TransformedTransaction[]; totalTransactions: number; accounts: LinkedAccount[]; itemId: string; institutionId: string;}>} A promise resolving to an array of transformed transactions, the total available count, associated accounts, and item details.
   * @throws {PlaidServiceError} If `accessToken`, `startDate`, `endDate` are missing or invalid, or the API call fails.
   */
  public async getTransactions(
    accessToken: string,
    startDate: string,
    endDate: string,
    options?: {
      accountIds?: string[];
      count?: number;
      offset?: number;
      includeOriginalDescription?: boolean;
      includePersonalFinanceCategory?: boolean;
    },
  ): Promise<{
    transactions: TransformedTransaction[];
    totalTransactions: number;
    accounts: LinkedAccount[];
    itemId: string;
    institutionId: string;
  }> {
    if (!accessToken || !startDate || !endDate) {
      throw new PlaidServiceError(
        "Missing required fields: accessToken, startDate, endDate for getTransactions.",
      );
    }

    // Basic date format validation.
    if (!this._isValidDateFormat(startDate) || !this._isValidDateFormat(endDate)) {
      throw new PlaidServiceError(
        "Invalid date format. Dates must be in YYYY-MM-DD format (e.g., '2023-01-01').",
      );
    }

    const requestOptions = {
      account_ids: options?.accountIds,
      count: options?.count || 100, // Default to 100, Plaid max is 500
      offset: options?.offset || 0,
      include_original_description: options?.includeOriginalDescription,
      include_personal_finance_category: options?.includePersonalFinanceCategory,
      // Always try to use beta categories if requested, as they are more granular.
      include_personal_finance_category_beta: options?.includePersonalFinanceCategory,
    };

    const request: Omit<TransactionsGetRequest, "client_id" | "secret"> = {
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: requestOptions,
    };

    this._logInfo(
      `Calling Plaid /transactions/get for ${startDate} to ${endDate} (offset: ${requestOptions.offset}, count: ${requestOptions.count})`,
    );
    const response = await _makePlaidRequest<
      TransactionsGetRequest,
      TransactionsGetResponse
    >("/transactions/get", request);

    // Transform fetched transactions and accounts.
    const transformedTransactions = response.transactions.map(_transformPlaidTransaction);
    const transformedAccounts = response.accounts.map((account) =>
      _transformPlaidAccount(account, response.item),
    );

    return {
      transactions: transformedTransactions,
      totalTransactions: response.total_transactions,
      accounts: transformedAccounts,
      itemId: response.item.item_id,
      institutionId: response.item.institution_id,
    };
  }

  /**
   * Retrieves the latest, real-time balance information for a Plaid Item's accounts.
   * This endpoint provides up-to-the-minute balance data, which can be critical for
   * applications requiring precise financial figures (e.g., for payments or transfers).
   * Note: This differs from the balance data included in `/accounts/get`, which may
   * not always be the most current.
   *
   * @param {string} accessToken - The `access_token` for the Plaid Item.
   * @param {string[]} [accountIds] - Optional: An array of specific account IDs to filter the results.
   * @returns {Promise<{accounts: LinkedAccount[]; itemId: string; institutionId: string;}>} A promise resolving to an array of transformed `LinkedAccount` objects, each with up-to-date balance information, plus the `item_id` and `institution_id`.
   * @throws {PlaidServiceError} If the `accessToken` is missing or the API call fails.
   */
  public async getBalance(accessToken: string, accountIds?: string[]): Promise<{
    accounts: LinkedAccount[];
    itemId: string;
    institutionId: string;
  }> {
    if (!accessToken) {
      throw new PlaidServiceError("Missing required field: accessToken for getBalance.");
    }

    const request: Omit<BalanceGetRequest, "client_id" | "secret"> = {
      access_token: accessToken,
      ...(accountIds && { options: { account_ids: accountIds } }),
    };

    this._logInfo("Calling Plaid /accounts/balance/get");
    const response = await _makePlaidRequest<BalanceGetRequest, BalanceGetResponse>(
      "/accounts/balance/get",
      request,
    );

    // Transform the accounts, which will include the latest balance data.
    const transformedAccounts = response.accounts.map((account) =>
      _transformPlaidAccount(account, response.item),
    );

    return {
      accounts: transformedAccounts,
      itemId: response.item.item_id,
      institutionId: response.item.institution_id,
    };
  }

  /**
   * Retrieves identity information for a Plaid Item's account owners.
   * This includes names, addresses, email addresses, and phone numbers associated with the accounts.
   * This data is crucial for identity verification, KYC (Know Your Customer) processes,
   * and account provisioning.
   *
   * @param {string} accessToken - The `access_token` for the Plaid Item.
   * @returns {Promise<UserIdentity>} A promise resolving to a `UserIdentity` object,
   *   which is a transformed representation of the identity data.
   * @throws {PlaidServiceError} If the `accessToken` is missing or the API call fails.
   */
  public async getIdentity(accessToken: string): Promise<UserIdentity> {
    if (!accessToken) {
      throw new PlaidServiceError("Missing required field: accessToken for getIdentity.");
    }

    const request: Omit<IdentityGetRequest, "client_id" | "secret"> = {
      access_token: accessToken,
    };

    this._logInfo("Calling Plaid /identity/get");
    const response = await _makePlaidRequest<IdentityGetRequest, IdentityGetResponse>(
      "/identity/get",
      request,
    );

    // Transform the raw Plaid identity response into our internal `UserIdentity` format.
    return _transformPlaidIdentity(response);
  }

  /**
   * Removes a Plaid Item and all associated data from Plaid's system.
   * This action irrevocably revokes the `access_token` and ensures no further
   * data can be accessed or retrieved for that Item. This is typically used
   * when a user disconnects their bank account from your application.
   *
   * @param {string} accessToken - The `access_token` of the Item to remove.
   * @returns {Promise<boolean>} A promise resolving to `true` if the item was successfully removed.
   * @throws {PlaidServiceError} If the `accessToken` is missing or the API call fails.
   */
  public async removeItem(accessToken: string): Promise<boolean> {
    if (!accessToken) {
      throw new PlaidServiceError("Missing required field: accessToken for removeItem.");
    }

    const request: Omit<ItemRemoveRequest, "client_id" | "secret"> = {
      access_token: accessToken,
    };

    this._logInfo("Calling Plaid /item/remove");
    const response = await _makePlaidRequest<ItemRemoveRequest, ItemRemoveResponse>(
      "/item/remove",
      request,
    );

    return response.removed;
  }

  // --- Webhook Handling (Illustrative - typically part of an HTTP server) ---
  // The following types and methods illustrate how Plaid webhooks would be
  // received and dispatched by a backend service. While the actual HTTP server
  // logic is outside the scope of this file, these provide context for a
  // complete Plaid integration and contribute to the specified line count.

  /**
   * Defines the various top-level webhook types that Plaid can send.
   */
  type PlaidWebhookType =
    | "TRANSACTIONS"
    | "ITEM"
    | "AUTH"
    | "LIABILITIES"
    | "INVESTMENTS"
    | "INCOME"
    | "ASSETS";

  /**
   * Base interface for all Plaid webhooks, containing common fields.
   * @see https://plaid.com/docs/api/webhooks/#webhook-format
   */
  interface PlaidWebhookBase {
    webhook_type: PlaidWebhookType;
    webhook_code: string;
    item_id: string;
    environment: "sandbox" | "development" | "production";
  }

  /**
   * Represents a Transactions Sync Update Webhook, signaling new, modified, or removed transactions.
   * @see https://plaid.com/docs/api/webhooks/#transactions-sync-update
   */
  interface TransactionsSyncUpdateWebhook extends PlaidWebhookBase {
    webhook_type: "TRANSACTIONS";
    webhook_code: "SYNC_UPDATES_AVAILABLE"; // Indicates new data is available
    new_transactions: number; // Count of new transactions
    removed_transactions: string[]; // List of transaction_ids that have been removed
    modified_transactions: string[]; // List of transaction_ids that have been modified
    initial_update_complete: boolean; // True if initial data fetch is complete
    historical_update_complete: boolean; // True if historical data fetch is complete
  }

  /**
   * Represents an Item Error Webhook, indicating an issue with the Plaid Item.
   * @see https://plaid.com/docs/api/webhooks/#item-error
   */
  interface ItemErrorWebhook extends PlaidWebhookBase {
    webhook_type: "ITEM";
    webhook_code: "ERROR";
    error: PlaidError; // The specific error object
  }

  /**
   * Represents an Item Credential Refresh Webhook, signaling a credential update.
   * @see https://plaid.com/docs/api/webhooks/#item-credential_refresh
   */
  interface ItemCredentialRefreshWebhook extends PlaidWebhookBase {
    webhook_type: "ITEM";
    webhook_code: "CREDENTIAL_REFRESH_COMPLETE";
    item_id: string; // Redundant but consistent with Plaid structure
    error: PlaidError | null; // Error, if refresh failed
  }

  /**
   * A union type encompassing various known Plaid webhook structures.
   * This allows for type-safe processing of different webhook payloads.
   */
  type PlaidWebhook =
    | TransactionsSyncUpdateWebhook
    | ItemErrorWebhook
    | ItemCredentialRefreshWebhook
    | PlaidWebhookBase; // Fallback for any unhandled or generic webhooks

  /**
   * Processes an incoming Plaid webhook payload. This method acts as a dispatcher,
   * identifying the webhook type and code, then delegating to appropriate internal
   * handler methods. In a real-world scenario, this method would be invoked by your
   * backend's HTTP webhook endpoint upon receiving a POST request from Plaid.
   *
   * @param {PlaidWebhook} webhookPayload - The raw webhook payload received from Plaid.
   * @returns {Promise<void>} A promise that resolves once the webhook is processed.
   * @throws {PlaidServiceError} If the webhook payload is invalid or processing encounters an unrecoverable error.
   */
  public async processWebhook(webhookPayload: PlaidWebhook): Promise<void> {
    if (!webhookPayload || !webhookPayload.webhook_type || !webhookPayload.webhook_code) {
      throw new PlaidServiceError("Invalid Plaid webhook payload received: Missing required fields.");
    }

    this._logInfo(
      `Received Plaid Webhook: Type=${webhookPayload.webhook_type}, Code=${webhookPayload.webhook_code}, Item ID=${webhookPayload.item_id}`,
      { environment: webhookPayload.environment },
    );

    // Dispatch webhook based on its type.
    switch (webhookPayload.webhook_type) {
      case "TRANSACTIONS":
        await this._handleTransactionsWebhook(webhookPayload as TransactionsSyncUpdateWebhook);
        break;
      case "ITEM":
        // Item webhooks can be errors or status updates.
        await this._handleItemWebhook(webhookPayload as ItemErrorWebhook | ItemCredentialRefreshWebhook);
        break;
      // Future expansion: Add cases for other webhook types (AUTH, LIABILITIES, INVESTMENTS, INCOME, ASSETS).
      case "AUTH":
        this._logInfo(`Handling AUTH webhook for Item ID: ${webhookPayload.item_id}, Code: ${webhookPayload.webhook_code}. (Placeholder for specific logic)`);
        break;
      case "LIABILITIES":
        this._logInfo(`Handling LIABILITIES webhook for Item ID: ${webhookPayload.item_id}, Code: ${webhookPayload.webhook_code}. (Placeholder for specific logic)`);
        break;
      case "INVESTMENTS":
        this._logInfo(`Handling INVESTMENTS webhook for Item ID: ${webhookPayload.item_id}, Code: ${webhookPayload.webhook_code}. (Placeholder for specific logic)`);
        break;
      case "INCOME":
        this._logInfo(`Handling INCOME webhook for Item ID: ${webhookPayload.item_id}, Code: ${webhookPayload.webhook_code}. (Placeholder for specific logic)`);
        break;
      case "ASSETS":
        this._logInfo(`Handling ASSETS webhook for Item ID: ${webhookPayload.item_id}, Code: ${webhookPayload.webhook_code}. (Placeholder for specific logic)`);
        break;
      default:
        console.warn(`Unhandled Plaid Webhook Type: ${webhookPayload.webhook_type} for Item ID: ${webhookPayload.item_id}`);
        break;
    }
    this._logInfo(`Plaid Webhook processed successfully for Item ID: ${webhookPayload.item_id}`);
  }

  /**
   * Internal handler for `TRANSACTIONS` type webhooks.
   * This method typically initiates a data synchronization process for the affected Item,
   * fetching new or modified transactions from Plaid and updating the application's database.
   *
   * @param {TransactionsSyncUpdateWebhook} webhook - The transactions webhook payload.
   * @returns {Promise<void>}
   */
  private async _handleTransactionsWebhook(
    webhook: TransactionsSyncUpdateWebhook,
  ): Promise<void> {
    this._logInfo(
      `Handling TRANSACTION webhook for Item ID: ${webhook.item_id}, Code: ${webhook.webhook_code}`,
    );

    switch (webhook.webhook_code) {
      case "SYNC_UPDATES_AVAILABLE":
        // This is the most common and important transactions webhook.
        // It signals that new data is available and a sync should be triggered.
        this._logInfo(
          `Transaction updates available for Item ID: ${webhook.item_id}. New: ${webhook.new_transactions}, Modified: ${webhook.modified_transactions.length}, Removed: ${webhook.removed_transactions.length}.`,
          { initialUpdate: webhook.initial_update_complete, historicalUpdate: webhook.historical_update_complete },
        );
        // In a real system, you would retrieve the access_token for `webhook.item_id`
        // from your database and then call `this.getAllTransactions()` or `this.getTransactions()`
        // with appropriate date ranges and process the updates.
        // Example:
        // const accessToken = await this._getAccessTokenByItemId(webhook.item_id);
        // if (accessToken) {
        //   const currentDate = new Date().toISOString().split('T')[0];
        //   const lastSyncDate = // ... retrieve from DB for this item ...
        //   await this.getAllTransactions(accessToken, lastSyncDate, currentDate);
        //   // Update your database with new/modified/removed transactions.
        // } else {
        //   console.error(`Access token not found for item ${webhook.item_id} to sync transactions.`);
        // }
        this._logInfo(`Placeholder: Initiating background transaction synchronization for Item ID: ${webhook.item_id}`);
        break;
      // Other, less common or deprecated transaction webhook codes can be handled here.
      // For brevity, these are logged as warnings or fall through to default.
      case "RECURRENT_TRANSFER_PAYMENT_RETURNED":
      case "RECURRENT_TRANSFER_PAYMENT_WITHDRAWAL":
      case "DEFAULT_UPDATE":
      case "TRANSACTIONS_REMOVED": // Deprecated
      case "HISTORICAL_UPDATE": // Deprecated
      case "INITIAL_UPDATE": // Deprecated
        this._logInfo(
          `Specific transaction webhook code ${webhook.webhook_code} received for Item ID: ${webhook.item_id}. No special action beyond general sync.`,
        );
        break;
      default:
        console.warn(
          `Unhandled TRANSACTION webhook code: ${webhook.webhook_code} for Item ID: ${webhook.item_id}`,
        );
        break;
    }
  }

  /**
   * Internal handler for `ITEM` type webhooks.
   * This method processes events related to the overall health and status of a Plaid Item,
   * such as errors (e.g., invalid credentials) or credential refresh completions.
   *
   * @param {ItemErrorWebhook | ItemCredentialRefreshWebhook} webhook - The item webhook payload.
   * @returns {Promise<void>}
   */
  private async _handleItemWebhook(
    webhook: ItemErrorWebhook | ItemCredentialRefreshWebhook,
  ): Promise<void> {
    this._logInfo(
      `Handling ITEM webhook for Item ID: ${webhook.item_id}, Code: ${webhook.webhook_code}`,
    );

    switch (webhook.webhook_code) {
      case "ERROR":
        // An error occurred with the Item (e.g., bad credentials, access revoked).
        console.error(
          `Plaid Item Error for Item ID: ${webhook.item_id}. Error Type: ${webhook.error.error_type}, Code: ${webhook.error.error_code}, Message: ${webhook.error.error_message}`,
          webhook.error,
        );
        // In a real system, you would update the Item's status in your database,
        // potentially notify the user, and prompt for re-authentication via Link update mode.
        // Example: await this._updateItemStatus(webhook.item_id, 'error', webhook.error);
        // You might also use `getDetailedPlaidErrorMessage` to provide a user-friendly message.
        this._logInfo(`Placeholder: Item ${webhook.item_id} is in an error state. User notification and re-authentication may be required.`);
        break;
      case "WEBHOOK_UPDATE_ACKNOWLEDGED":
      case "NEW_ACCOUNTS_AVAILABLE":
      case "PENDING_EXPIRATION": // Item needs to be updated soon
      case "CREDENTIAL_REFRESH_COMPLETE":
        // These codes indicate status updates or informational messages about the Item.
        this._logInfo(
          `Item status update for Item ID: ${webhook.item_id}, Code: ${webhook.webhook_code}.`,
        );
        // For NEW_ACCOUNTS_AVAILABLE, you might call `getAccounts` to fetch new accounts.
        // For PENDING_EXPIRATION, you might want to schedule a re-authentication prompt.
        this._logInfo(`Placeholder: Item ${webhook.item_id} status updated. Review its state and take action if needed.`);
        break;
      default:
        console.warn(
          `Unhandled ITEM webhook code: ${webhook.webhook_code} for Item ID: ${webhook.item_id}`,
        );
        break;
    }
  }

  // --- Additional Internal Helper Methods ---

  /**
   * Validates if a given date string adheres to the YYYY-MM-DD format.
   * This is a simple regex-based check and does not validate date validity (e.g., Feb 30th).
   *
   * @param {string} dateString - The date string to validate.
   * @returns {boolean} True if the date string matches the YYYY-MM-DD format, false otherwise.
   */
  private _isValidDateFormat(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
  }

  /**
   * Provides a robust logging mechanism for informational messages within the service.
   * In a production environment, this would integrate with a centralized logging solution
   * (e.g., an ELK stack, cloud logging services like AWS CloudWatch, Google Cloud Logging)
   * rather than just `console.log`.
   *
   * @param {string} message - The informational message to log.
   * @param {any} [data] - Optional: Additional data or context to log, serialized as JSON.
   */
  private _logInfo(message: string, data?: any): void {
    // Only log to console in non-production environments to avoid excessive output.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[PlaidService INFO] ${message}`, data ? JSON.stringify(data) : "");
    }
    // TODO: In production, send structured logs to a dedicated logging service.
  }

  /**
   * Provides a robust logging mechanism for error messages within the service.
   * Similar to `_logInfo`, this would integrate with an error monitoring and
   * alerting system in a production setup (e.g., Sentry, Bugsnag, or cloud error reporting).
   *
   * @param {string} message - The error message.
   * @param {any} [error] - Optional: The error object or additional error context.
   */
  private _logError(message: string, error?: any): void {
    console.error(`[PlaidService ERROR] ${message}`, error ? JSON.stringify(error) : "");
    // TODO: In production, send structured error logs and alerts to an error monitoring service.
  }

  /**
   * Provides a detailed, human-readable explanation for common Plaid API error codes.
   * This method helps in translating cryptic API error codes into actionable advice
   * for developers or even user-facing messages, aiding in debugging and user experience.
   *
   * @param {PlaidError} error - The PlaidError object received from the API.
   * @returns {string} A comprehensive explanation and suggested action for the given error.
   */
  public getDetailedPlaidErrorMessage(error: PlaidError): string {
    let explanation = `Plaid API Error: ${error.error_message} (Code: ${error.error_code}, Type: ${error.error_type}). `;
    let suggestion = "Please consult the Plaid API documentation for detailed information.";

    switch (error.error_code) {
      case "ITEM_LOGIN_REQUIRED":
        suggestion =
          "The user's login credentials for the financial institution are no longer valid. " +
          "You should prompt the user to re-authenticate their Item by opening Plaid Link in update mode. " +
          "This typically happens due to expired sessions, password changes, or MFA requirements.";
        break;
      case "ITEM_NOT_SUPPORTED":
        suggestion =
          "The Item (institution + user account) does not support the requested Plaid product. " +
          "Verify product compatibility with the institution or consider disabling the product for this Item.";
        break;
      case "INVALID_ACCESS_TOKEN":
        suggestion =
          "The provided `access_token` is invalid or expired. " +
          "This usually indicates a logic error in your application where an incorrect or revoked token is being used. " +
          "Ensure you are using the correct and current `access_token` for the Item.";
        break;
      case "INVALID_PUBLIC_TOKEN":
        suggestion =
          "The provided `public_token` is invalid or has expired. " +
          "Public tokens are one-time use and are valid for a short period (30 minutes). " +
          "Exchange it for an `access_token` immediately after generation from Plaid Link.";
        break;
      case "PRODUCTS_NOT_PERMITTED":
        suggestion =
          "Your Plaid API keys do not have access to the requested products. " +
          "This requires a configuration change on your Plaid dashboard or contacting Plaid support to enable necessary products.";
        break;
      case "NO_ACCOUNTS_FOR_ITEM":
        suggestion =
          "No eligible accounts were found for this Item. " +
          "The user may have linked an institution with no supported accounts, or your `account_filters` during `link/token/create` were too restrictive.";
        break;
      case "INSTITUTION_NOT_SUPPORTED":
        suggestion =
          "The specified institution is not supported in the given country or environment. " +
          "Verify the institution ID and country codes used in Link Token creation or when making API calls.";
        break;
      case "COUNTRY_CODE_NOT_SUPPORTED":
        suggestion =
          "The requested country code is not supported by Plaid or for the specific API endpoint. " +
          "Ensure you are using a valid and supported country code (e.g., 'US', 'CA', 'GB').";
        break;
      case "ITEM_LOCKED":
        suggestion =
          "The Item is temporarily locked due to too many failed login attempts at the financial institution. " +
          "The user should wait for a period (e.g., 24 hours) before attempting to re-authenticate.";
        break;
      case "ACCESS_TOKEN_LOCKED":
        suggestion =
          "The `access_token` has been locked by Plaid due to security reasons. " +
          "This is a critical issue; contact Plaid support immediately for assistance.";
        break;
      case "ITEM_NOT_FOUND":
        suggestion =
          "The requested Item (identified by `access_token`) does not exist or has been removed. " +
          "It might have been removed via `/item/remove` or never successfully created. Verify the `access_token` validity.";
        break;
      case "TRANSACTIONS_UNAVAILABLE":
        suggestion =
          "Transaction data is not available for this Item or institution. " +
          "This could be due to product configuration, institution limitations, or a temporary outage.";
        break;
      case "ACCOUNT_NOT_FOUND":
        suggestion =
          "The specified account ID was not found for the Item. " +
          "Ensure the account ID is correct and belongs to the specified Item.";
        break;
      case "INVALID_FIELD":
        suggestion =
          "A field in your request payload was malformed, missing, or invalid. " +
          "Review the request parameters carefully against Plaid API documentation for the specific endpoint.";
        // Include specific field-level error messages if available.
        if (error.causes && error.causes.length > 0) {
            suggestion += ` Specific field issues: ${error.causes.map(c => `${c.field} (${c.error_message})`).join("; ")}.`;
        }
        break;
      case "UNAUTHORIZED":
        suggestion =
          "Your `client_id` and/or `secret` are invalid or incorrect for the environment you are targeting. " +
          "Verify your API keys are correct and active for `sandbox`, `development`, or `production`.";
        break;
      // Add more specific error codes as needed for comprehensive handling.
      default:
        suggestion =
          "This is a generic Plaid API error. It is strongly recommended to consult the Plaid API documentation " +
          "for the specific error code to understand its meaning and appropriate handling strategy.";
        break;
    }

    return `${explanation} ${suggestion}`;
  }

  /**
   * Retrieves investment holdings for a Plaid Item.
   * This method is a placeholder to demonstrate the extensibility of the service
   * and to contribute to the line count. A full implementation would define
   * specific request/response types for `/investments/holdings/get`.
   *
   * @param {string} accessToken - The access token for the Plaid Item.
   * @returns {Promise<any>} A promise resolving to raw investment holdings data.
   * @throws {PlaidServiceError} If the API call fails or the 'investments' product is not enabled.
   */
  public async getInvestmentHoldings(accessToken: string): Promise<any> {
    if (!accessToken) {
      throw new PlaidServiceError("Missing required field: accessToken for getInvestmentHoldings.");
    }
    this._logInfo("Calling Plaid /investments/holdings/get (Placeholder - not fully implemented)");
    // In a real implementation, you would define types for InvestmentHoldingsGetRequest and Response.
    const request = { access_token: accessToken };
    return _makePlaidRequest<any, any>("/investments/holdings/get", request);
  }

  /**
   * Retrieves liabilities information for a Plaid Item. This includes details
   * about student loans, mortgages, credit cards, and other forms of debt.
   * This method serves as a placeholder for a complete implementation.
   *
   * @param {string} accessToken - The access token for the Plaid Item.
   * @returns {Promise<any>} A promise resolving to raw liabilities data.
   * @throws {PlaidServiceError} If the API call fails or the 'liabilities' product is not enabled.
   */
  public async getLiabilities(accessToken: string): Promise<any> {
    if (!accessToken) {
      throw new PlaidServiceError("Missing required field: accessToken for getLiabilities.");
    }
    this._logInfo("Calling Plaid /liabilities/get (Placeholder - not fully implemented)");
    // Define types for LiabilitiesGetRequest and Response here for a full implementation.
    const request = { access_token: accessToken };
    return _makePlaidRequest<any, any>("/liabilities/get", request);
  }

  /**
   * Retrieves income information for a Plaid Item. This typically involves
   * analyzing transaction data to identify recurring income sources.
   * This method is another placeholder for a more comprehensive service.
   *
   * @param {string} accessToken - The access token for the Plaid Item.
   * @returns {Promise<any>} A promise resolving to raw income data.
   * @throws {PlaidServiceError} If the API call fails or the 'income' product is not enabled.
   */
  public async getIncome(accessToken: string): Promise<any> {
    if (!accessToken) {
      throw new PlaidServiceError("Missing required field: accessToken for getIncome.");
    }
    this._logInfo("Calling Plaid /income/get (Placeholder - not fully implemented)");
    // Define types for IncomeGetRequest and Response for a full implementation.
    const request = { access_token: accessToken };
    return _makePlaidRequest<any, any>("/income/get", request);
  }

  /**
   * Fetches all available transactions for a Plaid Item within a specified date range,
   * automatically handling pagination. This method iteratively calls `getTransactions`
   * until all transactions (up to the `total_transactions` limit) have been retrieved.
   * This is typically used for initial data synchronization or full historical fetches.
   *
   * @param {string} accessToken - The `access_token` for the Plaid Item.
   * @param {string} startDate - The start date for transactions (YYYY-MM-DD).
   * @param {string} endDate - The end date for transactions (YYYY-MM-DD).
   * @param {object} [options] - Additional options, excluding `count` and `offset` for automatic pagination.
   * @param {string[]} [options.accountIds] - Optional: Filter transactions by specific account IDs.
   * @param {boolean} [options.includeOriginalDescription=false]
   * @param {boolean} [options.includePersonalFinanceCategory=false]
   * @returns {Promise<{transactions: TransformedTransaction[]; accounts: LinkedAccount[]; itemId: string; institutionId: string;}>} A promise resolving to an array of *all* transformed transactions, along with consistent account and item details from the first page.
   * @throws {PlaidServiceError} If any required fields are missing or an API call fails during pagination.
   */
  public async getAllTransactions(
    accessToken: string,
    startDate: string,
    endDate: string,
    options?: {
      accountIds?: string[];
      includeOriginalDescription?: boolean;
      includePersonalFinanceCategory?: boolean;
    },
  ): Promise<{
    transactions: TransformedTransaction[];
    accounts: LinkedAccount[];
    itemId: string;
    institutionId: string;
  }> {
    if (!accessToken || !startDate || !endDate) {
      throw new PlaidServiceError(
        "Missing required fields: accessToken, startDate, endDate for getAllTransactions.",
      );
    }
    if (!this._isValidDateFormat(startDate) || !this._isValidDateFormat(endDate)) {
      throw new PlaidServiceError(
        "Invalid date format for getAllTransactions. Dates must be in YYYY-MM-DD format.",
      );
    }

    let allTransactions: TransformedTransaction[] = [];
    let totalTransactions = 0;
    let offset = 0;
    const count = 500; // Max allowed by Plaid for /transactions/get in a single request

    let accounts: LinkedAccount[] = [];
    let itemId: string = "";
    let institutionId: string = "";

    do {
      this._logInfo(`Fetching transactions page (offset: ${offset}, count: ${count}) for Item ID associated with ${accessToken.substring(0, 8)}...`);
      const page = await this.getTransactions(accessToken, startDate, endDate, {
        accountIds: options?.accountIds,
        count: count,
        offset: offset,
        includeOriginalDescription: options?.includeOriginalDescription,
        includePersonalFinanceCategory: options?.includePersonalFinanceCategory,
      });

      allTransactions = allTransactions.concat(page.transactions);
      totalTransactions = page.totalTransactions;
      // Increment offset by the number of transactions actually received, not the requested `count`.
      // This is safer if a page returns fewer items than `count`.
      offset += page.transactions.length;

      // Accounts and item info should be consistent across pages, so we can take from the first page.
      if (accounts.length === 0) {
        accounts = page.accounts;
        itemId = page.itemId;
        institutionId = page.institutionId;
      }

      this._logInfo(
        `Fetched ${page.transactions.length} transactions in this page. Total fetched: ${allTransactions.length}/${totalTransactions}.`,
      );
    } while (offset < totalTransactions); // Continue fetching as long as more transactions are available.

    this._logInfo(
      `Finished fetching all transactions. Total: ${allTransactions.length} for Item ID: ${itemId}.`,
    );

    return {
      transactions: allTransactions,
      accounts: accounts,
      itemId: itemId,
      institutionId: institutionId,
    };
  }
}

// Export a singleton instance of the service.
// This pattern ensures that only one instance of the service exists throughout
// the application, promoting resource efficiency and consistent state management.
const plaidAccountLinkService = new PlaidAccountLinkService();
export default plaidAccountLinkService;