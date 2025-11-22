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

export interface AIInsight {
  /**
   * Unique identifier for the insight.
   */
  id: string;

  /**
   * Category of the insight (e.g., spending, saving, investing).
   */
  category:
    | 'spending'
    | 'saving'
    | 'investing'
    | 'budget'
    | 'security'
    | 'sustainability'
    | 'financial_health'
    | 'corporate';

  /**
   * Detailed description of the insight.
   */
  description: string;

  /**
   * The severity or urgency of the insight.
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
   * A concrete, actionable step the user can take based on the insight.
   */
  actionableRecommendation?: string | null;
}

export interface InsightGetSpendingTrendsResponse {
  /**
   * AI-generated insights and alerts related to spending patterns.
   */
  aiInsights: Array<AIInsight>;

  /**
   * Overall spending trend for the period.
   */
  overallTrend: 'increasing' | 'decreasing' | 'stable';

  /**
   * Percentage change in overall spending compared to the previous equivalent
   * period.
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

  /**
   * AI's projected total spending for the upcoming month.
   */
  forecastNextMonth?: number | null;
}

export namespace InsightGetSpendingTrendsResponse {
  export interface TopCategoriesByChange {
    /**
     * Absolute change in spending for this category.
     */
    absoluteChange?: number;

    /**
     * Category name.
     */
    category?: string;

    /**
     * Percentage change in spending for this category.
     */
    percentageChange?: number;
  }
}

export declare namespace Insights {
  export {
    type AIInsight as AIInsight,
    type InsightGetSpendingTrendsResponse as InsightGetSpendingTrendsResponse,
  };
}
