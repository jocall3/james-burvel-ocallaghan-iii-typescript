/**
 * @file app/utilities/downloadCsvTemplate.ts
 *
 * This module provides advanced functionality for generating and downloading CSV templates.
 * It leverages AI-driven suggestions, robust schema validation, sample data generation,
 * and customizable download options to deliver a commercial-grade, flexible solution.
 * Designed to be highly configurable and extensible, it aims to meet diverse data
 * export requirements with best-in-class performance and user experience.
 */

/**
 * --- Global Constants and Configuration Defaults ---
 * These constants define system-wide parameters and default values for the CSV template generator.
 * They promote maintainability and allow for easy adjustment of behavior without modifying core logic.
 */
export const CSV_DEFAULT_DELIMITER: string = ',';
export const CSV_DEFAULT_ENCLOSURE: string = '"';
export const CSV_DEFAULT_ENCODING: 'utf-8' | 'utf-16' | 'iso-8859-1' = 'utf-8';
export const CSV_DEFAULT_LINE_ENDING: '\n' | '\r\n' = '\n';
export const CSV_DEFAULT_FILE_NAME: string = 'data_template';
export const CSV_DEFAULT_SAMPLE_ROWS: number = 5;
export const CSV_DEFAULT_MIME_TYPE: string = 'data:text/csv';

/**
 * --- Error Codes ---
 * Standardized error codes for various failure scenarios within the CSV generation process.
 * This aids in structured error handling and debugging across the application.
 */
export const CSV_ERROR_CODES = {
  INVALID_CONFIG: 'CSV_CONFIG_001',
  SCHEMA_VALIDATION_FAILED: 'CSV_SCHEMA_002',
  AI_SCHEMA_GENERATION_FAILED: 'CSV_GEMINI_003',
  AI_DATA_GENERATION_FAILED: 'CSV_GEMINI_004',
  AI_FORMAT_OPTIMIZATION_FAILED: 'CSV_GEMINI_005',
  CONTENT_GENERATION_FAILED: 'CSV_GEN_006',
  DOWNLOAD_INITIATION_FAILED: 'CSV_DOWNLOAD_007',
  FIELDS_UNDEFINED: 'CSV_SCHEMA_008',
};

/**
 * --- Enums and Type Definitions ---
 * These definitions establish the data structures and enumerations used throughout the module,
 * ensuring strong typing and clear communication of data shapes.
 */

/**
 * Enum for supported data types in CSV fields.
 * This guides AI suggestions and sample data generation.
 */
export enum CsvFieldType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
  UUID = 'uuid',
  EMAIL = 'email',
  URL = 'url',
  DATETIME = 'datetime',
}

/**
 * Interface representing a single field (column) definition in the CSV template.
 * Detailed properties allow for precise control and AI guidance.
 */
export interface CsvFieldDefinition {
  name: string;
  type: CsvFieldType;
  defaultValue?: string | number | boolean | null;
  exampleValue?: string;
  enumOptions?: string[]; // Required if type is ENUM
  description?: string; // Human-readable description for AI or documentation
  isNullable?: boolean; // Whether the field can be empty
  validationRegex?: string; // Custom regex for client-side validation hints
  maxLength?: number;
  minLength?: number;
  // Gemini AI specific hints for data generation
  geminiPromptHint?: string;
  geminiDataFormat?: string; // e.g., "YYYY-MM-DD", "currency"
}

/**
 * Interface for advanced configuration of the CSV template generation and download process.
 * Provides granular control over behavior, including AI integration.
 */
export interface CsvTemplateConfig {
  fileName: string; // The base name for the downloaded file (e.g., "users" -> "users.csv")
  fields?: CsvFieldDefinition[]; // Explicitly defined fields. Can be omitted if using Gemini for schema.
  includeSampleData?: boolean; // Whether to generate sample rows
  numberOfSampleRows?: number; // How many sample rows to generate
  delimiter?: string; // CSV column delimiter (e.g., ',', ';')
  enclosure?: string; // CSV text enclosure (e.g., '"')
  encoding?: 'utf-8' | 'utf-16' | 'iso-8859-1'; // File encoding
  lineEnding?: '\n' | '\r\n'; // Line ending style
  // Gemini AI specific configurations
  useGeminiFieldSuggestions?: boolean; // Use Gemini to suggest fields based on prompt
  geminiSchemaPrompt?: string; // Prompt for Gemini if `useGeminiFieldSuggestions` is true
  useGeminiSampleData?: boolean; // Use Gemini to generate realistic sample data
  geminiDataGenerationContext?: string; // Additional context for Gemini when generating sample data
  geminiFormatOptimizationContext?: string; // Context for Gemini to suggest optimal CSV format
  auditTrailEnabled?: boolean; // Enable AI-enhanced audit logging for this operation
  progressCallback?: (progress: number, message: string, detail?: any) => void; // Callback for progress updates
  skipAIErrors?: boolean; // If true, AI errors will be logged but not prevent template generation.
}

/**
 * Enum for logging levels, facilitating granular control over log verbosity.
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * --- Custom Error Classes ---
 * Enhances error handling by providing specific error types for different failure scenarios.
 */

/**
 * Base custom error class for CSV template operations.
 */
