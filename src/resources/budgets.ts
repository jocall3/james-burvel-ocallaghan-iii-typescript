// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as InsightsAPI from './transactions/insights';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Budgets extends APIResource {
  /**
   * Creates a new financial budget for the user, with optional AI auto-population of
   * categories and amounts.
   *
   * @example
   * ```ts
   * const budget = await client.budgets.create({
   *   endDate: '2024-09-30',
   *   name: 'September Living Expenses',
   *   period: 'monthly',
   *   startDate: '2024-09-01',
   *   totalAmount: 2800,
   *   aiAutoPopulate: true,
   *   alertThreshold: 75,
   *   categories: [
   *     { name: 'Rent', allocated: 1500 },
   *     { name: 'Groceries', allocated: 400 },
   *   ],
   * });
   * ```
   */
  create(body: BudgetCreateParams, options?: RequestOptions): APIPromise<Budget> {
    return this._client.post('/budgets', { body, ...options });
  }

  /**
   * Retrieves detailed information for a specific budget, including current
   * spending, remaining amounts, and AI recommendations.
   *
   * @example
   * ```ts
   * const budget = await client.budgets.retrieve(
   *   'budget_monthly_aug',
   * );
   * ```
   */
  retrieve(budgetID: string, options?: RequestOptions): APIPromise<Budget> {
    return this._client.get(path`/budgets/${budgetID}`, options);
  }

  /**
   * Updates the parameters of an existing budget, such as total amount, dates, or
   * categories.
   *
   * @example
   * ```ts
   * const budget = await client.budgets.update(
   *   'budget_monthly_aug',
   *   { alertThreshold: 85, totalAmount: 3200 },
   * );
   * ```
   */
  update(budgetID: string, body: BudgetUpdateParams, options?: RequestOptions): APIPromise<Budget> {
    return this._client.put(path`/budgets/${budgetID}`, { body, ...options });
  }

  /**
   * Retrieves a list of all active and historical budgets for the authenticated
   * user.
   *
   * @example
   * ```ts
   * const budgets = await client.budgets.list();
   * ```
   */
  list(
    query: BudgetListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<BudgetListResponse> {
    return this._client.get('/budgets', { query, ...options });
  }

  /**
   * Deletes a specific budget from the user's profile.
   *
   * @example
   * ```ts
   * await client.budgets.delete('budget_monthly_aug');
   * ```
   */
  delete(budgetID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/budgets/${budgetID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface Budget {
  /**
   * Unique identifier for the budget.
   */
  id: string;

  /**
   * Percentage threshold at which an alert is triggered (e.g., 80% spent).
   */
  alertThreshold: number;

  /**
   * Breakdown of the budget by categories.
   */
  categories: Array<Budget.Category>;

  /**
   * End date of the budget period.
   */
  endDate: string;

  /**
   * Name of the budget.
   */
  name: string;

  /**
   * The frequency or period of the budget.
   */
  period: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

  /**
   * Remaining amount in the budget.
   */
  remainingAmount: number;

  /**
   * Total amount spent against this budget so far.
   */
  spentAmount: number;

  /**
   * Start date of the budget period.
   */
  startDate: string;

  /**
   * Current status of the budget.
   */
  status: 'active' | 'archived' | 'ended';

  /**
   * Total amount allocated for the entire budget.
   */
  totalAmount: number;

  /**
   * AI-driven recommendations related to this budget.
   */
  aiRecommendations?: Array<InsightsAPI.AIInsight> | null;
}

export namespace Budget {
  export interface Category {
    /**
     * Amount allocated to this category.
     */
    allocated: number;

    /**
     * Name of the budget category.
     */
    name: string;

    /**
     * Remaining amount in this category.
     */
    remaining: number;

    /**
     * Amount spent in this category so far.
     */
    spent: number;
  }
}

export interface BudgetListResponse {
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

  data?: Array<Budget>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface BudgetCreateParams {
  /**
   * End date of the budget period.
   */
  endDate: string;

  /**
   * Name of the new budget.
   */
  name: string;

  /**
   * The frequency or period of the budget.
   */
  period: 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

  /**
   * Start date of the budget period.
   */
  startDate: string;

  /**
   * Total amount allocated for the entire budget.
   */
  totalAmount: number;

  /**
   * If true, AI will automatically populate categories and amounts based on
   * historical spending.
   */
  aiAutoPopulate?: boolean;

  /**
   * Percentage threshold at which an alert is triggered.
   */
  alertThreshold?: number;

  /**
   * Initial breakdown of the budget by categories.
   */
  categories?: Array<BudgetCreateParams.Category>;
}

export namespace BudgetCreateParams {
  export interface Category {
    allocated?: number;

    name?: string;
  }
}

export interface BudgetUpdateParams {
  /**
   * Updated percentage threshold for alerts.
   */
  alertThreshold?: number;

  /**
   * Updated breakdown of the budget by categories. Existing categories will be
   * updated, new ones added.
   */
  categories?: Array<BudgetUpdateParams.Category>;

  /**
   * Updated end date of the budget period.
   */
  endDate?: string;

  /**
   * Updated name of the budget.
   */
  name?: string;

  /**
   * Updated start date of the budget period.
   */
  startDate?: string;

  /**
   * Updated status of the budget.
   */
  status?: 'active' | 'archived' | 'ended';

  /**
   * Updated total amount for the entire budget.
   */
  totalAmount?: number;
}

export namespace BudgetUpdateParams {
  export interface Category {
    allocated?: number;

    name?: string;
  }
}

export interface BudgetListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace Budgets {
  export {
    type Budget as Budget,
    type BudgetListResponse as BudgetListResponse,
    type BudgetCreateParams as BudgetCreateParams,
    type BudgetUpdateParams as BudgetUpdateParams,
    type BudgetListParams as BudgetListParams,
  };
}
