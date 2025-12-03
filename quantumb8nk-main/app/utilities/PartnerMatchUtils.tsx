// This file contains utilities for advanced partner matching and recommendation.
// It leverages AI-powered analysis for enhanced data enrichment and intelligent decision-making.

import { camelCase } from "lodash";
import { ANSWER_OPTIONS_MAPPING } from "../../partner_search/constants/PartnerSearchConstants";
import {
  OnboardingAnswer__QuestionKeyEnum,
  PartnerSearchDetailViewQuery,
} from "../../generated/dashboard/graphqlSchema";

// --- Global Constants and Configuration ---

/**
 * Defines various levels of matching confidence.
 */
export enum MatchConfidence {
  VeryLow = "VERY_LOW",
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  VeryHigh = "VERY_HIGH",
}

/**
 * Defines categories for AI-driven sentiment analysis.
 */
export enum AISentimentCategory {
  Positive = "POSITIVE",
  Neutral = "NEUTRAL",
  Negative = "NEGATIVE",
  Mixed = "MIXED",
  Undefined = "UNDEFINED",
}

/**
 * Configuration for the partner matching process, including AI model parameters.
 */
export interface PartnerMatchConfig {
  aiModelVersion: string;
  sentimentAnalysisThresholds: {
    positive: number;
    negative: number;
  };
  keywordMatchWeight: number;
  semanticMatchWeight: number; // For future semantic search implementation
  partnerSizeWeight: number;
  locationProximityThresholdKm: number;
  enableAISuggestions: boolean;
  cacheDurationMinutes: number;
  logLevel: "debug" | "info" | "warn" | "error";
}

export const DEFAULT_PARTNER_MATCH_CONFIG: PartnerMatchConfig = {
  aiModelVersion: "gemini-pro-v1",
  sentimentAnalysisThresholds: {
    positive: 0.6,
    negative: -0.4,
  },
  keywordMatchWeight: 0.3,
  semanticMatchWeight: 0.5,
  partnerSizeWeight: 0.2,
  locationProximityThresholdKm: 100,
  enableAISuggestions: true,
  cacheDurationMinutes: 60,
  logLevel: "info",
};

// --- Custom Error Definitions ---

/**
 * Base error class for all partner matching related exceptions.
 */
export class PartnerMatchError extends Error {
  constructor(message: string, public code: string = "GENERIC_MATCH_ERROR") {
    super(message);
    this.name = "PartnerMatchError";
  }
}

/**
 * Error class specifically for issues encountered during AI service integration.
 */
export class AIIntegrationError extends PartnerMatchError {
  constructor(message: string, public aiService: string) {
    super(`AI Service (${aiService}) Error: ${message}`, "AI_SERVICE_ERROR");
    this.name = "AIIntegrationError";
  }
}

// --- Enhanced Data Models ---

type Answer = NonNullable<
  PartnerSearchDetailViewQuery["partnerSearch"]
>["answers"][0];

type Answers = NonNullable<
  PartnerSearchDetailViewQuery["partnerSearch"]
>["answers"];

/**
 * Represents a refined user profile extracted from their onboarding answers.
 * This structure is optimized for matching and AI processing.
 */
export interface UserProfile {
  id: string; // Unique ID for the user
  searchIntent: string; // Summarized intent from answers, potentially AI-generated
  preferredPartnerCharacteristics: {
    industry?: string[];
    size?: "Small" | "Medium" | "Large" | "Enterprise" | "Any";
    location?: { latitude: number; longitude: number; radiusKm: number };
    technologies?: string[];
    useCases?: string[];
    budgetRange?: { min: number; max: number };
    // Potentially more detailed fields derived from AI, e.g., tone preference
    communicationStyle?: string;
  };
  rawAnswers: Answers;
  aiAnalysis?: {
    overallSentiment: AISentimentCategory;
    keywords: string[];
    suggestedTags: string[]; // AI-suggested categories or themes from user input
    latentInterestVectors?: number[]; // Placeholder for semantic embeddings
  };
}

/**
 * Represents a detailed partner profile, potentially enriched by AI.
 */
export interface PartnerProfile {
  id: string; // Unique ID for the partner
  name: string;
  description: string;
  industry: string[];
  size: "Small" | "Medium" | "Large" | "Enterprise" | "Unknown";
  location: { latitude: number; longitude: number; address: string };
  technologies: string[];
  useCases: string[];
  engagementModels: string[]; // e.g., "SaaS", "Consulting", "Hybrid"
  integrationCapabilities: string[]; // e.g., "API", "Webhook", "Direct Transmission"
  aiEnrichment?: {
    sentimentSummary: {
      score: number;
      category: AISentimentCategory;
      magnitude: number;
    };
    extractedKeywords: string[];
    semanticEmbeddings: number[]; // Vector representation for semantic search
    suggestedUseCases: string[]; // AI-derived use cases
    compatibilityScorePrediction?: number; // AI-predicted score with a generic user model
  };
}

/**
 * Represents the detailed score of a match between a user and a partner.
 */
export interface PartnerMatchScoreDetail {
  partnerId: string;
  totalScore: number; // Normalized score, e.g., 0-100
  confidence: MatchConfidence;
  breakdown: {
    keywordMatchScore: number;
    semanticMatchScore: number;
    industryOverlapScore: number;
    sizeMatchScore: number;
    locationProximityScore: number;
    technologyStackOverlapScore: number;
    useCaseCompatibilityScore: number;
    // Potentially more AI-driven scores
    aiSentimentCompatibilityScore: number;
    budgetAlignmentScore: number;
  };
  explanation: string[]; // Human-readable reasons for the score
}

/**
 * Represents a single recommended partner with their match details.
 */
export interface RecommendedPartner {
  profile: PartnerProfile;
  matchDetails: PartnerMatchScoreDetail;
  rank: number;
  aiInsights?: string; // AI-generated insights specific to this recommendation
  nextInteractionSuggestion?: string; // AI-suggested next steps for user
}

// --- Utility Classes and Services ---

/**
 * A sophisticated logger utility for professional debugging, monitoring, and auditing.
 * It supports different log levels and can be dynamically configured.
 */
