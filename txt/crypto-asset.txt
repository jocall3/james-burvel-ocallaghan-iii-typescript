// types/models/crypto/crypto-asset.ts
export interface CryptoAsset {
  ticker: string;
  name: string;
  value: number; // Total value in USD
  amount: number; // Amount of the asset owned
  color: string;
}