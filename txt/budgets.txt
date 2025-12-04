// data/budgets.ts

// These are the Covenants of Spending, the self-imposed laws that the Visionary has
// established to guide their financial discipline. Each budget is a pact, a defined
// boundary for a specific category of expenditure. This data provides the framework
// for the Budgets view, allowing the application to measure, visualize, and offer
// guidance on the user's adherence to their own financial intentions. It is the
// architecture of fiscal responsibility, made manifest in code.

import type { BudgetCategory } from '../types';

/**
 * @description An array representing the user's predefined spending budgets.
 * Each budget has a name, a monthly limit, a current spent amount, and a color
 * for data visualization. This data is the backbone of the Budgets view, allowing
 * for the dynamic tracking and display of spending against limits.
 */
export const MOCK_BUDGETS: BudgetCategory[] = [
  { id: 'dining', name: 'Dining', limit: 400, spent: 280, color: '#f59e0b' },
  { id: 'shopping', name: 'Shopping', limit: 600, spent: 410.50, color: '#6366f1' },
  { id: 'transport', name: 'Transport', limit: 200, spent: 95.20, color: '#10b981' },
  { id: 'utilities', name: 'Utilities', limit: 250, spent: 185.70, color: '#06b6d4' },
];
