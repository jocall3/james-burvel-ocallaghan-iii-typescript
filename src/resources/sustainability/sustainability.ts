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
   * Amount of CO2 equivalent offset in kilograms.
   */
  amountOffsetKgCO2e: number;

  /**
   * Name of the carbon offset project supported.
   */
  projectSupported: string;

  /**
   * Date and time of the purchase.
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
   * URL to the carbon offset certificate.
   */
  certificateUrl?: string | null;

  /**
   * The ID of the internal transaction recording the purchase.
   */
  transactionId?: string | null;
}

export interface SustainabilityRetrieveCarbonFootprintResponse {
  /**
   * AI-generated insights and recommendations for reducing carbon footprint.
   */
  aiInsights: Array<InsightsAPI.AIInsight>;

  /**
   * Breakdown of the carbon footprint by category (e.g., transportation, food).
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
   * Suggestions for carbon offset projects.
   */
  offsetRecommendations?: Array<SustainabilityRetrieveCarbonFootprintResponse.OffsetRecommendation> | null;
}

export namespace SustainabilityRetrieveCarbonFootprintResponse {
  export interface BreakdownByCategory {
    /**
     * Carbon footprint for this category in Kg CO2e.
     */
    carbonFootprintKgCO2e: number;

    /**
     * Name of the spending category.
     */
    category: string;

    /**
     * Percentage of the total carbon footprint for this category.
     */
    percentage: number;
  }

  export interface OffsetRecommendation {
    /**
     * Cost per ton of CO2e offset in USD.
     */
    costPerTonUSD: number;

    /**
     * Amount of CO2e to offset (e.g., matching user's footprint).
     */
    offsetAmountKgCO2e: number;

    /**
     * Recommended carbon offset project name.
     */
    project: string;

    /**
     * Total estimated cost to purchase the recommended offset amount.
     */
    totalCostUSD: number;

    /**
     * URL for more information about the project.
     */
    projectDetailsUrl?: string | null;
  }
}

export interface SustainabilityPurchaseCarbonOffsetsParams {
  /**
   * Amount of CO2 equivalent (in kilograms) to offset.
   */
  amountKgCO2e: number;

  /**
   * The name or ID of the carbon offset project to support.
   */
  offsetProject: string;

  /**
   * The ID of the user's account to debit for the purchase.
   */
  paymentAccountId: string;

  /**
   * If true, automatically purchase offsets monthly based on estimated footprint.
   */
  autoOffsetMonthly?: boolean;
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
