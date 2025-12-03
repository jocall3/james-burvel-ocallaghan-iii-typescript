/**
 * @module SearchActions
 * @description This module provides a comprehensive suite of actions and utilities for performing advanced search operations,
 * leveraging simulated Gemini AI capabilities for enhanced data processing, analysis, and intelligent interactions.
 * It's designed for high-performance, commercial-grade applications requiring robust data retrieval and intelligent insights.
 */

/**
 * Global configuration for the Gemini AI Search Module.
 * This object can be populated with environment variables or external configuration services.
 * @type {Object}
 */
export const GLOBAL_GEMINI_CONFIG = {
    API_BASE_URL: 'https://api.gemini-enterprise.com/v1',
    AI_SERVICE_ENDPOINT: '/ai-insights',
    DATA_SERVICE_ENDPOINT: '/data-resources',
    AUTH_TOKEN_STORAGE_KEY: 'gemini_auth_token',
    DEFAULT_PAGE_SIZE: 25,
    MAX_SEARCH_HISTORY_LENGTH: 10,
    DEBOUNCE_TIME_MS: 300,
    ENABLE_AI_SUGGESTIONS: true,
    ENABLE_ANOMALY_DETECTION: true,
    ENABLE_SEMANTIC_SEARCH: true,
    ENABLE_SENTIMENT_ANALYSIS: true,
    ENABLE_RESULT_SUMMARIZATION: true,
    LOG_LEVEL: 'DEBUG' // INFO, WARN, ERROR, DEBUG, TRACE, NONE
};

/**
 * Enumeration of predefined error codes for consistent error handling.
 * @readonly
 * @enum {string}
 */
export const GeminiErrorCodes = {
    NETWORK_ERROR: 'GEM_NET_ERR_001',
    API_UNAUTHORIZED: 'GEM_API_AUTH_002',
    API_SERVER_ERROR: 'GEM_API_SERV_003',
    VALIDATION_ERROR: 'GEM_VAL_ERR_004',
    UNKNOWN_ERROR: 'GEM_UNK_ERR_005',
    AI_SERVICE_UNAVAILABLE: 'GEM_AI_UNAVAIL_006',
    INVALID_QUERY_PARAMETER: 'GEM_INV_QUERY_007',
    ENTITY_NOT_FOUND: 'GEM_ENT_NOT_FOUND_008',
    INTERNAL_SYSTEM_ERROR: 'GEM_INT_SYS_009',
    DATA_CORRUPTION: 'GEM_DAT_CORR_010',
    UNSUPPORTED_OPERATION: 'GEM_UNSUP_OP_011'
};

/**
 * Represents a standardized error object for the Gemini system.
 * This class extends the native Error object, adding structured properties
 * for better error identification and handling across the application.
 * @class
 */
export class GeminiSystemError extends Error {
    /**
     * Creates an instance of GeminiSystemError.
     * @param {string} message - A human-readable error message.
     * @param {string} code - A unique error code from {@link GeminiErrorCodes} for programmatic handling.
     * @param {number} [statusCode=500] - The associated HTTP status code, if applicable. Defaults to 500.
     * @param {Object} [details={}] - An object containing additional context or raw error data.
     */
    constructor(message, code, statusCode = 500, details = {}) {
        super(message);
        this.name = 'GeminiSystemError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        // Ensure stack trace is captured in V8 (and similar engines)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GeminiSystemError);
        }
        Logger.error(`GeminiSystemError: [${code}] ${message}`, {
            statusCode,
            details,
            stack: this.stack
        });
    }

    /**
     * Converts the error instance to a plain JavaScript object, suitable for
     * logging, serialization, or sending across network boundaries.
     * @returns {Object} A plain object representation of the error.
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            stack: this.stack // Include stack trace for detailed debugging
        };
    }
}

/**
 * A sophisticated logging utility for the Gemini Enterprise application.
 * Supports different log levels, structured logging, and can be configured
 * to control verbosity based on `GLOBAL_GEMINI_CONFIG.LOG_LEVEL`.
 * @class
 */
export class Logger {
    /**
     * The current logging level. Messages with a severity lower than this level will be ignored.
     * @static
     * @type {string}
     */
    static logLevel = GLOBAL_GEMINI_CONFIG.LOG_LEVEL;

    /**
     * Defines the hierarchy of log levels, where a higher number indicates greater severity.
     * @static
     * @type {Object<string, number>}
     */
    static levels = {
        'TRACE': 0,
        'DEBUG': 1,
        'INFO': 2,
        'WARN': 3,
        'ERROR': 4,
        'NONE': 5 // No logging output
    };

    /**
     * Checks if a given log message's level is sufficient to be logged based on the configured `logLevel`.
     * @private
     * @static
     * @param {string} level - The level of the message to potentially log.
     * @returns {boolean} True if the message should be logged, false otherwise.
     */
    static _shouldLog(level) {
        return Logger.levels[level] >= Logger.levels[Logger.logLevel];
    }

    /**
     * Formats the log message by prepending a timestamp and the log level.
     * @private
     * @static
     * @param {string} level - The log level (e.g., 'INFO', 'ERROR').
     * @param {Array<any>} args - The original arguments passed to the logging method.
     * @returns {Array<any>} Formatted arguments, ready for `console.log` or similar.
     */
    static _formatMessage(level, args) {
        const timestamp = new Date().toISOString();
        return [`[${timestamp}] [${level}]`, ...args];
    }

    /**
     * Logs a message at the TRACE level. Used for very fine-grained internal debugging.
     * @static
     * @param {...any} args - The messages or objects to log.
     */
    static trace(...args) {
        if (Logger._shouldLog('TRACE')) {
            console.trace(...Logger._formatMessage('TRACE', args));
        }
    }

    /**
     * Logs a message at the DEBUG level. Used for detailed debugging information during development.
     * @static
     * @param {...any} args - The messages or objects to log.
     */
    static debug(...args) {
        if (Logger._shouldLog('DEBUG')) {
            console.debug(...Logger._formatMessage('DEBUG', args));
        }
    }

    /**
     * Logs a message at the INFO level. Used for general operational messages.
     * @static
     * @param {...any} args - The messages or objects to log.
     */
    static info(...args) {
        if (Logger._shouldLog('INFO')) {
            console.info(...Logger._formatMessage('INFO', args));
        }
    }

    /**
     * Logs a message at the WARN level. Indicates potential issues that don't prevent operation but should be monitored.
     * @static
     * @param {...any} args - The messages or objects to log.
     */
    static warn(...args) {
        if (Logger._shouldLog('WARN')) {
            console.warn(...Logger._formatMessage('WARN', args));
        }
    }

    /**
     * Logs a message at the ERROR level. Indicates significant problems that prevent normal operation.
     * In a production environment, these logs would typically trigger alerts.
     * @static
     * @param {...any} args - The messages or objects to log.
     */
    static error(...args) {
        if (Logger._shouldLog('ERROR')) {
            console.error(...Logger._formatMessage('ERROR', args));
            // In a real commercial application, this would also push to an error monitoring service (e.g., Sentry, Datadog).
        }
    }
}

/**
 * A comprehensive utility class for common data validation and manipulation tasks.
 * Provides static methods to ensure data quality, consistency, and efficient processing.
 * @class
 */
export class DataUtils {
    /**
     * Checks if a value is strictly null or undefined.
     * @static
     * @param {any} value - The value to check for nullishness.
     * @returns {boolean} True if the value is null or undefined, false otherwise.
     */
    static isNil(value) {
        return value === null || value === undefined;
    }

    /**
     * Checks if a value is considered empty. This includes null, undefined,
     * empty strings (even whitespace-only), empty arrays, empty objects,
     * and empty Map/Set instances.
     * @static
     * @param {any} value - The value to check for emptiness.
     * @returns {boolean} True if the value is empty, false otherwise.
     */
    static isEmpty(value) {
        if (DataUtils.isNil(value)) {
            return true;
        }
        if (typeof value === 'object') {
            if (Array.isArray(value)) {
                return value.length === 0;
            }
            if (value instanceof Map || value instanceof Set) {
                return value.size === 0;
            }
            // Check for plain objects or objects with a 'length' property (like NodeList)
            return Object.keys(value).length === 0;
        }
        if (typeof value === 'string') {
            return value.trim().length === 0; // Consider whitespace-only strings as empty
        }
        return false;
    }

    /**
     * Performs a deep clone of an object or array. Handles primitive types, Dates,
     * and nested objects/arrays. Does not handle circular references or complex types like functions, RegExp.
     * @static
     * @param {Object|Array} obj - The object or array to clone.
     * @returns {Object|Array} A deep clone of the input.
     */
    static deepClone(obj) {
        if (DataUtils.isNil(obj) || typeof obj !== 'object') {
            return obj; // Primitive types, null, and undefined are returned as-is
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime()); // Clone Date objects
        }

        if (Array.isArray(obj)) {
            return obj.map(item => DataUtils.deepClone(item)); // Recursively clone array elements
        }

