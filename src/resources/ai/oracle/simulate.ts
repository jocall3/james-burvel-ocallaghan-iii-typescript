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
   * A high-level summary of the simulation across all scenarios.
   */
  overallSummary: string;

  /**
   * Detailed results for each simulated scenario.
   */
  scenarioResults: Array<AdvancedSimulationResponse.ScenarioResult>;

  /**
   * Unique identifier for the advanced simulation.
   */
  simulationId: string;

  /**
   * Quantitative comparison across scenarios (e.g., best-case vs. worst-case NPV).
   */
  comparisonAnalysis?: unknown | null;

  /**
   * Overarching strategic recommendations derived from the complex simulation.
   */
  strategicRecommendations?: Array<InsightsAPI.AIInsight> | null;
}

export namespace AdvancedSimulationResponse {
  export interface ScenarioResult {
    /**
     * Summary of results specific to this scenario.
     */
    narrativeSummary: string;

    /**
     * Name of the simulated scenario.
     */
    scenarioName: string;

    /**
     * Time-series data for various financial metrics (e.g., monthly cash balance).
     */
    detailedFinancialProjections?: unknown | null;

    /**
     * Projected net worth at the end of the simulation period for this scenario.
     */
    finalNetWorthProjected?: number | null;

    /**
     * Key liquidity indicators for the scenario.
     */
    liquidityMetrics?: ScenarioResult.LiquidityMetrics | null;

    /**
     * Data points for visualizing sensitivity analysis of key parameters.
     */
    sensitivityAnalysisGraphs?: Array<ScenarioResult.SensitivityAnalysisGraph> | null;
  }

  export namespace ScenarioResult {
    /**
     * Key liquidity indicators for the scenario.
     */
    export interface LiquidityMetrics {
      /**
       * How many months the emergency fund lasted.
       */
      emergencyFundDepletionMonths?: number | null;

      /**
       * The lowest cash balance reached during the simulation.
       */
      minCashBalance?: number;

      /**
       * Time (in months) to recover from a financial shock, if applicable.
       */
      recoveryTimeMonths?: number | null;
    }

    export interface SensitivityAnalysisGraph {
      /**
       * Data points for plotting the parameter's impact on a key outcome.
       */
      data: Array<SensitivityAnalysisGraph.Data>;

      /**
       * The name of the parameter varied in the sensitivity analysis.
       */
      paramName: string;
    }

    export namespace SensitivityAnalysisGraph {
      export interface Data {
        /**
         * The resulting key outcome value.
         */
        outcomeValue?: number;

        /**
         * The value of the varied parameter.
         */
        paramValue?: number;
      }
    }
  }
}

export interface SimulationResponse {
  /**
   * Key financial metrics and their projected impact.
   */
  keyImpacts: Array<SimulationResponse.KeyImpact>;

  /**
   * A natural language summary of the simulation results.
   */
  narrativeSummary: string;

  /**
   * Unique identifier for the completed simulation.
   */
  simulationId: string;

  /**
   * Actionable AI-driven recommendations based on the simulation.
   */
  recommendations?: Array<SimulationResponse.Recommendation> | null;

  /**
   * Detailed analysis of potential risks associated with the simulated scenario.
   */
  riskAnalysis?: SimulationResponse.RiskAnalysis | null;
}

export namespace SimulationResponse {
  export interface KeyImpact {
    /**
     * The financial metric being impacted.
     */
    metric: string;

    /**
     * The projected value or range for the metric.
     */
    value: string;

    /**
     * The severity of the impact (e.g., positive or negative significant change).
     */
    severity?: 'low' | 'medium' | 'high' | null;
  }

  export interface Recommendation {
    /**
     * Detailed explanation of the recommendation.
     */
    description: string;

    /**
     * A concise title for the recommendation.
     */
    title: string;

    /**
     * An identifier or URI to trigger a specific action within the application.
     */
    actionTrigger?: string | null;
  }

