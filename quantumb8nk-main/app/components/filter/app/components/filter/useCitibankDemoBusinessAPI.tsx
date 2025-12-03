// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// --- Global Type Definitions ---

/**
 * Represents a universally unique identifier (UUID) string.
 * This is used for primary keys and foreign keys across entities.
 * @typedef {string} UUID
 */
type UUID = string;

/**
 * Represents an ISO 8601 formatted date and time string (e.g., "2023-10-27T10:00:00.000Z").
 * Used for all timestamp and date-related fields.
 * @typedef {string} ISODateString
 */
type ISODateString = string;

/**
 * Supported currency codes.
 * @typedef {'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD'} Currency
 */
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD';

/**
 * Represents a monetary amount with a specific value and currency.
 * @interface MonetaryAmount
 * @property {number} value - The numerical value of the amount. Can be positive or negative for transactions.
 * @property {Currency} currency - The currency code (e.g., 'USD', 'EUR').
 */
type MonetaryAmount = {
  value: number;
  currency: Currency;
};

// --- API Response Structures ---

/**
 * Represents common pagination metadata returned by list APIs.
 * @interface PaginationParams
 * @property {number} [page=1] - The current page number (1-indexed).
 * @property {number} [limit=10] - The maximum number of items per page.
 */
type PaginationParams = {
  page?: number;
  limit?: number;
};

/**
 * Represents metadata typically returned with paginated API responses.
 * @interface APIResponseMeta
 * @property {number} [total] - The total number of items available across all pages.
 * @property {number} [page] - The current page number of the results.
 * @property {number} [limit] - The maximum number of items requested per page.
 * @property {number} [totalPages] - The total number of pages available.
 * @property {number} [nextPage] - The next page number, if available.
 * @property {number} [prevPage] - The previous page number, if available.
 */
type APIResponseMeta = {
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  nextPage?: number;
  prevPage?: number;
};

/**
 * Represents an error structure in an API response.
 * @interface APIResponseError
 * @property {string} code - A unique error code (e.g., 'AUTH_FAILED', 'NOT_FOUND').
 * @property {string} message - A human-readable description of the error.
 * @property {Record<string, unknown>} [details] - Optional additional details about the error.
 */
type APIResponseError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

/**
 * The standard structure for all API responses, containing data, metadata, and optional error information.
 * @template T - The type of the data payload for a successful response.
 * @interface APIResponse
 * @property {T} data - The primary data payload of the response. This will be an empty object or array if an error occurs.
 * @property {APIResponseMeta} meta - Metadata about the response, especially for paginated lists.
 * @property {APIResponseError} [error] - Optional error object, present if the API call was unsuccessful.
 */
type APIResponse<T> = {
  data: T;
  meta: APIResponseMeta;
  error?: APIResponseError;
};

// --- Authentication & User Management Types ---

/**
 * Represents user credentials for login or registration.
 * @interface UserCredentials
 * @property {string} email - The user's email address.
 * @property {string} [password] - The user's password. Optional for some flows like passwordless login.
 * @property {string} [otp] - One-time password, for MFA or passwordless.
 */
type UserCredentials = {
  email: string;
  password?: string;
  otp?: string;
};

/**
 * Represents the authentication tokens received upon successful login or refresh.
 * @interface AuthTokens
 * @property {string} accessToken - The token used for authenticating subsequent API requests.
 * @property {string} refreshToken - The token used to obtain a new access token when the current one expires.
 * @property {number} expiresIn - The validity duration of the access token in seconds.
 * @property {'Bearer'} tokenType - The type of token (typically 'Bearer').
 */
type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

/**
 * Represents the geographic address details of a user.
 * @interface UserAddress
 * @property {string} street - The street address.
 * @property {string} city - The city.
 * @property {string} state - The state or province.
 * @property {string} zipCode - The postal or zip code.
 * @property {string} country - The country.
 */
type UserAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

/**
 * Represents the connection status of various financial integrations for a user.
 * @interface UserIntegrationsStatus
 * @property {boolean} stripeConnected - True if Stripe is connected.
 * @property {boolean} plaidConnected - True if Plaid is connected.
 * @property {boolean} modernTreasuryConnected - True if Modern Treasury is connected.
 * @property {boolean} citibankConnected - True if internal Citibank accounts are linked.
 */
type UserIntegrationsStatus = {
  stripeConnected: boolean;
  plaidConnected: boolean;
  modernTreasuryConnected: boolean;
  citibankConnected: boolean;
};

