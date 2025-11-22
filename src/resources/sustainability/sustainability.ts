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
   * The amount of carbon (in Kg CO2e) that was offset.
   */
  amountOffsetKgCO2e: number;

  /**
   * The name of the carbon offset project supported.
   */
  projectSupported: string;

  /**
   * Date and time of the carbon offset purchase.
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
   * The ID of the corresponding financial transaction for the purchase.
   */
  transactionId?: string | null;
}

export interface SustainabilityRetrieveCarbonFootprintResponse {
  /**
   * AI-driven insights and recommendations for reducing carbon footprint.
   */
  aiInsights: Array<InsightsAPI.AIInsight>;

  /**
   * Breakdown of the carbon footprint by spending category.
   */
  breakdownByCategory: Array<SustainabilityRetrieveCarbonFootprintResponse.BreakdownByCategory>;

  /**
   * The reporting period for the carbon footprint.
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
   * Recommendations for carbon offset projects.
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
   * Optional: Name or ID of a preferred carbon offset project. If null, AI will
   * select an optimal project.
   */
  offsetProject: string | null;

  /**
   * The ID of the user's account to debit for the purchase.
   */
  paymentAccountId: string;

  /**
   * If true, sets up a recurring carbon offset purchase.
   */
  recurring?: boolean;
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
