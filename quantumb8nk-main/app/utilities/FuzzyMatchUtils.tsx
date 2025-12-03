/**
 * @fileoverview Comprehensive utility for advanced fuzzy string matching,
 * including AI-powered semantic analysis, contextual understanding,
 * and robust configuration options. Designed for commercial-grade applications
 * requiring high-precision and intelligent data reconciliation.
 */

// NOTE: This file assumes the existence of a global 'GeminiAIClient' or similar
// for actual API calls. For demonstration and expandability, we simulate
// the interaction with such a service.

/**
 * Checks if a given field string is wrapped in double quotes,
 * indicating a "fuzzy" or "exact literal" match context.
 *
 * @param {string | null | undefined} field The input string to check.
 * @returns {boolean | undefined} True if wrapped in quotes, false if not,
 *   undefined if the input is null or undefined.
 */
function isFuzzyMatch(field: string | null | undefined): boolean | undefined {
  if (field === null || field === undefined) {
    return undefined;
  }
  // Robust check for string type before calling methods
  if (typeof field !== 'string') {
    return false; // Or throw an error, depending on strictness
  }
  return field.startsWith('"') && field.endsWith('"');
}

/**
 * Extracts a string assumed to be an "exact match" value.
 * If the string is detected as a "fuzzy match" (wrapped in quotes),
 * it returns undefined, indicating it's not an exact match.
 *
 * @param {string | number | undefined} field The input field, which can be a string, number, or undefined.
 * @returns {string | undefined} The extracted exact match string, or undefined if
 *   the input is undefined, or if it's detected as a fuzzy match string.
 */
export function extractExactMatchString(
  field: string | number | undefined,
): string | undefined {
  if (field === undefined) {
    return undefined;
  }

  const stringField = field?.toString();
  // If it's undefined from toString() or not a string, return undefined
  if (stringField === undefined || typeof stringField !== 'string') {
    return undefined;
  }
  return !isFuzzyMatch(stringField) ? stringField : undefined;
}

/**
 * Extracts the inner content of a string assumed to be a "fuzzy match" value.
 * This means removing the leading and trailing double quotes.
 * If the string is not detected as a fuzzy match, it returns undefined.
 *
 * @param {string | number | undefined} field The input field, which can be a string, number, or undefined.
 * @returns {string | undefined} The extracted fuzzy match string (without quotes),
 *   or undefined if the input is undefined, or if it's not detected as a fuzzy match string.
 */
export function extractFuzzyMatchString(
  field: string | number | undefined,
): string | undefined {
  if (field === undefined) {
    return undefined;
  }

  const stringField = field?.toString();
  // If it's undefined from toString() or not a string, return undefined
  if (stringField === undefined || typeof stringField !== 'string') {
    return undefined;
  }
  return isFuzzyMatch(stringField) ? stringField.slice(1, -1) : undefined;
}

// =============================================================================
// Advanced Fuzzy Matching Utilities - Commercial Grade Expansion
// =============================================================================

/**
 * @constant {string} VERSION - Current version of the FuzzyMatchUtils module.
 */
export const VERSION = '2.0.0-gemini.alpha';

/**
 * @interface LogEntry
 * Represents a single log entry with a timestamp, level, and message.
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
}

/**
 * @class Logger
 * A professional-grade logging utility for structured and contextual logging.
 * Supports different log levels and can be configured for output destinations.
 */
export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private logLevel: 'info' | 'warn' | 'error' | 'debug' = 'info';

  private constructor() {
    // Private constructor to enforce Singleton pattern
  }

  /**
   * Returns the singleton instance of the Logger.
   * @returns {Logger} The Logger instance.
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sets the minimum log level for messages to be recorded.
   * @param {'info' | 'warn' | 'error' | 'debug'} level The desired log level.
   */
  public setLogLevel(level: 'info' | 'warn' | 'error' | 'debug'): void {
    this.logLevel = level;
  }

  /**
   * Internal method to add a log entry.
   * @param {'info' | 'warn' | 'error' | 'debug'} level The log level.
   * @param {string} message The log message.
   * @param {Record<string, any>} [context] Optional contextual data for the log.
   */
  private addLog(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] >= levels[this.logLevel]) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context,
      };
      this.logs.push(entry);
      // In a real application, this would integrate with a logging framework
      // like Winston, Log4js, or send to a monitoring service.
      if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console[level](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, context || '');
      }
    }
  }

  /**
   * Logs a debug message.
   * @param {string} message The debug message.
   * @param {Record<string, any>} [context] Optional contextual data.
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.addLog('debug', message, context);
  }

  /**
   * Logs an informational message.
   * @param {string} message The informational message.
   * @param {Record<string, any>} [context] Optional contextual data.
   */
  public info(message: string, context?: Record<string, any>): void {
    this.addLog('info', message, context);
  }

  /**
   * Logs a warning message.
   * @param {string} message The warning message.
   * @param {Record<string, any>} [context] Optional contextual data.
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.addLog('warn', message, context);
  }

  /**
   * Logs an error message.
   * @param {string} message The error message.
   * @param {Record<string, any>} [context] Optional contextual data.
   */
  public error(message: string, context?: Record<string, any>): void {
    this.addLog('error', message, context);
  }

  /**
   * Retrieves all recorded log entries.
   * @returns {LogEntry[]} An array of log entries.
   */
  public getLogs(): LogEntry[] {
    return [...this.logs]; // Return a copy to prevent external modification
  }

  /**
   * Clears all recorded log entries.
   */
  public clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance
export const fuzzyMatchLogger = Logger.getInstance();

/**
 * @interface SemanticEmbedding
 * Represents a vector embedding generated for a piece of text by an AI model.
 * These are typically high-dimensional numerical arrays.
 */
export interface SemanticEmbedding {
  vector: number[];
  modelId: string;
  timestamp: string;
}

/**
 * @interface GeminiAIContext
 * Provides contextual information to the Gemini AI service to refine
 * embedding generation and semantic matching. This can include domain-specific
 * knowledge, user preferences, or data schemas.
 */
export interface GeminiAIContext {
  domain?: string; // e.g., 'finance', 'healthcare', 'e-commerce'
  language?: string; // e.g., 'en-US', 'es-MX'
  entityTypes?: string[]; // e.g., ['person', 'organization', 'product_code']
  customDirectives?: string; // Free-form instructions for the AI
  userId?: string; // For personalized matching
  sessionId?: string; // For conversational context
}

/**
 * @interface FuzzyMatchResult
 * Represents the outcome of a fuzzy matching operation.
 */
export interface FuzzyMatchResult {
  /** The original input string that was matched against. */
  input: string;
  /** The candidate string that was matched. */
  candidate: string;
  /** A score indicating the strength of the match, typically between 0 and 1. */
  score: number;
  /** The algorithm or strategy used to determine the match. */
  algorithm: MatchAlgorithm | MatchStrategyType;
  /** Optional detailed explanation or metadata about the match. */
  details?: Record<string, any>;
  /** Indicates if this match is considered a confident match based on thresholds. */
  isConfidentMatch: boolean;
  /** The context used for this specific match. */
  contextUsed?: GeminiAIContext;
  /** The timestamp when the match was performed. */
  timestamp: string;
}