        // Handle plain objects
        const clonedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = DataUtils.deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    /**
     * Converts a JavaScript object into a URL-encoded query string.
     * Supports nested objects and arrays, generating query parameters like `param[key]=value` or `param[]=value`.
     * @static
     * @param {Object} obj - The object to stringify into query parameters.
     * @returns {string} The URL-encoded query string.
     */
    static stringifyQueryParams(obj) {
        if (!obj || typeof obj !== 'object') {
            Logger.warn('DataUtils.stringifyQueryParams received non-object input:', obj);
            return '';
        }
        const parts = [];

        /**
         * Recursively builds query string parts from an object.
         * @param {string} keyPrefix - The current key prefix, handling nested structures.
         * @param {any} value - The value to process.
         */
        const buildQueryParts = (keyPrefix, value) => {
            if (DataUtils.isNil(value)) {
                return; // Skip null/undefined values
            }

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    // For arrays, each item is treated as a distinct parameter, e.g., 'param[]=item1&param[]=item2'
                    buildQueryParts(`${keyPrefix}[]`, item);
                });
            } else if (typeof value === 'object' && value !== null && value.constructor === Object) {
                // Only process plain objects for nested key-value pairs
                for (const key in value) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        buildQueryParts(`${keyPrefix}[${key}]`, value[key]);
                    }
                }
            } else {
                parts.push(`${encodeURIComponent(keyPrefix)}=${encodeURIComponent(String(value))}`);
            }
        };

        // Start processing from the top-level keys of the input object
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                buildQueryParts(key, obj[key]);
            }
        }

        return parts.join('&');
    }

    /**
     * Parses a URL query string into a simple JavaScript object.
     * Note: This implementation provides basic parsing and does not deeply handle
     * nested array/object notation from `stringifyQueryParams`.
     * @static
     * @param {string} queryString - The raw query string (e.g., "param1=value1&param2=value2").
     * @returns {Object} An object representing the parsed query parameters.
     */
    static parseQueryParams(queryString) {
        const params = {};
        if (DataUtils.isEmpty(queryString)) {
            return params;
        }

        // Remove leading '?' if present
        const cleanQueryString = queryString.startsWith('?') ? queryString.substring(1) : queryString;

        cleanQueryString.split('&').forEach(part => {
            const [key, value] = part.split('=').map(decodeURIComponent);
            if (key) {
                params[key] = value || ''; // Assign empty string if value is missing
            }
        });
        return params;
    }

    /**
     * Validates if a given string conforms to the UUID v4 format.
     * @static
     * @param {string} uuid - The string to validate.
     * @returns {boolean} True if it's a valid UUID, false otherwise.
     */
    static isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return typeof uuid === 'string' && uuidRegex.test(uuid);
    }

    /**
     * Generates a simple, non-cryptographic unique ID.
     * @static
     * @returns {string} A unique string ID.
     */
    static generateUniqueId() {
        return `uid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Sanitizes a string input to prevent common security vulnerabilities like XSS.
     * This is a basic example; for high-security applications, consider a dedicated DOMPurify library.
     * @static
     * @param {string} input - The string to sanitize.
     * @returns {string} The sanitized string.
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            return input;
        }
        return input.replace(/[&<>"']/g, function(match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[match];
        });
    }

    /**
     * Debounces a function call, ensuring it's only executed after a specified delay
     * has passed without any further calls. Useful for input fields, resize events.
     * @static
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds before `func` is executed.
     * @returns {Function} The debounced function.
     */
    static debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * Throttles a function call, limiting its execution rate to once within a specified time limit.
     * Useful for scroll events, drag events.
     * @static
     * @param {Function} func - The function to throttle.
     * @param {number} limit - The time limit in milliseconds within which `func` can only be called once.
     * @returns {Function} The throttled function.
     */
    static throttle(func, limit) {
        let inThrottle;
        let lastResult;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
                lastResult = func.apply(context, args);
            }
            return lastResult;
        };
    }
}

/**
 * Manages authentication tokens and generates authorization headers for API requests.
 * Uses `localStorage` in browser environments for persistent token storage.
 * @class
 */
export class AuthManager {
    /**
     * Retrieves the authentication token from `localStorage`.
     * @static
     * @returns {string|null} The authentication token, or null if not found or in a non-browser environment.
     */
    static getAuthToken() {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem(GLOBAL_GEMINI_CONFIG.AUTH_TOKEN_STORAGE_KEY);
        }
        Logger.warn('AuthManager.getAuthToken called in non-browser environment or localStorage not available.');
        return null;
    }

    /**
     * Stores the provided authentication token in `localStorage`.
     * @static
     * @param {string} token - The authentication token to store.
     */
    static setAuthToken(token) {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(GLOBAL_GEMINI_CONFIG.AUTH_TOKEN_STORAGE_KEY, token);
            Logger.info('Auth token updated successfully.');
        } else {
            Logger.warn('AuthManager.setAuthToken called in non-browser environment or localStorage not available.');
        }
    }

    /**
     * Removes the authentication token from `localStorage`.
     * @static
     */
    static clearAuthToken() {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(GLOBAL_GEMINI_CONFIG.AUTH_TOKEN_STORAGE_KEY);
            Logger.info('Auth token cleared successfully.');
        } else {
            Logger.warn('AuthManager.clearAuthToken called in non-browser environment or localStorage not available.');
        }
    }

    /**
     * Generates a standard Authorization header object containing the Bearer token.
     * @static
     * @returns {Object} An object with the 'Authorization' header.
     * @throws {GeminiSystemError} If no authentication token is available.
     */
    static getAuthHeaders() {
        const token = AuthManager.getAuthToken();
        if (!token) {
            Logger.error('Attempted to get auth headers without an available token.');
            throw new GeminiSystemError('Authentication token missing. Please log in.', GeminiErrorCodes.API_UNAUTHORIZED, 401);
        }
        return {
            'Authorization': `Bearer ${token}`
        };
    }
}

/**
 * A sophisticated API client for interacting with Gemini Enterprise backend services.
 * This client abstracts away the complexities of HTTP requests, authentication,
 * and error handling, providing a clean interface for interacting with various APIs.
 * @class
 */
export class GeminiAPIClient {
    /**
     * Creates an instance of GeminiAPIClient.
     * @param {string} [baseURL=GLOBAL_GEMINI_CONFIG.API_BASE_URL] - The base URL for API requests.
     */
    constructor(baseURL = GLOBAL_GEMINI_CONFIG.API_BASE_URL) {
        if (DataUtils.isEmpty(baseURL)) {
            Logger.error('GeminiAPIClient initialized with an empty or invalid base URL.', {
                baseURL
            });
            throw new GeminiSystemError('API Base URL cannot be empty or invalid.', GeminiErrorCodes.INVALID_QUERY_PARAMETER);
        }
        this.baseURL = baseURL;
        Logger.debug(`GeminiAPIClient initialized with base URL: ${this.baseURL}`);
    }

    /**
     * Executes a generic API request using the Fetch API.
     * This private method handles common concerns such as authentication,
     * content headers, response parsing, and comprehensive error mapping.
     * @private
     * @param {string} endpoint - The API endpoint path, relative to the base URL.
     * @param {Object} [options={}] - Standard Fetch API options (method, headers, body, etc.).
     * @returns {Promise<Object>} A promise that resolves with the JSON response from the API.
     * @throws {GeminiSystemError} For network errors, API errors (4xx/5xx), or unexpected response formats.
     */
    async _request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        Logger.trace(`Initiating API request: ${options.method || 'GET'} ${url}`, options);

        try {
            // Apply standard headers and authentication headers
            const authHeaders = AuthManager.getAuthHeaders();
            options.headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...authHeaders,
                ...options.headers, // Allow overriding headers
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                let errorDetails = {};
                try {
                    errorDetails = await response.json(); // Attempt to parse detailed error from response body
                } catch (parseError) {
                    Logger.warn('Failed to parse error response JSON:', parseError);
                    errorDetails = {
                        message: response.statusText || 'Unknown API error'
                    };
                }

                // Map common HTTP status codes to specific GeminiSystemError codes
                switch (response.status) {
                    case 401:
                    case 403:
                        AuthManager.clearAuthToken(); // Invalidate token on authorization failure
                        throw new GeminiSystemError('Authentication failed. Please log in again.', GeminiErrorCodes.API_UNAUTHORIZED, response.status, errorDetails);
                    case 404:
                        throw new GeminiSystemError(errorDetails.message || 'Resource not found.', GeminiErrorCodes.ENTITY_NOT_FOUND, response.status, errorDetails);
                    case 400:
                    case 422: // Unprocessable Entity
                        throw new GeminiSystemError(errorDetails.message || 'Invalid request parameters.', GeminiErrorCodes.VALIDATION_ERROR, response.status, errorDetails);
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        throw new GeminiSystemError('Server encountered an error. Please try again later.', GeminiErrorCodes.API_SERVER_ERROR, response.status, errorDetails);
                    default:
                        throw new GeminiSystemError(errorDetails.message || `API Error: ${response.status} ${response.statusText}`, GeminiErrorCodes.UNKNOWN_ERROR, response.status, errorDetails);
                }
            }

            const jsonResponse = await response.json();
            Logger.debug(`API request to ${endpoint} successful.`, jsonResponse);
            return jsonResponse;

        } catch (error) {
            if (error instanceof GeminiSystemError) {
                // GeminiSystemError already logged in its constructor
                throw error;
            }
            // Catch any unexpected errors (e.g., network down, browser issues)
            Logger.error(`API request encountered a network or unexpected error for ${url}: ${error.message}`, error);
            throw new GeminiSystemError(`Network error or unexpected response: ${error.message}`, GeminiErrorCodes.NETWORK_ERROR, 500, {
                originalError: error.message,
                endpoint
            });
        }
    }

    /**
     * Performs an HTTP GET request to the specified endpoint.
     * @param {string} endpoint - The API endpoint.
     * @param {Object} [queryParams={}] - An object containing query parameters to be appended to the URL.
     * @returns {Promise<Object>} A promise resolving to the JSON response data.
     */
    get(endpoint, queryParams = {}) {
        const queryString = DataUtils.stringifyQueryParams(queryParams);
        const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this._request(fullEndpoint, {
            method: 'GET'
        });
    }

    /**
     * Performs an HTTP POST request with a JSON body.
     * @param {string} endpoint - The API endpoint.
     * @param {Object} data - The request body as a JavaScript object, which will be JSON.stringified.
     * @returns {Promise<Object>} A promise resolving to the JSON response data.
     */
    post(endpoint, data) {
        return this._request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Performs an HTTP PUT request with a JSON body.
     * @param {string} endpoint - The API endpoint.
     * @param {Object} data - The request body as a JavaScript object.
     * @returns {Promise<Object>} A promise resolving to the JSON response data.
     */
    put(endpoint, data) {
        return this._request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Performs an HTTP DELETE request.
     * @param {string} endpoint - The API endpoint.
     * @returns {Promise<Object>} A promise resolving to the JSON response data.
     */
    delete(endpoint) {
        return this._request(endpoint, {
            method: 'DELETE'
        });
    }
}

/**
 * Initializes and exports a singleton instance of GeminiAPIClient.
 * This ensures that all modules and services across the application share
 * a single, consistent client instance for API interactions.
 * @type {GeminiAPIClient}
 */
export const geminiApiClient = new GeminiAPIClient();

/**
 * A simulated Gemini AI Service for enhancing search and data processing.
 * This class provides methods to apply various AI models (semantic search,
 * sentiment analysis, anomaly detection, summarization, suggestions)
 * and generates intelligent insights for search results. All AI interactions
 * are simulated for demonstration purposes, introducing fake latency and data.
 * @class
 */
export class GeminiAIService {
    /**
     * Simulates a generic call to a Gemini AI model endpoint.
     * Introduces artificial latency and a chance of simulated service error.
     * @private
     * @param {string} modelName - The logical name of the AI model being simulated.
     * @param {Object} inputData - The input data to be sent to the AI model.
     * @param {Object} [config={}] - Configuration options specific to the AI model call.
     * @returns {Promise<Object>} A promise that resolves with a base AI response object,
     *                            indicating status and model name.
     * @throws {GeminiSystemError} If the simulated AI service encounters an error.
     */
    async _simulateAIGeneric(modelName, inputData, config = {}) {
        Logger.debug(`Simulating Gemini AI call for model: ${modelName}`, {
            inputData,
            config
        });
        await new Promise(resolve => setTimeout(Math.random() * 300 + 100, resolve)); // Simulate AI processing latency

        if (Math.random() < 0.05) { // 5% chance of simulated AI service error
            Logger.error(`Simulated AI service for ${modelName} encountered a random error.`);
            throw new GeminiSystemError(`Gemini AI ${modelName} service temporarily unavailable.`, GeminiErrorCodes.AI_SERVICE_UNAVAILABLE, 503);
        }

        if (DataUtils.isEmpty(inputData) && Object.keys(inputData).length === 0) {
            Logger.warn(`AI model ${modelName} received substantially empty input data, might yield limited results.`);
            return {
                model: modelName,
                timestamp: new Date().toISOString(),
                status: 'skipped',
                reason: 'Empty input data for AI processing',
                results: {}
            };
        }

        // Base response indicating successful simulation, awaiting specific results.
        return {
            model: modelName,
            timestamp: new Date().toISOString(),
            status: 'success',
            results: {}
        };
    }

    /**
     * Performs a simulated semantic search to find entities based on conceptual meaning,
     * going beyond simple keyword matching. It enriches existing search results.
     * @param {string} queryText - The user's natural language search query.
     * @param {Object} existingResults - The initial keyword-based search results object, expected to have an `entities` array.
     * @param {Object} [options={}] - Semantic search specific options (e.g., target entity types, search context).
     * @returns {Promise<Object>} A promise resolving to an object containing semantic matches,
     *                            recommendations, and the original results enhanced with AI scores.
     */
    async semanticSearch(queryText, existingResults, options = {}) {
        if (!GLOBAL_GEMINI_CONFIG.ENABLE_SEMANTIC_SEARCH || DataUtils.isEmpty(queryText) || DataUtils.isEmpty(existingResults) || DataUtils.isEmpty(existingResults.entities)) {
            Logger.debug('Semantic search is disabled or missing essential input data, skipping.');
            return {
                semanticMatches: [],
                enhancedResults: existingResults,
                aiStatus: 'skipped'
            };
        }

        const aiResponse = await this._simulateAIGeneric('SemanticSearch', {
            queryText,
            existingResults: existingResults.entities.map(e => ({
                id: e.id,
                name: e.name,
                description: e.description
            })),
            options
        });

        const entities = existingResults.entities || [];
        const semanticMatches = entities.filter(() => Math.random() > 0.5); // Simulate some entities being semantically relevant
        const aiRecommendations = entities.filter(() => Math.random() > 0.7)
            .map(r => ({
                id: r.id,
                type: 'related_entity',
                rationale: 'Gemini AI suggests this based on conceptual similarity.',
                score: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)) // 0.6 to 1.0
            }));

        const enhancedEntities = entities.map(entity => ({
            ...entity,
            isSemanticMatch: semanticMatches.some(m => m.id === entity.id),
            semanticRelevanceScore: entity.isSemanticMatch ? parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)) : parseFloat((Math.random() * 0.5).toFixed(2)) // 0.0 - 1.0
        }));

        const enhancedResults = DataUtils.deepClone(existingResults);
        enhancedResults.entities = enhancedEntities;

        return {
            ...aiResponse,
            semanticMatches: semanticMatches.map(m => ({
                entityId: m.id,
                name: m.name,
                reason: 'Gemini detected conceptual relevance.',
                score: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2))
            })),
            aiRecommendations,
            enhancedResults,
            aiStatus: 'success'
        };
    }

    /**
     * Provides intelligent search suggestions or corrects potential typos in a query.
     * This helps users formulate better and more effective searches.
     * @param {string} partialQuery - The incomplete or potentially misspelled query string.
     * @param {string[]} recentSearches - An array of recent search terms for additional context.
     * @returns {Promise<Object>} A promise resolving to an object with suggested query completions and corrections.
     */
    async getSearchSuggestions(partialQuery, recentSearches = []) {
        if (!GLOBAL_GEMINI_CONFIG.ENABLE_AI_SUGGESTIONS || DataUtils.isEmpty(partialQuery) || partialQuery.length < 2) {
            Logger.debug('AI suggestions disabled or query too short, skipping.');
            return {
                suggestions: [],
                corrections: [],
                aiStatus: 'skipped'
            };
        }

        const aiResponse = await this._simulateAIGeneric('SearchSuggestions', {
            partialQuery,
            recentSearches
        });

        const commonTerms = ['payment', 'transaction', 'account', 'invoice', 'report', 'transfer', 'client', 'vendor', 'currency', 'approval', 'settlement', 'reconciliation'];
        const suggestions = commonTerms
            .filter(term => term.includes(partialQuery.toLowerCase()))
            .map(term => ({
                text: term,
                type: 'general_keyword',
                score: parseFloat((Math.random() * 0.3 + 0.7).toFixed(2))
            }));

        const corrections = [];
        if (partialQuery.length > 3 && Math.random() < 0.2) { // 20% chance of a simulated correction
            const possibleCorrections = [
                partialQuery.slice(0, -1) + 'e',
                partialQuery.slice(0, -2) + 'al',
                'transact'
            ];
            corrections.push({
                original: partialQuery,
                corrected: possibleCorrections[Math.floor(Math.random() * possibleCorrections.length)],
                reason: 'Gemini AI detected a likely typo based on common patterns.',
                score: 0.95
            });
        }

        return {
            ...aiResponse,
            suggestions: suggestions.slice(0, 5), // Limit number of suggestions
            corrections: corrections,
            aiStatus: 'success'
        };
    }

    /**
     * Analyzes the sentiment of descriptive texts associated with entities (e.g., transaction descriptions, comments).
     * This can provide insights into customer satisfaction or operational context.
     * @param {Array<Object>} entities - An array of entities, where each entity is expected to have a 'description' or 'notes' field.
     * @returns {Promise<Object>} A promise resolving to sentiment analysis results, including an overall sentiment.
     */
    async analyzeSentiment(entities) {
        if (!GLOBAL_GEMINI_CONFIG.ENABLE_SENTIMENT_ANALYSIS || DataUtils.isEmpty(entities)) {
            Logger.debug('Sentiment analysis disabled or no entities provided, skipping.');
            return {
                analysisResults: [],
                overallSentiment: 'neutral',
                aiStatus: 'skipped'
            };
        }
        const descriptions = entities.map(e => e.description || e.notes).filter(d => !DataUtils.isEmpty(d));
        if (DataUtils.isEmpty(descriptions)) {
            Logger.debug('No valid descriptions/notes available for sentiment analysis, skipping.');
            return {
                analysisResults: [],
                overallSentiment: 'neutral',
                aiStatus: 'skipped'
            };
        }

        const aiResponse = await this._simulateAIGeneric('SentimentAnalysis', {
            descriptions
        });

        const analysisResults = entities.map(entity => {
            const text = entity.description || entity.notes;
            if (DataUtils.isEmpty(text)) {
                return {
                    entityId: entity.id,
                    sentiment: 'N/A',
                    score: 0,
                    aiConfidence: 0
                };
            }
            const sentimentScore = Math.random(); // 0 to 1
            let sentiment = 'neutral';
            if (sentimentScore < 0.35) sentiment = 'negative';
            else if (sentimentScore > 0.65) sentiment = 'positive';

            return {
                entityId: entity.id,
                description: text,
                sentiment: sentiment,
                score: parseFloat(sentimentScore.toFixed(2)),
                aiConfidence: parseFloat((Math.random() * 0.2 + 0.8).toFixed(2)) // 0.8 - 1.0
            };
        });

        const positiveCount = analysisResults.filter(r => r.sentiment === 'positive').length;
        const negativeCount = analysisResults.filter(r => r.sentiment === 'negative').length;
        const totalAnalyzed = analysisResults.filter(r => r.sentiment !== 'N/A').length;

        let overallSentiment = 'neutral';
        if (totalAnalyzed > 0) {
            if (positiveCount / totalAnalyzed > 0.6) overallSentiment = 'positive';
            else if (negativeCount / totalAnalyzed > 0.6) overallSentiment = 'negative';
        }


        return {
            ...aiResponse,
            analysisResults,
            overallSentiment,
            aiStatus: 'success'
        };
    }

    /**
     * Detects anomalies or unusual patterns within a dataset of entities.
     * This can be used for fraud detection, operational monitoring, or highlighting outliers.
     * @param {Array<Object>} entities - The dataset of entities to analyze. Expected to have numerical fields for analysis.
     * @param {Object} [detectionRules={}] - Specific rules or thresholds for anomaly detection (e.g., max_amount_deviation, expected_frequency).
     * @returns {Promise<Object>} A promise resolving to an object detailing detected anomalies.
     */
    async detectAnomalies(entities, detectionRules = {}) {
        if (!GLOBAL_GEMINI_CONFIG.ENABLE_ANOMALY_DETECTION || DataUtils.isEmpty(entities)) {
            Logger.debug('Anomaly detection disabled or no entities provided, skipping.');
            return {
                anomalies: [],
                aiStatus: 'skipped'
            };
        }

        const aiResponse = await this._simulateAIGeneric('AnomalyDetection', {
            entities,
            detectionRules
        });

        // Simulate anomaly detection based on a random chance and simple logic
        const anomalies = entities.filter(e => {
            const isAnomaly = Math.random() < 0.1; // 10% chance of being an anomaly
            // Example: more complex logic could check if amount > average * threshold, etc.
            if (e.amount && detectionRules.max_amount && e.amount > detectionRules.max_amount) return true;
            return isAnomaly;
        });

        const anomalyReports = anomalies.map(anomaly => ({
            entityId: anomaly.id,
            type: DataUtils.generateUniqueId().replace('uid_', 'anomaly_type_'),
            description: `Gemini AI flagged unusual activity for entity ${anomaly.id}. Potential cause: ${Math.random() > 0.5 ? 'Unusual amount' : 'Rare counterparty interaction'}.`,
            severity: Math.random() > 0.6 ? 'HIGH' : 'MEDIUM',
            detectedAt: new Date().toISOString(),
            riskScore: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)) // 0.6 to 1.0
        }));

        return {
            ...aiResponse,
            anomalies: anomalyReports,
            aiStatus: 'success'
        };
    }

    /**
     * Summarizes key information from a large set of search results into a concise text.
     * This helps users quickly grasp the essence of a large dataset.
     * @param {string} context - The search query or context for the summary.
     * @param {Array<Object>} results - The raw search results (array of entities) to summarize.
     * @param {number} [maxSummaryLength=250] - Maximum length of the generated summary text.
     * @returns {Promise<Object>} A promise resolving to an object containing the summary text and key insights.
     */
    async summarizeResults(context, results, maxSummaryLength = 250) {
        if (!GLOBAL_GEMINI_CONFIG.ENABLE_RESULT_SUMMARIZATION || DataUtils.isEmpty(results)) {
            Logger.debug('Result summarization disabled or no results to summarize, skipping.');
            return {
                summaryText: 'No significant results found to summarize.',
                keyInsights: [],
                aiStatus: 'skipped'
            };
        }

        const aiResponse = await this._simulateAIGeneric('ResultSummarization', {
            context,
            results: results.map(r => ({
                id: r.id,
                amount: r.amount,
                currency: r.currency,
                description: r.description
            })),
            maxSummaryLength
        });

        const totalAmount = results.filter(r => typeof r.amount === 'number').reduce((acc, r) => acc + r.amount, 0);
        const uniqueCurrencies = [...new Set(results.map(r => r.currency).filter(c => c))];
        const topEntities = results.slice(0, Math.min(results.length, 3)).map(r => r.name || r.description || `ID: ${r.id}`).join(', ');

        const summaryText = `Based on your search for "${context}", Gemini AI analyzed ${results.length} items. The total monetary value is approx. ${totalAmount.toFixed(2)} ${uniqueCurrencies.join('/') || 'N/A'}. Key entities include: ${topEntities}. Gemini highlights these as most relevant.`;
        const keyInsights = [{
            type: 'TotalValue',
            value: totalAmount,
            unit: uniqueCurrencies.join('/')
        }, {
            type: 'TopEntities',
            value: topEntities.split(', ').filter(Boolean)
        }, {
            type: 'ItemCount',
            value: results.length,
            unit: 'items'
        }];

        return {
            ...aiResponse,
            summaryText: summaryText.substring(0, maxSummaryLength),
            keyInsights: keyInsights,
            aiStatus: 'success'
        };
    }
}

/**
 * Initializes and exports a singleton instance of GeminiAIService.
 * This ensures consistency and avoids redundant instantiations across the application.
 * @type {GeminiAIService}
 */
export const geminiAIService = new GeminiAIService();


/**
 * Constants for internal system use and API interactions.
 * These provide a single source of truth for frequently used strings and values.
 * @readonly
 * @enum {string|number}
 */
export const SYSTEM_CONSTANTS = {
    ALL_ACCOUNTS_ID: "all-accounts-id-placeholder", // Represents selecting all accounts in a filter
    DEFAULT_PAGE: 1, // Default starting page number for pagination
    DEFAULT_PAGE_SIZE: GLOBAL_GEMINI_CONFIG.DEFAULT_PAGE_SIZE, // Configurable default number of items per page
    RESOURCE_TRANSACTIONS: 'transactions',
    RESOURCE_COUNTERPARTIES: 'counterparties',
    RESOURCE_PAYMENT_ORDERS: 'paymentOrders',
    RESOURCE_ACCOUNTS: 'accounts',
    RESOURCE_USERS: 'users',
    QUERY_PARAM_RESOURCE: 'resource', // URL query parameter for resource type
    QUERY_PARAM_METADATA: 'metadata', // URL query parameter for custom metadata filters
    QUERY_PARAM_PAGE: 'page', // URL query parameter for page number
    QUERY_PARAM_PAGE_SIZE: 'pageSize', // URL query parameter for items per page
    QUERY_PARAM_SORT_BY: 'sortBy', // URL query parameter for sorting field
    QUERY_PARAM_SORT_ORDER: 'sortOrder', // URL query parameter for sort direction
    SORT_ORDER_ASC: 'asc', // Ascending sort order
    SORT_ORDER_DESC: 'desc', // Descending sort order
    EVENT_SEARCH_COMPLETED: 'GEMINI_SEARCH_COMPLETED', // Custom event for search completion
    EVENT_SEARCH_FAILED: 'GEMINI_SEARCH_FAILED', // Custom event for search failure
    EVENT_AI_INSIGHTS_GENERATED: 'GEMINI_AI_INSIGHTS_GENERATED', // Custom event for AI insights
    MOCK_API_LATENCY_MIN: 200, // Minimum simulated API latency in milliseconds
    MOCK_API_LATENCY_MAX: 800 // Maximum simulated API latency in milliseconds
};

/**
 * Standard Redux action types for search and entity management within the Gemini application.
 * Using a single enum ensures type consistency and discoverability.
 * @readonly
 * @enum {string}
 */
export const ActionTypes = {
    QUERY_UPDATE: "GEMINI_QUERY_UPDATE", // Updates search query parameters in the store
    ENTITIES_LOAD: "GEMINI_ENTITIES_LOAD", // Loads a collection of entities into the store
    ENTITY_UPDATE: "GEMINI_ENTITY_UPDATE", // Updates a single entity in the store
    SEARCH_BEGIN_LOAD: "GEMINI_SEARCH_BEGIN_LOAD", // Indicates the start of a search operation
    SEARCH_FINISH_LOAD: "GEMINI_SEARCH_FINISH_LOAD", // Indicates successful completion of a search
    SEARCH_FAIL_LOAD: "GEMINI_SEARCH_FAIL_LOAD", // Indicates failure of a search operation
    AI_INSIGHTS_LOADED: "GEMINI_AI_INSIGHTS_LOADED", // Dispatches AI-generated insights to the store
    SEARCH_HISTORY_ADD: "GEMINI_SEARCH_HISTORY_ADD", // Adds a search query to the user's history
    SEARCH_HISTORY_CLEAR: "GEMINI_SEARCH_HISTORY_CLEAR", // Clears the entire search history
    SAVED_SEARCHES_LOADED: "GEMINI_SAVED_SEARCHES_LOADED", // Loads all saved searches into the store
    SAVED_SEARCH_ADDED: "GEMINI_SAVED_SEARCH_ADDED", // Adds a new saved search to the store
    SAVED_SEARCH_REMOVED: "GEMINI_SAVED_SEARCH_REMOVED", // Removes a saved search from the store
    UI_NOTIFICATION_SHOW: "GEMINI_UI_NOTIFICATION_SHOW", // Displays a UI notification
    UI_NOTIFICATION_HIDE: "GEMINI_UI_NOTIFICATION_HIDE", // Hides a specific UI notification
    BULK_ENTITIES_UPDATE: "GEMINI_BULK_ENTITIES_UPDATE", // Performs bulk updates on multiple entities
    BULK_ACTIONS_INITIATED: "GEMINI_BULK_ACTIONS_INITIATED", // Indicates the start of a bulk action
    BULK_ACTIONS_COMPLETED: "GEMINI_BULK_ACTIONS_COMPLETED", // Indicates the completion of a bulk action
    CLEAR_ENTITY_DATA: "GEMINI_CLEAR_ENTITY_DATA" // Clears all data for a specific entity type
};


/**
 * Redux action creators specific to managing counterparty entities.
 * These actions provide a structured way to interact with counterparty data in the Redux store.
 * @namespace counterpartyActions
 */
export const counterpartyActions = {
    /**
     * Creates an action to set or replace all counterparty entities in the store.
     * @param {Array<Object>} entities - An array of counterparty entity objects.
     * @returns {Object} The Redux action object.
     */
    setAll: (entities) => ({
        type: ActionTypes.ENTITIES_LOAD,
        payload: entities,
        entity: SYSTEM_CONSTANTS.RESOURCE_COUNTERPARTIES
    }),
    /**
     * Creates an action to update a single counterparty entity by its ID.
     * @param {Object} payload - A partial or full counterparty object with the updated data.
     * @param {string} id - The unique identifier of the counterparty to update.
     * @returns {Object} The Redux action object.
     */
    update: (payload, id) => ({
        type: ActionTypes.ENTITY_UPDATE,
        payload,
        entity: SYSTEM_CONSTANTS.RESOURCE_COUNTERPARTIES,
        id
    }),
    /**
     * Creates an action to clear all counterparty data from the store.
     * @returns {Object} The Redux action object.
     */
    clearAll: () => ({
        type: ActionTypes.CLEAR_ENTITY_DATA,
        entity: SYSTEM_CONSTANTS.RESOURCE_COUNTERPARTIES
    })
};

/**
 * Redux action creators specific to managing payment order entities.
 * These actions provide a structured way to interact with payment order data in the Redux store.
 * @namespace paymentOrderActions
 */
export const paymentOrderActions = {
    /**
     * Creates an action to set or replace all payment order entities in the store.
     * @param {Array<Object>} entities - An array of payment order entity objects.
     * @returns {Object} The Redux action object.
     */
    setAll: (entities) => ({
        type: ActionTypes.ENTITIES_LOAD,
        payload: entities,
        entity: SYSTEM_CONSTANTS.RESOURCE_PAYMENT_ORDERS
    }),
    /**
     * Creates an action to update a single payment order entity by its ID.
     * @param {Object} payload - A partial or full payment order object with the updated data.
     * @param {string} id - The unique identifier of the payment order to update.
     * @returns {Object} The Redux action object.
     */
    update: (payload, id) => ({
        type: ActionTypes.ENTITY_UPDATE,
        payload,
        entity: SYSTEM_CONSTANTS.RESOURCE_PAYMENT_ORDERS,
        id
    }),
    /**
     * Creates an action to clear all payment order data from the store.
     * @returns {Object} The Redux action object.
     */
    clearAll: () => ({
        type: ActionTypes.CLEAR_ENTITY_DATA,
        entity: SYSTEM_CONSTANTS.RESOURCE_PAYMENT_ORDERS
    })
};

/**
 * Redux action creator for updating specific query parameters for a given entity type.
 * This action is crucial for managing the search state in the UI and before API calls.
 * @param {string} entity - The entity type (e.g., 'transactions', 'counterparties') whose query is being updated.
 * @param {Object} queryUpdates - An object containing key-value pairs of the query parameters to update.
 * @returns {Object} The Redux action object.
 */
export function updateQuery(entity, queryUpdates) {
    Logger.debug(`Dispatching updateQuery for entity '${entity}':`, queryUpdates);
    return {
        type: ActionTypes.QUERY_UPDATE,
        queryUpdates,
        entity,
    };
}

/**
 * Redux action creator for loading a collection of entities into the Redux store.
 * This action is typically dispatched after a successful API fetch for entities.
 * @param {Object} payload - The payload containing entities (e.g., `payload.entities`) and pagination metadata (e.g., `payload.total_count`).
 * @param {string} entity - The type of entities being loaded.
 * @returns {Object} The Redux action object.
 */
export function loadEntities(payload, entity) {
    Logger.debug(`Dispatching loadEntities for entity '${entity}':`, payload);
    return {
        type: ActionTypes.ENTITIES_LOAD,
        payload,
        entity,
    };
}

/**
 * Redux action creator for updating a single entity within the Redux store.
 * This can be used for real-time updates or after an entity-specific API call (e.g., PUT).
 * @param {Object} payload - The partial or full entity data to apply as an update.
 * @param {string} entity - The type of the entity being updated.
 * @param {string} id - The unique identifier of the entity to update.
 * @returns {Object} The Redux action object.
 */
export function updateEntity(payload, entity, id) {
    Logger.debug(`Dispatching updateEntity for entity '${entity}' (ID: ${id}):`, payload);
    return {
        type: ActionTypes.ENTITY_UPDATE,
        payload,
        entity,
        id,
    };
}

/**
 * Redux action creator to signal the beginning of a search request for a specific entity type.
 * This is useful for managing loading states in the UI.
 * @param {string} entity - The entity type for which the search is beginning.
 * @returns {Object} The Redux action object.
 */
export function searchBeginLoad(entity) {
    Logger.trace(`Search begin load for entity: ${entity}`);
    return {
        type: ActionTypes.SEARCH_BEGIN_LOAD,
        entity
    };
}

/**
 * Redux action creator to signal the successful completion of a search request.
 * Resets loading indicators.
 * @param {string} entity - The entity type for which the search has finished.
 * @returns {Object} The Redux action object.
 */
export function searchFinishLoad(entity) {
    Logger.trace(`Search finish load for entity: ${entity}`);
    return {
        type: ActionTypes.SEARCH_FINISH_LOAD,
        entity
    };
}

/**
 * Redux action creator to signal a failed search request.
 * Sets an error state and provides error details for display.
 * @param {string} entity - The entity type for which the search failed.
 * @param {GeminiSystemError|Error|string} error - The error object or a descriptive error message.
 * @returns {Object} The Redux action object, including error message and code.
 */
export function searchFailLoad(entity, error) {
    Logger.error(`Search failed for entity '${entity}':`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error instanceof GeminiSystemError ? error.code : GeminiErrorCodes.UNKNOWN_ERROR;
    return {
        type: ActionTypes.SEARCH_FAIL_LOAD,
        entity,
        payload: {
            error: errorMessage,
            code: errorCode,
            details: error instanceof GeminiSystemError ? error.details : {}
        }
    };
}

/**
 * Redux action creator for displaying a dynamic UI notification to the user.
 * @param {string} message - The content of the notification message.
 * @param {'info'|'success'|'warning'|'error'} [type='info'] - The severity/type of the notification.
 * @param {number} [duration=5000] - How long the notification should remain visible, in milliseconds. Use 0 for sticky notifications.
 * @param {string} [id=DataUtils.generateUniqueId()] - A unique identifier for the notification, allowing it to be hidden later.
 * @returns {Object} The Redux action object.
 */
export function showUINotification(message, type = 'info', duration = 5000, id = `notification_${DataUtils.generateUniqueId()}`) {
    Logger.info(`Displaying UI notification: [${type}] ${message}`);
    return {
        type: ActionTypes.UI_NOTIFICATION_SHOW,
        payload: {
            id,
            message,
            type,
            duration,
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * Redux action creator for explicitly hiding a specific UI notification.
 * @param {string} id - The unique identifier of the notification to hide.
 * @returns {Object} The Redux action object.
 */
export function hideUINotification(id) {
    Logger.info(`Hiding UI notification with ID: ${id}`);
    return {
        type: ActionTypes.UI_NOTIFICATION_HIDE,
        payload: {
            id
        }
    };
}

/**
 * Redux action creator for dispatching AI-generated insights to the store.
 * These insights typically augment search results or provide additional analytical context.
 * @param {string} entity - The entity type to which the AI insights pertain.
 * @param {Object} insights - The AI-generated insights payload (e.g., semantic matches, anomalies, summary).
 * @returns {Object} The Redux action object.
 */
export function loadAIInsights(entity, insights) {
    Logger.debug(`Dispatching AI insights for entity '${entity}':`, insights);
    return {
        type: ActionTypes.AI_INSIGHTS_LOADED,
        payload: insights,
        entity
    };
}

/**
 * Redux action creator for adding a new search query to the user's search history.
 * @param {string} entity - The entity type that was searched.
 * @param {Object} query - The search query object to record.
 * @returns {Object} The Redux action object.
 */
export function addSearchToHistory(entity, query) {
    Logger.debug(`Adding search to history for entity '${entity}':`, query);
    return {
        type: ActionTypes.SEARCH_HISTORY_ADD,
        payload: {
            entity,
            query: DataUtils.deepClone(query),
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * Redux action creator for performing bulk updates on multiple entities of a given type.
 * @param {string} entity - The entity type being updated.
 * @param {Array<Object>} updates - An array of objects, where each object contains an 'id' and the partial data to update for that entity.
 * @returns {Object} The Redux action object.
 */
export function bulkEntitiesUpdate(entity, updates) {
    if (!Array.isArray(updates) || updates.some(u => !DataUtils.isValidUUID(u.id))) {
        Logger.error('Bulk update payload is invalid: must be an array of objects with valid UUIDs.');
        throw new GeminiSystemError('Invalid payload for bulk entity update.', GeminiErrorCodes.VALIDATION_ERROR);
    }
    Logger.debug(`Dispatching bulkEntitiesUpdate for entity '${entity}' with ${updates.length} updates.`);
    return {
        type: ActionTypes.BULK_ENTITIES_UPDATE,
        payload: updates,
        entity
    };
}


/**
 * A robust class designed to build, manage, and serialize complex search queries.
 * It encapsulates query parameters like pagination, filters, sorting, and custom metadata.
 * @class
 */
export class SearchQuery {
    /**
     * Initializes a new SearchQuery instance.
     * @param {string} resource - The type of resource being searched (e.g., 'transactions', 'counterparties').
     * @param {Object} [initialQuery={}] - An optional object to pre-populate query parameters.
     */
    constructor(resource, initialQuery = {}) {
        if (DataUtils.isEmpty(resource)) {
            Logger.error('SearchQuery initialized without a resource type. This is a critical error.');
            throw new GeminiSystemError('Resource type is required for SearchQuery initialization.', GeminiErrorCodes.INVALID_QUERY_PARAMETER);
        }
        this.resource = resource;
        this.query = {
            page: SYSTEM_CONSTANTS.DEFAULT_PAGE,
            pageSize: SYSTEM_CONSTANTS.DEFAULT_PAGE_SIZE,
            filters: {}, // Key-value pairs for filtering (e.g., { status: 'active', amount_gt: 100 })
            sortBy: null, // Field to sort by
            sortOrder: SYSTEM_CONSTANTS.SORT_ORDER_DESC, // 'asc' or 'desc'
            metadata: {}, // Custom application-specific search parameters
            searchTerms: null, // Natural language search terms (for generic search/semantic search)
            ...initialQuery
        };
        Logger.debug(`SearchQuery initialized for resource '${this.resource}':`, this.query);
        this._normalizeQuery();
    }

    /**
     * Internal method to normalize query parameters, ensuring consistency.
     * @private
     */
    _normalizeQuery() {
        this.query.page = Math.max(SYSTEM_CONSTANTS.DEFAULT_PAGE, parseInt(this.query.page, 10) || SYSTEM_CONSTANTS.DEFAULT_PAGE);
        this.query.pageSize = Math.max(1, parseInt(this.query.pageSize, 10) || SYSTEM_CONSTANTS.DEFAULT_PAGE_SIZE);
        if (![SYSTEM_CONSTANTS.SORT_ORDER_ASC, SYSTEM_CONSTANTS.SORT_ORDER_DESC].includes(this.query.sortOrder)) {
            this.query.sortOrder = SYSTEM_CONSTANTS.SORT_ORDER_DESC;
        }
        if (typeof this.query.filters !== 'object' || this.query.filters === null) {
            this.query.filters = {};
        }
        if (typeof this.query.metadata !== 'object' || this.query.metadata === null) {
            this.query.metadata = {};
        }
        // If 'all accounts' ID is explicitly set, remove the filter to signify broad search
        if (this.query.originating_account_id === SYSTEM_CONSTANTS.ALL_ACCOUNTS_ID) {
            delete this.query.originating_account_id;
        }
    }

    /**
     * Updates one or more existing query parameters with new values.
     * Automatically resets the page to 1 if filters or search terms are modified.
     * @param {Object} updates - An object containing key-value pairs of parameters to update.
     * @returns {SearchQuery} The current SearchQuery instance for method chaining.
     */
    update(updates) {
        if (DataUtils.isEmpty(updates)) {
            Logger.debug('SearchQuery.update called with empty updates, doing nothing.');
            return this;
        }

        // Deep merge for nested objects like `filters` and `metadata`
        if (updates.filters) {
            this.query.filters = { ...this.query.filters,
                ...updates.filters
            };
            delete updates.filters;
        }
        if (updates.metadata) {
            this.query.metadata = { ...this.query.metadata,
                ...updates.metadata
            };
            delete updates.metadata;
        }

        const oldSearchTerms = this.query.searchTerms;
        const oldFilters = JSON.stringify(this.query.filters); // For shallow comparison

        this.query = {
            ...this.query,
            ...updates
        };

        // Reset page if significant search criteria change
        if (this.query.searchTerms !== oldSearchTerms || JSON.stringify(this.query.filters) !== oldFilters) {
            this.query.page = SYSTEM_CONSTANTS.DEFAULT_PAGE;
            Logger.debug('Search terms or filters changed, resetting page to 1.');
        }

        this._normalizeQuery(); // Re-normalize after updates
        Logger.trace(`SearchQuery updated for resource '${this.resource}':`, this.query);
        return this;
    }

    /**
     * Sets a specific filter key-value pair.
     * @param {string} key - The key of the filter.
     * @param {any} value - The value for the filter. `null` or `undefined` will remove the filter.
     * @returns {SearchQuery} The current SearchQuery instance.
     */
    setFilter(key, value) {
        if (DataUtils.isNil(value) || value === '') {
            return this.removeFilter(key);
        }
        this.query.filters[key] = value;
        this.query.page = SYSTEM_CONSTANTS.DEFAULT_PAGE; // Reset page on filter change
        Logger.trace(`Filter '${key}' set to '${value}' for resource '${this.resource}'.`);
        this._normalizeQuery();
        return this;
    }

    /**
     * Removes a specific filter by its key.
     * @param {string} key - The filter key to remove.
     * @returns {SearchQuery} The current SearchQuery instance.
     */
    removeFilter(key) {
        if (this.query.filters.hasOwnProperty(key)) {
            delete this.query.filters[key];
            this.query.page = SYSTEM_CONSTANTS.DEFAULT_PAGE; // Reset page on filter change
            Logger.trace(`Filter '${key}' removed for resource '${this.resource}'.`);
        }
        this._normalizeQuery();
        return this;
    }

    /**
     * Sets the field and order for sorting the search results.
     * @param {string} sortBy - The field name to sort the results by.
     * @param {string} [sortOrder=SYSTEM_CONSTANTS.SORT_ORDER_DESC] - The sort order, 'asc' for ascending or 'desc' for descending.
     * @returns {SearchQuery} The current SearchQuery instance.
     */
    setSort(sortBy, sortOrder = SYSTEM_CONSTANTS.SORT_ORDER_DESC) {
        this.query.sortBy = DataUtils.sanitizeString(sortBy);
        this.query.sortOrder = [SYSTEM_CONSTANTS.SORT_ORDER_ASC, SYSTEM_CONSTANTS.SORT_ORDER_DESC].includes(sortOrder) ? sortOrder : SYSTEM_CONSTANTS.SORT_ORDER_DESC;
        Logger.trace(`Sort set to '${this.query.sortBy}' '${this.query.sortOrder}' for resource '${this.resource}'.`);
        this._normalizeQuery();
        return this;
    }

    /**
     * Advances the current page number by a specified increment.
     * @param {number} [increment=1] - The number of pages to advance (can be negative for previous pages).
     * @returns {SearchQuery} The current SearchQuery instance.
     */
    advancePage(increment = 1) {
        this.query.page = Math.max(SYSTEM_CONSTANTS.DEFAULT_PAGE, this.query.page + increment);
        Logger.trace(`Page advanced to ${this.query.page} for resource '${this.resource}'.`);
        this._normalizeQuery();
        return this;
    }

    /**
     * Resets the current page number to the default (typically 1).
     * @returns {SearchQuery} The current SearchQuery instance.
     */
    resetPage() {
        this.query.page = SYSTEM_CONSTANTS.DEFAULT_PAGE;
        Logger.trace(`Page reset to ${this.query.page} for resource '${this.resource}'.`);
        this._normalizeQuery();
        return this;
    }

    /**
     * Generates a URL-encoded query string from the current query state.
     * This string is suitable for direct use in API requests.
     * @returns {string} The URL-encoded query string, including resource type.
     */
    toQueryString() {
        const queryParams = {
            [SYSTEM_CONSTANTS.QUERY_PARAM_RESOURCE]: this.resource,
            [SYSTEM_CONSTANTS.QUERY_PARAM_PAGE]: this.query.page,
            [SYSTEM_CONSTANTS.QUERY_PARAM_PAGE_SIZE]: this.query.pageSize,
        };

        if (this.query.sortBy) {
            queryParams[SYSTEM_CONSTANTS.QUERY_PARAM_SORT_BY] = this.query.sortBy;
            queryParams[SYSTEM_CONSTANTS.QUERY_PARAM_SORT_ORDER] = this.query.sortOrder;
        }

        if (this.query.searchTerms) {
            queryParams.q = DataUtils.sanitizeString(this.query.searchTerms); // 'q' is a common parameter for general search query
        }

        // Flatten filters into query params (e.g., filter[status]=active)
        for (const key in this.query.filters) {
            if (Object.prototype.hasOwnProperty.call(this.query.filters, key) && !DataUtils.isNil(this.query.filters[key]) && String(this.query.filters[key]).trim() !== '') {
                queryParams[`filter[${key}]`] = String(this.query.filters[key]);
            }
        }

        // Flatten metadata into query params (e.g., meta[source]=crm)
        for (const key in this.query.metadata) {
            if (Object.prototype.hasOwnProperty.call(this.query.metadata, key) && !DataUtils.isNil(this.query.metadata[key]) && String(this.query.metadata[key]).trim() !== '') {
                queryParams[`meta[${key}]`] = String(this.query.metadata[key]);
            }
        }

        const queryString = DataUtils.stringifyQueryParams(queryParams);
        Logger.trace(`Generated query string for resource '${this.resource}': ${queryString}`);
        return queryString;
    }

    /**
     * Returns a deep clone of the current raw query object.
     * @returns {Object} A pristine copy of the internal query state.
     */
    getQueryObject() {
        return DataUtils.deepClone(this.query);
    }

    /**
     * Compares this query with another query object to check if they are functionally identical.
     * Ignores non-functional properties like internal timestamps.
     * @param {Object} otherQueryObj - The other query object to compare against.
     * @returns {boolean} True if the queries are functionally equivalent, false otherwise.
     */
    isEqual(otherQueryObj) {
        if (!otherQueryObj || typeof otherQueryObj !== 'object') {
            return false;
        }

        const thisQuery = this.getQueryObject();
        const otherNormalizedQuery = new SearchQuery(thisQuery.resource, otherQueryObj).getQueryObject();

        // Compare key functional properties
        const functionalKeys = ['page', 'pageSize', 'filters', 'sortBy', 'sortOrder', 'searchTerms', 'metadata'];

        for (const key of functionalKeys) {
            if (key === 'filters' || key === 'metadata') {
                if (JSON.stringify(thisQuery[key]) !== JSON.stringify(otherNormalizedQuery[key])) {
                    return false;
                }
            } else if (thisQuery[key] !== otherNormalizedQuery[key]) {
                return false;
            }
        }
        return true;
    }
}

/**
 * A central service to manage and orchestrate complex search operations within the application.
 * It integrates with the {@link GeminiAPIClient} for data fetching and {@link GeminiAIService}
 * for intelligent enhancements, providing a unified search experience.
 * @class
 */
export class SearchManager {
    /**
     * Creates an instance of SearchManager.
     * @param {GeminiAPIClient} apiClient - An instance of the {@link GeminiAPIClient} for backend communication.
     * @param {GeminiAIService} aiService - An instance of the {@link GeminiAIService} for AI-powered insights.
     */
    constructor(apiClient, aiService) {
        if (!apiClient || !aiService) {
            Logger.error('SearchManager initialized without valid API client or AI service instances.', {
                apiClient: !!apiClient,
                aiService: !!aiService
            });
            throw new GeminiSystemError('APIClient and AIService instances are required for SearchManager.', GeminiErrorCodes.INTERNAL_SYSTEM_ERROR);
        }
        this.apiClient = apiClient;
        this.aiService = aiService;
        Logger.debug('SearchManager initialized successfully.');
    }

    /**
     * Executes a comprehensive search operation, potentially incorporating AI enhancements.
     * This method acts as the primary orchestrator, fetching data, applying AI models,
     * and consolidating results and insights.
     * @param {string} entityType - The type of entity to search for (e.g., 'transactions', 'counterparties').
     * @param {Object} rawQueryParams - The raw query parameters object received from the UI or Redux state.
     * @param {boolean} [enableAI=true] - A flag indicating whether to enable Gemini AI enhancements for this specific search.
     * @returns {Promise<Object>} A promise resolving to an object containing `data` (processed search results),
     *                            `aiInsights` (any generated AI data), and `searchQuery` (the final resolved query).
     */
    async executeSearch(entityType, rawQueryParams, enableAI = true) {
        Logger.info(`Executing search for entity '${entityType}' with AI enabled: ${enableAI}`);
        Logger.debug('Raw query parameters:', rawQueryParams);

        try {
            const searchQuery = new SearchQuery(entityType, rawQueryParams);
            const queryString = searchQuery.toQueryString();

            // 1. Initial Data Fetch from Core Data Service
            const apiEndpoint = `${GLOBAL_GEMINI_CONFIG.DATA_SERVICE_ENDPOINT}/${entityType}`;
            const apiResults = await this.apiClient.get(apiEndpoint, DataUtils.parseQueryParams(queryString));
            Logger.debug(`Initial data fetch for '${entityType}' successful. Found ${apiResults.total_count || 0} items.`);

            let processedResults = DataUtils.deepClone(apiResults);
            const aiInsights = {};

            // 2. Apply AI Enhancements (if enabled and configured)
            if (enableAI) {
                Logger.debug('Initiating AI enhancement process...');

                // Semantic Search for better query understanding
                if (GLOBAL_GEMINI_CONFIG.ENABLE_SEMANTIC_SEARCH && searchQuery.getQueryObject().searchTerms) {
                    try {
                        const semanticResponse = await this.aiService.semanticSearch(
                            searchQuery.getQueryObject().searchTerms,
                            processedResults, {
                                entityType
                            }
                        );
                        if (semanticResponse.aiStatus === 'success') {
                            processedResults = semanticResponse.enhancedResults; // Update results with AI enhancements
                            aiInsights.semantic = semanticResponse;
                            Logger.debug('Semantic search insights applied.');
                        } else {
                            Logger.warn(`Semantic search skipped or failed: ${semanticResponse.reason}`);
                        }
                    } catch (aiError) {
                        Logger.error(`Semantic search AI service failed for '${entityType}':`, aiError);
                        aiInsights.semantic = {
                            aiStatus: 'error',
                            error: aiError.message
                        };
                    }
                }

                // Anomaly Detection for unusual patterns
                if (GLOBAL_GEMINI_CONFIG.ENABLE_ANOMALY_DETECTION && processedResults.entities && processedResults.entities.length > 0) {
                    try {
                        const anomalyResponse = await this.aiService.detectAnomalies(processedResults.entities, {
                            entityType
                        });
                        if (anomalyResponse.aiStatus === 'success') {
                            aiInsights.anomalies = anomalyResponse.anomalies;
                            Logger.debug('Anomaly detection insights applied.');
                        } else {
                            Logger.warn(`Anomaly detection skipped or failed: ${anomalyResponse.reason}`);
                        }
                    } catch (aiError) {
                        Logger.error(`Anomaly detection AI service failed for '${entityType}':`, aiError);
                        aiInsights.anomalies = {
                            aiStatus: 'error',
                            error: aiError.message
                        };
                    }
                }

                // Sentiment Analysis for descriptive texts
                if (GLOBAL_GEMINI_CONFIG.ENABLE_SENTIMENT_ANALYSIS && processedResults.entities && processedResults.entities.length > 0) {
                    try {
                        const sentimentResponse = await this.aiService.analyzeSentiment(processedResults.entities);
                        if (sentimentResponse.aiStatus === 'success') {
                            aiInsights.sentiment = sentimentResponse;
                            Logger.debug('Sentiment analysis insights applied.');
                        } else {
                            Logger.warn(`Sentiment analysis skipped or failed: ${sentimentResponse.reason}`);
                        }
                    } catch (aiError) {
                        Logger.error(`Sentiment analysis AI service failed for '${entityType}':`, aiError);
                        aiInsights.sentiment = {
                            aiStatus: 'error',
                            error: aiError.message
                        };
                    }
                }

                // Result Summarization for quick overview
                if (GLOBAL_GEMINI_CONFIG.ENABLE_RESULT_SUMMARIZATION && processedResults.entities && processedResults.entities.length > 0) {
                    try {
                        const summaryResponse = await this.aiService.summarizeResults(
                            searchQuery.getQueryObject().searchTerms || entityType,
                            processedResults.entities
                        );
                        if (summaryResponse.aiStatus === 'success') {
                            aiInsights.summary = summaryResponse;
                            Logger.debug('Result summarization insights applied.');
                        } else {
                            Logger.warn(`Result summarization skipped or failed: ${summaryResponse.reason}`);
                        }
                    } catch (aiError) {
                        Logger.error(`Result summarization AI service failed for '${entityType}':`, aiError);
                        aiInsights.summary = {
                            aiStatus: 'error',
                            error: aiError.message
                        };
                    }
                }
            } else {
                Logger.info('AI enhancements are explicitly disabled for this search.');
            }

            Logger.info(`Search for '${entityType}' completed successfully with AI status: ${enableAI ? 'enabled' : 'disabled'}.`);
            return {
                data: processedResults,
                aiInsights: aiInsights,
                searchQuery: searchQuery.getQueryObject() // Return the final, resolved query object
            };

        } catch (error) {
            // Log and re-throw, allowing the Redux thunk to handle dispatching `searchFailLoad`
            Logger.error(`Search execution failed for entity '${entityType}' due to: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * Fetches real-time search suggestions and potential query corrections based on partial user input.
     * Leverages the Gemini AI Service for intelligent suggestions.
     * @param {string} partialQuery - The incomplete search string typed by the user.
     * @param {string[]} [recentSearches=[]] - An array of recent user search terms to provide context.
     * @returns {Promise<Object>} An object containing `suggestions` and `corrections` arrays.
     */
    async getSuggestions(partialQuery, recentSearches = []) {
        if (!GLOBAL_GEMINI_CONFIG.ENABLE_AI_SUGGESTIONS) {
            Logger.debug('AI suggestions are globally disabled.');
            return {
                suggestions: [],
                corrections: [],
                aiStatus: 'disabled'
            };
        }
        Logger.info(`Fetching search suggestions for partial query: '${partialQuery}'`);
        try {
            const suggestions = await this.aiService.getSearchSuggestions(partialQuery, recentSearches);
            Logger.debug('Search suggestions fetched successfully.', suggestions);
            return suggestions;
        } catch (error) {
            Logger.error(`Failed to fetch search suggestions for '${partialQuery}': ${error.message}`, error);
            // Return an empty set of suggestions on error to avoid breaking the UI
            return {
                suggestions: [],
                corrections: [],
                aiStatus: 'error',
                error: error.message
            };
        }
    }
}

