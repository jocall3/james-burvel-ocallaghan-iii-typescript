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
   * Average ESG score of a relevant benchmark (e.g., S&P 500).
   */
  benchmarkESGScore: number | null;

  /**
   * Breakdown of the ESG score into Environmental, Social, and Governance
   * components.
   */
  breakdownByESGFactors: InvestmentAnalyzeImpactResponse.BreakdownByEsgFactors;

  /**
   * Overall ESG score of the portfolio (0-10).
   */
  overallESGScore: number;

  /**
   * The ID of the investment portfolio analyzed.
   */
  portfolioId: string;

  /**
   * AI-generated recommendations to improve the portfolio's ESG impact.
   */
  aiRecommendations?: Array<InsightsAPI.AIInsight>;

  /**
   * AI-generated summary of the ESG analysis.
   */
  aiSummary?: string | null;

  /**
   * List of lowest performing holdings in terms of ESG score.
   */
  lowestESGHoldings?: Array<InvestmentAnalyzeImpactResponse.LowestEsgHolding> | null;

  /**
   * List of top performing holdings in terms of ESG score.
   */
  topESGHoldings?: Array<InvestmentAnalyzeImpactResponse.TopEsgHolding> | null;
}

export namespace InvestmentAnalyzeImpactResponse {
  /**
   * Breakdown of the ESG score into Environmental, Social, and Governance
   * components.
   */
  export interface BreakdownByEsgFactors {
    /**
     * Environmental component score.
     */
    environmentalScore?: number;

    /**
     * Governance component score.
     */
    governanceScore?: number;

    /**
     * Social component score.
     */
    socialScore?: number;
  }

  export interface LowestEsgHolding {
    /**
     * Name of the asset.
     */
    assetName?: string;

    /**
     * Ticker symbol of the asset.
     */
    assetSymbol?: string;

    /**
     * ESG score of the asset.
     */
    esgScore?: number;
  }

  export interface TopEsgHolding {
    /**
     * Name of the asset.
     */
    assetName?: string;

    /**
     * Ticker symbol of the asset.
     */
    assetSymbol?: string;

    /**
     * ESG score of the asset.
     */
    esgScore?: number;
  }
}

export declare namespace Investments {
  export { type InvestmentAnalyzeImpactResponse as InvestmentAnalyzeImpactResponse };
}
