// Copyright James Burvel Oâ€™Callaghan III

/**
 * @file This module provides advanced actions for managing and analyzing ledger entities,
 *      leveraging Gemini AI for generation, validation, analysis, and forecasting.
 *      It adheres to commercial-grade best practices, including robust error handling,
 *      modular design, and detailed logging capabilities.
 */

// --- Global Configuration & Environment Variables ---
/**
 * @constant {string} GEMINI_API_KEY - The API key for accessing the Gemini Generative AI service.
 *                                   It is recommended to manage this securely,
 *                                   e.g., via environment variables or a secrets manager.
 */
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"; // Placeholder for actual API key

/**
 * @constant {string} GEMINI_BASE_URL - The base URL for the Gemini API.
 */
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/**
 * @constant {string} GEMINI_MODEL - The specific Gemini model to use for content generation.
 */
const GEMINI_MODEL_GENERATION = "gemini-pro";

/**
 * @constant {string} GEMINI_MODEL_ANALYSIS = "gemini-pro-vision" or "gemini-pro" depending on analytical needs.
 */
const GEMINI_MODEL_ANALYSIS = "gemini-pro";

/**
 * @constant {string} DEFAULT_MIME_TYPE - Default MIME type for Gemini API responses.
 */
const DEFAULT_MIME_TYPE = "application/json";

// --- Action Types for State Management (Conceptual) ---
/**
 * @namespace LedgerActionTypes
 * @description Defines various action types for dispatching state updates.
 */
export const LedgerActionTypes = {
    LOAD_LEDGER_ENTITIES_REQUEST: "LOAD_LEDGER_ENTITIES_REQUEST",
    LOAD_LEDGER_ENTITIES_SUCCESS: "LOAD_LEDGER_ENTITIES_SUCCESS",
    LOAD_LEDGER_ENTITIES_FAILURE: "LOAD_LEDGER_ENTITIES_FAILURE",
    ADD_LEDGER_ENTITY_SUCCESS: "ADD_LEDGER_ENTITY_SUCCESS",
    UPDATE_LEDGER_ENTITY_SUCCESS: "UPDATE_LEDGER_ENTITY_SUCCESS",
    DELETE_LEDGER_ENTITY_SUCCESS: "DELETE_LEDGER_ENTITY_SUCCESS",
    APPLY_ANOMALY_DETECTION_RESULTS: "APPLY_ANOMALY_DETECTION_RESULTS",
    APPLY_FORECAST_RESULTS: "APPLY_FORECAST_RESULTS",
    APPLY_BUDGET_ANALYSIS_RESULTS: "APPLY_BUDGET_ANALYSIS_RESULTS",
    APPLY_CATEGORIZATION_RESULTS: "APPLY_CATEGORIZATION_RESULTS",
    SET_LEDGER_REPORT: "SET_LEDGER_REPORT",
    LOG_MESSAGE: "LOG_MESSAGE",
    CLEAR_LOGS: "CLEAR_LOGS",
};

// --- Data Models & Interfaces (Conceptual - for JSDoc) ---
/**
 * @typedef {object} LedgerEntity
 * @property {string} id - A unique identifier for the ledger entity. Can be string or number.
 * @property {string} name - A descriptive name or memo for the transaction.
 * @property {'income'|'expense'|'asset'|'liability'|'equity'} type - The type of accounting ledger entity.
 * @property {number} amount - The monetary value of the transaction.
 * @property {string} date - The date of the transaction in 'YYYY-MM-DD' format.
 * @property {string[]} [tags] - Optional tags for categorization (e.g., 'rent', 'salary', 'software').
 * @property {string} [currency='USD'] - The currency of the transaction.
 * @property {string} [description] - A more detailed description of the transaction.
 * @property {string} [status='posted'] - The status of the transaction (e.g., 'posted', 'pending', 'void').
 * @property {object} [metadata] - Additional arbitrary metadata.
 */

/**
 * @typedef {object} GeminiRequestConfig
 * @property {number} [temperature=0.7] - Controls the randomness of the output. Higher values are more random.
 * @property {number} [topP=0.95] - Nucleus sampling. The model considers tokens whose cumulative probability is topP.
 * @property {number} [topK=40] - The model considers the topK most likely tokens.
 * @property {string} [responseMimeType='application/json'] - Desired MIME type of the response.
 */

