// This file contains a comprehensive suite of document management actions,
// designed for commercial-grade applications and leveraging advanced AI capabilities.

// --- Global Configuration Constants ---
const GEMINI_AI_SERVICE_URL = process.env.GEMINI_AI_SERVICE_URL || "https://api.gemini.ai/v1/documents";
const GEMINI_AI_API_KEY = process.env.GEMINI_AI_API_KEY || "sk-gemini-secure-commercial-key-placeholder"; // Highly confidential, use environment variables
const RETRY_ATTEMPTS = 5; // Increased retry attempts for critical AI operations
const RETRY_DELAY_MS = 1000; // Exponential backoff or jitter could be added here
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // Maximum allowed document size: 10MB
const SUPPORTED_DOCUMENT_TYPES = [
    "invoice", "contract", "report", "agreement", "policy", "form", "receipt", "legal_brief", "research_paper", "presentation", "other"
];
const DEFAULT_DOCUMENT_CATEGORY = "uncategorized";
const AUDIT_LOG_ENABLED = process.env.AUDIT_LOG_ENABLED === 'true'; // Enable/disable detailed auditing

// --- Custom Error Classes for Robust Error Handling ---

/**
 * @class DocumentError
 * @augments Error
 * @description Base error class for all document-related operations, providing structured error information.
 */
export class DocumentError extends Error {
    /**
     * @param {string} message - A descriptive error message.
     * @param {Error|null} [originalError=null] - The underlying error that caused this DocumentError.
     * @param {string} [code='DOCUMENT_ERROR'] - A unique, machine-readable error code.
     * @param {object} [details={}] - Additional key-value pairs for context or debugging.
     */
    constructor(message, originalError = null, code = 'DOCUMENT_ERROR', details = {}) {
        super(message);
        this.name = 'DocumentError';
        this.code = code;
        this.originalError = originalError;
        this.details = details;
        // Preserve stack trace of original error if available, prepend to current stack
        if (originalError instanceof Error && originalError.stack) {
            this.stack = `${originalError.stack}\n--- Caused by DocumentError ---\n${this.stack}`;
        }
    }
}

/**
 * @class GeminiServiceError
 * @augments DocumentError
 * @description Error specific to failures when interacting with the Gemini AI service.
 */
export class GeminiServiceError extends DocumentError {
    /**
     * @param {string} message - Error message specific to Gemini AI service.
     * @param {Error|null} [originalError=null] - The original error from the Gemini API call.
     * @param {number|null} [statusCode=null] - HTTP status code received from the Gemini service.
     * @param {string|null} [geminiErrorCode=null] - A specific error code provided by the Gemini API.
     */
    constructor(message, originalError = null, statusCode = null, geminiErrorCode = null) {
        super(message, originalError, 'GEMINI_SERVICE_ERROR', { statusCode, geminiErrorCode });
        this.name = 'GeminiServiceError';
        this.statusCode = statusCode;
        this.geminiErrorCode = geminiErrorCode;
    }
}

/**
 * @class DocumentValidationError
 * @augments DocumentError
 * @description Error indicating invalid input data or content for a document operation.
 */
export class DocumentValidationError extends DocumentError {
    /**
     * @param {string} message - Validation failure message.
     * @param {object} [validationDetails={}] - Specific details about what failed validation (e.g., field, reason).
     * @param {Error|null} [originalError=null] - The original error, if any.
     */
    constructor(message, validationDetails = {}, originalError = null) {
        super(message, originalError, 'DOCUMENT_VALIDATION_ERROR', { validationDetails });
        this.name = 'DocumentValidationError';
        this.validationDetails = validationDetails;
    }
}

/**
 * @class DocumentNotFoundError
 * @augments DocumentError
 * @description Error for operations on documents that do not exist.
 */
export class DocumentNotFoundError extends DocumentError {
    /**
     * @param {string} [message='Document not found.'] - Error message.
     * @param {string|null} [documentId=null] - The ID of the document that was not found.
     */
    constructor(message = 'Document not found.', documentId = null) {
        super(message, null, 'DOCUMENT_NOT_FOUND', { documentId });
        this.name = 'DocumentNotFoundError';
        this.documentId = documentId;
    }
}

/**
 * @class DocumentAccessDeniedError
 * @augments DocumentError
 * @description Error for when a user attempts an unauthorized document operation.
 */
export class DocumentAccessDeniedError extends DocumentError {
    /**
     * @param {string} message - Access denied message.
     * @param {string} [documentId='unknown'] - The ID of the document.
     * @param {string} [userId='unknown'] - The ID of the user.
     * @param {string} [action='unknown'] - The attempted action.
     */
    constructor(message = 'Access denied.', documentId = 'unknown', userId = 'unknown', action = 'unknown') {
        super(message, null, 'ACCESS_DENIED', { documentId, userId, action });
        this.name = 'DocumentAccessDeniedError';
    }
}

// --- Internal Utility Functions for Robustness and Logging ---

/**
 * @typedef {object} GeminiApiResponse
 * @property {boolean} success - Indicates if the Gemini operation was successful.
 * @property {any} data - The data returned by Gemini, if any.
 * @property {string} [error] - An error message if the operation failed.
 * @property {string} [errorCode] - A specific error code from Gemini.
 * @property {number} [statusCode] - HTTP status code from the Gemini service.
 */

/**
 * Simulates an asynchronous call to a Gemini AI service with configurable delays and failure rates.
 * This function mimics network latency, API processing time, and potential service-side errors.
 *
 * @param {string} endpoint - The simulated Gemini AI API endpoint (e.g., '/analyze').
 * @param {object} payload - The data payload to send to the Gemini service.
 * @param {number} [minDelay=50] - Minimum simulated network delay in milliseconds.
 * @param {number} [maxDelay=300] - Maximum simulated network delay in milliseconds.
 * @param {number} [failRate=0.05] - Probability of the simulated call failing (0 to 1).
 * @param {object} [successResponse={}] - Custom data to be included in the successful response.
 * @returns {Promise<GeminiApiResponse>} A promise that resolves with a simulated Gemini API response or rejects with a GeminiServiceError.
 */
async function simulateGeminiCall(
    endpoint,
    payload,
    minDelay = 50,
    maxDelay = 300,
    failRate = 0.05,
    successResponse = {}
) {
    return new Promise((resolve, reject) => {
        const delay = minDelay + Math.random() * (maxDelay - minDelay);
        setTimeout(() => {
            if (Math.random() < failRate) {
                const errorMessages = [
                    "Gemini AI service temporarily unavailable.",
                    "Gemini AI internal processing error.",
                    "Gemini AI rate limit exceeded for this request.",
                    "Gemini AI content processing failed: input malformed.",
                    "Gemini AI authentication token expired or invalid."
                ];
                const errorCodes = ["UNAVAILABLE", "INTERNAL_ERROR", "RATE_LIMIT_EXCEEDED", "INVALID_INPUT", "AUTH_FAILED"];
                const statusCodes = [503, 500, 429, 400, 401];
                const randomIndex = Math.floor(Math.random() * errorCodes.length);
                const errMsg = errorMessages[randomIndex];
                const errCode = errorCodes[randomIndex];
                const statusCode = statusCodes[randomIndex];

                console.error(`[Gemini Simulation Error] Endpoint: ${endpoint}, Code: ${errCode}, Status: ${statusCode}. Payload snippet: ${JSON.stringify(payload).substring(0, 100)}...`);
                return reject(new GeminiServiceError(
                    `Gemini AI call to ${endpoint} failed: ${errMsg}`,
                    new Error(errMsg),
                    statusCode,
                    errCode
                ));
            } else {
                console.debug(`[Gemini Simulation Success] Endpoint: ${endpoint}. Payload snippet: ${JSON.stringify(payload).substring(0, 100)}...`);
                resolve({ success: true, data: { ...successResponse, ...payload }, statusCode: 200 });
            }
        }, delay);
    });
}

/**
 * Wraps an asynchronous operation with a robust retry mechanism, supporting configurable attempts and delays.
 * This improves resilience against transient network issues or temporary service unavailability.
 *
 * @template T
 * @param {() => Promise<T>} operation - The asynchronous function to execute and potentially retry.
 * @param {number} [attempts=RETRY_ATTEMPTS] - The maximum number of times to retry the operation.
 * @param {number} [delay=RETRY_DELAY_MS] - The initial delay in milliseconds between retries.
 * @returns {Promise<T>} A promise that resolves with the operation's result or rejects if all attempts fail.
 * @throws {Error} The last error encountered if all retry attempts are exhausted.
 */
async function withRetry(operation, attempts = RETRY_ATTEMPTS, delay = RETRY_DELAY_MS) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.warn(`[Retry] Attempt ${i + 1}/${attempts} failed for operation. Retrying in ${delay}ms... Error: ${error.message}`);
            // Implement exponential backoff with jitter for more robust retries
            const currentDelay = delay * Math.pow(2, i) + Math.random() * 100; // Exponential backoff + jitter
            await new Promise(res => setTimeout(res, currentDelay));
        }
    }
    console.error(`[Retry Failed] All ${attempts} attempts failed. Throwing last error.`);
    throw lastError; // Re-throw the last error if all attempts fail
}

/**
 * Logs important actions and errors within the document management system.
 * This is crucial for auditing, debugging, and operational monitoring.
 * In a real-world scenario, this would integrate with a dedicated logging service (e.g., ELK stack, Datadog).
 *
 * @param {string} level - Log level ('info', 'warn', 'error', 'debug').
 * @param {string} message - The main log message.
 * @param {object} [context={}] - Additional context or data relevant to the log entry.
 */
function systemLog(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ...context
    };

    if (process.env.NODE_ENV !== 'production' && level === 'debug') {
        // Only log debug in development to avoid console clutter
        console.log(`[DEBUG] ${timestamp} - ${message}`, context);
    } else if (level === 'info') {
        console.info(`[INFO] ${timestamp} - ${message}`, context);
    } else if (level === 'warn') {
        console.warn(`[WARN] ${timestamp} - ${message}`, context);
    } else if (level === 'error') {
        console.error(`[ERROR] ${timestamp} - ${message}`, context);
    } else {
        console.log(`[${level.toUpperCase()}] ${timestamp} - ${message}`, context);
    }
}

// --- Gemini AI Service Integration Layer (Simulated) ---

/**
 * @module GeminiAI
 * @description Provides a high-level, abstracted interface for interacting with various Gemini AI capabilities.
 * All interactions are simulated for this demonstration, showcasing potential real-world integrations.
 * This layer encapsulates retry logic, error handling, and structured input/output for AI calls.
 */
