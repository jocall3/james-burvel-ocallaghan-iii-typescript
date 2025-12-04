```typescript
/**
 * BudgetingDashboard: The core interface for Money20/20's AI-driven budgeting and financial goal management.
 *
 * This component provides a comprehensive, interactive hub for users to define, track, and optimize their
 * financial budgets and long-term goals. Leveraging advanced agentic AI capabilities (Plato AI), it offers
 * predictive analytics, personalized recommendations, and real-time insights into spending patterns and
 * goal progress.
 *
 * Business Value: This dashboard is worth millions because it transforms reactive financial tracking into
 * proactive financial strategizing. It empowers enterprise clients and individual users with:
 * - Enhanced Financial Control: Users gain unparalleled visibility and control over their finances,
 *   reducing financial stress and improving decision-making.
 * - AI-driven Optimization: Plato AI's continuous analysis of transaction data and financial goals
 *   identifies opportunities for savings, optimal budget allocations, and accelerates goal achievement,
 *   leading to significant cost efficiencies and wealth accumulation.
 * - Increased Engagement & Retention: A highly intelligent, personalized, and actionable budgeting tool
 *   drives deeper user engagement, fostering loyalty and reducing churn for financial service providers.
 * - New Revenue Streams: The underlying AI and analytics infrastructure can be leveraged to offer premium
 *   advisory services, personalized financial products, and targeted offers, creating substantial
 *   monetization opportunities.
 * - Regulatory Compliance & Safety: By providing clear audit trails for budget adjustments and goal
 *   progress, the system implicitly supports financial governance, ensuring users remain within their
 *   defined financial parameters and aiding in responsible financial behavior.
 * - System Leverage: Serves as a critical front-end for the Token Rail Layer (tracking balances and
 *   transactions), Agentic AI System (consuming AI recommendations and predictions), and Digital Identity
 *   (personalizing experiences securely).
 */
import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import Card from '../../Card';
import { Type } from "@google/genai";
import {
    FlowMatrixTransaction,
    FinancialGoal,
    CategoryBudget,
    AIRecommendation,
    DetectedSubscription
} from '../../types';
import {
    AITransactionWidget,
    AIRecommendationsPanel,
    FinancialGoalTracker
} from '../../TransactionsView';
import { AgentCommunicationService } from '../../../core/agent/AgentCommunicationService';
import { IdentityService } from '../../../core/identity/IdentityService';
import { AuditLogService } from '../../../core/governance/AuditLogService';
import { BudgetAgentAction, BudgetAgentGoalAction, AgentMessage, MessagePriority } from '../../../core/agent/AgentTypes';
import { v4 as uuidv4 } from 'uuid';

// Define the interface for the AI Budget Optimization Suggestion
export interface AIBudgetOptimizationSuggestion {
    id: string;
    category: string;
    currentLimit: number;
    suggestedLimit: number;
    reasoning: string;
    actionable: boolean; // Indicates if the suggestion can be directly applied
    applied: boolean; // Indicates if the suggestion has been applied
}

// Define the interface for the AI Spending Forecast
export interface AISpendingForecast {
    summary: string;
    predictedTotalSpend: number;
    atRiskCategories: {
        category: string;
        currentSpent: number;
        predictedFinalSpend: number;
        budgetLimit: number;
    }[];
}

export const BudgetingDashboard: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("BudgetingDashboard must be within a DataProvider");
    }

    const {
        transactions,
        budgets,
        goals,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        addAIRecommendation, // Assuming DataContext now supports adding AI recs
        updateAIRecommendation,
        deleteAIRecommendation,
        aiRecommendations // All AI recommendations from context
    } = context;

    const identityService = useMemo(() => new IdentityService(), []);
    const auditLogService = useMemo(() => new AuditLogService(), []);
    const agentCommService = useMemo(() => new AgentCommunicationService(), []);

    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [newBudgetCategory, setNewBudgetCategory] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState<number | ''>('');
    const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null); // For editing existing budgets

    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTargetAmount, setNewGoalTargetAmount] = useState<number | ''>('');
    const [newGoalTargetDate, setNewGoalTargetDate] = useState('');
    const [newGoalLinkedCategories, setNewGoalLinkedCategories] = useState<string[]>([]);
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null); // For editing existing goals

    // States for AI-driven insights
    const [budgetOptimizationSuggestions, setBudgetOptimizationSuggestions] = useState<AIBudgetOptimizationSuggestion[]>([]);
    const [spendingForecast, setSpendingForecast] = useState<AISpendingForecast | null>(null);

    // Helper to get all unique categories from transactions for dropdowns
    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        transactions.forEach(tx => categories.add(tx.category));
        budgets.forEach(b => categories.add(b.category)); // Include categories from existing budgets
        goals.forEach(g => g.linkedCategories.forEach(lc => categories.add(lc))); // Include categories from linked goals
        return Array.from(categories).sort();
    }, [transactions, budgets, goals]);

    // Calculate total spent per category for current month
    const calculateCategorySpend = useCallback((category: string) => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        return transactions
            .filter(tx =>
                tx.category === category &&
                tx.type === 'expense' &&
                new Date(tx.date) >= startOfMonth &&
                new Date(tx.date) <= endOfMonth
            )
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    // Calculate overall budget summary
    const totalBudgetLimit = useMemo(() => budgets.reduce((sum, b) => sum + b.monthlyLimit, 0), [budgets]);
    const totalBudgetSpent = useMemo(() => {
        return budgets.reduce((sum, b) => {
            const spent = calculateCategorySpend(b.category);
            return sum + spent;
        }, 0);
    }, [budgets, calculateCategorySpend]);
    const totalBudgetRemaining = totalBudgetLimit - totalBudgetSpent;

    const handleAddBudget = async () => {
        if (newBudgetCategory && typeof newBudgetLimit === 'number' && newBudgetLimit > 0) {
            const newBudgetId = uuidv4();
            const budgetData: CategoryBudget = {
                id: newBudgetId,
                category: newBudgetCategory,
                monthlyLimit: newBudgetLimit,
                spentThisMonth: 0,
                remaining: newBudgetLimit,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                aiOptimizationSuggestion: undefined,
            };
            addBudget(budgetData);
            await auditLogService.logAction(identityService.getCurrentUser(), `Created budget for ${newBudgetCategory} with limit ${newBudgetLimit}`, 'CREATE_BUDGET', budgetData);
            setIsAddingBudget(false);
            setNewBudgetCategory('');
            setNewBudgetLimit('');

            // Send message to Budget Agent for initial review/monitoring
            agentCommService.sendMessage({
                id: uuidv4(),
                sender: 'BudgetingDashboard',
                recipient: 'BudgetAgent',
                type: 'ACTION_REQUEST',
                priority: MessagePriority.NORMAL,
                timestamp: new Date().toISOString(),
                payload: {
                    actionType: BudgetAgentAction.MONITOR_BUDGET,
                    budgetId: newBudgetId,
                    category: newBudgetCategory,
                    limit: newBudgetLimit,
                }
            });
        }
    };

    const handleEditBudget = async (budgetId: string) => {
        const budgetToEdit = budgets.find(b => b.id === budgetId);
        if (budgetToEdit) {
            setNewBudgetCategory(budgetToEdit.category);
            setNewBudgetLimit(budgetToEdit.monthlyLimit);
            setIsAddingBudget(true);
            setEditingBudgetId(budgetId);
        }
    };

    const handleUpdateBudget = async () => {
        if (editingBudgetId && newBudgetCategory && typeof newBudgetLimit === 'number' && newBudgetLimit > 0) {
            const existingBudget = budgets.find(b => b.id === editingBudgetId);
            if (!existingBudget) return;

            const updatedBudgetData: CategoryBudget = {
                ...existingBudget,
                category: newBudgetCategory, // Category might be editable
                monthlyLimit: newBudgetLimit,
                remaining: newBudgetLimit - existingBudget.spentThisMonth,
                updatedAt: new Date().toISOString(),
            };
            updateBudget(updatedBudgetData);
            await auditLogService.logAction(identityService.getCurrentUser(), `Updated budget for ${newBudgetCategory} to limit ${newBudgetLimit}`, 'UPDATE_BUDGET', updatedBudgetData);
            setIsAddingBudget(false);
            setEditingBudgetId(null);
            setNewBudgetCategory('');
            setNewBudgetLimit('');

            // Inform Budget Agent about the update
            agentCommService.sendMessage({
                id: uuidv4(),
                sender: 'BudgetingDashboard',
                recipient: 'BudgetAgent',
                type: 'ACTION_REQUEST',
                priority: MessagePriority.NORMAL,
                timestamp: new Date().toISOString(),
                payload: {
                    actionType: BudgetAgentAction.UPDATE_BUDGET,
                    budgetId: editingBudgetId,
                    category: newBudgetCategory,
                    limit: newBudgetLimit,
                }
            });
        }
    };

    const handleDeleteBudget = async (budgetId: string) => {
        const budgetToDelete = budgets.find(b => b.id === budgetId);
        if (budgetToDelete) {
            deleteBudget(budgetId);
            await auditLogService.logAction(identityService.getCurrentUser(), `Deleted budget for ${budgetToDelete.category}`, 'DELETE_BUDGET', budgetToDelete);

            // Inform Budget Agent about the deletion
            agentCommService.sendMessage({
                id: uuidv4(),
                sender: 'BudgetingDashboard',
                recipient: 'BudgetAgent',
                type: 'ACTION_REQUEST',
                priority: MessagePriority.NORMAL,
                timestamp: new Date().toISOString(),
                payload: {
                    actionType: BudgetAgentAction.DELETE_BUDGET,
                    budgetId: budgetId,
                }
            });
        }
    };

    const handleAddGoal = async () => {
        if (newGoalName && typeof newGoalTargetAmount === 'number' && newGoalTargetAmount > 0 && newGoalTargetDate) {
            const newGoalId = uuidv4();
            const goalData: FinancialGoal = {
                id: newGoalId,
                name: newGoalName,
                targetAmount: newGoalTargetAmount,
                currentAmount: 0,
                startDate: new Date().toISOString().split('T')[0],
                targetDate: newGoalTargetDate,
                progressPercentage: 0,
                linkedCategories: newGoalLinkedCategories,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                aiProjection: undefined,
            };
            addGoal(goalData);
            await auditLogService.logAction(identityService.getCurrentUser(), `Created financial goal: ${newGoalName}`, 'CREATE_GOAL', goalData);
            setIsAddingGoal(false);
            setNewGoalName('');
            setNewGoalTargetAmount('');
            setNewGoalTargetDate('');
            setNewGoalLinkedCategories([]);

            // Send message to Goal Agent for initial review/monitoring
            agentCommService.sendMessage({
                id: uuidv4(),
                sender: 'BudgetingDashboard',
                recipient: 'GoalAgent',
                type: 'ACTION_REQUEST',
                priority: MessagePriority.NORMAL,
                timestamp: new Date().toISOString(),
                payload: {
                    actionType: BudgetAgentGoalAction.MONITOR_GOAL,
                    goalId: newGoalId,
                    name: newGoalName,
                    targetAmount: newGoalTargetAmount,
                    targetDate: newGoalTargetDate,
                }
            });
        }
    };

    const handleEditGoal = async (goalId: string) => {
        const goalToEdit = goals.find(g => g.id === goalId);
        if (goalToEdit) {
            setNewGoalName(goalToEdit.name);
            setNewGoalTargetAmount(goalToEdit.targetAmount);
            setNewGoalTargetDate(goalToEdit.targetDate);
            setNewGoalLinkedCategories(goalToEdit.linkedCategories || []);
            setIsAddingGoal(true);
            setEditingGoalId(goalId);
        }
    };

    const handleUpdateGoal = async () => {
        if (editingGoalId && newGoalName && typeof newGoalTargetAmount === 'number' && newGoalTargetAmount > 0 && newGoalTargetDate) {
            const existingGoal = goals.find(g => g.id === editingGoalId);
            if (!existingGoal) return;

            const updatedGoalData: FinancialGoal = {
                ...existingGoal,
                name: newGoalName,
                targetAmount: newGoalTargetAmount,
                targetDate: newGoalTargetDate,
                linkedCategories: newGoalLinkedCategories,
                updatedAt: new Date().toISOString(),
            };
            updateGoal(updatedGoalData);
            await auditLogService.logAction(identityService.getCurrentUser(), `Updated financial goal: ${newGoalName}`, 'UPDATE_GOAL', updatedGoalData);
            setIsAddingGoal(false);
            setEditingGoalId(null);
            setNewGoalName('');
            setNewGoalTargetAmount('');
            setNewGoalTargetDate('');
            setNewGoalLinkedCategories([]);

            // Inform Goal Agent about the update
            agentCommService.sendMessage({
                id: uuidv4(),
                sender: 'BudgetingDashboard',
                recipient: 'GoalAgent',
                type: 'ACTION_REQUEST',
                priority: MessagePriority.NORMAL,
                timestamp: new Date().toISOString(),
                payload: {
                    actionType: BudgetAgentGoalAction.UPDATE_GOAL,
                    goalId: editingGoalId,
                    name: newGoalName,
                    targetAmount: newGoalTargetAmount,
                    targetDate: newGoalTargetDate,
                }
            });
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        const goalToDelete = goals.find(g => g.id === goalId);
        if (goalToDelete) {
            deleteGoal(goalId);
            await auditLogService.logAction(identityService.getCurrentUser(), `Deleted financial goal: ${goalToDelete.name}`, 'DELETE_GOAL', goalToDelete);

            // Inform Goal Agent about the deletion
            agentCommService.sendMessage({
                id: uuidv4(),
                sender: 'BudgetingDashboard',
                recipient: 'GoalAgent',
                type: 'ACTION_REQUEST',
                priority: MessagePriority.NORMAL,
                timestamp: new Date().toISOString(),
                payload: {
                    actionType: BudgetAgentGoalAction.DELETE_GOAL,
                    goalId: goalId,
                }
            });
        }
    };

    const handleApplyBudgetOptimization = async (suggestion: AIBudgetOptimizationSuggestion) => {
        const targetBudget = budgets.find(b => b.category === suggestion.category);
        if (targetBudget && !suggestion.applied) {
            const updatedBudget: CategoryBudget = {
                ...targetBudget,
                monthlyLimit: suggestion.suggestedLimit,
                remaining: suggestion.suggestedLimit - targetBudget.spentThisMonth,
                aiOptimizationSuggestion: {
                    optimizedLimit: suggestion.suggestedLimit,
                    reasoning: suggestion.reasoning,
                    appliedAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
            };
            updateBudget(updatedBudget);

            // Mark the specific suggestion as applied
            setBudgetOptimizationSuggestions(prev => prev.map(s => s.id === suggestion.id ? { ...s, applied: true } : s));

            await auditLogService.logAction(identityService.getCurrentUser(), `Applied AI budget optimization for ${suggestion.category}`, 'APPLY_AI_BUDGET_OPTIMIZATION', { budgetId: targetBudget.id, suggestionId: suggestion.id, suggestedLimit: suggestion.suggestedLimit });

            // Inform Budget Agent about the change
            agentCommService.sendMessage({
                id: uuidv4(),
                sender: 'BudgetingDashboard',
                recipient: 'BudgetAgent',
                type: 'ACTION_REQUEST',
                priority: MessagePriority.HIGH,
                timestamp: new Date().toISOString(),
                payload: {
                    actionType: BudgetAgentAction.UPDATE_BUDGET,
                    budgetId: targetBudget.id,
                    category: targetBudget.category,
                    limit: suggestion.suggestedLimit,
                    reason: 'Applied AI Optimization',
                }
            });
        }
    };

    // Filter AI recommendations relevant to budgeting goals for the panel
    const relevantAIRecommendations = useMemo(() => {
        return aiRecommendations.filter(rec => rec.category === 'budget' || rec.category === 'savings' || rec.category === 'goal');
    }, [aiRecommendations]);

    return (
        <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-white tracking-wider mb-8 drop-shadow-lg">Plato's Budgeting & Goals Matrix</h2>

            {/* Overview Summary Card */}
            <Card title="Financial Health Snapshot">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <p className="text-gray-400 text-sm">Total Monthly Budget</p>
                        <p className="text-2xl font-bold text-cyan-400">${totalBudgetLimit.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <p className="text-gray-400 text-sm">Total Spent This Month</p>
                        <p className="text-2xl font-bold text-red-400">${totalBudgetSpent.toFixed(2)}</p>
                    </div>
                    <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50">
                        <p className="text-gray-400 text-sm">Budget Remaining</p>
                        <p className={`text-2xl font-bold ${totalBudgetRemaining >= 0 ? 'text-green-400' : 'text-red-500'}`}>${totalBudgetRemaining.toFixed(2)}</p>
                    </div>
                </div>
            </Card>

            {/* AI-Powered Budgeting Insights */}
            <Card title="Plato's Budgeting Intelligence">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AITransactionWidget
                        title="Budget Optimization Suggestions"
                        prompt="Analyze the user's spending patterns and current budget allocations. Suggest specific budget adjustments (increase/decrease limits for categories) to better align with their financial goals and historical spending. Provide reasoning. Assume an aim for a monthly surplus and efficient allocation. Mark suggestions as actionable if they involve direct budget changes, otherwise non-actionable."
                        transactions={transactions}
                        responseSchema={{
                            type: Type.OBJECT,
                            properties: {
                                suggestions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            id: { type: Type.STRING }, // Unique ID for each suggestion
                                            category: { type: Type.STRING },
                                            currentLimit: { type: Type.NUMBER },
                                            suggestedLimit: { type: Type.NUMBER },
                                            reasoning: { type: Type.STRING },
                                            actionable: { type: Type.BOOLEAN },
                                            applied: { type: Type.BOOLEAN, default: false } // Track if applied
                                        },
                                        required: ['id', 'category', 'currentLimit', 'suggestedLimit', 'reasoning', 'actionable']
                                    }
                                }
                            }
                        }}
                        model="gemini-1.5-pro"
                        contextualData={{ currentBudgets: budgets, financialGoals: goals }}
                        autoGenerate={true}
                        onResponse={(data: { suggestions: AIBudgetOptimizationSuggestion[] }) => {
                            if (data && data.suggestions) {
                                // Ensure unique IDs and 'applied' status for new suggestions
                                const processedSuggestions = data.suggestions.map(s => ({
                                    ...s,
                                    id: s.id || uuidv4(), // Assign ID if missing
                                    applied: false // Always false initially
                                }));
                                setBudgetOptimizationSuggestions(processedSuggestions);
                                // Potentially add these to global AI recommendations context as well
                                processedSuggestions.forEach(s => addAIRecommendation({
                                    id: s.id,
                                    title: `Budget Opt: ${s.category}`,
                                    description: `Change limit from $${s.currentLimit} to $${s.suggestedLimit}. Reason: ${s.reasoning}`,
                                    category: 'budget',
                                    actionableItems: s.actionable ? [{ text: 'Apply Suggestion', actionUrl: '#', actionHandler: () => handleApplyBudgetOptimization(s) }] : [],
                                    relevanceScore: 0.9,
                                    generatedAt: new Date().toISOString(),
                                }));
                            }
                        }}
                    >
                        {() => ( // Render function now uses the state directly
                            <ul className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                {budgetOptimizationSuggestions.length > 0 ? budgetOptimizationSuggestions.map((s, idx) => (
                                    <li key={s.id || idx} className="flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-cyan-300">{s.category}:</span> From ${s.currentLimit.toFixed(2)} to <span className="font-semibold text-green-300">${s.suggestedLimit.toFixed(2)}</span>. <span className="text-gray-500 italic">{s.reasoning}</span>
                                        </div>
                                        {s.actionable && !s.applied && (
                                            <button
                                                onClick={() => handleApplyBudgetOptimization(s)}
                                                className="ml-2 bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition duration-200"
                                            >
                                                Apply
                                            </button>
                                        )}
                                        {s.applied && (
                                            <span className="ml-2 text-green-400 text-xs italic">Applied</span>
                                        )}
                                    </li>
                                )) : <li className="text-gray-500 text-center">No specific budget optimization suggestions currently.</li>}
                            </ul>
                        )}
                    </AITransactionWidget>

                    <AITransactionWidget
                        title="Spending Forecast"
                        prompt="Based on historical spending over the past 3 months, current month's spending, and defined budgets, predict the user's total spending for the remainder of the current month. Identify categories that are likely to exceed their budget, providing current spent, predicted final spend, and budget limit for each. Provide a concise summary."
                        transactions={transactions}
                        responseSchema={{
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING },
                                predictedTotalSpend: { type: Type.NUMBER },
                                atRiskCategories: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            category: { type: Type.STRING },
                                            currentSpent: { type: Type.NUMBER },
                                            predictedFinalSpend: { type: Type.NUMBER },
                                            budgetLimit: { type: Type.NUMBER }
                                        },
                                        required: ['category', 'currentSpent', 'predictedFinalSpend', 'budgetLimit']
                                    }
                                }
                            }
                        }}
                        model="gemini-1.5-pro"
                        contextualData={{ currentBudgets: budgets, currentMonth: new Date().toISOString().slice(0, 7) }}
                        autoGenerate={true}
                        onResponse={(data: AISpendingForecast) => {
                            if (data) {
                                setSpendingForecast(data);
                            }
                        }}
                    >
                        {() => ( // Render function now uses the state directly
                            <div className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                {spendingForecast ? (
                                    <>
                                        <p className="italic text-gray-400">{spendingForecast.summary}</p>
                                        <p className="mt-2 font-semibold">Predicted Total Spend: <span className="font-bold text-cyan-300">${spendingForecast.predictedTotalSpend.toFixed(2)}</span></p>
                                        {spendingForecast.atRiskCategories.length > 0 && (
                                            <>
                                                <p className="font-semibold mt-2 text-red-400">At-Risk Categories:</p>
                                                <ul className="list-disc list-inside ml-4">
                                                    {spendingForecast.atRiskCategories.map((cat, idx) => (
                                                        <li key={idx}>
                                                            {cat.category}: Limit ${cat.budgetLimit.toFixed(2)}, Current ${cat.currentSpent.toFixed(2)}, Predicted Final <span className="text-red-300">${cat.predictedFinalSpend.toFixed(2)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                        {spendingForecast.atRiskCategories.length === 0 && <p className="text-gray-500 text-center mt-2">No categories are currently predicted to exceed budget.</p>}
                                    </>
                                ) : <p className="text-gray-500 text-center">Generating spending forecast...</p>}
                            </div>
                        )}
                    </AITransactionWidget>

                    <AIRecommendationsPanel recommendations={relevantAIRecommendations} />
                </div>
            </Card>

            {/* Budget Categories Section */}
            <Card title="Your Monthly Budgets">
                <div className="mb-4">
                    <button onClick={() => {
                        setIsAddingBudget(!isAddingBudget);
                        if (isAddingBudget) { // If cancelling, reset state
                            setEditingBudgetId(null);
                            setNewBudgetCategory('');
                            setNewBudgetLimit('');
                        }
                    }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-200">
                        {isAddingBudget ? 'Cancel' : 'Add New Budget'}
                    </button>
                    {isAddingBudget && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
                            <h5 className="text-white font-semibold">{editingBudgetId ? 'Edit Budget' : 'Create New Budget'}</h5>
                            <select
                                value={newBudgetCategory}
                                onChange={e => setNewBudgetCategory(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                disabled={!!editingBudgetId} // Category is usually not changed for existing budgets
                            >
                                <option value="">Select Category</option>
                                {allCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Monthly Limit"
                                value={newBudgetLimit}
                                onChange={e => setNewBudgetLimit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <button
                                onClick={editingBudgetId ? handleUpdateBudget : handleAddBudget}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded text-sm transition duration-200"
                                disabled={!newBudgetCategory || typeof newBudgetLimit !== 'number' || newBudgetLimit <= 0}
                            >
                                {editingBudgetId ? 'Update Budget' : 'Create Budget'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    {budgets.length === 0 ? (
                        <p className="text-gray-500 text-center text-sm">No budgets set. Click "Add New Budget" to get started!</p>
                    ) : (
                        budgets.map(budget => {
                            const spent = calculateCategorySpend(budget.category);
                            const remaining = budget.monthlyLimit - spent;
                            const progress = (spent / budget.monthlyLimit) * 100;

                            return (
                                <div key={budget.id} className="bg-gray-800 border border-gray-700 rounded-md p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-semibold text-white text-md">{budget.category.charAt(0).toUpperCase() + budget.category.slice(1)} Budget</h5>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEditBudget(budget.id)} className="text-gray-400 hover:text-cyan-400 text-xs">Edit</button>
                                            <button onClick={() => handleDeleteBudget(budget.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Limit: <span className="font-mono text-white">${budget.monthlyLimit.toFixed(2)}</span></span>
                                        <span>Spent: <span className="font-mono text-red-400">${spent.toFixed(2)}</span></span>
                                        <span>Remaining: <span className={`font-mono ${remaining >= 0 ? 'text-green-400' : 'text-red-500'}`}>${remaining.toFixed(2)}</span></span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                                        <div
                                            className={`${progress > 100 ? 'bg-red-600' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'} h-2.5 rounded-full`}
                                            style={{ width: `${Math.min(100, progress)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">{progress.toFixed(1)}% of budget spent</p>
                                    {budget.aiOptimizationSuggestion && (
                                        <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs text-gray-400">
                                            <p className="font-semibold">Plato AI Suggestion (Applied):</p>
                                            <p>Optimized Limit: <span className="text-cyan-300">${budget.aiOptimizationSuggestion.optimizedLimit.toFixed(2)}</span></p>
                                            <p>{budget.aiOptimizationSuggestion.reasoning}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* Financial Goals Section */}
            <Card title="Your Financial Goals">
                <div className="mb-4">
                    <button onClick={() => {
                        setIsAddingGoal(!isAddingGoal);
                        if (isAddingGoal) { // If cancelling, reset state
                            setEditingGoalId(null);
                            setNewGoalName('');
                            setNewGoalTargetAmount('');
                            setNewGoalTargetDate('');
                            setNewGoalLinkedCategories([]);
                        }
                    }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-200">
                        {isAddingGoal ? 'Cancel' : 'Add New Goal'}
                    </button>
                    {isAddingGoal && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
                            <h5 className="text-white font-semibold">{editingGoalId ? 'Edit Goal' : 'Create New Goal'}</h5>
                            <input
                                type="text"
                                placeholder="Goal Name (e.g., Buy a House)"
                                value={newGoalName}
                                onChange={e => setNewGoalName(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <input
                                type="number"
                                placeholder="Target Amount"
                                value={newGoalTargetAmount}
                                onChange={e => setNewGoalTargetAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <input
                                type="date"
                                value={newGoalTargetDate}
                                onChange={e => setNewGoalTargetDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} // Cannot set goal in the past
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                            <div className="text-sm text-gray-400">
                                <label className="block mb-1">Link Categories (optional, for tracking contributions):</label>
                                <div className="flex flex-wrap gap-2">
                                    {allCategories.map(cat => (
                                        <label key={cat} className="flex items-center gap-1">
                                            <input
                                                type="checkbox"
                                                checked={newGoalLinkedCategories.includes(cat)}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setNewGoalLinkedCategories(prev => [...prev, cat]);
                                                    } else {
                                                        setNewGoalLinkedCategories(prev => prev.filter(c => c !== cat));
                                                    }
                                                }}
                                                className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                                            />
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={editingGoalId ? handleUpdateGoal : handleAddGoal}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded text-sm transition duration-200"
                                disabled={!newGoalName || typeof newGoalTargetAmount !== 'number' || newGoalTargetAmount <= 0 || !newGoalTargetDate}
                            >
                                {editingGoalId ? 'Update Goal' : 'Create Goal'}
                            </button>
                        </div>
                    )}
                </div>
                {/* FinancialGoalTracker handles rendering the list of goals and their projections, now accepting edit/delete handlers */}
                <FinancialGoalTracker
                    goals={goals}
                    onEditGoal={handleEditGoal}
                    onDeleteGoal={handleDeleteGoal}
                />
            </Card>

            {/* Predictive Analytics Section - Placeholder for future charts */}
            <Card title="Predictive Financial Analytics" isCollapsible>
                <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col justify-center items-center min-h-[150px]">
                    <p className="text-gray-500 text-sm text-center">Future visualizations for long-term financial projections, wealth growth, and scenario planning will appear here, powered by Plato AI's predictive models.</p>
                    <button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">Explore Projections</button>
                </div>
            </Card>
        </div>
    );
};

export default BudgetingDashboard;
```