/**
 * @typedef {object} LedgerQueryParams
 * @property {string} [startDate] - Filter entities from this date (YYYY-MM-DD).
 * @property {string} [endDate] - Filter entities up to this date (YYYY-MM-DD).
 * @property {string} [type] - Filter by entity type.
 * @property {string} [search] - Full-text search within entity names/descriptions.
 * @property {number} [minAmount] - Filter by minimum amount.
 * @property {number} [maxAmount] - Filter by maximum amount.
 * @property {string} [sortBy='date'] - Field to sort by.
 * @property {'asc'|'desc'} [sortOrder='desc'] - Sort order.
 * @property {number} [limit=100] - Maximum number of entities to return.
 * @property {number} [offset=0] - Number of entities to skip (for pagination).
 * @property {string[]} [tags] - Filter by specific tags.
 */

/**
 * @typedef {object} AnomalyDetectionResult
 * @property {string} entityId - The ID of the ledger entity identified as an anomaly.
 * @property {string} reason - An AI-generated explanation for why it's considered an anomaly.
 * @property {number} severity - A numerical score indicating the severity of the anomaly (0-1).
 * @property {string[]} [suggestedActions] - Potential actions to take regarding the anomaly.
 */

/**
 * @typedef {object} ForecastResult
 * @property {string} period - The time period for the forecast (e.g., '2024-01', 'Q1 2024').
 * @property {'income'|'expense'|'net'} category - The financial category being forecasted.
 * @property {number} predictedAmount - The forecasted monetary value.
 * @property {number} [confidenceIntervalLower] - Lower bound of the confidence interval.
 * @property {number} [confidenceIntervalUpper] - Upper bound of the confidence interval.
 * @property {string} [notes] - AI-generated notes about the forecast.
 */

/**
 * @typedef {object} BudgetAnalysisResult
 * @property {string} category - The budget category (e.g., 'housing', 'transportation').
 * @property {number} budgetedAmount - The amount allocated in the budget.
 * @property {number} actualAmount - The actual spending/earning for the category.
 * @property {number} variance - The difference (actual - budgeted).
 * @property {string} status - 'under', 'over', 'on track'.
 * @property {string} [recommendations] - AI-generated recommendations for budget optimization.
 */

// --- Logger Utility (for professional-grade logging) ---
/**
 * @class AppLogger
 * @description A centralized logging utility to manage application messages.
 *              It can dispatch log events to the state store for UI display or send to an external service.
 */
class AppLogger {
    constructor(dispatch) {
        if (!dispatch) {
            console.warn("AppLogger initialized without a dispatch function. Logs will only go to console.");
        }
        this._dispatch = dispatch;
    }

    /**
     * Dispatches a log message.
     * @param {string} level - 'info', 'warn', 'error', 'debug'.
     * @param {string} message - The log message.
     * @param {object} [context] - Additional context for the log.
     */
    _log(level, message, context) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context,
        };
        console[level](`[${level.toUpperCase()}] ${message}`, context || '');
        if (this._dispatch) {
            this._dispatch({
                type: LedgerActionTypes.LOG_MESSAGE,
                payload: logEntry,
            });
        }
    }

    info(message, context) { this._log('info', message, context); }
    warn(message, context) { this._log('warn', message, context); }
    error(message, context) { this._log('error', message, context); }
    debug(message, context) { this._log('debug', message, context); }

    /**
     * Clears all dispatched log messages from the state (if dispatch is available).
     */
    clearLogs() {
        if (this._dispatch) {
            this._dispatch({
                type: LedgerActionTypes.CLEAR_LOGS,
            });
        }
        this.info("Application logs cleared.");
    }
}

// --- Gemini AI Service Layer ---
/**
 * @class GeminiService
 * @description Encapsulates all interactions with the Gemini API, providing
 *              structured methods for content generation and analysis.
 */
