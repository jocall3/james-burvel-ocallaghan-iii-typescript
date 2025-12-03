// This file manages all session-related actions, leveraging advanced analytics,
// security protocols, and artificial intelligence for a robust and secure user experience.

/**
 * @module SessionActions
 * @description Provides a comprehensive suite of functions for managing user sessions,
 * including authentication, authorization, security monitoring, and AI-driven enhancements.
 */

// --- Type Definitions and Interfaces ---

/**
 * Represents the fundamental structure of a session token payload (hypothetical).
 * In a real-world scenario, this would be a JWT or similar.
 */
export interface SessionTokenPayload {
  userId: string;
  sessionId: string;
  email: string;
  roles: string[];
  expiresAt: number; // Unix timestamp
  issuedAt: number; // Unix timestamp
  tenantId?: string;
  authMethod?: string; // e.g., 'password', 'oauth', 'biometric'
  isImpersonated?: boolean;
  impersonatorId?: string;
}

/**
 * Defines a structured session event for logging and AI analysis.
 */
export interface SessionEvent {
  eventId: string;
  sessionId: string;
  userId: string;
  eventType: SessionEventType;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  payload?: Record<string, any>;
  riskScore?: number;
  correlationId?: string; // For linking related events
}

/**
 * Enum for various types of session events.
 */
export enum SessionEventType {
  LoginSuccess = "LOGIN_SUCCESS",
  LoginFailure = "LOGIN_FAILURE",
  LogoutSuccess = "LOGOUT_SUCCESS",
  SessionRefresh = "SESSION_REFRESH",
  PasswordChange = "PASSWORD_CHANGE",
  ProfileUpdate = "PROFILE_UPDATE",
  AccessDenied = "ACCESS_DENIED",
  SensitiveAction = "SENSITIVE_ACTION",
  PotentialFraud = "POTENTIAL_FRAUD",
  IpChangeDetected = "IP_CHANGE_DETECTED",
  DeviceChangeDetected = "DEVICE_CHANGE_DETECTED",
  RateLimitExceeded = "RATE_LIMIT_EXCEEDED",
  AdaptiveChallengeIssued = "ADAPTIVE_CHALLENGE_ISSUED",
  AdaptiveChallengeSuccess = "ADAPTIVE_CHALLENGE_SUCCESS",
  AdaptiveChallengeFailure = "ADAPTIVE_CHALLENGE_FAILURE",
  AISuggestionApplied = "AI_SUGGESTION_APPLIED",
  AIPredictionReport = "AI_PREDICTION_REPORT",
  Heartbeat = "HEARTBEAT", // For active session monitoring
}

/**
 * Defines the risk level associated with a session or event.
 */
export enum SessionRiskLevel {
  None = "NONE",
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Critical = "CRITICAL",
}

/**
 * Interface for the response from session endpoints that redirect.
 */
export interface SessionRedirectResponse {
  url: string;
  message?: string;
}

/**
 * Interface for AI prediction results.
 */
export interface AIPredictionResult {
  riskScore: number;
  riskLevel: SessionRiskLevel;
  anomalies: string[];
  suggestedActions: string[];
  confidence: number; // AI model's confidence in the prediction
  rawPredictionData?: Record<string, any>; // For debugging/detailed analysis
}

/**
 * Interface for AI-driven session lifespan optimization.
 */
export interface SessionLifespanOptimization {
  recommendedExpirySeconds: number;
  reason: string;
  originalExpirySeconds: number;
}

/**
 * Interface for an adaptive authentication challenge initiated by AI.
 */
export interface AdaptiveChallenge {
  challengeId: string;
  challengeType: "MFA_OTP" | "SECURITY_QUESTION" | "BIOMETRIC_REAUTH";
  instructions: string;
  timeoutSeconds: number;
  sessionId: string;
  userId: string;
}

/**
 * Interface for the response when verifying an adaptive challenge.
 */
export interface AdaptiveChallengeVerificationResult {
  success: boolean;
  message: string;
  newSessionToken?: string; // If challenge success grants a new token
  metadata?: Record<string, any>;
}

// --- Constants and Configuration ---

/**
 * Base URL for session-related API endpoints.
 */
const SESSION_API_BASE_URL = "/api/v1/session";
const AUTH_API_BASE_URL = "/api/v1/auth";
const AI_API_BASE_URL = "/api/v1/gemini-ai";

/**
 * Local storage keys for session-related data.
 */
const LOCAL_STORAGE_SESSION_TOKEN_KEY = "current_session_token";
const LOCAL_STORAGE_REFRESH_TOKEN_KEY = "refresh_session_token";
const LOCAL_STORAGE_SESSION_METADATA_KEY = "session_metadata";

/**
 * Default session timeout in milliseconds (e.g., 30 minutes).
 */
const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // Refresh 5 mins before expiry

/**
 * Error messages.
 */
const ERROR_MESSAGES = {
  LOGOUT_FAILED: "Sorry, but we were unable to log you out.",
  SESSION_INVALID: "Your session is invalid or expired. Please log in again.",
  AUTH_CHALLENGE_FAILED: "Authentication challenge failed. Please try again.",
  GENERIC_API_ERROR:
    "An unexpected error occurred. Please try again later.",
  NO_ACTIVE_SESSION: "No active session found.",
};

// --- Custom Error Classes ---

/**
 * Base custom error for session operations.
 */
export class SessionError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(message: string, code: string = "SESSION_ERROR", details?: Record<string, any>) {
    super(message);
    this.name = "SessionError";
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, SessionError.prototype);
  }
}

/**
 * Error specifically for authentication failures.
 */
