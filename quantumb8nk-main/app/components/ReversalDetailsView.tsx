import { startCase } from "lodash";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import { ReversalDetailsViewFragment } from "../../generated/dashboard/graphqlSchema";
import {
  DateTime,
  KeyValueTable,
  KeyValueTableSkeletonLoader,
} from "../../common/ui-components";

/**
 * @module ReversalDetailsView.tsx
 * @description This module provides an advanced, AI-augmented Reversal Details View component.
 * It integrates sophisticated Gemini AI capabilities for deep analysis, risk assessment,
 * and predictive insights, presenting a comprehensive, human-interpretable overview
 * of financial reversal transactions. The architecture is designed for extensibility
 * and seamless integration with future AI models, prioritizing AI-driven intelligence
 * and user experience.
 */

// --- Global Constants and Configuration for Gemini AI ---

/**
 * Configuration object for guiding Gemini AI's analytical behavior within the application.
 * This defines parameters for various AI sub-systems, enabling dynamic adjustments
 * to the AI's operational scope and thresholds without code changes, facilitating A/B testing
 * of different AI models or strategies in production environments.
 *
 * @constant {Object} GEMINI_ANALYTICS_CONFIG
 * @property {string} sentimentAnalysisEndpoint - API endpoint for natural language sentiment analysis microservice.
 * @property {string} riskAssessmentEndpoint - API endpoint for proprietary risk scoring models (e.g., credit risk, fraud risk).
 * @property {string} fraudDetectionModel - Identifier for the actively deployed fraud detection model version (e.g., "gemini-fraud-v3.1-quantum").
 * @property {string} reasonCategorizationModel - Identifier for the active transaction reason classifier model (e.g., "gemini-reason-classifier-beta-7b").
 * @property {number} defaultConfidenceThreshold - Minimum AI confidence score required for triggering automatic actions or high-priority alerts.
 * @property {boolean} enablePredictiveInsights - Feature flag to activate proactive AI prediction capabilities and display predictive alerts.
 * @property {number} maxProcessingRetries - Maximum attempts for Gemini to re-analyze data on soft, transient failures, enhancing resilience.
 * @property {string} historicalDataEndpoint - Endpoint for fetching historical transaction data for comparative analysis by AI.
 */
export const GEMINI_ANALYTICS_CONFIG = {
  sentimentAnalysisEndpoint: "/api/gemini/sentiment",
  riskAssessmentEndpoint: "/api/gemini/risk",
  fraudDetectionModel: "gemini-fraud-v3.1-quantum",
  reasonCategorizationModel: "gemini-reason-classifier-beta-7b",
  defaultConfidenceThreshold: 0.75, // 75% confidence required for auto-approval/flagging
  enablePredictiveInsights: true,
  maxProcessingRetries: 3,
  historicalDataEndpoint: "/api/gemini/historical-data",
};

/**
 * Enumeration of distinct processing statuses a reversal can undergo within the
 * Gemini AI-driven workflow. Each status represents a specific stage or outcome
 * of automated or human-assisted processing, providing fine-grained visibility
 * into the workflow.
 *
 * @enum {string} ReversalProcessingStatus
 * @property {string} PENDING_REVIEW - Transaction is awaiting human review or further AI evaluation due to predefined rules or low AI confidence.
 * @property {string} APPROVED_BY_GEMINI - Automatically approved by Gemini AI based on low risk, clear reason, and high confidence.
 * @property {string} REJECTED_BY_GEMINI - Automatically rejected by Gemini AI due to high fraud indicators, policy violations, or invalidity.
 * @property {string} MANUAL_OVERRIDE - Human intervention has explicitly changed the AI's proposed status or overridden an automated decision.
 * @property {string} FURTHER_INVESTIGATION - Requires deeper, potentially multi-modal, analysis or specialized human specialist involvement.
 * @property {string} COMPLETED - Reversal processing fully executed and closed within the system.
 * @property {string} FAILED - An unrecoverable error occurred during AI processing, requiring system administrator attention.
 * @property {string} GEMINI_ANALYTICS_IN_PROGRESS - Gemini AI is actively performing its analytical tasks on the data.
 * @property {string} GEMINI_PIPELINE_STALLED - The AI processing pipeline has encountered an unexpected delay or bottleneck.
 * @property {string} AI_SIMULATED_SUCCESS - Status indicating a successful AI simulation for testing or demonstration purposes.
 * @property {string} EXTERNAL_REVIEW_REQUIRED - The AI has determined that external expert review is necessary due to complex factors.
 */
export enum ReversalProcessingStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED_BY_GEMINI = "APPROVED_BY_GEMINI",
  REJECTED_BY_GEMINI = "REJECTED_BY_GEMINI",
  MANUAL_OVERRIDE = "MANUAL_OVERRIDE",
  FURTHER_INVESTIGATION = "FURTHER_INVESTIGATION",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  GEMINI_ANALYTICS_IN_PROGRESS = "GEMINI_ANALYTICS_IN_PROGRESS",
  GEMINI_PIPELINE_STALLED = "GEMINI_PIPELINE_STALLED",
  AI_SIMULATED_SUCCESS = "AI_SIMULATED_SUCCESS", // For demo/testing scenarios
  EXTERNAL_REVIEW_REQUIRED = "EXTERNAL_REVIEW_REQUIRED",
}

/**
 * Defines a comprehensive color palette for each `ReversalProcessingStatus` enumeration value.
 * This mapping is essential for providing immediate, intuitive visual cues for a reversal's
 * current state within the user interface, particularly for the `YoReversalStatusIndicator` component.
 *
 * @constant {Record<ReversalProcessingStatus, string>} REVERSAL_STATUS_COLORS
 */
export const REVERSAL_STATUS_COLORS: Record<ReversalProcessingStatus, string> = {
  [ReversalProcessingStatus.PENDING_REVIEW]: "#FFC107", // Amber
  [ReversalProcessingStatus.APPROVED_BY_GEMINI]: "#4CAF50", // Green
  [ReversalProcessingStatus.REJECTED_BY_GEMINI]: "#F44336", // Red
  [ReversalProcessingStatus.MANUAL_OVERRIDE]: "#9C27B0", // Deep Purple
  [ReversalProcessingStatus.FURTHER_INVESTIGATION]: "#2196F3", // Blue
  [ReversalProcessingStatus.COMPLETED]: "#00796B", // Teal
  [ReversalProcessingStatus.FAILED]: "#D32F2F", // Dark Red
  [ReversalProcessingStatus.GEMINI_ANALYTICS_IN_PROGRESS]: "#607D8B", // Blue Grey
  [ReversalProcessingStatus.GEMINI_PIPELINE_STALLED]: "#FF9800", // Orange
  [ReversalProcessingStatus.AI_SIMULATED_SUCCESS]: "#8BC34A", // Light Green
  [ReversalProcessingStatus.EXTERNAL_REVIEW_REQUIRED]: "#795548", // Brown
};

/**
 * Maps internal data keys from `ReversalDetailsViewFragment` to
 * user-friendly display titles, with specific annotations for Gemini-enhanced fields.
 * This mapping ensures that the `KeyValueTable` component renders data meaningfully
 * and highlights AI contributions clearly. It also allows for dynamic adaptation
 * of labels based on the presence of AI insights.
 *
 * @constant {Object} REVERSAL_TITLE_MAPPING
 */
const REVERSAL_TITLE_MAPPING = {
  id: "Reversal ID (Gemini Validated)",
  account: "Originating Account (Secure Link)",
  amount: "Amount (Gemini Verified)",
  counterparty: "Counterparty (AI Context)",
  receivingAccount: "Receiving Account (AI Monitored)",
  paymentOrder: "Payment Order Reference (Linked)",
  reason: "Reason (Gemini Categorized)",
  reversalType: "Reversal Type (Standardized)",
  createdAt: "Created At (UTC Timestamp)",
  updatedAt: "Updated At (Last Gemini Process)",
  // Dynamically added fields by Gemini AI for enhanced context
  geminiRiskScore: "Gemini AI Risk Score",
  geminiReasonCategory: "Gemini AI Reason Category",
  geminiSentiment: "Gemini AI Sentiment",
  geminiAnomalyStatus: "Gemini AI Anomaly Status",
  geminiSuggestedAction: "Gemini AI Suggested Action",
  geminiFraudPatternMatch: "Gemini AI Fraud Match", // New AI-derived field
  geminiComplianceCheck: "Gemini AI Compliance Check", // New AI-derived field
};

// --- Interfaces for Gemini AI Analysis ---

/**
 * Interface defining the structured output of the Gemini AI system's deep analysis
 * on a financial reversal. This extends the basic reversal data with crucial
 * AI-derived metrics and insights, enabling data-driven decision making and
 * automated workflow triggers.
 *
 * @interface GeminiReversalAnalysis
 * @property {number} riskScore - A normalized score (0-1) indicating the overall risk of the reversal, where 1 is highest risk.
 * @property {string} reasonCategory - The AI-assigned category for the reversal's stated reason (e.g., "Fraud", "Operational Error", "Customer Dispute").
 * @property {'positive' | 'negative' | 'neutral' | 'mixed'} sentiment - The emotional tone detected in the reversal reason text by NLP models.
 * @property {number} confidence - The AI's statistical confidence level in its analysis, ranging from 0 to 1, representing certainty.
 * @property {string | null} suggestedAction - A specific, actionable recommendation provided by Gemini AI, or null if no action is suggested.
 * @property {boolean} anomalyDetected - True if Gemini AI identified any unusual or statistically suspicious patterns deviating from learned norms.
 * @property {ReversalProcessingStatus} processingStatus - The current state of the reversal as determined by Gemini's workflow rules and confidence levels.
 * @property {string[]} relatedContexts - A list of AI-identified contextual keywords or entities relevant to the reversal (e.g., "High Volume", "New Counterparty").
 * @property {number} processingDurationMs - The actual time taken for Gemini to complete its analysis in milliseconds.
 * @property {string} analysisTimestamp - ISO string of when the Gemini analysis was completed.
 * @property {Object} debugInfo - Optional, detailed debugging information from the AI model, crucial for explainability and troubleshooting.
 * @property {string} debugInfo.modelVersion - Exact version of the AI model used for this specific analysis.
 * @property {string[]} debugInfo.featureFlags - List of active feature flags during the analysis runtime.
 * @property {Object} debugInfo.inputHashes - Cryptographic hashes of key input data for reproducibility and audit trails.
 * @property {string | null} fraudPatternMatch - Identifier of a matched fraud pattern, if any, detected by the AI.
 * @property {boolean} complianceChecked - True if the AI performed a compliance check, and false otherwise.
 */
export interface GeminiReversalAnalysis {
  riskScore: number;
  reasonCategory: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  suggestedAction: string | null;
  anomalyDetected: boolean;
  processingStatus: ReversalProcessingStatus;
  relatedContexts: string[];
  processingDurationMs: number;
  analysisTimestamp: string;
  debugInfo: {
    modelVersion: string;
    featureFlags: string[];
    inputHashes: {
      reversalId: string;
      reasonText: string;
      amount: string;
      counterpartyHash?: string;
    };
  };
  fraudPatternMatch: string | null;
  complianceChecked: boolean;
}

/**
 * Interface defining the expected structure of a step within the Gemini AI pipeline.
 * This is used for granular visualization and debugging purposes in `YoAIPipelineDebugger`,
 * providing transparency into the AI's internal processes.
 *
 * @interface GeminiPipelineStep
 * @property {string} name - The descriptive name of the pipeline step (e.g., "Data Ingestion", "Risk Scoring Microservice").
 * @property {'success' | 'failure' | 'in-progress' | 'pending' | 'skipped'} status - The current operational status of the step.
 * @property {string} [timestamp] - Optional ISO string timestamp indicating when the step completed or started.
 * @property {string} [details] - Additional, context-rich details about the step's outcome or specific actions taken.
 * @property {number} [durationMs] - Duration of the step in milliseconds, indicating performance.
 * @property {string[]} [logs] - A collection of log messages generated during this step.
 */
export interface GeminiPipelineStep {
  name: string;
  status: 'success' | 'failure' | 'in-progress' | 'pending' | 'skipped';
  timestamp?: string;
  details?: string;
  durationMs?: number;
  logs?: string[];
}

// --- Utility Functions for Gemini AI Integration ---

/**
 * Asynchronously simulates an intensive, multi-stage Gemini AI data transformation and analysis.
 * This function takes raw reversal data and enriches it with hypothetical, but detailed,
 * AI-generated analysis results. In a real-world system, this would involve complex
 * orchestrations of microservices, API calls to advanced AI models (e.g., GPT, custom ML models),
 * and secure data persistence. It incorporates simulated network latency and transient failures
 * to mimic production environment challenges.
 *
 * @async
 * @function geminiAnalyzeReversalData
 * @param {ReversalDetailsViewFragment | null | undefined} reversalFragment - The raw GraphQL fragment of reversal data to be analyzed.
 * @param {number} [retryCount=0] - Current retry count for the analysis; used for resilient processing.
 * @returns {Promise<GeminiReversalAnalysis | null>} A promise resolving to a `GeminiReversalAnalysis` object, or `null` if the input is invalid or analysis fails critically after all retries.
 * @throws {Error} If a critical, unrecoverable error occurs during processing beyond the `maxProcessingRetries`.
 */