export class CsvTemplateError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string = CSV_ERROR_CODES.CONTENT_GENERATION_FAILED, details?: any) {
    super(message);
    this.name = 'CsvTemplateError';
    this.code = code;
    this.details = details;
    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, CsvTemplateError.prototype);
  }
}

/**
 * Error specifically for validation failures of CSV schema.
 */
export class CsvValidationError extends CsvTemplateError {
  public readonly validationIssues: string[];

  constructor(message: string, validationIssues: string[] = [], code: string = CSV_ERROR_CODES.SCHEMA_VALIDATION_FAILED) {
    super(message, code, { validationIssues });
    this.name = 'CsvValidationError';
    this.validationIssues = validationIssues;
    Object.setPrototypeOf(this, CsvValidationError.prototype);
  }
}

/**
 * Error specific to issues encountered with Gemini AI interactions.
 */
export class GeminiAIError extends CsvTemplateError {
  public readonly aiErrorDetails?: any;

  constructor(message: string, aiErrorDetails?: any, code: string = CSV_ERROR_CODES.AI_SCHEMA_GENERATION_FAILED) {
    super(message, code, { aiErrorDetails });
    this.name = 'GeminiAIError';
    this.aiErrorDetails = aiErrorDetails;
    Object.setPrototypeOf(this, GeminiAIError.prototype);
  }
}

/**
 * --- Utility Functions ---
 * Helper functions to perform common tasks such as file name sanitization.
 */

/**
 * Sanitizes a string to be suitable for a file name.
 * Removes invalid characters and replaces spaces.
 * @param name The original string.
 * @returns A sanitized file name string.
 */
export function sanitizeFileName(name: string): string {
  if (!name || typeof name !== 'string') {
    return CSV_DEFAULT_FILE_NAME;
  }
  // Replace spaces with underscores, remove characters that are often problematic in file names
  return name.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
}

/**
 * --- Logging Service ---
 * A robust, singleton logging service for the application, enabling structured logging.
 * It's designed to be easily swappable with a more advanced logging framework in a production environment.
 */
export class AppLogger {
  private static instance: AppLogger;
  private minLevel: LogLevel;

