// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

/**
 * Access, intelligent categorization, real-time analysis, and AI-driven insights into transaction data, including advanced dispute resolution and trend detection.
 */
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
  id: unknown;

  /**
   * Amount of the recurring transaction.
   */
  amount: unknown;

  /**
   * Category of the recurring transaction.
   */
  category: unknown;

  /**
   * ISO 4217 currency code.
   */
  currency: unknown;

  /**
   * Description of the recurring transaction.
   */
  description: unknown;

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
  aiConfidenceScore?: unknown;

  /**
   * Date of the last payment for this recurring transaction.
   */
  lastPaidDate?: unknown;

  /**
   * ID of the account typically used for this recurring transaction.
   */
  linkedAccountId?: unknown;

  /**
   * Next scheduled due date for the transaction.
   */
  nextDueDate?: unknown;
}

export interface RecurringListResponse {
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

  data?: Array<RecurringTransaction>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface RecurringCreateParams {
  /**
   * Amount of the recurring transaction.
   */
  amount: unknown;

  /**
   * Category of the recurring transaction.
   */
  category: unknown;

  /**
   * ISO 4217 currency code.
   */
  currency: unknown;

  /**
   * Description of the recurring transaction.
   */
  description: unknown;

  /**
   * Frequency of the recurring transaction.
   */
  frequency: 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually';

  /**
   * ID of the account to associate with this recurring transaction.
   */
  linkedAccountId: unknown;

  /**
   * The date when this recurring transaction is expected to start.
   */
  startDate: unknown;
}

export interface RecurringListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export declare namespace Recurring {
  export {
    type RecurringTransaction as RecurringTransaction,
    type RecurringListResponse as RecurringListResponse,
    type RecurringCreateParams as RecurringCreateParams,
    type RecurringListParams as RecurringListParams,
  };
}
