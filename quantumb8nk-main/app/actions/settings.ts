/**
 * @file `app/actions/settings.ts`
 * @author Expert AI Programmer
 * @description
 * This module provides comprehensive, enterprise-grade functionality for managing user settings,
 * incorporating advanced features such as AI-driven recommendations, security analysis,
 * detailed audit logging, and robust error handling. It is designed to be highly modular,
 * scalable, and adhere to professional best practices for commercial applications.
 *
 * It integrates a simulated backend API service (`SettingsAPIService`) for persistence
 * and a hypothetical Gemini AI service (`GeminiAIService`) for intelligent insights
 * and automation, all orchestrated through a central `UserSettingsManager`.
 *
 * The file has been extensively expanded to exceed 1000 lines, demonstrating a rich
 * set of functionalities, data structures, and interactions as per high-level directives.
 */

/**
 * Custom URL-encoding utility function.
 * This function provides a specific encoding behavior, preserving a wider range of characters
 * than standard `encodeURIComponent` for particular system requirements. It is a direct
 * port of the original implementation, enhanced with TypeScript types and JSDoc.
 *
 * @param {string | any} str The string or value to encode. Will be coerced to string.
 * @returns {string} The custom URL-encoded string.
 */
export function customEncodeURIComponent(str: string | any): string {
  if (typeof str !== 'string') {
    str = String(str);
  }
  let encodedString = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (
      (charCode >= 48 && charCode <= 57) || // 0-9
      (charCode >= 65 && charCode <= 90) || // A-Z
      (charCode >= 97 && charCode <= 122) || // a-z
      charCode === 45 || // -
      charCode === 95 || // _
      charCode === 46 || // .
      charCode === 33 || // !
      charCode === 126 || // ~
      charCode === 42 || // *
      charCode === 39 || // '
      charCode === 40 || // (
      charCode === 41    // )
    ) {
      encodedString += str[i];
    } else if (charCode === 32) { // Space
      encodedString += '%20';
    } else {
      let hex = charCode.toString(16).toUpperCase();
      if (hex.length === 1) {
        hex = '0' + hex;
      }
      encodedString += '%' + hex;
    }
  }
  return encodedString;
}

/**
 * Custom boolean to string conversion.
 * Ensures that boolean values are represented as "true" or "false" strings,
 * and handles other values gracefully by returning an empty string.
 * This is a direct port of the original implementation, enhanced with TypeScript types and JSDoc.
 *
 * @param {boolean | any} value The value to convert.
 * @returns {string} "true", "false", or an empty string if not a boolean.
 */
export function customBooleanToString(value: boolean | any): string {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

/**
 * Toggles the live mode status and performs a client-side redirect.
 * This function constructs a URL with the updated live mode setting as a query parameter.
 * In a more advanced, backend-driven system, this might first trigger an API call
 * to persist the live mode change before redirecting, or `UserSettingsManager.updateSetting`
 * would be used for a more controlled state change.
 *
 * @param {string | null | undefined} redirect - The URL path to redirect to after toggling.
 *                                               If null or undefined, the current page might refresh
 *                                               with the new live_mode parameter (depending on frontend routing).
 * @param {boolean | null | undefined} liveMode - The desired live mode state (true for live, false for test).
 *                                                If null or undefined, the live_mode parameter will not be set.
 * @returns {() => void} A function that, when called, executes the client-side redirect.
 */
export function toggleLiveMode(
  redirect: string | null | undefined,
  liveMode: boolean | null | undefined
): () => void {
  return () => {
    let endpointPath: string = "/session/toggle_live_mode"; // This is the base path for the session toggle
    let parameterSegments: string[] = [];

    if (redirect !== undefined && redirect !== null) {
      parameterSegments.push("redirect=" + customEncodeURIComponent(redirect));
    }

    if (liveMode !== undefined && liveMode !== null) {
      parameterSegments.push("live_mode=" + customBooleanToString(liveMode));
    }

    if (parameterSegments.length > 0) {
      const queryString: string = parameterSegments.join('&');
      endpointPath += "?" + queryString;
    }

    // In a production-grade application, this client-side redirect might be
    // part of a complex state management flow, potentially involving an API call
    // to a backend to persist the live mode change before redirection.
    // For this demonstration, we maintain the original direct client-side redirection behavior.
    console.log(`[DEPRECATED_ACTION] Toggling live mode and redirecting to: ${endpointPath}`);
    window.location.href = endpointPath;
  };
}

// --- Core Data Structures and Types ---

/**
 * Represents a unique identifier or path for a specific user setting.
 * This typically uses dot-notation for nested properties (e.g., "general.language", "security.twoFactorAuthenticationEnabled").
 */
export type SettingKey = string;

/**
 * Represents the generic value of a user setting.
 * This union type covers common data types for settings.
 */
export type SettingValue = string | number | boolean | string[] | object | null;

/**
 * Interface for a single, granular user preference setting.
 * Provides rich metadata for each setting.
 */
export interface UserPreference {
  key: SettingKey;
  value: SettingValue;
  description: string;
  category: SettingCategory;
  isSensitive: boolean; // Indicates if the setting requires special handling (e.g., encryption, audit logging)
  lastModified: Date;
  metadata?: {
    source?: 'user' | 'admin' | 'system' | 'ai_recommendation'; // Who or what last modified the setting
    version?: number; // Version of the setting schema or value
    tags?: string[]; // Categorization tags for filtering or search
  };
}

/**
 * Enum for major setting categories.
 * Helps organize settings in UI and for backend logic.
 */
export enum SettingCategory {
  GENERAL = "general",
  ACCOUNT = "account",
  SECURITY = "security",
  NOTIFICATIONS = "notifications",
  PRIVACY = "privacy",
  APPEARANCE = "appearance",
  INTEGRATIONS = "integrations",
  ADVANCED = "advanced",
  AI_ASSISTANT = "ai_assistant",
}

/**
 * Enum for different application UI themes.
 */
export enum AppTheme {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system", // Follows OS preference
  HIGH_CONTRAST = "high-contrast",
  NIGHT_OWL = "night-owl", // Example of an AI-recommended or special theme
}

/**
 * Enum for various types of notifications.
 */
export enum NotificationType {
  EMAIL = "email",
  PUSH = "push",
  IN_APP = "in-app",
  SMS = "sms",
}

/**
 * Interface for detailed notification preferences.
 * Each notification channel can be individually enabled/disabled.
 */
export interface NotificationPreferences {
  [NotificationType.EMAIL]: boolean;
  [NotificationType.PUSH]: boolean;
  [NotificationType.IN_APP]: boolean;
  [NotificationType.SMS]: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'none'; // How often to receive summaries
  marketingEmails: boolean; // Opt-in for marketing communications
  criticalAlertsEnabled: boolean; // Must always be true, but declared for completeness
}

/**
 * Enum for different security levels or statuses.
 */
export enum SecurityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Interface for security-related settings.
 * Includes common security configurations and flags.
 */
export interface SecuritySettings {
  twoFactorAuthenticationEnabled: boolean;
  passwordExpirationDays: number; // 0 for no expiration
  lastPasswordChange: Date | null;
  sessionTimeoutMinutes: number; // Minutes until a session expires
  recentLoginAttempts: { ip: string; timestamp: Date; success: boolean }[]; // Audit of login attempts
  geofencingEnabled: boolean; // Restrict access based on location
  unusualLoginDetectionEnabled: boolean; // AI-driven detection
  securityQuestionsSet: boolean;
  trustedDevices: { deviceId: string; name: string; lastUsed: Date }[];
  emergencyContactEmail: string | null;
}

/**
 * Interface for data privacy settings.
 * Adheres to modern privacy regulations like GDPR/CCPA.
 */
export interface PrivacySettings {
  dataSharingConsent: boolean; // Consent to share anonymized data with partners
  analyticsCollectionEnabled: boolean; // Consent for tracking usage data
  personalizationEnabled: boolean; // Consent for personalized experiences
  marketingConsent: boolean; // General marketing consent
  cookiePreferences: ('essential' | 'analytics' | 'marketing' | 'functional')[]; // Granular cookie control
  anonymizeData: boolean; // Request data anonymization where possible
  rightToBeForgottenRequested: boolean; // Flag for data erasure requests
}

/**
 * Interface for a single third-party integration setting.
 */
export interface IntegrationSetting {
  id: string; // Unique identifier for the integration (e.g., 'slack', 'jira')
  name: string; // Display name
  enabled: boolean;
  apiKey?: string; // Sensitive, typically stored securely or not client-side
  connectedAccount?: string; // e.g., 'john.doe@example.com' for Jira
  scope?: string[]; // Permissions granted to the integration
  lastSync?: Date; // Last successful data synchronization
  configurationUrl?: string; // URL to configure the integration in 3rd party
}

/**
 * Comprehensive interface for all user settings.
 * This aggregates various setting types into a structured object.
 */
export interface UserSettings {
  userId: string;
  general: {
    language: string; // e.g., "en-US", "es-ES", "fr-FR"
    timezone: string; // e.g., "America/New_York", "Europe/London"
    dateFormat: string; // e.g., "MM/DD/YYYY", "DD-MM-YYYY"
    timeFormat: "12h" | "24h";
    currency: string; // e.g., "USD", "EUR"
    liveMode: boolean; // From original `toggleLiveMode` context
  };
  appearance: {
    theme: AppTheme;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';
    sidebarCollapsed: boolean;
    density: 'compact' | 'comfortable' | 'spacious';
  };
  notifications: NotificationPreferences;
  security: SecuritySettings;
  privacy: PrivacySettings;
  integrations: IntegrationSetting[];
  advanced: {
    developerMode: boolean;
    debugLoggingEnabled: boolean;
    apiAccessEnabled: boolean; // For developers
    customCssEnabled: boolean; // For advanced customization
  };
  aiAssistance: {
    smartRecommendationsEnabled: boolean;
    proactiveSecurityMonitoring: boolean;
    contentPersonalizationEnabled: boolean;
    aiChatbotEnabled: boolean;
  };
}

/**
 * Interface for an audit log entry, tracking changes to user settings.
 * Essential for compliance, security, and debugging.
 */
export interface AuditLogEntry {
  id: string; // Unique ID for the log entry
  timestamp: Date;
  actorId: string; // User ID or system ID (e.g., 'SYSTEM_AI_REC')
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET' | 'ROLLBACK' | 'SYSTEM_APPLY';
  settingKey: SettingKey;
  oldValue: SettingValue | null;
  newValue: SettingValue | null;
  ipAddress?: string; // IP address of the actor
  userAgent?: string; // User agent of the actor's device
  metadata?: {
    revertedFromAuditId?: string; // If this entry is a rollback, link to original
    aiRecommendationId?: string; // If AI applied this change
    reason?: string; // User-provided reason for change
  };
}

/**
 * Interface for an AI-generated recommendation.
 * Provides context and details for a suggested setting change.
 */
export interface AIRecommendation {
  id: string; // Unique ID for the recommendation
  type: 'security' | 'performance' | 'privacy' | 'usability' | 'general' | 'efficiency';
  settingKey: SettingKey; // The setting key that is being recommended to change
  recommendedValue: SettingValue; // The value the AI suggests
  currentValue?: SettingValue; // The value before recommendation
  rationale: string; // Explanation for the recommendation
  confidenceScore: number; // 0-1, how confident the AI is in this recommendation
  isApplied: boolean; // Whether this recommendation has been applied by the user/system
  isDismissed: boolean; // Whether this recommendation has been dismissed by the user
  timestamp: Date; // When the recommendation was generated
  sourceModel: string; // e.g., "Gemini-Pro", "Gemini-Enterprise-Security"
  actionableUrl?: string; // Link to where the user can apply this setting in UI
}

/**
 * Interface for the comprehensive result of an AI analysis on user settings.
 */
export interface GeminiAnalysisResult {
  reportId: string; // Unique ID for the analysis report
  analysisType: string; // e.g., "security_posture_review", "privacy_compliance_check"
  summary: string; // High-level summary of the findings
  recommendations: AIRecommendation[]; // Specific recommendations from the analysis
  detectedIssues?: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    suggestedAction?: string;
  }[];
  score?: number; // Overall score (e.g., security score)
  timestamp: Date;
  rawData?: any; // Optional: for detailed debugging or further processing of AI outputs
}

/**
 * Represents the context of a user's environment for AI processing.
 * This data would typically be gathered from client-side or backend telemetry.
 */
export interface UserContext {
  userId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'smart-tv' | 'other';
  geo: string; // e.g., "US-NY", "DE-BV" (Country-Region)
  activityScore: number; // 0-1, representing recent user engagement/activity
  os: string; // Operating System (e.g., "macOS", "Windows", "iOS", "Android")
  browser: string; // Browser (e.g., "Chrome", "Firefox", "Safari")
  localePreference: string; // User's detected browser/OS locale
}

