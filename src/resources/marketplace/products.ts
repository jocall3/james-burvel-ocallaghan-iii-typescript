// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InsightsAPI from '../transactions/insights';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Access a dynamic, AI-curated marketplace offering hyper-personalized product recommendations, simulate purchase impacts, and discover exclusive partner offers.
 */
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
    offerID: unknown,
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
    productID: unknown,
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
  limit: unknown;

  /**
   * The number of items skipped before the current page.
   */
  offset: unknown;

  /**
   * The total number of items available across all pages.
   */
  total: unknown;

  data?: Array<ProductListResponse.Data>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export namespace ProductListResponse {
  export interface Data {
    /**
     * Unique identifier for the marketplace product.
     */
    id: unknown;

    /**
     * AI's score for how well this product is personalized to the user (0-1).
     */
    aiPersonalizationScore: unknown;

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
    description: unknown;

    /**
     * URL to an image representing the product.
     */
    imageUrl: unknown;

    /**
     * Name of the product/service.
     */
    name: unknown;

    /**
     * Pricing information (can be a range or fixed text).
     */
    price: unknown;

    /**
     * Provider or vendor of the product/service.
     */
    provider: unknown;

    /**
     * Average user rating for the product (0-5).
     */
    rating: unknown;

    /**
     * AI-generated explanation for recommending this product.
     */
    aiRecommendationReason?: unknown;

    /**
     * Details of any special offers associated with the product.
     */
    offerDetails?: Data.OfferDetails;

    /**
     * Direct URL to the product on the provider's website.
     */
    productUrl?: unknown;
  }

  export namespace Data {
    /**
     * Details of any special offers associated with the product.
     */
    export interface OfferDetails {
      /**
       * Optional redemption code.
       */
      code?: unknown;

      type?: 'discount' | 'special_rate' | 'free_trial';

      value?: unknown;
    }
  }
}

export interface ProductRedeemMarketplaceOfferResponse {
  /**
   * If applicable, the ID of any associated transaction (e.g., a credit or initial
   * payment).
   */
  associatedTransactionId?: unknown;

  /**
   * A descriptive message about the redemption.
   */
  message?: unknown;

  /**
   * The ID of the redeemed offer.
   */
  offerId?: unknown;

  redemptionDate?: unknown;

  /**
   * Unique ID for this redemption.
   */
  redemptionId?: unknown;

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
  narrativeSummary: unknown;

  /**
   * The ID of the marketplace product being simulated.
   */
  productId: unknown;

  /**
   * Unique identifier for the simulation performed.
   */
  simulationId: unknown;

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
    metric?: unknown;

    severity?: 'low' | 'medium' | 'high';

    value?: unknown;
  }

  export interface ProjectedAmortizationSchedule {
    interest?: unknown;

    month?: unknown;

    payment?: unknown;

    principal?: unknown;

    remainingBalance?: unknown;
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
  limit?: unknown;

  /**
   * Minimum user rating for products (0-5).
   */
  minRating?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export interface ProductRedeemMarketplaceOfferParams {
  /**
   * Optional: The ID of the account to use for any associated payment or credit.
   */
  paymentAccountId?: unknown;
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
