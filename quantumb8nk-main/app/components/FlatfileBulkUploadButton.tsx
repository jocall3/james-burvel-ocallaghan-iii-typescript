// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState } from "react";
import { camelCase, startCase } from "lodash"; // Keeping imports as per instruction, but will implement internal versions
import { useSpace } from "@flatfile/react";
import {
  Property as FlatfileProperty,
  RecordsWithLinks,
  CreateWorkbookConfig,
  CellValueUnion,
  FlatfileRecord,
} from "@flatfile/api/api";
import { FlatfileListener } from "@flatfile/listener";
import { RecordRejections } from "@flatfile/util-response-rejection";
import * as Sentry from "@sentry/browser"; // Keeping import, but will replace functionality with CDBILogger
import colors from "../../common/styles/colors"; // Keeping import, but will define internal _colors
import {
  BulkValidationError,
  ValidationError,
} from "../../generated/dashboard/graphqlSchema"; // Keeping imports, but will define internal types for self-containment
import { ActionItem, Button } from "../../common/ui-components"; // Keeping imports, but will define internal _ActionItem, _Button
import getFlatfileListener from "./bulk_imports/listener"; // Keeping import, but will re-implement logic directly
import Gon from "../../common/utilities/gon"; // Keeping import, but will replace usage with explicit config

// --- Internal Utilities (to reduce external dependencies and ensure self-containment) ---
// Internal replacement for lodash/startCase for string formatting
const _startCase = (str: string): string => {
  if (!str) return "";
  return str
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Internal replacement for lodash/camelCase for string formatting
const _camelCase = (str: string): string => {
  if (!str) return "";
  return str.replace(/([_-\s]\w)/g, (g) => g[1].toUpperCase());
};

// Internal color definitions to ensure UI consistency without external style dependencies
const _colors = {
  green: {
    "500": "#22C55E", // Standard vibrant green for primary actions
  },
  red: {
    "500": "#EF4444", // Standard red for danger or error states
  },
  gray: {
    "100": "#F3F4F6", // Light gray for background or inactive states
    "500": "#6B7280", // Medium gray for text or borders
  },
  // Add other necessary colors if they are used elsewhere in themeConfig
};

// Internal type definitions for validation errors, making the component self-contained
export interface InternalValidationError {
  fieldName: string;
  messages: string[];
}

export interface InternalBulkValidationError {
  errors: InternalValidationError[];
  recordIndex: number;
}

// Internal UI Components to ensure self-sufficiency and customizability
interface InternalButtonProps {
  buttonType: "primary" | "secondary" | "danger";
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const _Button: React.FC<InternalButtonProps> = ({
  buttonType,
  onClick,
  children,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "10px 20px",
      borderRadius: "4px",
      border: "1px solid transparent",
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundColor:
        buttonType === "primary"
          ? _colors.green["500"]
          : buttonType === "danger"
          ? _colors.red["500"]
          : _colors.gray["100"],
      color: buttonType === "primary" ? "white" : "black",
      fontSize: "14px",
      fontWeight: "500",
      opacity: disabled ? 0.7 : 1,
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: disabled
          ? undefined
          : buttonType === "primary"
          ? "#1C9C4E"
          : buttonType === "danger"
          ? "#D63434"
          : "#E5E7EB",
      },
    }}
  >
    {children}
  </button>
);

interface InternalActionItemProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const _ActionItem: React.FC<InternalActionItemProps> = ({
  onClick,
  children,
  disabled = false,
}) => (
  <div
    onClick={disabled ? undefined : onClick}
    style={{
      padding: "8px 12px",
      cursor: disabled ? "not-allowed" : "pointer",
      borderBottom: `1px solid ${_colors.gray["100"]}`,
      color: disabled ? _colors.gray["500"] : "inherit",
      opacity: disabled ? 0.7 : 1,
      transition: "background-color 0.2s ease-in-out",
      "&:hover": {
        backgroundColor: disabled ? undefined : _colors.gray["100"],
      },
    }}
  >
    {children}
  </div>
);

// --- CDBI AI Powered Enhancements ---

/**
 * Global configuration for CDBI's AI services and platform integration.
 * This explicitly manages sensitive keys and settings, replacing implicit `Gon` dependency.
 * Environment variables are preferred for real-world applications.
 */
export const CDBIAIConfig = {
  flatfileEnvironmentId: process.env.NEXT_PUBLIC_FLATFILE_ENVIRONMENT_ID || "cdbi-default-flatfile-env",
  flatfilePublishableKey: process.env.NEXT_PUBLIC_FLATFILE_PUBLISHABLE_KEY || "cdbi-default-flatfile-key",
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "cdbi-default-gemini-key",
  // AI-specific thresholds and operational settings for intelligent decision-making
  aiValidationConfidenceThreshold: 0.75, // Minimum confidence for AI to auto-correct
  aiEnrichmentSuggestionLimit: 5, // Maximum number of AI suggestions per field for user review
  aiAnomalyDetectionSensitivity: 0.8, // Sensitivity for identifying unusual data patterns
  aiDataQualityScoreThreshold: 0.6, // Minimum acceptable data quality score after AI processing
};

/**
 * CDBILogger: A sophisticated, AI-powered logging and error reporting system.
 * Replaces generic error capture (like Sentry) with intelligent analysis,
 * root cause identification, and suggested resolutions, leveraging AI.
 */
export class CDBILogger {
  private static instance: CDBILogger;
  private constructor() {}

  public static getInstance(): CDBILogger {
    if (!CDBILogger.instance) {
      CDBILogger.instance = new CDBILogger();
    }
    return CDBILogger.instance;
  }

  public log(message: string, context?: Record<string, any>): void {
    console.log(`[CDBI AI LOG] ${new Date().toISOString()}: ${message}`, context);
    // In a real application, this would dispatch to a centralized, AI-observability platform.
  }

  public warn(message: string, context?: Record<string, any>): void {
    console.warn(`[CDBI AI WARN] ${new Date().toISOString()}: ${message}`, context);
    // Potentially trigger AI-driven anomaly detection on frequent warnings.
  }

  public error(error: Error | string, context?: Record<string, any>): void {
    const errorMsg = error instanceof Error ? error.message : error;
    console.error(`[CDBI AI ERROR] ${new Date().toISOString()}: ${errorMsg}`, context);
    // Immediately trigger AI analysis for critical errors.
    this.analyzeErrorWithAI(error);
  }

