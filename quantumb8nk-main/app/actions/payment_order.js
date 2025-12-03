// Copyright (c) 2023 Your Organization. All rights reserved.
// This file is part of the core payment processing module.
// It handles the creation, validation, risk assessment, and processing
// of payment orders, leveraging advanced AI capabilities for enhanced
// security, compliance, and operational efficiency.

/**
 * @typedef {Object} MoneyAmount
 * @property {number} value - The numeric value of the amount.
 * @property {string} currency - The ISO 4217 currency code (e.g., "USD", "EUR").
 */

/**
 * @typedef {Object} PaymentLineItem
 * @property {string} id - Unique identifier for the line item.
 * @property {string} name - Name of the item.
 * @property {string} description - Detailed description.
 * @property {number} quantity - Number of units.
 * @property {MoneyAmount} unitPrice - Price per unit.
 * @property {MoneyAmount} amount - Total amount for this line item (quantity * unitPrice).
 * @property {string[]} tags - Categorization tags for the item.
 * @property {Object} customAttributes - Any additional key-value pairs for the item.
 */

/**
 * @typedef {Object} PaymentOrderMetadataEntry
 * @property {string} key - The metadata key.
 * @property {string} value - The metadata value.
 * @property {string} [type='string'] - The expected type of the value (e.g., 'string', 'number', 'boolean').
 */

/**
 * @typedef {Object} CustomerDetails
 * @property {string} id - Unique customer identifier.
 * @property {string} firstName - Customer's first name.
 * @property {string} lastName - Customer's last name.
 * @property {string} email - Customer's email address.
 * @property {string} [phone] - Customer's phone number.
 * @property {string} [countryCode] - ISO 3166-1 alpha-2 country code.
 * @property {Object} [billingAddress] - Billing address details.
 * @property {Object} [shippingAddress] - Shipping address details.
 */

/**
 * @typedef {Object} PaymentMethodDetails
 * @property {string} type - Type of payment method (e.g., 'credit_card', 'bank_transfer', 'wallet').
 * @property {string} [cardType] - For credit cards (e.g., 'VISA', 'MASTERCARD').
 * @property {string} [lastFour] - Last four digits of card number.
 * @property {string} [expiryMonth] - Card expiry month.
 * @property {string} [expiryYear] - Card expiry year.
 * @property {string} [bankName] - For bank transfers.
 * @property {string} [accountMask] - Masked account number.
 * @property {string} [walletProvider] - For digital wallets (e.g., 'PayPal', 'ApplePay').
 * @property {string} token - Tokenized payment instrument identifier.
 */

/**
 * @typedef {Object} FraudAssessment
 * @property {number} score - A fraud risk score, typically 0-100.
 * @property {string} recommendation - AI recommendation (e.g., 'APPROVE', 'REVIEW', 'DECLINE').
 * @property {string[]} flags - Specific flags raised by the AI (e.g., 'IP_MISMATCH', 'HIGH_VALUE_THRESHOLD').
 * @property {Object} details - Raw details from the AI model.
 */

/**
 * @typedef {Object} ComplianceAssessment
 * @property {boolean} isCompliant - True if the order passes compliance checks.
 * @property {string[]} violations - List of compliance violations, if any.
 * @property {string[]} warnings - List of compliance warnings.
 * @property {Object} details - Raw details from the AI model.
 */

/**
 * @typedef {Object} AiProcessingRouteOptimization
 * @property {string} recommendedGateway - The ID of the best payment gateway.
 * @property {number} estimatedCost - Estimated processing cost for this route.
 * @property {number} estimatedLatencyMs - Estimated processing latency in milliseconds.
 * @property {string[]} reasons - Reasons for the recommendation.
 */

/**
 * @typedef {Object} AiEnrichmentResult
 * @property {Object} enrichedMetadata - Additional or corrected metadata.
 * @property {string[]} inferredCategories - Categories inferred by AI.
 * @property {string[]} insights - Key insights from AI analysis.
 */

/**
 * @typedef {Object} AiIntentAnalysisResult
 * @property {string} primaryIntent - The primary purpose of the transaction (e.g., 'Purchase', 'Subscription').
 * @property {string} [secondaryIntent] - A secondary purpose if applicable.
 * @property {string} sentiment - The overall sentiment (e.g., 'Positive', 'Neutral', 'Negative').
 * @property {number} confidence - Confidence score of the AI's analysis (0-1).
 * @property {string[]} keywords - Relevant keywords extracted from the order.
 */

/**
 * @typedef {Object} AiAnalysisOutcome
 * @property {FraudAssessment} [fraud] - Fraud assessment results.
 * @property {ComplianceAssessment} [compliance] - Compliance assessment results.
 * @property {AiProcessingRouteOptimization} [routing] - Payment routing optimization.
 * @property {AiEnrichmentResult} [enrichment] - Data enrichment results.
 * @property {AiIntentAnalysisResult} [intent] - AI analysis of payment intent and categorization.
 * @property {string} analysisTimestamp - Timestamp of the AI analysis.
 */

/**
 * @typedef {Object} PaymentOrder
 * @property {string} id - Unique identifier for the payment order.
 * @property {string} externalId - ID from the originating system.
 * @property {string} status - Current status of the payment order (e.g., 'PENDING', 'VALIDATED', 'FRAUD_REVIEW', 'APPROVED', 'DECLINED', 'COMPLETED').
 * @property {string} currency - The primary currency of the order.
 * @property {MoneyAmount} totalAmount - The total calculated amount of the order.
 * @property {CustomerDetails} customer - Details about the customer.
 * @property {PaymentMethodDetails} paymentMethod - Details about the payment method.
 * @property {PaymentLineItem[]} lineItems - Array of items included in the order.
 * @property {Object.<string, string|number|boolean>} metadata - Key-value pair metadata.
 * @property {string} creationDate - ISO 8601 formatted date of creation.
 * @property {string} lastUpdatedDate - ISO 8601 formatted date of last update.
 * @property {string} requestedCompletionDate - ISO 8601 formatted date when the payment is expected to complete.
 * @property {string} checksum - A cryptographic hash of the order's core data for integrity checks.
 * @property {AiAnalysisOutcome} [aiAnalysis] - Results from AI-driven analysis.
 * @property {string[]} processingHistory - Log of significant events during processing.
 * @property {Object} [context] - Transient context data for processing.
 */

// --- Internal Utilities & Constants ---

/**
 * Represents a custom error for payment order processing.
 * @class
 * @extends Error
 */
class PaymentOrderError extends Error {
    /**
     * @param {string} message - The error message.
     * @param {string} code - An application-specific error code.
     * @param {Object} [details={}] - Additional error details.
     */
    constructor(message, code = 'GENERIC_ERROR', details = {}) {
        super(message);
        this.name = 'PaymentOrderError';
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, PaymentOrderError);
    }
}

/**
 * A mock logging service. In a real application, this would integrate with a robust logging framework.
 */
const logger = {
    info: (message, context = {}) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context),
    warn: (message, context = {}) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context),
    error: (message, error, context = {}) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error, context),
    debug: (message, context = {}) => process.env.NODE_ENV !== 'production' && console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, context),
};

/**
 * Generates a UUID (v4) for unique identifiers.
 * @returns {string} A UUID string.
 */
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Calculates a simple checksum for data integrity. In a real system, this would be a cryptographic hash.
 * This is a mocked implementation for demonstration purposes.
 * @param {Object} data - The data object to hash.
 * @returns {string} A simple SHA-256 like hash string (mocked for this example).
 */
function calculateSimpleChecksum(data) {
    const dataString = JSON.stringify(data);
    let hash = 0;
    if (dataString.length === 0) return '0';
    for (let i = 0; i < dataString.length; i++) {
        const char = dataString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16); // Hex representation of the absolute hash
}

