// data/assets.ts

// This scroll is the Domesday Book of the Visionary's wealth. It is not a record
// of movement, but of substance; a detailed account of the assets that form the bedrock
// of their financial kingdom. Each entry is a pillar of their net worth, a constellation
// in their personal financial cosmos. The structure is precise, the values significant,
// ensuring the simulation begins from a state of established, tangible wealth.

import type { Asset } from '../types';

/**
 * @description A list of the user's primary financial assets. This array represents
 * their investment portfolio, diversified across several common classes. Each asset
 * includes a value, a color for charting, and a year-to-date performance metric.
 * This data is essential for populating the Investments view and the portfolio widgets.
 */
export const MOCK_ASSETS: Asset[] = [
  { name: 'Stocks', value: 40000, color: '#06b6d4', performanceYTD: 15.2 },
  { name: 'Bonds', value: 25000, color: '#6366f1', performanceYTD: 4.1 },
  { name: 'Crypto', value: 15000, color: '#f59e0b', performanceYTD: 45.8 },
  { name: 'Real Estate', value: 20000, color: '#10b981', performanceYTD: 8.5 },
];
