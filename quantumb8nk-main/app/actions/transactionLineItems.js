// --- Global Configuration & Constants ---
const API_BASE_URL = "/api/v1"; // Base URL for standard API endpoints
const GEMINI_AI_API_BASE_URL = "/api/gemini-ai/v1"; // Base URL for Gemini AI service endpoints
const MAX_RETRIES = 3; // Maximum number of retries for API calls
const RETRY_DELAY_MS = 1000; // Delay in milliseconds between retries
const GLOBAL_EVENT_TYPES = {
  TRANSACTION_LINE_ITEM_CREATED: "transactionLineItem.created",
  TRANSACTION_LINE_ITEM_UPDATED: "transactionLineItem.updated",
  TRANSACTION_LINE_ITEM_DELETED: "transactionLineItem.deleted",
  TRANSACTION_LINE_ITEM_ANOMALY_DETECTED: "transactionLineItem.anomalyDetected",
  TRANSACTION_LINE_ITEM_CATEGORIZED: "transactionLineItem.categorized",
  GLOBAL_ERROR_OCCURRED: "global.errorOccurred",
};

// --- Custom Error Classes for Robust Error Handling ---

/**
 * @class APIError
 * @extends Error
 * @description Custom error for API-related issues, including network failures, HTTP errors, and validation errors from the server.
 */
export class APIError extends Error {
  /**
   * @param {string} message - The primary error message.
   * @param {number} statusCode - The HTTP status code of the response.
   * @param {object} [details={}] - Additional structured error details from the API response.
   */
  constructor(message, statusCode, details = {}) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.details = details;
    // Capturing stack trace for better debugging, ensuring it works across environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

/**
 * @class AIIntegrationError
 * @extends Error
 * @description Custom error for issues specific to integration with Gemini AI services.
 */
export class AIIntegrationError extends Error {
  /**
   * @param {string} message - The error message specific to the AI integration failure.
   * @param {string} [aiServiceEndpoint='N/A'] - The specific AI service endpoint that experienced the failure.
   * @param {object} [originalError=null] - The original error object, if available, for deeper insight.
   */
  constructor(message, aiServiceEndpoint = "N/A", originalError = null) {
    super(message);
    this.name = "AIIntegrationError";
    this.aiServiceEndpoint = aiServiceEndpoint;
    this.originalError = originalError;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIIntegrationError);
    }
  }
}

/**
 * @class ValidationError
 * @extends Error
 * @description Custom error for client-side validation failures detected before making API calls.
 */
export class ValidationError extends Error {
  /**
   * @param {string} message - The error message describing the validation failure.
   * @param {object} [invalidFields={}] - An object mapping field names to their specific validation error messages.
   */
  constructor(message, invalidFields = {}) {
    super(message);
    this.name = "ValidationError";
    this.invalidFields = invalidFields;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

// --- Global Utility and Helper Functions ---

/**
 * @typedef {object} FetchConfig
 * @property {string} url - The URL endpoint for the fetch request.
 * @property {RequestInit} [options={}] - Standard Fetch API options (method, headers, body, etc.).
 * @property {number} [retries=MAX_RETRIES] - Number of times to retry the fetch operation on transient failures.
 * @property {number} [retryDelay=RETRY_DELAY_MS] - Delay in milliseconds before each retry attempt.
 * @property {boolean} [silentRetry=false] - If true, retry attempts will not be logged as warnings.
 */

/**
 * A robust fetch wrapper that includes retry logic for transient network or server errors,
 * and comprehensive error handling by throwing custom `APIError` instances.
 * Supports exponential backoff for rate-limiting (429) errors.
 *
 * @param {FetchConfig} config - Configuration object for the fetch operation.
 * @returns {Promise<Response>} The standard Fetch API Response object.
 * @throws {APIError} For network errors, non-OK HTTP responses, or critical JSON parsing failures.
 */
export async function fetchWithRetry({
  url,
  options = {},
  retries = MAX_RETRIES,
  retryDelay = RETRY_DELAY_MS,
  silentRetry = false,
}) {
  let attempts = 0;
  while (attempts <= retries) {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorDetails = {};
        try {
          // Attempt to parse JSON error message if the server provides one
          errorDetails = await response.json();
        } catch (jsonParseError) {
          // Fallback if JSON parsing fails, use status text
          errorDetails = {
            message: response.statusText || "Unknown error",
            error: jsonParseError.message,
          };
        }
        // Throw an APIError with detailed context
        throw new APIError(
          `API request failed: ${response.status} ${
            response.statusText || "Error"
          }`,
          response.status,
          errorDetails.errors || errorDetails // Use 'errors' field if available, otherwise the whole object
        );
      }
      return response; // Return successful response
    } catch (error) {
      // If it's an APIError from a client-side (4xx) issue that's not 429, don't retry
      if (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500) {
        if (error.statusCode === 429 && attempts < retries) {
          // Special handling for rate-limiting with exponential backoff
          if (!silentRetry) {
            console.warn(
              `[${new Date().toISOString()}] Rate limit hit for ${url}. Retrying in ${retryDelay * (attempts + 1)}ms... (Attempt ${attempts + 1}/${retries + 1})`,
              error
            );
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempts + 1)));
          attempts++;
          continue; // Continue to the next attempt
        }
        throw error; // Re-throw non-retryable client errors immediately
      }

      // For network errors, server errors (5xx), or other unexpected errors, apply retry logic
      if (attempts < retries) {
        if (!silentRetry) {
          console.warn(
            `[${new Date().toISOString()}] Fetch attempt ${attempts + 1} failed for ${url}. Retrying in ${retryDelay}ms...`,
            error
          );
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        attempts++;
      } else {
        // All retries exhausted, re-throw the final error, potentially wrapping generic errors
        console.error(`[${new Date().toISOString()}] Final fetch attempt failed for ${url}:`, error);
        if (error instanceof APIError) {
            throw error;
        } else {
            throw new APIError(`Network or unexpected error after multiple retries: ${error.message}`, 0, { originalError: error.message });
        }
      }
    }
  }
  // This line should technically be unreachable if retries are handled, but added for safety.
  throw new APIError("Fetch operation failed after all retries.", 0);
}

/**
 * Centralized function for dispatching global application events.
 * This is a placeholder for interaction with a global event bus, Redux store, or similar.
 * @param {string} eventType - The unique identifier for the type of event being dispatched.
 * @param {object} payload - The data payload associated with the event.
 */
export const dispatchGlobalEvent = (eventType, payload) => {
  // In a real application, this would interact with a global state management system.
  // E.g., `store.dispatch({ type: eventType, payload });` or `eventEmitter.emit(eventType, payload);`
  if (process.env.NODE_ENV !== 'production') {
    // console.debug(`[EventBus] Dispatching event: ${eventType}`, payload);
  }
};

/**
 * Centralized function for displaying error messages to the user (e.g., via toast notifications).
 * It also triggers a global event for error tracking.
 * @param {string} message - The user-friendly error message to be displayed.
 * @param {string} [id=null] - An optional unique identifier for the error notification (e.g., to prevent duplicates).
 */
export const dispatchGlobalError = (message, id = null) => {
  console.error(`[Global Error] ${id ? `(${id}) ` : ""}${message}`);
  dispatchGlobalEvent(GLOBAL_EVENT_TYPES.GLOBAL_ERROR_OCCURRED, { message, id });
  // Implement actual UI notification logic here (e.g., using a toast library).
};

/**
 * A service for logging critical actions and system events for auditing and debugging.
 * In a production environment, this would send data to a dedicated logging service.
 * @param {string} action - A concise description of the action being audited (e.g., "TRANSACTION_CREATED").
 * @param {object} details - Detailed contextual information about the action.
 * @param {string} [userId='system'] - The ID of the user or system component that initiated the action.
 * @param {string} [transactionId=null] - Optional transaction ID to link related audit entries.
 */
export const auditLog = (action, details, userId = "system", transactionId = null) => {
  if (process.env.NODE_ENV !== 'production') {
    // console.log(`[Audit Log] User: ${userId}, Action: ${action}, Transaction: ${transactionId || 'N/A'}, Details:`, details);
  }
  // In a real application, send this data to a remote logging service (e.g., Splunk, DataDog, custom backend).
};

