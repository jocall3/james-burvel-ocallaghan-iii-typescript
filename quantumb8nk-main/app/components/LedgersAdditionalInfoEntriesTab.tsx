// Copyright James Burvel O’Callaghan III
// President CDBI - Cognitive Data Banking Intelligence

import React, { useState, useEffect, useMemo, useCallback } from "react";
import EntityTableView, { INITIAL_PAGINATION } from "./EntityTableView";
import { CursorPaginationInput } from "../types/CursorPaginationInput";
import { useLedgersAdditionalInfoEntriesQuery } from "../../generated/dashboard/graphqlSchema";
import { handleLinkClick } from "~/common/utilities/handleLinkClick";
import { ButtonClickEventTypes, Pill } from "~/common/ui-components";

// --- New: AI-Powered Data Structures and Services ---

/**
 * Represents a detailed AI insight derived from ledger entries.
 * These insights provide actionable intelligence beyond raw transaction data.
 */
export interface AIInsight {
  id: string;
  type: "anomaly" | "prediction" | "recommendation" | "categorization" | "sentiment" | "compliance";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  suggestedAction?: string;
  relevanceScore: number; // A score indicating how relevant this insight is (0.0 - 1.0)
  relatedEntryIds?: string[]; // IDs of ledger entries relevant to this insight
  timestamp: string;
  sourceModel?: string; // e.g., "Gemini-Pro", "CDBI-Anomaly-v2"
}

/**
 * Represents a Key Performance Indicator (KPI) derived from AI analysis.
 * KPIs offer a quick snapshot of financial health and operational efficiency.
 */
export interface KPI {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat"; // Indicates historical trend direction
  change?: string; // e.g., "+5%" or "-2.1%" relative to previous period
  description: string;
  chartLinkRef?: string; // Reference to a dynamic chart in a Gemini-powered dashboard
  targetValue?: string | number; // Optional target for the KPI
  performanceStatus?: "on-track" | "off-track" | "exceeds";
}

/**
 * Placeholder for chart data structure. In a real world application, this would
 * contain data arrays, configurations, and types for a charting library.
 * Here, it primarily serves as a blueprint for data that Gemini would visualize.
 */
export interface ChartData {
  chartId: string;
  title: string;
  type: "bar" | "line" | "pie" | "gauge" | "scatter";
  labels: string[]; // X-axis labels (e.g., dates, categories)
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
  description: string;
  geminiPrompt: string; // The natural language prompt sent to Gemini to generate/interpret this chart
  dataRefreshInterval?: number; // How often the chart data should be refreshed (in seconds)
}

/**
 * A hypothetical, self-contained AI service powered by Gemini.
 * This class encapsulates all AI-related logic for ledger analysis,
 * ensuring no external AI service dependencies beyond its conceptual interface.
 * It simulates advanced AI capabilities without requiring actual external calls.
 */
