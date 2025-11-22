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
  list(options?: RequestOptions): APIPromise<BudgetListResponse> {
    return this._client.get('/budgets', options);
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
   * Breakdown of the budget by category.
   */
  categories: Array<Budget.Category>;

  /**
   * The end date of the current budget period.
   */
  endDate: string;

  /**
   * Name of the budget.
   */
  name: string;

  /**
   * The recurrence period of the budget.
   */
  period: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

  /**
   * The remaining amount in this budget period.
   */
  remainingAmount: number;

  /**
   * The amount spent so far in this budget period.
   */
  spentAmount: number;

  /**
   * The start date of the current budget period.
   */
  startDate: string;

  /**
   * Current status of the budget.
   */
  status: 'active' | 'completed' | 'archived' | 'overspent';

  /**
   * The total allocated budget amount.
   */
  totalAmount: number;

  /**
   * AI-generated recommendations related to budget performance.
   */
  aiRecommendations?: Array<InsightsAPI.AIInsight> | null;

  /**
   * Percentage of budget spent at which an alert should be triggered (e.g., 80 for
   * 80% spent).
   */
  alertThreshold?: number | null;
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
     * Amount spent in this category.
     */
    spent: number;
  }
}

export type BudgetListResponse = Array<Budget>;

export interface BudgetCreateParams {
  /**
   * The end date of the budget period.
   */
  endDate: string;

  /**
   * Name of the new budget.
   */
  name: string;

  /**
   * The recurrence period of the budget.
   */
  period: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

  /**
   * The start date of the budget period.
   */
  startDate: string;

  /**
   * The total amount allocated for the budget.
   */
  totalAmount: number;

  /**
   * If true, AI will automatically suggest and populate budget categories and
   * amounts based on historical spending.
   */
  aiAutoPopulate?: boolean;

  /**
   * Percentage of budget spent at which an alert should be triggered.
   */
  alertThreshold?: number | null;

  /**
   * Optional: Initial breakdown of the budget by categories. If omitted and
   * `aiAutoPopulate` is true, AI will generate.
   */
  categories?: Array<BudgetCreateParams.Category> | null;
}

export namespace BudgetCreateParams {
  export interface Category {
    /**
     * Amount allocated to this category.
     */
    allocated: number;

    /**
     * Category name.
     */
    name: string;
  }
}

export interface BudgetUpdateParams {
  /**
   * Updated percentage for budget alert threshold.
   */
  alertThreshold?: number | null;

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
   * Updated recurrence period of the budget.
   */
  period?: 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'custom';

  /**
   * If true, resets `spentAmount` for all categories and total to 0. Useful for
   * starting a new cycle of a recurring budget.
   */
  resetSpentAmounts?: boolean;

  /**
   * Updated start date of the budget period.
   */
  startDate?: string;

  /**
   * Updated status of the budget.
   */
  status?: 'active' | 'completed' | 'archived' | 'overspent';

  /**
   * Updated total allocated budget amount.
   */
  totalAmount?: number;
}

export namespace BudgetUpdateParams {
  export interface Category {
    /**
     * Amount allocated to this category.
     */
    allocated: number;

    /**
     * Category name.
     */
    name: string;
  }
}

export declare namespace Budgets {
  export {
    type Budget as Budget,
    type BudgetListResponse as BudgetListResponse,
    type BudgetCreateParams as BudgetCreateParams,
    type BudgetUpdateParams as BudgetUpdateParams,
  };
}
