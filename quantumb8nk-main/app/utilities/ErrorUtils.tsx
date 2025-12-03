```typescript
// Error Management Utilities for Robust Application Development
// This file provides a comprehensive, AI-enhanced error handling framework
// designed for high-availability, commercial-grade applications.

/**
 * @typedef {Object} ErrorContext
 * @property {string} [userId] - The ID of the user experiencing the error.
 * @property {string} [sessionId] - The current user session ID.
 * @property {string} [route] - The application route or path where the error occurred.
 * @property {string} [component] - The UI component where the error originated.
 * @property {Object.<string, any>} [metadata] - Additional arbitrary key-value metadata.
 * @property {Object} [request] - Details about the HTTP request, if applicable.
 * @property {string} [request.method]
 * @property {string} [request.url]
 * @property {Object.<string, string>} [request.headers]
 * @property {any} [request.body]
 * @property {Object} [response] - Details about the HTTP response, if applicable.
 * @property {number} [response.status]
 * @property {string} [response.statusText]
 * @property {any} [response.data]
 * @property {Object} [device] - Device-specific information.
 * @property {string} [device.userAgent]
 * @property {string} [device.platform]
 * @property {string} [device.language]
 * @property {number} [device.screenWidth]
 * @property {number} [device.screenHeight]
 * @property {Object} [environment] - Application environment details.
 * @property {string} [environment.appName]
 * @property {string} [environment.appVersion]
 * @property {string} [environment.nodeEnv]
 * @property {string} [transactionId] - A unique identifier for a business transaction.
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  component?: string;
  metadata?: { [key: string]: any };
  request?: {
    method?: string;
    url?: string;
    headers?: { [key: string]: string };
    body?: any;
  };
  response?: {
    status?: number;
    statusText?: string;
    data?: any;
  };
  device?: {
    userAgent?: string;
    platform?: string;
    language?: string;
    screenWidth?: number;
    screenHeight?: number;
  };
  environment?: {
    appName?: string;
    appVersion?: string;
    nodeEnv?: string;
  };
  transactionId?: string;
}

/**
 * Defines standard error codes for categorization and programmatic handling.
 */
export enum AppErrorCode {
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  GENERIC_CLIENT_ERROR = 'GENERIC_CLIENT_ERROR',
  GENERIC_SERVER_ERROR = 'GENERIC_SERVER_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',

  // Network & Communication Errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  BAD_REQUEST = 'BAD_REQUEST', // 400
  UNAUTHORIZED = 'UNAUTHORIZED', // 401
  FORBIDDEN = 'FORBIDDEN', // 403
  NOT_FOUND = 'NOT_FOUND', // 404
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED', // 405
  CONFLICT = 'CONFLICT', // 409
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS', // 429
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // 500
  BAD_GATEWAY = 'BAD_GATEWAY', // 502
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE', // 503
  GATEWAY_TIMEOUT = 'GATEWAY_TIMEOUT', // 504
  CORS_ERROR = 'CORS_ERROR',

  // Data & Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  DATA_INTEGRITY_VIOLATION = 'DATA_INTEGRITY_VIOLATION',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // UI/Client-Side Specific Errors
  UI_RENDER_ERROR = 'UI_RENDER_ERROR',
  EVENT_HANDLER_ERROR = 'EVENT_HANDLER_ERROR',
  BROWSER_API_UNAVAILABLE = 'BROWSER_API_UNAVAILABLE',
  LOCAL_STORAGE_ERROR = 'LOCAL_STORAGE_ERROR',

  // External Service & AI Integration Errors
  EXTERNAL_SERVICE_UNAVAILABLE = 'EXTERNAL_SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_AUTH_FAILED = 'EXTERNAL_SERVICE_AUTH_FAILED',
  EXTERNAL_SERVICE_RATE_LIMIT = 'EXTERNAL_SERVICE_RATE_LIMIT',
  AI_MODEL_INFERENCE_FAILED = 'AI_MODEL_INFERENCE_FAILED',
  AI_MODEL_QUOTA_EXCEEDED = 'AI_MODEL_QUOTA_EXCEEDED',
  AI_MODEL_UNRESPONSIVE = 'AI_MODEL_UNRESPONSIVE',
  AI_PROMPT_GENERATION_FAILED = 'AI_PROMPT_GENERATION_FAILED',
  AI_RESPONSE_PARSING_FAILED = 'AI_RESPONSE_PARSING_FAILED',

  // Business Logic Errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
}

/**
 * Defines the severity level of an error, influencing logging and alert priorities.
 */
export enum ErrorSeverity {
  CRITICAL = 'CRITICAL', // Immediate attention required, potentially service-impacting.
  HIGH = 'HIGH', // Significant issue, requires investigation.
  MEDIUM = 'MEDIUM', // Moderate issue, should be addressed.
  LOW = 'LOW', // Minor issue, informational, or potential future problem.
  INFO = 'INFO', // Purely informational, not an error but a notable event.
}

/**
 * Defines categories for errors, useful for filtering and reporting.
 */
export enum ErrorCategory {
  CLIENT = 'CLIENT', // Errors originating from user interaction or browser environment.
  SERVER = 'SERVER', // Errors originating from backend systems.
  NETWORK = 'NETWORK', // Errors related to communication failures.
  DATABASE = 'DATABASE', // Errors related to data storage and retrieval.
  AUTHENTICATION = 'AUTHENTICATION', // Errors related to user identity and access.
  AUTHORIZATION = 'AUTHORIZATION', // Errors related to user permissions.
  VALIDATION = 'VALIDATION', // Errors due to invalid data input.
  BUSINESS_LOGIC = 'BUSINESS_LOGIC', // Errors due to application-specific rules.
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE', // Errors from third-party APIs.
  AI_INTEGRATION = 'AI_INTEGRATION', // Errors specifically from AI model interactions.
  CONFIGURATION = 'CONFIGURATION', // Errors due to incorrect system setup.
  UNKNOWN = 'UNKNOWN', // When the category cannot be determined.
}

/**
 * Defines types of prompts that can be sent to an AI model for error analysis.
 */
export enum GeminiPromptType {
  ROOT_CAUSE_ANALYSIS = 'ROOT_CAUSE_ANALYSIS',
  RESOLUTION_SUGGESTION = 'RESOLUTION_SUGGESTION',
  USER_FRIENDLY_MESSAGE = 'USER_FRIENDLY_MESSAGE',
  ERROR_SUMMARY = 'ERROR_SUMMARY',
  SECURITY_IMPACT_ASSESSMENT = 'SECURITY_IMPACT_ASSESSMENT',
  PERFORMANCE_IMPACT_ASSESSMENT = 'PERFORMANCE_IMPACT_ASSESSMENT',
}

/**
 * Interface for AI analysis results.
 */
export interface GeminiAnalysisResult {
  analysisType: GeminiPromptType;
  result: string;
  confidenceScore?: number; // 0-1
  suggestedActions?: string[];
  rawAIResponse?: string;
}

/**
 * Base class for all application-specific errors.
 * Provides structured error data, context, and a mechanism for AI analysis.
 */
export class AppError extends Error {
  public readonly name: string;
  public readonly code: AppErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly timestamp: string;
  public readonly correlationId: string;
  public readonly context: ErrorContext;
  public readonly userFacingMessage: string;
  public readonly isOperational: boolean; // Indicates if this is an error handled by code logic (vs. programmer error)
  public readonly originalError?: Error; // Stores the original error if this is a wrapper.
  public readonly aiAnalysisResults: GeminiAnalysisResult[] = [];

  /**
   * Constructs an instance of AppError.
   * @param {string} message - A concise, technical description of the error.
   * @param {AppErrorCode} code - A specific, programmatic error code.
   * @param {ErrorSeverity} [severity=ErrorSeverity.HIGH] - The severity level of the error.
   * @param {ErrorCategory} [category=ErrorCategory.UNKNOWN] - The category of the error.
   * @param {ErrorContext} [context={}] - Additional contextual information about the error.
   * @param {string} [userFacingMessage] - A message safe and friendly to display to end-users. Defaults to a generic message.
   * @param {boolean} [isOperational=true] - True if this error is expected and handled within application logic.
   * @param {Error} [originalError] - The underlying Error object, if wrapping another error.
   */
  constructor(
    message: string,
    code: AppErrorCode,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context: ErrorContext = {},
    userFacingMessage?: string,
    isOperational: boolean = true,
    originalError?: Error,
  ) {
    super(message); // Call parent Error constructor
    Object.setPrototypeOf(this, AppError.prototype); // Ensure proper prototype chain for instanceof checks

    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.timestamp = new Date().toISOString();
    this.correlationId = generateCorrelationId();
    this.context = { ...collectClientEnvironment(), ...context }; // Merge client env with provided context
    this.userFacingMessage =
      userFacingMessage || ErrorMessages.getGenericUserMessage(severity);
    this.isOperational = isOperational;
    this.originalError = originalError;

    // Capture stack trace for environments that support it (like Node.js and modern browsers)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Adds an AI analysis result to the error object.
   * @param {GeminiAnalysisResult} result - The result of an AI analysis operation.
   */
  public addAIAnalysisResult(result: GeminiAnalysisResult): void {
    this.aiAnalysisResults.push(result);
  }

  /**
   * Returns a serialized version of the error, useful for logging or sending over network.
   * @returns {Object} A plain object representation of the error.
   */
  public toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
      userFacingMessage: this.userFacingMessage,
      isOperational: this.isOperational,
      stack: this.stack,
      context: this.context,
      originalError: this.originalError ? serializeError(this.originalError) : undefined,
      aiAnalysisResults: this.aiAnalysisResults,
    };
  }

  /**
   * Creates a structured string representation of the error for display.
   * @param {boolean} [includeStack=false] - Whether to include the stack trace.
   * @returns {string} A formatted string representation.
   */
  public toFormattedString(includeStack: boolean = false): string {
    const parts = [
      `Error: ${this.name} [${this.code}]`,
      `Message: ${this.message}`,
      `Severity: ${this.severity}`,
      `Category: ${this.category}`,
      `Timestamp: ${this.timestamp}`,
      `Correlation ID: ${this.correlationId}`,
      `User Message: ${this.userFacingMessage}`,
    ];

    if (Object.keys(this.context).length > 0) {
      parts.push(`Context: ${JSON.stringify(this.context, null, 2)}`);
    }

    if (this.aiAnalysisResults.length > 0) {
      this.aiAnalysisResults.forEach((res, i) => {
        parts.push(`AI Analysis Result ${i + 1} (${res.analysisType}): ${res.result}`);
        if (res.suggestedActions?.length) {
          parts.push(`  Suggested Actions: ${res.suggestedActions.join('; ')}`);
        }
      });
    }

    if (includeStack && this.stack) {
      parts.push(`Stack Trace:\n${this.stack}`);
    }

    return parts.join('\n');
  }
}

/**
 * Custom error for network-related issues.
 */
export class NetworkError extends AppError {
  constructor(
    message: string,
    originalError?: Error,
    context?: ErrorContext,
    statusCode?: number,
  ) {
    const msg = message || `Network request failed${statusCode ? `: ${statusCode}` : ''}.`;
    super(
      msg,
      statusCode === 401
        ? AppErrorCode.UNAUTHORIZED
        : statusCode === 403
          ? AppErrorCode.FORBIDDEN
          : statusCode === 404
            ? AppErrorCode.NOT_FOUND
            : statusCode && statusCode >= 400 && statusCode < 500
              ? AppErrorCode.BAD_REQUEST
              : statusCode && statusCode >= 500
                ? AppErrorCode.INTERNAL_SERVER_ERROR
                : AppErrorCode.NETWORK_TIMEOUT,
      ErrorSeverity.HIGH,
      ErrorCategory.NETWORK,
      { ...context, statusCode },
      ErrorMessages.NETWORK_FAILURE,
      true,
      originalError,
    );
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Custom error for authentication failures.
 */
export class AuthenticationError extends AppError {
  constructor(message: string, originalError?: Error, context?: ErrorContext) {
    super(
      message || 'Authentication required or failed.',
      AppErrorCode.UNAUTHORIZED,
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHENTICATION,
      context,
      ErrorMessages.AUTH_FAILURE,
      true,
      originalError,
    );
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Custom error for permission-related issues.
 */
export class PermissionError extends AppError {
  constructor(message: string, originalError?: Error, context?: ErrorContext) {
    super(
      message || 'You do not have the necessary permissions.',
      AppErrorCode.FORBIDDEN,
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHORIZATION,
      context,
      ErrorMessages.PERMISSION_DENIED,
      true,
      originalError,
    );
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * Custom error for configuration problems.
 */
export class ConfigurationError extends AppError {
  constructor(message: string, originalError?: Error, context?: ErrorContext) {
    super(
      message || 'Application configuration is invalid or missing.',
      AppErrorCode.CONFIGURATION_ERROR,
      ErrorSeverity.CRITICAL,
      ErrorCategory.CONFIGURATION,
      context,
      ErrorMessages.CONFIG_ERROR,
      true,
      originalError,
    );
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Custom error for issues encountered during AI model inference or interaction.
 */
export class AIModelError extends AppError {
  constructor(
    message: string,
    originalError?: Error,
    context?: ErrorContext,
    aiModelName?: string,
    aiOperation?: string,
    statusCode?: number,
  ) {
    super(
      message || 'An error occurred during AI model processing.',
      statusCode === 429 ? AppErrorCode.AI_MODEL_QUOTA_EXCEEDED : AppErrorCode.AI_MODEL_INFERENCE_FAILED,
      ErrorSeverity.HIGH,
      ErrorCategory.AI_INTEGRATION,
      { ...context, aiModelName, aiOperation, statusCode },
      ErrorMessages.AI_MODEL_FAILURE,
      true,
      originalError,
    );
    Object.setPrototypeOf(this, AIModelError.prototype);
  }
}

/**
 * Custom error for data validation failures.
 */
export class DataValidationError extends AppError {
  constructor(
    message: string,
    originalError?: Error,
    context?: ErrorContext,
    validationDetails?: { [field: string]: string[] },
  ) {
    super(
      message || 'Data validation failed.',
      AppErrorCode.VALIDATION_FAILED,
      ErrorSeverity.MEDIUM,
      ErrorCategory.VALIDATION,
      { ...context, validationDetails },
      ErrorMessages.VALIDATION_FAILED,
      true,
      originalError,
    );
    Object.setPrototypeOf(this, DataValidationError.prototype);
  }
}

/**
 * Custom error for business logic violations.
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, originalError?: Error, context?: ErrorContext) {
    super(
      message || 'A business rule was violated.',
      AppErrorCode.BUSINESS_RULE_VIOLATION,
      ErrorSeverity.MEDIUM,
      ErrorCategory.BUSINESS_LOGIC,
      context,
      ErrorMessages.BUSINESS_RULE_VIOLATION,
      true,
      originalError,
    );
    Object.setPrototypeOf(this, BusinessLogicError.prototype);
  }
}

/**
 * Provides user-friendly messages for common error scenarios.
 */
export const ErrorMessages = {
  NETWORK_FAILURE: 'We\'re having trouble connecting to the server. Please check your internet connection and try again.',
  AUTH_FAILURE: 'Your session has expired or you are not authorized. Please log in again.',
  PERMISSION_DENIED: 'You don\'t have permission to perform this action. Contact support if you believe this is incorrect.',
  CONFIG_ERROR: 'A critical configuration error occurred. Please contact support.',
  AI_MODEL_FAILURE: 'We encountered an issue with our AI services. Please try again later or contact support.',
  VALIDATION_FAILED: 'Please check your input. Some fields are invalid or missing.',
  BUSINESS_RULE_VIOLATION: 'The action cannot be completed due to a business rule. Please review your request.',
  GENERIC_CRITICAL: 'A critical error occurred. Our team has been notified. Please try again or contact support.',
  GENERIC_HIGH: 'An unexpected error occurred. We are looking into it. Please try again later.',
  GENERIC_MEDIUM: 'Something went wrong. Please refresh the page or try again.',
  GENERIC_LOW: 'A minor issue occurred. It might be temporary.',
  GENERIC_INFO: 'An informational event occurred.',

  /**
   * Gets a generic user-facing message based on severity.
   * @param {ErrorSeverity} severity - The severity level of the error.
   * @returns {string} A user-friendly message.
   */
  getGenericUserMessage: (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return ErrorMessages.GENERIC_CRITICAL;
      case ErrorSeverity.HIGH:
        return ErrorMessages.GENERIC_HIGH;
      case ErrorSeverity.MEDIUM:
        return ErrorMessages.GENERIC_MEDIUM;
      case ErrorSeverity.LOW:
        return ErrorMessages.GENERIC_LOW;
      case ErrorSeverity.INFO:
        return ErrorMessages.GENERIC_INFO;
      default:
        return ErrorMessages.GENERIC_HIGH;
    }
  },
};

/**
 * Configuration interface for the Error Manager and related services.
 */
export interface ErrorManagerConfig {
  aiServiceEnabled?: boolean;
  aiServiceEndpoint?: string;
  aiServiceApiKey?: string;
  reportErrorsToBackend?: boolean;
  backendErrorReportingEndpoint?: string;
  batchReportingIntervalMs?: number; // How often to send batched errors
  maxBatchedErrors?: number; // Max errors to batch before sending
  enableGlobalErrorCapture?: boolean;
  debugMode?: boolean; // Log more verbose error info
  errorBlacklist?: AppErrorCode[]; // Do not report these specific error codes
  errorThresholds?: { [key in ErrorSeverity]?: number }; // e.g., max 10 CRITICAL errors/minute
  onBeforeReport?: (error: AppError) => AppError | null; // Hook to modify or block error reporting
  onAIAnalysisComplete?: (error: AppError, result: GeminiAnalysisResult) => void;
  // Custom headers for error reporting
  reportingHeaders?: { [key: string]: string };
}

/**
 * Default configuration for the Error Manager.
 */
const DEFAULT_ERROR_MANAGER_CONFIG: ErrorManagerConfig = {
  aiServiceEnabled: true,
  aiServiceEndpoint: '/api/gemini-ai-proxy/analyze-error', // Conceptual proxy endpoint
  aiServiceApiKey: 'sk-YOUR_GEMINI_API_KEY', // Should be loaded securely
  reportErrorsToBackend: true,
  backendErrorReportingEndpoint: '/api/errors',
  batchReportingIntervalMs: 5000,
  maxBatchedErrors: 10,
  enableGlobalErrorCapture: true,
  debugMode: process.env.NODE_ENV === 'development',
  errorBlacklist: [],
  errorThresholds: {
    [ErrorSeverity.CRITICAL]: 5, // 5 critical errors per reporting interval
    [ErrorSeverity.HIGH]: 20,
  },
  onBeforeReport: (error) => error, // Default: no modification
  onAIAnalysisComplete: (error, result) => {
    if (ErrorManager.config.debugMode) {
      console.debug(`[ErrorManager] AI Analysis for ${error.code} (${result.analysisType}):`, result);
    }
  },
  reportingHeaders: {
    'Content-Type': 'application/json',
    'X-App-Client-ID': 'your-app-client-id', // Example header
  },
};

/**
 * A mock/conceptual service for interacting with a Gemini AI model.
 * In a real application, this would involve secure API calls to a backend proxy
 * that then interacts with the Gemini API.
 */
export class GeminiAIService {
  private config: ErrorManagerConfig;

  constructor(config: ErrorManagerConfig) {
    this.config = config;
  }

  /**
   * Simulates sending an error to a Gemini AI model for analysis.
   * @param {AppError} error - The error object to analyze.
   * @param {GeminiPromptType} analysisType - The type of analysis requested.
   * @returns {Promise<GeminiAnalysisResult | null>} A promise resolving to the analysis result.
   */
  public async analyzeError(
    error: AppError,
    analysisType: GeminiPromptType,
  ): Promise<GeminiAnalysisResult | null> {
    if (!this.config.aiServiceEnabled || !this.config.aiServiceEndpoint) {
      if (this.config.debugMode) {
        console.warn('[GeminiAIService] AI service is disabled or endpoint is not configured.');
      }
      return null;
    }

    try {
      const prompt = this.generatePrompt(error, analysisType);
      if (this.config.debugMode) {
        console.debug(`[GeminiAIService] Sending AI prompt for ${analysisType}:`, prompt);
      }

      // Simulate API call to Gemini (or a backend proxy)
      const response = await fetch(this.config.aiServiceEndpoint, {
        method: 'POST',
        headers: {
          ...this.config.reportingHeaders,
          'Authorization': `Bearer ${this.config.aiServiceApiKey}`, // Use a more secure method in production
        },
        body: JSON.stringify({
          prompt: prompt,
          error: error.toJSON(), // Send the structured error data
          analysisType: analysisType,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service responded with status ${response.status}: ${response.statusText}`);
      }

      const rawAIResponse: { analysisResult: string; confidence?: number; actions?: string[] } = await response.json();

      const result: GeminiAnalysisResult = {
        analysisType: analysisType,
        result: rawAIResponse.analysisResult || 'No specific analysis result from AI.',
        confidenceScore: rawAIResponse.confidence,
        suggestedActions: rawAIResponse.actions,
        rawAIResponse: JSON.stringify(rawAIResponse),
      };

      this.config.onAIAnalysisComplete?.(error, result);
      return result;
    } catch (e: any) {
      console.error(`[GeminiAIService] Failed to get AI analysis for ${analysisType}:`, e);
      // It's crucial not to let AI service failures crash the main error handling
      return null;
    }
  }

  /**
   * Generates a prompt string for the AI model based on the error and desired analysis type.
   * @param {AppError} error - The error object.
   * @param {GeminiPromptType} analysisType - The type of analysis.
   * @returns {string} The generated prompt.
   */
  private generatePrompt(error: AppError, analysisType: GeminiPromptType): string {
    const errorDetails = `Error Code: ${error.code}\nMessage: ${error.message}\nSeverity: ${error.severity}\nCategory: ${error.category}\nStack: ${error.stack}\nContext: ${JSON.stringify(error.context)}`;

    switch (analysisType) {
      case GeminiPromptType.ROOT_CAUSE_ANALYSIS:
        return `Analyze the following application error to identify its most likely root cause. Provide a concise explanation and, if possible, suggest a specific component or module that might be at fault.
${errorDetails}`;
      case GeminiPromptType.RESOLUTION_SUGGESTION:
        return `Based on the following error, suggest concrete steps for resolution. Prioritize steps that can be taken by developers or operations teams, and if applicable, simple user-facing workarounds.
${errorDetails}`;
      case GeminiPromptType.USER_FRIENDLY_MESSAGE:
        return `Generate a concise, empathetic, and user-friendly message for an end-user based on the following technical error. Avoid jargon and suggest a simple next step if possible.
${errorDetails}`;
      case GeminiPromptType.ERROR_SUMMARY:
        return `Provide a brief summary of the key characteristics and potential impact of the following error.
${errorDetails}`;
      case GeminiPromptType.SECURITY_IMPACT_ASSESSMENT:
        return `Assess the potential security implications of the following error. Could it indicate a vulnerability, data exposure, or unauthorized access attempt?
${errorDetails}`;
      case GeminiPromptType.PERFORMANCE_IMPACT_ASSESSMENT:
        return `Evaluate the potential performance impact of the following error. Could it lead to system slowdowns, resource exhaustion, or service degradation?
${errorDetails}`;
      default:
        return `Analyze the following error: ${errorDetails}`;
    }
  }
}

