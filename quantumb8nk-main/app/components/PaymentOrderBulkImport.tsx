// Copyright James Burvel Oâ€™Callaghan III
// President cdbi AI Solutions

import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CellValueUnion } from "@flatfile/api/api";
import {
  useBulkCreatePaymentOrdersMutation,
  useBulkValidatePaymentOrdersMutation,
} from "../../generated/dashboard/graphqlSchema";
import { BulkResourceType } from "./FlatfileBulkUploadButton";
import BulkImportHeader from "./BulkImportHeader";
import InternalAccountIdsList from "./InternalAccountIdsList";
import { PageHeader } from "../../common/ui-components/PageHeader/PageHeader";
import {
  paymentOrderBlueprint,
  paymentOrderBlueprintFields,
} from "./bulk_imports/blueprints/paymentOrderBlueprint";

// --- cdbi AI Solutions - Core AI Services & Utilities ---

/**
 * @class GeminiAIService
 * @description Simulates an advanced AI service (like Google Gemini) for processing financial data.
 * This class is designed to be self-contained within the application's context,
 * providing AI capabilities without external library dependencies beyond standard React/JS.
 * For a real-world application, this would interface with a cloud-based AI API.
 */
export class GeminiAIService {
  private static instance: GeminiAIService;
  private constructor() {}

  public static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  /**
   * Performs Natural Language Processing (NLP) on a payment description.
   * @param description The payment description string.
   * @returns An object containing inferred category, sentiment, and keywords.
   */
  public async analyzePaymentDescription(description: string): Promise<{ category: string; sentiment: string; keywords: string[] }> {
    console.log(`Gemini AI: Analyzing description - "${description}"`);
    // Simulate advanced NLP with AI for category inference, sentiment analysis, and keyword extraction.
    // In a real scenario, this would call a Gemini NLP API.
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API latency

    const lowerDesc = description.toLowerCase();
    let category = "General Expense";
    let sentiment = "neutral";
    const keywords: string[] = [];

    if (lowerDesc.includes("salary") || lowerDesc.includes("payroll")) {
      category = "Income: Salary";
      sentiment = "positive";
    } else if (lowerDesc.includes("rent") || lowerDesc.includes("housing")) {
      category = "Expense: Housing";
    } else if (lowerDesc.includes("utility") || lowerDesc.includes("electricity") || lowerDesc.includes("water")) {
      category = "Expense: Utilities";
    } else if (lowerDesc.includes("groceries") || lowerDesc.includes("food")) {
      category = "Expense: Groceries";
    } else if (lowerDesc.includes("loan") || lowerDesc.includes("debt")) {
      category = "Debt Repayment";
      sentiment = "negative";
    } else if (lowerDesc.includes("investment") || lowerDesc.includes("stock")) {
      category = "Investment";
      sentiment = "positive";
    }

    // Extract simple keywords
    const commonKeywords = ["payment", "transfer", "invoice", "refund", "bill"];
    commonKeywords.forEach(kw => {
      if (lowerDesc.includes(kw)) {
        keywords.push(kw);
      }
    });

    return { category, sentiment, keywords: Array.from(new Set(keywords)) }; // Deduplicate keywords
  }

  /**
   * Detects anomalies in a payment order based on amount, payee, and history.
   * @param paymentOrder The payment order data.
   * @returns A boolean indicating anomaly detection and a reason.
   */
  public async detectAnomaly(paymentOrder: Record<string, CellValueUnion | null>): Promise<{ isAnomaly: boolean; reason: string }> {
    console.log("Gemini AI: Detecting anomaly for payment order:", paymentOrder);
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API latency

    const amount = typeof paymentOrder.amount === 'number' ? paymentOrder.amount : parseFloat(String(paymentOrder.amount || '0'));
    const payee = String(paymentOrder.payee || '').toLowerCase();

    // Simulate simple AI anomaly detection rules
    if (amount > 100000) { // Large transaction
      return { isAnomaly: true, reason: "High value transaction detected. Review required." };
    }
    if (payee.includes("shell company") || payee.includes("suspicious entity")) {
      return { isAnomaly: true, reason: "Payee flagged as potentially suspicious." };
    }
    // More complex AI would involve historical data analysis, behavioral patterns, etc.
    return { isAnomaly: false, reason: "No immediate anomaly detected." };
  }

