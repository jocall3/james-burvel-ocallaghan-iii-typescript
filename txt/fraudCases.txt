// data/fraudCases.ts
import { FraudCase } from '../types';

export const MOCK_FRAUD_CASES: FraudCase[] = [
    { id: 'case-001', description: 'High-velocity transactions from new device', amount: 1250.50, timestamp: '2024-07-23 10:45 AM', riskScore: 92, status: 'New' },
    { id: 'case-002', description: 'Login from unusual location followed by max withdrawal', amount: 5000.00, timestamp: '2024-07-23 09:30 AM', riskScore: 85, status: 'New' },
    { id: 'case-003', description: 'Multiple small payments to unknown international merchant', amount: 350.75, timestamp: '2024-07-22 08:00 PM', riskScore: 78, status: 'Investigating' },
    { id: 'case-004', description: 'Potential account takeover attempt', amount: 0, timestamp: '2024-07-21 02:00 PM', riskScore: 98, status: 'Resolved' },
    { id: 'case-005', description: 'Atypical high-value transfer to new beneficiary', amount: 15000.00, timestamp: '2024-07-20 11:15 AM', riskScore: 75, status: 'Dismissed' },
];
