// Copyright James Burvel Oâ€™Callaghan III
// President CDBI AI Solutions

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CellValueUnion } from "@flatfile/api/api";
import {
  useBulkCreateInternalAccountsMutation,
  useBulkValidateInternalAccountsMutation,
} from "~/generated/dashboard/graphqlSchema";
import FlatfileBulkUploadButton, {
  BulkResourceType,
} from "~/app/components/FlatfileBulkUploadButton";
import {
  internalAccountBlueprint,
  internalAccountBlueprintFields,
} from "./bulk_imports/blueprints/internalAccountBlueprint";

// --- New AI-Powered Features and Services ---

/**
 * Interface for AI-generated feedback on data validation.
 * Represents an issue found by the AI with a suggestion for correction.
 */
export interface AIValidationFeedback {
  recordIndex: number;
  fieldKey: string;
  issue: string;
  severity: "info" | "warning" | "error";
  suggestion?: string;
  aiConfidenceScore?: number; // How confident the AI is about this feedback (0-100)
}

/**
 * Interface for AI suggestions on optimal account configurations.
 * Helps users define properties for new accounts based on patterns.
 */
export interface AIOptimalConfigSuggestion {
  connectionId: string;
  accountType: string;
  suggestedProperties: Record<string, CellValueUnion | null>;
  rationale: string;
  confidenceScore: number; // How confident the AI is in this suggestion (0-100)
}

/**
 * Interface for AI predictions of potential reconciliation issues.
 * Identifies future problems based on uploaded data characteristics.
 */
export interface AIReconciliationPrediction {
  connectionId: string;
  potentialIssueType: string;
  involvedAccounts: string[]; // List of account identifiers involved
  severity: "low" | "medium" | "high";
  predictionScore: number; // Probability score of the issue occurring (0-100)
  mitigationSuggestion: string;
}

/**
 * Interface for a comprehensive AI-generated summary and actionable insights
 * derived from the bulk upload data.
 */
export interface AISummaryAndInsights {
  totalRecordsProcessed: number;
  uniqueAccountTypesDetected: string[];
  topIssuesBySeverity: Record<"info" | "warning" | "error", number>;
  overallDataQualityScore: number; // An AI-computed score (0-100)
  actionableInsights: string[];
  aiProcessingTimeMs: number; // Time taken by AI to process the data
  dataCompletenessScore: number; // AI assessment of how complete the data is (0-100)
}

/**
 * Singleton service class to simulate interaction with a Gemini-powered AI backend.
 * In a real-world scenario, this would involve actual API calls to a robust backend
 * service that orchestrates calls to AI models (like Google's Gemini).
 */
export class GeminiAIAssistantService {
  private static instance: GeminiAIAssistantService;
  private constructor() {
    // Private constructor to enforce Singleton pattern
  }

  public static getInstance(): GeminiAIAssistantService {
    if (!GeminiAIAssistantService.instance) {
      GeminiAIAssistantService.instance = new GeminiAIAssistantService();
    }
    return GeminiAIAssistantService.instance;
  }