export class Logger {
  private static instance: Logger;
  private logLevel: PartnerMatchConfig["logLevel"];
  private readonly timestampFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });

  private constructor(logLevel: PartnerMatchConfig["logLevel"]) {
    this.logLevel = logLevel;
  }

  public static getInstance(logLevel?: PartnerMatchConfig["logLevel"]): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logLevel || DEFAULT_PARTNER_MATCH_CONFIG.logLevel);
    } else if (logLevel && Logger.instance.logLevel !== logLevel) {
      Logger.instance.logLevel = logLevel; // Allow dynamic level changes
    }
    return Logger.instance;
  }

  private shouldLog(level: PartnerMatchConfig["logLevel"]): boolean {
    const levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[this.logLevel] <= levels[level];
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = this.timestampFormatter.format(new Date());
    return `[${timestamp}][${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog("debug")) console.debug(this.formatMessage("debug", message), ...args);
  }
  info(message: string, ...args: any[]) {
    if (this.shouldLog("info")) console.info(this.formatMessage("info", message), ...args);
  }
  warn(message: string, error?: Error, ...args: any[]) {
    if (this.shouldLog("warn")) console.warn(this.formatMessage("warn", message), error, ...args);
  }
  error(message: string, error?: Error, ...args: any[]) {
    if (this.shouldLog("error")) console.error(this.formatMessage("error", message), error, ...args);
  }
}

export const logger = Logger.getInstance();

/**
 * A robust and performant caching mechanism for frequently accessed data to minimize redundant computations
 * and API calls, thereby improving overall system efficiency. Supports time-based expiry and periodic cleanup.
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { value: any; expiry: number; lastAccess: number }>();
  private readonly defaultExpiryMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly cleanupFrequencyMs = 5 * 60 * 1000; // Run cleanup every 5 minutes

  private constructor(defaultExpiryMinutes: number) {
    this.defaultExpiryMs = defaultExpiryMinutes * 60 * 1000;
    this.startCleanupInterval();
    logger.info(`CacheManager initialized with default expiry: ${defaultExpiryMinutes} minutes.`);
  }

  public static getInstance(defaultExpiryMinutes?: number): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(defaultExpiryMinutes || DEFAULT_PARTNER_MATCH_CONFIG.cacheDurationMinutes);
    } else if (defaultExpiryMinutes && CacheManager.instance.defaultExpiryMs !== defaultExpiryMinutes * 60 * 1000) {
      // Allow re-configuration of default expiry if necessary
      (CacheManager.instance as any).defaultExpiryMs = defaultExpiryMinutes * 60 * 1000;
      logger.info(`CacheManager default expiry updated to ${defaultExpiryMinutes} minutes.`);
      CacheManager.instance.startCleanupInterval(); // Restart cleanup with new frequency if needed
    }
    return CacheManager.instance;
  }

  private startCleanupInterval() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cleanupInterval = setInterval(() => this.cleanupExpiredEntries(), this.cleanupFrequencyMs);
    logger.debug(`Cache cleanup interval started with ${this.cleanupFrequencyMs / 1000}s frequency.`);
  }

  private cleanupExpiredEntries() {
    const now = Date.now();
    let cleanedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} expired cache entries.`);
    }
  }

  /**
   * Stores data in the cache.
   * @param key The cache key.
   * @param value The data to store.
   * @param expiryMs Optional custom expiry in milliseconds. Defaults to configured expiry.
   */
  public set<T>(key: string, value: T, expiryMs?: number): void {
    const actualExpiry = expiryMs !== undefined ? expiryMs : this.defaultExpiryMs;
    const now = Date.now();
    this.cache.set(key, { value, expiry: now + actualExpiry, lastAccess: now });
    logger.debug(`Cache set for key: ${key}, expires in ${actualExpiry / 1000}s.`);
  }

  /**
   * Retrieves data from the cache. Updates last access time upon hit.
   * @param key The cache key.
   * @returns The cached data or undefined if not found or expired.
   */
  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry && entry.expiry > Date.now()) {
      entry.lastAccess = Date.now(); // Update last access time for potential LRU strategies
      logger.debug(`Cache hit for key: ${key}.`);
      return entry.value as T;
    }
    if (entry) {
      this.cache.delete(key); // Remove expired entry
      logger.debug(`Cache miss for key: ${key} (expired).`);
    } else {
      logger.debug(`Cache miss for key: ${key} (not found).`);
    }
    return undefined;
  }

  /**
   * Checks if a key exists in the cache and is not expired.
   * @param key The cache key.
   * @returns True if the key is validly cached, false otherwise.
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key);
    return !!entry && entry.expiry > Date.now();
  }

  /**
   * Invalidates a specific cache entry, forcing a refresh on next access.
   * @param key The cache key to invalidate.
   */
  public invalidate(key: string): void {
    if (this.cache.delete(key)) {
      logger.debug(`Cache invalidated for key: ${key}.`);
    } else {
      logger.debug(`Attempted to invalidate non-existent cache key: ${key}.`);
    }
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
    logger.info("Entire cache cleared.");
  }
}

export const cacheManager = CacheManager.getInstance();

/**
 * Mock client for Gemini AI services. This class encapsulates all interactions with a
 * hypothetical Gemini AI API, providing methods for sentiment analysis, keyword extraction,
 * semantic search, summarization, and action suggestions. It's designed to be
 * plug-and-play with a real AI service backend.
 */
export class GeminiAIClient {
  private static instance: GeminiAIClient;
  private config: PartnerMatchConfig;

  private constructor(config: PartnerMatchConfig) {
    this.config = config;
    logger.info(`GeminiAIClient initialized with model: ${config.aiModelVersion}`);
  }

  public static getInstance(config?: PartnerMatchConfig): GeminiAIClient {
    if (!GeminiAIClient.instance) {
      GeminiAIClient.instance = new GeminiAIClient(config || DEFAULT_PARTNER_MATCH_CONFIG);
    } else if (config) {
      GeminiAIClient.instance.config = config; // Allow dynamic config updates
      logger.debug(`GeminiAIClient config updated to model: ${config.aiModelVersion}`);
    }
    return GeminiAIClient.instance;
  }

