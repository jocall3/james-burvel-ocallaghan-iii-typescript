// Copyright James Burvel O’Callaghan III
// President CDBI AI Business Inc.

import React, { useState, useEffect, useMemo } from "react";
import LedgerAccountCategoriesEmptyState from "../containers/LedgerAccountCategoriesEmptyState";
import {
  LedgerAccountCategoriesHomeDocument,
  LedgerAccountCategoryChildrenDocument,
} from "../../generated/dashboard/graphqlSchema";
import ListView, { Node } from "./ListView";
import {
  getLedgerAccountCategorySearchComponents,
  mapLedgerAccountCategoryQueryToVariables,
  mapLedgerAccountCategoryQueryToNestingVariables,
} from "../../common/search_components/ledgerAccountCategorySearchComponents";
import {
  LEDGER_ACCOUNT_CATEGORY,
  LEDGER_ACCOUNT_CATEGORY_CHILD,
} from "../../generated/dashboard/types/resources";

const CONSTANT_QUERY_PARAMS = ["tab", "effective_at"];

// --- New Types and Interfaces for AI-powered features, KPIs, and charts ---

/**
 * Represents an AI-powered suggestion for categorizing a transaction.
 */
export interface AICategorySuggestion {
  id: string;
  transactionDescription: string;
  suggestedCategory: string;
  confidenceScore: number; // 0 to 1
  aiModelUsed: string;
  timestamp: string;
}

/**
 * Represents an anomaly detected by AI in a ledger category.
 */
export interface AnomalyReport {
  id: string;
  categoryId: string;
  categoryName: string;
  anomalyType: "volume" | "value" | "frequency" | "pattern";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  detectionTimestamp: string;
  recommendedAction?: string; // AI-suggested action
}

/**
 * Represents a predictive trend for a ledger category.
 */
export interface PredictiveTrend {
  categoryId: string;
  categoryName: string;
  period: "month" | "quarter" | "year";
  projectedGrowthRate: number; // percentage (e.g., 0.15 for 15%)
  predictedVolumeChange: number; // absolute monetary change
  predictionConfidence: number; // 0 to 1
  aiModelUsed: string;
}

/**
 * Represents an AI-generated recommendation for optimizing ledger categories.
 */
export interface OptimizationRecommendation {
  id: string;
  categoryId?: string; // Optional, for structural recommendations that affect multiple categories
  recommendationType: "consolidation" | "split" | "renaming" | "usage_guideline" | "automation";
  description: string;
  estimatedImpact: "low" | "medium" | "high";
  impactScore: number; // 0-100, AI-calculated impact
  aiModelUsed: string;
  generatedAt: string;
}

/**
 * Represents a Key Performance Indicator (KPI) for the dashboard.
 * Linked to Gemini for deeper analysis.
 */
export interface KPI {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  description: string;
  lastUpdated: string;
  trend?: "up" | "down" | "stable"; // Visual trend indicator
  geminiAnalysisLink?: string; // URL for a deep-dive analysis by Gemini
}

/**
 * Represents a single data point for a chart.
 */
export interface ChartDataPoint {
  label: string;
  value: number;
}

/**
 * Defines a chart to be displayed, with data and a Gemini analysis link.
 */
export interface ChartDefinition {
  id: string;
  title: string;
  type: "bar" | "line" | "pie" | "area"; // Basic chart types
  data: ChartDataPoint[];
  description: string;
  geminiAnalysisLink?: string; // URL for a deep-dive analysis by Gemini
}

/**
 * Encapsulates the complete AI insights dashboard data, including KPIs, charts, and a summary.
 */
export interface AIInsightsDashboardData {
  kpis: KPI[];
  charts: ChartDefinition[];
  summary: string; // AI-generated summary of the insights
  geminiOverallAnalysisLink?: string; // Overall link to Gemini's comprehensive report
}

// --- AI Service Mock Abstractions ---
// In a real commercial-grade application, these would be API calls to a robust backend service
// that integrates with Google Gemini or other specialized AI models for processing,
// model training, and inferencing. For self-contained file demo purposes,
// these functions simulate AI responses with mock data.

const mockAICategorizationSuggestions = (ledgerId: string): AICategorySuggestion[] => {
  // Simulate AI generating suggestions based on recent transactions for a given ledger
  // In a real scenario, this would query a transaction service and pass data to an NLP model.
  return [
    {
      id: "sugg_tx_12345",
      transactionDescription: "Starbucks Coffee - 12 Main St",
      suggestedCategory: "Food & Beverages",
      confidenceScore: 0.98,
      aiModelUsed: "CDBI-NLP-Categorizer-v3.2",
      timestamp: new Date().toISOString(),
    },
    {
      id: "sugg_tx_67890",
      transactionDescription: "Microsoft Azure Subscription Fee",
      suggestedCategory: "Cloud Services & Software",
      confidenceScore: 0.92,
      aiModelUsed: "CDBI-NLP-Categorizer-v3.2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "sugg_tx_54321",
      transactionDescription: "Uber Technologies - Ride to Airport",
      suggestedCategory: "Travel Expenses",
      confidenceScore: 0.85,
      aiModelUsed: "CDBI-NLP-Categorizer-v3.2",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "sugg_tx_98765",
      transactionDescription: "Donation to Local Charity Foundation",
      suggestedCategory: "Charitable Contributions",
      confidenceScore: 0.99,
      aiModelUsed: "CDBI-NLP-Categorizer-v3.2",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
    },
  ];
};