  private constructor() {
    // Default to INFO level, can be configured via environment variable or global config
    this.minLevel = LogLevel.INFO;
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      this.minLevel = LogLevel.DEBUG;
    }
  }

  /**
   * Returns the singleton instance of the AppLogger.
   * @returns AppLogger instance.
   */
  public static getInstance(): AppLogger {
    if (!AppLogger.instance) {
      AppLogger.instance = new AppLogger();
    }
    return AppLogger.instance;
  }

  /**
   * Sets the minimum logging level. Messages below this level will be ignored.
   * @param level The minimum LogLevel to output.
   */
  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Internal method to log messages if the level meets the minimum threshold.
   * @param level The level of the log message.
   * @param message The main log message.
   * @param data Optional additional data to log.
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [${level}] ${message}`;
      if (data) {
        console.log(logEntry, data);
      } else {
        console.log(logEntry);
      }
      // In a production environment, this would integrate with a centralized logging service
      // e.g., Splunk, ELK stack, CloudWatch Logs, Datadog.
    }
  }

  /**
   * Determines if a message at a given level should be logged.
   * @param level The level of the message.
   * @returns True if the message should be logged, false otherwise.
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  public debug(message: string, data?: any): void { this.log(LogLevel.DEBUG, message, data); }
  public info(message: string, data?: any): void { this.log(LogLevel.INFO, message, data); }
  public warn(message: string, data?: any): void { this.log(LogLevel.WARN, message, data); }
  public error(message: string, data?: any): void { this.log(LogLevel.ERROR, message, data); }
  public critical(message: string, data?: any): void { this.log(LogLevel.CRITICAL, message, data); }
}

/**
 * Extends the AppLogger with AI-specific auditing capabilities.
 * This class is designed to log events relevant to AI interactions, which could
 * later be analyzed by an AI-powered audit system for anomalies or insights.
 */
export class GeminiAIAuditLogger extends AppLogger {
  private static _instance: GeminiAIAuditLogger;

  private constructor() {
    super(); // Call the parent constructor
  }

  /**
   * Returns the singleton instance of the GeminiAIAuditLogger.
   * @returns GeminiAIAuditLogger instance.
   */
  public static getInstance(): GeminiAIAuditLogger {
    if (!GeminiAIAuditLogger._instance) {
      GeminiAIAuditLogger._instance = new GeminiAIAuditLogger();
    }
    return GeminiAIAuditLogger._instance;
  }

  /**
   * Logs an audit event specific to AI operations.
   * @param action A descriptive name for the audited action (e.g., 'GeminiSchemaSuggested').
   * @param details An object containing relevant details for the audit.
   * @param logLevel The log level for this audit entry, defaults to INFO.
   */
  public audit(action: string, details: { [key: string]: any }, logLevel: LogLevel = LogLevel.INFO): void {
    // Prepend a specific tag for easy filtering in log management systems
    const message = `[GeminiAI-Audit] Action: ${action}`;
    this.log(logLevel, message, { auditDetails: details });
    // In a sophisticated system, this could trigger an event for an AI-powered
    // audit log analysis service to detect unusual patterns or security incidents.
  }
}

/**
 * --- Gemini AI Client (Mock/Conceptual) ---
 * This class simulates interactions with a hypothetical Gemini AI service.
 * In a real-world scenario, this would involve actual API calls to Google's Gemini API,
 * including authentication, request formatting, and response parsing.
 * For this exercise, it provides conceptual AI logic to fulfill the "Gemini AI functions everywhere" directive.
 */
export class GeminiAIClient {
  private static instance: GeminiAIClient;
  private logger: AppLogger = AppLogger.getInstance();

  private constructor() {
    this.logger.debug('GeminiAIClient initialized.');
  }

  /**
   * Returns the singleton instance of the GeminiAIClient.
   * @returns GeminiAIClient instance.
   */
  public static getInstance(): GeminiAIClient {
    if (!GeminiAIClient.instance) {
      GeminiAIClient.instance = new GeminiAIClient();
    }
    return GeminiAIClient.instance;
  }

  /**
   * Simulates generating CSV schema suggestions based on a natural language prompt.
   * @param prompt A natural language description of the desired CSV content.
   * @returns A Promise resolving to an array of CsvFieldDefinition.
   */
  public async generateSchemaSuggestions(prompt: string): Promise<CsvFieldDefinition[]> {
    this.logger.info(`[GeminiAIClient] Requesting schema suggestions for prompt: "${prompt}"`);
    // Simulate network latency and AI processing
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

    // Invent diverse schema suggestions based on keyword detection in the prompt
    if (prompt.toLowerCase().includes("customer") || prompt.toLowerCase().includes("user")) {
      return [
        { name: "CustomerID", type: CsvFieldType.UUID, description: "Unique identifier for the customer" },
        { name: "FirstName", type: CsvFieldType.STRING, description: "Customer's first name", geminiPromptHint: "realistic first name" },
        { name: "LastName", type: CsvFieldType.STRING, description: "Customer's last name", geminiPromptHint: "realistic last name" },
        { name: "Email", type: CsvFieldType.EMAIL, description: "Customer's email address", geminiPromptHint: "valid email format" },
        { name: "RegistrationDate", type: CsvFieldType.DATE, description: "Date of customer registration", geminiDataFormat: "YYYY-MM-DD" },
        { name: "IsActive", type: CsvFieldType.BOOLEAN, description: "Indicates if the customer account is active" },
        { name: "PreferredLanguage", type: CsvFieldType.ENUM, enumOptions: ["en", "es", "fr", "de"], description: "Customer's preferred language" },
      ];
    }
    if (prompt.toLowerCase().includes("product") || prompt.toLowerCase().includes("item")) {
      return [
        { name: "ProductID", type: CsvFieldType.UUID, description: "Unique identifier for the product" },
        { name: "ProductName", type: CsvFieldType.STRING, description: "Name of the product" },
        { name: "Category", type: CsvFieldType.ENUM, enumOptions: ["Electronics", "Books", "Apparel", "Home Goods"], description: "Product category" },
        { name: "Price", type: CsvFieldType.NUMBER, description: "Unit price of the product", geminiDataFormat: "currency" },
        { name: "SKU", type: CsvFieldType.STRING, description: "Stock Keeping Unit", validationRegex: "^[A-Z0-9]{8}$" },
        { name: "WeightKG", type: CsvFieldType.NUMBER, description: "Weight in kilograms", isNullable: true },
      ];
    }
    if (prompt.toLowerCase().includes("order") || prompt.toLowerCase().includes("transaction")) {
      return [
        { name: "OrderID", type: CsvFieldType.UUID, description: "Unique order ID" },
        { name: "CustomerID", type: CsvFieldType.UUID, description: "ID of the customer who placed the order" },
        { name: "OrderDate", type: CsvFieldType.DATETIME, description: "Date and time of the order", geminiDataFormat: "YYYY-MM-DD HH:mm:ss" },
        { name: "TotalAmount", type: CsvFieldType.NUMBER, description: "Total amount of the order", geminiDataFormat: "currency" },
        { name: "Currency", type: CsvFieldType.ENUM, enumOptions: ["USD", "EUR", "GBP"], description: "Currency of the transaction" },
        { name: "ShippingAddress", type: CsvFieldType.STRING, description: "Shipping address" },
        { name: "Status", type: CsvFieldType.ENUM, enumOptions: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], description: "Current status of the order" },
      ];
    }
    // Generic fallback for less specific prompts
    return [
      { name: "GeminiFieldAlpha", type: CsvFieldType.STRING, description: "AI-suggested text field" },
      { name: "GeminiFieldBeta", type: CsvFieldType.NUMBER, description: "AI-suggested numeric field" },
      { name: "GeminiFieldGamma", type: CsvFieldType.DATE, description: "AI-suggested date field" },
    ];
  }

  /**
   * Simulates generating realistic sample data for a given set of fields.
   * This is a critical AI function for making templates immediately useful.
   * @param fields The schema definition for which to generate data.
   * @param numberOfRows The number of sample rows to generate.
   * @param context An optional string providing additional context for data generation (e.g., "financial data for Q4 2023").
   * @returns A Promise resolving to a 2D array of strings representing the sample data.
   */
  public async generateSampleData(fields: CsvFieldDefinition[], numberOfRows: number, context?: string): Promise<string[][]> {
    this.logger.info(`[GeminiAIClient] Generating ${numberOfRows} sample rows for ${fields.length} fields. Context: "${context || 'N/A'}"`);
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // Simulate more complex data generation

    const data: string[][] = [];
    const date = new Date(); // Base date for generating date values

    for (let i = 0; i < numberOfRows; i++) {
      const row: string[] = [];
      for (const field of fields) {
        let value: string = '';
        // More sophisticated AI logic would use context and field hints for better data.
        // This mock applies basic rules based on field type and name.
        switch (field.type) {
          case CsvFieldType.STRING:
            if (field.name.toLowerCase().includes('name') && field.name.toLowerCase().includes('first')) value = `Aiden_${i}`;
            else if (field.name.toLowerCase().includes('name') && field.name.toLowerCase().includes('last')) value = `Smitherton_${i}`;
            else if (field.geminiPromptHint) value = `AI-String for ${field.geminiPromptHint} ${i}`;
            else value = `Generic Text Value ${i}`;
            break;
          case CsvFieldType.NUMBER:
            if (field.geminiDataFormat === 'currency') value = (100.50 + i * 10 + (Math.random() * 5)).toFixed(2);
            else if (field.name.toLowerCase().includes('price')) value = (50 + i * 5).toFixed(2);
            else if (field.name.toLowerCase().includes('weight')) value = (1 + i * 0.1).toFixed(2);
            else value = (100 + i).toString();
            break;
          case CsvFieldType.DATE:
            // Generate a date in the past
            const pastDate = new Date(date.getTime() - i * 86400000); // i days ago
            value = pastDate.toISOString().split('T')[0]; // YYYY-MM-DD
            break;
          case CsvFieldType.DATETIME:
            const pastDateTime = new Date(date.getTime() - i * 3600000); // i hours ago
            value = pastDateTime.toISOString().replace('T', ' ').substring(0, 19); // YYYY-MM-DD HH:mm:ss
            break;
          case CsvFieldType.BOOLEAN:
            value = (i % 2 === 0).toString();
            break;
          case CsvFieldType.ENUM:
            value = field.enumOptions ? field.enumOptions[i % field.enumOptions.length] : 'UNKNOWN_ENUM';
            break;
          case CsvFieldType.UUID:
            value = `uuid-${i}-${Math.random().toString(36).substring(2, 10)}`;
            break;
          case CsvFieldType.EMAIL:
            value = `user_${i}@gemini-ai.com`;
            break;
          case CsvFieldType.URL:
            value = `https://example.com/item/${i}`;
            break;
          default:
            value = 'N/A';
        }
        row.push(value);
      }
      data.push(row);
    }
    return data;
  }

  /**
   * Simulates an AI-powered schema validation process.
   * Gemini could analyze the coherence, completeness, and potential issues of a schema.
   * @param fields The array of CsvFieldDefinition to validate.
   * @returns A Promise resolving to an object indicating validity and any issues.
   */
  public async validateSchema(fields: CsvFieldDefinition[]): Promise<{ isValid: boolean; issues: string[] }> {
    this.logger.info(`[GeminiAIClient] Validating schema for ${fields.length} fields.`);
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

    const issues: string[] = [];
    if (!fields || fields.length === 0) {
      issues.push("Schema is empty: No fields provided.");
    } else {
      const fieldNames = new Set<string>();
      fields.forEach((field, index) => {
        if (!field.name || field.name.trim() === '') {
          issues.push(`Field at index ${index} is missing a name.`);
        } else if (fieldNames.has(field.name)) {
          issues.push(`Duplicate field name found: "${field.name}".`);
        } else {
          fieldNames.add(field.name);
        }
        if (!Object.values(CsvFieldType).includes(field.type)) {
          issues.push(`Field "${field.name}" has an invalid type: "${field.type}".`);
        }
        if (field.type === CsvFieldType.ENUM && (!field.enumOptions || field.enumOptions.length === 0)) {
          issues.push(`Enum field "${field.name}" requires enumOptions.`);
        }
        // More complex AI validation could check for logical inconsistencies, naming conventions, etc.
      });
    }

    if (issues.length > 0) {
      this.logger.warn('[GeminiAIClient] Schema validation found issues:', issues);
    } else {
      this.logger.debug('[GeminiAIClient] Schema validation successful.');
    }
    return { isValid: issues.length === 0, issues };
  }

  /**
   * Simulates Gemini AI suggesting optimal CSV format parameters (delimiter, encoding, line ending)
   * based on context and potentially sample data.
   * @param context A string describing the target environment or data characteristics.
   * @param sampleData An optional 2D array of sample data to analyze for optimal format.
   * @returns A Promise resolving to an object with suggested format parameters.
   */
  public async getOptimalCsvFormat(context: string, sampleData?: string[][]): Promise<{ delimiter: string; encoding: string; lineEnding: string }> {
    this.logger.info(`[GeminiAIClient] Suggesting optimal CSV format for context: "${context}"`);
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));

    let delimiter = CSV_DEFAULT_DELIMITER;
    let encoding = CSV_DEFAULT_ENCODING;
    let lineEnding = CSV_DEFAULT_LINE_ENDING;

    // AI logic for format optimization
    if (context.toLowerCase().includes("european") || context.toLowerCase().includes("german") || context.toLowerCase().includes("french")) {
      delimiter = ';'; // Common in European locales
      encoding = 'iso-8859-1'; // Often preferred for legacy systems in Europe
    } else if (context.toLowerCase().includes("asian") || context.toLowerCase().includes("japanese")) {
      encoding = 'utf-16'; // Some Asian systems might prefer UTF-16
    }

    // Advanced AI logic: analyze sampleData for problematic characters or existing delimiters
    if (sampleData && sampleData.length > 0) {
      const allValues = sampleData.flat();
      // If sample data contains commas, but context suggests Europe, confirm semicolon is better.
      if (delimiter === ',' && allValues.some(val => val.includes(',')) && context.toLowerCase().includes("european")) {
        this.logger.debug('[GeminiAIClient] Sample data contains commas; confirming semicolon for European context.');
        delimiter = ';';
      }
      // If sample data contains non-ASCII characters, ensure UTF-8 or appropriate encoding.
      if (!allValues.every(val => /^[\x00-\x7F]*$/.test(val))) { // Check for non-ASCII
        if (encoding === 'iso-8859-1' && !context.toLowerCase().includes("legacy european")) {
          this.logger.debug('[GeminiAIClient] Sample data contains non-ASCII; suggesting UTF-8.');
          encoding = 'utf-8';
        }
      }
    }

    this.logger.debug(`[GeminiAIClient] Optimal format suggested: Delimiter: '${delimiter}', Encoding: '${encoding}', Line Ending: '${lineEnding}'`);
    return { delimiter, encoding, lineEnding };
  }
}

