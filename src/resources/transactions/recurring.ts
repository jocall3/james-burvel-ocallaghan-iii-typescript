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
   *     startDate: '2024-09-01',
   *     linkedAccountId: 'acc_chase_checking_4567',
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
   * Amount of each recurring payment.
   */
  amount: number;

  /**
   * Category of the recurring transaction.
   */
  category: string;

  /**
   * Currency of the recurring transaction.
   */
  currency: string;

  /**
   * Description of the recurring transaction.
   */
  description: string;

  /**
   * Frequency of the recurring transaction.
   */
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

  /**
   * Next scheduled payment date.
   */
  nextDueDate: string;

  /**
   * Current status of the recurring transaction.
   */
  status: 'active' | 'paused' | 'cancelled' | 'completed';

  /**
   * AI's confidence score (0-1) for its detection or categorization of this
   * recurring pattern.
   */
  aiConfidenceScore?: number | null;

  /**
   * Last date the transaction was paid.
   */
  lastPaidDate?: string | null;

  /**
   * The account associated with this recurring transaction.
   */
  linkedAccountId?: string | null;
}

export type RecurringListResponse = Array<RecurringTransaction>;

export interface RecurringCreateParams {
  /**
   * Amount of each recurring payment.
   */
  amount: number;

  /**
   * Category of the new recurring transaction.
   */
  category: string;

  /**
   * Currency of the recurring transaction.
   */
  currency: string;

  /**
   * Description of the new recurring transaction.
   */
  description: string;

  /**
   * Frequency of the recurring transaction.
   */
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

  /**
   * The date the first payment is expected or scheduled.
   */
  startDate: string;

  /**
   * Optional: The account to associate with this recurring transaction.
   */
  linkedAccountId?: string | null;
}

export declare namespace Recurring {
  export {
    type RecurringTransaction as RecurringTransaction,
    type RecurringListResponse as RecurringListResponse,
    type RecurringCreateParams as RecurringCreateParams,
  };
}
