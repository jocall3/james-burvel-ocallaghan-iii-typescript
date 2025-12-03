/**
 * DisruptiveScenarioEngine: Strategic Foresight for Enterprise Resilience
 *
 * This module implements an advanced simulation engine designed to model the profound impact
 * of major market disruptions, technological paradigm shifts, regulatory overhauls, and other
 * high-impact external factors on an enterprise's entire KPI universe and strategic goals.
 * It provides "what-if" analysis for extreme events, moving beyond simple variable adjustments
 * to simulate systemic shocks.
 *
 * Business Value: This component delivers multi-million dollar value by:
 * - **Proactive Risk Mitigation**: Identifies vulnerabilities and potential failure points
 *   across the KPI ecosystem before they materialize, enabling pre-emptive strategic adjustments
 *   and contingency planning. This protects revenue streams and market position.
 * - **Enhanced Strategic Agility**: Allows leadership to test the resilience of their business
 *   models against various future scenarios (e.g., a major competitor's disruptive tech,
 *   a global supply chain collapse, or significant currency fluctuations), fostering
 *   data-driven adaptability and competitive advantage.
 * - **Optimized Resource Allocation**: By quantifying the potential impact on critical KPIs
 *   like revenue, cost of capital, customer acquisition, or token velocity, enterprises can
 *   strategically allocate resources to strengthen weak areas or capitalize on emerging
 *   opportunities post-disruption.
 * - **Robust Decision Support**: Provides C-suite and strategic planners with comprehensive
 *   reports detailing direct and cascading effects on financial health, operational efficiency,
 *   and market position, supporting informed decisions under extreme uncertainty.
 * - **Empowering Future-Proofing**: Integrates with agentic AI workflows by providing
 *   scenario outputs that can inform AI agents on how to adapt their strategies, reroute
 *   payments, or rebalance token liquidity in real-time during a crisis, ensuring operational
 *   continuity.
 *
 * This engine is crucial for building a resilient, future-proof enterprise capable of
 * navigating an increasingly volatile global landscape.
 */
import { format } from 'date-fns';
import {
  KpiMetricDefinition,
  KpiGoal,
  KpiUniverseConfig, // Included for conceptual completeness, though not directly used in runSimulation params
} from '../DynamicKpiLoader'; // Adjust path if types are moved to a separate file

// --- Type Definitions for the Disruptive Scenario Engine ---

/**
 * Defines a specific disruptive scenario to be simulated.
 */
export interface DisruptiveScenario {
  id: string;
  name: string;
  description: string;
  type: 'market_collapse' | 'tech_obsolescence' | 'regulatory_tsunami' | 'supply_chain_halt' | 'geopolitical_upheaval' | 'systemic_cyberattack' | 'currency_devaluation';
  intensity: 'minor' | 'moderate' | 'severe' | 'catastrophic'; // How severe is the disruption?
  duration: 'short_term' | 'medium_term' | 'long_term' | 'permanent'; // How long will it last?
  /**
   * Specific parameters for the scenario.
   * E.g., for 'market_collapse', `market_value_drop_percentage: 30`.
   * For 'currency_devaluation', `currency_devaluation_percentage: 25`.
   */
  parameters?: Record<string, any>;
}

/**
 * Defines how a specific KPI is impacted by a scenario type and intensity.
 */
export interface KpiImpactRule {
  kpiId: string; // The ID of the KPI being impacted
  impactType: 'percentage_change' | 'absolute_change' | 'set_value';
  value: number; // The amount of change (e.g., 0.1 for 10% or 1000 for absolute 1000) or the new value
  direction: 'increase' | 'decrease' | 'neutral'; // Whether the value increases or decreases relative to the current value
  /**
   * Optional condition for impact application, e.g., 'if current_value > 1000'.
   * In this simulation, complex conditions are acknowledged but not fully parsed.
   */
  condition?: string;
  sourceKpi?: string; // If impact is derived from another KPI (for cascading effects in advanced models)
}

/**
 * Maps scenario types and intensities to specific KPI impact rules.
 * This forms the "knowledge base" of the simulation engine.
 */
export type ScenarioImpactMapping = {
  [scenarioType in DisruptiveScenario['type']]?: {
    [intensity in DisruptiveScenario['intensity']]?: KpiImpactRule[];
  };
};

/**
 * Represents the simulated state of a single KPI after a disruption.
 */
export interface SimulatedKpiResult {
  kpiId: string;
  kpiName: string;
  originalValue: number | string;
  simulatedValue: number | string;
  changeDescription: string; // e.g., "Decreased by 25%", "Set to $0"
  impactDetail: string; // Explanation of why it changed
}