class GeminiService {
    /**
     * Initializes the GeminiService.
     * @param {string} apiKey - The API key for Gemini.
     * @param {AppLogger} logger - An instance of the AppLogger.
     */
    constructor(apiKey, logger) {
        if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
            logger.error("Gemini API key is missing or invalid. Please update GEMINI_API_KEY.");
            throw new Error("Gemini API key is required.");
        }
        this._apiKey = apiKey;
        this._logger = logger;
    }

    /**
     * Makes a generic request to the Gemini API.
     * @private
     * @param {string} modelName - The name of the Gemini model to use (e.g., 'gemini-pro').
     * @param {string} promptText - The text prompt to send to the model.
     * @param {GeminiRequestConfig} [config={}] - Configuration for the generation request.
     * @returns {Promise<any>} The parsed JSON response from the Gemini API.
     * @throws {Error} If the API request fails or returns an invalid response.
     */
    async _makeGeminiRequest(modelName, promptText, config = {}) {
        const endpoint = `${GEMINI_BASE_URL}/models/${modelName}:generateContent?key=${this._apiKey}`;
        const requestBody = {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
                responseMimeType: config.responseMimeType || DEFAULT_MIME_TYPE,
                temperature: config.temperature !== undefined ? config.temperature : 0.7,
                topP: config.topP !== undefined ? config.topP : 0.95,
                topK: config.topK !== undefined ? config.topK : 40,
            },
        };

        this._logger.debug(`Sending Gemini request to ${modelName}`, { prompt: promptText.substring(0, 100) + '...' });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": DEFAULT_MIME_TYPE,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                this._logger.error(`Gemini API request failed (${modelName}): ${response.status} ${response.statusText}`, { details: errorDetails, prompt: promptText });
                throw new Error(`Gemini API request failed: ${response.status} ${response.statusText} - ${errorDetails}`);
            }

            const apiResponse = await response.json();

            if (!apiResponse || !apiResponse.candidates || apiResponse.candidates.length === 0) {
                throw new Error("Gemini API response was empty or malformed.");
            }

            let responseText = apiResponse.candidates[0].content.parts[0].text;
            this._logger.debug(`Raw Gemini response received.`, { textLength: responseText.length });

            // Robust JSON parsing: Gemini sometimes wraps JSON in markdown fences.
            let jsonData;
            try {
                jsonData = JSON.parse(responseText);
            } catch (parseError) {
                this._logger.warn("Attempting to parse JSON with markdown fences.", { error: parseError.message });
                const cleanedText = responseText.replace(/```json\n|\n```/g, '').trim();
                jsonData = JSON.parse(cleanedText);
            }
            this._logger.info(`Successfully parsed Gemini response.`);
            return jsonData;
        } catch (error) {
            this._logger.error(`Error in Gemini API call: ${error.message}`, { error });
            throw error;
        }
    }

    /**
     * Generates a list of ledger entities based on a query.
     * @param {object} query - The query parameters for generating entities.
     * @param {string} ledgerId - The ID of the ledger.
     * @param {GeminiRequestConfig} [config={}] - Configuration for the generation request.
     * @returns {Promise<{ledger_entities: LedgerEntity[]}>} An object containing an array of generated ledger entities.
     */
    async generateLedgerEntities(query, ledgerId, config = {}) {
        const fullQuery = { ...query, ledger_id: ledgerId };
        const prompt = `Generate a JSON object containing an array of accounting ledger entities. The query parameters for this request are: ${JSON.stringify(fullQuery)}.
            Each ledger entity in the array should have 'id' (a unique string or number), 'name' (a string describing the transaction),
            'type' (a string like 'income', 'expense', 'asset', 'liability', 'equity'), 'amount' (a number representing the value),
            'date' (a string in 'YYYY-MM-DD' format), 'currency' (e.g., 'USD', 'EUR'), 'description' (a longer text),
            and an array of 'tags' (e.g., ['salary', 'food', 'rent']).
            Ensure the output is a valid JSON object with a single key 'ledger_entities' containing the array,
            and nothing else, no conversational text or markdown wrappers. Aim for around 10-20 entities for a typical query.`;
        return this._makeGeminiRequest(GEMINI_MODEL_GENERATION, prompt, config);
    }

    /**
     * Validates a list of ledger entities using Gemini to check for inconsistencies or missing data.
     * @param {LedgerEntity[]} entities - The list of ledger entities to validate.
     * @returns {Promise<{validation_report: {entityId: string, isValid: boolean, issues: string[]}[]}>}
     */
    async validateLedgerEntities(entities) {
        if (!entities || entities.length === 0) {
            return { validation_report: [] };
        }
        const prompt = `Review the following array of accounting ledger entities for data integrity, consistency, and potential errors.
            For each entity, check if:
            1. All required fields (id, name, type, amount, date) are present and correctly formatted.
            2. 'amount' is a valid positive or negative number.
            3. 'date' is a valid 'YYYY-MM-DD' format.
            4. 'type' is one of 'income', 'expense', 'asset', 'liability', 'equity'.
            5. 'id' is unique across the dataset.
            Provide a JSON object with a single key 'validation_report', which is an array. Each item in the array should represent an entity and contain 'entityId' (the id of the entity), 'isValid' (boolean), and 'issues' (an array of strings describing any problems found).
            Do not include any conversational text or markdown.
            Entities to validate: ${JSON.stringify(entities)}`;
        return this._makeGeminiRequest(GEMINI_MODEL_ANALYSIS, prompt, { temperature: 0.1 });
    }

    /**
     * Performs anomaly detection on ledger entities using Gemini.
     * @param {LedgerEntity[]} entities - The list of ledger entities to analyze.
     * @param {object} [context] - Additional context, e.g., historical averages, budget.
     * @returns {Promise<{anomalies: AnomalyDetectionResult[]}>}
     */
    async detectLedgerAnomalies(entities, context = {}) {
        if (!entities || entities.length < 5) {
            this._logger.warn("Not enough entities for meaningful anomaly detection. At least 5 are recommended.");
            return { anomalies: [] };
        }
        const prompt = `Analyze the following accounting ledger entities and identify any transactions that appear to be unusual, inconsistent, or potentially fraudulent.
            Consider factors such as transaction amount outliers, unusual types for a given period, or transactions that significantly deviate from historical patterns (if context is provided).
            Contextual information: ${JSON.stringify(context)}.
            Provide a JSON object with a single key 'anomalies', which is an array. Each item in the array should contain 'entityId', 'reason' (an AI-generated explanation), 'severity' (a numerical score 0-1), and 'suggestedActions' (e.g., 'Review transaction', 'Flag for audit').
            Do not include any conversational text or markdown.
            Entities to analyze: ${JSON.stringify(entities)}`;
        return this._makeGeminiRequest(GEMINI_MODEL_ANALYSIS, prompt, { temperature: 0.8 });
    }

    /**
     * Forecasts future ledger trends based on historical data.
     * @param {LedgerEntity[]} historicalEntities - Past ledger entities for analysis.
     * @param {string} forecastPeriod - The period to forecast (e.g., 'next quarter', 'next 6 months').
     * @returns {Promise<{forecasts: ForecastResult[]}>}
     */
    async forecastLedgerTrends(historicalEntities, forecastPeriod = 'next quarter') {
        if (!historicalEntities || historicalEntities.length < 10) {
            this._logger.warn("Not enough historical data for robust forecasting. At least 10 entities are recommended.");
            return { forecasts: [] };
        }
        const prompt = `Based on the provided historical accounting ledger entities, generate a financial forecast for ${forecastPeriod}.
            Predict key metrics like total income, total expense, and net profit for upcoming periods.
            Identify potential trends, seasonal variations, and significant future events that might impact the forecast (if discernible from data).
            Provide a JSON object with a single key 'forecasts', which is an array. Each item should contain 'period' (e.g., '2024-Q1'),
            'category' ('income', 'expense', 'net'), 'predictedAmount', 'confidenceIntervalLower', 'confidenceIntervalUpper', and 'notes' (AI-generated explanation of the forecast).
            Do not include any conversational text or markdown.
            Historical entities: ${JSON.stringify(historicalEntities)}`;
        return this._makeGeminiRequest(GEMINI_MODEL_ANALYSIS, prompt, { temperature: 0.7 });
    }

    /**
     * Provides budgeting recommendations and analysis based on actual spending.
     * @param {LedgerEntity[]} actualEntities - Actual ledger entities for a period.
     * @param {object} [budgetPlan={}] - A hypothetical or existing budget plan (e.g., { 'housing': 1500, 'food': 500 }).
     * @returns {Promise<{budget_analysis: BudgetAnalysisResult[]}>}
     */
    async analyzeBudget(actualEntities, budgetPlan = {}) {
        if (!actualEntities || actualEntities.length === 0) {
            return { budget_analysis: [] };
        }
        const prompt = `Perform a budget analysis using the provided actual ledger entities and the given budget plan.
            For each category, calculate actual spending, compare it to the budgeted amount, and provide variance.
            Suggest recommendations for optimizing spending or improving budget adherence.
            Provide a JSON object with a single key 'budget_analysis', which is an array. Each item should contain 'category',
            'budgetedAmount', 'actualAmount', 'variance', 'status' ('under', 'over', 'on track'), and 'recommendations' (AI-generated advice).
            Do not include any conversational text or markdown.
            Actual entities: ${JSON.stringify(actualEntities)}
            Budget plan: ${JSON.stringify(budgetPlan)}`;
        return this._makeGeminiRequest(GEMINI_MODEL_ANALYSIS, prompt, { temperature: 0.6 });
    }

    /**
     * Generates a comprehensive summary report from ledger entities.
     * @param {LedgerEntity[]} entities - The entities to summarize.
     * @param {object} [reportConfig] - Configuration for the report (e.g., 'monthly', 'quarterly').
     * @returns {Promise<{summary_report: string}>} A textual summary of the ledger data.
     */
    async generateSummaryReport(entities, reportConfig = {}) {
        if (!entities || entities.length === 0) {
            return { summary_report: "No ledger entities to generate a report from." };
        }
        const prompt = `Generate a comprehensive financial summary report for the following ledger entities.
            Include key insights such as total income, total expenses, net profit/loss, breakdown by category (e.g., top 3 expenses, main income sources),
            and any notable trends or observations over the period covered by these entities.
            The report should be professional, concise, and highlight important financial performance indicators.
            Format the output as a JSON object with a single key 'summary_report' containing a markdown-formatted string.
            Report configuration: ${JSON.stringify(reportConfig)}
            Ledger Entities: ${JSON.stringify(entities)}`;
        const response = await this._makeGeminiRequest(GEMINI_MODEL_ANALYSIS, prompt, { responseMimeType: "text/plain", temperature: 0.7 });
        // Since we requested text/plain, the `responseText` will be the direct content,
        // but the _makeGeminiRequest expects and tries to parse JSON.
        // So, we need to adjust this. For text, it's simpler:
        const endpoint = `${GEMINI_BASE_URL}/models/${GEMINI_MODEL_ANALYSIS}:generateContent?key=${this._apiKey}`;
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "text/plain", // Explicitly ask for text here
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            },
        };
        try {
            const apiResponse = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": DEFAULT_MIME_TYPE },
                body: JSON.stringify(requestBody),
            }).then(res => res.json());

            if (!apiResponse || !apiResponse.candidates || apiResponse.candidates.length === 0) {
                throw new Error("Gemini API response was empty or malformed for summary report.");
            }
            const reportText = apiResponse.candidates[0].content.parts[0].text;
            return { summary_report: reportText };
        } catch (error) {
            this._logger.error(`Error generating summary report: ${error.message}`, { error });
            throw error;
        }
    }
}