  /**
   * Normalizes text input for AI processing (e.g., lowercasing, removing extra spaces).
   * @param text The input text.
   * @returns The normalized text.
   */
  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Analyzes text for sentiment using a hypothetical Gemini AI model.
   * @param text The text to analyze.
   * @returns Sentiment analysis result.
   */
  public async analyzeSentiment(
    text: string,
  ): Promise<{ score: number; magnitude: number; category: AISentimentCategory }> {
    const normalizedText = this.normalizeText(text);
    const cacheKey = `ai_sentiment_${normalizedText}`;
    let cachedResult = cacheManager.get<{ score: number; magnitude: number; category: AISentimentCategory }>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    logger.debug(`GeminiAI: Analyzing sentiment for text: "${normalizedText.substring(0, 70)}..."`);
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100)); // Simulate API call delay

      if (!normalizedText || normalizedText.length < 5) {
        cachedResult = { score: 0, magnitude: 0, category: AISentimentCategory.Undefined };
        cacheManager.set(cacheKey, cachedResult);
        return cachedResult;
      }

      let score: number;
      let magnitude: number;

      // Simple heuristic for demo purposes, representing a complex AI model
      const positiveWords = ["great", "excellent", "good", "efficient", "happy", "powerful", "innovative", "seamless", "growth", "opportunity", "success", "advanced", "robust"];
      const negativeWords = ["bad", "poor", "slow", "difficult", "problem", "issue", "struggle", "challenging", "risk", "loss", "inefficient", "complex", "outdated"];

      let posCount = 0;
      let negCount = 0;

      positiveWords.forEach((word) => {
        if (normalizedText.includes(word)) posCount++;
      });
      negativeWords.forEach((word) => {
        if (normalizedText.includes(word)) negCount++;
      });

      if (posCount > negCount) {
        score = Math.min(0.5 + posCount * 0.1 - negCount * 0.05, 0.95);
      } else if (negCount > posCount) {
        score = Math.max(-0.5 - negCount * 0.1 + posCount * 0.05, -0.95);
      } else {
        score = 0; // Neutral
      }

      // Magnitude reflects the strength of emotion, often related to the number of emotional words
      magnitude = Math.min((posCount + negCount + normalizedText.length / 100) / 10, 1.0);
      magnitude = Math.max(magnitude, Math.abs(score)); // Magnitude should at least be absolute score

      let category: AISentimentCategory;
      if (score >= this.config.sentimentAnalysisThresholds.positive) {
        category = AISentimentCategory.Positive;
      } else if (score <= this.config.sentimentAnalysisThresholds.negative) {
        category = AISentimentCategory.Negative;
      } else {
        category = AISentimentCategory.Neutral;
      }
      if (posCount > 0 && negCount > 0 && Math.abs(posCount - negCount) < 2) {
        category = AISentimentCategory.Mixed; // Override if both positive and negative elements are present
      }

      cachedResult = { score, magnitude, category };
      cacheManager.set(cacheKey, cachedResult);
      logger.debug(`GeminiAI: Sentiment result: Score=${score.toFixed(2)}, Magnitude=${magnitude.toFixed(2)}, Category=${category}`);
      return cachedResult;
    } catch (error: any) {
      logger.error("Error analyzing sentiment with Gemini AI", error);
      throw new AIIntegrationError(`Failed to analyze sentiment: ${error.message}`, "GeminiAI_Sentiment");
    }
  }

  /**
   * Extracts key terms and phrases from a given text, providing core thematic elements.
   * @param text The text to process.
   * @returns An array of extracted keywords.
   */
  public async extractKeywords(text: string): Promise<string[]> {
    const normalizedText = this.normalizeText(text);
    const cacheKey = `ai_keywords_${normalizedText}`;
    let cachedResult = cacheManager.get<string[]>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    logger.debug(`GeminiAI: Extracting keywords for text: "${normalizedText.substring(0, 70)}..."`);
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 50)); // Simulate latency
      if (!normalizedText || normalizedText.length < 10) {
        cachedResult = [];
        cacheManager.set(cacheKey, cachedResult);
        return cachedResult;
      }

      const commonWords = new Set(["a", "an", "the", "is", "are", "and", "or", "of", "in", "for", "with", "to", "from", "on", "it", "we", "our", "us", "be", "can", "will", "this", "that", "which", "by", "as", "at", "but", "not", "no", "also", "has", "have", "had", "would", "should", "could"]);
      const words = normalizedText.split(/\W+/).filter(word => word.length > 2 && !commonWords.has(word));

      const wordCounts = new Map<string, number>();
      words.forEach(word => wordCounts.set(word, (wordCounts.get(word) || 0) + 1));

      // Filter out words that appear only once, then sort by frequency
      const filteredAndSortedKeywords = Array.from(wordCounts.entries())
        .filter(([, count]) => count > 1 || words.length < 10) // Include single occurrences for short texts
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 7) // Top N keywords
        .map(([word]) => word);

      cachedResult = filteredAndSortedKeywords;
      cacheManager.set(cacheKey, cachedResult);
      logger.debug(`GeminiAI: Extracted keywords: ${filteredAndSortedKeywords.join(", ")}`);
      return filteredAndSortedKeywords;
    } catch (error: any) {
      logger.error("Error extracting keywords with Gemini AI", error);
      throw new AIIntegrationError(`Failed to extract keywords: ${error.message}`, "GeminiAI_Keywords");
    }
  }

  /**
   * Performs semantic search to find items semantically similar to a query.
   * This would typically involve generating vector embeddings for the query and documents,
   * then calculating cosine similarity to find the most relevant matches.
   * For this mock, it simulates relevance based on keyword overlap.
   * @param query The search query or text to match.
   * @param documents An array of texts (e.g., partner descriptions) to search within.
   * @returns A list of indices of matching documents, sorted by similarity score (highest first).
   */
  public async semanticSearch(query: string, documents: string[]): Promise<{ index: number; score: number }[]> {
    const normalizedQuery = this.normalizeText(query);
    // In a real scenario, cache would store embedding vectors for documents, not text.
    // For this mock, we'll cache the keyword results.
    const cacheKey = `ai_semantic_search_${normalizedQuery}_${documents.length}`; // Simplified cache key

    // This cache is problematic for dynamic documents;
    // a real semantic search would cache document embeddings and re-compute similarity.
    // For now, we'll skip caching for semantic search results due to dynamic document sets.

    logger.debug(`GeminiAI: Performing semantic search for query: "${normalizedQuery.substring(0, 70)}..."`);
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 200)); // Simulate latency

      if (!normalizedQuery || documents.length === 0) return [];

      const queryKeywords = new Set(await this.extractKeywords(normalizedQuery));
      const documentScores: { index: number; score: number }[] = [];

      // Simulate semantic similarity by extended keyword overlap and text length match
      for (let i = 0; i < documents.length; i++) {
        const docText = this.normalizeText(documents[i]);
        const docKeywords = new Set(await this.extractKeywords(docText));
        let overlapScore = 0;
        queryKeywords.forEach(qKey => {
          if (docKeywords.has(qKey)) {
            overlapScore += 1;
          }
          if (docText.includes(qKey)) { // Broader text match
            overlapScore += 0.5;
          }
        });
        // Add a small bonus for longer, more descriptive documents if they match
        const lengthBonus = Math.min(docText.length / normalizedQuery.length / 10, 1.0);
        const finalScore = overlapScore + lengthBonus;
        if (finalScore > 0) { // Only add if there's some resemblance
          documentScores.push({ index: i, score: finalScore });
        }
      }

      const sortedResults = documentScores
        .sort((a, b) => b.score - a.score);

      logger.debug(`GeminiAI: Semantic search found ${sortedResults.length} relevant documents.`);
      return sortedResults;
    } catch (error: any) {
      logger.error("Error during semantic search with Gemini AI", error);
      throw new AIIntegrationError(`Failed semantic search: ${error.message}`, "GeminiAI_SemanticSearch");
    }
  }

  /**
   * Generates a concise summary for a given long text, preserving key information.
   * @param text The long text to summarize.
   * @param maxLength Optional maximum length of the summary.
   * @returns A summarized string.
   */
  public async generateSummary(text: string, maxLength: number = 150): Promise<string> {
    const normalizedText = text.trim(); // Summaries shouldn't be lowercased initially
    const cacheKey = `ai_summary_${normalizedText.substring(0, 100)}_${maxLength}`;
    let cachedResult = cacheManager.get<string>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    logger.debug(`GeminiAI: Generating summary for text: "${normalizedText.substring(0, 70)}..." (Max length: ${maxLength})`);
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 600 + 150));
      if (!normalizedText || normalizedText.length <= maxLength) {
        cachedResult = normalizedText;
        cacheManager.set(cacheKey, cachedResult);
        return cachedResult;
      }

      // Simple summarization for demo: find key sentences or truncate intelligently
      const sentences = normalizedText.split(/(?<=[.!?])\s+/);
      let summary = "";
      for (const sentence of sentences) {
        if ((summary + sentence).length <= maxLength - 3) { // -3 for ellipsis
          summary += sentence + " ";
        } else {
          break;
        }
      }
      summary = summary.trim();
      if (summary.length < normalizedText.length) {
        summary += "...";
      }

      cachedResult = summary;
      cacheManager.set(cacheKey, cachedResult);
      logger.debug(`GeminiAI: Generated summary: "${summary}"`);
      return summary;
    } catch (error: any) {
      logger.error("Error generating summary with Gemini AI", error);
      throw new AIIntegrationError(`Failed to generate summary: ${error.message}`, "GeminiAI_Summary");
    }
  }

  /**
   * Suggests next best actions or questions based on current data (e.g., user profile, current search state).
   * This can guide users or internal processes.
   * @param currentContext Data representing the current state or user input.
   * @returns An array of suggested strings.
   */
  public async suggestNextActions(currentContext: any): Promise<string[]> {
    const contextString = JSON.stringify(currentContext).substring(0, 200); // Simplified context for caching
    const cacheKey = `ai_suggestions_${contextString}`;
    let cachedResult = cacheManager.get<string[]>(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    logger.debug(`GeminiAI: Suggesting next actions based on context: "${contextString}..."`);
    try {
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 300 + 100));
      const suggestions: string[] = [];

      // Example heuristic rules based on the shape of currentContext
      if (currentContext.userProfile && !currentContext.userProfile.preferredPartnerCharacteristics?.budgetRange) {
        suggestions.push("Clarify your budget expectations for partner services.");
      }
      if (currentContext.userProfile && !currentContext.userProfile.preferredPartnerCharacteristics?.location) {
        suggestions.push("Specify your preferred geographic location for partners.");
      }
      if (currentContext.partnerProfile && currentContext.matchScore && currentContext.matchScore.totalScore < 50) {
        suggestions.push(`Consider alternatives to ${currentContext.partnerProfile.name} or refine your criteria.`);
      }
      if (currentContext.rawAnswers && currentContext.rawAnswers.length < 5) {
        suggestions.push("Add more details about your needs to improve match accuracy.");
      }
      if (suggestions.length === 0) {
        suggestions.push("Explore advanced filters.", "Review your current selections.", "Contact support for a personalized consultation.");
      }

      cachedResult = suggestions;
      cacheManager.set(cacheKey, cachedResult);
      logger.debug(`GeminiAI: Suggested actions: ${suggestions.join(" | ")}`);
      return suggestions;
    } catch (error: any) {
      logger.error("Error suggesting next actions with Gemini AI", error);
      throw new AIIntegrationError(`Failed to suggest actions: ${error.message}`, "GeminiAI_Suggestions");
    }
  }
}