/**
 * @enum {string} MatchAlgorithm
 * Defines different string distance/similarity algorithms.
 */
export enum MatchAlgorithm {
  LEVENSHTEIN = 'Levenshtein',
  JACCARD = 'Jaccard',
  COSINE_SIMILARITY = 'CosineSimilarity',
  EXACT = 'Exact',
  NONE = 'None',
}

/**
 * @enum {string} MatchStrategyType
 * Defines broader matching strategies that might combine algorithms or use AI.
 */
export enum MatchStrategyType {
  BASIC_STRING_DISTANCE = 'BasicStringDistance',
  SEMANTIC_AI = 'SemanticAI',
  CONTEXTUAL_AI = 'ContextualAI',
  HYBRID_SMART = 'HybridSmart',
}

/**
 * @interface FuzzyMatchConfig
 * Configuration options for the fuzzy matching process.
 */
export interface FuzzyMatchConfig {
  /**
   * Minimum score required for a match to be considered "confident".
   * (e.g., 0.8 for 80% similarity).
   */
  confidenceThreshold: number;
  /**
   * Optional threshold for a "weak" match, below which results might be filtered.
   */
  weakMatchThreshold?: number;
  /**
   * Preferred string matching algorithm(s) to use. Can be an array for fallback.
   */
  preferredAlgorithms: MatchAlgorithm[];
  /**
   * Maximum number of results to return for multi-candidate matches.
   */
  maxResults?: number;
  /**
   * Flag to enable/disable AI-powered semantic matching.
   */
  enableAISemanticMatching: boolean;
  /**
   * Flag to enable/disable context-aware AI processing.
   */
  enableAIContextualMatching: boolean;
  /**
   * If true, normalize strings (lowercase, remove punctuation, etc.) before matching.
   */
  normalizeStrings: boolean;
  /**
   * Weight for semantic similarity when combining with other scores (0-1).
   */
  semanticWeight: number;
  /**
   * Max deviation allowed for numerical values if matching numbers (e.g., for prices).
   */
  numericalTolerance?: number;
  /**
   * If true, return all matches regardless of score, otherwise filter by confidenceThreshold.
   */
  returnAllMatches?: boolean;
}

/**
 * Default configuration for fuzzy matching.
 */
export const defaultFuzzyMatchConfig: FuzzyMatchConfig = {
  confidenceThreshold: 0.75,
  weakMatchThreshold: 0.4,
  preferredAlgorithms: [MatchAlgorithm.LEVENSHTEIN, MatchAlgorithm.JACCARD],
  maxResults: 5,
  enableAISemanticMatching: true,
  enableAIContextualMatching: true,
  normalizeStrings: true,
  semanticWeight: 0.6,
  numericalTolerance: 0.01, // 1% tolerance for numbers
  returnAllMatches: false,
};

/**
 * @class EmbeddingCache
 * Manages an in-memory cache for semantic embeddings to reduce redundant AI calls.
 * Implements a LRU-like eviction policy.
 */
export class EmbeddingCache {
  private cache = new Map<string, { embedding: SemanticEmbedding; timestamp: number }>();
  private maxSize: number; // Max number of entries
  private ttl: number; // Time-to-live in milliseconds

  /**
   * Creates an instance of EmbeddingCache.
   * @param {number} maxSize Maximum number of embeddings to cache. Default: 1000.
   * @param {number} ttl Time-to-live for cache entries in milliseconds. Default: 3600000 (1 hour).
   */
  constructor(maxSize: number = 1000, ttl: number = 3600000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
    fuzzyMatchLogger.info(`EmbeddingCache initialized with maxSize: ${maxSize}, TTL: ${ttl / 1000}s`);
  }

  /**
   * Generates a cache key for a given text and context.
   * @param {string} text The text to be embedded.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {string} The unique cache key.
   */
  private generateKey(text: string, context?: GeminiAIContext): string {
    const contextString = context ? JSON.stringify(context) : '';
    return `${text}::${contextString}`;
  }

  /**
   * Retrieves an embedding from the cache if available and not expired.
   * @param {string} text The text associated with the embedding.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {SemanticEmbedding | undefined} The cached embedding or undefined if not found/expired.
   */
  public get(text: string, context?: GeminiAIContext): SemanticEmbedding | undefined {
    const key = this.generateKey(text, context);
    const entry = this.cache.get(key);

    if (entry) {
      if (Date.now() - entry.timestamp < this.ttl) {
        // Move to end to simulate LRU
        this.cache.delete(key);
        this.cache.set(key, entry);
        fuzzyMatchLogger.debug(`Cache hit for key: ${key}`);
        return entry.embedding;
      } else {
        this.cache.delete(key);
        fuzzyMatchLogger.debug(`Cache expired for key: ${key}`);
      }
    }
    fuzzyMatchLogger.debug(`Cache miss for key: ${key}`);
    return undefined;
  }

  /**
   * Stores an embedding in the cache. Evicts oldest entry if cache is full.
   * @param {string} text The text associated with the embedding.
   * @param {SemanticEmbedding} embedding The embedding to store.
   * @param {GeminiAIContext} [context] Optional AI context.
   */
  public set(text: string, embedding: SemanticEmbedding, context?: GeminiAIContext): void {
    const key = this.generateKey(text, context);
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entry (the first one in insertion order for Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
        fuzzyMatchLogger.debug(`Cache full, evicted key: ${oldestKey}`);
      }
    }
    this.cache.set(key, { embedding, timestamp: Date.now() });
    fuzzyMatchLogger.debug(`Cache set for key: ${key}`);
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
    fuzzyMatchLogger.info('EmbeddingCache cleared.');
  }

  /**
   * Gets the current size of the cache.
   * @returns {number} The number of entries in the cache.
   */
  public size(): number {
    return this.cache.size;
  }
}

/**
 * @class GeminiAIService
 * A simulated service for interacting with the Gemini AI platform.
 * This class encapsulates functions for generating semantic embeddings,
 * performing natural language understanding, and suggesting matches.
 *
 * In a real-world scenario, this would make actual API calls to Google's Gemini API.
 */
export class GeminiAIService {
  private static instance: GeminiAIService;
  private apiKey: string; // Placeholder for an actual API key
  private embeddingCache: EmbeddingCache;

  /**
   * Private constructor to enforce Singleton pattern.
   * @param {string} apiKey The API key for Gemini AI. (Placeholder)
   * @param {EmbeddingCache} embeddingCache The cache for embeddings.
   */
  private constructor(apiKey: string = 'sk-gemini-placeholder', embeddingCache: EmbeddingCache) {
    this.apiKey = apiKey; // In production, this would be loaded securely
    this.embeddingCache = embeddingCache;
    fuzzyMatchLogger.info('GeminiAIService initialized (simulated).');
  }

  /**
   * Returns the singleton instance of the GeminiAIService.
   * @param {string} [apiKey] Optional API key for Gemini AI.
   * @param {EmbeddingCache} [embeddingCache] Optional embedding cache instance.
   * @returns {GeminiAIService} The GeminiAIService instance.
   */
  public static getInstance(apiKey?: string, embeddingCache?: EmbeddingCache): GeminiAIService {
    if (!GeminiAIService.instance) {
      // Ensure cache is initialized before service
      const cache = embeddingCache || new EmbeddingCache();
      GeminiAIService.instance = new GeminiAIService(apiKey, cache);
    } else if (apiKey && GeminiAIService.instance.apiKey === 'sk-gemini-placeholder') {
      // Allow setting a real API key if not already set
      GeminiAIService.instance.apiKey = apiKey;
    }
    return GeminiAIService.instance;
  }

