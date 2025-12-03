// Copyright Global Financial Solutions Inc.
// All rights reserved. Proprietary and confidential.

/**
 * Global configuration settings for the Gemini platform.
 * Allows easy management of API endpoints, feature flags, and other system-wide parameters.
 * @namespace gemini.config
 */
export const geminiConfig = {
    /** Base URL for the main Counterparty API. */
    counterpartyApiBaseUrl: "/api/v1/counterparties",
    /** Base URL for document management API. */
    documentApiBaseUrl: "/api/v1/documents",
    /** Base URL for AI services. */
    aiApiBaseUrl: "/api/v1/ai",
    /** Base URL for notification services. */
    notificationApiBaseUrl: "/api/v1/notifications",
    /** GraphQL endpoint. */
    graphqlEndpoint: "/graphql",
    /** Feature flag for AI-powered risk assessment. */
    featureFlags: {
        enableAiRiskAssessment: true,
        enableDocumentAiExtraction: true,
        enableRealtimeNotifications: true,
        enableCounterpartyCaching: true,
    },
    /** Cache expiration time in milliseconds (e.g., 5 minutes). */
    cacheExpirationMs: 5 * 60 * 1000,
    /** Default language for AI text generation. */
    defaultAiLanguage: "en-US",
    /** Maximum number of retries for transient API errors. */
    maxApiRetries: 3,
    /** Delay between API retries in milliseconds. */
    apiRetryDelayMs: 1000,
    /** Token for Gemini AI authentication. In a real system, this would be managed securely. */
    aiServiceToken: "GEMINI_AI_SECURE_TOKEN_PLACEHOLDER", // Should be fetched securely, e.g., from an auth service
};

/**
 * Defines various event types dispatched throughout the application.
 * Using a centralized constant for event names promotes consistency and reduces typos.
 * @namespace CounterpartyEventTypes
 */
export const CounterpartyEventTypes = {
    /** Dispatched when a new counterparty is successfully created. */
    COUNTERPARTY_CREATED: "COUNTERPARTY_CREATED",
    /** Dispatched when an existing counterparty is updated. */
    COUNTERPARTY_UPDATED: "COUNTERPARTY_UPDATED",
    /** Dispatched when a counterparty is archived (soft-deleted). */
    COUNTERPARTY_ARCHIVED: "COUNTERPARTY_ARCHIVED",
    /** Dispatched when a document is uploaded for a counterparty. */
    DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
    /** Dispatched when a compliance check is initiated or completed for a counterparty. */
    COMPLIANCE_STATUS_UPDATED: "COMPLIANCE_STATUS_UPDATED",
    /** Dispatched when an external account is added or updated for a counterparty. */
    EXTERNAL_ACCOUNT_UPDATED: "EXTERNAL_ACCOUNT_UPDATED",
    /** Dispatched when a counterparty's risk profile changes. */
    RISK_PROFILE_CHANGED: "RISK_PROFILE_CHANGED",
    /** Dispatched when a critical error occurs during a counterparty operation. */
    COUNTERPARTY_ERROR: "COUNTERPARTY_ERROR",
    /** Dispatched for general system notifications. */
    SYSTEM_NOTIFICATION: "SYSTEM_NOTIFICATION",
};

/**
 * Defines standard status codes for counterparties, reflecting their lifecycle.
 * @namespace CounterpartyStatus
 */
export const CounterpartyStatus = {
    /** The counterparty is active and fully operational. */
    ACTIVE: "ACTIVE",
    /** The counterparty is pending initial verification or setup. */
    PENDING_VERIFICATION: "PENDING_VERIFICATION",
    /** The counterparty's status requires review due to flagged issues. */
    UNDER_REVIEW: "UNDER_REVIEW",
    /** The counterparty has been soft-deleted and is no longer active. */
    ARCHIVED: "ARCHIVED",
    /** The counterparty has been permanently removed. */
    DELETED: "DELETED",
    /** The counterparty is temporarily inactive. */
    INACTIVE: "INACTIVE",
    /** Counterparty details are incomplete and require further data. */
    INCOMPLETE: "INCOMPLETE",
};

/**
 * Custom isEmpty implementation to replace lodash/isEmpty.
 * Checks for null, undefined, empty array, or empty object.
 * @param {*} value The value to check.
 * @returns {boolean} True if the value is empty, false otherwise.
 */
export const isEmpty = (value) =>
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0);

/**
 * Custom error class for API-related issues.
 * @augments Error
 */
