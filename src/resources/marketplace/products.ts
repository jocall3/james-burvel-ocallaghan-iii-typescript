// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InsightsAPI from '../transactions/insights';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Products extends APIResource {
  /**
   * Retrieves a list of personalized product recommendations from the Plato AI
   * Marketplace.
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
   * Allows the user to claim an exclusive, personalized offer for a marketplace
   * product, often involving a discount code or special terms that are then linked
   * to their account.
   *
   * @example
   * ```ts
   * const response =
   *   await client.marketplace.products.claimOffer(
   *     'prod_smart_thermostat_001',
   *     { redemptionChannel: 'in_app' },
   *   );
   * ```
   */
  claimOffer(
    productID: string,
    body: ProductClaimOfferParams,
    options?: RequestOptions,
  ): APIPromise<ProductClaimOfferResponse> {
    return this._client.post(path`/marketplace/products/${productID}/claim-offer`, { body, ...options });
  }

  /**
   * Uses Quantum Oracle AI to simulate the short-term and long-term financial impact
   * of purchasing a specific marketplace product on the user's budget and cash flow.
   *
   * @example
   * ```ts
   * const response =
   *   await client.marketplace.products.simulatePurchase(
   *     'prod_smart_thermostat_001',
   *     {
   *       purchaseOption: 'financed_12_months',
   *       targetAccountId: 'acc_chase_checking_4567',
   *     },
   *   );
   * ```
   */
  simulatePurchase(
    productID: string,
    body: ProductSimulatePurchaseParams,
    options?: RequestOptions,
  ): APIPromise<ProductSimulatePurchaseResponse> {
    return this._client.post(path`/marketplace/products/${productID}/simulate-purchase`, {
      body,
      ...options,
    });
  }
}

export type ProductListResponse = Array<ProductListResponse.ProductListResponseItem>;

export namespace ProductListResponse {
  export interface ProductListResponseItem {
    /**
     * Unique identifier for the marketplace product.
     */
    id: string;

    /**
     * AI's recommendation score (0-1) for this user.
     */
    aiRecommendationScore: number;

    /**
     * Category of the product.
     */
    category: string;

    /**
     * Currency of the product price.
     */
    currency: string;

    /**
     * Description of the product.
     */
    description: string;

    /**
     * URL to the product image.
     */
    imageUrl: string;

    /**
     * Name of the product.
     */
    name: string;

    /**
     * AI's explanation for why this product is recommended.
     */
    personalizationReason: string;

    /**
     * Price of the product.
     */
    price: number;

    /**
     * Vendor or brand of the product.
     */
    vendor: string;

    /**
     * AI's estimated financial impact of purchasing this product.
     */
    estimatedImpactOnBudget?: ProductListResponseItem.EstimatedImpactOnBudget | null;

    offerDetails?: ProductListResponseItem.OfferDetails | null;
  }

  export namespace ProductListResponseItem {
    /**
     * AI's estimated financial impact of purchasing this product.
     */
    export interface EstimatedImpactOnBudget {
      /**
       * Estimated monthly cost from this product (e.g., financing).
       */
      monthlyCost?: number | null;

      /**
       * Estimated monthly savings from this product (if applicable).
       */
      monthlySavings?: number | null;

      /**
       * Overall impact on user's budget.
       */
      overallBudgetImpact?: 'positive' | 'neutral' | 'negative' | null;

      /**
       * Estimated number of months to recoup initial investment/cost.
       */
      paybackPeriodMonths?: number | null;
    }

    export interface OfferDetails {
      /**
       * Discount percentage.
       */
      discountPercentage?: number;

      /**
       * Promotional code.
       */
      offerCode?: string;

      /**
       * Offer valid until date.
       */
      validUntil?: string;
    }
  }
}

export interface ProductClaimOfferResponse {
  /**
   * A message providing redemption instructions or confirmation.
   */
  message: string;

  /**
   * Unique identifier for the claimed offer.
   */
  offerId: string;

  /**
   * The ID of the product related to the offer.
   */
  productId: string;

  /**
   * Current status of the offer.
   */
  status: 'claimed' | 'redeemed' | 'expired';

  /**
   * Date and time when the claimed offer expires.
   */
  expirationDate?: string | null;

  /**
   * Optional: A code needed to redeem the offer.
   */
  redemptionCode?: string | null;

  /**
   * Optional: A direct link to redeem the offer.
   */
  redemptionLink?: string | null;
}

export interface ProductSimulatePurchaseResponse {
  /**
   * Key financial metrics and their projected impact.
   */
  keyImpacts: Array<ProductSimulatePurchaseResponse.KeyImpact>;

  /**
   * The ID of the product for which the simulation was run.
   */
  productId: string;

  /**
   * The payment option simulated.
   */
  purchaseOption: 'full_payment' | 'financed_12_months' | 'financed_24_months';

  /**
   * A narrative summary of the financial impact.
   */
  simulationSummary: string;

  /**
   * AI-generated recommendations or insights based on the purchase simulation.
   */
  aiRecommendations?: Array<InsightsAPI.AIInsight> | null;
}

export namespace ProductSimulatePurchaseResponse {
  export interface KeyImpact {
    /**
     * The financial metric being impacted.
     */
    metric: string;

    /**
     * The projected value or range for the metric.
     */
    value: string;

    /**
     * The severity of the impact (e.g., positive or negative significant change).
     */
    severity?: 'low' | 'medium' | 'high' | null;
  }
}

export interface ProductListParams {
  /**
   * Filter products by category.
   */
  category?: string;

  /**
   * Maximum number of items to return in the response.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export interface ProductClaimOfferParams {
  /**
   * Preferred channel for offer redemption details.
   */
  redemptionChannel?: 'email' | 'in_app' | 'external_link';
}

export interface ProductSimulatePurchaseParams {
  /**
   * The payment method to simulate.
   */
  purchaseOption: 'full_payment' | 'financed_12_months' | 'financed_24_months';

  /**
   * Optional: The account from which the purchase would be made. If omitted, AI will
   * infer.
   */
  targetAccountId?: string | null;
}

export declare namespace Products {
  export {
    type ProductListResponse as ProductListResponse,
    type ProductClaimOfferResponse as ProductClaimOfferResponse,
    type ProductSimulatePurchaseResponse as ProductSimulatePurchaseResponse,
    type ProductListParams as ProductListParams,
    type ProductClaimOfferParams as ProductClaimOfferParams,
    type ProductSimulatePurchaseParams as ProductSimulatePurchaseParams,
  };
}