/**
 * Represents the simulated state of a single goal after a disruption.
 */
export interface SimulatedGoalResult {
  goalId: string;
  goalDescription: string;
  originalStatus: KpiGoal['status'];
  simulatedStatus: KpiGoal['status'];
  statusChangeReason: string; // Explanation of why goal status changed
}

/**
 * The comprehensive report generated by the DisruptiveScenarioEngine.
 */
export interface DisruptiveScenarioReport {
  scenario: DisruptiveScenario;
  simulationTimestamp: string;
  kpiImpacts: SimulatedKpiResult[];
  goalImpacts: SimulatedGoalResult[];
  overallSummary: string;
  strategicRecommendations: string[];
  potentialAgentActions: string[];
}

// --- Predefined Scenario Impact Rules (Simplified for demonstration) ---
// In a production system, this would be loaded from a robust knowledge base,
// potentially updated via an AI-driven learning system.
const predefinedScenarioImpacts: ScenarioImpactMapping = {
  market_collapse: {
    severe: [
      { kpiId: 'revenue_kpi_monthly', impactType: 'percentage_change', value: 0.40, direction: 'decrease' }, // 40% decrease
      { kpiId: 'customer_acquisition_cost', impactType: 'percentage_change', value: 0.20, direction: 'increase' }, // 20% increase
      { kpiId: 'avg_transaction_value', impactType: 'percentage_change', value: 0.25, direction: 'decrease' }, // 25% decrease
      { kpiId: 'token_liquidity_pool', impactType: 'percentage_change', value: 0.50, direction: 'decrease' }, // 50% decrease
      { kpiId: 'market_share', impactType: 'percentage_change', value: 0.15, direction: 'decrease' }, // 15% decrease
      { kpiId: 'investor_confidence_score', impactType: 'absolute_change', value: 30, direction: 'decrease' }, // Score drop
    ],
    moderate: [
      { kpiId: 'revenue_kpi_monthly', impactType: 'percentage_change', value: 0.15, direction: 'decrease' },
      { kpiId: 'customer_acquisition_cost', impactType: 'percentage_change', value: 0.10, direction: 'increase' },
      { kpiId: 'avg_transaction_value', impactType: 'percentage_change', value: 0.10, direction: 'decrease' },
      { kpiId: 'token_liquidity_pool', impactType: 'percentage_change', value: 0.20, direction: 'decrease' },
    ],
  },
  tech_obsolescence: {
    severe: [
      { kpiId: 'operational_efficiency', impactType: 'percentage_change', value: 0.30, direction: 'decrease' },
      { kpiId: 'development_cost_kpi', impactType: 'percentage_change', value: 0.50, direction: 'increase' },
      { kpiId: 'customer_satisfaction', impactType: 'percentage_change', value: 0.20, direction: 'decrease' },
      { kpiId: 'time_to_market_kpi', impactType: 'percentage_change', value: 0.40, direction: 'increase' },
      { kpiId: 'innovation_rate', impactType: 'percentage_change', value: 0.50, direction: 'decrease' },
    ],
  },
  regulatory_tsunami: {
    catastrophic: [
      { kpiId: 'compliance_cost', impactType: 'percentage_change', value: 1.00, direction: 'increase' }, // 100% increase
      { kpiId: 'transaction_volume', impactType: 'percentage_change', value: 0.60, direction: 'decrease' }, // 60% decrease
      { kpiId: 'profit_margin', impactType: 'percentage_change', value: 0.30, direction: 'decrease' }, // 30% decrease
      { kpiId: 'legal_risk_score', impactType: 'set_value', value: 95, direction: 'neutral' }, // Set to high risk score
      { kpiId: 'regulatory_fines_exposure', impactType: 'absolute_change', value: 50_000_000, direction: 'increase' },
    ],
    severe: [
      { kpiId: 'compliance_cost', impactType: 'percentage_change', value: 0.50, direction: 'increase' },
      { kpiId: 'transaction_volume', impactType: 'percentage_change', value: 0.25, direction: 'decrease' },
      { kpiId: 'profit_margin', impactType: 'percentage_change', value: 0.10, direction: 'decrease' },
    ],
  },
  supply_chain_halt: {
    severe: [
      { kpiId: 'cost_of_goods_sold', impactType: 'percentage_change', value: 0.75, direction: 'increase' },
      { kpiId: 'delivery_on_time_rate', impactType: 'percentage_change', value: 0.80, direction: 'decrease' }, // e.g., from 90% to 18%
      { kpiId: 'customer_churn_rate', impactType: 'percentage_change', value: 0.30, direction: 'increase' },
      { kpiId: 'inventory_turnover', impactType: 'percentage_change', value: 0.50, direction: 'decrease' },
      { kpiId: 'production_output', impactType: 'percentage_change', value: 0.60, direction: 'decrease' },
    ],
  },
  geopolitical_upheaval: {
    moderate: [
      { kpiId: 'currency_exchange_rate_risk', impactType: 'percentage_change', value: 0.20, direction: 'increase' },
      { kpiId: 'international_revenue_kpi', impactType: 'percentage_change', value: 0.15, direction: 'decrease' },
      { kpiId: 'logistics_cost', impactType: 'percentage_change', value: 0.10, direction: 'increase' },
      { kpiId: 'market_access_score', impactType: 'absolute_change', value: 20, direction: 'decrease' },
    ],
  },
  systemic_cyberattack: {
    catastrophic: [
      { kpiId: 'data_security_incidents', impactType: 'set_value', value: 100, direction: 'increase' }, // Many incidents
      { kpiId: 'system_downtime', impactType: 'absolute_change', value: 48, direction: 'increase' }, // 48 hours downtime
      { kpiId: 'customer_trust_score', impactType: 'percentage_change', value: 0.50, direction: 'decrease' },
      { kpiId: 'regulatory_fines_exposure', impactType: 'absolute_change', value: 10_000_000, direction: 'increase' },
      { kpiId: 'brand_reputation_index', impactType: 'percentage_change', value: 0.40, direction: 'decrease' },
    ],
    severe: [
      { kpiId: 'data_security_incidents', impactType: 'set_value', value: 10, direction: 'increase' },
      { kpiId: 'system_downtime', impactType: 'absolute_change', value: 8, direction: 'increase' },
      { kpiId: 'customer_trust_score', impactType: 'percentage_change', value: 0.20, direction: 'decrease' },
    ],
  },
  currency_devaluation: {
    severe: [
      { kpiId: 'import_cost', impactType: 'percentage_change', value: 0.30, direction: 'increase' },
      { kpiId: 'export_revenue', impactType: 'percentage_change', value: 0.20, direction: 'increase' }, // Increase in local currency value, may translate to less in foreign
      { kpiId: 'raw_material_cost', impactType: 'percentage_change', value: 0.25, direction: 'increase' },
      { kpiId: 'foreign_debt_exposure', impactType: 'percentage_change', value: 0.40, direction: 'increase' },
      { kpiId: 'purchasing_power_index', impactType: 'percentage_change', value: 0.35, direction: 'decrease' },
    ],
    moderate: [
      { kpiId: 'import_cost', impactType: 'percentage_change', value: 0.15, direction: 'increase' },
      { kpiId: 'export_revenue', impactType: 'percentage_change', value: 0.10, direction: 'increase' },
      { kpiId: 'raw_material_cost', impactType: 'percentage_change', value: 0.12, direction: 'increase' },
    ],
  },
};