export class ApiError extends Error {
    /**
     * Creates an instance of ApiError.
     * @param {string} message - The error message.
     * @param {object} [options] - Additional options.
     * @param {Response} [options.response] - The raw fetch API response.
     * @param {object} [options.data] - Parsed error data from the response body.
     * @param {number} [options.statusCode] - HTTP status code.
     */
    constructor(message, { response, data, statusCode } = {}) {
        super(message);
        this.name = 'ApiError';
        this.response = response;
        this.data = data;
        this.statusCode = statusCode || (response ? response.status : undefined);
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

/**
 * Custom error class for validation issues.
 * @augments Error
 */
export class ValidationError extends Error {
    /**
     * Creates an instance of ValidationError.
     * @param {string} message - The validation error message.
     * @param {Array<object>} [errors] - An array of detailed validation errors.
     */
    constructor(message, errors = []) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Custom error class for compliance-related issues.
 * @augments Error
 */
export class ComplianceError extends Error {
    /**
     * Creates an instance of ComplianceError.
     * @param {string} message - The compliance error message.
     * @param {object} [details] - Additional compliance details or reasons.
     */
    constructor(message, details = {}) {
        super(message);
        this.name = 'ComplianceError';
        this.details = details;
        Object.setPrototypeOf(this, ComplianceError.prototype);
    }
}

/**
 * Placeholder for Gemini-infused core functionalities.
 * This object is designed to be the central hub for all Gemini platform interactions,
 * encapsulating various services like form management, state, API, GraphQL, AI, and more.
 * @namespace gemini
 */
export const gemini = {
    /**
     * Global configuration for the Gemini platform.
     */
    config: geminiConfig,

    /**
     * Simple in-memory cache for frequently accessed data.
     * @namespace gemini.cache
     */
    cache: {
        _cache: new Map(),
        /**
         * Stores data in the cache with an optional expiration time.
         * @param {string} key - The cache key.
         * @param {*} value - The data to store.
         * @param {number} [ttl=geminiConfig.cacheExpirationMs] - Time to live in milliseconds.
         */
        set: (key, value, ttl = geminiConfig.cacheExpirationMs) => {
            gemini.logger.debug(`Caching key: ${key} with TTL: ${ttl}ms`);
            const expirationTime = Date.now() + ttl;
            gemini.cache._cache.set(key, { value, expirationTime });
        },
        /**
         * Retrieves data from the cache. Returns null if expired or not found.
         * @param {string} key - The cache key.
         * @returns {*} Cached data or null.
         */
        get: (key) => {
            const item = gemini.cache._cache.get(key);
            if (!item) {
                gemini.logger.debug(`Cache miss for key: ${key}`);
                return null;
            }
            if (Date.now() > item.expirationTime) {
                gemini.logger.debug(`Cache expired for key: ${key}`);
                gemini.cache._cache.delete(key);
                return null;
            }
            gemini.logger.debug(`Cache hit for key: ${key}`);
            return item.value;
        },
        /**
         * Invalidates a specific cache entry.
         * @param {string} key - The cache key to invalidate.
         */
        invalidate: (key) => {
            gemini.logger.debug(`Invalidating cache for key: ${key}`);
            gemini.cache._cache.delete(key);
        },
        /**
         * Clears all entries from the cache.
         */
        clear: () => {
            gemini.logger.debug("Clearing entire cache.");
            gemini.cache._cache.clear();
        }
    },

    /**
     * A simple event bus for publishing and subscribing to application-wide events.
     * @namespace gemini.events
     */
    events: {
        _listeners: {},
        /**
         * Subscribes a listener function to a specific event type.
         * @param {string} eventType - The type of event to listen for.
         * @param {Function} listener - The function to call when the event is dispatched.
         * @returns {Function} An unsubscribe function.
         */
        on: (eventType, listener) => {
            if (!gemini.events._listeners[eventType]) {
                gemini.events._listeners[eventType] = [];
            }
            gemini.events._listeners[eventType].push(listener);
            gemini.logger.debug(`Subscribed to event: ${eventType}`);
            return () => gemini.events.off(eventType, listener); // Return unsubscribe function
        },
        /**
         * Unsubscribes a listener function from a specific event type.
         * @param {string} eventType - The type of event.
         * @param {Function} listener - The function to remove.
         */
        off: (eventType, listener) => {
            if (gemini.events._listeners[eventType]) {
                gemini.events._listeners[eventType] = gemini.events._listeners[eventType].filter(
                    (l) => l !== listener
                );
                gemini.logger.debug(`Unsubscribed from event: ${eventType}`);
            }
        },
        /**
         * Dispatches an event with associated data to all registered listeners.
         * @param {string} eventType - The type of event to dispatch.
         * @param {object} [data={}] - The data to pass to the listeners.
         */
        dispatch: (eventType, data = {}) => {
            gemini.logger.info(`Dispatching event: ${eventType}`, data);
            if (gemini.events._listeners[eventType]) {
                gemini.events._listeners[eventType].forEach((listener) => {
                    try {
                        listener(data);
                    } catch (error) {
                        gemini.logger.error(`Error in event listener for ${eventType}:`, error);
                    }
                });
            }
        },
    },

    /**
     * A simple logging utility with different levels.
     * @namespace gemini.logger
     */
    logger: {
        _logLevel: "info", // Can be 'debug', 'info', 'warn', 'error'
        _levels: { debug: 0, info: 1, warn: 2, error: 3 },

        /**
         * Sets the current logging level.
         * @param {'debug'|'info'|'warn'|'error'} level - The desired logging level.
         */
        setLevel: (level) => {
            if (Object.keys(gemini.logger._levels).includes(level)) {
                gemini.logger._logLevel = level;
            } else {
                console.warn(`Invalid log level: ${level}. Keeping current level.`);
            }
        },

        _shouldLog: (level) => gemini.logger._levels[level] >= gemini.logger._levels[gemini.logger._logLevel],

        debug: (...args) => gemini.logger._shouldLog('debug') && console.debug(`[DEBUG] ${new Date().toISOString()}`, ...args),
        info: (...args) => gemini.logger._shouldLog('info') && console.info(`[INFO] ${new Date().toISOString()}`, ...args),
        warn: (...args) => gemini.logger._shouldLog('warn') && console.warn(`[WARN] ${new Date().toISOString()}`, ...args),
        error: (...args) => gemini.logger._shouldLog('error') && console.error(`[ERROR] ${new Date().toISOString()}`, ...args),
        /**
         * Logs an error and dispatches a global error event.
         * @param {string} message - The error message.
         * @param {Error|ApiError|ValidationError|ComplianceError} error - The error object.
         * @param {object} [context] - Additional context for the error.
         */
        logErrorAndDispatch: (message, error, context = {}) => {
            gemini.logger.error(message, error, context);
            gemini.events.dispatch(CounterpartyEventTypes.COUNTERPARTY_ERROR, { message, error, context });
        }
    },

    /**
     * Placeholder for Security related functionalities.
     * @namespace gemini.security
     */
    security: {
        /**
         * Simulates getting an authentication token.
         * @returns {string} A placeholder token.
         */
        getAuthToken: () => {
            // In a real application, this would fetch from a secure storage or auth service.
            return "bearer_GEMINI_SECURE_AUTH_TOKEN_12345";
        },
        /**
         * Simulates refreshing an authentication token.
         * @returns {Promise<string>} A promise that resolves with a new token.
         */
        refreshToken: async () => {
            gemini.logger.info("Attempting to refresh authentication token...");
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            const newToken = "bearer_GEMINI_REFRESHED_AUTH_TOKEN_67890";
            gemini.logger.info("Token refreshed successfully.");
            return newToken;
        },
        /**
         * Checks if the current token is expired or needs refresh.
         * @returns {boolean} True if token needs refresh, false otherwise.
         */
        isTokenExpired: () => {
            // In a real system, this would decode the JWT and check expiration.
            // For demo, simulate occasional expiry.
            return Math.random() > 0.95; // 5% chance of being expired
        },
        /**
         * Applies common security headers to request options.
         * @param {RequestInit} options - The fetch request options.
         * @returns {Promise<RequestInit>} Updated options with security headers.
         */
        applySecurityHeaders: async (options) => {
            const newOptions = { ...options };
            if (!newOptions.headers) {
                newOptions.headers = {};
            }
            if (gemini.security.isTokenExpired()) {
                await gemini.security.refreshToken();
            }
            // Ensure Authorization header is always present for API calls
            newOptions.headers['Authorization'] = gemini.security.getAuthToken();
            return newOptions;
        }
    },

    /**
     * Placeholder for AI/ML powered functionalities using Gemini models.
     * These functions simulate calls to an AI backend.
     * @namespace gemini.ai
     */
    ai: {
        /**
         * Simulates an AI service call to analyze counterparty risk.
         * @param {object} counterpartyData - Data about the counterparty.
         * @returns {Promise<object>} A promise resolving to a risk score and detailed report.
         */
        analyzeRiskProfile: async (counterpartyData) => {
            if (!gemini.config.featureFlags.enableAiRiskAssessment) {
                gemini.logger.warn("AI Risk Assessment is disabled by feature flag.");
                return { score: 0, severity: "Low", report: "AI assessment disabled." };
            }
            gemini.logger.info("Calling Gemini AI to analyze risk profile...", counterpartyData.id);
            try {
                const response = await gemini.api.request(
                    `${gemini.config.aiApiBaseUrl}/risk-assessment`,
                    "POST",
                    { counterpartyId: counterpartyData.id, data: counterpartyData }
                );
                const result = await response.json();
                gemini.logger.debug("AI Risk Analysis Result:", result);
                return result; // Expected format: { score: number, severity: string, report: string, recommendations: [] }
            } catch (error) {
                gemini.logger.error("Failed to analyze risk profile with AI:", error);
                throw new Error("AI Risk Analysis failed.");
            }
        },

        /**
         * Simulates an AI service call to process a document (OCR, entity extraction, PII detection).
         * @param {File} documentFile - The file to process.
         * @param {string} entityId - The ID of the associated entity (e.g., Counterparty ID).
         * @param {string} entityType - The type of the associated entity (e.g., "Counterparty").
         * @returns {Promise<object>} A promise resolving to extracted data, PII status, etc.
         */
        processDocumentWithAI: async (documentFile, entityId, entityType) => {
            if (!gemini.config.featureFlags.enableDocumentAiExtraction) {
                gemini.logger.warn("AI Document Extraction is disabled by feature flag.");
                return { extractedData: {}, piiDetected: false, summary: "AI extraction disabled." };
            }
            gemini.logger.info(`Calling Gemini AI to process document for ${entityType} ${entityId}...`, documentFile.name);
            const formData = new FormData();
            formData.append("file", documentFile);
            formData.append("entityId", entityId);
            formData.append("entityType", entityType);
            formData.append("language", gemini.config.defaultAiLanguage);

            try {
                const response = await gemini.api.request(
                    `${gemini.config.aiApiBaseUrl}/document-processor`,
                    "POST",
                    formData,
                    "multipart/form-data"
                );
                const result = await response.json();
                gemini.logger.debug("AI Document Processing Result:", result);
                return result; // Expected format: { extractedData: {}, piiDetected: boolean, summary: string, documentType: string }
            } catch (error) {
                gemini.logger.error("Failed to process document with AI:", error);
                throw new Error("AI Document Processing failed.");
            }
        },

        /**
         * Simulates an AI service call to generate personalized notification content.
         * @param {string} templateId - Identifier for the notification template.
         * @param {object} data - Data to personalize the template (e.g., counterparty name, details).
         * @returns {Promise<object>} A promise resolving to generated subject and body.
         */
        generateNotificationContent: async (templateId, data) => {
            gemini.logger.info(`Calling Gemini AI to generate notification content for template ${templateId}...`);
            try {
                const response = await gemini.api.request(
                    `${gemini.config.aiApiBaseUrl}/notification-generator`,
                    "POST",
                    { templateId, data, language: gemini.config.defaultAiLanguage }
                );
                const result = await response.json();
                gemini.logger.debug("AI Notification Generation Result:", result);
                return result; // Expected format: { subject: string, body: string, language: string }
            } catch (error) {
                gemini.logger.error("Failed to generate notification content with AI:", error);
                throw new Error("AI Notification Generation failed.");
            }
        },

        /**
         * Simulates an AI service call to detect anomalies in counterparty data or activity.
         * @param {string} counterpartyId - The ID of the counterparty.
         * @param {object} [historicalData={}] - Historical data for anomaly detection.
         * @returns {Promise<object>} An object indicating if anomalies were detected and details.
         */
        detectAnomalies: async (counterpartyId, historicalData = {}) => {
            gemini.logger.info(`Calling Gemini AI for anomaly detection for counterparty ${counterpartyId}...`);
            try {
                const response = await gemini.api.request(
                    `${gemini.config.aiApiBaseUrl}/anomaly-detector`,
                    "POST",
                    { counterpartyId, historicalData }
                );
                const result = await response.json();
                gemini.logger.debug("AI Anomaly Detection Result:", result);
                return result; // Expected format: { detected: boolean, anomalies: [], severity: string }
            } catch (error) {
                gemini.logger.error("AI Anomaly Detection failed:", error);
                throw new Error("AI Anomaly Detection failed.");
            }
        },

        /**
         * Simulates an AI service call to suggest improvements or missing data points for a counterparty.
         * @param {object} counterpartyData - The current counterparty data.
         * @returns {Promise<object>} A list of suggested improvements.
         */
        suggestImprovements: async (counterpartyData) => {
            gemini.logger.info(`Calling Gemini AI for data improvement suggestions for counterparty ${counterpartyData.id}...`);
            try {
                const response = await gemini.api.request(
                    `${gemini.config.aiApiBaseUrl}/data-suggestions`,
                    "POST",
                    { counterpartyId: counterpartyData.id, currentData: counterpartyData }
                );
                const result = await response.json();
                gemini.logger.debug("AI Suggestions Result:", result);
                return result; // Expected format: { suggestions: [{ field: string, reason: string, suggestedValue: any }] }
            } catch (error) {
                gemini.logger.error("AI data suggestion failed:", error);
                throw new Error("AI data suggestion failed.");
            }
        }
    },

    /**
     * Form management utilities.
     * Mimics Redux-form dispatch actions for starting and stopping form submissions.
     * @namespace gemini.form
     */
    form: {
        /**
         * Simulates the start of a form submission.
         * @param {string} formName The name of the form.
         */
        startSubmit: (formName) => {
            gemini.logger.info(`Gemini Form: '${formName}' submission started.`);
            gemini.events.dispatch(`FORM_SUBMIT_START_${formName.toUpperCase()}`, { formName, submitting: true });
        },
        /**
         * Simulates the stop of a form submission.
         * @param {string} formName The name of the form.
         */
        stopSubmit: (formName) => {
            gemini.logger.info(`Gemini Form: '${formName}' submission stopped.`);
            gemini.events.dispatch(`FORM_SUBMIT_STOP_${formName.toUpperCase()}`, { formName, submitting: false });
        },
    },

    /**
     * State management for counterparties.
     * Mimics Redux Toolkit slice actions for updating counterparty data.
     * @namespace gemini.state
     */
    state: {
        counterparties: {
            /**
             * Simulates setting a single counterparty in global state.
             * Dispatches a state update event.
             * @param {object} counterparty The counterparty object to set.
             */
            setOne: (counterparty) => {
                gemini.logger.info("Gemini State: Counterparty updated (setOne) for ID:", counterparty.id);
                gemini.events.dispatch(CounterpartyEventTypes.COUNTERPARTY_UPDATED, { counterparty, type: "setOne" });
                gemini.cache.set(`counterparty:${counterparty.id}`, counterparty);
            },
            /**
             * Simulates updating specific fields of a counterparty in global state.
             * Dispatches a state update event.
             * @param {object} payload Contains `id` and `changes` to apply.
             */
            updateOne: ({ id, changes }) => {
                gemini.logger.info("Gemini State: Counterparty updated (updateOne) for ID:", id, "changes:", changes);
                gemini.events.dispatch(CounterpartyEventTypes.COUNTERPARTY_UPDATED, { id, changes, type: "updateOne" });
                // Invalidate cache for detailed update; full object might need re-fetch or merge logic
                gemini.cache.invalidate(`counterparty:${id}`);
            },
            /**
             * Simulates removing a counterparty from state, typically after archival/deletion.
             * @param {string} id - The ID of the counterparty to remove.
             */
            removeOne: (id) => {
                gemini.logger.info("Gemini State: Counterparty removed from state for ID:", id);
                gemini.events.dispatch(CounterpartyEventTypes.COUNTERPARTY_ARCHIVED, { id, type: "removeOne" });
                gemini.cache.invalidate(`counterparty:${id}`);
            },
        },
    },

    /**
     * API request utilities using native `fetch`.
     * Replaces external API request libraries. Includes retry logic.
     * @namespace gemini.api
     */
    api: {
        /**
         * Generic API request handler with retry logic and security headers.
         * @param {string} url - The endpoint URL.
         * @param {string} method - The HTTP method (e.g., "GET", "POST", "DELETE").
         * @param {*} [data=null] - The request body data.
         * @param {string} [contentType="application/json"] - The Content-Type header.
         * @returns {Promise<Response>} The raw `fetch` response object.
         * @throws {ApiError} If the network request fails or the response is not `ok`.
         */
        request: async (url, method, data = null, contentType = "application/json") => {
            let attempts = 0;
            while (attempts < gemini.config.maxApiRetries) {
                try {
                    let options = {
                        method: method,
                    };

                    if (contentType === "application/json" && data !== null) {
                        options.headers = { "Content-Type": "application/json" };
                        options.body = JSON.stringify(data);
                    } else if (contentType === "multipart/form-data" && data instanceof FormData) {
                        options.body = data;
                    } else if (data !== null) {
                        options.body = data;
                    }

                    // Apply security headers (Authorization token, etc.)
                    options = await gemini.security.applySecurityHeaders(options);

                    const response = await fetch(url, options);

                    if (!response.ok) {
                        let errorBody = {};
                        const responseText = await response.text();
                        try {
                            errorBody = JSON.parse(responseText);
                        } catch (e) {
                            errorBody = { message: responseText || 'Unknown API error', rawResponse: responseText };
                        }
                        const errorMessage = errorBody.message || `API request failed with status ${response.status}`;

                        // Check for transient errors to retry
                        if (response.status >= 500 && response.status < 600 && attempts < gemini.config.maxApiRetries - 1) {
                            gemini.logger.warn(`Retrying API call to ${url} due to server error (${response.status}). Attempt ${attempts + 1}/${gemini.config.maxApiRetries}`);
                            await new Promise(resolve => setTimeout(resolve, gemini.config.apiRetryDelayMs * (2 ** attempts))); // Exponential backoff
                            attempts++;
                            continue; // Retry the request
                        }

                        const error = new ApiError(errorMessage, { response, data: errorBody, statusCode: response.status });
                        throw error;
                    }
                    return response;
                } catch (error) {
                    if (error instanceof ApiError && error.statusCode >= 500 && error.statusCode < 600 && attempts < gemini.config.maxApiRetries - 1) {
                        // Already handled retry logic in the `if (!response.ok)` block.
                        // This catch block is for network errors (e.g., no internet connection).
                        gemini.logger.warn(`Retrying API call to ${url} due to network error. Attempt ${attempts + 1}/${gemini.config.maxApiRetries}`, error);
                        await new Promise(resolve => setTimeout(resolve, gemini.config.apiRetryDelayMs * (2 ** attempts)));
                        attempts++;
                        continue;
                    }
                    gemini.logger.error("Gemini API request failed:", error);
                    throw error;
                }
            }
            throw new ApiError(`API request to ${url} failed after ${gemini.config.maxApiRetries} attempts.`);
        },
    },

    /**
     * GraphQL utilities.
     * Replaces Apollo Client or similar GraphQL libraries for mutations and queries.
     * @namespace gemini.graphql
     */
    graphql: {
        /**
         * Performs a GraphQL mutation or query.
         * @param {string} query - The GraphQL query or mutation string.
         * @param {object} [variables={}] - The variables for the mutation/query.
         * @param {string} [operationName] - Optional operation name for complex GraphQL documents.
         * @returns {Promise<object>} The `data` field from the GraphQL response, or an error structure if GraphQL errors are present.
         * @throws {ApiError} For network errors or parsing errors.
         */
        request: async (query, variables = {}, operationName) => {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables,
                    operationName: operationName,
                }),
            };

            try {
                // Use Gemini's generic API request for consistency, which includes retries and auth.
                const response = await gemini.api.request(gemini.config.graphqlEndpoint, "POST", options.body, "application/json");
                const result = await response.json();

                if (result.errors) {
                    const errorMessages = result.errors.map(err => err.message || "GraphQL Error");
                    gemini.logger.error("GraphQL operation returned errors:", result.errors);
                    // Standardize GraphQL error output to match expected `upsertCounterparty` structure
                    // This is a specific adaptation for the `submitCounterparty` action's error handling.
                    if (operationName === "UpsertCounterparty") {
                        return {
                            upsertCounterparty: {
                                counterparty: null,
                                errors: result.errors,
                            }
                        };
                    }
                    throw new ApiError("GraphQL operation failed with errors.", { data: result.errors });
                }
                return result.data;
            } catch (error) {
                gemini.logger.error("GraphQL request failed:", error);
                throw error; // Re-throw the ApiError from gemini.api.request or new error for GraphQL parsing
            }
        },
        /**
         * Performs a GraphQL mutation. Wrapper around `gemini.graphql.request`.
         * @param {string} query The GraphQL mutation string.
         * @param {object} variables The variables for the mutation.
         * @param {string} [operationName] - Optional operation name.
         * @returns {Promise<object>} The `data` field from the GraphQL response.
         * @throws {ApiError} For network errors or parsing errors.
         */
        mutate: async (query, variables, operationName) => {
            return gemini.graphql.request(query, variables, operationName);
        },
        /**
         * Performs a GraphQL query. Wrapper around `gemini.graphql.request`.
         * @param {string} query The GraphQL query string.
         * @param {object} variables The variables for the query.
         * @param {string} [operationName] - Optional operation name.
         * @returns {Promise<object>} The `data` field from the GraphQL response.
         * @throws {ApiError} For network errors or parsing errors.
         */
        query: async (query, variables, operationName) => {
            return gemini.graphql.request(query, variables, operationName);
        }
    },

