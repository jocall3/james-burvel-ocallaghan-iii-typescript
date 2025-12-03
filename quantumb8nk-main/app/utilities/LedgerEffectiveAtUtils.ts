import moment from "moment-timezone";
import { parse } from "../../common/utilities/queryString";

// --- App-Wide Constants and Configuration Defaults ---
export const APP_TIMEZONE_DEFAULT = "America/New_York"; // Default system timezone for operations
export const REPORTING_TIMEZONE_DEFAULT = "UTC"; // Default timezone for reporting outputs
export const MAX_FUTURE_EFFECTIVE_YEARS = 10; // Maximum number of years an effective date can be in the future
export const MIN_HISTORICAL_EFFECTIVE_YEARS = 20; // Maximum number of years an effective date can be in the past
export const LEDGER_SYSTEM_LAUNCH_DATE = moment("2000-01-01T00:00:00Z").toDate(); // The earliest valid date for any ledger entry
export const DEFAULT_BUSINESSS_DAYS_OF_WEEK = [1, 2, 3, 4, 5]; // Monday to Friday (0=Sunday, 6=Saturday)
export const DEFAULT_FISCAL_YEAR_START_MONTH = 1; // January (1-12)
export const GEMINI_AI_SERVICE_DEFAULT_ENDPOINT = "https://api.temporal-intelligence.ai/gemini-temporal";

// --- Common Utility Interfaces and Types ---

/**
 * Interface for application-wide logging.
 * Provides methods for different logging levels.
 */
export interface AppLogger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
  trace(message: string, context?: Record<string, any>): void;
}

/**
 * A basic console-based logger implementation.
 * In a production environment, this would integrate with a more robust logging framework (e.g., Winston, Pino).
 */
class ConsoleAppLogger implements AppLogger {
  private prefix = "[LedgerTemporal]";
  private getTimestamp(): string {
    return moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  }

  info(message: string, context?: Record<string, any>): void {
    console.info(`${this.getTimestamp()} ${this.prefix} INFO: ${message}`, context || "");
  }
  warn(message: string, context?: Record<string, any>): void {
    console.warn(`${this.getTimestamp()} ${this.prefix} WARN: ${message}`, context || "");
  }
  error(message: string, error?: Error, context?: Record<string, any>): void {
    console.error(`${this.getTimestamp()} ${this.prefix} ERROR: ${message}`, error, context || "");
  }
  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.debug(`${this.getTimestamp()} ${this.prefix} DEBUG: ${message}`, context || "");
    }
  }
  trace(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
      console.trace(`${this.getTimestamp()} ${this.prefix} TRACE: ${message}`, context || "");
    }
  }
}
export const appLogger: AppLogger = new ConsoleAppLogger();

// --- Custom Error Definitions for Robust Error Handling ---

/**
 * Base class for all temporal-related errors in the ledger system.
 */
export class LedgerTemporalError extends Error {
  constructor(message: string, public code: string = "LEDGER_TEMPORAL_ERROR", public details?: Record<string, any>) {
    super(message);
    this.name = "LedgerTemporalError";
    Object.setPrototypeOf(this, LedgerTemporalError.prototype); // Proper inheritance in TypeScript
    appLogger.error(`LedgerTemporalError [${code}]: ${message}`, this, details);
  }
}

/**
 * Error specifically for invalid effective date values or validation failures.
 */
export class InvalidEffectiveDateError extends LedgerTemporalError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "INVALID_EFFECTIVE_DATE", details);
    this.name = "InvalidEffectiveDateError";
    Object.setPrototypeOf(this, InvalidEffectiveDateError.prototype);
  }
}

/**
 * Error for issues when communicating with or receiving responses from the Gemini AI service.
 */
export class GeminiServiceError extends LedgerTemporalError {
  constructor(message: string, public originalError?: Error, details?: Record<string, any>) {
    super(message, "GEMINI_SERVICE_ERROR", { ...details, originalErrorName: originalError?.name, originalErrorMessage: originalError?.message });
    this.name = "GeminiServiceError";
    Object.setPrototypeOf(this, GeminiServiceError.prototype);
  }
}

/**
 * Error for issues related to temporal configuration.
 */
export class ConfigurationError extends LedgerTemporalError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "CONFIGURATION_ERROR", details);
    this.name = "ConfigurationError";
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error for unsupported temporal operations or parameters.
 */
export class UnsupportedTemporalOperationError extends LedgerTemporalError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "UNSUPPORTED_TEMPORAL_OPERATION", details);
    this.name = "UnsupportedTemporalOperationError";
    Object.setPrototypeOf(this, UnsupportedTemporalOperationError.prototype);
  }
}

// --- Enums for Defining Temporal Behaviors and Data Structures ---

/**
 * Defines the various levels of temporal precision or aggregation.
 */
export enum TemporalGranularity {
  MILLISECOND = "MILLISECOND",
  SECOND = "SECOND",
  MINUTE = "MINUTE",
  HOUR = "HOUR",
  DAY = "DAY",
  WEEK = "WEEK",
  MONTH = "MONTH",
  QUARTER = "QUARTER",
  YEAR = "YEAR",
  FISCAL_QUARTER = "FISCAL_QUARTER", // Custom granularity for fiscal periods
  FISCAL_YEAR = "FISCAL_YEAR",       // Custom granularity for fiscal years
  CUSTOM = "CUSTOM",                // For highly specific, user-defined periods
}

/**
 * Describes the context or purpose of an effective date.
 */
export enum EffectiveDateMode {
  CURRENT = "CURRENT",         // Represents the current "as-of" date, usually today
  HISTORICAL = "HISTORICAL",   // Used for viewing or analyzing past data
  FUTURE = "FUTURE",           // For scheduling events or predictive analysis
  SIMULATED = "SIMULATED",     // For "what-if" scenarios without actual impact
  USER_DEFINED = "USER_DEFINED", // Explicitly provided by a user or external system
  SYSTEM_DEFAULT = "SYSTEM_DEFAULT", // Set automatically by the system when no other date is provided
}

/**
 * Specifies rules for validating effective dates against business or system constraints.
 */
export enum TemporalValidationRule {
  NOT_BEFORE_SYSTEM_LAUNCH = "NOT_BEFORE_SYSTEM_LAUNCH",
  NOT_TOO_FAR_IN_FUTURE = "NOT_TOO_FAR_IN_FUTURE",
  NOT_TOO_FAR_IN_PAST = "NOT_TOO_FAR_IN_PAST",
  IS_BUSINESS_DAY = "IS_BUSINESS_DAY",
  IS_FISCAL_PERIOD_START = "IS_FISCAL_PERIOD_START",
  IS_FISCAL_PERIOD_END = "IS_FISCAL_PERIOD_END",
  IS_WITHIN_ACTIVE_FISCAL_YEAR = "IS_WITHIN_ACTIVE_FISCAL_YEAR",
  CUSTOM_PREDICATE = "CUSTOM_PREDICATE", // Allows for highly specific, dynamic validation logic
}

/**
 * Defines standard policies for adjusting or deriving effective dates.
 */
export enum EffectiveDatePolicyType {
  LAST_DAY_OF_MONTH = "LAST_DAY_OF_MONTH",
  FIRST_DAY_OF_MONTH = "FIRST_DAY_OF_MONTH",
  NEXT_BUSINESS_DAY = "NEXT_BUSINESS_DAY",
  PREVIOUS_BUSINESS_DAY = "PREVIOUS_BUSINESS_DAY",
  CLOSEST_BUSINESS_DAY = "CLOSEST_BUSINESS_DAY", // Finds nearest business day (future or past)
  ADJUST_TO_FISCAL_PERIOD_START = "ADJUST_TO_FISCAL_PERIOD_START",
  ADJUST_TO_FISCAL_PERIOD_END = "ADJUST_TO_FISCAL_PERIOD_END",
  ADJUST_TO_GRANULARITY_START = "ADJUST_TO_GRANULARITY_START",
  ADJUST_TO_GRANULARITY_END = "ADJUST_TO_GRANULARITY_END",
  SNAP_TO_CLOSEST_QUARTER = "SNAP_TO_CLOSEST_QUARTER",
}

// --- Interfaces for Complex Data Structures ---

/**
 * Comprehensive configuration for all temporal services.
 */
export interface LedgerTemporalConfig {
  defaultUserTimezone: string;
  defaultReportingTimezone: string;
  maxFutureEffectiveYears: number;
  minHistoricalEffectiveYears: number;
  systemLaunchDate: Date;
  businessDaysOfWeek: number[]; // e.g., [1, 2, 3, 4, 5] for Mon-Fri
  holidays: string[]; // Array of 'YYYY-MM-DD' strings for non-business days
  fiscalYearStartMonth: number; // 1-12, e.g., 1 for January, 7 for July
  enableGeminiAI: boolean; // Feature flag for AI integration
  geminiServiceEndpoint?: string; // URL for the Gemini AI temporal intelligence API
  geminiServiceTimeoutMs: number; // Timeout for AI API calls
  cacheGeminiResponses: boolean; // Whether to cache AI responses to improve performance
  maxGeminiCacheSize: number; // Maximum number of AI responses to cache
}

/**
 * Represents a defined range of dates with a specific granularity.
 * Useful for reporting periods, aggregation, or temporal queries.
 */
export interface EffectiveDateRange {
  startDate: Date;
  endDate: Date;
  granularity: TemporalGranularity;
  label?: string; // Human-readable label (e.g., "Q1 2023", "Fiscal Year 2024")
  description?: string; // More detailed explanation of the range
}

/**
 * Defines the structure of a query sent to the Gemini AI temporal intelligence service.
 */
export interface GeminiTemporalQuery {
  effectiveDateContext: {
    currentDate: string; // ISO string of the current effective date
    userTimezone: string;
    systemTimezone: string;
    reportingTimezone: string;
    historicalDataPoints?: string[]; // Array of ISO strings of past relevant dates for context
    futureEventSchedule?: string[]; // Array of ISO strings of known future events
    temporalGranularity?: TemporalGranularity; // Preferred granularity for AI processing
    intendedPurpose?: string; // Natural language description of the query's purpose
    temporalMode?: EffectiveDateMode; // Contextual mode (e.g., HISTORICAL, FUTURE)
  };
  requestType: "PREDICT_NEXT_DATE" | "SUGGEST_RANGE" | "ANOMALY_DETECTION" | "ANALYZE_PATTERNS" | "GENERATE_SCENARIOS";
  parameters?: Record<string, any>; // Additional parameters specific to the requestType
  correlationId?: string; // For tracing AI requests
}

/**
 * Defines the expected structure of a response from the Gemini AI temporal intelligence service.
 */