  /**
   * Simulates generating a semantic embedding for a given text using Gemini AI.
   * This would typically involve a call to an embedding API endpoint.
   * @param {string} text The text to embed.
   * @param {GeminiAIContext} [context] Optional AI context to guide embedding generation.
   * @returns {Promise<SemanticEmbedding>} A promise that resolves with the semantic embedding.
   */
  public async getSemanticEmbedding(text: string, context?: GeminiAIContext): Promise<SemanticEmbedding> {
    const cachedEmbedding = this.embeddingCache.get(text, context);
    if (cachedEmbedding) {
      fuzzyMatchLogger.debug(`Returning cached embedding for: ${text}`);
      return cachedEmbedding;
    }

    fuzzyMatchLogger.info(`Simulating Gemini AI embedding for: "${text}"`, { context });
    // Simulate network latency and AI processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));

    // In a real scenario, this would be a call to a model endpoint:
    // const response = await fetch('https://api.gemini.ai/v1/embeddings', { ... });
    // const data = await response.json();
    // const vector = data.embedding.vector;

    // For simulation, generate a simple mock vector based on text properties
    const mockVectorLength = 128; // Standard embedding dimension
    const seed = text.length + (context?.domain?.length || 0) + (context?.language?.length || 0);
    const vector = Array.from({ length: mockVectorLength }, (_, i) =>
      Math.sin((i + seed) * 0.1) * Math.cos(seed * 0.05 + i * 0.01) + 0.5 // Values between 0 and 1
    );

    const embedding: SemanticEmbedding = {
      vector,
      modelId: 'gemini-embedding-v1-simulated',
      timestamp: new Date().toISOString(),
    };

    this.embeddingCache.set(text, embedding, context);
    fuzzyMatchLogger.debug(`Generated and cached new embedding for: ${text}`);
    return embedding;
  }

  /**
   * Simulates analyzing text for intent, keywords, or entity extraction using Gemini AI's NLU capabilities.
   * @param {string} text The text to analyze.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<string[]>} A promise that resolves with an array of identified intents/keywords.
   */
  public async analyzeTextForIntent(text: string, context?: GeminiAIContext): Promise<string[]> {
    fuzzyMatchLogger.info(`Simulating Gemini AI intent analysis for: "${text}"`, { context });
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 30));

    // Mock implementation: simple keyword extraction
    const normalizedText = text.toLowerCase();
    const keywords = new Set<string>();
    const words = normalizedText.split(/\W+/).filter(w => w.length > 2);

    if (normalizedText.includes('account') || normalizedText.includes('acct')) keywords.add('account');
    if (normalizedText.includes('payment')) keywords.add('payment');
    if (normalizedText.includes('invoice')) keywords.add('invoice');
    if (normalizedText.includes('customer') || normalizedText.includes('client')) keywords.add('customer');
    if (context?.domain === 'finance') {
      if (normalizedText.includes('transaction')) keywords.add('transaction');
      if (normalizedText.includes('balance')) keywords.add('balance');
    }

    for (const word of words) {
      keywords.add(word); // Add all significant words
    }

    return Array.from(keywords).slice(0, 5); // Limit to top 5 mock keywords
  }

  /**
   * Simulates getting AI-recommended matches for an input against a list of candidates.
   * This leverages semantic understanding and potentially contextual rules.
   * @param {string} input The input string to match.
   * @param {string[]} candidates The list of candidate strings to match against.
   * @param {FuzzyMatchConfig} [config] Optional fuzzy match configuration.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<FuzzyMatchResult[]>} A promise resolving to an array of AI-driven match results.
   */
  public async getAIRecommendedMatches(
    input: string,
    candidates: string[],
    config: FuzzyMatchConfig = defaultFuzzyMatchConfig,
    context?: GeminiAIContext,
  ): Promise<FuzzyMatchResult[]> {
    fuzzyMatchLogger.info(`Simulating Gemini AI recommendation for "${input}" against ${candidates.length} candidates.`, { context });
    const results: FuzzyMatchResult[] = [];

    if (!config.enableAISemanticMatching) {
      fuzzyMatchLogger.warn('AI Semantic Matching is disabled in configuration.');
      return [];
    }

    const inputEmbedding = await this.getSemanticEmbedding(input, context);

    for (const candidate of candidates) {
      const candidateEmbedding = await this.getSemanticEmbedding(candidate, context);
      const score = cosineSimilarity(inputEmbedding.vector, candidateEmbedding.vector);

      // Simulate a slight variation based on context or NLU
      const nluKeywords = await this.analyzeTextForIntent(input, context);
      const contextualAdjustment = nluKeywords.some(kw => candidate.toLowerCase().includes(kw)) ? 0.05 : 0;
      const adjustedScore = Math.min(1.0, score + contextualAdjustment);

      results.push({
        input,
        candidate,
        score: adjustedScore,
        algorithm: MatchStrategyType.SEMANTIC_AI,
        isConfidentMatch: adjustedScore >= config.confidenceThreshold,
        contextUsed: context,
        timestamp: new Date().toISOString(),
        details: {
          modelId: inputEmbedding.modelId,
          semanticVectorLength: inputEmbedding.vector.length,
          contextualAdjustment,
        },
      });
    }

    const sortedResults = results
      .filter(r => r.score >= (config.returnAllMatches ? (config.weakMatchThreshold || 0) : config.confidenceThreshold))
      .sort((a, b) => b.score - a.score);

    fuzzyMatchLogger.debug(`AI recommendations generated for "${input}". Found ${sortedResults.length} confident matches.`);
    return sortedResults.slice(0, config.maxResults);
  }
}

// Global instances for convenience and potential dependency injection in other modules
export const globalEmbeddingCache = new EmbeddingCache();
export const globalGeminiAIService = GeminiAIService.getInstance(undefined, globalEmbeddingCache);

// =============================================================================
// Core String Algorithms
// =============================================================================

/**
 * Normalizes a string by converting it to lowercase, trimming whitespace,
 * and optionally removing punctuation.
 * @param {string} str The input string.
 * @param {boolean} removePunctuation If true, removes all non-alphanumeric characters.
 * @returns {string} The normalized string.
 */
export function normalizeString(str: string, removePunctuation: boolean = true): string {
  if (typeof str !== 'string') {
    fuzzyMatchLogger.warn('Attempted to normalize a non-string value.', { value: str });
    return String(str || ''); // Convert to string safely
  }
  let normalized = str.toLowerCase().trim();
  if (removePunctuation) {
    normalized = normalized.replace(/[^\w\s]/gi, ''); // Remove non-word chars except space
  }
  return normalized.replace(/\s+/g, ' '); // Replace multiple spaces with single
}