export const GeminiAI = {
    /**
     * Simulates performing advanced content analysis on a document.
     * Capabilities include entity recognition, keyword extraction, sentiment analysis,
     * summarization, and readability assessment.
     *
     * @param {string} content - The text content of the document to analyze.
     * @returns {Promise<{entities: string[], keywords: string[], sentiment: 'positive'|'negative'|'neutral', summary: string, readabilityScore: number, language: string}>}
     *   Analyzed insights including identified entities, keywords, overall sentiment, a generated summary,
     *   a readability score, and detected language.
     * @throws {GeminiServiceError} If the Gemini AI service fails to analyze the content.
     */
    async analyzeContent(content) {
        systemLog('debug', 'Gemini AI: Analyzing content', { contentSnippet: content.substring(0, 100) });
        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/analyze`,
            { content, model: 'gemini-pro-1.5' },
            100, 500, 0.1,
            {
                entities: ["Document", "Gemini AI", "Content Analysis", "Data Management"],
                keywords: ["analysis", "text", "understanding", "insights", "processing"],
                sentiment: Math.random() > 0.7 ? "positive" : (Math.random() > 0.4 ? "negative" : "neutral"),
                summary: `This is an AI-generated concise summary of the document content, highlighting key aspects as understood by Gemini's advanced NLP model.`,
                readabilityScore: parseFloat((Math.random() * 100).toFixed(2)), // Flesch-Kincaid style score
                language: 'en' // Simulated language detection
            }
        )).then(res => res.data);
    },

    /**
     * Simulates categorizing/classifying a document into predefined types or custom categories.
     * This helps in organizing documents and automating workflows.
     *
     * @param {string} content - The text content of the document.
     * @param {string[]} [availableCategories=SUPPORTED_DOCUMENT_TYPES] - A list of categories for classification.
     * @returns {Promise<{category: string, confidence: number, tags: string[], primaryTopic: string}>}
     *   The most probable category, a confidence score, automatically generated tags, and a primary topic.
     * @throws {GeminiServiceError} If the Gemini AI service fails to categorize the document.
     */
    async categorizeDocument(content, availableCategories = SUPPORTED_DOCUMENT_TYPES) {
        systemLog('debug', 'Gemini AI: Categorizing document', { contentSnippet: content.substring(0, 100), availableCategories });
        const predictedCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/categorize`,
            { content, availableCategories, model: 'gemini-classifier' },
            150, 600, 0.08,
            {
                category: predictedCategory,
                confidence: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
                tags: ["AI-classified", "automatic", "document", predictedCategory.replace(/_/g, '-')],
                primaryTopic: `Topic related to ${predictedCategory}`
            }
        )).then(res => res.data);
    },

    /**
     * Simulates security scanning of document content for malware signatures, sensitive data (PII),
     * and potential compliance risks.
     *
     * @param {string} content - The text content of the document.
     * @param {string} filename - The original filename, used for contextual analysis.
     * @returns {Promise<{isSafe: boolean, threatsDetected: string[], sensitiveDataDetected: string[], complianceFlags: string[]}>}
     *   A boolean indicating safety, lists of detected threats, sensitive data, and compliance flags.
     * @throws {GeminiServiceError} If the Gemini AI security scanner encounters an error.
     */
    async scanDocument(content, filename) {
        systemLog('debug', 'Gemini AI: Scanning document for security and sensitive data', { filename, contentSnippet: content.substring(0, 50) });
        const isSafe = Math.random() > 0.25; // 25% chance of detecting something
        const threatsDetected = Math.random() < 0.1 ? ["potential_malware_signature", "embedded_exploit_vector"] : [];
        const sensitiveDataDetected = Math.random() < 0.2 ? ["PII: email_address", "PII: phone_number", "PHI: medical_record_id"] : [];
        const complianceFlags = Math.random() < 0.15 ? ["GDPR_risk_factor", "HIPAA_disclosure_alert"] : [];

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/scan`,
            { content, filename, scan_profile: 'enterprise-security' },
            200, 800, 0.15, // Higher fail rate for critical security scans
            { isSafe, threatsDetected, sensitiveDataDetected, complianceFlags }
        )).then(res => res.data);
    },

    /**
     * Simulates redacting sensitive information (e.g., PII, PHI) from document content.
     * This ensures privacy and compliance with data protection regulations.
     *
     * @param {string} content - The text content of the document.
     * @param {string[]} [dataTypesToRedact=['PII', 'PHI', 'Financial']] - Specific types of data to target for redaction.
     * @returns {Promise<{redactedContent: string, redactionLog: Array<{type: string, count: number, originalExamples: string[]}>, totalRedactions: number}>}
     *   The content with sensitive data redacted, a log of what was redacted, and the total count.
     * @throws {GeminiServiceError} If Gemini AI redaction service fails.
     */
    async redactSensitiveData(content, dataTypesToRedact = ['PII', 'PHI', 'Financial']) {
        systemLog('debug', 'Gemini AI: Redacting sensitive data', { dataTypesToRedact, contentSnippet: content.substring(0, 50) });
        let redactedContent = content;
        const redactionLog = [];
        let totalRedactions = 0;

        // Simulate PII/PHI detection and redaction
        if (content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/)) {
            redactedContent = redactedContent.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL_REDACTED]");
            redactionLog.push({ type: 'PII: Email', count: (content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || []).length, originalExamples: ['user@example.com'] });
            totalRedactions += redactionLog[redactionLog.length - 1].count;
        }
        if (content.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)) {
            redactedContent = redactedContent.replace(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE_REDACTED]");
            redactionLog.push({ type: 'PII: Phone', count: (content.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || []).length, originalExamples: ['(123) 456-7890'] });
            totalRedactions += redactionLog[redactionLog.length - 1].count;
        }
        // Add more complex regex for PHI, financial data, etc. in a real system

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/redact`,
            { content, dataTypesToRedact, redaction_profile: 'strict-gdpr-hipaa' },
            100, 500, 0.07,
            { redactedContent, redactionLog, totalRedactions }
        )).then(res => res.data);
    },

    /**
     * Simulates generating new text content based on a prompt and optional contextual document content.
     * This can be used for drafting responses, creating summaries, or expanding on ideas.
     *
     * @param {string} prompt - The creative prompt for content generation.
     * @param {string} [contextContent=''] - Additional document content to provide context to Gemini.
     * @param {object} [generationOptions={temperature: 0.7, maxLength: 500}] - Options like temperature and max length.
     * @returns {Promise<{generatedText: string, tokenCount: number, safetyRatings: object}>}
     *   The AI-generated text, token count, and safety ratings.
     * @throws {GeminiServiceError} If Gemini AI content generation fails.
     */
    async generateContent(prompt, contextContent = '', generationOptions = { temperature: 0.7, maxLength: 500 }) {
        systemLog('debug', 'Gemini AI: Generating content', { promptSnippet: prompt.substring(0, 50), contextProvided: !!contextContent });
        const generatedText = `This is AI-generated text based on your prompt: "${prompt}". Context provided: ${contextContent ? 'Yes, with relevant details.' : 'No.'} Gemini's advanced generative model crafted this output professionally, aiming for clarity and relevance.`;
        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/generate`,
            { prompt, context: contextContent, options: generationOptions, model: 'gemini-ultra-pro' },
            200, 1000, 0.1,
            {
                generatedText,
                tokenCount: Math.ceil(generatedText.length / 4), // ~4 chars per token
                safetyRatings: { harmful: 'BLOCK_NONE', sexual: 'BLOCK_NONE' } // Simulated safety
            }
        )).then(res => res.data);
    },

    /**
     * Simulates translating document content from a source language to a target language.
     * Leverages Gemini's multilingual capabilities for high-quality translations.
     *
     * @param {string} content - The text content to translate.
     * @param {string} targetLanguage - The ISO 639-1 code of the target language (e.g., 'es', 'fr', 'de').
     * @param {string} [sourceLanguage='auto'] - The ISO 639-1 code of the source language. 'auto' for auto-detection.
     * @returns {Promise<{translatedText: string, detectedLanguage: string, confidence: number}>}
     *   The translated text, the detected source language, and a confidence score for the translation.
     * @throws {GeminiServiceError} If Gemini AI translation service fails.
     */
    async translateContent(content, targetLanguage, sourceLanguage = 'auto') {
        systemLog('debug', 'Gemini AI: Translating content', { targetLanguage, sourceLanguage, contentSnippet: content.substring(0, 50) });
        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/translate`,
            { content, targetLanguage, sourceLanguage, model: 'gemini-translator' },
            200, 700, 0.09,
            {
                translatedText: `[TRANSLATED TO ${targetLanguage.toUpperCase()} BY GEMINI AI] ${content} [END TRANSLATION]`,
                detectedLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage, // Always 'en' for simulation unless specified
                confidence: parseFloat((0.9 + Math.random() * 0.1).toFixed(2))
            }
        )).then(res => res.data);
    },

    /**
     * Simulates generating a globally unique and traceable document ID using a robust Gemini AI service.
     * This ensures high-entropy, collision-resistant IDs suitable for large-scale systems.
     *
     * @returns {Promise<string>} A unique document identifier string.
     * @throws {GeminiServiceError} If Gemini AI ID generation service fails.
     */
    async generateDocumentId() {
        systemLog('debug', 'Gemini AI: Generating unique document ID');
        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/generate-id`,
            { type: 'document', format: 'uuid-v4-gemini' },
            10, 50, 0.01, // Low fail rate for ID generation
            { generatedId: `doc-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}` }
        )).then(res => res.data.generatedId);
    },

    /**
     * Simulates checking document compliance against predefined regulatory rules (e.g., GDPR, HIPAA, SOC2).
     * Gemini AI can identify potential violations and suggest remediation actions.
     *
     * @param {string} content - The document content.
     * @param {string[]} complianceStandards - An array of compliance standards to check against (e.g., ['GDPR', 'HIPAA', 'ISO27001']).
     * @returns {Promise<{isCompliant: boolean, violations: Array<{rule: string, description: string, severity: 'low'|'medium'|'high', suggestedAction: string}>, assessmentScore: number}>}
     *   A compliance status, a list of detailed violations, and an overall assessment score.
     * @throws {GeminiServiceError} If Gemini AI compliance checker fails.
     */
    async checkCompliance(content, complianceStandards) {
        systemLog('debug', 'Gemini AI: Checking compliance', { complianceStandards, contentSnippet: content.substring(0, 50) });
        const hasComplianceIssue = Math.random() < 0.15; // 15% chance of finding issues
        const violations = hasComplianceIssue
            ? [{
                rule: 'GDPR_DATA_RETENTION_POLICY',
                description: 'Sensitive personal data detected that may exceed defined retention periods.',
                severity: 'high',
                suggestedAction: 'Review data retention schedule or apply data anonymization.'
            }]
            : [];
        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/compliance`,
            { content, complianceStandards, model: 'gemini-compliance-engine' },
            150, 600, 0.08,
            {
                isCompliant: !hasComplianceIssue,
                violations,
                assessmentScore: parseFloat((Math.random() * 20 + 80).toFixed(2)) // 80-100 score
            }
        )).then(res => res.data);
    },

    /**
     * Simulates securely logging an audit trail entry using Gemini AI.
     * This ensures immutable, searchable, and verifiable records of all critical document actions.
     *
     * @param {string} documentId - The ID of the document involved in the action.
     * @param {string} actionType - The type of action (e.g., 'CREATE', 'UPDATE', 'DELETE', 'RETRIEVE', 'ACCESS_DENIED').
     * @param {string} description - A human-readable description of the action.
     * @param {object} [details={}] - Additional structured JSON details to store with the log.
     * @param {string} [userId='system'] - The ID of the user or system initiating the action.
     * @returns {Promise<{logId: string, timestamp: string}>} The ID of the created log entry and its timestamp.
     */
    async logDocumentAction(documentId, actionType, description, details = {}, userId = 'system') {
        if (!AUDIT_LOG_ENABLED) {
            systemLog('debug', 'Audit logging disabled. Skipping log entry.', { documentId, actionType });
            return { logId: 'disabled', timestamp: new Date().toISOString() };
        }
        systemLog('info', `Gemini AI: Audit Log - ${actionType} for Document ${documentId}`, { description, details, userId });
        return simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/auditlog`,
            { documentId, actionType, description, details, userId, timestamp: new Date().toISOString() },
            20, 100, 0.02, // Very low fail rate for audit logs
            { logId: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 7)}` }
        ).then(res => res.data).catch(err => {
            systemLog('error', "Failed to write audit log via Gemini AI service. This is critical.", { documentId, actionType, description, details, userId, originalError: err });
            // Critical: Do not rethrow, but ensure alerts are triggered in a real system for audit failures.
            return { logId: 'failed-log-critical', timestamp: new Date().toISOString(), error: err.message };
        });
    },

    /**
     * Simulates performing semantic search across a collection of documents using a natural language query.
     * Gemini AI understands query intent and retrieves relevant documents even if keywords don't directly match.
     *
     * @param {string} query - The natural language search query.
     * @param {Array<{id: string, content: string, title?: string, tags?: string[]}>} documentsForSearch - Simplified representation of documents to search.
     * @returns {Promise<{relevantDocuments: Array<{id: string, relevanceScore: number, snippet: string}>, searchMetrics: object}>}
     *   A list of relevant documents with relevance scores and content snippets, plus search performance metrics.
     * @throws {GeminiServiceError} If Gemini AI semantic search service fails.
     */
    async performSemanticSearch(query, documentsForSearch) {
        systemLog('debug', 'Gemini AI: Performing semantic search', { query, docCount: documentsForSearch.length });

        const filteredDocs = documentsForSearch.filter(doc =>
            doc.id.includes(query) ||
            doc.content.toLowerCase().includes(query.toLowerCase()) ||
            (doc.title && doc.title.toLowerCase().includes(query.toLowerCase())) ||
            (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
        );

        const relevantDocuments = filteredDocs.map(doc => ({
            id: doc.id,
            relevanceScore: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)), // Simulate relevance
            snippet: `...snippet from ${doc.content.substring(0, Math.min(doc.content.length, 100))}...`
        }));
        relevantDocuments.sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/search/semantic`,
            { query, document_references: documentsForSearch.map(d => d.id), model: 'gemini-semantic-search' },
            150, 700, 0.07,
            {
                relevantDocuments: relevantDocuments.slice(0, Math.min(relevantDocuments.length, 10)), // Return top N
                searchMetrics: { queryTokens: query.split(' ').length, responseTimeMs: 200 + Math.random() * 500 }
            }
        )).then(res => res.data);
    },

    /**
     * Simulates evaluating complex access control policies based on user roles, document sensitivity, and requested action.
     * Gemini AI acts as a Policy Decision Point (PDP) for fine-grained access management.
     *
     * @param {object} accessContext - Contains all relevant information for the access decision.
     * @param {string} accessContext.documentId - The ID of the document.
     * @param {string} accessContext.userId - The ID of the user requesting access.
     * @param {string} accessContext.action - The attempted action (e.g., 'read', 'write', 'delete', 'download').
     * @param {string} accessContext.userRoles - User's roles (e.g., 'admin', 'editor', 'viewer').
     * @param {string} accessContext.documentSensitivity - Document's sensitivity level ('low', 'medium', 'high').
     * @param {string} accessContext.documentType - Document's primary type.
     * @returns {Promise<{isAllowed: boolean, reason: string, policyVersion: string}>}
     *   Whether the access is allowed, the reason for the decision, and the policy version used.
     * @throws {GeminiServiceError} If Gemini AI policy evaluation service fails.
     */
    async evaluateAccessPolicy(accessContext) {
        systemLog('debug', 'Gemini AI: Evaluating access policy', accessContext);
        let isAllowed = true;
        let reason = "Access granted by default policy.";

        // Simulate complex policy logic
        if (accessContext.action === 'delete' && accessContext.userRoles !== 'admin') {
            isAllowed = false;
            reason = "Only users with 'admin' role can perform delete operations.";
        } else if (accessContext.documentSensitivity === 'high' && !['admin', 'editor'].includes(accessContext.userRoles)) {
            isAllowed = false;
            reason = "Access to highly sensitive documents restricted to 'admin' or 'editor' roles.";
        } else if (accessContext.documentType === 'contract' && accessContext.action === 'write' && accessContext.userRoles === 'viewer') {
            isAllowed = false;
            reason = "Users with 'viewer' role cannot modify contract documents.";
        } else if (accessContext.documentableType === 'Customer' && accessContext.userId !== accessContext.documentableId && accessContext.userRoles !== 'admin') {
            isAllowed = false;
            reason = "Users can only access their own customer-related documents unless they are an admin.";
        }

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/access/policy-evaluate`,
            accessContext,
            50, 200, 0.03,
            { isAllowed, reason, policyVersion: 'v2.1' }
        )).then(res => res.data);
    },

    /**
     * Simulates checking document retention policies with Gemini AI to determine if a document
     * can be soft-deleted, hard-deleted, or if it must be retained due to regulatory or business rules.
     *
     * @param {string} documentId - The ID of the document.
     * @param {boolean} isHardDeleteAttempt - True if a permanent deletion is being attempted.
     * @returns {Promise<{canSoftDelete: boolean, canHardDelete: boolean, policyDetails: string, retentionEndDate: string|null}>}
     *   Boolean flags indicating allowed deletion types, policy details, and a retention end date if applicable.
     * @throws {GeminiServiceError} If Gemini AI retention policy service fails.
     */
    async checkRetentionPolicy(documentId, isHardDeleteAttempt) {
        systemLog('debug', 'Gemini AI: Checking retention policy', { documentId, isHardDeleteAttempt });
        const canSoftDelete = Math.random() < 0.95; // Usually allowed
        const canHardDelete = Math.random() < 0.8; // More restrictive
        const retentionEndDate = canHardDelete ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // One year from now

        let policyDetails = "Standard retention policy applies. Soft delete generally permitted; hard delete requires policy review.";
        if (!canSoftDelete) policyDetails = "Soft delete restricted by critical legal retention policy. Document must remain accessible.";
        if (!canHardDelete) policyDetails = `Hard delete restricted by regulatory compliance; document must be retained until ${retentionEndDate}.`;

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/retention/check`,
            { documentId, isHardDeleteAttempt, policy_engine: 'gemini-compliance-retention' },
            50, 250, 0.05,
            { canSoftDelete, canHardDelete, policyDetails, retentionEndDate }
        )).then(res => res.data);
    },

    /**
     * Simulates Gemini AI performing an initial review assessment for a document, integrating with
     * an automated workflow system. This can pre-screen documents for critical issues.
     *
     * @param {string} content - The content of the document (or a significant portion).
     * @param {string} reviewType - The type of review being initiated (e.g., 'legal', 'compliance', 'security', 'content_quality').
     * @returns {Promise<{sentiment: string, keyIssues: Array<{issue: string, severity: 'low'|'medium'|'high', suggestedAction: string}>, recommendedReviewers: string[], overallRecommendation: string}>}
     *   Initial sentiment, identified key issues with severity, recommended human reviewers, and an overall AI recommendation.
     * @throws {GeminiServiceError} If Gemini AI review assessment fails.
     */
    async performReviewAssessment(content, reviewType) {
        systemLog('debug', 'Gemini AI: Performing review assessment', { reviewType, contentSnippet: content.substring(0, 50) });
        const sentiment = Math.random() > 0.6 ? "positive" : (Math.random() > 0.3 ? "neutral" : "negative");
        const hasCriticalIssue = Math.random() < 0.2;
        const keyIssues = hasCriticalIssue
            ? [{ issue: `Potential critical issue detected related to ${reviewType} standards.`, severity: 'high', suggestedAction: 'Immediate human review required.' }]
            : [];
        const recommendedReviewers = ["ai_reviewer_bot", "human_legal_expert", "compliance_officer"];
        const overallRecommendation = hasCriticalIssue ? "Critical human review required." : "Proceed with standard review process.";

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/review/assess`,
            { content: content.substring(0, 200) + '...', reviewType, model: 'gemini-workflow-assistant' },
            200, 900, 0.12,
            { sentiment, keyIssues, recommendedReviewers, overallRecommendation }
        )).then(res => res.data);
    },

    /**
     * Simulates Gemini AI generating document version metadata, including hashes and a summary of changes
     * between two versions of a document. Essential for robust version control systems.
     *
     * @param {string} documentId - The ID of the document.
     * @param {string} oldContent - The content of the previous version.
     * @param {string} newContent - The content of the current version.
     * @returns {Promise<{versionHash: string, changesDetected: number, summaryOfChanges: string, detailedDiffUrl: string}>}
     *   A unique version hash, count of changes, a natural language summary of changes, and a URL for a detailed diff (simulated).
     * @throws {GeminiServiceError} If Gemini AI versioning service fails.
     */
    async generateVersionDiff(documentId, oldContent, newContent) {
        systemLog('debug', 'Gemini AI: Generating version diff', { documentId, oldContentLen: oldContent.length, newContentLen: newContent.length });
        const changesDetected = Math.abs(oldContent.length - newContent.length) > 10 ? Math.ceil(Math.random() * 5) : 0; // Simulate number of changes
        const summaryOfChanges = changesDetected > 0 ? "Significant content modifications detected across multiple sections. AI identified additions and removals." : "Minor textual adjustments or no significant content changes.";

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/versioning/diff`,
            { documentId, oldContent: oldContent.substring(0, 200), newContent: newContent.substring(0, 200), model: 'gemini-diff-engine' },
            100, 400, 0.05,
            {
                versionHash: `v${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                changesDetected,
                summaryOfChanges,
                detailedDiffUrl: `https://gemini.ai/diff/${documentId}/v${Date.now()}` // Simulated diff viewer
            }
        )).then(res => res.data);
    },

    /**
     * Simulates advanced structured data extraction from documents using Gemini AI,
     * such as extracting fields from invoices, forms, or contracts based on a defined schema.
     *
     * @param {string} content - The document content (or extracted text).
     * @param {string} schemaId - Identifier for the data extraction schema (e.g., 'invoice-schema', 'application-form-v2').
     * @returns {Promise<{extractedData: object, confidence: number, schemaVersion: string, extractionErrors: Array<{field: string, reason: string}>}>}
     *   An object containing extracted key-value data, overall confidence, schema version used, and any extraction errors.
     * @throws {GeminiServiceError} If Gemini AI data extraction service fails.
     */
    async extractStructuredData(content, schemaId) {
        systemLog('debug', 'Gemini AI: Extracting structured data', { schemaId, contentSnippet: content.substring(0, 50) });
        const simulatedData = schemaId === 'invoice-schema' ? {
            invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            totalAmount: parseFloat((100 + Math.random() * 900).toFixed(2)),
            currency: 'USD',
            issueDate: new Date().toISOString().split('T')[0],
            vendorName: 'GlobalTech Solutions Inc.',
            lineItems: [{ description: 'Consulting services', quantity: 1, unitPrice: 500, total: 500 }]
        } : { genericField_A: 'extracted_value_1', genericField_B: Math.random(), status: 'processed' };
        const extractionErrors = Math.random() < 0.05 ? [{ field: 'VAT_number', reason: 'Not found or ambiguous format' }] : [];

        return withRetry(() => simulateGeminiCall(
            `${GEMINI_AI_SERVICE_URL}/data-extraction`,
            { content: content.substring(0, 500), schemaId, model: 'gemini-extractor-v2' },
            200, 1000, 0.1,
            {
                extractedData: simulatedData,
                confidence: parseFloat((0.8 + Math.random() * 0.2).toFixed(2)),
                schemaVersion: '2.0',
                extractionErrors
            }
        )).then(res => res.data);
    }
};

