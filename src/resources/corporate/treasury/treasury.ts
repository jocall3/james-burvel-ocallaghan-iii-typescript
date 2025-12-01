// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as InsightsAPI from '../../transactions/insights';
import * as CashFlowAPI from './cash-flow';
import { CashFlow, CashFlowForecastParams, CashFlowForecastResponse } from './cash-flow';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Treasury extends APIResource {
  cashFlow: CashFlowAPI.CashFlow = new CashFlowAPI.CashFlow(this._client);

  /**
   * Provides a real-time overview of the organization's liquidity across all
   * accounts, currencies, and short-term investments.
   *
   * @example
   * ```ts
   * const response =
   *   await client.corporate.treasury.getLiquidityPositions();
   * ```
   */
  getLiquidityPositions(options?: RequestOptions): APIPromise<TreasuryGetLiquidityPositionsResponse> {
    return this._client.get('/corporate/treasury/liquidity-positions', options);
  }
}

export interface TreasuryGetLiquidityPositionsResponse {
  /**
   * Breakdown of liquid assets by account type.
   */
  accountTypeBreakdown: Array<TreasuryGetLiquidityPositionsResponse.AccountTypeBreakdown>;

  /**
   * AI's overall assessment of liquidity.
   */
  aiLiquidityAssessment: TreasuryGetLiquidityPositionsResponse.AILiquidityAssessment;

  /**
   * AI-generated recommendations for liquidity management.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * Breakdown of liquid assets by currency.
   */
  currencyBreakdown: Array<TreasuryGetLiquidityPositionsResponse.CurrencyBreakdown>;

  /**
   * Details on short-term investments contributing to liquidity.
   */
  shortTermInvestments: TreasuryGetLiquidityPositionsResponse.ShortTermInvestments;

  /**
   * Timestamp of the liquidity snapshot.
   */
  snapshotTime: unknown;

  /**
   * Total value of all liquid assets across the organization.
   */
  totalLiquidAssets: unknown;
}

export namespace TreasuryGetLiquidityPositionsResponse {
  export interface AccountTypeBreakdown {
    amount?: unknown;

    type?: unknown;
  }

  /**
   * AI's overall assessment of liquidity.
   */
  export interface AILiquidityAssessment {
    message?: unknown;

    status?: 'optimal' | 'sufficient' | 'tight' | 'critical';
  }

  export interface CurrencyBreakdown {
    amount?: unknown;

    currency?: unknown;

    percentage?: unknown;
  }

  /**
   * Details on short-term investments contributing to liquidity.
   */
  export interface ShortTermInvestments {
    maturingNext30Days?: unknown;

    totalValue?: unknown;
  }
}

Treasury.CashFlow = CashFlow;

export declare namespace Treasury {
  export { type TreasuryGetLiquidityPositionsResponse as TreasuryGetLiquidityPositionsResponse };

  export {
    CashFlow as CashFlow,
    type CashFlowForecastResponse as CashFlowForecastResponse,
    type CashFlowForecastParams as CashFlowForecastParams,
  };
}
