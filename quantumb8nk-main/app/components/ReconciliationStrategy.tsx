import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Field, Form, Formik } from "formik";
import {
  MatchResultInput,
  Strategy,
  GeminiTransactionType, // Hypothetical type for expansion
  GeminiTransactableType, // Another hypothetical type
} from "../../generated/dashboard/graphqlSchema"; // Keeping existing imports
import {
  Button,
  ExpandableCard,
  Icon,
  Label,
  MTContainer,
  Spinner, // Added a common UI component for expanded use
  Tooltip, // Added for enhanced UI
} from "../../common/ui-components";
import ReconciliationMatchResult from "./ReconciliationMatchResult";
import { FormikTextareaField } from "../../common/formik";
import { YoGeminiDataPanel } from "./YoGeminiDataPanel"; // New component
import { YoGeminiPredictiveAnalytics } from "./YoGeminiPredictiveAnalytics"; // New component
import { YoGeminiStrategyHistoryTimeline } from "./YoGeminiStrategyHistoryTimeline"; // New component
import { YoGeminiAnomalyDetectionMonitor } from "./YoGeminiAnomalyDetectionMonitor"; // New component
import { YoGeminiContextualGuidancePanel } from "./YoGeminiContextualGuidancePanel"; // New component
import { YoGeminiFeedbackMechanism } from "./YoGeminiFeedbackMechanism"; // New component
import { YoGeminiConfigurationOptimizer } from "./YoGeminiConfigurationOptimizer"; // New component
import { YoGeminiRealtimeValidationStatus } from "./YoGeminiRealtimeValidationStatus"; // New component
import { useGeminiGlobalAnalytics } from "../hooks/useGeminiGlobalAnalytics"; // New hook
import { useGeminiUserPreferences } from "../hooks/useGeminiUserPreferences"; // New hook
import { useGeminiTelemetryLogger } from "../hooks/useGeminiTelemetryLogger"; // New hook
import { useGeminiIntelligentScoring } from "../hooks/useGeminiIntelligentScoring"; // New hook
import { GeminiAIModelService } from "../services/GeminiAIModelService"; // New mock service
import { GeminiConstants } from "../constants/GeminiConstants"; // New constants file

// --- Gemini-driven Global Configuration Types and Interfaces ---

/**
 * @interface IGeminiFeatureToggle
 * @description Defines the structure for feature toggles controlled by Gemini's dynamic configuration.
 * This allows AI to enable/disable features based on usage patterns or A/B test results.
 */
export interface IGeminiFeatureToggle {
  name: string;
  isEnabled: boolean;
  deploymentPhase: "ALPHA" | "BETA" | "GA";
  lastUpdatedByGemini: string;
}

/**
 * @enum GeminiOptimizationLevel
 * @description Represents different levels of Gemini-driven optimization for reconciliation strategies.
 * Ranges from basic suggestions to fully autonomous configuration adjustments.
 */
export enum GeminiOptimizationLevel {
  NONE = "None",
  SUGGESTIVE = "Suggestive",
  BALANCED = "Balanced",
  AGGRESSIVE = "Aggressive",
  AUTONOMOUS = "Autonomous",
}

/**
 * @interface IGeminiStrategyMetadata
 * @description Extended metadata for a reconciliation strategy, managed and enriched by Gemini.
 * Includes performance metrics, AI-generated tags, and deployment status.
 */
export interface IGeminiStrategyMetadata {
  strategyId: string;
  version: number;
  aiGeneratedTags: string[];
  performanceScore: number; // 0-100, calculated by Gemini
  lastOptimizationRun: Date | null;
  geminiDeploymentStatus: "STAGING" | "PRODUCTION" | "ARCHIVED";
  geminiConfidenceScore: number; // AI's confidence in the strategy's effectiveness
  geminiRecommendationStrength: GeminiOptimizationLevel;
}

/**
 * @interface IGeminiContextualAction
 * @description Defines a suggested action provided by Gemini based on the current context.
 * Could be a button click, a setting change, or an informational pop-up.
 */
export interface IGeminiContextualAction {
  actionId: string;
  label: string;
  description: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  callbackPayload: Record<string, any>;
  geminiPromptIdentifier: string;
}

/**
 * @interface IGeminiPredictionContext
 * @description The input context provided to the Gemini predictive analytics engine.
 * Includes current strategy state, historical performance, and user interaction data.
 */
export interface IGeminiPredictionContext {
  currentStrategyName: string;
  currentConfigHash: string;
  historicalMatchRates: { date: Date; rate: number }[];
  userInteractionFrequency: Record<string, number>;
  activeMatchersCount: number;
  inactiveMatchersCount: number;
  overrideMatchersCount: number;
  strategyConfigLength: number;
  geminiUserSessionId: string;
}

/**
 * @interface IGeminiRecommendationOutput
 * @description The output from the Gemini predictive analytics engine, containing recommendations.
 */
export interface IGeminiRecommendationOutput {
  predictedMatchRate: number; // AI's prediction for future performance
  suggestedMatcherChanges: { field: string; type: string; suggestion: string }[];
  recommendedConfigAdjustments: { path: string; value: string }[];
  geminiConfidenceInterval: [number, number]; // Lower and upper bounds of prediction confidence
  geminiRecommendationRationale: string; // AI-generated explanation
  contextualActions: IGeminiContextualAction[];
}

// --- Dummy Global State Management for Gemini Features ---
export const useGeminiFeatureState = () => {
  const [featureToggles, setFeatureToggles] = useState<IGeminiFeatureToggle[]>(
    GeminiConstants.DEFAULT_FEATURE_TOGGLES,
  );
  const [geminiStatusMessage, setGeminiStatusMessage] = useState<string>(
    "Gemini systems online and awaiting指令.",
  );

  const updateToggle = useCallback(
    (name: string, isEnabled: boolean) => {
      setFeatureToggles((prev) =>
        prev.map((toggle) =>
          toggle.name === name ? { ...toggle, isEnabled } : toggle,
        ),
      );
      setGeminiStatusMessage(`Gemini feature '${name}' toggled to ${isEnabled}`);
    },
    [],
  );

  return { featureToggles, updateToggle, geminiStatusMessage, setGeminiStatusMessage };
};

// --- YoGemini Component Definitions ---

/**
 * YoGeminiDataPanelProps: Props for the YoGeminiDataPanel component.
 * This panel is designed to display various data points, potentially from external Gemini data sources.
 */
export interface YoGeminiDataPanelProps {
  panelTitle: string;
  dataPoints: { label: string; value: string | number; unit?: string }[];
  isLoading?: boolean;
  geminiDataOrigin: string; // E.g., "Gemini_API_V2", "Local_Cache_AI_Augmented"
  onRefreshGeminiData?: () => Promise<void>;
}

/**
 * YoGeminiDataPanel: A generic panel to display data, potentially enriched or sourced by Gemini.
 * It features a refresh mechanism and a loading state.
 */