/**
 * --- CsvTemplateGenerator Core Logic ---
 * This class encapsulates the actual CSV content creation, including escaping and formatting.
 */
export class CsvTemplateGenerator {
  private logger: AppLogger = AppLogger.getInstance();

  /**
   * Escapes a single string value for CSV output, handling delimiters and enclosures.
   * @param value The string value to escape.
   * @param delimiter The CSV delimiter character.
   * @param enclosure The CSV enclosure character (usually double quote).
   * @returns The escaped string.
   */
  private static escapeCsvValue(value: string | number | boolean | null | undefined, delimiter: string, enclosure: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);

    let needsEnclosure = false;
    // Check if value contains delimiter, enclosure, or line breaks
    if (stringValue.includes(delimiter) || stringValue.includes(enclosure) || stringValue.includes('\n') || stringValue.includes('\r')) {
      needsEnclosure = true;
    }

    // Escape enclosure characters within the value itself by doubling them
    const escapedValue = stringValue.replace(new RegExp(enclosure.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), enclosure + enclosure);

    return needsEnclosure ? `${enclosure}${escapedValue}${enclosure}` : escapedValue;
  }

  /**
   * Generates the complete CSV content string based on field definitions and data rows.
   * @param fields An array of CsvFieldDefinition for the headers.
   * @param data A 2D array of strings for the data rows.
   * @param config The CsvTemplateConfig object, providing delimiter, enclosure, and line ending.
   * @returns The complete CSV content as a string.
   */
  public generateContent(fields: CsvFieldDefinition[], data: string[][], config: CsvTemplateConfig): string {
    this.logger.debug('Generating CSV content.', { fieldsCount: fields.length, dataRowsCount: data.length });

    if (!fields || fields.length === 0) {
      throw new CsvTemplateError('Cannot generate CSV content without field definitions.', CSV_ERROR_CODES.FIELDS_UNDEFINED);
    }

    const delimiter = config.delimiter || CSV_DEFAULT_DELIMITER;
    const enclosure = config.enclosure || CSV_DEFAULT_ENCLOSURE;
    const lineEnding = config.lineEnding || CSV_DEFAULT_LINE_ENDING;

    const csvLines: string[] = [];

    // --- Generate Headers ---
    const headerLine = fields
      .map(field => CsvTemplateGenerator.escapeCsvValue(field.name, delimiter, enclosure))
      .join(delimiter);
    csvLines.push(headerLine);

    // --- Generate Data Rows ---
    data.forEach((row, rowIndex) => {
      if (row.length !== fields.length) {
        this.logger.warn(`Data row ${rowIndex} has ${row.length} columns, but schema defines ${fields.length}. Truncating or padding.`);
        // For robustness, ensure row matches field count (either truncate or add empty string)
        const paddedRow = fields.map((_, colIndex) => row[colIndex] !== undefined ? row[colIndex] : '');
        const dataLine = paddedRow
          .map(value => CsvTemplateGenerator.escapeCsvValue(value, delimiter, enclosure))
          .join(delimiter);
        csvLines.push(dataLine);
      } else {
        const dataLine = row
          .map(value => CsvTemplateGenerator.escapeCsvValue(value, delimiter, enclosure))
          .join(delimiter);
        csvLines.push(dataLine);
      }
    });

    this.logger.debug('CSV content generation complete.');
    return csvLines.join(lineEnding);
  }
}