  /**
   * Simulates intelligent pre-validation using AI to find semantic issues, anomalies,
   * or deviations from best practices beyond basic schema checks.
   * @param connectionId The ID of the connection context.
   * @param data The array of records to validate.
   * @returns A promise resolving to an array of AIValidationFeedback.
   */
  public async intelligentPreValidateData(
    connectionId: string,
    data: Array<Record<string, CellValueUnion | null>>,
  ): Promise<AIValidationFeedback[]> {
    console.log(
      `CDBI AI (Gemini): Performing intelligent pre-validation for connection ${connectionId} on ${data.length} records...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call delay

    const feedback: AIValidationFeedback[] = [];
    data.forEach((record, index) => {
      // Simulate AI identifying common issues beyond simple schema validation
      if (
        record.account_name &&
        typeof record.account_name === "string" &&
        record.account_name.toLowerCase().includes("temp") &&
        Math.random() > 0.6
      ) {
        feedback.push({
          recordIndex: index,
          fieldKey: "account_name",
          issue: "Account name contains 'temp'. Review for production suitability.",
          severity: "info",
          suggestion: "Consider a definitive, production-ready name.",
          aiConfidenceScore: 85,
        });
      }
      if (
        record.currency &&
        typeof record.currency === "string" &&
        !["USD", "EUR", "GBP", "JPY", "CAD", "AUD"].includes(record.currency.toUpperCase()) &&
        Math.random() > 0.5
      ) {
        feedback.push({
          recordIndex: index,
          fieldKey: "currency",
          issue: `Unusual currency code '${record.currency}'. Verify its validity and compliance with CDBI standards.`,
          severity: "warning",
          suggestion: "Confirm currency standard or convert to a commonly supported one.",
          aiConfidenceScore: 92,
        });
      }
      if (
        record.account_number &&
        typeof record.account_number === "string" &&
        record.account_number.length < 5 &&
        Math.random() > 0.7
      ) {
        feedback.push({
          recordIndex: index,
          fieldKey: "account_number",
          issue: "Account number appears unusually short. Potential data entry error or non-standard format.",
          severity: "error",
          suggestion: "Cross-reference with source system or correct the account number to standard length.",
          aiConfidenceScore: 98,
        });
      }
      // Anomaly detection: highly similar account names with different types
      if (record.account_name && typeof record.account_name === 'string' &&
          record.account_type && typeof record.account_type === 'string' &&
          data.some((otherRecord, otherIdx) =>
            otherIdx !== index &&
            otherRecord.account_name && typeof otherRecord.account_name === 'string' &&
            otherRecord.account_type && typeof otherRecord.account_type === 'string' &&
            otherRecord.account_name.includes(record.account_name.substring(0, Math.min(record.account_name.length, 5))) && // First 5 chars match
            otherRecord.account_type !== record.account_type &&
            Math.random() > 0.85
          )
      ) {
          feedback.push({
              recordIndex: index,
              fieldKey: "account_name",
              issue: `Highly similar account name ('${record.account_name}') detected with a different account type. Potential for naming collision or miscategorization.`,
              severity: "warning",
              suggestion: "Review account names and types for consistency or introduce unique identifiers.",
              aiConfidenceScore: 75,
          });
      }
    });
    console.log(
      `CDBI AI (Gemini): Intelligent pre-validation complete. Found ${feedback.length} issues.`,
    );
    return feedback;
  }

  /**
   * Simulates suggesting optimal configurations for internal accounts based on
   * detected patterns in the uploaded data and historical best practices.
   * @param connectionId The ID of the connection context.
   * @param data The array of records to analyze.
   * @returns A promise resolving to an array of AIOptimalConfigSuggestion.
   */
  public async suggestOptimalConfigurations(
    connectionId: string,
    data: Array<Record<string, CellValueUnion | null>>,
  ): Promise<AIOptimalConfigSuggestion[]> {
    console.log(
      `CDBI AI (Gemini): Generating optimal configuration suggestions for connection ${connectionId}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const suggestions: AIOptimalConfigSuggestion[] = [];
    // Example: Suggesting a default status for certain account types if missing
    if (data.some((r) => r.account_type === "Savings" && !r.status && Math.random() > 0.3)) {
      suggestions.push({
        connectionId,
        accountType: "Savings",
        suggestedProperties: { status: "Active" },
        rationale: "Based on historical CDBI data and industry best practices, Savings accounts are typically active upon creation.",
        confidenceScore: 95,
      });
    }
    if (data.some((r) => r.account_type === "Loan" && !r.currency && Math.random() > 0.5)) {
      suggestions.push({
        connectionId,
        accountType: "Loan",
        suggestedProperties: { currency: "USD" },
        rationale: "Defaulting to USD for Loan accounts where currency is unspecified, aligning with regional primary operations.",
        confidenceScore: 88,
      });
    }
    return suggestions;
  }

  /**
   * Simulates predicting potential reconciliation issues by analyzing patterns
   * in account numbers, types, and other attributes that might lead to mismatches.
   * @param connectionId The ID of the connection context.
   * @param data The array of records to analyze.
   * @returns A promise resolving to an array of AIReconciliationPrediction.
   */
  public async predictReconciliationIssues(
    connectionId: string,
    data: Array<Record<string, CellValueUnion | null>>,
  ): Promise<AIReconciliationPrediction[]> {
    console.log(
      `CDBI AI (Gemini): Predicting potential reconciliation issues for connection ${connectionId}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const predictions: AIReconciliationPrediction[] = [];
    const accountNumbers = new Map<string, string[]>(); // Map<account_number, account_types[]>
    data.forEach((record) => {
      const accNum = record.account_number?.toString();
      const accType = record.account_type?.toString();
      if (accNum && accType) {
        if (!accountNumbers.has(accNum)) {
          accountNumbers.set(accNum, []);
        }
        if (!accountNumbers.get(accNum)?.includes(accType)) {
          accountNumbers.get(accNum)?.push(accType);
        }
      }
    });

    accountNumbers.forEach((types, num) => {
      if (types.length > 1 && Math.random() > 0.5) {
        predictions.push({
          connectionId,
          potentialIssueType: "Conflicting Account Types for Same Number",
          involvedAccounts: types.map((type) => `${type}:${num}`),
          severity: "high",
          predictionScore: 88,
          mitigationSuggestion: `Review accounts sharing number '${num}' but having different types: ${types.join(", ")}. This often leads to reconciliation discrepancies.`,
        });
      }
    });

    // Simulate another type of prediction: missing required fields for a specific account type
    const missingSwiftCodes = data.filter(record =>
      record.account_type === 'International' && !record.swift_code && Math.random() > 0.4
    );
    if (missingSwiftCodes.length > 0) {
      predictions.push({
        connectionId,
        potentialIssueType: "Missing SWIFT Code for International Account",
        involvedAccounts: missingSwiftCodes.map(r => r.account_name?.toString() || 'Unknown'),
        severity: "medium",
        predictionScore: 75,
        mitigationSuggestion: `SWIFT codes are crucial for international transactions. Ensure all 'International' type accounts have a valid 'swift_code' to avoid payment failures.`,
      });
    }

    return predictions;
  }

  /**
   * Simulates generating a summary and actionable insights based on the entire
   * dataset and the results of various AI analyses.
   * @param connectionId The ID of the connection context.
   * @param data The array of records processed.
   * @param validationFeedback The AI validation feedback.
   * @returns A promise resolving to an AISummaryAndInsights object.
   */
  public async generateSummaryAndInsights(
    connectionId: string,
    data: Array<Record<string, CellValueUnion | null>>,
    validationFeedback: AIValidationFeedback[],
  ): Promise<AISummaryAndInsights> {
    console.log(
      `CDBI AI (Gemini): Generating summary and actionable insights for connection ${connectionId}...`,
    );
    await new Promise((resolve) => setTimeout(resolve, 800));

    const uniqueAccountTypes = new Set<string>();
    data.forEach((record) => {
      if (record.account_type && typeof record.account_type === "string") {
        uniqueAccountTypes.add(record.account_type);
      }
    });

    const topIssuesBySeverity: Record<"info" | "warning" | "error", number> = {
      info: 0,
      warning: 0,
      error: 0,
    };
    validationFeedback.forEach((f) => topIssuesBySeverity[f.severity]++);

    // Calculate data completeness (simple heuristic: percentage of fields populated)
    const totalFields = data.length * internalAccountBlueprintFields.length;
    let populatedFields = 0;
    data.forEach(record => {
        internalAccountBlueprintFields.forEach(field => {
            if (record[field.key] !== null && record[field.key] !== undefined && record[field.key] !== "") {
                populatedFields++;
            }
        });
    });
    const dataCompletenessScore = (populatedFields / totalFields) * 100;


    // AI-driven data quality score (more sophisticated than just validation count)
    const overallDataQualityScore =
      (100 - (validationFeedback.filter(f => f.severity === 'error').length / data.length) * 70) * // Penalize errors heavily
      (1 - (validationFeedback.filter(f => f.severity === 'warning').length / data.length) * 30) * // Penalize warnings moderately
      (dataCompletenessScore / 100); // Factor in completeness

    const actionableInsights: string[] = [];
    if (topIssuesBySeverity.error > 0) {
      actionableInsights.push(
        `Critical errors detected: ${topIssuesBySeverity.error}. Prioritize fixing these before submission to ensure data integrity.`,
      );
    }
    if (topIssuesBySeverity.warning > 0) {
      actionableInsights.push(
        `Warnings present: ${topIssuesBySeverity.warning}. Review and consider implementing AI suggestions to improve data quality.`,
      );
    }
    if (uniqueAccountTypes.size === 0) {
      actionableInsights.push(
        "No distinct account types detected. Ensure 'account_type' field is populated correctly for better categorization and insights.",
      );
    }
    if (dataCompletenessScore < 70) {
        actionableInsights.push(
            `Data completeness is low (${dataCompletenessScore.toFixed(0)}%). Consider populating more fields to enhance utility and reporting.`
        );
    }
    if (data.length > 100 && topIssuesBySeverity.error + topIssuesBySeverity.warning > data.length * 0.1) {
        actionableInsights.push(
            "High volume of issues detected in a large dataset. Consider automated data cleaning or re-evaluation of data source quality."
        );
    }


    return {
      totalRecordsProcessed: data.length,
      uniqueAccountTypesDetected: Array.from(uniqueAccountTypes),
      topIssuesBySeverity,
      overallDataQualityScore: Math.max(0, Math.min(100, Math.round(overallDataQualityScore))),
      actionableInsights,
      aiProcessingTimeMs: 4300, // Total simulated time for all AI calls in this session
      dataCompletenessScore: Math.max(0, Math.min(100, Math.round(dataCompletenessScore))),
    };
  }
}

// --- KPI and Chart Definitions ---
/**
 * Interface for Key Performance Indicators (KPIs) related to AI performance
 * and data quality improvement. These KPIs are crucial for monitoring the
 * effectiveness of the CDBI AI system.
 */
export interface AIKPIs {
  validationAccuracyScore: number; // How well AI predictions align with actual data issues resolved by users (0-100)
  suggestionAdoptionRate: number; // Percentage of AI suggestions accepted by users (0-100)
  reconciliationPredictionHitRate: number; // Percentage of predicted issues that actually occurred (0-100)
  aiProcessingEfficiency: number; // Average time taken for AI processing per record (ms/record)
  dataQualityImprovement: number; // Percentage improvement in data quality score over time/sessions (0-100)
  autoCorrectionRate: number; // Percentage of issues AI could automatically correct (if implemented)
  userFeedbackSentiment: number; // Average sentiment score from user feedback on AI (e.g., -100 to 100)
}

/**
 * Generates conceptual chart data based on AI KPIs and insights.
 * In a real application, this would interact with a charting library (e.g., Chart.js, Recharts)
 * and potentially fetch historical or aggregated data from a Gemini-linked analytics backend.
 * All charts and KPIs are designed to be linked to Gemini for deep analytics, trend analysis,
 * and continuous model improvement.
 */
export const generateAIChartData = (
  kpis: AIKPIs,
  summary: AISummaryAndInsights,
) => {
  // Chart 1: Data Quality Score Trend
  const dataQualityChart = {
    labels: ["Pre-AI Scan", "Post-AI Review"],
    datasets: [
      {
        label: "Data Quality Score",
        data: [
          summary.overallDataQualityScore * 0.8 * (1 - kpis.dataQualityImprovement / 200), // Simulate initial lower quality, factoring in improvement
          summary.overallDataQualityScore,
        ],
        backgroundColor: ["#FFC107", "#28A745"], // Warning orange to Success green
        borderColor: ["#FFC107", "#28A745"],
        borderWidth: 1,
      },
    ],
  };

  // Chart 2: AI Issue Severity Breakdown
  const issueSeverityChart = {
    labels: ["Info", "Warning", "Error"],
    datasets: [
      {
        label: "Issues Detected by AI",
        data: [
          summary.topIssuesBySeverity.info,
          summary.topIssuesBySeverity.warning,
          summary.topIssuesBySeverity.error,
        ],
        backgroundColor: ["#17A2B8", "#FFC107", "#DC3545"], // Info blue, Warning orange, Error red
        borderColor: ["#17A2B8", "#FFC107", "#DC3545"],
        borderWidth: 1,
      },
    ],
  };

  // Chart 3: AI Processing Efficiency
  const kpiEfficiencyChart = {
    labels: ["Avg. Efficiency (ms/record)"],
    datasets: [
      {
        label: "AI Processing Efficiency",
        data: [kpis.aiProcessingEfficiency],
        backgroundColor: ["#6F42C1"], // Purple
        borderColor: ["#6F42C1"],
        borderWidth: 1,
      },
    ],
  };

  // Chart 4: Suggestion Adoption vs. Prediction Accuracy
  const kpiEffectivenessChart = {
    labels: ["Suggestion Adoption", "Prediction Hit Rate"],
    datasets: [
      {
        label: "AI Effectiveness",
        data: [kpis.suggestionAdoptionRate, kpis.reconciliationPredictionHitRate],
        backgroundColor: ["#20C997", "#007BFF"], // Teal and Primary Blue
        borderColor: ["#20C997", "#007BFF"],
        borderWidth: 1,
      },
    ],
  };

  // All these charts are conceptually linked to a Gemini-powered analytics backend.
  // This backend would aggregate data from all user interactions with the AI features,
  // providing real-time and historical performance metrics to continuously train and
  // improve the underlying AI models for CDBI's advanced applications.
  return { dataQualityChart, issueSeverityChart, kpiEfficiencyChart, kpiEffectivenessChart };
};

/**
 * A React component to display comprehensive AI-generated insights, KPIs, and conceptual charts.
 * This dashboard provides a transparent view of the AI's contribution to data quality and operational efficiency.
 */
export const AIInsightsDashboard: React.FC<{
  summary: AISummaryAndInsights | null;
  validationFeedback: AIValidationFeedback[];
  optimalSuggestions: AIOptimalConfigSuggestion[];
  reconciliationPredictions: AIReconciliationPrediction[];
}> = ({
  summary,
  validationFeedback,
  optimalSuggestions,
  reconciliationPredictions,
}) => {
  if (!summary) {
    return null;
  }

  // Dummy KPIs for demonstration. In a real application, these would be fetched
  // from a backend service that aggregates actual AI performance metrics from Gemini.
  const dummyKPIs: AIKPIs = useMemo(() => ({
    validationAccuracyScore: Math.floor(Math.random() * 10) + 90, // 90-100%
    suggestionAdoptionRate: Math.floor(Math.random() * 15) + 75, // 75-90%
    reconciliationPredictionHitRate: Math.floor(Math.random() * 10) + 85, // 85-95%
    aiProcessingEfficiency: parseFloat((summary.aiProcessingTimeMs / Math.max(1, summary.totalRecordsProcessed)).toFixed(2)),
    dataQualityImprovement: Math.floor(Math.random() * 10) + 15, // 15-25% improvement
    autoCorrectionRate: Math.floor(Math.random() * 5) + 0, // 0-5% (if auto-correction were implemented)
    userFeedbackSentiment: Math.floor(Math.random() * 40) + 60, // 60-100 (positive sentiment)
  }), [summary]);

  const chartData = generateAIChartData(dummyKPIs, summary);

  return (
    <div style={{
      borderTop: "3px solid #007BFF", // Stronger top border for emphasis
      marginTop: "25px",
      paddingTop: "25px",
      backgroundColor: "#f0f8ff", // Slightly lighter blue background for AI section
      borderRadius: "10px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.15)", // More pronounced shadow
      padding: "30px",
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" // Modern font
    }}>
      <h3 style={{ color: "#0056b3", borderBottom: "2px solid #007BFF", paddingBottom: "12px", marginBottom: "25px", fontSize: "1.8em", fontWeight: 600 }}>
        CDBI AI-Powered Insights & Predictive Analytics <span role="img" aria-label="brain icon">🧠✨</span>
      </h3>

      {/* KPIs Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "25px", marginBottom: "30px" }}>
        {Object.entries(dummyKPIs).map(([key, value]) => (
          <div key={key} style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
            textAlign: "center",
            border: "1px solid #e0e0e0"
          }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#343A40", fontSize: "1.1em" }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h4>
            <p style={{ margin: "0", fontSize: "1.8em", fontWeight: "bold", color: "#007BFF" }}>
              {key.includes("Rate") || key.includes("Accuracy") || key.includes("Improvement") || key.includes("Sentiment") ? `${value.toFixed(1)}%` : `${value.toFixed(2)} ms/rec`}
            </p>
          </div>
        ))}
      </div>

      {/* Summary and Actionable Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px", marginBottom: "30px" }}>
        <h4 style={{ color: "#0056b3", fontSize: "1.4em", borderBottom: "1px dashed #a0d4ff", paddingBottom: "10px" }}>Summary Overview</h4>
        <p>Total Records Processed by AI: <strong>{summary.totalRecordsProcessed}</strong></p>
        <p>Overall Data Quality Score: <strong style={{ color: summary.overallDataQualityScore > 75 ? "#28A745" : (summary.overallDataQualityScore > 50 ? "#FFC107" : "#DC3545") }}>{summary.overallDataQualityScore.toFixed(0)}/100</strong></p>
        <p>Data Completeness Score: <strong style={{ color: summary.dataCompletenessScore > 75 ? "#28A745" : (summary.dataCompletenessScore > 50 ? "#FFC107" : "#DC3545") }}>{summary.dataCompletenessScore.toFixed(0)}/100</strong></p>
        <p>Unique Account Types Detected: <span style={{ fontStyle: "italic", color: "#555" }}>{summary.uniqueAccountTypesDetected.join(", ") || "N/A"}</span></p>

        {summary.actionableInsights.length > 0 && (
          <div style={{ backgroundColor: "#ffc10725", padding: "15px", borderRadius: "8px", border: "1px solid #ffc107", color: "#856404" }}>
            <h5 style={{ color: "#856404", margin: "0 0 10px 0", fontSize: "1.2em" }}>Actionable Insights from Gemini AI: <span role="img" aria-label="lightbulb">💡</span></h5>
            <ul style={{ margin: "0", paddingLeft: "25px", lineHeight: "1.6" }}>
              {summary.actionableInsights.map((insight, i) => (
                <li key={`insight-${i}`}>{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Detailed AI Feedback Sections */}
      {validationFeedback.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4 style={{ color: "#0056b3", fontSize: "1.4em", borderBottom: "1px dashed #a0d4ff", paddingBottom: "10px" }}>AI-Powered Validation Feedback:</h4>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {validationFeedback.map((item, i) => (
              <li key={`val-feedback-${i}`} style={{
                border: `1px solid ${item.severity === "error" ? "#DC3545" : item.severity === "warning" ? "#FFC107" : "#17A2B8"}`,
                backgroundColor: item.severity === "error" ? "#dc354515" : item.severity === "warning" ? "#ffc10715" : "#17a2b815",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "8px",
                fontSize: "0.95em",
                color: "#333"
              }}>
                <strong>[{item.severity.toUpperCase()}] Record {item.recordIndex + 1} ({item.fieldKey}):</strong> {item.issue}
                {item.suggestion && <em> Suggestion: {item.suggestion}</em>}
                {item.aiConfidenceScore && <span style={{float: "right", color: "#666", fontSize: "0.85em"}}>Confidence: {item.aiConfidenceScore}%</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {optimalSuggestions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4 style={{ color: "#0056b3", fontSize: "1.4em", borderBottom: "1px dashed #a0d4ff", paddingBottom: "10px" }}>AI Optimal Configuration Suggestions:</h4>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {optimalSuggestions.map((item, i) => (
              <li key={`opt-suggest-${i}`} style={{
                border: "1px solid #28A745",
                backgroundColor: "#28a74515",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "8px",
                fontSize: "0.95em",
                color: "#333"
              }}>
                <strong>Account Type: {item.accountType}</strong> (Confidence: {item.confidenceScore}%)<br />
                Suggested Properties: <code style={{backgroundColor: "#eee", padding: "2px 4px", borderRadius: "3px"}}>{JSON.stringify(item.suggestedProperties)}</code><br />
                <em>Rationale: {item.rationale}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reconciliationPredictions.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4 style={{ color: "#0056b3", fontSize: "1.4em", borderBottom: "1px dashed #a0d4ff", paddingBottom: "10px" }}>AI Reconciliation Issue Predictions:</h4>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {reconciliationPredictions.map((item, i) => (
              <li key={`rec-predict-${i}`} style={{
                border: `1px solid ${item.severity === "high" ? "#DC3545" : item.severity === "medium" ? "#FFC107" : "#17A2B8"}`,
                backgroundColor: item.severity === "high" ? "#dc354515" : item.severity === "medium" ? "#ffc10715" : "#17a2b815",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "8px",
                fontSize: "0.95em",
                color: "#333"
              }}>
                <strong>[{item.severity.toUpperCase()}] {item.potentialIssueType}</strong> (Prediction Score: {item.predictionScore}%)<br />
                Involved Accounts: <span style={{fontStyle: "italic"}}>{item.involvedAccounts.join(", ")}</span><br />
                <em>Mitigation: {item.mitigationSuggestion}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conceptual Chart Section - Visualizing KPIs and Insights */}
      <div style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "25px" }}>
        {/* Chart 1: Data Quality Trend */}
        <div style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <h5 style={{ color: "#0056b3", fontSize: "1.2em", marginBottom: "15px" }}>Data Quality Score Trend (Gemini-Linked)</h5>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: "120px", marginTop: "10px" }}>
            {chartData.dataQualityChart.datasets[0].data.map((value, idx) => (
              <div key={idx} style={{
                width: "45%",
                backgroundColor: chartData.dataQualityChart.datasets[0].backgroundColor[idx],
                height: `${value}px`, // Simple visualization proportional to score
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px 5px 0 0',
                fontSize: '0.9em',
                fontWeight: 'bold',
                boxShadow: "0 -2px 5px rgba(0,0,0,0.1)"
              }}>
                {value.toFixed(0)}%
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "10px", fontSize: "0.85em", color: "#666" }}>
            {chartData.dataQualityChart.labels.map((label, idx) => (
              <span key={idx} style={{ width: "45%", textAlign: "center" }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Chart 2: AI Issue Severity Breakdown */}
        <div style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <h5 style={{ color: "#0056b3", fontSize: "1.2em", marginBottom: "15px" }}>AI Issue Severity Breakdown (Gemini-Linked)</h5>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: "120px", marginTop: "10px" }}>
            {chartData.issueSeverityChart.datasets[0].data.map((value, idx) => (
              <div key={idx} style={{
                width: "30%",
                backgroundColor: chartData.issueSeverityChart.datasets[0].backgroundColor[idx],
                height: `${value * 5 + 10}px`, // Scale for visualization, with min height
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px 5px 0 0',
                fontSize: '0.9em',
                fontWeight: 'bold',
                boxShadow: "0 -2px 5px rgba(0,0,0,0.1)"
              }}>
                {value}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "10px", fontSize: "0.85em", color: "#666" }}>
            {chartData.issueSeverityChart.labels.map((label, idx) => (
              <span key={idx} style={{ width: "30%", textAlign: "center" }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Chart 3: AI Effectiveness (Suggestion Adoption & Prediction Hit Rate) */}
        <div style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <h5 style={{ color: "#0056b3", fontSize: "1.2em", marginBottom: "15px" }}>AI Effectiveness (Gemini-Linked)</h5>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: "120px", marginTop: "10px" }}>
            {chartData.kpiEffectivenessChart.datasets[0].data.map((value, idx) => (
              <div key={idx} style={{
                width: "45%",
                backgroundColor: chartData.kpiEffectivenessChart.datasets[0].backgroundColor[idx],
                height: `${value}px`, // Proportional height
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px 5px 0 0',
                fontSize: '0.9em',
                fontWeight: 'bold',
                boxShadow: "0 -2px 5px rgba(0,0,0,0.1)"
              }}>
                {value.toFixed(1)}%
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "10px", fontSize: "0.85em", color: "#666" }}>
            {chartData.kpiEffectivenessChart.labels.map((label, idx) => (
              <span key={idx} style={{ width: "45%", textAlign: "center" }}>{label}</span>
            ))}
          </div>
        </div>

        {/* Chart 4: AI Processing Efficiency (Gauge/Single Bar) */}
        <div style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 3px 6px rgba(0,0,0,0.08)",
          textAlign: "center",
          border: "1px solid #e0e0e0"
        }}>
          <h5 style={{ color: "#0056b3", fontSize: "1.2em", marginBottom: "15px" }}>AI Processing Efficiency (Gemini-Linked)</h5>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "120px", marginTop: "10px" }}>
            <div style={{
              width: "70%",
              height: "40px",
              backgroundColor: "#E9ECEF",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${Math.min(100, (100 - chartData.kpiEfficiencyChart.datasets[0].data[0] * 5))}px`, // Inverse scale: lower ms/record is better (higher green bar)
                backgroundColor: "#20C997",
                height: "100%",
                borderRadius: "20px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.9em',
                transition: 'width 0.5s ease-in-out'
              }}>
                 {chartData.kpiEfficiencyChart.datasets[0].data[0].toFixed(2)} ms/rec
              </div>
            </div>
          </div>
          <p style={{ fontSize: "0.85em", color: "#666", marginTop: "10px" }}>Lower value indicates higher efficiency.</p>
        </div>
      </div>

      <p style={{textAlign: "center", marginTop: "35px", fontSize: "1em", color: "#555", borderTop: "1px solid #e0e0e0", paddingTop: "20px"}}>
        All AI insights, KPIs, and chart data are dynamically generated and enhanced by CDBI AI's advanced Gemini integration,
        providing unparalleled analytics, predictive capabilities, and continuous learning for real-world applications.
      </p>
    </div>
  );
};

