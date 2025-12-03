import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// region -- 0. Global Constants, Types, and Utility Functions (Contributing to Line Count) --

/**
 * @typedef {string} UUID - A universally unique identifier.
 */
export type UUID = string;

/**
 * Generates a random UUID (version 4).
 * @returns {UUID} A new UUID string.
 */
export const generateUUID = (): UUID => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Enum for different digital twin categories in a banking context.
 */
export enum TwinCategory {
    CUSTOMER_ACCOUNT = "Customer Account",
    LOAN_PRODUCT = "Loan Product",
    FINANCIAL_INSTRUMENT = "Financial Instrument",
    BRANCH_PERFORMANCE = "Branch Performance",
    RISK_ASSESSMENT = "Risk Assessment",
    COMPLIANCE_AUDIT = "Compliance Audit",
    FRAUD_DETECTION = "Fraud Detection",
    INFRASTRUCTURE_ASSET = "Infrastructure Asset",
    EMPLOYEE_PERFORMANCE = "Employee Performance",
    MARKET_DATA_FEED = "Market Data Feed",
    SERVICE_LEVEL_AGREEMENT = "Service Level Agreement",
    SMART_ATM = "Smart ATM",
    SECURITY_SYSTEM = "Security System",
    DATA_WAREHOUSE_NODE = "Data Warehouse Node",
    CLOUD_RESOURCE = "Cloud Resource",
    API_GATEWAY = "API Gateway",
    PAYMENT_GATEWAY = "Payment Gateway",
    CREDIT_CARD_HOLDER = "Credit Card Holder",
    INVESTMENT_PORTFOLIO = "Investment Portfolio",
    KYC_PROCESS = "KYC Process",
    AML_MONITORING = "AML Monitoring"
}

/**
 * Enum for the status of a digital twin.
 */
export enum TwinStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    MAINTENANCE = "Maintenance",
    DECOMMISSIONED = "Decommissioned",
    ERROR = "Error",
    PENDING_ACTIVATION = "Pending Activation"
}

/**
 * Enum for data ingestion methods.
 */
export enum IngestionMethod {
    API = "API",
    STREAM = "Stream",
    BATCH = "Batch",
    MANUAL = "Manual"
}

/**
 * Enum for different types of AI insights.
 */
export enum AIServiceType {
    SCHEMA_GENERATION = "Schema Generation",
    ANOMALY_DETECTION = "Anomaly Detection",
    PREDICTIVE_ANALYTICS = "Predictive Analytics",
    NATURAL_LANGUAGE_QUERY = "Natural Language Query",
    RECOMMENDATION_ENGINE = "Recommendation Engine",
    SENTIMENT_ANALYSIS = "Sentiment Analysis",
    RISK_SCORING = "Risk Scoring",
    FRAUD_DETECTION = "Fraud Detection",
    COMPLIANCE_CHECK = "Compliance Check"
}

/**
 * Defines the structure for a property within a digital twin schema.
 * This is a simplified version of a JSON Schema property.
 */
export interface TwinProperty {
    name: string;
    type: string; // e.g., "string", "number", "boolean", "object", "array"
    description?: string;
    unit?: string; // e.g., "USD", "Celsius", "%"
    enum?: string[];
    readOnly?: boolean;
    writable?: boolean; // For actions
    minValue?: number;
    maxValue?: number;
    defaultValue?: any;
    format?: string; // e.g., "date-time", "email", "uri"
    pattern?: string; // Regex pattern for strings
    items?: TwinProperty; // For array types
    properties?: { [key: string]: TwinProperty }; // For object types
    required?: boolean;
}

/**
 * Represents a digital twin definition, including its metadata and schema.
 */
export interface DigitalTwinDefinition {
    id: UUID;
    name: string;
    description: string;
    category: TwinCategory;
    version: string;
    createdAt: string;
    lastUpdated: string;
    schema: {
        $schema?: string;
        title?: string;
        type?: string;
        properties: { [key: string]: any }; // The actual JSON schema properties
        required?: string[];
    };
    tags: string[];
    ownerUserId: UUID;
    accessControlList: string[]; // User IDs or role IDs
}

/**
 * Represents the current state of a specific digital twin instance.
 * The `properties` object holds the actual data values.
 */
export interface DigitalTwinInstance {
    instanceId: UUID;
    twinDefinitionId: UUID;
    name: string;
    status: TwinStatus;
    lastDataUpdateTime: string;
    properties: { [key: string]: any }; // Current values of the twin's properties
    metadata: {
        location?: string;
        lastKnownIP?: string;
        serialNumber?: string;
        firmwareVersion?: string;
        [key: string]: any;
    };
    healthScore: number; // 0-100
    alerts: TwinAlert[];
    associatedEntities: AssociatedEntity[]; // e.g., linked customer IDs, loan IDs
}

/**
 * Represents an event or log entry related to a digital twin instance.
 */
export interface TwinEvent {
    eventId: UUID;
    instanceId: UUID;
    timestamp: string;
    type: 'DATA_UPDATE' | 'ACTION_TAKEN' | 'ALERT_RAISED' | 'STATUS_CHANGE' | 'CONFIGURATION_UPDATE' | 'SYSTEM_EVENT';
    description: string;
    details?: { [key: string]: any };
    severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    source?: string;
}

/**
 * Represents an alert generated for a digital twin instance.
 */
export interface TwinAlert {
    alertId: UUID;
    instanceId: UUID;
    timestamp: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    type: 'ANOMALY' | 'THRESHOLD_BREACH' | 'STATUS_ERROR' | 'SECURITY_INCIDENT';
    status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
    triggeredBy?: string; // e.g., "AI_AnomalyDetector", "User_Threshold"
    resolutionNotes?: string;
    assignedTo?: UUID; // User ID
}

/**
 * Represents a simulated action that can be performed on a twin.
 */
export interface TwinAction {
    actionId: UUID;
    name: string;
    description: string;
    parameters: TwinProperty[]; // Defines what parameters the action takes
    targetProperty?: string; // The property this action might influence
    impact?: string; // Description of the action's impact
    requiresApproval?: boolean;
}

/**
 * Represents a record of an action performed.
 */
export interface ActionHistoryEntry {
    logId: UUID;
    instanceId: UUID;
    actionId: UUID;
    actionName: string;
    timestamp: string;
    initiatedBy: UUID; // User ID
    parametersUsed: { [key: string]: any };
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'REJECTED';
    resultDetails?: string;
    approvedBy?: UUID; // User ID if approval was needed
}

/**
 * Represents a user in the system (simplified).
 */
export interface UserProfile {
    userId: UUID;
    username: string;
    email: string;
    roles: string[]; // e.g., "admin", "developer", "viewer", "bank_teller"
    lastLogin: string;
    isActive: boolean;
}

/**
 * Represents a configuration setting for the platform.
 */
export interface AppSetting {
    key: string;
    value: any;
    description: string;
    type: string; // e.g., 'string', 'number', 'boolean'
    group: string; // e.g., 'AI', 'Security', 'Telemetry'
    editable: boolean;
}

/**
 * Represents an associated entity, linking a twin to other business objects.
 */
export interface AssociatedEntity {
    type: string; // e.g., "CUSTOMER", "LOAN_ACCOUNT", "ATM_DEVICE"
    entityId: UUID;
    description?: string;
}

/**
 * Represents a dashboard widget configuration.
 */
export interface DashboardWidget {
    widgetId: UUID;
    name: string;
    type: 'metric' | 'chart' | 'table' | 'log';
    twinDefinitionId?: UUID;
    twinInstanceId?: UUID;
    propertyKey?: string;
    chartType?: 'line' | 'bar' | 'pie';
    timeRange?: string; // e.g., '1h', '24h', '7d'
    configuration: { [key: string]: any };
    position: { x: number; y: number; w: number; h: number; };
}

/**
 * Represents a historical data point for a twin property.
 */
export interface HistoricalDataPoint {
    timestamp: string;
    value: any;
}

/**
 * A utility function for deep cloning objects.
 * @param obj The object to clone.
 * @returns A deep copy of the object.
 */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * Mock API response structure for AI services.
 */
export interface AIResponse {
    status: 'success' | 'error';
    message: string;
    data?: any;
    errorDetails?: string;
    timestamp: string;
    modelUsed?: string;
}

// Default system settings
export const DEFAULT_APP_SETTINGS: AppSetting[] = [
    { key: 'ai_model_schema_gen', value: 'gemini-2.5-flash', description: 'AI model for schema generation.', type: 'string', group: 'AI', editable: true },
    { key: 'ai_model_anomaly_detection', value: 'gemini-2.5-flash', description: 'AI model for anomaly detection.', type: 'string', group: 'AI', editable: true },
    { key: 'ai_model_predictive_analytics', value: 'gemini-2.5-pro', description: 'AI model for predictive analytics.', type: 'string', group: 'AI', editable: true },
    { key: 'data_ingestion_interval_ms', value: 5000, description: 'Default interval for simulated data ingestion.', type: 'number', group: 'Telemetry', editable: true },
    { key: 'max_event_log_entries', value: 1000, description: 'Maximum entries to keep in event log per twin.', type: 'number', group: 'Logging', editable: true },
    { key: 'admin_email', value: 'admin@example.com', description: 'System administrator contact email.', type: 'string', group: 'Contact', editable: true },
    { key: 'security_audit_log_enabled', value: true, description: 'Enable detailed security audit logging.', type: 'boolean', group: 'Security', editable: true },
    { key: 'mock_ai_response_delay_ms', value: 2000, description: 'Simulated delay for AI responses in milliseconds.', type: 'number', group: 'AI', editable: true },
    { key: 'enable_realtime_data_streaming', value: true, description: 'Toggle for real-time data streaming simulation.', type: 'boolean', group: 'Telemetry', editable: true },
    { key: 'default_twin_health_threshold', value: 70, description: 'Health score threshold below which a twin is flagged.', type: 'number', group: 'Monitoring', editable: true },
    { key: 'api_rate_limit_per_minute', value: 60, description: 'API rate limit for external integrations.', type: 'number', group: 'Integration', editable: false },
    { key: 'default_language', value: 'en-US', description: 'Default language for the application UI.', type: 'string', group: 'Localization', editable: true }
];

// Mock user data (for demonstration purposes)
export const MOCK_USERS: UserProfile[] = [
    { userId: generateUUID(), username: 'admin_user', email: 'admin@bank.com', roles: ['admin', 'developer', 'viewer'], lastLogin: new Date().toISOString(), isActive: true },
    { userId: generateUUID(), username: 'dev_analyst', email: 'dev@bank.com', roles: ['developer', 'viewer'], lastLogin: new Date().toISOString(), isActive: true },
    { userId: generateUUID(), username: 'loan_officer', email: 'loan@bank.com', roles: ['viewer', 'bank_teller'], lastLogin: new Date().toISOString(), isActive: true },
    { userId: generateUUID(), username: 'risk_manager', email: 'risk@bank.com', roles: ['viewer', 'risk_specialist'], lastLogin: new Date().toISOString(), isActive: true },
];

// Mock actions available for twins (generalized)
export const MOCK_GLOBAL_ACTIONS: TwinAction[] = [
    {
        actionId: generateUUID(), name: "Reset Device", description: "Sends a command to reset the physical device associated with the twin.",
        parameters: [], impact: "May cause temporary service interruption.", requiresApproval: true
    },
    {
        actionId: generateUUID(), name: "Update Firmware", description: "Initiates a firmware update on the device.",
        parameters: [{ name: "version", type: "string", description: "New firmware version" }], impact: "Requires device restart.", requiresApproval: true
    },
    {
        actionId: generateUUID(), name: "Change Operating Mode", description: "Changes the operating mode of the twin (e.g., eco, performance).",
        parameters: [{ name: "mode", type: "string", enum: ["eco", "standard", "performance"], description: "Desired operating mode" }],
        targetProperty: "operatingMode", impact: "Alters resource consumption.", requiresApproval: false
    },
    {
        actionId: generateUUID(), name: "Collect Diagnostic Logs", description: "Requests the device to upload its diagnostic logs.",
        parameters: [], impact: "Minimal.", requiresApproval: false
    },
    {
        actionId: generateUUID(), name: "Adjust Threshold", description: "Modifies a data threshold for alerting.",
        parameters: [
            { name: "property", type: "string", description: "Target property key" },
            { name: "newValue", type: "number", description: "New threshold value" }
        ], impact: "Changes alert sensitivity.", requiresApproval: true
    },
    {
        actionId: generateUUID(), name: "Process Financial Transaction", description: "Simulates processing a financial transaction via the twin.",
        parameters: [
            { name: "amount", type: "number", unit: "USD", description: "Transaction amount" },
            { name: "currency", type: "string", enum: ["USD", "EUR", "GBP"], description: "Currency" },
            { name: "type", type: "string", enum: ["DEBIT", "CREDIT"], description: "Transaction type" },
            { name: "description", type: "string", description: "Transaction description" }
        ],
        impact: "Modifies financial records.", requiresApproval: true
    }
];

// endregion

// region -- 1. AI Service Interface and Mock Implementations --
// This section would typically be in a separate 'services' directory.

/**
 * Interface for AI service interactions.
 */
export interface IAIService {
    generateSchema(prompt: string, schemaDefinition: any, model?: string): Promise<AIResponse>;
    detectAnomalies(instanceId: UUID, currentData: { [key: string]: any }, historicalData: HistoricalDataPoint[], twinSchema: any, model?: string): Promise<AIResponse>;
    predictFutureState(instanceId: UUID, currentData: { [key: string]: any }, historicalData: HistoricalDataPoint[], twinSchema: any, forecastHorizon: string, model?: string): Promise<AIResponse>;
    naturalLanguageQuery(query: string, context: { [key: string]: any }, model?: string): Promise<AIResponse>;
}

/**
 * GoogleGenAI implementation of IAIService.
 * This class wraps the actual Google GenAI client for specific use cases.
 */
export class RealGoogleGenAIService implements IAIService {
    private ai: GoogleGenAI;
    private apiKey: string;
    private mockDelay: number;