/**
 * Calculates the Levenshtein distance between two strings.
 * The Levenshtein distance is a metric for measuring the difference between two sequences.
 * It is the minimum number of single-character edits (insertions, deletions or substitutions)
 * required to change one word into the other.
 *
 * @param {string} s1 The first string.
 * @param {string} s2 The second string.
 * @returns {number} The Levenshtein distance.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const arr = [];
  for (let i = 0; i <= s2.length; i++) {
    arr[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    arr[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      const cost = s1[j - 1] === s2[i - 1] ? 0 : 1;
      arr[i][j] = Math.min(
        arr[i - 1][j] + 1, // deletion
        arr[i][j - 1] + 1, // insertion
        arr[i - 1][j - 1] + cost, // substitution
      );
    }
  }
  return arr[s2.length][s1.length];
}

/**
 * Calculates the Jaccard similarity coefficient between two strings.
 * This is based on the size of the intersection divided by the size of the union
 * of the n-grams (subsequences of length 'n') of the two strings.
 *
 * @param {string} s1 The first string.
 * @param {string} s2 The second string.
 * @param {number} n The length of n-grams to use. Default is 2 (bigrams).
 * @returns {number} The Jaccard similarity, a value between 0 and 1.
 */
export function jaccardSimilarity(s1: string, s2: string, n: number = 2): number {
  if (s1 === s2) return 1;
  if (!s1.length || !s2.length) return 0;

  const getNGrams = (s: string, gramLength: number) => {
    const grams = new Set<string>();
    for (let i = 0; i <= s.length - gramLength; i++) {
      grams.add(s.substring(i, i + gramLength));
    }
    return grams;
  };

  const nGrams1 = getNGrams(s1, n);
  const nGrams2 = getNGrams(s2, n);

  if (nGrams1.size === 0 && nGrams2.size === 0) return 1; // Both empty, considered identical
  if (nGrams1.size === 0 || nGrams2.size === 0) return 0; // One empty, one not

  let intersectionSize = 0;
  for (const gram of nGrams1) {
    if (nGrams2.has(gram)) {
      intersectionSize++;
    }
  }

  const unionSize = nGrams1.size + nGrams2.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Calculates the Cosine Similarity between two numerical vectors.
 * Commonly used to determine how similar two documents (or in our case, text embeddings) are.
 * A higher cosine similarity means a smaller angle between vectors, indicating greater similarity.
 *
 * @param {number[]} v1 The first vector.
 * @param {number[]} v2 The second vector.
 * @returns {number} The cosine similarity, a value between -1 and 1. (Usually 0 to 1 for embeddings).
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) {
    fuzzyMatchLogger.error('Vectors must have the same dimension for cosine similarity.', { v1Length: v1.length, v2Length: v2.length });
    throw new Error('Vectors must have the same dimension');
  }
  if (v1.length === 0) return 1; // Both empty vectors, consider them similar

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    magnitude1 += v1[i] * v1[i];
    magnitude2 += v2[i] * v2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    fuzzyMatchLogger.warn('One or both vectors are zero vectors, cosine similarity undefined (returning 0).');
    return 0; // Or throw error, depending on desired behavior for zero vectors
  }

  return dotProduct / (magnitude1 * magnitude2);
}

// =============================================================================
// Match Strategy Interfaces and Implementations
// =============================================================================

/**
 * @interface FuzzyMatchStrategy
 * Defines the contract for different fuzzy matching strategies.
 * Each strategy should implement a `match` method.
 */
export interface FuzzyMatchStrategy {
  /**
   * Performs a fuzzy match between an input string and a candidate string.
   * @param {string} input The string to match.
   * @param {string} candidate The string to compare against.
   * @param {FuzzyMatchConfig} config The fuzzy match configuration.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<FuzzyMatchResult | null>} A promise resolving to the match result, or null if no match.
   */
  match(
    input: string,
    candidate: string,
    config: FuzzyMatchConfig,
    context?: GeminiAIContext,
  ): Promise<FuzzyMatchResult | null>;
  /**
   * The type of strategy implemented.
   */
  readonly type: MatchStrategyType | MatchAlgorithm;
}

/**
 * @class ExactMatchStrategy
 * A basic strategy that checks for an exact, case-sensitive or normalized match.
 */
export class ExactMatchStrategy implements FuzzyMatchStrategy {
  public readonly type = MatchAlgorithm.EXACT;

  /**
   * Performs an exact match.
   * @param {string} input The input string.
   * @param {string} candidate The candidate string.
   * @param {FuzzyMatchConfig} config The fuzzy match configuration.
   * @returns {Promise<FuzzyMatchResult | null>} Match result or null.
   */
  public async match(
    input: string,
    candidate: string,
    config: FuzzyMatchConfig,
  ): Promise<FuzzyMatchResult | null> {
    const normalizedInput = config.normalizeStrings ? normalizeString(input, true) : input;
    const normalizedCandidate = config.normalizeStrings ? normalizeString(candidate, true) : candidate;

    const isMatch = normalizedInput === normalizedCandidate;
    const score = isMatch ? 1.0 : 0.0;

    fuzzyMatchLogger.debug(`ExactMatchStrategy for "${input}" vs "${candidate}" => Score: ${score}`);
    return {
      input,
      candidate,
      score,
      algorithm: this.type,
      isConfidentMatch: isMatch,
      timestamp: new Date().toISOString(),
      details: {
        normalized: config.normalizeStrings,
      },
    };
  }
}

/**
 * @class LevenshteinStrategy
 * Implements matching using the Levenshtein distance algorithm.
 */
export class LevenshteinStrategy implements FuzzyMatchStrategy {
  public readonly type = MatchAlgorithm.LEVENSHTEIN;

  /**
   * Performs a Levenshtein distance-based match.
   * @param {string} input The input string.
   * @param {string} candidate The candidate string.
   * @param {FuzzyMatchConfig} config The fuzzy match configuration.
   * @returns {Promise<FuzzyMatchResult | null>} Match result or null.
   */
  public async match(
    input: string,
    candidate: string,
    config: FuzzyMatchConfig,
  ): Promise<FuzzyMatchResult | null> {
    const normalizedInput = config.normalizeStrings ? normalizeString(input, true) : input;
    const normalizedCandidate = config.normalizeStrings ? normalizeString(candidate, true) : candidate;

    if (normalizedInput.length === 0 && normalizedCandidate.length === 0) {
      return {
        input,
        candidate,
        score: 1.0,
        algorithm: this.type,
        isConfidentMatch: true,
        timestamp: new Date().toISOString(),
      };
    }

    const distance = levenshteinDistance(normalizedInput, normalizedCandidate);
    const maxLength = Math.max(normalizedInput.length, normalizedCandidate.length);
    const score = maxLength === 0 ? 0 : 1 - (distance / maxLength); // Convert distance to similarity score

    fuzzyMatchLogger.debug(`LevenshteinStrategy for "${input}" vs "${candidate}" => Distance: ${distance}, Score: ${score}`);
    return {
      input,
      candidate,
      score,
      algorithm: this.type,
      isConfidentMatch: score >= config.confidenceThreshold,
      timestamp: new Date().toISOString(),
      details: {
        distance,
        normalized: config.normalizeStrings,
      },
    };
  }
}

/**
 * @class JaccardStrategy
 * Implements matching using the Jaccard similarity coefficient with n-grams.
 */
