// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Pitch extends APIResource {
  /**
   * Retrieves the granular AI-driven analysis, strategic feedback, market validation
   * results, and any outstanding questions from Quantum Weaver for a specific
   * business pitch.
   *
   * @example
   * ```ts
   * const response =
   *   await client.ai.incubator.pitch.retrieveDetails(
   *     'pitch_qw_synergychain-xyz',
   *   );
   * ```
   */
  retrieveDetails(pitchID: string, options?: RequestOptions): APIPromise<PitchRetrieveDetailsResponse> {
    return this._client.get(path`/ai/incubator/pitch/${pitchID}/details`, options);
  }

  /**
   * Submits a detailed business plan to the Quantum Weaver AI for rigorous analysis,
   * market validation, and seed funding consideration. This initiates the AI-driven
   * incubation journey, aiming to transform innovative ideas into commercially
   * successful ventures.
   *
   * @example
   * ```ts
   * const quantumWeaverState =
   *   await client.ai.incubator.pitch.submit({
   *     businessPlan:
   *       'Quantum-AI powered financial advisor platform leveraging neural networks for predictive analytics and hyper-personalized advice...',
   *     financialProjections: {
   *       seedRoundAmount: 2500000,
   *       valuationPreMoney: 10000000,
   *       projectionYears: 3,
   *       revenueForecast: [500000, 2000000, 6000000],
   *       profitabilityEstimate:
   *         'Achieve profitability within 18 months.',
   *     },
   *     foundingTeam: [
   *       {
   *         name: 'Dr. Eleanor Vance',
   *         role: 'CEO & Lead AI Scientist',
   *         experience:
   *           '15+ years in AI/ML, PhD in Quantum Computing, ex-Google Brain',
   *       },
   *       {
   *         name: 'Marcus Thorne',
   *         role: 'COO & Finance Expert',
   *         experience:
   *           '20+ years in Fintech, ex-Goldman Sachs',
   *       },
   *     ],
   *     marketOpportunity:
   *       'The booming digital finance market coupled with demand for truly personalized, AI-driven financial guidance presents a multi-billion dollar opportunity. Our unique quantum-AI approach provides unparalleled accuracy and foresight.',
   *   });
   * ```
   */
  submit(body: PitchSubmitParams, options?: RequestOptions): APIPromise<QuantumWeaverState> {
    return this._client.post('/ai/incubator/pitch', { body, ...options });
  }

  /**
   * Allows the entrepreneur to respond to specific questions or provide additional
   * details requested by Quantum Weaver, moving the pitch forward in the incubation
   * process.
   *
   * @example
   * ```ts
   * const quantumWeaverState =
   *   await client.ai.incubator.pitch.submitFeedback(
   *     'pitch_qw_synergychain-xyz',
   *     {
   *       answers: [
   *         {
   *           questionId: 'q_qa-team-001',
   *           answer:
   *             'Our mitigation strategy includes dedicated R&D and new hires with specific expertise.',
   *         },
   *         {
   *           questionId: 'q_qa-market-002',
   *           answer:
   *             'Our CAC projections are based on pilot program results showing $500 per enterprise client with a conversion rate of 10% from trials.',
   *         },
   *       ],
   *       feedback:
   *         "Regarding the technical challenges, our team has allocated 3 months for R&D on quantum-resistant cryptography, mitigating the risk. We've also brought in Dr. Elena Petrova, a leading expert in secure multi-party computation.",
   *     },
   *   );
   * ```
   */
  submitFeedback(
    pitchID: string,
    body: PitchSubmitFeedbackParams,
    options?: RequestOptions,
  ): APIPromise<QuantumWeaverState> {
    return this._client.put(path`/ai/incubator/pitch/${pitchID}/feedback`, { body, ...options });
  }
}

export interface QuantumWeaverState {
  /**
   * Timestamp when the pitch status was last updated.
   */
  lastUpdated: string;