// --- Core Document Data Structures ---

/**
 * @typedef {object} DocumentPayload
 * @property {File | Blob | string} file - The actual document file object (Blob/File) or its string content.
 * @property {string} documentable_id - ID of the entity this document is associated with (e.g., user ID, project ID, customer ID).
 * @property {string} documentable_type - Type of the associated entity (e.g., 'User', 'Project', 'Customer').
 * @property {string} [document_type] - The primary type of the document (e.g., 'invoice', 'contract'). Can be auto-categorized by AI.
 * @property {string} [id] - Optional pre-assigned unique document ID. If not provided, Gemini AI will generate one.
 * @property {object} [metadata={}] - Additional custom metadata for the document.
 */

/**
 * @typedef {object} ProcessedDocument
 * @property {string} id - Unique identifier for the document, globally managed.
 * @property {string} documentable_id - ID of the entity this document belongs to.
 * @property {string} documentable_type - Type of the associated entity.
 * @property {string} document_type - The AI-categorized or user-defined primary type of the document.
 * @property {string} filename - Original filename of the document.
 * @property {string} file_url - Secure URL where the document's content is stored (e.g., cloud storage).
 * @property {number} size_bytes - Size of the document in bytes.
 * @property {string} mime_type - MIME type of the document (e.g., 'application/pdf', 'image/jpeg').
 * @property {string} uploaded_at - ISO 8601 timestamp of when the document was initially uploaded.
 * @property {string} [updated_at] - ISO 8601 timestamp of the last update to the document's metadata or content.
 * @property {object} ai_insights - Comprehensive insights generated by Gemini AI (entities, summary, sentiment, tags, etc.).
 * @property {object} security_status - Security scan results from Gemini AI (safety, threats, sensitive data).
 * @property {object} compliance_status - Compliance check results from Gemini AI (violations, assessment score).
 * @property {boolean} is_redacted - True if sensitive data was automatically redacted by AI.
 * @property {string} content_preview - A short, redacted preview of the document's content.
 * @property {object} metadata - Merged metadata, including user-defined and AI-generated.
 * @property {boolean} [is_deleted=false] - Flag indicating if the document has been soft-deleted.
 * @property {string|null} [deleted_at=null] - Timestamp of soft-deletion.
 */

