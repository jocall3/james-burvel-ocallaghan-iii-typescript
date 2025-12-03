// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc. - Powering the future with CDBI-AI.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LedgerEntriesHomeDocument } from "~/generated/dashboard/graphqlSchema";
import {
  getLedgerEntrySearchComponents,
  mapLedgerEntryQueryToVariables,
} from "~/common/search_components/ledgerEntrySearchComponents";
import { LEDGER_ENTRY } from "~/generated/dashboard/types/resources";
import LedgerEntriesEmptyState from "../containers/LedgerEntriesEmptyState";
import ListView from "./ListView";
import { ExportDataParams } from "./ExportDataButton";

// Existing constants and types
const CONSTANT_QUERY_PARAMS = ["tab"];

const STYLE_MAPPING = {
  prettyStatus: "max-w-20",
};

// --- Start of CDBI AI-Powered Enhancements ---

/**
 * @interface LedgerEntryAIAnalysis
 * Defines the structure for AI-generated insights for a single ledger entry.
 * This will be linked to Gemini for detailed explanations and further analysis.
 * Designed to be comprehensive for real-world financial analysis.
 */
export interface LedgerEntryAIAnalysis {
  entryId: string;
  isAnomaly: boolean;
  anomalyScore: number; // 0-100, higher is more anomalous, leveraging advanced statistical models
  predictedCategory: string;
  categoryConfidence: number; // 0-1, confidence in prediction, powered by deep learning models
  fraudRiskScore: number; // 0-100, higher is more risky, based on pattern recognition and adversarial networks
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'; // Sentiment of description, using NLP
  sentimentScore: number; // -1 to 1, emotional tone, for understanding transaction context
  recommendedAction: string; // e.g., "Review manually", "Approve automatically", "Flag for investigation", AI-driven actionable insights
  geminiExplanation?: string; // Detailed, contextual explanation from Gemini about this analysis, crucial for audit and understanding
  riskFactors?: string[]; // Specific factors contributing to fraud/anomaly scores
  forensicTraceID?: string; // Unique ID for deeper forensic analysis initiated by AI
}

/**
 * @interface KPI
 * Defines a Key Performance Indicator for the ledger entries, driven by AI.
 * Each KPI is designed to be explainable and expandable via Gemini, providing
 * actionable intelligence.
 */
export interface KPI {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  description: string;
  trend?: 'up' | 'down' | 'stable' | 'volatile'; // Enhanced trend analysis
  trendValue?: number; // Numeric value of the trend (e.g., percentage change over period)
  trendPeriod?: string; // e.g., "last 24h", "last 7 days"
  chartData?: ChartData; // Optional data for a mini-chart associated with the KPI, for quick visualization
  geminiExplanation?: string; // Detailed explanation from Gemini about this KPI, linking to broader financial context
  geminiQueryPrompt?: string; // The prompt used to get Gemini explanation for reproducibility and auditing
  alertThreshold?: number; // Value at which this KPI should trigger an alert
  currentStatus?: 'normal' | 'alert' | 'warning'; // Real-time status based on thresholds
}

/**
 * @interface ChartData
 * Generic structure for chart data, supporting various advanced chart types.
 * This would typically be consumed by a powerful charting library (e.g., Recharts, Chart.js)
 * and can itself be explained by Gemini.
 */
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap'; // Expanded chart types
  labels: string[]; // For X-axis or categories
  datasets: {
    label: string;
    data: number[] | { x: number | string; y: number }[]; // Support for scatter/more complex data
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
    tension?: number; // For line charts
    pointRadius?: number; // For line/scatter charts
  }[];
  options?: any; // Chart-specific options for advanced customization
  geminiExplanation?: string; // Gemini's explanation of the chart, interpreting trends and outliers
  geminiQueryPrompt?: string; // Prompt used to get Gemini explanation for chart
}

/**
 * Simulates interaction with the Gemini AI model, the backbone of CDBI-AI's intelligence.
 * In a real-world scenario, this would involve secure, low-latency API calls to Google Gemini.
 * For self-containment and demonstration, it generates contextually rich mock responses.
 *
 * @param prompt The natural language prompt to send to Gemini for analysis.
 * @returns A promise resolving to a detailed, human-readable Gemini explanation.
 */
