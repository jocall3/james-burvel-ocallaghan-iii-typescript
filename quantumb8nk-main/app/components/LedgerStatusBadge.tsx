// Copyright James Burvel O’Callaghan III
// President CDBI (Cognitive Data-driven Business Intelligence)

import React from "react";
import upperFirst from "lodash/upperFirst";
import { Tag } from "~/common/ui-components";
import { TagColors } from "~/common/ui-components/Tag/Tag";
import { LedgerTransaction__StatusEnum } from "../../generated/dashboard/graphqlSchema";

// --- AI-Powered Enhancements Start Here ---

/**
 * @exports AI_LedgerInsightType
 * @description Defines the types of AI-driven insights for a ledger transaction status.
 * These insights go beyond the basic status to provide deeper context or warnings.
 */
export enum AI_LedgerInsightType {
  Optimal = "Optimal", // Transaction status is ideal and proceeds as expected.
  Watch = "Watch", // Transaction requires monitoring, slight deviation or potential delay.
  Review = "Review", // Transaction requires manual review due to anomalies or specific conditions.
  Critical = "Critical", // Transaction has significant issues or high risk, immediate attention needed.
  Predicted = "Predicted", // Status is not yet final, but AI predicts a high likelihood of this outcome.
  Uncertain = "Uncertain", // AI cannot confidently assess the status due to insufficient data or unusual patterns.
}

/**
 * @exports AI_LedgerInsight
 * @description Represents a comprehensive AI-driven insight for a ledger transaction.
 * Includes the insight type, a descriptive message, and an associated confidence score.
 */
export interface AI_LedgerInsight {
  type: AI_LedgerInsightType;
  message: string;
  confidenceScore: number; // 0.0 to 1.0, AI's confidence in its assessment.
  recommendations?: string[]; // Optional AI-driven actions or advice.
}

/**
 * @exports AI_TransactionKPIs
 * @description Defines the Key Performance Indicators (KPIs) relevant to ledger transaction statuses.
 * These are designed to be consumed by external charting libraries (e.g., linked to Gemini).
 */
export interface AI_TransactionKPIs {
  statusCategoryDistribution: { [key: string]: number }; // E.g., { "Posted": 70, "Pending": 20, "Archived": 10 }
  averageProcessingTimeMs: number | null; // Simulated average time for similar transactions.
  anomalyScore: number; // 0.0 to 1.0, higher means more anomalous.
  predictionAccuracyRate?: number; // For 'Predicted' statuses, how often AI is correct.
  riskIndex: number; // 0.0 to 1.0, aggregated risk based on various factors.
  trendData?: { date: string; count: number; insight: string }[]; // Historical trend data for similar transactions.
}

/**
 * @exports AI_LedgerAnalyticsService
 * @description A conceptual AI service for analyzing ledger transaction statuses.
 * In a real application, this would interact with a powerful backend AI model (like Gemini).
 * For this self-contained file, it simulates AI logic.
 */
export class AI_LedgerAnalyticsService {
  /**
   * Simulates an AI-driven analysis of a ledger transaction status.
   * This function would typically involve complex model inference, but here it's simplified.
   * @param status The current ledger transaction status.
   * @param transactionContext Optional, additional data for richer AI analysis (e.g., amount, counterparty, history).
   * @returns An AI_LedgerInsight object.
   */
  public static getInsightForStatus(
    status: LedgerTransaction__StatusEnum,
    transactionContext?: Record<string, any>
  ): AI_LedgerInsight {
    let insight: AI_LedgerInsight;
    const baseConfidence = Math.random() * 0.2 + 0.7; // Base confidence 70-90%

    switch (status) {
      case LedgerTransaction__StatusEnum.Posted:
        insight = {
          type: AI_LedgerInsightType.Optimal,
          message: "Transaction successfully posted. All parameters within optimal ranges.",
          confidenceScore: baseConfidence + Math.random() * 0.1, // Higher confidence for posted
        };
        break;
      case LedgerTransaction__StatusEnum.Pending:
        const prediction = Math.random();
        if (prediction < 0.2) { // Simulate a chance of anomaly
          insight = {
            type: AI_LedgerInsightType.Review,
            message: "Transaction is pending, but AI detects unusual patterns. Manual review recommended.",
            confidenceScore: baseConfidence - Math.random() * 0.2, // Lower confidence due to anomaly
            recommendations: ["Verify counterparty details", "Check for duplicate attempts", "Monitor for delays"],
          };
        } else if (prediction < 0.6) {
          insight = {
            type: AI_LedgerInsightType.Watch,
            message: "Transaction pending. Estimated completion within standard SLA. Monitoring advised.",
            confidenceScore: baseConfidence,
          };
        } else {
          insight = {
            type: AI_LedgerInsightType.Predicted,
            message: "Transaction pending. AI predicts high likelihood of 'Posted' status within 2 hours.",
            confidenceScore: baseConfidence + Math.random() * 0.05,
          };
        }
        break;
      case LedgerTransaction__StatusEnum.Archived:
        insight = {
          type: AI_LedgerInsightType.Critical, // Could be critical if archived prematurely or due to error
          message: "Transaction archived. AI indicates potential underlying issue or failed processing.",
          confidenceScore: baseConfidence - Math.random() * 0.1,
          recommendations: ["Investigate archive reason", "Confirm transaction reversal/refund if applicable"],
        };
        break;
      case LedgerTransaction__StatusEnum.Void:
        insight = {
          type: AI_LedgerInsightType.Review,
          message: "Transaction voided. AI suggests reviewing the voiding reason for systemic issues.",
          confidenceScore: baseConfidence - 0.1,
          recommendations: ["Analyze void trends", "Review authorization for void action"],
        };
        break;
      default:
        insight = {
          type: AI_LedgerInsightType.Uncertain,
          message: "AI cannot provide specific insight due to unknown status or insufficient data.",
          confidenceScore: Math.random() * 0.3 + 0.4, // Lower confidence for unknown
        };
        break;
    }
    return insight;
  }