// --- Core Document Actions (Enhanced with Gemini AI) ---

/**
 * Simulates storing a document's content in a secure cloud storage solution.
 * This is a crucial step in the document lifecycle, providing a persistent and accessible location for the file.
 *
 * @param {DocumentPayload} docData - The document payload containing the file/content and its ID.
 * @returns {Promise<{file_url: string, size_bytes: number, mime_type: string, filename: string}>}
 *   Details of the stored file, including its unique URL.
 */
async function storeDocumentInCloud(docData) {
    return new Promise(resolve => {
        const simulatedFileName = docData.file instanceof File ? docData.file.name : `document_${Date.now()}.txt`;
        const simulatedMimeType = docData.file instanceof File ? docData.file.type : 'text/plain';
        const simulatedSize = docData.file instanceof File ? docData.file.size : Buffer.from(docData.file).length; // If string
        setTimeout(() => {
            const file_url = `https://secure-storage.example.com/documents/${docData.documentable_type}/${docData.documentable_id}/${docData.id || simulatedFileName}`;
            systemLog('info', `Document stored in simulated cloud storage: ${file_url}`);
            resolve({
                file_url,
                size_bytes: simulatedSize,
                mime_type: simulatedMimeType,
                filename: simulatedFileName,
            });
        }, 50 + Math.random() * 150);
    });
}

/**
 * Performs a comprehensive multi-stage pipeline for creating a single document.
 * This includes robust input validation, extensive Gemini AI pre-processing (analysis,
 * categorization, security scanning, redaction, compliance checks), secure cloud storage,
 * and structured output.
 *
 * @param {DocumentPayload} data - The complete document data payload.
 * @returns {Promise<ProcessedDocument | {id: string, error: DocumentError}>}
 *   Returns the fully processed and created document object on success, or an object containing the
 *   original ID and an error if processing failed for specific reasons.
 */
export async function processAndCreateSingleDocument(data) {
    const documentCorrelationId = data.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    systemLog('info', `Initiating document creation pipeline for documentable ${data?.documentable_id} (Type: ${data?.documentable_type})`, { correlationId: documentCorrelationId, documentTypeHint: data?.document_type });

    try {
        // --- 1. Robust Input Validation ---
        if (!data || !data.file || !data.documentable_id || !data.documentable_type) {
            throw new DocumentValidationError("Missing critical document fields (file, documentable_id, documentable_type).", { payload: data });
        }
        if (typeof data.file === 'string' && data.file.trim().length === 0) {
            throw new DocumentValidationError("Document content (string) cannot be empty.");
        }
        if (data.file instanceof File && data.file.size === 0) {
            throw new DocumentValidationError("Document file cannot be empty.", { field: 'file', reason: 'empty_file' });
        }
        if (data.file instanceof File && data.file.size > MAX_DOCUMENT_SIZE_BYTES) {
            throw new DocumentValidationError(
                `Document file size (${(data.file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum allowed size of ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB.`,
                { field: 'file', reason: 'too_large', actualSize: data.file.size, maxSize: MAX_DOCUMENT_SIZE_BYTES }
            );
        }
        // Validate document_type if provided against a known list, warn if unsupported
        if (data.document_type && !SUPPORTED_DOCUMENT_TYPES.includes(data.document_type)) {
            systemLog('warn', `User-provided document type '${data.document_type}' is not in the list of SUPPORTED_DOCUMENT_TYPES. AI auto-categorization will be prioritized.`, { correlationId: documentCorrelationId });
        }

        const documentContent = typeof data.file === 'string' ? data.file : `Simulated content for ${data.file.name || 'uploaded_file'}. This content is used for AI analysis only, not the actual stored binary.`;
        const documentId = data.id || await GeminiAI.generateDocumentId();
        const originalFilename = data.file instanceof File ? data.file.name : `generated_doc_${Date.now()}.txt`;

        // Simulate specific failure condition from original code for 'failed_type'
        if (data.document_type === "failed_type") {
            throw new GeminiServiceError(`Gemini AI simulation failed to create document of type '${data.document_type}' as per predefined error scenario.`, null, 500, 'SIMULATED_FAILURE');
        }

        // --- 2. Comprehensive Gemini AI Pre-processing Pipeline (Parallel Execution for Efficiency) ---
        systemLog('info', `Starting Gemini AI pre-processing for document ${documentId}.`, { correlationId: documentCorrelationId });
        const [
            aiAnalysis,
            categorizationResult,
            securityScan,
            redactionResult,
            complianceCheck,
            structuredDataExtraction // New AI step
        ] = await Promise.all([
            GeminiAI.analyzeContent(documentContent),
            GeminiAI.categorizeDocument(documentContent, SUPPORTED_DOCUMENT_TYPES),
            GeminiAI.scanDocument(documentContent, originalFilename),
            GeminiAI.redactSensitiveData(documentContent, ['PII', 'PHI', 'Financial']),
            GeminiAI.checkCompliance(documentContent, ['GDPR', 'HIPAA', 'ISO27001']),
            GeminiAI.extractStructuredData(documentContent, data.document_type === 'invoice' ? 'invoice-schema' : 'generic-doc-schema') // Dynamic schema
        ]);
        systemLog('info', `Gemini AI pre-processing completed for document ${documentId}.`, { correlationId: documentCorrelationId, aiAnalysisSummary: aiAnalysis.summary.substring(0, 50), category: categorizationResult.category });

        // Conditional Error Handling based on AI results (critical failures)
        if (!securityScan.isSafe || complianceCheck.violations.length > 0) {
            systemLog('warn', `Security or compliance issues detected for document ${documentId}.`, {
                correlationId: documentCorrelationId,
                securityThreats: securityScan.threatsDetected,
                complianceViolations: complianceCheck.violations
            });
            // Depending on enterprise policy, this could be a hard block:
            // if (!securityScan.isSafe && securityScan.threatsDetected.includes('critical_malware')) {
            //     throw new DocumentValidationError("Document blocked due to critical security threat detected by Gemini AI.", { documentId, threats: securityScan.threatsDetected });
            // }
        }

        // Determine final document type: prioritize user's type if supported and confident, otherwise use AI's.
        const finalDocumentType = (data.document_type && SUPPORTED_DOCUMENT_TYPES.includes(data.document_type) && categorizationResult.confidence > 0.6)
            ? data.document_type
            : categorizationResult.category;

        // --- 3. Secure Document Storage ---
        systemLog('info', `Storing document content for document ${documentId} in cloud.`, { correlationId: documentCorrelationId });
        const storageInfo = await storeDocumentInCloud({ ...data, id: documentId, filename: originalFilename });
        systemLog('info', `Document ${documentId} stored at: ${storageInfo.file_url}.`, { correlationId: documentCorrelationId });

        // --- 4. Construct Final Processed Document Object ---
        const createdDocument = {
            id: documentId,
            documentable_id: data.documentable_id,
            documentable_type: data.documentable_type,
            document_type: finalDocumentType,
            filename: storageInfo.filename,
            file_url: storageInfo.file_url,
            size_bytes: storageInfo.size_bytes,
            mime_type: storageInfo.mime_type,
            uploaded_at: new Date().toISOString(),
            ai_insights: {
                entities: aiAnalysis.entities,
                keywords: aiAnalysis.keywords,
                sentiment: aiAnalysis.sentiment,
                summary: aiAnalysis.summary,
                readabilityScore: aiAnalysis.readabilityScore,
                language: aiAnalysis.language,
                category_confidence: categorizationResult.confidence,
                tags: categorizationResult.tags,
                primaryTopic: categorizationResult.primaryTopic,
                extracted_data: structuredDataExtraction.extractedData, // Include extracted data
                extraction_confidence: structuredDataExtraction.confidence
            },
            security_status: {
                isSafe: securityScan.isSafe,
                threatsDetected: securityScan.threatsDetected,
                sensitiveDataDetected: securityScan.sensitiveDataDetected,
                complianceFlags: securityScan.complianceFlags,
                scanned_at: new Date().toISOString()
            },
            compliance_status: {
                isCompliant: complianceCheck.isCompliant,
                violations: complianceCheck.violations,
                assessmentScore: complianceCheck.assessmentScore,
                checked_at: new Date().toISOString()
            },
            is_redacted: redactionResult.totalRedactions > 0,
            content_preview: redactionResult.redactedContent.substring(0, 300) + (redactionResult.redactedContent.length > 300 ? '...' : ''),
            metadata: { ...data.metadata, gemini_ai_processed: true, processed_version: '1.0' },
            is_deleted: false,
            deleted_at: null,
            // Include extraction errors for downstream processing
            extraction_errors: structuredDataExtraction.extractionErrors
        };

        systemLog('info', `Successfully completed document creation pipeline for document: ${documentId}`, { correlationId: documentCorrelationId });
        await GeminiAI.logDocumentAction(documentId, 'CREATE', 'Document created and processed successfully.', createdDocument);

        return createdDocument;
    } catch (error) {
        systemLog('error', `Failed to create document for documentable ${data?.documentable_id} (Type: ${data?.documentable_type}). Error: ${error.message}`, { correlationId: documentCorrelationId, errorStack: error.stack, originalPayload: data });

        // Log the failure to audit trail
        await GeminiAI.logDocumentAction(
            documentCorrelationId,
            'CREATE_FAILURE',
            `Document creation failed: ${error.message}`,
            { original_payload_summary: { id: data?.id, documentable_id: data?.documentable_id, type: data?.document_type }, error: { name: error.name, message: error.message, code: error.code, details: error.details } }
        ).catch(logErr => systemLog('error', "Failed to log creation failure to audit trail.", { logError: logErr, correlationId: documentCorrelationId })); // Catch logging errors

        // Return a standardized error object for batch processing
        return {
            id: documentCorrelationId,
            error: error instanceof DocumentError ? error : new DocumentError(`Unexpected error during document creation: ${error.message}`, error)
        };
    }
}