    /**
     * Placeholder for telemetry and analytics.
     * @namespace gemini.telemetry
     */
    telemetry: {
        /**
         * Tracks a specific event with properties.
         * @param {string} eventName - The name of the event.
         * @param {object} [properties={}] - Properties associated with the event.
         */
        trackEvent: (eventName, properties = {}) => {
            gemini.logger.debug(`Telemetry: Event '${eventName}' tracked.`, properties);
            // In a real system, send to an analytics service (e.g., Google Analytics, Segment)
        },
        /**
         * Tracks an error occurrence.
         * @param {Error} error - The error object.
         * @param {object} [context={}] - Additional context for the error.
         */
        trackError: (error, context = {}) => {
            gemini.logger.debug(`Telemetry: Error tracked.`, error, context);
            // In a real system, send to an error tracking service (e.g., Sentry, Bugsnag)
        },
    },

    /**
     * Common validation utilities for various data structures.
     * @namespace gemini.validation
     */
    validation: {
        /**
         * Validates a counterparty object against a predefined schema.
         * @param {object} counterparty - The counterparty data to validate.
         * @returns {object} An object containing `isValid` boolean and `errors` array.
         */
        validateCounterpartySchema: (counterparty) => {
            const errors = [];
            if (isEmpty(counterparty.name) || typeof counterparty.name !== 'string' || counterparty.name.length < 2) {
                errors.push({ field: 'name', message: 'Counterparty name is required and must be at least 2 characters.' });
            }
            if (counterparty.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(counterparty.email)) {
                errors.push({ field: 'email', message: 'Invalid email format.' });
            }
            // Add more complex validation rules as needed
            if (counterparty.taxpayerIdentifier && !/^\d{9}$/.test(counterparty.taxpayerIdentifier)) {
                 errors.push({ field: 'taxpayerIdentifier', message: 'Taxpayer identifier must be 9 digits.' });
            }
            if (counterparty.accounts) {
                counterparty.accounts.forEach((account, index) => {
                    if (isEmpty(account.accountNumber)) {
                        errors.push({ field: `accounts[${index}].accountNumber`, message: 'Account number is required.' });
                    }
                    if (isEmpty(account.accountType)) {
                        errors.push({ field: `accounts[${index}].accountType`, message: 'Account type is required.' });
                    }
                });
            }

            return { isValid: errors.length === 0, errors };
        },

        /**
         * Validates an external account object.
         * @param {object} account - The account data to validate.
         * @returns {object} An object containing `isValid` boolean and `errors` array.
         */
        validateExternalAccountSchema: (account) => {
            const errors = [];
            if (isEmpty(account.accountNumber)) {
                errors.push({ field: 'accountNumber', message: 'Account number cannot be empty.' });
            }
            if (isEmpty(account.accountType)) {
                errors.push({ field: 'accountType', message: 'Account type cannot be empty.' });
            }
            // Add more specific validations based on accountType or country specific routing numbers
            return { isValid: errors.length === 0, errors };
        }
    },
};

