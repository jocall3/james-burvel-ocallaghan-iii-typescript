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
   * Category of the insight.
   */
  category:
    | 'spending'
    | 'saving'
    | 'investing'
    | 'budget'
    | 'security'
    | 'sustainability'
    | 'corporate_treasury'
    | 'marketplace'
    | 'compliance'
    | 'credit'
    | 'lending';

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
   * A concrete, actionable step the user can take.
   */
  actionableRecommendation?: string | null;

  /**
   * A programmatic identifier to trigger an action within the client application.
   */
  actionTrigger?: string | null;
}

export interface InsightGetSpendingTrendsResponse {
  /**
   * Overall trend in spending.
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
   * AI-driven insights and recommendations related to spending.
   */
  aiInsights?: Array<AIInsight>;

  /**
   * AI's forecast for total spending in the next month.
   */
  forecastNextMonth?: number | null;

  /**
   * Top categories with significant spending changes.
   */
  topCategoriesByChange?: Array<InsightGetSpendingTrendsResponse.TopCategoriesByChange>;
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
