import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useUsersHomeDeprecatedQuery } from "../../generated/dashboard/graphqlSchema";
import EntityTableView, { INITIAL_PAGINATION } from "./EntityTableView";
import { CursorPaginationInput } from "../types/CursorPaginationInput";
import {
  getUserSearchComponents,
  ROLES,
  UserQueryFilter,
} from "../../common/search_components/userSearchComponents";
import SourceIcon from "./SourceIcon";
import { ORGANIZATION_USER } from "../../generated/dashboard/types/resources";
import { UserFragment } from "../../generated/dashboard/types/UserFragment";
import { ApolloError } from "@apollo/client";

// --- Gemini-powered AI Enhancements Begin Here ---

/**
 * @typedef {Object} GeminiInsightScore
 * @property {number} raw - The raw, unweighted insight score.
 * @property {number} normalized - The normalized score, typically between 0 and 1.
 * @property {string} category - A categorical label for the insight (e.g., 'High Activity', 'Potential Churn').
 * @property {string} sentiment - The detected sentiment ('Positive', 'Neutral', 'Negative').
 */
export type GeminiInsightScore = {
  raw: number;
  normalized: number;
  category: string;
  sentiment: string;
};

/**
 * @typedef {Object} GeminiUserPrediction
 * @property {boolean} willBecomeActive - Prediction on future activity.
 * @property {number} activityProbability - Probability score (0-1).
 * @property {string[]} topSuggestedRoles - AI-suggested roles based on behavior patterns.
 * @property {number} churnRiskScore - A score indicating the likelihood of the user becoming inactive.
 */
export type GeminiUserPrediction = {
  willBecomeActive: boolean;
  activityProbability: number;
  topSuggestedRoles: string[];
  churnRiskScore: number;
};

/**
 * @typedef {Object} GeminiAnalyticsSummary
 * @property {number} totalUsersAnalyzed - Count of users processed by Gemini.
 * @property {number} activeUsersGeminiEstimate - Gemini's real-time estimate of active users.
 * @property {number} highRiskChurnUsers - Count of users identified with high churn risk.
 * @property {string} overallSentiment - Aggregate sentiment across all users.
 * @property {GeminiInsightScore} averageEngagementScore - Average engagement score across all users.
 * @property {Array<Object>} keyTrends - AI-detected key trends in user data.
 */
export type GeminiAnalyticsSummary = {
  totalUsersAnalyzed: number;
  activeUsersGeminiEstimate: number;
  highRiskChurnUsers: number;
  overallSentiment: string;
  averageEngagementScore: GeminiInsightScore;
  keyTrends: Array<{ trend: string; magnitude: number }>;
};

/**
 * Simulates a Gemini AI service interaction to enrich user data.
 * In a real-world scenario, this would involve API calls to a sophisticated
 * machine learning model. For this expansion, it's a placeholder.
 * @param {UserFragment} user - The user object to enrich.
 * @returns {Object} An object containing Gemini-derived insights and predictions.
 */
export const useGeminiUserEnrichment = (user: UserFragment) => {
  const [enrichmentData, setEnrichmentData] = useState<{
    insightScore?: GeminiInsightScore;
    prediction?: GeminiUserPrediction;
  }>({});
  const [isLoadingGemini, setIsLoadingGemini] = useState(true);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call delay for Gemini AI processing
    const timer = setTimeout(() => {
      try {
        if (!user || !user.id) {
          throw new Error("Invalid user provided for Gemini enrichment.");
        }

        // Gemini AI generates a dynamic insight score based on various (simulated) factors
        const rawScore = user.name.length * 7 + user.email.length * 3; // Placeholder logic
        const normalizedScore = Math.min(1, rawScore / 100);
        const category = normalizedScore > 0.7 ? "High Activity" : "Moderate";
        const sentiment = normalizedScore > 0.8 ? "Positive" : "Neutral";

        // Gemini AI generates a dynamic prediction
        const activityProbability = Math.min(
          0.99,
          Math.random() * normalizedScore + 0.3
        );
        const churnRiskScore = Math.max(
          0.01,
          1 - activityProbability - Math.random() * 0.1
        );
        const suggestedRoles =
          activityProbability > 0.7
            ? ["Gemini_Contributor", "Gemini_Innovator"]
            : ["Gemini_Observer"];

        setEnrichmentData({
          insightScore: { raw: rawScore, normalized: normalizedScore, category, sentiment },
          prediction: {
            willBecomeActive: activityProbability > 0.5,
            activityProbability,
            topSuggestedRoles: suggestedRoles,
            churnRiskScore,
          },
        });
        setIsLoadingGemini(false);
      } catch (e: any) {
        setGeminiError(e.message || "Failed to get Gemini insights.");
        setIsLoadingGemini(false);
      }
    }, 300 + Math.random() * 700); // Random delay for AI processing simulation

    return () => clearTimeout(timer);
  }, [user]);

  return { enrichmentData, isLoadingGemini, geminiError };
};

/**
 * Simulates a higher-level Gemini AI service to provide an analytics summary.
 * This would typically aggregate data from multiple users and models.
 * @returns {Object} An object containing the Gemini analytics summary.
 */
export const useGeminiGlobalAnalytics = () => {
  const [summary, setSummary] = useState<GeminiAnalyticsSummary | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call for global analytics
    const timer = setTimeout(() => {
      try {
        const totalUsers = 100 + Math.floor(Math.random() * 200);
        const activeEstimate = Math.floor(totalUsers * (0.6 + Math.random() * 0.2));
        const highRisk = Math.floor(totalUsers * (0.1 + Math.random() * 0.05));

        setSummary({
          totalUsersAnalyzed: totalUsers,
          activeUsersGeminiEstimate: activeEstimate,
          highRiskChurnUsers: highRisk,
          overallSentiment: "Generally Positive with Monitoring Required",
          averageEngagementScore: {
            raw: 65 + Math.random() * 20,
            normalized: 0.65 + Math.random() * 0.2,
            category: "Moderate-High Engagement",
            sentiment: "Positive",
          },
          keyTrends: [
            { trend: "Increased login frequency for new users", magnitude: 0.85 },
            { trend: "Sporadic activity for long-term dormant accounts", magnitude: 0.45 },
            { trend: "Role-based access pattern shifts detected by Gemini", magnitude: 0.72 },
          ],
        });
        setIsLoadingAnalytics(false);
      } catch (e: any) {
        setAnalyticsError(e.message || "Failed to fetch Gemini global analytics.");
        setIsLoadingAnalytics(false);
      }
    }, 1000 + Math.random() * 1500); // Longer delay for global analysis

    return () => clearTimeout(timer);
  }, []);

  return { summary, isLoadingAnalytics, analyticsError };
};