/**
 * Manages the reporting and logging of errors, including batching and rate-limiting.
 */
export class ErrorReporter {
  private config: ErrorManagerConfig;
  private geminiAIService: GeminiAIService;
  private errorQueue: AppError[] = [];
  private reportingTimer: ReturnType<typeof setTimeout> | null = null;
  private errorCounts: Map<string, { count: number; lastReported: number }> = new Map(); // For rate limiting

  constructor(config: ErrorManagerConfig, geminiAIService: GeminiAIService) {
    this.config = config;
    this.geminiAIService = geminiAIService;
    if (this.config.reportErrorsToBackend && this.config.batchReportingIntervalMs) {
      this.startReportingTimer();
    }
  }

  /**
   * Reports an error. This method enqueues the error for batch sending
   * and potentially triggers AI analysis.
   * @param {AppError} error - The error to report.
   */
  public async report(error: AppError): Promise<void> {
    if (this.config.errorBlacklist?.includes(error.code)) {
      if (this.config.debugMode) {
        console.debug(`[ErrorReporter] Error ${error.code} is blacklisted and will not be reported.`);
      }
      return;
    }

    if (!error.isOperational && !this.config.debugMode) {
      // For unhandled programmer errors in production, we might want to log immediately
      // or ensure they bypass some rate limiting for initial discovery.
      // For now, treat all `AppError` instances as operational for reporting purposes.
    }

    const fingerprint = this.fingerprintError(error);
    if (this.isRateLimited(fingerprint, error.severity)) {
      if (this.config.debugMode) {
        console.warn(`[ErrorReporter] Error ${error.code} (${fingerprint}) is rate-limited and will not be reported.`);
      }
      return;
    }

    const modifiedError = this.config.onBeforeReport?.(error);
    if (modifiedError === null) {
      if (this.config.debugMode) {
        console.debug(`[ErrorReporter] Error reporting blocked by onBeforeReport hook for ${error.code}.`);
      }
      return; // Error reporting blocked by hook
    } else if (modifiedError) {
      error = modifiedError;
    }

    // Trigger AI analysis if enabled
    if (this.config.aiServiceEnabled) {
      // Fire and forget, don't block reporting on AI analysis completion
      this.runAIAnalysis(error);
    }

    if (this.config.debugMode) {
      console.error(`[ErrorReporter] Reporting AppError: ${error.toFormattedString(true)}`);
    }

    this.logErrorToConsole(error);

    if (this.config.reportErrorsToBackend) {
      this.errorQueue.push(error);
      if (
        this.config.maxBatchedErrors &&
        this.errorQueue.length >= this.config.maxBatchedErrors
      ) {
        this.flush();
      }
    }
  }

