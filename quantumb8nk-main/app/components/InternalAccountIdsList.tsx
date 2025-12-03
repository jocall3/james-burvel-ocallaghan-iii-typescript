// Copyright James Burvel Oâ€™Callaghan III
// President CDBI AI Business Inc.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactTooltip from "react-tooltip";
import { useInternalAccountsQuery } from "../../generated/dashboard/graphqlSchema";
import { Label, Tooltip } from "../../common/ui-components";
import Stack from "../../common/ui-components/Stack/Stack";

// --- 1. Core Data Models for CDBI AI Financial Platform ---

/**
 * Represents a simplified internal account with additional AI-driven attributes.
 * This extends the basic internal account data fetched from the GraphQL layer.
 */
export interface CDBIInternalAccount {
  id: string;
  longName: string;
  // --- New AI-powered attributes ---
  balance?: number; // Simulated or fetched for AI analysis
  transactionCountLast30Days?: number; // Simulated or fetched for AI analysis
  riskScore?: number; // AI-calculated: 0-100, higher is riskier
  anomalyScore?: number; // AI-calculated: higher score means higher anomaly likelihood
  predictedBalanceNext30Days?: number; // AI-predicted future balance
  predictedConfidence?: number; // AI-predicted confidence (0-100%)
  contextualInsights?: string[]; // AI-generated human-readable insights
  aiRiskLevel?: "Low" | "Medium" | "High" | "Critical"; // AI-assigned risk categorization
  lastAIAnalysisDate?: string; // Timestamp of the last AI analysis
}

/**
 * Interface for AI anomaly detection report.
 */
export interface AIAnomalyReport {
  status: "normal" | "alert" | "investigating";
  score: number;
  message: string;
  details?: string[];
}

/**
 * Interface for AI risk assessment.
 */
export interface AIRiskAssessment {
  level: "Low" | "Medium" | "High" | "Critical";
  score: number;
  recommendations: string[];
}

/**
 * Interface for AI predictive analytics.
 */
export interface AIPrediction {
  predictedValue: number;
  confidence: number;
  forecastPeriod: string;
  trend?: "Up" | "Down" | "Stable";
}

/**
 * Interface for a Key Performance Indicator (KPI).
 * Linked to Gemini for detailed analysis.
 */
export interface KPI {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  change?: number; // Percentage change from previous period
  trendIcon?: "📈" | "📉" | "↔️";
  description?: string;
  geminiAnalysisLink?: string; // URL to Gemini for deeper analysis
}

/**
 * Interface for chart data.
 * Linked to Gemini for interactive visualizations.
 */
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string; // For visual representation
  }[];
  title?: string;
  type?: "bar" | "line" | "pie";
  geminiInteractiveChartLink?: string; // URL to Gemini for interactive chart
}

// --- 2. CDBI AI Core Services (Simulated/Internalized) ---
// These services simulate AI model interactions and data processing.
// In a real-world scenario, these would interact with a backend AI service
// (e.g., powered by Google Gemini, TensorFlow, PyTorch, etc.) via dedicated APIs.

/**
 * A simulated service for interacting with Gemini for data fetching and AI model execution.
 * This class abstracts the actual API calls to a hypothetical Gemini-powered backend.
 * It's implemented as a singleton to ensure a single point of interaction.
 */