/**
 * Performs client-side validation on a transaction line item's data.
 * This ensures basic data integrity before sending to the API.
 * @param {Partial<TransactionLineItem>} item - The transaction line item data object (can be partial for updates).
 * @returns {{isValid: boolean, errors: object}} An object indicating validity and a map of validation errors.
 */
export const validateLineItemData = (item) => {
  const errors = {};
  if (item.description !== undefined && (typeof item.description !== 'string' || item.description.trim() === "")) {
    errors.description = "Description cannot be empty and must be a string.";
  }
  if (item.amount !== undefined && (typeof item.amount !== "number" || isNaN(item.amount) || item.amount <= 0)) {
    errors.amount = "Amount must be a positive number.";
  }
  if (item.currency !== undefined && (typeof item.currency !== 'string' || item.currency.trim() === "" || item.currency.length !== 3)) {
    errors.currency = "Currency cannot be empty and must be a 3-letter code (e.g., 'USD').";
  }
  // Further advanced validations can be added here, e.g., date formats, category existence, etc.
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// --- Gemini AI Service Abstraction ---

/**
 * @typedef {object} GeminiAIResponse
 * @property {boolean} success - Indicates if the AI operation was conceptually successful.
 * @property {string} [message] - An optional message from the AI service (e.g., success message, warning).
 * @property {object} [data] - The primary data returned by the AI (e.g., categories, anomaly reports).
 * @property {string} [error] - A high-level error message from the AI service if not successful.
 * @property {object} [errorDetails] - Detailed error object from the AI service for deeper analysis.
 */

/**
 * @class GeminiAIService
 * @description Provides a high-level, standardized interface for interacting with various Gemini AI capabilities.
 * This class abstracts the direct API calls to the AI backend and centralizes AI-related logic.
 */
export class GeminiAIService {
  /**
   * Internal helper method to make requests to specific Gemini AI backend endpoints.
   * This ensures consistency in AI API calls, error handling, and response parsing.
   * @private
   * @param {string} endpoint - The specific AI API sub-endpoint (e.g., '/categorize', '/detect-anomaly').
   * @param {object} payload - The data payload to send to the AI service.
   * @returns {Promise<GeminiAIResponse>} A structured response object from the AI service.
   * @throws {AIIntegrationError} If the AI service call fails at the network or application level.
   */
  static async #callAIEndpoint(endpoint, payload) {
    const url = `${GEMINI_AI_API_BASE_URL}${endpoint}`;
    try {
      const response = await fetchWithRetry({
        url,
        options: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // In a real app, an AI-specific API key or authentication token would be added here.
            // "Authorization": `Bearer ${AuthService.getAIToken()}`
          },
          body: JSON.stringify(payload),
        },
        retries: 2, // AI calls might have different retry policies
        silentRetry: true, // Keep AI retries quiet unless final failure
      });
      const data = await response.json();
      // Assuming AI service responses have a 'status' or 'success' field
      if (data.status === 'error' || data.success === false) {
          throw new AIIntegrationError(
              data.message || `AI service endpoint ${endpoint} failed`,
              url,
              data.errorDetails || data.error || { payloadReceived: payload }
          );
      }
      return { success: true, message: data.message || "AI operation successful", data: data.result || data };
    } catch (error) {
      // Re-throw if already an AIIntegrationError, otherwise wrap generic errors
      if (error instanceof AIIntegrationError) {
        throw error;
      }
      console.error(`[GeminiAIService] Error calling AI endpoint ${url}:`, error);
      throw new AIIntegrationError(`Failed to connect to AI service for ${endpoint}: ${error.message}`, url, error);
    }
  }

  /**
   * Uses Gemini AI to predict and suggest categories for a given transaction line item description.
   * @param {string} description - The textual description of the line item.
   * @param {string} [userId] - Optional user ID for personalized category suggestions based on user history.
   * @returns {Promise<Array<string>>} An array of suggested category strings, ordered by confidence.
   * @throws {AIIntegrationError} If the AI service fails to provide categories.
   */
  static async predictCategories(description, userId = null) {
    if (!description || typeof description !== 'string' || description.trim() === "") {
        console.warn("[GeminiAIService] Cannot predict categories for an empty or invalid description.");
        return [];
    }
    const response = await this.#callAIEndpoint("/categorize", { description, userId });
    auditLog("AI_CATEGORIZE_PREDICT", { description, userId, categories: response.data?.categories || [] });
    return response.data?.categories || [];
  }

  /**
   * Leverages Gemini AI to detect anomalies or potential fraudulent patterns within a set of transaction line items.
   * @param {Array<object>} lineItems - An array of transaction line item objects to be analyzed.
   * @param {string} transactionId - The ID of the parent transaction, providing context for anomaly detection.
   * @param {string} [userId] - Optional user ID to incorporate user-specific spending patterns into anomaly models.
   * @returns {Promise<Array<object>>} An array of objects, each representing a detected anomaly with item ID and details.
   * @throws {AIIntegrationError} If the AI anomaly detection service encounters an error.
   */
  static async detectAnomalies(lineItems, transactionId, userId = null) {
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
        console.warn("[GeminiAIService] No line items provided for anomaly detection.");
        return [];
    }
    const response = await this.#callAIEndpoint("/detect-anomaly", { lineItems, transactionId, userId });
    auditLog("AI_ANOMALY_DETECT", { transactionId, userId, flaggedItems: response.data?.anomalies || [] });
    return response.data?.anomalies || [];
  }

  /**
   * Employs Gemini AI to enrich transaction line item details by fetching additional information
   * (e.g., detailed product specifications, enhanced merchant information) from external data sources.
   * @param {string} description - The description of the line item to use for enrichment.
   * @param {string} [merchantName] - Optional merchant name to refine enrichment results.
   * @returns {Promise<object>} An object containing the enriched details.
   * @throws {AIIntegrationError} If the AI enrichment service fails.
   */
  static async enrichDetails(description, merchantName = null) {
    if (!description || typeof description !== 'string' || description.trim() === "") {
        console.warn("[GeminiAIService] Cannot enrich details for an empty or invalid description.");
        return {};
    }
    const response = await this.#callAIEndpoint("/enrich-item", { description, merchantName });
    auditLog("AI_ENRICH_DETAILS", { description, merchantName, enrichedData: response.data?.enrichedData || {} });
    return response.data?.enrichedData || {};
  }

  /**
   * Uses Gemini AI to predict future spending patterns for a specific user and category over a given period.
   * This is a conceptual function that would interact with an advanced predictive model.
   * @param {string} userId - The ID of the user for whom to predict spending.
   * @param {string} category - The specific spending category for the prediction.
   * @param {string} period - The time period for the prediction (e.g., "month", "quarter", "year").
   * @returns {Promise<object>} Predicted spending data, including expected amounts and trends.
   * @throws {AIIntegrationError|ValidationError} If input is invalid or AI service fails.
   */
  static async predictSpending(userId, category, period) {
    if (!userId || !category || !period) {
        throw new ValidationError("User ID, category, and period are required for spending prediction.");
    }
    const response = await this.#callAIEndpoint("/predict-spending", { userId, category, period });
    auditLog("AI_PREDICT_SPENDING", { userId, category, period, prediction: response.data?.prediction || {} });
    return response.data?.prediction || {};
  }

  /**
   * Utilizes Gemini AI to suggest personalized budget adjustments based on a user's spending analysis.
   * @param {string} userId - The ID of the user.
   * @param {object} currentBudget - The user's current budget configuration to inform suggestions.
   * @returns {Promise<Array<object>>} An array of suggested budget adjustments with rationale.
   * @throws {AIIntegrationError|ValidationError} If input is invalid or AI service fails.
   */
  static async suggestBudgetAdjustments(userId, currentBudget) {
    if (!userId || !currentBudget || typeof currentBudget !== 'object') {
        throw new ValidationError("User ID and a valid current budget object are required for budget suggestions.");
    }
    const response = await this.#callAIEndpoint("/suggest-budget", { userId, currentBudget });
    auditLog("AI_SUGGEST_BUDGET", { userId, currentBudget, suggestions: response.data?.suggestions || [] });
    return response.data?.suggestions || [];
  }

  /**
   * Leverages Gemini AI to identify and recommend potential savings opportunities based on transaction data.
   * This could involve suggesting cheaper alternatives, identifying subscriptions, or optimizing spending.
   * @param {Array<object>} transactionLineItems - The list of transaction line items to analyze for savings.
   * @param {string} userId - The ID of the user for personalized recommendations.
   * @returns {Promise<Array<object>>} An array of suggested savings opportunities.
   * @throws {AIIntegrationError|ValidationError} If input is invalid or AI service fails.
   */
  static async suggestSavingsOpportunities(transactionLineItems, userId) {
    if (!Array.isArray(transactionLineItems) || transactionLineItems.length === 0 || !userId) {
        throw new ValidationError("Transaction line items (non-empty) and user ID are required for savings suggestions.");
    }
    const response = await this.#callAIEndpoint("/suggest-savings", { transactionLineItems, userId });
    auditLog("AI_SUGGEST_SAVINGS", { userId, numItems: transactionLineItems.length, opportunities: response.data?.opportunities || [] });
    return response.data?.opportunities || [];
  }
}

