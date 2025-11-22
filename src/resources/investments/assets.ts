// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Assets extends APIResource {
  /**
   * Searches for available investment assets (stocks, ETFs, mutual funds) and
   * returns their ESG impact scores.
   *
   * @example
   * ```ts
   * const response = await client.investments.assets.search({
   *   query: 'Tesla',
   * });
   * ```
   */
  search(query: AssetSearchParams, options?: RequestOptions): APIPromise<AssetSearchResponse> {
    return this._client.get('/investments/assets/search', { query, ...options });
  }
}

export interface AssetSearchResponse {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: number;

  /**
   * The number of items skipped before the current page.
   */
  offset: number;

  /**
   * The total number of items available across all pages.
   */
  total: number;

  data?: Array<AssetSearchResponse.Data>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export namespace AssetSearchResponse {
  export interface Data {
    /**
     * Full name of the investment asset.
     */
    assetName: string;

    /**
     * Symbol of the investment asset.
     */
    assetSymbol: string;

    /**
     * Type of the investment asset.
     */
    assetType: 'stock' | 'etf' | 'mutual_fund' | 'bond';

    /**
     * Currency of the asset's price.
     */
    currency: string;

    /**
     * Current market price of the asset.
     */
    currentPrice: number;

    /**
     * Overall ESG score (0-10), higher is better.
     */
    overallESGScore: number;

    /**
     * AI-generated insight summarizing the ESG profile.
     */
    aiESGInsight?: string | null;

    /**
     * Environmental component of the ESG score.
     */
    environmentalScore?: number | null;

    /**
     * List of any significant ESG-related controversies associated with the asset.
     */
    esgControversies?: Array<string> | null;

    /**
     * Provider of the ESG rating (e.g., MSCI, Sustainalytics).
     */
    esgRatingProvider?: string | null;

    /**
     * Governance component of the ESG score.
     */
    governanceScore?: number | null;

    /**
     * Social component of the ESG score.
     */
    socialScore?: number | null;
  }
}

export interface AssetSearchParams {
  /**
   * Search query for asset name or symbol.
   */
  query: string;

  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Minimum desired ESG score (0-10).
   */
  minESGScore?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace Assets {
  export { type AssetSearchResponse as AssetSearchResponse, type AssetSearchParams as AssetSearchParams };
}
