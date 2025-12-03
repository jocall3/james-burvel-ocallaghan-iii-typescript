# The Covenants of Will

These are the Covenants of Spending, the self-imposed architectural blueprints that give structure to your financial life. A budget is not a restriction; it is a declaration of intent. It is the deliberate channeling of resources toward what is truly valued. To honor these covenants is to build a life where every expenditure is an affirmation of your principles.

---

### A Fable for the Builder: The Architect's Workshop

(What is a budget? Most see it as a cage. A set of rules to restrict freedom. A necessary evil. We see it differently. We see it as an act of architecture. A budget is not a cage you are put into. It is a cathedral you build for your own life, a space designed to elevate your highest intentions.)

(When you create a budget in this view, you are not just setting a spending limit. You are making a covenant with your future self. You are declaring, "This is what I value. This is the shape of the life I intend to build." The AI, the `AIConsejero`, understands this. It sees itself not as a guard, but as a fellow architect, helping you to ensure your creation is sound.)

(Its core logic here is what we call 'Structural Integrity Analysis.' It looks at the covenants you have madeâ€”your budgetsâ€”and compares them to the actual forces being exerted upon themâ€”your transactions. The beautiful `RadialBarChart` is its real-time stress test. The filling of the circle is the rising load on that pillar of your cathedral.)

