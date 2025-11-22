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
   * The foreign exchange rate applied (targetCurrency per sourceCurrency).
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
   * The currency from which funds were sent.
   */
  sourceCurrency: string;

  /**
   * Current processing status of the international payment.
   */
  status: 'in_progress' | 'held_for_review' | 'completed' | 'failed' | 'cancelled';

  /**
   * The amount received by the beneficiary in the target currency.
   */
  targetAmount: number;

  /**
   * The currency received by the beneficiary.
   */
  targetCurrency: string;

  /**
   * Estimated date and time for payment completion.
   */
  estimatedCompletionTime?: string | null;

  /**
   * Any fees applied to the international payment.
   */
  feesApplied?: number | null;

  /**
   * Timestamp when the payment status was last updated.
   */
  lastUpdated?: string;

  /**
   * Additional messages, e.g., for held payments.
   */
  message?: string | null;

  /**
   * URL to track the payment's progress.
   */
  trackingUrl?: string | null;
}

export interface InternationalInitiateParams {
  /**
   * The amount of money to send in the `sourceCurrency`.
   */
  amount: number;

  /**
   * Details of the recipient for the international payment.
   */
  beneficiary: InternationalInitiateParams.Beneficiary;

  /**
   * A clear and concise purpose for the payment.
   */
  purpose: string;

  /**
   * The ID of the source account from which funds will be sent.
   */
  sourceAccountId: string;

  /**
   * The currency of the source account (ISO 4217 code).
   */
  sourceCurrency: string;

  /**
   * The target currency for the beneficiary (ISO 4217 code).
   */
  targetCurrency: string;

  /**
   * If true, attempts to lock the FX rate at the time of initiation.
   */
  fxRateLock?: boolean;

  /**
   * Optional: Preferred FX rate provider for the conversion.
   */
  fxRateProvider?: 'proprietary_ai' | 'market' | 'partner_bank' | null;

  /**
   * Optional: An external reference ID for this payment.
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
     * Optional: Traditional bank account number if IBAN not applicable.
     */
    accountNumber?: string | null;
  }
}

export declare namespace International {
  export {
    type InternationalPaymentStatus as InternationalPaymentStatus,
    type InternationalInitiateParams as InternationalInitiateParams,
  };
}
