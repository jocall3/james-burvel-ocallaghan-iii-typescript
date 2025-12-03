// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

// --- Core Financial Data Types ---

/**
 * Represents a specific balance type for an account,
 * e.g., 'available', 'pending', 'actual', 'ledger'.
 */
type BalanceEntry = {
  /** A unique identifier for the balance entry. */
  id: string;
  /** The currency code (e.g., 'USD', 'EUR'). */
  currency: string;
  /** The amount of the balance, typically in the smallest currency unit (e.g., cents for USD). */
  amount: number;
  /** The type of balance (e.g., 'available', 'pending', 'actual', 'ledger', 'pre-authorized'). */
  balanceType: 'available' | 'pending' | 'actual' | 'ledger' | 'pre-authorized' | 'book';
  /** The date and time this balance was recorded, in ISO 8601 format. */
  asOfDate: string;
  /** Additional metadata for the balance. */
  metadata?: Record<string, string>;
};

/**
 * Represents a single financial transaction.
 */
type Transaction = {
  /** Unique identifier for the transaction. */
  id: string;
  /** A descriptive summary of the transaction. */
  description: string;
  /** The amount of the transaction, positive for credits, negative for debits. */
  amount: number;
  /** The currency code of the transaction. */
  currency: string;
  /** The type of transaction (e.g., 'credit', 'debit'). */
  type: 'credit' | 'debit';
  /** The current status of the transaction (e.g., 'pending', 'booked', 'failed', 'cancelled'). */
  status: 'pending' | 'booked' | 'failed' | 'cancelled';
  /** The date and time when the transaction was posted/booked, in ISO 8601 format. */
  postedDate: string;
  /** The date and time when the transaction was initiated, in ISO 8601 format. */
  initiationDate: string;
  /** Optional date for when the transaction is expected to settle. */
  settlementDate?: string;
  /** Reference to an external ledger ID for reconciliation purposes. */
  externalLedgerId?: string;
  /** The system where this transaction originated. */
  sourceSystem: 'modern-treasury' | 'stripe' | 'plaid' | 'citibank' | 'internal-transfer';
  /** Categorization tags for the transaction. */
  category?: string;
  /** Additional parties involved in the transaction. */
  counterparty?: {
    name: string;
    id?: string;
    type?: 'individual' | 'business';
  };
  /** Detailed transaction metadata. */
  metadata?: Record<string, string>;
  /** Unique identifier for the related account. */
  accountId: string;
  /** Optional identifier for the payment order that created this transaction. */
  paymentOrderId?: string;
  /** Optional reference to an invoice or bill. */
  invoiceReference?: string;
};

/**
 * Represents a discrepancy identified during reconciliation.
 */
type Discrepancy = {
  /** Unique ID for the discrepancy. */
  id: string;
  /** Type of discrepancy (e.g., 'transaction_mismatch', 'balance_variance', 'missing_transaction'). */
  type: 'transaction_mismatch' | 'balance_variance' | 'missing_transaction' | 'duplicate_transaction' | 'unexplained_variance' | 'service_error' | 'reconciliation_error' | 'runtime_exception';
  /** Description of the discrepancy. */
  description: string;
  /** Related transaction IDs causing the discrepancy. */
  relatedTransactionIds?: string[];
  /** Related balance types causing the discrepancy. */
  relatedBalanceTypes?: string[];
  /** Proposed action to resolve the discrepancy (e.g., 'adjust_ledger', 'investigate_further'). */
  suggestedResolution?: string;
  /** Current status of the discrepancy. */
  status: 'open' | 'investigating' | 'resolved' | 'ignored';
  /** Date when the discrepancy was identified, in ISO 8601 format. */
  identifiedDate: string;
  /** Analyst assigned to resolve, if any. */
  assignedTo?: string;
  /** Timestamp when the status was last updated, in ISO 8601 format. */
  lastUpdated?: string;
  /** Notes regarding the resolution or investigation. */
  resolutionNotes?: string;
};

/**
 * Represents the detailed view of a synchronized financial account.
 */
type SyncedAccountDetails = {
  /** Unique identifier for the account (e.g., Modern Treasury ID). */
  id: string;
  /** Display name of the account. */
  name: string;
  /** Primary currency of the account. */
  currency: string;
  /** Type of the financial account (e.g., 'checking', 'savings', 'money_market'). */
  accountType: 'checking' | 'savings' | 'money_market' | 'credit_card' | 'loan' | 'wallet';
  /** List of current balances for the account. */
  balances: BalanceEntry[];
  /** List of recent transactions associated with the account. */
  transactions: Transaction[];
  /** The last date and time when data for this account was successfully synchronized, in ISO 8601 format. */
  lastSyncDate: string | null;
  /** Overall reconciliation status of the account. */
  reconciliationStatus: 'synced' | 'pending_reconciliation' | 'discrepancy' | 'failed_reconciliation' | 'not_reconciled';
  /** List of identified discrepancies for the account. */
  discrepancies: Discrepancy[];
  /** Connection status to the underlying financial institution/gateway. */
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'pending';
  /** A unique identifier representing the underlying financial institution. */
  institutionId?: string;
  /** Bank-specific details like routing number, account number (masked). */
  bankDetails?: {
    routingNumber: string;
    accountNumberMasked: string;
    bankName: string;
  };
  /** Additional metadata specific to the account. */
  metadata?: Record<string, string>;
  /** Current version of the account data schema. */
  dataSchemaVersion: string;
  /** Time of the next scheduled sync, if applicable. */
  nextScheduledSync?: string;
  /** Configuration for transaction fetching (e.g., 'last_30_days', 'all'). */
  transactionFetchConfig: 'last_30_days' | 'last_90_days' | 'custom_range' | 'all_time';
};

// --- Hook State Types ---

/**
 * Represents the overall state managed by the `useModernTreasuryAccountSync` hook.
 */
type ModernTreasurySyncState = {
  /** Indicates if any synchronization or reconciliation operation is currently in progress. */
  isLoading: boolean;
  /** Any error message encountered during operations, or null if no error. */
  error: string | null;
  /** A map of account IDs to their detailed synchronization status and data. */
  accounts: Record<string, SyncedAccountDetails>;
  /** Last general operation timestamp, in ISO 8601 format. */
  lastOperationTimestamp: string | null;
  /** Status of the overall connection to Modern Treasury service. */
  serviceConnectionStatus: 'operational' | 'degraded' | 'unavailable';
  /** Total number of accounts actively being monitored. */
  activeMonitoredAccountsCount: number;
  /** Timestamp of the last successful full sync across all active accounts, in ISO 8601 format. */
  lastFullSyncGlobalTimestamp: string | null;
};

/**
 * The tuple type for the return value of the `useModernTreasuryAccountSync` hook,
 * providing state, actions, and derived data.
 */
