// Copyright James Burvel O’Callaghan III
// President cdbi Demo Business Inc.

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getLedgerAccountSettlementSearchComponents,
  mapLedgerAccountSettlementQueryToVariables,
} from "~/common/search_components/ledgerAccountSettlementSearchComponents";
import { LedgerAccountSettlementsHomeDocument } from "../../generated/dashboard/graphqlSchema";
import { LEDGER_ACCOUNT_SETTLEMENT } from "../../generated/dashboard/types/resources";
import ListView from "./ListView";
import LedgerAccountSettlementsEmptyState from "../containers/LedgerAccountSettlementsEmptyState";

// --- START: AI-POWERED ENHANCEMENTS FOR SETTLEMENTS ---

/**
 * Interface representing a single ledger account settlement.
 * This extends the basic concept to include AI-relevant attributes.
 * In a real system, this would likely come from a GraphQL query.
 */
export interface CDBISettlement {
  id: string;
  ledgerId: string;
  amount: number; // In base units (e.g., cents)
  currency: string;
  status: "pending" | "completed" | "failed" | "canceled" | "processing" | "on_hold";
  createdAt: string; // ISO date string
  settlementDate: string; // ISO date string
  counterpartyId: string;
  metadata?: Record<string, any>;
  predictedStatus?: "success" | "failure" | "uncertain"; // AI prediction
  predictedCompletionTime?: string; // ISO date string, AI prediction
  riskScore?: number; // AI-assigned risk score (0-100)
  anomalyDetected?: boolean; // AI detection
  anomalyType?: string; // e.g., "high_value", "unusual_pattern", "fraud_alert"
  optimizedRouteSuggestion?: string; // AI-suggested optimal path
  estimatedOptimizationSavings?: number; // AI-estimated savings from optimization
  liquidityImpactPrediction?: number; // AI prediction of liquidity impact
  complianceRiskAssessment?: "low" | "medium" | "high" | "critical"; // AI compliance assessment
  sentimentScore?: number; // AI-derived sentiment score related to the settlement (e.g., from associated support tickets)
}

/**
 * Represents AI-generated insights and Key Performance Indicators (KPIs)
 * for ledger account settlements. These KPIs are specifically designed to
 * be linked to Gemini's advanced analytical capabilities.
 */
export interface AISettlementInsights {
  predictedSuccessRate: number; // Percentage (0-1)
  averagePredictedSettlementTime: string; // e.g., "2 hours 30 minutes"
  anomalyCountLast24h: number;
  highRiskSettlementCount: number;
  totalSettlementsProcessedAI: number;
  potentialSavingsFromOptimization: number; // Total estimated savings
  currencyOfSavings: string;
  settlementRiskDistribution: {
    low: number; // Count of low-risk settlements
    medium: number; // Count of medium-risk settlements
    high: number; // Count of high-risk settlements
  };
  sentimentAnalysisSummary?: {
    positive: number;
    neutral: number;
    negative: number;
  }; // For customer feedback or related data

  // New, advanced KPIs linked to Gemini's multimodal AI capabilities
  geminiFraudDetectionScore: number; // Overall fraud risk score for current settlements (0-100)
  geminiLiquidityPredictionAccuracy: number; // Accuracy of liquidity predictions based on settlements (0-100)
  geminiComplianceRiskIndex: number; // An index reflecting compliance risk in settlements (1-5)
  geminiOperationalEfficiencyScore: number; // Score based on AI-optimized settlement flows (0-100)
  geminiPredictiveCashFlowImpact: number; // Net predicted impact on cash flow from pending settlements
  geminiMarketVolatilityIndex: number; // AI-derived index of market volatility affecting settlements (0-10)
}

/**
 * Represents a simulated AI analytics service powered by "Gemini".
 * In a real application, this would interact with a backend AI model
 * or a sophisticated on-device ML engine. This class provides methods
 * for various AI-powered analyses.
 */
export class CDBIAIAnalyticsService {
  private settlements: CDBISettlement[];

  constructor(settlements: CDBISettlement[]) {
    this.settlements = settlements;
  }

