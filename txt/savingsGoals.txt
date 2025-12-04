// data/savingsGoals.ts

// This is the codex of minor aspirations, the short-term dreams and desires that
// give texture and motivation to the financial journey. These are not the grand,
// life-altering quests, but the smaller, satisfying milestones along the way.
// This data populates the Savings Goals widget, turning abstract wants into
// tangible, trackable objectives that make the act of saving more engaging.

import type { SavingsGoal } from '../types';

/**
 * @description A list of the user's short-term savings goals. This data is used
 * in the "Savings Goals" widget on the Dashboard. Each goal has a name, target amount,
 * current saved amount, and an icon for visual representation.
 */
export const MOCK_SAVINGS_GOALS: SavingsGoal[] = [
    { id: 'goal1', name: 'Cyberpunk Vacation', target: 5000, saved: 3250, iconName: 'plane' },
    { id: 'goal2', name: 'New Hoverboard', target: 2500, saved: 800, iconName: 'rocket' },
];
