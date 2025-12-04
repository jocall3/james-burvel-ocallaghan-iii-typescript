// data/mockData.ts
import { GamificationState, AIInsight, LinkedAccount } from '../types';

export const MOCK_GAMIFICATION: GamificationState = { score: 1200, level: 5, levelName: "Adept", progress: 60, credits: 150 };

export const MOCK_AI_INSIGHTS: AIInsight[] = [
    { id: 'ai1', title: 'High spending in Dining', description: 'You have spent 80% of your dining budget.', urgency: 'medium' }
];

export const MOCK_LINKED_ACCOUNTS: LinkedAccount[] = [{ id: 'acc_plaid_mock', name: 'Plaid Checking', mask: '1111' }];