export interface GeminiTemporalResponse {
  statusCode: number;
  message: string;
  predictedDates?: string[]; // Array of ISO strings for predicted future dates
  suggestedRange?: {
    startDate: string;
    endDate: string;
    granularity: TemporalGranularity;
    reasoning: string;
    confidenceScore: number;
  };
  anomalyReport?: {
    anomalousDates: string[]; // Dates identified as anomalies
    details: string; // Explanation of the anomalies
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  temporalPatternAnalysis?: {
    recurringPeriods: string[]; // e.g., ["monthly", "quarterly-end", "weekly-start"]
    trendSummary: string; // Narrative summary of temporal trends
    seasonalityDetected: boolean;
    cycleLength?: number; // e.g., 12 for monthly
  };
  scenarioResults?: {
      scenarioName: string;
      effectiveDates: string[];
      impactSummary: string;
  }[];
  confidenceScore?: number; // Overall AI confidence score for the response
  aiModelVersion?: string; // Which AI model version processed the request
  processingTimeMs?: number; // Time taken by AI service to respond
}

/**
 * Represents a rule for adjusting effective dates.
 */
export interface EffectiveDatePolicy {
  type: EffectiveDatePolicyType;
  params?: Record<string, any>; // Parameters specific to the policy type (e.g., { granularity: TemporalGranularity.MONTH })
}

/**
 * Records an entry in the effective date change history.
 */
export interface EffectiveDateHistoryEntry {
  timestamp: Date; // When the change occurred
  originalEffectiveDate: Date; // The date before the change
  newEffectiveDate: Date; // The date after the change
  reason: string; // Explanation for the change
  changedBy: string; // User ID, system process, or "Gemini AI"
  context?: Record<string, any>; // Additional contextual information (e.g., UI session, related transaction ID)
}

/**
 * Options for initializing or updating the temporal context.
 */
export interface TemporalContextOptions {
  userTimezone?: string;
  effectiveDate?: Date;
  granularity?: TemporalGranularity;
  mode?: EffectiveDateMode;
  systemTimezone?: string; // Can override if needed, though usually fixed
  reportingTimezone?: string; // Can override if needed
}

/**
 * Result of parsing 'effective_at' from a query string.
 */
export interface ProcessedQueryEffectiveAt {
  value: Date; // The parsed or defaulted effective date
  rawString: string; // The original string from the query, if any
  wasParsed: boolean; // True if a valid date was found and parsed, false if defaulted
  parsingError?: string; // Details if parsing failed
}

/**
 * Defines a cache for Gemini AI responses.
 */
export interface GeminiResponseCache {
    get(key: string): GeminiTemporalResponse | undefined;
    set(key: string, value: GeminiTemporalResponse): void;
    has(key: string): boolean;
    clear(): void;
    size(): number;
}

/**
 * Simple in-memory LRU cache for Gemini AI responses.
 */
class LRUGeminiResponseCache implements GeminiResponseCache {
    private cache: Map<string, { value: GeminiTemporalResponse; timestamp: number }>;
    private maxSize: number;

    constructor(maxSize: number) {
        this.maxSize = maxSize;
        this.cache = new Map();
        appLogger.debug(`LRUGeminiResponseCache initialized with max size: ${maxSize}`);
    }

    private evictLeastRecentlyUsed(): void {
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
                appLogger.trace(`Cache eviction: removed oldest entry '${oldestKey}'`);
            }
        }
    }

    get(key: string): GeminiTemporalResponse | undefined {
        const item = this.cache.get(key);
        if (item) {
            // Move to end to mark as most recently used
            this.cache.delete(key);
            this.cache.set(key, item);
            appLogger.trace(`Cache hit for key: ${key}`);
            return item.value;
        }
        appLogger.trace(`Cache miss for key: ${key}`);
        return undefined;
    }

    set(key: string, value: GeminiTemporalResponse): void {
        if (this.maxSize <= 0) return; // Cache disabled

        if (this.cache.has(key)) {
            this.cache.delete(key); // Remove old entry to update its position to MRU
        } else {
            this.evictLeastRecentlyUsed();
        }
        this.cache.set(key, { value, timestamp: Date.now() });
        appLogger.trace(`Cache set for key: ${key}, current size: ${this.cache.size}`);
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    clear(): void {
        this.cache.clear();
        appLogger.info("Gemini response cache cleared.");
    }

    size(): number {
        return this.cache.size;
    }
}


// --- Configuration Management Service ---
/**
 * Manages all temporal-related configuration settings for the ledger system.
 * Provides a centralized way to access and update these settings.
 */
export class LedgerTemporalConfigService {
  private config: LedgerTemporalConfig;

  constructor(initialConfig?: Partial<LedgerTemporalConfig>) {
    this.config = {
      defaultUserTimezone: APP_TIMEZONE_DEFAULT,
      defaultReportingTimezone: REPORTING_TIMEZONE_DEFAULT,
      maxFutureEffectiveYears: MAX_FUTURE_EFFECTIVE_YEARS,
      minHistoricalEffectiveYears: MIN_HISTORICAL_EFFECTIVE_YEARS,
      systemLaunchDate: LEDGER_SYSTEM_LAUNCH_DATE,
      businessDaysOfWeek: DEFAULT_BUSINESSS_DAYS_OF_WEEK,
      holidays: [], // No holidays by default, can be populated via updateConfig
      fiscalYearStartMonth: DEFAULT_FISCAL_YEAR_START_MONTH,
      enableGeminiAI: false,
      geminiServiceEndpoint: GEMINI_AI_SERVICE_DEFAULT_ENDPOINT,
      geminiServiceTimeoutMs: 5000, // 5 seconds default timeout for AI calls
      cacheGeminiResponses: true,
      maxGeminiCacheSize: 500,
      ...initialConfig,
    };
    appLogger.info("LedgerTemporalConfigService initialized", { config: this.config });
  }

  /**
   * Retrieves the current, immutable configuration.
   * @returns A readonly copy of the current configuration.
   */
  public getConfig(): Readonly<LedgerTemporalConfig> {
    return { ...this.config };
  }

  /**
   * Updates specific configuration settings. Merges with existing settings.
   * @param newConfig A partial object containing the settings to update.
   */
  public updateConfig(newConfig: Partial<LedgerTemporalConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    appLogger.info("LedgerTemporalConfig updated", { oldConfig, newConfig: this.config });
    // Potentially trigger re-initialization of services that depend on config
  }

  /**
   * Gets the system launch date, marking the earliest valid ledger entry.
   */
  public getSystemLaunchDate(): Readonly<Date> {
    return moment(this.config.systemLaunchDate).toDate(); // Return a copy to prevent mutation
  }

  /**
   * Calculates the maximum allowable effective date in the future based on configuration.
   */
  public getMaxFutureEffectiveDate(timezone: string = this.config.defaultUserTimezone): Readonly<Date> {
    return moment.tz(timezone)
      .add(this.config.maxFutureEffectiveYears, "years")
      .endOf("day")
      .toDate();
  }

  /**
   * Calculates the minimum allowable historical effective date based on configuration.
   */
  public getMinHistoricalEffectiveDate(timezone: string = this.config.defaultUserTimezone): Readonly<Date> {
    return moment.tz(timezone)
      .subtract(this.config.minHistoricalEffectiveYears, "years")
      .startOf("day")
      .toDate();
  }

  public getBusinessDaysOfWeek(): Readonly<number[]> {
    return [...this.config.businessDaysOfWeek];
  }

  public getHolidays(): Readonly<string[]> {
    return [...this.config.holidays];
  }

  public getFiscalYearStartMonth(): number {
    return this.config.fiscalYearStartMonth;
  }

  public isGeminiAIEnabled(): boolean {
    return this.config.enableGeminiAI;
  }

  public getGeminiServiceEndpoint(): string | undefined {
    return this.config.geminiServiceEndpoint;
  }

  public getGeminiServiceTimeoutMs(): number {
    return this.config.geminiServiceTimeoutMs;
  }

  public shouldCacheGeminiResponses(): boolean {
      return this.config.cacheGeminiResponses;
  }

  public getMaxGeminiCacheSize(): number {
      return this.config.maxGeminiCacheSize;
  }
}

// Export a singleton instance of the configuration service.
export const ledgerTemporalConfigService = new LedgerTemporalConfigService();

// --- Ledger Calendar Service ---
/**
 * Provides utilities for calendar-related operations, including business day and fiscal period logic.
 */
export class LedgerCalendarService {
  private configService: LedgerTemporalConfigService;

  constructor(configService: LedgerTemporalConfigService) {
    this.configService = configService;
    appLogger.debug("LedgerCalendarService initialized");
  }

  /**
   * Determines if a given date is a business day within a specific timezone.
   * Considers weekends and configured holidays.
   * @param date The date to check.
   * @param timezone The timezone context for the date.
   * @returns True if it's a business day, false otherwise.
   */
  public isBusinessDay(date: Date, timezone: string): boolean {
    const m = moment.tz(date, timezone);
    const dayOfWeek = m.day(); // Sunday is 0, Saturday is 6
    const businessDays = this.configService.getBusinessDaysOfWeek();
    if (!businessDays.includes(dayOfWeek)) {
      appLogger.trace(`Date ${m.format()} is not a business day (weekend)`, { date, timezone });
      return false;
    }

    const holidays = this.configService.getHolidays();
    const dateString = m.format("YYYY-MM-DD");
    if (holidays.includes(dateString)) {
      appLogger.trace(`Date ${m.format()} is not a business day (holiday)`, { date, timezone });
      return false;
    }
    appLogger.trace(`Date ${m.format()} is a business day`, { date, timezone });
    return true;
  }

  /**
   * Finds the next business day after the given date.
   * @param date The starting date.
   * @param timezone The timezone context.
   * @returns The next business day.
   */
  public getNextBusinessDay(date: Date, timezone: string): Date {
    let m = moment.tz(date, timezone).add(1, "day");
    while (!this.isBusinessDay(m.toDate(), timezone)) {
      m.add(1, "day");
    }
    appLogger.debug(`Next business day for ${moment.tz(date, timezone).format()} is ${m.format()}`, { date, timezone });
    return m.toDate();
  }

  /**
   * Finds the previous business day before the given date.
   * @param date The starting date.
   * @param timezone The timezone context.
   * @returns The previous business day.
   */
  public getPreviousBusinessDay(date: Date, timezone: string): Date {
    let m = moment.tz(date, timezone).subtract(1, "day");
    while (!this.isBusinessDay(m.toDate(), timezone)) {
      m.subtract(1, "day");
    }
    appLogger.debug(`Previous business day for ${moment.tz(date, timezone).format()} is ${m.format()}`, { date, timezone });
    return m.toDate();
  }

  /**
   * Finds the closest business day (either current, next, or previous).
   * @param date The date to find the closest business day for.
   * @param timezone The timezone context.
   * @returns The closest business day.
   */
  public getClosestBusinessDay(date: Date, timezone: string): Date {
    if (this.isBusinessDay(date, timezone)) {
      return date;
    }

    let prevBusinessDay = this.getPreviousBusinessDay(date, timezone);
    let nextBusinessDay = this.getNextBusinessDay(date, timezone);

    const diffPrev = moment(date).diff(prevBusinessDay, 'days');
    const diffNext = moment(nextBusinessDay).diff(date, 'days');

    // If both are equidistant, prefer the next business day (common business practice)
    if (diffNext <= diffPrev) {
        return nextBusinessDay;
    } else {
        return prevBusinessDay;
    }
  }


  /**
   * Calculates the start date of the fiscal year for a given date.
   * @param date The reference date.
   * @param timezone The timezone context.
   * @returns The start date of the fiscal year.
   */
  public getFiscalYearStart(date: Date, timezone: string): Date {
    const m = moment.tz(date, timezone);
    const fiscalMonth = this.configService.getFiscalYearStartMonth();
    let year = m.year();
    // If current month is before the fiscal year start month, it belongs to the previous fiscal year
    if (m.month() + 1 < fiscalMonth) {
      year--;
    }
    const fiscalYearStartDate = moment.tz({ year: year, month: fiscalMonth - 1, day: 1 }, timezone).startOf("day").toDate();
    appLogger.trace(`Fiscal year start for ${m.format()} is ${moment.tz(fiscalYearStartDate, timezone).format()}`, { date, timezone });
    return fiscalYearStartDate;
  }

