import React, { useContext, useState, useCallback } from 'react';
import { DataContext } from '../../context/DataContext';
import type { BudgetCategory, Transaction } from '../../types';
import {
    generateUniqueId,
    BudgetGoal,
    Subscription,
    FinancialChallenge,
    AISageProfile,
    ScenarioResult,
    RecurringBudgetSettings,
} from '../BudgetsView'; // Importing necessary types and utility from BudgetsView

interface AllocatraData {
    budgets: BudgetCategory[];
    transactions: Transaction[];
    goals: BudgetGoal[];
    subscriptions: Subscription[];
    challenges: FinancialChallenge[];
    aiProfile: AISageProfile;
    scenarios: ScenarioResult[];

    addBudget: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'> & { recurringSettings?: RecurringBudgetSettings; linkedGoalId?: string }) => void;
    updateBudget: (id: string, updates: Partial<BudgetCategory>) => void;
    deleteBudget: (id: string) => void;

    addGoal: (goal: Omit<BudgetGoal, 'id' | 'currentAmount' | 'isAchieved' | 'contributions'>) => void;
    updateGoal: (id: string, updates: Partial<BudgetGoal>) => void;

    addSubscription: (sub: Omit<Subscription, 'id'>) => void;
    updateSubscription: (id: string, updates: Partial<Subscription>) => void;
    deleteSubscription: (id: string) => void;

    addChallenge: (challenge: Omit<FinancialChallenge, 'id' | 'currentProgress' | 'isCompleted' | 'progressHistory'>) => void;
    updateChallenge: (id: string, updates: Partial<FinancialChallenge>) => void;

    updateAIProfile: (updates: Partial<AISageProfile>) => void;
    runScenario: (scenario: { name: string; description: string; assumptions: string[] }) => void;
}