// --- Initialize Core Services ---
// This logger and GeminiService instance are assumed to be initialized once and shared.
// In a real application, these might be dependency-injected or part of a global context.
let _appLoggerInstance;
let _geminiServiceInstance;

/**
 * Initializes global service instances. This function should be called once,
 * typically at application startup or when Redux store is configured.
 * @param {Function} dispatch - The Redux dispatch function or similar state updater.
 * @exports initializeLedgerServices
 */
export function initializeLedgerServices(dispatch) {
    if (!_appLoggerInstance) {
        _appLoggerInstance = new AppLogger(dispatch);
        _appLoggerInstance.info("Application Logger initialized.");
    }
    if (!_geminiServiceInstance) {
        try {
            _geminiServiceInstance = new GeminiService(GEMINI_API_KEY, _appLoggerInstance);
            _appLoggerInstance.info("GeminiService initialized.");
        } catch (error) {
            _appLoggerInstance.error(`Failed to initialize GeminiService: ${error.message}`);
            // If GeminiService fails, other functions relying on it will also fail.
            // A graceful fallback strategy might be needed in a production app.
        }
    }
}

/**
 * Helper to ensure services are initialized before use.
 * @param {Function} dispatch - The Redux dispatch function.
 * @returns {{logger: AppLogger, gemini: GeminiService}} Initialized services.
 * @throws {Error} if services cannot be initialized.
 */
