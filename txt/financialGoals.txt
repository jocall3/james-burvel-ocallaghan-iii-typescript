// data/financialGoals.ts

// This is the Atlas of Dreams, the grand registry of the Visionary's most profound
// and life-altering aspirations. These are not mere savings goals; they are quests,
// epic journeys that will define their future. This data is the heart of the
// Financial Goals view. One goal is intentionally left without a plan, inviting
// the user to collaborate with the AI, while the other includes a pre-built,
// detailed AI plan to immediately showcase the depth of the AI's strategic guidance.

import type { FinancialGoal } from '../types';

/**
 * @description A list of the user's long-term, significant financial goals. This is the
 * primary data source for the `GoalsView`. It includes a mix of goals with and without
 * pre-existing AI plans to demonstrate the different states of the UI. The pre-built plan
 * showcases the structure and quality of AI-generated strategic advice.
 */
export const MOCK_FINANCIAL_GOALS: FinancialGoal[] = [
    {
        id: 'goal_house_1',
        name: 'Down Payment for a Condo',
        targetAmount: 75000,
        targetDate: '2029-12-31',
        currentAmount: 12500,
        iconName: 'home',
        plan: null,
    },
    {
        id: 'goal_trip_1',
        name: 'Trip to Neo-Tokyo',
        targetAmount: 15000,
        targetDate: '2026-06-01',
        currentAmount: 8000,
        iconName: 'plane',
        plan: {
            feasibilitySummary: "Highly achievable! You are already on a great track to reach this goal ahead of schedule.",
            monthlyContribution: 450,
            steps: [
                { title: "Automate Savings", description: "Set up an automatic monthly transfer of $450 to your 'Trip to Neo-Tokyo' savings goal.", category: 'Savings' },
                { title: "Review Subscriptions", description: "Analyze your recurring subscriptions. Cancelling one or two could accelerate your goal.", category: 'Budgeting' },
                { title: "Explore Travel ETFs", description: "Consider investing a small portion of your savings in a travel and tourism focused ETF for potential growth.", category: 'Investing' }
            ]
        }
    }
];
