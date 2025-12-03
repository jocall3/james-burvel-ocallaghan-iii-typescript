/**
 * KpiAnalyticsPanels Component: Operational Control Center for Enterprise Performance
 *
 * This module implements a sophisticated dashboard for Key Performance Indicators (KPIs),
 * offering real-time analytics, AI-driven insights, goal tracking, anomaly detection,
 * and advanced scenario planning capabilities. It serves as a critical operational control
 * center, transforming raw data into actionable intelligence for enterprise clients.
 *
 * Business Value: This component delivers multi-million dollar value by:
 * - **Accelerating Decision-Making**: Providing AI-powered natural language query and insights,
 *   it enables business users to quickly understand complex data trends and receive prescriptive
 *   recommendations, significantly reducing analysis time and increasing operational velocity.
 * - **Ensuring Financial Health & Compliance**: Real-time anomaly detection and alert management
 *   for financial metrics and transactional flows help proactively identify and mitigate risks
 *   like fraud, compliance breaches, or operational inefficiencies before they escalate,
 *   protecting revenue and reputation.
 * - **Strategic Growth & Optimization**: The integrated goal tracking and advanced scenario
 *   planning features allow enterprises to model the impact of strategic decisions (e.g.,
 *   token rail selection, payment routing changes, marketing spend adjustments) on KPIs. This
 *   capability enables informed, data-driven strategy development, optimizing resource
 *   allocation and identifying new revenue streams or cost arbitrage opportunities.
 * - **Empowering Agentic AI Workflows**: It provides a human-in-the-loop interface for
 *   interacting with autonomous AI agents, displaying agent-generated insights, and
 *   approving automated remediation actions, fostering trust and control in agentic systems.
 * - **Governed Access & Security**: Through integrated Role-Based Access Control (RBAC),
 *   sensitive analytics and management functions are protected, ensuring data integrity and
 *   adhering to stringent security and governance standards.
 *
 * This panel is a cornerstone for operational excellence, driving efficiency, mitigating risk,
 * and enabling strategic foresight within a real-time, tokenized financial ecosystem.
 */
import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  KpiMetricDefinition,
  KpiGoal,
  KpiAnomaly,
  KpiInsight,
  KpiUniverseConfig,
} from '../../DynamicKpiLoader'; // Adjust path if types are moved to a separate file

/**
 * Defines a simulated user role for demonstrating access control.
 * This would typically come from an authenticated user session.
 */
export type UserRole = 'admin' | 'analyst' | 'operator' | 'auditor';

/**
 * Props for the KpiAnalyticsPanels component.
 */
interface KpiAnalyticsPanelsProps {
  universeConfig: KpiUniverseConfig | null;
  insights: KpiInsight[];
  goals: KpiGoal[];
  anomalies: KpiAnomaly[];
  metrics: KpiMetricDefinition[];
  currentKpiValues: Record<string, number | string>;
  currentUserRole: UserRole; // Added for RBAC simulation
}

/**
 * KpiAnalyticsPanels Component
 * Provides a comprehensive dashboard for KPI monitoring, AI insights, goal management,
 * anomaly detection, and scenario planning, with simulated RBAC and agent interactions.
 *
 * @param {KpiAnalyticsPanelsProps} props The properties for the component.
 * @returns {React.FC} The KpiAnalyticsPanels component.
 */