export const geminiAI = GeminiAIClient.getInstance();

// --- Core Partner Matching Utilities ---

/**
 * Filters out irrelevant or incomplete answers from a list of user responses.
 * Ensures that 'directTransmissionEnabled' answers are valid only if a partner name is present.
 * @param answers The raw list of answers from a user's partner search.
 * @returns A filtered list of answers.
 */
export function filterAnswers(answers: Answers): Answers {
  logger.debug(`Filtering ${answers.length} answers...`);
  const filtered = answers.filter(
    (answer) =>
      answer.questionKey !== OnboardingAnswer__QuestionKeyEnum.BeginSearch &&
      answer.answerValue &&
      (answer.questionKey !== "directTransmissionEnabled" ||
        answer.partnerMatch?.partner?.name ||
        answer.partnerMatch?.userReportedPartnerName),
  );
  logger.debug(`Filtered down to ${filtered.length} relevant answers.`);
  return filtered;
}

/**
 * Modifies and standardizes answer text and values for display or further processing.
 * Applies camelCase to question keys and maps answer values to their display labels where appropriate.
 * Enriches 'directTransmissionEnabled' questions with the partner's name.
 * @param answer A single answer object.
 * @returns The modified answer object.
 */
export function modifyAnswer(answer: Answer): Answer {
  logger.debug(`Modifying answer for questionKey: ${answer.questionKey}`);
  const {
    questionText: originalQuestionText,
    questionKey: originalQuestionKey,
    answerValue,
    partnerMatch,
  } = answer;

  const questionKey = camelCase(originalQuestionKey);

  let modifiedQuestionText: string = originalQuestionText;
  if (partnerMatch && questionKey === "directTransmissionEnabled") {
    const { partner, userReportedPartnerName } = partnerMatch;
    const partnerName = partner?.name || userReportedPartnerName || "Unnamed Partner";
    modifiedQuestionText = `${partnerName}: ${originalQuestionText}`;
    logger.debug(`Modified question text for directTransmissionEnabled: ${modifiedQuestionText}`);
  }

  let modifiedAnswerValue: string = typeof answerValue === 'string' ? answerValue : JSON.stringify(answerValue);
  if (questionKey in ANSWER_OPTIONS_MAPPING) {
    modifiedAnswerValue =
      ANSWER_OPTIONS_MAPPING[questionKey].find(
        (obj) => obj.value === answerValue,
      )?.label || modifiedAnswerValue; // Fallback to original value if label not found
    logger.debug(`Mapped answer value for ${questionKey}: ${modifiedAnswerValue}`);
  }

  return {
    ...answer,
    questionText: modifiedQuestionText,
    answerValue: modifiedAnswerValue,
  };
}

/**
 * Extracts and consolidates a comprehensive UserProfile from raw answers, optionally using AI.
 * This function processes raw user input to create a structured profile suitable for advanced matching.
 * @param rawAnswers The raw list of answers provided by the user.
 * @param userId Unique identifier for the user.
 * @param config PartnerMatchConfig for AI parameters.
 * @returns A structured UserProfile object.
 */
export async function extractUserProfile(
  rawAnswers: Answers,
  userId: string,
  config: PartnerMatchConfig = DEFAULT_PARTNER_MATCH_CONFIG,
): Promise<UserProfile> {
  logger.info(`Extracting user profile for user: ${userId}`);
  const filtered = filterAnswers(rawAnswers);
  const userProfile: UserProfile = {
    id: userId,
    searchIntent: "General Partner Search", // Default intent, will be refined by AI
    preferredPartnerCharacteristics: {
      size: "Any"
    },
    rawAnswers: filtered,
  };

  const allAnswerTexts: string[] = [];

  for (const answer of filtered) {
    const modified = modifyAnswer(answer);
    allAnswerTexts.push(`${modified.questionText}: ${modified.answerValue}`);

    // Populate preferred characteristics based on question keys
    switch (camelCase(modified.questionKey)) {
      case "preferredIndustry":
        if (modified.answerValue)
          userProfile.preferredPartnerCharacteristics.industry = Array.isArray(modified.answerValue)
            ? (modified.answerValue as string[])
            : [modified.answerValue];
        break;
      case "partnerSizePreference":
        if (modified.answerValue)
          userProfile.preferredPartnerCharacteristics.size = modified.answerValue as "Small" | "Medium" | "Large" | "Enterprise" | "Any";
        break;
      case "targetLocation":
        // Assuming answerValue format like "latitude,longitude,radiusKm"
        if (typeof modified.answerValue === 'string' && modified.answerValue.includes(',')) {
          const parts = modified.answerValue.split(',').map(Number);
          if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
            userProfile.preferredPartnerCharacteristics.location = { latitude: parts[0], longitude: parts[1], radiusKm: parts[2] };
          } else {
            logger.warn(`Invalid location format for answer: ${modified.answerValue}`);
          }
        }
        break;
      case "requiredTechnologies":
        if (modified.answerValue)
          userProfile.preferredPartnerCharacteristics.technologies = Array.isArray(modified.answerValue)
            ? (modified.answerValue as string[])
            : [modified.answerValue];
        break;
      case "primaryUseCases":
        if (modified.answerValue)
          userProfile.preferredPartnerCharacteristics.useCases = Array.isArray(modified.answerValue)
            ? (modified.answerValue as string[])
            : [modified.answerValue];
        break;
      case "budgetRange":
        if (typeof modified.answerValue === 'string' && modified.answerValue.includes('-')) {
          const [minStr, maxStr] = modified.answerValue.split('-');
          const min = parseFloat(minStr.replace(/[^0-9.]/g, ''));
          const max = parseFloat(maxStr.replace(/[^0-9.]/g, ''));
          if (!isNaN(min) && !isNaN(max)) {
            userProfile.preferredPartnerCharacteristics.budgetRange = { min, max };
          } else {
            logger.warn(`Invalid budget range format for answer: ${modified.answerValue}`);
          }
        }
        break;
      // Future expansion: Add more cases for communication style, risk tolerance, etc.
    }
  }

  // AI enrichment for user profile
  if (config.enableAISuggestions) {
    logger.debug("Enriching user profile with Gemini AI analysis...");
    const combinedText = allAnswerTexts.join(". ");
    try {
      const cacheKeySentiment = `user_sentiment_${userId}_${combinedText.length}`;
      const cacheKeyKeywords = `user_keywords_${userId}_${combinedText.length}`;
      const cacheKeyIntent = `user_intent_summary_${userId}_${combinedText.length}`;

      let sentimentAnalysis = cacheManager.get<{ score: number; magnitude: number; category: AISentimentCategory }>(cacheKeySentiment);
      if (!sentimentAnalysis) {
        sentimentAnalysis = await geminiAI.analyzeSentiment(combinedText);
        cacheManager.set(cacheKeySentiment, sentimentAnalysis);
      }

      let keywords = cacheManager.get<string[]>(cacheKeyKeywords);
      if (!keywords) {
        keywords = await geminiAI.extractKeywords(combinedText);
        cacheManager.set(cacheKeyKeywords, keywords);
      }

      let searchIntent = cacheManager.get<string>(cacheKeyIntent);
      if (!searchIntent) {
        searchIntent = await geminiAI.generateSummary(combinedText, 80);
        cacheManager.set(cacheKeyIntent, searchIntent);
      }
      userProfile.searchIntent = searchIntent;

      userProfile.aiAnalysis = {
        overallSentiment: sentimentAnalysis.category,
        keywords: keywords,
        suggestedTags: await geminiAI.suggestNextActions(userProfile), // Using suggestNextActions as a proxy for tags/guidance
      };
      logger.debug("User profile AI analysis complete.");
    } catch (error) {
      logger.error(`Failed AI enrichment for user profile ${userId}:`, error);
      // Continue without AI data if error occurs, log it but don't halt
    }
  }

  return userProfile;
}