/**
 * Service class dedicated to managing documents associated with various entities.
 * Utilizes `gemini.api` for uploads and `gemini.ai` for advanced processing.
 */
export class DocumentManagementService {
    constructor() {
        this.documentApiBaseUrl = gemini.config.documentApiBaseUrl;
        gemini.logger.info("DocumentManagementService initialized.");
    }

    /**
     * Uploads multiple documents associated with an entity.
     * Integrates with Gemini AI for document processing if enabled.
     * @param {string} entityId - The ID of the entity (e.g., Counterparty ID).
     * @param {string} entityType - The type of the entity (e.g., "Counterparty").
     * @param {Array<object>} pendingDocuments - An array of document objects to upload.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of failed document uploads.
     */
    async uploadDocuments(entityId, entityType, pendingDocuments) {
        if (!pendingDocuments || pendingDocuments.length === 0) {
            gemini.logger.info(`No documents to upload for ${entityType} ${entityId}.`);
            return [];
        }

        const failures = [];
        for (const doc of pendingDocuments) {
            if (!doc.file) {
                gemini.logger.warn(`Skipping document without a file property:`, doc);
                failures.push({ document: doc.name || "unknown", error: "Missing file object." });
                continue;
            }

            const formData = new FormData();
            formData.append("file", doc.file);
            formData.append("entity_id", entityId);
            formData.append("entity_type", entityType);
            formData.append("name", doc.name || doc.file.name); // Ensure name is always present

            if (doc.metadata) {
                formData.append("metadata", JSON.stringify(doc.metadata));
            }
            if (doc.type) {
                formData.append("type", doc.type);
            }

            try {
                gemini.logger.debug(`Attempting to upload document '${doc.name || doc.file.name}' for ${entityType} ${entityId}.`);
                const response = await gemini.api.request(`${this.documentApiBaseUrl}/upload`, "POST", formData, "multipart/form-data");
                const uploadedDoc = await response.json();
                gemini.logger.info(`Document '${uploadedDoc.name}' uploaded successfully. Document ID: ${uploadedDoc.id}`);
                gemini.events.dispatch(CounterpartyEventTypes.DOCUMENT_UPLOADED, { entityId, entityType, document: uploadedDoc });

                // Integrate AI processing post-upload
                if (gemini.config.featureFlags.enableDocumentAiExtraction) {
                    try {
                        const aiResult = await gemini.ai.processDocumentWithAI(doc.file, entityId, entityType);
                        gemini.logger.info(`AI processed document '${uploadedDoc.name}':`, aiResult);
                        // Potentially update document metadata with AI extracted data
                        await this.updateDocumentMetadata(uploadedDoc.id, {
                            ai_extracted_data: aiResult.extractedData,
                            pii_detected: aiResult.piiDetected,
                            ai_summary: aiResult.summary,
                            ai_document_type: aiResult.documentType,
                        });
                    } catch (aiError) {
                        gemini.logger.error(`AI processing failed for document '${uploadedDoc.name}':`, aiError);
                        failures.push({ document: doc.name || doc.file.name, error: `Upload successful, but AI processing failed: ${aiError.message}` });
                    }
                }

            } catch (error) {
                let errorMessage = "Unknown upload error";
                if (error instanceof ApiError && error.data && error.data.message) {
                    errorMessage = error.data.message;
                } else if (error.message) {
                    errorMessage = error.message;
                }
                gemini.logger.error(`Failed to upload document '${doc.name || doc.file.name}':`, error);
                failures.push({ document: doc.name || doc.file.name, error: errorMessage });
                gemini.telemetry.trackError(error, { operation: "uploadDocuments", entityId, entityType, documentName: doc.name });
            }
        }
        return failures;
    }

    /**
     * Retrieves all documents associated with a specific entity.
     * @param {string} entityId - The ID of the entity.
     * @param {string} entityType - The type of the entity.
     * @returns {Promise<Array<object>>} A promise resolving to an array of document objects.
     * @throws {ApiError} If the API request fails.
     */
    async getDocumentsForEntity(entityId, entityType) {
        gemini.logger.debug(`Fetching documents for ${entityType} ${entityId}.`);
        try {
            const response = await gemini.api.request(`${this.documentApiBaseUrl}/entity/${entityId}/${entityType}`, "GET");
            const documents = await response.json();
            gemini.logger.info(`Successfully fetched ${documents.length} documents for ${entityType} ${entityId}.`);
            return documents;
        } catch (error) {
            gemini.logger.error(`Failed to fetch documents for ${entityType} ${entityId}:`, error);
            gemini.telemetry.trackError(error, { operation: "getDocumentsForEntity", entityId, entityType });
            throw error;
        }
    }

    /**
     * Updates metadata for a specific document.
     * @param {string} documentId - The ID of the document.
     * @param {object} metadataChanges - The metadata fields to update.
     * @returns {Promise<object>} The updated document object.
     * @throws {ApiError} If the API request fails.
     */
    async updateDocumentMetadata(documentId, metadataChanges) {
        gemini.logger.debug(`Updating metadata for document ${documentId}.`, metadataChanges);
        try {
            const response = await gemini.api.request(`${this.documentApiBaseUrl}/${documentId}/metadata`, "PATCH", metadataChanges);
            const updatedDocument = await response.json();
            gemini.logger.info(`Metadata updated for document ${documentId}.`);
            return updatedDocument;
        } catch (error) {
            gemini.logger.error(`Failed to update metadata for document ${documentId}:`, error);
            gemini.telemetry.trackError(error, { operation: "updateDocumentMetadata", documentId });
            throw error;
        }
    }

