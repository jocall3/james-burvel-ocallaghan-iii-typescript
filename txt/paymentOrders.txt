// data/paymentOrders.ts

// This is the central clearing house for corporate capital, the queue of commands
// awaiting execution. Each `PaymentOrder` is a formal request to move funds,
// complete with a counterparty, amount, and status. This data is the lifeblood of the
// corporate finance suite, providing a realistic list of items that require attention,
// approval, or tracking. The variety of statuses demonstrates the full lifecycle of
// a payment, from creation to completion or failure.

import type { PaymentOrder } from '../types';

/**
 * @description A list of mock payment orders for the corporate finance module.
 * This data populates the "Payment Orders" view.
 * Each order has a status (e.g., 'needs_approval', 'completed'), allowing the
 * simulation of an entire payment approval workflow.
 */
export const MOCK_PAYMENT_ORDERS: PaymentOrder[] = [
  { id: 'po_001', counterpartyName: 'Cloud Services Inc.', amount: 199.99, currency: 'USD', direction: 'debit', status: 'needs_approval', date: '2024-07-23', type: 'ACH' },
  { id: 'po_002', counterpartyName: 'Office Supplies Co.', amount: 89.20, currency: 'USD', direction: 'debit', status: 'approved', date: '2024-07-22', type: 'ACH' },
  { id: 'po_003', counterpartyName: 'Stripe, Inc.', amount: 15000, currency: 'USD', direction: 'credit', status: 'completed', date: '2024-07-21', type: 'Wire' },
  { id: 'po_004', counterpartyName: 'Client Alpha', amount: 5000, currency: 'USD', direction: 'credit', status: 'returned', date: '2024-07-20', type: 'RTP' },
  { id: 'po_005', counterpartyName: 'QuantumLeap Marketing', amount: 15000, currency: 'USD', direction: 'debit', status: 'processing', date: '2024-07-23', type: 'Wire'},
  { id: 'po_006', counterpartyName: 'Synergize Solutions', amount: 1250.50, currency: 'USD', direction: 'debit', status: 'completed', date: '2024-07-21', type: 'ACH'},
  { id: 'po_007', counterpartyName: 'Synergize Solutions', amount: 1250.50, currency: 'USD', direction: 'debit', status: 'denied', date: '2024-07-21', type: 'ACH'},

];
