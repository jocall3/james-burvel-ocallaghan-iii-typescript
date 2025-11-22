// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TransactionsTransactionsAPI from '../transactions/transactions';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Transactions extends APIResource {
  /**
   * Retrieves a list of pending transactions that have not yet cleared for a
   * specific financial account.
   *
   * @example
   * ```ts
   * const transactions =
   *   await client.accounts.transactions.listPendingTransactions(
   *     'acc_chase_checking_4567',
   *   );
   * ```
   */
  listPendingTransactions(
    accountID: string,
    options?: RequestOptions,
  ): APIPromise<TransactionListPendingTransactionsResponse> {
    return this._client.get(path`/accounts/${accountID}/transactions/pending`, options);
  }
}

export type TransactionListPendingTransactionsResponse = Array<TransactionsTransactionsAPI.Transaction>;

export declare namespace Transactions {
  export { type TransactionListPendingTransactionsResponse as TransactionListPendingTransactionsResponse };
}
