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
   * AI's overall assessment of current liquidity.
   */
  aiLiquidityAssessment: TreasuryGetLiquidityPositionsResponse.AILiquidityAssessment;

  /**
   * AI-driven recommendations for liquidity management.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * Breakdown of liquid assets by currency.
   */
  currencyBreakdown: Array<TreasuryGetLiquidityPositionsResponse.CurrencyBreakdown>;

  /**
   * Timestamp of the liquidity snapshot.
   */
  snapshotTime: string;

  /**
   * Total value of all liquid assets (cash, short-term investments).
   */
  totalLiquidAssets: number;

  /**
   * Summary of short-term investment holdings.
   */
  shortTermInvestments?: TreasuryGetLiquidityPositionsResponse.ShortTermInvestments | null;
}

export namespace TreasuryGetLiquidityPositionsResponse {
  export interface AccountTypeBreakdown {
    amount?: number;

    type?: string;
  }

  /**
   * AI's overall assessment of current liquidity.
   */
  export interface AILiquidityAssessment {
    message?: string;

    status?: 'optimal' | 'sufficient' | 'tight' | 'critical';
  }

  export interface CurrencyBreakdown {
    amount?: number;

    currency?: string;

    percentage?: number;
  }

  /**
   * Summary of short-term investment holdings.
   */
  export interface ShortTermInvestments {
    maturingNext30Days?: number;

    totalValue?: number;
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
