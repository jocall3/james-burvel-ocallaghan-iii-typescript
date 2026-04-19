// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';
import * as TransactionsAPI_ from '../transactions/transactions';

/**
 * Real-time interaction with all linked financial accounts, including comprehensive balance sheets, predictive cash flow, and intelligent overdraft management.
 */
export class Transactions extends APIResource {
  /**
   * Retrieves a list of pending transactions that have not yet cleared for a
   * specific financial account.
   *
   * @example
   * ```ts
   * const response =
   *   await client.accounts.transactions.listPendingTransactions(
   *     'acc_chase_checking_4567',
   *   );
   * ```
   */
  listPendingTransactions(
    accountID: unknown,
    query: TransactionListPendingTransactionsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<TransactionListPendingTransactionsResponse> {
    return this._client.get(path`/accounts/${accountID}/transactions/pending`, { query, ...options });
  }
}

export interface TransactionListPendingTransactionsResponse {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: unknown;

  /**
   * The number of items skipped before the current page.
   */
  offset: unknown;

  /**
   * The total number of items available across all pages.
   */
  total: unknown;

  data?: Array<TransactionsAPI_.Transaction>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface TransactionListPendingTransactionsParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export declare namespace Transactions {
  export {
    type TransactionListPendingTransactionsResponse as TransactionListPendingTransactionsResponse,
    type TransactionListPendingTransactionsParams as TransactionListPendingTransactionsParams,
  };
}
