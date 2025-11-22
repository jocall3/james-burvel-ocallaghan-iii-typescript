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
   * Unique identifier for the AI insight.
   */
  id: string;

  /**
   * A concrete, actionable recommendation based on the insight.
   */
  actionableRecommendation: string | null;

  /**
   * Category of the insight (e.g., spending, saving, security).
   */
  category:
    | 'spending'
    | 'saving'
    | 'investing'
    | 'budget'
    | 'compliance'
    | 'security'
    | 'sustainability'
    | 'corporate_treasury'
    | 'marketplace'
    | 'technology';

  /**
   * Detailed description of the insight.
   */
  description: string;

  /**
   * Severity level of the insight.
   */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Timestamp when the insight was generated.
   */
  timestamp: string;

  /**
   * Concise title of the insight.
   */
  title: string;

  /**
   * A programmatic identifier to trigger a specific action or navigate to a relevant
   * feature.
   */
  actionTrigger?: string | null;
}

export interface InsightGetSpendingTrendsResponse {
  /**
   * AI-generated insights and actionable recommendations related to spending.
   */
  aiInsights: Array<AIInsight>;

  /**
   * Overall trend of spending.
   */
  overallTrend: 'increasing' | 'decreasing' | 'stable';

  /**
   * Percentage change in spending for the period (positive for increase, negative
   * for decrease).
   */
  percentageChange: number;

  /**
   * The period over which the spending trend is analyzed.
   */
  period: string;

  /**
   * Categories with the most significant spending changes.
   */
  topCategoriesByChange: Array<InsightGetSpendingTrendsResponse.TopCategoriesByChange>;

  /**
   * AI's forecasted total spending for the next month.
   */
  forecastNextMonth?: number | null;
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