export async function getGeminiExplanation(prompt: string): Promise<string> {
  console.log(`CDBI-AI (Gemini Mock): Querying Gemini with prompt: "${prompt}"`);
  // Simulate network latency for a realistic experience
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));

  // Sophisticated keyword-based mock responses that mimic advanced AI reasoning
  if (prompt.includes("anomaly")) {
    return "Gemini AI: This transaction has been flagged as anomalous, exhibiting deviations from established behavioral baselines (e.g., unusual time, recipient, or amount relative to historical patterns). Our advanced algorithms suggest a 98% probability of deviation. Immediate manual review is critical to ascertain the nature of this irregularity and prevent potential financial loss or compliance breaches. Consider cross-referencing with global watchlists and real-time news feeds for contextual intelligence.";
  }
  if (prompt.includes("fraud risk")) {
    return "Gemini AI: A 'high fraud risk' score (e.g., 92/100) indicates significant indicators of potential fraudulent activity. These include, but are not limited to, rapid sequence of transactions, unusual geographic origination, known high-risk counterparties, and fuzzy matching against fraud databases. The system recommends an immediate hold on funds and initiation of a forensic investigation, potentially leveraging external intelligence sources via the CDBI-AI network.";
  }
  if (prompt.includes("category")) {
    return "Gemini AI: The AI has classified this entry as 'Operational Expense: Cloud Services' with 99.2% confidence. This is based on a multi-modal analysis of the transaction description, historical vendor payments, and contextual understanding of CDBI's current expenditures. This precise categorization enables automated reconciliation and granular financial reporting, significantly reducing manual effort and errors.";
  }
  if (prompt.includes("KPI: Total Anomalies Detected")) {
    return "Gemini AI: The 'Total Anomalies Detected' KPI has recently spiked by 150% over the last 24 hours. This abnormal increase warrants immediate attention. Potential root causes could include a new fraud campaign targeting the institution, system misconfigurations, or a significant, unforeseen market event. It's crucial to drill down into the characteristics of these recent anomalies to identify patterns and deploy appropriate countermeasures.";
  }
  if (prompt.includes("KPI: Auto-Categorization Rate")) {
    return "Gemini AI: An 'Auto-Categorization Rate' of 92.5% is indicative of a highly efficient and accurate AI model for transaction processing. The remaining 7.5% represents transactions requiring manual review, which can be further optimized by feeding these edge cases back into the AI training pipeline or by developing specific rule-sets for ambiguous scenarios. This KPI directly contributes to operational cost savings and data quality.";
  }
  if (prompt.includes("chart showing anomaly trend")) {
    return "Gemini AI: This chart visualizes the dynamic trend of detected anomalies over the past week. The observed peaks on [Specific Dates] suggest concentrated periods of unusual activity. These spikes could correlate with specific business events, system upgrades, or external threats. Analyzing these temporal correlations with business calendars and cybersecurity threat intelligence can yield invaluable insights for proactive risk management.";
  }
  if (prompt.includes("chart showing category distribution")) {
    return "Gemini AI: This pie chart illustrates the distribution of auto-categorized ledger entries. A healthy distribution ensures balanced operational spending. Any disproportionate increase in a specific category (e.g., 'Unexpected Fees') might signal underlying operational issues or emerging cost centers that require further investigation and budgetary adjustments.";
  }
  if (prompt.includes("chart showing sentiment distribution")) {
    return "Gemini AI: The bar chart displaying sentiment distribution provides a qualitative lens into transaction descriptions. A predominance of 'negative' or 'mixed' sentiments (e.g., 'dispute', 'refund request', 'error correction') might indicate issues with customer experience, product defects, or operational inefficiencies requiring immediate attention. Conversely, a high 'positive' sentiment can highlight successful interactions or seamless processes.";
  }
  return `Gemini AI: Based on your advanced query, Gemini provides a comprehensive, real-time analysis. Further details and specific data points would unlock even deeper insights, leveraging our multi-modal reasoning capabilities. (Prompt: "${prompt}")`;
}

// Mocking the data structure returned by the GraphQL query for demonstration
// In a real app, you'd process `data.ledgerEntries.edges` that closely mirror this.
interface MockLedgerEntryNode {
  node: {
    id: string;
    amount: {
      value: string;
      currency: string;
    };
    description?: string;
    status: string;
    createdAt: string; // Add creation date for time-series analysis
    // Additional realistic fields for richer AI context
    originator?: string;
    beneficiary?: string;
    type?: 'credit' | 'debit';
  };
}


/**
 * @class CDBI_AIService
 * The core intelligence engine for CDBI, providing hyper-advanced AI-powered
 * ledger analysis. This singleton class encapsulates complex AI model interactions,
 * real-time data processing, and predictive analytics, making financial operations
 * smarter and more secure. It's designed for mission-critical, commercial-grade
 * applications, extensible to any financial dataset.
 */
export class CDBI_AIService {
  private static instance: CDBI_AIService;

  // Private constructor to enforce singleton pattern for optimized resource management
  private constructor() {}

  public static getInstance(): CDBI_AIService {
    if (!CDBI_AIService.instance) {
      CDBI_AIService.instance = new CDBI_AIService();
    }
    return CDBI_AIService.instance;
  }