function getServices(dispatch) {
    if (!_appLoggerInstance || !_geminiServiceInstance) {
        // Attempt to initialize if not already
        initializeLedgerServices(dispatch);
        if (!_appLoggerInstance || !_geminiServiceInstance) {
            throw new Error("Core services (Logger, GeminiService) could not be initialized.");
        }
    }
    return { logger: _appLoggerInstance, gemini: _geminiServiceInstance };
}

// --- Main Action Functions (Exported) ---

/**
 * Loads ledger entities, either by generating them via Gemini or fetching from a hypothetical API.
 * This function handles the primary data acquisition for ledger entities.
 * @param {LedgerQueryParams} query - Query parameters for filtering and fetching entities.
 * @param {string} ledgerId - The ID of the specific ledger to operate on.
 * @param {Function} dispatch - The Redux dispatch function for state updates.
 * @param {Function} dispatchError - A dedicated function to dispatch error notifications.
 * @param {boolean} [useGeminiGeneration=true] - If true, entities are generated by Gemini; otherwise, it simulates an API call.
 * @returns {Promise<void>}
 * @exports loadLedgerEntities
 */
export async function loadLedgerEntities(query, ledgerId, dispatch, dispatchError, useGeminiGeneration = true) {
    const { logger, gemini } = getServices(dispatch);
    logger.info(`Attempting to load ledger entities for ledger: ${ledgerId}`, { query, useGeminiGeneration });
    dispatch({ type: LedgerActionTypes.LOAD_LEDGER_ENTITIES_REQUEST, payload: { ledgerId, query } });

    try {
        let entities;
        if (useGeminiGeneration) {
            const geminiResponse = await gemini.generateLedgerEntities(query, ledgerId);
            entities = geminiResponse.ledger_entities;
            logger.info(`Successfully generated ${entities.length} ledger entities using Gemini.`);
        } else {
            // Simulate fetching from a real backend API for comparison or fallback
            // In a real app, this would be an actual fetch call to your backend.
            logger.info("Simulating fetching ledger entities from a backend API.");
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            entities = [
                { id: "e101", name: "Salary Deposit", type: "income", amount: 5000, date: "2023-11-01", currency: "USD", tags: ["salary"] },
                { id: "e102", name: "Rent Payment", type: "expense", amount: 1200, date: "2023-11-05", currency: "USD", tags: ["housing"] },
                { id: "e103", name: "Groceries", type: "expense", amount: 150, date: "2023-11-07", currency: "USD", tags: ["food"] },
                { id: "e104", name: "Freelance Income", type: "income", amount: 800, date: "2023-11-10", currency: "USD", tags: ["freelance"] },
                { id: "e105", name: "Utility Bill", type: "expense", amount: 90, date: "2023-11-12", currency: "USD", tags: ["utilities"] },
            ].filter(e => e.date >= (query.startDate || "2000-01-01") && e.date <= (query.endDate || "2999-12-31"));
            logger.info(`Successfully fetched ${entities.length} ledger entities from simulated API.`);
        }

        // After fetching/generating, perform AI-driven validation
        const validationResult = await gemini.validateLedgerEntities(entities);
        const invalidEntities = validationResult.validation_report.filter(r => !r.isValid);

        if (invalidEntities.length > 0) {
            logger.warn(`Gemini validation found ${invalidEntities.length} potential issues in generated/fetched entities.`, { issues: invalidEntities });
            dispatchError(`Data integrity issues detected after loading: ${invalidEntities.map(i => i.entityId + ": " + i.issues.join(', ')).join('; ')}`);
            // Optionally, filter out invalid entities or dispatch a specific action for review
        } else {
            logger.info("Gemini validation confirmed all loaded entities are valid.");
        }

        dispatch({
            type: LedgerActionTypes.LOAD_LEDGER_ENTITIES_SUCCESS,
            payload: {
                entities,
                validationReport: validationResult.validation_report,
            },
        });
    } catch (error) {
        logger.error(`Failed to load ledger entities: ${error.message}`, { error });
        dispatchError(`Failed to load ledger entities: ${error.message}`);
        dispatch({
            type: LedgerActionTypes.LOAD_LEDGER_ENTITIES_FAILURE,
            payload: { error: error.message },
        });
    }
}

