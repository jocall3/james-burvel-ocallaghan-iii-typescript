import React, { useState, SyntheticEvent, useCallback, createContext, useContext, useMemo, useEffect, useReducer } from "react";
import ReactTooltip from "react-tooltip";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import {
  Button,
  ConfirmModal,
  FieldGroup,
  Icon,
  Label,
  MTContainer,
  Spinner,
  Badge,
  ProgressBar,
  Tabs,
  TabPanel,
  Tooltip,
} from "../../common/ui-components";
import FormContainer from "../../common/ui-components/FormContainer/FormContainer";
import useErrorBanner from "../../common/utilities/useErrorBanner";
import {
  MatchResultInput,
  useDeleteReconciliationSuggestionMutation,
  useInternalToolsVisibilityQuery,
  useReconcileReconciliationSuggestionsMutation,
  useReconciliationSuggestionsViewQuery,
  useStrategiesQuery,
} from "../../generated/dashboard/graphqlSchema";
import EntityTableView, { INITIAL_PAGINATION } from "./EntityTableView";
import { CursorPaginationInput } from "../types/CursorPaginationInput";
import CreateReconciliationSuggestionForm from "./CreateReconciliationSuggestionForm";
import { FormikErrorMessage, FormikInputField } from "../../common/formik";
import DatabaseReconciliationStrategy from "./DatabaseReconciliationStrategy";
import ReconciliationStrategy from "./ReconciliationStrategy";
import colors from "~/common/styles/colors";

// --- New Global Type Definitions for Gemini Components ---
export interface GeminiPredictionDataPoint {
  label: string;
  value: number;
  confidence: number;
  trend: "up" | "down" | "stable";
}

export interface GeminiInsight {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "error" | "critical";
  recommendation?: string;
  timestamp: string;
  relatedTransactionId?: string;
  actionRequired?: boolean;
}

export interface GeminiConfiguration {
  enableFeatureX: boolean;
  predictionThreshold: number;
  analyticsLevel: "basic" | "advanced" | "verbose";
  autoApplySuggestions: boolean;
}

export interface GeminiAuditEntry {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  details: Record<string, any>;
}

export interface GeminiPerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: "ok" | "warning" | "critical";
}

export interface GeminiWorkflowStep {
  id: string;
  name: string;
  isComplete: boolean;
  status: "pending" | "in_progress" | "completed" | "failed";
  description?: string;
}

export interface GeminiDynamicFormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  defaultValue?: any;
  required?: boolean;
  placeholder?: string;
}

export interface GeminiReconciliationState {
  isGeminiActive: boolean;
  currentInsights: GeminiInsight[];
  predictionModelStatus: "idle" | "training" | "ready" | "error";
  geminiConfiguration: GeminiConfiguration;
  geminiAuditLogs: GeminiAuditEntry[];
  geminiMetrics: GeminiPerformanceMetric[];
  activeWorkflowStep: number;
}

const initialGeminiState: GeminiReconciliationState = {
  isGeminiActive: false,
  currentInsights: [],
  predictionModelStatus: "idle",
  geminiConfiguration: {
    enableFeatureX: false,
    predictionThreshold: 0.8,
    analyticsLevel: "basic",
    autoApplySuggestions: false,
  },
  geminiAuditLogs: [],
  geminiMetrics: [],
  activeWorkflowStep: 0,
};

type GeminiAction =
  | { type: "TOGGLE_GEMINI_ACTIVE" }
  | { type: "ADD_INSIGHT"; payload: GeminiInsight }
  | { type: "UPDATE_MODEL_STATUS"; payload: "idle" | "training" | "ready" | "error" }
  | { type: "UPDATE_CONFIG"; payload: Partial<GeminiConfiguration> }
  | { type: "ADD_AUDIT_LOG"; payload: GeminiAuditEntry }
  | { type: "UPDATE_METRIC"; payload: GeminiPerformanceMetric }
  | { type: "SET_WORKFLOW_STEP"; payload: number };

function geminiReducer(state: GeminiReconciliationState, action: GeminiAction): GeminiReconciliationState {
  switch (action.type) {
    case "TOGGLE_GEMINI_ACTIVE":
      return { ...state, isGeminiActive: !state.isGeminiActive };
    case "ADD_INSIGHT":
      return { ...state, currentInsights: [...state.currentInsights, action.payload] };
    case "UPDATE_MODEL_STATUS":
      return { ...state, predictionModelStatus: action.payload };
    case "UPDATE_CONFIG":
      return { ...state, geminiConfiguration: { ...state.geminiConfiguration, ...action.payload } };
    case "ADD_AUDIT_LOG":
      return { ...state, geminiAuditLogs: [...state.geminiAuditLogs, action.payload] };
    case "UPDATE_METRIC":
      return {
        ...state,
        geminiMetrics: state.geminiMetrics.map((metric) =>
          metric.name === action.payload.name ? action.payload : metric
        ),
      };
    case "SET_WORKFLOW_STEP":
      return { ...state, activeWorkflowStep: action.payload };
    default:
      return state;
  }
}

// --- Gemini Context ---
export const GeminiReconciliationContext = createContext<{
  state: GeminiReconciliationState;
  dispatch: React.Dispatch<GeminiAction>;
}>({
  state: initialGeminiState,
  dispatch: () => null,
});