  /**
   * Calculates the end date of the fiscal year for a given date.
   * @param date The reference date.
   * @param timezone The timezone context.
   * @returns The end date of the fiscal year.
   */
  public getFiscalYearEnd(date: Date, timezone: string): Date {
    const m = moment.tz(date, timezone);
    const fiscalMonth = this.configService.getFiscalYearStartMonth();
    let year = m.year();
    // If current month is before the fiscal year start month, its fiscal year ends this year.
    // If current month is after or equal to the fiscal year start month, its fiscal year ends next year.
    if (m.month() + 1 >= fiscalMonth) {
      year++;
    }
    // Fiscal year ends the day before the start of the next fiscal year.
    const nextFiscalYearStartMonth = fiscalMonth;
    const nextFiscalYearStartDate = moment.tz({ year: year, month: nextFiscalYearStartMonth - 1, day: 1 }, timezone);
    const fiscalYearEndDate = nextFiscalYearStartDate.subtract(1, 'day').endOf("day").toDate();

    appLogger.trace(`Fiscal year end for ${m.format()} is ${moment.tz(fiscalYearEndDate, timezone).format()}`, { date, timezone });
    return fiscalYearEndDate;
  }

  /**
   * Determines if a date is the start of a fiscal quarter.
   * This is a simplified implementation; a real system would need detailed fiscal quarter definitions.
   * @param date The date to check.
   * @param timezone The timezone.
   * @returns True if it's a fiscal quarter start.
   */
  public isFiscalQuarterStart(date: Date, timezone: string): boolean {
    const m = moment.tz(date, timezone);
    const fiscalYearStartMonth = this.configService.getFiscalYearStartMonth();
    const month = m.month() + 1; // 1-12
    const day = m.date();

    // Fiscal quarters typically start on months (fiscalYearStartMonth, fiscalYearStartMonth + 3, +6, +9)
    // and on the first day of that month.
    const quarterStartMonths = [
      fiscalYearStartMonth,
      (fiscalYearStartMonth + 2) % 12 + 1, // Q2
      (fiscalYearStartMonth + 5) % 12 + 1, // Q3
      (fiscalYearStartMonth + 8) % 12 + 1, // Q4
    ];

    if (day === 1 && quarterStartMonths.includes(month)) {
      appLogger.trace(`Date ${m.format()} is a fiscal quarter start`, { date, timezone });
      return true;
    }
    appLogger.trace(`Date ${m.format()} is NOT a fiscal quarter start`, { date, timezone });
    return false;
  }

  /**
   * Determines if a date is the end of a fiscal quarter.
   * @param date The date to check.
   * @param timezone The timezone.
   * @returns True if it's a fiscal quarter end.
   */
  public isFiscalQuarterEnd(date: Date, timezone: string): boolean {
      const m = moment.tz(date, timezone);
      const nextDay = moment.tz(date, timezone).add(1, 'day');
      // If the next day is a fiscal quarter start, then 'date' is a fiscal quarter end
      return this.isFiscalQuarterStart(nextDay.toDate(), timezone);
  }

}
export const ledgerCalendarService = new LedgerCalendarService(ledgerTemporalConfigService);

// --- Temporal Validation Service ---
/**
 * Enforces business and system rules on effective dates.
 */
export class TemporalValidationService {
  private configService: LedgerTemporalConfigService;
  private calendarService: LedgerCalendarService;

  constructor(configService: LedgerTemporalConfigService, calendarService: LedgerCalendarService) {
    this.configService = configService;
    this.calendarService = calendarService;
    appLogger.debug("TemporalValidationService initialized");
  }

  /**
   * Validates a date against a set of predefined and custom rules.
   * @param date The date to validate.
   * @param userTimezone The timezone of the user, used for contextual validation (e.g., business days).
   * @param rules An array of `TemporalValidationRule` to apply.
   * @param customPredicate An optional function for custom validation logic.
   * @returns True if all validations pass, false otherwise.
   */
  public validateEffectiveDate(
    date: Date,
    userTimezone: string,
    rules: TemporalValidationRule[] = [],
    customPredicate?: (date: Date) => boolean,
  ): boolean {
    const config = this.configService.getConfig();
    const mDate = moment(date);

    if (!mDate.isValid()) {
        appLogger.warn("Validation failed: Date is invalid", { date });
        return false;
    }

    for (const rule of rules) {
      switch (rule) {
        case TemporalValidationRule.NOT_BEFORE_SYSTEM_LAUNCH:
          if (mDate.isBefore(config.systemLaunchDate)) {
            appLogger.warn("Validation failed: Date before system launch", { date, rule });
            return false;
          }
          break;
        case TemporalValidationRule.NOT_TOO_FAR_IN_FUTURE:
          if (mDate.isAfter(this.configService.getMaxFutureEffectiveDate(userTimezone))) {
            appLogger.warn("Validation failed: Date too far in future", { date, rule, maxFuture: this.configService.getMaxFutureEffectiveDate(userTimezone) });
            return false;
          }
          break;
        case TemporalValidationRule.NOT_TOO_FAR_IN_PAST:
          if (mDate.isBefore(this.configService.getMinHistoricalEffectiveDate(userTimezone))) {
            appLogger.warn("Validation failed: Date too far in past", { date, rule, minHistorical: this.configService.getMinHistoricalEffectiveDate(userTimezone) });
            return false;
          }
          break;
        case TemporalValidationRule.IS_BUSINESS_DAY:
          if (!this.calendarService.isBusinessDay(date, userTimezone)) {
            appLogger.warn("Validation failed: Date is not a business day", { date, rule, timezone: userTimezone });
            return false;
          }
          break;
        case TemporalValidationRule.IS_FISCAL_PERIOD_START:
          if (!this.calendarService.isFiscalQuarterStart(date, userTimezone) && !mDate.isSame(this.calendarService.getFiscalYearStart(date, userTimezone), 'day')) {
             appLogger.warn("Validation failed: Date is not a fiscal period start", { date, rule, timezone: userTimezone });
             return false;
          }
          break;
        case TemporalValidationRule.IS_FISCAL_PERIOD_END:
            if (!this.calendarService.isFiscalQuarterEnd(date, userTimezone) && !mDate.isSame(this.calendarService.getFiscalYearEnd(date, userTimezone), 'day')) {
                appLogger.warn("Validation failed: Date is not a fiscal period end", { date, rule, timezone: userTimezone });
                return false;
            }
            break;
        case TemporalValidationRule.IS_WITHIN_ACTIVE_FISCAL_YEAR:
            const fiscalYearStart = this.calendarService.getFiscalYearStart(moment.tz(userTimezone).toDate(), userTimezone);
            const fiscalYearEnd = this.calendarService.getFiscalYearEnd(moment.tz(userTimezone).toDate(), userTimezone);
            if (!mDate.isBetween(fiscalYearStart, fiscalYearEnd, null, '[]')) { // Inclusive start and end
                appLogger.warn("Validation failed: Date is not within current active fiscal year", { date, rule, fiscalYearStart, fiscalYearEnd });
                return false;
            }
            break;
        case TemporalValidationRule.CUSTOM_PREDICATE:
          if (customPredicate && !customPredicate(date)) {
            appLogger.warn("Validation failed: Custom predicate", { date, rule });
            return false;
          }
          break;
        default:
          appLogger.warn("Unknown validation rule encountered", { rule });
          break;
      }
    }
    appLogger.trace("Effective date passed all validations", { date, rules });
    return true;
  }

  /**
   * Asserts that an effective date is valid. Throws `InvalidEffectiveDateError` if validation fails.
   * @param date The date to assert.
   * @param userTimezone The timezone context.
   * @param rules Rules to apply.
   * @param customPredicate Optional custom validation function.
   * @throws InvalidEffectiveDateError
   */
  public assertValidEffectiveDate(
    date: Date,
    userTimezone: string,
    rules: TemporalValidationRule[] = [],
    customPredicate?: (date: Date) => boolean,
  ): void {
    if (!this.validateEffectiveDate(date, userTimezone, rules, customPredicate)) {
      throw new InvalidEffectiveDateError(
        `Effective date ${date.toISOString()} failed validation in timezone ${userTimezone}.`,
        { date: date.toISOString(), timezone: userTimezone, appliedRules: rules.join(", ") }
      );
    }
  }
}
export const temporalValidationService = new TemporalValidationService(ledgerTemporalConfigService, ledgerCalendarService);

// --- Gemini Temporal Intelligence Service (Simulated AI) ---
/**
 * Integrates with a simulated Gemini AI service for advanced temporal analysis and prediction.
 * Provides functionalities like predicting next dates, suggesting ranges, and anomaly detection.
 */
export class GeminiTemporalIntelligenceService {
  private configService: LedgerTemporalConfigService;
  private cache: GeminiResponseCache;

  constructor(configService: LedgerTemporalConfigService) {
    this.configService = configService;
    this.cache = new LRUGeminiResponseCache(this.configService.getMaxGeminiCacheSize());
    appLogger.debug("GeminiTemporalIntelligenceService initialized");
  }

  /**
   * Clears the internal cache of Gemini AI responses.
   */
  public clearCache(): void {
      this.cache.clear();
  }

  /**
   * Internal method to simulate an API call to the Gemini AI service.
   * Includes error handling, caching, and a configurable timeout.
   * @param query The GeminiTemporalQuery to send.
   * @returns A promise resolving to a GeminiTemporalResponse.
   * @throws GeminiServiceError if the AI service is disabled, not configured, or responds with an error.
   */
  private async callGeminiAPI(
    query: GeminiTemporalQuery,
  ): Promise<GeminiTemporalResponse> {
    if (!this.configService.isGeminiAIEnabled()) {
      appLogger.warn("Gemini AI is disabled in configuration. Skipping API call.");
      throw new GeminiServiceError("Gemini AI integration is currently disabled by configuration.");
    }
    const endpoint = this.configService.getGeminiServiceEndpoint();
    if (!endpoint) {
      appLogger.error("Gemini service endpoint is not configured.");
      throw new GeminiServiceError("Gemini service endpoint is not configured.");
    }

    const cacheKey = JSON.stringify(query);
    if (this.configService.shouldCacheGeminiResponses() && this.cache.has(cacheKey)) {
        appLogger.debug(`Returning cached Gemini AI response for query type: ${query.requestType}`);
        return this.cache.get(cacheKey)!;
    }

    appLogger.info("Calling simulated Gemini AI service...", { queryType: query.requestType, endpoint });

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini AI service call timed out")), this.configService.getGeminiServiceTimeoutMs())
    );

