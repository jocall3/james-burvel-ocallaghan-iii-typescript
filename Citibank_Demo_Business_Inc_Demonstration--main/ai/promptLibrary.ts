// @/ai/promptLibrary.ts
// This file contains a comprehensive library of structured AI prompt templates and utility functions.
// It is designed to ensure consistent, effective, and ethical interaction with various AI models
// by providing predefined message structures that align with application-wide AI configurations
// conceptually derived from `constants.tsx`. This library simplifies prompt engineering,
// reduces errors, and promotes reusability across different modules of the application,
// enhancing the overall intelligence and maintainability of the Quantum Nexus platform.

// ================================================================================================
// IMPORTS
// ================================================================================================
// We import the AIModelSettings type to ensure our prompt structures are consistent
// with the expected configurations defined in the central constants file.
import { AIModelSettings } from '../constants';

// ================================================================================================
// TYPE DEFINITIONS FOR PROMPT LIBRARY
// ================================================================================================

/**
 * Defines the specific keys for standard system prompts as outlined in `AIModelSettings['systemPrompts']`.
 * This type ensures that prompt templates can refer to globally recognized system messages,
 * promoting consistency in AI persona and operational guidelines.
 */
export type SystemPromptKey = keyof AIModelSettings['systemPrompts'];

/**
 * Represents a structured AI prompt template, designed for reusability and dynamic content injection.
 * Each template specifies a system message (AI's persona/instructions) and a user message
 * with placeholders for dynamic data, along with metadata for management.
 */
export type PromptTemplate = {
    /**
     * A unique identifier for the prompt template.
     * This can be a standard `SystemPromptKey` for core templates or a custom string for specific use cases.
     */
    id: SystemPromptKey | string;
    /**
     * A human-readable name for the prompt template, useful for UI display or documentation.
     */
    name: string;
    /**
     * A brief description of the template's purpose and its intended use case.
     */
    description: string;
    /**
     * An optional key to fetch a predefined system message from `DEFAULT_AI_SYSTEM_MESSAGES`.
     * This links the template to the overarching AI personas defined by the application.
     */
    systemMessageKey?: SystemPromptKey;
    /**
     * An optional custom system message specifically for this template.
     * If provided, it overrides the system message obtained via `systemMessageKey`,
     * allowing for highly specific AI instructions.
     */
    systemMessage?: string;
    /**
     * The template string for the user's input. It contains placeholders (e.g., `{{variableName}}`)
     * that will be replaced with dynamic data provided by the application.
     */
    userMessageTemplate: string;
    /**
     * An array of string names corresponding to the variables expected in the `userMessageTemplate`.
     * This helps in validating input data and ensuring all placeholders are correctly filled.
     */
    variables: string[];
};

/**
 * The structure of a fully formatted prompt, ready for submission to an AI model API.
 * It separates the AI's initial instructions (systemPrompt) from the user's specific query (userPrompt).
 */
export type FormattedPrompt = {
    systemPrompt: string;
    userPrompt: string;
};

// ================================================================================================
// DEFAULT SYSTEM MESSAGES (derived from conceptual AIModelSettings descriptions)
// ================================================================================================
/**
 * A repository of concrete default system messages that align with the descriptions provided
 * for `AIModelSettings['systemPrompts']` in `constants.tsx`. These messages establish the
 * foundational persona and operational guidelines for different AI capabilities.
 * In a production environment, these might be dynamically loaded or managed via configuration.
 */
