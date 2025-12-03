// types/system.ts
import { View } from './ui';

export interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    view?: View;
}

export type APIProvider = 'Plaid' | 'Stripe' | 'Marqeta' | 'Modern Treasury' | 'Google Gemini';

export interface APIStatus {
    provider: APIProvider;
    status: 'Operational' | 'Degraded Performance' | 'Partial Outage' | 'Major Outage';
    responseTime: number; // in ms
}

export interface MarketMover {
  ticker: string;
  name: string;
  price: number;
  change: number;
}