    try {
        const aiResponsePromise = new Promise<GeminiTemporalResponse>(async (resolve) => {
            // Simulate network delay and AI processing
            await new Promise((res) => setTimeout(res, 300 + Math.random() * 1200)); // 0.3s to 1.5s delay

            let response: GeminiTemporalResponse;
            const confidenceScore = parseFloat((0.7 + Math.random() * 0.3).toFixed(2)); // Simulate variable confidence
            const aiModelVersion = "Gemini-Temporal-v3.2";
            const processingTimeMs = Math.floor(300 + Math.random() * 1200);

            // Simulate different AI response types based on requestType
            switch (query.requestType) {
                case "PREDICT_NEXT_DATE":
                    const baseDate = moment(query.effectiveDateContext.currentDate);
                    const nextDateUnit = query.effectiveDateContext.temporalGranularity?.toLowerCase() as moment.unitOfTime.DurationConstructor || 'day';
                    const predictedDate = baseDate.add(1, nextDateUnit).toISOString();
                    response = {
                        statusCode: 200,
                        message: "Next effective date predicted successfully.",
                        predictedDates: [predictedDate],
                        confidenceScore,
                        aiModelVersion,
                        processingTimeMs,
                    };
                    break;
                case "SUGGEST_RANGE":
                    const startOfMonth = moment(query.effectiveDateContext.currentDate).startOf("month").toISOString();
                    const endOfMonth = moment(query.effectiveDateContext.currentDate).endOf("month").toISOString();
                    response = {
                        statusCode: 200,
                        message: "Suggested effective date range for reporting.",
                        suggestedRange: {
                            startDate: startOfMonth,
                            endDate: endOfMonth,
                            granularity: TemporalGranularity.MONTH,
                            reasoning: "Based on typical monthly ledger closing cycles and identified seasonal patterns.",
                            confidenceScore: confidenceScore + 0.05, // Slightly higher confidence for range
                        },
                        confidenceScore,
                        aiModelVersion,
                        processingTimeMs,
                    };
                    break;
                case "ANOMALY_DETECTION":
                    const datesToCheck = query.effectiveDateContext.historicalDataPoints || [];
                    const configMin = this.configService.getMinHistoricalEffectiveDate(query.effectiveDateContext.userTimezone);
                    const configMax = this.configService.getMaxFutureEffectiveDate(query.effectiveDateContext.userTimezone);
                    const anomalousDates = datesToCheck.filter(d => {
                        const m = moment(d);
                        return m.isBefore(configMin) || m.isAfter(configMax); // Simple anomaly: outside configured min/max
                    });
                    response = {
                        statusCode: 200,
                        message: anomalousDates.length > 0 ? "Potential anomalies detected in temporal data." : "No significant temporal anomalies detected.",
                        anomalyReport: {
                            anomalousDates,
                            details: anomalousDates.length > 0 ? "Dates found outside typical operational temporal bounds or inconsistent with historical patterns." : "All provided dates fall within expected temporal distributions.",
                            severity: anomalousDates.length > 0 ? "HIGH" : "LOW",
                        },
                        confidenceScore,
                        aiModelVersion,
                        processingTimeMs,
                    };
                    break;
                case "ANALYZE_PATTERNS":
                    response = {
                        statusCode: 200,
                        message: "Temporal patterns and seasonality analyzed.",
                        temporalPatternAnalysis: {
                            recurringPeriods: ["monthly-end-reporting", "quarterly-fiscal-review", "annual-reconciliation"],
                            trendSummary: "Consistent period-end entries with clear spikes during quarterly and annual closing periods. Minimal weekly variation observed.",
                            seasonalityDetected: true,
                            cycleLength: 12, // Assuming monthly cycles are dominant
                        },
                        confidenceScore,
                        aiModelVersion,
                        processingTimeMs,
                    };
                    break;
                case "GENERATE_SCENARIOS":
                    const scenarioDates: string[] = [];
                    const currentDate = moment(query.effectiveDateContext.currentDate);
                    const scenarioCount = query.parameters?.count || 3;
                    for (let i = 0; i < scenarioCount; i++) {
                        scenarioDates.push(currentDate.clone().add(i + 1, 'month').toISOString());
                    }
                    response = {
                        statusCode: 200,
                        message: "Temporal scenarios generated.",
                        scenarioResults: [{
                            scenarioName: "Base Case Next 3 Months",
                            effectiveDates: scenarioDates,
                            impactSummary: "Standard progression based on current trends. No major deviations predicted."
                        }],
                        confidenceScore,
                        aiModelVersion,
                        processingTimeMs,
                    };
                    break;
                default:
                    response = {
                        statusCode: 400,
                        message: `Unsupported Gemini request type: ${query.requestType}`,
                        confidenceScore: 0,
                        aiModelVersion,
                        processingTimeMs,
                    };
                    break;
            }
            resolve(response);
        });

        const response = await Promise.race([aiResponsePromise, timeoutPromise]);

        if (response.statusCode !== 200) {
            throw new GeminiServiceError(`Gemini AI call failed: ${response.message}`, new Error(`AI Status: ${response.statusCode}`), { query, response });
        }

        appLogger.info("Simulated Gemini AI response received", { queryType: query.requestType, confidence: response.confidenceScore });
        if (this.configService.shouldCacheGeminiResponses()) {
            this.cache.set(cacheKey, response);
        }
        return response;
    } catch (error) {
        if (error instanceof Error && error.message.includes("timed out")) {
             throw new GeminiServiceError(`Gemini AI service call timed out after ${this.configService.getGeminiServiceTimeoutMs()}ms.`, error, { query });
        }
        if (error instanceof GeminiServiceError) { // Re-throw if it's already our custom error
            throw error;
        }
        throw new GeminiServiceError(
            `An unexpected error occurred during Gemini AI call for request type ${query.requestType}.`,
            error as Error,
            { query },
        );
    }
  }

  /**
   * Predicts the next logical effective date using Gemini AI based on context.
   * @param currentDate The current date to use as a starting point.
   * @param userTimezone The user's timezone.
   * @param temporalGranularity The preferred granularity for the predicted date.
   * @param purpose A description of the prediction's purpose.
   * @param historicalDataPoints Optional array of past dates to provide more context to the AI.
   * @returns A predicted Date or null if AI is disabled, prediction fails, or AI returns no dates.
   */
  public async predictNextEffectiveDate(
    currentDate: Date,
    userTimezone: string,
    temporalGranularity: TemporalGranularity = TemporalGranularity.DAY,
    purpose: string = "next ledger entry posting",
    historicalDataPoints?: Date[],
  ): Promise<Date | null> {
    try {
      const query: GeminiTemporalQuery = {
        requestType: "PREDICT_NEXT_DATE",
        effectiveDateContext: {
          currentDate: currentDate.toISOString(),
          userTimezone,
          systemTimezone: this.configService.getConfig().defaultUserTimezone,
          reportingTimezone: this.configService.getConfig().defaultReportingTimezone,
          temporalGranularity,
          intendedPurpose: purpose,
          historicalDataPoints: historicalDataPoints?.map(d => d.toISOString()),
        },
      };
      const response = await this.callGeminiAPI(query);
      if (response.predictedDates && response.predictedDates.length > 0) {
        return moment(response.predictedDates[0]).toDate();
      }
      return null;
    } catch (error) {
      appLogger.error("Failed to predict next effective date with Gemini AI", error as Error, { currentDate, userTimezone, purpose });
      return null;
    }
  }

  /**
   * Requests Gemini AI to suggest an appropriate effective date range for a specified purpose.
   * @param referenceDate A date providing contextual anchor for the range suggestion.
   * @param userTimezone The user's timezone.
   * @param purpose A description of the desired range's purpose (e.g., "reporting period", "audit window").
   * @returns An `EffectiveDateRange` or null if AI is disabled or suggestion fails.
   */
  public async suggestEffectiveDateRange(
    referenceDate: Date,
    userTimezone: string,
    purpose: string = "reporting period",
  ): Promise<EffectiveDateRange | null> {
    try {
      const query: GeminiTemporalQuery = {
        requestType: "SUGGEST_RANGE",
        effectiveDateContext: {
          currentDate: referenceDate.toISOString(),
          userTimezone,
          systemTimezone: this.configService.getConfig().defaultUserTimezone,
          reportingTimezone: this.configService.getConfig().defaultReportingTimezone,
          intendedPurpose: purpose,
        },
      };
      const response = await this.callGeminiAPI(query);
      if (response.suggestedRange) {
        return {
          startDate: moment(response.suggestedRange.startDate).toDate(),
          endDate: moment(response.suggestedRange.endDate).toDate(),
          granularity: response.suggestedRange.granularity || TemporalGranularity.MONTH,
          label: `${moment(response.suggestedRange.startDate).format("MMM YYYY")} - ${moment(response.suggestedRange.endDate).format("MMM YYYY")} Reporting`,
          description: response.suggestedRange.reasoning,
        };
      }
      return null;
    } catch (error) {
      appLogger.error("Failed to suggest effective date range with Gemini AI", error as Error, { referenceDate, userTimezone, purpose });
      return null;
    }
  }

  /**
   * Utilizes Gemini AI to detect unusual or anomalous effective dates within a given dataset.
   * @param dates An array of dates to be analyzed for anomalies.
   * @param userTimezone The timezone context for analysis.
   * @returns An array of dates identified as anomalous.
   */
  public async detectEffectiveDateAnomalies(
    dates: Date[],
    userTimezone: string,
  ): Promise<Date[]> {
    try {
        const query: GeminiTemporalQuery = {
            requestType: "ANOMALY_DETECTION",
            effectiveDateContext: {
                currentDate: moment().toISOString(), // Current date as context
                userTimezone,
                systemTimezone: this.configService.getConfig().defaultUserTimezone,
                reportingTimezone: this.configService.getConfig().defaultReportingTimezone,
                historicalDataPoints: dates.map(d => d.toISOString())
            }
        };
        const response = await this.callGeminiAPI(query);
        if (response.anomalyReport?.anomalousDates) {
            return response.anomalyReport.anomalousDates.map(d => moment(d).toDate());
        }
        return [];
    } catch (error) {
        appLogger.error("Failed to detect anomalies with Gemini AI", error as Error, { datesCount: dates.length, userTimezone });
        return [];
    }
  }

  /**
   * Asks Gemini AI to analyze temporal patterns within a collection of dates.
   * @param dates A collection of dates representing events or data points.
   * @param userTimezone The timezone context for the data.
   * @param purpose The purpose of the pattern analysis (e.g., "transaction frequency", "payment cycles").
   * @returns An object describing the temporal patterns or null if AI is disabled or analysis fails.
   */
  public async analyzeTemporalPatterns(
    dates: Date[],
    userTimezone: string,
    purpose: string = "ledger entry patterns"
  ): Promise<GeminiTemporalResponse['temporalPatternAnalysis'] | null> {
    try {
        const query: GeminiTemporalQuery = {
            requestType: "ANALYZE_PATTERNS",
            effectiveDateContext: {
                currentDate: moment().toISOString(),
                userTimezone,
                systemTimezone: this.configService.getConfig().defaultUserTimezone,
                reportingTimezone: this.configService.getConfig().defaultReportingTimezone,
                historicalDataPoints: dates.map(d => d.toISOString()),
                intendedPurpose: purpose
            }
        };
        const response = await this.callGeminiAPI(query);
        return response.temporalPatternAnalysis || null;
    } catch (error) {
        appLogger.error("Failed to analyze temporal patterns with Gemini AI", error as Error, { datesCount: dates.length, userTimezone, purpose });
        return null;
    }
  }

  /**
   * Generates hypothetical temporal scenarios based on an effective date context using Gemini AI.
   * @param referenceDate The base date for scenario generation.
   * @param userTimezone The user's timezone.
   * @param scenarioParameters Specific parameters for scenario generation (e.g., number of scenarios, constraints).
   * @returns An array of generated scenarios or null if AI is disabled or generation fails.
   */
  public async generateTemporalScenarios(
    referenceDate: Date,
    userTimezone: string,
    scenarioParameters?: Record<string, any>
  ): Promise<GeminiTemporalResponse['scenarioResults'] | null> {
    try {
      const query: GeminiTemporalQuery = {
          requestType: "GENERATE_SCENARIOS",
          effectiveDateContext: {
              currentDate: referenceDate.toISOString(),
              userTimezone,
              systemTimezone: this.configService.getConfig().defaultUserTimezone,
              reportingTimezone: this.configService.getConfig().defaultReportingTimezone,
              intendedPurpose: "financial ledger scenario planning",
          },
          parameters: scenarioParameters,
      };
      const response = await this.callGeminiAPI(query);
      return response.scenarioResults || null;
    } catch (error) {
        appLogger.error("Failed to generate temporal scenarios with Gemini AI", error as Error, { referenceDate, userTimezone, scenarioParameters });
        return null;
    }
  }
}
export const geminiTemporalIntelligenceService = new GeminiTemporalIntelligenceService(
  ledgerTemporalConfigService,
);

