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
     * AI's personalized recommendation score for the user (0-1).
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
     * Detailed description of the product.
     */
    description: string;

    /**
     * URL to the product's image.
     */
    imageUrl: string;

    /**
     * Name of the product.
     */
    name: string;

    /**
     * AI-generated explanation for why this product is recommended.
     */
    personalizationReason: string;

    /**
     * Price of the product.
     */
    price: number;

    /**
     * Name of the product vendor or manufacturer.
     */
    vendor: string;

    /**
     * AI's estimated financial impact if the user purchases this product.
     */
    estimatedImpactOnBudget?: ProductListResponseItem.EstimatedImpactOnBudget | null;

    /**
     * Details of any exclusive offer available for this product.
     */
    exclusiveOffer?: ProductListResponseItem.ExclusiveOffer | null;

    /**
     * Direct URL to the product page.
     */
    productUrl?: string | null;
  }

  export namespace ProductListResponseItem {
    /**
     * AI's estimated financial impact if the user purchases this product.
     */
    export interface EstimatedImpactOnBudget {
      monthlySavings?: number;

      paybackPeriodMonths?: number;
    }

    /**
     * Details of any exclusive offer available for this product.
     */
    export interface ExclusiveOffer {
      description?: string;

      discountPercentage?: number;

      expiresAt?: string;
    }
  }
}

export interface ProductClaimOfferResponse {
  /**
   * A descriptive message for the user about the claimed offer.
   */
  message: string;

  /**
   * Unique identifier for the claimed offer.
   */
  offerId: string;

  /**
   * The ID of the product the offer applies to.
   */
  productId: string;

  /**
   * Current status of the offer.
   */
  status: 'claimed' | 'redeemed' | 'expired';

  /**
   * The date and time when the offer expires.
   */
  expirationDate?: string | null;

  /**
   * A code to be used for redemption (if applicable).
   */
  redemptionCode?: string | null;

  /**
   * A direct link for redeeming the offer (if applicable).
   */
  redemptionLink?: string | null;
}

export interface ProductSimulatePurchaseResponse {
  /**
   * AI-driven recommendations based on the simulation results.
   */
  aiRecommendations: Array<InsightsAPI.AIInsight>;

  /**
   * Key financial metrics and their projected impact.
   */
  keyImpacts: Array<ProductSimulatePurchaseResponse.KeyImpact>;

  /**
   * The ID of the product for which the simulation was run.
   */
  productId: string;

  /**
   * The purchase option that was simulated.
   */
  purchaseOption: 'full_payment' | 'financed_12_months' | 'financed_24_months';

  /**
   * A natural language summary of the simulation results.
   */
  simulationSummary: string;
}

export namespace ProductSimulatePurchaseResponse {
  export interface KeyImpact {
    metric?: string;

    severity?: 'low' | 'medium' | 'high';

    value?: string;
  }
}

export interface ProductListParams {
  /**
   * Filter products by category.
   */
  category?: string;

  /**
   * Maximum number of items to return.
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