/**
 * Initializes and exports a singleton instance of SearchManager.
 * This ensures consistency and centralized control over all search operations.
 * @type {SearchManager}
 */
export const geminiSearchManager = new SearchManager(geminiApiClient, geminiAIService);

/**
 * The primary search action creator that orchestrates API calls, AI processing,
 * and Redux state updates. This is the main public interface for initiating
 * a search operation within the application. It dispatches multiple actions
 * throughout the lifecycle of a search (loading, success, failure, AI insights).
 * @param {string} entity - The entity type to search for (e.g., 'transactions').
 * @param {Object} query - The search query object (e.g., from Redux state or URL).
 * @param {boolean} [enableAI=true] - Flag to enable or disable AI enhancements for this specific search.
 * @returns {Function} A Redux thunk function that dispatches actions and handles async logic.
 */
export function searchApi(entity, query, enableAI = true) {
    return async (dispatch) => {
        dispatch(searchBeginLoad(entity)); // Signal start of search
        dispatch(addSearchToHistory(entity, query)); // Record the search query for history

        try {
            const {
                data: jsonData,
                aiInsights,
                searchQuery: finalQuery
            } = await geminiSearchManager.executeSearch(entity, query, enableAI);

            // Dispatch entity-specific data to the Redux store
            Object.entries(jsonData).forEach(([key, value]) => {
                if (!value || DataUtils.isEmpty(value.entities)) {
                    Logger.debug(`No entities found for key '${key}' in search results, skipping dispatch.`);
                    return;
                }
                switch (key) {
                    case SYSTEM_CONSTANTS.RESOURCE_COUNTERPARTIES:
                        dispatch(counterpartyActions.setAll(value.entities));
                        break;
                    case SYSTEM_CONSTANTS.RESOURCE_PAYMENT_ORDERS:
                        dispatch(paymentOrderActions.setAll(value.entities));
                        break;
                    case SYSTEM_CONSTANTS.RESOURCE_TRANSACTIONS:
                    default:
                        // Default case for the primary entity and any other nested entities returned
                        dispatch(loadEntities(value, key));
                        break;
                }
            });

            // Dispatch AI insights if any were generated
            if (!DataUtils.isEmpty(aiInsights)) {
                dispatch(loadAIInsights(entity, aiInsights));
                // Show a subtle notification that AI has contributed
                if (Object.keys(aiInsights).length > 0) {
                    dispatch(showUINotification(`Gemini AI provided enhanced insights for your ${entity} search.`, 'info', 3000));
                }
            }

            dispatch(searchFinishLoad(entity)); // Signal successful completion
            Logger.info(`searchApi for '${entity}' completed. Returning results.`);
            // Return the full processed data for potential chaining or direct use by the caller
            return {
                jsonData,
                aiInsights,
                finalQuery
            };

        } catch (error) {
            Logger.error(`searchApi encountered a critical error for entity '${entity}': ${error.message}`, error);
            dispatch(searchFailLoad(entity, error)); // Signal search failure
            dispatch(showUINotification(`Gemini says: We had trouble with your search for ${entity}. Details: ${error.message}`, 'error', 7000));
            throw error; // Propagate error for any higher-level error handling components
        }
    };
}