/**
 * Utility function to apply an impact rule to a KPI value.
 * Handles different impact types and directions.
 *
 * @param {number | string} currentValue The current value of the KPI.
 * @param {KpiImpactRule} rule The impact rule to apply.
 * @returns {number | string} The new simulated KPI value.
 */
const applyKpiImpact = (currentValue: number | string, rule: KpiImpactRule): number | string => {
  let newValue: number | string = currentValue;

  if (typeof currentValue === 'number') {
    switch (rule.impactType) {
      case 'percentage_change':
        if (rule.direction === 'increase') {
          newValue = currentValue * (1 + rule.value);
        } else if (rule.direction === 'decrease') {
          newValue = currentValue * (1 - rule.value);
        }
        break;
      case 'absolute_change':
        if (rule.direction === 'increase') {
          newValue = currentValue + rule.value;
        } else if (rule.direction === 'decrease') {
          newValue = currentValue - rule.value;
        }
        break;
      case 'set_value':
        newValue = rule.value;
        break;
    }
    // Ensure numeric KPIs don't go below zero unless it makes sense (e.g., negative balance/score)
    if (typeof newValue === 'number' && newValue < 0 && !['foreign_debt_exposure', 'system_downtime', 'profit_margin', 'market_access_score', 'investor_confidence_score'].includes(rule.kpiId)) {
      newValue = 0;
    }
  } else {
    // For string-based KPIs (e.g., 'Status: Optimal'), direct set_value is the most common impact.
    if (rule.impactType === 'set_value') {
      newValue = String(rule.value);
    }
  }
  return newValue;
};