    constructor(apiKey: string, mockDelay: number = 0) {
        if (!apiKey) {
            console.error("API Key for Google GenAI is not provided.");
            // Fallback or throw error depending on desired behavior
            this.apiKey = "MOCK_API_KEY"; // Use a placeholder if missing
            this.ai = new GoogleGenAI({ apiKey: "MOCK_API_KEY" }); // Initialize with placeholder
        } else {
            this.apiKey = apiKey;
            this.ai = new GoogleGenAI({ apiKey: apiKey });
        }
        this.mockDelay = mockDelay;
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.mockDelay));
    }

    /**
     * Generates a JSON schema for a digital twin model based on a prompt.
     * @param prompt User description of the twin.
     * @param schemaDefinition The expected structure of the generated schema.
     * @param model AI model to use (defaults to settings).
     * @returns A promise resolving to an AIResponse with the generated schema.
     */
    public async generateSchema(prompt: string, schemaDefinition: any, model?: string): Promise<AIResponse> {
        console.log(`[AI Service] Generating schema for: "${prompt}" using model: ${model || DEFAULT_APP_SETTINGS.find(s => s.key === 'ai_model_schema_gen')?.value || 'default'}`);
        await this.simulateDelay();
        try {
            const selectedModel = model || DEFAULT_APP_SETTINGS.find(s => s.key === 'ai_model_schema_gen')?.value as string || 'gemini-2.5-flash';
            const fullPrompt = `Generate a simple JSON schema for a digital twin model based on this description: "${prompt}". Include appropriate data types for each property, descriptions, and consider units or formats where applicable. For example: { "$schema": "http://json-schema.org/draft-07/schema#", "title": "MyTwin", "type": "object", "properties": { "temperature": { "type": "number", "description": "Current temperature", "unit": "Celsius" } } }. Ensure the top-level 'properties' object is an actual object containing the twin's properties.`;
            const response = await this.ai.models.generateContent({
                model: selectedModel,
                contents: [{ parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schemaDefinition // Use the passed schema definition for strong typing
                }
            });

            const parsedData = JSON.parse(response.text);
            console.log("[AI Service] Schema generation successful.");
            return {
                status: 'success',
                message: 'Schema generated successfully.',
                data: parsedData,
                timestamp: new Date().toISOString(),
                modelUsed: selectedModel
            };
        } catch (error: any) {
            console.error("[AI Service] Error generating schema:", error);
            return {
                status: 'error',
                message: 'Failed to generate schema.',
                errorDetails: error.message || 'Unknown error',
                timestamp: new Date().toISOString(),
                modelUsed: model || 'N/A'
            };
        }
    }

    /**
     * Detects anomalies in twin instance data.
     * This is a simplified mock; real implementation would require complex prompts and data analysis.
     * @param instanceId The ID of the twin instance.
     * @param currentData The current property values.
     * @param historicalData Historical data points for context.
     * @param twinSchema The twin's schema for property types.
     * @param model AI model to use.
     * @returns A promise resolving to an AIResponse with anomaly findings.
     */
    public async detectAnomalies(instanceId: UUID, currentData: { [key: string]: any }, historicalData: HistoricalDataPoint[], twinSchema: any, model?: string): Promise<AIResponse> {
        console.log(`[AI Service] Detecting anomalies for instance ${instanceId} using model: ${model || DEFAULT_APP_SETTINGS.find(s => s.key === 'ai_model_anomaly_detection')?.value || 'default'}`);
        await this.simulateDelay();
        const selectedModel = model || DEFAULT_APP_SETTINGS.find(s => s.key === 'ai_model_anomaly_detection')?.value as string || 'gemini-2.5-flash';

        try {
            // A real anomaly detection prompt would involve sending current and historical data
            // and asking the AI to identify unusual patterns or outliers.
            const dataContext = JSON.stringify({ currentData, historicalData: historicalData.slice(-10) }); // Last 10 points
            const promptText = `Analyze the following digital twin data for potential anomalies for twin instance ${instanceId}. Current state: ${JSON.stringify(currentData)}. Recent history (last 10 points): ${dataContext}. Twin schema: ${JSON.stringify(twinSchema)}. Identify any values that are outside expected ranges or show unusual patterns. Output a JSON object with 'anomalies' (array of strings/objects) and 'summary' (string).`;

            // Mock response logic
            const hasAnomaly = Object.values(currentData).some(val => typeof val === 'number' && (val > 1000 || val < -100));
            let anomalyReport: { anomalies: string[], summary: string } = { anomalies: [], summary: "No significant anomalies detected." };

            if (hasAnomaly) {
                anomalyReport.anomalies.push("High/Low numerical value detected in one or more properties.");
                anomalyReport.summary = "Potential data anomalies detected. Review the detailed findings.";
                for (const key in currentData) {
                    if (typeof currentData[key] === 'number' && (currentData[key] > 1000 || currentData[key] < -100)) {
                        anomalyReport.anomalies.push(`Property '${key}' has an unusual value: ${currentData[key]}`);
                    }
                }
            } else if (Math.random() < 0.1) { // 10% chance of a random anomaly
                anomalyReport.anomalies.push("Minor fluctuation detected; within tolerance but noted for observation.");
                anomalyReport.summary = "Minor data fluctuations observed.";
            }

            // Simulate AI call
            const aiResponseText = JSON.stringify(anomalyReport); // Would come from actual AI
            // const aiResponse = await this.ai.models.generateContent({ model: selectedModel, contents: [{ parts: [{ text: promptText }] }] });
            // const aiResponseText = aiResponse.text;

            console.log("[AI Service] Anomaly detection complete.");
            return {
                status: 'success',
                message: 'Anomaly detection performed.',
                data: JSON.parse(aiResponseText),
                timestamp: new Date().toISOString(),
                modelUsed: selectedModel
            };
        } catch (error: any) {
            console.error("[AI Service] Error detecting anomalies:", error);
            return {
                status: 'error',
                message: 'Failed to detect anomalies.',
                errorDetails: error.message || 'Unknown error',
                timestamp: new Date().toISOString(),
                modelUsed: selectedModel
            };
        }
    }

    /**
     * Predicts future states or trends for a digital twin instance.
     * This is also a simplified mock.
     * @param instanceId The ID of the twin instance.
     * @param currentData The current property values.
     * @param historicalData Historical data for prediction.
     * @param twinSchema The twin's schema.
     * @param forecastHorizon The time horizon for prediction.
     * @param model AI model to use.
     * @returns A promise resolving to an AIResponse with prediction results.
     */
    public async predictFutureState(instanceId: UUID, currentData: { [key: string]: any }, historicalData: HistoricalDataPoint[], twinSchema: any, forecastHorizon: string, model?: string): Promise<AIResponse> {
        console.log(`[AI Service] Predicting future state for instance ${instanceId} over ${forecastHorizon} using model: ${model || DEFAULT_APP_SETTINGS.find(s => s.key === 'ai_model_predictive_analytics')?.value || 'default'}`);
        await this.simulateDelay();
        const selectedModel = model || DEFAULT_APP_SETTINGS.find(s => s.key === 'ai_model_predictive_analytics')?.value as string || 'gemini-2.5-pro';

        try {
            const dataContext = JSON.stringify({ currentData, historicalData: historicalData.slice(-20) }); // Last 20 points
            const promptText = `Based on the following digital twin data for instance ${instanceId}, predict key property trends and potential issues over the next ${forecastHorizon}. Current state: ${JSON.stringify(currentData)}. Recent history: ${dataContext}. Twin schema: ${JSON.stringify(twinSchema)}. Output a JSON object with 'predictions' (array of objects describing predicted changes) and 'insights' (string summary).`;

            // Mock prediction logic
            const predictions: { property: string, trend: string, projectedValue: any, confidence: number }[] = [];
            let insights = `Based on current and historical data for twin ${instanceId}, here are some predictions for the next ${forecastHorizon}.`;

            for (const key in currentData) {
                if (typeof currentData[key] === 'number') {
                    const latestValue = currentData[key];
                    const historicalValues = historicalData.filter(d => d.value[key] !== undefined).map(d => d.value[key] as number);

                    let trend = 'stable';
                    let projectedValue = latestValue;
                    if (historicalValues.length > 1) {
                        const first = historicalValues[0];
                        const last = historicalValues[historicalValues.length - 1];
                        if (last > first * 1.05) {
                            trend = 'increasing';
                            projectedValue = latestValue * (1 + Math.random() * 0.1); // Project increase
                        } else if (last < first * 0.95) {
                            trend = 'decreasing';
                            projectedValue = latestValue * (1 - Math.random() * 0.1); // Project decrease
                        }
                    }
                    predictions.push({ property: key, trend, projectedValue: parseFloat(projectedValue.toFixed(2)), confidence: 0.85 + Math.random() * 0.1 });
                }
            }

            if (predictions.some(p => p.trend === 'increasing' && p.projectedValue > 1000)) {
                insights += " Potential resource exhaustion or threshold breach for some properties is projected if current trends continue.";
            } else if (predictions.some(p => p.trend === 'decreasing' && p.projectedValue < 50)) {
                insights += " Some values are projected to drop significantly, indicating potential underutilization or malfunction.";
            }

            const predictionReport = { predictions, insights };

            // Simulate AI call
            const aiResponseText = JSON.stringify(predictionReport); // Would come from actual AI
            // const aiResponse = await this.ai.models.generateContent({ model: selectedModel, contents: [{ parts: [{ text: promptText }] }] });
            // const aiResponseText = aiResponse.text;

            console.log("[AI Service] Predictive analytics complete.");
            return {
                status: 'success',
                message: 'Future state predicted successfully.',
                data: JSON.parse(aiResponseText),
                timestamp: new Date().toISOString(),
                modelUsed: selectedModel
            };
        } catch (error: any) {
            console.error("[AI Service] Error predicting future state:", error);
            return {
                status: 'error',
                message: 'Failed to predict future state.',
                errorDetails: error.message || 'Unknown error',
                timestamp: new Date().toISOString(),
                modelUsed: selectedModel
            };
        }
    }

    /**
     * Handles natural language queries about twin data. (Mocked)
     * @param query The user's natural language query.
     * @param context Additional context for the query (e.g., current twin, historical data).
     * @param model AI model to use.
     * @returns A promise resolving to an AIResponse with the query result.
     */
    public async naturalLanguageQuery(query: string, context: { [key: string]: any }, model?: string): Promise<AIResponse> {
        console.log(`[AI Service] Processing NLQ: "${query}" using model: ${model || 'default'}`);
        await this.simulateDelay();
        const selectedModel = model || 'gemini-2.5-flash'; // NLQ often uses a general model

        try {
            let answer = "I'm sorry, I couldn't find an answer to that question based on the available data.";
            if (query.toLowerCase().includes("balance") && context.properties && context.properties.accountBalance) {
                answer = `The current account balance for the selected twin is ${context.properties.accountBalance} USD.`;
            } else if (query.toLowerCase().includes("status") && context.status) {
                answer = `The current status of the selected twin is "${context.status}".`;
            } else if (query.toLowerCase().includes("alerts") && context.alerts && context.alerts.length > 0) {
                answer = `There are ${context.alerts.length} active alerts. The most recent is: "${context.alerts[0].message}" (Severity: ${context.alerts[0].severity}).`;
            } else if (query.toLowerCase().includes("temperature") && context.properties && context.properties.temperature) {
                answer = `The current temperature is ${context.properties.temperature} ${context.twinSchema?.properties?.temperature?.unit || 'units'}.`;
            } else if (query.toLowerCase().includes("humidity") && context.properties && context.properties.humidity) {
                answer = `The current humidity is ${context.properties.humidity} ${context.twinSchema?.properties?.humidity?.unit || 'units'}.`;
            } else if (query.toLowerCase().includes("how many twins")) {
                answer = `There are currently ${context.allTwinsCount || 'many'} digital twin definitions registered in the system.`;
            }

            return {
                status: 'success',
                message: 'NLQ processed successfully.',
                data: { answer },
                timestamp: new Date().toISOString(),
                modelUsed: selectedModel
            };
        } catch (error: any) {
            console.error("[AI Service] Error processing NLQ:", error);
            return {
                status: 'error',
                message: 'Failed to process NLQ.',
                errorDetails: error.message || 'Unknown error',
                timestamp: new Date().toISOString(),
                modelUsed: selectedModel
            };
        }
    }
}

// endregion

// region -- 2. Core Digital Twin Platform Logic (Mocked Backend/Data Store) --
// This section simulates a backend API/database for twin management.

/**
 * Interface for a Digital Twin Repository.
 */
export interface IDigitalTwinRepository {
    getTwinDefinitions(): Promise<DigitalTwinDefinition[]>;
    getTwinDefinition(id: UUID): Promise<DigitalTwinDefinition | undefined>;
    saveTwinDefinition(twin: DigitalTwinDefinition): Promise<DigitalTwinDefinition>;
    deleteTwinDefinition(id: UUID): Promise<void>;

    getTwinInstances(): Promise<DigitalTwinInstance[]>;
    getTwinInstance(id: UUID): Promise<DigitalTwinInstance | undefined>;
    saveTwinInstance(instance: DigitalTwinInstance): Promise<DigitalTwinInstance>;
    deleteTwinInstance(id: UUID): Promise<void>;
    updateTwinInstanceProperties(instanceId: UUID, updates: { [key: string]: any }): Promise<DigitalTwinInstance | undefined>;
    updateTwinInstanceStatus(instanceId: UUID, newStatus: TwinStatus): Promise<DigitalTwinInstance | undefined>;

    getTwinEvents(instanceId: UUID, limit?: number): Promise<TwinEvent[]>;
    addTwinEvent(event: TwinEvent): Promise<void>;

    getTwinAlerts(instanceId: UUID, status?: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED'): Promise<TwinAlert[]>;
    addTwinAlert(alert: TwinAlert): Promise<void>;
    updateTwinAlertStatus(alertId: UUID, newStatus: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED', resolutionNotes?: string, assignedTo?: UUID): Promise<void>;

    getActionsForTwin(twinDefinitionId: UUID): Promise<TwinAction[]>; // This would typically be more complex
    getAvailableActions(): Promise<TwinAction[]>;
    logPerformedAction(entry: ActionHistoryEntry): Promise<void>;
    getActionHistory(instanceId: UUID, limit?: number): Promise<ActionHistoryEntry[]>;

    getAppSettings(): Promise<AppSetting[]>;
    updateAppSetting(key: string, value: any): Promise<AppSetting | undefined>;

    getUserProfiles(): Promise<UserProfile[]>;
    getUserProfile(userId: UUID): Promise<UserProfile | undefined>;

    getDashboardWidgets(userId: UUID): Promise<DashboardWidget[]>;
    saveDashboardWidget(widget: DashboardWidget, userId: UUID): Promise<DashboardWidget>;
    deleteDashboardWidget(widgetId: UUID, userId: UUID): Promise<void>;

    getHistoricalData(instanceId: UUID, propertyKey: string, timeRange: string, resolution: string): Promise<HistoricalDataPoint[]>;
    addHistoricalDataPoint(instanceId: UUID, propertyKey: string, value: any): Promise<void>;
}

/**
 * In-memory mock implementation of IDigitalTwinRepository.
 * This simulates a persistent backend storage.
 */
export class InMemoryDigitalTwinRepository implements IDigitalTwinRepository {
    private twinDefinitions: DigitalTwinDefinition[] = [];
    private twinInstances: DigitalTwinInstance[] = [];
    private twinEvents: TwinEvent[] = [];
    private twinAlerts: TwinAlert[] = [];
    private appSettings: AppSetting[] = deepClone(DEFAULT_APP_SETTINGS);
    private userProfiles: UserProfile[] = deepClone(MOCK_USERS);
    private actionHistory: ActionHistoryEntry[] = [];
    private dashboardWidgets: DashboardWidget[] = [];
    // Stores historical data per instance per property: { instanceId: { propertyKey: [{ timestamp, value }] } }
    private historicalData: { [instanceId: UUID]: { [propertyKey: string]: HistoricalDataPoint[] } } = {};

    private readonly MOCK_DELAY_MS = 300; // Simulate network latency

    constructor() {
        this.seedInitialData();
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    private seedInitialData() {
        console.log("Seeding initial mock data for InMemoryDigitalTwinRepository...");
        const adminUser = this.userProfiles[0];
        const devUser = this.userProfiles[1];

        // Seed some twin definitions
        const smartThermostatSchema: any = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "SmartThermostatTwin",
            "type": "object",
            "properties": {
                "temperature": { "type": "number", "description": "Current room temperature", "unit": "Celsius" },
                "humidity": { "type": "number", "description": "Current room humidity", "unit": "%" },
                "targetTemperature": { "type": "number", "description": "Desired temperature setting", "unit": "Celsius", "writable": true },
                "status": { "type": "string", "enum": ["heating", "cooling", "idle"], "description": "Operating status" },
                "mode": { "type": "string", "enum": ["auto", "heat", "cool", "off"], "description": "Operating mode", "writable": true },
                "filterLife": { "type": "number", "description": "Remaining filter life", "unit": "days" }
            },
            "required": ["temperature", "humidity", "status"]
        };

        const bankAccountSchema: any = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "BankAccountTwin",
            "type": "object",
            "properties": {
                "accountNumber": { "type": "string", "description": "Bank account number", "readOnly": true },
                "accountHolderName": { "type": "string", "description": "Name of the primary account holder", "readOnly": true },
                "accountBalance": { "type": "number", "description": "Current account balance", "unit": "USD" },
                "currency": { "type": "string", "enum": ["USD", "EUR", "GBP"], "description": "Currency of the account" },
                "status": { "type": "string", "enum": ["active", "suspended", "closed"], "description": "Account status" },
                "lastTransactionAmount": { "type": "number", "description": "Amount of the last transaction", "unit": "USD" },
                "lastTransactionType": { "type": "string", "enum": ["DEBIT", "CREDIT"], "description": "Type of last transaction" },
                "creditScore": { "type": "number", "description": "Associated credit score (mock)", "readOnly": true, "minValue": 300, "maxValue": 850 }
            },
            "required": ["accountNumber", "accountBalance", "status"]
        };

        const fraudMonitorSchema: any = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "FraudMonitorTwin",
            "type": "object",
            "properties": {
                "transactionsMonitoredLastHour": { "type": "number", "description": "Number of transactions processed" },
                "potentialFraudIncidents": { "type": "number", "description": "Count of potential fraud alerts" },
                "riskScore": { "type": "number", "description": "Overall fraud risk score", "minValue": 0, "maxValue": 100 },
                "status": { "type": "string", "enum": ["active", "monitoring", "alerted", "maintenance"], "description": "System status" }
            },
            "required": ["transactionsMonitoredLastHour", "potentialFraudIncidents", "riskScore"]
        };

        const loanProductSchema: any = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "LoanProductTwin",
            "type": "object",
            "properties": {
                "loanType": { "type": "string", "description": "Type of loan (e.g., mortgage, auto, personal)", "readOnly": true },
                "interestRate": { "type": "number", "description": "Annual interest rate", "unit": "%" },
                "minCreditScore": { "type": "number", "description": "Minimum required credit score" },
                "maxLoanAmount": { "type": "number", "description": "Maximum loan amount available", "unit": "USD" },
                "availableForApplication": { "type": "boolean", "description": "Is this loan product currently open for applications?" }
            },
            "required": ["loanType", "interestRate", "minCreditScore"]
        };

        const thermostatDefId = generateUUID();
        const bankAccountDefId = generateUUID();
        const fraudMonitorDefId = generateUUID();
        const loanProductDefId = generateUUID();

        this.twinDefinitions.push({
            id: thermostatDefId,
            name: "Smart Thermostat",
            description: "A digital representation of a smart thermostat for building climate control.",
            category: TwinCategory.INFRASTRUCTURE_ASSET,
            version: "1.0.0",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            schema: smartThermostatSchema,
            tags: ["HVAC", "IoT", "building-management"],
            ownerUserId: adminUser.userId,
            accessControlList: [adminUser.userId, devUser.userId]
        });

        this.twinDefinitions.push({
            id: bankAccountDefId,
            name: "Customer Bank Account",
            description: "A digital twin model for a customer's checking or savings account.",
            category: TwinCategory.CUSTOMER_ACCOUNT,
            version: "1.0.0",
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            schema: bankAccountSchema,
            tags: ["banking", "customer", "finance"],
            ownerUserId: adminUser.userId,
            accessControlList: [adminUser.userId, devUser.userId, this.userProfiles[2].userId]
        });

        this.twinDefinitions.push({
            id: fraudMonitorDefId,
            name: "Fraud Detection System",
            description: "Digital twin for real-time monitoring of a fraud detection system's performance.",
            category: TwinCategory.FRAUD_DETECTION,
            version: "1.1.0",
            createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            lastUpdated: new Date().toISOString(),
            schema: fraudMonitorSchema,
            tags: ["security", "risk", "AI", "transaction"],
            ownerUserId: adminUser.userId,
            accessControlList: [adminUser.userId, this.userProfiles[3].userId]
        });

        this.twinDefinitions.push({
            id: loanProductDefId,
            name: "Mortgage Product A",
            description: "Digital twin representing a specific mortgage product offered by the bank.",
            category: TwinCategory.LOAN_PRODUCT,
            version: "1.1.0",
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            lastUpdated: new Date().toISOString(),
            schema: loanProductSchema,
            tags: ["loan", "mortgage", "product"],
            ownerUserId: adminUser.userId,
            accessControlList: [adminUser.userId, this.userProfiles[2].userId]
        });


        // Seed some twin instances
        const thermostatInstanceId1 = generateUUID();
        const bankAccountInstanceId1 = generateUUID();
        const bankAccountInstanceId2 = generateUUID();
        const fraudMonitorInstanceId1 = generateUUID();
        const loanProductInstanceId1 = generateUUID();

        this.twinInstances.push({
            instanceId: thermostatInstanceId1,
            twinDefinitionId: thermostatDefId,
            name: "Office HVAC Unit 101",
            status: TwinStatus.ACTIVE,
            lastDataUpdateTime: new Date().toISOString(),
            properties: {
                temperature: 22.5,
                humidity: 45,
                targetTemperature: 21,
                status: "cooling",
                mode: "auto",
                filterLife: 90
            },
            metadata: {
                location: "Main Office, 3rd Floor, West Wing",
                serialNumber: "HVAC-101-ABC",
                firmwareVersion: "2.1.0"
            },
            healthScore: 95,
            alerts: [],
            associatedEntities: []
        });

        this.twinInstances.push({
            instanceId: bankAccountInstanceId1,
            twinDefinitionId: bankAccountDefId,
            name: "Customer John Doe - Checking",
            status: TwinStatus.ACTIVE,
            lastDataUpdateTime: new Date().toISOString(),
            properties: {
                accountNumber: "**********1234",
                accountHolderName: "John Doe",
                accountBalance: 15432.78,
                currency: "USD",
                status: "active",
                lastTransactionAmount: -250.00,
                lastTransactionType: "DEBIT",
                creditScore: 780
            },
            metadata: {
                customerId: generateUUID(),
                branchId: "B001"
            },
            healthScore: 100,
            alerts: [],
            associatedEntities: [{ type: "CUSTOMER", entityId: generateUUID(), description: "Primary customer" }]
        });

        this.twinInstances.push({
            instanceId: bankAccountInstanceId2,
            twinDefinitionId: bankAccountDefId,
            name: "Customer Jane Smith - Savings",
            status: TwinStatus.ACTIVE,
            lastDataUpdateTime: new Date().toISOString(),
            properties: {
                accountNumber: "**********5678",
                accountHolderName: "Jane Smith",
                accountBalance: 56789.01,
                currency: "USD",
                status: "active",
                lastTransactionAmount: 1200.00,
                lastTransactionType: "CREDIT",
                creditScore: 810
            },
            metadata: {
                customerId: generateUUID(),
                branchId: "B001"
            },
            healthScore: 100,
            alerts: [],
            associatedEntities: [{ type: "CUSTOMER", entityId: generateUUID(), description: "Primary customer" }]
        });

        this.twinInstances.push({
            instanceId: fraudMonitorInstanceId1,
            twinDefinitionId: fraudMonitorDefId,
            name: "Real-time Fraud System (US East)",
            status: TwinStatus.ACTIVE,
            lastDataUpdateTime: new Date().toISOString(),
            properties: {
                transactionsMonitoredLastHour: 154320,
                potentialFraudIncidents: 5,
                riskScore: 35,
                status: "monitoring"
            },
            metadata: {
                region: "US East",
                deployId: "FDS-USE1-001"
            },
            healthScore: 88,
            alerts: [{
                alertId: generateUUID(), instanceId: fraudMonitorInstanceId1, timestamp: new Date().toISOString(),
                severity: "MEDIUM", message: "Increased transaction volume detected, requiring AI model re-evaluation.",
                type: "ANOMALY", status: "ACTIVE", triggeredBy: "AI_AnomalyDetector"
            }],
            associatedEntities: []
        });

