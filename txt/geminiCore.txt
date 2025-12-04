// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type, GenerateContentResponse, FunctionDeclaration, Modality } from "@google/genai";
import { logError } from './telemetryService';

// FIX: Use VITE_GEMINI_API_KEY consistent with vite.config.ts and .env.local
const API_KEY = process.env.VITE_GEMINI_API_KEY; 
if (!API_KEY) {
  // FIX: Updated error message for consistency.
  throw new Error("API key not found. Please set the VITE_GEMINI_API_KEY environment variable.");
}

/**
 * Interface for optional configuration of the GeminiService.
 * Uses 'any' for types that would normally come from `@google/genai` but
 * are not explicitly imported due to the strict import instruction.
 */
export interface GeminiServiceOptions {
    apiKey?: string;
    defaultModel?: string;
    defaultTemperature?: number;
    defaultSystemInstruction?: string;
    defaultSafetySettings?: any[]; // Represents SafetySetting[]
}

/**
 * Interface for configuring a chat session.
 * Uses 'any' for types that would normally come from `@google/genai`.
 */
export interface ChatSessionConfig {
    model?: string;
    temperature?: number;
    systemInstruction?: string;
    safetySettings?: any[]; // Represents SafetySetting[]
    history?: any[]; // Represents Part[]
}

/**
 * Represents a command response from the AI, potentially including function calls.
 * Enhanced to provide the raw API response for advanced handling.
 */
export interface CommandResponse { 
    text: string; 
    functionCalls?: { name: string; args: any; }[]; 
    rawResponse?: GenerateContentResponse; // Provides access to the full API response
}

/**
 * Helper type for various prompt input formats.
 * Uses 'any' to accommodate `ContentPart[]` from `@google/genai`.
 */
type PromptInput = string | { parts: any[] } | any[]; // Represents ContentPart[]

/**
 * Helper function to normalize prompt input into the `Part[]` format expected by Google GenAI.
 * Uses 'any' for `Part` due to strict import constraints.
 */
const toContentParts = (prompt: PromptInput): any[] => {
    if (typeof prompt === 'string') {
        return [{ text: prompt }];
    } else if (Array.isArray(prompt)) {
        return prompt; // Already in Part[] format
    } else if ('parts' in prompt && Array.isArray(prompt.parts)) {
        return prompt.parts as any[]; // Cast to any[]
    }
    throw new Error('Invalid prompt format. Must be string, { parts: any[] }, or ContentPart[].');
};

/**
 * Manages a single multi-turn chat conversation with the Gemini model.
 * Uses 'any' for types that would normally come from `@google/genai`.
 */
export class GeminiChatSession {
    private _chatSession: any; // Represents ReturnType<GoogleGenAI['getGenerativeModel']>['startChat']
    private _model: string;
    private _systemInstruction?: string;
    private _temperature: number;
    private _safetySettings?: any[]; // Represents SafetySetting[]

    constructor(
        genAI: GoogleGenAI,
        config: ChatSessionConfig = {}
    ) {
        this._model = config.model || 'gemini-2.5-flash';
        this._systemInstruction = config.systemInstruction;
        this._temperature = config.temperature ?? 0.5;
        this._safetySettings = config.safetySettings;

        const modelInstance = genAI.getGenerativeModel({
            model: this._model,
            systemInstruction: this._systemInstruction,
            generationConfig: {
                temperature: this._temperature,
            },
            safetySettings: this._safetySettings,
        });
        this._chatSession = modelInstance.startChat({
            history: config.history || [],
        });
    }

    /**
     * Sends a message to the chat session and returns the full response.
     * @param message The user's message, can be a string or multimodal parts.
     * @param tools Optional array of FunctionDeclaration for tool use.
     * @param safetySettings Optional array of safety settings to override defaults for this message.
     * @returns A Promise resolving to the AI's content generation response.
     */
    public async sendMessage(
        message: string | any[], // Represents string | ContentPart[]
        tools?: FunctionDeclaration[],
        safetySettings?: any[] // Represents SafetySetting[]
    ): Promise<GenerateContentResponse> {
        try {
            const contents: any[] = toContentParts(message);
            const request = {
                contents: contents,
                tools: tools ? [{ functionDeclarations: tools }] : undefined,
                safetySettings: safetySettings || this._safetySettings,
            };
            const result = await this._chatSession.sendMessage(request);
            return result.response;
        } catch (error) {
            logError(error as Error, { chatMessage: message, model: this._model, context: 'chatSession.sendMessage' });
            throw error;
        }
    }