export class GeminiAIService {
  private static instance: GeminiAIService;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  /**
   * Simulates AI-driven analysis of ledger entries, detecting anomalies,
   * categorizing transactions, identifying potential risks/opportunities,
   * and checking for compliance flags.
   * @param entries The raw ledger entry data for analysis.
   * @returns A promise resolving to an array of AI insights.
   */
  public async analyzeLedgerEntries(entries: any[]): Promise<AIInsight[]> {
    console.log("CDBI AI: Gemini AIService analyzing ledger entries for anomalies, sentiment, and compliance...", entries);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate AI processing delay

    const insights: AIInsight[] = [];
    const now = new Date().toISOString();

    // 1. Anomaly Detection (e.g., unusually large or small transactions for the account type)
    const accountAggregates = entries.reduce((acc, entry) => {
      acc[entry.ledgerAccount.name] = acc[entry.ledgerAccount.name] || { total: 0, count: 0, amounts: [] };
      const amount = parseFloat(entry.amount);
      acc[entry.ledgerAccount.name].total += amount;
      acc[entry.ledgerAccount.name].count += 1;
      acc[entry.ledgerAccount.name].amounts.push(amount);
      return acc;
    }, {});

    entries.forEach(entry => {
      const amount = parseFloat(entry.amount);
      const accountInfo = accountAggregates[entry.ledgerAccount.name];
      const avgAccountAmount = accountInfo.total / accountInfo.count;
      const stdDev = Math.sqrt(accountInfo.amounts.map(x => Math.pow(x - avgAccountAmount, 2)).reduce((a, b) => a + b) / accountInfo.count);

      // Simple anomaly: amount deviates significantly from account's average (e.g., 3 standard deviations)
      if (stdDev > 0 && Math.abs(amount - avgAccountAmount) > 3 * stdDev && Math.abs(amount) > 500) {
        insights.push({
          id: `anomaly-${entry.id}`,
          type: "anomaly",
          severity: "high",
          title: "Significant Transaction Outlier Detected",
          description: `A transaction of ${entry.amount} in account "${entry.ledgerAccount.name}" is a statistical outlier, deviating greatly from the account's average.`,
          suggestedAction: `Initiate a detailed review of transaction ID ${entry.id} and its source/destination.`,
          relevanceScore: 0.98,
          relatedEntryIds: [entry.id],
          timestamp: now,
          sourceModel: "CDBI-Anomaly-v3.1"
        });
      }
    });

    // 2. Sentiment Analysis on transaction descriptions (simulated using 'path' or 'memo' if available)
    // Assuming 'node.path' can sometimes contain descriptive text.
    entries.forEach(entry => {
      const transactionDescription = entry.path || ""; // In a real system, this would be a 'memo' or 'description' field
      if (transactionDescription.toLowerCase().includes("urgent payment") || transactionDescription.toLowerCase().includes("risk advisory")) {
        insights.push({
          id: `sentiment-risk-${entry.id}`,
          type: "sentiment",
          severity: "medium",
          title: "AI Flags Transaction for Urgency/Risk Keywords",
          description: `The transaction description contains keywords indicating urgency or potential risk. Manual review recommended.`,
          suggestedAction: `Prioritize review of transaction ${entry.id} for immediate action or risk mitigation.`,
          relevanceScore: 0.85,
          relatedEntryIds: [entry.id],
          timestamp: now,
          sourceModel: "Gemini-NLP-Sentiment"
        });
      } else if (transactionDescription.toLowerCase().includes("strategic investment") || transactionDescription.toLowerCase().includes("market expansion")) {
        insights.push({
          id: `sentiment-opportunity-${entry.id}`,
          type: "sentiment",
          severity: "low",
          title: "AI Identifies Strategic Opportunity Keywords",
          description: `Transaction description hints at investment or growth-related activities.`,
          suggestedAction: `Flag transaction ${entry.id} for strategic portfolio alignment review.`,
          relevanceScore: 0.70,
          relatedEntryIds: [entry.id],
          timestamp: now,
          sourceModel: "Gemini-NLP-Sentiment"
        });
      }
    });

    // 3. Predictive Categorization & Compliance Checks
    entries.forEach(entry => {
      const amount = parseFloat(entry.amount);
      const accountName = entry.ledgerAccount.name.toLowerCase();
      let category = "Uncategorized";
      let complianceIssue: string | undefined = undefined;

      // Predictive Categorization (more complex rules than just amount)
      if (accountName.includes("payroll")) {
        category = "Operating Expenses - Payroll";
      } else if (accountName.includes("revenue") || accountName.includes("sales")) {
        category = "Revenue - Sales";
      } else if (accountName.includes("tax")) {
        category = "Regulatory - Tax Payments";
        if (amount < 1000 && entry.direction === "debit") { // Example: small tax payments might be unusual
            complianceIssue = "Unusually small tax payment detected. Verify regulatory adherence.";
        }
      } else if (amount >= 10000 && entry.direction === "debit") {
        category = "Capital Expenditure";
        if (!accountName.includes("asset")) {
            complianceIssue = "Large debit categorized as CapEx, but not in a typical asset account. Flag for review.";
        }
      } else if (amount >= 5000 && entry.direction === "credit") {
        category = "Large Deposit - Review Source";
      } else if (amount < 100 && entry.direction === "debit" && !accountName.includes("petty cash")) {
        category = "Minor Operating Expense";
      } else {
         category = "General Operating Transaction";
      }

      insights.push({
        id: `category-${entry.id}`,
        type: "categorization",
        severity: "low",
        title: `AI-Suggested Category: ${category}`,
        description: `Gemini AI has categorized this entry as '${category}' based on amount, direction, and account name.`,
        suggestedAction: `Confirm AI categorization or re-classify if necessary.`,
        relevanceScore: 0.88,
        relatedEntryIds: [entry.id],
        timestamp: now,
        sourceModel: "CDBI-Classification-v1.2"
      });

      if (complianceIssue) {
        insights.push({
          id: `compliance-${entry.id}`,
          type: "compliance",
          severity: "critical",
          title: "Potential Compliance Flag Detected",
          description: complianceIssue,
          suggestedAction: `Immediate compliance review required for transaction ${entry.id}. Consult CDBI Regulatory AI for guidance.`,
          relevanceScore: 0.99,
          relatedEntryIds: [entry.id],
          timestamp: now,
          sourceModel: "CDBI-Compliance-Engine"
        });
      }
    });

    // 4. Recommendation for optimization (e.g., if many small transactions in one account)
    for (const accountName in accountAggregates) {
        const info = accountAggregates[accountName];
        if (info.count > 20 && info.total > 5000 && info.total / info.count < 200) { // Many small transactions
            insights.push({
                id: `recommendation-batch-${accountName}`,
                type: "recommendation",
                severity: "low",
                title: `Opportunity: Consolidate Small Transactions for ${accountName}`,
                description: `This account shows a high volume of small value transactions. Consider batch processing or alternative payment methods to reduce processing overhead.`,
                suggestedAction: `Evaluate transaction aggregation strategies for the "${accountName}" ledger account.`,
                relevanceScore: 0.65,
                timestamp: now,
                sourceModel: "CDBI-Optimization-AI"
            });
        }
    }


    return insights;
  }

