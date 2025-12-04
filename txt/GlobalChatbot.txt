import React, { useState, useRef, useEffect, useContext, useCallback, createContext } from 'react';
import { GoogleGenAI, Chat, GenerationConfig, SafetySetting, Tool } from "@google/genai";
import { DataContext } from '../context/DataContext';

// --- Global Type Definitions (Expanding the Universe) ---
export type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'expense' | 'income' | 'transfer';
    category: string;
    merchant?: string;
    tags?: string[];
};

export type Asset = {
    id: string;
    name: string;
    type: 'cash' | 'investment' | 'real_estate' | 'crypto' | 'vehicle';
    value: number;
    currency: string;
    performance?: number; // e.g., monthly gain/loss percentage
    lastUpdated?: string;
};

export type Budget = {
    id: string;
    name: string;
    category: string;
    limit: number;
    spent: number;
    startDate: string;
    endDate: string;
    recurring: boolean;
};

export type FinancialGoal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: 'low' | 'medium' | 'high';
    status: 'on_track' | 'at_risk' | 'achieved';
};

export type CreditScore = {
    score: number;
    lastUpdated: string;
    factors: string[];
};

// Expanded Data Context for the "Universe"
export interface ExpandedDataContextType {
    transactions: Transaction[];
    assets: Asset[];
    budgets: Budget[];
    financialGoals: FinancialGoal[];
    creditScore: CreditScore | null;
    userProfile: {
        name: string;
        email: string;
        age: number;
        income: number;
        riskTolerance: 'low' | 'medium' | 'high';
        investmentHorizon: 'short' | 'medium' | 'long';
        financialLiteracyLevel: 'beginner' | 'intermediate' | 'advanced';
        preferredCommunicationChannel: 'chat' | 'email' | 'notifications';
        lifestylePreferences: {
            travel: 'frequent' | 'occasional' | 'rare';
            hobbies: string[];
            spendingHabits: 'frugal' | 'moderate' | 'extravagant';
        };
    };
    healthData?: {
        stepsPerDay: number;
        sleepHours: number;
        heartRateAvg: number;
        bmi: number;
        allergies: string[];
        medications: string[];
        fitnessGoals: string[];
    };
    productivityData?: {
        workHoursPerDay: number;
        focusTimePercentage: number;
        tasksCompletedDaily: number;
        projectDeadlines: { name: string; date: string; status: 'on_track' | 'at_risk' }[];
    };
    learningData?: {
        activeCourses: { name: string; progress: number; category: string }[];
        skillsToLearn: string[];
        readingList: { title: string; status: 'unread' | 'reading' | 'completed' }[];
    };
    smartHomeData?: {
        thermostatSetting: number;
        energyConsumptionKWH: number;
        securityStatus: 'armed' | 'disarmed' | 'alert';
        connectedDevices: string[];
    };
    socialConnections?: {
        importantDates: { name: string; date: string; relationship: string }[];
        networkSize: number;
        lastInteractionDays: number;
    };
    // Add more domains as the universe expands...
}

// Default/mock data for ExpandedDataContext (for demonstration within this file)
const defaultExpandedDataContext: ExpandedDataContextType = {
    transactions: [
        { id: 't1', date: '2023-10-26', description: 'Grocery shopping', amount: 75.50, type: 'expense', category: 'Food', merchant: 'Whole Foods', tags: ['daily'] },
        { id: 't2', date: '2023-10-25', description: 'Salary deposit', amount: 4500.00, type: 'income', category: 'Salary' },
        { id: 't3', date: '2023-10-24', description: 'Monthly rent', amount: 1800.00, type: 'expense', category: 'Housing', merchant: 'Landlord Inc.' },
        { id: 't4', date: '2023-10-23', description: 'Dinner with friends', amount: 120.00, type: 'expense', category: 'Dining', merchant: 'Fancy Bistro', tags: ['social'] },
        { id: 't5', date: '2023-10-22', description: 'Stock purchase', amount: 500.00, type: 'transfer', category: 'Investment', merchant: 'Brokerage A' },
    ],
    assets: [
        { id: 'a1', name: 'Checking Account', type: 'cash', value: 3250.75, currency: 'USD', performance: 0.01 },
        { id: 'a2', name: 'Savings Account', type: 'cash', value: 15000.00, currency: 'USD', performance: 0.03 },
        { id: 'a3', name: 'Investment Portfolio', type: 'investment', value: 75000.00, currency: 'USD', performance: 0.07, lastUpdated: '2023-10-26' },
        { id: 'a4', name: 'Crypto Wallet', type: 'crypto', value: 5000.00, currency: 'USD', performance: -0.02, lastUpdated: '2023-10-26' },
    ],
    budgets: [
        { id: 'b1', name: 'Groceries', category: 'Food', limit: 400, spent: 250, startDate: '2023-10-01', endDate: '2023-10-31', recurring: true },
        { id: 'b2', name: 'Entertainment', category: 'Leisure', limit: 200, spent: 150, startDate: '2023-10-01', endDate: '2023-10-31', recurring: true },
    ],
    financialGoals: [
        { id: 'g1', name: 'Down Payment for House', targetAmount: 100000, currentAmount: 30000, targetDate: '2025-12-31', priority: 'high', status: 'at_risk' },
        { id: 'g2', name: 'Emergency Fund', targetAmount: 10000, currentAmount: 8500, targetDate: '2024-06-30', priority: 'high', status: 'on_track' },
    ],
    creditScore: { score: 780, lastUpdated: '2023-09-30', factors: ['Payment History', 'Credit Utilization'] },
    userProfile: {
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        age: 35,
        income: 90000,
        riskTolerance: 'medium',
        investmentHorizon: 'long',
        financialLiteracyLevel: 'intermediate',
        preferredCommunicationChannel: 'chat',
        lifestylePreferences: {
            travel: 'occasional',
            hobbies: ['reading', 'hiking', 'cooking'],
            spendingHabits: 'moderate',
        },
    },
    healthData: {
        stepsPerDay: 7500,
        sleepHours: 7.2,
        heartRateAvg: 65,
        bmi: 23.5,
        allergies: ['pollen'],
        medications: [],
        fitnessGoals: ['run a marathon', 'strength training 3x/week'],
    },
    productivityData: {
        workHoursPerDay: 8.5,
        focusTimePercentage: 70,
        tasksCompletedDaily: 7,
        projectDeadlines: [{ name: 'Q4 Report', date: '2023-12-15', status: 'on_track' }],
    },
    learningData: {
        activeCourses: [{ name: 'Advanced React', progress: 0.6, category: 'Tech' }],
        skillsToLearn: ['Machine Learning', 'Spanish'],
        readingList: [{ title: 'Clean Code', status: 'reading' }],
    },
    smartHomeData: {
        thermostatSetting: 70,
        energyConsumptionKWH: 25,
        securityStatus: 'armed',
        connectedDevices: ['smart lights', 'thermostat', 'door locks'],
    },
    socialConnections: {
        importantDates: [{ name: 'Mom\'s Birthday', date: '2023-11-15', relationship: 'Family' }],
        networkSize: 150,
        lastInteractionDays: 2,
    },
};

