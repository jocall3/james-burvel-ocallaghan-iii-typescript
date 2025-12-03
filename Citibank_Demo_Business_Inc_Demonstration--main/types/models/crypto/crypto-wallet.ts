// types/models/crypto/crypto-wallet.ts
export interface CryptoWallet {
    symbol: string;
    name: string;
    quantity: number;
    averageBuyPrice: number;
    currentValue: number;
}