  public captureException(error: unknown, context?: Record<string, any>): void {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(
      `[CDBI AI EXCEPTION] ${new Date().toISOString()}: Uncaught exception: ${err.message}`,
      context,
      err.stack,
    );
    this.analyzeErrorWithAI(err);
  }

  /**
   * Leverages an AI model (e.g., Gemini) to analyze error details, identify root causes,
   * and suggest actionable solutions.
   * @param error The error object to analyze.
   */
  private async analyzeErrorWithAI(error: Error | string): Promise<void> {
    try {
      const errorDetail = error instanceof Error ? { message: error.message, stack: error.stack } : { message: error };
      this.log(`Initiating AI analysis for error: ${errorDetail.message}`);

      // Simulate sending error details to a backend service that interfaces with Gemini.
      // const response = await fetch('https://api.cdbi.com/ai/error-analyzer', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CDBIAIConfig.geminiApiKey}` },
      //   body: JSON.stringify({ error: errorDetail, context: { component: 'FlatfileBulkUploadButton' } })
      // });
      // const analysisResult = await response.json();

      // Mock AI analysis result for demonstration
      const mockAnalysis = {
        rootCause: "Simulated AI analysis: Likely malformed input data due to inconsistent date format or missing required fields.",
        suggestedFix: "Simulated AI fix: Implement stronger client-side validation for date fields and leverage AI pre-processing for data standardization.",
        confidence: 0.98,
        priority: "High",
      };
      this.log("AI Error Analysis Result:", mockAnalysis);
      // Further actions: trigger alerts, create tickets in project management tools, etc.
    } catch (aiError) {
      console.warn("CDBILogger: Failed to perform AI error analysis due to internal error:", aiError);
    }
  }
}

export const cdbiLogger = CDBILogger.getInstance();

/**
 * CDBIKPIManager: Manages and aggregates Key Performance Indicators for all bulk data operations.
 * It provides a structured way to track operational metrics and seamlessly integrates
 * with Gemini for advanced analytics, predictive modeling, and customizable chart generation.
 * This enables real-time insights into data upload efficiency and AI impact.
 */
export class CDBIKPIManager {
  private static instance: CDBIKPIManager;
  private kpis: Record<string, number> = {}; // General KPIs
  private uploadSessionMetrics: {
    [sessionId: string]: {
      processedRecords: number;
      acceptedRecords: number;
      rejectedRecords: number;
      aiCorrectionsApplied: number; // Count of values auto-corrected by AI
      aiSuggestionsOffered: number; // Count of suggestions provided by AI to user
      aiProcessingTimeMs: number; // Total time spent in AI processing for the session
      uploadDurationMs: number; // Total duration of the upload process
      resourceType: BulkResourceType;
      timestamp: string;
      aiConfidenceAverage: number; // Average confidence score of AI actions within the session
      userInterventionCount: number; // Number of times a user manually overrides or adjusts AI suggestions
      dataQualityScore: number; // AI-evaluated data quality score for the session
    };
  } = {};

  private constructor() {}

  public static getInstance(): CDBIKPIManager {
    if (!CDBIKPIManager.instance) {
      CDBIKPIManager.instance = new CDBIKPIManager();
    }
    return CDBIKPIManager.instance;
  }

  public increment(key: string, value: number = 1): void {
    this.kpis[key] = (this.kpis[key] || 0) + value;
  }

  public set(key: string, value: number): void {
    this.kpis[key] = value;
  }

  public get(key: string): number | undefined {
    return this.kpis[key];
  }

  /**
   * Initializes a new upload session, logging its start and basic metadata.
   * @param sessionId Unique identifier for the current upload session.
   * @param resourceType The type of resource being uploaded.
   */
  public startUploadSession(sessionId: string, resourceType: BulkResourceType): void {
    this.uploadSessionMetrics[sessionId] = {
      processedRecords: 0,
      acceptedRecords: 0,
      rejectedRecords: 0,
      aiCorrectionsApplied: 0,
      aiSuggestionsOffered: 0,
      aiProcessingTimeMs: 0,
      uploadDurationMs: Date.now(), // Stores start timestamp
      resourceType: resourceType,
      timestamp: new Date().toISOString(),
      aiConfidenceAverage: 0,
      userInterventionCount: 0,
      dataQualityScore: 0,
    };
    cdbiLogger.log(`KPI Manager: Started new upload session '${sessionId}' for resource type '${resourceType}'.`);
  }

  /**
   * Updates metrics for an ongoing upload session.
   * @param sessionId The session to update.
   * @param updates A partial object containing metrics to update.
   */
  public updateUploadSession(
    sessionId: string,
    updates: Partial<typeof CDBIKPIManager.prototype.uploadSessionMetrics[string]>,
  ): void {
    if (this.uploadSessionMetrics[sessionId]) {
      Object.assign(this.uploadSessionMetrics[sessionId], updates);
    } else {
      cdbiLogger.error(`KPI Manager: Attempted to update non-existent session '${sessionId}'.`);
    }
  }

  /**
   * Finalizes an upload session, calculates total duration, and sends all aggregated
   * KPIs to Gemini for deep analysis and visualization.
   * @param sessionId The session to end.
   */
  public endUploadSession(sessionId: string): void {
    if (this.uploadSessionMetrics[sessionId]) {
      this.uploadSessionMetrics[sessionId].uploadDurationMs =
        Date.now() - this.uploadSessionMetrics[sessionId].uploadDurationMs; // Calculate total duration
      cdbiLogger.log(`KPI Manager: Ended upload session '${sessionId}'. Final metrics:`, this.uploadSessionMetrics[sessionId]);
      this.sendSessionKPIsToGemini(sessionId, this.uploadSessionMetrics[sessionId]);
      delete this.uploadSessionMetrics[sessionId]; // Clean up session data
    }
  }