/**
 * Internal function to sanitize and parse an amount.
 * Ensures the amount is a valid non-negative number.
 * @param {any} amount - The input amount.
 * @returns {number} The sanitized amount, or 0 if invalid.
 */
function internalSanitizeAmount(amount) {
    const parsedAmount = parseFloat(amount);
    return isNaN(parsedAmount) || parsedAmount < 0 ? 0 : parsedAmount;
}

/**
 * Validates if a string is a valid ISO 4217 currency code.
 * (Simplified for demo purposes)
 * @param {string} currencyCode - The currency code to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidCurrencyCode(currencyCode) {
    // In a real system, this would use a comprehensive list or a dedicated library.
    const commonCurrencies = new Set(["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "SEK", "NZD", "KRW", "SGD", "NOK", "MXN", "INR", "BRL", "ZAR", "RUB"]);
    return typeof currencyCode === 'string' && currencyCode.length === 3 && commonCurrencies.has(currencyCode.toUpperCase());
}

// --- Original Exported Functions (Enhanced) ---

/**
 * Sanitizes an array of metadata entries into a flat key-value object.
 * Existing entries are merged, with later entries overwriting earlier ones for the same key.
 * Attempts to cast values based on a 'type' hint.
 * @param {PaymentOrderMetadataEntry[]} metadata - An array of metadata entries.
 * @returns {Object.<string, string|number|boolean>} A sanitized key-value object of metadata.
 * @example
 * sanitizeMetadata([{key: 'source', value: 'web', type: 'string'}, {key: 'priority', value: '1', type: 'number'}]);
 * // Returns: { source: 'web', priority: 1 }
 */
export function sanitizeMetadata(metadata) {
    if (!Array.isArray(metadata)) {
        logger.warn('sanitizeMetadata received non-array input. Returning empty object.', { inputType: typeof metadata });
        return {};
    }

    return metadata.reduce(
        (acc, curr) => {
            if (typeof curr === 'object' && curr !== null && typeof curr.key === 'string' && curr.key.trim() !== '') {
                // Attempt to cast value based on 'type' hint, or keep as string
                let value = curr.value;
                if (typeof curr.type === 'string') {
                    switch (curr.type.toLowerCase()) {
                        case 'number':
                            value = parseFloat(curr.value);
                            if (isNaN(value)) {
                                logger.warn(`Metadata value for key '${curr.key}' could not be cast to number. Keeping original value.`, { originalValue: curr.value });
                                value = curr.value; // Revert if casting fails
                            }
                            break;
                        case 'boolean':
                            value = String(curr.value).toLowerCase() === 'true';
                            break;
                        case 'json':
                            try {
                                value = JSON.parse(curr.value);
                            } catch (e) {
                                logger.warn(`Metadata value for key '${curr.key}' could not be parsed as JSON. Keeping original value.`, { originalValue: curr.value, error: e.message });
                                value = curr.value;
                            }
                            break;
                        // default: keep as is (string or other)
                    }
                }
                acc[curr.key.trim()] = value;
            } else {
                logger.warn('Skipping malformed metadata entry.', { entry: curr });
            }
            return acc;
        }, {},
    );
}

/**
 * Sanitizes an array of line items, ensuring amounts and quantities are valid non-negative numbers.
 * Also adds default IDs if missing, validates currency, and calculates total amount per line item.
 * @param {PaymentLineItem[]} lineItems - An array of line items.
 * @param {string} defaultCurrency - The default currency to assign if unitPrice.currency is missing.
 * @returns {PaymentLineItem[]} An array of sanitized line items.
 */
export function sanitizeLineItems(lineItems, defaultCurrency = "USD") {
    if (!Array.isArray(lineItems)) {
        logger.warn('sanitizeLineItems received non-array input. Returning empty array.', { inputType: typeof lineItems });
        return [];
    }

    const sanitizedDefaultCurrency = isValidCurrencyCode(defaultCurrency) ? defaultCurrency.toUpperCase() : "USD";

    return lineItems.map(
        (curr, index) => {
            const sanitizedUnitPriceValue = internalSanitizeAmount(curr.unitPrice?.value);
            const sanitizedQuantity = internalSanitizeAmount(curr.quantity);
            const itemCurrency = curr.unitPrice?.currency || curr.amount?.currency || sanitizedDefaultCurrency;
            const finalItemCurrency = isValidCurrencyCode(itemCurrency) ? itemCurrency.toUpperCase() : sanitizedDefaultCurrency;

            // Ensure amount is calculated from unitPrice and quantity, or fallback to direct amount
            const calculatedAmountValue = sanitizedUnitPriceValue * sanitizedQuantity;
            const finalAmountValue = internalSanitizeAmount(curr.amount?.value || calculatedAmountValue);

            return {
                id: curr.id || generateUuid(), // Assign UUID if no ID is present
                name: typeof curr.name === 'string' && curr.name.trim() !== '' ? curr.name.trim() : `Untitled Item ${index + 1}`,
                description: typeof curr.description === 'string' ? curr.description.trim() : '',
                quantity: sanitizedQuantity,
                unitPrice: {
                    value: sanitizedUnitPriceValue,
                    currency: finalItemCurrency,
                },
                amount: {
                    value: finalAmountValue,
                    currency: finalItemCurrency,
                },
                tags: Array.isArray(curr.tags) ? curr.tags.filter(t => typeof t === 'string' && t.trim() !== '') : [],
                customAttributes: typeof curr.customAttributes === 'object' && curr.customAttributes !== null && !Array.isArray(curr.customAttributes) ? curr.customAttributes : {},
            };
        },
    );
}

/**
 * Sanitizes and formats a date string into ISO 8601 (YYYY-MM-DD).
 * Supports "MM/DD/YYYY" format, Date objects, and other common date string formats.
 * @param {string | Date | null | undefined} date - The date input.
 * @returns {string | undefined} Formatted date string (YYYY-MM-DD) or undefined if input is invalid.
 */
export function sanitizeDate(date) {
    if (date === null || date === undefined || (typeof date === 'string' && date.trim() === '')) {
        return undefined;
    }

    if (date instanceof Date) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    if (typeof date === 'string') {
        // Attempt to parse "MM/DD/YYYY"
        const parts = date.split("/");
        if (parts.length === 3) {
            const [month, day, year] = parts;
            // Basic validation for numbers and month/day range
            if (!isNaN(parseInt(month)) && parseInt(month) >= 1 && parseInt(month) <= 12 &&
                !isNaN(parseInt(day)) && parseInt(day) >= 1 && parseInt(day) <= 31 &&
                !isNaN(parseInt(year)) && parseInt(year) >= 1000 && parseInt(year) <= 9999) { // Reasonable year range
                const d = new Date(`${year}-${month}-${day}T00:00:00Z`); // Use Z for UTC to avoid timezone issues
                // Check if the date object is valid and matches parsed components (month is 0-indexed)
                if (!isNaN(d.getTime()) && d.getUTCMonth() + 1 == parseInt(month) && d.getUTCDate() == parseInt(day) && d.getUTCFullYear() == parseInt(year)) {
                     return d.toISOString().split('T')[0];
                }
            }
        }

        // Attempt to parse other common formats or direct ISO
        try {
            const d = new Date(date);
            if (!isNaN(d.getTime())) { // Check if date is valid
                return d.toISOString().split('T')[0];
            }
        } catch (e) {
            logger.debug('sanitizeDate: Failed to parse string as Date object via direct constructor.', { dateString: date, error: e.message });
        }
    }

    logger.warn('sanitizeDate received unparseable or invalid date input. Returning undefined.', { input: date, inputType: typeof date });
    return undefined;
}

