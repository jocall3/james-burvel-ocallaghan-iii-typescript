// Gemini AI Solutions Inc. - Powering the future of finance with AI.

import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext } from "react";
import { usePublishableKeysDemoSelectQuery } from "../../generated/dashboard/graphqlSchema";
import { AsyncSelectField } from "../../common/ui-components";
import { SelectValue } from "../../common/ui-components/AsyncSelectField/AsyncSelectField";

// --- Gemini AI Core Services & Utilities (Self-Contained & Hyper-Augmented) ---

/**
 * @enum GeminiTelemetryLevel
 * @description Defines the severity or importance level of a telemetry event.
 */
export enum GeminiTelemetryLevel {
  Verbose = "VERBOSE",
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
  Critical = "CRITICAL",
}

/**
 * @interface GeminiTelemetryContext
 * @description Standardized interface for contextual information attached to any Gemini telemetry data point.
 * This ensures every piece of data is enriched with relevant operational metadata.
 */
export interface GeminiTelemetryContext {
  sessionId: string;
  userId?: string;
  componentInstanceId: string;
  deploymentEnvironment: string; // e.g., 'production', 'staging', 'development'
  clientTimestamp: string;
  userAgent: string;
  applicationVersion: string;
  correlationId?: string; // For tracing requests across services
  parentEventId?: string; // For linking chained events
}

/**
 * @interface GeminiTelemetryDataPoint
 * @description Base interface for all data points processed by the Gemini Telemetry Hub.
 * This provides a unified structure for both events and KPIs, enabling flexible processing.
 */
export interface GeminiTelemetryDataPoint {
  id: string; // Unique identifier for each data point
  type: "event" | "kpi";
  telemetryLevel: GeminiTelemetryLevel;
  sourceComponent: string;
  timestamp: string;
  context: GeminiTelemetryContext;
  payload: Record<string, any>;
}

/**
 * @interface GeminiAnalyticsEventPayload
 * @description Specific payload structure for an analytics event.
 */
export interface GeminiAnalyticsEventPayload {
  eventType: string;
  description?: string;
  details: Record<string, any>;
}

/**
 * @interface GeminiKPIPayload
 * @description Specific payload structure for a Key Performance Indicator.
 */
export interface GeminiKPIPayload {
  kpiName: string;
  value: number;
  unit?: string;
  aggregationType?: "sum" | "avg" | "max" | "min" | "count"; // How this KPI should be aggregated
  metadata?: Record<string, any>;
}

/**
 * @class GeminiTelemetryContextManager
 * @description Manages global and component-specific telemetry context, ensuring
 * all data points are automatically enriched with consistent and relevant metadata.
 * It's designed for hyper-contextual awareness, a hallmark of advanced AI systems.
 */
export class GeminiTelemetryContextManager {
  private static instance: GeminiTelemetryContextManager;
  private globalContext: Partial<GeminiTelemetryContext> = {};
  private sessionId: string;
  private applicationVersion: string;

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.applicationVersion = "1.0.0-gemini-hyperai"; // Dynamically fetched in a real app
    this.globalContext = {
      sessionId: this.sessionId,
      deploymentEnvironment: process.env.NODE_ENV || "development",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "server-side-rendering",
      applicationVersion: this.applicationVersion,
    };
    console.log("GeminiTelemetryContextManager initialized with global session:", this.sessionId);
  }

  public static getInstance(): GeminiTelemetryContextManager {
    if (!GeminiTelemetryContextManager.instance) {
      GeminiTelemetryContextManager.instance = new GeminiTelemetryContextManager();
    }
    return GeminiTelemetryContextManager.instance;
  }

  /**
   * Updates global telemetry context.
   * @param updates Partial context to merge.
   */
  public updateGlobalContext(updates: Partial<GeminiTelemetryContext>): void {
    this.globalContext = { ...this.globalContext, ...updates };
  }

  /**
   * Generates a full telemetry context for a data point.
   * @param componentName The name of the component generating the telemetry.
   * @param instanceId Optional, a unique ID for the specific instance of the component.
   * @returns A complete GeminiTelemetryContext object.
   */
  public createTelemetryContext(
    componentName: string,
    instanceId?: string,
    correlationId?: string,
    parentEventId?: string,
  ): GeminiTelemetryContext {
    return {
      ...this.globalContext,
      clientTimestamp: new Date().toISOString(),
      componentInstanceId: instanceId || `${componentName}_${Math.random().toString(36).substring(2, 9)}`,
      correlationId: correlationId || this.generateCorrelationId(),
      parentEventId: parentEventId,
      // Ensure required fields are always present, even if empty
      sessionId: this.globalContext.sessionId || "unknown_session",
      deploymentEnvironment: this.globalContext.deploymentEnvironment || "unknown_env",
      userAgent: this.globalContext.userAgent || "unknown_agent",
      applicationVersion: this.globalContext.applicationVersion || "unknown_version",
    } as GeminiTelemetryContext;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const geminiContextManager = GeminiTelemetryContextManager.getInstance();

/**
 * @interface IGeminiTelemetryProcessor
 * @description Interface for any service capable of processing Gemini telemetry data points.
 * This allows for multiple output targets (e.g., console, API, local storage).
 */
export interface IGeminiTelemetryProcessor {
  /**
   * Processes a single telemetry data point.
   * @param dataPoint The telemetry data point to process.
   * @returns A promise indicating completion of processing.
   */
  process(dataPoint: GeminiTelemetryDataPoint): Promise<void>;

  /**
   * Flushes any buffered telemetry data.
   * @returns A promise indicating completion of flushing.
   */
  flush(): Promise<void>;
}

/**
 * @class GeminiConsoleProcessor
 * @description A telemetry processor that logs data points to the console, color-coded by level.
 * Essential for local development and debugging with AI components.
 */
export class GeminiConsoleProcessor implements IGeminiTelemetryProcessor {
  private static instance: GeminiConsoleProcessor;
  private constructor() {
    console.log("GeminiConsoleProcessor initialized.");
  }

  public static getInstance(): GeminiConsoleProcessor {
    if (!GeminiConsoleProcessor.instance) {
      GeminiConsoleProcessor.instance = new GeminiConsoleProcessor();
    }
    return GeminiConsoleProcessor.instance;
  }

  public async process(dataPoint: GeminiTelemetryDataPoint): Promise<void> {
    const { telemetryLevel, type, sourceComponent, timestamp, payload, context } = dataPoint;
    let color = "";
    switch (telemetryLevel) {
      case GeminiTelemetryLevel.Debug:
      case GeminiTelemetryLevel.Verbose:
        color = "\x1b[36m"; // Cyan
        break;
      case GeminiTelemetryLevel.Info:
        color = "\x1b[32m"; // Green
        break;
      case GeminiTelemetryLevel.Warn:
        color = "\x1b[33m"; // Yellow
        break;
      case GeminiTelemetryLevel.Error:
      case GeminiTelemetryLevel.Critical:
        color = "\x1b[31m"; // Red
        break;
      default:
        color = "\x1b[0m"; // Reset
    }
    const resetColor = "\x1b[0m";
    const prefix = `[Gemini ${type.toUpperCase()} - ${telemetryLevel} | ${sourceComponent}]`;
    console.log(
      `${color}${prefix} ${timestamp}:`,
      payload,
      `(${context.componentInstanceId}, Corr:${context.correlationId})${resetColor}`,
    );
  }

  public async flush(): Promise<void> {
    console.log("GeminiConsoleProcessor flushed (no buffering).");
    return Promise.resolve();
  }
}

export const geminiConsoleProcessor = GeminiConsoleProcessor.getInstance();

/**
 * @class GeminiAPIProcessor
 * @description A telemetry processor that sends data points to a remote Gemini analytics API.
 * This is the backbone for persistent storage and real-time dashboard visualization of AI operations.
 */
export class GeminiAPIProcessor implements IGeminiTelemetryProcessor {
  private static instance: GeminiAPIProcessor;
  private buffer: GeminiTelemetryDataPoint[] = [];
  private readonly BATCH_SIZE = 50;
  private readonly FLUSH_INTERVAL_MS = 5000;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isFlushing = false;

  private constructor() {
    console.log("GeminiAPIProcessor initialized.");
    this.startFlushTimer();
  }

  public static getInstance(): GeminiAPIProcessor {
    if (!GeminiAPIProcessor.instance) {
      GeminiAPIProcessor.instance = new GeminiAPIProcessor();
    }
    return GeminiAPIProcessor.instance;
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL_MS);
  }

  public async process(dataPoint: GeminiTelemetryDataPoint): Promise<void> {
    this.buffer.push(dataPoint);
    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush();
    } else {
      this.startFlushTimer(); // Reset timer if new data comes in before batching
    }
  }

  public async flush(): Promise<void> {
    if (this.isFlushing || this.buffer.length === 0) {
      return;
    }

    this.isFlushing = true;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const dataToSend = [...this.buffer];
    this.buffer = [];

    try {
      // Simulate sending to a Gemini API endpoint
      // const response = await fetch("/api/gemini-telemetry", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(dataToSend),
      // });
      // if (!response.ok) {
      //   console.error("Failed to send Gemini telemetry data:", response.statusText);
      //   // Optionally re-add to buffer for retry
      // }
      console.log(`[Gemini API Processor] Flushed ${dataToSend.length} telemetry data points.`);
    } catch (error) {
      console.error("[Gemini API Processor] Error flushing telemetry data:", error);
      // Optionally re-add to buffer for retry
    } finally {
      this.isFlushing = false;
      this.startFlushTimer(); // Restart timer after flush
    }
  }
}