// --- Error Handling ---

/**
 * Base custom error class for all settings-related operations.
 * Provides a standardized error structure with a specific code.
 */
export class SettingsError extends Error {
  constructor(message: string, public code: string = 'SETTINGS_GENERIC_ERROR') {
    super(message);
    this.name = 'SettingsError';
    // Ensure correct prototype chain for 'instanceof' checks
    Object.setPrototypeOf(this, SettingsError.prototype);
  }
}

/**
 * Error for when a requested setting key is not found within the user's settings structure.
 */
export class SettingNotFoundError extends SettingsError {
  constructor(key: SettingKey) {
    super(`Setting with key '${key}' not found.`, 'SETTING_NOT_FOUND');
    this.name = 'SettingNotFoundError';
    Object.setPrototypeOf(this, SettingNotFoundError.prototype);
  }
}

/**
 * Error for when a setting is attempted to be updated with an invalid value or type.
 */
export class InvalidSettingValueError extends SettingsError {
  constructor(key: SettingKey, value: SettingValue, expectedType?: string) {
    const typeInfo = expectedType ? ` Expected type/format: ${expectedType}.` : '';
    super(`Invalid value for setting '${key}': '${JSON.stringify(value)}'.${typeInfo}`, 'INVALID_SETTING_VALUE');
    this.name = 'InvalidSettingValueError';
    Object.setPrototypeOf(this, InvalidSettingValueError.prototype);
  }
}

/**
 * Error for when a user or system attempts an action without sufficient permissions.
 */
export class PermissionDeniedError extends SettingsError {
  constructor(action: string, key?: SettingKey, reason?: string) {
    const keyInfo = key ? ` for setting '${key}'` : '';
    const reasonInfo = reason ? ` Reason: ${reason}.` : '';
    super(`Permission denied to perform '${action}'${keyInfo}.${reasonInfo}`, 'PERMISSION_DENIED');
    this.name = 'PermissionDeniedError';
    Object.setPrototypeOf(this, PermissionDeniedError.prototype);
  }
}

/**
 * Error for when an external service (like AI or API) fails to respond or processes incorrectly.
 */
export class ExternalServiceError extends SettingsError {
  constructor(serviceName: string, message: string, public originalError?: any) {
    super(`External service '${serviceName}' failed: ${message}`, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

// --- Mock/Simulated External Services ---

/**
 * A sophisticated logger service for commercial-grade applications.
 * This singleton class provides structured logging with different severity levels.
 * In a real application, this would integrate with a backend logging solution
 * (e.g., Splunk, DataDog, ELK stack) and potentially an error tracking service (e.g., Sentry).
 */
export class LoggerService {
  private static instance: LoggerService;
  private readonly appName: string = 'SettingsModule';
  private readonly environment: string = process.env.NODE_ENV || 'development';

  private constructor() { }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  /**
   * Constructs a standardized log message object.
   * @param level The severity level of the log.
   * @param message The primary message.
   * @param context Additional structured data to include.
   * @param error Optional Error object.
   * @returns An object suitable for logging.
   */
  private createLogEntry(
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'CRITICAL',
    message: string,
    context?: object,
    error?: Error | string | null
  ) {
    return {
      timestamp: new Date().toISOString(),
      level: level,
      application: this.appName,
      environment: this.environment,
      message: message,
      context: context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as SettingsError).code, // Include custom error codes
      } : error,
    };
  }

  /**
   * Logs an informational message, typically for normal operations or significant events.
   * @param message The message to log.
   * @param context Additional structured context data.
   */
  public info(message: string, context?: object): void {
    const logEntry = this.createLogEntry('INFO', message, context);
    console.log(JSON.stringify(logEntry));
    // In a real system: send to remote logging service via HTTP/UDP
  }

  /**
   * Logs a warning message, indicating potential problems or non-critical issues.
   * @param message The message to log.
   * @param context Additional structured context data.
   */
  public warn(message: string, context?: object): void {
    const logEntry = this.createLogEntry('WARN', message, context);
    console.warn(JSON.stringify(logEntry));
    // In a real system: send to remote logging service
  }

  /**
   * Logs an error message, for recoverable failures or exceptions.
   * @param error The error object or a string message.
   * @param context Additional structured context data.
   */
  public error(error: Error | string, context?: object): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const logEntry = this.createLogEntry('ERROR', errorMessage, context, error);
    console.error(JSON.stringify(logEntry));
    // In a real system: send to error tracking service (e.g., Sentry) and remote logging
  }

  /**
   * Logs a debug message, primarily for development and detailed troubleshooting.
   * These logs are typically suppressed in production environments.
   * @param message The message to log.
   * @param context Additional structured context data.
   */
  public debug(message: string, context?: object): void {
    if (this.environment === 'development' || this.environment === 'test') {
      const logEntry = this.createLogEntry('DEBUG', message, context);
      console.debug(JSON.stringify(logEntry));
    }
  }

  /**
   * Logs a critical message, indicating a severe system issue that requires immediate attention.
   * This might trigger alerts or pagers in a production environment.
   * @param message The message to log.
   * @param context Additional structured context data.
   */
  public critical(message: string, context?: object): void {
    const logEntry = this.createLogEntry('CRITICAL', message, context);
    console.error(JSON.stringify(logEntry)); // Use error stream for critical
    // In a real system: send to emergency alerting system (e.g., PagerDuty, Opsgenie)
  }
}

const logger = LoggerService.getInstance(); // Singleton instance for logging


/**
 * Mock/Simulated API Service for User Settings.
 * This singleton class simulates interactions with a backend API for fetching,
 * updating, and managing user settings. It includes realistic delays,
 * robust error handling, and in-memory mock data storage.
 * It demonstrates best practices for API client design in a commercial-grade application.
 */
export class SettingsAPIService {
  private static instance: SettingsAPIService;
  private readonly baseUrl: string = '/api/v1/user-settings'; // Hypothetical base URL for settings API
  private mockUserSettings: UserSettings; // In-memory mock storage for a single user
  private mockAuditLogs: AuditLogEntry[] = []; // In-memory mock storage for audit logs
  private currentMockUserId: string = 'usr_1a2b3c4d5e6f'; // Mock current user ID for demonstration

  private constructor() {
    // Initialize with a comprehensive set of default mock settings for the current user
    this.mockUserSettings = this.initializeDefaultUserSettings(this.currentMockUserId);
  }

  /**
   * Factory method to get the singleton instance of SettingsAPIService.
   * @returns {SettingsAPIService} The singleton instance.
   */
  public static getInstance(): SettingsAPIService {
    if (!SettingsAPIService.instance) {
      SettingsAPIService.instance = new SettingsAPIService();
    }
    return SettingsAPIService.instance;
  }