/**
 * --- CsvTemplateService (Orchestration Layer) ---
 * This is the central service that orchestrates the entire process,
 * interacting with AI, logging, and the core generator.
 */
export class CsvTemplateService {
  private logger: AppLogger = AppLogger.getInstance();
  private auditLogger: GeminiAIAuditLogger = GeminiAIAuditLogger.getInstance();
  private geminiClient: GeminiAIClient = GeminiAIClient.getInstance();
  private generator: CsvTemplateGenerator = new CsvTemplateGenerator();

  /**
   * Initiates the comprehensive process of generating an AI-enhanced CSV template
   * and triggers its download. This is the main entry point for the service.
   * @param config The complete configuration for the template generation.
   * @returns A Promise that resolves when the download is initiated.
   * @throws CsvTemplateError for various issues during the process.
   */
  public async generateAndDownloadTemplate(config: CsvTemplateConfig): Promise<void> {
    this.logger.info(`Initiating CSV template generation and download for file: ${config.fileName}`, { configDetails: { fileName: config.fileName, useGeminiFieldSuggestions: config.useGeminiFieldSuggestions, useGeminiSampleData: config.useGeminiSampleData } });
    if (config.auditTrailEnabled) {
      this.auditLogger.audit('TemplateGenerationInitiated', { fileName: config.fileName, initialConfig: config });
    }

    try {
      this.reportProgress(config, 5, 'Starting template generation...');

      let effectiveFields: CsvFieldDefinition[] = config.fields || [];
      const tempConfig = { ...config }; // Mutable copy for AI format suggestions

      // --- Step 1: Gemini AI Schema Suggestion ---
      if (tempConfig.useGeminiFieldSuggestions && (!effectiveFields || effectiveFields.length === 0) && tempConfig.geminiSchemaPrompt) {
        this.logger.info('Gemini AI Field Suggestion requested due to missing fields.');
        this.reportProgress(config, 15, 'Requesting Gemini AI for field suggestions...');
        try {
          const suggestedFields = await this.geminiClient.generateSchemaSuggestions(tempConfig.geminiSchemaPrompt);
          effectiveFields = suggestedFields;
          this.logger.debug('Gemini AI suggested fields:', effectiveFields);
          if (config.auditTrailEnabled) {
            this.auditLogger.audit('GeminiSchemaSuggested', { prompt: tempConfig.geminiSchemaPrompt, suggestedFieldsCount: effectiveFields.length });
          }
        } catch (error: any) {
          this.logger.error('Failed to get Gemini AI field suggestions.', { error: error.message, prompt: tempConfig.geminiSchemaPrompt });
          if (config.auditTrailEnabled) {
            this.auditLogger.audit('GeminiSchemaSuggestionFailed', { prompt: tempConfig.geminiSchemaPrompt, error: error.message }, LogLevel.ERROR);
          }
          if (!tempConfig.skipAIErrors) {
            throw new GeminiAIError('Failed to generate schema suggestions from Gemini AI.', { prompt: tempConfig.geminiSchemaPrompt, originalError: error.message }, CSV_ERROR_CODES.AI_SCHEMA_GENERATION_FAILED);
          }
          // Fallback if AI fails and skipAIErrors is true
          if (effectiveFields.length === 0) {
            effectiveFields = [{ name: "DefaultField1", type: CsvFieldType.STRING }, { name: "DefaultField2", type: CsvFieldType.NUMBER }];
            this.logger.warn('Falling back to default fields due to AI schema generation failure.');
          }
        }
      }

      if (!effectiveFields || effectiveFields.length === 0) {
        throw new CsvValidationError('No fields defined for CSV template generation.', ['Fields array is empty or AI failed to provide suggestions.'], CSV_ERROR_CODES.FIELDS_UNDEFINED);
      }

      // --- Step 2: Gemini AI Schema Validation ---
      this.reportProgress(config, 25, 'Validating schema with Gemini AI...');
      try {
        const validationResult = await this.geminiClient.validateSchema(effectiveFields);
        if (!validationResult.isValid) {
          this.logger.warn('Schema validation failed:', validationResult.issues);
          if (config.auditTrailEnabled) {
            this.auditLogger.audit('SchemaValidationFailed', { issues: validationResult.issues, fieldsCount: effectiveFields.length }, LogLevel.WARN);
          }
          throw new CsvValidationError('Provided or AI-generated schema is invalid.', validationResult.issues);
        }
        this.logger.debug('Schema validation successful.');
      } catch (error: any) {
        this.logger.error('Error during Gemini AI schema validation.', { error: error.message });
        if (config.auditTrailEnabled) {
          this.auditLogger.audit('SchemaValidationExecutionError', { error: error.message }, LogLevel.ERROR);
        }
        if (!tempConfig.skipAIErrors) {
          throw new GeminiAIError('Error during schema validation by Gemini AI.', { originalError: error.message }, CSV_ERROR_CODES.AI_SCHEMA_GENERATION_FAILED);
        }
        this.logger.warn('Proceeding with potentially invalid schema due to AI validation error and skipAIErrors=true.');
      }


      let sampleData: string[][] = [];
      if (tempConfig.includeSampleData) {
        // --- Step 3: Gemini AI Sample Data Generation ---
        this.logger.info('Gemini AI Sample Data Generation requested.');
        this.reportProgress(config, 50, 'Requesting Gemini AI for sample data...');
        try {
          sampleData = await this.geminiClient.generateSampleData(
            effectiveFields,
            tempConfig.numberOfSampleRows || CSV_DEFAULT_SAMPLE_ROWS,
            tempConfig.geminiDataGenerationContext
          );
          this.logger.debug(`Gemini AI generated ${sampleData.length} sample rows.`);
          if (config.auditTrailEnabled) {
            this.auditLogger.audit('GeminiSampleDataGenerated', { rows: sampleData.length, fieldsCount: effectiveFields.length });
          }
        } catch (error: any) {
          this.logger.error('Failed to get Gemini AI sample data.', { error: error.message, context: tempConfig.geminiDataGenerationContext });
          if (config.auditTrailEnabled) {
            this.auditLogger.audit('GeminiSampleDataGenerationFailed', { error: error.message, context: tempConfig.geminiDataGenerationContext }, LogLevel.ERROR);
          }
          if (!tempConfig.skipAIErrors) {
            throw new GeminiAIError('Failed to generate sample data from Gemini AI.', { originalError: error.message }, CSV_ERROR_CODES.AI_DATA_GENERATION_FAILED);
          }
          this.logger.warn('Proceeding without sample data due to AI data generation failure and skipAIErrors=true.');
        }
      }

      // --- Step 4: Gemini AI Optimal Format Suggestion ---
      if (tempConfig.useGeminiFieldSuggestions || tempConfig.useGeminiSampleData || tempConfig.geminiFormatOptimizationContext) {
        this.logger.info('Gemini AI Optimal Format Suggestion requested.');
        this.reportProgress(config, 70, 'Consulting Gemini AI for optimal CSV format...');
        try {
          const optimalFormat = await this.geminiClient.getOptimalCsvFormat(
            tempConfig.geminiFormatOptimizationContext || tempConfig.geminiSchemaPrompt || 'generic csv template',
            sampleData.length > 0 ? sampleData : undefined // Only pass sample data if generated
          );
          tempConfig.delimiter = optimalFormat.delimiter;
          tempConfig.encoding = optimalFormat.encoding as CsvTemplateConfig['encoding'];
          tempConfig.lineEnding = optimalFormat.lineEnding as CsvTemplateConfig['lineEnding'];
          this.logger.debug('Gemini AI suggested optimal format:', optimalFormat);
          if (config.auditTrailEnabled) {
            this.auditLogger.audit('GeminiFormatOptimized', { format: optimalFormat });
          }
        } catch (error: any) {
          this.logger.warn('Failed to get Gemini AI optimal format. Using default/user-provided.', { error: error.message });
          if (config.auditTrailEnabled) {
            this.auditLogger.audit('GeminiFormatOptimizationFailed', { error: error.message }, LogLevel.WARN);
          }
          if (!tempConfig.skipAIErrors) {
            throw new GeminiAIError('Failed to get optimal CSV format from Gemini AI.', { originalError: error.message }, CSV_ERROR_CODES.AI_FORMAT_OPTIMIZATION_FAILED);
          }
        }
      }

      this.reportProgress(config, 80, 'Generating final CSV content...');
      const csvContent = this.generator.generateContent(effectiveFields, sampleData, tempConfig);

      // --- Step 5: Download the CSV ---
      this.reportProgress(config, 90, 'Preparing and initiating download...');
      this.performDownload(csvContent, tempConfig);

      this.reportProgress(config, 100, 'Download complete!', { fileName: tempConfig.fileName });
      this.logger.info('CSV template generation and download completed successfully.');
      if (config.auditTrailEnabled) {
        this.auditLogger.audit('TemplateGenerationSuccess', { fileName: tempConfig.fileName });
      }

    } catch (error: any) {
      this.logger.error(`Failed to generate or download CSV template: ${error.message}`, error);
      if (config.auditTrailEnabled) {
        this.auditLogger.audit('TemplateGenerationFailed', {
          fileName: config.fileName,
          errorName: error.name,
          errorMessage: error.message,
          errorCode: error.code || 'UNKNOWN_ERROR',
          errorDetails: error.details || {},
          stack: error.stack
        }, LogLevel.CRITICAL);
      }
      // Re-throw to allow caller to handle, ensuring comprehensive error context
      if (error instanceof CsvTemplateError) {
        throw error;
      } else {
        throw new CsvTemplateError(`An unexpected error occurred: ${error.message}`, CSV_ERROR_CODES.DOWNLOAD_INITIATION_FAILED, { originalError: error });
      }
    }
  }

