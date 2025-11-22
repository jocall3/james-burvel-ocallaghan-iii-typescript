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
   * const recurrings =
   *   await client.transactions.recurring.list();
   * ```
   */
  list(
    query: RecurringListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<RecurringListResponse> {
    return this._client.get('/transactions/recurring', { query, ...options });
  }
}

/**
 * Details of a detected or user-defined recurring transaction.
 */
export interface RecurringTransaction {
  /**
   * Unique identifier for the recurring transaction.
   */
  id: string;

  /**
   * Amount of the recurring transaction.
   */
  amount: number;

  /**
   * Category of the recurring transaction.
   */
  category: string;

  /**
   * ISO 4217 currency code.
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
   * Current status of the recurring transaction.
   */
  status: 'active' | 'inactive' | 'cancelled' | 'paused';

  /**
   * AI confidence score that this is a recurring transaction (0-1).
   */
  aiConfidenceScore?: number | null;

  /**
   * Date of the last payment for this recurring transaction.
   */
  lastPaidDate?: string | null;

  /**
   * ID of the account typically used for this recurring transaction.
   */
  linkedAccountId?: string | null;

  /**
   * Next scheduled due date for the transaction.
   */
  nextDueDate?: string | null;
}

export interface RecurringListResponse {
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

  data?: Array<RecurringTransaction>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface RecurringCreateParams {
  /**
   * Amount of the recurring transaction.
   */
  amount: number;

  /**
   * Category of the recurring transaction.
   */
  category: string;

  /**
   * ISO 4217 currency code.
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
   * ID of the account to associate with this recurring transaction.
   */
  linkedAccountId: string;

  /**
   * The date when this recurring transaction is expected to start.
   */
  startDate: string;
}

export interface RecurringListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace Recurring {
  export {
    type RecurringTransaction as RecurringTransaction,
    type RecurringListResponse as RecurringListResponse,
    type RecurringCreateParams as RecurringCreateParams,
    type RecurringListParams as RecurringListParams,
  };
}