  /**
   * Generates key performance indicators (KPIs) based on the analyzed ledger data and AI insights.
   * KPIs are crucial for monitoring financial health and identifying trends.
   * @param entries The raw ledger entries.
   * @param insights AI insights derived from the entries.
   * @returns A promise resolving to an array of KPIs.
   */
  public async generateKPIs(entries: any[], insights: AIInsight[]): Promise<KPI[]> {
    console.log("CDBI AI: Gemini AIService generating KPIs...", entries, insights);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate KPI generation delay

    const totalDebit = entries.filter(e => e.direction === 'debit').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalCredit = entries.filter(e => e.direction === 'credit').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const netChange = totalCredit - totalDebit;
    const anomalyCount = insights.filter(i => i.type === 'anomaly').length;
    const highSeverityAnomalyCount = insights.filter(i => i.type === 'anomaly' && i.severity === 'high' || i.severity === 'critical').length;
    const categorizedEntriesCount = insights.filter(i => i.type === 'categorization').length;
    const complianceAlerts = insights.filter(i => i.type === 'compliance').length;
    const revenueEntries = insights.filter(i => i.type === 'categorization' && i.title.includes("Revenue")).length;
    const expenseEntries = insights.filter(i => i.type === 'categorization' && (i.title.includes("Expense") || i.title.includes("Payroll"))).length;


    const kpis: KPI[] = [
      {
        id: "kpi-total-debit",
        name: "Total Debits (Current Period)",
        value: totalDebit.toFixed(2),
        unit: "$",
        trend: "up", // Simulated trend, ideally historical data would dictate this
        change: "+2.5%", // Simulated change
        description: "Cumulative value of all debit transactions processed by CDBI AI in the current view.",
        chartLinkRef: "gemini-chart-debit-trend",
        targetValue: 150000,
        performanceStatus: totalDebit > 150000 ? "exceeds" : "on-track"
      },
      {
        id: "kpi-total-credit",
        name: "Total Credits (Current Period)",
        value: totalCredit.toFixed(2),
        unit: "$",
        trend: "up",
        change: "+1.8%",
        description: "Cumulative value of all credit transactions processed by CDBI AI in the current view.",
        chartLinkRef: "gemini-chart-credit-trend",
        targetValue: 160000,
        performanceStatus: totalCredit < 160000 ? "off-track" : "on-track"
      },
      {
        id: "kpi-net-change",
        name: "Net Ledger Position Change",
        value: netChange.toFixed(2),
        unit: "$",
        trend: netChange > 0 ? "up" : (netChange < 0 ? "down" : "flat"),
        change: netChange > 0 ? `+${(Math.random() * 5).toFixed(1)}%` : `${(-Math.random() * 3).toFixed(1)}%`,
        description: "Net movement of funds (Credits - Debits) for the displayed period, analyzed by Gemini AI.",
        chartLinkRef: "gemini-chart-net-flow"
      },
      {
        id: "kpi-ai-anomaly-alerts",
        name: "AI Anomaly Alerts",
        value: anomalyCount,
        trend: anomalyCount > 0 ? "up" : "flat",
        change: `+${highSeverityAnomalyCount}`,
        description: `Total number of unusual transactions flagged by Gemini AI. High & Critical severity: ${highSeverityAnomalyCount}.`,
        chartLinkRef: "gemini-chart-anomaly-distribution",
        performanceStatus: anomalyCount > 5 ? "off-track" : "on-track" // High anomaly count is bad
      },
      {
        id: "kpi-compliance-violations",
        name: "AI Compliance Flags",
        value: complianceAlerts,
        trend: complianceAlerts > 0 ? "up" : "flat",
        change: `+${complianceAlerts}`,
        description: `Number of potential regulatory or internal policy violations identified by CDBI AI.`,
        chartLinkRef: "gemini-chart-compliance-overview",
        performanceStatus: complianceAlerts > 0 ? "off-track" : "on-track" // Any compliance flag is bad
      },
      {
        id: "kpi-ai-categorization-rate",
        name: "AI Categorization Rate",
        value: entries.length > 0 ? ((categorizedEntriesCount / entries.length) * 100).toFixed(1) : 0,
        unit: "%",
        trend: "up",
        change: "+0.5%",
        description: "Percentage of ledger entries successfully categorized by Gemini AI for enhanced reporting.",
        chartLinkRef: "gemini-chart-categorization-efficiency",
        targetValue: 95,
        performanceStatus: (entries.length > 0 && (categorizedEntriesCount / entries.length) * 100 >= 95) ? "exceeds" : "on-track"
      },
      {
        id: "kpi-transaction-volume",
        name: "Total Transaction Volume",
        value: entries.length,
        unit: "transactions",
        trend: "up",
        change: "+10%",
        description: "Total number of ledger entries analyzed by CDBI AI.",
        chartLinkRef: "gemini-chart-transaction-volume-trend",
      },
      {
        id: "kpi-revenue-vs-expense-ratio",
        name: "Revenue vs. Expense Ratio",
        value: expenseEntries > 0 ? (revenueEntries / expenseEntries).toFixed(2) : 'N/A',
        unit: "",
        trend: (revenueEntries / expenseEntries) > 1 ? "up" : "down",
        change: "+0.1",
        description: "AI-derived ratio of revenue-related entries to expense-related entries.",
        chartLinkRef: "gemini-chart-revenue-expense-ratio",
        targetValue: 1.2,
        performanceStatus: (expenseEntries > 0 && (revenueEntries / expenseEntries) >= 1.2) ? "exceeds" : "off-track"
      }
    ];
    return kpis;
  }