/**
 * Helper function to update the browser's URL based on the current search query state.
 * This keeps the URL in sync with the application's search filters, enabling shareable links and browser history.
 * @param {Object} query - The current search query object (a plain JS object).
 * @param {string} entity - The entity type associated with the query.
 */
function pushNewUrl(query, entity) {
    if (typeof window === 'undefined' || !window.history || !window.location) {
        Logger.warn('pushNewUrl called in a non-browser environment or history API is unavailable. Skipping URL update.');
        return;
    }
    try {
        const searchQueryInstance = new SearchQuery(entity, query);
        const queryStringForUrl = searchQueryInstance.toQueryString();
        const newUrl = `${window.location.pathname}?${queryStringForUrl}`;

        if (window.location.search === `?${queryStringForUrl}`) {
            Logger.debug('URL is already up-to-date, skipping replaceState.');
            return;
        }

        window.history.replaceState(null, '', newUrl); // Use replaceState to avoid cluttering browser history
        Logger.debug(`Browser URL updated to: ${newUrl}`);
    } catch (error) {
        Logger.error('Failed to update browser URL:', error);
        // Do not throw a fatal error here, as URL update is secondary to search functionality
        dispatch(showUINotification('Failed to update browser URL. You might experience inconsistent navigation.', 'warning', 5000));
    }
}

