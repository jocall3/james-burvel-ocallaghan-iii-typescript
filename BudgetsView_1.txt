import React, { useContext, useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { BudgetCategory, Transaction } from '../../../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// ================================================================================================
// NEW TYPES & UTILITIES (Expanding capabilities)
// ================================================================================================

/**
 * Represents a financial goal the user is working towards.
 */
export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number; // How much has been contributed
    targetDate: string; // ISO date string
    priority: 'low' | 'medium' | 'high';
    linkedBudgets: string[]; // IDs of budget categories contributing to this goal
    status: 'active' | 'completed' | 'on-hold';
    createdAt: string;
    notes?: string;
}

/**
 * Represents an alert condition for a budget.
 */
export interface BudgetAlert {
    id: string;
    budgetId: string;
    triggerType: 'percentage' | 'amount';
    threshold: number; // 0-100 for percentage, or dollar amount
    message: string;
    isActive: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'once';
    lastTriggered?: string; // ISO date string
    channel: 'in-app' | 'email';
}

/**
 * Represents a historical budget snapshot for reporting/analysis.
 */
export interface HistoricalBudgetSnapshot {
    budgetId: string;
    monthYear: string; // e.g., "2023-11"
    limit: number;
    spent: number;
}

/**
 * Represents a budget template.
 */
export interface BudgetTemplate {
    id: string;
    name: string;
    description: string;
    categories: Array<{
        name: string;
        defaultLimit: number;
        color: string;
    }>;
}

/**
 * Represents a custom spending rule.
 */
export interface SpendingRule {
    id: string;
    name: string;
    category: string; // Category to apply the rule to
    type: 'limit' | 'frequency'; // e.g., "limit $50 per transaction", "max 3 transactions per week"
    value: number;
    period?: 'day' | 'week' | 'month' | 'transaction'; // If type is frequency or limit per period
    isActive: boolean;
    description?: string;
}

/**
 * Represents a planned budget for a future period.
 */
export interface BudgetPlan {
    id: string;
    name: string; // e.g., "Q1 2024 Budget"
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    plannedCategories: Array<{
        budgetId: string; // Reference to existing budget category ID
        plannedLimit: number;
        notes?: string;
    }>;
    status: 'draft' | 'active' | 'completed' | 'archived';
    createdAt: string;
    lastUpdated: string;
}

/**
 * Utility function to generate a random color.
 */
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

/**
 * Utility to format currency.
 */
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

/**
 * Calculates the total spent for a given budget category from a list of transactions.
 * @param budgetName - The name of the budget category.
 * @param transactions - List of all transactions.
 * @returns The total amount spent.
 */
export const calculateSpentForBudget = (budgetName: string, transactions: Transaction[]): number => {
    return transactions
        .filter(tx => tx.type === 'expense' && tx.category.toLowerCase() === budgetName.toLowerCase())
        .reduce((sum, tx) => sum + tx.amount, 0);
};

/**
 * Utility to get current month in YYYY-MM format.
 */
const getCurrentMonthYear = () => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
};

/**
 * Generates dummy historical budget data for the last 12 months.
 * This function simulates a backend data source.
 * @param budgets - Current list of budget categories.
 * @returns An array of HistoricalBudgetSnapshot.
 */
export const generateHistoricalBudgetSnapshots = (budgets: BudgetCategory[]): HistoricalBudgetSnapshot[] => {
    const snapshots: HistoricalBudgetSnapshot[] = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) { // Last 12 months
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        budgets.forEach(budget => {
            // Simulate some variance in spending around the limit
            const limit = budget.limit;
            const spentFactor = Math.random() * (1.2 - 0.7) + 0.7; // Spend between 70% and 120% of limit
            const spent = Math.min(limit * spentFactor, limit * 1.5); // Cap at 150% to prevent extreme values

            snapshots.push({
                budgetId: budget.id,
                monthYear,
                limit,
                spent: parseFloat(spent.toFixed(2)),
            });
        });
    }
    return snapshots.reverse(); // Show from oldest to newest
};

// ================================================================================================
// MODAL & DETAIL COMPONENTS (Original & New Additions)
// ================================================================================================

