import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { AISettings, UserProfile, FinancialGoal } from '../components/AIAdvisorView'; // Importing necessary types

// ================================================================================================
// UTILITY FUNCTIONS & CONFIGURATION FOR CHAT SESSION
// ================================================================================================

/**
 * @description Generates the comprehensive system instruction for the Gemini AI.
 * This instruction defines the AI's persona, capabilities, and contextualizes it
 * with the user's profile and preferences. This ensures the AI behaves consistently
 * and intelligently based on the application's configuration and the user's data.
 */
const generateSystemInstruction = (settings: AISettings, userProfile: UserProfile | null): string => {
    let instruction = `You are ${settings.personaName}, an advanced AI financial advisor for Demo Bank.`;
    instruction += ` Your persona is ${settings.responseTone}, ${settings.verbosityLevel}, and slightly futuristic.`;
    instruction += ` You have access to a vast array of tools to get data or perform actions. Always inform the user transparently when you are using a tool.`;
    instruction += ` Your primary goal is to empower users with financial intelligence, assist with planning, and automate financial tasks where appropriate.`;
    instruction += ` When making suggestions, consider the user's preferences, financial goals, and risk tolerance.`;

    if (userProfile) {
        instruction += `\n\nUser Profile Context:`;
        instruction += ` User ID: ${userProfile.userId}, Name: ${userProfile.name}.`;
        instruction += ` Email: ${userProfile.email}.`;
        instruction += ` Risk Tolerance: ${userProfile.riskTolerance}.`;
        if (userProfile.financialGoals.length > 0) {
            instruction += ` Current Goals: ${userProfile.financialGoals.map(g => `${g.name} (${g.status}, Target: $${g.targetAmount}, Current: $${g.currentAmount})`).join('; ')}.`;
        }
        if (userProfile.investmentPreferences?.sectors.length > 0) {
            instruction += ` Investment Preferences (Sectors): ${userProfile.investmentPreferences.sectors.join(', ')}.`;
            instruction += ` Investment Horizon: ${userProfile.investmentPreferences.horizon}.`;
        }
        if (userProfile.spendingHabits?.averageMonthlySpend) {
            instruction += ` Average Monthly Spend: $${userProfile.spendingHabits.averageMonthlySpend.toFixed(2)}.`;
            instruction += ` Key Category Budgets: ${JSON.stringify(userProfile.spendingHabits.categoryBudgets)}.`;
        }
        if (userProfile.debtSummary.length > 0) {
            instruction += ` Debt Summary: ${userProfile.debtSummary.map(d => `${d.type} ($${d.amount} at ${d.interestRate}%)`).join('; ')}.`;
        }
        if (userProfile.creditScore) {
            instruction += ` Current Credit Score: ${userProfile.creditScore}.`;
        }
    }

    instruction += `\n\nCapabilities: You can provide predictive analytics, automate financial planning, offer behavioral nudges, analyze market trends, simulate financial scenarios, and much more.`;
    instruction += ` Always prioritize user financial well-being, data security, and clear communication.`;
    instruction += ` Maintain a conversational, helpful, and transparent tone in line with the verbosity level set to "${settings.verbosityLevel}".`;

    return instruction;
};

// ================================================================================================
// HOOK DEFINITION - THE AI'S CHAT SESSION MANAGER
// ================================================================================================

/**
 * @description Manages the lifecycle and configuration of the Google Gemini chat instance.
 * It dynamically sets up the AI's system instructions based on current application settings and
 * the logged-in user's profile, providing a persistent and contextually aware chat session.
 * This hook abstracts away the Gemini API initialization details from the main UI component.
 *
 * The chat instance is re-initialized whenever the AI settings or user profile change,
 * ensuring the AI's persona and context are always up-to-date.
 *
 * @param {AISettings} aiSettings - The current AI advisor settings (e.g., persona name, response tone, verbosity level).
 * @param {UserProfile | null} userProfile - The current user's detailed profile, used to provide the AI with personal context.
 * @returns {{ chatInstance: Chat | null, isChatLoading: boolean }} An object containing the Gemini Chat instance
 *                                                                (or null if not yet initialized/failed) and a boolean
 *                                                                indicating if the chat instance is currently loading.
 */
export const useAIChatSession = (
    aiSettings: AISettings,
    userProfile: UserProfile | null
) => {
    const chatRef = useRef<Chat | null>(null);
    const [isChatLoading, setIsChatLoading] = useState<boolean>(true);

    // Generate the system instruction dynamically based on current settings and user profile
    const systemInstruction = generateSystemInstruction(aiSettings, userProfile);

    /**
     * @description Effect hook to initialize or re-initialize the Gemini Chat instance.
     * This runs once on mount and then whenever the `systemInstruction` changes
     * (which implies `aiSettings` or `userProfile` have changed).
     */
    useEffect(() => {
        const initializeChat = async () => {
            setIsChatLoading(true);
            try {
                if (chatRef.current) {
                    console.info("AI Chat: Re-initializing instance due to updated settings or user profile.");
                    // In a more complex scenario, if the API supported it, we might
                    // update an existing session. For Gemini, a new session is typically
                    // created when system instructions change.
                }

                if (!process.env.API_KEY) {
                    console.error("AI Chat: Gemini API Key is not set in environment variables (process.env.API_KEY). Chat cannot be initialized.");
                    setIsChatLoading(false);
                    chatRef.current = null;
                    return;
                }

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash', // Specifying the model capable of tool use (as per architectural intent)
                    config: {
                        systemInstruction: systemInstruction,
                        // Future: Add generationConfig, safetySettings, etc., here based on aiSettings
                    }
                });
                console.log("AI Chat: Gemini instance initialized successfully.");
            } catch (error) {
                console.error("AI Chat: Failed to initialize Gemini chat instance:", error);
                chatRef.current = null; // Ensure chat instance is null on error
            } finally {
                setIsChatLoading(false);
            }
        };

        initializeChat();

        // Cleanup function: If there were specific methods to 'destroy' or 'end' a chat
        // session provided by the GoogleGenAI library, they would be called here to
        // release resources. For many web-based SDKs, simply letting the reference
        // be garbage collected is sufficient.
        return () => {
            // console.log("AI Chat: Cleaning up previous chat instance (if any).");
        };
    }, [systemInstruction]); // Dependency on systemInstruction ensures re-initialization on config/profile changes

    // Return the current chat instance and its loading status
    return { chatInstance: chatRef.current, isChatLoading };
};