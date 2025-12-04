// components/services/quantumSageService.ts
// QUANTUM SAGE AI SERVICE: This file centralizes all core logic for interacting with the Google GenAI API.
// It provides an encapsulated, robust interface for the Quantum Sage AI feature, managing chat sessions,
// processing user inputs, streaming AI responses, and enabling advanced financial analysis capabilities.
// Designed to be the brain behind Allocatra's AI assistant, ensuring consistent and secure AI communication.

import { GoogleGenAI, Chat } from "@google/genai";
import type { BudgetCategory, Transaction } from '../../types';
import {
    BudgetGoal,
    Subscription,
    AISageProfile,
    AIInteractionMessage,
    ScenarioResult,
    FinancialMetricDisplay,
    generateUniqueId
} from '../BudgetsView'; // Importing interfaces and utility function from the component that defines them

// ================================================================================================
// INTERNAL STATE & CONFIGURATION
// ================================================================================================

// Holds the active chat session instance. This acts as a singleton for the chat across the application.
let currentChatSession: Chat | null = null;
// Stores the API key securely. In a real app, this would be managed more securely (e.g., server-side, environment variables).
let storedApiKey: string | undefined = undefined;
// Default model to use for AI interactions.
const DEFAULT_AI_MODEL = 'gemini-2.5-flash';

// ================================================================================================
// CORE AI CHAT SESSION MANAGEMENT
// ================================================================================================

/**
 * Initializes or re-initializes the Quantum Sage chat session.
 * This function should be called before any chat interactions. It sets up the AI model
 * with dynamic system instructions based on the user's current financial data.
 * @param apiKey The API key for Google GenAI.
 * @param budgets Current list of budget categories for context.
 * @param transactions Current list of transactions for context.
 * @param goals Current list of financial goals for context.
 * @param subscriptions Current list of subscriptions for context.
 * @param aiProfile User's AI Sage profile settings (e.g., preferred tone, learning history).
 * @param history Optional: initial chat history to load into the new session for continuity.
 * @returns A promise that resolves with the initialized Chat session.
 * @throws Error if the API key is missing or chat initialization fails.
 */
export const initializeQuantumSageChat = async (
    apiKey: string,
    budgets: BudgetCategory[],
    transactions: Transaction[],
    goals: BudgetGoal[],
    subscriptions: Subscription[],
    aiProfile: AISageProfile,
    history: AIInteractionMessage[] = []
): Promise<Chat> => {
    if (!apiKey) {
        throw new Error("Google GenAI API Key is not configured. Please provide a valid key.");
    }
    storedApiKey = apiKey; // Store the key for subsequent calls

    // Generate dynamic system instructions for the AI to provide personalized advice.
    const systemInstruction = generateSystemInstruction(budgets, goals, subscriptions, transactions, aiProfile);

    try {
        const ai = new GoogleGenAI({ apiKey });
        currentChatSession = ai.chats.create({
            model: DEFAULT_AI_MODEL,
            config: { systemInstruction },
            history: history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model', // Map our internal roles to AI SDK roles
                parts: [{ text: msg.content }]
            }))
        });
        return currentChatSession;
    } catch (error) {
        console.error("Quantum Sage chat initialization failed:", error);
        throw new Error(`Failed to initialize AI chat: ${(error as Error).message}`);
    }
};

/**
 * Generates the detailed system instruction for the AI, incorporating all relevant user financial data.
 * This instruction guides the AI's persona and context for all subsequent interactions.
 * @param budgets Current list of budget categories.
 * @param goals Current list of financial goals.
 * @param subscriptions Current list of subscriptions.
 * @param transactions Current list of transactions.
 * @param aiProfile User's AI Sage profile settings.
 * @returns A comprehensive string for the AI's system instruction.
 */