  /**
   * Immediately sends all currently queued errors to the backend.
   */
  public flush(): void {
    if (this.errorQueue.length === 0) {
      return;
    }

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = []; // Clear queue immediately to avoid duplicates

    if (this.reportingTimer) {
      clearTimeout(this.reportingTimer);
      this.startReportingTimer(); // Restart timer for next batch
    }

    this.sendBatch(errorsToSend);
  }

  /**
   * Starts the periodic timer for batch error reporting.
   */
  private startReportingTimer(): void {
    if (this.reportingTimer) {
      clearTimeout(this.reportingTimer);
    }
    if (this.config.batchReportingIntervalMs) {
      this.reportingTimer = setTimeout(() => {
        this.flush();
      }, this.config.batchReportingIntervalMs);
    }
  }

  /**
   * Sends a batch of errors to the configured backend endpoint.
   * @param {AppError[]} errors - An array of errors to send.
   */
  private async sendBatch(errors: AppError[]): Promise<void> {
    if (errors.length === 0 || !this.config.backendErrorReportingEndpoint) {
      return;
    }

    if (this.config.debugMode) {
      console.log(`[ErrorReporter] Sending batch of ${errors.length} errors to backend.`);
    }

    try {
      const serializedErrors = errors.map((e) => e.toJSON());
      const response = await fetch(this.config.backendErrorReportingEndpoint, {
        method: 'POST',
        headers: this.config.reportingHeaders,
        body: JSON.stringify({ errors: serializedErrors }),
      });

      if (!response.ok) {
        // Log the failure to send errors, but don't re-throw to avoid loops
        console.error(
          `[ErrorReporter] Failed to send error batch: ${response.status} ${response.statusText}`,
          await response.text(),
        );
      } else {
        if (this.config.debugMode) {
          console.log(`[ErrorReporter] Successfully sent ${errors.length} errors.`);
        }
      }
    } catch (e: any) {
      console.error('[ErrorReporter] Network error while sending error batch:', e);
    }
  }