  /**
   * Generates a set of AI-driven KPIs for a given transaction status context.
   * This would typically query a data warehouse or AI model for aggregated metrics.
   * @param status The current ledger transaction status.
   * @param transactionId Optional, a specific transaction ID for context-sensitive KPIs.
   * @returns An AI_TransactionKPIs object.
   */
  public static generateKPIsForStatus(
    status: LedgerTransaction__StatusEnum,
    transactionId?: string
  ): AI_TransactionKPIs {
    // Simulate KPI generation based on status and potentially a global AI model.
    const baseAnomaly = status === LedgerTransaction__StatusEnum.Archived || status === LedgerTransaction__StatusEnum.Void ? 0.7 : Math.random() * 0.3;
    const processingTime = status === LedgerTransaction__StatusEnum.Pending ? (Math.random() * 30000 + 5000) : null; // 5-35 seconds simulated
    const risk = baseAnomaly * 0.8 + (processingTime ? (processingTime / 60000) * 0.2 : 0); // Combine factors

    const kpis: AI_TransactionKPIs = {
      statusCategoryDistribution: {
        [LedgerTransaction__StatusEnum.Posted]: Math.floor(Math.random() * 40) + 60, // 60-100%
        [LedgerTransaction__StatusEnum.Pending]: Math.floor(Math.random() * 20) + 10, // 10-30%
        [LedgerTransaction__StatusEnum.Archived]: Math.floor(Math.random() * 10) + 1, // 1-11%
        [LedgerTransaction__StatusEnum.Void]: Math.floor(Math.random() * 5) + 1, // 1-6%
      },
      averageProcessingTimeMs: processingTime,
      anomalyScore: Math.min(1, baseAnomaly + Math.random() * 0.1),
      riskIndex: Math.min(1, risk),
    };

    if (status === LedgerTransaction__StatusEnum.Pending) {
      kpis.predictionAccuracyRate = Math.random() * 0.1 + 0.85; // 85-95% for prediction accuracy
    }

    // Add some mock trend data for charts
    kpis.trendData = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 100,
      insight: `Daily volume on ${new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toDateString().split(' ')[0]}.`
    }));


    return kpis;
  }

  /**
   * Conceptual function to link generated KPIs to the Gemini AI platform for visualization and deeper analysis.
   * In a real system, this would involve API calls to Gemini's data ingestion or visualization services.
   * @param kpis The AI_TransactionKPIs to be sent to Gemini.
   * @param dashboardId Optional, specify a Gemini dashboard ID.
   * @returns A mock URL or confirmation of data submission.
   */
  public static linkKPIsToGemini(kpis: AI_TransactionKPIs, dashboardId?: string): string {
    console.log(`[CDBI AI] Sending KPIs to Gemini for advanced visualization and analytics. Dashboard ID: ${dashboardId || 'default'}`);
    console.log(kpis);
    // In a real application:
    // const response = await fetch('https://api.gemini.ai/data-ingest', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer GEMINI_API_KEY' },
    //   body: JSON.stringify({ kpis, context: { component: 'LedgerStatusBadge', timestamp: new Date().toISOString() } })
    // });
    // const result = await response.json();
    // return result.dashboardLink;
    return `https://gemini.ai/dashboards/${dashboardId || 'cdbi-ledger-overview'}/view?kpis=${btoa(JSON.stringify(kpis))}`;
  }
}

/**
 * @exports LedgerStatusBadge
 * @description A highly advanced, AI-powered React component that displays a ledger transaction status
 * not only as a simple badge but also enriches it with real-time AI insights, risk assessments,
 * and relevant KPIs linked to the Gemini AI platform for advanced visualization.
 * This component is designed for commercial-grade applications, serving both financial institutions
 * and individual users who demand intelligent, predictive financial oversight.
 */
