// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Products extends APIResource {
  /**
   * Retrieves a personalized, AI-curated list of products and services from the
   * Plato AI marketplace, tailored to the user's financial profile, goals, and
   * spending patterns. Includes options for filtering and advanced search.
   */
  list(
    query: ProductListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ProductListResponse> {
    return this._client.get('/marketplace/products', { query, ...options });
  }
}

export interface ProductListResponse {
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

  data?: Array<ProductListResponse.Data>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export namespace ProductListResponse {
  export interface Data {
    /**
     * Unique identifier for the marketplace product.
     */
    id: string;

    /**
     * AI's score for how well this product is personalized to the user (0-1).
     */
    aiPersonalizationScore: number;

    /**
     * Category of the product/service.
     */
    category:
      | 'loans'
      | 'insurance'
      | 'credit_cards'
      | 'investments'
      | 'budgeting_tools'
      | 'smart_home'
      | 'travel'
      | 'education'
      | 'health';

    /**
     * Detailed description of the product/service.
     */
    description: string;

    /**
     * URL to an image representing the product.
     */
    imageUrl: string | null;

    /**
     * Name of the product/service.
     */
    name: string;

    /**
     * Pricing information (can be a range or fixed text).
     */
    price: string;

    /**
     * Provider or vendor of the product/service.
     */
    provider: string;

    /**
     * Average user rating for the product (0-5).
     */
    rating: number;

    /**
     * AI-generated explanation for recommending this product.
     */
    aiRecommendationReason?: string | null;

    /**
     * Details of any special offers associated with the product.
     */
    offerDetails?: Data.OfferDetails | null;

    /**
     * Direct URL to the product on the provider's website.
     */
    productUrl?: string | null;
  }

  export namespace Data {
    /**
     * Details of any special offers associated with the product.
     */
    export interface OfferDetails {
      /**
       * Optional redemption code.
       */
      code?: string | null;

      type?: 'discount' | 'special_rate' | 'free_trial';

      value?: string;
    }
  }
}

export interface ProductListParams {
  /**
   * Filter by AI personalization level (e.g., low, medium, high). 'High' means
   * highly relevant to user's specific needs.
   */
  aiPersonalizationLevel?: 'low' | 'medium' | 'high';

  /**
   * Filter products by category (e.g., loans, insurance, credit_cards, investments).
   */
  category?:
    | 'loans'
    | 'insurance'
    | 'credit_cards'
    | 'investments'
    | 'budgeting_tools'
    | 'smart_home'
    | 'travel'
    | 'education';

  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Minimum user rating for products (0-5).
   */
  minRating?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace Products {
  export { type ProductListResponse as ProductListResponse, type ProductListParams as ProductListParams };
}
