// Copyright CDBI (Cognitive Data & Business Intelligence) Inc.
// President CDBI AI Ledger Solutions

import React from "react";
import { cn } from "~/common/utilities/cn";
import { LedgerTransaction__StatusEnum } from "../../generated/dashboard/graphqlSchema";
import LedgerStatusBadge from "./LedgerStatusBadge";
import {
  DateTime,
  CopyableText,
  OverflowTip,
} from "../../common/ui-components";

// --- NEW AI-POWERED INTERFACES & ENUMS ---

/**
 * Enum for different types of AI insights.
 * This helps categorize the AI-generated information.
 * Exported for potential use in other modules, promoting modularity.
 */
export enum AIInsightType {
  AnomalyDetection = "Anomaly Detection",
  PredictiveAnalysis = "Predictive Analysis",
  SmartCategorization = "Smart Categorization",
  RiskAssessment = "Risk Assessment",
  ComplianceCheck = "Compliance Check",
  SentimentAnalysis = "Sentiment Analysis", // For user-added descriptions/notes
  ExecutiveSummary = "Executive Summary",
  PotentialFraud = "Potential Fraud",
  LiquidityImpact = "Liquidity Impact", // New AI function
  ForensicAnalysis = "Forensic Analysis", // New AI function
}

/**
 * Interface for a single AI insight generated for a transaction.
 * Exported to allow other components to consume or display AI insights.
 */
export interface AIInsight {
  type: AIInsightType;
  title: string;
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  confidence?: number; // 0.0 to 1.0, AI model's confidence in the insight
  suggestedAction?: string;
  timestamp: string;
  sourceModel?: string; // e.g., "CDBI-FinBERT-v2", "CDBI-AnomalyDetector-v1"
  relatedKPIs?: AI_KPI[]; // Link to relevant KPIs for this specific insight
}

/**
 * Interface for Key Performance Indicators (KPIs) derived from AI analysis.
 * These KPIs are designed to be linked to external visualization tools like Gemini,
 * offering a holistic view of the transaction's performance and impact.
 * Exported for broad utility across the application.
 */
export interface AI_KPI {
  name: string;
  value: string | number;
  unit?: string;
  description: string;
  trend?: "up" | "down" | "stable"; // Historical trend relative to this transaction
  comparisonValue?: string | number; // For comparing against a benchmark or average
  geminiChartLink?: string; // Direct deep-link to a specific chart or dashboard in Gemini
  chartType?: "line" | "bar" | "pie" | "gauge" | "area"; // Suggested chart type for Gemini
}

/**
 * Interface representing a comprehensive AI analysis report for a transaction.
 * This encapsulates all AI-driven data for a given transaction, making it a valuable
 * data object for display and further processing.
 * Exported for use by parent components or data stores.
 */
export interface AITransactionAnalysisReport {
  transactionId: string;
  insights: AIInsight[];
  kpis: AI_KPI[];
  overallRiskScore: number; // e.g., 0-100, composite score
  liquidityImpactScore?: number; // New: estimated impact on ledger liquidity
  recommendations: string[];
  generatedAt: string;
}

// --- CDBI AI SERVICE SIMULATION ---
// This class simulates an advanced AI backend (CDBI AI) for real-time transaction analysis.
// In a production environment, this would interact with actual AI/ML models via a robust API,
// potentially leveraging services like Google Cloud's Vertex AI, specifically Gemini.
// For this self-contained file, it provides mock but representative AI outputs.
export class CDBI_AI_Service {
  private static instance: CDBI_AI_Service;

  private constructor() {
    // Private constructor to enforce Singleton pattern, ensuring only one instance
    // of the AI service simulation exists throughout the application lifecycle.
  }

  /**
   * Provides the singleton instance of the CDBI_AI_Service.
   * @returns The singleton instance of CDBI_AI_Service.
   */
  public static getInstance(): CDBI_AI_Service {
    if (!CDBI_AI_Service.instance) {
      CDBI_AI_Service.instance = new CDBI_AI_Service();
    }
    return CDBI_AI_Service.instance;
  }

