// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InvestmentsAPI from './investments';
import { InvestmentAnalyzeImpactResponse, Investments } from './investments';
import * as InsightsAPI from '../transactions/insights';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Sustainability extends APIResource {
  investments: InvestmentsAPI.Investments = new InvestmentsAPI.Investments(this._client);

  /**
   * Allows users to purchase carbon offsets to neutralize their estimated carbon
   * footprint, supporting environmental initiatives.
   *
   * @example
   * ```ts
   * const response =
   *   await client.sustainability.purchaseCarbonOffsets({
   *     amountKgCO2e: 500,
   *     paymentAccountId: 'acc_chase_checking_4567',
   *     offsetProject: 'Verified Carbon Standard Project X',
   *   });
   * ```
   */
  purchaseCarbonOffsets(
    body: SustainabilityPurchaseCarbonOffsetsParams,
    options?: RequestOptions,
  ): APIPromise<SustainabilityPurchaseCarbonOffsetsResponse> {
    return this._client.post('/sustainability/carbon-offsets', { body, ...options });
  }

  /**
   * Generates a detailed report of the user's estimated carbon footprint based on
   * transaction data, lifestyle choices, and AI-driven impact assessments, offering
   * insights and reduction strategies.
   *
   * @example
   * ```ts
   * const response =
   *   await client.sustainability.retrieveCarbonFootprint();
   * ```
   */
  retrieveCarbonFootprint(
    options?: RequestOptions,
  ): APIPromise<SustainabilityRetrieveCarbonFootprintResponse> {
    return this._client.get('/sustainability/carbon-footprint', options);
  }
}

export interface SustainabilityPurchaseCarbonOffsetsResponse {
  /**
   * The amount of carbon (in Kg CO2e) that was offset.
   */
  amountOffsetKgCO2e: number;

  /**
   * The name of the carbon offset project supported.
   */
  projectSupported: string;

  /**
   * Date and time of the offset purchase.
   */
  purchaseDate: string;

  /**
   * Unique identifier for the carbon offset purchase.
   */
  purchaseId: string;

  /**
   * The total cost of the carbon offset purchase in USD.
   */
  totalCostUSD: number;

  /**
   * URL to the carbon offset certificate.
   */
  certificateUrl?: string | null;

  /**
   * The ID of the associated financial transaction.
   */
  transactionId?: string | null;
}

export interface SustainabilityRetrieveCarbonFootprintResponse {
  /**
   * AI-generated insights and recommendations for reducing carbon footprint.
   */
  aiInsights: Array<InsightsAPI.AIInsight>;

  /**
   * Breakdown of the carbon footprint by categories (e.g., Transportation, Food,
   * Housing).
   */
  breakdownByCategory: Array<SustainabilityRetrieveCarbonFootprintResponse.BreakdownByCategory>;

  /**
   * The time period covered by the report.
   */
  period: string;

  /**
   * Unique identifier for the carbon footprint report.
   */
  reportId: string;

  /**
   * Total estimated carbon footprint in kilograms of CO2 equivalent.
   */
  totalCarbonFootprintKgCO2e: number;

  /**
   * Recommendations for purchasing carbon offsets.
   */
  offsetRecommendations?: Array<SustainabilityRetrieveCarbonFootprintResponse.OffsetRecommendation> | null;
}

export namespace SustainabilityRetrieveCarbonFootprintResponse {
  export interface BreakdownByCategory {
    carbonFootprintKgCO2e?: number;

    category?: string;

    percentage?: number;
  }

  export interface OffsetRecommendation {
    costPerTonUSD?: number;

    offsetAmountKgCO2e?: number;

    project?: string;

    totalCostUSD?: number;
  }
}

export interface SustainabilityPurchaseCarbonOffsetsParams {
  /**
   * The amount of carbon (in Kg CO2e) to offset.
   */
  amountKgCO2e: number;

  /**
   * The ID of the account to use for payment.
   */
  paymentAccountId: string;

  /**
   * Optional: A specific carbon offset project or standard to support.
   */
  offsetProject?: string | null;
}

Sustainability.Investments = Investments;

export declare namespace Sustainability {
  export {
    type SustainabilityPurchaseCarbonOffsetsResponse as SustainabilityPurchaseCarbonOffsetsResponse,
    type SustainabilityRetrieveCarbonFootprintResponse as SustainabilityRetrieveCarbonFootprintResponse,
    type SustainabilityPurchaseCarbonOffsetsParams as SustainabilityPurchaseCarbonOffsetsParams,
  };

  export {
    Investments as Investments,
    type InvestmentAnalyzeImpactResponse as InvestmentAnalyzeImpactResponse,
  };
}
