// components/BudgetsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "Allocatra," a complete chamber of financial discipline.
// It features interactive budget rings, detailed transaction modals, and an
// integrated AI Sage for conversational, streaming budget analysis.
// This file has been expanded to encompass a universe of financial management features,
// simulating decades of expert upgrades and integrations.

import React, { useContext, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { BudgetCategory, Transaction } from '../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, XAxis, YAxis, Bar } from 'recharts';

// ================================================================================================
// NEW UTILITY FUNCTIONS & HELPERS (EXPORTED)
// ================================================================================================

export const generateUniqueId = (): string => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const calculateFinancialHealthScore = (budgets: BudgetCategory[], transactions: Transaction[], goals: BudgetGoal[], subscriptions: Subscription[]): number => {
    let score = 100; // Starting base score
    const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
    const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const savingsGoalProgress = goals.filter(g => !g.isAchieved).reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / (goals.filter(g => !g.isAchieved).length || 1);

    // Budget utilization
    if (totalLimit > 0 && totalSpent > totalLimit * 1.05) score -= 20; // Over budget significantly
    else if (totalLimit > 0 && totalSpent > totalLimit * 0.9) score -= 10; // Nearing budget limit
    else if (totalLimit > 0 && totalSpent < totalLimit * 0.5) score += 5; // Good buffer

    // Savings progress
    if (savingsGoalProgress > 0.8) score += 10;
    else if (savingsGoalProgress < 0.3) score -= 15;

    // Subscription management (simplified: too many active could be bad, but also necessary)
    if (subscriptions.filter(s => s.isActive).length > 5 && subscriptions.reduce((sum, s) => sum + s.amount, 0) > totalLimit * 0.3) score -= 5;

    // Debt vs Income (conceptual, needs actual income/debt data)
    // For now, let's just make it dynamic based on transactions count for demo
    if (transactions.filter(tx => tx.type === 'expense').length > 50) score -= 5; // High transaction volume could imply overspending (simplistic)

    // Ensure score is within 0-100 range
    return Math.max(0, Math.min(100, Math.round(score)));
};

export const predictFutureSpending = (transactions: Transaction[], category: string, daysAhead: number): number => {
    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === category.toLowerCase() && tx.type === 'expense');
    if (relevantTransactions.length < 5) return 0; // Not enough data

    // Simple average daily spend over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = relevantTransactions.filter(tx => new Date(tx.date) > thirtyDaysAgo);

    if (recentTransactions.length === 0) return 0;

    const totalRecentSpend = recentTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const averageDailySpend = totalRecentSpend / 30; // Assuming 30 days in the period

    return averageDailySpend * daysAhead;
};

// ================================================================================================
// NEW DATA INTERFACES & TYPES (EXPORTED)
// ================================================================================================

export interface BudgetGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string; // YYYY-MM-DD
    category?: string; // e.g., 'Vacation', 'Down Payment'
    isAchieved: boolean;
    priority: 'low' | 'medium' | 'high';
    contributions: { date: string; amount: number; transactionId?: string; }[];
    autoAllocatePercentage?: number; // % of free income
}

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'annually' | 'weekly';
    nextRenewalDate: string; // YYYY-MM-DD
    category: string;
    isActive: boolean;
    notes?: string;
    provider?: string;
    billingMethod?: string;
    remindersEnabled: boolean;
}

export interface FinancialChallenge {
    id: string;
    name: string;
    description: string;
    target: number; // e.g., save $500, reduce spending by 10%
    metric: 'amountSaved' | 'percentReduced' | 'transactionsLimited';
    currentProgress: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    isCompleted: boolean;
    reward?: string;
    progressHistory: { date: string; value: number }[];
}

export interface FinancialMetricDisplay {
    id: string;
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable' | 'neutral';
    description?: string;
    icon?: string; // e.g., '💸', '📈'
}

export interface AISageProfile {
    preferredTone: 'formal' | 'casual' | 'encouraging' | 'direct';
    learningHistory: AIInteractionMessage[]; // Past interactions for context
    financialGoalsLearned: BudgetGoal[]; // Goals understood by AI
    spendingPatternsIdentified: { category: string; average: number; trend: 'increasing' | 'decreasing' }[];
    proactiveAlertsEnabled: boolean;
    preferredReportFormat: 'summary' | 'detailed' | 'visual';
}

export interface AIInteractionMessage {
    id: string;
    role: 'user' | 'model';
    content: string;
    timestamp: string;
}

export interface ScenarioResult {
    id: string;
    name: string;
    description: string;
    assumptions: string[];
    projectedOutcome: {
        budgetImpact: { category: string; change: number }[];
        savingsImpact: number;
        netWorthImpact: number;
        futureScoreChange: number;
    };
    dateCreated: string;
    visualizations?: any; // Placeholder for chart data
}

export interface RecurringBudgetSettings {
    frequency: 'monthly' | 'weekly' | 'annually';
    startDate: string;
    endDate?: string; // Optional end date
    adjustAmountAutomatically?: boolean;
}

// ================================================================================================
// EXPANDED MODALS & DETAIL COMPONENTS (EXPORTED)
// ================================================================================================

