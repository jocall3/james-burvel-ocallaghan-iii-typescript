// types/models/corporate/payment-order.ts
import type { PaymentOrderStatus } from './payment-order-status';

export interface PaymentOrder {
    id:string;
    counterpartyName: string;
    amount: number;
    currency: 'USD';
    direction: 'credit' | 'debit';
    status: PaymentOrderStatus;
    date: string;
    type: 'ACH' | 'Wire' | 'RTP';
}