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

export type AssetSearchResponse = Array<AssetSearchResponse.AssetSearchResponseItem>;

export namespace AssetSearchResponse {
  export interface AssetSearchResponseItem {
    /**
     * Full name of the investment asset.
     */
    assetName: string;

    /**
     * Ticker symbol of the investment asset.
     */
    assetSymbol: string;

    /**
     * Type of investment asset.
     */
    assetType: 'stock' | 'etf' | 'mutual_fund' | 'bond' | 'crypto';

    /**
     * Currency of the asset.
     */
    currency: string;

    /**
     * Current market price of the asset.
     */
    currentPrice: number;

    /**
     * Overall ESG score (0-10) for the asset.
     */
    overallESGScore: number;

    /**
     * AI-generated insight into the asset's ESG profile.
     */
    aiESGInsight?: string | null;

    /**
     * Environmental component of the ESG score.
     */
    environmentalScore?: number | null;

    /**
     * List of significant ESG controversies associated with the asset.
     */
    esgControversies?: Array<string> | null;

    /**
     * The provider of the ESG rating data.
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
   * Minimum desired ESG score (0-10).
   */
  minESGScore?: number;
}

export declare namespace Assets {
  export { type AssetSearchResponse as AssetSearchResponse, type AssetSearchParams as AssetSearchParams };
}