export const GeminiReconciliationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(geminiReducer, initialGeminiState);

  // Example effect for demonstration
  useEffect(() => {
    // Simulate initial insights loading
    const timer = setTimeout(() => {
      dispatch({
        type: "ADD_INSIGHT",
        payload: {
          id: "insight-001",
          title: "Potential Mismatch Detected by Gemini",
          description: "Gemini AI identified a high probability of a related transaction requiring manual review.",
          severity: "warning",
          recommendation: "Review Transaction ID: 12345 and its reconciliation suggestions carefully.",
          timestamp: new Date().toISOString(),
          relatedTransactionId: "12345",
          actionRequired: true,
        },
      });
      dispatch({ type: "UPDATE_MODEL_STATUS", payload: "ready" });
      dispatch({ type: "ADD_AUDIT_LOG", payload: { id: `log-${Date.now()}`, action: "Gemini Model Loaded", timestamp: new Date().toISOString(), actor: "System", details: { model: "ReconPredictor-v2.1" } } });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GeminiReconciliationContext.Provider value={{ state, dispatch }}>
      {children}
    </GeminiReconciliationContext.Provider>
  );
};


// --- New Custom Hooks for Gemini Functionality ---

/**
 * @typedef {object} GeminiAnalyticsHookResult
 * @property {GeminiPredictionDataPoint[]} predictionData - Simulated prediction data from Gemini.
 * @property {boolean} isLoadingAnalytics - Indicates if analytics data is currently loading.
 * @property {string | null} analyticsError - Any error message encountered during data fetch.
 * @property {() => void} refetchAnalytics - Function to manually refetch analytics data.
 */
export const useGeminiAnalytics = (transactionId: string) => {
  const [predictionData, setPredictionData] = useState<GeminiPredictionDataPoint[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(() => {
    setIsLoadingAnalytics(true);
    setAnalyticsError(null);
    // Simulate API call to Gemini Analytics service
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        setPredictionData([
          { label: "Jan", value: 0.75, confidence: 0.85, trend: "up" },
          { label: "Feb", value: 0.82, confidence: 0.88, trend: "up" },
          { label: "Mar", value: 0.79, confidence: 0.80, trend: "down" },
          { label: "Apr", value: 0.85, confidence: 0.92, trend: "up" },
          { label: "May", value: 0.90, confidence: 0.95, trend: "up" },
          { label: "Jun", value: 0.88, confidence: 0.90, trend: "stable" },
          { label: "Jul", value: 0.91, confidence: 0.96, trend: "up" },
          { label: "Aug", value: 0.93, confidence: 0.97, trend: "up" },
          { label: "Sep", value: 0.89, confidence: 0.91, trend: "down" },
          { label: "Oct", value: 0.92, confidence: 0.94, trend: "up" },
          { label: "Nov", value: 0.95, confidence: 0.98, trend: "up" },
          { label: "Dec", value: 0.96, confidence: 0.99, trend: "up" },
        ]);
      } else {
        setAnalyticsError("Failed to load Gemini prediction data. Please try again.");
      }
      setIsLoadingAnalytics(false);
    }, 1500);
  }, []);

  useEffect(() => {
    if (transactionId) {
      fetchAnalytics();
    }
  }, [transactionId, fetchAnalytics]);

  return { predictionData, isLoadingAnalytics, analyticsError, refetchAnalytics: fetchAnalytics };
};

/**
 * @typedef {object} GeminiFeatureToggleHookResult
 * @property {boolean} isFeatureEnabled - Current status of the Gemini feature toggle.
 * @property {boolean} isLoadingToggle - Indicates if the toggle status is being loaded.
 * @property {() => void} toggleFeature - Function to switch the feature's enabled status.
 */
export const useGeminiFeatureToggle = (featureName: string) => {
  const { state, dispatch } = useContext(GeminiReconciliationContext);
  const [isLoadingToggle, setIsLoadingToggle] = useState(false);

  const isFeatureEnabled = useMemo(() => {
    // This is a placeholder; real implementation would check a specific featureName
    return state.geminiConfiguration.enableFeatureX;
  }, [state.geminiConfiguration.enableFeatureX]);

  const toggleFeature = useCallback(() => {
    setIsLoadingToggle(true);
    setTimeout(() => {
      dispatch({ type: "UPDATE_CONFIG", payload: { enableFeatureX: !isFeatureEnabled } });
      dispatch({ type: "ADD_AUDIT_LOG", payload: { id: `log-${Date.now()}`, action: `Toggle ${featureName}`, timestamp: new Date().toISOString(), actor: "User", details: { newStatus: !isFeatureEnabled } } });
      setIsLoadingToggle(false);
    }, 500);
  }, [isFeatureEnabled, featureName, dispatch]);

  return { isFeatureEnabled, isLoadingToggle, toggleFeature };
};

/**
 * @typedef {object} GeminiRecommendationHookResult
 * @property {GeminiInsight[]} recommendations - List of active Gemini recommendations.
 * @property {boolean} isLoadingRecommendations - Indicates if recommendations are loading.
 * @property {string | null} recommendationError - Error message.
 * @property {(insightId: string) => void} dismissRecommendation - Function to dismiss a specific recommendation.
 * @property {(insight: GeminiInsight) => void} addRecommendation - Function to add a new recommendation (for internal use/testing).
 */