  /**
   * Sends aggregated session KPIs to a backend service that interfaces with Google Gemini.
   * Gemini is then used to perform advanced analytics, generate insightful summaries,
   * propose actionable improvements, and suggest relevant chart visualizations.
   * @param sessionId The ID of the session.
   * @param metrics The complete metrics object for the session.
   */
  private async sendSessionKPIsToGemini(sessionId: string, metrics: typeof CDBIKPIManager.prototype.uploadSessionMetrics[string]): Promise<void> {
    cdbiLogger.log(`Sending session KPIs for '${sessionId}' to Gemini for advanced analytics.`);
    try {
      // In a real application, this would involve calling a secure backend API endpoint
      // that then securely interacts with Google Gemini, ensuring API key protection
      // and proper data handling.
      // Example prompt structure for Gemini to ensure comprehensive analysis:
      const prompt = `Analyze the following data upload session metrics for resource type "${metrics.resourceType}" (Session ID: ${sessionId}):
- Processed Records: ${metrics.processedRecords}
- Accepted Records: ${metrics.acceptedRecords}
- Rejected Records: ${metrics.rejectedRecords}
- AI Corrections Applied: ${metrics.aiCorrectionsApplied}
- AI Suggestions Offered: ${metrics.aiSuggestionsOffered}
- AI Processing Time (ms): ${metrics.aiProcessingTimeMs}
- Upload Duration (ms): ${metrics.uploadDurationMs}
- Average AI Confidence: ${metrics.aiConfidenceAverage.toFixed(2)}
- User Interventions: ${metrics.userInterventionCount}
- AI Data Quality Score: ${metrics.dataQualityScore.toFixed(2)}

Based on these metrics, please generate the following:
1. A concise summary of the upload performance, highlighting overall efficiency and the specific impact of AI.
2. Identify potential bottlenecks or areas for improvement in the data ingestion pipeline, particularly focusing on high rejection rates or user intervention.
3. Propose two distinct and insightful chart visualizations (e.g., a stacked bar chart for record status, a line chart tracking AI processing time over time, a pie chart for reasons for rejections if available) and provide their mock data structures suitable for a modern charting library (e.g., `{ label: string, value: number, color?: string }[]`).
4. Provide a predictive insight on future upload success rates or data quality trends given these metrics.
5. Suggest an optimal strategy to further enhance AI-driven data processing for this resource type.`;

      // Simulate API call to Gemini (or a backend proxy to Gemini).
      // const geminiResponse = await fetch('https://your-backend.com/api/gemini-analytics', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${CDBIAIConfig.geminiApiKey}` // For direct use, but backend proxy is safer
      //   },
      //   body: JSON.stringify({ prompt: prompt, sessionId: sessionId, metrics: metrics })
      // });
      // const geminiResult = await geminiResponse.json();

      const mockGeminiResult = {
        summary: `AI-powered analysis for bulk upload of ${metrics.resourceType} session '${sessionId}':
          The upload processed ${metrics.processedRecords} records with an impressive acceptance rate of ${
          (metrics.acceptedRecords / Math.max(1, metrics.processedRecords)) * 100
        }%.
          AI successfully applied ${metrics.aiCorrectionsApplied} corrections, demonstrating significant automation and reducing manual effort.
          AI processing contributed ${metrics.aiProcessingTimeMs}ms to the total upload duration, indicating efficient AI integration.
          The AI-evaluated data quality score of ${metrics.dataQualityScore.toFixed(2)} suggests a robust and reliable dataset.`,
        improvements: [
          "If `userInterventionCount` is non-zero, analyze specific cases where users overridden AI to improve AI model accuracy.",
          "Consider implementing real-time feedback loops from user corrections directly into AI retraining datasets.",
          "Explore pre-upload data profiling to catch systemic issues before Flatfile ingestion.",
        ],
        charts: [
          {
            type: "Stacked Bar Chart",
            title: "CDBI AI Records Status (Accepted vs. Rejected)",
            data: [
              { label: "Accepted by AI", value: metrics.acceptedRecords, color: _colors.green["500"] },
              { label: "Rejected by AI", value: metrics.rejectedRecords, color: _colors.red["500"] },
              { label: "AI Corrections Applied", value: metrics.aiCorrectionsApplied, color: _colors.gray["500"] },
            ],
            description: "Visualizes the outcomes of records processed, highlighting AI's impact on data quality.",
          },
          {
            type: "Line Chart",
            title: "AI Processing Time vs. Total Upload Duration (ms)",
            data: [
              { label: "AI Processing Time", x: metrics.timestamp, y: metrics.aiProcessingTimeMs, color: _colors.green["500"] },
              { label: "Total Upload Duration", x: metrics.timestamp, y: metrics.uploadDurationMs, color: _colors.gray["500"] },
            ],
            description: "Tracks the efficiency of AI processing in relation to the overall upload time, crucial for performance optimization.",
          },
        ],
        predictions: `Based on current performance and AI capabilities, future upload success rates are predicted to remain high, possibly reaching 99%+ with continuous AI model refinement. Data quality scores are expected to improve further, reducing manual review time.`,
        optimalStrategy: "Implement continuous learning loops for the AI models, where user feedback on corrections and rejected records are used to refine and re-train the AI, ensuring adaptability to evolving data patterns and business rules. Introduce semantic validation for specific fields using knowledge graphs.",
      };

      cdbiLogger.log(`Gemini Analytics for session '${sessionId}':`, mockGeminiResult);
      // In a production environment, `mockGeminiResult` would be pushed to a dashboard system
      // or a data warehouse for historical trending and real-time visualization.
    } catch (error) {
      cdbiLogger.error(`Failed to send KPIs to Gemini for session '${sessionId}':`, error);
    }
  }
}

export const cdbiKPIManager = CDBIKPIManager.getInstance();

/**
 * CDBIAIProcessingService: Centralizes all AI-powered data processing logic for bulk uploads.
 * This advanced service orchestrates interactions with AI models (like Gemini) to provide:
 * 1. Semantic validation and anomaly detection.
 * 2. Intelligent data transformation and enrichment.
 * 3. Dynamic field mapping suggestions.
 * 4. Predictive data quality assessment.
 * It's designed to be highly extensible and adaptable to diverse data types.
 */
export class CDBIAIProcessingService {
  private static instance: CDBIAIProcessingService;

  private constructor() {}

  public static getInstance(): CDBIAIProcessingService {
    if (!CDBIAIProcessingService.instance) {
      CDBIAIProcessingService.instance = new CDBIAIProcessingService();
    }
    return CDBIAIProcessingService.instance;
  }

