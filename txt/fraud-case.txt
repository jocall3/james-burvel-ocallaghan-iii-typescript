// types/models/corporate/fraud-case.ts
export interface FraudCase {
    id: string;
    description: string;
    amount: number;
    timestamp: string;
    riskScore: number;
    status: 'New' | 'Investigating' | 'Resolved' | 'Dismissed';
}