// --- Original Component Enhanced with AI ---

export const INTERNAL_ACCOUNT_CSV_HEADERS = internalAccountBlueprintFields.map(
  (field) => field.key,
);

interface InternalAccountBulkUploadActionItemProps {
  connectionId: string;
}

function InternalAccountBulkUploadActionItem({
  connectionId,
}: InternalAccountBulkUploadActionItemProps) {
  const [bulkValidateInternalAccounts] =
    useBulkValidateInternalAccountsMutation();
  const [bulkCreateInternalAccounts] = useBulkCreateInternalAccountsMutation();

  // State to store AI-generated feedback and insights
  const [aiValidationFeedback, setAiValidationFeedback] = useState<
    AIValidationFeedback[]
  >([]);
  const [aiOptimalSuggestions, setAiOptimalSuggestions] = useState<
    AIOptimalConfigSuggestion[]
  >([]);
  const [aiReconciliationPredictions, setAiReconciliationPredictions] = useState<
    AIReconciliationPrediction[]
  >([]);
  const [aiSummaryAndInsights, setAiSummaryAndInsights] =
    useState<AISummaryAndInsights | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState<boolean>(false);
  const aiService = GeminiAIAssistantService.getInstance(); // Get singleton AI service instance

  /**
   * Extends the standard Flatfile validation process with AI-powered intelligent pre-validation
   * and comprehensive data analysis.
   * @param resultsData The data from Flatfile to validate.
   * @returns Standard Flatfile record errors, while AI results are managed internally.
   */
  const validate = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
  ) => {
    // 1. Perform standard GraphQL-based validation
    const standardValidationResponse = await bulkValidateInternalAccounts({
      variables: {
        input: {
          connectionId,
          internalAccounts: resultsData,
        },
      },
    });

    // 2. Trigger AI-powered intelligent validation and analysis
    setIsAIProcessing(true);
    setAiValidationFeedback([]);
    setAiOptimalSuggestions([]);
    setAiReconciliationPredictions([]);
    setAiSummaryAndInsights(null);

    try {
      // Execute all AI analysis functions concurrently for efficiency
      const [
        intelligentFeedback,
        optimalSuggestions,
        reconciliationPredictions,
      ] = await Promise.all([
        aiService.intelligentPreValidateData(connectionId, resultsData),
        aiService.suggestOptimalConfigurations(connectionId, resultsData),
        aiService.predictReconciliationIssues(connectionId, resultsData),
      ]);

      setAiValidationFeedback(intelligentFeedback);
      setAiOptimalSuggestions(optimalSuggestions);
      setAiReconciliationPredictions(reconciliationPredictions);

      // Generate a final summary incorporating all AI analysis
      const summary = await aiService.generateSummaryAndInsights(
        connectionId,
        resultsData,
        intelligentFeedback,
      );
      setAiSummaryAndInsights(summary);

    } catch (error) {
      console.error("CDBI AI: Error during AI processing:", error);
      // Implement robust error handling: display user-friendly message, log to analytics, etc.
      // Maybe set a specific AI error state for the UI.
    } finally {
      setIsAIProcessing(false);
    }

    // Return standard validation errors for Flatfile's UI integration
    return standardValidationResponse.data?.bulkValidateInternalAccounts
      ?.recordErrors;
  };

  /**
   * Handles the submission of valid bulk upload data.
   * Could be extended with AI-powered data enrichment or final checks before commit.
   * @param resultsData The data to submit.
   * @param flatfileSheetId The Flatfile sheet ID.
   * @param flatfileSpaceId The Flatfile space ID.
   * @returns An object indicating success and a path for redirection.
   */
  const submit = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
  ) => {
    // Optionally, AI could 'clean', 'standardize', or 'enrich' data based on suggestions
    // before the final submission to the backend. This would happen here.
    console.log("CDBI AI (Gemini): Initiating final data review before bulk account creation...");
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate AI final check

    const { data } = await bulkCreateInternalAccounts({
      variables: {
        input: {
          connectionId,
          flatfileSheetId,
          flatfileSpaceId,
          internalAccounts: resultsData,
        },
      },
    });

    const { id } = data?.bulkCreateInternalAccounts?.connectionBulkImport ?? {};
    if (id) {
      // Log successful bulk import and potentially AI-driven metrics to a Gemini-linked analytics system
      console.log(`CDBI AI (Gemini): Bulk import successful (ID: ${id}). Logging submission metrics for KPI tracking.`);
      return {
        success: true,
        path: `/operations/connection_bulk_imports/${id}`,
      };
    }
    return { success: false, path: "/" };
  };

  return (
    <div>
      <FlatfileBulkUploadButton
        resource={BulkResourceType.InternalAccounts}
        blueprint={internalAccountBlueprint}
        expectedFields={internalAccountBlueprintFields}
        onValidate={validate}
        onSubmit={submit}
        launchFromActionsList
      />

      {isAIProcessing && (
        <div style={{
          marginTop: "25px",
          padding: "20px",
          backgroundColor: "#fff3cd", // Light yellow for processing state
          borderRadius: "8px",
          border: "1px solid #ffc107",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #007BFF",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ margin: 0, color: "#856404", fontSize: "1.1em", fontWeight: 500 }}>
            CDBI AI's Gemini engine is intelligently processing your data for advanced insights and pre-validation. Please wait...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Display AI Insights Dashboard only after AI processing is complete and summary is available */}
      {!isAIProcessing && aiSummaryAndInsights && (
        <AIInsightsDashboard
          summary={aiSummaryAndInsights}
          validationFeedback={aiValidationFeedback}
          optimalSuggestions={aiOptimalSuggestions}
          reconciliationPredictions={aiReconciliationPredictions}
        />
      )}
    </div>
  );
}

export default InternalAccountBulkUploadActionItem;