/**
 * Calculates a descriptive string for the change in a KPI.
 *
 * @param {number | string} originalValue The original KPI value.
 * @param {number | string} simulatedValue The simulated KPI value.
 * @param {string | undefined} unit The unit of the KPI, if available.
 * @returns {string} A description of the change.
 */
const getChangeDescription = (originalValue: number | string, simulatedValue: number | string, unit?: string): string => {
  if (originalValue === simulatedValue) {
    return "No change";
  }

  if (typeof originalValue === 'number' && typeof simulatedValue === 'number') {
    const diff = simulatedValue - originalValue;
    const percentageChange = originalValue !== 0 ? (diff / originalValue) * 100 : (diff > 0 ? Infinity : -Infinity);

    const sign = diff > 0 ? '+' : '';
    const formattedDiff = `${sign}${diff.toFixed(2)}${unit ? ` ${unit}` : ''}`;
    
    if (!isFinite(percentageChange) || Math.abs(percentageChange) < 0.01) {
        return formattedDiff; // Just show absolute change for very small percentages or division by zero
    }
    
    return `${sign}${percentageChange.toFixed(2)}% (${formattedDiff})`;
  }

  // For string or mixed types
  return `Changed from '${originalValue}' to '${simulatedValue}'`;
};

/**
 * DisruptiveScenarioEngine class.
 * Provides methods to simulate the impact of predefined disruptive scenarios on
 * an existing KPI universe and its strategic goals, offering strategic foresight.
 */
export class DisruptiveScenarioEngine {