  /**
   * Runs various AI analysis types on an error concurrently.
   * @param {AppError} error - The error to analyze.
   */
  private async runAIAnalysis(error: AppError): Promise<void> {
    const analysisTypes = [
      GeminiPromptType.ROOT_CAUSE_ANALYSIS,
      GeminiPromptType.RESOLUTION_SUGGESTION,
      GeminiPromptType.USER_FRIENDLY_MESSAGE,
      GeminiPromptType.ERROR_SUMMARY,
      // GeminiPromptType.SECURITY_IMPACT_ASSESSMENT, // Potentially sensitive, might need specific config opt-in
      // GeminiPromptType.PERFORMANCE_IMPACT_ASSESSMENT, // Potentially sensitive
    ];

    const analysisPromises = analysisTypes.map(async (type) => {
      const result = await this.geminiAIService.analyzeError(error, type);
      if (result) {
        error.addAIAnalysisResult(result);
      }
    });

    await Promise.allSettled(analysisPromises); // Use allSettled to ensure all analyses run even if one fails
  }

  /**
   * Generates a unique "fingerprint" for an error to help with grouping and rate limiting.
   * This uses a combination of error code, message, and initial stack line.
   * @param {AppError} error - The error to fingerprint.
   * @returns {string} A unique string identifier for the error type.
   */
  private fingerprintError(error: AppError): string {
    const stackSnippet = error.stack
      ? error.stack.split('\n')[1]?.trim() || 'no-stack-line'
      : 'no-stack-available';
    return `${error.code}:${error.message.substring(0, 100)}:${stackSnippet}`;
  }

