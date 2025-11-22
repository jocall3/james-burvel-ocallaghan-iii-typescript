// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as InsightsAPI from '../../transactions/insights';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Simulate extends APIResource {
  /**
   * Engages the Quantum Oracle for highly complex, multi-variable simulations,
   * allowing precise control over numerous financial parameters, market conditions,
   * and personal events to generate deep, predictive insights and sensitivity
   * analysis.
   *
   * @example
   * ```ts
   * const advancedSimulationResponse = await client.ai.oracle.simulate.runAdvanced({
   *   prompt:
   *     'Evaluate the long-term impact of a sudden job loss combined with a variable market downturn, analyzing worst-case and best-case recovery scenarios over a decade.',
   *   scenarios: [
   *     {
   *       name: 'Job Loss & Mild Market Recovery',
   *       events: [
   *         { ... },
   *         { ... },
   *       ],
   *       durationYears: 10,
   *       sensitivityAnalysisParams: [
   *         { ... },
   *       ],
   *     },
   *   ],
   * });
   * ```
   */
  runAdvanced(
    body: SimulateRunAdvancedParams,
    options?: RequestOptions,
  ): APIPromise<AdvancedSimulationResponse> {
    return this._client.post('/ai/oracle/simulate/advanced', { body, ...options });
  }

  /**
   * Submits a hypothetical scenario to the Quantum Oracle AI for standard financial
   * impact analysis. The AI simulates the effect on the user's current financial
   * state and provides a summary.
   *
   * @example
   * ```ts
   * const simulationResponse =
   *   await client.ai.oracle.simulate.runStandard({
   *     prompt:
   *       'What if I invest an additional $1,000 per month into my aggressive growth portfolio for the next 5 years?',
   *     parameters: {
   *       durationYears: 5,
   *       monthlyInvestmentAmount: 1000,
   *       riskTolerance: 'aggressive',
   *     },
   *   });
   * ```
   */
  runStandard(body: SimulateRunStandardParams, options?: RequestOptions): APIPromise<SimulationResponse> {
    return this._client.post('/ai/oracle/simulate', { body, ...options });
  }
}

export interface AdvancedSimulationResponse {
  /**
   * A high-level summary of all scenario findings and overarching conclusions.
   */
  overallSummary: string;

  /**
   * Detailed results for each simulated scenario.
   */
  scenarioResults: Array<AdvancedSimulationResponse.ScenarioResult>;

  /**
   * Unique identifier for the completed advanced simulation.
   */
  simulationId: string;

  /**
   * Timestamp when the simulation was generated.
   */
  generatedOn?: string;

  /**
   * Long-term strategic recommendations derived from the complex simulations.
   */
  strategicRecommendations?: Array<InsightsAPI.AIInsight> | null;
}

export namespace AdvancedSimulationResponse {
  export interface ScenarioResult {
    /**
     * A summary of the outcomes for this specific scenario.
     */
    narrativeSummary: string;

    /**
     * The name of the simulated scenario.
     */
    scenarioName: string;

    /**
     * Projected net worth at the end of the scenario.
     */
    finalNetWorthProjected?: number | null;

    /**
     * Key metrics related to cash flow and liquidity within the scenario.
     */
    liquidityMetrics?: ScenarioResult.LiquidityMetrics | null;

    /**
     * Recommendations specific to this scenario.
     */
    scenarioSpecificRecommendations?: Array<InsightsAPI.AIInsight> | null;

    /**
     * Data points for generating sensitivity analysis graphs.
     */
    sensitivityAnalysisGraphs?: Array<ScenarioResult.SensitivityAnalysisGraph> | null;
  }

  export namespace ScenarioResult {
    /**
     * Key metrics related to cash flow and liquidity within the scenario.
     */
    export interface LiquidityMetrics {
      minCashBalance?: number;

      recoveryTimeMonths?: number;
    }

    export interface SensitivityAnalysisGraph {
      data?: Array<SensitivityAnalysisGraph.Data>;

      paramName?: string;
    }

    export namespace SensitivityAnalysisGraph {
      export interface Data {
        outcomeValue?: number;

        paramValue?: number;
      }
    }
  }
}

export interface SimulationResponse {
  /**
   * Key financial metrics and their projected values/changes.
   */
  keyImpacts: Array<SimulationResponse.KeyImpact>;