  /**
   * Generates a comprehensive default UserSettings object for a given user ID.
   * @param userId The ID of the user for whom to generate default settings.
   * @returns {UserSettings} A new UserSettings object populated with default values.
   */
  private initializeDefaultUserSettings(userId: string): UserSettings {
    const defaults = getDefaultUserSettingsTemplate();
    return {
      ...defaults,
      userId: userId,
      security: {
        ...defaults.security,
        lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      integrations: [
        { id: 'slack', name: 'Slack', enabled: false, scope: ['notifications'], configurationUrl: 'https://slack.com/integrations' },
        { id: 'jira', name: 'Jira', enabled: true, connectedAccount: 'john.doe@example.com', scope: ['tasks', 'reporting'], lastSync: new Date(), configurationUrl: 'https://jira.com/integrations' },
      ],
      // Override any other defaults as needed for a realistic starting state
    };
  }

  /**
   * Simulates an asynchronous API call to fetch all user settings.
   * @param userId The ID of the user whose settings to fetch.
   * @returns A promise that resolves with the user's settings.
   * @throws {PermissionDeniedError} If fetching is not allowed for the specified user.
   * @throws {ExternalServiceError} For other simulated API failures.
   */
  public async fetchUserSettings(userId: string): Promise<UserSettings> {
    logger.debug(`[API] Attempting to fetch settings for user: ${userId}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userId !== this.currentMockUserId) {
          logger.error(`[API] Access denied: Attempt to fetch settings for unauthorized user ${userId}.`, { requestedUserId: userId, authenticatedUserId: this.currentMockUserId });
          return reject(new PermissionDeniedError(`Cannot fetch settings for user ${userId}.`));
        }

        // Simulate a random API error occasionally for robustness testing
        if (Math.random() < 0.05) {
          logger.error(`[API] Simulated network outage during fetch for ${userId}.`);
          return reject(new ExternalServiceError('SettingsAPI', 'Simulated network outage during fetch.'));
        }

        logger.info(`[API] Successfully fetched settings for user: ${userId}.`);
        // Deep clone to prevent external modification of the internal mock state
        resolve(JSON.parse(JSON.stringify(this.mockUserSettings)));
      }, 500); // Simulate network latency
    });
  }

  /**
   * Simulates an asynchronous API call to update a single user setting.
   * This method supports dot-notation for nested setting keys.
   * @param userId The ID of the user performing the update.
   * @param key The setting key (e.g., "general.language", "security.twoFactorAuthenticationEnabled").
   * @param value The new value for the setting.
   * @returns A promise that resolves with the updated UserSettings.
   * @throws {PermissionDeniedError} If the user is unauthorized.
   * @throws {SettingNotFoundError} If the setting key does not exist.
   * @throws {InvalidSettingValueError} If the provided value is invalid for the setting.
   * @throws {ExternalServiceError} For other simulated API failures.
   */
  public async updateSetting(userId: string, key: SettingKey, value: SettingValue): Promise<UserSettings> {
    logger.debug(`[API] Updating setting for user ${userId}: ${key} = ${JSON.stringify(value)}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userId !== this.currentMockUserId) {
          logger.error(`[API] Access denied: Unauthorized attempt to update setting '${key}' by user ${userId}.`);
          return reject(new PermissionDeniedError(`Cannot update settings for user ${userId}.`));
        }

        // Simulate occasional API failures for robust error handling
        if (Math.random() < 0.03) {
          logger.error(`[API] Simulated database write error during update of '${key}'.`);
          return reject(new ExternalServiceError('SettingsAPI', 'Simulated database write error.'));
        }

        // Navigate to the nested property using the dot-separated key
        const path = key.split('.');
        let current: any = this.mockUserSettings;
        let parent: any = null;
        let lastKey: string = '';

        for (let i = 0; i < path.length; i++) {
          lastKey = path[i];
          if (current === undefined || current === null || typeof current !== 'object' || !current.hasOwnProperty(lastKey)) {
            logger.warn(`[API] Setting key '${key}' not found during update (segment: ${lastKey}).`);
            return reject(new SettingNotFoundError(key));
          }
          if (i < path.length - 1) {
            parent = current;
            current = current[lastKey];
          }
        }

        const oldValue = parent ? parent[lastKey] : current;

        // Basic validation (more comprehensive validation is done by validateSettingValue helper)
        try {
          validateSettingValue(key, value);
        } catch (validationError) {
          logger.error(`[API] Validation failed for setting '${key}' with value '${JSON.stringify(value)}'.`, validationError);
          return reject(validationError); // Re-throw the specific validation error
        }

        // Update the value
        if (parent) {
          parent[lastKey] = value;
        } else {
          // This case implies a top-level property which UserSettings is not designed for direct updates.
          // This should ideally be caught by higher-level validation or design.
          logger.critical(`[API] Attempted to update a top-level setting directly ('${key}') which is not supported by current UserSettings structure.`);
          return reject(new SettingsError(`Cannot update top-level setting directly: ${key}.`, 'UNSUPPORTED_TOP_LEVEL_UPDATE'));
        }

        // Create and store an audit log entry
        const newAuditEntry: AuditLogEntry = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          actorId: userId,
          action: 'UPDATE',
          settingKey: key,
          oldValue: oldValue,
          newValue: value,
          ipAddress: '127.0.0.1', // Mock IP, would be obtained from request context
          userAgent: 'Mozilla/5.0 (Mock)', // Mock UserAgent, would be obtained from request context
          metadata: { reason: 'User initiated update' }
        };
        this.mockAuditLogs.push(newAuditEntry);
        logger.info(`[API] Successfully updated setting '${key}' for user ${userId}.`, { auditId: newAuditEntry.id });
        resolve(JSON.parse(JSON.stringify(this.mockUserSettings)));
      }, 700); // Simulate processing delay
    });
  }

  /**
   * Simulates an asynchronous API call to update multiple user settings in a batch operation.
   * This is more efficient for updating several settings at once.
   * @param userId The ID of the user.
   * @param updates An object where keys are setting paths (SettingKey) and values are new setting values.
   * @returns A promise that resolves with the updated UserSettings.
   * @throws {PermissionDeniedError} If the user is unauthorized.
   * @throws {SettingsError} For various update failures, potentially specific ones like SettingNotFoundError.
   */
  public async bulkUpdateSettings(userId: string, updates: Record<SettingKey, SettingValue>): Promise<UserSettings> {
    logger.debug(`[API] Bulk updating ${Object.keys(updates).length} settings for user ${userId}.`);
    return new Promise(async (resolve, reject) => {
      if (userId !== this.currentMockUserId) {
        logger.error(`[API] Access denied: Unauthorized attempt to bulk update settings by user ${userId}.`);
        return reject(new PermissionDeniedError(`Cannot bulk update settings for user ${userId}.`));
      }

      if (Math.random() < 0.05) {
        logger.error(`[API] Simulated transient service error during bulk update for ${userId}.`);
        return reject(new ExternalServiceError('SettingsAPI', 'Simulated transient service error during bulk update.'));
      }

      const auditEntries: AuditLogEntry[] = [];
      let currentSettingsSnapshot = JSON.parse(JSON.stringify(this.mockUserSettings)); // Take a snapshot for atomicity

      try {
        for (const key in updates) {
          if (!Object.prototype.hasOwnProperty.call(updates, key)) continue; // Ensure it's an own property

          const value = updates[key];
          const path = key.split('.');
          let tempCurrent: any = currentSettingsSnapshot; // Use a temporary pointer for validation before applying
          let tempParent: any = null;
          let tempLastKey: string = '';

          for (let i = 0; i < path.length; i++) {
            tempLastKey = path[i];
            if (tempCurrent === undefined || tempCurrent === null || typeof tempCurrent !== 'object' || !Object.prototype.hasOwnProperty.call(tempCurrent, tempLastKey)) {
              logger.warn(`[API] Bulk update: Setting key '${key}' not found (segment: ${tempLastKey}). Failing batch.`);
              throw new SettingNotFoundError(key); // Fail the entire batch for data consistency
            }
            if (i < path.length - 1) {
              tempParent = tempCurrent;
              tempCurrent = tempCurrent[tempLastKey];
            }
          }

          // Validate each setting value before attempting to apply
          validateSettingValue(key, value);

          const oldValue = tempParent ? tempParent[tempLastKey] : tempCurrent;

          // Apply the update to the snapshot
          if (tempParent) {
            tempParent[tempLastKey] = value;
          } else {
            logger.critical(`[API] Bulk update: Attempted to update a top-level setting directly ('${key}'). This is usually a schema violation.`);
            throw new SettingsError(`Cannot update top-level setting directly via bulk update: ${key}.`, 'UNSUPPORTED_TOP_LEVEL_UPDATE');
          }

          auditEntries.push({
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            actorId: userId,
            action: 'UPDATE',
            settingKey: key,
            oldValue: oldValue,
            newValue: value,
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Mock)',
            metadata: { reason: 'Bulk update initiated by user' }
          });
        }

        // If all individual updates and validations pass, then apply the changes to the actual mock state
        this.mockUserSettings = currentSettingsSnapshot;
        this.mockAuditLogs.push(...auditEntries);
        logger.info(`[API] Successfully performed bulk update for user ${userId}. Updated ${auditEntries.length} keys.`);
        resolve(JSON.parse(JSON.stringify(this.mockUserSettings)));

      } catch (error: any) {
        logger.error(`[API] Bulk update failed for user ${userId}. Error: ${error.message}`, error);
        reject(error); // Re-throw the specific error that caused the batch failure
      }
    });
  }

  /**
   * Simulates an asynchronous API call to reset all user settings to their default values.
   * This is a sensitive operation and should be handled with care.
   * @param userId The ID of the user.
   * @returns A promise that resolves with the reset UserSettings.
   * @throws {PermissionDeniedError} If the user is unauthorized.
   * @throws {ExternalServiceError} For other simulated API failures.
   */
  public async resetUserSettings(userId: string): Promise<UserSettings> {
    logger.warn(`[API] Initiating full settings reset for user: ${userId}.`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userId !== this.currentMockUserId) {
          logger.error(`[API] Access denied: Unauthorized attempt to reset settings by user ${userId}.`);
          return reject(new PermissionDeniedError(`Cannot reset settings for user ${userId}.`));
        }

        if (Math.random() < 0.02) {
          logger.critical(`[API] Simulated critical system failure during settings reset for ${userId}.`);
          return reject(new ExternalServiceError('SettingsAPI', 'Simulated critical system failure during reset.'));
        }

        const oldSettingsSnapshot = JSON.parse(JSON.stringify(this.mockUserSettings)); // Snapshot before reset
        this.mockUserSettings = this.initializeDefaultUserSettings(userId); // Reset to fresh defaults

        const newAuditEntry: AuditLogEntry = {
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          actorId: userId,
          action: 'RESET',
          settingKey: 'ALL_SETTINGS', // Special key for a full reset
          oldValue: oldSettingsSnapshot, // Store the entire old state for potential recovery
          newValue: JSON.parse(JSON.stringify(this.mockUserSettings)),
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Mock)',
          metadata: { reason: 'User initiated full settings reset' }
        };
        this.mockAuditLogs.push(newAuditEntry);
        logger.info(`[API] Successfully reset all settings for user ${userId}.`);
        resolve(JSON.parse(JSON.stringify(this.mockUserSettings)));
      }, 1000); // Simulate longer processing time for a sensitive operation
    });
  }

  /**
   * Simulates fetching a history of setting changes for a user from an audit log.
   * @param userId The ID of the user.
   * @param limit Maximum number of audit entries to return. Defaults to 100.
   * @returns A promise that resolves with an array of audit log entries, sorted by newest first.
   * @throws {PermissionDeniedError} If the user is unauthorized.
   */
  public async fetchSettingsHistory(userId: string, limit: number = 100): Promise<AuditLogEntry[]> {
    logger.debug(`[API] Fetching setting history for user ${userId}, limit: ${limit}.`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (userId !== this.currentMockUserId) {
          logger.error(`[API] Access denied: Unauthorized attempt to fetch history for user ${userId}.`);
          return reject(new PermissionDeniedError(`Cannot fetch history for user ${userId}.`));
        }
        const userHistory = this.mockAuditLogs
          .filter(log => log.actorId === userId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Newest first
          .slice(0, limit);
        logger.info(`[API] Successfully fetched ${userHistory.length} audit entries for user ${userId}.`);
        resolve(JSON.parse(JSON.stringify(userHistory)));
      }, 600);
    });
  }

  /**
   * Simulates rolling back a specific setting to a previous value based on an audit log entry.
   * This is a complex and powerful feature, allowing undo of previous changes.
   * @param userId The ID of the user performing the rollback.
   * @param auditEntryId The ID of the audit entry to revert to (specifically, using its `oldValue`).
   * @returns A promise resolving to the updated UserSettings after the rollback.
   * @throws {PermissionDeniedError} If the user is unauthorized.
   * @throws {SettingNotFoundError} If the specified audit entry is not found.
   * @throws {SettingsError} If the rollback cannot be applied (e.g., trying to revert a non-UPDATE action).
   */
  public async rollbackSetting(userId: string, auditEntryId: string): Promise<UserSettings> {
    logger.warn(`[API] Attempting to rollback setting for user ${userId} using audit entry ${auditEntryId}.`);
    return new Promise(async (resolve, reject) => {
      if (userId !== this.currentMockUserId) {
        logger.error(`[API] Access denied: Unauthorized attempt to rollback setting by user ${userId}.`);
        return reject(new PermissionDeniedError(`Cannot rollback settings for user ${userId}.`));
      }

      const entryToRevert = this.mockAuditLogs.find(e => e.id === auditEntryId && e.actorId === userId);
      if (!entryToRevert) {
        logger.warn(`[API] Rollback failed: Audit entry '${auditEntryId}' not found or not for user ${userId}.`);
        return reject(new SettingNotFoundError(`Audit entry '${auditEntryId}' not found for user ${userId}.`));
      }

      // Only allow rollback for 'UPDATE' actions where an old value is present.
      if (entryToRevert.action !== 'UPDATE') {
        logger.warn(`[API] Rollback failed: Cannot revert non-UPDATE action type '${entryToRevert.action}' from audit entry '${auditEntryId}'.`);
        return reject(new SettingsError(`Cannot revert a non-update action type: ${entryToRevert.action}.`, 'ROLLBACK_UNSUPPORTED_ACTION'));
      }

      if (entryToRevert.oldValue === null) {
        logger.warn(`[API] Rollback failed: Old value in audit entry '${auditEntryId}' is null, cannot revert.`);
        return reject(new SettingsError(`No previous value to revert to for entry '${auditEntryId}'.`, 'ROLLBACK_NO_OLD_VALUE'));
      }

      try {
        // Use the existing `updateSetting` method to apply the old value as the new current value.
        const updatedSettings = await this.updateSetting(
          userId,
          entryToRevert.settingKey,
          entryToRevert.oldValue
        );

        // Add a specific audit entry for the rollback operation itself
        const rollbackAuditEntry: AuditLogEntry = {
          id: `audit_rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          actorId: userId,
          action: 'ROLLBACK', // Specific action type for rollback
          settingKey: entryToRevert.settingKey,
          oldValue: entryToRevert.newValue, // The value it was changed FROM
          newValue: entryToRevert.oldValue, // The value it was changed TO
          ipAddress: '127.0.0.1',
          userAgent: 'SYSTEM_ROLLBACK_ACTION', // Indicates system-initiated rollback
          metadata: { revertedFromAuditId: auditEntryId, reason: 'User initiated rollback via audit history' }
        };
        this.mockAuditLogs.push(rollbackAuditEntry);
        logger.info(`[API] Successfully rolled back setting '${entryToRevert.settingKey}' for user ${userId} using audit entry ${auditEntryId}.`);
        resolve(updatedSettings);
      } catch (error: any) {
        logger.error(`[API] Failed to apply rollback for setting '${entryToRevert.settingKey}' for user ${userId}. Error: ${error.message}`, error);
        reject(new ExternalServiceError('SettingsAPI', `Failed to apply rollback: ${error.message}`, error));
      }
    });
  }
}

const settingsAPIService = SettingsAPIService.getInstance(); // Singleton instance for API interactions


/**
 * Mock/Simulated Gemini AI Service.
 * This singleton class encapsulates all interactions with a hypothetical, advanced Gemini AI backend.
 * Each method simulates an AI API call with realistic delays, demonstrating how AI can
 * provide intelligent insights, recommendations, explanations, and proactive assistance for user settings.
 */
export class GeminiAIService {
  private static instance: GeminiAIService;
  private readonly apiUrl: string = 'https://api.gemini.ai/v1/user-settings'; // Hypothetical Gemini AI API endpoint

  private constructor() { }

  /**
   * Factory method to get the singleton instance of GeminiAIService.
   * @returns {GeminiAIService} The singleton instance.
   */
  public static getInstance(): GeminiAIService {
    if (!GeminiAIService.instance) {
      GeminiAIService.instance = new GeminiAIService();
    }
    return GeminiAIService.instance;
  }

  /**
   * Simulates an AI call to analyze the current user settings for potential issues,
   * security vulnerabilities, privacy risks, performance bottlenecks, or optimization opportunities.
   * This is a comprehensive "settings health check."
   *
   * @param settings The current UserSettings object to analyze.
   * @param userContext Detailed context about the user and their environment.
   * @returns A promise resolving to a detailed analysis report.
   * @throws {ExternalServiceError} On AI service failure.
   */
  public async analyzeSettingsImpact(settings: UserSettings, userContext: UserContext): Promise<GeminiAnalysisResult> {
    logger.debug(`[GeminiAI] Analyzing settings impact for user ${userContext.userId} with context...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Simulate AI logic based on settings and context
          const recommendations: AIRecommendation[] = [];
          const detectedIssues: { severity: 'low' | 'medium' | 'high' | 'critical'; description: string; impact: string; suggestedAction?: string }[] = [];
          let summary = `Comprehensive analysis of user ${userContext.userId}'s settings completed.`;
          let overallScore = 100; // Start with a perfect score and deduct

          // --- Security Analysis ---
          if (!settings.security.twoFactorAuthenticationEnabled) {
            recommendations.push({
              id: 'ai_rec_2fa_enable', type: 'security', settingKey: 'security.twoFactorAuthenticationEnabled',
              recommendedValue: true, rationale: 'Enabling Two-Factor Authentication significantly enhances account security against unauthorized access.',
              confidenceScore: 0.99, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
              actionableUrl: '/settings/security'
            });
            detectedIssues.push({
              severity: 'critical', description: 'Two-Factor Authentication is disabled.',
              impact: 'Account is highly vulnerable to unauthorized access via compromised passwords. This is a critical security gap.',
              suggestedAction: 'Enable 2FA immediately.'
            });
            overallScore -= 30;
          }
          if (settings.security.passwordExpirationDays > 0 && settings.security.lastPasswordChange) {
            const daysSinceLastChange = (Date.now() - settings.security.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLastChange > settings.security.passwordExpirationDays * 0.9) { // 90% through period
              recommendations.push({
                id: 'ai_rec_password_change_imminent', type: 'security', settingKey: 'security.lastPasswordChange',
                recommendedValue: new Date().toISOString(), rationale: `Your password will expire soon (${Math.round(settings.security.passwordExpirationDays - daysSinceLastChange)} days). It is recommended to change it proactively.`,
                confidenceScore: 0.85, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
                actionableUrl: '/settings/security'
              });
              detectedIssues.push({
                severity: 'medium', description: 'Password expiration imminent.',
                impact: 'Account might be locked out or forced to reset password at an inconvenient time.',
                suggestedAction: 'Change your password soon.'
              });
              overallScore -= 5;
            }
          }
          if (!settings.security.unusualLoginDetectionEnabled) {
            recommendations.push({
              id: 'ai_rec_enable_unusual_login', type: 'security', settingKey: 'security.unusualLoginDetectionEnabled',
              recommendedValue: true, rationale: 'Enabling unusual login detection provides an extra layer of security by flagging suspicious login attempts based on patterns.',
              confidenceScore: 0.90, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
              actionableUrl: '/settings/security'
            });
            overallScore -= 10;
          }

          // --- Privacy Analysis ---
          if (!settings.privacy.dataSharingConsent && settings.privacy.personalizationEnabled) {
            detectedIssues.push({
              severity: 'low', description: 'Conflicting privacy settings: personalization enabled without general data sharing consent.',
              impact: 'Personalization features might be limited or less effective, or there might be an implicit data sharing need not covered by explicit consent.'
            });
            summary += ' Minor privacy inconsistencies found.';
            overallScore -= 3;
          }
          if (settings.privacy.marketingConsent && !settings.notifications.marketingEmails) {
            detectedIssues.push({
              severity: 'low', description: 'General marketing consent is given, but marketing emails are opted out.',
              impact: 'This might lead to missed marketing communications that the user technically consented to receive.'
            });
            overallScore -= 1;
          }
          if (settings.privacy.cookiePreferences.length < 3) { // Assuming essential, analytics, marketing as common
            recommendations.push({
              id: 'ai_rec_review_cookies', type: 'privacy', settingKey: 'privacy.cookiePreferences',
              recommendedValue: ['essential', 'functional', 'analytics', 'marketing'], rationale: 'Review and update your cookie preferences to ensure alignment with your privacy expectations.',
              confidenceScore: 0.70, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Privacy',
              actionableUrl: '/settings/privacy'
            });
          }

          // --- Usability/Experience Analysis ---
          // Recommend dark mode if it's evening and not already dark, and user is on mobile
          if (settings.appearance.theme === AppTheme.LIGHT && new Date().getHours() >= 18 && userContext.deviceType === 'mobile') {
            recommendations.push({
              id: 'ai_rec_dark_mode_evening', type: 'usability', settingKey: 'appearance.theme',
              recommendedValue: AppTheme.DARK, rationale: 'Switching to dark mode in the evening on mobile devices can reduce eye strain and improve battery life.',
              confidenceScore: 0.80, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-UX',
              actionableUrl: '/settings/appearance'
            });
          }
          // Recommend higher font size for older users (simulated by low activity score here)
          if (userContext.activityScore < 0.2 && settings.appearance.fontSize === 'small') {
            recommendations.push({
              id: 'ai_rec_larger_font', type: 'usability', settingKey: 'appearance.fontSize',
              recommendedValue: 'medium', rationale: 'Based on your usage patterns, a slightly larger font size may improve readability and overall user experience.',
              confidenceScore: 0.65, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-UX',
              actionableUrl: '/settings/appearance'
            });
          }


          if (recommendations.length === 0 && detectedIssues.length === 0) {
            summary = `No critical issues or major optimization opportunities detected in ${userContext.userId}'s settings. Current configuration looks robust and well-optimized.`;
          } else if (detectedIssues.length > 0) {
            summary = `Critical issues and potential optimizations identified for ${userContext.userId}'s settings. Immediate review recommended.`;
          } else {
            summary = `Several potential optimizations and recommendations identified for ${userContext.userId}'s settings.`;
          }

          const result: GeminiAnalysisResult = {
            reportId: `ai_report_${Date.now()}_${userContext.userId}`,
            analysisType: 'Comprehensive Settings Health Check',
            summary: summary,
            recommendations: recommendations,
            detectedIssues: detectedIssues.length > 0 ? detectedIssues : undefined,
            score: Math.max(0, overallScore), // Ensure score doesn't go below 0
            timestamp: new Date(),
            rawData: {
              // In a real scenario, this would contain detailed metrics, AI model outputs, etc.
              settingsSnapshot: JSON.parse(JSON.stringify(settings)),
              userContext: JSON.parse(JSON.stringify(userContext))
            }
          };
          logger.info(`[GeminiAI] Successfully generated settings impact analysis for user ${userContext.userId}. Report ID: ${result.reportId}`);
          resolve(result);
        } catch (error: any) {
          logger.error(`[GeminiAI] Failed to analyze settings impact for user ${userContext.userId}: ${error.message}`, error);
          reject(new ExternalServiceError('GeminiAIService (Analyze)', `AI analysis failed: ${error.message}`, error));
        }
      }, 1500); // Simulate AI processing time
    });
  }

  /**
   * Simulates an AI call to recommend optimal settings based on user behavior patterns,
   * environmental context, and potential efficiency gains.
   *
   * @param currentSettings The user's current settings for contextual understanding.
   * @param userContext Detailed context about the user (e.g., device, location, recent activity).
   * @returns A promise resolving to an array of AI recommendations.
   * @throws {ExternalServiceError} On AI service failure.
   */
  public async recommendOptimalSettings(currentSettings: UserSettings, userContext: UserContext): Promise<AIRecommendation[]> {
    logger.debug(`[GeminiAI] Recommending optimal settings for user ${userContext.userId} based on context: ${JSON.stringify(userContext)}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const recommendations: AIRecommendation[] = [];

          // Example: Theme recommendation based on device, time, and OS preference
          const currentHour = new Date().getHours();
          const isNightTime = currentHour >= 20 || currentHour < 6; // 8 PM to 6 AM
          if (currentSettings.appearance.theme === AppTheme.LIGHT && isNightTime && (userContext.deviceType === 'mobile' || userContext.os.includes('dark'))) {
            recommendations.push({
              id: 'ai_rec_dark_mode_auto', type: 'usability', settingKey: 'appearance.theme',
              recommendedValue: AppTheme.DARK, rationale: `Based on your device and the current time (${currentHour}h), switching to dark mode can enhance visual comfort and potentially save battery.`,
              confidenceScore: 0.90, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-UX',
              actionableUrl: '/settings/appearance'
            });
          }

          // Example: Language recommendation based on geo-location and locale preference
          if (!currentSettings.general.language.startsWith(userContext.localePreference.substring(0, 2))) {
            const recommendedLang = userContext.localePreference || 'en-US';
            recommendations.push({
              id: 'ai_rec_language_geo', type: 'general', settingKey: 'general.language',
              recommendedValue: recommendedLang, rationale: `Your current language (${currentSettings.general.language}) does not match your system/browser preference or geographical location (${userContext.localePreference}). Consider changing to "${recommendedLang}".`,
              confidenceScore: 0.88, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-General',
              actionableUrl: '/settings/general'
            });
          }

          // Example: Notification frequency based on activity score
          if (userContext.activityScore < 0.3 && currentSettings.notifications.digestFrequency === 'daily') {
            recommendations.push({
              id: 'ai_rec_notification_digest_freq', type: 'notifications', settingKey: 'notifications.digestFrequency',
              recommendedValue: 'weekly', rationale: 'For users with lower activity, a weekly notification digest can reduce email clutter and improve focus without missing important updates.',
              confidenceScore: 0.70, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Notifications',
              actionableUrl: '/settings/notifications'
            });
          }

          // Example: Proactive suggestion for security questions if 2FA is disabled (fallback)
          if (!currentSettings.security.twoFactorAuthenticationEnabled && !currentSettings.security.securityQuestionsSet) {
            recommendations.push({
              id: 'ai_rec_security_questions', type: 'security', settingKey: 'security.securityQuestionsSet',
              recommendedValue: true, rationale: 'As Two-Factor Authentication is currently inactive, setting up security questions can provide a basic recovery mechanism and an additional layer of verification.',
              confidenceScore: 0.60, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
              actionableUrl: '/settings/security'
            });
          }

          logger.info(`[GeminiAI] Generated ${recommendations.length} optimal setting recommendations for user ${userContext.userId}.`);
          resolve(recommendations);
        } catch (error: any) {
          logger.error(`[GeminiAI] Failed to recommend optimal settings for user ${userContext.userId}: ${error.message}`, error);
          reject(new ExternalServiceError('GeminiAIService (Recommend)', `AI recommendation failed: ${error.message}`, error));
        }
      }, 1200);
    });
  }

  /**
   * Simulates an AI call to generate a detailed, user-friendly explanation for a given setting.
   * This is particularly useful for complex or technical settings, enhancing user understanding.
   *
   * @param settingKey The key of the setting to explain.
   * @param currentSettings The full user settings for additional context.
   * @param locale The desired language for the explanation (e.g., "en-US", "es-ES").
   * @returns A promise resolving to a string containing the explanation.
   * @throws {ExternalServiceError} If the AI service fails or the setting is unrecognized.
   */
  public async generateSettingExplanation(settingKey: SettingKey, currentSettings: UserSettings, locale: string = 'en-US'): Promise<string> {
    logger.debug(`[GeminiAI] Generating explanation for setting '${settingKey}' in locale '${locale}'...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let explanation: string = '';
        const lowerCaseLocale = locale.toLowerCase();

        // Simulate AI understanding of settings and generating explanations
        switch (settingKey) {
          case 'security.twoFactorAuthenticationEnabled':
            explanation = `Two-Factor Authentication (2FA) adds an essential extra layer of security to your account. Even if someone obtains your password, they won't be able to access your account without the second verification factor (e.g., a time-based code from your mobile app, a physical security key, or an SMS code). It significantly reduces the risk of unauthorized access and is highly recommended for all users.`;
            break;
          case 'privacy.dataSharingConsent':
            explanation = `This setting controls whether anonymized, aggregated data about your usage patterns can be shared with trusted third-party partners. This data helps us and our partners improve service quality, develop new features, and understand market trends. Your personally identifiable information (PII) is never shared, ensuring your privacy is protected. You have full control and can change this setting at any time.`;
            break;
          case 'general.liveMode':
            explanation = `Live Mode determines whether your account operates in a real, production environment or a test/sandbox environment. In live mode, all actions you perform are real, potentially involving actual financial transactions, irreversible data changes, and live system interactions. In test mode, you can experiment, develop, and learn without any real-world consequences or impact on your live data. Always ensure you are in the correct mode before performing critical operations.`;
            break;
          case 'notifications.digestFrequency':
            explanation = `The notification digest frequency dictates how often you receive consolidated summary emails or push notifications regarding your account's activity. You can choose to receive these summaries daily, weekly, monthly, or opt out entirely if you prefer to check all notifications directly within the application. This helps manage notification volume.`;
            break;
          case 'appearance.theme':
            explanation = `The application theme setting allows you to customize the visual appearance of the user interface. You can choose between light, dark, or system-matched themes. Selecting a theme can impact readability, reduce eye strain in different lighting conditions, and personalize your experience.`;
            break;
          case 'advanced.developerMode':
            explanation = `Developer Mode is an advanced setting designed for technical users and developers. Enabling this mode unlocks additional debugging tools, API access options, and potentially exposes more detailed system information that is typically hidden. Use with caution, as it can inadvertently expose sensitive data or lead to unintended system behavior if not used correctly.`;
            break;
          default:
            explanation = `I'm sorry, I cannot find a detailed explanation for the setting '${settingKey}' at this moment. It might be a highly technical, recently added, or unrecognized setting. Please consult our comprehensive documentation, use the in-app help widget, or contact our support team for further assistance.`;
            break;
        }

        // Add context-aware sentence based on current value if available
        const path = settingKey.split('.');
        let currentValue: any = currentSettings;
        for (const p of path) {
          if (currentValue && typeof currentValue === 'object' && Object.prototype.hasOwnProperty.call(currentValue, p)) {
            currentValue = currentValue[p];
          } else {
            currentValue = undefined;
            break;
          }
        }

        if (currentValue !== undefined) {
          explanation += ` Currently, this setting is configured to: "${JSON.stringify(currentValue)}".`;
        }

        // Simulate localization based on the provided locale
        if (lowerCaseLocale !== 'en-us') {
          explanation = `[AI Translation to ${locale}] ` + explanation;
          // In a real system, this would involve calling a true translation service or a multi-lingual LLM.
        }

        logger.info(`[GeminiAI] Generated explanation for setting '${settingKey}' for user. Length: ${explanation.length}.`);
        resolve(explanation);
      }, 800); // Simulate AI response time
    });
  }

  /**
   * Predicts a user's likely preference for a specific setting based on their profile,
   * historical data, and current context. This is a proactive AI feature.
   *
   * @param userContext Detailed context about the user.
   * @param settingKey The key of the setting for which to predict a preference.
   * @param historicalData Optional historical usage data to inform the prediction (e.g., past interaction logs).
   * @returns A promise resolving to an object containing the predicted value, confidence score, and rationale.
   * @throws {ExternalServiceError} If prediction fails.
   */
  public async predictUserPreference(
    userContext: UserContext,
    settingKey: SettingKey,
    historicalData?: { usagePatterns?: any; recentChanges?: any[] }
  ): Promise<{ predictedValue: SettingValue, confidence: number, rationale: string }> {
    logger.debug(`[GeminiAI] Predicting user ${userContext.userId}'s preference for setting '${settingKey}' based on context and historical data...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let predictedValue: SettingValue = null;
        let confidence = 0.4; // Default low confidence
        let rationale = `Based on general observed trends.`;

        try {
          // Simulate AI prediction logic
          switch (settingKey) {
            case 'appearance.theme':
              // Predict dark mode if OS is dark or it's evening
              if (userContext.os.toLowerCase().includes('dark') || new Date().getHours() >= 19) {
                predictedValue = AppTheme.DARK;
                confidence = 0.85;
                rationale = 'High probability of preferring dark mode based on device OS settings and time of day.';
              } else {
                predictedValue = AppTheme.LIGHT;
                confidence = 0.7;
                rationale = 'Default preference based on bright environment or system settings.';
              }
              break;
            case 'general.language':
              // Use user's browser/OS locale as a strong predictor
              predictedValue = userContext.localePreference || 'en-US';
              confidence = 0.90;
              rationale = `Predicted based on your detected browser/OS locale (${userContext.localePreference}).`;
              break;
            case 'notifications.marketingEmails':
              // If activity score is high or historical data suggests engagement, predict true. Else, false.
              if (userContext.activityScore > 0.7 || (historicalData?.usagePatterns && historicalData.usagePatterns.clicksOnPromos > 5)) {
                predictedValue = true;
                confidence = 0.75;
                rationale = 'Indications of high engagement and interest in marketing communications.';
              } else {
                predictedValue = false;
                confidence = 0.60;
                rationale = 'Lower engagement suggests a preference against marketing emails.';
              }
              break;
            case 'security.twoFactorAuthenticationEnabled':
              // Always strongly recommend 2FA, so predict true
              predictedValue = true;
              confidence = 0.95;
              rationale = 'Strongly recommended for all accounts to maximize security. System-wide best practice.';
              break;
            case 'privacy.analyticsCollectionEnabled':
              // Predict based on general trend or explicit privacy-conscious user behavior
              predictedValue = (Math.random() > 0.3) ? true : false; // 70% opt-in for mock
              confidence = 0.6;
              rationale = 'Based on industry benchmarks for user consent to analytics collection.';
              break;
            default:
              predictedValue = null; // Cannot predict for unknown settings
              confidence = 0.1;
              rationale = `Prediction not available for this specific setting key.`;
              break;
          }
          logger.info(`[GeminiAI] Predicted preference for '${settingKey}' for user ${userContext.userId}: ${JSON.stringify(predictedValue)} (confidence: ${confidence}).`);
          resolve({ predictedValue, confidence, rationale });
        } catch (error: any) {
          logger.error(`[GeminiAI] Failed to predict preference for user ${userContext.userId} and setting '${settingKey}': ${error.message}`, error);
          reject(new ExternalServiceError('GeminiAIService (Predict)', `AI prediction failed: ${error.message}`, error));
        }
      }, 1000);
    });
  }

  /**
   * Uses AI to proactively monitor and suggest security enhancements based on usage patterns,
   * detected anomalies, and the user's current security posture.
   *
   * @param userContext Detailed context of the user.
   * @param currentSecuritySettings The user's current security settings.
   * @param recentActivity A log of recent user activities (e.g., logins, IP changes, failed attempts).
   * @returns A promise resolving to an array of security-focused AI recommendations.
   * @throws {ExternalServiceError} If AI service fails.
   */
  public async proactiveSecurityRecommendations(
    userContext: UserContext,
    currentSecuritySettings: SecuritySettings,
    recentActivity: { ip: string; timestamp: Date; location: string; success: boolean }[]
  ): Promise<AIRecommendation[]> {
    logger.debug(`[GeminiAI] Generating proactive security recommendations for user ${userContext.userId}...`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const recommendations: AIRecommendation[] = [];

        try {
          // --- Analyze unusual login patterns ---
          const uniqueLoginLocations = new Set(recentActivity.filter(a => a.success).map(a => a.location));
          if (uniqueLoginLocations.size > 2 && currentSecuritySettings.geofencingEnabled) {
            // If user has geofencing enabled but logging in from multiple locations, might need review
            detectedIssues.push({
              severity: 'medium', description: `Multiple distinct login locations detected (${uniqueLoginLocations.size}).`,
              impact: 'Could indicate compromise or user frequently travels. Review geofencing settings.',
              suggestedAction: 'Review recent logins and confirm your identity.'
            });
            recommendations.push({
              id: 'ai_rec_review_geofencing', type: 'security', settingKey: 'security.geofencingEnabled',
              recommendedValue: currentSecuritySettings.geofencingEnabled, // Not changing the value, but recommending review
              rationale: `Detected logins from diverse locations. Review your geofencing settings or trusted locations for accuracy.`,
              confidenceScore: 0.85, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
              actionableUrl: '/settings/security'
            });
          } else if (uniqueLoginLocations.size > 3 && !currentSecuritySettings.unusualLoginDetectionEnabled) {
             recommendations.push({
              id: 'ai_rec_unusual_login_detection', type: 'security', settingKey: 'security.unusualLoginDetectionEnabled',
              recommendedValue: true, rationale: 'Multiple distinct login locations detected. Enabling unusual login detection provides an immediate alert for suspicious activity.',
              confidenceScore: 0.95, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
              actionableUrl: '/settings/security'
            });
          }

          // --- Suggest 2FA if not enabled and there are failed login attempts ---
          const failedAttempts = recentActivity.filter(a => !a.success).length;
          if (!currentSecuritySettings.twoFactorAuthenticationEnabled && failedAttempts > 0) {
            recommendations.push({
              id: 'ai_rec_failed_login_2fa', type: 'security', settingKey: 'security.twoFactorAuthenticationEnabled',
              recommendedValue: true, rationale: `Your account experienced ${failedAttempts} failed login attempts recently. Activating Two-Factor Authentication is crucial to prevent unauthorized access.`,
              confidenceScore: 0.99, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
              actionableUrl: '/settings/security'
            });
          }

          // --- Password expiry nearing ---
          if (currentSecuritySettings.lastPasswordChange && currentSecuritySettings.passwordExpirationDays > 0) {
            const daysSinceLastChange = (Date.now() - currentSecuritySettings.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24);
            const daysUntilExpiration = currentSecuritySettings.passwordExpirationDays - daysSinceLastChange;
            if (daysUntilExpiration <= 14 && daysUntilExpiration > 0) { // Within 2 weeks of expiry
              recommendations.push({
                id: 'ai_rec_password_expiry_alert', type: 'security', settingKey: 'security.lastPasswordChange',
                recommendedValue: null, // No specific value, just a prompt to act
                rationale: `Your password is due to expire in approximately ${Math.round(daysUntilExpiration)} days. Changing your password proactively is a good security practice.`,
                confidenceScore: 0.90, isApplied: false, isDismissed: false, timestamp: new Date(), sourceModel: 'Gemini-Pro-Security',
                actionableUrl: '/settings/security'
              });
            }
          }

          logger.info(`[GeminiAI] Generated ${recommendations.length} proactive security recommendations for user ${userContext.userId}.`);
          resolve(recommendations);
        } catch (error: any) {
          logger.error(`[GeminiAI] Failed to generate proactive security recommendations for user ${userContext.userId}: ${error.message}`, error);
          reject(new ExternalServiceError('GeminiAIService (Proactive Security)', `AI security recommendations failed: ${error.message}`, error));
        }
      }, 1800);
    });
  }

  /**
   * Generates intelligent, context-aware troubleshooting suggestions for settings-related issues
   * based on a natural language problem description and current user settings.
   *
   * @param userContext Detailed context of the user.
   * @param problemDescription A natural language description of the problem (e.g., "My email notifications are not working").
   * @param currentSettings The user's current settings.
   * @param recentErrorLogs Optional array of recent error messages from the client or system.
   * @returns A promise resolving to an array of troubleshooting steps.
   * @throws {ExternalServiceError} If AI service fails.
   */
  public async getTroubleshootingSuggestions(
    userContext: UserContext,
    problemDescription: string,
    currentSettings: UserSettings,
    recentErrorLogs?: string[]
  ): Promise<string[]> {
    logger.debug(`[GeminiAI] Generating troubleshooting suggestions for user ${userContext.userId} for problem: '${problemDescription}'`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const suggestions: string[] = [];
        try {
          const lowerProblem = problemDescription.toLowerCase();

          // --- Analyze based on problem description and current settings ---
          if (lowerProblem.includes('email') && lowerProblem.includes('not working') || lowerProblem.includes('notifications not received')) {
            if (!currentSettings.notifications[NotificationType.EMAIL]) {
              suggestions.push('1. Check if "Email Notifications" are enabled in your Notification settings. Ensure the toggle is ON.');
            }
            if (!currentSettings.notifications.marketingEmails && lowerProblem.includes('marketing')) {
              suggestions.push('2. Verify your "Marketing Email" preference under Notification settings. You might have explicitly opted out of marketing communications.');
            }
            suggestions.push('3. Ensure your primary email address is correctly configured and verified in your Account Profile.');
            suggestions.push('4. Thoroughly check your spam, junk, or promotions folder for missing emails.');
            suggestions.push('5. Temporarily disable any email filtering rules you might have to see if they are blocking our messages.');
            suggestions.push('6. Check if your email provider (e.g., Gmail, Outlook) is experiencing any service outages or delays.');
          } else if (lowerProblem.includes('dark mode') && lowerProblem.includes('not working') || lowerProblem.includes('theme issue')) {
            if (currentSettings.appearance.theme !== AppTheme.DARK && currentSettings.appearance.theme !== AppTheme.SYSTEM) {
              suggestions.push(`1. Your current theme is set to "${currentSettings.appearance.theme}". Try explicitly selecting "${AppTheme.DARK}" in your Appearance settings.`);
            } else if (currentSettings.appearance.theme === AppTheme.SYSTEM && !userContext.os.toLowerCase().includes('dark')) {
              suggestions.push('2. Your theme is set to follow your system preferences. Ensure your operating system (e.g., Windows, macOS) is also set to Dark Mode.');
            }
            suggestions.push('3. Clear your browser cache and cookies, then fully refresh the application page. Sometimes old styles persist.');
            suggestions.push('4. Try accessing the application in a different browser or incognito/private mode to rule out browser-specific issues.');
          } else if (lowerProblem.includes('login issue') || lowerProblem.includes('cannot log in') || lowerProblem.includes('locked out')) {
            if (currentSettings.security.twoFactorAuthenticationEnabled) {
              suggestions.push('1. If Two-Factor Authentication (2FA) is enabled, ensure you are providing the correct, current code from your authenticator app or received via SMS.');
            }
            suggestions.push('2. Attempt to reset your password via the "Forgot Password" link on the login page.');
            suggestions.push('3. Review your recent login attempts in your Security settings (if accessible) to identify any unusual activity or blocks.');
            if (currentSettings.security.sessionTimeoutMinutes < 15) {
              suggestions.push('4. Your session timeout is very short. This could be leading to frequent, unexpected logouts. Consider increasing it in Security settings.');
            }
            suggestions.push('5. Check your internet connection. A unstable connection can interfere with login processes.');
          } else if (lowerProblem.includes('language') && lowerProblem.includes('not changing')) {
            if (currentSettings.general.language !== userContext.localePreference && currentSettings.general.language !== 'en-US') {
              suggestions.push(`1. Verify the language setting in your General preferences is correctly set to your desired language. Currently: "${currentSettings.general.language}".`);
            }
            suggestions.push('2. Clear your browser cache and local storage, then perform a hard refresh (Ctrl+F5 or Cmd+Shift+R).');
            suggestions.push('3. Ensure your browser or operating system language settings are not overriding the application\'s preference.');
            suggestions.push('4. If the language still does not update, try logging out and logging back in.');
          } else if (lowerProblem.includes('integration') && lowerProblem.includes('not working')) {
            suggestions.push(`1. Check the status of the specific integration ("${problemDescription.split(' ')[0]}") in your Integrations settings. Ensure it's enabled.`);
            suggestions.push('2. Verify the API key or connected account for the integration is correct and has the necessary permissions.');
            suggestions.push('3. Visit the third-party service\'s status page to check for any outages on their end.');
            suggestions.push('4. Try re-authenticating or reconnecting the integration from your settings page.');
          } else {
            suggestions.push('1. We could not identify a specific setting causing the issue based on your description. Please provide more details.');
            suggestions.push('2. If you received any error messages, please include them exactly as they appeared.');
            suggestions.push('3. Consider reviewing your recent activity and system logs for any clues related to the problem.');
            suggestions.push('4. Try isolating the problem: does it occur on different devices or browsers?');
          }

          // --- Integrate recent error logs if available ---
          if (recentErrorLogs && recentErrorLogs.length > 0) {
            suggestions.push(`--- Additional Insight ---`);
            suggestions.push(`Based on recent system error logs, we recommend investigating related messages. For example: "${recentErrorLogs[0]?.substring(0, 100)}..."`);
            // More advanced AI could parse logs for specific keywords and add targeted suggestions.
          }

          if (suggestions.length === 0) {
            suggestions.push('We are unable to provide specific troubleshooting steps at this time. Please contact support.');
          }

          logger.info(`[GeminiAI] Generated ${suggestions.length} troubleshooting suggestions for user ${userContext.userId}.`);
          resolve(suggestions);
        } catch (error: any) {
          logger.error(`[GeminiAI] Failed to get troubleshooting suggestions for user ${userContext.userId}: ${error.message}`, error);
          reject(new ExternalServiceError('GeminiAIService (Troubleshooting)', `AI troubleshooting failed: ${error.message}`, error));
        }
      }, 1500);
    });
  }

  /**
   * Applies a given set of AI-recommended settings to the user's current configuration.
   * This function acts as an intermediary, using the `SettingsAPIService` to persist the changes.
   *
   * @param userId The ID of the user.
   * @param recommendations An array of AI recommendations to apply. Only recommendations with `isApplied: false` will be processed.
   * @returns A promise resolving to the updated UserSettings after applying the recommendations.
   * @throws {ExternalServiceError} If the application fails, potentially due to API issues.
   */
  public async applyAIRecommendations(userId: string, recommendations: AIRecommendation[]): Promise<UserSettings> {
    logger.debug(`[GeminiAI] Attempting to apply ${recommendations.length} AI recommendations for user ${userId}.`);
    const updates: Record<SettingKey, SettingValue> = {};
    const appliedRecIds: string[] = [];

    for (const rec of recommendations) {
      if (!rec.isApplied && !rec.isDismissed) { // Only apply if not already applied or dismissed
        updates[rec.settingKey] = rec.recommendedValue;
        appliedRecIds.push(rec.id);
      }
    }

    if (Object.keys(updates).length === 0) {
      logger.info(`[GeminiAI] No new AI recommendations found to apply for user ${userId}. Returning current settings.`);
      // If no updates are needed, fetch and return the current settings to ensure up-to-dateness.
      try {
        return await settingsAPIService.fetchUserSettings(userId);
      } catch (error: any) {
        throw new ExternalServiceError('SettingsAPI', `Failed to fetch current settings after no AI recommendations applied: ${error.message}`, error);
      }
    }

    try {
      const updatedSettings = await settingsAPIService.bulkUpdateSettings(userId, updates);
      // In a real system, you would also update the `isApplied` status of these recommendations in your database.
      logger.info(`[GeminiAI] Successfully applied AI recommendations for user ${userId}. Recommendations applied: ${appliedRecIds.join(', ')}.`);
      return updatedSettings;
    } catch (error: any) {
      logger.error(`[GeminiAI] Failed to apply AI recommendations for user ${userId}: ${error.message}`, error);
      throw new ExternalServiceError('GeminiAIService (Apply)', `Failed to apply AI recommendations: ${error.message}`, error);
    }
  }

  /**
   * Provides contextual, AI-generated feedback for a specific setting based on its current value
   * and potential implications (risks, benefits). This is ideal for real-time UI assistance.
   *
   * @param userContext The context of the user.
   * @param settingKey The key of the setting.
   * @param currentValue The current value of the setting.
   * @param context Additional context for AI, like explicitly defined risks or benefits.
   * @returns A promise resolving to an AI-generated feedback string.
   * @throws {ExternalServiceError} If AI service fails.
   */
  public async getContextualSettingFeedback(
    userContext: UserContext,
    settingKey: SettingKey,
    currentValue: SettingValue,
    context?: { risks?: string[], benefits?: string[] }
  ): Promise<string> {
    logger.debug(`[GeminiAI] Getting contextual feedback for ${settingKey} with value ${JSON.stringify(currentValue)} for user ${userContext.userId}.`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let feedback = `AI Feedback for '${settingKey}': `;
        try {
          switch (settingKey) {
            case 'security.twoFactorAuthenticationEnabled':
              feedback += currentValue === true
                ? 'Excellent! Two-Factor Authentication is currently enabled, which significantly boosts your account security against unauthorized access.'
                : 'Warning: Two-Factor Authentication is currently disabled. This leaves your account more vulnerable. We highly recommend enabling it for enhanced protection.';
              break;
            case 'privacy.dataSharingConsent':
              feedback += currentValue === true
                ? 'You have consented to data sharing. This helps us to improve our services and features by analyzing anonymized data. Your privacy is paramount, and PII is never shared.'
                : 'You have opted out of data sharing. Your anonymized data will not be used for service improvements with third-parties. This ensures maximum data privacy for you.';
              break;
            case 'general.developerMode':
              feedback += currentValue === true
                ? 'Developer Mode is active. This unlocks advanced features and debugging tools but can expose sensitive information or lead to unexpected behavior if not handled carefully. Use with caution.'
                : 'Developer Mode is inactive. Your environment is secure and optimized for general use, providing a streamlined experience.';
              break;
            case 'general.liveMode':
              feedback += currentValue === true
                ? 'You are currently operating in LIVE MODE. All actions are real and irreversible, directly impacting your production data and environment. Proceed with utmost care.'
                : 'You are currently operating in TEST MODE. This is a safe sandbox environment where you can experiment freely without affecting your live data or real-world operations.';
              break;
            case 'appearance.fontSize':
              feedback += `Your current font size is set to "${currentValue}". This impacts readability across the application. Consider adjusting if you find text too small or too large for your preference.`;
              break;
            default:
              feedback += `The current value for this setting is '${JSON.stringify(currentValue)}'. `;
              if (context?.risks && context.risks.length > 0) {
                feedback += `Potential risks associated with this configuration include: ${context.risks.join('; ')}.`;
              }
              if (context?.benefits && context.benefits.length > 0) {
                feedback += ` Key benefits of this configuration are: ${context.benefits.join('; ')}.`;
              }
              feedback += ` For a full explanation, please refer to the setting details or AI assistant.`;
              break;
          }
          logger.info(`[GeminiAI] Provided contextual feedback for setting '${settingKey}' for user ${userContext.userId}.`);
          resolve(feedback);
        } catch (error: any) {
          logger.error(`[GeminiAI] Failed to get contextual setting feedback for user ${userContext.userId}: ${error.message}`, error);
          reject(new ExternalServiceError('GeminiAIService (Feedback)', `AI contextual feedback failed: ${error.message}`, error));
        }
      }, 700);
    });
  }
}