type UseModernTreasuryAccountSyncType = [
  ModernTreasurySyncState,
  /**
   * Function to trigger a synchronization for specified account IDs. Fetches latest balances and transactions.
   * If `accountIds` is empty, it attempts to refresh all accounts currently tracked by the hook.
   * @param accountIds An array of account IDs to synchronize.
   * @param options Options for the sync operation, e.g., force refresh, fetch period.
   * @returns A Promise that resolves when the sync operation is complete.
   */
  (
    accountIds: string[],
    options?: { forceRefresh?: boolean; fetchPeriod?: 'latest' | 'full' | 'past_week' | 'past_month' },
  ) => Promise<void>,
  /**
   * Function to trigger a reconciliation for a specific account. This process compares transactions
   * and balances against an internal ledger or another source to identify discrepancies.
   * @param accountId The ID of the account to reconcile.
   * @param options Options for the reconciliation operation, e.g., compare with external ledger.
   * @returns A Promise that resolves when the reconciliation is complete.
   */
  (
    accountId: string,
    options?: { externalLedgerId?: string; reconcileType?: 'full' | 'transaction_only' | 'balance_only' },
  ) => Promise<void>,
  /**
   * Function to update the status of a specific discrepancy for an account.
   * This is typically used by an analyst to mark discrepancies as resolved or under investigation.
   * @param accountId The ID of the account the discrepancy belongs to.
   * @param discrepancyId The ID of the discrepancy to update.
   * @param newStatus The new status for the discrepancy.
   * @param resolutionNotes Optional notes for the resolution.
   * @returns A Promise that resolves when the discrepancy status is updated.
   */
  (
    accountId: string,
    discrepancyId: string,
    newStatus: Discrepancy['status'],
    resolutionNotes?: string,
  ) => Promise<void>,
  /**
   * Function to update the `modernTreasuryAccountIds` query parameter in the URL.
   * This allows external components to control which accounts are being monitored
   * by modifying the URL.
   * @param accountIds The new array of account IDs to set in the URL.
   * @param updateRoute If true, updates the browser history. Defaults to true.
   * @returns The updated URLSearchParams object.
   */
  (accountIds: string[], updateRoute?: boolean) => URLSearchParams,
  /**
   * Function to get detailed balance breakdown for an account.
   * @param accountId The ID of the account.
   * @returns An array of BalanceEntry for the specified account, or undefined if not found.
   */
  (accountId: string) => BalanceEntry[] | undefined,
  /**
   * Function to get filtered transactions for an account.
   * Provides flexible filtering options for various transaction attributes.
   * @param accountId The ID of the account.
   * @param filters Optional filters for transactions (e.g., by status, type, category, date range).
   * @returns An array of filtered transactions.
   */
  (
    accountId: string,
    filters?: {
      status?: Transaction['status'];
      type?: Transaction['type'];
      category?: string;
      startDate?: string;
      endDate?: string;
      sourceSystem?: Transaction['sourceSystem'];
      minAmount?: number;
      maxAmount?: number;
    },
  ) => Transaction[],
  /**
   * Provides a summary of an account's financial status.
   * Includes aggregated metrics like total balance, available balance, transaction count, and open discrepancies.
   * @param accountId The ID of the account.
   * @returns An object containing summary metrics, or undefined if account not found.
   */
  (accountId: string) => { totalBalance: number; availableBalance: number; pendingBalance: number; totalTransactions: number; openDiscrepancies: number } | undefined,
  /**
   * Retrieves transactions for a specific account within a given date range.
   * This is a specialized helper built on `getFilteredTransactions`.
   * @param accountId The ID of the account.
   * @param startDate The start date (inclusive) in ISO 8601 format.
   * @param endDate The end date (inclusive) in ISO 8601 format.
   * @returns An array of transactions within the specified range.
   */
  (accountId: string, startDate: string, endDate: string) => Transaction[],
];

/**
 * Utility to generate a unique ID.
 * In a production system, this would typically be a robust UUID generator (e.g., 'uuid' library).
 * For "no imports" constraint, we simulate a reasonably unique ID.
 */
const generateUniqueId = (): string => {
  const timestamp = new Date().getTime().toString(16);
  const randomPart = Math.random().toString(16).substring(2, 10);
  return `id_${timestamp}_${randomPart}`;
};

/**
 * Global variable simulation for React hooks like useState, useEffect, useRef.
 * In a typical React project, these are imported from 'react'.
 * For this exercise's 'no imports' constraint, we assume they're available in the global scope
 * or implicitly handled by the TypeScript/Babel setup for JSX runtime.
 * We include placeholder declarations to prevent TypeScript errors in isolation.
 */
declare const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
declare const useEffect: (effect: () => (void | (() => void)), deps?: any[]) => void;
declare const useRef: <T>(initialValue: T) => { current: T };
declare const window: Window & typeof globalThis & { setInterval: (handler: TimerHandler, timeout?: number, ...arguments: any[]) => number; clearInterval: (handle?: number) => void; };


/**
 * A sophisticated React hook responsible for synchronizing and managing financial account data
 * with Modern Treasury, including fetching balances, transactions, and reconciling discrepancies.
 * This hook is driven by account IDs specified in URL query parameters and provides
 * extensive capabilities for financial operations, acting as a facade over various financial
 * integrations (Modern Treasury, Stripe, Plaid, Citibank) via `citibankdemobusiness.dev` API.
 *
 * It incorporates simulated API calls, robust error handling, background polling for updates,
 * and advanced data retrieval/filtering mechanisms, making it suitable for a high-value financial application.
 */
