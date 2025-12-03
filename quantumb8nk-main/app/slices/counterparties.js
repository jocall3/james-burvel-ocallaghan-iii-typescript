// This file manages the state and business logic for counterparty entities within the application.
// It leverages advanced techniques including simulated AI integration, robust state management,
// and best-in-class data handling practices to provide a comprehensive and highly performant
// counterparty management system.

import createEntitySlice from "../utilities/createEntitySlice";
import { createAsyncThunk } from "@reduxjs/toolkit"; // Assuming Redux Toolkit is available
import { selectAllEntities as selectAllCounterpartiesBase } from "../utilities/createEntitySlice"; // Assuming a helper for base selectors
import {
  simulateApiCall,
  simulateGeminiAIApiCall,
} from "../utilities/apiSimulator"; // Inventing a utility for API simulation

// --- 1. Constants and Enums for Counterparty Management ---

/**
 * @typedef {'PENDING'|'ACTIVE'|'INACTIVE'|'ARCHIVED'|'SUSPENDED'} CounterpartyStatus
 * @typedef {'INDIVIDUAL'|'ORGANIZATION'|'GOVERNMENT'|'PARTNERSHIP'|'CONSORTIUM'} CounterpartyType
 * @typedef {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} RiskLevel
 * @typedef {'APPROVED'|'REJECTED'|'PENDING_REVIEW'|'REQUESTED'|'ESCALATED'} ComplianceStatus
 * @typedef {'SALES'|'FINANCE'|'LEGAL'|'OPERATIONS'|'SUPPORT'|'HR'} Department
 * @typedef {'STRATEGIC_PARTNER'|'VENDOR'|'CLIENT'|'PROSPECT'|'INVESTOR'|'REGULATOR'} RelationshipType
 * @typedef {'CONTRACT_REVIEW'|'FINANCIAL_PREDICTION'|'RISK_MITIGATION'|'ENGAGEMENT_STRATEGY'|'SENTIMENT_ANALYSIS'|'ANOMALY_DETECTION'|'CATEGORIZATION'|'ENTITY_EXTRACTION'} AiTaskType
 */

/**
 * Defines various system-wide configuration parameters for counterparty processing.
 * These values are critical for maintaining consistency and configurability across the system.
 * @readonly
 * @enum {number|string}
 */
export const CounterpartyConfig = Object.freeze({
  DEFAULT_PAGE_SIZE: 25,
  MAX_RETRIES_AI_CALL: 3,
  RISK_THRESHOLD_HIGH: 0.75, // Score above this is High risk
  RISK_THRESHOLD_MEDIUM: 0.40, // Score above this is Medium risk
  COMPLIANCE_REVIEW_DAYS: 30, // Days until a compliance review is needed for 'APPROVED' status
  AI_PROCESSING_TIMEOUT_MS: 20000, // Max time for an AI call (increased for complex tasks)
  FINANCIAL_FORECAST_PERIOD_MONTHS: 12, // Default period for financial forecasts
  CONTRACT_REVIEW_SLA_HOURS: 48, // Service Level Agreement for contract review completion
});

/**
 * Defines the possible states of AI processing for a specific counterparty task or overall slice.
 * Essential for providing user feedback on long-running AI operations.
 * @readonly
 * @enum {string}
 */
export const AiProcessingState = Object.freeze({
  IDLE: "idle",
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
});

/**
 * Represents the detailed structure of a Counterparty entity.
 * This comprehensive interface supports robust type checking, detailed documentation,
 * and reflects the complexity of a commercial-grade counterparty management system
 * with advanced AI integration.
 * @typedef {object} Counterparty
 * @property {string} id - Unique identifier for the counterparty.
 * @property {string} name - The full legal name of the counterparty.
 * @property {CounterpartyType} type - The type of counterparty (e.g., 'ORGANIZATION').
 * @property {CounterpartyStatus} status - Current operational status of the counterparty.
 * @property {string} [description] - A brief description or overview.
 * @property {string} primaryContactId - ID of the primary contact person.
 * @property {object} address - Physical address details.
 * @property {string} address.street - Street address.
 * @property {string} address.city - City.
 * @property {string} address.state - State/Province.
 * @property {string} address.zipCode - Postal/ZIP code.
 * @property {string} address.country - Country.
 * @property {string} email - Primary email address.
 * @property {string} phone - Primary phone number.
 * @property {string} [website] - Official website URL.
 * @property {number} financialRating - An internal financial health rating (e.g., 1-5, 5 being best).
 * @property {RiskLevel} riskLevel - The assessed risk level. This is often AI-derived.
 * @property {string} assignedAccountId - The internal account manager or team responsible.
 * @property {string[]} tags - Categorization tags, often AI-suggested.
 * @property {RelationshipType[]} relationshipTypes - Types of relationships with the organization.
 * @property {object} compliance - Compliance status and detailed checks.
 * @property {ComplianceStatus} compliance.status - Current compliance status.
 * @property {string} [compliance.lastReviewDate] - Date of the last compliance review (ISO format).
 * @property {string} [compliance.nextReviewDate] - Date of the next scheduled compliance review (ISO format).
 * @property {string[]} [compliance.flags] - Compliance flags identified during audit (e.g., 'AML_RISK', 'GDPR_NON_COMPLIANT').
 * @property {object} [compliance.aiAuditDetails] - Detailed AI audit findings.
 * @property {object[]} historicalActivity - A log of key interactions and events.
 * @property {object} aiInsights - Comprehensive AI-generated insights across various domains.
 * @property {object} aiInsights.riskAssessment - Details from AI risk assessment.
 * @property {AiProcessingState} aiInsights.riskAssessment.status - AI processing status.
 * @property {number} [aiInsights.riskAssessment.score] - Numeric risk score (0-1).
 * @property {string[]} [aiInsights.riskAssessment.flags] - AI-identified risk flags.
 * @property {string} [aiInsights.riskAssessment.summary] - Summary of the risk assessment.
 * @property {object} aiInsights.engagementStrategy - AI-generated engagement strategy.
 * @property {AiProcessingState} aiInsights.engagementStrategy.status - AI processing status.
 * @property {string} [aiInsights.engagementStrategy.summary] - Summary of the strategy.
 * @property {string[]} [aiInsights.engagementStrategy.recommendations] - Specific recommendations.
 * @property {string} [aiInsights.engagementStrategy.primaryChannel] - Recommended primary communication channel.
 * @property {object} aiInsights.sentimentAnalysis - AI-driven sentiment analysis.
 * @property {AiProcessingState} aiInsights.sentimentAnalysis.status - AI processing status.
 * @property {number} [aiInsights.sentimentAnalysis.score] - Sentiment score (-1 to 1).
 * @property {string} [aiInsights.sentimentAnalysis.label] - E.g., 'Positive', 'Neutral', 'Negative'.
 * @property {object} aiInsights.categorization - AI-driven categorization.
 * @property {AiProcessingState} aiInsights.categorization.status - AI processing status.
 * @property {string[]} [aiInsights.categorization.categories] - List of suggested categories/tags.
 * @property {object} aiInsights.financialForecast - AI-driven financial projection.
 * @property {AiProcessingState} aiInsights.financialForecast.status - AI processing status.
 * @property {object[]} [aiInsights.financialForecast.projections] - Array of {month: string, revenue: number, profit: number}.
 * @property {string} [aiInsights.financialForecast.summary] - Summary of financial outlook.
 * @property {object} aiInsights.contractReview - AI-driven contract analysis.
 * @property {AiProcessingState} aiInsights.contractReview.status - AI processing status.
 * @property {string} [aiInsights.contractReview.summary] - Summary of contract terms.
 * @property {string[]} [aiInsights.contractReview.keyClauses] - Identified critical clauses.
 * @property {string[]} [aiInsights.contractReview.risks] - Potential contractual risks.
 * @property {object} aiInsights.anomalyDetection - AI-driven anomaly detection.
 * @property {AiProcessingState} aiInsights.anomalyDetection.status - AI processing status.
 * @property {object[]} [aiInsights.anomalyDetection.anomalies] - Detected unusual patterns.
 * @property {object} aiInsights.riskMitigation - AI-generated risk mitigation plan.
 * @property {AiProcessingState} aiInsights.riskMitigation.status - AI processing status.
 * @property {string[]} [aiInsights.riskMitigation.actions] - Specific, actionable mitigation steps.
 * @property {object} aiInsights.extractedEntities - AI-extracted entities from text.
 * @property {AiProcessingState} aiInsights.extractedEntities.status - AI processing status.
 * @property {object[]} [aiInsights.extractedEntities.entities] - Array of extracted entities.
 * @property {object} auditMetadata - System audit information, critical for data integrity and compliance.
 * @property {string} auditMetadata.createdAt - ISO date string of creation.
 * @property {string} auditMetadata.updatedAt - ISO date string of last update.
 * @property {string} auditMetadata.createdBy - User ID or system responsible for creation.
 * @property {string} auditMetadata.updatedBy - User ID or system responsible for last update.
 */