/**
 * Simulates fetching and optionally enriching a list of PartnerProfiles from a data source.
 * In a real application, this would query a dedicated partner database or external API,
 * potentially with pagination and robust error handling.
 * @param partnerIds Optional array of specific partner IDs to fetch. If empty, fetches all available.
 * @param config PartnerMatchConfig for AI parameters.
 * @returns A promise resolving to an array of PartnerProfile objects.
 */
export async function fetchAndEnrichPartnerProfiles(
  partnerIds: string[] = [],
  config: PartnerMatchConfig = DEFAULT_PARTNER_MATCH_CONFIG,
): Promise<PartnerProfile[]> {
  logger.info(`Fetching and enriching partner profiles for ${partnerIds.length > 0 ? partnerIds.join(', ') : 'all available partners'}.`);
  // Mock data for demonstration purposes. This would come from a real data source.
  const mockPartners: PartnerProfile[] = [
    {
      id: "partner1",
      name: "Innovate Solutions Inc.",
      description: "Leading provider of cloud-native AI solutions for enterprise clients. Specialists in FinTech, Healthcare, and advanced data analytics. Committed to sustainable and ethical AI practices.",
      industry: ["Financial Services", "Healthcare", "Technology"],
      size: "Large",
      location: { latitude: 34.0522, longitude: -118.2437, address: "Los Angeles, CA" },
      technologies: ["TensorFlow", "Kubernetes", "AWS Lambda", "Python", "React", "Spark"],
      useCases: ["Fraud Detection", "Predictive Analytics", "Personalized Customer Experience", "Operations Optimization"],
      engagementModels: ["SaaS", "Consulting", "Managed Services"],
      integrationCapabilities: ["API", "Webhook", "Custom Integrations"],
    },
    {
      id: "partner2",
      name: "Global Data Dynamics",
      description: "Expert in secure data management and advanced analytics for highly regulated industries. Our focus is on stringent compliance, data governance, and real-time intelligence for government and legal sectors.",
      industry: ["Government", "Legal", "Cybersecurity", "Public Sector"],
      size: "Medium",
      location: { latitude: 38.9072, longitude: -77.0369, address: "Washington, D.C." },
      technologies: ["Apache Kafka", "Azure Synapse", "Java", "Blockchain", "Splunk", "Hadoop"],
      useCases: ["Data Governance", "Real-time Reporting", "Threat Intelligence", "Regulatory Compliance"],
      engagementModels: ["Consulting", "Project-based"],
      integrationCapabilities: ["Direct Transmission", "Secure File Transfer", "API"],
    },
    {
      id: "partner3",
      name: "NextGen Software Co.",
      description: "Agile development house specializing in custom software for small to medium businesses. We pride ourselves on rapid prototyping, user-centric design, and delivering innovative solutions in retail and e-commerce.",
      industry: ["Software Development", "Retail", "E-commerce", "Startups"],
      size: "Small",
      location: { latitude: 40.7128, longitude: -74.0060, address: "New York, NY" },
      technologies: ["Node.js", "React", "MongoDB", "GCP", "Vue.js", "GraphQL"],
      useCases: ["Mobile App Development", "Website Relaunch", "CRM Integration", "Custom Web Applications"],
      engagementModels: ["Hybrid", "Fixed-price Projects"],
      integrationCapabilities: ["API", "SDKs"],
    },
    {
      id: "partner4",
      name: "Quantum Leap AI",
      description: "Cutting-edge research and development firm focused on quantum computing applications, advanced AI algorithms, and high-performance computing solutions for complex scientific and defense challenges.",
      industry: ["Research & Development", "High Tech", "Defense", "Aerospace"],
      size: "Enterprise",
      location: { latitude: 37.3875, longitude: -122.0575, address: "Mountain View, CA" },
      technologies: ["Quantum Computing", "Deep Learning", "Proprietary AI Frameworks", "CUDA", "PyTorch"],
      useCases: ["Complex Optimization", "Drug Discovery", "Secure Communications", "Scientific Simulation"],
      engagementModels: ["Consulting", "Research Partnership", "Licensing"],
      integrationCapabilities: ["Custom API", "Research Data Exchange"],
    },
    {
      id: "partner5",
      name: "EcoData Analytics",
      description: "Dedicated to environmental data analysis and sustainability reporting. We help organizations measure, monitor, and improve their ecological footprint using advanced data science.",
      industry: ["Environmental Services", "Sustainability", "Agriculture"],
      size: "Small",
      location: { latitude: 37.7749, longitude: -122.4194, address: "San Francisco, CA" },
      technologies: ["GIS", "Python", "R", "BigQuery", "Data Visualization"],
      useCases: ["Carbon Footprint Tracking", "Resource Optimization", "Impact Assessment"],
      engagementModels: ["SaaS", "Consulting"],
      integrationCapabilities: ["API", "Data Feeds"],
    },
  ];

  let partnersToProcess = partnerIds.length > 0
    ? mockPartners.filter(p => partnerIds.includes(p.id))
    : mockPartners;

  const enrichedPartners: PartnerProfile[] = [];

  for (const partner of partnersToProcess) {
    const cacheKey = `partner_profile_enriched_${partner.id}_${config.aiModelVersion}`;
    let enriched = cacheManager.get<PartnerProfile>(cacheKey);

    if (enriched) {
      enrichedPartners.push(enriched);
      continue;
    }

    if (config.enableAISuggestions) {
      logger.debug(`Enriching partner profile ${partner.name} with Gemini AI...`);
      try {
        const sentimentResult = await geminiAI.analyzeSentiment(partner.description);
        const extractedKeywords = await geminiAI.extractKeywords(partner.description + " " + partner.useCases.join(" "));
        const suggestedUseCases = await geminiAI.suggestNextActions({
          description: partner.description,
          industry: partner.industry,
          existingUseCases: partner.useCases
        }); // Using suggestNextActions as proxy for AI-derived use cases

        enriched = {
          ...partner,
          aiEnrichment: {
            sentimentSummary: sentimentResult,
            extractedKeywords: extractedKeywords,
            semanticEmbeddings: [], // In a real system, generate and store vector embeddings here
            suggestedUseCases: suggestedUseCases,
            compatibilityScorePrediction: Math.random() * 100 // Mock AI score prediction
          },
        };
        cacheManager.set(cacheKey, enriched);
      } catch (error) {
        logger.error(`Failed AI enrichment for partner ${partner.id}:`, error);
        enriched = partner; // Use original profile if AI enrichment fails
      }
    } else {
      enriched = partner;
    }
    enrichedPartners.push(enriched);
  }

  logger.info(`Fetched and enriched ${enrichedPartners.length} partner profiles.`);
  return enrichedPartners;
}