export class JaccardStrategy implements FuzzyMatchStrategy {
  public readonly type = MatchAlgorithm.JACCARD;

  /**
   * Performs a Jaccard similarity-based match.
   * @param {string} input The input string.
   * @param {string} candidate The candidate string.
   * @param {FuzzyMatchConfig} config The fuzzy match configuration.
   * @returns {Promise<FuzzyMatchResult | null>} Match result or null.
   */
  public async match(
    input: string,
    candidate: string,
    config: FuzzyMatchConfig,
  ): Promise<FuzzyMatchResult | null> {
    const normalizedInput = config.normalizeStrings ? normalizeString(input, true) : input;
    const normalizedCandidate = config.normalizeStrings ? normalizeString(candidate, true) : candidate;

    const score = jaccardSimilarity(normalizedInput, normalizedCandidate, 2); // Using bigrams by default

    fuzzyMatchLogger.debug(`JaccardStrategy for "${input}" vs "${candidate}" => Score: ${score}`);
    return {
      input,
      candidate,
      score,
      algorithm: this.type,
      isConfidentMatch: score >= config.confidenceThreshold,
      timestamp: new Date().toISOString(),
      details: {
        nGrams: 2,
        normalized: config.normalizeStrings,
      },
    };
  }
}

/**
 * @class SemanticStrategy
 * Implements matching using Gemini AI's semantic embedding and cosine similarity.
 */
export class SemanticStrategy implements FuzzyMatchStrategy {
  public readonly type = MatchStrategyType.SEMANTIC_AI;
  private geminiService: GeminiAIService;

  constructor(geminiService: GeminiAIService) {
    this.geminiService = geminiService;
  }

  /**
   * Performs a semantic match using Gemini AI.
   * @param {string} input The input string.
   * @param {string} candidate The candidate string.
   * @param {FuzzyMatchConfig} config The fuzzy match configuration.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<FuzzyMatchResult | null>} Match result or null.
   */
  public async match(
    input: string,
    candidate: string,
    config: FuzzyMatchConfig,
    context?: GeminiAIContext,
  ): Promise<FuzzyMatchResult | null> {
    if (!config.enableAISemanticMatching) {
      fuzzyMatchLogger.warn('Semantic matching is disabled by configuration.');
      return null;
    }

    try {
      const inputEmbedding = await this.geminiService.getSemanticEmbedding(input, context);
      const candidateEmbedding = await this.geminiService.getSemanticEmbedding(candidate, context);

      const score = cosineSimilarity(inputEmbedding.vector, candidateEmbedding.vector);

      fuzzyMatchLogger.debug(`SemanticStrategy for "${input}" vs "${candidate}" => Score: ${score}`);
      return {
        input,
        candidate,
        score,
        algorithm: this.type,
        isConfidentMatch: score >= config.confidenceThreshold,
        contextUsed: context,
        timestamp: new Date().toISOString(),
        details: {
          modelId: inputEmbedding.modelId,
          vectorLength: inputEmbedding.vector.length,
        },
      };
    } catch (error) {
      fuzzyMatchLogger.error(`Error during semantic matching for "${input}" vs "${candidate}": ${error instanceof Error ? error.message : String(error)}`, { error });
      return null;
    }
  }
}

/**
 * @class NumericalToleranceStrategy
 * A strategy specifically designed for matching numerical strings within a defined tolerance.
 */
export class NumericalToleranceStrategy implements FuzzyMatchStrategy {
  public readonly type = MatchAlgorithm.NONE; // This is a specialized strategy, not a general algorithm

  /**
   * Performs a numerical match within tolerance.
   * @param {string} input The input string.
   * @param {string} candidate The candidate string.
   * @param {FuzzyMatchConfig} config The fuzzy match configuration.
   * @returns {Promise<FuzzyMatchResult | null>} Match result or null.
   */
  public async match(
    input: string,
    candidate: string,
    config: FuzzyMatchConfig,
  ): Promise<FuzzyMatchResult | null> {
    const numInput = parseFloat(input);
    const numCandidate = parseFloat(candidate);

    // Check if both are valid numbers and config has tolerance
    if (isNaN(numInput) || isNaN(numCandidate) || config.numericalTolerance === undefined) {
      fuzzyMatchLogger.debug(`NumericalToleranceStrategy skipped: Not both numbers or tolerance not set. Input: ${input}, Candidate: ${candidate}`);
      return null;
    }

    const absoluteDifference = Math.abs(numInput - numCandidate);
    const relativeTolerance = (config.numericalTolerance || 0.01) * Math.max(Math.abs(numInput), Math.abs(numCandidate));

    const isMatch = absoluteDifference <= relativeTolerance;
    const score = isMatch ? 1.0 : 0.0; // Simple binary score for now, could be scaled

    fuzzyMatchLogger.debug(`NumericalToleranceStrategy for "${input}" vs "${candidate}" => Score: ${score}, AbsDiff: ${absoluteDifference}, RelTol: ${relativeTolerance}`);
    return {
      input,
      candidate,
      score,
      algorithm: this.type,
      isConfidentMatch: isMatch,
      timestamp: new Date().toISOString(),
      details: {
        numericalInput: numInput,
        numericalCandidate: numCandidate,
        tolerance: config.numericalTolerance,
        absoluteDifference,
      },
    };
  }
}

// =============================================================================
// Main Fuzzy Matcher Class
// =============================================================================

/**
 * @class FuzzyMatcher
 * The central class for orchestrating various fuzzy matching strategies.
 * It allows for flexible configuration and integrates AI capabilities.
 */
export class FuzzyMatcher {
  private config: FuzzyMatchConfig;
  private geminiService: GeminiAIService;
  private strategies: Map<MatchAlgorithm | MatchStrategyType, FuzzyMatchStrategy>;

  /**
   * Initializes the FuzzyMatcher with a given configuration and Gemini AI service.
   * @param {FuzzyMatchConfig} [config] Optional initial configuration. Defaults to `defaultFuzzyMatchConfig`.
   * @param {GeminiAIService} [geminiService] Optional Gemini AI service instance. Defaults to `globalGeminiAIService`.
   */
  constructor(config?: Partial<FuzzyMatchConfig>, geminiService?: GeminiAIService) {
    this.config = { ...defaultFuzzyMatchConfig, ...config };
    this.geminiService = geminiService || globalGeminiAIService;
    this.strategies = new Map();
    this.initializeStrategies();
    fuzzyMatchLogger.info('FuzzyMatcher initialized.', { config: this.config });
  }

  /**
   * Initializes and registers all available matching strategies.
   */
  private initializeStrategies(): void {
    this.strategies.set(MatchAlgorithm.EXACT, new ExactMatchStrategy());
    this.strategies.set(MatchAlgorithm.LEVENSHTEIN, new LevenshteinStrategy());
    this.strategies.set(MatchAlgorithm.JACCARD, new JaccardStrategy());
    this.strategies.set(MatchStrategyType.SEMANTIC_AI, new SemanticStrategy(this.geminiService));
    // Numerical strategy is not directly called by preferredAlgorithms, but can be invoked for numbers
    this.strategies.set('NumericalTolerance', new NumericalToleranceStrategy());
  }