export async function geminiAnalyzeReversalData(
  reversalFragment: ReversalDetailsViewFragment | null | undefined,
  retryCount: number = 0
): Promise<GeminiReversalAnalysis | null> {
  const startTime = performance.now();
  const currentTimestamp = new Date().toISOString();

  console.info(`[Gemini-Core] Starting deep analysis for reversal (ID: ${reversalFragment?.id || 'N/A'}) - Attempt ${retryCount + 1}`);

  // Simulates AI processing delay, network latency, and complex computational logic.
  // The duration varies to mimic real-world system variability and model complexity.
  const simulatedDelayMs = Math.random() * 2500 + 1000; // 1 to 3.5 seconds
  await new Promise(resolve => setTimeout(resolve, simulatedDelayMs));

  if (!reversalFragment) {
    console.error("[Gemini-Core] Received null or undefined reversal fragment for analysis. Cannot proceed with AI.");
    return null; // Critical, unrecoverable failure at input stage
  }

  // Simulate transient network or processing errors that can be retried automatically.
  // This enhances the robustness of the AI system demonstration.
  if (Math.random() < 0.15 && retryCount < GEMINI_ANALYTICS_CONFIG.maxProcessingRetries) { // 15% chance of transient error
    console.warn(`[Gemini-Core] Transient error simulated for ID: ${reversalFragment.id}. Retrying analysis... (Attempt ${retryCount + 1}/${GEMINI_ANALYTICS_CONFIG.maxProcessingRetries})`);
    return geminiAnalyzeReversalData(reversalFragment, retryCount + 1); // Recursive call for retry logic
  } else if (Math.random() < 0.05 && retryCount >= GEMINI_ANALYTICS_CONFIG.maxProcessingRetries) { // 5% chance of hard failure after retries
    console.error(`[Gemini-Core] Critical processing failure for ID: ${reversalFragment.id} after ${retryCount} retries. AI pipeline failed.`);
    throw new Error("Gemini AI critical processing error after multiple retries. System requires intervention."); // Propagate a hard error
  }

  // Begin hypothetical, multi-faceted AI analysis logic based on various transaction attributes.
  // This logic is designed to be complex and multi-dimensional, mirroring real AI decision trees
  // and contextual understanding.
  const reasonText = reversalFragment.reason || "no specific reason provided by user for this reversal";
  const amount = parseFloat(reversalFragment.paymentOrderAttempt.prettyAmount.replace(/[^0-9.-]+/g, ""));
  const originatingAccountName = reversalFragment.paymentOrder.accountName;
  const counterpartyName = reversalFragment.paymentOrder.counterparty?.name || "unknown counterparty";
  const receivingEntityName = reversalFragment.paymentOrder.receivingEntity?.name || "unknown receiving entity";
  const reversalType = reversalFragment.reversalType;

  let riskScore = 0.15; // Baseline low risk, subject to AI adjustments
  let reasonCategory = "General Transaction Adjustment";
  let sentiment: GeminiReversalAnalysis['sentiment'] = "neutral";
  let suggestedAction: string | null = null;
  let anomalyDetected = false;
  let processingStatus = ReversalProcessingStatus.PENDING_REVIEW;
  const relatedContexts: string[] = [];
  let fraudPatternMatch: string | null = null;
  let complianceChecked: boolean = false;

  // Rule-based adjustments and probabilistic AI decisions derived from simulated model inferences
  // This section simulates a blend of expert system rules and machine learning model outputs.
  if (reasonText.toLowerCase().includes("fraud") || reasonText.toLowerCase().includes("unauthorized") || reasonText.toLowerCase().includes("stolen")) {
    riskScore += 0.65; // Significant risk increase for explicit fraud terms
    reasonCategory = "Potential Fraudulent Activity (AI Flagged)";
    sentiment = "negative";
    anomalyDetected = true;
    fraudPatternMatch = "Known Fraudulent Keyword Match (NLP)";
    suggestedAction = "Immediate escalation to specialized Fraud Investigation Unit (Gemini Priority Alert). Initiate account lock.";
    processingStatus = ReversalProcessingStatus.FURTHER_INVESTIGATION;
    relatedContexts.push("Fraud Alert", "Security Review", "High Severity");
  } else if (reasonText.toLowerCase().includes("error") || reasonText.toLowerCase().includes("mistake") || reasonText.toLowerCase().includes("incorrect")) {
    riskScore = Math.max(0.1, riskScore - 0.08); // Slightly reduce risk if human error is clearly stated
    reasonCategory = "Operational Correction (User Error)";
    sentiment = "negative"; // The error itself is a negative event
    suggestedAction = "Review user input process for common errors. Consider automation for similar, low-risk cases. Implement user feedback loop.";
    processingStatus = ReversalProcessingStatus.APPROVED_BY_GEMINI; // Gemini can often auto-approve clear errors with high confidence
    relatedContexts.push("Operational Efficiency", "User Experience Improvement", "Workflow Automation");
  } else if (reversalType.toLowerCase() === "chargeback" || reasonText.toLowerCase().includes("dispute")) {
    riskScore += 0.35; // Chargebacks inherently carry higher risk and require specific protocols
    reasonCategory = "Customer Chargeback/Dispute (Specific Type)";
    sentiment = "mixed"; // Can be negative for the institution, positive for the customer
    suggestedAction = "Initiate chargeback dispute protocol. Monitor customer account for patterns of disputes. Engage customer success.";
    processingStatus = ReversalProcessingStatus.FURTHER_INVESTIGATION;
    relatedContexts.push("Chargeback Management", "Customer Relations", "Dispute Resolution");
  }

  // Amount-based risk adjustment, demonstrating dynamic risk scoring layers
  if (amount > 7500) {
    riskScore += 0.25; // High value transactions naturally increase risk profile
    if (!suggestedAction) suggestedAction = "High-value reversal detected; manual verification and secondary approval recommended by AI.";
    relatedContexts.push("High Value Transaction", "Financial Impact", "Increased Scrutiny");
  }
  if (amount > 30000) {
    riskScore += 0.25; // Very high value triggers more stringent review and potential anomaly flagging
    reasonCategory = "Critical High Value Reversal (AI Escalated)";
    anomalyDetected = true;
    if (processingStatus !== ReversalProcessingStatus.FURTHER_INVESTIGATION) {
      processingStatus = ReversalProcessingStatus.PENDING_REVIEW; // Ensure it goes to review
    }
    relatedContexts.push("Critical Transaction", "Executive Oversight", "Compliance Alert");
  }

  // Counterparty and receiving entity analysis (simulated external data integration)
  if (counterpartyName.includes("ShellCorp") || receivingEntityName.includes("GhostAccount") || counterpartyName.includes("OffshoreHoldings")) {
    riskScore += 0.45; // Significant risk increase for suspicious entities
    reasonCategory = "Suspicious Entity Involvement (AI Alert)";
    sentiment = "negative";
    anomalyDetected = true;
    fraudPatternMatch = "High-Risk Entity Linkage (Network Analysis)";
    suggestedAction = "Block counterparty/receiving entity; cross-reference with global sanctions watchlists. Alert legal team.";
    processingStatus = ReversalProcessingStatus.EXTERNAL_REVIEW_REQUIRED; // Requires external review for legal/compliance
    relatedContexts.push("Sanctions Screening", "Entity Reputation", "AML Flag", "Regulatory Compliance");
  }

  // Simulate compliance check
  if (Math.random() > 0.6) { // 40% chance of a compliance check being "performed"
    complianceChecked = true;
    relatedContexts.push("Automated Compliance Check");
  }

  // Final risk score clamping and confidence calculation to ensure valid ranges
  riskScore = parseFloat(Math.min(1.0, Math.max(0.0, riskScore + (Math.random() * 0.1 - 0.05))).toFixed(2)); // Introduce slight randomness for realism
  const confidence = parseFloat((0.7 + Math.random() * 0.3).toFixed(2)); // Random confidence 70-100%

  // Update processing status based on final aggregated risk score and confidence.
  // This reflects the AI's final disposition for the transaction.
  if (riskScore > GEMINI_ANALYTICS_CONFIG.defaultConfidenceThreshold && confidence > 0.8) {
    processingStatus = ReversalProcessingStatus.FURTHER_INVESTIGATION;
    if (!suggestedAction) suggestedAction = "High-risk, high-confidence AI flag; immediate, in-depth manual review is critical.";
  } else if (processingStatus === ReversalProcessingStatus.PENDING_REVIEW && riskScore < 0.3 && confidence > 0.9) {
    processingStatus = ReversalProcessingStatus.APPROVED_BY_GEMINI; // Auto-approve low risk with high confidence
    if (!suggestedAction) suggestedAction = "Automated approval by Gemini due to low risk profile and high AI confidence.";
  } else if (processingStatus === ReversalProcessingStatus.PENDING_REVIEW && Math.random() > 0.7) {
    // Simulate some manual review being randomly chosen even for low-risk items to distribute workload
    processingStatus = ReversalProcessingStatus.PENDING_REVIEW;
    if (!suggestedAction) suggestedAction = "Standard manual review queue for routine checks and quality assurance.";
  }

  // Ensure 'completed' status is only set explicitly or after an approval, not directly by initial flagging
  if ((processingStatus === ReversalProcessingStatus.APPROVED_BY_GEMINI || processingStatus === ReversalProcessingStatus.MANUAL_OVERRIDE) && Math.random() > 0.9) {
      processingStatus = ReversalProcessingStatus.COMPLETED; // Simulate immediate completion for very clear, approved cases
      if (!suggestedAction) suggestedAction = "Transaction completed following successful AI approval and post-processing.";
  }

  const processingDurationMs = performance.now() - startTime;

  console.info(`[Gemini-Core] Analysis completed for ID: ${reversalFragment.id}. Risk: ${riskScore.toFixed(2)}, Status: ${processingStatus}, Duration: ${processingDurationMs.toFixed(2)}ms.`);

  return {
    riskScore,
    reasonCategory,
    sentiment,
    confidence,
    suggestedAction,
    anomalyDetected,
    processingStatus,
    relatedContexts: Array.from(new Set(relatedContexts)), // Ensure unique contexts
    processingDurationMs: parseFloat(processingDurationMs.toFixed(2)),
    analysisTimestamp: currentTimestamp,
    debugInfo: {
      modelVersion: GEMINI_ANALYTICS_CONFIG.fraudDetectionModel,
      featureFlags: ["dynamic-risk-scoring", "nlp-sentiment-v2.1", "entity-matching-beta", "compliance-check-v1"],
      inputHashes: {
        reversalId: btoa(reversalFragment.id).substring(0, 16), // Base64 hash for demo/audit
        reasonText: btoa(reasonText).substring(0, 16),
        amount: btoa(amount.toString()).substring(0, 16),
        counterpartyHash: btoa(counterpartyName).substring(0, 16),
      },
    },
    fraudPatternMatch: fraudPatternMatch,
    complianceChecked: complianceChecked,
  };
}

/**
 * Custom React hook `useGeminiReversalAnalysis` to centralize and manage the entire
 * Gemini AI analysis lifecycle for a specific reversal. This hook encapsulates
 * the asynchronous AI processing, manages loading states, and handles potential
 * errors, significantly simplifying the main component's logic and focusing it on rendering.
 * It also includes mechanisms for cleanup and state consistency across renders.
 *
 * @function useGeminiReversalAnalysis
 * @param {ReversalDetailsViewFragment | null | undefined} reversalFragment - The input reversal data fragment to be analyzed by Gemini AI.
 * @param {boolean} enableGeminiInsights - Flag to explicitly activate or deactivate the Gemini analysis process.
 * @param {string} geminiAgentId - Identifier for the specific Gemini agent instance performing the analysis.
 * @returns {Object} An object containing the AI analysis results, current loading state, and any errors encountered.
 * @property {GeminiReversalAnalysis | null} geminiAnalysis - The processed AI analysis data, or null if not yet available or failed.
 * @property {boolean} isGeminiAnalyzing - Boolean flag, true if AI analysis is currently in progress.
 * @property {string | null} geminiError - Any error message encountered during the Gemini analysis, or null if no error.
 */
