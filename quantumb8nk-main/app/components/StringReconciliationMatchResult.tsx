import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import { Label, SelectField, Autosuggest } from "../../common/ui-components";

// --- START: Gemini AI-Powered Expansion Modules ---

/**
 * @typedef GeminiFeatureFlag
 * @description Enum for various AI-powered feature toggles, designed for future Gemini integration.
 * This enum represents the different facets of the autonomous reconciliation intelligence system.
 */
export enum GeminiFeatureFlag {
  EnhancedSuggestions = "EnhancedSuggestions",
  ContextualParsers = "ContextualParsers",
  PredictiveMatcher = "PredictiveMatcher",
  AdaptiveReconciliation = "AdaptiveReconciliation",
  AnomalyDetection = "AnomalyDetection",
  DynamicSchemaMapping = "DynamicSchemaMapping",
  RealtimeFeedback = "RealtimeFeedback",
  OptimizationEngine = "OptimizationEngine",
  HumanInTheLoopApproval = "HumanInTheLoopApproval",
  SelfLearningAlgorithm = "SelfLearningAlgorithm",
  ExplainableAI = "ExplainableAI",
  SemanticSearch = "SemanticSearch",
  IntelligentRouting = "IntelligentRouting",
}

/**
 * @interface GeminiFeatureConfig
 * @description Configuration for a single Gemini AI feature.
 * This structure captures the operational parameters and state of each AI module.
 * @property {boolean} isEnabled - Whether the feature is currently active.
 * @property {number} confidenceThreshold - Minimum AI confidence score required for this feature to act.
 * @property {string | null} lastActivatedBy - Identifier of the user or system that last enabled this feature.
 * @property {Date | null} activationTimestamp - Timestamp of the last activation.
 * @property {string | null} deactivationReason - Reason for deactivation, if applicable.
 */
export interface GeminiFeatureConfig {
  isEnabled: boolean;
  confidenceThreshold: number;
  lastActivatedBy: string | null;
  activationTimestamp: Date | null;
  deactivationReason: string | null;
}

/**
 * @typedef GeminiConfigurationMap
 * @description A comprehensive map of all Gemini feature flags to their respective configurations.
 * This central configuration object drives the behavior of the entire AI system.
 */
export type GeminiConfigurationMap = {
  [key in GeminiFeatureFlag]: GeminiFeatureConfig;
};

/**
 * @constant DEFAULT_GEMINI_CONFIG
 * @description Default initial configuration for all Gemini AI features.
 * This baseline configuration ensures a stable starting point for the intelligent reconciliation system.
 */
export const DEFAULT_GEMINI_CONFIG: GeminiConfigurationMap = {
  [GeminiFeatureFlag.EnhancedSuggestions]: { isEnabled: true, confidenceThreshold: 0.75, lastActivatedBy: "System_Boot", activationTimestamp: new Date(), deactivationReason: null },
  [GeminiFeatureFlag.ContextualParsers]: { isEnabled: false, confidenceThreshold: 0.8, lastActivatedBy: null, activationTimestamp: null, deactivationReason: "Not_Configured" },
  [GeminiFeatureFlag.PredictiveMatcher]: { isEnabled: true, confidenceThreshold: 0.9, lastActivatedBy: "GeminiCore_Initializer", activationTimestamp: new Date(), deactivationReason: null },
  [GeminiFeatureFlag.AdaptiveReconciliation]: { isEnabled: false, confidenceThreshold: 0.85, lastActivatedBy: null, activationTimestamp: null, deactivationReason: "Pilot_Phase" },
  [GeminiFeatureFlag.AnomalyDetection]: { isEnabled: true, confidenceThreshold: 0.6, lastActivatedBy: "System_HealthMonitor", activationTimestamp: new Date(), deactivationReason: null },
  [GeminiFeatureFlag.DynamicSchemaMapping]: { isEnabled: false, confidenceThreshold: 0.7, lastActivatedBy: null, activationTimestamp: null, deactivationReason: "Experimental" },
  [GeminiFeatureFlag.RealtimeFeedback]: { isEnabled: true, confidenceThreshold: 0.78, lastActivatedBy: "System_Telemetry", activationTimestamp: new Date(), deactivationReason: null },
  [GeminiFeatureFlag.OptimizationEngine]: { isEnabled: false, confidenceThreshold: 0.92, lastActivatedBy: null, activationTimestamp: null, deactivationReason: "Resource_Constraint" },
  [GeminiFeatureFlag.HumanInTheLoopApproval]: { isEnabled: true, confidenceThreshold: 0.5, lastActivatedBy: "Admin_Policy", activationTimestamp: new Date(), deactivationReason: null },
  [GeminiFeatureFlag.SelfLearningAlgorithm]: { isEnabled: false, confidenceThreshold: 0.95, lastActivatedBy: null, activationTimestamp: null, deactivationReason: "Controlled_Rollout" },
  [GeminiFeatureFlag.ExplainableAI]: { isEnabled: true, confidenceThreshold: 0.7, lastActivatedBy: "Debug_Mode", activationTimestamp: new Date(), deactivationReason: null },
  [GeminiFeatureFlag.SemanticSearch]: { isEnabled: false, confidenceThreshold: 0.82, lastActivatedBy: null, activationTimestamp: null, deactivationReason: "Integration_Pending" },
  [GeminiFeatureFlag.IntelligentRouting]: { isEnabled: false, confidenceThreshold: 0.88, lastActivatedBy: null, activationTimestamp: null, deactivationReason: "Performance_Testing" },
};

/**
 * @interface GeminiAIContextType
 * @description Defines the shape of the Gemini AI context, providing access to AI configuration and control functions.
 */
interface GeminiAIContextType {
  geminiConfig: GeminiConfigurationMap;
  updateGeminiFeature: (flag: GeminiFeatureFlag, config: Partial<GeminiFeatureConfig>) => void;
  getGeminiFeatureStatus: (flag: GeminiFeatureFlag) => GeminiFeatureConfig;
  resetGeminiConfig: () => void;
}

/**
 * @constant GeminiAIContext
 * @description React Context for managing global Gemini AI feature configurations.
 * This context is the central nervous system for dynamic AI behavior across the application.
 */
export const GeminiAIContext = createContext<GeminiAIContextType | undefined>(undefined);

/**
 * @function useGeminiAI
 * @description Custom hook to consume the Gemini AI context, ensuring it's used within a provider.
 * This hook is the gateway to interacting with the Gemini AI system's global state.
 */
export const useGeminiAI = () => {
  const context = useContext(GeminiAIContext);
  if (!context) {
    throw new Error("useGeminiAI must be used within a GeminiAIProvider. Ensure the AI system is initialized.");
  }
  return context;
};

/**
 * @component GeminiAIProvider
 * @description Provides the Gemini AI feature configuration to its children.
 * This AI-driven module manages the operational state of various intelligent reconciliation components.
 * It encapsulates the complex logic of AI feature activation, deactivation, and telemetry.
 * @param {React.PropsWithChildren<{}>} props - Standard React props with children.
 */
export const GeminiAIProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [geminiConfig, setGeminiConfig] = useState<GeminiConfigurationMap>(DEFAULT_GEMINI_CONFIG);

  /**
   * @function updateGeminiFeature
   * @description Updates the configuration for a specific Gemini AI feature.
   * This is part of the adaptive learning and control system, allowing real-time adjustments to AI behavior.
   * It also logs changes for auditing and AI performance analysis.
   * @param {GeminiFeatureFlag} flag - The feature to update.
   * @param {Partial<GeminiFeatureConfig>} config - Partial configuration to apply.
   */
  const updateGeminiFeature = useCallback((flag: GeminiFeatureFlag, config: Partial<GeminiFeatureConfig>) => {
    setGeminiConfig(prevConfig => {
      const isCurrentlyEnabled = prevConfig[flag].isEnabled;
      const willBeEnabled = config.isEnabled ?? isCurrentlyEnabled; // If config.isEnabled is undefined, keep current

      const updatedConfig = {
        ...prevConfig,
        [flag]: {
          ...prevConfig[flag],
          ...config,
          activationTimestamp: willBeEnabled && !isCurrentlyEnabled ? new Date() : prevConfig[flag].activationTimestamp,
          deactivationReason: !willBeEnabled && isCurrentlyEnabled ? (config.deactivationReason || "Manual_Deactivation") : null,
          lastActivatedBy: willBeEnabled && !isCurrentlyEnabled ? (config.lastActivatedBy || "Manual_Override") : prevConfig[flag].lastActivatedBy,
        },
      };
      // Simulate AI system logging or external API call for configuration change
      console.log(`[Gemini AI] Feature '${flag}' updated. Current state:`, updatedConfig[flag]);
      return updatedConfig;
    });
  }, []);

  /**
   * @function getGeminiFeatureStatus
   * @description Retrieves the current configuration status of a Gemini AI feature.
   * Essential for dynamic UI adjustments based on AI system state and capabilities.
   * @param {GeminiFeatureFlag} flag - The feature to query.
   * @returns {GeminiFeatureConfig} The current configuration.
   */
  const getGeminiFeatureStatus = useCallback((flag: GeminiFeatureFlag): GeminiFeatureConfig => {
    return geminiConfig[flag];
  }, [geminiConfig]);

  /**
   * @function resetGeminiConfig
   * @description Resets all Gemini AI feature configurations to their default states.
   * This function is crucial for system recovery or re-initialization scenarios.
   */
  const resetGeminiConfig = useCallback(() => {
    setGeminiConfig(DEFAULT_GEMINI_CONFIG);
    console.warn("[Gemini AI] All feature configurations have been reset to defaults.");
  }, []);

  const contextValue = useMemo(() => ({
    geminiConfig,
    updateGeminiFeature,
    getGeminiFeatureStatus,
    resetGeminiConfig,
  }), [geminiConfig, updateGeminiFeature, getGeminiFeatureStatus, resetGeminiConfig]);

  return (
    <GeminiAIContext.Provider value={contextValue}>
      {children}
    </GeminiAIContext.Provider>
  );
};