  /**
   * Checks if an error should be rate-limited based on its fingerprint and severity.
   * @param {string} fingerprint - The unique identifier for the error type.
   * @param {ErrorSeverity} severity - The severity of the error.
   * @returns {boolean} True if the error should be rate-limited.
   */
  private isRateLimited(fingerprint: string, severity: ErrorSeverity): boolean {
    const now = Date.now();
    const entry = this.errorCounts.get(fingerprint);
    const threshold = this.config.errorThresholds?.[severity];

    if (!entry) {
      this.errorCounts.set(fingerprint, { count: 1, lastReported: now });
      return false;
    }

    // Reset count if interval passed
    if (
      this.config.batchReportingIntervalMs &&
      now - entry.lastReported > this.config.batchReportingIntervalMs
    ) {
      entry.count = 1;
      entry.lastReported = now;
      this.errorCounts.set(fingerprint, entry);
      return false;
    }

    entry.count++;
    this.errorCounts.set(fingerprint, entry);

    if (threshold && entry.count > threshold) {
      return true; // Rate limit exceeded
    }

    return false;
  }

  /**
   * Logs the error to the console based on its severity.
   * @param {AppError} error - The error to log.
   */
  private logErrorToConsole(error: AppError): void {
    if (!this.config.debugMode) {
      // In production, only log critical errors to console directly,
      // rely on backend reporting for others.
      if (error.severity === ErrorSeverity.CRITICAL) {
        console.error('[CRITICAL ERROR]', error.toFormattedString(true));
      }
      return;
    }

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error('[APP ERROR]', error.toFormattedString(true));
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[APP WARNING]', error.toFormattedString(true));
        break;
      case ErrorSeverity.LOW:
      case ErrorSeverity.INFO:
        console.info('[APP INFO]', error.toFormattedString());
        break;
      default:
        console.error('[APP ERROR]', error.toFormattedString(true));
    }
  }

  /**
   * Cleans up any active timers.
   */
  public destroy(): void {
    if (this.reportingTimer) {
      clearTimeout(this.reportingTimer);
      this.reportingTimer = null;
    }
    this.flush(); // Send any remaining errors before destroying
  }
}

