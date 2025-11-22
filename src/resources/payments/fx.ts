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
   * Total fees applied to the conversion.
   */
  feesApplied: number;

  /**
   * The foreign exchange rate applied (target_currency / source_currency).
   */
  fxRateApplied: number;

  /**
   * Amount converted from the source currency.
   */
  sourceAmount: number;

  /**
   * Currency of the source amount.
   */
  sourceCurrency: string;

  /**
   * Status of the currency conversion.
   */
  status: 'completed' | 'failed' | 'cancelled';

  /**
   * Amount received in the target currency.
   */
  targetAmount: number;

  /**
   * Associated transaction ID in the user's account history.
   */
  transactionId?: string | null;
}

export interface FxRetrieveRatesResponse {
  /**
   * The base currency for the rate.
   */
  baseCurrency: string;

  /**
   * Current real-time foreign exchange rates.
   */
  currentRate: FxRetrieveRatesResponse.CurrentRate;

  /**
   * The target currency for the rate.
   */
  targetCurrency: string;

  /**
   * Historical volatility metrics for the currency pair.
   */
  historicalVolatility?: FxRetrieveRatesResponse.HistoricalVolatility;

  /**
   * AI-predicted foreign exchange rates for future dates with confidence intervals.
   */
  predictiveRates?: Array<FxRetrieveRatesResponse.PredictiveRate>;
}

export namespace FxRetrieveRatesResponse {
  /**
   * Current real-time foreign exchange rates.
   */
  export interface CurrentRate {
    ask?: number;

    bid?: number;

    mid?: number;

    timestamp?: string;
  }

  /**
   * Historical volatility metrics for the currency pair.
   */
  export interface HistoricalVolatility {
    past30Days?: number;

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
   * The ID of the account from which to deduct the source amount.
   */
  sourceAccountId: string;

  /**
   * The amount to convert from the source currency.
   */
  sourceAmount: number;

  /**
   * The currency to convert from.
   */
  sourceCurrency: string;

  /**
   * The currency to convert to.
   */
  targetCurrency: string;

  /**
   * If true, attempts to lock the quoted FX rate for the conversion.
   */
  fxRateLock?: boolean;

  /**
   * The desired provider for the foreign exchange rate.
   */
  fxRateProvider?: 'proprietary_ai' | 'external_partner' | 'market_rate';

  /**
   * Optional: The ID of the account to credit with the converted target amount. If
   * omitted, converted funds remain as a floating balance or are deposited into a
   * primary account.
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
