// data/counterparties.ts

// This is the diplomatic roster of the corporate world, the official registry of
// all verified entities with whom the enterprise conducts business. Each counterparty
// is a trusted partner, a node in the vast network of commerce. This data provides
// the foundation for the Counterparties view, allowing for secure and efficient
// management of vendors, clients, and partners.

import type { Counterparty } from '../types';

/**
 * @description A list of mock corporate counterparties (vendors, clients, etc.).
 * This data is used in the `CounterpartiesView` and is referenced by other
 * corporate finance modules like Payment Orders and Invoices.
 */
export const MOCK_COUNTERPARTIES: Counterparty[] = [
    { id: 'cp_001', name: 'Cloud Services Inc.', email: 'billing@cloudservices.com', status: 'Verified', createdDate: '2023-01-15' },
    { id: 'cp_002', name: 'Office Supplies Co.', email: 'accounts@officesupplies.com', status: 'Verified', createdDate: '2022-11-20' },
    { id: 'cp_003', name: 'Synergize Solutions', email: 'contact@synergize.com', status: 'Verified', createdDate: '2023-05-10' },
    { id: 'cp_004', name: 'QuantumLeap Marketing', email: 'hello@quantumleap.io', status: 'Pending', createdDate: '2024-07-23' },
    { id: 'cp_005', name: 'Client Bravo', email: 'ap@clientbravo.com', status: 'Verified', createdDate: '2023-08-01' },
];
