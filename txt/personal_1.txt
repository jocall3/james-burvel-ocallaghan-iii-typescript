// types/ts
// This file has been refactored to act as a central barrel file.
// It aggregates and exports all type definitions from the new, modularized
// files located in the `/types/models` directory. This approach improves organization
// and maintainability while ensuring that all existing component imports
// continue to work without any changes.

export * from './types/models';
// Added for new widgets
export interface Loan {
  id: string;
  name: string;
  outstandingBalance: number;
  monthlyPayment: number;
  nextPaymentDate: string;
}

export interface RealEstateAsset {
  id: string;
  name: string;
  value: number;
}

export interface InvestmentPortfolio {
    assetType: string;
    currentValue: number;
}

export interface CryptoWallet {
    symbol: string;
    name: string;
    quantity: number;
    averageBuyPrice: number;
    currentValue: number;
}
