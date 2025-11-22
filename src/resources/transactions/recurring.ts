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
   * Typical amount of the recurring transaction.
   */
  amount: number;

  /**
   * Category of the recurring transaction.
   */
  category: string;

  /**
   * Currency of the transaction.
   */
  currency: string;

  /**
   * Description of the recurring transaction.
   */
  description: string;

  /**
   * How often the transaction occurs.
   */
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

  /**
   * The next expected date for this recurring transaction.
   */
  nextDueDate: string | null;

  /**
   * Current status of the recurring transaction.
   */
  status: 'active' | 'inactive' | 'cancelled';

  /**
   * AI's confidence in accurately identifying this as a recurring transaction.
   */
  aiConfidenceScore?: number | null;

  /**
   * The date the last recurring transaction occurred.
   */
  lastPaidDate?: string | null;

  /**
   * Optional: The account from which this recurring transaction is typically paid or
   * received.
   */
  linkedAccountId?: string | null;
}

export type RecurringListResponse = Array<RecurringTransaction>;

export interface RecurringCreateParams {
  /**
   * The expected amount of the recurring transaction.
   */
  amount: number;

  /**
   * Category of the recurring transaction.
   */
  category: string;

  /**
   * The currency of the transaction (ISO 4217 code).
   */
  currency: string;

  /**
   * Description for the new recurring transaction.
   */
  description: string;

  /**
   * How often the transaction is expected to occur.
   */
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

  /**
   * The date the first recurring transaction is expected.
   */
  startDate: string;

  /**
   * Optional: The account from which this recurring transaction will be paid or
   * received.
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