// --- Main Transaction Line Item Actions ---

/**
 * @typedef {object} TransactionLineItem
 * @property {string} [id] - The unique identifier for the line item (generated by backend for new items).
 * @property {string} description - A detailed description of the item or service.
 * @property {number} amount - The monetary value of the line item.
 * @property {string} currency - The three-letter ISO currency code (e.g., "USD", "EUR").
 * @property {string} [category] - The categorized type of the expense/income (e.g., "Groceries", "Utilities").
 * @property {string} [merchant] - The name of the merchant or vendor.
 * @property {string} [transactionDate] - ISO 8601 formatted date string for when the transaction occurred.
 * @property {string} [status='pending'] - The current processing status (e.g., 'pending', 'approved', 'flagged_for_review', 'reviewed').
 * @property {object} [aiInsights] - An object containing AI-generated data such as predicted categories, anomaly scores, or enriched details.
 * @property {string[]} [tags] - Optional array of tags for additional categorization or searchability.
 * @property {object} [approvalDetails] - Details related to the approval workflow (e.g., approver, approvedAt, notes).
 */

/**
 * Creates one or more transaction line items in bulk for a specific transaction.
 * This function incorporates client-side validation, optional AI pre-categorization,
 * and robust error handling with detailed logging.
 *
 * @param {object} params - Parameters for the bulk create operation.
 * @param {string} params.transactionId - The unique identifier of the parent transaction.
 * @param {TransactionLineItem[]} params.transactionLineItems - An array of transaction line item objects to create.
 * @param {function(string): void} [params.dispatchError=dispatchGlobalError] - Custom error dispatcher for UI notifications.
 * @param {boolean} [params.applyAICategorization=false] - If true, AI will attempt to categorize items before creation if no category is provided.
 * @returns {Promise<null|string>} Resolves to `null` on successful creation, or a human-readable error message string on failure.
 */
export const bulkCreate = async ({
  transactionId,
  transactionLineItems,
  dispatchError = dispatchGlobalError,
  applyAICategorization = false,
}) => {
  if (!transactionId) {
    dispatchError("Transaction ID is required for bulk creation.");
    auditLog("BULK_CREATE_FAILED", { reason: "Missing transactionId" }, "system", transactionId);
    return "Missing transaction ID.";
  }
  if (!Array.isArray(transactionLineItems) || transactionLineItems.length === 0) {
    dispatchError("No transaction line items provided for bulk creation.");
    auditLog("BULK_CREATE_FAILED", { reason: "No line items" }, "system", transactionId);
    return "No line items provided.";
  }

  const processedLineItems = [];
  const validationErrors = [];

  for (const item of transactionLineItems) {
    const { isValid, errors } = validateLineItemData(item);
    if (!isValid) {
      validationErrors.push({ item, errors });
      auditLog("BULK_CREATE_VALIDATION_ERROR", { item, errors, transactionId }, "system", transactionId);
      continue; // Skip invalid items for now, or throw a comprehensive error later
    }

    let itemToCreate = { ...item };

    // Apply AI categorization if requested and not already categorized
    if (applyAICategorization && !itemToCreate.category) {
      try {
        const categories = await GeminiAIService.predictCategories(item.description, "system_user_context"); // Invent a user context
        if (categories && categories.length > 0) {
          itemToCreate.category = categories[0]; // Assign the most confident category
          itemToCreate.aiInsights = {
            ...itemToCreate.aiInsights,
            predictedCategory: categories[0],
            categoryPredictionConfidence: 0.95, // Invent a confidence score
            lastAICategorized: new Date().toISOString(),
          };
          auditLog("AI_CATEGORIZE_APPLIED", { itemId: item.id || "new", description: item.description, category: itemToCreate.category }, "system", transactionId);
        }
      } catch (aiError) {
        console.warn(`[bulkCreate] Failed to apply AI categorization for item '${item.description}':`, aiError.message);
        dispatchError(`Failed to apply AI category for some items. Reason: ${aiError.message}`);
        auditLog("AI_CATEGORIZE_FAILED_BULK", { description: item.description, error: aiError.message }, "system", transactionId);
      }
    }
    processedLineItems.push(itemToCreate);
  }

  if (validationErrors.length > 0) {
    const errorMessage = `Some items failed client-side validation. Please check the console for details.`;
    dispatchError(errorMessage);
    // Optionally, could return a more detailed error object with validation results
    return errorMessage;
  }
  if (processedLineItems.length === 0) {
      dispatchError("No valid transaction line items to create after processing.");
      return "No valid items to create.";
  }

  const body = JSON.stringify({
    transaction_line_items: processedLineItems,
  });

  const url = `${API_BASE_URL}/transactions/${transactionId}/transaction_line_items/bulk_create`;

  try {
    await fetchWithRetry({
      url,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      },
    });

    auditLog("BULK_CREATE_SUCCESS", { transactionId, count: processedLineItems.length }, "system", transactionId);
    dispatchGlobalEvent(GLOBAL_EVENT_TYPES.TRANSACTION_LINE_ITEM_CREATED, {
      transactionId,
      items: processedLineItems.map((item) => item.id), // Assuming IDs are assigned by backend
    });
    window.location.reload(); // Retain original behavior: full page reload
    return null;
  } catch (error) {
    if (error instanceof APIError) {
      const errorMessage = error.details.message || error.message;
      dispatchError(errorMessage);
      auditLog("BULK_CREATE_API_ERROR", { transactionId, error: errorMessage, statusCode: error.statusCode, details: error.details }, "system", transactionId);
      return errorMessage;
    } else {
      console.error(`[bulkCreate] Unexpected error during bulk creation:`, error);
      dispatchError(`An unexpected error occurred during bulk creation. ${error.message}`);
      auditLog("BULK_CREATE_UNEXPECTED_ERROR", { transactionId, error: error.message }, "system", transactionId);
      return error.message;
    }
  }
};

/**
 * Updates a single transaction line item.
 * This function supports partial updates, incorporates client-side validation, optional AI anomaly detection
 * on sensitive fields (like amount or description), and uses optimistic locking via ETag (if provided).
 *
 * @param {object} params - Parameters for the update operation.
 * @param {string} params.transactionId - The ID of the parent transaction.
 * @param {string} params.transactionLineItemId - The ID of the specific line item to update.
 * @param {Partial<TransactionLineItem>} params.data - An object containing the fields and their new values to update.
 * @param {function(): void} [params.successCallback] - An optional callback function to execute on successful update.
 * @param {function(string): void} [params.dispatchError=dispatchGlobalError] - Custom error dispatcher for UI notifications.
 * @param {string} [params.expectedETag] - Optional ETag value for optimistic concurrency control (If-Match header).
 * @param {boolean} [params.runAIAnomalyCheck=true] - If true, AI will perform an anomaly check on the updated data.
 * @returns {Promise<null|string>} Resolves to `null` on success, or a human-readable error message string on failure.
 */