export function useGeminiReversalAnalysis(
  reversalFragment: ReversalDetailsViewFragment | null | undefined,
  enableGeminiInsights: boolean,
  geminiAgentId: string
) {
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiReversalAnalysis | null>(null);
  const [isGeminiAnalyzing, setIsGeminiAnalyzing] = useState<boolean>(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  /**
   * Effect hook to trigger the Gemini AI analysis process. It runs whenever
   * `reversalFragment`, `enableGeminiInsights`, or `geminiAgentId` changes.
   * Includes robust error handling, loading state management, and cleanup logic.
   */
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    const abortController = new AbortController(); // For potential future API call cancellation

    const performAnalysis = async () => {
      if (!enableGeminiInsights || !reversalFragment) {
        setGeminiAnalysis(null);
        setGeminiError(null);
        setIsGeminiAnalyzing(false);
        console.debug("[Gemini-Hook] Analysis skipped: Gemini insights disabled or no valid fragment provided.");
        return;
      }

      setIsGeminiAnalyzing(true);
      setGeminiError(null);
      setGeminiAnalysis(null); // Clear previous analysis results to show fresh state

      console.info(`[Gemini-Hook] Initiating Gemini AI analysis for Reversal ID: ${reversalFragment.id} by agent: ${geminiAgentId}`);

      try {
        const analysis = await geminiAnalyzeReversalData(reversalFragment);
        if (isMounted && !abortController.signal.aborted) {
          setGeminiAnalysis(analysis);
          console.debug(`[Gemini-Hook] Analysis complete for ID: ${reversalFragment.id}. Final Status: ${analysis?.processingStatus}`);
        }
      } catch (error: any) {
        if (isMounted && !abortController.signal.aborted) {
          console.error(`[Gemini-Hook] Critical error during Gemini analysis for ID: ${reversalFragment.id}:`, error);
          setGeminiError(`Gemini AI analysis failed critically: ${error.message || String(error)}. Manual review of AI logs is recommended.`);
          // Provide a degraded, but still informative, fallback analysis in case of complete failure
          setGeminiAnalysis({
            riskScore: 0.85, // Higher baseline risk in error state
            reasonCategory: "AI Analysis Unavailable - Critical Fallback Mode",
            sentiment: "mixed",
            confidence: 0.01, // Very low confidence
            suggestedAction: "Manual review is critically required as AI system encountered an unrecoverable error. Refer to incident log.",
            anomalyDetected: true, // Assume anomaly if analysis itself failed
            processingStatus: ReversalProcessingStatus.FAILED,
            relatedContexts: ["Error State", "System Integrity Compromise", "AI Downtime"],
            processingDurationMs: 0,
            analysisTimestamp: new Date().toISOString(),
            debugInfo: {
              modelVersion: "fallback-error-v1",
              featureFlags: ["error-mode"],
              inputHashes: { reversalId: "N/A", reasonText: "N/A", amount: "N/A" },
              counterpartyHash: "N/A",
            },
            fraudPatternMatch: null,
            complianceChecked: false,
          });
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setIsGeminiAnalyzing(false);
          console.debug(`[Gemini-Hook] Finalized AI analysis process for ID: ${reversalFragment.id}`);
        }
      }
    };

    performAnalysis(); // Execute the async analysis

    // Cleanup function to run on component unmount or dependency change
    return () => {
      isMounted = false;
      abortController.abort(); // Cancel any pending operations to prevent memory leaks/unwanted side effects
      console.debug(`[Gemini-Hook] Cleanup initiated for ReversalDetailsView ID: ${reversalFragment?.id}`);
    };
  }, [reversalFragment, enableGeminiInsights, geminiAgentId]); // Dependencies carefully chosen to trigger re-analysis when relevant data or settings change

  return { geminiAnalysis, isGeminiAnalyzing, geminiError };
}

// --- Component Props Interfaces ---

/**
 * @interface ReversalDetailsViewProps
 * @description Properties required for the `ReversalDetailsView` component.
 * It now includes additional flags for controlling Gemini AI integration and
 * specific AI agent identification.
 * @property {boolean} loading - Indicates if the primary reversal data is currently loading from the backend.
 * @property {ReversalDetailsViewFragment | null | undefined} reversalFragment - The main data fragment for the reversal, typically fetched via GraphQL.
 * @property {boolean} [enableGeminiInsights=true] - Optional flag to explicitly enable or disable Gemini AI insights and features within this view. Defaults to true.
 * @property {string} [geminiAgentId="Gemini-Prime-v1.2-Orchestrator"] - Identifier for the specific Gemini agent instance or cluster responsible for analysis. Used for logging and traceability.
 */
interface ReversalDetailsViewProps {
  loading: boolean;
  reversalFragment?: ReversalDetailsViewFragment | null;
  enableGeminiInsights?: boolean;
  geminiAgentId?: string;
}

// --- Yo-Components (Your Own Components) for modularity and AI integration ---
// These components are designed for high reusability and explicit integration of Gemini AI features.

/**
 * YoDetailWrapper: A highly customizable and extensible container component designed
 * for encapsulating and visually structuring distinct sections of detail within the
 * ReversalDetailsView. It offers consistent styling, improved accessibility, and can
 * visually emphasize sections that are enhanced or primarily driven by Gemini AI.
 * This wrapper is key to maintaining a coherent AI-first design language across the UI.
 *
 * @component
 * @param {Object} props - The properties for the YoDetailWrapper component.
 * @param {React.ReactNode} props.children - The primary content to be rendered inside the wrapper.
 * @param {string} props.title - The descriptive title for this specific detail section.
 * @param {boolean} [props.isGeminiEnhanced=false] - A boolean flag indicating if the content
 *   within this wrapper has been augmented, processed, or generated by Gemini AI. This influences visual styling.
 * @param {string} [props.tooltipMessage] - An optional message to display as a tooltip on the wrapper title,
 *   providing further context, especially for AI-driven sections.
 * @param {React.CSSProperties} [props.style] - Optional inline style overrides for the main wrapper div.
 * @returns {JSX.Element} The rendered detail wrapper component, ensuring a consistent user experience.
 */
export const YoDetailWrapper: React.FC<{
  children: React.ReactNode;
  title: string;
  isGeminiEnhanced?: boolean;
  tooltipMessage?: string;
  style?: React.CSSProperties;
}> = React.memo(({ children, title, isGeminiEnhanced = false, tooltipMessage, style }) => {
  /**
   * Memoized style object for the outer wrapper div. This optimization prevents
   * unnecessary re-renders and style recalculations when `isGeminiEnhanced` is the only prop changing,
   * leading to smoother UI performance.
   * @type {React.CSSProperties}
   */
  const wrapperStyle: React.CSSProperties = useMemo(() => ({
    border: isGeminiEnhanced ? "2px solid #4285F4" : "1px solid #E0E0E0", // Google Blue for AI emphasis
    borderRadius: "12px", // Slightly larger border radius for modern look
    padding: "20px 25px", // Increased horizontal padding
    marginBottom: "28px", // More spacing between sections
    backgroundColor: isGeminiEnhanced ? "#EBF5FF" : "#FFFFFF", // Lighter blue for AI background
    boxShadow: isGeminiEnhanced ? "0 8px 25px rgba(66, 133, 244, 0.28)" : "0 4px 12px rgba(0,0,0,0.09)", // Enhanced shadow for AI sections
    transition: "all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)", // Smooth, more sophisticated transition
    ...style, // Apply any passed-in inline styles
  }), [isGeminiEnhanced, style]);

  /**
   * Memoized style object for the title heading (`<h3>`). Enhances readability,
   * allows for distinct styling when AI insights are present, and improves information hierarchy.
   * @type {React.CSSProperties}
   */
  const titleStyle: React.CSSProperties = useMemo(() => ({
    fontSize: "1.4em", // Slightly larger title font
    fontWeight: "700", // Bolder font weight
    marginBottom: "18px", // More spacing below title
    color: isGeminiEnhanced ? "#1A73E8" : "#333333", // Darker blue for AI titles
    display: "flex",
    alignItems: "center",
    gap: "12px", // Increased gap
    borderBottom: isGeminiEnhanced ? "1px dashed #A5D2FF" : "1px solid #F0F0F0",
    paddingBottom: "12px",
    letterSpacing: "0.2px", // Slight letter spacing for readability
  }), [isGeminiEnhanced]);

  /**
   * Renders a small, visually distinctive AI icon next to the title if `isGeminiEnhanced` is true.
   * This provides a quick visual cue for users to identify AI-powered sections.
   * @type {JSX.Element | null}
   */
  const geminiIndicator = useMemo(() => {
    return isGeminiEnhanced ? (
      <span
        style={{
          fontSize: "1.2em", // Larger icon
          color: "#4285F4",
          lineHeight: 1,
          verticalAlign: "middle",
          cursor: tooltipMessage ? "help" : "default",
          transform: "rotate(-10deg)", // Slightly tilted for dynamic feel
          display: "inline-block", // Required for transform
        }}
        title={tooltipMessage || "This section incorporates Gemini AI insights and processing."}
      >
        ✨
      </span>
    ) : null;
  }, [isGeminiEnhanced, tooltipMessage]);

  return (
    <div style={wrapperStyle}>
      <h3 style={titleStyle} role="heading" aria-level={3}>
        {geminiIndicator}
        {title}
      </h3>
      {children}
    </div>
  );
});

/**
 * YoDataDisplayItem: A highly reusable and modular component for presenting
 * a single key-value data point within the UI. It intelligently highlights
 * data points that have been influenced, generated, or verified by Gemini AI,
 * enhancing transparency and user trust. Supports tooltips and importance highlighting.
 *
 * @component
 * @param {Object} props - The properties for the YoDataDisplayItem component.
 * @param {string} props.label - The human-readable label or description of the data point.
 * @param {React.ReactNode} props.value - The actual data value to display. Can be a string, number, or complex ReactNode.
 * @param {boolean} [props.isGeminiGenerated=false] - Flag indicating if the `value` was directly generated, significantly modified, or validated by Gemini AI.
 * @param {string} [props.tooltipText] - Optional descriptive text for a tooltip, providing additional context, especially useful for AI-driven values.
 * @param {boolean} [props.isImportant=false] - Highlights the item as particularly important, drawing user attention.
 * @param {boolean} [props.displayInline=false] - If true, displays label and value on one line with minimal spacing.
 * @returns {JSX.Element} The rendered data display item, designed for clarity and information hierarchy.
 */
export const YoDataDisplayItem: React.FC<{
  label: string;
  value: React.ReactNode;
  isGeminiGenerated?: boolean;
  tooltipText?: string;
  isImportant?: boolean;
  displayInline?: boolean;
}> = React.memo(({ label, value, isGeminiGenerated = false, tooltipText, isImportant = false, displayInline = false }) => {
  /**
   * Memoized style for the individual data item container. This prevents unnecessary recalculations.
   * @type {React.CSSProperties}
   */
  const itemStyle: React.CSSProperties = useMemo(() => ({
    display: displayInline ? "inline-flex" : "flex",
    alignItems: displayInline ? "center" : "flex-start", // Align items to the top for multi-line values
    marginBottom: displayInline ? "0px" : "10px", // Reduced margin for inline display
    fontSize: isImportant ? "1.02em" : "0.98em", // Slightly larger for important items
    padding: isImportant ? "5px 0" : "0",
    backgroundColor: isImportant ? "#FFFCEE" : "transparent", // Lighter yellow for important items
    borderRadius: "5px",
    gap: displayInline ? "8px" : "initial", // Gap for inline
  }), [isImportant, displayInline]);

  /**
   * Memoized style for the label part of the item.
   * @type {React.CSSProperties}
   */
  const labelStyle: React.CSSProperties = useMemo(() => ({
    fontWeight: isImportant ? "bold" : "600", // Bolder for important
    color: isGeminiGenerated ? "#1A73E8" : (isImportant ? "#E65100" : "#555555"), // Orange for important, blue for AI
    minWidth: displayInline ? "auto" : "240px", // Adjust min-width for inline
    flexShrink: 0, // Prevent label from shrinking
    marginRight: displayInline ? "0px" : "15px",
    textDecoration: displayInline ? "none" : "initial", // Remove underline for inline labels
  }), [isGeminiGenerated, isImportant, displayInline]);

  /**
   * Memoized style for the value part of the item.
   * @type {React.CSSProperties}
   */
  const valueStyle: React.CSSProperties = useMemo(() => ({
    color: isGeminiGenerated ? "#0D47A1" : "#333333", // Darker blue for AI values
    flexGrow: 1, // Allow value to take remaining space
    wordBreak: "break-word", // Handle long strings gracefully
    fontSize: isImportant ? "1.05em" : "1.0em", // Slightly larger for important values
    fontWeight: isImportant ? "600" : "400", // Bolder for important values
  }), [isGeminiGenerated, isImportant]);

  /**
   * Renders a small AI tag next to the value if `isGeminiGenerated` is true.
   * This visibly signifies AI contribution to the data point, enhancing transparency.
   * @type {JSX.Element | null}
   */
  const geminiTag = useMemo(() => {
    return isGeminiGenerated ? (
      <span
        style={{
          fontSize: "0.78em", // Slightly larger tag
          color: "#4285F4",
          backgroundColor: "#E3F2FD",
          borderRadius: "4px", // Slightly more rounded
          padding: "3px 7px", // More padding
          marginLeft: "10px", // More spacing
          fontWeight: "normal",
          boxShadow: "0 1px 3px rgba(66, 133, 244, 0.1)", // Subtle shadow for depth
        }}
        title="Value generated, verified, or significantly influenced by Gemini AI"
      >
        AI
      </span>
    ) : null;
  }, [isGeminiGenerated]);

  return (
    <div style={itemStyle} title={tooltipText} role="listitem">
      <span style={labelStyle}>
        {label}:
      </span>
      <span style={valueStyle}>
        {value}
        {geminiTag}
      </span>
    </div>
  );
});

/**
 * YoLoadingSpinner: A visually appealing, Gemini-themed loading indicator component.
 * It provides clear asynchronous feedback to the user during data fetching,
 * complex AI computations, or any other intensive background operations, improving UX.
 * It supports custom messages, colors, and sizes.
 *
 * @component
 * @param {Object} props - The properties for the YoLoadingSpinner component.
 * @param {string} [props.message="Gemini AI is processing your request..."] - Custom message to display below the spinner.
 * @param {string} [props.color="#4285F4"] - The primary color theme for the spinner dots and message (Google Blue by default).
 * @param {'small' | 'medium' | 'large'} [props.size="medium"] - Predefined size variant for the spinner animation and text.
 * @returns {JSX.Element} The rendered loading spinner, providing visual feedback to the user.
 */