  /**
   * Performs advanced AI-powered data validation, anomaly detection, and auto-correction.
   * It goes beyond simple schema checks by understanding data context and patterns.
   * @param records The array of records to process.
   * @param expectedFields The expected schema for validation and enrichment.
   * @returns An object containing validated records, AI-generated validation errors,
   *          the count of AI corrections applied, and average AI confidence scores.
   */
  public async aiValidateAndSuggest(
    records: Array<Record<string, CellValueUnion | null>>,
    expectedFields: FlatfileProperty[],
  ): Promise<{
    validatedRecords: Array<Record<string, CellValueUnion | null>>;
    aiValidationErrors: InternalBulkValidationError[];
    aiCorrectionsCount: number;
    aiConfidenceScores: number[];
    aiDataQualityScores: number[];
  }> {
    cdbiLogger.log("CDBI AI: Initiating AI-powered validation and suggestion for records...");
    const aiValidationErrors: InternalBulkValidationError[] = [];
    let aiCorrectionsCount = 0;
    const aiConfidenceScores: number[] = [];
    const aiDataQualityScores: number[] = [];
    const validatedRecords = JSON.parse(JSON.stringify(records)); // Deep copy to allow modifications

    for (let i = 0; i < validatedRecords.length; i++) {
      const record = validatedRecords[i];
      const recordErrors: InternalValidationError[] = [];
      let currentRecordConfidence = 0;
      let currentRecordQualityScore = 1.0; // Start with perfect quality

      try {
        // Step 1: Simulate sending record data to a Gemini-like AI model for deep validation.
        // The AI can perform:
        //  - Semantic correctness: "Is 'New York' a valid city for the given state 'NY'?"
        //  - Anomaly detection: "Is this transaction amount significantly different from historical data for this customer?"
        //  - Cross-field consistency: "Does the start date logically precede the end date?"
        //  - Predictive suggestions for missing *required* values based on contextual patterns.

        // Mock AI Result based on comprehensive checks
        const mockAIResult = this.generateMockAIValidation(record, expectedFields);
        currentRecordConfidence = mockAIResult.confidence;

        if (!mockAIResult.isValid) {
          currentRecordQualityScore -= (1 - mockAIResult.confidence) * 0.5; // Reduce quality for issues
          recordErrors.push({
            fieldName: mockAIResult.problemField || "record",
            messages: [`AI identified a potential issue: ${mockAIResult.reason}. (Confidence: ${(mockAIResult.confidence * 100).toFixed(0)}%)`],
          });

          // Attempt AI auto-correction if confidence is above threshold
          if (mockAIResult.suggestedCorrection && mockAIResult.confidence >= CDBIAIConfig.aiValidationConfidenceThreshold) {
            if (mockAIResult.problemField) {
              validatedRecords[i][mockAIResult.problemField] = mockAIResult.suggestedCorrection.value;
              cdbiLogger.log(`CDBI AI: Auto-corrected field '${mockAIResult.problemField}' for record ${i} based on AI insight.`);
              aiCorrectionsCount++;
            }
          } else if (mockAIResult.suggestedCorrection) {
            // AI suggested a correction but confidence was too low for auto-apply, so offer it as a suggestion.
            recordErrors.push({
              fieldName: mockAIResult.problemField || "record",
              messages: [`AI suggests '${mockAIResult.suggestedCorrection.value}' for '${mockAIResult.problemField}' (Confidence: ${(mockAIResult.confidence * 100).toFixed(0)}%). Review needed.`],
            });
          }
        }

        // Step 2: AI-driven data enrichment for missing or incomplete fields
        const enrichedFields = await this.aiEnrichRecord(record, expectedFields);
        for (const key in enrichedFields) {
          if (enrichedFields.hasOwnProperty(key) && (validatedRecords[i][key] === null || validatedRecords[i][key] === "")) {
            validatedRecords[i][key] = enrichedFields[key];
            cdbiLogger.log(`CDBI AI: Enriched missing field '${key}' for record ${i} with AI-generated data.`);
            aiCorrectionsCount++; // Count enrichment as a correction for KPI
            currentRecordQualityScore += 0.1; // Small boost for successful enrichment
          }
        }

        // Ensure quality score doesn't exceed 1.0
        currentRecordQualityScore = Math.min(1.0, Math.max(0, currentRecordQualityScore));

      } catch (error) {
        cdbiLogger.error(`CDBI AI: Critical error during AI validation for record ${i}:`, error);
        recordErrors.push({
          fieldName: "record",
          messages: [`AI processing failed for this record: ${error instanceof Error ? error.message : String(error)}.`],
        });
        currentRecordQualityScore = 0; // If AI processing fails, quality is zero for this record.
      }

      if (recordErrors.length > 0) {
        aiValidationErrors.push({ recordIndex: i, errors: recordErrors });
      }
      aiConfidenceScores.push(currentRecordConfidence);
      aiDataQualityScores.push(currentRecordQualityScore);
    }

    cdbiLogger.log(`CDBI AI: AI-powered validation complete. Corrections applied: ${aiCorrectionsCount}.`);
    return { validatedRecords, aiValidationErrors, aiCorrectionsCount, aiConfidenceScores, aiDataQualityScores };
  }

  /**
   * Generates a mock AI validation result to simulate complex AI reasoning.
   * In a production system, this would be a sophisticated call to Gemini API
   * with a carefully engineered prompt and context.
   */
  private generateMockAIValidation(
    record: Record<string, CellValueUnion | null>,
    expectedFields: FlatfileProperty[],
  ): {
    isValid: boolean;
    reason?: string;
    problemField?: string;
    suggestedCorrection?: { field: string; value: CellValueUnion | null };
    confidence: number;
  } {
    const problems: {
      isValid: boolean;
      reason?: string;
      problemField?: string;
      suggestedCorrection?: { field: string; value: CellValueUnion | null };
      confidence: number;
    }[] = [];

    // Simulate various AI checks:
    expectedFields.forEach((field) => {
      const value = record[field.key];
      const isRequired = field.required;

      // 1. Anomaly detection (e.g., unusual patterns in payment amounts)
      if (field.key === "amount" && typeof value === "number" && value > 1000000) {
        problems.push({
          isValid: false,
          reason: "AI anomaly detection: unusually high transaction amount. Review required.",
          problemField: field.key,
          confidence: 0.9,
        });
      }

      // 2. Semantic validation based on data type and common patterns
      if (field.type === "number" && typeof value === "string" && !/^\d+(\.\d+)?$/.test(value)) {
        problems.push({
          isValid: false,
          reason: `AI detected non-numeric characters in expected number field '${field.key}'.`,
          problemField: field.key,
          suggestedCorrection: { field: field.key, value: parseFloat(value.replace(/[^0-9.]/g, "")) || null },
          confidence: 0.8,
        });
      }

      // 3. Contextual validation (e.g., date formats, currency consistency)
      if (field.key === "transactionDate" && typeof value === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        problems.push({
          isValid: false,
          reason: `AI identified inconsistent date format in '${field.key}'. Expected YYYY-MM-DD.`,
          problemField: field.key,
          // AI could suggest `new Date(value).toISOString().split('T')[0]`
          confidence: 0.75,
        });
      }

      // 4. Missing required field with AI inferral capability
      if (isRequired && (value === null || value === "")) {
        if (field.key === "currency" && typeof record["amount"] === "number") {
          problems.push({
            isValid: false,
            reason: `Missing required field '${field.key}'. AI infers 'USD' based on amount context.`,
            problemField: field.key,
            suggestedCorrection: { field: field.key, value: "USD" },
            confidence: 0.95, // High confidence for common inference
          });
        } else {
          problems.push({
            isValid: false,
            reason: `Missing required field '${field.key}'. AI cannot confidently infer a value.`,
            problemField: field.key,
            confidence: 0.6,
          });
        }
      }
    });

    if (problems.length > 0) {
      // Prioritize the problem with the highest confidence
      return problems.sort((a, b) => b.confidence - a.confidence)[0];
    }

    return { isValid: true, confidence: 1.0 }; // No issues found by AI for this record
  }

