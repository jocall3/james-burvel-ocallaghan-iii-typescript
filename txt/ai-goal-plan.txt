// types/models/ai/ai-goal-plan.ts
import type { AIGoalPlanStep } from './ai-goal-plan-step';

export interface AIGoalPlan {
    feasibilitySummary: string;
    monthlyContribution: number;
    steps: AIGoalPlanStep[];
}