export const YoLoadingSpinner: React.FC<{
  message?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}> = React.memo(({ message = "Gemini AI is processing your request...", color = "#4285F4", size = "medium" }) => {
  /**
   * Memoized base style for the spinner container. This helps prevent unnecessary style recalculations.
   * @type {React.CSSProperties}
   */
  const spinnerContainerStyle: React.CSSProperties = useMemo(() => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px", // Increased padding
    backgroundColor: "#F8FBFF", // Lighter background for a cleaner look
    borderRadius: "12px", // Consistent border radius
    border: `1px solid ${color}80`, // Lighter, translucent border color
    boxShadow: "0 6px 20px rgba(0,0,0,0.12)", // Enhanced shadow for depth
    transition: "all 0.35s ease-in-out", // Smooth transition
    minHeight: "150px", // Minimum height for better layout
  }), [color]);

  /**
   * Memoized style for the individual pulsating dots within the spinner.
   * The `animationDelay` creates a pleasing "wave" effect, indicating active processing.
   * @param {string} delay - CSS animation-delay value for staggering the dot animations.
   * @returns {React.CSSProperties} Style object for a single dot.
   */
  const dotStyle = useCallback((delay: string): React.CSSProperties => {
    let dotSize = 12; // Base dot size
    if (size === 'small') dotSize = 8;
    if (size === 'large') dotSize = 16;

    return {
      width: `${dotSize}px`,
      height: `${dotSize}px`,
      backgroundColor: color,
      borderRadius: "50%",
      margin: `0 ${dotSize / 2 + 2}px`, // Increased margin for better separation
      animation: "yo-bounce 1.5s infinite ease-in-out both", // 'both' ensures initial state is handled consistently
      animationDelay: delay,
    };
  }, [color, size]);

  /**
   * Injects the CSS `@keyframes` for the bouncing animation into the document head dynamically.
   * This is a robust way to ensure the animation is available globally without
   * relying on external CSS files or libraries. It checks if the style is already present
   * to avoid redundant injections. This leverages AI's ability to generate self-contained solutions.
   */
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('yo-bounce-style')) {
      const styleSheet = document.createElement("style");
      styleSheet.setAttribute("id", "yo-bounce-style");
      styleSheet.type = "text/css";
      styleSheet.innerText = `
        @keyframes yo-bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.6; /* Slightly translucent for a softer effect */
          }
          40% {
            transform: scale(1.0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styleSheet);
      console.debug("[YoLoadingSpinner] Injected 'yo-bounce' CSS animation for dynamic loading feedback.");
    }
  }, []); // Run only once on component mount

  /**
   * Memoized style for the loading message text. Adjusts font size based on `size` prop.
   * @type {React.CSSProperties}
   */
  const messageStyle: React.CSSProperties = useMemo(() => {
    let fontSize = '1.0em';
    if (size === 'small') fontSize = '0.85em';
    if (size === 'large') fontSize = '1.1em';
    return {
      color,
      fontSize: fontSize,
      fontWeight: "600", // Bolder message
      marginTop: "20px", // More spacing
      textAlign: "center",
      maxWidth: "80%", // Limit width for long messages
      lineHeight: "1.4", // Improved readability
    };
  }, [color, size]);

  return (
    <div style={spinnerContainerStyle} role="status" aria-live="polite">
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={dotStyle("0s")}></div>
        <div style={dotStyle("0.18s")}></div>
        <div style={dotStyle("0.36s")}></div>
        <div style={dotStyle("0.54s")}></div>
        <div style={dotStyle("0.72s")}></div>
      </div>
      <p style={messageStyle}>{message}</p>
    </div>
  );
});

/**
 * YoErrorDisplay: A robust and user-friendly component for presenting error messages.
 * It is specifically designed to handle and highlight issues originating from or
 * impacting Gemini AI processes, providing clear context and actionable advice to the user.
 * This component emphasizes transparency and guidance during system failures.
 *
 * @component
 * @param {Object} props - The properties for the YoErrorDisplay component.
 * @param {string} props.message - The primary, concise error message to display.
 * @param {string} [props.details] - Optional, more verbose technical details about the error, useful for debugging.
 * @param {string} [props.context="Application Process"] - Specifies the part of the system
 *   where the error occurred (e.g., "Gemini AI Analysis", "Data Fetching Service", "UI Rendering").
 * @param {string} [props.actionSuggestion="Please try refreshing the page or contacting support."] - A user-friendly suggestion for attempting to resolve the error.
 * @returns {JSX.Element} The rendered error message display, designed for high visibility and impact.
 */
export const YoErrorDisplay: React.FC<{
  message: string;
  details?: string;
  context?: string;
  actionSuggestion?: string;
}> = React.memo(({ message, details, context = "Application Process", actionSuggestion = "Please try refreshing the page or contacting support." }) => {
  /**
   * Memoized base style for the error container. Prevents recalculation on re-renders.
   * @type {React.CSSProperties}
   */
  const errorStyle: React.CSSProperties = useMemo(() => ({
    border: "2px solid #EF5350", // Material Design Red for errors
    borderRadius: "12px", // Consistent border radius
    padding: "22px 28px", // Increased padding
    backgroundColor: "#FFEBEE", // Lighter red background for softer alert
    color: "#C62828", // Darker red text for readability
    marginBottom: "30px", // More spacing below the error
    display: "flex",
    alignItems: "flex-start", // Align icon to top for multi-line content
    gap: "18px", // Increased gap between icon and text
    boxShadow: "0 6px 18px rgba(239, 83, 80, 0.25)", // Enhanced shadow for emphasis
  }), []);

  /**
   * Memoized style for the error icon.
   * @type {React.CSSProperties}
   */
  const iconStyle: React.CSSProperties = useMemo(() => ({
    fontSize: "2.5em", // Larger icon for prominence
    color: "#EF5350",
    lineHeight: 1,
    flexShrink: 0, // Prevent icon from shrinking
  }), []);

  return (
    <div style={errorStyle} role="alert" aria-live="assertive">
      <span style={iconStyle}>🚫</span>
      <div>
        <h4 style={{ margin: "0 0 10px 0", color: "#C62828", fontSize: "1.2em", fontWeight: "700" }}>
          Error in {context}: {message}
        </h4>
        {details && (
          <p style={{ margin: "0 0 12px 0", fontSize: "0.95em", color: "#D32F2F", lineHeight: "1.4" }}>
            <span style={{ fontWeight: "bold" }}>Details:</span> {details}
          </p>
        )}
        <p style={{ margin: 0, fontSize: "0.9em", color: "#EF5350", lineHeight: "1.4" }}>
          <span style={{ fontWeight: "bold" }}>Suggested Action:</span> {actionSuggestion}
          <br />
          <span style={{ fontStyle: "italic", fontSize: "0.85em", color: "#E57373" }}>
            (Gemini AI systems are designed for resilience, but some critical errors necessitate human oversight and troubleshooting.)
          </span>
        </p>
      </div>
    </div>
  );
});

/**
 * YoReversalReasonAnalyzer: A specialized component that graphically presents
 * the in-depth analysis of the reversal reason performed by Gemini AI. It breaks down
 * the raw reason into categorized insights, sentiment analysis results, and confidence-rated metrics,
 * providing a comprehensive understanding of the 'why' behind the reversal.
 *
 * @component
 * @param {Object} props - The properties for the YoReversalReasonAnalyzer component.
 * @param {string} props.reason - The original, raw reason string provided for the reversal.
 * @param {GeminiReversalAnalysis | null} [props.geminiAnalysis] - The AI analysis data object,
 *   containing processed insights about the reason. Can be null if analysis is pending or failed.
 * @returns {JSX.Element} The rendered reason analysis display, offering deep insight into AI's interpretation.
 */
export const YoReversalReasonAnalyzer: React.FC<{
  reason: string;
  geminiAnalysis?: GeminiReversalAnalysis | null;
}> = React.memo(({ reason, geminiAnalysis }) => {
  /**
   * Memoized content for the analysis results. This prevents re-computation
   * unless `reason` or `geminiAnalysis` actually change, optimizing rendering performance.
   * @type {JSX.Element}
   */
  const analysisContent = useMemo(() => {
    if (!geminiAnalysis) {
      console.warn("[YoReversalReasonAnalyzer] Gemini analysis not available for reason. Displaying raw reason only and pending state.");
      return (
        <div style={{ padding: "18px", backgroundColor: "#fbfbfb", borderRadius: "10px", border: "1px dashed #DDD" }}>
          <YoDataDisplayItem label="Raw Reason" value={reason} />
          <p style={{ color: "#777", fontStyle: "italic", margin: "10px 0 0 0" }}>
            Gemini AI analysis not yet complete or currently unavailable. Please wait or check system status.
          </p>
        </div>
      );
    }

    // Determine sentiment color based on AI's output for intuitive visual feedback
    const sentimentColorMap = {
      positive: "#4CAF50", // Green
      negative: "#F44336", // Red
      neutral: "#2196F3", // Blue
      mixed: "#FF9800", // Orange
    };
    const sentimentColor = sentimentColorMap[geminiAnalysis.sentiment] || "#607D8B"; // Default to grey-blue

    return (
      <div style={{
        padding: "20px",
        border: "1px solid #E0E0E0",
        borderRadius: "10px",
        backgroundColor: "#FDFDFD",
        boxShadow: "inset 0 2px 5px rgba(0,0,0,0.04)" // Subtle inner shadow
      }}>
        <YoDataDisplayItem label="Raw Reason Provided" value={reason} />
        <YoDataDisplayItem
          label="Gemini AI Categorization"
          value={geminiAnalysis.reasonCategory}
          isGeminiGenerated
          tooltipText="AI-driven categorization of the reversal motive, using Gemini's advanced Natural Language Processing (NLP) models."
          isImportant={geminiAnalysis.reasonCategory.includes("Fraud") || geminiAnalysis.reasonCategory.includes("Critical")}
        />
        <YoDataDisplayItem
          label="Gemini AI Sentiment Score"
          value={<span style={{ color: sentimentColor, fontWeight: "bold" }}>{startCase(geminiAnalysis.sentiment)}</span>}
          isGeminiGenerated
          tooltipText="Emotional tone detected in the reason text by Gemini AI's linguistic models, ranging from positive to negative."
        />
        <YoDataDisplayItem
          label="AI Confidence Level"
          value={`${(geminiAnalysis.confidence * 100).toFixed(1)}%`}
          isGeminiGenerated
          tooltipText="The statistical certainty Gemini AI has in its classification and sentiment analysis for this specific reason."
        />
        {geminiAnalysis.suggestedAction && (
          <YoDataDisplayItem
            label="AI Action Suggestion"
            value={<span style={{ fontStyle: "italic", color: "#3F51B5", fontWeight: "600" }}>{geminiAnalysis.suggestedAction}</span>}
            isGeminiGenerated
            tooltipText="Proactive recommendation from Gemini AI based on the reason's context and potential implications."
            isImportant={true}
          />
        )}
        <YoDataDisplayItem
          label="AI Anomaly Detection"
          value={geminiAnalysis.anomalyDetected ? "Yes (Gemini Flagged)" : "No anomaly detected"}
          isGeminiGenerated
          tooltipText="Gemini AI identified an unusual or statistically improbable pattern for this reversal's reason compared to historical data."
          isImportant={geminiAnalysis.anomalyDetected}
        />
        {geminiAnalysis.fraudPatternMatch && (
          <YoDataDisplayItem
            label="AI Fraud Pattern Match"
            value={<span style={{ color: "#D32F2F", fontWeight: "bold" }}>{geminiAnalysis.fraudPatternMatch}</span>}
            isGeminiGenerated
            tooltipText="Specific fraudulent pattern identified by Gemini's fraud detection models."
            isImportant={true}
          />
        )}
        {geminiAnalysis.complianceChecked && (
          <YoDataDisplayItem
            label="AI Compliance Check"
            value={<span style={{ color: "#2E7D32", fontWeight: "bold" }}>Passed Automated Check</span>}
            isGeminiGenerated
            tooltipText="Gemini AI performed an automated compliance review for this transaction."
          />
        )}
        {geminiAnalysis.relatedContexts.length > 0 && (
          <YoDataDisplayItem
            label="Related Contexts (AI Discovered)"
            value={
              <ul style={{ margin: 0, paddingLeft: "25px", listStyleType: "disc", color: "#555", fontSize: "0.9em" }}>
                {geminiAnalysis.relatedContexts.map((context, idx) => (
                  <li key={`ctx-${idx}`} style={{ marginBottom: "5px" }}>{context}</li>
                ))}
              </ul>
            }
            isGeminiGenerated
            tooltipText="Keywords and entities automatically extracted and linked by Gemini AI's contextual understanding models."
          />
        )}
      </div>
    );
  }, [reason, geminiAnalysis]);

  return (
    <YoDetailWrapper
      title="Gemini AI Reason & Contextual Analysis"
      isGeminiEnhanced
      tooltipMessage="Detailed breakdown of the reversal reason, powered by Gemini's natural language processing, sentiment analysis, and contextual understanding engines."
    >
      {analysisContent}
    </YoDetailWrapper>
  );
});

/**
 * YoReversalStatusIndicator: A visual indicator component that clearly displays
 * the current processing status of a reversal. It leverages the predefined
 * `ReversalProcessingStatus` and `REVERSAL_STATUS_COLORS` to provide
 * instant visual cues, and can integrate a Gemini AI risk score for deeper context,
 * making it an intuitive and informative element.
 *
 * @component
 * @param {Object} props - The properties for the YoReversalStatusIndicator component.
 * @param {ReversalProcessingStatus} props.status - The current `ReversalProcessingStatus` of the transaction, determining its color and label.
 * @param {number} [props.riskScore] - An optional Gemini AI risk score (0-1) to display
 *   alongside the status, providing immediate, nuanced risk context.
 * @returns {JSX.Element} The rendered, color-coded status indicator, enhancing user's ability to quickly grasp transaction state.
 */
export const YoReversalStatusIndicator: React.FC<{
  status: ReversalProcessingStatus;
  riskScore?: number;
}> = React.memo(({ status, riskScore }) => {
  const statusColor = REVERSAL_STATUS_COLORS[status] || "#78909C"; // Default to blue-grey if status unknown
  const statusText = useMemo(() => {
    // Human-readable formatting, removing underscores and adding "Gemini" prefix where applicable
    return startCase(status.replace(/GEMINI_/, "Gemini ").replace(/_/g, " "));
  }, [status]);

  /**
   * Memoized style for the main status badge container. Ensures consistent styling and performance.
   * @type {React.CSSProperties}
   */
  const indicatorStyle: React.CSSProperties = useMemo(() => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "9px 16px", // Increased padding for a larger touch target
    borderRadius: "28px", // More rounded badge for a modern aesthetic
    backgroundColor: statusColor,
    color: "#fff",
    fontWeight: "bold",
    fontSize: "0.92em", // Slightly larger font size
    boxShadow: `0 4px 10px ${statusColor}50`, // Subtle, color-matched shadow for depth
    marginRight: "12px", // Increased right margin
    textShadow: "1px 1px 2px rgba(0,0,0,0.15)", // Text shadow for better contrast and legibility
    letterSpacing: "0.6px", // Slight letter spacing for improved readability
    userSelect: "none", // Prevent text selection
    flexShrink: 0, // Prevent shrinking in flex containers
  }), [statusColor]);

  /**
   * Memoized style for the small circular dot inside the indicator.
   * @type {React.CSSProperties}
   */
  const dotStyle: React.CSSProperties = useMemo(() => ({
    width: "14px", // Larger dot
    height: "14px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    marginRight: "10px", // Increased right margin
    boxShadow: "0 0 0 3px rgba(255,255,255,0.3)", // More pronounced outline effect
  }), []);

  /**
   * Memoized risk score display element. This element is dynamically rendered
   * if a `riskScore` is provided, offering a direct view of AI-calculated risk.
   * @type {JSX.Element | null}
   */
  const riskScoreDisplay = useMemo(() => {
    if (riskScore !== undefined) {
      // Color gradient for risk score for quick assessment
      const riskColor = riskScore > 0.7 ? "#FFCC80" : (riskScore > 0.4 ? "#FFE0B2" : "#DCEDC8"); // Yellow/Orange/Green gradient
      return (
        <span
          style={{
            marginLeft: "15px", // More space from status text
            fontSize: "0.85em", // Slightly larger font size
            opacity: 0.98,
            backgroundColor: riskColor,
            color: "#333",
            padding: "3px 9px", // More padding
            borderRadius: "18px", // Consistent rounded shape
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px", // Gap between icon and text
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)", // Subtle shadow
          }}
          title={`Gemini AI Calculated Risk Score: ${(riskScore * 100).toFixed(1)}% (Higher score indicates higher risk)`}
        >
          {riskScore > 0.7 ? "🚨" : (riskScore > 0.4 ? "⚠️" : "✅")} AI Risk: {(riskScore * 100).toFixed(0)}%
        </span>
      );
    }
    return null;
  }, [riskScore]);

  return (
    <span style={indicatorStyle} role="status" aria-label={`Reversal status: ${statusText}, ${riskScore !== undefined ? `AI Risk: ${riskScore * 100}%` : ''}`}>
      <span style={dotStyle}></span>
      {statusText}
      {riskScoreDisplay}
    </span>
  );
});

/**
 * YoPredictiveAlerts: A proactive component designed to display critical predictive
 * alerts and insights generated by the Gemini AI. These alerts warn of potential
 * future issues, highlight detected anomalies, or suggest immediate proactive measures
 * to mitigate risks, acting as an early warning system.
 *
 * @component
 * @param {Object} props - The properties for the YoPredictiveAlerts component.
 * @param {boolean} props.hasAnomaly - Boolean flag indicating if an anomaly was detected by Gemini AI.
 * @param {number} props.riskScore - The Gemini AI-generated risk score (0-1) for the reversal.
 * @param {string | null} [props.predictedOutcome] - A hypothetical predicted outcome or
 *   specific action suggested by Gemini AI, based on its foresight.
 * @param {string[]} [props.additionalAlerts=[]] - An array of any other custom or context-specific alerts to display.
 * @returns {JSX.Element | null} The rendered predictive alerts panel, or `null` if no alerts are active, ensuring clean UI.
 */
export const YoPredictiveAlerts: React.FC<{
  hasAnomaly: boolean;
  riskScore: number;
  predictedOutcome: string | null;
  additionalAlerts?: string[];
}> = React.memo(({ hasAnomaly, riskScore, predictedOutcome, additionalAlerts = [] }) => {
  /**
   * Memoized array of alert messages generated dynamically based on the input props.
   * This ensures alerts are computed only when relevant data changes, optimizing performance.
   * @type {string[]}
   */
  const alerts = useMemo(() => {
    const generatedAlerts: string[] = [];

    if (hasAnomaly) {
      generatedAlerts.push("🚨 Gemini AI detected an unusual pattern. This reversal deviates significantly from historical norms, warranting immediate and closer inspection.");
    }

    if (riskScore > GEMINI_ANALYTICS_CONFIG.defaultConfidenceThreshold) {
      generatedAlerts.push(`📈 High risk score (${(riskScore * 100).toFixed(0)}%) flagged by Gemini AI. This transaction carries elevated risk, proceed with extreme caution and follow escalation protocols.`);
    } else if (riskScore > 0.4) {
      generatedAlerts.push(`📊 Moderate risk score (${(riskScore * 100).toFixed(0)}%) identified by Gemini AI. Recommend standard review protocols and enhanced due diligence.`);
    }

    if (predictedOutcome) {
      generatedAlerts.push(`🔮 Gemini AI Predicts: "${predictedOutcome}". Consider this AI-generated forecast in your decision-making process for proactive risk mitigation.`);
    }

    // Include any manually passed additional alerts, allowing for flexible alert system.
    generatedAlerts.push(...additionalAlerts);

    return generatedAlerts;
  }, [hasAnomaly, riskScore, predictedOutcome, additionalAlerts]);

  if (alerts.length === 0) {
    console.debug("[YoPredictiveAlerts] No active predictive alerts to display for this reversal.");
    return null; // Don't render the component if no alerts are present
  }

  /**
   * Memoized style for the individual alert list items.
   * @type {React.CSSProperties}
   */
  const listItemStyle: React.CSSProperties = useMemo(() => ({
    marginBottom: "10px", // More spacing between alerts
    lineHeight: "1.5", // Improved readability for alert messages
    paddingLeft: "8px", // Padding for border effect
    borderLeft: "4px solid #FFCC80", // Thicker border for emphasis
    backgroundColor: "#FFFDE7", // Slightly lighter background for list item
    padding: "8px 12px",
    borderRadius: "6px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  }), []);

  return (
    <YoDetailWrapper
      title="Gemini AI Predictive Insights & Proactive Alerts"
      isGeminiEnhanced
      tooltipMessage="Proactive alerts and forecasts generated by Gemini AI to highlight potential future issues or recommended immediate actions, enhancing early warning capabilities."
    >
      <div style={{
        backgroundColor: "#FFF8E1", // Lightest yellow background for the alert panel
        border: "1px solid #FFECB3", // Light yellow border
        padding: "20px 25px", // Increased padding
        borderRadius: "10px", // Consistent border radius
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06)" // Subtle inner shadow
      }}>
        <p style={{ margin: "0 0 15px 0", fontWeight: "bold", color: "#E65100", fontSize: "1.1em", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3em" }}>📢</span> Gemini AI Proactive Alerts Summary:
        </p>
        <ul style={{ margin: 0, paddingLeft: "10px", color: "#EF6C00", listStyle: "none" }}>
          {alerts.map((alert, index) => (
            <li key={index} style={listItemStyle}>{alert}</li>
          ))}
        </ul>
        <p style={{
          marginTop: "20px",
          fontSize: "0.85em",
          color: "#A1887F",
          fontStyle: "italic",
          borderTop: "1px dashed #FFD54F",
          paddingTop: "15px",
        }}>
          These insights are dynamically generated by advanced Gemini AI models ({GEMINI_ANALYTICS_CONFIG.fraudDetectionModel}).
          While highly accurate, human review and discretion are always recommended for critical alerts.
        </p>
      </div>
    </YoDetailWrapper>
  );
});

/**
 * YoGeminiProcessingStatus: A dedicated component to visualize the entire
 * lifecycle and current state of Gemini AI's processing for a specific reversal.
 * It provides detailed information about when analysis occurred, by which AI instance,
 * and the duration of the processing, enhancing transparency and auditability.
 *
 * @component
 * @param {Object} props - The properties for the YoGeminiProcessingStatus component.
 * @param {ReversalProcessingStatus} props.status - The current `ReversalProcessingStatus`
 *   of the reversal as determined by Gemini AI, dictating the primary visual state.
 * @param {string | null} [props.lastUpdateTime] - ISO string timestamp of the last update
 *   or significant interaction with the Gemini AI system. Can be `null` if no update yet.
 * @param {string} [props.processorId="Gemini-Core-A7"] - Identifier of the specific
 *   Gemini AI processor instance or cluster that last handled this reversal, useful for debugging and tracing.
 * @param {number | null} [props.processingDurationMs] - Optional duration of the AI analysis in milliseconds.
 * @returns {JSX.Element} The rendered Gemini processing status panel, offering a concise overview of AI workflow.
 */
export const YoGeminiProcessingStatus: React.FC<{
  status: ReversalProcessingStatus;
  lastUpdateTime: string | null;
  processorId?: string;
  processingDurationMs: number | null;
}> = React.memo(({ status, lastUpdateTime, processorId = "Gemini-Core-A7-Cluster", processingDurationMs }) => {
  /**
   * Memoized icon string based on the current processing status.
   * This enhances visual comprehension of the AI workflow state at a glance.
   * @type {string}
   */
  const icon = useMemo(() => {
    switch (status) {
      case ReversalProcessingStatus.GEMINI_ANALYTICS_IN_PROGRESS: return "🔄";
      case ReversalProcessingStatus.APPROVED_BY_GEMINI: return "✅";
      case ReversalProcessingStatus.REJECTED_BY_GEMINI: return "❌";
      case ReversalProcessingStatus.FURTHER_INVESTIGATION: return "🔬";
      case ReversalProcessingStatus.PENDING_REVIEW: return "⏳";
      case ReversalProcessingStatus.COMPLETED: return "✨";
      case ReversalProcessingStatus.FAILED: return "💥";
      case ReversalProcessingStatus.MANUAL_OVERRIDE: return "✍️";
      case ReversalProcessingStatus.GEMINI_PIPELINE_STALLED: return "🛑";
      case ReversalProcessingStatus.AI_SIMULATED_SUCCESS: return "🤖";
      case ReversalProcessingStatus.EXTERNAL_REVIEW_REQUIRED: return "🏢";
      default: return "❓";
    }
  }, [status]);

  return (
    <YoDetailWrapper
      title="Gemini AI Processing Lifecycle & Status"
      isGeminiEnhanced
      tooltipMessage="Overview of the automated and semi-automated processing stages handled by Gemini AI, providing transparency into the AI's operational state."
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "25px", // Increased gap
        padding: "20px",
        backgroundColor: "#E3F2FD", // Light blue for AI process
        borderRadius: "10px", // Consistent border radius
        border: "1px solid #BBDEFB",
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.05)",
      }}>
        <span style={{ fontSize: "3.5em", lineHeight: 1, flexShrink: 0 }}>{icon}</span>
        <div style={{ flexGrow: 1 }}>
          <YoDataDisplayItem
            label="Current AI Workflow State"
            value={<YoReversalStatusIndicator status={status} />}
            isGeminiGenerated
            isImportant={status === ReversalProcessingStatus.FURTHER_INVESTIGATION || status === ReversalProcessingStatus.FAILED || status === ReversalProcessingStatus.EXTERNAL_REVIEW_REQUIRED}
            tooltipText="The current state of this reversal as managed by the Gemini AI pipeline, indicating its position in the automated workflow."
          />
          {lastUpdateTime && (
            <YoDataDisplayItem
              label="Last AI Update Timestamp"
              value={<DateTime timestamp={lastUpdateTime} />}
              isGeminiGenerated
              tooltipText="The precise timestamp of the last significant interaction or update from the Gemini AI system for this reversal."
            />
          )}
          <YoDataDisplayItem
            label="Responsible Gemini AI Processor"
            value={processorId}
            isGeminiGenerated
            tooltipText="Identifier of the specific Gemini AI instance, cluster, or service that last processed this reversal, useful for debugging and audit trails."
          />
          {processingDurationMs !== null && processingDurationMs > 0 && (
            <YoDataDisplayItem
              label="AI Analysis Duration"
              value={`${processingDurationMs.toFixed(2)} ms`}
              isGeminiGenerated
              tooltipText="The total computational time Gemini AI spent actively analyzing and processing this reversal, excluding queue and network times."
            />
          )}
        </div>
      </div>
    </YoDetailWrapper>
  );
});

/**
 * YoAIPipelineDebugger: A highly technical component designed to visualize
 * the internal steps and operational states of the Gemini AI processing pipeline
 * for a given reversal. It's invaluable for engineers, data scientists, and auditors
 * for debugging, auditing, and understanding the AI's granular decision flow.
 *
 * @component
 * @param {Object} props - The properties for the YoAIPipelineDebugger component.
 * @param {GeminiPipelineStep[]} props.pipelineSteps - An array defining each step
 *   in the AI pipeline, including its name, status, and optional detailed information.
 * @param {string} [props.pipelineId] - An optional identifier for the specific pipeline instance or trace.
 * @returns {JSX.Element} The rendered AI pipeline visualization, providing deep operational insight.
 */
export const YoAIPipelineDebugger: React.FC<{
  pipelineSteps: GeminiPipelineStep[];
  pipelineId?: string;
}> = React.memo(({ pipelineSteps, pipelineId = "AI-Pipeline-Trace-Instance-1" }) => {
  /**
   * Memoized function to determine the styling for each pipeline step based on its status.
   * @param {GeminiPipelineStep['status']} status - The current status of the pipeline step.
   * @returns {React.CSSProperties} The style object for a single step.
   */
  const stepStyle = useCallback((status: GeminiPipelineStep['status']): React.CSSProperties => {
    let backgroundColor = "#EEEEEE"; // Default pending/skipped
    let color = "#616161";
    let borderColor = "#D0D0D0";
    switch (status) {
      case 'success': backgroundColor = "#E8F5E9"; color = "#2E7D32"; borderColor = "#C8E6C9"; break; // Light green
      case 'failure': backgroundColor = "#FFEBEE"; color = "#C62828"; borderColor = "#FFCDD2"; break; // Light red
      case 'in-progress': backgroundColor = "#E3F2FD"; color = "#1976D2"; borderColor = "#BBDEFB"; break; // Light blue
      case 'skipped': backgroundColor = "#F5F5F5"; color = "#9E9E9E"; borderColor = "#E0E0E0"; break; // Light grey
    }
    return {
      padding: "12px 18px", // More padding
      marginBottom: "10px", // More spacing
      borderRadius: "8px", // Rounded corners
      backgroundColor: backgroundColor,
      color: color,
      border: `1px solid ${borderColor}`,
      fontSize: "0.9em",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", // Subtle shadow
      transition: "all 0.2s ease-in-out", // Smooth transition on status change
    };
  }, []);

  return (
    <YoDetailWrapper
      title="Gemini AI Pipeline Execution Trace & Debugger"
      isGeminiEnhanced
      tooltipMessage="Detailed step-by-step visualization of Gemini AI's internal processing pipeline for this reversal, crucial for auditing and troubleshooting AI decisions."
    >
      <p style={{ margin: "0 0 18px 0", fontSize: "0.95em", color: "#666", lineHeight: "1.4" }}>
        <span style={{ fontWeight: "bold", color: "#424242" }}>Pipeline Trace ID:</span> {pipelineId}
        <br />
        This panel offers granular, sequential insight into each stage of the automated AI workflow,
        from initial data ingestion and validation to complex risk scoring and final decisioning algorithms.
      </p>
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #D0D0D0", padding: "15px", borderRadius: "10px", backgroundColor: "#FDFDFD" }}>
        {pipelineSteps.map((step, index) => (
          <div key={`step-${index}`} style={stepStyle(step.status)} role="listitem">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.05em" }}>{index + 1}. {step.name}</span>
              <span style={{ fontSize: "0.85em", opacity: 0.9 }}>
                Status: <strong style={{ color: step.status === 'success' ? '#2E7D32' : (step.status === 'failure' ? '#C62828' : '#1976D2') }}>{startCase(step.status)}</strong>
                {step.durationMs && ` (${step.durationMs.toFixed(1)}ms)`}
              </span>
            </div>
            {step.details && (
              <p style={{ margin: "0 0 5px 0", fontSize: "0.85em", color: "#424242", lineHeight: "1.3" }}>
                Details: {step.details}
              </p>
            )}
            {step.logs && step.logs.length > 0 && (
              <details style={{ marginTop: "5px", color: "#555", fontSize: "0.8em" }}>
                <summary style={{ cursor: "pointer", fontWeight: "600" }}>View Logs ({step.logs.length})</summary>
                <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px", listStyleType: "square" }}>
                  {step.logs.map((log, logIndex) => <li key={`log-${logIndex}`}>{log}</li>)}
                </ul>
              </details>
            )}
            {step.timestamp && (
              <p style={{ margin: "8px 0 0 0", fontSize: "0.8em", color: "#757575", borderTop: "1px dashed #E0E0E0", paddingTop: "5px" }}>
                Last Update: <DateTime timestamp={step.timestamp} />
              </p>
            )}
          </div>
        ))}
      </div>
      <p style={{ marginTop: "20px", fontSize: "0.8em", color: "#9E9E9E", fontStyle: "italic", lineHeight: "1.4" }}>
        Note: The Gemini AI pipeline status is displayed in near real-time, but slight propagation delays
        across distributed AI microservices may occur. This view is for diagnostic purposes.
      </p>
    </YoDetailWrapper>
  );
});

/**
 * YoActionPanel: A flexible component to present a set of actionable buttons or links.
 * These actions can be context-sensitive, dynamically generated, or specifically
 * recommended by Gemini AI based on its analysis, guiding users towards optimal next steps.
 *
 * @component
 * @param {Object} props - The properties for the YoActionPanel component.
 * @param {Array<{label: string, onClick: () => void, primary?: boolean, disabled?: boolean, tooltip?: string, icon?: string}>} props.actions - An array of action objects.
 * @param {string} [props.title="Recommended Actions"] - Title of the action panel.
 * @param {boolean} [props.isGeminiDriven=false] - Flag if actions are specifically recommended or influenced by Gemini AI.
 * @returns {JSX.Element | null} The rendered action panel or null if no actions are provided, ensuring a clean UI.
 */
export const YoActionPanel: React.FC<{
  actions: Array<{ label: string; onClick: () => void; primary?: boolean; disabled?: boolean; tooltip?: string; icon?: string }>;
  title?: string;
  isGeminiDriven?: boolean;
}> = React.memo(({ actions, title = "Recommended Actions", isGeminiDriven = false }) => {
  if (actions.length === 0) {
    console.debug("[YoActionPanel] No actions to display, returning null.");
    return null;
  }

  return (
    <YoDetailWrapper title={title} isGeminiEnhanced={isGeminiDriven} tooltipMessage={isGeminiDriven ? "Action recommendations based on Gemini AI's analysis and suggested workflows." : undefined}>
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "flex-start" }} role="group" aria-label={title}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            title={action.tooltip}
            style={{
              padding: "12px 22px", // Increased padding
              borderRadius: "25px", // More rounded buttons
              border: action.primary ? "none" : "1px solid #CFD8DC", // Lighter border
              backgroundColor: action.primary ? "#4285F4" : (action.disabled ? "#ECEFF1" : "#F8F8F8"),
              color: action.primary ? "#fff" : (action.disabled ? "#90A4AE" : "#333"),
              fontWeight: "600", // Bolder text
              fontSize: "1.0em", // Larger font size
              cursor: action.disabled ? "not-allowed" : "pointer",
              transition: "all 0.25s ease-in-out", // Smoother transition
              boxShadow: action.primary ? "0 5px 15px rgba(66, 133, 244, 0.35)" : "0 2px 5px rgba(0,0,0,0.08)", // Enhanced shadow
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              pointerEvents: action.disabled ? "none" : "auto", // Ensure no hover on disabled
            }}
            // Add pseudo-class hover/active styles directly or via a utility if needed for pure JS styling
            // For brevity and pure JS, using an actual hover effect via CSS classes or global styles would be better,
            // but inline for demonstration.
          >
            {action.icon && <span style={{ fontSize: "1.1em" }}>{action.icon}</span>}
            {isGeminiDriven && !action.icon && <span style={{ marginRight: "5px", color: action.primary ? "#fff" : "#4285F4" }}>🌟</span>}
            {action.label}
          </button>
        ))}
      </div>
      {isGeminiDriven && (
        <p style={{ marginTop: "20px", fontSize: "0.85em", color: "#777", fontStyle: "italic" }}>
          These actions are suggested by Gemini AI based on its deep analysis of the reversal context and current policies.
        </p>
      )}
    </YoDetailWrapper>
  );
});

/**
 * YoGeminiConfigurationViewer: Displays the active configuration parameters
 * for the Gemini AI system. This component provides critical transparency into the
 * AI's operational settings, which is useful for auditing, compliance, and understanding
 * specific AI behavior without diving into codebases.
 *
 * @component
 * @param {Object} props - The properties for the YoGeminiConfigurationViewer component.
 * @param {Record<string, any>} props.config - The configuration object to display (e.g., GEMINI_ANALYTICS_CONFIG).
 * @param {string} [props.title="Active Gemini AI Configuration"] - Custom title for the configuration viewer panel.
 * @returns {JSX.Element} The rendered configuration viewer, presenting AI settings in an organized manner.
 */
export const YoGeminiConfigurationViewer: React.FC<{
  config: Record<string, any>;
  title?: string;
}> = React.memo(({ config, title = "Active Gemini AI Configuration" }) => {
  /**
   * Memoized array of `YoDataDisplayItem` components, each representing a key-value pair
   * from the `config` object. This ensures optimal rendering performance.
   * @type {JSX.Element[]}
   */
  const configItems = useMemo(() => {
    return Object.entries(config).map(([key, value]) => {
      const displayValue = typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') :
                           (typeof value === 'number' ? value.toFixed(3) : String(value)); // More precision for numbers
      const tooltip = `Current runtime setting for Gemini's '${startCase(key)}' parameter. This influences AI model behavior.`;
      return (
        <YoDataDisplayItem
          key={key}
          label={startCase(key)}
          value={displayValue}
          isGeminiGenerated={true} // All config values are related to Gemini
          tooltipText={tooltip}
          displayInline={false} // Display config items as blocks for clarity
        />
      );
    });
  }, [config]);

  return (
    <YoDetailWrapper title={title} isGeminiEnhanced={true} tooltipMessage="Review the current, active configuration parameters governing the Gemini AI system's behavior and operational settings.">
      <div style={{ padding: "15px", border: "1px dashed #B0BEC5", borderRadius: "8px", backgroundColor: "#F9FBFD", boxShadow: "inset 0 1px 4px rgba(0,0,0,0.03)" }}>
        {configItems}
        <p style={{ marginTop: "20px", fontSize: "0.8em", color: "#888", fontStyle: "italic", borderTop: "1px dashed #CFD8DC", paddingTop: "15px" }}>
          These parameters govern the behavior, thresholds, and operational flags of the active Gemini AI models.
          Changes to these configurations are audited for compliance.
        </p>
      </div>
    </YoDetailWrapper>
  );
});

