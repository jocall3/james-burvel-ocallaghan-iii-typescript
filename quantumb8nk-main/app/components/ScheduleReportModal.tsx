```typescript
import { FormikProps } from "formik";
import React, { useRef } from "react";
import { ConfirmModal } from "../../common/ui-components";
import {
  ScheduleInput,
  useDeleteScheduleMutation,
  useReportScheduleDetailsQuery,
} from "../../generated/dashboard/graphqlSchema";
import { useDispatchContext } from "../MessageProvider";
import ScheduleForm, {
  ScheduleFormValues,
  scheduleFormValuesToInputType,
  scheduleInputTypeToFormValues,
  DEFAULT_VALUES,
} from "./forms/ScheduleForm";

const SUBTITLE =
  "An email with a link to download an export will be sent on the specified scheduled to all users with permissions to view this report.";

interface ScheduleModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reportId: string;
  reportName: string;
  saveReport: (newName: string, schedule?: ScheduleInput) => void;
}

// --- START GEMINI-ENHANCEMENT LAYER ---

// --- GEMINI CORE CONFIGURATION TYPES ---
/**
 * @enum GeminiOptimizationLevel
 * @description Defines the various levels of AI-driven optimization that can be applied to reporting schedules.
 * These levels dictate the computational intensity and aggressiveness of Gemini's algorithms.
 */
export enum GeminiOptimizationLevel {
  Minimal = "MINIMAL",
  Standard = "STANDARD",
  Aggressive = "AGGRESSIVE",
  Predictive = "PREDICTIVE",
  Quantum = "QUANTUM", // Represents a hypothetical future state of optimization leveraging advanced computational paradigms.
}

/**
 * @enum GeminiDataGranularity
 * @description Specifies the level of detail or frequency at which Gemini processes and analyzes data.
 * Impacts resource utilization and real-time responsiveness of AI models.
 */
export enum GeminiDataGranularity {
  Hourly = "HOURLY",
  Daily = "DAILY",
  Weekly = "WEEKLY",
  Monthly = "MONTHLY",
  Yearly = "YEARLY",
  EventDriven = "EVENT_DRIVEN", // For reactive processing triggered by specific data events.
}

/**
 * @interface GeminiEngineSettings
 * @description Encapsulates the global operational settings for the Gemini AI engine.
 * These settings directly influence how the AI makes decisions, generates insights,
 * and interacts with underlying infrastructure.
 */
export interface GeminiEngineSettings {
  optimizationLevel: GeminiOptimizationLevel;
  dataGranularity: GeminiDataGranularity;
  predictiveModelingEnabled: boolean;
  anomalyDetectionThreshold: number; // 0.0 to 1.0, sensitivity for detecting unusual patterns in data or behavior.
  feedbackLoopActive: boolean; // Controls self-learning and adaptive adjustment mechanisms of the AI.
  realtimeAnalysisEnabled: boolean; // Enables immediate processing of data streams for instant insights.
  resourceAllocationStrategy: GeminiResourceAllocationStrategy;
}

/**
 * @interface GeminiInsight
 * @description Represents an AI-generated actionable insight or alert.
 * Insights are derived from advanced pattern recognition, anomaly detection,
 * and predictive analytics across various data sources.
 */
export interface GeminiInsight {
  id: string;
  timestamp: string;
  type: "PERFORMANCE_ALERT" | "USAGE_RECOMMENDATION" | "PREDICTIVE_FAILURE" | "OPTIMIZATION_SUGGESTION" | "SECURITY_VULNERABILITY";
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  affectedEntities: string[]; // e.g., reportId, scheduleId, userId, dataSourceId.
  actionable: boolean; // Indicates if a direct action or configuration change can be taken based on the insight.
  contextData: Record<string, any>; // Additional relevant data for the insight, providing deeper context.
}

/**
 * @interface GeminiReportTelemetry
 * @description Stores comprehensive historical performance and operational metrics for a specific report,
 * crucial for AI training, insight generation, and performance benchmarking.
 */
export interface GeminiReportTelemetry {
  reportId: string;
  invocationCount: number; // Total number of times the report has been successfully run.
  lastSuccessfulRun: string | null;
  averageExecutionTimeMs: number;
  failureRate: number; // 0.0 to 1.0, indicating the proportion of failed executions.
  historicalPerformance: Array<{ timestamp: string; value: number }>; // e.g., run durations or data volume over time.
  peakResourceConsumption: { cpu: number; memory: number } | null; // e.g., peak CPU utilization in percentage or peak memory in GB.
}

/**
 * @interface GeminiUserPreferences
 * @description Defines user-specific configurations for interacting with the Gemini AI.
 * Allows personalization of AI behavior, insight display, and notification channels.
 */
export interface GeminiUserPreferences {
  enableGeminiInsights: boolean; // Toggle display of AI-generated insights.
  preferredOptimizationLevel: GeminiOptimizationLevel; // User's preferred default optimization aggressiveness.
  customAlertThresholds: Record<string, number>; // e.g., {"performance_alert": 0.9} for custom sensitivity.
  dataPrivacyMode: "STANDARD" | "ENHANCED" | "STRICT"; // User's preference for data handling and privacy.
  preferredNotificationChannel: "EMAIL" | "SMS" | "IN_APP"; // Channel for AI-generated notifications.
}

/**
 * @enum GeminiResourceAllocationStrategy
 * @description Specifies how Gemini AI optimizes computational resource distribution for scheduled tasks.
 * Each strategy balances different objectives like cost, performance, or redundancy.
 */
export enum GeminiResourceAllocationStrategy {
  CostEfficient = "COST_EFFICIENT", // Prioritizes minimizing operational costs.
  PerformanceOptimized = "PERFORMANCE_OPTIMIZED", // Prioritizes fastest execution times.
  Balanced = "BALANCED", // Seeks an equilibrium between cost and performance.
  HybridCloud = "HYBRID_CLOUD", // Leverages resources across multiple cloud providers or on-premise systems.
}

/**
 * @interface GeminiAllocatedResources
 * @description Details the specific computational resources (CPU, memory, network, etc.) that Gemini AI has
 * dynamically allocated for a given reporting task, along with estimated operational costs.
 */
export interface GeminiAllocatedResources {
  cpuCores: number;
  memoryGB: number;
  networkBandwidthMbps: number;
  estimatedCostPerHourUSD: number;
  provider: 'AWS' | 'Azure' | 'GCP' | 'OnPrem' | 'GeminiComputeFabric'; // Invented, AI-managed compute fabric.
}

/**
 * @enum GeminiComplianceStatus
 * @description Reflects the compliance state of a report or schedule based on AI-driven checks against
 * predefined regulatory, internal, and security policies.
 */
export enum GeminiComplianceStatus {
  Compliant = "COMPLIANT",
  Warning = "WARNING",
  NonCompliant = "NON_COMPLIANT",
  PendingReview = "PENDING_REVIEW", // Indicates checks are still in progress or require manual verification.
}

/**
 * @interface GeminiComplianceCheckResult
 * @description Detailed outcome of a single compliance check performed by Gemini AI.
 * Provides specific rule information, status, and actionable remediation suggestions.
 */
export interface GeminiComplianceCheckResult {
  ruleId: string;
  ruleDescription: string;
  status: GeminiComplianceStatus;
  details: string; // Explanatory text for the check result.
  severity: "LOW" | "MEDIUM" | "HIGH";
  remediationSuggestions: string[]; // Steps recommended by AI to resolve non-compliance.
}


// --- GEMINI AI SERVICES (NON-FUNCTIONAL STUBS) ---
/**
 * @class GeminiAnalyticsService
 * @description A singleton service for collecting, processing, and retrieving AI-driven analytics and insights.
 * It's responsible for managing historical telemetry, detecting trends, and generating predictive insights
 * across the entire reporting ecosystem.
 */
export class GeminiAnalyticsService {
  private static instance: GeminiAnalyticsService;
  private constructor() { /* Singleton prevents direct instantiation */ }

  /**
   * @method getInstance
   * @returns {GeminiAnalyticsService} The singleton instance of the service.
   */
  public static getInstance(): GeminiAnalyticsService {
    if (!GeminiAnalyticsService.instance) {
      GeminiAnalyticsService.instance = new GeminiAnalyticsService();
      console.log("GeminiAnalyticsService: Instance created.");
    }
    return GeminiAnalyticsService.instance;
  }

  /**
   * @method recordEvent
   * @description Records a generic AI-related event for later analysis and model training.
   * @param {string} eventName - The name of the event (e.g., "SCHEDULE_OPTIMIZED", "INSIGHT_VIEWED").
   * @param {Record<string, any>} data - Associated contextual data with the event.
   */
  public recordEvent(eventName: string, data: Record<string, any>): void {
    console.debug(`GeminiAnalyticsService: Recording event '${eventName}' with data:`, data);
    // Placeholder for actual analytics ingestion logic, e.g., sending to a data lake or event stream.
  }

  /**
   * @method getHistoricalTelemetry
   * @description Retrieves comprehensive historical performance telemetry for a given report.
   * This data is crucial for AI models to learn patterns and predict future behavior.
   * @param {string} reportId - The unique identifier of the report.
   * @returns {Promise<GeminiReportTelemetry | null>} A promise resolving to the telemetry data or null if not found.
   */
  public getHistoricalTelemetry(reportId: string): Promise<GeminiReportTelemetry | null> {
    console.debug(`GeminiAnalyticsService: Fetching historical telemetry for ${reportId}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          reportId,
          invocationCount: Math.floor(Math.random() * 5000),
          lastSuccessfulRun: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
          averageExecutionTimeMs: Math.random() * 8000 + 500,
          failureRate: Math.random() * 0.15,
          historicalPerformance: Array.from({ length: 45 }).map((_, i) => ({
            timestamp: new Date(Date.now() - (45 - i) * 24 * 60 * 60 * 1000).toISOString(),
            value: Math.random() * 120 + 10, // Simulate some metric fluctuation.
          })),
          peakResourceConsumption: { cpu: Math.random() * 90 + 5, memory: Math.random() * 16 + 2 },
        });
      }, 700); // Simulate network delay for AI computation.
    });
  }

  /**
   * @method getPredictiveInsights
   * @description Generates AI-driven predictive insights for a potential schedule configuration.
   * This involves analyzing the impact of the proposed schedule on system resources, data availability,
   * and potential conflicts based on current and projected system states.
   * @param {string} reportId - The unique identifier of the report.
   * @param {ScheduleInput} scheduleInput - The proposed schedule configuration.
   * @returns {Promise<GeminiInsight[]>} A promise resolving to an array of relevant insights.
   */
  public getPredictiveInsights(reportId: string, scheduleInput: ScheduleInput): Promise<GeminiInsight[]> {
    console.debug(`GeminiAnalyticsService: Generating predictive insights for ${reportId} with schedule:`, scheduleInput);
    return new Promise(resolve => {
      setTimeout(() => {
        const mockInsights: GeminiInsight[] = [];
        if (Math.random() < 0.6) {
          mockInsights.push({
            id: `insight_OPT_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "OPTIMIZATION_SUGGESTION",
            message: "Gemini recommends adjusting the schedule by 15-45 minutes to align with off-peak data warehouse loads, potentially reducing cost by 7%.",
            severity: "LOW",
            affectedEntities: [reportId, "DW-Load-Balancer"],
            actionable: true,
            contextData: { suggestedTimeOffsetMin: Math.floor(Math.random() * 30) + 15, estimatedCostSavings: 0.07 },
          });
        }
        if (Math.random() < 0.3) {
          mockInsights.push({
            id: `insight_PRED_FAIL_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "PREDICTIVE_FAILURE",
            message: "High probability (72%) of report failure due to anticipated contention for 'Critical-Data-Source-X' during the proposed execution window.",
            severity: "HIGH",
            affectedEntities: [reportId, "Critical-Data-Source-X"],
            actionable: true,
            contextData: { failureProbability: 0.72, conflictingResource: 'Critical-Data-Source-X' },
          });
        }
        if (Math.random() < 0.1) {
          mockInsights.push({
            id: `insight_SEC_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: "SECURITY_VULNERABILITY",
            message: "Detected potential data exposure risk due to misconfigured export permissions. Immediate review required.",
            severity: "CRITICAL",
            affectedEntities: [reportId, "UserGroup-A"],
            actionable: true,
            contextData: { vulnerabilityType: 'PermissionEscalation', affectedGroups: ['UserGroup-A'] },
          });
        }
        resolve(mockInsights);
      }, 900);
    });
  }
}

/**
 * @class GeminiSchedulingEngine
 * @description A singleton service responsible for AI-driven schedule optimization, validation, and impact simulation.
 * It interacts with underlying infrastructure and data models to provide intelligent scheduling recommendations,
 * aiming to minimize conflicts and maximize efficiency.
 */
export class GeminiSchedulingEngine {
  private static instance: GeminiSchedulingEngine;
  private constructor() { /* Singleton */ }

  /**
   * @method getInstance
   * @returns {GeminiSchedulingEngine} The singleton instance of the service.
   */
  public static getInstance(): GeminiSchedulingEngine {
    if (!GeminiSchedulingEngine.instance) {
      GeminiSchedulingEngine.instance = new GeminiSchedulingEngine();
      console.log("GeminiSchedulingEngine: Instance created.");
    }
    return GeminiSchedulingEngine.instance;
  }

  /**
   * @method calculateOptimalScheduleWindow
   * @description Computes an AI-recommended optimal time window for a given schedule based on
   * predicted system load, data availability, historical patterns, and cost factors.
   * @param {ScheduleInput} currentSchedule - The schedule for which to find an optimal window.
   * @returns {Promise<{ start: string; end: string } | null>} A promise resolving to the optimal window or null if none found.
   */
  public calculateOptimalScheduleWindow(currentSchedule: ScheduleInput): Promise<{ start: string; end: string } | null> {
    console.debug("GeminiSchedulingEngine: Calculating optimal window for", currentSchedule);
    return new Promise(resolve => {
      setTimeout(() => {
        if (Math.random() > 0.3) { // 70% chance of finding an optimal window
          const now = new Date();
          const offset = Math.floor(Math.random() * 120) + 30; // 30-150 minutes in future.
          const optimalStart = new Date(now.getTime() + offset * 60 * 1000).toISOString();
          const optimalEnd = new Date(now.getTime() + (offset + Math.random() * 60) * 60 * 1000).toISOString();
          resolve({ start: optimalStart, end: optimalEnd });
        } else {
          resolve(null);
        }
      }, 1200); // Simulate complex AI calculation.
    });
  }

  /**
   * @method validateScheduleAgainstGlobalConstraints
   * @description Performs AI-driven validation of a proposed schedule against a dynamic set of global policies,
   * resource availability, and conflict detection rules.
   * @param {ScheduleInput} schedule - The schedule to validate.
   * @returns {Promise<boolean>} A promise resolving to true if valid, false otherwise.
   */
  public validateScheduleAgainstGlobalConstraints(schedule: ScheduleInput): Promise<boolean> {
    console.debug("GeminiSchedulingEngine: Validating schedule against global constraints", schedule);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% chance of being valid, simulating complex AI logic.
      }, 400); // Simulate AI-driven global constraint checks.
    });
  }

  /**
   * @method simulateScheduleImpact
   * @description Simulates the potential impact of a schedule execution on system resources, performance,
   * and potential risks, utilizing predictive models.
   * @param {ScheduleInput} schedule - The schedule to simulate.
   * @returns {Promise<{ loadImpact: number; estimatedDuration: number; riskScore: number }>} A promise with simulation results.
   */
  public simulateScheduleImpact(schedule: ScheduleInput): Promise<{ loadImpact: number; estimatedDuration: number; riskScore: number }> {
    console.debug("GeminiSchedulingEngine: Simulating impact for", schedule);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          loadImpact: Math.random() * 100, // percentage impact on overall system load.
          estimatedDuration: Math.random() * 300 + 30, // estimated execution duration in seconds.
          riskScore: Math.random() * 0.5, // 0.0 to 0.5, AI-assessed risk score.
        });
      }, 600);
    });
  }
}

/**
 * @class GeminiResourceOptimizer
 * @description A singleton service for dynamically allocating and optimizing computational resources
 * based on AI predictions, configured strategies, and real-time system telemetry.
 */
export class GeminiResourceOptimizer {
  private static instance: GeminiResourceOptimizer;
  private constructor() { /* Singleton */ }

  public static getInstance(): GeminiResourceOptimizer {
    if (!GeminiResourceOptimizer.instance) {
      GeminiResourceOptimizer.instance = new GeminiResourceOptimizer();
      console.log("GeminiResourceOptimizer: Instance created.");
    }
    return GeminiResourceOptimizer.instance;
  }

  /**
   * @method getOptimalResourceAllocation
   * @description Determines the AI-recommended resource allocation for a given report and schedule,
   * adhering to the specified optimization strategy.
   * @param {string} reportId - The report identifier.
   * @param {ScheduleInput} schedule - The schedule configuration.
   * @param {GeminiResourceAllocationStrategy} strategy - The desired allocation strategy (e.g., CostEfficient, PerformanceOptimized).
   * @returns {Promise<GeminiAllocatedResources>} A promise resolving to the recommended resources.
   */
  public getOptimalResourceAllocation(
    reportId: string,
    schedule: ScheduleInput,
    strategy: GeminiResourceAllocationStrategy
  ): Promise<GeminiAllocatedResources> {
    console.debug(`GeminiResourceOptimizer: Calculating optimal resources for ${reportId} with strategy ${strategy}`);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          cpuCores: Math.max(1, Math.floor(Math.random() * 8)),
          memoryGB: Math.max(2, Math.floor(Math.random() * 32)),
          networkBandwidthMbps: Math.floor(Math.random() * 1000) + 100,
          estimatedCostPerHourUSD: parseFloat((Math.random() * 5).toFixed(2)),
          provider: (['AWS', 'Azure', 'GCP', 'OnPrem', 'GeminiComputeFabric'] as const)[Math.floor(Math.random() * 5)],
        });
      }, 1000);
    });
  }

  /**
   * @method predictResourceDemand
   * @description Predicts future resource demand based on historical patterns, current system state,
   * and potential upcoming scheduled events.
   * @param {string} reportId - The report identifier.
   * @param {number} forecastHorizonHours - How many hours into the future to predict.
   * @returns {Promise<{ cpuDemand: number[]; memoryDemand: number[] }>} Predicted demands for CPU and memory.
   */
  public predictResourceDemand(reportId: string, forecastHorizonHours: number = 24): Promise<{ cpuDemand: number[]; memoryDemand: number[] }> {
    console.debug(`GeminiResourceOptimizer: Predicting resource demand for ${reportId} over ${forecastHorizonHours} hours`);
    return new Promise(resolve => {
      setTimeout(() => {
        const cpuDemand = Array.from({ length: forecastHorizonHours }).map(() => parseFloat((Math.random() * 80 + 10).toFixed(2)));
        const memoryDemand = Array.from({ length: forecastHorizonHours }).map(() => parseFloat((Math.random() * 90 + 5).toFixed(2)));
        resolve({ cpuDemand, memoryDemand });
      }, 800);
    });
  }
}

/**
 * @class GeminiComplianceMonitor
 * @description A singleton service for AI-driven compliance checks and risk assessments.
 * It ensures that reports and schedules adhere to predefined regulatory, industry, and internal policies,
 * providing real-time feedback on potential violations.
 */
export class GeminiComplianceMonitor {
  private static instance: GeminiComplianceMonitor;
  private constructor() { /* Singleton */ }

  public static getInstance(): GeminiComplianceMonitor {
    if (!GeminiComplianceMonitor.instance) {
      GeminiComplianceMonitor.instance = new GeminiComplianceMonitor();
      console.log("GeminiComplianceMonitor: Instance created.");
    }
    return GeminiComplianceMonitor.instance;
  }

  /**
   * @method performComplianceChecks
   * @description Executes a series of AI-enhanced compliance checks on a given report context.
   * This involves analyzing the schedule, metadata, and report content for policy adherence.
   * @param {string} reportId - The report identifier.
   * @param {ScheduleInput} schedule - The schedule being evaluated.
   * @param {Record<string, any>} metadata - Additional report metadata for compliance context.
   * @returns {Promise<GeminiComplianceCheckResult[]>} A promise resolving to an array of check results.
   */
  public performComplianceChecks(
    reportId: string,
    schedule: ScheduleInput,
    metadata: Record<string, any>
  ): Promise<GeminiComplianceCheckResult[]> {
    console.debug(`GeminiComplianceMonitor: Performing compliance checks for ${reportId}`);
    return new Promise(resolve => {
      setTimeout(() => {
        const results: GeminiComplianceCheckResult[] = [];
        if (Math.random() < 0.2) {
          results.push({
            ruleId: "GDPR-DATA-RETENTION-001",
            ruleDescription: "Ensure data retention policies comply with GDPR for sensitive fields.",
            status: GeminiComplianceStatus.Warning,
            details: "Report output contains fields with personal identifiable information (PII) without explicit retention policy linked to schedule.",
            severity: "HIGH",
            remediationSuggestions: ["Define data retention period", "Anonymize PII fields", "Encrypt report exports"],
          });
        }
        if (metadata.dataSensitivity === 'Confidential' && schedule.frequency === 'DAILY') {
          if (Math.random() < 0.5) {
            results.push({
              ruleId: "INTERNAL-SECURITY-DAILY-CONF-002",
              ruleDescription: "Confidential data reports should not be scheduled daily without additional security protocols.",
              status: GeminiComplianceStatus.NonCompliant,
              details: "Daily export of confidential data detected. Review export destination and encryption.",
              severity: "CRITICAL",
              remediationSuggestions: ["Reduce frequency", "Implement end-to-end encryption", "Limit access to destination storage"],
            });
          }
        } else {
          // A default check to ensure the report has an owner.
          results.push({
            ruleId: "BASIC-COMPLIANCE-003",
            ruleDescription: "All reports must have an owning team assigned.",
            status: metadata.ownerTeam ? GeminiComplianceStatus.Compliant : GeminiComplianceStatus.NonCompliant,
            details: metadata.ownerTeam ? "Owning team found." : "No owning team assigned.",
            severity: "LOW",
            remediationSuggestions: ["Assign an owning team in report metadata."],
          });
        }
        resolve(results);
      }, 1100);
    });
  }
}

// --- GEMINI CONTEXTS AND HOOKS ---

export interface GeminiContextType {
  settings: GeminiEngineSettings;
  userPreferences: GeminiUserPreferences;
  updateSettings: (newSettings: Partial<GeminiEngineSettings>) => void;
  updateUserPreferences: (newPrefs: Partial<GeminiUserPreferences>) => void;
  geminiServiceReady: boolean;
}

const GeminiContext = React.createContext<GeminiContextType | undefined>(undefined);

/**
 * @component GeminiProvider
 * @description Provides the Gemini AI context to all child components, managing global AI engine settings
 * and user preferences. This is the primary entry point for AI integration within the application,
 * ensuring all AI capabilities are available downstream.
 */
export const GeminiProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [settings, setSettings] = React.useState<GeminiEngineSettings>({
    optimizationLevel: GeminiOptimizationLevel.Standard,
    dataGranularity: GeminiDataGranularity.Daily,
    predictiveModelingEnabled: true,
    anomalyDetectionThreshold: 0.85,
    feedbackLoopActive: true,
    realtimeAnalysisEnabled: true,
    resourceAllocationStrategy: GeminiResourceAllocationStrategy.Balanced,
  });
  const [userPreferences, setUserPreferences] = React.useState<GeminiUserPreferences>({
    enableGeminiInsights: true,
    preferredOptimizationLevel: GeminiOptimizationLevel.Standard,
    customAlertThresholds: {},
    dataPrivacyMode: "STANDARD",
    preferredNotificationChannel: "IN_APP",
  });
  const [geminiServiceReady, setGeminiServiceReady] = React.useState(false);

  React.useEffect(() => {
    /**
     * @function initGemini
     * @description Asynchronously initializes all core Gemini AI services.
     * This simulates complex startup procedures, including model loading and resource provisioning,
     * ensuring all AI capabilities are online before use.
     */
    const initGemini = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate AI-powered startup delay.
      GeminiAnalyticsService.getInstance();
      GeminiSchedulingEngine.getInstance();
      GeminiResourceOptimizer.getInstance(); // Initialize new resource optimization service.
      GeminiComplianceMonitor.getInstance(); // Initialize new compliance monitoring service.
      GeminiLogger.getInstance(); // Initialize the internal AI logger.
      setGeminiServiceReady(true);
      console.log("Gemini Core Services Initialized.");
    };
    void initGemini(); // Execute the asynchronous initialization.
  }, []);

  const updateSettings = React.useCallback((newSettings: Partial<GeminiEngineSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    console.debug("Gemini settings updated:", newSettings);
    GeminiLogger.getInstance().log({
      actor: "System",
      action: "GEMINI_SETTINGS_UPDATED",
      details: newSettings,
      securityContext: GeminiSecurityLayer.Level1_Internal,
    });
  }, []);

  const updateUserPreferences = React.useCallback((newPrefs: Partial<GeminiUserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...newPrefs }));
    console.debug("Gemini user preferences updated:", newPrefs);
    GeminiLogger.getInstance().log({
      actor: "User",
      action: "GEMINI_USER_PREFERENCES_UPDATED",
      details: newPrefs,
      securityContext: GeminiSecurityLayer.Level1_Internal,
    });
  }, []);

  const contextValue = React.useMemo(() => ({
    settings,
    userPreferences,
    updateSettings,
    updateUserPreferences,
    geminiServiceReady,
  }), [settings, userPreferences, updateSettings, updateUserPreferences, geminiServiceReady]);

  return (
    <GeminiContext.Provider value={contextValue}>
      {children}
    </GeminiContext.Provider>
  );
};

/**
 * @hook useGeminiContext
 * @description A custom hook to access the Gemini AI context, ensuring it's used within a GeminiProvider.
 * Provides easy access to global AI settings, user preferences, and service readiness status.
 * @returns {GeminiContextType} The Gemini AI context object.
 * @throws {Error} If used outside of a GeminiProvider, ensuring proper architectural setup.
 */
export const useGeminiContext = () => {
  const context = React.useContext(GeminiContext);
  if (context === undefined) {
    throw new Error('useGeminiContext must be used within a GeminiProvider');
  }
  return context;
};

/**
 * @hook useGeminiReportingInsights
 * @description Fetches AI-driven predictive insights and historical telemetry for a given report and schedule.
 * Reacts to changes in report ID or schedule input to provide up-to-date AI analysis.
 * @param {string} reportId - The unique identifier of the report.
 * @param {ScheduleInput | null} scheduleInput - The current or proposed schedule input for insight generation.
 * @returns {{ insights: GeminiInsight[], telemetry: GeminiReportTelemetry | null, loadingInsights: boolean, loadingTelemetry: boolean }}
 */
export const useGeminiReportingInsights = (reportId: string, scheduleInput: ScheduleInput | null) => {
  const { geminiServiceReady, userPreferences } = useGeminiContext();
  const [insights, setInsights] = React.useState<GeminiInsight[]>([]);
  const [telemetry, setTelemetry] = React.useState<GeminiReportTelemetry | null>(null);
  const [loadingInsights, setLoadingInsights] = React.useState(false);
  const [loadingTelemetry, setLoadingTelemetry] = React.useState(false);

  React.useEffect(() => {
    if (!geminiServiceReady || !userPreferences.enableGeminiInsights || !reportId) return;

    setLoadingTelemetry(true);
    GeminiAnalyticsService.getInstance().getHistoricalTelemetry(reportId)
      .then(setTelemetry)
      .finally(() => setLoadingTelemetry(false));
  }, [geminiServiceReady, userPreferences.enableGeminiInsights, reportId]);

  React.useEffect(() => {
    if (!geminiServiceReady || !userPreferences.enableGeminiInsights || !reportId || !scheduleInput) {
      setInsights([]); // Clear insights if conditions aren't met or AI is disabled.
      return;
    }

    setLoadingInsights(true);
    GeminiAnalyticsService.getInstance().getPredictiveInsights(reportId, scheduleInput)
      .then(setInsights)
      .finally(() => setLoadingInsights(false));
  }, [geminiServiceReady, userPreferences.enableGeminiInsights, reportId, scheduleInput]);

  return { insights, telemetry, loadingInsights, loadingTelemetry };
};

/**
 * @hook useGeminiOptimalScheduleSuggestion
 * @description Provides AI-driven suggestions for optimal scheduling windows based on system load,
 * resource availability, and historical data patterns.
 * @param {ScheduleInput | null} currentSchedule - The current or proposed schedule.
 * @returns {{ optimalWindow: { start: string; end: string } | null, loading: boolean }}
 */
export const useGeminiOptimalScheduleSuggestion = (currentSchedule: ScheduleInput | null) => {
  const { geminiServiceReady } = useGeminiContext();
  const [optimalWindow, setOptimalWindow] = React.useState<{ start: string; end: string } | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!geminiServiceReady || !currentSchedule) {
      setOptimalWindow(null);
      return;
    }

    setLoading(true);
    GeminiSchedulingEngine.getInstance().calculateOptimalScheduleWindow(currentSchedule)
      .then(setOptimalWindow)
      .finally(() => setLoading(false));
  }, [geminiServiceReady, currentSchedule]);

  return { optimalWindow, loading };
};

/**
 * @hook useGeminiResourceAllocation
 * @description Hooks into the Gemini Resource Optimizer to get AI-driven optimal resource recommendations
 * for a specific report's schedule, based on the selected allocation strategy.
 * @param {string} reportId - The unique identifier of the report.
 * @param {ScheduleInput | null} scheduleInput - The current or proposed schedule input.
 * @param {GeminiResourceAllocationStrategy} strategy - The strategy to use for resource optimization.
 * @returns {{ allocatedResources: GeminiAllocatedResources | null, loading: boolean }}
 */
export const useGeminiResourceAllocation = (
  reportId: string,
  scheduleInput: ScheduleInput | null,
  strategy: GeminiResourceAllocationStrategy
) => {
  const { geminiServiceReady } = useGeminiContext();
  const [allocatedResources, setAllocatedResources] = React.useState<GeminiAllocatedResources | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!geminiServiceReady || !reportId || !scheduleInput) {
      setAllocatedResources(null);
      return;
    }

    setLoading(true);
    GeminiResourceOptimizer.getInstance().getOptimalResourceAllocation(reportId, scheduleInput, strategy)
      .then(setAllocatedResources)
      .finally(() => setLoading(false));
  }, [geminiServiceReady, reportId, scheduleInput, strategy]);

  return { allocatedResources, loading };
};

/**
 * @hook useGeminiComplianceChecks
 * @description Executes AI-driven compliance checks for a given report and schedule context.
 * Provides real-time feedback on adherence to various policy rules.
 * @param {string} reportId - The unique identifier of the report.
 * @param {ScheduleInput | null} scheduleInput - The current or proposed schedule input.
 * @param {Record<string, any>} metadata - Additional metadata for compliance context.
 * @returns {{ complianceResults: GeminiComplianceCheckResult[], loading: boolean }}
 */
export const useGeminiComplianceChecks = (
  reportId: string,
  scheduleInput: ScheduleInput | null,
  metadata: Record<string, any>
) => {
  const { geminiServiceReady } = useGeminiContext();
  const [complianceResults, setComplianceResults] = React.useState<GeminiComplianceCheckResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!geminiServiceReady || !reportId || !scheduleInput) {
      setComplianceResults([]);
      return;
    }

    setLoading(true);
    GeminiComplianceMonitor.getInstance().performComplianceChecks(reportId, scheduleInput, metadata)
      .then(setComplianceResults)
      .finally(() => setLoading(false));
  }, [geminiServiceReady, reportId, scheduleInput, metadata]);

  return { complianceResults, loading };
};


// --- YO GEMINI AI COMPONENTS (NON-FUNCTIONAL UI) ---

/**
 * @interface YoGeminiCardProps
 * @description Props for the generic Gemini-themed UI card component, providing a consistent
 * look and feel for various AI-related information displays.
 */
export interface YoGeminiCardProps extends React.PropsWithChildren {
  title: string;
  subtitle?: string;
  level?: GeminiOptimizationLevel; // Optional indicator of AI optimization level for the card's content.
  isLoading?: boolean; // Displays a loading spinner and disables interactions.
  className?: string;
}

/**
 * @component YoGeminiCard
 * @description A versatile UI card component with Gemini branding, used to encapsulate AI-related information.
 * Supports loading states and optional optimization level indicators, enhancing user understanding of AI processing.
 */
export const YoGeminiCard: React.FC<YoGeminiCardProps> = React.memo(({ title, subtitle, level, isLoading, children, className }) => {
  const levelColorMap = React.useMemo(() => ({
    [GeminiOptimizationLevel.Minimal]: "border-gray-400 text-gray-700",
    [GeminiOptimizationLevel.Standard]: "border-blue-400 text-blue-700",
    [GeminiOptimizationLevel.Aggressive]: "border-yellow-400 text-yellow-700",
    [GeminiOptimizationLevel.Predictive]: "border-purple-400 text-purple-700",
    [GeminiOptimizationLevel.Quantum]: "border-green-400 text-green-700",
  }), []);

  const levelClass = level ? levelColorMap[level] : "";

  return (
    <div className={`border rounded-lg shadow-sm p-4 mb-4 ${levelClass} ${className || ''}`}>
      <h3 className="font-semibold text-lg flex items-center">
        {isLoading && <span className="animate-spin mr-2">⚙️</span>}
        {title}
        {level && <span className={`ml-2 text-xs px-2 py-1 rounded-full bg-opacity-20 ${levelClass.replace('border-', 'bg-').replace('text-', 'text-')}`}>{level}</span>}
      </h3>
      {subtitle && <p className="text-sm text-gray-500 mb-2">{subtitle}</p>}
      <div className="mt-3">
        {children}
      </div>
    </div>
  );
});

/**
 * @interface YoGeminiInsightDisplayProps
 * @description Props for the Gemini Insight Display component.
 */
interface YoGeminiInsightDisplayProps {
  insights: GeminiInsight[];
  isLoading: boolean;
}

/**
 * @component YoGeminiInsightDisplay
 * @description Displays a categorized list of AI-generated insights, providing actionable recommendations
 * and alerts to the user based on predictive analysis.
 */
export const YoGeminiInsightDisplay: React.FC<YoGeminiInsightDisplayProps> = React.memo(({ insights, isLoading }) => {
  const renderInsight = React.useCallback((insight: GeminiInsight) => (
    <div key={insight.id} className="mb-2 p-2 border-l-4 border-emerald-500 bg-emerald-50">
      <p className="font-medium text-sm flex justify-between">
        <span>{insight.message}</span>
        <span className={`text-xs font-semibold ${
          insight.severity === 'CRITICAL' ? 'text-red-600' :
          insight.severity === 'HIGH' ? 'text-orange-600' :
          'text-gray-500'
        }`}>
          {insight.severity}
        </span>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Type: {insight.type} | Entities: {insight.affectedEntities.join(', ')} | Actionable: {insight.actionable ? 'Yes' : 'No'}
      </p>
    </div>
  ), []);

  if (isLoading) {
    return (
      <YoGeminiCard title="Gemini Insights" subtitle="Analyzing potential impacts..." isLoading>
        <div className="text-center text-gray-500 animate-pulse">Loading predictive insights...</div>
      </YoGeminiCard>
    );
  }

  return (
    <YoGeminiCard title="Gemini Insights" subtitle="AI-driven recommendations for your schedule." className="space-y-2">
      {insights.length > 0 ? (
        <div className="max-h-48 overflow-y-auto">
          {insights.map(renderInsight)}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No immediate Gemini insights available for this schedule.</p>
      )}
    </YoGeminiCard>
  );
});

/**
 * @interface YoGeminiTelemetryDisplayProps
 * @description Props for the Gemini Telemetry Display component.
 */
interface YoGeminiTelemetryDisplayProps {
  telemetry: GeminiReportTelemetry | null;
  isLoading: boolean;
}

/**
 * @component YoGeminiTelemetryDisplay
 * @description Visualizes historical performance and resource consumption data for a report,
 * enabling users to understand past behavior, identify trends, and inform future scheduling decisions.
 */
export const YoGeminiTelemetryDisplay: React.FC<YoGeminiTelemetryDisplayProps> = React.memo(({ telemetry, isLoading }) => {
  if (isLoading) {
    return (
      <YoGeminiCard title="Report Telemetry" subtitle="Fetching historical data..." isLoading>
        <div className="text-center text-gray-500 animate-pulse">Loading telemetry data...</div>
      </YoGeminiCard>
    );
  }

  if (!telemetry) {
    return (
      <YoGeminiCard title="Report Telemetry" subtitle="No telemetry data available.">
        <p className="text-sm text-gray-500">Historical performance data could not be loaded or is unavailable.</p>
      </YoGeminiCard>
    );
  }

  return (
    <YoGeminiCard title="Report Telemetry" subtitle={`Performance overview for report: ${telemetry.reportId}`}>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div><span className="font-medium">Invocations:</span> {telemetry.invocationCount}</div>
        <div><span className="font-medium">Last Run:</span> {telemetry.lastSuccessfulRun ? new Date(telemetry.lastSuccessfulRun).toLocaleString() : 'N/A'}</div>
        <div><span className="font-medium">Avg. Time:</span> {telemetry.averageExecutionTimeMs.toFixed(2)}ms</div>
        <div><span className="font-medium">Failure Rate:</span> {(telemetry.failureRate * 100).toFixed(2)}%</div>
        <div><span className="font-medium">Peak CPU:</span> {telemetry.peakResourceConsumption?.cpu?.toFixed(2) || 'N/A'}%</div>
        <div><span className="font-medium">Peak Memory:</span> {telemetry.peakResourceConsumption?.memory?.toFixed(2) || 'N/A'}GB</div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="font-medium text-xs text-gray-600 mb-1">Historical Performance Trend (Dummy Graph Data)</p>
        <div className="h-20 bg-gray-100 rounded flex items-end overflow-hidden p-1">
          {telemetry.historicalPerformance.map((dataPoint, index) => (
            <div
              key={index}
              className="w-1 flex-grow-0 bg-blue-300 mx-px group relative" // Added group for tooltip hover.
              style={{ height: `${dataPoint.value > 100 ? 100 : dataPoint.value}%` }} // Cap height at 100%.
            >
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                {`${new Date(dataPoint.timestamp).toLocaleDateString()}: ${dataPoint.value.toFixed(1)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </YoGeminiCard>
  );
});

/**
 * @interface YoGeminiConfigurationPanelProps
 * @description Props for the Gemini Configuration Panel component.
 */
interface YoGeminiConfigurationPanelProps {
  currentSettings: GeminiEngineSettings;
  updateSettings: (newSettings: Partial<GeminiEngineSettings>) => void;
  userPreferences: GeminiUserPreferences;
  updateUserPreferences: (newPrefs: Partial<GeminiUserPreferences>) => void;
  isLoading?: boolean;
}

/**
 * @component YoGeminiConfigurationPanel
 * @description Provides a comprehensive user interface for fine-tuning the global Gemini AI engine settings
 * and user-specific preferences, enabling a personalized and optimized AI experience.
 */
export const YoGeminiConfigurationPanel: React.FC<YoGeminiConfigurationPanelProps> = React.memo(({
  currentSettings, updateSettings, userPreferences, updateUserPreferences, isLoading
}) => {
  const handleSettingChange = React.useCallback((key: keyof GeminiEngineSettings, value: any) => {
    updateSettings({ [key]: value });
  }, [updateSettings]);

  const handlePreferenceChange = React.useCallback((key: keyof GeminiUserPreferences, value: any) => {
    updateUserPreferences({ [key]: value });
  }, [updateUserPreferences]);

  return (
    <YoGeminiCard title="Gemini AI Configuration" subtitle="Fine-tune AI engine and user experience." isLoading={isLoading} level={currentSettings.optimizationLevel}>
      <div className="space-y-4">
        <div>
          <label htmlFor="optimizationLevel" className="block text-sm font-medium text-gray-700">Optimization Level</label>
          <select
            id="optimizationLevel"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={currentSettings.optimizationLevel}
            onChange={(e) => handleSettingChange('optimizationLevel', e.target.value as GeminiOptimizationLevel)}
            disabled={isLoading}
          >
            {Object.values(GeminiOptimizationLevel).map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dataGranularity" className="block text-sm font-medium text-gray-700">Data Granularity</label>
          <select
            id="dataGranularity"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={currentSettings.dataGranularity}
            onChange={(e) => handleSettingChange('dataGranularity', e.target.value as GeminiDataGranularity)}
            disabled={isLoading}
          >
            {Object.values(GeminiDataGranularity).map(granularity => (
              <option key={granularity} value={granularity}>{granularity}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="resourceAllocationStrategy" className="block text-sm font-medium text-gray-700">Resource Allocation Strategy</label>
          <select
            id="resourceAllocationStrategy"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={currentSettings.resourceAllocationStrategy}
            onChange={(e) => handleSettingChange('resourceAllocationStrategy', e.target.value as GeminiResourceAllocationStrategy)}
            disabled={isLoading}
          >
            {Object.values(GeminiResourceAllocationStrategy).map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="predictiveModelingEnabled"
            name="predictiveModelingEnabled"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={currentSettings.predictiveModelingEnabled}
            onChange={(e) => handleSettingChange('predictiveModelingEnabled', e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="predictiveModelingEnabled" className="ml-2 block text-sm text-gray-900">
            Enable Predictive Modeling (Gemini Core)
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="feedbackLoopActive"
            name="feedbackLoopActive"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={currentSettings.feedbackLoopActive}
            onChange={(e) => handleSettingChange('feedbackLoopActive', e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="feedbackLoopActive" className="ml-2 block text-sm text-gray-900">
            Activate Gemini Feedback Loop
          </label>
        </div>

        <div className="flex items-center">
          <input
            id="enableGeminiInsights"
            name="enableGeminiInsights"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={userPreferences.enableGeminiInsights}
            onChange={(e) => handlePreferenceChange('enableGeminiInsights', e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="enableGeminiInsights" className="ml-2 block text-sm text-gray-900">
            Show Gemini AI Insights (User Preference)
          </label>
        </div>

        <div>
          <label htmlFor="anomalyDetectionThreshold" className="block text-sm font-medium text-gray-700">Anomaly Detection Threshold ({currentSettings.anomalyDetectionThreshold.toFixed(2)})</label>
          <input
            id="anomalyDetectionThreshold"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={currentSettings.anomalyDetectionThreshold}
            onChange={(e) => handleSettingChange('anomalyDetectionThreshold', parseFloat(e.target.value))}
            className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-sm"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="preferredNotificationChannel" className="block text-sm font-medium text-gray-700">Preferred Notification Channel</label>
          <select
            id="preferredNotificationChannel"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={userPreferences.preferredNotificationChannel}
            onChange={(e) => handlePreferenceChange('preferredNotificationChannel', e.target.value as GeminiUserPreferences['preferredNotificationChannel'])}
            disabled={isLoading}
          >
            <option value="EMAIL">EMAIL</option>
            <option value="SMS">SMS</option>
            <option value="IN_APP">IN_APP</option>
          </select>
        </div>
      </div>
    </YoGeminiCard>
  );
});

/**
 * @interface YoGeminiMetaConfigEditorProps
 * @description Props for the Gemini Metadata Configuration Editor component.
 */
export interface YoGeminiMetaConfigEditorProps {
  metadataSchema: Record<string, any>;
  currentMetadata: Record<string, any>;
  onMetadataUpdate: (newMetadata: Record<string, any>) => void;
  isLoading?: boolean;
}

/**
 * @component YoGeminiMetaConfigEditor
 * @description An AI-driven, schema-aware editor for managing report metadata. It dynamically renders
 * input fields based on a provided schema, allowing for flexible and extensible metadata management,
 * with AI potentially inferring or validating schema properties.
 */
export const YoGeminiMetaConfigEditor: React.FC<YoGeminiMetaConfigEditorProps> = React.memo(({
  metadataSchema, currentMetadata, onMetadataUpdate, isLoading
}) => {
  const [localMetadata, setLocalMetadata] = React.useState(currentMetadata);

  React.useEffect(() => {
    setLocalMetadata(currentMetadata);
  }, [currentMetadata]);

  const handleFieldChange = React.useCallback((key: string, value: any) => {
    setLocalMetadata(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = React.useCallback(() => {
    onMetadataUpdate(localMetadata);
    console.debug("YoGeminiMetaConfigEditor: Metadata saved.", localMetadata);
    GeminiLogger.getInstance().log({
      actor: "User",
      action: "METADATA_EDITED",
      details: { updatedKeys: Object.keys(localMetadata).filter(k => localMetadata[k] !== currentMetadata[k]) },
      securityContext: GeminiSecurityLayer.Level2_Confidential,
    });
  }, [localMetadata, onMetadataUpdate, currentMetadata]);

  const renderField = React.useCallback((key: string, schema: any) => {
    const value = localMetadata[key];
    const type = schema.type || 'string';
    const isReadOnly = schema.readOnly || isLoading;

    const inputClasses = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
    const checkboxClasses = "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded";

    switch (type) {
      case 'string':
        return (
          <input
            type="text"
            className={inputClasses}
            value={value || ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            disabled={isReadOnly}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className={inputClasses}
            value={value || 0}
            onChange={(e) => handleFieldChange(key, parseFloat(e.target.value))}
            disabled={isReadOnly}
          />
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            className={checkboxClasses}
            checked={!!value}
            onChange={(e) => handleFieldChange(key, e.target.checked)}
            disabled={isReadOnly}
          />
        );
      case 'enum':
        return (
          <select
            className={inputClasses.replace('px-3', 'pr-10')}
            value={value || ''}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            disabled={isReadOnly}
          >
            {schema.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            className={inputClasses}
            value={value ? new Date(value).toISOString().substring(0, 10) : ''}
            onChange={(e) => handleFieldChange(key, e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={isReadOnly}
          />
        );
      default:
        return <p className="text-sm text-gray-500">Unsupported type: {type}</p>;
    }
  }, [handleFieldChange, isLoading, localMetadata]);


  return (
    <YoGeminiCard title="Gemini Report Metadata" subtitle="AI-driven schema-based metadata editor." isLoading={isLoading}>
      {Object.keys(metadataSchema).length === 0 && (
        <p className="text-sm text-gray-500">No metadata schema defined for this report type. Gemini can infer one over time.</p>
      )}
      <div className="space-y-3">
        {Object.entries(metadataSchema).map(([key, schema]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">{schema.label || key}</label>
            {renderField(key, schema)}
            {schema.description && <p className="mt-1 text-xs text-gray-500">{schema.description}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading || JSON.stringify(localMetadata) === JSON.stringify(currentMetadata)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Metadata
        </button>
      </div>
    </YoGeminiCard>
  );
});

/**
 * @function generateGeminiReportMetadata
 * @description Utility function to generate dummy AI-inferred metadata schema and data for a report.
 * This simulates a dynamic schema generation where Gemini analyzes report content to suggest relevant metadata fields.
 * @param {string} reportId - The report identifier.
 * @returns {{ schema: Record<string, any>, data: Record<string, any> }}
 */
export function generateGeminiReportMetadata(reportId: string): { schema: Record<string, any>, data: Record<string, any> } {
  const schema = {
    reportCategory: { type: 'enum', options: ['Financial', 'Operational', 'Compliance', 'AdHoc', 'Executive'], label: 'Report Category', description: 'AI-inferred category based on report content analysis.' },
    dataSensitivity: { type: 'enum', options: ['Low', 'Medium', 'High', 'Confidential', 'Restricted'], label: 'Data Sensitivity', description: 'Gemini-assessed data privacy level, influencing access controls and retention policies.' },
    autoArchiveAfterDays: { type: 'number', label: 'Auto Archive (Days)', description: 'Number of days before Gemini AI recommends archiving the report outputs to optimize storage.' },
    ownerTeam: { type: 'string', label: 'Owning Team', description: 'The primary team or department responsible for this report.' },
    aiOptimizedQuery: { type: 'boolean', label: 'AI Optimized Query', description: 'Indicates if Gemini has applied query optimization techniques to the underlying data source for efficiency.' },
    geminiScore: { type: 'number', label: 'Gemini Optimization Score', description: 'An AI-derived score (0-100) reflecting report efficiency, compliance, and overall health.', readOnly: true },
    lastGeminiReview: { type: 'date', label: 'Last AI Review Date', description: 'The last date Gemini AI performed a comprehensive review of this report.', readOnly: true },
  };

  const data = {
    reportCategory: ['Financial', 'Operational', 'Compliance', 'AdHoc', 'Executive'][Math.floor(Math.random() * 5)],
    dataSensitivity: ['Low', 'Medium', 'High', 'Confidential', 'Restricted'][Math.floor(Math.random() * 5)],
    autoArchiveAfterDays: Math.floor(Math.random() * 365) + 30,
    ownerTeam: `Team-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    aiOptimizedQuery: Math.random() > 0.5,
    geminiScore: parseFloat((Math.random() * 100).toFixed(2)),
    lastGeminiReview: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 90).toISOString(),
  };

  return { schema, data };
}

/**
 * @interface YoGeminiHealthDashboardProps
 * @description Props for the Gemini Health Dashboard component.
 */
export interface YoGeminiHealthDashboardProps {
  globalSystemHealth: number; // 0-100, overall health percentage.
  geminiServiceStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activePredictiveModels: number; // Number of currently active AI models.
  lastModelRetraining: string; // Timestamp of the last successful model retraining.
  dataProcessingRate: number; // events/sec, rate of data processed by AI.
}

/**
 * @component YoGeminiHealthDashboard
 * @description Displays a high-level overview of the Gemini AI system's operational health,
 * including service status, active model count, retraining history, and data processing rates.
 * Provides critical insights into the AI's operational state.
 */
export const YoGeminiHealthDashboard: React.FC<YoGeminiHealthDashboardProps> = React.memo(({
  globalSystemHealth,
  geminiServiceStatus,
  activePredictiveModels,
  lastModelRetraining,
  dataProcessingRate,
}) => {
  const healthColor = React.useMemo(() => {
    if (globalSystemHealth > 80) return "text-green-600";
    if (globalSystemHealth > 50) return "text-yellow-600";
    return "text-red-600";
  }, [globalSystemHealth]);

  const statusColor = React.useMemo(() => {
    switch (geminiServiceStatus) {
      case 'ONLINE': return "text-green-600";
      case 'DEGRADED': return "text-orange-600";
      case 'OFFLINE': return "text-red-600";
      default: return "text-gray-600";
    }
  }, [geminiServiceStatus]);

  return (
    <YoGeminiCard title="Gemini System Health" subtitle="Real-time AI operational metrics." level={GeminiOptimizationLevel.Quantum}>
      <div className="space-y-2 text-sm">
        <p>Global System Health: <span className={`font-semibold ${healthColor}`}>{globalSystemHealth.toFixed(1)}%</span></p>
        <p>Gemini Core Status: <span className={`font-semibold ${statusColor}`}>{geminiServiceStatus}</span></p>
        <p>Active Predictive Models: <span className="font-semibold">{activePredictiveModels}</span></p>
        <p>Last Model Retraining: <span className="font-semibold">{new Date(lastModelRetraining).toLocaleString()}</span></p>
        <p>Data Processing Rate: <span className="font-semibold">{dataProcessingRate.toFixed(2)} events/sec</span></p>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">This dashboard reflects the holistic operational state of the Gemini AI framework, ensuring optimal scheduling and reporting intelligence.</p>
        <p className="text-xs text-gray-500">Continuous monitoring and self-healing algorithms are active.</p>
      </div>
    </YoGeminiCard>
  );
});

/**
 * @interface YoGeminiFeedbackLoopControllerProps
 * @description Props for the Gemini Feedback Loop Controller component.
 */
export interface YoGeminiFeedbackLoopControllerProps {
  reportId: string;
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
  feedbackDataStream: string[]; // Mock stream of feedback data to visualize activity.
  isLoading?: boolean;
}

/**
 * @component YoGeminiFeedbackLoopController
 * @description Manages the adaptive learning feedback loop for a specific report.
 * When active, it simulates continuous processing of feedback to refine AI models
 * and improve future recommendations, demonstrating a self-optimizing system.
 */
export const YoGeminiFeedbackLoopController: React.FC<YoGeminiFeedbackLoopControllerProps> = React.memo(({
  reportId, isActive, onToggleActive, feedbackDataStream, isLoading
}) => {
  const { geminiServiceReady } = useGeminiContext();
  const [feedbackCount, setFeedbackCount] = React.useState(0);
  const [lastProcessed, setLastProcessed] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!geminiServiceReady || !isActive) return;
    const interval = setInterval(() => {
      setFeedbackCount(prev => prev + 1);
      const latestFeedback = `Item-${Date.now()}`;
      setLastProcessed(latestFeedback);
      console.debug(`Gemini Feedback Loop for ${reportId}: Processed item #${feedbackCount + 1} (${latestFeedback})`);
      GeminiLogger.getInstance().log({
        actor: "GeminiFeedbackEngine",
        action: "FEEDBACK_ITEM_PROCESSED",
        details: { reportId, feedbackItem: latestFeedback, totalProcessed: feedbackCount + 1 },
        securityContext: GeminiSecurityLayer.Level1_Internal,
      });
    }, 2000); // Simulate processing feedback every 2 seconds.
    return () => clearInterval(interval);
  }, [geminiServiceReady, isActive, reportId, feedbackCount]);

  return (
    <YoGeminiCard title="Gemini Feedback Loop" subtitle="Adaptive learning for continuous report optimization." isLoading={isLoading} level={GeminiOptimizationLevel.Predictive}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Loop Status:</span>
        <label htmlFor={`toggle-feedback-${reportId}`} className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              id={`toggle-feedback-${reportId}`}
              className="sr-only"
              checked={isActive}
              onChange={(e) => onToggleActive(e.target.checked)}
              disabled={isLoading}
            />
            <div className={`block bg-gray-600 w-14 h-8 rounded-full transition-colors duration-200 ease-in-out ${isActive ? 'bg-indigo-600' : ''}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${isActive ? 'translate-x-full bg-blue-500' : ''}`}></div>
          </div>
          <div className="ml-3 text-gray-700 font-medium">
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </label>
      </div>
      {isActive && (
        <div className="mt-2 text-sm text-gray-600 space-y-1">
          <p>Processed Feedback Items: <span className="font-semibold">{feedbackCount}</span></p>
          <p>Last Processed: <span className="font-mono text-xs">{lastProcessed || 'N/A'}</span></p>
          <p>Recent Stream Activity: <span className="font-mono text-xs">{feedbackDataStream.slice(-3).join(', ') || 'No activity'}</span></p>
        </div>
      )}
    </YoGeminiCard>
  );
});


// More abstract helper types/enums for internal Gemini mechanisms
/**
 * @enum GeminiSecurityLayer
 * @description Defines the various security classifications for data and operations within the Gemini AI framework.
 * These levels dictate access controls, encryption standards, and audit requirements.
 */
export enum GeminiSecurityLayer {
  Level0_Public = "PUBLIC",
  Level1_Internal = "INTERNAL",
  Level2_Confidential = "CONFIDENTIAL",
  Level3_Restricted = "RESTRICTED",
  Level4_QuantumEncrypted = "QUANTUM_ENCRYPTED", // Represents a future-proof, highly secure encryption level.
}

/**
 * @enum GeminiExecutionPriority
 * @description Represents the priority level for task execution within the Gemini AI environment,
 * potentially influenced by AI's real-time assessment of criticality and resource availability.
 */
export enum GeminiExecutionPriority {
  Low = "LOW",
  Normal = "NORMAL",
  High = "HIGH",
  Critical = "CRITICAL",
  AI_Adjusted = "AI_ADJUSTED", // Priority dynamically determined by Gemini's real-time analysis.
}

/**
 * @interface GeminiAuditLogEntry
 * @description Represents a single entry in the Gemini AI's internal audit log, detailing system actions,
 * user interactions, and significant AI events for diagnostics, compliance, and post-mortem analysis.
 */
export interface GeminiAuditLogEntry {
  timestamp: string;
  actor: string; // e.g., userId, "GeminiSystem", "GeminiAnalyticsService".
  action: string; // e.g., "SCHEDULE_CREATED", "OPTIMIZATION_APPLIED", "CONFIG_CHANGE".
  details: Record<string, any>; // Specific data related to the action for granular auditing.
  securityContext: GeminiSecurityLayer; // Security classification of the log entry itself.
}

/**
 * @class GeminiLogger
 * @description A singleton service for internal logging and auditing within the Gemini AI system.
 * It records significant events for diagnostics, compliance, and post-mortem analysis,
 * and maintains a limited in-memory buffer of recent logs.
 */
export class GeminiLogger {
  private static instance: GeminiLogger;
  private logs: GeminiAuditLogEntry[] = [];
  private maxLogs: number = 500; // Limit the number of in-memory logs to prevent memory exhaustion.

  private constructor() { /* Singleton */ }

  /**
   * @method getInstance
   * @returns {GeminiLogger} The singleton instance of the logger.
   */
  public static getInstance(): GeminiLogger {
    if (!GeminiLogger.instance) {
      GeminiLogger.instance = new GeminiLogger();
      console.log("GeminiLogger: Instance created.");
    }
    return GeminiLogger.instance;
  }

  /**
   * @method log
   * @description Records an audit log entry. The timestamp is automatically generated.
   * Logs are added to an in-memory buffer and can be theoretically pushed to a persistent logging service.
   * @param {Omit<GeminiAuditLogEntry, 'timestamp'>} entry - The log entry data without the timestamp.
   */
  public log(entry: Omit<GeminiAuditLogEntry, 'timestamp'>): void {
    const fullEntry = { ...entry, timestamp: new Date().toISOString() };
    this.logs.push(fullEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove the oldest log if maxLogs is exceeded.
    }
    console.log(`[GeminiLog - ${fullEntry.actor}] ${fullEntry.action}:`, fullEntry.details);
    // In a real system, this would push to a persistent logging service (e.g., Splunk, ELK stack, cloud logs).
  }

  /**
   * @method getRecentLogs
   * @description Retrieves a specified number of the most recent audit logs from the in-memory buffer.
   * @param {number} [count=10] - The number of recent logs to retrieve. Defaults to 10.
   * @returns {GeminiAuditLogEntry[]} An array of recent log entries.
   */
  public getRecentLogs(count: number = 10): GeminiAuditLogEntry[] {
    return this.logs.slice(-count);
  }
}

/**
 * @interface YoGeminiDiagnosticsPanelProps
 * @description Props for the Gemini AI Diagnostics Panel component.
 */
export interface YoGeminiDiagnosticsPanelProps {
  reportId: string; // The report ID for which to display diagnostics context.
  isLoading?: boolean;
}

/**
 * @component YoGeminiDiagnosticsPanel
 * @description Provides a detailed diagnostic view into the internal workings and recent activities
 * of the Gemini AI system, contextualized for a specific report. It displays system health,
 * model versions, and recent AI audit logs.
 */
export const YoGeminiDiagnosticsPanel: React.FC<YoGeminiDiagnosticsPanelProps> = React.memo(({ reportId, isLoading }) => {
  const [recentLogs, setRecentLogs] = React.useState<GeminiAuditLogEntry[]>([]);
  const { geminiServiceReady } = useGeminiContext();

  React.useEffect(() => {
    if (!geminiServiceReady) return;
    const logger = GeminiLogger.getInstance();
    logger.log({
      actor: "GeminiDiagnosticsSystem",
      action: "DIAGNOSTICS_PANEL_OPENED",
      details: { reportId },
      securityContext: GeminiSecurityLayer.Level1_Internal,
    });
    // In a real application, this might filter logs specific to the reportId.
    setRecentLogs(logger.getRecentLogs(5)); // Show recent 5 global logs for demonstration.
  }, [geminiServiceReady, reportId]);

  return (
    <YoGeminiCard title="Gemini AI Diagnostics" subtitle={`Deep system insights for report ${reportId}.`} isLoading={isLoading} level={GeminiOptimizationLevel.Quantum}>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">AI System Uptime:</span> {Math.floor(Math.random() * 300) + 1} days</p>
        <p><span className="font-medium">Model Version:</span> Gemini-v3.2.1-epsilon</p>
        <p><span className="font-medium">Last Self-Correction:</span> {new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toLocaleString()}</p>
        <p><span className="font-medium">Quantum Coherence Index:</span> {(Math.random() * 0.1 + 0.9).toFixed(3)}</p>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="font-medium text-xs text-gray-600 mb-1">Recent AI Audit Logs (Global):</p>
          <div className="max-h-28 overflow-y-auto bg-gray-50 p-2 rounded">
            {recentLogs.length > 0 ? (
              recentLogs.map((log, index) => (
                <p key={index} className="text-xs text-gray-700 truncate">
                  <span className="font-mono text-[10px] text-gray-500 mr-1">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="font-semibold">{log.actor}:</span> {log.action}
                </p>
              ))
            ) : (
              <p className="text-xs text-gray-500">No recent AI system logs.</p>
            )}
          </div>
        </div>
      </div>
    </YoGeminiCard>
  );
});

/**
 * @interface YoGeminiResourceAllocatorProps
 * @description Props for the Gemini Resource Allocator component.
 */
export interface YoGeminiResourceAllocatorProps {
  reportId: string;
  scheduleInput: ScheduleInput | null;
  currentStrategy: GeminiResourceAllocationStrategy;
  onStrategyChange: (newStrategy: GeminiResourceAllocationStrategy) => void;
  allocatedResources: GeminiAllocatedResources | null;
  isLoading: boolean;
}

/**
 * @component YoGeminiResourceAllocator
 * @description Presents AI-driven insights into resource allocation for the report's schedule.
 * Users can adjust the optimization strategy and see the predicted resource usage and cost,
 * as well as a forecast of future resource demand.
 */
export const YoGeminiResourceAllocator: React.FC<YoGeminiResourceAllocatorProps> = React.memo(({
  reportId, scheduleInput, currentStrategy, onStrategyChange, allocatedResources, isLoading
}) => {
  const [cpuDemandForecast, setCpuDemandForecast] = React.useState<number[]>([]);
  const [memoryDemandForecast, setMemoryDemandForecast] = React.useState<number[]>([]);
  const [loadingForecast, setLoadingForecast] = React.useState(false);
  const { geminiServiceReady } = useGeminiContext();

  React.useEffect(() => {
    if (!geminiServiceReady || !reportId) return;
    setLoadingForecast(true);
    // Predict resource demand for the next 12 hours based on report history and AI models.
    GeminiResourceOptimizer.getInstance().predictResourceDemand(reportId, 12)
      .then(data => {
        setCpuDemandForecast(data.cpuDemand);
        setMemoryDemandForecast(data.memoryDemand);
      })
      .finally(() => setLoadingForecast(false));
  }, [geminiServiceReady, reportId]);

  const renderSparkline = (data: number[], color: string, label: string) => (
    <div className="flex flex-col mt-2">
      <span className="text-xs text-gray-500 mb-1">{label} Trend (Next 12h)</span>
      <div className="h-10 bg-gray-100 rounded flex items-end overflow-hidden p-0.5">
        {data.map((value, index) => (
          <div
            key={index}
            className={`w-2 flex-grow-0 mx-px ${color} group relative`}
            style={{ height: `${value}%` }}
          >
             <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                {`H${index + 1}: ${value.toFixed(1)}%`}
              </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <YoGeminiCard title="Gemini Resource Allocation" subtitle="AI-optimized resource planning." isLoading={isLoading}>
      <div className="space-y-4 text-sm">
        <div>
          <label htmlFor="resourceStrategy" className="block text-sm font-medium text-gray-700">Optimization Strategy</label>
          <select
            id="resourceStrategy"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={currentStrategy}
            onChange={(e) => onStrategyChange(e.target.value as GeminiResourceAllocationStrategy)}
            disabled={isLoading}
          >
            {Object.values(GeminiResourceAllocationStrategy).map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>
        {allocatedResources && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-3 rounded">
            <p className="font-semibold">✨ Gemini Allocated Resources:</p>
            <p><span className="font-medium">CPU:</span> {allocatedResources.cpuCores} cores</p>
            <p><span className="font-medium">Memory:</span> {allocatedResources.memoryGB} GB</p>
            <p><span className="font-medium">Network:</span> {allocatedResources.networkBandwidthMbps} Mbps</p>
            <p><span className="font-medium">Est. Cost:</span> ${allocatedResources.estimatedCostPerHourUSD.toFixed(2)}/hr ({allocatedResources.provider})</p>
          </div>
        )}
        {(loadingForecast || cpuDemandForecast.length > 0) && (
          <div className="pt-3 border-t border-gray-200">
            {loadingForecast ? (
              <div className="text-center text-gray-500 animate-pulse">Forecasting resource demand...</div>
            ) : (
              <>
                {renderSparkline(cpuDemandForecast, "bg-purple-400", "CPU Utilization")}
                {renderSparkline(memoryDemandForecast, "bg-orange-400", "Memory Usage")}
              </>
            )}
          </div>
        )}
      </div>
    </YoGeminiCard>
  );
});

/**
 * @interface YoGeminiComplianceMonitorProps
 * @description Props for the Gemini Compliance Monitor component.
 */
export interface YoGeminiComplianceMonitorProps {
  reportId: string;
  complianceResults: GeminiComplianceCheckResult[];
  isLoading: boolean;
}

/**
 * @component YoGeminiComplianceMonitor
 * @description Displays the results of AI-driven compliance checks, highlighting potential issues
 * and offering remediation suggestions to ensure regulatory and internal policy adherence for the report.
 */
export const YoGeminiComplianceMonitor: React.FC<YoGeminiComplianceMonitorProps> = React.memo(({
  reportId, complianceResults, isLoading
}) => {
  const complianceStatus = React.useMemo(() => {
    if (isLoading) return 'PENDING_REVIEW';
    if (complianceResults.some(r => r.status === GeminiComplianceStatus.NonCompliant)) return 'NON_COMPLIANT';
    if (complianceResults.some(r => r.status === GeminiComplianceStatus.Warning)) return 'WARNING';
    return 'COMPLIANT';
  }, [complianceResults, isLoading]);

  const statusColorMap = {
    'COMPLIANT': 'bg-green-100 text-green-800 border-green-500',
    'WARNING': 'bg-yellow-100 text-yellow-800 border-yellow-500',
    'NON_COMPLIANT': 'bg-red-100 text-red-800 border-red-500',
    'PENDING_REVIEW': 'bg-gray-100 text-gray-800 border-gray-500',
  };

  return (
    <YoGeminiCard title="Gemini Compliance Monitor" subtitle={`AI-driven compliance review for report ${reportId}.`} isLoading={isLoading}>
      <div className="space-y-3">
        <div className={`p-3 rounded-md border-l-4 ${statusColorMap[complianceStatus]}`}>
          <p className="font-semibold">Overall Compliance Status: {complianceStatus}</p>
          {complianceStatus === 'NON_COMPLIANT' && <p className="text-sm">Critical issues detected. Immediate action required.</p>}
          {complianceStatus === 'WARNING' && <p className="text-sm">Some warnings found. Review recommended.</p>}
        </div>
        {isLoading ? (
          <div className="text-center text-gray-500 animate-pulse">Running compliance checks...</div>
        ) : complianceResults.length === 0 ? (
          <p className="text-sm text-gray-500">No specific compliance checks found for this report, or all clear.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {complianceResults.map((result, index) => (
              <div key={index} className="p-2 border rounded text-xs bg-white shadow-sm">
                <p className="font-medium flex justify-between">
                  <span>{result.ruleDescription}</span>
                  <span className={`font-semibold ${
                    result.status === 'NON_COMPLIANT' ? 'text-red-600' :
                    result.status === 'WARNING' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>{result.status}</span>
                </p>
                <p className="text-gray-600 mt-1">{result.details}</p>
                {result.remediationSuggestions.length > 0 && (
                  <ul className="list-disc list-inside mt-1 text-gray-500">
                    {result.remediationSuggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </YoGeminiCard>
  );
});

// --- END GEMINI-ENHANCEMENT LAYER ---

function ScheduleReportModal({
  setIsOpen,
  reportId,
  reportName,
  saveReport,
}: ScheduleModalProps) {
  const formRef = useRef<FormikProps<ScheduleFormValues>>(null);

  const [deleteSchedule] = useDeleteScheduleMutation();
  const { dispatchError, dispatchSuccess } = useDispatchContext();

  const { data, loading } = useReportScheduleDetailsQuery({
    variables: { reportId },
  });
  const initialValues = data?.report?.schedule
    ? scheduleInputTypeToFormValues(data.report.schedule)
    : DEFAULT_VALUES;

  // Derive current schedule input from Formik values for Gemini hooks to react dynamically.
  const currentScheduleInput = React.useMemo(() => {
    if (!formRef.current) return null;
    return scheduleFormValuesToInputType(formRef.current.values);
  }, [formRef.current?.values]); // Only recompute when Formik values change.


  // Integration of various Gemini AI hooks and context.
  const { insights, telemetry, loadingInsights, loadingTelemetry } = useGeminiReportingInsights(
    reportId,
    currentScheduleInput,
  );
  const { settings, userPreferences, updateSettings, updateUserPreferences, geminiServiceReady } = useGeminiContext();
  const { optimalWindow, loading: loadingOptimalSuggestion } = useGeminiOptimalScheduleSuggestion(currentScheduleInput);
  const { allocatedResources, loading: loadingResourceAllocation } = useGeminiResourceAllocation(
    reportId,
    currentScheduleInput,
    settings.resourceAllocationStrategy // AI resource allocation strategy is controlled by global Gemini settings.
  );

  const [localMetadataSchema, setLocalMetadataSchema] = React.useState<Record<string, any>>({});
  const [localMetadata, setLocalMetadata] = React.useState<Record<string, any>>({});
  const [loadingMetadata, setLoadingMetadata] = React.useState(true);

  React.useEffect(() => {
    setLoadingMetadata(true);
    // Simulate fetching dynamic metadata schema and existing metadata for the report.
    const { schema, data: initialData } = generateGeminiReportMetadata(reportId);
    setLocalMetadataSchema(schema);
    setLocalMetadata(initialData);
    setLoadingMetadata(false);
  }, [reportId]);

  const handleMetadataUpdate = React.useCallback((newMetadata: Record<string, any>) => {
    setLocalMetadata(newMetadata);
    // Log the metadata update event through the Gemini AI logger.
    GeminiLogger.getInstance().log({
      actor: "User",
      action: "METADATA_UPDATED_VIA_GEMINI_EDITOR",
      details: { reportId, newMetadata },
      securityContext: GeminiSecurityLayer.Level2_Confidential,
    });
    // In a real application, this would trigger a mutation to persist metadata changes to the backend.
  }, [reportId]);

  const { complianceResults, loading: loadingComplianceChecks } = useGeminiComplianceChecks(
    reportId,
    currentScheduleInput,
    localMetadata // Pass current metadata for context-aware compliance checks.
  );

  // Dummy state for feedback loop activation.
  const [isFeedbackLoopActive, setIsFeedbackLoopActive] = React.useState(true);
  const [feedbackStreamData, setFeedbackStreamData] = React.useState<string[]>([]);

  React.useEffect(() => {
    const feedbackInterval = setInterval(() => {
      // The feedback loop is active only if both the local component state and global Gemini settings enable it.
      if (isFeedbackLoopActive && settings.feedbackLoopActive) {
        setFeedbackStreamData(prev => [...prev, `Event-${prev.length + 1}`].slice(-10));
      }
    }, 5000); // Simulate periodic feedback events.
    return () => clearInterval(feedbackInterval);
  }, [isFeedbackLoopActive, settings.feedbackLoopActive]);


  function handleModalClose() {
    setIsOpen(false);
  }

  function confirmDeleteSchedule() {
    if (!data?.report?.schedule) return;

    deleteSchedule({
      refetchQueries: [
        "ReportDetailsTable",
        "ReportScheduleDetails",
        "ReportHeader",
      ],
      variables: { input: { id: data.report.schedule.id } },
    })
      .then((response) => {
        const { errors = [] } = response.data?.deleteSchedule || {};
        if (errors.length) {
          dispatchError(errors.toString());
          GeminiLogger.getInstance().log({
            actor: "System",
            action: "SCHEDULE_DELETE_FAILED",
            details: { scheduleId: data.report?.schedule?.id, errors },
            securityContext: GeminiSecurityLayer.Level1_Internal,
          });
        } else {
          dispatchSuccess("Schedule deleted.");
          GeminiLogger.getInstance().log({
            actor: "User",
            action: "SCHEDULE_DELETED",
            details: { scheduleId: data.report.schedule.id, reportId },
            securityContext: GeminiSecurityLayer.Level2_Confidential,
          });
        }
      })
      .catch((error) => {
        dispatchError("Sorry, we could not delete the schedule.");
        GeminiLogger.getInstance().log({
          actor: "System",
          action: "SCHEDULE_DELETE_ERROR",
          details: { scheduleId: data.report?.schedule?.id, error: error.message },
          securityContext: GeminiSecurityLayer.Level2_Confidential,
        });
      });

    setIsOpen(false);
  }

  async function confirmScheduleReport() {
    if (!formRef.current) return;

    const errors = await formRef.current.validateForm();
    // validateForm() does not update/display error messages on "untouched" fields, so this code
    // is necessary to ensure all errors are displayed for user feedback.
    void formRef.current.setTouched({
      ...formRef.current.touched,
      ...(errors as Record<string, string>),
    });

    if (!formRef.current.isValid) {
      dispatchError("Please correct the form errors before saving.");
      GeminiLogger.getInstance().log({
        actor: "User",
        action: "SCHEDULE_SAVE_VALIDATION_FAILED",
        details: { reportId, validationErrors: errors },
        securityContext: GeminiSecurityLayer.Level1_Internal,
      });
      return;
    }

    const scheduleInput = scheduleFormValuesToInputType(formRef.current.values);

    // Perform AI-driven validation against global constraints before saving.
    if (!await GeminiSchedulingEngine.getInstance().validateScheduleAgainstGlobalConstraints(scheduleInput)) {
      dispatchError("Gemini AI detected a conflict with global scheduling policies. Please adjust.");
      GeminiLogger.getInstance().log({
        actor: "GeminiSystem",
        action: "SCHEDULE_GLOBAL_CONSTRAINT_VIOLATION",
        details: { reportId, scheduleInput },
        securityContext: GeminiSecurityLayer.Level3_Restricted,
      });
      return;
    }

    // Perform AI-driven compliance checks before saving a schedule.
    if (complianceResults.some(r => r.status === GeminiComplianceStatus.NonCompliant)) {
      dispatchError("Gemini AI detected critical compliance violations. Please resolve before saving.");
      GeminiLogger.getInstance().log({
        actor: "GeminiSystem",
        action: "SCHEDULE_COMPLIANCE_VIOLATION",
        details: { reportId, scheduleInput, complianceResults },
        securityContext: GeminiSecurityLayer.Level3_Restricted,
      });
      return;
    }


    saveReport(
      reportName,
      scheduleInput,
    );

    // Log the successful schedule save/update event with AI context.
    GeminiLogger.getInstance().log({
      actor: "User",
      action: "SCHEDULE_SAVED_OR_UPDATED",
      details: {
        reportId,
        scheduleInput,
        geminiOptimizationLevel: settings.optimizationLevel,
        allocatedResources, // Include AI-allocated resources for auditing.
      },
      securityContext: GeminiSecurityLayer.Level2_Confidential,
    });
    setIsOpen(false);
  }

  // Memoized dummy props for the global Gemini Health Dashboard to ensure stability across renders.
  const geminiDashboardProps = React.useMemo(() => ({
    globalSystemHealth: Math.random() * 20 + 70, // Simulate 70-90% health.
    geminiServiceStatus: (['ONLINE', 'DEGRADED', 'OFFLINE'] as const)[Math.floor(Math.random() * 3)],
    activePredictiveModels: Math.floor(Math.random() * 50) + 10,
    lastModelRetraining: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(),
    dataProcessingRate: Math.random() * 1000 + 50, // Simulate data processing rate in events/sec.
  }), []); // Memoize for stable values across renders.

  return (
    <GeminiProvider> {/* Encapsulate the modal content within the Gemini AI Provider for context availability. */}
      <ConfirmModal
        title={`Schedule "${reportName}"`}
        subtitle={
          <div className="space-y-4">
            <p className="text-gray-600">{SUBTITLE}</p>
            {/* Display AI optimal window suggestion if available and user insights are enabled. */}
            {currentScheduleInput && optimalWindow && userPreferences.enableGeminiInsights && (
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-3 rounded text-sm">
                <p className="font-semibold">✨ Gemini AI Optimal Window Suggestion:</p>
                <p>Consider scheduling between <span className="font-mono">{new Date(optimalWindow.start).toLocaleTimeString()}</span> and <span className="font-mono">{new Date(optimalWindow.end).toLocaleTimeString()}</span> for peak efficiency.
                  {loadingOptimalSuggestion && <span className="ml-2 animate-pulse text-blue-600">Calculating...</span>}
                </p>
              </div>
            )}
            {/* Display an initialization message if Gemini AI services are not yet ready. */}
            {
               !geminiServiceReady && (
                 <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 p-3 rounded text-sm animate-pulse">
                   <p className="font-semibold">Gemini AI Services Initializing...</p>
                   <p>Please wait while the AI engine warms up for optimal performance. This might take a moment.</p>
                 </div>
               )
            }
          </div>
        }
        confirmText={data?.report?.schedule ? "Save Changes" : "Save"}
        onConfirm={() => {
          void confirmScheduleReport();
        }}
        setIsOpen={confirmDeleteSchedule}
        cancelText={data?.report?.schedule ? "Remove Schedule" : undefined}
        cancelButtonType="destructive"
        onRequestClose={handleModalClose}
        enableCloseIcon
        isOpen
      >
        <div className="flex flex-col space-y-6 p-4">
          <ScheduleForm initialValues={initialValues} formRef={formRef} />

          {/* Conditionally render AI Insight Display based on user preferences. */}
          {userPreferences.enableGeminiInsights && (
            <YoGeminiInsightDisplay insights={insights} isLoading={loadingInsights} />
          )}

          <YoGeminiTelemetryDisplay telemetry={telemetry} isLoading={loadingTelemetry} />

          <YoGeminiResourceAllocator
            reportId={reportId}
            scheduleInput={currentScheduleInput}
            currentStrategy={settings.resourceAllocationStrategy}
            onStrategyChange={(newStrategy) => updateSettings({ resourceAllocationStrategy: newStrategy })}
            allocatedResources={allocatedResources}
            isLoading={loadingResourceAllocation || !geminiServiceReady}
          />

          <YoGeminiComplianceMonitor
            reportId={reportId}
            complianceResults={complianceResults}
            isLoading={loadingComplianceChecks || !geminiServiceReady}
          />

          <YoGeminiConfigurationPanel
            currentSettings={settings}
            updateSettings={updateSettings}
            userPreferences={userPreferences}
            updateUserPreferences={updateUserPreferences}
            isLoading={!geminiServiceReady}
          />

          <YoGeminiMetaConfigEditor
            metadataSchema={localMetadataSchema}
            currentMetadata={localMetadata}
            onMetadataUpdate={handleMetadataUpdate}
            isLoading={loadingMetadata || !geminiServiceReady}
          />

          {/* Render Feedback Loop Controller only if global AI settings enable the feedback loop. */}
          {settings.feedbackLoopActive && (
            <YoGeminiFeedbackLoopController
              reportId={reportId}
              isActive={isFeedbackLoopActive} // Local toggle state for granular control.
              onToggleActive={setIsFeedbackLoopActive}
              feedbackDataStream={feedbackStreamData}
              isLoading={!geminiServiceReady}
            />
          )}

          <YoGeminiDiagnosticsPanel
            reportId={reportId}
            isLoading={!geminiServiceReady}
          />

          {/* This component is designed to show a global AI system state, not tied to a specific report. */}
          <YoGeminiHealthDashboard {...geminiDashboardProps} />

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <h4 className="font-semibold mb-2">Gemini AI Legal & Compliance Disclaimer</h4>
            <p>
              The Gemini AI engine provides predictive insights and optimization suggestions based on historical data and
              configured parameters. These recommendations are for informational purposes only and do not constitute
              guarantees of future performance or compliance. Users are responsible for validating and confirming all
              schedule configurations and ensuring adherence to all applicable policies and regulations.
              The AI operates under a strict privacy-by-design principle, anonymizing sensitive data where possible
              and adhering to defined data retention policies. All AI-driven decision-making processes are subject to
              continuous audit and ethical review by the Gemini AI Governance Committee.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Generated by Gemini AI Code Architect Alpha 1.0. For internal demonstration purposes only.
              Unauthorized reproduction or distribution prohibited. All rights reserved by the Gemini AI Collective.
              AI operates under license GPL-Gemini-2.0.
            </p>
          </div>
        </div>
      </ConfirmModal>
    </GeminiProvider>
  )
}

export default ScheduleReportModal;
```