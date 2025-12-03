// types/models/system/market-mover.ts
export interface MarketMover {
  ticker: string;
  name: string;
  price: number;
  change: number;
}