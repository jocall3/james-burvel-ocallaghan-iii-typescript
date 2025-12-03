// data/upcomingBills.ts

// This is the chronicle of the near future, a list of known financial tempests
// gathering on the horizon. These are the upcoming bills, the predictable
// obligations that require foresight and planning. By providing this data, we
// empower the application to be a proactive co-pilot, reminding the Visionary
// of their duties and helping them navigate the future with confidence.

import type { UpcomingBill } from '../types';

/**
 * @description A list of the user's upcoming bills. This data populates the
 * "Upcoming Bills" widget on the Dashboard, providing timely reminders to the user.
 * Each bill includes a name, amount, and due date.
 */
export const MOCK_UPCOMING_BILLS: UpcomingBill[] = [
    { id: 'bill1', name: 'Credit Card', amount: 345.80, dueDate: '2024-08-15' },
    { id: 'bill2', name: 'Internet', amount: 80.00, dueDate: '2024-08-20' },
    { id: 'bill3', name: 'Car Payment', amount: 450.00, dueDate: '2024-08-25' },
];
