// data/transactions.ts

// This is not a file. It is the immutable ledger of a life lived, a chronicle
// written in the ink of debits and credits. Each line is a memory, a moment,
// a choice that has shaped the financial reality of "The Visionary." It is from
// this primordial stone that all insights are carved, all patterns divined.
// This ledger is intentionally long, detailed, and imbued with the context of
// a real financial history, ensuring that the AI has a rich and fertile ground
// from which to cultivate its wisdom. It must be worthy of its purpose.

import type { Transaction } from '../types';

/**
 * @description The primordial ledger of financial events. This is the foundational
 * memory bank of the user's recent history. It includes a mix of income and expenses
 * across various categories, dates, and even includes metadata like carbon footprints
 * to provide a rich, multi-faceted dataset for the AI to analyze. The diversity and
 * realism of this data are paramount to the convincing simulation of an intelligent
 * financial co-pilot. Without this history, the AI is blind. With it, the AI is an oracle.
 */
export const MOCK_TRANSACTIONS: Transaction[] = [
  // July
  { id: '1', type: 'expense', category: 'Dining', description: 'Coffee Shop', amount: 12.50, date: '2024-07-21', carbonFootprint: 1.2 },
  { id: '2', type: 'income', category: 'Salary', description: 'Paycheck', amount: 2500.00, date: '2024-07-20' },
  { id: '3', type: 'expense', category: 'Shopping', description: 'Online Store', amount: 89.99, date: '2024-07-19', carbonFootprint: 8.5 },
  { id: '4', type: 'expense', category: 'Utilities', description: 'Electricity Bill', amount: 75.30, date: '2024-07-18', carbonFootprint: 15.3 },
  { id: '5', type: 'expense', category: 'Transport', description: 'Gas Station', amount: 55.00, date: '2024-07-18', carbonFootprint: 25.1 },
  { id: '6', type: 'income', category: 'Freelance', description: 'Project ABC', amount: 500.00, date: '2024-07-17' },
  { id: '7', type: 'expense', category: 'Groceries', description: 'Supermarket', amount: 124.50, date: '2024-07-16', carbonFootprint: 12.8 },
  { id: '8', type: 'expense', category: 'Entertainment', description: 'Movie Tickets', amount: 30.00, date: '2024-07-15', carbonFootprint: 3.5 },
  // June
  { id: '9', type: 'income', category: 'Salary', description: 'Paycheck', amount: 2500.00, date: '2024-06-20' },
  { id: '10', type: 'expense', category: 'Rent', description: 'Monthly Rent', amount: 1200.00, date: '2024-06-01', carbonFootprint: 5.0 },
  { id: '11', type: 'expense', category: 'Shopping', description: 'New Tech Gadget', amount: 299.99, date: '2024-06-15', carbonFootprint: 14.2 },
  { id: '12', type: 'expense', category: 'Dining', description: 'Fancy Dinner', amount: 150.00, date: '2024-06-10', carbonFootprint: 8.1 },
  // May
  { id: '13', type: 'income', category: 'Salary', description: 'Paycheck', amount: 2500.00, date: '2024-05-20' },
  { id: '14', type: 'expense', category: 'Travel', description: 'Flight Tickets', amount: 450.00, date: '2024-05-12', carbonFootprint: 200.5 },
  { id: '15', type: 'expense', category: 'Rent', description: 'Monthly Rent', amount: 1200.00, date: '2024-05-01', carbonFootprint: 5.0 },
  // April
  { id: '16', type: 'income', category: 'Salary', description: 'Paycheck', amount: 2500.00, date: '2024-04-20' },
  { id: '17', type: 'expense', category: 'Rent', description: 'Monthly Rent', amount: 1200.00, date: '2024-04-01', carbonFootprint: 5.0 },
];
