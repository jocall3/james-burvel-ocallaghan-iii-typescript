// data/marketMovers.ts

// This is a dispatch from the front lines of the market, a snapshot of the
// celestial bodies currently in volatile motion. These are the market movers,
// the stocks and entities whose gravitational pull is shifting the financial
// cosmos. This data provides a sense of dynamism and connection to the broader
// economic world, making the Dashboard feel alive and responsive to external events.

import type { MarketMover } from '../types';

/**
 * @description A list of mock market-moving stocks. This data simulates a live
 * market feed for the "Market Movers" widget. Each mover includes a ticker, name,
 * price, and recent change, creating a dynamic feel on the Dashboard.
 */
export const MOCK_MARKET_MOVERS: MarketMover[] = [
    { ticker: 'QNTM', name: 'Quantum Corp', price: 450.75, change: 12.55 },
    { ticker: 'CYBR', name: 'Cyberdyne Systems', price: 1024.10, change: 50.12 },
    { ticker: 'NRLNK', name: 'NeuroLink Inc.', price: 875.30, change: -5.60 },
];