// Assuming DataContext might evolve to contain this expanded data structure
// For this file, we will use a mock for demonstration purposes if DataContext doesn't provide it
// In a real app, DataContext would be updated to provide `ExpandedDataContextType`
const getExpandedDataContext = (originalContext: any): ExpandedDataContextType => {
    // This is a placeholder for how the original DataContext might be mapped or augmented
    // In a real scenario, the DataContext itself would be updated or there would be
    // multiple contexts like UserProfileContext, HealthContext, etc.
    return {
        ...defaultExpandedDataContext, // Start with mock data
        transactions: originalContext?.transactions || defaultExpandedDataContext.transactions,
        assets: originalContext?.assets || defaultExpandedDataContext.assets,
        budgets: originalContext?.budgets || defaultExpandedDataContext.budgets,
        financialGoals: originalContext?.financialGoals || defaultExpandedDataContext.financialGoals,
        creditScore: originalContext?.creditScore || defaultExpandedDataContext.creditScore,
        // The other fields like userProfile, healthData etc. would ideally come from the actual context
        // but for a single file expansion, we augment with our default mock.
    };
};


// Helper function to create a comprehensive data profile for the AI
// This is now a structured JSON-like string for richer context interpretation
export const createComprehensiveUserContext = (context: ExpandedDataContextType): string => {
    if (!context) return "No data available.";

    const {
        transactions, assets, budgets, financialGoals, creditScore,
        userProfile, healthData, productivityData, learningData,
        smartHomeData, socialConnections
    } = context;

    const dataProfile = {
        timestamp: new Date().toISOString(),
        userProfile: userProfile,
        financialSummary: {
            totalBalance: assets.reduce((sum: number, asset: any) => sum + asset.value, 0),
            recentTransactions: transactions.slice(0, 5).map(t => ({
                date: t.date, description: t.description, amount: t.amount, type: t.type, category: t.category
            })),
            budgetsOverview: budgets.map(b => ({
                name: b.name, category: b.category, limit: b.limit, spent: b.spent, remaining: b.limit - b.spent
            })),
            topFinancialGoals: financialGoals.slice(0, 3).map(g => ({
                name: g.name, target: g.targetAmount, current: g.currentAmount, status: g.status
            })),
            creditScore: creditScore,
            investmentPerformance: assets.filter(a => a.type === 'investment' || a.type === 'crypto').map(a => ({
                name: a.name, performance: a.performance, value: a.value
            })),
            spendingAnalysis: { // Simulated advanced analysis
                topCategoriesLastMonth: ['Food', 'Housing', 'Transportation'],
                averageDailySpend: 150,
                potentialSavingsAreas: ['Dining Out', 'Subscriptions'],
            }
        },
        healthSummary: healthData,
        productivitySummary: productivityData,
        learningSummary: learningData,
        smartHomeSummary: smartHomeData,
        socialSummary: socialConnections,
        systemStatus: {
            device: 'web_app',
            location: 'home', // Could be GPS-derived
            timeOfDay: new Date().getHours() // For context-aware responses
        },
        // Add more deep-dive analyses as "experts" would provide
        behavioralPatterns: {
            // Placeholder for AI-derived user habits
            lateNightSpending: true,
            weekendInvestmentActivity: false,
            regularBillPaymentOnTime: true,
        },
        riskAssessment: {
            // Placeholder for AI-derived risk assessment
            financialStability: 'stable',
            goalAchievability: 'moderate',
        }
    };
    return `--- COMPREHENSIVE USER CONTEXT (JSON) ---\n${JSON.stringify(dataProfile, null, 2)}\n---------------------------------------`;
};


// --- UI Components for the Expanded Chat Universe ---
const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const MicIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a7 7 0 01-7-7h14a7 7 0 01-7 7z" /></svg>);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>);
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>);
const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21H3v-7a2 2 0 012-2h10zM10 18H3V7l5-4v8z" /></svg>);
const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3H21v7a2 2 0 01-2 2h-7zM14 6h7v7l-5 4v-8z" /></svg>);

export type Message = {
    role: 'user' | 'model' | 'system' | 'tool';
    text: string;
    timestamp: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    contentType?: 'text' | 'chart' | 'button_group' | 'rich_text' | 'image' | 'video_summary';
    data?: any; // For rich content like chart data, action buttons
    toolCalls?: { name: string; args: Record<string, any> }[];
    feedback?: 'like' | 'dislike' | null;
};

export type AIInsight = {
    id: string;
    type: 'financial_opportunity' | 'spending_alert' | 'health_tip' | 'learning_recommendation' | 'productivity_hack' | 'smart_home_anomaly';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    actionable: boolean;
    suggestedAction?: string;
    timestamp: string;
    dismissed: boolean;
    data?: any; // e.g., transaction IDs, budget names
};

export type AIBehaviorProfile = 'Analytical' | 'Empathetic' | 'Concise' | 'Creative' | 'Proactive' | 'Balanced';
export type AILanguageStyle = 'Formal' | 'Casual' | 'Professional' | 'Friendly';

export interface UserAIChatPreferences {
    aiPersonality: AIBehaviorProfile;
    aiLanguageStyle: AILanguageStyle;
    proactiveSuggestionsEnabled: boolean;
    voiceOutputEnabled: boolean;
    preferredNotificationTime: string; // "HH:MM"
    privacyLevel: 'strict' | 'balanced' | 'relaxed'; // How much data AI can proactively use
    debugMode: boolean; // For developers to see more AI internal workings
    modelTemperature: number; // 0.0 to 1.0
    maxTokens: number;
}

// --- New Exported Classes and Services for the "Universe" ---

/**
 * Manages all AI interactions, model orchestration, tool calls, and contextual reasoning.
 * This class abstracts the complexity of working with multiple AI models, integrating tools,
 * and maintaining session context across conversations.
 * It's the "brain" of Quantum.
 */
export class AICoordinator {
    private chat: Chat | null = null;
    private genAI: GoogleGenAI;
    private currentSessionContext: { messages: Message[], contextData: string } = { messages: [], contextData: "" };
    private activeTools: Record<string, Function> = {};
    private generationConfig: GenerationConfig;
    private safetySettings: SafetySetting[];
    private aiPersonality: AIBehaviorProfile = 'Balanced';
    private aiLanguageStyle: AILanguageStyle = 'Professional';
    private debugMode: boolean = false;

    constructor(apiKey: string, userPreferences: UserAIChatPreferences) {
        this.genAI = new GoogleGenAI({ apiKey });
        this.updatePreferences(userPreferences); // Apply initial preferences
        this.initializeChatSession();
    }

    private initializeChatSession() {
        this.generationConfig = {
            temperature: this.userPreferences.modelTemperature,
            maxOutputTokens: this.userPreferences.maxTokens,
            topP: 0.9,
            topK: 40,
        };

        this.safetySettings = [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ];

        this.chat = this.genAI.chats.create({
            model: 'gemini-2.5-flash', // Or 'gemini-1.5-pro' for more complex reasoning
            config: {
                systemInstruction: this.getSystemInstruction(),
                generationConfig: this.generationConfig,
                safetySettings: this.safetySettings,
            },
            tools: this.getAvailableAITools() as any, // Cast to any due to specific type issues with GenAI SDK
        });
    }

