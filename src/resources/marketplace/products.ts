// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InsightsAPI from '../transactions/insights';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Products extends APIResource {
  /**
   * Retrieves a personalized, AI-curated list of products and services from the
   * Plato AI marketplace, tailored to the user's financial profile, goals, and
   * spending patterns. Includes options for filtering and advanced search.
   *
   * @example
   * ```ts
   * const products = await client.marketplace.products.list();
   * ```
   */
  list(
    query: ProductListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ProductListResponse> {
    return this._client.get('/marketplace/products', { query, ...options });
  }

  /**
   * Redeems a personalized, exclusive offer from the Plato AI marketplace, often
   * resulting in a discount, special rate, or credit to the user's account.
   *
   * @example
   * ```ts
   * const response =
   *   await client.marketplace.products.redeemMarketplaceOffer(
   *     'offer_home_ins_promo_1',
   *     { paymentAccountId: 'acc_chase_checking_4567' },
   *   );
   * ```
   */
  redeemMarketplaceOffer(
    offerID: string,
    body: ProductRedeemMarketplaceOfferParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ProductRedeemMarketplaceOfferResponse> {
    return this._client.post(path`/marketplace/offers/${offerID}/redeem`, { body, ...options });
  }

  /**
   * Uses the Quantum Oracle to simulate the long-term financial impact of purchasing
   * or subscribing to a specific marketplace product, such as a loan, investment, or
   * insurance policy, on the user's overall financial health and goals.
   *
   * @example
   * ```ts
   * const response =
   *   await client.marketplace.products.simulatePurchase(
   *     'prod_home_insurance_quantum',
   *     {
   *       simulationParameters: {
   *         loanAmount: 20000,
   *         repaymentTermMonths: 48,
   *       },
   *     },
   *   );
   * ```
   */
  simulatePurchase(
    productID: string,
    body: ProductSimulatePurchaseParams,
    options?: RequestOptions,
  ): APIPromise<ProductSimulatePurchaseResponse> {
    return this._client.post(path`/marketplace/products/${productID}/impact-simulate`, { body, ...options });
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

export interface ProductRedeemMarketplaceOfferResponse {
  /**
   * If applicable, the ID of any associated transaction (e.g., a credit or initial
   * payment).
   */
  associatedTransactionId?: string | null;

  /**
   * A descriptive message about the redemption.
   */
  message?: string;

  /**
   * The ID of the redeemed offer.
   */
  offerId?: string;

  redemptionDate?: string;

  /**
   * Unique ID for this redemption.
   */
  redemptionId?: string;

  /**
   * Status of the redemption.
   */
  status?: 'success' | 'pending' | 'failed';
}

export interface ProductSimulatePurchaseResponse {
  /**
   * Key financial impacts identified by the AI (e.g., on cash flow, debt-to-income).
   */
  keyImpacts: Array<ProductSimulatePurchaseResponse.KeyImpact>;

  /**
   * A natural language summary of the simulation's results for this product.
   */
  narrativeSummary: string;

  /**
   * The ID of the marketplace product being simulated.
   */
  productId: string;

  /**
   * Unique identifier for the simulation performed.
   */
  simulationId: string;

  /**
   * Actionable recommendations or advice related to the product and its impact.
   */
  aiRecommendations?: Array<InsightsAPI.AIInsight> | null;

  /**
   * Projected amortization schedule for loan products.
   */
  projectedAmortizationSchedule?: Array<ProductSimulatePurchaseResponse.ProjectedAmortizationSchedule> | null;
}

export namespace ProductSimulatePurchaseResponse {
  export interface KeyImpact {
    metric?: string;

    severity?: 'low' | 'medium' | 'high';

    value?: string;
  }

  export interface ProjectedAmortizationSchedule {
    interest?: number;

    month?: number;

    payment?: number;

    principal?: number;

    remainingBalance?: number;
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

export interface ProductRedeemMarketplaceOfferParams {
  /**
   * Optional: The ID of the account to use for any associated payment or credit.
   */
  paymentAccountId?: string;
}

export interface ProductSimulatePurchaseParams {
  /**
   * Dynamic parameters specific to the product type (e.g., loan amount, investment
   * term).
   */
  simulationParameters?: unknown;
}

export declare namespace Products {
  export {
    type ProductListResponse as ProductListResponse,
    type ProductRedeemMarketplaceOfferResponse as ProductRedeemMarketplaceOfferResponse,
    type ProductSimulatePurchaseResponse as ProductSimulatePurchaseResponse,
    type ProductListParams as ProductListParams,
    type ProductRedeemMarketplaceOfferParams as ProductRedeemMarketplaceOfferParams,
    type ProductSimulatePurchaseParams as ProductSimulatePurchaseParams,
  };
}
