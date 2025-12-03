// Copyright James Burvel Oâ€™Callaghan III

/**
 * Defines the structure for the values held by the ledger account form.
 * This interface is critical for type-checking and ensuring data consistency
 * throughout the application's form handling logic.
 */
export interface FormValues {
  id: string;
  name: string;
  description: string;
  currency: string;
  customCurrency: string;
  currencyExponent: number | null;
  normalBalance: string;
  ledgerId: string;
  category: Array<{ label: string; value: string }>;
  categoryError: string | null;
  metadata: Record<string, string>;
}

/**
 * Defines the properties passed to a generic ledger account form field component.
 * This allows for flexible and reusable form field implementations, often used
 * with form libraries like Formik or React Hook Form.
 */
export interface LedgerAccountFieldProps {
  field: {
    name: string;
    onBlur: () => void;
    onChange: (value: string) => void;
    value: string;
  };
  form?: {
    initialValues: FormValues;
    values: FormValues;
    errors: Record<string, unknown>;
    touched: Record<string, unknown>;
    setFieldValue: (field: string, value: string | number | boolean) => void;
  };
}

/**
 * A constant string used to identify the "Custom Currency" option in currency selectors.
 * This allows users to input a currency not present in the predefined list.
 */
export const CUSTOM_CURRENCY_OPTION = "Custom Currency";

// --- START: EPIC EXPANSION with Gemini AI functions and commercial-grade features ---

/**
 * Represents the comprehensive configuration for the Gemini AI service.
 * This includes parameters for API interaction, model selection, safety,
 * generation, and feature toggles to enable/disable specific AI capabilities.
 * @property {string} apiKey - The API key for authenticating with the Gemini AI service.
 * @property {string} endpoint - The base URL for the Gemini AI API.
 * @property {string} defaultModel - The default Gemini model to be used (e.g., 'gemini-pro').
 * @property {Object} safetySettings - Defines thresholds for blocking harmful content categories.
 * @property {number} temperature - Controls the randomness of the AI's output. Higher values are more creative, lower are more deterministic.
 * @property {number} maxOutputTokens - The maximum number of tokens to generate in the response.
 * @property {number} topP - The cumulative probability for token selection.
 * @property {number} topK - The number of top-k most likely tokens to sample from.
 * @property {Object} featureFlags - Boolean flags to enable or disable specific AI features across the application.
 */
export interface GeminiAIConfig {
  apiKey: string;
  endpoint: string;
  defaultModel: string;
  safetySettings: {
    harassment: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
    hateSpeech: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
    sexualContent: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
    dangerousContent: "BLOCK_NONE" | "BLOCK_LOW_AND_ABOVE" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_HIGH_AND_ABOVE";
  };
  temperature: number;
  maxOutputTokens: number;
  topP: number;
  topK: number;
  featureFlags: {
    enableDescriptionGeneration: boolean;
    enableCategorySuggestion: boolean;
    enableMetadataTagging: boolean;
    enableAnomalyDetection: boolean;
    enableSentimentAnalysis: boolean;
  };
}

/**
 * Defines the standard structure for a prompt part in a Gemini AI conversation.
 * Each part specifies a role (user or model) and the textual content.
 */
export interface GeminiPromptPart {
  text: string;
}

/**
 * Represents a full prompt in the context of a conversational AI interaction.
 */
export interface GeminiPrompt {
  role: "user" | "model";
  parts: GeminiPromptPart[];
}

/**
 * Defines the structure for generated content returned by the Gemini AI.
 * This can include text, scores, tags, and a rationale for AI decisions.
 */
export interface GeminiGeneratedContent {
  text: string;
  score?: number; // e.g., confidence score for a classification
  tags?: string[]; // e.g., for metadata tagging
  suggestedValue?: string | number | boolean | Array<{ label: string; value: string }>; // for direct suggestions
  rationale?: string; // explanation for suggestion or decision
  analysisType?: 'description' | 'category' | 'metadata' | 'anomaly' | 'sentiment';
}

/**
 * Defines the complete structure of a raw response received from the Gemini AI API.
 * It includes content candidates, safety ratings, and potential feedback on the prompt itself.
 */
export interface GeminiAIResponse {
  candidates: Array<{
    content: {
      parts: GeminiPromptPart[];
      role: "model";
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
  aiGeneratedData?: GeminiGeneratedContent; // Custom parsed and structured data from the AI's raw text response
}

/**
 * Custom error class for handling specific issues related to Gemini AI operations.
 * This allows for more granular error handling and reporting.
 */
export class GeminiAIError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  /**
   * Creates an instance of GeminiAIError.
   * @param message - A human-readable error message.
   * @param code - A unique error code (e.g., "API_ERROR_400", "REQUEST_TIMEOUT").
   * @param details - Optional additional context or raw error objects.
   */
  constructor(message: string, code: string = "GEMINI_AI_ERROR", details?: Record<string, any>) {
    super(message);
    this.name = "GeminiAIError";
    this.code = code;
    this.details = details;
    // Ensure proper prototype chain for 'instanceof' checks
    Object.setPrototypeOf(this, GeminiAIError.prototype);
  }
}

/**
 * Enum for various standard financial categories a ledger account can belong to.
 * This provides a controlled vocabulary for account classification, both manually
 * and through AI suggestions.
 */
export enum FinancialCategory {
  ASSET = "ASSET", // Resources owned by the company
  LIABILITY = "LIABILITY", // Obligations of the company
  EQUITY = "EQUITY", // Owners' claims on assets
  REVENUE = "REVENUE", // Income generated from operations
  EXPENSE = "EXPENSE", // Costs incurred to generate revenue
  OTHER_INCOME = "OTHER_INCOME", // Non-operating income
  OTHER_EXPENSE = "OTHER_EXPENSE", // Non-operating expenses
  INVESTMENT = "INVESTMENT", // Accounts related to investments
  DRAWINGS = "DRAWINGS", // Funds withdrawn by owners
  BANK_ACCOUNT = "BANK_ACCOUNT", // Specific asset type for cash holdings
  ACCOUNTS_RECEIVABLE = "ACCOUNTS_RECEIVABLE", // Money owed to the company
  ACCOUNTS_PAYABLE = "ACCOUNTS_PAYABLE", // Money the company owes
  CASH = "CASH", // Physical cash or highly liquid equivalents
  INVENTORY = "INVENTORY", // Goods available for sale
  PREPAID_EXPENSES = "PREPAID_EXPENSES", // Expenses paid in advance
  FIXED_ASSETS = "FIXED_ASSETS", // Long-term tangible assets
  ACCUMULATED_DEPRECIATION = "ACCUMULATED_DEPRECIATION", // Contra-asset account for fixed assets
  LONG_TERM_DEBT = "LONG_TERM_DEBT", // Debts due in over a year
  SHORT_TERM_DEBT = "SHORT_TERM_DEBT", // Debts due within a year
  SALARIES_EXPENSE = "SALARIES_EXPENSE", // Cost of employee wages
  RENT_EXPENSE = "RENT_EXPENSE", // Cost of renting property
  UTILITY_EXPENSE = "UTILITY_EXPENSE", // Cost of utilities (electricity, water, etc.)
  SALES_REVENUE = "SALES_REVENUE", // Revenue from selling goods
  SERVICE_REVENUE = "SERVICE_REVENUE", // Revenue from providing services
  INTEREST_INCOME = "INTEREST_INCOME", // Income from interest on investments
  TAX_EXPENSE = "TAX_EXPENSE", // Expense related to taxes
  RETAINED_EARNINGS = "RETAINED_EARNINGS", // Accumulated profits
  DIVIDENDS_PAYABLE = "DIVIDENDS_PAYABLE", // Dividends declared but not yet paid
  BAD_DEBT_EXPENSE = "BAD_DEBT_EXPENSE", // Expense from uncollectible receivables
  COST_OF_GOODS_SOLD = "COST_OF_GOODS_SOLD", // Direct costs attributable to the production of goods sold
  DEPRECIATION_EXPENSE = "DEPRECIATION_EXPENSE", // Expense for the consumption of fixed assets
  UNCATEGORIZED = "UNCATEGORIZED", // Default for unassigned accounts
}

/**
 * A robust and professional client for interacting with the Gemini AI API.
 * This class handles API requests, error management, and the parsing of AI responses,
 * specifically tailored for ledger account related intelligent features.
 * It ensures security, reliability, and observability in AI interactions.
 */
export class GeminiAIClient {
  private config: GeminiAIConfig;
  private readonly DEFAULT_TIMEOUT_MS = 15000; // 15 seconds for AI responses
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 1000; // 1 second before retrying

  /**
   * Initializes the GeminiAIClient with a specific, validated configuration.
   * @param config The configuration object for the Gemini AI service.
   * @throws {Error} If the API key is missing during production environment.
   */
  constructor(config: GeminiAIConfig) {
    this.config = config;
    if (!this.config.apiKey || this.config.apiKey === "YOUR_GEMINI_API_KEY") {
      const warningMessage = "GeminiAIClient initialized without a valid API key. AI functionalities might be limited or fail. Please set NEXT_PUBLIC_GEMINI_API_KEY.";
      if (process.env.NODE_ENV === "production") {
        console.error(warningMessage);
        // In a real production system, you might want to throw an error or disable AI features entirely.
        // throw new Error(warningMessage);
      } else {
        console.warn(warningMessage);
      }
    }
  }