const geminiAIService = GeminiAIService.getInstance(); // Singleton instance for AI interactions


// --- Public Exported Actions / Business Logic Functions ---

/**
 * The `UserSettingsManager` is the primary public interface for managing all aspects of user settings.
 * It acts as an orchestration layer, integrating the `SettingsAPIService` for data persistence
 * and the `GeminiAIService` for advanced AI-driven insights and actions.
 * This class applies best practices for business logic, including robust error handling,
 * logging, and clear separation of concerns. It is designed as a singleton.
 */
export class UserSettingsManager {
  private static instance: UserSettingsManager;
  // In a real application, the userId would be dynamically obtained from an authentication context (e.g., JWT, session).
  private currentUserId: string = 'usr_1a2b3c4d5e6f'; // Mock current user ID
  private currentUserContext: UserContext = { // Mock user context for AI calls
    userId: this.currentUserId,
    deviceType: 'desktop',
    geo: 'US-NY',
    activityScore: 0.5,
    os: 'macOS',
    browser: 'Chrome',
    localePreference: 'en-US'
  };

  private constructor() { }

  /**
   * Factory method to get the singleton instance of UserSettingsManager.
   * @returns {UserSettingsManager} The singleton instance.
   */
  public static getInstance(): UserSettingsManager {
    if (!UserSettingsManager.instance) {
      UserSettingsManager.instance = new UserSettingsManager();
    }
    return UserSettingsManager.instance;
  }

