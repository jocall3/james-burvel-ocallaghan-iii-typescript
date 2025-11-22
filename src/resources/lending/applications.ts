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
   * The original requested loan amount.
   */
  loanAmountRequested: number;

  /**
   * The stated purpose of the loan.
   */
  loanPurpose:
    | 'home_improvement'
    | 'debt_consolidation'
    | 'medical_expenses'
    | 'education'
    | 'business'
    | 'vehicle'
    | 'other';

  /**
   * Current status of the loan application.
   */
  status: 'underwriting' | 'approved' | 'declined' | 'pending_documents' | 'funded';

  /**
   * Results of the AI-powered underwriting, available upon decision.
   */
  aiUnderwritingResult?: LoanApplicationStatus.AIUnderwritingResult | null;

  /**
   * Actionable next steps for the user.
   */
  nextSteps?: string | null;

  /**
   * Details of the approved loan offer, if applicable.
   */
  offerDetails?: OffersAPI.LoanOffer | null;

  /**
   * If declined, the reason for the rejection.
   */
  rejectionReason?: string | null;
}

export namespace LoanApplicationStatus {
  /**
   * Results of the AI-powered underwriting, available upon decision.
   */
  export interface AIUnderwritingResult {
    /**
     * AI's confidence score (0-1) in its underwriting decision.
     */
    aiConfidence: number;

    /**
     * The AI's underwriting decision.
     */
    decision: 'approved' | 'declined' | 'referred_to_human';

    /**
     * The AI's reasoning for the decision.
     */
    reason: string;

    /**
     * The maximum loan amount the AI would approve.
     */
    maxApprovedAmount?: number | null;

    /**
     * AI-recommended interest rate.
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
    | 'medical_expenses'
    | 'education'
    | 'business'
    | 'vehicle'
    | 'other';

  /**
   * Desired repayment term in months.
   */
  repaymentTermMonths: number;

  /**
   * Any additional information for the loan application.
   */
  additionalNotes?: string | null;

  /**
   * Optional details if there is a co-applicant.
   */
  coApplicant?: ApplicationSubmitParams.CoApplicant | null;
}

export namespace ApplicationSubmitParams {
  /**
   * Optional details if there is a co-applicant.
   */
  export interface CoApplicant {
    /**
     * Email of the co-applicant.
     */
    email: string;

    /**
     * Annual income of the co-applicant.
     */
    income: number;

    /**
     * Full name of the co-applicant.
     */
    name: string;

    /**
     * Optional: Credit score of the co-applicant.
     */
    creditScore?: number | null;
  }
}

export declare namespace Applications {
  export {
    type LoanApplicationStatus as LoanApplicationStatus,
    type ApplicationSubmitParams as ApplicationSubmitParams,
  };
}