  /**
   * Internal helper to make a POST request to the Gemini API endpoint with retry logic.
   * Encapsulates network communication, timeout handling, and basic error parsing.
   * @param payload The request body to send to the AI.
   * @param timeout Optional timeout for the request in milliseconds.
   * @param attempt Current retry attempt (internal).
   * @returns A Promise that resolves with the GeminiAIResponse.
   * @throws GeminiAIError if the API call fails or times out after retries.
   */
  private async postToGemini(payload: any, timeout: number = this.DEFAULT_TIMEOUT_MS, attempt: number = 0): Promise<GeminiAIResponse> {
    if (!this.config.apiKey || this.config.apiKey === "YOUR_GEMINI_API_KEY") {
      aiLogger.error("Gemini API key is not configured. Cannot make AI requests.", { attempt, payload });
      throw new GeminiAIError(
        "Gemini API key is not configured. Cannot make AI requests.",
        "MISSING_API_KEY",
      );
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout); // Set up request timeout

    try {
      aiLogger.debug(`Sending request to Gemini AI (Attempt ${attempt + 1}/${this.MAX_RETRY_ATTEMPTS})...`, { payload, model: this.config.defaultModel });
      const response = await fetch(`${this.config.endpoint}/v1beta/models/${this.config.defaultModel}:generateContent?key=${this.config.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest", // Standard header for AJAX requests
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId); // Clear timeout if response is received within limit

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        aiLogger.error(`Gemini API request failed (Status: ${response.status})`, { attempt, errorBody, payload });

        // Implement retry logic for transient errors (e.g., 429 Too Many Requests, 5xx Server Errors)
        if ((response.status === 429 || response.status >= 500) && attempt < this.MAX_RETRY_ATTEMPTS - 1) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS * (attempt + 1))); // Exponential backoff
          aiLogger.warn(`Retrying Gemini AI request due to transient error...`, { attempt: attempt + 1 });
          return this.postToGemini(payload, timeout, attempt + 1);
        }

        throw new GeminiAIError(
          `Gemini API request failed: ${response.status} - ${errorBody.message || JSON.stringify(errorBody)}`,
          `API_ERROR_${response.status}`,
          errorBody,
        );
      }

      const data: GeminiAIResponse = await response.json();

      // Advanced safety check and logging
      if (data.candidates && data.candidates.length > 0) {
        const safetyIssues = data.candidates.flatMap(c => c.safetyRatings).filter(sr => sr.probability === "HIGH" || sr.probability === "UNSPECIFIED");
        if (safetyIssues.length > 0) {
          aiLogger.warn("Gemini AI generated content might contain safety issues.", { safetyIssues, payload });
          // Depending on policy, you might throw an error or filter content here
        }
      }
      aiLogger.debug("Gemini AI response received successfully.", { responseData: data });
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId); // Ensure timeout is cleared even if an error occurs
      if (error.name === "AbortError") {
        aiLogger.error("Gemini AI request timed out.", { attempt, payload });
        throw new GeminiAIError("Gemini AI request timed out.", "REQUEST_TIMEOUT");
      }
      if (error instanceof GeminiAIError) {
        throw error; // Re-throw our custom error
      }
      aiLogger.error("An unexpected error occurred during Gemini AI request.", { attempt, errorMessage: error.message, error });
      throw new GeminiAIError(`An unexpected error occurred during Gemini AI request: ${error.message}`, "UNEXPECTED_ERROR", error);
    }
  }

  /**
   * Generates a conversational prompt payload for the Gemini API, incorporating
   * configured safety settings and generation parameters.
   * @param text The user's input text for the prompt.
   * @param history Optional conversation history (array of GeminiPrompt) for multi-turn interactions.
   * @returns The structured payload object ready for the Gemini API.
   */
  private generateContentPayload(text: string, history: GeminiPrompt[] = []): any {
    return {
      contents: [
        ...history,
        { role: "user", parts: [{ text }] },
      ],
      safetySettings: Object.entries(this.config.safetySettings).map(([category, threshold]) => ({
        category: `HARM_CATEGORY_${category.toUpperCase()}`,
        threshold: threshold,
      })),
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxOutputTokens,
        topP: this.config.topP,
        topK: this.config.topK,
      },
    };
  }

  /**
   * Extracts the primary text content from the first candidate of a Gemini AI response.
   * @param response The raw Gemini AI response object.
   * @returns The extracted text content, or an empty string if no valid candidate or text is found.
   */
  private extractTextFromResponse(response: GeminiAIResponse): string {
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  /**
   * Prompts Gemini AI to generate a detailed, professional description for a ledger account.
   * This function leverages AI's understanding of financial contexts to create meaningful descriptions.
   * @param accountName The proposed name of the ledger account.
   * @param category The suggested category for the account (can be a comma-separated string if multiple).
   * @param existingDescription An optional existing description to refine or expand upon.
   * @returns A Promise that resolves with a suggested description string, or null if the AI feature is disabled.
   * @throws GeminiAIError if the AI call or parsing fails.
   */
  public async generateAccountDescription(
    accountName: string,
    category: FinancialCategory | string,
    existingDescription?: string,
  ): Promise<string | null> {
    if (!this.config.featureFlags.enableDescriptionGeneration) {
      aiLogger.info("Description generation feature is disabled by feature flag. Skipping AI call.");
      return null;
    }

    const prompt = `Generate a concise, professional, and accurate description for a ledger account in an enterprise accounting system.
      Consider the following details:
      Account Name: "${accountName}"
      Primary Category: "${category}"
      ${existingDescription ? `Existing context/hints: "${existingDescription}"` : ""}
      
      The description should be 1-2 sentences, focus on the financial purpose, and clearly state what transactions or balances this account represents. Avoid introductory phrases like "This account is used to...".
      Example for 'Cash Account' in 'ASSET' category: "Records all cash receipts, disbursements, and the current cash balance of the entity."`;

    const payload = this.generateContentPayload(prompt);
    const response = await this.postToGemini(payload);
    const generatedText = this.extractTextFromResponse(response);

    // Post-processing for robustness: remove extraneous quotes, trim whitespace, ensure sentence case.
    const cleanedDescription = generatedText.replace(/['"]+/g, '').trim();
    const finalDescription = cleanedDescription.charAt(0).toUpperCase() + cleanedDescription.slice(1);

    aiLogger.info(`AI Generated Description for '${accountName}' (Category: ${category}): ${finalDescription}`);
    return finalDescription;
  }

  /**
   * Prompts Gemini AI to suggest the most appropriate primary financial categories for a ledger account.
   * This is particularly useful for new account creation, helping users classify accounts correctly.
   * @param accountName The proposed name of the ledger account.
   * @param description An optional, detailed description for additional context.
   * @returns A Promise that resolves with an array of suggested `FinancialCategory` enum values,
   *          or null if the AI feature is disabled or no valid categories are suggested.
   * @throws GeminiAIError if the AI call or parsing fails.
   */
  public async suggestAccountCategory(
    accountName: string,
    description?: string,
  ): Promise<FinancialCategory[] | null> {
    if (!this.config.featureFlags.enableCategorySuggestion) {
      aiLogger.info("Category suggestion feature is disabled by feature flag. Skipping AI call.");
      return null;
    }

    const categoriesList = Object.values(FinancialCategory).filter(cat => cat !== FinancialCategory.UNCATEGORIZED).join(", ");
    const prompt = `Given the ledger account name "${accountName}" ${description ? `and its description "${description}"` : ""},
      suggest the top 1-3 most appropriate standard financial categories from the following comprehensive list: [${categoriesList}].
      Consider typical accounting principles. Output the categories as a comma-separated list of UPPERCASE enum names only,
      e.g., "ASSET, BANK_ACCOUNT" or "REVENUE, SALES_REVENUE". Do not include any other text or formatting.`;

    const payload = this.generateContentPayload(prompt);
    const response = await this.postToGemini(payload);
    const generatedText = this.extractTextFromResponse(response);

    const suggestedCategories = generatedText
      .split(',')
      .map(cat => cat.trim().toUpperCase())
      .filter(cat => Object.values(FinancialCategory).includes(cat as FinancialCategory)) as FinancialCategory[];

    aiLogger.info(`AI Suggested Categories for '${accountName}': ${suggestedCategories.join(', ')}`);
    return suggestedCategories.length > 0 ? suggestedCategories : null;
  }

  /**
   * Uses Gemini AI to extract and suggest relevant metadata tags (key-value pairs) from an account's name and description.
   * This can significantly enhance searchability, reporting, and integration capabilities for ledger accounts.
   * @param accountName The name of the ledger account.
   * @param description The description of the ledger account.
   * @param existingMetadata Optional existing metadata to consider, preventing redundant suggestions.
   * @returns A Promise resolving to a `Record<string, string>` of suggested metadata tags, or null if the AI feature is disabled.
   * @throws GeminiAIError if the AI call or JSON parsing fails.
   */
  public async suggestMetadataTags(
    accountName: string,
    description: string,
    existingMetadata?: Record<string, string>,
  ): Promise<Record<string, string> | null> {
    if (!this.config.featureFlags.enableMetadataTagging) {
      aiLogger.info("Metadata tagging feature is disabled by feature flag. Skipping AI call.");
      return null;
    }

    const existingTagsPrompt = existingMetadata && Object.keys(existingMetadata).length > 0
      ? `Do not suggest tags already present in this existing metadata: ${JSON.stringify(existingMetadata)}.`
      : "";

    const prompt = `Analyze the ledger account named "${accountName}" with description "${description}".
      Suggest relevant, concise metadata tags as a JSON object of key-value pairs (e.g., {"department": "finance", "project_code": "P2023-001", "region": "EMEA"}).
      Prioritize tags that add context for financial analysis, reporting, or system integration.
      Keys should be snake_case strings. Values should be simple strings.
      ${existingTagsPrompt}
      Output strictly as a JSON object, e.g., {"department": "sales", "cost_center": "CC101"}.`;

    const payload = this.generateContentPayload(prompt);
    const response = await this.postToGemini(payload);
    const generatedText = this.extractTextFromResponse(response);

    try {
      const suggestedMetadata = JSON.parse(generatedText);
      if (typeof suggestedMetadata === 'object' && suggestedMetadata !== null) {
        const combinedMetadata = { ...(existingMetadata || {}), ...suggestedMetadata }; // Existing metadata overrides new suggestions for same key
        aiLogger.info(`AI Suggested Metadata for '${accountName}':`, combinedMetadata);
        return combinedMetadata as Record<string, string>;
      }
      aiLogger.warn("AI-generated metadata was not a valid JSON object.", { generatedText });
      return null;
    } catch (e: any) {
      aiLogger.error("Failed to parse AI-generated metadata JSON.", { error: e, generatedText });
      throw new GeminiAIError("Failed to parse AI-generated metadata.", "JSON_PARSE_ERROR", { rawText: generatedText, originalError: e });
    }
  }

  /**
   * Performs an advanced anomaly detection check on a ledger account's properties using Gemini AI.
   * This function can flag unusual combinations of financial attributes, helping to prevent data entry errors
   * or identify potential fraud patterns.
   * @param values The full `FormValues` object containing all properties of the ledger account.
   * @returns A Promise resolving to an object indicating if an anomaly was detected (`isAnomaly: boolean`)
   *          and a `rationale` string, or null if the AI feature is disabled.
   * @throws GeminiAIError if the AI call or JSON parsing fails.
   */
  public async performAnomalyDetection(
    values: FormValues,
  ): Promise<{ isAnomaly: boolean; rationale: string } | null> {
    if (!this.config.featureFlags.enableAnomalyDetection) {
      aiLogger.info("Anomaly detection feature is disabled by feature flag. Skipping AI call.");
      return null;
    }

    const prompt = `Analyze the following ledger account properties for potential anomalies, inconsistencies, or unusual patterns based on standard financial accounting principles and typical business practices:
      Account ID: "${values.id}"
      Name: "${values.name}"
      Description: "${values.description}"
      Currency: "${values.currency}"
      Custom Currency Symbol: "${values.customCurrency}"
      Currency Exponent: ${values.currencyExponent}
      Normal Balance: "${values.normalBalance}"
      Categories: "${values.category.map(c => c.value).join(', ')}"
      Metadata: ${JSON.stringify(values.metadata)}
      
      Is there anything about this combination of properties that appears unusual, suspicious, or deviates significantly from expected norms?
      Provide your response strictly as a JSON object with two keys: "isAnomaly" (boolean) and "rationale" (string, explaining the detection).
      Example for anomaly: {"isAnomaly": true, "rationale": "An 'Expense' category account with a 'Credit' normal balance is highly unusual and warrants review."}
      Example for no anomaly: {"isAnomaly": false, "rationale": "The account properties appear consistent and within expected financial parameters."}`;

    const payload = this.generateContentPayload(prompt);
    const response = await this.postToGemini(payload);
    const generatedText = this.extractTextFromResponse(response);

    try {
      const anomalyResult = JSON.parse(generatedText);
      if (typeof anomalyResult === 'object' && anomalyResult !== null && 'isAnomaly' in anomalyResult && typeof anomalyResult.isAnomaly === 'boolean' && 'rationale' in anomalyResult) {
        aiLogger.info(`AI Anomaly Detection for '${values.name}':`, anomalyResult);
        return anomalyResult as { isAnomaly: boolean; rationale: string };
      }
      aiLogger.warn("AI-generated anomaly detection result was not a valid JSON object or missing keys.", { generatedText });
      return { isAnomaly: false, rationale: "AI could not definitively determine anomaly status due to parsing error." };
    } catch (e: any) {
      aiLogger.error("Failed to parse AI-generated anomaly detection JSON.", { error: e, generatedText });
      throw new GeminiAIError("Failed to parse AI-generated anomaly detection result.", "JSON_PARSE_ERROR", { rawText: generatedText, originalError: e });
    }
  }

  /**
   * Conducts sentiment analysis on the account description to identify the emotional tone.
   * This can be useful for compliance checks, flagging potentially misleading descriptions,
   * or for internal auditing purposes.
   * @param description The textual description of the ledger account.
   * @returns A Promise resolving to an object with sentiment classification, confidence score,
   *          and a rationale, or null if the AI feature is disabled.
   * @throws GeminiAIError if the AI call or JSON parsing fails.
   */
  public async analyzeDescriptionSentiment(
    description: string,
  ): Promise<{ sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'; score: number; rationale: string } | null> {
    if (!this.config.featureFlags.enableSentimentAnalysis) {
      aiLogger.info("Sentiment analysis feature is disabled by feature flag. Skipping AI call.");
      return null;
    }
    if (!description || description.trim().length < 10) {
      aiLogger.warn("Description too short for meaningful sentiment analysis. Skipping AI call.", { description });
      return { sentiment: 'neutral', score: 0, rationale: "Description too short for meaningful analysis." };
    }

    const prompt = `Perform granular sentiment analysis on the following ledger account description: "${description}".
      Classify the overall sentiment as one of: 'positive', 'neutral', 'negative', or 'mixed'.
      Provide a confidence score (between 0.0 and 1.0, representing certainty) and a brief, specific rationale for the classification.
      Output strictly as a JSON object: {"sentiment": "neutral", "score": 0.85, "rationale": "No strong emotional indicators detected, factual description."}`;

    const payload = this.generateContentPayload(prompt);
    const response = await this.postToGemini(payload);
    const generatedText = this.extractTextFromResponse(response);

    try {
      const sentimentResult = JSON.parse(generatedText);
      if (typeof sentimentResult === 'object' && sentimentResult !== null && 'sentiment' in sentimentResult && 'score' in sentimentResult && typeof sentimentResult.score === 'number') {
        aiLogger.info(`AI Sentiment Analysis for description:`, sentimentResult);
        return sentimentResult as { sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'; score: number; rationale: string };
      }
      aiLogger.warn("AI-generated sentiment analysis result was not a valid JSON object or missing keys.", { generatedText });
      return { sentiment: 'neutral', score: 0, rationale: "AI could not determine sentiment due to parsing error." };
    } catch (e: any) {
      aiLogger.error("Failed to parse AI-generated sentiment analysis JSON.", { error: e, generatedText });
      throw new GeminiAIError("Failed to parse AI-generated sentiment analysis result.", "JSON_PARSE_ERROR", { rawText: generatedText, originalError: e });
    }
  }
}

/**
 * Default configuration for the Gemini AI client.
 * In a real-world, commercial-grade application, this would be loaded securely
 * from environment variables, a configuration service, or a secrets manager,
 * and typically NOT hardcoded. API keys should be handled with extreme care.
 */
export const DEFAULT_GEMINI_AI_CONFIG: GeminiAIConfig = {
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY", // Placeholder: MUST be replaced by actual secure key
  endpoint: process.env.NEXT_PUBLIC_GEMINI_API_ENDPOINT || "https://generativelanguage.googleapis.com",
  defaultModel: "gemini-pro", // Consider 'gemini-pro-vision' for multimodal inputs if needed
  safetySettings: {
    harassment: "BLOCK_NONE", // Adjust blocking thresholds based on application's content policy
    hateSpeech: "BLOCK_NONE",
    sexualContent: "BLOCK_NONE",
    dangerousContent: "BLOCK_NONE",
  },
  temperature: 0.7, // Moderate creativity
  maxOutputTokens: 512, // Sufficient for detailed descriptions and structured outputs
  topP: 0.95, // Diversifies token sampling
  topK: 40, // Limits sampling to top 40 tokens
  featureFlags: {
    enableDescriptionGeneration: true,
    enableCategorySuggestion: true,
    enableMetadataTagging: true,
    enableAnomalyDetection: true,
    enableSentimentAnalysis: true,
  },
};

/**
 * A singleton instance of the Gemini AI client.
 * This pattern ensures that only one instance of the client is created and shared
 * across the entire application, optimizing resource usage and centralizing AI communication.
 */
export const geminiAIClient = new GeminiAIClient(DEFAULT_GEMINI_AI_CONFIG);

/**
 * Represents the various operational states a form field can be in, especially when
 * undergoing asynchronous processing or receiving AI-driven feedback.
 */
export enum FieldProcessingState {
  IDLE = "IDLE", // No active processing or suggestion
  PROCESSING = "PROCESSING", // An AI operation is currently underway
  SUGGESTED = "SUGGESTED", // AI has provided a suggestion, awaiting user review/application
  APPLIED = "APPLIED", // An AI suggestion has been applied to the form field
  ERROR = "ERROR", // An error occurred during AI processing for this field
  ANOMALY_DETECTED = "ANOMALY_DETECTED", // AI has flagged a potential anomaly for this field/data
  WARNING = "WARNING", // AI has provided a warning, less severe than an error
}

/**
 * Extends the base `FormValues` interface with additional state properties for
 * managing AI-driven suggestions, processing status, and feedback for each field.
 * This allows the UI to reflect the dynamic nature of AI assistance.
 */
export interface EnhancedFormValues extends FormValues {
  // AI-driven suggestions and states for 'name' field
  suggestedName?: string | null;
  nameProcessingState?: FieldProcessingState;
  nameAnomalyRationale?: string | null; // Rationale if AI finds an anomaly related to the name

  // AI-driven suggestions and states for 'description' field
  suggestedDescription?: string | null;
  descriptionProcessingState?: FieldProcessingState;
  descriptionSentiment?: { sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'; score: number; rationale: string } | null;

  // AI-driven suggestions and states for 'category' field
  suggestedCategories?: Array<{ label: string; value: string }> | null;
  categoryProcessingState?: FieldProcessingState;

  // AI-driven suggestions and states for 'metadata' field
  suggestedMetadata?: Record<string, string> | null;
  metadataProcessingState?: FieldProcessingState;

  // Global anomaly detection flag for the entire form or critical fields
  anomalyDetected?: boolean;
  anomalyRationale?: string | null;
  anomalyProcessingState?: FieldProcessingState;

  // Timestamps and error tracking for overall AI interaction
  lastAIInteractionTimestamp?: number;
  lastAIError?: string | null;
  // A unique identifier for the last set of AI suggestions, useful for comparison
  aiSuggestionBatchId?: string;
}

/**
 * Defines a single advanced validation rule, which can be synchronous or asynchronous,
 * and optionally depend on AI-generated insights.
 * This allows for highly flexible and intelligent form validation.
 */
export interface AdvancedValidationRule {
  id: string; // Unique identifier for the validation rule
  field: keyof FormValues | keyof EnhancedFormValues | 'form'; // The form field this rule applies to, or 'form' for global validation
  level: "warning" | "error" | "info"; // Severity level of the validation message
  message: (value: any, formValues: FormValues, aiResults?: AIValidationResults) => string; // Function to generate dynamic error message
  validate: (value: any, formValues: FormValues, aiResults?: AIValidationResults) => boolean | Promise<boolean>; // The actual validation logic
  isAsync?: boolean; // True if the validation is an asynchronous operation (e.g., API call, AI call)
  aiDependencies?: Array<keyof AIValidationResults>; // List of AI results required for this rule to execute
  shouldRun?: (formValues: FormValues) => boolean; // Optional predicate to conditionally run the rule
}

/**
 * Represents the aggregated results of various AI-driven analysis functions,
 * used as an input for advanced validation rules.
 */
export interface AIValidationResults {
  anomalyDetection?: { isAnomaly: boolean; rationale: string } | null;
  sentimentAnalysis?: { sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'; score: number; rationale: string } | null;
  suggestedCategories?: FinancialCategory[] | null;
  suggestedMetadata?: Record<string, string> | null;
  // Further AI insights can be added here as the system evolves
}

/**
 * A highly optimized debouncing utility function. Useful for limiting the rate
 * at which AI suggestions or expensive validations are triggered, typically
 * in response to user input.
 * @template F - The type of the function to debounce.
 * @param callback The function to be debounced.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced version of the callback function.
 */
export const debounce = <F extends (...args: any[]) => any>(
  callback: F,
  delay: number,
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function(...args: Parameters<F>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      callback(...args);
      timeout = null; // Reset timeout for garbage collection
    }, delay);
  };
};

/**
 * Represents the base properties for any UI component that integrates AI assistance.
 * This can be extended by specific field props interfaces to add AI capabilities.
 */
export interface AIAssistedFieldBaseProps {
  /** Indicates if AI assistance is currently enabled for this field type (globally or locally). */
  isAIAssistanceEnabled?: boolean;
  /** Callback to trigger AI suggestions for the field, often debounced. */
  onAISuggest?: (field: keyof FormValues | string, value: any, currentFormValues: FormValues) => Promise<void>;
  /** Callback to apply AI suggestions to the form field. */
  onAIApply?: (field: keyof FormValues | string, suggestedValue: any) => void;
  /** Current processing state of the AI for this specific field. */
  aiProcessingState?: FieldProcessingState;
  /** Any AI-generated feedback, error message, or anomaly rationale specific to this field. */
  aiFeedback?: string | null;
  /** Suggested value from AI for this specific field. */
  aiSuggestedValue?: any;
  /** Timestamp of the last AI interaction for this field. */
  lastAISuggestionTimestamp?: number;
}

/**
 * Extends `LedgerAccountFieldProps` to incorporate AI assistance capabilities,
 * allowing UI components to dynamically display AI suggestions, processing states,
 * and integrate AI-driven interactions directly within the form.
 */
export interface AIAssistedLedgerAccountFieldProps extends LedgerAccountFieldProps, AIAssistedFieldBaseProps {
  form: {
    initialValues: FormValues;
    values: EnhancedFormValues; // Uses EnhancedFormValues to access AI-specific state
    errors: Record<string, unknown>;
    touched: Record<string, unknown>;
    setFieldValue: (field: string, value: string | number | boolean | Array<{ label: string; value: string }> | Record<string, string> | null | undefined) => void;
    setFieldTouched: (field: string, isTouched: boolean, shouldValidate?: boolean) => void;
    // Add new methods for AI interaction within formik form context
    setAIProcessingState: (field: keyof EnhancedFormValues, state: FieldProcessingState) => void;
    setAIFeedback: (field: keyof EnhancedFormValues, feedback: string | null) => void;
  };
}


/**
 * A comprehensive and curated list of currency options, including their ISO codes,
 * display labels, typical currency exponents (for decimal precision), and symbols.
 * This extensive list supports internationalization and financial accuracy.
 * It's crucial to remove any duplicate entries and ensure accuracy.
 */
export const CURRENCY_OPTIONS = (function() {
  const currencies = [
    { label: "USD - United States Dollar", value: "USD", exponent: 2, symbol: "$" },
    { label: "EUR - Euro", value: "EUR", exponent: 2, symbol: "€" },
    { label: "GBP - British Pound", value: "GBP", exponent: 2, symbol: "£" },
    { label: "JPY - Japanese Yen", value: "JPY", exponent: 0, symbol: "¥" },
    { label: "CAD - Canadian Dollar", value: "CAD", exponent: 2, symbol: "C$" },
    { label: "AUD - Australian Dollar", value: "AUD", exponent: 2, symbol: "A$" },
    { label: "CHF - Swiss Franc", value: "CHF", exponent: 2, symbol: "CHF" },
    { label: "CNY - Chinese Yuan", value: "CNY", exponent: 2, symbol: "¥" },
    { label: "INR - Indian Rupee", value: "INR", exponent: 2, symbol: "₹" },
    { label: "BRL - Brazilian Real", value: "BRL", exponent: 2, symbol: "R$" },
    { label: "RUB - Russian Ruble", value: "RUB", exponent: 2, symbol: "₽" },
    { label: "ZAR - South African Rand", value: "ZAR", exponent: 2, symbol: "R" },
    { label: "NZD - New Zealand Dollar", value: "NZD", exponent: 2, symbol: "NZ$" },
    { label: "MXN - Mexican Peso", value: "MXN", exponent: 2, symbol: "Mex$" },
    { label: "SGD - Singapore Dollar", value: "SGD", exponent: 2, symbol: "S$" },
    { label: "HKD - Hong Kong Dollar", value: "HKD", exponent: 2, symbol: "HK$" },
    { label: "SEK - Swedish Krona", value: "SEK", exponent: 2, symbol: "kr" },
    { label: "NOK - Norwegian Krone", value: "NOK", exponent: 2, symbol: "kr" },
    { label: "DKK - Danish Krone", value: "DKK", exponent: 2, symbol: "kr." },
    { label: "PLN - Polish Zloty", value: "PLN", exponent: 2, symbol: "zł" },
    { label: "CZK - Czech Koruna", value: "CZK", exponent: 2, symbol: "Kč" },
    { label: "HUF - Hungarian Forint", value: "HUF", exponent: 2, symbol: "Ft" },
    { label: "THB - Thai Baht", value: "THB", exponent: 2, symbol: "฿" },
    { label: "IDR - Indonesian Rupiah", value: "IDR", exponent: 2, symbol: "Rp" },
    { label: "MYR - Malaysian Ringgit", value: "MYR", exponent: 2, symbol: "RM" },
    { label: "PHP - Philippine Peso", value: "PHP", exponent: 2, symbol: "₱" },
    { label: "KRW - South Korean Won", value: "KRW", exponent: 0, symbol: "₩" },
    { label: "TRY - Turkish Lira", value: "TRY", exponent: 2, symbol: "₺" },
    { label: "EGP - Egyptian Pound", value: "EGP", exponent: 2, symbol: "E£" },
    { label: "SAR - Saudi Riyal", value: "SAR", exponent: 2, symbol: "﷼" },
    { label: "AED - UAE Dirham", value: "AED", exponent: 2, symbol: "د.إ" },
    { label: "CLP - Chilean Peso", value: "CLP", exponent: 0, symbol: "$" },
    { label: "COP - Colombian Peso", value: "COP", exponent: 0, symbol: "$" },
    { label: "PEN - Peruvian Sol", value: "PEN", exponent: 2, symbol: "S/." },
    { label: "ARS - Argentine Peso", value: "ARS", exponent: 2, symbol: "$" },
    { label: "VND - Vietnamese Dong", value: "VND", exponent: 0, symbol: "₫" },
    { label: "NGN - Nigerian Naira", value: "NGN", exponent: 2, symbol: "₦" },
    { label: "KES - Kenyan Shilling", value: "KES", exponent: 2, symbol: "KSh" },
    { label: "GHS - Ghanaian Cedi", value: "GHS", exponent: 2, symbol: "GH₵" },
    { label: "UAH - Ukrainian Hryvnia", value: "UAH", exponent: 2, symbol: "₴" },
    { label: "CRC - Costa Rican Colón", value: "CRC", exponent: 2, symbol: "₡" },
    { label: "DOP - Dominican Peso", value: "DOP", exponent: 2, symbol: "RD$" },
    { label: "GTQ - Guatemalan Quetzal", value: "GTQ", exponent: 2, symbol: "Q" },
    { label: "HNL - Honduran Lempira", value: "HNL", exponent: 2, symbol: "L" },
    { label: "NIO - Nicaraguan Córdoba", value: "NIO", exponent: 2, symbol: "C$" },
    { label: "PAB - Panamanian Balboa", value: "PAB", exponent: 2, symbol: "B/." },
    { label: "PYG - Paraguayan Guarani", value: "PYG", exponent: 0, symbol: "₲" },
    { label: "UYU - Uruguayan Peso", value: "UYU", exponent: 2, symbol: "$U" },
    { label: "VES - Venezuelan Bolívar Soberano", value: "VES", exponent: 2, symbol: "Bs.S" }, // Modern Venezuela currency
    { label: "XBT - Bitcoin", value: "XBT", exponent: 8, symbol: "₿" }, // Cryptocurrency example
    { label: "ETH - Ethereum", value: "ETH", exponent: 18, symbol: "Ξ" }, // Cryptocurrency example
    { label: "XAU - Gold (Troy Ounce)", value: "XAU", exponent: 2, symbol: "XAU" }, // Commodity example
    { label: "XDR - IMF Special Drawing Rights", value: "XDR", exponent: 2, symbol: "SDR" }, // International monetary fund
    { label: "KWD - Kuwaiti Dinar", value: "KWD", exponent: 3, symbol: "KD" }, // High value currency
    { label: "BHD - Bahraini Dinar", value: "BHD", exponent: 3, symbol: "BD" },
    { label: "OMR - Omani Rial", value: "OMR", exponent: 3, symbol: "OMR" },
    { label: "JOD - Jordanian Dinar", value: "JOD", exponent: 3, symbol: "JD" },
    { label: "TND - Tunisian Dinar", value: "TND", exponent: 3, symbol: "DT" },
    { label: "LBP - Lebanese Pound", value: "LBP", exponent: 2, symbol: "ل.ل" },
    { label: "ISK - Icelandic Króna", value: "ISK", exponent: 0, symbol: "kr" },
    { label: "VUV - Vanuatu Vatu", value: "VUV", exponent: 0, symbol: "VT" },
    { label: "KMF - Comorian Franc", value: "KMF", exponent: 0, symbol: "CF" },
    { label: "MGA - Malagasy Ariary", value: "MGA", exponent: 2, symbol: "Ar" },
    { label: "RWF - Rwandan Franc", value: "RWF", exponent: 0, symbol: "RF" },
    { label: "UGX - Ugandan Shilling", value: "UGX", exponent: 0, symbol: "USh" },
    { label: "TZS - Tanzanian Shilling", value: "TZS", exponent: 0, symbol: "TSh" },
    { label: "CDF - Congolese Franc", value: "CDF", exponent: 2, symbol: "FC" },
    { label: "AMD - Armenian Dram", value: "AMD", exponent: 2, symbol: "֏" },
    { label: "GEL - Georgian Lari", value: "GEL", exponent: 2, symbol: "₾" },
    { label: "MDL - Moldovan Leu", value: "MDL", exponent: 2, symbol: "L" },
    { label: "MKD - Macedonian Denar", value: "MKD", exponent: 2, symbol: "ден" },
    { label: "RSD - Serbian Dinar", value: "RSD", exponent: 2, symbol: "дин." },
    { label: "AZN - Azerbaijani Manat", value: "AZN", exponent: 2, symbol: "₼" },
    { label: "KGS - Kyrgyzstani Som", value: "KGS", exponent: 2, symbol: "сом" },
    { label: "UZS - Uzbekistani Som", value: "UZS", exponent: 2, symbol: "лв" },
    { label: "TJS - Tajikistani Somoni", value: "TJS", exponent: 2, symbol: "ЅМ" },
    { label: "TMT - Turkmenistani Manat", value: "TMT", exponent: 2, symbol: "m" },
    { label: "XAF - CFA Franc BEAC", value: "XAF", exponent: 0, symbol: "FCFA" },
    { label: "XOF - CFA Franc BCEAO", value: "XOF", exponent: 0, symbol: "CFA" },
    { label: "XCD - East Caribbean Dollar", value: "XCD", exponent: 2, symbol: "$" },
    { label: "BBD - Barbadian Dollar", value: "BBD", exponent: 2, symbol: "$" },
    { label: "BZD - Belize Dollar", value: "BZD", exponent: 2, symbol: "BZ$" },
    { label: "GIP - Gibraltar Pound", value: "GIP", exponent: 2, symbol: "£" },
    { label: "FKP - Falkland Islands Pound", value: "FKP", exponent: 2, symbol: "£" },
    { label: "SHP - Saint Helena Pound", value: "SHP", exponent: 2, symbol: "£" },
    { label: "TVD - Tuvaluan Dollar", value: "TVD", exponent: 2, symbol: "$" },
    { label: "WST - Samoan Tala", value: "WST", exponent: 2, symbol: "WS$" },
    { label: "SBD - Solomon Islands Dollar", value: "SBD", exponent: 2, symbol: "SI$" },
    { label: "PGK - Papua New Guinean Kina", value: "PGK", exponent: 2, symbol: "K" },
    { label: "TOP - Tongan Paʻanga", value: "TOP", exponent: 2, symbol: "T$" },
    { label: "LAK - Lao Kip", value: "LAK", exponent: 0, symbol: "₭" },
    { label: "MMK - Myanmar Kyat", value: "MMK", exponent: 0, symbol: "Ks" },
    { label: "KZT - Kazakhstani Tenge", value: "KZT", exponent: 2, symbol: "₸" },
    { label: "MNT - Mongolian Tögrög", value: "MNT", exponent: 2, symbol: "₮" },
    { label: "BTN - Bhutanese Ngultrum", value: "BTN", exponent: 2, symbol: "Nu." },
    { label: "NPR - Nepalese Rupee", value: "NPR", exponent: 2, symbol: "₨" },
    { label: "LKR - Sri Lankan Rupee", value: "LKR", exponent: 2, symbol: "Rs" },
    { label: "PKR - Pakistani Rupee", value: "PKR", exponent: 2, symbol: "₨" },
    { label: "IRR - Iranian Rial", value: "IRR", exponent: 0, symbol: "﷼" },
    { label: "IQD - Iraqi Dinar", value: "IQD", exponent: 3, symbol: "ع.د" },
    { label: "SYP - Syrian Pound", value: "SYP", exponent: 2, symbol: "£S" },
    { label: "LYD - Libyan Dinar", value: "LYD", exponent: 3, symbol: "LD" },
    { label: "DZD - Algerian Dinar", value: "DZD", exponent: 2, symbol: "DA" },
    { label: "MAD - Moroccan Dirham", value: "MAD", exponent: 2, symbol: "د.م." },
    { label: "MRU - Mauritanian Ouguiya", value: "MRU", exponent: 2, symbol: "UM" },
    { label: "SDG - Sudanese Pound", value: "SDG", exponent: 2, symbol: "ج.س." },
    { label: "SSP - South Sudanese Pound", value: "SSP", exponent: 2, symbol: "£" },
    { label: "ETB - Ethiopian Birr", value: "ETB", exponent: 2, symbol: "Br" },
    { label: "ERN - Eritrean Nakfa", value: "ERN", exponent: 2, symbol: "Nfk" },
    { label: "DJF - Djiboutian Franc", value: "DJF", exponent: 0, symbol: "Fdj" },
    { label: "SOS - Somali Shilling", value: "SOS", exponent: 2, symbol: "Sh.So." },
    { label: "AFA - Afghan Afghani (obsolete)", value: "AFA", exponent: 2, symbol: "Af" },
    { label: "ALL - Albanian Lek", value: "ALL", exponent: 2, symbol: "L" },
    { label: "AOA - Angolan Kwanza", value: "AOA", exponent: 2, symbol: "Kz" },
    { label: "AWG - Aruban Florin", value: "AWG", exponent: 2, symbol: "ƒ" },
    { label: "BAM - Bosnia-Herzegovina Convertible Mark", value: "BAM", exponent: 2, symbol: "KM" },
    { label: "BDT - Bangladeshi Taka", value: "BDT", exponent: 2, symbol: "৳" },
    { label: "BGN - Bulgarian Lev", value: "BGN", exponent: 2, symbol: "лв" },
    { label: "BIF - Burundian Franc", value: "BIF", exponent: 0, symbol: "FBu" },
    { label: "BMD - Bermudan Dollar", value: "BMD", exponent: 2, symbol: "$" },
    { label: "BND - Brunei Dollar", value: "BND", exponent: 2, symbol: "$" },
    { label: "BOB - Bolivian Boliviano", value: "BOB", exponent: 2, symbol: "Bs." },
    { label: "BSD - Bahamian Dollar", value: "BSD", exponent: 2, symbol: "$" },
    { label: "BWP - Botswanan Pula", value: "BWP", exponent: 2, symbol: "P" },
    { label: "BYN - Belarusian Ruble", value: "BYN", exponent: 2, symbol: "Br" },
    { label: "CUP - Cuban Peso", value: "CUP", exponent: 2, symbol: "₱" },
    { label: "CVE - Cape Verdean Escudo", value: "CVE", exponent: 2, symbol: "Esc" },
    { label: "FJD - Fijian Dollar", value: "FJD", exponent: 2, symbol: "FJ$" },
    { label: "GMD - Gambian Dalasi", value: "GMD", exponent: 2, symbol: "D" },
    { label: "GNF - Guinean Franc", value: "GNF", exponent: 0, symbol: "FG" },
    { label: "GYD - Guyanese Dollar", value: "GYD", exponent: 2, symbol: "$" },
    { label: "HTG - Haitian Gourde", value: "HTG", exponent: 2, symbol: "G" },
    { label: "JMD - Jamaican Dollar", value: "JMD", exponent: 2, symbol: "J$" },
    { label: "KPW - North Korean Won", value: "KPW", exponent: 2, symbol: "₩" },
    { label: "LRD - Liberian Dollar", value: "LRD", exponent: 2, symbol: "$" },
    { label: "LSL - Lesotho Loti", value: "LSL", exponent: 2, symbol: "L" },
    { label: "MOP - Macanese Pataca", value: "MOP", exponent: 2, symbol: "MOP$" },
    { label: "MUR - Mauritian Rupee", value: "MUR", exponent: 2, symbol: "₨" },
    { label: "MVR - Maldivian Rufiyaa", value: "MVR", exponent: 2, symbol: "Rf" },
    { label: "MWK - Malawian Kwacha", value: "MWK", exponent: 2, symbol: "MK" },
    { label: "MZN - Mozambican Metical", value: "MZN", exponent: 2, symbol: "MT" },
    { label: "NAD - Namibian Dollar", value: "NAD", exponent: 2, symbol: "$" },
    { label: "QAR - Qatari Rial", value: "QAR", exponent: 2, symbol: "QR" },
    { label: "SCR - Seychellois Rupee", value: "SCR", exponent: 2, symbol: "₨" },
    { label: "SLL - Sierra Leonean Leone", value: "SLL", exponent: 2, symbol: "Le" },
    { label: "SRD - Surinamese Dollar", value: "SRD", exponent: 2, symbol: "$" },
    { label: "SVC - Salvadoran Colón", value: "SVC", exponent: 2, symbol: "₡" },
    { label: "SZL - Swazi Lilangeni", value: "SZL", exponent: 2, symbol: "E" },
    { label: "TTD - Trinidad and Tobago Dollar", value: "TTD", exponent: 2, symbol: "TT$" },
    { label: "YER - Yemeni Rial", value: "YER", exponent: 2, symbol: "﷼" },
    { label: "ZMW - Zambian Kwacha", value: "ZMW", exponent: 2, symbol: "ZK" },
    { label: "ZWL - Zimbabwean Dollar", value: "ZWL", exponent: 2, symbol: "Z$" },
    // Add the custom currency option at the end
    { label: CUSTOM_CURRENCY_OPTION, value: CUSTOM_CURRENCY_OPTION, exponent: null, symbol: "¤" },
  ];

  // Filter out duplicates based on 'value' to ensure uniqueness.
  const uniqueCurrencies = Array.from(new Map(currencies.map(item => [item.value, item])).values());

  return uniqueCurrencies;
})();


/**
 * Maps the `FinancialCategory` enum values to user-friendly labels for display
 * in UI components like dropdowns or multi-select fields.
 * The labels are formatted with proper capitalization and spaces.
 */
export const FINANCIAL_CATEGORY_OPTIONS = Object.values(FinancialCategory).map(category => ({
  label: category.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
  value: category,
}));

/**
 * Defines the allowed normal balance types for a ledger account.
 * This enum ensures type safety and consistency in specifying whether an
 * increase in an account is recorded as a debit or a credit.
 */
export enum NormalBalanceType {
  DEBIT = "DEBIT", // Accounts that typically increase with debits (e.g., Assets, Expenses)
  CREDIT = "CREDIT", // Accounts that typically increase with credits (e.g., Liabilities, Equity, Revenue)
}

/**
 * Provides a set of options for UI components to select the normal balance type.
 * This is derived from the `NormalBalanceType` enum for consistency.
 */
export const NORMAL_BALANCE_OPTIONS = [
  { label: "Debit", value: NormalBalanceType.DEBIT },
  { label: "Credit", value: NormalBalanceType.CREDIT },
];

/**
 * Utility function to validate the uniqueness of an account name within a given ledger.
 * This is a placeholder for a real API call that would query the backend for existing account names.
 * Simulates network delay and returns a mock result.
 * @param ledgerId The ID of the ledger to check within.
 * @param accountName The account name to check for uniqueness.
 * @param currentAccountId Optional: The ID of the account being edited; its own name should be ignored during uniqueness check.
 * @returns A promise that resolves to `true` if the name is unique (or belongs to `currentAccountId`), `false` otherwise.
 */
export async function validateAccountNameUniqueness(
  ledgerId: string,
  accountName: string,
  currentAccountId?: string,
): Promise<boolean> {
  // Simulate an API call delay to mimic network latency in a real application
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a production-grade application, this would typically involve:
  // 1. Making an authenticated API request to a backend service:
  //    `const response = await fetch(`/api/ledgers/${ledgerId}/accounts/check-name?name=${encodeURIComponent(accountName)}&excludeId=${currentAccountId || ''}`);`
  // 2. Parsing the response to determine uniqueness:
  //    `const data = await response.json();`
  //    `return data.isUnique;`

  // For demonstration purposes, we use mock data to simulate existing account names.
  const existingAccountNames = new Map<string, string>([
    ["Cash Account", "acc-1001"],
    ["Accounts Receivable", "acc-1201"],
    ["Sales Revenue", "acc-4001"],
    ["Rent Expense", "acc-6001"],
    ["Payroll Liabilities", "acc-2101"],
    ["Owner's Equity", "acc-3001"],
  ]);

  const normalizedAccountName = accountName.trim().toLowerCase();
  for (const [name, id] of existingAccountNames.entries()) {
    if (name.toLowerCase() === normalizedAccountName) {
      // If the name is taken, check if it's the current account being edited.
      return id === currentAccountId;
    }
  }

  // If the loop completes, the name is unique within the mock data.
  return true;
}

/**
 * A comprehensive and highly configurable array of `AdvancedValidationRule` objects.
 * This schema defines all the validation logic for the ledger account form,
 * combining standard field validations with dynamic, AI-powered checks.
 * Rules can be synchronous or asynchronous and can leverage `AIValidationResults`.
 */
export const LEDGER_ACCOUNT_VALIDATION_RULES: AdvancedValidationRule[] = [
  // Basic Field Validation
  {
    id: "nameRequired",
    field: "name",
    level: "error",
    message: () => "Account name is a mandatory field.",
    validate: (value: string) => value.trim().length > 0,
    shouldRun: (formValues) => formValues.name.trim().length === 0 || formValues.nameProcessingState !== FieldProcessingState.PROCESSING,
  },
  {
    id: "nameMinLength",
    field: "name",
    level: "error",
    message: () => "Account name must consist of at least 3 characters for clarity.",
    validate: (value: string) => value.trim().length >= 3,
  },
  {
    id: "nameMaxLength",
    field: "name",
    level: "error",
    message: () => "Account name cannot exceed 100 characters to maintain brevity.",
    validate: (value: string) => value.trim().length <= 100,
  },
  {
    id: "descriptionMaxLength",
    field: "description",
    level: "warning",
    message: () => "The description is quite extensive; consider summarizing for conciseness (maximum 500 characters recommended).",
    validate: (value: string) => value.length <= 500,
  },
  {
    id: "currencyRequired",
    field: "currency",
    level: "error",
    message: () => "A valid currency selection is required for all ledger accounts.",
    validate: (value: string) => value.trim().length > 0,
  },
  {
    id: "customCurrencyRequired",
    field: "customCurrency",
    level: "error",
    message: () => "If 'Custom Currency' is selected, its symbol must be provided.",
    validate: (value: string, formValues: FormValues) =>
      formValues.currency === CUSTOM_CURRENCY_OPTION ? value.trim().length > 0 : true,
    shouldRun: (formValues) => formValues.currency === CUSTOM_CURRENCY_OPTION,
  },
  {
    id: "currencyExponentRequired",
    field: "currencyExponent",
    level: "error",
    message: () => "Currency exponent (decimal places) is required and must be between 0 and 18.",
    validate: (value: number | null) => value !== null && value >= 0 && value <= 18, // Max 18 for high-precision cryptocurrencies
  },
  {
    id: "normalBalanceRequired",
    field: "normalBalance",
    level: "error",
    message: () => "The normal balance type (Debit or Credit) is a mandatory selection.",
    validate: (value: string) => value.trim().length > 0 && Object.values(NormalBalanceType).includes(value as NormalBalanceType),
  },
  {
    id: "categoryRequired",
    field: "category",
    level: "error",
    message: () => "At least one financial category must be assigned to the ledger account.",
    validate: (value: Array<{ label: string; value: string }>) => value && value.length > 0,
  },
  {
    id: "ledgerIdRequired",
    field: "ledgerId",
    level: "error",
    message: () => "The ledger ID is essential for account assignment.",
    validate: (value: string) => value.trim().length > 0,
  },

  // AI-Powered Validation Rules
  {
    id: "categoryInconsistency",
    field: "category",
    level: "warning",
    message: (value: any, formValues: FormValues, aiResults?: AIValidationResults) =>
      aiResults?.suggestedCategories && aiResults.suggestedCategories.length > 0 &&
        !value.some((cat: { label: string; value: string }) => aiResults.suggestedCategories?.includes(cat.value as FinancialCategory))
        ? `AI suggests categories like: ${aiResults.suggestedCategories.join(', ')}. Your selection might be inconsistent.`
        : "Category selection appears consistent with AI insights.",
    validate: (value: Array<{ label: string; value: string }>, formValues: FormValues, aiResults?: AIValidationResults) => {
      // If AI category suggestion is disabled or no suggestions are made, this rule is not applicable.
      if (!geminiAIClient.config.featureFlags.enableCategorySuggestion || !aiResults?.suggestedCategories || aiResults.suggestedCategories.length === 0) {
        return true;
      }
      // Check if at least one selected category is among the AI's suggestions.
      return value.some(selectedCat => aiResults.suggestedCategories?.includes(selectedCat.value as FinancialCategory));
    },
    aiDependencies: ["suggestedCategories"],
    shouldRun: (formValues) => geminiAIClient.config.featureFlags.enableCategorySuggestion && formValues.categoryProcessingState === FieldProcessingState.SUGGESTED,
  },
  {
    id: "accountNameUniqueness",
    field: "name",
    level: "error",
    message: (value: string) => `The account name "${value}" is already in use within this ledger. Please choose a unique name.`,
    validate: async (value: string, formValues: FormValues) => {
      if (!value.trim()) return true; // Handled by nameRequired
      return await validateAccountNameUniqueness(formValues.ledgerId, value, formValues.id);
    },
    isAsync: true,
    shouldRun: (formValues) => formValues.name.trim().length >= 3 && formValues.name.trim().length <= 100,
  },
  {
    id: "aiAnomalyFlag",
    field: "anomalyDetected", // This targets a derived AI field in EnhancedFormValues
    level: "error", // Elevated to error for critical anomalies
    message: (value: boolean, formValues: FormValues, aiResults?: AIValidationResults) =>
      aiResults?.anomalyDetection?.isAnomaly
        ? `CRITICAL ANOMALY DETECTED by AI: ${aiResults.anomalyDetection.rationale}. This account requires immediate review.`
        : "No significant anomalies detected by AI.",
    validate: (value: boolean, formValues: FormValues, aiResults?: AIValidationResults) =>
      !(aiResults?.anomalyDetection?.isAnomaly), // Valid if no anomaly or feature disabled
    aiDependencies: ["anomalyDetection"],
    shouldRun: (formValues) => geminiAIClient.config.featureFlags.enableAnomalyDetection && formValues.anomalyProcessingState === FieldProcessingState.ANOMALY_DETECTED,
  },
  {
    id: "descriptionNegativeSentiment",
    field: "description",
    level: "warning",
    message: (value: string, formValues: FormValues, aiResults?: AIValidationResults) => {
      const sentiment = aiResults?.sentimentAnalysis?.sentiment;
      if (sentiment === 'negative' || sentiment === 'mixed') {
        return `AI detected '${sentiment.toUpperCase()}' sentiment in description: ${aiResults.sentimentAnalysis?.rationale}. Consider revising for neutral tone.`;
      }
      return `AI sentiment: ${sentiment || 'neutral'}.`;
    },
    validate: (value: string, formValues: FormValues, aiResults?: AIValidationResults) => {
      const sentiment = aiResults?.sentimentAnalysis?.sentiment;
      return sentiment !== 'negative' && sentiment !== 'mixed'; // Valid if not negative or mixed
    },
    aiDependencies: ["sentimentAnalysis"],
    shouldRun: (formValues) => geminiAIClient.config.featureFlags.enableSentimentAnalysis && formValues.descriptionProcessingState === FieldProcessingState.SUGGESTED && formValues.description && formValues.description.trim().length > 10,
  },
  {
    id: "metadataIncomplete",
    field: "metadata",
    level: "info",
    message: (value: Record<string, string>, formValues: FormValues, aiResults?: AIValidationResults) => {
      if (geminiAIClient.config.featureFlags.enableMetadataTagging && aiResults?.suggestedMetadata && Object.keys(aiResults.suggestedMetadata).length > Object.keys(value).length) {
        const missingKeys = Object.keys(aiResults.suggestedMetadata).filter(key => !(key in value));
        if (missingKeys.length > 0) {
          return `AI suggests additional metadata tags like: ${missingKeys.join(', ')}. Consider adding them for better reporting.`;
        }
      }
      return "Metadata appears comprehensive or no additional AI suggestions.";
    },
    validate: (value: Record<string, string>, formValues: FormValues, aiResults?: AIValidationResults) => {
      if (!geminiAIClient.config.featureFlags.enableMetadataTagging || !aiResults?.suggestedMetadata) return true;
      // This rule is more of an 'info' or 'suggestion' and doesn't strictly invalidate.
      return Object.keys(aiResults.suggestedMetadata).every(key => key in value);
    },
    aiDependencies: ["suggestedMetadata"],
    shouldRun: (formValues) => geminiAIClient.config.featureFlags.enableMetadataTagging && formValues.metadataProcessingState === FieldProcessingState.SUGGESTED,
  },
  // Global form level validations (could check consistency across multiple fields)
  {
    id: "globalCategoryBalanceConsistency",
    field: "form", // Applies to the form as a whole
    level: "warning",
    message: (value: any, formValues: FormValues, aiResults?: AIValidationResults) => {
      const primaryCategory = formValues.category?.[0]?.value;
      const normalBalance = formValues.normalBalance;
      if (primaryCategory && normalBalance) {
        const isAssetOrExpense = [FinancialCategory.ASSET, FinancialCategory.EXPENSE, FinancialCategory.FIXED_ASSETS, FinancialCategory.INVENTORY, FinancialCategory.PREPAID_EXPENSES, FinancialCategory.ACCOUNTS_RECEIVABLE, FinancialCategory.BANK_ACCOUNT].includes(primaryCategory as FinancialCategory);
        const isLiabilityEquityRevenue = [FinancialCategory.LIABILITY, FinancialCategory.EQUITY, FinancialCategory.REVENUE, FinancialCategory.OTHER_INCOME, FinancialCategory.ACCOUNTS_PAYABLE, FinancialCategory.LONG_TERM_DEBT, FinancialCategory.SHORT_TERM_DEBT, FinancialCategory.RETAINED_EARNINGS].includes(primaryCategory as FinancialCategory);

        if (isAssetOrExpense && normalBalance === NormalBalanceType.CREDIT) {
          return `Warning: An account primarily classified as "${primaryCategory}" typically has a DEBIT normal balance. Current setting is CREDIT.`;
        }
        if (isLiabilityEquityRevenue && normalBalance === NormalBalanceType.DEBIT) {
          return `Warning: An account primarily classified as "${primaryCategory}" typically has a CREDIT normal balance. Current setting is DEBIT.`;
        }
      }
      return "Primary category and normal balance are typically consistent.";
    },
    validate: (value: any, formValues: FormValues) => {
      const primaryCategory = formValues.category?.[0]?.value;
      const normalBalance = formValues.normalBalance;

      if (!primaryCategory || !normalBalance) return true; // Cannot validate if data is missing

      const isAssetOrExpense = [FinancialCategory.ASSET, FinancialCategory.EXPENSE, FinancialCategory.FIXED_ASSETS, FinancialCategory.INVENTORY, FinancialCategory.PREPAID_EXPENSES, FinancialCategory.ACCOUNTS_RECEIVABLE, FinancialCategory.BANK_ACCOUNT].includes(primaryCategory as FinancialCategory);
      const isLiabilityEquityRevenue = [FinancialCategory.LIABILITY, FinancialCategory.EQUITY, FinancialCategory.REVENUE, FinancialCategory.OTHER_INCOME, FinancialCategory.ACCOUNTS_PAYABLE, FinancialCategory.LONG_TERM_DEBT, FinancialCategory.SHORT_TERM_DEBT, FinancialCategory.RETAINED_EARNINGS].includes(primaryCategory as FinancialCategory);

      if (isAssetOrExpense && normalBalance === NormalBalanceType.CREDIT) return false;
      if (isLiabilityEquityRevenue && normalBalance === NormalBalanceType.DEBIT) return false;

      return true;
    },
    shouldRun: (formValues) => formValues.category.length > 0 && !!formValues.normalBalance,
  },
];

/**
 * Executes a set of advanced validation rules against form values,
 * optionally leveraging pre-fetched AI insights. This function is designed
 * to be robust, handling both synchronous and asynchronous validation rules.
 * @param values The current `FormValues` (or `EnhancedFormValues`) object from the form.
 * @param currentErrors The existing errors object, typically from a form management library, to be augmented.
 * @param aiResults Optional `AIValidationResults` containing AI-driven insights relevant for validation.
 * @param rules The array of `AdvancedValidationRule` to apply; defaults to `LEDGER_ACCOUNT_VALIDATION_RULES`.
 * @returns A Promise resolving to a `Record<string, string | string[]>` of validation messages, mapped by field name.
 */
export async function runAdvancedValidations(
  values: FormValues,
  currentErrors: Record<string, string | string[] | undefined>,
  aiResults?: AIValidationResults,
  rules: AdvancedValidationRule[] = LEDGER_ACCOUNT_VALIDATION_RULES,
): Promise<Record<string, string | string[]>> {
  aiLogger.debug("Running advanced validations.", { values, aiResults });
  const newErrors: Record<string, string | string[]> = { ...currentErrors };

  const validationPromises: Promise<void>[] = [];

  for (const rule of rules) {
    // Check if the rule should be run based on its 'shouldRun' predicate
    if (rule.shouldRun && !rule.shouldRun(values)) {
      aiLogger.debug(`Skipping rule '${rule.id}' based on shouldRun predicate.`, { rule });
      continue;
    }

    // Check for AI dependencies
    if (rule.aiDependencies && aiResults) {
      const allDependenciesMet = rule.aiDependencies.every(dep =>
        aiResults[dep] !== undefined && aiResults[dep] !== null
      );
      if (!allDependenciesMet) {
        aiLogger.debug(`Skipping AI-dependent rule '${rule.id}' as AI results are not fully available.`, { rule, aiResults });
        continue;
      }
    }

    const fieldVal = rule.field === 'form' ? values : (values as any)[rule.field];

    if (rule.isAsync) {
      validationPromises.push((async () => {
        try {
          const isValid = await rule.validate(fieldVal, values, aiResults);
          if (!isValid) {
            newErrors[rule.field] = rule.message(fieldVal, values, aiResults);
            aiLogger.warn(`Async validation error for field '${String(rule.field)}' with rule '${rule.id}'.`, { value: fieldVal, message: newErrors[rule.field] });
          } else if (newErrors[rule.field] && typeof newErrors[rule.field] === 'string' && newErrors[rule.field] === rule.message(fieldVal, values, aiResults)) {
            // Clear specific error if it was for this async rule and now it's valid
            delete newErrors[rule.field];
          }
        } catch (error: any) {
          aiLogger.error(`Error during async validation rule '${rule.id}'.`, { error, field: rule.field });
          newErrors[rule.field] = `Validation failed due to an internal error: ${error.message}`;
        }
      })());
    } else {
      const isValid = rule.validate(fieldVal, values, aiResults);
      if (!isValid) {
        newErrors[rule.field] = rule.message(fieldVal, values, aiResults);
        aiLogger.warn(`Sync validation error for field '${String(rule.field)}' with rule '${rule.id}'.`, { value: fieldVal, message: newErrors[rule.field] });
      } else if (newErrors[rule.field] && typeof newErrors[rule.field] === 'string' && newErrors[rule.field] === rule.message(fieldVal, values, aiResults)) {
        delete newErrors[rule.field];
      }
    }
  }

  await Promise.all(validationPromises); // Wait for all async validations to complete
  aiLogger.debug("Advanced validations completed.", { newErrors });
  return newErrors;
}

/**
 * Orchestrates all AI-driven suggestions and analyses for the ledger account form.
 * This function consolidates calls to the Gemini AI client, manages processing states,
 * and handles errors gracefully, ensuring a robust AI integration experience.
 * @param values The current `FormValues` object, used as context for AI prompts.
 * @returns A Promise resolving to a partial `EnhancedFormValues` object containing
 *          all AI suggestions, processing states, and any encountered errors.
 */
export async function fetchAllAISuggestions(values: FormValues): Promise<Partial<EnhancedFormValues>> {
  const aiUpdates: Partial<EnhancedFormValues> = {
    lastAIInteractionTimestamp: Date.now(),
    lastAIError: null,
    aiSuggestionBatchId: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  };

  const updateFieldState = (field: keyof EnhancedFormValues, state: FieldProcessingState) => {
    (aiUpdates as any)[`${field}ProcessingState`] = state;
  };

  try {
    aiLogger.info("Initiating fetch for all AI suggestions...", { accountName: values.name, ledgerId: values.ledgerId });

    // --- Description Generation ---
    updateFieldState('description', FieldProcessingState.PROCESSING);
    const generatedDescriptionPromise = geminiAIClient.generateAccountDescription(values.name, values.category.map(c => c.value).join(', ') || FinancialCategory.UNCATEGORIZED, values.description);

    // --- Category Suggestion ---
    updateFieldState('category', FieldProcessingState.PROCESSING);
    const suggestedCategoriesPromise = geminiAIClient.suggestAccountCategory(values.name, values.description);

    // --- Metadata Tagging ---
    updateFieldState('metadata', FieldProcessingState.PROCESSING);
    const suggestedMetadataPromise = geminiAIClient.suggestMetadataTags(values.name, values.description, values.metadata);

    // --- Anomaly Detection ---
    updateFieldState('anomalyDetected', FieldProcessingState.PROCESSING);
    const anomalyResultPromise = geminiAIClient.performAnomalyDetection(values);

    // --- Sentiment Analysis ---
    // Note: Sentiment Analysis can run in parallel, or after description generation if it relies on the *new* description.
    // Here, we run it on the *current* form description initially, but then could re-run on suggested description.
    const sentimentResultPromise = geminiAIClient.analyzeDescriptionSentiment(values.description);

    // Await all promises concurrently for performance
    const [generatedDescription, suggestedCategories, suggestedMetadata, anomalyResult, sentimentResult] =
      await Promise.allSettled([
        generatedDescriptionPromise,
        suggestedCategoriesPromise,
        suggestedMetadataPromise,
        anomalyResultPromise,
        sentimentResultPromise,
      ]);

    // Process Description Generation Result
    if (generatedDescription.status === 'fulfilled' && generatedDescription.value) {
      aiUpdates.suggestedDescription = generatedDescription.value;
      updateFieldState('description', FieldProcessingState.SUGGESTED);
    } else if (generatedDescription.status === 'rejected') {
      aiLogger.error("Failed to generate description via AI.", { error: generatedDescription.reason });
      aiUpdates.lastAIError = generatedDescription.reason instanceof GeminiAIError ? generatedDescription.reason.message : "Description generation failed.";
      updateFieldState('description', FieldProcessingState.ERROR);
    } else {
      updateFieldState('description', FieldProcessingState.IDLE);
    }

    // Process Category Suggestion Result
    if (suggestedCategories.status === 'fulfilled' && suggestedCategories.value) {
      aiUpdates.suggestedCategories = suggestedCategories.value.map(cat => ({
        label: cat.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
        value: cat,
      }));
      updateFieldState('category', FieldProcessingState.SUGGESTED);
    } else if (suggestedCategories.status === 'rejected') {
      aiLogger.error("Failed to suggest categories via AI.", { error: suggestedCategories.reason });
      aiUpdates.lastAIError = aiUpdates.lastAIError || (suggestedCategories.reason instanceof GeminiAIError ? suggestedCategories.reason.message : "Category suggestion failed.");
      updateFieldState('category', FieldProcessingState.ERROR);
    } else {
      updateFieldState('category', FieldProcessingState.IDLE);
    }

    // Process Metadata Tagging Result
    if (suggestedMetadata.status === 'fulfilled' && suggestedMetadata.value) {
      aiUpdates.suggestedMetadata = suggestedMetadata.value;
      updateFieldState('metadata', FieldProcessingState.SUGGESTED);
    } else if (suggestedMetadata.status === 'rejected') {
      aiLogger.error("Failed to suggest metadata tags via AI.", { error: suggestedMetadata.reason });
      aiUpdates.lastAIError = aiUpdates.lastAIError || (suggestedMetadata.reason instanceof GeminiAIError ? suggestedMetadata.reason.message : "Metadata tagging failed.");
      updateFieldState('metadata', FieldProcessingState.ERROR);
    } else {
      updateFieldState('metadata', FieldProcessingState.IDLE);
    }

    // Process Anomaly Detection Result
    if (anomalyResult.status === 'fulfilled' && anomalyResult.value) {
      aiUpdates.anomalyDetected = anomalyResult.value.isAnomaly;
      aiUpdates.anomalyRationale = anomalyResult.value.rationale;
      updateFieldState('anomalyDetected', anomalyResult.value.isAnomaly ? FieldProcessingState.ANOMALY_DETECTED : FieldProcessingState.SUGGESTED);
    } else if (anomalyResult.status === 'rejected') {
      aiLogger.error("Failed to perform anomaly detection via AI.", { error: anomalyResult.reason });
      aiUpdates.lastAIError = aiUpdates.lastAIError || (anomalyResult.reason instanceof GeminiAIError ? anomalyResult.reason.message : "Anomaly detection failed.");
      updateFieldState('anomalyDetected', FieldProcessingState.ERROR);
    } else {
      updateFieldState('anomalyDetected', FieldProcessingState.IDLE);
    }

    // Process Sentiment Analysis Result
    if (sentimentResult.status === 'fulfilled' && sentimentResult.value) {
      aiUpdates.descriptionSentiment = sentimentResult.value;
      // If sentiment analysis is the last step for description-related AI, mark its state appropriately.
      if (aiUpdates.descriptionProcessingState !== FieldProcessingState.ERROR) {
        updateFieldState('description', sentimentResult.value.sentiment === 'negative' || sentimentResult.value.sentiment === 'mixed' ? FieldProcessingState.WARNING : FieldProcessingState.SUGGESTED);
      }
    } else if (sentimentResult.status === 'rejected') {
      aiLogger.error("Failed to perform sentiment analysis via AI.", { error: sentimentResult.reason });
      aiUpdates.lastAIError = aiUpdates.lastAIError || (sentimentResult.reason instanceof GeminiAIError ? sentimentResult.reason.message : "Sentiment analysis failed.");
      if (aiUpdates.descriptionProcessingState !== FieldProcessingState.ERROR) {
        updateFieldState('description', FieldProcessingState.ERROR);
      }
    } else {
      if (aiUpdates.descriptionProcessingState !== FieldProcessingState.ERROR) {
        updateFieldState('description', FieldProcessingState.IDLE);
      }
    }

    aiLogger.info("All AI suggestions fetch completed.", { aiUpdates });

  } catch (error: any) {
    aiLogger.error("Critical error during batch AI suggestion fetching.", { error });
    aiUpdates.lastAIError = error instanceof GeminiAIError ? error.message : "An unexpected critical AI error occurred.";

    // Ensure all processing states are set to ERROR if a critical error happens
    updateFieldState('description', FieldProcessingState.ERROR);
    updateFieldState('category', FieldProcessingState.ERROR);
    updateFieldState('metadata', FieldProcessingState.ERROR);
    updateFieldState('anomalyDetected', FieldProcessingState.ERROR);
  } finally {
    // Final check to ensure no field remains in PROCESSING state, default to IDLE if not ERROR/SUGGESTED
    for (const key of Object.keys(aiUpdates)) {
      if (key.endsWith('ProcessingState')) {
        const currentState = (aiUpdates as any)[key];
        if (currentState === FieldProcessingState.PROCESSING) {
          (aiUpdates as any)[key] = FieldProcessingState.IDLE;
        }
      }
    }
  }
  return aiUpdates;
}

/**
 * Initializes a new ledger account with sensible default values, providing a starting point
 * for new account creation forms. This function ensures that all required fields have
 * a preliminary value, enhancing user experience and reducing initial validation errors.
 * @param initialData Optional partial data to override default values, allowing pre-population.
 * @returns A complete `FormValues` object, ready for form display.
 */
export function initializeNewLedgerAccount(initialData?: Partial<FormValues>): FormValues {
  const defaultCurrencyOption = CURRENCY_OPTIONS.find(opt => opt.value === "USD") || CURRENCY_OPTIONS[0];

  return {
    id: initialData?.id || `new-acc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generates a unique ID
    name: initialData?.name || "",
    description: initialData?.description || "",
    currency: initialData?.currency || defaultCurrencyOption.value,
    customCurrency: initialData?.customCurrency || "",
    currencyExponent: initialData?.currencyExponent ?? defaultCurrencyOption.exponent, // Use ?? for nullish coalescing
    normalBalance: initialData?.normalBalance || NormalBalanceType.DEBIT, // Common default
    ledgerId: initialData?.ledgerId || "global-default-ledger", // Placeholder: must be provided by context in real app
    category: initialData?.category || [],
    categoryError: initialData?.categoryError || null,
    metadata: initialData?.metadata || {},
  };
}

/**
 * A sophisticated logging utility class designed for AI interactions within the application.
 * It follows the Singleton pattern to ensure a single, centralized logging mechanism.
 * In a production environment, this logger would integrate with external monitoring and
 * logging services (e.g., Splunk, ELK Stack, AWS CloudWatch, Sentry).
 */
export class AILogger {
  private static instance: AILogger;
  private logs: any[] = []; // In-memory log buffer (for development/debugging)
  private readonly MAX_LOG_BUFFER_SIZE = 1000; // Limit buffer size

  private constructor() {
    // Private constructor to enforce Singleton pattern
  }

  /**
   * Returns the singleton instance of the AILogger.
   * @returns {AILogger} The single instance of the logger.
   */
  public static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  /**
   * Logs a message with a specified level and optional context.
   * This method centralizes logging and can be extended to send logs
   * to various external services.
   * @param level - The severity level of the log message ("info", "warn", "error", "debug").
   * @param message - The main log message.
   * @param context - Optional additional data or objects relevant to the log entry.
   */
  public log(level: "info" | "warn" | "error" | "debug", message: string, context?: Record<string, any>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      context: this.sanitizeContext(context), // Sanitize context to remove sensitive info
      appEnv: process.env.NODE_ENV,
    };

    // Add to in-memory buffer (primarily for development/testing)
    this.logs.push(logEntry);
    if (this.logs.length > this.MAX_LOG_BUFFER_SIZE) {
      this.logs.shift(); // Remove oldest log if buffer is full
    }

    // Console output for immediate feedback
    if (level === "error") {
      console.error(`[AI-LOG][${logEntry.level}] ${message}`, context);
    } else if (level === "warn") {
      console.warn(`[AI-LOG][${logEntry.level}] ${message}`, context);
    } else if (level === "info") {
      console.info(`[AI-LOG][${logEntry.level}] ${message}`, context);
    } else if (level === "debug" && process.env.NODE_ENV === "development") {
      console.log(`[AI-LOG][${logEntry.level}] ${message}`, context);
    }

    // In a real application, implement external logging here (e.g., Sentry, DataDog, Loggly)
    // if (process.env.NODE_ENV === 'production' && level !== 'debug') {
    //   // Example: Sentry.captureMessage(message, { level, extra: context });
    // }
  }

  /**
   * Helper method to sanitize context data before logging,
   * removing potentially sensitive information like API keys.
   * @param context The original context object.
   * @returns A sanitized context object.
   */
  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return context;
    const sanitized = { ...context };
    if (sanitized.apiKey) {
      sanitized.apiKey = '[REDACTED]';
    }
    if (sanitized.payload && sanitized.payload.key) { // For direct payload logging
      sanitized.payload = { ...sanitized.payload, key: '[REDACTED]' };
    }
    // Add more sanitization rules as needed for other sensitive data
    return sanitized;
  }

  /**
   * Retrieves a specified number of the most recent log entries from the buffer.
   * @param count The number of recent logs to retrieve. Defaults to 10.
   * @returns An array of recent log entries.
   */
  public getRecentLogs(count: number = 10): any[] {
    return this.logs.slice(-count);
  }

  // Convenience methods for specific log levels
  public debug(message: string, context?: Record<string, any>) { this.log("debug", message, context); }
  public info(message: string, context?: Record<string, any>) { this.log("info", message, context); }
  public warn(message: string, context?: Record<string, any>) { this.log("warn", message, context); }
  public error(message: string, context?: Record<string, any>) { this.log("error", message, context); }
}

/**
 * The singleton instance of the AILogger, available globally for AI-related logging.
 */
export const aiLogger = AILogger.getInstance();

// --- END: EPIC EXPANSION ---