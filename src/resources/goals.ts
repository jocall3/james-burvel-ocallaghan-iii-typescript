// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import * as InsightsAPI from './transactions/insights';
import { APIPromise } from '../core/api-promise';
import { buildHeaders } from '../internal/headers';
import { RequestOptions } from '../internal/request-options';
import { path } from '../internal/utils/path';

export class Goals extends APIResource {
  /**
   * Creates a new long-term financial goal, with optional AI plan generation.
   *
   * @example
   * ```ts
   * const financialGoal = await client.goals.create({
   *   name: 'Dream Vacation Fund',
   *   targetAmount: 15000,
   *   targetDate: '2026-06-30',
   *   type: 'large_purchase',
   *   generateAIPlan: true,
   *   initialContribution: 1000,
   *   riskTolerance: 'medium',
   * });
   * ```
   */
  create(body: GoalCreateParams, options?: RequestOptions): APIPromise<FinancialGoal> {
    return this._client.post('/goals', { body, ...options });
  }

  /**
   * Retrieves detailed information for a specific financial goal, including current
   * progress, AI strategic plan, and related insights.
   *
   * @example
   * ```ts
   * const financialGoal = await client.goals.retrieve(
   *   'goal_retirement_2050',
   * );
   * ```
   */
  retrieve(goalID: string, options?: RequestOptions): APIPromise<FinancialGoal> {
    return this._client.get(path`/goals/${goalID}`, options);
  }

  /**
   * Updates the parameters of an existing financial goal, such as target amount,
   * date, or contributing accounts. This may trigger an AI plan recalculation.
   *
   * @example
   * ```ts
   * const financialGoal = await client.goals.update(
   *   'goal_retirement_2050',
   *   { generateAIPlan: true, targetAmount: 1200000 },
   * );
   * ```
   */
  update(goalID: string, body: GoalUpdateParams, options?: RequestOptions): APIPromise<FinancialGoal> {
    return this._client.put(path`/goals/${goalID}`, { body, ...options });
  }

  /**
   * Retrieves a list of all financial goals defined by the user, including their
   * progress and associated AI plans.
   *
   * @example
   * ```ts
   * const goals = await client.goals.list();
   * ```
   */
  list(
    query: GoalListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<GoalListResponse> {
    return this._client.get('/goals', { query, ...options });
  }

  /**
   * Deletes a specific financial goal from the user's profile.
   *
   * @example
   * ```ts
   * await client.goals.delete('goal_retirement_2050');
   * ```
   */
  delete(goalID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/goals/${goalID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface FinancialGoal {
  /**
   * Unique identifier for the financial goal.
   */
  id: string;

  /**
   * The current amount saved or invested towards the goal.
   */
  currentAmount: number;

  /**
   * Timestamp when the goal's status or progress was last updated.
   */
  lastUpdated: string;

  /**
   * Name of the financial goal.
   */
  name: string;

  /**
   * Percentage completion of the goal.
   */
  progressPercentage: number;

  /**
   * Current status of the goal's progress.
   */
  status: 'on_track' | 'behind_schedule' | 'ahead_of_schedule' | 'completed' | 'paused' | 'cancelled';

  /**
   * The target monetary amount for the goal.
   */
  targetAmount: number;

  /**
   * The target completion date for the goal.
   */
  targetDate: string;

  /**
   * Type of financial goal.
   */
  type: 'retirement' | 'home_purchase' | 'education' | 'large_purchase' | 'debt_reduction' | 'other';

  /**
   * AI-driven insights and recommendations related to this goal.
   */
  aiInsights?: Array<InsightsAPI.AIInsight> | null;

  /**
   * AI-generated strategic plan for achieving the goal.
   */
  aiStrategicPlan?: FinancialGoal.AIStrategicPlan | null;

  /**
   * List of account IDs contributing to this goal.
   */
  contributingAccounts?: Array<string> | null;

  /**
   * Recommended or chosen risk tolerance for investments related to this goal.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive' | null;
}

export namespace FinancialGoal {
  /**
   * AI-generated strategic plan for achieving the goal.
   */
  export interface AIStrategicPlan {
    planId?: string;

    steps?: Array<AIStrategicPlan.Step>;

    summary?: string;
  }

  export namespace AIStrategicPlan {
    export interface Step {
      description?: string;

      status?: 'pending' | 'in_progress' | 'completed';

      title?: string;
    }
  }
}

export interface GoalListResponse {
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

  data?: Array<FinancialGoal>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface GoalCreateParams {
  /**
   * Name of the new financial goal.
   */
  name: string;

  /**
   * The target monetary amount for the goal.
   */
  targetAmount: number;

  /**
   * The target completion date for the goal.
   */
  targetDate: string;

  /**
   * Type of financial goal.
   */
  type: 'retirement' | 'home_purchase' | 'education' | 'large_purchase' | 'debt_reduction' | 'other';

  /**
   * Optional: List of account IDs initially contributing to this goal.
   */
  contributingAccounts?: Array<string> | null;

  /**
   * If true, AI will automatically generate a strategic plan for the goal.
   */
  generateAIPlan?: boolean;

  /**
   * Optional: Initial amount to contribute to the goal.
   */
  initialContribution?: number;

  /**
   * Desired risk tolerance for investments related to this goal.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive' | null;
}

export interface GoalUpdateParams {
  /**
   * Updated list of account IDs contributing to this goal.
   */
  contributingAccounts?: Array<string> | null;

  /**
   * If true, AI will recalculate and update the strategic plan for the goal.
   */
  generateAIPlan?: boolean;

  /**
   * Updated name of the financial goal.
   */
  name?: string;

  /**
   * Updated risk tolerance for investments related to this goal.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive' | null;

  /**
   * Updated status of the goal's progress.
   */
  status?: 'on_track' | 'behind_schedule' | 'ahead_of_schedule' | 'completed' | 'paused' | 'cancelled';

  /**
   * The updated target monetary amount for the goal.
   */
  targetAmount?: number;

  /**
   * The updated target completion date for the goal.
   */
  targetDate?: string;
}

export interface GoalListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace Goals {
  export {
    type FinancialGoal as FinancialGoal,
    type GoalListResponse as GoalListResponse,
    type GoalCreateParams as GoalCreateParams,
    type GoalUpdateParams as GoalUpdateParams,
    type GoalListParams as GoalListParams,
  };
}
