// types/models/corporate/compliance-case.ts
export interface ComplianceCase {
    id: string;
    reason: string;
    entityType: 'PaymentOrder' | 'Counterparty';
    entityId: string;
    status: 'open' | 'closed';
    openedDate: string;
}