/**
 * Represents a user's profile information.
 * @interface UserProfile
 * @property {UUID} userId - Unique identifier for the user.
 * @property {string} email - User's email address.
 * @property {string} firstName - User's first name.
 * @property {string} lastName - User's last name.
 * @property {ISODateString} createdAt - Timestamp of user account creation.
 * @property {ISODateString} updatedAt - Timestamp of the last profile update.
 * @property {ISODateString} lastLogin - Timestamp of the user's last login.
 * @property {UserAddress} address - User's primary address.
 * @property {string} phone - User's phone number.
 * @property {UserIntegrationsStatus} integrations - Status of connected financial integrations.
 * @property {string[]} roles - Array of roles assigned to the user (e.g., 'user', 'admin').
 * @property {Record<string, unknown>} [preferences] - Optional user preferences.
 */
type UserProfile = {
  userId: UUID;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastLogin: ISODateString;
  address: UserAddress;
  phone: string;
  integrations: UserIntegrationsStatus;
  roles: string[];
  preferences?: Record<string, unknown>;
};

// --- Financial Accounts Types ---

/**
 * Represents the type of a financial account.
 * @typedef {'checking' | 'savings' | 'credit_card' | 'loan' | 'investment' | 'external_bank' | 'money_market'} AccountType
 */
type AccountType = 'checking' | 'savings' | 'credit_card' | 'loan' | 'investment' | 'external_bank' | 'money_market';

/**
 * Represents the current status of a financial account.
 * @typedef {'active' | 'inactive' | 'closed' | 'pending'} AccountStatus
 */
type AccountStatus = 'active' | 'inactive' | 'closed' | 'pending';

/**
 * Represents the financial institution providing the account.
 * @typedef {'Citibank' | 'Stripe' | 'Plaid' | 'ModernTreasury' | 'WellsFargo' | 'BankOfAmerica' | 'JPMorganChase' | 'Other'} FinancialInstitution
 */
type FinancialInstitution = 'Citibank' | 'Stripe' | 'Plaid' | 'ModernTreasury' | 'WellsFargo' | 'BankOfAmerica' | 'JPMorganChase' | 'Other';

/**
 * Represents the balance details for a financial account.
 * @interface AccountBalance
 * @property {MonetaryAmount} current - The current balance in the account.
 * @property {MonetaryAmount} available - The available balance (current minus pending transactions/holds).
 * @property {MonetaryAmount} [limit] - The credit limit for credit card accounts, or overdraft limit for checking.
 * @property {ISODateString} updatedAt - Timestamp when the balance was last updated.
 */
type AccountBalance = {
  current: MonetaryAmount;
  available: MonetaryAmount;
  limit?: MonetaryAmount;
  updatedAt: ISODateString;
};

/**
 * Represents a single financial account, aggregated from various sources.
 * @interface Account
 * @property {UUID} accountId - Unique identifier for the aggregated account.
 * @property {UUID} userId - The ID of the user who owns this account.
 * @property {FinancialInstitution} institution - The financial institution or service where the account resides.
 * @property {string} institutionId - The ID of the account within the external institution's system.
 * @property {string} name - A user-friendly name for the account (e.g., "Main Checking", "Stripe Payouts").
 * @property {AccountType} type - The type of the financial account.
 * @property {string} accountNumberMasked - A masked version of the account number (e.g., "****1234").
 * @property {Currency} currency - The primary currency of the account.
 * @property {AccountBalance} balance - Current and available balance information.
 * @property {AccountStatus} status - The current operational status of the account.
 * @property {ISODateString} createdAt - Timestamp of when the account was first linked/created.
 * @property {ISODateString} updatedAt - Timestamp of the last update to account details.
 * @property {Record<string, unknown>} [metadata] - Optional additional data from the source institution.
 */
type Account = {
  accountId: UUID;
  userId: UUID;
  institution: FinancialInstitution;
  institutionId: string;
  name: string;
  type: AccountType;
  accountNumberMasked: string;
  currency: Currency;
  balance: AccountBalance;
  status: AccountStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  metadata?: Record<string, unknown>;
};

// --- Transaction Types ---

/**
 * Represents the type of a financial transaction.
 * @typedef {'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'purchase' | 'fee' | 'adjustment' | 'refund' | 'interest' | 'income'} TransactionType
 */
type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'purchase' | 'fee' | '