const mockAnomalyReports = (ledgerId: string): AnomalyReport[] => {
  // Simulate AI detecting anomalies in category usage patterns for a given ledger
  // This would typically involve time-series analysis and outlier detection models.
  return [
    {
      id: "anom_cat_001",
      categoryId: "CAT-OPS-001",
      categoryName: "Operational Software Licenses",
      anomalyType: "value",
      description: "Unusually high single transaction ($15,000) for operational software detected, 250% above average for this category.",
      severity: "high",
      detectionTimestamp: new Date().toISOString(),
      recommendedAction: "Verify purchase order and contract details for this transaction. Confirm vendor and license scope.",
    },
    {
      id: "anom_cat_002",
      categoryId: "CAT-MKG-003",
      categoryName: "Digital Marketing Campaigns",
      anomalyType: "frequency",
      description: "Sudden spike in small transactions (20+ unique vendors) within 'Digital Marketing Campaigns' category over past 24 hours.",
      severity: "medium",
      detectionTimestamp: new Date(Date.now() - 86400000).toISOString(),
      recommendedAction: "Review recent marketing initiatives and vendor onboarding process for unusual activity. Check for potential ad fraud.",
    },
    {
      id: "anom_cat_003",
      categoryId: "CAT-SAL-002",
      categoryName: "Sales Commission Payouts",
      anomalyType: "pattern",
      description: "Irregular payout pattern detected. Payout amount is consistent, but recipient IDs show unusual diversity for the period.",
      severity: "low",
      detectionTimestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      recommendedAction: "Cross-reference with HR and sales performance data. Minor anomaly, but worth monitoring.",
    },
  ];
};

const mockPredictiveTrends = (ledgerId: string): PredictiveTrend[] => {
  // Simulate AI predicting future trends in category activity for a given ledger
  // This would leverage advanced time-series forecasting models (e.g., ARIMA, Prophet, deep learning).
  return [
    {
      categoryId: "CAT-IT-001",
      categoryName: "Cloud Infrastructure Hosting",
      period: "quarter",
      projectedGrowthRate: 0.22, // 22% increase
      predictedVolumeChange: 18500, // +$18,500
      predictionConfidence: 0.91,
      aiModelUsed: "CDBI-TimeSeries-Forecast-v2.0",
    },
    {
      categoryId: "CAT-RND-001",
      categoryName: "Research & Development Costs",
      period: "month",
      projectedGrowthRate: 0.05, // 5% increase
      predictedVolumeChange: 3200, // +$3,200
      predictionConfidence: 0.88,
      aiModelUsed: "CDBI-TimeSeries-Forecast-v2.0",
    },
    {
      categoryId: "CAT-ADM-002",
      categoryName: "Office Supplies & Maintenance",
      period: "year",
      projectedGrowthRate: -0.03, // 3% decrease
      predictedVolumeChange: -1500, // -$1,500 (due to remote work trends)
      predictionConfidence: 0.75,
      aiModelUsed: "CDBI-TimeSeries-Forecast-v2.0",
    },
  ];
};