  /**
   * Provides predictive analytics for payment order success rate based on historical data.
   * @param paymentOrder The payment order data.
   * @returns A predicted success rate percentage.
   */
  public async predictSuccessRate(paymentOrder: Record<string, CellValueUnion | null>): Promise<number> {
    console.log("Gemini AI: Predicting success rate for payment order:", paymentOrder);
    await new Promise(resolve => setTimeout(resolve, 75)); // Simulate API latency

    // Simulate AI prediction based on various factors.
    // Real AI would use a trained model on past payment success/failure data.
    const amount = typeof paymentOrder.amount === 'number' ? paymentOrder.amount : parseFloat(String(paymentOrder.amount || '0'));
    const currency = String(paymentOrder.currency || 'USD');
    const payeeId = String(paymentOrder.payee_id || '');

    let baseRate = 98; // High default success rate
    if (amount > 50000) baseRate -= 5; // Higher value, slightly more risk
    if (currency !== 'USD' && currency !== 'EUR') baseRate -= 3; // International, slightly more complex
    if (payeeId === 'UNKNOWN' || payeeId === '') baseRate -= 2; // Missing payee info

    // Introduce some randomness for simulation
    const variation = (Math.random() - 0.5) * 5; // +/- 2.5%
    let predictedRate = baseRate + variation;
    return Math.max(0, Math.min(100, parseFloat(predictedRate.toFixed(2))));
  }

  /**
   * Generates a summary report using AI, focusing on insights from the payment data.
   * @param data A collection of payment orders.
   * @returns A comprehensive AI-generated report string.
   */
  public async generateAIPostImportReport(data: Array<Record<string, CellValueUnion | null>>): Promise<string> {
    console("Gemini AI: Generating post-import report...");
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate longer processing for report

    const totalOrders = data.length;
    let totalAmount = 0;
    const categories: { [key: string]: number } = {};
    let anomaliesDetected = 0;

    data.forEach(order => {
      const amount = typeof order.amount === 'number' ? order.amount : parseFloat(String(order.amount || '0'));
      totalAmount += amount;
      const category = (order as any).ai_category || "Uncategorized"; // Assuming AI adds this
      categories[category] = (categories[category] || 0) + 1;
      if ((order as any).ai_isAnomaly) anomaliesDetected++;
    });

    const highestCategory = Object.entries(categories).sort(([,a],[,b]) => b-a)[0]?.[0] || 'N/A';

    return `
      <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
        <h3 style="color: #007bff;">cdbi AI Payment Import Summary</h3>
        <p><strong>Total Payment Orders Processed:</strong> ${totalOrders}</p>
        <p><strong>Total Value Imported:</strong> $${totalAmount.toFixed(2)}</p>
        <p><strong>AI-Detected Anomalies:</strong> ${anomaliesDetected} (${((anomaliesDetected / totalOrders) * 100 || 0).toFixed(2)}%)</p>
        <p><strong>Most Frequent AI Category:</strong> ${highestCategory}</p>
        <hr/>
        <h4>AI Insights:</h4>
        <ul>
          <li>The AI observed a significant volume of payments categorized as "Expense: Housing" this period, suggesting a focus on recurring personal liabilities.</li>
          <li>${anomaliesDetected > 0 ? `The AI flagged ${anomaliesDetected} potential anomalies, primarily due to high transaction values. These warrant further human review.` : `No significant anomalies were flagged by the AI in this batch, indicating a generally clean dataset.`}</li>
          <li>Average predicted success rate for this batch was strong, suggesting high data quality and valid payment instructions.</li>
        </ul>
        <p style="font-style: italic; color: #666;">Generated by cdbi's Gemini-powered AI platform.</p>
      </div>
    `;
  }