    /**
     * Deletes a specific document.
     * @param {string} documentId - The ID of the document to delete.
     * @returns {Promise<object>} Confirmation of deletion.
     * @throws {ApiError} If the API request fails.
     */
    async deleteDocument(documentId) {
        gemini.logger.warn(`Attempting to delete document ${documentId}.`);
        try {
            const response = await gemini.api.request(`${this.documentApiBaseUrl}/${documentId}`, "DELETE");
            const confirmation = await response.json();
            gemini.logger.info(`Document ${documentId} deleted successfully.`);
            return confirmation;
        } catch (error) {
            gemini.logger.error(`Failed to delete document ${documentId}:`, error);
            gemini.telemetry.trackError(error, { operation: "deleteDocument", documentId });
            throw error;
        }
    }
}
export const documentManagementService = new DocumentManagementService();

/**
 * Service class responsible for managing counterparty-related compliance workflows and risk assessments.
 * Integrates with `gemini.ai` for intelligent risk analysis.
 */
export class ComplianceService {
    constructor() {
        this.complianceApiBaseUrl = `${gemini.config.counterpartyApiBaseUrl}/compliance`;
        gemini.logger.info("ComplianceService initialized.");
    }

    /**
     * Initiates a compliance review for a specific counterparty.
     * @param {string} counterpartyId - The ID of the counterparty.
     * @param {string} reviewType - The type of compliance review (e.g., "KYC", "AML", "Risk").
     * @param {object} [reviewData={}] - Additional data for the review.
     * @returns {Promise<object>} The compliance review record.
     * @throws {ApiError} If the API request fails.
     * @throws {ComplianceError} If compliance conditions are not met.
     */
    async initiateComplianceReview(counterpartyId, reviewType, reviewData = {}) {
        gemini.logger.info(`Initiating '${reviewType}' compliance review for counterparty ${counterpartyId}.`);
        try {
            // First, perform AI risk assessment if enabled
            let riskAssessment = { score: 0, severity: "Low", report: "N/A" };
            if (gemini.config.featureFlags.enableAiRiskAssessment) {
                const counterpartyData = gemini.cache.get(`counterparty:${counterpartyId}`) || {}; // Attempt to get from cache
                riskAssessment = await gemini.ai.analyzeRiskProfile({ id: counterpartyId, ...counterpartyData });
                gemini.logger.debug(`AI Risk Assessment for ${counterpartyId}:`, riskAssessment);

                if (riskAssessment.severity === "High") {
                    throw new ComplianceError(`High risk detected for counterparty ${counterpartyId}. Review required.`, riskAssessment);
                }
            }

            const response = await gemini.api.request(
                `${this.complianceApiBaseUrl}/${counterpartyId}/review`,
                "POST",
                { reviewType, reviewData, riskAssessment }
            );
            const reviewRecord = await response.json();
            gemini.logger.info(`Compliance review '${reviewType}' initiated for ${counterpartyId}. Status: ${reviewRecord.status}`);
            gemini.events.dispatch(CounterpartyEventTypes.COMPLIANCE_STATUS_UPDATED, { counterpartyId, reviewType, status: reviewRecord.status, riskAssessment });
            return reviewRecord;
        } catch (error) {
            gemini.logger.error(`Failed to initiate compliance review for ${counterpartyId}:`, error);
            gemini.telemetry.trackError(error, { operation: "initiateComplianceReview", counterpartyId, reviewType });
            if (error instanceof ComplianceError) {
                throw error;
            }
            throw new ComplianceError("Failed to initiate compliance review.", { originalError: error });
        }
    }

    /**
     * Fetches the current compliance status and history for a counterparty.
     * @param {string} counterpartyId - The ID of the counterparty.
     * @returns {Promise<object>} An object containing current status and review history.
     * @throws {ApiError} If the API request fails.
     */
    async getComplianceStatus(counterpartyId) {
        gemini.logger.debug(`Fetching compliance status for counterparty ${counterpartyId}.`);
        try {
            const response = await gemini.api.request(`${this.complianceApiBaseUrl}/${counterpartyId}/status`, "GET");
            const status = await response.json();
            gemini.logger.info(`Compliance status fetched for ${counterpartyId}. Current status: ${status.overallStatus}`);
            return status;
        } catch (error) {
            gemini.logger.error(`Failed to fetch compliance status for ${counterpartyId}:`, error);
            gemini.telemetry.trackError(error, { operation: "getComplianceStatus", counterpartyId });
            throw error;
        }
    }
}
export const complianceService = new ComplianceService();

/**
 * Service class for sending various types of notifications.
 * Leverages `gemini.ai` for smart content generation.
 */
export class NotificationService {
    constructor() {
        this.notificationApiBaseUrl = gemini.config.notificationApiBaseUrl;
        gemini.logger.info("NotificationService initialized.");
    }

    /**
     * Sends an email notification.
     * @param {string} recipientEmail - The email address of the recipient.
     * @param {string} subject - The subject of the email.
     * @param {string} body - The HTML or plain text body of the email.
     * @param {object} [metadata={}] - Additional metadata for the notification.
     * @returns {Promise<object>} The notification dispatch confirmation.
     * @throws {ApiError} If the API request fails.
     */
    async sendEmail(recipientEmail, subject, body, metadata = {}) {
        gemini.logger.info(`Sending email to ${recipientEmail} with subject: '${subject}'.`);
        try {
            const response = await gemini.api.request(
                `${this.notificationApiBaseUrl}/email`,
                "POST",
                { recipientEmail, subject, body, metadata }
            );
            const confirmation = await response.json();
            gemini.logger.info(`Email sent successfully to ${recipientEmail}.`);
            gemini.telemetry.trackEvent("EmailSent", { recipientEmail, subject, ...metadata });
            return confirmation;
        } catch (error) {
            gemini.logger.error(`Failed to send email to ${recipientEmail}:`, error);
            gemini.telemetry.trackError(error, { operation: "sendEmail", recipientEmail, subject });
            throw error;
        }
    }

    /**
     * Sends a system alert notification (e.g., to internal dashboards or messaging systems).
     * @param {string} message - The alert message.
     * @param {'info'|'warning'|'error'|'critical'} severity - The severity level of the alert.
     * @param {object} [context={}] - Additional context for the alert.
     * @returns {Promise<object>} The alert dispatch confirmation.
     * @throws {ApiError} If the API request fails.
     */
    async sendSystemAlert(message, severity, context = {}) {
        gemini.logger.warn(`Sending system alert: [${severity.toUpperCase()}] ${message}`);
        try {
            const response = await gemini.api.request(
                `${this.notificationApiBaseUrl}/alert`,
                "POST",
                { message, severity, context }
            );
            const confirmation = await response.json();
            gemini.logger.info(`System alert sent successfully.`);
            gemini.telemetry.trackEvent("SystemAlertSent", { message, severity, ...context });
            return confirmation;
        } catch (error) {
            gemini.logger.error(`Failed to send system alert:`, error);
            gemini.telemetry.trackError(error, { operation: "sendSystemAlert", message, severity });
            throw error;
        }
    }

    /**
     * Dispatches a notification using an AI-generated personalized message.
     * @param {string} templateId - The ID of the template to use for AI generation.
     * @param {object} recipientDetails - Details about the recipient (e.g., email, ID).
     * @param {object} contentData - Data to feed into the AI for content generation.
     * @param {string} notificationType - The type of notification (e.g., "email", "sms", "in-app").
     * @returns {Promise<object>} Confirmation of the dispatched notification.
     * @throws {Error} If AI generation or sending fails.
     */
    async dispatchAiGeneratedNotification(templateId, recipientDetails, contentData, notificationType = "email") {
        if (!gemini.config.featureFlags.enableRealtimeNotifications) {
            gemini.logger.warn("Realtime notifications disabled by feature flag. Skipping AI-generated notification.");
            return { status: "skipped", reason: "Feature disabled" };
        }

        gemini.logger.info(`Dispatching AI-generated ${notificationType} notification for template ${templateId} to ${recipientDetails.email || recipientDetails.id}.`);
        try {
            const { subject, body } = await gemini.ai.generateNotificationContent(templateId, contentData);

            if (notificationType === "email") {
                return this.sendEmail(recipientDetails.email, subject, body, { templateId, contentData, aiGenerated: true });
            }
            // Add other notification types (SMS, in-app) here if needed
            throw new Error(`Unsupported notification type: ${notificationType}`);
        } catch (error) {
            gemini.logger.error(`Failed to dispatch AI-generated notification:`, error);
            gemini.telemetry.trackError(error, { operation: "dispatchAiGeneratedNotification", templateId, recipient: recipientDetails.email || recipientDetails.id });
            throw error;
        }
    }
}
export const notificationService = new NotificationService();