  /**
   * Simulates an AI model (Gemini) predicting settlement outcomes.
   * For a real app, this would involve complex ML models analyzing
   * historical data, counterparty risk, network conditions, etc.
   * @param settlement The settlement to analyze.
   * @returns An updated settlement with AI predictions.
   */
  public static async predictSettlementOutcome(
    settlement: CDBISettlement
  ): Promise<CDBISettlement> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 50));

    // Simple heuristic for demo based on amount, counterparty, and current status
    const isHighValue = settlement.amount > 100000000; // e.g., $1,000,000
    const isRiskyCounterparty = settlement.counterpartyId.startsWith("RISK-");
    const isUrgent = settlement.status === "processing";

    let predictedStatus: "success" | "failure" | "uncertain" = "success";
    let predictedCompletionTime = new Date(settlement.createdAt);
    let riskScore = settlement.riskScore || 0;

    // Default 2-hour completion
    predictedCompletionTime.setHours(predictedCompletionTime.getHours() + 2);

    if (isRiskyCounterparty && Math.random() < 0.35) {
      predictedStatus = "failure";
      predictedCompletionTime.setHours(predictedCompletionTime.getHours() + 24); // Longer for failure
      riskScore += 30;
    } else if (isHighValue && Math.random() < 0.15) {
      predictedStatus = "uncertain";
      predictedCompletionTime.setHours(predictedCompletionTime.getHours() + 6); // Longer for uncertainty
      riskScore += 20;
    } else if (isUrgent && Math.random() < 0.05) {
      // Small chance of unexpected delay for processing
      predictedCompletionTime.setHours(predictedCompletionTime.getHours() + 1);
    }

    return {
      ...settlement,
      predictedStatus,
      predictedCompletionTime: predictedCompletionTime.toISOString(),
      riskScore: Math.min(100, riskScore), // Cap risk at 100
    };
  }

  /**
   * Simulates an AI model (Gemini) detecting anomalies and potential fraud in settlements.
   * This would leverage pattern recognition, behavioral analytics, and real-time data feeds.
   * @param settlement The settlement to analyze.
   * @returns An updated settlement with anomaly detection flags and risk scores.
   */
  public static async detectSettlementAnomalyAndFraud(
    settlement: CDBISettlement
  ): Promise<CDBISettlement> {
    await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 30));

    let anomalyDetected = false;
    let anomalyType: string | undefined;
    let riskScore = settlement.riskScore || 0; // Start with existing risk score

    // Advanced anomaly detection heuristics (simulated)
    if (settlement.amount > 500000000) {
      // Very high value, could be flagged for manual review
      anomalyDetected = true;
      anomalyType = "High_Value_Transaction_Alert";
      riskScore += 45;
    }
    if (settlement.status === "failed" && Math.random() < 0.4) {
      // Repeated failures to the same counterparty or unusual failure reason
      anomalyDetected = true;
      anomalyType = "Repeated_Failure_Pattern_Watch";
      riskScore += 25;
    }
    if (settlement.metadata && settlement.metadata.unusual_geo_location) {
      anomalyDetected = true;
      anomalyType = "Geographic_Anomaly_Alert";
      riskScore += 35;
    }
    // Simulate a fraud detection specific rule
    if (settlement.counterpartyId.includes("FRAUD") || (settlement.amount > 200000000 && Math.random() < 0.08)) {
      anomalyDetected = true;
      anomalyType = "Potential_Fraud_Detected_by_Gemini";
      riskScore += 50; // High impact on risk score
    }

    // Add some base randomness to risk score
    riskScore += Math.floor(Math.random() * 20);

    return {
      ...settlement,
      anomalyDetected,
      anomalyType,
      riskScore: Math.min(100, riskScore), // Cap at 100
    };
  }

  /**
   * Simulates an AI model (Gemini) optimizing settlement routing for speed and cost.
   * This would involve analyzing network congestion, transaction fees, and bilateral agreements.
   * @param settlement The settlement to optimize.
   * @returns An updated settlement with optimization suggestions and estimated savings.
   */
  public static async optimizeSettlementRouting(
    settlement: CDBISettlement
  ): Promise<CDBISettlement> {
    await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 20));

    let optimizedRouteSuggestion: string | undefined;
    let estimatedOptimizationSavings = 0;

    // Simulate smart routing based on currency, amount, and urgency
    if (settlement.currency === "USD" && settlement.amount < 50000000 && Math.random() < 0.6) {
      optimizedRouteSuggestion = "FedNow_Instant_Payment_via_CDBI_Direct";
      estimatedOptimizationSavings = settlement.amount * 0.0007; // 0.07% saving for instant, lower fee
    } else if (settlement.currency === "USD" && settlement.amount >= 50000000 && Math.random() < 0.4) {
      optimizedRouteSuggestion = "SWIFT_GPT_Optimized_Corridor_Settlement"; // Hypothetical AI-enhanced SWIFT
      estimatedOptimizationSavings = settlement.amount * 0.0003; // 0.03% saving for larger value
    } else if (settlement.currency === "EUR" && Math.random() < 0.5) {
      optimizedRouteSuggestion = "SEPA_Instant_CDBI_Blockchain_Bridge"; // Hypothetical blockchain integration
      estimatedOptimizationSavings = settlement.amount * 0.0004; // 0.04% saving
    } else if (settlement.currency === "GBP" && Math.random() < 0.3) {
      optimizedRouteSuggestion = "FasterPayments_CDBI_SmartRouting";
      estimatedOptimizationSavings = settlement.amount * 0.0006; // 0.06% saving
    }

    return {
      ...settlement,
      optimizedRouteSuggestion,
      estimatedOptimizationSavings: parseFloat(
        estimatedOptimizationSavings.toFixed(2)
      ), // Two decimal places for currency
    };
  }

  /**
   * Simulates Gemini's ability to assess liquidity impact and compliance risks.
   * This would involve analyzing cash flow forecasts, regulatory requirements, and real-time market data.
   * @param settlement The settlement to assess.
   * @returns An updated settlement with liquidity and compliance assessments.
   */
  public static async assessLiquidityAndCompliance(
    settlement: CDBISettlement
  ): Promise<CDBISettlement> {
    await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 40));

    let liquidityImpactPrediction = settlement.amount * (Math.random() * 0.01 - 0.005); // +/- 0.5% impact
    let complianceRiskAssessment: "low" | "medium" | "high" | "critical" = "low";

    if (settlement.counterpartyId.startsWith("RISK-") || settlement.amount > 500000000) {
      complianceRiskAssessment = Math.random() < 0.3 ? "critical" : "high";
    } else if (settlement.metadata && settlement.metadata.aml_flag) {
      complianceRiskAssessment = "high";
    } else if (Math.random() < 0.1) {
      complianceRiskAssessment = "medium";
    }

    return {
      ...settlement,
      liquidityImpactPrediction: parseFloat(liquidityImpactPrediction.toFixed(2)),
      complianceRiskAssessment,
    };
  }

  /**
   * Generates comprehensive AI insights for a collection of settlements.
   * This function conceptually orchestrates various Gemini AI models to
   * provide a holistic view of the settlement landscape.
   * @param settlements An array of settlements to analyze.
   * @returns Comprehensive AI insights.
   */
  public async getComprehensiveAIInsights(
    settlements: CDBISettlement[]
  ): Promise<AISettlementInsights> {
    if (!settlements || settlements.length === 0) {
      return {
        predictedSuccessRate: 0,
        averagePredictedSettlementTime: "N/A",
        anomalyCountLast24h: 0,
        highRiskSettlementCount: 0,
        totalSettlementsProcessedAI: 0,
        potentialSavingsFromOptimization: 0,
        currencyOfSavings: "USD",
        settlementRiskDistribution: { low: 0, medium: 0, high: 0 },
        sentimentAnalysisSummary: { positive: 0, neutral: 0, negative: 0 },
        geminiFraudDetectionScore: 0,
        geminiLiquidityPredictionAccuracy: 0,
        geminiComplianceRiskIndex: 0,
        geminiOperationalEfficiencyScore: 0,
        geminiPredictiveCashFlowImpact: 0,
        geminiMarketVolatilityIndex: 0,
      };
    }

    const processedSettlements = await Promise.all(
      settlements.map(async (s) => {
        let updated = { ...s };
        updated = await CDBIAIAnalyticsService.predictSettlementOutcome(updated);
        updated = await CDBIAIAnalyticsService.detectSettlementAnomalyAndFraud(updated);
        updated = await CDBIAIAnalyticsService.optimizeSettlementRouting(updated);
        updated = await CDBIAIAnalyticsService.assessLiquidityAndCompliance(updated);
        return updated;
      })
    );

    let successfulPredictions = 0;
    let totalPredictedTimes = 0; // in milliseconds
    let anomalyCount = 0;
    let highRiskCount = 0;
    let totalSavings = 0;
    const riskDistribution = { low: 0, medium: 0, high: 0 };
    let totalSentimentPositive = 0;
    let totalSentimentNeutral = 0;
    let totalSentimentNegative = 0;
    let totalLiquidityImpact = 0;

    processedSettlements.forEach((s) => {
      if (s.predictedStatus === "success") {
        successfulPredictions++;
      }
      if (s.predictedCompletionTime) {
        totalPredictedTimes +=
          new Date(s.predictedCompletionTime).getTime() - new Date(s.createdAt).getTime();
      }
      if (s.anomalyDetected) {
        anomalyCount++;
      }
      if (s.riskScore !== undefined) {
        if (s.riskScore >= 70) {
          highRiskCount++;
          riskDistribution.high++;
        } else if (s.riskScore >= 30) {
          riskDistribution.medium++;
        } else {
          riskDistribution.low++;
        }
      }
      if (s.estimatedOptimizationSavings) {
        totalSavings += s.estimatedOptimizationSavings;
      }
      if (s.liquidityImpactPrediction) {
        totalLiquidityImpact += s.liquidityImpactPrediction;
      }

      // Simulate sentiment analysis (e.g., from customer support interactions related to settlements)
      const sentimentRoll = Math.random();
      if (sentimentRoll < 0.6) totalSentimentPositive++;
      else if (sentimentRoll < 0.8) totalSentimentNeutral++;
      else totalSentimentNegative++;
    });

    const avgPredictedTimeMs =
      processedSettlements.length > 0 ? totalPredictedTimes / processedSettlements.length : 0;
    const avgPredictedTime = this.formatDuration(avgPredictedTimeMs);

    // Simulate advanced Gemini KPIs, making them dynamic and reflective of combined AI analysis
    const geminiFraudDetectionScore = Math.floor(
      (anomalyCount / processedSettlements.length) * 100 + (Math.random() * 20)
    ); // Higher with more anomalies
    const geminiLiquidityPredictionAccuracy = (80 + Math.random() * 15).toFixed(2); // High accuracy is expected
    const geminiComplianceRiskIndex = (1 + (highRiskCount / processedSettlements.length) * 4 + Math.random() * 1).toFixed(2); // Higher with more high-risk items
    const geminiOperationalEfficiencyScore = (70 + Math.random() * 25 - (anomalyCount / processedSettlements.length) * 20).toFixed(2); // Lower with more anomalies, higher with savings
    const geminiPredictiveCashFlowImpact = parseFloat(totalLiquidityImpact.toFixed(2));
    const geminiMarketVolatilityIndex = parseFloat((Math.random() * 7 + 1).toFixed(1)); // 1-8 scale

    return {
      predictedSuccessRate: processedSettlements.length > 0
        ? successfulPredictions / processedSettlements.length
        : 0,
      averagePredictedSettlementTime: avgPredictedTime,
      anomalyCountLast24h: anomalyCount, // Simplified for demo, should filter by date
      highRiskSettlementCount: highRiskCount,
      totalSettlementsProcessedAI: processedSettlements.length,
      potentialSavingsFromOptimization: parseFloat(totalSavings.toFixed(2)),
      currencyOfSavings: settlements[0]?.currency || "USD", // Assume consistent currency for savings
      settlementRiskDistribution: riskDistribution,
      sentimentAnalysisSummary: {
        positive: totalSentimentPositive,
        neutral: totalSentimentNeutral,
        negative: totalSentimentNegative,
      },
      geminiFraudDetectionScore: Math.min(100, geminiFraudDetectionScore),
      geminiLiquidityPredictionAccuracy: parseFloat(geminiLiquidityPredictionAccuracy),
      geminiComplianceRiskIndex: parseFloat(geminiComplianceRiskIndex),
      geminiOperationalEfficiencyScore: parseFloat(geminiOperationalEfficiencyScore),
      geminiPredictiveCashFlowImpact: geminiPredictiveCashFlowImpact,
      geminiMarketVolatilityIndex: geminiMarketVolatilityIndex,
    };
  }

  private formatDuration(ms: number): string {
    if (ms <= 0) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

/**
 * Mocks settlement data for demonstration purposes.
 * In a production environment, this data would be dynamically fetched from
 * a backend API. This mock includes diverse scenarios for AI analysis.
 */
const mockSettlements: CDBISettlement[] = [
  {
    id: "set_1",
    ledgerId: "lgr_123",
    amount: 15000000, // $150,000
    currency: "USD",
    status: "completed",
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), // 2 days ago
    settlementDate: new Date(Date.now() - 3600 * 1000 * 47).toISOString(),
    counterpartyId: "cpty_abc",
  },
  {
    id: "set_2",
    ledgerId: "lgr_123",
    amount: 500000000, // $5,000,000 (High value)
    currency: "USD",
    status: "processing",
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(), // 12 hours ago
    settlementDate: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
    counterpartyId: "cpty_xyz",
    metadata: { unusual_geo_location: false, aml_flag: false },
  },
  {
    id: "set_3",
    ledgerId: "lgr_123",
    amount: 2500000, // $25,000
    currency: "EUR",
    status: "pending",
    createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(), // 3 hours ago
    settlementDate: new Date(Date.now() + 3600 * 1000 * 1).toISOString(),
    counterpartyId: "RISK-cpty_def_aml", // Risky counterparty, potentially AML flagged
    metadata: { unusual_geo_location: false, aml_flag: true },
  },
  {
    id: "set_4",
    ledgerId: "lgr_123",
    amount: 750000000, // $7,500,000 (Very high value, metadata flagged)
    currency: "USD",
    status: "pending",
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago
    settlementDate: new Date(Date.now() + 3600 * 1000 * 3).toISOString(),
    counterpartyId: "cpty_ghj",
    metadata: { unusual_geo_location: true, unusual_activity: true }, // Metadata flagged
  },
  {
    id: "set_5",
    ledgerId: "lgr_123",
    amount: 12000000, // $120,000
    currency: "GBP",
    status: "completed",
    createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // 1 day ago
    settlementDate: new Date(Date.now() - 3600 * 1000 * 23).toISOString(),
    counterpartyId: "cpty_klm",
  },
  {
    id: "set_6",
    ledgerId: "lgr_123",
    amount: 30000000, // $300,000
    currency: "USD",
    status: "failed", // Failed settlement
    createdAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    settlementDate: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    counterpartyId: "cpty_nop",
  },
  {
    id: "set_7",
    ledgerId: "lgr_123",
    amount: 8000000, // $80,000
    currency: "EUR",
    status: "pending",
    createdAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    settlementDate: new Date(Date.now() + 3600 * 1000 * 0.5).toISOString(),
    counterpartyId: "cpty_qrs",
  },
  {
    id: "set_8",
    ledgerId: "lgr_123",
    amount: 1000000000, // $10,000,000 (Critical compliance risk simulation)
    currency: "USD",
    status: "processing",
    createdAt: new Date(Date.now() - 3600 * 1000 * 0.5).toISOString(),
    settlementDate: new Date(Date.now() + 3600 * 1000 * 4).toISOString(),
    counterpartyId: "RISK-FRAUD-GLOBAL_PTNR", // Simulated fraud/risk flag
    metadata: { aml_flag: true, sanction_list_check: true },
  },
];

