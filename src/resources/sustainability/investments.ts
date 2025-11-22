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
   * AI-generated recommendations to improve the portfolio's ESG impact.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * ESG score of a relevant market benchmark for comparison.
   */
  benchmarkESGScore: number;

  /**
   * Breakdown of the portfolio's ESG score by Environmental, Social, and Governance
   * factors.
   */
  breakdownByESGFactors: InvestmentAnalyzeImpactResponse.BreakdownByEsgFactors;

  /**
   * Top 3 holdings with the lowest ESG scores (potential areas for improvement).
   */
  lowestESGHoldings: Array<InvestmentAnalyzeImpactResponse.LowestEsgHolding>;

  /**
   * Overall ESG score of the entire portfolio.
   */
  overallESGScore: number;

  /**
   * The ID of the investment portfolio analyzed.
   */
  portfolioId: string;

  /**
   * Top 3 holdings with the highest ESG scores.
   */
  topESGHoldings: Array<InvestmentAnalyzeImpactResponse.TopEsgHolding>;

  /**
   * Timestamp when the ESG analysis was last performed.
   */
  lastAnalyzed?: string;
}

export namespace InvestmentAnalyzeImpactResponse {
  /**
   * Breakdown of the portfolio's ESG score by Environmental, Social, and Governance
   * factors.
   */
  export interface BreakdownByEsgFactors {
    environmentalScore?: number;

    governanceScore?: number;

    socialScore?: number;
  }

  export interface LowestEsgHolding {
    assetName?: string;

    assetSymbol?: string;

    esgScore?: number;
  }

  export interface TopEsgHolding {
    assetName?: string;

    assetSymbol?: string;

    esgScore?: number;
  }
}

export declare namespace Investments {
  export { type InvestmentAnalyzeImpactResponse as InvestmentAnalyzeImpactResponse };
}