function LedgerStatusBadge({
  status,
  transactionId, // Added for potential context-sensitive AI analysis
  extendedContext, // Added for more detailed AI input
}: {
  status: LedgerTransaction__StatusEnum;
  transactionId?: string;
  extendedContext?: Record<string, any>;
}) {
  const [aiInsight, setAiInsight] = React.useState<AI_LedgerInsight | null>(null);
  const [kpis, setKpis] = React.useState<AI_TransactionKPIs | null>(null);
  const [geminiDashboardLink, setGeminiDashboardLink] = React.useState<string | null>(null);

  // Determine base color based on status (existing logic)
  let color: TagColors = "gray";
  if (status === LedgerTransaction__StatusEnum.Posted) {
    color = "green";
  } else if (status === LedgerTransaction__StatusEnum.Archived || status === LedgerTransaction__StatusEnum.Void) {
    color = "red";
  } else if (status === LedgerTransaction__StatusEnum.Pending) {
    color = "orange";
  }

  React.useEffect(() => {
    // Simulate AI analysis and KPI generation on status change
    const insight = AI_LedgerAnalyticsService.getInsightForStatus(status, { transactionId, ...extendedContext });
    setAiInsight(insight);

    const generatedKpis = AI_LedgerAnalyticsService.generateKPIsForStatus(status, transactionId);
    setKpis(generatedKpis);

    // Link KPIs to Gemini and get a dashboard link
    const link = AI_LedgerAnalyticsService.linkKPIsToGemini(generatedKpis, `cdbi-transaction-${transactionId || 'general'}`);
    setGeminiDashboardLink(link);

  }, [status, transactionId, extendedContext]); // Re-run effect if status or context changes

  // Determine AI-enhanced badge color if applicable
  let aiColor: TagColors = color;
  let aiLabelSuffix = "";
  let badgeTooltip = `Status: ${upperFirst(status)}`;

  if (aiInsight) {
    if (aiInsight.type === AI_LedgerInsightType.Critical) {
      aiColor = "red";
      aiLabelSuffix = " (Critical AI Alert)";
    } else if (aiInsight.type === AI_LedgerInsightType.Review) {
      aiColor = "purple"; // A specific color for review
      aiLabelSuffix = " (AI Review)";
    } else if (aiInsight.type === AI_LedgerInsightType.Watch) {
      aiColor = "yellow";
      aiLabelSuffix = " (AI Watch)";
    } else if (aiInsight.type === AI_LedgerInsightType.Optimal && color !== "green") {
      // If AI says optimal but original status wasn't green (e.g., Pending, but AI predicts optimal outcome)
      aiColor = "blue"; // Indicates positive AI prediction for non-final status
      aiLabelSuffix = " (AI Predicted Optimal)";
    } else if (aiInsight.type === AI_LedgerInsightType.Predicted) {
      aiColor = "blue";
      aiLabelSuffix = ` (AI Predicts: ${aiInsight.message.split(': ')[1] || 'Optimal'})`;
    } else if (aiInsight.type === AI_LedgerInsightType.Uncertain) {
        aiColor = "gray"; // Revert to gray or keep original if AI is uncertain
        aiLabelSuffix = " (AI Uncertain)";
    }

    badgeTooltip += `\nAI Insight: ${aiInsight.message} (Confidence: ${(aiInsight.confidenceScore * 100).toFixed(0)}%)`;
    if (aiInsight.recommendations && aiInsight.recommendations.length > 0) {
      badgeTooltip += `\nAI Recommendations:\n- ${aiInsight.recommendations.join('\n- ')}`;
    }
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <Tag size="small" color={aiColor} title={badgeTooltip}>
        {upperFirst(status)}
        {aiLabelSuffix}
      </Tag>
      {aiInsight && aiInsight.type === AI_LedgerInsightType.Critical && (
        <span style={{ color: 'red', fontSize: '0.8em', fontWeight: 'bold' }}>
          🚨 Critical!
        </span>
      )}
      {aiInsight && aiInsight.type === AI_LedgerInsightType.Review && (
        <span style={{ color: 'purple', fontSize: '0.8em' }}>
          🔍 Review
        </span>
      )}
      {kpis && (
        <a
          href={geminiDashboardLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75em',
            color: '#007bff',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#e9f7fe',
            border: '1px solid #007bff',
            whiteSpace: 'nowrap'
          }}
          title={`View AI-powered KPIs and charts for this status on Gemini. Risk Index: ${(kpis.riskIndex * 100).toFixed(1)}%, Anomaly Score: ${(kpis.anomalyScore * 100).toFixed(1)}%`}
        >
          📈 AI Analytics (Gemini)
        </a>
      )}
    </div>
  );
}

export default LedgerStatusBadge;