/**
 * Calculates a match score between a UserProfile and a PartnerProfile based on various weighted criteria.
 * This function is the core of the matching logic, combining explicit user preferences with AI-derived insights.
 * @param userProfile The user's profile and preferences.
 * @param partnerProfile The profile of the partner.
 * @param config PartnerMatchConfig for scoring weights and thresholds.
 * @returns A detailed PartnerMatchScoreDetail object.
 */
export function calculatePartnerMatchScore(
  userProfile: UserProfile,
  partnerProfile: PartnerProfile,
  config: PartnerMatchConfig = DEFAULT_PARTNER_MATCH_CONFIG,
): PartnerMatchScoreDetail {
  logger.debug(`Calculating match score for user ${userProfile.id} and partner ${partnerProfile.name}`);

  let keywordMatchScore = 0;
  let semanticMatchScore = 0; // Currently a placeholder, needs real embeddings
  let industryOverlapScore = 0;
  let sizeMatchScore = 0;
  let locationProximityScore = 0;
  let technologyStackOverlapScore = 0;
  let useCaseCompatibilityScore = 0;
  let aiSentimentCompatibilityScore = 0;
  let budgetAlignmentScore = 0;
  const explanation: string[] = [];

  const userChars = userProfile.preferredPartnerCharacteristics;
  const partnerRelevantText = `${partnerProfile.name} ${partnerProfile.description} ${partnerProfile.technologies.join(" ")} ${partnerProfile.useCases.join(" ")} ${partnerProfile.engagementModels.join(" ")}`.toLowerCase();

  // 1. Keyword Match Score (User's AI keywords vs. Partner's description/keywords)
  if (userProfile.aiAnalysis?.keywords.length && partnerProfile.aiEnrichment?.extractedKeywords.length) {
    const userKeywords = new Set(userProfile.aiAnalysis.keywords.map(k => k.toLowerCase()));
    const partnerKeywords = new Set(partnerProfile.aiEnrichment.extractedKeywords.map(k => k.toLowerCase()));
    const overlap = Array.from(userKeywords).filter(k => partnerKeywords.has(k)).length;
    keywordMatchScore = Math.min(overlap / Math.max(userKeywords.size, 1), 1) * 100;
    if (overlap > 0) explanation.push(`Found ${overlap} matching keywords.`);
  } else if (userProfile.aiAnalysis?.keywords.length) { // Fallback to simple text search if partner has no AI keywords
    const userKeywords = userProfile.aiAnalysis.keywords.map(k => k.toLowerCase());
    const textOverlap = userKeywords.filter(k => partnerRelevantText.includes(k)).length;
    keywordMatchScore = Math.min(textOverlap / Math.max(userKeywords.length, 1), 1) * 70; // Slightly lower confidence
    if (textOverlap > 0) explanation.push(`Found ${textOverlap} user keywords in partner text.`);
  }

  // 2. Industry Overlap Score
  if (userChars.industry?.length && partnerProfile.industry.length) {
    const userIndustries = new Set(userChars.industry.map(i => i.toLowerCase()));
    const partnerIndustries = new Set(partnerProfile.industry.map(i => i.toLowerCase()));
    const overlap = Array.from(userIndustries).filter(i => partnerIndustries.has(i)).length;
    industryOverlapScore = Math.min(overlap / Math.max(userIndustries.size, 1), 1) * 100;
    if (overlap > 0) explanation.push(`Industry alignment (${overlap} matching).`);
  }

  // 3. Size Match Score
  if (userChars.size && userChars.size !== "Any" && userChars.size === partnerProfile.size) {
    sizeMatchScore = 100;
    explanation.push(`Perfect match on partner size: ${userChars.size}.`);
  } else if (userChars.size === "Any") {
    sizeMatchScore = 70; // User is flexible, so a decent score
  } else if (userChars.size && partnerProfile.size !== "Unknown") {
    // Could implement fuzzy matching for 'Large' and 'Enterprise' or 'Small' and 'Medium'
    // For now, only exact match or 'Any' gets 100
    if (Math.abs(["Small", "Medium", "Large", "Enterprise"].indexOf(userChars.size) - ["Small", "Medium", "Large", "Enterprise"].indexOf(partnerProfile.size)) <= 1) {
      sizeMatchScore = 70; // Close size match
      explanation.push(`Close match on partner size (${partnerProfile.size} vs ${userChars.size}).`);
    } else {
      explanation.push(`Partner size (${partnerProfile.size}) does not match preference (${userChars.size}).`);
    }
  }

  // 4. Location Proximity Score
  if (userChars.location) {
    const lat1 = userChars.location.latitude;
    const lon1 = userChars.location.longitude;
    const lat2 = partnerProfile.location.latitude;
    const lon2 = partnerProfile.location.longitude;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    if (distance <= userChars.location.radiusKm) {
      locationProximityScore = 100 * (1 - (distance / userChars.location.radiusKm) * 0.8); // Closer is better, up to 100
      explanation.push(`Partner is within preferred ${userChars.location.radiusKm}km radius (${distance.toFixed(1)}km).`);
    } else if (distance <= config.locationProximityThresholdKm) {
      locationProximityScore = 50 * (1 - (distance / config.locationProximityThresholdKm)); // Partial score if within global threshold
      explanation.push(`Partner is within global proximity threshold (${distance.toFixed(1)}km).`);
    } else {
      explanation.push(`Partner is outside preferred location thresholds (${distance.toFixed(1)}km).`);
    }
  }

  // 5. Technology Stack Overlap Score
  if (userChars.technologies?.length && partnerProfile.technologies.length) {
    const userTechs = new Set(userChars.technologies.map(t => t.toLowerCase()));
    const partnerTechs = new Set(partnerProfile.technologies.map(t => t.toLowerCase()));
    const overlap = Array.from(userTechs).filter(t => partnerTechs.has(t)).length;
    technologyStackOverlapScore = Math.min(overlap / Math.max(userTechs.size, 1), 1) * 100;
    if (overlap > 0) explanation.push(`Technology stack overlap: ${overlap} matching technologies.`);
  }

  // 6. Use Case Compatibility Score
  if (userChars.useCases?.length && partnerProfile.useCases.length) {
    const userUseCases = new Set(userChars.useCases.map(uc => uc.toLowerCase()));
    const partnerUseCases = new Set(partnerProfile.useCases.map(uc => uc.toLowerCase()));
    const overlap = Array.from(userUseCases).filter(uc => partnerUseCases.has(uc)).length;
    useCaseCompatibilityScore = Math.min(overlap / Math.max(userUseCases.size, 1), 1) * 100;
    if (overlap > 0) explanation.push(`Use case compatibility: ${overlap} matching use cases.`);
  }

  // 7. AI Sentiment Compatibility Score (User's overall sentiment vs. Partner's description sentiment)
  if (userProfile.aiAnalysis?.overallSentiment && partnerProfile.aiEnrichment?.sentimentSummary) {
    const userSentiment = userProfile.aiAnalysis.overallSentiment;
    const partnerSentiment = partnerProfile.aiEnrichment.sentimentSummary.category;

    if (userSentiment === AISentimentCategory.Positive && partnerSentiment === AISentimentCategory.Positive) {
      aiSentimentCompatibilityScore = 100;
      explanation.push("High sentiment compatibility (both positive outlook).");
    } else if (userSentiment === AISentimentCategory.Neutral || partnerSentiment === AISentimentCategory.Neutral) {
      aiSentimentCompatibilityScore = 70;
      explanation.push("Neutral sentiment compatibility.");
    } else if (userSentiment === partnerSentiment) { // Negative-Negative or Mixed-Mixed
      aiSentimentCompatibilityScore = 50;
      explanation.push(`Aligned sentiment (${userSentiment} outlook).`);
    } else { // Opposing sentiments
      aiSentimentCompatibilityScore = 10;
      explanation.push("Low sentiment compatibility (differing outlooks).");
    }
  }

  // 8. Budget Alignment Score
  if (userChars.budgetRange && partnerProfile.aiEnrichment?.compatibilityScorePrediction !== undefined) {
    // This is a placeholder for a complex budget alignment, for now using a generic AI prediction
    // A real implementation would involve partner pricing tiers vs user budget ranges
    budgetAlignmentScore = partnerProfile.aiEnrichment.compatibilityScorePrediction * 0.7; // Scale down AI prediction for budget
    explanation.push(`AI suggests budget alignment. Partner score: ${partnerProfile.aiEnrichment.compatibilityScorePrediction?.toFixed(2)}`);
  } else if (userChars.budgetRange) {
    // Fallback: assume some compatibility if user specified budget, but partner doesn't explicitly state.
    budgetAlignmentScore = 50;
    explanation.push("User budget specified, assuming some alignment.");
  }


  // Combine scores with weights defined in config or fixed weights for now
  const totalScore =
    (keywordMatchScore * config.keywordMatchWeight) +
    (semanticMatchScore * config.semanticMatchWeight) + // This will be 0 until implemented
    (industryOverlapScore * 0.20) +
    (sizeMatchScore * config.partnerSizeWeight) +
    (locationProximityScore * 0.10) +
    (technologyStackOverlapScore * 0.15) +
    (useCaseCompatibilityScore * 0.15) +
    (aiSentimentCompatibilityScore * 0.05) +
    (budgetAlignmentScore * 0.05);

  const normalizedTotalScore = Math.min(Math.max(totalScore, 0), 100);

  let confidence: MatchConfidence;
  if (normalizedTotalScore >= 90) confidence = MatchConfidence.VeryHigh;
  else if (normalizedTotalScore >= 75) confidence = MatchConfidence.High;
  else if (normalizedTotalScore >= 50) confidence = MatchConfidence.Medium;
  else if (normalizedTotalScore >= 25) confidence = MatchConfidence.Low;
  else confidence = MatchConfidence.VeryLow;

  logger.debug(`Match score calculated for ${partnerProfile.name}: ${normalizedTotalScore.toFixed(2)}, Confidence: ${confidence}`);

  return {
    partnerId: partnerProfile.id,
    totalScore: parseFloat(normalizedTotalScore.toFixed(2)),
    confidence,
    breakdown: {
      keywordMatchScore: parseFloat(keywordMatchScore.toFixed(2)),
      semanticMatchScore: parseFloat(semanticMatchScore.toFixed(2)),
      industryOverlapScore: parseFloat(industryOverlapScore.toFixed(2)),
      sizeMatchScore: parseFloat(sizeMatchScore.toFixed(2)),
      locationProximityScore: parseFloat(locationProximityScore.toFixed(2)),
      technologyStackOverlapScore: parseFloat(technologyStackOverlapScore.toFixed(2)),
      useCaseCompatibilityScore: parseFloat(useCaseCompatibilityScore.toFixed(2)),
      aiSentimentCompatibilityScore: parseFloat(aiSentimentCompatibilityScore.toFixed(2)),
      budgetAlignmentScore: parseFloat(budgetAlignmentScore.toFixed(2)),
    },
    explanation,
  };
}