// --- Effective Date Policy Service ---
/**
 * Applies various defined policies to adjust or normalize effective dates.
 */
export class EffectiveDatePolicyService {
  private calendarService: LedgerCalendarService;
  private configService: LedgerTemporalConfigService;

  constructor(
    calendarService: LedgerCalendarService,
    configService: LedgerTemporalConfigService,
  ) {
    this.calendarService = calendarService;
    this.configService = configService;
    appLogger.debug("EffectiveDatePolicyService initialized");
  }

  /**
   * Applies a specific effective date policy to a given date.
   * @param date The original date to which the policy will be applied.
   * @param policy The `EffectiveDatePolicy` to apply.
   * @param timezone The timezone context for policy application.
   * @returns The date after applying the policy.
   * @throws UnsupportedTemporalOperationError for unknown policy types.
   */
  public applyPolicy(
    date: Date,
    policy: EffectiveDatePolicy,
    timezone: string,
  ): Date {
    let adjustedMoment = moment.tz(date, timezone);
    const originalDateISO = date.toISOString();

    switch (policy.type) {
      case EffectiveDatePolicyType.LAST_DAY_OF_MONTH:
        adjustedMoment = adjustedMoment.endOf("month");
        break;
      case EffectiveDatePolicyType.FIRST_DAY_OF_MONTH:
        adjustedMoment = adjustedMoment.startOf("month");
        break;
      case EffectiveDatePolicyType.NEXT_BUSINESS_DAY:
        adjustedMoment = moment.tz(this.calendarService.getNextBusinessDay(adjustedMoment.toDate(), timezone), timezone);
        break;
      case EffectiveDatePolicyType.PREVIOUS_BUSINESS_DAY:
        adjustedMoment = moment.tz(this.calendarService.getPreviousBusinessDay(adjustedMoment.toDate(), timezone), timezone);
        break;
      case EffectiveDatePolicyType.CLOSEST_BUSINESS_DAY:
        adjustedMoment = moment.tz(this.calendarService.getClosestBusinessDay(adjustedMoment.toDate(), timezone), timezone);
        break;
      case EffectiveDatePolicyType.ADJUST_TO_FISCAL_PERIOD_START:
        // This could be fiscal month start, fiscal quarter start, or fiscal year start based on params.
        const fiscalStartGranularity = policy.params?.granularity || TemporalGranularity.FISCAL_YEAR;
        if (fiscalStartGranularity === TemporalGranularity.FISCAL_YEAR) {
          adjustedMoment = moment.tz(this.calendarService.getFiscalYearStart(adjustedMoment.toDate(), timezone), timezone);
        } else if (fiscalStartGranularity === TemporalGranularity.FISCAL_QUARTER) {
            // Find the start of the current fiscal quarter. Simplified: move to current month's start, then find closest quarter start.
            // A more robust solution would track fiscal quarters explicitly.
            adjustedMoment = adjustedMoment.startOf('month');
            while (!this.calendarService.isFiscalQuarterStart(adjustedMoment.toDate(), timezone)) {
                adjustedMoment.subtract(1, 'month').startOf('month');
            }
        } else {
            // Default to fiscal year start if granularity is not specifically handled for fiscal periods
            adjustedMoment = moment.tz(this.calendarService.getFiscalYearStart(adjustedMoment.toDate(), timezone), timezone);
        }
        break;
      case EffectiveDatePolicyType.ADJUST_TO_FISCAL_PERIOD_END:
        const fiscalEndGranularity = policy.params?.granularity || TemporalGranularity.FISCAL_YEAR;
        if (fiscalEndGranularity === TemporalGranularity.FISCAL_YEAR) {
          adjustedMoment = moment.tz(this.calendarService.getFiscalYearEnd(adjustedMoment.toDate(), timezone), timezone);
        } else if (fiscalEndGranularity === TemporalGranularity.FISCAL_QUARTER) {
            // Find the end of the current fiscal quarter. Simplified: move to current month's end, then find closest quarter end.
            adjustedMoment = adjustedMoment.endOf('month');
            while (!this.calendarService.isFiscalQuarterEnd(adjustedMoment.toDate(), timezone)) {
                adjustedMoment.add(1, 'month').endOf('month');
            }
        } else {
            adjustedMoment = moment.tz(this.calendarService.getFiscalYearEnd(adjustedMoment.toDate(), timezone), timezone);
        }
        break;
      case EffectiveDatePolicyType.ADJUST_TO_GRANULARITY_START:
        const startGranularity = policy.params?.granularity as TemporalGranularity || TemporalGranularity.DAY;
        if (Object.values(TemporalGranularity).includes(startGranularity)) {
          adjustedMoment = adjustedMoment.startOf(startGranularity.toLowerCase() as moment.unitOfTime.StartOf);
        } else {
          throw new UnsupportedTemporalOperationError(`Invalid granularity for policy ${policy.type}: ${startGranularity}`);
        }
        break;
      case EffectiveDatePolicyType.ADJUST_TO_GRANULARITY_END:
        const endGranularity = policy.params?.granularity as TemporalGranularity || TemporalGranularity.DAY;
        if (Object.values(TemporalGranularity).includes(endGranularity)) {
          adjustedMoment = adjustedMoment.endOf(endGranularity.toLowerCase() as moment.unitOfTime.EndOf);
        } else {
          throw new UnsupportedTemporalOperationError(`Invalid granularity for policy ${policy.type}: ${endGranularity}`);
        }
        break;
      case EffectiveDatePolicyType.SNAP_TO_CLOSEST_QUARTER:
        // Adjust to the start of the closest calendar quarter
        const currentMonth = adjustedMoment.month(); // 0-11
        let targetMonth;
        if (currentMonth >= 0 && currentMonth <= 1) { // Jan-Feb
            targetMonth = 0; // Q1 start (Jan)
        } else if (currentMonth >= 2 && currentMonth <= 4) { // Mar-May
            targetMonth = 3; // Q2 start (Apr)
        } else if (currentMonth >= 5 && currentMonth <= 7) { // Jun-Aug
            targetMonth = 6; // Q3 start (Jul)
        } else { // Sep-Nov
            targetMonth = 9; // Q4 start (Oct)
        }
        adjustedMoment = moment.tz(adjustedMoment, timezone).month(targetMonth).startOf('month');
        break;
      default:
        appLogger.warn("Unsupported effective date policy type encountered", { policyType: policy.type });
        throw new UnsupportedTemporalOperationError(`The policy type '${policy.type}' is not supported.`);
    }
    const newDateISO = adjustedMoment.toDate().toISOString();
    appLogger.debug(`Policy '${policy.type}' applied: ${originalDateISO} -> ${newDateISO}`, { original: originalDateISO, adjusted: newDateISO, policyType: policy.type });
    return adjustedMoment.toDate();
  }
}
export const effectiveDatePolicyService = new EffectiveDatePolicyService(
  ledgerCalendarService,
  ledgerTemporalConfigService,
);

// --- Temporal Context Class ---
/**
 * Manages the current active temporal context for the application, including the effective date,
 * user timezone, and other related settings. It acts as a single source of truth for "when" operations.
 */
export class TemporalContext {
  private _effectiveDate: Date;
  private _userTimezone: string;
  private _systemTimezone: string;
  private _reportingTimezone: string;
  private _granularity: TemporalGranularity;
  private _mode: EffectiveDateMode;
  private _originalQueryStringEffectiveAt: ProcessedQueryEffectiveAt | null = null; // Stores details if effective date came from query

  private configService: LedgerTemporalConfigService;

  constructor(options: TemporalContextOptions = {}, configService: LedgerTemporalConfigService) {
    this.configService = configService;
    const config = this.configService.getConfig();

    this._userTimezone = options.userTimezone || config.defaultUserTimezone;
    // System and reporting timezones are usually fixed from configuration
    this._systemTimezone = options.systemTimezone || config.defaultUserTimezone;
    this._reportingTimezone = options.reportingTimezone || config.defaultReportingTimezone;

    this._effectiveDate = options.effectiveDate || moment.tz(this._userTimezone).endOf("day").toDate();
    this._granularity = options.granularity || TemporalGranularity.DAY;
    this._mode = options.mode || EffectiveDateMode.SYSTEM_DEFAULT;

    appLogger.info("TemporalContext initialized", this.getCurrentContext());
  }

  // --- Getters for Context Properties ---
  public get effectiveDate(): Readonly<Date> {
    return moment(this._effectiveDate).toDate(); // Return a copy to ensure immutability
  }

  public get userTimezone(): string {
    return this._userTimezone;
  }

  public get systemTimezone(): string {
    return this._systemTimezone;
  }

  public get reportingTimezone(): string {
    return this._reportingTimezone;
  }

  public get granularity(): TemporalGranularity {
    return this._granularity;
  }

  public get mode(): EffectiveDateMode {
    return this._mode;
  }

  public get originalQueryStringEffectiveAt(): ProcessedQueryEffectiveAt | null {
    return this._originalQueryStringEffectiveAt ? { ...this._originalQueryStringEffectiveAt } : null; // Return a copy
  }

  // --- Setters for Context Properties ---
  /**
   * Sets a new effective date, ensuring its validity.
   * Note: Validation rules are typically applied by the `LedgerEffectiveAtManager` before calling this.
   * @param newDate The new date to set.
   * @param reason The reason for the date change.
   * @param changedBy Identifier of the entity changing the date.
   */
  public setEffectiveDate(newDate: Date, reason: string = "manual update", changedBy: string = "system"): void {
    if (!moment(newDate).isValid()) {
      throw new InvalidEffectiveDateError(`Attempted to set an invalid effective date: ${newDate?.toISOString() || 'null'}.`, { newDate: newDate?.toISOString() });
    }
    const oldDate = this._effectiveDate;
    this._effectiveDate = newDate;
    appLogger.debug(`Effective date changed from ${oldDate.toISOString()} to ${newDate.toISOString()}`, { reason, changedBy });
    // This setter is internal to the context; actual history logging happens in the manager.
  }

  /**
   * Updates the user's active timezone.
   * @param newTimezone The new timezone string.
   * @throws LedgerTemporalError if the timezone is invalid.
   */
  public setUserTimezone(newTimezone: string): void {
    if (!moment.tz.zone(newTimezone)) {
      throw new LedgerTemporalError(`Invalid timezone specified: ${newTimezone}`, "INVALID_TIMEZONE", { newTimezone });
    }
    appLogger.info(`User timezone changed from ${this._userTimezone} to ${newTimezone}`);
    this._userTimezone = newTimezone;
    // When timezone changes, the *interpretation* of time-relative concepts (like "endOf('day')") changes.
    // The underlying Date object (an absolute point in time) remains the same.
    // If we wanted to re-evaluate the effective date based on the *intent* (e.g., "always end of day in user timezone"),
    // we would need to store that intent, not just the resulting date. For now, we keep the Date object as is.
  }

  public setGranularity(newGranularity: TemporalGranularity): void {
    if (!Object.values(TemporalGranularity).includes(newGranularity)) {
        throw new UnsupportedTemporalOperationError(`Attempted to set invalid granularity: ${newGranularity}`);
    }
    appLogger.debug(`Granularity changed from ${this._granularity} to ${newGranularity}`);
    this._granularity = newGranularity;
  }