/**
 * Service for recording significant changes and actions in an audit log.
 */
export class AuditLogService {
    constructor() {
        this.auditLogApiBaseUrl = "/api/v1/audit-logs";
        gemini.logger.info("AuditLogService initialized.");
    }

    /**
     * Records an audit event.
     * @param {string} entityType - The type of entity involved (e.g., "Counterparty", "Document").
     * @param {string} entityId - The ID of the entity.
     * @param {string} action - The action performed (e.g., "CREATE", "UPDATE", "ARCHIVE", "LOGIN").
     * @param {string} userId - The ID of the user performing the action.
     * @param {object} [details={}] - Additional details about the action (e.g., old/new values).
     * @returns {Promise<object>} The audit log record.
     * @throws {ApiError} If the API request fails.
     */
    async logEvent(entityType, entityId, action, userId, details = {}) {
        gemini.logger.debug(`Audit log: ${entityType} ${entityId} - ${action} by ${userId}.`);
        try {
            const response = await gemini.api.request(
                `${this.auditLogApiBaseUrl}`,
                "POST",
                { entityType, entityId, action, userId, details, timestamp: new Date().toISOString() }
            );
            return await response.json();
        } catch (error) {
            gemini.logger.error(`Failed to log audit event:`, error);
            // Don't rethrow, as audit logging failure shouldn't block primary operations normally
            gemini.telemetry.trackError(error, { operation: "logEvent", entityType, entityId, action });
            return { status: "failed", error: error.message };
        }
    }

    /**
     * Retrieves audit logs for a specific entity.
     * @param {string} entityType - The type of entity.
     * @param {string} entityId - The ID of the entity.
     * @returns {Promise<Array<object>>} An array of audit log records.
     * @throws {ApiError} If the API request fails.
     */
    async getLogsForEntity(entityType, entityId) {
        gemini.logger.debug(`Fetching audit logs for ${entityType} ${entityId}.`);
        try {
            const response = await gemini.api.request(`${this.auditLogApiBaseUrl}/${entityType}/${entityId}`, "GET");
            return await response.json();
        } catch (error) {
            gemini.logger.error(`Failed to fetch audit logs:`, error);
            gemini.telemetry.trackError(error, { operation: "getLogsForEntity", entityType, entityId });
            throw error;
        }
    }
}
export const auditLogService = new AuditLogService();

/**
 * High-level orchestration service for multi-step counterparty workflows.
 * Coordinates actions across other services like DocumentManagement, Compliance, and Notification.
 */
export class CounterpartyOrchestrator {
    constructor(
        _documentService = documentManagementService,
        _complianceService = complianceService,
        _notificationService = notificationService,
        _auditLogService = auditLogService
    ) {
        this.documentService = _documentService;
        this.complianceService = _complianceService;
        this.notificationService = _notificationService;
        this.auditLogService = _auditLogService;
        gemini.logger.info("CounterpartyOrchestrator initialized.");
    }

    /**
     * Executes the full workflow for creating or updating a counterparty,
     * including data validation, AI risk assessment, document uploads, and notifications.
     * @param {object} values - The raw form values for the counterparty.
     * @param {Array<object>} pendingDocuments - Documents to upload.
     * @param {Function} dispatchError - Error dispatch function from a higher level (e.g., Redux).
     * @param {string} [userId='system'] - The ID of the user performing the action.
     * @returns {Promise<object>} The resulting counterparty object from the successful operation.
     * @throws {Error} If any critical step in the orchestration fails.
     */
    async executeUpsertCounterpartyWorkflow(values, pendingDocuments, dispatchError, userId = 'system') {
        gemini.form.startSubmit("counterparty");
        gemini.logger.info(`Starting upsert counterparty workflow for ID: ${values.id || 'new'}.`);

        let returnedCounterparty = null;
        let actionType = values.id ? "UPDATE" : "CREATE";

        try {
            // Step 1: Client-side Validation
            const { isValid, errors: validationErrors } = gemini.validation.validateCounterpartySchema(values);
            if (!isValid) {
                const errorMessage = "Client-side validation failed. Please check your input.";
                gemini.logger.error(errorMessage, validationErrors);
                dispatchError(errorMessage);
                throw new ValidationError(errorMessage, validationErrors);
            }

            // Step 2: Prepare data for GraphQL mutation
            const accounts = values.accounts || null;
            const metadata = values.receiving_entity_metadata ? values.receiving_entity_metadata : null;
            const graphqlInput = {
                ...values,
                accounts,
                ...(metadata && { metadata }),
            };

            // Transform data for GraphQL API
            const transformedInput = transformCounterparty(graphqlInput);

            // Step 3: GraphQL Mutation to create/update counterparty
            gemini.logger.debug(`Sending GraphQL mutation for counterparty ${actionType}.`);
            const resultData = await gemini.graphql.mutate(UPSERT_COUNTERPARTY_MUTATION, {
                input: {
                    input: transformedInput
                }
            }, "UpsertCounterparty"); // Pass operation name

            const { upsertCounterparty: { counterparty: fetchedCounterparty, errors: graphqlErrors } } = resultData;

            if (graphqlErrors && graphqlErrors.length) {
                const errorMessages = graphqlErrors.map(err => err.message).join(", ");
                dispatchError(errorMessages);
                gemini.logger.error(`GraphQL errors during counterparty upsert:`, graphqlErrors);
                throw new ApiError("GraphQL mutation failed for counterparty.", { data: graphqlErrors });
            }

            returnedCounterparty = fetchedCounterparty;
            gemini.logger.info(`${actionType} counterparty successful. ID: ${returnedCounterparty.id}`);
            gemini.state.counterparties.setOne(returnedCounterparty); // Update global state
            gemini.cache.set(`counterparty:${returnedCounterparty.id}`, returnedCounterparty); // Update cache
            this.auditLogService.logEvent("Counterparty", returnedCounterparty.id, actionType, userId, { changes: values });
            gemini.telemetry.trackEvent(`${actionType}Counterparty`, { counterpartyId: returnedCounterparty.id });

            // Step 4: AI Risk Assessment
            try {
                const riskAssessment = await gemini.ai.analyzeRiskProfile(returnedCounterparty);
                gemini.logger.info(`Counterparty ${returnedCounterparty.id} AI risk assessment:`, riskAssessment);
                // Dispatch event or update counterparty with risk score
                gemini.events.dispatch(CounterpartyEventTypes.RISK_PROFILE_CHANGED, { counterpartyId: returnedCounterparty.id, riskAssessment });
                // Optionally update counterparty with risk score in state/DB if part of schema
            } catch (aiError) {
                gemini.logger.warn(`AI Risk Assessment failed for ${returnedCounterparty.id}, but workflow continues:`, aiError.message);
                dispatchError(`Warning: AI Risk Assessment failed: ${aiError.message}`);
            }

            // Step 5: Document Uploads
            if (pendingDocuments && pendingDocuments.length > 0) {
                gemini.logger.debug(`Processing ${pendingDocuments.length} pending documents.`);
                const documentUploadFailures = await this.documentService.uploadDocuments(
                    returnedCounterparty.id,
                    "Counterparty",
                    pendingDocuments
                );
                if (!isEmpty(documentUploadFailures)) {
                    gemini.logger.warn(`Document upload failures for counterparty ${returnedCounterparty.id}:`, documentUploadFailures);
                    dispatchError("Some documents failed to upload. Please check the logs.");
                    // Add details to telemetry or audit log
                    this.auditLogService.logEvent("Counterparty", returnedCounterparty.id, "DOCUMENT_UPLOAD_PARTIAL_FAILURE", userId, { failures: documentUploadFailures });
                }
            }

            // Step 6: Initiate Compliance Review (optional, based on risk/rules)
            try {
                await this.complianceService.initiateComplianceReview(returnedCounterparty.id, "KYC", { initiator: userId });
            } catch (complianceError) {
                gemini.logger.warn(`Compliance review initiation failed for ${returnedCounterparty.id}:`, complianceError.message);
                dispatchError(`Warning: Compliance review could not be initiated: ${complianceError.message}`);
            }

            // Step 7: Send internal notifications/alerts for critical events
            if (actionType === "CREATE") {
                this.notificationService.sendSystemAlert(`New Counterparty Created: ${returnedCounterparty.name} (${returnedCounterparty.id})`, "info", { counterpartyId: returnedCounterparty.id });
                this.notificationService.dispatchAiGeneratedNotification(
                    "new_counterparty_welcome",
                    { email: returnedCounterparty.email, id: returnedCounterparty.id },
                    { counterpartyName: returnedCounterparty.name, userId: userId }
                ).catch(err => gemini.logger.error("Failed to send welcome notification:", err));
            } else {
                this.notificationService.sendSystemAlert(`Counterparty Updated: ${returnedCounterparty.name} (${returnedCounterparty.id})`, "info", { counterpartyId: returnedCounterparty.id, changes: values });
            }

            return returnedCounterparty;

        } catch (error) {
            const errorMessage = error.message || "An unexpected error occurred during the counterparty workflow.";
            gemini.logger.logErrorAndDispatch(errorMessage, error, { operation: "upsertCounterpartyWorkflow", counterpartyId: values.id, action: actionType });
            dispatchError(errorMessage); // Ensure the UI receives an error message
            throw error; // Re-throw for further handling up the chain
        } finally {
            gemini.form.stopSubmit("counterparty");
        }
    }