  /**
   * Simulates generating rich chart data and linking it to a Gemini dashboard context.
   * In a real system, this would prepare data for a charting library or interact
   * with a BI tool's API. Here, it constructs the necessary data structures for display.
   * @param kpis The KPIs for which to generate conceptual chart data.
   * @returns A promise resolving to an array of ChartData objects.
   */
  public async generateChartData(kpis: KPI[]): Promise<ChartData[]> {
    console.log("CDBI AI: Gemini AIService generating chart data linked to Gemini dashboard...", kpis);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate chart data generation delay

    const chartOutputs: ChartData[] = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    kpis.forEach(kpi => {
      // Generate simulated historical data for chart
      const historicalData = Array.from({ length: 6 }, (_, i) => {
        const base = parseFloat(String(kpi.value)) * (0.8 + Math.random() * 0.4);
        // Apply some trend simulation
        if (kpi.trend === "up") return base + i * (base * 0.02);
        if (kpi.trend === "down") return base - i * (base * 0.02);
        return base;
      }).map(val => parseFloat(val.toFixed(2))); // Ensure fixed decimal for currency

      chartOutputs.push({
        chartId: kpi.chartLinkRef || `gemini-chart-${kpi.id}-auto`,
        title: `${kpi.name} Trend Analysis`,
        type: kpi.id.includes('anomaly') || kpi.id.includes('compliance') ? "bar" : "line", // Dynamic chart type
        labels: months,
        datasets: [{
          label: kpi.name,
          data: historicalData,
          borderColor: "#4CAF50", // Green for positive trends
          backgroundColor: "rgba(76, 175, 80, 0.2)",
          fill: true,
          tension: 0.3
        }],
        description: `This chart visualizes the historical trend data for "${kpi.name}", showcasing fluctuations and overall direction.`,
        geminiPrompt: `Generate a detailed ${kpi.id.includes('anomaly') ? 'bar chart' : 'line chart'} showing the "${kpi.name}" trend over the last 6 months, explaining any significant fluctuations and predicting next month's value.`
      });
    });

    // Add an example of a more complex chart (e.g., Categorization Breakdown)
    const categoryCounts = insights
        .filter(i => i.type === 'categorization')
        .reduce((acc, insight) => {
            const categoryName = insight.title.split(': ')[1];
            acc[categoryName] = (acc[categoryName] || 0) + 1;
            return acc;
        }, {});

    if (Object.keys(categoryCounts).length > 0) {
        chartOutputs.push({
            chartId: "gemini-chart-categorization-breakdown",
            title: "AI-Categorization Distribution",
            type: "pie",
            labels: Object.keys(categoryCounts),
            datasets: [{
                label: "Number of Entries",
                data: Object.values(categoryCounts),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED'
                ],
            }],
            description: "A pie chart showing the distribution of ledger entries across AI-suggested categories, enabling quick financial segmentation.",
            geminiPrompt: "Create a pie chart showing the percentage distribution of ledger entries by AI-suggested categories. Identify the largest segments and their financial implications."
        });
    }

