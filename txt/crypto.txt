// types/crypto.ts

export interface CryptoAsset {
  ticker: string;
  name: string;
  value: number; // Total value in USD
  amount: number; // Amount of the asset owned
  color: string;
}

export interface NFTAsset {
  id: string;
  name: string;
  imageUrl: string;
  contractAddress: string;
}

export interface VirtualCard {
  cardNumber: string;
  cvv: string;
  expiry: string;
  holderName: string;
}

export type PaymentOperationStatus = 'Initiated' | 'Processing' | 'Completed' | 'Failed';

export interface PaymentOperation {
  id: string;
  description: string;
  amount: number;
  status: PaymentOperationStatus;
  type: 'ACH' | 'Wire' | 'Crypto';
  date: string;
}

// Added for new widget
export interface CryptoWallet {
    symbol: string;
    name: string;
    quantity: number;
    averageBuyPrice: number;
    currentValue: number;
}
