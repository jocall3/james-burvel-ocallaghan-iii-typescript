// types/models/personal/financial-goal.ts
import type { AIGoalPlan } from '../ai/ai-goal-plan';

export interface FinancialGoal {
    id: string;
    name: string;
    targetAmount: number;
    targetDate: string;
    currentAmount: number;
    iconName: string;
    plan: AIGoalPlan | null;
    progressHistory?: { date: string; amount: number }[];
}