/**
 * Global Error Handler for capturing unhandled exceptions and rejections.
 */
export class GlobalErrorHandler {
  private reporter: ErrorReporter;
  private config: ErrorManagerConfig;
  private isInitialized: boolean = false;

  constructor(reporter: ErrorReporter, config: ErrorManagerConfig) {
    this.reporter = reporter;
    this.config = config;
  }

  /**
   * Initializes the global error capture mechanisms.
   * Should be called once, typically at application startup.
   */
  public initialize(): void {
    if (this.isInitialized || !this.config.enableGlobalErrorCapture) {
      return;
    }

    // Capture unhandled JavaScript errors
    window.onerror = (message, source, lineno, colno, error) => {
      // Filter out common browser plugin errors or unrelated external scripts
      if (typeof message === 'string' && message.includes('Script error.')) {
        return false; // Suppress reporting for generic "Script error."
      }

      const appError = this.wrapUnhandledError(
        error || new Error(message.toString()),
        AppErrorCode.GENERIC_CLIENT_ERROR,
        ErrorSeverity.HIGH,
        {
          route: window.location.pathname,
          metadata: { source, lineno, colno, originalMessage: message },
        },
        'An unexpected error occurred in the application.',
      );
      this.reporter.report(appError);
      return false; // Prevent default browser error handling (e.g., console logging)
    };

    // Capture unhandled promise rejections
    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      const appError = this.wrapUnhandledError(
        error,
        AppErrorCode.GENERIC_CLIENT_ERROR,
        ErrorSeverity.HIGH,
        {
          route: window.location.pathname,
          metadata: { rejectionReason: String(event.reason) },
        },
        'An asynchronous operation failed unexpectedly.',
      );
      this.reporter.report(appError);
      event.preventDefault(); // Prevent default browser handling
    };

    if (this.config.debugMode) {
      console.log('[GlobalErrorHandler] Initialized global error capture.');
    }
    this.isInitialized = true;
  }

  /**
   * Resets global error handlers. Useful for testing or hot-reloading.
   */
  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }
    window.onerror = null;
    window.onunhandledrejection = null;
    this.isInitialized = false;
    if (this.config.debugMode) {
      console.log('[GlobalErrorHandler] Destroyed global error capture.');
    }
  }

  /**
   * Wraps a raw JavaScript Error into an AppError, providing default context and code.
   * @param {Error} error - The original error.
   * @param {AppErrorCode} code - The AppErrorCode to assign.
   * @param {ErrorSeverity} severity - The severity level.
   * @param {ErrorContext} context - Additional context.
   * @param {string} userFacingMessage - User-friendly message.
   * @returns {AppError} The wrapped AppError instance.
   */
  private wrapUnhandledError(
    error: Error,
    code: AppErrorCode,
    severity: ErrorSeverity,
    context: ErrorContext,
    userFacingMessage: string,
  ): AppError {
    if (error instanceof AppError) {
      // If it's already an AppError, just ensure context is updated
      error.context = { ...error.context, ...context };
      return error;
    }

    // Attempt to parse known HTTP errors from fetch/axios if available
    if ((error as any).response && (error as any).response.status) {
      const status = (error as any).response.status;
      return new NetworkError(
        error.message,
        error,
        {
          ...context,
          response: {
            status: status,
            data: (error as any).response.data,
            statusText: (error as any).response.statusText,
          },
        },
        status,
      );
    }
    // Generic wrapper
    return new AppError(
      error.message,
      code,
      severity,
      ErrorCategory.CLIENT, // Default category for unhandled client errors
      context,
      userFacingMessage,
      false, // These are typically non-operational (programmer errors)
      error,
    );
  }
}

/**
 * Utility functions for error manipulation and information gathering.
 */