export class AuthenticationError extends SessionError {
  constructor(message: string = "Authentication failed.", details?: Record<string, any>) {
    super(message, "AUTHENTICATION_FAILED", details);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Error for cases where a session is expired or invalid.
 */
export class SessionExpiredError extends SessionError {
  constructor(message: string = ERROR_MESSAGES.SESSION_INVALID, details?: Record<string, any>) {
    super(message, "SESSION_EXPIRED", details);
    this.name = "SessionExpiredError";
    Object.setPrototypeOf(this, SessionExpiredError.prototype);
  }
}

// --- Utility Functions ---

/**
 * Simple UUID generator for event IDs.
 */
function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Parses a hypothetical JWT-like token to extract payload data.
 * This is a client-side *decode*, not *verify*. Verification happens on the server.
 */
export function parseSessionToken(token: string): SessionTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Invalid token format.");
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    // Basic validation for required fields
    if (payload.userId && payload.sessionId && payload.expiresAt) {
      return payload as SessionTokenPayload;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse session token:", error);
    return null;
  }
}

/**
 * Returns basic client environment data for logging.
 */
function getClientEnvironmentData(): {
  ipAddress: string;
  userAgent: string;
  timestamp: number;
} {
  // In a real application, IP address would be fetched from a server-side API or
  // inferred from the request. For client-side, we can use a placeholder or
  // rely on the backend to provide it.
  const ipAddress = "0.0.0.0"; // Placeholder: client-side JS cannot reliably get public IP directly
  const userAgent = navigator.userAgent;
  const timestamp = Date.now();
  return { ipAddress, userAgent, timestamp };
}

// --- Core API Client ---

/**
 * A centralized fetch wrapper for all API calls, handling common headers and error parsing.
 * @param endpoint The API endpoint path.
 * @param options Fetch API options.
 * @returns A promise that resolves with the JSON response.
 * @throws {SessionError} if the network request fails or the server returns an error.
 */
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = SessionStorageManager.getInstance().get("token");
  const defaultHeaders = {
    "Content-Type": "application/json",
    ... (token && { Authorization: `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (jsonError) {
        // If response is not JSON, use status text
        errorData = { message: response.statusText || ERROR_MESSAGES.GENERIC_API_ERROR };
      }

      const errorMessage = errorData.message || ERROR_MESSAGES.GENERIC_API_ERROR;
      const errorCode = errorData.code || `HTTP_${response.status}`;
      const details = { status: response.status, ...errorData };

      if (response.status === 401 || response.status === 403) {
        throw new AuthenticationError(errorMessage, details);
      }
      throw new SessionError(errorMessage, errorCode, details);
    }

    // Handle 204 No Content for successful operations without a body
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    if (error instanceof SessionError) {
      throw error; // Re-throw custom errors
    }
    throw new SessionError(
      `Network or unexpected error: ${(error as Error).message}`,
      "NETWORK_ERROR"
    );
  }
}

// --- Singleton Manager Classes ---

/**
 * Manages secure client-side session data storage using localStorage.
 * Provides basic encryption for sensitive data.
 * NOTE: Client-side storage is inherently insecure for sensitive data.
 * This encryption is a basic obfuscation, not true security.
 */
export class SessionStorageManager {
  private static instance: SessionStorageManager;
  private readonly storageKeyPrefix = "app_session_"; // Avoids conflicts
  private readonly encryptionKey: string; // Hypothetical, would be derived securely or generated

  private constructor() {
    // Generate a simple key for demonstration. In production, this would be more robust.
    this.encryptionKey = btoa(navigator.userAgent + "some_secret_salt_123");
  }

  public static getInstance(): SessionStorageManager {
    if (!SessionStorageManager.instance) {
      SessionStorageManager.instance = new SessionStorageManager();
    }
    return SessionStorageManager.instance;
  }

  private encrypt(data: string): string {
    // Simple XOR cipher for demo. NOT PRODUCTION SECURE.
    return data
      .split("")
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        )
      )
      .join("");
  }

  private decrypt(encryptedData: string): string {
    // Simple XOR cipher for demo. NOT PRODUCTION SECURE.
    return encryptedData
      .split("")
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
        )
      )
      .join("");
  }

  /**
   * Stores data in localStorage, optionally encrypting it.
   * @param key The key to store the data under.
   * @param value The data to store.
   * @param isSensitive If true, data will be (obfuscated/)encrypted.
   */
  public set(key: string, value: string, isSensitive: boolean = false): void {
    const storeKey = this.storageKeyPrefix + key;
    let dataToStore = value;
    if (isSensitive) {
      dataToStore = this.encrypt(value);
    }
    try {
      localStorage.setItem(storeKey, dataToStore);
    } catch (e) {
      console.error("Failed to set item in local storage:", e);
      // Handle quota exceeded errors etc.
    }
  }

  /**
   * Retrieves data from localStorage, decrypting if marked as sensitive.
   * @param key The key to retrieve data for.
   * @param isSensitive If true, data will be decrypted.
   * @returns The retrieved data or null if not found.
   */
  public get(key: string, isSensitive: boolean = false): string | null {
    const storeKey = this.storageKeyPrefix + key;
    try {
      const storedData = localStorage.getItem(storeKey);
      if (storedData === null) {
        return null;
      }
      return isSensitive ? this.decrypt(storedData) : storedData;
    } catch (e) {
      console.error("Failed to get item from local storage:", e);
      return null;
    }
  }

  /**
   * Removes data from localStorage.
   * @param key The key of the data to remove.
   */
  public remove(key: string): void {
    const storeKey = this.storageKeyPrefix + key;
    try {
      localStorage.removeItem(storeKey);
    } catch (e) {
      console.error("Failed to remove item from local storage:", e);
    }
  }

  /**
   * Clears all session-related data from localStorage.
   */
  public clearAllSessionData(): void {
    this.remove("token");
    this.remove("refreshToken");
    this.remove("sessionMetadata");
    // Iterate and remove all prefixed keys if necessary, or just specific ones
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.storageKeyPrefix)) {
        localStorage.removeItem(key);
      }
    });
    console.log("All session data cleared from local storage.");
  }
}

/**
 * Manages logging of session-related events.
 */
export class SessionEventLogger {
  private static instance: SessionEventLogger;
  private eventQueue: SessionEvent[] = [];
  private isProcessingQueue: boolean = false;
  private readonly batchSize = 10; // Send events in batches
  private readonly debounceTime = 2000; // 2 seconds debounce for sending
  private debounceTimer: number | null = null;

  private constructor() {}

  public static getInstance(): SessionEventLogger {
    if (!SessionEventLogger.instance) {
      SessionEventLogger.instance = new SessionEventLogger();
    }
    return SessionEventLogger.instance;
  }

  /**
   * Logs a structured session event.
   * @param event The session event object.
   */
  public async logEvent(event: SessionEvent): Promise<void> {
    this.eventQueue.push(event);
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => this.processEventQueue(), this.debounceTime);
  }

  /**
   * Processes the event queue, sending events in batches to the backend.
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      return;
    }
    this.isProcessingQueue = true;

    while (this.eventQueue.length > 0) {
      const eventsToSend = this.eventQueue.splice(0, this.batchSize);
      if (eventsToSend.length === 0) break;

      console.log(`Sending ${eventsToSend.length} session events to backend...`, eventsToSend);
      try {
        await apiClient(`${SESSION_API_BASE_URL}/log-events`, {
          method: "POST",
          body: JSON.stringify(eventsToSend),
        });
        console.log("Session events sent successfully.");
      } catch (error) {
        console.error("Failed to send session events:", error);
        // Re-add events to queue for retry, or log to persistent storage
        this.eventQueue.unshift(...eventsToSend);
        break; // Stop processing to prevent endless retries on transient errors
      }
    }
    this.isProcessingQueue = false;
  }

  /**
   * Creates and logs a specific session event type.
   * @param eventType The type of event.
   * @param payload Optional additional data.
   * @param correlationId Optional ID to link related events.
   */
  public async createAndLog(
    eventType: SessionEventType,
    payload?: Record<string, any>,
    correlationId?: string
  ): Promise<void> {
    const currentSessionId = SessionManager.getInstance().getCurrentSessionId();
    const currentUserId = SessionManager.getInstance().getCurrentUserId();
    const { ipAddress, userAgent, timestamp } = getClientEnvironmentData();

    if (!currentSessionId || !currentUserId) {
      console.warn("Cannot log event: No active session or user ID.");
      // For some events (like login failure), session/user ID might not be available yet.
      // Log with nulls and let backend handle correlation.
    }

    const event: SessionEvent = {
      eventId: generateUuid(),
      sessionId: currentSessionId || "N/A_NO_SESSION",
      userId: currentUserId || "N/A_NO_USER",
      eventType,
      timestamp,
      ipAddress,
      userAgent,
      payload,
      correlationId,
    };
    await this.logEvent(event);
  }
}

/**
 * Manages security aspects of the user session.
 */
export class SessionSecurityManager {
  private static instance: SessionSecurityManager;
  private lastKnownIp: string | null = null;
  private lastKnownDevice: string | null = null; // User agent hash or device ID

  private constructor() {
    this.initializeSecurityParameters();
  }

  public static getInstance(): SessionSecurityManager {
    if (!SessionSecurityManager.instance) {
      SessionSecurityManager.instance = new SessionSecurityManager();
    }
    return SessionSecurityManager.instance;
  }

  /**
   * Initializes or refreshes client-side security parameters from the current session.
   */
  public initializeSecurityParameters(): void {
    // In a real app, IP would come from the server-side during login/session refresh
    // For client-side simulation, we'll use placeholder or last known.
    this.lastKnownIp = SessionStorageManager.getInstance().get("lastIp") || "0.0.0.0";
    this.lastKnownDevice = SessionStorageManager.getInstance().get("lastDeviceHash") || null;

    if (!this.lastKnownDevice) {
      this.lastKnownDevice = btoa(navigator.userAgent + navigator.platform); // Simple device hash
      SessionStorageManager.getInstance().set("lastDeviceHash", this.lastKnownDevice);
    }
  }

  /**
   * Tracks and detects changes in IP address during a session.
   * @param currentIp The current IP address (should be server-verified).
   * @returns True if IP changed, false otherwise.
   */
  public async trackIpChanges(currentIp: string): Promise<boolean> {
    if (!this.lastKnownIp || this.lastKnownIp === "0.0.0.0") {
      this.lastKnownIp = currentIp;
      SessionStorageManager.getInstance().set("lastIp", currentIp);
      return false;
    }

    if (this.lastKnownIp !== currentIp) {
      await SessionEventLogger.getInstance().createAndLog(SessionEventType.IpChangeDetected, {
        oldIp: this.lastKnownIp,
        newIp: currentIp,
      }, SessionManager.getInstance().getCurrentSessionId());
      this.lastKnownIp = currentIp;
      SessionStorageManager.getInstance().set("lastIp", currentIp);
      // Trigger AI prediction for increased risk
      GeminiAISessionPredictor.getInstance().predictSessionRisk(
        SessionManager.getInstance().getCurrentSessionId() || ""
      );
      SessionNotificationService.getInstance().sendSecurityAlert(
        SessionManager.getInstance().getCurrentSessionId() || "",
        "Your IP address has changed. If this was not you, please secure your account."
      );
      return true;
    }
    return false;
  }

  /**
   * Tracks and detects changes in user device (via user agent).
   * @param currentUserAgent The current user agent string.
   * @returns True if device changed, false otherwise.
   */
  public async trackDeviceChanges(currentUserAgent: string): Promise<boolean> {
    const currentDeviceHash = btoa(currentUserAgent + navigator.platform);

    if (!this.lastKnownDevice) {
      this.lastKnownDevice = currentDeviceHash;
      SessionStorageManager.getInstance().set("lastDeviceHash", this.lastKnownDevice);
      return false;
    }

    if (this.lastKnownDevice !== currentDeviceHash) {
      await SessionEventLogger.getInstance().createAndLog(
        SessionEventType.DeviceChangeDetected,
        {
          oldDeviceHash: this.lastKnownDevice,
          newDeviceHash: currentDeviceHash,
          oldUserAgent: SessionStorageManager.getInstance().get("lastUserAgent"),
          newUserAgent: currentUserAgent,
        },
        SessionManager.getInstance().getCurrentSessionId()
      );
      this.lastKnownDevice = currentDeviceHash;
      SessionStorageManager.getInstance().set("lastDeviceHash", this.lastKnownDevice);
      SessionStorageManager.getInstance().set("lastUserAgent", currentUserAgent);

      // Trigger AI prediction for increased risk
      GeminiAISessionPredictor.getInstance().predictSessionRisk(
        SessionManager.getInstance().getCurrentSessionId() || ""
      );
      SessionNotificationService.getInstance().sendSecurityAlert(
        SessionManager.getInstance().getCurrentSessionId() || "",
        "A new device has accessed your account. If this was not you, please secure your account."
      );
      return true;
    }
    return false;
  }

  /**
   * Placeholder for client-side rate limiting.
   * In a real scenario, this would involve a robust server-side implementation.
   * @param action The action being performed (e.g., 'login', 'api_call').
   * @returns True if allowed, false if rate-limited.
   */
  public async applyClientRateLimiting(action: string): Promise<boolean> {
    const rateLimitMapKey = `rate_limit_${action}`;
    const rateLimitInfo = JSON.parse(
      SessionStorageManager.getInstance().get(rateLimitMapKey) || "{}"
    );

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 5; // Max 5 requests per minute

    // Filter out requests older than the window
    const recentRequests = (rateLimitInfo.timestamps || []).filter(
      (ts: number) => now - ts < windowMs
    );
    recentRequests.push(now);

    SessionStorageManager.getInstance().set(
      rateLimitMapKey,
      JSON.stringify({ timestamps: recentRequests })
    );

    if (recentRequests.length > maxRequests) {
      await SessionEventLogger.getInstance().createAndLog(SessionEventType.RateLimitExceeded, {
        action,
        count: recentRequests.length,
      }, SessionManager.getInstance().getCurrentSessionId());
      SessionNotificationService.getInstance().displayTemporaryMessage(
        "Too many requests. Please wait and try again.",
        "error"
      );
      return false; // Rate-limited
    }
    return true; // Allowed
  }
}

/**
 * Service for sending user-facing notifications related to session activities.
 */
export class SessionNotificationService {
  private static instance: SessionNotificationService;

  private constructor() {}

  public static getInstance(): SessionNotificationService {
    if (!SessionNotificationService.instance) {
      SessionNotificationService.instance = new SessionNotificationService();
    }
    return SessionNotificationService.instance;
  }

  /**
   * Displays a temporary, toast-like message to the user.
   * In a real app, this would integrate with a UI notification library.
   * @param message The message to display.
   * @param type The type of message (e.g., 'info', 'warning', 'error', 'success').
   */
  public displayTemporaryMessage(message: string, type: "info" | "warning" | "error" | "success" = "info"): void {
    console.log(`[Notification ${type.toUpperCase()}]: ${message}`);
    // Placeholder for actual UI notification logic (e.g., using a toast library)
    // Example: alert(message); or custom DOM manipulation
    // For this example, we'll use `alert` for critical messages and `console.log` for others.
    if (type === "error" || type === "warning") {
        alert(`${type.toUpperCase()}: ${message}`);
    }
  }

  /**
   * Sends a security alert to the user.
   * @param sessionId The ID of the session experiencing the alert.
   * @param message The security alert message.
   */
  public sendSecurityAlert(sessionId: string, message: string): void {
    this.displayTemporaryMessage(`SECURITY ALERT: ${message}`, "error");
    // Also, trigger backend notification (email, push notification)
    apiClient(`${SESSION_API_BASE_URL}/notify-security-alert`, {
      method: "POST",
      body: JSON.stringify({ sessionId, message, type: "security_alert" }),
    }).catch((e) => console.error("Failed to send backend security notification:", e));
  }

  /**
   * Sends a session expiry warning to the user.
   * @param sessionId The ID of the session.
   * @param timeRemaining The remaining time until expiry in minutes.
   */
  public sendSessionExpiryWarning(sessionId: string, timeRemaining: number): void {
    this.displayTemporaryMessage(
      `Your session will expire in ${timeRemaining} minutes. Please refresh or log out.`,
      "warning"
    );
    // Optionally log this event
    SessionEventLogger.getInstance().createAndLog(SessionEventType.Heartbeat, {
      message: "Session expiry warning issued",
      timeRemaining,
    });
  }

  /**
   * Sends a general session-related information message.
   * @param sessionId The ID of the session.
   * @param message The informational message.
   */
  public sendSessionInfo(sessionId: string, message: string): void {
    this.displayTemporaryMessage(`INFO: ${message}`, "info");
  }
}

/**
 * Manages all interactions with hypothetical Gemini AI services for session enhancement.
 */
export class GeminiAISessionPredictor {
  private static instance: GeminiAISessionPredictor;
  private lastPrediction: AIPredictionResult | null = null;
  private readonly predictionCacheDurationMs = 5 * 60 * 1000; // Cache predictions for 5 minutes

  private constructor() {}

  public static getInstance(): GeminiAISessionPredictor {
    if (!GeminiAISessionPredictor.instance) {
      GeminiAISessionPredictor.instance = new GeminiAISessionPredictor();
    }
    return GeminiAISessionPredictor.instance;
  }

  /**
   * Sends user interaction data to Gemini AI for behavioral analysis.
   * This would typically happen continuously in the background.
   * @param sessionId The current session ID.
   * @param eventData Specific user interaction data (e.g., clicks, page views, form submissions).
   */
  public async analyzeUserBehavior(
    sessionId: string,
    eventData: Record<string, any>
  ): Promise<void> {
    if (!sessionId) {
      console.warn("Cannot analyze user behavior: No active session ID.");
      return;
    }
    console.log(`Sending behavior data for session ${sessionId} to Gemini AI...`, eventData);
    try {
      await apiClient(`${AI_API_BASE_URL}/behavioral-analysis`, {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          userId: SessionManager.getInstance().getCurrentUserId(),
          timestamp: Date.now(),
          eventData: {
            ...eventData,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
          },
        }),
      });
      console.log("Behavioral data sent to Gemini AI successfully.");
    } catch (error) {
      console.error("Failed to send behavioral data to Gemini AI:", error);
      SessionEventLogger.getInstance().createAndLog(
        SessionEventType.AccessDenied, // or a specific AI logging failure event
        { aiService: "behavioral-analysis", error: (error as Error).message },
        sessionId
      );
    }
  }

  /**
   * Uses Gemini AI to assess the real-time risk of a given session.
   * Caches results to prevent excessive API calls.
   * @param sessionId The current session ID.
   * @returns A promise resolving to an AIPredictionResult.
   */
  public async predictSessionRisk(sessionId: string): Promise<AIPredictionResult> {
    if (!sessionId) {
      console.error("Cannot predict session risk: No active session ID.");
      throw new SessionError("No active session for risk prediction.");
    }

    // Basic caching mechanism
    if (
      this.lastPrediction &&
      this.lastPrediction.rawPredictionData?.sessionId === sessionId &&
      Date.now() - (this.lastPrediction.rawPredictionData?.timestamp || 0) <
        this.predictionCacheDurationMs
    ) {
      console.log("Returning cached AI risk prediction.");
      return this.lastPrediction;
    }

    console.log(`Requesting session risk prediction for session ${sessionId} from Gemini AI...`);
    try {
      const result = await apiClient<AIPredictionResult>(`${AI_API_BASE_URL}/predict-risk`, {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          userId: SessionManager.getInstance().getCurrentUserId(),
          currentContext: {
            ip: SessionSecurityManager.getInstance().lastKnownIp,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          },
        }),
      });

      this.lastPrediction = { ...result, rawPredictionData: { ...result.rawPredictionData, sessionId, timestamp: Date.now() } };
      console.log(`Gemini AI risk prediction for session ${sessionId}:`, result);

      await SessionEventLogger.getInstance().createAndLog(SessionEventType.AIPredictionReport, {
        prediction: result,
      }, sessionId);

      if (result.riskLevel === SessionRiskLevel.High || result.riskLevel === SessionRiskLevel.Critical) {
          SessionNotificationService.getInstance().sendSecurityAlert(sessionId, `High risk detected for your session. Reason: ${result.anomalies.join(', ')}. Initiating adaptive challenge.`);
          // Trigger adaptive challenge
          GeminiAIAuthChallenge.getInstance().initiateAdaptiveChallenge(sessionId, result.riskScore);
      } else if (result.riskLevel === SessionRiskLevel.Medium) {
          SessionNotificationService.getInstance().displayTemporaryMessage(`Medium risk detected for your session. Consider reviewing recent activity.`, "warning");
      }

      return result;
    } catch (error) {
      console.error("Failed to get session risk prediction from Gemini AI:", error);
      // Fallback to default low risk or re-throw
      await SessionEventLogger.getInstance().createAndLog(
        SessionEventType.AccessDenied, // AI service failure
        { aiService: "predict-risk", error: (error as Error).message },
        sessionId
      );
      throw new SessionError("Failed to get AI risk prediction.");
    }
  }

  /**
   * Asks Gemini AI to suggest personalized actions for the user based on their session behavior.
   * @param sessionId The current session ID.
   * @returns A promise resolving to an array of suggested actions.
   */
  public async suggestPersonalizedActions(sessionId: string): Promise<string[]> {
    if (!sessionId) {
      console.warn("Cannot suggest personalized actions: No active session ID.");
      return [];
    }
    console.log(`Requesting personalized actions for session ${sessionId} from Gemini AI...`);
    try {
      const result = await apiClient<{ suggestions: string[] }>(
        `${AI_API_BASE_URL}/suggest-actions`,
        {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            userId: SessionManager.getInstance().getCurrentUserId(),
          }),
        }
      );
      console.log(`Gemini AI personalized actions for session ${sessionId}:`, result.suggestions);
      return result.suggestions;
    } catch (error) {
      console.error("Failed to get personalized actions from Gemini AI:", error);
      return [];
    }
  }

  /**
   * Uses Gemini AI to dynamically optimize the session lifespan based on user behavior and risk.
   * @param sessionId The current session ID.
   * @param currentExpirySeconds The current session expiry time in seconds.
   * @returns A promise resolving to SessionLifespanOptimization.
   */
  public async optimizeSessionLifespan(
    sessionId: string,
    currentExpirySeconds: number
  ): Promise<SessionLifespanOptimization> {
    if (!sessionId) {
      console.warn("Cannot optimize session lifespan: No active session ID.");
      throw new SessionError("No active session for lifespan optimization.");
    }
    console.log(`Requesting session lifespan optimization for session ${sessionId} from Gemini AI...`);
    try {
      const result = await apiClient<SessionLifespanOptimization>(
        `${AI_API_BASE_URL}/optimize-lifespan`,
        {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            userId: SessionManager.getInstance().getCurrentUserId(),
            currentExpirySeconds,
            riskScore: this.lastPrediction?.riskScore || 0, // Pass latest risk score
            behavioralContext: "detailed_behavior_profile_from_backend", // AI will use server-side data
          }),
        }
      );
      console.log(`Gemini AI optimized session lifespan for session ${sessionId}:`, result);
      return result;
    } catch (error) {
      console.error("Failed to optimize session lifespan with Gemini AI:", error);
      // Fallback to original expiry or a default.
      return {
        recommendedExpirySeconds: currentExpirySeconds,
        reason: "AI optimization unavailable, using default.",
        originalExpirySeconds: currentExpirySeconds,
      };
    }
  }

  /**
   * Requests Gemini AI to generate a detailed anomaly report for a session.
   * @param sessionId The session ID.
   * @returns A promise resolving to a detailed anomaly report string or object.
   */
  public async generateAnomalyReport(sessionId: string): Promise<string> {
    if (!sessionId) {
      console.warn("Cannot generate anomaly report: No active session ID.");
      return "No session ID provided.";
    }
    console.log(`Requesting anomaly report for session ${sessionId} from Gemini AI...`);
    try {
      const report = await apiClient<string>(`${AI_API_BASE_URL}/anomaly-report`, {
        method: "POST",
        body: JSON.stringify({ sessionId, userId: SessionManager.getInstance().getCurrentUserId() }),
      });
      console.log(`Gemini AI anomaly report for session ${sessionId}:`, report);
      return report;
    } catch (error) {
      console.error("Failed to generate anomaly report from Gemini AI:", error);
      return "Failed to generate anomaly report.";
    }
  }
}

/**
 * Handles AI-driven adaptive authentication challenges.
 */
export class GeminiAIAuthChallenge {
  private static instance: GeminiAIAuthChallenge;

  private constructor() {}

  public static getInstance(): GeminiAIAuthChallenge {
    if (!GeminiAIAuthChallenge.instance) {
      GeminiAIAuthChallenge.instance = new GeminiAIAuthChallenge();
    }
    return GeminiAIAuthChallenge.instance;
  }

  /**
   * Initiates an adaptive authentication challenge based on session risk.
   * @param sessionId The current session ID.
   * @param riskScore The risk score determined by AI.
   * @returns A promise resolving to the AdaptiveChallenge object.
   */
  public async initiateAdaptiveChallenge(
    sessionId: string,
    riskScore: number
  ): Promise<AdaptiveChallenge> {
    if (!sessionId) {
      throw new SessionError("No active session to initiate challenge.");
    }
    console.log(
      `Initiating adaptive challenge for session ${sessionId} with risk score ${riskScore}...`
    );
    try {
      const challenge = await apiClient<AdaptiveChallenge>(
        `${AI_API_BASE_URL}/initiate-challenge`,
        {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            userId: SessionManager.getInstance().getCurrentUserId(),
            riskScore,
            currentContext: { ip: SessionSecurityManager.getInstance().lastKnownIp },
          }),
        }
      );
      console.log("Adaptive challenge initiated:", challenge);
      SessionEventLogger.getInstance().createAndLog(SessionEventType.AdaptiveChallengeIssued, {
        challengeType: challenge.challengeType,
        riskScore,
      }, sessionId);
      SessionNotificationService.getInstance().displayTemporaryMessage(
        challenge.instructions,
        "warning"
      );
      return challenge;
    } catch (error) {
      console.error("Failed to initiate adaptive challenge:", error);
      SessionEventLogger.getInstance().createAndLog(
        SessionEventType.AdaptiveChallengeIssued,
        { status: "failed", error: (error as Error).message, riskScore },
        sessionId
      );
      throw new SessionError(
        `Failed to initiate adaptive challenge: ${(error as Error).message}`
      );
    }
  }

  /**
   * Verifies the user's response to an adaptive challenge.
   * @param challengeId The ID of the challenge.
   * @param challengeResponse The user's response (e.g., OTP, security answer).
   * @returns A promise resolving to AdaptiveChallengeVerificationResult.
   */
  public async verifyAdaptiveChallenge(
    challengeId: string,
    challengeResponse: string
  ): Promise<AdaptiveChallengeVerificationResult> {
    const sessionId = SessionManager.getInstance().getCurrentSessionId();
    if (!sessionId) {
      throw new SessionError("No active session to verify challenge.");
    }
    console.log(`Verifying adaptive challenge ${challengeId} for session ${sessionId}...`);
    try {
      const result = await apiClient<AdaptiveChallengeVerificationResult>(
        `${AI_API_BASE_URL}/verify-challenge`,
        {
          method: "POST",
          body: JSON.stringify({ challengeId, challengeResponse, sessionId }),
        }
      );
      console.log("Adaptive challenge verification result:", result);

      if (result.success) {
        SessionEventLogger.getInstance().createAndLog(
          SessionEventType.AdaptiveChallengeSuccess,
          { challengeId },
          sessionId
        );
        SessionNotificationService.getInstance().displayTemporaryMessage(
          "Challenge successful! Your session is now fully active.",
          "success"
        );
        if (result.newSessionToken) {
            SessionManager.getInstance().updateSessionToken(result.newSessionToken);
        }
      } else {
        SessionEventLogger.getInstance().createAndLog(
          SessionEventType.AdaptiveChallengeFailure,
          { challengeId, message: result.message },
          sessionId
        );
        SessionNotificationService.getInstance().displayTemporaryMessage(
          result.message || ERROR_MESSAGES.AUTH_CHALLENGE_FAILED,
          "error"
        );
        throw new AuthenticationError(result.message || ERROR_MESSAGES.AUTH_CHALLENGE_FAILED);
      }
      return result;
    } catch (error) {
      console.error("Failed to verify adaptive challenge:", error);
      SessionEventLogger.getInstance().createAndLog(
        SessionEventType.AdaptiveChallengeFailure,
        { challengeId, error: (error as Error).message },
        sessionId
      );
      if (error instanceof SessionError) throw error;
      throw new SessionError(`Failed to verify challenge: ${(error as Error).message}`);
    }
  }
}

/**
 * The main session manager coordinating all session-related operations.
 */
export class SessionManager {
  private static instance: SessionManager;
  private currentSessionToken: string | null = null;
  private currentRefreshToken: string | null = null;
  private sessionCheckInterval: number | null = null;
  private sessionHeartbeatInterval: number | null = null;

  private constructor() {
    this.loadInitialSessionState();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Loads the session token and refresh token from storage on initialization.
   */
  private loadInitialSessionState(): void {
    this.currentSessionToken = SessionStorageManager.getInstance().get(
      LOCAL_STORAGE_SESSION_TOKEN_KEY,
      true
    );
    this.currentRefreshToken = SessionStorageManager.getInstance().get(
      LOCAL_STORAGE_REFRESH_TOKEN_KEY,
      true
    );

    if (this.currentSessionToken) {
      console.log("Existing session token loaded.");
      this.startSessionMonitoring();
      SessionSecurityManager.getInstance().initializeSecurityParameters();
    } else {
      console.log("No active session token found on startup.");
    }
  }

  /**
   * Sets the session token and refresh token, storing them securely.
   * @param sessionToken The new session token.
   * @param refreshToken The new refresh token.
   * @param shouldStartMonitoring Whether to start session monitoring (e.g., after login).
   */
  public async setSession(sessionToken: string, refreshToken: string, shouldStartMonitoring: boolean = true): Promise<void> {
    this.currentSessionToken = sessionToken;
    this.currentRefreshToken = refreshToken;
    SessionStorageManager.getInstance().set(LOCAL_STORAGE_SESSION_TOKEN_KEY, sessionToken, true);
    SessionStorageManager.getInstance().set(LOCAL_STORAGE_REFRESH_TOKEN_KEY, refreshToken, true);

    const tokenPayload = parseSessionToken(sessionToken);
    if (tokenPayload) {
      SessionStorageManager.getInstance().set(
        LOCAL_STORAGE_SESSION_METADATA_KEY,
        JSON.stringify({ userId: tokenPayload.userId, sessionId: tokenPayload.sessionId }),
        true
      );
      await SessionEventLogger.getInstance().createAndLog(SessionEventType.LoginSuccess, {
        userId: tokenPayload.userId,
        sessionId: tokenPayload.sessionId,
      });
      SessionNotificationService.getInstance().sendSessionInfo(tokenPayload.sessionId, "Welcome back!");
    }

    SessionSecurityManager.getInstance().initializeSecurityParameters(); // Re-initialize security params with new session
    if (shouldStartMonitoring) {
        this.startSessionMonitoring();
    }
    console.log("Session token and refresh token set.");
  }

  /**
   * Updates only the session token (e.g., after a refresh).
   * @param newSessionToken The new session token.
   */
  public async updateSessionToken(newSessionToken: string): Promise<void> {
    this.currentSessionToken = newSessionToken;
    SessionStorageManager.getInstance().set(LOCAL_STORAGE_SESSION_TOKEN_KEY, newSessionToken, true);
    const tokenPayload = parseSessionToken(newSessionToken);
    if (tokenPayload) {
        SessionStorageManager.getInstance().set(
            LOCAL_STORAGE_SESSION_METADATA_KEY,
            JSON.stringify({ userId: tokenPayload.userId, sessionId: tokenPayload.sessionId }),
            true
        );
        await SessionEventLogger.getInstance().createAndLog(SessionEventType.SessionRefresh, {
            userId: tokenPayload.userId,
            sessionId: tokenPayload.sessionId,
            reason: "Token updated after challenge"
        });
    }
    console.log("Session token updated.");
  }


  /**
   * Retrieves the current session token.
   */
  public getCurrentSessionToken(): string | null {
    return this.currentSessionToken;
  }

  /**
   * Retrieves the current session ID from the token payload.
   */
  public getCurrentSessionId(): string | null {
    if (!this.currentSessionToken) return null;
    const payload = parseSessionToken(this.currentSessionToken);
    return payload ? payload.sessionId : null;
  }

  /**
   * Retrieves the current user ID from the token payload.
   */
  public getCurrentUserId(): string | null {
    if (!this.currentSessionToken) return null;
    const payload = parseSessionToken(this.currentSessionToken);
    return payload ? payload.userId : null;
  }

  /**
   * Checks if the user is currently authenticated and session is valid.
   */
  public isAuthenticated(): boolean {
    if (!this.currentSessionToken) {
      return false;
    }
    const payload = parseSessionToken(this.currentSessionToken);
    if (!payload || payload.expiresAt * 1000 <= Date.now()) {
      console.log("Session token expired or invalid.");
      this.clearSession(); // Clean up expired session data
      return false;
    }
    return true;
  }

  /**
   * Initiates periodic session monitoring tasks.
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
    this.sessionCheckInterval = window.setInterval(
      () => this.performSessionHealthCheck(),
      DEFAULT_SESSION_TIMEOUT_MS / 3 // Check every 10 minutes if timeout is 30
    );

    if (this.sessionHeartbeatInterval) {
        clearInterval(this.sessionHeartbeatInterval);
    }
    this.sessionHeartbeatInterval = window.setInterval(
        () => this.sendSessionHeartbeat(),
        1 * 60 * 1000 // Send heartbeat every 1 minute
    );

    console.log("Session monitoring started.");
  }

  /**
   * Stops all periodic session monitoring tasks.
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    if (this.sessionHeartbeatInterval) {
        clearInterval(this.sessionHeartbeatInterval);
        this.sessionHeartbeatInterval = null;
    }
    console.log("Session monitoring stopped.");
  }

  /**
   * Performs a comprehensive health check of the current session.
   */
  public async performSessionHealthCheck(): Promise<void> {
    console.log("Performing session health check...");
    if (!this.isAuthenticated()) {
      SessionNotificationService.getInstance().displayTemporaryMessage(
        ERROR_MESSAGES.SESSION_INVALID,
        "error"
      );
      await this.initiateLogoutFlow(SessionEventType.SessionExpired);
      return;
    }

    const payload = parseSessionToken(this.currentSessionToken!);
    if (payload) {
      const expiresInMs = payload.expiresAt * 1000 - Date.now();
      if (expiresInMs < SESSION_REFRESH_THRESHOLD_MS) {
        console.log("Session nearing expiry, attempting to refresh.");
        try {
          await this.refreshSession();
          SessionNotificationService.getInstance().sendSessionInfo(payload.sessionId, "Session refreshed.");
        } catch (error) {
          console.warn("Failed to refresh session during health check:", error);
          SessionNotificationService.getInstance().displayTemporaryMessage(
            "Could not refresh session. Please log in again.",
            "warning"
          );
          await this.initiateLogoutFlow(SessionEventType.SessionExpired);
        }
      } else if (expiresInMs < DEFAULT_SESSION_TIMEOUT_MS / 6 && expiresInMs > SESSION_REFRESH_THRESHOLD_MS) {
          // Give a warning if it's not time to refresh yet but getting close
          const minutesRemaining = Math.ceil(expiresInMs / (60 * 1000));
          SessionNotificationService.getInstance().sendSessionExpiryWarning(payload.sessionId, minutesRemaining);
      }
    }

    // AI-driven risk assessment
    const sessionId = this.getCurrentSessionId();
    if (sessionId) {
      try {
        await GeminiAISessionPredictor.getInstance().predictSessionRisk(sessionId);
      } catch (e) {
        console.warn("AI risk prediction failed:", e);
      }
    }
  }

  /**
   * Sends a session heartbeat event for active monitoring and AI analysis.
   */
  private async sendSessionHeartbeat(): Promise<void> {
    const sessionId = this.getCurrentSessionId();
    if (sessionId) {
        try {
            await SessionEventLogger.getInstance().createAndLog(SessionEventType.Heartbeat, {
                status: "active",
                time: Date.now(),
            }, sessionId);
            // Also trigger passive behavior analysis
            GeminiAISessionPredictor.getInstance().analyzeUserBehavior(sessionId, {
                eventType: "heartbeat",
                currentUrl: window.location.href,
            });
        } catch (e) {
            console.error("Failed to send session heartbeat:", e);
        }
    }
  }

  /**
   * Requests a new session token using the refresh token.
   * @returns A promise that resolves when the session is refreshed.
   * @throws {AuthenticationError} if refresh token is invalid or expired.
   */
  public async refreshSession(): Promise<void> {
    if (!this.currentRefreshToken) {
      console.warn("No refresh token available. Cannot refresh session.");
      throw new AuthenticationError("No refresh token available.");
    }

    try {
      console.log("Attempting to refresh session token...");
      const response = await apiClient<{ sessionToken: string; refreshToken: string }>(
        `${AUTH_API_BASE_URL}/refresh-token`,
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: this.currentRefreshToken }),
        }
      );

      await this.setSession(response.sessionToken, response.refreshToken, false); // Don't restart monitoring, just update token
      console.log("Session successfully refreshed.");
      const currentSessionId = this.getCurrentSessionId();
      if (currentSessionId) {
        await SessionEventLogger.getInstance().createAndLog(SessionEventType.SessionRefresh, {}, currentSessionId);
        // Ask AI to optimize new session lifespan
        const payload = parseSessionToken(this.currentSessionToken!);
        if (payload) {
            const optimized = await GeminiAISessionPredictor.getInstance().optimizeSessionLifespan(
                currentSessionId,
                (payload.expiresAt - payload.issuedAt)
            );
            // In a real app, the server would adjust expiry based on AI recommendation
            // Here, we just log the recommendation.
            console.log("AI recommended session lifespan:", optimized);
            SessionNotificationService.getInstance().sendSessionInfo(currentSessionId, `Session lifespan adjusted based on AI analysis.`);
        }
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      this.clearSession();
      throw new AuthenticationError("Failed to refresh session.", { originalError: error });
    }
  }

  /**
   * Clears all client-side session data and stops monitoring.
   */
  public clearSession(): void {
    this.currentSessionToken = null;
    this.currentRefreshToken = null;
    SessionStorageManager.getInstance().clearAllSessionData();
    this.stopSessionMonitoring();
    console.log("Client-side session data cleared.");
  }

  /**
   * Initiates a full logout flow, clearing session data and redirecting.
   * @param logoutEventType The event type for logging the logout (e.g., normal, expired).
   */
  public async initiateLogoutFlow(logoutEventType: SessionEventType = SessionEventType.LogoutSuccess): Promise<void> {
    const sessionId = this.getCurrentSessionId();
    this.clearSession(); // Clear client-side data immediately

    if (sessionId) {
      await SessionEventLogger.getInstance().createAndLog(logoutEventType, {}, sessionId);
    }

    try {
      console.log("Initiating server-side logout...");
      const response = await apiClient<SessionRedirectResponse>(`${SESSION_API_BASE_URL}/logout`, {
        method: "DELETE",
      });
      console.log("Server-side logout successful. Redirecting...");
      window.location.href = response.url;
    } catch (error) {
      console.error("Server-side logout failed:", error);
      SessionNotificationService.getInstance().displayTemporaryMessage(
        ERROR_MESSAGES.LOGOUT_FAILED,
        "error"
      );
      // Even if server logout fails, clear client state and redirect as a fallback
      if (sessionId) {
        await SessionEventLogger.getInstance().createAndLog(SessionEventType.LogoutSuccess, { status: "client_only", error: (error as Error).message }, sessionId);
      }
      // Attempt a client-side redirect to a default logged-out page if server didn't provide one
      window.location.href = "/logged-out"; // Or some default public page
    }
  }

  /**
   * Initiates a specific logout flow for the signup process.
   * @deprecated Consider integrating into a more generic `initiateLogoutFlow` with a reason.
   */
  public async initiateLogoutOfSignupFlow(): Promise<void> {
    const sessionId = this.getCurrentSessionId();
    this.clearSession(); // Clear client-side data immediately

    if (sessionId) {
      await SessionEventLogger.getInstance().createAndLog(SessionEventType.LogoutSuccess, { reason: "signup_flow_abandoned" }, sessionId);
    }

    try {
      console.log("Initiating server-side logout from signup flow...");
      const response = await apiClient<SessionRedirectResponse>(`${AUTH_API_BASE_URL}/log_out_of_signup_flow`, {
        method: "DELETE",
      });
      console.log("Server-side logout from signup flow successful. Redirecting...");
      window.location.href = response.url;
    } catch (error) {
      console.error("Server-side logout from signup flow failed:", error);
      SessionNotificationService.getInstance().displayTemporaryMessage(
        ERROR_MESSAGES.LOGOUT_FAILED,
        "error"
      );
      if (sessionId) {
        await SessionEventLogger.getInstance().createAndLog(SessionEventType.LogoutSuccess, { status: "client_only", error: (error as Error).message, reason: "signup_flow_abandoned" }, sessionId);
      }
      // Attempt a client-side redirect to a default logged-out page if server didn't provide one
      window.location.href = "/signup/cancelled"; // Or some default public page
    }
  }

  /**
   * Allows an administrator to impersonate another user's session.
   * This is a highly sensitive operation and requires robust server-side authorization.
   * @param targetUserId The ID of the user to impersonate.
   * @param adminToken The admin's authentication token.
   * @returns A promise that resolves with the new session token for the impersonated user.
   * @throws {AuthenticationError} if authorization fails.
   */
  public async impersonateUserSession(targetUserId: string, adminToken: string): Promise<string> {
    console.warn(`Admin ${this.getCurrentUserId()} attempting to impersonate user ${targetUserId}.`);
    try {
      const response = await apiClient<{ sessionToken: string; refreshToken: string }>(
        `${AUTH_API_BASE_URL}/impersonate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${adminToken}`, // Use admin's token for this privileged action
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ targetUserId }),
        }
      );

      // Clear current session and set the new impersonated session
      this.clearSession();
      await this.setSession(response.sessionToken, response.refreshToken, true);

      // Log the sensitive event
      const impersonatedSessionId = this.getCurrentSessionId();
      if (impersonatedSessionId) {
          await SessionEventLogger.getInstance().createAndLog(
            SessionEventType.SensitiveAction,
            { action: "impersonation_start", targetUserId, impersonatorId: parseSessionToken(adminToken)?.userId },
            impersonatedSessionId
          );
          SessionNotificationService.getInstance().sendSecurityAlert(
            impersonatedSessionId,
            `You are currently impersonating user ${targetUserId}. All actions are logged.`
          );
      }
      console.log(`Successfully impersonated user ${targetUserId}.`);
      return response.sessionToken;
    } catch (error) {
      console.error(`Failed to impersonate user ${targetUserId}:`, error);
      SessionNotificationService.getInstance().displayTemporaryMessage(
        "Failed to impersonate user. Check permissions.",
        "error"
      );
      throw new AuthenticationError("Impersonation failed.", { originalError: error });
    }
  }

  /**
   * Ends an active impersonation session and reverts to the admin's original session (if available).
   * @returns A promise that resolves when impersonation ends.
   */
  public async endImpersonation(): Promise<void> {
    const impersonatedSessionId = this.getCurrentSessionId();
    const impersonatedUserId = this.getCurrentUserId();
    const currentTokenPayload = this.currentSessionToken ? parseSessionToken(this.currentSessionToken) : null;

    if (!currentTokenPayload?.isImpersonated) {
        console.warn("Not currently in an impersonation session.");
        SessionNotificationService.getInstance().displayTemporaryMessage(
            "Not currently impersonating a user.",
            "info"
        );
        return;
    }

    const impersonatorId = currentTokenPayload.impersonatorId;

    try {
      console.log(`Ending impersonation for user ${impersonatedUserId} by admin ${impersonatorId}...`);
      const response = await apiClient<{ sessionToken?: string; refreshToken?: string; redirectUrl?: string }>(
        `${AUTH_API_BASE_URL}/end-impersonation`,
        {
          method: "POST",
          body: JSON.stringify({ sessionId: impersonatedSessionId, userId: impersonatedUserId }),
        }
      );

      this.clearSession(); // Clear the impersonated session

      if (response.sessionToken && response.refreshToken) {
        // Revert to original admin session if tokens are returned
        await this.setSession(response.sessionToken, response.refreshToken, true);
        console.log(`Reverted to admin session for ${impersonatorId}.`);
        SessionNotificationService.getInstance().sendSessionInfo(
            this.getCurrentSessionId() || "",
            `Impersonation ended. Returned to your admin session.`
        );
      } else if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
      } else {
        // No admin session token returned, redirect to default logged-out page
        window.location.href = "/logged-out";
      }

      if (impersonatedSessionId) {
          await SessionEventLogger.getInstance().createAndLog(
            SessionEventType.SensitiveAction,
            { action: "impersonation_end", impersonatedUserId, impersonatorId },
            impersonatedSessionId
          );
      }
      console.log("Impersonation session ended successfully.");
    } catch (error) {
      console.error(`Failed to end impersonation for user ${impersonatedUserId}:`, error);
      SessionNotificationService.getInstance().displayTemporaryMessage(
        "Failed to end impersonation. Manual logout might be required.",
        "error"
      );
      // Fallback: clear everything and redirect to be safe
      this.clearSession();
      window.location.href = "/logged-out";
      throw new SessionError("Failed to end impersonation.", { originalError: error });
    }
  }
}

// --- Exported Session Actions (Legacy Wrappers & New API) ---

/**
 * Initiates the logout process.
 * This function is a wrapper for the `SessionManager.initiateLogoutFlow`.
 * @returns A function that, when called, executes the logout process.
 */
export function logOut(): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      await SessionManager.getInstance().initiateLogoutFlow();
    } catch (error) {
      console.error("Error during logOut (legacy wrapper):", error);
      SessionNotificationService.getInstance().displayTemporaryMessage(
        ERROR_MESSAGES.LOGOUT_FAILED,
        "error"
      );
    }
  };
}

/**
 * Initiates the specific logout process for the signup flow.
 * This function is a wrapper for the `SessionManager.initiateLogoutOfSignupFlow`.
 * @returns A function that, when called, executes the logout from signup flow process.
 * @deprecated Consider using `logOut` with a specific reason.
 */
export function logOutOfSignupFlow(): () => Promise<void> {
  return async (): Promise<void> => {
    try {
      await SessionManager.getInstance().initiateLogoutOfSignupFlow();
    } catch (error) {
      console.error("Error during logOutOfSignupFlow (legacy wrapper):", error);
      SessionNotificationService.getInstance().displayTemporaryMessage(
        ERROR_MESSAGES.LOGOUT_FAILED,
        "error"
      );
    }
  };
}

// Instantiate the SessionManager to start its lifecycle
export const sessionManager = SessionManager.getInstance();
export const sessionEventLogger = SessionEventLogger.getInstance();
export const sessionStorageManager = SessionStorageManager.getInstance();
export const sessionSecurityManager = SessionSecurityManager.getInstance();
export const geminiAISessionPredictor = GeminiAISessionPredictor.getInstance();
export const geminiAIAuthChallenge = GeminiAIAuthChallenge.getInstance();
export const sessionNotificationService = SessionNotificationService.getInstance();
