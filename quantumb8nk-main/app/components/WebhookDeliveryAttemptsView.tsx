import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import reduce from "lodash/reduce";
import ReactJson from "react-json-view";
import {
  TimeFormatEnum,
  TimeUnitEnum,
  useScheduleWebhookEventMutation,
  useWebhookDeliveryAttemptsViewQuery,
  WebhookDeliveryAttemptStatus,
} from "../../generated/dashboard/graphqlSchema";
import { CursorPaginationInput } from "../types/CursorPaginationInput";
import EntityTableView, { INITIAL_PAGINATION } from "./EntityTableView";
import { dateSearchMapper } from "./search/DateSearch";
import { Clickable, DateTime } from "../../common/ui-components";
import { ExportDataParams } from "./ExportDataButton";
import {
  getWebhookDeliveryAttemptSearchComponents,
  WebhookDeliveryAttemptQueryFilter,
} from "../../common/search_components/webhookDeliveryAttemptSearchComponents";
import { WEBHOOK_DELIVERY_ATTEMPT } from "../../generated/dashboard/types/resources";
import { useDispatchContext } from "../MessageProvider";
import ArchivedRecordsBanner from "./exporting/ArchivedRecordsBanner";

// region YoGemini UI Component Definitions

/**
 * @typedef {Object} YoGeminiInsightCardProps
 * @property {string} title - The title of the insight card.
 * @property {string} value - The main value or metric to display.
 * @property {string} [unit] - An optional unit for the value (e.g., "%", "ms").
 * @property {string} [description] - A brief description or context for the insight.
 * @property {string} [trendIndicator] - A string indicating a trend (e.g., "up", "down", "stable").
 * @property {string} [colorClass] - Tailwind CSS class for text color.
 * @property {React.ReactNode} [icon] - An optional icon to display.
 */
interface YoGeminiInsightCardProps {
  title: string;
  value: string;
  unit?: string;
  description?: string;
  trendIndicator?: "up" | "down" | "stable";
  colorClass?: string;
  icon?: React.ReactNode;
}

/**
 * YoGeminiInsightCard is a presentation component for displaying key insights related to webhook delivery.
 * It does not contain any business logic but formats and displays data provided to it.
 *
 * @param {YoGeminiInsightCardProps} props - The properties for the insight card.
 * @returns {JSX.Element} The rendered insight card.
 */