/**
 * @typedef {object} BulkDocumentCreationResult
 * @property {ProcessedDocument[]} success - Array of successfully created and processed documents.
 * @property {Array<{originalId: string, error: DocumentError}>} failures - Array of objects for documents that failed, including their original identifier and the DocumentError.
 */

/**
 * Orchestrates the creation of multiple documents in a batch, ensuring robust processing for each.
 * It leverages `processAndCreateSingleDocument` and aggregates results, separating successes from failures.
 *
 * @param {string} documentableId - The ID of the entity these documents belong to.
 * @param {string} documentableType - The type of the associated entity.
 * @param {Object.<string, Omit<DocumentPayload, 'documentable_id'|'documentable_type'>>} documents - An object where keys are arbitrary identifiers
 *                                                                                                     (useful for tracking, e.g., temporary client-side IDs)
 *                                                                                                     and values are document payloads (excluding documentable info).
 * @returns {Promise<BulkDocumentCreationResult>} An object containing arrays of successfully created documents and failed attempts.
 */
export async function createDocuments(documentableId, documentableType, documents) {
    systemLog('info', `Initiating bulk document creation for documentable ${documentableId} (Type: ${documentableType}). Number of documents: ${Object.keys(documents).length}.`);

    if (!documents || Object.keys(documents).length === 0) {
        systemLog('warn', 'Bulk document creation called with no documents provided.', { documentableId, documentableType });
        return { success: [], failures: [] };
    }

    const documentEntries = Object.entries(documents);
    const results = await Promise.all(
        documentEntries.map(async ([docKey, docData]) => {
            const originalPayload = {
                ...docData,
                documentable_id: documentableId,
                documentable_type: documentableType,
                id: docData.id || `bulk-temp-${docKey}-${Date.now()}` // Assign a temporary ID if not present for tracking
            };
            const result = await processAndCreateSingleDocument(originalPayload);
            return { originalId: originalPayload.id, result }; // Result can be a ProcessedDocument or {id, error}
        })
    );

    const bulkResult = {
        success: [],
        failures: []
    };

    results.forEach(({ originalId, result }) => {
        if (result && result.error) {
            bulkResult.failures.push({ originalId, error: result.error });
        } else if (result) {
            bulkResult.success.push(result);
        } else {
            // Unexpected scenario where result is null/undefined
            bulkResult.failures.push({ originalId, error: new DocumentError("Unknown error during document processing.") });
        }
    });

    systemLog('info', `Bulk document creation completed for ${documentableId}. Successes: ${bulkResult.success.length}, Failures: ${bulkResult.failures.length}.`, { documentableId, documentableType });
    return bulkResult;
}

/**
 * @typedef {object} DocumentDeletionResult
 * @property {string} id - The ID of the document targeted for deletion.
 * @property {boolean} success - True if deletion was successful.
 * @property {DocumentError} [error] - Error object if deletion failed.
 * @property {boolean} [hardDeleteAttempted] - Indicates if a hard delete was requested.
 */

/**
 * Deletes a single document, incorporating Gemini AI for audit logging, retention policy checks,
 * and security considerations. Supports both soft delete (marking as deleted) and hard delete
 * (permanent removal, subject to policies).
 *
 * @param {string} documentId - The unique ID of the document to delete.
 * @param {boolean} [hardDelete=false] - If true, attempts a permanent deletion; otherwise, performs a soft delete.
 * @param {string} [initiatingUserId='system'] - The ID of the user initiating the deletion.
 * @returns {Promise<DocumentDeletionResult>} An object detailing the outcome of the deletion attempt.
 * @throws {DocumentValidationError} If documentId is missing.
 * @throws {DocumentNotFoundError} If the document does not exist.
 * @throws {DocumentAccessDeniedError} If the user lacks permission for deletion.
 * @throws {DocumentError} If retention policies block the deletion.
 */
export async function deleteSingleDocument(documentId, hardDelete = false, initiatingUserId = 'system') {
    systemLog('info', `Attempting to ${hardDelete ? 'hard' : 'soft'} delete document ${documentId} by user ${initiatingUserId}.`);

    try {
        if (!documentId) {
            throw new DocumentValidationError("Document ID is required for deletion.", { documentId });
        }

        // Simulate fetching document metadata to ensure it exists and to check access/retention
        const document = await getDocumentById(documentId, false); // Fetch without re-enrichment
        if (!document) { // getDocumentById throws DocumentNotFoundError, so this check might be redundant if it always throws
            throw new DocumentNotFoundError(`Document with ID '${documentId}' not found for deletion.`, documentId);
        }

        // --- 1. Access Control Check ---
        const isAllowed = await checkDocumentAccess(documentId, initiatingUserId, hardDelete ? 'hard_delete' : 'soft_delete');
        if (!isAllowed) {
            throw new DocumentAccessDeniedError(`User ${initiatingUserId} is not authorized to ${hardDelete ? 'hard delete' : 'soft delete'} document ${documentId}.`, documentId, initiatingUserId, hardDelete ? 'hard_delete' : 'soft_delete');
        }

        // --- 2. Gemini AI Retention Policy Check ---
        const retentionCheck = await GeminiAI.checkRetentionPolicy(documentId, hardDelete);
        if (hardDelete && !retentionCheck.canHardDelete) {
            throw new DocumentError(`Hard deletion blocked: Retention policy prevents permanent deletion for document ${documentId}. Policy details: ${retentionCheck.policyDetails}`, null, 'RETENTION_POLICY_VIOLATION', { documentId, policyDetails: retentionCheck.policyDetails });
        } else if (!hardDelete && !retentionCheck.canSoftDelete) {
            systemLog('warn', `Soft deletion for document ${documentId} is restricted by retention policy. Proceeding with warning but not blocking. Policy details: ${retentionCheck.policyDetails}`);
            // Depending on policy, you might still block soft delete if it's truly critical
            // throw new DocumentError(`Soft deletion blocked: Retention policy prevents marking document ${documentId} as deleted.`, null, 'RETENTION_POLICY_VIOLATION');
        }

        // Simulate a "failed_id" condition from original code
        if (documentId === "failed_id") {
            throw new GeminiServiceError(`Gemini AI simulation failed to delete document with ID '${documentId}' as per predefined error scenario.`, null, 500, 'SIMULATED_FAILURE');
        }

        // --- 3. Perform the simulated deletion ---
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.1) { // Simulate transient error during storage operation
                    return reject(new GeminiServiceError("Transient storage error during deletion simulation."));
                }
                systemLog('info', `Simulating actual ${hardDelete ? 'hard' : 'soft'} deletion operation for ${documentId}.`);
                // In a real system: update database record (soft delete) or call cloud storage API (hard delete)
                resolve();
            }, 100 + Math.random() * 400);
        });

        const actionType = hardDelete ? 'HARD_DELETE' : 'SOFT_DELETE';
        const description = `Document ${documentId} ${hardDelete ? 'permanently deleted from storage' : 'marked as soft-deleted'}.`;
        systemLog('info', description, { documentId, hardDelete, initiatingUserId });
        await GeminiAI.logDocumentAction(documentId, actionType, description, { hardDelete, initiatingUserId });

        return { id: documentId, success: true, hardDeleteAttempted: hardDelete };
    } catch (error) {
        systemLog('error', `Failed to delete document ${documentId} by user ${initiatingUserId}. Error: ${error.message}`, { documentId, hardDelete, initiatingUserId, errorStack: error.stack });
        await GeminiAI.logDocumentAction(
            documentId,
            'DELETE_FAILURE',
            `Document deletion failed: ${error.message}`,
            { hardDeleteAttempted: hardDelete, userId: initiatingUserId, error: { name: error.name, message: error.message, code: error.code, details: error.details } }
        ).catch(logErr => systemLog('error', "Failed to log deletion failure to audit trail.", { logError: logErr, documentId }));

        return {
            id: documentId,
            success: false,
            hardDeleteAttempted: hardDelete,
            error: error instanceof DocumentError ? error : new DocumentError(`Unexpected error during document deletion: ${error.message}`, error)
        };
    }
}