export const updateTLI = async ({
  transactionId,
  transactionLineItemId,
  data,
  successCallback,
  dispatchError = dispatchGlobalError,
  expectedETag = null, // For optimistic locking to prevent concurrent updates
  runAIAnomalyCheck = true,
}) => {
  if (!transactionId || !transactionLineItemId) {
    dispatchError("Transaction ID and Line Item ID are required for updating a line item.");
    auditLog("UPDATE_TLI_FAILED", { reason: "Missing IDs" }, "system", transactionId);
    return "Missing IDs.";
  }
  if (!data || Object.keys(data).length === 0) {
    dispatchError("No data provided for update.");
    auditLog("UPDATE_TLI_FAILED", { reason: "No data", transactionLineItemId }, "system", transactionId);
    return "No data provided.";
  }

  // Client-side validation for the partial data being updated
  const { isValid, errors } = validateLineItemData(data);
  if (!isValid) {
    const errorMessage = `Invalid update data: ${Object.values(errors).join(". ")}`;
    dispatchError(errorMessage);
    auditLog("UPDATE_TLI_VALIDATION_ERROR", { transactionLineItemId, data, errors }, "system", transactionId);
    return errorMessage;
  }

  let itemDataToSend = { ...data };
  // Perform AI anomaly detection on fields prone to anomalies (e.g., amount, description)
  if (runAIAnomalyCheck && (data.amount !== undefined || data.description !== undefined || data.category !== undefined)) {
    try {
      const anomalies = await GeminiAIService.detectAnomalies(
        [{ id: transactionLineItemId, ...data }], // Send the item with the proposed updated data for analysis
        transactionId
      );
      if (anomalies && anomalies.length > 0) {
        const flaggedItem = anomalies.find(a => a.itemId === transactionLineItemId);
        if (flaggedItem) {
          itemDataToSend.status = 'flagged_for_review'; // Automatically flag the item for manual review
          itemDataToSend.aiInsights = {
            ...itemDataToSend.aiInsights,
            anomalyDetected: true,
            anomalyDetails: flaggedItem.details,
            lastAnomalyCheck: new Date().toISOString(),
          };
          dispatchError(`Anomaly detected for item ${transactionLineItemId}: ${flaggedItem.details.reason}. Item flagged for review.`);
          auditLog("AI_ANOMALY_DETECTED_ON_UPDATE", { transactionLineItemId, details: flaggedItem.details }, "system", transactionId);
        }
      }
    } catch (aiError) {
      console.warn(`[updateTLI] Failed to run AI anomaly check for item ${transactionLineItemId}:`, aiError.message);
      dispatchError(`Could not perform AI anomaly check during update. Reason: ${aiError.message}`);
      auditLog("AI_ANOMALY_CHECK_FAILED", { transactionLineItemId, error: aiError.message }, "system", transactionId);
    }
  }

  const body = JSON.stringify(itemDataToSend); // Backend expects the update payload directly
  const url = `${API_BASE_URL}/transactions/${transactionId}/transaction_line_items/${transactionLineItemId}`;
  const headers = {
    "Content-Type": "application/json",
  };
  if (expectedETag) {
    headers["If-Match"] = expectedETag; // Add ETag for optimistic locking
  }

  try {
    const response = await fetchWithRetry({
      url,
      options: {
        method: "PATCH",
        headers: headers,
        body: body,
      },
    });

    // Extract new ETag from response headers for subsequent updates
    const newETag = response.headers.get("ETag");
    auditLog("UPDATE_TLI_SUCCESS", { transactionId, transactionLineItemId, updatedFields: Object.keys(data), newETag }, "system", transactionId);
    dispatchGlobalEvent(GLOBAL_EVENT_TYPES.TRANSACTION_LINE_ITEM_UPDATED, { transactionId, transactionLineItemId, data: itemDataToSend, newETag });

    if (successCallback) {
      successCallback();
    } else {
      window.location.reload(); // Retain original behavior
    }
    return null;
  } catch (error) {
    if (error instanceof APIError) {
      const errorMessage = error.details.message || error.message;
      if (error.statusCode === 412) { // HTTP 412 Precondition Failed indicates an ETag mismatch
        dispatchError(`Update failed: The item has been modified by another user. Please refresh your view and try again.`);
        auditLog("UPDATE_TLI_CONCURRENCY_ERROR", { transactionId, transactionLineItemId, error: errorMessage, statusCode: error.statusCode }, "system", transactionId);
      } else {
        dispatchError(errorMessage);
        auditLog("UPDATE_TLI_API_ERROR", { transactionId, transactionLineItemId, error: errorMessage, statusCode: error.statusCode, details: error.details }, "system", transactionId);
      }
      return errorMessage;
    } else {
      console.error(`[updateTLI] Unexpected error during line item update:`, error);
      dispatchError(`An unexpected error occurred during update. ${error.message}`);
      auditLog("UPDATE_TLI_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
      return error.message;
    }
  }
};

/**
 * Creates a single new transaction line item within a specified transaction.
 * Includes client-side validation and optional AI categorization.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {TransactionLineItem} itemData - The data for the new transaction line item.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @param {boolean} [applyAICategorization=true] - Whether to apply AI categorization if a category is not provided.
 * @returns {Promise<TransactionLineItem|string|null>} The created item object on success, or an error message string on failure.
 */
export const createTransactionLineItem = async (
  transactionId,
  itemData,
  dispatchError = dispatchGlobalError,
  applyAICategorization = true
) => {
  if (!transactionId) {
    dispatchError("Transaction ID is required for creating a line item.");
    auditLog("CREATE_TLI_FAILED", { reason: "Missing transactionId" }, "system", transactionId);
    return "Missing transaction ID.";
  }

  const { isValid, errors } = validateLineItemData(itemData);
  if (!isValid) {
    const errorMessage = `Invalid line item data: ${Object.values(errors).join(". ")}`;
    dispatchError(errorMessage);
    auditLog("CREATE_TLI_VALIDATION_ERROR", { itemData, errors }, "system", transactionId);
    return errorMessage;
  }

  let itemToCreate = { ...itemData };
  if (applyAICategorization && !itemToCreate.category) {
    try {
      const categories = await GeminiAIService.predictCategories(itemData.description);
      if (categories && categories.length > 0) {
        itemToCreate.category = categories[0];
        itemToCreate.aiInsights = {
          ...itemToCreate.aiInsights,
          predictedCategory: categories[0],
          categoryPredictionConfidence: 0.98,
          lastAICategorized: new Date().toISOString(),
        };
        auditLog("AI_CATEGORIZE_APPLIED", { description: itemData.description, category: itemToCreate.category }, "system", transactionId);
      }
    } catch (aiError) {
      console.warn(`[createTransactionLineItem] Failed to apply AI categorization for item '${itemData.description}':`, aiError.message);
      dispatchError(`Failed to apply AI category during creation. Reason: ${aiError.message}`);
      auditLog("AI_CATEGORIZE_FAILED", { description: itemData.description, error: aiError.message }, "system", transactionId);
    }
  }

  const body = JSON.stringify(itemToCreate);
  const url = `${API_BASE_URL}/transactions/${transactionId}/transaction_line_items`;

  try {
    const response = await fetchWithRetry({
      url,
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      },
    });
    const createdItem = await response.json();
    auditLog("CREATE_TLI_SUCCESS", { transactionId, createdItemId: createdItem.id, description: createdItem.description }, "system", transactionId);
    dispatchGlobalEvent(GLOBAL_EVENT_TYPES.TRANSACTION_LINE_ITEM_CREATED, { transactionId, item: createdItem });
    return createdItem;
  } catch (error) {
    if (error instanceof APIError) {
      const errorMessage = error.details.message || error.message;
      dispatchError(errorMessage);
      auditLog("CREATE_TLI_API_ERROR", { transactionId, error: errorMessage, statusCode: error.statusCode, details: error.details }, "system", transactionId);
      return errorMessage;
    } else {
      console.error(`[createTransactionLineItem] Unexpected error during creation:`, error);
      dispatchError(`An unexpected error occurred during creation. ${error.message}`);
      auditLog("CREATE_TLI_UNEXPECTED_ERROR", { transactionId, error: error.message }, "system", transactionId);
      return error.message;
    }
  }
};

/**
 * Deletes a specific transaction line item from a transaction.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item to delete.
 * @param {function(): void} [successCallback] - Optional callback for successful deletion.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<null|string>} Resolves to `null` on success, or an error message string on failure.
 */