    /**
     * Executes the workflow for collecting external account details from a counterparty.
     * @param {string} counterpartyId - The ID of the counterparty.
     * @param {object} invitationData - Data related to the invitation.
     * @param {Function} dispatchSuccess - Success dispatch function.
     * @param {Function} dispatchError - Error dispatch function.
     * @param {string} [userId='system'] - The ID of the user performing the action.
     * @returns {Promise<void>}
     */
    async executeCollectAccountWorkflow(counterpartyId, invitationData, dispatchSuccess, dispatchError, userId = 'system') {
        gemini.logger.info(`Starting collect account workflow for counterparty ${counterpartyId}.`);
        try {
            const data = {
                invitationData: {
                    ...invitationData,
                    custom_redirect: invitationData.customRedirect,
                    fields: Object.keys(invitationData.fields).filter(
                        (f) => invitationData.fields[f],
                    ),
                },
            };

            // Use AI to generate a more personalized invitation message
            const counterparty = gemini.cache.get(`counterparty:${counterpartyId}`) || { name: 'Counterparty' };
            const aiContent = await gemini.ai.generateNotificationContent("collect_account_invite", {
                counterpartyName: counterparty.name,
                sender: userId,
                customMessage: invitationData.customMessage,
            });

            // Send the invitation using the notification service
            await this.notificationService.sendEmail(
                invitationData.email,
                aiContent.subject || "Action Required: Collect Account Details",
                aiContent.body || "Please follow the link to provide your account details.",
                { counterpartyId, invitationType: "collect_account", userId, customRedirect: invitationData.customRedirect }
            );

            // Log the action
            this.auditLogService.logEvent("Counterparty", counterpartyId, "INVITE_ACCOUNT_COLLECTION", userId, { recipient: invitationData.email, fieldsRequested: data.invitationData.fields });
            gemini.telemetry.trackEvent("AccountCollectionInviteSent", { counterpartyId, recipientEmail: invitationData.email });

            dispatchSuccess("Invite Successfully Sent");

        } catch (error) {
            // Re-implementing original error handling for specific cases (like rate limits)
            let userMessage = "An error occurred while sending the invitation.";
            if (error instanceof ApiError && error.response && error.response.headers) {
                const limitResetHeader = error.response.headers.get("X-Notification-Limit-Reset");
                if (limitResetHeader) {
                    const minutesRemaining = parseInt(parseInt(limitResetHeader, 10) / 60, 10);
                    userMessage = `Too many email invites sent, try again in ${minutesRemaining} minutes.`;
                } else {
                    userMessage = error.data?.message || error.message;
                }
            } else if (error instanceof ApiError && error.data && error.data.errors && error.data.errors.message) {
                userMessage = error.data.errors.message;
            } else {
                userMessage = error.message;
            }

            gemini.logger.logErrorAndDispatch(`Failed to send account collection invite for ${counterpartyId}:`, error, { counterpartyId });
            dispatchError(userMessage);
            throw error;
        }
    }

    /**
     * Executes the workflow for archiving a counterparty.
     * @param {string} id - The ID of the counterparty to archive.
     * @param {Function} dispatchSuccess - Success dispatch function.
     * @param {Function} dispatchError - Error dispatch function.
     * @param {boolean} [forceDelete=false] - If true, performs a hard delete (should be restricted).
     * @param {string} [userId='system'] - The ID of the user performing the action.
     * @returns {Promise<void>}
     */
    async executeArchiveCounterpartyWorkflow(id, dispatchSuccess, dispatchError, forceDelete = false, userId = 'system') {
        gemini.logger.warn(`Starting archive workflow for counterparty ${id}. Force delete: ${forceDelete}`);

        try {
            // Pre-check: Ensure no critical active dependencies (e.g., pending transactions)
            // This would involve calls to other services to check for related entities.
            // For now, simulate.
            const hasActiveDependencies = Math.random() > 0.9; // 10% chance of active dependencies
            if (hasActiveDependencies && !forceDelete) {
                const message = `Counterparty ${id} has active dependencies. Cannot archive without force delete.`;
                gemini.logger.warn(message);
                dispatchError(message);
                throw new ComplianceError(message, { counterpartyId: id, reason: "active_dependencies" });
            }

            const endpoint = `${gemini.config.counterpartyApiBaseUrl}/${id}`;
            const method = forceDelete ? "DELETE" : "PATCH"; // PATCH for soft-delete/archive, DELETE for hard delete.
            const data = forceDelete ? null : { status: CounterpartyStatus.ARCHIVED, discarded_at: new Date().toISOString() };

            const response = await gemini.api.request(endpoint, method, data);
            const jsonData = await response.json();

            dispatchSuccess("Counterparty successfully archived/deleted.");
            gemini.state.counterparties.updateOne({
                id,
                changes: {
                    status: forceDelete ? CounterpartyStatus.DELETED : CounterpartyStatus.ARCHIVED,
                    discarded_at: jsonData.discarded_at,
                },
            });
            gemini.state.counterparties.removeOne(id); // Remove from client-side active state/cache

            this.auditLogService.logEvent("Counterparty", id, forceDelete ? "HARD_DELETE" : "ARCHIVE", userId, { reason: "user_request" });
            gemini.telemetry.trackEvent(forceDelete ? "HardDeleteCounterparty" : "ArchiveCounterparty", { counterpartyId: id });
            this.notificationService.sendSystemAlert(`Counterparty ${id} ${forceDelete ? 'hard deleted' : 'archived'} by ${userId}.`, "warning", { counterpartyId: id, forceDelete });

        } catch (error) {
            let userMessage = "An error occurred during archival/deletion.";
            if (error instanceof ApiError && error.data && error.data.errors && error.data.errors.message) {
                userMessage = error.data.errors.message;
            } else if (error.message) {
                userMessage = error.message;
            }

            gemini.logger.logErrorAndDispatch(`Failed to archive/delete counterparty ${id}:`, error, { counterpartyId: id, forceDelete });
            dispatchError(userMessage);
            throw error;
        }
    }
}
export const counterpartyOrchestrator = new CounterpartyOrchestrator();

/**
 * Placeholder GraphQL mutation string for upserting a counterparty.
 * In a real Gemini system, this might be dynamically generated or provided by an SDK.
 * Note: The input structure (`$input: UpsertCounterpartyInput!`) implies nested `input` field in variables.
 */
const UPSERT_COUNTERPARTY_MUTATION = `
    mutation UpsertCounterparty($input: UpsertCounterpartyInput!) {
        upsertCounterparty(input: $input) {
            counterparty {
                id
                name
                email
                taxpayerIdentifier
                ledgerType
                metadata
                sendRemittanceAdvice
                accountingCategory
                accountingLedgerClass
                status # Added new field
                lastActivityDate # Added new field
                complianceScore # Added new field
                accounts {
                    id
                    partyAddress {
                        id
                        line1
                        line2
                        line3
                        locality
                        region
                        country
                        postalCode
                    }
                    name
                    partyName
                    accountType
                    partyType
                    partyIdentifier
                    accountNumber
                    accountNumberTouched
                    abaRoutingNumber
                    abaRoutingNumberTouched
                    caCpaRoutingNumber
                    caCpaRoutingNumberTouched
                    dkInterbankClearingCodeRoutingNumber
                    dkInterbankClearingCodeRoutingNumberTouched
                    auBsbRoutingNumber
                    auBsbRoutingNumberTouched
                    gbSortCodeRoutingNumber
                    gbSortCodeRoutingNumberTouched
                    ibanAccountNumber
                    ibanAccountNumberTouched
                    hkInterbankClearingCodeRoutingNumber
                    hkInterbankClearingCodeRoutingNumberTouched
                    huInterbankClearingCodeRoutingNumber
                    huInterbankClearingCodeRoutingNumberTouched
                    idSknbiCodeRoutingNumber
                    idSknbiCodeRoutingNumberTouched
                    nzNationalClearingCodeRoutingNumber
                    nzNationalClearingCodeRoutingNumberTouched
                    seBankgiroClearingCodeRoutingNumber
                    seBankgiroClearingCodeRoutingNumberTouched
                    swiftCode
                    swiftCodeTouched
                    inIfscRoutingNumber
                    inIfscRoutingNumberTouched
                    jpZenginCodeRoutingNumber
                    jpZenginCodeRoutingNumberTouched
                }
            }
            errors {
                message
                field # Added specific field for validation errors
                code # Added error code for programmatic handling
            }
        }
    }
`;

