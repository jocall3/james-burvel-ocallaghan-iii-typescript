// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InsightsAPI from '../transactions/insights';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Investments extends APIResource {
  /**
   * Provides an AI-driven analysis of the Environmental, Social, and Governance
   * (ESG) impact of the user's entire investment portfolio, benchmarking against
   * industry standards and suggesting more sustainable alternatives.
   *
   * @example
   * ```ts
   * const response =
   *   await client.sustainability.investments.analyzeImpact();
   * ```
   */
  analyzeImpact(options?: RequestOptions): APIPromise<InvestmentAnalyzeImpactResponse> {
    return this._client.get('/sustainability/investments/impact', options);
  }
}

export interface InvestmentAnalyzeImpactResponse {
  /**
   * AI-driven recommendations to improve the portfolio's ESG impact.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * Average ESG score of a relevant market benchmark for comparison.
   */
  benchmarkESGScore: unknown;

  /**
   * Breakdown of the portfolio's ESG score by individual factors.
   */
  breakdownByESGFactors: InvestmentAnalyzeImpactResponse.BreakdownByEsgFactors;

  /**
   * Lowest holdings in the portfolio by ESG score.
   */
  lowestESGHoldings: Array<InvestmentAnalyzeImpactResponse.LowestEsgHolding>;

  /**
   * Overall ESG score of the entire portfolio (0-10).
   */
  overallESGScore: unknown;

  /**
   * ID of the investment portfolio analyzed.
   */
  portfolioId: unknown;

  /**
   * Top holdings in the portfolio by ESG score.
   */
  topESGHoldings: Array<InvestmentAnalyzeImpactResponse.TopEsgHolding>;
}

export namespace InvestmentAnalyzeImpactResponse {
  /**
   * Breakdown of the portfolio's ESG score by individual factors.
   */
  export interface BreakdownByEsgFactors {
    environmentalScore?: unknown;

    governanceScore?: unknown;

    socialScore?: unknown;
  }

  export interface LowestEsgHolding {
    assetName?: unknown;

    assetSymbol?: unknown;

    esgScore?: unknown;
  }

  export interface TopEsgHolding {
    assetName?: unknown;

    assetSymbol?: unknown;

    esgScore?: unknown;
  }
}

export declare namespace Investments {
  export { type InvestmentAnalyzeImpactResponse as InvestmentAnalyzeImpactResponse };
}
