```typescript
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import requestApi from "../../common/utilities/requestApi";
import Icon from "../../common/ui-components/Icon/Icon";
import Button from "../../common/ui-components/Button/Button";
import {
  PopoverPanel,
  PopoverTrigger,
  Popover,
} from "../../common/ui-components/Popover/Popover";
import Heading from "../../common/ui-components/Heading/Heading";

// --- Type Definitions for enhanced configuration management ---

/**
 * @interface ConfigEntry
 * @description Represents a single configuration key-value pair, with additional metadata.
 */
export interface ConfigEntry {
  key: string;
  value: unknown;
  type: string; // e.g., 'string', 'number', 'boolean', 'object', 'array'
  source: "local-override" | "default" | "remote" | "ai-generated";
  lastModified?: string; // ISO date string
  description?: string;
  isSensitive?: boolean;
}

/**
 * @interface ConfigHistoryEntry
 * @description Represents a snapshot of the configuration at a specific point in time, stored locally.
 */
export interface ConfigHistoryEntry {
  id: string; // Unique identifier for the history entry
  timestamp: string; // ISO date string of when the change occurred
  config: Record<string, unknown>; // The state of the local overrides at that time
  changeDescription: string; // A brief description of the change
  user?: string; // Identifier for the user who made the change (if available)
}

/**
 * @interface GeminiAnalysisRecommendation
 * @description Details a specific recommendation from Gemini AI.
 */
export interface GeminiAnalysisRecommendation {
  type: "security" | "performance" | "usability" | "best_practice" | "other";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  affectedKeys?: string[]; // Keys in the config that this recommendation pertains to
  suggestedFix?: Record<string, unknown>; // A patch (partial config object) to apply the fix
}

/**
 * @interface GeminiAnalysisAnomaly
 * @description Details an anomaly detected by Gemini AI.
 */
export interface GeminiAnalysisAnomaly {
  key: string; // The config key where the anomaly was found
  currentValue: unknown; // The value that triggered the anomaly
  expectedPattern?: string; // What the AI expected the value/pattern to be
  deviationMessage: string; // Explanation of why it's an anomaly
}

/**
 * @interface GeminiAnalysisReport
 * @description Structure for the AI's comprehensive analysis report of the configuration.
 */
export interface GeminiAnalysisReport {
  overallScore: number; // A score from 0-100 indicating config health
  recommendations: GeminiAnalysisRecommendation[];
  anomaliesDetected: GeminiAnalysisAnomaly[];
  analysisTimestamp: string; // When the analysis was performed
}

/**
 * @interface OptimizedConfigProposal
 * @description Structure for the AI's optimized configuration proposal.
 */
export interface OptimizedConfigProposal {
  proposedConfig: Record<string, unknown>; // The full proposed optimized configuration
  summary: string; // A brief summary of the optimization
  metricsImproved: Array<{ metric: string; before: string; after: string }>; // Quantifiable improvements
  explanation: string; // Detailed explanation of the changes and their benefits
  optimizationTimestamp: string; // When the optimization was generated
}

// --- Constants and Configuration for the Editor ---

/**
 * @constant EDITOR_SETTINGS
 * @description Centralized settings for the LiveConfigEditor.
 */
export const EDITOR_SETTINGS = {
  SAVE_DEBOUNCE_MS: 1000, // Debounce delay for saving/applying changes
  HISTORY_LIMIT: 20, // Maximum number of history entries to keep
  MAX_CONFIG_SIZE_KB: 1024, // Maximum allowed size for config JSON (1MB)
  AI_API_TIMEOUT_MS: 10000, // Timeout for Gemini AI API calls
  AUTO_RELOAD_INTERVAL_MS: 30 * 60 * 1000, // Auto-reload remote defaults every 30 minutes
  EDITOR_WIDTH_PX: 800, // Default width of the popover panel
  EDITOR_HEIGHT_PX: 750, // Default height of the popover panel
};

/**
 * @enum ConfigEditorMode
 * @description Defines the different operational modes of the configuration editor.
 */
export enum ConfigEditorMode {
  VIEW = "view", // Read-only view (not explicitly used but good for future)
  EDIT = "edit", // Main editing mode
  AI_SUGGESTIONS = "ai_suggestions", // Gemini AI assistant panel
  HISTORY = "history", // Configuration history viewer
  DIFFERENCE = "difference", // Diff viewer for changes
  SEARCH = "search", // Config search and filter mode (future)
}

// --- Utility Functions and Helpers ---

/**
 * @function isValidJson
 * @description Robustly checks if a given string is valid JSON.
 * @param {string} str - The string to validate.
 * @returns {boolean} - True if valid JSON, false otherwise.
 */
export function isValidJson(str: string): boolean {
  if (typeof str !== "string") {
    return false;
  }
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @function formatJson
 * @description Formats a JSON string with 2-space indentation, returning original on error.
 * @param {string} jsonString - The JSON string to format.
 * @returns {string} - The formatted JSON string or the original if invalid.
 */
export function formatJson(jsonString: string): string {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    console.error("Failed to format JSON:", e);
    return jsonString; // Return original if parsing fails
  }
}

/**
 * @function generateUniqueId
 * @description Generates a high-quality unique ID suitable for client-side use.
 * @returns {string} - A unique ID string.
 */
export function generateUniqueId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * @function deepMerge
 * @description Recursively merges two objects. Properties in `source` overwrite properties in `target`.
 *              Handles nested objects but not arrays (arrays are replaced).
 * @param {Record<string, any>} target - The object to merge into.
 * @param {Record<string, any>} source - The object providing new/overriding properties.
 * @returns {Record<string, any>} - A new object containing the merged properties.
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  if (target && typeof target === "object" && source && typeof source === "object") {
    Object.keys(source).forEach((key) => {
      // Avoid merging arrays or non-objects deeply, just replace them
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

/**
 * @function calculateJsonDiff
 * @description Compares two JSON objects and returns a summary of added, removed, and changed keys.
 *              Performs a shallow comparison for changed values (stringifies and compares).
 * @param {Record<string, unknown>} original - The original configuration object.
 * @param {Record<string, unknown>} updated - The updated configuration object.
 * @returns {{ added: string[], removed: string[], changed: string[], noChanges: boolean }} - The diff summary.
 */
export function calculateJsonDiff(
  original: Record<string, unknown>,
  updated: Record<string, unknown>
): { added: string[]; removed: string[]; changed: string[]; noChanges: boolean } {
  const originalKeys = Object.keys(original);
  const updatedKeys = Object.keys(updated);

  const added = updatedKeys.filter((key) => !(key in original));
  const removed = originalKeys.filter((key) => !(key in updated));
  const changed = updatedKeys.filter(
    (key) =>
      key in original &&
      JSON.stringify(original[key]) !== JSON.stringify(updated[key])
  );

  const noChanges = added.length === 0 && removed.length === 0 && changed.length === 0;

  return { added, removed, changed, noChanges };
}

// --- API Service Layer ---

/**
 * @class LiveConfigApiService
 * @description Centralized service for handling all API interactions related to live configuration.
 *              Includes mock implementations for Gemini AI functions.
 */
export class LiveConfigApiService {
  private static readonly BASE_OVERRIDE_URL = "/live-config-local-override";
  private static readonly BASE_DEFAULT_URL = "/live-config-default"; // Invented endpoint for base config
  private static readonly GEMINI_AI_API_URL = "/gemini-ai/config-assistant"; // Invented AI endpoint

  /**
   * @method setOverrides
   * @description Persists the current local configuration overrides to the backend.
   * @param {Record<string, unknown>} data - The configuration data to save as overrides.
   * @returns {Promise<any>} - Resolves with the API response on success.
   * @throws {Error} - If the API request fails.
   */
  public static async setOverrides(data: Record<string, unknown>): Promise<any> {
    try {
      const response = await requestApi(LiveConfigApiService.BASE_OVERRIDE_URL, null, "POST", {
        config: data,
      });
      // In a commercial-grade system, telemetry would log this action
      console.info(`[LiveConfigApiService] Overrides saved successfully.`);
      return response;
    } catch (error) {
      console.error(`[LiveConfigApiService] Failed to save overrides:`, error);
      throw new Error(`Failed to save configuration. Please check network and server status.`);
    }
  }

  /**
   * @method getOverrides
   * @description Fetches the currently active local configuration overrides from the backend.
   * @returns {Promise<Record<string, unknown>>} - Resolves with the fetched overrides or an empty object.
   * @throws {Error} - If the API request fails.
   */
  public static async getOverrides(): Promise<Record<string, unknown>> {
    try {
      const data = await requestApi(LiveConfigApiService.BASE_OVERRIDE_URL, null, "GET")
        .json((res: any) => res) // Assuming the response is directly the config object
        .catch((err: any) => {
          console.warn(`[LiveConfigApiService] No local overrides found or error fetching:`, err);
          return {}; // Gracefully handle no overrides or initial errors
        });
      console.debug(`[LiveConfigApiService] Overrides fetched.`, data);
      return data;
    } catch (error) {
      console.error(`[LiveConfigApiService] Catastrophic error fetching overrides:`, error);
      throw new Error(`Failed to retrieve configuration overrides. Please try again.`);
    }
  }

  /**
   * @method getRemoteDefaultConfig
   * @description Fetches the baseline/default configuration from a remote source.
   *              This is essential for understanding what local overrides are changing.
   * @returns {Promise<Record<string, unknown>>} - Resolves with the remote default config or an empty object.
   * @throws {Error} - If the API request fails.
   */
  public static async getRemoteDefaultConfig(): Promise<Record<string, unknown>> {
    try {
      const data = await requestApi(LiveConfigApiService.BASE_DEFAULT_URL, null, "GET")
        .json((res: any) => res)
        .catch((err: any) => {
          console.warn(`[LiveConfigApiService] Could not fetch remote default config:`, err);
          return {}; // Fallback to empty object if defaults are unavailable
        });
      console.debug(`[LiveConfigApiService] Remote default config fetched.`, data);
      return data;
    } catch (error) {
      console.error(`[LiveConfigApiService] Catastrophic error fetching remote defaults:`, error);
      throw new Error(`Failed to retrieve default configuration. Please try again.`);
    }
  }

  /**
   * @method getEffectiveConfig
   * @description Calculates the currently effective configuration by merging remote defaults with local overrides.
   * @returns {Promise<Record<string, unknown>>} - The fully merged, effective configuration.
   */
  public static async getEffectiveConfig(): Promise<Record<string, unknown>> {
    try {
      const [defaultConfig, overrides] = await Promise.all([
        this.getRemoteDefaultConfig(),
        this.getOverrides(),
      ]);
      return deepMerge(defaultConfig, overrides);
    } catch (error) {
      console.error(`[LiveConfigApiService] Error calculating effective config:`, error);
      // Return a best-effort config or re-throw based on error handling strategy
      return {};
    }
  }

  // --- Gemini AI Functions (Mock Implementations for demonstration) ---
  // In a real application, these would hit actual AI service endpoints.

  /**
   * @method geminiSuggestValues
   * @description Mocks an API call to Gemini AI to suggest values for a given config key.
   *              Simulates intelligent suggestions based on key names or types.
   * @param {string} key - The configuration key to get suggestions for.
   * @param {unknown} currentValue - The current value of the key, for contextual suggestions.
   * @param {Record<string, unknown>} context - The entire current config, providing broader context.
   * @returns {Promise<string[]>} - A promise resolving to an array of suggested values (as strings).
   */
  public static async geminiSuggestValues(
    key: string,
    currentValue: unknown,
    context: Record<string, unknown>
  ): Promise<string[]> {
    console.debug(`[Gemini AI Mock] Requesting suggestions for key: ${key}, current: ${currentValue}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        let suggestions: string[] = [];
        const lowerKey = key.toLowerCase();

        if (lowerKey.includes("enable") || lowerKey.includes("featureflag")) {
          suggestions = ["true", "false"];
        } else if (lowerKey.includes("timeout") || lowerKey.includes("duration")) {
          suggestions = ["1000", "5000", "15000", "30000", "60000"];
        } else if (lowerKey.includes("url") || lowerKey.includes("endpoint")) {
          suggestions = [
            "https://api.example.com/v1",
            "https://dev.api.example.com/v1",
            "http://localhost:8080/api",
            `https://${context.environment || 'prod'}.service.com`, // Contextual example
          ];
        } else if (lowerKey.includes("theme")) {
          suggestions = ["dark", "light", "system", "midnight", "oceanic"];
        } else if (lowerKey.includes("level") && (context.logging || context.log)) {
          suggestions = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
        } else {
          // Generic suggestions
          suggestions = ["default_value", "recommended_value", "example_value", JSON.stringify(currentValue)];
          // Remove duplicates and current value if present
          suggestions = [...new Set(suggestions)].filter(s => s !== JSON.stringify(currentValue));
        }
        resolve(suggestions);
      }, Math.random() * 500 + 300); // Simulate network latency (300-800ms)
    });
  }

  /**
   * @method geminiAnalyzeConfig
   * @description Mocks an API call to Gemini AI to analyze the current configuration for issues.
   *              Generates a mock `GeminiAnalysisReport`.
   * @param {Record<string, unknown>} config - The configuration object to be analyzed.
   * @returns {Promise<GeminiAnalysisReport>} - A promise resolving to the AI analysis report.
   */
  public static async geminiAnalyzeConfig(
    config: Record<string, unknown>
  ): Promise<GeminiAnalysisReport> {
    console.debug(`[Gemini AI Mock] Requesting config analysis.`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const report: GeminiAnalysisReport = {
          overallScore: 95,
          recommendations: [],
          anomaliesDetected: [],
          analysisTimestamp: new Date().toISOString(),
        };

        // Simulate AI analysis logic
        if (config.debugMode === true || config.enableDebugging === true) {
          report.recommendations.push({
            type: "security",
            severity: "high",
            message: "Debug mode is enabled. This should be disabled in production environments to prevent information disclosure.",
            affectedKeys: ["debugMode", "enableDebugging"],
            suggestedFix: { debugMode: false, enableDebugging: false },
          });
          report.overallScore -= 15;
        }
        if (typeof config.apiTimeout === 'number' && config.apiTimeout > 60000) {
          report.recommendations.push({
            type: "performance",
            severity: "medium",
            message: "API timeout is excessively high. This can lead to resource exhaustion and poor user experience during network issues.",
            affectedKeys: ["apiTimeout"],
            suggestedFix: { apiTimeout: 30000 },
          });
          report.overallScore -= 5;
        }
        if (config.featureFlags && Object.keys(config.featureFlags).length > 10) {
          report.recommendations.push({
            type: "usability",
            severity: "low",
            message: "Many feature flags are active. Consider deprecating or consolidating old flags to reduce configuration complexity.",
            affectedKeys: ["featureFlags"],
          });
          report.overallScore -= 2;
        }
        if (config.allowInsecureConnections === true) {
          report.recommendations.push({
            type: "security",
            severity: "critical",
            message: "Insecure connections are allowed. This exposes your application to severe security vulnerabilities like MiTM attacks. Immediately disable this setting.",
            affectedKeys: ["allowInsecureConnections"],
            suggestedFix: { allowInsecureConnections: false },
          });
          report.overallScore -= 30;
        }

        // Simulate anomaly detection
        if (config.secretKey === "12345" || config.secretKey === "CHANGEME") {
          report.anomaliesDetected.push({
            key: "secretKey",
            currentValue: config.secretKey,
            expectedPattern: "Strong, random alphanumeric string (min 32 chars)",
            deviationMessage: "Weak or default secret key detected. This is a critical security vulnerability.",
          });
          report.overallScore -= 25;
        }
        if (config.databasePort && (config.databasePort as number) < 1024 && (config.databasePort as number) !== 3306) {
          report.anomaliesDetected.push({
            key: "databasePort",
            currentValue: config.databasePort,
            expectedPattern: ">1024 or standard port (e.g., 3306)",
            deviationMessage: "Unusual database port. Ports below 1024 typically require elevated privileges and might conflict with well-known services.",
          });
          report.overallScore -= 5;
        }

        if (report.recommendations.length === 0 && report.anomaliesDetected.length === 0) {
          report.recommendations.push({
            type: "best_practice",
            severity: "low",
            message: "Your configuration appears to follow best practices. Well done!",
            affectedKeys: [],
          });
        }
        // Ensure score doesn't go below 0
        report.overallScore = Math.max(0, report.overallScore);
        resolve(report);
      }, Math.random() * 1000 + 1000); // Simulate network latency + processing (1-2 seconds)
    });
  }

  /**
   * @method geminiNLToConfigPatch
   * @description Mocks an API call to Gemini AI to convert a natural language query into a config patch.
   * @param {string} query - The natural language request (e.g., "enable dark mode").
   * @param {Record<string, unknown>} currentConfig - The current configuration for contextual understanding.
   * @returns {Promise<Record<string, unknown>>} - A promise resolving to a configuration patch.
   */
  public static async geminiNLToConfigPatch(
    query: string,
    currentConfig: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    console.debug(`[Gemini AI Mock] Processing NL query: "${query}"`);
    return new Promise((resolve) => {
      setTimeout(() => {
        let patch: Record<string, unknown> = {};
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes("enable debug mode")) {
          patch = { ...patch, debugMode: true };
        }
        if (lowerQuery.includes("set api timeout to 30 seconds")) {
          patch = { ...patch, apiTimeout: 30000 };
        }
        if (lowerQuery.includes("disable new feature a")) {
          patch = deepMerge(patch, { featureFlags: { newFeatureA: false } });
        }
        if (lowerQuery.includes("change theme to dark")) {
          patch = { ...patch, theme: "dark" };
        }
        if (lowerQuery.includes("increase log level to warn")) {
          patch = { ...patch, logging: { level: "WARN" } };
        }
        if (lowerQuery.includes("set database host to localhost")) {
          patch = { ...patch, database: { host: "localhost" } };
        }
        if (lowerQuery.includes("add new metric tracker")) {
          patch = deepMerge(patch, { metrics: { tracker: { enabled: true, endpoint: "/metrics" } } });
        }
        if (Object.keys(patch).length === 0) {
          // If no specific keyword matched, invent a generic change to demonstrate functionality
          patch = { aiSuggestedGenericChange: true, aiGeneratedTimestamp: new Date().toISOString(), originalQuery: query };
        }
        resolve(patch);
      }, Math.random() * 700 + 800); // Simulate latency (800-1500ms)
    });
  }

  /**
   * @method geminiOptimizeConfig
   * @description Mocks an API call to Gemini AI to suggest an optimized version of the configuration.
   * @param {Record<string, unknown>} config - The configuration to be optimized.
   * @returns {Promise<OptimizedConfigProposal>} - A promise resolving to an optimized config proposal.
   */
  public static async geminiOptimizeConfig(
    config: Record<string, unknown>
  ): Promise<OptimizedConfigProposal> {
    console.debug(`[Gemini AI Mock] Requesting config optimization.`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const proposedConfig = { ...config }; // Start with a copy of the original config
        let summary = "Initial analysis found potential areas for optimization.";
        const metricsImproved: OptimizedConfigProposal["metricsImproved"] = [];

        // Simulate optimization logic
        if (typeof proposedConfig.apiPollingInterval === 'number' && proposedConfig.apiPollingInterval < 5000) {
          metricsImproved.push({
            metric: "Network Load",
            before: `${proposedConfig.apiPollingInterval}ms`,
            after: `10000ms`,
          });
          proposedConfig.apiPollingInterval = 10000; // Recommend increasing polling interval
          summary = "Optimized API polling interval for reduced network load and server strain.";
        }

        if (typeof proposedConfig.cacheTTL === 'number' && proposedConfig.cacheTTL < 60000) {
          metricsImproved.push({
            metric: "Cache Hit Ratio",
            before: `${proposedConfig.cacheTTL}ms`,
            after: `300000ms`, // 5 minutes
          });
          proposedConfig.cacheTTL = 300000;
          if (summary.length > 0) summary += " Also, ";
          summary += "Increased cache TTL for better client-side performance and reduced redundant requests.";
        }

        if (proposedConfig.enableAnalytics === false && proposedConfig.userIdTracking === true) {
            metricsImproved.push({
                metric: "Data Privacy Compliance",
                before: "true (userIdTracking)",
                after: "false (userIdTracking)",
            });
            proposedConfig.userIdTracking = false;
            if (summary.length > 0) summary += " Additionally, ";
            summary += "Adjusted analytics settings for improved data privacy compliance.";
        }

        if (metricsImproved.length === 0) {
            summary = "No immediate significant optimization opportunities detected based on current configuration and patterns. Your configuration is already well-optimized.";
        }


        resolve({
          proposedConfig,
          summary: summary.trim(),
          metricsImproved,
          explanation:
            "Gemini AI analyzed current configuration parameters against known performance, security, and best practice benchmarks. " +
            "The proposed changes aim to enhance system efficiency, reduce operational costs, and improve overall reliability. " +
            "Review these suggestions carefully before applying them.",
          optimizationTimestamp: new Date().toISOString(),
        });
      }, Math.random() * 1000 + 1500); // Simulate latency (1.5-2.5 seconds)
    });
  }

  /**
   * @method geminiGetContextualHelp
   * @description Mocks an API call to Gemini AI for contextual help on a specific config key.
   * @param {string} key - The config key for which help is requested.
   * @param {unknown} value - The current value of the key, for more specific assistance.
   * @returns {Promise<string>} - A promise resolving to the contextual help text.
   */
  public static async geminiGetContextualHelp(
    key: string,
    value: unknown
  ): Promise<string> {
    console.debug(`[Gemini AI Mock] Requesting contextual help for key: ${key}, value: ${value}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        let helpText = `No specific Gemini AI documentation found for '${key}'. `;
        const lowerKey = key.toLowerCase();

        if (lowerKey.includes("timeout")) {
          helpText = `The '${key}' setting controls the maximum duration (in milliseconds) an operation will wait before failing. Setting it too high can lead to resource exhaustion and poor responsiveness, while too low can cause premature failures during normal operation. Current value: <code class="bg-gray-200 p-0.5 rounded">${JSON.stringify(value)}</code>.`;
        } else if (lowerKey.includes("enable") || lowerKey.includes("flag")) {
          helpText = `The '${key}' is a feature flag. Set to 'true' to activate the feature or 'false' to deactivate it. Always test new features in a controlled environment. Current state: <code class="bg-gray-200 p-0.5 rounded">${JSON.stringify(value)}</code>.`;
        } else if (lowerKey.includes("url") || lowerKey.includes("endpoint")) {
          helpText = `This setting defines the target URL or API endpoint for an external service or resource. Ensure the URL is correctly formatted, accessible, and points to the intended environment (e.g., development, staging, production). Current target: <code class="bg-gray-200 p-0.5 rounded">${JSON.stringify(value)}</code>.`;
        } else if (lowerKey.includes("credentials") || lowerKey.includes("secret")) {
            helpText = `The '${key}' likely holds sensitive authentication credentials or a secret key. It's critical to manage such values securely, ideally using environment variables or a secret management system, and avoid hardcoding them directly in configurations. Never expose this value publicly.`;
        } else if (lowerKey.includes("port")) {
            helpText = `The '${key}' specifies the network port for a service. Common ports include 80 (HTTP), 443 (HTTPS), 3000 (development). Ports below 1024 are typically reserved for system services and might require special permissions. Current port: <code class="bg-gray-200 p-0.5 rounded">${JSON.stringify(value)}</code>.`;
        }

        helpText += " For comprehensive documentation, please refer to your project's official configuration guide or contact the system administrator.";
        resolve(helpText);
      }, Math.random() * 400 + 300); // Simulate latency (300-700ms)
    });
  }
}

