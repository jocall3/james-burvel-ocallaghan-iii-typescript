// data/cryptoAssets.ts

// This is the ledger of the new world, a record of the Visionary's holdings in the
// decentralized financial frontier. Each entry represents a stake in a blockchain,
// a piece of a permissionless future. This data is the foundation of the Crypto & Web3
// Hub, proving Demo Bank's fluency in the language of this emerging asset class and
// providing a tangible portfolio for the user to manage from day one.

import type { CryptoAsset } from '../types';

/**
 * @description A list of the user's initial cryptocurrency holdings. This data is
 * used to populate the portfolio section of the `CryptoView`. Each asset has a
 * ticker, name, current value in USD, the amount of the asset held, and a color
 * for charting.
 */
export const MOCK_CRYPTO_ASSETS: CryptoAsset[] = [
  { ticker: 'BTC', name: 'Bitcoin', value: 34500, amount: 0.5, color: '#f7931a' },
  { ticker: 'ETH', name: 'Ethereum', value: 12000, amount: 4, color: '#627eea' },
  { ticker: 'SOL', name: 'Solana', value: 3500, amount: 25, color: '#00ffa3' },
];
