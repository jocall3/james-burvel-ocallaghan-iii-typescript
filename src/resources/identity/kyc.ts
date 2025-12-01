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
   *   documentNumber: 'ABC12345',
   *   documentType: 'drivers_license',
   *   expirationDate: '2030-01-01',
   *   issueDate: '2020-01-01',
   *   documentBackImage:
   *     'base64encoded_image_of_drivers_license_back',
   *   documentFrontImage:
   *     'base64encoded_image_of_drivers_license_front',
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
  lastSubmissionDate: unknown;

  /**
   * Overall status of the KYC verification process.
   */
  overallStatus: 'not_submitted' | 'in_review' | 'verified' | 'rejected' | 'requires_more_info';

  /**
   * List of actions required from the user if status is 'requires_more_info'.
   */
  requiredActions: Array<unknown>;

  /**
   * The ID of the user whose KYC status is being retrieved.
   */
  userId: unknown;

  /**
   * Reason for rejection if status is 'rejected'.
   */
  rejectionReason?: unknown;

  /**
   * The KYC verification tier achieved (e.g., for different service levels).
   */
  verifiedTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
}

export interface KYCSubmitParams {
  /**
   * The two-letter ISO country code where the document was issued.
   */
  countryOfIssue: unknown;

  /**
   * The identification number on the document.
   */
  documentNumber: unknown;

  /**
   * The type of KYC document being submitted.
   */
  documentType: 'drivers_license' | 'passport' | 'national_id' | 'utility_bill' | 'bank_statement' | 'other';

  /**
   * The expiration date of the document (YYYY-MM-DD).
   */
  expirationDate: unknown;

  /**
   * The issue date of the document (YYYY-MM-DD).
   */
  issueDate: unknown;

  /**
   * Array of additional documents (e.g., utility bills) as base64 encoded images.
   */
  additionalDocuments?: Array<unknown> | null;

  /**
   * Base64 encoded image of the back of the document (if applicable).
   */
  documentBackImage?: unknown;

  /**
   * Base64 encoded image of the front of the document. Use 'application/json' with
   * base64 string, or 'multipart/form-data' for direct file upload.
   */
  documentFrontImage?: unknown;
}

export declare namespace KYC {
  export { type KYCStatus as KYCStatus, type KYCSubmitParams as KYCSubmitParams };
}