export class GeminiIntegrationService {
  private static instance: GeminiIntegrationService;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): GeminiIntegrationService {
    if (!GeminiIntegrationService.instance) {
      GeminiIntegrationService.instance = new GeminiIntegrationService();
    }
    return GeminiIntegrationService.instance;
  }

  /**
   * Simulates fetching enhanced data for internal accounts from a Gemini-powered backend.
   * In a real application, this would involve API calls to a data service.
   * @param accountId Optional: Fetch specific account data.
   * @returns A promise resolving to an array of CDBIInternalAccount or a single account.
   */
  public async fetchEnhancedAccountData(
    accountId?: string
  ): Promise<CDBIInternalAccount[] | CDBIInternalAccount | null> {
    console.log(`[CDBI AI] Fetching enhanced data for ${accountId || 'all accounts'} via Gemini...`);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data for demonstration, representing data enriched by Gemini AI
    const mockAccounts: CDBIInternalAccount[] = [
      {
        id: "ia_12345",
        longName: "CDBI AI Operations Account",
        balance: 1_250_000.75,
        transactionCountLast30Days: 150,
        riskScore: 25,
        anomalyScore: 5.2,
        predictedBalanceNext30Days: 1_300_000.00,
        predictedConfidence: 92,
        contextualInsights: [
          "Projected 4% balance growth next month due to consistent revenue streams.",
          "High transaction volume with stable, whitelisted counterparties.",
        ],
        aiRiskLevel: "Low",
        lastAIAnalysisDate: "2023-10-26T10:00:00Z",
      },
      {
        id: "ia_67890",
        longName: "CDBI AI Innovation Fund",
        balance: 750_230.10,
        transactionCountLast30Days: 80,
        riskScore: 55,
        anomalyScore: 12.8,
        predictedBalanceNext30Days: 700_000.00,
        predictedConfidence: 85,
        contextualInsights: [
          "Slight dip in balance predicted due to upcoming R&D investment in Q4.",
          "CDBI AI recommends monitoring large outflow transactions for unusual patterns.",
        ],
        aiRiskLevel: "Medium",
        lastAIAnalysisDate: "2023-10-26T10:05:00Z",
      },
      {
        id: "ia_11223",
        longName: "CDBI AI Strategic Reserves",
        balance: 5_000_000.00,
        transactionCountLast30Days: 5,
        riskScore: 10,
        anomalyScore: 1.1,
        predictedBalanceNext30Days: 5_000_000.00,
        predictedConfidence: 99,
        contextualInsights: [
          "Stable account with minimal activity, primarily for long-term strategic holdings.",
          "CDBI AI projects continued stability.",
        ],
        aiRiskLevel: "Low",
        lastAIAnalysisDate: "2023-10-26T10:10:00Z",
      },
      {
        id: "ia_44556",
        longName: "CDBI AI Ventures Growth Account",
        balance: 300_000.00,
        transactionCountLast30Days: 250,
        riskScore: 85,
        anomalyScore: 35.7,
        predictedBalanceNext30Days: 280_000.00,
        predictedConfidence: 70,
        contextualInsights: [
          "High volume of small transactions detected; CDBI AI flagged some for review due to unusual frequency.",
          "Significant anomaly score increase observed in the last 7 days; requires immediate attention.",
          "Urgent review required for source and nature of recent large inflow transaction.",
        ],
        aiRiskLevel: "Critical",
        lastAIAnalysisDate: "2023-10-26T10:15:00Z",
      },
    ];

    if (accountId) {
      return mockAccounts.find((acc) => acc.id === accountId) || null;
    }
    return mockAccounts;
  }

  /**
   * Simulates fetching KPI data for a specific metric from a Gemini-powered service.
   * @param kpiId The ID of the KPI to fetch.
   * @returns A promise resolving to KPI data.
   */
  public async fetchKpiData(kpiId: string): Promise<KPI> {
    console.log(`[CDBI AI] Fetching KPI data for ${kpiId} via Gemini...`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockKpis: { [key: string]: KPI } = {
      total_anomalies: {
        id: "total_anomalies",
        name: "Total AI Anomalies Detected (Last 24h)",
        value: Math.floor(Math.random() * 10) + 1, // Dynamic value
        unit: "incidents",
        change: Math.random() * 20 - 10, // -10% to +10% change
        trendIcon: Math.random() > 0.5 ? "📈" : "📉",
        description:
          "Total number of anomalies flagged by CDBI AI across all internal accounts. High values indicate increased scrutiny is needed.",
        geminiAnalysisLink:
          "https://gemini.google.com/analysis/cdbi-ai/total_anomalies",
      },
      avg_risk_score: {
        id: "avg_risk_score",
        name: "Average Account Risk Score (CDBI AI)",
        value: Math.floor(Math.random() * 50) + 20, // Dynamic value
        unit: "/100",
        change: Math.random() * 5 - 2.5,
        trendIcon: Math.random() > 0.5 ? "📈" : "📉",
        description:
          "Mean risk score calculated by CDBI AI across all internal accounts. Reflects overall financial health and potential exposure.",
        geminiAnalysisLink: "https://gemini.google.com/analysis/cdbi-ai/avg_risk_score",
      },
      predicted_total_balance: {
        id: "predicted_total_balance",
        name: "CDBI AI Predicted Total Balance (Next 30 Days)",
        value: (Math.random() * 10_000_000 + 5_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), // Dynamic value
        unit: "$",
        change: Math.random() * 3 - 1.5,
        trendIcon: Math.random() > 0.5 ? "📈" : "↔️",
        description:
          "Sum of all AI-predicted internal account balances for the next month. Forecasts overall liquidity.",
        geminiAnalysisLink:
          "https://gemini.google.com/analysis/cdbi-ai/predicted_total_balance",
      },
    };
    return (
      mockKpis[kpiId] || {
        id: kpiId,
        name: `Unknown KPI: ${kpiId}`,
        value: "N/A",
      }
    );
  }

  /**
   * Simulates fetching chart data from a Gemini-powered service.
   * @param chartId The ID of the chart data to fetch.
   * @returns A promise resolving to ChartData.
   */
  public async fetchChartData(chartId: string): Promise<ChartData> {
    console.log(`[CDBI AI] Fetching chart data for ${chartId} via Gemini...`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockCharts: { [key: string]: ChartData } = {
      risk_distribution: {
        title: "CDBI AI Risk Level Distribution",
        labels: ["Low", "Medium", "High", "Critical"],
        datasets: [
          {
            label: "Number of Accounts",
            data: [
              Math.floor(Math.random() * 10) + 5,
              Math.floor(Math.random() * 5) + 2,
              Math.floor(Math.random() * 3) + 1,
              Math.floor(Math.random() * 2) + 1,
            ],
            color: "#4CAF50", // Placeholder color for a simple chart
          },
        ],
        type: "pie",
        geminiInteractiveChartLink:
          "https://gemini.google.com/chart/cdbi-ai/risk_distribution",
      },
      balance_trend: {
        title: "CDBI AI Predicted Balance Trend (Last 6 Months vs. Next 30 Days)",
        labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov (Pred)"],
        datasets: [
          {
            label: "Actual/Predicted Balance ($)",
            data: [
              8_000_000,
              8_100_000,
              7_900_000,
              8_200_000,
              8_300_000,
              8_500_000,
              8_650_000,
            ].map((v) => v + Math.random() * 50_000 - 25_000), // Add some randomness for dynamic feel
            color: "#2196F3",
          },
        ],
        type: "line",
        geminiInteractiveChartLink:
          "https://gemini.google.com/chart/cdbi-ai/balance_trend",
      },
    };
    return (
      mockCharts[chartId] || {
        labels: [],
        datasets: [],
        title: `Unknown Chart: ${chartId}`,
      }
    );
  }
}

// --- 3. CDBI AI UI Components ---

/**
 * Renders a single Key Performance Indicator (KPI) with its value, trend, and a link to Gemini.
 */
export const CDBI_AI_KPI: React.FC<{ kpi: KPI }> = ({ kpi }) => (
  <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
    <a
      href={kpi.geminiAnalysisLink || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center"
      data-tip={`Explore ${kpi.name} details on Gemini AI`}
    >
      {kpi.name}
      <span className="ml-1 text-blue-500 text-xs">🔗</span>
      <ReactTooltip
        multiline
        data-place="top"
        data-type="dark"
        data-effect="float"
      />
    </a>
    <div className="flex items-baseline mt-1">
      <span className="text-2xl font-semibold text-gray-900">
        {kpi.value}
        {kpi.unit && <span className="text-base font-normal ml-1">{kpi.unit}</span>}
      </span>
      {kpi.change !== undefined && (
        <span
          className={`ml-2 text-sm font-medium ${
            kpi.change > 0 ? "text-green-600" : kpi.change < 0 ? "text-red-600" : "text-gray-600"
          }`}
        >
          {kpi.trendIcon} {Math.abs(kpi.change).toFixed(1)}%
        </span>
      )}
    </div>
    {kpi.description && (
      <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
    )}
  </div>
);

/**
 * A simplified text-based chart component to represent ChartData.
 * To adhere to the "no dependencies" rule for new features, this uses basic
 * HTML/CSS for a visual approximation rather than a full charting library.
 * In a real application, a charting library like Chart.js or Recharts would be integrated here.
 */
export const CDBI_AI_Chart: React.FC<{ chartData: ChartData }> = ({ chartData }) => (
  <div className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
    <a
      href={chartData.geminiInteractiveChartLink || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200 flex items-center mb-2"
      data-tip={`View interactive ${chartData.title} chart on Gemini AI`}
    >
      {chartData.title || "CDBI AI Chart"}
      <span className="ml-1 text-blue-500 text-xs">🔗</span>
      <ReactTooltip
        multiline
        data-place="top"
        data-type="dark"
        data-effect="float"
      />
    </a>
    <div className="mt-2 text-sm text-gray-700">
      {chartData.type === "pie" && chartData.datasets.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {/* Simple Pie-like representation using colored dots */}
          {chartData.labels.map((label, i) => (
            <div key={label} className="flex items-center">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: chartData.datasets[0]?.color || `hsl(${(i * 90) % 360}, 70%, 50%)` }} // Simple color generation
              ></span>
              {label}: {chartData.datasets[0]?.data[i] || 0}
            </div>
          ))}
        </div>
      )}
      {(chartData.type === "line" || chartData.type === "bar") && chartData.datasets.length > 0 && (
        <div className="mt-4">
          <p className="font-medium text-gray-800 mb-2">{chartData.datasets[0]?.label}</p>
          <div className="h-32 bg-gray-100 rounded-md p-2 flex items-end overflow-hidden relative">
            {/* Visual approximation of a chart using div heights */}
            {chartData.datasets[0]?.data.length > 0 && (() => {
              const values = chartData.datasets[0].data;
              const max = Math.max(...values);
              const min = Math.min(...values);
              const range = max - min;
              const barColor = chartData.type === "bar" ? "bg-purple-500" : "bg-blue-500";
              const dotColor = chartData.type === "line" ? "bg-blue-700" : "";

              return (
                <>
                  {values.map((value, i, arr) => {
                    const height = range > 0 ? ((value - min) / range) * 90 + 10 : 50; // Scale 10-100%
                    return (
                      <div
                        key={i}
                        className={`flex-grow mx-0.5 rounded-t-sm relative transition-all duration-300 ease-out ${barColor}`}
                        style={{ height: `${height}%`, opacity: chartData.type === "line" ? 0.7 : 1 }}
                      >
                         {chartData.type === "line" && (
                            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${dotColor} border-2 border-white`}></div>
                         )}
                      </div>
                    );
                  })}
                </>
              );
            })()}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            {chartData.labels.map((label, i) => (
              <span key={label} className="flex-grow text-center truncate">{label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);


// --- 4. Main CDBI AI Internal Accounts List Component ---

export function InternalAccountIdsList() {
  const geminiService = useMemo(() => GeminiIntegrationService.getInstance(), []);

  // State for internal accounts, enhanced with AI data
  const [cdbiInternalAccounts, setCdbiInternalAccounts] = useState<
    CDBIInternalAccount[]
  >([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  // State for global KPIs and Charts
  const [globalKPIs, setGlobalKPIs] = useState<KPI[]>([]);
  const [globalCharts, setGlobalCharts] = useState<ChartData[]>([]);

  // Original GraphQL data fetching (MUST NOT BE REMOVED/CHANGED)
  const { data, loading: loadingGraphQL, error: errorGraphQL } = useInternalAccountsQuery({
    notifyOnNetworkStatusChange: true,
  });

  const internalAccountsFromGraphQL = data?.internalAccountsUnpaginated || [];

  // Effect to merge GraphQL data with AI-enhanced data and fetch global metrics
  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingAI(true);
      setErrorAI(null);
      try {
        // 1. Fetch AI-enhanced account data
        const enhancedData = await geminiService.fetchEnhancedAccountData();
        let mergedAccounts: CDBIInternalAccount[] = [];

        if (Array.isArray(enhancedData)) {
          // Merge GraphQL data with AI data based on ID
          mergedAccounts = internalAccountsFromGraphQL.map(
            (graphqlAcc) => {
              const aiAcc = enhancedData.find((a) => a.id === graphqlAcc.id);
              return {
                ...graphqlAcc, // Original data from GraphQL
                ...aiAcc,     // Overwrite/add AI-specific data
                // Ensure base properties are not lost if AI data doesn't have them
                id: graphqlAcc.id,
                longName: graphqlAcc.longName,
              };
            }
          );
          // Also add any accounts found by AI that weren't in GraphQL (e.g., new accounts or different scope)
          const newAIOnlyAccounts = enhancedData.filter(
            (aiAcc) => !internalAccountsFromGraphQL.some((graphqlAcc) => graphqlAcc.id === aiAcc.id)
          );
          mergedAccounts = [...mergedAccounts, ...newAIOnlyAccounts];
        } else if (enhancedData) {
          // Fallback if AI service returns a single account (though current mock returns array)
          mergedAccounts = [{...internalAccountsFromGraphQL[0], ...enhancedData}];
        }
        setCdbiInternalAccounts(mergedAccounts);

        // 2. Fetch global KPIs
        const kpis = await Promise.all([
          geminiService.fetchKpiData("total_anomalies"),
          geminiService.fetchKpiData("avg_risk_score"),
          geminiService.fetchKpiData("predicted_total_balance"),
        ]);
        setGlobalKPIs(kpis);

        // 3. Fetch global Charts
        const charts = await Promise.all([
          geminiService.fetchChartData("risk_distribution"),
          geminiService.fetchChartData("balance_trend"),
        ]);
        setGlobalCharts(charts);

      } catch (err: any) {
        console.error("Failed to fetch CDBI AI data:", err);
        setErrorAI(`Failed to fetch CDBI AI insights: ${err.message || 'Unknown error'}. Displaying available data.`);
        // Fallback to just GraphQL data if AI fetch fails, ensuring component still renders something
        setCdbiInternalAccounts(internalAccountsFromGraphQL);
      } finally {
        setLoadingAI(false);
      }
    };

    // Only run if GraphQL data is available or has loaded.
    // This ensures we have base accounts to merge with AI data.
    if (!loadingGraphQL && !errorGraphQL) {
      fetchAllData();
    } else if (!loadingGraphQL && errorGraphQL) {
       // If GraphQL data fetch failed, just show GraphQL error.
       // AI fetching won't proceed meaningfully without base accounts.
       setLoadingAI(false);
    }
  }, [geminiService, internalAccountsFromGraphQL, loadingGraphQL, errorGraphQL]); // Dependency on internalAccountsFromGraphQL to re-merge if it changes

  const tooltipMessage =
    "This dashboard provides your Internal Account IDs alongside advanced CDBI AI-powered insights, risk assessments, and predictive analytics. Click the 🔗 icon to dive deeper into Gemini-powered analysis.";
  const tooltip = (
    <>
      <Tooltip className="tooltip-holder" data-tip={tooltipMessage} />
      <ReactTooltip
        multiline
        data-place="top"
        data-type="dark"
        data-effect="float"
        className="custom-tooltip-style" // Added a class for potential custom styling
      />
    </>
  );

  if (loadingGraphQL || loadingAI) {
    return (
      <Stack className="gap-4 p-6 bg-white rounded-lg shadow-xl border border-blue-100 text-center text-gray-600 min-h-[400px] flex items-center justify-center">
        <Stack className="items-center gap-4">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">CDBI AI Account Intelligence Dashboard</span>
            {tooltipMessage && tooltip}
          </h2>
          <p className="text-lg">Loading cutting-edge CDBI AI enhanced account data...</p>
          {(loadingGraphQL && !loadingAI) && <p className="text-sm text-gray-500">Retrieving base internal account information.</p>}
          {(loadingAI && !loadingGraphQL) && <p className="text-sm text-gray-500">Processing real-time AI insights via Gemini's powerful models.</p>}
          <div className="flex justify-center items-center mt-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        </Stack>
      </Stack>
    );
  }

  if (errorGraphQL || errorAI) {
    return (
      <Stack className="gap-4 p-6 bg-red-50 rounded-lg shadow-xl border border-red-200 text-red-800 min-h-[400px] flex items-center justify-center">
        <Stack className="items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            CDBI AI Internal Account Dashboard
            {tooltipMessage && tooltip}
          </h2>
          <p className="text-lg">An error occurred while loading financial data or AI insights:</p>
          {errorGraphQL && <p className="text-base font-medium">GraphQL Data Error: {errorGraphQL.message}</p>}
          {errorAI && <p className="text-base font-medium">CDBI AI Service Error: {errorAI}</p>}
          <p className="text-sm text-gray-700 mt-2">
            Please try refreshing the page. If the issue persists, contact CDBI AI support with the error details.
          </p>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack className="gap-8 p-6 bg-white rounded-lg shadow-2xl border border-blue-200">
      <h2 className="text-3xl font-extrabold text-blue-900 flex items-center justify-between gap-4">
        <span className="bg-gradient-to-r from-blue-700 to-purple-700 text-transparent bg-clip-text">CDBI AI Account Intelligence Dashboard</span>
        {tooltipMessage && tooltip}
      </h2>
      <p className="text-gray-700 text-base leading-relaxed">
        Leveraging cutting-edge Gemini AI, the CDBI AI Account Intelligence Dashboard provides real-time, actionable insights,
        sophisticated risk assessments, and precise predictive analytics for your internal accounts.
        Engineered for commercial-grade applications, it solves complex financial challenges for both major institutions and individual users,
        making it the most advanced financial intelligence platform available.
      </p>

      {/* Global KPIs Section */}
      <div className="mt-4">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-blue-100">
          CDBI AI Global Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {globalKPIs.map((kpi) => (
            <CDBI_AI_KPI key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Global Charts Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-blue-100">
          CDBI AI Strategic Visualizations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {globalCharts.map((chart) => (
            <CDBI_AI_Chart key={chart.title} chartData={chart} />
          ))}
        </div>
      </div>

      {/* Individual Account List */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-blue-100">
          CDBI AI Detailed Account Insights
        </h3>
        <Stack className="gap-8">
          {cdbiInternalAccounts.length === 0 ? (
            <p className="text-gray-500 text-center p-8 bg-gray-50 rounded-md">
              No internal accounts found or processed by CDBI AI. This might be due to a data fetching issue or no accounts being configured.
            </p>
          ) : (
            cdbiInternalAccounts.map((internalAccount) => (
              <Stack
                key={internalAccount.id}
                className="gap-4 p-6 border border-gray-200 rounded-xl shadow-lg bg-gray-50 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <Stack className="gap-1">
                    <Label className="font-bold text-xl text-blue-700">
                      {internalAccount.longName}
                    </Label>
                    <span className="text-sm text-gray-600">
                      Account ID: {internalAccount.id}
                    </span>
                  </Stack>
                  {internalAccount.aiRiskLevel && (
                    <span
                      className={`px-4 py-2 text-sm font-semibold rounded-full min-w-[100px] text-center ${
                        internalAccount.aiRiskLevel === "Critical"
                          ? "bg-red-100 text-red-800 ring-2 ring-red-400"
                          : internalAccount.aiRiskLevel === "High"
                          ? "bg-orange-100 text-orange-800 ring-2 ring-orange-400"
                          : internalAccount.aiRiskLevel === "Medium"
                          ? "bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400"
                          : "bg-green-100 text-green-800 ring-2 ring-green-400"
                      }`}
                      data-tip={`CDBI AI-calculated risk level: ${internalAccount.aiRiskLevel}`}
                    >
                      AI Risk: {internalAccount.aiRiskLevel}
                      {internalAccount.riskScore && ` (${internalAccount.riskScore})`}
                      <ReactTooltip
                        multiline
                        data-place="top"
                        data-type="dark"
                        data-effect="float"
                      />
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 mt-2">
                  {internalAccount.balance !== undefined && (
                    <div>
                      <span className="font-medium text-gray-800">Current Balance:</span>{" "}
                      <span className="text-green-700 font-bold block text-base mt-1">
                        ${internalAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {internalAccount.predictedBalanceNext30Days !== undefined && (
                    <div>
                      <span className="font-medium text-gray-800">AI Predicted Next 30D Balance:</span>{" "}
                      <span className="text-blue-700 font-bold block text-base mt-1">
                        ${internalAccount.predictedBalanceNext30Days.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {internalAccount.predictedConfidence && (
                        <span className="ml-1 text-xs text-gray-500">
                          ({internalAccount.predictedConfidence}% conf)
                        </span>
                      )}
                    </div>
                  )}
                  {internalAccount.transactionCountLast30Days !== undefined && (
                    <div>
                      <span className="font-medium text-gray-800">Transactions (Last 30D):</span>{" "}
                      <span className="block text-base mt-1">{internalAccount.transactionCountLast30Days}</span>
                    </div>
                  )}
                  {internalAccount.anomalyScore !== undefined && (
                    <div className="md:col-span-2 lg:col-span-1">
                      <span className="font-medium text-gray-800">CDBI AI Anomaly Score:</span>{" "}
                      <span
                        className={`${
                          (internalAccount.anomalyScore || 0) > 30
                            ? "text-red-600 font-bold"
                            : (internalAccount.anomalyScore || 0) > 10
                            ? "text-orange-600 font-semibold"
                            : "text-green-600"
                        } block text-base mt-1`}
                      >
                        {(internalAccount.anomalyScore || 0).toFixed(1)}
                      </span>
                      <a
                        href={`https://gemini.google.com/analysis/cdbi-ai/${internalAccount.id}/anomalies`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-500 text-xs hover:underline flex items-center gap-1"
                        data-tip={`View detailed anomaly report for ${internalAccount.longName} on Gemini AI.`}
                      >
                        Detailed Anomaly Report 🔗
                        <ReactTooltip
                          multiline
                          data-place="top"
                          data-type="dark"
                          data-effect="float"
                        />
                      </a>
                    </div>
                  )}
                  {internalAccount.lastAIAnalysisDate && (
                    <div className="sm:col-span-2 md:col-span-1">
                      <span className="font-medium text-gray-800">Last AI Analysis:</span>{" "}
                      <span className="block text-base mt-1">
                        {new Date(internalAccount.lastAIAnalysisDate).toLocaleString("en-US", { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  )}
                </div>

                {internalAccount.contextualInsights && internalAccount.contextualInsights.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-bold text-blue-800 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      CDBI AI Pro-Insights:
                    </span>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                      {internalAccount.contextualInsights.map((insight, idx) => (
                        <li key={idx} className="leading-tight">{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <a
                  href={`https://gemini.google.com/dashboard/cdbi-ai/${internalAccount.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-end mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-base font-semibold rounded-md shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
                >
                  View Full Gemini AI Dashboard <span className="text-lg">🚀</span>
                </a>
              </Stack>
            ))
          )}
        </Stack>
      </div>
    </Stack>
  );
}

export default InternalAccountIdsList;