  /**
   * Unique identifier for the business pitch.
   */
  pitchId: string;

  /**
   * Current stage of the business pitch within Quantum Weaver's incubation process.
   */
  stage:
    | 'initial_review'
    | 'ai_analysis'
    | 'feedback_required'
    | 'test_phase'
    | 'final_review'
    | 'approved_for_funding'
    | 'rejected'
    | 'incubated_graduated';

  /**
   * A human-readable message about the current status.
   */
  statusMessage: string;

  /**
   * Quantum Weaver's estimated funding offer, if in advanced stages.
   */
  estimatedFundingOffer?: number | null;

  /**
   * A summary of AI-generated feedback, if available and concise enough.
   */
  feedbackSummary?: string | null;

  /**
   * Actionable next steps for the entrepreneur.
   */
  nextSteps?: string | null;

  /**
   * A list of questions from Quantum Weaver requiring entrepreneur's input.
   */
  questions?: Array<QuantumWeaverState.Question> | null;
}

export namespace QuantumWeaverState {
  export interface Question {
    /**
     * Unique identifier for the question.
     */
    id: string;

    /**
     * The category of the question.
     */
    category: 'technology' | 'market' | 'finance' | 'team' | 'legal' | 'operations';

    /**
     * Indicates if answering this question is mandatory to proceed.
     */
    isRequired: boolean;

    /**
     * The question posed by Quantum Weaver.
     */
    question: string;
  }
}

export interface PitchRetrieveDetailsResponse extends Omit<QuantumWeaverState, 'feedbackSummary'> {
  /**
   * AI-generated coaching plan to help refine the business or prepare for next
   * steps.
   */
  aiCoachingPlan?: PitchRetrieveDetailsResponse.AICoachingPlan;

  /**
   * AI-generated financial model and projections based on the pitch.
   */
  aiFinancialModel?: PitchRetrieveDetailsResponse.AIFinancialModel;

  /**
   * AI's in-depth market analysis and validation.
   */
  aiMarketAnalysis?: PitchRetrieveDetailsResponse.AIMarketAnalysis;

  /**
   * AI's assessment of various risks associated with the venture.
   */
  aiRiskAssessment?: PitchRetrieveDetailsResponse.AIRiskAssessment;

  /**
   * A detailed summary of Quantum Weaver's initial analysis and feedback.
   */
  feedbackSummary?: unknown;

  /**
   * AI's score on how well the pitch aligns with investor criteria.
   */
  investorMatchScore?: number | null;
}

export namespace PitchRetrieveDetailsResponse {
  /**
   * AI-generated coaching plan to help refine the business or prepare for next
   * steps.
   */
  export interface AICoachingPlan {
    /**
     * Detailed steps of the coaching plan.
     */
    steps?: Array<AICoachingPlan.Step>;

    /**
     * Summary of the coaching plan.
     */
    summary?: string;

    /**
     * Title of the coaching plan.
     */
    title?: string;
  }

  export namespace AICoachingPlan {
    export interface Step {
      /**
       * Detailed description of the step.
       */
      description: string;

      /**
       * Current status of the step.
       */
      status: 'pending' | 'in_progress' | 'completed' | 'deferred';

      /**
       * Suggested timeline for completing the step.
       */
      timeline: string;

      /**
       * Title of the coaching step.
       */
      title: string;

      /**
       * Optional: Links to helpful resources for the step.
       */
      resources?: Array<Step.Resource> | null;
    }

    export namespace Step {
      export interface Resource {
        /**
         * Name of the resource.
         */
        name?: string;

        /**
         * URL to the resource.
         */
        url?: string;
      }
    }
  }

  /**
   * AI-generated financial model and projections based on the pitch.
   */
  export interface AIFinancialModel {
    /**
     * AI's estimate of when the venture will break even.
     */
    breakevenPoint?: string;

    /**
     * AI's estimated total capital required to reach profitability.
     */
    capitalRequirements?: number;