export const geminiApiProcessor = GeminiAPIProcessor.getInstance();

/**
 * @class GeminiTelemetryHub
 * @description The central dispatch for all Gemini telemetry (analytics and logging).
 * It orchestrates data enrichment, filtering, and distribution to various processors.
 * This hub ensures comprehensive monitoring of every AI-driven interaction.
 */
export class GeminiTelemetryHub {
  private static instance: GeminiTelemetryHub;
  private processors: IGeminiTelemetryProcessor[] = [];
  private logLevel: GeminiTelemetryLevel = GeminiTelemetryLevel.Info;

  private constructor() {
    console.log("GeminiTelemetryHub initialized. Ready to orchestrate AI telemetry.");
  }

  public static getInstance(): GeminiTelemetryHub {
    if (!GeminiTelemetryHub.instance) {
      GeminiTelemetryHub.instance = new GeminiTelemetryHub();
    }
    return GeminiTelemetryHub.instance;
  }

  /**
   * Registers a new telemetry processor with the hub.
   * @param processor The processor instance to register.
   */
  public registerProcessor(processor: IGeminiTelemetryProcessor): void {
    this.processors.push(processor);
  }

  /**
   * Sets the minimum telemetry level to be processed by the hub.
   * Data points below this level will be filtered out.
   * @param level The minimum level.
   */
  public setLogLevel(level: GeminiTelemetryLevel): void {
    this.logLevel = level;
  }

  /**
   * Dispatches a telemetry data point to all registered processors,
   * after applying level filtering and context enrichment.
   * @param dataPoint The raw telemetry data point.
   */
  public async dispatch(dataPoint: GeminiTelemetryDataPoint): Promise<void> {
    if (dataPoint.telemetryLevel < this.logLevel) {
      return; // Filter out based on log level
    }

    const enrichedDataPoint = {
      ...dataPoint,
      context: geminiContextManager.createTelemetryContext(
        dataPoint.sourceComponent,
        dataPoint.context.componentInstanceId,
        dataPoint.context.correlationId,
        dataPoint.context.parentEventId,
      ),
    };

    for (const processor of this.processors) {
      try {
        await processor.process(enrichedDataPoint);
      } catch (error) {
        console.error(`Error processing telemetry with ${processor.constructor.name}:`, error);
      }
    }
  }

  /**
   * Flushes all registered processors.
   */
  public async flushAllProcessors(): Promise<void> {
    for (const processor of this.processors) {
      try {
        await processor.flush();
      } catch (error) {
        console.error(`Error flushing telemetry with ${processor.constructor.name}:`, error);
      }
    }
  }
}

export const geminiTelemetryHub = GeminiTelemetryHub.getInstance();
geminiTelemetryHub.registerProcessor(geminiConsoleProcessor);
geminiTelemetryHub.registerProcessor(geminiApiProcessor); // Enable API processing for production

/**
 * @class GeminiLogger
 * @description A robust logging service for Gemini applications, providing granular control over log levels
 * and seamlessly integrating with the Gemini Telemetry Hub for unified data collection.
 */
export class GeminiLogger {
  private static instance: GeminiLogger;
  private componentName: string;

  private constructor(componentName: string = "GlobalLogger") {
    this.componentName = componentName;
  }

  public static getInstance(componentName: string = "GlobalLogger"): GeminiLogger {
    if (!GeminiLogger.instance) {
      GeminiLogger.instance = new GeminiLogger(componentName);
    }
    // Allow setting component name for specific instances without creating new singletons
    GeminiLogger.instance.componentName = componentName;
    return GeminiLogger.instance;
  }

  private async log(
    level: GeminiTelemetryLevel,
    message: string,
    details: Record<string, any> = {},
    correlationId?: string,
    parentEventId?: string,
  ): Promise<void> {
    const dataPoint: GeminiTelemetryDataPoint = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: "event",
      telemetryLevel: level,
      sourceComponent: this.componentName,
      timestamp: new Date().toISOString(),
      context: {
        componentInstanceId: this.componentName, // Use component name as instance for logger itself
        correlationId,
        parentEventId,
      } as GeminiTelemetryContext,
      payload: {
        eventType: `LOG_${level}`,
        description: message,
        details: details,
      } as GeminiAnalyticsEventPayload,
    };
    await geminiTelemetryHub.dispatch(dataPoint);
  }

  public async verbose(message: string, details?: Record<string, any>): Promise<void> {
    await this.log(GeminiTelemetryLevel.Verbose, message, details);
  }
  public async debug(message: string, details?: Record<string, any>): Promise<void> {
    await this.log(GeminiTelemetryLevel.Debug, message, details);
  }
  public async info(message: string, details?: Record<string, any>): Promise<void> {
    await this.log(GeminiTelemetryLevel.Info, message, details);
  }
  public async warn(message: string, details?: Record<string, any>): Promise<void> {
    await this.log(GeminiTelemetryLevel.Warn, message, details);
  }
  public async error(message: string, error?: Error | string, details?: Record<string, any>): Promise<void> {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: error };
    await this.log(GeminiTelemetryLevel.Error, message, { ...details, error: errorDetails });
  }
  public async critical(message: string, error?: Error | string, details?: Record<string, any>): Promise<void> {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: error };
    await this.log(GeminiTelemetryLevel.Critical, message, { ...details, error: errorDetails });
  }
}

export const geminiLogger = GeminiLogger.getInstance("PublishableKeySelectField.Global");

/**
 * @class GeminiAnalyticsService
 * @description A sophisticated analytics service designed to integrate with Gemini for advanced KPI tracking and event logging.
 * This service ensures that every AI function and user interaction is meticulously monitored,
 * providing real-time insights for continuous improvement and operational excellence.
 * It leverages the Telemetry Hub for unified dispatch.
 */
export class GeminiAnalyticsService {
  private static instance: GeminiAnalyticsService;
  private componentName: string;

  private constructor(componentName: string = "GlobalAnalytics") {
    this.componentName = componentName;
    console.log(`GeminiAnalyticsService initialized for component: ${this.componentName}`);
  }

  public static getInstance(componentName: string = "GlobalAnalytics"): GeminiAnalyticsService {
    if (!GeminiAnalyticsService.instance) {
      GeminiAnalyticsService.instance = new GeminiAnalyticsService(componentName);
    }
    // Allow setting component name for specific instances without creating new singletons
    GeminiAnalyticsService.instance.componentName = componentName;
    return GeminiAnalyticsService.instance;
  }