  public setMode(newMode: EffectiveDateMode): void {
      if (!Object.values(EffectiveDateMode).includes(newMode)) {
          throw new UnsupportedTemporalOperationError(`Attempted to set invalid mode: ${newMode}`);
      }
    appLogger.debug(`Mode changed from ${this._mode} to ${newMode}`);
    this._mode = newMode;
  }

  /**
   * Records the details if the effective date was parsed from the URL query string.
   * @param parsed The result of the query string parsing.
   */
  public setOriginalQueryStringEffectiveAt(parsed: ProcessedQueryEffectiveAt): void {
    this._originalQueryStringEffectiveAt = { ...parsed };
    appLogger.trace("Original query string effective_at details stored.", parsed);
  }

  /**
   * Resets the temporal context to its default "current date" state.
   */
  public resetToCurrentDate(): void {
    const config = this.configService.getConfig();
    this.setEffectiveDate(moment.tz(config.defaultUserTimezone).endOf("day").toDate(), "reset to current date", "system");
    this.setGranularity(TemporalGranularity.DAY);
    this.setMode(EffectiveDateMode.CURRENT);
    this._originalQueryStringEffectiveAt = null;
    appLogger.info("Temporal context successfully reset to current date and default settings.");
  }

  /**
   * Provides a snapshot of the current temporal context.
   * @returns An object containing all current context details.
   */
  public getCurrentContext(): {
    effectiveDate: Date;
    userTimezone: string;
    systemTimezone: string;
    reportingTimezone: string;
    granularity: TemporalGranularity;
    mode: EffectiveDateMode;
    originalQueryStringEffectiveAt: ProcessedQueryEffectiveAt | null;
  } {
    return {
      effectiveDate: this.effectiveDate, // Use getter to return copy
      userTimezone: this._userTimezone,
      systemTimezone: this._systemTimezone,
      reportingTimezone: this._reportingTimezone,
      granularity: this._granularity,
      mode: this._mode,
      originalQueryStringEffectiveAt: this.originalQueryStringEffectiveAt, // Use getter to return copy
    };
  }
}
// Export a singleton instance of the temporal context for global access.
export const temporalContext = new TemporalContext({}, ledgerTemporalConfigService);

// --- Effective Date History Service ---
/**
 * Manages an audit trail of changes to the effective date.
 * Provides capabilities to record, retrieve, and query historical effective date changes.
 */
export class EffectiveDateHistoryService {
  private history: EffectiveDateHistoryEntry[] = [];
  private maxHistorySize: number; // Configurable maximum number of entries to retain

  constructor(maxSize: number = 100) {
    this.maxHistorySize = maxSize;
    appLogger.debug(`EffectiveDateHistoryService initialized with max size: ${maxSize}`);
  }

  /**
   * Adds a new entry to the effective date history.
   * Maintains the `maxHistorySize` by dropping the oldest entry if the limit is exceeded.
   * @param entry An object containing details of the effective date change.
   */
  public addEntry(entry: Omit<EffectiveDateHistoryEntry, 'timestamp'>): void {
    const newEntry: EffectiveDateHistoryEntry = {
      ...entry,
      timestamp: new Date(),
    };
    this.history.unshift(newEntry); // Add to the beginning (most recent first)
    if (this.history.length > this.maxHistorySize) {
      this.history.pop(); // Remove the oldest entry if exceeding size
    }
    appLogger.trace("Added effective date history entry", { newEffectiveDate: newEntry.newEffectiveDate.toISOString(), reason: newEntry.reason });
  }

  /**
   * Retrieves all recorded effective date history entries.
   * @returns An array of history entries, ordered from most recent to oldest.
   */
  public getHistory(): Readonly<EffectiveDateHistoryEntry[]> {
    return [...this.history]; // Return a shallow copy for immutability
  }

  /**
   * Gets the most recent effective date history entry.
   * @returns The latest entry, or undefined if history is empty.
   */
  public getLatestEntry(): Readonly<EffectiveDateHistoryEntry | undefined> {
    return this.history[0];
  }

  /**
   * Filters history entries based on a provided predicate function.
   * @param predicate A function that returns true for entries to be included.
   * @returns An array of matching history entries.
   */
  public findEntries(predicate: (entry: EffectiveDateHistoryEntry) => boolean): Readonly<EffectiveDateHistoryEntry[]> {
    return this.history.filter(predicate);
  }

  /**
   * Clears all entries from the effective date history.
   */
  public clearHistory(): void {
    this.history = [];
    appLogger.info("Effective date history cleared.");
  }

  /**
   * Sets a new maximum size for the history. Existing entries beyond the new size will be dropped.
   * @param newSize The new maximum history size.
   */
  public setMaxHistorySize(newSize: number): void {
    if (newSize < 0) {
        throw new ConfigurationError("Max history size cannot be negative.");
    }
    this.maxHistorySize = newSize;
    while (this.history.length > this.maxHistorySize) {
        this.history.pop();
    }
    appLogger.info(`Effective date history max size updated to ${newSize}. Current size: ${this.history.length}`);
  }
}
export const effectiveDateHistoryService = new EffectiveDateHistoryService();

// --- Time Series Aggregator ---
/**
 * A service for aggregating data points and generating temporal ranges.
 * Useful for reporting, charting, and temporal data analysis.
 */
export class TimeSeriesAggregator {
  private configService: LedgerTemporalConfigService;

  constructor(configService: LedgerTemporalConfigService) {
    this.configService = configService;
    appLogger.debug("TimeSeriesAggregator initialized");
  }

  /**
   * Aggregates data points based on a specified temporal granularity.
   * Assumes data points have a `date` property.
   * @template T The type of data points, must include a `date: Date` property.
   * @param data Raw data points to aggregate.
   * @param granularity The `TemporalGranularity` to aggregate by (e.g., MONTH, YEAR).
   * @param timezone The timezone in which to perform the aggregation.
   * @param valueExtractor A function to extract the numeric value to sum or count. Defaults to 1 for counting occurrences.
   * @returns A Map where keys are ISO date strings (representing the start of the aggregated period)
   *          and values are the aggregated numeric results.
   */
  public aggregateByGranularity<T extends { date: Date }>(
    data: T[],
    granularity: TemporalGranularity,
    timezone: string,
    valueExtractor: (item: T) => number = () => 1,
  ): Map<string, number> {
    if (!data || data.length === 0) {
      appLogger.debug("Aggregation requested on empty data set, returning empty map.");
      return new Map();
    }

    const aggregatedMap = new Map<string, number>();
    const momentUnit = granularity.toLowerCase() as moment.unitOfTime.StartOf;

    for (const item of data) {
      if (!moment(item.date).isValid()) {
          appLogger.warn("Skipping aggregation for invalid date entry", { itemDate: item.date });
          continue;
      }
      const itemMoment = moment.tz(item.date, timezone).startOf(momentUnit);
      const periodKey = itemMoment.toISOString(); // Use ISO string as a stable key

      const currentValue = aggregatedMap.get(periodKey) || 0;
      aggregatedMap.set(periodKey, currentValue + valueExtractor(item));
    }

    appLogger.debug(`Aggregated ${data.length} data points into ${aggregatedMap.size} periods by ${granularity}`, {
      granularity,
      timezone,
    });
    return aggregatedMap;
  }

  /**
   * Generates a series of `EffectiveDateRange` objects based on an overall start, end, and a desired granularity.
   * This is useful for creating report periods or time buckets.
   * @param startDate The inclusive start date for the overall period.
   * @param endDate The inclusive end date for the overall period.
   * @param granularity The `TemporalGranularity` for each generated range.
   * @param timezone The timezone to consider for period boundaries.
   * @returns An array of `EffectiveDateRange` objects.
   * @throws UnsupportedTemporalOperationError for custom fiscal granularities not fully supported.
   */
  public generateDateRanges(
    startDate: Date,
    endDate: Date,
    granularity: TemporalGranularity,
    timezone: string,
  ): EffectiveDateRange[] {
    const ranges: EffectiveDateRange[] = [];
    let currentMoment = moment.tz(startDate, timezone);
    const endMoment = moment.tz(endDate, timezone);

    // Handle custom fiscal granularities
    if (granularity === TemporalGranularity.FISCAL_YEAR) {
        let currentFiscalYearStart = moment.tz(this.configService.getFiscalYearStart(currentMoment.toDate(), timezone), timezone);
        let currentFiscalYearEnd = moment.tz(this.configService.getFiscalYearEnd(currentMoment.toDate(), timezone), timezone);

        while (currentFiscalYearStart.isSameOrBefore(endMoment)) {
            if (currentFiscalYearStart.isAfter(currentFiscalYearEnd)) { // Handle wrap-around if config is complex
                currentFiscalYearEnd = moment.tz(this.configService.getFiscalYearEnd(currentFiscalYearStart.toDate(), timezone), timezone);
            }
            if (currentFiscalYearStart.isSameOrBefore(endMoment) && currentFiscalYearEnd.isSameOrAfter(currentMoment)) {
                ranges.push({
                    startDate: currentFiscalYearStart.toDate(),
                    endDate: currentFiscalYearEnd.toDate(),
                    granularity: TemporalGranularity.FISCAL_YEAR,
                    label: `FY${currentFiscalYearStart.year() + (currentFiscalYearStart.month() + 1 >= this.configService.getFiscalYearStartMonth() ? 0 : -1)}-${currentFiscalYearEnd.year()}`,
                });
            }
            currentFiscalYearStart.add(1, 'year').month(this.configService.getFiscalYearStartMonth() - 1).date(1).startOf('day');
            currentFiscalYearEnd = moment.tz(this.configService.getFiscalYearEnd(currentFiscalYearStart.toDate(), timezone), timezone);
        }
        appLogger.debug(`Generated ${ranges.length} fiscal year ranges`, { startDate, endDate, timezone });
        return ranges;

    } else if (granularity === TemporalGranularity.FISCAL_QUARTER) {
        // Simplified approach: find start of month, then iterate. More complex for irregular fiscal quarters.
        let tempMoment = moment.tz(startDate, timezone).startOf('month');
        while (tempMoment.isSameOrBefore(endMoment)) {
            if (this.calendarService.isFiscalQuarterStart(tempMoment.toDate(), timezone)) {
                const qStart = tempMoment.toDate();
                let qEndMoment = tempMoment.clone().add(2, 'months').endOf('month'); // Assume 3-month quarters
                if (!this.calendarService.isFiscalQuarterEnd(qEndMoment.toDate(), timezone)) {
                    // Fallback to simpler method if not exact match (e.g. non-standard quarters)
                    qEndMoment = moment.tz(this.calendarService.getFiscalQuarterEnd(tempMoment.toDate(), timezone), timezone);
                }
                const qEnd = qEndMoment.toDate();

                ranges.push({
                    startDate: qStart,
                    endDate: qEnd,
                    granularity: TemporalGranularity.FISCAL_QUARTER,
                    label: `FQ${Math.floor((tempMoment.month() - (this.configService.getFiscalYearStartMonth() - 1) + 12) % 12 / 3) + 1} ${tempMoment.year()}`,
                });
            }
            tempMoment.add(1, 'month');
        }
        appLogger.debug(`Generated ${ranges.length} fiscal quarter ranges`, { startDate, endDate, timezone });
        return ranges;
    }

    // Standard Moment.js granularities
    const momentUnit = granularity.toLowerCase() as moment.unitOfTime.StartOf;
    currentMoment = currentMoment.startOf(momentUnit); // Ensure start is aligned to granularity

    while (currentMoment.isSameOrBefore(endMoment)) {
      const periodStart = currentMoment.toDate();
      const periodEnd = moment.tz(currentMoment, timezone).endOf(momentUnit).toDate();
      const label = currentMoment.format(this.getDateFormatForGranularity(granularity));

      ranges.push({
        startDate: periodStart,
        endDate: periodEnd,
        granularity: granularity,
        label: label,
      });

      currentMoment.add(1, momentUnit);
    }
    appLogger.debug(`Generated ${ranges.length} standard date ranges for ${granularity}`, {
      startDate,
      endDate,
      granularity,
    });
    return ranges;
  }

