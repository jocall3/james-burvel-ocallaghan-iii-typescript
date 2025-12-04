// data/portfolioAssets.ts
import { PortfolioAsset } from '../types';

export const MOCK_PORTFOLIO_ASSETS: PortfolioAsset[] = [
  // Equities - North America
  { id: 'asset-001', name: 'Apple Inc.', ticker: 'AAPL', assetClass: 'Equities', region: 'North America', value: 52050, change24h: 1.2 },
  { id: 'asset-002', name: 'Microsoft Corp.', ticker: 'MSFT', assetClass: 'Equities', region: 'North America', value: 48100, change24h: -0.5 },
  { id: 'asset-003', name: 'NVIDIA Corp.', ticker: 'NVDA', assetClass: 'Equities', region: 'North America', value: 35600, change24h: 2.8 },
  { id: 'asset-004', name: 'Amazon.com, Inc.', ticker: 'AMZN', assetClass: 'Equities', region: 'North America', value: 31200, change24h: 0.3 },
  { id: 'asset-005', name: 'Tesla, Inc.', ticker: 'TSLA', assetClass: 'Equities', region: 'North America', value: 22000, change24h: -1.9 },
  
  // Equities - Europe
  { id: 'asset-006', name: 'ASML Holding N.V.', ticker: 'ASML', assetClass: 'Equities', region: 'Europe', value: 18500, change24h: 0.9 },
  { id: 'asset-007', name: 'LVMH Moët Hennessy', ticker: 'MC.PA', assetClass: 'Equities', region: 'Europe', value: 15300, change24h: -0.1 },

  // Equities - Asia
  { id: 'asset-008', name: 'Tencent Holdings', ticker: 'TCEHY', assetClass: 'Equities', region: 'Asia', value: 19800, change24h: 1.5 },
  { id: 'asset-009', name: 'Samsung Electronics', ticker: 'SSNLF', assetClass: 'Equities', region: 'Asia', value: 17600, change24h: 0.2 },

  // Equities - Emerging Markets
  { id: 'asset-010', name: 'iShares MSCI EM ETF', ticker: 'EEM', assetClass: 'Equities', region: 'Emerging Markets', value: 35000, change24h: -0.8 },

  // Fixed Income
  { id: 'asset-020', name: 'US Treasury Bond', ticker: 'GOVT', assetClass: 'Fixed Income', region: 'North America', value: 105000, change24h: 0.05 },
  { id: 'asset-021', name: 'iShares Corporate Bond ETF', ticker: 'LQD', assetClass: 'Fixed Income', region: 'North America', value: 82000, change24h: 0.1 },
  { id: 'asset-022', name: 'PIMCO Income Fund', ticker: 'PIMIX', assetClass: 'Fixed Income', region: 'Global', value: 65000, change24h: 0.15 },

  // Alternatives
  { id: 'asset-030', name: 'VNQ Real Estate ETF', ticker: 'VNQ', assetClass: 'Alternatives', region: 'North America', value: 68000, change24h: 0.8 },
  { id: 'asset-031', name: 'SPDR Gold Shares', ticker: 'GLD', assetClass: 'Alternatives', region: 'Global', value: 42000, change24h: -0.2 },
  { id: 'asset-032', name: 'Invesco DB Commodity ETF', ticker: 'DBC', assetClass: 'Alternatives', region: 'Global', value: 21000, change24h: 1.1 },
  { id: 'asset-033', name: 'Blackstone Private Equity', ticker: 'BX', assetClass: 'Alternatives', region: 'Global', value: 38000, change24h: 2.3 },

  // Digital Assets
  { id: 'asset-040', name: 'Bitcoin', ticker: 'BTC', assetClass: 'Digital Assets', region: 'Global', value: 31500, change24h: 3.5 },
  { id: 'asset-041', name: 'Ethereum', ticker: 'ETH', assetClass: 'Digital Assets', region: 'Global', value: 22300, change24h: 2.1 },
  { id: 'asset-042', name: 'Solana', ticker: 'SOL', assetClass: 'Digital Assets', region: 'Global', value: 8800, change24h: -1.2 },

  // Cash & Equivalents
  { id: 'asset-050', name: 'Money Market Fund', ticker: 'VMFXX', assetClass: 'Cash & Equivalents', region: 'North America', value: 125000, change24h: 0.01 },
];