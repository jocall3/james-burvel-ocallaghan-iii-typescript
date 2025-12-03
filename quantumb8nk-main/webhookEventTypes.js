// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

const events = {
    balance_report: {
        events: ["created"],
        name: "Balance Reports",
        documentationUrl: "https://docs.moderntreasury.com/reference/balance-reports",
    },
    expected_payment: {
        name: "Expected Payments",
        events: [
            "created",
            "tentatively_reconciled",
            "reconciled",
            "archived",
            "overdue",
            "unreconciled",
            "partially_reconciled",
        ],
        documentationUrl: "https://docs.moderntreasury.com/reference/expected-payments",
    },
    "expected_payment.async": {
        name: "Expected Payments (Async)",
        events: ["completed", "failed"],
        documentationUrl: "https://docs.moderntreasury.com/reference/expected-payments",
    },
    external_account: {
        events: [
            "created",
            "verified",
            "failed_verification",
            "cancelled",
            "expired",
            "updated",
            "approved",
            "approval_reverted",
            "denied",
        ],
        name: "External Accounts",
        documentationUrl: "https://docs.moderntreasury.com/reference/external-accounts",
    },
    incoming_payment_detail: {
        events: [
            "created",
            "tentatively_reconciled",
            "reconciled",
            "completed",
            "returned",
            "return_failed",
            "unreconciled",
        ],
        name: "Incoming Payment Details",
        documentationUrl: "https://docs.moderntreasury.com/reference/incoming-payment-details",
    },
    ledger_account_balance_monitor: {
        events: ["triggered", "resolved"],
        name: "Ledger Account Balance Monitors",
        documentationUrl: "https://docs.moderntreasury.com/reference/ledger-account-balance-monitors",
    },
    ledger_transaction: {
        events: ["posted", "created", "archived"],
        name: "Ledger Transactions",
        documentationUrl: "https://docs.moderntreasury.com/reference/ledger-transactions",
    },
    ledger_account_settlement: {
        events: ["finish_processing", "finish_archiving", "pending", "posted"],
        name: "Ledger Account Settlements",
        documentationUrl: "https://docs.moderntreasury.com/reference/ledger-account-settlements",
    },
    ledgerable_event: {
        events: ["created"],
        name: "Ledgerable Event",
        documentationUrl: "https://docs.moderntreasury.com/reference/ledgerable-events",
    },
    ledger_event_handler: {
        events: ["created", "deleted"],
        name: "Ledger Event Handler",
        documentationUrl: "https://docs.moderntreasury.com/reference/ledger-event-handlers",
    },
    paper_item: {
        events: [
            "created",
            "tentatively_reconciled",
            "reconciled",
            "completed",
            "returned",
            "unreconciled",
        ],
        name: "Paper Items",
        documentationUrl: "https://docs.moderntreasury.com/reference/paper-items",
    },
    payment_order: {
        events: [
            "created",
            "failed",
            "approved",
            "approval_reverted",
            "denied",
            "cancelled",
            "begin_processing",
            "finish_processing",
            "acknowledged",
            "confirmed",
            "tentatively_reconciled",
            "completed",
            "returned",
            "redrafted",
            "reversed",
            "nsf_deferment",
            "nsf_plaid_error_but_processing",
            "updated",
            "unreconciled",
        ],
        name: "Payment Orders",
        documentationUrl: "https://docs.moderntreasury.com/reference/payment-orders",
    },
    payment_reference: {
        events: ["created"],
        name: "Payment References",
        documentationUrl: "https://docs.moderntreasury.com/reference/payment-references",
    },
    return: {
        events: [
            "created",
            "begin_processing",
            "finish_processing",
            "tentatively_reconciled",
            "reconciled",
            "completed",
            "returned",
            "failed",
            "unreconciled",
        ],
        name: "Returns",
        documentationUrl: "https://docs.moderntreasury.com/reference/returns",
    },
    reversal: {
        events: [
            "begin_processing",
            "finish_processing",
            "completed",
            "failed",
            "returned",
            "unreconciled",
        ],
        name: "Reversals",
        documentationUrl: "https://docs.moderntreasury.com/reference/reversals-1",
    },
    transaction: {
        events: ["created", "reconciled", "updated"],
        name: "Transactions",
        documentationUrl: "https://docs.moderntreasury.com/reference/transactions",
    },
    virtual_account: {
        events: ["created", "updated", "deleted"],
        name: "Virtual Accounts",
        documentationUrl: "https://docs.moderntreasury.com/reference/virtual-account-webhooks",
    },
    user_onboarding: {
        events: ["approved", "denied", "needs_approval", "expired"],
        name: "User Onboardings",
        documentationUrl: "https://docs.moderntreasury.com/reference/user-onboardings",
    },
    decision: {
        events: ["needs_approval", "approved", "denied", "cancelled"],
        name: "Decisions",
        documentationUrl: "https://docs.moderntreasury.com/reference/decisions",
    },
    case: {
        events: ["opened", "resolved"],
        name: "Cases",
        documentationUrl: "https://docs.moderntreasury.com/reference/cases",
    },
    invoice: {
        events: [
            "created",
            "unpaid",
            "payment_pending",
            "paid",
            "voided",
            "overdue",
        ],
        name: "Invoices",
        documentationUrl: "https://docs.moderntreasury.com/reference/invoices",
    },
    // TODO: (wilsonzhu) update documentation url
    bulk_request: {
        events: ["pending", "processing", "completed"],
        name: "Bulk Requests",
        documentationUrl: "https://docs.moderntreasury.com/platform/reference/bulk-requests",
    },
    // TODO: (wilsonzhu) update documentation url
    bulk_result: {
        events: ["pending", "successful", "failed"],
        name: "Bulk Results",
        documentationUrl: "https://docs.moderntreasury.com/platform/reference/bulk-results",
    },
};

export default events;