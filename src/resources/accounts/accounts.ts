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
   * Name of the financial institution where the account is held.
   */
  institutionName: string;

  /**
   * Timestamp of when the account balance was last updated.
   */
  lastUpdated: string;

  /**
   * Masked account number (e.g., last 4 digits) for display.
   */
  mask: string;

  /**
   * User-friendly name of the account.
   */
  name: string;

  /**
   * High-level type of the financial account.
   */
  type: 'depository' | 'credit' | 'loan' | 'investment' | 'other';

  /**
   * The available balance, considering pending transactions or holds.
   */
  availableBalance?: number | null;

  /**
   * Optional: Identifier from the external financial institution/aggregator.
   */
  externalId?: string | null;

  /**
   * Specific subtype of the account (e.g., checking, savings, IRA, credit card).
   */
  subtype?: string | null;
}

export interface AccountLinkNewInstitutionResponse {
  /**
   * The URI to which the user should be redirected to complete the authentication
   * process with the external institution.
   */
  authUri: string;

  /**
   * A unique identifier for the account linking session.
   */
  linkSessionId: string;

  /**
   * Current status of the linking process.
   */
  status: 'pending_user_action' | 'error';

  /**
   * A descriptive message about the next steps or any errors.
   */
  message?: string | null;
}

export type AccountListLinkedAccountsResponse = Array<LinkedAccount>;

export interface AccountRetrieveAccountDetailsResponse extends LinkedAccount {
  /**
   * Name of the primary account holder.
   */
  accountHolder?: string;

  /**
   * Historical daily balances for the account.
   */
  balanceHistory?: Array<AccountRetrieveAccountDetailsResponse.BalanceHistory>;

  /**
   * Annual interest rate for the account (e.g., for savings or loans).
   */
  interestRate?: number | null;

  /**
   * Date when the account was opened.
   */
  openedDate?: string | null;

  /**
   * AI-driven projection of future cash flow for the account.
   */
  projectedCashFlow?: AccountRetrieveAccountDetailsResponse.ProjectedCashFlow;

  /**
   * Total number of transactions in the account's history (or within a default
   * period).
   */
  transactionsCount?: number;
}

export namespace AccountRetrieveAccountDetailsResponse {
  export interface BalanceHistory {
    balance?: number;

    date?: string;
  }

  /**
   * AI-driven projection of future cash flow for the account.
   */
  export interface ProjectedCashFlow {
    /**
     * AI's confidence score (0-100) in the accuracy of the projection.
     */
    confidenceScore?: number;

    /**
     * AI-projected net cash flow for the next 30 days.
     */
    days30?: number | null;

    /**
     * AI-projected net cash flow for the next 90 days.
     */
    days90?: number | null;
  }
}

export interface AccountLinkNewInstitutionParams {
  /**
   * ISO 3166-1 alpha-2 country code of the institution.
   */
  countryCode: string;

  /**
   * The name of the external financial institution to link.
   */
  institutionName: string;

  /**
   * Optional: Specific financial data aggregator to use.
   */
  provider?: 'plaid' | 'mx' | 'finicity' | 'other' | null;
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