/**
 * Initiates a search for a specific entity type, potentially updating pagination and the browser's URL.
 * This is a high-level Redux thunk action designed for UI components to trigger a comprehensive search.
 * It combines query updates, URL synchronization, and the core search API call.
 * @param {string} entity - The entity type (e.g., 'transactions') to search for.
 * @param {number|null} [page=null] - The desired page number. If `null`, the current page from Redux state is used.
 * @param {boolean} [updateUrl=true] - If `true`, the browser's URL will be updated with the new query parameters.
 * @param {boolean} [enableAI=true] - If `true`, Gemini AI enhancements will be enabled for this search.
 * @returns {Function} A Redux thunk function.
 */
export function searchEntity(
    entity,
    page = null,
    updateUrl = true,
    enableAI = true,
) {
    return async (dispatch, getState) => {
        Logger.info(`Initiating searchEntity for '${entity}', target page: ${page || 'current'}, updateUrl: ${updateUrl}, enableAI: ${enableAI}`);

        const entityState = getState()[entity];
        if (!entityState || DataUtils.isNil(entityState.query)) {
            Logger.error(`Redux state for entity '${entity}' not found or query is missing. Cannot proceed with search.`);
            dispatch(showUINotification(`Configuration error: No search state found for ${entity}.`, 'error', 7000));
            dispatch(searchFailLoad(entity, new GeminiSystemError(`Missing state for entity: ${entity}`, GeminiErrorCodes.INTERNAL_SYSTEM_ERROR)));
            return;
        }

        const currentQuery = entityState.query;
        // Determine the target page number, prioritizing explicit `page` parameter, then current state, then default.
        const newPage = page !== null ? page : (currentQuery.page || SYSTEM_CONSTANTS.DEFAULT_PAGE);

        // Create a temporary SearchQuery instance to apply updates and get the *new* query object
        const tempQueryBuilder = new SearchQuery(entity, currentQuery);
        tempQueryBuilder.update({
            page: newPage
        });
        const updatedQueryObject = tempQueryBuilder.getQueryObject();

        // Dispatch query update immediately so the UI can reflect the new page number/filters
        dispatch(updateQuery(entity, {
            page: newPage
        }));

        if (updateUrl) {
            pushNewUrl(updatedQueryObject, entity);
        }

        // Execute the actual search API call using the resolved query parameters
        try {
            Logger.debug(`Dispatching searchApi for '${entity}' with query:`, updatedQueryObject);
            return await dispatch(searchApi(entity, updatedQueryObject, enableAI));
        } catch (error) {
            // The searchApi thunk already handles dispatching searchFailLoad and showing notifications.
            // Re-throwing here allows any parent async actions to catch and potentially react.
            Logger.error(`searchEntity failed for '${entity}' during searchApi execution.`, error);
            throw error;
        }
    };
}


