// types/models/corporate/counterparty.ts
export interface Counterparty {
    id: string;
    name: string;
    email: string;
    status: 'Verified' | 'Pending';
    createdDate: string;
}