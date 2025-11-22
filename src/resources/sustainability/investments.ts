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
   * AI-driven recommendations to improve the ESG profile of the portfolio.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * Average ESG score for a comparable market benchmark.
   */
  benchmarkESGScore: number;

  /**
   * Breakdown of the portfolio's ESG score into environmental, social, and
   * governance components.
   */
  breakdownByESGFactors: InvestmentAnalyzeImpactResponse.BreakdownByEsgFactors;

  /**
   * List of lowest-scoring holdings by their individual ESG score.
   */
  lowestESGHoldings: Array<InvestmentAnalyzeImpactResponse.LowestEsgHolding>;

  /**
   * Overall aggregated ESG score for the entire portfolio.
   */
  overallESGScore: number;

  /**
   * The ID of the investment portfolio analyzed.
   */
  portfolioId: string;

  /**
   * List of top holdings by their individual ESG score.
   */
  topESGHoldings: Array<InvestmentAnalyzeImpactResponse.TopEsgHolding>;
}

export namespace InvestmentAnalyzeImpactResponse {
  /**
   * Breakdown of the portfolio's ESG score into environmental, social, and
   * governance components.
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