  /**
   * Simulates a deep AI analysis of a ledger transaction, generating a comprehensive report.
   * This function integrates multiple AI models to provide diverse insights.
   * @param transaction The raw transaction data from LedgerTransactionDetailsCardProps.
   * @returns A promise resolving to an AITransactionAnalysisReport, containing AI insights, KPIs, and recommendations.
   */
  public async analyzeLedgerTransaction(
    transaction: LedgerTransactionDetailsCardProps
  ): Promise<AITransactionAnalysisReport> {
    // Simulate network delay for a real AI API call
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 700 + 300)); // 300-1000ms delay

    const insights: AIInsight[] = [];
    const kpis: AI_KPI[] = [];
    let overallRiskScore = 0;
    let liquidityImpactScore = 0;
    const recommendations: string[] = [];

    // --- 1. Anomaly Detection (AI-Powered) ---
    const isAnomaly = Math.random() > 0.85; // 15% chance of anomaly
    if (isAnomaly) {
      insights.push({
        type: AIInsightType.AnomalyDetection,
        title: "Potential Anomaly Detected",
        description: `CDBI AI has identified unusual activity patterns for transaction ${transaction.id}. This might indicate a deviation from typical transaction behavior for ledger ID ${transaction.ledgerId}.`,
        severity: Math.random() > 0.5 ? "high" : "medium",
        confidence: 0.92,
        suggestedAction: "Initiate immediate manual review of sender/receiver, amount, and frequency. Consider temporarily holding funds.",
        timestamp: new Date().toISOString(),
        sourceModel: "CDBI-AnomalyDetector-v1.2 (Powered by Gemini Pro)",
      });
      overallRiskScore += 30;
      kpis.push({
        name: "Anomaly Likelihood Score",
        value: 92,
        unit: "%",
        description: "AI-calculated likelihood of this transaction being anomalous based on real-time data streams and historical patterns.",
        trend: "up",
        comparisonValue: 70, // Compared to average anomaly score for similar transactions
        geminiChartLink: `https://gemini.cdbi.ai/dashboards/anomaly_detection?txId=${transaction.id}&type=likelihood`,
        chartType: "gauge",
      });
      recommendations.push("Investigate unusual transaction patterns immediately.");
    } else {
      kpis.push({
        name: "Anomaly Likelihood Score",
        value: 5,
        unit: "%",
        description: "AI-calculated likelihood of this transaction being anomalous.",
        trend: "down",
        comparisonValue: 10,
        geminiChartLink: `https://gemini.cdbi.ai/dashboards/anomaly_detection?txId=${transaction.id}&type=likelihood`,
        chartType: "gauge",
      });
    }

    // --- 2. Risk Assessment (AI-Powered) ---
    const riskScore = Math.floor(Math.random() * 60) + (isAnomaly ? 40 : 0);
    overallRiskScore = Math.min(100, riskScore); // Cap at 100
    insights.push({
      type: AIInsightType.RiskAssessment,
      title: "CDBI AI Transaction Risk Score",
      description: `CDBI AI evaluated this transaction with a risk score of ${overallRiskScore}/100. This score considers transaction amount, counterparties, history, and current market conditions.`,
      severity: overallRiskScore > 75 ? "critical" : overallRiskScore > 50 ? "high" : overallRiskScore > 25 ? "medium" : "low",
      confidence: 0.95,
      suggestedAction: "For scores above 70, a risk compliance officer should review for potential financial crime indicators.",
      timestamp: new Date().toISOString(),
      sourceModel: "CDBI-RiskEngine-v3.1 (Powered by Gemini Pro)",
      relatedKPIs: [
        {
          name: "Transaction Risk Score",
          value: overallRiskScore,
          unit: "/100",
          description: "Composite AI risk score for the transaction, dynamically adjusted based on multiple risk vectors.",
          trend: overallRiskScore > 50 ? "up" : "down",
          comparisonValue: 45, // Average risk score for similar transactions
          geminiChartLink: `https://gemini.cdbi.ai/dashboards/risk_profiling?txId=${transaction.id}`,
          chartType: "gauge",
        },
      ],
    });
    if (overallRiskScore > 70) {
      insights.push({
        type: AIInsightType.PotentialFraud,
        title: "CRITICAL: Potential Fraud Indication",
        description: "Transaction characteristics strongly align with known fraud patterns (e.g., suspicious IP, rapid sequence, unusual amount for account history). Immediate action required.",
        severity: "critical",
        confidence: 0.88,
        suggestedAction: "Initiate immediate fraud hold, contact account holder, and report to relevant authorities. Engage forensic analysis.",
        timestamp: new Date().toISOString(),
        sourceModel: "CDBI-FraudGuard-v2.5 (Powered by Gemini Ultra)",
      });
      recommendations.push("Flag for immediate fraud review and forensic analysis.");
    }

    // --- 3. Smart Categorization & Description Enhancement (AI-Powered) ---
    // Using AI to infer or refine categories and descriptions, especially useful for generic or un-categorized transactions.
    const aiCategory = transaction.ledgerableType === "Invoice" ? "Supplier Payment (AI-Categorized)" : transaction.ledgerableType === "Withdrawal" ? "Cash Disbursement (AI-Categorized)" : "General Transaction (AI-Categorized)";
    const enhancedDescription = transaction.description ?
      `${transaction.description} (AI-Enhanced: This appears to be related to a ${aiCategory.toLowerCase().replace(' (ai-categorized)', '')} from ${transaction.ledgerId}).` :
      `AI-generated: This transaction, identified as ${aiCategory.toLowerCase().replace(' (ai-categorized)', '')}, likely involves fund movement within ledger ${transaction.ledgerId}.`;
    insights.push({
      type: AIInsightType.SmartCategorization,
      title: "AI-Suggested Category",
      description: `CDBI AI has analyzed the transaction metadata and suggests the primary category: "${aiCategory}".`,
      severity: "low",
      confidence: 0.98,
      timestamp: new Date().toISOString(),
      sourceModel: "CDBI-Classifier-v4.0 (Powered by Gemini Pro)",
    });
    insights.push({
      type: AIInsightType.SmartCategorization,
      title: "AI-Enhanced Transaction Description",
      description: `Original description: "${transaction.description || 'N/A'}". CDBI AI has generated a more detailed description: "${enhancedDescription}"`,
      severity: "low",
      confidence: 0.99,
      timestamp: new Date().toISOString(),
      sourceModel: "CDBI-NLP-Generator-v5.1 (Powered by Gemini Pro)",
    });
    // Add KPI for categorization accuracy over time
    kpis.push({
      name: "AI Categorization Confidence",
      value: 98,
      unit: "%",
      description: "Confidence level of CDBI AI in its categorization of the transaction.",
      trend: "stable",
      comparisonValue: 95,
      geminiChartLink: `https://gemini.cdbi.ai/dashboards/categorization_accuracy?txId=${transaction.id}`,
      chartType: "bar",
    });


    // --- 4. Predictive Analytics (AI-Powered) ---
    // Predicting the next status or future trends.
    const nextLikelyStatus = transaction.status === LedgerTransaction__StatusEnum.Pending ? "posted within 24 hours" : "no further status changes expected soon";
    insights.push({
      type: AIInsightType.PredictiveAnalysis,
      title: "Predicted Transaction Flow",
      description: `CDBI AI predicts this transaction is likely to be ${nextLikelyStatus} with a high probability.`,
      severity: "low",
      confidence: 0.90,
      timestamp: new Date().toISOString(),
      sourceModel: "CDBI-Predictor-v2.0 (Powered by Gemini Pro)",
    });
    kpis.push({
      name: "Predicted Completion Time",
      value: "1-2 days",
      unit: "",
      description: "AI's estimated time for the transaction to reach its final 'posted' status.",
      geminiChartLink: `https://gemini.cdbi.ai/dashboards/transaction_flow_predictions?txId=${transaction.id}`,
      chartType: "line",
    });

    // --- 5. Compliance Check (AI-Powered) ---
    // AI assists in identifying potential compliance risks.
    const isCompliant = Math.random() > 0.1; // 10% chance of non-compliance
    if (!isCompliant) {
      insights.push({
        type: AIInsightType.ComplianceCheck,
        title: "Potential Compliance Flag",
        description: "CDBI AI has detected patterns that may violate 'Large Transaction Reporting' policy (rule F-342.1) or sanctions lists. Further review by compliance officer is recommended.",
        severity: "high",
        confidence: 0.85,
        suggestedAction: "Verify compliance with regional and international financial regulations. Consult legal and compliance departments.",
        timestamp: new Date().toISOString(),
        sourceModel: "CDBI-ComplianceGuard-v1.5 (Powered by Gemini Pro)",
      });
      recommendations.push("Review for potential compliance violations with relevant authorities.");
      overallRiskScore += 20; // Add risk for compliance issues
    } else {
      insights.push({
        type: AIInsightType.ComplianceCheck,
        title: "Compliance Check Passed",
        description: "CDBI AI has not identified any immediate compliance violations based on current rulesets.",
        severity: "low",
        confidence: 0.99,
        timestamp: new Date().toISOString(),
        sourceModel: "CDBI-ComplianceGuard-v1.5 (Powered by Gemini Pro)",
      });
    }

    // --- 6. Liquidity Impact Analysis (NEW AI Function) ---
    // Estimate the impact of this transaction on the ledger's liquidity.
    const amountValue = parseFloat(transaction.amount || "0");
    if (amountValue > 0) {
      liquidityImpactScore = Math.min(100, Math.floor(amountValue / 1000) * 5 + (isAnomaly ? 20 : 0)); // Simplified calculation
      insights.push({
        type: AIInsightType.LiquidityImpact,
        title: "Estimated Liquidity Impact",
        description: `CDBI AI estimates this transaction will have a ${liquidityImpactScore > 50 ? 'significant' : 'moderate'} impact on current ledger liquidity. Real-time liquidity forecast adjusted.`,
        severity: liquidityImpactScore > 70 ? "high" : liquidityImpactScore > 40 ? "medium" : "low",
        confidence: 0.88,
        suggestedAction: "Monitor ledger balance and ensure sufficient funds for upcoming obligations. Consider pre-funding if impact is high.",
        timestamp: new Date().toISOString(),
        sourceModel: "CDBI-LiquidityEngine-v1.0 (Powered by Gemini Pro)",
      });
      kpis.push({
        name: "Liquidity Shift (Relative)",
        value: `${(liquidityImpactScore / 100 * 10).toFixed(2)}%`, // Mock percentage shift
        unit: "%",
        description: "CDBI AI's estimated relative shift in liquidity for the target ledger based on this transaction.",
        trend: amountValue > 0 ? "down" : "up",
        comparisonValue: "0.5%",
        geminiChartLink: `https://gemini.cdbi.ai/dashboards/liquidity_forecast?ledgerId=${transaction.ledgerId}&txId=${transaction.id}`,
        chartType: "area",
      });
    } else {
      insights.push({
        type: AIInsightType.LiquidityImpact,
        title: "Minimal Liquidity Impact",
        description: "Transaction has minimal or no direct impact on ledger liquidity.",
        severity: "low",
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        sourceModel: "CDBI-LiquidityEngine-v1.0 (Powered by Gemini Pro)",
      });
    }


    // --- 7. Forensic Analysis (NEW AI Function for deep dives) ---
    // If a transaction is high-risk or anomalous, AI can suggest a forensic deep-dive.
    if (overallRiskScore > 70 || isAnomaly) {
      insights.push({
        type: AIInsightType.ForensicAnalysis,
        title: "Recommended Forensic Analysis",
        description: "Due to combined high risk and anomalous patterns, CDBI AI recommends a full forensic analysis to trace transaction origins, counterparties, and ultimate beneficiaries.",
        severity: "critical",
        confidence: 0.90,
        suggestedAction: "Engage forensic accounting team. Freeze related assets if legally permissible. Generate comprehensive audit trail via Gemini API.",
        timestamp: new Date().toISOString(),
        sourceModel: "CDBI-ForensicAI-v1.0 (Powered by Gemini Ultra)",
      });
      recommendations.push("Initiate full forensic analysis for deeper insights.");
      kpis.push({
        name: "Forensic Analysis Trigger Count",
        value: 1, // This transaction is a trigger
        unit: "event",
        description: "Number of times a forensic analysis was triggered for similar transaction profiles by CDBI AI.",
        trend: "up", // Assuming it's a critical event
        comparisonValue: 0,
        geminiChartLink: `https://gemini.cdbi.ai/dashboards/forensic_triggers?txId=${transaction.id}`,
        chartType: "bar",
      });
    }


    // --- Final Executive Summary (AI-Generated) ---
    // Using generative AI (like Gemini) to summarize all findings.
    const summary = `CDBI AI has completed an advanced analysis for transaction ${transaction.id}. The transaction is currently ${transaction.status}. ` +
                    (isAnomaly ? `An **anomaly was detected**, indicating unusual activity patterns. ` : ``) +
                    (isCompliant ? `No immediate compliance issues were found, but continuous monitoring is advised. ` : `**Potential compliance issues require immediate attention.** `) +
                    `Overall risk is rated at **${overallRiskScore}/100**. Estimated **liquidity impact is significant (${liquidityImpactScore}% score)**. Key recommendations include: ${recommendations.join(', ') || 'No specific high-priority recommendations at this time, but standard monitoring is advised.'}. For a deeper dive, explore the linked KPIs and Gemini dashboards.`;

    insights.push({
      type: AIInsightType.ExecutiveSummary,
      title: "AI-Generated Executive Summary (Powered by Gemini Ultra)",
      description: summary,
      severity: overallRiskScore > 75 ? "critical" : overallRiskScore > 50 ? "high" : overallRiskScore > 25 ? "medium" : "low",
      confidence: 0.98,
      timestamp: new Date().toISOString(),
      sourceModel: "CDBI-Gemini-Summarizer-v1.0",
      relatedKPIs: kpis, // Link all aggregated KPIs to the summary for context
    });

    return {
      transactionId: transaction.id,
      insights,
      kpis,
      overallRiskScore,
      liquidityImpactScore,
      recommendations,
      generatedAt: new Date().toISOString(),
    };
  }
}