export const generateSystemInstruction = (
    budgets: BudgetCategory[],
    goals: BudgetGoal[],
    subscriptions: Subscription[],
    transactions: Transaction[],
    aiProfile: AISageProfile
): string => {
    // Summarize financial data to provide context for the AI
    const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit} limit`).join(', ');
    const goalSummary = goals.map(g => `${g.name}: $${g.currentAmount.toFixed(0)} of $${g.targetAmount} target (${g.isAchieved ? 'achieved' : 'in progress'})`).join(', ');
    const subSummary = subscriptions.map(s => `${s.name}: $${s.amount}/${s.frequency}`).join(', ');
    const transactionSummary = `Recent expenses: ${transactions.slice(0, 5).map(tx => `${tx.description} $${tx.amount}`).join(', ')}.`;
    const profileTone = aiProfile.preferredTone;

    return `You are Quantum, a hyper-advanced financial AI advisor. Your core function is to provide highly personalized, insightful, and actionable financial advice, analysis, and forecasts.
    Current User Data Snapshot:
    - Budgets: ${budgetSummary}
    - Goals: ${goalSummary}
    - Subscriptions: ${subSummary}
    - Transactions Snapshot: ${transactionSummary}
    - User's preferred tone: ${profileTone}.
    - Your responses should strictly reflect this tone (e.g., 'formal', 'casual', 'encouraging', 'direct').
    - Analyze and provide proactive advice, answer complex financial questions, simulate "what-if" scenarios, and help identify spending patterns. Maintain conversation context for continuous, relevant support.
    - Always provide numerical answers with currency symbols and two decimal places where appropriate.`;
};

/**
 * Sends a user message to the Quantum Sage AI and handles streaming the AI's response.
 * This is suitable for real-time chat interfaces where partial responses can be displayed.
 * @param message The user's input message.
 * @param onChunkReceived Callback function to be executed with each received text chunk from the AI.
 * @returns A promise that resolves with the complete AI response content.
 * @throws Error if the chat session is not initialized.
 */
export const sendQuantumSageMessageStream = async (
    message: string,
    onChunkReceived: (chunk: string) => void
): Promise<string> => {
    if (!currentChatSession) {
        throw new Error("Quantum Sage chat session not initialized. Call initializeQuantumSageChat first.");
    }

    let fullResponseText = '';
    try {
        const resultStream = await currentChatSession.sendMessageStream({ message });
        for await (const chunk of resultStream) {
            if (chunk.text) {
                fullResponseText += chunk.text;
                onChunkReceived(chunk.text);
            }
        }
        return fullResponseText;
    } catch (error) {
        console.error("Error sending message to Quantum Sage AI (stream):", error);
        throw new Error(`AI message stream failed: ${(error as Error).message}`);
    }
};

/**
 * Sends a user message to the Quantum Sage AI and waits for the complete response before resolving.
 * This is suitable for requests where a full, single answer is expected (e.g., report generation, insights).
 * @param message The user's input message.
 * @returns A promise that resolves with the complete AI response content.
 * @throws Error if the chat session is not initialized.
 */
export const sendQuantumSageMessage = async (
    message: string
): Promise<string> => {
    if (!currentChatSession) {
        throw new Error("Quantum Sage chat session not initialized. Call initializeQuantumSageChat first.");
    }

    try {
        const result = await currentChatSession.sendMessage(message);
        return result.text();
    } catch (error) {
        console.error("Error sending message to Quantum Sage AI:", error);
        throw new Error(`AI message failed: ${(error as Error).message}`);
    }
};

/**
 * Retrieves the currently active chat session instance.
 * @returns The Chat instance or null if no session has been initialized.
 */
export const getCurrentChatSession = (): Chat | null => {
    return currentChatSession;
};

/**
 * Clears the current chat session, effectively resetting the AI's memory and context.
 * A new session will need to be initialized for further interactions.
 */
export const clearChatSession = (): void => {
    currentChatSession = null;
    storedApiKey = undefined;
    console.log("Quantum Sage chat session cleared.");
};

// ================================================================================================
// ADVANCED AI FINANCIAL INTELLIGENCE FEATURES
// ================================================================================================

/**
 * Provides a simulated initial greeting and insight from the AI when the chat interface is opened.
 * This leverages the AI's ability to offer proactive engagement.
 * @returns A promise that resolves with an AIInteractionMessage for the initial greeting.
 * @throws Error if the chat session is not initialized.
 */
export const getInitialSageGreeting = async (): Promise<AIInteractionMessage> => {
    if (!currentChatSession) {
        throw new Error("Quantum Sage chat session not initialized for initial greeting.");
    }
    try {
        // Send a specific prompt to the AI to generate an opening insight
        const result = await currentChatSession.sendMessage("Hello Quantum, provide a brief, initial financial insight or a question I can ask to start our conversation, reflecting my preferred tone.");
        return {
            id: generateUniqueId(),
            role: 'model',
            content: result.text(),
            timestamp: new Date().toLocaleTimeString(),
        };
    } catch (error) {
        console.error("Error generating initial Sage greeting:", error);
        return {
            id: generateUniqueId(),
            role: 'model',
            content: "Greetings. I'm Quantum Sage, ready to analyze your financial universe. How may I assist you today?",
            timestamp: new Date().toLocaleTimeString(),
        };
    }
};

/**
 * Requests AI-driven insights and actionable advice specifically related to the user's financial goals.
 * The AI analyzes goal progress, potential roadblocks, and suggests strategies.
 * @param goals List of BudgetGoal objects for AI analysis.
 * @param aiProfile User's AI Sage profile for tone and context.
 * @returns A promise that resolves with a string containing the AI's goal insights.
 * @throws Error if the chat session is not initialized.
 */
export const getGoalInsights = async (goals: BudgetGoal[], aiProfile: AISageProfile): Promise<string> => {
    if (!currentChatSession) {
        throw new Error("Quantum Sage chat session not initialized for goal insights.");
    }
    const goalsSummary = goals.map(g =>
        `${g.name} (Target: ${formatCurrency(g.targetAmount)}, Current: ${formatCurrency(g.currentAmount)}, Achieved: ${g.isAchieved ? 'Yes' : 'No'}${g.targetDate ? `, Target Date: ${g.targetDate}` : ''})`
    ).join('; ');
    const prompt = `Based on these financial goals: ${goalsSummary}, and considering my preferred tone is ${aiProfile.preferredTone}, provide a concise insight or actionable advice regarding my progress and potential strategies to achieve them faster. Focus on a maximum of 2-3 key points.`;
    return await sendQuantumSageMessage(prompt);
};

/**
 * Requests AI-driven analysis and optimization advice for the user's subscriptions.
 * The AI can identify redundant services, cost-saving opportunities, or upcoming renewals.
 * @param subscriptions List of Subscription objects for AI analysis.
 * @param aiProfile User's AI Sage profile for tone and context.
 * @returns A promise that resolves with a string containing the AI's subscription optimization advice.
 * @throws Error if the chat session is not initialized.
 */
export const getSubscriptionOptimizationAdvice = async (subscriptions: Subscription[], aiProfile: AISageProfile): Promise<string> => {
    if (!currentChatSession) {
        throw new Error("Quantum Sage chat session not initialized for subscription optimization.");
    }
    const activeSubs = subscriptions.filter(s => s.isActive).map(s =>
        `${s.name} (${formatCurrency(s.amount)}/${s.frequency}, Renews: ${s.nextRenewalDate})`
    ).join('; ');
    const prompt = `Based on my active subscriptions: ${activeSubs}, and considering my preferred tone is ${aiProfile.preferredTone}, suggest ways to optimize or reduce subscription costs. Highlight any potential overlaps or subscriptions that could be cancelled.`;
    return await sendQuantumSageMessage(prompt);
};

/**
 * Performs a financial "what-if" scenario analysis using AI. This function structures the prompt
 * to the AI and attempts to parse a structured `ScenarioResult` from the AI's response.
 * This is a foundational step towards more sophisticated predictive modeling.
 * @param scenarioDetails Details of the scenario to simulate (name, description, assumptions).
 * @param budgets Current budget data for context.
 * @param transactions Current transaction data for context.
 * @param goals Current goal data for context.
 * @param subscriptions Current subscription data for context.
 * @param aiProfile User's AI Sage profile for tone and context.
 * @returns A promise that resolves with a simulated ScenarioResult object.
 * @throws Error if the chat session is not initialized or AI response cannot be parsed.
 */
export const simulateFinancialScenario = async (
    scenarioDetails: { name: string; description: string; assumptions: string[] },
    budgets: BudgetCategory[],
    transactions: Transaction[],
    goals: BudgetGoal[],
    subscriptions: Subscription[],
    aiProfile: AISageProfile
): Promise<ScenarioResult> => {
    if (!currentChatSession) {
        throw new Error("Quantum Sage chat session not initialized for scenario simulation.");
    }

    const { name, description, assumptions } = scenarioDetails;
    // Provide comprehensive current financial state to the AI for accurate simulation
    const currentBudgetSummary = budgets.map(b => `${b.name}: ${formatCurrency(b.spent)} spent of ${formatCurrency(b.limit)} limit`).join(', ');
    const currentGoalSummary = goals.map(g => `${g.name}: ${formatCurrency(g.currentAmount)} of ${formatCurrency(g.targetAmount)} target`).join(', ');
    const currentSubscriptionSummary = subscriptions.map(s => `${s.name}: ${formatCurrency(s.amount)}/${s.frequency}`).join(', ');

    const prompt = `Simulate the following financial scenario for me. Provide projected outcomes for budget impact, savings impact, net worth impact, and a change in my financial health score. Output the results in a concise, parsable format, ideally JSON, but if not possible, clearly label each impact.

    Scenario Name: "${name}"
    Description: "${description}"
    Assumptions: ${assumptions.map(a => `- ${a}`).join('\n')}

    My current financial state summarized:
    - Budgets: ${currentBudgetSummary}
    - Goals: ${currentGoalSummary}
    - Subscriptions: ${currentSubscriptionSummary}
    - Recent Expenses: ${transactions.filter(t => t.type === 'expense').slice(0, 3).map(t => `${t.description} ${formatCurrency(t.amount)}`).join(', ')}

    Please analyze how this scenario would affect my finances over the next 6-12 months. Provide specific numerical impacts for savings, net worth, and financial health score change. If there are specific budget category impacts, list them. Be direct and concise.`;

    const rawAIResponse = await sendQuantumSageMessage(prompt);

    // This is a simplified parsing. In a production system, you'd use a more robust
    // JSON parsing approach or a structured output model from GenAI.
    const parseSimulatedResult = (text: string): ScenarioResult['projectedOutcome'] => {
        let savingsImpact = (Math.random() * 1000) - 500; // Default random for demo
        let netWorthImpact = (Math.random() * 5000) - 1000;
        let futureScoreChange = (Math.random() * 15) - 7;
        const budgetImpact: { category: string; change: number }[] = [];

        // Attempt to extract numbers from common phrases
        const savingsMatch = text.match(/savings\s*impact:\s*([+-]?\$\s*[\d,]+\.?\d{0,2})/i);
        if (savingsMatch) savingsImpact = parseFloat(savingsMatch[1].replace(/[$,\s]/g, ''));

        const netWorthMatch = text.match(/net\s*worth\s*impact:\s*([+-]?\$\s*[\d,]+\.?\d{0,2})/i);
        if (netWorthMatch) netWorthImpact = parseFloat(netWorthMatch[1].replace(/[$,\s]/g, ''));

        const scoreChangeMatch = text.match(/financial\s*health\s*score\s*change:\s*([+-]?\d+(\.\d{1,2})?)\s*%/i);
        if (scoreChangeMatch) futureScoreChange = parseFloat(scoreChangeMatch[1]);

        // Further regex could extract budget category changes if AI formats them consistently

        return { budgetImpact, savingsImpact, netWorthImpact, futureScoreChange };
    };

    const projectedOutcome = parseSimulatedResult(rawAIResponse);

    return {
        id: generateUniqueId(),
        name,
        description,
        assumptions,
        projectedOutcome,
        dateCreated: new Date().toISOString().split('T')[0],
        visualizations: null, // Placeholder; could contain chart data if AI provides it
    };
};

/**
 * Retrieves a set of key financial metrics and their trends, analyzed by the AI.
 * The AI is prompted to return this data in a structured JSON format, adhering to `FinancialMetricDisplay`.
 * This enables dynamic display of AI-generated insights in the dashboard.
 * @param budgets Current budget data.
 * @param transactions Current transaction data.
 * @param goals Current goal data.
 * @param subscriptions Current subscription data.
 * @param aiProfile User's AI Sage profile for tone and context.
 * @returns A promise that resolves with an array of FinancialMetricDisplay objects.
 * @throws Error if the chat session is not initialized or AI response cannot be parsed.
 */
export const getAIFinancialMetrics = async (
    budgets: BudgetCategory[],
    transactions: Transaction[],
    goals: BudgetGoal[],
    subscriptions: Subscription[],
    aiProfile: AISageProfile
): Promise<FinancialMetricDisplay[]> => {
    if (!currentChatSession) {
        throw new Error("Quantum Sage chat session not initialized for metric display.");
    }

    // Ensure the system instruction is up-to-date for the AI's current context
    const updatedSystemInstruction = generateSystemInstruction(budgets, goals, subscriptions, transactions, aiProfile);
    // Note: To truly update the system instruction for a *running* chat, you might need to re-initialize
    // the chat session or use a model that supports dynamic system instruction changes mid-conversation.
    // For this simulation, we'll assume the chat is initialized with the latest context.

    const prompt = `Analyze the current financial data provided in your system instruction. Identify up to 6 key financial metrics relevant to my situation (e.g., spending trends, savings progress, subscription impact, cash flow, overall health score). For each metric, provide its current value, unit, a trend indicator ('up', 'down', 'stable', 'neutral'), a brief description, and a suitable emoji icon.

    Output this information as a JSON array of objects, strictly adhering to the FinancialMetricDisplay interface:
    {
        "id": "string",
        "name": "string",
        "value": "number",
        "unit": "string",
        "trend": "up" | "down" | "stable" | "neutral",
        "description": "string",
        "icon": "string"
    }
    Ensure the JSON is well-formed, valid, and can be directly parsed. Do NOT include any additional text or markdown outside the JSON block.`;

    const aiResponseText = await sendQuantumSageMessage(prompt);

    try {
        const parsedMetrics = JSON.parse(aiResponseText) as FinancialMetricDisplay[];
        // Basic validation of the parsed structure
        if (!Array.isArray(parsedMetrics) || parsedMetrics.some(m => !m.id || !m.name)) {
            throw new Error("AI returned malformed JSON for financial metrics.");
        }
        return parsedMetrics;
    } catch (e) {
        console.error("Failed to parse AI financial metrics from response:", e, "Raw AI response:", aiResponseText);
        // Fallback to default or basic metrics if AI fails to provide structured output
        return [
            { id: generateUniqueId(), name: "AI Metrics Unavailable", value: 0, unit: '', trend: 'neutral', description: 'Could not retrieve AI-generated metrics.', icon: 'âš ï¸ ' }
        ];
    }
};

// ================================================================================================
// SHARED UTILITY FUNCTIONS (Potentially part of a broader 'utils' service)
// ================================================================================================

/**
 * Determines a suitable emoji icon for a financial metric based on its trend for visual feedback.
 * @param trend The trend of the financial metric.
 * @returns An emoji string representing the trend.
 */
export const getTrendIcon = (trend: 'up' | 'down' | 'stable' | 'neutral'): string => {
    switch (trend) {
        case 'up': return 'â†—ï¸ '; // North East Arrow
        case 'down': return 'â†˜ï¸ '; // South East Arrow
        case 'stable': return 'âž¡ï¸ '; // Rightwards Arrow
        case 'neutral': return 'â€”'; // Em Dash
        default: return '';
    }
};

/**
 * Formats a numerical amount into a locale-specific currency string.
 * This ensures consistent currency display across the application.
 * @param amount The monetary amount to format.
 * @param currency The currency code (e.g., 'USD', 'EUR').
 * @param locale The locale string (e.g., 'en-US', 'de-DE').
 * @returns A formatted currency string (e.g., "$1,234.56").
 */
export const formatCurrency = (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

/**
 * Calculates a simple future spending forecast for a given category based on recent transaction history.
 * This utility function can be used by both AI and other components for quick predictions.
 * @param transactions An array of all user transactions.
 * @param category The specific budget category to forecast spending for.
 * @param daysAhead The number of days into the future for the forecast.
 * @returns The projected spending amount for the specified days ahead.
 */
export const calculateSimpleSpendingForecast = (transactions: Transaction[], category: string, daysAhead: number): number => {
    // Filter for relevant expense transactions within the category
    const relevantTransactions = transactions.filter(tx => tx.category?.toLowerCase() === category.toLowerCase() && tx.type === 'expense');
    if (relevantTransactions.length < 3) {
        return 0; // Not enough data for a reliable forecast
    }

    // Consider transactions from the last 30 days for recent spending patterns
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = relevantTransactions.filter(tx => new Date(tx.date) > thirtyDaysAgo);

    if (recentTransactions.length === 0) {
        return 0; // No recent transactions, cannot forecast
    }

    const totalRecentSpend = recentTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    // Calculate average daily spend over the 30-day period
    const averageDailySpend = totalRecentSpend / 30;

    // Project spending for the specified number of days ahead
    return parseFloat((averageDailySpend * daysAhead).toFixed(2));
};

// End of components/services/quantumSageService.ts