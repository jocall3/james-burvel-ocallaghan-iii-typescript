// types/models/integration/ledger-account.ts
export interface LedgerAccountBalance {
    credits: number;
    debits: number;
    amount: number;
    currency: string;
    currency_exponent: number;
}

export interface LedgerAccount {
    id: string;
    object: 'ledger_account';
    live_mode: boolean;
    name: string;
    ledger_id: string;
    description: string | null;
    lock_version: number;
    normal_balance: 'debit' | 'credit';
    balances: {
        effective_at_lower_bound: string;
        effective_at_upper_bound: string;
        pending_balance: LedgerAccountBalance;
        posted_balance: LedgerAccountBalance;
        available_balance: LedgerAccountBalance;
    };
    metadata: Record<string, any>;
    discarded_at: string | null;
    created_at: string;
    updated_at: string;
}