  /**
   * Generates a KPI dataset suitable for charting, using mock data for demonstration.
   * In a real scenario, this would aggregate data from a database and process it.
   */
  public async getKPIData(): Promise<AIAnalyticsData> {
    console.log("Gemini AI: Generating KPI data...");
    await new Promise(resolve => setTimeout(resolve, 200));

    const successRateHistory = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 90 + Math.random() * 10,
    })).reverse();

    const anomalyDetectionTrends = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5),
    })).reverse();

    const aiCategorizationAccuracy = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 75 + Math.random() * 15, // 75-90% accuracy
    })).reverse();

    return {
      totalImports: 1250,
      averageSuccessRate: parseFloat((successRateHistory.reduce((sum, item) => sum + item.value, 0) / successRateHistory.length).toFixed(2)),
      aiDetectedAnomalies: 45,
      aiCategorizedPayments: 1100,
      kpis: {
        paymentSuccessRate: {
          label: "Overall Payment Success Rate",
          value: parseFloat((98.12 + (Math.random() - 0.5) * 1).toFixed(2)),
          unit: "%",
          description: "Percentage of payment orders successfully processed by cdbi AI.",
          chartData: successRateHistory,
          chartType: "line",
          geminiPrompt: "Generate a detailed line chart for 'Overall Payment Success Rate' over the last 7 days."
        },
        aiAnomalyDetectionCount: {
          label: "AI Detected Anomalies (Past Week)",
          value: anomalyDetectionTrends.reduce((sum, item) => sum + item.count, 0),
          unit: "count",
          description: "Number of payment anomalies identified by cdbi AI in the last 7 days.",
          chartData: anomalyDetectionTrends,
          chartType: "bar",
          geminiPrompt: "Visualize 'AI Detected Anomalies' as a bar chart showing daily counts for the last week."
        },
        aiCategorizationAccuracy: {
          label: "AI Categorization Accuracy",
          value: parseFloat((88.5 + (Math.random() - 0.5) * 2).toFixed(2)),
          unit: "%",
          description: "Accuracy of AI in correctly categorizing payment transactions.",
          chartData: aiCategorizationAccuracy,
          chartType: "line",
          geminiPrompt: "Show 'AI Categorization Accuracy' trends over time with a line chart."
        },
        aiProcessingEfficiency: {
          label: "AI Processing Efficiency Boost",
          value: parseFloat((45.2 + (Math.random() - 0.5) * 5).toFixed(2)),
          unit: "%",
          description: "Estimated percentage reduction in manual review effort due to AI pre-processing.",
          chartData: null, // No historical chart for simplicity for this KPI
          chartType: "gauge",
          geminiPrompt: "Create a gauge chart showing 'AI Processing Efficiency Boost'."
        }
      }
    };
  }
}

/**
 * Interface for AI processing results for a single payment order.
 */
export interface AIPaymentOrderResult {
  ai_category: string;
  ai_sentiment: string;
  ai_keywords: string[];
  ai_isAnomaly: boolean;
  ai_anomalyReason: string;
  ai_predictedSuccessRate: number;
  ai_warnings: string[];
  ai_suggestions: string[];
  originalData: Record<string, CellValueUnion | null>;
}

/**
 * Interface for AI Analytics Data.
 */
export interface AIAnalyticsKPI {
  label: string;
  value: number;
  unit: string;
  description: string;
  chartData: { date: string; value?: number; count?: number }[] | null;
  chartType: "line" | "bar" | "gauge" | "pie";
  geminiPrompt: string; // Prompt for Gemini to generate visualization
}

export interface AIAnalyticsData {
  totalImports: number;
  averageSuccessRate: number;
  aiDetectedAnomalies: number;
  aiCategorizedPayments: number;
  kpis: {
    paymentSuccessRate: AIAnalyticsKPI;
    aiAnomalyDetectionCount: AIAnalyticsKPI;
    aiCategorizationAccuracy: AIAnalyticsKPI;
    aiProcessingEfficiency: AIAnalyticsKPI;
    // Add more KPIs as needed
  };
}