  /**
   * Detailed analysis of potential risks associated with the simulated scenario.
   */
  export interface RiskAnalysis {
    /**
     * Worst historical decline from a peak (e.g., 0.25 for 25% drop).
     */
    maxDrawdown?: number | null;

    /**
     * Further details on how different adverse scenarios impact the outcome.
     */
    scenarioAnalysis?: unknown | null;

    /**
     * A measure of market or portfolio volatility (e.g., standard deviation).
     */
    volatilityIndex?: number | null;
  }
}

export interface SimulateRunAdvancedParams {
  /**
   * A high-level natural language prompt describing the complex simulation.
   */
  prompt: string;

  /**
   * A list of one or more detailed scenarios to simulate.
   */
  scenarios: Array<SimulateRunAdvancedParams.Scenario>;

  /**
   * Optional: Parameters that apply to all scenarios unless overridden (e.g.,
   * overall economic growth rate).
   */
  globalParameters?: unknown | null;
}

export namespace SimulateRunAdvancedParams {
  export interface Scenario {
    /**
     * The total duration of the simulation for this scenario in years.
     */
    durationYears: number;

    /**
     * A descriptive name for the individual scenario.
     */
    name: string;

    /**
     * Detailed description of the scenario.
     */
    description?: string | null;

    /**
     * A sequence of financial or life events to include in the simulation.
     */
    events?: Array<Scenario.Event> | null;

    marketConditions?: Scenario.MarketConditions | null;

    /**
     * Parameters to vary for sensitivity analysis within this scenario.
     */
    sensitivityAnalysisParams?: Array<Scenario.SensitivityAnalysisParam> | null;
  }

  export namespace Scenario {
    export interface Event {
      /**
       * Type of financial or life event.
       */
      type:
        | 'job_loss'
        | 'market_downturn'
        | 'significant_expense'
        | 'windfall'
        | 'salary_increase'
        | 'new_investment';

      /**
       * Specific details for the event type.
       */
      details?: Event.JobLossDetails | Event.MarketDownturnDetails | Event.UnionMember2;

      /**
       * The year in the simulation when this event occurs.
       */
      yearInSimulation?: number;
    }

    export namespace Event {
      export interface JobLossDetails {
        /**
         * Expected duration of unemployment in months.
         */
        durationMonths: number;

        /**
         * Total severance package received.
         */
        severanceAmount: number;

        /**
         * Multiplier for new job salary compared to old (e.g., 0.9 for 90%).
         */
        newJobSalaryMultiplier?: number;

        /**
         * Monthly unemployment benefits.
         */
        unemploymentBenefits?: number | null;
      }

      export interface MarketDownturnDetails {
        /**
         * Percentage drop in investment portfolio value (e.g., 0.15 for 15% drop).
         */
        impactPercentage: number;

        /**
         * Number of years expected for market to recover.
         */
        recoveryYears: number;
      }

      export interface UnionMember2 {
        /**
         * Amount for the event.
         */
        amount?: number;

        /**
         * Timing of the event in months from start.
         */
        timingMonths?: number;
      }
    }

    export interface MarketConditions {
      /**
       * Average annual market return.
       */
      averageAnnualReturn?: number;

      /**
       * Market volatility index.
       */
      volatility?: number;
    }

    export interface SensitivityAnalysisParam {
      /**
       * Maximum value for the parameter.
       */
      max: number;

      /**
       * Minimum value for the parameter.
       */
      min: number;

      /**
       * Name of the parameter to vary.
       */
      paramName: string;

      /**
       * Step increment for the parameter.
       */
      step?: number | null;
    }
  }
}

export interface SimulateRunStandardParams {
  /**
   * A natural language description of the 'what-if' scenario to simulate.
   */
  prompt: string;

  /**
   * Optional: Structured parameters to guide the simulation (e.g., duration,
   * amount).
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
