```typescript
/**
 * This module implements a comprehensive Financial Goals Tracker component.
 * Business value: This system empowers users with sophisticated financial planning capabilities,
 * translating raw transaction data into actionable insights for wealth accumulation, debt reduction,
 * and strategic investments. By providing dynamic goal tracking, AI-powered optimization,
 * and robust visualization, it significantly enhances user engagement and financial literacy.
 * This directly drives customer loyalty and opens avenues for personalized financial product offerings,
 * enabling new revenue streams and substantial value delivery for enterprise financial institutions.
 * Its integration with a larger agentic AI ecosystem allows for autonomous financial adjustments
 * and proactive client engagement, solidifying a competitive advantage in the digital finance landscape.
 */
import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// --- Type Definitions for Financial Goals Tracker ---

export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    type: 'savings' | 'debt_reduction' | 'investment' | 'emergency_fund' | 'retirement' | 'education' | 'purchase' | 'other'; // Expanded types
    contributionsPerPeriod?: number; // Expected contributions
    status: 'on_track' | 'behind' | 'achieved' | 'deferred' | 'cancelled'; // Expanded statuses
    creationDate: string; // Added for historical tracking
    lastUpdateDate: string; // Added for historical tracking
    progressHistory?: { date: string; amount: number }[]; // For detailed charts
    recommendedAction?: string; // AI-driven recommendation
    riskScore?: number; // Calculated risk for this goal
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    description?: string;
    currency?: string;
    tags?: string[];
    merchant?: string;
    status?: 'pending' | 'cleared' | 'reconciled';
}

export interface UserPreferences {
    displayCurrency: string;
    theme: 'dark' | 'light';
    dateFormat: string;
    enableNotifications: boolean;
    riskTolerance: 'low' | 'medium' | 'high';
    investmentHorizon: 'short' | 'medium' | 'long';
}

// Extended DataContext interface (mocking actual context structure)
// This would typically be defined in DataContext.tsx, but for this exercise,
// we'll use a local interface to inform our component's usage.
export interface ExtendedDataContextType {
    transactions: Transaction[];
    assets: any[]; // Simplified for this component's focus
    liabilities: any[]; // Simplified for this component's focus
    budgets: any[]; // Simplified for this component's focus
    goals: FinancialGoal[]; // This is crucial for this component
    investmentAccounts: any[]; // Simplified for this component's focus
    cryptoWallets: any[]; // Simplified for this component's focus
    marketData: any; // Simplified for this component's focus
    userPreferences: UserPreferences; // This is crucial
    // Agentic AI Integration: Functions to interact with the AI for goal management
    performGoalAction: (goalId: string, actionType: 'adjust_contribution' | 'rebalance_funds' | 'mark_achieved' | 'defer', amount?: number) => Promise<boolean>;
    getAIRecommendedActions: (goalId?: string) => Promise<AIRecommendation[]>;
    // Digital Identity Integration: For secure actions
    isAuthenticated: () => boolean;
    getUserRole: () => 'user' | 'admin' | 'agent';
}

/**
 * Represents an AI-driven recommendation for a financial goal.
 * This structure enables the agentic AI to provide specific, actionable advice.
 */
export interface AIRecommendation {
    goalId?: string;
    type: 'adjust_contribution' | 'rebalance_funds' | 'accelerate_debt_payment' | 'optimize_investment' | 'scenario_planning';
    description: string;
    suggestedAmount?: number; // Amount for adjustment/rebalance
    currency?: string;
    impactDescription: string; // e.g., "reduces timeline by 3 months", "saves $500 in interest"
    actionable: boolean; // Can be directly executed by the platform
    confidenceScore: number; // AI's confidence in the recommendation
}

// --- Helper Functions and Advanced Calculators for Goals ---

export const formatDate = (dateString: string, format: string = 'YYYY-MM-DD'): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    switch (format) {
        case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
        case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
        case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
        case 'MMM DD, YYYY': return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        case 'MMMM D, YYYY': return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        default: return `${year}-${month}-${day}`;
    }
};

export const getDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Normalize due date to start of day
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateRequiredMonthlyContribution = (
    goal: FinancialGoal,
    averageMonthlyIncome: number,
    averageMonthlyExpenses: number
): { required: number; feasible: boolean; gap: number; currentMonthlySavings: number } => {
    const daysRemaining = getDaysRemaining(goal.dueDate);
    const monthsRemaining = daysRemaining > 0 ? Math.max(1, Math.ceil(daysRemaining / 30.4375)) : 0; // Average days in a month

    if (monthsRemaining <= 0 || goal.currentAmount >= goal.targetAmount) {
        return { required: 0, feasible: true, gap: 0, currentMonthlySavings: Math.max(0, averageMonthlyIncome - averageMonthlyExpenses) };
    }

    const amountNeeded = goal.targetAmount - goal.currentAmount;
    const required = amountNeeded / monthsRemaining;
    const currentMonthlySavings = Math.max(0, averageMonthlyIncome - averageMonthlyExpenses);
    const feasible = required <= currentMonthlySavings;
    const gap = required - currentMonthlySavings; // Positive if savings are insufficient

    return { required, feasible, gap, currentMonthlySavings };
};

export const getGoalPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
        case 'high': return 'text-red-400';
        case 'medium': return 'text-yellow-400';
        case 'low': return 'text-green-400';
        default: return 'text-gray-400';
    }
};

export const getGoalStatusColor = (status: 'on_track' | 'behind' | 'achieved' | 'deferred' | 'cancelled'): string => {
    switch (status) {
        case 'achieved': return 'text-green-500';
        case 'on_track': return 'text-blue-400';
        case 'behind': return 'text-orange-400';
        case 'deferred': return 'text-gray-500';
        case 'cancelled': return 'text-red-500';
        default: return 'text-gray-400';
    }
};

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#6A5ACD', '#DC143C', '#20B2AA', '#BA55D3', '#DAA520'];
const BAR_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#e28829', '#ff7300', '#c2f97c', '#b10dc9', '#0074d9'];

/**
 * Simulates a robust Agentic AI system that provides financial recommendations.
 * In a production environment, this would involve complex LLM interactions,
 * real-time market data analysis, and deep integration with the financial ledger.
 * For this simulation, it provides plausible, deterministic advice.
 *
 * Business value: This simulation demonstrates the power of agentic AI to offer
 * hyper-personalized, proactive financial guidance. It moves beyond static advice
 * to dynamic, context-aware recommendations that can adapt to market changes,
 * user behavior, and goal progress. This capability significantly enhances customer
 * satisfaction, reduces financial stress, and creates opportunities for automated
 * financial optimization, leading to increased AUM and reduced operational costs.
 * It's a key differentiator for financial platforms seeking to deliver intelligent,
 * future-proof services.
 */
export const financialAIAdvisorSimulator = async (
    goals: FinancialGoal[],
    monthlySavingsRate: number,
    totalIncomeAvg: number,
    totalExpensesAvg: number,
    userPreferences: UserPreferences
): Promise<AIRecommendation[]> => {
    const recommendations: AIRecommendation[] = [];

    // Simulate market data for investment advice
    const simulatedMarketSentiment = userPreferences.investmentHorizon === 'long' && userPreferences.riskTolerance === 'high' ? 'bullish' : 'neutral';
    const simulatedInvestmentReturnRate = simulatedMarketSentiment === 'bullish' ? 0.08 : 0.05; // 8% vs 5% annual

    const now = new Date();

    // 1. Smart Contribution Rebalancing (Risk Mitigation/Acceleration)
    const highPriorityBehindGoals = goals.filter(g => g.priority === 'high' && g.status === 'behind' && getDaysRemaining(g.dueDate) > 0);
    const lowPriorityOnTrackGoals = goals.filter(g => g.priority === 'low' && g.status === 'on_track' && g.currentAmount < g.targetAmount);

    if (highPriorityBehindGoals.length > 0 && lowPriorityOnTrackGoals.length > 0 && monthlySavingsRate > 0) {
        const goalToAccelerate = highPriorityBehindGoals[0]; // Focus on one for simplicity
        const goalToDeferFrom = lowPriorityOnTrackGoals[0];

        if (goalToAccelerate && goalToDeferFrom) {
            const potentialReallocationAmount = Math.min(monthlySavingsRate * 0.2, 500); // Max $500 reallocation or 20% of savings
            if (potentialReallocationAmount > 0) {
                const acceleratedMonths = Math.floor(potentialReallocationAmount / ((goalToAccelerate.targetAmount - goalToAccelerate.currentAmount) / Math.max(1, getDaysRemaining(goalToAccelerate.dueDate) / 30.4375)) * 3); // Rough estimate over 3 months
                recommendations.push({
                    goalId: goalToAccelerate.id,
                    type: 'rebalance_funds',
                    description: `Consider reallocating ${formatCurrency(potentialReallocationAmount)} from "${goalToDeferFrom.name}" to "${goalToAccelerate.name}" for the next 3 months to mitigate risk.`,
                    suggestedAmount: potentialReallocationAmount,
                    currency: userPreferences.displayCurrency,
                    impactDescription: `This will accelerate your "${goalToAccelerate.name}" progress by approximately ${acceleratedMonths > 0 ? `${acceleratedMonths} months` : 'a few weeks'}`,
                    actionable: true,
                    confidenceScore: 0.85
                });
            }
        }
    }

    // 2. Opportunity Detection: Accelerated Growth for Investment Goals
    const investmentGoals = goals.filter(g => g.type === 'investment' && g.status === 'on_track' && g.currentAmount < g.targetAmount);
    if (investmentGoals.length > 0 && monthlySavingsRate > 0) {
        const freeSavings = monthlySavingsRate - goals.filter(g => g.status !== 'achieved' && g.status !== 'deferred').reduce((sum, g) => sum + (g.contributionsPerPeriod || 0), 0);
        if (freeSavings > 100) { // If there's at least $100 available to invest more
            const goal = investmentGoals[0];
            const additionalContribution = Math.min(freeSavings * 0.5, 1000); // Suggest up to 50% of free savings or $1000
            if (additionalContribution > 0) {
                // Simplified time shortening calculation:
                // New monthly contribution for the goal
                const currentMonthly = goal.contributionsPerPeriod || ((goal.targetAmount - goal.currentAmount) / Math.max(1, getDaysRemaining(goal.dueDate) / 30.4375));
                const newMonthly = currentMonthly + additionalContribution;

                const remainingAmount = goal.targetAmount - goal.currentAmount;
                const currentMonthsToReach = remainingAmount / currentMonthly;
                const newMonthsToReach = remainingAmount / newMonthly;
                const monthsShortened = Math.max(0, Math.round(currentMonthsToReach - newMonthsToReach));

                recommendations.push({
                    goalId: goal.id,
                    type: 'optimize_investment',
                    description: `Your "${goal.name}" goal is performing well. With current market sentiment, consider increasing your monthly investment by ${formatCurrency(additionalContribution)}.`,
                    suggestedAmount: additionalContribution,
                    currency: userPreferences.displayCurrency,
                    impactDescription: `This could shorten your goal timeline by approximately ${monthsShortened} months, assuming a consistent ${Math.round(simulatedInvestmentReturnRate * 100)}% annual return.`,
                    actionable: true,
                    confidenceScore: 0.90
                });
            }
        }
    }

    // 3. Risk Mitigation: Overdue Goals & Debt Reduction
    const highInterestDebtGoals = goals.filter(g => g.type === 'debt_reduction' && g.status === 'behind' && getDaysRemaining(g.dueDate) < 180); // Near due date
    if (highInterestDebtGoals.length > 0 && monthlySavingsRate > 0) {
        const debtGoal = highInterestDebtGoals[0];
        const additionalPayment = Math.min(monthlySavingsRate * 0.3, 800);
        if (additionalPayment > 0) {
            const estimatedInterestSaved = Math.floor(Math.random() * 500 + 200); // Simulate interest savings
            recommendations.push({
                goalId: debtGoal.id,
                type: 'accelerate_debt_payment',
                description: `The "${debtGoal.name}" goal is behind schedule and likely accrues significant interest. Prioritizing an additional ${formatCurrency(additionalPayment)} per month could save you an estimated ${formatCurrency(estimatedInterestSaved)} in interest.`,
                suggestedAmount: additionalPayment,
                currency: userPreferences.displayCurrency,
                impactDescription: `Accelerating payment could save ${formatCurrency(estimatedInterestSaved)} in interest over the remaining term.`,
                actionable: true,
                confidenceScore: 0.95
            });
        }
    }

    // 4. Future Goal Planning & Feasibility
    // Simulate user interest in a new car (not a current goal)
    const newCarGoalId = 'new-car-purchase-sim';
    if (!goals.some(g => g.id === newCarGoalId) && monthlySavingsRate > 200) {
        const potentialDownPayment = 30000;
        const requiredMonthlyForNewCar = 1000;
        const monthsToAchieve = potentialDownPayment / requiredMonthlyForNewCar;
        if (monthlySavingsRate >= requiredMonthlyForNewCar) {
            recommendations.push({
                goalId: newCarGoalId, // No actual goal yet, but for scenario
                type: 'scenario_planning',
                description: `You've previously shown interest in a "New Car Purchase". Based on your current financial health, we project you could realistically save a down payment of ${formatCurrency(potentialDownPayment)} within ${Math.round(monthsToAchieve)} months.`,
                suggestedAmount: requiredMonthlyForNewCar,
                currency: userPreferences.displayCurrency,
                impactDescription: `Requires allocating an additional ${formatCurrency(requiredMonthlyForNewCar)} per month starting next quarter.`,
                actionable: false, // This is a suggestion, not a direct action on an existing goal
                confidenceScore: 0.75
            });
        }
    }

    // Remove placeholder recommendations if specific ones were generated
    const finalRecommendations = recommendations.length > 0 ? recommendations : [
        {
            type: 'scenario_planning',
            description: 'No specific high-priority actions detected right now. Your goals are generally on track or have sufficient buffer. Consider reviewing long-term investment strategies.',
            impactDescription: 'Maintain current financial trajectory, explore new investment opportunities.',
            actionable: false,
            confidenceScore: 0.6
        }
    ];

    return finalRecommendations;
};


