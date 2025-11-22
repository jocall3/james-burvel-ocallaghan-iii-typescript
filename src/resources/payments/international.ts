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
  retrieveStatus(paymentID: string, options?: RequestOptions): APIPromise<InternationalPaymentStatus> {
    return this._client.get(path`/payments/international/${paymentID}/status`, options);
  }
}

export interface InternationalPaymentStatus {
  /**
   * Total fees applied to the payment.
   */
  feesApplied: number;

  /**
   * The foreign exchange rate applied (target_currency / source_currency).
   */
  fxRateApplied: number;

  /**
   * Unique identifier for the international payment.
   */
  paymentId: string;

  /**
   * Amount sent from the source account.
   */
  sourceAmount: number;

  /**
   * Currency of the source amount.
   */
  sourceCurrency: string;

  /**
   * Current status of the international payment.
   */
  status: 'in_progress' | 'held_for_review' | 'completed' | 'failed' | 'cancelled';

  /**
   * Amount received by the beneficiary in target currency (may be estimated).
   */
  targetAmount: number | null;

  /**
   * Currency of the target amount.
   */
  targetCurrency: string;

  /**
   * Estimated time when the payment will be completed.
   */
  estimatedCompletionTime?: string | null;

  /**
   * Additional message regarding payment status (e.g., reason for hold).
   */
  message?: string | null;

  /**
   * URL to track the payment's progress.
   */
  trackingUrl?: string | null;
}

export interface InternationalInitiateParams {
  /**
   * The amount to send in the source currency.
   */
  amount: number;

  /**
   * Details of the international beneficiary.
   */
  beneficiary: InternationalInitiateParams.Beneficiary;

  /**
   * Purpose of the payment (e.g., invoice payment, family support).
   */
  purpose: string;

  /**
   * The ID of the local account from which funds will be sent.
   */
  sourceAccountId: string;

  /**
   * The currency of the source account.
   */
  sourceCurrency: string;

  /**
   * The desired currency for the beneficiary.
   */
  targetCurrency: string;

  /**
   * If true, attempts to lock the quoted FX rate for the transaction.
   */
  fxRateLock?: boolean;

  /**
   * The desired provider for the foreign exchange rate.
   */
  fxRateProvider?: 'proprietary_ai' | 'external_partner' | 'market_rate';

  /**
   * Optional reference number for the payment (e.g., invoice number).
   */
  referenceNumber?: string | null;
}

export namespace InternationalInitiateParams {
  /**
   * Details of the international beneficiary.
   */
  export interface Beneficiary {
    address: string;

    bankName: string;

    iban: string;

    name: string;

    swiftBic: string;
  }
}

export declare namespace International {
  export {
    type InternationalPaymentStatus as InternationalPaymentStatus,
    type InternationalInitiateParams as InternationalInitiateParams,
  };
}