    /**
     * Streams a message to the chat session and yields chunks of the response.
     * @param message The user's message, can be a string or multimodal parts.
     * @param tools Optional array of FunctionDeclaration for tool use.
     * @param safetySettings Optional array of safety settings to override defaults for this message.
     * @yields Chunks of the AI's content generation response.
     */
    public async *streamMessage(
        message: string | any[], // Represents string | ContentPart[]
        tools?: FunctionDeclaration[],
        safetySettings?: any[] // Represents SafetySetting[]
    ): AsyncGenerator<GenerateContentResponse, void, unknown> {
        try {
            const contents: any[] = toContentParts(message);
            const request = {
                contents: contents,
                tools: tools ? [{ functionDeclarations: tools }] : undefined,
                safetySettings: safetySettings || this._safetySettings,
            };
            const result = await this._chatSession.sendMessageStream(request);
            for await (const chunk of result.stream) {
                yield chunk;
            }
        } catch (error) {
            logError(error as Error, { chatMessage: message, model: this._model, context: 'chatSession.streamMessage' });
            // Yield an error response chunk for graceful client handling
            if (error instanceof Error) {
                yield { text: () => `An error occurred while streaming from AI model: ${error.message}` } as GenerateContentResponse;
            } else {
                yield { text: () => "An unknown error occurred while streaming the response." } as GenerateContentResponse;
            }
        }
    }

    /**
     * Retrieves the current chat history.
     * @returns A Promise resolving to an array of Parts representing the chat history.
     */
    public async getHistory(): Promise<any[]> { // Represents Promise<Part[]>
        return await this._chatSession.getHistory();
    }

    /**
     * Clears the chat history, effectively starting a new conversation for the current session.
     * Note: This re-initializes the underlying chat session object to start fresh.
     */
    public clearHistory(): void {
        const modelInstance = this._chatSession._model; // Access the underlying model
        this._chatSession = modelInstance.startChat({ history: [] }); // Start a new empty chat
    }
}

/**
 * The main service class for interacting with the Google Gemini API.
 * Provides methods for various AI functionalities including content generation,
 * image generation, tool use, embeddings, and chat sessions.
 * Uses 'any' for types that would normally come from `@google/genai` but
 * are not explicitly imported due to the strict import instruction.
 */
export class GeminiService {
    private readonly _genAI: GoogleGenAI;
    private readonly _defaultModel: string;
    private readonly _defaultTemperature: number;
    private readonly _defaultSystemInstruction?: string;
    private readonly _defaultSafetySettings?: any[]; // Represents SafetySetting[]