  /**
   * Helper to get appropriate date format string for a given granularity.
   * @param granularity The desired `TemporalGranularity`.
   * @returns A moment.js compatible format string.
   */
  private getDateFormatForGranularity(granularity: TemporalGranularity): string {
    switch (granularity) {
      case TemporalGranularity.MILLISECOND:
        return "YYYY-MM-DD HH:mm:ss.SSS";
      case TemporalGranularity.SECOND:
        return "YYYY-MM-DD HH:mm:ss";
      case TemporalGranularity.MINUTE:
        return "YYYY-MM-DD HH:mm";
      case TemporalGranularity.HOUR:
        return "YYYY-MM-DD HH";
      case TemporalGranularity.DAY:
        return "YYYY-MM-DD";
      case TemporalGranularity.WEEK:
        return "YYYY-[W]WW"; // e.g., 2023-W01
      case TemporalGranularity.MONTH:
        return "YYYY-MM";
      case TemporalGranularity.QUARTER:
        return "YYYY-[Q]Q"; // e.g., 2023-Q1
      case TemporalGranularity.YEAR:
        return "YYYY";
      case TemporalGranularity.FISCAL_QUARTER:
          return "YYYY-[FQ]Q"; // Custom fiscal quarter format
      case TemporalGranularity.FISCAL_YEAR:
          return "YYYY-[FY]"; // Custom fiscal year format
      default:
        return "YYYY-MM-DD HH:mm:ss.SSS"; // Default to high precision
    }
  }
}
export const timeSeriesAggregator = new TimeSeriesAggregator(ledgerTemporalConfigService);


// --- Core Parsing Function for Query String (Enhanced) ---
/**
 * Parses the 'effective_at' parameter from a URL query string.
 * This function is designed to be robust, handling various formats and providing defaults.
 * @param userTimezone The user's current timezone, used as context for `endOf('day')` defaults.
 * @returns A `ProcessedQueryEffectiveAt` object detailing the parsed date and process.
 */
export function parseEffectiveAtFromQuery(userTimezone: string): ProcessedQueryEffectiveAt {
  const parsedQueryString: { effective_at?: { lte?: string } | string } = parse(
    window.location.search,
  );
  let effectiveAtRaw: string | undefined;

  // Handle both { lte: 'date' } and direct 'date' string in the query parameter
  if (typeof parsedQueryString?.effective_at === "string") {
    effectiveAtRaw = parsedQueryString.effective_at;
  } else if (typeof parsedQueryString?.effective_at?.lte === "string") {
    effectiveAtRaw = parsedQueryString.effective_at.lte;
  }

  let effectiveDate: Date;
  let wasParsedSuccessfully = false;
  let parsingError: string | undefined;

  if (effectiveAtRaw) {
    // Attempt to parse with moment-timezone. Robust to various ISO-like formats.
    const m = moment.tz(effectiveAtRaw, userTimezone);
    if (m.isValid()) {
      effectiveDate = m.toDate();
      wasParsedSuccessfully = true;
      appLogger.debug("Parsed 'effective_at' from query string successfully.", { raw: effectiveAtRaw, date: effectiveDate.toISOString(), userTimezone });
    } else {
      parsingError = `Invalid date format or value for 'effective_at': '${effectiveAtRaw}'.`;
      appLogger.warn(parsingError, { raw: effectiveAtRaw });
    }
  }

  // If parsing failed or no 'effective_at' was provided, default to end of current day in user's timezone.
  if (!wasParsedSuccessfully) {
    effectiveDate = moment.tz(userTimezone).endOf("day").toDate();
    appLogger.info("No valid 'effective_at' in query string or parsing failed, defaulting to end of user's current day.", { defaultDate: effectiveDate.toISOString(), userTimezone });
    // If there was a parsing error, it means an invalid value was provided, but we defaulted.
    if (!effectiveAtRaw) {
        parsingError = "No 'effective_at' parameter found in query string.";
    }
  }

  return {
    value: effectiveDate,
    rawString: effectiveAtRaw || "",
    wasParsed: wasParsedSuccessfully,
    parsingError: parsingError,
  };
}

/**
 * Original `parsedEffectiveAt` function from the initial file.
 * This function is kept for backwards compatibility but now delegates to `parseEffectiveAtFromQuery`
 * and updates the global `temporalContext` with the parsed effective date.
 * @param userTimezone The user's timezone string.
 * @returns The effective date, either parsed from the query or a default.
 */
export function parsedEffectiveAt(userTimezone: string): Date {
  const result = parseEffectiveAtFromQuery(userTimezone);
  temporalContext.setOriginalQueryStringEffectiveAt(result); // Store the original parsing result for debugging/auditing
  temporalContext.setEffectiveDate(
    result.value,
    result.wasParsed ? "from query string" : "defaulted (query parsing failed or missing)",
    "system",
  );
  temporalContext.setUserTimezone(userTimezone); // Ensure context timezone matches the input
  temporalContext.setMode(result.wasParsed ? EffectiveDateMode.USER_DEFINED : EffectiveDateMode.SYSTEM_DEFAULT);

  appLogger.info("Public `parsedEffectiveAt` called, context updated.", {
      effectiveDate: temporalContext.effectiveDate.toISOString(),
      userTimezone: temporalContext.userTimezone,
      mode: temporalContext.mode,
  });

  return temporalContext.effectiveDate;
}

// --- Main Ledger Effective At Manager ---
/**
 * The central orchestrator for all effective date-related operations in the ledger system.
 * This class provides a high-level API for managing, validating, predicting, and manipulating
 * the system's "as-of" date, leveraging all underlying temporal services.
 */
export class LedgerEffectiveAtManager {
  private configService: LedgerTemporalConfigService;
  private calendarService: LedgerCalendarService;
  private validationService: TemporalValidationService;
  private geminiService: GeminiTemporalIntelligenceService;
  private policyService: EffectiveDatePolicyService;
  private historyService: EffectiveDateHistoryService;
  private aggregator: TimeSeriesAggregator;
  private temporalContext: TemporalContext; // Manager holds a reference to the global context

  constructor(
    configService: LedgerTemporalConfigService,
    calendarService: LedgerCalendarService,
    validationService: TemporalValidationService,
    geminiService: GeminiTemporalIntelligenceService,
    policyService: EffectiveDatePolicyService,
    historyService: EffectiveDateHistoryService,
    aggregator: TimeSeriesAggregator,
    temporalContext: TemporalContext,
  ) {
    this.configService = configService;
    this.calendarService = calendarService;
    this.validationService = validationService;
    this.geminiService = geminiService;
    this.policyService = policyService;
    this.historyService = historyService;
    this.aggregator = aggregator;
    this.temporalContext = temporalContext;

    appLogger.info("LedgerEffectiveAtManager initialized with all core temporal services.");
  }

  /**
   * Retrieves the current effective date from the temporal context.
   * This is the central "as-of" date for all ledger operations.
   * @returns The current effective date (a copy for immutability).
   */
  public getCurrentEffectiveDate(): Readonly<Date> {
    return this.temporalContext.effectiveDate;
  }

  /**
   * Retrieves the current effective date as a `moment-timezone` object,
   * localized to the current user's timezone.
   * @returns A `moment.Moment` object representing the current effective date.
   */
  public getCurrentEffectiveDateMoment(): moment.Moment {
    return moment.tz(this.temporalContext.effectiveDate, this.temporalContext.userTimezone);
  }

  /**
   * Sets a new effective date for the system. This date is validated against
   * business rules and recorded in the history.
   * @param newDate The date to set as the new effective date.
   * @param changedBy Identifier of the entity initiating the change (e.g., user ID, "system", "AI_prediction").
   * @param reason A concise explanation for the date change.
   * @param validationRules Optional rules to apply during validation. Defaults to general bounds checks.
   * @param customPredicate Optional custom validation function to apply.
   * @returns The newly set effective date.
   * @throws InvalidEffectiveDateError if the `newDate` fails any validation checks.
   */
  public setEffectiveDate(
    newDate: Date,
    changedBy: string = "system",
    reason: string = "programmatic update",
    validationRules: TemporalValidationRule[] = [
      TemporalValidationRule.NOT_BEFORE_SYSTEM_LAUNCH,
      TemporalValidationRule.NOT_TOO_FAR_IN_FUTURE,
      TemporalValidationRule.NOT_TOO_FAR_IN_PAST,
    ],
    customPredicate?: (date: Date) => boolean,
  ): Readonly<Date> {
    const originalDate = this.temporalContext.effectiveDate;
    this.validationService.assertValidEffectiveDate(
      newDate,
      this.temporalContext.userTimezone,
      validationRules,
      customPredicate,
    );

    this.temporalContext.setEffectiveDate(newDate, reason, changedBy);
    this.historyService.addEntry({
      originalEffectiveDate: originalDate,
      newEffectiveDate: newDate,
      reason,
      changedBy,
      context: { validationRules: validationRules.join(',') },
    });
    appLogger.info("Effective date successfully set and validated.", { newDate: newDate.toISOString(), changedBy, reason });
    return this.temporalContext.effectiveDate;
  }

  /**
   * Adjusts the current effective date based on a predefined `EffectiveDatePolicy`.
   * The adjusted date is validated and recorded in history.
   * @param policy The `EffectiveDatePolicy` to apply (e.g., 'LAST_DAY_OF_MONTH').
   * @param changedBy Identifier of who/what changed the date.
   * @param reason Optional, more specific reason for the adjustment.
   * @param validationRules Optional rules to apply after adjustment.
   * @param customPredicate Optional custom validation function.
   * @returns The newly adjusted effective date.
   * @throws UnsupportedTemporalOperationError if the policy type is not recognized.
   * @throws InvalidEffectiveDateError if the adjusted date fails validation.
   */
  public adjustEffectiveDateByPolicy(
    policy: EffectiveDatePolicy,
    changedBy: string = "system",
    reason: string = "policy application",
    validationRules?: TemporalValidationRule[],
    customPredicate?: (date: Date) => boolean,
  ): Readonly<Date> {
    const originalDate = this.temporalContext.effectiveDate;
    const adjustedDate = this.policyService.applyPolicy(
      originalDate,
      policy,
      this.temporalContext.userTimezone,
    );

    // Apply validation to the adjusted date
    return this.setEffectiveDate(adjustedDate, changedBy, `Policy applied: ${policy.type} - ${reason}`, validationRules, customPredicate);
  }