/**
 * Handles the deletion of multiple documents, executing each deletion operation concurrently.
 * This function provides a robust batch deletion mechanism with individual result reporting.
 *
 * @param {string[]} ids - An array of document IDs to delete.
 * @param {boolean} [hardDelete=false] - If true, attempts hard deletion for all documents in the batch.
 * @param {string} [initiatingUserId='system'] - The ID of the user initiating the bulk deletion.
 * @returns {Promise<DocumentDeletionResult[]>} An array of results, one for each deletion attempt.
 */
export async function deleteDocuments(ids, hardDelete = false, initiatingUserId = 'system') {
    systemLog('info', `Initiating bulk document deletion for ${ids.length} documents by user ${initiatingUserId}. Hard delete: ${hardDelete}.`);

    if (!ids || ids.length === 0) {
        systemLog('warn', 'Bulk document deletion called with an empty list of IDs.');
        return Promise.resolve([]);
    }

    // Process deletions concurrently
    const promises = ids.map(id => deleteSingleDocument(id, hardDelete, initiatingUserId));
    const results = await Promise.all(promises);

    const successfulDeletions = results.filter(r => r.success).length;
    const failedDeletions = results.filter(r => !r.success).length;
    systemLog('info', `Bulk document deletion completed. Successes: ${successfulDeletions}, Failures: ${failedDeletions}.`, { idsCount: ids.length, successfulDeletions, failedDeletions, initiatingUserId });

    return results;
}

/**
 * @typedef {object} DocumentUpdatePayload
 * @property {string} [document_type] - New primary document type.
 * @property {object} [metadata] - Metadata fields to update or merge.
 * @property {string} [new_content] - New content for the document. Updating content triggers AI re-analysis.
 * @property {boolean} [trigger_ai_reanalysis=false] - Explicitly trigger AI re-analysis even if content didn't change.
 */

/**
 * Updates an existing document's metadata, type, or content.
 * If the document's content is updated, or `trigger_ai_reanalysis` is true, Gemini AI will
 * re-analyze the document to update insights, security status, and compliance.
 * This function handles versioning of metadata internally.
 *
 * @param {string} documentId - The ID of the document to update.
 * @param {DocumentUpdatePayload} updates - The fields and values to apply to the document.
 * @param {string} [initiatingUserId='system'] - The ID of the user initiating the update.
 * @returns {Promise<ProcessedDocument>} The fully updated document object.
 * @throws {DocumentNotFoundError} If the document specified by `documentId` does not exist.
 * @throws {DocumentValidationError} If the update payload is invalid or contains unsupported values.
 * @throws {DocumentAccessDeniedError} If the user lacks permission to update the document.
 * @throws {GeminiServiceError} If any Gemini AI re-analysis or processing step fails.
 */
export async function updateDocument(documentId, updates, initiatingUserId = 'system') {
    systemLog('info', `Initiating update for document ${documentId} by user ${initiatingUserId}.`, { updates });

    try {
        if (!documentId) {
            throw new DocumentValidationError("Document ID is required for update operation.");
        }
        if (!updates || Object.keys(updates).length === 0) {
            throw new DocumentValidationError("No update fields provided in the payload.", { updates });
        }

        // --- 1. Fetch Existing Document ---
        // Fetch existing document including its 'full_content' for potential re-analysis
        const existingDoc = await getDocumentById(documentId, false); // Get metadata only first
        // In a real system, you'd fetch the full content from storage or an internal service:
        const existingFullContent = existingDoc.full_content || "Simulated existing full content of the document. This is long enough to trigger AI analysis.";
        let currentDocumentContent = existingFullContent;

        // --- 2. Access Control Check ---
        const isAllowed = await checkDocumentAccess(documentId, initiatingUserId, 'write');
        if (!isAllowed) {
            throw new DocumentAccessDeniedError(`User ${initiatingUserId} is not authorized to update document ${documentId}.`, documentId, initiatingUserId, 'write');
        }

        let updatedDoc = { ...existingDoc, updated_at: new Date().toISOString() };
        let requiresReAnalysis = updates.trigger_ai_reanalysis || false;
        let oldContentForDiff = existingFullContent;

        // --- 3. Apply Updates and Determine Re-analysis Need ---
        if (updates.document_type) {
            if (!SUPPORTED_DOCUMENT_TYPES.includes(updates.document_type)) {
                systemLog('warn', `Attempted to set unsupported document type '${updates.document_type}' for ${documentId}.`, { documentId, newType: updates.document_type });
                // Policy choice: block, or allow but warn, or let AI re-categorize later
            }
            updatedDoc.document_type = updates.document_type;
        }

        if (updates.metadata) {
            updatedDoc.metadata = {
                ...updatedDoc.metadata,
                ...updates.metadata,
                version: (updatedDoc.metadata.version || 0) + 1, // Increment metadata version
                lastUpdatedBy: initiatingUserId
            };
        }

        if (updates.new_content && updates.new_content !== existingFullContent) {
            currentDocumentContent = updates.new_content;
            // In a real system, this would involve updating the file in cloud storage and possibly its URL
            // For simulation, we assume content is updated in storage and its size reflects new content.
            updatedDoc.size_bytes = Buffer.from(currentDocumentContent).length; // Simulate size update
            requiresReAnalysis = true; // Content change mandates re-analysis
            systemLog('info', `Document ${documentId} content updated. Triggering Gemini AI re-analysis and version diff.`, { documentId });
        }

        // --- 4. Gemini AI Re-analysis (if required) ---
        if (requiresReAnalysis) {
            systemLog('info', `Performing Gemini AI re-analysis for document ${documentId} due to content update or explicit request.`);
            const [
                aiAnalysis,
                categorizationResult,
                securityScan,
                redactionResult,
                complianceCheck,
                versionDiff,
                structuredDataExtraction
            ] = await Promise.all([
                GeminiAI.analyzeContent(currentDocumentContent),
                GeminiAI.categorizeDocument(currentDocumentContent, SUPPORTED_DOCUMENT_TYPES),
                GeminiAI.scanDocument(currentDocumentContent, updatedDoc.filename),
                GeminiAI.redactSensitiveData(currentDocumentContent),
                GeminiAI.checkCompliance(currentDocumentContent, ['GDPR', 'HIPAA']),
                GeminiAI.generateVersionDiff(documentId, oldContentForDiff, currentDocumentContent),
                GeminiAI.extractStructuredData(currentDocumentContent, updatedDoc.document_type === 'invoice' ? 'invoice-schema' : 'generic-doc-schema')
            ]);

            updatedDoc.ai_insights = {
                ...updatedDoc.ai_insights, // Preserve older insights if not overwritten
                entities: aiAnalysis.entities,
                keywords: aiAnalysis.keywords,
                sentiment: aiAnalysis.sentiment,
                summary: aiAnalysis.summary,
                readabilityScore: aiAnalysis.readabilityScore,
                language: aiAnalysis.language,
                category_confidence: categorizationResult.confidence,
                tags: categorizationResult.tags,
                primaryTopic: categorizationResult.primaryTopic,
                extracted_data: structuredDataExtraction.extractedData,
                extraction_confidence: structuredDataExtraction.confidence,
                last_reanalyzed_at: new Date().toISOString()
            };
            updatedDoc.security_status = {
                ...updatedDoc.security_status,
                isSafe: securityScan.isSafe,
                threatsDetected: securityScan.threatsDetected,
                sensitiveDataDetected: securityScan.sensitiveDataDetected,
                complianceFlags: securityScan.complianceFlags,
                last_scanned_at: new Date().toISOString(),
            };
            updatedDoc.compliance_status = {
                ...updatedDoc.compliance_status,
                isCompliant: complianceCheck.isCompliant,
                violations: complianceCheck.violations,
                assessmentScore: complianceCheck.assessmentScore,
                checked_at: new Date().toISOString()
            };
            updatedDoc.is_redacted = redactionResult.totalRedactions > 0;
            updatedDoc.content_preview = redactionResult.redactedContent.substring(0, 300) + (redactionResult.redactedContent.length > 300 ? '...' : '');
            updatedDoc.version_info = {
                lastVersionHash: versionDiff.versionHash,
                changesDetected: versionDiff.changesDetected,
                summaryOfChanges: versionDiff.summaryOfChanges,
                detailedDiffUrl: versionDiff.detailedDiffUrl,
                comparedToContentHash: "old_content_hash_placeholder" // In real system, this would be a hash of old content
            };
            updatedDoc.extraction_errors = structuredDataExtraction.extractionErrors;

            // Update document_type based on new content analysis if not explicitly provided in updates and AI is confident
            if (!updates.document_type && categorizationResult.confidence > 0.8) {
                systemLog('info', `Document type for ${documentId} updated to AI-suggested category '${categorizationResult.category}'.`);
                updatedDoc.document_type = categorizationResult.category;
            }
        }

        systemLog('info', `Document ${documentId} updated successfully.`, { documentId, initiatingUserId });
        await GeminiAI.logDocumentAction(documentId, 'UPDATE', 'Document metadata or content updated.', { updates, updated_by: initiatingUserId });

        // Remove the internal 'full_content' field before returning to client-side
        const { full_content, ...returnDoc } = updatedDoc;
        return returnDoc;

    } catch (error) {
        systemLog('error', `Failed to update document ${documentId} by user ${initiatingUserId}. Error: ${error.message}`, { documentId, initiatingUserId, errorStack: error.stack, updates });
        await GeminiAI.logDocumentAction(
            documentId,
            'UPDATE_FAILURE',
            `Document update failed: ${error.message}`,
            { original_updates: updates, updated_by: initiatingUserId, error: { name: error.name, message: error.message, code: error.code, details: error.details } }
        ).catch(logErr => systemLog('error', "Failed to log update failure to audit trail.", { logError: logErr, documentId }));
        throw error instanceof DocumentError ? error : new DocumentError(`An unexpected error occurred during document update: ${error.message}`, error);
    }
}

/**
 * Fetches a single document's detailed information, with an option to trigger fresh Gemini AI analysis.
 * This is the primary method for retrieving a comprehensive view of a document, including all its AI-generated insights.
 *
 * @param {string} documentId - The ID of the document to fetch.
 * @param {boolean} [enrichWithAI=false] - If true, triggers a fresh, on-demand Gemini AI analysis for the latest insights.
 * @param {string} [requestingUserId='system'] - The ID of the user requesting the document.
 * @returns {Promise<ProcessedDocument>} The comprehensive document object.
 * @throws {DocumentNotFoundError} If the document does not exist.
 * @throws {DocumentValidationError} If the documentId is invalid.
 * @throws {DocumentAccessDeniedError} If the user lacks permission to read the document.
 * @throws {GeminiServiceError} If Gemini AI enrichment fails.
 */
