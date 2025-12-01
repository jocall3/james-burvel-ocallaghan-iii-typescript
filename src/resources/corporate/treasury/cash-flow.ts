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
   * The currency of the forecast.
   */
  currency: unknown;

  /**
   * Unique identifier for the cash flow forecast report.
   */
  forecastId: unknown;

  /**
   * Forecast of cash inflows by source.
   */
  inflowForecast: CashFlowForecastResponse.InflowForecast;

  /**
   * AI-assessed risk score for liquidity (0-100, lower is better).
   */
  liquidityRiskScore: unknown;

  /**
   * Forecast of cash outflows by category.
   */
  outflowForecast: CashFlowForecastResponse.OutflowForecast;

  /**
   * Overall assessment of the projected cash flow.
   */
  overallStatus: 'positive_outlook' | 'negative_outlook' | 'stable' | 'uncertain';

  /**
   * The period covered by the forecast.
   */
  period: unknown;

  /**
   * Projected cash balances at key dates, potentially across different scenarios.
   */
  projectedBalances: Array<CashFlowForecastResponse.ProjectedBalance>;
}

export namespace CashFlowForecastResponse {
  /**
   * Forecast of cash inflows by source.
   */
  export interface InflowForecast {
    bySource?: Array<InflowForecast.BySource>;

    totalProjected?: unknown;
  }

  export namespace InflowForecast {
    export interface BySource {
      amount?: unknown;

      source?: unknown;
    }
  }

  /**
   * Forecast of cash outflows by category.
   */
  export interface OutflowForecast {
    byCategory?: Array<OutflowForecast.ByCategory>;

    totalProjected?: unknown;
  }

  export namespace OutflowForecast {
    export interface ByCategory {
      amount?: unknown;

      category?: unknown;
    }
  }

  export interface ProjectedBalance {
    date?: unknown;

    projectedCash?: unknown;

    scenario?: 'most_likely' | 'best_case' | 'worst_case';
  }
}

export interface CashFlowForecastParams {
  /**
   * The number of days into the future for which to generate the cash flow forecast
   * (e.g., 30, 90, 180).
   */
  forecastHorizonDays?: unknown;

  /**
   * If true, the forecast will include best-case and worst-case scenario analysis
   * alongside the most likely projection.
   */
  includeScenarioAnalysis?: unknown;
}

export declare namespace CashFlow {
  export {
    type CashFlowForecastResponse as CashFlowForecastResponse,
    type CashFlowForecastParams as CashFlowForecastParams,
  };
}