  /**
   * Updates the matcher's configuration.
   * @param {Partial<FuzzyMatchConfig>} newConfig Partial configuration to apply.
   */
  public configure(newConfig: Partial<FuzzyMatchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    fuzzyMatchLogger.info('FuzzyMatcher configuration updated.', { newConfig, currentConfig: this.config });
  }

  /**
   * Retrieves the current configuration of the FuzzyMatcher.
   * @returns {FuzzyMatchConfig} The current configuration.
   */
  public getConfig(): FuzzyMatchConfig {
    return { ...this.config };
  }

  /**
   * Executes a single fuzzy match operation between an input and a candidate string
   * using the configured strategies and AI capabilities.
   *
   * @param {string | number | undefined} input The input value to match.
   * @param {string | number | undefined} candidate The candidate value to compare against.
   * @param {GeminiAIContext} [context] Optional AI context for semantic matching.
   * @returns {Promise<FuzzyMatchResult | null>} A promise resolving to the best match result, or null if no confident match.
   */
  public async match(
    input: string | number | undefined,
    candidate: string | number | undefined,
    context?: GeminiAIContext,
  ): Promise<FuzzyMatchResult | null> {
    if (input === undefined || candidate === undefined) {
      fuzzyMatchLogger.warn('Input or candidate is undefined, cannot perform match.', { input, candidate });
      return null;
    }

    const stringInput = String(input);
    const stringCandidate = String(candidate);
    const allResults: FuzzyMatchResult[] = [];

    fuzzyMatchLogger.debug(`Starting match for "${stringInput}" vs "${stringCandidate}"`);

    // 1. Try numerical matching first if applicable
    if (this.config.numericalTolerance !== undefined && !isNaN(parseFloat(stringInput)) && !isNaN(parseFloat(stringCandidate))) {
      const numericalStrategy = this.strategies.get('NumericalTolerance');
      if (numericalStrategy) {
        const numResult = await numericalStrategy.match(stringInput, stringCandidate, this.config, context);
        if (numResult && numResult.isConfidentMatch) {
          fuzzyMatchLogger.info('Confident numerical match found, returning early.', { input, candidate, score: numResult.score });
          return numResult; // Prioritize exact numerical matches
        }
        if (numResult) allResults.push(numResult);
      }
    }

    // 2. Iterate through preferred string algorithms
    for (const algo of this.config.preferredAlgorithms) {
      const strategy = this.strategies.get(algo);
      if (strategy) {
        try {
          const result = await strategy.match(stringInput, stringCandidate, this.config, context);
          if (result) {
            allResults.push(result);
            if (result.isConfidentMatch && algo === MatchAlgorithm.EXACT) {
              fuzzyMatchLogger.info('Confident exact string match found, returning early.', { input, candidate, score: result.score });
              return result; // Prioritize exact string matches
            }
          }
        } catch (error) {
          fuzzyMatchLogger.error(`Error with strategy ${algo} for "${stringInput}" vs "${stringCandidate}": ${error instanceof Error ? error.message : String(error)}`, { error });
        }
      } else {
        fuzzyMatchLogger.warn(`Unknown or uninitialized strategy for algorithm: ${algo}`);
      }
    }

    // 3. Perform AI Semantic matching if enabled
    if (this.config.enableAISemanticMatching) {
      const semanticStrategy = this.strategies.get(MatchStrategyType.SEMANTIC_AI);
      if (semanticStrategy) {
        try {
          const semanticResult = await semanticStrategy.match(stringInput, stringCandidate, this.config, context);
          if (semanticResult) {
            // If semantic match and other matches exist, combine or prioritize
            // A sophisticated logic would combine scores, for now, we'll weigh it.
            const combinedScore = allResults.length > 0
              ? (allResults[0].score * (1 - this.config.semanticWeight)) + (semanticResult.score * this.config.semanticWeight)
              : semanticResult.score;

            // Update the semantic result with the combined score if it makes sense,
            // or just add it as a separate finding. For now, add as separate.
            allResults.push({
              ...semanticResult,
              score: combinedScore,
              algorithm: MatchStrategyType.HYBRID_SMART, // Indicate a hybrid result
              isConfidentMatch: combinedScore >= this.config.confidenceThreshold,
              details: {
                ...semanticResult.details,
                baseAlgorithmScore: semanticResult.score,
                combinedFrom: semanticResult.algorithm,
                semanticWeight: this.config.semanticWeight,
              },
            });
          }
        } catch (error) {
          fuzzyMatchLogger.error(`Error during semantic matching for "${stringInput}" vs "${stringCandidate}": ${error instanceof Error ? error.message : String(error)}`, { error });
        }
      }
    }

    // Determine the best result from all strategies
    const bestResult = allResults.reduce((best, current) => {
      // If we found an exact match earlier, it would have returned.
      // Now, we prioritize based on score and confidence.
      if (current.score > best.score) {
        return current;
      }
      return best;
    }, { score: -1 } as FuzzyMatchResult); // Initialize with a very low score

    if (bestResult.score >= this.config.confidenceThreshold) {
      fuzzyMatchLogger.info(`Best match found for "${stringInput}" vs "${stringCandidate}" with score: ${bestResult.score} (${bestResult.algorithm})`);
      return bestResult;
    } else if (this.config.returnAllMatches && bestResult.score >= (this.config.weakMatchThreshold || 0)) {
      fuzzyMatchLogger.debug(`Returning weak match for "${stringInput}" vs "${stringCandidate}" with score: ${bestResult.score} (${bestResult.algorithm}) as per config.`);
      return bestResult;
    }

    fuzzyMatchLogger.info(`No confident match found for "${stringInput}" vs "${stringCandidate}". Best score: ${bestResult.score}`);
    return null;
  }

  /**
   * Performs fuzzy matching of an input string against an array of candidate strings.
   * Returns a sorted list of potential matches.
   *
   * @param {string | number} input The input string or number to match.
   * @param {Array<string | number>} candidates An array of strings or numbers to compare against.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<FuzzyMatchResult[]>} A promise resolving to an array of sorted match results.
   */
  public async matchMany(
    input: string | number,
    candidates: Array<string | number>,
    context?: GeminiAIContext,
  ): Promise<FuzzyMatchResult[]> {
    fuzzyMatchLogger.info(`Matching "${input}" against ${candidates.length} candidates.`);
    const results: FuzzyMatchResult[] = [];

    // Pre-process candidates for AI recommendations if enabled
    if (this.config.enableAIContextualMatching && this.config.enableAISemanticMatching && candidates.length > 0) {
      try {
        const aiRecommendations = await this.geminiService.getAIRecommendedMatches(
          String(input),
          candidates.map(String),
          this.config,
          context
        );
        // Integrate AI recommendations. This could be complex, e.g., boosting scores
        // or adding new candidates. For now, we'll just add them to the pool.
        fuzzyMatchLogger.debug(`Received ${aiRecommendations.length} AI recommendations.`);
        aiRecommendations.forEach(rec => {
          // Prevent duplicates if a traditional algorithm would find the same match
          if (!results.some(r => r.candidate === rec.candidate && r.algorithm === rec.algorithm)) {
            results.push(rec);
          }
        });
      } catch (error) {
        fuzzyMatchLogger.error(`Error getting AI recommendations for "${input}": ${error instanceof Error ? error.message : String(error)}`, { error });
      }
    }

    const matchPromises = candidates.map(candidate => this.match(input, candidate, context));
    const individualMatches = await Promise.all(matchPromises);

    for (const matchResult of individualMatches) {
      if (matchResult) {
        // Only add if it's not a duplicate of an AI recommendation (for simplicity in this expansion)
        if (!results.some(r => r.candidate === matchResult.candidate && r.algorithm === matchResult.algorithm)) {
          results.push(matchResult);
        }
      }
    }

    // Filter and sort results
    const filteredResults = results.filter(
      result => (this.config.returnAllMatches && result.score >= (this.config.weakMatchThreshold || 0)) || result.isConfidentMatch
    );

    filteredResults.sort((a, b) => b.score - a.score);

    fuzzyMatchLogger.info(`Found ${filteredResults.length} matches for "${input}".`);
    return filteredResults.slice(0, this.config.maxResults);
  }