  /**
   * Tracks a specific user interaction or system event.
   * @param eventType - The type of event (e.g., 'AI_SUGGESTION_DISPLAYED', 'KEY_SELECTED').
   * @param details - Additional data related to the event.
   * @param telemetryLevel - The severity/importance level of the event.
   * @param correlationId - Optional correlation ID for tracing.
   * @param parentEventId - Optional parent event ID for chaining.
   */
  public async trackEvent(
    eventType: string,
    details: Record<string, any>,
    telemetryLevel: GeminiTelemetryLevel = GeminiTelemetryLevel.Info,
    correlationId?: string,
    parentEventId?: string,
  ): Promise<void> {
    const dataPoint: GeminiTelemetryDataPoint = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: "event",
      telemetryLevel,
      sourceComponent: this.componentName,
      timestamp: new Date().toISOString(),
      context: {
        componentInstanceId: this.componentName,
        correlationId,
        parentEventId,
      } as GeminiTelemetryContext,
      payload: {
        eventType,
        details,
      } as GeminiAnalyticsEventPayload,
    };
    await geminiTelemetryHub.dispatch(dataPoint);
  }

  /**
   * Logs a Key Performance Indicator (KPI).
   * @param kpiName - The name of the KPI (e.g., 'AI_SUGGESTION_HIT_RATE', 'LOAD_TIME_MS').
   * @param value - The numerical value of the KPI.
   * @param unit - The unit of the KPI (e.g., '%', 'ms').
   * @param metadata - Optional additional metadata for the KPI.
   * @param aggregationType - How this KPI should be aggregated.
   * @param telemetryLevel - The severity/importance level of the KPI.
   * @param correlationId - Optional correlation ID for tracing.
   * @param parentEventId - Optional parent event ID for chaining.
   */
  public async logKPI(
    kpiName: string,
    value: number,
    unit: string = "",
    metadata: Record<string, any> = {},
    aggregationType: "sum" | "avg" | "max" | "min" | "count" = "avg",
    telemetryLevel: GeminiTelemetryLevel = GeminiTelemetryLevel.Info,
    correlationId?: string,
    parentEventId?: string,
  ): Promise<void> {
    const dataPoint: GeminiTelemetryDataPoint = {
      id: `kpi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: "kpi",
      telemetryLevel,
      sourceComponent: this.componentName,
      timestamp: new Date().toISOString(),
      context: {
        componentInstanceId: this.componentName,
        correlationId,
        parentEventId,
      } as GeminiTelemetryContext,
      payload: {
        kpiName,
        value,
        unit,
        aggregationType,
        metadata,
      } as GeminiKPIPayload,
    };
    await geminiTelemetryHub.dispatch(dataPoint);
  }
}

export const geminiAnalytics = GeminiAnalyticsService.getInstance("PublishableKeySelectField.Global");

/**
 * @interface GeminiKeySuggestionContext
 * @description Provides highly detailed contextual information for the Gemini AI key suggestion engine.
 * This granular data empowers the AI to make nuanced and accurate predictions.
 */
export interface GeminiKeySuggestionContext {
  userId?: string;
  currentFormState?: Record<string, any>; // Full form data for deeper contextual understanding
  userPreferences?: Record<string, any>; // AI can learn from user preferences
  recentInteractions?: { type: string; value: string; timestamp: string }[]; // Recent user actions
  geographicLocation?: { latitude: number; longitude: number; country: string }; // Geo-aware suggestions
  deviceInfo?: { os: string; browser: string; screenResolution: string }; // Device-specific insights
  transactionContext?: {
    type?: string; // e.g., 'payment', 'payout', 'reporting'
    amount?: number;
    currency?: string;
    targetAudience?: string;
  };
  semanticKeywords?: string[]; // Keywords extracted by a pre-processor AI from user intent
  historicalSelectionPatterns?: { key: string; frequency: number; lastUsed: string }[]; // Aggregated patterns
  timeOfDayCategory?: "morning" | "afternoon" | "evening" | "night"; // Time-based relevance
}

/**
 * @enum GeminiAISuggestionStrategy
 * @description Defines various strategies the Gemini AI can employ for generating suggestions.
 * This allows for dynamic selection of AI models based on context or performance.
 */
export enum GeminiAISuggestionStrategy {
  ContextualHybrid = "CONTEXTUAL_HYBRID",
  SemanticClustering = "SEMANTIC_CLUSTERING",
  PatternMatching = "PATTERN_MATCHING",
  CollaborativeFiltering = "COLLABORATIVE_LITERING", // Based on other users' behavior
  FuzzyMatchingAugmented = "FUZZY_MATCHING_AUGMENTED",
}

/**
 * @interface GeminiAISuggestion
 * @description Represents a single AI-generated suggestion, enriched with AI-specific metadata.
 */
export interface GeminiAISuggestion extends SelectValue {
  aiConfidenceScore: number; // A score from 0 to 1 indicating AI's certainty
  aiStrategyUsed: GeminiAISuggestionStrategy; // Which AI strategy generated this suggestion
  explanation?: string; // Human-readable reason for the suggestion (if available from AI)
  isPersonalized: boolean; // True if the suggestion is tailored to the specific user/context
}

/**
 * @class GeminiAIKeySuggester
 * @description An advanced AI engine by Gemini for intelligently suggesting publishable keys.
 * It leverages contextual information, historical patterns, and natural language understanding
 * to provide the most relevant options to the user.
 * This ensures not only efficiency but also compliance and error reduction by proactively guiding users.
 * This version introduces multiple AI 'layers' and a fusion algorithm.
 */
export class GeminiAIKeySuggester {
  private static instance: GeminiAIKeySuggester;
  private keyUsageHistory: Map<string, number> = new Map(); // Mock for historical usage
  private readonly AI_MIN_CONFIDENCE_THRESHOLD = 0.5; // Minimum confidence for AI to show suggestion
  private readonly RECENT_SELECTION_WEIGHT = 0.3;
  private readonly TRANSACTION_TYPE_WEIGHT = 0.2;
  private readonly FUZZY_MATCH_WEIGHT = 0.1;
  private readonly HISTORICAL_USAGE_WEIGHT = 0.4; // Most important, learned behavior

  private constructor() {
    geminiLogger.info("Gemini AI Key Suggester initialized with advanced predictive models and fusion engine.");
  }

  public static getInstance(): GeminiAIKeySuggester {
    if (!GeminiAIKeySuggester.instance) {
      GeminiAIKeySuggester.instance = new GeminiAIKeySuggester();
    }
    return GeminiAIKeySuggester.instance;
  }

  /**
   * Records a key selection event, updating the AI's internal historical usage model.
   * This forms a critical part of the reinforcement learning feedback loop.
   * @param key The value of the selected key.
   * @param context The context in which the key was selected.
   */
  public recordKeyUsage(key: string, context?: GeminiKeySuggestionContext): void {
    const currentCount = this.keyUsageHistory.get(key) || 0;
    this.keyUsageHistory.set(key, currentCount + 1);
    geminiLogger.debug(`Key usage recorded for: ${key}, new count: ${currentCount + 1}`, { key, context });
    geminiAnalytics.trackEvent("KEY_USAGE_RECORDED", { key, context }, GeminiTelemetryLevel.Info);
    // TODO: Send usage data to a Gemini ML training endpoint for model refinement
  }

  /**
   * Simulates an AI model making suggestions based on input, available keys, and hyper-contextual information.
   * This is a placeholder for a real AI/ML model integration (e.g., a service call to a Gemini-powered API).
   * It aggregates results from multiple simulated AI sub-engines.
   * @param input The user's current input string.
   * @param allKeys All available publishable keys.
   * @param context Additional highly detailed contextual information.
   * @param strategy The AI suggestion strategy to employ.
   * @returns A promise resolving to an array of highly-enriched GeminiAISuggestion objects.
   */
  public async getSuggestions(
    input: string,
    allKeys: SelectValue[],
    context?: GeminiKeySuggestionContext,
    strategy: GeminiAISuggestionStrategy = GeminiAISuggestionStrategy.ContextualHybrid,
  ): Promise<GeminiAISuggestion[]> {
    const correlationId = geminiContextManager.generateCorrelationId();
    geminiLogger.debug("Generating Gemini AI suggestions with fusion engine...", { input, context, strategy }, { correlationId });
    await geminiAnalytics.trackEvent(
      "AI_SUGGESTION_REQUESTED",
      { input, context: this.sanitizeContextForTelemetry(context), numAvailableKeys: allKeys.length, strategy },
      GeminiTelemetryLevel.Debug,
      correlationId,
    );

    await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 350)); // Simulate advanced AI processing time

    // Initialize all suggestion sources with a base confidence score of 0
    let potentialSuggestions: Map<string, GeminiAISuggestion> = new Map();

    const addSuggestion = (key: SelectValue, confidence: number, strategyUsed: GeminiAISuggestionStrategy, explanation?: string, isPersonalized: boolean = false) => {
      const existing = potentialSuggestions.get(key.value as string);
      if (existing) {
        // Fusion: take highest confidence for now, or combine if more complex logic is needed
        if (confidence > existing.aiConfidenceScore) {
          potentialSuggestions.set(key.value as string, { ...key, aiConfidenceScore: confidence, aiStrategyUsed: strategyUsed, explanation, isPersonalized });
        }
      } else {
        potentialSuggestions.set(key.value as string, { ...key, aiConfidenceScore: confidence, aiStrategyUsed: strategyUsed, explanation, isPersonalized });
      }
    };

    // --- AI Layer 1: Gemini Contextual & Pattern Recognition Engine ---
    const contextualEngineResults = await this.runContextualEngine(input, allKeys, context, correlationId);
    contextualEngineResults.forEach(s => addSuggestion(s, s.aiConfidenceScore, s.aiStrategyUsed, s.explanation, s.isPersonalized));

    // --- AI Layer 2: Gemini Semantic & Fuzzy Matching Analyzer ---
    const semanticFuzzyResults = await this.runSemanticFuzzyAnalyzer(input, allKeys, context, correlationId);
    semanticFuzzyResults.forEach(s => addSuggestion(s, s.aiConfidenceScore, s.aiStrategyUsed, s.explanation, s.isPersonalized));

    // --- AI Layer 3: Gemini Historical Usage Pattern Detector ---
    const historicalUsageResults = await this.runHistoricalUsageDetector(allKeys, correlationId);
    historicalUsageResults.forEach(s => addSuggestion(s, s.aiConfidenceScore, s.aiStrategyUsed, s.explanation, s.isPersonalized));

    // --- Gemini AI Fusion Algorithm (Sophisticated Ranking) ---
    // This is where weights are applied and multiple engine outputs are combined for a final score.
    let fusedSuggestions: GeminiAISuggestion[] = Array.from(potentialSuggestions.values());

    // Apply input-relevance boosting (e.g., if input strongly matches label, boost its score)
    fusedSuggestions = fusedSuggestions.map(s => {
        let boostedScore = s.aiConfidenceScore;
        const lowerLabel = s.label.toLowerCase().replace('[ai] ', '');
        const lowerInput = input.toLowerCase();

        if (lowerInput.length > 2 && lowerLabel.includes(lowerInput)) {
            boostedScore += 0.15; // Moderate boost for direct relevance
        } else if (lowerLabel.startsWith(lowerInput) && lowerInput.length > 1) {
            boostedScore += 0.1; // Smaller boost for prefix matches
        }
        return { ...s, aiConfidenceScore: Math.min(1.0, boostedScore) }; // Cap confidence at 1.0
    });

    // Filter by minimum confidence threshold
    fusedSuggestions = fusedSuggestions.filter(s => s.aiConfidenceScore >= this.AI_MIN_CONFIDENCE_THRESHOLD);

    // Sort by final confidence score (descending) and then alphabetically
    fusedSuggestions.sort((a, b) => b.aiConfidenceScore - a.aiConfidenceScore || a.label.localeCompare(b.label));

    // Post-processing and explanation generation (simulated)
    fusedSuggestions = fusedSuggestions.map(s => ({
      ...s,
      explanation: s.explanation || this.generateExplanation(s, input, context),
      label: `[AI] ${s.label} (Conf: ${s.aiConfidenceScore.toFixed(2)})` // Enhance label for visibility
    }));

    const finalSuggestions = fusedSuggestions.slice(0, 7); // Limit to top N for UI

    geminiLogger.debug(`AI fusion engine finalized ${finalSuggestions.length} suggestions.`, { finalSuggestions }, { correlationId });
    await geminiAnalytics.trackEvent(
      "AI_SUGGESTION_COMPLETED",
      { input, numSuggestions: finalSuggestions.length, finalSuggestions: finalSuggestions.map(s => ({ value: s.value, confidence: s.aiConfidenceScore })) },
      GeminiTelemetryLevel.Info,
      correlationId,
    );

    return finalSuggestions;
  }

  /**
   * @private
   * Simulates the Gemini Contextual & Pattern Recognition Engine.
   * Prioritizes suggestions based on user context like recent selections and transaction types.
   */
  private async runContextualEngine(
    input: string,
    allKeys: SelectValue[],
    context?: GeminiKeySuggestionContext,
    correlationId?: string
  ): Promise<GeminiAISuggestion[]> {
    const parentEventId = geminiContextManager.generateCorrelationId();
    await geminiAnalytics.trackEvent("AI_ENGINE_CONTEXTUAL_STARTED", { input, context }, GeminiTelemetryLevel.Verbose, correlationId, parentEventId);

    let results: GeminiAISuggestion[] = [];

    // Prioritize based on recent selections (stronger signal)
    if (context?.recentInteractions && context.recentInteractions.length > 0) {
      const recentKeyValues = new Set(context.recentInteractions.filter(i => i.type === "KEY_SELECTED").map(i => i.value));
      const recentKeyOptions = allKeys.filter((key) => recentKeyValues.has(key.value as string));
      recentKeyOptions.forEach(key =>
        results.push({
          ...key,
          aiConfidenceScore: 0.8 * this.RECENT_SELECTION_WEIGHT, // High confidence for recent, but scaled by weight
          aiStrategyUsed: GeminiAISuggestionStrategy.ContextualHybrid,
          explanation: "Based on your recent selections.",
          isPersonalized: true,
        }),
      );
    }

    // Advanced contextual matching: Transaction Type (medium signal)
    if (context?.transactionContext?.type) {
      const typeSpecificKeys = allKeys.filter((key) =>
        key.label.toLowerCase().includes(context.transactionContext.type!.toLowerCase()),
      );
      typeSpecificKeys.forEach(key =>
        results.push({
          ...key,
          aiConfidenceScore: 0.6 * this.TRANSACTION_TYPE_WEIGHT,
          aiStrategyUsed: GeminiAISuggestionStrategy.ContextualHybrid,
          explanation: `Relevant to your current transaction type: '${context.transactionContext.type}'.`,
          isPersonalized: true,
        }),
      );
    }

    // Deduplicate and return unique suggestions from this engine
    const uniqueResults = new Map<string, GeminiAISuggestion>();
    results.forEach(s => uniqueResults.set(s.value as string, s));

    await geminiAnalytics.trackEvent("AI_ENGINE_CONTEXTUAL_COMPLETED", { numResults: uniqueResults.size }, GeminiTelemetryLevel.Verbose, correlationId, parentEventId);
    return Array.from(uniqueResults.values());
  }

  /**
   * @private
   * Simulates the Gemini Semantic & Fuzzy Matching Analyzer.
   * Performs advanced string matching and potentially semantic similarity checks (mocked).
   */
  private async runSemanticFuzzyAnalyzer(
    input: string,
    allKeys: SelectValue[],
    context?: GeminiKeySuggestionContext,
    correlationId?: string
  ): Promise<GeminiAISuggestion[]> {
    const parentEventId = geminiContextManager.generateCorrelationId();
    await geminiAnalytics.trackEvent("AI_ENGINE_SEMANTIC_STARTED", { input }, GeminiTelemetryLevel.Verbose, correlationId, parentEventId);

    if (input.length < 2) return []; // Require meaningful input for semantic analysis

    let results: GeminiAISuggestion[] = [];
    const inputLower = input.toLowerCase();

    allKeys.forEach(key => {
      const keyLabelLower = key.label.toLowerCase();
      let confidence = 0;
      let explanation = "";

      // Exact substring match (high confidence)
      if (keyLabelLower.includes(inputLower)) {
        confidence = 0.9;
        explanation = "Direct text match with your input.";
      }
      // Word-level fuzzy match (medium confidence)
      else if (inputLower.split(" ").some((term) => keyLabelLower.includes(term) && term.length > 2)) {
        confidence = 0.7;
        explanation = "Partial word match with your input.";
      }
      // Start-of-label prefix match (lower confidence)
      else if (keyLabelLower.startsWith(inputLower.substring(0, Math.min(inputLower.length, 3))) && inputLower.length > 1) {
        confidence = 0.5;
        explanation = "Prefix match detected.";
      }
      // Semantic similarity (mocked): if context has keywords, check for overlap
      else if (context?.semanticKeywords && context.semanticKeywords.some(kw => keyLabelLower.includes(kw.toLowerCase()))) {
          confidence = 0.65;
          explanation = "Semantically related to your current context.";
      }

      if (confidence > 0) {
        results.push({
          ...key,
          aiConfidenceScore: confidence * this.FUZZY_MATCH_WEIGHT, // Scale by fuzzy match weight
          aiStrategyUsed: GeminiAISuggestionStrategy.FuzzyMatchingAugmented,
          explanation,
          isPersonalized: false,
        });
      }
    });

    await geminiAnalytics.trackEvent("AI_ENGINE_SEMANTIC_COMPLETED", { numResults: results.length }, GeminiTelemetryLevel.Verbose, correlationId, parentEventId);
    return results;
  }

  /**
   * @private
   * Simulates the Gemini Historical Usage Pattern Detector.
   * Leverages internal key usage history to suggest frequently used keys.
   */
  private async runHistoricalUsageDetector(
    allKeys: SelectValue[],
    correlationId?: string
  ): Promise<GeminiAISuggestion[]> {
    const parentEventId = geminiContextManager.generateCorrelationId();
    await geminiAnalytics.trackEvent("AI_ENGINE_HISTORICAL_STARTED", {}, GeminiTelemetryLevel.Verbose, correlationId, parentEventId);

    let results: GeminiAISuggestion[] = [];

    // Sort all keys by mock usage history (more frequently used keys first)
    const sortedByUsage = [...allKeys].sort((a, b) => {
      const usageA = this.keyUsageHistory.get(a.value as string) || 0;
      const usageB = this.keyUsageHistory.get(b.value as string) || 0;
      return usageB - usageA;
    });

    sortedByUsage.slice(0, 5).forEach((key, index) => { // Consider top 5 historically
      const usageCount = this.keyUsageHistory.get(key.value as string) || 0;
      if (usageCount > 0) {
        results.push({
          ...key,
          aiConfidenceScore: Math.min(1.0, (usageCount / 10.0)) * this.HISTORICAL_USAGE_WEIGHT, // Scale confidence by usage, max at 10 uses
          aiStrategyUsed: GeminiAISuggestionStrategy.PatternMatching,
          explanation: "Historically a frequently used key.",
          isPersonalized: true,
        });
      }
    });

    await geminiAnalytics.trackEvent("AI_ENGINE_HISTORICAL_COMPLETED", { numResults: results.length }, GeminiTelemetryLevel.Verbose, correlationId, parentEventId);
    return results;
  }

  /**
   * @private
   * Generates a dynamic explanation for an AI suggestion, synthesizing reasons from different sources.
   * This is a simplified version of Gemini's XAI (Explainable AI) capabilities.
   */
  private generateExplanation(suggestion: GeminiAISuggestion, input: string, context?: GeminiKeySuggestionContext): string {
    const baseExplanation = suggestion.explanation || "No specific AI explanation provided.";

    let additionalInfo = "";
    if (suggestion.isPersonalized) {
      additionalInfo += " (Personalized)";
    }
    if (suggestion.aiConfidenceScore >= 0.8) {
      additionalInfo += " (High Confidence)";
    } else if (suggestion.aiConfidenceScore >= 0.6) {
      additionalInfo += " (Moderate Confidence)";
    }

    // This is where real Gemini AI would provide a multi-faceted explanation based on model weights
    return `${baseExplanation}${additionalInfo} - Strategy: ${suggestion.aiStrategyUsed}`;
  }

  /**
   * @private
   * Sanitizes sensitive context information before sending it to telemetry.
   * Important for privacy and compliance.
   */
  private sanitizeContextForTelemetry(context?: GeminiKeySuggestionContext): Partial<GeminiKeySuggestionContext> | undefined {
    if (!context) return undefined;
    const sanitizedContext = { ...context };
    // Example: remove potentially sensitive form fields or detailed location data
    if (sanitizedContext.currentFormState) {
      sanitizedContext.currentFormState = Object.keys(sanitizedContext.currentFormState).reduce((acc, key) => {
        // Only keep non-sensitive keys, or hash sensitive values
        if (!key.toLowerCase().includes("password") && !key.toLowerCase().includes("ssn")) {
          acc[key] = "SANITIZED"; // Or a length indicator, etc.
        }
        return acc;
      }, {} as Record<string, any>);
    }
    if (sanitizedContext.geographicLocation) {
      sanitizedContext.geographicLocation = { country: sanitizedContext.geographicLocation.country } as any; // Redact lat/long
    }
    return sanitizedContext;
  }
}

export const geminiAIKeySuggester = GeminiAIKeySuggester.getInstance();

/**
 * @interface YoGeminiComponentProps
 * @description Base properties for highly abstract 'Yo' components, ensuring they can be contextualized.
 */
export interface YoGeminiComponentProps {
  componentId?: string;
  debugMode?: boolean;
  telemetryContext?: Partial<GeminiTelemetryContext>;
}

/**
 * @function YoGeminiAILoaderIndicator
 * @description A highly abstract, AI-aware loading indicator 'Yo' component.
 * It dynamically adjusts its message based on the AI's processing state.
 */
export const YoGeminiAILoaderIndicator: React.FC<{ isLoading: boolean; aiThinkingMessage?: string } & YoGeminiComponentProps> = ({
  isLoading,
  aiThinkingMessage = "Gemini AI is deep-diving into your data...",
  componentId = "YoGeminiAILoaderIndicator",
  debugMode,
  telemetryContext,
}) => {
  const logger = useMemo(() => GeminiLogger.getInstance(componentId), [componentId]);
  const analytics = useMemo(() => GeminiAnalyticsService.getInstance(componentId), [componentId]);

  useEffect(() => {
    if (debugMode) {
      logger.debug("YoGeminiAILoaderIndicator mounted or props updated.", { isLoading, aiThinkingMessage, componentId, telemetryContext });
    }
    analytics.trackEvent("YO_AI_LOADER_STATE_CHANGE", { isLoading, componentId }, GeminiTelemetryLevel.Verbose);
  }, [isLoading, aiThinkingMessage, componentId, debugMode, logger, analytics, telemetryContext]);

  if (!isLoading) return null;

  return (
    <div
      className="gemini-ai-loader-container"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        borderRadius: "4px",
        marginTop: "4px",
        fontSize: "0.9em",
        color: "#555",
      }}
    >
      <div
        className="gemini-ai-spinner"
        style={{
          border: "2px solid #f3f3f3",
          borderTop: "2px solid #3498db",
          borderRadius: "50%",
          width: "12px",
          height: "12px",
          animation: "spin 1s linear infinite",
          marginRight: "8px",
        }}
      ></div>
      <span>{aiThinkingMessage}</span>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  // This 'jsx' style is a common pattern in Next.js or similar setups for scoped CSS.
};
export const YoGeminiAIPreferenceToggle: React.FC<{ isEnabled: boolean; onToggle: (enabled: boolean) => void; label?: string } & YoGeminiComponentProps> = ({
  isEnabled,
  onToggle,
  label = "Enable Gemini AI Suggestions",
  componentId = "YoGeminiAIPreferenceToggle",
  debugMode,
  telemetryContext,
}) => {
  const logger = useMemo(() => GeminiLogger.getInstance(componentId), [componentId]);
  const analytics = useMemo(() => GeminiAnalyticsService.getInstance(componentId), [componentId]);

  const handleToggle = useCallback(() => {
    const newState = !isEnabled;
    onToggle(newState);
    logger.info("AI Preference Toggled", { newState, componentId }, { ...telemetryContext });
    analytics.trackEvent("AI_PREFERENCE_TOGGLED", { newState, componentId }, GeminiTelemetryLevel.Info, undefined, telemetryContext?.parentEventId);
  }, [isEnabled, onToggle, logger, analytics, componentId, telemetryContext]);

  useEffect(() => {
    if (debugMode) {
      logger.debug("YoGeminiAIPreferenceToggle mounted/updated.", { isEnabled, label, componentId, telemetryContext });
    }
  }, [isEnabled, label, componentId, debugMode, logger, telemetryContext]);

  return (
    <div className="flex items-center space-x-2 my-2">
      <input
        type="checkbox"
        id={`gemini-ai-toggle-${componentId}`}
        checked={isEnabled}
        onChange={handleToggle}
        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
      />
      <label htmlFor={`gemini-ai-toggle-${componentId}`} className="text-sm font-medium text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  );
};

// --- Gemini UI Feedback System (Highly Granular) ---

/**
 * @enum GeminiUIFeedbackType
 * @description Types of AI-driven UI feedback.
 */
export enum GeminiUIFeedbackType {
  SuggestionExplanation = "SUGGESTION_EXPLANATION",
  AIConfidenceWarning = "AI_CONFIDENCE_WARNING",
  PersonalizationHint = "PERSONALIZATION_HINT",
  AILoadingStatus = "AI_LOADING_STATUS",
  ContextualTip = "CONTEXTUAL_TIP",
}

/**
 * @interface GeminiUIFeedback
 * @description Structure for AI-driven UI feedback messages.
 */
export interface GeminiUIFeedback {
  type: GeminiUIFeedbackType;
  message: string;
  severity: "info" | "warning" | "error";
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * @class GeminiUIFeedbackService
 * @description Manages and provides AI-driven feedback messages to the UI.
 * This service allows AI to directly influence the user experience by offering contextual hints,
 * explanations, and warnings, thereby increasing transparency and user trust in AI.
 */
export class GeminiUIFeedbackService {
  private static instance: GeminiUIFeedbackService;
  private feedbackQueue: GeminiUIFeedback[] = [];
  private listeners: Set<(feedback: GeminiUIFeedback[]) => void> = new Set();
  private readonly MAX_FEEDBACK_ITEMS = 3; // Limit active feedback

  private constructor() {
    geminiLogger.debug("GeminiUIFeedbackService initialized.");
  }

  public static getInstance(): GeminiUIFeedbackService {
    if (!GeminiUIFeedbackService.instance) {
      GeminiUIFeedbackService.instance = new GeminiUIFeedbackService();
    }
    return GeminiUIFeedbackService.instance;
  }

  /**
   * Adds new AI feedback to the queue and notifies listeners.
   * @param feedback The feedback object.
   */
  public addFeedback(feedback: Omit<GeminiUIFeedback, 'timestamp'>): void {
    const fullFeedback = { ...feedback, timestamp: new Date().toISOString() };
    this.feedbackQueue.unshift(fullFeedback); // Add to front for recency
    if (this.feedbackQueue.length > this.MAX_FEEDBACK_ITEMS) {
      this.feedbackQueue.pop(); // Remove oldest if exceeding limit
    }
    geminiLogger.verbose("New AI UI feedback added.", { feedback: fullFeedback });
    this.notifyListeners();
  }

  /**
   * Clears all current feedback messages.
   */
  public clearFeedback(): void {
    this.feedbackQueue = [];
    geminiLogger.verbose("AI UI feedback cleared.");
    this.notifyListeners();
  }

  /**
   * Registers a callback function to receive updates when feedback changes.
   * @param listener The callback function.
   * @returns A function to unsubscribe the listener.
   */
  public subscribe(listener: (feedback: GeminiUIFeedback[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately provide current feedback
    listener(this.getCurrentFeedback());
    return () => this.listeners.delete(listener);
  }

  /**
   * Gets the current array of feedback messages.
   */
  public getCurrentFeedback(): GeminiUIFeedback[] {
    return [...this.feedbackQueue];
  }

  private notifyListeners(): void {
    const currentFeedback = this.getCurrentFeedback();
    this.listeners.forEach(listener => listener(currentFeedback));
  }
}

export const geminiUIFeedbackService = GeminiUIFeedbackService.getInstance();

/**
 * @function useGeminiUIFeedback
 * @description Custom React hook to consume AI-driven UI feedback.
 */
export function useGeminiUIFeedback(): GeminiUIFeedback[] {
  const [feedback, setFeedback] = useState<GeminiUIFeedback[]>([]);

  useEffect(() => {
    const unsubscribe = geminiUIFeedbackService.subscribe(setFeedback);
    return () => unsubscribe();
  }, []);

  return feedback;
}

/**
 * @function YoGeminiUIFeedbackDisplay
 * @description A 'Yo' component to display contextual AI feedback.
 */
export const YoGeminiUIFeedbackDisplay: React.FC<YoGeminiComponentProps> = ({ componentId = "YoGeminiUIFeedbackDisplay" }) => {
  const feedback = useGeminiUIFeedback();
  const logger = useMemo(() => GeminiLogger.getInstance(componentId), [componentId]);

  useEffect(() => {
    logger.debug("YoGeminiUIFeedbackDisplay mounted/updated.", { currentFeedbackCount: feedback.length });
  }, [feedback.length, logger]);

  if (feedback.length === 0) return null;

  return (
    <div className="gemini-ai-feedback-container mt-2 space-y-2">
      {feedback.map((item, index) => (
        <div
          key={item.timestamp + index}
          className={`p-2 rounded-md text-sm ${
            item.severity === "warning" ? "bg-yellow-100 text-yellow-800" :
            item.severity === "error" ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}
          role="alert"
          aria-live="polite"
        >
          <strong>Gemini AI Insight ({item.type.replace(/_/g, ' ')}):</strong> {item.message}
          {item.details && debugMode ? (
              <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-1 rounded">
                  {JSON.stringify(item.details, null, 2)}
              </pre>
          ) : null}
        </div>
      ))}
    </div>
  );
};

