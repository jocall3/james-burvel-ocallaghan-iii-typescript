// types/models/corporate/corporate-card.ts
import type { CorporateCardControls } from './corporate-card-controls';
import type { CorporateTransactionSummary } from './corporate-transaction-summary';

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