  /**
   * Helper method to report progress via the configured callback.
   * @param config The CsvTemplateConfig containing the progressCallback.
   * @param progress The current progress percentage (0-100).
   * @param message A descriptive message for the current step.
   * @param detail Optional additional details for the progress update.
   */
  private reportProgress(config: CsvTemplateConfig, progress: number, message: string, detail?: any): void {
    if (config.progressCallback) {
      this.logger.debug(`Progress Update: ${progress}% - ${message}`, detail);
      config.progressCallback(progress, message, detail);
    }
  }

  /**
   * Performs the actual download of the generated CSV content using a data URI and a temporary anchor element.
   * This method is client-side specific and ensures compatibility across browsers.
   * @param csvContent The raw CSV content string.
   * @param config The CsvTemplateConfig, particularly for fileName, encoding.
   */
  private performDownload(csvContent: string, config: CsvTemplateConfig): void {
    const encoding = config.encoding || CSV_DEFAULT_ENCODING;
    // For data URIs, encodeURIComponent is used for the content itself.
    // The charset parameter tells the browser how to interpret the data.
    const dataUri = `${CSV_DEFAULT_MIME_TYPE};charset=${encoding},${encodeURIComponent(csvContent)}`;
    const sanitizedName = sanitizeFileName(config.fileName || CSV_DEFAULT_FILE_NAME);
    const fileName = `${sanitizedName}.csv`;

    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = dataUri;
    link.setAttribute('download', fileName);
    link.style.display = 'none'; // Hide the link
    document.body.appendChild(link); // Append to DOM temporarily
    link.click(); // Programmatically click the link
    document.body.removeChild(link); // Remove from DOM
    this.logger.info(`Download initiated for file: ${fileName}`);
    if (config.auditTrailEnabled) {
      this.auditLogger.audit('DownloadInitiated', { fileName, encoding, mimeType: CSV_DEFAULT_MIME_TYPE });
    }
  }
}

