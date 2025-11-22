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
   * The current amount accumulated towards the goal.
   */
  currentAmount: number;

  /**
   * Timestamp when the goal's status or details were last updated.
   */
  lastUpdated: string;

  /**
   * Name of the financial goal.
   */
  name: string;

  /**
   * Current progress towards the goal as a percentage.
   */
  progressPercentage: number;

  /**
   * Risk tolerance associated with investments for this goal.
   */
  riskTolerance: 'conservative' | 'balanced' | 'medium' | 'aggressive' | 'speculative';

  /**
   * Current status of the goal's progress.
   */
  status: 'on_track' | 'behind_schedule' | 'ahead_of_schedule' | 'completed' | 'paused';

  /**
   * The target amount to save or achieve for this goal.
   */
  targetAmount: number;

  /**
   * The target date by which the goal should be achieved.
   */
  targetDate: string;

  /**
   * Type of financial goal.
   */
  type: 'retirement' | 'home_purchase' | 'education' | 'large_purchase' | 'debt_reduction' | 'custom';

  /**
   * AI-generated strategic plan to achieve the goal.
   */
  aiStrategicPlan?: FinancialGoal.AIStrategicPlan | null;

  /**
   * List of account IDs contributing to this goal.
   */
  contributingAccounts?: Array<string> | null;

  /**
   * AI's calculated monthly contribution needed to reach the goal.
   */
  monthlyContributionNeeded?: number | null;
}

export namespace FinancialGoal {
  /**
   * AI-generated strategic plan to achieve the goal.
   */
  export interface AIStrategicPlan {
    /**
     * Detailed, actionable steps for achieving the goal.
     */
    steps: Array<AIStrategicPlan.Step>;

    /**
     * Summary of the strategic plan.
     */
    summary: string;

    /**
     * Title of the strategic plan.
     */
    title: string;

    /**
     * Indicates if the plan was optimized by AI.
     */
    aiOptimized?: boolean;

    /**
     * Timestamp when this plan was last generated or updated.
     */
    lastGenerated?: string | null;
  }

  export namespace AIStrategicPlan {
    export interface Step {
      /**
       * Detailed description of the action.
       */
      description: string;

      /**
       * Current status of the step.
       */
      status: 'pending' | 'in_progress' | 'completed' | 'deferred';

      /**
       * Suggested timeline for completion (e.g., 'Immediately', 'Quarterly').
       */
      timeline: string;

      /**
       * Title of the step.
       */
      title: string;

      /**
       * Optional: ID of a related action (e.g., an automated transfer setup).
       */
      associatedActionId?: string | null;
    }
  }
}

export type GoalListResponse = Array<FinancialGoal>;

export interface GoalCreateParams {
  /**
   * Name of the new financial goal.
   */
  name: string;

  /**
   * The target amount to save or achieve.
   */
  targetAmount: number;

  /**
   * The target date for the goal.
   */
  targetDate: string;

  /**
   * Type of financial goal.
   */
  type: 'retirement' | 'home_purchase' | 'education' | 'large_purchase' | 'debt_reduction' | 'custom';

  /**
   * If true, AI will generate a strategic plan to achieve the goal.
   */
  generateAIPlan?: boolean;

  /**
   * Optional: An initial amount contributed to the goal.
   */
  initialContribution?: number;

  /**
   * Optional: The ID of a primary account to link for contributions.
   */
  linkedAccountId?: string | null;

  /**
   * Risk tolerance for investments related to this goal.
   */
  riskTolerance?: 'conservative' | 'balanced' | 'medium' | 'aggressive' | 'speculative';
}

export interface GoalUpdateParams {
  /**
   * Updated current amount accumulated towards the goal.
   */
  currentAmount?: number;

  /**
   * Updated name of the financial goal.
   */
  name?: string;

  /**
   * If true, the AI will regenerate the strategic plan based on updated parameters.
   */
  regenerateAIPlan?: boolean;

  /**
   * Updated risk tolerance for this goal.
   */
  riskTolerance?: 'conservative' | 'balanced' | 'medium' | 'aggressive' | 'speculative';

  /**
   * Updated status of the goal's progress.
   */
  status?: 'on_track' | 'behind_schedule' | 'ahead_of_schedule' | 'completed' | 'paused';

  /**
   * Updated target amount for the goal.
   */
  targetAmount?: number;

  /**
   * Updated target date for the goal.
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