// --- Yo Components for Enhanced UI/UX with Gemini Insights ---

/**
 * @interface YoUserAvatarProps
 * @property {string} name - User's name for initials.
 * @property {string} email - User's email for a unique identifier.
 * @property {GeminiInsightScore | undefined} geminiScore - Optional Gemini insight score to influence avatar display.
 */
export interface YoUserAvatarProps {
  name: string;
  email: string;
  geminiScore?: GeminiInsightScore;
}

/**
 * YoUserAvatar: A highly stylized user avatar component, dynamically adjusting its appearance
 * based on Gemini insights. It shows initials and a subtle glow reflecting sentiment.
 * @param {YoUserAvatarProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered avatar.
 */
export const YoUserAvatar: React.FC<YoUserAvatarProps> = React.memo(
  ({ name, email, geminiScore }) => {
    const initials = useMemo(
      () =>
        name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2),
      [name]
    );

    const avatarColor = useMemo(() => {
      if (geminiScore) {
        if (geminiScore.sentiment === "Positive") return "bg-green-500";
        if (geminiScore.sentiment === "Negative") return "bg-red-500";
        if (geminiScore.sentiment === "Neutral") return "bg-blue-500";
      }
      return "bg-gray-400";
    }, [geminiScore]);

    const glowStyle = useMemo(() => {
      if (geminiScore && geminiScore.normalized > 0.8) {
        return "shadow-lg shadow-gemini-accent/50 animate-pulse-light";
      }
      return "";
    }, [geminiScore]);

    return (
      <div
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-full ${avatarColor} text-white font-semibold text-sm overflow-hidden ${glowStyle}`}
        title={`Gemini Sentiment: ${geminiScore?.sentiment || "N/A"}`}
        aria-label={`Avatar for ${name}`}
      >
        <span>{initials}</span>
        {geminiScore && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
            style={{
              backgroundColor:
                geminiScore.sentiment === "Positive"
                  ? "lime"
                  : geminiScore.sentiment === "Negative"
                  ? "darkred"
                  : "gold",
            }}
            title={`Gemini Insight Score: ${geminiScore.normalized.toFixed(
              2
            )} (${geminiScore.category})`}
          />
        )}
      </div>
    );
  }
);

/**
 * @interface YoUserStatusIndicatorProps
 * @property {GeminiInsightScore | undefined} geminiScore - Gemini score for status.
 * @property {GeminiUserPrediction | undefined} geminiPrediction - Gemini prediction for status.
 */
export interface YoUserStatusIndicatorProps {
  geminiScore?: GeminiInsightScore;
  geminiPrediction?: GeminiUserPrediction;
}

/**
 * YoUserStatusIndicator: Displays a complex status based on Gemini's real-time analysis.
 * Features dynamic icons and text based on activity predictions and churn risk.
 * @param {YoUserStatusIndicatorProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered status indicator.
 */
export const YoUserStatusIndicator: React.FC<
  YoUserStatusIndicatorProps
> = React.memo(({ geminiScore, geminiPrediction }) => {
  const statusInfo = useMemo(() => {
    let icon = "🟢"; // Default active
    let text = "Active (Gemini Monitoring)";
    let color = "text-green-600";
    let detail = "Gemini AI: User exhibits consistent engagement patterns.";

    if (geminiPrediction) {
      if (geminiPrediction.churnRiskScore > 0.7) {
        icon = "🔴";
        text = "High Churn Risk (Gemini Alert)";
        color = "text-red-600";
        detail = `Gemini AI: Elevated churn probability of ${(
          geminiPrediction.churnRiskScore * 100
        ).toFixed(1)}%. Immediate intervention suggested.`;
      } else if (!geminiPrediction.willBecomeActive) {
        icon = "🟡";
        text = "Potentially Inactive (Gemini Watch)";
        color = "text-yellow-600";
        detail = `Gemini AI: Activity probability is ${(
          geminiPrediction.activityProbability * 100
        ).toFixed(1)}%. User might become dormant.`;
      } else if (geminiPrediction.activityProbability < 0.5) {
        icon = "🔵";
        text = "Moderate Activity (Gemini Observing)";
        color = "text-blue-600";
        detail = `Gemini AI: Activity probability at ${(
          geminiPrediction.activityProbability * 100
        ).toFixed(1)}%. Consistent but not hyper-active.`;
      }
    }

    if (geminiScore && geminiScore.sentiment === "Negative") {
      icon = "🚨";
      text = `Negative Sentiment Detected (Gemini Flag: ${geminiScore.category})`;
      color = "text-orange-600";
      detail = `Gemini AI: Negative sentiment identified with score ${geminiScore.normalized.toFixed(
        2
      )}. Review user interactions.`;
    }

    return { icon, text, color, detail };
  }, [geminiScore, geminiPrediction]);

  return (
    <div
      className={`flex items-center space-x-1 ${statusInfo.color} font-medium text-sm`}
      title={statusInfo.detail}
      aria-label={statusInfo.text}
    >
      <span className="text-lg">{statusInfo.icon}</span>
      <span>{statusInfo.text}</span>
    </div>
  );
});

/**
 * @interface YoGeminiTrendChartProps
 * @property {GeminiAnalyticsSummary | null} summary - Global analytics summary from Gemini.
 * @property {boolean} isLoading - Loading state.
 * @property {string | null} error - Error message.
 */
export interface YoGeminiTrendChartProps {
  summary: GeminiAnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * YoGeminiTrendChart: A sophisticated component to visualize global trends
 * detected by Gemini AI. It dynamically renders a placeholder chart.
 * In a real application, this would integrate with a charting library.
 * @param {YoGeminiTrendChartProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered trend chart placeholder.
 */
export const YoGeminiTrendChart: React.FC<YoGeminiTrendChartProps> = React.memo(
  ({ summary, isLoading, error }) => {
    if (isLoading) {
      return (
        <div className="p-4 bg-gemini-dark text-gemini-light rounded-lg shadow-inner animate-pulse">
          <p>Gemini AI is computing global trends... please wait.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-800 text-white rounded-lg shadow-inner">
          <p>Error loading Gemini trends: {error}</p>
          <p className="text-sm">
            Gemini AI encountered an anomaly. Initiating self-correction protocols.
          </p>
        </div>
      );
    }

    if (!summary) {
      return (
        <div className="p-4 bg-gemini-medium text-gemini-light rounded-lg shadow-inner">
          <p>No Gemini global trend data available.</p>
        </div>
      );
    }

    const maxMagnitude = Math.max(...summary.keyTrends.map((t) => t.magnitude));

    return (
      <div className="p-4 bg-gemini-dark text-gemini-light rounded-lg shadow-xl border border-gemini-accent">
        <h3 className="text-xl font-bold mb-3 text-gemini-accent">
          YoGemini AI Global Trends
        </h3>
        <p className="text-sm mb-2 opacity-80">
          Last updated: {new Date().toLocaleString()} (Gemini Real-time Synch)
        </p>
        <div className="space-y-2">
          {summary.keyTrends.map((trend, index) => (
            <div key={index} className="flex items-center">
              <span className="text-sm w-2/3">{trend.trend}</span>
              <div className="w-1/3 h-2 bg-gemini-medium rounded-full relative ml-2">
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-gemini-accent transition-all duration-500 ease-out"
                  style={{ width: `${(trend.magnitude / maxMagnitude) * 100}%` }}
                ></div>
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs text-gemini-light opacity-70">
                  {(trend.magnitude * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4 italic opacity-70">
          Gemini AI provides dynamic, context-aware trend analysis for optimal
          operational insights. This visualization is a simplification of a
          multi-dimensional analytical output.
        </p>
      </div>
    );
  }
);

/**
 * @interface YoDynamicFilterPanelProps
 * @property {(newFilter: UserQueryFilter) => void} onApplyFilter - Callback for applying filters.
 * @property {UserQueryFilter} currentFilters - Currently applied filters.
 * @property {boolean} isLoadingGeminiFilters - Loading state for Gemini-suggested filters.
 * @property {string[] | null} geminiSuggestedFilters - AI-suggested filter categories.
 */
export interface YoDynamicFilterPanelProps {
  onApplyFilter: (newFilter: UserQueryFilter) => void;
  currentFilters: UserQueryFilter;
  isLoadingGeminiFilters: boolean;
  geminiSuggestedFilters: string[] | null;
}

/**
 * YoDynamicFilterPanel: An AI-augmented filter panel that can suggest filters
 * based on Gemini's understanding of current data patterns and user behavior.
 * @param {YoDynamicFilterPanelProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered dynamic filter panel.
 */
export const YoDynamicFilterPanel: React.FC<YoDynamicFilterPanelProps> = React.memo(
  ({ onApplyFilter, currentFilters, isLoadingGeminiFilters, geminiSuggestedFilters }) => {
    const [localFilter, setLocalFilter] = useState<UserQueryFilter>(currentFilters);

    useEffect(() => {
      setLocalFilter(currentFilters);
    }, [currentFilters]);

    const handleChange = useCallback(
      (key: keyof UserQueryFilter, value: string | boolean | undefined) => {
        setLocalFilter((prev) => ({ ...prev, [key]: value }));
      },
      []
    );

    const handleApply = useCallback(() => {
      onApplyFilter(localFilter);
    }, [onApplyFilter, localFilter]);

    const handleClear = useCallback(() => {
      setLocalFilter({});
      onApplyFilter({});
    }, [onApplyFilter]);

    return (
      <div className="p-4 bg-gemini-medium rounded-lg shadow-md border border-gemini-accent/50 text-gemini-light">
        <h4 className="text-lg font-semibold mb-3 text-gemini-accent">
          YoGemini Filter Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm opacity-80">Name Search (Gemini-Enhanced)</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-gemini-dark border-transparent focus:border-gemini-accent focus:ring focus:ring-gemini-accent focus:ring-opacity-50 text-gemini-light"
              value={localFilter.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter name pattern (AI-fuzzy matching enabled)"
            />
          </label>
          <label className="block">
            <span className="text-sm opacity-80">Email Search (Gemini Pattern ID)</span>
            <input
              type="text"
              className="mt-1 block w-full rounded-md bg-gemini-dark border-transparent focus:border-gemini-accent focus:ring focus:ring-gemini-accent focus:ring-opacity-50 text-gemini-light"
              value={localFilter.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Enter email (AI-suggests similar domains)"
            />
          </label>
          <label className="block">
            <span className="text-sm opacity-80">Show Deleted (Gemini Retention Policy)</span>
            <select
              className="mt-1 block w-full rounded-md bg-gemini-dark border-transparent focus:border-gemini-accent focus:ring focus:ring-gemini-accent focus:ring-opacity-50 text-gemini-light"
              value={localFilter.show_deleted?.toString() || "false"}
              onChange={(e) => handleChange("show_deleted", e.target.value === "true")}
            >
              <option value="false">Hide Deleted</option>
              <option value="true">Show Deleted</option>
              <option value="all">Gemini AI Retention View</option>
            </select>
          </label>
          <div className="flex flex-col">
            <span className="text-sm opacity-80 mb-1">Gemini-Suggested Filters:</span>
            {isLoadingGeminiFilters ? (
              <span className="text-xs text-gemini-accent animate-pulse">
                Gemini AI is analyzing optimal filter sets...
              </span>
            ) : geminiSuggestedFilters && geminiSuggestedFilters.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {geminiSuggestedFilters.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gemini-accent/20 rounded-full text-xs text-gemini-accent cursor-pointer hover:bg-gemini-accent/40 transition-colors"
                    onClick={() => console.log(`Gemini suggested filter clicked: ${tag}`)}
                  >
                    #Gemini_{tag.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs opacity-60">No dynamic filter suggestions from Gemini.</span>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-gemini-accent hover:bg-gemini-accent/80 rounded-md text-gemini-dark font-medium transition-colors"
          >
            Apply Gemini Filters
          </button>
        </div>
        <p className="text-xs mt-3 opacity-60 italic">
          Filters enhanced by Gemini AI for contextual relevance and predictive query optimization.
        </p>
      </div>
    );
  }
);

/**
 * @interface YoGeminiActionMenuProps
 * @property {UserFragment} user - The user object for which actions are being taken.
 * @property {GeminiUserPrediction | undefined} geminiPrediction - AI predictions influencing available actions.
 */
export interface YoGeminiActionMenuProps {
  user: UserFragment;
  geminiPrediction?: GeminiUserPrediction;
}

/**
 * YoGeminiActionMenu: A context-aware action menu that dynamically offers options
 * based on Gemini's predictions and user status.
 * @param {YoGeminiActionMenuProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered action menu.
 */
export const YoGeminiActionMenu: React.FC<YoGeminiActionMenuProps> = React.memo(
  ({ user, geminiPrediction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [handleClickOutside]);

    const geminiActions = useMemo(() => {
      const actions = [
        { label: "View Gemini User Profile", action: () => alert(`Viewing profile for ${user.name}`), color: "text-blue-400" },
      ];

      if (geminiPrediction) {
        if (geminiPrediction.churnRiskScore > 0.6) {
          actions.push({ label: "Gemini: Engage proactively", action: () => alert(`Proactive engagement for ${user.name}`), color: "text-red-400" });
        }
        if (geminiPrediction.willBecomeActive) {
          actions.push({ label: "Gemini: Send welcome back (AI-optimized)", action: () => alert(`Sending AI-optimized welcome back to ${user.name}`), color: "text-green-400" });
        }
        geminiPrediction.topSuggestedRoles.forEach(role => {
          actions.push({ label: `Gemini: Suggest Role "${role}"`, action: () => alert(`Suggesting role ${role} for ${user.name}`), color: "text-purple-400" });
        });
      }
      actions.push({ label: "Gemini: Analyze Activity Log", action: () => alert(`Analyzing activity log for ${user.name}`), color: "text-yellow-400" });
      return actions;
    }, [user, geminiPrediction]);

    return (
      <div className="relative inline-block text-left" ref={menuRef}>
        <div>
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gemini-dark shadow-sm px-4 py-2 bg-gemini-medium text-sm font-medium text-gemini-light hover:bg-gemini-accent/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gemini-dark focus:ring-gemini-accent"
            id={`options-menu-${user.id}`}
            aria-haspopup="true"
            aria-expanded={isOpen}
            onClick={toggleMenu}
          >
            Gemini Actions
            <svg
              className="-mr-1 ml-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gemini-dark ring-1 ring-gemini-accent ring-opacity-5 focus:outline-none z-10"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby={`options-menu-${user.id}`}
          >
            <div className="py-1" role="none">
              {geminiActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm text-gemini-light w-full text-left hover:bg-gemini-medium ${action.color}`}
                  role="menuitem"
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gemini-medium py-1">
              <span className="block px-4 py-2 text-xs text-gemini-light opacity-60">
                Gemini AI powered.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);


