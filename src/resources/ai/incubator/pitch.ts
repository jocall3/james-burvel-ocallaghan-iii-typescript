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
  retrieveDetails(pitchID: unknown, options?: RequestOptions): APIPromise<PitchRetrieveDetailsResponse> {
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
    pitchID: unknown,
    body: PitchSubmitFeedbackParams,
    options?: RequestOptions,
  ): APIPromise<QuantumWeaverState> {
    return this._client.put(path`/ai/incubator/pitch/${pitchID}/feedback`, { body, ...options });
  }
}

export interface QuantumWeaverState {
  /**
   * Timestamp of the last status update.
   */
  lastUpdated: unknown;

  /**
   * Guidance on the next actions for the user.
   */
  nextSteps: unknown;

  /**
   * Unique identifier for the business pitch.
   */
  pitchId: unknown;

  /**
   * Current stage of the business pitch in the incubation process.
   */
  stage:
    | 'submitted'
    | 'initial_review'
    | 'ai_analysis'
    | 'feedback_required'
    | 'test_phase'
    | 'final_review'
    | 'approved_for_funding'
    | 'rejected'
    | 'incubated_graduated';

  /**
   * A human-readable status message.
   */
  statusMessage: unknown;

  /**
   * AI's estimated funding offer, if the pitch progresses.
   */
  estimatedFundingOffer?: unknown;

  /**
   * A summary of AI-generated feedback, if applicable.
   */
  feedbackSummary?: unknown;

  /**
   * List of questions from Quantum Weaver requiring the user's input.
   */
  questions?: Array<QuantumWeaverState.Question> | null;
}

export namespace QuantumWeaverState {
  export interface Question {
    id?: unknown;

    category?: unknown;

    isRequired?: unknown;

    question?: unknown;
  }
}

export interface PitchRetrieveDetailsResponse extends QuantumWeaverState {
  /**
   * AI-generated coaching plan for the entrepreneur.
   */
  aiCoachingPlan?: PitchRetrieveDetailsResponse.AICoachingPlan | null;

  /**
   * AI's detailed financial model analysis.
   */
  aiFinancialModel?: PitchRetrieveDetailsResponse.AIFinancialModel | null;

  /**
   * AI's detailed market analysis.
   */
  aiMarketAnalysis?: PitchRetrieveDetailsResponse.AIMarketAnalysis | null;

  /**
   * AI's assessment of risks associated with the venture.
   */
  aiRiskAssessment?: PitchRetrieveDetailsResponse.AIRiskAssessment | null;

  /**
   * AI's score for how well the pitch matches potential investors in the network
   * (0-1).
   */
  investorMatchScore?: unknown;
}

export namespace PitchRetrieveDetailsResponse {
  /**
   * AI-generated coaching plan for the entrepreneur.
   */
  export interface AICoachingPlan {
    steps?: Array<AICoachingPlan.Step>;

    summary?: unknown;

    title?: unknown;
  }

  export namespace AICoachingPlan {
    export interface Step {
      description?: unknown;

      resources?: Array<Step.Resource>;

      status?: 'pending' | 'in_progress' | 'completed';

      timeline?: unknown;

      title?: unknown;
    }

    export namespace Step {
      export interface Resource {
        name?: unknown;

        url?: unknown;
      }
    }
  }

  /**
   * AI's detailed financial model analysis.
   */
  export interface AIFinancialModel {
    breakevenPoint?: unknown;

    capitalRequirements?: unknown;

    costStructureAnalysis?: unknown;

    revenueBreakdown?: unknown;

    sensitivityAnalysis?: Array<AIFinancialModel.SensitivityAnalysis>;
  }

  export namespace AIFinancialModel {
    export interface SensitivityAnalysis {
      projectedIRR?: unknown;

      scenario?: unknown;

      terminalValue?: unknown;
    }
  }

  /**
   * AI's detailed market analysis.
   */
  export interface AIMarketAnalysis {
    competitiveAdvantages?: Array<unknown>;

    growthOpportunities?: unknown;

    riskFactors?: unknown;

    targetMarketSize?: unknown;
  }

  /**
   * AI's assessment of risks associated with the venture.
   */
  export interface AIRiskAssessment {
    marketRisk?: unknown;

    teamRisk?: unknown;

    technicalRisk?: unknown;
  }
}

export interface PitchSubmitParams {
  /**
   * The user's detailed narrative business plan (e.g., executive summary, vision,
   * strategy).
   */
  businessPlan: unknown;

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
  marketOpportunity: unknown;
}

export namespace PitchSubmitParams {
  /**
   * Key financial metrics and projections for the next 3-5 years.
   */
  export interface FinancialProjections {
    /**
     * Estimated time to profitability.
     */
    profitabilityEstimate?: unknown;

    /**
     * Number of years for financial projections.
     */
    projectionYears?: unknown;

    revenueForecast?: Array<unknown>;

    /**
     * Requested seed funding in USD.
     */
    seedRoundAmount?: unknown;

    /**
     * Pre-money valuation in USD.
     */
    valuationPreMoney?: unknown;
  }

  export interface FoundingTeam {
    /**
     * Relevant experience.
     */
    experience?: unknown;

    /**
     * Name of the team member.
     */
    name?: unknown;

    /**
     * Role of the team member.
     */
    role?: unknown;
  }
}

export interface PitchSubmitFeedbackParams {
  answers?: Array<PitchSubmitFeedbackParams.Answer>;

  /**
   * General textual feedback or additional details for Quantum Weaver.
   */
  feedback?: unknown;
}

export namespace PitchSubmitFeedbackParams {
  export interface Answer {
    /**
     * The answer to the specific question.
     */
    answer: unknown;

    /**
     * The ID of the question being answered.
     */
    questionId: unknown;
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