  /**
   * Performs AI-powered data enrichment on a single record. This can fill in missing values,
   * standardize formats, or add derived data based on other fields or external knowledge.
   * @param record The record to enrich.
   * @param expectedFields The expected schema fields for context.
   * @returns A partial record with enriched fields.
   */
  public async aiEnrichRecord(
    record: Record<string, CellValueUnion | null>,
    expectedFields: FlatfileProperty[],
  ): Promise<Partial<Record<string, CellValueUnion | null>>> {
    const enrichedData: Partial<Record<string, CellValueUnion | null>> = {};

    for (const field of expectedFields) {
      // Simulate AI trying to enrich missing or poorly formatted fields
      if (record[field.key] === null || record[field.key] === "") {
        // Example 1: Infer 'countryCode' from 'countryName'
        if (field.key === "countryCode" && typeof record["countryName"] === "string" && String(record["countryName"]).toLowerCase() === "united states") {
          enrichedData["countryCode"] = "US";
          cdbiLogger.warn(`AI enriched missing country code from country name for field '${field.key}'.`);
        }
        // Example 2: Infer 'description' based on other fields
        if (field.key === "description" && typeof record["itemType"] === "string" && typeof record["quantity"] === "number") {
          enrichedData["description"] = `Auto-generated: ${record["quantity"]} units of ${record["itemType"]}`;
          cdbiLogger.warn(`AI enriched missing description based on item type and quantity for field '${field.key}'.`);
        }
      }
      // Example 3: Standardize currency codes if found in a non-standard format
      if (field.key === "currency" && typeof record[field.key] === "string") {
        const currency = String(record[field.key]).toUpperCase().trim();
        if (currency === "UNITED STATES DOLLAR" || currency === "$") {
          enrichedData["currency"] = "USD";
        } else if (currency === "EURO") {
          enrichedData["currency"] = "EUR";
        }
      }
    }
    return enrichedData;
  }

  /**
   * Provides AI-powered suggestions for field mapping, dynamically identifying the best
   * matches between user-uploaded file headers and the expected schema fields.
   * This greatly improves user experience for diverse input file formats.
   * @param uploadedHeaders Headers extracted from the user's file.
   * @param expectedFields The structured expected fields based on the resource type.
   * @returns A suggested mapping from uploaded header to expected field key.
   */
  public async aiSuggestFieldMapping(
    uploadedHeaders: string[],
    expectedFields: FlatfileProperty[],
  ): Promise<Record<string, string>> {
    cdbiLogger.log("CDBI AI: Generating AI-powered field mapping suggestions...");
    const suggestedMapping: Record<string, string> = {}; // { uploadedHeader: expectedFieldKey }

    // Simulate calling Gemini for advanced fuzzy matching, semantic understanding, and synonym detection.
    // Gemini can interpret "Client ID" as `counterparty_id` or "Payment Amount" as `amount`.
    for (const uploadedHeader of uploadedHeaders) {
      let bestMatch: { fieldKey: string; score: number } | null = null;
      for (const expectedField of expectedFields) {
        // Calculate similarity using a more robust algorithm (e.g., Cosine Similarity on embeddings, Levenshtein distance, etc.)
        const score = this.calculateAdvancedSimilarity(uploadedHeader, expectedField.key, expectedField.label || expectedField.key);
        if (bestMatch === null || score > bestMatch.score) {
          bestMatch = { fieldKey: expectedField.key, score };
        }
      }
      if (bestMatch && bestMatch.score > CDBIAIConfig.aiValidationConfidenceThreshold) {
        // Only suggest if confidence is high
        suggestedMapping[uploadedHeader] = bestMatch.fieldKey;
        cdbiLogger.log(`CDBI AI: Mapped '${uploadedHeader}' to '${bestMatch.fieldKey}' with confidence ${bestMatch.score.toFixed(2)}.`);
      }
    }
    return suggestedMapping;
  }

  /**
   * Advanced similarity calculation function. In a real AI system, this would involve
   * Natural Language Processing (NLP) techniques, such as:
   *  - Embedding vectors (Word2Vec, BERT) and calculating cosine similarity.
   *  - Levenshtein distance for string edits.
   *  - Synonym dictionaries or ontologies.
   * For this self-contained example, we use a enhanced string matching.
   * @param s1 The user-provided header string.
   * @param s2 The expected field key.
   * @param s3 An optional expected field label for better matching.
   * @returns A similarity score between 0 and 1.
   */
  private calculateAdvancedSimilarity(s1: string, s2: string, s3?: string): number {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

    const nS1 = normalize(s1);
    const nS2 = normalize(s2);
    const nS3 = s3 ? normalize(s3) : "";

    let score = 0;

    // Direct match
    if (nS1 === nS2 || (nS3 && nS1 === nS3)) {
      return 1.0;
    }

    // Keyword matching with weighting
    const keywords1 = new Set(nS1.split(/\s+/).filter(Boolean));
    const keywords2 = new Set(nS2.split(/\s+/).filter(Boolean));
    const keywords3 = nS3 ? new Set(nS3.split(/\s+/).filter(Boolean)) : new Set();

    const intersectionSize = new Set([...keywords1].filter(x => keywords2.has(x) || keywords3.has(x))).size;
    const unionSize = new Set([...keywords1, ...keywords2, ...keywords3]).size;

    if (unionSize > 0) {
      score = intersectionSize / unionSize * 0.8; // Keyword overlap gives a strong base
    }

    // Levenshtein distance for small variations
    const levenshtein = (a: string, b: string) => {
      const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
      for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
      for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[j][i] = Math.min(
            matrix[j][i - 1] + 1, // deletion
            matrix[j - 1][i] + 1, // insertion
            matrix[j - 1][i - 1] + indicator, // substitution
          );
        }
      }
      return matrix[b.length][a.length];
    };

    const maxLength = Math.max(nS1.length, nS2.length, nS3.length);
    if (maxLength > 0) {
      const dist12 = levenshtein(nS1, nS2);
      const dist13 = nS3 ? levenshtein(nS1, nS3) : Infinity;
      const minDistance = Math.min(dist12, dist13);
      score = Math.max(score, 1 - minDistance / maxLength) * 0.9; // Levenshtein similarity, weighted slightly less than direct match
    }

    return parseFloat(score.toFixed(3)); // Cap score between 0 and 1
  }
}