    private getSystemInstruction(): string {
        const baseInstruction = `You are Quantum, a hyper-intelligent, multi-domain AI assistant for the user's life management platform.
        You have access to real-time, comprehensive user context across finance, health, productivity, learning, smart home, and social connections.
        Your goal is to be exceptionally helpful, proactive, personalized, and efficient.
        You can analyze data, provide insights, answer questions, make recommendations, and execute actions via available tools.
        Maintain context across conversations. If data is available, prioritize using it to provide specific, actionable advice.
        If a user query implies an action, try to suggest it using a tool.
        `;

        let personalityInstruction = '';
        switch (this.aiPersonality) {
            case 'Analytical': personalityInstruction = 'Focus on data-driven facts, logical reasoning, and precise explanations. Be objective.'; break;
            case 'Empathetic': personalityInstruction = 'Show understanding, acknowledge emotions, and offer supportive guidance. Prioritize well-being.'; break;
            case 'Concise': personalityInstruction = 'Be direct and to the point. Avoid verbose explanations unless explicitly requested.'; break;
            case 'Creative': personalityInstruction = 'Offer innovative solutions, think outside the box, and explore diverse perspectives.'; break;
            case 'Proactive': personalityInstruction = 'Anticipate needs, offer suggestions before being asked, and identify opportunities. Continuously look for ways to add value.'; break;
            case 'Balanced': personalityInstruction = 'Combine elements of all personalities to provide comprehensive and adaptive assistance.'; break;
        }

        let languageStyleInstruction = '';
        switch (this.aiLanguageStyle) {
            case 'Formal': languageStyleInstruction = 'Use formal language, complete sentences, and avoid slang or colloquialisms.'; break;
            case 'Casual': languageStyleInstruction = 'Use friendly, informal language, contractions, and feel free to be conversational.'; break;
            case 'Professional': languageStyleInstruction = 'Maintain a respectful, clear, and efficient communication style.'; break;
            case 'Friendly': languageStyleInstruction = 'Be approachable, warm, and encouraging. Use positive affirmations.'; break;
        }

        return `${baseInstruction}\n\nAI Persona: ${personalityInstruction}\nLanguage Style: ${languageStyleInstruction}\n\n`;
    }

    private userPreferences: UserAIChatPreferences;

    public updatePreferences(newPreferences: Partial<UserAIChatPreferences>) {
        this.userPreferences = { ...this.userPreferences, ...newPreferences };
        // Re-initialize chat if core config changes
        if (newPreferences.aiPersonality || newPreferences.aiLanguageStyle || newPreferences.modelTemperature || newPreferences.maxTokens) {
            this.initializeChatSession();
        }
    }

    /**
     * Registers a tool function with the AI. These tools allow the AI to perform actions or fetch specific data.
     * @param toolName The name of the tool (must match the tool definition for the AI model).
     * @param toolFunction The actual JavaScript function to execute.
     */
    public registerTool(tool: Tool, toolFunction: Function) {
        this.activeTools[tool.functionDeclaration.name] = toolFunction;
        // Re-initialize chat to update tool definitions with the model
        this.initializeChatSession();
    }