    constructor(options?: GeminiServiceOptions) {
        const apiKey = options?.apiKey || API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable or pass via options.");
        }
        this._genAI = new GoogleGenAI({ apiKey });
        this._defaultModel = options?.defaultModel || 'gemini-2.5-flash';
        this._defaultTemperature = options?.defaultTemperature ?? 0.5;
        this._defaultSystemInstruction = options?.defaultSystemInstruction;
        this._defaultSafetySettings = options?.defaultSafetySettings;
    }

    /**
     * Internal helper to get a GenerativeModel instance without applying default generation config
     * or system instruction here, as these are applied per-request for flexibility.
     */
    private _getGenerativeModel(modelName?: string): any { // Represents ReturnType<GoogleGenAI['getGenerativeModel']>
        return this._genAI.getGenerativeModel({
            model: modelName || this._defaultModel,
        });
    }

    /**
     * Private helper for consistent error logging and throwing.
     */
    private _logAndThrowError(error: unknown, context: Record<string, any>, message: string = "An error occurred during Gemini API call."): never {
        console.error(message, error, context);
        logError(error as Error, context);
        throw error;
    }

    /**
     * Streams content from the AI model based on a prompt and optional configurations.
     * @param prompt The prompt for the AI. Can be a string, or an object with parts, or an array of parts.
     * @param systemInstruction An optional system instruction. Overrides default if provided.
     * @param temperature An optional temperature for creativity. Overrides default if provided.
     * @param model An optional model name. Overrides default if provided.
     * @param safetySettings Optional array of safety settings to override defaults.
     * @yields Chunks of text from the AI's response.
     */
    public async *streamContent(
        prompt: PromptInput,
        systemInstruction?: string,
        temperature?: number,
        model?: string,
        safetySettings?: any[] // Represents SafetySetting[]
    ): AsyncGenerator<string, void, unknown> {
        try {
            const modelInstance = this._getGenerativeModel(model);
            const response = await modelInstance.generateContentStream({
                contents: toContentParts(prompt),
                generationConfig: {
                    temperature: temperature ?? this._defaultTemperature,
                },
                systemInstruction: systemInstruction ?? this._defaultSystemInstruction,
                safetySettings: safetySettings ?? this._defaultSafetySettings,
            });
            for await (const chunk of response.stream) {
                yield chunk.text || ''; // Ensure a string is always yielded
            }
        } catch (error) {
            this._logAndThrowError(error, { prompt, systemInstruction, temperature, model, context: 'streamContent' }, "Error streaming from AI model:");
            if (error instanceof Error) {
                yield `An error occurred while communicating with the AI model: ${error.message}`;
            } else {
                yield "An unknown error occurred while generating the response.";
            }
        }
    }

    /**
     * Generates content from the AI model based on a prompt and optional configurations.
     * @param prompt The prompt for the AI.
     * @param systemInstruction An optional system instruction. Overrides default if provided.
     * @param temperature An optional temperature for creativity. Overrides default if provided.
     * @param model An optional model name. Overrides default if provided.
     * @param safetySettings Optional array of safety settings to override defaults.
     * @returns A Promise resolving to the AI's generated text.
     */
    public async generateContent(
        prompt: string,
        systemInstruction?: string,
        temperature?: number,
        model?: string,
        safetySettings?: any[] // Represents SafetySetting[]
    ): Promise<string> {
        try {
            const modelInstance = this._getGenerativeModel(model);
            const response = await modelInstance.generateContent({
                contents: toContentParts(prompt),
                generationConfig: {
                    temperature: temperature ?? this._defaultTemperature,
                },
                systemInstruction: systemInstruction ?? this._defaultSystemInstruction,
                safetySettings: safetySettings ?? this._defaultSafetySettings,
            });
            return response.response.text();
        } catch (error) {
            this._logAndThrowError(error, { prompt, systemInstruction, temperature, model, context: 'generateContent' }, "Error generating content from AI model:");
        }
    }

    /**
     * Generates content with an accompanying image.
     * @param prompt The text prompt for the AI.
     * @param base64Image The image data in base64 format.
     * @param mimeType The MIME type of the image (e.g., 'image/png', 'image/jpeg').
     * @param model An optional model name. Overrides default if provided.
     * @param temperature An optional temperature for creativity. Overrides default if provided.
     * @param safetySettings Optional array of safety settings to override defaults.
     * @returns A Promise resolving to the AI's generated text.
     */
    public async generateContentWithImage(
        prompt: string,
        base64Image: string,
        mimeType: string,
        model?: string,
        temperature?: number,
        safetySettings?: any[] // Represents SafetySetting[]
    ): Promise<string> {
        const imagePart = { inlineData: { data: base64Image, mimeType } };
        const textPart = { text: prompt };
        const contents = { parts: [imagePart, textPart] };
        try {
            const modelInstance = this._getGenerativeModel(model);
            const response = await modelInstance.generateContent({
                contents,
                generationConfig: {
                    temperature: temperature ?? this._defaultTemperature,
                },
                safetySettings: safetySettings ?? this._defaultSafetySettings,
            });
            return response.response.text();
        } catch (error) {
            this._logAndThrowError(error, { prompt, hasImage: true, model, context: 'generateContentWithImage' }, "Error generating content with image from AI model:");
        }
    }

    /**
     * Generates a JSON object from the AI model based on a prompt and schema.
     * Handles cases where the AI might wrap JSON in markdown fences.
     * @param prompt The prompt for the AI.
     * @param systemInstruction An optional system instruction. Overrides default if provided.
     * @param schema The JSON schema to guide the AI's response.
     * @param temperature An optional temperature for creativity (lower for structured output). Overrides default if provided.
     * @param model An optional model name. Overrides default if provided.
     * @param safetySettings Optional array of safety settings to override defaults.
     * @returns A Promise resolving to the parsed JSON object.
     */
    public async generateJson<T>(
        prompt: string,
        systemInstruction: string,
        schema: any,
        temperature?: number,
        model?: string,
        safetySettings?: any[] // Represents SafetySetting[]
    ): Promise<T> {
        try {
            const modelInstance = this._getGenerativeModel(model);
            const response = await modelInstance.generateContent({
                contents: toContentParts(prompt),
                generationConfig: {
                    temperature: temperature ?? 0.2, // Default to lower temperature for JSON
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
                systemInstruction: systemInstruction ?? this._defaultSystemInstruction,
                safetySettings: safetySettings ?? this._defaultSafetySettings,
            });
            const textResponse = response.response.text();
            // Google GenAI often wraps JSON in markdown fences, so we need to parse carefully.
            const jsonString = textResponse.startsWith("```json") && textResponse.endsWith("```")
                ? textResponse.substring(7, textResponse.length - 3).trim()
                : textResponse.trim();
            return JSON.parse(jsonString);
        } catch (error) {
            this._logAndThrowError(error, { prompt, systemInstruction, model, context: 'generateJson' }, "Error generating JSON from AI model:");
        }
    }

    /**
     * Generates an image using a text prompt via a dedicated image generation model.
     * @param prompt The text prompt describing the image to generate.
     * @param model The specific model for image generation (e.g., 'imagen-4.0-generate-001').
     * @returns A Promise resolving to the base64 encoded image data URL (data:image/png;base64,...).
     */
    public async generateImage(
        prompt: string,
        model: string = 'imagen-4.0-generate-001'
    ): Promise<string> {
        try {
            const imageModel = this._genAI.getGenerativeModel({ model });
            const response = await imageModel.generateImages({
                prompt: prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/png' },
            });

            if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image?.imageBytes) {
                throw new Error("Image generation failed: No image data was returned.");
            }

            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        } catch (error) {
            this._logAndThrowError(error, { prompt, model, context: 'generateImage' }, "Error generating image from AI model:");
        }
    }

    /**
     * Generates an image from a combination of text and an existing image using a multimodal model.
     * This uses Gemini's multimodal capabilities, not a dedicated image generation model.
     * @param prompt The text prompt.
     * @param base64Image The input image data in base64 format.
     * @param mimeType The MIME type of the input image.
     * @param model The multimodal model to use (e.g., 'gemini-2.5-flash-image-preview').
     * @returns A Promise resolving to the base64 encoded output image data URL (data:image/png;base64,...).
     */
    public async generateImageFromImageAndText(
        prompt: string,
        base64Image: string,
        mimeType: string,
        model: string = 'gemini-2.5-flash-image-preview' // Or gemini-1.5-pro for higher quality
    ): Promise<string> {
        try {
            const modelInstance = this._genAI.getGenerativeModel({ model });
            const response = await modelInstance.generateContent({
                contents: {
                    parts: [
                        {
                            inlineData: {
                                data: base64Image,
                                mimeType: mimeType,
                            },
                        },
                        {
                            text: prompt,
                        },
                    ],
                },
                generationConfig: {
                    responseMimeType: 'image/png', // Request image output
                    responseModalities: [Modality.IMAGE], // Explicitly ask for image modality
                },
            });

            const parts = response.response.candidates?.[0]?.content?.parts ?? [];
            for (const part of parts) {
                if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/')) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }

            // Fallback if no image is returned
            const responseText = response.response.text();
            if (responseText) {
                throw new Error(`The AI responded with text instead of an image: "${responseText}"`);
            }

            throw new Error('Image generation failed: No image data was returned.');
        } catch (error) {
            this._logAndThrowError(error, { prompt, hasInputImage: true, model, context: 'generateImageFromImageAndText' }, "Error generating image from image and text from AI model:");
        }
    }

    /**
     * Generates content and potentially calls functions based on provided tool declarations.
     * This method is suitable for conversational AI that can perform actions.
     * @param prompt The prompt for the AI.
     * @param functionDeclarations An array of functions the AI can call.
     * @param knowledgeBase Optional string containing additional context for tool selection.
     * @param model An optional model name. Overrides default if provided.
     * @param temperature An optional temperature for creativity. Overrides default if provided.
     * @param safetySettings Optional array of safety settings to override defaults.
     * @returns A Promise resolving to a CommandResponse, which may contain text and/or function calls.
     */
    public async generateContentWithTools(
        prompt: string,
        functionDeclarations: FunctionDeclaration[],
        knowledgeBase?: string,
        model?: string,
        temperature?: number,
        safetySettings?: any[] // Represents SafetySetting[]
    ): Promise<CommandResponse> {
        try {
            const modelInstance = this._getGenerativeModel(model);
            // Construct the system instruction dynamically if knowledgeBase is provided,
            // otherwise fallback to the service's default system instruction.
            const systemInstruction = knowledgeBase
                ? `You are a helpful assistant for a developer tool. The user will ask you to perform a task.
Based on your knowledge base of available tools, you must decide which function to call to satisfy the user's request.
If no specific tool seems appropriate, you can respond with text.

Knowledge Base of Available Tools:
${knowledgeBase}`
                : this._defaultSystemInstruction;

            const response: GenerateContentResponse = await modelInstance.generateContent({
                contents: toContentParts(prompt),
                tools: [{ functionDeclarations }],
                generationConfig: {
                    temperature: temperature ?? this._defaultTemperature,
                },
                systemInstruction: systemInstruction,
                safetySettings: safetySettings ?? this._defaultSafetySettings,
            });

            const functionCalls: { name: string, args: any }[] = [];
            const parts = response.candidates?.[0]?.content?.parts ?? [];
            for (const part of parts) {
                if (part.functionCall) {
                    functionCalls.push({ name: part.functionCall.name, args: part.functionCall.args });
                }
            }
            return {
                text: response.text,
                functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
                rawResponse: response // Include raw response for debugging/advanced handling
            };
        } catch (error) {
            this._logAndThrowError(error, { prompt, hasTools: true, model, context: 'generateContentWithTools' }, "Error generating content with tools from AI model:");
        }
    }

    /**
     * Estimates the token count for a given content. Useful for managing costs and context windows.
     * @param parts The content parts to count tokens for (e.g., [{text: "hello"}]).
     * @param model The model to use for token counting. Defaults to the service's default model.
     * @returns A Promise resolving to the number of tokens.
     */
    public async countTokens(
        parts: any[], // Represents ContentPart[]
        model?: string
    ): Promise<number> {
        try {
            const modelInstance = this._getGenerativeModel(model);
            const result = await modelInstance.countTokens({ contents: parts });
            return result.totalTokens;
        } catch (error) {
            this._logAndThrowError(error, { parts, model, context: 'countTokens' }, "Error counting tokens:");
        }
    }

    /**
     * Generates embeddings for a single string or an array of strings.
     * @param input The text or array of texts to generate embeddings for.
     * @param model The embedding model to use. Defaults to 'embedding-001'.
     * @returns A Promise resolving to a 2D array of embeddings (each inner array is an embedding vector).
     */
    public async generateEmbeddings(
        input: string | string[],
        model: string = 'embedding-001'
    ): Promise<number[][]> {
        try {
            const embeddingModel = this._getGenerativeModel(model);
            const inputs = Array.isArray(input) ? input : [input];

            const batchEmbedRequest: any = { // Represents BatchEmbedContentsRequest
                requests: inputs.map(text => ({
                    model: model,
                    content: { parts: [{ text }] }
                }))
            };

            const result = await embeddingModel.batchEmbedContents(batchEmbedRequest);
            return result.embeddings.map((e: any) => e.value); // Cast e to any
        } catch (error) {
            this._logAndThrowError(error, { input, model, context: 'generateEmbeddings' }, "Error generating embeddings:");
        }
    }

    /**
     * Starts a new chat session with an optional initial history and configuration.
     * Merges service-level defaults with session-specific configurations.
     * @param config Configuration for the chat session, including model, temperature, system instruction, and initial history.
     * @returns An instance of GeminiChatSession.
     */
    public startChatSession(config?: ChatSessionConfig): GeminiChatSession {
        const mergedConfig: ChatSessionConfig = {
            model: config?.model || this._defaultModel,
            temperature: config?.temperature ?? this._defaultTemperature,
            systemInstruction: config?.systemInstruction ?? this._defaultSystemInstruction,
            safetySettings: config?.safetySettings ?? this._defaultSafetySettings,
            history: config?.history,
        };
        return new GeminiChatSession(this._genAI, mergedConfig);
    }

    /**
     * Lists all available models from the Gemini API.
     * @returns A Promise resolving to an array of model information objects.
     */
    public async listModels(): Promise<any[]> { // Represents Promise<Model[]>
        try {
            const { models } = await this._genAI.listModels();
            return models;
        } catch (error) {
            this._logAndThrowError(error, { context: 'listModels' }, "Error listing models:");
        }
    }

    /**
     * Retrieves detailed information for a specific model.
     * @param modelName The name of the model to retrieve information for.
     * @returns A Promise resolving to the model information object, or undefined if not found.
     */
    public async getModelInfo(modelName: string): Promise<any | undefined> { // Represents Promise<Model | undefined>
        try {
            const { models } = await this._genAI.listModels();
            return models.find((m: any) => m.name === modelName); // Cast m to any
        } catch (error) {
            this._logAndThrowError(error, { modelName, context: 'getModelInfo' }, "Error retrieving model info:");
        }
    }
}

