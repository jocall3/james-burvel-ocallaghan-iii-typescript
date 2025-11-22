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
   * AI-driven actionable recommendations for treasury optimization.
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
   * Forecasted cash inflows categorized by source.
   */
  inflowForecast: CashFlowForecastResponse.InflowForecast;

  /**
   * AI-calculated score (0-100) indicating the risk of liquidity shortfalls.
   */
  liquidityRiskScore: number;

  /**
   * Forecasted cash outflows categorized by spending category.
   */
  outflowForecast: CashFlowForecastResponse.OutflowForecast;

  /**
   * Overall assessment of the corporate cash flow outlook.
   */
  overallStatus: 'positive_outlook' | 'neutral' | 'negative_outlook' | 'critical_risk';

  /**
   * The forecast period (e.g., 'Next 30 Days', 'Q3 2024').
   */
  period: string;

  /**
   * Projected cash balances at key dates, potentially across different scenarios.
   */
  projectedBalances: Array<CashFlowForecastResponse.ProjectedBalance>;
}

export namespace CashFlowForecastResponse {
  /**
   * Forecasted cash inflows categorized by source.
   */
  export interface InflowForecast {
    bySource?: Array<InflowForecast.BySource>;

    totalProjected?: number;
  }

  export namespace InflowForecast {
    export interface BySource {
      amount?: number;

      source?: string;
    }
  }

  /**
   * Forecasted cash outflows categorized by spending category.
   */
  export interface OutflowForecast {
    byCategory?: Array<OutflowForecast.ByCategory>;

    totalProjected?: number;
  }

  export namespace OutflowForecast {
    export interface ByCategory {
      amount?: number;

      category?: string;
    }
  }

  export interface ProjectedBalance {
    date?: string;

    projectedCash?: number;

    scenario?: 'most_likely' | 'best_case' | 'worst_case';
  }
}

export interface CashFlowForecastParams {
  /**
   * Number of days into the future for the cash flow forecast.
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
