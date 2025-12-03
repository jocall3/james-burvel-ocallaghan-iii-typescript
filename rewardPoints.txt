// data/rewardPoints.ts

// This is the treasury of accolades, the vault where the currency of discipline is
// stored. It is not a measure of wealth, but of meritorious action. This data
// represents the Visionary's starting balance of `RewardPoints`, the tangible result
// of their positive financial habits. It is the heart of the Rewards Hub, the fuel
// for the gamification engine, and a constant, motivating reminder that good
// decisions have their own unique rewards.

import type { RewardPoints } from '../types';

/**
 * @description An object containing the user's initial reward points balance
 * and related metadata. This data populates the "Your Points" widget in the
 * `RewardsView` and serves as the currency for redeeming items.
 */
export const MOCK_REWARD_POINTS: RewardPoints = {
    balance: 85250,
    lastEarned: 320,
    lastRedeemed: 5000,
    currency: 'Points',
};