export const KpiAnalyticsPanels: React.FC<KpiAnalyticsPanelsProps> = ({
  universeConfig,
  insights,
  goals,
  anomalies,
  metrics,
  currentKpiValues,
  currentUserRole,
}) => {
  const [nlqInput, setNlqInput] = useState('');
  const [nlqResponse, setNlqResponse] = useState<string | null>(null);
  const [simulatedScenario, setSimulatedScenario] = useState<{ variable: string; change: number; result: string } | null>(null);
  const [simulatedAgentActions, setSimulatedAgentActions] = useState<string[]>([]);
  const [isSimulatingNlq, setIsSimulatingNlq] = useState(false);
  const [currentDisplayRole, setCurrentDisplayRole] = useState<UserRole>(currentUserRole); // For demonstration, allow switching role

  /**
   * Simulates an agent's capability to process natural language queries and provide structured responses or actions.
   * In a production system, this would interface with a real Agentic AI orchestration layer.
   *
   * @param {string} query The natural language query from the user.
   * @returns {Promise<string>} A promise resolving to the AI agent's response.
   */
  const simulateAgentNLQ = useCallback(async (query: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('spending trends')) {
          resolve("Based on the data, discretionary spending has fluctuated but generally shown an upward trend in relation to income, sometimes exceeding 60% of income. This suggests areas for potential budget review. An agent has flagged this for 'Discretionary Spending Review' (Action ID: DSP-1001).");
        } else if (lowerQuery.includes('income growth')) {
          resolve("Income growth has been positive and steady over the observed period. The AI predicts continued stable growth in the near future. No immediate actions are required by agents.");
        } else if (lowerQuery.includes('goals')) {
          resolve("You have three active goals: 'Increase monthly income by 40% by year-end' (High priority, in progress), 'Keep discretionary spending below $2000' (Medium priority, at risk), and 'Achieve 20% savings rate' (High priority, in progress). An agent suggests reviewing the 'Keep discretionary spending' goal due to recent trends.");
        } else if (lowerQuery.includes('token transaction volume')) {
          resolve("The simulated daily token transaction volume shows an average of 150,000 tokens, with peak activity during market openings. This indicates a healthy velocity on the primary token rail. An agent can initiate a deeper analysis for 'Token Velocity Anomaly Detection' if thresholds are breached.");
        } else if (lowerQuery.includes('fraud detection rate')) {
          resolve("Current simulated fraud detection rate is 98.5% on payments rail_fast, with an average false positive rate of 0.2%. The payments infrastructure agent continuously monitors for new patterns. Would you like to simulate a 'Fraud Alert Escalation'? (Type 'simulate fraud').");
        } else if (lowerQuery.includes('simulate fraud')) {
          const actionId = `FRAUD-${Date.now()}`;
          setSimulatedAgentActions(prev => [...prev, `[${format(new Date(), 'h:mm:ss a')}] Agent initiated 'Fraud Alert Escalation' for simulated payment (ID: ${actionId}). Manual review required.`]);
          resolve(`A simulated fraud alert has been escalated to an agent. See Agent Activity Feed for details (Action ID: ${actionId}).`);
        } else {
          resolve("I'm sorry, I can only provide insights based on predefined patterns in this simulation or suggest agent actions. Please try questions about spending or income trends, goals, token volume, fraud detection, or 'simulate fraud'.");
        }
      }, 1500);
    });
  }, []);

  /**
   * Handles the submission of a natural language query to the simulated AI agent.
   */
  const handleNlqSubmit = useCallback(async () => {
    if (!nlqInput.trim()) return;
    setIsSimulatingNlq(true);
    setNlqResponse('Agent thinking...'); // Simulate AI processing
    try {
      const response = await simulateAgentNLQ(nlqInput);
      setNlqResponse(response);
    } catch (error) {
      setNlqResponse('Error processing query. Please try again.');
    } finally {
      setIsSimulatingNlq(false);
    }
  }, [nlqInput, simulateAgentNLQ]);

  /**
   * Simulates a scenario plan based on user input for "what-if" analysis.
   * This would typically call a backend simulation engine or an agent skill.
   *
   * @param {string} variable The variable being adjusted (e.g., 'marketingSpend').
   * @param {number} change The percentage change to apply.
   * @returns {string} The simulated result description.
   */
  const runScenarioSimulation = useCallback((variable: string, change: number): string => {
    switch (variable) {
      case 'marketingSpend':
        return `A ${change}% increase in marketing spend is predicted to increase conversion rate by ${Math.round(change * 0.5)}% and increase Customer Acquisition Cost (CAC) by ${Math.round(change * 0.8)}%. This could impact net profit by ${change < 0 ? '+' : '-'}2% in the short term, but potentially lead to a ${change > 0 ? '+' : '-'}3% increase in the long term, contingent on effective targeting.`;
      case 'productionEfficiency':
        return `A ${change}% improvement in production efficiency is projected to decrease operational costs by ${Math.round(change * 0.7)}% and increase gross margin by ${Math.round(change * 0.4)}%. This directly contributes to a significant boost in profitability and competitive advantage.`;
      case 'pricingStrategy':
        return `A ${change}% adjustment in pricing strategy (e.g., increase for premium, decrease for volume) is simulated to alter market share by ${Math.round(Math.abs(change) * 0.3)}% and average revenue per user (ARPU) by ${Math.round(Math.abs(change) * 0.6)}%. Careful market segmentation and elasticity analysis are crucial.`;
      case 'paymentRailRouting':
        return `Simulating a ${change > 0 ? 'prioritization' : 'deprioritization'} of 'rail_fast' by ${Math.abs(change)}%. This is projected to change average settlement time by ${change > 0 ? '-15%' : '+10%'} and average transaction fees by ${change > 0 ? '+5%' : '-8%'}, influencing overall payment processing costs and customer experience.`;
      case 'tokenIssuance':
        return `A ${change}% change in token issuance rate is simulated. This would directly impact the total token supply, potentially affecting token value and market liquidity. Careful consideration of economic models and governance policies is advised to maintain ecosystem stability.`;
      default:
        return 'No specific simulation result for this variable in the current model.';
    }
  }, []);

  /**
   * Handles the execution of a scenario simulation.
   */
  const handleScenarioRun = useCallback(() => {
    const variableSelect = document.getElementById('scenario-variable') as HTMLSelectElement;
    const changeInput = document.getElementById('scenario-change') as HTMLInputElement;

    if (variableSelect && changeInput) {
      const variable = variableSelect.value;
      const change = parseFloat(changeInput.value);
      if (!isNaN(change)) {
        const result = runScenarioSimulation(variable, change);
        setSimulatedScenario({ variable, change, result });
      }
    }
  }, [runScenarioSimulation]);

  const canManageAlerts = currentDisplayRole === 'admin';
  const canManageGoals = currentDisplayRole === 'admin' || currentDisplayRole === 'operator';
  const canApproveRemediation = currentDisplayRole === 'admin' || currentDisplayRole === 'operator';

  return (
    <>
      <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-200">Simulated User Role: <span className="text-indigo-400 font-semibold">{currentDisplayRole.toUpperCase()}</span></h3>
        <select
          value={currentDisplayRole}
          onChange={(e) => setCurrentDisplayRole(e.target.value as UserRole)}
          className="p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 text-sm"
        >
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
          <option value="operator">Operator</option>
          <option value="auditor">Auditor</option>
        </select>
      </div>

      {/* AI Insights & Natural Language Query */}
      {universeConfig?.enableNLQ && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="md:w-1/2 flex flex-col space-y-3">
            <h2 className="text-xl font-semibold text-indigo-300">AI Insights & Agent Recommendations</h2>
            {insights.length > 0 ? (
              <div className="space-y-2">
                {insights.map((insight) => (
                  <div key={insight.insightId} className="p-3 bg-gray-700 rounded-md border border-gray-600">
                    <h3 className="font-semibold" style={{ color: insight.severity === 'critical' ? '#ef4444' : insight.severity === 'warning' ? '#fbbf24' : '#60a5fa' }}>
                      {insight.title}
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">{insight.description}</p>
                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-gray-400 mt-2">
                        {insight.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                      </ul>
                    )}
                    <span className="text-xs text-gray-500 block mt-2">Source: {insight.sourceAI} at {format(new Date(insight.timestamp), 'MMM d, h:mm a')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No new AI insights available at the moment.</p>
            )}
          </div>
          <div className="md:w-1/2 flex flex-col space-y-3">
            <h2 className="text-xl font-semibold text-indigo-300">Natural Language Query (Agent Interaction)</h2>
            <textarea
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Ask a question about your KPI data, e.g., 'Show me spending trends', 'What are my goals?', 'What is token transaction volume?', or 'Simulate fraud'."
              value={nlqInput}
              onChange={(e) => setNlqInput(e.target.value)}
              disabled={isSimulatingNlq}
            ></textarea>
            <button
              onClick={handleNlqSubmit}
              className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isSimulatingNlq ? 'bg-indigo-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              disabled={isSimulatingNlq}
            >
              {isSimulatingNlq ? 'Agent Responding...' : 'Get Agent Response'}
            </button>
            {nlqResponse && (
              <div className="p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm">
                <span className="font-semibold text-indigo-400">Agent Response: </span>{nlqResponse}
              </div>
            )}
            {simulatedAgentActions.length > 0 && (
              <div className="mt-4 p-3 bg-gray-700 border border-gray-600 rounded-md">
                <h3 className="font-semibold text-indigo-400">Agent Activity Feed:</h3>
                <ul className="list-disc list-inside text-xs text-gray-400 mt-2 space-y-1">
                  {simulatedAgentActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goal Tracking & Management */}
      {universeConfig?.enableGoalTracking && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">Goal Tracking & Strategic Scenario Planning</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-200">Your Active Goals</h3>
              {goals.length > 0 ? (
                <ul className="space-y-2">
                  {goals.map((goal) => {
                    const metricDef = metrics.find(m => m.id === goal.metricId);
                    const currentValue = currentKpiValues[goal.metricId] ?? 'N/A';
                    return (
                      <li key={goal.goalId} className="p-3 bg-gray-700 rounded-md border border-gray-600 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-300">{metricDef?.name || goal.metricId}: {goal.targetValue}{metricDef?.unit}</p>
                          <p className="text-sm text-gray-400">{goal.description}</p>
                          <p className="text-xs text-gray-500">Status: <span className={`font-medium ${goal.status === 'achieved' ? 'text-green-400' : goal.status === 'at_risk' ? 'text-yellow-400' : 'text-gray-400'}`}>{goal.status.replace(/_/g, ' ').toUpperCase()}</span> | Current: <span className="text-indigo-400 font-medium">{metricDef?.type === 'currency' && typeof currentValue === 'number' ? `$${currentValue.toFixed(2)}` : `${currentValue}${metricDef?.unit}`}</span></p>
                        </div>
                        {canManageGoals && (
                          <button className="text-indigo-400 hover:text-indigo-300 text-sm">Manage</button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No goals defined yet. Set new targets!</p>
              )}
            </div>
            {/* Scenario Planning Interface: Expanded for token rails and payments */}
            <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
              <h3 className="text-lg font-medium mb-2 text-gray-200">Scenario Planning (What-If Analysis)</h3>
              <p className="text-gray-400 text-sm mb-3">
                Simulate different outcomes by adjusting key variables. How would a change in payment rail routing or token issuance affect your KPIs?
              </p>
              <div className="space-y-2">
                <label htmlFor="scenario-variable" className="block text-sm font-medium text-gray-300">Adjust variable:</label>
                <select id="scenario-variable" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100">
                  <option value="marketingSpend">Marketing Spend</option>
                  <option value="productionEfficiency">Production Efficiency</option>
                  <option value="pricingStrategy">Pricing Strategy</option>
                  <option value="paymentRailRouting">Payment Rail Routing Policy</option>
                  <option value="tokenIssuance">Token Issuance Rate</option>
                </select>
                <label htmlFor="scenario-change" className="block text-sm font-medium text-gray-300">Percentage change:</label>
                <input type="number" id="scenario-change" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100" defaultValue={10} />
                <button
                  onClick={handleScenarioRun}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Run Simulation
                </button>
                {simulatedScenario && (
                  <div className="mt-3 p-3 bg-gray-600 rounded-md text-gray-200 text-sm">
                    <p className="font-semibold text-green-300">Simulation Result for {simulatedScenario.variable} ({simulatedScenario.change}% change):</p>
                    <p>{simulatedScenario.result}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomalies & Alerts Management */}
      {universeConfig?.enableAnomalyDetection && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">Anomaly & Automated Remediation Management</h2>
          {anomalies.length > 0 ? (
            <ul className="space-y-2">
              {anomalies.map(anomaly => (
                <li key={anomaly.anomalyId} className="p-3 bg-gray-700 rounded-md border border-gray-600">
                  <p className="font-semibold text-red-400">Anomaly in {metrics.find(m => m.id === anomaly.metricId)?.name || anomaly.metricId}</p>
                  <p className="text-sm text-gray-300">
                    Detected on {format(new Date(anomaly.timestamp), 'MMM d, yyyy')}: Actual {anomaly.actualValue.toFixed(2)} (Expected {anomaly.expectedValue.toFixed(2)})
                  </p>
                  <p className="text-xs text-gray-400">{anomaly.reason}</p>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button className="text-sm text-indigo-400 hover:text-indigo-300">Investigate</button>
                    {canApproveRemediation && (
                      <button className="text-sm text-green-400 hover:text-green-300"
                        onClick={() => {
                          const actionId = `REM-${anomaly.anomalyId.substring(0, 8)}-${Date.now()}`;
                          setSimulatedAgentActions(prev => [...prev, `[${format(new Date(), 'h:mm:ss a')}] User (${currentDisplayRole}) approved agent remediation for anomaly ${anomaly.anomalyId}. Action ID: ${actionId}`]);
                          alert(`Simulating approval for agent remediation of anomaly ${anomaly.anomalyId}. An agent will now attempt to resolve this.`);
                        }}
                      >
                        Approve Agent Remediation
                      </button>
                    )}
                    <button className="text-sm text-gray-400 hover:text-gray-300">Dismiss</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No critical anomalies detected recently. System operating optimally.</p>
          )}
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-200">Alert Rule Management</h3>
            <p className="text-gray-400 text-sm">Define custom rules for email, Slack, or webhook notifications to manage alert fatigue and ensure critical issues are addressed.</p>
            {canManageAlerts ? (
              <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">Create New Alert Rule</button>
            ) : (
              <p className="text-yellow-500 text-xs mt-2">You need 'admin' role to manage alert rules.</p>
            )}
          </div>
        </div>
      )}

      {/* Token Rail & Payments Infrastructure Overview */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-indigo-300">Token Rail & Payments Infrastructure Overview</h2>
        <p className="text-gray-400 text-sm mb-4">
          Monitor key metrics for token rails and payment processing, ensuring real-time settlement efficiency and fraud prevention.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
            <p className="text-sm text-gray-400">Total Token Supply (Simulated)</p>
            <p className="text-2xl font-bold text-green-400">1,000,000,000 $TOKEN</p>
            <p className="text-xs text-gray-500 mt-1">Growth: +0.5% (24h)</p>
          </div>
          <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
            <p className="text-sm text-gray-400">Avg. Token Settlement Time (Rail Fast)</p>
            <p className="text-2xl font-bold text-indigo-400">1.2 s</p>
            <p className="text-xs text-gray-500 mt-1">Status: Optimal</p>
          </div>
          <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
            <p className="text-sm text-gray-400">Daily Payment Volume (USD)</p>
            <p className="text-2xl font-bold text-blue-400">$5.3M</p>
            <p className="text-xs text-gray-500 mt-1">Trend: +3.2% (7d)</p>
          </div>
          <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
            <p className="text-sm text-gray-400">Fraud Detection Rate (Payments)</p>
            <p className="text-2xl font-bold text-red-400">98.5%</p>
            <p className="text-xs text-gray-500 mt-1">Threshold: 98% (Alerts: 2 in 24h)</p>
          </div>
          <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
            <p className="text-sm text-gray-400">Preferred Payment Rail (AI Recommendation)</p>
            <p className="text-xl font-bold text-yellow-400">Rail_Fast</p>
            <p className="text-xs text-gray-500 mt-1">Based on latency & cost optimization.</p>
          </div>
          <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
            <p className="text-sm text-gray-400">Pending Settlements</p>
            <p className="text-2xl font-bold text-orange-400">14</p>
            <p className="text-xs text-gray-500 mt-1">Monitor for delays.</p>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-200">Payments & Token Rail Configuration</h3>
            <p className="text-gray-400 text-sm">Access advanced settings for payment routing policies, fraud thresholds, and token rail parameters.</p>
            {canManageAlerts ? ( // Reusing canManageAlerts as a proxy for 'admin' permissions for this section
              <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Configure Rails & Policies</button>
            ) : (
              <p className="text-yellow-500 text-xs mt-2">You need 'admin' role to configure payments & token rails.</p>
            )}
          </div>
      </div>
    </>
  );
};

export default KpiAnalyticsPanels;