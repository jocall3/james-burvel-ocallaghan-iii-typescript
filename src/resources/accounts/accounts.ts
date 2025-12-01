// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as OverdraftSettingsAPI from './overdraft-settings';
import { OverdraftSettingUpdateSettingsParams, OverdraftSettings } from './overdraft-settings';
import * as TransactionsAPI from './transactions';
import {
  TransactionListPendingTransactionsParams,
  TransactionListPendingTransactionsResponse,
  Transactions,
} from './transactions';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Accounts extends APIResource {
  transactions: TransactionsAPI.Transactions = new TransactionsAPI.Transactions(this._client);
  overdraftSettings: OverdraftSettingsAPI.OverdraftSettings = new OverdraftSettingsAPI.OverdraftSettings(
    this._client,
  );

  /**
   * Begins the secure process of linking a new external financial institution (e.g.,
   * another bank, investment platform) to the user's profile, typically involving a
   * third-party tokenized flow.
   *
   * @example
   * ```ts
   * const response = await client.accounts.linkNewInstitution({
   *   countryCode: 'US',
   *   institutionName: 'Bank of America',
   * });
   * ```
   */
  linkNewInstitution(
    body: AccountLinkNewInstitutionParams,
    options?: RequestOptions,
  ): APIPromise<AccountLinkNewInstitutionResponse> {
    return this._client.post('/accounts/link', { body, ...options });
  }

  /**
   * Fetches a comprehensive, real-time list of all external financial accounts
   * linked to the user's profile, including consolidated balances and institutional
   * details.
   *
   * @example
   * ```ts
   * const response = await client.accounts.listLinkedAccounts();
   * ```
   */
  listLinkedAccounts(
    query: AccountListLinkedAccountsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<AccountListLinkedAccountsResponse> {
    return this._client.get('/accounts/me', { query, ...options });
  }

  /**
   * Retrieves comprehensive analytics for a specific financial account, including
   * historical balance trends, projected cash flow, and AI-driven insights into
   * spending patterns.
   *
   * @example
   * ```ts
   * const response =
   *   await client.accounts.retrieveAccountDetails(
   *     'acc_chase_checking_4567',
   *   );
   * ```
   */
  retrieveAccountDetails(
    accountID: string,
    options?: RequestOptions,
  ): APIPromise<AccountRetrieveAccountDetailsResponse> {
    return this._client.get(path`/accounts/${accountID}/details`, options);
  }

  /**
   * Fetches digital statements for a specific account, allowing filtering by date
   * range and format.
   *
   * @example
   * ```ts
   * const response =
   *   await client.accounts.retrieveAccountStatements(
   *     'acc_chase_checking_4567',
   *     { month: 7, year: 2024 },
   *   );
   * ```
   */
  retrieveAccountStatements(
    accountID: string,
    query: AccountRetrieveAccountStatementsParams,
    options?: RequestOptions,
  ): APIPromise<AccountRetrieveAccountStatementsResponse> {
    return this._client.get(path`/accounts/${accountID}/statements`, { query, ...options });
  }
}

/**
 * Summary information for a linked financial account.
 */
export interface LinkedAccount {
  /**
   * Unique identifier for the linked account within .
   */
  id: string;

  /**
   * ISO 4217 currency code of the account.
   */
  currency: string;

  /**
   * Current balance of the account.
   */
  currentBalance: number;

  /**
   * Name of the financial institution where the account is held.
   */
  institutionName: string;

  /**
   * Timestamp when the account balance was last synced.
   */
  lastUpdated: string;

  /**
   * Display name of the account.
   */
  name: string;

  /**
   * General type of the account.
   */
  type: 'depository' | 'credit' | 'loan' | 'investment' | 'other';

  /**
   * Available balance (after pending transactions) of the account.
   */
  availableBalance?: number | null;

  /**
   * Optional: Identifier from the external data provider (e.g., Plaid).
   */
  externalId?: string | null;

  /**
   * Masked account number (e.g., last 4 digits).
   */
  mask?: string | null;

  /**
   * Specific subtype of the account (e.g., checking, savings, IRA, 401k).
   */
  subtype?: string | null;
}

export interface AccountLinkNewInstitutionResponse {
  /**
   * The URI to redirect the user to complete authentication with the external
   * institution.
   */
  authUri: string;

  /**
   * Unique session ID for the account linking process.
   */
  linkSessionId: string;

  /**
   * Current status of the linking process.
   */
  status: 'pending_user_action' | 'completed' | 'failed';

  /**
   * A descriptive message regarding the next steps.
   */
  message?: string | null;
}

export interface AccountListLinkedAccountsResponse {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: number;

  /**
   * The number of items skipped before the current page.
   */
  offset: number;

  /**
   * The total number of items available across all pages.
   */
  total: number;

  data?: Array<LinkedAccount>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

/**
 * Summary information for a linked financial account.
 */
export interface AccountRetrieveAccountDetailsResponse extends LinkedAccount {
  /**
   * Name of the primary holder for this account.
   */
  accountHolder?: string;

  /**
   * Historical daily balance data.
   */
  balanceHistory?: Array<AccountRetrieveAccountDetailsResponse.BalanceHistory>;

  /**
   * Annual interest rate (if applicable).
   */
  interestRate?: number | null;

  /**
   * Date the account was opened.
   */
  openedDate?: string | null;

  projectedCashFlow?: AccountRetrieveAccountDetailsResponse.ProjectedCashFlow;

  /**
   * Total number of transactions in this account.
   */
  transactionsCount?: number;
}

export namespace AccountRetrieveAccountDetailsResponse {
  export interface BalanceHistory {
    balance?: number;

    date?: string;
  }

  export interface ProjectedCashFlow {
    /**
     * AI confidence score for the cash flow projection (0-100).
     */
    confidenceScore?: number;

    /**
     * Projected cash flow for the next 30 days.
     */
    days30?: number;

    /**
     * Projected cash flow for the next 90 days.
     */
    days90?: number;
  }
}

export interface AccountRetrieveAccountStatementsResponse {
  /**
   * The account ID the statement belongs to.
   */
  accountId: string;

  /**
   * Map of available download URLs for different formats.
   */
  downloadUrls: AccountRetrieveAccountStatementsResponse.DownloadURLs;

  /**
   * The period covered by the statement.
   */
  period: string;

  /**
   * Unique identifier for the statement.
   */
  statementId: string;
}

export namespace AccountRetrieveAccountStatementsResponse {
  /**
   * Map of available download URLs for different formats.
   */
  export interface DownloadURLs {
    /**
     * Signed URL to download the statement in CSV format.
     */
    csv?: string;

    /**
     * Signed URL to download the statement in PDF format.
     */
    pdf?: string;
  }
}

export interface AccountLinkNewInstitutionParams {
  /**
   * Two-letter ISO country code of the institution.
   */
  countryCode: string;

  /**
   * Name of the financial institution to link.
   */
  institutionName: string;

  /**
   * Optional: Specific identifier for a third-party linking provider (e.g., 'plaid',
   * 'finicity').
   */
  providerIdentifier?: string | null;

  /**
   * Optional: URI to redirect the user after completing the external authentication
   * flow.
   */
  redirectUri?: string | null;
}

export interface AccountListLinkedAccountsParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export interface AccountRetrieveAccountStatementsParams {
  /**
   * Month for the statement (1-12).
   */
  month: number;

  /**
   * Year for the statement.
   */
  year: number;

  /**
   * Desired format for the statement. Use 'application/json' Accept header for
   * download links.
   */
  format?: 'pdf' | 'csv';
}

Accounts.Transactions = Transactions;

export declare namespace Accounts {
  export {
    type LinkedAccount as LinkedAccount,
    type AccountLinkNewInstitutionResponse as AccountLinkNewInstitutionResponse,
    type AccountListLinkedAccountsResponse as AccountListLinkedAccountsResponse,
    type AccountRetrieveAccountDetailsResponse as AccountRetrieveAccountDetailsResponse,
    type AccountRetrieveAccountStatementsResponse as AccountRetrieveAccountStatementsResponse,
    type AccountLinkNewInstitutionParams as AccountLinkNewInstitutionParams,
    type AccountListLinkedAccountsParams as AccountListLinkedAccountsParams,
    type AccountRetrieveAccountStatementsParams as AccountRetrieveAccountStatementsParams,
  };

  export {
    Transactions as Transactions,
    type TransactionListPendingTransactionsResponse as TransactionListPendingTransactionsResponse,
    type TransactionListPendingTransactionsParams as TransactionListPendingTransactionsParams,
  };

  export {
    type OverdraftSettings as OverdraftSettings,
    type OverdraftSettingUpdateSettingsParams as OverdraftSettingUpdateSettingsParams,
  };
}
