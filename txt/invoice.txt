// types/models/corporate/invoice.ts
import type { InvoiceStatus } from './invoice-status';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    counterpartyName: string;
    dueDate: string;
    amount: number;
    status: InvoiceStatus;
}