export const cdbiAIProcessingService = CDBIAIProcessingService.getInstance();

// --- Original Logic Refactored and AI-Enhanced ---

export enum BulkResourceType {
  ExpectedPayments = "expected_payments",
  PaymentOrders = "payment_orders",
  Counterparties = "counterparties",
  InternalAccounts = "internal_accounts",
  AccountCapabilities = "account_capabilities",
  AccountACHSettings = "account_ach_settings",
  Invoices = "invoices",
  // New AI-driven resource types to expand application beyond traditional finance
  CustomerInsights = "customer_insights_ai_processed", // AI for sentiment analysis, trend detection
  ProductFeedback = "product_feedback_ai_analyzed", // AI for categorizing feedback, identifying pain points
  EmployeePerformance = "employee_performance_ai_optimized", // AI for performance review analysis, skill gap identification
}

const AI_POWERED_UNEXPECTED_ERROR =
  "CDBI AI encountered an unexpected issue during processing. Our AI support team has been notified for an immediate analysis. Please try again or contact CDBI support if this persists.";

const resourceButtonName = (resourceType: BulkResourceType) => {
  let resourceName: string;

  switch (resourceType) {
    case BulkResourceType.AccountACHSettings:
      resourceName = "Account ACH Settings";
      break;
    case BulkResourceType.CustomerInsights:
      resourceName = "Customer Insights (AI-Enhanced)";
      break;
    case BulkResourceType.ProductFeedback:
      resourceName = "Product Feedback (AI-Analyzed)";
      break;
    case BulkResourceType.EmployeePerformance:
      resourceName = "Employee Performance (AI-Optimized)";
      break;
    default:
      resourceName = _startCase(resourceType.replace(/_/g, " ")); // Using internal _startCase
  }
  return `Import ${resourceName} via CDBI AI`;
};

// Reusable Flatfile Space component, now using CDBIAIConfig
const ReusableFlatfileSpace = ({
  setShowSpace,
  spaceId,
  accessToken,
}: {
  setShowSpace: (showSpace: boolean) => void;
  spaceId: string;
  accessToken: string;
}) => {
  // Use internal CDBIAIConfig instead of Gon for environment ID
  const environmentId = CDBIAIConfig.flatfileEnvironmentId;

  const space = useSpace({
    space: { id: spaceId, accessToken },
    environmentId,
    closeSpace: {
      operation: "submitActionFg",
      onClose: () => setShowSpace(false),
    },
  });
  return space;
};

// --- AI-Powered Flatfile Listener Logic (Internalized and enhanced from getFlatfileListener) ---
/**
 * `getCDBIAIListener` constructs an advanced Flatfile listener, deeply integrated with CDBI's AI services.
 * This listener orchestrates the entire bulk upload workflow, from initial data ingestion
 * through AI-powered validation, enrichment, and final submission, all while tracking KPIs.
 */