export async function getDocumentById(documentId, enrichWithAI = false, requestingUserId = 'system') {
    systemLog('info', `Attempting to retrieve document ${documentId} by user ${requestingUserId}. Enrich with AI: ${enrichWithAI}.`);

    try {
        if (!documentId) {
            throw new DocumentValidationError("Document ID is required to retrieve a document.");
        }

        // --- 1. Simulate Document Retrieval from Database/Storage ---
        // In a real system, this would be a database query or a call to a document service.
        // This includes a 'full_content' field that would usually be retrieved from actual storage.
        const simulatedDoc = {
            id: documentId,
            documentable_id: "client_ABC",
            documentable_type: "Customer",
            document_type: "invoice",
            filename: `invoice_${documentId}_Q3.pdf`,
            file_url: `https://secure-storage.example.com/documents/Customer/client_ABC/${documentId}.pdf`,
            size_bytes: 1251200, // 1.2MB
            mime_type: "application/pdf",
            uploaded_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            updated_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            ai_insights: {
                summary: "Existing summary of customer Q3 invoice, highlighting payment terms and line items.",
                entities: ["invoice", "customer_ABC", "Q3", "payment"],
                tags: ["financial", "billing"],
                last_reanalyzed_at: new Date(Date.now() - 86400000 * 2).toISOString() // AI insights 2 days old
            },
            security_status: { isSafe: true, scanned_at: new Date(Date.now() - 86400000 * 2).toISOString() },
            compliance_status: { isCompliant: true, checked_at: new Date(Date.now() - 86400000 * 2).toISOString() },
            is_redacted: false,
            metadata: { version: 2, processedBy: "Gemini v1.5", confidential: false },
            content_preview: "This is a preview of the invoice content, detailing services rendered and outstanding balance...",
            full_content: "This is the complete and unredacted content of the invoice, including all sensitive client details, line items, totals, and terms of service. It's a very important financial document and access should be strictly controlled." // Important for AI re-analysis
        };

        if (documentId === "non_existent_doc_id" || Math.random() < 0.03) { // 3% chance of random not found, simulates transient DB issues
            throw new DocumentNotFoundError(`Document with ID '${documentId}' not found in the system.`, documentId);
        }

        // --- 2. Access Control Check ---
        const isAllowed = await checkDocumentAccess(documentId, requestingUserId, 'read');
        if (!isAllowed) {
            throw new DocumentAccessDeniedError(`User ${requestingUserId} is not authorized to read document ${documentId}.`, documentId, requestingUserId, 'read');
        }

        let documentToReturn = { ...simulatedDoc };

        // --- 3. Optional Gemini AI Enrichment ---
        if (enrichWithAI) {
            systemLog('info', `Enriching document ${documentId} with fresh Gemini AI insights as requested.`);
            const documentContent = simulatedDoc.full_content; // Use full content for the most accurate analysis
            const [aiAnalysis, categorizationResult, securityScan] = await Promise.all([
                GeminiAI.analyzeContent(documentContent),
                GeminiAI.categorizeDocument(documentContent, SUPPORTED_DOCUMENT_TYPES),
                GeminiAI.scanDocument(documentContent, simulatedDoc.filename)
            ]);

            documentToReturn.ai_insights = {
                ...documentToReturn.ai_insights,
                entities: aiAnalysis.entities,
                keywords: aiAnalysis.keywords,
                sentiment: aiAnalysis.sentiment,
                summary: aiAnalysis.summary,
                readabilityScore: aiAnalysis.readabilityScore,
                language: aiAnalysis.language,
                category_confidence: categorizationResult.confidence,
                tags: categorizationResult.tags,
                primaryTopic: categorizationResult.primaryTopic,
                last_reanalyzed_at: new Date().toISOString(),
            };
            documentToReturn.security_status = {
                ...documentToReturn.security_status,
                isSafe: securityScan.isSafe,
                threatsDetected: securityScan.threatsDetected,
                sensitiveDataDetected: securityScan.sensitiveDataDetected,
                complianceFlags: securityScan.complianceFlags,
                last_scanned_at: new Date().toISOString(),
            };
            systemLog('info', `Document ${documentId} successfully enriched with latest Gemini AI data.`);
        }

        // --- 4. Audit Logging and Return ---
        await GeminiAI.logDocumentAction(documentId, 'RETRIEVE', `Document ${documentId} retrieved. Enriched with AI: ${enrichWithAI}.`, { requestingUserId, enrichWithAI });

        // Remove the internal 'full_content' field before returning to client-side to prevent accidental exposure
        const { full_content, ...returnDoc } = documentToReturn;
        return returnDoc;

    } catch (error) {
        systemLog('error', `Failed to retrieve document ${documentId} by user ${requestingUserId}. Error: ${error.message}`, { documentId, requestingUserId, enrichWithAI, errorStack: error.stack });
        await GeminiAI.logDocumentAction(
            documentId,
            'RETRIEVE_FAILURE',
            `Document retrieval failed: ${error.message}`,
            { userId: requestingUserId, enrichWithAI, error: { name: error.name, message: error.message, code: error.code, details: error.details } }
        ).catch(logErr => systemLog('error', "Failed to log retrieval failure to audit trail.", { logError: logErr, documentId }));
        throw error instanceof DocumentError ? error : new DocumentError(`An unexpected error occurred during document retrieval: ${error.message}`, error);
    }
}

/**
 * Searches for documents based on a wide range of criteria, leveraging Gemini AI for semantic search
 * capabilities, intelligent filtering, and advanced relevance ranking. Supports pagination.
 *
 * @param {object} query - Search criteria object.
 * @param {string} [query.keyword] - Free text keyword search. Gemini AI performs semantic understanding.
 * @param {string} [query.documentable_id] - Filters by the ID of the associated entity.
 * @param {string} [query.document_type] - Filters by a specific AI-categorized or user-defined document type.
 * @param {string[]} [query.tags] - Filters by AI-generated or manually assigned tags.
 * @param {string} [query.sentiment] - Filters by AI-determined sentiment ('positive', 'negative', 'neutral').
 * @param {boolean} [query.is_redacted] - Filters by whether the document contains redacted sensitive data.
 * @param {number} [query.limit=25] - Maximum number of search results to return per page.
 * @param {number} [query.offset=0] - Starting offset for pagination.
 * @param {string} [query.sortBy='relevance'] - Field to sort results by (e.g., 'uploaded_at', 'relevance', 'document_type').
 * @param {'asc'|'desc'} [query.sortOrder='desc'] - Sort order.
 * @param {string} [requestingUserId='system'] - The ID of the user performing the search.
 * @returns {Promise<{documents: ProcessedDocument[], totalCount: number, searchId: string}>}
 *   An object containing the array of matching documents, total count, and a search session ID.
 * @throws {DocumentValidationError} If the query parameters are invalid.
 * @throws {GeminiServiceError} If Gemini AI search services encounter an error.
 */
export async function searchDocuments(query, requestingUserId = 'system') {
    systemLog('info', `Initiating document search by user ${requestingUserId}. Query: ${JSON.stringify(query)}`);

    try {
        if (!query) {
            throw new DocumentValidationError("Search query object cannot be empty.");
        }
        if (query.limit && (query.limit <= 0 || query.limit > 100)) {
            throw new DocumentValidationError("Search limit must be between 1 and 100.", { field: 'limit', value: query.limit });
        }
        if (query.offset && query.offset < 0) {
            throw new DocumentValidationError("Search offset cannot be negative.", { field: 'offset', value: query.offset });
        }

        let matchingDocs = [];
        const totalSimulatedDocs = 100; // Increased simulated document count for more realistic search
        const allSimulatedDocs = Array.from({ length: totalSimulatedDocs }).map((_, i) => ({
            id: `doc-${i + 1}`,
            documentable_id: `client-${Math.floor(i / 10) + 1}`,
            documentable_type: ["Customer", "Project", "Employee", "Vendor"][Math.floor(Math.random() * 4)],
            document_type: SUPPORTED_DOCUMENT_TYPES[i % SUPPORTED_DOCUMENT_TYPES.length],
            filename: `document_file_${i + 1}.pdf`,
            file_url: `https://secure-storage.example.com/docs/doc-${i + 1}.pdf`,
            size_bytes: 1024 + (i * 100),
            mime_type: "application/pdf",
            uploaded_at: new Date(Date.now() - (i * 1000 * 3600 * 24 * (Math.random() * 30))).toISOString(), // Varying ages
            ai_insights: {
                summary: `Summary of document ${i + 1}. Key terms: ${["report", "contract", "financial", "legal", "policy", "research"][i % 6]}.`,
                tags: [i % 2 === 0 ? "confidential" : "public", `category-${i % 5}`, i % 3 === 0 ? "finance_dept" : "hr_dept"],
                sentiment: ['positive', 'negative', 'neutral'][i % 3],
                extracted_data: i % 2 === 0 ? { invoiceTotal: Math.random() * 1000 } : {}
            },
            security_status: { isSafe: Math.random() > 0.1 }, // 10% unsafe
            is_redacted: i % 4 === 0, // 25% redacted
            metadata: { creator: `User ${i % 7}`, department: `Dept ${i % 3 + 1}` },
            content_preview: `Preview of content for document ${i + 1}. This section contains diverse terms.`
        }));

        // Simulate initial filtering based on structured query parameters
        matchingDocs = allSimulatedDocs.filter(doc => {
            let match = true;
            if (query.documentable_id && doc.documentable_id !== query.documentable_id) match = false;
            if (query.document_type && doc.document_type !== query.document_type) match = false;
            if (query.tags && query.tags.length > 0) {
                if (!doc.ai_insights.tags || !query.tags.every(tag => doc.ai_insights.tags.includes(tag))) match = false;
            }
            if (query.sentiment && doc.ai_insights.sentiment !== query.sentiment) match = false;
            if (typeof query.is_redacted === 'boolean' && doc.is_redacted !== query.is_redacted) match = false;
            // Add more filters as needed (e.g., date range, size range, security status)
            return match;
        });

        // --- 1. Gemini AI Semantic Search for Keywords ---
        if (query.keyword) {
            systemLog('debug', `Performing Gemini AI semantic search for keyword: "${query.keyword}".`, { queryKeyword: query.keyword });
            // Send simplified document representations to Gemini for semantic ranking
            const docsForSemanticSearch = matchingDocs.map(d => ({
                id: d.id,
                content: `${d.ai_insights.summary} ${d.filename} ${d.content_preview}` // Combine relevant text for semantic analysis
            }));
            const geminiSearchResult = await GeminiAI.performSemanticSearch(query.keyword, docsForSemanticSearch);

            // Reorder/filter `matchingDocs` based on Gemini's relevance scores
            const semanticallyRankedDocs = geminiSearchResult.relevantDocuments.map(rankedDoc => {
                const originalDoc = matchingDocs.find(d => d.id === rankedDoc.id);
                return originalDoc ? { ...originalDoc, relevanceScore: rankedDoc.relevanceScore } : null;
            }).filter(Boolean);

            matchingDocs = semanticallyRankedDocs; // Use AI-ranked results as the primary set
            systemLog('info', `Gemini AI semantic search found ${matchingDocs.length} relevant documents.`);
        } else {
            // If no keyword, assign a default relevance score for sorting purposes
            matchingDocs = matchingDocs.map(doc => ({ ...doc, relevanceScore: 0.5 + Math.random() * 0.5 }));
        }

        const totalCount = matchingDocs.length;

        // --- 2. Apply Sorting ---
        const sortBy = query.sortBy || 'relevance';
        const sortOrder = query.sortOrder === 'asc' ? 1 : -1; // Default desc
        matchingDocs.sort((a, b) => {
            let valA, valB;
            switch (sortBy) {
                case 'relevance':
                    valA = a.relevanceScore || 0;
                    valB = b.relevanceScore || 0;
                    break;
                case 'uploaded_at':
                    valA = new Date(a.uploaded_at).getTime();
                    valB = new Date(b.uploaded_at).getTime();
                    break;
                case 'document_type':
                    valA = a.document_type;
                    valB = b.document_type;
                    break;
                // Add more sortable fields as needed
                default:
                    valA = a[sortBy] || '';
                    valB = b[sortBy] || '';
            }
            if (valA < valB) return -1 * sortOrder;
            if (valA > valB) return 1 * sortOrder;
            return 0;
        });

        // --- 3. Apply Pagination ---
        const limit = query.limit || 25;
        const offset = query.offset || 0;
        const paginatedDocs = matchingDocs.slice(offset, offset + limit);

        const searchSessionId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;
        systemLog('info', `Document search completed. Results: ${paginatedDocs.length}/${totalCount}.`, { searchSessionId, query, requestingUserId });
        await GeminiAI.logDocumentAction('N/A', 'SEARCH', `Document search performed. Keyword: '${query.keyword}', Results: ${paginatedDocs.length}/${totalCount}.`, { query, totalCount, searchId: searchSessionId, requestingUserId });

        return { documents: paginatedDocs, totalCount, searchId: searchSessionId };
    } catch (error) {
        systemLog('error', `Error during document search for user ${requestingUserId}. Error: ${error.message}`, { query, requestingUserId, errorStack: error.stack });
        await GeminiAI.logDocumentAction(
            'N/A',
            'SEARCH_FAILURE',
            `Document search failed: ${error.message}`,
            { query, requestingUserId, error: { name: error.name, message: error.message, code: error.code, details: error.details } }
        ).catch(logErr => systemLog('error', "Failed to log search failure to audit trail.", { logError: logErr }));
        throw error instanceof DocumentError ? error : new DocumentError(`An unexpected error occurred during document search: ${error.message}`, error);
    }
}

