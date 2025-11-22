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
   * AI-generated actionable recommendations for treasury optimization.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * The primary currency of the forecast (ISO 4217 code).
   */
  currency: string;

  /**
   * Unique identifier for the cash flow forecast.
   */
  forecastId: string;

  /**
   * Detailed forecast of expected cash inflows.
   */
  inflowForecast: CashFlowForecastResponse.InflowForecast;

  /**
   * AI-assessed risk score (0-100) for liquidity issues during the forecast period.
   */
  liquidityRiskScore: number;

  /**
   * Detailed forecast of expected cash outflows.
   */
  outflowForecast: CashFlowForecastResponse.OutflowForecast;

  /**
   * Overall assessment of the forecasted cash flow.
   */
  overallStatus: 'positive_outlook' | 'stable' | 'potential_deficit' | 'critical_deficit';

  /**
   * The time period covered by the forecast.
   */
  period: string;

  /**
   * Projected cash balances at various points in the forecast horizon, possibly
   * across scenarios.
   */
  projectedBalances: Array<CashFlowForecastResponse.ProjectedBalance>;

  /**
   * Timestamp when the forecast was generated.
   */
  generatedOn?: string;
}

export namespace CashFlowForecastResponse {
  /**
   * Detailed forecast of expected cash inflows.
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
   * Detailed forecast of expected cash outflows.
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

    scenario?: 'most_likely' | 'worst_case' | 'best_case';
  }
}

export interface CashFlowForecastParams {
  /**
   * The number of days into the future for the cash flow forecast.
   */
  forecastHorizonDays?: number;

  /**
   * If true, the forecast will include best-case and worst-case scenarios in
   * addition to most likely.
   */
  includeScenarioAnalysis?: boolean;
}

export declare namespace CashFlow {
  export {
    type CashFlowForecastResponse as CashFlowForecastResponse,
    type CashFlowForecastParams as CashFlowForecastParams,
  };
}