/**
 * The `PartnerRecommendationEngine` class orchestrates the entire partner recommendation process.
 * It ties together user profile extraction, partner data fetching and enrichment,
 * sophisticated match scoring, and AI-powered insights to deliver highly relevant partner recommendations.
 * This class is designed as a singleton for consistent configuration and state management.
 */
export class PartnerRecommendationEngine {
  private static instance: PartnerRecommendationEngine;
  private config: PartnerMatchConfig;

  private constructor(config: PartnerMatchConfig) {
    this.config = config;
    logger.info("PartnerRecommendationEngine initialized.");
  }

  public static getInstance(config?: PartnerMatchConfig): PartnerRecommendationEngine {
    if (!PartnerRecommendationEngine.instance) {
      PartnerRecommendationEngine.instance = new PartnerRecommendationEngine(config || DEFAULT_PARTNER_MATCH_CONFIG);
    } else if (config) {
      PartnerRecommendationEngine.instance.config = config;
      logger.debug("PartnerRecommendationEngine config updated.");
    }
    return PartnerRecommendationEngine.instance;
  }

  /**
   * Generates a list of recommended partners based on user answers.
   * This is the main entry point for obtaining partner recommendations.
   * @param answers The raw answers provided by the user.
   * @param userId The unique ID of the user.
   * @param limit The maximum number of recommendations to return.
   * @returns A promise resolving to an array of RecommendedPartner objects, ranked by match score.
   * @throws PartnerMatchError if the recommendation process fails at any stage.
   */
  public async getRecommendations(answers: Answers, userId: string, limit: number = 5): Promise<RecommendedPartner[]> {
    logger.info(`Starting partner recommendation process for user ${userId} with limit ${limit}.`);
    try {
      // 1. Extract User Profile with AI enrichment
      const userProfile = await extractUserProfile(answers, userId, this.config);
      logger.debug(`User profile extracted for ${userId}. AI analysis: ${userProfile.aiAnalysis ? 'enabled' : 'disabled'}`);

      // 2. Fetch and Enrich Partner Profiles with AI
      const allPartners = await fetchAndEnrichPartnerProfiles([], this.config);
      logger.debug(`Fetched and enriched ${allPartners.length} partner profiles. AI enrichment: ${this.config.enableAISuggestions ? 'enabled' : 'disabled'}`);

      // 3. Calculate Match Scores for all partners
      const matchScores: PartnerMatchScoreDetail[] = [];
      for (const partner of allPartners) {
        matchScores.push(calculatePartnerMatchScore(userProfile, partner, this.config));
      }
      logger.debug(`Calculated match scores for ${matchScores.length} partners.`);

      // 4. Sort and Rank Recommendations by total score
      const sortedMatches = matchScores
        .filter(score => score.totalScore > 0) // Filter out partners with no relevance
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit);

      const recommendations: RecommendedPartner[] = [];
      for (let i = 0; i < sortedMatches.length; i++) {
        const scoreDetail = sortedMatches[i];
        const partnerProfile = allPartners.find(p => p.id === scoreDetail.partnerId);
        if (partnerProfile) {
          let aiInsights = '';
          let nextInteractionSuggestion = '';

          if (this.config.enableAISuggestions) {
            try {
              // Generate AI insight specific to this recommendation, explaining why it's a good fit
              aiInsights = await geminiAI.generateSummary(
                `For user with intent: '${userProfile.searchIntent}', this partner '${partnerProfile.name}' is a strong match (score: ${scoreDetail.totalScore.toFixed(1)}) due to: ${scoreDetail.explanation.join(', ')}. Their key offerings include: ${partnerProfile.description}.`,
                250
              );
              // Suggest next logical steps for the user regarding this partner
              nextInteractionSuggestion = (await geminiAI.suggestNextActions({
                userProfileId: userProfile.id,
                partnerId: partnerProfile.id,
                matchScore: scoreDetail.totalScore,
                confidence: scoreDetail.confidence,
                matchReasons: scoreDetail.explanation,
                partnerName: partnerProfile.name
              }))[0] || "Consider reviewing their profile details.";
            } catch (aiError) {
              logger.warn(`Failed to generate AI insight/suggestion for partner ${partnerProfile.name}`, aiError);
            }
          }

          recommendations.push({
            profile: partnerProfile,
            matchDetails: scoreDetail,
            rank: i + 1,
            aiInsights: aiInsights || "No specific AI insights generated for this recommendation.",
            nextInteractionSuggestion: nextInteractionSuggestion || "Explore more about this partner."
          });
        }
      }

      logger.info(`Generated ${recommendations.length} high-quality recommendations for user ${userId}.`);
      return recommendations;
    } catch (error: any) {
      logger.error(`Critical error during partner recommendation for user ${userId}`, error);
      throw new PartnerMatchError(`Failed to generate recommendations: ${error.message}`);
    }
  }

  /**
   * Provides a comprehensive, detailed analysis for a specific partner given a user's profile.
   * This is useful for "why this partner?" explanations in a UI.
   * @param userProfile The user's profile.
   * @param partnerProfile The partner's profile.
   * @returns A promise resolving to a detailed analysis string, potentially enhanced by AI.
   * @throws PartnerMatchError if analysis generation fails.
   */
  public async getDetailedAnalysisForPartner(userProfile: UserProfile, partnerProfile: PartnerProfile): Promise<string> {
    logger.info(`Generating detailed analysis for partner ${partnerProfile.name} and user ${userProfile.id}.`);
    try {
      const matchScore = calculatePartnerMatchScore(userProfile, partnerProfile, this.config);
      const explanations = matchScore.explanation.join(". ");
      const combinedText = `User intent: ${userProfile.searchIntent}. User preferences: ${JSON.stringify(userProfile.preferredPartnerCharacteristics)}. Partner: ${partnerProfile.name}, Description: ${partnerProfile.description}. Match score: ${matchScore.totalScore} with confidence ${matchScore.confidence}. Core reasons for match: ${explanations}. Partner's technologies: ${partnerProfile.technologies.join(', ')}. Partner's use cases: ${partnerProfile.useCases.join(', ')}.`;

      if (this.config.enableAISuggestions) {
        const analysisSummary = await geminiAI.generateSummary(combinedText, 500);
        const nextSteps = await geminiAI.suggestNextActions({
          userProfileId: userProfile.id,
          partnerProfileId: partnerProfile.id,
          matchScoreDetails: matchScore,
        });
        return `${analysisSummary}\n\nSuggested Next Steps: ${nextSteps.join("; ")}\n\nBreakdown: ${JSON.stringify(matchScore.breakdown, null, 2)}`;
      } else {
        return `Detailed Match Analysis for ${partnerProfile.name}:\nTotal Score: ${matchScore.totalScore}\nConfidence: ${matchScore.confidence}\nExplanation: ${explanations}\nBreakdown: ${JSON.stringify(matchScore.breakdown, null, 2)}`;
      }
    } catch (error: any) {
      logger.error(`Error generating detailed analysis for partner ${partnerProfile.name}`, error);
      throw new PartnerMatchError(`Failed to generate detailed analysis: ${error.message}`);
    }
  }
}