    /**
     * AI's analysis of the venture's cost structure.
     */
    costStructureAnalysis?: { [key: string]: string };

    /**
     * AI's projected revenue breakdown over years.
     */
    revenueBreakdown?: { [key: string]: string };

    /**
     * Sensitivity analysis for different growth scenarios.
     */
    sensitivityAnalysis?: Array<AIFinancialModel.SensitivityAnalysis>;
  }

  export namespace AIFinancialModel {
    export interface SensitivityAnalysis {
      projectedIRR?: number;

      scenario?: string;

      terminalValue?: number;
    }
  }

  /**
   * AI's in-depth market analysis and validation.
   */
  export interface AIMarketAnalysis {
    /**
     * AI's identified competitive advantages of the venture.
     */
    competitiveAdvantages?: Array<string>;

    /**
     * AI-identified growth opportunities.
     */
    growthOpportunities?: string;

    /**
     * AI-identified market-related risk factors.
     */
    riskFactors?: string;

    /**
     * AI's assessment of the total addressable market size.
     */
    targetMarketSize?: string;
  }

  /**
   * AI's assessment of various risks associated with the venture.
   */
  export interface AIRiskAssessment {
    /**
     * Assessment of market risks.
     */
    marketRisk?: string;

    /**
     * Overall AI risk score (0-1, lower is better).
     */
    overallScore?: number | null;

    /**
     * Assessment of regulatory risks.
     */
    regulatoryRisk?: string | null;

    /**
     * Assessment of team-related risks.
     */
    teamRisk?: string;

    /**
     * Assessment of technical risks.
     */
    technicalRisk?: string;
  }
}

export interface PitchSubmitParams {
  /**
   * The user's detailed narrative business plan (e.g., executive summary, vision,
   * strategy).
   */
  businessPlan: string;

  /**
   * Key financial metrics and projections for the next 3-5 years.
   */
  financialProjections: PitchSubmitParams.FinancialProjections;

  /**
   * Key profiles and expertise of the founding team members.
   */
  foundingTeam: Array<PitchSubmitParams.FoundingTeam>;

  /**
   * Detailed analysis of the target market, problem statement, and proposed
   * solution's unique value proposition.
   */
  marketOpportunity: string;
}

export namespace PitchSubmitParams {
  /**
   * Key financial metrics and projections for the next 3-5 years.
   */
  export interface FinancialProjections {
    /**
     * Estimated time to profitability.
     */
    profitabilityEstimate?: string;

    /**
     * Number of years for financial projections.
     */
    projectionYears?: number;

    revenueForecast?: Array<number>;

    /**
     * Requested seed funding in USD.
     */
    seedRoundAmount?: number;

    /**
     * Pre-money valuation in USD.
     */
    valuationPreMoney?: number;
  }

  export interface FoundingTeam {
    /**
     * Relevant experience.
     */
    experience?: string;

    /**
     * Name of the team member.
     */
    name?: string;

    /**
     * Role of the team member.
     */
    role?: string;
  }
}

export interface PitchSubmitFeedbackParams {
  /**
   * Specific answers to previously asked questions.
   */
  answers?: Array<PitchSubmitFeedbackParams.Answer> | null;

  /**
   * General feedback or additional information for Quantum Weaver.
   */
  feedback?: string | null;
}

export namespace PitchSubmitFeedbackParams {
  export interface Answer {
    /**
     * The answer to the question.
     */
    answer: string;

    /**
     * The ID of the question being answered.
     */
    questionId: string;
  }
}

export declare namespace Pitch {
  export {
    type QuantumWeaverState as QuantumWeaverState,
    type PitchRetrieveDetailsResponse as PitchRetrieveDetailsResponse,
    type PitchSubmitParams as PitchSubmitParams,
    type PitchSubmitFeedbackParams as PitchSubmitFeedbackParams,
  };
}
