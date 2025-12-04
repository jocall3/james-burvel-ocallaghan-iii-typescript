// data/ledgerAccounts.ts
import { LedgerAccount } from '../types';

export const MOCK_LEDGER_ACCOUNTS: LedgerAccount[] = [
  {
    "id": "690eed62-5b6c-45ee-a474-f54905133866", "object": "ledger_account", "live_mode": false, "name": "Operating Bank Account", "ledger_id": "fe96565f-4b9c-4871-8fb0-e6f02683458e", "description": null, "lock_version": 0, "normal_balance": "debit",
    "balances": { "effective_at_lower_bound": "2020-08-04T16:54:32Z", "effective_at_upper_bound": "2021-08-04T16:54:32Z", "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 500000, "debits": 1250000, "amount": 750000, "currency": "USD", "currency_exponent": 2 }, "available_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } },
    "metadata": {}, "discarded_at": null, "created_at": "2022-11-01T20:57:31Z", "updated_at": "2022-11-01T20:57:31Z"
  },
  {
    "id": "1a2b3c4d-5b6c-45ee-a474-f54905133866", "object": "ledger_account", "live_mode": false, "name": "Credit Card Liability", "ledger_id": "fe96565f-4b9c-4871-8fb0-e6f02683458e", "description": null, "lock_version": 0, "normal_balance": "credit",
    "balances": { "effective_at_lower_bound": "2020-08-04T16:54:32Z", "effective_at_upper_bound": "2021-08-04T16:54:32Z", "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 250000, "debits": 50000, "amount": -200000, "currency": "USD", "currency_exponent": 2 }, "available_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } },
    "metadata": {}, "discarded_at": null, "created_at": "2022-11-01T20:57:31Z", "updated_at": "2022-11-01T20:57:31Z"
  },
    {
    "id": "5e6f7g8h-5b6c-45ee-a474-f54905133866", "object": "ledger_account", "live_mode": false, "name": "Revenue", "ledger_id": "fe96565f-4b9c-4871-8fb0-e6f02683458e", "description": null, "lock_version": 0, "normal_balance": "credit",
    "balances": { "effective_at_lower_bound": "2020-08-04T16:54:32Z", "effective_at_upper_bound": "2021-08-04T16:54:32Z", "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 1500000, "debits": 100000, "amount": -1400000, "currency": "USD", "currency_exponent": 2 }, "available_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } },
    "metadata": {}, "discarded_at": null, "created_at": "2022-11-01T20:57:31Z", "updated_at": "2022-11-01T20:57:31Z"
  },
  {
    "id": "9i0j1k2l-5b6c-45ee-a474-f54905133866", "object": "ledger_account", "live_mode": false, "name": "Marketing Expenses", "ledger_id": "fe96565f-4b9c-4871-8fb0-e6f02683458e", "description": null, "lock_version": 0, "normal_balance": "debit",
    "balances": { "effective_at_lower_bound": "2020-08-04T16:54:32Z", "effective_at_upper_bound": "2021-08-04T16:54:32Z", "pending_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 }, "posted_balance": { "credits": 0, "debits": 300000, "amount": 300000, "currency": "USD", "currency_exponent": 2 }, "available_balance": { "credits": 0, "debits": 0, "amount": 0, "currency": "USD", "currency_exponent": 2 } },
    "metadata": {}, "discarded_at": null, "created_at": "2022-11-01T20:57:31Z", "updated_at": "2022-11-01T20:57:31Z"
  }
];