// --- New Core Functions & AI Integration ---

/**
 * @namespace GeminiAIService
 * @description A mock service for integrating with a hypothetical Gemini AI platform.
 *             This service simulates advanced AI capabilities for payment order processing.
 *             In a production environment, this would involve actual API calls to Google's Gemini API
 *             or a similar robust AI inference service.
 */
export const GeminiAIService = {
    /**
     * Configuration for the Gemini AI service.
     * In a real application, this would be loaded from environment variables or a configuration manager.
     */
    config: {
        apiUrl: "https://api.gemini-ai.dev/v1/payment-insights",
        apiKey: "sk-mock-gemini-ai-key-12345", // Placeholder API Key
        models: {
            fraudDetection: "gemini-fraud-v3",
            compliance: "gemini-compliance-v2",
            routing: "gemini-router-v1",
            enrichment: "gemini-data-enricher-v1",
            intent: "gemini-intent-analyzer-v1",
            anomalyDetection: "gemini-anomaly-v1", // New model for general anomalies
        },
        thresholds: {
            fraudReview: 60, // Score above this triggers manual review
            fraudDecline: 85, // Score above this triggers automatic decline
            anomalyAlert: 0.75, // Anomaly probability above this triggers an alert
        },
        retryAttempts: 3,
        retryDelayMs: 500,
        timeoutMs: 5000, // Timeout for AI API calls
    },

    /**
     * Simulates an asynchronous call to the Gemini AI API.
     * Includes mock responses, retry logic with exponential backoff, and a timeout.
     * @param {string} endpoint - The specific API endpoint (e.g., 'fraud-assessment').
     * @param {string} modelId - The AI model to use.
     * @param {Object} payload - The data payload to send to the AI.
     * @returns {Promise<Object>} The AI response.
     * @throws {PaymentOrderError} If the AI call fails after retries or times out.
     */
    async _callGeminiApi(endpoint, modelId, payload) {
        let attempts = 0;
        while (attempts < this.config.retryAttempts) {
            attempts++;
            try {
                logger.debug(`Calling Gemini AI endpoint: ${endpoint} with model: ${modelId} (Attempt: ${attempts})`, { endpoint, modelId, payloadSnippet: JSON.stringify(payload).substring(0, 100) });

                const fetchPromise = new Promise(async (resolve, reject) => {
                    // Simulate network delay and AI processing
                    await new Promise(res => setTimeout(res, Math.random() * 200 + this.config.retryDelayMs));

                    // Simulate AI response based on payload content (for demo purposes)
                    let mockResponse;
                    if (endpoint.includes('fraud')) {
                        const totalAmount = payload.totalAmount?.value || 0;
                        const customerId = payload.customer?.id || '';
                        const lineItemNames = payload.lineItems?.map(li => li.name.toLowerCase()).join(' ') || '';

                        let score = Math.floor(Math.random() * 40); // Base low risk
                        let recommendation = 'APPROVE';
                        const flags = [];

                        if (totalAmount > 7500) { score += 25; flags.push('HIGH_VALUE_TRANSACTION'); }
                        if (customerId.startsWith('TEST') || lineItemNames.includes('gift card') || lineItemNames.includes('crypto')) {
                            score += 20; flags.push('SUSPICIOUS_CUSTOMER_OR_ITEM');
                        }
                        if (payload.customer?.countryCode === 'NG' && totalAmount > 1000) { // Example high-risk country
                            score += 35; flags.push('HIGH_RISK_GEO_AND_AMOUNT');
                        }
                        if (Math.random() < 0.08) { // 8% chance of high risk velocity/pattern
                            score += 45; flags.push('VELOCITY_PATTERN_ANOMALY');
                        }

                        score = Math.min(score, 100); // Cap score at 100

                        if (score >= this.config.thresholds.fraudDecline) {
                            recommendation = 'DECLINE';
                        } else if (score >= this.config.thresholds.fraudReview) {
                            recommendation = 'REVIEW';
                        }

                        mockResponse = {
                            score: score,
                            recommendation: recommendation,
                            flags: flags,
                            details: {
                                model: modelId,
                                processedFeatures: Object.keys(payload).length,
                                analysisTimestamp: new Date().toISOString(),
                            },
                        };
                    } else if (endpoint.includes('compliance')) {
                        const customerCountry = payload.customer?.countryCode || 'US';
                        const totalAmount = payload.totalAmount?.value || 0;
                        const isHighRiskCountry = ['IR', 'KP', 'CU', 'SY', 'RU'].includes(customerCountry.toUpperCase());
                        const isLargeTransaction = totalAmount > 15000 && payload.currency === 'USD'; // AML threshold example
                        const involvesCrypto = payload.lineItems?.some(li => li.name.toLowerCase().includes('crypto'));

                        let isCompliant = true;
                        const violations = [];
                        const warnings = [];

                        if (isHighRiskCountry) {
                            isCompliant = false;
                            violations.push('SANCTIONED_COUNTRY_RISK');
                        }
                        if (isLargeTransaction) {
                            warnings.push('LARGE_TRANSACTION_AML_ALERT');
                        }
                        if (involvesCrypto) {
                             warnings.push('CRYPTO_RELATED_TRANSACTION_MONITORING');
                        }
                        if (payload.paymentMethod?.type === 'bank_transfer' && (!payload.paymentMethod.bankName || !payload.paymentMethod.accountMask)) {
                            warnings.push('MISSING_BANK_DETAILS_FOR_TRANSFER');
                        }
                        if (!payload.customer?.billingAddress?.country) {
                             warnings.push('MISSING_BILLING_ADDRESS_COUNTRY');
                        }

                        mockResponse = {
                            isCompliant: isCompliant,
                            violations: violations,
                            warnings: warnings,
                            details: { model: modelId, country: customerCountry, analysisTimestamp: new Date().toISOString() },
                        };
                    } else if (endpoint.includes('routing')) {
                        const totalAmount = payload.totalAmount?.value || 0;
                        const currency = payload.currency || 'USD';
                        const paymentMethodType = payload.paymentMethodType || 'credit_card';
                        const customerCountry = payload.customerCountry || 'US';

                        const gatewayOptions = ['GatewayA_low_fee', 'GatewayB_fast', 'GatewayC_international', 'GatewayD_special_card'];
                        let recommendedGateway = gatewayOptions[Math.floor(Math.random() * gatewayOptions.length)];
                        let estimatedCost = totalAmount * (Math.random() * 0.005 + 0.001); // 0.1% to 0.6%
                        let estimatedLatencyMs = Math.floor(Math.random() * 300 + 50);
                        const reasons = [];

                        if (currency === 'EUR' && paymentMethodType === 'bank_transfer') {
                            recommendedGateway = 'GatewayC_international'; // Better for SEPA
                            estimatedCost *= 0.8;
                            reasons.push('Optimized for EUR bank transfers.');
                        } else if (paymentMethodType === 'credit_card' && totalAmount > 2000) {
                            recommendedGateway = 'GatewayD_special_card'; // Better rates for high-value cards
                            estimatedCost *= 0.9;
                            reasons.push('Better rates for high-value credit card transactions.');
                        }

                        mockResponse = {
                            recommendedGateway: recommendedGateway,
                            estimatedCost: estimatedCost,
                            estimatedLatencyMs: estimatedLatencyMs,
                            reasons: [`Optimized for ${currency} and ${totalAmount}`, `Selected based on payment method ${paymentMethodType} and country ${customerCountry}.`, ...reasons],
                            details: { model: modelId, analysisTimestamp: new Date().toISOString() },
                        };
                    } else if (endpoint.includes('enrichment')) {
                        const originalMetadata = payload.metadata || {};
                        const inferredCategories = ['e-commerce', 'digital-goods'];
                        if (payload.lineItems && payload.lineItems.some(item => item.name.toLowerCase().includes('subscription'))) {
                            inferredCategories.push('subscription-service');
                        }
                        if (payload.customer?.email?.endsWith('.edu') || payload.customer?.email?.endsWith('.gov')) {
                            inferredCategories.push('educational-gov-sector');
                        }
                        mockResponse = {
                            enrichedMetadata: { ...originalMetadata, ai_enriched_timestamp: new Date().toISOString(), ai_inferred_categories_raw: inferredCategories.join(',') },
                            inferredCategories: inferredCategories,
                            insights: ["Payment likely for digital services.", "Potential for recurring revenue if subscription based.", "Customer segment identified."],
                            details: { model: modelId, analysisTimestamp: new Date().toISOString() },
                        };
                    } else if (endpoint.includes('intent')) {
                        const totalAmount = payload.totalAmount?.value || 0;
                        const lineItems = payload.lineItems || [];
                        const customerEmail = payload.customer?.email || '';

                        let primaryIntent = 'Purchase';
                        let secondaryIntent = 'Standard Transaction';
                        let sentiment = 'Neutral';

                        if (customerEmail.includes('business')) { primaryIntent = 'B2B Transaction'; }
                        if (lineItems.length > 5 || totalAmount > 1000) { primaryIntent = 'Bulk Order'; sentiment = 'Positive'; }
                        if (lineItems.some(item => item.name.toLowerCase().includes('renewal'))) { primaryIntent = 'Subscription Renewal'; secondaryIntent = 'Recurring Revenue'; sentiment = 'Positive'; }

                        mockResponse = {
                            primaryIntent: primaryIntent,
                            secondaryIntent: secondaryIntent,
                            sentiment: sentiment,
                            confidence: 0.9 + Math.random() * 0.1, // High confidence mock
                            keywords: [...new Set(lineItems.map(li => li.name.split(' ')).flat().filter(word => word.length > 2))],
                            details: { model: modelId, analysisTimestamp: new Date().toISOString() },
                        };
                    } else if (endpoint.includes('anomaly')) {
                        const anomalyProbability = Math.random() * 0.4; // Usually low, 0-40%
                        const isAnomalous = anomalyProbability > this.config.thresholds.anomalyAlert;
                        const anomalyFlags = [];
                        if (isAnomalous) anomalyFlags.push('UNUSUAL_BEHAVIOR_PATTERN');
                        if (payload.totalAmount?.value > 5000 && Math.random() > 0.8) anomalyFlags.push('LARGE_AMOUNT_DEVIATION');

                        mockResponse = {
                            isAnomalous: isAnomalous,
                            probability: anomalyProbability,
                            flags: anomalyFlags,
                            details: { model: modelId, analysisTimestamp: new Date().toISOString() },
                        };
                    } else {
                        mockResponse = { status: 'success', message: 'Generic AI response', input: payload, details: { analysisTimestamp: new Date().toISOString() } };
                    }
                    resolve(mockResponse);
                });

                // Add a timeout wrapper
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new PaymentOrderError('Gemini AI call timed out.', 'GEMINI_AI_TIMEOUT')), this.config.timeoutMs)
                );

                return await Promise.race([fetchPromise, timeoutPromise]);

            } catch (error) {
                logger.warn(`Gemini AI call failed for ${endpoint} (Attempt: ${attempts}).`, { error: error.message, orderId: payload.orderId });
                if (attempts < this.config.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelayMs * Math.pow(2, attempts))); // Exponential backoff
                } else {
                    throw new PaymentOrderError(
                        `Failed to call Gemini AI service for ${endpoint} after ${this.config.retryAttempts} attempts.`,
                        'GEMINI_AI_SERVICE_UNAVAILABLE', { endpoint, originalError: error.message, orderId: payload.orderId }
                    );
                }
            }
        }
        // This line should technically be unreachable due to the throw in the loop
        throw new PaymentOrderError('Unexpected state in Gemini AI _callGeminiApi.', 'INTERNAL_AI_ERROR');
    },

    /**
     * Performs an AI-driven fraud assessment on the payment order.
     * @param {PaymentOrder} order - The payment order object.
     * @returns {Promise<FraudAssessment>} The fraud assessment result.
     */
    async assessFraud(order) {
        const payload = {
            orderId: order.id,
            externalId: order.externalId,
            totalAmount: order.totalAmount,
            currency: order.currency,
            customer: {
                id: order.customer?.id,
                email: order.customer?.email,
                phone: order.customer?.phone,
                countryCode: order.customer?.countryCode,
                billingAddress: order.customer?.billingAddress,
                shippingAddress: order.customer?.shippingAddress,
            },
            paymentMethod: {
                type: order.paymentMethod?.type,
                cardType: order.paymentMethod?.cardType,
                lastFour: order.paymentMethod?.lastFour,
                expiryMonth: order.paymentMethod?.expiryMonth,
                expiryYear: order.paymentMethod?.expiryYear,
                bankName: order.paymentMethod?.bankName,
                walletProvider: order.paymentMethod?.walletProvider,
            },
            lineItems: order.lineItems.map(item => ({
                id: item.id,
                name: item.name,
                description: item.description,
                amount: item.amount,
                quantity: item.quantity,
                tags: item.tags,
            })),
            metadata: order.metadata,
            creationDate: order.creationDate,
        };
        const result = await this._callGeminiApi('fraud-assessment', this.config.models.fraudDetection, payload);
        return result;
    },

    /**
     * Performs an AI-driven compliance check on the payment order.
     * @param {PaymentOrder} order - The payment order object.
     * @returns {Promise<ComplianceAssessment>} The compliance assessment result.
     */
    async checkCompliance(order) {
        const payload = {
            orderId: order.id,
            customer: {
                id: order.customer?.id,
                countryCode: order.customer?.countryCode,
                billingAddress: order.customer?.billingAddress,
                shippingAddress: order.customer?.shippingAddress,
            },
            paymentMethod: {
                type: order.paymentMethod?.type,
                bankName: order.paymentMethod?.bankName,
                accountMask: order.paymentMethod?.accountMask,
                cardType: order.paymentMethod?.cardType,
            },
            totalAmount: order.totalAmount,
            currency: order.currency,
            lineItems: order.lineItems.map(item => ({ name: item.name, amount: item.amount, tags: item.tags })),
            metadata: order.metadata,
        };
        const result = await this._callGeminiApi('compliance-check', this.config.models.compliance, payload);
        return result;
    },

    /**
     * Recommends the optimal payment processing route using AI, considering costs, speed, and reliability.
     * @param {PaymentOrder} order - The payment order object.
     * @returns {Promise<AiProcessingRouteOptimization>} The routing optimization result.
     */
    async optimizeProcessingRoute(order) {
        const payload = {
            orderId: order.id,
            totalAmount: order.totalAmount,
            currency: order.currency,
            customerCountry: order.customer?.countryCode,
            paymentMethodType: order.paymentMethod?.type,
            cardType: order.paymentMethod?.cardType,
            lineItemTags: Array.from(new Set(order.lineItems.flatMap(item => item.tags))),
            creationDate: order.creationDate,
        };
        const result = await this._callGeminiApi('route-optimization', this.config.models.routing, payload);
        return result;
    },

    /**
     * Enriches payment order metadata using AI, inferring categories, and providing key insights.
     * @param {PaymentOrder} order - The payment order object.
     * @returns {Promise<AiEnrichmentResult>} The enrichment result.
     */
    async enrichPaymentOrderData(order) {
        const payload = {
            orderId: order.id,
            metadata: order.metadata,
            lineItems: order.lineItems.map(item => ({ name: item.name, description: item.description, tags: item.tags, customAttributes: item.customAttributes })),
            customer: { email: order.customer?.email, firstName: order.customer?.firstName, lastName: order.customer?.lastName, id: order.customer?.id },
            totalAmount: order.totalAmount,
            currency: order.currency,
        };
        const result = await this._callGeminiApi('data-enrichment', this.config.models.enrichment, payload);
        return result;
    },

    /**
     * Analyzes the primary intent, secondary intent, and sentiment of a payment order using AI.
     * @param {PaymentOrder} order - The payment order object.
     * @returns {Promise<AiIntentAnalysisResult>} The intent analysis result.
     */
    async analyzePaymentIntent(order) {
        const payload = {
            orderId: order.id,
            totalAmount: order.totalAmount,
            currency: order.currency,
            lineItems: order.lineItems.map(item => ({ name: item.name, description: item.description, tags: item.tags })),
            customer: { id: order.customer?.id, email: order.customer?.email },
            metadata: order.metadata,
        };
        const result = await this._callGeminiApi('intent-analysis', this.config.models.intent, payload);
        return result;
    },

    /**
     * Detects anomalies in a payment order compared to historical patterns using AI.
     * @param {PaymentOrder} order - The payment order object.
     * @returns {Promise<{ isAnomalous: boolean, probability: number, flags: string[], details: Object }>} Anomaly detection result.
     */
    async detectAnomaly(order) {
        const payload = {
            orderId: order.id,
            totalAmount: order.totalAmount,
            currency: order.currency,
            customer: { id: order.customer?.id, email: order.customer?.email, countryCode: order.customer?.countryCode },
            paymentMethod: { type: order.paymentMethod?.type, cardType: order.paymentMethod?.cardType },
            lineItemCount: order.lineItems.length,
            metadataKeys: Object.keys(order.metadata || {}),
            transactionHour: new Date().getUTCHours(), // Feature for time-based anomaly
        };
        const result = await this._callGeminiApi('anomaly-detection', this.config.models.anomalyDetection, payload);
        return result;
    }
};