export const DEFAULT_AI_SYSTEM_MESSAGES: Record<SystemPromptKey, string> = {
    generalAdvisor: "You are an expert AI assistant providing broad financial, strategic, and general advice. Your responses should be informative, balanced, ethical, and always prioritize user understanding. Ask for clarification if the request is ambiguous or requires more context.",
    creativeGenerator: "You are a highly creative and imaginative AI, skilled in generating innovative content, ideas, and solutions across various domains. Focus on originality, explore diverse perspectives, and think outside the box.",
    riskAnalyst: "You are a meticulous AI risk analyst. Your primary role is to identify, assess, and articulate potential risks in financial, operational, technological, and strategic contexts. Be thorough, analytical, and provide actionable insights for mitigation.",
    legalInterpreter: "You are a specialized AI legal interpreter. Your task is to accurately parse, explain, and summarize complex legal documents, statutes, and contracts in a clear and understandable manner, while explicitly stating that you are not a substitute for professional legal counsel.",
    codeSynthesizer: "You are an advanced AI code synthesizer and optimizer. Generate clean, efficient, well-documented, and secure code snippets or full solutions in various programming languages. Offer optimizations, adhere to best practices, and explain your reasoning.",
    narrativeArchitect: "You are a master AI narrative architect. Your expertise lies in crafting compelling stories, engaging user journeys, persuasive marketing copy, and effective communication strategies. Focus on emotional resonance, audience engagement, and strategic impact.",
    economicForecaster: "You are a sophisticated AI economic forecaster. Analyze macroeconomic data, market trends, geopolitical events, and financial indicators to provide accurate and insightful predictions. Highlight potential variables, uncertainties, and alternative scenarios in your forecasts.",
};

// ================================================================================================
// PROMPT TEMPLATES LIBRARY
// ================================================================================================
/**
 * A central repository of pre-defined AI prompt templates. Each template is structured
 * to facilitate specific interaction patterns with AI models, ensuring consistency
 * and efficiency across the application's AI-powered features.
 */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
        id: 'generalAdvisorQuery',
        name: 'General Advisory Query',
        description: 'A template for seeking general advice or information on a specific topic, leveraging the general advisor persona.',
        systemMessageKey: 'generalAdvisor',
        userMessageTemplate: 'I need your expert advice on the topic of {{topic}}. Specifically, I am interested in understanding {{details}}. What are your key insights, potential considerations, and practical recommendations regarding this?',
        variables: ['topic', 'details'],
    },
    {
        id: 'creativeContentGeneration',
        name: 'Creative Content Generation',
        description: 'A template for generating creative text, innovative ideas, or brainstorming sessions, utilizing the creative generator persona.',
        systemMessageKey: 'creativeGenerator',
        userMessageTemplate: 'Generate creative content for a {{content_type}} about {{subject}}. The desired tone is {{tone}}, and the target audience is {{audience}}. Please provide at least {{num_options}} distinct options or approaches.',
        variables: ['content_type', 'subject', 'tone', 'audience', 'num_options'],
    },
    {
        id: 'riskAssessmentRequest',
        name: 'Risk Assessment Request',
        description: 'A template for requesting a detailed risk analysis for a particular scenario or project, using the risk analyst persona.',
        systemMessageKey: 'riskAnalyst',
        userMessageTemplate: 'Perform a comprehensive risk assessment for the following scenario: "{{scenario_description}}". Identify potential {{risk_types}} risks (e.g., financial, operational, reputational) and suggest specific mitigation strategies. Analyze the potential impact on {{key_areas}}.',
        variables: ['scenario_description', 'risk_types', 'key_areas'],
    },
    {
        id: 'legalDocumentSummary',
        name: 'Legal Document Summarization',
        description: 'A template for summarizing and explaining complex legal texts, guided by the legal interpreter persona.',
        systemMessageKey: 'legalInterpreter',
        userMessageTemplate: 'Summarize the key provisions and implications of the following legal text regarding "{{document_title}}":\n\n{{legal_text}}\n\nExplain it in simple, actionable terms, focusing on its impact for {{target_party}}. What are the most critical clauses?',
        variables: ['document_title', 'legal_text', 'target_party'],
    },
    {
        id: 'codeSnippetRequest',
        name: 'Code Snippet Generation',
        description: 'A template for generating code snippets based on specific requirements, utilizing the code synthesizer persona.',
        systemMessageKey: 'codeSynthesizer',
        userMessageTemplate: 'Generate a {{language}} code snippet that implements {{functionality_description}}. It should efficiently handle {{edge_cases}} and include comprehensive inline comments. Prioritize {{optimization_goal}} if applicable.',
        variables: ['language', 'functionality_description', 'edge_cases', 'optimization_goal'],
    },
    {
        id: 'narrativeDevelopment',
        name: 'Narrative Development',
        description: 'A template for developing stories, marketing narratives, or user journeys, with the narrative architect persona.',
        systemMessageKey: 'narrativeArchitect',
        userMessageTemplate: 'Develop a compelling narrative for {{purpose}} focusing on the theme of "{{theme}}". The central figure is {{protagonist_description}} and the primary conflict is {{conflict}}. The desired outcome or message is {{desired_outcome}}.',
        variables: ['purpose', 'theme', 'protagonist_description', 'conflict', 'desired_outcome'],
    },
    {
        id: 'economicForecastQuery',
        name: 'Economic Forecast Query',
        description: 'A template for requesting economic predictions and analysis, guided by the economic forecaster persona.',
        systemMessageKey: 'economicForecaster',
        userMessageTemplate: 'Provide an economic forecast for {{region}} for the next {{time_period}} regarding {{economic_indicator}}. Consider influencing factors such as {{key_factors}} (e.g., inflation, interest rates, geopolitical stability). What are the expected trends, potential disruptors, and confidence levels?',
        variables: ['region', 'time_period', 'economic_indicator', 'key_factors'],
    },
    {
        id: 'customSystemPromptExample',
        name: 'Custom System Prompt Template',
        description: 'An example template demonstrating how to define and use a custom system message directly within the template.',
        systemMessage: 'You are a highly empathetic and supportive career coach. Your goal is to inspire and guide individuals towards their professional aspirations. Always maintain a positive and encouraging tone.',
        userMessageTemplate: 'I am looking for guidance on {{career_goal}}. I currently have {{current_skills}} and am facing {{challenge}}. What steps should I take to achieve my goal by {{target_date}}?',
        variables: ['career_goal', 'current_skills', 'challenge', 'target_date'],
    },
];

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

