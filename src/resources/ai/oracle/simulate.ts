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
   * A high-level narrative summary of the key findings across all scenarios.
   */
  overallSummary: string;

  scenarioResults: Array<AdvancedSimulationResponse.ScenarioResult>;

  /**
   * Unique identifier for the advanced simulation.
   */
  simulationId: string;

  /**
   * Strategic, actionable recommendations derived from the complex simulation.
   */
  strategicRecommendations?: Array<InsightsAPI.AIInsight> | null;
}

export namespace AdvancedSimulationResponse {
  export interface ScenarioResult {
    /**
     * Projected net worth at the end of the simulation for this scenario.
     */
    finalNetWorthProjected: number;

    /**
     * Summary of results for this specific scenario.
     */
    narrativeSummary: string;

    /**
     * Name of the specific scenario simulated.
     */
    scenarioName: string;

    /**
     * Key liquidity metrics for the scenario.
     */
    liquidityMetrics?: ScenarioResult.LiquidityMetrics;

    /**
     * Data points for generating sensitivity analysis charts.
     */
    sensitivityAnalysisGraphs?: Array<ScenarioResult.SensitivityAnalysisGraph>;
  }

  export namespace ScenarioResult {
    /**
     * Key liquidity metrics for the scenario.
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
   * A natural language summary of the simulation's findings and overall impact.
   */
  narrativeSummary: string;

  /**
   * Unique identifier for the completed simulation.
   */
  simulationId: string;

  /**
   * Key financial metrics and their projected changes due to the simulation.
   */
  keyImpacts?: Array<SimulationResponse.KeyImpact>;

  /**
   * Actionable recommendations derived from the simulation results.
   */
  recommendations?: Array<SimulationResponse.Recommendation> | null;

  /**
   * AI-driven risk assessment of the simulated scenario.
   */
  riskAnalysis?: SimulationResponse.RiskAnalysis | null;
}

export namespace SimulationResponse {
  export interface KeyImpact {
    metric?: string;

    severity?: 'low' | 'medium' | 'high' | 'critical';

    value?: string;
  }

  export interface Recommendation {
    actionTrigger?: string;

    description?: string;

    title?: string;
  }

  /**
   * AI-driven risk assessment of the simulated scenario.
   */
  export interface RiskAnalysis {
    /**
     * Maximum potential percentage loss from peak to trough.
     */
    maxDrawdown?: number;

    /**
     * AI-calculated volatility index for the simulated scenario.
     */
    volatilityIndex?: number;
  }
}

export interface SimulateRunAdvancedParams {
  /**
   * Natural language description of the complex financial simulation.
   */
  prompt: string;

  scenarios: Array<SimulateRunAdvancedParams.Scenario>;
}

export namespace SimulateRunAdvancedParams {
  export interface Scenario {
    /**
     * The duration of the simulation in years.
     */
    durationYears: number;

    events: Array<Scenario.Event>;

    /**
     * Name for this specific scenario.
     */
    name: string;

    /**
     * Parameters for which sensitivity analysis should be performed within this
     * scenario.
     */
    sensitivityAnalysisParams?: Array<Scenario.SensitivityAnalysisParam> | null;
  }

  export namespace Scenario {
    export interface Event {
      /**
       * Specific parameters for the event type.
       */
      details: unknown;

      /**
       * Type of event occurring in the scenario.
       */
      type:
        | 'job_loss'
        | 'market_downturn'
        | 'major_expense'
        | 'income_increase'
        | 'large_investment'
        | 'property_purchase'
        | 'inheritance';
    }

    export interface SensitivityAnalysisParam {
      max: number;

      min: number;

      paramName: string;

      step?: number | null;
    }
  }
}

export interface SimulateRunStandardParams {
  /**
   * Natural language description of the financial scenario to simulate.
   */
  prompt: string;

  /**
   * Structured parameters to guide the simulation, complementing the natural
   * language prompt.
   */
  parameters?: unknown | null;
}

export declare namespace Simulate {
  export {
    type AdvancedSimulationResponse as AdvancedSimulationResponse,
    type SimulationResponse as SimulationResponse,
    type SimulateRunAdvancedParams as SimulateRunAdvancedParams,
    type SimulateRunStandardParams as SimulateRunStandardParams,
  };
}