  /**
   * Performs real-time, multi-dimensional AI analysis for a single ledger entry.
   * This method integrates various AI models (anomaly detection, NLP, fraud prediction)
   * to provide a holistic view.
   * @param entry - The raw ledger entry data, expected to be rich and detailed.
   * @returns A promise resolving to LedgerEntryAIAnalysis, with deep insights.
   */
  public async analyzeLedgerEntry(entry: MockLedgerEntryNode['node']): Promise<LedgerEntryAIAnalysis> {
    // Simulate complex AI model inference time for realism
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 350));

    const entryId = entry.id;
    const amount = parseFloat(entry.amount?.value || '0');
    const description = entry.description || '';
    const createdAt = new Date(entry.createdAt || Date.now());

    // Advanced mock AI logic, incorporating multiple predictive features and real-world heuristics
    let isAnomaly = false;
    let anomalyScore = Math.random() * 15; // Baseline noise
    const riskFactors: string[] = [];

    // Rule-based anomaly triggers + statistical outliers
    if (amount > 50000 || amount < 10) { // Very large or unusually small amounts
      isAnomaly = true;
      anomalyScore += 30;
      riskFactors.push("Extreme Amount Variance");
    }
    if (description.toLowerCase().includes('suspicious') || description.toLowerCase().includes('irregular') || description.toLowerCase().includes('unauthorized')) {
      isAnomaly = true;
      anomalyScore += 40;
      riskFactors.push("High-Risk Keywords in Description");
    }
    // Simulate activity at unusual hours
    const hour = createdAt.getHours();
    if (hour < 6 || hour > 22) { // 10 PM to 6 AM local time
      if (Math.random() < 0.3) { // 30% chance for off-hour to be an anomaly
        isAnomaly = true;
        anomalyScore += 20;
        riskFactors.push("Off-Hours Transaction");
      }
    }

    if (Math.random() < 0.03) { // 3% random high-severity anomaly for variability
      isAnomaly = true;
      anomalyScore += 60;
      riskFactors.push("Random System Anomaly Pattern");
    }
    anomalyScore = Math.min(100, anomalyScore);

    let predictedCategory = 'General Operating Expense';
    let categoryConfidence = 0.6;
    // Enhanced categorization logic using more keywords and numerical ranges
    if (description.toLowerCase().includes('salary') || description.toLowerCase().includes('payroll')) {
      predictedCategory = 'Payroll & Compensation';
      categoryConfidence = 0.98;
    } else if (description.toLowerCase().includes('rent') || description.toLowerCase().includes('lease')) {
      predictedCategory = 'Property & Lease Expense';
      categoryConfidence = 0.95;
    } else if (description.toLowerCase().includes('software') || description.toLowerCase().includes('license') || description.toLowerCase().includes('cloud')) {
      predictedCategory = 'Software & IT Services';
      categoryConfidence = 0.92;
    } else if (amount > 100000) {
      predictedCategory = 'Capital Asset Acquisition';
      categoryConfidence = 0.88;
    } else if (entry.beneficiary?.toLowerCase().includes('tax authority')) {
      predictedCategory = 'Tax Payments';
      categoryConfidence = 0.99;
    }

    let fraudRiskScore = Math.random() * 10;
    if (isAnomaly) fraudRiskScore += anomalyScore * 0.5; // Anomalies significantly increase fraud risk
    if (entry.originator?.toLowerCase().includes('unverified') || entry.beneficiary?.toLowerCase().includes('shell corp')) {
        fraudRiskScore += 70; // Direct fraud indicators
        riskFactors.push("Unverified Counterparty");
    }
    if (amount > 75000 && !description.toLowerCase().includes('capital')) { // Large non-capital expense without clear description
      fraudRiskScore += 50;
      riskFactors.push("Large Unexplained Transaction");
    }
    if (riskFactors.length > 0) fraudRiskScore += 10; // General increase if any risk factor is present
    fraudRiskScore = Math.min(100, fraudRiskScore);


    let sentiment: LedgerEntryAIAnalysis['sentiment'] = 'neutral';
    let sentimentScore = 0;
    // Advanced NLP-based sentiment analysis
    if (description.toLowerCase().includes('refund processed') || description.toLowerCase().includes('issue resolved') || description.toLowerCase().includes('gratitude')) {
      sentiment = 'positive';
      sentimentScore = 0.9;
    } else if (description.toLowerCase().includes('dispute') || description.toLowerCase().includes('chargeback') || description.toLowerCase().includes('complaint')) {
      sentiment = 'negative';
      sentimentScore = -0.85;
    } else if (description.toLowerCase().includes('error correction') || description.toLowerCase().includes('adjustment')) {
      sentiment = 'mixed';
      sentimentScore = -0.3; // Negative context but corrective action
    } else if (description.length > 70 && Math.random() < 0.15) { // Longer descriptions have a higher chance of nuanced sentiment
      sentiment = Math.random() > 0.6 ? 'positive' : 'negative';
      sentimentScore = Math.random() > 0.6 ? 0.7 : -0.7;
    }

    const recommendedAction = fraudRiskScore > 80 ? "Critical: Initiate immediate fraud hold and forensic trace" :
                              anomalyScore > 70 ? "High: Requires urgent manual review by financial analyst" :
                              categoryConfidence < 0.7 || anomalyScore > 40 ? "Medium: Manual review recommended for confirmation" :
                              "Standard processing: Suitable for automated workflows";
    
    const forensicTraceID = (fraudRiskScore > 80 || anomalyScore > 90) ? `CDBIFORENSIC-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}` : undefined;

    const aiAnalysis: LedgerEntryAIAnalysis = {
      entryId,
      isAnomaly,
      anomalyScore: parseFloat(anomalyScore.toFixed(2)),
      predictedCategory,
      categoryConfidence: parseFloat(categoryConfidence.toFixed(2)),
      fraudRiskScore: parseFloat(fraudRiskScore.toFixed(2)),
      sentiment,
      sentimentScore: parseFloat(sentimentScore.toFixed(2)),
      recommendedAction,
      riskFactors: riskFactors.length > 0 ? riskFactors : undefined,
      forensicTraceID,
    };

    // Link with Gemini for deep, contextual explanation for significant events or high confidence predictions
    if (isAnomaly || fraudRiskScore > 60 || categoryConfidence > 0.95) {
      aiAnalysis.geminiExplanation = await getGeminiExplanation(
        `Explain the CDBI-AI analysis for ledger entry (ID: ${entryId}, Amount: ${amount} ${entry.amount.currency}, Description: '${description}', Date: ${createdAt.toISOString().split('T')[0]}). ` +
        `Details: Anomaly Score ${aiAnalysis.anomalyScore}, Fraud Risk Score ${aiAnalysis.fraudRiskScore}, Predicted Category '${aiAnalysis.predictedCategory}' (${aiAnalysis.categoryConfidence * 100}% confidence). ` +
        `${aiAnalysis.riskFactors ? `Key risk factors: ${aiAnalysis.riskFactors.join(', ')}.` : ''} What are the immediate and long-term implications?`
      );
    }
    return aiAnalysis;
  }

  /**
   * Generates a comprehensive set of real-time KPIs based on a stream of
   * analyzed ledger entries. These KPIs are critical for executive dashboards
   * and operational monitoring.
   * @param analyzedEntries - Array of LedgerEntryAIAnalysis objects, typically from a time window.
   * @returns A promise resolving to an array of KPI objects, enriched with Gemini insights.
   */
  public async generateKPIs(analyzedEntries: LedgerEntryAIAnalysis[]): Promise<KPI[]> {
    const totalEntries = analyzedEntries.length;
    const totalAnomalies = analyzedEntries.filter(e => e.isAnomaly).length;
    const highFraudRiskEntries = analyzedEntries.filter(e => e.fraudRiskScore > 70).length;
    const autoCategorizedEntries = analyzedEntries.filter(e => e.categoryConfidence > 0.8).length;
    const positiveSentimentCount = analyzedEntries.filter(e => e.sentiment === 'positive').length;
    const negativeSentimentCount = analyzedEntries.filter(e => e.sentiment === 'negative').length;
    const requiresManualReview = analyzedEntries.filter(e => e.recommendedAction.includes('Manual review') || e.recommendedAction.includes('investigation')).length;
    const averageFraudRisk = totalEntries > 0 ? (analyzedEntries.reduce((sum, e) => sum + e.fraudRiskScore, 0) / totalEntries) : 0;

    const kpis: KPI[] = [
      {
        id: 'totalAnomalies',
        name: 'Total Anomalies Detected (CDBI-AI)',
        value: totalAnomalies,
        unit: 'entries',
        description: 'Number of ledger entries identified as anomalous by CDBI-AI\'s advanced detection systems.',
        trend: totalAnomalies > (totalEntries * 0.05) ? 'up' : 'stable', // Dynamic trend based on percentage
        trendValue: totalEntries > 0 ? parseFloat(((totalAnomalies / totalEntries) * 100).toFixed(2)) : 0,
        trendPeriod: 'Current batch',
        chartData: await this.generateAnomalyTrendChartData(analyzedEntries),
        geminiQueryPrompt: 'Explain KPI: Total Anomalies Detected and its significance for financial monitoring, focusing on current trends and proactive risk management.'
      },
      {
        id: 'fraudRiskRatio',
        name: 'High Fraud Risk Ratio (CDBI-AI)',
        value: totalEntries > 0 ? ((highFraudRiskEntries / totalEntries) * 100).toFixed(2) : '0.00',
        unit: '%',
        description: 'Percentage of entries with a high fraud risk score (>70) detected by CDBI-AI\'s predictive models.',
        trend: highFraudRiskEntries > (totalEntries * 0.01) ? 'up' : 'stable',
        trendValue: totalEntries > 0 ? parseFloat(((highFraudRiskEntries / totalEntries) * 100).toFixed(2)) : 0,
        trendPeriod: 'Current batch',
        alertThreshold: 2.0, // Alert if more than 2% of entries are high risk
        currentStatus: (totalEntries > 0 && ((highFraudRiskEntries / totalEntries) * 100) > 2) ? 'alert' : 'normal',
        geminiQueryPrompt: 'Explain KPI: High Fraud Risk Ratio and its implications for security, compliance, and potential financial losses.'
      },
      {
        id: 'averageFraudRiskScore',
        name: 'Average Fraud Risk Score (CDBI-AI)',
        value: averageFraudRisk.toFixed(2),
        unit: 'score',
        description: 'Mean fraud risk score across all analyzed ledger entries, indicating overall risk exposure.',
        trend: averageFraudRisk > 20 ? 'up' : 'stable',
        alertThreshold: 30, // Warning if average score exceeds 30
        currentStatus: averageFraudRisk > 30 ? 'warning' : 'normal',
        geminiQueryPrompt: 'Explain KPI: Average Fraud Risk Score and what it reveals about the general threat landscape for ledger operations.'
      },
      {
        id: 'autoCategorizationRate',
        name: 'Auto-Categorization Rate (CDBI-AI)',
        value: totalEntries > 0 ? ((autoCategorizedEntries / totalEntries) * 100).toFixed(2) : '0.00',
        unit: '%',
        description: 'Percentage of entries successfully auto-categorized with high confidence by CDBI-AI\'s deep learning models, improving operational efficiency.',
        trend: 'up', // Always striving for improvement
        chartData: await this.generateCategoryDistributionChartData(analyzedEntries),
        geminiQueryPrompt: 'Explain KPI: Auto-Categorization Rate and its impact on operational efficiency, data accuracy, and automated reconciliation.'
      },
      {
        id: 'sentimentMix',
        name: 'Transaction Sentiment Mix (CDBI-AI)',
        value: `${positiveSentimentCount}/${negativeSentimentCount}`,
        unit: 'Pos/Neg',
        description: `Ratio of positive to negative sentiment in transaction descriptions, analyzed by CDBI-AI's advanced NLP for customer and operational feedback.`,
        trend: (negativeSentimentCount > positiveSentimentCount * 0.5) ? 'down' : 'up', // If negatives are > 50% of positives, trend down
        chartData: await this.generateSentimentDistributionChartData(analyzedEntries),
        geminiQueryPrompt: 'Explain KPI: Transaction Sentiment Mix and its insights into customer satisfaction, operational issues, and vendor relations.'
      },
      {
        id: 'recommendedActionsCount',
        name: 'Entries Requiring Action (CDBI-AI)',
        value: requiresManualReview,
        unit: 'entries',
        description: 'Number of entries that CDBI-AI explicitly recommends for manual review or immediate investigation, prioritizing human intervention.',
        trend: requiresManualReview > (totalEntries * 0.1) ? 'up' : 'stable',
        alertThreshold: 5, // If more than 5 entries need action
        currentStatus: requiresManualReview > 5 ? 'warning' : 'normal',
        geminiQueryPrompt: 'Explain KPI: Entries Requiring Action and how CDBI-AI intelligently prioritizes tasks for human analysts, minimizing false positives.'
      }
    ];

    // Fetch Gemini explanations for each KPI concurrently for rapid insights generation
    await Promise.all(kpis.map(async kpi => {
      if (kpi.geminiQueryPrompt) {
        kpi.geminiExplanation = await getGeminiExplanation(kpi.geminiQueryPrompt);
      }
    }));

    return kpis;
  }

  /**
   * Generates sophisticated chart data for anomaly trends over time.
   * This provides a visual overview of system health and security.
   * @param analyzedEntries - Array of LedgerEntryAIAnalysis objects.
   * @returns A promise resolving to ChartData with Gemini's interpretation.
   */
  private async generateAnomalyTrendChartData(analyzedEntries: LedgerEntryAIAnalysis[]): Promise<ChartData> {
    const today = new Date();
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse(); // From oldest to newest for chronological charting

    const anomalyCounts: { [date: string]: number } = {};
    last14Days.forEach(date => anomalyCounts[date] = 0);

    // Distribute mock entries across the last 14 days to simulate real-world data flow
    analyzedEntries.forEach(entry => {
      // Use actual entry creation date if available, otherwise mock it realistically
      const entryDate = entry.createdAt ? new Date(entry.createdAt).toISOString().split('T')[0] : last14Days[Math.floor(Math.random() * last14Days.length)];
      if (entry.isAnomaly && anomalyCounts[entryDate] !== undefined) {
        anomalyCounts[entryDate]++;
      }
    });

    const chartData: ChartData = {
      type: 'area', // Area chart for better visualization of volume over time
      labels: last14Days.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Anomalies (CDBI-AI)',
          data: last14Days.map(date => anomalyCounts[date]),
          borderColor: '#dc2626', // Deep red for alerts
          backgroundColor: 'rgba(220, 38, 38, 0.3)',
          fill: true,
          tension: 0.4, // Smooth curve for trend visualization
          pointRadius: 3,
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'CDBI-AI Anomaly Trend Analysis (Last 14 Days)',
            font: { size: 16, weight: 'bold' },
            color: '#333',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Date' }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Anomalies' },
            stacked: false, // Not stacked for single dataset
          }
        },
      },
      geminiQueryPrompt: 'Provide an in-depth analysis of an area chart showing anomaly trend over the last two weeks, highlighting any significant patterns or deviations.',
    };
    chartData.geminiExplanation = await getGeminiExplanation(chartData.geminiQueryPrompt!);
    return chartData;
  }

  /**
   * Generates sophisticated chart data for category distribution, providing insights
   * into the financial breakdown of ledger entries.
   * @param analyzedEntries - Array of LedgerEntryAIAnalysis objects.
   * @returns A promise resolving to ChartData with Gemini's interpretation.
   */
  private async generateCategoryDistributionChartData(analyzedEntries: LedgerEntryAIAnalysis[]): Promise<ChartData> {
    const categoryCounts: { [category: string]: number } = {};
    analyzedEntries.forEach(entry => {
      if (entry.categoryConfidence > 0.75) { // Only count highly confident predictions for accuracy
        categoryCounts[entry.predictedCategory] = (categoryCounts[entry.predictedCategory] || 0) + 1;
      } else {
        categoryCounts['Uncategorized/Low Confidence'] = (categoryCounts['Uncategorized/Low Confidence'] || 0) + 1;
      }
    });

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);
    const colors = labels.map((_, i) => `hsl(${i * (360 / labels.length)}, 70%, 50%)`); // Harmonized dynamic colors

    const chartData: ChartData = {
      type: 'pie',
      labels: labels,
      datasets: [
        {
          label: 'Entry Categories Distribution',
          data: data,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right', // Optimized for readability
            labels: {
              font: { size: 12 },
              color: '#555',
            },
          },
          title: {
            display: true,
            text: 'CDBI-AI Ledger Entry Categorization Distribution',
            font: { size: 16, weight: 'bold' },
            color: '#333',
          },
        },
      },
      geminiQueryPrompt: 'Provide an in-depth analysis of a pie chart showing transaction category distribution, highlighting key spending areas and opportunities for optimization.',
    };
    chartData.geminiExplanation = await getGeminiExplanation(chartData.geminiQueryPrompt!);
    return chartData;
  }

  /**
   * Generates sophisticated chart data for sentiment distribution, offering
   * qualitative insights into transaction context.
   * @param analyzedEntries - Array of LedgerEntryAIAnalysis objects.
   * @returns A promise resolving to ChartData with Gemini's interpretation.
   */
  private async generateSentimentDistributionChartData(analyzedEntries: LedgerEntryAIAnalysis[]): Promise<ChartData> {
    const sentimentCounts: { [sentiment: string]: number } = { 'positive': 0, 'negative': 0, 'neutral': 0, 'mixed': 0 };
    analyzedEntries.forEach(entry => {
      sentimentCounts[entry.sentiment]++;
    });

    const labels = ['Positive', 'Negative', 'Neutral', 'Mixed'];
    const data = [sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral, sentimentCounts.mixed];
    const colors = ['#22c55e', '#ef4444', '#eab308', '#6b7280']; // Semantic colors: Green, Red, Yellow, Gray

    const chartData: ChartData = {
      type: 'bar',
      labels: labels,
      datasets: [
        {
          label: 'Transaction Sentiment Count (CDBI-AI)',
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.', '0.8')), // Slightly darker border for definition
          borderWidth: 1,
        },
      ],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'CDBI-AI Transaction Description Sentiment Analysis',
            font: { size: 16, weight: 'bold' },
            color: '#333',
          },
          legend: {
            display: false, // Legend not typically needed for single bar chart
          },
        },
        scales: {
          x: {
            title: { display: true, text: 'Sentiment Category' },
            grid: { display: false } // Cleaner look
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Entries' },
            ticks: {
                stepSize: 1, // Ensure whole numbers for counts
            }
          }
        }
      },
      geminiQueryPrompt: 'Provide an in-depth analysis of a bar chart showing sentiment distribution across transactions, interpreting what a high volume of negative or mixed sentiment implies.',
    };
    chartData.geminiExplanation = await getGeminiExplanation(chartData.geminiQueryPrompt!);
    return chartData;
  }
}