export const YoGeminiInsightCard: React.FC<YoGeminiInsightCardProps> = ({
  title,
  value,
  unit,
  description,
  trendIndicator,
  colorClass = "text-gray-800",
  icon,
}) => {
  const trendIcon = useMemo(() => {
    switch (trendIndicator) {
      case "up":
        return <span className="ml-1 text-green-500">▲</span>;
      case "down":
        return <span className="ml-1 text-red-500">▼</span>;
      case "stable":
        return <span className="ml-1 text-blue-500">◼</span>;
      default:
        return null;
    }
  }, [trendIndicator]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-w-[200px] flex-grow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        {icon && <div className="text-lg text-gray-400">{icon}</div>}
      </div>
      <div className="flex items-baseline mb-1">
        <span className={`text-3xl font-bold ${colorClass}`}>
          {value}
          {unit && <span className="ml-1 text-xl font-normal">{unit}</span>}
        </span>
        {trendIcon}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};

/**
 * @typedef {Object} YoGeminiPredictiveMetricsProps
 * @property {number} successRate - Hypothetical success rate percentage.
 * @property {number} anomalyScore - Hypothetical anomaly score.
 * @property {number} expectedLatencyMs - Hypothetical expected latency in milliseconds.
 * @property {number} trendDelta - Hypothetical trend delta for success rate.
 */
interface YoGeminiPredictiveMetricsProps {
  successRate: number;
  anomalyScore: number;
  expectedLatencyMs: number;
  trendDelta: number;
}

/**
 * YoGeminiPredictiveMetrics displays simulated AI-driven predictive metrics.
 * It's purely presentational and uses hardcoded or passed-in dummy data.
 *
 * @param {YoGeminiPredictiveMetricsProps} props - The properties for the predictive metrics.
 * @returns {JSX.Element} The rendered predictive metrics dashboard.
 */
export const YoGeminiPredictiveMetrics: React.FC<YoGeminiPredictiveMetricsProps> = ({
  successRate,
  anomalyScore,
  expectedLatencyMs,
  trendDelta,
}) => {
  const successColor = useMemo(() => {
    if (successRate > 95) return "text-green-600";
    if (successRate > 80) return "text-yellow-600";
    return "text-red-600";
  }, [successRate]);

  const anomalyColor = useMemo(() => {
    if (anomalyScore < 0.1) return "text-green-600";
    if (anomalyScore < 0.5) return "text-yellow-600";
    return "text-red-600";
  }, [anomalyScore]);

  const latencyColor = useMemo(() => {
    if (expectedLatencyMs < 100) return "text-green-600";
    if (expectedLatencyMs < 500) return "text-yellow-600";
    return "text-red-600";
  }, [expectedLatencyMs]);

  const trendIndicator = useMemo(() => {
    if (trendDelta > 0.5) return "up";
    if (trendDelta < -0.5) return "down";
    return "stable";
  }, [trendDelta]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg shadow-inner mt-4">
      <YoGeminiInsightCard
        title="Predictive Success Rate"
        value={successRate.toFixed(2)}
        unit="%"
        description="AI-driven estimated success likelihood for future deliveries."
        colorClass={successColor}
        trendIndicator={trendIndicator}
        icon={<span>&#x1F4AF;</span>} // 💯
      />
      <YoGeminiInsightCard
        title="Anomaly Detection Score"
        value={anomalyScore.toFixed(2)}
        unit=""
        description="Higher score indicates potential issues or unusual patterns."
        colorClass={anomalyColor}
        icon={<span>&#x26A0;&#xFE0F;</span>} // ⚠️
      />
      <YoGeminiInsightCard
        title="Avg. Expected Latency"
        value={expectedLatencyMs.toFixed(0)}
        unit="ms"
        description="Estimated average time for webhook delivery completion."
        colorClass={latencyColor}
        icon={<span>&#x23F1;&#xFE0F;</span>} // ⏱️
      />
      <YoGeminiInsightCard
        title="Recent Success Trend"
        value={trendDelta.toFixed(2)}
        unit="%"
        description="Change in success rate over the last 24 hours."
        colorClass={trendDelta > 0 ? "text-green-600" : "text-red-600"}
        trendIndicator={trendDelta > 0 ? "up" : "down"}
        icon={<span>&#x1F4C8;</span>} // 📈
      />
    </div>
  );
};

/**
 * @typedef {Object} YoGeminiDynamicThresholdManagerProps
 * @property {number} currentThreshold - The currently displayed threshold value.
 * @property {string} label - The label for the threshold.
 * @property {boolean} isEditable - Whether the threshold is mock-editable.
 * @property {(value: number) => void} onThresholdChange - Callback for mock changes.
 */
interface YoGeminiDynamicThresholdManagerProps {
  currentThreshold: number;
  label: string;
  isEditable?: boolean;
  onThresholdChange?: (value: number) => void;
}

/**
 * YoGeminiDynamicThresholdManager presents a UI for managing hypothetical dynamic thresholds.
 * It's a dummy component that only displays a value and can simulate editing.
 *
 * @param {YoGeminiDynamicThresholdManagerProps} props - The properties for the threshold manager.
 * @returns {JSX.Element} The rendered threshold manager.
 */
export const YoGeminiDynamicThresholdManager: React.FC<YoGeminiDynamicThresholdManagerProps> = ({
  currentThreshold,
  label,
  isEditable = false,
  onThresholdChange,
}) => {
  const [thresholdValue, setThresholdValue] = useState(currentThreshold);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setThresholdValue(currentThreshold);
  }, [currentThreshold]);

  const handleSave = () => {
    if (onThresholdChange) {
      onThresholdChange(thresholdValue);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {isEditable && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>
      {isEditing && isEditable ? (
        <div className="flex items-center">
          <input
            type="number"
            value={thresholdValue}
            onChange={(e) => setThresholdValue(parseFloat(e.target.value))}
            className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSave}
            className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      ) : (
        <p className="text-lg font-bold text-gray-900">
          {thresholdValue.toFixed(2)}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        Automatically adjusted by Gemini AI for optimal performance.
      </p>
    </div>
  );
};

/**
 * @typedef {Object} YoGeminiConfigurationPanelProps
 * @property {number} retryDelayThreshold - Mock threshold for retry delay.
 * @property {number} failureRateAlertThreshold - Mock threshold for failure rate alerts.
 */
interface YoGeminiConfigurationPanelProps {
  retryDelayThreshold: number;
  failureRateAlertThreshold: number;
}

/**
 * YoGeminiConfigurationPanel provides a mock interface for AI-driven configurations.
 *
 * @param {YoGeminiConfigurationPanelProps} props - Properties for the configuration panel.
 * @returns {JSX.Element} The rendered configuration panel.
 */
export const YoGeminiConfigurationPanel: React.FC<YoGeminiConfigurationPanelProps> = ({
  retryDelayThreshold,
  failureRateAlertThreshold,
}) => {
  const [localRetryDelayThreshold, setLocalRetryDelayThreshold] =
    useState(retryDelayThreshold);
  const [localFailureRateAlertThreshold, setLocalFailureRateAlertThreshold] =
    useState(failureRateAlertThreshold);

  // No actual functionality, just state for mock UI updates
  const handleRetryDelayChange = useCallback((value: number) => {
    setLocalRetryDelayThreshold(value);
  }, []);

  const handleFailureRateChange = useCallback((value: number) => {
    setLocalFailureRateAlertThreshold(value);
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6 rounded-xl shadow-lg mt-6 border border-indigo-200">
      <h2 className="text-2xl font-extrabold text-indigo-800 mb-4 flex items-center">
        <span className="mr-2 text-3xl">✨</span>
        Gemini AI Smart Configuration
      </h2>
      <p className="text-gray-700 mb-6 text-sm">
        Leverage Gemini's intelligence to optimize your webhook delivery
        strategies. Thresholds are dynamically suggested based on observed
        patterns.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <YoGeminiDynamicThresholdManager
          label="AI-Optimized Retry Delay (s)"
          currentThreshold={localRetryDelayThreshold}
          isEditable
          onThresholdChange={handleRetryDelayChange}
        />
        <YoGeminiDynamicThresholdManager
          label="Failure Rate Alert Threshold (%)"
          currentThreshold={localFailureRateAlertThreshold}
          isEditable
          onThresholdChange={handleFailureRateChange}
        />
      </div>
      <div className="mt-8 pt-6 border-t border-indigo-200">
        <h3 className="text-lg font-semibold text-indigo-700 mb-3">
          Gemini AI Recommendations
        </h3>
        <p className="text-gray-600 text-sm italic">
          "Based on recent network conditions and endpoint response times,
          consider a slight increase in maximum concurrent retries to
          capitalize on periods of high endpoint availability. The predicted
          increase in throughput is 7.2%."
        </p>
        <button className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out">
          Apply Suggested Configuration (Mock)
        </button>
      </div>
    </div>
  );
};

// --- YoGemini Dashboard Layout & Panels ---

/**
 * @typedef {Object} YoGeminiDashboardLayoutProps
 * @property {React.ReactNode} header - Content for the dashboard header.
 * @property {React.ReactNode} sidebar - Content for the optional sidebar.
 * @property {React.ReactNode} mainContent - Main content of the dashboard.
 * @property {React.ReactNode} footer - Content for the dashboard footer.
 */
interface YoGeminiDashboardLayoutProps {
  header: React.ReactNode;
  sidebar?: React.ReactNode;
  mainContent: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * YoGeminiDashboardLayout provides a flexible layout structure for the Gemini-themed view.
 * It's a purely structural component.
 *
 * @param {YoGeminiDashboardLayoutProps} props - Properties for the dashboard layout.
 * @returns {JSX.Element} The rendered dashboard layout.
 */
export const YoGeminiDashboardLayout: React.FC<YoGeminiDashboardLayoutProps> = ({
  header,
  sidebar,
  mainContent,
  footer,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-lg p-4 z-10 sticky top-0">
        {header}
      </header>
      <div className="flex flex-grow container mx-auto px-4 py-6">
        {sidebar && (
          <aside className="w-64 mr-6 p-4 bg-white rounded-lg shadow-md sticky top-24 h-[calc(100vh-100px)] overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <main className={`flex-grow ${sidebar ? "ml-0" : "w-full"}`}>
          {mainContent}
        </main>
      </div>
      {footer && (
        <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm mt-8">
          {footer}
        </footer>
      )}
    </div>
  );
};

/**
 * @typedef {Object} YoGeminiHeaderBannerProps
 * @property {string} title - The main title for the banner.
 * @property {string} subtitle - A descriptive subtitle.
 * @property {React.ReactNode} [actions] - Optional action buttons or components.
 */
interface YoGeminiHeaderBannerProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

/**
 * YoGeminiHeaderBanner serves as a decorative and informative header for the view.
 *
 * @param {YoGeminiHeaderBannerProps} props - Properties for the header banner.
 * @returns {JSX.Element} The rendered header banner.
 */
export const YoGeminiHeaderBanner: React.FC<YoGeminiHeaderBannerProps> = ({
  title,
  subtitle,
  actions,
}) => (
  <div className="flex flex-col md:flex-row justify-between items-center px-4 py-3">
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-sm text-blue-200 mt-1">{subtitle}</p>
    </div>
    {actions && <div className="mt-3 md:mt-0">{actions}</div>}
  </div>
);

/**
 * YoGeminiFooterDetails displays arbitrary footer information.
 *
 * @returns {JSX.Element} The rendered footer details.
 */
export const YoGeminiFooterDetails: React.FC = () => (
  <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto py-2">
    <p>&copy; {new Date().getFullYear()} Gemini AI Integrations. All rights reserved.</p>
    <div className="space-x-4 mt-2 md:mt-0">
      <a href="#" className="hover:text-white transition-colors">
        Privacy Policy
      </a>
      <a href="#" className="hover:text-white transition-colors">
        Terms of Service
      </a>
      <a href="#" className="hover:text-white transition-colors">
        AI Ethos Statement
      </a>
    </div>
  </div>
);

/**
 * @typedef {Object} YoGeminiAnalyticsPanelProps
 * @property {number} totalAttempts - The total number of attempts.
 * @property {number} successfulAttempts - Number of successful attempts.
 * @property {number} failedAttempts - Number of failed attempts.
 * @property {number} pendingAttempts - Number of pending attempts.
 */
interface YoGeminiAnalyticsPanelProps {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  pendingAttempts: number;
}

/**
 * YoGeminiAnalyticsPanel provides an overview of webhook delivery statistics.
 * This is a presentational component displaying derived aggregate data.
 *
 * @param {YoGeminiAnalyticsPanelProps} props - Properties for the analytics panel.
 * @returns {JSX.Element} The rendered analytics panel.
 */
export const YoGeminiAnalyticsPanel: React.FC<YoGeminiAnalyticsPanelProps> = ({
  totalAttempts,
  successfulAttempts,
  failedAttempts,
  pendingAttempts,
}) => {
  const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
  const failureRate = totalAttempts > 0 ? (failedAttempts / totalAttempts) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <YoGeminiInsightCard
          title="Total Attempts"
          value={totalAttempts.toString()}
          description="All webhook delivery attempts recorded."
          icon={<span>&#x1F4E6;</span>} // 📦
        />
        <YoGeminiInsightCard
          title="Successful"
          value={successfulAttempts.toString()}
          unit={`${successRate.toFixed(1)}%`}
          description="Deliveries completed without errors."
          colorClass="text-green-600"
          icon={<span>&#x2705;</span>} // ✅
        />
        <YoGeminiInsightCard
          title="Failed"
          value={failedAttempts.toString()}
          unit={`${failureRate.toFixed(1)}%`}
          description="Deliveries that resulted in a terminal error."
          colorClass="text-red-600"
          icon={<span>&#x274C;</span>} // ❌
        />
        <YoGeminiInsightCard
          title="Pending"
          value={pendingAttempts.toString()}
          description="Deliveries awaiting retry or confirmation."
          colorClass="text-yellow-600"
          icon={<span>&#x23F3;</span>} // ⏳
        />
      </div>
    </div>
  );
};

/**
 * @typedef {Object} YoGeminiStatusBadgeProps
 * @property {WebhookDeliveryAttemptStatus | string} status - The status to display.
 */
interface YoGeminiStatusBadgeProps {
  status: WebhookDeliveryAttemptStatus | string;
}

/**
 * YoGeminiStatusBadge displays a stylized badge for webhook delivery status.
 *
 * @param {YoGeminiStatusBadgeProps} props - Properties for the status badge.
 * @returns {JSX.Element} The rendered status badge.
 */
export const YoGeminiStatusBadge: React.FC<YoGeminiStatusBadgeProps> = ({
  status,
}) => {
  const statusColors = useMemo(() => {
    switch (status) {
      case WebhookDeliveryAttemptStatus.Success:
        return "bg-green-100 text-green-800";
      case WebhookDeliveryAttemptStatus.Failed:
        return "bg-red-100 text-red-800";
      case WebhookDeliveryAttemptStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      case WebhookDeliveryAttemptStatus.Retrying:
        return "bg-blue-100 text-blue-800";
      case WebhookDeliveryAttemptStatus.Created:
        return "bg-indigo-100 text-indigo-800";
      case WebhookDeliveryAttemptStatus.Expired:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [status]);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

/**
 * @typedef {Object} YoGeminiTimelineEventProps
 * @property {string} title - Title of the event.
 * @property {string} description - Description of the event.
 * @property {string} timestamp - ISO string timestamp of the event.
 * @property {string} icon - An emoji or character for the event icon.
 * @property {string} colorClass - Tailwind CSS class for color.
 */
interface YoGeminiTimelineEventProps {
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}

/**
 * YoGeminiTimelineEvent renders a single event in a timeline.
 *
 * @param {YoGeminiTimelineEventProps} props - Properties for the timeline event.
 * @returns {JSX.Element} The rendered timeline event.
 */
export const YoGeminiTimelineEvent: React.FC<YoGeminiTimelineEventProps> = ({
  title,
  description,
  timestamp,
  icon,
  colorClass,
}) => (
  <div className="flex items-start mb-6">
    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-lg ${colorClass}`}>
      {icon}
    </div>
    <div className="ml-4 flex-grow">
      <div className="flex justify-between items-center mb-1">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <span className="text-xs text-gray-500">
          <DateTime timestamp={timestamp} />
        </span>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

/**
 * @typedef {Object} YoGeminiTimelineVisualizerProps
 * @property {Array<{status: WebhookDeliveryAttemptStatus, createdAt: string, description?: string}>} events - A list of event data.
 */
interface YoGeminiTimelineVisualizerProps {
  events: Array<{
    status: WebhookDeliveryAttemptStatus;
    createdAt: string;
    description?: string;
  }>;
}

/**
 * YoGeminiTimelineVisualizer displays a mock timeline of webhook delivery attempts.
 * This is a decorative component that visually represents the sequence of attempts.
 *
 * @param {YoGeminiTimelineVisualizerProps} props - Properties for the timeline visualizer.
 * @returns {JSX.Element} The rendered timeline visualizer.
 */
export const YoGeminiTimelineVisualizer: React.FC<YoGeminiTimelineVisualizerProps> = ({
  events,
}) => {
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [events],
  );

  const getEventDetails = useCallback(
    (status: WebhookDeliveryAttemptStatus, index: number) => {
      let icon = "⚙️";
      let colorClass = "bg-gray-500";
      let title = "Processing";
      let description = "Webhook event is being processed.";

      switch (status) {
        case WebhookDeliveryAttemptStatus.Created:
          icon = "➕";
          colorClass = "bg-blue-500";
          title = "Event Created";
          description = `Attempt #${index + 1} initiated.`;
          break;
        case WebhookDeliveryAttemptStatus.Pending:
          icon = "⏳";
          colorClass = "bg-yellow-500";
          title = "Delivery Pending";
          description = `Attempt #${index + 1} queued for delivery.`;
          break;
        case WebhookDeliveryAttemptStatus.Retrying:
          icon = "🔄";
          colorClass = "bg-indigo-500";
          title = "Retrying Delivery";
          description = `Attempt #${index + 1} failed, scheduling retry.`;
          break;
        case WebhookDeliveryAttemptStatus.Success:
          icon = "✅";
          colorClass = "bg-green-500";
          title = "Delivery Successful";
          description = `Attempt #${index + 1} delivered successfully.`;
          break;
        case WebhookDeliveryAttemptStatus.Failed:
          icon = "❌";
          colorClass = "bg-red-500";
          title = "Delivery Failed";
          description = `Attempt #${index + 1} resulted in a terminal failure.`;
          break;
        case WebhookDeliveryAttemptStatus.Expired:
          icon = "🚫";
          colorClass = "bg-gray-700";
          title = "Attempt Expired";
          description = `Attempt #${index + 1} expired without successful delivery.`;
          break;
      }
      return { icon, colorClass, title, description };
    },
    [],
  );

  if (sortedEvents.length === 0) {
    return (
      <div className="text-gray-500 text-center p-4">No events to display.</div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Delivery Timeline</h3>
      <div className="relative border-l-2 border-gray-200 ml-4 pl-6">
        {sortedEvents.map((event, index) => {
          const { icon, colorClass, title, description } = getEventDetails(
            event.status,
            index,
          );
          return (
            <YoGeminiTimelineEvent
              key={event.createdAt + index}
              title={title}
              description={event.description || description}
              timestamp={event.createdAt}
              icon={icon}
              colorClass={colorClass}
            />
          );
        })}
      </div>
    </div>
  );
};

// --- YoGemini Utility Classes/Functions (Exported) ---

/**
 * @enum {string} YoGeminiEventType - Invented categories for webhook events.
 */
export enum YoGeminiEventType {
  Critical = "CRITICAL",
  Warning = "WARNING",
  Info = "INFO",
  Debug = "DEBUG",
  Success = "SUCCESS",
  Failure = "FAILURE",
  LatencyIssue = "LATENCY_ISSUE",
}

/**
 * @typedef {Object} YoGeminiProcessedWebhookData - An invented enhanced data structure.
 * @property {string} originalId - The original object ID.
 * @property {YoGeminiEventType} geminiCategory - An AI-invented category for the event.
 * @property {number} predictiveScore - A mock predictive score.
 * @property {string} humanReadableStatus - A more verbose status.
 * @property {string} correlationId - A mock correlation ID.
 * @property {Date} processedAt - Timestamp of when Gemini processed this data.
 * @property {number} simulatedLatencyMs - Simulated latency for this attempt.
 */
export interface YoGeminiProcessedWebhookData {
  originalId: string;
  geminiCategory: YoGeminiEventType;
  predictiveScore: number;
  humanReadableStatus: string;
  correlationId: string;
  processedAt: Date;
  simulatedLatencyMs: number;
}

/**
 * YoGeminiDataProcessor is an invented utility class that simulates processing raw webhook data
 * to derive AI-enhanced insights without changing actual functionality.
 */
export class YoGeminiDataProcessor {
  /**
   * Generates a mock correlation ID.
   * @returns {string} A random UUID-like string.
   */
  static generateCorrelationId(): string {
    return (
      "gemini-" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Simulates a predictive score based on status.
   * @param {WebhookDeliveryAttemptStatus} status - The original delivery status.
   * @returns {number} A mock predictive score between 0 and 1.
   */
  static getSimulatedPredictiveScore(
    status: WebhookDeliveryAttemptStatus,
  ): number {
    switch (status) {
      case WebhookDeliveryAttemptStatus.Success:
        return parseFloat((0.9 + Math.random() * 0.1).toFixed(2)); // 0.9 - 1.0
      case WebhookDeliveryAttemptStatus.Pending:
      case WebhookDeliveryAttemptStatus.Retrying:
        return parseFloat((0.4 + Math.random() * 0.4).toFixed(2)); // 0.4 - 0.8
      case WebhookDeliveryAttemptStatus.Failed:
      case WebhookDeliveryAttemptStatus.Expired:
        return parseFloat((0.0 + Math.random() * 0.3).toFixed(2)); // 0.0 - 0.3
      default:
        return parseFloat((Math.random() * 0.5).toFixed(2)); // 0.0 - 0.5
    }
  }

  /**
   * Assigns a mock Gemini category based on status and score.
   * @param {WebhookDeliveryAttemptStatus} status - The original delivery status.
   * @param {number} predictiveScore - The simulated predictive score.
   * @returns {YoGeminiEventType} An invented event category.
   */
  static assignGeminiCategory(
    status: WebhookDeliveryAttemptStatus,
    predictiveScore: number,
  ): YoGeminiEventType {
    if (status === WebhookDeliveryAttemptStatus.Success)
      return YoGeminiEventType.Success;
    if (status === WebhookDeliveryAttemptStatus.Failed) {
      if (predictiveScore < 0.1) return YoGeminiEventType.Critical;
      return YoGeminiEventType.Failure;
    }
    if (predictiveScore < 0.5) return YoGeminiEventType.Warning;
    return YoGeminiEventType.Info;
  }

  /**
   * Converts a status into a more verbose, human-readable string.
   * @param {WebhookDeliveryAttemptStatus} status - The original delivery status.
   * @returns {string} A verbose description.
   */
  static getHumanReadableStatus(status: WebhookDeliveryAttemptStatus): string {
    switch (status) {
      case WebhookDeliveryAttemptStatus.Success:
        return "Delivery completed successfully on the first attempt.";
      case WebhookDeliveryAttemptStatus.Failed:
        return "Delivery failed after all retry attempts. Investigate endpoint.";
      case WebhookDeliveryAttemptStatus.Pending:
        return "Currently awaiting initial delivery or next retry cycle.";
      case WebhookDeliveryAttemptStatus.Retrying:
        return "Delivery failed temporarily, retrying automatically.";
      case WebhookDeliveryAttemptStatus.Created:
        return "Webhook event has been generated and is awaiting processing.";
      case WebhookDeliveryAttemptStatus.Expired:
        return "Delivery window expired; no further attempts will be made.";
      default:
        return "Unknown or undefined delivery state.";
    }
  }

  /**
   * Generates a simulated latency for display purposes.
   * @returns {number} A random latency in milliseconds.
   */
  static getSimulatedLatency(): number {
    return Math.floor(Math.random() * (1500 - 50 + 1)) + 50; // 50ms to 1500ms
  }

  /**
   * Processes a single webhook delivery attempt node to add Gemini-invented data.
   * @param {any} node - The raw webhook delivery attempt node from GraphQL.
   * @returns {YoGeminiProcessedWebhookData} Enhanced data structure.
   */
  static processWebhookAttempt(node: any): YoGeminiProcessedWebhookData {
    const predictiveScore =
      YoGeminiDataProcessor.getSimulatedPredictiveScore(node.status);
    const geminiCategory = YoGeminiDataProcessor.assignGeminiCategory(
      node.status,
      predictiveScore,
    );
    const humanReadableStatus =
      YoGeminiDataProcessor.getHumanReadableStatus(node.status);
    const correlationId = YoGeminiDataProcessor.generateCorrelationId();
    const simulatedLatencyMs = YoGeminiDataProcessor.getSimulatedLatency();

    return {
      originalId: node.id,
      geminiCategory,
      predictiveScore,
      humanReadableStatus,
      correlationId,
      processedAt: new Date(),
      simulatedLatencyMs,
    };
  }

  /**
   * Batch processes multiple webhook delivery attempt nodes.
   * @param {any[]} nodes - An array of raw webhook delivery attempt nodes.
   * @returns {YoGeminiProcessedWebhookData[]} An array of enhanced data structures.
   */
  static batchProcessWebhookAttempts(
    nodes: any[],
  ): YoGeminiProcessedWebhookData[] {
    return nodes.map((node) => YoGeminiDataProcessor.processWebhookAttempt(node));
  }
}

/**
 * A purely decorative component that indicates Gemini AI is active.
 * No functionality, just visual presence.
 *
 * @returns {JSX.Element} The rendered AI indicator.
 */
export const YoGeminiAIIndicator: React.FC = () => (
  <div className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-xs font-semibold rounded-full shadow-lg animate-pulse-light">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
    </span>
    <span className="ml-2">Gemini AI Active</span>
  </div>
);

/**
 * @typedef {Object} YoGeminiActionConfirmationModalProps
 * @property {boolean} isOpen - Whether the modal is open.
 * @property {() => void} onClose - Callback to close the modal.
 * @property {() => void} onConfirm - Callback for confirmation.
 * @property {string} title - Modal title.
 * @property {string} message - Modal message.
 */
interface YoGeminiActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

/**
 * YoGeminiActionConfirmationModal is a mock confirmation modal for actions like resending webhooks.
 * It's purely a UI component and does not contain the actual action logic.
 *
 * @param {YoGeminiActionConfirmationModalProps} props - Properties for the modal.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export const YoGeminiActionConfirmationModal: React.FC<YoGeminiActionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// endregion YoGemini UI Component Definitions

/**
 * @interface WebhookDeliveryAttemptsViewProps
 * @property {object} queryArgs - Arguments for the webhook delivery attempts query.
 * @property {string} [queryArgs.webhookEndpointId] - Optional webhook endpoint ID.
 * @property {string} [queryArgs.eventId] - Optional event ID.
 */
interface WebhookDeliveryAttemptsViewProps {
  queryArgs: {
    webhookEndpointId?: string;
    eventId?: string;
  };
}

/**
 * WebhookDeliveryAttemptsView is the main component for displaying and managing webhook delivery attempts.
 * This expanded version integrates several new 'YoGemini' components to enhance presentation
 * and simulate AI-driven insights without altering core functionality.
 *
 * It fetches webhook delivery attempt data, processes it with a mock AI utility,
 * and renders it using an enhanced EntityTableView along with various Gemini-themed dashboards.
 *
 * @param {WebhookDeliveryAttemptsViewProps} props - The properties for the view.
 * @returns {JSX.Element} The rendered webhook delivery attempts view.
 */
function WebhookDeliveryAttemptsView({
  queryArgs,
}: WebhookDeliveryAttemptsViewProps) {
  const { dispatchError, dispatchSuccess } = useDispatchContext();
  const [currentPagination, setCurrentPagination] =
    useState<CursorPaginationInput>(INITIAL_PAGINATION);
  const [currentFilter, setCurrentFilter] =
    useState<WebhookDeliveryAttemptQueryFilter>({
      created_at: {
        inTheLast: { unit: TimeUnitEnum.Weeks, amount: "1" },
        format: TimeFormatEnum.Duration,
      },
    });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttemptForResend, setSelectedAttemptForResend] = useState<any | null>(null);

  const { loading, data, error, refetch } = useWebhookDeliveryAttemptsViewQuery(
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        first: currentPagination.perPage,
        after: currentPagination.after,
        before: currentPagination.before,
        last: currentPagination.last,
        webhookEndpointId: queryArgs.webhookEndpointId,
        eventId: queryArgs.eventId,
        createdAt: dateSearchMapper(currentFilter.created_at),
      },
    },
  );
  const [scheduleWebhookEvent] = useScheduleWebhookEventMutation();

  const handleRefetch = useCallback(
    async (options: {
      cursorPaginationParams: CursorPaginationInput;
      query: WebhookDeliveryAttemptQueryFilter;
    }) => {
      const { cursorPaginationParams, query } = options;
      setCurrentPagination(cursorPaginationParams);
      setCurrentFilter(query);
      await refetch({
        createdAt: dateSearchMapper(query.created_at),
        ...cursorPaginationParams,
        webhookEndpointId: queryArgs.webhookEndpointId,
        eventId: queryArgs.eventId,
      });
    },
    [refetch, queryArgs.webhookEndpointId, queryArgs.eventId],
  );

  const rawDeliveryAttempts = useMemo(
    () =>
      loading || !data || error
        ? []
        : data.webhookDeliveryAttempts.edges.map(({ node }) => node),
    [loading, data, error],
  );

  const processedDeliveryAttempts = useMemo(() => {
    return YoGeminiDataProcessor.batchProcessWebhookAttempts(rawDeliveryAttempts);
  }, [rawDeliveryAttempts]);

  const deliveryAttempts = useMemo(() => {
    if (!data) return [];
    return data.webhookDeliveryAttempts.edges.map(({ node }, index) => {
      const geminiData = processedDeliveryAttempts[index];

      const headers = (
        <ReactJson
          src={JSON.parse(node.headers) as Record<string, unknown>}
          name={null}
          displayObjectSize={false}
          displayDataTypes={false}
          collapsed={1}
          theme="monokai"
        />
      );
      const body = (
        <ReactJson
          src={
            node.body ? (JSON.parse(node.body) as Record<string, unknown>) : {}
          }
          name={null}
          displayObjectSize={false}
          displayDataTypes={false}
          collapsed={1}
          theme="apathy"
        />
      );

      const handleResendClick = () => {
        if (node.objectId) {
          setSelectedAttemptForResend(node);
          setIsModalOpen(true);
        }
      };

      const resendButton = (
        <Clickable
          id={`resend_button_${node.id}`}
          onClick={handleResendClick}
          className="group"
        >
          <span className="ml-2 text-green-500 hover:text-green-600 group-hover:underline">
            Resend Webhook
          </span>
          <span className="ml-1 text-xs text-gray-400 group-hover:text-gray-500">(AI Suggest)</span>
        </Clickable>
      );

      const geminiInsightCard = (
        <div className="p-2 border rounded-md border-indigo-200 bg-indigo-50 text-indigo-800 text-xs shadow-inner mt-2">
          <p className="font-semibold">Gemini AI Insights:</p>
          <ul className="list-disc list-inside mt-1">
            <li>
              Category: <YoGeminiStatusBadge status={geminiData.geminiCategory} />
            </li>
            <li>Predictive Score: {geminiData.predictiveScore.toFixed(2)}</li>
            <li>Correlation ID: {geminiData.correlationId.substring(0, 12)}...</li>
            <li>Simulated Latency: {geminiData.simulatedLatencyMs}ms</li>
          </ul>
          <p className="mt-2 text-gray-700 italic">"{geminiData.humanReadableStatus}"</p>
        </div>
      );

      const dataObj = [
        { key: "Resend Action", value: resendButton },
        { key: "Delivery URL", value: node.webhookUrl },
        { key: "Headers (JSON)", value: headers },
        { key: "Body (JSON)", value: body },
        { key: "Gemini Insights", value: geminiInsightCard },
        { key: "Raw Request ID", value: node.objectId },
      ];

      return {
        ...node,
        data: dataObj,
        createdAt: <DateTime timestamp={node.createdAt} />,
        status: <YoGeminiStatusBadge status={node.status} />,
        geminiCategory: <YoGeminiStatusBadge status={geminiData.geminiCategory} />,
        predictiveScore: geminiData.predictiveScore.toFixed(2),
      };
    });
  }, [data, processedDeliveryAttempts]); // Include processedDeliveryAttempts in dependency array

  const expandedData = useMemo(
    () =>
      reduce(
        deliveryAttempts,
        (acc, curr) => {
          acc[curr.id] = curr.data;
          return acc;
        },
        {},
      ),
    [deliveryAttempts],
  );

  const searchComponents = useMemo(
    () => getWebhookDeliveryAttemptSearchComponents(),
    [],
  );

  const exportDataParams: ExportDataParams = useMemo(
    () => ({
      params: {
        webhook_endpoint_id: queryArgs.webhookEndpointId,
      },
    }),
    [queryArgs.webhookEndpointId],
  );

  const totalAttempts = rawDeliveryAttempts.length;
  const successfulAttempts = rawDeliveryAttempts.filter(
    (a) => a.status === WebhookDeliveryAttemptStatus.Success,
  ).length;
  const failedAttempts = rawDeliveryAttempts.filter(
    (a) => a.status === WebhookDeliveryAttemptStatus.Failed,
  ).length;
  const pendingAttempts = rawDeliveryAttempts.filter(
    (a) =>
      a.status === WebhookDeliveryAttemptStatus.Pending ||
      a.status === WebhookDeliveryAttemptStatus.Retrying,
  ).length;

  const timelineEvents = useMemo(
    () =>
      rawDeliveryAttempts.map((attempt) => ({
        status: attempt.status,
        createdAt: attempt.createdAt,
        description: `Status changed to ${attempt.status.replace(/_/g, " ")}.`,
      })),
    [rawDeliveryAttempts],
  );

  const handleModalConfirmResend = useCallback(async () => {
    if (!selectedAttemptForResend?.objectId) {
      return;
    }
    try {
      const res = await scheduleWebhookEvent({
        variables: {
          input: {
            input: {
              eventId: selectedAttemptForResend.objectId,
              webhookId: selectedAttemptForResend.webhookEndpointId,
            },
          },
        },
      });

      if ((res.data?.scheduleWebhookEvent?.errors?.length ?? 0) > 0) {
        dispatchError(
          `Error resending webhook: ${
            res.data?.scheduleWebhookEvent?.errors?.join(", ") ?? ""
          }`,
        );
      } else {
        dispatchSuccess(
          `Webhook sent: ${
            res.data?.scheduleWebhookEvent?.webhookEvent?.webhookEndpointId ??
            ""
          }`,
        );
        void refetch(); // Refetch data to show new attempt
      }
    } catch (err: any) {
      dispatchError(`Network error resending webhook: ${err.message}`);
    } finally {
      setSelectedAttemptForResend(null);
      setIsModalOpen(false);
    }
  }, [selectedAttemptForResend, scheduleWebhookEvent, dispatchError, dispatchSuccess, refetch]);

  const mockPredictiveSuccessRate = useMemo(() => {
    if (totalAttempts === 0) return 99.5;
    const currentSuccessRate = (successfulAttempts / totalAttempts) * 100;
    // Simulate AI slightly adjusting it
    return parseFloat((currentSuccessRate + Math.random() * 5 - 2.5).toFixed(2));
  }, [totalAttempts, successfulAttempts]);

  const mockAnomalyScore = useMemo(() => {
    if (failedAttempts > 0 && totalAttempts > 0) {
      const failureRatio = failedAttempts / totalAttempts;
      return parseFloat((failureRatio * 0.8 + Math.random() * 0.2).toFixed(2));
    }
    return parseFloat((Math.random() * 0.1).toFixed(2));
  }, [failedAttempts, totalAttempts]);

  const mockExpectedLatency = useMemo(() => {
    // Simulate average latency from processed data, or a default
    const sumLatency = processedDeliveryAttempts.reduce((acc, curr) => acc + curr.simulatedLatencyMs, 0);
    if (processedDeliveryAttempts.length > 0) {
      return sumLatency / processedDeliveryAttempts.length;
    }
    return 250 + Math.random() * 100; // Default
  }, [processedDeliveryAttempts]);

  const mockTrendDelta = useMemo(() => {
    // Simulate a random trend for presentation
    return parseFloat((Math.random() * 10 - 5).toFixed(2)); // -5% to +5%
  }, []);

  const [mockRetryDelayThreshold, setMockRetryDelayThreshold] = useState(15);
  const [mockFailureRateAlertThreshold, setMockFailureRateAlertThreshold] = useState(5.0);

  return (
    <YoGeminiDashboardLayout
      header={
        <YoGeminiHeaderBanner
          title="Gemini Webhook Delivery Dashboard"
          subtitle="Advanced AI-powered monitoring and management for your webhook events."
          actions={
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Quick Action (Mock)
              </button>
              <button className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors">
                AI Diagnostics (Mock)
              </button>
            </div>
          }
        />
      }
      sidebar={
        <nav className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">Navigation</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="block p-2 rounded-md hover:bg-gray-100 transition-colors text-indigo-700 font-semibold"
              >
                Delivery Overview
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
              >
                Endpoint Health (Mock)
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
              >
                AI Insights & Trends (Mock)
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
              >
                Configuration (Mock)
              </a>
            </li>
          </ul>
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              AI Status
            </h3>
            <p className="text-sm text-gray-600 flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Gemini AI: Operational
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Last Synced: <DateTime timestamp={new Date().toISOString()} />
            </p>
          </div>
        </nav>
      }
      mainContent={
        <>
          <YoGeminiAIIndicator />
          {loading && (
            <div className="text-center p-8 text-lg text-blue-600">
              <span className="animate-spin mr-2">🌀</span>
              Loading Gemini AI Enhanced Webhook Data...
            </div>
          )}
          {!loading && !!data?.relatedRecordsAreArchived && (
            <ArchivedRecordsBanner
              liveMode={!!data?.currentOrganization?.currentLiveMode}
              resourceType="WebhookDeliveryAttempt"
            />
          )}

          <YoGeminiAnalyticsPanel
            totalAttempts={totalAttempts}
            successfulAttempts={successfulAttempts}
            failedAttempts={failedAttempts}
            pendingAttempts={pendingAttempts}
          />

          <YoGeminiPredictiveMetrics
            successRate={mockPredictiveSuccessRate}
            anomalyScore={mockAnomalyScore}
            expectedLatencyMs={mockExpectedLatency}
            trendDelta={mockTrendDelta}
          />

          <YoGeminiConfigurationPanel
            retryDelayThreshold={mockRetryDelayThreshold}
            failureRateAlertThreshold={mockFailureRateAlertThreshold}
          />

          <YoGeminiTimelineVisualizer events={timelineEvents} />

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Detailed Delivery Attempts
            </h2>
            <EntityTableView
              data={deliveryAttempts}
              dataMapping={{
                objectId: "Object ID",
                topic: "Topic",
                eventName: "Event",
                status: "Status",
                createdAt: "Time",
                geminiCategory: "AI Category",
                predictiveScore: "AI Score",
              }}
              styleMapping={{
                objectId: "table-entry-wide",
                status: "table-entry-narrow",
                geminiCategory: "table-entry-narrow",
                predictiveScore: "table-entry-narrow",
              }}
              loading={loading}
              onQueryArgChange={handleRefetch}
              cursorPagination={data?.webhookDeliveryAttempts?.pageInfo}
              defaultPerPage={25}
              expandedData={expandedData}
              enableActions
              disableQueryURLParams
              additionalSearchComponents={searchComponents.additionalComponents}
              resource={WEBHOOK_DELIVERY_ATTEMPT}
              enableExportData
              exportDataParams={exportDataParams}
              initialQuery={{
                created_at: {
                  inTheLast: { unit: TimeUnitEnum.Weeks, amount: "1" },
                  format: TimeFormatEnum.Duration,
                },
              }}
            />
          </div>
          <YoGeminiActionConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleModalConfirmResend}
            title="Confirm Webhook Resend via Gemini AI"
            message={`Are you sure you want to resend webhook delivery attempt "${selectedAttemptForResend?.id}"? Gemini AI predicts optimal timing for this retry.`}
          />
        </>
      }
      footer={<YoGeminiFooterDetails />}
    />
  );
}

export default WebhookDeliveryAttemptsView;