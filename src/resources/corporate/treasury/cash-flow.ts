// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as InsightsAPI from '../../transactions/insights';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class CashFlow extends APIResource {
  /**
   * Retrieves an advanced AI-driven cash flow forecast for the organization,
   * projecting liquidity, identifying potential surpluses or deficits, and providing
   * recommendations for optimal treasury management.
   *
   * @example
   * ```ts
   * const response =
   *   await client.corporate.treasury.cashFlow.forecast();
   * ```
   */
  forecast(
    query: CashFlowForecastParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<CashFlowForecastResponse> {
    return this._client.get('/corporate/treasury/cash-flow/forecast', { query, ...options });
  }
}

export interface CashFlowForecastResponse {
  /**
   * AI-generated recommendations for treasury optimization.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * The primary currency of the forecast.
   */
  currency: string;

  /**
   * Unique identifier for the cash flow forecast.
   */
  forecastId: string;

  /**
   * Forecasted cash inflows.
   */
  inflowForecast: CashFlowForecastResponse.InflowForecast;

  /**
   * AI-assessed score for liquidity risk (0-100, higher is riskier).
   */
  liquidityRiskScore: number;

  /**
   * Forecasted cash outflows.
   */
  outflowForecast: CashFlowForecastResponse.OutflowForecast;

  /**
   * Overall assessment of the cash flow outlook.
   */
  overallStatus: 'positive_outlook' | 'neutral' | 'potential_deficit' | 'critical_risk';

  /**
   * The period covered by the forecast.
   */
  period: string;

  /**
   * Time-series of projected cash balances under different scenarios.
   */
  projectedBalances: Array<CashFlowForecastResponse.ProjectedBalance>;

  /**
   * Timestamp when the forecast was generated.
   */
  forecastTimestamp?: string;

  /**
   * Summary of 'what-if' scenario analysis included in the forecast.
   */
  scenarioAnalysisSummary?: string | null;
}

export namespace CashFlowForecastResponse {
  /**
   * Forecasted cash inflows.
   */
  export interface InflowForecast {
    /**
     * Breakdown of inflows by source.
     */
    bySource: Array<InflowForecast.BySource>;

    /**
     * Total projected inflows.
     */
    totalProjected: number;
  }

  export namespace InflowForecast {
    export interface BySource {
      /**
       * AI's confidence score for this inflow source.
       */
      aiConfidence?: number | null;

      /**
       * Projected amount from this source.
       */
      amount?: number;

      /**
       * Source of inflow.
       */
      source?: string;
    }
  }

  /**
   * Forecasted cash outflows.
   */
  export interface OutflowForecast {
    /**
     * Breakdown of outflows by category.
     */
    byCategory: Array<OutflowForecast.ByCategory>;

    /**
     * Total projected outflows.
     */
    totalProjected: number;
  }

  export namespace OutflowForecast {
    export interface ByCategory {
      /**
       * AI's confidence score for this outflow category.
       */
      aiConfidence?: number | null;

      /**
       * Projected amount for this category.
       */
      amount?: number;

      /**
       * Category of outflow.
       */
      category?: string;
    }
  }

  export interface ProjectedBalance {
    /**
     * Date of the projected balance.
     */
    date: string;

    /**
     * Projected cash balance on this date.
     */
    projectedCash: number;

    /**
     * The scenario for this projection.
     */
    scenario: 'most_likely' | 'best_case' | 'worst_case' | 'custom';
  }
}

export interface CashFlowForecastParams {
  /**
   * The number of days into the future for the cash flow forecast.
   */
  forecastHorizonDays?: number;

  /**
   * If true, the forecast will include best-case and worst-case scenarios.
   */
  includeScenarioAnalysis?: boolean;
}

export declare namespace CashFlow {
  export {
    type CashFlowForecastResponse as CashFlowForecastResponse,
    type CashFlowForecastParams as CashFlowForecastParams,
  };
}
