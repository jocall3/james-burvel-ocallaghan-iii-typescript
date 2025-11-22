// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Recurring extends APIResource {
  /**
   * Defines a new recurring transaction pattern for future tracking and budgeting.
   *
   * @example
   * ```ts
   * const recurringTransaction =
   *   await client.transactions.recurring.create({
   *     amount: 55.5,
   *     category: 'Health & Fitness',
   *     currency: 'USD',
   *     description: 'New Gym Membership',
   *     frequency: 'monthly',
   *     linkedAccountId: 'acc_chase_checking_4567',
   *     startDate: '2024-09-01',
   *   });
   * ```
   */
  create(body: RecurringCreateParams, options?: RequestOptions): APIPromise<RecurringTransaction> {
    return this._client.post('/transactions/recurring', { body, ...options });
  }

  /**
   * Retrieves a list of all detected or user-defined recurring transactions, useful
   * for budget tracking and subscription management.
   *
   * @example
   * ```ts
   * const recurringTransactions =
   *   await client.transactions.recurring.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<RecurringListResponse> {
    return this._client.get('/transactions/recurring', options);
  }
}

export interface RecurringTransaction {
  /**
   * Unique identifier for the recurring transaction.
   */
  id: string;

  /**
   * The amount of each recurring transaction.
   */
  amount: number;

  /**
   * Category of the recurring transaction.
   */
  category: string;

  /**
   * The currency of the recurring transaction.
   */
  currency: string;

  /**
   * Description of the recurring transaction.
   */
  description: string;

  /**
   * How often the transaction occurs.
   */
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';

  /**
   * The next expected date for this transaction to occur.
   */
  nextDueDate: string | null;

  /**
   * Current status of the recurring transaction.
   */
  status: 'active' | 'paused' | 'cancelled' | 'completed';

  /**
   * AI's confidence score (0-1) that this is indeed a recurring transaction.
   */
  aiConfidenceScore?: number | null;

  /**
   * The date the last recurring payment was made.
   */
  lastPaidDate?: string | null;

  /**
   * The ID of the account from which this recurring transaction typically occurs.
   */
  linkedAccountId?: string | null;
}

export type RecurringListResponse = Array<RecurringTransaction>;

export interface RecurringCreateParams {
  /**
   * The amount of each recurring transaction.
   */
  amount: number;

  /**
   * Category of the recurring transaction.
   */
  category: string;

  /**
   * The currency of the recurring transaction.
   */
  currency: string;

  /**
   * Description of the new recurring transaction.
   */
  description: string;

  /**
   * How often the transaction occurs.
   */
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';

  /**
   * The ID of the account from which this recurring transaction typically occurs.
   */
  linkedAccountId: string;

  /**
   * The date the recurring transaction is expected to start.
   */
  startDate: string;

  /**
   * Initial status of the recurring transaction.
   */
  status?: 'active' | 'paused';
}

export declare namespace Recurring {
  export {
    type RecurringTransaction as RecurringTransaction,
    type RecurringListResponse as RecurringListResponse,
    type RecurringCreateParams as RecurringCreateParams,
  };
}
