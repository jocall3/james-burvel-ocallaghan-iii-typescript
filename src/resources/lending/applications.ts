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
   * Date and time the application was submitted.
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
   * The stated purpose of the loan.
   */
  loanPurpose: string;

  /**
   * Guidance on what the user should do next.
   */
  nextSteps: string;

  /**
   * Current status of the loan application.
   */
  status: 'pending' | 'underwriting' | 'approved' | 'declined' | 'withdrawn' | 'funded';

  /**
   * Outcome and details from the AI underwriting process.
   */
  aiUnderwritingResult?: LoanApplicationStatus.AIUnderwritingResult | null;

  /**
   * Specific reasons for loan decline, adhering to regulatory requirements.
   */
  declineReasonDetails?: Array<string> | null;

  /**
   * Details of the loan offer if the application is approved.
   */
  offerDetails?: OffersAPI.LoanOffer | null;
}

export namespace LoanApplicationStatus {
  /**
   * Outcome and details from the AI underwriting process.
   */
  export interface AIUnderwritingResult {
    aiConfidence?: number;

    decision?: 'approved' | 'declined' | 'referred';

    maxApprovedAmount?: number | null;

    reason?: string;

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
    | 'debt_consolidation'
    | 'home_improvement'
    | 'medical_expenses'
    | 'education'
    | 'business_startup'
    | 'other';

  /**
   * Desired repayment term in months.
   */
  repaymentTermMonths: number;

  /**
   * Any additional information for the underwriting process.
   */
  additionalNotes?: string | null;

  /**
   * Optional details for a co-applicant.
   */
  coApplicant?: ApplicationSubmitParams.CoApplicant | null;

  /**
   * Optional details about collateral for secured loans.
   */
  collateralDetails?: ApplicationSubmitParams.CollateralDetails | null;
}

export namespace ApplicationSubmitParams {
  /**
   * Optional details for a co-applicant.
   */
  export interface CoApplicant {
    creditScore?: number | null;

    email?: string;

    income?: number;

    name?: string;
  }

  /**
   * Optional details about collateral for secured loans.
   */
  export interface CollateralDetails {
    description?: string;

    type?: string;

    value?: number;
  }
}

export declare namespace Applications {
  export {
    type LoanApplicationStatus as LoanApplicationStatus,
    type ApplicationSubmitParams as ApplicationSubmitParams,
  };
}