// Export a default instance of the GeminiService for convenience,
// replacing the direct `ai` instance with a more feature-rich service.
export const geminiService = new GeminiService();

// For backward compatibility and to fulfill the original exports:

// The original `ai` export, now refers to the underlying GoogleGenAI instance managed by the service.
export const ai = geminiService['_genAI'];

// Re-export specific utility functions from the original file, now routing through the service instance.
// This maintains the existing API contract for users of the original file.

export async function* streamContent(prompt: string | { parts: any[] }, systemInstruction: string, temperature = 0.5) {
    yield* geminiService.streamContent(prompt, systemInstruction, temperature);
}

export async function generateContent(prompt: string, systemInstruction: string, temperature = 0.5): Promise<string> {
    return geminiService.generateContent(prompt, systemInstruction, temperature);
}

export async function generateContentWithImage(prompt: string, base64Image: string, mimeType: string): Promise<string> {
    return geminiService.generateContentWithImage(prompt, base64Image, mimeType);
}

export async function generateJson<T>(prompt: string, systemInstruction: string, schema: any, temperature = 0.2): Promise<T> {
    return geminiService.generateJson(prompt, systemInstruction, schema, temperature);
}

export const consumeStream = async (stream: AsyncGenerator<string, void, unknown>): Promise<string> => {
    let result = '';
    for await (const chunk of stream) {
        result += chunk;
    }
    return result;
};

export const generateImage = async (prompt: string): Promise<string> => {
    return geminiService.generateImage(prompt);
};

export const generateImageFromImageAndText = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    return geminiService.generateImageFromImageAndText(prompt, base64Image, mimeType);
};

// The original interface was already defined at the top of the file as part of the enhancement.
// export interface CommandResponse { ... }

export const getInferenceFunction = async (prompt: string, functionDeclarations: FunctionDeclaration[], knowledgeBase: string): Promise<CommandResponse> => {
    return geminiService.generateContentWithTools(prompt, functionDeclarations, knowledgeBase);
};