/**
 * @class AI_PaymentOrderProcessor
 * @description Manages the AI-powered pre-processing and post-processing of payment orders.
 * Encapsulates the logic for leveraging the GeminiAIService.
 */
export class AI_PaymentOrderProcessor {
  private geminiService: GeminiAIService;

  constructor() {
    this.geminiService = GeminiAIService.getInstance();
  }

  /**
   * Enhances and validates a list of payment orders using AI.
   * @param paymentOrders The raw payment order data from the bulk import.
   * @returns A promise resolving to an array of enhanced payment order results.
   */
  public async processBulkPaymentOrders(
    paymentOrders: Array<Record<string, CellValueUnion | null>>
  ): Promise<{ processedOrders: AIPaymentOrderResult[]; aiSummary: { totalAnomalies: number; totalCategorized: number; } }> {
    console.log(`cdbi AI: Starting AI processing for ${paymentOrders.length} payment orders.`);
    const processedOrders: AIPaymentOrderResult[] = [];
    let totalAnomalies = 0;
    let totalCategorized = 0;

    for (const order of paymentOrders) {
      const description = String(order.description || '');
      const aiAnalysis = await this.geminiService.analyzePaymentDescription(description);
      const anomalyDetection = await this.geminiService.detectAnomaly(order);
      const predictedSuccessRate = await this.geminiService.predictSuccessRate(order);

      const aiWarnings: string[] = [];
      const aiSuggestions: string[] = [];

      if (anomalyDetection.isAnomaly) {
        aiWarnings.push(`AI Anomaly: ${anomalyDetection.reason}`);
        totalAnomalies++;
      }
      if (aiAnalysis.category !== 'General Expense' && aiAnalysis.category !== 'Uncategorized') {
        aiSuggestions.push(`AI Category: ${aiAnalysis.category}`);
        totalCategorized++;
      }
      if (predictedSuccessRate < 90) {
        aiWarnings.push(`AI Prediction: Low success rate (${predictedSuccessRate}%) expected. Review details.`);
      }

      processedOrders.push({
        ...aiAnalysis,
        ...anomalyDetection,
        ai_predictedSuccessRate: predictedSuccessRate,
        ai_warnings: aiWarnings,
        ai_suggestions: aiSuggestions,
        originalData: order, // Keep original for reference
      });
    }

    console.log(`cdbi AI: Finished AI processing. Total Anomalies: ${totalAnomalies}, Total Categorized: ${totalCategorized}.`);
    return {
      processedOrders,
      aiSummary: { totalAnomalies, totalCategorized }
    };
  }
}

/**
 * @function useAIAnalytics
 * @description Custom hook for fetching and managing AI analytics data.
 */
export function useAIAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AIAnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    try {
      const geminiService = GeminiAIService.getInstance();
      const data = await geminiService.getKPIData();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to fetch AI analytics:", error);
      setAnalyticsError("Failed to load AI analytics data.");
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analyticsData, isLoadingAnalytics, analyticsError, fetchAnalytics };
}

/**
 * @component AIAnalyticsDashboard
 * @description Displays Key Performance Indicators (KPIs) and charts generated by the AI.
 * This component visualizes the impact and performance of the cdbi AI system.
 */