/**
 * @namespace PaymentOrderProcessor
 * @description Manages the end-to-end lifecycle of a payment order, from creation to advanced processing.
 *              It orchestrates sanitization, validation, AI analysis, and status management.
 *              This class represents a robust, commercial-grade payment processing pipeline.
 */
export const PaymentOrderProcessor = {
    /**
     * Initializes a new payment order from raw input data.
     * Performs basic sanitization and sets initial statuses.
     * Generates a unique ID and initial checksum.
     * @param {Object} rawOrderData - Raw input data for the payment order.
     * @returns {PaymentOrder} A newly created and partially sanitized payment order object.
     * @throws {PaymentOrderError} If essential data like customer or payment method is missing.
     */
    createPaymentOrder(rawOrderData) {
        logger.info('Attempting to create a new payment order.', { rawExternalId: rawOrderData.externalId });

        // Essential data validation before proceeding
        if (!rawOrderData.customer || !rawOrderData.customer.id || !rawOrderData.paymentMethod || !rawOrderData.paymentMethod.token) {
            throw new PaymentOrderError(
                'Missing essential customer ID or payment method token for order creation.',
                'MISSING_REQUIRED_DATA_CRITICAL',
                { customerIdPresent: !!rawOrderData.customer?.id, paymentMethodTokenPresent: !!rawOrderData.paymentMethod?.token }
            );
        }

        const orderId = generateUuid();
        const defaultCurrency = String(rawOrderData.currency || "USD").toUpperCase();

        const sanitizedLineItems = sanitizeLineItems(rawOrderData.lineItems, defaultCurrency);
        const calculatedTotalAmount = sanitizedLineItems.reduce((sum, item) => sum + item.amount.value, 0);

        const newOrder = {
            id: orderId,
            externalId: String(rawOrderData.externalId || generateUuid()).trim(), // Ensure externalId is a string and trimmed
            status: 'PENDING_VALIDATION',
            currency: isValidCurrencyCode(defaultCurrency) ? defaultCurrency : "USD",
            totalAmount: {
                value: internalSanitizeAmount(rawOrderData.totalAmount?.value || calculatedTotalAmount),
                currency: isValidCurrencyCode(defaultCurrency) ? defaultCurrency : "USD",
            },
            customer: {
                id: String(rawOrderData.customer.id).trim(),
                firstName: typeof rawOrderData.customer.firstName === 'string' ? rawOrderData.customer.firstName.trim() : '',
                lastName: typeof rawOrderData.customer.lastName === 'string' ? rawOrderData.customer.lastName.trim() : '',
                email: typeof rawOrderData.customer.email === 'string' ? rawOrderData.customer.email.trim() : '',
                phone: typeof rawOrderData.customer.phone === 'string' ? rawOrderData.customer.phone.trim() : undefined,
                countryCode: typeof rawOrderData.customer.countryCode === 'string' ? rawOrderData.customer.countryCode.trim().toUpperCase() : undefined,
                billingAddress: typeof rawOrderData.customer.billingAddress === 'object' && rawOrderData.customer.billingAddress !== null ? rawOrderData.customer.billingAddress : {},
                shippingAddress: typeof rawOrderData.customer.shippingAddress === 'object' && rawOrderData.customer.shippingAddress !== null ? rawOrderData.customer.shippingAddress : {},
            },
            paymentMethod: {
                type: typeof rawOrderData.paymentMethod.type === 'string' ? rawOrderData.paymentMethod.type.trim() : 'unknown',
                token: String(rawOrderData.paymentMethod.token).trim(),
                cardType: typeof rawOrderData.paymentMethod.cardType === 'string' ? rawOrderData.paymentMethod.cardType.trim() : undefined,
                lastFour: typeof rawOrderData.paymentMethod.lastFour === 'string' ? rawOrderData.paymentMethod.lastFour.trim() : undefined,
                expiryMonth: typeof rawOrderData.paymentMethod.expiryMonth === 'string' ? rawOrderData.paymentMethod.expiryMonth.trim() : undefined,
                expiryYear: typeof rawOrderData.paymentMethod.expiryYear === 'string' ? rawOrderData.paymentMethod.expiryYear.trim() : undefined,
                bankName: typeof rawOrderData.paymentMethod.bankName === 'string' ? rawOrderData.paymentMethod.bankName.trim() : undefined,
                accountMask: typeof rawOrderData.paymentMethod.accountMask === 'string' ? rawOrderData.paymentMethod.accountMask.trim() : undefined,
                walletProvider: typeof rawOrderData.paymentMethod.walletProvider === 'string' ? rawOrderData.paymentMethod.walletProvider.trim() : undefined,
            },
            lineItems: sanitizedLineItems,
            metadata: sanitizeMetadata(rawOrderData.metadata || []),
            creationDate: new Date().toISOString().split('T')[0],
            lastUpdatedDate: new Date().toISOString().split('T')[0],
            requestedCompletionDate: sanitizeDate(rawOrderData.requestedCompletionDate) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to tomorrow
            processingHistory: [`Order created at ${new Date().toISOString()}`],
            context: {}, // Empty context for transient data during processing
            aiAnalysis: {}, // Placeholder for AI results
        };

        // Calculate initial checksum, excluding AI analysis and transient context
        newOrder.checksum = calculateSimpleChecksum({ ...newOrder, checksum: undefined, aiAnalysis: undefined, context: undefined, processingHistory: undefined });

        logger.info(`Payment order ${orderId} created successfully.`, { status: newOrder.status, externalId: newOrder.externalId, totalAmount: newOrder.totalAmount.value });
        return newOrder;
    },

    /**
     * Performs a comprehensive validation of a payment order.
     * This includes structural checks, business logic, and AI-driven insights for fraud and compliance.
     * @param {PaymentOrder} order - The payment order object to validate.
     * @returns {Promise<Object>} An object indicating validation status and any errors/warnings.
     */
    async validatePaymentOrder(order) {
        logger.info(`Initiating comprehensive validation for order: ${order.id}`);
        const validationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            validationDetails: {},
        };

        // 1. Basic structural and data type validation
        if (!order || typeof order !== 'object' || Array.isArray(order)) {
            validationResult.errors.push('Order object is null, not an object, or an array.');
            validationResult.isValid = false;
            return validationResult;
        }
        if (!order.id || !order.customer?.id || !order.paymentMethod?.token || !order.totalAmount?.value || !order.currency) {
            validationResult.errors.push('Missing critical order fields (id, customer.id, paymentMethod.token, totalAmount.value, currency).');
            validationResult.isValid = false;
        }
        if (!isValidCurrencyCode(order.currency)) {
            validationResult.errors.push(`Invalid currency code detected: ${order.currency}`);
            validationResult.isValid = false;
        }
        if (order.totalAmount.value <= 0) {
            validationResult.errors.push(`Total amount must be positive. Received: ${order.totalAmount.value}`);
            validationResult.isValid = false;
        }
        if (!Array.isArray(order.lineItems) || order.lineItems.length === 0) {
            validationResult.errors.push('Order must contain at least one valid line item.');
            validationResult.isValid = false;
        } else {
            const calculatedLineItemTotal = order.lineItems.reduce((sum, item) => sum + item.amount.value, 0);
            if (Math.abs(calculatedLineItemTotal - order.totalAmount.value) > 0.01) { // Allow for minor floating point differences
                validationResult.warnings.push(`Calculated line item total (${calculatedLineItemTotal.toFixed(2)}) does not exactly match order total (${order.totalAmount.value.toFixed(2)}).`);
            }
        }

        // 2. Data integrity check using checksum
        // Exclude highly dynamic or AI-generated fields for checksum calculation to avoid false positives
        const checksumData = { ...order, checksum: undefined, lastUpdatedDate: undefined, aiAnalysis: undefined, processingHistory: undefined, context: undefined };
        const currentChecksum = calculateSimpleChecksum(checksumData);
        if (order.checksum && order.checksum !== currentChecksum) {
            validationResult.warnings.push('Order checksum mismatch. Data inconsistency detected or order was updated without recalculating checksum.');
            validationResult.validationDetails.checksumStatus = 'MISMATCH';
            logger.warn(`Checksum mismatch for order ${order.id}. Stored: ${order.checksum}, Calculated: ${currentChecksum}`);
        } else if (!order.checksum) {
            validationResult.warnings.push('Order is missing an initial checksum. Data integrity cannot be fully verified.');
            validationResult.validationDetails.checksumStatus = 'MISSING';
        } else {
            validationResult.validationDetails.checksumStatus = 'MATCH';
        }

        // 3. AI-driven validation and assessment
        try {
            const fraudAssessment = await GeminiAIService.assessFraud(order);
            validationResult.validationDetails.fraudAssessment = fraudAssessment;
            if (fraudAssessment.recommendation === 'DECLINE') {
                validationResult.errors.push(`AI fraud risk too high (score: ${fraudAssessment.score}). Recommendation: ${fraudAssessment.recommendation}`);
                validationResult.isValid = false;
            } else if (fraudAssessment.recommendation === 'REVIEW') {
                validationResult.warnings.push(`AI detected high fraud risk (score: ${fraudAssessment.score}). Recommendation: ${fraudAssessment.recommendation}. Requires manual review.`);
            }

            const complianceAssessment = await GeminiAIService.checkCompliance(order);
            validationResult.validationDetails.complianceAssessment = complianceAssessment;
            if (!complianceAssessment.isCompliant) {
                validationResult.errors.push(`AI detected compliance violations: ${complianceAssessment.violations.join(', ')}`);
                validationResult.isValid = false;
            }
            if (complianceAssessment.warnings.length > 0) {
                validationResult.warnings.push(`AI detected compliance warnings: ${complianceAssessment.warnings.join(', ')}`);
            }

            const anomalyDetectionResult = await GeminiAIService.detectAnomaly(order);
            validationResult.validationDetails.anomalyDetection = anomalyDetectionResult;
            if (anomalyDetectionResult.isAnomalous) {
                validationResult.warnings.push(`AI detected an anomaly in the order (Probability: ${anomalyDetectionResult.probability.toFixed(2)}). Flags: ${anomalyDetectionResult.flags.join(', ')}`);
            }

            // Other AI insights (enrichment, intent) typically don't block validation, but their results are stored.
            const enrichmentResult = await GeminiAIService.enrichPaymentOrderData(order);
            validationResult.validationDetails.enrichment = enrichmentResult;
            const intentAnalysis = await GeminiAIService.analyzePaymentIntent(order);
            validationResult.validationDetails.intent = intentAnalysis;

        } catch (aiError) {
            logger.error(`AI validation failed for order ${order.id}. Processing with available data, but risk assessment may be incomplete.`, aiError, { orderId: order.id, aiErrorCode: aiError.code });
            validationResult.warnings.push(`AI services encountered a critical error: ${aiError.message}. Proceeding with caution.`);
            // Decide if AI failure should block. For critical fraud/compliance, it might.
            if (aiError.code === 'GEMINI_AI_SERVICE_UNAVAILABLE' || aiError.code === 'GEMINI_AI_TIMEOUT') {
                validationResult.errors.push('Critical AI service unavailable or timed out. Cannot complete full validation.');
                validationResult.isValid = false; // Block if critical AI services fail
            }
        }

        logger.info(`Validation complete for order: ${order.id}. IsValid: ${validationResult.isValid}`, { errorsCount: validationResult.errors.length, warningsCount: validationResult.warnings.length });
        return validationResult;
    },

    /**
     * Updates the status of a payment order and logs the change.
     * Ensures status transitions are valid (though not strictly enforced here for flexibility).
     * @param {PaymentOrder} order - The payment order object to update.
     * @param {string} newStatus - The new status to set.
     * @param {string} [details='Status updated.'] - Optional details about the status change.
     * @returns {PaymentOrder} The updated payment order object.
     * @throws {PaymentOrderError} If the new status is invalid.
     */
    updatePaymentOrderStatus(order, newStatus, details = 'Status updated.') {
        const validStatuses = new Set([
            'PENDING_VALIDATION', 'VALIDATED', 'FRAUD_REVIEW', 'COMPLIANCE_REVIEW', 'ANOMALY_REVIEW',
            'APPROVED', 'DECLINED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED',
            'CHARGEBACK_INITIATED', 'CHARGEBACK_RESOLVED', 'PENDING_EXTERNAL_APPROVAL'
        ]);

        if (!validStatuses.has(newStatus)) {
            throw new PaymentOrderError(`Invalid payment order status provided: ${newStatus}`, 'INVALID_STATUS');
        }

        if (order.status === newStatus) {
            logger.debug(`Order ${order.id} status is already ${newStatus}. No state change performed.`);
            return order;
        }

        logger.info(`Updating order ${order.id} status from ${order.status} to ${newStatus}.`, { oldStatus: order.status, newStatus, orderId: order.id });
        order.status = newStatus;
        order.lastUpdatedDate = new Date().toISOString().split('T')[0];
        order.processingHistory.push(`${new Date().toISOString()} - Status changed to ${newStatus}: ${details}`);
        // Recalculate checksum, excluding AI analysis and transient context
        order.checksum = calculateSimpleChecksum({ ...order, checksum: undefined, aiAnalysis: undefined, context: undefined, processingHistory: undefined });
        return order;
    },

    /**
     * Orchestrates the entire processing lifecycle for a payment order.
     * This includes comprehensive validation, AI analysis, routing optimization,
     * external gateway simulation, and status management.
     * @param {PaymentOrder} initialOrder - The initial payment order object (e.g., from `createPaymentOrder`).
     * @returns {Promise<PaymentOrder>} The fully processed and updated payment order.
     * @throws {PaymentOrderError} If processing fails at any critical step.
     */
    async processPaymentOrder(initialOrder) {
        let currentOrder = { ...initialOrder }; // Create a mutable copy to update
        currentOrder.aiAnalysis = currentOrder.aiAnalysis || {}; // Ensure aiAnalysis exists

        try {
            logger.info(`Starting comprehensive processing for payment order: ${currentOrder.id}`, { externalId: currentOrder.externalId, currentStatus: currentOrder.status });
            currentOrder.processingHistory.push(`${new Date().toISOString()} - Initiating full processing workflow.`);

            // 1. Validate the order
            const validationResult = await this.validatePaymentOrder(currentOrder);
            Object.assign(currentOrder.aiAnalysis, validationResult.validationDetails); // Store all AI results

            if (!validationResult.isValid) {
                const errorMessage = `Order ${currentOrder.id} failed critical validation checks: ${validationResult.errors.join('; ')}`;
                currentOrder = this.updatePaymentOrderStatus(currentOrder, 'DECLINED', errorMessage);
                throw new PaymentOrderError(errorMessage, 'VALIDATION_FAILED', { errors: validationResult.errors, warnings: validationResult.warnings });
            }

            // Check AI recommendations for immediate actions
            if (validationResult.validationDetails.fraudAssessment?.recommendation === 'REVIEW') {
                currentOrder = this.updatePaymentOrderStatus(currentOrder, 'FRAUD_REVIEW', 'AI flagged order for manual fraud review due to high risk.');
                logger.warn(`Order ${currentOrder.id} requires manual fraud review.`);
                return currentOrder; // Halt automated processing for manual intervention
            }
            if (validationResult.validationDetails.complianceAssessment?.warnings.length > 0 && !validationResult.validationDetails.complianceAssessment?.isCompliant) {
                 currentOrder = this.updatePaymentOrderStatus(currentOrder, 'COMPLIANCE_REVIEW', `AI flagged order for manual compliance review: ${validationResult.validationDetails.complianceAssessment.warnings.join(', ')}`);
                 logger.warn(`Order ${currentOrder.id} requires manual compliance review.`);
                 return currentOrder; // Halt automated processing
            }
            if (validationResult.validationDetails.anomalyDetection?.isAnomalous) {
                currentOrder = this.updatePaymentOrderStatus(currentOrder, 'ANOMALY_REVIEW', `AI detected anomaly (Prob: ${validationResult.validationDetails.anomalyDetection.probability.toFixed(2)})`);
                logger.warn(`Order ${currentOrder.id} detected as anomalous, requires manual review.`);
                return currentOrder; // Halt automated processing
            }

            // If all initial checks pass, mark as validated
            currentOrder = this.updatePaymentOrderStatus(currentOrder, 'VALIDATED', 'Order passed initial and AI-driven validation. Proceeding to routing.');

            // 2. Optimize Payment Routing using AI
            const routingOptimization = await GeminiAIService.optimizeProcessingRoute(currentOrder);
            currentOrder.aiAnalysis.routing = routingOptimization;
            currentOrder.context.recommendedGateway = routingOptimization.recommendedGateway;
            currentOrder.context.estimatedProcessingCost = routingOptimization.estimatedCost;
            currentOrder.processingHistory.push(`${new Date().toISOString()} - AI recommended payment gateway: ${routingOptimization.recommendedGateway} (Estimated cost: ${routingOptimization.estimatedCost.toFixed(2)})`);
            logger.info(`Order ${currentOrder.id} routed via AI to: ${routingOptimization.recommendedGateway}`);

            // 3. Simulate external payment gateway interaction
            currentOrder = this.updatePaymentOrderStatus(currentOrder, 'PROCESSING', `Sending to ${currentOrder.context.recommendedGateway} for execution.`);
            logger.debug(`Simulating external payment gateway call for order ${currentOrder.id}... Gateway: ${currentOrder.context.recommendedGateway}`);
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // Simulate gateway latency

            const gatewaySuccess = Math.random() > 0.08; // 92% success rate
            if (gatewaySuccess) {
                const transactionId = `TXN_${generateUuid().substring(0, 12).toUpperCase()}`;
                currentOrder = this.updatePaymentOrderStatus(currentOrder, 'COMPLETED', `Payment successfully processed by ${currentOrder.context.recommendedGateway}. Transaction ID: ${transactionId}`);
                currentOrder.context.transactionId = transactionId;
                logger.info(`Payment order ${currentOrder.id} successfully completed. Transaction ID: ${transactionId}`);
            } else {
                const gatewayFailureReason = Math.random() < 0.5 ? 'Insufficient funds/limit exceeded' : 'Payment method declined by issuer';
                currentOrder = this.updatePaymentOrderStatus(currentOrder, 'FAILED', `Payment failed at gateway ${currentOrder.context.recommendedGateway}. Reason: ${gatewayFailureReason}.`);
                throw new PaymentOrderError(`Payment failed at gateway for order ${currentOrder.id}.`, 'GATEWAY_FAILURE', { gateway: currentOrder.context.recommendedGateway, reason: gatewayFailureReason });
            }

            return currentOrder;

        } catch (error) {
            logger.error(`Critical error processing payment order ${initialOrder.id}:`, error, { orderId: initialOrder.id, currentStatus: currentOrder.status, errorDetails: error.details });
            // Ensure order status reflects failure if not already set to a final state
            if (!['DECLINED', 'FAILED', 'CANCELLED', 'REFUNDED', 'CHARGEBACK_INITIATED'].includes(currentOrder.status)) {
                currentOrder = this.updatePaymentOrderStatus(currentOrder, 'FAILED', `Processing failed: ${error.message}`);
            }
            throw error; // Re-throw to inform the caller system
        } finally {
            logger.info(`Finished processing attempt for order: ${initialOrder.id}. Final status: ${currentOrder.status}`);
        }
    },

    /**
     * Retrieves a payment order by its ID. (Mock implementation)
     * In a real application, this would fetch from a persistent data store (e.g., database).
     * @param {string} orderId - The ID of the payment order.
     * @returns {Promise<PaymentOrder | null>} The payment order object or null if not found.
     */
    async getPaymentOrderById(orderId) {
        logger.debug(`Attempting to fetch payment order by ID: ${orderId}`);
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100)); // Simulate DB latency

        // Mock a single stored order for demonstration purposes
        const mockOrderRawData = {
            externalId: `EXT-${orderId.substring(0,5)}-${Math.floor(Math.random()*1000)}`,
            customer: { id: 'CUST_001_A', email: 'jane.doe@example.com', firstName: 'Jane', lastName: 'Doe', countryCode: 'CA',
                billingAddress: { street: '123 Maple St', city: 'Toronto', province: 'ON', postalCode: 'M5V 2J5', country: 'CA' }
            },
            paymentMethod: { type: 'credit_card', token: 'mock-card-token-123', cardType: 'MASTERCARD', lastFour: '5454', expiryMonth: '12', expiryYear: '2025' },
            lineItems: [
                { id: 'LI_SUB_PREM', name: 'Annual Premium Software License', description: 'Access to all premium features for 1 year.', quantity: 1, unitPrice: { value: 299.99, currency: 'USD' }, amount: { value: 299.99, currency: 'USD' }, tags: ['software', 'subscription', 'annual'] },
                { id: 'LI_SUP_ONB', name: 'Onboarding Support Package', description: '3 hours of dedicated onboarding support.', quantity: 1, unitPrice: { value: 150.00, currency: 'USD' }, amount: { value: 150.00, currency: 'USD' }, tags: ['service', 'support'] }
            ],
            metadata: [{ key: 'campaign', value: 'winter_2023_launch' }, { key: 'channel', value: 'direct_web' }, {key: 'customer_tier', value: 'gold', type: 'string'}],
            totalAmount: { value: 449.99, currency: 'USD' },
            requestedCompletionDate: '10/25/2023',
        };

        const mockOrder = PaymentOrderProcessor.createPaymentOrder(mockOrderRawData);
        mockOrder.id = orderId; // Ensure the retrieved order has the requested ID
        mockOrder.status = ['COMPLETED', 'APPROVED', 'FRAUD_REVIEW'][Math.floor(Math.random() * 3)]; // Randomize status for demo
        mockOrder.lastUpdatedDate = new Date().toISOString().split('T')[0];

        // Ensure AI analysis is robust for mock retrieval
        mockOrder.aiAnalysis = {
            fraud: { score: 15, recommendation: 'APPROVE', flags: [], details: { model: 'gemini-fraud-v3' } },
            compliance: { isCompliant: true, violations: [], warnings: [], details: { model: 'gemini-compliance-v2' } },
            routing: { recommendedGateway: 'GatewayB_fast', estimatedCost: 2.75, estimatedLatencyMs: 120, reasons: ['Optimized for speed'], details: { model: 'gemini-router-v1' } },
            enrichment: { enrichedMetadata: { ai_inferred_categories_raw: 'software,subscription,annual' }, inferredCategories: ['software', 'subscription'], insights: ['High-value customer potential.'], details: { model: 'gemini-data-enricher-v1' } },
            intent: { primaryIntent: 'Subscription Purchase', secondaryIntent: 'B2C', sentiment: 'Positive', confidence: 0.98, keywords: ['license', 'support', 'premium'], details: { model: 'gemini-intent-analyzer-v1' } },
            anomalyDetection: { isAnomalous: false, probability: 0.05, flags: [], details: { model: 'gemini-anomaly-v1' } },
            analysisTimestamp: new Date().toISOString()
        };
        mockOrder.processingHistory.push('2023-10-20T10:00:00.000Z - Order fetched and simulated from mock data.');

        // Simulate a scenario where the ID matches the mock
        if (orderId === 'mock-order-123abc' || orderId === mockOrder.id) {
            logger.info(`Mock order ${orderId} retrieved successfully.`);
            return mockOrder;
        }

        logger.warn(`Payment order with ID ${orderId} not found in mock storage.`);
        return null;
    },

    /**
     * Cancels a payment order if it's in a cancellable state.
     * This operation is irreversible and prevents further processing.
     * @param {PaymentOrder} order - The payment order to cancel.
     * @param {string} reason - The reason for cancellation.
     * @returns {PaymentOrder} The updated, cancelled payment order.
     * @throws {PaymentOrderError} If the order cannot be cancelled in its current state.
     */
    cancelPaymentOrder(order, reason) {
        const cancellableStatuses = new Set(['PENDING_VALIDATION', 'VALIDATED', 'FRAUD_REVIEW', 'COMPLIANCE_REVIEW', 'ANOMALY_REVIEW', 'PROCESSING', 'PENDING_EXTERNAL_APPROVAL']);
        if (!cancellableStatuses.has(order.status)) {
            throw new PaymentOrderError(
                `Order ${order.id} cannot be cancelled in its current status: ${order.status}.`,
                'CANNOT_CANCEL_ORDER',
                { currentStatus: order.status, orderId: order.id }
            );
        }
        return this.updatePaymentOrderStatus(order, 'CANCELLED', `Cancelled by user/system. Reason: ${reason}`);
    },

    /**
     * Initiates a refund for a completed payment order. (Mock implementation)
     * Supports full or partial refunds. In a real system, this would interact with the payment gateway.
     * @param {PaymentOrder} order - The completed payment order to refund.
     * @param {MoneyAmount} [amount] - Specific amount to refund. Defaults to total order amount.
     * @param {string} reason - Reason for the refund.
     * @returns {Promise<PaymentOrder>} The updated, refunded payment order.
     * @throws {PaymentOrderError} If the order is not in a refundable state, invalid amount, or refund fails.
     */
    async refundPaymentOrder(order, amount = order.totalAmount, reason) {
        if (order.status !== 'COMPLETED') {
            throw new PaymentOrderError(
                `Order ${order.id} cannot be refunded. Current status: ${order.status}. Only 'COMPLETED' orders can be refunded.`,
                'CANNOT_REFUND_ORDER',
                { currentStatus: order.status, orderId: order.id }
            );
        }
        if (!amount || amount.value <= 0 || amount.value > order.totalAmount.value || amount.currency !== order.totalAmount.currency) {
            throw new PaymentOrderError(
                `Invalid refund amount or currency for order ${order.id}. Requested: ${amount?.value || 'N/A'} ${amount?.currency || 'N/A'}. Order Total: ${order.totalAmount.value} ${order.totalAmount.currency}.`,
                'INVALID_REFUND_AMOUNT',
                { requestedAmount: amount, orderTotal: order.totalAmount, orderId: order.id }
            );
        }

        logger.info(`Initiating refund for order ${order.id} for amount ${amount.value} ${amount.currency}. Reason: ${reason}`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200)); // Simulate refund processing latency

        const refundSuccess = Math.random() > 0.05; // 95% refund success rate
        if (refundSuccess) {
            const refundId = `RFND_${generateUuid().substring(0, 10).toUpperCase()}`;
            const refundDetails = amount.value === order.totalAmount.value ? 'Full refund processed.' : `Partial refund of ${amount.value} ${amount.currency} processed.`;
            return this.updatePaymentOrderStatus(order, 'REFUNDED', `${refundDetails} Reason: ${reason}. Refund ID: ${refundId}`);
        } else {
            throw new PaymentOrderError(
                `Refund failed for order ${order.id}. Gateway error or processing issue.`,
                'REFUND_GATEWAY_FAILURE',
                { orderId: order.id, refundAmount: amount, reason: reason }
            );
        }
    },

    /**
     * Handles a chargeback event for a payment order. (Mock implementation)
     * @param {PaymentOrder} order - The payment order affected by the chargeback.
     * @param {string} chargebackReasonCode - The reason code for the chargeback.
     * @param {MoneyAmount} chargebackAmount - The amount of the chargeback.
     * @returns {Promise<PaymentOrder>} The updated payment order with chargeback status.
     * @throws {PaymentOrderError} If order is not in a suitable state for chargeback processing.
     */
    async handleChargeback(order, chargebackReasonCode, chargebackAmount) {
        if (order.status !== 'COMPLETED' && order.status !== 'REFUNDED') {
            throw new PaymentOrderError(
                `Chargeback cannot be initiated for order ${order.id} in status: ${order.status}.`,
                'INVALID_CHARGEBACK_STATE',
                { orderId: order.id, currentStatus: order.status }
            );
        }

        logger.warn(`Chargeback initiated for order ${order.id}. Reason: ${chargebackReasonCode}, Amount: ${chargebackAmount.value} ${chargebackAmount.currency}`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing

        // In a real system, this would involve complex logic for dispute management,
        // potentially changing total amounts, affecting balances, etc.
        return this.updatePaymentOrderStatus(order, 'CHARGEBACK_INITIATED', `Chargeback received. Reason: ${chargebackReasonCode}. Amount: ${chargebackAmount.value} ${chargebackAmount.currency}.`);
    }
};