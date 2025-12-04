// data/notifications.ts

// These are the dispatches from the application's consciousness, the whispers and
// alerts that Quantum sends to the Visionary. Each notification is a breadcrumb,
// a small, actionable piece of information designed to draw the user's attention
// to important events within their financial world. This initial list ensures that
// the notification bell is alive with relevant information from the very first
// moment, making the application feel responsive and vigilant.

import type { Notification } from '../types';
import { View } from '../types';

/**
 * @description A list of initial notifications for the user. This data populates
 * the notifications dropdown in the `Header`. Each notification includes a message,
 * a timestamp, a read status, and an optional `view` property to navigate the user
 * to the relevant section of the app when clicked.
 */
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', message: 'Your credit score has increased by 5 points!', timestamp: '2h ago', read: false, view: View.CreditHealth },
  { id: '2', message: 'A large purchase of $299.99 at "New Tech Gadget" was detected.', timestamp: '1d ago', read: false, view: View.Transactions },
  // FIX: Corrected `View.Rewards` to `View.RewardsHub` to match the enum definition.
  { id: '3', message: 'You have earned 150 reward points from your recent spending.', timestamp: '3d ago', read: true, view: View.RewardsHub },
  { id: '4', message: 'Your "Dining" budget is at 85% capacity.', timestamp: '4d ago', read: true, view: View.Budgets },
];