export const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; onUpdateBudget: (id: string, updates: Partial<BudgetCategory>) => void; onDeleteBudget: (id: string) => void; }> = ({ budget, transactions, onClose, onUpdateBudget, onDeleteBudget }) => {
    if (!budget) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(budget.name);
    const [editedLimit, setEditedLimit] = useState(budget.limit.toString());

    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === budget.name.toLowerCase() && tx.type === 'expense');
    const futurePrediction = predictFutureSpending(transactions, budget.name, 30); // Predict 30 days ahead

    const handleSave = () => {
        onUpdateBudget(budget.id, { name: editedName, limit: parseFloat(editedLimit) });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the "${budget.name}" budget? This cannot be undone.`)) {
            onDeleteBudget(budget.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    {isEditing ? (
                        <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white text-lg font-semibold" />
                    ) : (
                        <h3 className="text-lg font-semibold text-white">{budget.name} Budget Details</h3>
                    )}
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <button onClick={handleSave} className="text-green-400 hover:text-green-300">Save</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-300">Edit</button>
                        )}
                        <button onClick={handleDelete} className="text-red-400 hover:text-red-300">Delete</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                    </div>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400">Current Spend:</p>
                            <p className="text-2xl font-bold text-red-400">-${budget.spent.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Monthly Limit:</p>
                            {isEditing ? (
                                <input type="number" value={editedLimit} onChange={e => setEditedLimit(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white text-2xl font-bold" />
                            ) : (
                                <p className="text-2xl font-bold text-green-400">${budget.limit.toFixed(2)}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-gray-400">Remaining:</p>
                            <p className={`text-2xl font-bold ${budget.limit - budget.spent < 0 ? 'text-red-500' : 'text-green-400'}`}>
                                ${(budget.limit - budget.spent).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400">Predicted Future Spend (30 days):</p>
                            <p className="text-lg font-bold text-orange-400">~${futurePrediction.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="h-48 w-full bg-gray-700/30 rounded-lg p-2 flex items-center justify-center">
                        {/* Transaction Trend Graph for this category */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={relevantTransactions.reduce((acc, tx) => {
                                const date = tx.date.substring(0, 7); // Group by month
                                const existing = acc.find(item => item.date === date);
                                if (existing) {
                                    existing.amount += tx.amount;
                                } else {
                                    acc.push({ date, amount: tx.amount });
                                }
                                return acc;
                            }, [] as {date: string; amount: number}[]).sort((a,b) => a.date.localeCompare(b.date))}>
                                <XAxis dataKey="date" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`}/>
                                <Bar dataKey="amount" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <h4 className="text-md font-semibold text-white mt-4">Transactions for this Category:</h4>
                    {relevantTransactions.length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {relevantTransactions.map(tx => (
                                <li key={tx.id} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded-md">
                                    <div><p className="text-white">{tx.description}</p><p className="text-xs text-gray-400">{tx.date}</p></div>
                                    <p className="font-mono text-red-400">-${tx.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No transactions for this category yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const NewBudgetModal: React.FC<{ onClose: () => void; onAdd: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'> & { recurringSettings?: RecurringBudgetSettings; linkedGoalId?: string }) => void; budgets: BudgetCategory[]; goals: BudgetGoal[] }> = ({ onClose, onAdd, budgets, goals }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [frequency, setFrequency] = useState<RecurringBudgetSettings['frequency']>('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [linkedGoalId, setLinkedGoalId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && limit) {
            const newBudget: Omit<BudgetCategory, 'id' | 'spent' | 'color'> & { recurringSettings?: RecurringBudgetSettings; linkedGoalId?: string } = {
                name,
                limit: parseFloat(limit),
            };
            if (isRecurring) {
                newBudget.recurringSettings = { frequency, startDate };
            }
            if (linkedGoalId) {
                newBudget.linkedGoalId = linkedGoalId;
            }
            onAdd(newBudget);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Create New Budget</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Category Name (e.g., Groceries)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} placeholder="Monthly Limit (e.g., 500)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="form-checkbox h-4 w-4 text-cyan-600 rounded border-gray-600 bg-gray-700" />
                        <label htmlFor="isRecurring" className="text-gray-300">Make this a recurring budget</label>
                    </div>

                    {isRecurring && (
                        <div className="space-y-2 bg-gray-700/30 p-3 rounded-md">
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-400">Frequency:</label>
                            <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as RecurringBudgetSettings['frequency'])} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="annually">Annually</option>
                            </select>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-400">Start Date:</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        </div>
                    )}

                    {goals.length > 0 && (
                        <div className="space-y-2">
                            <label htmlFor="linkedGoal" className="block text-sm font-medium text-gray-400">Link to a Goal (Optional):</label>
                            <select id="linkedGoal" value={linkedGoalId} onChange={e => setLinkedGoalId(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                                <option value="">No linked goal</option>
                                {goals.filter(g => !g.isAchieved).map(goal => (
                                    <option key={goal.id} value={goal.id}>{goal.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">Linking a budget to a goal can help you auto-allocate funds.</p>
                        </div>
                    )}

                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Budget</button>
                </div>
            </form>
        </div>
    );
};

export const GoalDetailModal: React.FC<{ goal: BudgetGoal | null; onClose: () => void; onUpdateGoal: (id: string, updates: Partial<BudgetGoal>) => void; }> = ({ goal, onClose, onUpdateGoal }) => {
    if (!goal) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedTarget, setEditedTarget] = useState(goal.targetAmount.toString());
    const [contributionAmount, setContributionAmount] = useState('');

    const handleSave = () => {
        onUpdateGoal(goal.id, { targetAmount: parseFloat(editedTarget) });
        setIsEditing(false);
    };

    const handleContribute = () => {
        const amount = parseFloat(contributionAmount);
        if (amount > 0) {
            const newContributions = [...goal.contributions, { date: new Date().toISOString().split('T')[0], amount }];
            const newCurrentAmount = goal.currentAmount + amount;
            onUpdateGoal(goal.id, {
                currentAmount: newCurrentAmount,
                contributions: newContributions,
                isAchieved: newCurrentAmount >= goal.targetAmount
            });
            setContributionAmount('');
        }
    };

    const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{goal.name} Goal Details</h3>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <button onClick={handleSave} className="text-green-400 hover:text-green-300">Save</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-300">Edit</button>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                    </div>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    <p className="text-gray-300">Category: <span className="font-medium text-white">{goal.category || 'General'}</span></p>
                    <p className="text-gray-300">Priority: <span className="font-medium text-white capitalize">{goal.priority}</span></p>
                    <p className="text-gray-300">Target Date: <span className="font-medium text-white">{goal.targetDate || 'N/A'}</span></p>

                    <div className="my-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400">Progress:</span>
                            <span className="font-semibold text-white">{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-cyan-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-400 text-right mt-1">${goal.currentAmount.toFixed(2)} / ${isEditing ? <input type="number" value={editedTarget} onChange={e => setEditedTarget(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg p-1 text-white text-sm w-24 inline-block" /> : goal.targetAmount.toFixed(2)}</p>
                    </div>

                    {!goal.isAchieved && (
                        <div className="space-y-2 bg-gray-700/30 p-4 rounded-md">
                            <h4 className="text-md font-semibold text-white">Make a Contribution</h4>
                            <input
                                type="number"
                                value={contributionAmount}
                                onChange={e => setContributionAmount(e.target.value)}
                                placeholder="Amount to contribute"
                                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white"
                            />
                            <button onClick={handleContribute} className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg">Contribute</button>
                        </div>
                    )}

                    <h4 className="text-md font-semibold text-white mt-4">Contribution History:</h4>
                    {goal.contributions.length > 0 ? (
                        <ul className="space-y-2 max-h-40 overflow-y-auto">
                            {goal.contributions.map((c, index) => (
                                <li key={index} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded-md">
                                    <div><p className="text-white">Contribution</p><p className="text-xs text-gray-400">{c.date}</p></div>
                                    <p className="font-mono text-green-400">+${c.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No contributions yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const NewGoalModal: React.FC<{ onClose: () => void; onAdd: (goal: Omit<BudgetGoal, 'id' | 'currentAmount' | 'isAchieved' | 'contributions'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [category, setCategory] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [priority, setPriority] = useState<BudgetGoal['priority']>('medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && targetAmount) {
            onAdd({
                name,
                targetAmount: parseFloat(targetAmount),
                category,
                targetDate: targetDate || undefined,
                priority,
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Create New Goal</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Goal Name (e.g., Vacation Fund)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} placeholder="Target Amount (e.g., 2000)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="text" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (e.g., Travel)" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <label htmlFor="targetDate" className="block text-sm font-medium text-gray-400">Target Date (Optional):</label>
                    <input type="date" id="targetDate" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-400">Priority:</label>
                    <select id="priority" value={priority} onChange={e => setPriority(e.target.value as BudgetGoal['priority'])} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Goal</button>
                </div>
            </form>
        </div>
    );
};

export const SubscriptionDetailModal: React.FC<{ subscription: Subscription | null; onClose: () => void; onUpdate: (id: string, updates: Partial<Subscription>) => void; onDelete: (id: string) => void; }> = ({ subscription, onClose, onUpdate, onDelete }) => {
    if (!subscription) return null;

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(subscription.name);
    const [editedAmount, setEditedAmount] = useState(subscription.amount.toString());
    const [editedFrequency, setEditedFrequency] = useState(subscription.frequency);
    const [editedNextRenewalDate, setEditedNextRenewalDate] = useState(subscription.nextRenewalDate);
    const [editedIsActive, setEditedIsActive] = useState(subscription.isActive);

    const handleSave = () => {
        onUpdate(subscription.id, {
            name: editedName,
            amount: parseFloat(editedAmount),
            frequency: editedFrequency,
            nextRenewalDate: editedNextRenewalDate,
            isActive: editedIsActive,
        });
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the "${subscription.name}" subscription?`)) {
            onDelete(subscription.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{subscription.name} Details</h3>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <button onClick={handleSave} className="text-green-400 hover:text-green-300">Save</button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="text-blue-400 hover:text-blue-300">Edit</button>
                        )}
                        <button onClick={handleDelete} className="text-red-400 hover:text-red-300">Delete</button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                    </div>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    <p className="text-gray-300">Amount: {isEditing ? <input type="number" value={editedAmount} onChange={e => setEditedAmount(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg p-1 text-white text-sm w-24 inline-block" /> : `$${subscription.amount.toFixed(2)}`}</p>
                    <p className="text-gray-300">Frequency: {isEditing ? (
                        <select value={editedFrequency} onChange={e => setEditedFrequency(e.target.value as Subscription['frequency'])} className="bg-gray-700/50 border border-gray-600 rounded-lg p-1 text-white text-sm inline-block">
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="annually">Annually</option>
                        </select>
                    ) : subscription.frequency}</p>
                    <p className="text-gray-300">Next Renewal: {isEditing ? <input type="date" value={editedNextRenewalDate} onChange={e => setEditedNextRenewalDate(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-lg p-1 text-white text-sm w-32 inline-block" /> : subscription.nextRenewalDate}</p>
                    <div className="flex items-center">
                        <input type="checkbox" id="isActiveSub" checked={isEditing ? editedIsActive : subscription.isActive} onChange={e => isEditing && setEditedIsActive(e.target.checked)} disabled={!isEditing} className="form-checkbox h-4 w-4 text-cyan-600 rounded border-gray-600 bg-gray-700" />
                        <label htmlFor="isActiveSub" className="ml-2 text-gray-300">Active</label>
                    </div>
                    <p className="text-gray-300">Category: <span className="font-medium text-white">{subscription.category}</span></p>
                    <p className="text-gray-300">Provider: <span className="font-medium text-white">{subscription.provider || 'N/A'}</span></p>
                    <p className="text-gray-300">Notes: <span className="font-medium text-white">{subscription.notes || 'N/A'}</span></p>
                </div>
            </div>
        </div>
    );
};

export const NewSubscriptionModal: React.FC<{ onClose: () => void; onAdd: (sub: Omit<Subscription, 'id'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<Subscription['frequency']>('monthly');
    const [nextRenewalDate, setNextRenewalDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && amount && category) {
            onAdd({
                name,
                amount: parseFloat(amount),
                frequency,
                nextRenewalDate,
                category,
                isActive: true,
                remindersEnabled: true,
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Add New Subscription</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Service Name (e.g., Netflix)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Billing Amount (e.g., 15.99)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <label htmlFor="subFrequency" className="block text-sm font-medium text-gray-400">Frequency:</label>
                    <select id="subFrequency" value={frequency} onChange={e => setFrequency(e.target.value as Subscription['frequency'])} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                        <option value="annually">Annually</option>
                    </select>
                    <label htmlFor="nextRenewalDate" className="block text-sm font-medium text-gray-400">Next Renewal Date:</label>
                    <input type="date" id="nextRenewalDate" value={nextRenewalDate} onChange={e => setNextRenewalDate(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="text" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (e.g., Entertainment)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Subscription</button>
                </div>
            </form>
        </div>
    );
};

export const ScenarioPlannerModal: React.FC<{ onClose: () => void; onRunScenario: (scenario: { name: string; description: string; assumptions: string[] }) => void; scenarios: ScenarioResult[]; }> = ({ onClose, onRunScenario, scenarios }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [newAssumption, setNewAssumption] = useState('');
    const [assumptions, setAssumptions] = useState<string[]>([]);

    const addAssumption = () => {
        if (newAssumption.trim()) {
            setAssumptions([...assumptions, newAssumption.trim()]);
            setNewAssumption('');
        }
    };

    const handleRun = () => {
        if (name && description && assumptions.length > 0) {
            onRunScenario({ name, description, assumptions });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Financial Scenario Planner</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                    <p className="text-gray-400 text-sm">Simulate financial outcomes based on different 'what-if' scenarios.</p>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Scenario Name (e.g., 'New Car Purchase')" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the scenario..." rows={3} required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white resize-y" />

                    <div className="space-y-2">
                        <h4 className="text-md font-semibold text-white">Assumptions:</h4>
                        <div className="flex gap-2">
                            <input type="text" value={newAssumption} onChange={e => setNewAssumption(e.target.value)} placeholder="Add an assumption (e.g., 'Income increases by 10%')" className="flex-grow bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                            <button type="button" onClick={addAssumption} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Add</button>
                        </div>
                        <ul className="list-disc list-inside text-gray-300">
                            {assumptions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>
                    <button type="button" onClick={handleRun} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Run Scenario Simulation</button>

                    {scenarios.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h4 className="text-xl font-semibold text-white">Past Scenario Results:</h4>
                            {scenarios.map(s => (
                                <Card key={s.id} variant="interactive" className="p-4 border border-gray-700">
                                    <h5 className="text-lg font-semibold text-white">{s.name}</h5>
                                    <p className="text-gray-400 text-sm italic">{s.description}</p>
                                    <p className="text-gray-500 text-xs mt-2">Created: {s.dateCreated}</p>
                                    <ul className="text-gray-300 text-sm mt-2 list-disc list-inside">
                                        <li>Savings Impact: <span className="text-green-400">${s.projectedOutcome.savingsImpact.toFixed(2)}</span></li>
                                        <li>Net Worth Impact: <span className="text-green-400">${s.projectedOutcome.netWorthImpact.toFixed(2)}</span></li>
                                        <li>Future Score Change: <span className={`${s.projectedOutcome.futureScoreChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.projectedOutcome.futureScoreChange}%</span></li>
                                    </ul>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AISageSettingsModal: React.FC<{ onClose: () => void; profile: AISageProfile; onUpdateProfile: (updates: Partial<AISageProfile>) => void; }> = ({ onClose, profile, onUpdateProfile }) => {
    const [preferredTone, setPreferredTone] = useState(profile.preferredTone);
    const [proactiveAlertsEnabled, setProactiveAlertsEnabled] = useState(profile.proactiveAlertsEnabled);
    const [preferredReportFormat, setPreferredReportFormat] = useState(profile.preferredReportFormat);

    const handleSave = () => {
        onUpdateProfile({ preferredTone, proactiveAlertsEnabled, preferredReportFormat });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Quantum Sage Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-400">Preferred Tone:</label>
                        <select id="tone" value={preferredTone} onChange={e => setPreferredTone(e.target.value as AISageProfile['preferredTone'])} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                            <option value="formal">Formal</option>
                            <option value="casual">Casual</option>
                            <option value="encouraging">Encouraging</option>
                            <option value="direct">Direct</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="proactiveAlerts" checked={proactiveAlertsEnabled} onChange={e => setProactiveAlertsEnabled(e.target.checked)} className="form-checkbox h-4 w-4 text-cyan-600 rounded border-gray-600 bg-gray-700" />
                        <label htmlFor="proactiveAlerts" className="text-gray-300">Enable Proactive Alerts</label>
                    </div>
                    <div>
                        <label htmlFor="reportFormat" className="block text-sm font-medium text-gray-400">Preferred Report Format:</label>
                        <select id="reportFormat" value={preferredReportFormat} onChange={e => setPreferredReportFormat(e.target.value as AISageProfile['preferredReportFormat'])} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                            <option value="summary">Summary</option>
                            <option value="detailed">Detailed</option>
                            <option value="visual">Visual</option>
                        </select>
                    </div>
                    <button onClick={handleSave} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Save Settings</button>
                </div>
            </div>
        </div>
    );
};


// ================================================================================================
// NEW MAJOR FEATURE COMPONENTS (EXPORTED)
// ================================================================================================

export const QuantumSageChatInterface: React.FC<{ budgets: BudgetCategory[]; transactions: Transaction[]; goals: BudgetGoal[]; subscriptions: Subscription[]; aiProfile: AISageProfile; onUpdateAIProfile: (updates: Partial<AISageProfile>) => void; }> = ({ budgets, transactions, goals, subscriptions, aiProfile, onUpdateAIProfile }) => {
    const chatRef = useRef<Chat | null>(null);
    const [messages, setMessages] = useState<AIInteractionMessage[]>(aiProfile.learningHistory || []);
    const [inputMessage, setInputMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const getSystemInstruction = useCallback(() => {
        const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit} limit`).join(', ');
        const goalSummary = goals.map(g => `${g.name}: $${g.currentAmount.toFixed(0)} of $${g.targetAmount} target (${g.isAchieved ? 'achieved' : 'in progress'})`).join(', ');
        const subSummary = subscriptions.map(s => `${s.name}: $${s.amount}/${s.frequency}`).join(', ');
        const transactionSummary = `Recent expenses: ${transactions.slice(0, 5).map(tx => `${tx.description} $${tx.amount}`).join(', ')}.`;
        const profileTone = aiProfile.preferredTone;

        return `You are Quantum, a hyper-advanced financial AI advisor. Your core function is to provide highly personalized, insightful, and actionable financial advice, analysis, and forecasts.
        Current User Data:
        - Budgets: ${budgetSummary}
        - Goals: ${goalSummary}
        - Subscriptions: ${subSummary}
        - Transactions Snapshot: ${transactionSummary}
        - User's preferred tone: ${profileTone}.
        - Your responses should reflect this tone.
        - Analyze and provide proactive advice, answer complex financial questions, simulate "what-if" scenarios, and help identify spending patterns. Keep track of the conversation context to provide continuous, relevant support.`;
    }, [budgets, goals, subscriptions, transactions, aiProfile.preferredTone]);

    useEffect(() => {
        const initializeChat = async () => {
            setIsThinking(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: getSystemInstruction() },
                    history: messages.slice(-10).map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model', // Map to AI SDK roles
                        parts: [{ text: msg.content }]
                    }))
                });

                if (messages.length === 0) { // Initial greeting
                    const resultStream = await chatRef.current.sendMessageStream({ message: "Hello Quantum, provide an initial financial insight or a question I can ask." });
                    let text = '';
                    for await (const chunk of resultStream) {
                        text += chunk.text;
                    }
                    setMessages(prev => [...prev, { id: generateUniqueId(), role: 'model', content: text, timestamp: new Date().toLocaleTimeString() }]);
                    onUpdateAIProfile({ learningHistory: [...messages, { id: generateUniqueId(), role: 'model', content: text, timestamp: new Date().toLocaleTimeString() }] });
                }
            } catch (error) {
                console.error("Quantum Sage Chat Error:", error);
                setMessages(prev => [...prev, { id: generateUniqueId(), role: 'model', content: "I'm having trouble connecting right now. Please try again later.", timestamp: new Date().toLocaleTimeString() }]);
            } finally {
                setIsThinking(false);
            }
        };

        initializeChat();
    }, [getSystemInstruction]); // Re-initialize chat if system instruction changes

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isThinking || !chatRef.current) return;

        const newUserMessage: AIInteractionMessage = { id: generateUniqueId(), role: 'user', content: inputMessage, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => [...prev, newUserMessage]);
        onUpdateAIProfile({ learningHistory: [...messages, newUserMessage] });
        setInputMessage('');
        setIsThinking(true);

        try {
            const resultStream = await chatRef.current.sendMessageStream({ message: inputMessage });
            let text = '';
            let modelResponseId = generateUniqueId();
            for await (const chunk of resultStream) {
                text += chunk.text;
                // Update the last message as it streams
                setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.id === modelResponseId) {
                        return [...prev.slice(0, -1), { ...lastMsg, content: text }];
                    } else {
                        return [...prev, { id: modelResponseId, role: 'model', content: text, timestamp: new Date().toLocaleTimeString() }];
                    }
                });
            }
            onUpdateAIProfile({ learningHistory: [...messages, newUserMessage, { id: modelResponseId, role: 'model', content: text, timestamp: new Date().toLocaleTimeString() }] });
        } catch (error) {
            console.error("Quantum Sage Message Error:", error);
            setMessages(prev => [...prev, { id: generateUniqueId(), role: 'model', content: "I encountered an error. Please try asking again.", timestamp: new Date().toLocaleTimeString() }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <Card title="Quantum Sage AI">
            <div className="flex flex-col h-96">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-700/20 rounded-t-lg">
                    {messages.map((msg, index) => (
                        <div key={msg.id || index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-700 text-white' : 'bg-gray-600 text-gray-100'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className="text-xs text-right mt-1 text-gray-300">{msg.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="max-w-[70%] p-3 rounded-lg bg-gray-600 text-gray-100">
                                <p className="text-sm italic">Quantum Sage is thinking...</p>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={sendMessage} className="flex p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        placeholder="Ask Quantum Sage anything about your finances..."
                        className="flex-grow bg-gray-700/50 border border-gray-600 rounded-l-lg p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-600"
                        disabled={isThinking}
                    />
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-r-lg flex items-center gap-1" disabled={isThinking}>
                        {isThinking ? (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        )}
                        Send
                    </button>
                </form>
            </div>
        </Card>
    );
};

export const BudgetGoalTracker: React.FC<{ goals: BudgetGoal[]; onAddGoal: (goal: Omit<BudgetGoal, 'id' | 'currentAmount' | 'isAchieved' | 'contributions'>) => void; onUpdateGoal: (id: string, updates: Partial<BudgetGoal>) => void; }> = ({ goals, onAddGoal, onUpdateGoal }) => {
    const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<BudgetGoal | null>(null);

    const activeGoals = goals.filter(g => !g.isAchieved).sort((a,b) => b.priority.localeCompare(a.priority));
    const achievedGoals = goals.filter(g => g.isAchieved);

    return (
        <Card title="Financial Goals (Odyssey)">
            <div className="p-4 space-y-4">
                <div className="flex justify-end">
                    <button onClick={() => setIsNewGoalModalOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Goal
                    </button>
                </div>
                {activeGoals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeGoals.map(goal => {
                            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                            return (
                                <Card key={goal.id} variant="interactive" onClick={() => setSelectedGoal(goal)}>
                                    <h4 className="text-lg font-semibold text-white">{goal.name}</h4>
                                    <p className="text-gray-400 text-sm">{goal.category || 'General'} - <span className="capitalize">{goal.priority} Priority</span></p>
                                    <div className="my-2">
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 flex justify-between">
                                            <span>${goal.currentAmount.toFixed(2)}</span>
                                            <span>${goal.targetAmount.toFixed(2)} ({progress.toFixed(0)}%)</span>
                                        </p>
                                    </div>
                                    {goal.targetDate && <p className="text-xs text-gray-500">Target by: {goal.targetDate}</p>}
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center">No active goals set yet. Start your Odyssey!</p>
                )}

                {achievedGoals.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-3">Achieved Goals ({achievedGoals.length})</h4>
                        <ul className="space-y-2">
                            {achievedGoals.map(goal => (
                                <li key={goal.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-md">
                                    <span className="text-white text-md line-through">{goal.name}</span>
                                    <span className="text-green-400 text-sm">Achieved!</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {isNewGoalModalOpen && <NewGoalModal onClose={() => setIsNewGoalModalOpen(false)} onAdd={onAddGoal} />}
            {selectedGoal && <GoalDetailModal goal={selectedGoal} onClose={() => setSelectedGoal(null)} onUpdateGoal={onUpdateGoal} />}
        </Card>
    );
};

export const SubscriptionManager: React.FC<{ subscriptions: Subscription[]; onAddSubscription: (sub: Omit<Subscription, 'id'>) => void; onUpdateSubscription: (id: string, updates: Partial<Subscription>) => void; onDeleteSubscription: (id: string) => void; }> = ({ subscriptions, onAddSubscription, onUpdateSubscription, onDeleteSubscription }) => {
    const [isNewSubscriptionModalOpen, setIsNewSubscriptionModalOpen] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

    const sortedSubscriptions = useMemo(() => {
        return [...subscriptions].sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime());
    }, [subscriptions]);

    const upcomingSubscriptions = sortedSubscriptions.filter(s => s.isActive && new Date(s.nextRenewalDate).getTime() > Date.now());
    const inactiveSubscriptions = sortedSubscriptions.filter(s => !s.isActive);

    const totalMonthlyCost = useMemo(() => {
        return subscriptions.filter(s => s.isActive).reduce((sum, s) => {
            if (s.frequency === 'monthly') return sum + s.amount;
            if (s.frequency === 'annually') return sum + (s.amount / 12);
            if (s.frequency === 'weekly') return sum + (s.amount * 4); // Approx
            return sum;
        }, 0);
    }, [subscriptions]);

    const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];
    const dataForChart = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        subscriptions.filter(s => s.isActive).forEach(sub => {
            const monthlyCost = sub.amount / (sub.frequency === 'annually' ? 12 : sub.frequency === 'weekly' ? 0.25 : 1);
            categoryMap[sub.category] = (categoryMap[sub.category] || 0) + monthlyCost;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [subscriptions]);

    return (
        <Card title="Subscription Sentinel">
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Your Subscriptions</h3>
                    <button onClick={() => setIsNewSubscriptionModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Subscription
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                        <h4 className="text-lg font-semibold text-white mb-2">Total Monthly Subscription Cost:</h4>
                        <p className="text-4xl font-bold text-red-400">-${totalMonthlyCost.toFixed(2)}</p>
                    </div>
                    <div className="md:w-1/2 h-48 bg-gray-700/30 rounded-lg p-2 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataForChart} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                                    {dataForChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}/month`}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                {upcomingSubscriptions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-white">Upcoming Payments:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {upcomingSubscriptions.map(sub => (
                                <li key={sub.id} onClick={() => setSelectedSubscription(sub)} className="p-3 bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-600/50 transition-colors duration-200 border border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white font-medium">{sub.name}</span>
                                        <span className="font-mono text-red-400">-${sub.amount.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Renews {sub.frequency} on {sub.nextRenewalDate}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {inactiveSubscriptions.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-700">
                        <h4 className="text-lg font-semibold text-white">Inactive Subscriptions:</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {inactiveSubscriptions.map(sub => (
                                <li key={sub.id} onClick={() => setSelectedSubscription(sub)} className="p-3 bg-gray-700/30 rounded-md cursor-pointer hover:bg-gray-600/30 transition-colors duration-200 border border-gray-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-medium line-through">{sub.name}</span>
                                        <span className="font-mono text-gray-500">-${sub.amount.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Inactive</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {isNewSubscriptionModalOpen && <NewSubscriptionModal onClose={() => setIsNewSubscriptionModalOpen(false)} onAdd={onAddSubscription} />}
            {selectedSubscription && <SubscriptionDetailModal subscription={selectedSubscription} onClose={() => setSelectedSubscription(null)} onUpdate={onUpdateSubscription} onDelete={onDeleteSubscription} />}
        </Card>
    );
};

export const FinancialChallengesDashboard: React.FC<{ challenges: FinancialChallenge[]; onUpdateChallenge: (id: string, updates: Partial<FinancialChallenge>) => void; onAddChallenge: (challenge: Omit<FinancialChallenge, 'id' | 'currentProgress' | 'isCompleted' | 'progressHistory'>) => void; }> = ({ challenges, onUpdateChallenge, onAddChallenge }) => {
    const [isNewChallengeModalOpen, setIsNewChallengeModalOpen] = useState(false);
    const activeChallenges = challenges.filter(c => !c.isCompleted);
    const completedChallenges = challenges.filter(c => c.isCompleted);

    const NewChallengeModal: React.FC<{ onClose: () => void; onAdd: (challenge: Omit<FinancialChallenge, 'id' | 'currentProgress' | 'isCompleted' | 'progressHistory'>) => void; }> = ({ onClose, onAdd }) => {
        const [name, setName] = useState('');
        const [description, setDescription] = useState('');
        const [target, setTarget] = useState('');
        const [metric, setMetric] = useState<FinancialChallenge['metric']>('amountSaved');
        const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
        const [endDate, setEndDate] = useState('');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (name && target && endDate) {
                onAdd({
                    name,
                    description,
                    target: parseFloat(target),
                    metric,
                    startDate,
                    endDate,
                    reward: '',
                });
                onClose();
            }
        };

        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
                <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Start New Challenge</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Challenge Name (e.g., No Spend November)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Briefly describe the challenge goal..." rows={2} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white resize-y" />
                        <input type="number" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Target (e.g., 500 for saving, 10 for % reduced)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <label htmlFor="metric" className="block text-sm font-medium text-gray-400">Metric:</label>
                        <select id="metric" value={metric} onChange={e => setMetric(e.target.value as FinancialChallenge['metric'])} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                            <option value="amountSaved">Amount Saved ($)</option>
                            <option value="percentReduced">Spending Reduced (%)</option>
                            <option value="transactionsLimited">Transactions Limited (count)</option>
                        </select>
                        <label htmlFor="challengeStartDate" className="block text-sm font-medium text-gray-400">Start Date:</label>
                        <input type="date" id="challengeStartDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <label htmlFor="challengeEndDate" className="block text-sm font-medium text-gray-400">End Date:</label>
                        <input type="date" id="challengeEndDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Launch Challenge</button>
                    </div>
                </form>
            </div>
        );
    };

    return (
        <Card title="Financial Challenges (Ascent)">
            <div className="p-4 space-y-4">
                <div className="flex justify-end">
                    <button onClick={() => setIsNewChallengeModalOpen(true)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Challenge
                    </button>
                </div>

                {activeChallenges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeChallenges.map(challenge => {
                            const progress = Math.min((challenge.currentProgress / challenge.target) * 100, 100);
                            return (
                                <Card key={challenge.id} variant="default" className="p-4">
                                    <h4 className="text-lg font-semibold text-white">{challenge.name}</h4>
                                    <p className="text-gray-400 text-sm">{challenge.description}</p>
                                    <div className="my-2">
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 flex justify-between">
                                            <span>Progress: {challenge.currentProgress.toFixed(0)}</span>
                                            <span>Target: {challenge.target.toFixed(0)} ({progress.toFixed(0)}%)</span>
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-500">Ends: {challenge.endDate}</p>
                                    <button onClick={() => onUpdateChallenge(challenge.id, { isCompleted: true })} className="mt-3 w-full py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Mark Complete (Demo)</button>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center">No active challenges. Start one to boost your financial discipline!</p>
                )}

                {completedChallenges.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-3">Completed Challenges ({completedChallenges.length})</h4>
                        <ul className="space-y-2">
                            {completedChallenges.map(challenge => (
                                <li key={challenge.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-md">
                                    <span className="text-white text-md line-through">{challenge.name}</span>
                                    <span className="text-green-400 text-sm">Completed! {challenge.reward && `(${challenge.reward})`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {isNewChallengeModalOpen && <NewChallengeModal onClose={() => setIsNewChallengeModalOpen(false)} onAdd={onAddChallenge} />}
        </Card>
    );
};

export const FinancialDashboardOverview: React.FC<{ budgets: BudgetCategory[]; transactions: Transaction[]; goals: BudgetGoal[]; subscriptions: Subscription[] }> = ({ budgets, transactions, goals, subscriptions }) => {
    const financialHealthScore = useMemo(() => calculateFinancialHealthScore(budgets, transactions, goals, subscriptions), [budgets, transactions, goals, subscriptions]);

    const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
    const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
    const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
    const totalExpenses = transactions.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + tx.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;

    const summaryMetrics: FinancialMetricDisplay[] = [
        { id: '1', name: 'Financial Health Score', value: financialHealthScore, unit: '/100', trend: financialHealthScore > 75 ? 'up' : financialHealthScore > 50 ? 'stable' : 'down', icon: '❤️' },
        { id: '2', name: 'Total Budgeted', value: totalBudgetLimit, unit: '$', trend: 'neutral', description: 'Overall allocated funds across all budgets' },
        { id: '3', name: 'Total Spent', value: totalBudgetSpent, unit: '$', trend: 'up', description: 'Cumulative spending across all active budgets' },
        { id: '4', name: 'Net Cash Flow', value: netCashFlow, unit: '$', trend: netCashFlow >= 0 ? 'up' : 'down', description: 'Income minus expenses for the current period' },
        { id: '5', name: 'Active Goals', value: goals.filter(g => !g.isAchieved).length, unit: '', trend: 'up', description: 'Number of financial goals currently being pursued' },
        { id: '6', name: 'Total Subscriptions', value: subscriptions.filter(s => s.isActive).length, unit: '', trend: 'up', description: 'Active recurring payments' },
    ];

    const budgetStatusData = budgets.map(b => ({
        name: b.name,
        spent: b.spent,
        remaining: b.limit - b.spent,
        limit: b.limit,
    }));

    return (
        <Card title="Financial Overview (Nexus Dashboard)">
            <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                    {summaryMetrics.map(metric => (
                        <div key={metric.id} className="p-4 bg-gray-700/30 rounded-lg border border-gray-700">
                            <h4 className="text-sm text-gray-400 flex items-center gap-2">{metric.icon} {metric.name}</h4>
                            <p className="text-2xl font-bold text-white mt-1">{metric.unit === '$' ? `$${metric.value.toFixed(2)}` : `${metric.value.toFixed(0)}${metric.unit}`}</p>
                            <span className={`text-xs ${metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                                {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : ''} {metric.description}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">Budget Allocation Summary</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={budgets.map(b => ({ name: b.name, value: b.limit }))}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label
                                >
                                    {budgets.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#6366f1'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">Budget Performance</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={budgetStatusData}>
                                <XAxis dataKey="name" stroke="#9ca3af"/>
                                <YAxis stroke="#9ca3af"/>
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`}/>
                                <Legend />
                                <Bar dataKey="spent" stackId="a" fill="#ef4444" name="Spent" />
                                <Bar dataKey="remaining" stackId="a" fill="#10b981" name="Remaining" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Recent Financial Alerts (AI-Generated)</h4>
                    <ul className="space-y-2 text-gray-300 text-sm italic">
                        <li>⚠️ High spending detected in "Eating Out" budget, currently at 92% of limit.</li>
                        <li>✅ "Vacation Fund" goal received a $150 contribution. Keep it up!</li>
                        <li>🔔 Netflix subscription renewal for $15.99 due in 3 days.</li>
                        <li>📈 Your financial health score improved by 3 points this week!</li>
                        <li>💡 Consider re-evaluating your "Utilities" budget based on last quarter's average.</li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export const FinancialReportsGenerator: React.FC<{ budgets: BudgetCategory[]; transactions: Transaction[]; goals: BudgetGoal[]; subscriptions: Subscription[]; }> = ({ budgets, transactions, goals, subscriptions }) => {
    const [reportType, setReportType] = useState('monthlySpending');
    const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [generatedReport, setGeneratedReport] = useState<any | null>(null);

    const generateReport = () => {
        // Simulate complex report generation based on reportType and date range
        let reportData: any = { type: reportType, startDate, endDate, summary: {}, details: [] };

        const filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return txDate >= start && txDate <= end;
        });

        if (reportType === 'monthlySpending') {
            const spendingByCategory: { [key: string]: number } = {};
            filteredTransactions.filter(tx => tx.type === 'expense').forEach(tx => {
                spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + tx.amount;
            });
            reportData.summary = { totalExpenses: filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0) };
            reportData.details = Object.entries(spendingByCategory).map(([category, amount]) => ({ category, amount }));
        } else if (reportType === 'cashFlow') {
            const income = filteredTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
            const expenses = filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
            reportData.summary = { totalIncome: income, totalExpenses: expenses, netFlow: income - expenses };
            reportData.details = filteredTransactions.map(tx => ({ date: tx.date, description: tx.description, amount: tx.amount, type: tx.type }));
        } else if (reportType === 'budgetPerformance') {
            reportData.details = budgets.map(b => ({
                name: b.name,
                limit: b.limit,
                spent: b.spent,
                remaining: b.limit - b.spent,
                percentageUsed: (b.spent / b.limit) * 100,
            }));
        }

        setGeneratedReport(reportData);
    };

    return (
        <Card title="Financial Reports (Chronicle)">
            <div className="p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
                    <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full sm:w-auto bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                        <option value="monthlySpending">Monthly Spending by Category</option>
                        <option value="cashFlow">Cash Flow Statement</option>
                        <option value="budgetPerformance">Budget Performance</option>
                        <option value="netWorthProjection">Net Worth Projection (Advanced)</option>
                        <option value="taxSummary">Tax Summary (Annual)</option>
                    </select>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full sm:w-auto bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <span className="text-gray-400 hidden sm:block">to</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full sm:w-auto bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button onClick={generateReport} className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Generate Report</button>
                </div>

                {generatedReport && (
                    <div className="bg-gray-700/20 p-4 rounded-lg space-y-4">
                        <h4 className="text-xl font-semibold text-white">Generated Report: {generatedReport.type.replace(/([A-Z])/g, ' $1').trim()}</h4>
                        <p className="text-gray-400 text-sm">From {generatedReport.startDate} to {generatedReport.endDate}</p>

                        {reportType === 'monthlySpending' && (
                            <div>
                                <p className="text-lg font-bold text-white">Total Expenses: <span className="text-red-400">-${generatedReport.summary.totalExpenses.toFixed(2)}</span></p>
                                <ul className="mt-2 space-y-1">
                                    {generatedReport.details.map((item: any, idx: number) => (
                                        <li key={idx} className="flex justify-between text-gray-300 text-sm">
                                            <span>{item.category}:</span>
                                            <span className="text-red-300">-${item.amount.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="h-48 w-full bg-gray-700/30 rounded-lg p-2 mt-4 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={generatedReport.details}>
                                            <XAxis dataKey="category" stroke="#9ca3af" interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis stroke="#9ca3af" />
                                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`}/>
                                            <Bar dataKey="amount" fill="#ef4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {reportType === 'cashFlow' && (
                            <div>
                                <p className="text-lg font-bold text-white">Total Income: <span className="text-green-400">${generatedReport.summary.totalIncome.toFixed(2)}</span></p>
                                <p className="text-lg font-bold text-white">Total Expenses: <span className="text-red-400">-${generatedReport.summary.totalExpenses.toFixed(2)}</span></p>
                                <p className="text-xl font-bold text-white mt-2">Net Flow: <span className={`${generatedReport.summary.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>${generatedReport.summary.netFlow.toFixed(2)}</span></p>
                                <h5 className="text-md font-semibold text-white mt-4">Transactions:</h5>
                                <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                    {generatedReport.details.map((item: any, idx: number) => (
                                        <li key={idx} className="flex justify-between text-gray-300 text-sm">
                                            <span>{item.date} - {item.description}</span>
                                            <span className={item.type === 'income' ? 'text-green-300' : 'text-red-300'}>{item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {reportType === 'budgetPerformance' && (
                            <div>
                                <h5 className="text-md font-semibold text-white mt-4">Budget Usage:</h5>
                                <ul className="mt-2 space-y-2">
                                    {generatedReport.details.map((item: any) => (
                                        <li key={item.name} className="p-2 bg-gray-700/50 rounded-md">
                                            <div className="flex justify-between text-gray-300 text-sm">
                                                <span className="font-semibold">{item.name}</span>
                                                <span>${item.spent.toFixed(2)} / ${item.limit.toFixed(2)} ({item.percentageUsed.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                                                <div className="h-1 rounded-full" style={{ width: `${item.percentageUsed}%`, backgroundColor: item.percentageUsed < 75 ? '#06b6d4' : item.percentageUsed < 95 ? '#f59e0b' : '#ef4444' }}></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {(reportType === 'netWorthProjection' || reportType === 'taxSummary') && (
                            <p className="text-gray-400 italic">Advanced report type selected. AI-powered generation and detailed projections are typically displayed here.</p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};

// ================================================================================================
// MAIN VIEW COMPONENT: BudgetsView (Allocatra)
// ================================================================================================

export const BudgetsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BudgetsView must be within a DataProvider.");

    const { budgets, transactions, addBudget, updateBudget, deleteBudget, addTransaction } = context;

    // --- Local State for All New Features ---
    const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
    const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

    // Goals State
    const [goals, setGoals] = useState<BudgetGoal[]>([
        { id: generateUniqueId(), name: 'Emergency Fund', targetAmount: 5000, currentAmount: 1200, isAchieved: false, priority: 'high', contributions: [{date: '2023-01-15', amount: 200}, {date: '2023-02-01', amount: 300}, {date: '2023-03-01', amount: 700}] },
        { id: generateUniqueId(), name: 'New Laptop', targetAmount: 1500, currentAmount: 800, isAchieved: false, priority: 'medium', targetDate: '2024-12-31', contributions: [{date: '2023-04-10', amount: 800}] },
        { id: generateUniqueId(), name: 'Dream Vacation', targetAmount: 10000, currentAmount: 0, isAchieved: false, priority: 'low', targetDate: '2025-07-01', contributions: [] },
    ]);
    const addGoal = (newGoal: Omit<BudgetGoal, 'id' | 'currentAmount' | 'isAchieved' | 'contributions'>) => {
        setGoals(prev => [...prev, { ...newGoal, id: generateUniqueId(), currentAmount: 0, isAchieved: false, contributions: [] }]);
    };
    const updateGoal = (id: string, updates: Partial<BudgetGoal>) => {
        setGoals(prev => prev.map(goal => goal.id === id ? { ...goal, ...updates } : goal));
    };

    // Subscriptions State
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([
        { id: generateUniqueId(), name: 'Netflix', amount: 15.99, frequency: 'monthly', nextRenewalDate: '2024-07-10', category: 'Entertainment', isActive: true, remindersEnabled: true, provider: 'Netflix Inc.' },
        { id: generateUniqueId(), name: 'Spotify Premium', amount: 10.99, frequency: 'monthly', nextRenewalDate: '2024-07-20', category: 'Entertainment', isActive: true, remindersEnabled: true, provider: 'Spotify AB' },
        { id: generateUniqueId(), name: 'Gym Membership', amount: 45.00, frequency: 'monthly', nextRenewalDate: '2024-07-05', category: 'Health', isActive: true, remindersEnabled: true, provider: 'FitZone' },
        { id: generateUniqueId(), name: 'Amazon Prime', amount: 139.00, frequency: 'annually', nextRenewalDate: '2025-01-01', category: 'Shopping', isActive: true, remindersEnabled: true, provider: 'Amazon' },
        { id: generateUniqueId(), name: 'Adobe Creative Cloud', amount: 52.99, frequency: 'monthly', nextRenewalDate: '2024-07-12', category: 'Software', isActive: true, remindersEnabled: true, provider: 'Adobe Inc.' },
    ]);
    const addSubscription = (newSub: Omit<Subscription, 'id'>) => {
        setSubscriptions(prev => [...prev, { ...newSub, id: generateUniqueId() }]);
    };
    const updateSubscription = (id: string, updates: Partial<Subscription>) => {
        setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, ...updates } : sub));
    };
    const deleteSubscription = (id: string) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    };

    // Challenges State
    const [challenges, setChallenges] = useState<FinancialChallenge[]>([
        { id: generateUniqueId(), name: 'Coffee Detox', description: 'No buying coffee for 30 days', target: 0, metric: 'transactionsLimited', currentProgress: 0, startDate: '2024-06-01', endDate: '2024-06-30', isCompleted: false, progressHistory: [] },
        { id: generateUniqueId(), name: 'Save $500 this month', description: 'Actively save $500', target: 500, metric: 'amountSaved', currentProgress: 150, startDate: '2024-07-01', endDate: '2024-07-31', isCompleted: false, progressHistory: [{date: '2024-07-05', value: 50}, {date: '2024-07-10', value: 100}] },
        { id: generateUniqueId(), name: 'Cook at Home', description: 'Reduce eating out by 50%', target: 50, metric: 'percentReduced', currentProgress: 60, startDate: '2024-05-01', endDate: '2024-05-31', isCompleted: true, reward: 'New Cookbook', progressHistory: [{date: '2024-05-31', value: 60}] },
    ]);
    const addChallenge = (newChallenge: Omit<FinancialChallenge, 'id' | 'currentProgress' | 'isCompleted' | 'progressHistory'>) => {
        setChallenges(prev => [...prev, { ...newChallenge, id: generateUniqueId(), currentProgress: 0, isCompleted: false, progressHistory: [] }]);
    };
    const updateChallenge = (id: string, updates: Partial<FinancialChallenge>) => {
        setChallenges(prev => prev.map(challenge => challenge.id === id ? { ...challenge, ...updates } : challenge));
    };

    // AI Sage Profile & Scenario State
    const [aiProfile, setAiProfile] = useState<AISageProfile>({
        preferredTone: 'encouraging',
        learningHistory: [],
        financialGoalsLearned: [],
        spendingPatternsIdentified: [],
        proactiveAlertsEnabled: true,
        preferredReportFormat: 'summary',
    });
    const updateAIProfile = (updates: Partial<AISageProfile>) => {
        setAiProfile(prev => ({ ...prev, ...updates }));
    };
    const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
    const [isScenarioPlannerModalOpen, setIsScenarioPlannerModalOpen] = useState(false);
    const [isAISageSettingsModalOpen, setIsAISageSettingsModalOpen] = useState(false);

    const runScenario = (scenarioDetails: { name: string; description: string; assumptions: string[] }) => {
        // Simulate scenario analysis and generate a result
        const projectedOutcome: ScenarioResult['projectedOutcome'] = {
            budgetImpact: [{ category: 'Food', change: -50 }, { category: 'Entertainment', change: -100 }],
            savingsImpact: Math.random() * 500 - 200, // Random impact for demo
            netWorthImpact: Math.random() * 2000 - 500,
            futureScoreChange: Math.random() * 10 - 5,
        };
        const newScenarioResult: ScenarioResult = {
            id: generateUniqueId(),
            dateCreated: new Date().toISOString().split('T')[0],
            projectedOutcome,
            ...scenarioDetails,
        };
        setScenarios(prev => [...prev, newScenarioResult]);
    };


    // --- Tab / View Management for the "Universe" ---
    type AllocatraView = 'overview' | 'budgets' | 'goals' | 'subscriptions' | 'challenges' | 'reports' | 'sage';
    const [currentView, setCurrentView] = useState<AllocatraView>('overview');

    const renderView = () => {
        switch (currentView) {
            case 'overview':
                return <FinancialDashboardOverview budgets={budgets} transactions={transactions} goals={goals} subscriptions={subscriptions} />;
            case 'budgets':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {budgets.map(budget => {
                                const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                                let color;
                                if (percentage < 75) color = '#06b6d4'; // cyan
                                else if (percentage < 95) color = '#f59e0b'; // yellow
                                else color = '#ef4444'; // red

                                return (
                                    <Card key={budget.id} variant="interactive" onClick={() => setSelectedBudget(budget)}>
                                        <div className="text-center">
                                            <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
                                            <div className="relative h-40 w-40 mx-auto my-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: budget.name, value: percentage, fill: color }]} startAngle={90} endAngle={-270}>
                                                        <RadialBar background dataKey="value" cornerRadius={10} />
                                                    </RadialBarChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                    <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
                                                    <span className="text-xs text-gray-400">used</span>
                                                </div>
                                            </div>
                                            <p className="font-mono text-sm text-gray-300">
                                                ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                                            </p>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                );
            case 'goals':
                return <BudgetGoalTracker goals={goals} onAddGoal={addGoal} onUpdateGoal={updateGoal} />;
            case 'subscriptions':
                return <SubscriptionManager subscriptions={subscriptions} onAddSubscription={addSubscription} onUpdateSubscription={updateSubscription} onDeleteSubscription={deleteSubscription} />;
            case 'challenges':
                return <FinancialChallengesDashboard challenges={challenges} onUpdateChallenge={updateChallenge} onAddChallenge={addChallenge} />;
            case 'reports':
                return <FinancialReportsGenerator budgets={budgets} transactions={transactions} goals={goals} subscriptions={subscriptions} />;
            case 'sage':
                return <QuantumSageChatInterface budgets={budgets} transactions={transactions} goals={goals} subscriptions={subscriptions} aiProfile={aiProfile} onUpdateAIProfile={updateAIProfile} />;
            default:
                return <p className="text-gray-400">Select a view from the navigation.</p>;
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-3xl font-bold text-white tracking-wider mb-4 sm:mb-0">Allocatra: Financial Universe</h2>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                        <button onClick={() => setIsNewBudgetModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            New Budget
                        </button>
                        <button onClick={() => setIsScenarioPlannerModalOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19L3 16V6l6 3M9 19l12-3M3 6l9-3 9 3M3 6v10l6 3m0 0l-1.429-1.429M12 13V6" /></svg>
                            Scenario
                        </button>
                        <button onClick={() => setIsAISageSettingsModalOpen(true)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.827 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.827-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.827-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            AI Settings
                        </button>
                    </div>
                </div>

                {/* Main Navigation for the "Universe" */}
                <nav className="flex space-x-1 border-b border-gray-700 pb-2 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {['overview', 'budgets', 'goals', 'subscriptions', 'challenges', 'reports', 'sage'].map((viewName) => (
                        <button
                            key={viewName}
                            onClick={() => setCurrentView(viewName as AllocatraView)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                                currentView === viewName
                                    ? 'bg-gray-700 text-white border-b-2 border-cyan-500'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
                        </button>
                    ))}
                </nav>

                {renderView()}
            </div>

            <BudgetDetailModal
                budget={selectedBudget}
                transactions={transactions}
                onClose={() => setSelectedBudget(null)}
                onUpdateBudget={updateBudget}
                onDeleteBudget={deleteBudget}
            />
            {isNewBudgetModalOpen && <NewBudgetModal onClose={() => setIsNewBudgetModalOpen(false)} onAdd={addBudget} budgets={budgets} goals={goals} />}
            {isScenarioPlannerModalOpen && <ScenarioPlannerModal onClose={() => setIsScenarioPlannerModalOpen(false)} onRunScenario={runScenario} scenarios={scenarios} />}
            {isAISageSettingsModalOpen && <AISageSettingsModal onClose={() => setIsAISageSettingsModalOpen(false)} profile={aiProfile} onUpdateProfile={updateAIProfile} />}
        </>
    );
};

export default BudgetsView;