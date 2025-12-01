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
   *     offsetProject: 'Verified Carbon Standard Project X',
   *     paymentAccountId: 'acc_chase_checking_4567',
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
   * The amount of carbon dioxide equivalent offset by this purchase.
   */
  amountOffsetKgCO2e: number;

  /**
   * Timestamp of the purchase.
   */
  purchaseDate: string;

  /**
   * Unique identifier for the carbon offset purchase.
   */
  purchaseId: string;

  /**
   * Total cost of the carbon offset purchase in USD.
   */
  totalCostUSD: number;

  /**
   * URL to the official carbon offset certificate.
   */
  certificateUrl?: string | null;

  /**
   * The carbon offset project supported.
   */
  projectSupported?: string | null;

  /**
   * The ID of the internal financial transaction for this purchase.
   */
  transactionId?: string | null;
}

export interface SustainabilityRetrieveCarbonFootprintResponse {
  /**
   * AI-driven insights and recommendations for reducing carbon footprint.
   */
  aiInsights: Array<InsightsAPI.AIInsight>;

  /**
   * Breakdown of carbon footprint by spending categories.
   */
  breakdownByCategory: Array<SustainabilityRetrieveCarbonFootprintResponse.BreakdownByCategory>;

  /**
   * The period covered by the report.
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
   * The amount of carbon dioxide equivalent to offset in kilograms.
   */
  amountKgCO2e: number;

  /**
   * Optional: The specific carbon offset project to support.
   */
  offsetProject: string | null;

  /**
   * The ID of the user's account to use for payment.
   */
  paymentAccountId: string;
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
