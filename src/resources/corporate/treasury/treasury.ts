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
   * Breakdown of liquid assets by account type (e.g., Checking, Savings, Money
   * Market).
   */
  accountTypeBreakdown: Array<TreasuryGetLiquidityPositionsResponse.AccountTypeBreakdown>;

  aiLiquidityAssessment: TreasuryGetLiquidityPositionsResponse.AILiquidityAssessment;

  /**
   * Breakdown of liquid assets by currency.
   */
  currencyBreakdown: Array<TreasuryGetLiquidityPositionsResponse.CurrencyBreakdown>;

  /**
   * Details on short-term, highly liquid investments.
   */
  shortTermInvestments: TreasuryGetLiquidityPositionsResponse.ShortTermInvestments;

  /**
   * Timestamp of the liquidity snapshot.
   */
  snapshotTime: string;

  /**
   * Total value of all liquid assets across accounts and short-term investments.
   */
  totalLiquidAssets: number;

  /**
   * AI-generated recommendations for optimizing liquidity.
   */
  aiRecommendations?: Array<InsightsAPI.AIInsight> | null;
}

export namespace TreasuryGetLiquidityPositionsResponse {
  export interface AccountTypeBreakdown {
    /**
     * Amount in this account type.
     */
    amount?: number;

    /**
     * Account type.
     */
    type?: string;
  }

  export interface AILiquidityAssessment {
    /**
     * Detailed message from AI.
     */
    message: string;

    /**
     * AI's overall assessment of liquidity.
     */
    status: 'optimal' | 'sufficient' | 'constrained' | 'critical';
  }

  export interface CurrencyBreakdown {
    /**
     * Amount in this currency.
     */
    amount?: number;

    /**
     * Currency code.
     */
    currency?: string;

    /**
     * Percentage of total liquid assets.
     */
    percentage?: number;
  }

  /**
   * Details on short-term, highly liquid investments.
   */
  export interface ShortTermInvestments {
    /**
     * Amount of investments maturing in the next 30 days.
     */
    maturingNext30Days?: number;

    /**
     * Total value of short-term investments.
     */
    totalValue?: number;

    /**
     * Average yield percentage of short-term investments.
     */
    yieldPercentage?: number | null;
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