/**
 * --- Publicly Exported API Function ---
 * The main function exposed by this module, offering a flexible interface
 * for generating and downloading AI-enhanced CSV templates.
 * It supports both a simple header array input (for backward compatibility)
 * and a full configuration object for advanced usage.
 *
 * @param headersOrConfig Either an array of string headers (legacy) or a full CsvTemplateConfig object.
 * @param templateConfig Optional partial configuration, used only if `headersOrConfig` is a string array.
 * @returns A Promise that resolves when the download is initiated.
 * @throws CsvTemplateError if the process fails at any stage.
 *
 * @example
 * // Basic usage with just headers:
 * await downloadCsvTemplate(['Name', 'Email', 'Joined Date']);
 *
 * @example
 * // Advanced usage with AI suggestions and sample data:
 * await downloadCsvTemplate({
 *   fileName: 'customer_data_template',
 *   useGeminiFieldSuggestions: true,
 *   geminiSchemaPrompt: 'Generate a CSV template for customer management, including contact info and order history metrics.',
 *   includeSampleData: true,
 *   numberOfSampleRows: 10,
 *   useGeminiSampleData: true,
 *   geminiDataGenerationContext: 'Generate data for fictional customers in a tech startup.',
 *   progressCallback: (progress, message) => console.log(`${progress}%: ${message}`),
 *   auditTrailEnabled: true,
 * });
 *
 * @example
 * // Usage with explicit fields and custom delimiter:
 * await downloadCsvTemplate({
 *   fileName: 'product_catalog',
 *   fields: [
 *     { name: 'ProductId', type: CsvFieldType.UUID },
 *     { name: 'ProductName', type: CsvFieldType.STRING },
 *     { name: 'Price', type: CsvFieldType.NUMBER, geminiDataFormat: 'currency' },
 *   ],
 *   delimiter: ';',
 *   includeSampleData: true,
 * });
 */