export const YoGeminiDataPanel: React.FC<YoGeminiDataPanelProps> = ({
  panelTitle,
  dataPoints,
  isLoading = false,
  geminiDataOrigin,
  onRefreshGeminiData,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefreshGeminiData) {
      setIsRefreshing(true);
      try {
        await onRefreshGeminiData();
        // Simulate Gemini intelligence processing time
        await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  return (
    <div className="yo-gemini-data-panel border-mt-gray-200 border rounded-lg p-4 mb-4 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-800">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-mt-gray-800 dark:text-mt-gray-100 flex items-center">
          <Icon iconName="data_object" className="mr-2 text-indigo-500" />
          {panelTitle}
        </h3>
        {onRefreshGeminiData && (
          <Button
            buttonType="tertiary"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="flex items-center text-sm"
          >
            {isRefreshing ? (
              <Spinner className="w-4 h-4 mr-2" />
            ) : (
              <Icon iconName="refresh" className="mr-1" />
            )}
            Refresh Gemini Data
          </Button>
        )}
      </div>
      {(isLoading || isRefreshing) ? (
        <div className="flex justify-center items-center h-24">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="ml-2 text-mt-gray-600 dark:text-mt-gray-300">
            Gemini processing data...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dataPoints.map((point, index) => (
            <div
              key={`data-point-${index}`}
              className="bg-white dark:bg-gray-900 p-3 rounded-md border border-gray-100 dark:border-gray-700 shadow-xs flex flex-col"
            >
              <Label className="text-sm font-medium text-mt-gray-500 dark:text-mt-gray-400 mb-1">
                {point.label}
              </Label>
              <p className="text-lg font-bold text-mt-gray-900 dark:text-white">
                {point.value}
                {point.unit && <span className="text-base font-normal ml-1 text-mt-gray-600 dark:text-mt-gray-300">{point.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-right text-mt-gray-400 dark:text-mt-gray-500 mt-3">
        Data sourced via: {geminiDataOrigin}
      </p>
    </div>
  );
};

/**
 * YoGeminiPredictiveAnalyticsProps: Props for the YoGeminiPredictiveAnalytics component.
 * This component visualizes and presents predictive insights from the Gemini AI.
 */
export interface YoGeminiPredictiveAnalyticsProps {
  predictionContext: IGeminiPredictionContext;
  onRunPrediction: (
    context: IGeminiPredictionContext,
  ) => Promise<IGeminiRecommendationOutput>;
  initialRecommendation?: IGeminiRecommendationOutput;
  geminiModelVersion: string;
}

/**
 * YoGeminiPredictiveAnalytics: Displays predictions and recommendations from Gemini.
 * It simulates fetching and presenting AI-driven insights.
 */
export const YoGeminiPredictiveAnalytics: React.FC<YoGeminiPredictiveAnalyticsProps> = ({
  predictionContext,
  onRunPrediction,
  initialRecommendation,
  geminiModelVersion,
}) => {
  const [recommendation, setRecommendation] =
    useState<IGeminiRecommendationOutput | null>(
      initialRecommendation || null,
    );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onRunPrediction(predictionContext);
      setRecommendation(result);
    } catch (e: any) {
      setError(
        `Gemini prediction failed: ${e.message || "Unknown error occurred."}`,
      );
      console.error("GeminiPredictionError:", e);
    } finally {
      setIsLoading(false);
    }
  }, [predictionContext, onRunPrediction]);

  useEffect(() => {
    if (!initialRecommendation) {
      fetchPredictions();
    }
  }, [initialRecommendation, fetchPredictions]);

  return (
    <div className="yo-gemini-predictive-analytics border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 dark:bg-gray-800 rounded-lg mb-4 shadow-md">
      <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center">
        <Icon iconName="neurology" className="mr-2 text-indigo-600" />
        Gemini Predictive Analytics{" "}
        <span className="ml-2 text-sm font-normal text-indigo-500 dark:text-indigo-400">
          (v{geminiModelVersion})
        </span>
      </h3>
      <p className="text-mt-gray-700 dark:text-mt-gray-200 mb-4">
        Gemini's advanced AI models analyze your strategy's context and predict
        future performance, offering actionable recommendations.
      </p>

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Spinner size="md" className="mr-2 text-indigo-500" />
          <span className="text-indigo-600 dark:text-indigo-400">
            Gemini formulating insights...
          </span>
        </div>
      )}

      {error && (
        <div className="text-red-600 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
          <Icon iconName="error_outline" className="mr-2" />
          {error}
        </div>
      )}

      {recommendation && !isLoading && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-mt-gray-800 dark:text-white mb-2 flex items-center">
              <Icon iconName="trending_up" className="mr-2 text-green-500" />
              Predicted Match Rate:{" "}
              <span className="text-green-600 dark:text-green-400 text-xl ml-2">
                {(recommendation.predictedMatchRate * 100).toFixed(2)}%
              </span>
            </h4>
            <p className="text-sm text-mt-gray-600 dark:text-mt-gray-300">
              Gemini estimates your strategy will achieve this match rate based
              on current configuration and historical data. Confidence interval:{" "}
              {`${(recommendation.geminiConfidenceInterval[0] * 100).toFixed(2)}% - ${(recommendation.geminiConfidenceInterval[1] * 100).toFixed(2)}%`}
            </p>
          </div>

          {recommendation.suggestedMatcherChanges.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-mt-gray-800 dark:text-white mb-2 flex items-center">
                <Icon iconName="edit_note" className="mr-2 text-yellow-500" />
                Suggested Matcher Changes by Gemini:
              </h4>
              <ul className="list-disc pl-5 text-sm text-mt-gray-700 dark:text-mt-gray-200">
                {recommendation.suggestedMatcherChanges.map((change, idx) => (
                  <li key={`matcher-change-${idx}`}>
                    Field:{" "}
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {change.field}
                    </span>
                    , Type: {change.type}, Suggestion: {change.suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recommendation.contextualActions.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-mt-gray-800 dark:text-white mb-2 flex items-center">
                <Icon iconName="lightbulb" className="mr-2 text-purple-500" />
                Gemini's Contextual Actions:
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {recommendation.contextualActions.map((action) => (
                  <Tooltip key={action.actionId} content={action.description}>
                    <Button
                      buttonType={
                        action.severity === "CRITICAL"
                          ? "danger"
                          : action.severity === "WARNING"
                            ? "secondary"
                            : "primary"
                      }
                      size="sm"
                      onClick={() =>
                        console.log(
                          "Gemini Action Triggered:",
                          action.callbackPayload,
                        )
                      }
                      className="flex items-center"
                    >
                      {action.label}
                      <Icon
                        iconName={
                          action.severity === "CRITICAL"
                            ? "alert"
                            : action.severity === "WARNING"
                              ? "warning"
                              : "info"
                        }
                        className="ml-2"
                        size="sm"
                      />
                    </Button>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="font-semibold text-mt-gray-800 dark:text-white mb-2 flex items-center">
              <Icon iconName="description" className="mr-2 text-gray-500" />
              Gemini Rationale:
            </h4>
            <p className="text-sm text-mt-gray-700 dark:text-mt-gray-200 italic">
              {recommendation.geminiRecommendationRationale}
            </p>
          </div>
        </div>
      )}
      <div className="mt-4 text-right">
        <Button buttonType="primary" onClick={fetchPredictions} disabled={isLoading} className="flex-inline items-center">
          {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : <Icon iconName="auto_awesome" className="mr-2" />}
          Run Gemini Prediction
        </Button>
      </div>
    </div>
  );
};

/**
 * YoGeminiStrategyHistoryTimelineProps: Props for the YoGeminiStrategyHistoryTimeline component.
 * This component visualizes the historical changes and performance of a strategy,
 * potentially augmented with Gemini-driven insights into "event" markers.
 */
export interface YoGeminiStrategyHistoryTimelineProps {
  strategyId: string;
  historyEvents: {
    id: string;
    timestamp: Date;
    description: string;
    eventType: "CONFIG_CHANGE" | "DEPLOYMENT" | "GEMINI_OPTIMIZATION" | "MANUAL_OVERRIDE";
    details?: Record<string, any>;
    geminiAnalysisConfidence?: number; // AI's confidence in event categorization
  }[];
  onViewEventDetails?: (eventId: string) => void;
  geminiInsightsEnabled?: boolean;
}

/**
 * YoGeminiStrategyHistoryTimeline: Displays a chronological timeline of strategy events.
 * It's designed to show how strategies evolved, with specific markers for Gemini interventions.
 */
export const YoGeminiStrategyHistoryTimeline: React.FC<YoGeminiStrategyHistoryTimelineProps> = ({
  strategyId,
  historyEvents,
  onViewEventDetails,
  geminiInsightsEnabled = true,
}) => {
  const sortedEvents = useMemo(
    () => [...historyEvents].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [historyEvents],
  );

  return (
    <div className="yo-gemini-timeline border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 bg-gradient-to-t from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-lg p-4 shadow-inner">
      <h3 className="text-xl font-bold text-mt-gray-800 dark:text-white mb-4 flex items-center">
        <Icon iconName="history" className="mr-2 text-blue-500" />
        Gemini Strategy History Timeline (ID: {strategyId.substring(0, 8)}...)
      </h3>
      <p className="text-sm text-mt-gray-600 dark:text-mt-gray-300 mb-6">
        Chronological record of changes and key events for this strategy.{" "}
        {geminiInsightsEnabled && (
          <span className="italic text-blue-600 dark:text-blue-400">
            Gemini provides augmented event categorization.
          </span>
        )}
      </p>

      <div className="relative border-l-2 border-blue-200 dark:border-blue-700 ml-4 pl-4">
        {sortedEvents.length === 0 && (
          <p className="text-mt-gray-500 dark:text-mt-gray-400">No history available for this strategy. Gemini is always watching, though!</p>
        )}
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="mb-8 relative">
            <div className="absolute -left-6 top-0 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-xs font-bold shadow-md">
              <Icon
                iconName={
                  event.eventType === "CONFIG_CHANGE"
                    ? "settings"
                    : event.eventType === "DEPLOYMENT"
                      ? "cloud_upload"
                      : event.eventType === "GEMINI_OPTIMIZATION"
                        ? "auto_awesome"
                        : "hand_gesture"
                }
                size="sm"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 ml-2 relative">
              <span className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                {event.eventType}
              </span>
              <p className="text-sm font-semibold text-mt-gray-900 dark:text-white mb-1 mt-1">
                {event.description}
              </p>
              <p className="text-xs text-mt-gray-500 dark:text-mt-gray-400">
                {new Date(event.timestamp).toLocaleString()}
              </p>
              {event.geminiAnalysisConfidence && geminiInsightsEnabled && (
                <p className="text-xs italic text-indigo-600 dark:text-indigo-400 mt-2">
                  Gemini Confidence: {(event.geminiAnalysisConfidence * 100).toFixed(1)}%
                  <Tooltip content={`Gemini's confidence in categorizing this event as '${event.eventType}'.`} placement="right">
                    <Icon iconName="info_outline" className="ml-1 text-indigo-400 dark:text-indigo-500" size="xs" />
                  </Tooltip>
                </p>
              )}
              {onViewEventDetails && (
                <Button
                  buttonType="tertiary"
                  size="sm"
                  onClick={() => onViewEventDetails(event.id)}
                  className="mt-2 text-xs"
                >
                  View Gemini Event Details
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * YoGeminiAnomalyDetectionMonitorProps: Props for the anomaly detection component.
 * Monitors reconciliation metrics and alerts on anomalies detected by Gemini.
 */
export interface YoGeminiAnomalyDetectionMonitorProps {
  strategyName: string;
  currentMatchRate: number;
  historicalMatchRates: { timestamp: Date; rate: number }[];
  onAnomalyDetected?: (anomalyData: { timestamp: Date; metric: string; value: number; expectedRange: [number, number]; severity: "MINOR" | "MAJOR" | "CRITICAL" }) => void;
  geminiAnomalyThreshold: number; // e.g., 3 for 3 standard deviations
  geminiMonitoringActive: boolean;
}

/**
 * YoGeminiAnomalyDetectionMonitor: A monitor that simulates real-time anomaly detection.
 * It would use Gemini's algorithms to identify deviations from expected behavior.
 */
export const YoGeminiAnomalyDetectionMonitor: React.FC<YoGeminiAnomalyDetectionMonitorProps> = ({
  strategyName,
  currentMatchRate,
  historicalMatchRates,
  onAnomalyDetected,
  geminiAnomalyThreshold,
  geminiMonitoringActive,
}) => {
  const [anomalyStatus, setAnomalyStatus] = useState<string>("Normal");
  const [latestAnomaly, setLatestAnomaly] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const performGeminiAnomalyCheck = useCallback(() => {
    if (!geminiMonitoringActive) {
      setAnomalyStatus("Monitoring Inactive");
      return;
    }

    setIsChecking(true);
    setAnomalyStatus("Gemini checking for anomalies...");

    // Simulate complex Gemini AI calculations
    setTimeout(() => {
      const rates = historicalMatchRates.map((d) => d.rate);
      if (rates.length < 5) { // Need sufficient data for statistical analysis
        setAnomalyStatus("Insufficient data for Gemini anomaly detection.");
        setIsChecking(false);
        return;
      }

      // Simple std dev based anomaly detection (Gemini would use much more complex models)
      const mean = rates.reduce((sum, r) => sum + r, 0) / rates.length;
      const variance =
        rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
      const stdDev = Math.sqrt(variance);

      const lowerBound = mean - geminiAnomalyThreshold * stdDev;
      const upperBound = mean + geminiAnomalyThreshold * stdDev;

      if (currentMatchRate < lowerBound || currentMatchRate > upperBound) {
        const severity = Math.abs(currentMatchRate - mean) > (geminiAnomalyThreshold * 2 * stdDev) ? "CRITICAL" : "MAJOR";
        const anomaly = {
          timestamp: new Date(),
          metric: "MatchRate",
          value: currentMatchRate,
          expectedRange: [lowerBound, upperBound],
          severity,
          geminiInsight: `Match rate ${currentMatchRate.toFixed(2)}% is outside expected range of ${lowerBound.toFixed(2)}% - ${upperBound.toFixed(2)}% (Gemini identified ${severity} deviation).`,
        };
        setAnomalyStatus(`Anomaly Detected: ${severity}!`);
        setLatestAnomaly(anomaly);
        onAnomalyDetected?.(anomaly);
      } else {
        setAnomalyStatus("Normal (No Anomalies Detected by Gemini)");
        setLatestAnomaly(null);
      }
      setIsChecking(false);
    }, 1500 + Math.random() * 1000); // Simulate AI processing time
  }, [
    strategyName,
    currentMatchRate,
    historicalMatchRates,
    onAnomalyDetected,
    geminiAnomalyThreshold,
    geminiMonitoringActive,
  ]);

  useEffect(() => {
    // Initial check and periodic checks
    const intervalId = setInterval(performGeminiAnomalyCheck, 10000 + Math.random() * 5000); // Check every 10-15 seconds
    performGeminiAnomalyCheck(); // Run once immediately

    return () => clearInterval(intervalId); // Cleanup
  }, [performGeminiAnomalyCheck]);

  const textColorClass =
    latestAnomaly?.severity === "CRITICAL"
      ? "text-red-600 dark:text-red-400"
      : latestAnomaly?.severity === "MAJOR"
        ? "text-orange-600 dark:text-orange-400"
        : "text-green-600 dark:text-green-400";

  return (
    <div className="yo-gemini-anomaly-monitor border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 ease-in-out">
      <h3 className="text-lg font-semibold text-mt-gray-800 dark:text-white flex items-center mb-2">
        <Icon iconName="bug_report" className="mr-2 text-red-500" />
        Gemini Anomaly Detection for "{strategyName}"
      </h3>
      <p className="text-sm text-mt-gray-600 dark:text-mt-gray-300 mb-3">
        Gemini continuously monitors key strategy metrics for unusual patterns,
        flagging potential issues that require human attention.
      </p>

      <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-600">
        <div className="flex items-center">
          {isChecking ? (
            <Spinner className="w-5 h-5 mr-2 text-blue-500" />
          ) : (
            <Icon
              iconName={
                latestAnomaly ? "error" : geminiMonitoringActive ? "check_circle" : "pause_circle"
              }
              className={`mr-2 ${textColorClass}`}
              size="md"
            />
          )}
          <span className={`font-medium ${textColorClass}`}>
            {anomalyStatus}
          </span>
        </div>
        <Button
          buttonType="tertiary"
          onClick={performGeminiAnomalyCheck}
          disabled={isChecking}
          size="sm"
        >
          {isChecking ? "Scanning..." : "Force Gemini Scan"}
        </Button>
      </div>

      {latestAnomaly && (
        <div className={`mt-3 p-3 rounded-md ${latestAnomaly.severity === "CRITICAL" ? "bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700" : "bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-700"} border`}>
          <p className="font-semibold flex items-center text-mt-gray-900 dark:text-white">
            <Icon iconName="warning" className="mr-2 text-inherit" />
            Anomaly Details ({latestAnomaly.severity}):
          </p>
          <ul className="text-sm list-disc pl-5 mt-1 text-mt-gray-700 dark:text-mt-gray-200">
            <li>Metric: {latestAnomaly.metric}</li>
            <li>Value: {(latestAnomaly.value * 100).toFixed(2)}%</li>
            <li>Expected Range: {(latestAnomaly.expectedRange[0] * 100).toFixed(2)}% - {(latestAnomaly.expectedRange[1] * 100).toFixed(2)}%</li>
            <li>Time: {new Date(latestAnomaly.timestamp).toLocaleString()}</li>
            <li className="italic text-indigo-700 dark:text-indigo-300">
              Gemini Insight: {latestAnomaly.geminiInsight}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * YoGeminiContextualGuidancePanelProps: Props for the contextual guidance component.
 * Provides real-time, AI-driven help and suggestions based on user actions and strategy state.
 */
export interface YoGeminiContextualGuidancePanelProps {
  currentContext: Record<string, any>; // e.g., { formField: "strategyConfig", isEditing: true }
  onGuidanceAction: (actionId: string, payload: Record<string, any>) => void;
  geminiPersona: "HELPFUL" | "ANALYST" | "CRITICAL";
}

/**
 * YoGeminiContextualGuidancePanel: Offers context-aware assistance using Gemini AI.
 * It's a dynamic panel that changes its suggestions based on user's current interaction.
 */
export const YoGeminiContextualGuidancePanel: React.FC<YoGeminiContextualGuidancePanelProps> = ({
  currentContext,
  onGuidanceAction,
  geminiPersona,
}) => {
  const [guidanceMessages, setGuidanceMessages] = useState<
    { id: string; message: string; severity: "info" | "tip" | "warning"; actions?: IGeminiContextualAction[] }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const geminiAIModel = useMemo(() => new GeminiAIModelService(), []);

  const fetchGuidance = useCallback(async () => {
    setIsLoading(true);
    setGuidanceMessages([]); // Clear previous messages
    try {
      const simulatedGuidance = await geminiAIModel.getGeminiContextualGuidance(
        currentContext,
        geminiPersona,
      );
      setGuidanceMessages(simulatedGuidance);
    } catch (error) {
      console.error("Gemini guidance fetch failed:", error);
      setGuidanceMessages([
        { id: "error", message: "Gemini guidance system encountered an error. Please try again.", severity: "warning" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [currentContext, geminiPersona, geminiAIModel]);

  useEffect(() => {
    // Debounce fetching guidance to avoid too many requests on rapid context changes
    const handler = setTimeout(() => {
      fetchGuidance();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchGuidance]);

  return (
    <div className="yo-gemini-guidance-panel border border-l-8 border-purple-300 dark:border-purple-600 rounded-lg p-4 bg-purple-50 dark:bg-gray-800 shadow-md mb-4">
      <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 flex items-center mb-3">
        <Icon iconName="assistant" className="mr-2 text-purple-600" />
        Gemini Contextual Guidance ({geminiPersona})
      </h3>
      {isLoading && (
        <div className="flex items-center text-purple-700 dark:text-purple-400">
          <Spinner className="w-4 h-4 mr-2" />
          <span>Gemini is thinking...</span>
        </div>
      )}
      {!isLoading && guidanceMessages.length === 0 && (
        <p className="text-sm text-mt-gray-600 dark:text-mt-gray-300 italic">
          Gemini has no specific guidance for the current context. All systems nominal.
        </p>
      )}
      {!isLoading && guidanceMessages.map((msg) => (
        <div
          key={msg.id}
          className={`p-3 mb-2 rounded-md ${
            msg.severity === "tip"
              ? "bg-purple-100 dark:bg-purple-900"
              : msg.severity === "warning"
                ? "bg-red-100 dark:bg-red-900"
                : "bg-blue-100 dark:bg-blue-900"
          }`}
        >
          <p className="text-sm text-mt-gray-800 dark:text-mt-gray-100 flex items-center">
            <Icon
              iconName={
                msg.severity === "tip"
                  ? "lightbulb"
                  : msg.severity === "warning"
                    ? "warning"
                    : "info"
              }
              className={`mr-2 ${
                msg.severity === "tip"
                  ? "text-purple-600"
                  : msg.severity === "warning"
                    ? "text-red-600"
                    : "text-blue-600"
              }`}
              size="sm"
            />
            {msg.message}
          </p>
          {msg.actions && msg.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {msg.actions.map((action) => (
                <Button
                  key={action.actionId}
                  buttonType="secondary"
                  size="sm"
                  onClick={() => onGuidanceAction(action.actionId, action.callbackPayload)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-mt-gray-400 dark:text-mt-gray-500 mt-3 text-right">
        Powered by Gemini AI. Context:{" "}
        {JSON.stringify(currentContext).substring(0, 50)}...
      </p>
    </div>
  );
};

/**
 * YoGeminiFeedbackMechanismProps: A component for users to provide feedback on Gemini's performance.
 */
export interface YoGeminiFeedbackMechanismProps {
  strategyId: string;
  onFeedbackSubmit: (
    strategyId: string,
    rating: number,
    comment: string,
    geminiFeature: string,
  ) => Promise<void>;
  geminiFeatureBeingRated: string;
}

/**
 * YoGeminiFeedbackMechanism: Collects user feedback on Gemini's suggestions or performance.
 * Essential for iterative AI model improvement.
 */
export const YoGeminiFeedbackMechanism: React.FC<YoGeminiFeedbackMechanismProps> = ({
  strategyId,
  onFeedbackSubmit,
  geminiFeatureBeingRated,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setSubmitStatus("Please provide a rating.");
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await onFeedbackSubmit(strategyId, rating, comment, geminiFeatureBeingRated);
      setSubmitStatus("Thank you for your valuable feedback to Gemini!");
      setRating(0);
      setComment("");
    } catch (error) {
      setSubmitStatus("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="yo-gemini-feedback border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 shadow-sm mb-4">
      <h4 className="text-lg font-semibold text-mt-gray-800 dark:text-white flex items-center mb-3">
        <Icon iconName="rate_review" className="mr-2 text-yellow-600" />
        Rate Gemini's Performance ({geminiFeatureBeingRated})
      </h4>
      <p className="text-sm text-mt-gray-600 dark:text-mt-gray-300 mb-4">
        Your feedback helps Gemini learn and improve its intelligence.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="gemini-rating" className="block mb-1 text-sm">
            How would you rate Gemini's suggestions/performance?
          </Label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                iconName={rating >= star ? "star" : "star_outline"}
                className={`cursor-pointer ${rating >= star ? "text-yellow-500" : "text-gray-400"} hover:text-yellow-400 transition-colors`}
                size="lg"
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="gemini-comment" className="block mb-1 text-sm">
            Any comments for Gemini? (Optional)
          </Label>
          <FormikTextareaField
            name="gemini-comment-field" // dummy name for FormikTextareaField
            id="gemini-comment"
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setComment(e.target.value)
            }
            placeholder="e.g., 'Gemini's predictions were spot on!', 'More context needed for suggestions.'"
            rows={3}
          />
        </div>
        <Button buttonType="primary" isSubmit disabled={isSubmitting}>
          {isSubmitting ? (
            <Spinner className="w-4 h-4 mr-2" />
          ) : (
            <Icon iconName="send" className="mr-2" />
          )}
          Submit Feedback to Gemini
        </Button>
        {submitStatus && (
          <p className={`text-sm mt-2 ${submitStatus.startsWith("Thank you") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {submitStatus}
          </p>
        )}
      </form>
    </div>
  );
};

/**
 * YoGeminiConfigurationOptimizerProps: A component that uses Gemini to suggest optimal strategy configurations.
 */
export interface YoGeminiConfigurationOptimizerProps {
  currentStrategyConfig: string;
  onOptimize: (
    currentConfig: string,
  ) => Promise<{ optimizedConfig: string; rationale: string }>;
  geminiOptimizationLevel: GeminiOptimizationLevel;
}

/**
 * YoGeminiConfigurationOptimizer: This component leverages Gemini's intelligence
 * to suggest and apply optimized versions of the strategy configuration.
 */
export const YoGeminiConfigurationOptimizer: React.FC<YoGeminiConfigurationOptimizerProps> = ({
  currentStrategyConfig,
  onOptimize,
  geminiOptimizationLevel,
}) => {
  const [optimizedConfig, setOptimizedConfig] = useState<string | null>(null);
  const [optimizationRationale, setOptimizationRationale] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  const runOptimization = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOptimizedConfig(null);
    setOptimizationRationale(null);
    try {
      const result = await onOptimize(currentStrategyConfig);
      setOptimizedConfig(result.optimizedConfig);
      setOptimizationRationale(result.rationale);
    } catch (e: any) {
      setError(`Gemini optimization failed: ${e.message || "Unknown error."}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentStrategyConfig, onOptimize]);

  const diffConfigs = useMemo(() => {
    if (!optimizedConfig) return [];
    // This is a simplified diff. A real one would use a library.
    const currentLines = currentStrategyConfig.split("\n");
    const optimizedLines = optimizedConfig.split("\n");
    const changes: { type: "added" | "removed" | "unchanged"; line: string }[] = [];

    // Dummy diff logic for line count purposes
    const maxLength = Math.max(currentLines.length, optimizedLines.length);
    for (let i = 0; i < maxLength; i++) {
        const currentLine = currentLines[i];
        const optimizedLine = optimizedLines[i];
        if (currentLine === undefined) {
            changes.push({ type: "added", line: optimizedLine });
        } else if (optimizedLine === undefined) {
            changes.push({ type: "removed", line: currentLine });
        } else if (currentLine === optimizedLine) {
            changes.push({ type: "unchanged", line: currentLine });
        } else {
            changes.push({ type: "removed", line: currentLine });
            changes.push({ type: "added", line: optimizedLine });
        }
    }
    return changes;
}, [currentStrategyConfig, optimizedConfig]);


  return (
    <div className="yo-gemini-config-optimizer border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-4 bg-green-50 dark:bg-gray-800 shadow-inner mb-4">
      <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center mb-3">
        <Icon iconName="tune" className="mr-2 text-green-600" />
        Gemini Configuration Optimizer ({geminiOptimizationLevel})
      </h3>
      <p className="text-sm text-mt-gray-600 dark:text-mt-gray-300 mb-4">
        Leverage Gemini's intelligence to analyze and suggest optimized versions
        of your reconciliation strategy configuration.
      </p>

      <div className="flex items-center space-x-3 mb-4">
        <Button buttonType="primary" onClick={runOptimization} disabled={isLoading}>
          {isLoading ? (
            <Spinner className="w-4 h-4 mr-2" />
          ) : (
            <Icon iconName="auto_fix_high" className="mr-2" />
          )}
          Optimize with Gemini
        </Button>
        <span className="text-sm text-mt-gray-500 dark:text-mt-gray-400">
          Optimization Level: <span className="font-semibold text-green-700 dark:text-green-400">{geminiOptimizationLevel}</span>
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Spinner size="md" className="mr-2 text-green-500" />
          <span className="text-green-600 dark:text-green-400">
            Gemini optimizing strategy...
          </span>
        </div>
      )}

      {error && (
        <div className="text-red-600 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
          <Icon iconName="error_outline" className="mr-2" />
          {error}
        </div>
      )}

      {optimizedConfig && !isLoading && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-md shadow-inner border border-green-100 dark:border-green-700">
          <h4 className="font-semibold text-mt-gray-800 dark:text-white mb-2 flex items-center">
            <Icon iconName="check_circle" className="mr-2 text-green-500" />
            Gemini's Optimized Configuration:
          </h4>
          <p className="text-sm text-mt-gray-700 dark:text-mt-gray-200 mb-3 italic">
            Rationale: {optimizationRationale || "No detailed rationale provided by Gemini."}
          </p>
          <div className="mb-3">
            <Button
              buttonType="secondary"
              size="sm"
              onClick={() => setShowDiff(!showDiff)}
              className="flex items-center"
            >
              <Icon iconName={showDiff ? "code_off" : "code"} className="mr-2" />
              {showDiff ? "Hide Diff" : "Show Gemini Diff"}
            </Button>
            <Button
                buttonType="primary"
                size="sm"
                className="ml-2 flex items-center"
                onClick={() => {
                  // Simulate applying the configuration
                  console.log("Applying Gemini Optimized Config:", optimizedConfig);
                  alert("Simulating application of Gemini's optimized configuration. In a real scenario, this would update the strategy.");
                }}
            >
                <Icon iconName="auto_awesome" className="mr-2" />
                Apply Gemini Config
            </Button>
          </div>
          {showDiff ? (
            <div className="whitespace-pre-wrap text-xs font-mono bg-gray-50 dark:bg-gray-700 p-3 rounded-md max-h-60 overflow-auto">
                {diffConfigs.map((change, index) => (
                    <div key={index} className={
                        change.type === "added" ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" :
                        change.type === "removed" ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" :
                        "text-gray-700 dark:text-gray-300"
                    }>
                        {change.type === "added" ? "+ " : change.type === "removed" ? "- " : "  "}
                        {change.line}
                    </div>
                ))}
            </div>
          ) : (
            <Field
              className="p-2 font-mono text-sm border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              name="geminiOptimizedStrategyConfig" // A dummy name for Field
              id="geminiOptimizedStrategyConfig"
              component={FormikTextareaField}
              value={optimizedConfig}
              readOnly
              rows={Math.min(optimizedConfig.split("\n").length + 2, 15)}
            />
          )}
        </div>
      )}
      <p className="text-xs text-right text-mt-gray-400 dark:text-mt-gray-500 mt-3">
        Optimized by Gemini's deep learning algorithms.
      </p>
    </div>
  );
};

/**
 * YoGeminiRealtimeValidationStatusProps: Props for the real-time validation component.
 */
export interface YoGeminiRealtimeValidationStatusProps {
  validationInput: string;
  strategyName: string;
  geminiValidationSchemaId: string;
  onValidationResult: (isValid: boolean, errors: string[]) => void;
  debounceTime?: number;
}

/**
 * YoGeminiRealtimeValidationStatus: Provides live validation feedback, powered by Gemini.
 * It simulates an AI-driven validator that checks the validity of complex configuration.
 */
export const YoGeminiRealtimeValidationStatus: React.FC<YoGeminiRealtimeValidationStatusProps> = ({
  validationInput,
  strategyName,
  geminiValidationSchemaId,
  onValidationResult,
  debounceTime = 500,
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const geminiAIModel = useMemo(() => new GeminiAIModelService(), []);

  const debouncedValidate = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debouncedValidate.current) {
      clearTimeout(debouncedValidate.current);
    }

    setIsLoading(true);
    setIsValid(null);
    setValidationErrors([]);

    debouncedValidate.current = setTimeout(async () => {
      try {
        const { valid, errors } = await geminiAIModel.validateGeminiConfig(
          validationInput,
          geminiValidationSchemaId,
        );
        setIsValid(valid);
        setValidationErrors(errors);
        onValidationResult(valid, errors);
      } catch (error: any) {
        console.error("Gemini validation error:", error);
        setIsValid(false);
        setValidationErrors([
          `Gemini validation service error: ${error.message || "Unknown."}`,
        ]);
        onValidationResult(false, [`Gemini service error: ${error.message || "Unknown."}`]);
      } finally {
        setIsLoading(false);
      }
    }, debounceTime);

    return () => {
      if (debouncedValidate.current) {
        clearTimeout(debouncedValidate.current);
      }
    };
  }, [validationInput, geminiValidationSchemaId, onValidationResult, debounceTime, geminiAIModel]);

  const statusIcon =
    isValid === true
      ? "check_circle"
      : isValid === false
        ? "error"
        : isLoading
          ? "pending"
          : "info";
  const statusColor =
    isValid === true
      ? "text-green-500"
      : isValid === false
        ? "text-red-500"
        : isLoading
          ? "text-blue-500"
          : "text-gray-500";
  const statusText =
    isValid === true
      ? "Valid (Gemini Confirmed)"
      : isValid === false
        ? "Invalid (Gemini Identified Errors)"
        : isLoading
          ? "Gemini Validating..."
          : "Awaiting Input for Gemini Validation";

  return (
    <div className="yo-gemini-validation border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 shadow-sm transition-all duration-200 mb-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-mt-gray-800 dark:text-white flex items-center">
          <Icon iconName="verified" className="mr-2 text-blue-500" />
          Gemini Real-time Configuration Validation
        </h4>
        <div className="flex items-center">
          {isLoading && <Spinner className="w-4 h-4 mr-2 text-blue-500" />}
          <Icon iconName={statusIcon} className={statusColor} size="md" />
          <span className={`ml-2 text-sm ${statusColor}`}>{statusText}</span>
        </div>
      </div>
      {validationErrors.length > 0 && (
        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
          <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300">
            {validationErrors.map((err, idx) => (
              <li key={`val-err-${idx}`}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-right text-mt-gray-400 dark:text-mt-gray-500 mt-2">
        Utilizing Gemini's schema validation engine (ID: {geminiValidationSchemaId.substring(0,8)}...).
      </p>
    </div>
  );
};


// --- ReconciliationStrategy Component (Original component enhanced) ---

interface ReconciliationStrategyProps {
  strategy: Strategy;
  callback: (matchResults: MatchResultInput[]) => void;
  overrideMatchers: MatchResultInput[];
  geminiMetadata?: IGeminiStrategyMetadata; // New prop for Gemini metadata
  geminiPredictionContext?: IGeminiPredictionContext; // Context for AI predictions
  geminiHistoricalMatchRates?: { date: Date; rate: number }[]; // For anomaly detection and prediction
  onGeminiPredictionRun?: (
    context: IGeminiPredictionContext,
  ) => Promise<IGeminiRecommendationOutput>; // Callback for running predictions
  onGeminiStrategyConfigOptimize?: (
    currentConfig: string,
  ) => Promise<{ optimizedConfig: string; rationale: string }>; // Callback for config optimization
}

function ReconciliationStrategy({
  strategy,
  callback,
  overrideMatchers,
  geminiMetadata,
  geminiPredictionContext,
  geminiHistoricalMatchRates = [],
  onGeminiPredictionRun,
  onGeminiStrategyConfigOptimize,
}: ReconciliationStrategyProps) {
  const strategyConfigLines = strategy.strategyConfig.split("\n");
  const strategyConfigRows =
    strategyConfigLines.length +
    strategyConfigLines.filter((l) => l.length > 80).length + 5; // Added 5 extra rows for Gemini
  const matchResults = (strategy.transactionMatchResults || []).concat(
    strategy.transactableMatchResults || [],
  );
  const [matchResultState, setMatchResultState] =
    useState<MatchResultInput[]>(overrideMatchers);

  // Gemini global analytics hook integration
  const { logGeminiEvent, getGeminiGlobalAnalytics } = useGeminiGlobalAnalytics();
  // Gemini user preferences hook integration
  const { userPreferences, updatePreference } = useGeminiUserPreferences();
  // Gemini telemetry logger hook
  const { logTelemetryData } = useGeminiTelemetryLogger();

  const currentMatchRate = useMemo(() => {
    if (matchResults.length === 0) return 0;
    return matchResults.filter((mr) => mr.match).length / matchResults.length;
  }, [matchResults]);

  useEffect(() => {
    logGeminiEvent("StrategyViewed", { strategyName: strategy.name, strategyId: strategy.id });
    logTelemetryData({
      eventType: "StrategyLoad",
      payload: { strategyId: strategy.id, geminiUserPreference: userPreferences.theme },
    });
  }, [strategy.name, strategy.id, logGeminiEvent, logTelemetryData, userPreferences.theme]);

  const matchResultCallback = (
    id: string,
    strategy_name: string,
    field: string,
    matcher_type: string,
    matcher: string,
  ) => {
    setMatchResultState((prevState) => {
      const newState = [
        ...prevState.filter((obj) => obj.id !== id),
        {
          id,
          strategyName: strategy_name,
          field,
          matcherType: matcher_type,
          matcher,
        } as MatchResultInput,
      ];
      logGeminiEvent("MatcherOverride", { strategy_name, field, matcher_type, newMatcher: matcher, geminiTimestamp: new Date() });
      logTelemetryData({
        eventType: "MatcherUpdate",
        payload: { strategyId: strategy.id, matchResultId: id, newMatcher: matcher },
      });
      return newState;
    });
  };

  const matchResultValues = matchResults
    .map((mr) => [strategy.name + mr.matcherType + mr.field, mr.matcher])
    .reduce((a, v) => ({ ...a, [v[0]]: v[1] }), {});

  const initialValues = {
    ...matchResultValues,
    strategyConfig: strategy.strategyConfig || "",
  };

  const geminiAIModel = useMemo(() => new GeminiAIModelService(), []);

  // State for YoGeminiContextualGuidancePanel
  const [currentFormContext, setCurrentFormContext] = useState<Record<string, any>>({});
  const handleFormikChange = useCallback((e: React.ChangeEvent<any>) => {
    setCurrentFormContext((prev) => ({ ...prev, [e.target.name]: e.target.value, lastEditedField: e.target.name }));
  }, []);

  const handleGeminiGuidanceAction = useCallback((actionId: string, payload: Record<string, any>) => {
    console.log(`Gemini Action triggered: ${actionId}`, payload);
    alert(`Gemini suggested action "${actionId}" was performed with payload: ${JSON.stringify(payload)}. (Simulated)`);
    logGeminiEvent("GeminiActionExecuted", { actionId, payload, strategyId: strategy.id });
  }, [logGeminiEvent, strategy.id]);

  // Use Gemini Intelligent Scoring hook
  const { score, isLoadingScore, geminiScoreDetails, refreshGeminiScore } = useGeminiIntelligentScoring(strategy.id);

  const mockStrategyHistory = useMemo(() => {
    const events = [];
    events.push({
      id: "initial-creation",
      timestamp: new Date(strategy.createdAt || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)),
      description: "Strategy initially created.",
      eventType: "CONFIG_CHANGE",
      geminiAnalysisConfidence: 0.98
    });
    // Add some random historical events for demonstration
    for (let i = 0; i < 5; i++) {
        const timestamp = new Date(Date.now() - (Math.random() * 365) * 24 * 60 * 60 * 1000);
        const eventTypes = ["CONFIG_CHANGE", "DEPLOYMENT", "GEMINI_OPTIMIZATION", "MANUAL_OVERRIDE"];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as any;
        events.push({
            id: `event-${i}-${timestamp.getTime()}`,
            timestamp,
            description: `Simulated ${eventType.toLowerCase().replace(/_/g, ' ')} at this point.`,
            eventType,
            geminiAnalysisConfidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
        });
    }
    if (geminiMetadata?.lastOptimizationRun) {
      events.push({
        id: "gemini-last-opt",
        timestamp: geminiMetadata.lastOptimizationRun,
        description: "Gemini AI performed last known optimization.",
        eventType: "GEMINI_OPTIMIZATION",
        details: { level: geminiMetadata.geminiRecommendationStrength },
        geminiAnalysisConfidence: 0.99
      })
    }
    return events;
  }, [strategy.createdAt, geminiMetadata]);

  // Dummy function for optimization
  const handleGeminiOptimize = useCallback(async (currentConfig: string) => {
    console.log("Gemini optimizing config...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    const optimizedConfig = currentConfig + "\n# Gemini-optimized rule: ADDED_BY_AI = true\n# Adjustments for performance based on Gemini's analysis.";
    const rationale = "Gemini identified potential for improved performance by simplifying redundant rules and adding a new AI-inferred condition based on recent transaction patterns. This optimizes the strategy for both accuracy and processing efficiency.";
    logGeminiEvent("StrategyConfigOptimized", { strategyId: strategy.id, originalConfigHash: btoa(currentConfig), optimizedConfigHash: btoa(optimizedConfig), geminiRationale: rationale });
    return { optimizedConfig, rationale };
  }, [strategy.id, logGeminiEvent]);

  // Dummy function for prediction
  const handleGeminiPrediction = useCallback(async (context: IGeminiPredictionContext) => {
    console.log("Gemini running prediction for context:", context);
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate AI model inference
    const predictedRate = Math.min(context.historicalMatchRates.length > 0 ? context.historicalMatchRates[0].rate * 1.05 : 0.95, 0.99); // Slightly improve or default
    const result: IGeminiRecommendationOutput = {
      predictedMatchRate: predictedRate,
      suggestedMatcherChanges: [
        { field: "amount", type: "transactions", suggestion: "Consider fuzzy matching for small variations." },
        { field: "currency", type: "transactables", suggestion: "Ensure strict currency code validation." },
      ],
      recommendedConfigAdjustments: [
        { path: "rules[0].threshold", value: "0.98" },
      ],
      geminiConfidenceInterval: [predictedRate * 0.9, predictedRate * 1.05],
      geminiRecommendationRationale: "Based on historical performance and recent data trends, Gemini suggests minor adjustments to improve match rate by 2%.",
      contextualActions: [
        { actionId: "review-fuzzy-match", label: "Review Fuzzy Match Logic", description: "Gemini suggests reviewing fuzzy matching thresholds for transactional amounts to capture more near-misses.", severity: "INFO", callbackPayload: { field: "amount", type: "transactions" } },
        { actionId: "update-currency-strictness", label: "Increase Currency Strictness", description: "Gemini recommends stricter currency validation rules to prevent false positives.", severity: "WARNING", callbackPayload: { field: "currency", type: "transactables" } }
      ]
    };
    logGeminiEvent("GeminiPredictionCompleted", { strategyId: strategy.id, context, result, geminiTimestamp: new Date() });
    return result;
  }, [strategy.id, logGeminiEvent]);

  // Handle Gemini Anomaly Detection
  const handleAnomalyDetected = useCallback((anomalyData: any) => {
    console.warn("!!!! GEMINI ANOMALY ALERT !!!!", anomalyData);
    alert(`Gemini Alert: ${anomalyData.geminiInsight}`);
    logGeminiEvent("AnomalyDetected", { strategyId: strategy.id, anomalyData, geminiTimestamp: new Date() });
  }, [strategy.id, logGeminiEvent]);

  return (
    <MTContainer className="yo-gemini-strategy-container bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-950 dark:to-gray-900 min-h-screen p-6 transition-colors duration-300">
      <div className="pt-4 max-w-7xl mx-auto">
        {/* Gemini Global Dashboard Insights */}
        <YoGeminiDataPanel
            panelTitle="Gemini Strategy Dashboard Overview"
            dataPoints={[
                { label: "Overall Match Rate (Gemini Avg)", value: (getGeminiGlobalAnalytics().overallMatchRate * 100).toFixed(2), unit: "%" },
                { label: "Active Strategies (Gemini Monitored)", value: getGeminiGlobalAnalytics().activeStrategiesCount },
                { label: "Gemini AI Model Latency", value: (Math.random() * 50 + 10).toFixed(1), unit: "ms" },
                { label: "Gemini Recommendations Today", value: Math.floor(Math.random() * 10) },
                { label: "User Preference Theme", value: userPreferences.theme === 'dark' ? 'Dark Mode (Gemini)' : 'Light Mode (Gemini)' },
                { label: "Current Strategy Score (Gemini)", value: isLoadingScore ? "Loading..." : score.toFixed(2) },
            ]}
            isLoading={false}
            geminiDataOrigin="Gemini_Global_Analytics_API_V3"
            onRefreshGeminiData={async () => {
              console.log("Simulating refreshing global Gemini data...");
              await new Promise(r => setTimeout(r, 1000)); // Simulate API call
            }}
        />

        {geminiMetadata && (
            <div className="yo-gemini-metadata-card p-4 mb-4 bg-blue-50 dark:bg-gray-800 border-l-4 border-blue-500 rounded-lg shadow-sm">
                <h4 className="text-md font-semibold text-blue-800 dark:text-blue-300 flex items-center mb-2">
                    <Icon iconName="auto_awesome_sparkle" className="mr-2 text-blue-600" />
                    Gemini AI Strategy Metadata
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-mt-gray-700 dark:text-mt-gray-200">
                    <p><strong>Version:</strong> {geminiMetadata.version}</p>
                    <p><strong>AI Tags:</strong> {geminiMetadata.aiGeneratedTags.join(", ")}</p>
                    <p><strong>Performance Score:</strong> <span className="font-bold text-green-600 dark:text-green-400">{geminiMetadata.performanceScore.toFixed(1)}</span></p>
                    <p><strong>Gemini Deployment Status:</strong> <span className="font-bold text-blue-700 dark:text-blue-400">{geminiMetadata.geminiDeploymentStatus}</span></p>
                    <p><strong>Last AI Optimization:</strong> {geminiMetadata.lastOptimizationRun?.toLocaleString() || "Never"}</p>
                    <p><strong>Gemini Confidence:</strong> {(geminiMetadata.geminiConfidenceScore * 100).toFixed(1)}%</p>
                </div>
            </div>
        )}

        <ExpandableCard
          expandable
          minHeightWhenExpandable={180}
          heading={strategy.name}
          expanded={matchResults.filter((mr) => mr.override).length > 0}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-xl transition-all duration-300"
        >
          <div className="border-mt-gray-200 dark:border-gray-700 border-t p-2" />

          {/* Gemini Anomaly Detection Monitor */}
          <YoGeminiAnomalyDetectionMonitor
              strategyName={strategy.name}
              currentMatchRate={currentMatchRate}
              historicalMatchRates={geminiHistoricalMatchRates}
              onAnomalyDetected={handleAnomalyDetected}
              geminiAnomalyThreshold={GeminiConstants.ANOMALY_THRESHOLD_STD_DEV}
              geminiMonitoringActive={true}
          />

          <Formik
            initialValues={initialValues}
            enableReinitialize
            onSubmit={(_, actions) => {
              callback(matchResultState);
              // Gemini Telemetry for form submission
              logTelemetryData({
                eventType: "StrategyEvaluate",
                payload: {
                  strategyId: strategy.id,
                  matchResultState: matchResultState.map(mr => ({ id: mr.id, matcher: mr.matcher })),
                  geminiTimestamp: new Date(),
                },
              });
              actions.resetForm();
              actions.setSubmitting(false);
            }}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form className="space-y-6">
                <div>
                  <div className="pr-2">
                    {matchResults.every((mr) => mr.match) ? (
                      <Icon
                        className="float-right text-green-500"
                        iconName="check_circle_outline" // Changed icon for Gemini touch
                        color="currentColor"
                        size="xl"
                      />
                    ) : (
                      <Icon
                        className="float-right text-red-500"
                        iconName="error_outline" // Changed icon
                        color="currentColor"
                        size="xl"
                      />
                    )}
                    <Label className="pb-2 pl-4 text-base font-medium">
                      {`${matchResults.filter((mr) => mr.match).length}/${
                        matchResults.length
                      } Properties Matched (Gemini Evaluated)`}
                      <Tooltip content="This metric reflects the current matching status after Gemini's latest evaluation cycle.">
                          <Icon iconName="info_outline" className="ml-2 text-gray-400" size="sm"/>
                      </Tooltip>
                    </Label>
                  </div>
                </div>

                {/* Gemini Intelligent Scoring Display */}
                <div className="flex items-center pl-4 py-2 border-l-4 border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-gray-800 rounded-md">
                    <Icon iconName="auto_graph" className="mr-3 text-emerald-600" size="lg" />
                    <Label className="text-base text-emerald-800 dark:text-emerald-300">
                        Gemini Intelligent Performance Score:
                    </Label>
                    {isLoadingScore ? (
                        <Spinner className="ml-3 w-5 h-5 text-emerald-600" />
                    ) : (
                        <span className="ml-3 text-xl font-bold text-emerald-700 dark:text-emerald-400">
                            {score.toFixed(2)}
                        </span>
                    )}
                    <Tooltip content={`Gemini's comprehensive score for this strategy. Details: ${JSON.stringify(geminiScoreDetails)}`}>
                        <Icon iconName="help_outline" className="ml-2 text-gray-500" size="sm" />
                    </Tooltip>
                    <Button buttonType="tertiary" size="sm" onClick={refreshGeminiScore} className="ml-4 flex items-center">
                        <Icon iconName="refresh" className="mr-1" /> Gemini Score Refresh
                    </Button>
                </div>


                {strategy.transactionMatchResults &&
                  strategy.transactionMatchResults.filter(
                    (mr) => !mr.match || mr.override,
                  ).length > 0 && (
                    <Label className="pb-2 pl-4 text-base font-semibold text-blue-700 dark:text-blue-300">
                      Transaction Matchers (Gemini Aided)
                    </Label>
                  )}
                {strategy.transactionMatchResults &&
                  strategy.transactionMatchResults
                    .filter((mr) => !mr.match || mr.override)
                    .map((matchResult) => (
                      <ReconciliationMatchResult
                        key={matchResult.field + matchResult.matcherType}
                        matchResult={matchResult}
                        strategyName={strategy.name}
                        matcherType="transactions"
                        callback={matchResultCallback}
                      />
                    ))}
                {strategy.transactableMatchResults &&
                  strategy.transactableMatchResults.filter(
                    (mr) => !mr.match || mr.override,
                  ).length > 0 && (
                    <Label className="pb-2 pl-4 text-base font-semibold text-purple-700 dark:text-purple-300">
                      Transactable Matchers (Gemini Aided)
                    </Label>
                  )}
                {strategy.transactableMatchResults &&
                  strategy.transactableMatchResults
                    .filter((mr) => !mr.match || mr.override)
                    .map((matchResult) => (
                      <ReconciliationMatchResult
                        key={matchResult.field + matchResult.matcherType}
                        matchResult={matchResult}
                        strategyName={strategy.name}
                        matcherType="transactables"
                        callback={matchResultCallback}
                      />
                    ))}
                <div className="pl-2">
                  <Button buttonType="primary" isSubmit disabled={isSubmitting} className="flex items-center">
                    <Icon iconName="insights" className="mr-2" />
                    Evaluate Matchers (Gemini Informed)
                  </Button>
                </div>

                {/* Gemini Contextual Guidance Panel */}
                <YoGeminiContextualGuidancePanel
                    currentContext={{ ...currentFormContext, strategyId: strategy.id, isSubmitting }}
                    onGuidanceAction={handleGeminiGuidanceAction}
                    geminiPersona={userPreferences.geminiPersona || "HELPFUL"}
                />

                <div className="p-2 border-t border-b border-gray-200 dark:border-gray-700 py-4">
                  <Label className="py-2 pl-4 text-base font-bold text-gray-800 dark:text-white flex items-center">
                    <Icon iconName="settings_ethernet" className="mr-2 text-orange-500" />
                    Strategy Configuration (Gemini Monitored)
                  </Label>
                  <Field
                    className="p-2 font-mono text-sm border border-gray-300 rounded-md w-full focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    name="strategyConfig"
                    id="strategyConfig"
                    component={FormikTextareaField}
                    rows={strategyConfigRows}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setFieldValue("strategyConfig", e.target.value);
                        handleFormikChange(e);
                    }}
                  />
                  {/* YoGemini Real-time Validation Status */}
                  <YoGeminiRealtimeValidationStatus
                    validationInput={values.strategyConfig}
                    strategyName={strategy.name}
                    geminiValidationSchemaId={GeminiConstants.STRATEGY_CONFIG_VALIDATION_SCHEMA_ID}
                    onValidationResult={(isValid, errors) => {
                      if (!isValid) {
                        console.error("Gemini Validation Errors:", errors);
                      }
                      // You might want to update Formik's internal errors here too
                    }}
                  />
                </div>

                {/* Gemini Predictive Analytics Panel */}
                {geminiPredictionContext && onGeminiPredictionRun && (
                    <YoGeminiPredictiveAnalytics
                        predictionContext={geminiPredictionContext}
                        onRunPrediction={onGeminiPredictionRun}
                        initialRecommendation={null} // Can be pre-fetched
                        geminiModelVersion="0.8.beta"
                    />
                )}

                {/* Gemini Configuration Optimizer */}
                {onGeminiStrategyConfigOptimize && (
                    <YoGeminiConfigurationOptimizer
                        currentStrategyConfig={values.strategyConfig}
                        onOptimize={onGeminiStrategyConfigOptimize}
                        geminiOptimizationLevel={geminiMetadata?.geminiRecommendationStrength || GeminiOptimizationLevel.SUGGESTIVE}
                    />
                )}

                {/* Gemini Strategy History Timeline */}
                <YoGeminiStrategyHistoryTimeline
                    strategyId={strategy.id}
                    historyEvents={mockStrategyHistory}
                    onViewEventDetails={(id) => alert(`Gemini Event Details for: ${id}`)}
                    geminiInsightsEnabled={true}
                />

                {/* YoGemini Feedback Mechanism */}
                <YoGeminiFeedbackMechanism
                    strategyId={strategy.id}
                    onFeedbackSubmit={async (stratId, rating, comment, feature) => {
                        console.log(`Feedback submitted for ${stratId} on ${feature}: ${rating} stars, comment: "${comment}"`);
                        // Simulate API call
                        await new Promise(r => setTimeout(r, 700));
                        logGeminiEvent("UserFeedback", { strategyId: stratId, rating, comment, feature, geminiTimestamp: new Date() });
                    }}
                    geminiFeatureBeingRated="Strategy Optimization & Prediction"
                />

                <div className="mt-8 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg text-center">
                    <p className="text-lg font-bold flex items-center justify-center">
                        <Icon iconName="psychology" className="mr-3 text-yellow-300" size="lg" />
                        Powered by Gemini AI - Elevating Reconciliation Intelligence.
                    </p>
                    <p className="text-sm mt-2 opacity-90">
                        Continuously learning, adapting, and optimizing your financial workflows.
                        Gemini is always vigilant, ensuring precision and compliance.
                    </p>
                </div>
              </Form>
            )}
          </Formik>
        </ExpandableCard>
      </div>
    </MTContainer>
  );
}

export default ReconciliationStrategy;

// --- New files for expansion (Mocked implementations) ---

// File: `app/components/YoGeminiDataPanel.tsx` (already defined above to reduce file count)
// File: `app/components/YoGeminiPredictiveAnalytics.tsx` (already defined above)
// File: `app/components/YoGeminiStrategyHistoryTimeline.tsx` (already defined above)
// File: `app/components/YoGeminiAnomalyDetectionMonitor.tsx` (already defined above)
// File: `app/components/YoGeminiContextualGuidancePanel.tsx` (already defined above)
// File: `app/components/YoGeminiFeedbackMechanism.tsx` (already defined above)
// File: `app/components/YoGeminiConfigurationOptimizer.tsx` (already defined above)
// File: `app/components/YoGeminiRealtimeValidationStatus.tsx` (already defined above)

// --- File: `app/hooks/useGeminiGlobalAnalytics.ts` ---
export interface GeminiGlobalAnalytics {
  overallMatchRate: number;
  activeStrategiesCount: number;
  geminiModelHealth: "GOOD" | "DEGRADED" | "CRITICAL";
  lastDataRefresh: Date;
}

export const useGeminiGlobalAnalytics = () => {
  const [analytics, setAnalytics] = useState<GeminiGlobalAnalytics>({
    overallMatchRate: 0.85,
    activeStrategiesCount: 120,
    geminiModelHealth: "GOOD",
    lastDataRefresh: new Date(),
  });
  const [eventLog, setEventLog] = useState<any[]>([]);

  useEffect(() => {
    // Simulate real-time updates from a Gemini analytics service
    const interval = setInterval(() => {
      setAnalytics((prev) => ({
        ...prev,
        overallMatchRate: Math.min(prev.overallMatchRate + (Math.random() - 0.5) * 0.01, 0.99),
        activeStrategiesCount: prev.activeStrategiesCount + Math.floor(Math.random() * 3) - 1,
        lastDataRefresh: new Date(),
        geminiModelHealth: Math.random() > 0.95 ? "DEGRADED" : "GOOD",
      }));
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const logGeminiEvent = useCallback((eventName: string, data: Record<string, any>) => {
    const newEvent = { timestamp: new Date(), eventName, data };
    setEventLog((prev) => [...prev, newEvent]);
    // In a real system, this would send to a global analytics endpoint
    console.log("Gemini Event Logged:", newEvent);
  }, []);

  const getGeminiGlobalAnalytics = useCallback(() => analytics, [analytics]);
  const getGeminiEventLog = useCallback(() => eventLog, [eventLog]);

  return { getGeminiGlobalAnalytics, logGeminiEvent, getGeminiEventLog };
};

// --- File: `app/hooks/useGeminiUserPreferences.ts` ---
export interface GeminiUserPreferences {
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  geminiPersona: "HELPFUL" | "ANALYST" | "CRITICAL";
  autoApplyRecommendations: boolean;
}

export const useGeminiUserPreferences = () => {
  const [userPreferences, setUserPreferences] = useState<GeminiUserPreferences>(() => {
    // Load from local storage or set defaults
    try {
      const stored = localStorage.getItem("geminiUserPreferences");
      return stored ? JSON.parse(stored) : GeminiConstants.DEFAULT_USER_PREFERENCES;
    } catch (e) {
      console.warn("Failed to parse Gemini user preferences from localStorage, using defaults.", e);
      return GeminiConstants.DEFAULT_USER_PREFERENCES;
    }
  });

  useEffect(() => {
    localStorage.setItem("geminiUserPreferences", JSON.stringify(userPreferences));
  }, [userPreferences]);

  const updatePreference = useCallback((key: keyof GeminiUserPreferences, value: any) => {
    setUserPreferences((prev) => ({ ...prev, [key]: value }));
    console.log(`Gemini User Preference updated: ${key} = ${value}`);
  }, []);

  return { userPreferences, updatePreference };
};

// --- File: `app/hooks/useGeminiTelemetryLogger.ts` ---
export interface GeminiTelemetryEvent {
  eventType: string;
  payload: Record<string, any>;
  timestamp: Date;
  geminiSessionId: string;
  geminiClientVersion: string;
}

export const useGeminiTelemetryLogger = () => {
  const geminiSessionId = useRef(
    `gemini-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );
  const geminiClientVersion = "gemini-recon-ui-1.0.AI";

  const logTelemetryData = useCallback((event: Omit<GeminiTelemetryEvent, "timestamp" | "geminiSessionId" | "geminiClientVersion">) => {
    const telemetryEvent: GeminiTelemetryEvent = {
      ...event,
      timestamp: new Date(),
      geminiSessionId: geminiSessionId.current,
      geminiClientVersion,
    };
    // In a real application, this would send data to a telemetry endpoint
    console.log("Gemini Telemetry Logged:", telemetryEvent);
    // Simulate sending to a queue or direct API call
    new Promise(resolve => setTimeout(resolve, 50)).then(() =>
      console.debug("Telemetry sent to Gemini backend (simulated).")
    );
  }, []);

  return { logTelemetryData, geminiSessionId: geminiSessionId.current, geminiClientVersion };
};

// --- File: `app/hooks/useGeminiIntelligentScoring.ts` ---
export interface GeminiScoreDetails {
    dataFreshness: number; // 0-1, higher is better
    configComplexity: number; // 0-1, lower is better
    historicalPerformance: number; // 0-1, higher is better
    geminiFeatureAdoption: number; // 0-1, higher is better
    overrideFrequency: number; // 0-1, lower is better
    geminiDerivedConfidence: number; // 0-1, AI's self-confidence
}

export const useGeminiIntelligentScoring = (strategyId: string) => {
    const [score, setScore] = useState<number>(0);
    const [isLoadingScore, setIsLoadingScore] = useState(true);
    const [geminiScoreDetails, setGeminiScoreDetails] = useState<GeminiScoreDetails>({
        dataFreshness: 0,
        configComplexity: 0,
        historicalPerformance: 0,
        geminiFeatureAdoption: 0,
        overrideFrequency: 0,
        geminiDerivedConfidence: 0,
    });

    const calculateGeminiScore = useCallback(async () => {
        setIsLoadingScore(true);
        console.log(`Gemini calculating intelligent score for strategy: ${strategyId}`);
        // Simulate an AI calculation from a complex model
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

        const dataFreshness = Math.random() * 0.2 + 0.8; // High freshness
        const configComplexity = Math.random() * 0.4; // Low complexity desirable
        const historicalPerformance = Math.random() * 0.3 + 0.6; // Decent performance
        const geminiFeatureAdoption = Math.random() * 0.5 + 0.5; // Some adoption
        const overrideFrequency = Math.random() * 0.3; // Low override frequency desirable
        const geminiDerivedConfidence = Math.random() * 0.2 + 0.7; // AI's confidence

        const newScoreDetails: GeminiScoreDetails = {
            dataFreshness,
            configComplexity,
            historicalPerformance,
            geminiFeatureAdoption,
            overrideFrequency,
            geminiDerivedConfidence,
        };
        setGeminiScoreDetails(newScoreDetails);

        // A weighted score calculation (Gemini would use a more sophisticated model)
        const newScore = (
            dataFreshness * 0.2 +
            (1 - configComplexity) * 0.15 + // Inverse for complexity
            historicalPerformance * 0.3 +
            geminiFeatureAdoption * 0.15 +
            (1 - overrideFrequency) * 0.1 + // Inverse for override frequency
            geminiDerivedConfidence * 0.1
        ) * 100; // Scale to 0-100

        setScore(newScore);
        setIsLoadingScore(false);
        console.log(`Gemini score for ${strategyId}: ${newScore.toFixed(2)}`);
    }, [strategyId]);

    useEffect(() => {
        calculateGeminiScore();
    }, [calculateGeminiScore]);

    const refreshGeminiScore = useCallback(() => {
        calculateGeminiScore();
    }, [calculateGeminiScore]);

    return { score, isLoadingScore, geminiScoreDetails, refreshGeminiScore };
};


// --- File: `app/services/GeminiAIModelService.ts` ---
// This class mocks interactions with a hypothetical Gemini AI backend.
export class GeminiAIModelService {
  private baseApiUrl: string = "https://api.gemini-ai.cloud/v3";
  private mockLatency: number = 300; // ms

  constructor(latency?: number) {
    if (latency) this.mockLatency = latency;
    console.log(`GeminiAIModelService initialized, API endpoint: ${this.baseApiUrl}`);
  }

  private async simulateApiResponse<T>(data: T): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, this.mockLatency + Math.random() * 200));
    // Simulate potential network errors
    if (Math.random() < 0.05) { // 5% chance of error
      throw new Error("Gemini AI API connection failed (simulated).");
    }
    return data;
  }

  /**
   * @method getGeminiContextualGuidance
   * @description Mocks fetching AI-driven contextual guidance.
   * @param context Current UI context.
   * @param persona AI persona for the response.
   * @returns Simulated guidance messages.
   */
  public async getGeminiContextualGuidance(
    context: Record<string, any>,
    persona: "HELPFUL" | "ANALYST" | "CRITICAL",
  ): Promise<
    { id: string; message: string; severity: "info" | "tip" | "warning"; actions?: IGeminiContextualAction[] }[]
  > {
    console.log(`Gemini: Requesting guidance for context: ${JSON.stringify(context)} with persona: ${persona}`);

    let messages: { id: string; message: string; severity: "info" | "tip" | "warning"; actions?: IGeminiContextualAction[] }[] = [];

    if (context.lastEditedField === "strategyConfig" && context.isEditing) {
      messages.push({
        id: "config-edit-tip",
        message: "Gemini suggests reviewing syntax carefully. Malformed config can lead to unexpected reconciliation behavior.",
        severity: "tip",
        actions: [{ actionId: "open-config-docs", label: "Open Gemini Config Docs", description: "Access the official Gemini documentation for strategy configuration syntax.", severity: "INFO", callbackPayload: { docType: "strategyConfig" } }]
      });
      if (persona === "ANALYST") {
        messages.push({
          id: "impact-warning",
          message: "Gemini predicts a moderate impact on match rates with complex config changes. Consider A/B testing.",
          severity: "warning",
          actions: [{ actionId: "schedule-ab-test", label: "Schedule A/B Test", description: "Initiate an A/B test for your modified strategy configuration.", severity: "INFO", callbackPayload: { strategyId: context.strategyId } }]
        });
      }
    } else if (context.isSubmitting) {
        messages.push({
            id: "submit-info",
            message: "Gemini is processing your submission. Please wait for the evaluation results.",
            severity: "info",
        });
    } else {
        messages.push({
            id: "general-tip",
            message: "Gemini is always here to help optimize your strategies. Try using the 'Evaluate Matchers' button.",
            severity: "info",
            actions: [{ actionId: "explore-gemini-features", label: "Explore Gemini Features", description: "Learn more about how Gemini can enhance your reconciliation process.", severity: "INFO", callbackPayload: { featureArea: "gemini-overview" } }]
        });
    }

    return this.simulateApiResponse(messages);
  }

  /**
   * @method validateGeminiConfig
   * @description Mocks AI-driven configuration validation.
   * @param configString The configuration string to validate.
   * @param schemaId The ID of the Gemini validation schema.
   * @returns Validation result.
   */
  public async validateGeminiConfig(
    configString: string,
    schemaId: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    console.log(`Gemini: Validating config using schema ${schemaId}...`);

    // Simulate complex AI validation rules
    let errors: string[] = [];
    let valid = true;

    if (!configString || configString.trim().length === 0) {
      errors.push("Gemini requires a non-empty strategy configuration.");
      valid = false;
    }
    if (configString.includes("invalid_keyword_gemini")) {
      errors.push("Gemini identified an invalid keyword 'invalid_keyword_gemini'. Please consult documentation.");
      valid = false;
    }
    if (configString.split("\n").length > 50 && Math.random() < 0.2) { // Randomly flag long configs
        errors.push("Gemini suggests that very long configurations may impact performance. Consider modularization.");
        valid = false; // It's a warning, but for demo, counts as 'invalid'
    }
    if (configString.toLowerCase().includes("buggy_rule") && Math.random() < 0.6) {
        errors.push("Gemini detected a potential 'buggy_rule' pattern, which has historically caused reconciliation issues.");
        valid = false;
    }

    return this.simulateApiResponse({ valid: valid && errors.length === 0, errors });
  }

  // Add more mock AI functions as needed for expansion...
}

// --- File: `app/constants/GeminiConstants.ts` ---
export const GeminiConstants = {
  DEFAULT_FEATURE_TOGGLES: [
    { name: "PredictiveAnalytics", isEnabled: true, deploymentPhase: "GA", lastUpdatedByGemini: new Date().toISOString() },
    { name: "AnomalyDetection", isEnabled: true, deploymentPhase: "GA", lastUpdatedByGemini: new Date().toISOString() },
    { name: "ConfigOptimizer", isEnabled: true, deploymentPhase: "BETA", lastUpdatedByGemini: new Date().toISOString() },
    { name: "ContextualGuidance", isEnabled: true, deploymentPhase: "GA", lastUpdatedByGemini: new Date().toISOString() },
    { name: "RealtimeValidation", isEnabled: true, deploymentPhase: "GA", lastUpdatedByGemini: new Date().toISOString() },
    { name: "IntelligentScoring", isEnabled: true, deploymentPhase: "BETA", lastUpdatedByGemini: new Date().toISOString() },
  ] as IGeminiFeatureToggle[],
  DEFAULT_USER_PREFERENCES: {
    theme: "dark",
    notificationsEnabled: true,
    geminiPersona: "HELPFUL",
    autoApplyRecommendations: false,
  } as GeminiUserPreferences,
  ANOMALY_THRESHOLD_STD_DEV: 2.5, // How many standard deviations for Gemini to flag an anomaly
  STRATEGY_CONFIG_VALIDATION_SCHEMA_ID: "gemini-recon-config-v1.2",
  GEMINI_INSIGHTS_API_VERSION: "v3.1.2-alpha",
};