export const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;

    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === budget.name.toLowerCase() && tx.type === 'expense');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{budget.name} Budget Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {relevantTransactions.length > 0 ? (
                        <ul className="space-y-2">
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
                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

export const NewBudgetModal: React.FC<{ onClose: () => void; onAdd: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');
        if (!name.trim()) {
            setValidationError('Budget name cannot be empty.');
            return;
        }
        if (parseFloat(limit) <= 0 || isNaN(parseFloat(limit))) {
            setValidationError('Budget limit must be a positive number.');
            return;
        }
        onAdd({ name: name.trim(), limit: parseFloat(limit) });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Create New Budget</h3></div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Category Name (e.g., Groceries)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" />
                    <input type="number" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Monthly Limit (e.g., 500)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" min="0.01" step="0.01" />
                    {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition duration-200">Add Budget</button>
                </div>
            </form>
        </div>
    );
};

export const EditBudgetModal: React.FC<{
    budget: BudgetCategory | null;
    onClose: () => void;
    onSave: (id: string, updates: Partial<BudgetCategory>) => void;
}> = ({ budget, onClose, onSave }) => {
    const [name, setName] = useState(budget?.name || '');
    const [limit, setLimit] = useState(budget?.limit.toString() || '');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (budget) {
            setName(budget.name);
            setLimit(budget.limit.toString());
        }
    }, [budget]);

    if (!budget) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');
        if (!name.trim()) {
            setValidationError('Budget name cannot be empty.');
            return;
        }
        const newLimit = parseFloat(limit);
        if (newLimit <= 0 || isNaN(newLimit)) {
            setValidationError('Budget limit must be a positive number.');
            return;
        }

        onSave(budget.id, { name: name.trim(), limit: newLimit });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Edit Budget: {budget.name}</h3></div>
                <div className="p-6 space-y-4">
                    <label htmlFor="budget-name" className="block text-sm font-medium text-gray-300">Budget Name</label>
                    <input type="text" id="budget-name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" />

                    <label htmlFor="budget-limit" className="block text-sm font-medium text-gray-300">Monthly Limit</label>
                    <input type="number" id="budget-limit" value={limit} onChange={e => setLimit(e.target.value)} required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" min="0.01" step="0.01" />

                    {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition duration-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition duration-200">Save Changes</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export const ConfirmDeleteModal: React.FC<{
    budgetName: string;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ budgetName, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-sm w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-red-400">Confirm Deletion</h3></div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-300">Are you sure you want to delete the budget "{budgetName}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition duration-200">Cancel</button>
                        <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition duration-200">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NewFinancialGoalModal: React.FC<{
    onClose: () => void;
    onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'status' | 'currentAmount' | 'lastUpdated'>) => void;
    budgetCategories: BudgetCategory[];
}> = ({ onClose, onAddGoal, budgetCategories }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [priority, setPriority] = useState<FinancialGoal['priority']>('medium');
    const [linkedBudgets, setLinkedBudgets] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (!name.trim()) { setValidationError('Goal name is required.'); return; }
        const amount = parseFloat(targetAmount);
        if (isNaN(amount) || amount <= 0) { setValidationError('Target amount must be a positive number.'); return; }
        if (!targetDate) { setValidationError('Target date is required.'); return; }
        if (new Date(targetDate) <= new Date()) { setValidationError('Target date must be in the future.'); return; }

        onAddGoal({
            name: name.trim(),
            targetAmount: amount,
            targetDate,
            priority,
            linkedBudgets,
            notes: notes.trim()
        });
        onClose();
    };

    const handleBudgetLinkToggle = (budgetId: string) => {
        setLinkedBudgets(prev =>
            prev.includes(budgetId) ? prev.filter(id => id !== budgetId) : [...prev, budgetId]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Set New Financial Goal</h3></div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="goal-name" className="block text-sm font-medium text-gray-300">Goal Name</label>
                        <input type="text" id="goal-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="target-amount" className="block text-sm font-medium text-gray-300">Target Amount ($)</label>
                        <input type="number" id="target-amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" min="0.01" step="0.01" />
                    </div>
                    <div>
                        <label htmlFor="target-date" className="block text-sm font-medium text-gray-300">Target Completion Date</label>
                        <input type="date" id="target-date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority</label>
                        <select id="priority" value={priority} onChange={e => setPriority(e.target.value as FinancialGoal['priority'])} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Link Budgets (Optional)</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                            {budgetCategories.map(budget => (
                                <div key={budget.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`link-budget-${budget.id}`}
                                        checked={linkedBudgets.includes(budget.id)}
                                        onChange={() => handleBudgetLinkToggle(budget.id)}
                                        className="h-4 w-4 text-cyan-600 border-gray-600 rounded focus:ring-cyan-500 bg-gray-700"
                                    />
                                    <label htmlFor={`link-budget-${budget.id}`} className="ml-2 text-sm text-gray-300">{budget.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notes (Optional)</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                    </div>

                    {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition duration-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition duration-200">Create Goal</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export const BudgetAlertSettingsModal: React.FC<{
    budgets: BudgetCategory[];
    alerts: BudgetAlert[];
    onClose: () => void;
    onAddAlert: (alert: Omit<BudgetAlert, 'id' | 'lastTriggered'>) => void;
    onUpdateAlert: (id: string, updates: Partial<BudgetAlert>) => void;
    onDeleteAlert: (id: string) => void;
}> = ({ budgets, alerts, onClose, onAddAlert, onUpdateAlert, onDeleteAlert }) => {
    const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
    const [triggerType, setTriggerType] = useState<BudgetAlert['triggerType']>('percentage');
    const [threshold, setThreshold] = useState<string>('');
    const [message, setMessage] = useState('');
    const [frequency, setFrequency] = useState<BudgetAlert['frequency']>('daily');
    const [channel, setChannel] = useState<BudgetAlert['channel']>('in-app');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (budgets.length > 0 && !selectedBudgetId) {
            setSelectedBudgetId(budgets[0].id);
        }
    }, [budgets, selectedBudgetId]);

    const handleAddAlert = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (!selectedBudgetId) { setValidationError('Please select a budget.'); return; }
        const parsedThreshold = parseFloat(threshold);
        if (isNaN(parsedThreshold) || parsedThreshold <= 0) { setValidationError('Threshold must be a positive number.'); return; }
        if (triggerType === 'percentage' && (parsedThreshold > 100 || parsedThreshold < 1)) { setValidationError('Percentage threshold must be between 1 and 100.'); return; }
        if (!message.trim()) { setValidationError('Message cannot be empty.'); return; }

        onAddAlert({
            budgetId: selectedBudgetId,
            triggerType,
            threshold: parsedThreshold,
            message: message.trim(),
            isActive: true,
            frequency,
            channel
        });
        // Reset form
        setThreshold('');
        setMessage('');
        setTriggerType('percentage');
        setFrequency('daily');
        setChannel('in-app');
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Budget Alert Settings</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <section className="mb-8 p-4 bg-gray-700/30 rounded-lg">
                        <h4 className="text-md font-semibold text-white mb-4">Add New Alert</h4>
                        <form onSubmit={handleAddAlert} className="space-y-4">
                            <div>
                                <label htmlFor="alert-budget" className="block text-sm font-medium text-gray-300">Select Budget</label>
                                <select id="alert-budget" value={selectedBudgetId} onChange={e => setSelectedBudgetId(e.target.value)} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="">Select a budget</option>
                                    {budgets.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="trigger-type" className="block text-sm font-medium text-gray-300">Trigger Type</label>
                                <select id="trigger-type" value={triggerType} onChange={e => setTriggerType(e.target.value as BudgetAlert['triggerType'])} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="percentage">Percentage Used</option>
                                    <option value="amount">Amount Spent</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="threshold" className="block text-sm font-medium text-gray-300">Threshold ({triggerType === 'percentage' ? '%' : '$'})</label>
                                <input type="number" id="threshold" value={threshold} onChange={e => setThreshold(e.target.value)} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" min="0" step="1" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-300">Alert Message</label>
                                <input type="text" id="message" value={message} onChange={e => setMessage(e.target.value)} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500" placeholder="E.g., 'You're almost out of grocery budget!'" />
                            </div>
                            <div>
                                <label htmlFor="frequency" className="block text-sm font-medium text-gray-300">Frequency</label>
                                <select id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as BudgetAlert['frequency'])} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="once">Once</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="channel" className="block text-sm font-medium text-gray-300">Channel</label>
                                <select id="channel" value={channel} onChange={e => setChannel(e.target.value as BudgetAlert['channel'])} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="in-app">In-app Notification</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>
                            {validationError && <p className="text-red-500 text-sm">{validationError}</p>}
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition duration-200">Add Alert</button>
                            </div>
                        </form>
                    </section>

                    <section className="p-4 bg-gray-700/30 rounded-lg">
                        <h4 className="text-md font-semibold text-white mb-4">Existing Alerts</h4>
                        {alerts.length === 0 ? (
                            <p className="text-gray-400 text-center">No alerts configured yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {alerts.map(alert => (
                                    <li key={alert.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-700 rounded-md shadow-sm">
                                        <div className="flex-grow">
                                            <p className="text-white font-medium">
                                                {budgets.find(b => b.id === alert.budgetId)?.name || 'Unknown Budget'}
                                                : <span className="text-sm text-gray-300 italic">"{alert.message}"</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Trigger: {alert.triggerType === 'percentage' ? `${alert.threshold}% used` : `${formatCurrency(alert.threshold)} spent`}
                                                <span className="mx-2">|</span>
                                                Freq: {alert.frequency}
                                                <span className="mx-2">|</span>
                                                Channel: {alert.channel}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                                            <label htmlFor={`alert-toggle-${alert.id}`} className="flex items-center cursor-pointer">
                                                <span className="mr-2 text-gray-400 text-sm">Active</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        id={`alert-toggle-${alert.id}`}
                                                        className="sr-only"
                                                        checked={alert.isActive}
                                                        onChange={() => onUpdateAlert(alert.id, { isActive: !alert.isActive })}
                                                    />
                                                    <div className={`block w-10 h-6 rounded-full ${alert.isActive ? 'bg-cyan-600' : 'bg-gray-600'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${alert.isActive ? 'translate-x-full' : ''}`}></div>
                                                </div>
                                            </label>
                                            <button onClick={() => onDeleteAlert(alert.id)} className="text-red-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-600" aria-label="Delete alert">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export const BudgetTemplateModal: React.FC<{
    onClose: () => void;
    onApplyTemplate: (template: BudgetTemplate) => void;
    existingBudgets: BudgetCategory[];
}> = ({ onClose, onApplyTemplate, existingBudgets }) => {
    const defaultTemplates: BudgetTemplate[] = useMemo(() => [
        {
            id: 'basic-monthly',
            name: 'Basic Monthly Budget',
            description: 'Essential categories for typical monthly spending.',
            categories: [
                { name: 'Housing', defaultLimit: 1500, color: '#f87171' },
                { name: 'Utilities', defaultLimit: 200, color: '#fb923c' },
                { name: 'Groceries', defaultLimit: 400, color: '#facc15' },
                { name: 'Transportation', defaultLimit: 250, color: '#a3e635' },
                { name: 'Dining Out', defaultLimit: 150, color: '#2dd4bf' },
                { name: 'Entertainment', defaultLimit: 100, color: '#38bdf8' },
                { name: 'Personal Care', defaultLimit: 50, color: '#818cf8' },
                { name: 'Savings', defaultLimit: 300, color: '#c084fc' },
            ],
        },
        {
            id: 'family-budget',
            name: 'Family Budget Plan',
            description: 'Expanded categories suitable for families.',
            categories: [
                { name: 'Housing', defaultLimit: 2000, color: '#fca5a5' },
                { name: 'Utilities', defaultLimit: 300, color: '#fdba74' },
                { name: 'Groceries', defaultLimit: 800, color: '#fde047' },
                { name: 'Transportation', defaultLimit: 350, color: '#d9f99d' },
                { name: 'Childcare', defaultLimit: 700, color: '#5eead4' },
                { name: 'Education', defaultLimit: 200, color: '#7dd3fc' },
                { name: 'Healthcare', defaultLimit: 150, color: '#c4b5fd' },
                { name: 'Dining Out', defaultLimit: 200, color: '#e879f9' },
                { name: 'Entertainment', defaultLimit: 150, color: '#f0abfc' },
                { name: 'Savings', defaultLimit: 500, color: '#c084fc' },
            ],
        },
        {
            id: 'student-budget',
            name: 'Student Living Budget',
            description: 'Budget focused on student expenses.',
            categories: [
                { name: 'Rent', defaultLimit: 800, color: '#a78bfa' },
                { name: 'Tuition/Fees', defaultLimit: 500, color: '#8b5cf6' },
                { name: 'Books/Supplies', defaultLimit: 100, color: '#6d28d9' },
                { name: 'Groceries', defaultLimit: 300, color: '#7e22ce' },
                { name: 'Transportation', defaultLimit: 100, color: '#be185d' },
                { name: 'Social', defaultLimit: 150, color: '#db2777' },
                { name: 'Utilities', defaultLimit: 50, color: '#f43f5e' },
            ],
        },
    ], []);

    const [selectedTemplate, setSelectedTemplate] = useState<BudgetTemplate | null>(null);
    const [templatePreview, setTemplatePreview] = useState<BudgetTemplate['categories']>([]);
    const [currentTemplateName, setCurrentTemplateName] = useState(''); // For custom template creation
    const [customCategories, setCustomCategories] = useState<{ name: string; limit: string; tempId: string }[]>([]);
    const [customTemplateError, setCustomTemplateError] = useState('');
    const [viewMode, setViewMode] = useState<'browse' | 'create'>('browse');

    useEffect(() => {
        if (selectedTemplate) {
            setTemplatePreview(selectedTemplate.categories);
        } else {
            setTemplatePreview([]);
        }
    }, [selectedTemplate]);

    const handleSelectTemplate = (template: BudgetTemplate) => {
        setSelectedTemplate(template);
    };

    const handleApply = () => {
        if (selectedTemplate) {
            onApplyTemplate(selectedTemplate);
            onClose();
        }
    };

    const handleAddCustomCategory = () => {
        setCustomCategories(prev => [...prev, { name: '', limit: '', tempId: uuidv4() }]);
    };

    const handleUpdateCustomCategory = (tempId: string, field: 'name' | 'limit', value: string) => {
        setCustomCategories(prev =>
            prev.map(cat => (cat.tempId === tempId ? { ...cat, [field]: value } : cat))
        );
    };

    const handleRemoveCustomCategory = (tempId: string) => {
        setCustomCategories(prev => prev.filter(cat => cat.tempId !== tempId));
    };

    const handleSaveCustomTemplate = () => {
        setCustomTemplateError('');
        if (!currentTemplateName.trim()) {
            setCustomTemplateError('Template name is required.');
            return;
        }
        if (customCategories.length === 0) {
            setCustomTemplateError('At least one category is required for a custom template.');
            return;
        }

        const newCategories = customCategories.map(cat => {
            const limit = parseFloat(cat.limit);
            if (!cat.name.trim()) {
                setCustomTemplateError(`Category name cannot be empty for row ${cat.tempId}.`);
                return null;
            }
            if (isNaN(limit) || limit <= 0) {
                setCustomTemplateError(`Invalid limit for category '${cat.name}'.`);
                return null;
            }
            return { name: cat.name.trim(), defaultLimit: limit, color: getRandomColor() };
        });

        if (newCategories.some(cat => cat === null)) {
            return; // Stop if there's any validation error
        }

        const newTemplate: BudgetTemplate = {
            id: uuidv4(),
            name: currentTemplateName.trim(),
            description: `User-defined custom template: ${currentTemplateName.trim()}`,
            categories: newCategories as BudgetTemplate['categories'],
        };
        // For a real app, you'd save this to a database and then potentially add it to the list of selectable templates.
        // For now, we'll just apply it directly.
        onApplyTemplate(newTemplate);
        onClose();
    };

    const renderTemplatePreview = (categories: BudgetTemplate['categories']) => {
        const data = categories.map(cat => ({
            name: cat.name,
            value: cat.defaultLimit,
            fill: cat.color,
        }));

        const totalLimit = categories.reduce((sum, cat) => sum + cat.defaultLimit, 0);

        return (
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            animationDuration={300}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 w-full max-h-40 overflow-y-auto pr-2">
                    <h5 className="text-md font-semibold text-white mb-2">Categories:</h5>
                    <ul className="space-y-1 text-sm text-gray-300">
                        {categories.map((cat, index) => (
                            <li key={index} className="flex justify-between items-center">
                                <span className="flex items-center">
                                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></span>
                                    {cat.name}
                                </span>
                                <span className="font-mono">{formatCurrency(cat.defaultLimit)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-white text-md">
                        <span>Total:</span>
                        <span>{formatCurrency(totalLimit)}</span>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Budget Templates</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="mb-4 flex space-x-4 border-b border-gray-700 pb-4">
                        <button
                            onClick={() => setViewMode('browse')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'browse' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Browse Templates
                        </button>
                        <button
                            onClick={() => setViewMode('create')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === 'create' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            Create Custom Template
                        </button>
                    </div>

                    {viewMode === 'browse' ? (
                        <>
                            <p className="text-gray-300 mb-4">Choose from pre-defined budget structures to quickly set up your categories.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {defaultTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition duration-200 ${selectedTemplate?.id === template.id ? 'border-cyan-500 bg-cyan-900/30' : 'border-gray-700 bg-gray-700/30 hover:bg-gray-700/50'}`}
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        <h4 className="font-semibold text-white text-lg">{template.name}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {template.categories.slice(0, 5).map((cat, i) => (
                                                <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-600 text-gray-200">
                                                    {cat.name}
                                                </span>
                                            ))}
                                            {template.categories.length > 5 && (
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-600 text-gray-200">
                                                    +{template.categories.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedTemplate && (
                                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                                    <h4 className="text-lg font-semibold text-white mb-3">Preview: {selectedTemplate.name}</h4>
                                    {renderTemplatePreview(selectedTemplate.categories)}
                                    <div className="mt-4 border-t border-gray-600 pt-4 text-sm text-gray-400">
                                        <p className="mb-2">
                                            Applying this template will add the listed categories to your budgets.
                                            Existing categories with the same name will be skipped.
                                        </p>
                                        <p className="font-medium text-red-400">
                                            Note: This will not remove existing budgets. Please review before confirming.
                                        </p>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition duration-200">Cancel</button>
                                        <button type="button" onClick={handleApply} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition duration-200">Apply Template</button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-300">Build your own budget template from scratch.</p>
                            <div>
                                <label htmlFor="custom-template-name" className="block text-sm font-medium text-gray-300">Template Name</label>
                                <input
                                    type="text"
                                    id="custom-template-name"
                                    value={currentTemplateName}
                                    onChange={e => setCurrentTemplateName(e.target.value)}
                                    className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                                    placeholder="e.g., 'My Personal Monthly'"
                                />
                            </div>
                            <h4 className="text-md font-semibold text-white mt-4">Categories:</h4>
                            <div className="space-y-3">
                                {customCategories.map((cat, index) => (
                                    <div key={cat.tempId} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={cat.name}
                                            onChange={e => handleUpdateCustomCategory(cat.tempId, 'name', e.target.value)}
                                            placeholder="Category Name"
                                            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 text-sm"
                                        />
                                        <input
                                            type="number"
                                            value={cat.limit}
                                            onChange={e => handleUpdateCustomCategory(cat.tempId, 'limit', e.target.value)}
                                            placeholder="Limit"
                                            className="w-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 text-sm"
                                            min="0.01" step="0.01"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCustomCategory(cat.tempId)}
                                            className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-gray-700"
                                            aria-label="Remove category"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddCustomCategory}
                                    className="w-full py-2 border border-dashed border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700/50 transition duration-200 flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add Category
                                </button>
                            </div>
                            {customTemplateError && <p className="text-red-500 text-sm mt-4">{customTemplateError}</p>}
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition duration-200">Cancel</button>
                                <button type="button" onClick={handleSaveCustomTemplate} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition duration-200">Save & Apply Custom Template</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ReportGeneratorModal: React.FC<{
    budgets: BudgetCategory[];
    transactions: Transaction[];
    historicalSnapshots: HistoricalBudgetSnapshot[];
    onClose: () => void;
}> = ({ budgets, transactions, historicalSnapshots, onClose }) => {
    const [reportType, setReportType] = useState<'summary' | 'detailed-spending' | 'budget-performance'>('summary');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [generatedReport, setGeneratedReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Set default dates to last month
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(lastMonth.toISOString().split('T')[0]);
        setEndDate(endOfLastMonth.toISOString().split('T')[0]);
    }, []);

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
        );
    };

    const generateReportContent = useCallback(() => {
        let content = `## Budget Report: ${reportType.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}\n`;
        content += `**Period:** ${startDate} to ${endDate}\n\n`;

        const filteredTransactions = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return txDate >= start && txDate <= end;
        });

        const filteredBudgets = budgets.filter(b => selectedCategories.length === 0 || selectedCategories.includes(b.id));

        if (reportType === 'summary') {
            let totalSpent = 0;
            let totalLimit = 0;
            content += "### Overall Budget Summary\n";
            content += "| Category | Limit | Spent | Remaining | Status |\n";
            content += "|----------|-------|-------|-----------|--------|\n";
            filteredBudgets.forEach(budget => {
                const spent = calculateSpentForBudget(budget.name, filteredTransactions);
                const remaining = budget.limit - spent;
                const status = spent > budget.limit ? 'Over budget' : (remaining <= budget.limit * 0.1 ? 'Nearing limit' : 'On track');
                content += `| ${budget.name} | ${formatCurrency(budget.limit)} | ${formatCurrency(spent)} | ${formatCurrency(remaining)} | ${status} |\n`;
                totalSpent += spent;
                totalLimit += budget.limit;
            });
            content += `| **Total** | **${formatCurrency(totalLimit)}** | **${formatCurrency(totalSpent)}** | **${formatCurrency(totalLimit - totalSpent)}** | |\n\n`;

            content += "### Top 5 Spending Categories\n";
            const spendingByCategory = filteredBudgets.map(b => ({
                name: b.name,
                spent: calculateSpentForBudget(b.name, filteredTransactions)
            })).sort((a, b) => b.spent - a.spent).slice(0, 5);

            if (spendingByCategory.length > 0) {
                content += "| Category | Spent |\n";
                content += "|----------|-------|\n";
                spendingByCategory.forEach(s => content += `| ${s.name} | ${formatCurrency(s.spent)} |\n`);
            } else {
                content += "No spending data for the period.\n";
            }

        } else if (reportType === 'detailed-spending') {
            content += "### Detailed Transactions\n";
            content += "| Date | Description | Category | Amount |\n";
            content += "|------|-------------|----------|--------|\n";
            filteredTransactions.filter(tx => selectedCategories.length === 0 || filteredBudgets.some(b => b.name.toLowerCase() === tx.category.toLowerCase()))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .forEach(tx => {
                    content += `| ${tx.date} | ${tx.description} | ${tx.category} | ${formatCurrency(tx.amount)} |\n`;
                });
            if (filteredTransactions.length === 0) {
                content += "No transactions found for the selected period and categories.\n";
            }
        } else if (reportType === 'budget-performance') {
            content += "### Budget Performance Over Time\n";
            content += "This section typically includes charts. For a text report, we'll summarize.\n\n";

            const performanceData: { monthYear: string; [key: string]: number }[] = [];
            const processedMonths: Set<string> = new Set();

            // Filter snapshots for the selected period and categories
            const filteredSnapshots = historicalSnapshots.filter(snapshot => {
                const snapDate = new Date(snapshot.monthYear + '-01'); // Treat as first of month
                const start = new Date(startDate);
                const end = new Date(endDate);
                return snapDate >= new Date(start.getFullYear(), start.getMonth(), 1) && snapDate <= new Date(end.getFullYear(), end.getMonth(), 1) && (selectedCategories.length === 0 || selectedCategories.includes(snapshot.budgetId));
            });

            filteredSnapshots.forEach(snapshot => {
                if (!processedMonths.has(snapshot.monthYear)) {
                    performanceData.push({ monthYear: snapshot.monthYear });
                    processedMonths.add(snapshot.monthYear);
                }
                const monthEntry = performanceData.find(entry => entry.monthYear === snapshot.monthYear);
                if (monthEntry) {
                    const budget = budgets.find(b => b.id === snapshot.budgetId);
                    if (budget) {
                        monthEntry[`${budget.name} Spent`] = (monthEntry[`${budget.name} Spent`] || 0) + snapshot.spent;
                        monthEntry[`${budget.name} Limit`] = (monthEntry[`${budget.name} Limit`] || 0) + snapshot.limit;
                    }
                }
            });

            if (performanceData.length > 0) {
                content += "| Month | Total Spent | Total Limit | Utilization |\n";
                content += "|-------|-------------|-------------|-------------|\n";
                performanceData.sort((a,b) => new Date(a.monthYear).getTime() - new Date(b.monthYear).getTime()).forEach(entry => {
                    let monthTotalSpent = 0;
                    let monthTotalLimit = 0;
                    Object.keys(entry).forEach(key => {
                        if (key.endsWith(' Spent')) monthTotalSpent += entry[key];
                        if (key.endsWith(' Limit')) monthTotalLimit += entry[key];
                    });
                    const utilization = monthTotalLimit > 0 ? ((monthTotalSpent / monthTotalLimit) * 100).toFixed(1) + '%' : 'N/A';
                    content += `| ${entry.monthYear} | ${formatCurrency(monthTotalSpent)} | ${formatCurrency(monthTotalLimit)} | ${utilization} |\n`;
                });
            } else {
                content += "No historical budget performance data for the selected period.\n";
            }
        }

        setGeneratedReport(content);
        setIsLoading(false);
    }, [reportType, startDate, endDate, transactions, budgets, selectedCategories, historicalSnapshots]);

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => { // Simulate async generation
            generateReportContent();
        }, 1000);
    };

    const downloadReport = (format: 'md' | 'csv') => {
        if (!generatedReport) return;

        let filename = `budget_report_${startDate}_to_${endDate}`;
        let data = generatedReport;
        let mimeType = 'text/markdown';

        if (format === 'csv') {
            // This is a simplified markdown to CSV conversion.
            // A real-world scenario would require robust parsing or generating CSV directly.
            const lines = generatedReport.split('\n');
            const csvLines: string[] = [];
            let headerParsed = false;

            for (const line of lines) {
                if (line.trim().startsWith('|') && line.includes('--') && !headerParsed) { // Header separator
                    const headerLine = lines[lines.indexOf(line) - 1];
                    csvLines.push(headerLine.split('|').map(h => h.trim()).filter(h => h).join(','));
                    headerParsed = true;
                    continue;
                }
                if (line.trim().startsWith('|') && headerParsed) {
                    csvLines.push(line.split('|').map(h => h.trim()).filter(h => h).join(','));
                }
            }
            data = csvLines.join('\n');
            mimeType = 'text/csv';
            filename += '.csv';
        } else {
            filename += '.md';
        }


        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Generate Budget Report</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto flex flex-col lg:flex-row gap-6">
                    {/* Report Configuration Panel */}
                    <div className="lg:w-1/3 space-y-5 bg-gray-700/30 p-4 rounded-lg flex-shrink-0">
                        <h4 className="text-md font-semibold text-white">Report Options</h4>
                        <form onSubmit={handleGenerateReport} className="space-y-4">
                            <div>
                                <label htmlFor="report-type" className="block text-sm font-medium text-gray-300">Report Type</label>
                                <select id="report-type" value={reportType} onChange={e => { setReportType(e.target.value as any); setGeneratedReport(null); }} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="summary">Summary Report</option>
                                    <option value="detailed-spending">Detailed Spending</option>
                                    <option value="budget-performance">Budget Performance</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="start-date" className="block text-sm font-medium text-gray-300">Start Date</label>
                                <input type="date" id="start-date" value={startDate} onChange={e => { setStartDate(e.target.value); setGeneratedReport(null); }} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" required />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium text-gray-300">End Date</label>
                                <input type="date" id="end-date" value={endDate} onChange={e => { setEndDate(e.target.value); setGeneratedReport(null); }} className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white focus:ring-cyan-500 focus:border-cyan-500" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Select Categories (Optional)</label>
                                <div className="max-h-32 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-gray-700/50 space-y-1">
                                    {budgets.map(budget => (
                                        <div key={budget.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`report-cat-${budget.id}`}
                                                checked={selectedCategories.includes(budget.id)}
                                                onChange={() => handleCategoryToggle(budget.id)}
                                                className="h-4 w-4 text-cyan-600 border-gray-600 rounded focus:ring-cyan-500 bg-gray-700"
                                            />
                                            <label htmlFor={`report-cat-${budget.id}`} className="ml-2 text-sm text-gray-300">{budget.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition duration-200" disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Report'}
                            </button>
                        </form>
                    </div>

                    {/* Report Preview */}
                    <div className="lg:w-2/3 space-y-4 flex-grow">
                        <h4 className="text-md font-semibold text-white">Report Preview</h4>
                        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 min-h-[200px] max-h-[500px] overflow-y-auto">
                            {isLoading ? (
                                <p className="text-gray-400 text-center">Generating report, please wait...</p>
                            ) : generatedReport ? (
                                <div ref={reportRef} className="prose prose-invert text-gray-300 max-w-none">
                                    {generatedReport.split('\n').map((line, index) => {
                                        if (line.startsWith('##')) return <h2 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2).trim()}</h2>;
                                        if (line.startsWith('###')) return <h3 key={index} className="text-xl font-semibold mt-3 mb-1">{line.substring(3).trim()}</h3>;
                                        if (line.startsWith('|') && line.includes('---')) return <hr key={index} className="border-gray-600 my-2" />;
                                        if (line.startsWith('|')) {
                                            const cells = line.split('|').map(c => c.trim()).filter(c => c);
                                            return <div key={index} className="grid grid-cols-4 gap-2 text-sm py-1 border-b border-gray-700 last:border-b-0">{cells.map((cell, i) => <span key={i} className="truncate">{cell}</span>)}</div>;
                                        }
                                        return <p key={index} className="mb-1 text-gray-300">{line}</p>;
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center">Configure report options and click "Generate Report" to see a preview.</p>
                            )}
                        </div>
                        {generatedReport && (
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => downloadReport('md')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition duration-200">Download Markdown</button>
                                <button onClick={() => downloadReport('csv')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition duration-200">Download CSV</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// AI INTEGRATION
// ================================================================================================

export const AIConsejero: React.FC<{ budgets: BudgetCategory[]; transactions: Transaction[]; goals: FinancialGoal[] }> = ({ budgets, transactions, goals }) => {
    const chatRef = useRef<Chat | null>(null);
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [aiMode, setAiMode] = useState<'insight' | 'optimizer' | 'category-suggestions'>('insight');
    const [optimizationResult, setOptimizationResult] = useState<string | null>(null);
    const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
    const [uncategorizedTransactions, setUncategorizedTransactions] = useState<Transaction[]>([]);

    const existingCategories = useMemo(() => new Set(budgets.map(b => b.name.toLowerCase())), [budgets]);

    useEffect(() => {
        const uncategorized = transactions.filter(tx => !existingCategories.has(tx.category.toLowerCase()) && tx.type === 'expense');
        setUncategorizedTransactions(uncategorized);
    }, [transactions, existingCategories]);

    const generateInsight = useCallback(async () => {
        setIsLoading(true);
        setAiResponse('');
        setOptimizationResult(null);
        setCategorySuggestions([]);

        const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit}`).join(', ');
        const goalSummary = goals.length > 0 ? `Goals: ${goals.map(g => `${g.name} (${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)})`).join('; ')}.` : 'No financial goals set.';
        const prompt = `Based on this budget data (${budgetSummary}) and goals (${goalSummary}), provide one key, actionable insight or piece of advice for the user. Be concise, encouraging, and consider their financial goals. Focus on actionable steps they can take next.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-1.5-flash', // Upgraded model for better reasoning
                config: { systemInstruction: "You are Quantum, a specialized financial advisor AI focused on budget analysis. Your tone is helpful, insightful, and proactive. Provide concrete, concise advice. Always greet the user at the beginning of your response." }
            });

            const resultStream = await chatRef.current.sendMessageStream({ message: prompt });

            let text = '';
            for await (const chunk of resultStream) {
                text += chunk.text;
                setAiResponse(text);
            }
        } catch (error) {
            console.error("AI Consejero Insight Error:", error);
            setAiResponse("I'm having trouble analyzing your budgets right now for insights.");
        } finally {
            setIsLoading(false);
        }
    }, [budgets, goals]);

    const generateOptimization = useCallback(async () => {
        setIsLoading(true);
        setAiResponse('');
        setOptimizationResult(null);
        setCategorySuggestions([]);

        const budgetData = budgets.map(b => ({
            name: b.name,
            spent: b.spent,
            limit: b.limit,
            id: b.id
        }));

        const prompt = `Given the following budgets (name, spent, limit): ${JSON.stringify(budgetData)}.
        Suggest an optimal reallocation of budget limits to better align with spending patterns and financial efficiency.
        Provide concrete suggestions for adjustments to individual budget limits, explaining the rationale.
        If a budget is consistently overspent, suggest increasing it, possibly by decreasing another underspent budget.
        If a budget is consistently underspent, suggest decreasing it and reallocating the funds.
        The goal is to provide a balanced budget that reflects reality while encouraging savings.
        Output your suggestions as a concise list of "Category: Action (e.g., Increase by $X / Decrease by $Y)" followed by a brief justification.
        Start with "Hello! Based on your current spending, here are some optimization ideas:"`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-1.5-flash',
                config: { systemInstruction: "You are an AI budget optimizer. Your goal is to suggest smart reallocations based on user data. Be precise and provide clear adjustments." }
            });

            const resultStream = await chatRef.current.sendMessageStream({ message: prompt });
            let text = '';
            for await (const chunk of resultStream) {
                text += chunk.text;
                setOptimizationResult(text);
            }
        } catch (error) {
            console.error("AI Consejero Optimization Error:", error);
            setOptimizationResult("Failed to generate optimization suggestions.");
        } finally {
            setIsLoading(false);
        }
    }, [budgets]);

    const suggestCategories = useCallback(async () => {
        setIsLoading(true);
        setAiResponse('');
        setOptimizationResult(null);
        setCategorySuggestions([]);

        if (uncategorizedTransactions.length === 0) {
            setCategorySuggestions(["No uncategorized transactions to analyze."]);
            setIsLoading(false);
            return;
        }

        const transactionDescriptions = uncategorizedTransactions.map(tx => tx.description).join('; ');
        const existingCatNames = budgets.map(b => b.name).join(', ');

        const prompt = `I have several uncategorized expenses with descriptions like: "${transactionDescriptions}".
        My existing budget categories are: "${existingCatNames}".
        Based on the uncategorized descriptions, suggest 3-5 *new* budget categories that I should consider adding.
        Ensure they are distinct from existing ones and cover the general themes of the descriptions provided.
        Format your response as a comma-separated list of suggested category names, e.g., "Dining, Hobbies, Subscriptions". Do NOT include any other text.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            chatRef.current = ai.chats.create({
                model: 'gemini-1.5-flash',
                config: { systemInstruction: "You are an AI assistant for budgeting. Your task is to suggest new, relevant budget categories based on transaction descriptions. Be precise and only output comma-separated category names." }
            });

            const result = await chatRef.current.sendMessage({ message: prompt });
            const text = result.response.text();
            const suggestions = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
            setCategorySuggestions(suggestions);
        } catch (error) {
            console.error("AI Consejero Category Suggestion Error:", error);
            setCategorySuggestions(["Failed to generate category suggestions."]);
        } finally {
            setIsLoading(false);
        }
    }, [uncategorizedTransactions, budgets]);

    useEffect(() => {
        if (aiMode === 'insight') {
            generateInsight();
        } else if (aiMode === 'optimizer') {
            generateOptimization();
        } else if (aiMode === 'category-suggestions') {
            suggestCategories();
        }
    }, [aiMode, generateInsight, generateOptimization, suggestCategories]); // Re-run if mode changes

    return (
        <Card title="AI Sage Insights & Tools" className="relative">
            <div className="absolute top-4 right-4 flex space-x-2">
                <button
                    onClick={() => setAiMode('insight')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${aiMode === 'insight' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    title="Get a general insight"
                >
                    Insight
                </button>
                <button
                    onClick={() => setAiMode('optimizer')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${aiMode === 'optimizer' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    title="Optimize budget limits"
                >
                    Optimizer
                </button>
                <button
                    onClick={() => setAiMode('category-suggestions')}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${aiMode === 'category-suggestions' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    title="Suggest new categories for uncategorized transactions"
                >
                    Suggestions
                </button>
            </div>
            <div className="p-4 min-h-[8rem]">
                {isLoading && (aiResponse === '' && optimizationResult === null && categorySuggestions.length === 0) ? (
                    <div className="flex items-center justify-center h-full">
                        <svg className="animate-spin h-5 w-5 mr-3 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-400">The AI Sage is thinking...</p>
                    </div>
                ) : (
                    <>
                        {aiMode === 'insight' && aiResponse && (
                            <p className="text-gray-300 italic">"{aiResponse}"</p>
                        )}
                        {aiMode === 'optimizer' && optimizationResult && (
                            <div className="text-gray-300 space-y-2">
                                <h4 className="font-semibold text-white">Budget Optimization Suggestions:</h4>
                                <pre className="bg-gray-900 p-3 rounded-md text-sm whitespace-pre-wrap overflow-x-auto">{optimizationResult}</pre>
                                <p className="text-xs text-gray-500 mt-2">These are AI-generated suggestions. Review carefully before making changes.</p>
                            </div>
                        )}
                        {aiMode === 'category-suggestions' && (
                            <div>
                                <h4 className="font-semibold text-white mb-2">Suggested Categories for Uncategorized Transactions:</h4>
                                {categorySuggestions.length > 0 && uncategorizedTransactions.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-gray-300">Based on descriptions like: *"{uncategorizedTransactions.slice(0, 3).map(tx => tx.description).join(', ')}{uncategorizedTransactions.length > 3 ? '...' : ''}"*</p>
                                        <ul className="flex flex-wrap gap-2">
                                            {categorySuggestions.map((suggestion, index) => (
                                                <li key={index} className="bg-blue-600/50 text-white px-3 py-1 rounded-full text-sm">
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-gray-500 mt-2">Consider adding these to categorize your spending more effectively.</p>
                                    </div>
                                ) : uncategorizedTransactions.length === 0 ? (
                                    <p className="text-gray-400">Great job! No uncategorized transactions to analyze for new categories.</p>
                                ) : (
                                    <p className="text-gray-400">Failed to generate category suggestions or no suggestions available.</p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

// ================================================================================================
// NEW ANALYTICS & VISUALIZATION COMPONENTS
// ================================================================================================

export const SpendingTrendsChart: React.FC<{
    historicalSnapshots: HistoricalBudgetSnapshot[];
    budgets: BudgetCategory[];
}> = ({ historicalSnapshots, budgets }) => {
    const [selectedBudgetId, setSelectedBudgetId] = useState<string>('all');

    const chartData = useMemo(() => {
        const dataMap = new Map<string, { name: string; totalSpent: number; totalLimit: number }>();

        historicalSnapshots.forEach(snap => {
            const budget = budgets.find(b => b.id === snap.budgetId);
            if (!budget) return; // Skip if budget not found

            if (selectedBudgetId === 'all' || selectedBudgetId === budget.id) {
                if (!dataMap.has(snap.monthYear)) {
                    dataMap.set(snap.monthYear, { name: snap.monthYear, totalSpent: 0, totalLimit: 0 });
                }
                const entry = dataMap.get(snap.monthYear)!;
                entry.totalSpent += snap.spent;
                entry.totalLimit += snap.limit;
            }
        });

        // Convert Map to array and sort by monthYear
        return Array.from(dataMap.values()).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [historicalSnapshots, budgets, selectedBudgetId]);

    return (
        <Card title="Spending Trends (Last 12 Months)">
            <div className="p-4">
                <div className="mb-4 flex items-center gap-2">
                    <label htmlFor="budget-filter-trend" className="text-gray-300 text-sm">Filter by Budget:</label>
                    <select
                        id="budget-filter-trend"
                        value={selectedBudgetId}
                        onChange={(e) => setSelectedBudgetId(e.target.value)}
                        className="bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        <option value="all">All Budgets</option>
                        {budgets.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="totalSpent" stroke="#ef4444" name="Total Spent" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="totalLimit" stroke="#38bdf8" name="Total Limit" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
                {chartData.length === 0 && (
                    <p className="text-gray-400 text-center mt-4">No historical data available for the selected budget(s).</p>
                )}
            </div>
        </Card>
    );
};

export const FinancialGoalsCard: React.FC<{
    goals: FinancialGoal[];
    onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'status' | 'currentAmount' | 'lastUpdated'>) => void;
    onUpdateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
    onDeleteGoal: (id: string) => void;
    budgetCategories: BudgetCategory[];
    transactions: Transaction[];
}> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, budgetCategories, transactions }) => {
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [selectedGoalForEdit, setSelectedGoalForEdit] = useState<FinancialGoal | null>(null);

    // Calculate current amount for each goal based on linked budgets and actual spending
    const goalsWithCurrentAmounts = useMemo(() => {
        return goals.map(goal => {
            let currentAmount = 0;
            // For simplicity, we'll assume contributions come from "savings" or "extra" budget,
            // or directly added to goal. Here, we'll just use a dummy initial current amount if not set.
            // A more complex system would track direct contributions.
            // For now, let's just make sure goal progress is somewhat dynamic
            // Let's pretend linked budgets contribute directly to goal or are tracked separately.
            // For a 'real world' feel, we'll iterate through transactions that match a linked budget
            // or are specifically 'income' transactions marked for 'saving towards goal'.
            // For this simulation, let's keep `currentAmount` as user input, or a simple increment
            // based on generic 'savings' budget or specific 'goal contribution' transactions.

            // To avoid overly complex logic without a full backend, we'll just update based on the 'savings' budget
            // or a manual 'contribution' transaction type. Since we don't have that,
            // let's just update `currentAmount` from context or keep it as user-managed for now,
            // and assume data context provides updated goal data.
            // For display, if the goal's current amount is not changing from context, we can simulate progress.
            // A simple simulation: if a 'Savings' budget is linked, and money is 'saved' in that budget,
            // assume it contributes to the goal.

            const linkedBudgetSpending = transactions.filter(tx =>
                goal.linkedBudgets.includes(budgetCategories.find(b => b.name.toLowerCase() === tx.category.toLowerCase())?.id || '')
                && tx.type === 'expense' // this is counter-intuitive for saving, but represents funds 'allocated' to a goal category that are then 'spent' on the goal itself (e.g. downpayment)
                // or we could assume `currentAmount` is updated via 'income' transactions tagged for goals.
            ).reduce((sum, tx) => sum + tx.amount, 0);

            // This is a simplified example. In a real app, 'currentAmount' would be updated directly
            // from deposits or explicit goal contributions, not just spending in linked categories.
            // We'll leave `currentAmount` as a direct property of `FinancialGoal` for now and assume it's updated.
            return {
                ...goal,
                currentAmount: Math.min(goal.currentAmount + linkedBudgetSpending / 10, goal.targetAmount) // A small simulated increase
            };
        });
    }, [goals, transactions, budgetCategories]);

    const handleOpenEditModal = (goal: FinancialGoal) => {
        setSelectedGoalForEdit(goal);
        setIsGoalModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsGoalModalOpen(false);
        setSelectedGoalForEdit(null);
    };

    const GoalItem: React.FC<{ goal: FinancialGoal }> = ({ goal }) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - goal.currentAmount;
        const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        let progressBarColor = 'bg-cyan-600';
        if (progress >= 100) progressBarColor = 'bg-green-600';
        else if (daysLeft < 30 && progress < 50) progressBarColor = 'bg-red-600';

        return (
            <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col space-y-3 border border-gray-600">
                <div className="flex justify-between items-center">
                    <h5 className="font-semibold text-white text-lg">{goal.name}</h5>
                    <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            goal.priority === 'high' ? 'bg-red-700 text-white' :
                            goal.priority === 'medium' ? 'bg-yellow-700 text-white' :
                            'bg-gray-600 text-white'
                        }`}>{goal.priority}</span>
                        <button onClick={() => handleOpenEditModal(goal)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-600" aria-label="Edit goal">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => onDeleteGoal(goal.id)} className="text-red-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-600" aria-label="Delete goal">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                </div>
                <p className="text-gray-300 text-sm">{goal.notes}</p>
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Target: <span className="text-white font-medium">{formatCurrency(goal.targetAmount)}</span></span>
                    <span>Saved: <span className="text-white font-medium">{formatCurrency(goal.currentAmount)}</span></span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>{progress.toFixed(1)}% complete</span>
                    <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Target date passed'}</span>
                </div>
                {goal.linkedBudgets.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                        <span className="font-medium">Linked:</span>
                        {goal.linkedBudgets.map(budgetId => {
                            const budget = budgetCategories.find(b => b.id === budgetId);
                            return budget ? <span key={budgetId} className="px-2 py-1 bg-gray-700 rounded-md">{budget.name}</span> : null;
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card title="Financial Goals">
            <div className="p-4 space-y-4">
                <div className="flex justify-end">
                    <button onClick={() => { setIsGoalModalOpen(true); setSelectedGoalForEdit(null); }} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Goal
                    </button>
                </div>

                {goalsWithCurrentAmounts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No financial goals set yet. Start by adding one!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {goalsWithCurrentAmounts.map(goal => (
                            <GoalItem key={goal.id} goal={goal} />
                        ))}
                    </div>
                )}
            </div>
            {isGoalModalOpen && (
                <NewFinancialGoalModal
                    onClose={handleCloseModal}
                    onAddGoal={(newGoal) => {
                        if (selectedGoalForEdit) {
                            onUpdateGoal(selectedGoalForEdit.id, newGoal); // Reuse add for update for simplicity here
                        } else {
                            onAddGoal(newGoal);
                        }
                    }}
                    budgetCategories={budgetCategories}
                />
            )}
            {/* A dedicated EditGoalModal would be better, but for lines, reusing the add one works with some state setup */}
            {selectedGoalForEdit && isGoalModalOpen && (
                 <NewFinancialGoalModal // Reusing for edit, passing initial values
                    onClose={handleCloseModal}
                    budgetCategories={budgetCategories}
                    onAddGoal={(updates) => onUpdateGoal(selectedGoalForEdit.id, updates)}
                />
            )}
        </Card>
    );
};

export const RecentAlertsCard: React.FC<{ alerts: BudgetAlert[] }> = ({ alerts }) => {
    const activeAlerts = useMemo(() => alerts.filter(a => a.isActive), [alerts]);
    return (
        <Card title="Recent Budget Alerts">
            <div className="p-4 min-h-[10rem]">
                {activeAlerts.length === 0 ? (
                    <p className="text-gray-400 text-center">No active alerts configured. You're all clear!</p>
                ) : (
                    <ul className="space-y-3">
                        {activeAlerts.slice(0, 5).map(alert => {
                            const triggerInfo = alert.triggerType === 'percentage'
                                ? `at ${alert.threshold}% used`
                                : `at ${formatCurrency(alert.threshold)} spent`;
                            return (
                                <li key={alert.id} className="p-3 bg-gray-700/50 rounded-md flex justify-between items-center text-sm">
                                    <div>
                                        <p className="text-white font-medium">{alert.message}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Trigger: {triggerInfo} ({alert.frequency} alerts)
                                        </p>
                                    </div>
                                    <span className="text-cyan-400 text-xs px-2 py-1 rounded-full bg-cyan-900/50">Active</span>
                                </li>
                            );
                        })}
                        {activeAlerts.length > 5 && (
                            <p className="text-gray-400 text-center text-sm mt-4">
                                And {activeAlerts.length - 5} more active alerts...
                            </p>
                        )}
                    </ul>
                )}
            </div>
        </Card>
    );
};


// ================================================================================================
// MAIN BudgetsView COMPONENT
// ================================================================================================

export const BudgetsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BudgetsView must be within a DataProvider.");

    // Existing context items
    const { budgets, transactions, addBudget, updateBudget, deleteBudget } = context;

    // --- NEW STATE MANAGEMENT (Simulating DataContext additions) ---
    const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(() => [
        {
            id: uuidv4(), name: 'Vacation Fund', targetAmount: 2000, currentAmount: 850,
            targetDate: '2024-08-01', priority: 'high', linkedBudgets: [], status: 'active', createdAt: new Date().toISOString(), notes: 'Summer trip to the beach!'
        },
        {
            id: uuidv4(), name: 'Emergency Savings', targetAmount: 5000, currentAmount: 3100,
            targetDate: '2025-01-01', priority: 'high', linkedBudgets: [], status: 'active', createdAt: new Date().toISOString(), notes: '6 months of living expenses.'
        },
        {
            id: uuidv4(), name: 'New Gadget', targetAmount: 500, currentAmount: 120,
            targetDate: '2024-07-15', priority: 'low', linkedBudgets: [], status: 'active', createdAt: new Date().toISOString(), notes: 'Latest tech toy.'
        },
    ]);

    const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>(() => [
        { id: uuidv4(), budgetId: budgets[0]?.id || '', triggerType: 'percentage', threshold: 80, message: 'You are nearing your grocery budget!', isActive: true, frequency: 'daily', channel: 'in-app' },
        { id: uuidv4(), budgetId: budgets[1]?.id || '', triggerType: 'amount', threshold: 450, message: 'High spending in transportation.', isActive: true, frequency: 'weekly', channel: 'email' },
    ].filter(a => a.budgetId)); // Filter out alerts with invalid budget IDs if budgets are not loaded yet

    const [budgetTemplates] = useState<BudgetTemplate[]>([]); // This would typically be from backend/global context

    const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]); // For future planning

    const [spendingRules, setSpendingRules] = useState<SpendingRule[]>([]); // Advanced spending rules

    const historicalSnapshots = useMemo(() => generateHistoricalBudgetSnapshots(budgets), [budgets]);
    // --- END NEW STATE MANAGEMENT ---

    const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
    const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
    const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<BudgetCategory | null>(null);
    const [budgetToDelete, setBudgetToDelete] = useState<BudgetCategory | null>(null);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [isAlertSettingsModalOpen, setIsAlertSettingsModalOpen] = useState(false);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // --- New CRUD operations for new state ---
    const addFinancialGoal = useCallback((goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'status' | 'currentAmount' | 'lastUpdated'>) => {
        setFinancialGoals(prev => [
            ...prev,
            { ...goal, id: uuidv4(), createdAt: new Date().toISOString(), status: 'active', currentAmount: 0, lastUpdated: new Date().toISOString() }
        ]);
    }, []);

    const updateFinancialGoal = useCallback((id: string, updates: Partial<FinancialGoal>) => {
        setFinancialGoals(prev =>
            prev.map(goal => (goal.id === id ? { ...goal, ...updates, lastUpdated: new Date().toISOString() } : goal))
        );
    }, []);

    const deleteFinancialGoal = useCallback((id: string) => {
        setFinancialGoals(prev => prev.filter(goal => goal.id !== id));
    }, []);

    const addBudgetAlert = useCallback((alert: Omit<BudgetAlert, 'id' | 'lastTriggered'>) => {
        setBudgetAlerts(prev => [...prev, { ...alert, id: uuidv4(), isActive: true }]);
    }, []);

    const updateBudgetAlert = useCallback((id: string, updates: Partial<BudgetAlert>) => {
        setBudgetAlerts(prev =>
            prev.map(alert => (alert.id === id ? { ...alert, ...updates } : alert))
        );
    }, []);

    const deleteBudgetAlert = useCallback((id: string) => {
        setBudgetAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    const handleApplyBudgetTemplate = useCallback((template: BudgetTemplate) => {
        template.categories.forEach(templateCat => {
            const existing = budgets.find(b => b.name.toLowerCase() === templateCat.name.toLowerCase());
            if (!existing) {
                addBudget({
                    name: templateCat.name,
                    limit: templateCat.defaultLimit,
                });
            }
        });
    }, [addBudget, budgets]);

    // Update existing budget (from DataContext)
    const handleUpdateBudget = useCallback((id: string, updates: Partial<BudgetCategory>) => {
        updateBudget(id, updates);
        setIsEditBudgetModalOpen(false);
        setBudgetToEdit(null);
    }, [updateBudget]);

    // Delete existing budget (from DataContext)
    const handleDeleteBudget = useCallback(() => {
        if (budgetToDelete) {
            deleteBudget(budgetToDelete.id);
            setBudgetToDelete(null);
            setIsDeleteConfirmModalOpen(false);
        }
    }, [budgetToDelete, deleteBudget]);


    const historicalSpendingByMonthAndCategory = useMemo(() => {
        const data: { [key: string]: any } = {};
        transactions.forEach(tx => {
            if (tx.type === 'expense') {
                const month = new Date(tx.date).toLocaleString('default', { month: 'short', year: 'numeric' }); // Include year for clarity
                if (!data[month]) data[month] = { name: month };
                data[month][tx.category] = (data[month][tx.category] || 0) + tx.amount;
            }
        });
        // Sort keys by date
        const sortedKeys = Object.keys(data).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            return dateA.getTime() - dateB.getTime();
        });
        return sortedKeys.map(key => data[key]);
    }, [transactions]);

    // Ensure AI alerts are updated if budgets change
    useEffect(() => {
        setBudgetAlerts(prevAlerts => prevAlerts.filter(alert => budgets.some(b => b.id === alert.budgetId)));
        // Potentially update existing alert messages if budget names change
    }, [budgets]);


    return (
        <>
            <div className="space-y-8 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Budgets (Allocatra)</h2>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setIsTemplateModalOpen(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 16l-4 4-4-4" /></svg>
                            Templates
                        </button>
                        <button onClick={() => setIsReportModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Reports
                        </button>
                        <button onClick={() => setIsNewBudgetModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            New Budget
                        </button>
                    </div>
                </div>

                <AIConsejero budgets={budgets} transactions={transactions} goals={financialGoals} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SpendingTrendsChart historicalSnapshots={historicalSnapshots} budgets={budgets} />
                    <Card title="Category Spending Distribution">
                        <div className="p-4">
                            {budgets.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={budgets.map(b => ({ name: b.name, value: b.spent, fill: b.color }))}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            animationDuration={300}
                                        >
                                            {budgets.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]} />
                                        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: '#e2e8f0', fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-400 text-center py-8">No budget data to display spending distribution.</p>
                            )}
                        </div>
                    </Card>
                </div>


                <FinancialGoalsCard
                    goals={financialGoals}
                    onAddGoal={addFinancialGoal}
                    onUpdateGoal={updateFinancialGoal}
                    onDeleteGoal={deleteFinancialGoal}
                    budgetCategories={budgets}
                    transactions={transactions}
                />

                <Card title="Historical Spending by Category (Monthly Overview)">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={historicalSpendingByMonthAndCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#9ca3af" interval={0} angle={-30} textAnchor="end" height={60} />
                            <YAxis stroke="#9ca3af" tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]} />
                            <Legend wrapperStyle={{ color: '#e2e8f0', fontSize: '12px' }} />
                            {budgets.map(b => <Bar key={b.id} dataKey={b.name} stackId="a" fill={b.color} />)}
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <div className="flex justify-between items-center mt-8 mb-4">
                    <h3 className="text-2xl font-bold text-white">Your Active Budgets</h3>
                    <button onClick={() => setIsAlertSettingsModalOpen(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        Alerts
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {budgets.length === 0 ? (
                        <p className="col-span-full text-gray-400 text-center py-8">
                            You haven't created any budgets yet. Click "New Budget" or "Templates" to get started!
                        </p>
                    ) : budgets.map(budget => {
                        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                        let color;
                        if (percentage < 75) color = '#06b6d4'; // cyan
                        else if (percentage < 95) color = '#f59e0b'; // yellow
                        else color = '#ef4444'; // red

                        return (
                            <Card key={budget.id} variant="interactive" className="group relative">
                                <button
                                    className="absolute top-2 right-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-700"
                                    onClick={(e) => { e.stopPropagation(); setBudgetToEdit(budget); setIsEditBudgetModalOpen(true); }}
                                    aria-label={`Edit ${budget.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button
                                    className="absolute top-2 right-10 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-700"
                                    onClick={(e) => { e.stopPropagation(); setBudgetToDelete(budget); setIsDeleteConfirmModalOpen(true); }}
                                    aria-label={`Delete ${budget.name}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <div className="text-center" onClick={() => setSelectedBudget(budget)}>
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
                                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                    </p>
                                    {percentage >= 100 && <span className="text-red-400 text-xs font-medium mt-1 block">Limit Exceeded!</span>}
                                    {percentage >= 90 && percentage < 100 && <span className="text-yellow-400 text-xs font-medium mt-1 block">Nearing Limit!</span>}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <BudgetDetailModal budget={selectedBudget} transactions={transactions} onClose={() => setSelectedBudget(null)} />
            {isNewBudgetModalOpen && <NewBudgetModal onClose={() => setIsNewBudgetModalOpen(false)} onAdd={addBudget} />}
            {isEditBudgetModalOpen && budgetToEdit && (
                <EditBudgetModal
                    budget={budgetToEdit}
                    onClose={() => { setIsEditBudgetModalOpen(false); setBudgetToEdit(null); }}
                    onSave={handleUpdateBudget}
                />
            )}
            {isDeleteConfirmModalOpen && budgetToDelete && (
                <ConfirmDeleteModal
                    budgetName={budgetToDelete.name}
                    onClose={() => { setIsDeleteConfirmModalOpen(false); setBudgetToDelete(null); }}
                    onConfirm={handleDeleteBudget}
                />
            )}
            {isAlertSettingsModalOpen && (
                <BudgetAlertSettingsModal
                    budgets={budgets}
                    alerts={budgetAlerts}
                    onClose={() => setIsAlertSettingsModalOpen(false)}
                    onAddAlert={addBudgetAlert}
                    onUpdateAlert={updateBudgetAlert}
                    onDeleteAlert={deleteBudgetAlert}
                />
            )}
            {isTemplateModalOpen && (
                <BudgetTemplateModal
                    onClose={() => setIsTemplateModalOpen(false)}
                    onApplyTemplate={handleApplyBudgetTemplate}
                    existingBudgets={budgets}
                />
            )}
            {isReportModalOpen && (
                <ReportGeneratorModal
                    budgets={budgets}
                    transactions={transactions}
                    historicalSnapshots={historicalSnapshots}
                    onClose={() => setIsReportModalOpen(false)}
                />
            )}
        </>
    );
};

export default BudgetsView;