const mockOptimizationRecommendations = (ledgerId: string): OptimizationRecommendation[] => {
  // Simulate AI generating recommendations to optimize ledger category structure and usage.
  // This could use graph analysis, clustering, and rule-mining AI techniques.
  return [
    {
      id: "opt_001",
      categoryId: "CAT-EXP-TRAV",
      recommendationType: "consolidation",
      description: "Consolidate 'Domestic Travel' and 'International Travel' into a single 'Business Travel Expenses' category for simplified reporting and policy application.",
      estimatedImpact: "high",
      impactScore: 88,
      aiModelUsed: "CDBI-Category-Optimizer-v1.1",
      generatedAt: new Date().toISOString(),
    },
    {
      id: "opt_002",
      recommendationType: "automation",
      description: "Implement automated categorization rules for recurring vendor payments like 'Zoom Communications' to 'Subscription Services' based on historical patterns.",
      estimatedImpact: "high",
      impactScore: 95,
      aiModelUsed: "CDBI-Category-Optimizer-v1.1",
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "opt_003",
      categoryId: "CAT-IT-HRD",
      recommendationType: "renaming",
      description: "Rename 'IT Hardware' to 'IT Equipment & Assets' to better reflect the inclusion of leased and capitalized IT resources.",
      estimatedImpact: "medium",
      impactScore: 70,
      aiModelUsed: "CDBI-Category-Optimizer-v1.1",
      generatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
};

/**
 * Simulates fetching insights from a powerful AI model like Google Gemini.
 * In a production environment, this would involve a secure API call to a backend
 * service that orchestrates the interaction with the Gemini API, sending specific
 * context and data for advanced analysis and response generation.
 *
 * @param context - A string describing the type of analysis requested (e.g., "AI-Powered Categorization Suggestions").
 * @param data - The relevant data payload for Gemini to analyze (e.g., list of suggestions, anomaly reports).
 * @returns A promise resolving to an AIInsightsDashboardData object with KPIs, charts, and a summary.
 */
export const fetchGeminiInsights = async (
  context: string,
  data: any
): Promise<AIInsightsDashboardData> => {
  console.log("CDBI AI connecting to Gemini for insights with context:", context, "and data:", data);

  // Simulate API call delay and processing time
  await new Promise((resolve) => setTimeout(resolve, 1500));

  let kpis: KPI[] = [];
  let charts: ChartDefinition[] = [];
  let summary = "Gemini AI is analyzing this data to provide the most relevant and advanced financial intelligence. Please note that the current insights are mock data, simulating real-world Gemini capabilities.";
  let geminiOverallAnalysisLink = `/gemini/overview?ledgerId=${data.ledgerId || 'unknown'}&context=${encodeURIComponent(context)}`;

  if (context.includes("Categorization Suggestions")) {
    const totalSuggestions = data.length;
    const avgConfidence = totalSuggestions > 0 ? (data.reduce((sum: number, s: AICategorySuggestion) => sum + s.confidenceScore, 0) / totalSuggestions) * 100 : 0;
    kpis = [
      { id: "sugg_kpi1", name: "Total Suggestions", value: totalSuggestions, description: "Number of AI-generated categorization suggestions in the last 24 hours.", lastUpdated: new Date().toLocaleTimeString(), geminiAnalysisLink: "/gemini/suggestion-count-analysis" },
      { id: "sugg_kpi2", name: "Avg. Confidence", value: avgConfidence.toFixed(1), unit: "%", description: "Average confidence score of AI-generated suggestions. Higher is better.", lastUpdated: new Date().toLocaleTimeString(), trend: avgConfidence > 90 ? "up" : "stable", geminiAnalysisLink: "/gemini/confidence-breakdown" },
      { id: "sugg_kpi3", name: "Automation Rate", value: "78.2", unit: "%", description: "Percentage of transactions automatically categorized by AI.", lastUpdated: new Date().toLocaleTimeString(), trend: "up", geminiAnalysisLink: "/gemini/automation-rate-details" },
    ];
    charts = [
      { id: "sugg_chart1", title: "Suggestion Confidence Distribution", type: "pie", data: [{ label: "High (90%+)", value: 70 }, { label: "Medium (70-90%)", value: 25 }, { label: "Low (<70%)", value: 5 }], description: "Distribution of AI suggestion confidence scores across recent transactions.", geminiAnalysisLink: "/gemini/suggestion-confidence-chart" },
      { id: "sugg_chart2", title: "Categorization Efficiency Trend", type: "line", data: [{ label: "Mon", value: 65 }, { label: "Tue", value: 70 }, { label: "Wed", value: 75 }, { label: "Thu", value: 78 }], description: "Weekly trend of AI categorization accuracy and efficiency.", geminiAnalysisLink: "/gemini/efficiency-trend-chart" },
    ];
    summary = `Gemini AI analysis highlights a robust categorization engine, with an average confidence of ${avgConfidence.toFixed(1)}% and a 78.2% automation rate. Focus on refining rules for low-confidence suggestions for maximum efficiency.`;
    geminiOverallAnalysisLink = `/gemini/categorization-insights?ledgerId=${data.ledgerId || 'unknown'}`;
  } else if (context.includes("Anomaly Detection")) {
    const totalAnomalies = data.length;
    const criticalAnomalies = data.filter((a: AnomalyReport) => a.severity === "critical").length;
    kpis = [
      { id: "anom_kpi1", name: "Total Anomalies Detected", value: totalAnomalies, description: "Total number of unusual activities flagged by AI in the last 7 days.", lastUpdated: new Date().toLocaleTimeString(), geminiAnalysisLink: "/gemini/anomaly-count-analysis" },
      { id: "anom_kpi2", name: "Critical Alerts", value: criticalAnomalies, description: "Number of high-severity anomalies requiring immediate attention.", lastUpdated: new Date().toLocaleTimeString(), trend: criticalAnomalies > 0 ? "up" : "stable", geminiAnalysisLink: "/gemini/critical-anomaly-drilldown" },
      { id: "anom_kpi3", name: "False Positive Rate", value: "2.1", unit: "%", description: "Percentage of AI-flagged anomalies that were later deemed normal.", lastUpdated: new Date().toLocaleTimeString(), trend: "down", geminiAnalysisLink: "/gemini/false-positive-analysis" },
    ];
    charts = [
      { id: "anom_chart1", title: "Anomaly Severity Distribution", type: "bar", data: [{ label: "Critical", value: criticalAnomalies }, { label: "High", value: data.filter((a: AnomalyReport) => a.severity === "high").length }, { label: "Medium", value: data.filter((a: AnomalyReport) => a.severity === "medium").length }, { label: "Low", value: data.filter((a: AnomalyReport) => a.severity === "low").length }], description: "Breakdown of anomaly severities identified by AI.", geminiAnalysisLink: "/gemini/anomaly-severity-chart" },
      { id: "anom_chart2", title: "Anomalies Over Time", type: "line", data: [{ label: "Day 1", value: 3 }, { label: "Day 2", value: 5 }, { label: "Day 3", value: 2 }, { label: "Day 4", value: 4 }], description: "Trend of anomaly detections over the past few days.", geminiAnalysisLink: "/gemini/anomaly-trend-chart" },
    ];
    summary = `Gemini AI has detected ${totalAnomalies} anomalies, with ${criticalAnomalies} critical alerts. The system maintains a low false positive rate of 2.1%. Recommendations for 'Operational Software Licenses' and 'Digital Marketing Campaigns' are high priority.`;
    geminiOverallAnalysisLink = `/gemini/anomaly-detection-insights?ledgerId=${data.ledgerId || 'unknown'}`;
  } else if (context.includes("Predictive Category Trends")) {
    const avgGrowth = data.reduce((sum: number, t: PredictiveTrend) => sum + t.projectedGrowthRate, 0) / data.length;
    const totalPredictedVolumeChange = data.reduce((sum: number, t: PredictiveTrend) => sum + t.predictedVolumeChange, 0);
    kpis = [
      { id: "pred_kpi1", name: "Avg. Projected Growth", value: (avgGrowth * 100).toFixed(1), unit: "%", description: "Average projected growth rate across all actively monitored categories.", lastUpdated: new Date().toLocaleTimeString(), geminiAnalysisLink: "/gemini/avg-growth-analysis" },
      { id: "pred_kpi2", name: "Total Predicted Change", value: totalPredictedVolumeChange.toLocaleString(), unit: "$", description: "Sum of predicted monetary changes across all categories.", lastUpdated: new Date().toLocaleTimeString(), trend: totalPredictedVolumeChange > 0 ? "up" : "stable", geminiAnalysisLink: "/gemini/total-volume-change-analysis" },
      { id: "pred_kpi3", name: "Prediction Accuracy", value: "90.5", unit: "%", description: "Historical accuracy of AI predictions for category trends.", lastUpdated: new Date().toLocaleTimeString(), trend: "up", geminiAnalysisLink: "/gemini/prediction-accuracy-metrics" },
    ];
    charts = [
      { id: "pred_chart1", title: "Projected Growth by Category (Next Quarter)", type: "bar", data: data.map((t: PredictiveTrend) => ({ label: t.categoryName, value: (t.projectedGrowthRate * 100).toFixed(1) as any })), description: "Predicted growth rates for key ledger categories for the upcoming period.", geminiAnalysisLink: "/gemini/projected-growth-chart" },
      { id: "pred_chart2", title: "Prediction Confidence Distribution", type: "pie", data: [{ label: "High (90%+)", value: 60 }, { label: "Medium (70-90%)", value: 30 }, { label: "Low (<70%)", value: 10 }], description: "Distribution of AI model confidence in its trend predictions.", geminiAnalysisLink: "/gemini/prediction-confidence-chart" },
    ];
    summary = `Gemini forecasts an average category growth of ${(avgGrowth * 100).toFixed(1)}% with high accuracy. Significant growth is predicted for 'Cloud Infrastructure Hosting'. Proactive budgeting is recommended.`;
    geminiOverallAnalysisLink = `/gemini/predictive-trends-insights?ledgerId=${data.ledgerId || 'unknown'}`;
  } else if (context.includes("Category Optimization")) {
    const totalRecommendations = data.length;
    const highImpactRecs = data.filter((r: OptimizationRecommendation) => r.estimatedImpact === "high").length;
    kpis = [
      { id: "opt_kpi1", name: "Total Recommendations", value: totalRecommendations, description: "Number of AI-generated optimization recommendations available.", lastUpdated: new Date().toLocaleTimeString(), geminiAnalysisLink: "/gemini/rec-count-analysis" },
      { id: "opt_kpi2", name: "High Impact Recs", value: highImpactRecs, description: "Recommendations with high estimated impact on efficiency or compliance.", lastUpdated: new Date().toLocaleTimeString(), trend: highImpactRecs > 0 ? "up" : "stable", geminiAnalysisLink: "/gemini/high-impact-drilldown" },
      { id: "opt_kpi3", name: "Adoption Rate", value: "65.0", unit: "%", description: "Percentage of AI recommendations that have been implemented.", lastUpdated: new Date().toLocaleTimeString(), trend: "up", geminiAnalysisLink: "/gemini/adoption-rate-analysis" },
    ];
    charts = [
      { id: "opt_chart1", title: "Recommendation Impact Distribution", type: "pie", data: [{ label: "High", value: highImpactRecs }, { label: "Medium", value: data.filter((r: OptimizationRecommendation) => r.estimatedImpact === "medium").length }, { label: "Low", value: data.filter((r: OptimizationRecommendation) => r.estimatedImpact === "low").length }], description: "Distribution of AI recommendation impacts.", geminiAnalysisLink: "/gemini/rec-impact-chart" },
      { id: "opt_chart2", title: "Recommendation Type Breakdown", type: "bar", data: [{ label: "Consolidation", value: 1 }, { label: "Automation", value: 1 }, { label: "Renaming", value: 1 }], description: "Breakdown of recommendations by type (e.g., consolidation, automation).", geminiAnalysisLink: "/gemini/rec-type-chart" },
    ];
    summary = `Gemini has identified ${totalRecommendations} optimization opportunities. Prioritizing 'consolidation' and 'automation' recommendations can lead to significant efficiency gains, as evidenced by the 65% adoption rate.`;
    geminiOverallAnalysisLink = `/gemini/category-optimization-insights?ledgerId=${data.ledgerId || 'unknown'}`;
  } else { // Default/Overall context
    kpis = [
      { id: "general_kpi1", name: "Total Categories", value: 150, description: "Total number of ledger account categories currently defined.", lastUpdated: new Date().toLocaleTimeString(), geminiAnalysisLink: "/gemini/total-categories-analysis" },
      { id: "general_kpi2", name: "AI Coverage", value: "98", unit: "%", description: "Percentage of ledger categories actively monitored by CDBI AI models.", lastUpdated: new Date().toLocaleTimeString(), trend: "up", geminiAnalysisLink: "/gemini/ai-coverage-details" },
      { id: "general_kpi3", name: "Avg. AI Score", value: "88.7", description: "Overall average AI intelligence score across all category functions.", lastUpdated: new Date().toLocaleTimeString(), trend: "up", geminiAnalysisLink: "/gemini/ai-score-breakdown" },
    ];
    charts = [
      { id: "general_chart1", title: "Category Health Score Distribution", type: "bar", data: [{ label: "Excellent", value: 40 }, { label: "Good", value: 35 }, { label: "Fair", value: 20 }, { label: "Needs Attention", value: 5 }], description: "Distribution of AI-assessed health scores for ledger categories.", geminiAnalysisLink: "/gemini/category-health-chart" },
      { id: "general_chart2", title: "AI Model Activity by Type", type: "pie", data: [{ label: "NLP Categorization", value: 40 }, { label: "Anomaly Detection", value: 30 }, { label: "Predictive", value: 20 }, { label: "Optimization", value: 10 }], description: "Breakdown of AI model activity across different functions.", geminiAnalysisLink: "/gemini/ai-model-activity-chart" },
    ];
    summary = `Gemini AI provides a comprehensive overview of your ledger account categories, with 98% AI coverage ensuring optimal financial intelligence and proactive management across all functions.`;
    geminiOverallAnalysisLink = `/gemini/overall-ledger-categories-insights?ledgerId=${data.ledgerId || 'unknown'}`;
  }

  return { kpis, charts, summary, geminiOverallAnalysisLink };
};

// --- UI Components for AI Features, KPIs, and Charts ---

/**
 * A simple placeholder for a charting component. In a real-world application,
 * this would integrate with a robust charting library like Recharts, Chart.js, or D3.
 */
const GenericChart: React.FC<{ chart: ChartDefinition }> = ({ chart }) => {
  const chartStyle: React.CSSProperties = {
    width: '100%',
    height: '250px',
    backgroundColor: '#fff',
    border: '1px solid #e0e7ff', // Lighter blue border
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#6b7280', // Gray-600
    flexDirection: 'column',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  };

  const dataRepresentation = chart.data.map(d => `${d.label}: ${d.value}${chart.type === 'pie' || chart.title.includes('Growth') ? '%' : ''}`).join('; ');

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">{chart.title}</h4>
      <div style={chartStyle} className="flex-grow">
        <p className="font-bold text-lg text-indigo-700">{chart.type.toUpperCase()} Chart</p>
        <p className="text-sm text-gray-500 mt-1">Data: [{dataRepresentation}]</p>
        <p className="text-xs text-gray-400 mt-2">({chart.description})</p>
      </div>
      {chart.geminiAnalysisLink && (
        <a href={chart.geminiAnalysisLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-3 block text-right">
          View Gemini Deep Dive →
        </a>
      )}
    </div>
  );
};

/**
 * Displays a collection of Key Performance Indicators in a visually appealing grid.
 */
export const CategoryKPIs: React.FC<{ kpis: KPI[] }> = ({ kpis }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {kpis.map((kpi) => (
      <div key={kpi.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md border border-indigo-100 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-sm font-medium text-indigo-700 uppercase tracking-wide">{kpi.name}</h3>
          <p className="mt-2 text-4xl font-extrabold text-gray-900 flex items-baseline">
            {kpi.value} {kpi.unit && <span className="ml-1 text-xl font-semibold text-gray-500">{kpi.unit}</span>}
            {kpi.trend && (
              <span className={`ml-3 text-sm font-bold flex items-center ${kpi.trend === "up" ? "text-green-600" : kpi.trend === "down" ? "text-red-600" : "text-gray-500"}`}>
                {kpi.trend === "up" ? "▲" : kpi.trend === "down" ? "▼" : "—"}
              </span>
            )}
          </p>
          <p className="mt-3 text-xs text-gray-600">{kpi.description}</p>
        </div>
        <div className="mt-4 pt-2 border-t border-indigo-100 text-xs text-gray-500 flex justify-between items-center">
          <span>Last updated: {kpi.lastUpdated}</span>
          {kpi.geminiAnalysisLink && (
            <a href={kpi.geminiAnalysisLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">
              Gemini Insights →
            </a>
          )}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Displays a collection of ChartDefinitions using the GenericChart component.
 */
export const CategoryCharts: React.FC<{ charts: ChartDefinition[] }> = ({ charts }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    {charts.map((chart) => (
      <GenericChart key={chart.id} chart={chart} />
    ))}
  </div>
);

/**
 * Component for displaying AI-powered categorization suggestions.
 */
export const AICategorizationSuggestionPanel: React.FC<{ ledgerId: string }> = ({ ledgerId }) => {
  const [suggestions, setSuggestions] = useState<AICategorySuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const data = mockAICategorizationSuggestions(ledgerId);
    setSuggestions(data);
    setLoading(false);
  }, [ledgerId]);

  if (loading) return <div className="text-center py-8 text-indigo-700">Loading AI categorization suggestions...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Categorization Suggestions</h3>
      <p className="text-gray-700 mb-6">
        CDBI AI automatically analyzes transaction descriptions and suggests the most appropriate ledger categories, enhancing efficiency and accuracy across your financial operations.
      </p>
      {suggestions.length === 0 ? (
        <p className="text-gray-500 italic py-4">No new AI categorization suggestions at this time. All recent transactions appear to be correctly categorized or awaiting manual review.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {suggestions.map((s) => (
            <li key={s.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-2 sm:mb-0">
                <p className="font-medium text-gray-800 text-base">{s.transactionDescription}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Suggested Category: <span className="font-semibold text-indigo-700">{s.suggestedCategory}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Confidence: <span className="font-semibold">{(s.confidenceScore * 100).toFixed(1)}%</span> (Model: {s.aiModelUsed})</p>
              </div>
              <button className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                Apply Suggestion
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Component for displaying AI-powered anomaly detection reports.
 */
export const AnomalyDetectionDashboard: React.FC<{ ledgerId: string }> = ({ ledgerId }) => {
  const [anomalies, setAnomalies] = useState<AnomalyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const data = mockAnomalyReports(ledgerId);
    setAnomalies(data);
    setLoading(false);
  }, [ledgerId]);

  if (loading) return <div className="text-center py-8 text-red-700">Scanning for AI-detected anomalies...</div>;

  const severityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Anomaly Detection</h3>
      <p className="text-gray-700 mb-6">
        CDBI AI continuously monitors ledger categories for unusual patterns in volume, value, or frequency, providing early alerts to potential financial risks or opportunities.
      </p>
      {anomalies.length === 0 ? (
        <p className="text-gray-500 italic py-4">No significant anomalies detected recently. Your ledger categories appear stable.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {anomalies.map((a) => (
            <li key={a.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-2 sm:mb-0">
                <p className="font-medium text-gray-800 text-base flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${severityColors[a.severity]}`}></span>
                  Anomaly in <span className="font-semibold text-purple-700 ml-1">{a.categoryName}</span> (Type: {a.anomalyType.toUpperCase()})
                </p>
                <p className="text-sm text-gray-600 mt-1">{a.description}</p>
                {a.recommendedAction && (
                  <p className="text-xs text-gray-500 mt-1">AI Recommendation: <span className="italic font-medium">{a.recommendedAction}</span></p>
                )}
                <p className="text-xs text-gray-400 mt-1">Detected: {new Date(a.detectionTimestamp).toLocaleString()}</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150">
                Investigate Anomaly
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Component for displaying AI-powered predictive category trends.
 */
export const PredictiveCategoryTrends: React.FC<{ ledgerId: string }> = ({ ledgerId }) => {
  const [trends, setTrends] = useState<PredictiveTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const data = mockPredictiveTrends(ledgerId);
    setTrends(data);
    setLoading(false);
  }, [ledgerId]);

  if (loading) return <div className="text-center py-8 text-blue-700">Generating AI predictive trends...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Predictive Category Trends</h3>
      <p className="text-gray-700 mb-6">
        CDBI AI forecasts future activity in your ledger categories, empowering you to anticipate changes, plan resources, and make proactive financial decisions with confidence.
      </p>
      {trends.length === 0 ? (
        <p className="text-gray-500 italic py-4">No significant predictive trends identified at this moment. All categories show stable, predictable patterns.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((t) => (
            <div key={t.categoryId + t.period} className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm flex flex-col justify-between h-full">
              <div>
                <p className="font-semibold text-blue-800 text-lg mb-1">{t.categoryName}</p>
                <p className="text-sm text-gray-700">
                  Projected Growth ({t.period} ahead):{" "}
                  <span className={`font-bold ${t.projectedGrowthRate >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {(t.projectedGrowthRate * 100).toFixed(1)}%
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Predicted Volume Change: <span className="font-medium text-gray-800">${t.predictedVolumeChange.toLocaleString()}</span>
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-blue-100 text-xs text-gray-500 flex justify-between items-center">
                <span>Confidence: <span className="font-medium text-blue-700">{(t.predictionConfidence * 100).toFixed(1)}%</span></span>
                <span>Model: {t.aiModelUsed}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Component for displaying AI-powered category optimization recommendations.
 */
export const CategoryOptimizationRecommendations: React.FC<{ ledgerId: string }> = ({ ledgerId }) => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const data = mockOptimizationRecommendations(ledgerId);
    setRecommendations(data);
    setLoading(false);
  }, [ledgerId]);

  if (loading) return <div className="text-center py-8 text-green-700">Analyzing for AI optimization recommendations...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Category Optimization</h3>
      <p className="text-gray-700 mb-6">
        CDBI AI analyzes your category structure and usage patterns to suggest intelligent improvements for enhanced clarity, operational efficiency, and regulatory compliance.
      </p>
      {recommendations.length === 0 ? (
        <p className="text-gray-500 italic py-4">No new AI optimization recommendations available at this time. Your category structure is highly optimized.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {recommendations.map((r) => (
            <li key={r.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-2 sm:mb-0">
                <p className="font-medium text-gray-800 text-base flex items-center">
                  <span className="text-indigo-600 font-bold mr-2 text-xs px-2 py-1 bg-indigo-50 rounded-full">{r.recommendationType.replace(/_/g, ' ').toUpperCase()}</span>
                  {r.categoryId && <span className="text-gray-600 mr-1">Category: <span className="font-medium">{r.categoryId}</span> - </span>}
                  {r.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Estimated Impact: <span className={`font-semibold ${r.estimatedImpact === 'high' ? 'text-green-600' : r.estimatedImpact === 'medium' ? 'text-yellow-600' : 'text-gray-600'}`}>{r.estimatedImpact.toUpperCase()}</span> (Score: {r.impactScore}/100)
                </p>
                <p className="text-xs text-gray-400 mt-1">Generated: {new Date(r.generatedAt).toLocaleDateString()} by {r.aiModelUsed}</p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150">
                Implement Recommendation
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Main panel to display AI insights powered by Gemini, including KPIs and charts.
 * This component acts as the central hub for AI-driven analytics, adapting its content
 * based on the 'context' and 'data' provided.
 */
export const GeminiInsightsPanel: React.FC<{
  ledgerId: string;
  context: string;
  data: any; // Data relevant to the context for Gemini analysis (e.g., list of anomalies)
}> = ({ ledgerId, context, data }) => {
  const [insights, setInsights] = useState<AIInsightsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchGeminiInsights(context, data);
        setInsights(result);
      } catch (err) {
        console.error("CDBI AI failed to fetch Gemini insights:", err);
        setError("Failed to load Gemini insights. Please check your connection or try again later.");
      } finally {
        setLoading(false);
      }
    };
    getInsights();
  }, [ledgerId, context, data]); // Dependencies for re-fetching insights

  if (loading) {
    return (
      <div className="bg-blue-50 p-8 rounded-xl shadow-md mt-6 text-center text-blue-700 border border-blue-100">
        <p className="mb-4 text-lg font-medium">Connecting to CDBI AI powered by Gemini for deep insights...</p>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-sm text-blue-600">Analyzing {context} data to generate real-time financial intelligence.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-8 rounded-xl shadow-md mt-6 text-center text-red-700 border border-red-100">
        <p className="font-semibold text-lg mb-2">Error Loading AI Insights</p>
        <p>{error}</p>
        <p className="mt-2 text-sm">Please refresh the page or contact support if the issue persists.</p>
      </div>
    );
  }

  if (!insights || (insights.kpis.length === 0 && insights.charts.length === 0 && !insights.summary)) {
    return (
      <div className="bg-gray-50 p-8 rounded-xl shadow-md mt-6 text-center text-gray-600 border border-gray-100">
        <p className="font-semibold text-lg mb-2">No Gemini Insights Available</p>
        <p>CDBI AI couldn't generate specific insights for this selection at the moment. This might be due to insufficient data or ongoing analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-6 rounded-xl shadow-md mt-6 border border-blue-100">
      <h3 className="text-3xl font-bold text-blue-900 mb-5 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636 6.364l-.707-.707M6.343 17.657l-.707.707M12 21v-1m-4.673-4.673L7.24 17.657m6.343-6.343L12 17l-1.67-1.67m1.67-6.343L17 12l1.67-1.67M12 7.343L7.24 12l-1.67-1.67m6.343 6.343L17 12l1.67 1.67M12 17l-4.67-4.67" />
        </svg>
        CDBI AI: <span className="ml-2 text-blue-700">{context} Insights</span>
      </h3>
      <p className="text-blue-800 text-lg mb-6 italic border-b border-blue-200 pb-4">{insights.summary}</p>

      {insights.kpis.length > 0 && (
        <>
          <h4 className="text-xl font-semibold text-blue-800 mb-4">Key Performance Indicators</h4>
          <CategoryKPIs kpis={insights.kpis} />
        </>
      )}

      {insights.charts.length > 0 && (
        <>
          <h4 className="text-xl font-semibold text-blue-800 mt-8 mb-4">Visualizations & Trends</h4>
          <CategoryCharts charts={insights.charts} />
        </>
      )}
      {insights.geminiOverallAnalysisLink && (
        <div className="mt-8 text-right pt-4 border-t border-blue-200">
          <a href={insights.geminiOverallAnalysisLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium text-base">
            Explore Comprehensive Gemini AI Report →
          </a>
        </div>
      )}
    </div>
  );
};

// --- Main LedgerAccountCategoriesHome Component ---

/**
 * Defines the available tabs for the LedgerAccountCategoriesHome interface,
 * including both the original list view and the new AI-powered features.
 */
export enum CategoryHomeTab {
  CategoriesList = "Categories List",
  AICategorization = "AI Categorization",
  AnomalyDetection = "Anomaly Detection",
  PredictiveTrends = "Predictive Trends",
  OptimizationRecommendations = "Optimization Recommendations",
}

/**
 * The main component for displaying and managing ledger account categories.
 * This enhanced version integrates multiple AI-powered features,
 * providing a comprehensive and intelligent financial management solution.
 */
function LedgerAccountCategoriesHome({
  ledgerId,
  initialShowSearchArea,
}: {
  ledgerId: string;
  initialShowSearchArea: boolean;
}) {
  const searchComponents = getLedgerAccountCategorySearchComponents();
  const [activeTab, setActiveTab] = useState<CategoryHomeTab>(CategoryHomeTab.CategoriesList);

  // States to hold AI feature data, which will be passed to Gemini for analysis
  const [aiSuggestions, setAiSuggestions] = useState<AICategorySuggestion[]>([]);
  const [anomalyReports, setAnomalyReports] = useState<AnomalyReport[]>([]);
  const [predictiveTrends, setPredictiveTrends] = useState<PredictiveTrend[]>([]);
  const [optimizationRecommendations, setOptimizationRecommendations] = useState<OptimizationRecommendation[]>([]);

  // Simulate initial data fetching for AI components
  useEffect(() => {
    // In a real application, these would be fetched from a backend API
    // that orchestrates AI model calls.
    setAiSuggestions(mockAICategorizationSuggestions(ledgerId));
    setAnomalyReports(mockAnomalyReports(ledgerId));
    setPredictiveTrends(mockPredictiveTrends(ledgerId));
    setOptimizationRecommendations(mockOptimizationRecommendations(ledgerId));
  }, [ledgerId]); // Re-fetch AI data if ledgerId changes

  // Memoized data and context for the Gemini Insights Panel,
  // ensures Gemini analysis is only triggered when relevant data or tab changes.
  const geminiContextData = useMemo(() => {
    switch (activeTab) {
      case CategoryHomeTab.AICategorization:
        return { context: "AI-Powered Categorization Suggestions", data: aiSuggestions };
      case CategoryHomeTab.AnomalyDetection:
        return { context: "AI-Powered Anomaly Detection", data: anomalyReports };
      case CategoryHomeTab.PredictiveTrends:
        return { context: "AI-Powered Predictive Category Trends", data: predictiveTrends };
      case CategoryHomeTab.OptimizationRecommendations:
        return { context: "AI-Powered Category Optimization", data: optimizationRecommendations };
      case CategoryHomeTab.CategoriesList:
      default:
        // Provide a general context for the categories list, passing ledgerId for overall insights
        return { context: "Overall Ledger Account Category Performance", data: { ledgerId: ledgerId } };
    }
  }, [activeTab, ledgerId, aiSuggestions, anomalyReports, predictiveTrends, optimizationRecommendations]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
        CDBI AI: Advanced Ledger Account Management
      </h1>

      {/* Tabs for navigating between core categories list and AI-powered features */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-10" aria-label="Tabs">
          {Object.values(CategoryHomeTab).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-700 font-bold"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 text-base font-medium transition duration-150 ease-in-out focus:outline-none`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Gemini Insights Panel: Always visible and dynamically updates based on the active tab */}
      <GeminiInsightsPanel
        ledgerId={ledgerId}
        context={geminiContextData.context}
        data={geminiContextData.data}
      />

      {/* Conditional Rendering of content based on the active tab */}
      <div className="mt-10">
        {activeTab === CategoryHomeTab.CategoriesList && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Current Ledger Categories</h2>
            <p className="text-gray-700 mb-6">Manage and organize your ledger account categories. Use the search and filter options to find specific accounts.</p>
            <ListView
              graphqlDocument={LedgerAccountCategoriesHomeDocument}
              resource={LEDGER_ACCOUNT_CATEGORY}
              constantQueryVariables={{
                ledgerId,
              }}
              constantQueryParams={CONSTANT_QUERY_PARAMS}
              ListViewEmptyState={
                <div className="flex justify-center px-6 py-16">
                  <LedgerAccountCategoriesEmptyState ledgerId={ledgerId} />
                </div>
              }
              initialShowSearchArea={initialShowSearchArea}
              defaultSearchComponents={searchComponents.defaultComponents}
              additionalSearchComponents={searchComponents.additionalComponents}
              mapQueryToVariables={mapLedgerAccountCategoryQueryToVariables}
              nestingDocument={LedgerAccountCategoryChildrenDocument}
              mapQueryToNestingVariables={
                mapLedgerAccountCategoryQueryToNestingVariables
              }
              nestingResource={LEDGER_ACCOUNT_CATEGORY_CHILD}
              hasNesting={(node: Node) => (node.childrenCount ?? 0) !== 0}
              horizontalDefaultSearchComponents
            />
          </div>
        )}

        {activeTab === CategoryHomeTab.AICategorization && (
          <AICategorizationSuggestionPanel ledgerId={ledgerId} />
        )}

        {activeTab === CategoryHomeTab.AnomalyDetection && (
          <AnomalyDetectionDashboard ledgerId={ledgerId} />
        )}

        {activeTab === CategoryHomeTab.PredictiveTrends && (
          <PredictiveCategoryTrends ledgerId={ledgerId} />
        )}

        {activeTab === CategoryHomeTab.OptimizationRecommendations && (
          <CategoryOptimizationRecommendations ledgerId={ledgerId} />
        )}
      </div>
    </div>
  );
}

export default LedgerAccountCategoriesHome;