/**
 * Navigates to the next or previous page of search results for a given entity.
 * This action handles updating the page number, triggering a search (unless skipped),
 * and optionally scrolling the window to the top.
 * @param {string} entity - The entity type.
 * @param {boolean} isNext - If `true`, moves to the next page; if `false`, moves to the previous page.
 * @param {boolean} [skipSearch=false] - If `true`, only updates the query state and URL, without triggering a full API search.
 * @param {boolean} [skipScroll=false] - If `true`, prevents the window from scrolling to the top after page change.
 * @param {boolean} [enableAI=true] - Whether to enable AI enhancements for the subsequent search.
 * @returns {Function} A Redux thunk function.
 */
export function loadPage(
    entity,
    isNext,
    skipSearch = false,
    skipScroll = false,
    enableAI = true,
) {
    return async (dispatch, getState) => {
        Logger.info(`Attempting to load page for entity '${entity}', isNext: ${isNext}, skipSearch: ${skipSearch}, skipScroll: ${skipScroll}`);

        const entityState = getState()[entity];
        if (!entityState || !entityState.query) {
            Logger.error(`Redux state or query for entity '${entity}' not found. Cannot load page.`);
            dispatch(showUINotification(`Configuration error: Cannot load page for ${entity}.`, 'error', 7000));
            dispatch(searchFailLoad(entity, new GeminiSystemError(`Missing state for entity: ${entity}`, GeminiErrorCodes.INTERNAL_SYSTEM_ERROR)));
            return;
        }

        const currentPage = entityState.query.page || SYSTEM_CONSTANTS.DEFAULT_PAGE;
        const totalCount = entityState.total_count || 0;
        const pageSize = entityState.query.pageSize || SYSTEM_CONSTANTS.DEFAULT_PAGE_SIZE;
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize)); // Ensure at least 1 page

        let newPage = currentPage + (isNext ? 1 : -1);
        newPage = Math.max(SYSTEM_CONSTANTS.DEFAULT_PAGE, Math.min(newPage, totalPages)); // Clamp page number within valid range

        if (newPage === currentPage && !skipSearch) {
            Logger.debug(`Attempted to move to current page or beyond bounds for entity '${entity}'. No page change.`);
            dispatch(showUINotification('You are already on the first or last page of results.', 'warning', 3000));
            return;
        }

        // Dispatch query update to reflect the new page number immediately in the UI
        dispatch(updateQuery(entity, {
            page: newPage
        }));

        if (!skipSearch) {
            try {
                // `searchEntity` handles the actual API call and URL update
                await dispatch(searchEntity(entity, newPage, true, enableAI));
            } catch (error) {
                Logger.error(`Failed to load page ${newPage} for entity '${entity}'.`, error);
                // Errors are already handled by `searchApi` and `searchEntity`
                return;
            }
        } else {
            // If skipping search (e.g., just updating the URL), ensure URL is synchronized
            const updatedQuery = DataUtils.deepClone(getState()[entity].query);
            pushNewUrl(updatedQuery, entity);
        }

        if (!skipScroll && typeof window !== 'undefined') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            Logger.debug('Scrolled window to top after page change.');
        }
    };
}