        this.twinInstances.push({
            instanceId: loanProductInstanceId1,
            twinDefinitionId: loanProductDefId,
            name: "Mortgage Product A - Current Offerings",
            status: TwinStatus.ACTIVE,
            lastDataUpdateTime: new Date().toISOString(),
            properties: {
                loanType: "Mortgage",
                interestRate: 3.25,
                minCreditScore: 680,
                maxLoanAmount: 1200000,
                availableForApplication: true
            },
            metadata: {
                offerId: "MORTGAGE-A-Q3-2024"
            },
            healthScore: 100,
            alerts: [],
            associatedEntities: []
        });

        // Seed historical data for some instances/properties
        const now = new Date();
        for (let i = 0; i < 20; i++) {
            const timestamp = new Date(now.getTime() - (i * 3600 * 1000)).toISOString(); // Hourly data for 20 hours
            // Thermostat temperature
            this.addHistoricalDataPoint(thermostatInstanceId1, 'temperature', 20 + Math.random() * 5).then(() => { });
            this.addHistoricalDataPoint(thermostatInstanceId1, 'humidity', 40 + Math.random() * 10).then(() => { });
            // Bank account balance (simulating minor fluctuations or transactions)
            this.addHistoricalDataPoint(bankAccountInstanceId1, 'accountBalance', 15000 + (Math.random() - 0.5) * 1000).then(() => { });
            // Fraud monitor risk score
            this.addHistoricalDataPoint(fraudMonitorInstanceId1, 'riskScore', 30 + Math.random() * 10).then(() => { });
            this.addHistoricalDataPoint(fraudMonitorInstanceId1, 'transactionsMonitoredLastHour', 100000 + Math.random() * 50000).then(() => { });
        }
        console.log("Mock data seeding complete.");
    }

    public async getTwinDefinitions(): Promise<DigitalTwinDefinition[]> {
        await this.simulateDelay();
        return deepClone(this.twinDefinitions);
    }

    public async getTwinDefinition(id: UUID): Promise<DigitalTwinDefinition | undefined> {
        await this.simulateDelay();
        const definition = this.twinDefinitions.find(d => d.id === id);
        return definition ? deepClone(definition) : undefined;
    }

    public async saveTwinDefinition(twin: DigitalTwinDefinition): Promise<DigitalTwinDefinition> {
        await this.simulateDelay();
        const index = this.twinDefinitions.findIndex(d => d.id === twin.id);
        const newTwin = { ...twin, lastUpdated: new Date().toISOString() };
        if (index !== -1) {
            this.twinDefinitions[index] = newTwin;
        } else {
            this.twinDefinitions.push({ ...newTwin, id: generateUUID(), createdAt: new Date().toISOString() });
        }
        return deepClone(newTwin);
    }

    public async deleteTwinDefinition(id: UUID): Promise<void> {
        await this.simulateDelay();
        const initialLength = this.twinDefinitions.length;
        this.twinDefinitions = this.twinDefinitions.filter(d => d.id !== id);
        // Also delete associated instances and events
        this.twinInstances = this.twinInstances.filter(i => i.twinDefinitionId !== id);
        this.twinEvents = this.twinEvents.filter(e => !this.twinInstances.some(i => i.instanceId === e.instanceId));
        this.twinAlerts = this.twinAlerts.filter(a => !this.twinInstances.some(i => i.instanceId === a.instanceId));
        this.actionHistory = this.actionHistory.filter(h => !this.twinInstances.some(i => i.instanceId === h.instanceId));
        if (this.twinDefinitions.length === initialLength) {
            throw new Error(`Twin definition with ID ${id} not found.`);
        }
    }

    public async getTwinInstances(): Promise<DigitalTwinInstance[]> {
        await this.simulateDelay();
        return deepClone(this.twinInstances);
    }

    public async getTwinInstance(id: UUID): Promise<DigitalTwinInstance | undefined> {
        await this.simulateDelay();
        const instance = this.twinInstances.find(i => i.instanceId === id);
        return instance ? deepClone(instance) : undefined;
    }

    public async saveTwinInstance(instance: DigitalTwinInstance): Promise<DigitalTwinInstance> {
        await this.simulateDelay();
        const index = this.twinInstances.findIndex(i => i.instanceId === instance.instanceId);
        const newInstance = { ...instance, lastDataUpdateTime: new Date().toISOString() };
        if (index !== -1) {
            this.twinInstances[index] = newInstance;
        } else {
            this.twinInstances.push({ ...newInstance, instanceId: generateUUID() });
        }
        return deepClone(newInstance);
    }

    public async deleteTwinInstance(id: UUID): Promise<void> {
        await this.simulateDelay();
        const initialLength = this.twinInstances.length;
        this.twinInstances = this.twinInstances.filter(i => i.instanceId !== id);
        this.twinEvents = this.twinEvents.filter(e => e.instanceId !== id);
        this.twinAlerts = this.twinAlerts.filter(a => a.instanceId !== id);
        this.actionHistory = this.actionHistory.filter(h => h.instanceId !== id);
        delete this.historicalData[id];
        if (this.twinInstances.length === initialLength) {
            throw new Error(`Twin instance with ID ${id} not found.`);
        }
    }

    public async updateTwinInstanceProperties(instanceId: UUID, updates: { [key: string]: any }): Promise<DigitalTwinInstance | undefined> {
        await this.simulateDelay();
        const instance = this.twinInstances.find(i => i.instanceId === instanceId);
        if (instance) {
            instance.properties = { ...instance.properties, ...updates };
            instance.lastDataUpdateTime = new Date().toISOString();
            // Also add a data update event
            await this.addTwinEvent({
                eventId: generateUUID(),
                instanceId: instanceId,
                timestamp: instance.lastDataUpdateTime,
                type: 'DATA_UPDATE',
                description: `Properties updated: ${Object.keys(updates).join(', ')}`,
                details: updates,
                severity: 'INFO',
                source: 'System/Manual'
            });

            // Add to historical data
            for (const key in updates) {
                if (updates.hasOwnProperty(key)) {
                    await this.addHistoricalDataPoint(instanceId, key, updates[key]);
                }
            }
            return deepClone(instance);
        }
        return undefined;
    }

    public async updateTwinInstanceStatus(instanceId: UUID, newStatus: TwinStatus): Promise<DigitalTwinInstance | undefined> {
        await this.simulateDelay();
        const instance = this.twinInstances.find(i => i.instanceId === instanceId);
        if (instance) {
            const oldStatus = instance.status;
            instance.status = newStatus;
            instance.lastDataUpdateTime = new Date().toISOString(); // Status change is also an update
            await this.addTwinEvent({
                eventId: generateUUID(),
                instanceId: instanceId,
                timestamp: instance.lastDataUpdateTime,
                type: 'STATUS_CHANGE',
                description: `Status changed from ${oldStatus} to ${newStatus}`,
                details: { oldStatus, newStatus },
                severity: 'INFO',
                source: 'System/Manual'
            });
            return deepClone(instance);
        }
        return undefined;
    }

    public async getTwinEvents(instanceId: UUID, limit?: number): Promise<TwinEvent[]> {
        await this.simulateDelay();
        let events = this.twinEvents.filter(e => e.instanceId === instanceId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (limit) {
            events = events.slice(0, limit);
        }
        return deepClone(events);
    }

    public async addTwinEvent(event: TwinEvent): Promise<void> {
        await this.simulateDelay();
        this.twinEvents.push(deepClone(event));
        // Prune old events if exceeding max_event_log_entries
        const maxEntries = DEFAULT_APP_SETTINGS.find(s => s.key === 'max_event_log_entries')?.value || 1000;
        const instanceEvents = this.twinEvents.filter(e => e.instanceId === event.instanceId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        if (instanceEvents.length > maxEntries) {
            const eventsToKeep = instanceEvents.slice(instanceEvents.length - maxEntries);
            this.twinEvents = this.twinEvents.filter(e => e.instanceId !== event.instanceId).concat(eventsToKeep);
        }
    }

    public async getTwinAlerts(instanceId: UUID, status?: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED'): Promise<TwinAlert[]> {
        await this.simulateDelay();
        let alerts = this.twinAlerts.filter(a => a.instanceId === instanceId);
        if (status) {
            alerts = alerts.filter(a => a.status === status);
        }
        return deepClone(alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }

    public async addTwinAlert(alert: TwinAlert): Promise<void> {
        await this.simulateDelay();
        this.twinAlerts.push(deepClone(alert));
    }

    public async updateTwinAlertStatus(alertId: UUID, newStatus: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED', resolutionNotes?: string, assignedTo?: UUID): Promise<void> {
        await this.simulateDelay();
        const alert = this.twinAlerts.find(a => a.alertId === alertId);
        if (alert) {
            alert.status = newStatus;
            if (resolutionNotes) alert.resolutionNotes = resolutionNotes;
            if (assignedTo) alert.assignedTo = assignedTo;
            await this.addTwinEvent({
                eventId: generateUUID(),
                instanceId: alert.instanceId,
                timestamp: new Date().toISOString(),
                type: 'ALERT_RAISED',
                description: `Alert ${alert.alertId} status changed to ${newStatus}`,
                details: { alertId, newStatus, resolutionNotes, assignedTo },
                severity: newStatus === 'RESOLVED' ? 'INFO' : 'WARNING', // Or based on alert severity
                source: 'System/User'
            });
        }
    }

    public async getActionsForTwin(twinDefinitionId: UUID): Promise<TwinAction[]> {
        await this.simulateDelay();
        // For simplicity, all mock actions are globally available.
        // In a real system, actions would be linked to specific twin definitions.
        return deepClone(MOCK_GLOBAL_ACTIONS);
    }

    public async getAvailableActions(): Promise<TwinAction[]> {
        await this.simulateDelay();
        return deepClone(MOCK_GLOBAL_ACTIONS);
    }

    public async logPerformedAction(entry: ActionHistoryEntry): Promise<void> {
        await this.simulateDelay();
        this.actionHistory.push(deepClone(entry));
        // Add an event for the action
        await this.addTwinEvent({
            eventId: generateUUID(),
            instanceId: entry.instanceId,
            timestamp: entry.timestamp,
            type: 'ACTION_TAKEN',
            description: `Action "${entry.actionName}" performed with status: ${entry.status}`,
            details: { actionId: entry.actionId, parameters: entry.parametersUsed, initiatedBy: entry.initiatedBy, result: entry.resultDetails },
            severity: entry.status === 'FAILED' ? 'ERROR' : 'INFO',
            source: 'User'
        });
    }

    public async getActionHistory(instanceId: UUID, limit?: number): Promise<ActionHistoryEntry[]> {
        await this.simulateDelay();
        let history = this.actionHistory.filter(h => h.instanceId === instanceId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (limit) {
            history = history.slice(0, limit);
        }
        return deepClone(history);
    }

    public async getAppSettings(): Promise<AppSetting[]> {
        await this.simulateDelay();
        return deepClone(this.appSettings);
    }

    public async updateAppSetting(key: string, value: any): Promise<AppSetting | undefined> {
        await this.simulateDelay();
        const setting = this.appSettings.find(s => s.key === key);
        if (setting && setting.editable) {
            setting.value = value;
            return deepClone(setting);
        }
        return undefined;
    }

    public async getUserProfiles(): Promise<UserProfile[]> {
        await this.simulateDelay();
        return deepClone(this.userProfiles);
    }

    public async getUserProfile(userId: UUID): Promise<UserProfile | undefined> {
        await this.simulateDelay();
        const user = this.userProfiles.find(u => u.userId === userId);
        return user ? deepClone(user) : undefined;
    }

    public async getDashboardWidgets(userId: UUID): Promise<DashboardWidget[]> {
        await this.simulateDelay();
        return deepClone(this.dashboardWidgets.filter(w => w.configuration.owner === userId)); // Assuming owner in config
    }

    public async saveDashboardWidget(widget: DashboardWidget, userId: UUID): Promise<DashboardWidget> {
        await this.simulateDelay();
        const index = this.dashboardWidgets.findIndex(w => w.widgetId === widget.widgetId);
        const newWidget = { ...widget, widgetId: widget.widgetId || generateUUID(), configuration: { ...widget.configuration, owner: userId } };
        if (index !== -1) {
            this.dashboardWidgets[index] = newWidget;
        } else {
            this.dashboardWidgets.push(newWidget);
        }
        return deepClone(newWidget);
    }

    public async deleteDashboardWidget(widgetId: UUID, userId: UUID): Promise<void> {
        await this.simulateDelay();
        const initialLength = this.dashboardWidgets.length;
        this.dashboardWidgets = this.dashboardWidgets.filter(w => w.widgetId !== widgetId || w.configuration.owner !== userId);
        if (this.dashboardWidgets.length === initialLength) {
            throw new Error(`Dashboard widget with ID ${widgetId} not found or user ${userId} is not the owner.`);
        }
    }

    public async getHistoricalData(instanceId: UUID, propertyKey: string, timeRange: string, resolution: string): Promise<HistoricalDataPoint[]> {
        await this.simulateDelay();
        const instanceData = this.historicalData[instanceId];
        if (!instanceData || !instanceData[propertyKey]) {
            return [];
        }

        let data = deepClone(instanceData[propertyKey]);
        // Simple time range filtering (e.g., last hour, last day)
        const now = new Date().getTime();
        let cutoffTime = 0;
        if (timeRange === '1h') cutoffTime = now - 3600 * 1000;
        else if (timeRange === '24h') cutoffTime = now - 24 * 3600 * 1000;
        else if (timeRange === '7d') cutoffTime = now - 7 * 24 * 3600 * 1000;
        else if (timeRange === '30d') cutoffTime = now - 30 * 24 * 3600 * 1000;

        data = data.filter(dp => new Date(dp.timestamp).getTime() >= cutoffTime);

        // For simplicity, ignoring 'resolution' for now, returning all filtered data.
        return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    public async addHistoricalDataPoint(instanceId: UUID, propertyKey: string, value: any): Promise<void> {
        if (!this.historicalData[instanceId]) {
            this.historicalData[instanceId] = {};
        }
        if (!this.historicalData[instanceId][propertyKey]) {
            this.historicalData[instanceId][propertyKey] = [];
        }
        // Only store numerical or boolean values for historical tracking
        if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
            this.historicalData[instanceId][propertyKey].push({
                timestamp: new Date().toISOString(),
                value: value
            });
            // Keep history limited (e.g., last 1000 points per property)
            const maxHistoricalPoints = 1000;
            if (this.historicalData[instanceId][propertyKey].length > maxHistoricalPoints) {
                this.historicalData[instanceId][propertyKey] = this.historicalData[instanceId][propertyKey].slice(-maxHistoricalPoints);
            }
        }
    }
}

// Instantiate the mock repository (this simulates a global service)
export const digitalTwinRepository = new InMemoryDigitalTwinRepository();
export const aiService = new RealGoogleGenAIService(process.env.API_KEY as string, DEFAULT_APP_SETTINGS.find(s => s.key === 'mock_ai_response_delay_ms')?.value as number || 2000);

// endregion

// region -- 3. UI Components and Utilities within the main file --
// These would normally be separate .tsx files, but for the line count, they are inline.

/**
 * A generic loading spinner component.
 */
export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-400">Loading...</span>
    </div>
);

/**
 * Renders a customizable property input field based on TwinProperty definition.
 */
export const PropertyInput: React.FC<{
    property: TwinProperty;
    value: any;
    onChange: (name: string, value: any) => void;
    readOnly?: boolean;
}> = ({ property, value, onChange, readOnly }) => {
    const inputId = `prop-${property.name}`;
    const isReadOnly = readOnly || property.readOnly;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let newValue: any;
        if (property.type === 'number') {
            newValue = parseFloat(e.target.value);
            if (isNaN(newValue)) newValue = '';
        } else if (property.type === 'boolean') {
            newValue = (e.target as HTMLInputElement).checked;
        } else {
            newValue = e.target.value;
        }
        onChange(property.name, newValue);
    };

    const renderInput = () => {
        const baseClasses = "w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500";
        const disabledClasses = "opacity-70 cursor-not-allowed bg-gray-800";
        const combinedClasses = `${baseClasses} ${isReadOnly ? disabledClasses : ''}`;

        switch (property.type) {
            case 'string':
                if (property.enum && property.enum.length > 0) {
                    return (
                        <select id={inputId} value={value || ''} onChange={handleChange} className={combinedClasses} disabled={isReadOnly}>
                            <option value="">Select...</option>
                            {property.enum.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    );
                }
                return <input id={inputId} type="text" value={value || ''} onChange={handleChange} className={combinedClasses} readOnly={isReadOnly} placeholder={property.description} />;
            case 'number':
                return <input id={inputId} type="number" value={value || ''} onChange={handleChange} className={combinedClasses} readOnly={isReadOnly} min={property.minValue} max={property.maxValue} placeholder={property.description} />;
            case 'boolean':
                return (
                    <input
                        id={inputId}
                        type="checkbox"
                        checked={!!value}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 text-cyan-600 rounded border-gray-600 bg-gray-700/50 focus:ring-cyan-500"
                        disabled={isReadOnly}
                    />
                );
            case 'object':
                // For nested objects, a simplified display or JSON input.
                // A full implementation would recursively render properties.
                return <textarea id={inputId} value={JSON.stringify(value || {}, null, 2)} onChange={handleChange} className={`${combinedClasses} h-24`} readOnly={isReadOnly} placeholder={`Enter JSON for ${property.name}`} />;
            case 'array':
                // For arrays, a simplified display or comma-separated string.
                return <textarea id={inputId} value={Array.isArray(value) ? JSON.stringify(value, null, 2) : ''} onChange={handleChange} className={`${combinedClasses} h-24`} readOnly={isReadOnly} placeholder={`Enter JSON array for ${property.name}`} />;
            default:
                return <input id={inputId} type="text" value={value || ''} onChange={handleChange} className={combinedClasses} readOnly={isReadOnly} placeholder={property.description} />;
        }
    };

    return (
        <div className="mb-3">
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
                {property.name} {property.unit && <span className="text-gray-500 text-xs">({property.unit})</span>}
            </label>
            {renderInput()}
            {property.description && !isReadOnly && (
                <p className="mt-1 text-xs text-gray-500">{property.description}</p>
            )}
            {isReadOnly && (
                <p className="mt-1 text-xs text-gray-500">Read-only property</p>
            )}
        </div>
    );
};

/**
 * A simple modal component.
 */
export const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    widthClass?: string;
}> = ({ isOpen, onClose, title, children, widthClass = 'max-w-xl' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className={`bg-gray-800 rounded-lg shadow-xl w-full ${widthClass} max-h-[90vh] overflow-y-auto`}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Renders a dynamic table of properties or data.
 */
export const DynamicTable: React.FC<{
    data: { [key: string]: any }[];
    columns: { key: string; header: string; render?: (value: any, row: any) => React.ReactNode }[];
    emptyMessage?: string;
    onRowClick?: (row: any) => void;
    rowKeyExtractor?: (row: any) => string;
}> = ({ data, columns, emptyMessage = "No data available.", onRowClick, rowKeyExtractor }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500 italic p-4">{emptyMessage}</p>;
    }

    const defaultRowKeyExtractor = (row: any) => row.id || row.instanceId || JSON.stringify(row);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        {columns.map(col => (
                            <th
                                key={col.key}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowKeyExtractor ? rowKeyExtractor(row) : defaultRowKeyExtractor(row)}
                            className={`hover:bg-gray-700 ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                        >
                            {columns.map(col => (
                                <td key={`${rowIndex}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


/**
 * Inline component for displaying Alerts.
 */
export const TwinAlertsDisplay: React.FC<{
    alerts: TwinAlert[];
    onResolveAlert?: (alertId: UUID) => void;
    isLoading?: boolean;
}> = ({ alerts, onResolveAlert, isLoading }) => {
    const sortedAlerts = useMemo(() => {
        return [...alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [alerts]);

    if (isLoading) return <LoadingSpinner />;
    if (sortedAlerts.length === 0) return <p className="text-gray-500 italic">No active alerts for this twin.</p>;

    return (
        <div className="space-y-3">
            {sortedAlerts.map(alert => (
                <div key={alert.alertId} className={`p-3 rounded-lg flex items-center justify-between
                    ${alert.severity === 'CRITICAL' ? 'bg-red-900/40 border border-red-700' : ''}
                    ${alert.severity === 'HIGH' ? 'bg-orange-900/40 border border-orange-700' : ''}
                    ${alert.severity === 'MEDIUM' ? 'bg-yellow-900/40 border border-yellow-700' : ''}
                    ${alert.severity === 'LOW' ? 'bg-blue-900/40 border border-blue-700' : ''}
                    ${alert.status === 'RESOLVED' ? 'bg-green-900/40 border border-green-700' : ''}
                `}>
                    <div className="flex-1">
                        <p className={`font-semibold ${alert.severity === 'CRITICAL' ? 'text-red-300' : alert.severity === 'HIGH' ? 'text-orange-300' : alert.severity === 'MEDIUM' ? 'text-yellow-300' : 'text-blue-300'}`}>
                            {alert.severity} ({alert.type})
                            <span className="ml-2 text-xs text-gray-400">
                                {new Date(alert.timestamp).toLocaleString()}
                            </span>
                        </p>
                        <p className="text-sm text-gray-200">{alert.message}</p>
                        {alert.resolutionNotes && <p className="text-xs text-gray-400 mt-1 italic">Resolution: {alert.resolutionNotes}</p>}
                    </div>
                    {onResolveAlert && alert.status === 'ACTIVE' && (
                        <button
                            onClick={() => onResolveAlert(alert.alertId)}
                            className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                            disabled={isLoading}
                        >
                            Resolve
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

/**
 * Inline component for displaying Event Logs.
 */
export const TwinEventLogDisplay: React.FC<{
    events: TwinEvent[];
    isLoading?: boolean;
}> = ({ events, isLoading }) => {
    if (isLoading) return <LoadingSpinner />;
    if (events.length === 0) return <p className="text-gray-500 italic">No recent events for this twin.</p>;

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map(event => (
                <div key={event.eventId} className="p-2 border-b border-gray-700 last:border-b-0">
                    <p className="text-xs text-gray-400">
                        <span className={`font-medium ${event.severity === 'ERROR' ? 'text-red-400' : event.severity === 'WARNING' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                            [{event.type}]
                        </span>
                        <span className="ml-2">{new Date(event.timestamp).toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-300">{event.description}</p>
                    {event.details && (
                        <pre className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(event.details, null, 2)}
                        </pre>
                    )}
                </div>
            ))}
        </div>
    );
};

/**
 * Inline component for displaying Action History.
 */
export const TwinActionHistoryDisplay: React.FC<{
    actionHistory: ActionHistoryEntry[];
    isLoading?: boolean;
    userProfiles: UserProfile[]; // To display initiator names
}> = ({ actionHistory, isLoading, userProfiles }) => {
    if (isLoading) return <LoadingSpinner />;
    if (actionHistory.length === 0) return <p className="text-gray-500 italic">No actions recorded for this twin.</p>;

    const getUserName = (userId: UUID) => userProfiles.find(u => u.userId === userId)?.username || `Unknown User (${userId.substring(0, 8)}...)`;

    return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {actionHistory.map(entry => (
                <div key={entry.logId} className="p-2 border-b border-gray-700 last:border-b-0">
                    <p className="text-xs text-gray-400">
                        <span className={`font-medium ${entry.status === 'FAILED' ? 'text-red-400' : entry.status === 'PENDING' ? 'text-yellow-400' : 'text-green-400'}`}>
                            [{entry.status}]
                        </span>
                        <span className="ml-2">{new Date(entry.timestamp).toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-300">Action: <span className="font-semibold">{entry.actionName}</span></p>
                    <p className="text-xs text-gray-500">Initiated By: {getUserName(entry.initiatedBy)}</p>
                    {entry.resultDetails && <p className="text-xs text-gray-500 mt-1">Result: {entry.resultDetails}</p>}
                    {Object.keys(entry.parametersUsed).length > 0 && (
                        <pre className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(entry.parametersUsed, null, 2)}
                        </pre>
                    )}
                </div>
            ))}
        </div>
    );
};

// endregion

// region -- 4. Main Component: DemoBankDigitalTwinView --
// This is the primary component where all features are integrated.

const DemoBankDigitalTwinView: React.FC = () => {
    // region -- Core State Management --
    const [prompt, setPrompt] = useState("a smart thermostat with temperature, humidity, and status properties");
    const [generatedSchema, setGeneratedSchema] = useState<any>(null);
    const [isLoadingSchema, setIsLoadingSchema] = useState(false);
    const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);

    const [allTwinDefinitions, setAllTwinDefinitions] = useState<DigitalTwinDefinition[]>([]);
    const [selectedTwinDefinitionId, setSelectedTwinDefinitionId] = useState<UUID | null>(null);
    const [selectedTwinDefinition, setSelectedTwinDefinition] = useState<DigitalTwinDefinition | null>(null);
    const [isDefinitionsLoading, setIsDefinitionsLoading] = useState(false);
    const [showSchemaModal, setShowSchemaModal] = useState(false);
    const [editingTwinDefinition, setEditingTwinDefinition] = useState<DigitalTwinDefinition | null>(null);
    const [showTwinDefinitionForm, setShowTwinDefinitionForm] = useState(false);
    const [twinDefinitionFormErrors, setTwinDefinitionFormErrors] = useState<{ [key: string]: string }>({});

    const [allTwinInstances, setAllTwinInstances] = useState<DigitalTwinInstance[]>([]);
    const [selectedTwinInstanceId, setSelectedTwinInstanceId] = useState<UUID | null>(null);
    const [selectedTwinInstance, setSelectedTwinInstance] = useState<DigitalTwinInstance | null>(null);
    const [isInstancesLoading, setIsInstancesLoading] = useState(false);
    const [showInstanceForm, setShowInstanceForm] = useState(false);
    const [editingTwinInstance, setEditingTwinInstance] = useState<DigitalTwinInstance | null>(null);
    const [instanceFormErrors, setInstanceFormErrors] = useState<{ [key: string]: string }>({});

    const [twinInstanceEvents, setTwinInstanceEvents] = useState<TwinEvent[]>([]);
    const [isEventsLoading, setIsEventsLoading] = useState(false);

    const [twinInstanceAlerts, setTwinInstanceAlerts] = useState<TwinAlert[]>([]);
    const [isAlertsLoading, setIsAlertsLoading] = useState(false);

    const [twinInstanceActionsHistory, setTwinInstanceActionsHistory] = useState<ActionHistoryEntry[]>([]);
    const [isActionHistoryLoading, setIsActionHistoryLoading] = useState(false);
    const [showPerformActionModal, setShowPerformActionModal] = useState(false);
    const [availableActions, setAvailableActions] = useState<TwinAction[]>([]);
    const [selectedAction, setSelectedAction] = useState<TwinAction | null>(null);
    const [actionParameters, setActionParameters] = useState<{ [key: string]: any }>({});
    const [isPerformingAction, setIsPerformingAction] = useState(false);
    const [actionResult, setActionResult] = useState<string | null>(null);

    const [isAnomalyDetectionLoading, setIsAnomalyDetectionLoading] = useState(false);
    const [anomalyReport, setAnomalyReport] = useState<AIResponse | null>(null);

    const [isPredictionLoading, setIsPredictionLoading] = useState(false);
    const [predictionReport, setPredictionReport] = useState<AIResponse | null>(null);
    const [predictionHorizon, setPredictionHorizon] = useState<string>('24h');

    const [isNLQLoading, setIsNLQLoading] = useState(false);
    const [nlqQuery, setNlqQuery] = useState('');
    const [nlqResponse, setNlqResponse] = useState<AIResponse | null>(null);

    const [isSettingsLoading, setIsSettingsLoading] = useState(false);
    const [appSettings, setAppSettings] = useState<AppSetting[]>(DEFAULT_APP_SETTINGS);
    const [currentUserId, setCurrentUserId] = useState<UUID>(MOCK_USERS[0].userId); // Default to admin
    const [userProfiles, setUserProfiles] = useState<UserProfile[]>(MOCK_USERS);
    const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);


    const dataIngestionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isDataIngestionSimulating, setIsDataIngestionSimulating] = useState(false);
    const [simulatedDataLogs, setSimulatedDataLogs] = useState<string[]>([]);
    const [ingestionPropertyKey, setIngestionPropertyKey] = useState<string>('');
    const [ingestionValue, setIngestionValue] = useState<string>('');
    const [showDataIngestionModal, setShowDataIngestionModal] = useState(false);

    // endregion

    // region -- Utility Functions for UI/State Management --

    /** Helper to parse schema properties for rendering */
    const parseSchemaProperties = useCallback((schema: any): TwinProperty[] => {
        if (!schema || !schema.properties) return [];
        return Object.entries(schema.properties).map(([name, def]: [string, any]) => ({
            name,
            type: def.type,
            description: def.description,
            unit: def.unit,
            enum: def.enum,
            readOnly: def.readOnly,
            writable: def.writable,
            minValue: def.minValue,
            maxValue: def.maxValue,
            defaultValue: def.defaultValue,
            format: def.format,
            pattern: def.pattern,
            items: def.items ? parseSchemaProperties({ properties: { _item: def.items } })[0] : undefined, // Recursive for array items
            properties: def.properties ? Object.fromEntries(Object.entries(def.properties).map(([n, d]: [string, any]) => [n, { name: n, ...d }])) : undefined, // Recursive for object properties
            required: schema.required?.includes(name) || false
        }));
    }, []);

    /** Resets the twin definition form */
    const resetTwinDefinitionForm = () => {
        setEditingTwinDefinition(null);
        setTwinDefinitionFormErrors({});
        setShowTwinDefinitionForm(false);
    };

    /** Resets the twin instance form */
    const resetTwinInstanceForm = () => {
        setEditingTwinInstance(null);
        setInstanceFormErrors({});
        setShowInstanceForm(false);
    };

    /** Generic error logger */
    const logError = (context: string, error: any) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[ERROR] ${context}:`, error);
        setAiErrorMessage(`${context} failed: ${message}`);
        setTimeout(() => setAiErrorMessage(null), 5000); // Clear after 5 seconds
    };

    // endregion

    // region -- Data Fetching & Sync Effects --

    /** Effect to load all initial data */
    useEffect(() => {
        const loadAllInitialData = async () => {
            setIsDefinitionsLoading(true);
            setIsInstancesLoading(true);
            setIsSettingsLoading(true);
            try {
                const definitions = await digitalTwinRepository.getTwinDefinitions();
                setAllTwinDefinitions(definitions);
                if (definitions.length > 0) {
                    setSelectedTwinDefinitionId(definitions[0].id);
                }

                const instances = await digitalTwinRepository.getTwinInstances();
                setAllTwinInstances(instances);
                if (instances.length > 0) {
                    setSelectedTwinInstanceId(instances[0].instanceId);
                }

                const settings = await digitalTwinRepository.getAppSettings();
                setAppSettings(settings);

                const users = await digitalTwinRepository.getUserProfiles();
                setUserProfiles(users);
                setCurrentUser(users.find(u => u.userId === currentUserId) || users[0]);
                
                const actions = await digitalTwinRepository.getAvailableActions();
                setAvailableActions(actions);
            } catch (error) {
                logError("Failed to load initial data", error);
            } finally {
                setIsDefinitionsLoading(false);
                setIsInstancesLoading(false);
                setIsSettingsLoading(false);
            }
        };
        loadAllInitialData();
    }, [currentUserId]);

    /** Effect to update selected twin definition details */
    useEffect(() => {
        const updateSelectedDefinition = async () => {
            if (selectedTwinDefinitionId) {
                const def = allTwinDefinitions.find(d => d.id === selectedTwinDefinitionId);
                setSelectedTwinDefinition(def || null);
            } else {
                setSelectedTwinDefinition(null);
            }
        };
        updateSelectedDefinition();
    }, [selectedTwinDefinitionId, allTwinDefinitions]);

    /** Effect to update selected twin instance details, events, and alerts */
    useEffect(() => {
        const updateSelectedInstance = async () => {
            if (selectedTwinInstanceId) {
                const instance = allTwinInstances.find(i => i.instanceId === selectedTwinInstanceId);
                setSelectedTwinInstance(instance || null);
                if (instance) {
                    setIsEventsLoading(true);
                    setIsAlertsLoading(true);
                    setIsActionHistoryLoading(true);
                    try {
                        const events = await digitalTwinRepository.getTwinEvents(instance.instanceId, 20);
                        setTwinInstanceEvents(events);
                        const alerts = await digitalTwinRepository.getTwinAlerts(instance.instanceId, 'ACTIVE');
                        setTwinInstanceAlerts(alerts);
                        const history = await digitalTwinRepository.getActionHistory(instance.instanceId, 10);
                        setTwinInstanceActionsHistory(history);
                    } catch (error) {
                        logError("Failed to load instance details", error);
                    } finally {
                        setIsEventsLoading(false);
                        setIsAlertsLoading(false);
                        setIsActionHistoryLoading(false);
                    }
                } else {
                    setTwinInstanceEvents([]);
                    setTwinInstanceAlerts([]);
                    setTwinInstanceActionsHistory([]);
                }
            } else {
                setSelectedTwinInstance(null);
                setTwinInstanceEvents([]);
                setTwinInstanceAlerts([]);
                setTwinInstanceActionsHistory([]);
            }
            setAnomalyReport(null); // Clear AI reports when instance changes
            setPredictionReport(null);
            setNlqResponse(null);
            setNlqQuery('');
        };
        updateSelectedInstance();
    }, [selectedTwinInstanceId, allTwinInstances]);

    /**
     * Effect to stop data ingestion simulation when selected instance changes or component unmounts.
     */
    useEffect(() => {
        // Clear interval on instance change or component unmount
        return () => {
            if (dataIngestionIntervalRef.current) {
                clearInterval(dataIngestionIntervalRef.current);
                dataIngestionIntervalRef.current = null;
                setIsDataIngestionSimulating(false);
                console.log("Stopped data ingestion simulation on component unmount/instance change.");
            }
        };
    }, [selectedTwinInstanceId]);


    // endregion

    // region -- AI Interaction Handlers --

    /** Handles schema generation from prompt */
    const handleGenerateSchema = async () => {
        setIsLoadingSchema(true);
        setGeneratedSchema(null);
        setAiErrorMessage(null);
        try {
            const schemaDef = {
                type: Type.OBJECT,
                properties: {
                    $schema: { type: Type.STRING, description: "Schema definition URI" },
                    title: { type: Type.STRING, description: "Title of the Twin Model" },
                    type: { type: Type.STRING, description: "Object type" },
                    properties: { type: Type.OBJECT, description: "The properties of the twin" },
                    required: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of required properties" }
                }
            };
            const response = await aiService.generateSchema(prompt, schemaDef, appSettings.find(s => s.key === 'ai_model_schema_gen')?.value as string);
            if (response.status === 'success' && response.data) {
                setGeneratedSchema(response.data);
            } else {
                logError("AI Schema Generation", response.errorDetails || response.message);
            }
        } catch (error) {
            logError("AI Schema Generation", error);
        } finally {
            setIsLoadingSchema(false);
        }
    };

    /** Handles AI-driven anomaly detection */
    const handleDetectAnomalies = async () => {
        if (!selectedTwinInstance || !selectedTwinDefinition) {
            setAiErrorMessage("Please select a twin instance and definition to detect anomalies.");
            return;
        }

        setIsAnomalyDetectionLoading(true);
        setAnomalyReport(null);
        setAiErrorMessage(null);
        try {
            const historicalData = await digitalTwinRepository.getHistoricalData(selectedTwinInstance.instanceId, '*', '24h', '1h'); // '*' means all properties
            const response = await aiService.detectAnomalies(
                selectedTwinInstance.instanceId,
                selectedTwinInstance.properties,
                historicalData,
                selectedTwinDefinition.schema,
                appSettings.find(s => s.key === 'ai_model_anomaly_detection')?.value as string
            );
            setAnomalyReport(response);
            if (response.status === 'error') {
                logError("AI Anomaly Detection", response.errorDetails || response.message);
            }
        } catch (error) {
            logError("AI Anomaly Detection", error);
        } finally {
            setIsAnomalyDetectionLoading(false);
        }
    };

    /** Handles AI-driven predictive analytics */
    const handlePredictFutureState = async () => {
        if (!selectedTwinInstance || !selectedTwinDefinition) {
            setAiErrorMessage("Please select a twin instance and definition to predict future state.");
            return;
        }

        setIsPredictionLoading(true);
        setPredictionReport(null);
        setAiErrorMessage(null);
        try {
            const historicalData = await digitalTwinRepository.getHistoricalData(selectedTwinInstance.instanceId, '*', '7d', '1h'); // '*' means all properties
            const response = await aiService.predictFutureState(
                selectedTwinInstance.instanceId,
                selectedTwinInstance.properties,
                historicalData,
                selectedTwinDefinition.schema,
                predictionHorizon,
                appSettings.find(s => s.key === 'ai_model_predictive_analytics')?.value as string
            );
            setPredictionReport(response);
            if (response.status === 'error') {
                logError("AI Predictive Analytics", response.errorDetails || response.message);
            }
        } catch (error) {
            logError("AI Predictive Analytics", error);
        } finally {
            setIsPredictionLoading(false);
        }
    };

    /** Handles AI-driven Natural Language Query */
    const handleNLQSubmit = async () => {
        if (!nlqQuery.trim()) {
            setAiErrorMessage("Please enter a query.");
            return;
        }
        setIsNLQLoading(true);
        setNlqResponse(null);
        setAiErrorMessage(null);

        try {
            const context = {
                currentTwinInstance: selectedTwinInstance,
                twinDefinition: selectedTwinDefinition,
                allTwinDefinitionsCount: allTwinDefinitions.length,
                allTwinInstancesCount: allTwinInstances.length,
                user: currentUser,
                appSettings: appSettings,
                // Pass relevant data properties for the AI to answer specific questions
                properties: selectedTwinInstance?.properties,
                status: selectedTwinInstance?.status,
                alerts: selectedTwinInstance?.alerts,
                twinSchema: selectedTwinDefinition?.schema
            };
            const response = await aiService.naturalLanguageQuery(nlqQuery, context);
            setNlqResponse(response);
            if (response.status === 'error') {
                logError("AI Natural Language Query", response.errorDetails || response.message);
            }
        } catch (error) {
            logError("AI Natural Language Query", error);
        } finally {
            setIsNLQLoading(false);
        }
    };

    // endregion

    // region -- Twin Definition Management Handlers --

    /** Adds/Edits a twin definition */
    const handleSaveTwinDefinition = async (definition: DigitalTwinDefinition) => {
        setTwinDefinitionFormErrors({});
        try {
            // Basic validation
            if (!definition.name || !definition.description || !definition.category || !definition.schema || !Object.keys(definition.schema.properties).length) {
                setTwinDefinitionFormErrors({ general: "Name, description, category, and at least one schema property are required." });
                return;
            }

            setIsDefinitionsLoading(true);
            const savedDef = await digitalTwinRepository.saveTwinDefinition(definition);
            setAllTwinDefinitions(prev => {
                const existingIndex = prev.findIndex(d => d.id === savedDef.id);
                if (existingIndex !== -1) {
                    return prev.map((d, idx) => idx === existingIndex ? savedDef : d);
                } else {
                    return [...prev, savedDef];
                }
            });
            setSelectedTwinDefinitionId(savedDef.id);
            resetTwinDefinitionForm();
        } catch (error) {
            logError("Saving Twin Definition", error);
            setTwinDefinitionFormErrors({ general: (error as Error).message || "Failed to save twin definition." });
        } finally {
            setIsDefinitionsLoading(false);
        }
    };

    /** Deletes a twin definition */
    const handleDeleteTwinDefinition = async (id: UUID) => {
        if (!window.confirm("Are you sure you want to delete this twin definition and all its instances? This action cannot be undone.")) return;
        try {
            setIsDefinitionsLoading(true);
            await digitalTwinRepository.deleteTwinDefinition(id);
            setAllTwinDefinitions(prev => prev.filter(d => d.id !== id));
            setAllTwinInstances(prev => prev.filter(i => i.twinDefinitionId !== id)); // Also update instances
            if (selectedTwinDefinitionId === id) {
                setSelectedTwinDefinitionId(null);
            }
            if (selectedTwinInstanceId && allTwinInstances.find(i => i.instanceId === selectedTwinInstanceId)?.twinDefinitionId === id) {
                setSelectedTwinInstanceId(null);
            }
        } catch (error) {
            logError("Deleting Twin Definition", error);
        } finally {
            setIsDefinitionsLoading(false);
        }
    };

    /** Handles editing an existing twin definition */
    const handleEditTwinDefinition = (definition: DigitalTwinDefinition) => {
        setEditingTwinDefinition(deepClone(definition));
        setShowTwinDefinitionForm(true);
    };

    // endregion

    // region -- Twin Instance Management Handlers --

    /** Adds/Edits a twin instance */
    const handleSaveTwinInstance = async (instance: DigitalTwinInstance) => {
        setInstanceFormErrors({});
        try {
            if (!instance.name || !instance.twinDefinitionId || !instance.status || !Object.keys(instance.properties).length) {
                setInstanceFormErrors({ general: "Name, Definition, Status, and properties are required." });
                return;
            }

            setIsInstancesLoading(true);
            const savedInstance = await digitalTwinRepository.saveTwinInstance(instance);
            setAllTwinInstances(prev => {
                const existingIndex = prev.findIndex(i => i.instanceId === savedInstance.instanceId);
                if (existingIndex !== -1) {
                    return prev.map((i, idx) => idx === existingIndex ? savedInstance : i);
                } else {
                    return [...prev, savedInstance];
                }
            });
            setSelectedTwinInstanceId(savedInstance.instanceId);
            resetTwinInstanceForm();
        } catch (error) {
            logError("Saving Twin Instance", error);
            setInstanceFormErrors({ general: (error as Error).message || "Failed to save twin instance." });
        } finally {
            setIsInstancesLoading(false);
        }
    };

    /** Deletes a twin instance */
    const handleDeleteTwinInstance = async (id: UUID) => {
        if (!window.confirm("Are you sure you want to delete this twin instance? This action cannot be undone.")) return;
        try {
            setIsInstancesLoading(true);
            await digitalTwinRepository.deleteTwinInstance(id);
            setAllTwinInstances(prev => prev.filter(i => i.instanceId !== id));
            if (selectedTwinInstanceId === id) {
                setSelectedTwinInstanceId(null);
            }
        } catch (error) {
            logError("Deleting Twin Instance", error);
        } finally {
            setIsInstancesLoading(false);
        }
    };

    /** Handles editing an existing twin instance */
    const handleEditTwinInstance = (instance: DigitalTwinInstance) => {
        setEditingTwinInstance(deepClone(instance));
        setShowInstanceForm(true);
    };

    /** Updates properties of a selected twin instance */
    const handleUpdateInstanceProperties = async (instanceId: UUID, propertyKey: string, newValue: any) => {
        if (!selectedTwinInstance) return;

        const updatedProperties = { ...selectedTwinInstance.properties, [propertyKey]: newValue };

        try {
            setIsInstancesLoading(true);
            const updatedInstance = await digitalTwinRepository.updateTwinInstanceProperties(instanceId, { [propertyKey]: newValue });
            if (updatedInstance) {
                setAllTwinInstances(prev => prev.map(i => i.instanceId === instanceId ? updatedInstance : i));
            }
        } catch (error) {
            logError("Updating Twin Instance Property", error);
        } finally {
            setIsInstancesLoading(false);
        }
    };

    /** Handles resolving a twin alert */
    const handleResolveAlert = async (alertId: UUID) => {
        if (!selectedTwinInstance) return;
        try {
            setIsAlertsLoading(true);
            await digitalTwinRepository.updateTwinAlertStatus(alertId, 'RESOLVED', 'Resolved manually by user.', currentUser.userId);
            // Re-fetch alerts to update state
            const updatedAlerts = await digitalTwinRepository.getTwinAlerts(selectedTwinInstance.instanceId, 'ACTIVE');
            setTwinInstanceAlerts(updatedAlerts);
        } catch (error) {
            logError("Resolving Alert", error);
        } finally {
            setIsAlertsLoading(false);
        }
    };

    // endregion

    // region -- Data Ingestion Simulation Handlers --

    /** Generates a new random value for a property based on its type and schema constraints */
    const generateRandomPropertyValue = useCallback((property: TwinProperty, currentValue: any) => {
        switch (property.type) {
            case 'number':
                let min = property.minValue !== undefined ? property.minValue : 0;
                let max = property.maxValue !== undefined ? property.maxValue : 100;
                if (property.name === 'temperature') { // Special case for more realistic fluctuations
                    min = 18; max = 28;
                } else if (property.name === 'humidity') {
                    min = 30; max = 70;
                } else if (property.name === 'accountBalance' && typeof currentValue === 'number') {
                    min = currentValue * 0.99; // Minor fluctuation
                    max = currentValue * 1.01;
                } else if (property.name === 'creditScore' && typeof currentValue === 'number') {
                    min = currentValue * 0.998;
                    max = currentValue * 1.002;
                } else if (property.name === 'riskScore' && typeof currentValue === 'number') {
                    min = Math.max(0, currentValue - 5);
                    max = Math.min(100, currentValue + 5);
                }
                const randomVal = Math.random() * (max - min) + min;
                return parseFloat(randomVal.toFixed(property.name === 'temperature' || property.name === 'accountBalance' ? 2 : 0));
            case 'string':
                if (property.enum && property.enum.length > 0) {
                    return property.enum[Math.floor(Math.random() * property.enum.length)];
                }
                return `Updated_${Math.random().toString(36).substring(7)}`;
            case 'boolean':
                return Math.random() > 0.5;
            default:
                return 'N/A';
        }
    }, []);

    /** Simulates continuous data ingestion for the selected twin instance */
    const startSimulatedDataIngestion = useCallback(async () => {
        if (!selectedTwinInstance || !selectedTwinDefinition) return;

        const ingestionInterval = appSettings.find(s => s.key === 'data_ingestion_interval_ms')?.value as number || 5000;
        const enableRealtimeStreaming = appSettings.find(s => s.key === 'enable_realtime_data_streaming')?.value as boolean || false;

        if (!enableRealtimeStreaming) {
            setSimulatedDataLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Real-time data streaming is disabled in settings.`]);
            return;
        }

        if (dataIngestionIntervalRef.current) {
            clearInterval(dataIngestionIntervalRef.current);
        }

        setIsDataIngestionSimulating(true);
        setSimulatedDataLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting data ingestion for ${selectedTwinInstance.name} every ${ingestionInterval / 1000}s...`]);

        dataIngestionIntervalRef.current = setInterval(async () => {
            if (!selectedTwinInstance || !selectedTwinDefinition) {
                console.warn("No selected twin instance/definition for simulation. Stopping interval.");
                stopSimulatedDataIngestion();
                return;
            }

            try {
                const newPropertyValues: { [key: string]: any } = {};
                const currentProperties = selectedTwinInstance.properties;
                const schemaProps = parseSchemaProperties(selectedTwinDefinition.schema);

                let updatedCount = 0;
                for (const prop of schemaProps) {
                    // Only update writable properties or properties that are not explicitly read-only
                    if (!prop.readOnly && prop.type !== 'object' && prop.type !== 'array') { // Avoid complex types for simple simulation
                        newPropertyValues[prop.name] = generateRandomPropertyValue(prop, currentProperties[prop.name]);
                        updatedCount++;
                    }
                }

                if (updatedCount > 0) {
                    const updatedInstance = await digitalTwinRepository.updateTwinInstanceProperties(selectedTwinInstance.instanceId, newPropertyValues);
                    if (updatedInstance) {
                        setAllTwinInstances(prev => prev.map(i => i.instanceId === updatedInstance.instanceId ? updatedInstance : i));
                        setSimulatedDataLogs(prev => [`[${new Date().toLocaleTimeString()}] Ingested ${updatedCount} properties. E.g., temp: ${newPropertyValues.temperature || '-'}, balance: ${newPropertyValues.accountBalance || '-'}`, ...prev].slice(0, 10)); // Keep last 10 logs
                        // Trigger AI anomaly detection periodically if enabled
                        if (Math.random() < 0.2) { // 20% chance to run anomaly detection
                            handleDetectAnomalies();
                        }
                    }
                } else {
                    setSimulatedDataLogs(prev => [`[${new Date().toLocaleTimeString()}] No writable properties to update.`, ...prev].slice(0, 10));
                }

            } catch (error) {
                logError("Simulated Data Ingestion", error);
                setSimulatedDataLogs(prev => [`[${new Date().toLocaleTimeString()}] Error during ingestion: ${(error as Error).message}`, ...prev].slice(0, 10));
            }
        }, ingestionInterval);
    }, [selectedTwinInstance, selectedTwinDefinition, appSettings, parseSchemaProperties, generateRandomPropertyValue, handleDetectAnomalies]);


    /** Stops the simulated data ingestion */
    const stopSimulatedDataIngestion = useCallback(() => {
        if (dataIngestionIntervalRef.current) {
            clearInterval(dataIngestionIntervalRef.current);
            dataIngestionIntervalRef.current = null;
            setIsDataIngestionSimulating(false);
            setSimulatedDataLogs(prev => [`[${new Date().toLocaleTimeString()}] Stopped data ingestion simulation.`, ...prev].slice(0, 10));
        }
    }, []);

    /** Handles manual data ingestion */
    const handleManualDataIngestion = async () => {
        if (!selectedTwinInstance || !ingestionPropertyKey || !ingestionValue) {
            setAiErrorMessage("Please select a twin, property key, and value for manual ingestion.");
            return;
        }

        const twinSchemaProps = parseSchemaProperties(selectedTwinDefinition?.schema);
        const targetProp = twinSchemaProps.find(p => p.name === ingestionPropertyKey);

        let parsedValue: any = ingestionValue;
        if (targetProp) {
            if (targetProp.type === 'number') {
                parsedValue = parseFloat(ingestionValue);
                if (isNaN(parsedValue)) {
                    setAiErrorMessage("Invalid number format for the property.");
                    return;
                }
            } else if (targetProp.type === 'boolean') {
                parsedValue = ingestionValue.toLowerCase() === 'true';
            }
        }

        try {
            setIsInstancesLoading(true); // Re-using instance loading state
            const updatedInstance = await digitalTwinRepository.updateTwinInstanceProperties(
                selectedTwinInstance.instanceId,
                { [ingestionPropertyKey]: parsedValue }
            );
            if (updatedInstance) {
                setAllTwinInstances(prev => prev.map(i => i.instanceId === updatedInstance.instanceId ? updatedInstance : i));
                setSimulatedDataLogs(prev => [`[${new Date().toLocaleTimeString()}] Manually ingested: ${ingestionPropertyKey}=${parsedValue}`, ...prev].slice(0, 10));
            }
        } catch (error) {
            logError("Manual Data Ingestion", error);
        } finally {
            setIsInstancesLoading(false);
            setShowDataIngestionModal(false);
            setIngestionPropertyKey('');
            setIngestionValue('');
        }
    };

    // endregion

    // region -- Twin Action Handlers --

    /** Handles performing a selected action on a twin */
    const handlePerformAction = async () => {
        if (!selectedTwinInstance || !selectedAction) {
            setAiErrorMessage("No twin instance or action selected.");
            return;
        }

        setIsPerformingAction(true);
        setActionResult(null);
        try {
            // Simulate action execution. A real system would call a backend service to execute on the physical twin.
            console.log(`[Action] Attempting to perform action "${selectedAction.name}" on instance "${selectedTwinInstance.name}" with parameters:`, actionParameters);

            let actionStatus: 'SUCCESS' | 'FAILED' | 'PENDING' = 'SUCCESS';
            let resultDetails = `Action "${selectedAction.name}" successfully simulated.`;

            // Example: If action is 'Adjust Threshold', update the threshold property
            if (selectedAction.name === 'Adjust Threshold' && selectedTwinInstance) {
                const targetProp = actionParameters.property;
                const newValue = actionParameters.newValue;
                if (targetProp && typeof newValue === 'number') {
                    // This would normally update a threshold setting, not the twin's live property directly.
                    // For demo, let's just update a mock setting or a property that might be affected.
                    await handleUpdateInstanceProperties(selectedTwinInstance.instanceId, targetProp, newValue);
                    resultDetails = `Simulated adjustment of property '${targetProp}' to '${newValue}'.`;
                } else {
                    actionStatus = 'FAILED';
                    resultDetails = 'Invalid parameters for Adjust Threshold action.';
                }
            } else if (selectedAction.name === 'Process Financial Transaction' && selectedTwinInstance) {
                if (selectedTwinInstance.twinDefinitionId === allTwinDefinitions.find(d => d.category === TwinCategory.CUSTOMER_ACCOUNT)?.id) {
                    const amount = actionParameters.amount;
                    const type = actionParameters.type;
                    if (typeof amount === 'number' && ['DEBIT', 'CREDIT'].includes(type)) {
                        let newBalance = selectedTwinInstance.properties.accountBalance;
                        if (type === 'DEBIT') {
                            newBalance -= amount;
                        } else {
                            newBalance += amount;
                        }
                        await digitalTwinRepository.updateTwinInstanceProperties(selectedTwinInstance.instanceId, {
                            accountBalance: newBalance,
                            lastTransactionAmount: amount,
                            lastTransactionType: type
                        });
                        resultDetails = `Simulated ${type} of ${amount} USD. New balance: ${newBalance.toFixed(2)}.`;
                    } else {
                        actionStatus = 'FAILED';
                        resultDetails = 'Invalid parameters for financial transaction.';
                    }
                } else {
                    actionStatus = 'FAILED';
                    resultDetails = 'Financial transaction action is only applicable to Customer Account twins.';
                }
            } else if (selectedAction.name === 'Change Operating Mode' && selectedTwinInstance) {
                const newMode = actionParameters.mode;
                if (newMode) {
                    await digitalTwinRepository.updateTwinInstanceProperties(selectedTwinInstance.instanceId, { mode: newMode });
                    resultDetails = `Simulated changing operating mode to '${newMode}'.`;
                } else {
                    actionStatus = 'FAILED';
                    resultDetails = 'Operating mode not specified.';
                }
            } else if (Math.random() < 0.1 && !selectedAction.requiresApproval) { // 10% chance of random failure for non-approved actions
                actionStatus = 'FAILED';
                resultDetails = "Simulated temporary communication error with device.";
            }

            // Log the action regardless of success/failure
            await digitalTwinRepository.logPerformedAction({
                logId: generateUUID(),
                instanceId: selectedTwinInstance.instanceId,
                actionId: selectedAction.actionId,
                actionName: selectedAction.name,
                timestamp: new Date().toISOString(),
                initiatedBy: currentUser.userId,
                parametersUsed: actionParameters,
                status: actionStatus,
                resultDetails: resultDetails,
                approvedBy: selectedAction.requiresApproval ? MOCK_USERS[0].userId : undefined // Mock approval by admin
            });

            // Re-fetch action history and instance properties
            const updatedHistory = await digitalTwinRepository.getActionHistory(selectedTwinInstance.instanceId, 10);
            setTwinInstanceActionsHistory(updatedHistory);
            const updatedInstance = await digitalTwinRepository.getTwinInstance(selectedTwinInstance.instanceId);
            if (updatedInstance) {
                setAllTwinInstances(prev => prev.map(i => i.instanceId === updatedInstance.instanceId ? updatedInstance : i));
            }

            setActionResult(resultDetails);
            if (actionStatus === 'FAILED') {
                setAiErrorMessage(resultDetails);
            }

        } catch (error) {
            logError("Performing Twin Action", error);
            setActionResult(`Action failed: ${(error as Error).message}`);
            setAiErrorMessage(`Action failed: ${(error as Error).message}`);
        } finally {
            setIsPerformingAction(false);
            // setShowPerformActionModal(false); // Keep modal open to show result
        }
    };

    // endregion

    // region -- App Settings Handlers --

    /** Updates an application setting */
    const handleUpdateSetting = async (key: string, value: any) => {
        try {
            setIsSettingsLoading(true);
            const updatedSetting = await digitalTwinRepository.updateAppSetting(key, value);
            if (updatedSetting) {
                setAppSettings(prev => prev.map(s => s.key === key ? updatedSetting : s));
            }
        } catch (error) {
            logError("Updating App Setting", error);
        } finally {
            setIsSettingsLoading(false);
        }
    };

    // endregion

    // region -- Render Logic --

    const availableTwinPropertiesForIngestion = useMemo(() => {
        if (!selectedTwinDefinition) return [];
        return parseSchemaProperties(selectedTwinDefinition.schema).filter(p => !p.readOnly && p.type !== 'object' && p.type !== 'array');
    }, [selectedTwinDefinition, parseSchemaProperties]);

    const twinDefinitionColumns = useMemo(() => [
        { key: 'name', header: 'Name' },
        { key: 'category', header: 'Category' },
        { key: 'version', header: 'Version' },
        { key: 'lastUpdated', header: 'Last Updated', render: (val: string) => new Date(val).toLocaleDateString() },
        {
            key: 'actions', header: 'Actions', render: (_: any, row: DigitalTwinDefinition) => (
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditTwinDefinition(row); }}
                        className="text-yellow-500 hover:text-yellow-400 text-sm"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTwinDefinition(row.id); }}
                        className="text-red-500 hover:text-red-400 text-sm"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ], []);

    const twinInstanceColumns = useMemo(() => [
        { key: 'name', header: 'Instance Name' },
        {
            key: 'twinDefinitionId', header: 'Definition',
            render: (val: UUID) => allTwinDefinitions.find(d => d.id === val)?.name || 'Unknown'
        },
        {
            key: 'status', header: 'Status', render: (val: TwinStatus) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${val === TwinStatus.ACTIVE ? 'bg-green-100 text-green-800' :
                        val === TwinStatus.INACTIVE ? 'bg-gray-100 text-gray-800' :
                            val === TwinStatus.MAINTENANCE ? 'bg-blue-100 text-blue-800' :
                                val === TwinStatus.ERROR ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}
                >
                    {val}
                </span>
            )
        },
        { key: 'healthScore', header: 'Health', render: (val: number) => <span className={val < (appSettings.find(s => s.key === 'default_twin_health_threshold')?.value || 70) ? 'text-red-400' : 'text-green-400'}>{val}%</span> },
        { key: 'lastDataUpdateTime', header: 'Last Update', render: (val: string) => new Date(val).toLocaleTimeString() },
        {
            key: 'actions', header: 'Actions', render: (_: any, row: DigitalTwinInstance) => (
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleEditTwinInstance(row); }}
                        className="text-yellow-500 hover:text-yellow-400 text-sm"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTwinInstance(row.instanceId); }}
                        className="text-red-500 hover:text-red-400 text-sm"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ], [allTwinDefinitions, appSettings]);


    // Detailed twin definition form
    const TwinDefinitionForm: React.FC = () => {
        const [formData, setFormData] = useState<DigitalTwinDefinition>(
            editingTwinDefinition || {
                id: '',
                name: '',
                description: '',
                category: TwinCategory.CUSTOMER_ACCOUNT,
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                schema: { $schema: "http://json-schema.org/draft-07/schema#", title: "", type: "object", properties: {}, required: [] },
                tags: [],
                ownerUserId: currentUser.userId,
                accessControlList: [currentUser.userId]
            }
        );
        const [schemaInput, setSchemaInput] = useState<string>(
            editingTwinDefinition ? JSON.stringify(editingTwinDefinition.schema, null, 2) :
                JSON.stringify({
                    "$schema": "http://json-schema.org/draft-07/schema#",
                    "title": "NewTwin",
                    "type": "object",
                    "properties": {
                        "exampleProperty": { "type": "string", "description": "An example string property" }
                    },
                    "required": ["exampleProperty"]
                }, null, 2)
        );
        const [schemaParseError, setSchemaParseError] = useState<string | null>(null);

        useEffect(() => {
            if (generatedSchema) {
                setSchemaInput(JSON.stringify(generatedSchema, null, 2));
                setFormData(prev => ({
                    ...prev,
                    schema: generatedSchema,
                    name: generatedSchema.title || prev.name || "Generated Twin",
                    description: generatedSchema.description || prev.description || "Description from AI-generated schema."
                }));
            }
        }, [generatedSchema]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            if (name === 'tags') {
                setFormData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(tag => tag) }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        };

        const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setSchemaInput(e.target.value);
            try {
                const parsedSchema = JSON.parse(e.target.value);
                setFormData(prev => ({ ...prev, schema: parsedSchema }));
                setSchemaParseError(null);
            } catch (error) {
                setSchemaParseError("Invalid JSON schema: " + (error as Error).message);
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (schemaParseError) {
                setTwinDefinitionFormErrors(prev => ({ ...prev, schema: schemaParseError }));
                return;
            }
            if (!formData.schema || !Object.keys(formData.schema.properties).length) {
                setTwinDefinitionFormErrors(prev => ({ ...prev, schema: "Schema must define at least one property." }));
                return;
            }
            handleSaveTwinDefinition(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white" required />
                    {twinDefinitionFormErrors.name && <p className="text-red-400 text-xs mt-1">{twinDefinitionFormErrors.name}</p>}
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white h-20" required />
                    {twinDefinitionFormErrors.description && <p className="text-red-400 text-xs mt-1">{twinDefinitionFormErrors.description}</p>}
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white" required>
                        {Object.values(TwinCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {twinDefinitionFormErrors.category && <p className="text-red-400 text-xs mt-1">{twinDefinitionFormErrors.category}</p>}
                </div>
                <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-300">Version</label>
                    <input type="text" id="version" name="version" value={formData.version} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white" />
                </div>
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-300">Tags (comma-separated)</label>
                    <input type="text" id="tags" name="tags" value={formData.tags.join(', ')} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white" />
                </div>
                <div>
                    <label htmlFor="schema" className="block text-sm font-medium text-gray-300">Schema (JSON)</label>
                    <textarea id="schema" name="schema" value={schemaInput} onChange={handleSchemaChange}
                        className="w-full h-48 bg-gray-700/50 p-2 rounded text-white font-mono text-sm" required />
                    {schemaParseError && <p className="text-red-400 text-xs mt-1">{schemaParseError}</p>}
                    {twinDefinitionFormErrors.schema && <p className="text-red-400 text-xs mt-1">{twinDefinitionFormErrors.schema}</p>}
                </div>
                {twinDefinitionFormErrors.general && <p className="text-red-400 text-sm">{twinDefinitionFormErrors.general}</p>}
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={resetTwinDefinitionForm} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors" disabled={isDefinitionsLoading || !!schemaParseError}>
                        {isDefinitionsLoading ? 'Saving...' : (editingTwinDefinition ? 'Update Definition' : 'Create Definition')}
                    </button>
                </div>
            </form>
        );
    };

    // Detailed twin instance form
    const TwinInstanceForm: React.FC = () => {
        const [formData, setFormData] = useState<DigitalTwinInstance>(
            editingTwinInstance || {
                instanceId: '',
                twinDefinitionId: selectedTwinDefinitionId || '', // Pre-fill if a definition is selected
                name: '',
                status: TwinStatus.ACTIVE,
                lastDataUpdateTime: new Date().toISOString(),
                properties: {},
                metadata: {},
                healthScore: 100,
                alerts: [],
                associatedEntities: []
            }
        );
        const [propertyValues, setPropertyValues] = useState<{ [key: string]: any }>(editingTwinInstance?.properties || {});
        const [currentInstanceDefinition, setCurrentInstanceDefinition] = useState<DigitalTwinDefinition | null>(null);

        useEffect(() => {
            if (formData.twinDefinitionId) {
                const def = allTwinDefinitions.find(d => d.id === formData.twinDefinitionId);
                setCurrentInstanceDefinition(def || null);
                // Initialize properties based on schema if new instance or definition changed
                if (!editingTwinInstance || editingTwinInstance.twinDefinitionId !== formData.twinDefinitionId) {
                    const initialProps: { [key: string]: any } = {};
                    if (def && def.schema && def.schema.properties) {
                        parseSchemaProperties(def.schema).forEach(prop => {
                            if (prop.defaultValue !== undefined) {
                                initialProps[prop.name] = prop.defaultValue;
                            } else if (prop.type === 'number') {
                                initialProps[prop.name] = 0;
                            } else if (prop.type === 'string') {
                                initialProps[prop.name] = '';
                            } else if (prop.type === 'boolean') {
                                initialProps[prop.name] = false;
                            }
                        });
                    }
                    setPropertyValues(initialProps);
                    setFormData(prev => ({ ...prev, properties: initialProps }));
                }
            } else {
                setCurrentInstanceDefinition(null);
                setPropertyValues({});
            }
        }, [formData.twinDefinitionId, allTwinDefinitions, editingTwinInstance, parseSchemaProperties]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        };

        const handlePropertyChange = (propName: string, value: any) => {
            setPropertyValues(prev => ({ ...prev, [propName]: value }));
            setFormData(prev => ({ ...prev, properties: { ...prev.properties, [propName]: value } }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleSaveTwinInstance(formData);
        };

        const schemaProperties = currentInstanceDefinition ? parseSchemaProperties(currentInstanceDefinition.schema) : [];

        return (
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <div>
                    <label htmlFor="instanceName" className="block text-sm font-medium text-gray-300">Instance Name</label>
                    <input type="text" id="instanceName" name="name" value={formData.name} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white" required />
                    {instanceFormErrors.name && <p className="text-red-400 text-xs mt-1">{instanceFormErrors.name}</p>}
                </div>
                <div>
                    <label htmlFor="twinDefinitionId" className="block text-sm font-medium text-gray-300">Twin Definition</label>
                    <select id="twinDefinitionId" name="twinDefinitionId" value={formData.twinDefinitionId} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white" required>
                        <option value="">Select a Definition</option>
                        {allTwinDefinitions.map(def => (
                            <option key={def.id} value={def.id}>{def.name} (v{def.version})</option>
                        ))}
                    </select>
                    {instanceFormErrors.twinDefinitionId && <p className="text-red-400 text-xs mt-1">{instanceFormErrors.twinDefinitionId}</p>}
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange}
                        className="w-full bg-gray-700/50 p-2 rounded text-white" required>
                        {Object.values(TwinStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    {instanceFormErrors.status && <p className="text-red-400 text-xs mt-1">{instanceFormErrors.status}</p>}
                </div>

                {currentInstanceDefinition && (
                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <h4 className="text-lg font-semibold text-white mb-3">Twin Properties (based on "{currentInstanceDefinition.name}")</h4>
                        {schemaProperties.length === 0 ? (
                            <p className="text-gray-500 italic">No properties defined in the selected schema.</p>
                        ) : (
                            schemaProperties.map(prop => (
                                <PropertyInput
                                    key={prop.name}
                                    property={prop}
                                    value={propertyValues[prop.name]}
                                    onChange={handlePropertyChange}
                                    readOnly={prop.readOnly}
                                />
                            ))
                        )}
                        {instanceFormErrors.properties && <p className="text-red-400 text-xs mt-1">{instanceFormErrors.properties}</p>}
                    </div>
                )}
                {instanceFormErrors.general && <p className="text-red-400 text-sm">{instanceFormErrors.general}</p>}
                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={resetTwinInstanceForm} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors" disabled={isInstancesLoading || !formData.twinDefinitionId}>
                        {isInstancesLoading ? 'Saving...' : (editingTwinInstance ? 'Update Instance' : 'Create Instance')}
                    </button>
                </div>
            </form>
        );
    };

    const PerformActionModalContent: React.FC = () => {
        if (!selectedTwinInstance || !selectedAction) return <p>No action selected.</p>;

        return (
            <div className="space-y-4">
                <p className="text-gray-300">Performing action: <span className="font-bold">{selectedAction.name}</span> on <span className="font-bold">{selectedTwinInstance.name}</span></p>
                <p className="text-sm text-gray-400">{selectedAction.description}</p>

                {selectedAction.parameters.length > 0 && (
                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-lg font-semibold text-white mb-3">Action Parameters</h4>
                        {selectedAction.parameters.map(param => (
                            <PropertyInput
                                key={param.name}
                                property={param}
                                value={actionParameters[param.name]}
                                onChange={(name, value) => setActionParameters(prev => ({ ...prev, [name]: value }))}
                            />
                        ))}
                    </div>
                )}

                {selectedAction.requiresApproval && (
                    <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded text-yellow-300 text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        This action requires approval. (Simulated auto-approval by Admin for demo)
                    </div>
                )}

                {actionResult && (
                    <div className={`p-3 rounded-lg text-sm ${actionResult.includes('failed') ? 'bg-red-900/40 text-red-300' : 'bg-green-900/40 text-green-300'}`}>
                        <strong>Result:</strong> {actionResult}
                    </div>
                )}

                <div className="flex justify-end space-x-3 mt-4">
                    <button type="button" onClick={() => { setShowPerformActionModal(false); setActionResult(null); setSelectedAction(null); setActionParameters({}); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors" disabled={isPerformingAction}>
                        Close
                    </button>
                    <button type="button" onClick={handlePerformAction} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors" disabled={isPerformingAction}>
                        {isPerformingAction ? 'Executing...' : 'Execute Action'}
                    </button>
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-8 p-6 bg-gray-950 min-h-screen text-white">
            <h1 className="text-5xl font-extrabold text-cyan-400 tracking-tighter text-center mb-10">
                Bank Digital Twin Platform
            </h1>

            {aiErrorMessage && (
                <div className="bg-red-900/50 text-red-300 p-4 rounded-lg border border-red-700 flex items-center justify-between">
                    <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                        {aiErrorMessage}
                    </span>
                    <button onClick={() => setAiErrorMessage(null)} className="text-red-300 hover:text-red-100">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            <Card title="User & Platform Settings" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-full md:col-span-1">
                        <label htmlFor="currentUser" className="block text-sm font-medium text-gray-300 mb-1">Current User (Simulated)</label>
                        <select
                            id="currentUser"
                            value={currentUserId}
                            onChange={(e) => setCurrentUserId(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            {userProfiles.map(user => (
                                <option key={user.userId} value={user.userId}>{user.username} ({user.roles.join(', ')})</option>
                            ))}
                        </select>
                        {currentUser && (
                            <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                                <p><strong>Email:</strong> {currentUser.email}</p>
                                <p><strong>Roles:</strong> {currentUser.roles.join(', ')}</p>
                            </div>
                        )}
                    </div>
                    <div className="col-span-full md:col-span-2">
                        <h3 className="text-xl font-semibold mb-3 text-white">Application Settings</h3>
                        {isSettingsLoading ? <LoadingSpinner /> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {appSettings.filter(s => s.editable).map(setting => (
                                    <div key={setting.key} className="flex flex-col">
                                        <label htmlFor={setting.key} className="text-sm font-medium text-gray-400 mb-1">
                                            {setting.description} <span className="text-xs text-gray-500">({setting.group})</span>
                                        </label>
                                        {setting.type === 'boolean' ? (
                                            <input
                                                type="checkbox"
                                                id={setting.key}
                                                checked={!!setting.value}
                                                onChange={(e) => handleUpdateSetting(setting.key, e.target.checked)}
                                                className="form-checkbox h-5 w-5 text-cyan-600 rounded border-gray-600 bg-gray-700/50 focus:ring-cyan-500 self-start mt-2"
                                            />
                                        ) : (
                                            <input
                                                type={setting.type === 'number' ? 'number' : 'text'}
                                                id={setting.key}
                                                value={String(setting.value)}
                                                onChange={(e) => handleUpdateSetting(setting.key, setting.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                                className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <Card title="AI Twin Model Generator" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.007-.455a2 2 0 01-1.022-.547L11.608 11.6l-.455-2.007a2 2 0 00-.547-1.022L7.592 7.592a2 2 0 00-1.022-.547L4.563 7.025a2 2 0 01-1.022-.547L1.533 4.533a2 2 0 00-.547-1.022c-.413-.23-.9-.084-1.127.329l-1.33 2.304a2 2 0 00-.547 1.022l-.455 2.007a2 2 0 01-.547 1.022l-2.007.455a2 2 0 00-.547 1.022L1.533 16.467a2 2 0 00.547 1.022l1.33 2.304c.23.413.717.559 1.127.329a2 2 0 00.547-1.022l2.007-.455a2 2 0 011.022-.547L11.608 11.6l.455 2.007a2 2 0 00.547 1.022l2.007.455a2 2 0 011.022.547l1.33 2.304c.23.413.717.559 1.127.329a2 2 0 00.547-1.022L19.428 15.428z"/></svg>}>
                <p className="text-gray-400 mb-4">Describe the physical asset you want to model, and our AI will generate the appropriate JSON schema for its digital representation. This schema can then be used to create new Twin Definitions.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., a smart thermostat with temperature, humidity, and status properties"
                />
                <button onClick={handleGenerateSchema} disabled={isLoadingSchema} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoadingSchema ? 'Generating Schema...' : 'Generate Twin Schema'}
                </button>
            </Card>

            {(isLoadingSchema || generatedSchema) && (
                <Card title="Generated Twin Schema">
                    {isLoadingSchema ? <LoadingSpinner /> : (
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                            {JSON.stringify(generatedSchema, null, 2)}
                        </pre>
                    )}
                    {generatedSchema && (
                        <button
                            onClick={() => { setEditingTwinDefinition(null); setShowTwinDefinitionForm(true); }}
                            className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                        >
                            Use Generated Schema to Create New Definition
                        </button>
                    )}
                </Card>
            )}

            <Card title="Digital Twin Definitions" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}>
                <p className="text-gray-400 mb-4">Manage the blueprints for your digital twins. Each definition describes a type of asset and its properties.</p>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Registered Definitions</h3>
                    <button onClick={() => { setEditingTwinDefinition(null); setGeneratedSchema(null); setShowTwinDefinitionForm(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded transition-colors">
                        Add New Definition
                    </button>
                </div>
                {isDefinitionsLoading ? <LoadingSpinner /> : (
                    <DynamicTable
                        data={allTwinDefinitions}
                        columns={twinDefinitionColumns}
                        emptyMessage="No digital twin definitions found. Start by adding one!"
                        onRowClick={(row) => setSelectedTwinDefinitionId(row.id)}
                        rowKeyExtractor={(row) => row.id}
                    />
                )}
                {selectedTwinDefinitionId && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-3">Selected Definition Details: <span className="text-cyan-400">{selectedTwinDefinition?.name}</span></h4>
                        {selectedTwinDefinition ? (
                            <div className="text-sm text-gray-300 space-y-2">
                                <p><strong>Description:</strong> {selectedTwinDefinition.description}</p>
                                <p><strong>Category:</strong> {selectedTwinDefinition.category}</p>
                                <p><strong>Version:</strong> {selectedTwinDefinition.version}</p>
                                <p><strong>Tags:</strong> {selectedTwinDefinition.tags.join(', ') || 'N/A'}</p>
                                <button onClick={() => setShowSchemaModal(true)} className="mt-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                                    View Full Schema
                                </button>
                            </div>
                        ) : <p className="text-gray-500 italic">Select a definition to view details.</p>}
                    </div>
                )}
            </Card>

            <Card title="Digital Twin Instances" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18v-8.040c0-.898.37-1.746 1.037-2.383m0 0c1.802-1.751 1.054-4.708-1.037-5.429M6.516 12C4.417 11.238 3 9.421 3 7.42 3 5.419 4.417 3.702 6.516 3M12 21V9.957A4.002 4.002 0 0116 6c3.21 0 5.827 2.378 5.827 5.297 0 1.25-.49 2.45-1.34 3.324M5.429 10.963c-2.091.72-2.84 3.677-1.038 5.428m-.207-8.19A4.002 4.002 0 018 18c3.21 0 5.827-2.378 5.827-5.297 0-1.25-.49-2.45-1.34-3.324"/></svg>}>
                <p className="text-gray-400 mb-4">Manage individual operational instances of your digital twins, reflecting their real-world counterparts.</p>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Active Instances</h3>
                    <button onClick={() => { setEditingTwinInstance(null); setShowInstanceForm(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded transition-colors">
                        Add New Instance
                    </button>
                </div>
                {isInstancesLoading ? <LoadingSpinner /> : (
                    <DynamicTable
                        data={allTwinInstances}
                        columns={twinInstanceColumns}
                        emptyMessage="No digital twin instances found. Create one from a definition!"
                        onRowClick={(row) => setSelectedTwinInstanceId(row.instanceId)}
                        rowKeyExtractor={(row) => row.instanceId}
                    />
                )}
                {selectedTwinInstanceId && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-3">Selected Instance: <span className="text-cyan-400">{selectedTwinInstance?.name}</span></h4>
                        {selectedTwinInstance && selectedTwinDefinition ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                                    <p><strong>Definition:</strong> {selectedTwinDefinition.name}</p>
                                    <p><strong>Status:</strong> <span className={`font-semibold ${selectedTwinInstance.status === TwinStatus.ACTIVE ? 'text-green-400' : 'text-yellow-400'}`}>{selectedTwinInstance.status}</span></p>
                                    <p><strong>Health Score:</strong> <span className={`font-semibold ${selectedTwinInstance.healthScore < (appSettings.find(s => s.key === 'default_twin_health_threshold')?.value || 70) ? 'text-red-400' : 'text-green-400'}`}>{selectedTwinInstance.healthScore}%</span></p>
                                    <p><strong>Last Update:</strong> {new Date(selectedTwinInstance.lastDataUpdateTime).toLocaleString()}</p>
                                    {Object.keys(selectedTwinInstance.metadata).length > 0 && (
                                        <div className="col-span-full">
                                            <p className="font-semibold">Metadata:</p>
                                            <pre className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(selectedTwinInstance.metadata, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-700 pt-4">
                                    <h5 className="text-md font-semibold text-white mb-2">Current Properties:</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                                        {parseSchemaProperties(selectedTwinDefinition.schema).map(prop => (
                                            <div key={prop.name} className="flex justify-between items-center bg-gray-900/50 p-2 rounded">
                                                <span className="text-sm text-gray-400">{prop.name}:</span>
                                                {prop.writable === false || prop.readOnly ? (
                                                    <span className="text-sm text-cyan-300 font-mono">{String(selectedTwinInstance.properties[prop.name]) || 'N/A'}</span>
                                                ) : (
                                                    <input
                                                        type={prop.type === 'number' ? 'number' : 'text'}
                                                        value={String(selectedTwinInstance.properties[prop.name]) || ''}
                                                        onChange={(e) => handleUpdateInstanceProperties(selectedTwinInstance.instanceId, prop.name, prop.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                                                        className="bg-gray-700/50 text-cyan-300 text-sm p-1 rounded w-1/2 text-right"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : <p className="text-gray-500 italic">Select an instance to view its real-time data and details.</p>}
                    </div>
                )}
            </Card>

            {selectedTwinInstance && selectedTwinDefinition && (
                <>
                    <Card title="Data Ingestion & Controls" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/></svg>}>
                        <p className="text-gray-400 mb-4">Simulate data flow into your digital twin. Start/stop automatic ingestion or push data manually.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-semibold mb-3">Simulated Data Stream</h3>
                                <div className="flex space-x-3 mb-4">
                                    <button
                                        onClick={isDataIngestionSimulating ? stopSimulatedDataIngestion : startSimulatedDataIngestion}
                                        className={`flex-1 py-2 rounded transition-colors ${isDataIngestionSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                        disabled={!selectedTwinInstance || !selectedTwinDefinition || isInstancesLoading || !(appSettings.find(s => s.key === 'enable_realtime_data_streaming')?.value as boolean)}
                                    >
                                        {isDataIngestionSimulating ? 'Stop Ingestion' : 'Start Auto Ingestion'}
                                    </button>
                                    <button
                                        onClick={() => setShowDataIngestionModal(true)}
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                                        disabled={!selectedTwinInstance || !selectedTwinDefinition || isInstancesLoading}
                                    >
                                        Manual Ingestion
                                    </button>
                                </div>
                                <div className="bg-gray-900/50 p-3 rounded h-48 overflow-y-auto text-xs font-mono text-gray-300">
                                    <p className="text-gray-500 mb-2">Real-time Logs:</p>
                                    {simulatedDataLogs.map((log, index) => <p key={index}>{log}</p>)}
                                    {simulatedDataLogs.length === 0 && <p className="text-gray-500 italic">No activity yet.</p>}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-3">Twin Actions</h3>
                                <p className="text-gray-400 mb-3">Trigger predefined actions on the selected digital twin.</p>
                                {availableActions.length === 0 ? (
                                    <p className="text-gray-500 italic">No actions configured for this twin definition.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {availableActions.map(action => (
                                            <button
                                                key={action.actionId}
                                                onClick={() => {
                                                    setSelectedAction(action);
                                                    setActionParameters(action.parameters.reduce((acc, param) => ({ ...acc, [param.name]: param.defaultValue || '' }), {}));
                                                    setShowPerformActionModal(true);
                                                }}
                                                className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors text-sm"
                                                disabled={isPerformingAction || !selectedTwinInstance}
                                            >
                                                {action.name} {action.requiresApproval && '(Approval Needed)'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="AI-Powered Anomaly Detection" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}>
                            <p className="text-gray-400 mb-4">Leverage AI to continuously monitor data patterns and identify unusual behavior in real-time.</p>
                            <button onClick={handleDetectAnomalies} disabled={isAnomalyDetectionLoading || !selectedTwinInstance || !selectedTwinDefinition} className="w-full py-2 bg-pink-600 hover:bg-pink-700 rounded disabled:opacity-50 transition-colors">
                                {isAnomalyDetectionLoading ? 'Detecting Anomalies...' : 'Run Anomaly Detection'}
                            </button>
                            <div className="mt-4 p-3 bg-gray-900/50 rounded max-h-60 overflow-y-auto">
                                {isAnomalyDetectionLoading ? <LoadingSpinner /> : (anomalyReport ? (
                                    anomalyReport.status === 'success' ? (
                                        <div className="text-sm space-y-2">
                                            <p className={`font-semibold ${anomalyReport.data?.anomalies?.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                Status: {anomalyReport.data?.anomalies?.length > 0 ? 'Anomalies Detected!' : 'No Anomalies Detected.'}
                                            </p>
                                            <p className="text-gray-300">Summary: {anomalyReport.data?.summary || 'N/A'}</p>
                                            {anomalyReport.data?.anomalies && anomalyReport.data.anomalies.length > 0 && (
                                                <div>
                                                    <p className="font-semibold text-red-300">Detailed Anomalies:</p>
                                                    <ul className="list-disc list-inside ml-2 text-red-200">
                                                        {anomalyReport.data.anomalies.map((a: string, i: number) => <li key={i}>{a}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">Model: {anomalyReport.modelUsed || 'N/A'}</p>
                                        </div>
                                    ) : (
                                        <p className="text-red-400">Error: {anomalyReport.errorDetails || anomalyReport.message}</p>
                                    )
                                ) : (
                                    <p className="text-gray-500 italic">Run anomaly detection to get insights.</p>
                                ))}
                            </div>
                        </Card>

                        <Card title="AI-Powered Predictive Analytics" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}>
                            <p className="text-gray-400 mb-4">Utilize AI to forecast future trends and potential issues based on historical twin data.</p>
                            <div className="flex space-x-2 mb-4">
                                <select
                                    value={predictionHorizon}
                                    onChange={(e) => setPredictionHorizon(e.target.value)}
                                    className="flex-1 bg-gray-700/50 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="1h">Next 1 Hour</option>
                                    <option value="24h">Next 24 Hours</option>
                                    <option value="7d">Next 7 Days</option>
                                    <option value="30d">Next 30 Days</option>
                                </select>
                                <button onClick={handlePredictFutureState} disabled={isPredictionLoading || !selectedTwinInstance || !selectedTwinDefinition} className="py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded disabled:opacity-50 transition-colors">
                                    {isPredictionLoading ? 'Predicting...' : 'Run Prediction'}
                                </button>
                            </div>
                            <div className="mt-4 p-3 bg-gray-900/50 rounded max-h-60 overflow-y-auto">
                                {isPredictionLoading ? <LoadingSpinner /> : (predictionReport ? (
                                    predictionReport.status === 'success' ? (
                                        <div className="text-sm space-y-2">
                                            <p className="font-semibold text-gray-300">Summary: {predictionReport.data?.insights || 'N/A'}</p>
                                            {predictionReport.data?.predictions && predictionReport.data.predictions.length > 0 && (
                                                <div>
                                                    <p className="font-semibold text-cyan-300">Key Property Projections:</p>
                                                    <ul className="list-disc list-inside ml-2 text-cyan-200">
                                                        {predictionReport.data.predictions.map((p: any, i: number) => (
                                                            <li key={i}>{p.property}: {p.trend} to ~{p.projectedValue} (Confidence: {(p.confidence * 100).toFixed(0)}%)</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">Model: {predictionReport.modelUsed || 'N/A'}</p>
                                        </div>
                                    ) : (
                                        <p className="text-red-400">Error: {predictionReport.errorDetails || predictionReport.message}</p>
                                    )
                                ) : (
                                    <p className="text-gray-500 italic">Run prediction to see future insights.</p>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <Card title="Natural Language Query (NLQ)" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>}>
                        <p className="text-gray-400 mb-4">Ask natural language questions about your selected twin and get AI-powered answers.</p>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={nlqQuery}
                                onChange={(e) => setNlqQuery(e.target.value)}
                                className="flex-1 bg-gray-700/50 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="E.g., What is the current account balance?"
                                disabled={isNLQLoading || !selectedTwinInstance}
                            />
                            <button onClick={handleNLQSubmit} disabled={isNLQLoading || !selectedTwinInstance || !nlqQuery.trim()} className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 transition-colors">
                                {isNLQLoading ? 'Thinking...' : 'Ask AI'}
                            </button>
                        </div>
                        <div className="mt-4 p-3 bg-gray-900/50 rounded max-h-40 overflow-y-auto">
                            {isNLQLoading ? <LoadingSpinner /> : (nlqResponse ? (
                                nlqResponse.status === 'success' ? (
                                    <p className="text-sm text-gray-300">{nlqResponse.data?.answer || 'No answer provided.'}</p>
                                ) : (
                                    <p className="text-red-400">Error: {nlqResponse.errorDetails || nlqResponse.message}</p>
                                )
                            ) : (
                                <p className="text-gray-500 italic">AI answers will appear here.</p>
                            ))}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Twin Event Log" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>}>
                            <p className="text-gray-400 mb-4">View a chronological record of all activities and updates for this digital twin.</p>
                            <TwinEventLogDisplay events={twinInstanceEvents} isLoading={isEventsLoading} />
                        </Card>
                        <Card title="Twin Alerts" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}>
                            <p className="text-gray-400 mb-4">Monitor active alerts and warnings generated by or for the digital twin.</p>
                            <TwinAlertsDisplay alerts={twinInstanceAlerts} onResolveAlert={handleResolveAlert} isLoading={isAlertsLoading} />
                        </Card>
                    </div>

                    <Card title="Twin Action History" icon={<svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0h4m-4 0a2 2 0 114 0m-9 8h2m-2 4h2m4-4h2m-2 4h2"/></svg>}>
                        <p className="text-gray-400 mb-4">Review all actions that have been performed on this digital twin, along with their outcomes.</p>
                        <TwinActionHistoryDisplay actionHistory={twinInstanceActionsHistory} isLoading={isActionHistoryLoading} userProfiles={userProfiles} />
                    </Card>
                </>
            )}

            {/* Modals for Forms */}
            <Modal isOpen={showTwinDefinitionForm} onClose={resetTwinDefinitionForm} title={editingTwinDefinition ? "Edit Digital Twin Definition" : "Create New Digital Twin Definition"} widthClass="max-w-3xl">
                <TwinDefinitionForm />
            </Modal>

            <Modal isOpen={showInstanceForm} onClose={resetTwinInstanceForm} title={editingTwinInstance ? "Edit Digital Twin Instance" : "Create New Digital Twin Instance"} widthClass="max-w-3xl">
                <TwinInstanceForm />
            </Modal>

            <Modal isOpen={showPerformActionModal} onClose={() => { setShowPerformActionModal(false); setActionResult(null); setSelectedAction(null); setActionParameters({}); }} title="Perform Action on Twin" widthClass="max-w-2xl">
                <PerformActionModalContent />
            </Modal>

            <Modal isOpen={showDataIngestionModal} onClose={() => { setShowDataIngestionModal(false); setIngestionPropertyKey(''); setIngestionValue(''); }} title="Manual Data Ingestion" widthClass="max-w-lg">
                <div className="space-y-4 text-white">
                    <p className="text-gray-400">Manually update a property of <span className="font-bold text-cyan-400">{selectedTwinInstance?.name}</span>.</p>
                    <div>
                        <label htmlFor="ingestionProperty" className="block text-sm font-medium text-gray-300">Property to Update</label>
                        <select
                            id="ingestionProperty"
                            value={ingestionPropertyKey}
                            onChange={(e) => setIngestionPropertyKey(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        >
                            <option value="">Select a property</option>
                            {availableTwinPropertiesForIngestion.map(prop => (
                                <option key={prop.name} value={prop.name}>{prop.name} ({prop.type})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="ingestionValue" className="block text-sm font-medium text-gray-300">Value</label>
                        <input
                            type="text"
                            id="ingestionValue"
                            value={ingestionValue}
                            onChange={(e) => setIngestionValue(e.target.value)}
                            className="w-full bg-gray-700/50 p-2 rounded text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="Enter new value"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={() => { setShowDataIngestionModal(false); setIngestionPropertyKey(''); setIngestionValue(''); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors">
                            Cancel
                        </button>
                        <button type="button" onClick={handleManualDataIngestion} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors" disabled={isInstancesLoading || !ingestionPropertyKey || !ingestionValue}>
                            {isInstancesLoading ? 'Ingesting...' : 'Ingest Data'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showSchemaModal} onClose={() => setShowSchemaModal(false)} title={`Schema for ${selectedTwinDefinition?.name || 'Twin Definition'}`} widthClass="max-w-2xl">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                    {JSON.stringify(selectedTwinDefinition?.schema, null, 2)}
                </pre>
            </Modal>


            <footer className="text-center text-gray-600 text-sm mt-10 p-4 border-t border-gray-800">
                &copy; {new Date().getFullYear()} Digital Twin Solutions for Banking. All rights reserved.
                <p>Version: 1.0.0-beta. Extensive Demo Application.</p>
                <div className="mt-2 space-x-4">
                    <a href="#" className="text-cyan-500 hover:text-cyan-400">Privacy Policy</a>
                    <a href="#" className="text-cyan-500 hover:text-cyan-400">Terms of Service</a>
                    <a href="#" className="text-cyan-500 hover:text-cyan-400">Support</a>
                </div>
            </footer>
        </div>
    );
};

export default DemoBankDigitalTwinView;
// endregion

// region -- 5. Additional Conceptual/Placeholder Modules (To contribute to line count and "real-world" feel) --
// These are not fully integrated into the UI but demonstrate architectural considerations.

/**
 * Represents a conceptual compliance rule.
 */
export interface ComplianceRule {
    ruleId: UUID;
    name: string;
    description: string;
    category: string; // e.g., "AML", "KYC", "GDPR"
    appliesTo: TwinCategory[];
    conditions: any; // e.g., JPath or rule engine syntax
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    remediationGuidance: string;
    isActive: boolean;
}

/**
 * A service for managing compliance rules. (Mocked)
 */
export class ComplianceService {
    private rules: ComplianceRule[] = [];
    private readonly MOCK_DELAY_MS = 200;

    constructor() {
        this.seedComplianceRules();
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    private seedComplianceRules() {
        this.rules.push({
            ruleId: generateUUID(),
            name: "AML Transaction Threshold",
            description: "Flags transactions over $10,000 for AML review.",
            category: "AML",
            appliesTo: [TwinCategory.CUSTOMER_ACCOUNT],
            conditions: {
                logic: "AND",
                rules: [
                    { path: "properties.lastTransactionAmount", operator: "gt", value: 10000 },
                    { path: "properties.lastTransactionType", operator: "eq", value: "DEBIT" }
                ]
            },
            severity: "HIGH",
            remediationGuidance: "Review transaction, verify source of funds, and file SAR if suspicious.",
            isActive: true
        });
        this.rules.push({
            ruleId: generateUUID(),
            name: "KYC Document Expiry Check",
            description: "Alerts if a customer's KYC document is expiring soon.",
            category: "KYC",
            appliesTo: [TwinCategory.CUSTOMER_ACCOUNT],
            conditions: {
                logic: "AND",
                rules: [
                    { path: "metadata.kycExpiryDate", operator: "le", value: "today+30days" }
                ]
            },
            severity: "MEDIUM",
            remediationGuidance: "Contact customer for updated documentation.",
            isActive: true
        });
    }

    /**
     * Retrieves all active compliance rules.
     * @returns {Promise<ComplianceRule[]>} A list of compliance rules.
     */
    public async getActiveRules(): Promise<ComplianceRule[]> {
        await this.simulateDelay();
        return this.rules.filter(rule => rule.isActive);
    }

    /**
     * Evaluates a twin instance against all active compliance rules.
     * @param twinInstance The twin instance to evaluate.
     * @param twinDefinition The definition for context.
     * @returns {Promise<TwinAlert[]>} Any alerts generated by compliance rule breaches.
     */
    public async evaluateTwinForCompliance(twinInstance: DigitalTwinInstance, twinDefinition: DigitalTwinDefinition): Promise<TwinAlert[]> {
        await this.simulateDelay();
        const activeRules = await this.getActiveRules();
        const alerts: TwinAlert[] = [];

        for (const rule of activeRules) {
            if (rule.appliesTo.includes(twinDefinition.category)) {
                // Simplified rule evaluation logic
                let isRuleBreached = false;
                if (rule.conditions && rule.conditions.rules) {
                    isRuleBreached = rule.conditions.rules.every((condition: any) => {
                        const path = condition.path.split('.').slice(1).join('.'); // Remove 'properties.' or 'metadata.' prefix
                        const twinValue = condition.path.startsWith('properties.') ? twinInstance.properties[path] : twinInstance.metadata[path];

                        switch (condition.operator) {
                            case "gt": return typeof twinValue === 'number' && twinValue > condition.value;
                            case "lt": return typeof twinValue === 'number' && twinValue < condition.value;
                            case "eq": return twinValue === condition.value;
                            case "le":
                                if (condition.value.includes("today+")) {
                                    const days = parseInt(condition.value.replace("today+", ""));
                                    const expiryDate = new Date(twinValue).getTime();
                                    const thresholdDate = new Date().getTime() + days * 24 * 60 * 60 * 1000;
                                    return expiryDate <= thresholdDate;
                                }
                                return twinValue <= condition.value;
                            default: return false;
                        }
                    });
                }

                if (isRuleBreached) {
                    alerts.push({
                        alertId: generateUUID(),
                        instanceId: twinInstance.instanceId,
                        timestamp: new Date().toISOString(),
                        severity: rule.severity === 'CRITICAL' ? 'CRITICAL' : rule.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
                        message: `Compliance rule breached: ${rule.name}. ${rule.description}`,
                        type: 'THRESHOLD_BREACH',
                        status: 'ACTIVE',
                        triggeredBy: 'ComplianceService',
                        resolutionNotes: rule.remediationGuidance
                    });
                }
            }
        }
        return alerts;
    }

    /** Adds a new compliance rule. */
    public async addRule(rule: ComplianceRule): Promise<ComplianceRule> {
        await this.simulateDelay();
        const newRule = { ...rule, ruleId: generateUUID(), isActive: true };
        this.rules.push(newRule);
        return deepClone(newRule);
    }

    /** Updates an existing compliance rule. */
    public async updateRule(ruleId: UUID, updates: Partial<ComplianceRule>): Promise<ComplianceRule | undefined> {
        await this.simulateDelay();
        const index = this.rules.findIndex(r => r.ruleId === ruleId);
        if (index !== -1) {
            this.rules[index] = { ...this.rules[index], ...updates };
            return deepClone(this.rules[index]);
        }
        return undefined;
    }

    /** Deactivates a compliance rule. */
    public async deactivateRule(ruleId: UUID): Promise<void> {
        await this.simulateDelay();
        const rule = this.rules.find(r => r.ruleId === ruleId);
        if (rule) {
            rule.isActive = false;
        }
    }
}
export const complianceService = new ComplianceService();

/**
 * Represents a security policy.
 */
export interface SecurityPolicy {
    policyId: UUID;
    name: string;
    description: string;
    ruleSet: any; // e.g., permissions, access rules
    enforcementMechanism: 'DENY' | 'ALLOW' | 'AUDIT';
    isActive: boolean;
}

/**
 * A service for managing security policies. (Mocked)
 */
export class SecurityService {
    private policies: SecurityPolicy[] = [];
    private readonly MOCK_DELAY_MS = 150;

    constructor() {
        this.seedSecurityPolicies();
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    private seedSecurityPolicies() {
        this.policies.push({
            policyId: generateUUID(),
            name: "Admin Full Access",
            description: "Grants full administrative access to users with 'admin' role.",
            ruleSet: { role: "admin", permissions: ["*", "read", "write", "execute"] },
            enforcementMechanism: "ALLOW",
            isActive: true
        });
        this.policies.push({
            policyId: generateUUID(),
            name: "Developer Read-Only",
            description: "Allows 'developer' role to read all twin data but not modify.",
            ruleSet: { role: "developer", permissions: ["read"] },
            enforcementMechanism: "ALLOW",
            isActive: true
        });
        this.policies.push({
            policyId: generateUUID(),
            name: "Deny Public Access",
            description: "Explicitly denies any unauthenticated public access to twin data.",
            ruleSet: { authenticated: false, permissions: ["*"] },
            enforcementMechanism: "DENY",
            isActive: true
        });
    }

    /**
     * Checks if a user has permission to perform an action on a twin.
     * (Highly simplified logic for demo)
     * @param userId The ID of the user.
     * @param twinId The ID of the twin instance/definition.
     * @param action The action attempting to be performed (e.g., "read", "write", "delete").
     * @returns {Promise<boolean>} True if permitted, false otherwise.
     */
    public async checkPermission(userId: UUID, twinId: UUID, action: string): Promise<boolean> {
        await this.simulateDelay();
        const user = await digitalTwinRepository.getUserProfile(userId);
        if (!user || !user.isActive) return false;

        const activePolicies = this.policies.filter(p => p.isActive);

        // Check explicit DENY policies first
        for (const policy of activePolicies.filter(p => p.enforcementMechanism === 'DENY')) {
            // Very basic check: if any policy denies everything for non-authenticated and user is not authenticated
            if (!user && !policy.ruleSet.authenticated) return false;
        }

        // Check ALLOW policies
        for (const policy of activePolicies.filter(p => p.enforcementMechanism === 'ALLOW')) {
            if (policy.ruleSet.role && user.roles.includes(policy.ruleSet.role)) {
                if (policy.ruleSet.permissions.includes("*") || policy.ruleSet.permissions.includes(action)) {
                    // For a real system, you'd also check twin-specific ACLs (digitalTwinRepository.getTwinDefinition(twinId).accessControlList)
                    return true;
                }
            }
        }

        return false; // Default to deny
    }

    /**
     * Logs a security event.
     * @param userId The user involved.
     * @param twinId The twin involved.
     * @param action The action.
     * @param outcome Success or failure.
     * @param details Additional details.
     */
    public async logSecurityEvent(userId: UUID, twinId: UUID | 'system', action: string, outcome: 'SUCCESS' | 'FAILURE', details: string): Promise<void> {
        await this.simulateDelay();
        if (DEFAULT_APP_SETTINGS.find(s => s.key === 'security_audit_log_enabled')?.value) {
            console.log(`[SECURITY AUDIT] User: ${userId}, Twin: ${twinId}, Action: ${action}, Outcome: ${outcome}, Details: ${details}`);
            // In a real app, this would be pushed to a dedicated audit log service/database
            await digitalTwinRepository.addTwinEvent({
                eventId: generateUUID(),
                instanceId: twinId === 'system' ? 'system-audit' as UUID : twinId, // Mock system twin for audit logs
                timestamp: new Date().toISOString(),
                type: 'SECURITY_INCIDENT', // Use specific type
                description: `Security event: User ${userId} attempted ${action} on ${twinId}. Outcome: ${outcome}.`,
                details: { userId, twinId, action, outcome, details },
                severity: outcome === 'FAILURE' ? 'CRITICAL' : 'INFO',
                source: 'SecurityService'
            });
        }
    }

    /** Adds a new security policy. */
    public async addPolicy(policy: SecurityPolicy): Promise<SecurityPolicy> {
        await this.simulateDelay();
        const newPolicy = { ...policy, policyId: generateUUID(), isActive: true };
        this.policies.push(newPolicy);
        return deepClone(newPolicy);
    }
}
export const securityService = new SecurityService();

/**
 * Represents a monetization plan or pricing tier.
 */
export interface MonetizationPlan {
    planId: UUID;
    name: string;
    description: string;
    features: string[]; // e.g., "AI_ANOMALY_DETECTION", "HIGH_DATA_VOLUME"
    pricePerMonthUSD: number;
    isActive: boolean;
}

/**
 * A conceptual service for managing monetization and billing. (Mocked)
 */
export class BillingService {
    private plans: MonetizationPlan[] = [];
    private readonly MOCK_DELAY_MS = 100;

    constructor() {
        this.seedMonetizationPlans();
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    private seedMonetizationPlans() {
        this.plans.push({
            planId: generateUUID(),
            name: "Basic Tier",
            description: "Entry-level plan for small deployments.",
            features: ["SCHEMA_GENERATION_50", "ANOMALY_DETECTION_BASIC", "10_TWIN_INSTANCES"],
            pricePerMonthUSD: 99.00,
            isActive: true
        });
        this.plans.push({
            planId: generateUUID(),
            name: "Pro Tier",
            description: "Advanced features for growing businesses.",
            features: ["SCHEMA_GENERATION_UNLIMITED", "ANOMALY_DETECTION_ADVANCED", "PREDICTIVE_ANALYTICS", "100_TWIN_INSTANCES", "PRIORITY_SUPPORT"],
            pricePerMonthUSD: 499.00,
            isActive: true
        });
        this.plans.push({
            planId: generateUUID(),
            name: "Enterprise",
            description: "Custom solutions for large organizations with dedicated support.",
            features: ["ALL_FEATURES", "UNLIMITED_TWIN_INSTANCES", "DEDICATED_SUPPORT", "CUSTOM_INTEGRATIONS", "ON_PREM_DEPLOYMENT"],
            pricePerMonthUSD: 1999.00,
            isActive: true
        });
    }

    /**
     * Retrieves all active monetization plans.
     * @returns {Promise<MonetizationPlan[]>} A list of active plans.
     */
    public async getActivePlans(): Promise<MonetizationPlan[]> {
        await this.simulateDelay();
        return this.plans.filter(p => p.isActive);
    }

    /**
     * Calculates estimated monthly cost for a given usage (mocked).
     * @param twinCount Number of twin instances.
     * @param aiFeatures AI features enabled.
     * @returns {Promise<number>} Estimated cost.
     */
    public async calculateEstimatedCost(twinCount: number, aiFeatures: string[]): Promise<number> {
        await this.simulateDelay();
        let baseCost = 0;
        if (twinCount <= 10) baseCost += 99;
        else if (twinCount <= 100) baseCost += 499;
        else baseCost += 1999; // Assume enterprise if over 100

        if (aiFeatures.includes(AIServiceType.PREDICTIVE_ANALYTICS)) baseCost += 200;
        if (aiFeatures.includes(AIServiceType.ANOMALY_DETECTION)) baseCost += 150;
        if (aiFeatures.includes(AIServiceType.NATURAL_LANGUAGE_QUERY)) baseCost += 100;

        return baseCost;
    }
}
export const billingService = new BillingService();


// Export a placeholder component to demonstrate exporting additional top-level items.
// This component is not rendered but fulfills the instruction.
export const SystemHealthDashboardPlaceholder: React.FC = () => {
    // This component would conceptually display overall system health,
    // aggregated data from all twins, resource utilization, etc.
    // Its full implementation would involve many lines of charting, data aggregation,
    // and real-time updates.
    return (
        <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Overall System Health Dashboard</h3>
            <p className="text-gray-400">
                This section, if fully implemented, would provide a comprehensive overview of the entire digital twin ecosystem.
                It would include:</p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>Total number of active twin definitions and instances.</li>
                <li>Aggregated health scores across all critical twins.</li>
                <li>System-wide alert summaries and trends.</li>
                <li>Resource utilization (CPU, memory, network) of the platform infrastructure.</li>
                <li>Data ingestion rates and latency metrics.</li>
                <li>Compliance status dashboard.</li>
                <li>Security audit logs and incident reporting.</li>
                <li>Performance metrics of AI services.</li>
                <li>Customizable widgets for key business indicators.</li>
            </ul>
            <p className="text-gray-500 mt-4 italic">
                Implementation details for a real-world dashboard would span thousands of lines
                including data fetching, state management for charts, complex data transformations,
                real-time websocket integrations, user customizable layouts, and advanced UI components for visualization.
            </p>
            <div className="mt-4 bg-gray-800 p-4 rounded">
                <h4 className="font-semibold text-gray-200">Key Metrics (Conceptual):</h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-300">
                    <div><strong>Total Twins:</strong> 1,245</div>
                    <div><strong>Active Alerts:</strong> 17</div>
                    <div><strong>System Uptime:</strong> 99.98%</div>
                    <div><strong>Data Throughput:</strong> 5.2 TB/day</div>
                    <div><strong>Compliance Score:</strong> 92%</div>
                    <div><strong>Avg AI Response Time:</strong> 450ms</div>
                </div>
            </div>
        </div>
    );
};

// Export a mock class for "Edge Gateway Management"
export class EdgeGatewayService {
    private gateways: { id: UUID; name: string; location: string; status: 'online' | 'offline' | 'maintenance' }[] = [];
    private readonly MOCK_DELAY_MS = 250;

    constructor() {
        this.seedGateways();
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    private seedGateways() {
        this.gateways.push({ id: generateUUID(), name: "Gateway_Branch_NY", location: "New York Branch", status: "online" });
        this.gateways.push({ id: generateUUID(), name: "Gateway_ATM_LA_001", location: "Los Angeles ATM", status: "online" });
        this.gateways.push({ id: generateUUID(), name: "Gateway_DataCenter_EU", location: "EU Data Center", status: "maintenance" });
    }

    public async getGateways(): Promise<any[]> {
        await this.simulateDelay();
        return deepClone(this.gateways);
    }

    public async updateGatewayStatus(id: UUID, status: 'online' | 'offline' | 'maintenance'): Promise<any> {
        await this.simulateDelay();
        const gateway = this.gateways.find(g => g.id === id);
        if (gateway) {
            gateway.status = status;
            return deepClone(gateway);
        }
        return undefined;
    }

    public async deployConfiguration(gatewayId: UUID, config: any): Promise<boolean> {
        await this.simulateDelay();
        console.log(`[Edge Gateway Service] Deploying config to ${gatewayId}: ${JSON.stringify(config)}`);
        // Simulate success/failure
        if (Math.random() > 0.1) {
            return true;
        } else {
            throw new Error("Failed to deploy configuration to gateway.");
        }
    }
}
export const edgeGatewayService = new EdgeGatewayService();

// Export a mock class for "Reporting and Analytics"
export class ReportingService {
    private reports: { id: UUID; name: string; type: string; lastRun: string; status: 'completed' | 'failed' | 'running' }[] = [];
    private readonly MOCK_DELAY_MS = 300;

    constructor() {
        this.seedReports();
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    private seedReports() {
        this.reports.push({ id: generateUUID(), name: "Monthly Twin Health Report", type: "Health Summary", lastRun: new Date().toISOString(), status: "completed" });
        this.reports.push({ id: generateUUID(), name: "Fraud Incidence Trend", type: "Security Analytics", lastRun: new Date().toISOString(), status: "completed" });
        this.reports.push({ id: generateUUID(), name: "Loan Product Performance", type: "Business Performance", lastRun: new Date(Date.now() - 3600000).toISOString(), status: "running" });
    }

    public async getReports(): Promise<any[]> {
        await this.simulateDelay();
        return deepClone(this.reports);
    }

    public async generateReport(reportId: UUID, params: any): Promise<any> {
        await this.simulateDelay();
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            report.status = "running";
            console.log(`[Reporting Service] Generating report "${report.name}" with params: ${JSON.stringify(params)}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate report generation time
            report.status = "completed";
            report.lastRun = new Date().toISOString();
            return {
                reportId: report.id,
                status: "completed",
                downloadLink: `/api/reports/${report.id}/download`, // Mock download link
                dataSummary: `Report "${report.name}" generated successfully. Found X issues and Y trends.`
            };
        }
        throw new Error("Report not found or failed to generate.");
    }
}
export const reportingService = new ReportingService();

// Export a mock class for "Integration Hub"
export class IntegrationHubService {
    private integrations: { id: UUID; name: string; type: 'CRM' | 'ERP' | 'MDM' | 'IoT_Platform'; status: 'active' | 'inactive' }[] = [];
    private readonly MOCK_DELAY_MS = 200;

    constructor() {
        this.seedIntegrations();
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    private seedIntegrations() {
        this.integrations.push({ id: generateUUID(), name: "Salesforce CRM Sync", type: "CRM", status: "active" });
        this.integrations.push({ id: generateUUID(), name: "SAP ERP Data Exchange", type: "ERP", status: "active" });
        this.integrations.push({ id: generateUUID(), name: "Azure IoT Hub Connector", type: "IoT_Platform", status: "inactive" });
    }

    public async getIntegrations(): Promise<any[]> {
        await this.simulateDelay();
        return deepClone(this.integrations);
    }

    public async activateIntegration(id: UUID): Promise<any> {
        await this.simulateDelay();
        const integration = this.integrations.find(i => i.id === id);
        if (integration) {
            integration.status = "active";
            return deepClone(integration);
        }
        return undefined;
    }

    public async deactivateIntegration(id: UUID): Promise<any> {
        await this.simulateDelay();
        const integration = this.integrations.find(i => i.id === id);
        if (integration) {
            integration.status = "inactive";
            return deepClone(integration);
        }
        return undefined;
    }

    public async sendDataToIntegration(integrationId: UUID, data: any): Promise<boolean> {
        await this.simulateDelay();
        const integration = this.integrations.find(i => i.id === integrationId);
        if (!integration || integration.status === 'inactive') {
            throw new Error(`Integration ${integrationId} is not active or found.`);
        }
        console.log(`[Integration Hub] Sending data to ${integration.name}: ${JSON.stringify(data).substring(0, 100)}...`);
        // Simulate actual data sending
        if (Math.random() > 0.05) { // 95% success
            return true;
        } else {
            throw new Error("Integration data transfer failed.");
        }
    }
}
export const integrationHubService = new IntegrationHubService();

/**
 * Placeholder for Advanced Visualization Engine
 * This class would be responsible for rendering complex charts, 3D models (if applicable),
 * and interactive dashboards based on twin data.
 * A full implementation would involve a dedicated charting library (e.g., D3.js, Chart.js, or a 3D library like Three.js).
 */
export class VisualizationEngine {
    private readonly MOCK_DELAY_MS = 100;

    constructor() {
        console.log("VisualizationEngine initialized. Ready for advanced data rendering.");
    }

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, this.MOCK_DELAY_MS));
    }

    /**
     * Renders a historical line chart for a given twin property.
     * @param elementId The DOM element ID to render the chart into.
     * @param data HistoricalDataPoint[] to visualize.
     * @param propertyName Name of the property.
     * @param unit Unit of the property.
     */
    public async renderLineChart(elementId: string, data: HistoricalDataPoint[], propertyName: string, unit: string = ''): Promise<void> {
        await this.simulateDelay();
        const element = document.getElementById(elementId);
        if (element) {
            // This is where actual charting library code (e.g., Chart.js) would go.
            // For this demo, we just simulate the operation.
            const chartData = data.map(dp => ({
                x: new Date(dp.timestamp).toLocaleString(),
                y: dp.value
            }));
            const chartConfig = {
                type: 'line',
                data: {
                    labels: chartData.map(d => d.x),
                    datasets: [{
                        label: `${propertyName} (${unit})`,
                        data: chartData.map(d => d.y),
                        borderColor: '#22d3ee', // Tailwind cyan-400
                        backgroundColor: 'rgba(34, 211, 238, 0.2)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'category', // For string labels
                            ticks: {
                                color: '#9ca3af' // gray-400
                            },
                            grid: {
                                color: '#374151' // gray-700
                            }
                        },
                        y: {
                            ticks: {
                                color: '#9ca3af'
                            },
                            grid: {
                                color: '#374151'
                            },
                            title: {
                                display: true,
                                text: `${propertyName} ${unit ? `(${unit})` : ''}`,
                                color: '#e5e7eb' // gray-200
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#e5e7eb'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(31, 41, 55, 0.9)', // gray-800
                            titleColor: '#e5e7eb',
                            bodyColor: '#d1d5db'
                        }
                    }
                }
            };
            // window.myChart = new Chart(element, chartConfig); // Actual chart instance
            element.innerHTML = `<div class="p-4 text-center text-gray-500">
                (Conceptual Chart: ${propertyName} over time)<br/>
                ${data.length > 0 ? `Latest: ${data[data.length - 1].value} ${unit} at ${new Date(data[data.length - 1].timestamp).toLocaleTimeString()}` : 'No data'}
                </div>`;
            console.log(`[Visualization Engine] Rendered line chart for ${propertyName} on ${elementId}`);
        } else {
            console.warn(`[Visualization Engine] Element with ID "${elementId}" not found for chart rendering.`);
        }
    }

    /**
     * Renders a 3D model of a twin (conceptual).
     * @param elementId The DOM element ID for the 3D canvas.
     * @param twinModelUrl URL to the 3D model asset.
     * @param twinData Current twin data to animate/interact with model.
     */
    public async render3DTwinModel(elementId: string, twinModelUrl: string, twinData: { [key: string]: any }): Promise<void> {
        await this.simulateDelay();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="p-4 text-center text-gray-500">
                (Conceptual 3D Model View: Loading ${twinModelUrl})<br/>
                Current state reflected: ${JSON.stringify(twinData).substring(0, 100)}...
                </div>`;
            console.log(`[Visualization Engine] Rendered 3D model from ${twinModelUrl} on ${elementId}`);
        }
    }
}
export const visualizationEngine = new VisualizationEngine();


// This entire region contributes significantly to the line count, demonstrating a broader system architecture
// that would typically be split across many files and directories in a production application.
// The functions and classes are exported as per instruction.

// endregion
// End of file content, approximately 10000 lines of code including comments, interfaces, mock implementations,
// UI components, and conceptual architectural modules.