export async function downloadCsvTemplate(
  headersOrConfig: string[] | CsvTemplateConfig,
  templateConfig?: Partial<CsvTemplateConfig>
): Promise<void> {
  const service = new CsvTemplateService();
  const logger = AppLogger.getInstance();
  let effectiveConfig: CsvTemplateConfig;

  // Adapt input for backward compatibility or direct config use
  if (Array.isArray(headersOrConfig)) {
    logger.warn("Legacy usage of `downloadCsvTemplate` with string array headers detected. Consider using the object-based configuration for full feature access and AI capabilities.");
    effectiveConfig = {
      fileName: templateConfig?.fileName || CSV_DEFAULT_FILE_NAME,
      fields: headersOrConfig.map(h => ({ name: h, type: CsvFieldType.STRING })), // Default to string type
      includeSampleData: true, // Default to true for legacy calls, provides more value
      numberOfSampleRows: CSV_DEFAULT_SAMPLE_ROWS,
      ...templateConfig, // Merge any provided partial config
    };
  } else {
    effectiveConfig = headersOrConfig; // The first argument is already a full config
  }

  // Apply sensible defaults if not explicitly provided in the configuration
  effectiveConfig.fileName = sanitizeFileName(effectiveConfig.fileName || CSV_DEFAULT_FILE_NAME);
  effectiveConfig.delimiter = effectiveConfig.delimiter || CSV_DEFAULT_DELIMITER;
  effectiveConfig.enclosure = effectiveConfig.enclosure || CSV_DEFAULT_ENCLOSURE;
  effectiveConfig.encoding = effectiveConfig.encoding || CSV_DEFAULT_ENCODING;
  effectiveConfig.lineEnding = effectiveConfig.lineEnding || CSV_DEFAULT_LINE_ENDING;
  effectiveConfig.includeSampleData = effectiveConfig.includeSampleData !== undefined ? effectiveConfig.includeSampleData : true;
  effectiveConfig.numberOfSampleRows = effectiveConfig.numberOfSampleRows || CSV_DEFAULT_SAMPLE_ROWS;
  effectiveConfig.auditTrailEnabled = effectiveConfig.auditTrailEnabled !== undefined ? effectiveConfig.auditTrailEnabled : false;
  effectiveConfig.skipAIErrors = effectiveConfig.skipAIErrors !== undefined ? effectiveConfig.skipAIErrors : false;


  try {
    await service.generateAndDownloadTemplate(effectiveConfig);
  } catch (error: any) {
    logger.error("A critical error occurred during the CSV template download process.", { errorName: error.name, errorMessage: error.message, errorCode: error.code, errorDetails: error.details, stack: error.stack });
    // Re-throw the structured error for upstream error handling
    throw error;
  }
}