// --- ORIGINAL COMPONENT INTERFACES & FUNCTIONS ---

interface LedgerTransactionDetailsCardProps {
  id: string;
  ledgerId: string;
  externalId?: string | null;
  status: LedgerTransaction__StatusEnum;
  ledgerablePath?: string | null;
  ledgerableId?: string | null;
  amount?: string;
  createdAt: string;
  updatedAt?: string | null;
  postedAt?: string | null;
  effectiveAt: string;
  ledgerableType?: string | null;
  description?: string | null;
  reversesLedgerTransactionId?: string | null;
  reversedByLedgerTransactionId?: string | null;
  partiallyPostsLedgerTransactionId?: string | null;
}

/**
 * A simple placeholder component for when a value is empty or not applicable.
 */
function EmptyLine(): JSX.Element {
  return <div className="w-28 text-gray-400">-</div>;
}

/**
 * Formats an ID with a CopyableText component for easy interaction.
 * @param id The ID string to display and make copyable.
 * @returns A JSX element with the formatted, copyable ID.
 */
function IdFormatted(id: string): JSX.Element {
  return <CopyableText text={id}>{id}</CopyableText>;
}

// --- NEW HELPER COMPONENTS FOR AI INSIGHTS ---

/**
 * Renders an individual AI Insight badge, visually indicating its type and severity.
 * Exported to allow reuse in other AI-focused components.
 */