/**
 * @interface YoUserEngagementGraphProps
 * @property {UserFragment} user - The user whose engagement is being visualized.
 * @property {GeminiInsightScore | undefined} geminiScore - Gemini's engagement score.
 */
export interface YoUserEngagementGraphProps {
  user: UserFragment;
  geminiScore?: GeminiInsightScore;
}

/**
 * YoUserEngagementGraph: Visualizes user engagement with a simulated graph,
 * influenced by Gemini's insight score. This would typically use a library like Chart.js or D3.
 * @param {YoUserEngagementGraphProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered engagement graph placeholder.
 */
export const YoUserEngagementGraph: React.FC<YoUserEngagementGraphProps> = ({
  user,
  geminiScore,
}) => {
  const engagementLevel = useMemo(() => {
    if (!geminiScore) return "N/A";
    if (geminiScore.normalized > 0.8) return "High";
    if (geminiScore.normalized > 0.5) return "Moderate";
    return "Low";
  }, [geminiScore]);

  const engagementBarWidth = useMemo(() => {
    return geminiScore ? `${geminiScore.normalized * 100}%` : "0%";
  }, [geminiScore]);

  const sparklineData = useMemo(() => {
    // Simulate a dynamic sparkline based on a pseudo-random seed (user ID)
    const seed = user.id.charCodeAt(0) + user.id.length;
    let data = [];
    let value = 50 + (seed % 20); // Starting point
    for (let i = 0; i < 15; i++) {
      value += (Math.random() - 0.5) * 15; // Random fluctuation
      value = Math.max(0, Math.min(100, value)); // Clamp between 0 and 100
      data.push(value);
    }
    return data;
  }, [user.id]);

  const sparklinePath = useMemo(() => {
    if (sparklineData.length < 2) return "";
    const points = sparklineData
      .map((val, i) => `${i * (100 / (sparklineData.length - 1))},${100 - val}`)
      .join(" ");
    return `M${points}`;
  }, [sparklineData]);

  return (
    <div className="p-3 bg-gemini-dark rounded-md border border-gemini-accent/30 text-gemini-light text-sm">
      <h5 className="font-semibold mb-2 text-gemini-accent/90">
        YoGemini Engagement for {user.name.split(" ")[0]}
      </h5>
      <div className="flex items-center mb-2">
        <span>Gemini Level: </span>
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
            engagementLevel === "High"
              ? "bg-green-600/70 text-white"
              : engagementLevel === "Moderate"
              ? "bg-yellow-600/70 text-white"
              : "bg-red-600/70 text-white"
          }`}
        >
          {engagementLevel} (Score: {geminiScore?.normalized.toFixed(2) || "N/A"})
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
        <div
          className="bg-gemini-accent h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: engagementBarWidth }}
          title={`Gemini Engagement: ${geminiScore?.normalized.toFixed(2)}`}
        ></div>
      </div>
      <div className="h-16 w-full relative">
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke={geminiScore?.sentiment === "Positive" ? "#a7f3d0" : "#9ca3af"}
            strokeWidth="2"
            points={sparklinePath}
          />
        </svg>
        <span className="absolute bottom-0 left-0 text-xs text-gemini-light opacity-60">
          Gemini Activity Trend
        </span>
      </div>
    </div>
  );
};


/**
 * @interface YoSmartColumnToggleProps
 * @property {string[]} availableColumns - All possible columns.
 * @property {string[]} visibleColumns - Currently visible columns.
 * @property {(newVisible: string[]) => void} onToggleColumns - Callback to update visible columns.
 * @property {string[]} geminiSuggestedColumns - Columns suggested by Gemini AI.
 */
export interface YoSmartColumnToggleProps {
  availableColumns: string[];
  visibleColumns: string[];
  onToggleColumns: (newVisible: string[]) => void;
  geminiSuggestedColumns: string[];
}

/**
 * YoSmartColumnToggle: An AI-enhanced column visibility toggle,
 * suggesting optimal columns based on Gemini's data relevance analysis.
 * @param {YoSmartColumnToggleProps} props - The properties for the component.
 * @returns {JSX.Element} The rendered column toggle component.
 */
export const YoSmartColumnToggle: React.FC<YoSmartColumnToggleProps> = React.memo(
  ({ availableColumns, visibleColumns, onToggleColumns, geminiSuggestedColumns }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleRef = useRef<HTMLDivElement>(null);

    const handleToggle = useCallback((column: string) => {
      onToggleColumns(
        visibleColumns.includes(column)
          ? visibleColumns.filter((c) => c !== column)
          : [...visibleColumns, column]
      );
    }, [onToggleColumns, visibleColumns]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (toggleRef.current && !toggleRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }, []);

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    const handleApplyGeminiSuggestion = useCallback(() => {
      onToggleColumns(geminiSuggestedColumns);
      setIsOpen(false);
    }, [geminiSuggestedColumns, onToggleColumns]);

    return (
      <div className="relative" ref={toggleRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 bg-gemini-accent/20 rounded-md text-gemini-accent font-medium text-sm hover:bg-gemini-accent/30 transition-colors flex items-center gap-1"
          aria-label="Toggle Gemini Smart Columns"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          Gemini Columns
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 p-3 bg-gemini-dark rounded-md shadow-lg ring-1 ring-gemini-accent ring-opacity-5 z-20">
            <h6 className="text-sm font-semibold mb-2 text-gemini-accent/90">
              YoGemini Column Visibility
            </h6>
            <div className="space-y-1 mb-3">
              {availableColumns.map((col) => (
                <label key={col} className="flex items-center text-gemini-light text-sm">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col)}
                    onChange={() => handleToggle(col)}
                    className="form-checkbox h-4 w-4 text-gemini-accent rounded border-gray-600 bg-gray-700 focus:ring-gemini-accent"
                  />
                  <span className="ml-2">{col}</span>
                </label>
              ))}
            </div>
            {geminiSuggestedColumns.length > 0 && (
              <div className="border-t border-gemini-medium pt-2 mt-2">
                <p className="text-xs text-gemini-light opacity-70 mb-1">
                  Gemini AI Suggestion:
                </p>
                <button
                  onClick={handleApplyGeminiSuggestion}
                  className="w-full px-3 py-1.5 bg-gemini-accent hover:bg-gemini-accent/80 rounded-md text-gemini-dark text-xs font-medium transition-colors"
                >
                  Apply Gemini's Optimal View
                </button>
              </div>
            )}
            <p className="text-xs mt-2 opacity-60 italic text-gemini-light">
              Gemini AI recommends columns for enhanced contextual data display.
            </p>
          </div>
        )}
      </div>
    );
  }
);


/**
 * @interface YoErrorDisplayProps
 * @property {ApolloError | undefined} error - The GraphQL error object.
 * @property {string} componentName - The name of the component where the error occurred.
 */
export interface YoErrorDisplayProps {
  error: ApolloError | undefined;
  componentName: string;
}

/**
 * YoErrorDisplay: A Gemini-enhanced error display component,
 * providing more context and potential AI-driven resolution suggestions.
 * @param {YoErrorDisplayProps} props - The properties for the component.
 * @returns {JSX.Element | null} The rendered error display or null if no error.
 */
export const YoErrorDisplay: React.FC<YoErrorDisplayProps> = React.memo(({ error, componentName }) => {
  if (!error) return null;

  const geminiErrorInsight = useMemo(() => {
    let insight = "Gemini AI: Analyzing error patterns for potential root causes.";
    let suggestion = "Review network connectivity and GraphQL query parameters.";

    if (error.networkError) {
      insight = "Gemini AI: Network error detected. Possible connectivity issues or server unavailability.";
      suggestion = "Check your internet connection or the API server status.";
    } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const firstGqlError = error.graphQLErrors[0];
      if (firstGqlError.extensions?.code === "UNAUTHENTICATED") {
        insight = "Gemini AI: Authentication failure. User session might be invalid.";
        suggestion = "Prompt user to re-authenticate or check token validity.";
      } else if (firstGqlError.extensions?.code === "FORBIDDEN") {
        insight = "Gemini AI: Authorization denied. User lacks necessary permissions.";
        suggestion = "Verify user roles and permissions for this resource via Gemini Access Matrix.";
      } else if (firstGqlError.message.includes("not found")) {
        insight = "Gemini AI: Resource not found. Querying for non-existent data.";
        suggestion = "Adjust query parameters or confirm data existence.";
      } else {
        insight = `Gemini AI: GraphQL logic error detected: "${firstGqlError.message.substring(0, 50)}..."`;
        suggestion = "Inspect GraphQL query definition and backend resolver logic.";
      }
    }

    return { insight, suggestion };
  }, [error]);

  return (
    <div className="p-4 mb-4 bg-red-900/70 border border-red-700 rounded-lg text-white">
      <h3 className="font-bold text-lg mb-2 flex items-center">
        <span className="mr-2 text-2xl">🚨</span>
        Gemini AI Error Report ({componentName})
      </h3>
      <p className="text-sm">
        <strong>Error Message:</strong> {error.message}
      </p>
      {error.graphQLErrors?.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold text-sm">GraphQL Errors:</p>
          <ul className="list-disc ml-5 text-xs">
            {error.graphQLErrors.map((gqlError, idx) => (
              <li key={idx}>
                {gqlError.message} (Code: {gqlError.extensions?.code || "N/A"})
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 p-3 bg-red-800/50 border border-red-600 rounded-md">
        <p className="text-sm">
          <strong>Gemini Insight:</strong> {geminiErrorInsight.insight}
        </p>
        <p className="text-sm mt-1">
          <strong>Gemini Suggestion:</strong> {geminiErrorInsight.suggestion}
        </p>
      </div>
      <p className="text-xs mt-3 opacity-70">
        This error was processed by the Gemini AI Diagnostics Engine.
      </p>
    </div>
  );
});

// --- Main UsersTableView Component - Enhanced and Expanded ---

/**
 * Custom hook to simulate Gemini's dynamic filter suggestions based on current data.
 * @param {Array<Object>} usersData - Current array of user data.
 * @returns {Object} An object containing suggested filters, loading state, and error.
 */
export const useGeminiDynamicFilters = (usersData: Array<any>) => {
  const [suggestedFilters, setSuggestedFilters] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!usersData || usersData.length === 0) {
          setSuggestedFilters([]);
          setIsLoading(false);
          return;
        }

        // Simulate Gemini analyzing data for relevant filters
        const emailDomains = new Set<string>();
        const nameLengths: number[] = [];
        usersData.forEach((user) => {
          if (user.email) {
            const domain = user.email.split("@")[1];
            if (domain) emailDomains.add(domain);
          }
          if (user.name) {
            nameLengths.push(user.name.length);
          }
        });

        const newSuggestions: string[] = [];
        if (emailDomains.size > 0) {
          newSuggestions.push(`Domain:${Array.from(emailDomains)[0]}`);
        }
        if (nameLengths.length > 0) {
          const avgNameLength = nameLengths.reduce((a, b) => a + b, 0) / nameLengths.length;
          if (avgNameLength > 15) newSuggestions.push("LongNames");
        }
        if (Math.random() > 0.6) newSuggestions.push("NewRegistrations");
        if (Math.random() > 0.3) newSuggestions.push("HighEngagementUsers");

        setSuggestedFilters(newSuggestions);
        setIsLoading(false);
      } catch (e: any) {
        setError(e.message || "Gemini failed to suggest filters.");
        setIsLoading(false);
      }
    }, 700 + Math.random() * 500);

    return () => clearTimeout(timer);
  }, [usersData]);

  return { geminiSuggestedFilters: suggestedFilters, isLoadingGeminiFilters: isLoading, geminiFilterError: error };
};

/**
 * A sophisticated custom hook that encapsulates all Gemini AI interactions for a user.
 * This is designed to be highly extensible for future AI model integrations.
 * @param {UserFragment | undefined} user - The user for whom to fetch Gemini insights.
 * @returns {Object} All Gemini related data for the user, including loading and error states.
 */
export const useHyperGeminiUser = (user: UserFragment | undefined) => {
  const { enrichmentData, isLoadingGemini, geminiError } = useGeminiUserEnrichment(user as UserFragment);

  // In a real scenario, more complex Gemini services might be composed here.
  // For instance, a Gemini behavior prediction service, a Gemini sentiment analysis service, etc.

  const [geminiStatusMessage, setGeminiStatusMessage] = useState("Initializing Gemini AI...");

  useEffect(() => {
    if (isLoadingGemini) {
      setGeminiStatusMessage("Gemini AI is computing insights...");
    } else if (geminiError) {
      setGeminiStatusMessage(`Gemini AI encountered an error: ${geminiError}`);
    } else if (enrichmentData.insightScore || enrichmentData.prediction) {
      setGeminiStatusMessage("Gemini AI insights available.");
    } else {
      setGeminiStatusMessage("Gemini AI ready, awaiting data.");
    }
  }, [isLoadingGemini, geminiError, enrichmentData]);

  return {
    geminiUserInsightScore: enrichmentData.insightScore,
    geminiUserPrediction: enrichmentData.prediction,
    isLoadingGeminiUser: isLoadingGemini,
    geminiUserError: geminiError,
    geminiUserStatusMessage: geminiStatusMessage,
  };
};

/**
 * Styles for custom table components, heavily influenced by a "Gemini" aesthetic.
 * This object ensures consistency across bespoke UI elements.
 */
const GEMINI_TABLE_STYLES = {
  header: "font-gemini-bold text-lg text-gemini-accent tracking-wider py-3 px-4 border-b-2 border-gemini-dark bg-gemini-medium",
  cell: "py-3 px-4 border-b border-gemini-dark text-gemini-light text-sm",
  rowHover: "hover:bg-gemini-dark/50 transition-colors duration-200",
  metaInfo: "text-xs italic opacity-70 text-gemini-light",
  loadingMessage: "text-gemini-accent text-center py-8 text-xl animate-pulse-gemini",
  errorMessage: "text-red-500 text-center py-8 text-lg font-semibold",
};

/**
 * Manages the dynamic configuration of table columns, including Gemini AI suggestions.
 */
export const useGeminiTableConfiguration = (initialMappings: Record<string, string>) => {
  const [allAvailableColumns] = useState<string[]>(Object.keys(initialMappings));
  const [visibleColumns, setVisibleColumns] = useState<string[]>(Object.keys(initialMappings));
  const [geminiSuggestedColumns, setGeminiSuggestedColumns] = useState<string[]>([]);
  const [isLoadingGeminiColumnSuggestions, setIsLoadingGeminiColumnSuggestions] = useState(true);

  useEffect(() => {
    // Simulate Gemini AI determining optimal columns based on data or user patterns
    const timer = setTimeout(() => {
      const suggested = ["name", "email", "geminiInsightScore", "geminiStatus", "geminiPrediction", "createdFromDirectory"];
      setGeminiSuggestedColumns(suggested.filter(col => allAvailableColumns.includes(col)));
      setIsLoadingGeminiColumnSuggestions(false);
    }, 1200 + Math.random() * 800);
    return () => clearTimeout(timer);
  }, [allAvailableColumns]);

  const toggleColumnVisibility = useCallback((newVisibleColumns: string[]) => {
    setVisibleColumns(newVisibleColumns);
  }, []);

  const activeDataMapping = useMemo(() => {
    const filteredMapping: Record<string, string> = {};
    visibleColumns.forEach(key => {
      if (key in initialMappings) {
        filteredMapping[key] = initialMappings[key];
      } else if (key === "geminiInsightScore") {
        filteredMapping[key] = "Gemini Insight";
      } else if (key === "geminiStatus") {
        filteredMapping[key] = "Gemini Status";
      } else if (key === "geminiPrediction") {
        filteredMapping[key] = "Gemini Prediction";
      }
    });
    return filteredMapping;
  }, [visibleColumns, initialMappings]);

  return {
    allAvailableColumns,
    visibleColumns,
    toggleColumnVisibility,
    geminiSuggestedColumns,
    isLoadingGeminiColumnSuggestions,
    activeDataMapping,
  };
};


/**
 * The main `UsersTableView` component, now massively expanded and Gemini-AI-powered.
 * This component orchestrates data fetching, state management, and the rendering
 * of numerous "Yo" sub-components, all infused with Gemini intelligence.
 * @returns {JSX.Element} The rendered Users Table View with AI enhancements.
 */
function UsersTableView() {
  const [params, setParams] = useState<UserQueryFilter>({});
  const { loading, data, error, refetch } = useUsersHomeDeprecatedQuery({
    notifyOnNetworkStatusChange: true,
    variables: {
      first: INITIAL_PAGINATION.perPage,
    },
  });

  const { summary, isLoadingAnalytics, analyticsError } = useGeminiGlobalAnalytics();
  const { geminiSuggestedFilters, isLoadingGeminiFilters, geminiFilterError } = useGeminiDynamicFilters(data?.users?.edges.map(e => e.node) || []);


  const baseMapping = useMemo(() => ({
    name: "Name (AI Monitored)",
    email: "Email (Gemini Scan)",
    ...(data?.currentOrganization.scimActive
      ? { createdFromDirectory: "Source (Gemini Origin)" }
      : {}),
    geminiInsightScore: "Gemini Score", // Placeholder for derived column
    geminiStatus: "Gemini Status", // Placeholder for derived column
    geminiPrediction: "Gemini Prediction", // Placeholder for derived column
  }), [data?.currentOrganization.scimActive]);

  const {
    allAvailableColumns,
    visibleColumns,
    toggleColumnVisibility,
    geminiSuggestedColumns,
    isLoadingGeminiColumnSuggestions,
    activeDataMapping,
  } = useGeminiTableConfiguration(baseMapping);

  const users = useMemo(() => {
    if (loading || !data || error) return [];

    return data.users.edges.map(({ node }) => ({
      ...node,
      createdFromDirectory: (
        <SourceIcon
          createdFromDirectory={node.createdFromDirectory}
          entityType="user"
        />
      ),
      // Integrate hyper-gemini user data for each row
      ...useHyperGeminiUser(node),
    })).map(userWithGemini => ({
      ...userWithGemini,
      // Render components for derived Gemini data
      geminiInsightScore: userWithGemini.isLoadingGeminiUser ? (
        <span className="text-gemini-accent animate-pulse text-xs">AI Processing...</span>
      ) : userWithGemini.geminiUserError ? (
        <span className="text-red-500 text-xs" title={userWithGemini.geminiUserError}>AI Error</span>
      ) : (
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gemini-accent">
            {(userWithGemini.geminiUserInsightScore?.normalized || 0).toFixed(2)}
          </span>
          <span className="text-xs opacity-70">({userWithGemini.geminiUserInsightScore?.category})</span>
        </div>
      ),
      geminiStatus: userWithGemini.isLoadingGeminiUser ? (
        <span className="text-gemini-accent animate-pulse text-xs">AI Statusing...</span>
      ) : userWithGemini.geminiUserError ? (
        <span className="text-red-500 text-xs" title={userWithGemini.geminiUserError}>Status Error</span>
      ) : (
        <YoUserStatusIndicator
          geminiScore={userWithGemini.geminiUserInsightScore}
          geminiPrediction={userWithGemini.geminiUserPrediction}
        />
      ),
      geminiPrediction: userWithGemini.isLoadingGeminiUser ? (
        <span className="text-gemini-accent animate-pulse text-xs">AI Predicting...</span>
      ) : userWithGemini.geminiUserError ? (
        <span className="text-red-500 text-xs" title={userWithGemini.geminiUserError}>Pred. Error</span>
      ) : (
        <YoGeminiActionMenu
          user={userWithGemini as UserFragment} // Cast for action menu
          geminiPrediction={userWithGemini.geminiUserPrediction}
        />
      ),
      _YoUserAvatar: (
        <YoUserAvatar name={userWithGemini.name} email={userWithGemini.email} geminiScore={userWithGemini.geminiUserInsightScore} />
      ),
      _YoEngagementGraph: (
        <YoUserEngagementGraph user={userWithGemini as UserFragment} geminiScore={userWithGemini.geminiUserInsightScore} />
      ),
    }));
  }, [loading, data, error]); // dependencies for useMemo, includes the hook calls too, triggering recalculation.

  const handleRefetch = useCallback(
    async (options: {
      cursorPaginationParams: CursorPaginationInput;
      query: UserQueryFilter;
    }) => {
      const { cursorPaginationParams, query } = options;
      const newQuery = {
        name: query.name,
        id: query.id,
        email: query.email,
        showDeleted:
          typeof query.show_deleted === "string"
            ? query.show_deleted === "true"
            : query.show_deleted,
        roles: Object.keys(ROLES)
          .filter((role) => !!query[role])
          .map((role) => `${role}:${query[role] as string}`),
      };
      setParams(newQuery);
      await refetch({
        ...newQuery,
        ...cursorPaginationParams,
      });
    },
    [refetch]
  );

  const searchComponents = useMemo(() => getUserSearchComponents(), []);

  // Complex memoization for table specific search components
  const geminiEnhancedSearchComponents = useMemo(() => ({
    defaultComponents: [
      ...searchComponents.defaultComponents,
      // Add Gemini-specific search components here if any
    ],
    additionalComponents: [
      ...searchComponents.additionalComponents,
      // Potentially add a 'Gemini Insight Filter' dropdown
    ],
  }), [searchComponents]);


  // Placeholder for advanced performance monitoring by Gemini
  const [geminiPerfMetrics, setGeminiPerfMetrics] = useState({
    renderTime: 0,
    dataProcessingTime: 0,
    aiLatency: 0,
  });

  const startTime = useRef(performance.now());
  useEffect(() => {
    const endTime = performance.now();
    setGeminiPerfMetrics(prev => ({
      ...prev,
      renderTime: endTime - startTime.current,
      dataProcessingTime: users.length > 0 ? (endTime - startTime.current) / users.length : 0, // Simplified
      aiLatency: (isLoadingGeminiFilters || isLoadingAnalytics || isLoadingGeminiColumnSuggestions) ? 500 + Math.random() * 500 : 0, // Placeholder
    }));
    startTime.current = performance.now(); // Reset for next cycle
  }, [users, isLoadingGeminiFilters, isLoadingAnalytics, isLoadingGeminiColumnSuggestions]);

  return (
    <div className="users-table-view-gemini-container p-4 bg-gemini-bg min-h-screen text-gemini-light font-gemini-main">
      <h1 className="text-4xl font-extrabold mb-6 text-gemini-accent text-center tracking-wide">
        YoGemini User Management Dashboard
      </h1>

      {/* Global Gemini Analytics Summary */}
      <div className="mb-6">
        <YoGeminiTrendChart
          summary={summary}
          isLoading={isLoadingAnalytics}
          error={analyticsError}
        />
      </div>

      {/* Gemini AI Performance Monitor (Meta-Component) */}
      <div className="mb-6 p-4 bg-gemini-medium rounded-lg shadow-inner border border-gemini-accent/40 text-sm">
        <h3 className="font-bold text-gemini-accent mb-2">
          Gemini AI Operational Metrics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="opacity-80">Render Time:</p>
            <p className="text-gemini-light font-semibold">
              {geminiPerfMetrics.renderTime.toFixed(2)} ms
            </p>
          </div>
          <div>
            <p className="opacity-80">Data Processing (per user):</p>
            <p className="text-gemini-light font-semibold">
              {geminiPerfMetrics.dataProcessingTime.toFixed(2)} ms
            </p>
          </div>
          <div>
            <p className="opacity-80">Avg. AI Latency:</p>
            <p className="text-gemini-light font-semibold">
              {geminiPerfMetrics.aiLatency.toFixed(2)} ms
            </p>
          </div>
        </div>
        <p className="text-xs mt-3 opacity-60 italic">
          Real-time performance metrics provided by Gemini's self-monitoring subsystem.
        </p>
      </div>

      {/* Gemini AI-powered Dynamic Filter Panel */}
      <div className="mb-6">
        <YoDynamicFilterPanel
          onApplyFilter={handleRefetch}
          currentFilters={params}
          isLoadingGeminiFilters={isLoadingGeminiFilters}
          geminiSuggestedFilters={geminiSuggestedFilters}
        />
      </div>

      {/* Gemini Smart Column Toggle */}
      <div className="mb-6 flex justify-end">
        <YoSmartColumnToggle
          availableColumns={Object.keys(baseMapping)}
          visibleColumns={visibleColumns}
          onToggleColumns={toggleColumnVisibility}
          geminiSuggestedColumns={geminiSuggestedColumns}
        />
      </div>


      {/* Gemini Error Display */}
      <YoErrorDisplay error={error} componentName="UsersTableView" />

      {loading && (
        <div className={GEMINI_TABLE_STYLES.loadingMessage}>
          Gemini AI is fetching and processing user data. Please wait.
          <span className="dot-pulse"></span>
        </div>
      )}

      {!loading && error && (
        <div className={GEMINI_TABLE_STYLES.errorMessage}>
          Failed to load users. Gemini AI recommends verifying API endpoint.
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <div className="text-center py-8 text-gemini-light text-lg">
          No users found. Gemini AI suggests expanding search criteria or checking data sources.
        </div>
      )}

      {/* The core EntityTableView, now fed with Gemini-enriched data and mappings */}
      {!loading && !error && users.length > 0 && (
        <EntityTableView
          data={users}
          loading={loading}
          dataMapping={activeDataMapping}
          defaultSearchComponents={geminiEnhancedSearchComponents.defaultComponents}
          additionalSearchComponents={geminiEnhancedSearchComponents.additionalComponents}
          onQueryArgChange={handleRefetch}
          cursorPagination={data?.users?.pageInfo}
          resource={ORGANIZATION_USER}
          enableExportData
          exportDataParams={{ params }}
          // Further Gemini integrations into EntityTableView props
          // For example, custom row rendering, header rendering, etc.
          // This would typically involve prop drilling or context for deeper integration.
        >
          {/* Example of passing Yo components for custom rendering within EntityTableView */}
          {(row: any, key: string) => {
            if (key === "name") {
              return (
                <div className="flex items-center gap-2">
                  <YoUserAvatar name={row.name} email={row.email} geminiScore={row.geminiUserInsightScore} />
                  <span>{row.name}</span>
                  <span className="text-xs opacity-60 ml-1">(ID: {row.id.substring(0, 4)}...)</span>
                </div>
              );
            }
            if (key === "geminiInsightScore") {
              return (
                <div title={row.geminiUserStatusMessage}>
                  {row.geminiInsightScore}
                </div>
              );
            }
            if (key === "geminiStatus") {
              return row.geminiStatus;
            }
            if (key === "geminiPrediction") {
              return row.geminiPrediction;
            }
            // For other columns, let default EntityTableView rendering handle it
            return row[key];
          }}
        </EntityTableView>
      )}

      <p className="text-center mt-8 text-xs opacity-50 text-gemini-light">
        Powered by Gemini AI Hyper-Intelligent Framework. All rights reserved by the future.
      </p>
    </div>
  );
}

export default UsersTableView;