export const deleteTransactionLineItem = async (
  transactionId,
  transactionLineItemId,
  successCallback,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId || !transactionLineItemId) {
    dispatchError("Transaction ID and Line Item ID are required for deletion.");
    auditLog("DELETE_TLI_FAILED", { reason: "Missing IDs" }, "system", transactionId);
    return "Missing IDs.";
  }

  const url = `${API_BASE_URL}/transactions/${transactionId}/transaction_line_items/${transactionLineItemId}`;

  try {
    await fetchWithRetry({
      url,
      options: {
        method: "DELETE",
      },
    });

    auditLog("DELETE_TLI_SUCCESS", { transactionId, transactionLineItemId }, "system", transactionId);
    dispatchGlobalEvent(GLOBAL_EVENT_TYPES.TRANSACTION_LINE_ITEM_DELETED, { transactionId, transactionLineItemId });
    if (successCallback) {
      successCallback();
    } else {
      window.location.reload(); // Retain original behavior
    }
    return null;
  } catch (error) {
    if (error instanceof APIError) {
      const errorMessage = error.details.message || error.message;
      dispatchError(errorMessage);
      auditLog("DELETE_TLI_API_ERROR", { transactionId, transactionLineItemId, error: errorMessage, statusCode: error.statusCode, details: error.details }, "system", transactionId);
      return errorMessage;
    } else {
      console.error(`[deleteTransactionLineItem] Unexpected error during deletion:`, error);
      dispatchError(`An unexpected error occurred during deletion. ${error.message}`);
      auditLog("DELETE_TLI_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
      return error.message;
    }
  }
};

/**
 * Fetches the detailed information for a single transaction line item.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item to fetch.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<TransactionLineItem|string|null>} The transaction line item object on success, or an error message string on failure.
 */
export const getTransactionLineItemDetails = async (
  transactionId,
  transactionLineItemId,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId || !transactionLineItemId) {
    dispatchError("Transaction ID and Line Item ID are required to fetch details.");
    auditLog("GET_TLI_DETAILS_FAILED", { reason: "Missing IDs" }, "system", transactionId);
    return "Missing IDs.";
  }

  const url = `${API_BASE_URL}/transactions/${transactionId}/transaction_line_items/${transactionLineItemId}`;

  try {
    const response = await fetchWithRetry({ url, options: { method: "GET" } });
    const item = await response.json();
    auditLog("GET_TLI_DETAILS_SUCCESS", { transactionId, transactionLineItemId }, "system", transactionId);
    return item;
  } catch (error) {
    if (error instanceof APIError) {
      const errorMessage = error.details.message || error.message;
      dispatchError(errorMessage);
      auditLog("GET_TLI_DETAILS_API_ERROR", { transactionId, transactionLineItemId, error: errorMessage, statusCode: error.statusCode, details: error.details }, "system", transactionId);
      return errorMessage;
    } else {
      console.error(`[getTransactionLineItemDetails] Unexpected error fetching details:`, error);
      dispatchError(`An unexpected error occurred fetching details. ${error.message}`);
      auditLog("GET_TLI_DETAILS_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
      return error.message;
    }
  }
};

/**
 * @typedef {object} GetLineItemsFilters
 * @property {string} [category] - Filter items by a specific category.
 * @property {string} [status] - Filter items by their current status (e.g., 'pending', 'approved', 'flagged_for_review').
 * @property {string} [startDate] - Filter items by transaction date (items on or after this ISO 8601 date string).
 * @property {string} [endDate] - Filter items by transaction date (items on or before this ISO 8601 date string).
 * @property {number} [minAmount] - Filter items with an amount greater than or equal to this value.
 * @property {number} [maxAmount] - Filter items with an amount less than or equal to this value.
 * @property {string} [sortBy='transactionDate'] - The field by which to sort the results (e.g., 'amount', 'description').
 * @property {'asc'|'desc'} [sortOrder='desc'] - The order of sorting ('asc' for ascending, 'desc' for descending).
 * @property {number} [page=1] - The page number for pagination, starting from 1.
 * @property {number} [limit=10] - The maximum number of items to return per page.
 * @property {string} [search] - A full-text search string to match against descriptions or merchant names.
 */

/**
 * Fetches all transaction line items for a given transaction, supporting extensive filtering and pagination.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {GetLineItemsFilters} [filters={}] - Optional filters and pagination parameters.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<{items: TransactionLineItem[], totalCount: number}|string|null>} An object containing an array of line items and the total count, or an error message string on failure.
 */