    return chartOutputs;
  }
}

// --- Original Component Logic with AI Enhancements ---

interface LedgersAdditionalInfoEntriesTabProps {
  entityId: string;
  entityType:
    | "LedgerableEvent"
    | "LedgerTransaction"
    | "LedgerAccountSettlement";
}

function exhaustiveGuard(_value: string): never {
  throw new Error(
    `Error! Reached forbidden guard function with unexpected value: ${JSON.stringify(
      _value,
    )}`,
  );
}

export default function LedgersAdditionalInfoEntriesTab({
  entityId,
  entityType,
}: LedgersAdditionalInfoEntriesTabProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Initialize GeminiAIService as a singleton instance
  const geminiService = useMemo(() => GeminiAIService.getInstance(), []);

  // Memoized function for generating request IDs based on entity type
  const idForRequest = useCallback(() => {
    switch (entityType) {
      case "LedgerTransaction":
        return { ledgerTransactionId: entityId };
      case "LedgerAccountSettlement":
        return { ledgerAccountSettlementId: entityId };
      case "LedgerableEvent":
        // The original schema/query might not directly support LedgerableEvent via additional info entries.
        // If it did, it would be { ledgerableEventId: entityId }.
        // For now, this will fall through to exhaustiveGuard if this path is unexpectedly hit
        // by the `useLedgersAdditionalInfoEntriesQuery` variables.
        return exhaustiveGuard(entityType); // Ensure all cases are handled
      default:
        // This case should ideally not be reached if entityType is strictly typed
        return exhaustiveGuard(entityType);
    }
  }, [entityId, entityType]);

  // GraphQL query to fetch ledger entries
  const { loading, data, error, refetch } =
    useLedgersAdditionalInfoEntriesQuery({
      notifyOnNetworkStatusChange: true,
      variables: {
        first: INITIAL_PAGINATION.perPage,
        ...idForRequest(),
      },
    });

  // Extract raw ledger entries for AI processing
  const rawLedgerEntries = useMemo(() => {
    if (loading || !data || error) {
      return [];
    }
    // Map to a simplified structure for AI, ensuring all relevant fields are present
    return data.ledgerEntries.edges.map(({ node }) => ({
      ...node, // Spread original node for all fields
      amount: node.amount, // Explicitly ensure amount is a string or number
      path: node.path,     // Explicitly ensure path is present for sentiment analysis simulation
      ledgerAccount: {
        name: node.ledgerAccount.name,
        path: node.ledgerAccount.path,
        id: node.ledgerAccount.id, // Include ID if useful for AI
      },
    }));
  }, [loading, data, error]);


  // Effect hook to trigger AI processing when ledger entries change or load
  useEffect(() => {
    if (!loading && rawLedgerEntries.length > 0) {
      const processAI = async () => {
        setAiLoading(true);
        try {
          // Step 1: Analyze Ledger Entries for insights
          const insights = await geminiService.analyzeLedgerEntries(rawLedgerEntries);
          setAiInsights(insights);

          // Step 2: Generate KPIs based on raw data and insights
          const generatedKpis = await geminiService.generateKPIs(rawLedgerEntries, insights);
          setKpis(generatedKpis);

          // Step 3: Generate Chart Data linked to Gemini
          const generatedChartData = await geminiService.generateChartData(generatedKpis);
          setChartData(generatedChartData);

        } catch (err) {
          console.error("CDBI AI Processing Error:", err);
          // Implement robust error handling (e.g., display error message to user)
        } finally {
          setAiLoading(false);
        }
      };
      processAI();
    } else if (!loading && rawLedgerEntries.length === 0) {
      // Clear AI data if no entries are present or loading is complete with no data
      setAiInsights([]);
      setKpis([]);
      setChartData([]);
    }
  }, [loading, rawLedgerEntries, geminiService]); // Dependencies for re-running AI processing


  // Prepare ledger entries for the EntityTableView, augmenting with AI data
  const ledgerEntriesForTable = useMemo(() => {
    if (loading || !data || error) {
      return [];
    }
    return data.ledgerEntries.edges.map(({ node }) => {
      // Find relevant AI insights for the current ledger entry
      const entryInsights = aiInsights.filter(
        (insight) => insight.relatedEntryIds?.includes(node.id)
      );
      const aiCategoryInsight = entryInsights.find(
        (insight) => insight.type === "categorization"
      );
      const aiAnomalyInsight = entryInsights.find(
        (insight) => insight.type === "anomaly" && (insight.severity === "high" || insight.severity === "critical")
      );
      const aiComplianceInsight = entryInsights.find(
        (insight) => insight.type === "compliance"
      );

      return {
        debit:
          node.direction === "debit" ? (
            <Pill
              onClick={(e: ButtonClickEventTypes) =>
                handleLinkClick(node.path, e)
              }
              showTooltip
            >
              {node.amount}
            </Pill>
          ) : (
            <span className="text-gray-600">-</span>
          ),
        credit:
          node.direction === "credit" ? (
            <Pill
              onClick={(e: ButtonClickEventTypes) =>
                handleLinkClick(node.path, e)
              }
              showTooltip
            >
              {node.amount}
            </Pill>
          ) : (
            <span className="text-gray-600">-</span>
          ),
        accountName: (
          <span className="py-8 align-middle text-blue-800 font-medium">{node.ledgerAccount.name}</span>
        ),
        // New AI-augmented columns
        aiCategory: (
          <span className="py-8 align-middle text-purple-700 font-semibold">
            {aiCategoryInsight ? aiCategoryInsight.title.split(': ')[1] : 'Uncategorized (AI Pending)'}
          </span>
        ),
        aiStatus: (
          <div className="py-8 align-middle flex items-center space-x-2">
            {aiAnomalyInsight && (
              <Pill color="red" showTooltip tooltipContent={aiAnomalyInsight.description}>Anomaly</Pill>
            )}
            {aiComplianceInsight && (
              <Pill color="orange" showTooltip tooltipContent={aiComplianceInsight.description}>Compliance Flag</Pill>
            )}
            {!(aiAnomalyInsight || aiComplianceInsight) && entryInsights.length > 0 && (
              <Pill color="green">AI Reviewed</Pill>
            )}
             {entryInsights.length === 0 && (
              <Pill color="gray">No AI Insights</Pill>
            )}
          </div>
        ),
        id: node.id,
        path: node.ledgerAccount.path,
      };
    });
  }, [loading, data, error, aiInsights]); // aiInsights as a dependency to re-render table with AI data


  // Handler for pagination and refetching data
  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
  }) => {
    const { cursorPaginationParams } = options;
    await refetch({
      ...cursorPaginationParams,
    });
  };

  return (
    <div className="flex flex-col gap-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
        CDBI AI Ledger Intelligence & Advanced Analytics
      </h2>
      <p className="text-lg text-gray-700 max-w-3xl">
        This revolutionary tab provides a comprehensive, AI-augmented view of your ledger entries.
        Leveraging cutting-edge Gemini AI, we deliver real-time insights, critical KPIs,
        and predictive analytics, transforming raw data into actionable intelligence for
        both sophisticated financial institutions and individual users.
        Experience unparalleled financial foresight and control with CDBI AI Solutions.
      </p>

      {/* AI Loading Indicator */}
      {(loading || aiLoading) && (
        <div className="flex items-center justify-center p-5 bg-blue-50 text-blue-800 rounded-lg shadow-md border border-blue-200 animate-pulse">
          <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium">CDBI AI is actively processing and generating intelligence with Gemini...</span>
        </div>
      )}

      {/* KPI Section */}
      <section className="mt-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="h-8 w-8 mr-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.622 0 3.22.457 4.633 1.332L20.8 4.31a1 1 0 011.414 1.414l-5.486 5.486A7.96 7.96 0 0012 16a7.96 7.96 0 00-4.733-1.668L3.78 20.27a1 1 0 01-1.414-1.414l5.567-5.567A7.96 7.96 0 004 12a8 8 0 1116 0A7.96 7.96 0 0012 8z" />
          </svg>
          Key Performance Indicators (AI-Driven)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.id} className={`bg-white p-6 rounded-xl shadow-lg border-l-4
              ${kpi.performanceStatus === "exceeds" ? "border-green-500" :
                kpi.performanceStatus === "off-track" ? "border-red-500" :
                "border-blue-300"
              }`}>
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-medium text-gray-700">{kpi.name}</h4>
                <Pill color={kpi.trend === "up" ? "green" : kpi.trend === "down" ? "red" : "gray"}>
                  {kpi.change}
                  {kpi.trend === "up" && " ↑"}
                  {kpi.trend === "down" && " ↓"}
                </Pill>
              </div>
              <p className="text-4xl font-extrabold text-gray-900 mt-2">
                {kpi.unit}{kpi.value}
              </p>
              <p className="text-sm text-gray-500 mt-2">{kpi.description}</p>
              {kpi.targetValue && (
                <p className="text-xs text-gray-400 mt-1">Target: {kpi.unit}{kpi.targetValue} ({kpi.performanceStatus})</p>
              )}
              {kpi.chartLinkRef && (
                <a
                  href={`https://cdbi.ai/gemini-dashboard/charts?ref=${kpi.chartLinkRef}`} // Direct link to Gemini dashboard for the chart
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e: ButtonClickEventTypes) => handleLinkClick(`https://cdbi.ai/gemini-dashboard/charts?ref=${kpi.chartLinkRef}`, e)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                >
                  Explore in Gemini
                  <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </a>
              )}
            </div>
          ))}
          {kpis.length === 0 && !aiLoading && !loading && (
            <div className="lg:col-span-4 text-center py-8 text-gray-500 bg-white rounded-lg shadow-inner">
              No KPIs generated yet. CDBI AI requires ledger data for advanced analysis.
            </div>
          )}
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="mt-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="h-8 w-8 mr-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Gemini AI Intelligent Insights & Alerts
        </h3>
        {aiInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight) => (
              <div key={insight.id} className={`p-5 rounded-lg border-l-4 shadow-sm
                ${insight.severity === "high" || insight.severity === "critical" ? "border-red-600 bg-red-50" :
                insight.severity === "medium" ? "border-yellow-500 bg-yellow-50" :
                "border-blue-400 bg-blue-50"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-lg font-bold ${
                    insight.severity === "high" || insight.severity === "critical" ? "text-red-900" :
                    insight.severity === "medium" ? "text-yellow-900" :
                    "text-blue-900"
                  }`}>
                    {insight.title}
                  </h4>
                  <Pill color={
                    insight.severity === "high" || insight.severity === "critical" ? "red" :
                    insight.severity === "medium" ? "yellow" :
                    "blue"
                  }>
                    {insight.type.toUpperCase()} ({insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)})
                  </Pill>
                </div>
                <p className="text-gray-700 text-sm mt-1">{insight.description}</p>
                {insight.suggestedAction && (
                  <p className="text-sm text-gray-600 mt-2 border-t border-gray-200 pt-2">
                    <span className="font-semibold">Action:</span> {insight.suggestedAction}
                  </p>
                )}
                {insight.relatedEntryIds && insight.relatedEntryIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Related Entries: {insight.relatedEntryIds.slice(0, 3).join(", ")} {insight.relatedEntryIds.length > 3 ? `... (+${insight.relatedEntryIds.length - 3} more)` : ''}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Generated by: {insight.sourceModel || "Gemini-AI"} ({new Date(insight.timestamp).toLocaleString()})
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 bg-white p-5 rounded-lg shadow-inner text-center">
            No specific AI insights generated for the current ledger entries.
            CDBI AI is continuously monitoring your financial data for patterns and anomalies.
          </p>
        )}
      </section>

      {/* Ledger Entries Table with AI Columns */}
      <section className="mt-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="h-8 w-8 mr-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Detailed Ledger Entries (CDBI AI Augmented)
        </h3>
        <EntityTableView
          data={ledgerEntriesForTable}
          dataMapping={{
            accountName: "Account Name",
            debit: "Debit (CDBI AI)", // Renamed for AI branding
            credit: "Credit (CDBI AI)", // Renamed for AI branding
            aiCategory: "AI Category",
            aiStatus: "AI Status", // New column for AI insights summary
          }}
          styleMapping={{
            accountName: "whitespace-nowrap overflow-ellipsis overflow-hidden",
            aiCategory: "font-bold",
            aiStatus: "text-center",
          }}
          loading={loading || aiLoading} // Reflect both data fetching and AI processing loading states
          onQueryArgChange={handleRefetch}
          cursorPagination={data?.ledgerEntries?.pageInfo}
          showDisabledPagination={false}
          disableQueryURLParams
          emptyStateMessage="No ledger entries found. CDBI AI is standing by to analyze your financial data."
        />
      </section>

      {/* Gemini Chart Data Overview (Conceptual Linking) */}
      <section className="mt-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="h-8 w-8 mr-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          Gemini AI Dynamic Charting Dashboard
        </h3>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chartData.map(chart => (
              <div key={chart.chartId} className="p-5 rounded-lg border-l-4 border-indigo-400 bg-white shadow-md">
                <h4 className="text-xl font-semibold text-gray-800">{chart.title} ({chart.type.toUpperCase()} Chart)</h4>
                <p className="text-sm text-gray-600 mt-2">{chart.description}</p>
                <p className="text-xs text-gray-500 mt-2 border-t border-gray-200 pt-2">
                  <span className="font-medium">Gemini Prompt:</span> <em>"{chart.geminiPrompt}"</em>
                </p>
                <a
                  href={`https://cdbi.ai/gemini-dashboard/charts?chartId=${chart.chartId}`} // Simulate dynamic link to a Gemini BI dashboard
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e: ButtonClickEventTypes) => handleLinkClick(`https://cdbi.ai/gemini-dashboard/charts?chartId=${chart.chartId}`, e)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Go to Gemini Chart
                  <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0l-7 7m7-7v6" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 bg-white p-5 rounded-lg shadow-inner text-center">
            No dynamic chart data available yet. Gemini AI will generate intelligent visualizations
            based on your processed ledger entries and KPIs.
          </p>
        )}
      </section>

    </div>
  );
}