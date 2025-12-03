import React from 'react';

// ================================================================================================
// TYPE DEFINITIONS - EXPANDED UNIVERSE
// ================================================================================================

/**
 * @description Defines the structure of a message in the chat history.
 * Adheres to the format expected by the Gemini API for conversational context.
 * Includes an optional `toolCalls` field to represent when the AI is taking action.
 * EXPANDED to support rich content types like charts, tables, and proactive actions.
 */
export type Message = {
    id: string; // Unique ID for each message
    role: 'user' | 'model' | 'system';
    parts: { text: string }[];
    timestamp: Date;
    toolCalls?: ToolCall[];
    toolResponses?: ToolResponse[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    confidenceScore?: number; // AI's confidence in its response
    isProactive?: boolean; // Was this message initiated by the AI proactively?
    // Rich content expansion
    chartData?: ChartDataType;
    tableData?: TableDataType;
    actionSuggestions?: ActionSuggestion[];
    voiceAudioUrl?: string; // URL to AI-generated voice output
    imageContent?: string; // Base64 or URL for image generation/display
    feedback?: 'like' | 'dislike' | null; // User feedback on AI response
};

export type ToolCall = {
    toolName: string;
    args: Record<string, any>;
};

export type ToolResponse = {
    toolName: string;
    response: any;
    success: boolean;
    timestamp: Date;
};

export type ChartDataType = {
    type: 'bar' | 'line' | 'asymmetric-bar' | 'pie'; // Asymmetric for comparisons
    data: any; // Chart.js data structure
    options?: any; // Chart.js options structure
    title?: string;
    description?: string;
};

export type TableDataType = {
    headers: string[];
    rows: (string | number | React.ReactNode)[][];
    title?: string;
    description?: string;
    sortable?: boolean;
    filterable?: boolean;
};

export type ActionSuggestion = {
    id: string;
    text: string;
    actionType: 'link' | 'apiCall' | 'triggerUI' | 'deepDive';
    payload?: Record<string, any>; // Data needed to execute the action
    requiresConfirmation?: boolean; // E.g., for financial transactions
};

/**
 * @description Defines the structure for a user's financial goal.
 */
export type FinancialGoal = {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    priority: 'low' | 'medium' | 'high';
    type: 'savings' | 'investment' | 'debt_repayment';
    autoContribute?: number; // Monthly auto-contribution
    status: 'on_track' | 'at_risk' | 'achieved' | 'paused';
    alertsEnabled: boolean;
};

/**
 * @description Defines the comprehensive user profile that the AI has access to.
 */
export type UserProfile = {
    userId: string;
    name: string;
    email: string;
    riskTolerance: 'low' | 'medium' | 'high' | 'aggressive';
    financialGoals: FinancialGoal[];
    investmentPreferences: {
        sectors: string[];
        ethicalFactors: string[];
        horizon: 'short' | 'medium' | 'long';
    };
    spendingHabits: {
        categoryBudgets: Record<string, number>; // e.g., { "Food": 500 }
        averageMonthlySpend: number;
    };
    incomeSources: { type: string; amount: number; frequency: string }[];
    debtSummary: { type: string; amount: number; interestRate: number; minPayment: number }[];
    creditScore?: number;
    // ... many more dimensions
};

/**
 * @description AI Advisor Settings for personalization.
 */
export type AISettings = {
    personaName: string; // e.g., 'Quantum', 'Aura', 'Oracle'
    verbosityLevel: 'concise' | 'balanced' | 'verbose';
    proactiveLevel: 'minimal' | 'suggestive' | 'action-oriented';
    responseTone: 'professional' | 'friendly' | 'formal' | 'empathetic';
    learningRate: number; // How quickly AI adapts to user preferences (0-1)
    preferredLanguage: string;
    dataRetentionPolicy: 'default' | 'enhanced_privacy' | 'extended_history';
    accessibilityMode: {
        fontSize: 'small' | 'medium' | 'large';
        highContrast: boolean;
        speechRate: number;
    };
};

// ================================================================================================
// CONSTANTS & CONFIGURATION - THE UNIVERSE'S LAWS (Tool Definitions)
// ================================================================================================

/**
 * @description Defines the set of tools available to the AI.
 * Each tool represents a specific capability or data access point within the application.
 * In a real scenario, these would call actual backend services or client-side functions.
 */
export const AI_TOOLS = {
    GET_TRANSACTIONS: {
        name: "getTransactions",
        description: "Retrieves user's financial transactions based on filters like date range, category, amount.",
        parameters: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' }, category: { type: 'string' }, minAmount: { type: 'number' } } }
    },
    GET_ACCOUNT_BALANCES: {
        name: "getAccountBalances",
        description: "Fetches current balances for all user accounts.",
        parameters: { type: 'object', properties: { accountType: { type: 'string' } } }
    },
    GET_BUDGET_PROGRESS: {
        name: "getBudgetProgress",
        description: "Reports on the user's progress against specific budgets or all budgets.",
        parameters: { type: 'object', properties: { budgetName: { type: 'string' } } }
    },
    CREATE_BUDGET: {
        name: "createBudget",
        description: "Creates a new financial budget for the user.",
        parameters: { type: 'object', properties: { name: { type: 'string' }, amount: { type: 'number' }, category: { type: 'string' } }, required: ['name', 'amount', 'category'] }
    },
    GET_INVESTMENT_PORTFOLIO: {
        name: "getInvestmentPortfolio",
        description: "Retrieves detailed information about the user's investment portfolio, including performance, holdings, and risk metrics.",
        parameters: { type: 'object', properties: { detailed: { type: 'boolean' } } }
    },
    SIMULATE_PORTFOLIO_GROWTH: {
        name: "simulatePortfolioGrowth",
        description: "Simulates potential growth of an investment portfolio based on various inputs like additional contributions, time horizon, and projected returns.",
        parameters: { type: 'object', properties: { initialAmount: { type: 'number' }, monthlyContribution: { type: 'number' }, years: { type: 'number' }, annualReturnRate: { type: 'number' } }, required: ['initialAmount', 'monthlyContribution', 'years', 'annualReturnRate'] }
    },
    GET_LOAN_DETAILS: {
        name: "getLoanDetails",
        description: "Provides details about a specific loan or all user loans, including remaining balance, interest rate, and payment schedule.",
        parameters: { type: 'object', properties: { loanId: { type: 'string' }, loanType: { type: 'string' } } }
    },
    GET_FINANCIAL_GOALS: {
        name: "getFinancialGoals",
        description: "Retrieves the user's defined financial goals.",
        parameters: { type: 'object', properties: { status: { type: 'string', enum: ['on_track', 'at_risk', 'achieved', 'paused'] } } }
    },
    UPDATE_FINANCIAL_GOAL: {
        name: "updateFinancialGoal",
        description: "Updates an existing financial goal, e.g., target amount or date.",
        parameters: { type: 'object', properties: { goalId: { type: 'string' }, targetAmount: { type: 'number' }, targetDate: { type: 'string' } }, required: ['goalId'] }
    },
    ANALYZE_SPENDING_PATTERNS: {
        name: "analyzeSpendingPatterns",
        description: "Analyzes user's spending habits over a period, identifying trends, outliers, and potential savings areas.",
        parameters: { type: 'object', properties: { startDate: { type: 'string' }, endDate: { type: 'string' }, categories: { type: 'array', items: { type: 'string' } } } }
    },
    GET_MARKET_DATA: {
        name: "getMarketData",
        description: "Fetches real-time or historical market data for specified stocks, indices, or cryptocurrencies.",
        parameters: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' } } }
    },
    SUGGEST_INVESTMENT_STRATEGY: {
        name: "suggestInvestmentStrategy",
        description: "Suggests personalized investment strategies based on user's risk tolerance, goals, and market conditions.",
        parameters: { type: 'object', properties: { riskTolerance: { type: 'string' }, investmentHorizon: { type: 'string' } } }
    },
    SEND_NOTIFICATION: {
        name: "sendNotification",
        description: "Sends a notification to the user (e.g., for alerts, reminders).",
        parameters: { type: 'object', properties: { recipient: { type: 'string' }, message: { type: 'string' }, urgency: { type: 'string', enum: ['low', 'medium', 'high'] } } }
    }
    // ... hundreds more tools for every financial operation imaginable
} as const;

export type AIToolName = keyof typeof AI_TOOLS;