// --- Custom Hooks for Advanced State Management ---

/**
 * @hook useConfigEditorState
 * @description A comprehensive custom hook to manage the state and logic for the live config editor.
 *              Handles loading, saving, history, validation, and interaction with AI services.
 */
export function useConfigEditorState() {
  const [currentConfig, setCurrentConfig] = useState<Record<string, unknown>>({}); // The effective config (defaults + overrides)
  const [editorValue, setEditorValue] = useState<string>(""); // The raw JSON string in the editor (only overrides)
  const [isLoading, setIsLoading] = useState(false); // Global loading state for API calls
  const [error, setError] = useState<string | null>(null); // Global error message
  const [history, setHistory] = useState<ConfigHistoryEntry[]>([]); // Local history of saved overrides
  const [editorMode, setEditorMode] = useState<ConfigEditorMode>(ConfigEditorMode.EDIT); // Current editor panel mode
  const [validationError, setValidationError] = useState<string | null>(null); // JSON validation error for editorValue
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Flag for initial data load
  const [lastSavedConfig, setLastSavedConfig] = useState<Record<string, unknown>>({}); // Last successfully saved overrides
  const [remoteDefaultConfig, setRemoteDefaultConfig] = useState<Record<string, unknown>>({}); // Base config from backend

  const debounceTimeoutRef = useRef<number | null>(null);

  /**
   * @function loadConfigs
   * @description Fetches all relevant configuration data (overrides, defaults) and updates state.
   */
  const loadConfigs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const overrides = await LiveConfigApiService.getOverrides();
      const defaults = await LiveConfigApiService.getRemoteDefaultConfig();
      const effective = deepMerge(defaults, overrides);

      setCurrentConfig(effective);
      setRemoteDefaultConfig(defaults);
      setEditorValue(JSON.stringify(overrides, null, 2)); // Editor always displays local overrides
      setLastSavedConfig(overrides); // Store the current overrides as the "last saved" state
      setInitialLoadComplete(true);
      console.log("Configuration loaded successfully. Effective config:", effective);
    } catch (err: any) {
      setError(`Failed to load configurations: ${err.message || 'An unknown error occurred.'}`);
      console.error("Error loading configs:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * @function saveOverrides
   * @description Saves the provided configuration data as local overrides and updates history.
   * @param {Record<string, unknown>} dataToSave - The parsed configuration object to persist.
   * @param {string} changeDescription - A user-friendly description of the change for history.
   */
  const saveOverrides = useCallback(
    async (dataToSave: Record<string, unknown>, changeDescription: string = "Manual save") => {
      setIsLoading(true);
      setError(null);
      try {
        await LiveConfigApiService.setOverrides(dataToSave);
        const newHistoryEntry: ConfigHistoryEntry = {
          id: generateUniqueId(),
          timestamp: new Date().toISOString(),
          config: dataToSave,
          changeDescription: changeDescription,
          user: "local_dev_user", // Placeholder: In a real app, integrate with auth context
        };
        // Add to history, ensuring limit is respected
        setHistory((prev) => [newHistoryEntry, ...prev].slice(0, EDITOR_SETTINGS.HISTORY_LIMIT));
        await loadConfigs(); // Reload to ensure UI reflects the latest effective config and lastSavedConfig is updated
        console.log(`Configuration saved successfully. Description: "${changeDescription}"`);
      } catch (err: any) {
        setError(`Failed to save overrides: ${err.message || 'An unknown error occurred.'}`);
        console.error("Error saving overrides:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [loadConfigs]
  );

  /**
   * @function handleEditorChange
   * @description Processes changes in the text editor, including JSON validation and debounced preview updates.
   * @param {string} value - The new string value from the editor.
   */
  const handleEditorChange = useCallback(
    (value: string) => {
      setEditorValue(value);

      if (!isValidJson(value)) {
        setValidationError("Invalid JSON format. Please correct it to save.");
      } else {
        setValidationError(null);
        // Debounce updating the `currentConfig` (effective config preview)
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = window.setTimeout(() => {
          try {
            const parsedOverrides = JSON.parse(value);
            // Update the effective config preview based on the new overrides
            setCurrentConfig(deepMerge(remoteDefaultConfig, parsedOverrides));
          } catch (e) {
            // This case should ideally be caught by isValidJson, but defensive programming
            console.warn("Could not parse editor value for preview update.", e);
          }
        }, EDITOR_SETTINGS.SAVE_DEBOUNCE_MS);
      }
    },
    [remoteDefaultConfig]
  );

  /**
   * @function handleSaveAction
   * @description Initiates the save process after validating the editor content.
   * @param {() => void} [callback] - An optional callback to execute upon successful save.
   */
  const handleSaveAction = useCallback(
    async (callback?: () => void) => {
      if (!isValidJson(editorValue)) {
        setError("Cannot save: Editor content is not valid JSON.");
        setValidationError("Invalid JSON format. Please correct before saving.");
        return;
      }
      try {
        const parsedConfig = JSON.parse(editorValue);
        // Check for config size before saving (client-side precaution)
        if (new TextEncoder().encode(editorValue).length > EDITOR_SETTINGS.MAX_CONFIG_SIZE_KB * 1024) {
            setError(`Configuration size exceeds limit of ${EDITOR_SETTINGS.MAX_CONFIG_SIZE_KB}KB. Please reduce its size.`);
            return;
        }
        await saveOverrides(parsedConfig);
        callback?.(); // Execute callback, e.g., close popover
      } catch (err: any) {
        setError(`Failed to process config for saving: ${err.message || 'An unknown error occurred.'}`);
        console.error("Error parsing config before saving:", err);
      }
    },
    [editorValue, saveOverrides]
  );

  /**
   * @function handleResetAction
   * @description Resets the editor to an empty object, effectively clearing all local overrides.
   */
  const handleResetAction = useCallback(async () => {
    if (window.confirm("Are you absolutely sure you want to clear ALL local live config overrides? This action cannot be easily undone from history.")) {
      setEditorValue("{}");
      setValidationError(null);
      await saveOverrides({}, "Reset all local overrides to empty/default");
      console.warn("All local overrides have been reset.");
    }
  }, [saveOverrides]);

  /**
   * @function handleApplyHistory
   * @description Applies a selected historical configuration snapshot to the editor.
   * @param {ConfigHistoryEntry} entry - The history entry to apply.
   */
  const handleApplyHistory = useCallback(
    (entry: ConfigHistoryEntry) => {
      setEditorValue(JSON.stringify(entry.config, null, 2));
      setValidationError(null); // Clear any existing validation error
      setEditorMode(ConfigEditorMode.EDIT); // Switch back to edit mode for user to review
      console.info(`Applied history entry from ${new Date(entry.timestamp).toLocaleString()}.`);
      // Optionally show a temporary success message to the user
    },
    []
  );

  /**
   * @function handleApplyGeminiPatch
   * @description Applies a configuration patch suggested by Gemini AI to the current editor content.
   * @param {Record<string, unknown>} patch - The partial config object to merge.
   * @param {string} description - A description of the patch for history/logging.
   */
  const handleApplyGeminiPatch = useCallback((patch: Record<string, unknown>, description: string) => {
    try {
      const currentOverrides = isValidJson(editorValue) ? JSON.parse(editorValue) : {};
      const newConfig = deepMerge(currentOverrides, patch);
      setEditorValue(JSON.stringify(newConfig, null, 2));
      setValidationError(null); // Assuming AI patches are valid, clear errors
      // You might want to automatically save or prompt the user to save here
      console.log(`Gemini AI patch applied: ${description}`);
      setEditorMode(ConfigEditorMode.EDIT); // Return to edit mode
    } catch (e: any) {
      setError(`Failed to apply AI patch: ${e.message || 'An unknown error occurred.'}`);
      console.error("Error applying AI patch:", e);
    }
  }, [editorValue, setEditorValue, setEditorMode]);

  // Initial load effect and auto-reload mechanism
  useEffect(() => {
    void loadConfigs();
    const reloadInterval = setInterval(() => {
      void loadConfigs(); // Periodically reload from backend to pick up remote changes
      console.debug("Auto-reloading live config from backend.");
    }, EDITOR_SETTINGS.AUTO_RELOAD_INTERVAL_MS);

    return () => {
      clearInterval(reloadInterval); // Cleanup interval on unmount
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current); // Clear any pending debounced calls
      }
    };
  }, [loadConfigs]); // Dependency array to ensure effect runs once and on loadConfigs change

  // Determine if the editor content has unsaved changes compared to the last saved state
  const hasUnsavedChanges = useMemo(() => {
    try {
      const currentOverridesInEditor = isValidJson(editorValue) ? JSON.parse(editorValue) : {};
      return JSON.stringify(currentOverridesInEditor) !== JSON.stringify(lastSavedConfig);
    } catch (e) {
      // If editor content is invalid JSON, consider it as having changes that need fixing
      return true;
    }
  }, [editorValue, lastSavedConfig]);


  // Expose all necessary state variables and functions
  return {
    currentConfig, // The effective (merged) configuration
    editorValue, // Raw string content of the overrides editor
    setEditorValue: handleEditorChange, // Custom setter for editor changes
    isLoading,
    error,
    validationError,
    history,
    editorMode,
    setEditorMode,
    handleSave: handleSaveAction,
    handleReset: handleResetAction,
    handleApplyHistory,
    handleApplyGeminiPatch, // For applying AI-generated changes
    loadConfigs, // Expose for manual reload if needed
    initialLoadComplete,
    lastSavedConfig, // The config last successfully saved (for diffing)
    remoteDefaultConfig, // The base configuration (for context)
    hasUnsavedChanges, // Flag indicating if editor has unsaved changes
  };
}

// --- Sub-Components for Modularization and UI enhancement ---

/**
 * @interface ConfigEditorToolbarProps
 * @description Props for the ConfigEditorToolbar component.
 */
export interface ConfigEditorToolbarProps {
  editorMode: ConfigEditorMode;
  setEditorMode: (mode: ConfigEditorMode) => void;
  onSave: () => void;
  onReset: () => void;
  onFormat: () => void;
  isLoading: boolean;
  validationError: string | null;
  hasUnsavedChanges: boolean; // Renamed for clarity
}

/**
 * @component ConfigEditorToolbar
 * @description Provides a professional toolbar for the LiveConfigEditor, enabling mode switching and core actions.
 */
export const ConfigEditorToolbar: React.FC<ConfigEditorToolbarProps> = ({
  editorMode,
  setEditorMode,
  onSave,
  onReset,
  onFormat,
  isLoading,
  validationError,
  hasUnsavedChanges,
}) => (
  <div className="flex flex-wrap items-center justify-between border-b border-alpha-black-100 bg-gray-100 p-2 shadow-sm">
    <div className="flex items-center space-x-1 sm:space-x-2 my-1">
      <Button
        size="sm"
        variant={editorMode === ConfigEditorMode.EDIT ? "primary" : "secondary"}
        onClick={() => setEditorMode(ConfigEditorMode.EDIT)}
        disabled={isLoading}
        aria-label="Switch to Edit Mode"
      >
        <Icon iconName="edit_note" size="s" className="mr-1" /> Edit
      </Button>
      <Button
        size="sm"
        variant={editorMode === ConfigEditorMode.AI_SUGGESTIONS ? "primary" : "secondary"}
        onClick={() => setEditorMode(ConfigEditorMode.AI_SUGGESTIONS)}
        disabled={isLoading}
        aria-label="Switch to Gemini AI Assistant"
      >
        <Icon iconName="auto_fix_high" size="s" className="mr-1" /> Gemini AI
      </Button>
      <Button
        size="sm"
        variant={editorMode === ConfigEditorMode.HISTORY ? "primary" : "secondary"}
        onClick={() => setEditorMode(ConfigEditorMode.HISTORY)}
        disabled={isLoading}
        aria-label="View Configuration History"
      >
        <Icon iconName="history" size="s" className="mr-1" /> History
      </Button>
      <Button
        size="sm"
        variant={editorMode === ConfigEditorMode.DIFFERENCE ? "primary" : "secondary"}
        onClick={() => setEditorMode(ConfigEditorMode.DIFFERENCE)}
        disabled={isLoading}
        aria-label="View Differences"
      >
        <Icon iconName="compare_arrows" size="s" className="mr-1" /> Diff
      </Button>
    </div>
    <div className="flex items-center space-x-1 sm:space-x-2 my-1">
      {isLoading && (
        <span className="text-sm text-gray-600 flex items-center pr-2">
          <Icon iconName="sync" size="s" className="animate-spin mr-1" /> Loading...
        </span>
      )}
      {validationError && (
        <span className="text-sm text-red-600 flex items-center pr-2" id="json-validation-error">
          <Icon iconName="error" size="s" className="mr-1" /> {validationError}
        </span>
      )}
      <Button size="sm" variant="tertiary" onClick={onFormat} disabled={isLoading || !hasUnsavedChanges || !!validationError}>
        <Icon iconName="code" size="s" className="mr-1" /> Format JSON
      </Button>
      <Button
        size="sm"
        onClick={onReset}
        variant="danger"
        disabled={isLoading}
        aria-label="Reset all local overrides"
      >
        <Icon iconName="undo" size="s" className="mr-1" /> Reset
      </Button>
      <Button
        size="sm"
        onClick={onSave}
        disabled={isLoading || !!validationError || !hasUnsavedChanges}
        aria-label="Save changes"
      >
        <Icon iconName="save" size="s" className="mr-1" /> Save
      </Button>
    </div>
  </div>
);

/**
 * @interface GeminiAIConfigPanelProps
 * @description Props for the GeminiAIConfigPanel component.
 */
export interface GeminiAIConfigPanelProps {
  currentConfig: Record<string, unknown>; // The currently effective configuration
  onApplyPatch: (patch: Record<string, unknown>, description: string) => void; // Callback to apply AI-generated changes
  isLoading: boolean; // General loading state from parent
}

/**
 * @component GeminiAIConfigPanel
 * @description A dedicated panel for Gemini AI features, offering analysis, NL-to-config, and optimization.
 */
export const GeminiAIConfigPanel: React.FC<GeminiAIConfigPanelProps> = ({
  currentConfig,
  onApplyPatch,
  isLoading,
}) => {
  const [analysisReport, setAnalysisReport] = useState<GeminiAnalysisReport | null>(null);
  const [nlQuery, setNlQuery] = useState<string>("");
  const [nlResult, setNlResult] = useState<Record<string, unknown> | null>(null);
  const [nlResultError, setNlResultError] = useState<string | null>(null);
  const [optimizedProposal, setOptimizedProposal] = useState<OptimizedConfigProposal | null>(null);
  const [aiLoading, setAiLoading] = useState(false); // Internal loading state for AI actions
  const [aiError, setAiError] = useState<string | null>(null); // Error specific to AI operations
  const [keyForHelp, setKeyForHelp] = useState<string>(''); // For contextual help feature
  const [contextualHelp, setContextualHelp] = useState<string | null>(null);
  const [contextualHelpLoading, setContextualHelpLoading] = useState(false);

  // Effect to clear AI results when switching config
  useEffect(() => {
    setAnalysisReport(null);
    setNlResult(null);
    setNlResultError(null);
    setOptimizedProposal(null);
    setAiError(null);
    setContextualHelp(null);
  }, [currentConfig]);

  /**
   * @function handleAnalyzeConfig
   * @description Triggers Gemini AI to analyze the current configuration.
   */
  const handleAnalyzeConfig = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAnalysisReport(null);
    try {
      const report = await LiveConfigApiService.geminiAnalyzeConfig(currentConfig);
      setAnalysisReport(report);
      console.info("Gemini AI Configuration Analysis Report:", report);
    } catch (err: any) {
      setAiError(`AI Analysis failed: ${err.message || 'Unknown AI error'}. Please try again.`);
      console.error("AI Analysis error:", err);
    } finally {
      setAiLoading(false);
    }
  }, [currentConfig]);

  /**
   * @function handleNlToConfig
   * @description Sends a natural language query to Gemini AI to generate a config patch.
   */
  const handleNlToConfig = useCallback(async () => {
    if (!nlQuery.trim()) {
      setNlResultError("Please enter a query for the AI to process.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    setNlResult(null);
    setNlResultError(null);
    try {
      const patch = await LiveConfigApiService.geminiNLToConfigPatch(nlQuery, currentConfig);
      setNlResult(patch);
      console.info("Gemini AI Generated NL Patch:", patch);
    } catch (err: any) {
      setAiError(`NL-to-Config failed: ${err.message || 'Unknown AI error'}. Review your query.`);
      console.error("NL-to-Config error:", err);
    } finally {
      setAiLoading(false);
    }
  }, [nlQuery, currentConfig]);

  /**
   * @function handleOptimizeConfig
   * @description Triggers Gemini AI to generate an optimized configuration proposal.
   */
  const handleOptimizeConfig = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setOptimizedProposal(null);
    try {
      const proposal = await LiveConfigApiService.geminiOptimizeConfig(currentConfig);
      setOptimizedProposal(proposal);
      console.info("Gemini AI Optimization Proposal:", proposal);
    } catch (err: any) {
      setAiError(`AI Optimization failed: ${err.message || 'Unknown AI error'}. Please try again.`);
      console.error("AI Optimization error:", err);
    } finally {
      setAiLoading(false);
    }
  }, [currentConfig]);

  /**
   * @function handleGetContextualHelp
   * @description Fetches contextual help for a specific config key from Gemini AI.
   */
  const handleGetContextualHelp = useCallback(async () => {
    if (!keyForHelp.trim()) {
      setContextualHelp("Please enter a configuration key to get contextual help.");
      return;
    }
    setContextualHelpLoading(true);
    setAiError(null);
    setContextualHelp(null);
    try {
        const keyPath = keyForHelp.split('.');
        let value: unknown = currentConfig;
        for (const part of keyPath) {
            if (typeof value === 'object' && value !== null && part in (value as Record<string, unknown>)) {
                value = (value as Record<string, unknown>)[part];
            } else {
                value = undefined; // Key not found
                break;
            }
        }
      const help = await LiveConfigApiService.geminiGetContextualHelp(keyForHelp, value);
      setContextualHelp(help);
      console.info(`Gemini AI Contextual Help for '${keyForHelp}':`, help);
    } catch (err: any) {
      setAiError(`Contextual help failed: ${err.message || 'Unknown AI error'}.`);
      console.error("Contextual help error:", err);
    } finally {
      setContextualHelpLoading(false);
    }
  }, [keyForHelp, currentConfig]);


  return (
    <div className="p-4 space-y-5 overflow-y-auto max-h-full">
      <Heading level="h5" size="m" className="text-indigo-700 border-b pb-2 mb-4">
        <Icon iconName="smart_toy" size="m" className="mr-2" /> Gemini AI Configuration Assistant
      </Heading>

      {aiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">AI Error!</strong>
          <span className="block sm:inline ml-2">{aiError}</span>
        </div>
      )}

      {/* 1. Configuration Health Check & Analysis */}
      <section className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Heading level="h6" size="s" className="text-gray-800">1. Configuration Health Check</Heading>
          <Button size="sm" onClick={handleAnalyzeConfig} disabled={aiLoading || isLoading}>
            <Icon iconName="health_and_safety" size="s" className="mr-1" /> Analyze Config
          </Button>
        </div>
        {(aiLoading && !analysisReport) && <p className="text-gray-600 flex items-center"><Icon iconName="sync" size="s" className="animate-spin mr-2" /> Analyzing configuration health...</p>}
        {analysisReport && (
          <div className="space-y-2 text-sm mt-3">
            <p className="font-medium text-gray-800">Overall Health Score: <span className={`font-bold ${analysisReport.overallScore >= 80 ? 'text-green-600' : analysisReport.overallScore >= 50 ? 'text-orange-600' : 'text-red-600'}`}>{analysisReport.overallScore}/100</span> (Analyzed: {new Date(analysisReport.analysisTimestamp).toLocaleTimeString()})</p>
            {analysisReport.recommendations.length > 0 && (
              <div>
                <p className="font-medium text-blue-700 mt-2 flex items-center"><Icon iconName="lightbulb" size="s" className="mr-1" /> Recommendations:</p>
                <ul className="list-disc ml-5 space-y-1">
                  {analysisReport.recommendations.map((rec, i) => (
                    <li key={i} className={`${rec.severity === 'critical' ? 'text-red-700 font-semibold' : rec.severity === 'high' ? 'text-orange-600' : 'text-gray-700'}`}>
                      <strong>[{rec.severity.toUpperCase()}]</strong> {rec.message}
                      {rec.suggestedFix && (
                        <Button size="xs" variant="tertiary" className="ml-2" onClick={() => onApplyPatch(rec.suggestedFix!, `AI Recommendation: ${rec.message}`)} disabled={isLoading}>
                          Apply Fix
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysisReport.anomaliesDetected.length > 0 && (
              <div>
                <p className="font-medium text-red-700 mt-2 flex items-center"><Icon iconName="warning" size="s" className="mr-1" /> Anomalies Detected:</p>
                <ul className="list-disc ml-5 space-y-1">
                  {analysisReport.anomaliesDetected.map((anomaly, i) => (
                    <li key={i} className="text-red-700 font-medium">
                      <strong>{anomaly.key}:</strong> {anomaly.deviationMessage} (Current: <code className="bg-gray-200 p-0.5 rounded">{JSON.stringify(anomaly.currentValue)}</code>)
                      {anomaly.expectedPattern && <span className="text-gray-600"> Expected: {anomaly.expectedPattern}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysisReport.recommendations.length === 0 && analysisReport.anomaliesDetected.length === 0 && (
              <p className="text-green-600 mt-2 flex items-center"><Icon iconName="check_circle" size="s" className="mr-1" /> No major issues or recommendations found. Your config looks solid!</p>
            )}
          </div>
        )}
      </section>

      {/* 2. Natural Language to Config */}
      <section className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <Heading level="h6" size="s" className="mb-3 text-gray-800">2. Natural Language Configuration</Heading>
        <p className="text-sm text-gray-700 mb-3">Describe the configuration changes you want to make, and Gemini AI will generate a JSON patch:</p>
        <textarea
          className="w-full h-24 resize-y border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder="e.g., 'enable debug mode and set API timeout to 30 seconds', 'change theme to dark mode', 'add a new feature flag called betaFeature and set it to true'"
          value={nlQuery}
          onChange={(e) => { setNlQuery(e.target.value); setNlResultError(null); }}
          disabled={aiLoading || isLoading}
          aria-label="Natural language configuration query"
        ></textarea>
        {nlResultError && <p className="text-red-600 text-xs mt-1">{nlResultError}</p>}
        <Button size="sm" className="mt-3" onClick={handleNlToConfig} disabled={aiLoading || isLoading || !nlQuery.trim()}>
          <Icon iconName="magic_button" size="s" className="mr-1" /> Generate Config Patch
        </Button>
        {(aiLoading && !nlResult) && <p className="text-gray-600 flex items-center mt-3"><Icon iconName="sync" size="s" className="animate-spin mr-2" /> Generating config patch...</p>}
        {nlResult && (
          <div className="mt-4 border-t border-gray-200 pt-3">
            <p className="font-medium text-sm mb-2 text-gray-800 flex items-center"><Icon iconName="spark" size="s" className="mr-1 text-blue-500" /> Generated Patch Preview:</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40 border border-gray-200 shadow-inner">
              <code>{JSON.stringify(nlResult, null, 2)}</code>
            </pre>
            <Button size="sm" className="mt-3" onClick={() => onApplyPatch(nlResult, `AI NL Patch: "${nlQuery}"`)} disabled={isLoading}>
              <Icon iconName="check" size="s" className="mr-1" /> Apply Generated Patch
            </Button>
          </div>
        )}
      </section>

      {/* 3. Configuration Optimization */}
      <section className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Heading level="h6" size="s" className="text-gray-800">3. Optimize Configuration</Heading>
          <Button size="sm" onClick={handleOptimizeConfig} disabled={aiLoading || isLoading}>
            <Icon iconName="tune" size="s" className="mr-1" /> Get Optimization Proposal
          </Button>
        </div>
        {(aiLoading && !optimizedProposal) && <p className="text-gray-600 flex items-center mt-3"><Icon iconName="sync" size="s" className="animate-spin mr-2" /> Generating optimization proposal...</p>}
        {optimizedProposal && (
          <div className="mt-4 space-y-3 text-sm border-t border-gray-200 pt-3">
            <p className="font-medium text-indigo-700 flex items-center"><Icon iconName="auto_fix_high" size="s" className="mr-1" /> Optimization Summary: {optimizedProposal.summary}</p>
            <p className="text-gray-700">{optimizedProposal.explanation}</p>
            {optimizedProposal.metricsImproved.length > 0 && (
              <div>
                <p className="font-medium text-gray-800">Metrics Improved:</p>
                <ul className="list-disc ml-5">
                  {optimizedProposal.metricsImproved.map((metric, i) => (
                    <li key={i}>
                      {metric.metric}: <span className="text-red-500 line-through">{metric.before}</span> &rarr; <span className="text-green-600 font-semibold">{metric.after}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="font-medium mt-2 text-gray-800">Proposed Optimized Config (Preview):</p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40 border border-gray-200 shadow-inner">
              <code>{JSON.stringify(optimizedProposal.proposedConfig, null, 2)}</code>
            </pre>
            <Button size="sm" className="mt-3" onClick={() => onApplyPatch(optimizedProposal.proposedConfig, "AI Optimization Proposal")} disabled={isLoading}>
              <Icon iconName="rocket_launch" size="s" className="mr-1" /> Apply Optimized Config
            </Button>
          </div>
        )}
      </section>

      {/* 4. Contextual Help */}
      <section className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <Heading level="h6" size="s" className="mb-3 text-gray-800">4. Contextual Help</Heading>
        <p className="text-sm text-gray-700 mb-3">Enter a configuration key (e.g., `apiTimeout`, `featureFlags.beta`) to get instant explanations and best practices from Gemini AI:</p>
        <div className="flex space-x-2">
            <input
                type="text"
                className="flex-grow border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., debugMode or database.host"
                value={keyForHelp}
                onChange={(e) => setKeyForHelp(e.target.value)}
                disabled={contextualHelpLoading || isLoading}
                aria-label="Configuration key for contextual help"
            />
            <Button size="sm" onClick={handleGetContextualHelp} disabled={contextualHelpLoading || isLoading || !keyForHelp.trim()}>
                <Icon iconName="question_mark" size="s" className="mr-1" /> Get Help
            </Button>
        </div>
        {(contextualHelpLoading && !contextualHelp) && <p className="text-gray-600 flex items-center mt-3"><Icon iconName="sync" size="s" className="animate-spin mr-2" /> Fetching contextual help...</p>}
        {contextualHelp && (
            <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: contextualHelp }}>
            </div>
        )}
      </section>
    </div>
  );
};

/**
 * @interface ConfigHistoryPanelProps
 * @description Props for the ConfigHistoryPanel component.
 */
export interface ConfigHistoryPanelProps {
  history: ConfigHistoryEntry[];
  onApplyHistory: (entry: ConfigHistoryEntry) => void;
  isLoading: boolean;
}

/**
 * @component ConfigHistoryPanel
 * @description Displays a scrollable list of local configuration override history entries.
 */
export const ConfigHistoryPanel: React.FC<ConfigHistoryPanelProps> = ({
  history,
  onApplyHistory,
  isLoading,
}) => (
  <div className="p-4 space-y-4 max-h-full overflow-y-auto">
    <Heading level="h5" size="m" className="border-b pb-2 mb-4">
        <Icon iconName="history" size="m" className="mr-2" /> Local Config Override History
    </Heading>
    <p className="text-sm text-gray-700">Review and apply previous versions of your local overrides. This history is stored client-side.</p>
    {history.length === 0 ? (
      <p className="text-gray-500 text-center py-8 flex items-center justify-center">
        <Icon iconName="info" size="m" className="mr-2" /> No history entries yet. Save some changes to see them here.
      </p>
    ) : (
      <div className="space-y-3 pr-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow duration-200 ease-in-out"
            tabIndex={0}
            role="button"
            aria-label={`Apply config from ${new Date(entry.timestamp).toLocaleString()} - ${entry.changeDescription}`}
          >
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="font-medium text-gray-800">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
              <span className="text-gray-600 text-xs">
                By: {entry.user || "System/Unknown"}
              </span>
            </div>
            <p className="text-xs text-gray-500 italic mb-2">
              {entry.changeDescription}
            </p>
            <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-24 opacity-90 pointer-events-none border border-gray-100 shadow-inner">
              <code>{JSON.stringify(entry.config, null, 2)}</code>
            </pre>
            <div className="mt-3 text-right">
                <Button size="xs" variant="secondary" onClick={(e) => { e.stopPropagation(); onApplyHistory(entry); }} disabled={isLoading}>
                    <Icon iconName="restore" size="s" className="mr-1" /> Apply This Version
                </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * @interface ConfigDiffViewerProps
 * @description Props for the ConfigDiffViewer component.
 */
export interface ConfigDiffViewerProps {
  originalConfig: Record<string, unknown>; // The baseline config (e.g., last saved overrides)
  editorValue: string; // The raw string content of the current editor
  isLoading: boolean;
}

/**
 * @component ConfigDiffViewer
 * @description Provides a clear visualization of changes between the current editor content
 *              and a baseline configuration (typically the last saved version).
 */
export const ConfigDiffViewer: React.FC<ConfigDiffViewerProps> = ({
  originalConfig,
  editorValue,
  isLoading,
}) => {
  const [diffResult, setDiffResult] = useState<ReturnType<typeof calculateJsonDiff> | null>(null);
  const [parsedEditorConfig, setParsedEditorConfig] = useState<Record<string, unknown> | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!isValidJson(editorValue)) {
        setDiffError("Editor content is not valid JSON. Cannot generate diff.");
        setParsedEditorConfig(null);
        setDiffResult(null);
        return;
      }
      const parsed = JSON.parse(editorValue);
      setParsedEditorConfig(parsed);
      const diff = calculateJsonDiff(originalConfig, parsed); // Compare last saved overrides with current editor content
      setDiffResult(diff);
      setDiffError(null);
    } catch (e: any) {
      setDiffError(`Error parsing editor content for diff: ${e.message || 'Unknown parsing error'}.`);
      setParsedEditorConfig(null);
      setDiffResult(null);
    }
  }, [editorValue, originalConfig]); // Recalculate diff if editor value or original config changes

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500 py-8">
        <Icon iconName="sync" size="xl" className="animate-spin mx-auto mb-3 text-blue-500" />
        <p className="text-lg">Loading configuration for diff comparison...</p>
      </div>
    );
  }

  if (diffError) {
    return (
      <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center min-h-[150px]">
        <Icon iconName="error" size="l" className="mr-3" /> <span className="font-medium text-base">{diffError}</span>
      </div>
    );
  }

  if (!diffResult || diffResult.noChanges) {
    return (
      <div className="p-4 text-center text-gray-600 py-8">
        <Icon iconName="check_circle" size="xl" className="text-green-500 mx-auto mb-3" />
        <p className="text-lg font-medium">No differences detected between current editor content and last saved overrides.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-h-full overflow-y-auto">
      <Heading level="h5" size="m" className="border-b pb-2 mb-4">
        <Icon iconName="compare_arrows" size="m" className="mr-2" /> Configuration Difference
      </Heading>
      <p className="text-sm text-gray-700">Comparing current editor content (your proposed changes) with the last successfully saved local overrides.</p>

      {diffResult.added.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
          <Heading level="h6" size="s" className="text-green-800 flex items-center mb-2">
            <Icon iconName="add_circle" size="s" className="mr-2" /> Added Keys ({diffResult.added.length})
          </Heading>
          <ul className="list-disc ml-5 text-sm text-green-900 space-y-1">
            {diffResult.added.map((key) => (
              <li key={key}>
                <strong>{key}:</strong> <code className="bg-green-100 p-0.5 rounded text-xs">{JSON.stringify((parsedEditorConfig || {})[key], null, 2)}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diffResult.removed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
          <Heading level="h6" size="s" className="text-red-800 flex items-center mb-2">
            <Icon iconName="remove_circle" size="s" className="mr-2" /> Removed Keys ({diffResult.removed.length})
          </Heading>
          <ul className="list-disc ml-5 text-sm text-red-900 space-y-1">
            {diffResult.removed.map((key) => (
              <li key={key}>
                <strong>{key}:</strong> <code className="bg-red-100 p-0.5 rounded text-xs">{JSON.stringify(originalConfig[key], null, 2)}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {diffResult.changed.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm">
          <Heading level="h6" size="s" className="text-yellow-800 flex items-center mb-2">
            <Icon iconName="change_circle" size="s" className="mr-2" /> Changed Keys ({diffResult.changed.length})
          </Heading>
          <ul className="list-disc ml-5 text-sm text-yellow-900 space-y-1">
            {diffResult.changed.map((key) => (
              <li key={key} className="mb-2">
                <strong className="block mb-1">{key}:</strong>
                <div className="flex flex-col space-y-1">
                    <p className="flex items-start text-red-700">
                        <Icon iconName="arrow_right_alt" size="xs" className="inline-block mr-1 mt-1 rotate-180 flex-shrink-0" /> <span className="font-semibold text-gray-700 mr-1">Old:</span> <code className="bg-yellow-100 p-0.5 rounded text-xs flex-grow">{JSON.stringify(originalConfig[key], null, 2)}</code>
                    </p>
                    <p className="flex items-start text-green-700">
                        <Icon iconName="arrow_right_alt" size="xs" className="inline-block mr-1 mt-1 flex-shrink-0" /> <span className="font-semibold text-gray-700 mr-1">New:</span> <code className="bg-yellow-100 p-0.5 rounded text-xs flex-grow">{JSON.stringify((parsedEditorConfig || {})[key], null, 2)}</code>
                    </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * @component LiveConfigEditor
 * @description The main entry component for the advanced live configuration editor.
 *              It orchestrates the various sub-components, state management, and AI integrations.
 */
function LiveConfigEditor() {
  const {
    currentConfig,
    editorValue,
    setEditorValue,
    isLoading,
    error,
    validationError,
    history,
    editorMode,
    setEditorMode,
    handleSave,
    handleReset,
    handleApplyHistory,
    handleApplyGeminiPatch,
    loadConfigs,
    initialLoadComplete,
    lastSavedConfig,
    remoteDefaultConfig,
    hasUnsavedChanges,
  } = useConfigEditorState();

  const handleFormatJson = useCallback(() => {
    if (isValidJson(editorValue)) {
      setEditorValue(formatJson(editorValue));
    } else {
      // The `setEditorValue` already handles setting `validationError`
      // Optionally provide more explicit user feedback here if needed
      console.warn("Attempted to format invalid JSON.");
    }
  }, [editorValue, setEditorValue]);

  // Provide user a clear indicator if initial load is still in progress
  if (!initialLoadComplete && isLoading) {
    return (
      <div className="fixed bottom-20 right-6 z-40">
         <div className="flex h-12 w-12 items-center justify-center rounded-full border border-alpha-black-200 bg-blue-500 text-center shadow-lg animate-pulse">
            <Icon iconName="sync" size="l" className="text-white" />
         </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <Popover>
        <PopoverTrigger as="button" className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
          <Heading
            level="h4"
            size="l"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-alpha-black-200 bg-white text-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Icon iconName="settings_1" size="l" />
          </Heading>
        </PopoverTrigger>
        <PopoverPanel
          className="bg-white border border-gray-200 rounded-lg shadow-xl"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          style={{ width: EDITOR_SETTINGS.EDITOR_WIDTH_PX, height: EDITOR_SETTINGS.EDITOR_HEIGHT_PX }}
        >
          {({ close }) => (
            <div className="flex flex-col h-full w-full">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <Heading level="h4" size="l" className="text-gray-900 flex items-center">
                  <Icon iconName="build" size="l" className="mr-2 text-blue-600" /> Advanced LiveConfig Editor
                </Heading>
                <Button size="sm" variant="ghost" onClick={close} aria-label="Close editor">
                  <Icon iconName="close" size="m" />
                </Button>
              </div>

              {/* Description */}
              <p className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 bg-white">
                This powerful editor allows you to manage local configuration overrides for your development environment,
                enhanced with Gemini AI assistance. Changes made here only affect your local setup.
              </p>

              {/* Toolbar */}
              <ConfigEditorToolbar
                editorMode={editorMode}
                setEditorMode={setEditorMode}
                onSave={() => handleSave(close)}
                onReset={handleReset}
                onFormat={handleFormatJson}
                isLoading={isLoading}
                validationError={validationError}
                hasUnsavedChanges={hasUnsavedChanges}
              />

              {/* Main Content Area with Loading/Error Overlays */}
              <div className="flex-grow overflow-hidden relative">
                {/* Global Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-20">
                    <Icon iconName="sync" size="xl" className="animate-spin text-blue-500 mb-4" />
                    <span className="text-xl font-medium text-blue-700">Loading Configuration Data...</span>
                    <p className="text-sm text-gray-600 mt-2">Please wait while data is fetched and processed.</p>
                  </div>
                )}
                {/* Global Error Overlay */}
                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 bg-opacity-95 z-30 p-4 text-red-800 text-center">
                    <Icon iconName="error_outline" size="xl" className="mr-3 text-red-600" />
                    <span className="text-xl font-medium mb-3">Critical Error: {error}</span>
                    <p className="text-sm text-gray-700 mb-4">
                        A problem occurred while loading or processing the configuration.
                        Please ensure your backend services are running and accessible.
                    </p>
                    <Button size="sm" variant="tertiary" onClick={loadConfigs}>
                      <Icon iconName="refresh" size="s" className="mr-2" /> Retry Loading
                    </Button>
                  </div>
                )}

                {/* Content based on Editor Mode */}
                {!isLoading && !error && (
                  <>
                    {editorMode === ConfigEditorMode.EDIT && (
                      <textarea
                        className={`h-full w-full resize-none border-none p-4 font-mono text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-150 ${validationError ? 'bg-red-50 focus:ring-red-500' : 'bg-gray-50'}`}
                        spellCheck="false"
                        value={editorValue}
                        onChange={(e) => setEditorValue(e.target.value)}
                        aria-label="Live Configuration Editor"
                        aria-describedby={validationError ? "json-validation-error" : undefined}
                        disabled={isLoading}
                      />
                    )}

                    {editorMode === ConfigEditorMode.AI_SUGGESTIONS && (
                      <GeminiAIConfigPanel
                        currentConfig={currentConfig} // Pass effective config for AI context
                        onApplyPatch={handleApplyGeminiPatch}
                        isLoading={isLoading}
                      />
                    )}

                    {editorMode === ConfigEditorMode.HISTORY && (
                      <ConfigHistoryPanel
                        history={history}
                        onApplyHistory={handleApplyHistory}
                        isLoading={isLoading}
                      />
                    )}

                    {editorMode === ConfigEditorMode.DIFFERENCE && (
                      <ConfigDiffViewer
                        originalConfig={lastSavedConfig} // Compare with last saved overrides
                        editorValue={editorValue} // Compare with current editor content
                        isLoading={isLoading}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </PopoverPanel>
      </Popover>
    </div>
  );
}

export default LiveConfigEditor;
```