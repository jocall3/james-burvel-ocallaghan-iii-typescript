// data/complianceCases.ts

// This is the docket of the digital magistrate, the list of financial events that
// have been flagged for review by the system's automated compliance rules. Each
// `ComplianceCase` represents a transaction or entity that requires human oversight.
// This data is essential for the Compliance view, demonstrating the platform's
// built-in regulatory and risk management capabilities.

import type { ComplianceCase } from '../types';

/**
 * @description A list of mock compliance cases for the corporate finance module.
 * This data simulates issues that have been automatically flagged by the system
 * for manual review, populating the "Compliance" view. Each case is linked to
 * an entity (like a PaymentOrder) and has a status.
 */
export const MOCK_COMPLIANCE_CASES: ComplianceCase[] = [
  { id: 'case_1', reason: 'Transaction over $10,000', entityType: 'PaymentOrder', entityId: 'po_003', status: 'open', openedDate: '2024-07-21' },
  { id: 'case_2', reason: 'New Counterparty Requires Verification', entityType: 'Counterparty', entityId: 'cp_004', status: 'open', openedDate: '2024-07-23' },
];
