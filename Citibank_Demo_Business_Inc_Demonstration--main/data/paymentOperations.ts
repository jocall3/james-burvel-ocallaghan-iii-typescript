// data/paymentOperations.ts

// This is the Scribe's Hall, the high-level ledger that records the great movements
// of capital between worlds. It is not a list of consumer transactions, but of
// significant, multi-rail `PaymentOperation`s, simulating interactions with major
// financial partners like Stripe and Marqeta. This data demonstrates the platform's
// enterprise-grade capability to manage and track complex financial flows, providing
// a sense of robustness and security to the Crypto & Web3 Hub.

import type { PaymentOperation } from '../types';

/**
 * @description A list of high-level payment operations, simulating a backend ledger
 * for movements of funds between different rails (e.g., ACH, Wire, Crypto). This
 * data is used in the `CryptoView` to demonstrate the platform's ability to handle
 * enterprise-level financial operations with partners like Stripe, Marqeta, and
 * Modern Treasury.
 */
export const MOCK_PAYMENT_OPERATIONS: PaymentOperation[] = [
    { id: 'po_1', description: 'Stripe On-Ramp Batch #A42', amount: 25000, status: 'Completed', type: 'ACH', date: '2024-07-22' },
    { id: 'po_2', description: 'Crypto Payout to 0x...b4A2', amount: 5000, status: 'Completed', type: 'Crypto', date: '2024-07-22' },
    { id: 'po_3', description: 'Marqeta Card Funding', amount: 10000, status: 'Processing', type: 'Wire', date: '2024-07-23' },
    { id: 'po_4', description: 'Coinbase Withdrawal', amount: 12000, status: 'Initiated', type: 'ACH', date: '2024-07-23' },
    { id: 'po_5', description: 'Manual Adjustment', amount: -500, status: 'Failed', type: 'ACH', date: '2024-07-21' },
];