export const useGeminiRecommendations = (transactionId: string) => {
  const { state, dispatch } = useContext(GeminiReconciliationContext);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    return state.currentInsights.filter(insight => !insight.relatedTransactionId || insight.relatedTransactionId === transactionId);
  }, [state.currentInsights, transactionId]);

  const dismissRecommendation = useCallback((insightId: string) => {
    setIsLoadingRecommendations(true);
    // Simulate API call to dismiss
    setTimeout(() => {
      // In a real app, this would be a server-side delete or status update
      dispatch({ type: "ADD_AUDIT_LOG", payload: { id: `log-${Date.now()}`, action: `Dismiss Recommendation`, timestamp: new Date().toISOString(), actor: "User", details: { insightId } } });
      dispatch({ type: "UPDATE_CONFIG", payload: {} }); // Dummy dispatch to trigger state update, real would filter insights
      setIsLoadingRecommendations(false);
    }, 700);
  }, [dispatch]);

  const addRecommendation = useCallback((insight: GeminiInsight) => {
    dispatch({ type: "ADD_INSIGHT", payload: insight });
    dispatch({ type: "ADD_AUDIT_LOG", payload: { id: `log-${Date.now()}`, action: `Add Recommendation`, timestamp: new Date().toISOString(), actor: "System", details: { insightId: insight.id } } });
  }, [dispatch]);

  // Simulate periodic fetching of new recommendations
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance of new insight
        addRecommendation({
          id: `insight-${Date.now()}`,
          title: `New Anomaly Detected by Gemini for ${transactionId}`,
          description: `Gemini has identified an unusual pattern associated with transaction ${transactionId}.`,
          severity: Math.random() > 0.7 ? "critical" : (Math.random() > 0.4 ? "error" : "warning"),
          recommendation: "Investigate related entities for potential fraud or misposting.",
          timestamp: new Date().toISOString(),
          relatedTransactionId: transactionId,
          actionRequired: true,
        });
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [transactionId, addRecommendation]);

  return { recommendations, isLoadingRecommendations, recommendationError, dismissRecommendation, addRecommendation };
};


// --- New Gemini Components ---

interface GeminiSpinnerProps {
  message?: string;
}

/**
 * @component GeminiSpinner
 * @description A custom spinner component with an optional message, leveraging existing UI.
 * @param {GeminiSpinnerProps} props - The props for the component.
 * @param {string} [props.message] - Optional message to display below the spinner.
 */
export const GeminiSpinner: React.FC<GeminiSpinnerProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-4">
    <Spinner className="text-blue-500" size="lg" />
    {message && <p className="mt-2 text-gray-600">{message}</p>}
  </div>
);

interface GeminiHeaderProps {
  title: string;
  subtitle?: string;
  iconName?: string;
}

/**
 * @component GeminiHeader
 * @description A reusable header component for Gemini-related sections.
 * @param {GeminiHeaderProps} props - The props for the component.
 * @param {string} props.title - The main title text.
 * @param {string} [props.subtitle] - Optional subtitle text.
 * @param {string} [props.iconName] - Optional icon name to display next to the title.
 */
export const GeminiHeader: React.FC<GeminiHeaderProps> = ({ title, subtitle, iconName }) => (
  <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 mb-4">
    {iconName && <Icon iconName={iconName} color={colors.blue["500"]} size="md" />}
    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    {subtitle && <span className="text-sm text-gray-500">- {subtitle}</span>}
  </div>
);


interface GeminiPredictionChartProps {
  data: GeminiPredictionDataPoint[];
  isLoading: boolean;
  error: string | null;
  chartTitle?: string;
  height?: string;
}

/**
 * @component GeminiPredictionChart
 * @description A placeholder component to visualize Gemini prediction data.
 * Does not implement actual chart rendering, but displays data in a simple text format
 * and handles loading/error states.
 * @param {GeminiPredictionChartProps} props - The props for the component.
 * @param {GeminiPredictionDataPoint[]} props.data - The prediction data points.
 * @param {boolean} props.isLoading - Loading state.
 * @param {string | null} props.error - Error message.
 * @param {string} [props.chartTitle] - Optional title for the chart.
 * @param {string} [props.height] - Optional height for the chart container.
 */
export const GeminiPredictionChart: React.FC<GeminiPredictionChartProps> = ({
  data,
  isLoading,
  error,
  chartTitle = "Gemini Prediction Trend",
  height = "200px",
}) => {
  if (isLoading) {
    return <GeminiSpinner message="Loading Gemini predictions..." />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 border border-red-300 rounded-md bg-red-50">
        <Icon iconName="error" color={colors.red["500"]} className="mr-2" />
        Prediction Error: {error}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-gray-500 italic">
        No Gemini prediction data available for this period.
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow" style={{ height }}>
      <GeminiHeader title={chartTitle} iconName="chart_line_up" />
      <div className="grid grid-cols-3 gap-2 text-sm">
        {data.slice(0, 6).map((point, index) => (
          <div key={index} className="flex flex-col items-center py-2 border rounded-md">
            <span className="font-medium text-gray-700">{point.label}</span>
            <span className={`font-bold ${point.trend === "up" ? "text-green-600" : point.trend === "down" ? "text-red-600" : "text-blue-600"}`}>
              {(point.value * 100).toFixed(1)}%
              <Icon iconName={point.trend === "up" ? "arrow_up" : point.trend === "down" ? "arrow_down" : "circle"} size="xs" className="ml-1" />
            </span>
            <span className="text-xs text-gray-500">Conf: {(point.confidence * 100).toFixed(0)}%</span>
          </div>
        ))}
        {data.length > 6 && <div className="col-span-3 text-center text-sm text-gray-500 mt-2">...and {data.length - 6} more data points</div>}
      </div>
      <p className="mt-4 text-xs text-gray-500 italic">
        Data represents Gemini's predicted reconciliation likelihood.
      </p>
    </div>
  );
};


interface GeminiInsightCardProps {
  insight: GeminiInsight;
  onDismiss?: (id: string) => void;
  isLoadingDismiss?: boolean;
}

/**
 * @component GeminiInsightCard
 * @description Displays a single Gemini-generated insight or recommendation.
 * @param {GeminiInsightCardProps} props - The props for the component.
 * @param {GeminiInsight} props.insight - The insight object to display.
 * @param {(id: string) => void} [props.onDismiss] - Callback function when the insight is dismissed.
 * @param {boolean} [props.isLoadingDismiss] - Loading state for dismissal action.
 */
