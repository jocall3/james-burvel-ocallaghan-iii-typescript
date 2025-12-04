// data/rewardItems.ts

// This is the catalog of merits, the curated marketplace where the currency of
// discipline can be exchanged for tangible rewards. Each item represents a different
// kind of value—practical, aspirational, or altruistic. This list is the heart
// of the Rewards Hub's marketplace, providing concrete goals for the gamification
// system and closing the loop between positive financial behavior and real-world benefits.
// It is what makes the points worth earning.

import type { RewardItem } from '../types';

/**
 * @description A list of items available for redemption in the `RewardsHubView`.
 * This data populates the marketplace where users can spend their reward points.
 * Each item has a name, cost, type (cashback, giftcard, impact), a description,
 * and an icon, offering a diverse range of redemption options.
 */
export const MOCK_REWARD_ITEMS: RewardItem[] = [
    { id: 'rew1', name: '$25 Statement Credit', cost: 25000, type: 'cashback', description: 'Redeem points for a direct credit to your account balance.', iconName: 'cash' },
    { id: 'rew2', name: '$50 Tech Store Gift Card', cost: 45000, type: 'giftcard', description: 'Get a gift card for your favorite electronics retailer.', iconName: 'gift' },
    { id: 'rew3', name: 'Plant 5 Trees', cost: 10000, type: 'impact', description: 'Use your points to make a positive environmental impact.', iconName: 'leaf' },
];