/**
 * Adds a new ledger entity. If `useGeminiForDetails` is true, Gemini can enrich the entity details.
 * @param {object} entityData - The base data for the new ledger entity.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @param {boolean} [useGeminiForDetails=false] - If true, Gemini might suggest tags/description for the entity.
 * @returns {Promise<void>}
 * @exports addLedgerEntity
 */
export async function addLedgerEntity(entityData, ledgerId, dispatch, dispatchError, useGeminiForDetails = false) {
    const { logger, gemini } = getServices(dispatch);
    logger.info(`Attempting to add new ledger entity to ledger: ${ledgerId}`, { entityData, useGeminiForDetails });

    try {
        let finalEntity = { ...entityData, id: entityData.id || `temp-${Date.now()}` }; // Assign temp ID if not present

        if (useGeminiForDetails) {
            // Use Gemini to enrich or categorize the entity
            const enrichmentPrompt = `Given the following ledger entity data: ${JSON.stringify(finalEntity)},
                suggest additional 'tags' (e.g., ['food', 'travel']), a 'description' if missing,
                and verify the 'type' (income, expense, asset, liability, equity).
                Return a JSON object with potentially updated fields: { tags: [], description: "", type: "" }.
                Only return the fields that are updated or suggested.`;
            const geminiEnrichment = await gemini._makeGeminiRequest(GEMINI_MODEL_ANALYSIS, enrichmentPrompt, { temperature: 0.5 });
            finalEntity = { ...finalEntity, ...geminiEnrichment };
            logger.debug("Gemini enriched new ledger entity data.", { enrichment: geminiEnrichment });
        }

        // Simulate API call to add the entity
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        // In a real app, this would be a POST request to your backend.
        finalEntity.id = `entity-${Date.now()}`; // Assign a permanent ID

        logger.info(`Successfully added new ledger entity: ${finalEntity.id}`);
        dispatch({
            type: LedgerActionTypes.ADD_LEDGER_ENTITY_SUCCESS,
            payload: { entity: finalEntity, ledgerId },
        });
    } catch (error) {
        logger.error(`Failed to add ledger entity: ${error.message}`, { error });
        dispatchError(`Failed to add ledger entity: ${error.message}`);
    }
}

/**
 * Updates an existing ledger entity.
 * @param {string} entityId - The ID of the entity to update.
 * @param {object} updatedData - The data fields to update.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @returns {Promise<void>}
 * @exports updateLedgerEntity
 */
