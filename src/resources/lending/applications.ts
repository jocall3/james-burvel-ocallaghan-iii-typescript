// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as OffersAPI from './offers';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Applications extends APIResource {
  /**
   * Retrieves the current status and detailed information for a submitted loan
   * application, including AI underwriting outcomes, approved terms, and next steps.
   *
   * @example
   * ```ts
   * const loanApplicationStatus =
   *   await client.lending.applications.retrieve(
   *     'loan_app_creditflow-123',
   *   );
   * ```
   */
  retrieve(applicationID: string, options?: RequestOptions): APIPromise<LoanApplicationStatus> {
    return this._client.get(path`/lending/applications/${applicationID}`, options);
  }

  /**
   * Submits a new loan application, which is instantly processed and underwritten by
   * our Quantum AI, providing rapid decisions and personalized loan offers based on
   * real-time financial health data.
   *
   * @example
   * ```ts
   * const loanApplicationStatus =
   *   await client.lending.applications.submit({
   *     loanAmount: 10000,
   *     loanPurpose: 'home_improvement',
   *     repaymentTermMonths: 36,
   *     additionalNotes:
   *       'Funds needed to replace a broken HVAC system.',
   *   });
   * ```
   */
  submit(body: ApplicationSubmitParams, options?: RequestOptions): APIPromise<LoanApplicationStatus> {
    return this._client.post('/lending/applications', { body, ...options });
  }
}

export interface LoanApplicationStatus {
  /**
   * Timestamp when the application was submitted.
   */
  applicationDate: string;

  /**
   * Unique identifier for the loan application.
   */
  applicationId: string;

  /**
   * The amount originally requested in the application.
   */
  loanAmountRequested: number;

  /**
   * The purpose of the loan.
   */
  loanPurpose:
    | 'home_improvement'
    | 'debt_consolidation'
    | 'medical_expense'
    | 'education'
    | 'auto_purchase'
    | 'other';

  /**
   * Guidance on the next actions for the user.
   */
  nextSteps: string;

  /**
   * Current status of the loan application.
   */
  status:
    | 'submitted'
    | 'underwriting'
    | 'approved'
    | 'declined'
    | 'pending_acceptance'
    | 'funded'
    | 'cancelled';

  /**
   * The outcome of the AI underwriting process.
   */
  aiUnderwritingResult?: LoanApplicationStatus.AIUnderwritingResult | null;

  /**
   * Details of the loan offer, if approved.
   */
  offerDetails?: OffersAPI.LoanOffer | null;
}

export namespace LoanApplicationStatus {
  /**
   * The outcome of the AI underwriting process.
   */
  export interface AIUnderwritingResult {
    /**
     * AI's confidence in its underwriting decision (0-1).
     */
    aiConfidence: number;

    /**
     * The AI's underwriting decision.
     */
    decision: 'approved' | 'declined' | 'referred_to_human';

    /**
     * Reasoning for the AI's decision.
     */
    reason: string;

    /**
     * The maximum amount the AI is willing to approve.
     */
    maxApprovedAmount?: number | null;

    /**
     * The interest rate recommended by the AI.
     */
    recommendedInterestRate?: number | null;
  }
}

export interface ApplicationSubmitParams {
  /**
   * The desired loan amount.
   */
  loanAmount: number;

  /**
   * The purpose of the loan.
   */
  loanPurpose:
    | 'home_improvement'
    | 'debt_consolidation'
    | 'medical_expense'
    | 'education'
    | 'auto_purchase'
    | 'other';

  /**
   * The desired repayment term in months.
   */
  repaymentTermMonths: number;

  /**
   * Optional notes or details for the application.
   */
  additionalNotes?: string | null;

  /**
   * Optional: Details of a co-applicant for the loan.
   */
  coApplicant?: ApplicationSubmitParams.CoApplicant | null;
}

export namespace ApplicationSubmitParams {
  /**
   * Optional: Details of a co-applicant for the loan.
   */
  export interface CoApplicant {
    email?: string;

    income?: number;

    name?: string;
  }
}

export declare namespace Applications {
  export {
    type LoanApplicationStatus as LoanApplicationStatus,
    type ApplicationSubmitParams as ApplicationSubmitParams,
  };
}