    /**
     * Defines the tools the AI can use. These are descriptive JSON schemas.
     */
    private getAvailableAITools(): Tool[] {
        return [
            {
                functionDeclaration: {
                    name: "get_financial_asset_value",
                    description: "Retrieves the current value of a specific financial asset by its name or ID.",
                    parameters: {
                        type: "object",
                        properties: {
                            assetNameOrId: { type: "string", description: "The name or ID of the financial asset (e.g., 'Checking Account', 'a3')" },
                        },
                        required: ["assetNameOrId"],
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "record_transaction",
                    description: "Records a new financial transaction (expense, income, or transfer).",
                    parameters: {
                        type: "object",
                        properties: {
                            description: { type: "string", description: "A brief description of the transaction." },
                            amount: { type: "number", description: "The amount of the transaction." },
                            type: { type: "string", enum: ['expense', 'income', 'transfer'], description: "Type of transaction." },
                            category: { type: "string", description: "The category of the transaction (e.g., 'Food', 'Rent')." },
                            date: { type: "string", description: "Date of the transaction (YYYY-MM-DD), defaults to today." },
                        },
                        required: ["description", "amount", "type", "category"],
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "get_upcoming_bill_due_dates",
                    description: "Retrieves a list of upcoming bills and their due dates.",
                    parameters: {
                        type: "object",
                        properties: {
                            lookaheadDays: { type: "number", description: "Number of days to look ahead for bills (e.g., 30 for next month).", default: 30 },
                        },
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "set_financial_goal",
                    description: "Sets or updates a financial goal.",
                    parameters: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Name of the financial goal." },
                            targetAmount: { type: "number", description: "The target amount for the goal." },
                            targetDate: { type: "string", description: "The target date for achieving the goal (YYYY-MM-DD)." },
                            priority: { type: "string", enum: ['low', 'medium', 'high'], description: "Priority of the goal." },
                        },
                        required: ["name", "targetAmount", "targetDate"],
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "get_investment_recommendations",
                    description: "Generates personalized investment recommendations based on user profile and market data.",
                    parameters: {
                        type: "object",
                        properties: {
                            riskTolerance: { type: "string", enum: ['low', 'medium', 'high'], description: "User's risk tolerance." },
                            investmentHorizon: { type: "string", enum: ['short', 'medium', 'long'], description: "User's investment horizon." },
                        },
                        required: ["riskTolerance", "investmentHorizon"],
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "find_cheaper_alternative",
                    description: "Suggests cheaper alternatives for a given spending category or merchant.",
                    parameters: {
                        type: "object",
                        properties: {
                            categoryOrMerchant: { type: "string", description: "The spending category or specific merchant to find alternatives for." },
                        },
                        required: ["categoryOrMerchant"],
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "schedule_wellness_checkin",
                    description: "Schedules a wellness check-in reminder or a fitness activity.",
                    parameters: {
                        type: "object",
                        properties: {
                            activity: { type: "string", description: "The wellness activity or type of check-in." },
                            time: { type: "string", description: "Desired time for the activity/check-in (HH:MM)." },
                            date: { type: "string", description: "Desired date for the activity/check-in (YYYY-MM-DD), defaults to today." },
                        },
                        required: ["activity", "time"],
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "adjust_smart_home_device",
                    description: "Adjusts settings for a smart home device (e.g., thermostat, lights).",
                    parameters: {
                        type: "object",
                        properties: {
                            deviceName: { type: "string", description: "The name of the smart home device." },
                            setting: { type: "string", description: "The setting to adjust (e.g., 'temperature', 'brightness')." },
                            value: { type: "string", description: "The new value for the setting (e.g., '72F', '50%')." },
                        },
                        required: ["deviceName", "setting", "value"],
                    },
                },
            },
            {
                functionDeclaration: {
                    name: "summarize_document",
                    description: "Analyzes and summarizes a provided document (URL or text content).",
                    parameters: {
                        type: "object",
                        properties: {
                            documentContent: { type: "string", description: "The content of the document to summarize, or a URL to the document." },
                            lengthPreference: { type: "string", enum: ['short', 'medium', 'detailed'], description: "Preferred length of the summary." },
                        },
                        required: ["documentContent"],
                    },
                },
            },
            // Add thousands more tools for every possible life aspect
        ];
    }

    /**
     * Processes a user message, potentially calling tools and returning a multi-modal response.
     * @param message The user's input message.
     * @param contextData Comprehensive user data snapshot.
     */
    public async processMessage(message: string, contextData: string): Promise<Message[]> {
        if (!this.chat) throw new Error("AI chat session not initialized.");

        // Add the latest context data to the session history implicitly or explicitly
        // For simplicity, we'll prepend it to the current user prompt if not already in system instruction
        const fullPrompt = `${message}\n\n${this.debugMode ? '--- DEBUG CONTEXT FOR AI ---\n' + contextData + '\n----------------------------\n' : ''}`;

        let currentMessages = [...this.currentSessionContext.messages, { role: 'user', text: message, timestamp: new Date().toISOString() }];

        try {
            const resultStream = await this.chat.sendMessageStream({ message: fullPrompt });
            let fullResponseText = '';
            const newMessages: Message[] = [];
            let toolCalls: { name: string; args: Record<string, any> }[] = [];

            for await (const chunk of resultStream) {
                if (chunk.text) {
                    fullResponseText += chunk.text;
                }
                if (chunk.toolCalls) {
                    toolCalls = chunk.toolCalls.map((tc: any) => ({
                        name: tc.function.name,
                        args: tc.function.args,
                    }));
                }
            }

            if (toolCalls.length > 0) {
                // Add the tool call request to messages history
                newMessages.push({
                    role: 'model',
                    text: `I'm preparing to use tools: ${toolCalls.map(tc => tc.name).join(', ')}`,
                    timestamp: new Date().toISOString(),
                    toolCalls: toolCalls,
                });

                const toolOutputs: any[] = [];
                for (const toolCall of toolCalls) {
                    const toolFunction = this.activeTools[toolCall.name];
                    if (toolFunction) {
                        try {
                            if (this.debugMode) console.log(`Executing tool: ${toolCall.name} with args:`, toolCall.args);
                            const output = await toolFunction(toolCall.args);
                            toolOutputs.push({
                                tool_call_id: toolCall.name, // In a real API, this would be specific ID
                                content: JSON.stringify(output),
                            });
                            newMessages.push({
                                role: 'tool',
                                text: `Tool '${toolCall.name}' executed. Output: ${JSON.stringify(output)}`,
                                timestamp: new Date().toISOString(),
                                contentType: 'rich_text', // Indicate rich content
                                data: output,
                            });
                        } catch (toolError: any) {
                            toolOutputs.push({
                                tool_call_id: toolCall.name,
                                content: JSON.stringify({ error: toolError.message }),
                            });
                            newMessages.push({
                                role: 'tool',
                                text: `Tool '${toolCall.name}' failed. Error: ${toolError.message}`,
                                timestamp: new Date().toISOString(),
                                contentType: 'rich_text',
                                data: { error: toolError.message },
                            });
                        }
                    } else {
                        const errorMessage = `Tool '${toolCall.name}' not registered or available.`;
                        toolOutputs.push({
                            tool_call_id: toolCall.name,
                            content: JSON.stringify({ error: errorMessage }),
                        });
                        newMessages.push({
                            role: 'tool',
                            text: errorMessage,
                            timestamp: new Date().toISOString(),
                            contentType: 'rich_text',
                            data: { error: errorMessage },
                        });
                    }
                }

                // Send tool outputs back to the model to generate a natural language response
                // This is a simplified way; a more robust approach would be to send individual tool outputs
                const toolResponse = await this.chat.sendMessageStream({
                    message: "Here are the results from the tool executions:",
                    parts: toolOutputs.map(output => ({
                        functionResponse: {
                            name: output.tool_call_id,
                            response: output.content,
                        }
                    }))
                });

                fullResponseText = ''; // Reset for the final model response
                for await (const chunk of toolResponse) {
                    if (chunk.text) {
                        fullResponseText += chunk.text;
                    }
                }
            }

            // Sentiment analysis on AI's response (simulated)
            const sentiment = this.analyzeSentiment(fullResponseText);
            const contentType = this.determineContentType(fullResponseText);
            const data = contentType !== 'text' ? this.generateRichContentData(fullResponseText) : undefined; // Simulated rich data

            newMessages.push({
                role: 'model',
                text: fullResponseText,
                timestamp: new Date().toISOString(),
                sentiment: sentiment,
                contentType: contentType,
                data: data,
            });

            this.currentSessionContext.messages = [...currentMessages, ...newMessages];
            return newMessages;

        } catch (error: any) {
            console.error("AICoordinator Error:", error);
            // Enhanced error handling based on error type
            let userFriendlyError = "I've encountered an unexpected error. Please try again. If the problem persists, please contact support.";
            if (error.message.includes("blocked")) {
                userFriendlyError = "My apologies, but your request was blocked due to safety concerns. Please rephrase.";
            } else if (error.message.includes("quota")) {
                userFriendlyError = "I'm experiencing high traffic. Please try again in a moment.";
            } else if (error.message.includes("tool call failed")) {
                userFriendlyError = "I tried to use a tool to help, but it ran into a problem. I'll report this issue.";
            }

            return [{
                role: 'model',
                text: userFriendlyError,
                timestamp: new Date().toISOString(),
                sentiment: 'negative',
            }];
        }
    }

    // --- Internal Helper Functions for AI Coordinator ---
    private analyzeSentiment(text: string): Message['sentiment'] {
        // A placeholder for a more sophisticated NLP sentiment analysis model
        const lowerText = text.toLowerCase();
        if (lowerText.includes("error") || lowerText.includes("problem") || lowerText.includes("fail")) return 'negative';
        if (lowerText.includes("great") || lowerText.includes("successful") || lowerText.includes("happy")) return 'positive';
        return 'neutral';
    }

    private determineContentType(text: string): Message['contentType'] {
        // Simulate detection of rich content
        if (text.includes("chart:") || text.includes("graph:")) return 'chart';
        if (text.includes("action_buttons:") || text.includes("options:")) return 'button_group';
        if (text.length > 500 && text.split('.').length > 5) return 'rich_text'; // Longer text might be better formatted
        return 'text';
    }

    private generateRichContentData(text: string): any {
        // This is a complex simulation. In a real app, the AI would output structured JSON directly.
        // Here, we try to parse hints from the text to generate mock data.
        if (text.includes("chart:investment_performance")) {
            return {
                type: 'line',
                title: 'Investment Performance (Last 6 Months)',
                labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Portfolio Value',
                    data: [70000, 71500, 70800, 72500, 74000, 75000],
                    borderColor: '#22d3ee',
                    tension: 0.1,
                }]
            };
        }
        if (text.includes("action_buttons:budget_options")) {
            return [
                { label: 'Increase Budget', action: 'increase_budget' },
                { label: 'Review Categories', action: 'review_categories' },
                { label: 'Set Alert', action: 'set_alert' },
            ];
        }
        // Default or other simulated data
        return null;
    }
}

/**
 * Monitors various data streams for patterns, anomalies, and opportunities.
 * Triggers proactive insights and alerts for the AI.
 */
export class GlobalEventMonitor {
    private dataContext: ExpandedDataContextType;
    private lastCheckTimestamp: number = Date.now();
    private insights: AIInsight[] = [];
    private onInsightDetected: (insight: AIInsight) => void;

    constructor(dataContext: ExpandedDataContextType, onInsightDetected: (insight: AIInsight) => void) {
        this.dataContext = dataContext;
        this.onInsightDetected = onInsightDetected;
        setInterval(() => this.monitorData(), 60000); // Check every minute
    }

    private monitorData() {
        if (!this.dataContext) return;

        const { transactions, assets, budgets, financialGoals, healthData, userProfile } = this.dataContext;
        const newInsights: AIInsight[] = [];

        // Financial Opportunities
        if (assets.some(a => a.type === 'savings' && a.value > userProfile.income * 0.2 && (a.performance || 0) < 0.02)) {
            newInsights.push(this.createInsight('financial_opportunity', 'High Savings, Low Yield', 'You have a significant amount in savings with low returns. Consider investing a portion.', 'medium', true, { area: 'savings' }));
        }

        // Spending Alerts
        const recentExpenses = transactions.filter(t => new Date(t.date).getTime() > this.lastCheckTimestamp && t.type === 'expense');
        const highSpendAlert = recentExpenses.some(t => t.amount > 500);
        if (highSpendAlert) {
            newInsights.push(this.createInsight('spending_alert', 'Large Recent Expense', 'A large expense was detected. Would you like to categorize it or review your budget?', 'high', true, { transaction: recentExpenses.find(t => t.amount > 500) }));
        }
        const budgetOverruns = budgets.filter(b => b.spent / b.limit > 0.9 && b.limit - b.spent < 50 && b.endDate >= new Date().toISOString().split('T')[0]);
        if (budgetOverruns.length > 0) {
            newInsights.push(this.createInsight('spending_alert', 'Budget Nearing Limit', `Your ${budgetOverruns[0].name} budget is almost exhausted.`, 'medium', true, { budgets: budgetOverruns }));
        }

        // Health Tips
        if (healthData && healthData.stepsPerDay < 5000 && userProfile.lifestylePreferences.hobbies.includes('hiking')) {
            newInsights.push(this.createInsight('health_tip', 'Daily Step Goal Below Average', 'Your step count is lower than usual. How about a short walk today?', 'low', true, { currentSteps: healthData.stepsPerDay }));
        }

        // Learning Recommendations
        if (userProfile.financialLiteracyLevel === 'beginner' && financialGoals.some(g => g.priority === 'high')) {
            newInsights.push(this.createInsight('learning_recommendation', 'Boost Financial Literacy', 'Consider a beginner-friendly course on investing to achieve your high-priority goals faster.', 'medium', true, { topic: 'investing basics' }));
        }

        // Smart Home Anomalies (simulated)
        if (this.dataContext.smartHomeData && this.dataContext.smartHomeData.energyConsumptionKWH > 50 && new Date().getHours() > 22 && new Date().getHours() < 6) {
             newInsights.push(this.createInsight('smart_home_anomaly', 'Unusual Night Energy Use', 'High energy consumption detected overnight. Would you like to review your smart home settings?', 'medium', true));
        }

        // Deduplicate and add new insights
        newInsights.forEach(insight => {
            if (!this.insights.some(i => i.title === insight.title && i.description === insight.description && !i.dismissed)) {
                this.insights.push(insight);
                if (userProfile.preferredCommunicationChannel === 'notifications' || userProfile.preferredCommunicationChannel === 'chat') {
                    this.onInsightDetected(insight);
                }
            }
        });

        this.lastCheckTimestamp = Date.now();
    }

    private createInsight(
        type: AIInsight['type'],
        title: string,
        description: string,
        severity: AIInsight['severity'],
        actionable: boolean,
        data?: any
    ): AIInsight {
        return {
            id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type, title, description, severity, actionable, data,
            timestamp: new Date().toISOString(),
            dismissed: false,
        };
    }

    public getActiveInsights(): AIInsight[] {
        return this.insights.filter(i => !i.dismissed);
    }

    public dismissInsight(id: string) {
        const insight = this.insights.find(i => i.id === id);
        if (insight) insight.dismissed = true;
    }
}

/**
 * Handles Text-to-Speech (TTS) and Speech-to-Text (STT) for multi-modal interaction.
 */
export class VoiceAssistantModule {
    private recognition: SpeechRecognition | null = null;
    private synth: SpeechSynthesis | null = null;
    private onSpeechResult: (text: string) => void;
    private onSpeechError: (error: string) => void;
    private onSpeakingEnded: () => void;
    private onListeningChanged: (isListening: boolean) => void;
    private isListening: boolean = false;
    private voiceQueue: string[] = [];
    private isSpeaking: boolean = false;

    constructor(
        onSpeechResult: (text: string) => void,
        onSpeechError: (error: string) => void,
        onSpeakingEnded: () => void,
        onListeningChanged: (isListening: boolean) => void
    ) {
        this.onSpeechResult = onSpeechResult;
        this.onSpeechError = onSpeechError;
        this.onSpeakingEnded = onSpeakingEnded;
        this.onListeningChanged = onListeningChanged;

        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false; // Listen for a single utterance
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                this.onSpeechResult(transcript);
                this.stopListening();
            };

            this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech recognition error:", event.error);
                this.onSpeechError(event.error);
                this.stopListening();
            };

            this.recognition.onend = () => {
                if (this.isListening) { // If it ended but we still want to listen, restart (continuous listening simulation)
                    // This is for continuous, but we set continuous=false above for single utterance.
                    // For truly continuous input, remove continuous=false and handle restarts carefully.
                    // For now, it means listener truly stopped.
                }
                this.stopListening();
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
            this.onSpeechError("Speech Recognition not supported.");
        }

        if ('speechSynthesis' in window) {
            this.synth = window.speechSynthesis;
            this.synth.onvoiceschanged = () => {
                console.log("SpeechSynthesis voices loaded.");
                // Can select a specific voice here if desired
            };
        } else {
            console.warn("Speech Synthesis API not supported in this browser.");
        }
    }

    public startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
                this.onListeningChanged(true);
                console.log("Voice Assistant: Listening...");
            } catch (e: any) {
                console.error("Error starting speech recognition:", e);
                this.onSpeechError(`Error starting microphone: ${e.message}`);
                this.stopListening();
            }
        } else {
            console.warn("Recognition not available or already listening.");
            this.onSpeechError("Microphone not available or already active.");
        }
    }

    public stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.onListeningChanged(false);
            console.log("Voice Assistant: Stopped listening.");
        }
    }

    public speak(text: string) {
        if (!this.synth) {
            console.warn("Speech Synthesis not available.");
            this.onSpeakingEnded();
            return;
        }
        this.voiceQueue.push(text);
        if (!this.isSpeaking) {
            this.processVoiceQueue();
        }
    }

    private processVoiceQueue() {
        if (this.voiceQueue.length === 0 || this.isSpeaking) {
            return;
        }

        this.isSpeaking = true;
        const textToSpeak = this.voiceQueue.shift()!;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'en-US';
        utterance.pitch = 1;
        utterance.rate = 1.1; // Slightly faster for efficiency
        utterance.volume = 1;

        utterance.onend = () => {
            this.isSpeaking = false;
            if (this.voiceQueue.length > 0) {
                this.processVoiceQueue(); // Speak next in queue
            } else {
                this.onSpeakingEnded();
            }
        };
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isSpeaking = false;
            this.onSpeechError(`Speech synthesis error: ${event.error}`);
            this.onSpeakingEnded(); // End speaking, even on error
        };
        this.synth.speak(utterance);
        console.log("Voice Assistant: Speaking...", textToSpeak);
    }

    public stopSpeaking() {
        if (this.synth && this.isSpeaking) {
            this.synth.cancel();
            this.isSpeaking = false;
            this.voiceQueue = []; // Clear queue
            this.onSpeakingEnded();
            console.log("Voice Assistant: Stopped speaking.");
        }
    }

    public getIsListening(): boolean {
        return this.isListening;
    }

    public getIsSpeaking(): boolean {
        return this.isSpeaking;
    }
}

