// types/models/ai/ai-goal-plan-step.ts
export interface AIGoalPlanStep {
    title: string;
    description: string;
    category: 'Savings' | 'Budgeting' | 'Investing' | 'Income';
}