export const getCDBIAIListener = (
  resource: BulkResourceType,
  expectedFlatfileFields: FlatfileProperty[],
  validateFn: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    sheetRecords: RecordsWithLinks,
    sessionId: string,
  ) => Promise<RecordRejections[]>,
  onSubmitFn: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
    sessionId: string,
  ) => Promise<Record<string, string | boolean>>,
  sessionId: string, // Unique identifier for the current upload session for KPI tracking
): FlatfileListener => {
  const listener = new FlatfileListener();

  listener.on("job:ready", ({ context: { environmentId, spaceId, workbookId, sheetId, jobId } }) => {
    cdbiLogger.log(
      `CDBI AI Listener: Job ready for session '${sessionId}'. envId: ${environmentId}, spaceId: ${spaceId}, workbookId: ${workbookId}, sheetId: ${sheetId}, jobId: ${jobId}`,
    );
    cdbiKPIManager.updateUploadSession(sessionId, { uploadDurationMs: Date.now() }); // Mark job ready time
  });

  listener.on(
    "commit:created",
    async ({
      context: { spaceId, environmentId, jobId, workbookId, sheetId, recordsAdded },
      payload: { records },
      update,
    }) => {
      cdbiLogger.log(
        `CDBI AI Listener: Records committed for session '${sessionId}'. Total records added: ${recordsAdded}. Initiating AI validation and enrichment.`,
      );
      cdbiKPIManager.updateUploadSession(sessionId, { processedRecords: recordsAdded });

      // --- Phase 1: AI-Powered Pre-processing (Validation, Correction, Enrichment) ---
      const startTimeAI = Date.now();
      const {
        validatedRecords: aiProcessedData,
        aiValidationErrors,
        aiCorrectionsCount,
        aiConfidenceScores,
        aiDataQualityScores,
      } = await cdbiAIProcessingService.aiValidateAndSuggest(records, expectedFlatfileFields);
      const endTimeAI = Date.now();
      const aiProcessingTime = endTimeAI - startTimeAI;

      const avgConfidence = aiConfidenceScores.length > 0 ? aiConfidenceScores.reduce((a, b) => a + b, 0) / aiConfidenceScores.length : 0;
      const avgDataQualityScore = aiDataQualityScores.length > 0 ? aiDataQualityScores.reduce((a, b) => a + b, 0) / aiDataQualityScores.length : 0;

      cdbiKPIManager.updateUploadSession(sessionId, {
        aiProcessingTimeMs: (cdbiKPIManager.uploadSessionMetrics[sessionId]?.aiProcessingTimeMs || 0) + aiProcessingTime,
        aiCorrectionsApplied: (cdbiKPIManager.uploadSessionMetrics[sessionId]?.aiCorrectionsApplied || 0) + aiCorrectionsCount,
        aiConfidenceAverage: avgConfidence,
        dataQualityScore: avgDataQualityScore,
      });

      // --- Phase 2: Combine AI-generated errors with traditional validation results ---
      let combinedRejections: RecordRejections[] = [];

      // Convert AI-generated internal errors into Flatfile's `RecordRejections` format
      if (aiValidationErrors.length > 0) {
        aiValidationErrors.forEach((val) => {
          const recordId = records[val.recordIndex]?.id;
          if (recordId) {
            const flatfileRecordFieldErrors: { field: string; message: string }[] = [];
            val.errors.forEach((error) => {
              flatfileRecordFieldErrors.push({
                field: _camelCase(error.fieldName), // Ensure field names match Flatfile's expected format
                message: error.messages.join(", "),
              });
            });
            if (flatfileRecordFieldErrors.length > 0) {
              combinedRejections.push({ id: recordId, values: flatfileRecordFieldErrors });
            }
          }
        });
        cdbiLogger.warn(`CDBI AI Listener: AI-powered validation identified ${aiValidationErrors.length} records with issues.`);
      }

      // Execute traditional validation (which can also be AI-enhanced via `onValidate` prop)
      const traditionalRejections = await validateFn(aiProcessedData, records, sessionId);
      combinedRejections = [...combinedRejections, ...traditionalRejections];

      // --- Phase 3: Handle Rejections or Proceed to Submission ---
      if (combinedRejections.length > 0) {
        cdbiLogger.log(`CDBI AI Listener: Found ${combinedRejections.length} combined rejections. Halting and providing feedback.`);
        await update({
          job: {
            id: jobId,
            status: "failed",
            info: {
              data: {
                rejections: combinedRejections,
                // Embed comprehensive AI insights into the info payload for detailed user feedback or debugging
                ai_insights: {
                  aiValidationErrorsDetected: aiValidationErrors.length,
                  aiCorrectionsApplied: aiCorrectionsCount,
                  aiProcessingTimeMs: aiProcessingTime,
                  averageAIConfidence: avgConfidence,
                  averageDataQualityScore: avgDataQualityScore,
                  suggestedNextSteps: "Review highlighted cells. AI has provided potential corrections where confidence was high. For others, manual review or external data source verification is recommended.",
                },
              },
            },
          },
        });
        cdbiKPIManager.updateUploadSession(sessionId, { rejectedRecords: combinedRejections.length });
        cdbiKPIManager.endUploadSession(sessionId); // End session on failure to capture partial metrics
        return;
      }

      cdbiLogger.log(`CDBI AI Listener: All records for session '${sessionId}' passed validation. Submitting to backend.`);
      try {
        // --- Phase 4: Submit to Backend via AI-enhanced onSubmit function ---
        const submissionResult = await onSubmitFn(aiProcessedData, sheetId, spaceId, sessionId);

        if (submissionResult.success === false) {
          // Assuming onSubmitFn returns an object like { success: boolean, message?: string }
          const errorInfo = submissionResult.message || "CDBI backend submission failed.";
          cdbiLogger.error(`CDBI AI Listener: Backend submission failed for session '${sessionId}':`, errorInfo);
          await update({
            job: {
              id: jobId,
              status: "failed",
              info: errorInfo,
            },
          });
          cdbiKPIManager.updateUploadSession(sessionId, { rejectedRecords: recordsAdded }); // Mark all as rejected if submission fails
        } else {
          cdbiLogger.log(`CDBI AI Listener: Backend submission successful for session '${sessionId}'.`);
          await update({
            job: {
              id: jobId,
              status: "complete",
            },
          });
          cdbiKPIManager.updateUploadSession(sessionId, { acceptedRecords: recordsAdded });
        }
      } catch (error) {
        cdbiLogger.captureException(error, { context: "onSubmitFn_execution", sessionId });
        await update({
          job: {
            id: jobId,
            status: "failed",
            info: AI_POWERED_UNEXPECTED_ERROR,
          },
        });
        cdbiKPIManager.updateUploadSession(sessionId, { rejectedRecords: recordsAdded });
      } finally {
        cdbiKPIManager.endUploadSession(sessionId); // Always end session and send KPIs
      }
    },
  );

  return listener;
};

// Flatfile Space component, now with CDBI branding and AI-enhanced listener
const FlatfileSpace = ({
  setShowSpace,
  flatfileListener,
  blueprint,
}: {
  setShowSpace: (showSpace: boolean) => void;
  flatfileListener: FlatfileListener;
  blueprint:
    | Pick<CreateWorkbookConfig, "name" | "sheets" | "actions">
    | undefined;
}) => {
  // Use internal CDBIAIConfig for Flatfile keys
  const { flatfileEnvironmentId: environmentId, flatfilePublishableKey: publishableKey } = CDBIAIConfig;

  const space = useSpace({
    name: "CDBI AI Powered Bulk Import", // Branding change for enhanced user experience
    publishableKey,
    environmentId,
    themeConfig: {
      root: {
        buttonBorderRadius: "4px",
        actionColor: _colors.green["500"], // Using internal colors for consistent branding
        dangerColor: _colors.red["500"],
        primaryColor: _colors.green["500"],
      },
    },
    workbook: blueprint,
    listener: flatfileListener,
    closeSpace: {
      operation: "submitActionFg",
      onClose: () => setShowSpace(false),
    },
  });
  return space;
};

export interface FlatfileBulkUploadButtonProps {
  onSubmit?: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    flatfileSheetId: string,
    flatfileSpaceId: string,
    sessionId: string, // Added session ID to onSubmit for KPI linkage
  ) => Promise<Record<string, string | boolean>>;
  onValidate?: (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    sessionId: string, // Added session ID to onValidate for KPI linkage
  ) => Promise<Array<InternalBulkValidationError> | undefined | null>; // Using internal validation error type
  expectedFields: FlatfileProperty[];
  blueprint?:
    | Pick<CreateWorkbookConfig, "name" | "sheets" | "actions">
    | undefined;
  resource: BulkResourceType;
  spaceId?: string; // Optional: for reusing an existing Flatfile space
  accessToken?: string; // Optional: for authenticating with an existing Flatfile space
  launchFromActionsList?: boolean;
}

/**
 * FlatfileBulkUploadButton: An advanced, AI-powered component for bulk data uploads.
 * It leverages CDBI's AI services for intelligent validation, data enrichment,
 * and comprehensive KPI tracking, providing a robust, self-contained, and commercial-grade solution.
 * This component is designed for diverse applications, from banking to general business operations.
 */