export const GeminiInsightCard: React.FC<GeminiInsightCardProps> = ({
  insight,
  onDismiss,
  isLoadingDismiss,
}) => {
  const getSeverityClasses = (severity: GeminiInsight["severity"]) => {
    switch (severity) {
      case "critical": return "border-red-500 bg-red-50 text-red-800";
      case "error": return "border-red-400 bg-red-50 text-red-700";
      case "warning": return "border-orange-400 bg-orange-50 text-orange-700";
      case "info": return "border-blue-400 bg-blue-50 text-blue-700";
      default: return "border-gray-300 bg-gray-50 text-gray-800";
    }
  };

  const getIconName = (severity: GeminiInsight["severity"]) => {
    switch (severity) {
      case "critical": return "error_outline";
      case "error": return "warning";
      case "warning": return "info";
      case "info": return "lightbulb";
      default: return "info";
    }
  };

  return (
    <div className={`p-4 border-l-4 rounded-lg shadow-sm ${getSeverityClasses(insight.severity)} flex flex-col space-y-2`}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center text-lg font-semibold">
          <Icon iconName={getIconName(insight.severity)} className="mr-2" />
          {insight.title}
        </h3>
        <Badge
          type={insight.actionRequired ? "danger" : "info"}
          text={insight.actionRequired ? "Action Required" : "Info"}
        />
      </div>
      <p className="text-sm">{insight.description}</p>
      {insight.recommendation && (
        <p className="text-sm font-medium">
          Recommendation: <span className="italic">{insight.recommendation}</span>
        </p>
      )}
      <div className="flex justify-between items-center text-xs text-gray-600 pt-2 border-t border-gray-200">
        <span>{new Date(insight.timestamp).toLocaleString()}</span>
        {onDismiss && (
          <Button
            buttonType="secondary"
            size="sm"
            onClick={() => onDismiss(insight.id)}
            disabled={isLoadingDismiss}
          >
            {isLoadingDismiss ? <Spinner size="sm" /> : "Dismiss"}
          </Button>
        )}
      </div>
    </div>
  );
};


interface GeminiInsightsPanelProps {
  transactionId: string;
}

/**
 * @component GeminiInsightsPanel
 * @description A panel displaying all Gemini insights and recommendations for a transaction.
 * Integrates `useGeminiRecommendations` and `GeminiInsightCard`.
 * @param {GeminiInsightsPanelProps} props - The props for the component.
 * @param {string} props.transactionId - The ID of the current transaction.
 */
export const GeminiInsightsPanel: React.FC<GeminiInsightsPanelProps> = ({ transactionId }) => {
  const { recommendations, isLoadingRecommendations, recommendationError, dismissRecommendation } = useGeminiRecommendations(transactionId);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-inner">
      <GeminiHeader title="Gemini Insights & Recommendations" iconName="lightbulb_fill" />
      {isLoadingRecommendations && <GeminiSpinner message="Fetching Gemini insights..." />}
      {recommendationError && (
        <div className="p-4 text-red-600 border border-red-300 rounded-md bg-red-50 mb-4">
          <Icon iconName="error" color={colors.red["500"]} className="mr-2" />
          Error loading insights: {recommendationError}
        </div>
      )}
      <div className="space-y-4">
        {recommendations.length === 0 && !isLoadingRecommendations && !recommendationError ? (
          <p className="italic text-gray-500">No active Gemini insights for this transaction.</p>
        ) : (
          recommendations.map((insight) => (
            <GeminiInsightCard
              key={insight.id}
              insight={insight}
              onDismiss={dismissRecommendation}
              isLoadingDismiss={isLoadingRecommendations} // This would ideally be per-insight dismissal state
            />
          ))
        )}
      </div>
    </div>
  );
};

interface GeminiFeatureConfigurationProps {
  // no props needed as it uses useContext
}

/**
 * @component GeminiFeatureConfiguration
 * @description A component to manage Gemini feature configurations.
 * Allows users to toggle features and adjust settings, using `GeminiReconciliationContext`.
 */
export const GeminiFeatureConfiguration: React.FC<GeminiFeatureConfigurationProps> = () => {
  const { state, dispatch } = useContext(GeminiReconciliationContext);
  const { isFeatureEnabled, toggleFeature, isLoadingToggle } = useGeminiFeatureToggle("FeatureX");

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    dispatch({
      type: "UPDATE_CONFIG",
      payload: {
        [name]: type === "checkbox" ? checked : (type === "number" ? parseFloat(value) : value),
      },
    });
    dispatch({ type: "ADD_AUDIT_LOG", payload: { id: `log-${Date.now()}`, action: `Update Gemini Config: ${name}`, timestamp: new Date().toISOString(), actor: "User", details: { newValue: type === "checkbox" ? checked : value } } });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <GeminiHeader title="Gemini Feature Configuration" iconName="settings" />
      <FormContainer>
        <FieldGroup>
          <Label htmlFor="enableFeatureX">
            <input
              type="checkbox"
              id="enableFeatureX"
              name="enableFeatureX"
              checked={isFeatureEnabled}
              onChange={() => toggleFeature()}
              disabled={isLoadingToggle}
              className="mr-2"
            />
            Enable Gemini AI Recommendations (Feature X)
          </Label>
          {isLoadingToggle && <Spinner size="sm" />}
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="predictionThreshold">Prediction Confidence Threshold</Label>
          <input
            type="range"
            id="predictionThreshold"
            name="predictionThreshold"
            min="0"
            max="1"
            step="0.05"
            value={state.geminiConfiguration.predictionThreshold}
            onChange={handleConfigChange}
            className="w-full"
          />
          <span className="text-sm text-gray-600">
            Current: {(state.geminiConfiguration.predictionThreshold * 100).toFixed(0)}%
          </span>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="analyticsLevel">Analytics Detail Level</Label>
          <select
            id="analyticsLevel"
            name="analyticsLevel"
            value={state.geminiConfiguration.analyticsLevel}
            onChange={handleConfigChange}
            className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          >
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="verbose">Verbose</option>
          </select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="autoApplySuggestions">
            <input
              type="checkbox"
              id="autoApplySuggestions"
              name="autoApplySuggestions"
              checked={state.geminiConfiguration.autoApplySuggestions}
              onChange={handleConfigChange}
              className="mr-2"
            />
            Auto-apply Gemini Suggestions (Requires high confidence)
          </Label>
          <span className="text-xs text-gray-500 italic">
            Exercise caution: This feature automatically reconciles transactions based on Gemini's assessment.
          </span>
        </FieldGroup>
      </FormContainer>
    </div>
  );
};