// --- 2. Core Slice Definition using createEntitySlice ---

/**
 * @type {import("@reduxjs/toolkit").Slice<Counterparty[], import("@reduxjs/toolkit").PayloadAction<any>> & { actions: any, reducer: any }}
 * This re-export pattern ensures that all base functionality from createEntitySlice
 * is available, while allowing for extensive augmentation with custom reducers and thunks.
 */
export const {
  slice: { actions: baseActions, reducer: baseReducer },
  selector: baseSelector,
} = createEntitySlice("counterparties", "/counterparties", {
  initialState: {
    loading: "idle", // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
    aiProcessingStatus: AiProcessingState.IDLE, // Global AI processing status for the slice
    aiProcessingError: null,
    lastAiProcessedId: null, // ID of the counterparty last affected by a major AI operation
    recentActivityLogs: [], // Log of system and AI-driven activities
    // Additional domain-specific global state for counterparties slice
    filters: {
      status: null,
      riskLevel: null,
      searchQuery: "",
      relationshipType: null,
      assignedAccount: null,
    },
    pagination: {
      currentPage: 1,
      pageSize: CounterpartyConfig.DEFAULT_PAGE_SIZE,
      totalPages: 1,
      totalCount: 0,
    },
    // ... potentially other global slice state for a commercial grade system
  },
  reducers: {
    // Custom synchronous reducers for managing slice-specific state not directly related to entities
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => { // Publicly exposed error setter
      state.error = action.payload;
    },
    setAiProcessingStatus: (state, action) => {
      state.aiProcessingStatus = action.payload;
    },
    setAiProcessingError: (state, action) => {
      state.aiProcessingError = action.payload;
    },
    setLastAiProcessedId: (state, action) => {
      state.lastAiProcessedId = action.payload;
    },
    addActivityLog: (state, action) => {
      state.recentActivityLogs.unshift({ ...action.payload, timestamp: new Date().toISOString() });
      if (state.recentActivityLogs.length > 100) { // Keep log size manageable for performance
        state.recentActivityLogs.pop();
      }
    },
    // Reducers for managing filters and pagination
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // This is where we define reactions to `createAsyncThunk` lifecycle actions.
    // Each thunk will have at least `pending`, `fulfilled`, and `rejected` cases.

    // Reducers for fetchCounterpartiesEnhanced
    builder
      .addCase(fetchCounterpartiesEnhanced.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchCounterpartiesEnhanced.fulfilled, (state, action) => {
        state.loading = "succeeded";
        // `baseActions.setAll` is dispatched inside the thunk to update entities.
        // Here we just update global slice state.
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.IDLE; // Reset after global AI ops
        state.pagination.totalCount = action.payload.totalCount; // Assume thunk returns totalCount
        state.pagination.totalPages = Math.ceil(action.payload.totalCount / state.pagination.pageSize);
      })
      .addCase(fetchCounterpartiesEnhanced.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to fetch enhanced counterparties.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for addCounterpartyWithAIValidation
    builder
      .addCase(addCounterpartyWithAIValidation.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(addCounterpartyWithAIValidation.fulfilled, (state, action) => {
        state.loading = "succeeded";
        // `baseActions.add` is dispatched in the thunk
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(addCounterpartyWithAIValidation.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to add counterparty with AI validation.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for updateCounterpartyWithAIRiskAnalysis
    builder
      .addCase(updateCounterpartyWithAIRiskAnalysis.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(updateCounterpartyWithAIRiskAnalysis.fulfilled, (state, action) => {
        state.loading = "succeeded";
        // `baseActions.update` is dispatched in the thunk
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(updateCounterpartyWithAIRiskAnalysis.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to update counterparty with AI risk analysis.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for runAIComplianceAudit
    builder
      .addCase(runAIComplianceAudit.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(runAIComplianceAudit.fulfilled, (state, action) => {
        state.loading = "succeeded";
        // `baseActions.update` is dispatched in the thunk
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(runAIComplianceAudit.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to run AI compliance audit.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for mergeCounterpartiesAI
    builder
      .addCase(mergeCounterpartiesAI.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(mergeCounterpartiesAI.fulfilled, (state, action) => {
        state.loading = "succeeded";
        // `baseActions.remove` and `baseActions.update` are dispatched in the thunk
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(mergeCounterpartiesAI.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to merge counterparties with AI.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for reviewCounterpartyContractAI
    builder
      .addCase(reviewCounterpartyContractAI.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(reviewCounterpartyContractAI.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(reviewCounterpartyContractAI.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to review contract with AI.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for generateRiskMitigationPlanAI
    builder
      .addCase(generateRiskMitigationPlanAI.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(generateRiskMitigationPlanAI.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(generateRiskMitigationPlanAI.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to generate risk mitigation plan with AI.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for predictCounterpartyFinancialHealthAI
    builder
      .addCase(predictCounterpartyFinancialHealthAI.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(predictCounterpartyFinancialHealthAI.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(predictCounterpartyFinancialHealthAI.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to predict financial health with AI.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for processCounterpartyNotesAI
    builder
      .addCase(processCounterpartyNotesAI.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(processCounterpartyNotesAI.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(processCounterpartyNotesAI.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to process notes with AI.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });

    // Reducers for monitorCounterpartyActivityAI
    builder
      .addCase(monitorCounterpartyActivityAI.pending, (state) => {
        state.loading = "pending";
        state.error = null;
        state.aiProcessingStatus = AiProcessingState.PENDING;
        state.aiProcessingError = null;
      })
      .addCase(monitorCounterpartyActivityAI.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.aiProcessingStatus = AiProcessingState.FULFILLED;
        state.lastAiProcessedId = action.payload.id;
        state.error = null;
      })
      .addCase(monitorCounterpartyActivityAI.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload || "Failed to monitor activity with AI.";
        state.aiProcessingStatus = AiProcessingState.REJECTED;
        state.aiProcessingError = action.payload;
      });
  },
});

// Re-export the combined actions and selector to reflect the augmented version
export const actions = { ...baseActions, ...baseReducer.actions }; // Combine base actions with custom ones
export const reducer = baseReducer; // The reducer created by createEntitySlice, now with full extraReducers

// --- 3. Simulated Gemini AI Service Functions (Expanded) ---
// These functions simulate calls to a sophisticated Gemini AI backend.
// In a real application, these would reside in a dedicated API service file,
// accessed via a robust API client.

/**
 * Simulates an AI call to analyze counterparty data for risk factors.
 * @param {object} data - Data payload for AI analysis.
 * @param {string} data.counterpartyId - ID of the counterparty.
 * @param {object} data.financials - Financial data.
 * @param {object} data.complianceHistory - Compliance history.
 * @param {string[]} data.recentNewsKeywords - Keywords from recent news related to the counterparty.
 * @returns {Promise<object>} A promise that resolves with AI risk assessment.
 * @property {number} score - A risk score between 0 and 1.
 * @property {string[]} flags - Identified risk flags (e.g., 'HIGH_DEBT', 'REGULATORY_WARNING').
 * @property {string} summary - A summary of the risk assessment.
 */
export const geminiAI_analyzeCounterpartyRisk = async (data) => {
  console.log(`Gemini AI: Analyzing risk for counterparty ${data.counterpartyId}...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/risk-analysis", {
      method: "POST",
      body: JSON.stringify(data),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI risk analysis failed.");
    }

    const score = parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)); // Simulate a score
    const flags = [];
    if (score > CounterpartyConfig.RISK_THRESHOLD_HIGH) flags.push("HIGH_INSTABILITY_ALERT");
    if (score > CounterpartyConfig.RISK_THRESHOLD_MEDIUM) flags.push("MARKET_VOLATILITY_FACTOR");
    if (data.complianceHistory && data.complianceHistory.hasWarnings) flags.push("COMPLIANCE_HISTORY_WARNING");
    if (data.financials?.debtToEquity > 2) flags.push("ELEVATED_DEBT_CONCERN");
    if (data.recentNewsKeywords?.includes("sanction")) flags.push("GEOPOLITICAL_SANCTION_RISK");

    return {
      score,
      flags,
      summary: aiResponse.data?.summary || `AI has assessed a risk score of ${score}. Key factors include...`,
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Risk Analysis Error: ${error.message}`);
    throw new Error(`AI risk analysis failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call to generate an optimal engagement strategy for a counterparty.
 * @param {string} counterpartyId - ID of the counterparty.
 * @param {object} historicalInteractionData - Past interactions, sentiment, etc.
 * @param {object} marketContext - Current market conditions.
 * @param {RiskLevel} currentRiskLevel - Current risk level of the counterparty.
 * @returns {Promise<object>} A promise that resolves with AI engagement strategy.
 * @property {string} summary - A summary of the recommended strategy.
 * @property {string[]} recommendations - Specific actionable recommendations.
 * @property {string} primaryChannel - Recommended primary communication channel.
 */
export const geminiAI_generateEngagementStrategy = async (counterpartyId, historicalInteractionData, marketContext, currentRiskLevel) => {
  console.log(`Gemini AI: Generating engagement strategy for counterparty ${counterpartyId}...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/engagement-strategy", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, historicalInteractionData, marketContext, currentRiskLevel }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI engagement strategy generation failed.");
    }

    const recommendations = [
      `Tailor communication based on recent sentiment analysis (${aiResponse.data?.sentiment || 'neutral'}).`,
      `Focus on solutions presented in their last financial report.`,
      `Schedule a follow-up call within 7 days.`,
    ];
    if (currentRiskLevel === 'CRITICAL') {
      recommendations.unshift("Prioritize direct legal/compliance outreach for urgent review.");
    } else if (currentRiskLevel === 'HIGH') {
      recommendations.unshift("Escalate to senior account management for high-touch engagement.");
    }

    return {
      summary: aiResponse.data?.summary || "AI recommends a personalized, data-driven engagement approach.",
      recommendations,
      primaryChannel: aiResponse.data?.channel || (Math.random() > 0.5 ? "Email" : "Video Call"),
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Engagement Strategy Error: ${error.message}`);
    throw new Error(`AI engagement strategy failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call for advanced data categorization.
 * @param {string} counterpartyId - ID of the counterparty.
 * @param {string} description - Text description to categorize.
 * @returns {Promise<object>} A promise resolving with AI-generated categories.
 * @property {string[]} categories - List of suggested categories/tags.
 * @property {number[]} confidenceScores - Confidence for each category.
 */
export const geminiAI_categorizeData = async (counterpartyId, description) => {
  console.log(`Gemini AI: Categorizing data for counterparty ${counterpartyId}...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/categorization", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, description }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI categorization failed.");
    }

    const possibleCategories = ["FINTECH", "SAAS", "LOGISTICS", "HEALTHCARE", "MANUFACTURING", "RETAIL", "ENERGY", "TELECOM", "GOVERNMENT_CONTRACTOR", "EDUCATION_TECH", "REAL_ESTATE"];
    const selectedCategories = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() =>
      possibleCategories[Math.floor(Math.random() * possibleCategories.length)]
    );
    const confidenceScores = selectedCategories.map(() => parseFloat((Math.random() * 0.3 + 0.7).toFixed(2))); // High confidence

    return {
      categories: selectedCategories,
      confidenceScores,
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Categorization Error: ${error.message}`);
    throw new Error(`AI categorization failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call for sentiment analysis on textual data (e.g., notes, emails).
 * @param {string} counterpartyId - ID of the counterparty.
 * @param {string} text - The text to analyze.
 * @returns {Promise<object>} A promise resolving with AI-generated sentiment analysis.
 * @property {number} score - Sentiment score (-1 for negative, 1 for positive).
 * @property {string} label - 'Positive', 'Neutral', or 'Negative'.
 */
export const geminiAI_analyzeSentiment = async (counterpartyId, text) => {
  console.log(`Gemini AI: Analyzing sentiment for counterparty ${counterpartyId} (text: "${text.substring(0, Math.min(text.length, 50))}...")...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/sentiment", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, text }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI sentiment analysis failed.");
    }

    const score = parseFloat(((Math.random() * 2) - 1).toFixed(2)); // Score between -1 and 1
    let label = 'Neutral';
    if (score > 0.3) label = 'Positive';
    if (score < -0.3) label = 'Negative';

    return {
      score,
      label,
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Sentiment Analysis Error: ${error.message}`);
    throw new Error(`AI sentiment analysis failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call to detect anomalies in historical counterparty data.
 * @param {string} counterpartyId - ID of the counterparty.
 * @param {object[]} historicalData - Array of historical data points (e.g., transaction volumes, contact frequency, financial metrics).
 * @returns {Promise<object>} A promise resolving with AI-detected anomalies.
 * @property {object[]} anomalies - List of detected anomalies, each with details.
 * @property {string} summary - A summary of the anomaly detection.
 */
export const geminiAI_detectAnomalies = async (counterpartyId, historicalData) => {
  console.log(`Gemini AI: Detecting anomalies for counterparty ${counterpartyId}...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/anomaly-detection", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, historicalData }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI anomaly detection failed.");
    }

    const hasAnomaly = Math.random() > 0.6; // Simulate ~40% chance of anomaly
    const anomalies = hasAnomaly ? [{
      type: "UNUSUAL_TRANSACTION_VOLUME",
      description: "Significant deviation from average transaction volume observed in the last 7 days.",
      severity: Math.random() > 0.5 ? "HIGH" : "MEDIUM",
      timestamp: new Date().toISOString(),
      detectedMetric: "transactionVolume",
    }, {
      type: "UNEXPECTED_CONTACT_FREQUENCY",
      description: "Abnormal increase/decrease in contact frequency detected.",
      severity: Math.random() > 0.5 ? "MEDIUM" : "LOW",
      timestamp: new Date().toISOString(),
      detectedMetric: "contactFrequency",
    }] : [];

    return {
      anomalies,
      summary: anomalies.length > 0 ? "Potential anomalies detected, immediate review recommended." : "No significant anomalies detected.",
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Anomaly Detection Error: ${error.message}`);
    throw new Error(`AI anomaly detection failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call to review a contract document.
 * @param {string} counterpartyId - ID of the counterparty.
 * @param {string} contractText - The full text of the contract.
 * @param {string[]} relevantRegulations - Array of regulations pertinent to the contract.
 * @returns {Promise<object>} A promise resolving with AI-generated contract review.
 * @property {string} summary - A summary of the contract's key terms.
 * @property {string[]} keyClauses - Identified critical clauses (e.g., termination, liability).
 * @property {string[]} risks - Potential contractual risks (e.g., unfavorable terms, missing clauses).
 * @property {string} complianceOutlook - AI assessment of compliance against provided regulations.
 */
export const geminiAI_reviewContractTerms = async (counterpartyId, contractText, relevantRegulations) => {
  console.log(`Gemini AI: Reviewing contract for counterparty ${counterpartyId}...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/contract-review", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, contractText, relevantRegulations }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS * 2, // Longer timeout for large documents
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI contract review failed.");
    }

    const keyClauses = ["Payment Terms (Net 30)", "Limitation of Liability ($1M)", "Governing Law (Delaware)"];
    const risks = (Math.random() > 0.5) ? ["Early Termination Penalty", "Lack of Indemnification Clause"] : [];
    const complianceOutlook = risks.length > 0 ? "Potential compliance issues identified." : "Generally compliant with stated regulations.";

    return {
      summary: aiResponse.data?.summary || "Comprehensive AI review of contract terms completed.",
      keyClauses,
      risks,
      complianceOutlook,
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Contract Review Error: ${error.message}`);
    throw new Error(`AI contract review failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call to predict financial trends for a counterparty.
 * @param {string} counterpartyId - ID of the counterparty.
 * @param {object[]} historicalFinancials - Array of historical financial data points (e.g., revenue, profit).
 * @param {number} forecastPeriodMonths - Number of months to forecast.
 * @returns {Promise<object>} A promise resolving with AI-generated financial forecast.
 * @property {object[]} projections - Array of financial projections.
 * @property {string} summary - A summary of the financial outlook.
 * @property {string[]} keyFactors - Key factors influencing the forecast.
 */
export const geminiAI_predictFinancialTrends = async (counterpartyId, historicalFinancials, forecastPeriodMonths = CounterpartyConfig.FINANCIAL_FORECAST_PERIOD_MONTHS) => {
  console.log(`Gemini AI: Predicting financial trends for counterparty ${counterpartyId}...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/financial-forecast", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, historicalFinancials, forecastPeriodMonths }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS * 1.5,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI financial forecast failed.");
    }

    const projections = Array.from({ length: forecastPeriodMonths }).map((_, i) => ({
      month: new Date(new Date().setMonth(new Date().getMonth() + i + 1)).toISOString().substring(0, 7),
      revenue: 1000000 + Math.random() * 500000,
      profit: 100000 + Math.random() * 50000,
    }));
    const summary = `AI predicts steady growth with an average monthly revenue of $${(projections.reduce((sum, p) => sum + p.revenue, 0) / forecastPeriodMonths).toFixed(2)}.`;
    const keyFactors = ["Market demand", "Operational efficiency", "Competitive landscape", "Regulatory changes"];

    return {
      projections,
      summary: aiResponse.data?.summary || summary,
      keyFactors,
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Financial Forecast Error: ${error.message}`);
    throw new Error(`AI financial forecast failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call to propose specific risk mitigation actions.
 * @param {string} counterpartyId - ID of the counterparty.
 * @param {object[]} identifiedRisks - Array of identified risks (e.g., from `analyzeCounterpartyRisk`).
 * @param {object} counterpartyProfile - Relevant counterparty data.
 * @returns {Promise<object>} A promise resolving with AI-proposed mitigation actions.
 * @property {string[]} actions - Specific, actionable mitigation steps.
 * @property {string} summary - A summary of the mitigation strategy.
 */
export const geminiAI_proposeRiskMitigationActions = async (counterpartyId, identifiedRisks, counterpartyProfile) => {
  console.log(`Gemini AI: Proposing risk mitigation for counterparty ${counterpartyId}...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/risk-mitigation", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, identifiedRisks, counterpartyProfile }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI risk mitigation proposal failed.");
    }

    const actions = identifiedRisks.length > 0
      ? ["Initiate urgent compliance review.", "Increase monitoring frequency for financial transactions.", "Engage legal counsel for contract review.", "Diversify engagement points."]
      : ["Maintain current monitoring level."];
    const summary = identifiedRisks.length > 0
      ? "AI has identified several risks and proposed targeted mitigation actions."
      : "No critical risks identified, continue standard monitoring.";

    return {
      actions,
      summary: aiResponse.data?.summary || summary,
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Risk Mitigation Error: ${error.message}`);
    throw new Error(`AI risk mitigation proposal failed: ${error.message}`);
  }
};

/**
 * Simulates an AI call to extract key entities (people, organizations, locations) from free-form text.
 * @param {string} counterpartyId - ID of the counterparty for context.
 * @param {string} text - The input text for entity extraction.
 * @returns {Promise<object>} A promise resolving with AI-extracted entities.
 * @property {object[]} entities - Array of extracted entities with their types.
 * @property {string} summary - Summary of the extracted information.
 */
export const geminiAI_extractEntitiesFromText = async (counterpartyId, text) => {
  console.log(`Gemini AI: Extracting entities from text for counterparty ${counterpartyId} (text: "${text.substring(0, Math.min(text.length, 50))}...")...`);
  try {
    const aiResponse = await simulateGeminiAIApiCall("/gemini-ai/entity-extraction", {
      method: "POST",
      body: JSON.stringify({ counterpartyId, text }),
      timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS,
    });

    if (aiResponse.status === "error") {
      throw new Error(aiResponse.message || "AI entity extraction failed.");
    }

    const entities = [];
    if (text.includes("meeting")) entities.push({ text: "meeting", type: "EVENT" });
    if (text.includes("new project")) entities.push({ text: "new project", type: "PROJECT" });
    if (text.includes("John Doe")) entities.push({ text: "John Doe", type: "PERSON" });
    if (text.includes("HQ")) entities.push({ text: "HQ", type: "LOCATION" });
    if (text.includes("legal team")) entities.push({ text: "legal team", type: "ORGANIZATION_DEPARTMENT" });
    if (text.includes("agreement")) entities.push({ text: "agreement", type: "DOCUMENT" });

    return {
      entities,
      summary: aiResponse.data?.summary || `Extracted ${entities.length} entities from the provided text.`,
      aiModelVersion: "Gemini-Pro-v1.5-beta",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Gemini AI Entity Extraction Error: ${error.message}`);
    throw new Error(`AI entity extraction failed: ${error.message}`);
  }
};


// --- 4. Advanced Async Thunks and Action Creators (Expanded) ---
// These thunks orchestrate complex workflows, often involving multiple API calls
// and integrations with the simulated Gemini AI service.

/**
 * Fetches counterparties with advanced filtering and AI-driven enrichment.
 * @param {object} params - Fetch parameters.
 * @param {string} [params.query] - Search query.
 * @param {CounterpartyStatus} [params.status] - Filter by status.
 * @param {RiskLevel} [params.minRiskLevel] - Filter by minimum risk level.
 * @param {boolean} [params.includeAIEnrichment=false] - Whether to enrich results with AI insights.
 * @param {number} [params.page=1] - Page number.
 * @param {number} [params.limit=CounterpartyConfig.DEFAULT_PAGE_SIZE] - Items per page.
 * @returns {Promise<{data: Counterparty[], totalCount: number}>} A promise resolving with an array of enriched counterparties and total count.
 */
export const fetchCounterpartiesEnhanced = createAsyncThunk(
  "counterparties/fetchEnhanced",
  async (params, { rejectWithValue, dispatch, getState }) => {
    try {
      // Simulate fetching base data
      const response = await simulateApiCall(`/counterparties?${new URLSearchParams(params).toString()}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      /** @type {{data: Counterparty[], totalCount: number}} */
      let { data: fetchedCounterparties, totalCount } = response.data;

      // Conditional AI enrichment
      if (params.includeAIEnrichment) {
        console.log("Enriching fetched counterparties with AI insights...");
        const enrichedCounterparties = await Promise.all(
          fetchedCounterparties.map(async (cp) => {
            try {
              // Simulate parallel AI calls for each counterparty
              const [riskAssessment, engagementStrategy, sentimentAnalysis] = await Promise.all([
                geminiAI_analyzeCounterpartyRisk({
                  counterpartyId: cp.id,
                  financials: cp.financialData, // Assume financialData exists on cp
                  complianceHistory: cp.compliance,
                  recentNewsKeywords: cp.tags,
                }),
                geminiAI_generateEngagementStrategy(cp.id, cp.historicalActivity || {}, {}, cp.riskLevel),
                geminiAI_analyzeSentiment(cp.id, cp.description || cp.name),
              ]);

              return {
                ...cp,
                aiInsights: {
                  ...cp.aiInsights, // Preserve existing AI insights
                  riskAssessment: { ...riskAssessment, status: AiProcessingState.FULFILLED },
                  engagementStrategy: { ...engagementStrategy, status: AiProcessingState.FULFILLED },
                  sentimentAnalysis: { ...sentimentAnalysis, status: AiProcessingState.FULFILLED },
                },
                auditMetadata: {
                  ...cp.auditMetadata,
                  updatedAt: new Date().toISOString(), // Reflect AI enrichment
                  updatedBy: "System-AI-Enrichment",
                },
              };
            } catch (aiError) {
              console.warn(`AI enrichment failed for ${cp.id}: ${aiError.message}`);
              return {
                ...cp,
                aiInsights: {
                  ...cp.aiInsights,
                  riskAssessment: { status: AiProcessingState.REJECTED, error: aiError.message },
                  engagementStrategy: { status: AiProcessingState.REJECTED, error: aiError.message },
                  sentimentAnalysis: { status: AiProcessingState.REJECTED, error: aiError.message },
                },
              };
            }
          })
        );
        fetchedCounterparties = enrichedCounterparties;
      }

      // Dispatch the base `setAll` action from `createEntitySlice` to update the state
      dispatch(actions.setAll(fetchedCounterparties));
      return { data: fetchedCounterparties, totalCount };

    } catch (error) {
      console.error("Error in fetchCounterpartiesEnhanced:", error);
      dispatch(actions.setError(error.message));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Adds a new counterparty, including initial AI validation and categorization.
 * @param {Partial<Counterparty>} newCounterpartyData - Data for the new counterparty.
 * @returns {Promise<Counterparty>} A promise resolving with the newly created and AI-validated counterparty.
 */
export const addCounterpartyWithAIValidation = createAsyncThunk(
  "counterparties/addWithAIValidation",
  async (newCounterpartyData, { rejectWithValue, dispatch }) => {
    try {
      dispatch(actions.setLoading("pending"));
      // 1. Basic client-side validation (simulated)
      if (!newCounterpartyData.name || !newCounterpartyData.email) {
        throw new Error("Name and email are required for new counterparty.");
      }

      // 2. Simulate AI categorization
      const aiCategorization = await geminiAI_categorizeData(
        "new-temp-id", // temp ID for AI, actual ID generated by backend
        newCounterpartyData.description || newCounterpartyData.name
      );

      // 3. Prepare data for API call
      const counterpartyToSend = {
        ...newCounterpartyData,
        id: `cpt-${Math.random().toString(36).substr(2, 9)}`, // Client-side ID for immediate use
        status: newCounterpartyData.status || 'PENDING',
        riskLevel: newCounterpartyData.riskLevel || 'LOW',
        compliance: {
          status: 'PENDING_REVIEW',
          lastReviewDate: null,
          nextReviewDate: new Date(Date.now() + CounterpartyConfig.COMPLIANCE_REVIEW_DAYS * 24 * 60 * 60 * 1000).toISOString(),
          flags: [],
        },
        aiInsights: {
          categorization: { ...aiCategorization, status: AiProcessingState.FULFILLED },
          // Initial empty states for other AI insights
          riskAssessment: { status: AiProcessingState.IDLE },
          engagementStrategy: { status: AiProcessingState.IDLE },
          sentimentAnalysis: { status: AiProcessingState.IDLE },
          financialForecast: { status: AiProcessingState.IDLE },
          contractReview: { status: AiProcessingState.IDLE },
          anomalyDetection: { status: AiProcessingState.IDLE },
          riskMitigation: { status: AiProcessingState.IDLE },
          extractedEntities: { status: AiProcessingState.IDLE },
        },
        auditMetadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "User-Current",
          updatedBy: "User-Current",
        },
        historicalActivity: [], // Initialize historical activity log
      };

      // 4. Simulate API call to add the counterparty
      const response = await simulateApiCall("/counterparties", {
        method: "POST",
        body: JSON.stringify(counterpartyToSend),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const createdCounterparty = response.data;
      dispatch(actions.add(createdCounterparty)); // Use the base `add` action
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.setLastAiProcessedId(createdCounterparty.id));
      dispatch(actions.addActivityLog({ type: "CREATED", entityId: createdCounterparty.id, message: "New counterparty created with AI categorization." }));

      return createdCounterparty;

    } catch (error) {
      console.error("Error in addCounterpartyWithAIValidation:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: "N/A", message: `Failed to create counterparty: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Updates an existing counterparty and triggers a new AI risk analysis.
 * @param {Partial<Counterparty>} updatedCounterpartyData - Data to update the counterparty. Must include `id`.
 * @returns {Promise<Counterparty>} A promise resolving with the updated counterparty including new AI insights.
 */
export const updateCounterpartyWithAIRiskAnalysis = createAsyncThunk(
  "counterparties/updateWithAIRiskAnalysis",
  async (updatedCounterpartyData, { rejectWithValue, dispatch, getState }) => {
    if (!updatedCounterpartyData.id) {
      return rejectWithValue("Counterparty ID is required for update.");
    }
    const currentCounterparty = baseSelector.selectById(getState(), updatedCounterpartyData.id);
    if (!currentCounterparty) {
      return rejectWithValue(`Counterparty with ID ${updatedCounterpartyData.id} not found.`);
    }

    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(updatedCounterpartyData.id));

      // 1. Update audit metadata
      const payload = {
        ...currentCounterparty,
        ...updatedCounterpartyData,
        auditMetadata: {
          ...currentCounterparty.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "User-Current-Update",
        },
      };

      // 2. Simulate API call to update the counterparty
      const response = await simulateApiCall(`/counterparties/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      let updatedCp = response.data;

      // 3. Trigger AI risk analysis
      const aiRiskResult = await geminiAI_analyzeCounterpartyRisk({
        counterpartyId: updatedCp.id,
        financials: updatedCp.financialData, // Assume financialData exists or is part of update
        complianceHistory: updatedCp.compliance,
        recentNewsKeywords: updatedCp.tags,
      });

      // 4. Update AI insights in the counterparty data
      updatedCp = {
        ...updatedCp,
        riskLevel: aiRiskResult.score > CounterpartyConfig.RISK_THRESHOLD_HIGH ? 'CRITICAL' :
          aiRiskResult.score > CounterpartyConfig.RISK_THRESHOLD_MEDIUM ? 'HIGH' :
            updatedCp.riskLevel, // Don't downgrade risk if explicitly set higher or if not updated
        aiInsights: {
          ...updatedCp.aiInsights,
          riskAssessment: { ...aiRiskResult, status: AiProcessingState.FULFILLED },
        },
        auditMetadata: {
          ...updatedCp.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "System-AI-Risk-Analysis",
        },
      };

      // 5. Update the Redux store with the enhanced counterparty
      dispatch(actions.update(updatedCp)); // Use the base `update` action
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.addActivityLog({ type: "UPDATED", entityId: updatedCp.id, message: "Counterparty updated and AI risk analysis completed." }));

      return updatedCp;

    } catch (error) {
      console.error("Error in updateCounterpartyWithAIRiskAnalysis:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: updatedCounterpartyData.id, message: `Failed to update counterparty with AI analysis: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Triggers a comprehensive AI-driven compliance audit for a specific counterparty.
 * This thunk simulates fetching relevant documents, sending them to AI for analysis,
 * and updating the counterparty's compliance status based on AI findings.
 * @param {string} counterpartyId - The ID of the counterparty to audit.
 * @returns {Promise<Counterparty>} A promise resolving with the updated counterparty.
 */
export const runAIComplianceAudit = createAsyncThunk(
  "counterparties/runAIComplianceAudit",
  async (counterpartyId, { rejectWithValue, dispatch, getState }) => {
    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(counterpartyId));

      const currentCounterparty = baseSelector.selectById(getState(), counterpartyId);
      if (!currentCounterparty) {
        throw new Error(`Counterparty with ID ${counterpartyId} not found for audit.`);
      }

      // Simulate fetching compliance documents or data points
      const complianceDocs = await simulateApiCall(`/counterparties/${counterpartyId}/compliance-docs`);
      if (!complianceDocs.ok) throw new Error("Failed to fetch compliance documents.");

      // Simulate AI analysis of documents for compliance risks/status
      const aiComplianceResult = await simulateGeminiAIApiCall("/gemini-ai/compliance-audit", {
        method: "POST",
        body: JSON.stringify({
          counterpartyId,
          documents: complianceDocs.data,
          legalContext: { country: currentCounterparty.address?.country, type: currentCounterparty.type },
        }),
        timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS * 2, // Longer timeout for complex audit
      });

      if (aiComplianceResult.status === "error") {
        throw new Error(aiComplianceResult.message || "AI compliance audit failed.");
      }

      // Determine new compliance status based on AI findings
      let newComplianceStatus = 'APPROVED';
      const aiFlags = aiComplianceResult.data?.flags || [];
      if (aiFlags.includes("MAJOR_VIOLATION")) {
        newComplianceStatus = 'REJECTED';
      } else if (aiFlags.includes("MINOR_WARNING")) {
        newComplianceStatus = 'PENDING_REVIEW';
      }

      // Update the counterparty locally and then via API
      const updatedCp = {
        ...currentCounterparty,
        compliance: {
          status: newComplianceStatus,
          lastReviewDate: new Date().toISOString(),
          nextReviewDate: newComplianceStatus === 'APPROVED' ? new Date(Date.now() + CounterpartyConfig.COMPLIANCE_REVIEW_DAYS * 24 * 60 * 60 * 1000).toISOString() : currentCounterparty.compliance.nextReviewDate,
          aiAuditDetails: { ...aiComplianceResult.data, status: AiProcessingState.FULFILLED }, // Store AI audit details
          flags: aiFlags,
        },
        auditMetadata: {
          ...currentCounterparty.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "System-AI-Compliance-Audit",
        },
      };

      const updateResponse = await simulateApiCall(`/counterparties/${counterpartyId}`, {
        method: "PUT",
        body: JSON.stringify(updatedCp),
      });

      if (!updateResponse.ok) {
        throw new Error(`API error: ${updateResponse.statusText}`);
      }

      dispatch(actions.update(updateResponse.data));
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.addActivityLog({ type: "AUDIT", entityId: counterpartyId, message: `AI compliance audit completed with status: ${newComplianceStatus}.` }));

      return updateResponse.data;

    } catch (error) {
      console.error("Error in runAIComplianceAudit:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: counterpartyId, message: `Failed AI compliance audit: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);


/**
 * Merges two counterparties into one, using AI to reconcile conflicting information.
 * @param {object} params
 * @param {string} params.sourceId - The ID of the counterparty to be merged FROM (will be removed).
 * @param {string} params.targetId - The ID of the counterparty to be merged INTO (will be updated).
 * @param {'PRIORITIZE_TARGET' | 'PRIORITIZE_SOURCE' | 'AI_OPTIMIZED'} [params.mergeStrategy='AI_OPTIMIZED'] - Strategy for conflict resolution.
 * @returns {Promise<Counterparty>} A promise resolving with the merged counterparty.
 */
export const mergeCounterpartiesAI = createAsyncThunk(
  "counterparties/mergeAI",
  async ({ sourceId, targetId, mergeStrategy = 'AI_OPTIMIZED' }, { rejectWithValue, dispatch, getState }) => {
    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(`${sourceId}-${targetId}`)); // Composite ID for tracking

      const sourceCp = baseSelector.selectById(getState(), sourceId);
      const targetCp = baseSelector.selectById(getState(), targetId);

      if (!sourceCp || !targetCp) {
        throw new Error("One or both counterparties for merging not found.");
      }

      // Simulate AI reconciliation for conflicting data
      const aiMergeResult = await simulateGeminiAIApiCall("/gemini-ai/merge-reconciliation", {
        method: "POST",
        body: JSON.stringify({
          sourceData: sourceCp,
          targetData: targetCp,
          strategy: mergeStrategy,
        }),
        timeout: CounterpartyConfig.AI_PROCESSING_TIMEOUT_MS * 3, // Longer for complex merges
      });

      if (aiMergeResult.status === "error") {
        throw new Error(aiMergeResult.message || "AI merge reconciliation failed.");
      }

      // Assume AI returns the resolved, merged data
      /** @type {Counterparty} */
      const reconciledData = aiMergeResult.data.mergedCounterparty;

      // Simulate API call to merge on backend
      const response = await simulateApiCall(`/counterparties/merge`, {
        method: "POST",
        body: JSON.stringify({ sourceId, targetId, reconciledData }), // Backend processes the merge
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const finalMergedCp = response.data;

      // Update state: Add the merged, remove the source
      dispatch(actions.remove(sourceId));
      dispatch(actions.update(finalMergedCp)); // Update the target with the merged data
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.addActivityLog({ type: "MERGED", entityId: finalMergedCp.id, message: `Counterparty ${sourceId} merged into ${targetId} using AI reconciliation.` }));

      return finalMergedCp;

    } catch (error) {
      console.error("Error in mergeCounterpartiesAI:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: `${sourceId}-${targetId}`, message: `Failed to merge counterparties with AI: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Initiates an AI-driven review of a counterparty's contracts.
 * @param {object} params
 * @param {string} params.counterpartyId - The ID of the counterparty.
 * @param {string} params.contractDocumentId - The ID of the contract document to review.
 * @param {string[]} [params.relevantRegulations=[]] - Specific regulations to check against.
 * @returns {Promise<Counterparty>} The updated counterparty with new contract review insights.
 */
export const reviewCounterpartyContractAI = createAsyncThunk(
  "counterparties/reviewContractAI",
  async ({ counterpartyId, contractDocumentId, relevantRegulations = [] }, { rejectWithValue, dispatch, getState }) => {
    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(counterpartyId));

      const currentCounterparty = baseSelector.selectById(getState(), counterpartyId);
      if (!currentCounterparty) {
        throw new Error(`Counterparty with ID ${counterpartyId} not found.`);
      }

      // Simulate fetching contract text
      const contractResponse = await simulateApiCall(`/documents/${contractDocumentId}/text`);
      if (!contractResponse.ok) {
        throw new Error(`Failed to fetch contract document ${contractDocumentId}.`);
      }
      const contractText = contractResponse.data.text;

      const aiContractReview = await geminiAI_reviewContractTerms(counterpartyId, contractText, relevantRegulations);

      const updatedCp = {
        ...currentCounterparty,
        aiInsights: {
          ...currentCounterparty.aiInsights,
          contractReview: { ...aiContractReview, status: AiProcessingState.FULFILLED },
        },
        auditMetadata: {
          ...currentCounterparty.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "System-AI-Contract-Review",
        },
      };

      dispatch(actions.update(updatedCp));
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.addActivityLog({ type: "AI_TASK", entityId: counterpartyId, message: "AI contract review completed." }));

      return updatedCp;

    } catch (error) {
      console.error("Error in reviewCounterpartyContractAI:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: counterpartyId, message: `Failed AI contract review: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Generates an AI-powered risk mitigation plan for a counterparty based on its current risk profile.
 * @param {string} counterpartyId - The ID of the counterparty.
 * @returns {Promise<Counterparty>} The updated counterparty with a new risk mitigation strategy.
 */
export const generateRiskMitigationPlanAI = createAsyncThunk(
  "counterparties/generateRiskMitigationPlanAI",
  async (counterpartyId, { rejectWithValue, dispatch, getState }) => {
    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(counterpartyId));

      const currentCounterparty = baseSelector.selectById(getState(), counterpartyId);
      if (!currentCounterparty) {
        throw new Error(`Counterparty with ID ${counterpartyId} not found.`);
      }

      // Assume we need to provide AI with relevant risks
      const identifiedRisks = currentCounterparty.aiInsights?.riskAssessment?.flags?.map(flag => ({
        type: flag,
        severity: currentCounterparty.riskLevel, // Simplified
        description: `Risk identified: ${flag}`,
      })) || [];

      const aiMitigationPlan = await geminiAI_proposeRiskMitigationActions(counterpartyId, identifiedRisks, currentCounterparty);

      const updatedCp = {
        ...currentCounterparty,
        aiInsights: {
          ...currentCounterparty.aiInsights,
          riskMitigation: { ...aiMitigationPlan, status: AiProcessingState.FULFILLED }, // Adding a new AI insight type
        },
        auditMetadata: {
          ...currentCounterparty.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "System-AI-Mitigation-Plan",
        },
      };

      dispatch(actions.update(updatedCp));
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.addActivityLog({ type: "AI_TASK", entityId: counterpartyId, message: "AI risk mitigation plan generated." }));

      return updatedCp;

    } catch (error) {
      console.error("Error in generateRiskMitigationPlanAI:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: counterpartyId, message: `Failed to generate AI risk mitigation plan: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Predicts the financial health and trends for a counterparty using AI.
 * @param {string} counterpartyId - The ID of the counterparty.
 * @param {number} [forecastPeriodMonths=CounterpartyConfig.FINANCIAL_FORECAST_PERIOD_MONTHS] - Number of months to forecast.
 * @returns {Promise<Counterparty>} The updated counterparty with new financial forecast insights.
 */
export const predictCounterpartyFinancialHealthAI = createAsyncThunk(
  "counterparties/predictFinancialHealthAI",
  async ({ counterpartyId, forecastPeriodMonths = CounterpartyConfig.FINANCIAL_FORECAST_PERIOD_MONTHS }, { rejectWithValue, dispatch, getState }) => {
    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(counterpartyId));

      const currentCounterparty = baseSelector.selectById(getState(), counterpartyId);
      if (!currentCounterparty) {
        throw new Error(`Counterparty with ID ${counterpartyId} not found.`);
      }

      // Simulate fetching historical financial data
      const historicalFinancialsResponse = await simulateApiCall(`/counterparties/${counterpartyId}/financial-history`);
      if (!historicalFinancialsResponse.ok) {
        throw new Error(`Failed to fetch financial history for ${counterpartyId}.`);
      }
      const historicalFinancials = historicalFinancialsResponse.data;

      const aiFinancialForecast = await geminiAI_predictFinancialTrends(counterpartyId, historicalFinancials, forecastPeriodMonths);

      const updatedCp = {
        ...currentCounterparty,
        aiInsights: {
          ...currentCounterparty.aiInsights,
          financialForecast: { ...aiFinancialForecast, status: AiProcessingState.FULFILLED },
        },
        auditMetadata: {
          ...currentCounterparty.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "System-AI-Financial-Forecast",
        },
      };

      dispatch(actions.update(updatedCp));
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.addActivityLog({ type: "AI_TASK", entityId: counterpartyId, message: "AI financial health prediction completed." }));

      return updatedCp;

    } catch (error) {
      console.error("Error in predictCounterpartyFinancialHealthAI:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: counterpartyId, message: `Failed AI financial health prediction: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Processes free-form notes related to a counterparty using AI to extract entities and perform sentiment analysis.
 * @param {object} params
 * @param {string} params.counterpartyId - The ID of the counterparty.
 * @param {string} params.notesText - The text of the notes to process.
 * @returns {Promise<Counterparty>} The updated counterparty with new sentiment and entity insights.
 */
export const processCounterpartyNotesAI = createAsyncThunk(
  "counterparties/processNotesAI",
  async ({ counterpartyId, notesText }, { rejectWithValue, dispatch, getState }) => {
    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(counterpartyId));

      const currentCounterparty = baseSelector.selectById(getState(), counterpartyId);
      if (!currentCounterparty) {
        throw new Error(`Counterparty with ID ${counterpartyId} not found.`);
      }

      const [aiSentiment, aiEntities] = await Promise.all([
        geminiAI_analyzeSentiment(counterpartyId, notesText),
        geminiAI_extractEntitiesFromText(counterpartyId, notesText),
      ]);

      // Assuming `historicalActivity` can store note-related insights
      const updatedHistoricalActivity = [
        ...(currentCounterparty.historicalActivity || []),
        {
          type: "NOTE_PROCESSED_AI",
          timestamp: new Date().toISOString(),
          notes: notesText,
          sentiment: aiSentiment,
          extractedEntities: aiEntities.entities,
          aiModelVersion: "Gemini-Pro-v1.5-beta",
        },
      ];

      const updatedCp = {
        ...currentCounterparty,
        historicalActivity: updatedHistoricalActivity,
        // Potentially update overall sentiment if this is the most recent
        aiInsights: {
          ...currentCounterparty.aiInsights,
          sentimentAnalysis: { ...aiSentiment, status: AiProcessingState.FULFILLED },
          extractedEntities: { ...aiEntities, status: AiProcessingState.FULFILLED }, // New insight type
        },
        auditMetadata: {
          ...currentCounterparty.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "System-AI-Notes-Processor",
        },
      };

      dispatch(actions.update(updatedCp));
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));
      dispatch(actions.addActivityLog({ type: "AI_TASK", entityId: counterpartyId, message: "AI processed counterparty notes." }));

      return updatedCp;

    } catch (error) {
      console.error("Error in processCounterpartyNotesAI:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: counterpartyId, message: `Failed to process notes with AI: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Monitors counterparty activity for anomalies using AI, triggering alerts if detected.
 * This thunk would typically run periodically or be triggered by specific events.
 * @param {string} counterpartyId - The ID of the counterparty to monitor.
 * @returns {Promise<Counterparty>} The updated counterparty with new anomaly detection insights.
 */
export const monitorCounterpartyActivityAI = createAsyncThunk(
  "counterparties/monitorActivityAI",
  async (counterpartyId, { rejectWithValue, dispatch, getState }) => {
    try {
      dispatch(actions.setLoading("pending"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.PENDING));
      dispatch(actions.setLastAiProcessedId(counterpartyId));

      const currentCounterparty = baseSelector.selectById(getState(), counterpartyId);
      if (!currentCounterparty) {
        throw new Error(`Counterparty with ID ${counterpartyId} not found.`);
      }

      // Simulate fetching comprehensive historical activity data (transactions, contacts, etc.)
      const fullHistoricalData = await simulateApiCall(`/counterparties/${counterpartyId}/full-history`);
      if (!fullHistoricalData.ok) {
        throw new Error(`Failed to fetch full history for ${counterpartyId}.`);
      }

      const aiAnomalyDetection = await geminiAI_detectAnomalies(counterpartyId, fullHistoricalData.data.activityLog);

      const updatedCp = {
        ...currentCounterparty,
        aiInsights: {
          ...currentCounterparty.aiInsights,
          anomalyDetection: { ...aiAnomalyDetection, status: AiProcessingState.FULFILLED },
        },
        auditMetadata: {
          ...currentCounterparty.auditMetadata,
          updatedAt: new Date().toISOString(),
          updatedBy: "System-AI-Anomaly-Monitor",
        },
      };

      dispatch(actions.update(updatedCp));
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.FULFILLED));

      if (aiAnomalyDetection.anomalies && aiAnomalyDetection.anomalies.length > 0) {
        dispatch(actions.addActivityLog({ type: "ALERT", entityId: counterpartyId, message: `AI detected ${aiAnomalyDetection.anomalies.length} anomalies for this counterparty. Review recommended.` }));
      } else {
        dispatch(actions.addActivityLog({ type: "AI_TASK", entityId: counterpartyId, message: "AI anomaly detection completed, no new anomalies found." }));
      }

      return updatedCp;

    } catch (error) {
      console.error("Error in monitorCounterpartyActivityAI:", error);
      dispatch(actions.setLoading("idle"));
      dispatch(actions.setAiProcessingStatus(AiProcessingState.REJECTED));
      dispatch(actions.setAiProcessingError(error.message));
      dispatch(actions.addActivityLog({ type: "ERROR", entityId: counterpartyId, message: `Failed AI anomaly monitoring: ${error.message}` }));
      return rejectWithValue(error.message);
    }
  }
);


// --- 5. Extended Selectors (Expanded) ---
// These selectors provide derived state and complex query capabilities.

/**
 * @typedef {import("@reduxjs/toolkit").EntityState<Counterparty> & {loading: string, error: string, aiProcessingStatus: AiProcessingState, aiProcessingError: string, lastAiProcessedId: string, recentActivityLogs: object[], filters: object, pagination: object}} CounterpartiesSliceState
 * @typedef {{counterparties: CounterpartiesSliceState, contacts: {entities: object}}} RootState
 */

/**
 * Selects all counterparties that are currently active.
 * @param {RootState} state - The root Redux state.
 * @returns {Counterparty[]} An array of active counterparties.
 */
export const selectActiveCounterparties = (state) =>
  baseSelector.selectAll(state).filter((cp) => cp.status === 'ACTIVE');

/**
 * Selects all counterparties with a risk level above a certain threshold.
 * @param {RootState} state - The root Redux state.
 * @param {RiskLevel} minRisk - The minimum risk level to filter by.
 * @returns {Counterparty[]} An array of high-risk counterparties.
 */
export const selectCounterpartiesByMinRisk = (state, minRisk) => {
  const riskOrder = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3 };
  const threshold = riskOrder[minRisk];
  return baseSelector.selectAll(state).filter((cp) => riskOrder[cp.riskLevel] >= threshold);
};

/**
 * Selects counterparties that are pending compliance review or overdue.
 * @param {RootState} state - The root Redux state.
 * @returns {Counterparty[]} An array of counterparties needing compliance review.
 */
export const selectCounterpartiesNeedingComplianceReview = (state) =>
  baseSelector.selectAll(state).filter((cp) => cp.compliance?.status === 'PENDING_REVIEW' ||
    (cp.compliance?.nextReviewDate && new Date(cp.compliance.nextReviewDate) < new Date()));

/**
 * Selects a counterparty along with its primary contact information (simulated join).
 * Assumes a `contacts` slice exists in the Redux store.
 * @param {RootState} state - The root Redux state.
 * @param {string} counterpartyId - The ID of the counterparty.
 * @returns {Counterparty & {primaryContact?: object} | undefined} The counterparty with its primary contact, or undefined.
 */
export const selectCounterpartyWithPrimaryContact = (state, counterpartyId) => {
  const counterparty = baseSelector.selectById(state, counterpartyId);
  if (!counterparty) return undefined;
  // This simulates a join with another slice's selector, illustrating cross-slice interaction
  // For this demo, we'll just mock the contact based on ID.
  const primaryContact = state.contacts?.entities[counterparty.primaryContactId] || {
    id: counterparty.primaryContactId,
    name: `Contact for ${counterparty.primaryContactId}`,
    email: `contact_${counterparty.primaryContactId}@example.com`,
    phone: "+1-555-123-4567",
  };
  return { ...counterparty, primaryContact };
};

/**
 * Selects counterparties with AI-detected anomalies.
 * @param {RootState} state - The root Redux state.
 * @returns {Counterparty[]} An array of counterparties with current anomalies.
 */
export const selectCounterpartiesWithAnomalies = (state) =>
  baseSelector.selectAll(state).filter((cp) =>
    cp.aiInsights?.anomalyDetection?.anomalies && cp.aiInsights.anomalyDetection.anomalies.length > 0
  );

/**
 * Selects counterparties whose financial forecast predicts negative growth.
 * @param {RootState} state - The root Redux state.
 * @returns {Counterparty[]} An array of counterparties with a concerning financial outlook.
 */
export const selectCounterpartiesWithNegativeFinancialOutlook = (state) =>
  baseSelector.selectAll(state).filter((cp) =>
    cp.aiInsights?.financialForecast?.projections &&
    cp.aiInsights.financialForecast.projections.length > 1 &&
    cp.aiInsights.financialForecast.projections[cp.aiInsights.financialForecast.projections.length - 1].revenue <
    cp.aiInsights.financialForecast.projections[0].revenue // Revenue decreased from start to end of forecast
  );

/**
 * Selects counterparties that have AI-generated risk mitigation plans available.
 * @param {RootState} state - The root Redux state.
 * @returns {Counterparty[]} An array of counterparties with active mitigation plans.
 */
export const selectCounterpartiesWithMitigationPlans = (state) =>
  baseSelector.selectAll(state).filter((cp) =>
    cp.aiInsights?.riskMitigation?.status === AiProcessingState.FULFILLED &&
    cp.aiInsights.riskMitigation.actions &&
    cp.aiInsights.riskMitigation.actions.length > 0
  );

/**
 * Selects the overall AI processing status for the counterparties slice.
 * @param {RootState} state - The root Redux state.
 * @returns {AiProcessingState} The current AI processing state.
 */
export const selectAiProcessingStatus = (state) => state.counterparties.aiProcessingStatus;

/**
 * Selects the last AI processing error, if any.
 * @param {RootState} state - The root Redux state.
 * @returns {string|null} The error message or null.
 */
export const selectAiProcessingError = (state) => state.counterparties.aiProcessingError;

/**
 * Selects the ID of the last counterparty that underwent a major AI operation.
 * @param {RootState} state - The root Redux state.
 * @returns {string|null} The ID or null.
 */
export const selectLastAiProcessedId = (state) => state.counterparties.lastAiProcessedId;

/**
 * Selects the list of recent activity logs.
 * @param {RootState} state - The root Redux state.
 * @returns {object[]} Array of activity log entries.
 */
export const selectRecentActivityLogs = (state) => state.counterparties.recentActivityLogs;

/**
 * Selects current filters applied to the counterparty list.
 * @param {RootState} state - The root Redux state.
 * @returns {object} Current filter settings.
 */
export const selectCounterpartyFilters = (state) => state.counterparties.filters;

/**
 * Selects current pagination information for the counterparty list.
 * @param {RootState} state - The root Redux state.
 * @returns {object} Current pagination settings.
 */
export const selectCounterpartyPagination = (state) => state.counterparties.pagination;

// Augment the exported selector object with extended selectors
export const selector = {
  ...baseSelector, // Include all base selectors (selectAll, selectById, etc.)
  selectActiveCounterparties,
  selectCounterpartiesByMinRisk,
  selectCounterpartiesNeedingComplianceReview,
  selectCounterpartyWithPrimaryContact,
  selectCounterpartiesWithAnomalies,
  selectCounterpartiesWithNegativeFinancialOutlook,
  selectCounterpartiesWithMitigationPlans,
  selectAiProcessingStatus,
  selectAiProcessingError,
  selectLastAiProcessedId,
  selectRecentActivityLogs,
  selectCounterpartyFilters,
  selectCounterpartyPagination,
};

// Final default export as required by the original file.
export default reducer;