export async function updateLedgerEntity(entityId, updatedData, ledgerId, dispatch, dispatchError) {
    const { logger } = getServices(dispatch);
    logger.info(`Attempting to update ledger entity ${entityId} in ledger: ${ledgerId}`, { updatedData });

    try {
        // Simulate API call to update the entity
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        // In a real app, this would be a PUT/PATCH request to your backend.

        logger.info(`Successfully updated ledger entity: ${entityId}`);
        dispatch({
            type: LedgerActionTypes.UPDATE_LEDGER_ENTITY_SUCCESS,
            payload: { entityId, updatedData, ledgerId },
        });
    } catch (error) {
        logger.error(`Failed to update ledger entity ${entityId}: ${error.message}`, { error });
        dispatchError(`Failed to update ledger entity: ${error.message}`);
    }
}

/**
 * Deletes a ledger entity.
 * @param {string} entityId - The ID of the entity to delete.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @returns {Promise<void>}
 * @exports deleteLedgerEntity
 */
export async function deleteLedgerEntity(entityId, ledgerId, dispatch, dispatchError) {
    const { logger } = getServices(dispatch);
    logger.info(`Attempting to delete ledger entity ${entityId} from ledger: ${ledgerId}`);

    try {
        // Simulate API call to delete the entity
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        // In a real app, this would be a DELETE request to your backend.

        logger.info(`Successfully deleted ledger entity: ${entityId}`);
        dispatch({
            type: LedgerActionTypes.DELETE_LEDGER_ENTITY_SUCCESS,
            payload: { entityId, ledgerId },
        });
    } catch (error) {
        logger.error(`Failed to delete ledger entity ${entityId}: ${error.message}`, { error });
        dispatchError(`Failed to delete ledger entity: ${error.message}`);
    }
}

/**
 * Performs anomaly detection on current ledger data using Gemini AI and dispatches the results.
 * @param {LedgerEntity[]} currentEntities - The entities currently in the ledger for analysis.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @param {object} [context] - Additional context for anomaly detection (e.g., historical aggregates).
 * @returns {Promise<void>}
 * @exports performAnomalyDetection
 */
export async function performAnomalyDetection(currentEntities, ledgerId, dispatch, dispatchError, context = {}) {
    const { logger, gemini } = getServices(dispatch);
    logger.info(`Initiating anomaly detection for ledger: ${ledgerId}`, { numEntities: currentEntities.length, context });

    try {
        const result = await gemini.detectLedgerAnomalies(currentEntities, context);
        if (result.anomalies && result.anomalies.length > 0) {
            logger.warn(`Anomaly detection found ${result.anomalies.length} anomalies.`);
            // Optionally, dispatch an error for immediate user attention
            dispatchError(`Detected ${result.anomalies.length} potential anomalies in the ledger.`);
        } else {
            logger.info("No significant anomalies detected by Gemini AI.");
        }
        dispatch({
            type: LedgerActionTypes.APPLY_ANOMALY_DETECTION_RESULTS,
            payload: { ledgerId, anomalies: result.anomalies },
        });
    } catch (error) {
        logger.error(`Failed to perform anomaly detection: ${error.message}`, { error });
        dispatchError(`Failed to perform anomaly detection: ${error.message}`);
    }
}

/**
 * Generates financial forecasts based on historical ledger data using Gemini AI.
 * @param {LedgerEntity[]} historicalEntities - A list of past ledger entities.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @param {string} [forecastPeriod='next 3 months'] - The period for which to generate the forecast.
 * @returns {Promise<void>}
 * @exports forecastLedgerTrends
 */
export async function forecastLedgerTrends(historicalEntities, ledgerId, dispatch, dispatchError, forecastPeriod = 'next 3 months') {
    const { logger, gemini } = getServices(dispatch);
    logger.info(`Generating financial forecasts for ledger: ${ledgerId} for ${forecastPeriod}`, { numHistoricalEntities: historicalEntities.length });

    try {
        const result = await gemini.forecastLedgerTrends(historicalEntities, forecastPeriod);
        logger.info(`Successfully generated ${result.forecasts.length} forecasts.`);
        dispatch({
            type: LedgerActionTypes.APPLY_FORECAST_RESULTS,
            payload: { ledgerId, forecasts: result.forecasts, period: forecastPeriod },
        });
    } catch (error) {
        logger.error(`Failed to generate ledger trends forecast: ${error.message}`, { error });
        dispatchError(`Failed to generate ledger trends forecast: ${error.message}`);
    }
}

/**
 * Analyzes a budget against actual spending/income using Gemini AI, providing insights and recommendations.
 * @param {LedgerEntity[]} actualEntities - Actual ledger entities for the period.
 * @param {object} budgetPlan - The budget plan to analyze against.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @returns {Promise<void>}
 * @exports analyzeLedgerBudget
 */