export const ErrorUtilities = {
  /**
   * Checks if an object is an instance of AppError.
   * @param {any} error - The object to check.
   * @returns {boolean} True if the object is an AppError.
   */
  isAppError: (error: any): error is AppError => error instanceof AppError,

  /**
   * Converts a raw Error object (or any throwable) into a structured AppError.
   * If the input is already an AppError, it returns it directly.
   * @param {any} error - The raw error or throwable.
   * @param {AppErrorCode} [defaultCode=AppErrorCode.UNKNOWN_ERROR] - Default code if not an AppError.
   * @param {ErrorSeverity} [defaultSeverity=ErrorSeverity.CRITICAL] - Default severity if not an AppError.
   * @param {ErrorContext} [context={}] - Additional context to merge.
   * @param {string} [defaultUserMessage] - Default user-facing message.
   * @returns {AppError} A structured AppError instance.
   */
  toAppError: (
    error: any,
    defaultCode: AppErrorCode = AppErrorCode.UNKNOWN_ERROR,
    defaultSeverity: ErrorSeverity = ErrorSeverity.CRITICAL,
    context: ErrorContext = {},
    defaultUserMessage?: string,
  ): AppError => {
    if (ErrorUtilities.isAppError(error)) {
      // If it's already an AppError, just merge context
      error.context = { ...error.context, ...context };
      return error;
    }

    // Handle generic Error or other throwables
    const message = error instanceof Error ? error.message : String(error);
    const originalError = error instanceof Error ? error : new Error(message);

    return new AppError(
      message,
      defaultCode,
      defaultSeverity,
      ErrorCategory.UNKNOWN,
      context,
      defaultUserMessage,
      false, // Assume non-operational if not explicitly an AppError
      originalError,
    );
  },

  /**
   * Extracts and formats stack trace from an Error object.
   * @param {Error} error - The error object.
   * @returns {string} The formatted stack trace.
   */
  getStackTrace: (error: Error): string => error.stack || 'Stack trace not available.',

  /**
   * Collects basic client-side environment information.
   * @returns {Object} An object containing client environment details.
   */
  collectClientEnvironment: (): { device?: ErrorContext['device']; environment?: ErrorContext['environment'] } => {
    if (typeof window === 'undefined') {
      return {}; // Not a browser environment
    }

    return {
      device: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
      },
      environment: {
        appName: 'YourApplicationName', // Replace with dynamic app name
        appVersion: '1.0.0', // Replace with dynamic app version
        nodeEnv: process.env.NODE_ENV || 'development',
      },
    };
  },

  /**
   * Stringifies an array of error messages.
   * @param {string[]} errors - An array of error strings.
   * @returns {string} A single string with each error message numbered and separated by newlines.
   */
  stringify: (errors: string[]): string =>
    errors?.map((e, i) => `Error ${i + 1} of ${errors?.length}: ${e}`).join('\n') || '',

  /**
   * Displays a user-friendly error message, potentially using a UI notification system.
   * In a real app, this would integrate with a Toast/Notification component.
   * @param {AppError | string} error - The AppError or a simple string message.
   * @param {'toast' | 'modal' | 'console'} [displayType='toast'] - How to display the error.
   */
  displayUserError: (error: AppError | string, displayType: 'toast' | 'modal' | 'console' = 'toast'): void => {
    let message: string;
    let severity: ErrorSeverity = ErrorSeverity.MEDIUM; // Default severity for display

    if (ErrorUtilities.isAppError(error)) {
      message = error.userFacingMessage;
      severity = error.severity;
    } else {
      message = error;
    }

    // In a real application, replace these console logs with actual UI components
    switch (displayType) {
      case 'toast':
        console.error(`[UI Toast | ${severity}]: ${message}`);
        // Example: showToast({ message, severity });
        break;
      case 'modal':
        console.error(`[UI Modal | ${severity}]: ${message}`);
        // Example: showModal({ title: 'Error', content: message, severity });
        break;
      case 'console':
      default:
        console.error(`[UI Console | ${severity}]: ${message}`);
        break;
    }
  },
};

/**
 * Helper to generate a unique correlation ID.
 * @returns {string} A UUID v4 string.
 */
export const generateCorrelationId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

/**
 * Helper to serialize a raw Error object for JSON conversion.
 * Avoids circular references and includes useful properties.
 * @param {Error} error - The error to serialize.
 * @returns {object} A plain object representation of the error.
 */
export const serializeError = (error: Error): object => {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    // Add other custom properties if present in the original error
    ...(Object.keys(error)
      .filter(key => key !== 'name' && key !== 'message' && key !== 'stack')
      .reduce((acc, key) => ({ ...acc, [key]: (error as any)[key] }), {})),
  };
};


/**
 * The main ErrorManager class, orchestrating all error handling capabilities.
 * This is the primary interface for the application to interact with the error system.
 */
export class ErrorManager {
  private static instance: ErrorManager;
  private static _config: ErrorManagerConfig = DEFAULT_ERROR_MANAGER_CONFIG;
  private readonly geminiAIService: GeminiAIService;
  private readonly errorReporter: ErrorReporter;
  private readonly globalErrorHandler: GlobalErrorHandler;

  private constructor(config: ErrorManagerConfig) {
    ErrorManager._config = { ...DEFAULT_ERROR_MANAGER_CONFIG, ...config };
    this.geminiAIService = new GeminiAIService(ErrorManager._config);
    this.errorReporter = new ErrorReporter(ErrorManager._config, this.geminiAIService);
    this.globalErrorHandler = new GlobalErrorHandler(this.errorReporter, ErrorManager._config);

    if (ErrorManager._config.enableGlobalErrorCapture) {
      this.globalErrorHandler.initialize();
    }

    if (ErrorManager._config.debugMode) {
      console.log('[ErrorManager] Initialized with configuration:', ErrorManager._config);
    }
  }

