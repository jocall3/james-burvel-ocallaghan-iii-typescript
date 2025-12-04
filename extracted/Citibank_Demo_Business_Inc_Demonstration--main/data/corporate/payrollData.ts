// data/corporate/payrollData.ts
import type { PayRun } from '../../types';

export const MOCK_PAY_RUNS: PayRun[] = [
  {
    id: 'pr-2024-07-2',
    periodStart: '2024-07-16',
    periodEnd: '2024-07-31',
    payDate: '2024-08-05',
    totalAmount: 152100.00,
    employeeCount: 20,
    status: 'Pending',
  },
  {
    id: 'pr-2024-07-1',
    periodStart: '2024-07-01',
    periodEnd: '2024-07-15',
    payDate: '2024-07-20',
    totalAmount: 150250.75,
    employeeCount: 20,
    status: 'Paid',
  },
  {
    id: 'pr-2024-06-2',
    periodStart: '2024-06-16',
    periodEnd: '2024-06-30',
    payDate: '2024-07-05',
    totalAmount: 148980.50,
    employeeCount: 19,
    status: 'Paid',
  },
  {
    id: 'pr-2024-06-1',
    periodStart: '2024-06-01',
    periodEnd: '2024-06-15',
    payDate: '2024-06-20',
    totalAmount: 145800.00,
    employeeCount: 19,
    status: 'Paid',
  },
   {
    id: 'pr-2024-05-2',
    periodStart: '2024-05-16',
    periodEnd: '2024-05-31',
    payDate: '2024-06-05',
    totalAmount: 142500.00,
    employeeCount: 18,
    status: 'Paid',
  },
];