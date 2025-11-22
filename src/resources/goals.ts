// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
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
   * Retrieves detailed information for a specific financial goal, including its AI
   * strategic plan and progress tracking.
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
   * Updates parameters for an existing financial goal.
   *
   * @example
   * ```ts
   * const financialGoal = await client.goals.update(
   *   'goal_retirement_2050',
   *   {
   *     name: 'Early Retirement by 2045',
   *     regenerateAIPlan: true,
   *     riskTolerance: 'high',
   *     status: 'ahead_of_schedule',
   *     targetAmount: 1200000,
   *     targetDate: '2045-12-31',
   *   },
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
   * const financialGoals = await client.goals.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<GoalListResponse> {
    return this._client.get('/goals', options);
  }

  /**
   * Deletes a specific financial goal.
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
   * Current amount accumulated towards the goal.
   */
  currentAmount: number;

  /**
   * Timestamp when the goal status or associated plan was last updated.
   */
  lastUpdated: string;

  /**
   * Name of the financial goal.
   */
  name: string;

  /**
   * Percentage of the target amount achieved.
   */
  progressPercentage: number;

  /**
   * Risk tolerance associated with investments for this goal.
   */
  riskTolerance: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';

  /**
   * Current status of the goal's progress.
   */
  status: 'on_track' | 'ahead_of_schedule' | 'behind_schedule' | 'completed' | 'cancelled';

  /**
   * The target amount for the goal.
   */
  targetAmount: number;

  /**
   * Target completion date for the goal.
   */
  targetDate: string;

  /**
   * Type of financial goal.
   */
  type:
    | 'retirement'
    | 'home_purchase'
    | 'education'
    | 'large_purchase'
    | 'debt_reduction'
    | 'wealth_creation'
    | 'other';

  /**
   * AI-generated strategic plan with actionable steps to achieve the goal.
   */
  aiStrategicPlan?: FinancialGoal.AIStrategicPlan | null;

  /**
   * List of account IDs contributing to this goal.
   */
  contributingAccounts?: Array<string> | null;
}

export namespace FinancialGoal {
  /**
   * AI-generated strategic plan with actionable steps to achieve the goal.
   */
  export interface AIStrategicPlan {
    steps?: Array<AIStrategicPlan.Step>;

    summary?: string;

    title?: string;
  }

  export namespace AIStrategicPlan {
    export interface Step {
      description?: string;

      /**
       * ID of a related action (e.g., auto-transfer setup).
       */
      linkedActionId?: string | null;

      priority?: 'low' | 'medium' | 'high';

      status?: 'pending' | 'in_progress' | 'completed';

      targetAmount?: number | null;

      timeline?: string;

      title?: string;
    }
  }
}

export type GoalListResponse = Array<FinancialGoal>;

export interface GoalCreateParams {
  /**
   * Name for the new financial goal.
   */
  name: string;

  /**
   * The target amount for the goal.
   */
  targetAmount: number;

  /**
   * Target completion date for the goal.
   */
  targetDate: string;

  /**
   * Type of financial goal.
   */
  type:
    | 'retirement'
    | 'home_purchase'
    | 'education'
    | 'large_purchase'
    | 'debt_reduction'
    | 'wealth_creation'
    | 'other';

  /**
   * If true, AI will automatically generate a strategic plan for this goal.
   */
  generateAIPlan?: boolean;

  /**
   * Optional: Initial amount to contribute to the goal.
   */
  initialContribution?: number;

  /**
   * Optional: The account ID from which the initial contribution should be made.
   */
  linkedAccountId?: string | null;

  /**
   * Risk tolerance for the investments associated with this goal.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';
}

export interface GoalUpdateParams {
  /**
   * Updated name of the financial goal.
   */
  name?: string;

  /**
   * If true, the AI will regenerate the strategic plan based on updated parameters.
   */
  regenerateAIPlan?: boolean;

  /**
   * Updated risk tolerance for the investments associated with this goal.
   */
  riskTolerance?: 'conservative' | 'moderate' | 'balanced' | 'aggressive' | 'very_aggressive';

  /**
   * Updated status of the goal's progress.
   */
  status?: 'on_track' | 'ahead_of_schedule' | 'behind_schedule' | 'completed' | 'cancelled';

  /**
   * Updated target amount for the goal.
   */
  targetAmount?: number;

  /**
   * Updated target completion date for the goal.
   */
  targetDate?: string;
}

export declare namespace Goals {
  export {
    type FinancialGoal as FinancialGoal,
    type GoalListResponse as GoalListResponse,
    type GoalCreateParams as GoalCreateParams,
    type GoalUpdateParams as GoalUpdateParams,
  };
}
