// data/anomalies.ts

// This is the Oracle's warning, the chronicle of deviations from the norm. This is
// not a list of rule violations, but of behavioral oddities detected by the ever-
// watchful eye of the Heuristic API. Each `FinancialAnomaly` is a story, complete
// with an AI-generated explanation of *why* it is suspicious. This rich, detailed
// dataset is the heart of the Anomaly Detection view, showcasing one of the most
// powerful and futuristic capabilities of the entire platform.

import type { FinancialAnomaly } from '../types';

/**
 * @description A list of mock financial anomalies detected by the AI. This is the
 * primary data source for the `AnomalyDetectionView`. The data is intentionally rich, 
 * including an AI-generated explanation, severity, status, and a risk score to 
 * demonstrate a sophisticated, AI-powered security and risk management system.
 */
export const MOCK_ANOMALIES: FinancialAnomaly[] = [
  {
    id: 'anom_1',
    description: 'Unusually Large Payment to New Counterparty',
    details: 'A payment of $15,000 was made to "QuantumLeap Marketing", a counterparty with no prior transaction history. The amount is 5x larger than the average initial payment to a new vendor.',
    severity: 'High',
    status: 'New',
    entityType: 'PaymentOrder',
    entityId: 'po_005',
    entityDescription: 'PO #po_005 to QuantumLeap Marketing',
    timestamp: '2024-07-23 10:45 AM',
    riskScore: 85,
  },
  {
    id: 'anom_2',
    description: 'High-Frequency Spending on Corporate Card',
    details: 'Corporate card ending in 8431 (Alex Chen) was used 12 times in a 2-hour window. This pattern is anomalous compared to the typical usage of 2-3 transactions per day.',
    severity: 'Medium',
    status: 'New',
    entityType: 'CorporateCard',
    entityId: 'corp1',
    entityDescription: 'Card **** 8431 (Alex Chen)',
    timestamp: '2024-07-23 09:30 AM',
    riskScore: 62,
  },
  {
    id: 'anom_3',
    description: 'Transaction at Atypical Time',
    details: 'An expense of $250.00 at "CyberNight Bar" was recorded at 4:15 AM, a time when this user has no previous transaction history.',
    severity: 'Low',
    status: 'Under Review',
    entityType: 'Transaction',
    entityId: 'tx_anom_1',
    entityDescription: 'Expense at CyberNight Bar',
    timestamp: '2024-07-22 04:15 AM',
    riskScore: 45,
  },
  {
    id: 'anom_4',
    description: 'Potential Duplicate Invoice Payment',
    details: 'Two payment orders (#po_006, #po_007) for the exact amount of $1,250.50 were created for the same counterparty "Synergize Solutions" within 24 hours.',
    severity: 'Critical',
    status: 'Resolved',
    entityType: 'PaymentOrder',
    entityId: 'po_006',
    entityDescription: 'PO #po_006 to Synergize Solutions',
    timestamp: '2024-07-21 02:00 PM',
    riskScore: 98,
  },
];
