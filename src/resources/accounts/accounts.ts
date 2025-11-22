// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as OverdraftSettingsAPI from './overdraft-settings';
import { OverdraftSettingUpdateSettingsParams, OverdraftSettings } from './overdraft-settings';
import * as TransactionsAPI from './transactions';
import { TransactionListPendingTransactionsResponse, Transactions } from './transactions';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
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
   * const linkedAccounts =
   *   await client.accounts.listLinkedAccounts();
   * ```
   */
  listLinkedAccounts(options?: RequestOptions): APIPromise<AccountListLinkedAccountsResponse> {
    return this._client.get('/accounts/me', options);
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
   *
   * const content = await response.blob();
   * console.log(content);
   * ```
   */
  retrieveAccountStatements(
    accountID: string,
    query: AccountRetrieveAccountStatementsParams,
    options?: RequestOptions,
  ): APIPromise<Response> {
    return this._client.get(path`/accounts/${accountID}/statements`, {
      query,
      ...options,
      headers: buildHeaders([{ Accept: 'application/pdf' }, options?.headers]),
      __binaryResponse: true,
    });
  }
}

export interface LinkedAccount {
  /**
   * Unique identifier for the linked account within .
   */
  id: string;

  /**
   * The currency of the account (ISO 4217 code).
   */
  currency: string;

  /**
   * The current balance of the account.
   */
  currentBalance: number;

  /**
   * Name of the financial institution holding the account.
   */
  institutionName: string;

  /**
   * Timestamp when the account balance and details were last synced.
   */
  lastUpdated: string;

  /**
   * User-friendly name of the account.
   */
  name: string;

  /**
   * High-level type of the financial account.
   */
  type: 'depository' | 'credit' | 'investment' | 'loan' | 'other';

  /**
   * Current status of the connection to the external institution.
   */
  accountLinkStatus?: 'active' | 'inactive' | 'reconnect_required' | 'error';

  /**
   * Full account number (sensitive, typically only accessible with explicit
   * permissions).
   */
  accountNumber?: string | null;

  /**
   * The available balance of the account (may differ from current due to pending
   * transactions).
   */
  availableBalance?: number | null;

  /**
   * Optional: Identifier from the external financial institution (e.g., Plaid
   * account ID).
   */
  externalId?: string | null;

  /**
   * Last 4 digits of the account number for display purposes (masked).
   */
  mask?: string | null;

  /**
   * Bank routing number (sensitive, typically only accessible with explicit
   * permissions).
   */
  routingNumber?: string | null;

  /**
   * Specific subtype of the account (e.g., checking, savings, IRA, credit card).
   */
  subtype?: string | null;
}

export interface AccountLinkNewInstitutionResponse {
  /**
   * The URI to which the user should be redirected to complete the external
   * institution's authentication flow.
   */
  authUri: string;

  /**
   * A unique identifier for the account linking session.
   */
  linkSessionId: string;

  /**
   * Current status of the linking process.
   */
  status: 'pending_user_action' | 'linking_in_progress' | 'completed' | 'failed';

  /**
   * A descriptive message regarding the next steps or status.
   */
  message?: string | null;
}

export type AccountListLinkedAccountsResponse = Array<LinkedAccount>;

export interface AccountRetrieveAccountDetailsResponse extends LinkedAccount {
  /**
   * The name of the primary holder of the account.
   */
  accountHolder?: string;

  /**
   * Historical daily balances for the account over a recent period.
   */
  balanceHistory?: Array<AccountRetrieveAccountDetailsResponse.BalanceHistory>;

  /**
   * Annual interest rate for the account (e.g., APY for savings, APR for credit).
   */
  interestRate?: number | null;

  /**
   * The date the account was opened.
   */
  openedDate?: string | null;

  projectedCashFlow?: AccountRetrieveAccountDetailsResponse.ProjectedCashFlow;

  /**
   * Total number of transactions recorded for this account.
   */
  transactionsCount?: number;
}

export namespace AccountRetrieveAccountDetailsResponse {
  export interface BalanceHistory {
    /**
     * Balance on that date.
     */
    balance?: number;

    /**
     * Date of the balance snapshot.
     */
    date?: string;
  }

  export interface ProjectedCashFlow {
    /**
     * AI's confidence score (0-100) in the accuracy of the cash flow projection.
     */
    confidenceScore?: number;

    /**
     * Projected net cash flow for the next 30 days.
     */
    days30?: number;

    /**
     * Projected net cash flow for the next 90 days.
     */
    days90?: number;
  }
}

export interface AccountLinkNewInstitutionParams {
  /**
   * The ISO 3166-1 alpha-2 country code of the institution.
   */
  countryCode: string;

  /**
   * The name of the financial institution to link.
   */
  institutionName: string;

  /**
   * Optional: Additional provider-specific metadata for linking.
   */
  metadata?: unknown | null;

  /**
   * Optional: The type of third-party linking provider to use.
   */
  providerType?: 'plaid' | 'mx' | 'finicity' | 'other' | null;
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
   * Desired format for the statement.
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
    type AccountLinkNewInstitutionParams as AccountLinkNewInstitutionParams,
    type AccountRetrieveAccountStatementsParams as AccountRetrieveAccountStatementsParams,
  };

  export {
    Transactions as Transactions,
    type TransactionListPendingTransactionsResponse as TransactionListPendingTransactionsResponse,
  };

  export {
    type OverdraftSettings as OverdraftSettings,
    type OverdraftSettingUpdateSettingsParams as OverdraftSettingUpdateSettingsParams,
  };
}