(When a budget is strained, when the color shifts from cool cyan to warning amber, the AI does not sound a simple alarm. It analyzes the nature of the stress. Is it a single, heavy, unexpected load? Or is it a thousand small, persistent pressures? Its advice is tailored to the diagnosis. It doesn't just say, "You are overspending." It says, "The pressure on your 'Dining' covenant is consistently high. Perhaps the covenant itself was not built to withstand the reality of your life. Shall we consider redesigning it?")

(This is the difference between a tool and a partner. A tool tells you when you've broken a rule. A partner helps you write better rules. The AI is here not to enforce your budgets, but to help you design budgets that are a true and honest reflection of the life you want to live. It is helping you build a cathedral that is not only beautiful in its design, but strong enough to stand.)

---
import React, { 
    useState, 
    useEffect, 
    useCallback, 
    useMemo, 
    createContext, 
    useContext, 
    useReducer,
    Fragment,
    forwardRef,
    useRef
} from 'react';
import {
    LayoutGrid,
    Plus,
    Edit,
    Trash2,
    BarChart2,
    AlertTriangle,
    CheckCircle,
    Info,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    X,
    Calendar,
    Download,
    Settings,
    Bell,
    TrendingUp,
    Zap
} from 'lucide-react';

// SECTION: TYPES AND INTERFACES
// =================================================================================================

/**
 * @type {string} Unique identifier for a budget.
 */
export type BudgetId = string;

/**
 * @type {string} Unique identifier for a transaction.
 */
export type TransactionId = string;

/**
 * @type {string} Unique identifier for a category.
 */
export type CategoryId = string;

/**
 * @enum {string} The cycle or period for a budget.
 */
export enum BudgetPeriod {
    Weekly = 'weekly',
    Monthly = 'monthly',
    Quarterly = 'quarterly',
    Yearly = 'yearly',
    Custom = 'custom',
}

/**
 * @enum {string} The type of budgeting strategy.
 */
export enum BudgetType {
    Fixed = 'fixed',          // Standard fixed amount per period (e.g., $500/month)
    Variable = 'variable',    // Budget amount changes based on income or other factors
    Rollover = 'rollover',    // Unused funds roll over to the next period
    ZeroBased = 'zero_based'  // Every dollar of income is assigned to a budget
}

/**
 * @interface Category
 * @description Represents a spending category.
 */
export interface Category {
    id: CategoryId;
    name: string;
    icon: string; // e.g., 'utensils', 'car', 'home'
    color: string; // e.g., '#FF5733'
    parentCategoryId?: CategoryId;
}

/**
 * @interface Transaction
 * @description Represents a single financial transaction.
 */
export interface Transaction {
    id: TransactionId;
    budgetId: BudgetId;
    categoryId: CategoryId;
    amount: number;
    description: string;
    date: string; // ISO 8601 format
    isRecurring: boolean;
    merchant: string;
    notes?: string;
}

/**
 * @interface BudgetThreshold
 * @description Defines a notification threshold for a budget.
 */
export interface BudgetThreshold {
    percentage: number; // e.g., 80 for 80%
    alertType: 'warning' | 'critical';
}

/**
 * @interface Budget
 * @description The core budget structure, a "Covenant of Spending".
 */
export interface Budget {
    id: BudgetId;
    name: string;
    description?: string;
    amount: number;
    period: BudgetPeriod;
    type: BudgetType;
    startDate: string; // ISO 8601 format
    endDate?: string; // For custom period budgets
    categoryIds: CategoryId[];
    thresholds: BudgetThreshold[];
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * @interface BudgetPerformanceData
 * @description Data for analyzing a budget's performance over a specific period.
 */
export interface BudgetPerformanceData {
    periodLabel: string; // e.g., 'Jan 2023', 'Week 5'
    budgetedAmount: number;
    spentAmount: number;
    variance: number;
}

/**
 * @interface BudgetWithDetails
 * @description A budget object enriched with calculated fields and associated data.
 */
export interface BudgetWithDetails extends Budget {
    spentAmount: number;
    remainingAmount: number;
    progress: number; // 0 to 100
    transactions: Transaction[];
    categories: Category[];
    status: 'healthy' | 'warning' | 'overspent';
    daysLeftInPeriod: number;
    recommendedDailySpend: number;
    currentDailySpend: number;
    historicalPerformance: BudgetPerformanceData[];
}

/**
 * @enum {string} The level of severity for an AI insight.
 */
export enum AIInsightLevel {
    Info = 'info',
    Suggestion = 'suggestion',
    Warning = 'warning',
    Critical = 'critical',
}

/**
 * @interface AIInsightAction
 * @description A suggested action for the user based on an AI insight.
 */
export interface AIInsightAction {
    label: string;
    action: () => void;
}

/**
 * @interface AIInsight
 * @description An insight generated by the AIConsejero.
 */
export interface AIInsight {
    id: string;
    budgetId: BudgetId;
    title: string;
    analysis: string;
    level: AIInsightLevel;
    timestamp: string;
    actions: AIInsightAction[];
}

/**
 * @interface BudgetsViewState
 * @description The complete state for the BudgetsView.
 */
export interface BudgetsViewState {
    budgets: Record<BudgetId, Budget>;
    transactions: Record<TransactionId, Transaction>;
    categories: Record<CategoryId, Category>;
    aiInsights: AIInsight[];
    isLoading: boolean;
    error: string | null;
    selectedBudgetId: BudgetId | null;
    viewMode: 'grid' | 'list';
    filters: BudgetFilters;
}

/**
 * @interface BudgetFilters
 * @description Filters to be applied to the list of budgets.
 */
export interface BudgetFilters {
    searchTerm: string;
    period: BudgetPeriod | 'all';
    status: 'healthy' | 'warning' | 'overspent' | 'all';
    categoryId: CategoryId | 'all';
}

// SECTION: CONSTANTS & MOCK DATA
// =================================================================================================

export const DEFAULT_CURRENCY = 'USD';

/**
 * @const MOCK_CATEGORIES
 * @description A set of default categories for demonstration.
 */
export const MOCK_CATEGORIES: Record<CategoryId, Category> = {
    'cat-1': { id: 'cat-1', name: 'Groceries', icon: 'shopping-cart', color: '#4CAF50' },
    'cat-2': { id: 'cat-2', name: 'Dining Out', icon: 'utensils', color: '#FF9800' },
    'cat-3': { id: 'cat-3', name: 'Transportation', icon: 'bus', color: '#2196F3' },
    'cat-4': { id: 'cat-4', name: 'Utilities', icon: 'bolt', color: '#F44336' },
    'cat-5': { id: 'cat-5', name: 'Rent/Mortgage', icon: 'home', color: '#9C27B0' },
    'cat-6': { id: 'cat-6', name: 'Entertainment', icon: 'film', color: '#E91E63' },
    'cat-7': { id: 'cat-7', name: 'Health & Wellness', icon: 'heartbeat', color: '#00BCD4' },
    'cat-8': { id: 'cat-8', name: 'Shopping', icon: 'tshirt', color: '#795548' },
    'cat-9': { id: 'cat-9', name: 'Personal Care', icon: 'spa', color: '#673AB7'},
};

/**
 * @const MOCK_BUDGETS
 * @description A set of default budgets for demonstration.
 */
export const MOCK_BUDGETS: Record<BudgetId, Budget> = {
    'bud-1': {
        id: 'bud-1',
        name: 'Monthly Groceries',
        description: 'Covenant for essential nourishment.',
        amount: 500,
        period: BudgetPeriod.Monthly,
        type: BudgetType.Fixed,
        startDate: new Date(new Date().setDate(1)).toISOString(),
        categoryIds: ['cat-1'],
        thresholds: [{ percentage: 80, alertType: 'warning' }, { percentage: 100, alertType: 'critical' }],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    'bud-2': {
        id: 'bud-2',
        name: 'Dining & Entertainment',
        description: 'Allocations for social and leisure activities.',
        amount: 300,
        period: BudgetPeriod.Monthly,
        type: BudgetType.Rollover,
        startDate: new Date(new Date().setDate(1)).toISOString(),
        categoryIds: ['cat-2', 'cat-6'],
        thresholds: [{ percentage: 75, alertType: 'warning' }],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    'bud-3': {
        id: 'bud-3',
        name: 'Transportation Costs',
        amount: 150,
        period: BudgetPeriod.Monthly,
        type: BudgetType.Fixed,
        startDate: new Date(new Date().setDate(1)).toISOString(),
        categoryIds: ['cat-3'],
        thresholds: [],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    'bud-4': {
        id: 'bud-4',
        name: 'Quarterly Utilities',
        amount: 600,
        period: BudgetPeriod.Quarterly,
        type: BudgetType.Fixed,
        startDate: '2023-01-01T00:00:00.000Z',
        categoryIds: ['cat-4'],
        thresholds: [],
        isArchived: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
};


/**
 * @function generateMockTransactions
 * @description Generates realistic mock transactions for budgets.
 */
export const generateMockTransactions = (budgets: Record<BudgetId, Budget>): Record<TransactionId, Transaction> => {
    const transactions: Record<TransactionId, Transaction> = {};
    let transIdCounter = 1;
    const today = new Date();

    Object.values(budgets).forEach(budget => {
        if (budget.isArchived) return;

        const spendRatio = Math.random() * 1.2; // Can be overspent
        const numTransactions = Math.floor(Math.random() * 20) + 5;
        let totalSpent = 0;

        for (let i = 0; i < numTransactions && totalSpent < budget.amount * spendRatio; i++) {
            const amount = Math.floor(Math.random() * (budget.amount / 5)) + 5;
            const day = Math.floor(Math.random() * today.getDate()) + 1;
            const transDate = new Date(today.getFullYear(), today.getMonth(), day).toISOString();

            const transaction: Transaction = {
                id: `trans-${transIdCounter++}`,
                budgetId: budget.id,
                categoryId: budget.categoryIds[Math.floor(Math.random() * budget.categoryIds.length)],
                amount,
                description: `Mock purchase ${i + 1}`,
                date: transDate,
                isRecurring: Math.random() > 0.9,
                merchant: `Merchant #${Math.floor(Math.random() * 100)}`,
            };
            transactions[transaction.id] = transaction;
            totalSpent += amount;
        }
    });
    return transactions;
};

export const MOCK_TRANSACTIONS = generateMockTransactions(MOCK_BUDGETS);

// SECTION: MOCK API SERVICE
// =================================================================================================

/**
 * @class MockApiService
 * @description Simulates a backend API for fetching and manipulating budget data.
 */
export class MockApiService {
    private latency = 500; // ms

    private simulateNetwork<T>(data: T): Promise<T> {
        return new Promise(resolve => {
            setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), this.latency);
        });
    }

    async getBudgets(): Promise<Budget[]> {
        return this.simulateNetwork(Object.values(MOCK_BUDGETS));
    }

    async getTransactions(): Promise<Transaction[]> {
        return this.simulateNetwork(Object.values(MOCK_TRANSACTIONS));
    }

    async getCategories(): Promise<Category[]> {
        return this.simulateNetwork(Object.values(MOCK_CATEGORIES));
    }

    async getAllData(): Promise<{ budgets: Budget[], transactions: Transaction[], categories: Category[] }> {
        return this.simulateNetwork({
            budgets: Object.values(MOCK_BUDGETS),
            transactions: Object.values(MOCK_TRANSACTIONS),
            categories: Object.values(MOCK_CATEGORIES),
        });
    }

    async createBudget(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
        const newBudget: Budget = {
            ...budgetData,
            id: `bud-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        MOCK_BUDGETS[newBudget.id] = newBudget;
        return this.simulateNetwork(newBudget);
    }

    async updateBudget(budgetId: BudgetId, updates: Partial<Budget>): Promise<Budget> {
        if (!MOCK_BUDGETS[budgetId]) {
            throw new Error('Budget not found');
        }
        MOCK_BUDGETS[budgetId] = { ...MOCK_BUDGETS[budgetId], ...updates, updatedAt: new Date().toISOString() };
        return this.simulateNetwork(MOCK_BUDGETS[budgetId]);
    }

    async deleteBudget(budgetId: BudgetId): Promise<{ id: BudgetId }> {
        if (!MOCK_BUDGETS[budgetId]) {
            throw new Error('Budget not found');
        }
        delete MOCK_BUDGETS[budgetId];
        // Also delete associated transactions in a real app
        return this.simulateNetwork({ id: budgetId });
    }
}

export const apiService = new MockApiService();

// SECTION: STATE MANAGEMENT (Context & Reducer)
// =================================================================================================

type BudgetAction =
    | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS'; payload: { budgets: Record<BudgetId, Budget>, transactions: Record<TransactionId, Transaction>, categories: Record<CategoryId, Category> } }
    | { type: 'FETCH_ERROR'; payload: string }
    | { type: 'CREATE_BUDGET_SUCCESS'; payload: Budget }
    | { type: 'UPDATE_BUDGET_SUCCESS'; payload: Budget }
    | { type: 'DELETE_BUDGET_SUCCESS'; payload: BudgetId }
    | { type: 'SET_SELECTED_BUDGET'; payload: BudgetId | null }
    | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
    | { type: 'UPDATE_FILTERS'; payload: Partial<BudgetFilters> }
    | { type: 'SET_AI_INSIGHTS'; payload: AIInsight[] };

export const initialState: BudgetsViewState = {
    budgets: {},
    transactions: {},
    categories: {},
    aiInsights: [],
    isLoading: true,
    error: null,
    selectedBudgetId: null,
    viewMode: 'grid',
    filters: {
        searchTerm: '',
        period: 'all',
        status: 'all',
        categoryId: 'all',
    },
};

export function budgetsReducer(state: BudgetsViewState, action: BudgetAction): BudgetsViewState {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, isLoading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                budgets: action.payload.budgets,
                transactions: action.payload.transactions,
                categories: action.payload.categories
            };
        case 'FETCH_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'CREATE_BUDGET_SUCCESS':
            return {
                ...state,
                budgets: { ...state.budgets, [action.payload.id]: action.payload },
            };
        case 'UPDATE_BUDGET_SUCCESS':
            return {
                ...state,
                budgets: { ...state.budgets, [action.payload.id]: action.payload },
            };
        case 'DELETE_BUDGET_SUCCESS':
            const newBudgets = { ...state.budgets };
            delete newBudgets[action.payload];
            return { ...state, budgets: newBudgets };
        case 'SET_SELECTED_BUDGET':
            return { ...state, selectedBudgetId: action.payload };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'UPDATE_FILTERS':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SET_AI_INSIGHTS':
            return { ...state, aiInsights: action.payload };
        default:
            return state;
    }
}

export const BudgetsContext = createContext<{
    state: BudgetsViewState;
    dispatch: React.Dispatch<BudgetAction>;
    api: MockApiService;
} | undefined>(undefined);


// SECTION: UTILITY & HELPER FUNCTIONS
// =================================================================================================

/**
 * Formats a number as currency.
 * @param amount - The number to format.
 * @param currency - The currency code (e.g., 'USD').
 * @returns A formatted currency string.
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

/**
 * Calculates the start and end dates for a given budget period.
 * @param period - The budget period.
 * @param startDateStr - The start date of the budget as an ISO string.
 * @returns An object with `startDate` and `endDate`.
 */
export function getPeriodDateRange(period: BudgetPeriod, startDateStr: string): { startDate: Date; endDate: Date } {
    const startDate = new Date(startDateStr);
    let endDate: Date;

    switch (period) {
        case BudgetPeriod.Weekly:
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
            break;
        case BudgetPeriod.Monthly:
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case BudgetPeriod.Quarterly:
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        case BudgetPeriod.Yearly:
            endDate = new Date(startDate.getFullYear() + 1, startDate.getMonth(), 0);
            endDate.setHours(23, 59, 59, 999);
            break;
        default: // Custom or fallback
            endDate = new Date();
    }
    return { startDate, endDate };
}


/**
 * Calculates the number of days left in the current budget period.
 * @param period - The budget period.
 * @param startDateStr - The budget's start date as an ISO string.
 * @returns The number of days remaining.
 */
export function getDaysLeftInPeriod(period: BudgetPeriod, startDateStr: string): number {
    const { endDate } = getPeriodDateRange(period, startDateStr);
    const today = new Date();
    const diffTime = Math.max(0, endDate.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * A hook for managing modal state.
 * @returns An object with modal state and control functions.
 */
export function useModal() {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    return { isOpen, open, close };
}


// SECTION: AI CONSEJERO - The AI Architect's Assistant
// =================================================================================================

/**
 * @class AIConsejero
 * @description The AI engine for Structural Integrity Analysis.
 */
export class AIConsejero {
    private budgets: BudgetWithDetails[];
    private state: BudgetsViewState;

    constructor(state: BudgetsViewState) {
        // This is a simplified constructor. In a real app, this would be more complex.
        this.state = state;
        this.budgets = this.enrichBudgets(state);
    }
    
    private enrichBudgets(state: BudgetsViewState): BudgetWithDetails[] {
        // This function would contain the logic to calculate all the details for each budget.
        // For brevity, we'll keep this simple. A real implementation is below in `useEnrichedBudgets`.
        return Object.values(state.budgets).map(b => ({
            ...b,
            spentAmount: 0,
            remainingAmount: b.amount,
            progress: 0,
            transactions: [],
            categories: [],
            status: 'healthy',
            daysLeftInPeriod: 30,
            recommendedDailySpend: b.amount / 30,
            currentDailySpend: 0,
            historicalPerformance: [],
        }));
    }

    /**
     * Runs a full analysis on all budgets and returns insights.
     * @returns An array of AIInsight objects.
     */
    public runStructuralIntegrityAnalysis(): AIInsight[] {
        const insights: AIInsight[] = [];
        this.budgets.forEach(budget => {
            insights.push(...this.analyzeOverspending(budget));
            insights.push(...this.analyzePacing(budget));
            insights.push(...this.analyzeTransactionPatterns(budget));
            insights.push(...this.analyzeRolloverPotential(budget));
        });
        
        insights.push(...this.generateGlobalInsights());

        return insights.sort((a, b) => {
             const levelOrder = { [AIInsightLevel.Critical]: 0, [AIInsightLevel.Warning]: 1, [AIInsightLevel.Suggestion]: 2, [AIInsightLevel.Info]: 3 };
             return levelOrder[a.level] - levelOrder[b.level];
        });
    }

    private analyzeOverspending(budget: BudgetWithDetails): AIInsight[] {
        if (budget.status === 'overspent') {
            return [{
                id: `insight-${budget.id}-overspent`,
                budgetId: budget.id,
                title: 'Covenant Breached: Overspent',
                level: AIInsightLevel.Critical,
                analysis: `You have exceeded your ${formatCurrency(budget.amount)} budget for "${budget.name}" by ${formatCurrency(budget.spentAmount - budget.amount)}. This requires immediate attention to prevent further financial strain.`,
                timestamp: new Date().toISOString(),
                actions: [
                    { label: 'Review Transactions', action: () => console.log(`Reviewing ${budget.id}`) },
                    { label: 'Adjust Budget', action: () => console.log(`Adjusting ${budget.id}`) }
                ]
            }];
        }
        return [];
    }

    private analyzePacing(budget: BudgetWithDetails): AIInsight[] {
        const periodProgress = 1 - (budget.daysLeftInPeriod / 30); // Simplified for monthly
        if (budget.progress > periodProgress * 100 + 15 && budget.status !== 'overspent') {
             return [{
                id: `insight-${budget.id}-pacing`,
                budgetId: budget.id,
                title: 'High Stress on Covenant',
                level: AIInsightLevel.Warning,
                analysis: `You've spent ${budget.progress.toFixed(0)}% of your "${budget.name}" budget, but you are only ${(periodProgress * 100).toFixed(0)}% through the period. Your current spending pace may lead to overspending.`,
                timestamp: new Date().toISOString(),
                actions: [
                    { label: 'View Spending Pace Chart', action: () => console.log(`Pacing for ${budget.id}`) },
                    { label: 'Find Ways to Cut Back', action: () => console.log(`Tips for ${budget.id}`) }
                ]
            }];
        }
        return [];
    }
    
    private analyzeTransactionPatterns(budget: BudgetWithDetails): AIInsight[] {
        const smallFrequentTransactions = budget.transactions.filter(t => t.amount < 20);
        if (smallFrequentTransactions.length > 15) {
             const totalFromSmall = smallFrequentTransactions.reduce((sum, t) => sum + t.amount, 0);
             if (totalFromSmall / budget.spentAmount > 0.4) { // more than 40% of spending is from small transactions
                return [{
                    id: `insight-${budget.id}-patterns`,
                    budgetId: budget.id,
                    title: 'Analysis: Thousand Small Pressures',
                    level: AIInsightLevel.Suggestion,
                    analysis: `A significant portion (${formatCurrency(totalFromSmall)}) of your spending in "${budget.name}" comes from numerous small purchases. Bundling these needs or making conscious choices on small expenses could strengthen this covenant.`,
                    timestamp: new Date().toISOString(),
                    actions: [
                        { label: 'See Small Transactions', action: () => console.log(`Small trans for ${budget.id}`) }
                    ]
                }];
             }
        }
        return [];
    }

    private analyzeRolloverPotential(budget: BudgetWithDetails): AIInsight[] {
        if (budget.type === BudgetType.Rollover && budget.remainingAmount > 0 && budget.daysLeftInPeriod < 3) {
            return [{
                id: `insight-${budget.id}-rollover`,
                budgetId: budget.id,
                title: 'Surplus Allocation Opportunity',
                level: AIInsightLevel.Info,
                analysis: `You're on track to have a surplus of ~${formatCurrency(budget.remainingAmount)} in your "${budget.name}" budget. This amount will roll over to the next period, strengthening your future financial position.`,
                timestamp: new Date().toISOString(),
                actions: [
                    { label: 'Allocate to Savings Goal', action: () => console.log(`Allocating from ${budget.id}`) }
                ]
            }];
        }
        return [];
    }

    private generateGlobalInsights(): AIInsight[] {
        const insights: AIInsight[] = [];
        const totalBudgeted = this.budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = this.budgets.reduce((sum, b) => sum + b.spentAmount, 0);
        
        if (totalSpent / totalBudgeted < 0.5) {
             insights.push({
                id: 'global-underspending',
                budgetId: 'all',
                title: 'Overall Financial Health is Strong',
                level: AIInsightLevel.Info,
                analysis: `Your overall spending is well within your established covenants. This disciplined approach is building a strong financial foundation.`,
                timestamp: new Date().toISOString(),
                actions: []
             });
        }
        return insights;
    }
}

// SECTION: UI COMPONENTS
// =================================================================================================

/**
 * @component Spinner
 * @description A simple loading spinner.
 */
export const Spinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
    </div>
);

/**
 * @component ErrorDisplay
 * @description Displays an error message.
 */
export const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{message}</p>
    </div>
);

/**
 * @component Modal
 * @description A generic modal component.
 */
export const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg text-white" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
                </div>
                {children}
            </div>
        </div>
    );
};