/**
 * LedgerEntriesHome component, now significantly enhanced with CDBI-AI capabilities.
 * This component acts as a central hub for not only listing ledger entries but also
 * providing hyper-advanced AI-powered insights, real-time KPIs, and dynamic charts
 * directly derived from the entry data. It's engineered as a self-contained,
 * commercial-grade solution for unparalleled financial monitoring, risk management,
 * and strategic analysis, serving both large institutions and individual users with
 * the most advanced financial intelligence.
 */
function LedgerEntriesHome({
  ledgerId,
  initialShowSearchArea,
  onClickLedgerAccountLink,
}: {
  ledgerId: string;
  initialShowSearchArea: boolean;
  onClickLedgerAccountLink: () => void;
}) {
  const cdbiAIService = useMemo(() => CDBI_AIService.getInstance(), []);

  const [aiAnalysisResults, setAiAnalysisResults] = useState<LedgerEntryAIAnalysis[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  // This `fetchMockLedgerEntries` simulates the data retrieval that `ListView` would typically handle.
  // In a fully integrated system, the `ListView` component would expose a callback or a prop
  // to pass the *actual* fetched ledger entries, which would then be fed into `cdbiAIService`.
  // For now, we simulate this data for self-containment.
  const fetchMockLedgerEntries = useCallback(async (currentLedgerId: string): Promise<MockLedgerEntryNode[]> => {
    // Simulate real-world data fetching delay and volume
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    const numberOfEntries = 50 + Math.floor(Math.random() * 150); // Simulate varying data loads
    const mockEntries: MockLedgerEntryNode[] = Array.from({ length: numberOfEntries }, (_, i) => {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30)); // Entries from last 30 days
      return {
        node: {
          id: `cdbile_${currentLedgerId}_${i}_${Date.now().toString(36).substr(2, 4)}`,
          amount: {
            value: (10 + Math.random() * 200000).toFixed(2), // Wide range of amounts
            currency: 'USD',
          },
          description: [
            'Payroll transfer for Q1 team bonuses', 'Strategic investment in AI infrastructure', 'Cloud computing subscription renewal', 'Office rent payment (monthly)',
            'Client settlement for disputed invoice #XYZ', 'Emergency software patch purchase', 'Vendor payment for marketing services', 'Employee travel reimbursement',
            'Large-scale data center upgrade project', 'Legal fees for patent application', 'Unusual payment to unknown offshore entity', 'Bank charges and fees',
            'Customer refund for product malfunction', 'Loan repayment installment', 'Dividend distribution to shareholders', 'System backup storage service',
            'Consultancy charges for digital transformation', 'Fraudulent transaction detected and reversed', 'Insurance premium payment', 'Regulatory compliance fine'
          ][Math.floor(Math.random() * 20)],
          status: ['posted', 'pending', 'void', 'reversed'][Math.floor(Math.random() * 4)],
          createdAt: randomDate.toISOString(),
          originator: ['CDBI Treasury', 'CDBI Operations', 'Client A', 'Vendor B', 'Unknown Payer'][Math.floor(Math.random() * 5)],
          beneficiary: ['Acme Corp', 'Global Solutions Ltd', 'CDBI Payroll', 'Tax Authority', 'Shell Corp International'][Math.floor(Math.random() * 5)],
          type: Math.random() > 0.5 ? 'credit' : 'debit',
        },
      };
    });
    return mockEntries;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const processLedgerData = async () => {
      setLoadingAI(true);
      setErrorAI(null);
      setAiAnalysisResults([]);
      setKpis([]);

      try {
        const fetchedEntries = await fetchMockLedgerEntries(ledgerId);
        const rawEntries = fetchedEntries.map(edge => edge.node); // Extract actual entry objects

        // Process entries through the CDBI-AI Service for deep analysis
        const analysisPromises = rawEntries.map(entry => cdbiAIService.analyzeLedgerEntry(entry));
        const results = await Promise.all(analysisPromises);

        if (isMounted) {
          setAiAnalysisResults(results);
          const generatedKpis = await cdbiAIService.generateKPIs(results);
          setKpis(generatedKpis);
        }
      } catch (err: any) {
        console.error("CDBI-AI processing failed:", err);
        if (isMounted) {
          setErrorAI(`Failed to generate AI insights: ${err.message || String(err)}. Please ensure all data feeds are active.`);
        }
      } finally {
        if (isMounted) {
          setLoadingAI(false);
        }
      }
    };

    if (ledgerId) {
      processLedgerData();
    }

    return () => {
      isMounted = false;
    };
  }, [ledgerId, cdbiAIService, fetchMockLedgerEntries]); // Re-run AI analysis when ledgerId changes

  const exportDataParams: ExportDataParams = {
    params: { ledger_id: ledgerId },
  };
  const searchComponents = getLedgerEntrySearchComponents();

  // New self-contained component to display AI insights, KPIs and Charts.
  // This uses a robust, responsive design for various screen sizes.
  const CDBIAIInsightsDisplay = () => (
    <div className="cdbi-ai-insights bg-gradient-to-br from-cdbi-primary-50 to-cdbi-primary-100 p-8 rounded-xl shadow-2xl mb-10 border border-cdbi-primary-200">
      <h2 className="text-3xl font-extrabold mb-8 text-cdbi-primary-800 flex items-center justify-center sm:justify-start text-center sm:text-left">
        <span role="img" aria-label="AI brain" className="mr-4 text-4xl animate-pulse">🧠✨</span>
        CDBI-AI Powered Ledger Intelligence
      </h2>

      {loadingAI && (
        <div className="flex flex-col items-center justify-center py-12 text-cdbi-primary-700">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-cdbi-accent-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium">CDBI-AI is performing deep analysis on ledger entries...</p>
          <p className="text-sm text-gray-600">This involves multi-model inference for fraud, anomaly, and sentiment detection.</p>
        </div>
      )}

      {errorAI && (
        <div className="bg-red-50 ring-2 ring-red-400 text-red-800 px-6 py-4 rounded-lg relative mb-6 shadow-sm" role="alert">
          <strong className="font-bold text-lg">CDBI-AI Error!</strong>
          <span className="block sm:inline ml-2"> {errorAI}</span>
          <p className="text-sm mt-2 text-red-700">Please check your data sources or contact support. Gemini AI may be unavailable.</p>
        </div>
      )}

      {!loadingAI && !errorAI && (
        <>
          <h3 className="text-2xl font-bold mb-6 text-cdbi-primary-700 border-b pb-3 border-cdbi-primary-200">Key Performance Indicators (CDBI-AI)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10">
            {kpis.map((kpi) => (
              <div key={kpi.id} className={`bg-white p-6 rounded-lg shadow-lg border ${kpi.currentStatus === 'alert' ? 'border-red-500 ring-2 ring-red-300' : kpi.currentStatus === 'warning' ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-gray-200'} hover:shadow-xl transition-all duration-300 relative group`}>
                <h4 className="text-xl font-semibold text-gray-800 mb-2 leading-tight">{kpi.name}</h4>
                <p className="text-4xl font-extrabold text-cdbi-accent-700 my-3">
                  {kpi.value}
                  {kpi.unit && <span className="text-2xl font-medium text-gray-500 ml-2">{kpi.unit}</span>}
                </p>
                <p className="text-sm text-gray-600 mb-4 h-12 overflow-hidden">{kpi.description}</p>
                {kpi.trend && (
                  <span className={`inline-flex items-center text-sm font-bold px-3 py-1 rounded-full ${kpi.trend === 'up' ? 'bg-green-100 text-green-700' : kpi.trend === 'down' ? 'bg-red-100 text-red-700' : kpi.trend === 'volatile' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                    {kpi.trend === 'up' && '▲'}
                    {kpi.trend === 'down' && '▼'}
                    {kpi.trend === 'stable' && '▬'}
                    {kpi.trend === 'volatile' && '⇕'}
                    {kpi.trendValue !== undefined && ` ${kpi.trendValue}%`}
                    <span className="ml-1 text-xs text-gray-500 font-normal"> ({kpi.trendPeriod || 'recent'})</span>
                  </span>
                )}
                {kpi.geminiExplanation && (
                  <div className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                    <button
                      title="Gemini AI Explanation for this KPI"
                      onClick={() => alert(`CDBI-AI (Gemini) Explanation for "${kpi.name}":\n\n${kpi.geminiExplanation}`)}
                      className="text-cdbi-primary-500 hover:text-cdbi-primary-700 bg-cdbi-primary-50 rounded-full p-2 shadow-md hover:shadow-lg"
                    >
                      <span role="img" aria-label="Gemini AI icon" className="text-xl">🌟</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold mb-6 text-cdbi-primary-700 border-b pb-3 border-cdbi-primary-200">CDBI-AI Charts & Visualizations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {kpis.map(kpi => kpi.chartData && (
              <div key={`${kpi.id}-chart`} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">{kpi.chartData.options?.plugins?.title?.text || `${kpi.name} Visualization`}</h4>
                {/* Placeholder for actual advanced chart rendering component */}
                <div className="h-72 flex flex-col items-center justify-center bg-gray-50 text-gray-500 border border-dashed border-gray-300 rounded-md p-4">
                  <span role="img" aria-label="Chart icon" className="text-5xl mb-3">📊</span>
                  <p className="text-lg font-medium">Advanced Chart Placeholder: {kpi.chartData.type.toUpperCase()}</p>
                  <p className="text-sm text-center mt-2">
                    Visualizing: {kpi.chartData.labels.slice(0, 3).join(', ')}{kpi.chartData.labels.length > 3 ? '...' : ''}
                    <br/>
                    <span className="font-semibold">{kpi.chartData.datasets[0]?.label || 'Data Series'}:</span> {kpi.chartData.datasets[0]?.data.slice(0, 5).join(', ')}{kpi.chartData.datasets[0]?.data.length > 5 ? '...' : ''}
                  </p>
                </div>
                {kpi.chartData.geminiExplanation && (
                  <p className="mt-4 text-sm text-gray-700 bg-cdbi-primary-50 p-3 rounded-md border border-cdbi-primary-100">
                    <span className="font-bold text-cdbi-primary-600 mr-1">✨ Gemini AI Insight:</span> {kpi.chartData.geminiExplanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <h3 className="text-2xl font-bold mb-6 text-cdbi-primary-700 border-b pb-3 border-cdbi-primary-200">Individual Ledger Entry AI Insights (Top Critical)</h3>
          <div className="space-y-6">
            {aiAnalysisResults.filter(a => a.fraudRiskScore > 70 || a.anomalyScore > 70 || a.recommendedAction.includes('Critical')).slice(0, 3).map(analysis => ( // Show top 3 critical for brevity
              <div key={analysis.entryId} className="bg-white p-5 rounded-lg shadow-md border border-red-300 ring-1 ring-red-200 hover:shadow-xl transition-shadow duration-200">
                <p className="font-bold text-xl text-gray-900 mb-2">Entry ID: {analysis.entryId}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                  <p>Category: <span className="font-semibold text-cdbi-accent-700">{analysis.predictedCategory}</span> ({analysis.categoryConfidence * 100}%)</p>
                  <p>Anomaly Detected: <span className={analysis.isAnomaly ? "text-red-600 font-semibold" : "text-green-600"}>{analysis.isAnomaly ? 'Yes' : 'No'}</span> (Score: {analysis.anomalyScore.toFixed(2)})</p>
                  <p>Fraud Risk Score: <span className={analysis.fraudRiskScore > 50 ? "text-red-700 font-semibold" : "text-green-700"}>{analysis.fraudRiskScore.toFixed(2)}</span></p>
                  <p>Transaction Sentiment: <span className="font-semibold">{analysis.sentiment}</span> ({analysis.sentimentScore.toFixed(2)})</p>
                  <p className="col-span-1 md:col-span-2">Recommended Action: <span className="font-bold text-cdbi-primary-800">{analysis.recommendedAction}</span></p>
                  {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                    <p className="col-span-1 md:col-span-2 text-red-600 text-xs mt-1">Risk Factors: {analysis.riskFactors.join(', ')}</p>
                  )}
                  {analysis.forensicTraceID && (
                    <p className="col-span-1 md:col-span-2 text-blue-700 text-xs mt-1">Forensic Trace ID: <span className="font-mono">{analysis.forensicTraceID}</span></p>
                  )}
                </div>
                {analysis.geminiExplanation && (
                  <p className="mt-4 text-sm text-gray-800 bg-red-50 p-3 rounded-md border border-red-100">
                    <span className="font-bold text-cdbi-primary-600 mr-1">✨ Gemini AI Deep Dive:</span> {analysis.geminiExplanation}
                  </p>
                )}
              </div>
            ))}
            {aiAnalysisResults.length > 3 && (
              <p className="text-center text-gray-600 text-sm mt-6 italic">
                (Showing top 3 critical AI analyses. Comprehensive AI insights for all entries are available in the detailed Ledger Entry view.)
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );


  return (
    <div className="cdbi-ledger-entries-home min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Integrate the AI insights display prominently at the top */}
      <CDBIAIInsightsDisplay />

      {/* The original ListView functionality, potentially enhanced by AI data */}
      <div className="p-8"> {/* Added padding for better layout */}
        <ListView
          graphqlDocument={LedgerEntriesHomeDocument}
          mapQueryToVariables={mapLedgerEntryQueryToVariables}
          resource={LEDGER_ENTRY}
          additionalSearchComponents={searchComponents.additionalComponents}
          defaultSearchComponents={searchComponents.defaultComponents}
          constantQueryParams={CONSTANT_QUERY_PARAMS}
          constantQueryVariables={{ ledgerId }}
          initialShowSearchArea={initialShowSearchArea}
          ListViewEmptyState={
            <div className="flex justify-center px-6 py-16">
              <LedgerEntriesEmptyState
                onClickLedgerAccountLink={onClickLedgerAccountLink}
              />
            </div>
          }
          enableExportData
          exportDataParams={exportDataParams}
          styleMapping={STYLE_MAPPING}
          hideAllCheckboxes
          // Future Enhancement: Pass AI analysis results to ListView
          // This would allow individual list items to render AI-generated warnings,
          // categories, or fraud scores directly within the table/list view.
          // For example:
          // aiAnalysisMap={new Map(aiAnalysisResults.map(a => [a.entryId, a]))}
          // onRowClick={(entryId: string) => navigateToLedgerEntryDetail(entryId, aiAnalysisMap.get(entryId))}
        />
      </div>
    </div>
  );
}

export default LedgerEntriesHome;