export async function analyzeLedgerBudget(actualEntities, budgetPlan, ledgerId, dispatch, dispatchError) {
    const { logger, gemini } = getServices(dispatch);
    logger.info(`Analyzing budget for ledger: ${ledgerId}`, { numActualEntities: actualEntities.length, budgetPlan });

    try {
        const result = await gemini.analyzeBudget(actualEntities, budgetPlan);
        logger.info(`Budget analysis completed for ${Object.keys(budgetPlan).length} categories.`);
        dispatch({
            type: LedgerActionTypes.APPLY_BUDGET_ANALYSIS_RESULTS,
            payload: { ledgerId, analysis: result.budget_analysis },
        });
    } catch (error) {
        logger.error(`Failed to perform budget analysis: ${error.message}`, { error });
        dispatchError(`Failed to perform budget analysis: ${error.message}`);
    }
}

/**
 * Generates a comprehensive financial report for a given set of ledger entities.
 * The report content is generated by Gemini AI.
 * @param {LedgerEntity[]} entities - The ledger entities to include in the report.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @param {object} [reportConfig] - Configuration for the report generation (e.g., date range, level of detail).
 * @returns {Promise<void>}
 * @exports generateLedgerReport
 */
export async function generateLedgerReport(entities, ledgerId, dispatch, dispatchError, reportConfig = {}) {
    const { logger, gemini } = getServices(dispatch);
    logger.info(`Generating comprehensive ledger report for ledger: ${ledgerId}`, { numEntities: entities.length, reportConfig });

    try {
        const result = await gemini.generateSummaryReport(entities, reportConfig);
        logger.info("Comprehensive ledger report generated successfully by Gemini AI.");
        dispatch({
            type: LedgerActionTypes.SET_LEDGER_REPORT,
            payload: { ledgerId, report: result.summary_report, config: reportConfig },
        });
    } catch (error) {
        logger.error(`Failed to generate ledger report: ${error.message}`, { error });
        dispatchError(`Failed to generate ledger report: ${error.message}`);
    }
}

/**
 * Re-categorizes or tags ledger entities based on AI suggestions.
 * This can be used to refine existing categories or auto-assign new ones.
 * @param {LedgerEntity[]} entitiesToCategorize - A subset of entities that need categorization or tagging.
 * @param {string} ledgerId - The ID of the ledger.
 * @param {Function} dispatch - The Redux dispatch function.
 * @param {Function} dispatchError - Error dispatch function.
 * @returns {Promise<void>}
 * @exports reCategorizeLedgerEntities
 */
export async function reCategorizeLedgerEntities(entitiesToCategorize, ledgerId, dispatch, dispatchError) {
    const { logger, gemini } = getServices(dispatch);
    logger.info(`Initiating AI-driven re-categorization for ${entitiesToCategorize.length} entities in ledger: ${ledgerId}`);

    if (entitiesToCategorize.length === 0) {
        logger.info("No entities provided for re-categorization.");
        return;
    }

    try {
        const prompt = `Review the following ledger entities and suggest improved or additional 'tags' and refine 'type' if appropriate.
            The output should be a JSON array, where each object contains the 'id' of the entity and an 'updates' object with 'tags' (array of strings) and/or 'type' (string) if a change is suggested.
            Only include entities for which updates are suggested.
            Entities: ${JSON.stringify(entitiesToCategorize)}`;

        const geminiResponse = await gemini._makeGeminiRequest(GEMINI_MODEL_ANALYSIS, prompt, { temperature: 0.5 });
        const suggestedUpdates = geminiResponse; // Assuming Gemini returns a direct array of updates

        if (suggestedUpdates && suggestedUpdates.length > 0) {
            logger.info(`Gemini suggested ${suggestedUpdates.length} categorization updates.`);
            dispatch({
                type: LedgerActionTypes.APPLY_CATEGORIZATION_RESULTS,
                payload: { ledgerId, updates: suggestedUpdates },
            });
            dispatchError(`AI suggested updates for ${suggestedUpdates.length} entities. Review in UI.`);
        } else {
            logger.info("Gemini found no categorization updates necessary for the provided entities.");
        }

    } catch (error) {
        logger.error(`Failed to re-categorize ledger entities: ${error.message}`, { error });
        dispatchError(`Failed to re-categorize entities: ${error.message}`);
    }
}

/**
 * Exports for testing and direct use.
 * Note: In a real Redux-like architecture, only the action creators (e.g., `loadLedgerEntities`)
 * would typically be directly consumed by components.
 */
export { AppLogger, GeminiService };
// All top-level functions are already exported via `export async function ...`
// `initializeLedgerServices` is also exported.