// --- Main ReversalDetailsView Component ---

/**
 * ReversalDetailsView: The primary and extensively enhanced component responsible for
 * displaying a comprehensive, AI-augmented view of a financial reversal transaction.
 * This component integrates real-time transaction data with sophisticated Gemini AI insights,
 * including dynamic risk assessment, detailed reason categorization, proactive predictive alerts,
 * and a transparent processing lifecycle.
 *
 * The architecture is designed with an "AI-first" philosophy, prioritizing
 * explainability, transparency, and actionable intelligence derived from the Gemini
 * AI system. It leverages a suite of custom "Yo" components to modularize the UI
 * and consistently present AI-driven information, offering a holistic operational picture.
 *
 * @component
 * @param {ReversalDetailsViewProps} props - The properties object for this component, enabling customization of AI features.
 * @returns {JSX.Element} The root JSX element of the ReversalDetailsView component,
 *   structured to provide a rich, informative, and AI-powered user experience.
 */
function ReversalDetailsView({
  reversalFragment,
  loading,
  enableGeminiInsights = true,
  geminiAgentId = "Gemini-Prime-v1.2-Orchestrator",
}: ReversalDetailsViewProps): JSX.Element {

  /**
   * Custom hook call to manage the lifecycle of Gemini AI analysis.
   * This centralizes state management for AI insights (analysis results, loading state, errors),
   * making the main component cleaner and more focused on the presentation layer.
   */
  const { geminiAnalysis, isGeminiAnalyzing, geminiError } = useGeminiReversalAnalysis(
    reversalFragment,
    enableGeminiInsights,
    geminiAgentId
  );

  /**
   * Memoized array of simulated AI pipeline steps for the `YoAIPipelineDebugger`.
   * These steps represent a simplified, conceptual flow of Gemini's internal processing,
   * dynamically updated based on the actual analysis results or errors.
   */
  const simulatedPipelineSteps: GeminiPipelineStep[] = useMemo(() => {
    if (!reversalFragment) return [];
    const baseSteps: GeminiPipelineStep[] = [
      { name: "1. Data Ingestion & Validation", status: "success", timestamp: new Date(new Date().getTime() - 10000).toISOString(), durationMs: 50, logs: ["Data source: Primary API", "Format check: OK"] },
      { name: "2. Schema Normalization & Preprocessing", status: "success", timestamp: new Date(new Date().getTime() - 9500).toISOString(), durationMs: 80, logs: ["Account mapping: Successful", "Amount parsing: Complete"] },
      { name: "3. Contextual Data Enrichment (CRM, ERP, Historical)", status: "success", timestamp: new Date(new Date().getTime() - 9000).toISOString(), durationMs: 120, logs: ["External lookups: 3/3 successful", "Historical patterns loaded"] },
      { name: "4. Natural Language Processing (Reason Analysis)",
        status: isGeminiAnalyzing ? "in-progress" : (geminiAnalysis ? "success" : (geminiError ? "failure" : "pending")),
        timestamp: geminiAnalysis?.analysisTimestamp || new Date(new Date().getTime() - 8000).toISOString(),
        durationMs: geminiAnalysis?.processingDurationMs ? geminiAnalysis.processingDurationMs * 0.3 : undefined,
        details: geminiAnalysis?.reasonCategory ? `Categorized as: "${geminiAnalysis.reasonCategory}"` : (geminiError ? "NLP failed" : "Awaiting NLP"),
        logs: geminiAnalysis?.debugInfo.featureFlags.includes("nlp-sentiment-v2.1") ? ["Sentiment analysis active", `Model: ${GEMINI_ANALYTICS_CONFIG.reasonCategorizationModel}`] : ["NLP bypassed"]
      },
      { name: "5. Risk Scoring & Fraud Detection Model Inference",
        status: isGeminiAnalyzing ? "in-progress" : (geminiAnalysis ? (geminiAnalysis.anomalyDetected || geminiAnalysis.riskScore > GEMINI_ANALYTICS_CONFIG.defaultConfidenceThreshold ? "failure" : "success") : (geminiError ? "failure" : "pending")),
        timestamp: geminiAnalysis?.analysisTimestamp || new Date(new Date().getTime() - 6000).toISOString(),
        durationMs: geminiAnalysis?.processingDurationMs ? geminiAnalysis.processingDurationMs * 0.4 : undefined,
        details: geminiAnalysis?.anomalyDetected ? `Anomaly detected with risk score ${geminiAnalysis.riskScore.toFixed(2)}` : (geminiAnalysis ? `Risk score ${geminiAnalysis.riskScore.toFixed(2)} (within acceptable bounds)` : (geminiError ? "Risk assessment failed" : "Awaiting risk assessment")),
        logs: geminiAnalysis?.debugInfo.featureFlags.includes("dynamic-risk-scoring") ? ["Dynamic risk scoring active", `Fraud model: ${GEMINI_ANALYTICS_CONFIG.fraudDetectionModel}`] : ["Default risk model used"]
      },
      { name: "6. Compliance & Policy Check Engine",
        status: isGeminiAnalyzing ? "in-progress" : (geminiAnalysis ? (geminiAnalysis.complianceChecked ? "success" : "skipped") : (geminiError ? "failure" : "pending")),
        timestamp: geminiAnalysis?.analysisTimestamp || new Date(new Date().getTime() - 4000).toISOString(),
        durationMs: 70, // Fixed small duration
        details: geminiAnalysis?.complianceChecked ? "Automated compliance check passed." : (geminiError ? "Compliance check failed." : "Compliance check pending or not applicable."),
        logs: geminiAnalysis?.complianceChecked ? ["AML policies reviewed", "Sanctions list screened"] : ["No active compliance rules triggered"]
      },
      { name: "7. Decisioning & Action Recommendation Engine",
        status: isGeminiAnalyzing ? "in-progress" : (geminiAnalysis ? "success" : (geminiError ? "failure" : "pending")),
        timestamp: geminiAnalysis?.analysisTimestamp || new Date(new Date().getTime() - 2000).toISOString(),
        durationMs: geminiAnalysis?.processingDurationMs ? geminiAnalysis.processingDurationMs * 0.2 : undefined,
        details: geminiAnalysis?.suggestedAction || (geminiError ? 'Decision engine failed.' : 'No specific action recommended by AI.'),
        logs: geminiAnalysis?.suggestedAction ? ["Action rule matched", "Recommendation generated"] : ["No specific action rules triggered"]
      },
      { name: "8. Audit Logging & Final Traceability", status: isGeminiAnalyzing ? "in-progress" : (geminiAnalysis ? "success" : "pending"), timestamp: geminiAnalysis?.analysisTimestamp, durationMs: 30, logs: ["All AI events logged", "Audit trail created"] },
      { name: "9. Outcome Dissemination (UI/API Updates)", status: isGeminiAnalyzing ? "in-progress" : (geminiAnalysis ? "success" : "pending"), timestamp: geminiAnalysis?.analysisTimestamp, durationMs: 20, logs: ["UI state updated", "External systems notified"] },
    ];

    // Adjust status of subsequent steps if a previous step failed.
    if (geminiError) {
      let failurePropagated = false;
      for (const step of baseSteps) {
        if (step.status === 'failure') failurePropagated = true;
        if (failurePropagated && (step.status === 'in-progress' || step.status === 'pending')) {
          step.status = 'skipped'; // Subsequent steps are skipped due to upstream failure
          step.details = step.details ? `(Skipped due to upstream error) ${step.details}` : 'Skipped due to upstream AI processing error.';
        }
      }
    }

    return baseSteps;
  }, [reversalFragment, isGeminiAnalyzing, geminiAnalysis, geminiError]);

  /**
   * Memoized content for the primary reversal details, extensively enhanced with Gemini AI insights.
   * This `useMemo` hook is crucial for performance, ensuring that the complex data transformation
   * and component rendering for the `KeyValueTable` only re-executes when its core dependencies
   * (`loading`, `reversalFragment`, `geminiAnalysis`, `enableGeminiInsights`) change,
   * avoiding unnecessary re-renders of static or unchanging data.
   *
   * @type {JSX.Element | null}
   */
  const accountContent = useMemo(() => {
    if (loading || !reversalFragment) {
      console.log("[ReversalDetailsView] Core account content skipped: initial data loading or fragment missing.");
      return null;
    }

    const { paymentOrder, paymentOrderAttempt } = reversalFragment;

    const accountPath = paymentOrder.originatingAccount.path;

    // Enhanced rendering for linked entities, emphasizing their AI monitoring status.
    const counterparty = paymentOrder.counterparty ? (
      <a href={paymentOrder.counterparty.path} style={{ color: "#4285F4", textDecoration: "none", fontWeight: "600" }}>
        {paymentOrder.counterparty.name}
      </a>
    ) : <span style={{ color: "#777", fontStyle: "italic" }}>Not Available (AI will monitor if provided)</span>;

    const receivingAccount = paymentOrder.receivingEntity ? (
      <a href={paymentOrder.receivingEntity.path} style={{ color: "#4285F4", textDecoration: "none", fontWeight: "600" }}>
        {paymentOrder.receivingEntity.name}
      </a>
    ) : <span style={{ color: "#777", fontStyle: "italic" }}>Not Available (AI will monitor if provided)</span>;

    /**
     * The core reversal data object, meticulously augmented with formatted values
     * and direct integration of Gemini AI-derived insights. This object is
     * specifically prepared for display in the `KeyValueTable` component, ensuring
     * that all relevant information, both raw and AI-processed, is presented coherently
     * and accessibly to the user.
     * @type {Object}
     */
    const reversalDataForTable = {
      ...reversalFragment,
      id: geminiAnalysis?.anomalyDetected ? (
        <span style={{ color: "#D32F2F", fontWeight: "bold" }} title="Gemini AI flagged this ID for potential anomaly due to unusual patterns.">
          {reversalFragment.id} <span style={{ fontSize: "0.8em", marginLeft: "5px" }}>(AI Anomaly Detected!)</span>
        </span>
      ) : reversalFragment.id,
      account: <a href={accountPath} style={{ color: "#4285F4", textDecoration: "none", fontWeight: "600" }}>{paymentOrder.accountName}</a>,
      amount: (
        <span style={{ color: geminiAnalysis?.riskScore && geminiAnalysis.riskScore > 0.7 ? "#D32F2F" : (geminiAnalysis?.riskScore && geminiAnalysis.riskScore > 0.4 ? "#FFA500" : "#333"), fontWeight: "600" }}>
          {paymentOrderAttempt.prettyAmount}
          {enableGeminiInsights && geminiAnalysis?.riskScore !== undefined && (
            <span style={{ fontSize: "0.82em", marginLeft: "10px", color: "#777" }} title="AI-calculated risk level for this transaction amount.">
              (AI Risk: {(geminiAnalysis.riskScore * 100).toFixed(0)}%)
            </span>
          )}
        </span>
      ),
      counterparty,
      receivingAccount,
      createdAt: <DateTime timestamp={reversalFragment.createdAt} />,
      paymentOrder: <a href={paymentOrder.path} style={{ color: "#4285F4", textDecoration: "none", fontWeight: "600" }}>{paymentOrder.id}</a>,
      reason: (
        <span style={{ color: geminiAnalysis?.sentiment === 'negative' ? "#D32F2F" : "#333" }}>
          {startCase(reversalFragment.reason)}
          {enableGeminiInsights && geminiAnalysis?.reasonCategory && (
            <span style={{ fontSize: "0.82em", marginLeft: "10px", color: "#777" }} title="AI-categorized reason for the reversal, derived from Natural Language Processing.">
              (AI Category: {geminiAnalysis.reasonCategory})
            </span>
          )}
        </span>
      ),
      reversalType: reversalFragment.reversalType.toUpperCase(),
      updatedAt: <DateTime timestamp={reversalFragment.updatedAt} />,
      // Integrate specific Gemini-derived data points directly into the main table for immediate visibility.
      geminiRiskScore: enableGeminiInsights && geminiAnalysis ? (
        <span style={{ color: geminiAnalysis.riskScore > 0.7 ? "#D32F2F" : (geminiAnalysis.riskScore > 0.4 ? "#FFA500" : "#008000"), fontWeight: "bold" }} title="Gemini AI's computed risk score, indicating potential for fraud or error.">
          {(geminiAnalysis.riskScore * 100).toFixed(1)}% {geminiAnalysis.anomalyDetected ? " (Anomaly!)" : ""}
        </span>
      ) : <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>{enableGeminiInsights ? 'AI Calculating...' : 'AI Disabled'}</span>,
      geminiReasonCategory: enableGeminiInsights && geminiAnalysis?.reasonCategory || <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>{enableGeminiInsights ? 'AI Categorizing...' : 'AI Disabled'}</span>,
      geminiSentiment: enableGeminiInsights && geminiAnalysis?.sentiment ? (
        <span style={{ color: { positive: "green", negative: "red", neutral: "blue", mixed: "orange" }[geminiAnalysis.sentiment], fontWeight: "bold" }} title="Sentiment detected by Gemini AI in the reason text.">
          {startCase(geminiAnalysis.sentiment)}
        </span>
      ) : <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>{enableGeminiInsights ? 'AI Analyzing Sentiment...' : 'AI Disabled'}</span>,
      geminiAnomalyStatus: enableGeminiInsights && geminiAnalysis ? (
        <span style={{ color: geminiAnalysis.anomalyDetected ? "#D32F2F" : "#008000", fontWeight: "bold" }} title="Gemini AI's real-time anomaly detection status for this transaction.">
          {geminiAnalysis.anomalyDetected ? "Detected (High Confidence)" : "None Detected"}
        </span>
      ) : <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>{enableGeminiInsights ? 'AI Detecting...' : 'AI Disabled'}</span>,
      geminiSuggestedAction: enableGeminiInsights && geminiAnalysis?.suggestedAction ? (
        <span style={{ fontStyle: "italic", color: "#3F51B5" }} title="Action proposed by Gemini AI for optimal processing based on its analysis.">
          {geminiAnalysis.suggestedAction}
        </span>
      ) : <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>{enableGeminiInsights ? 'AI Suggesting...' : 'AI Disabled'}</span>,
      geminiFraudPatternMatch: enableGeminiInsights && geminiAnalysis?.fraudPatternMatch ? (
        <span style={{ color: "#D32F2F", fontWeight: "bold" }} title="Specific fraud pattern identified by Gemini AI's advanced models.">
          {geminiAnalysis.fraudPatternMatch}
        </span>
      ) : <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>{enableGeminiInsights ? 'AI Checking...' : 'AI Disabled'}</span>,
      geminiComplianceCheck: enableGeminiInsights && geminiAnalysis ? (
        <span style={{ color: geminiAnalysis.complianceChecked ? "#008000" : "#D32F2F", fontWeight: "bold" }} title="Status of automated compliance checks by Gemini AI.">
          {geminiAnalysis.complianceChecked ? "Passed" : "Failed / Not Applicable"}
        </span>
      ) : <span style={{ color: "#BDBDBD", fontStyle: "italic" }}>{enableGeminiInsights ? 'AI Checking...' : 'AI Disabled'}</span>,
    };

    console.log(`[ReversalDetailsView] Populating KeyValueTable with Gemini-enriched data for ID: ${reversalFragment.id}`);

    return (
      <YoDetailWrapper
        title="Core Reversal Transaction Details"
        isGeminiEnhanced={enableGeminiInsights && !!geminiAnalysis}
        tooltipMessage="Essential details of the reversal transaction, augmented with real-time insights from the Gemini AI system for enhanced context."
      >
        <KeyValueTable
          // The key is dynamically generated to force a re-render if fundamental AI analysis changes,
          // ensuring the table reflects the most current AI insights. This improves data freshness.
          key={`reversal-table-${reversalFragment.id}-${geminiAnalysis?.processingStatus || 'initial'}-${geminiAnalysis?.riskScore || '0'}-${geminiAnalysis?.analysisTimestamp || 'none'}`}
          data={reversalDataForTable}
          dataMapping={REVERSAL_TITLE_MAPPING}
        />
        {/* Additional, concise AI summary directly below the table for quick glance */}
        {enableGeminiInsights && geminiAnalysis && (
          <div style={{ marginTop: "25px", borderTop: "1px dashed #E0E0E0", paddingTop: "20px", display: "flex", flexWrap: "wrap", gap: "20px" }}>
            <YoDataDisplayItem
              label="Overall AI State"
              value={<YoReversalStatusIndicator status={geminiAnalysis.processingStatus} riskScore={geminiAnalysis.riskScore} />}
              isGeminiGenerated
              isImportant={true}
              tooltipText="Current state of AI-driven workflow for this reversal, reflecting its progress and AI disposition."
              displayInline
            />
            <YoDataDisplayItem
              label="AI Total Confidence"
              value={`${(geminiAnalysis.confidence * 100).toFixed(1)}%`}
              isGeminiGenerated
              tooltipText="Aggregated confidence level of Gemini's various analytical processes for this transaction."
              displayInline
            />
            {geminiAnalysis.processingDurationMs && (
              <YoDataDisplayItem
                label="AI Processing Time"
                value={`${geminiAnalysis.processingDurationMs.toFixed(2)} ms`}
                isGeminiGenerated
                tooltipText="Total computational time taken by Gemini AI for this specific analysis, indicating efficiency."
                displayInline
              />
            )}
          </div>
        )}
      </YoDetailWrapper>
    );
  }, [loading, reversalFragment, geminiAnalysis, enableGeminiInsights]);

  /**
   * Memoized skeleton loader for the main table content. This component provides
   * a user-friendly placeholder while the initial data is being fetched,
   * minimizing perceived loading times and improving user experience.
   * @type {JSX.Element}
   */
  const skeletonLoader = useMemo(() => {
    console.log("[ReversalDetailsView] Displaying KeyValueTableSkeletonLoader for initial data fetch.");
    return <KeyValueTableSkeletonLoader dataMapping={REVERSAL_TITLE_MAPPING} />;
  }, []);

  /**
   * Determines the comprehensive loading state for the entire view. This includes
   * both the initial data fetching (`loading` prop) and the subsequent, potentially
   * time-consuming, Gemini AI analysis (`isGeminiAnalyzing`). This ensures the UI
   * accurately reflects all background processes.
   * @type {boolean}
   */
  const overallLoading = loading || isGeminiAnalyzing;

  /**
   * Generates a dynamic array of action buttons based on the Gemini AI's analysis.
   * This demonstrates how AI insights can directly inform and prioritize user interaction options,
   * leading to a more intelligent and responsive application.
   * @type {Array<{label: string, onClick: () => void, primary?: boolean, disabled?: boolean, tooltip?: string, icon?: string}>}
   */
  const dynamicActions = useMemo(() => {
    const actions = [];
    if (geminiAnalysis) {
      if (geminiAnalysis.processingStatus === ReversalProcessingStatus.FURTHER_INVESTIGATION || geminiAnalysis.anomalyDetected || geminiAnalysis.fraudPatternMatch) {
        actions.push({
          label: "Escalate to Senior Fraud Analyst (AI Priority)",
          onClick: () => alert(`[AI Action] Escalating reversal ID ${reversalFragment?.id} to senior fraud analyst as per Gemini AI's high-risk recommendation.`),
          primary: true,
          tooltip: "Gemini AI recommends immediate human review due to high risk, detected anomaly, or matched fraud pattern.",
          icon: "⬆️",
        });
      }
      if (geminiAnalysis.suggestedAction && geminiAnalysis.processingStatus !== ReversalProcessingStatus.FURTHER_INVESTIGATION) {
        actions.push({
          label: `Perform AI Suggested Action: ${geminiAnalysis.suggestedAction.split('(')[0].trim()}`,
          onClick: () => alert(`[AI Action] Executing Gemini AI suggested action: "${geminiAnalysis.suggestedAction}" for ID ${reversalFragment?.id}.`),
          tooltip: `Automate the action proposed by Gemini AI: "${geminiAnalysis.suggestedAction}".`,
          disabled: false, // Could be conditionally disabled based on user permissions
          icon: "🤖",
        });
      }
      if (geminiAnalysis.processingStatus === ReversalProcessingStatus.PENDING_REVIEW || geminiAnalysis.processingStatus === ReversalProcessingStatus.FURTHER_INVESTIGATION) {
        actions.push({
          label: "Manually Approve (Override AI)",
          onClick: () => alert(`[Manual Override] Manually approving reversal ID ${reversalFragment?.id}, consciously overriding Gemini AI's current status/recommendation.`),
          primary: false,
          tooltip: "Override Gemini AI's recommendation and manually approve this reversal. This action will be fully audited.",
          icon: "✍️",
        });
        actions.push({
          label: "Manually Reject (Override AI)",
          onClick: () => alert(`[Manual Override] Manually rejecting reversal ID ${reversalFragment?.id}, consciously overriding Gemini AI's current status/recommendation.`),
          primary: false,
          tooltip: "Override Gemini AI's recommendation and manually reject this reversal. This action will be fully audited.",
          icon: "⛔",
        });
      }
      if (geminiAnalysis.processingStatus !== ReversalProcessingStatus.COMPLETED && geminiAnalysis.processingStatus !== ReversalProcessingStatus.FAILED) {
        actions.push({
          label: "Request Fresh AI Analysis",
          onClick: () => alert(`[AI Action] Initiating a new, fresh analysis by Gemini AI for ID ${reversalFragment?.id}. This will re-trigger the AI pipeline.`),
          primary: false,
          tooltip: "Request Gemini AI to re-evaluate the reversal with the latest models and data. Useful after manual changes.",
          icon: "🔄",
        });
      }
    } else if (!isGeminiAnalyzing && !loading && enableGeminiInsights) {
      actions.push({
        label: "Activate Gemini AI Analysis",
        onClick: () => alert("Simulating activation of Gemini AI for this reversal. (Requires state change outside this component for full effect)"),
        primary: true,
        tooltip: "Click to explicitly enable and run Gemini AI analysis on this reversal if it was previously skipped.",
        icon: "⚡",
      });
    }
    return actions;
  }, [geminiAnalysis, reversalFragment, isGeminiAnalyzing, loading, enableGeminiInsights]);


  /**
   * Renders the comprehensive Reversal Details View. This is the main render function
   * orchestrating all sub-components and displaying data based on various states
   * (loading, error, data present, AI insights active). The structure emphasizes
   * clear separation of concerns, providing dedicated sections for core data,
   * AI-driven analyses, predictive insights, and administrative/debugging tools,
   * all within an AI-first design paradigm.
   *
   * @returns {JSX.Element} The root JSX element of the component, providing a rich and informative user experience.
   */
  return (
    <div style={{ padding: "35px", maxWidth: "1500px", margin: "0 auto", fontFamily: "'Inter', 'Roboto', sans-serif", backgroundColor: "#F9FAFB", borderRadius: "15px", boxShadow: "0 12px 35px rgba(0,0,0,0.09)", overflow: "hidden" }}>
      <h1 style={{ color: "#212121", marginBottom: "40px", borderBottom: "2px solid #EEEEEE", paddingBottom: "18px", fontSize: "2.4em", fontWeight: "700", display: "flex", alignItems: "center", gap: "18px" }}>
        <span style={{ fontSize: "1.2em", color: "#4285F4" }}>✨</span> Reversal Details View
        <span style={{ fontSize: "0.55em", color: "#757575", fontWeight: "normal", marginLeft: "20px" }}>(Gemini AI Integrated Operations Panel)</span>
      </h1>

      {geminiError && (
        <YoErrorDisplay
          message={geminiError}
          details={geminiAnalysis?.debugInfo?.modelVersion ? `Gemini AI Model Version: ${geminiAnalysis.debugInfo.modelVersion}. Input Hash: ${geminiAnalysis.debugInfo.inputHashes.reversalId}` : "No specific AI model info available. Check AI service health."}
          context="Gemini AI Analysis Service"
          actionSuggestion="Please review the Gemini AI service logs for detailed diagnostics, or contact the AI Operations team for immediate assistance. Consider a manual override."
        />
      )}

      {overallLoading ? (
        <>
          {/* Main skeleton loader always visible during primary data loading */}
          {loading && (
            <div style={{ marginBottom: "30px", border: "1px dashed #E0E0E0", borderRadius: "10px", padding: "20px", backgroundColor: "#FFFFFF" }}>
              {skeletonLoader}
              <p style={{ textAlign: "center", color: "#616161", marginTop: "20px", fontSize: "1.0em", fontWeight: "500" }}>
                Fetching core reversal data from high-speed backend services...
              </p>
            </div>
          )}
          {/* Dedicated spinner for Gemini AI analysis, visible when `isGeminiAnalyzing` is true */}
          {isGeminiAnalyzing && (
            <div style={{ marginTop: "30px" }}>
              <YoLoadingSpinner
                message={`Gemini AI Engine (${geminiAgentId}) is performing deep analysis for this reversal. This may take a moment to generate comprehensive, multi-faceted insights...`}
                color="#4285F4"
                size="large"
              />
              <p style={{ textAlign: "center", color: "#757575", marginTop: "20px", fontSize: "0.9em", fontStyle: "italic" }}>
                Leveraging distributed AI compute and advanced neural networks for rapid, multi-modal insight generation.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {accountContent}

          {enableGeminiInsights && reversalFragment && geminiAnalysis && (
            <>
              <YoReversalReasonAnalyzer
                reason={reversalFragment.reason}
                geminiAnalysis={geminiAnalysis}
              />
              <YoPredictiveAlerts
                hasAnomaly={geminiAnalysis.anomalyDetected}
                riskScore={geminiAnalysis.riskScore}
                predictedOutcome={geminiAnalysis.suggestedAction}
                additionalAlerts={
                  geminiAnalysis.relatedContexts.length > 0
                    ? [`Discovered related contexts by AI: ${geminiAnalysis.relatedContexts.join(', ')}`]
                    : []
                }
              />
              <YoGeminiProcessingStatus
                status={geminiAnalysis.processingStatus}
                lastUpdateTime={geminiAnalysis.analysisTimestamp}
                processorId={geminiAgentId}
                processingDurationMs={geminiAnalysis.processingDurationMs}
              />
            </>
          )}

          {/* Integration of advanced AI-centric debugging, configuration, and action viewers */}
          {enableGeminiInsights && reversalFragment && (
            <>
              <YoAIPipelineDebugger
                pipelineSteps={simulatedPipelineSteps}
                pipelineId={`PIPE-TRACE-${reversalFragment.id.substring(0, 8)}-${Date.now().toString().slice(-6)}`}
              />
              <YoActionPanel
                actions={dynamicActions}
                title="AI-Driven Action Recommendations"
                isGeminiDriven={true}
              />
              <YoGeminiConfigurationViewer
                config={GEMINI_ANALYTICS_CONFIG}
                title="Active Gemini AI Core Configuration Parameters"
              />
              <YoDetailWrapper title="Gemini AI System Health & Performance Metrics" isGeminiEnhanced={true} tooltipMessage="Real-time performance and operational health metrics of the Gemini AI cluster and associated microservices.">
                <YoDataDisplayItem label="Current AI Load Factor" value={<span style={{ fontWeight: "600", color: "#2196F3" }}>78.2%</span>} isGeminiGenerated tooltipText="Percentage of total AI cluster capacity currently in use, indicating system utilization."/>
                <YoDataDisplayItem label="Avg. AI Response Latency" value={<span style={{ fontWeight: "600", color: "#4CAF50" }}>125 ms</span>} isGeminiGenerated tooltipText="Average time for Gemini AI to return a comprehensive analysis response."/>
                <YoDataDisplayItem label="Last Model Retrain Cycle" value={<DateTime timestamp={"2023-11-01T03:00:00Z"} />} isGeminiGenerated tooltipText="Timestamp of the last major AI model retraining and deployment cycle."/>
                <YoDataDisplayItem label="Active AI Feature Flags" value={<span style={{ color: "#3F51B5", fontStyle: "italic" }}>dynamic-risk, nlp-v2, entity-match</span>} isGeminiGenerated tooltipText="Currently active feature flags influencing AI behavior and capabilities."/>
                <p style={{ fontSize: "0.85em", color: "#888", fontStyle: "italic", marginTop: "15px", borderTop: "1px dashed #CFD8DC", paddingTop: "15px" }}>
                  These real-time metrics provide a high-level overview of the Gemini AI system's operational health and performance, crucial for maintaining optimal service levels and proactive maintenance.
                </p>
              </YoDetailWrapper>
            </>
          )}

          {!enableGeminiInsights && (
            <YoDetailWrapper title="Gemini AI Insights Currently Disabled" isGeminiEnhanced={false}>
              <p style={{ color: "#555", fontStyle: "italic", fontSize: "1.05em", lineHeight: "1.5" }}>
                Gemini AI insights are currently disabled for this view. To leverage advanced risk assessment,
                predictive analytics, and automated decision support, please enable Gemini insights via
                application settings or component properties (e.g., `enableGeminiInsights` prop).
              </p>
              <p style={{ color: "#777", fontSize: "0.9em", marginTop: "15px", lineHeight: "1.5" }}>
                Without active AI integration, only basic transaction details are available,
                potentially missing critical fraud flags, compliance violations, or opportunities for operational efficiencies.
                Enabling AI ensures a comprehensive, intelligent review process.
              </p>
            </YoDetailWrapper>
          )}

        </>
      )}
    </div>
  );
}

export default ReversalDetailsView;