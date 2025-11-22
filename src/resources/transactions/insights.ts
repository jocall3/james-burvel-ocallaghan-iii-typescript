// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Insights extends APIResource {
  /**
   * Retrieves AI-generated insights into user spending trends over time, identifying
   * patterns and anomalies.
   *
   * @example
   * ```ts
   * const response =
   *   await client.transactions.insights.getSpendingTrends();
   * ```
   */
  getSpendingTrends(options?: RequestOptions): APIPromise<InsightGetSpendingTrendsResponse> {
    return this._client.get('/transactions/insights/spending-trends', options);
  }
}

/**
 * An AI-generated insight, alert, or recommendation.
 */
export interface AIInsight {
  /**
   * Unique identifier for the AI insight.
   */
  id: string;

  /**
   * Category of the insight (e.g., spending, saving, investing).
   */
  category:
    | 'spending'
    | 'saving'
    | 'investing'
    | 'budgeting'
    | 'security'
    | 'financial_goals'
    | 'sustainability'
    | 'corporate_treasury'
    | 'compliance'
    | 'other';

  /**
   * Detailed explanation of the insight.
   */
  description: string;

  /**
   * AI-assessed severity or importance of the insight.
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Timestamp when the insight was generated.
   */
  timestamp: string;

  /**
   * A concise title for the insight.
   */
  title: string;

  /**
   * Optional: A concrete action the user can take based on the insight.
   */
  actionableRecommendation?: string | null;

  /**
   * Optional: A programmatic trigger or deep link to initiate the recommended
   * action.
   */
  actionTrigger?: string | null;
}

export interface InsightGetSpendingTrendsResponse {
  /**
   * AI-driven insights and recommendations related to spending.
   */
  aiInsights: Array<AIInsight>;

  /**
   * AI-projected total spending for the next month.
   */
  forecastNextMonth: number;

  /**
   * Overall trend of spending (increasing, decreasing, stable).
   */
  overallTrend: 'increasing' | 'decreasing' | 'stable';

  /**
   * Percentage change in spending over the period.
   */
  percentageChange: number;

  /**
   * The period over which the spending trend is analyzed.
   */
  period: string;

  /**
   * Categories with the most significant changes in spending.
   */
  topCategoriesByChange: Array<InsightGetSpendingTrendsResponse.TopCategoriesByChange>;
}

export namespace InsightGetSpendingTrendsResponse {
  export interface TopCategoriesByChange {
    absoluteChange?: number;

    category?: string;

    percentageChange?: number;
  }
}

export declare namespace Insights {
  export {
    type AIInsight as AIInsight,
    type InsightGetSpendingTrendsResponse as InsightGetSpendingTrendsResponse,
  };
}
