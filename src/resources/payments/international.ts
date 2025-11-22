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
   * The foreign exchange rate applied (targetCurrency / sourceCurrency).
   */
  fxRateApplied: number;

  /**
   * Unique identifier for the international payment.
   */
  paymentId: string;

  /**
   * The amount sent from the source account.
   */
  sourceAmount: number;

  /**
   * The currency of the source amount.
   */
  sourceCurrency: string;

  /**
   * Current processing status of the payment.
   */
  status: 'in_progress' | 'held_for_review' | 'completed' | 'failed' | 'cancelled';

  /**
   * The amount received by the beneficiary in target currency.
   */
  targetAmount: number | null;

  /**
   * The currency the beneficiary will receive.
   */
  targetCurrency: string;

  /**
   * Estimated date and time when the payment will be completed.
   */
  estimatedCompletionTime?: string | null;

  /**
   * Additional messages, e.g., if payment is held for review.
   */
  message?: string | null;

  /**
   * URL to a tracking page for the payment.
   */
  trackingUrl?: string | null;
}

export interface InternationalInitiateParams {
  /**
   * The amount to send from the source account in `sourceCurrency`.
   */
  amount: number;

  /**
   * Details of the recipient for the international payment.
   */
  beneficiary: InternationalInitiateParams.Beneficiary;

  /**
   * A short description or purpose for the payment.
   */
  purpose: string;

  /**
   * The ID of the user's account from which funds will be sent.
   */
  sourceAccountId: string;

  /**
   * The currency of the source account (ISO 4217 code).
   */
  sourceCurrency: string;

  /**
   * The currency the beneficiary will receive (ISO 4217 code).
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
   * Optional: An internal reference ID or invoice number for the payment.
   */
  referenceId?: string | null;
}

export namespace InternationalInitiateParams {
  /**
   * Details of the recipient for the international payment.
   */
  export interface Beneficiary {
    /**
     * Full address of the beneficiary.
     */
    address: string;

    /**
     * Name of the beneficiary's bank.
     */
    bankName: string;

    /**
     * International Bank Account Number (IBAN) of the beneficiary.
     */
    iban: string;

    /**
     * Full name of the beneficiary.
     */
    name: string;

    /**
     * SWIFT/BIC code of the beneficiary's bank.
     */
    swiftBic: string;

    /**
     * Optional: Traditional bank account number if IBAN is not applicable.
     */
    accountNumber?: string | null;

    /**
     * Optional: Routing number for US beneficiaries.
     */
    routingNumber?: string | null;
  }
}

export declare namespace International {
  export {
    type InternationalPaymentStatus as InternationalPaymentStatus,
    type InternationalInitiateParams as InternationalInitiateParams,
  };
}