export const useAllocatraData = (): AllocatraData => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useAllocatraData must be used within a DataProvider.");
    }

    const { budgets, transactions, addBudget, updateBudget, deleteBudget, addTransaction } = context;

    const [goals, setGoals] = useState<BudgetGoal[]>([
        { id: generateUniqueId(), name: 'Emergency Fund', targetAmount: 5000, currentAmount: 1200, isAchieved: false, priority: 'high', contributions: [{date: '2023-01-15', amount: 200}, {date: '2023-02-01', amount: 300}, {date: '2023-03-01', amount: 700}] },
        { id: generateUniqueId(), name: 'New Laptop', targetAmount: 1500, currentAmount: 800, isAchieved: false, priority: 'medium', targetDate: '2024-12-31', contributions: [{date: '2023-04-10', amount: 800}] },
        { id: generateUniqueId(), name: 'Dream Vacation', targetAmount: 10000, currentAmount: 0, isAchieved: false, priority: 'low', targetDate: '2025-07-01', contributions: [] },
    ]);

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([
        { id: generateUniqueId(), name: 'Netflix', amount: 15.99, frequency: 'monthly', nextRenewalDate: '2024-07-10', category: 'Entertainment', isActive: true, remindersEnabled: true, provider: 'Netflix Inc.' },
        { id: generateUniqueId(), name: 'Spotify Premium', amount: 10.99, frequency: 'monthly', nextRenewalDate: '2024-07-20', category: 'Entertainment', isActive: true, remindersEnabled: true, provider: 'Spotify AB' },
        { id: generateUniqueId(), name: 'Gym Membership', amount: 45.00, frequency: 'monthly', nextRenewalDate: '2024-07-05', category: 'Health', isActive: true, remindersEnabled: true, provider: 'FitZone' },
        { id: generateUniqueId(), name: 'Amazon Prime', amount: 139.00, frequency: 'annually', nextRenewalDate: '2025-01-01', category: 'Shopping', isActive: true, remindersEnabled: true, provider: 'Amazon' },
        { id: generateUniqueId(), name: 'Adobe Creative Cloud', amount: 52.99, frequency: 'monthly', nextRenewalDate: '2024-07-12', category: 'Software', isActive: true, remindersEnabled: true, provider: 'Adobe Inc.' },
    ]);

    const [challenges, setChallenges] = useState<FinancialChallenge[]>([
        { id: generateUniqueId(), name: 'Coffee Detox', description: 'No buying coffee for 30 days', target: 0, metric: 'transactionsLimited', currentProgress: 0, startDate: '2024-06-01', endDate: '2024-06-30', isCompleted: false, progressHistory: [] },
        { id: generateUniqueId(), name: 'Save $500 this month', description: 'Actively save $500', target: 500, metric: 'amountSaved', currentProgress: 150, startDate: '2024-07-01', endDate: '2024-07-31', isCompleted: false, progressHistory: [{date: '2024-07-05', value: 50}, {date: '2024-07-10', value: 100}] },
        { id: generateUniqueId(), name: 'Cook at Home', description: 'Reduce eating out by 50%', target: 50, metric: 'percentReduced', currentProgress: 60, startDate: '2024-05-01', endDate: '2024-05-31', isCompleted: true, reward: 'New Cookbook', progressHistory: [{date: '2024-05-31', value: 60}] },
    ]);

    const [aiProfile, setAiProfile] = useState<AISageProfile>({
        preferredTone: 'encouraging',
        learningHistory: [],
        financialGoalsLearned: [],
        spendingPatternsIdentified: [],
        proactiveAlertsEnabled: true,
        preferredReportFormat: 'summary',
    });

    const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);

    const addGoalHandler = useCallback((newGoal: Omit<BudgetGoal, 'id' | 'currentAmount' | 'isAchieved' | 'contributions'>) => {
        setGoals(prev => [...prev, { ...newGoal, id: generateUniqueId(), currentAmount: 0, isAchieved: false, contributions: [] }]);
    }, []);

    const updateGoalHandler = useCallback((id: string, updates: Partial<BudgetGoal>) => {
        setGoals(prev => prev.map(goal => goal.id === id ? { ...goal, ...updates } : goal));
    }, []);

    const addSubscriptionHandler = useCallback((newSub: Omit<Subscription, 'id'>) => {
        setSubscriptions(prev => [...prev, { ...newSub, id: generateUniqueId() }]);
    }, []);

    const updateSubscriptionHandler = useCallback((id: string, updates: Partial<Subscription>) => {
        setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, ...updates } : sub));
    }, []);

    const deleteSubscriptionHandler = useCallback((id: string) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    }, []);

    const addChallengeHandler = useCallback((newChallenge: Omit<FinancialChallenge, 'id' | 'currentProgress' | 'isCompleted' | 'progressHistory'>) => {
        setChallenges(prev => [...prev, { ...newChallenge, id: generateUniqueId(), currentProgress: 0, isCompleted: false, progressHistory: [] }]);
    }, []);

    const updateChallengeHandler = useCallback((id: string, updates: Partial<FinancialChallenge>) => {
        setChallenges(prev => prev.map(challenge => challenge.id === id ? { ...challenge, ...updates } : challenge));
    }, []);

    const updateAIProfileHandler = useCallback((updates: Partial<AISageProfile>) => {
        setAiProfile(prev => ({ ...prev, ...updates }));
    }, []);

    const runScenarioHandler = useCallback((scenarioDetails: { name: string; description: string; assumptions: string[] }) => {
        const projectedOutcome: ScenarioResult['projectedOutcome'] = {
            budgetImpact: [{ category: 'Food', change: -50 }, { category: 'Entertainment', change: -100 }],
            savingsImpact: Math.random() * 500 - 200,
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
    }, []);

    return {
        budgets,
        transactions,
        goals,
        subscriptions,
        challenges,
        aiProfile,
        scenarios,

        addBudget,
        updateBudget,
        deleteBudget,

        addGoal: addGoalHandler,
        updateGoal: updateGoalHandler,

        addSubscription: addSubscriptionHandler,
        updateSubscription: updateSubscriptionHandler,
        deleteSubscription: deleteSubscriptionHandler,

        addChallenge: addChallengeHandler,
        updateChallenge: updateChallengeHandler,

        updateAIProfile: updateAIProfileHandler,
        runScenario: runScenarioHandler,
    };
};