interface GeminiAuditLogViewerProps {
  // No direct props, uses context
}

/**
 * @component GeminiAuditLogViewer
 * @description Displays a scrollable list of recent Gemini system and user audit logs.
 * @param {GeminiAuditLogViewerProps} props - The props for the component.
 */
export const GeminiAuditLogViewer: React.FC<GeminiAuditLogViewerProps> = () => {
  const { state } = useContext(GeminiReconciliationContext);
  const { geminiAuditLogs } = state;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <GeminiHeader title="Gemini Audit Log" iconName="history" />
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md bg-gray-50 p-2 text-sm font-mono">
        {geminiAuditLogs.length === 0 ? (
          <p className="text-gray-500 italic">No audit entries yet.</p>
        ) : (
          [...geminiAuditLogs].reverse().map((entry) => ( // Show latest first
            <div key={entry.id} className="border-b border-gray-100 py-1 last:border-b-0">
              <span className="text-gray-700">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>{" "}
              <span className="font-semibold text-blue-700">{entry.actor}</span>:{" "}
              <span className="text-gray-800">{entry.action}</span>{" "}
              {entry.details && Object.keys(entry.details).length > 0 && (
                <Tooltip content={JSON.stringify(entry.details, null, 2)}>
                  <Icon iconName="info" size="sm" className="ml-1 text-gray-400 cursor-pointer" />
                </Tooltip>
              )}
            </div>
          ))
        )}
      </div>
      <p className="mt-2 text-xs text-gray-500 italic">
        Hover over <Icon iconName="info" size="xs" className="inline-block" /> for detailed log entry information.
      </p>
    </div>
  );
};


interface GeminiPerformanceMonitorProps {
  // No direct props, uses context
}

/**
 * @component GeminiPerformanceMonitor
 * @description Displays key performance indicators for Gemini services.
 * @param {GeminiPerformanceMonitorProps} props - The props for the component.
 */
