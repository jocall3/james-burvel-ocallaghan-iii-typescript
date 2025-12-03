// types/models/crypto/payment-operation.ts
import type { PaymentOperationStatus } from './payment-operation-status';

export interface PaymentOperation {
  id: string;
  description: string;
  amount: number;
  status: PaymentOperationStatus;
  type: 'ACH' | 'Wire' | 'Crypto';
  date: string;
}