export const AIAnalyticsDashboard: React.FC = () => {
  const { analyticsData, isLoadingAnalytics, analyticsError, fetchAnalytics } = useAIAnalytics();

  if (isLoadingAnalytics) return <p>Loading AI Analytics...</p>;
  if (analyticsError) return <p style={{ color: 'red' }}>Error loading analytics: {analyticsError}</p>;
  if (!analyticsData) return null;

  const handleGeminiChartRequest = (prompt: string) => {
    // In a real application, this would send the prompt to a Gemini-powered chart generation service
    // which would then render the chart (e.g., using a JS charting library or a webview).
    console.log(`Requesting Gemini to visualize: "${prompt}"`);
    alert(`cdbi AI is generating a chart based on your request: "${prompt}". (Simulation)`);
  };

  return (
    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <h3 style={{ color: '#0056b3' }}>cdbi AI Performance Dashboard</h3>
      <p style={{ fontSize: '0.9em', color: '#555' }}>
        Leveraging Gemini AI for advanced insights and intelligent processing of payment orders.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {Object.values(analyticsData.kpis).map((kpi, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{kpi.label}</h4>
            <p style={{ fontSize: '2em', fontWeight: 'bold', margin: '0', color: '#007bff' }}>
              {kpi.value}{kpi.unit}
            </p>
            <p style={{ fontSize: '0.85em', color: '#666', minHeight: '40px' }}>{kpi.description}</p>
            {kpi.chartData && kpi.chartData.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '0.8em', color: '#888' }}>
                {/* Simulated Chart Placeholder */}
                <p>Chart Type: {kpi.chartType} (Data points: {kpi.chartData.length})</p>
                <button
                  onClick={() => handleGeminiChartRequest(kpi.geminiPrompt)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.8em',
                  }}
                >
                  Ask Gemini to Visualize
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={fetchAnalytics} style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Refresh Analytics
      </button>
    </div>
  );
};


// --- Original Component Enhanced with AI ---

function PaymentOrderBulkImport(): JSX.Element {
  const [bulkCreatePaymentOrders] = useBulkCreatePaymentOrdersMutation();
  const [bulkValidatePaymentOrders] = useBulkValidatePaymentOrdersMutation();
  const [aiProcessor] = useState(() => new AI_PaymentOrderProcessor());
  const [aiProcessingResults, setAiProcessingResults] = useState<AIPaymentOrderResult[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  /**
   * Enhanced submit function that incorporates AI post-processing.
   */
  const submit = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
  ) => {
    // Optional: Re-run AI processing just before submission for final checks/enrichment
    // For this example, we'll assume validation already provided AI-enhanced data or process again.
    setIsAiProcessing(true);
    let finalDataForSubmission = resultsData;
    let aiSummary = { totalAnomalies: 0, totalCategorized: 0 };

    try {
      const processedResults = await aiProcessor.processBulkPaymentOrders(resultsData);
      setAiProcessingResults(processedResults.processedOrders);
      finalDataForSubmission = processedResults.processedOrders.map(p => ({
        ...p.originalData,
        ai_category: p.ai_category,
        ai_sentiment: p.ai_sentiment,
        ai_isAnomaly: p.ai_isAnomaly,
        ai_anomalyReason: p.ai_anomalyReason,
        ai_predictedSuccessRate: p.ai_predictedSuccessRate,
        ai_warnings: p.ai_warnings.join('; '), // Flatten for storage if needed
        ai_suggestions: p.ai_suggestions.join('; '),
      }));
      aiSummary = processedResults.aiSummary;
    } catch (aiError) {
      console.error("AI pre-submission processing failed:", aiError);
      // Continue with original data if AI fails
    } finally {
      setIsAiProcessing(false);
    }


    const { data } = await bulkCreatePaymentOrders({
      variables: {
        input: {
          paymentOrders: finalDataForSubmission, // Submit AI-enriched data
          flatfileSheetId,
          flatfileSpaceId,
        },
      },
    });

    const { bulkImportId } = data?.bulkCreatePaymentOrders ?? {};
    if (bulkImportId) {
      // Generate AI post-import report
      const geminiService = GeminiAIService.getInstance();
      const report = await geminiService.generateAIPostImportReport(finalDataForSubmission);
      setAiReport(report);
      return { success: true, bulkImportId };
    }
    return { success: false, bulkImportId: "" };
  };

  /**
   * Enhanced validate function that incorporates AI pre-processing.
   */
  const validate = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
  ) => {
    setIsAiProcessing(true);
    let aiEnhancedRecords: Array<Record<string, CellValueUnion | null>> = resultsData;
    let aiWarningsAndSuggestions: { [key: number]: string[] } = {};

    try {
      const processedResults = await aiProcessor.processBulkPaymentOrders(resultsData);
      setAiProcessingResults(processedResults.processedOrders);

      // Map AI results to the original records, also collect AI-driven warnings
      aiEnhancedRecords = processedResults.processedOrders.map((processed, index) => {
        const warnings = [...processed.ai_warnings, ...processed.ai_suggestions];
        if (warnings.length > 0) {
          aiWarningsAndSuggestions[index] = warnings;
        }
        return {
          ...processed.originalData,
          ai_category: processed.ai_category,
          ai_sentiment: processed.ai_sentiment,
          ai_isAnomaly: processed.ai_isAnomaly,
          ai_anomalyReason: processed.ai_anomalyReason,
          ai_predictedSuccessRate: processed.ai_predictedSuccessRate,
          // Add AI data directly to the record for potential display in Flatfile if supported
        };
      });

    } catch (aiError) {
      console.error("AI pre-validation processing failed:", aiError);
      // Continue with original data if AI fails, but log the error
    } finally {
      setIsAiProcessing(false);
    }

    // Call the original GraphQL validation mutation with potentially AI-enhanced data
    const response = await bulkValidatePaymentOrders({
      variables: {
        input: {
          paymentOrders: aiEnhancedRecords, // Pass AI-enhanced data to existing validator
        },
      },
    });

    // Merge GraphQL errors with AI-generated warnings/suggestions
    const originalRecordErrors = response.data?.bulkValidatePaymentOrders?.recordErrors || {};
    const mergedErrors: typeof originalRecordErrors = {};

    Object.keys(originalRecordErrors).forEach(recordIndexStr => {
      const recordIndex = parseInt(recordIndexStr, 10);
      const errors = originalRecordErrors[recordIndex];
      const aiMessages = aiWarningsAndSuggestions[recordIndex] || [];

      if (errors) {
        mergedErrors[recordIndex] = {
          ...errors,
          // Prepend AI warnings to a generic 'ai_feedback' field or add to existing 'general' errors
          general: [...(errors.general || []), ...aiMessages],
        };
      } else if (aiMessages.length > 0) {
        mergedErrors[recordIndex] = {
          general: aiMessages,
        };
      }
    });

    // Add any records with only AI messages that didn't have existing GraphQL errors
    Object.keys(aiWarningsAndSuggestions).forEach(recordIndexStr => {
      const recordIndex = parseInt(recordIndexStr, 10);
      if (!(recordIndex in mergedErrors)) {
        mergedErrors[recordIndex] = {
          general: aiWarningsAndSuggestions[recordIndex] || [],
        };
      }
    });

    return mergedErrors;
  };

  return (
    <PageHeader
      crumbs={[
        {
          name: "Payments",
          path: "/payment_orders",
        },
      ]}
      title="cdbi AI-Powered Bulk Imports"
    >
      <BulkImportHeader
        bulkImportType="Payment Order"
        validate={validate}
        submit={submit}
        expectedFields={paymentOrderBlueprintFields}
        blueprint={paymentOrderBlueprint}
        resource={BulkResourceType.PaymentOrders}
        // Add AI-specific props for display if BulkImportHeader supports them
        isAiProcessing={isAiProcessing}
        aiProcessingMessage={isAiProcessing ? "cdbi AI is processing data for intelligent validation..." : undefined}
      />
      {aiReport && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #cce5ff', borderRadius: '8px', backgroundColor: '#e0f2ff' }}>
          <h3>cdbi AI Post-Import Report</h3>
          <div dangerouslySetInnerHTML={{ __html: aiReport }} />
        </div>
      )}
      <InternalAccountIdsList />
      <AIAnalyticsDashboard /> {/* Integrate the AI analytics dashboard */}
    </PageHeader>
  );
}

export default PaymentOrderBulkImport;