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
   * A high-level summary of findings across all scenarios.
   */
  overallSummary: unknown;

  scenarioResults: Array<AdvancedSimulationResponse.ScenarioResult>;

  /**
   * Unique identifier for the completed advanced simulation.
   */
  simulationId: unknown;

  /**
   * Overarching strategic recommendations derived from the comparison of scenarios.
   */
  strategicRecommendations?: Array<InsightsAPI.AIInsight> | null;
}

export namespace AdvancedSimulationResponse {
  export interface ScenarioResult {
    /**
     * Summary of results for this specific scenario.
     */
    narrativeSummary: unknown;

    /**
     * Name of the individual scenario.
     */
    scenarioName: unknown;

    /**
     * Specific AI insights for this scenario.
     */
    aiInsights?: Array<InsightsAPI.AIInsight> | null;

    /**
     * Projected net worth at the end of the simulation period for this scenario.
     */
    finalNetWorthProjected?: unknown;

    liquidityMetrics?: ScenarioResult.LiquidityMetrics | null;

    /**
     * Data for generating sensitivity analysis charts (e.g., how net worth changes as
     * a variable is adjusted).
     */
    sensitivityAnalysisGraphs?: Array<ScenarioResult.SensitivityAnalysisGraph> | null;
  }

  export namespace ScenarioResult {
    export interface LiquidityMetrics {
      /**
       * Minimum cash balance reached during the scenario.
       */
      minCashBalance?: unknown;

      /**
       * Time in months to recover to pre-event financial state.
       */
      recoveryTimeMonths?: unknown;
    }

    export interface SensitivityAnalysisGraph {
      data?: Array<SensitivityAnalysisGraph.Data>;

      paramName?: unknown;
    }

    export namespace SensitivityAnalysisGraph {
      export interface Data {
        outcomeValue?: unknown;

        paramValue?: unknown;
      }
    }
  }
}

export interface SimulationResponse {
  /**
   * Key quantitative and qualitative impacts identified by the AI.
   */
  keyImpacts: Array<SimulationResponse.KeyImpact>;

  /**
   * A natural language summary of the simulation's results and key findings.
   */
  narrativeSummary: unknown;

  /**
   * Unique identifier for the completed simulation.
   */
  simulationId: unknown;

  /**
   * Actionable recommendations derived from the simulation.
   */
  recommendations?: Array<InsightsAPI.AIInsight> | null;

  /**
   * AI-driven risk assessment of the simulated scenario.
   */
  riskAnalysis?: SimulationResponse.RiskAnalysis;

  /**
   * Optional: URLs to generated visualization data or images.
   */
  visualizations?: Array<SimulationResponse.Visualization> | null;
}

export namespace SimulationResponse {
  export interface KeyImpact {
    metric?: unknown;

    severity?: 'low' | 'medium' | 'high';

    value?: unknown;
  }

  /**
   * AI-driven risk assessment of the simulated scenario.
   */
  export interface RiskAnalysis {
    /**
     * Maximum potential loss from peak to trough (e.g., 0.25 for 25%).
     */
    maxDrawdown?: unknown;

    /**
     * Measure of market volatility associated with the scenario.
     */
    volatilityIndex?: unknown;
  }

  export interface Visualization {
    dataUri?: unknown;

    title?: unknown;

    type?: 'line_chart' | 'bar_chart' | 'table';
  }
}

export interface SimulateRunAdvancedParams {
  /**
   * A natural language prompt describing the complex, multi-variable scenario.
   */
  prompt: unknown;

  scenarios: Array<SimulateRunAdvancedParams.Scenario>;

  /**
   * Optional: Global economic conditions to apply to all scenarios.
   */
  globalEconomicFactors?: SimulateRunAdvancedParams.GlobalEconomicFactors;

  /**
   * Optional: Personal financial assumptions to override defaults.
   */
  personalAssumptions?: SimulateRunAdvancedParams.PersonalAssumptions;
}

export namespace SimulateRunAdvancedParams {
  export interface Scenario {
    /**
     * The duration in years over which this scenario is simulated.
     */
    durationYears: unknown;

    /**
     * A list of discrete or continuous events that define this scenario.
     */
    events: Array<Scenario.Event>;

    /**
     * A descriptive name for this specific scenario.
     */
    name: unknown;

    /**
     * Parameters for multi-variable sensitivity analysis within this scenario.
     */
    sensitivityAnalysisParams?: Array<Scenario.SensitivityAnalysisParam> | null;
  }

  export namespace Scenario {
    export interface Event {
      /**
       * Specific parameters for the event (e.g., durationMonths, impactPercentage).
       */
      details?: unknown;

      type?: 'job_loss' | 'market_downturn' | 'large_purchase' | 'income_increase' | 'medical_emergency';
    }

    export interface SensitivityAnalysisParam {
      /**
       * Maximum value for the parameter.
       */
      max?: unknown;

      /**
       * Minimum value for the parameter.
       */
      min?: unknown;

      /**
       * The name of the parameter to vary for sensitivity analysis (e.g.,
       * 'interestRate', 'inflationRate', 'marketRecoveryRate').
       */
      paramName?: unknown;

      /**
       * Step increment for varying the parameter.
       */
      step?: unknown;
    }
  }

  /**
   * Optional: Global economic conditions to apply to all scenarios.
   */
  export interface GlobalEconomicFactors {
    inflationRate?: unknown;

    interestRateBaseline?: unknown;
  }

  /**
   * Optional: Personal financial assumptions to override defaults.
   */
  export interface PersonalAssumptions {
    annualSavingsRate?: unknown;

    riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  }
}

export interface SimulateRunStandardParams {
  /**
   * A natural language prompt describing the 'what-if' scenario.
   */
  prompt: unknown;

  /**
   * Optional structured parameters to guide the simulation (e.g., duration, amount,
   * risk tolerance).
   */
  parameters?: unknown;
}

export declare namespace Simulate {
  export {
    type AdvancedSimulationResponse as AdvancedSimulationResponse,
    type SimulationResponse as SimulationResponse,
    type SimulateRunAdvancedParams as SimulateRunAdvancedParams,
    type SimulateRunStandardParams as SimulateRunStandardParams,
  };
}
