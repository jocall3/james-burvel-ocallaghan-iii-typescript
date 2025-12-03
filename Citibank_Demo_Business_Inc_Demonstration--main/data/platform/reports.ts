// data/platform/reports.ts
import type { Report } from '../../types';

/**
 * @description A list of mock generated reports. This data is used in the BI and
 * Analytics sections of the platform, simulating the output of complex data analysis jobs.
 */
export const MOCK_REPORTS: Report[] = [
    {
        id: 'report_q2_spend',
        name: 'Q2 2024 Corporate Spend Analysis',
        generatedAt: '2024-07-01 09:00 AM',
        data: {
            totalSpend: 125430.50,
            topCategory: 'Software',
            topMerchant: 'Cloud Services Inc.',
        }
    },
    {
        id: 'report_compliance_summary',
        name: 'Monthly Compliance Summary - June 2024',
        generatedAt: '2024-07-02 11:30 AM',
        data: {
            casesOpened: 15,
            casesResolved: 12,
            avgTimeToResolution: '72h',
        }
    }
];