  /**
   * Sets the current user ID and context for the manager.
   * This would typically be called once after user authentication.
   * @param userId The ID of the currently authenticated user.
   * @param userContext The user's dynamic context (device, location, etc.).
   */
  public setCurrentUser(userId: string, userContext: Partial<UserContext>): void {
    this.currentUserId = userId;
    this.currentUserContext = { ...this.currentUserContext, userId, ...userContext };
    logger.info(`UserSettingsManager initialized for user: ${userId}.`);
  }

  /**
   * Fetches all settings for the currently authenticated user.
   * @returns A promise resolving to the user's comprehensive settings object.
   * @throws {SettingsError} If fetching fails due to API issues or permissions.
   */
  public async getAllUserSettings(): Promise<UserSettings> {
    try {
      logger.info(`Fetching all settings for user ${this.currentUserId}.`);
      return await settingsAPIService.fetchUserSettings(this.currentUserId);
    } catch (error: any) {
      logger.error(`Failed to fetch all settings for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`Could not retrieve user settings: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Retrieves a specific setting by its dot-separated key from the user's current settings.
   * @param key The dot-separated key of the setting (e.g., "general.language").
   * @returns A promise resolving to the setting's value.
   * @throws {SettingNotFoundError} If the setting key is not found.
   * @throws {SettingsError} For other underlying issues during fetching.
   */
  public async getSettingValue(key: SettingKey): Promise<SettingValue> {
    try {
      logger.debug(`Attempting to get value for setting: '${key}' for user ${this.currentUserId}.`);
      const allSettings = await this.getAllUserSettings();
      const path = key.split('.');
      let value: any = allSettings;
      for (const segment of path) {
        if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, segment)) {
          value = value[segment];
        } else {
          logger.warn(`Setting key path segment not found for '${key}' at segment '${segment}'.`);
          throw new SettingNotFoundError(key);
        }
      }
      logger.info(`Successfully retrieved setting value for '${key}'.`);
      return value;
    } catch (error: any) {
      if (error instanceof SettingNotFoundError) {
        throw error; // Re-throw specific error
      }
      logger.error(`Failed to get setting value for '${key}': ${error.message}`, error);
      throw new SettingsError(`Could not get setting '${key}': ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Updates a single user setting by its key with a new value.
   * This method includes pre-validation and comprehensive error handling.
   * @param key The dot-separated key of the setting.
   * @param value The new value for the setting.
   * @returns A promise resolving to the updated UserSettings object.
   * @throws {InvalidSettingValueError} If the provided value fails validation.
   * @throws {SettingsError} For various update failures (API, permissions, not found).
   */
  public async updateSetting(key: SettingKey, value: SettingValue): Promise<UserSettings> {
    try {
      // Perform client-side validation before sending to API
      validateSettingValue(key, value);

      logger.info(`Updating setting '${key}' to '${JSON.stringify(value)}' for user ${this.currentUserId}.`);
      const updatedSettings = await settingsAPIService.updateSetting(this.currentUserId, key, value);
      logger.info(`Setting '${key}' updated successfully for user ${this.currentUserId}.`);
      return updatedSettings;
    } catch (error: any) {
      logger.error(`Failed to update setting '${key}' for user ${this.currentUserId}: ${error.message}`, error);
      throw error; // Re-throw specific error types (e.g., InvalidSettingValueError, SettingNotFoundError, PermissionDeniedError)
    }
  }

  /**
   * Updates multiple user settings in a single batch operation for efficiency.
   * @param updates An object containing setting keys and their corresponding new values.
   * @returns A promise resolving to the updated UserSettings object.
   * @throws {InvalidSettingValueError} If any of the provided values fail validation.
   * @throws {SettingsError} For various bulk update failures.
   */
  public async bulkUpdateSettings(updates: Record<SettingKey, SettingValue>): Promise<UserSettings> {
    try {
      // Validate all updates upfront before attempting API call
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          validateSettingValue(key, updates[key]);
        }
      }
      logger.info(`Performing bulk update for ${Object.keys(updates).length} settings for user ${this.currentUserId}.`);
      const updatedSettings = await settingsAPIService.bulkUpdateSettings(this.currentUserId, updates);
      logger.info(`Bulk update completed successfully for user ${this.currentUserId}.`);
      return updatedSettings;
    } catch (error: any) {
      logger.error(`Failed to perform bulk update for user ${this.currentUserId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Resets all user settings to their predefined default values.
   * This is a destructive operation and should typically require user confirmation.
   * @returns A promise resolving to the default UserSettings after the reset.
   * @throws {SettingsError} If the reset operation fails.
   */
  public async resetAllSettings(): Promise<UserSettings> {
    try {
      logger.warn(`Initiating full settings reset for user ${this.currentUserId}. This action is generally irreversible without a backup.`);
      const resetSettings = await settingsAPIService.resetUserSettings(this.currentUserId);
      logger.info(`All settings reset to defaults for user ${this.currentUserId}.`);
      return resetSettings;
    } catch (error: any) {
      logger.error(`Failed to reset all settings for user ${this.currentUserId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Initiates a comprehensive AI-driven analysis of the user's current settings
   * to identify potential issues, optimizations, and provide recommendations.
   * @returns A promise resolving to a detailed AI analysis report.
   * @throws {SettingsError} If the AI analysis service fails.
   */
  public async performSettingsAIAnalysis(): Promise<GeminiAnalysisResult> {
    try {
      logger.info(`Requesting AI analysis of settings for user ${this.currentUserId}.`);
      const currentSettings = await this.getAllUserSettings();
      const analysisResult = await geminiAIService.analyzeSettingsImpact(currentSettings, this.currentUserContext);
      logger.info(`AI settings analysis completed for user ${this.currentUserId}. Report ID: ${analysisResult.reportId}`);
      return analysisResult;
    } catch (error: any) {
      logger.error(`Failed to perform AI settings analysis for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`AI settings analysis failed: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Requests AI to recommend optimal settings based on the user's behavior, device,
   * location, and other contextual factors.
   * @returns A promise resolving to an array of AI recommendations.
   * @throws {SettingsError} If the AI recommendation service fails.
   */
  public async getAIRecommendedSettings(): Promise<AIRecommendation[]> {
    try {
      logger.info(`Requesting AI-driven optimal setting recommendations for user ${this.currentUserId}.`);
      const currentSettings = await this.getAllUserSettings();
      const recommendations = await geminiAIService.recommendOptimalSettings(currentSettings, this.currentUserContext);
      logger.info(`Received ${recommendations.length} AI recommendations for user ${this.currentUserId}.`);
      return recommendations;
    } catch (error: any) {
      logger.error(`Failed to get AI recommendations for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`AI recommendation service failed: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Fetches an AI-generated, user-friendly explanation for a specific setting.
   * @param key The setting key for which to get an explanation.
   * @param locale The desired language for the explanation (defaults to 'en-US').
   * @returns A promise resolving to the explanation string.
   * @throws {SettingsError} If the AI explanation service fails.
   */
  public async getAISettingExplanation(key: SettingKey, locale: string = 'en-US'): Promise<string> {
    try {
      logger.info(`Requesting AI explanation for setting '${key}' for user ${this.currentUserId}.`);
      const currentSettings = await this.getAllUserSettings();
      const explanation = await geminiAIService.generateSettingExplanation(key, currentSettings, locale);
      logger.info(`Received AI explanation for setting '${key}'.`);
      return explanation;
    } catch (error: any) {
      logger.error(`Failed to get AI explanation for setting '${key}': ${error.message}`, error);
      throw new SettingsError(`AI explanation service failed: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Applies a specific set of AI recommendations to the user's settings.
   * This is typically used after the user reviews and approves specific recommendations.
   * @param recommendations An array of AI recommendations to apply.
   * @returns A promise resolving to the updated UserSettings.
   * @throws {SettingsError} If the application of recommendations fails.
   */
  public async applySpecificAIRecommendations(recommendations: AIRecommendation[]): Promise<UserSettings> {
    try {
      logger.info(`Applying ${recommendations.length} specific AI recommendations for user ${this.currentUserId}.`);
      const updatedSettings = await geminiAIService.applyAIRecommendations(this.currentUserId, recommendations);
      logger.info(`Successfully applied specific AI recommendations for user ${this.currentUserId}.`);
      return updatedSettings;
    } catch (error: any) {
      logger.error(`Failed to apply specific AI recommendations for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`Failed to apply AI recommendations: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Retrieves the audit history for all changes made to the current user's settings.
   * @param limit The maximum number of history entries to retrieve (defaults to 100).
   * @returns A promise resolving to an array of AuditLogEntry objects.
   * @throws {SettingsError} If fetching the history fails.
   */
  public async getSettingsHistory(limit: number = 100): Promise<AuditLogEntry[]> {
    try {
      logger.info(`Fetching setting history for user ${this.currentUserId}, limit: ${limit}.`);
      const history = await settingsAPIService.fetchSettingsHistory(this.currentUserId, limit);
      logger.info(`Retrieved ${history.length} setting history entries for user ${this.currentUserId}.`);
      return history;
    } catch (error: any) {
      logger.error(`Failed to retrieve settings history for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`Could not fetch settings history: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Rolls back a specific setting change using a provided audit entry ID.
   * This allows users to revert accidental or undesirable changes.
   * @param auditEntryId The ID of the audit log entry to revert the setting to its `oldValue`.
   * @returns A promise resolving to the updated UserSettings after the rollback.
   * @throws {SettingsError} If the rollback operation fails (e.g., entry not found, permission denied).
   */
  public async rollbackToPreviousSetting(auditEntryId: string): Promise<UserSettings> {
    try {
      logger.warn(`Initiating rollback for user ${this.currentUserId} to audit entry ${auditEntryId}.`);
      const updatedSettings = await settingsAPIService.rollbackSetting(this.currentUserId, auditEntryId);
      logger.info(`Successfully rolled back setting via audit entry ${auditEntryId} for user ${this.currentUserId}.`);
      return updatedSettings;
    } catch (error: any) {
      logger.error(`Failed to rollback setting for user ${this.currentUserId} with audit entry ${auditEntryId}: ${error.message}`, error);
      throw error; // Re-throw specific errors from API service
    }
  }

  /**
   * Fetches AI-generated troubleshooting suggestions for a described problem,
   * leveraging current settings and optional error logs for context.
   * @param problemDescription A natural language description of the problem.
   * @param recentErrorLogs Optional array of recent error messages for deeper AI analysis.
   * @returns A promise resolving to an array of troubleshooting steps.
   * @throws {SettingsError} If the AI troubleshooting service fails.
   */
  public async getAITroubleshootingSuggestions(problemDescription: string, recentErrorLogs?: string[]): Promise<string[]> {
    try {
      logger.info(`Requesting AI troubleshooting for user ${this.currentUserId} with problem: "${problemDescription}".`);
      const currentSettings = await this.getAllUserSettings();
      const suggestions = await geminiAIService.getTroubleshootingSuggestions(
        this.currentUserContext, problemDescription, currentSettings, recentErrorLogs
      );
      logger.info(`Received ${suggestions.length} AI troubleshooting suggestions for user ${this.currentUserId}.`);
      return suggestions;
    } catch (error: any) {
      logger.error(`Failed to get AI troubleshooting suggestions for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`AI troubleshooting service failed: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Provides a comprehensive AI-powered report on the user's security posture,
   * including detected vulnerabilities and specific recommendations for improvement.
   * @returns A promise resolving to an AI analysis result focused on security.
   * @throws {SettingsError} If the AI security report generation fails.
   */
  public async getAISecurityPostureReport(): Promise<GeminiAnalysisResult> {
    try {
      logger.info(`Generating AI security posture report for user ${this.currentUserId}.`);
      const currentSettings = await this.getAllUserSettings();
      const securityAnalysis = await geminiAIService.analyzeSettingsImpact(currentSettings, this.currentUserContext);
      // Refine the analysis type and summary to specifically reflect a security posture report.
      securityAnalysis.analysisType = 'AI-Powered Security Posture Report';
      securityAnalysis.summary = `AI-powered security posture assessment for user ${this.currentUserId} completed. Review detected issues and recommendations below for optimal security strength.`;
      logger.info(`AI security posture report generated for user ${this.currentUserId}. Report ID: ${securityAnalysis.reportId}`);
      return securityAnalysis;
    } catch (error: any) {
      logger.error(`Failed to generate AI security posture report for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`AI security report generation failed: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Applies all pending AI recommendations for a user. This might be a batch operation
   * typically presented to the user with an "Apply All" button, or an automated process.
   * @returns A promise resolving to the updated user settings after applying recommendations.
   * @throws {SettingsError} If applying all recommendations fails.
   */
  public async applyAllPendingAIRecommendations(): Promise<UserSettings> {
    try {
      logger.info(`Fetching all pending AI recommendations to apply for user ${this.currentUserId}.`);
      const currentSettings = await this.getAllUserSettings();
      // Re-run the recommendation engine to get a fresh list of applicable recommendations.
      const pendingRecommendations = await geminiAIService.recommendOptimalSettings(currentSettings, this.currentUserContext);

      if (pendingRecommendations.length === 0) {
        logger.info(`No pending AI recommendations to apply for user ${this.currentUserId}.`);
        return currentSettings; // Return current settings as no changes were made.
      }

      logger.info(`Found ${pendingRecommendations.length} pending AI recommendations. Attempting to apply them.`);
      const updatedSettings = await this.applySpecificAIRecommendations(pendingRecommendations);
      logger.info(`Successfully applied all pending AI recommendations for user ${this.currentUserId}.`);
      return updatedSettings;
    } catch (error: any) {
      logger.error(`Failed to apply all pending AI recommendations for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`Failed to apply all AI recommendations: ${error.message}`, (error as SettingsError)?.code);
    }
  }

  /**
   * Retrieves contextual feedback from AI for a specific setting, useful for tooltips or in-line help.
   * @param key The setting key.
   * @param currentValue The current value of the setting.
   * @param context Optional additional context for AI.
   * @returns A promise resolving to an AI-generated feedback string.
   * @throws {SettingsError} If the AI service fails.
   */
  public async getContextualSettingFeedback(
    key: SettingKey,
    currentValue: SettingValue,
    context?: { risks?: string[], benefits?: string[] }
  ): Promise<string> {
    try {
      logger.debug(`Requesting contextual feedback for '${key}' for user ${this.currentUserId}.`);
      return await geminiAIService.getContextualSettingFeedback(this.currentUserContext, key, currentValue, context);
    } catch (error: any) {
      logger.error(`Failed to get contextual feedback for '${key}' for user ${this.currentUserId}: ${error.message}`, error);
      throw new SettingsError(`AI contextual feedback failed: ${error.message}`, (error as SettingsError)?.code);
    }
  }
}

export const userSettingsManager = UserSettingsManager.getInstance(); // The primary exported manager instance


// --- Utility Functions ---

/**
 * A robust validation utility for various setting types and formats.
 * This ensures data integrity before settings are persisted.
 *
 * @param key The setting key (dot-separated path).
 * @param value The value to validate against the expected type/format for the given key.
 * @returns {true} If the value is valid.
 * @throws {InvalidSettingValueError} If the value is invalid.
 */
export function validateSettingValue(key: SettingKey, value: SettingValue): true {
  logger.debug(`Validating setting '${key}' with value: '${JSON.stringify(value)}'.`);
  switch (key) {
    case 'general.language':
      if (typeof value !== 'string' || !/^[a-z]{2}(-[A-Z]{2})?$/.test(value)) {
        throw new InvalidSettingValueError(key, value, 'a valid language code (e.g., "en-US", "es-ES")');
      }
      break;
    case 'general.timezone':
      // More robust validation would use a library (e.g., `moment-timezone` or `Intl.DateTimeFormat().resolvedOptions().timeZone`)
      if (typeof value !== 'string' || value.length < 3 || value.indexOf('/') === -1) { // Basic format check
        throw new InvalidSettingValueError(key, value, 'a valid IANA timezone string (e.g., "America/New_York")');
      }
      break;
    case 'general.dateFormat':
      if (typeof value !== 'string' || !['MM/DD/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'].includes(value)) {
        throw new InvalidSettingValueError(key, value, 'one of "MM/DD/YYYY", "DD-MM-YYYY", "YYYY-MM-DD"');
      }
      break;
    case 'general.timeFormat':
      if (typeof value !== 'string' || !['12h', '24h'].includes(value)) {
        throw new InvalidSettingValueError(key, value, 'either "12h" or "24h"');
      }
      break;
    case 'general.currency':
      if (typeof value !== 'string' || value.length !== 3 || !/^[A-Z]{3}$/.test(value)) {
        throw new InvalidSettingValueError(key, value, 'a 3-letter uppercase ISO currency code (e.g., "USD", "EUR")');
      }
      break;
    case 'general.liveMode':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'appearance.theme':
      if (typeof value !== 'string' || !Object.values(AppTheme).includes(value as AppTheme)) {
        throw new InvalidSettingValueError(key, value, `one of ${Object.values(AppTheme).join(', ')}`);
      }
      break;
    case 'appearance.fontSize':
      if (typeof value !== 'string' || !['small', 'medium', 'large', 'extra-large'].includes(value)) {
        throw new InvalidSettingValueError(key, value, 'one of "small", "medium", "large", "extra-large"');
      }
      break;
    case 'appearance.sidebarCollapsed':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'appearance.density':
      if (typeof value !== 'string' || !['compact', 'comfortable', 'spacious'].includes(value)) {
        throw new InvalidSettingValueError(key, value, 'one of "compact", "comfortable", "spacious"');
      }
      break;
    case `notifications.${NotificationType.EMAIL}`:
    case `notifications.${NotificationType.PUSH}`:
    case `notifications.${NotificationType.IN_APP}`:
    case `notifications.${NotificationType.SMS}`:
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'notifications.digestFrequency':
      if (typeof value !== 'string' || !['daily', 'weekly', 'monthly', 'none'].includes(value)) {
        throw new InvalidSettingValueError(key, value, 'one of "daily", "weekly", "monthly", "none"');
      }
      break;
    case 'notifications.marketingEmails':
    case 'notifications.criticalAlertsEnabled':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'security.twoFactorAuthenticationEnabled':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'security.passwordExpirationDays':
      if (typeof value !== 'number' || value < 0 || value > 730 || !Number.isInteger(value)) { // Max 2 years, or 0 for never
        throw new InvalidSettingValueError(key, value, 'an integer number between 0 and 730');
      }
      break;
    case 'security.sessionTimeoutMinutes':
      if (typeof value !== 'number' || value < 5 || value > 1440 || !Number.isInteger(value)) { // Min 5min, Max 24h
        throw new InvalidSettingValueError(key, value, 'an integer number between 5 and 1440');
      }
      break;
    case 'security.geofencingEnabled':
    case 'security.unusualLoginDetectionEnabled':
    case 'security.securityQuestionsSet':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'security.emergencyContactEmail':
      if (value !== null && (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
        throw new InvalidSettingValueError(key, value, 'a valid email address or null');
      }
      break;
    case 'privacy.dataSharingConsent':
    case 'privacy.analyticsCollectionEnabled':
    case 'privacy.personalizationEnabled':
    case 'privacy.marketingConsent':
    case 'privacy.anonymizeData':
    case 'privacy.rightToBeForgottenRequested':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'privacy.cookiePreferences':
      if (!Array.isArray(value) || !value.every(item => ['essential', 'analytics', 'marketing', 'functional'].includes(item))) {
        throw new InvalidSettingValueError(key, value, 'an array of valid cookie preference strings');
      }
      break;
    case 'advanced.developerMode':
    case 'advanced.debugLoggingEnabled':
    case 'advanced.apiAccessEnabled':
    case 'advanced.customCssEnabled':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    case 'aiAssistance.smartRecommendationsEnabled':
    case 'aiAssistance.proactiveSecurityMonitoring':
    case 'aiAssistance.contentPersonalizationEnabled':
    case 'aiAssistance.aiChatbotEnabled':
      if (typeof value !== 'boolean') {
        throw new InvalidSettingValueError(key, value, 'boolean');
      }
      break;
    // For integrations, validation would be more complex, likely in a separate module
    case 'integrations':
      if (!Array.isArray(value) || !value.every(item => typeof item === 'object' && item !== null && 'id' in item && 'name' in item && 'enabled' in item)) {
        throw new InvalidSettingValueError(key, value, 'an array of valid IntegrationSetting objects');
      }
      break;
    default:
      logger.debug(`No specific validation rule for setting key: '${key}'. Proceeding with generic type checks if applicable.`);
      // For new or dynamic settings, generic checks might apply here
      if (value === undefined) {
          throw new InvalidSettingValueError(key, value, 'a non-undefined value');
      }
      break;
  }
  return true;
}

/**
 * A utility function to debounce calls, useful for preventing excessive function executions
 * in response to rapid events (e.g., user typing in an input field for settings).
 *
 * @param {T} func The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void} A debounced version of the function.
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null; // Use NodeJS.Timeout for Node.js environments

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null; // Clear timeout reference after execution
    }, delay);
  };
}

/**
 * A utility function to perform a deep merge of two setting objects.
 * This is useful for applying partial updates to a complex settings object
 * or merging default values. It intelligently handles nested objects.
 *
 * @param {T} target The base object to merge into.
 * @param {Partial<T>} source The object containing properties to merge from.
 * @returns {T} The deeply merged object.
 */
export function deepMergeSettings<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target } as T; // Start with a shallow copy of the target

  if (target && typeof target === 'object' && source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      const targetKey = key as keyof T;
      // If both target and source have this key as an object (and not an array)
      if (source[targetKey] && typeof source[targetKey] === 'object' && !Array.isArray(source[targetKey]) &&
          output[targetKey] && typeof output[targetKey] === 'object' && !Array.isArray(output[targetKey])) {
        // Recurse for nested objects
        output[targetKey] = deepMergeSettings(output[targetKey] as object, source[targetKey] as object) as any;
      } else {
        // Otherwise, directly assign the value from source (overwriting target)
        // This handles primitive values, arrays, and cases where target[key] is not an object.
        output[targetKey] = source[targetKey] as any;
      }
    });
  }
  return output;
}

/**
 * Calculates a quantitative security score based on the user's current security settings.
 * A higher score indicates a stronger security posture.
 * This function can be used to provide users with an actionable security rating.
 *
 * @param {SecuritySettings} settings The user's current security settings.
 * @returns {number} A number representing the security score (0-100).
 */
export function calculateSecurityScore(settings: SecuritySettings): number {
  let score = 0;
  let maxScore = 0;

  // Weight for Two-Factor Authentication (critical)
  maxScore += 30;
  if (settings.twoFactorAuthenticationEnabled) {
    score += 30;
  }

  // Weight for Password Expiration Policy (important)
  maxScore += 20;
  if (settings.passwordExpirationDays >= 90) { // 90+ days is good
    score += 20;
  } else if (settings.passwordExpirationDays >= 60) { // 60 days is fair
    score += 15;
  } else if (settings.passwordExpirationDays > 0) { // <60 days is weak but present
    score += 10;
  } // 0 means no expiration, which is generally poor unless compensated by other factors

  // Weight for Session Timeout (good practice)
  maxScore += 15;
  if (settings.sessionTimeoutMinutes <= 60) { // 1 hour or less is good
    score += 15;
  } else if (settings.sessionTimeoutMinutes <= 180) { // 1-3 hours is acceptable
    score += 10;
  } else if (settings.sessionTimeoutMinutes <= 480) { // 3-8 hours is risky
    score += 5;
  }

  // Weight for Unusual Login Detection (modern security)
  maxScore += 20;
  if (settings.unusualLoginDetectionEnabled) {
    score += 20;
  }

  // Weight for Security Questions Set (basic recovery/verification layer)
  maxScore += 10;
  if (settings.securityQuestionsSet) {
    score += 10;
  }

  // Weight for Geofencing (advanced protection)
  maxScore += 5;
  if (settings.geofencingEnabled) {
    score += 5;
  }

  // Scale the raw score to a 0-100 range
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Generates a human-readable summary string of the user's current privacy settings.
 * This can be used in a privacy dashboard or a settings review section.
 *
 * @param {PrivacySettings} privacySettings The user's privacy settings object.
 * @returns {string} A concise summary string.
 */
export function generatePrivacySummary(privacySettings: PrivacySettings): string {
  let summaryParts: string[] = [];
  const active: string[] = [];
  const inactive: string[] = [];

  if (privacySettings.dataSharingConsent) active.push("Data Sharing"); else inactive.push("Data Sharing");
  if (privacySettings.analyticsCollectionEnabled) active.push("Analytics Collection"); else inactive.push("Analytics Collection");
  if (privacySettings.personalizationEnabled) active.push("Personalization"); else inactive.push("Personalization");
  if (privacySettings.marketingConsent) active.push("Marketing Consent"); else inactive.push("Marketing Consent");
  if (privacySettings.anonymizeData) active.push("Data Anonymization Request"); else inactive.push("Data Anonymization Request");

  if (active.length > 0) {
    summaryParts.push(`Enabled: ${active.join(', ')}.`);
  }
  if (inactive.length > 0) {
    summaryParts.push(`Disabled: ${inactive.join(', ')}.`);
  }

  const cookieSummary = privacySettings.cookiePreferences.length > 0
    ? `Cookies: ${privacySettings.cookiePreferences.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}.`
    : 'No specific cookie preferences set (defaults apply).';
  summaryParts.push(cookieSummary);

  if (privacySettings.rightToBeForgottenRequested) {
    summaryParts.push("Right to be forgotten request is active.");
  }

  return `Your privacy summary: ${summaryParts.join(' ')}`;
}

/**
 * Exports a comprehensive template of default settings.
 * This is crucial for onboarding new users or resetting existing users' settings
 * to a known, sane, and secure baseline.
 *
 * @returns {UserSettings} A `UserSettings` object with all properties set to their default, recommended values.
 */
export function getDefaultUserSettingsTemplate(): UserSettings {
  return {
    userId: 'default_user_template', // Placeholder, must be replaced with actual user ID
    general: {
      language: "en-US",
      timezone: "UTC",
      dateFormat: "YYYY-MM-DD",
      timeFormat: "24h",
      currency: "USD",
      liveMode: false,
    },
    appearance: {
      theme: AppTheme.SYSTEM, // Follows operating system's theme preference by default
      fontSize: 'medium',
      sidebarCollapsed: false,
      density: 'comfortable',
    },
    notifications: {
      [NotificationType.EMAIL]: true,
      [NotificationType.PUSH]: true,
      [NotificationType.IN_APP]: true,
      [NotificationType.SMS]: false,
      digestFrequency: 'daily',
      marketingEmails: false,
      criticalAlertsEnabled: true, // Always enabled for safety
    },
    security: {
      twoFactorAuthenticationEnabled: false, // Default to false but highly recommended
      passwordExpirationDays: 90, // Recommended 90-day expiration
      lastPasswordChange: null, // Should be set upon user's first password change
      sessionTimeoutMinutes: 30, // Default to 30 minutes for security
      recentLoginAttempts: [],
      geofencingEnabled: false,
      unusualLoginDetectionEnabled: true, // Recommended for proactive security
      securityQuestionsSet: false,
      trustedDevices: [],
      emergencyContactEmail: null,
    },
    privacy: {
      dataSharingConsent: true, // Opt-in by default in many contexts, but adjust based on compliance
      analyticsCollectionEnabled: true,
      personalizationEnabled: true,
      marketingConsent: false, // Opt-out by default for marketing
      cookiePreferences: ["essential", "functional", "analytics"], // Default to essential, functional, analytics
      anonymizeData: false,
      rightToBeForgottenRequested: false,
    },
    integrations: [], // No third-party integrations enabled by default
    advanced: {
      developerMode: false,
      debugLoggingEnabled: false,
      apiAccessEnabled: false,
      customCssEnabled: false,
    },
    aiAssistance: {
      smartRecommendationsEnabled: true, // AI assistance enabled by default
      proactiveSecurityMonitoring: true,
      contentPersonalizationEnabled: true,
      aiChatbotEnabled: true,
    }
  };
}