export const partnerRecommendationEngine = PartnerRecommendationEngine.getInstance();

// --- Example usage (for testing or demonstration, not part of core exports for general use) ---
// This section demonstrates how the various components might be used together.
/*
async function runDemo() {
  const dummyAnswers: Answers = [
    {
      __typename: "OnboardingAnswer",
      id: "ans1",
      questionKey: "preferred_industry",
      questionText: "What industry are you in?",
      answerValue: ["Financial Services", "Technology"],
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans2",
      questionKey: "partner_size_preference",
      questionText: "What size of partner are you looking for?",
      answerValue: "Large",
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans3",
      questionKey: "required_technologies",
      questionText: "Which technologies are crucial for your partner?",
      answerValue: ["TensorFlow", "Kubernetes", "Python"],
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans4",
      questionKey: "target_location",
      questionText: "Where should the partner be located? (lat,long,radiusKm)",
      answerValue: "34.0522,-118.2437,100", // Los Angeles area with 100km radius
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans5",
      questionKey: "primary_use_cases",
      questionText: "What are your primary use cases?",
      answerValue: ["Fraud Detection", "Predictive Analytics", "AI Implementation"],
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans6",
      questionKey: "budget_range",
      questionText: "What is your estimated budget range?",
      answerValue: "$50000-$100000",
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans7",
      questionKey: "directTransmissionEnabled",
      questionText: "Do you use direct data transmission?",
      answerValue: "true",
      partnerMatch: {
        __typename: "PartnerMatch",
        partner: {
          __typename: "Partner",
          id: "partner1",
          name: "Innovate Solutions Inc.",
        },
        userReportedPartnerName: null,
      },
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans8",
      questionKey: OnboardingAnswer__QuestionKeyEnum.BeginSearch,
      questionText: "Click to begin search",
      answerValue: "true",
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans9",
      questionKey: "risk_tolerance",
      questionText: "What is your risk tolerance for new solutions?",
      answerValue: "High",
      partnerMatch: null,
    },
    {
      __typename: "OnboardingAnswer",
      id: "ans10",
      questionKey: "communication_preference",
      questionText: "How do you prefer to communicate with partners?",
      answerValue: "Frequent updates, direct communication",
      partnerMatch: null,
    },
  ];

  const userId = "demo_user_007";

  // Override config for demo if needed
  const demoConfig: PartnerMatchConfig = {
    ...DEFAULT_PARTNER_MATCH_CONFIG,
    logLevel: "debug", // More verbose logging for demo
    cacheDurationMinutes: 1, // Shorter cache for demo
    enableAISuggestions: true,
  };

  Logger.getInstance(demoConfig.logLevel); // Re-initialize logger with demo config
  CacheManager.getInstance(demoConfig.cacheDurationMinutes); // Re-initialize cache with demo config
  GeminiAIClient.getInstance(demoConfig); // Re-initialize AI client with demo config
  PartnerRecommendationEngine.getInstance(demoConfig); // Re-initialize engine with demo config

  try {
    const userProfile = await extractUserProfile(dummyAnswers, userId, demoConfig);
    console.log("\n--- Extracted User Profile ---");
    console.log(JSON.stringify(userProfile, null, 2));

    const recommendations = await partnerRecommendationEngine.getRecommendations(dummyAnswers, userId, 3);
    console.log("\n--- Top 3 Partner Recommendations ---");
    recommendations.forEach((rec) => {
      console.log(`Rank ${rec.rank}: ${rec.profile.name} (Score: ${rec.matchDetails.totalScore.toFixed(2)}, Confidence: ${rec.matchDetails.confidence})`);
      console.log(`  - Explanation: ${rec.matchDetails.explanation.join("; ")}`);
      console.log(`  - AI Insights: ${rec.aiInsights}`);
      console.log(`  - Next Steps: ${rec.nextInteractionSuggestion}`);
      console.log(`  - Key Technologies: ${rec.profile.technologies.join(', ')}`);
      console.log(`  - Primary Use Cases: ${rec.profile.useCases.join(', ')}`);
    });

    if (recommendations.length > 0) {
      console.log("\n--- Detailed Analysis for Top Partner ---");
      const topPartner = recommendations[0].profile;
      const detailedAnalysis = await partnerRecommendationEngine.getDetailedAnalysisForPartner(userProfile, topPartner);
      console.log(detailedAnalysis);
    }

  } catch (error) {
    console.error("\n--- Demo Error ---");
    console.error(error);
  }
}

// To run the demo, uncomment the line below:
// runDemo();
*/