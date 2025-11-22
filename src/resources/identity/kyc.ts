// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class KYC extends APIResource {
  /**
   * Retrieves the current status of the user's Know Your Customer (KYC) verification
   * process.
   *
   * @example
   * ```ts
   * const kycStatus =
   *   await client.identity.kyc.retrieveStatus();
   * ```
   */
  retrieveStatus(options?: RequestOptions): APIPromise<KYCStatus> {
    return this._client.get('/identity/kyc/status', options);
  }

  /**
   * Submits Know Your Customer (KYC) documentation, such as identity proofs and
   * address verification, for AI-accelerated compliance and identity verification,
   * crucial for higher service tiers and regulatory adherence.
   *
   * @example
   * ```ts
   * const kycStatus = await client.identity.kyc.submit({
   *   countryOfIssue: 'US',
   *   documentFrontImage:
   *     'base64encoded_image_of_drivers_license_front',
   *   documentNumber: 'ABC12345',
   *   documentType: 'drivers_license',
   *   expirationDate: '2030-01-01',
   *   issueDate: '2020-01-01',
   *   documentBackImage:
   *     'base64encoded_image_of_drivers_license_back',
   * });
   * ```
   */
  submit(body: KYCSubmitParams, options?: RequestOptions): APIPromise<KYCStatus> {
    return this._client.post('/identity/kyc/submit', { body, ...options });
  }
}

export interface KYCStatus {
  /**
   * Timestamp of the last KYC document submission.
   */
  lastSubmissionDate: string | null;

  /**
   * Overall status of the KYC verification process.
   */
  overallStatus: 'not_started' | 'in_review' | 'verified' | 'rejected' | 'requires_action';

  /**
   * Unique identifier for the user.
   */
  userId: string;

  /**
   * Reason for rejection if the status is 'rejected'.
   */
  rejectionReason?: string | null;

  /**
   * List of actions required from the user to proceed with verification.
   */
  requiredActions?: Array<string>;

  /**
   * The tier of verification achieved, granting access to different service levels.
   */
  verifiedTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
}

export interface KYCSubmitParams {
  /**
   * The country that issued the document (ISO 3166-1 alpha-2 code).
   */
  countryOfIssue: string;

  /**
   * Base64 encoded image of the front side of the document.
   */
  documentFrontImage: string;

  /**
   * The official document number.
   */
  documentNumber: string;

  /**
   * Type of KYC document being submitted.
   */
  documentType: 'drivers_license' | 'passport' | 'national_id' | 'utility_bill' | 'bank_statement';

  /**
   * Date the document expires.
   */
  expirationDate: string;

  /**
   * Date the document was issued.
   */
  issueDate: string;

  /**
   * Base64 encoded image of an address proof (e.g., utility bill).
   */
  addressProofImage?: string | null;

  /**
   * Base64 encoded image of the back side of the document (if applicable).
   */
  documentBackImage?: string | null;

  /**
   * Base64 encoded image of a live selfie for liveness detection.
   */
  liveSelfieImage?: string | null;
}

export declare namespace KYC {
  export { type KYCStatus as KYCStatus, type KYCSubmitParams as KYCSubmitParams };
}