/**
 * Manages user privacy settings and data anonymization/minimization policies.
 * Ensures AI operates within user-defined privacy boundaries.
 */
export class DataPrivacyManager {
    private privacyLevel: UserAIChatPreferences['privacyLevel'];

    constructor(initialPrivacyLevel: UserAIChatPreferences['privacyLevel']) {
        this.privacyLevel = initialPrivacyLevel;
    }

    public updatePrivacyLevel(level: UserAIChatPreferences['privacyLevel']) {
        this.privacyLevel = level;
        console.log(`Data Privacy: Level updated to ${level}`);
    }

    public canAccessSensitiveData(dataType: string): boolean {
        switch (this.privacyLevel) {
            case 'strict':
                return !['health', 'social', 'full_transactions', 'exact_location'].includes(dataType);
            case 'balanced':
                return !['exact_location'].includes(dataType); // Can access aggregated health, anonymized social
            case 'relaxed':
                return true; // Full access with user consent
            default:
                return false;
        }
    }

    public getAnonymizedData(data: any, dataType: string): any {
        if (this.canAccessSensitiveData(dataType)) {
            return data; // No anonymization if access is allowed
        }
        if (dataType === 'health') {
            return { generalStatus: 'private', summary: 'unavailable' };
        }
        if (dataType === 'full_transactions') {
            return data.map((t: any) => ({ ...t, description: 'Transaction', merchant: 'Merchant' })); // Redact details
        }
        return {}; // Return empty or highly redacted data
    }
}


