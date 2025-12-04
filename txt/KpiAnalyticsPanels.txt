import React, { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
  KpiMetricDefinition,
  KpiGoal,
  KpiAnomaly,
  KpiInsight,
  KpiUniverseConfig,
} from '../../DynamicKpiLoader'; // Adjust path if types are moved to a separate file

interface KpiAnalyticsPanelsProps {
  universeConfig: KpiUniverseConfig | null;
  insights: KpiInsight[];
  goals: KpiGoal[];
  anomalies: KpiAnomaly[];
  metrics: KpiMetricDefinition[];
  currentKpiValues: Record<string, number | string>;
}

export const KpiAnalyticsPanels: React.FC<KpiAnalyticsPanelsProps> = ({
  universeConfig,
  insights,
  goals,
  anomalies,
  metrics,
  currentKpiValues,
}) => {
  const [nlqInput, setNlqInput] = useState('');
  const [nlqResponse, setNlqResponse] = useState<string | null>(null);

  const handleNlqSubmit = useCallback(async () => {
    if (!nlqInput.trim()) return;
    setNlqResponse('Thinking...'); // Simulate AI processing
    // In a real scenario, this would call an API to an NLQ engine
    setTimeout(() => {
      if (nlqInput.toLowerCase().includes('spending trends')) {
        setNlqResponse("Based on the data, discretionary spending has fluctuated but generally shown an upward trend in relation to income, sometimes exceeding 60% of income, indicated by red highlights. This suggests areas for potential budget review.");
      } else if (nlqInput.toLowerCase().includes('income growth')) {
        setNlqResponse("Income growth has been positive and steady over the observed period. The AI predicts continued stable growth in the near future.");
      } else if (nlqInput.toLowerCase().includes('goals')) {
        setNlqResponse("You have three active goals: 'Increase monthly income by 40% by year-end' (High priority, in progress), 'Keep discretionary spending below $2000' (Medium priority, at risk), and 'Achieve 20% savings rate' (High priority, in progress).");
      } else {
        setNlqResponse("I'm sorry, I can only provide insights based on predefined patterns in this simulation. Please try questions about spending or income trends, or goals.");
      }
    }, 1500);
  }, [nlqInput]);

  return (
    <>
      {/* AI Insights & Natural Language Query */}
      {universeConfig?.enableNLQ && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="md:w-1/2 flex flex-col space-y-3">
            <h2 className="text-xl font-semibold text-indigo-300">AI Insights & Recommendations</h2>
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
            <h2 className="text-xl font-semibold text-indigo-300">Natural Language Query</h2>
            <textarea
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Ask a question about your KPI data, e.g., 'Show me spending trends' or 'What are my goals?'"
              value={nlqInput}
              onChange={(e) => setNlqInput(e.target.value)}
            ></textarea>
            <button
              onClick={handleNlqSubmit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Get AI Response
            </button>
            {nlqResponse && (
              <div className="p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-300 text-sm">
                <span className="font-semibold text-indigo-400">AI Response: </span>{nlqResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goal Tracking & Management */}
      {universeConfig?.enableGoalTracking && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">Goal Tracking & Scenario Planning</h2>
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
                        <button className="text-indigo-400 hover:text-indigo-300 text-sm">Manage</button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">No goals defined yet. Set new targets!</p>
              )}
            </div>
            {/* Conceptual Scenario Planning Interface */}
            <div className="p-3 bg-gray-700 rounded-md border border-gray-600">
              <h3 className="text-lg font-medium mb-2 text-gray-200">Scenario Planning (What-If Analysis)</h3>
              <p className="text-gray-400 text-sm mb-3">
                Simulate different outcomes by adjusting key variables. How would a 10% increase in marketing spend affect conversion rates and customer acquisition costs?
              </p>
              <div className="space-y-2">
                <label htmlFor="scenario-variable" className="block text-sm font-medium text-gray-300">Adjust variable:</label>
                <select id="scenario-variable" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100">
                  <option value="marketingSpend">Marketing Spend</option>
                  <option value="productionEfficiency">Production Efficiency</option>
                  <option value="pricingStrategy">Pricing Strategy</option>
                </select>
                <label htmlFor="scenario-change" className="block text-sm font-medium text-gray-300">Percentage change:</label>
                <input type="number" id="scenario-change" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100" defaultValue={10} />
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                  Run Simulation
                </button>
                <div className="mt-3 p-3 bg-gray-600 rounded-md text-gray-200 text-sm">
                  <p className="font-semibold text-green-300">Simulation Result (Mock):</p>
                  <p>A 10% increase in marketing spend is predicted to increase conversion rate by 5% and increase CAC by 8%, potentially impacting net profit by -2% in the short term, but +3% in the long term.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomalies & Alerts Management */}
      {universeConfig?.enableAnomalyDetection && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">Anomaly & Alert Management</h2>
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
                    <button className="text-sm text-green-400 hover:text-green-300">Mark as Resolved</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No critical anomalies detected recently.</p>
          )}
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium mb-2 text-gray-200">Alert Rule Management</h3>
            <p className="text-gray-400 text-sm">Define custom rules for email, Slack, or webhook notifications.</p>
            <button className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">Create New Alert Rule</button>
          </div>
        </div>
      )}
    </>
  );
};

export default KpiAnalyticsPanels;