/**
 * @component RadialBarChart
 * @description A placeholder for the beautiful radial bar chart mentioned in the fable.
 */
export const RadialBarChart = ({ progress, status }: { progress: number; status: 'healthy' | 'warning' | 'overspent' }) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const circumference = 2 * Math.PI * 50;
    const offset = circumference - (clampedProgress / 100) * circumference;
    
    const colorMap = {
        healthy: 'stroke-cyan-400',
        warning: 'stroke-amber-400',
        overspent: 'stroke-red-500',
    };

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="60" cy="60" />
                <circle
                    className={`${colorMap[status]} transition-all duration-500`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="50"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${progress > 100 ? 'text-red-500' : 'text-white'}`}>
                    {progress.toFixed(0)}%
                </span>
                <span className="text-xs text-gray-400">Spent</span>
            </div>
        </div>
    );
};

/**
 * @component BudgetCard
 * @description Displays a single budget covenant.
 */
export const BudgetCard = ({ budget }: { budget: BudgetWithDetails }) => {
    const { dispatch } = useContext(BudgetsContext)!;

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex flex-col justify-between hover:border-cyan-500 transition-colors duration-300">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-white">{budget.name}</h3>
                        <p className="text-sm text-gray-400">{budget.description || `A ${budget.period} covenant.`}</p>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => {}} className="text-gray-400 hover:text-white"><Edit size={16} /></button>
                         <button onClick={() => {}} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                </div>
                <div className="flex items-center justify-between my-4">
                    <div className="flex-1 pr-4">
                        <p className="text-sm text-gray-400">Spent</p>
                        <p className="text-xl font-semibold text-white">{formatCurrency(budget.spentAmount)}</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                            <div
                                className={`h-2.5 rounded-full ${budget.status === 'healthy' ? 'bg-cyan-500' : budget.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(budget.progress, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <RadialBarChart progress={budget.progress} status={budget.status} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-400">Remaining</p>
                        <p className={`font-medium ${budget.remainingAmount < 0 ? 'text-red-500' : 'text-green-400'}`}>
                            {formatCurrency(budget.remainingAmount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400">Total Budget</p>
                        <p className="font-medium text-white">{formatCurrency(budget.amount)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Days Left</p>
                        <p className="font-medium text-white">{budget.daysLeftInPeriod}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Rec. Daily Spend</p>
                        <p className="font-medium text-white">{formatCurrency(budget.recommendedDailySpend)}</p>
                    </div>
                </div>
            </div>
             <button 
                onClick={() => dispatch({ type: 'SET_SELECTED_BUDGET', payload: budget.id })}
                className="mt-4 w-full bg-gray-700 text-white py-2 rounded-md hover:bg-cyan-600 transition-colors"
            >
                View Details
            </button>
        </div>
    );
};

/**
 * @component BudgetFiltersPanel
 * @description Allows users to filter and sort the budgets list.
 */
export const BudgetFiltersPanel = () => {
    const { state, dispatch } = useContext(BudgetsContext)!;
    const { filters, categories } = state;

    const handleFilterChange = (key: keyof BudgetFilters, value: any) => {
        dispatch({ type: 'UPDATE_FILTERS', payload: { [key]: value } });
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-center">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search covenants..."
                    value={filters.searchTerm}
                    onChange={e => handleFilterChange('searchTerm', e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded-md w-full pl-10 pr-4 py-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
            <select
                value={filters.period}
                onChange={e => handleFilterChange('period', e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
            >
                <option value="all">All Periods</option>
                {Object.values(BudgetPeriod).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <select
                value={filters.status}
                onChange={e => handleFilterChange('status', e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
            >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="overspent">Overspent</option>
            </select>
            <select
                value={filters.categoryId}
                onChange={e => handleFilterChange('categoryId', e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
            >
                <option value="all">All Categories</option>
                {Object.values(categories).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
    );
};

/**
 * @component AIConsejeroPanel
 * @description The AI assistant sidebar.
 */
export const AIConsejeroPanel = () => {
    const { state, dispatch } = useContext(BudgetsContext)!;
    const [enrichedBudgets, setEnrichedBudgets] = useState<BudgetWithDetails[]>([]);

    useEffect(() => {
        // This is a placeholder for the enrichment logic.
        const budgetsWithDetails = Object.values(state.budgets).map(b => {
             const transactions = Object.values(state.transactions).filter(t => t.budgetId === b.id);
             const spentAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
             const remainingAmount = b.amount - spentAmount;
             const progress = b.amount > 0 ? (spentAmount / b.amount) * 100 : 0;
             const daysLeftInPeriod = getDaysLeftInPeriod(b.period, b.startDate);
             return {
                 ...b,
                 transactions,
                 spentAmount,
                 remainingAmount,
                 progress,
                 daysLeftInPeriod,
                 status: progress > 100 ? 'overspent' : progress > 80 ? 'warning' : 'healthy',
                 recommendedDailySpend: daysLeftInPeriod > 0 ? remainingAmount / daysLeftInPeriod : 0,
                 currentDailySpend: 0, // Needs more complex logic
                 categories: b.categoryIds.map(id => state.categories[id]).filter(Boolean),
                 historicalPerformance: [], // Needs historical data
             };
        });
        setEnrichedBudgets(budgetsWithDetails);
    }, [state.budgets, state.transactions, state.categories]);
    
    useEffect(() => {
        if (enrichedBudgets.length > 0) {
            const ai = new AIConsejero({ ...state, budgets: enrichedBudgets.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}) });
            const insights = ai.runStructuralIntegrityAnalysis();
            dispatch({ type: 'SET_AI_INSIGHTS', payload: insights });
        }
    }, [enrichedBudgets, dispatch, state]);


    const levelStyles = {
        [AIInsightLevel.Critical]: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-900/20' },
        [AIInsightLevel.Warning]: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-900/20' },
        [AIInsightLevel.Suggestion]: { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
        [AIInsightLevel.Info]: { icon: Info, color: 'text-gray-400', bg: 'bg-gray-700/20' },
    };

    return (
        <aside className="w-96 bg-gray-800/50 p-6 rounded-lg flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="text-cyan-400" />
                AI Consejero
            </h2>
            <p className="text-gray-400 mb-6">Your architectural assistant for financial integrity.</p>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {state.aiInsights.length === 0 && <p className="text-gray-500">No new insights at this time. All structures are sound.</p>}
                {state.aiInsights.map(insight => {
                    const styles = levelStyles[insight.level];
                    const Icon = styles.icon;
                    return (
                        <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${styles.bg} border-current ${styles.color}`}>
                            <div className="flex items-center gap-3">
                                <Icon size={20} />
                                <h4 className="font-bold text-white">{insight.title}</h4>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">{insight.analysis}</p>
                            {insight.actions.length > 0 && (
                                <div className="mt-3 flex gap-2">
                                    {insight.actions.map(action => (
                                        <button key={action.label} onClick={action.action} className="text-xs bg-gray-700 hover:bg-cyan-600 px-2 py-1 rounded text-white">
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

/**
 * @hook useEnrichedBudgets
 * @description A custom hook to memoize the calculation of enriched budget data.
 */
export function useEnrichedBudgets(state: BudgetsViewState) {
    return useMemo(() => {
        const activeBudgets = Object.values(state.budgets).filter(b => !b.isArchived);
        
        const enriched = activeBudgets.map(budget => {
            const { startDate, period } = budget;
            const { startDate: periodStart, endDate: periodEnd } = getPeriodDateRange(period, startDate);

            const transactions = Object.values(state.transactions).filter(t => {
                const tDate = new Date(t.date);
                return t.budgetId === budget.id && tDate >= periodStart && tDate <= periodEnd;
            });
            
            const spentAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
            const remainingAmount = budget.amount - spentAmount;
            const progress = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : spentAmount > 0 ? 101 : 0;
            const daysLeftInPeriod = getDaysLeftInPeriod(period, startDate);

            let status: 'healthy' | 'warning' | 'overspent' = 'healthy';
            if (progress >= 100) {
                status = 'overspent';
            } else if (budget.thresholds.some(th => progress >= th.percentage)) {
                status = 'warning';
            }
            
            return {
                 ...budget,
                 transactions,
                 spentAmount,
                 remainingAmount,
                 progress,
                 daysLeftInPeriod,
                 status,
                 recommendedDailySpend: daysLeftInPeriod > 0 ? Math.max(0, remainingAmount) / daysLeftInPeriod : 0,
                 currentDailySpend: 0, // Placeholder
                 categories: budget.categoryIds.map(id => state.categories[id]).filter(Boolean),
                 historicalPerformance: [], // Placeholder
            };
        });

        // Apply filters
        const { searchTerm, period, status, categoryId } = state.filters;
        return enriched.filter(b => {
             const searchTermMatch = searchTerm === '' || 
                                     b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                     b.description?.toLowerCase().includes(searchTerm.toLowerCase());
             const periodMatch = period === 'all' || b.period === period;
             const statusMatch = status === 'all' || b.status === status;
             const categoryMatch = categoryId === 'all' || b.categoryIds.includes(categoryId);
             return searchTermMatch && periodMatch && statusMatch && categoryMatch;
        });
        
    }, [state.budgets, state.transactions, state.categories, state.filters]);
}


// SECTION: MAIN VIEW COMPONENT
// =================================================================================================

/**
 * @component BudgetsView
 * @description The main container for the entire budget management experience.
 * This component acts as the orchestrator, fetching data, managing state,
 * and rendering the primary layout with all its sub-components.
 */
export const BudgetsView = () => {
    const [state, dispatch] = useReducer(budgetsReducer, initialState);
    const enrichedBudgets = useEnrichedBudgets(state);
    const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                const { budgets, transactions, categories } = await apiService.getAllData();
                dispatch({
                    type: 'FETCH_SUCCESS',
                    payload: {
                        budgets: budgets.reduce((acc, b) => ({ ...acc, [b.id]: b }), {}),
                        transactions: transactions.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}),
                        categories: categories.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
                    }
                });
            } catch (err) {
                dispatch({ type: 'FETCH_ERROR', payload: 'Failed to load financial data.' });
            }
        };

        fetchData();
    }, []);

    const contextValue = useMemo(() => ({ state, dispatch, api: apiService }), [state, dispatch]);

    if (state.isLoading) {
        return <div className="h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>;
    }

    if (state.error) {
        return <div className="h-screen bg-gray-900 flex items-center justify-center"><ErrorDisplay message={state.error} /></div>;
    }

    return (
        <BudgetsContext.Provider value={contextValue}>
            <div className="bg-gray-900 text-white min-h-screen p-8 font-sans">
                <main className="max-w-screen-2xl mx-auto">
                    <header className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold">The Covenants of Will</h1>
                            <p className="text-gray-400 mt-2">Architectural blueprints for your financial life.</p>
                        </div>
                        <button 
                            onClick={openForm}
                            className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus size={20} />
                            New Covenant
                        </button>
                    </header>
                    
                    <div className="flex gap-8">
                        <div className="flex-grow">
                            <BudgetFiltersPanel />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {enrichedBudgets.map(budget => (
                                    <BudgetCard key={budget.id} budget={budget} />
                                ))}
                            </div>
                            {enrichedBudgets.length === 0 && (
                                <div className="text-center py-20 bg-gray-800 rounded-lg">
                                    <p className="text-gray-400">No covenants match your criteria.</p>
                                    <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or creating a new covenant.</p>
                                </div>
                            )}
                        </div>
                        <AIConsejeroPanel />
                    </div>
                </main>
                
                {/* Modals would be rendered here */}
                <Modal isOpen={isFormOpen} onClose={closeForm} title="Create New Covenant">
                    {/* Placeholder for the BudgetForm component */}
                    <div className="p-4">This is where the form to create a new budget would go. It would handle input for name, amount, period, categories, and more, with full validation.</div>
                </Modal>
            </div>
        </BudgetsContext.Provider>
    );
};

export default BudgetsView;
