// components/components/budgeting/BudgetingDashboard.tsx
// Plato's Budgeting & Goals Matrix: The comprehensive hub for managing financial allocations,
// tracking progress towards aspirational targets, and leveraging Plato AI for predictive
// budgeting and goal optimization.

import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../../context/DataContext'; // Adjust path based on component nesting
import Card from '../../Card'; // Adjust path
import { Type } from "@google/genai"; // Needed for defining response schemas for AI widgets
import {
    FlowMatrixTransaction,
    FinancialGoal,
    CategoryBudget,
    AIRecommendation,
    DetectedSubscription // Just for consistency with seed
} from '../../types'; // Assume these extended types are in a shared types file (../types.ts)

// Re-use AI widgets and Goal Tracker from the components library, assuming they are exported separately
// or are available from `TransactionsView` for now. For best practice, these would be in their own files.
import {
    AITransactionWidget,
    AIRecommendationsPanel,
    FinancialGoalTracker
} from '../../TransactionsView'; // Reusing components exported from TransactionsView.tsx

export const BudgetingDashboard: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("BudgetingDashboard must be within a DataProvider");
    }
    // Assuming DataContext now provides CRUD operations for budgets and goals
    const { transactions, budgets, goals, addBudget, updateBudget, deleteBudget, addGoal, updateGoal, deleteGoal } = context;

    // State for managing new budget/goal forms, or selected items for editing
    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [newBudgetCategory, setNewBudgetCategory] = useState('');
    const [newBudgetLimit, setNewBudgetLimit] = useState<number | ''>('');

    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTargetAmount, setNewGoalTargetAmount] = useState<number | ''>('');
    const [newGoalTargetDate, setNewGoalTargetDate] = useState('');
    const [newGoalLinkedCategories, setNewGoalLinkedCategories] = useState<string[]>([]);

    // Helper to get all unique categories from transactions for dropdowns
    const allCategories = useMemo(() => {
        const categories = new Set<string>();
        transactions.forEach(tx => categories.add(tx.category));
        return Array.from(categories).sort();
    }, [transactions]);

    // Calculate total spent per category for current month
    // This is a simplified calculation. In a real app, it would be more robust to handle timezones.
    const calculateCategorySpend = useCallback((category: string) => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); // End of month

        return transactions
            .filter(tx =>
                tx.category === category &&
                tx.type === 'expense' &&
                new Date(tx.date) >= startOfMonth &&
                new Date(tx.date) <= endOfMonth
            )
            .reduce((sum, tx) => sum + tx.amount, 0);
    }, [transactions]);

    const handleAddBudget = () => {
        if (newBudgetCategory && typeof newBudgetLimit === 'number' && newBudgetLimit > 0) {
            const newBudgetId = `budget-${Date.now()}`;
            // When adding, `spentThisMonth` and `remaining` are typically calculated by the system,
            // or initialized to 0 and limit respectively.
            addBudget({
                id: newBudgetId,
                category: newBudgetCategory,
                monthlyLimit: newBudgetLimit,
                spentThisMonth: 0, // Initialized, will be updated by context/backend
                remaining: newBudgetLimit, // Initialized, will be updated by context/backend
            });
            setIsAddingBudget(false);
            setNewBudgetCategory('');
            setNewBudgetLimit('');
        }
    };

    const handleAddGoal = () => {
        if (newGoalName && typeof newGoalTargetAmount === 'number' && newGoalTargetAmount > 0 && newGoalTargetDate) {
            const newGoalId = `goal-${Date.now()}`;
            addGoal({
                id: newGoalId,
                name: newGoalName,
                targetAmount: newGoalTargetAmount,
                currentAmount: 0, // Starts at 0, context/backend tracks progress
                startDate: new Date().toISOString().split('T')[0],
                targetDate: newGoalTargetDate,
                progressPercentage: 0, // Initialized, context/backend tracks
                linkedCategories: newGoalLinkedCategories,
            });
            setIsAddingGoal(false);
            setNewGoalName('');
            setNewGoalTargetAmount('');
            setNewGoalTargetDate('');
            setNewGoalLinkedCategories([]);
        }
    };

    // Calculate overall budget summary
    const totalBudgetLimit = useMemo(() => budgets.reduce((sum, b) => sum + b.monthlyLimit, 0), [budgets]);
    const totalBudgetSpent = useMemo(() => {
        // Sum current spent for all active budgets
        return budgets.reduce((sum, b) => {
            const spent = calculateCategorySpend(b.category);
            return sum + spent;
        }, 0);
    }, [budgets, calculateCategorySpend]);
    const totalBudgetRemaining = totalBudgetLimit - totalBudgetSpent;

    const mockAIRecommendationsForBudgeting: AIRecommendation[] = useMemo(() => [
        {
            id: 'budgetrec1',
            title: 'Reallocate Dining Budget',
            description: 'Your dining budget is consistently underspent by 20%. Consider reallocating $100 to your savings goal.',
            category: 'budget',
            actionableItems: [{ text: 'Adjust dining budget', actionUrl: '#'}],
            relevanceScore: 0.85,
            generatedAt: new Date().toISOString(),
        },
        {
            id: 'goalrec1',
            title: 'Accelerate Emergency Fund',
            description: 'You are ahead of schedule on your Emergency Fund. Increase contributions by $50 to reach it even faster.',
            category: 'savings',
            actionableItems: [{ text: 'Increase savings contribution', actionUrl: '#' }],
            relevanceScore: 0.92,
            generatedAt: new Date().toISOString(),
        },
    ], []); // Empty dependency array as this is mock data

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
                        prompt="Analyze the user's spending patterns and current budget allocations. Suggest specific budget adjustments (increase/decrease limits for categories) to better align with their financial goals and historical spending. Provide reasoning. Assume an aim for a monthly surplus and efficient allocation."
                        transactions={transactions}
                        responseSchema={{
                            type: Type.OBJECT,
                            properties: {
                                suggestions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            category: { type: Type.STRING },
                                            currentLimit: { type: Type.NUMBER },
                                            suggestedLimit: { type: Type.NUMBER },
                                            reasoning: { type: Type.STRING }
                                        },
                                        required: ['category', 'currentLimit', 'suggestedLimit', 'reasoning']
                                    }
                                }
                            }
                        }}
                        model="gemini-1.5-pro"
                        contextualData={{ currentBudgets: budgets, financialGoals: goals }}
                        autoGenerate={true} // Auto-generate for immediate insights
                    >
                        {(result: { suggestions: any[] }) => (
                            <ul className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                {result.suggestions.length > 0 ? result.suggestions.map((s, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold text-cyan-300">{s.category}:</span> From ${s.currentLimit.toFixed(2)} to <span className="font-semibold text-green-300">${s.suggestedLimit.toFixed(2)}</span>. <span className="text-gray-500 italic">{s.reasoning}</span>
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
                    >
                        {(result: { summary: string, predictedTotalSpend: number, atRiskCategories: any[] }) => (
                            <div className="text-xs text-gray-300 space-y-1 p-2 max-h-32 overflow-y-auto">
                                <p className="italic text-gray-400">{result.summary}</p>
                                <p className="mt-2 font-semibold">Predicted Total Spend: <span className="font-bold text-cyan-300">${result.predictedTotalSpend.toFixed(2)}</span></p>
                                {result.atRiskCategories.length > 0 && (
                                    <>
                                        <p className="font-semibold mt-2 text-red-400">At-Risk Categories:</p>
                                        <ul className="list-disc list-inside ml-4">
                                            {result.atRiskCategories.map((cat, idx) => (
                                                <li key={idx}>
                                                    {cat.category}: Limit ${cat.budgetLimit.toFixed(2)}, Current ${cat.currentSpent.toFixed(2)}, Predicted Final <span className="text-red-300">${cat.predictedFinalSpend.toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                                {result.atRiskCategories.length === 0 && <p className="text-gray-500 text-center mt-2">No categories are currently predicted to exceed budget.</p>}
                            </div>
                        )}
                    </AITransactionWidget>

                    <AIRecommendationsPanel recommendations={mockAIRecommendationsForBudgeting} />
                </div>
            </Card>

            {/* Budget Categories Section */}
            <Card title="Your Monthly Budgets">
                <div className="mb-4">
                    <button onClick={() => setIsAddingBudget(!isAddingBudget)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-200">
                        {isAddingBudget ? 'Cancel' : 'Add New Budget'}
                    </button>
                    {isAddingBudget && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
                            <h5 className="text-white font-semibold">Create New Budget</h5>
                            <select
                                value={newBudgetCategory}
                                onChange={e => setNewBudgetCategory(e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
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
                            <button onClick={handleAddBudget} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded text-sm transition duration-200" disabled={!newBudgetCategory || typeof newBudgetLimit !== 'number' || newBudgetLimit <= 0}>
                                Create Budget
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
                                            {/* In a real app, this would open an edit modal */}
                                            <button onClick={() => console.log('Edit budget', budget.id)} className="text-gray-400 hover:text-cyan-400 text-xs">Edit</button>
                                            <button onClick={() => deleteBudget(budget.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
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
                                            <p className="font-semibold">Plato AI Suggestion:</p>
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
                    <button onClick={() => setIsAddingGoal(!isAddingGoal)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-200">
                        {isAddingGoal ? 'Cancel' : 'Add New Goal'}
                    </button>
                    {isAddingGoal && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
                            <h5 className="text-white font-semibold">Create New Goal</h5>
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
                            <button onClick={handleAddGoal} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-4 rounded text-sm transition duration-200" disabled={!newGoalName || typeof newGoalTargetAmount !== 'number' || newGoalTargetAmount <= 0 || !newGoalTargetDate}>
                                Create Goal
                            </button>
                        </div>
                    )}
                </div>
                {/* FinancialGoalTracker handles rendering the list of goals and their projections */}
                <FinancialGoalTracker goals={goals} />
            </Card>

            {/* Predictive Analytics Section - Placeholder for future charts */}
            <Card title="Predictive Financial Analytics" isCollapsible>
                <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col justify-center items-center min-h-[150px]">
                    <p className="text-gray-500 text-sm text-center">Future visualizations for long-term financial projections, wealth growth, and scenario planning will appear here.</p>
                    <button className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">Explore Projections</button>
                </div>
            </Card>
        </div>
    );
};

export default BudgetingDashboard;