// --- Component Definition ---

const FinancialGoalsTracker: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading financial goals...</div>;

    const extendedContext = context as ExtendedDataContextType;

    const {
        goals: allGoals,
        transactions,
        userPreferences = { displayCurrency: 'USD', theme: 'dark', dateFormat: 'YYYY-MM-DD', enableNotifications: true, riskTolerance: 'medium', investmentHorizon: 'long' },
        performGoalAction, // Agentic AI hook
        getAIRecommendedActions, // Agentic AI hook
        isAuthenticated, // Digital Identity hook
        getUserRole // Digital Identity hook
    } = extendedContext;

    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [actionToConfirm, setActionToConfirm] = useState<{ goalId: string; actionType: 'adjust_contribution' | 'rebalance_funds' | 'mark_achieved' | 'defer'; amount?: number; description: string } | null>(null);
    const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);


    // Derive core financial metrics and processed goals
    const {
        activeGoals,
        achievedGoals,
        totalGoalsCount,
        onTrackGoalsCount,
        behindGoalsCount,
        deferredGoalsCount,
        totalTargetAmount,
        totalCurrentAmount,
        overallProgressPercentage,
        goalsByType,
        goalsByPriority,
        monthlyIncomeAvg,
        monthlyExpensesAvg,
        monthlySavingsRate,
        goalsWithContributionAnalysis,
        projectedMonthlySavings,
        selectedGoalDetails
    } = useMemo(() => {
        const now = new Date();
        const past12MonthsTransactions = transactions.filter(tx => new Date(tx.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));
        const totalIncomePastYear = past12MonthsTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpensesPastYear = past12MonthsTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        const monthlyIncomeAvg = totalIncomePastYear / 12;
        const monthlyExpensesAvg = totalExpensesPastYear / 12;
        const monthlySavingsRate = Math.max(0, monthlyIncomeAvg - monthlyExpensesAvg);

        const goals = allGoals.filter(goal => goal.status !== 'cancelled');

        const activeGoals = goals.filter(goal => goal.status !== 'achieved' && goal.status !== 'deferred');
        const achievedGoals = goals.filter(goal => goal.status === 'achieved');

        const totalGoalsCount = goals.length;
        const onTrackGoalsCount = goals.filter(g => g.status === 'on_track').length;
        const behindGoalsCount = goals.filter(g => g.status === 'behind').length;
        const deferredGoalsCount = goals.filter(g => g.status === 'deferred').length;

        const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const overallProgressPercentage = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

        const goalsByTypeMap = goals.reduce((acc, goal) => {
            acc[goal.type] = (acc[goal.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const goalsByType = Object.entries(goalsByTypeMap).map(([type, count]) => ({ type, count }));

        const goalsByPriorityMap = goals.reduce((acc, goal) => {
            acc[goal.priority] = (acc[goal.priority] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const goalsByPriority = Object.entries(goalsByPriorityMap).map(([priority, count]) => ({ priority, count }));

        const goalsWithContributionAnalysis = activeGoals.map(goal => {
            const analysis = calculateRequiredMonthlyContribution(goal, monthlyIncomeAvg, monthlyExpensesAvg);
            const daysRemaining = getDaysRemaining(goal.dueDate);
            const monthsRemaining = daysRemaining > 0 ? Math.ceil(daysRemaining / 30.4375) : 0; // Average days in a month

            let mockProgressHistory: { date: string; amount: number }[] = goal.progressHistory || [];
            if (mockProgressHistory.length === 0 && goal.creationDate) {
                // Generate mock history if none exists for a more dynamic chart
                const creationDate = new Date(goal.creationDate);
                let currentMockAmount = goal.currentAmount * 0.5; // Start at 50% of current for mock
                mockProgressHistory.push({ date: formatDate(creationDate.toISOString()), amount: Math.min(currentMockAmount, goal.targetAmount) });
                const timeDiff = now.getTime() - creationDate.getTime();
                const totalMockIntervals = Math.max(1, Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000))); // Monthly intervals
                const monthlyMockIncrease = (goal.currentAmount - currentMockAmount) / totalMockIntervals;

                for (let i = 1; i <= totalMockIntervals; i++) {
                    const mockDate = new Date(creationDate.getFullYear(), creationDate.getMonth() + i, creationDate.getDate());
                    currentMockAmount += monthlyMockIncrease;
                    mockProgressHistory.push({ date: formatDate(mockDate.toISOString()), amount: Math.min(currentMockAmount, goal.targetAmount) });
                }
                mockProgressHistory.push({ date: formatDate(now.toISOString()), amount: goal.currentAmount });
            }
            mockProgressHistory = mockProgressHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


            return {
                ...goal,
                ...analysis,
                daysRemaining,
                monthsRemaining,
                progressPercentage: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
                mockProgressHistory
            };
        });

        const projectedMonthlySavings = goalsWithContributionAnalysis
            .filter(g => g.feasible && g.status !== 'achieved')
            .reduce((sum, g) => sum + g.required, 0);

        const selectedGoalDetails = selectedGoalId
            ? goalsWithContributionAnalysis.find(goal => goal.id === selectedGoalId)
            : null;

        return {
            activeGoals,
            achievedGoals,
            totalGoalsCount,
            onTrackGoalsCount,
            behindGoalsCount,
            deferredGoalsCount,
            totalTargetAmount,
            totalCurrentAmount,
            overallProgressPercentage,
            goalsByType,
            goalsByPriority,
            monthlyIncomeAvg,
            monthlyExpensesAvg,
            monthlySavingsRate,
            goalsWithContributionAnalysis,
            projectedMonthlySavings,
            selectedGoalDetails
        };
    }, [allGoals, transactions, selectedGoalId]);

    // Load AI recommendations on component mount or when goals/preferences change
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (getAIRecommendedActions) {
                // In a real scenario, this would call an API endpoint for the AI agent
                // For this simulation, we use the local simulator
                const fetchedRecommendations = await financialAIAdvisorSimulator(
                    allGoals,
                    monthlySavingsRate,
                    monthlyIncomeAvg,
                    monthlyExpensesAvg,
                    userPreferences
                );
                setAiRecommendations(fetchedRecommendations);
            }
        };
        fetchRecommendations();
    }, [allGoals, monthlySavingsRate, monthlyIncomeAvg, monthlyExpensesAvg, userPreferences, getAIRecommendedActions]);

    const formatCurrency = (amount: number) => {
        return `${userPreferences.displayCurrency === 'EUR' ? '€' : '$'}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const filteredGoals = goalsWithContributionAnalysis.filter(goal => {
        const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
        return matchesStatus && matchesPriority;
    });

    const handleAITriggeredAction = useCallback(async () => {
        if (!actionToConfirm || !performGoalAction || !isAuthenticated()) {
            setActionFeedback({ message: "Action not authorized or invalid.", type: 'error' });
            return;
        }

        setShowConfirmModal(false);
        setActionFeedback(null); // Clear previous feedback

        try {
            // Simulate agent authentication and authorization
            if (getUserRole() !== 'user' && getUserRole() !== 'agent') { // Only users or approved agents can trigger
                setActionFeedback({ message: "You do not have permission to perform this action.", type: 'error' });
                return;
            }

            // Execute the action via the DataContext (which would interface with token rails/payments)
            const success = await performGoalAction(actionToConfirm.goalId, actionToConfirm.actionType, actionToConfirm.amount);

            if (success) {
                setActionFeedback({ message: `Successfully applied recommendation: ${actionToConfirm.description}`, type: 'success' });
            } else {
                setActionFeedback({ message: `Failed to apply recommendation: ${actionToConfirm.description}. Check system logs.`, type: 'error' });
            }
        } catch (error: any) {
            setActionFeedback({ message: `An error occurred: ${error.message || 'Unknown error'}`, type: 'error' });
        } finally {
            setActionToConfirm(null);
            // Optionally refresh recommendations after an action
            const fetchedRecommendations = await financialAIAdvisorSimulator(
                allGoals,
                monthlySavingsRate,
                monthlyIncomeAvg,
                monthlyExpensesAvg,
                userPreferences
            );
            setAiRecommendations(fetchedRecommendations);
        }
    }, [actionToConfirm, performGoalAction, isAuthenticated, getUserRole, allGoals, monthlySavingsRate, monthlyIncomeAvg, monthlyExpensesAvg, userPreferences]);

    const handleConfirmAction = (goalId: string, actionType: 'adjust_contribution' | 'rebalance_funds' | 'mark_achieved' | 'defer', amount: number | undefined, description: string) => {
        if (!isAuthenticated()) {
            setActionFeedback({ message: "You must be logged in to perform this action.", type: 'error' });
            return;
        }
        setActionToConfirm({ goalId, actionType, amount, description });
        setShowConfirmModal(true);
    };

    // Component for action confirmation modal
    const ConfirmationModal = () => {
        if (!showConfirmModal || !actionToConfirm) return null;

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full max-w-md">
                    <h3 className="text-xl font-bold text-white mb-4">Confirm Financial Action</h3>
                    <p className="text-gray-300 mb-4">
                        Are you sure you want to proceed with the following AI-recommended action?
                    </p>
                    <p className="text-gray-200 mb-4 font-mono bg-gray-700 p-3 rounded-md text-sm">
                        {actionToConfirm.description} {actionToConfirm.amount !== undefined ? ` (${formatCurrency(actionToConfirm.amount)})` : ''}
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAITriggeredAction}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition"
                        >
                            Confirm & Execute
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="space-y-6">
            <ConfirmationModal />
            {actionFeedback && (
                <div className={`p-4 rounded-lg text-white font-medium ${actionFeedback.type === 'success' ? 'bg-green-600' : actionFeedback.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
                    {actionFeedback.message}
                    <button onClick={() => setActionFeedback(null)} className="float-right text-white font-bold">X</button>
                </div>
            )}

            <Card title="Financial Goals Dashboard Overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <p className="text-xl font-bold text-white">{totalGoalsCount}</p>
                        <p className="text-sm text-gray-400">Total Goals</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <p className="text-xl font-bold text-green-400">{achievedGoals.length}</p>
                        <p className="text-sm text-gray-400">Goals Achieved</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <p className="text-xl font-bold text-blue-400">{onTrackGoalsCount}</p>
                        <p className="text-sm text-gray-400">On Track</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                        <p className="text-xl font-bold text-orange-400">{behindGoalsCount}</p>
                        <p className="text-sm text-gray-400">Behind Schedule</p>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-2">Overall Progress</h3>
                    <p className="text-3xl font-bold text-teal-400 mb-2">{formatCurrency(totalCurrentAmount)} / {formatCurrency(totalTargetAmount)}</p>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-purple-500 h-3 rounded-full"
                            style={{ width: `${Math.min(100, overallProgressPercentage).toFixed(0)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                        <span>{overallProgressPercentage.toFixed(1)}% Completed</span>
                        <span>{formatCurrency(totalTargetAmount - totalCurrentAmount)} Remaining</span>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Goal Type Distribution" className="lg:col-span-1">
                    <div className="h-72 flex items-center justify-center">
                        {goalsByType.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={goalsByType}
                                        dataKey="count"
                                        nameKey="type"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        labelLine={false}
                                        label={(entry) => `${entry.type} (${(entry.percent * 100).toFixed(0)}%)`}
                                    >
                                        {goalsByType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
                                        formatter={(value: number, name: string) => [`${value} goals`, name]}
                                    />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500">No goals categorized yet.</p>
                        )}
                    </div>
                </Card>

                <Card title="Monthly Contribution Forecast" className="lg:col-span-2">
                    <div className="h-72">
                        {goalsWithContributionAnalysis.filter(g => g.required > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={goalsWithContributionAnalysis.filter(g => g.required > 0)}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <XAxis dataKey="name" stroke="#9ca3af" tickFormatter={(name) => name.split(' ')[0]} />
                                    <YAxis tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
                                        formatter={(value: number, name: string, props: any) => {
                                            const goal = props.payload;
                                            return [
                                                <div key="value">{formatCurrency(value)} (Required)</div>,
                                                <div key="current" className="text-gray-400">Savings: {formatCurrency(goal.currentMonthlySavings)}</div>,
                                                <div key="gap" className={goal.gap > 0 ? 'text-red-400' : 'text-green-400'}>Gap: {formatCurrency(goal.gap)}</div>
                                            ];
                                        }}
                                        labelFormatter={(label: string) => `Goal: ${label}`}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar dataKey="required" name="Required Monthly" fill={BAR_COLORS[0]} />
                                    <Bar dataKey="currentMonthlySavings" name="Current Monthly Savings" fill={BAR_COLORS[1]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No active goals require monthly contributions, or sufficient savings are available.</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                            Based on your average monthly savings ({formatCurrency(monthlySavingsRate)}). Goals requiring more than your savings rate are marked in red.
                        </p>
                    </div>
                </Card>
            </div>

            <Card title="Your Financial Goals">
                <div className="flex flex-wrap gap-2 mb-4">
                    <select
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="on_track">On Track</option>
                        <option value="behind">Behind</option>
                        <option value="achieved">Achieved</option>
                        <option value="deferred">Deferred</option>
                    </select>
                    <select
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {filteredGoals.length > 0 ? filteredGoals.map(goal => (
                        <div key={goal.id} className={`p-4 rounded-lg shadow-md border 
                            ${goal.status === 'achieved' ? 'bg-green-900/[.2] border-green-700' :
                             goal.status === 'behind' ? 'bg-red-900/[.2] border-red-700' :
                             goal.status === 'on_track' ? 'bg-blue-900/[.2] border-blue-700' :
                             'bg-gray-800 border-gray-700'} cursor-pointer hover:bg-gray-700 transition-colors duration-200`}
                             onClick={() => setSelectedGoalId(goal.id)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xl font-semibold text-white">{goal.name}</h4>
                                <span className={`text-sm font-medium ${getGoalStatusColor(goal.status)}`}>
                                    {goal.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                                <span>Type: {goal.type.replace(/_/g, ' ')}</span>
                                <span className={getGoalPriorityColor(goal.priority)}>Priority: {goal.priority}</span>
                            </div>
                            <div className="text-md text-gray-300 mb-2">
                                <span className="font-semibold">{formatCurrency(goal.currentAmount)}</span> / {formatCurrency(goal.targetAmount)}
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                                <div
                                    className="bg-teal-500 h-2.5 rounded-full"
                                    style={{ width: `${Math.min(100, goal.progressPercentage).toFixed(0)}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                <span>Progress: {goal.progressPercentage.toFixed(1)}%</span>
                                <span>Due: {formatDate(goal.dueDate, userPreferences.dateFormat)}</span>
                            </div>
                            {goal.status !== 'achieved' && goal.status !== 'deferred' && (
                                <div className="mt-3 text-sm text-gray-500">
                                    {goal.daysRemaining > 0 ? (
                                        goal.feasible ? (
                                            <p className="text-green-400">On track! Requires {formatCurrency(goal.required)}/month to hit target by due date.</p>
                                        ) : (
                                            <p className="text-red-400">Behind: Need {formatCurrency(Math.abs(goal.gap))} more per month. Target: {formatCurrency(goal.required)}/month.</p>
                                        )
                                    ) : (
                                        <p className="text-orange-400">Due date passed or very near. Review goal.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-8">No goals match the current filters. <button onClick={() => {setFilterStatus('all'); setFilterPriority('all');}} className="text-blue-500 hover:underline">Clear filters</button>.</p>
                    )}
                </div>
            </Card>

            {selectedGoalDetails && (
                <Card title={`Detailed Progress: ${selectedGoalDetails.name}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                            <p className="text-2xl font-bold text-white mb-1">{formatCurrency(selectedGoalDetails.currentAmount)} / {formatCurrency(selectedGoalDetails.targetAmount)}</p>
                            <p className="text-lg text-gray-300">Progress: {selectedGoalDetails.progressPercentage.toFixed(1)}%</p>
                            <p className="text-md text-gray-400">Due: {formatDate(selectedGoalDetails.dueDate, userPreferences.dateFormat)} ({selectedGoalDetails.daysRemaining > 0 ? `${selectedGoalDetails.daysRemaining} days left` : 'Due date passed'})</p>
                        </div>
                        <button onClick={() => setSelectedGoalId(null)} className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium">
                            Close Details
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
                            <h5 className="text-lg font-semibold text-white mb-2">Contribution Outlook</h5>
                            <p className="text-gray-300">Current Monthly Savings: <span className="text-green-400">{formatCurrency(selectedGoalDetails.currentMonthlySavings)}</span></p>
                            <p className="text-gray-300">Required Monthly Contribution: <span className={selectedGoalDetails.feasible ? 'text-blue-400' : 'text-orange-400'}>{formatCurrency(selectedGoalDetails.required)}</span></p>
                            <p className={`font-bold ${selectedGoalDetails.gap <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Monthly Gap: {selectedGoalDetails.gap <= 0 ? 'Surplus ' : 'Deficit '}{formatCurrency(Math.abs(selectedGoalDetails.gap))}
                            </p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
                            <h5 className="text-lg font-semibold text-white mb-2">Goal Attributes</h5>
                            <p className="text-gray-300">Type: <span className="text-purple-400">{selectedGoalDetails.type.replace(/_/g, ' ')}</span></p>
                            <p className="text-gray-300">Priority: <span className={getGoalPriorityColor(selectedGoalDetails.priority)}>{selectedGoalDetails.priority}</span></p>
                            <p className="text-gray-300">Created: {formatDate(selectedGoalDetails.creationDate, userPreferences.dateFormat)}</p>
                            <p className="text-gray-300">Last Updated: {formatDate(selectedGoalDetails.lastUpdateDate, userPreferences.dateFormat)}</p>
                        </div>
                    </div>

                    <h5 className="text-xl font-semibold text-white mb-3">Historical Progress</h5>
                    <div className="h-64">
                        {selectedGoalDetails.mockProgressHistory && selectedGoalDetails.mockProgressHistory.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedGoalDetails.mockProgressHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="goalProgressGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                    <XAxis dataKey="date" stroke="#9ca3af" tickFormatter={(dateStr) => formatDate(dateStr, 'MMM YY')} />
                                    <YAxis tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }}
                                        labelFormatter={(label: string) => `Date: ${formatDate(label, userPreferences.dateFormat)}`}
                                        formatter={(value: number) => [formatCurrency(value), 'Saved Amount']}
                                    />
                                    {/* The Line component for targetAmount assumes targetAmount is consistent, if it changes over time,
                                        it would need to be part of mockProgressHistory as well. For now, a flat line if needed. */}
                                    {/* <Line type="monotone" dataKey="targetAmount" stroke="#FFBB28" dot={false} strokeDasharray="5 5" /> */}
                                    <Area type="monotone" dataKey="amount" stroke="#82ca9d" fill="url(#goalProgressGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-500 text-center py-4">Not enough data to show historical progress for this goal.</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">Historical contributions and overall progress toward this goal.</p>
                    </div>
                </Card>
            )}

            <Card title="AI-Powered Goal Optimization & Insights">
                <div className="space-y-4">
                    {aiRecommendations.length > 0 ? (
                        aiRecommendations.map((rec, index) => (
                            <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
                                <h3 className="text-xl font-semibold text-white mb-2 flex justify-between items-center">
                                    {rec.type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    <span className={`text-sm font-normal ${rec.confidenceScore > 0.8 ? 'text-green-400' : rec.confidenceScore > 0.7 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                        Confidence: {(rec.confidenceScore * 100).toFixed(0)}%
                                    </span>
                                </h3>
                                <p className="text-gray-300">
                                    {rec.description}
                                    <span className="block text-sm text-gray-500 mt-1">
                                        {rec.impactDescription}
                                    </span>
                                </p>
                                {rec.actionable && rec.goalId && performGoalAction && (
                                    <div className="mt-4 text-right">
                                        <button
                                            onClick={() => handleConfirmAction(rec.goalId!, rec.type as any, rec.suggestedAmount, rec.description)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-all duration-300"
                                        >
                                            Apply Recommendation
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Generating AI recommendations...</p>
                    )}
                </div>
            </Card>

            <Card title="Quick Goal Actions">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300">
                        Add New Goal
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300">
                        Review All Goals
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300">
                        Adjust Contributions
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300">
                        Archive Old Goals
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300">
                        Share Progress
                    </button>
                    <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300">
                        Export Goal Data
                    </button>
                </div>
                <p className="text-sm text-gray-500 mt-4 italic">
                    Clicking these buttons would typically open a modal or navigate to a dedicated page for goal management.
                </p>
            </Card>
        </div>
    );
};

export default FinancialGoalsTracker;
```