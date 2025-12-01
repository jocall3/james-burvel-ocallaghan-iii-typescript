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
  limit: unknown;

  /**
   * The number of items skipped before the current page.
   */
  offset: unknown;

  /**
   * The total number of items available across all pages.
   */
  total: unknown;

  data?: Array<AssetSearchResponse.Data>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export namespace AssetSearchResponse {
  export interface Data {
    /**
     * Full name of the investment asset.
     */
    assetName: unknown;

    /**
     * Symbol of the investment asset.
     */
    assetSymbol: unknown;

    /**
     * Type of the investment asset.
     */
    assetType: 'stock' | 'etf' | 'mutual_fund' | 'bond';

    /**
     * Currency of the asset's price.
     */
    currency: unknown;

    /**
     * Current market price of the asset.
     */
    currentPrice: unknown;

    /**
     * Overall ESG score (0-10), higher is better.
     */
    overallESGScore: unknown;

    /**
     * AI-generated insight summarizing the ESG profile.
     */
    aiESGInsight?: unknown;

    /**
     * Environmental component of the ESG score.
     */
    environmentalScore?: unknown;

    /**
     * List of any significant ESG-related controversies associated with the asset.
     */
    esgControversies?: Array<unknown> | null;

    /**
     * Provider of the ESG rating (e.g., MSCI, Sustainalytics).
     */
    esgRatingProvider?: unknown;

    /**
     * Governance component of the ESG score.
     */
    governanceScore?: unknown;

    /**
     * Social component of the ESG score.
     */
    socialScore?: unknown;
  }
}

export interface AssetSearchParams {
  /**
   * Search query for asset name or symbol.
   */
  query: unknown;

  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Minimum desired ESG score (0-10).
   */
  minESGScore?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export declare namespace Assets {
  export { type AssetSearchResponse as AssetSearchResponse, type AssetSearchParams as AssetSearchParams };
}