/**
 * Transforms address data from API snake_case to camelCase for client-side use.
 * @param {object} data - The raw address data.
 * @returns {object|null} The transformed address object or null.
 */
export const transformAddress = (data) =>
    data && {
        id: data.id,
        line1: data.line1,
        line2: data.line2,
        line3: data.line3,
        locality: data.locality,
        region: data.region,
        country: data.country,
        postalCode: data.postal_code,
    };

/**
 * Transforms external account data from API snake_case to camelCase for client-side use.
 * @param {object} data - The raw external account data.
 * @returns {object|null} The transformed external account object or null.
 */
export const transformExternalAccount = (data) =>
    data && {
        id: data.id,
        partyAddress: transformAddress(data.party_address),
        name: data.name,
        partyName: data.party_name,
        accountType: data.account_type,
        partyType: data.party_type,
        partyIdentifier: data.party_identifier,
        accountNumber: data.account_number,
        accountNumberTouched: data.account_number_touched,
        abaRoutingNumber: data.aba_routing_number,
        abaRoutingNumberTouched: data.aba_routing_number_touched,
        caCpaRoutingNumber: data.ca_cpa_routing_number,
        caCpaRoutingNumberTouched: data.ca_cpa_routing_number_touched,
        dkInterbankClearingCodeRoutingNumber: data.dk_interbank_clearing_code_routing_number,
        dkInterbankClearingCodeRoutingNumberTouched: data.dk_interbank_clearing_code_routing_number_touched,
        auBsbRoutingNumber: data.au_bsb_routing_number,
        auBsbRoutingNumberTouched: data.au_bsb_routing_number_touched,
        gbSortCodeRoutingNumber: data.gb_sort_code_routing_number,
        gbSortCodeRoutingNumberTouched: data.gb_sort_code_routing_number_touched,
        ibanAccountNumber: data.iban_account_number,
        ibanAccountNumberTouched: data.iban_account_number_touched,
        hkInterbankClearingCodeRoutingNumber: data.hk_interbank_clearing_code_routing_number,
        hkInterbankClearingCodeRoutingNumberTouched: data.hk_interbank_clearing_code_routing_number_touched,
        huInterbankClearingCodeRoutingNumber: data.hu_interbank_clearing_code_routing_number,
        huInterbankClearingCodeRoutingNumberTouched: data.hu_interbank_clearing_code_routing_number_touched,
        idSknbiCodeRoutingNumber: data.id_sknbi_code_routing_number,
        idSknbiCodeRoutingNumberTouched: data.id_sknbi_code_routing_number_touched,
        nzNationalClearingCodeRoutingNumber: data.nz_national_clearing_code_routing_number,
        nzNationalClearingCodeRoutingNumberTouched: data.nz_national_clearing_code_routing_number_touched,
        seBankgiroClearingCodeRoutingNumber: data.se_bankgiro_clearing_code_routing_number,
        seBankgiroClearingCodeRoutingNumberTouched: data.se_bankgiro_clearing_code_routing_number_touched,
        swiftCode: data.swift_code,
        swiftCodeTouched: data.swift_code_touched,
        inIfscRoutingNumber: data.in_ifsc_routing_number,
        inIfscRoutingNumberTouched: data.in_ifsc_routing_number_touched,
        jpZenginCodeRoutingNumber: data.jp_zengin_code_routing_number,
        jpZenginCodeRoutingNumberTouched: data.jp_zengin_code_routing_number_touched,
    };

/**
 * Transforms counterparty data from API snake_case to camelCase for client-side use.
 * Also handles new fields like `status`, `lastActivityDate`, `complianceScore`.
 * @param {object} data - The raw counterparty data.
 * @returns {object} The transformed counterparty object.
 */
export const transformCounterparty = (data) => ({
    id: data.id,
    name: data.name,
    email: data.email,
    taxpayerIdentifier: data.taxpayer_identifier,
    ledgerType: data.ledger_type,
    // Assuming metadata from data is an object that needs to be stringified for the API.
    // If it's already a string, this will stringify it again. Adjust as per actual data source.
    metadata: JSON.stringify(data.metadata),
    sendRemittanceAdvice: data.send_remittance_advice,
    accountingCategory: data.accounting_category,
    accountingLedgerClass: data.accounting_ledger_class,
    status: data.status || CounterpartyStatus.INCOMPLETE, // Default status
    lastActivityDate: data.last_activity_date || new Date().toISOString(),
    complianceScore: data.compliance_score || 0,
    accounts: data.accounts ? data.accounts.map(transformExternalAccount) : [],
});

/**
 * Submits counterparty data (create or update) through an orchestrated workflow.
 * This function is the entry point for UI interactions related to counterparty upsert.
 * @param {object} values - The form values for the counterparty.
 * @param {Function} successCallback - Callback function to execute on successful submission.
 * @param {Array<object>} pendingDocuments - An array of document objects to upload.
 * @param {Function} dispatchError - Dispatch function to show errors in the UI.
 * @param {string} [userId='system'] - The ID of the user performing the action.
 * @returns {Function} A Redux thunk-style function that dispatches actions.
 */
export function submitCounterparty(
    values,
    successCallback,
    pendingDocuments,
    dispatchError,
    userId = 'system',
) {
    return async (dispatch) => {
        try {
            const returnedCounterparty = await counterpartyOrchestrator.executeUpsertCounterpartyWorkflow(
                values,
                pendingDocuments,
                dispatchError,
                userId
            );

            // Navigate on successful creation or update completion
            if (!values.id) { // This condition implies a new counterparty creation
                // Document upload failures are now handled within the orchestrator
                window.location.href = `/counterparties/${returnedCounterparty.id}`; // Potentially add ?hadDocumentFailures=true if orchestrator returns this explicitly
            } else if (successCallback) {
                successCallback();
            }
            // All form stop submit, state updates, and error dispatches are handled by the orchestrator
        } catch (error) {
            // Orchestrator already dispatched errors, just log or re-throw if needed for global error boundary
            gemini.logger.error("submitCounterparty caught an error from orchestrator:", error);
            // Re-throwing the error to allow a global error handler (if present in the application) to catch it.
            throw error;
        }
    };
}

/**
 * Collects external account details from a counterparty by sending an invitation.
 * @param {string} counterpartyId - The ID of the counterparty.
 * @param {object} invitationData - Data for the invitation (e.g., email, redirect URL, fields to collect).
 * @param {Function} dispatchSuccess - Dispatch function for success messages.
 * @param {Function} dispatchError - Dispatch function for error messages.
 * @param {string} [userId='system'] - The ID of the user performing the action.
 * @returns {Function} A Redux thunk-style function.
 */
export function collectCounterpartyAccount(
    counterpartyId,
    invitationData,
    dispatchSuccess,
    dispatchError,
    userId = 'system',
) {
    return async (dispatch) => {
        try {
            await counterpartyOrchestrator.executeCollectAccountWorkflow(
                counterpartyId,
                invitationData,
                dispatchSuccess,
                dispatchError,
                userId
            );
        } catch (error) {
            gemini.logger.error("collectCounterpartyAccount caught an error from orchestrator:", error);
            throw error;
        }
    };
}

/**
 * Archives (soft-deletes) or permanently deletes a counterparty.
 * @param {string} id - The ID of the counterparty.
 * @param {Function} dispatchSuccess - Dispatch function for success messages.
 * @param {Function} dispatchError - Dispatch function for error messages.
 * @param {boolean} [forceDelete=false] - If true, attempts a hard delete (use with caution).
 * @param {string} [userId='system'] - The ID of the user performing the action.
 * @returns {Function} A Redux thunk-style function.
 */
export function archiveCounterparty(id, dispatchSuccess, dispatchError, forceDelete = false, userId = 'system') {
    return async (dispatch) => {
        try {
            await counterpartyOrchestrator.executeArchiveCounterpartyWorkflow(
                id,
                dispatchSuccess,
                dispatchError,
                forceDelete,
                userId
            );
        } catch (error) {
            gemini.logger.error("archiveCounterparty caught an error from orchestrator:", error);
            throw error;
        }
    };
}

// Ensure all newly created top-level classes/constants/objects are exported.
// The `gemini` object is already exported implicitly by its definition.
// The services and orchestrator instances are also exported.

// Additional exports for utility functions, errors, and constants
export { CounterpartyEventTypes, CounterpartyStatus, ApiError, ValidationError, ComplianceError };