  /**
   * Finds the single best match for an input string from a list of candidates.
   * @param {string | number} input The input string or number.
   * @param {Array<string | number>} candidates The array of candidate strings or numbers.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<FuzzyMatchResult | null>} A promise resolving to the best match result, or null if no confident match.
   */
  public async findBestMatch(
    input: string | number,
    candidates: Array<string | number>,
    context?: GeminiAIContext,
  ): Promise<FuzzyMatchResult | null> {
    const allMatches = await this.matchMany(input, candidates, context);
    return allMatches.length > 0 ? allMatches[0] : null;
  }
}

// Global FuzzyMatcher instance for easy access
export const globalFuzzyMatcher = new FuzzyMatcher();

/**
 * @class AdvancedFuzzyMatchUtils
 * A static utility class providing high-level, advanced fuzzy matching operations.
 * This class orchestrates the `FuzzyMatcher` and `GeminiAIService` to provide
 * complex functionalities like deep semantic matching and suggestion generation.
 */
export class AdvancedFuzzyMatchUtils {
  private static matcher: FuzzyMatcher = globalFuzzyMatcher; // Use the global instance
  private static geminiService: GeminiAIService = globalGeminiAIService;

  /**
   * Allows external configuration of the internal FuzzyMatcher.
   * @param {Partial<FuzzyMatchConfig>} config The configuration object.
   */
  public static configure(config: Partial<FuzzyMatchConfig>): void {
    this.matcher.configure(config);
    fuzzyMatchLogger.info('AdvancedFuzzyMatchUtils configured.', { config });
  }

  /**
   * Performs a deep, multi-faceted semantic match for an input against candidates.
   * This involves both traditional string matching and AI-powered semantic analysis,
   * potentially blending scores or prioritizing AI results based on confidence.
   *
   * @param {string} input The input string.
   * @param {string[]} candidates The list of candidate strings.
   * @param {Partial<FuzzyMatchConfig>} [config] Optional override configuration for this specific call.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<FuzzyMatchResult[]>} A promise resolving to an array of ranked match results.
   */
  public static async performDeepSemanticMatch(
    input: string,
    candidates: string[],
    config?: Partial<FuzzyMatchConfig>,
    context?: GeminiAIContext,
  ): Promise<FuzzyMatchResult[]> {
    fuzzyMatchLogger.info(`Initiating deep semantic match for "${input}" against ${candidates.length} candidates.`);
    const currentConfig = { ...this.matcher.getConfig(), ...config };
    const results: FuzzyMatchResult[] = [];

    // Prioritize AI recommendations if enabled and meaningful
    if (currentConfig.enableAISemanticMatching) {
      try {
        const aiRecommendations = await this.geminiService.getAIRecommendedMatches(input, candidates, currentConfig, context);
        // Add AI recommendations directly. Duplicates will be handled by deduplication later if necessary.
        for (const rec of aiRecommendations) {
          results.push(rec);
        }
        fuzzyMatchLogger.debug(`Integrated ${aiRecommendations.length} AI-driven recommendations.`);
      } catch (error) {
        fuzzyMatchLogger.error(`Error during AI recommendation phase of deep match: ${error instanceof Error ? error.message : String(error)}`, { error });
      }
    }

    // Run standard fuzzy matching (which might also use AI internally based on config)
    const traditionalMatches = await this.matcher.matchMany(input, candidates, context);
    for (const match of traditionalMatches) {
      results.push(match);
    }
    fuzzyMatchLogger.debug(`Integrated ${traditionalMatches.length} traditional match results.`);


    // Consolidate and deduplicate results, favoring higher scores or specific algorithms if needed
    const consolidatedResultsMap = new Map<string, FuzzyMatchResult>(); // Key: candidate + algorithm type
    for (const result of results) {
      const key = `${result.candidate}::${result.algorithm}`;
      if (!consolidatedResultsMap.has(key) || result.score > consolidatedResultsMap.get(key)!.score) {
        consolidatedResultsMap.set(key, result);
      }
    }

    let finalResults = Array.from(consolidatedResultsMap.values())
      .filter(r => (currentConfig.returnAllMatches && r.score >= (currentConfig.weakMatchThreshold || 0)) || r.isConfidentMatch)
      .sort((a, b) => b.score - a.score);

    fuzzyMatchLogger.info(`Deep semantic match completed for "${input}". Final results count: ${finalResults.length}.`);
    return finalResults.slice(0, currentConfig.maxResults);
  }

  /**
   * Generates intelligent match suggestions for an input string based on a pool of candidates,
   * leveraging Gemini AI's natural language understanding and generative capabilities.
   * This could include corrected spellings, semantically similar but different phrases,
   * or alternative entities.
   *
   * @param {string} input The input string for which to generate suggestions.
   * @param {string[]} candidates A pool of candidate strings to draw suggestions from.
   * @param {Partial<FuzzyMatchConfig>} [config] Optional override configuration.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<string[]>} A promise resolving to an array of unique suggested strings.
   */
  public static async generateMatchSuggestions(
    input: string,
    candidates: string[],
    config?: Partial<FuzzyMatchConfig>,
    context?: GeminiAIContext,
  ): Promise<string[]> {
    fuzzyMatchLogger.info(`Generating match suggestions for "${input}".`);
    const currentConfig = { ...this.matcher.getConfig(), ...config };
    const suggestions = new Set<string>();

    if (!currentConfig.enableAISemanticMatching || !currentConfig.enableAIContextualMatching) {
      fuzzyMatchLogger.warn('AI features are disabled, returning basic suggestions.');
      // Fallback to basic suggestions if AI is off
      const normalizedInput = normalizeString(input);
      for (const candidate of candidates) {
        const normalizedCandidate = normalizeString(candidate);
        const distance = levenshteinDistance(normalizedInput, normalizedCandidate);
        const similarityScore = 1 - (distance / Math.max(normalizedInput.length, normalizedCandidate.length));
        if (similarityScore >= (currentConfig.weakMatchThreshold || 0.6)) {
          suggestions.add(candidate);
        }
      }
      return Array.from(suggestions).slice(0, currentConfig.maxResults);
    }

    try {
      // 1. Get AI-recommended direct matches (highest confidence)
      const aiMatches = await this.geminiService.getAIRecommendedMatches(input, candidates, currentConfig, context);
      aiMatches.forEach(match => suggestions.add(match.candidate));
      fuzzyMatchLogger.debug(`Added ${aiMatches.length} AI-recommended direct matches as suggestions.`);

      // 2. Simulate AI "completion" or "correction" based on input and context
      // In a real Gemini scenario, this would be a generative AI call:
      // const generatedSuggestions = await this.geminiService.generateText(`Given "${input}" and context ${JSON.stringify(context)}, suggest alternative or corrected terms from this list: ${candidates.join(', ')}.`, { task: 'suggestion' });
      // For simulation:
      fuzzyMatchLogger.debug(`Simulating generative AI for additional suggestions.`);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100)); // Simulate AI call latency

