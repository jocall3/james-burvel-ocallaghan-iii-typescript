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
     * Full name of the asset.
     */
    assetName: string;

    /**
     * Ticker symbol or identifier of the asset.
     */
    assetSymbol: string;

    /**
     * Type of investment asset.
     */
    assetType: 'stock' | 'etf' | 'mutual_fund' | 'bond';

    /**
     * Currency of the asset.
     */
    currency: string;

    /**
     * Current market price of the asset.
     */
    currentPrice: number;

    /**
     * Overall ESG score (typically 0-10, higher is better).
     */
    overallESGScore: number;

    /**
     * AI-generated commentary on the asset's ESG profile.
     */
    aiESGInsight?: string | null;

    /**
     * Specific environmental component score.
     */
    environmentalScore?: number | null;

    /**
     * List of notable ESG controversies associated with the asset.
     */
    esgControversies?: Array<string> | null;

    /**
     * The provider of the ESG rating (e.g., MSCI, Sustainalytics).
     */
    esgRatingProvider?: string | null;

    /**
     * Specific governance component score.
     */
    governanceScore?: number | null;

    /**
     * Specific social component score.
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