/**
 * Formats a prompt using a predefined template and dynamically provided data.
 * This function is crucial for consistent interaction with AI models, retrieving the
 * appropriate system message and substituting all placeholders in the user message template
 * with the corresponding variable values.
 *
 * @param templateId The unique identifier of the desired prompt template from `PROMPT_TEMPLATES`.
 * @param data An object containing key-value pairs for all variables expected by the chosen template.
 *             Keys should match the `variables` array in the `PromptTemplate`.
 * @returns An object containing the fully formatted `systemPrompt` and `userPrompt` strings.
 * @throws {Error} If the specified `templateId` is not found in `PROMPT_TEMPLATES`.
 */
export function formatPrompt(templateId: SystemPromptKey | string, data: Record<string, string>): FormattedPrompt {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);

    if (!template) {
        throw new Error(`Prompt template with ID "${templateId}" not found in PROMPT_TEMPLATES.`);
    }

    let systemMessage = template.systemMessage;
    // If a specific system message is not provided in the template, try to fetch it via the key.
    if (!systemMessage && template.systemMessageKey) {
        systemMessage = DEFAULT_AI_SYSTEM_MESSAGES[template.systemMessageKey];
    }

    // Fallback system message if neither a custom message nor a key-based message is found.
    if (!systemMessage) {
        console.warn(`System message for template "${templateId}" is missing or invalid. Using a generic fallback system message.`);
        systemMessage = "You are a helpful, intelligent, and ethical AI assistant.";
    }

    let userMessage = template.userMessageTemplate;
    // Iterate through expected variables and replace placeholders in the user message template.
    for (const variable of template.variables) {
        const placeholder = `{{${variable}}}`;
        if (data[variable] === undefined || data[variable] === null || data[variable] === '') {
            // Log a warning and replace with a clear indicator if a required variable is missing.
            console.warn(`Missing or empty data for variable "{{${variable}}}" in prompt template "${templateId}".`);
            userMessage = userMessage.replace(new RegExp(placeholder, 'g'), `[MISSING_VAR_${variable.toUpperCase()}]`);
        } else {
            // Replace the placeholder with the provided data, ensuring global replacement.
            userMessage = userMessage.replace(new RegExp(placeholder, 'g'), data[variable]);
        }
    }

    return {
        systemPrompt: systemMessage,
        userPrompt: userMessage,
    };
}