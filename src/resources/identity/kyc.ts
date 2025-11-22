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
   * The timestamp of the last KYC document submission.
   */
  lastSubmissionDate: string | null;

  /**
   * The overall status of the user's KYC verification.
   */
  overallStatus: 'not_submitted' | 'in_review' | 'verified' | 'rejected';

  /**
   * The ID of the user whose KYC status is being retrieved.
   */
  userId: string;

  /**
   * Optional: The reason for KYC rejection, if applicable.
   */
  rejectionReason?: string | null;

  /**
   * List of actions the user needs to take to complete verification.
   */
  requiredActions?: Array<string> | null;

  /**
   * The service tier unlocked by successful KYC verification.
   */
  verifiedTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
}

export interface KYCSubmitParams {
  /**
   * The country that issued the document (ISO 3166-1 alpha-2).
   */
  countryOfIssue: string;

  /**
   * Base64 encoded image of the front side of the document.
   */
  documentFrontImage: string;

  /**
   * The unique identifier number from the document.
   */
  documentNumber: string;

  /**
   * Type of KYC document being submitted.
   */
  documentType: 'drivers_license' | 'passport' | 'national_id' | 'utility_bill' | 'bank_statement';

  /**
   * The date the document expires.
   */
  expirationDate: string;

  /**
   * The date the document was issued.
   */
  issueDate: string;

  /**
   * Any additional notes or comments for the KYC review team.
   */
  additionalNotes?: string | null;

  /**
   * Base64 encoded image of an address proof document (e.g., utility bill).
   */
  addressProofImage?: string | null;

  /**
   * Base64 encoded image of the back side of the document (if applicable).
   */
  documentBackImage?: string | null;
}

export declare namespace KYC {
  export { type KYCStatus as KYCStatus, type KYCSubmitParams as KYCSubmitParams };
}