function useModernTreasuryAccountSync(): UseModernTreasuryAccountSyncType {
  const [syncState, setSyncState] = useState<ModernTreasurySyncState>({
    isLoading: false,
    error: null,
    accounts: {},
    lastOperationTimestamp: null,
    serviceConnectionStatus: 'operational',
    activeMonitoredAccountsCount: 0,
    lastFullSyncGlobalTimestamp: null,
  });

  // useRef to hold a reference to the polling interval, allowing it to be cleared cleanly.
  const pollingIntervalRef = useRef<number | null>(null);

  // --- Utility functions for URL Query Parameters (mimicking useQueryParams.tsx) ---
  /**
   * Extracts `modernTreasuryAccountIds` from the current URL query parameters.
   * These IDs are expected to be a JSON-encoded array of strings.
   * @returns An array of account IDs found in the URL, or an empty array if not present or invalid.
   */
  const getAccountIdsFromQueryParams = (): string[] => {
    try {
      const allSearchParams = new URLSearchParams(window.location.search);
      const accountIdsParam = allSearchParams.get('modernTreasuryAccountIds');
      if (accountIdsParam) {
        return JSON.parse(decodeURIComponent(accountIdsParam)) as string[];
      }
    } catch (e) {
      console.error("useModernTreasuryAccountSync: Failed to parse 'modernTreasuryAccountIds' from URL, defaulting to empty array.", e);
    }
    return [];
  };

  /**
   * Sets the `modernTreasuryAccountIds` query parameter in the URL.
   * Encodes the array of account IDs into a JSON string and updates the URL.
   * @param accountIds The new array of account IDs to set.
   * @param updateRoute If true, updates the browser's history using `replaceState`. Defaults to true.
   * @returns The updated `URLSearchParams` object.
   */
  const setAccountIdsToQueryParams = (accountIds: string[], updateRoute = true): URLSearchParams => {
    const formattedValue = encodeURIComponent(JSON.stringify(accountIds));
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('modernTreasuryAccountIds', formattedValue);
    const newURL = `?${searchParams.toString()}`;
    if (updateRoute) {
      window.history.replaceState(null, '', newURL);
    }
    console.log(`useModernTreasuryAccountSync: Updated URL query parameter 'modernTreasuryAccountIds' to: ${accountIds.join(', ')}`);
    return searchParams;
  };

  // --- Date Utility Helpers ---
  /**
   * Generates a random ISO 8601 date string within a specified range relative to now.
   * @param startDaysAgo The maximum number of days in the past from which to start the range.
   * @param endDaysAgo The minimum number of days in the past (closer to now) for the end of the range.
   * @returns An ISO 8601 formatted date string.
   */
  const getRandomDate = (startDaysAgo: number, endDaysAgo: number): string => {
    const now = new Date();
    const start = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
    const end = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString();
  };

  /**
   * Generates a realistic mock `Transaction` object for simulation purposes.
   * @param accountId The ID of the account this transaction belongs to.
   * @param index A sequential index to help generate unique details.
   * @param baseDate The date around which transaction dates should be generated.
   * @param sourceOverride Optional override for the transaction's source system.
   * @returns A fully populated `Transaction` object.
   */
  const generateMockTransaction = (
    accountId: string,
    index: number,
    baseDate: Date,
    sourceOverride?: Transaction['sourceSystem'],
  ): Transaction => {
    const transactionId = `tx_${accountId}_${generateUniqueId().slice(-8)}`;
    const rawAmount = Math.floor(Math.random() * 5000000) - 2000000; // -20000.00 to 30000.00 USD (in cents)
    const type: Transaction['type'] = rawAmount > 0 ? 'credit' : 'debit';
    const status: Transaction['status'] = Math.random() > 0.9 ? 'pending' : (Math.random() > 0.95 ? 'failed' : 'booked');
    const sources: Transaction['sourceSystem'][] = ['modern-treasury', 'stripe', 'plaid', 'citibank', 'internal-transfer'];
    const sourceSystem = sourceOverride || sources[Math.floor(Math.random() * sources.length)];

    const categories = ['Groceries', 'Rent', 'Salary', 'Investment', 'Utilities', 'Transportation', 'Entertainment', 'Transfer', 'Payout', 'Fee', 'Payroll', 'Merchant Payment', 'Loan Repayment'];
    const descriptionPrefixes = {
      'modern-treasury': ['MT Transfer Out', 'MT Transfer In', 'MT Wire Payment', 'MT ACH Collection'],
      'stripe': ['Stripe Payout', 'Stripe Refund', 'Stripe Chargeback Adjustment'],
      'plaid': ['Plaid Linked Debit', 'Plaid Linked Deposit', 'Plaid Investment Transfer'],
      'citibank': ['Citi Internal Transfer', 'Citi Bill Pay', 'Citi Deposit'],
      'internal-transfer': ['Internal Funds Move', 'Inter-Company Transfer'],
      'default': ['Miscellaneous Financial Activity']
    };
    const descriptions = descriptionPrefixes[sourceSystem] || descriptionPrefixes.default;
    const description = descriptions[Math.floor(Math.random() * descriptions.length)] + ` #${index}`;

    const postedDate = new Date(baseDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000); // Up to 10 days before baseDate
    const initiationDate = new Date(postedDate.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000); // Up to 2 days before postedDate
    const settlementDate = status === 'pending' ? new Date(postedDate.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined;

    return {
      id: transactionId,
      description,
      amount: Math.abs(rawAmount), // Amount should always be positive, type indicates direction
      currency: 'USD',
      type,
      status,
      postedDate: postedDate.toISOString(),
      initiationDate: initiationDate.toISOString(),
      settlementDate,
      externalLedgerId: `ext_LGR_${generateUniqueId().slice(-10)}`,
      sourceSystem,
      category: categories[Math.floor(Math.random() * categories.length)],
      counterparty: {
        name: `Counterparty ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 999)}`,
        id: `cpt_${generateUniqueId().slice(-8)}`,
        type: Math.random() > 0.5 ? 'business' : 'individual',
      },
      metadata: {
        reference_code: `REF-${Math.floor(Math.random() * 1000000)}`,
        payment_rail: Math.random() > 0.6 ? 'ACH' : (Math.random() > 0.3 ? 'Wire' : 'RTP'),
        trace_id: `TRACE-${generateUniqueId().slice(-12)}`,
      },
      accountId: accountId,
      paymentOrderId: Math.random() > 0.7 ? `po_${generateUniqueId().slice(-8)}` : undefined,
      invoiceReference: Math.random() > 0.6 ? `INV-${Math.floor(Math.random() * 99999)}` : undefined,
    };
  };

  /**
   * Generates mock `BalanceEntry` objects for an account.
   * @param accountId The ID of the account.
   * @param baseAmount The foundational 'actual' balance amount in cents.
   * @returns An array of `BalanceEntry` objects for different balance types.
   */
  const generateMockBalances = (accountId: string, baseAmount: number): BalanceEntry[] => {
    const currentTimestamp = new Date().toISOString();
    const availableAmount = Math.max(0, baseAmount - Math.floor(Math.random() * 1000000)); // Up to 10k less than base
    const pendingAmount = Math.floor(Math.random() * 500000); // Up to 5k pending
    const bookBalance = baseAmount + Math.floor(Math.random() * 50000); // Up to 500 extra in book balance
    const ledgerBalance = bookBalance + Math.floor(Math.random() * 10000) - 5000; // Small variance from book

    return [
      { id: generateUniqueId(), currency: 'USD', amount: availableAmount, balanceType: 'available', asOfDate: currentTimestamp, metadata: { source: 'ModernTreasury' } },
      { id: generateUniqueId(), currency: 'USD', amount: pendingAmount, balanceType: 'pending', asOfDate: currentTimestamp, metadata: { source: 'ModernTreasury' } },
      { id: generateUniqueId(), currency: 'USD', amount: ledgerBalance, balanceType: 'ledger', asOfDate: currentTimestamp, metadata: { source: 'InternalLedger' } },
      { id: generateUniqueId(), currency: 'USD', amount: bookBalance, balanceType: 'book', asOfDate: currentTimestamp, metadata: { source: 'CitibankAPI' } },
      { id: generateUniqueId(), currency: 'USD', amount: baseAmount, balanceType: 'actual', asOfDate: currentTimestamp, metadata: { source: 'ModernTreasury' } },
      { id: generateUniqueId(), currency: 'USD', amount: Math.floor(Math.random() * 200000), balanceType: 'pre-authorized', asOfDate: currentTimestamp, metadata: { source: 'Stripe' } },
    ];
  };

  /**
   * Generates a full mock `SyncedAccountDetails` object for a given account ID.
   * This function can simulate incremental updates or a full refresh based on parameters.
   * @param accountId The ID of the account to generate details for.
   * @param existingAccount Optional existing account data to simulate incremental updates.
   * @param forceRefresh If true, regenerates all transactions and balances.
   * @param fetchPeriod Specifies the range for fetching transactions ('latest', 'full', 'past_week', 'past_month').
   * @returns A fully populated `SyncedAccountDetails` object.
   */
  const generateMockAccountDetails = (
    accountId: string,
    existingAccount?: SyncedAccountDetails,
    forceRefresh = false,
    fetchPeriod: 'latest' | 'full' | 'past_week' | 'past_month' = 'latest',
  ): SyncedAccountDetails => {
    const now = new Date();
    let transactions: Transaction[] = existingAccount && !forceRefresh ? [...existingAccount.transactions] : [];
    let baseBalance = existingAccount?.balances.find(b => b.balanceType === 'actual')?.amount || 50000000; // Default 500k USD

    // Determine the oldest transaction date currently available in the hook's state
    const oldestTransactionDate = transactions.length > 0
      ? new Date(Math.min(...transactions.map(t => new Date(t.postedDate).getTime())))
      : new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000); // Default to 120 days ago if no transactions

    let numNewTransactions = 0;
    const today = new Date();

    if (fetchPeriod === 'full' || forceRefresh) {
      transactions = []; // Clear for full refresh
      const numTransactions = 80 + Math.floor(Math.random() * 120); // 80-200 transactions
      for (let i = 0; i < numTransactions; i++) {
        // Generate transactions up to 120 days old
        transactions.push(generateMockTransaction(accountId, i, new Date(today.getTime() - Math.random() * 120 * 24 * 60 * 60 * 1000)));
      }
      numNewTransactions = numTransactions;
    } else {
      let daysRange = 0;
      if (fetchPeriod === 'past_week') daysRange = 7;
      else if (fetchPeriod === 'past_month') daysRange = 30;
      else daysRange = 3; // 'latest' for a few new transactions

      const newTransactionsCount = Math.floor(Math.random() * 5) + (fetchPeriod !== 'latest' ? 5 : 0); // 0-4 for latest, 5-9 for others
      for (let i = 0; i < newTransactionsCount; i++) {
        // Generate transactions within the specified daysRange (or recent days for 'latest')
        transactions.push(generateMockTransaction(accountId, i + transactions.length, new Date(today.getTime() - Math.random() * daysRange * 24 * 60 * 60 * 1000)));
      }
      numNewTransactions = newTransactionsCount;
    }

    // Update base balance based on new transactions, if any were added/refreshed
    if (numNewTransactions > 0) {
      const relevantTransactions = transactions.filter(tx => new Date(tx.postedDate) > oldestTransactionDate);
      const netChange = relevantTransactions.reduce((sum, tx) => sum + (tx.type === 'credit' ? tx.amount : -tx.amount), 0);
      baseBalance = baseBalance + netChange;
    }

    // Ensure transactions are sorted by posted date, newest first
    transactions.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

    const reconciliationStatus: SyncedAccountDetails['reconciliationStatus'] = Math.random() > 0.95 ? 'discrepancy' : 'synced'; // 5% chance of discrepancy
    const discrepancies: Discrepancy[] = reconciliationStatus === 'discrepancy' ? [
      {
        id: generateUniqueId(),
        type: Math.random() > 0.5 ? 'transaction_mismatch' : 'balance_variance',
        description: Math.random() > 0.5 ? `Transaction ID ${transactions[0]?.id || 'N/A'} in Modern Treasury not found in internal ledger.` : `Available balance differs by $${(Math.floor(Math.random() * 50000) / 100).toFixed(2)} USD.`,
        status: 'open',
        identifiedDate: now.toISOString(),
        suggestedResolution: 'Investigate and manually reconcile or adjust ledger.',
        relatedTransactionIds: [transactions[0]?.id].filter(Boolean) as string[],
        lastUpdated: now.toISOString(),
      },
      {
        id: generateUniqueId(),
        type: 'missing_transaction',
        description: 'Plaid report indicates missing payroll deposit from internal ledger. Investigate source.',
        status: 'open',
        identifiedDate: now.toISOString(),
        suggestedResolution: 'Verify payroll processing with HR and finance teams.',
        relatedTransactionIds: [transactions.find(tx => tx.sourceSystem === 'plaid')?.id].filter(Boolean) as string[],
        assignedTo: 'Jane Doe',
        lastUpdated: now.toISOString(),
      },
      {
        id: generateUniqueId(),
        type: 'duplicate_transaction',
        description: 'Potential duplicate transaction identified: tx_duplicate_123. Review for accuracy.',
        status: 'investigating',
        identifiedDate: now.toISOString(),
        suggestedResolution: 'Confirm with payment processor; void or ignore duplicate if confirmed.',
        lastUpdated: now.toISOString(),
      }
    ] : [];

    return {
      id: accountId,
      name: existingAccount?.name || `Citibank MT Account ${accountId.slice(-6)}`,
      currency: existingAccount?.currency || 'USD',
      accountType: existingAccount?.accountType || (Math.random() > 0.7 ? 'checking' : 'money_market'),
      balances: generateMockBalances(accountId, baseBalance),
      transactions,
      lastSyncDate: now.toISOString(),
      reconciliationStatus: reconciliationStatus,
      discrepancies: discrepancies,
      connectionStatus: Math.random() > 0.02 ? 'connected' : 'error', // 2% chance of connection error
      institutionId: existingAccount?.institutionId || `inst_${generateUniqueId().slice(-8)}`,
      bankDetails: existingAccount?.bankDetails || {
        routingNumber: `0${Math.floor(100000000 + Math.random() * 900000000)}`, // 9-digit routing number
        accountNumberMasked: `XXXX-${Math.floor(1000 + Math.random() * 9000)}`, // Masked last 4 digits
        bankName: 'Citibank N.A.',
      },
      metadata: existingAccount?.metadata || {
        owner_id: 'user_citibankdemo_executive',
        department: 'Treasury Operations',
        region: 'North America',
      },
      dataSchemaVersion: '1.2.0',
      nextScheduledSync: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), // Schedule next sync in 1 hour
      transactionFetchConfig: existingAccount?.transactionFetchConfig || 'last_90_days',
    };
  };

  /**
   * Simulates the complex reconciliation process. This involves comparing transactions and balances
   * against an internal ledger, matching transactions across different source systems (MT, Stripe, Plaid),
   * and identifying various types of variances.
   * @param currentAccount The current `SyncedAccountDetails` object for the account being reconciled.
   * @param reconciliationPayload Optional payload for reconciliation parameters (e.g., external ledger ID).
   * @returns An object detailing the reconciliation outcome, including status, new discrepancies, and reconciled transactions.
   */
  const simulateReconciliation = (
    currentAccount: SyncedAccountDetails,
    reconciliationPayload?: { externalLedgerId?: string; reconcileType?: 'full' | 'transaction_only' | 'balance_only' },
  ): {
    status: SyncedAccountDetails['reconciliationStatus'];
    discrepancies: Discrepancy[];
    reconciledTransactions: Transaction[];
  } => {
    const now = new Date().toISOString();
    const newDiscrepancies: Discrepancy[] = [];
    let reconciledTransactions: Transaction[] = JSON.parse(JSON.stringify(currentAccount.transactions)); // Deep copy to modify

    let overallStatus: SyncedAccountDetails['reconciliationStatus'] = 'synced';

    // 1. Simulate balance comparison if 'full' or 'balance_only' reconciliation
    if (reconciliationPayload?.reconcileType === 'full' || reconciliationPayload?.reconcileType === 'balance_only' || !reconciliationPayload?.reconcileType) {
      const mtActualBalance = currentAccount.balances.find(b => b.balanceType === 'actual')?.amount || 0;
      // Simulate external ledger balance with a small, random variance
      const internalLedgerBalance = mtActualBalance + (Math.random() > 0.9 ? Math.floor(Math.random() * 10000) - 5000 : 0);
      if (mtActualBalance !== internalLedgerBalance) {
        newDiscrepancies.push({
          id: generateUniqueId(),
          type: 'balance_variance',
          description: `Actual balance ($${(mtActualBalance / 100).toFixed(2)} USD) differs from internal ledger ($${(internalLedgerBalance / 100).toFixed(2)} USD). Variance: $${((mtActualBalance - internalLedgerBalance) / 100).toFixed(2)} USD.`,
          status: 'open',
          identifiedDate: now,
          suggestedResolution: 'Investigate balance history, recent transactions, and external ledger entries. Manual adjustment may be required.',
          relatedBalanceTypes: ['actual', 'ledger'],
          lastUpdated: now,
        });
        overallStatus = 'discrepancy';
      }
    }

    // 2. Simulate transaction matching and discrepancy identification if 'full' or 'transaction_only' reconciliation
    if (reconciliationPayload?.reconcileType === 'full' || reconciliationPayload?.reconcileType === 'transaction_only' || !reconciliationPayload?.reconcileType) {
      const externalLedgerTxMap = new Map<string, Transaction>();
      // Simulate mapping internal transactions to a conceptual external ledger
      currentAccount.transactions.forEach((tx, index) => {
        // 5% chance a booked transaction is "not found in external ledger"
        if (tx.status === 'booked' && Math.random() < 0.05 && !tx.externalLedgerId) {
          newDiscrepancies.push({
            id: generateUniqueId(),
            type: 'missing_transaction',
            description: `Transaction ${tx.id} (${tx.description}) found in Modern Treasury but could not be definitively matched in external ledger.`,
            status: 'open',
            identifiedDate: now,
            suggestedResolution: 'Verify transaction against external system (e.g., Stripe, Plaid) and manually match if legitimate.',
            relatedTransactionIds: [tx.id],
            lastUpdated: now,
          });
          overallStatus = 'discrepancy';
        } else {
          // Simulate finding in external ledger and potentially updating status to 'booked' if it was 'pending'
          const txIndex = reconciledTransactions.findIndex(rt => rt.id === tx.id);
          if (txIndex !== -1) {
            reconciledTransactions[txIndex] = {
              ...reconciledTransactions[txIndex],
              status: 'booked', // Reconciliation confirms booking
              externalLedgerId: reconciliationPayload?.externalLedgerId || tx.externalLedgerId || `ext_LGR_${tx.id.slice(-8)}`,
              metadata: { ...reconciledTransactions[txIndex].metadata, reconciled_at: now },
            };
          }
          externalLedgerTxMap.set(tx.id, reconciledTransactions[txIndex]);
        }
      });

      // Simulate "extra" transactions that might only exist in the external ledger initially
      if (Math.random() < 0.05) { // 5% chance of a new "external" transaction
        const newExternalTx = generateMockTransaction(currentAccount.id, currentAccount.transactions.length + 1, new Date(), 'citibank');
        newExternalTx.description = 'Newly identified transaction from Citibank external ledger during reconciliation.';
        newExternalTx.externalLedgerId = `ext_LGR_${generateUniqueId().slice(-10)}`;
        newExternalTx.status = 'booked';
        reconciledTransactions.push(newExternalTx);
        newDiscrepancies.push({
          id: generateUniqueId(),
          type: 'missing_transaction', // Missing from MT, but found in external
          description: `External ledger transaction ${newExternalTx.id} found, not present in Modern Treasury feed. Added to reconciled list.`,
          status: 'resolved', // Mark as resolved because it was added
          identifiedDate: now,
          suggestedResolution: 'Ensure all external transactions are synced to Modern Treasury or appropriate systems.',
          relatedTransactionIds: [newExternalTx.id],
          lastUpdated: now,
        });
        overallStatus = 'discrepancy'; // A discrepancy was found and immediately resolved.
      }
    }

    // Filter out discrepancies that might have been resolved by this reconciliation run
    const activeCurrentDiscrepancies = currentAccount.discrepancies.filter(d => d.status === 'open' || d.status === 'investigating');
    const combinedDiscrepancies = [...activeCurrentDiscrepancies, ...newDiscrepancies];

    // Final overall status determination
    if (combinedDiscrepancies.some(d => d.status === 'open' || d.status === 'investigating')) {
      overallStatus = 'discrepancy';
    } else {
      overallStatus = 'synced';
    }

    return {
      status: overallStatus,
      discrepancies: combinedDiscrepancies,
      reconciledTransactions: reconciledTransactions.sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()),
    };
  };

  // --- Comprehensive API Simulation Layer (citibankdemobusiness.dev facade) ---
  /**
   * Simulates an API call to the `citibankdemobusiness.dev` backend.
   * This function acts as the central point for all simulated external data interactions,
   * mimicking network latency, various success/failure scenarios, and complex data responses.
   * In a real application, this would be an actual HTTP client (e.g., Axios or native fetch).
   * @param path The API endpoint path (e.g., `/api/modern-treasury/accounts/abc/sync`).
   * @param method The HTTP method ('GET', 'POST', 'PUT').
   * @param payload Optional request body for 'POST'/'PUT' requests.
   * @param requestOptions Optional parameters like `requestId` for tracing.
   * @returns A Promise resolving to a simulated API response object.
   */
  const simulateApiCall = async (
    path: string,
    method: 'GET' | 'POST' | 'PUT',
    payload?: any,
    requestOptions?: { requestId?: string; idempotencyKey?: string },
  ): Promise<{ status: number; message?: string; data?: any }> => {
    const correlationId = requestOptions?.requestId || generateUniqueId();
    console.log(`[${correlationId}] Simulating API call to citibankdemobusiness.dev${path} [${method}] with payload:`, payload);

    return new Promise((resolve) => {
      // Simulate network latency and processing time
      const latency = 400 + Math.random() * 1600; // 0.4s to 2s
      setTimeout(() => {
        // Simulate various global and transient error conditions
        if (path.includes('/api/health-check') && Math.random() < 0.1) {
          resolve({ status: 500, message: 'Simulated degraded service connection.' });
          return;
        }
        if (Math.random() < 0.03) { // 3% chance of a transient network error on any call
          resolve({ status: 503, message: 'Simulated transient service unavailable error. Please retry after a short delay.' });
          return;
        }
        if (path.includes('/error-simulate')) { // Specific path to trigger error
          resolve({ status: 500, message: 'Simulated internal server error for debugging purposes.' });
          return;
        }

        // --- Simulated /api/modern-treasury/accounts/{accountId}/sync endpoint ---
        if (path.includes('/api/modern-treasury/accounts/') && path.includes('/sync')) {
          const accountIdMatch = path.match(/\/accounts\/([a-zA-Z0-9_]+)\/sync/);
          if (!accountIdMatch || !accountIdMatch[1]) {
            resolve({ status: 400, message: 'Account ID missing for sync operation in path.' });
            return;
          }
          const accountId = accountIdMatch[1];

          // Parse query parameters for sync options
          const urlParams = new URLSearchParams(path.split('?')[1]);
          const forceRefresh = urlParams.get('forceRefresh') === 'true';
          const fetchPeriod: 'latest' | 'full' | 'past_week' | 'past_month' = (urlParams.get('fetchPeriod') as any) || 'latest';

          // Simulate specific account failures
          if (accountId === 'acc_error_connection') {
            resolve({ status: 408, message: `Timeout connecting to financial institution for account ${accountId}.` });
            return;
          }
          if (accountId === 'acc_error_perms') {
            resolve({ status: 403, message: `Permission denied to access account ${accountId}.` });
            return;
          }

          const existingAccount = syncState.accounts[accountId];
          const mockAccountData = generateMockAccountDetails(accountId, existingAccount, forceRefresh, fetchPeriod);

          console.log(`[${correlationId}] Syncing account ${accountId}: Generated ${mockAccountData.transactions.length} transactions, ${mockAccountData.balances.length} balances.`);
          resolve({ status: 200, data: mockAccountData });
          return;
        }

        // --- Simulated /api/modern-treasury/accounts/{accountId}/reconcile endpoint ---
        if (path.includes('/api/modern-treasury/accounts/') && path.includes('/reconcile')) {
          if (method !== 'POST') {
            resolve({ status: 405, message: 'Method Not Allowed. Reconciliation requires POST.' });
            return;
          }
          const accountIdMatch = path.match(/\/accounts\/([a-zA-Z0-9_]+)\/reconcile/);
          if (!accountIdMatch || !accountIdMatch[1]) {
            resolve({ status: 400, message: 'Account ID missing for reconcile operation in path.' });
            return;
          }
          const accountId = accountIdMatch[1];

          const existingAccount = syncState.accounts[accountId];
          if (!existingAccount) {
            resolve({ status: 404, message: `Account ${accountId} not found in system for reconciliation.` });
            return;
          }

          // Simulate reconciliation logic
          const reconciliationResult = simulateReconciliation(existingAccount, payload);
          console.log(`[${correlationId}] Reconciled account ${accountId}. Status: ${reconciliationResult.status}`);
          resolve({ status: 200, data: reconciliationResult });
          return;
        }

        // --- Simulated /api/modern-treasury/accounts/{accountId}/discrepancies/{discrepancyId} endpoint (for updating) ---
        if (path.match(/\/api\/modern-treasury\/accounts\/([a-zA-Z0-9_]+)\/discrepancies\/([a-zA-Z0-9_]+)$/) && method === 'PUT') {
          const pathParts = path.split('/');
          const accountId = pathParts[4];
          const discrepancyId = pathParts[6];

          if (!accountId || !discrepancyId || !payload?.newStatus) {
            resolve({ status: 400, message: 'Missing required parameters (accountId, discrepancyId, newStatus) for discrepancy update.' });
            return;
          }

          const currentAccount = syncState.accounts[accountId];
          if (!currentAccount) {
            resolve({ status: 404, message: `Account ${accountId} not found.` });
            return;
          }

          const discrepancyIndex = currentAccount.discrepancies.findIndex(d => d.id === discrepancyId);
          if (discrepancyIndex === -1) {
            resolve({ status: 404, message: `Discrepancy ${discrepancyId} not found in account ${accountId}.` });
            return;
          }

          // Simulate successful update
          resolve({ status: 200, message: `Discrepancy ${discrepancyId} status updated to ${payload.newStatus}.` });
          return;
        }

        // Default: Endpoint not found or unrecognized
        console.warn(`[${correlationId}] Unrecognized simulated API path or method: ${method} ${path}`);
        resolve({ status: 404, message: 'Endpoint not found or method not supported by this API facade.' });
      }, latency);
    });
  };

  // --- Core Hook Actions ---

  /**
   * Triggers a synchronization for specified account IDs. Fetches latest balances and transactions.
   * If `accountIds` is empty, it attempts to refresh all accounts currently tracked by the hook.
   * Updates `syncState` with fetched data, loading status, and any errors.
   * @param accountIds An array of account IDs to synchronize.
   * @param options Options for the sync operation (e.g., force refresh, fetch period).
   * @returns A Promise that resolves when the sync operation is complete.
   */
  const syncAccounts = async (
    accountIdsToSync: string[],
    options?: { forceRefresh?: boolean; fetchPeriod?: 'latest' | 'full' | 'past_week' | 'past_month' },
  ): Promise<void> => {
    const ids = accountIdsToSync.length > 0 ? accountIdsToSync : Object.keys(syncState.accounts);

    if (ids.length === 0) {
      console.log('useModernTreasuryAccountSync: No account IDs provided or tracked for synchronization. Skipping sync.');
      setSyncState((prev) => ({ ...prev, isLoading: false, error: null, lastOperationTimestamp: new Date().toISOString() }));
      return;
    }

    setSyncState((prev) => ({ ...prev, isLoading: true, error: null }));
    let hasOverallError = false;
    const currentTimestamp = new Date().toISOString();

    try {
      const updatedAccounts: Record<string, SyncedAccountDetails> = { ...syncState.accounts };

      for (const accountId of ids) {
        try {
          console.log(`useModernTreasuryAccountSync: Initiating sync for account ${accountId} with options:`, options);
          const response = await simulateApiCall(
            `/api/modern-treasury/accounts/${accountId}/sync?forceRefresh=${options?.forceRefresh || false}&fetchPeriod=${options?.fetchPeriod || 'latest'}`,
            'GET',
            undefined,
            { requestId: generateUniqueId() }
          );

          if (response.status === 200 && response.data) {
            const data = response.data as SyncedAccountDetails;
            updatedAccounts[accountId] = { ...data, lastSyncDate: currentTimestamp };
            console.log(`useModernTreasuryAccountSync: Successfully synced account: ${accountId}`);
          } else {
            hasOverallError = true;
            const errorMessage = response.message || `Unknown error (${response.status}) syncing account ${accountId}`;
            console.error(`useModernTreasuryAccountSync: Failed to sync account ${accountId}: ${errorMessage}`);
            // Update account's status to reflect the error
            updatedAccounts[accountId] = {
              ...(updatedAccounts[accountId] || generateMockAccountDetails(accountId)), // Preserve existing or create basic mock
              connectionStatus: 'error',
              reconciliationStatus: 'failed_reconciliation',
              lastSyncDate: currentTimestamp,
              discrepancies: [
                ...((updatedAccounts[accountId]?.discrepancies || []).filter(d => d.status !== 'resolved')), // Keep open discrepancies
                {
                  id: generateUniqueId(),
                  type: 'service_error',
                  description: `Failed to fetch data from Modern Treasury or upstream: ${errorMessage}`,
                  status: 'open',
                  identifiedDate: currentTimestamp,
                  suggestedResolution: 'Check API connection, credentials, and try again. Contact support if persistent.',
                  lastUpdated: currentTimestamp,
                }
              ],
            };
          }
        } catch (innerErr: any) {
          hasOverallError = true;
          const exceptionMessage = innerErr.message || 'Unknown exception during account sync.';
          console.error(`useModernTreasuryAccountSync: Exception during sync for account ${accountId}:`, innerErr);
          updatedAccounts[accountId] = {
            ...(updatedAccounts[accountId] || generateMockAccountDetails(accountId)),
            connectionStatus: 'error',
            reconciliationStatus: 'failed_reconciliation',
            lastSyncDate: currentTimestamp,
            discrepancies: [
              ...((updatedAccounts[accountId]?.discrepancies || []).filter(d => d.status !== 'resolved')),
              {
                id: generateUniqueId(),
                type: 'runtime_exception',
                description: `Runtime error encountered during sync operation: ${exceptionMessage}`,
                status: 'open',
                identifiedDate: currentTimestamp,
                suggestedResolution: 'Review application logs for details. This may indicate a bug.',
                lastUpdated: currentTimestamp,
              }
            ],
          };
        }
      }

      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        accounts: updatedAccounts,
        lastOperationTimestamp: currentTimestamp,
        error: hasOverallError ? 'Some accounts failed to synchronize. Please check individual account statuses for details.' : null,
        activeMonitoredAccountsCount: Object.keys(updatedAccounts).length,
        lastFullSyncGlobalTimestamp: !hasOverallError ? currentTimestamp : prev.lastFullSyncGlobalTimestamp,
      }));
    } catch (outerErr: any) {
      const outerErrorMessage = outerErr.message || 'An unexpected error occurred during the overall sync process.';
      console.error('useModernTreasuryAccountSync: Overall sync operation failed unexpectedly:', outerErr);
      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        error: `Overall synchronization process failed critically: ${outerErrorMessage}`,
        lastOperationTimestamp: currentTimestamp,
      }));
    }
  };

  /**
   * Triggers a reconciliation for a specific account. This process compares transactions
   * and balances against an internal ledger or another source to identify discrepancies.
   * Updates the account's reconciliation status and discrepancy list in `syncState`.
   * @param accountId The ID of the account to reconcile.
   * @param options Options for the reconciliation operation.
   * @returns A Promise that resolves when the reconciliation is complete.
   */
  const reconcileAccount = async (
    accountId: string,
    options?: { externalLedgerId?: string; reconcileType?: 'full' | 'transaction_only' | 'balance_only' },
  ): Promise<void> => {
    setSyncState((prev) => ({ ...prev, isLoading: true, error: null }));
    const currentTimestamp = new Date().toISOString();

    try {
      console.log(`useModernTreasuryAccountSync: Initiating reconciliation for account ${accountId} with options:`, options);
      const response = await simulateApiCall(
        `/api/modern-treasury/accounts/${accountId}/reconcile`,
        'POST',
        options,
        { requestId: generateUniqueId() }
      );

      if (response.status === 200 && response.data) {
        const reconciliationResult = response.data as {
          status: SyncedAccountDetails['reconciliationStatus'];
          discrepancies: Discrepancy[];
          reconciledTransactions: Transaction[];
        };

        setSyncState((prev) => {
          const updatedAccounts = { ...prev.accounts };
          const account = updatedAccounts[accountId];
          if (account) {
            account.reconciliationStatus = reconciliationResult.status;
            // Merge new discrepancies with existing open ones, and update existing ones if their status changed
            const existingOpenDiscrepancies = account.discrepancies.filter(d => d.status === 'open' || d.status === 'investigating');
            const reconciledAndNewDiscrepancies = reconciliationResult.discrepancies.map(newD => {
              const existingD = existingOpenDiscrepancies.find(oldD => oldD.id === newD.id);
              return existingD ? { ...existingD, ...newD, lastUpdated: currentTimestamp } : { ...newD, lastUpdated: currentTimestamp };
            });
            account.discrepancies = reconciledAndNewDiscrepancies;

            // Update transactions: reconcile existing and add new ones found during reconciliation
            const currentTransactionsMap = new Map(
              account.transactions.map((tx) => [tx.id, tx]),
            );
            reconciliationResult.reconciledTransactions.forEach((reconciledTx) => {
              currentTransactionsMap.set(reconciledTx.id, reconciledTx);
            });
            account.transactions = Array.from(currentTransactionsMap.values()).sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

            account.lastSyncDate = currentTimestamp; // Last sync date also reflects reconciliation activities
          }
          return {
            ...prev,
            isLoading: false,
            accounts: updatedAccounts,
            lastOperationTimestamp: currentTimestamp,
          };
        });
        console.log(`useModernTreasuryAccountSync: Account ${accountId} reconciled successfully. Status: ${reconciliationResult.status}`);
      } else {
        const errorMessage = response.message || `Failed to reconcile account ${accountId} due to API error (${response.status}).`;
        console.error(`useModernTreasuryAccountSync: Failed to reconcile account ${accountId}: ${errorMessage}`);
        setSyncState((prev) => {
          const updatedAccounts = { ...prev.accounts };
          const account = updatedAccounts[accountId];
          if (account) {
            account.reconciliationStatus = 'failed_reconciliation';
            account.discrepancies.push({
              id: generateUniqueId(),
              type: 'reconciliation_error',
              description: `Error during reconciliation process: ${errorMessage}`,
              status: 'open',
              identifiedDate: currentTimestamp,
              suggestedResolution: 'Review reconciliation logs and API responses. Ensure data integrity.',
              lastUpdated: currentTimestamp,
            });
            account.lastSyncDate = currentTimestamp;
          }
          return {
            ...prev,
            isLoading: false,
            error: errorMessage,
            lastOperationTimestamp: currentTimestamp,
          };
        });
      }
    } catch (err: any) {
      const exceptionMessage = err.message || 'Unknown exception during reconciliation.';
      console.error(`useModernTreasuryAccountSync: Exception during reconciliation for account ${accountId}:`, err);
      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        error: `Exception during reconciliation for account ${accountId}: ${exceptionMessage}`,
        lastOperationTimestamp: currentTimestamp,
      }));
    }
  };

  /**
   * Updates the status of a specific discrepancy for an account.
   * This function allows users/analysts to manage the lifecycle of identified discrepancies.
   * @param accountId The ID of the account the discrepancy belongs to.
   * @param discrepancyId The ID of the discrepancy to update.
   * @param newStatus The new status for the discrepancy (e.g., 'resolved', 'investigating').
   * @param resolutionNotes Optional notes to add to the discrepancy's resolution.
   * @returns A Promise that resolves when the discrepancy status is updated.
   */
  const updateDiscrepancyStatus = async (
    accountId: string,
    discrepancyId: string,
    newStatus: Discrepancy['status'],
    resolutionNotes?: string,
  ): Promise<void> => {
    setSyncState((prev) => ({ ...prev, isLoading: true, error: null }));
    const currentTimestamp = new Date().toISOString();

    try {
      console.log(`useModernTreasuryAccountSync: Updating discrepancy ${discrepancyId} for account ${accountId} to status: ${newStatus}`);
      const response = await simulateApiCall(
        `/api/modern-treasury/accounts/${accountId}/discrepancies/${discrepancyId}`,
        'PUT',
        { newStatus, resolutionNotes },
        { requestId: generateUniqueId() }
      );

      if (response.status === 200) {
        setSyncState((prev) => {
          const updatedAccounts = { ...prev.accounts };
          const account = updatedAccounts[accountId];
          if (account) {
            const discrepancyIndex = account.discrepancies.findIndex(d => d.id === discrepancyId);
            if (discrepancyIndex !== -1) {
              account.discrepancies[discrepancyIndex] = {
                ...account.discrepancies[discrepancyIndex],
                status: newStatus,
                resolutionNotes: resolutionNotes || account.discrepancies[discrepancyIndex].resolutionNotes,
                lastUpdated: currentTimestamp,
              };
              // Re-evaluate overall account reconciliation status based on remaining discrepancies
              const hasOpenDiscrepancies = account.discrepancies.some(d => d.status === 'open' || d.status === 'investigating');
              if (!hasOpenDiscrepancies && account.reconciliationStatus === 'discrepancy') {
                account.reconciliationStatus = 'synced';
              } else if (hasOpenDiscrepancies && account.reconciliationStatus === 'synced') {
                account.reconciliationStatus = 'discrepancy';
              }
            }
          }
          return {
            ...prev,
            accounts: updatedAccounts,
            isLoading: false,
            lastOperationTimestamp: currentTimestamp,
          };
        });
        console.log(`useModernTreasuryAccountSync: Discrepancy ${discrepancyId} for account ${accountId} successfully updated to ${newStatus}.`);
      } else {
        const errorMessage = response.message || `Failed to update discrepancy ${discrepancyId} due to API error (${response.status}).`;
        console.error(`useModernTreasuryAccountSync: Failed to update discrepancy ${discrepancyId}: ${errorMessage}`);
        setSyncState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          lastOperationTimestamp: currentTimestamp,
        }));
      }
    } catch (err: any) {
      const exceptionMessage = err.message || 'Unknown exception during discrepancy update.';
      console.error(`useModernTreasuryAccountSync: Exception during discrepancy update for account ${accountId}, discrepancy ${discrepancyId}:`, err);
      setSyncState((prev) => ({
        ...prev,
        isLoading: false,
        error: `Exception updating discrepancy: ${exceptionMessage}`,
        lastOperationTimestamp: currentTimestamp,
      }));
    }
  };


  // --- Data Access & Utility Functions ---

  /**
   * Retrieves all balance entries for a specific account.
   * @param accountId The ID of the account.
   * @returns An array of `BalanceEntry` for the specified account, or undefined if the account is not found.
   */
  const getAccountBalances = (accountId: string): BalanceEntry[] | undefined => {
    return syncState.accounts[accountId]?.balances;
  };

  /**
   * Retrieves and filters transactions for a specific account based on various criteria.
   * @param accountId The ID of the account.
   * @param filters Optional filters (e.g., status, type, category, date range, amount range, source system).
   * @returns An array of filtered transactions, sorted by `postedDate` (newest first).
   */
  const getFilteredTransactions = (
    accountId: string,
    filters?: {
      status?: Transaction['status'];
      type?: Transaction['type'];
      category?: string;
      startDate?: string;
      endDate?: string;
      sourceSystem?: Transaction['sourceSystem'];
      minAmount?: number; // In cents
      maxAmount?: number; // In cents
    },
  ): Transaction[] => {
    const account = syncState.accounts[accountId];
    if (!account) {
      console.warn(`useModernTreasuryAccountSync: Account ${accountId} not found when attempting to filter transactions.`);
      return [];
    }

    let filteredTransactions = account.transactions;

    if (filters) {
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.status === filters.status);
      }
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.type === filters.type);
      }
      if (filters.category) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.category === filters.category);
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        filteredTransactions = filteredTransactions.filter(
          (tx) => new Date(tx.postedDate) >= start,
        );
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        filteredTransactions = filteredTransactions.filter(
          (tx) => new Date(tx.postedDate) <= end,
        );
      }
      if (filters.sourceSystem) {
        filteredTransactions = filteredTransactions.filter(
          (tx) => tx.sourceSystem === filters.sourceSystem,
        );
      }
      if (filters.minAmount !== undefined) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.amount >= filters.minAmount!);
      }
      if (filters.maxAmount !== undefined) {
        filteredTransactions = filteredTransactions.filter((tx) => tx.amount <= filters.maxAmount!);
      }
    }
    // Always return sorted by posted date, newest first
    return filteredTransactions.sort((a,b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
  };

  /**
   * Provides a summary of an account's financial status, aggregating key metrics.
   * @param accountId The ID of the account.
   * @returns An object containing summary metrics (total, available, pending balance, transaction count, open discrepancies), or undefined if account not found.
   */
  const getAccountSummary = (accountId: string) => {
    const account = syncState.accounts[accountId];
    if (!account) {
      console.warn(`useModernTreasuryAccountSync: Account ${accountId} not found when attempting to get summary.`);
      return undefined;
    }

    const totalBalance = account.balances.find(b => b.balanceType === 'actual')?.amount || 0;
    const availableBalance = account.balances.find(b => b.balanceType === 'available')?.amount || 0;
    const pendingBalance = account.balances.find(b => b.balanceType === 'pending')?.amount || 0;
    const totalTransactions = account.transactions.length;
    const openDiscrepancies = account.discrepancies.filter(d => d.status === 'open' || d.status === 'investigating').length;

    return {
      totalBalance,
      availableBalance,
      pendingBalance,
      totalTransactions,
      openDiscrepancies,
    };
  };

  /**
   * Retrieves transactions for a specific account within a given date range.
   * This is a convenient wrapper around `getFilteredTransactions`.
   * @param accountId The ID of the account.
   * @param startDate The start date (inclusive) in ISO 8601 format.
   * @param endDate The end date (inclusive) in ISO 8601 format.
   * @returns An array of transactions within the specified range.
   */
  const getTransactionsByDateRange = (accountId: string, startDate: string, endDate: string): Transaction[] => {
    console.log(`useModernTreasuryAccountSync: Fetching transactions for account ${accountId} from ${startDate} to ${endDate}.`);
    return getFilteredTransactions(accountId, {
      startDate,
      endDate,
    });
  };

  // --- Effect Hooks ---

  /**
   * Initial effect: Reads account IDs from URL query parameters on component mount
   * and triggers the first synchronization for these accounts.
   * Also sets up cleanup for the polling interval.
   */
  useEffect(() => {
    const initialAccountIds = getAccountIdsFromQueryParams();
    if (initialAccountIds.length > 0) {
      console.log(`useModernTreasuryAccountSync: Initializing sync for account IDs from URL: ${initialAccountIds.join(', ')}`);
      // Use 'full' fetch period for initial load to get more historical data, if desired
      syncAccounts(initialAccountIds, { fetchPeriod: 'past_month' });
    } else {
      console.log('useModernTreasuryAccountSync: No initial account IDs found in URL to sync.');
      setSyncState((prev) => ({ ...prev, lastOperationTimestamp: new Date().toISOString() }));
    }

    // Cleanup function for the effect: ensures any active polling interval is cleared.
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('useModernTreasuryAccountSync: Cleared background sync polling interval during unmount.');
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  /**
   * Effect for managing background polling for account updates.
   * This provides a simulated "real-time" feel without requiring actual webhooks or external state managers.
   * The polling frequency and conditions are configurable.
   */
  useEffect(() => {
    // Clear any existing interval before (potentially) setting a new one
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('useModernTreasuryAccountSync: Existing polling interval cleared for re-evaluation.');
    }

    const pollingRateMs = 60 * 1000 * 5; // Poll every 5 minutes (300,000 ms)
    const activeAccountIds = Object.keys(syncState.accounts).filter(
      (id) => syncState.accounts[id]?.connectionStatus === 'connected' &&
              syncState.accounts[id]?.reconciliationStatus !== 'failed_reconciliation'
    );

    if (activeAccountIds.length > 0 && syncState.serviceConnectionStatus === 'operational') {
      console.log(`useModernTreasuryAccountSync: Starting background sync polling every ${pollingRateMs / 1000 / 60} minutes for ${activeAccountIds.length} accounts.`);
      pollingIntervalRef.current = window.setInterval(() => {
        const accountsToPoll = Object.keys(syncState.accounts).filter(
          (id) => syncState.accounts[id]?.connectionStatus === 'connected' &&
                  syncState.accounts[id]?.reconciliationStatus !== 'failed_reconciliation'
        );
        if (accountsToPoll.length > 0) {
          console.log(`useModernTreasuryAccountSync: Executing scheduled background sync for ${accountsToPoll.length} accounts. Period: 'latest'.`);
          // Use 'latest' fetch period for background polling to only fetch new data
          syncAccounts(accountsToPoll, { fetchPeriod: 'latest' });
        } else {
          console.log('useModernTreasuryAccountSync: No active accounts with good status to poll. Skipping background sync iteration.');
        }
      }, pollingRateMs);
    } else {
      console.log('useModernTreasuryAccountSync: No active accounts or service degraded/unavailable, stopping background polling.');
    }

    // Cleanup function: ensures the interval is cleared when the component unmounts or dependencies change.
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        console.log('useModernTreasuryAccountSync: Background sync polling interval cleared during effect cleanup.');
      }
    };
  }, [
    syncState.activeMonitoredAccountsCount, // Re-run if the number of monitored accounts changes
    syncState.serviceConnectionStatus,     // Re-run if the overall service connection status changes
    // Important: React's default shallow comparison for `Object.keys(syncState.accounts).length` is sufficient here.
    // If the *content* of accounts changed but not the count, we wouldn't re-run this specific effect, which is fine
    // as `syncAccounts` already handles updating individual account data.
  ]);

  // The hook returns a tuple containing the current state and various functions for interaction.
  return [
    syncState,                   // The current state of account synchronization.
    syncAccounts,                // Function to trigger manual synchronization.
    reconcileAccount,            // Function to trigger manual reconciliation.
    updateDiscrepancyStatus,     // Function to update the status of individual discrepancies.
    setAccountIdsToQueryParams,  // Function to dynamically update the monitored account IDs via URL.
    getAccountBalances,          // Helper to retrieve all balances for an account.
    getFilteredTransactions,     // Helper to retrieve and filter transactions.
    getAccountSummary,           // Helper to get an aggregated summary of an account.
    getTransactionsByDateRange,  // Helper to get transactions within a specific date range.
  ];
}

export default useModernTreasuryAccountSync;