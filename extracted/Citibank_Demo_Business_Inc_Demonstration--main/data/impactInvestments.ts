// data/impactInvestments.ts

// This is the registry of virtuous constellations, the catalog of companies that shine
// not just with the light of profit, but with the aura of purpose. Each entry is a
// potential investment, an opportunity for the user to align their wealth with their
// values. This data is the heart of the Social Impact Investing feature, a testament
// to the philosophy that finance can be a force for positive change. It is a curated
// list, designed to be inspiring and worthy of the Visionary's capital.

import type { Asset } from '../types';

/**
 * @description A curated list of companies available for social impact (ESG) investing.
 * Each asset includes a name, a description of its mission, and an ESG rating. This data
 * is used to populate the "Social Impact Investing" card in the Investments view, providing
 * users with a tangible way to invest according to their values.
 */
export const MOCK_IMPACT_INVESTMENTS: Asset[] = [
    { name: 'TerraCycle', value: 0, color: '', esgRating: 5, description: 'Innovator in recycling and circular economy.' },
    { name: 'Patagonia Works', value: 0, color: '', esgRating: 5, description: 'Sustainable apparel and environmental activism.'},
    { name: 'Beyond Meat', value: 0, color: '', esgRating: 4, description: 'Plant-based foods to reduce climate impact.'},
    { name: 'Tesla, Inc.', value: 0, color: '', esgRating: 3, description: 'Accelerating the world\'s transition to sustainable energy.'}
];
