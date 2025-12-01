// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class International extends APIResource {
  /**
   * Facilitates the secure initiation of an international wire transfer to a
   * beneficiary in another country and currency, leveraging optimal FX rates and
   * tracking capabilities.
   *
   * @example
   * ```ts
   * const internationalPaymentStatus =
   *   await client.payments.international.initiate({
   *     amount: 5000,
   *     beneficiary: {
   *       name: 'Maria Schmidt',
   *       address: 'Hauptstrasse 1, 10115 Berlin, Germany',
   *       bankName: 'Deutsche Bank',
   *       iban: 'DE89370400440532013000',
   *       swiftBic: 'DEUTDEFF',
   *     },
   *     purpose: 'Vendor payment for Q2 services.',
   *     sourceAccountId: 'acc_chase_checking_4567',
   *     sourceCurrency: 'USD',
   *     targetCurrency: 'EUR',
   *     fxRateLock: true,
   *     fxRateProvider: 'proprietary_ai',
   *   });
   * ```
   */
  initiate(
    body: InternationalInitiateParams,
    options?: RequestOptions,
  ): APIPromise<InternationalPaymentStatus> {
    return this._client.post('/payments/international/initiate', { body, ...options });
  }

  /**
   * Retrieves the current processing status and details of an initiated
   * international payment.
   *
   * @example
   * ```ts
   * const internationalPaymentStatus =
   *   await client.payments.international.retrieveStatus(
   *     'int_pmt_xyz7890',
   *   );
   * ```
   */
  retrieveStatus(paymentID: unknown, options?: RequestOptions): APIPromise<InternationalPaymentStatus> {
    return this._client.get(path`/payments/international/${paymentID}/status`, options);
  }
}

export interface InternationalPaymentStatus {
  /**
   * The foreign exchange rate applied (target per source currency).
   */
  fxRateApplied: unknown;

  /**
   * Unique identifier for the international payment.
   */
  paymentId: unknown;

  /**
   * The amount sent in the source currency.
   */
  sourceAmount: unknown;

  /**
   * The source currency code.
   */
  sourceCurrency: unknown;

  /**
   * Current processing status of the payment.
   */
  status: 'in_progress' | 'held_for_review' | 'completed' | 'failed' | 'cancelled';

  /**
   * The amount received by the beneficiary in the target currency.
   */
  targetAmount: unknown;

  /**
   * The target currency code.
   */
  targetCurrency: unknown;

  /**
   * Estimated time when the payment will be completed.
   */
  estimatedCompletionTime?: unknown;

  /**
   * Total fees applied to the payment.
   */
  feesApplied?: unknown;

  /**
   * An optional message providing more context on the status (e.g., reason for
   * hold).
   */
  message?: unknown;

  /**
   * URL to track the payment's progress.
   */
  trackingUrl?: unknown;
}

export interface InternationalInitiateParams {
  /**
   * The amount to send in the source currency.
   */
  amount: unknown;

  /**
   * Details of the payment beneficiary.
   */
  beneficiary: InternationalInitiateParams.Beneficiary;

  /**
   * Purpose of the payment.
   */
  purpose: unknown;

  /**
   * The ID of the user's source account for the payment.
   */
  sourceAccountId: unknown;

  /**
   * The ISO 4217 currency code of the source funds.
   */
  sourceCurrency: unknown;

  /**
   * The ISO 4217 currency code for the beneficiary's currency.
   */
  targetCurrency: unknown;

  /**
   * If true, attempts to lock the quoted FX rate for a short period.
   */
  fxRateLock?: unknown;

  /**
   * Indicates whether to use AI-optimized FX rates or standard market rates.
   */
  fxRateProvider?: 'proprietary_ai' | 'market_rate';

  /**
   * Optional: Your internal reference for this payment.
   */
  reference?: unknown;
}

export namespace InternationalInitiateParams {
  /**
   * Details of the payment beneficiary.
   */
  export interface Beneficiary {
    /**
     * Full address of the beneficiary.
     */
    address: unknown;

    /**
     * Name of the beneficiary's bank.
     */
    bankName: unknown;

    /**
     * Full name of the beneficiary.
     */
    name: unknown;

    /**
     * Account number (if IBAN/SWIFT not applicable).
     */
    accountNumber?: unknown;

    /**
     * IBAN for Eurozone transfers.
     */
    iban?: unknown;

    /**
     * Routing number (if applicable, e.g., for US transfers).
     */
    routingNumber?: unknown;

    /**
     * SWIFT/BIC code for international transfers.
     */
    swiftBic?: unknown;
  }
}

export declare namespace International {
  export {
    type InternationalPaymentStatus as InternationalPaymentStatus,
    type InternationalInitiateParams as InternationalInitiateParams,
  };
}