/**
 * Module for managing Saved Searches in the application.
 * It provides static methods for loading, adding, removing, and retrieving
 * saved search queries from local storage, enhancing user productivity.
 * @namespace SavedSearches
 */
export class SavedSearchManager {
    static STORAGE_KEY = 'gemini_saved_searches_v2'; // Versioned key for potential schema changes

    /**
     * Loads all saved searches from local storage.
     * @static
     * @returns {Array<Object>} An array of saved search objects. Returns an empty array if none found or an error occurs.
     */
    static loadSavedSearches() {
        if (typeof window === 'undefined' || !window.localStorage) {
            Logger.warn('SavedSearchManager.loadSavedSearches called in non-browser environment or localStorage not available.');
            return [];
        }
        try {
            const savedSearchesJson = localStorage.getItem(SavedSearchManager.STORAGE_KEY);
            return savedSearchesJson ? JSON.parse(savedSearchesJson) : [];
        } catch (error) {
            Logger.error('Error loading saved searches from local storage:', error);
            // In case of data corruption, consider clearing the key to avoid persistent errors
            // localStorage.removeItem(SavedSearchManager.STORAGE_KEY);
            // Logger.warn('Cleared potentially corrupted saved searches from local storage.');
            return [];
        }
    }

    /**
     * Persists an array of search objects to local storage.
     * @private
     * @static
     * @param {Array<Object>} searches - The array of saved search objects to persist.
     */
    static _saveSearches(searches) {
        if (typeof window === 'undefined' || !window.localStorage) {
            Logger.warn('SavedSearchManager._saveSearches called in non-browser environment or localStorage not available.');
            return;
        }
        try {
            localStorage.setItem(SavedSearchManager.STORAGE_KEY, JSON.stringify(searches));
            Logger.trace('Saved searches successfully persisted to local storage.');
        } catch (error) {
            Logger.error('Error saving searches to local storage:', error);
            throw new GeminiSystemError('Failed to save search to local storage.', GeminiErrorCodes.INTERNAL_SYSTEM_ERROR, 500, {
                originalError: error.message
            });
        }
    }