  /**
   * A natural language summary of the simulation's findings.
   */
  narrativeSummary: string;

  /**
   * Actionable recommendations derived from the simulation.
   */
  recommendations: Array<InsightsAPI.AIInsight>;

  /**
   * Detailed analysis of risks and potential stress test scenarios.
   */
  riskAnalysis: SimulationResponse.RiskAnalysis | null;

  /**
   * Unique identifier for the completed simulation.
   */
  simulationId: string;

  /**
   * Timestamp when the simulation was generated.
   */
  generatedOn?: string;
}

export namespace SimulationResponse {
  export interface KeyImpact {
    metric?: string;

    severity?: 'low' | 'medium' | 'high';

    value?: string;
  }

  /**
   * Detailed analysis of risks and potential stress test scenarios.
   */
  export interface RiskAnalysis {
    /**
     * Maximum expected percentage drop from a peak value.
     */
    maxDrawdown?: number;

    stressTestResults?: Array<RiskAnalysis.StressTestResult>;

    /**
     * An index representing the expected volatility of the outcome.
     */
    volatilityIndex?: number;
  }

  export namespace RiskAnalysis {
    export interface StressTestResult {
      impact?: string;

      scenario?: string;
    }
  }
}

export interface SimulateRunAdvancedParams {
  /**
   * Natural language description of the complex simulation goal.
   */
  prompt: string;

  /**
   * A list of distinct hypothetical scenarios to run.
   */
  scenarios: Array<SimulateRunAdvancedParams.Scenario>;

  /**
   * Overall duration of the simulation in years.
   */
  durationYears?: number;

  /**
   * Optional: Override current user financial data for the simulation's starting
   * point.
   */
  initialState?: SimulateRunAdvancedParams.InitialState | null;

  /**
   * Parameters to vary for sensitivity analysis within scenarios.
   */
  sensitivityAnalysisParams?: Array<SimulateRunAdvancedParams.SensitivityAnalysisParam> | null;
}

export namespace SimulateRunAdvancedParams {
  export interface Scenario {
    /**
     * Key events that define this scenario (e.g., job loss, market crash,
     * inheritance).
     */
    events: Array<Scenario.Event>;

    /**
     * A descriptive name for the scenario.
     */
    name: string;

    /**
     * Optional: Duration of this specific scenario, overrides global duration if
     * present.
     */
    durationYears?: number | null;

    /**
     * Optional: Scenario-specific parameters for sensitivity analysis.
     */
    sensitivityAnalysisParams?: Array<Scenario.SensitivityAnalysisParam> | null;
  }

  export namespace Scenario {
    export interface Event {
      /**
       * Specific parameters for the event type (e.g., durationMonths for job_loss).
       */
      details: { [key: string]: unknown };

      /**
       * Type of event occurring in the scenario.
       */
      type:
        | 'job_loss'
        | 'market_downturn'
        | 'market_boom'
        | 'inheritance'
        | 'major_expense'
        | 'new_income_stream'
        | 'interest_rate_change';

      /**
       * Optional: The month (relative to simulation start) when this event occurs.
       */
      startMonth?: number | null;
    }

    export interface SensitivityAnalysisParam {
      max?: number;

      min?: number;

      paramName?: string;

      step?: number;
    }
  }

  /**
   * Optional: Override current user financial data for the simulation's starting
   * point.
   */
  export interface InitialState {
    monthlyIncomeOverride?: number | null;

    netWorthOverride?: number | null;
  }

  export interface SensitivityAnalysisParam {
    max?: number;

    min?: number;

    paramName?: string;

    step?: number;
  }
}

export interface SimulateRunStandardParams {
  /**
   * Natural language description of the financial scenario to simulate.
   */
  prompt: string;

  /**
   * Optional: Structured parameters to guide the AI simulation (e.g., duration,
   * amount, riskTolerance).
   */
  parameters?: { [key: string]: unknown } | null;
}

export declare namespace Simulate {
  export {
    type AdvancedSimulationResponse as AdvancedSimulationResponse,
    type SimulationResponse as SimulationResponse,
    type SimulateRunAdvancedParams as SimulateRunAdvancedParams,
    type SimulateRunStandardParams as SimulateRunStandardParams,
  };
}