/**
 * Initiates a document review workflow, potentially leveraging Gemini AI for an initial assessment
 * to streamline the review process and flag critical areas.
 *
 * @param {string} documentId - The ID of the document to be reviewed.
 * @param {string} reviewerId - The ID of the user or system component initiating the review.
 * @param {string} [reviewType='standard_compliance'] - The type of review (e.g., 'legal', 'compliance', 'security', 'content_quality', 'financial').
 * @param {object} [workflowOptions={}] - Additional options for the workflow, e.g., priority, deadline.
 * @returns {Promise<{success: boolean, workflowId: string, initialAssessment: object, status: string}>}
 *   An object indicating success, the ID of the initiated workflow, Gemini's initial assessment, and the workflow status.
 * @throws {DocumentNotFoundError} If the document does not exist.
 * @throws {DocumentValidationError} If required parameters are missing or invalid.
 * @throws {DocumentAccessDeniedError} If the user lacks permission to initiate a review.
 * @throws {GeminiServiceError} If Gemini AI assessment fails.
 */
export async function initiateDocumentReview(documentId, reviewerId, reviewType = 'standard_compliance', workflowOptions = {}) {
    systemLog('info', `Initiating ${reviewType} review for document ${documentId} by ${reviewerId}.`);

    try {
        if (!documentId || !reviewerId) {
            throw new DocumentValidationError("Document ID and Reviewer ID are required to initiate a review workflow.", { documentId, reviewerId });
        }

        // --- 1. Fetch Document and Check Access ---
        // Fetch document with content for AI assessment, ensures document exists
        const document = await getDocumentById(documentId, false);
        const isAllowed = await checkDocumentAccess(documentId, reviewerId, 'initiate_review');
        if (!isAllowed) {
            throw new DocumentAccessDeniedError(`User ${reviewerId} is not authorized to initiate a review for document ${documentId}.`, documentId, reviewerId, 'initiate_review');
        }

        // --- 2. Gemini AI Initial Review Assessment ---
        systemLog('debug', `Requesting initial Gemini AI review assessment for document ${documentId}.`);
        const assessment = await GeminiAI.performReviewAssessment(document.full_content || document.content_preview, reviewType);
        systemLog('info', `Gemini AI completed initial review assessment for ${documentId}. Overall recommendation: ${assessment.overallRecommendation}.`);

        // --- 3. Simulate Workflow System Integration ---
        // In a real system, this would interact with a workflow orchestration engine (e.g., Camunda, Salesforce Flow).
        const workflowId = `review-workflow-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const workflowStatus = "PENDING_REVIEW_ASSIGNMENT";
        systemLog('info', `Review workflow ${workflowId} started for document ${documentId} with status: ${workflowStatus}.`);

        await GeminiAI.logDocumentAction(documentId, 'REVIEW_INITIATED', `Review workflow ${workflowId} initiated by ${reviewerId}.`, { reviewerId, reviewType, assessment, workflowOptions, workflowStatus });

        return { success: true, workflowId, initialAssessment: assessment, status: workflowStatus };

    } catch (error) {
        systemLog('error', `Failed to initiate review for document ${documentId} by ${reviewerId}. Error: ${error.message}`, { documentId, reviewerId, reviewType, errorStack: error.stack });
        await GeminiAI.logDocumentAction(
            documentId,
            'REVIEW_INITIATION_FAILURE',
            `Review initiation failed: ${error.message}`,
            { reviewerId, reviewType, error: { name: error.name, message: error.message, code: error.code, details: error.details } }
        ).catch(logErr => systemLog('error', "Failed to log review initiation failure to audit trail.", { logError: logErr, documentId }));
        throw error instanceof DocumentError ? error : new DocumentError(`An unexpected error occurred during document review initiation: ${error.message}`, error);
    }
}

/**
 * Provides robust access control checks for documents. This function integrates with Gemini AI to
 * evaluate complex, context-aware authorization policies, ensuring only authorized users can perform
 * specific actions on documents.
 *
 * @param {string} documentId - The ID of the document to check access for.
 * @param {string} userId - The ID of the user attempting to access/modify the document.
 * @param {string} action - The action being attempted (e.g., 'read', 'write', 'delete', 'download', 'share', 'initiate_review').
 * @returns {Promise<boolean>} True if access is granted, false otherwise.
 * @throws {DocumentValidationError} If required parameters are missing.
 * @throws {DocumentNotFoundError} If the document does not exist (handled by denying access).
 * @throws {GeminiServiceError} If Gemini AI policy evaluation fails.
 */
export async function checkDocumentAccess(documentId, userId, action) {
    systemLog('debug', `Checking access for user ${userId} on document ${documentId} for action: ${action}.`);

    try {
        if (!documentId || !userId || !action) {
            throw new DocumentValidationError("Document ID, User ID, and Action are required for access check.");
        }

        // Simulate fetching document metadata and user roles/permissions
        // getDocumentById is used here primarily to verify document existence and get metadata.
        // It's wrapped in a catch block to handle DocumentNotFoundError and treat it as access denied.
        let documentMetadata;
        try {
            documentMetadata = await getDocumentById(documentId, false, userId); // Fetch without AI enrichment for perf
        } catch (error) {
            if (error instanceof DocumentNotFoundError) {
                systemLog('warn', `Access denied: Document ${documentId} not found for access check by user ${userId} for action ${action}.`);
                await GeminiAI.logDocumentAction(documentId, 'ACCESS_DENIED', `Document not found. Access denied for user ${userId} to ${action}.`, { userId, action, reason: 'DOCUMENT_NOT_FOUND' });
                return false; // Deny access if document not found
            }
            throw error; // Re-throw other errors
        }

        // Simulate fetching user's roles and contextual attributes
        // In a real system, this would come from an authentication/authorization service
        const simulatedUserRoles = (userId === 'admin_user') ? 'admin' : (userId.startsWith('editor_') ? 'editor' : (userId.startsWith('viewer_') ? 'viewer' : 'guest'));
        const documentSensitivity = documentMetadata.metadata?.confidential ? "high" : (documentMetadata.ai_insights?.tags?.includes("financial") ? "medium" : "low");

        // --- 1. Gemini AI Policy Evaluation ---
        systemLog('debug', `Requesting Gemini AI to evaluate access policy for user ${userId} (Roles: ${simulatedUserRoles}) on document ${documentId} (Sensitivity: ${documentSensitivity}, Type: ${documentMetadata.document_type}) for action: ${action}.`);
        const accessDecision = await GeminiAI.evaluateAccessPolicy({
            documentId,
            userId,
            action,
            userRoles: simulatedUserRoles,
            documentSensitivity,
            documentType: documentMetadata.document_type,
            documentableId: documentMetadata.documentable_id,
            documentableType: documentMetadata.documentable_type
        });

        if (!accessDecision.isAllowed) {
            systemLog('warn', `Access denied for user ${userId} on document ${documentId} for action ${action}. Reason: ${accessDecision.reason}.`);
            await GeminiAI.logDocumentAction(documentId, 'ACCESS_DENIED', `Access denied for user ${userId} to ${action}.`, { userId, action, reason: accessDecision.reason });
            return false;
        } else {
            systemLog('info', `Access granted for user ${userId} on document ${documentId} for action ${action}.`);
            await GeminiAI.logDocumentAction(documentId, 'ACCESS_GRANTED', `Access granted for user ${userId} to ${action}.`, { userId, action });
            return true;
        }
    } catch (error) {
        systemLog('error', `Error during document access check for ${documentId}, user ${userId}, action ${action}. Error: ${error.message}`, { documentId, userId, action, errorStack: error.stack });
        await GeminiAI.logDocumentAction(
            documentId,
            'ACCESS_CHECK_FAILURE',
            `Access check failed: ${error.message}`,
            { userId, action, error: { name: error.name, message: error.message, code: error.code, details: error.details } }
        ).catch(logErr => systemLog('error', "Failed to log access check failure to audit trail.", { logError: logErr, documentId }));
        // Default to deny access if an unexpected error occurs during the check, for security reasons.
        return false;
    }
}