export const GeminiPerformanceMonitor: React.FC<GeminiPerformanceMonitorProps> = () => {
  const { state, dispatch } = useContext(GeminiReconciliationContext);
  const { geminiMetrics, predictionModelStatus } = state;

  // Simulate metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLatency = parseFloat((Math.random() * (0.2 - 0.05) + 0.05).toFixed(2));
      const newThroughput = Math.floor(Math.random() * (150 - 80) + 80);
      const newAccuracy = parseFloat((Math.random() * (0.99 - 0.90) + 0.90).toFixed(3));

      dispatch({ type: "UPDATE_METRIC", payload: { name: "Prediction Latency", value: newLatency, unit: "s", threshold: 0.15, status: newLatency > 0.15 ? "warning" : "ok" } });
      dispatch({ type: "UPDATE_METRIC", payload: { name: "API Throughput", value: newThroughput, unit: "req/s", threshold: 100, status: newThroughput < 80 ? "warning" : "ok" } });
      dispatch({ type: "UPDATE_METRIC", payload: { name: "Model Accuracy", value: newAccuracy, unit: "%", threshold: 0.95, status: newAccuracy < 0.90 ? "critical" : (newAccuracy < 0.95 ? "warning" : "ok") } });
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  const getStatusColor = (status: GeminiPerformanceMetric['status']) => {
    switch (status) {
      case "ok": return "text-green-600";
      case "warning": return "text-orange-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getModelStatusBadgeType = (status: typeof predictionModelStatus) => {
    switch (status) {
      case "ready": return "success";
      case "training": return "primary";
      case "error": return "danger";
      default: return "info";
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <GeminiHeader title="Gemini System Performance" iconName="dashboard" />
      <div className="mb-4">
        <Label>Prediction Model Status:</Label>
        <Badge text={predictionModelStatus.toUpperCase()} type={getModelStatusBadgeType(predictionModelStatus)} className="ml-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {geminiMetrics.map((metric) => (
          <div key={metric.name} className="flex flex-col items-start border rounded-md p-3 bg-gray-50">
            <Label className="text-sm font-medium text-gray-700">{metric.name}</Label>
            <div className="flex items-center mt-1">
              <span className={`text-xl font-bold ${getStatusColor(metric.status)}`}>
                {metric.unit === "%" ? (metric.value * 100).toFixed(1) : metric.value.toFixed(2)} {metric.unit}
              </span>
              {metric.threshold && (
                <span className="ml-2 text-xs text-gray-500">
                  (Threshold: {metric.unit === "%" ? (metric.threshold * 100).toFixed(1) : metric.threshold.toFixed(2)} {metric.unit})
                </span>
              )}
            </div>
            <ProgressBar
              value={metric.value}
              max={metric.unit === "%" ? 1 : (metric.threshold ? metric.threshold * 1.5 : 200)} // Max for percentage, or threshold + 50%
              label={`${metric.name} progress`}
              color={metric.status === "critical" ? "red" : (metric.status === "warning" ? "orange" : "green")}
              className="w-full mt-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};


interface GeminiWorkflowStepperProps {
  steps: GeminiWorkflowStep[];
  currentStepIndex: number;
  onStepChange?: (index: number) => void;
  title?: string;
}

/**
 * @component GeminiWorkflowStepper
 * @description A visual component to guide users through a multi-step Gemini workflow.
 * @param {GeminiWorkflowStepperProps} props - The props for the component.
 * @param {GeminiWorkflowStep[]} props.steps - Array of workflow steps.
 * @param {number} props.currentStepIndex - The index of the currently active step.
 * @param {(index: number) => void} [props.onStepChange] - Callback when a step is clicked (if interactive).
 * @param {string} [props.title] - Optional title for the stepper.
 */
export const GeminiWorkflowStepper: React.FC<GeminiWorkflowStepperProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  title = "Gemini Reconciliation Workflow",
}) => {
  const { dispatch } = useContext(GeminiReconciliationContext);

  const handleStepClick = useCallback((index: number) => {
    if (onStepChange) {
      onStepChange(index);
      dispatch({ type: "ADD_AUDIT_LOG", payload: { id: `log-${Date.now()}`, action: `Workflow Step Change`, timestamp: new Date().toISOString(), actor: "User", details: { newStepIndex: index, newStepName: steps[index].name } } });
    }
  }, [onStepChange, dispatch, steps]);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <GeminiHeader title={title} iconName="list_check" />
      <div className="flex items-center justify-between mt-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                ${index === currentStepIndex
                  ? "bg-blue-600 ring-2 ring-blue-300"
                  : step.isComplete
                    ? "bg-green-600"
                    : "bg-gray-400"}
                ${onStepChange ? "cursor-pointer hover:bg-blue-700" : ""}`}
              onClick={() => handleStepClick(index)}
            >
              {step.isComplete && index < currentStepIndex ? <Icon iconName="check" size="sm" color={colors.white} /> : index + 1}
            </div>
            <p className={`mt-2 text-xs text-center ${index === currentStepIndex ? "font-semibold text-blue-700" : "text-gray-600"}`}>
              {step.name}
            </p>
          </div>
        ))}
      </div>
      {steps[currentStepIndex] && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md text-sm text-blue-800 italic">
          <strong>Current Step: {steps[currentStepIndex].name}</strong> - {steps[currentStepIndex].description || "No description provided."}
        </div>
      )}
    </div>
  );
};


interface GeminiTabsPanelProps {
  transactionId: string;
}

/**
 * @component GeminiTabsPanel
 * @description A composite component that organizes various Gemini features into tabs.
 * This component acts as a central hub for multiple Gemini-related views.
 * @param {GeminiTabsPanelProps} props - The props for the component.
 * @param {string} props.transactionId - The ID of the transaction to display context for.
 */
export const GeminiTabsPanel: React.FC<GeminiTabsPanelProps> = ({ transactionId }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const { state, dispatch } = useContext(GeminiReconciliationContext);

  const workflowSteps: GeminiWorkflowStep[] = useMemo(() => [
    { id: "wf-1", name: "Data Ingestion", isComplete: state.activeWorkflowStep >= 0, status: "completed", description: "Raw transaction data has been ingested." },
    { id: "wf-2", name: "Feature Engineering", isComplete: state.activeWorkflowStep >= 1, status: state.activeWorkflowStep >= 1 ? "completed" : "pending", description: "Relevant features extracted for Gemini analysis." },
    { id: "wf-3", name: "Prediction & Scoring", isComplete: state.activeWorkflowStep >= 2, status: state.activeWorkflowStep >= 2 ? "completed" : "pending", description: "Gemini AI has generated reconciliation predictions." },
    { id: "wf-4", name: "Insight Generation", isComplete: state.activeWorkflowStep >= 3, status: state.activeWorkflowStep >= 3 ? "completed" : "pending", description: "Key insights and recommendations have been identified." },
    { id: "wf-5", name: "User Review", isComplete: state.activeWorkflowStep >= 4, status: state.activeWorkflowStep >= 4 ? "completed" : "pending", description: "Suggestions are ready for human review and action." },
  ], [state.activeWorkflowStep]);

  const handleWorkflowStepChange = useCallback((index: number) => {
    dispatch({ type: "SET_WORKFLOW_STEP", payload: index });
  }, [dispatch]);

  const { predictionData, isLoadingAnalytics, analyticsError } = useGeminiAnalytics(transactionId);

  return (
    <div className="mt-8">
      <Tabs
        activeTab={activeTabIndex}
        onTabClick={setActiveTabIndex}
        tabs={[
          { label: "Gemini Overview", id: "overview" },
          { label: "AI Predictions", id: "predictions" },
          { label: "Insights", id: "insights" },
          { label: "Configuration", id: "config" },
          { label: "Monitoring & Logs", id: "monitoring" },
        ]}
      >
        <TabPanel index={0}>
          <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <GeminiHeader title="Gemini Reconciliation Assistant" subtitle="Overview" iconName="sparkle" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GeminiPredictionChart data={predictionData} isLoading={isLoadingAnalytics} error={analyticsError} chartTitle="Reconciliation Likelihood Over Time" height="250px" />
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-center">
                <p className="text-lg font-medium text-gray-800 mb-2">Gemini AI Status: {state.predictionModelStatus.toUpperCase()}</p>
                <ProgressBar
                  value={state.activeWorkflowStep}
                  max={workflowSteps.length -1}
                  label="Reconciliation Workflow Progress"
                  color="blue"
                  className="mb-4"
                />
                <p className="text-sm text-gray-600">
                  Current Workflow Step: <strong>{workflowSteps[state.activeWorkflowStep]?.name || "N/A"}</strong>
                  <br/>
                  <span className="italic">{workflowSteps[state.activeWorkflowStep]?.description || "No description."}</span>
                </p>
                <div className="flex justify-end mt-4">
                  <Button
                    buttonType="primary"
                    size="sm"
                    onClick={() => dispatch({ type: "SET_WORKFLOW_STEP", payload: (state.activeWorkflowStep + 1) % workflowSteps.length })}
                    disabled={state.activeWorkflowStep >= workflowSteps.length -1 && workflowSteps[workflowSteps.length -1]?.isComplete}
                  >
                    Simulate Next Workflow Step
                  </Button>
                </div>
              </div>
            </div>
            <GeminiInsightsPanel transactionId={transactionId} />
            <GeminiWorkflowStepper steps={workflowSteps} currentStepIndex={state.activeWorkflowStep} onStepChange={handleWorkflowStepChange} />
          </div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <GeminiHeader title="AI Prediction Details" iconName="chart_histogram" />
            <GeminiPredictionChart data={predictionData} isLoading={isLoadingAnalytics} error={analyticsError} chartTitle="Detailed Reconciliation Likelihood" height="300px" />
            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-md">
              <h4 className="font-semibold">Understanding Gemini Predictions:</h4>
              <p className="text-sm mt-1">
                Gemini's prediction model analyzes historical reconciliation patterns, transaction attributes, and
                contextual data to provide a likelihood score. Higher scores indicate a stronger recommendation
                for reconciliation. Confidence scores reflect the model's certainty in its prediction.
              </p>
            </div>
          </div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <GeminiInsightsPanel transactionId={transactionId} />
          </div>
        </TabPanel>
        <TabPanel index={3}>
          <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <GeminiFeatureConfiguration />
          </div>
        </TabPanel>
        <TabPanel index={4}>
          <div className="p-6 bg-white rounded-lg shadow space-y-6">
            <GeminiPerformanceMonitor />
            <GeminiAuditLogViewer />
          </div>
        </TabPanel>
      </Tabs>
      <p className="mt-4 text-xs text-gray-500 italic text-center">
        Powered by Gemini AI - Advanced Reconciliation Intelligence. Version 1.0. Beta Release.
      </p>
    </div>
  );
};


// --- Original Component Starts Here ---
const cannotManuallyReconcileMessage =
  "The above reconciliation suggestion amounts do not match the transaction amount.";

const validateManualReason = Yup.object({
  manualReason: Yup.string().required("Manual Reason is required"),
});
interface ReconciliationSuggestionsViewProps {
  transactionId: string;
  transactionReconciled: boolean;
}

const RECON_SUGGESTION_DATA_MAPPING = {
  transactableId: "Transactable ID",
  transactablePath: "Link",
  transactableAmount: "Amount",
  transactableTypePretty: "Type",
  transactionLineItemType: "Line Item Type",
  actorName: "Created By",
  actions: "Actions",
};

function ReconciliationSuggestionsView({
  transactionId,
  transactionReconciled,
}: ReconciliationSuggestionsViewProps) {
  const { loading, data, error, refetch } =
    useReconciliationSuggestionsViewQuery({
      notifyOnNetworkStatusChange: true,
      variables: {
        first: INITIAL_PAGINATION.perPage,
        transactionId,
      },
    });

  const flashError = useErrorBanner();

  const [deleteReconciliationSuggestion, { loading: deleting }] =
    useDeleteReconciliationSuggestionMutation({
      refetchQueries: ["ReconciliationSuggestionsView"],
    });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reconcileTransaction, { loading: reconciling }] =
    useReconcileReconciliationSuggestionsMutation();

  const [manualReconciliationReason, setManualReconciliationReason] =
    useState("");

  const handleDeleteReconciliationSuggestion = (
    e: SyntheticEvent,
    id: string,
  ) => {
    e.stopPropagation();
    deleteReconciliationSuggestion({
      variables: { input: { id } },
    })
      .then((response) => {
        const { errors = [] } =
          response.data?.deleteReconciliationSuggestion || {};
        if (errors.length) {
          flashError(errors[0]);
        }
      })
      .catch((err: Error) => {
        flashError(err.message);
      });
  };

  const handleReconcileTransaction = () => {
    reconcileTransaction({
      variables: { input: { transactionId, manualReconciliationReason } },
    })
      .then((response) => {
        const { errors = [] } =
          response.data?.reconcileReconciliationSuggestions || {};
        if (errors.length) {
          flashError(errors[0]);
        } else {
          window.location.href = `/transactions/${transactionId}`;
        }
      })
      .catch((err: Error) => {
        flashError(err.message);
      })
      .finally(() => {
        setIsModalOpen(false);
      });
  };

  const reconSuggestions =
    loading || !data || error
      ? []
      : data.reconciliationSuggestions.edges.map(({ node }) => ({
          ...node,
          path: node?.transactablePath,
          actions: (
            <div className="flex">
              <Button
                buttonType="destructive"
                disabled={loading || reconciling || deleting}
                onClick={(e: SyntheticEvent) =>
                  handleDeleteReconciliationSuggestion(e, node.id)
                }
              >
                Delete
              </Button>
            </div>
          ),
        }));

  const handleRefetch = async (options: {
    cursorPaginationParams: CursorPaginationInput;
  }) => {
    const { cursorPaginationParams } = options;
    await refetch({
      ...cursorPaginationParams,
    });
  };

  const [overrideMatchers, setOverrideMatchers] = useState<MatchResultInput[]>(
    [],
  );
  const [newStrategyToggle, setNewStrategyToggle] = useState<boolean>(false);

  const { data: strategyData, refetch: strategyRefetch } = useStrategiesQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      transactionId,
      matcherOverrides: overrideMatchers,
      defaultStrategy: newStrategyToggle,
    },
  });

  const updateMatcherState = useCallback((state: MatchResultInput[]) => {
    setOverrideMatchers(state);
  }, []);

  const showInternalTools =
    useInternalToolsVisibilityQuery().data?.internalToolsVisibility;

  if (!showInternalTools) {
    return null;
  }

  // Wrap the entire return with GeminiReconciliationProvider
  return (
    <GeminiReconciliationProvider>
      <MTContainer>
        <ConfirmModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          title="Are you sure you want to reconcile this transaction?"
          confirmText="Reconcile"
          cancelText="Cancel"
          onConfirm={handleReconcileTransaction}
          confirmDisabled={loading || reconciling || deleting}
          cancelDisabled={loading || reconciling || deleting}
        />
        <div className="mb-8">
          <FormContainer>
            <CreateReconciliationSuggestionForm
              transactionId={transactionId}
              refetchStrategies={strategyRefetch}
            />
          </FormContainer>
        </div>
        <EntityTableView
          data={reconSuggestions}
          dataMapping={RECON_SUGGESTION_DATA_MAPPING}
          loading={loading}
          onQueryArgChange={handleRefetch}
          cursorPagination={data?.reconciliationSuggestions?.pageInfo}
          disableQueryURLParams
        />
        {data?.canManuallyReconcileTransaction ? (
          <Formik
            initialValues={{ manualReason: "" }}
            onSubmit={({ manualReason }, actions) => {
              setManualReconciliationReason(manualReason);
              setIsModalOpen(true);
              actions.resetForm();
              actions.setSubmitting(false);
            }}
            validationSchema={validateManualReason}
          >
            {({ isSubmitting }) => (
              <Form>
                <FieldGroup>
                  <Label id="manualReason">Manual Reconciliation Reason</Label>
                  <Field
                    id="manualReason"
                    name="manualReason"
                    component={FormikInputField}
                  />
                  <FormikErrorMessage name="manualReason" />
                </FieldGroup>
                <Button
                  buttonType="primary"
                  isSubmit
                  disabled={isSubmitting || loading || reconciling}
                >
                  Reconcile Transaction
                </Button>
              </Form>
            )}
          </Formik>
        ) : (
          <>
            <span data-tip={cannotManuallyReconcileMessage}>
              <Button buttonType="primary" disabled>
                Reconcile Transaction
              </Button>
            </span>
            <ReactTooltip
              multiline
              data-place="top"
              data-type="dark"
              data-effect="float"
              delayShow={500}
            />
          </>
        )}

        <div className="mt-2 rounded-lg border pb-2">
          <div className="flex w-full justify-center rounded-t-lg bg-mist-600 py-2">
            <Icon
              className="self-center text-gray-25"
              iconName="money_vs"
              color="currentColor"
            />
            <Label className="flex w-full justify-center px-2 text-xl text-gray-25">
              Reconciliation Strategies
            </Label>
            <Icon
              className="self-center text-gray-25"
              iconName="money_vs"
              color="currentColor"
            />
          </div>

          <div className="flex justify-center pt-6">
            <Label className="mr-2 self-center text-lg font-light">
              View and edit strategies below, or
            </Label>
            <Button
              className="flex border border-green-600 bg-green-500 font-medium text-white hover:border-green-700 hover:bg-green-600 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-green-900 disabled:text-gray-300 disabled:opacity-50"
              disabled={
                !data?.reconciliationSuggestions?.edges?.length &&
                !transactionReconciled
              }
              onClick={() => setNewStrategyToggle(true)}
              title={
                data?.canManuallyReconcileTransaction
                  ? undefined
                  : "To create a new strategy, specify above which payments this transaction should reconcile to"
              }
            >
              <Icon
                iconName="add"
                color={
                  data?.canManuallyReconcileTransaction
                    ? colors.white
                    : colors.gray["300"]
                }
              />
              Create A New Strategy
            </Button>
          </div>
          <Label className="mr-2 mt-2 flex w-full justify-center self-center text-sm font-light italic">
            No changes will be saved until submitted and reviewed
          </Label>
          {strategyData?.strategies?.strategies?.map((strategy) =>
            strategy.databaseStrategy ? (
              <div>
                <DatabaseReconciliationStrategy
                  key={strategy.name}
                  strategy={strategy}
                  transactionId={transactionId}
                />
                <div>
                  {strategy.suggestedChanges &&
                    strategy.suggestedChanges.map((change, index) => (
                      <DatabaseReconciliationStrategy
                        key={`${change.name}${index}`}
                        strategy={change}
                        transactionId={transactionId}
                      />
                    ))}
                </div>
              </div>
            ) : (
              <ReconciliationStrategy
                key={strategy.name}
                strategy={strategy}
                callback={updateMatcherState}
                overrideMatchers={overrideMatchers}
              />
            ),
          )}
        </div>

        {/* Integration of the new GeminiTabsPanel here */}
        <GeminiTabsPanel transactionId={transactionId} />

      </MTContainer>
    </GeminiReconciliationProvider>
  );
}

export default ReconciliationSuggestionsView;