      const commonMisspellings: Record<string, string[]> = {
        'companie': ['company', 'companies'],
        'mgr': ['manager'],
        'dept': ['department'],
        'inc': ['incorporated'],
        'co': ['company'],
        'ltd': ['limited'],
        'systm': ['system'],
        'srvc': ['service'],
        'financl': ['financial'],
        'citi': ['citibank', 'citigroup'], // Example of domain specific suggestion
        'burevel': ['burvel', 'burwell'],
        'ocalaghan': ["o'callaghan", "o callaghan"],
      };

      const normalizedInputForSuggestion = normalizeString(input, false); // Keep some punctuation for context
      const words = normalizedInputForSuggestion.split(' ').filter(Boolean);

      for (const word of words) {
        const lowerWord = word.toLowerCase();
        if (commonMisspellings[lowerWord]) {
          commonMisspellings[lowerWord].forEach(suggestion => {
            // Only add if it makes sense in the context of one of the candidates
            if (candidates.some(c => c.toLowerCase().includes(suggestion.toLowerCase()))) {
              suggestions.add(input.replace(new RegExp(`\\b${word}\\b`, 'gi'), suggestion));
              suggestions.add(suggestion); // Add the word itself
            }
          });
        }
      }

      // 3. Add highly similar candidates found by traditional methods (if not already added by AI)
      const exactMatches = await this.matcher.matchMany(input, candidates, { ...context, customDirectives: 'strict-exact' });
      for (const match of exactMatches) {
        if (match.score >= 0.9 && !suggestions.has(match.candidate)) { // High threshold for "suggestions" from non-AI
          suggestions.add(match.candidate);
        }
      }

    } catch (error) {
      fuzzyMatchLogger.error(`Critical error generating AI suggestions for "${input}": ${error instanceof Error ? error.message : String(error)}`, { error });
    }

    // Limit and return unique suggestions
    return Array.from(suggestions).slice(0, currentConfig.maxResults);
  }

  /**
   * Validates the integrity of a fuzzy match result against the original input and configuration.
   * This is a post-processing step to ensure the match aligns with expected business rules or constraints.
   *
   * @param {FuzzyMatchResult} result The fuzzy match result to validate.
   * @param {string | number} originalInput The original input value, potentially before any normalization.
   * @param {Partial<FuzzyMatchConfig>} [config] Optional override configuration.
   * @param {GeminiAIContext} [context] Optional AI context.
   * @returns {Promise<boolean>} A promise resolving to true if the match is considered valid, false otherwise.
   */
  public static async validateMatchIntegrity(
    result: FuzzyMatchResult,
    originalInput: string | number,
    config?: Partial<FuzzyMatchConfig>,
    context?: GeminiAIContext,
  ): Promise<boolean> {
    fuzzyMatchLogger.info(`Validating integrity for match: "${result.input}" -> "${result.candidate}" (Score: ${result.score})`);
    const currentConfig = { ...this.matcher.getConfig(), ...config };

    // 1. Basic confidence check
    if (result.score < currentConfig.confidenceThreshold) {
      fuzzyMatchLogger.warn(`Match for "${result.input}" -> "${result.candidate}" failed confidence threshold (${result.score} < ${currentConfig.confidenceThreshold}).`);
      return false;
    }

    // 2. Data type consistency (example: if original input was a number, candidate should parse as one)
    if (typeof originalInput === 'number') {
      if (isNaN(parseFloat(result.candidate))) {
        fuzzyMatchLogger.warn(`Match for "${result.input}" -> "${result.candidate}" failed type consistency (expected number, got non-numeric candidate).`);
        return false;
      }
      // Re-run numerical tolerance check if applicable and not already the primary algorithm
      if (currentConfig.numericalTolerance !== undefined && result.algorithm !== 'NumericalTolerance') {
        const numInput = parseFloat(String(originalInput));
        const numCandidate = parseFloat(result.candidate);
        const absoluteDifference = Math.abs(numInput - numCandidate);
        const relativeTolerance = currentConfig.numericalTolerance * Math.max(Math.abs(numInput), Math.abs(numCandidate));
        if (absoluteDifference > relativeTolerance) {
          fuzzyMatchLogger.warn(`Match for "${result.input}" -> "${result.candidate}" failed numerical tolerance re-check.`);
          return false;
        }
      }
    }

    // 3. AI-driven context validation (simulated)
    if (currentConfig.enableAIContextualMatching && result.contextUsed) {
      fuzzyMatchLogger.debug(`Simulating AI context validation for match: "${result.input}" -> "${result.candidate}"`);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 20)); // Simulate AI latency

      // Example: Check if AI believes the match makes sense within the domain
      const inputIntent = await this.geminiService.analyzeTextForIntent(result.input, result.contextUsed);
      const candidateIntent = await this.geminiService.analyzeTextForIntent(result.candidate, result.contextUsed);

      const commonIntents = inputIntent.filter(intent => candidateIntent.includes(intent));
      if (commonIntents.length === 0 && inputIntent.length > 0) {
        fuzzyMatchLogger.warn(`AI context validation suggests no common intent between "${result.input}" and "${result.candidate}" for domain "${result.contextUsed.domain || 'N/A'}".`);
        // This could be a configurable soft or hard failure. For now, a soft one.
      }

      // Deeper contextual check (e.g., if matching "company name", ensure candidate is also a company name by AI's understanding)
      if (result.contextUsed.entityTypes?.includes('organization')) {
        // This would be a real AI call to determine entity types. For simulation:
        const isCandidateOrganization = result.candidate.toLowerCase().includes('inc') || result.candidate.toLowerCase().includes('ltd') || result.candidate.toLowerCase().includes('corporation');
        if (!isCandidateOrganization) {
          fuzzyMatchLogger.warn(`AI context validation: Expected organization, candidate "${result.candidate}" not recognized as one.`);
          // return false; // This would be a strong integrity check
        }
      }
    }

    // 4. Custom business rules (example: specific regex patterns for certain fields)
    if (context?.customDirectives?.includes('require_specific_prefix')) {
      if (!result.candidate.startsWith('ABC-')) { // Example rule
        fuzzyMatchLogger.warn(`Match for "${result.input}" -> "${result.candidate}" failed custom rule: requires 'ABC-' prefix.`);
        return false;
      }
    }

    fuzzyMatchLogger.info(`Match for "${result.input}" -> "${result.candidate}" passed integrity validation.`);
    return true;
  }
}