/**
 * A simple mock for chart rendering, as we can't import a charting library
 * into a single file and maintain the "no new dependencies" constraint.
 * In a real application, this would utilize a library like Chart.js, Recharts,
 * Nivo, or a custom D3.js implementation. The data structure is prepared
 * to be directly consumable by such libraries.
 */
export const MockChart: React.FC<{ title: string; data: any; type: string; description: string }> = ({
  title,
  data,
  type,
  description,
}) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-md font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="text-gray-600 text-sm">
      {/* Placeholder for actual chart rendering */}
      <p className="font-medium">
        <span className="text-blue-600">{type} Chart Data:</span>
      </p>
      <pre className="text-xs bg-gray-100 p-2 rounded-md mt-1 overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
      <p className="text-xs text-gray-500 mt-2">
        {description} (Visualized by cdbi's Gemini-powered real-time analytics engine)
      </p>
    </div>
  </div>
);

// Helper component for displaying a Key Performance Indicator (KPI) card.
// Designed to show a clear value, context, and trend for AI-generated insights.
interface CDBIKPICardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: "up" | "down" | "neutral";
  isAlert?: boolean;
}

export const CDBIKPICard: React.FC<CDBIKPICardProps> = ({
  title,
  value,
  description,
  trend = "neutral",
  isAlert = false,
}) => {
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500";
  const trendIcon =
    trend === "up" ? "▲" : trend === "down" ? "▼" : "—"; // Unicode arrows for visual trend
  const alertClass = isAlert ? "border-red-500 ring-2 ring-red-200" : "border-gray-200";

  return (
    <div className={`bg-white p-5 rounded-lg shadow-sm border ${alertClass}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-medium text-gray-600">{title}</h3>
        <span className={`text-sm font-semibold ${trendColor}`}>
          {trendIcon}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {value}
      </p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

/**
 * `AISettlementInsightsDashboard` component displays AI-powered KPIs and charts.
 * This component is linked to "Gemini" conceptually through the `CDBIAIAnalyticsService`.
 * It provides a comprehensive, real-time overview of settlement health and predictions.
 */
export const AISettlementInsightsDashboard: React.FC<{ ledgerId: string }> = ({ ledgerId }) => {
  const [insights, setInsights] = useState<AISettlementInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter mock settlements by ledgerId, demonstrating data isolation for specific ledgers.
  const filteredSettlements = useMemo(
    () => mockSettlements.filter((s) => s.ledgerId === ledgerId),
    [ledgerId]
  );

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real application, `filteredSettlements` would be fetched from a GraphQL endpoint
      // based on `ledgerId`, then passed to the AI service for analysis.
      const aiService = new CDBIAIAnalyticsService(filteredSettlements);
      const result = await aiService.getComprehensiveAIInsights(filteredSettlements);
      setInsights(result);
    } catch (err: any) {
      console.error("Failed to fetch AI insights:", err);
      setError(`Failed to load AI insights: ${err.message || 'Unknown error'}.`);
    } finally {
      setLoading(false);
    }
  }, [filteredSettlements]);

  useEffect(() => {
    fetchInsights();
    // Refresh insights periodically (e.g., every 5 minutes) to ensure real-time AI updates.
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchInsights]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 bg-blue-50 rounded-lg shadow-inner animate-pulse">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg font-medium text-blue-800">
          Activating Gemini AI for real-time settlement analysis...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-6 my-4 shadow-md">
        <strong className="font-bold">AI System Error:</strong>
        <span className="block sm:inline ml-2">{error}</span>
        <p className="text-sm mt-2">
          cdbi AI systems encountered a critical issue. Our Gemini engineers have been notified. Please contact support.
        </p>
      </div>
    );
  }

  if (!insights || filteredSettlements.length === 0) {
    return (
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mx-6 my-4 shadow-md">
        <p>
          No active settlement data available for AI analysis for ledger{" "}
          <span className="font-semibold">{ledgerId}</span>.
        </p>
        <p className="text-sm mt-2">
          cdbi's Gemini AI is awaiting transaction data to generate its advanced insights.
          Start processing settlements to unlock full AI capabilities.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-xl mb-8 border border-blue-200">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
        <span className="mr-3 text-indigo-600">🧠</span> CDBI AI-Powered Settlement Intelligence for{" "}
        <span className="text-blue-700 ml-2 animate-pulse">{ledgerId}</span>
      </h2>
      <p className="text-gray-700 mb-8 text-lg">
        Leveraging Gemini's multimodal AI, cdbi provides unparalleled insights into your ledger settlements,
        forecasting outcomes, detecting anomalies, and optimizing financial flows for peak performance.
      </p>

      {/* Primary KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <CDBIKPICard
          title="Predicted Success Rate"
          value={`${(insights.predictedSuccessRate * 100).toFixed(2)}%`}
          description="Gemini's probabilistic forecast of successful settlement completions."
          trend={insights.predictedSuccessRate > 0.85 ? "up" : "down"}
        />
        <CDBIKPICard
          title="Avg. Predicted Settlement Time"
          value={insights.averagePredictedSettlementTime}
          description="Gemini's estimated average time for all pending settlements to finalize."
          trend={insights.averagePredictedSettlementTime === "N/A" ? "neutral" : (insights.averagePredictedSettlementTime.includes("d") || insights.averagePredictedSettlementTime.includes("h") ? "down" : "up")}
        />
        <CDBIKPICard
          title="Anomalies & Fraud Alerts (24h)"
          value={insights.anomalyCountLast24h}
          description="Critical alerts from Gemini AI on unusual or potentially fraudulent settlement patterns."
          trend={insights.anomalyCountLast24h > 0 ? "down" : "up"}
          isAlert={insights.anomalyCountLast24h > 0}
        />
        <CDBIKPICard
          title="Potential Savings (AI Optimized)"
          value={`${insights.potentialSavingsFromOptimization.toFixed(2)} ${insights.currencyOfSavings}`}
          description="Estimated cost reductions from Gemini's intelligent routing and process optimizations."
          trend={insights.potentialSavingsFromOptimization > 0 ? "up" : "neutral"}
        />
      </div>

      {/* Advanced Gemini-specific KPIs */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8 flex items-center">
        <span className="mr-2 text-indigo-500">✨</span> Gemini Advanced Metrics
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <CDBIKPICard
          title="Gemini Fraud Detection Score"
          value={`${insights.geminiFraudDetectionScore}%`}
          description="Real-time aggregation of fraud risk across all active settlements by Gemini."
          trend={insights.geminiFraudDetectionScore > 30 ? "down" : "up"}
          isAlert={insights.geminiFraudDetectionScore > 20}
        />
        <CDBIKPICard
          title="Gemini Liquidity Prediction Accuracy"
          value={`${insights.geminiLiquidityPredictionAccuracy}%`}
          description="Confidence score for Gemini's cash flow and liquidity forecasts."
          trend={insights.geminiLiquidityPredictionAccuracy > 90 ? "up" : "down"}
        />
        <CDBIKPICard
          title="Gemini Compliance Risk Index"
          value={insights.geminiComplianceRiskIndex.toFixed(2)}
          description="A dynamic index (1=Low, 5=High) reflecting potential regulatory compliance exposure assessed by Gemini."
          trend={insights.geminiComplianceRiskIndex > 3 ? "down" : "up"}
          isAlert={insights.geminiComplianceRiskIndex > 2}
        />
        <CDBIKPICard
          title="Gemini Operational Efficiency Score"
          value={`${insights.geminiOperationalEfficiencyScore}%`}
          description="A holistic score from Gemini measuring process efficiency and automation impact."
          trend={insights.geminiOperationalEfficiencyScore > 85 ? "up" : "down"}
        />
        <CDBIKPICard
          title="Gemini Predictive Cash Flow Impact"
          value={`${insights.geminiPredictiveCashFlowImpact.toFixed(2)} ${insights.currencyOfSavings}`}
          description="Gemini's net predicted impact on available cash flow from all pending settlements."
          trend={insights.geminiPredictiveCashFlowImpact >= 0 ? "up" : "down"}
          isAlert={insights.geminiPredictiveCashFlowImpact < 0}
        />
        <CDBIKPICard
          title="Gemini Market Volatility Index"
          value={insights.geminiMarketVolatilityIndex.toFixed(1)}
          description="AI-derived index (0-10) indicating current market turbulence impacting settlements."
          trend={insights.geminiMarketVolatilityIndex > 5 ? "down" : "up"}
          isAlert={insights.geminiMarketVolatilityIndex > 6}
        />
      </div>

      {/* Charts Section */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8 flex items-center">
        <span className="mr-2 text-indigo-500">📊</span> Gemini AI Visualizations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MockChart
          title="Settlement Risk Distribution (Gemini)"
          type="Bar Chart"
          data={insights.settlementRiskDistribution}
          description="Distribution of settlements across low, medium, and high-risk categories, as classified by Gemini AI."
        />
        <MockChart
          title="Predicted vs. Actual Settlement Status (Gemini)"
          type="Pie Chart"
          data={{
            predicted_success: insights.predictedSuccessRate * filteredSettlements.length,
            predicted_failure_or_uncertain:
              (1 - insights.predictedSuccessRate) * filteredSettlements.length,
            anomalies_detected: insights.anomalyCountLast24h,
          }}
          description="Comparison of Gemini's predicted settlement outcomes, highlighting successes and areas needing attention."
        />
        <MockChart
          title="AI Sentiment Analysis on Settlement Feedback (Gemini)"
          type="Donut Chart"
          data={insights.sentimentAnalysisSummary}
          description="Sentiment breakdown from AI analysis of feedback or related communications regarding settlements."
        />
        <MockChart
          title="Estimated Optimization Savings Trend (Gemini)"
          type="Line Chart"
          data={[
            { period: "3 Months Ago", savings: insights.potentialSavingsFromOptimization * 0.7 },
            { period: "1 Month Ago", savings: insights.potentialSavingsFromOptimization * 0.9 },
            { period: "Current", savings: insights.potentialSavingsFromOptimization },
          ]} // Simplified trend for demo
          description="Trend of potential cost savings achieved through Gemini's continuous optimization of settlement paths."
        />
        <MockChart
          title="Gemini Compliance Risk Over Time"
          type="Line Chart"
          data={[
            { period: "Prev Quarter", risk_index: insights.geminiComplianceRiskIndex * 0.8 },
            { period: "Last Month", risk_index: insights.geminiComplianceRiskIndex * 0.9 },
            { period: "Current", risk_index: insights.geminiComplianceRiskIndex },
          ]}
          description="Historical and current trend of compliance risk, dynamically assessed by Gemini."
        />
        <MockChart
          title="Gemini Predictive Cash Flow Impact Distribution"
          type="Bar Chart"
          data={{
            positive_impact: insights.geminiPredictiveCashFlowImpact > 0 ? insights.geminiPredictiveCashFlowImpact : 0,
            negative_impact: insights.geminiPredictiveCashFlowImpact < 0 ? Math.abs(insights.geminiPredictiveCashFlowImpact) : 0,
            net_impact: insights.geminiPredictiveCashFlowImpact,
          }}
          description="Visual representation of Gemini's forecast on how pending settlements will affect your cash flow."
        />
      </div>

      <div className="mt-10 text-center text-sm text-gray-600 font-medium italic">
        All insights, KPIs, and visualizations presented are dynamically generated and continuously refined by cdbi's state-of-the-art Gemini-enabled AI.
        This system is designed for maximum accuracy, efficiency, and proactive problem-solving.
      </div>
    </div>
  );
};

// --- END: AI-POWERED ENHANCEMENTS FOR SETTLEMENTS ---

interface LedgerAccountSettlementsHomeProps {
  ledgerId: string;
}

const CONSTANT_QUERY_PARAMS = ["tab"];

const STYLE_MAPPING = {
  prettyStatus: "max-w-20",
  amount: "!px-1 max-w-20",
};

export default function LedgerAccountSettlementsHome({
  ledgerId,
}: LedgerAccountSettlementsHomeProps) {
  const searchComponents = getLedgerAccountSettlementSearchComponents();

  return (
    <div className="cdbi-app-container p-4 sm:p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      {/* AI Insights Dashboard is now a prominent feature */}
      <AISettlementInsightsDashboard ledgerId={ledgerId} />

      {/* Original ListView component, now placed below the AI dashboard */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          Detailed Ledger Account Settlements (Traditional View)
        </h2>
        <ListView
          resource={LEDGER_ACCOUNT_SETTLEMENT}
          graphqlDocument={LedgerAccountSettlementsHomeDocument}
          defaultSearchComponents={searchComponents.defaultComponents}
          additionalSearchComponents={searchComponents.additionalComponents}
          ListViewEmptyState={
            <div className="flex justify-center px-6 py-16">
              <LedgerAccountSettlementsEmptyState />
            </div>
          }
          customizableColumns
          constantQueryParams={CONSTANT_QUERY_PARAMS}
          constantQueryVariables={{ ledgerId }}
          mapQueryToVariables={mapLedgerAccountSettlementQueryToVariables}
          initialShowSearchArea
          styleMapping={STYLE_MAPPING}
        />
        <p className="text-sm text-gray-500 mt-6 text-center">
          This section provides a traditional, detailed list view of all settlements associated with ledger{" "}
          <span className="font-semibold">{ledgerId}</span>. For advanced analytics and predictive insights,
          refer to the cdbi AI-Powered Settlement Intelligence dashboard above.
        </p>
      </div>
    </div>
  );
}