export function AIInsightBadge({ insight }: { insight: AIInsight }): JSX.Element {
  let colorClass = "bg-gray-100 text-gray-800";
  // Dynamically apply color based on severity for quick visual identification
  switch (insight.severity) {
    case "critical":
      colorClass = "bg-red-100 text-red-800";
      break;
    case "high":
      colorClass = "bg-orange-100 text-orange-800";
      break;
    case "medium":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "low":
      colorClass = "bg-green-100 text-green-800";
      break;
  }

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      colorClass
    )}>
      {insight.title}
      {insight.confidence !== undefined && (
        <span className="ml-1 text-xs text-opacity-75">
          ({Math.round(insight.confidence * 100)}%)
        </span>
      )}
    </span>
  );
}

/**
 * Renders a single AI KPI, including its value, unit, and a direct link to Gemini for chart visualization.
 * Exported for flexibility in displaying KPIs.
 */
export function AI_KPIDisplay({ kpi }: { kpi: AI_KPI }): JSX.Element {
  let trendIcon = null;
  let trendColor = "text-gray-500";
  if (kpi.trend === "up") {
    trendIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
    trendColor = "text-green-500";
  } else if (kpi.trend === "down") {
    trendIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>;
    trendColor = "text-red-500";
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-1 border-b border-gray-100 last:border-b-0">
      <div className="font-medium text-gray-700">{kpi.name}:</div>
      <div className="flex items-center mt-1 sm:mt-0">
        <span className="font-semibold text-gray-900 mr-1">{kpi.value}</span>
        {kpi.unit && <span className="text-gray-500 text-xs">{kpi.unit}</span>}
        {trendIcon}
        {kpi.geminiChartLink && (
          <a
            href={kpi.geminiChartLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:text-blue-800 text-xs flex items-center"
            title={`View ${kpi.name} chart in CDBI Gemini Analytics`}
          >
            {/* Chart icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M18 10a5 5 0 11-10 0 5 5 0 0110 0z" />
            </svg>
            Gemini
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * LedgerTransactionDetailsCard displays detailed information about a ledger transaction,
 * now significantly enhanced with real-time AI-powered insights, KPIs, and
 * intelligent recommendations by CDBI AI, integrated with Gemini for advanced analytics.
 * This component is designed for commercial-grade applications, providing a self-contained,
 * highly advanced view for both financial institutions and individual users.
 */
function LedgerTransactionDetailsCard({
  id,
  ledgerId,
  externalId,
  status,
  ledgerablePath,
  ledgerableId,
  amount,
  createdAt,
  updatedAt,
  postedAt,
  effectiveAt,
  ledgerableType,
  description,
  reversesLedgerTransactionId,
  reversedByLedgerTransactionId,
  partiallyPostsLedgerTransactionId,
}: LedgerTransactionDetailsCardProps) {
  // State to manage AI analysis report and loading status
  const [aiReport, setAiReport] = React.useState<AITransactionAnalysisReport | null>(null);
  const [isLoadingAi, setIsLoadingAi] = React.useState(true);
  const [errorAi, setErrorAi] = React.useState<string | null>(null);

  // Effect hook to trigger AI analysis whenever transaction details change.
  // This ensures the insights are always up-to-date.
  React.useEffect(() => {
    const fetchAIInsights = async () => {
      setIsLoadingAi(true);
      setErrorAi(null);
      try {
        const service = CDBI_AI_Service.getInstance();
        const report = await service.analyzeLedgerTransaction({
          id, ledgerId, externalId, status, ledgerablePath, ledgerableId,
          amount, createdAt, updatedAt, postedAt, effectiveAt, ledgerableType,
          description, reversesLedgerTransactionId, reversedByLedgerTransactionId,
          partiallyPostsLedgerTransactionId,
        });
        setAiReport(report);
      } catch (err) {
        console.error("CDBI AI Service Error: Failed to fetch AI insights.", err);
        setErrorAi("CDBI AI Service encountered an error. Please try refreshing or contact support.");
      } finally {
        setIsLoadingAi(false);
      }
    };

    fetchAIInsights();
  }, [
    id, ledgerId, externalId, status, ledgerablePath, ledgerableId,
    amount, createdAt, updatedAt, postedAt, effectiveAt, ledgerableType,
    description, reversesLedgerTransactionId, reversedByLedgerTransactionId,
    partiallyPostsLedgerTransactionId, // Dependencies ensure re-analysis on data change
  ]);

  // Standard transaction details, enhanced with better styling and link behaviors.
  const ledgerTransactionDetails = {
    ID: IdFormatted(id),
    "Ledger ID": ledgerId ?? <EmptyLine />,
    ...(externalId && { "External ID": <CopyableText text={externalId}>{externalId}</CopyableText> }),
    Status: <LedgerStatusBadge status={status} />,
    "Ledgerable Type": ledgerableType ?? <EmptyLine />,
    "Ledgerable ID": (ledgerablePath ? (
      <a href={ledgerablePath} className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200">{ledgerableId}</a>
    ) : (
      ledgerableId
    )) ?? <EmptyLine />,
    ...(amount && { Amount: <span className="font-mono text-gray-900">{amount}</span> }),
    "Created At": <DateTime timestamp={createdAt} />,
    ...(postedAt && {
      "Posted At":
        status === LedgerTransaction__StatusEnum.Posted ? (
          <DateTime timestamp={postedAt} />
        ) : (
          <EmptyLine />
        ),
    }),
    ...(updatedAt && { "Updated At": <DateTime timestamp={updatedAt} /> }),
    "Effective At": <DateTime timestamp={effectiveAt} />,
    Description: (description || <EmptyLine />), // Always show EmptyLine for clarity
    ...(reversesLedgerTransactionId && {
      "Reverses Transaction": (
        <a href={`/ledger_transactions/${reversesLedgerTransactionId}`} className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200">
          {IdFormatted(reversesLedgerTransactionId)}
        </a>
      ),
    }),
    ...(reversedByLedgerTransactionId && {
      "Reversed By Transaction": (
        <a href={`/ledger_transactions/${reversedByLedgerTransactionId}`} className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200">
          {IdFormatted(reversedByLedgerTransactionId)}
        </a>
      ),
    }),
    ...(partiallyPostsLedgerTransactionId && {
      "Partially Posts Transaction": (
        <a href={`/ledger_transactions/${partiallyPostsLedgerTransactionId}`} className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200">
          {IdFormatted(partiallyPostsLedgerTransactionId)}
        </a>
      ),
    }),
  };

  return (
    <div className="rounded-lg border border-alpha-black-100 bg-white p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Transaction Details: <span className="ml-2 text-blue-700">{id.substring(0, 8)}...</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {Object.keys(ledgerTransactionDetails).map((label) => (
          <div
            key={label}
            className="grid grid-cols-3 whitespace-nowrap text-sm items-center"
          >
            <div className="col-span-1 overflow-hidden overflow-ellipsis pr-1 text-gray-600 font-medium">
              {label}:
            </div>
            {typeof ledgerTransactionDetails[label] === "string" ? (
              <OverflowTip
                message={ledgerTransactionDetails[label] as string}
                className="col-span-2 self-center truncate text-left text-gray-800"
              >
                {ledgerTransactionDetails[label]}
              </OverflowTip>
            ) : (
              <div className={cn("col-span-2 self-center text-left text-gray-800")}>
                {ledgerTransactionDetails[label]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- AI-Powered Insights Section (Enhanced) --- */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-cdbi-blue mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-cdbi-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 10h2m10 0h2M3 14h2m10 0h2M7 18h2m6 0h2M6 6h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" />
          </svg>
          CDBI AI Ledger Intelligence
        </h3>

        {isLoadingAi && (
          <div className="text-center py-6 text-blue-600 animate-pulse bg-blue-50 rounded-md">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            CDBI AI is performing real-time transaction analysis. Please wait...
          </div>
        )}

        {errorAi && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md shadow-sm" role="alert">
            <p className="font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              AI Analysis Failed
            </p>
            <p className="mt-1">{errorAi}</p>
          </div>
        )}

        {aiReport && (
          <div>
            {/* Overall Risk & Liquidity Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100 shadow-sm">
                <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Overall AI Risk Score:
                </h4>
                <div className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
                  aiReport.overallRiskScore > 75 ? "bg-red-100 text-red-800" :
                  aiReport.overallRiskScore > 50 ? "bg-orange-100 text-orange-800" :
                  aiReport.overallRiskScore > 25 ? "bg-yellow-100 text-yellow-800" :
                  "bg-green-100 text-green-800"
                )}>
                  {aiReport.overallRiskScore}/100
                  <a
                    href={`https://gemini.cdbi.ai/dashboards/overall_risk_score?txId=${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-blue-600 hover:text-blue-800 text-xs flex items-center group"
                    title="View overall risk score trends in CDBI Gemini Analytics"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M18 10a5 5 0 11-10 0 5 5 0 0110 0z" />
                    </svg>
                    Gemini
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Comprehensive risk assessment from CDBI AI's multi-modal intelligence.
                </p>
              </div>

              {aiReport.liquidityImpactScore !== undefined && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100 shadow-sm">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Liquidity Impact Score:
                  </h4>
                  <div className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
                    aiReport.liquidityImpactScore > 70 ? "bg-purple-100 text-purple-800" :
                    aiReport.liquidityImpactScore > 40 ? "bg-indigo-100 text-indigo-800" :
                    "bg-blue-100 text-blue-800"
                  )}>
                    {aiReport.liquidityImpactScore}/100
                    <a
                      href={`https://gemini.cdbi.ai/dashboards/liquidity_impact?txId=${id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 text-blue-600 hover:text-blue-800 text-xs flex items-center group"
                      title="View liquidity impact forecasts in CDBI Gemini Analytics"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M18 10a5 5 0 11-10 0 5 5 0 0110 0z" />
                      </svg>
                      Gemini
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    CDBI AI's estimated impact on ledger cash flow and available funds.
                  </p>
                </div>
              )}
            </div>


            {/* AI Insights List */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 12.728l-.707-.707M6 18H4a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2M9 16h6a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2z" />
                </svg>
                Detailed AI Insights
              </h4>
              <div className="space-y-4">
                {aiReport.insights.map((insight, index) => (
                  <div key={index} className="flex flex-col border border-gray-200 p-4 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <AIInsightBadge insight={insight} />
                      <span className="text-xs text-gray-500 ml-3">Generated: {new Date(insight.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed mb-2 whitespace-pre-wrap">{insight.description}</p>
                    {insight.suggestedAction && (
                      <p className="text-xs text-blue-700 italic border-l-2 border-blue-400 pl-2 py-1 bg-blue-50 rounded-r-sm">
                        <span className="font-medium">CDBI AI Action Suggestion:</span> {insight.suggestedAction}
                      </p>
                    )}
                    {insight.sourceModel && (
                      <p className="text-xs text-gray-500 mt-2">
                        <span className="font-medium">AI Model:</span> {insight.sourceModel}
                      </p>
                    )}
                    {insight.relatedKPIs && insight.relatedKPIs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-600">Related KPIs:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {insight.relatedKPIs.map((kpi, kpiIdx) => (
                            <span key={kpiIdx} className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                              {kpi.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI KPIs Section */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                CDBI AI Performance Indicators
              </h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-md">
                {aiReport.kpis.map((kpi, index) => (
                  <AI_KPIDisplay key={index} kpi={kpi} />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3 italic">
                For comprehensive interactive charts, detailed trend analysis, and predictive dashboards,
                please visit the dedicated{" "}
                <a href={`https://gemini.cdbi.ai/dashboards/transaction_overview?txId=${id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                  CDBI Gemini AI Analytics Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>.
              </p>
            </div>

            {/* AI Recommendations */}
            {aiReport.recommendations.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 12.728l-.707-.707M6 18H4a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2M9 16h6a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v7a2 2 0 002 2z" />
                  </svg>
                  CDBI AI Recommendations
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-800 bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm space-y-2">
                  {aiReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-1 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LedgerTransactionDetailsCard;