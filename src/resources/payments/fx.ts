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
   * The foreign exchange rate applied (targetCurrency per sourceCurrency).
   */
  fxRateApplied: number;

  /**
   * Amount converted from the source currency.
   */
  sourceAmount: number;

  /**
   * Source currency of the conversion.
   */
  sourceCurrency: string;

  /**
   * Status of the currency conversion.
   */
  status: 'completed' | 'failed';

  /**
   * Amount received in the target currency.
   */
  targetAmount: number;

  /**
   * The transaction ID associated with the conversion in the user's account history.
   */
  transactionId: string | null;

  /**
   * Any fees applied to the conversion.
   */
  feesApplied?: number | null;
}

export interface FxRetrieveRatesResponse {
  /**
   * The base currency for the rate.
   */
  baseCurrency: string;

  /**
   * Real-time current foreign exchange rates.
   */
  currentRate: FxRetrieveRatesResponse.CurrentRate;

  /**
   * The target currency for the rate.
   */
  targetCurrency: string;

  /**
   * Historical volatility data for the currency pair.
   */
  historicalVolatility?: FxRetrieveRatesResponse.HistoricalVolatility | null;

  /**
   * AI-predicted future foreign exchange rates.
   */
  predictiveRates?: Array<FxRetrieveRatesResponse.PredictiveRate> | null;
}

export namespace FxRetrieveRatesResponse {
  /**
   * Real-time current foreign exchange rates.
   */
  export interface CurrentRate {
    /**
     * The ask price (rate at which you can buy base currency).
     */
    ask: number;

    /**
     * The bid price (rate at which you can sell base currency).
     */
    bid: number;

    /**
     * The mid-market rate.
     */
    mid: number;

    /**
     * Timestamp of the current rate.
     */
    timestamp: string;
  }

  /**
   * Historical volatility data for the currency pair.
   */
  export interface HistoricalVolatility {
    /**
     * Average daily volatility over the past 30 days.
     */
    past30Days?: number;

    /**
     * Average daily volatility over the past 7 days.
     */
    past7Days?: number;
  }

  export interface PredictiveRate {
    aiModelConfidence?: number;

    confidenceIntervalLower?: number;

    confidenceIntervalUpper?: number;

    date?: string;

    predictedMidRate?: number;
  }
}

export interface FxConvertParams {
  /**
   * The ID of the account from which to convert funds.
   */
  sourceAccountId: string;

  /**
   * The amount to convert from the source currency.
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
   * If true, attempts to lock the FX rate at the time of conversion.
   */
  fxRateLock?: boolean;

  /**
   * Optional: The ID of the target account to deposit converted funds. If omitted,
   * converted funds will be deposited back to sourceAccountId (if multi-currency
   * capable) or a default linked account.
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