export const getAllTransactionLineItems = async (
  transactionId,
  filters = {},
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId) {
    dispatchError("Transaction ID is required to fetch all line items.");
    auditLog("GET_ALL_TLI_FAILED", { reason: "Missing transactionId" }, "system", transactionId);
    return "Missing transaction ID.";
  }

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE_URL}/transactions/${transactionId}/transaction_line_items?${queryParams.toString()}`;

  try {
    const response = await fetchWithRetry({ url, options: { method: "GET" } });
    const data = await response.json(); // Assuming response format: { items: [], totalCount: number }
    auditLog("GET_ALL_TLI_SUCCESS", { transactionId, filters, count: data.items?.length || 0, total: data.totalCount || 0 }, "system", transactionId);
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      const errorMessage = error.details.message || error.message;
      dispatchError(errorMessage);
      auditLog("GET_ALL_TLI_API_ERROR", { transactionId, error: errorMessage, statusCode: error.statusCode, details: error.details }, "system", transactionId);
      return errorMessage;
    } else {
      console.error(`[getAllTransactionLineItems] Unexpected error fetching all line items:`, error);
      dispatchError(`An unexpected error occurred fetching all line items. ${error.message}`);
      auditLog("GET_ALL_TLI_UNEXPECTED_ERROR", { transactionId, error: error.message }, "system", transactionId);
      return error.message;
    }
  }
};

/**
 * Applies Gemini AI categorization to an existing transaction line item.
 * This can be used to manually trigger categorization or re-categorize an item.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item to categorize.
 * @param {boolean} [forceUpdate=false] - If true, re-categorize even if a category already exists.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<TransactionLineItem|string|null>} The updated line item object on success, or an error message string on failure.
 */
export const applyAICategorizationToItem = async (
  transactionId,
  transactionLineItemId,
  forceUpdate = false,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId || !transactionLineItemId) {
    dispatchError("Transaction ID and Line Item ID are required for AI categorization.");
    return "Missing IDs.";
  }

  try {
    const currentItem = await getTransactionLineItemDetails(transactionId, transactionLineItemId, dispatchError);
    if (typeof currentItem === 'string' || !currentItem) { // getTransactionLineItemDetails can return error string or null
        dispatchError(typeof currentItem === 'string' ? currentItem : `Transaction line item ${transactionLineItemId} not found.`);
        return typeof currentItem === 'string' ? currentItem : `Item not found.`;
    }

    if (currentItem.category && !forceUpdate) {
      console.log(`[applyAICategorizationToItem] Item ${transactionLineItemId} already has a category '${currentItem.category}' and forceUpdate is false. Skipping AI categorization.`);
      auditLog("AI_CATEGORIZE_SKIPPED", { transactionId, transactionLineItemId, reason: "Category exists, no force update" }, "system", transactionId);
      return currentItem;
    }

    const categories = await GeminiAIService.predictCategories(currentItem.description, currentItem.userId); // Assuming userId can be inferred or passed
    if (categories && categories.length > 0) {
      const newCategory = categories[0];
      const aiInsights = {
        ...currentItem.aiInsights,
        predictedCategory: newCategory,
        categoryPredictionConfidence: 0.99, // High confidence for explicit request
        lastAICategorized: new Date().toISOString(),
      };

      const updateResult = await updateTLI({
        transactionId,
        transactionLineItemId,
        data: { category: newCategory, aiInsights },
        dispatchError,
        runAIAnomalyCheck: false, // Prevent re-running anomaly check during a category update
      });

      if (updateResult === null) {
        auditLog("AI_CATEGORIZE_APPLIED_TO_ITEM", { transactionId, transactionLineItemId, newCategory }, "system", transactionId);
        dispatchGlobalEvent(GLOBAL_EVENT_TYPES.TRANSACTION_LINE_ITEM_CATEGORIZED, { transactionId, transactionLineItemId, category: newCategory });
        return await getTransactionLineItemDetails(transactionId, transactionLineItemId, dispatchError); // Fetch and return the newly updated item
      } else {
        return updateResult; // Propagate error message from updateTLI
      }
    } else {
        dispatchError(`AI could not predict a category for item ${transactionLineItemId} based on its description.`);
        auditLog("AI_CATEGORIZE_NO_PREDICTION", { transactionId, transactionLineItemId, description: currentItem.description }, "system", transactionId);
        return `No category predicted.`;
    }
  } catch (error) {
    if (error instanceof AIIntegrationError) {
      dispatchError(`AI categorization failed: ${error.message}`);
      auditLog("AI_CATEGORIZE_ITEM_FAILED", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
      return error.message;
    }
    console.error(`[applyAICategorizationToItem] Unexpected error during AI categorization:`, error);
    dispatchError(`An unexpected error occurred during AI categorization. ${error.message}`);
    auditLog("AI_CATEGORIZE_ITEM_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
    return error.message;
  }
};

/**
 * Initiates a bulk AI anomaly detection check for all line items within a specified transaction.
 * Items identified as anomalous will have their status automatically updated to 'flagged_for_review'.
 *
 * @param {string} transactionId - The ID of the parent transaction to check for anomalies.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<number|string>} Resolves to the number of items flagged as anomalous, or an error message string on failure.
 */
export const bulkDetectAnomaliesInTransaction = async (
  transactionId,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId) {
    dispatchError("Transaction ID is required for bulk anomaly detection.");
    return "Missing transaction ID.";
  }

  try {
    const { items: allLineItems } = await getAllTransactionLineItems(transactionId, {}, dispatchError);
    if (typeof allLineItems === 'string' || !allLineItems || allLineItems.length === 0) {
        const msg = typeof allLineItems === 'string' ? allLineItems : `No line items found for transaction ${transactionId}.`;
        console.log(`[bulkDetectAnomaliesInTransaction] ${msg}`);
        return 0; // Return 0 flagged if no items or error
    }

    const anomalousItems = await GeminiAIService.detectAnomalies(allLineItems, transactionId, "system_user_context");
    let flaggedCount = 0;

    for (const anomaly of anomalousItems) {
      const itemToFlag = allLineItems.find(item => item.id === anomaly.itemId);
      // Only update if the item exists and is not already flagged
      if (itemToFlag && itemToFlag.status !== 'flagged_for_review') {
        const aiInsights = {
          ...itemToFlag.aiInsights,
          anomalyDetected: true,
          anomalyDetails: anomaly.details,
          lastAnomalyCheck: new Date().toISOString(),
        };

        const updateResult = await updateTLI({
          transactionId,
          transactionLineItemId: anomaly.itemId,
          data: { status: 'flagged_for_review', aiInsights },
          dispatchError,
          runAIAnomalyCheck: false, // Prevent infinite recursion of anomaly checks during update
        });

        if (updateResult === null) {
          flaggedCount++;
          auditLog("TRANSACTION_BULK_ANOMALY_FLAGGED", { transactionId, transactionLineItemId: anomaly.itemId, details: anomaly.details }, "system", transactionId);
          dispatchGlobalEvent(GLOBAL_EVENT_TYPES.TRANSACTION_LINE_ITEM_ANOMALY_DETECTED, { transactionId, transactionLineItemId: anomaly.itemId, details: anomaly.details });
        } else {
          console.warn(`[bulkDetectAnomaliesInTransaction] Failed to update item ${anomaly.itemId} after anomaly detection: ${updateResult}`);
          dispatchError(`Failed to update item ${anomaly.itemId} as flagged. Reason: ${updateResult}`);
        }
      }
    }
    auditLog("BULK_ANOMALY_CHECK_COMPLETED", { transactionId, totalItems: allLineItems.length, flaggedCount }, "system", transactionId);
    if (flaggedCount > 0) {
      dispatchError(`${flaggedCount} anomalies detected and flagged for review in transaction ${transactionId}.`);
    } else {
      dispatchError(`No new anomalies detected in transaction ${transactionId}.`);
    }
    return flaggedCount;
  } catch (error) {
    if (error instanceof AIIntegrationError) {
      dispatchError(`Bulk anomaly detection failed: ${error.message}`);
      auditLog("BULK_ANOMALY_CHECK_FAILED", { transactionId, error: error.message }, "system", transactionId);
      return error.message;
    }
    console.error(`[bulkDetectAnomaliesInTransaction] Unexpected error during bulk anomaly detection:`, error);
    dispatchError(`An unexpected error occurred during bulk anomaly detection. ${error.message}`);
    auditLog("BULK_ANOMALY_CHECK_UNEXPECTED_ERROR", { transactionId, error: error.message }, "system", transactionId);
    return error.message;
  }
};

/**
 * Submits a transaction line item for manual approval, updating its status.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item to submit for approval.
 * @param {string} approverRoleOrId - The role or ID of the person or group required to approve the item.
 * @param {string} [notes] - Optional notes or comments for the approver.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<null|string>} Resolves to `null` on success, or an error message string on failure.
 */
export const submitLineItemForApproval = async (
  transactionId,
  transactionLineItemId,
  approverRoleOrId,
  notes = null,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId || !transactionLineItemId || !approverRoleOrId) {
    dispatchError("Transaction ID, Line Item ID, and an Approver identifier are required for approval submission.");
    return "Missing required parameters.";
  }

  try {
    const updateResult = await updateTLI({
      transactionId,
      transactionLineItemId,
      data: { status: 'pending_approval', approvalDetails: { approverRoleOrId, notes, requestedAt: new Date().toISOString() } },
      dispatchError,
      runAIAnomalyCheck: false, // Avoid re-running AI checks during workflow status updates
    });

    if (updateResult === null) {
      auditLog("TLI_SUBMITTED_FOR_APPROVAL", { transactionId, transactionLineItemId, approverRoleOrId }, "system", transactionId);
      dispatchError(`Line item ${transactionLineItemId} successfully submitted for approval to ${approverRoleOrId}.`);
      return null;
    } else {
      return updateResult;
    }
  } catch (error) {
    console.error(`[submitLineItemForApproval] Unexpected error during approval submission:`, error);
    dispatchError(`An unexpected error occurred during approval submission. ${error.message}`);
    auditLog("TLI_SUBMIT_APPROVAL_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
    return error.message;
  }
};

/**
 * Approves a transaction line item that is awaiting approval, updating its status.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item to approve.
 * @param {string} approvedByUserId - The ID of the user who is performing the approval.
 * @param {string} [approvalNotes] - Optional notes from the approver regarding the decision.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<null|string>} Resolves to `null` on success, or an error message string on failure.
 */
export const approveLineItem = async (
  transactionId,
  transactionLineItemId,
  approvedByUserId,
  approvalNotes = null,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId || !transactionLineItemId || !approvedByUserId) {
    dispatchError("Transaction ID, Line Item ID, and Approver User ID are required for approval.");
    return "Missing required parameters.";
  }

  try {
    const updateResult = await updateTLI({
      transactionId,
      transactionLineItemId,
      data: { status: 'approved', approvalDetails: { approvedBy: approvedByUserId, approvedAt: new Date().toISOString(), notes: approvalNotes } },
      dispatchError,
      runAIAnomalyCheck: false,
    });

    if (updateResult === null) {
      auditLog("TLI_APPROVED", { transactionId, transactionLineItemId, approvedByUserId }, "system", transactionId);
      dispatchError(`Line item ${transactionLineItemId} successfully approved by ${approvedByUserId}.`);
      return null;
    } else {
      return updateResult;
    }
  } catch (error) {
    console.error(`[approveLineItem] Unexpected error during approval:`, error);
    dispatchError(`An unexpected error occurred during approval. ${error.message}`);
    auditLog("TLI_APPROVE_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
    return error.message;
  }
};

/**
 * Generates an AI-powered insights report for a given transaction, summarizing various AI analyses.
 * This function orchestrates multiple AI calls and aggregates their findings into a comprehensive report.
 *
 * @param {string} transactionId - The ID of the transaction for which to generate insights.
 * @param {string} [userId] - Optional user ID for personalized insights (e.g., related to spending predictions).
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<object|string>} An object containing the aggregated AI insights, or an error message string on failure.
 */
export const generateAIInsightsReport = async (
  transactionId,
  userId = null,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId) {
    dispatchError("Transaction ID is required to generate AI insights.");
    return "Missing transaction ID.";
  }

  try {
    const { items: allLineItems } = await getAllTransactionLineItems(transactionId, {}, dispatchError);
    if (typeof allLineItems === 'string' || !allLineItems || allLineItems.length === 0) {
        const msg = typeof allLineItems === 'string' ? allLineItems : "No line items found for insights report.";
        console.warn(`[generateAIInsightsReport] ${msg}`);
        return { message: msg, insights: {}, timestamp: new Date().toISOString() };
    }

    const aiInsightsReport = {
      summary: `AI insights report for transaction ${transactionId} generated on ${new Date().toLocaleDateString()}.`,
      anomalySummary: {},
      categoryDistribution: {},
      spendingPredictions: {},
      savingsOpportunities: [],
      enrichedDetailsCount: 0,
      timestamp: new Date().toISOString(),
      detailedItemInsights: [], // Array to hold insights per item
    };

    // 1. Anomaly Detection Summary
    const anomalies = await GeminiAIService.detectAnomalies(allLineItems, transactionId, userId);
    aiInsightsReport.anomalySummary = {
      totalAnomalies: anomalies.length,
      flaggedItems: anomalies.map(a => ({ itemId: a.itemId, reason: a.details?.reason || 'Unknown anomaly' })),
    };
    for (const item of allLineItems) {
      const anomalyMatch = anomalies.find(a => a.itemId === item.id);
      aiInsightsReport.detailedItemInsights.push({
          itemId: item.id,
          description: item.description,
          amount: item.amount,
          category: item.category,
          isAnomalous: !!anomalyMatch,
          anomalyDetails: anomalyMatch?.details,
          predictedCategory: item.aiInsights?.predictedCategory,
          categoryPredictionConfidence: item.aiInsights?.categoryPredictionConfidence,
          enrichedDataSummary: item.aiInsights?.enrichedData ? `${Object.keys(item.aiInsights.enrichedData).length} fields enriched` : null,
      });
    }


    // 2. Category Distribution
    const categoryCounts = allLineItems.reduce((acc, item) => {
      const category = item.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + item.amount; // Sum amounts per category
      return acc;
    }, {});
    aiInsightsReport.categoryDistribution = categoryCounts;

    // 3. Spending Predictions (conceptual, might involve overall user spending across transactions)
    if (userId) {
        const topCategoryEntry = Object.entries(categoryCounts).reduce((max, entry) => (entry[1] > max[1] ? entry : max), ['', 0]);
        const topCategory = topCategoryEntry[0];
        if (topCategory && topCategory !== "Uncategorized") {
            try {
                const predictedSpending = await GeminiAIService.predictSpending(userId, topCategory, "month");
                aiInsightsReport.spendingPredictions[topCategory] = predictedSpending;
            } catch (predError) {
                console.warn(`[generateAIInsightsReport] Failed to get spending prediction for ${topCategory}: ${predError.message}`);
                aiInsightsReport.spendingPredictions.error = `Could not generate prediction for ${topCategory}.`;
            }
        }
    }


    // 4. Savings Opportunities
    try {
        const savings = await GeminiAIService.suggestSavingsOpportunities(allLineItems, userId);
        aiInsightsReport.savingsOpportunities = savings;
    } catch (savingsError) {
        console.warn(`[generateAIInsightsReport] Failed to get savings opportunities: ${savingsError.message}`);
        aiInsightsReport.savingsOpportunities = [{ message: `Could not generate savings opportunities. ${savingsError.message}` }];
    }


    // 5. Enriched Details Count
    aiInsightsReport.enrichedDetailsCount = allLineItems.filter(item => item.aiInsights?.enrichedData && Object.keys(item.aiInsights.enrichedData).length > 0).length;


    auditLog("AI_INSIGHTS_REPORT_GENERATED", { transactionId, userId, reportSummary: aiInsightsReport.summary }, "system", transactionId);
    dispatchError(`AI insights report generated for transaction ${transactionId}.`);
    return aiInsightsReport;

  } catch (error) {
    if (error instanceof AIIntegrationError) {
      dispatchError(`Failed to generate AI insights report due to AI service error: ${error.message}`);
      auditLog("AI_INSIGHTS_REPORT_FAILED", { transactionId, error: error.message }, "system", transactionId);
      return error.message;
    }
    console.error(`[generateAIInsightsReport] Unexpected error during AI insights generation:`, error);
    dispatchError(`An unexpected error occurred generating AI insights. ${error.message}`);
    auditLog("AI_INSIGHTS_REPORT_UNEXPECTED_ERROR", { transactionId, error: error.message }, "system", transactionId);
    return error.message;
  }
};

/**
 * Marks a previously flagged anomalous transaction line item as 'reviewed', indicating manual inspection.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item whose anomaly is being reviewed.
 * @param {string} reviewedByUserId - The ID of the user who performed the review.
 * @param {string} [reviewNotes] - Optional notes from the reviewer about the anomaly and their decision.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<null|string>} Resolves to `null` on success, or an error message string on failure.
 */
export const markAnomalyAsReviewed = async (
  transactionId,
  transactionLineItemId,
  reviewedByUserId,
  reviewNotes = null,
  dispatchError = dispatchGlobalError
) => {
  if (!transactionId || !transactionLineItemId || !reviewedByUserId) {
    dispatchError("Transaction ID, Line Item ID, and Reviewer User ID are required to mark an anomaly as reviewed.");
    return "Missing required parameters.";
  }

  try {
    const updateResult = await updateTLI({
      transactionId,
      transactionLineItemId,
      data: { status: 'reviewed', aiInsights: { anomalyResolved: true, reviewedBy: reviewedByUserId, reviewedAt: new Date().toISOString(), reviewNotes } },
      dispatchError,
      runAIAnomalyCheck: false, // No need to re-check for anomalies after a manual review
    });

    if (updateResult === null) {
      auditLog("TLI_ANOMALY_REVIEWED", { transactionId, transactionLineItemId, reviewedByUserId }, "system", transactionId);
      dispatchError(`Anomaly for line item ${transactionLineItemId} successfully marked as reviewed.`);
      return null;
    } else {
      return updateResult;
    }
  } catch (error) {
    console.error(`[markAnomalyAsReviewed] Unexpected error marking anomaly as reviewed:`, error);
    dispatchError(`An unexpected error occurred marking anomaly as reviewed. ${error.message}`);
    auditLog("TLI_ANOMALY_REVIEW_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
    return error.message;
  }
};

/**
 * Exports a comprehensive report of transaction line items for a given transaction in various formats.
 * This function handles fetching the data and then sending it to a backend service for format conversion and download link generation.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {'csv'|'json'|'pdf'} format - The desired export file format.
 * @param {GetLineItemsFilters} [filters={}] - Optional filters to apply to the line items before exporting.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<string|null>} Resolves to the URL of the exported file on success, or an error message string on failure.
 */
export const exportTransactionLineItems = async (
  transactionId,
  format,
  filters = {},
  dispatchError = dispatchGlobalError
) => {
    if (!transactionId || !format) {
        dispatchError("Transaction ID and format are required for export.");
        return "Missing required parameters.";
    }
    if (!['csv', 'json', 'pdf'].includes(format)) {
        dispatchError("Unsupported export format. Please choose 'csv', 'json', or 'pdf'.");
        return "Unsupported format.";
    }

    try {
        // Fetch data using existing getAllTransactionLineItems function
        const dataToExport = await getAllTransactionLineItems(transactionId, filters, dispatchError);
        if (typeof dataToExport === 'string') { // getAllTransactionLineItems might return error string
            return dataToExport;
        }
        if (!dataToExport || !dataToExport.items || dataToExport.items.length === 0) {
            dispatchError("No line items found to export with the given filters.");
            return "No items to export.";
        }

        // Prepare payload for a hypothetical server-side export endpoint
        const exportUrl = `${API_BASE_URL}/transactions/${transactionId}/transaction_line_items/export`;
        const bodyPayload = {
            format,
            items: dataToExport.items.map(item => ({ // Only send relevant data for export
                id: item.id,
                description: item.description,
                amount: item.amount,
                currency: item.currency,
                category: item.category,
                merchant: item.merchant,
                transactionDate: item.transactionDate,
                status: item.status,
                // Include a summary of AI insights for the report
                aiSummary: item.aiInsights ? `Anomaly: ${item.aiInsights.anomalyDetected ? 'Yes' : 'No'}, Predicted Cat: ${item.aiInsights.predictedCategory || 'N/A'}` : 'N/A'
            })),
            filters, // Also send filters so backend can recreate the filtered set if needed
            aiAnalysisRequest: true, // Request backend to perform AI analysis for the report
        };

        const response = await fetchWithRetry({
            url: exportUrl,
            options: {
                method: "POST", // POST is typical for generating reports/exports
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyPayload),
            },
        });

        const exportResponse = await response.json();
        if (exportResponse.downloadUrl) {
            auditLog("TLI_EXPORT_SUCCESS", { transactionId, format, count: dataToExport.items.length, downloadUrl: exportResponse.downloadUrl }, "system", transactionId);
            dispatchError(`Export successful! Your download should start shortly, or use this link: ${exportResponse.downloadUrl}`);
            window.open(exportResponse.downloadUrl, '_blank'); // Auto-download in a new tab
            return exportResponse.downloadUrl;
        } else {
            throw new APIError("Export initiated successfully but no download URL was returned by the server.", response.status, exportResponse);
        }

    } catch (error) {
        if (error instanceof APIError) {
            const errorMessage = error.details.message || error.message;
            dispatchError(errorMessage);
            auditLog("TLI_EXPORT_FAILED_API", { transactionId, format, error: errorMessage, statusCode: error.statusCode }, "system", transactionId);
            return errorMessage;
        }
        console.error(`[exportTransactionLineItems] Unexpected error during export:`, error);
        dispatchError(`An unexpected error occurred during export. ${error.message}`);
        auditLog("TLI_EXPORT_FAILED_UNEXPECTED", { transactionId, format, error: error.message }, "system", transactionId);
        return error.message;
    }
};

/**
 * Applies AI-driven data enrichment to a specific transaction line item, enhancing its details.
 * This might fetch additional product information, merchant ratings, or other contextual data.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item to enrich.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<TransactionLineItem|string|null>} The updated transaction line item object on success, or an error message string on failure.
 */
export const enrichTransactionLineItemWithAI = async (
    transactionId,
    transactionLineItemId,
    dispatchError = dispatchGlobalError
) => {
    if (!transactionId || !transactionLineItemId) {
        dispatchError("Transaction ID and Line Item ID are required for AI enrichment.");
        return "Missing required parameters.";
    }

    try {
        const currentItem = await getTransactionLineItemDetails(transactionId, transactionLineItemId, dispatchError);
        if (typeof currentItem === 'string' || !currentItem) {
            dispatchError(typeof currentItem === 'string' ? currentItem : `Transaction line item ${transactionLineItemId} not found for enrichment.`);
            return typeof currentItem === 'string' ? currentItem : `Item not found.`;
        }

        const enrichedData = await GeminiAIService.enrichDetails(currentItem.description, currentItem.merchant);
        if (Object.keys(enrichedData).length > 0) {
            const aiInsights = {
                ...currentItem.aiInsights,
                enrichedData, // Merge new enriched data
                lastEnriched: new Date().toISOString(),
            };
            const updateResult = await updateTLI({
                transactionId,
                transactionLineItemId,
                data: { aiInsights },
                dispatchError,
                runAIAnomalyCheck: false, // Prevent anomaly check on AI insights update
            });

            if (updateResult === null) {
                auditLog("TLI_AI_ENRICHED", { transactionId, transactionLineItemId, enrichedKeys: Object.keys(enrichedData) }, "system", transactionId);
                dispatchError(`Line item ${transactionLineItemId} successfully enriched with AI data.`);
                return await getTransactionLineItemDetails(transactionId, transactionLineItemId, dispatchError); // Return the fully updated item
            } else {
                return updateResult; // Propagate error from updateTLI
            }
        } else {
            dispatchError(`AI enrichment found no new data for item ${transactionLineItemId}. The item remains unchanged.`);
            auditLog("TLI_AI_ENRICH_NO_DATA", { transactionId, transactionLineItemId, description: currentItem.description }, "system", transactionId);
            return currentItem; // Return original item if no new data was found
        }
    } catch (error) {
        if (error instanceof AIIntegrationError) {
            dispatchError(`AI enrichment failed: ${error.message}`);
            auditLog("TLI_AI_ENRICH_FAILED", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
            return error.message;
        }
        console.error(`[enrichTransactionLineItemWithAI] Unexpected error during AI enrichment:`, error);
        dispatchError(`An unexpected error occurred during AI enrichment. ${error.message}`);
        auditLog("TLI_AI_ENRICH_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
        return error.message;
    }
};

/**
 * Performs a deep-dive analysis on a specific transaction line item using advanced AI capabilities.
 * This might involve contextual analysis, historical comparisons, or multi-modal data processing.
 *
 * @param {string} transactionId - The ID of the parent transaction.
 * @param {string} transactionLineItemId - The ID of the line item to analyze.
 * @param {function(string): void} [dispatchError=dispatchGlobalError] - Custom error dispatcher.
 * @returns {Promise<object|string|null>} A detailed analysis report object on success, or an error message string on failure.
 */
export const performAIDeepDiveAnalysis = async (
    transactionId,
    transactionLineItemId,
    dispatchError = dispatchGlobalError
) => {
    if (!transactionId || !transactionLineItemId) {
        dispatchError("Transaction ID and Line Item ID are required for AI deep dive analysis.");
        return "Missing required parameters.";
    }

    try {
        const currentItem = await getTransactionLineItemDetails(transactionId, transactionLineItemId, dispatchError);
        if (typeof currentItem === 'string' || !currentItem) {
            dispatchError(typeof currentItem === 'string' ? currentItem : `Transaction line item ${transactionLineItemId} not found for deep dive.`);
            return typeof currentItem === 'string' ? currentItem : `Item not found.`;
        }

        // Simulate a more complex AI call to a dedicated deep-dive endpoint
        const deepDiveReport = await GeminiAIService.#callAIEndpoint("/deep-dive-analysis", {
            transactionId,
            transactionLineItemId,
            itemDetails: currentItem,
            historicalContext: true, // Request AI to use historical data for context
            userPreferences: true, // Request AI to use user-specific preferences
            advancedAnalysisFlags: ['sentiment', 'risk_assessment', 'market_comparison'], // Invent specific analysis flags
        });

        if (deepDiveReport.success && deepDiveReport.data) {
            const aiInsights = {
                ...currentItem.aiInsights,
                deepDiveAnalysis: deepDiveReport.data, // Store the comprehensive analysis report
                lastDeepDive: new Date().toISOString(),
            };

            const updateResult = await updateTLI({
                transactionId,
                transactionLineItemId,
                data: { aiInsights },
                dispatchError,
                runAIAnomalyCheck: false,
            });

            if (updateResult === null) {
                auditLog("TLI_AI_DEEP_DIVE_SUCCESS", { transactionId, transactionLineItemId, reportSummary: deepDiveReport.data.summary || 'N/A' }, "system", transactionId);
                dispatchError(`AI deep dive analysis completed for item ${transactionLineItemId}. See insights for details.`);
                return deepDiveReport.data;
            } else {
                return updateResult;
            }
        } else {
            dispatchError(`AI deep dive analysis failed to return meaningful data for item ${transactionLineItemId}.`);
            return `No analysis data.`;
        }
    } catch (error) {
        if (error instanceof AIIntegrationError) {
            dispatchError(`AI deep dive analysis failed due to AI service error: ${error.message}`);
            auditLog("TLI_AI_DEEP_DIVE_FAILED", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
            return error.message;
        }
        console.error(`[performAIDeepDiveAnalysis] Unexpected error during AI deep dive analysis:`, error);
        dispatchError(`An unexpected error occurred during AI deep dive analysis. ${error.message}`);
        auditLog("TLI_AI_DEEP_DIVE_UNEXPECTED_ERROR", { transactionId, transactionLineItemId, error: error.message }, "system", transactionId);
        return error.message;
    }
};