  /**
   * Gets the singleton instance of the ErrorManager.
   * @param {ErrorManagerConfig} [config={}] - Optional configuration to initialize the manager.
   *                                           Only applies if this is the first call to getInstance.
   * @returns {ErrorManager} The singleton instance.
   */
  public static getInstance(config: ErrorManagerConfig = {}): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager(config);
    } else {
      // If config is provided on subsequent calls, it can update dynamic parts
      ErrorManager.updateConfig(config);
    }
    return ErrorManager.instance;
  }

  /**
   * Provides access to the current configuration of the ErrorManager.
   * @returns {ErrorManagerConfig} The current configuration.
   */
  public static get config(): ErrorManagerConfig {
    return ErrorManager._config;
  }

  /**
   * Dynamically updates the configuration of the ErrorManager.
   * This allows changing settings like AI service endpoint or reporting
   * flags without re-initializing the entire manager.
   * @param {Partial<ErrorManagerConfig>} newConfig - Partial new configuration.
   */
  public static updateConfig(newConfig: Partial<ErrorManagerConfig>): void {
    if (!ErrorManager.instance) {
      // If not yet initialized, just merge with default config for next initialization
      ErrorManager._config = { ...DEFAULT_ERROR_MANAGER_CONFIG, ...newConfig };
      return;
    }

    // Apply new config to the instance and its sub-services
    ErrorManager._config = { ...ErrorManager._config, ...newConfig };
    ErrorManager.instance.geminiAIService['config'] = ErrorManager._config; // Update internal config
    ErrorManager.instance.errorReporter['config'] = ErrorManager._config;
    ErrorManager.instance.globalErrorHandler['config'] = ErrorManager._config;

    // Re-initialize global handlers if `enableGlobalErrorCapture` changed
    if (newConfig.enableGlobalErrorCapture !== undefined) {
      if (newConfig.enableGlobalErrorCapture) {
        ErrorManager.instance.globalErrorHandler.initialize();
      } else {
        ErrorManager.instance.globalErrorHandler.destroy();
      }
    }

    // Restart reporting timer if intervals changed or reporting was toggled
    if (newConfig.batchReportingIntervalMs !== undefined || newConfig.reportErrorsToBackend !== undefined) {
      if (ErrorManager._config.reportErrorsToBackend && ErrorManager._config.batchReportingIntervalMs) {
        ErrorManager.instance.errorReporter['startReportingTimer']();
      } else if (ErrorManager.instance.errorReporter['reportingTimer']) {
        clearTimeout(ErrorManager.instance.errorReporter['reportingTimer']);
        ErrorManager.instance.errorReporter['reportingTimer'] = null;
      }
    }

    if (ErrorManager._config.debugMode) {
      console.log('[ErrorManager] Configuration updated:', newConfig);
    }
  }

  /**
   * Reports an error to the system. This is the primary method for applications
   * to log and handle errors. It automatically converts raw errors to `AppError`
   * and dispatches them to the reporter.
   * @param {Error | string | any} error - The error object, string message, or any throwable.
   * @param {ErrorContext} [context={}] - Additional context specific to this error occurrence.
   * @param {AppErrorCode} [code=AppErrorCode.UNKNOWN_ERROR] - A specific error code for categorization.
   * @param {ErrorSeverity} [severity=ErrorSeverity.HIGH] - The severity level.
   * @param {string} [userFacingMessage] - An optional user-friendly message for display.
   * @returns {AppError} The processed AppError object.
   */
  public report(
    error: Error | string | any,
    context: ErrorContext = {},
    code: AppErrorCode = AppErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    userFacingMessage?: string,
  ): AppError {
    const appError = ErrorUtilities.toAppError(error, code, severity, context, userFacingMessage);
    this.errorReporter.report(appError);
    return appError;
  }

  /**
   * Explicitly reports an already constructed AppError instance.
   * @param {AppError} appError - The AppError instance to report.
   */
  public reportAppError(appError: AppError): void {
    this.errorReporter.report(appError);
  }

  /**
   * Logs a message with INFO severity. Useful for tracing non-critical issues.
   * @param {string} message - The informational message.
   * @param {ErrorContext} [context={}] - Context for the info log.
   */
  public info(message: string, context: ErrorContext = {}): void {
    const appError = new AppError(
      message,
      AppErrorCode.UNKNOWN_ERROR, // Or a specific INFO_EVENT_CODE if defined
      ErrorSeverity.INFO,
      ErrorCategory.UNKNOWN,
      context,
      ErrorMessages.GENERIC_INFO,
      true,
    );
    this.errorReporter.report(appError);
  }

  /**
   * Logs a warning message with MEDIUM severity.
   * @param {string} message - The warning message.
   * @param {ErrorContext} [context={}] - Context for the warning.
   */
  public warn(message: string, context: ErrorContext = {}): void {
    const appError = new AppError(
      message,
      AppErrorCode.UNKNOWN_ERROR,
      ErrorSeverity.MEDIUM,
      ErrorCategory.UNKNOWN,
      context,
      ErrorMessages.GENERIC_MEDIUM,
      true,
    );
    this.errorReporter.report(appError);
  }

  /**
   * Gracefully shuts down the ErrorManager, flushing any pending errors and
   * removing global error handlers.
   */
  public async destroy(): Promise<void> {
    if (ErrorManager._config.debugMode) {
      console.log('[ErrorManager] Shutting down...');
    }
    this.globalErrorHandler.destroy();
    this.errorReporter.destroy();
    ErrorManager.instance = undefined as any; // Clear singleton instance
  }

  /**
   * Exposes the utility functions for convenience.
   */
  public static readonly utilities = ErrorUtilities;
}

// Export the initial stringify function as per original code.
// It is now also available through ErrorManager.utilities.stringify
export const stringify = (errors: string[]): string =>
  errors?.map((e, i) => `Error ${i + 1} of ${errors?.length}: ${e}`).join("\n") || '';

// Initialize the ErrorManager singleton on module load with default config.
// Applications can then call ErrorManager.getInstance() and optionally provide
// an updated config, or use ErrorManager.updateConfig() later.
ErrorManager.getInstance();
```