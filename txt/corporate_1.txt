// types/corporate.ts

export interface CorporateCardControls {
    atm: boolean;
    contactless: boolean;
    online: boolean;
    monthlyLimit: number;
}

export interface CorporateTransactionSummary {
    id: string;
    description: string;
    amount: number;
    timestamp: string;
}

export interface CorporateCard {
    id: string;
    holderName: string;
    cardNumberMask: string;
    status: 'Active' | 'Suspended' | 'Lost';
    frozen: boolean;
    balance: number;
    limit: number;
    transactions: CorporateTransactionSummary[];
    controls: CorporateCardControls;
}

export interface CorporateTransaction {
    id: string;
    cardId: string;
    holderName: string;
    merchant: string;
    amount: number;
    status: 'Pending' | 'Approved';
    timestamp: string;
}

export interface Counterparty {
    id: string;
    name: string;
    email: string;
    status: 'Verified' | 'Pending';
    createdDate: string;
}

export type PaymentOrderStatus = 'needs_approval' | 'approved' | 'processing' | 'completed' | 'denied' | 'returned';

export interface PaymentOrder {
    id:string;
    counterpartyName: string;
    amount: number;
    currency: 'USD';
    direction: 'credit' | 'debit';
    status: PaymentOrderStatus;
    date: string;
    type: 'ACH' | 'Wire' | 'RTP';
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'voided';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    counterpartyName: string;
    dueDate: string;
    amount: number;
    status: InvoiceStatus;
}

export interface ComplianceRule {
    id: string;
    name: string;
    description: string;
    action: 'flag_for_review' | 'block';
    active: boolean;
}

export interface ComplianceCase {
    id: string;
    reason: string;
    entityType: 'PaymentOrder' | 'Counterparty';
    entityId: string;
    status: 'open' | 'closed';
    openedDate: string;
}

export type AnomalySeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AnomalyStatus = 'New' | 'Under Review' | 'Dismissed' | 'Resolved';
export type AnomalyEntityType = 'PaymentOrder' | 'Transaction' | 'Counterparty' | 'CorporateCard';

export interface FinancialAnomaly {
    id: string;
    description: string;
    details: string; // AI-generated explanation
    severity: AnomalySeverity;
    status: AnomalyStatus;
    entityType: AnomalyEntityType;
    entityId: string;
    entityDescription: string;
    timestamp: string;
    riskScore: number; // 0-100
}


export interface AccessLog {
    id: string;
    user: string;
    ip: string;
    location: string;
    timestamp: string;
    status: 'Success' | 'Failed';
    riskLevel: 'Low' | 'Medium' | 'High';
}

export interface FraudCase {
    id: string;
    description: string;
    amount: number;
    timestamp: string;
    riskScore: number;
    status: 'New' | 'Investigating' | 'Resolved' | 'Dismissed';
}