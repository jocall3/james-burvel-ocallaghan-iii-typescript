// data/invoices.ts

// This is the accounts receivable and payable ledger, the record of debts owed
// and payments due. Each `Invoice` is a formal claim on capital, a timed event
// in the corporate financial calendar. This data populates the Invoices view,
// providing a clear and actionable list of financial instruments that need to be
// managed, paid, or collected. The variety of statuses (paid, unpaid, overdue)
// creates a realistic and dynamic financial environment.

import type { Invoice } from '../types';

/**
 * @description A list of mock invoices for the corporate finance module.
 * This data is used in the "Invoices" view. Each invoice has a status
 * ('unpaid', 'paid', 'overdue'), which allows for the simulation of
 * accounts receivable and payable management.
 */
export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv_1', invoiceNumber: 'INV-2024-07-001', counterpartyName: 'Client Bravo', dueDate: '2024-07-15', amount: 7500, status: 'overdue' },
  { id: 'inv_2', invoiceNumber: 'INV-2024-08-002', counterpartyName: 'Client Charlie', dueDate: '2024-08-10', amount: 12000, status: 'unpaid' },
  { id: 'inv_3', invoiceNumber: 'INV-2024-06-003', counterpartyName: 'Client Delta', dueDate: '2024-06-25', amount: 2500, status: 'paid' },
  { id: 'inv_4', invoiceNumber: 'INV-2024-08-001', counterpartyName: 'Synergize Solutions', dueDate: '2024-08-20', amount: 4800, status: 'unpaid' },
];