// --- Main Component Definition ---

/**
 * @interface PublishableKeySelectFieldProps
 * @description Defines the properties for the PublishableKeySelectField component,
 * incorporating advanced AI and telemetry capabilities.
 */
export interface PublishableKeySelectFieldProps {
  selectValue: string;
  onChange: (value: SelectValue | null) => void;
  disabled: boolean;
  aiSuggestionsEnabled?: boolean; // New prop to enable/disable AI suggestions
  userContext?: GeminiKeySuggestionContext; // New prop for AI context
  instanceId?: string; // Unique ID for this component instance for granular telemetry
  debugMode?: boolean; // Enables verbose debugging and additional UI elements for AI insight
}

/**
 * @function PublishableKeySelectField
 * @description A sophisticated React component for selecting publishable keys,
 * augmented with Gemini AI for intelligent suggestions, robust logging,
 * and comprehensive analytics tracking. This component exemplifies
 * hyper-intelligent UI/AI integration.
 */
function PublishableKeySelectField({
  selectValue,
  onChange,
  disabled = false,
  aiSuggestionsEnabled = true, // AI suggestions enabled by default
  userContext,
  instanceId = `PublishableKeySelectField_${Math.random().toString(36).substring(2, 9)}`,
  debugMode = false,
}: PublishableKeySelectFieldProps) {
  const [options, setOptions] = useState<SelectValue[]>([]);
  const [isDataInitiallyLoaded, setIsDataInitiallyLoaded] = useState<boolean>(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false);
  const [aiSuggestionHitCount, setAiSuggestionHitCount] = useState<number>(0);
  const [totalAISuggestionCalls, setTotalAISuggestionCalls] = useState<number>(0);
  const [aiAcceptedSuggestionCount, setAiAcceptedSuggestionCount] = useState<number>(0);
  const [lastInputForAISuggestion, setLastInputForAISuggestion] = useState<string>("");
  const initialLoadTimeRef = useRef<number | null>(null);

  // Initialize instance-specific logger and analytics services
  const componentLogger = useMemo(() => GeminiLogger.getInstance(instanceId), [instanceId]);
  const componentAnalytics = useMemo(() => GeminiAnalyticsService.getInstance(instanceId), [instanceId]);

  const { refetch } = usePublishableKeysDemoSelectQuery({
    skip: true,
  });

  // Effect for initial component mount/unmount telemetry and global context update
  useEffect(() => {
    componentAnalytics.trackEvent(
      "COMPONENT_MOUNTED_INITIALIZED",
      { props: { disabled, aiSuggestionsEnabled, debugMode }, instanceId },
      GeminiTelemetryLevel.Info,
    );
    // Update global context with component-specific info if needed
    geminiContextManager.updateGlobalContext({
        componentInstanceId: instanceId,
        // Add other relevant top-level context from this component's props if globally useful
    });

    initialLoadTimeRef.current = performance.now();

    return () => {
      componentAnalytics.trackEvent("COMPONENT_UNMOUNTED", { instanceId }, GeminiTelemetryLevel.Info);
      geminiTelemetryHub.flushAllProcessors(); // Ensure all pending telemetry is sent on unmount
    };
  }, [disabled, aiSuggestionsEnabled, debugMode, instanceId, componentAnalytics]);

  // Effect to log component initial render time KPI
  useEffect(() => {
    if (initialLoadTimeRef.current !== null) {
      const initialRenderDuration = performance.now() - initialLoadTimeRef.current;
      componentAnalytics.logKPI(
        "COMPONENT_INITIAL_RENDER_DURATION_MS",
        initialRenderDuration,
        "ms",
        { instanceId },
        "avg",
        GeminiTelemetryLevel.Info,
      );
      initialLoadTimeRef.current = null; // Logged, so reset
    }
  }, [componentAnalytics, instanceId]);

  // Memoized AI suggestion hit rate for KPI reporting and dynamic UI feedback
  const aiSuggestionHitRate = useMemo(() => {
    if (totalAISuggestionCalls === 0) return 0;
    const rate = (aiSuggestionHitCount / totalAISuggestionCalls) * 100;
    if (debugMode) {
      componentLogger.verbose("AI Suggestion Hit Rate Calculated", { rate, aiSuggestionHitCount, totalAISuggestionCalls });
    }
    return rate;
  }, [aiSuggestionHitCount, totalAISuggestionCalls, debugMode, componentLogger]);

  // Memoized AI acceptance rate
  const aiSuggestionAcceptanceRate = useMemo(() => {
    if (totalAISuggestionCalls === 0) return 0;
    const rate = (aiAcceptedSuggestionCount / totalAISuggestionCalls) * 100;
    if (debugMode) {
      componentLogger.verbose("AI Suggestion Acceptance Rate Calculated", { rate, aiAcceptedSuggestionCount, totalAISuggestionCalls });
    }
    return rate;
  }, [aiAcceptedSuggestionCount, totalAISuggestionCalls, debugMode, componentLogger]);


  // Asynchronously loads options, potentially leveraging Gemini AI for suggestions.
  const loadOptions = useCallback(
    async (input: string) => {
      const correlationId = geminiContextManager.generateCorrelationId();
      componentLogger.info(`Initiating option load for input: "${input}"`, { input, aiSuggestionsEnabled, isDataInitiallyLoaded }, { correlationId });
      setIsLoadingOptions(true);
      const startTime = performance.now();
      let currentOptions = options; // Leverage already fetched options if available

      try {
        if (!isDataInitiallyLoaded) {
          componentLogger.debug("Fetching all publishable keys from GraphQL API for the first time.", { instanceId }, { correlationId });
          const fetchStart = performance.now();
          const { data } = await refetch();
          const publishableKeyOptions = data.publishableKeys.edges.map((e) => ({
            label: `${e.node.name} · ${e.node.prettyDomainAllowlist}`,
            value: e.node.key,
          }));
          setOptions(publishableKeyOptions);
          setIsDataInitiallyLoaded(true);
          currentOptions = publishableKeyOptions; // Update for current execution
          const fetchDuration = performance.now() - fetchStart;
          componentAnalytics.trackEvent(
            "PUBLISHABLE_KEYS_GRAPHQL_FETCHED",
            { count: publishableKeyOptions.length, duration: fetchDuration },
            GeminiTelemetryLevel.Info,
            correlationId,
          );
          componentAnalytics.logKPI("GRAPHQL_FETCH_DURATION_MS", fetchDuration, "ms", { count: publishableKeyOptions.length }, "avg", GeminiTelemetryLevel.Info, correlationId);
          geminiUIFeedbackService.addFeedback({
              type: GeminiUIFeedbackType.AILoadingStatus,
              message: `Successfully loaded ${publishableKeyOptions.length} base keys. Gemini AI is ready.`,
              severity: "info",
          });
        }

        let filteredOptions: SelectValue[] = [];
        let aiSuggestions: GeminiAISuggestion[] = [];
        let aiUsedForQuery = false;

        if (aiSuggestionsEnabled && input.length >= 2) { // Only trigger AI for meaningful input
          setTotalAISuggestionCalls((prev) => prev + 1);
          setLastInputForAISuggestion(input);
          componentLogger.debug("Engaging Gemini AI for intelligent suggestions.", { input, userContext }, { correlationId });
          geminiUIFeedbackService.addFeedback({
              type: GeminiUIFeedbackType.AILoadingStatus,
              message: `Gemini AI is generating suggestions for "${input}"...`,
              severity: "info",
          });
          aiSuggestions = await geminiAIKeySuggester.getSuggestions(
            input,
            currentOptions,
            userContext,
          );

          if (aiSuggestions.length > 0) {
            aiUsedForQuery = true;
            // Check if any AI suggestion closely matches the current input
            const aiHit = aiSuggestions.some(
              (s) => (s.value as string).toLowerCase().includes(input.toLowerCase()) ||
              s.label.toLowerCase().replace('[ai] ', '').includes(input.toLowerCase())
            );
            if (aiHit) {
                setAiSuggestionHitCount((prev) => prev + 1);
                geminiUIFeedbackService.addFeedback({
                    type: GeminiUIFeedbackType.PersonalizationHint,
                    message: `Gemini AI found relevant suggestions based on your query.`,
                    severity: "info",
                });
            } else {
                geminiUIFeedbackService.addFeedback({
                    type: GeminiUIFeedbackType.SuggestionExplanation,
                    message: `Gemini AI provided suggestions, but none directly match your exact input.`,
                    severity: "info",
                });
            }
            componentLogger.info(`Gemini AI provided ${aiSuggestions.length} suggestions.`, { aiSuggestions: aiSuggestions.map(s => s.value) }, { correlationId });
          } else {
              geminiUIFeedbackService.addFeedback({
                  type: GeminiUIFeedbackType.ContextualTip,
                  message: `Gemini AI couldn't find specific suggestions for "${input}". Try a different query.`,
                  severity: "info",
              });
              componentLogger.debug("Gemini AI provided no suggestions for input.", { input }, { correlationId });
          }
        }

        // Traditional filtering as fallback or complement to AI, for non-AI matching options
        const traditionalFilteredOptions = currentOptions.filter((option) =>
          option.label.toLowerCase().includes(input.toLowerCase()),
        );

        // Combine AI suggestions (prioritized) and traditional filtered results
        // Ensure no duplicates, AI suggestions come first
        filteredOptions = [
          ...aiSuggestions,
          ...traditionalFilteredOptions.filter(
            (tf) => !aiSuggestions.some((as) => as.value === tf.value),
          ),
        ];
        if (filteredOptions.length === 0 && input.length >= 2) {
             geminiUIFeedbackService.addFeedback({
                type: GeminiUIFeedbackType.ContextualTip,
                message: "No matching keys found. Gemini AI is always learning!",
                severity: "info",
            });
        }


        const endTime = performance.now();
        const loadTime = endTime - startTime;
        componentLogger.debug(`Options loaded in ${loadTime.toFixed(2)} ms.`, { aiUsed: aiUsedForQuery, numResults: filteredOptions.length }, { correlationId });
        componentAnalytics.logKPI("OPTION_LOAD_LATENCY_MS", loadTime, "ms", { aiUsed: aiUsedForQuery, inputLength: input.length }, "avg", GeminiTelemetryLevel.Info, correlationId);
        componentAnalytics.logKPI("AI_SUGGESTION_HIT_RATE", aiSuggestionHitRate, "%", { instanceId }, "avg", GeminiTelemetryLevel.Info, correlationId);

        return { options: filteredOptions };
      } catch (e) {
        const error = e as Error;
        componentLogger.error("Failed to load publishable key options or AI suggestions.", error, { correlationId });
        componentAnalytics.trackEvent("OPTION_LOAD_ERROR", { error: error.message, stack: error.stack }, GeminiTelemetryLevel.Error, correlationId);
        geminiUIFeedbackService.addFeedback({
            type: GeminiUIFeedbackType.AIConfidenceWarning,
            message: `An error occurred while loading keys or AI suggestions: ${error.message}.`,
            severity: "error",
        });
        return { options: [] }; // Return empty array on error
      } finally {
        setIsLoadingOptions(false);
        componentAnalytics.logKPI("COMPONENT_LOAD_OPTIONS_FINALIZED", performance.now() - startTime, "ms", {}, "avg", GeminiTelemetryLevel.Verbose, correlationId);
      }
    },
    [
      isDataInitiallyLoaded,
      options,
      refetch,
      aiSuggestionsEnabled,
      userContext,
      aiSuggestionHitRate,
      setTotalAISuggestionCalls,
      setAiSuggestionHitCount,
      instanceId,
      componentLogger,
      componentAnalytics,
      debugMode,
    ],
  );

  const handleSelectionChange = useCallback(
    (option: SelectValue | null) => {
      onChange(option);
      if (option) {
        // Remove AI prefixes from label before recording usage or sending to parent
        const cleanLabel = (option.label as string).replace(/\[AI\]\s*\(Conf:\s*\d\.\d{2}\)\s*/g, '');
        const cleanedOption = { ...option, label: cleanLabel };

        geminiAIKeySuggester.recordKeyUsage(cleanedOption.value as string, userContext);
        componentAnalytics.trackEvent(
          "KEY_SELECTED",
          { selectedKey: cleanedOption.value, label: cleanedOption.label, originalLabel: option.label, instanceId },
          GeminiTelemetryLevel.Info,
        );
        // Track if an AI suggestion was accepted
        if (option.label.startsWith('[AI]')) {
          setAiAcceptedSuggestionCount((prev) => prev + 1);
          componentAnalytics.logKPI("AI_SUGGESTION_ACCEPTED_RATE", aiSuggestionAcceptanceRate, "%", { instanceId }, "avg", GeminiTelemetryLevel.Info);
          geminiUIFeedbackService.addFeedback({
              type: GeminiUIFeedbackType.SuggestionExplanation,
              message: `You selected a Gemini AI suggested key: '${cleanedOption.label}'.`,
              severity: "info",
              details: { selectedKey: cleanedOption.value, input: lastInputForAISuggestion }
          });
        } else {
            geminiUIFeedbackService.addFeedback({
                type: GeminiUIFeedbackType.ContextualTip,
                message: `You selected key: '${cleanedOption.label}'. Gemini AI noted this for future suggestions.`,
                severity: "info",
                details: { selectedKey: cleanedOption.value, input: lastInputForAISuggestion }
            });
        }
      } else {
          geminiUIFeedbackService.addFeedback({
              type: GeminiUIFeedbackType.ContextualTip,
              message: "Selection cleared. Gemini AI is ready for your next input.",
              severity: "info",
          });
          componentAnalytics.trackEvent("KEY_SELECTION_CLEARED", { instanceId }, GeminiTelemetryLevel.Info);
      }
    },
    [onChange, userContext, instanceId, componentAnalytics, setAiAcceptedSuggestionCount, aiSuggestionAcceptanceRate, lastInputForAISuggestion],
  );

  // Debugging UI for AI metrics
  const debugMetricsDisplay = debugMode ? (
    <div className="bg-gray-50 p-2 text-xs text-gray-600 rounded-md mt-2 border border-gray-200">
      <h4 className="font-semibold mb-1">Gemini AI Debug Metrics ({instanceId})</h4>
      <p>AI Suggestion Calls: {totalAISuggestionCalls}</p>
      <p>AI Suggestion Hits: {aiSuggestionHitCount}</p>
      <p>AI Hit Rate: {aiSuggestionHitRate.toFixed(2)}%</p>
      <p>AI Accepted Suggestions: {aiAcceptedSuggestionCount}</p>
      <p>AI Acceptance Rate: {aiSuggestionAcceptanceRate.toFixed(2)}%</p>
      <p>Last AI Input: "{lastInputForAISuggestion}"</p>
    </div>
  ) : null;

  return (
    <div className="gemini-publishable-key-field-wrapper">
      <AsyncSelectField
        className="w-full"
        id={`publishableKey-${instanceId}`}
        name="publishableKeySelect"
        loadOptions={loadOptions}
        selectValue={
          selectValue
            ? {
                value: selectValue,
                label: selectValue, // Potentially enrich label from `options` if available in the future
              }
            : undefined
        }
        handleChange={handleSelectionChange}
        noOptionsMessage={(val) =>
          isLoadingOptions
            ? "Gemini AI is generating the future of finance..."
            : val.inputValue === ""
            ? "Type to invoke Gemini AI for intelligent suggestions"
            : "Gemini AI finds no perfect match. Try refining your query or check for typos."
        }
        loadingMessage={() => (
            <>
                <YoGeminiAILoaderIndicator isLoading={true} aiThinkingMessage="Gemini AI is processing your request..." componentId={`${instanceId}-Loader`} />
            </>
        )}
        disabled={disabled}
      />
      {debugMode && (
          <YoGeminiAIPreferenceToggle
              isEnabled={aiSuggestionsEnabled}
              onToggle={(enabled) => {
                  geminiAnalytics.trackEvent("AI_SUGGESTION_TOGGLED_MANUALLY", { enabled, instanceId }, GeminiTelemetryLevel.Info);
                  // This would typically involve prop drilling an `onToggleAISuggestions` to the parent component.
                  // For this exercise, we assume a state management solution or a re-render from parent.
                  componentLogger.warn("AI Preference Toggle is for demo purposes; requires parent state management to fully integrate.", { enabled });
              }}
              componentId={`${instanceId}-Toggle`}
              debugMode={debugMode}
          />
      )}
      <YoGeminiUIFeedbackDisplay componentId={`${instanceId}-Feedback`} />
      {debugMetricsDisplay}
    </div>
  );
}

export default PublishableKeySelectField;