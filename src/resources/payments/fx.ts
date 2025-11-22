// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Fx extends APIResource {
  /**
   * Executes an instant currency conversion between two currencies, either from a
   * balance or into a specified account.
   *
   * @example
   * ```ts
   * const response = await client.payments.fx.convert({
   *   sourceAccountId: 'acc_chase_checking_4567',
   *   sourceAmount: 1000,
   *   sourceCurrency: 'USD',
   *   targetCurrency: 'EUR',
   *   fxRateLock: true,
   *   targetAccountId: 'acc_euro_savings_9876',
   * });
   * ```
   */
  convert(body: FxConvertParams, options?: RequestOptions): APIPromise<FxConvertResponse> {
    return this._client.post('/payments/fx/convert', { body, ...options });
  }

  /**
   * Retrieves current and AI-predicted future foreign exchange rates for a specified
   * currency pair, including bid/ask spreads and historical volatility data for
   * informed decisions.
   *
   * @example
   * ```ts
   * const response = await client.payments.fx.retrieveRates({
   *   baseCurrency: 'USD',
   *   targetCurrency: 'EUR',
   * });
   * ```
   */
  retrieveRates(query: FxRetrieveRatesParams, options?: RequestOptions): APIPromise<FxRetrieveRatesResponse> {
    return this._client.get('/payments/fx/rates', { query, ...options });
  }
}

export interface FxConvertResponse {
  /**
   * Unique identifier for the currency conversion.
   */
  conversionId: string;

  /**
   * Timestamp of the conversion.
   */
  conversionTimestamp: string;

  /**
   * Any fees charged for the conversion.
   */
  feesApplied: number;

  /**
   * The exchange rate applied (targetCurrency / sourceCurrency).
   */
  fxRateApplied: number;

  /**
   * Amount of source currency converted.
   */
  sourceAmount: number;

  /**
   * Source currency code.
   */
  sourceCurrency: string;

  /**
   * Status of the currency conversion.
   */
  status: 'completed' | 'pending_review' | 'failed';

  /**
   * Amount of target currency received.
   */
  targetAmount: number;

  /**
   * Target currency code.
   */
  targetCurrency?: string;

  /**
   * The ID of the internal transaction recording the conversion.
   */
  transactionId?: string | null;
}

export interface FxRetrieveRatesResponse {
  /**
   * The base currency code.
   */
  baseCurrency: string;

  /**
   * The current real-time exchange rates.
   */
  currentRate: FxRetrieveRatesResponse.CurrentRate;

  /**
   * The target currency code.
   */
  targetCurrency: string;

  /**
   * AI-driven risk assessment for the currency pair.
   */
  aiRiskAssessment?: FxRetrieveRatesResponse.AIRiskAssessment | null;

  /**
   * Historical volatility data for the currency pair.
   */
  historicalVolatility?: FxRetrieveRatesResponse.HistoricalVolatility | null;

  /**
   * AI-predicted future exchange rates for the specified forecast horizon.
   */
  predictiveRates?: Array<FxRetrieveRatesResponse.PredictiveRate> | null;
}

export namespace FxRetrieveRatesResponse {
  /**
   * The current real-time exchange rates.
   */
  export interface CurrentRate {
    /**
     * The ask price (rate at which the market will sell the base currency).
     */
    ask: number;

    /**
     * The bid price (rate at which the market will buy the base currency).
     */
    bid: number;

    /**
     * The mid-market rate (average of bid and ask).
     */
    mid: number;

    /**
     * Timestamp of the rate quote.
     */
    timestamp: string;
  }

  /**
   * AI-driven risk assessment for the currency pair.
   */
  export interface AIRiskAssessment {
    /**
     * AI-identified events that could impact FX rates.
     */
    eventRiskFactors?: Array<string>;

    /**
     * AI forecast for future volatility.
     */
    volatilityForecast?: 'low' | 'medium' | 'high';
  }

  /**
   * Historical volatility data for the currency pair.
   */
  export interface HistoricalVolatility {
    /**
     * Volatility over the past 30 days.
     */
    past30Days?: number;

    /**
     * Volatility over the past 7 days.
     */
    past7Days?: number;
  }

  export interface PredictiveRate {
    /**
     * AI model's confidence (0-1) in this specific prediction.
     */
    aiModelConfidence: number;

    /**
     * Lower bound of the confidence interval for the prediction.
     */
    confidenceIntervalLower: number;

    /**
     * Upper bound of the confidence interval for the prediction.
     */
    confidenceIntervalUpper: number;

    /**
     * The date for which the rate is predicted.
     */
    date: string;

    /**
     * The AI's predicted mid-market rate for that date.
     */
    predictedMidRate: number;
  }
}

export interface FxConvertParams {
  /**
   * The ID of the user's account from which funds will be converted.
   */
  sourceAccountId: string;

  /**
   * The amount to convert from the source account in `sourceCurrency`.
   */
  sourceAmount: number;

  /**
   * The currency to convert from (ISO 4217 code).
   */
  sourceCurrency: string;

  /**
   * The currency to convert to (ISO 4217 code).
   */
  targetCurrency: string;

  /**
   * If true, attempts to lock the quoted FX rate. May incur a small fee.
   */
  fxRateLock?: boolean;

  /**
   * Preferred FX rate provider for the conversion.
   */
  fxRateProvider?: 'proprietary_ai' | 'standard_interbank' | 'third_party';

  /**
   * Optional: The ID of the target account to receive the converted funds. If
   * omitted, funds are converted within the source account's currency capabilities
   * or a new balance is created.
   */
  targetAccountId?: string | null;
}

export interface FxRetrieveRatesParams {
  /**
   * The base currency code (e.g., USD).
   */
  baseCurrency: string;

  /**
   * The target currency code (e.g., EUR).
   */
  targetCurrency: string;

  /**
   * Number of days into the future to provide an AI-driven prediction.
   */
  forecastDays?: number;
}

export declare namespace Fx {
  export {
    type FxConvertResponse as FxConvertResponse,
    type FxRetrieveRatesResponse as FxRetrieveRatesResponse,
    type FxConvertParams as FxConvertParams,
    type FxRetrieveRatesParams as FxRetrieveRatesParams,
  };
}