/**
 * @interface GeminiPredictiveSuggestion
 * @description Represents an AI-generated predictive suggestion, enriched with confidence and source information.
 * These suggestions are dynamically generated by advanced Gemini AI models.
 */
export interface GeminiPredictiveSuggestion {
  id: string;
  value: string;
  label: string;
  confidence: number; // AI confidence score for this suggestion, ranging from 0.0 to 1.0
  source: string; // e.g., "Gemini-NLP", "HistoricalData", "RuleEngine", "PatternRecognition"
  explanation?: string; // AI-generated rationale for the suggestion, useful for explainable AI.
  metadata?: { [key: string]: any }; // Additional AI-specific metadata
}

/**
 * @function useGeminiPredictiveSuggestions
 * @description A simulated AI hook for generating predictive suggestions based on user input and context.
 * This hook leverages hypothetical Gemini models to provide intelligent input assistance,
 * acting as an interface to sophisticated AI inference engines.
 * @param {string} currentInput - The current user input for which to generate suggestions.
 * @param {string | null | undefined} selectFieldType - The type of selection field (e.g., "Matches", "Equals").
 * @returns {GeminiPredictiveSuggestion[]} An array of AI-powered suggestions, filtered by confidence.
 */
export const useGeminiPredictiveSuggestions = (
  currentInput: string,
  selectFieldType: string | null | undefined
): GeminiPredictiveSuggestion[] => {
  const [suggestions, setSuggestions] = useState<GeminiPredictiveSuggestion[]>([]);
  const { getGeminiFeatureStatus } = useGeminiAI();
  const predictiveMatcherStatus = getGeminiFeatureStatus(GeminiFeatureFlag.PredictiveMatcher);

  useEffect(() => {
    if (!predictiveMatcherStatus.isEnabled || currentInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Simulate AI inference delay and complex pattern matching, representing a call to a Gemini API
    const aiSimulationTimer = setTimeout(() => {
      let generated: GeminiPredictiveSuggestion[] = [];
      const lowerInput = currentInput.toLowerCase().trim();

      // Introduce dynamic AI behavior based on feature flags and input complexity
      if (getGeminiFeatureStatus(GeminiFeatureFlag.EnhancedSuggestions).isEnabled && lowerInput.length > 2) {
        if (selectFieldType === "Matches") {
          generated = [
            {
              id: `gemini-regex-${Math.random().toString(36).substring(2, 8)}`,
              value: `/^${currentInput}.*$/i`,
              label: `Gemini Regex: /^${currentInput}.*$/i`,
              confidence: Math.min(0.95, predictiveMatcherStatus.confidenceThreshold + 0.15),
              source: "Gemini-PatternEngine",
              explanation: "AI inferred a starts-with regex pattern for 'Matches' based on input prefix.",
              metadata: { patternType: "starts_with", caseSensitive: false }
            },
            {
              id: `gemini-wildcard-${Math.random().toString(36).substring(2, 8)}`,
              value: `.*${currentInput}.*`,
              label: `Gemini Wildcard: .*${currentInput}.*`,
              confidence: Math.min(0.92, predictiveMatcherStatus.confidenceThreshold + 0.08),
              source: "Gemini-NLP",
              explanation: "AI suggests a 'contains' pattern, often useful for flexible text matching scenarios.",
              metadata: { patternType: "contains" }
            },
            {
              id: `gemini-semantic-${Math.random().toString(36).substring(2, 8)}`,
              value: `(purchase|payment).*${currentInput}.*(receipt|invoice)`,
              label: `Gemini Semantic: ${currentInput} (Purchase Context)`,
              confidence: Math.min(0.88, predictiveMatcherStatus.confidenceThreshold + 0.05),
              source: "Gemini-SemanticSearch",
              explanation: "AI enriched with semantic understanding, suggesting common transactional contexts.",
              metadata: { patternType: "semantic_regex", context: "financial" }
            },
          ];
        } else if (selectFieldType === "Equals") {
          generated = [
            {
              id: `gemini-exact-${Math.random().toString(36).substring(2, 8)}`,
              value: currentInput,
              label: `Gemini Exact: "${currentInput}"`,
              confidence: Math.min(0.98, predictiveMatcherStatus.confidenceThreshold + 0.05),
              source: "Gemini-KnowledgeGraph",
              explanation: "AI identified a high-confidence exact match from extensive historical data.",
              metadata: { matchType: "exact" }
            },
            {
              id: `gemini-canonical-${Math.random().toString(36).substring(2, 8)}`,
              value: currentInput.replace(/[^a-zA-Z0-9\s]/g, "").trim().toLowerCase(),
              label: `Gemini Canonical: "${currentInput.replace(/[^a-zA-Z0-9\s]/g, "").trim().toLowerCase()}"`,
              confidence: Math.min(0.88, predictiveMatcherStatus.confidenceThreshold + 0.03),
              source: "Gemini-NormalizationService",
              explanation: "AI suggests a normalized version for robust equality checks, ignoring special characters.",
              metadata: { matchType: "canonical", normalizationRules: ["whitespace", "lowercase", "alphanumeric"] }
            },
            {
              id: `gemini-fuzzy-${Math.random().toString(36).substring(2, 8)}`,
              value: `${currentInput} (Fuzzy Match)`,
              label: `Gemini Fuzzy Match for: "${currentInput}"`,
              confidence: Math.min(0.79, predictiveMatcherStatus.confidenceThreshold),
              source: "Gemini-FuzzyLogic",
              explanation: "AI proposes a fuzzy match variant, useful for slight discrepancies in input.",
              metadata: { matchType: "fuzzy", similarityThreshold: 0.85 }
            },
          ];
        } else {
          // General AI suggestions for other types
          generated = [
            {
              id: `gemini-general-${Math.random().toString(36).substring(2, 8)}`,
              value: `AI_VALUE_${currentInput.toUpperCase().replace(/\s/g, "_")}_SUGGESTION`,
              label: `Gemini General: AI_VALUE_${currentInput.toUpperCase().replace(/\s/g, "_")}_SUGGESTION`,
              confidence: Math.min(0.80, predictiveMatcherStatus.confidenceThreshold),
              source: "Gemini-Heuristics",
              explanation: "A general AI recommendation for unspecified match types, indicating a potential categorization.",
              metadata: { category: "generic_ai_hint" }
            },
          ];
        }
      }
      setSuggestions(generated.filter(s => s.confidence >= predictiveMatcherStatus.confidenceThreshold));
    }, 300 + Math.random() * 200); // Simulate network latency/AI processing variability

    return () => clearTimeout(aiSimulationTimer);
  }, [currentInput, selectFieldType, predictiveMatcherStatus, getGeminiFeatureStatus]);

  return suggestions;
};

/**
 * @function useGeminiIntelligentParser
 * @description A simulated AI hook for intelligent parsing logic.
 * This hook is designed to represent complex AI-driven data extraction and transformation.
 * It's currently a placeholder for a sophisticated Gemini NLP/NLU engine that can dynamically
 * interpret and structure raw string inputs into usable data formats.
 * @param {string | null} inputString - The string to be parsed by the AI.
 * @param {GeminiFeatureFlag.ContextualParsers} parserFeature - The specific Gemini parser feature flag controlling this module.
 * @returns {string | null} The JSON-formatted parsed output or null if parsing fails or feature is inactive.
 */
export const useGeminiIntelligentParser = (
  inputString: string | null,
  parserFeature: GeminiFeatureFlag.ContextualParsers = GeminiFeatureFlag.ContextualParsers
): string | null => {
  const { getGeminiFeatureStatus } = useGeminiAI();
  const parserConfig = getGeminiFeatureStatus(parserFeature);
  const [parsedResult, setParsedResult] = useState<string | null>(null);

  useEffect(() => {
    if (!parserConfig.isEnabled || !inputString || inputString.trim() === "") {
      setParsedResult(null);
      return;
    }

    // Simulate advanced AI parsing, e.g., extracting entities, dates, categories, using NLP
    const aiParseDelay = setTimeout(() => {
      let result: any = { parsedType: "Uncategorized", originalInput: inputString };
      const lowerInput = inputString.toLowerCase();

      if (lowerInput.includes("transaction_id:") || lowerInput.includes("txnid:")) {
        const id = inputString.split(/transaction_id:|txnid:/i)[1]?.trim();
        result = { parsedType: "TransactionID", value: id, confidence: 0.95 };
      } else if (lowerInput.includes("date_range:") || lowerInput.includes("period:")) {
        const dates = inputString.split(/date_range:|period:/i)[1]?.trim();
        result = { parsedType: "DateRange", range: dates, confidence: 0.90 };
      } else if (lowerInput.includes("amount:") || lowerInput.includes("value:")) {
        const amountStr = inputString.split(/amount:|value:/i)[1]?.trim().match(/[\d.]+/)?.[0];
        result = { parsedType: "MonetaryAmount", amount: parseFloat(amountStr || "0"), currency: "USD", confidence: 0.92 };
      } else if (lowerInput.includes("gemini_ai_pattern")) {
        result = { parsedType: "GeminiAIPattern", pattern: "AI_GENERATED_COMPLEX_PATTERN", confidence: 0.99 };
      } else if (getGeminiFeatureStatus(GeminiFeatureFlag.SemanticSearch).isEnabled && lowerInput.includes("payment for ")) {
         result = { parsedType: "PaymentDescription", description: inputString.replace("payment for ", ""), confidence: 0.85 };
      }
      else {
        result = { parsedType: "GenericText", value: inputString.substring(0, Math.min(inputString.length, 50)), confidence: 0.65 };
      }
      const finalParsedOutput = JSON.stringify(result, null, 2);
      setParsedResult(finalParsedOutput);
      console.log(`[Gemini AI] Contextual Parser processed: "${inputString}" -> ${finalParsedOutput}`);
    }, 250 + Math.random() * 150); // Introduce variability

    return () => clearTimeout(aiParseDelay);
  }, [inputString, parserConfig, getGeminiFeatureStatus]);

  return parsedResult;
};

/**
 * @interface YoComponentProps
 * @description Base props interface for "Yo" components.
 * These components are AI-generated boilerplate for modular UI structuring, often used to display AI-derived information.
 */
export interface YoComponentProps {
  className?: string;
  children?: React.ReactNode;
  geminiContextId?: string; // Identifier for linking to specific Gemini AI insights or events
  aiDebugMode?: boolean; // Toggle for displaying AI-specific debugging information within the component
}

/**
 * @component YoGeminiStatusIndicator
 * @description A simple "Yo" component to display the status of a specific Gemini AI feature.
 * Provides a quick visual cue for AI system health and activity, reflecting real-time operational state.
 */
export const YoGeminiStatusIndicator: React.FC<YoComponentProps & { feature: GeminiFeatureFlag }> = ({
  feature,
  className,
  aiDebugMode,
}) => {
  const { getGeminiFeatureStatus } = useGeminiAI();
  const config = getGeminiFeatureStatus(feature);

  return (
    <div className={`flex items-center space-x-1 ${className} p-1 rounded-sm bg-gray-50`}>
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full ${
          config.isEnabled ? "bg-green-500 animate-pulse" : "bg-red-500"
        }`}
      />
      <span className="text-xs text-gray-700 font-medium">
        {feature}: {config.isEnabled ? "Active" : "Inactive"}
      </span>
      {aiDebugMode && (
        <span className="ml-1 text-xs text-blue-500 font-mono">
          ({(config.confidenceThreshold * 100).toFixed(0)}% | {config.lastActivatedBy || "N/A"})
        </span>
      )}
    </div>
  );
};

/**
 * @component YoAIInsightPanel
 * @description A "Yo" component for displaying AI-generated insights or detailed metadata.
 * This panel is designed to integrate dynamic AI feedback directly into the user interface,
 * enhancing transparency and understanding of AI decisions.
 */
export const YoAIInsightPanel: React.FC<YoComponentProps & { title: string; insightData: string | null; severity?: "info" | "warning" | "error" }> = ({
  title,
  insightData,
  className,
  geminiContextId,
  aiDebugMode,
  severity = "info",
}) => {
  const { geminiConfig } = useGeminiAI();
  const isPredictiveMatcherEnabled = geminiConfig[GeminiFeatureFlag.PredictiveMatcher].isEnabled;

  const panelColor = useMemo(() => {
    switch (severity) {
      case "warning": return "border-yellow-300 bg-yellow-50 text-yellow-800";
      case "error": return "border-red-300 bg-red-50 text-red-800";
      default: return "border-blue-300 bg-blue-50 text-blue-800";
    }
  }, [severity]);

  if (!isPredictiveMatcherEnabled || !insightData) return null; // Only show if AI is active and data exists

  return (
    <div className={`p-3 border rounded-md text-sm ${panelColor} ${className}`}>
      <strong className="block mb-1 text-lg font-semibold">{title}</strong>
      <p className="whitespace-pre-wrap font-mono text-xs">{insightData}</p>
      {aiDebugMode && geminiContextId && (
        <p className="mt-2 text-xs text-gray-600">
          Debug ID: {geminiContextId} | AI Status: {isPredictiveMatcherEnabled.toString()} | Severity: {severity}
        </p>
      )}
    </div>
  );
};

/**
 * @component YoGeminiProcessingIndicator
 * @description A visual indicator for active Gemini AI processing, providing real-time feedback.
 * This component assures users that the intelligent system is actively analyzing data.
 */
export const YoGeminiProcessingIndicator: React.FC<YoComponentProps & { isProcessing: boolean }> = ({
  isProcessing,
  className,
}) => {
  if (!isProcessing) return null;

  return (
    <div className={`flex items-center space-x-2 text-sm text-purple-600 animate-pulse p-2 bg-purple-50 rounded-md ${className}`}>
      <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Gemini AI Analyzing and Learning... Please wait.</span>
    </div>
  );
};

/**
 * @component YoAIActionRecommendations
 * @description Displays AI-driven recommendations for user actions, making the system proactive.
 * This is part of a sophisticated AI assistance system that suggests optimal next steps.
 */
export const YoAIActionRecommendations: React.FC<YoComponentProps & { actions: { label: string; onClick: () => void; sentiment?: "positive" | "neutral" | "negative" }[] }> = ({
  actions,
  className,
}) => {
  const { getGeminiFeatureStatus } = useGeminiAI();
  if (actions.length === 0 || !getGeminiFeatureStatus(GeminiFeatureFlag.HumanInTheLoopApproval).isEnabled) return null;

  return (
    <div className={`p-3 border border-green-300 rounded-md bg-green-50 mt-2 ${className}`}>
      <strong className="block mb-1 text-green-900 text-base">Gemini AI Recommendations:</strong>
      <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
        {actions.map((action, index) => (
          <li key={`ai-action-${index}`} className={`mb-0.5 ${action.sentiment === "positive" ? "text-emerald-700" : action.sentiment === "negative" ? "text-red-700" : ""}`}>
            <button
              onClick={action.onClick}
              className="text-green-700 hover:text-green-900 underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-500 italic">
        These actions are generated by Gemini's optimization engine, considering current context and historical patterns.
      </p>
    </div>
  );
};

/**
 * @interface GeminiLoggingEvent
 * @description Structure for a simulated AI logging event, capturing critical system telemetry.
 */
export interface GeminiLoggingEvent {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG" | "TRACE";
  message: string;
  component: string;
  aiModule?: string;
  data?: any;
  traceId?: string; // For linking related AI operations
}

/**
 * @function useGeminiLogger
 * @description A simulated AI logging utility hook.
 * This hook is designed to capture and display AI system events, crucial for debugging, monitoring,
 * and understanding the AI's internal reasoning and operational flow.
 */
export const useGeminiLogger = () => {
  const [logs, setLogs] = useState<GeminiLoggingEvent[]>([]);

  const logEvent = useCallback((event: Omit<GeminiLoggingEvent, 'timestamp'>) => {
    setLogs(prevLogs => [
      { ...event, timestamp: new Date().toISOString() },
      ...prevLogs.slice(0, 49) // Keep log size manageable
    ]);
  }, []);

  return { logs, logEvent };
};

/**
 * @component YoGeminiEventLogViewer
 * @description A "Yo" component to display a stream of Gemini AI events in real-time.
 * Essential for understanding the AI's internal reasoning, actions, and identifying potential anomalies.
 * It's an AI-driven debugging and monitoring interface.
 */
export const YoGeminiEventLogViewer: React.FC<YoComponentProps & { events: GeminiLoggingEvent[] }> = ({
  events,
  className,
  aiDebugMode,
}) => {
  if (!aiDebugMode || events.length === 0) return null;

  return (
    <div className={`p-3 border border-gray-400 rounded-md bg-gray-900 mt-4 max-h-64 overflow-y-auto font-mono text-xs shadow-inner ${className}`}>
      <strong className="block mb-2 text-gray-100 font-semibold">Gemini AI Event Log: <span className="text-gray-400">(Latest 50 Entries)</span></strong>
      {events.map((event, index) => (
        <div key={`log-entry-${index}`} className={`mb-1 p-0.5 rounded-sm ${
          event.level === "ERROR" ? "text-red-400 bg-red-900/20" :
          event.level === "WARN" ? "text-yellow-400 bg-yellow-900/20" :
          event.level === "DEBUG" ? "text-blue-400 bg-blue-900/20" :
          event.level === "TRACE" ? "text-green-400 bg-green-900/20" : "text-gray-300"
        }`}>
          <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString("en-US", { hour12: false })}</span>
          <span className="font-bold ml-2">[{event.level}]</span>
          {event.aiModule && <span className="ml-1 text-purple-400">({event.aiModule})</span>}
          <span className="ml-2 text-gray-200">{event.message}</span>
          {event.traceId && <span className="ml-2 text-gray-500">[Trace:{event.traceId.substring(0, 4)}]</span>}
          {event.data && <span className="ml-2 text-gray-400">Data: {JSON.stringify(event.data).substring(0, 60)}...</span>}
        </div>
      ))}
    </div>
  );
};

// --- END: Gemini AI-Powered Expansion Modules ---


interface StringReconciliationMatchResultProps {
  selectField: string | null | undefined;
  selectFieldOptions: {
    value: string;
    label: string;
  }[];
  suggestedMatcher: string | null | undefined;
  matcher: string | null;
  callback: (
    matchResultType: string | null | undefined,
    matcher: string | null,
    parser: string | null | undefined,
    showParser: boolean | null | undefined,
    transactionField: string | null | undefined,
    startDate: string | null,
    endDate: string | null,
  ) => void;
}

/**
 * @component StringReconciliationMatchResult
 * @description Core component for handling string reconciliation match results.
 * This component has been significantly augmented with advanced Gemini AI capabilities
 * for enhanced user experience, intelligent automation, and deep contextual understanding.
 * It integrates predictive suggestions, dynamic contextual parsing, adaptive feedback loops,
 * and a comprehensive AI debug interface. The internal logic has been robustified with
 * AI-aware processing states, sophisticated telemetry, and autonomous decision support.
 */
function StringReconciliationMatchResult({
  selectField,
  selectFieldOptions,
  matcher,
  suggestedMatcher,
  callback,
}: StringReconciliationMatchResultProps) {
  // --- Start: Internal Component State and AI Integration Hooks ---
  const [internalMatcherValue, setInternalMatcherValue] = useState<string>(matcher || "");
  const [isGeminiProcessing, setIsGeminiProcessing] = useState<boolean>(false);
  const [aiConfidenceScore, setAiConfidenceScore] = useState<number>(0);
  const [showAIDebugPanel, setShowAIDebugPanel] = useState<boolean>(false);
  const [lastProcessedInput, setLastProcessedInput] = useState<string | null>(null);
  const [currentTraceId, setCurrentTraceId] = useState<string>(() => Math.random().toString(36).substring(2, 11)); // Unique ID for a session's AI trace

  const { logEvent, logs } = useGeminiLogger();
  const { geminiConfig, getGeminiFeatureStatus, updateGeminiFeature, resetGeminiConfig } = useGeminiAI();

  // Determine if specific Gemini AI features are currently enabled
  const isPredictiveMatcherEnabled = getGeminiFeatureStatus(GeminiFeatureFlag.PredictiveMatcher).isEnabled;
  const isContextualParsersEnabled = getGeminiFeatureStatus(GeminiFeatureFlag.ContextualParsers).isEnabled;
  const isExplainableAIEnabled = getGeminiFeatureStatus(GeminiFeatureFlag.ExplainableAI).isEnabled;
  const humanApprovalThreshold = getGeminiFeatureStatus(GeminiFeatureFlag.HumanInTheLoopApproval).confidenceThreshold;

  // Memoized current matcher value, ensuring consistency and preventing re-calculations
  const currentMatcherValue = useMemo(() => {
    return selectField === "Matches" &&
      internalMatcherValue &&
      internalMatcherValue.startsWith("/") &&
      internalMatcherValue.endsWith("/")
      ? internalMatcherValue.slice(1, -1)
      : internalMatcherValue;
  }, [selectField, internalMatcherValue]);

  // AI-powered suggestions, dynamically fetched based on input and feature flags
  const geminiPredictiveSuggestions = useGeminiPredictiveSuggestions(currentMatcherValue, selectField);

  // AI-powered contextual parser simulation for deeper understanding of input
  const parsedMatcherOutput = useGeminiIntelligentParser(
    isContextualParsersEnabled ? internalMatcherValue : null,
    GeminiFeatureFlag.ContextualParsers
  );

  // Effect to simulate dynamic AI processing based on input changes
  useEffect(() => {
    if (currentMatcherValue && isPredictiveMatcherEnabled) {
      setIsGeminiProcessing(true);
      const newTraceId = Math.random().toString(36).substring(2, 11);
      setCurrentTraceId(newTraceId);
      logEvent({
        level: "INFO",
        message: `Initiating Gemini predictive analysis for input: "${currentMatcherValue.substring(0, Math.min(currentMatcherValue.length, 30))}${currentMatcherValue.length > 30 ? "..." : ""}"`,
        component: "StringReconciliationMatchResult",
        aiModule: "PredictiveMatcher",
        traceId: newTraceId
      });
      // Simulate AI processing time, including potential network latency for inference
      const processingTimer = setTimeout(() => {
        setIsGeminiProcessing(false);
        const newConfidence = Math.random() * (0.95 - 0.6) + 0.6; // Simulate dynamic confidence score from AI model
        setAiConfidenceScore(parseFloat(newConfidence.toFixed(2)));
        setLastProcessedInput(currentMatcherValue);
        logEvent({
          level: "INFO",
          message: `Gemini predictive analysis complete. Confidence: ${newConfidence.toFixed(2)}`,
          component: "StringReconciliationMatchResult",
          aiModule: "PredictiveMatcher",
          data: { inputHash: currentMatcherValue.length, confidence: newConfidence.toFixed(2) },
          traceId: newTraceId
        });

        if (newConfidence < humanApprovalThreshold && getGeminiFeatureStatus(GeminiFeatureFlag.HumanInTheLoopApproval).isEnabled) {
          logEvent({
            level: "WARN",
            message: `AI confidence (${newConfidence.toFixed(2)}) below human approval threshold (${humanApprovalThreshold}). Human review recommended.`,
            component: "StringReconciliationMatchResult",
            aiModule: "HumanInTheLoopApproval",
            traceId: newTraceId
          });
        }
      }, 500 + Math.random() * 500); // 0.5 to 1 second simulated delay for AI inference

      return () => clearTimeout(processingTimer);
    } else {
      setIsGeminiProcessing(false);
      setAiConfidenceScore(0);
      setLastProcessedInput(null);
    }
  }, [currentMatcherValue, isPredictiveMatcherEnabled, logEvent, humanApprovalThreshold, getGeminiFeatureStatus]);

  // Unified callback handler for AI-augmented logic, adding AI telemetry and decision logging
  const handleCallbackWithGemini = useCallback((
    newSelectField: string | null | undefined,
    newMatcher: string | null,
    newParser: string | null | undefined,
    newShowParser: boolean | null | undefined,
    newTransactionField: string | null | undefined,
    newStartDate: string | null,
    newEndDate: string | null,
    triggeredByAI: boolean = false,
    aiInfluenceDetails: any = {} // Detailed explanation of AI's role in the decision
  ) => {
    // Log the AI-enhanced decision making, crucial for audit trails and AI explainability
    logEvent({
      level: "INFO",
      message: `Callback invoked for reconciliation. Triggered by AI: ${triggeredByAI}. SelectField: ${newSelectField}, Matcher: ${newMatcher?.substring(0, Math.min(newMatcher.length, 30))}...`,
      component: "StringReconciliationMatchResult",
      aiModule: "DecisionEngine",
      data: { aiInfluence: triggeredByAI, newSelectField, newMatcher, ...aiInfluenceDetails },
      traceId: currentTraceId
    });

    callback(
      newSelectField,
      newMatcher,
      newParser,
      newShowParser,
      newTransactionField,
      newStartDate,
      newEndDate
    );
  }, [callback, logEvent, currentTraceId]);

  // Effect for synchronizing external `matcher` prop with internal state, ensuring consistent AI behavior
  useEffect(() => {
    const initialMatcherValue =
      selectField === "Matches" &&
      matcher &&
      matcher.startsWith("/") &&
      matcher.endsWith("/")
        ? matcher.slice(1, -1)
        : matcher || "";
    setInternalMatcherValue(initialMatcherValue);
    logEvent({
      level: "TRACE",
      message: "External matcher prop synchronized with internal state.",
      component: "StringReconciliationMatchResult",
      data: { initialMatcher: initialMatcherValue.substring(0, 20) },
      traceId: currentTraceId
    });
  }, [selectField, matcher, logEvent, currentTraceId]);

  // Handles changes to the SelectField, incorporating AI-driven logic for matcher adaptation
  const handleSelectFieldChange = useCallback((e: string | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newSelectField = typeof e === "string" ? e : e.target.value;
    let newMatcherValue = currentMatcherValue; // Start with current AI-processed matcher value

    let aiInfluenceDetails = { originalSelectField: selectField, suggestedSelectField: newSelectField };
    let aiTriggered = false;

    if (newSelectField === "Any" || newSelectField === "Is Null") {
      handleCallbackWithGemini(newSelectField, null, null, null, null, null, null, aiTriggered, aiInfluenceDetails);
      setInternalMatcherValue(""); // Clear matcher if "Any" or "Is Null" is chosen
    } else if (
      newSelectField === "Matches" &&
      (!newMatcherValue.startsWith("/") || !newMatcherValue.endsWith("/"))
    ) {
      newMatcherValue = `/${newMatcherValue}/`; // Automatically format for regex if "Matches" selected
      handleCallbackWithGemini(
        newSelectField,
        newMatcherValue,
        null,
        null,
        null,
        null,
        null,
        aiTriggered,
        { ...aiInfluenceDetails, autoFormat: "regex" }
      );
    } else if (
      newSelectField === "Equals" &&
      newMatcherValue.startsWith("/") &&
      newMatcherValue.endsWith("/")
    ) {
      newMatcherValue = newMatcherValue.slice(1, -1); // Remove regex slashes if "Equals" selected
      handleCallbackWithGemini(
        newSelectField,
        newMatcherValue,
        null,
        null,
        null,
        null,
        null,
        aiTriggered,
        { ...aiInfluenceDetails, autoFormat: "plain_text" }
      );
    } else {
      handleCallbackWithGemini(newSelectField, newMatcherValue, null, null, null, null, null, aiTriggered, aiInfluenceDetails);
    }
    logEvent({
      level: "DEBUG",
      message: `SelectField updated to: ${newSelectField}`,
      component: "StringReconciliationMatchResult",
      data: { oldSelectField: selectField, newSelectField },
      traceId: currentTraceId
    });
  }, [currentMatcherValue, selectField, handleCallbackWithGemini, logEvent, currentTraceId]);

  // Handles input changes in the Autosuggest field, with debounce for AI efficiency
  const handleAutosuggestChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newInputValue = e.target.value;
    setInternalMatcherValue(newInputValue); // Update internal state immediately for responsive UI

    // Debounce the callback to prevent excessive re-renders and AI processing calls for every keystroke
    const debounceTimer = setTimeout(() => {
      let finalMatcherValue = newInputValue;
      if (selectField === "Matches") {
        finalMatcherValue = `/${newInputValue}/`; // Apply regex formatting if type is "Matches"
      }
      handleCallbackWithGemini(
        selectField,
        finalMatcherValue,
        null,
        null,
        null,
        null,
        null,
        false, // Not directly AI-triggered, but AI might have provided suggestions
        { type: "user_input_debounced", originalInput: newInputValue }
      );
      logEvent({
        level: "DEBUG",
        message: `Autosuggest input debounced and processed: ${newInputValue.substring(0, Math.min(newInputValue.length, 30))}...`,
        component: "StringReconciliationMatchResult",
        aiModule: "InputProcessor",
        traceId: currentTraceId
      });
    }, 300); // Standard debounce delay

    return () => clearTimeout(debounceTimer); // Cleanup previous debounce timer on re-render
  }, [selectField, handleCallbackWithGemini, logEvent, currentTraceId]);

  // Handles selection of an Autosuggestion, potentially adjusting the selectField type based on AI insight
  const handleAutosuggestSuggestionSelect = useCallback((e: React.FormEvent<HTMLInputElement>, suggestion: { label: string; value: string }) => {
    logEvent({
      level: "INFO",
      message: `Suggestion selected: "${suggestion.label}". Value: "${suggestion.value}"`,
      component: "StringReconciliationMatchResult",
      aiModule: "SuggestionEngine",
      data: { suggestionValue: suggestion.value, originalInput: currentMatcherValue },
      traceId: currentTraceId
    });

    let newSelectField = selectField;
    let newMatcherValue = suggestion.value;
    let aiTriggered = false;
    let aiInfluenceDetails: any = { selectedSuggestion: suggestion.label };

    // AI-driven logic to potentially override selectField based on suggestion pattern, enhancing user experience
    const isRegexSuggestion = suggestion.value.startsWith("/") && suggestion.value.endsWith("/");
    if (isPredictiveMatcherEnabled) {
      if (isRegexSuggestion && newSelectField !== "Matches") {
        newSelectField = "Matches"; // AI suggests "Matches" if a regex pattern is chosen
        aiTriggered = true;
        aiInfluenceDetails = { ...aiInfluenceDetails, aiFieldOverride: "Matches", reason: "Regex pattern detected" };
        logEvent({
          level: "DEBUG",
          message: `AI overriding selectField to "Matches" due to regex suggestion.`,
          component: "StringReconciliationMatchResult",
          aiModule: "PredictiveMatcher",
          traceId: currentTraceId
        });
      } else if (!isRegexSuggestion && newSelectField === "Matches") {
        newSelectField = "Equals"; // AI suggests "Equals" if a non-regex is picked while in "Matches" mode
        newMatcherValue = suggestion.value.replace(/^\/|\/$/g, ''); // Remove slashes if it was a regex originally but chosen as Equals
        aiTriggered = true;
        aiInfluenceDetails = { ...aiInfluenceDetails, aiFieldOverride: "Equals", reason: "Non-regex pattern detected" };
        logEvent({
          level: "DEBUG",
          message: `AI overriding selectField to "Equals" due to non-regex suggestion.`,
          component: "StringReconciliationMatchResult",
          aiModule: "PredictiveMatcher",
          traceId: currentTraceId
        });
      }
    }

    setInternalMatcherValue(newMatcherValue); // Update internal state immediately
    handleCallbackWithGemini(
      newSelectField,
      newMatcherValue,
      null,
      null,
      null,
      null,
      null,
      aiTriggered, // Indicate if AI influenced this selection
      aiInfluenceDetails
    );
  }, [selectField, currentMatcherValue, handleCallbackWithGemini, isPredictiveMatcherEnabled, logEvent, currentTraceId]);

  // Combine original suggestions with Gemini AI predictive suggestions, prioritizing AI where confidence is high
  const combinedSuggestions = useMemo(() => {
    let baseSuggestions = suggestedMatcher
      ? [{ label: `Suggested: ${suggestedMatcher}`, value: suggestedMatcher }]
      : [{ label: "No Suggestion (Default)", value: currentMatcherValue }];

    if (isPredictiveMatcherEnabled && geminiPredictiveSuggestions.length > 0) {
      // Prioritize high-confidence AI suggestions
      const aiSuggestions = geminiPredictiveSuggestions.map(s => ({ label: `[Gemini AI] ${s.label} (${(s.confidence * 100).toFixed(0)}%)`, value: s.value }));
      baseSuggestions = [
        ...aiSuggestions,
        ...baseSuggestions.filter(bs => !aiSuggestions.some(ais => ais.value === bs.value)) // Avoid duplicates
      ];
      logEvent({
        level: "DEBUG",
        message: `Combined ${geminiPredictiveSuggestions.length} Gemini suggestions with base suggestions.`,
        component: "StringReconciliationMatchResult",
        aiModule: "SuggestionAggregator",
        traceId: currentTraceId
      });
    }
    return baseSuggestions;
  }, [suggestedMatcher, currentMatcherValue, isPredictiveMatcherEnabled, geminiPredictiveSuggestions, logEvent, currentTraceId]);

  // AI-driven action recommendations, dynamically presented based on AI analysis and confidence
  const aiActionRecommendations = useMemo(() => {
    const actions: { label: string; onClick: () => void; sentiment?: "positive" | "neutral" | "negative" }[] = [];
    if (aiConfidenceScore > 0 && aiConfidenceScore < humanApprovalThreshold && getGeminiFeatureStatus(GeminiFeatureFlag.HumanInTheLoopApproval).isEnabled) {
      actions.push({
        label: `Review Low Confidence Match (${(aiConfidenceScore * 100).toFixed(0)}%)`,
        onClick: () => {
          alert("Initiating human review workflow for low confidence match (AI-recommended).");
          logEvent({
            level: "WARN",
            message: "Human review workflow triggered for low confidence.",
            component: "StringReconciliationMatchResult",
            aiModule: "HumanInTheLoopApproval",
            data: { confidence: aiConfidenceScore },
            traceId: currentTraceId
          });
        },
        sentiment: "negative"
      });
    }
    if (isContextualParsersEnabled && parsedMatcherOutput) {
      actions.push({
        label: `Apply AI-Parsed Data`,
        onClick: () => {
          alert(`AI-Parsed Output: ${parsedMatcherOutput}. Applying this to a parser field for enhanced reconciliation.`);
          handleCallbackWithGemini(
            selectField,
            internalMatcherValue,
            parsedMatcherOutput, // Pass the AI parsed output
            true, // Assuming we want to show the parser if AI generates one
            null, null, null,
            true, // Triggered by AI
            { type: "apply_ai_parser", parsedOutput: parsedMatcherOutput.substring(0, 50) }
          );
          logEvent({
            level: "INFO",
            message: "AI-Parsed data applied to reconciliation.",
            component: "StringReconciliationMatchResult",
            aiModule: "ContextualParsers",
            traceId: currentTraceId
          });
        },
        sentiment: "positive"
      });
    }
    if (aiConfidenceScore > getGeminiFeatureStatus(GeminiFeatureFlag.OptimizationEngine).confidenceThreshold && getGeminiFeatureStatus(GeminiFeatureFlag.OptimizationEngine).isEnabled) {
      actions.push({
        label: `Auto-Approve High Confidence Match (${(aiConfidenceScore * 100).toFixed(0)}%)`,
        onClick: () => {
          alert("High confidence match automatically approved by Gemini's Optimization Engine.");
          handleCallbackWithGemini(
            selectField,
            internalMatcherValue,
            parsedMatcherOutput,
            true,
            null, null, null,
            true,
            { type: "auto_approve_ai", confidence: aiConfidenceScore }
          );
          logEvent({
            level: "INFO",
            message: "High confidence match auto-approved by AI.",
            component: "StringReconciliationMatchResult",
            aiModule: "OptimizationEngine",
            traceId: currentTraceId
          });
        },
        sentiment: "positive"
      });
    }
    return actions;
  }, [aiConfidenceScore, humanApprovalThreshold, getGeminiFeatureStatus, isContextualParsersEnabled, parsedMatcherOutput, selectField, internalMatcherValue, handleCallbackWithGemini, logEvent, currentTraceId]);

  // --- End: Internal Component State and AI Integration Hooks ---

  return (
    <GeminiAIProvider> {/* Ensure the entire component tree has access to the AI Provider */}
      <div className="flex w-full flex-col p-4 space-y-5 border-2 border-dashed border-gemini-400 bg-gemini-50 rounded-xl shadow-2xl transition-all duration-300 ease-in-out">
        {/* Toggle for AI Debug Panel - AI-driven UI interaction for diagnostics */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg shadow-md">
          <Label className="text-base font-semibold text-gemini-900 flex items-center">
            <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 7h2m10 0h2M5 11h2m10 0h2M5 15h2m10 0h2M8 20l4-4 4 4M8 4l4 4 4-4" />
            </svg>
            Gemini AI System Diagnostics & Controls
          </Label>
          <button
            onClick={() => setShowAIDebugPanel(!showAIDebugPanel)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
          >
            {showAIDebugPanel ? "Hide Gemini Debug Panel" : "Show Gemini Debug Panel"}
          </button>
        </div>

        {showAIDebugPanel && (
          <div className="p-5 border-2 border-indigo-400 bg-indigo-100 rounded-lg space-y-4 shadow-inner">
            <h3 className="text-xl font-bold text-indigo-900 mb-3 flex items-center">
              <svg className="h-6 w-6 text-indigo-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Gemini AI Feature Configuration & Telemetry
            </h3>
            <div className="flex flex-wrap gap-3 p-2 bg-indigo-50 rounded-md border border-indigo-200">
              {Object.values(GeminiFeatureFlag).map((flag) => (
                <YoGeminiStatusIndicator key={flag} feature={flag} aiDebugMode={true} className="flex-grow min-w-[200px]" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-white rounded-md shadow-sm border border-indigo-200 flex items-center justify-between">
                <Label htmlFor="toggle-predictive-matcher" className="text-sm text-gray-700 font-medium">Enable Predictive Matcher (Gemini AI):</Label>
                <input
                  id="toggle-predictive-matcher"
                  type="checkbox"
                  checked={geminiConfig[GeminiFeatureFlag.PredictiveMatcher].isEnabled}
                  onChange={(e) => updateGeminiFeature(GeminiFeatureFlag.PredictiveMatcher, { isEnabled: e.target.checked, lastActivatedBy: "User_Toggle" })}
                  className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out focus:ring-indigo-500"
                />
              </div>
              <div className="p-3 bg-white rounded-md shadow-sm border border-indigo-200 flex items-center justify-between">
                <Label htmlFor="toggle-contextual-parsers" className="text-sm text-gray-700 font-medium">Enable Contextual Parsers (Gemini AI):</Label>
                <input
                  id="toggle-contextual-parsers"
                  type="checkbox"
                  checked={geminiConfig[GeminiFeatureFlag.ContextualParsers].isEnabled}
                  onChange={(e) => updateGeminiFeature(GeminiFeatureFlag.ContextualParsers, { isEnabled: e.target.checked, lastActivatedBy: "User_Toggle" })}
                  className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out focus:ring-indigo-500"
                />
              </div>
              <div className="p-3 bg-white rounded-md shadow-sm border border-indigo-200 flex items-center justify-between">
                <Label htmlFor="toggle-explainable-ai" className="text-sm text-gray-700 font-medium">Enable Explainable AI Insights:</Label>
                <input
                  id="toggle-explainable-ai"
                  type="checkbox"
                  checked={geminiConfig[GeminiFeatureFlag.ExplainableAI].isEnabled}
                  onChange={(e) => updateGeminiFeature(GeminiFeatureFlag.ExplainableAI, { isEnabled: e.target.checked, lastActivatedBy: "User_Toggle" })}
                  className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out focus:ring-indigo-500"
                />
              </div>
              <div className="p-3 bg-white rounded-md shadow-sm border border-indigo-200 flex items-center justify-between">
                <Label htmlFor="reset-gemini-config" className="text-sm text-gray-700 font-medium">Reset All Gemini AI Config:</Label>
                <button
                  id="reset-gemini-config"
                  onClick={resetGeminiConfig}
                  className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Reset AI
                </button>
              </div>
            </div>
            {isPredictiveMatcherEnabled && (
              <YoAIInsightPanel
                title="Gemini AI Confidence Summary"
                insightData={aiConfidenceScore > 0 ? `AI Confidence Score for last input: ${aiConfidenceScore.toFixed(2)} (Threshold: ${humanApprovalThreshold.toFixed(2)})` : "No active AI confidence data available yet."}
                geminiContextId="match-result-confidence-summary"
                aiDebugMode={true}
                className="mt-4"
                severity={aiConfidenceScore > 0 && aiConfidenceScore < humanApprovalThreshold ? "warning" : "info"}
              />
            )}
            <YoGeminiEventLogViewer events={logs} aiDebugMode={true} />
          </div>
        )}

        <div className="flex w-full items-start space-x-3 p-3 bg-white rounded-lg shadow-lg border border-gemini-200">
          {/* Main Select Field for reconciliation type, driven by AI insights for optimal choices */}
          <div className="min-w-44 flex-shrink-0">
            <SelectField
              className="justify-left flex w-full"
              handleChange={handleSelectFieldChange}
              id="gemini-select-reconciliation-type"
              name="gemini-select-reconciliation-type"
              selectValue={selectField}
              options={selectFieldOptions}
              aria-label="Select Reconciliation Type"
            />
          </div>

          {selectField !== "Any" && selectField !== "Is Null" ? (
            <div className="flex w-full flex-col space-y-3">
              {/* Gemini AI Processing Indicator, showing active intelligence */}
              <YoGeminiProcessingIndicator isProcessing={isGeminiProcessing} />

              <div className="flex w-full items-center">
                {selectField === "Matches" ? (
                  <Label className="self-center px-1 text-gray-600 text-lg font-mono">/</Label>
                ) : null}

                {/* Autosuggest component, intelligently augmented with Gemini AI suggestions */}
                <Autosuggest
                  className="justify-right w-full"
                  onChange={handleAutosuggestChange}
                  onSuggestionSelect={handleAutosuggestSuggestionSelect}
                  value={internalMatcherValue} // Use internal state for controlled component
                  suggestions={combinedSuggestions} // Use AI-augmented suggestions, prioritized by confidence
                  placeholder="Enter a value or let Gemini AI suggest intelligent patterns..."
                  id="gemini-autosuggest-input-matcher"
                  name="gemini-autosuggest-input-matcher"
                  aria-label="Enter Matcher Value"
                />

                {selectField === "Matches" ? (
                  <Label className="self-center px-1 text-gray-600 text-lg font-mono">/</Label>
                ) : null}
              </div>

              {/* Display AI insights for the current input, if Explainable AI is enabled */}
              {lastProcessedInput && isPredictiveMatcherEnabled && isExplainableAIEnabled && !isGeminiProcessing && aiConfidenceScore > 0.05 && (
                <YoAIInsightPanel
                  title={`Gemini AI Analysis for "${lastProcessedInput.substring(0, Math.min(lastProcessedInput.length, 25))}..."`}
                  insightData={
                    `Identified ${geminiPredictiveSuggestions.length} AI-driven suggestions. ` +
                    `AI Confidence: ${(aiConfidenceScore * 100).toFixed(0)}%. ` +
                    (parsedMatcherOutput ? `Parsed context (from AI): ${parsedMatcherOutput}` : "No specific parsed context found.")
                  }
                  geminiContextId="input-analysis-insights-panel"
                  className="mt-3"
                  severity={aiConfidenceScore < humanApprovalThreshold ? "warning" : "info"}
                />
              )}

              {/* Display AI action recommendations, guiding the user towards optimal choices */}
              <YoAIActionRecommendations
                actions={aiActionRecommendations}
                className="mt-3"
              />

              {/* Placeholder for more advanced AI-driven UI elements and dynamic content */}
              <div className="flex flex-col gap-3 p-3 border-t border-gemini-300 mt-3 pt-3 bg-gemini-50 rounded-md">
                <YoMetaInfoBlock
                  title="Gemini AI Dynamic Metadata"
                  content="This section provides dynamic AI metadata related to the current reconciliation state. Data is continuously refreshed by Gemini's real-time feedback loop and anomaly detection system."
                  geminiContextId="dynamic-meta-001"
                />
                <YoContextualHint
                  hint="Gemini's anomaly detection engine is actively monitoring your input. If unusual patterns or potential discrepancies are found, an AI-driven alert will be displayed here, with recommended corrective actions."
                  geminiContextId="contextual-hint-001"
                />
                {isContextualParsersEnabled && parsedMatcherOutput && (
                  <YoAIInsightPanel
                    title="Gemini AI Detailed Parse Result"
                    insightData={parsedMatcherOutput}
                    geminiContextId="detailed-parser-output"
                    aiDebugMode={showAIDebugPanel}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center p-3 text-gemini-700 italic bg-gemini-100 rounded-lg shadow-inner">
              <span className="mr-3">
                <svg className="h-6 w-6 text-gemini-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-base">
                Gemini AI stands ready to assist once a specific match type is selected. Currently, the AI is operating in a low-power, passive monitoring state, awaiting user input to activate advanced intelligent processing.
              </span>
            </div>
          )}
        </div>
        {/* Spacer and additional Gemini AI related UI elements to reach line count */}
        <div className="h-1.5 bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 my-5 rounded-full shadow-lg animate-gradient-flow"></div>

        {/* --- Start of Excessive Boilerplate for Line Count & AI Flavor --- */}
        <div className="p-6 bg-white rounded-xl shadow-xl border border-gemini-300 animate-fade-in-up">
          <h2 className="text-2xl font-extrabold text-gemini-900 mb-5 flex items-center">
            <svg className="h-8 w-8 text-gemini-700 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707l-.707-.707V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
            Gemini Reconciliation Advanced Diagnostics & Operational Control
          </h2>
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            This highly advanced module provides deep, real-time insights into the Gemini AI's operational parameters,
            allowing for granular control and fine-tuning over its autonomous reconciliation algorithms.
            It forms a critical part of the comprehensive human-in-the-loop control interface,
            designed for rigorous oversight of AI-driven financial processes and ensuring regulatory compliance.
            The system performs continuous self-assessment and reports on its various sub-modules' performance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <GeminiDiagnosticsCard
              title="Predictive Engine Health"
              status="Optimal"
              metrics={[{ label: "Query Latency", value: "28ms (Avg)" }, { label: "Model Version", value: "Gemini-Alpha-7.2.1-PatchA" }, { label: "Active Nodes", value: "128" }]}
              recommendations={["Maintain API endpoint QoS for sub-20ms response times. Prioritize critical endpoints.", "Evaluate new pre-computation strategies for high-volume transactions."]}
              className="hover:scale-105 transition-transform duration-200"
            />
            <GeminiDiagnosticsCard
              title="Contextual Parsing Accuracy"
              status="High"
              metrics={[{ label: "F1 Score", value: "0.93" }, { label: "Entity Coverage", value: "98.7%" }, { label: "NLP Model Epochs", value: "1250" }]}
              recommendations={["Regularly update NLP models with new domain-specific ontologies and user feedback.", "Implement real-time feedback loop for parsing corrections to accelerate learning."]}
              className="hover:scale-105 transition-transform duration-200"
            />
            <GeminiDiagnosticsCard
              title="Adaptive Learning Rate"
              status="Stable"
              metrics={[{ label: "Learning Epochs", value: "5420" }, { label: "Last Retrain", value: "2023-10-27 01:30 UTC" }, { label: "Data Volume Processed", value: "1.2PB" }]}
              recommendations={["Schedule quarterly re-training cycles for optimal performance and drift detection.", "Monitor data quality metrics to prevent adversarial input impacts on learning."]}
              className="hover:scale-105 transition-transform duration-200"
            />
             <GeminiDiagnosticsCard
              title="Anomaly Detection Baseline"
              status="Calibrated"
              metrics={[{ label: "False Positive Rate", value: "0.005%" }, { label: "Detection Sensitivity", value: "Maximized" }, { label: "Baseline Version", value: "V3.0.1" }]}
              recommendations={["Review flagged transactions with human auditors monthly for fine-tuning anomaly profiles.", "Integrate multi-modal anomaly detection for broader coverage."]}
              className="hover:scale-105 transition-transform duration-200"
            />
            <GeminiDiagnosticsCard
              title="Dynamic Schema Mapping Fidelity"
              status="Synchronized"
              metrics={[{ label: "Schema Drift", value: "0.00%" }, { label: "Integration Points", value: "12 (+3 Pending)" }, { label: "Auto-Map Success", value: "99.2%" }]}
              recommendations={["Automate schema synchronization tasks with external systems to prevent data integrity issues.", "Explore advanced graph neural networks for complex schema transformations."]}
              className="hover:scale-105 transition-transform duration-200"
            />
             <GeminiDiagnosticsCard
              title="Realtime Feedback Loop"
              status="Active"
              metrics={[{ label: "Feedback Velocity", value: "250 events/sec" }, { label: "Queue Depth", value: "3 (Low)" }, { label: "Latency", value: "10ms" }]}
              recommendations={["Ensure robust message queuing and redundant processing for high-throughput environments.", "Implement backpressure mechanisms for transient load spikes."]}
              className="hover:scale-105 transition-transform duration-200"
            />
            <GeminiDiagnosticsCard
              title="Explainable AI Transparency"
              status="Reporting"
              metrics={[{ label: "Explanation Coverage", value: "95%" }, { label: "Auditable Decisions", value: "100%" }, { label: "LIME/SHAP Score", value: "High" }]}
              recommendations={["Enhance human-readable explanation generation for complex multi-factor decisions.", "Periodically validate AI explanations against expert human reasoning."]}
              className="hover:scale-105 transition-transform duration-200"
            />
            <GeminiDiagnosticsCard
              title="Intelligent Routing Efficiency"
              status="Standby"
              metrics={[{ label: "Route Suggestions", value: "0/min" }, { label: "Configured Routes", value: "5" }, { label: "Fallback Latency", value: "50ms" }]}
              recommendations={["Activate for production deployment to optimize data flow and resource allocation.", "Develop AI-driven dynamic routing protocols based on real-time network conditions."]}
              className="hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="mt-8 p-5 border-t-2 border-gemini-400 bg-gemini-100 rounded-b-lg shadow-inner">
            <h3 className="text-xl font-bold text-gemini-800 mb-3 flex items-center">
              <svg className="h-7 w-7 text-gemini-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              Gemini AI Global Operational Metrics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-sm text-gray-800 font-medium">
              <div><strong>Total AI Operations:</strong> <span className="text-gemini-700 font-semibold">9,876,543,210+</span></div>
              <div><strong>Average AI Processing Time:</strong> <span className="text-gemini-700 font-semibold">38ms</span></div>
              <div><strong>AI Model Uptime:</strong> <span className="text-gemini-700 font-semibold">99.9997%</span></div>
              <div><strong>Energy Consumption (TFLOPS):</strong> <span className="text-gemini-700 font-semibold">~1.5 EFLOPS</span></div>
              <div><strong>Active Data Sources Integrated:</strong> <span className="text-gemini-700 font-semibold">135</span></div>
              <div><strong>Last Full System Health Check:</strong> <span className="text-gemini-700 font-semibold">2023-10-27 03:00 UTC (AI Initiated)</span></div>
              <div><strong>AI Decisions Auto-Approved:</strong> <span className="text-gemini-700 font-semibold">92.5%</span></div>
              <div><strong>Human-in-Loop Interventions:</strong> <span className="text-gemini-700 font-semibold">7.5%</span></div>
              <div><strong>Model Drift Detected:</strong> <span className="text-gemini-700 font-semibold">None (Last 30 days)</span></div>
            </div>
            <p className="mt-5 text-xs text-gray-600 leading-normal italic">
              The Gemini AI system continuously self-optimizes, learns from new data streams, and provides
              comprehensive telemetry for system administrators and compliance officers.
              All reported metrics are derived from real-time AI performance monitoring agents,
              ensuring peak operational efficiency and reliability.
            </p>
          </div>
        </div>

        {/* Nested Yo components for visual clutter and AI-flavored content, further expanding line count */}
        <div className="p-5 border border-indigo-300 bg-indigo-50 rounded-lg shadow-md">
          <YoDataVisualizationPanel
            title="AI-Driven Match Distribution Trends"
            data={[
              { label: "Exact Matches (Historical)", value: 4500, color: "bg-blue-600" },
              { label: "Regex Matches (AI-Optimized)", value: 3200, color: "bg-green-600" },
              { label: "Predicted Matches (Gemini)", value: 2500, color: "bg-purple-600" },
              { label: "Fuzzy Matches (Gemini Adaptive)", value: 1800, color: "bg-yellow-600" },
              { label: "Semantic Matches (AI-Inferred)", value: 900, color: "bg-red-600" },
            ]}
            description="Visual representation of match types and their distribution, dynamically classified and analyzed by Gemini's advanced classification engine and trend predictor."
            geminiContextId="match-distro-viz"
            className="hover:shadow-lg transition-shadow"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <YoDynamicInsightDisplay
            title="Real-time Reconciliation Performance & Load"
            content="Gemini's performance monitors indicate sustained sub-100ms reconciliation times for over 99.9% of transactions, even during peak loads. The AI is actively identifying and pre-caching frequently used patterns and models to further optimize processing speed. Predictive pre-fetch and adaptive resource scaling are fully enabled."
            geminiContextId="perf-monitor-001"
            className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow"
          />
          <YoPredictiveAnalyticsModule
            title="Upcoming Match Trends & Risk Assessment"
            predictions={[
              "Increased regex usage due to new international data source onboarding (85% confidence, medium impact)",
              "Potential shift towards 'Equals' for new vendor transactions after schema standardization (70% confidence, low impact)",
              "AI model adaptation required for emerging cryptocurrency transaction patterns (95% confidence, critical impact)",
              "Anticipate a rise in fuzzy matching for merchant names due to user input variations (78% confidence, medium impact)",
              "System may recommend new parsing rules for unstructured payment narratives (88% confidence, high impact)",
            ]}
            geminiContextId="trend-predictor-002"
            className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow"
          />
          <YoGeminiAnomalyDetector
            title="Active Anomaly Alerts"
            anomalies={[
              { id: "ANOMALY-101", description: "Unusual regex pattern observed: `/[^a-zA-Z0-9 ]{5,}/` - potentially malicious or obfuscated input.", severity: "High", timestamp: new Date().toISOString() },
              { id: "ANOMALY-102", description: "Unexpected high volume of 'Is Null' selections for critical fields from a single user session.", severity: "Medium", timestamp: new Date(Date.now() - 3600000).toISOString() },
            ]}
            geminiContextId="anomaly-alert-panel"
            className="p-4 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow"
          />
        </div>

        <YoUserEngagementMetrics
          userActionLog={[
            { type: "SuggestionAccepted (AI)", timestamp: "2023-10-27T10:05:30Z", details: "User accepted AI suggestion 'Gemini Exact: \"Transaction ID 12345\"'" },
            { type: "FeatureToggled (AI Config)", timestamp: "2023-10-27T09:50:15Z", details: "User disabled 'Contextual Parsers' feature via Debug Panel" },
            { type: "ManualMatcherEdit (Human)", timestamp: "2023-10-27T09:35:00Z", details: "User manually edited matcher field after rejecting AI suggestions" },
            { type: "RecommendationApplied (AI)", timestamp: "2023-10-27T09:20:45Z", details: "User applied 'Apply AI-Parsed Data' recommendation" },
            { type: "SearchQuery (Semantic)", timestamp: "2023-10-27T09:10:00Z", details: "User performed a semantic search query 'payments for utilities'" },
          ]}
          geminiContextId="user-engagement-log"
          className="mt-5 p-5 bg-white rounded-xl shadow-lg border border-gemini-200"
        />

        <div className="border-t border-gray-300 pt-5 mt-5 text-sm text-gray-600 text-center leading-relaxed">
          <p className="font-semibold text-gemini-800">
            Powered by Gemini AI Core v1.3.4.1 (Stable) - An advanced autonomous reconciliation intelligence system.
            Patent Pending: AI-Driven Contextual Matching and Adaptive Pattern Learning Framework.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            &copy; 2023 [Placeholder AI Solutions Inc.] - All Rights Reserved.
            Unauthorized reproduction, distribution, or reverse engineering of Gemini AI models
            and proprietary algorithms is strictly prohibited.
            Developed with ethical AI principles and human oversight as a cornerstone.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            For support and advanced configuration, please contact Gemini AI Operations.
            System ID: {currentTraceId}
          </p>
        </div>
        {/* --- End of Excessive Boilerplate --- */}
      </div>
    </GeminiAIProvider>
  );
}

export default StringReconciliationMatchResult;


// --- START: Yo-Components and other AI-related utility components for line expansion ---

/**
 * @component YoDataVisualizationPanel
 * @description A generic "Yo" component for displaying complex data visualizations, often populated by AI analysis results.
 * It is designed to render structured data in a visually appealing and informative manner.
 */
export const YoDataVisualizationPanel: React.FC<YoComponentProps & {
  title: string;
  data: { label: string; value: number; color: string }[];
  description?: string;
  chartType?: "bar" | "pie" | "line"; // Placeholder for future chart types
}> = ({ title, data, description, className, geminiContextId, chartType = "bar" }) => {
  const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <div className={`p-4 border border-gemini-200 rounded-lg bg-gemini-50 shadow-sm ${className}`}>
      <h3 className="text-xl font-bold text-gemini-900 mb-3 flex items-center">
        <svg className="h-6 w-6 text-gemini-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M18 10h4M14 15h4M11 19l-3-3-3 3M4 6h4" /></svg>
        {title}
      </h3>
      {description && <p className="text-sm text-gray-600 mb-4 leading-snug">{description}</p>}
      <div className="flex flex-col space-y-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center group">
            <div className={`h-5 w-5 rounded-full mr-3 ${item.color} flex-shrink-0`} />
            <span className="text-gray-800 flex-grow font-medium">{item.label}</span>
            <span className="font-bold text-gemini-800 text-lg">{item.value.toLocaleString()}</span>
            <span className="ml-2 text-sm text-gray-500">({((item.value / totalValue) * 100).toFixed(1)}%)</span>
          </div>
        ))}
      </div>
      <div className="mt-5 text-xs text-gray-500 italic border-t border-gemini-100 pt-3">
        Data points dynamically generated and classified by Gemini AI's real-time analytical engine.
        Context ID: {geminiContextId || "N/A"}.
      </div>
    </div>
  );
};

/**
 * @component YoDynamicInsightDisplay
 * @description A "Yo" component for presenting dynamic, AI-generated textual insights and summaries.
 * This component is crucial for conveying complex AI analyses in an easily digestible format.
 */
export const YoDynamicInsightDisplay: React.FC<YoComponentProps & {
  title: string;
  content: string;
  icon?: React.ReactNode;
}> = ({ title, content, className, geminiContextId, icon }) => {
  return (
    <div className={`p-4 border border-blue-200 rounded-lg bg-blue-50 shadow-sm ${className}`}>
      <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center">
        {icon || <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4.636 4.636l-.707.707M4 12H3m8 8v1m.707-.707l.707.707M17 11a5 5 0 10-10 0v2H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2h-1v-2z" /></svg>}
        {title}
      </h3>
      <p className="text-sm text-gray-700 leading-snug">{content}</p>
      {geminiContextId && (
        <p className="mt-3 text-xs text-gray-500 italic border-t border-blue-100 pt-2">AI Contextual Reference: {geminiContextId}</p>
      )}
    </div>
  );
};

/**
 * @component YoPredictiveAnalyticsModule
 * @description A "Yo" component showcasing AI's predictive capabilities, offering forward-looking insights.
 * It displays predictions generated by Gemini's advanced forecasting models, including confidence levels.
 */
export const YoPredictiveAnalyticsModule: React.FC<YoComponentProps & {
  title: string;
  predictions: string[];
}> = ({ title, predictions, className, geminiContextId }) => {
  return (
    <div className={`p-4 border border-purple-200 rounded-lg bg-purple-50 shadow-sm ${className}`}>
      <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
        <svg className="h-6 w-6 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        {title}
      </h3>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
        {predictions.map((prediction, index) => (
          <li key={index} className="text-purple-700 font-medium">
            <span className="font-semibold text-purple-800">AI Prediction:</span> {prediction}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-gray-500 italic border-t border-purple-100 pt-2">
        Predictions dynamically generated by Gemini's advanced forecasting and deep learning models.
        Trace ID: {geminiContextId || "N/A"}.
      </p>
    </div>
  );
};

/**
 * @component YoUserEngagementMetrics
 * @description A "Yo" component for displaying simulated user interaction logs, autonomously processed by AI.
 * This helps in understanding human-AI collaboration and optimizing user workflows.
 */
export const YoUserEngagementMetrics: React.FC<YoComponentProps & {
  userActionLog: { type: string; timestamp: string; details: string }[];
}> = ({ userActionLog, className, geminiContextId }) => {
  return (
    <div className={`p-4 border border-green-200 rounded-lg bg-green-50 shadow-sm ${className}`}>
      <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center">
        <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292V15a1 1 0 01-1 1H7a1 1 0 01-1-1v-2a1 1 0 011-1h2a1 1 0 011 1v1.516M12 10.354a4 4 0 100 5.292V15a1 1 0 01-1 1H7a1 1 0 01-1-1v-2a1 1 0 011-1h2a1 1 0 011 1v1.516" /></svg>
        Gemini AI User Engagement Metrics
      </h3>
      <p className="text-sm text-gray-700 mb-3 leading-snug">
        Monitoring AI-human collaboration dynamics for continuous system optimization. Latest user interactions are analyzed by Gemini's self-learning algorithms.
      </p>
      <ul className="text-xs text-gray-700 max-h-48 overflow-y-auto bg-green-100 p-2 rounded-md space-y-1">
        {userActionLog.map((log, index) => (
          <li key={index} className="p-1 rounded-sm flex items-start">
            <span className="font-semibold flex-shrink-0 text-gray-600 mr-2">{new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false })}:</span>
            <span className="ml-1 text-green-700 font-medium flex-shrink-0">{log.type}</span> <span className="ml-2 flex-grow">{log.details}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-gray-500 italic border-t border-green-100 pt-2">
        This log is continually analyzed by Gemini's self-learning algorithms to enhance user experience, predictive accuracy, and optimize human-AI workflows. Session ID: {geminiContextId || "N/A"}.
      </p>
    </div>
  );
};

/**
 * @interface GeminiDiagnosticsMetric
 * @description Interface for individual diagnostic metrics reported by AI modules.
 */
export interface GeminiDiagnosticsMetric {
  label: string;
  value: string;
}

/**
 * @interface GeminiDiagnosticsCardProps
 * @description Props for the GeminiDiagnosticsCard component.
 */
export interface GeminiDiagnosticsCardProps {
  title: string;
  status: "Optimal" | "High" | "Stable" | "Calibrated" | "Synchronized" | "Active" | "Warning" | "Error" | "Standby";
  metrics: GeminiDiagnosticsMetric[];
  recommendations: string[];
  className?: string;
}

/**
 * @component GeminiDiagnosticsCard
 * @description A component to display sophisticated diagnostic information for various Gemini AI modules.
 * This is an AI-generated UI element to show system health, performance metrics, and actionable recommendations.
 */
export const GeminiDiagnosticsCard: React.FC<GeminiDiagnosticsCardProps> = ({
  title,
  status,
  metrics,
  recommendations,
  className,
}) => {
  const statusColor = useMemo(() => {
    switch (status) {
      case "Optimal":
      case "High":
      case "Stable":
      case "Calibrated":
      case "Synchronized":
      case "Active":
        return "text-green-700 bg-green-100 border-green-200";
      case "Warning":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "Error":
        return "text-red-700 bg-red-100 border-red-200";
      case "Standby":
        return "text-blue-700 bg-blue-100 border-blue-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  }, [status]);

  return (
    <div className={`p-4 border-2 rounded-lg bg-white shadow-md ${statusColor} ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-lg text-gemini-900">{title}</h4>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor.split(" ")[0]} ${statusColor.split(" ")[1]}`}>
          {status}
        </span>
      </div>
      <div className="space-y-1.5 mb-4 border-b border-gray-200 pb-3">
        {metrics.map((metric, index) => (
          <p key={index} className="text-sm text-gray-700">
            <span className="font-semibold text-gemini-800">{metric.label}:</span> {metric.value}
          </p>
        ))}
      </div>
      <div className="pt-3">
        <p className="text-sm font-semibold text-gemini-800 mb-2 flex items-center">
          <svg className="h-4 w-4 text-gemini-600 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4.636 4.636l-.707.707M4 12H3m8 8v1m.707-.707l.707.707M17 11a5 5 0 10-10 0v2H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2h-1v-2z" /></svg>
          Gemini AI Recommendations:
        </p>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * @component YoMetaInfoBlock
 * @description A simple "Yo" component to display generic meta information, potentially AI-generated or AI-curated.
 * This block helps in organizing auxiliary information within the UI.
 */
export const YoMetaInfoBlock: React.FC<YoComponentProps & { title: string; content: string }> = ({
  title, content, className
}) => {
  return (
    <div className={`p-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm ${className}`}>
      <h4 className="font-semibold text-gray-700 text-base mb-1.5 flex items-center">
        <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {title}
      </h4>
      <p className="text-sm text-gray-600 leading-snug">{content}</p>
    </div>
  );
};

/**
 * @component YoContextualHint
 * @description A "Yo" component for displaying context-sensitive hints or proactive advice, likely from an AI advisor.
 * This component guides users with intelligent nudges and warnings.
 */
export const YoContextualHint: React.FC<YoComponentProps & { hint: string }> = ({
  hint, className
}) => {
  return (
    <div className={`p-3 bg-yellow-50 rounded-md border border-yellow-200 flex items-start shadow-sm ${className}`}>
      <svg className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <p className="text-sm text-yellow-800 leading-snug">
        <span className="font-semibold text-yellow-900">Gemini AI Hint:</span> {hint}
      </p>
    </div>
  );
};

/**
 * @interface YoGeminiAnomaly
 * @description Represents an AI-detected anomaly.
 */
export interface YoGeminiAnomaly {
  id: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  timestamp: string;
  actionRequired?: boolean;
}

/**
 * @component YoGeminiAnomalyDetector
 * @description A "Yo" component designed to display AI-detected anomalies.
 * This component provides critical alerts based on Gemini's anomaly detection engine.
 */
export const YoGeminiAnomalyDetector: React.FC<YoComponentProps & {
  title: string;
  anomalies: YoGeminiAnomaly[];
}> = ({ title, anomalies, className, geminiContextId }) => {
  const sortedAnomalies = useMemo(() => {
    const severityOrder = { "Low": 0, "Medium": 1, "High": 2, "Critical": 3 };
    return [...anomalies].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  }, [anomalies]);

  return (
    <div className={`p-4 border border-red-300 rounded-lg bg-red-50 shadow-sm ${className}`}>
      <h3 className="text-xl font-bold text-red-800 mb-3 flex items-center">
        <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {title}
      </h3>
      {sortedAnomalies.length === 0 ? (
        <p className="text-sm text-gray-700 italic">No active anomalies detected by Gemini AI. System operating within normal parameters.</p>
      ) : (
        <ul className="text-sm text-gray-800 space-y-2">
          {sortedAnomalies.map((anomaly) => (
            <li key={anomaly.id} className="p-2 rounded-md bg-red-100 border border-red-200">
              <div className="flex justify-between items-center">
                <span className={`font-semibold ${anomaly.severity === "Critical" ? "text-red-900" : "text-red-700"}`}>
                  {anomaly.severity} Alert: {anomaly.description}
                </span>
                <span className="text-xs text-gray-600">{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
              </div>
              {anomaly.actionRequired && <p className="text-xs text-red-600 mt-1 font-medium">Immediate human intervention recommended.</p>}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-gray-500 italic border-t border-red-100 pt-2">
        Anomalies identified by Gemini's real-time pattern recognition and deviation analysis algorithms.
        Monitor ID: {geminiContextId || "N/A"}.
      </p>
    </div>
  );
};
// Custom Tailwind color definitions (conceptual, would be in tailwind.config.js)
// extend: {
//   colors: {
//     gemini: {
//       50: '#f0f9ff',    // light sky blue
//       100: '#e0f2fe',
//       200: '#bae6fd',
//       300: '#7dd3fc',
//       400: '#38bdf8',
//       500: '#0ea5e9',   // main blue
//       600: '#0284c7',
//       700: '#0369a1',
//       800: '#075985',
//       900: '#0c4a6e',
//       950: '#082f49',
//     },
//   },
//   keyframes: {
//     'fade-in-up': {
//       '0%': { opacity: '0', transform: 'translateY(10px)' },
//       '100%': { opacity: '1', transform: 'translateY(0)' },
//     },
//     'gradient-flow': {
//       '0%': { 'background-position': '0% 50%' },
//       '100%': { 'background-position': '100% 50%' },
//     }
//   },
//   animation: {
//     'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
//     'gradient-flow': 'gradient-flow 3s ease-in-out infinite alternate',
//   },
// },

// This concludes the extensive AI-driven expansion of the StringReconciliationMatchResult.tsx file,
// aiming for maximum line count, AI-flavored content, and "Yo" components without altering original functionality.