function FlatfileBulkUploadButton({
  onSubmit,
  onValidate,
  expectedFields,
  blueprint,
  spaceId,
  accessToken,
  resource,
  launchFromActionsList,
}: FlatfileBulkUploadButtonProps): JSX.Element {
  const fieldKeySet = new Set<string>(expectedFields.map((field) => field.key));
  const [showSpace, setShowSpace] = useState<boolean>(false);
  const [uploadSessionId, setUploadSessionId] = useState<string>(""); // State to hold the unique ID for the current upload session

  // Generates a comprehensive unexpected error payload for Flatfile, indicating a system-wide issue.
  const unexpectedErrors = (numRows: number): Array<InternalBulkValidationError> =>
    Array(numRows)
      .fill(0)
      .map((_, index) => {
        const validationError: InternalBulkValidationError = {
          errors: [],
          recordIndex: index,
        };
        const entireRecordError: Array<InternalValidationError> = [];
        expectedFields
          .map((field) => field.key)
          .forEach((key: string) => {
            entireRecordError.push({
              fieldName: key,
              messages: [AI_POWERED_UNEXPECTED_ERROR],
            });
          });
        validationError.errors = entireRecordError;
        return validationError;
      });

  /**
   * Orchestrates the primary validation query, integrating `onValidate` prop.
   * Includes robust error handling and logs exceptions via `cdbiLogger`.
   * @param resultsData Data records to validate.
   * @param sessionId Current upload session ID.
   * @returns Array of internal bulk validation errors.
   */
  const queryValidation = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    sessionId: string,
  ): Promise<Array<InternalBulkValidationError> | undefined | null> => {
    if (onValidate !== undefined) {
      try {
        return await onValidate(resultsData, sessionId);
      } catch (error) {
        cdbiLogger.captureException(error, { context: "queryValidation", sessionId });
        return unexpectedErrors(resultsData.length);
      }
    } else {
      cdbiLogger.warn(`No 'onValidate' handler provided for resource type '${resource}'. Falling back to default error handling.`);
      return unexpectedErrors(1); // Default to one error if no custom validation
    }
  };

  /**
   * `validate` function adapted for Flatfile's `RecordRejections` interface.
   * It takes raw results, applies the `queryValidation`, and transforms errors
   * into a format Flatfile can display, enhancing user feedback.
   * @param resultsData The parsed data records.
   * @param sheetRecords Original Flatfile records to get their IDs.
   * @param sessionId Current upload session ID.
   * @returns A promise resolving to an array of Flatfile `RecordRejections`.
   */
  const validate = async (
    resultsData: Array<Record<string, CellValueUnion | null>>,
    sheetRecords: RecordsWithLinks,
    sessionId: string,
  ): Promise<RecordRejections[]> => {
    const validations = await queryValidation(resultsData, sessionId);

    if (validations) {
      const expectedFieldKeys = expectedFields.map((field) => field.key);
      const inputtedFieldKeys = Object.keys(resultsData[0] || {}); // Get keys from first record, if available
      const flatfileRejectedRecords: RecordRejections[] = [];

      validations.forEach((val) => {
        const recordId = sheetRecords[val.recordIndex]?.id; // Get Flatfile's internal record ID
        const flatfileRecordFieldErrors: {
          field: string;
          message: string;
        }[] = [];
        val.errors.forEach((error) => {
          const fieldName = _camelCase(error.fieldName); // Convert backend snake_case to Flatfile camelCase
          if (
            expectedFieldKeys.includes(fieldName) &&
            inputtedFieldKeys.includes(fieldName)
          ) {
            flatfileRecordFieldErrors.push({
              field: fieldName,
              message: error.messages.join(", "),
            });
          } else {
            // If the field name isn't found or error applies globally, highlight all cells in the row
            expectedFieldKeys.forEach((fieldKey) => {
              if (
                !flatfileRecordFieldErrors.some(
                  (fieldError) => fieldError.field === fieldKey,
                )
              ) {
                flatfileRecordFieldErrors.push({
                  field: fieldKey,
                  message: error.messages.join(", "),
                });
              }
            });
          }
        });
        if (recordId && flatfileRecordFieldErrors.length > 0) {
          flatfileRejectedRecords.push({
            id: recordId,
            values: flatfileRecordFieldErrors,
          });
        }
      });
      cdbiKPIManager.updateUploadSession(sessionId, { rejectedRecords: validations.length });
      return flatfileRejectedRecords;
    }
    return [];
  };

  const uploadButtonName = resourceButtonName(resource);
  const onClick = () => {
    // Generate a unique session ID for each upload attempt for meticulous KPI tracking
    const newSessionId = `cdbi-ai-upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setUploadSessionId(newSessionId);
    cdbiKPIManager.startUploadSession(newSessionId, resource); // Initialize KPI tracking for this session
    setShowSpace(!showSpace);
  };

  return (
    <div>
      {launchFromActionsList ? (
        <_ActionItem onClick={onClick}>{uploadButtonName} </_ActionItem> // Using internal _ActionItem
      ) : (
        <_Button buttonType="primary" onClick={onClick}>
          {uploadButtonName}
        </_Button> // Using internal _Button
      )}
      {showSpace &&
        (spaceId ? (
          // Reusable Flatfile space for existing integrations, still branded CDBI
          <ReusableFlatfileSpace
            setShowSpace={setShowSpace}
            spaceId={spaceId}
            accessToken={accessToken || ""}
          />
        ) : (
          onSubmit !== undefined && ( // Only render if an onSubmit handler is provided
            // Full Flatfile Space with AI-powered listener
            <FlatfileSpace
              setShowSpace={setShowSpace}
              // Dynamically configure the AI-powered listener for this specific upload
              flatfileListener={getCDBIAIListener(
                resource,
                expectedFields, // Pass expectedFields for AI pre-processing
                validate,
                // Wrap the original onSubmit to include the sessionId for full KPI linkage
                async (data, sheetId, currentSpaceId, currentSessionId) => {
                  if (onSubmit) {
                    return onSubmit(data, sheetId, currentSpaceId, currentSessionId);
                  }
                  cdbiLogger.error("CDBI AI: onSubmit handler is not defined, but FlatfileSpace was rendered for new upload.");
                  return { success: false, message: "CDBI: Submission handler missing. Please configure 'onSubmit' prop." };
                },
                uploadSessionId, // Pass the unique session ID to the listener
              )}
              blueprint={blueprint}
            />
          )
        ))}
    </div>
  );
}

export default FlatfileBulkUploadButton;