  /**
   * Runs a simulation for a given disruptive scenario.
   *
   * @param {DisruptiveScenario} scenario The specific disruptive scenario to simulate.
   * @param {KpiMetricDefinition[]} kpiDefinitions All defined KPIs in the universe.
   * @param {Record<string, number | string>} currentKpiValues Current real-time values for all KPIs.
   * @param {KpiGoal[]} currentGoals All active strategic goals.
   * @returns {DisruptiveScenarioReport} A comprehensive report detailing the simulation's findings.
   */
  public static runSimulation(
    scenario: DisruptiveScenario,
    kpiDefinitions: KpiMetricDefinition[],
    currentKpiValues: Record<string, number | string>,
    currentGoals: KpiGoal[]
  ): DisruptiveScenarioReport {
    const simulatedKpiValues = { ...currentKpiValues };
    const kpiImpacts: SimulatedKpiResult[] = [];
    const goalImpacts: SimulatedGoalResult[] = [];
    const kpiDefinitionsMap = new Map(kpiDefinitions.map(kpi => [kpi.id, kpi]));

    // 1. Determine applicable impact rules based on scenario type and intensity
    const rulesToApply = predefinedScenarioImpacts[scenario.type]?.[scenario.intensity] || [];

    // 2. Apply impact rules to KPIs
    for (const rule of rulesToApply) {
      const originalValue = simulatedKpiValues[rule.kpiId];
      const kpiDef = kpiDefinitionsMap.get(rule.kpiId);

      if (originalValue !== undefined && kpiDef) {
        // In a real system, 'condition' would involve a robust expression parser.
        // For this simulation, we'll acknowledge but not implement complex conditions.
        if (rule.condition) {
          console.warn(`[DisruptiveScenarioEngine] Complex condition '${rule.condition}' for KPI ${rule.kpiId} ignored in simulation.`);
        }

        const simulatedValue = applyKpiImpact(originalValue, rule);
        simulatedKpiValues[rule.kpiId] = simulatedValue;

        kpiImpacts.push({
          kpiId: rule.kpiId,
          kpiName: kpiDef.name,
          originalValue: originalValue,
          simulatedValue: simulatedValue,
          changeDescription: getChangeDescription(originalValue, simulatedValue, kpiDef.unit),
          impactDetail: `Directly impacted by '${scenario.name}' (${scenario.type}, ${scenario.intensity}): Value ${rule.direction === 'increase' ? 'increased' : 'decreased'} by ${rule.impactType === 'percentage_change' ? `${(rule.value * 100).toFixed(0)}%` : `${rule.value}${kpiDef.unit || ''}`}.`,
        });
      }
    }

    // 3. Re-evaluate goals based on simulated KPI values
    for (const goal of currentGoals) {
      const originalStatus = goal.status;
      const kpiDef = kpiDefinitionsMap.get(goal.metricId);
      const simulatedKpiValue = simulatedKpiValues[goal.metricId];

      if (kpiDef && simulatedKpiValue !== undefined && typeof simulatedKpiValue === 'number') {
        let simulatedStatus: KpiGoal['status'] = 'in_progress'; // Default to in progress

        // Pragmatic goal evaluation: infer direction from description keywords or assume 'higher is better'
        const isReduceGoal = goal.description.toLowerCase().includes('reduce') || goal.description.toLowerCase().includes('keep below') || goal.description.toLowerCase().includes('lower');

        if (isReduceGoal) {
          if (simulatedKpiValue <= goal.targetValue) {
            simulatedStatus = 'achieved';
          } else if (simulatedKpiValue > goal.targetValue * 1.25) { // 25% over target is at risk
            simulatedStatus = 'at_risk';
          } else {
            simulatedStatus = 'in_progress';
          }
        } else { // Assume 'increase' or 'reach' goal by default
          if (simulatedKpiValue >= goal.targetValue) {
            simulatedStatus = 'achieved';
          } else if (simulatedKpiValue < goal.targetValue * 0.75) { // 25% below target is at risk
            simulatedStatus = 'at_risk';
          } else {
            simulatedStatus = 'in_progress';
          }
        }
        
        let statusChangeReason: string = "No significant change in goal status due to scenario.";
        if (simulatedStatus !== originalStatus) {
            const currentKpiOriginalValue = typeof currentKpiValues[goal.metricId] === 'number' ? (currentKpiValues[goal.metricId] as number).toFixed(2) : currentKpiValues[goal.metricId];
            statusChangeReason = `Goal status for '${kpiDef.name}' shifted from ${originalStatus.toUpperCase()} to ${simulatedStatus.toUpperCase()}. Original KPI: ${currentKpiOriginalValue}, Simulated KPI: ${simulatedKpiValue.toFixed(2)} (Target: ${goal.targetValue}).`;
        }

        goalImpacts.push({
          goalId: goal.goalId,
          goalDescription: goal.description,
          originalStatus: originalStatus,
          simulatedStatus: simulatedStatus,
          statusChangeReason: statusChangeReason,
        });
      }
    }

    // 4. Generate overall summary and strategic recommendations
    const affectedKpisCount = kpiImpacts.length;
    const goalsAtRiskCount = goalImpacts.filter(g => g.simulatedStatus === 'at_risk' && g.originalStatus !== 'at_risk').length;
    const goalsAchievedCount = goalImpacts.filter(g => g.simulatedStatus === 'achieved' && g.originalStatus !== 'achieved').length;
    
    let overallSummary = `A simulation of '${scenario.name}' (${scenario.type}, ${scenario.intensity} intensity, ${scenario.duration}) reveals significant enterprise-wide impacts.`;
    if (affectedKpisCount > 0) {
        overallSummary += ` ${affectedKpisCount} key performance indicators were directly affected.`;
    }
    if (goalsAtRiskCount > 0) {
        overallSummary += ` ${goalsAtRiskCount} strategic goals are now at risk or have been severely challenged.`;
    } else if (goalsAchievedCount > 0) {
        overallSummary += ` Surprisingly, ${goalsAchievedCount} goals were positively impacted or achieved under these conditions.`;
    } else {
        overallSummary += ` Most strategic goals maintained their original status, indicating some resilience or indirect impact.`
    }
    overallSummary += ` Detailed analysis below provides actionable insights for resilience building.`;


    const strategicRecommendations = [
      `Review core business model resilience against similar '${scenario.type}' events to prevent future shocks.`,
      `Develop robust contingency plans and adaptive strategies for critical KPIs and affected goals identified in this simulation.`,
      `Evaluate hedging strategies for financial, supply chain, or operational elements severely exposed by '${scenario.name}'.`,
      `Accelerate investment in technological upgrades to future-proof against potential '${scenario.type}' risks.`,
      `Consider policy adjustments, diversification of operations, or market segmentation to mitigate impacts from similar scenarios.`,
      `Engage cross-functional leadership to form a 'Disruption Response Task Force' based on these findings.`,
    ];

    const potentialAgentActions = [
      `Agent for 'Financial Risk Management' to model specific P&L impacts and propose mitigation actions for exposed assets.`,
      `Agent for 'Supply Chain Optimization' to identify and onboard alternative suppliers, or reroute logistics to reduce dependency.`,
      `Agent for 'Regulatory Compliance Automation' to update monitoring rules and assess new jurisdictional requirements.`,
      `Agent for 'Customer Retention & Communication' to develop proactive outreach strategies for at-risk customer segments.`,
      `Agent for 'Token Economy Rebalancing' to analyze tokenomics stability and propose adjustments to issuance or incentive mechanisms.`,
    ];

    return {
      scenario,
      simulationTimestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      kpiImpacts,
      goalImpacts,
      overallSummary,
      strategicRecommendations,
      potentialAgentActions,
    };
  }
}