    /**
     * Adds a new search query to the list of saved searches.
     * @static
     * @param {string} name - A user-friendly name for the saved search. Must be unique.
     * @param {string} entityType - The type of entity associated with the search.
     * @param {Object} query - The raw query object to save.
     * @returns {Object} The newly added saved search object, including its generated ID.
     * @throws {GeminiSystemError} If `name`, `entityType`, or `query` is invalid, or if a search with the same name already exists.
     */
    static addSavedSearch(name, entityType, query) {
        if (DataUtils.isEmpty(name) || typeof name !== 'string' || DataUtils.isEmpty(entityType) || typeof entityType !== 'string' || DataUtils.isEmpty(query) || typeof query !== 'object') {
            throw new GeminiSystemError('Name, entity type, and a valid query object are required to save a search.', GeminiErrorCodes.VALIDATION_ERROR);
        }

        const currentSearches = SavedSearchManager.loadSavedSearches();
        // Ensure uniqueness of the name (case-insensitive)
        if (currentSearches.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            throw new GeminiSystemError(`A saved search with the name '${name}' already exists. Please choose a different name.`, GeminiErrorCodes.VALIDATION_ERROR);
        }

        const newSavedSearch = {
            id: `ss_${DataUtils.generateUniqueId()}`,
            name: DataUtils.sanitizeString(name),
            entityType: DataUtils.sanitizeString(entityType),
            query: new SearchQuery(entityType, query).getQueryObject(), // Store a normalized query
            createdAt: new Date().toISOString(),
            lastUsedAt: null // Will be updated when retrieved
        };
        currentSearches.push(newSavedSearch);
        SavedSearchManager._saveSearches(currentSearches);
        Logger.info(`Saved search added successfully: '${newSavedSearch.name}' (ID: ${newSavedSearch.id})`);
        return newSavedSearch;
    }

    /**
     * Removes a saved search from the list by its unique identifier.
     * @static
     * @param {string} id - The unique ID of the saved search to remove.
     * @returns {boolean} `true` if the search was found and removed, `false` otherwise.
     */
    static removeSavedSearch(id) {
        if (DataUtils.isEmpty(id)) {
            Logger.warn('Attempted to remove saved search with empty ID.');
            return false;
        }
        let currentSearches = SavedSearchManager.loadSavedSearches();
        const initialLength = currentSearches.length;
        currentSearches = currentSearches.filter(s => s.id !== id);
        if (currentSearches.length < initialLength) {
            SavedSearchManager._saveSearches(currentSearches);
            Logger.info(`Saved search with ID '${id}' successfully removed.`);
            return true;
        }
        Logger.warn(`Saved search with ID '${id}' not found for removal.`);
        return false;
    }

    /**
     * Retrieves a specific saved search by its unique identifier.
     * When a search is retrieved, its `lastUsedAt` timestamp is updated.
     * @static
     * @param {string} id - The unique ID of the search to retrieve.
     * @returns {Object|undefined} The saved search object, or `undefined` if not found.
     */
    static getSavedSearch(id) {
        if (DataUtils.isEmpty(id)) {
            Logger.warn('Attempted to get saved search with empty ID.');
            return undefined;
        }
        const searches = SavedSearchManager.loadSavedSearches();
        const search = searches.find(s => s.id === id);

        if (search) {
            // Update lastUsedAt timestamp when retrieved
            const updatedSearches = searches.map(s =>
                s.id === id ? { ...s,
                    lastUsedAt: new Date().toISOString()
                } : s
            );
            SavedSearchManager._saveSearches(updatedSearches);
            Logger.debug(`Saved search '${search.name}' (ID: ${id}) retrieved and lastUsedAt updated.`);
            return search;
        }
        Logger.debug(`Saved search with ID '${id}' not found.`);
        return undefined;
    }

    /**
     * Updates an existing saved search.
     * @static
     * @param {string} id - The ID of the saved search to update.
     * @param {Object} updates - An object containing properties to update (e.g., `name`, `query`).
     * @returns {Object|undefined} The updated saved search object, or `undefined` if not found.
     * @throws {GeminiSystemError} If `updates` contain invalid data or violate uniqueness constraints.
     */
    static updateSavedSearch(id, updates) {
        if (DataUtils.isEmpty(id) || DataUtils.isEmpty(updates)) {
            throw new GeminiSystemError('ID and updates are required to update a saved search.', GeminiErrorCodes.VALIDATION_ERROR);
        }

        let currentSearches = SavedSearchManager.loadSavedSearches();
        const index = currentSearches.findIndex(s => s.id === id);

        if (index === -1) {
            Logger.warn(`Attempted to update non-existent saved search with ID: ${id}`);
            return undefined;
        }

        const existingSearch = currentSearches[index];
        const updatedSearch = { ...existingSearch,
            ...updates,
            lastUsedAt: new Date().toISOString()
        };

        // If name is updated, check for uniqueness
        if (updates.name && updates.name.toLowerCase() !== existingSearch.name.toLowerCase()) {
            if (currentSearches.some((s, i) => i !== index && s.name.toLowerCase() === updates.name.toLowerCase())) {
                throw new GeminiSystemError(`A saved search with the name '${updates.name}' already exists.`, GeminiErrorCodes.VALIDATION_ERROR);
            }
            updatedSearch.name = DataUtils.sanitizeString(updates.name);
        }
        // If query is updated, re-normalize it
        if (updates.query) {
            updatedSearch.query = new SearchQuery(updatedSearch.entityType, updates.query).getQueryObject();
        }

        currentSearches[index] = updatedSearch;
        SavedSearchManager._saveSearches(currentSearches);
        Logger.info(`Saved search with ID '${id}' successfully updated.`);
        return updatedSearch;
    }
}

/**
 * Redux thunk action to load all saved searches into the Redux store.
 * Dispatches `SAVED_SEARCHES_LOADED` action upon success or `UI_NOTIFICATION_SHOW` on failure.
 * @returns {Function} A Redux thunk function.
 */
export function loadSavedSearches() {
    return (dispatch) => {
        try {
            const searches = SavedSearchManager.loadSavedSearches();
            dispatch({
                type: ActionTypes.SAVED_SEARCHES_LOADED,
                payload: searches
            });
            Logger.info('Saved searches loaded into Redux store.');
        } catch (error) {
            Logger.error('Failed to load saved searches via Redux action:', error);
            dispatch(showUINotification(`Failed to load saved searches: ${error.message}`, 'error'));
        }
    };
}

/**
 * Redux thunk action to add a new saved search to both local storage and the Redux store.
 * @param {string} name - The user-defined name for the new saved search.
 * @param {string} entityType - The entity type associated with the search.
 * @param {Object} query - The search query object to save.
 * @returns {Function} A Redux thunk function.
 */
export function addSavedSearch(name, entityType, query) {
    return (dispatch) => {
        try {
            const newSearch = SavedSearchManager.addSavedSearch(name, entityType, query);
            dispatch({
                type: ActionTypes.SAVED_SEARCH_ADDED,
                payload: newSearch
            });
            dispatch(showUINotification(`Search '${newSearch.name}' saved successfully!`, 'success'));
            Logger.info(`Action: Successfully added saved search '${newSearch.name}'.`);
        } catch (error) {
            Logger.error(`Failed to add saved search '${name}': ${error.message}`, error);
            dispatch(showUINotification(`Failed to save search: ${error.message}`, 'error', 7000));
        }
    };
}

/**
 * Redux thunk action to remove a saved search from local storage and the Redux store.
 * @param {string} id - The unique ID of the saved search to remove.
 * @returns {Function} A Redux thunk function.
 */
export function removeSavedSearch(id) {
    return (dispatch) => {
        try {
            const wasRemoved = SavedSearchManager.removeSavedSearch(id);
            if (wasRemoved) {
                dispatch({
                    type: ActionTypes.SAVED_SEARCH_REMOVED,
                    payload: {
                        id
                    }
                });
                dispatch(showUINotification('Saved search removed successfully.', 'success'));
                Logger.info(`Action: Removed saved search with ID '${id}'.`);
            } else {
                dispatch(showUINotification('Could not find the saved search to remove.', 'warning'));
            }
        } catch (error) {
            Logger.error(`Failed to remove saved search with ID '${id}': ${error.message}`, error);
            dispatch(showUINotification(`Failed to remove saved search: ${error.message}`, 'error', 7000));
        }
    };
}

/**
 * Redux thunk action to apply a saved search, updating the current query and triggering a new search.
 * @param {string} id - The ID of the saved search to apply.
 * @param {boolean} [enableAI=true] - Whether to enable AI enhancements for the applied search.
 * @returns {Function} A Redux thunk function.
 */
export function applySavedSearch(id, enableAI = true) {
    return async (dispatch, getState) => {
        try {
            const savedSearch = SavedSearchManager.getSavedSearch(id);
            if (!savedSearch) {
                dispatch(showUINotification('Saved search not found.', 'error', 5000));
                Logger.warn(`Attempted to apply non-existent saved search with ID: ${id}`);
                return;
            }

            // Update the query in Redux state
            dispatch(updateQuery(savedSearch.entityType, savedSearch.query));
            Logger.info(`Applied saved search '${savedSearch.name}'. Initiating new search.`);

            // Trigger a new search with the loaded query
            await dispatch(searchEntity(savedSearch.entityType, savedSearch.query.page, true, enableAI));
            dispatch(showUINotification(`Applied saved search: '${savedSearch.name}'.`, 'success', 3000));
        } catch (error) {
            Logger.error(`Failed to apply saved search with ID '${id}': ${error.message}`, error);
            dispatch(showUINotification(`Failed to apply saved search: ${error.message}`, 'error', 7000));
        }
    };
}

// Re-export the original ALL_ACCOUNTS_ID for backward compatibility,
// new code should prefer SYSTEM_CONSTANTS.ALL_ACCOUNTS_ID for consistency.
export const ALL_ACCOUNTS_ID = SYSTEM_CONSTANTS.ALL_ACCOUNTS_ID;

// Exporting original action type constants for backward compatibility.
// New code should primarily use the `ActionTypes` enum for consistency.
export const QUERY_UPDATE = ActionTypes.QUERY_UPDATE;
export const ENTITIES_LOAD = ActionTypes.ENTITIES_LOAD;
export const BEGIN_LOAD = ActionTypes.SEARCH_BEGIN_LOAD; // Renamed for specificity in ActionTypes
export const FINISH_LOAD = ActionTypes.SEARCH_FINISH_LOAD; // Renamed for specificity in ActionTypes
export const ENTITY_UPDATE = ActionTypes.ENTITY_UPDATE;
