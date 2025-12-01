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
   * Timestamp when the conversion was completed.
   */
  conversionTimestamp: string;

  /**
   * The foreign exchange rate applied (target per source currency).
   */
  fxRateApplied: number;

  /**
   * The amount converted from the source currency.
   */
  sourceAmount: number;

  /**
   * The source currency code.
   */
  sourceCurrency: string;

  /**
   * Status of the currency conversion.
   */
  status: 'completed' | 'pending' | 'failed';

  /**
   * The amount converted into the target currency.
   */
  targetAmount: number;

  /**
   * Any fees applied to the conversion.
   */
  feesApplied?: number | null;

  /**
   * The target currency code.
   */
  targetCurrency?: string;

  /**
   * The ID of the internal transaction representing this conversion.
   */
  transactionId?: string | null;
}

export interface FxRetrieveRatesResponse {
  /**
   * The base currency code.
   */
  baseCurrency: string;

  /**
   * Real-time foreign exchange rates.
   */
  currentRate: FxRetrieveRatesResponse.CurrentRate;

  /**
   * The target currency code.
   */
  targetCurrency: string;

  historicalVolatility?: FxRetrieveRatesResponse.HistoricalVolatility | null;

  /**
   * AI-predicted foreign exchange rates for future dates.
   */
  predictiveRates?: Array<FxRetrieveRatesResponse.PredictiveRate> | null;
}

export namespace FxRetrieveRatesResponse {
  /**
   * Real-time foreign exchange rates.
   */
  export interface CurrentRate {
    /**
     * Current ask rate (price at which a currency dealer will sell the base currency).
     */
    ask?: number;

    /**
     * Current bid rate (price at which a currency dealer will buy the base currency).
     */
    bid?: number;

    /**
     * Mid-market rate (average of bid and ask).
     */
    mid?: number;

    /**
     * Timestamp of the current rate.
     */
    timestamp?: string;
  }

  export interface HistoricalVolatility {
    /**
     * Historical volatility over the past 30 days.
     */
    past30Days?: number;

    /**
     * Historical volatility over the past 7 days.
     */
    past7Days?: number;
  }

  export interface PredictiveRate {
    /**
     * AI model's confidence in the prediction (0-1).
     */
    aiModelConfidence?: number;

    /**
     * Lower bound of the AI's confidence interval for the predicted rate.
     */
    confidenceIntervalLower?: number;

    /**
     * Upper bound of the AI's confidence interval for the predicted rate.
     */
    confidenceIntervalUpper?: number;

    /**
     * Date for the predicted rate.
     */
    date?: string;

    /**
     * AI-predicted mid-market rate.
     */
    predictedMidRate?: number;
  }
}

export interface FxConvertParams {
  /**
   * The ID of the account from which funds will be converted.
   */
  sourceAccountId: string;

  /**
   * The amount to convert from the source currency.
   */
  sourceAmount: number;

  /**
   * The ISO 4217 currency code of the source funds.
   */
  sourceCurrency: string;

  /**
   * The ISO 4217 currency code for the target currency.
   */
  targetCurrency: string;

  /**
   * If true, attempts to lock the quoted FX rate for a short period.
   */
  fxRateLock?: boolean;

  /**
   * Optional: The ID of the account to deposit the converted funds. If null, funds
   * are held in a wallet/balance.
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