  /**
   * Initializes the effective date of the system from the URL query string.
   * This is typically called once during the application's startup phase.
   * If `effective_at` is not found or is invalid, a default date (end of current day) is used.
   * @param userTimezone The user's current timezone.
   * @returns The initialized effective date.
   */
  public initializeEffectiveDateFromQuery(userTimezone: string): Readonly<Date> {
    // The global `parsedEffectiveAt` function already handles updating the `temporalContext`.
    // It's a key entry point to ensure query parameters drive initial state.
    const initialDate = parsedEffectiveAt(userTimezone);

    // Add initial state to history (e.g., "System initial load")
    const originalQueryInfo = this.temporalContext.originalQueryStringEffectiveAt;
    if (originalQueryInfo) {
        this.historyService.addEntry({
            originalEffectiveDate: initialDate, // For initial entry, original is same as new
            newEffectiveDate: initialDate,
            reason: originalQueryInfo.wasParsed ? `System initialized from query string: "${originalQueryInfo.rawString}"` : `System initialized with default date (query error: ${originalQueryInfo.parsingError})`,
            changedBy: "system_initialization",
            context: { rawQuery: originalQueryInfo.rawString, wasParsed: originalQueryInfo.wasParsed }
        });
    }

    return initialDate;
  }

  /**
   * Resets the temporal context back to the current date and default settings.
   * Useful for scenarios where a user wants to quickly revert to "today's view".
   * Records this action in the history.
   * @param changedBy Identifier of who/what reset the context.
   * @param reason The reason for the reset.
   */
  public resetTemporalContextToCurrent(changedBy: string = "user", reason: string = "reset_to_current"): void {
    const originalDate = this.temporalContext.effectiveDate;
    this.temporalContext.resetToCurrentDate();
    this.historyService.addEntry({
        originalEffectiveDate: originalDate,
        newEffectiveDate: this.temporalContext.effectiveDate,
        reason,
        changedBy,
        context: { action: "reset_context" }
    });
    appLogger.info("Temporal context reset to current date and default settings.", { changedBy, reason });
  }

  /**
   * Retrieves the full audit trail of all effective date changes.
   * @returns An array of effective date history entries.
   */
  public getEffectiveDateHistory(): Readonly<EffectiveDateHistoryEntry[]> {
    return this.historyService.getHistory();
  }

  /**
   * Predicts the next most likely effective date using the Gemini AI service.
   * Requires Gemini AI to be enabled in the configuration.
   * @param purpose A clear description of the prediction's intended use.
   * @param granularity The desired granularity for the predicted date.
   * @param historicalContextDates Optional list of dates to give AI more context.
   * @returns A `Date` object representing the predicted date, or `null` if AI is unavailable or prediction fails.
   */
  public async getSuggestedNextEffectiveDateFromAI(
    purpose: string = "next ledger entry posting",
    granularity: TemporalGranularity = TemporalGranularity.DAY,
    historicalContextDates?: Date[],
  ): Promise<Date | null> {
    if (!this.configService.isGeminiAIEnabled()) {
      appLogger.warn("Attempted to use AI for date prediction, but Gemini AI is disabled. Returning null.");
      return null;
    }
    const currentEffectiveDate = this.temporalContext.effectiveDate;
    const userTimezone = this.temporalContext.userTimezone;
    return this.geminiService.predictNextEffectiveDate(
      currentEffectiveDate,
      userTimezone,
      granularity,
      purpose,
      historicalContextDates,
    );
  }

  /**
   * Prompts Gemini AI to suggest an appropriate effective date range for a specific purpose,
   * such as a reporting period or a data analysis window.
   * @param referenceDate A date to provide context to the AI (e.g., 'today's date' or a 'period start date').
   * @param purpose The purpose for which the date range is needed.
   * @returns An `EffectiveDateRange` object, or `null` if AI is disabled or suggestion fails.
   */
  public async getSuggestedEffectiveDateRangeFromAI(
    referenceDate: Date,
    purpose: string = "reporting period for financial statements",
  ): Promise<EffectiveDateRange | null> {
    if (!this.configService.isGeminiAIEnabled()) {
      appLogger.warn("Attempted to use AI for range suggestion, but Gemini AI is disabled. Returning null.");
      return null;
    }
    const userTimezone = this.temporalContext.userTimezone;
    return this.geminiService.suggestEffectiveDateRange(referenceDate, userTimezone, purpose);
  }

  /**
   * Detects effective date anomalies in a provided list of dates using Gemini AI.
   * This can help identify data quality issues or unusual temporal patterns.
   * @param dates The list of dates to analyze for anomalies.
   * @returns An array of `Date` objects that were identified as anomalous.
   */
  public async detectDateAnomaliesWithAI(dates: Date[]): Promise<Date[]> {
    if (!this.configService.isGeminiAIEnabled()) {
      appLogger.warn("Attempted to use AI for anomaly detection, but Gemini AI is disabled. Returning empty array.");
      return [];
    }
    const userTimezone = this.temporalContext.userTimezone;
    return this.geminiService.detectEffectiveDateAnomalies(dates, userTimezone);
  }

  /**
   * Leverages Gemini AI to analyze historical dates and identify recurring temporal patterns,
   * trends, and seasonality within the data.
   * @param dates A collection of dates representing events or data points (e.g., transaction dates).
   * @param purpose A description of what kind of patterns are being sought.
   * @returns A `GeminiTemporalResponse['temporalPatternAnalysis']` object or `null`.
   */
  public async analyzeTemporalPatternsWithAI(
    dates: Date[],
    purpose: string = "ledger entry posting patterns",
  ): Promise<GeminiTemporalResponse['temporalPatternAnalysis'] | null> {
    if (!this.configService.isGeminiAIEnabled()) {
      appLogger.warn("Attempted to use AI for pattern analysis, but Gemini AI is disabled. Returning null.");
      return null;
    }
    const userTimezone = this.temporalContext.userTimezone;
    return this.geminiService.analyzeTemporalPatterns(dates, userTimezone, purpose);
  }

  /**
   * Generates hypothetical effective date scenarios using Gemini AI for planning or "what-if" analysis.
   * @param referenceDate The base date for scenario generation.
   * @param scenarioParameters Specific AI parameters for scenario generation.
   * @returns An array of generated scenarios or `null`.
   */
  public async generateTemporalScenariosWithAI(
    referenceDate: Date,
    scenarioParameters?: Record<string, any>
  ): Promise<GeminiTemporalResponse['scenarioResults'] | null> {
    if (!this.configService.isGeminiAIEnabled()) {
      appLogger.warn("Attempted to use AI for scenario generation, but Gemini AI is disabled. Returning null.");
      return null;
    }
    const userTimezone = this.temporalContext.userTimezone;
    return this.geminiService.generateTemporalScenarios(referenceDate, userTimezone, scenarioParameters);
  }

  /**
   * Aggregates a list of data items (each with a `date` property) by a given granularity.
   * This is commonly used for creating time-series data for reporting and visualization.
   * @template T The type of data items, must extend `{ date: Date }`.
   * @param data The raw data array.
   * @param granularity The `TemporalGranularity` for aggregation.
   * @param valueExtractor Optional function to extract a numeric value from each item for summation. Defaults to counting items.
   * @returns A `Map` where keys are ISO date strings (representing period starts) and values are aggregated numbers.
   */
  public aggregateDataByEffectiveDateGranularity<T extends { date: Date }>(
    data: T[],
    granularity: TemporalGranularity,
    valueExtractor?: (item: T) => number,
  ): Map<string, number> {
    return this.aggregator.aggregateByGranularity(
      data,
      granularity,
      this.temporalContext.userTimezone,
      valueExtractor,
    );
  }

  /**
   * Generates a series of `EffectiveDateRange` objects for a specified period and granularity.
   * Useful for defining report periods, dashboard filters, or navigation elements.
   * @param startDate The start date of the overall period.
   * @param endDate The end date of the overall period.
   * @param granularity The desired `TemporalGranularity` for each individual range.
   * @returns An array of `EffectiveDateRange` objects.
   * @throws UnsupportedTemporalOperationError if `granularity` is not supported.
   */
  public generateReportingPeriods(
    startDate: Date,
    endDate: Date,
    granularity: TemporalGranularity,
  ): EffectiveDateRange[] {
    return this.aggregator.generateDateRanges(
      startDate,
      endDate,
      granularity,
      this.temporalContext.userTimezone,
    );
  }

  /**
   * Formats a given date into a string representation using the current user's timezone.
   * @param date The `Date` object to format.
   * @param format The moment.js format string (e.g., "YYYY-MM-DD HH:mm:ss").
   * @returns The formatted date string.
   */
  public formatEffectiveDate(date: Date, format: string = "YYYY-MM-DD HH:mm:ss"): string {
    return moment.tz(date, this.temporalContext.userTimezone).format(format);
  }

  /**
   * Retrieves a comprehensive object detailing the current temporal context,
   * including the effective date, active timezones, granularity, and mode.
   * @returns A snapshot of the current temporal context.
   */
  public getTemporalContextDetails(): ReturnType<TemporalContext['getCurrentContext']> {
    return this.temporalContext.getCurrentContext();
  }

  /**
   * Updates the global configuration settings for all temporal services managed by this manager.
   * Changes take immediate effect.
   * @param newConfig A partial `LedgerTemporalConfig` object containing the settings to update.
   */
  public updateManagerConfiguration(newConfig: Partial<LedgerTemporalConfig>): void {
    this.configService.updateConfig(newConfig);
    // Optionally, re-initialize or propagate config changes to sub-services if they hold copies
    // For now, services access config via `configService` directly, so changes are implicit.
    // If cache settings change, it might be prudent to clear/reconfigure the Gemini cache.
    if (newConfig.cacheGeminiResponses !== undefined || newConfig.maxGeminiCacheSize !== undefined) {
        this.geminiService.clearCache(); // Clear cache on config change to prevent stale data
        // Re-initialize cache with new size if needed, though LRUGeminiResponseCache handles maxSize changes internally
    }
    if (newConfig.maxHistoricalEffectiveYears !== undefined || newConfig.maxFutureEffectiveYears !== undefined) {
        // No direct action needed, validation service gets current config on demand
    }
  }

  /**
   * Checks if a given date is a business day according to the system's configuration.
   * @param date The date to check.
   * @param timezone The timezone to evaluate the business day in.
   * @returns True if it's a business day, false otherwise.
   */
  public isBusinessDay(date: Date, timezone: string): boolean {
    return this.calendarService.isBusinessDay(date, timezone);
  }

  /**
   * Gets the start of the fiscal year for a given date.
   * @param date The reference date.
   * @param timezone The timezone.
   * @returns The start date of the fiscal year.
   */
  public getFiscalYearStart(date: Date, timezone: string): Date {
    return this.calendarService.getFiscalYearStart(date, timezone);
  }

  /**
   * Gets the end of the fiscal year for a given date.
   * @param date The reference date.
   * @param timezone The timezone.
   * @returns The end date of the fiscal year.
   */
  public getFiscalYearEnd(date: Date, timezone: string): Date {
    return this.calendarService.getFiscalYearEnd(date, timezone);
  }

  /**
   * Clears the internal Gemini AI response cache.
   * Useful for ensuring fresh AI predictions when underlying data or models might have changed.
   */
  public clearGeminiAICache(): void {
      this.geminiService.clearCache();
      appLogger.info("Gemini AI response cache explicitly cleared by manager.");
  }
}

// Export a singleton instance of the LedgerEffectiveAtManager.
// This allows for global access and ensures all services are consistently used.
export const ledgerEffectiveAtManager = new LedgerEffectiveAtManager(
  ledgerTemporalConfigService,
  ledgerCalendarService,
  temporalValidationService,
  geminiTemporalIntelligenceService,
  effectiveDatePolicyService,
  effectiveDateHistoryService,
  timeSeriesAggregator,
  temporalContext,
);