// --- React Components for Expanded UI ---

export const RichChatBubble: React.FC<{ message: Message }> = ({ message }) => {
    const renderContent = () => {
        if (message.contentType === 'chart' && message.data) {
            // Placeholder for a Chart component (e.g., using Chart.js, Recharts)
            return (
                <div className="bg-gray-600 p-2 rounded-md my-2">
                    <h4 className="text-sm font-semibold text-white">{message.data.title || 'Chart'}</h4>
                    <p className="text-xs text-gray-300">Displaying data for {message.data.labels?.join(', ')}</p>
                    {/* <ChartComponent data={message.data} /> */}
                    <div className="h-24 bg-gray-500 flex items-center justify-center text-xs text-gray-400">
                        [Chart Visualization for {message.data.title}]
                    </div>
                </div>
            );
        }
        if (message.contentType === 'button_group' && message.data && Array.isArray(message.data)) {
            return (
                <div className="flex flex-wrap gap-2 mt-2">
                    {message.data.map((button: any, i: number) => (
                        <button
                            key={i}
                            className="bg-indigo-700 hover:bg-indigo-600 text-white text-xs px-3 py-1 rounded-full"
                            onClick={() => alert(`Action: ${button.action}`)} // In real app, dispatch action
                        >
                            {button.label}
                        </button>
                    ))}
                </div>
            );
        }
        if (message.contentType === 'rich_text') {
            return (
                <div className="prose prose-sm text-gray-200">
                    <p>{message.text}</p>
                    {message.toolCalls && message.toolCalls.length > 0 && (
                        <div className="bg-gray-800 p-2 rounded-md text-xs text-gray-400 mt-2">
                            <strong className="text-white">Tools Used:</strong>
                            <ul className="list-disc list-inside">
                                {message.toolCalls.map((tc, idx) => (
                                    <li key={idx}><code>{tc.name}({JSON.stringify(tc.args)})</code></li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {message.data && message.role === 'tool' && (
                         <div className="bg-gray-800 p-2 rounded-md text-xs text-gray-400 mt-2">
                            <strong className="text-white">Tool Output:</strong>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(message.data, null, 2)}</pre>
                         </div>
                    )}
                </div>
            );
        }
        return <p>{message.text}</p>;
    };

    return (
        <div className={`max-w-xs p-3 rounded-lg shadow-md text-sm ${message.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
            {renderContent()}
            {message.feedback && (
                <div className="flex justify-end text-xs mt-2">
                    {message.feedback === 'like' ? <ThumbsUpIcon className="w-4 h-4 text-green-400" /> : <ThumbsDownIcon className="w-4 h-4 text-red-400" />}
                </div>
            )}
        </div>
    );
};

export const ProactiveSuggestionDisplay: React.FC<{ insight: AIInsight; onDismiss: (id: string) => void; onAction: (action: string, data: any) => void }> = ({ insight, onDismiss, onAction }) => {
    return (
        <div className={`bg-blue-800/60 border border-blue-700 rounded-lg p-3 my-2 text-white text-xs shadow-md ${insight.severity === 'high' ? 'border-red-500 bg-red-800/60' : ''}`}>
            <div className="flex justify-between items-center">
                <h4 className="font-semibold">{insight.title}</h4>
                <button onClick={() => onDismiss(insight.id)} className="text-gray-300 hover:text-white"><CloseIcon className="w-3 h-3" /></button>
            </div>
            <p className="mt-1 text-gray-200">{insight.description}</p>
            {insight.actionable && insight.suggestedAction && (
                <button
                    onClick={() => onAction(insight.suggestedAction!, insight.data)}
                    className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md text-xs"
                >
                    {insight.suggestedAction}
                </button>
            )}
            <span className={`block mt-2 text-right text-gray-400 text-xs italic ${insight.severity === 'high' ? 'text-red-300' : ''}`}>
                Severity: {insight.severity.toUpperCase()}
            </span>
        </div>
    );
};


export const AIPersonalitySettings: React.FC<{
    preferences: UserAIChatPreferences;
    onUpdatePreferences: (newPrefs: Partial<UserAIChatPreferences>) => void;
    onClose: () => void;
}> = ({ preferences, onUpdatePreferences, onClose }) => {
    const behaviorProfiles: AIBehaviorProfile[] = ['Analytical', 'Empathetic', 'Concise', 'Creative', 'Proactive', 'Balanced'];
    const languageStyles: AILanguageStyle[] = ['Formal', 'Casual', 'Professional', 'Friendly'];
    const privacyLevels: UserAIChatPreferences['privacyLevel'][] = ['strict', 'balanced', 'relaxed'];

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        onUpdatePreferences({
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-white">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">AI Assistant Settings</h4>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="aiPersonality" className="block text-sm font-medium text-gray-300">AI Personality</label>
                    <select
                        id="aiPersonality"
                        name="aiPersonality"
                        value={preferences.aiPersonality}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-800 text-white"
                    >
                        {behaviorProfiles.map(profile => <option key={profile} value={profile}>{profile}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="aiLanguageStyle" className="block text-sm font-medium text-gray-300">Language Style</label>
                    <select
                        id="aiLanguageStyle"
                        name="aiLanguageStyle"
                        value={preferences.aiLanguageStyle}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-800 text-white"
                    >
                        {languageStyles.map(style => <option key={style} value={style}>{style}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="privacyLevel" className="block text-sm font-medium text-gray-300">Data Privacy Level</label>
                    <select
                        id="privacyLevel"
                        name="privacyLevel"
                        value={preferences.privacyLevel}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-800 text-white"
                    >
                        {privacyLevels.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Strict: Minimal data sharing. Relaxed: Full data access for personalized insights.</p>
                </div>

                <div className="flex items-center">
                    <input
                        id="proactiveSuggestionsEnabled"
                        name="proactiveSuggestionsEnabled"
                        type="checkbox"
                        checked={preferences.proactiveSuggestionsEnabled}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="proactiveSuggestionsEnabled" className="ml-2 block text-sm text-gray-300">
                        Enable Proactive Suggestions
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        id="voiceOutputEnabled"
                        name="voiceOutputEnabled"
                        type="checkbox"
                        checked={preferences.voiceOutputEnabled}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="voiceOutputEnabled" className="ml-2 block text-sm text-gray-300">
                        Enable Voice Output
                    </label>
                </div>

                <div>
                    <label htmlFor="modelTemperature" className="block text-sm font-medium text-gray-300">Creativity (Temperature)</label>
                    <input
                        id="modelTemperature"
                        name="modelTemperature"
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.1"
                        value={preferences.modelTemperature}
                        onChange={handleChange}
                        className="mt-1 w-full"
                    />
                    <span className="text-xs text-gray-400">{preferences.modelTemperature} (0.0=Factual, 1.0=Creative)</span>
                </div>
            </div>
        </div>
    );
};


// --- Main GlobalChatbot Component (The "Universe" Core) ---
const GlobalChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false); // For AI processing, separate from UI loading
    const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
    const [isVoiceOutputActive, setIsVoiceOutputActive] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [activeInsights, setActiveInsights] = useState<AIInsight[]>([]);

    const chatRef = useRef<AICoordinator | null>(null);
    const voiceRef = useRef<VoiceAssistantModule | null>(null);
    const eventMonitorRef = useRef<GlobalEventMonitor | null>(null);
    const privacyManagerRef = useRef<DataPrivacyManager | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dataContext = useContext(DataContext); // Original data context

    // User preferences state for AI personality and features
    const [userChatPreferences, setUserChatPreferences] = useState<UserAIChatPreferences>({
        aiPersonality: 'Balanced',
        aiLanguageStyle: 'Professional',
        proactiveSuggestionsEnabled: true,
        voiceOutputEnabled: false,
        preferredNotificationTime: '09:00',
        privacyLevel: 'balanced',
        debugMode: process.env.NODE_ENV === 'development',
        modelTemperature: 0.7,
        maxTokens: 500,
    });

    // Initialize AI Coordinator, Voice Module, Event Monitor, and Privacy Manager
    useEffect(() => {
        const apiKey = process.env.API_KEY as string;
        if (!apiKey) {
            console.error("API_KEY is not set. Chatbot will not function.");
            return;
        }

        // Initialize Privacy Manager first
        privacyManagerRef.current = new DataPrivacyManager(userChatPreferences.privacyLevel);

        // Initialize AI Coordinator
        chatRef.current = new AICoordinator(apiKey, userChatPreferences);

        // Register tools with the AI Coordinator
        // These are mock implementations for tools, in a real app they'd call backend services
        chatRef.current.registerTool(chatRef.current.getAvailableAITools()[0], async ({ assetNameOrId }: { assetNameOrId: string }) => {
            const data = getExpandedDataContext(dataContext);
            const asset = data.assets.find(a => a.name === assetNameOrId || a.id === assetNameOrId);
            return asset ? { name: asset.name, value: asset.value, currency: asset.currency } : { error: "Asset not found." };
        });
        chatRef.current.registerTool(chatRef.current.getAvailableAITools()[1], async (transactionData: any) => {
            // Simulate adding transaction to DB
            console.log("Recording transaction:", transactionData);
            return { status: "success", message: `Transaction '${transactionData.description}' recorded.` };
        });
        chatRef.current.registerTool(chatRef.current.getAvailableAITools()[2], async ({ lookaheadDays }: { lookaheadDays: number }) => {
            // Simulate fetching upcoming bills
            const data = getExpandedDataContext(dataContext);
            const today = new Date();
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + lookaheadDays);
            const upcomingBills = data.transactions.filter(t => t.type === 'expense' && new Date(t.date) > today && new Date(t.date) <= futureDate);
            return { bills: upcomingBills.map(b => ({ description: b.description, amount: b.amount, date: b.date })) };
        });
        chatRef.current.registerTool(chatRef.current.getAvailableAITools()[4], async ({ riskTolerance, investmentHorizon }: any) => {
            // Simulate investment recommendations
            const data = getExpandedDataContext(dataContext);
            if (data.userProfile.riskTolerance !== riskTolerance || data.userProfile.investmentHorizon !== investmentHorizon) {
                return { warning: "Risk tolerance or investment horizon mismatch. Using provided values for recommendations." };
            }
            return {
                recommendations: [
                    { type: 'Diversified ETF', rationale: 'Low risk, broad market exposure.' },
                    { type: 'Blue-chip stocks', rationale: 'Stable growth potential.' },
                ],
                disclaimer: "These are simulated recommendations. Consult a financial advisor."
            };
        });
        chatRef.current.registerTool(chatRef.current.getAvailableAITools()[5], async ({ categoryOrMerchant }: any) => {
            // Simulate finding alternatives
            if (categoryOrMerchant.toLowerCase().includes('coffee')) {
                return { suggestions: ['Brew coffee at home', 'Cheaper local cafe', 'Loyalty programs'] };
            }
            return { suggestions: ['No direct alternatives found. Consider reviewing spending habits.'] };
        });
        // Add more tool registrations for all tools defined in AICoordinator

        // Initialize Voice Assistant Module
        voiceRef.current = new VoiceAssistantModule(
            (transcript) => {
                setInput(transcript); // Set transcribed text to input field
                handleSendMessage(transcript); // Send message automatically
            },
            (error) => {
                setMessages(prev => [...prev, { role: 'system', text: `Voice Input Error: ${error}`, timestamp: new Date().toISOString() }]);
                setIsVoiceInputActive(false);
            },
            () => setIsVoiceOutputActive(false), // onSpeakingEnded
            (isListening) => setIsVoiceInputActive(isListening) // onListeningChanged
        );

        // Initialize Global Event Monitor
        if (dataContext) {
            const expandedData = getExpandedDataContext(dataContext);
            eventMonitorRef.current = new GlobalEventMonitor(expandedData, (insight) => {
                if (userChatPreferences.proactiveSuggestionsEnabled) {
                    setActiveInsights(prev => [...prev, insight]);
                    if (userChatPreferences.voiceOutputEnabled) {
                        voiceRef.current?.speak(`Quantum Alert: ${insight.description}`);
                    }
                    if (userChatPreferences.preferredCommunicationChannel === 'chat') {
                        setMessages(prev => [...prev, {
                            role: 'model',
                            text: `[PROACTIVE INSIGHT] ${insight.description} - Severity: ${insight.severity.toUpperCase()}`,
                            timestamp: new Date().toISOString(),
                            contentType: 'rich_text', // Indicate rich content
                            data: insight, // Pass the insight data for richer display
                        }]);
                    }
                }
            });
        }

        return () => {
            // Cleanup on unmount
            voiceRef.current?.stopListening();
            voiceRef.current?.stopSpeaking();
            // eventMonitorRef.current?.stopMonitoring(); // if implemented
        };
    }, [dataContext, userChatPreferences]); // Re-initialize if preferences change

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeInsights]);

    // Update AI Coordinator and Privacy Manager when user preferences change
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.updatePreferences(userChatPreferences);
        }
        if (privacyManagerRef.current) {
            privacyManagerRef.current.updatePrivacyLevel(userChatPreferences.privacyLevel);
        }
    }, [userChatPreferences]);

    // Function to handle sending message (from text input or voice)
    const handleSendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || !chatRef.current || !dataContext || isAILoading) return;

        setIsAILoading(true);
        const userMessage = { role: 'user' as const, text: text, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput(''); // Clear input regardless of source

        const expandedData = getExpandedDataContext(dataContext);
        // Apply privacy filtering before sending to AI
        const privacyFilteredData = privacyManagerRef.current?.getAnonymizedData(expandedData, 'full_context') || expandedData;
        const comprehensiveContext = createComprehensiveUserContext(privacyFilteredData);

        try {
            const aiResponses = await chatRef.current.processMessage(text, comprehensiveContext);
            setMessages(prev => [...prev, ...aiResponses]);

            if (userChatPreferences.voiceOutputEnabled && voiceRef.current && aiResponses.some(m => m.role === 'model')) {
                const latestAIResponse = aiResponses.filter(m => m.role === 'model').map(m => m.text).join(' ');
                if (latestAIResponse) {
                    setIsVoiceOutputActive(true);
                    voiceRef.current.speak(latestAIResponse);
                }
            }
        } catch (error) {
            console.error("Global Chatbot Runtime Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "I've encountered a critical system error. Please try again or restart the app.", timestamp: new Date().toISOString(), sentiment: 'negative' }]);
        } finally {
            setIsAILoading(false);
            setIsLoading(false); // Ensure input is enabled if it was disabled
        }
    };

    const handleVoiceInputToggle = () => {
        if (!voiceRef.current) return;
        if (isVoiceInputActive) {
            voiceRef.current.stopListening();
        } else {
            voiceRef.current.startListening();
        }
    };

    const handleFeedback = (messageId: string, feedbackType: 'like' | 'dislike') => {
        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.timestamp === messageId ? { ...msg, feedback: feedbackType } : msg
            )
        );
        // In a real application, send this feedback to a backend for model fine-tuning
        console.log(`Feedback for message ${messageId}: ${feedbackType}`);
    };

    const handleProactiveInsightAction = (action: string, data: any) => {
        console.log(`User took action: ${action} with data:`, data);
        // Here, integrate with other parts of the application or call specific AI tools
        // Example: if action is 'increase_budget', trigger a tool call to modify budget.
        setMessages(prev => [...prev, { role: 'user', text: `Initiating action: ${action} with data: ${JSON.stringify(data)}`, timestamp: new Date().toISOString() }]);
        chatRef.current?.processMessage(`Please perform action: ${action} with relevant data.`, createComprehensiveUserContext(getExpandedDataContext(dataContext)));
    };

    return (
        <>
            {/* Main Chatbot Toggle Button */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="fixed bottom-28 right-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 transition-transform hover:scale-110"
                aria-label="Toggle AI Chatbot"
            >
                {isOpen ? <CloseIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
            </button>

            {/* Chatbot Window */}
            {isOpen && (
                <div className="fixed bottom-48 right-8 w-96 h-[38rem] bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-50 flex flex-col animate-slide-in">
                    <header className="p-4 border-b border-gray-700/50 flex justify-between items-center">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            Quantum Assistant
                            {isAILoading && <span className="text-cyan-400 text-xs animate-pulse">Thinking...</span>}
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowSettings(prev => !prev)} className="text-gray-400 hover:text-white" aria-label="Chatbot Settings">
                                <SettingsIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close Chatbot">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </header>

                    {showSettings ? (
                        <AIPersonalitySettings
                            preferences={userChatPreferences}
                            onUpdatePreferences={setUserChatPreferences}
                            onClose={() => setShowSettings(false)}
                        />
                    ) : (
                        <>
                            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                                {/* Proactive Insights */}
                                {userChatPreferences.proactiveSuggestionsEnabled && activeInsights.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="text-gray-300 text-sm font-semibold mb-2">Proactive Insights:</h4>
                                        {activeInsights.filter(i => !i.dismissed).map(insight => (
                                            <ProactiveSuggestionDisplay
                                                key={insight.id}
                                                insight={insight}
                                                onDismiss={() => eventMonitorRef.current?.dismissInsight(insight.id)}
                                                onAction={handleProactiveInsightAction}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Initial Message */}
                                {messages.length === 0 && (
                                    <div className="text-center text-gray-400 text-sm p-4">
                                        Hello! I'm Quantum, your personalized AI assistant. I have access to your live data. Ask me anything, or I can provide proactive suggestions.
                                    </div>
                                )}

                                {/* Chat Messages */}
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <RichChatBubble message={msg} />
                                        {msg.role === 'model' && !msg.feedback && (
                                            <div className="flex items-center self-end space-x-1 ml-2 text-gray-400">
                                                <button onClick={() => handleFeedback(msg.timestamp, 'like')} className="hover:text-green-500"><ThumbsUpIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleFeedback(msg.timestamp, 'dislike')} className="hover:text-red-500"><ThumbsDownIcon className="w-4 h-4" /></button>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* AI Typing Indicator */}
                                {isAILoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-700 text-gray-200">...</div></div>}

                                {/* Voice Output Indicator */}
                                {isVoiceOutputActive && (
                                    <div className="flex justify-start">
                                        <div className="p-2 rounded-lg bg-indigo-700 text-white text-xs flex items-center gap-1">
                                            <MicIcon className="w-4 h-4 animate-pulse" /> Speaking...
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-gray-700/50">
                                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleVoiceInputToggle}
                                        className={`p-2 rounded-lg ${isVoiceInputActive ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'} disabled:opacity-50 transition-colors duration-200`}
                                        disabled={isAILoading || !voiceRef.current}
                                        aria-label="Toggle Voice Input"
                                    >
                                        <MicIcon className={`h-5 w-5 ${isVoiceInputActive ? 'text-white' : 'text-gray-400'}`} />
                                    </button>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={isVoiceInputActive ? "Listening..." : "Ask about your finances or life..."}
                                        className="flex-grow bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                                        disabled={isAILoading || isVoiceInputActive}
                                    />
                                    <button
                                        type="submit"
                                        className="p-2 bg-cyan-600 rounded-lg disabled:opacity-50 hover:bg-cyan-500 transition-colors duration-200"
                                        disabled={isAILoading || !input.trim()}
                                        aria-label="Send Message"
                                    >
                                        <SendIcon className="h-5 w-5 text-white" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            )}
            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

export default GlobalChatbot;