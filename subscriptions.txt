// data/subscriptions.ts

// This is the chronicle of recurring obligations, the list of digital tenants
// to whom the Visionary pays regular tribute. Each subscription is a small,
// persistent drain on resources, and tracking them is paramount to financial
// clarity. This data seeds the Subscription Tracker widget, providing immediate
// visibility into these automated expenses and giving the AI a baseline from
// which to hunt for other, forgotten covenants.

import type { Subscription } from '../types';

/**
 * @description A list of the user's known recurring subscriptions. This data
 * is used to populate the "Recurring Subscriptions" widget on the Dashboard.
 * Each subscription has a name, amount, next payment date, and an icon name
 * for easy identification.
 */
export const MOCK_SUBSCRIPTIONS: Subscription[] = [
    { id: 'sub1', name: 'QuantumFlix', amount: 15.99, nextPayment: '2024-08-01', iconName: 'video' },
    { id: 'sub2', name: 'SynthWave Music', amount: 9.99, nextPayment: '2024-08-05', iconName: 'music' },
    { id: 'sub3', name: 'CyberCloud Pro', amount: 24.99, nextPayment: '2024-08-10', iconName: 'cloud' },
];
