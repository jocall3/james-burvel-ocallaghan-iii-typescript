// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import invariant from "ts-invariant";
import { cn } from "~/common/utilities/cn";
import {
  LogicalForm__InputTypeEnum,
  TimeFormatEnum,
} from "~/generated/dashboard/graphqlSchema";
import { AppliedFilterType } from "~/components/filter/util";
import AppliedFilterDropdown from "~/components/filter/AppliedFilterDropdown";
import {
  Button,
  Input,
  LoadingSpinner,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  Switch,
  Alert,
} from "~/common/ui-components";

/**
 * --- TransactionFeed.tsx ---
 *
 * This file implements a highly performant and interactive component for displaying a feed of financial transactions.
 * It integrates data conceptually from various external financial services (Stripe, Plaid, Modern Treasury, Citibank Demo Business),
 * and allows users to apply dynamic filters, sort, and search through transactions.
 *
 * The component is designed to be self-contained in its logic as much as possible, simulating complex data
 * aggregation and filtering processes from multiple sources, as per architectural guidelines.
 *
 * Owner: citibankdemobusiness.dev
 * Base URL for all conceptual routes: https://api.citibankdemobusiness.dev
 */

// --- ENUMS & CONSTANTS ---

/**
 * Represents the source system from which a transaction originated.
 * This is crucial for distinguishing data from various integrations.
 */
enum TransactionSource {
  Stripe = "Stripe",
  Plaid = "Plaid",
  ModernTreasury = "Modern Treasury",
  CitibankDemoBusiness = "Citibank Demo Business", // Direct transactions or internal
}

/**
 * Represents the status of a financial transaction.
 * This can influence how a transaction is displayed or processed.
 */
enum TransactionStatus {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
  Refunded = "Refunded",
  Cancelled = "Cancelled",
  Disputed = "Disputed",
}

/**
 * Represents the type of a financial transaction.
 * Used for categorization and filtering.
 */
enum TransactionType {
  Payment = "Payment",
  Refund = "Refund",
  Withdrawal = "Withdrawal",
  Deposit = "Deposit",
  Transfer = "Transfer",
  Fee = "Fee",
  Adjustment = "Adjustment",
}

/**
 * Configuration for pagination and display limits.
 */
const ITEMS_PER_PAGE = 25;
const MAX_DESCRIPTION_LENGTH = 120;
const DEBOUNCE_TIME_MS = 300; // For search input

// --- DATA MODELS ---

/**
 * Represents a simplified account from which a transaction is made or received.
 * This aggregates data potentially from multiple banking/fintech sources.
 */
interface Account {
  id: string;
  name: string;
  currency: string;
  bankName: string; // e.g., "Citibank", "Stripe"
  accountNumberLast4: string; // Last 4 digits for display
}

/**
 * Represents a counterparty involved in a transaction.
 * This could be a person, another business, or an internal entity.
 */
interface Counterparty {
  id: string;
  name: string;
  email?: string;
  type: "Individual" | "Business";
}

/**
 * Core transaction interface, aggregating common fields across different financial services.
 * This structure is designed to normalize data from various external APIs.
 */
interface Transaction {
  id: string;
  source: TransactionSource;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // Stored in minor units (e.g., cents) for precision to avoid floating point issues
  currency: string; // ISO 4217 code, e.g., "USD"
  description: string;
  timestamp: string; // ISO 8601 string for consistent date handling
  accountId: string; // The internal ID of the account initiating or receiving the transaction
  counterpartyId?: string; // Optional, links to a Counterparty
  externalRefId?: string; // ID from the original source system if different from `id`
  metadata?: Record<string, any>; // Flexible field for source-specific details
}

/**
 * Represents a filter option available for the transaction feed, extending base `AppliedFilterType`.
 * This helps in dynamically rendering filter selection UI.
 */
interface TransactionFilterOption {
  key: string; // Unique identifier for the filter (e.g., "status", "date")
  label: string;
  type: LogicalForm__InputTypeEnum; // Input type for rendering (e.g., MultiSelect, DateInput)
  options?: Array<{ label: string; value: string }>; // For select-based filter types
  value?: AppliedFilterType["value"]; // Current value of the filter, optional for adding new
  applying?: boolean; // Flag to indicate if the filter is in an "applying" state (e.g., dropdown open)
}

// --- UTILITY HOOKS ---

/**
 * `useDebounce` hook
 * Debounces a value, typically used for delaying updates from rapidly changing inputs like search fields.
 * This prevents excessive re-renders or API calls.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// --- DATA SIMULATION & MOCK API INTEGRATION ---

/**
 * Mock data for accounts and counterparties.
 * In a real application, these would typically be fetched from a backend service.
 */
const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc_citi_001",
    name: "Citibank Business Checking",
    currency: "USD",
    bankName: "Citibank",
    accountNumberLast4: "1234",
  },
  {
    id: "acc_stripe_001",
    name: "Stripe Payout Balance",
    currency: "USD",
    bankName: "Stripe",
    accountNumberLast4: "5678", // Conceptual for Stripe
  },
  {
    id: "acc_plaid_001",
    name: "Plaid Linked Savings",
    currency: "USD",
    bankName: "Plaid Demo Bank",
    accountNumberLast4: "9012",
  },
  {
    id: "acc_modern_001",
    name: "Modern Treasury Ledger Account",
    currency: "USD",
    bankName: "Modern Treasury",
    accountNumberLast4: "3456", // Conceptual for Modern Treasury
  },
  {
    id: "acc_citi_002",
    name: "Citibank EUR Operations",
    currency: "EUR",
    bankName: "Citibank",
    accountNumberLast4: "7890",
  },
];

const MOCK_COUNTERPARTIES: Counterparty[] = [
  { id: "cp_amazon", name: "Amazon Web Services", type: "Business" },
  { id: "cp_starbucks", name: "Starbucks Store #123", type: "Business" },
  { id: "cp_john_doe", name: "John Doe", email: "john.doe@example.com", type: "Individual" },
  { id: "cp_acme_corp", name: "ACME Corporation", type: "Business" },
  { id: "cp_jane_smith", name: "Jane Smith", email: "jane.smith@example.com", type: "Individual" },
  { id: "cp_google", name: "Google Inc.", type: "Business" },
  { id: "cp_shopify", name: "Shopify Payments", type: "Business" },
  { id: "cp_paypal", name: "PayPal Holdings Inc.", type: "Business" },
];

/**
 * Generates a simple pseudo-UUID for mock data.
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Simulates fetching transactions from a specific financial source.
 * This is a critical function for abstracting the "linking" with external services.
 * In a production environment, this function would wrap actual HTTP requests to
 * a backend API that securely communicates with Stripe, Plaid, Modern Treasury, etc.
 *
 * @param source The conceptual transaction source system.
 * @param params Filtering, pagination, and sorting parameters for the fetch request.
 * @returns A Promise resolving to an array of `Transaction` objects.
 */
async function fetchTransactionsFromSource(
  source: TransactionSource,
  params: {
    page: number;
    pageSize: number;
    filters: AppliedFilterType[];
    searchQuery: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  },
): Promise<Transaction[]> {
  const BASE_API_URL = "https://api.citibankdemobusiness.dev"; // Conceptual backend API URL

  // Simulate network delay to mimic real API calls
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 200));

  const { page, pageSize, filters, searchQuery, sortBy, sortOrder } = params;

  // Generate a large pool of dummy transactions specific to this source for filtering.
  // In a real scenario, this data would come from the external service's API.
  let allTransactionsForSource: Transaction[] = [];
  const numMockTransactionsPerSource = 150; // Generate more than a page to test filtering
  for (let i = 0; i < numMockTransactionsPerSource; i++) {
    const id = generateUUID();
    const type = Object.values(TransactionType)[
      Math.floor(Math.random() * Object.values(TransactionType).length)
    ];
    const status = Object.values(TransactionStatus)[
      Math.floor(Math.random() * Object.values(TransactionStatus).length)
    ];
    const amount = Math.floor(Math.random() * 1000000) + 100; // $1.00 to $10,000.00 in cents
    const currency = Math.random() > 0.7 ? "EUR" : "USD"; // Mostly USD, some EUR
    const timestamp = new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 2,
    ).toISOString(); // Transactions over the last 2 years
    const account =
      MOCK_ACCOUNTS.find(
        (acc) =>
          acc.bankName === (source === TransactionSource.CitibankDemoBusiness ? "Citibank" : source.split(" ")[0]),
      ) || MOCK_ACCOUNTS[Math.floor(Math.random() * MOCK_ACCOUNTS.length)];
    const counterparty =
      MOCK_COUNTERPARTIES[Math.floor(Math.random() * MOCK_COUNTERPARTIES.length)];
    const descriptionBase =
      type === TransactionType.Payment
        ? `Payment to ${counterparty.name}`
        : type === TransactionType.Refund
        ? `Refund from ${counterparty.name}`
        : type === TransactionType.Withdrawal
        ? `Cash Withdrawal`
        : type === TransactionType.Deposit
        ? `Incoming Transfer`
        : `Financial Event`;

    allTransactionsForSource.push({
      id: id,
      source: source,
      type: type,
      status: status,
      amount: amount,
      currency: currency,
      description: `${descriptionBase} - Ref: ${id.substring(0, 8)}`,
      timestamp: timestamp,
      accountId: account.id,
      counterpartyId: counterparty.id,
      externalRefId: `ext_${source.toLowerCase().replace(" ", "")}_${id.substring(
        0,
        10,
      )}`,
      metadata: {
        vendorCode: `V${Math.floor(Math.random() * 999)}`,
        category: `Category ${Math.floor(Math.random() * 5) + 1}`,
      },
    });
  }

  // --- Server-side Filtering Simulation ---
  let filteredTransactions = allTransactionsForSource.filter((tx) => {
    let matchesAll = true;

    // Apply global search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const accountName = MOCK_ACCOUNTS.find((acc) => acc.id === tx.accountId)?.name.toLowerCase() || "";
      const counterpartyName = MOCK_COUNTERPARTIES.find((cp) => cp.id === tx.counterpartyId)?.name.toLowerCase() || "";

      if (
        !(
          tx.description.toLowerCase().includes(searchLower) ||
          tx.id.toLowerCase().includes(searchLower) ||
          tx.externalRefId?.toLowerCase().includes(searchLower) ||
          accountName.includes(searchLower) ||
          counterpartyName.includes(searchLower) ||
          String(tx.amount / 100).includes(searchLower) // Search by amount string
        )
      ) {
        matchesAll = false;
      }
    }

    // Apply structured filters
    for (const filter of filters) {
      if (!matchesAll) break; // Short-circuit if already failed a filter
      const filterValue = filter.value;

      switch (filter.key) {
        case "status":
          if (
            filter.type === LogicalForm__InputTypeEnum.MultiSelect &&
            Array.isArray(filterValue) &&
            filterValue.length > 0
          ) {
            matchesAll = filterValue.some((v) => v === tx.status);
          }
          break;
        case "type":
          if (
            filter.type === LogicalForm__InputTypeEnum.MultiSelect &&
            Array.isArray(filterValue) &&
            filterValue.length > 0
          ) {
            matchesAll = filterValue.some((v) => v === tx.type);
          }
          break;
        case "source":
          if (
            filter.type === LogicalForm__InputTypeEnum.MultiSelect &&
            Array.isArray(filterValue) &&
            filterValue.length > 0
          ) {
            matchesAll = filterValue.some((v) => v === tx.source);
          }
          break;
        case "currency":
          if (
            filter.type === LogicalForm__InputTypeEnum.MultiSelect &&
            Array.isArray(filterValue) &&
            filterValue.length > 0
          ) {
            matchesAll = filterValue.some((v) => v === tx.currency);
          }
          break;
        case "account":
          if (
            filter.type === LogicalForm__InputTypeEnum.MultiAccountSelect &&
            Array.isArray(filterValue) &&
            filterValue.length > 0
          ) {
            matchesAll = filterValue.some((v) => v === tx.accountId);
          }
          break;
        case "counterparty":
          if (
            filter.type === LogicalForm__InputTypeEnum.MultiSelect &&
            Array.isArray(filterValue) &&
            filterValue.length > 0
          ) {
            matchesAll = filterValue.some((v) => v === tx.counterpartyId);
          }
          break;
        case "amount":
          if (
            filter.type === LogicalForm__InputTypeEnum.NumberRangeInput &&
            typeof filterValue === "object" &&
            filterValue !== null &&
            !Array.isArray(filterValue)
          ) {
            const { gte, lte } = filterValue as { gg: number; lte: number }; // Use gte/lte from filter value
            const txAmount = tx.amount / 100; // Convert minor units for comparison
            if (gte !== undefined && txAmount < gte) matchesAll = false;
            if (lte !== undefined && txAmount > lte) matchesAll = false;
          }
          break;
        case "date":
          if (
            filter.type === LogicalForm__InputTypeEnum.DateInput &&
            typeof filterValue === "object" &&
            filterValue !== null &&
            !Array.isArray(filterValue)
          ) {
            const { gte, lte, format, value: durationValue } = filterValue as {
              gte?: string;
              lte?: string;
              format?: TimeFormatEnum;
              value?: string;
            };
            const txDate = new Date(tx.timestamp).getTime();

            // Handle date range (specific dates)
            if (format === TimeFormatEnum.Date) {
              if (gte && txDate < new Date(gte).getTime()) matchesAll = false;
              // Add 1 day to LTE to include transactions on the last day
              if (lte && txDate > new Date(lte).getTime() + 24 * 60 * 60 * 1000) matchesAll = false;
            } else if (format === TimeFormatEnum.Duration) {
              // Handle duration format (e.g., "Last 7 days")
              let durationGteTimestamp: number | undefined;
              const now = new Date();
              now.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

              switch (durationValue) {
                case "LAST_7_DAYS":
                  durationGteTimestamp = now.getTime() - 7 * 24 * 60 * 60 * 1000;
                  break;
                case "LAST_30_DAYS":
                  durationGteTimestamp = now.getTime() - 30 * 24 * 60 * 60 * 1000;
                  break;
                case "LAST_90_DAYS":
                  durationGteTimestamp = now.getTime() - 90 * 24 * 60 * 60 * 1000;
                  break;
                case "ALL_TIME":
                  durationGteTimestamp = 0; // Epoch for all time
                  break;
                // Add more durations as needed
                default:
                  // For unknown durations or if no duration is specified, treat as no date filter
                  durationGteTimestamp = undefined;
                  break;
              }

              if (durationGteTimestamp !== undefined && txDate < durationGteTimestamp) {
                matchesAll = false;
              }
            }
          }
          break;
        // Extend with more filter types (e.g., TextInput for description keyword, etc.)
      }
    }
    return matchesAll;
  });

  // --- Server-side Sorting Simulation ---
  filteredTransactions.sort((a, b) => {
    let valA: any;
    let valB: any;

    // Extract values based on sortBy key
    switch (sortBy) {
      case "timestamp":
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
        break;
      case "amount":
        valA = a.amount;
        valB = b.amount;
        break;
      case "description":
        valA = a.description.toLowerCase();
        valB = b.description.toLowerCase();
        break;
      case "status":
        valA = a.status.toLowerCase();
        valB = b.status.toLowerCase();
        break;
      case "type":
        valA = a.type.toLowerCase();
        valB = b.type.toLowerCase();
        break;
      case "source":
        valA = a.source.toLowerCase();
        valB = b.source.toLowerCase();
        break;
      case "account":
        valA = MOCK_ACCOUNTS.find(acc => acc.id === a.accountId)?.name.toLowerCase() || "";
        valB = MOCK_ACCOUNTS.find(acc => acc.id === b.accountId)?.name.toLowerCase() || "";
        break;
      case "counterparty":
        valA = MOCK_COUNTERPARTIES.find(cp => cp.id === a.counterpartyId)?.name.toLowerCase() || "";
        valB = MOCK_COUNTERPARTIES.find(cp => cp.id === b.counterpartyId)?.name.toLowerCase() || "";
        break;
      default:
        valA = new Date(a.timestamp).getTime(); // Default sort by timestamp
        valB = new Date(b.timestamp).getTime();
        break;
    }

    // Perform comparison
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // --- Server-side Pagination Simulation ---
  const startIndex = (page - 1) * pageSize;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + pageSize,
  );

  return paginatedTransactions;
}

/**
 * `useTransactionData` hook
 * This custom hook centralizes the logic for fetching, aggregating, and managing transaction data
 * from multiple conceptual sources (Stripe, Plaid, Modern Treasury, Citibank).
 * It manages loading states, errors, and pagination.
 */
function useTransactionData(
  currentPage: number,
  currentFilters: AppliedFilterType[],
  searchQuery: string,
  sortBy: string,
  sortOrder: "asc" | "desc",
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalEstimatedCount, setTotalEstimatedCount] = useState(0); // Estimated total for current filters

  // Memoize parameters to prevent unnecessary re-fetches when component re-renders
  const fetchParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
      filters: currentFilters,
      searchQuery,
      sortBy,
      sortOrder,
    }),
    [currentPage, currentFilters, searchQuery, sortBy, sortOrder],
  );

  /**
   * `fetchAllSources`
   * Asynchronously fetches transactions from all defined sources concurrently.
   * This mimics a robust backend aggregation service.
   */
  const fetchAllSources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Execute all mock API calls in parallel using Promise.all
      const [
        stripeTxns,
        plaidTxns,
        modernTreasuryTxns,
        citibankTxns,
      ] = await Promise.all([
        fetchTransactionsFromSource(TransactionSource.Stripe, fetchParams),
        fetchTransactionsFromSource(TransactionSource.Plaid, fetchParams),
        fetchTransactionsFromSource(
          TransactionSource.ModernTreasury,
          fetchParams,
        ),
        fetchTransactionsFromSource(
          TransactionSource.CitibankDemoBusiness,
          fetchParams,
        ),
      ]);

      // Combine transactions from all sources
      let combinedTransactions = [
        ...stripeTxns,
        ...plaidTxns,
        ...modernTreasuryTxns,
        ...citibankTxns,
      ];

      // De-duplicate transactions based on their unique 'id'.
      // This step is crucial if multiple sources might report the same underlying transaction
      // or if internal and external IDs are mapped to a single canonical ID.
      const uniqueTransactions = Array.from(
        new Map(combinedTransactions.map((item) => [item.id, item])).values(),
      );

      // Sort and paginate the *combined* unique transactions if client-side aggregation is done.
      // For this simulation, sorting and pagination were already applied per-source for simplicity,
      // but a more advanced system might do global sorting/pagination after merging.
      uniqueTransactions.sort((a, b) => {
        let valA: any;
        let valB: any;
        switch (sortBy) {
          case "timestamp":
            valA = new Date(a.timestamp).getTime();
            valB = new Date(b.timestamp).getTime();
            break;
          case "amount":
            valA = a.amount;
            valB = b.amount;
            break;
          case "description":
            valA = a.description.toLowerCase();
            valB = b.description.toLowerCase();
            break;
          case "status":
            valA = a.status.toLowerCase();
            valB = b.status.toLowerCase();
            break;
          case "type":
            valA = a.type.toLowerCase();
            valB = b.type.toLowerCase();
            break;
          case "source":
            valA = a.source.toLowerCase();
            valB = b.source.toLowerCase();
            break;
          case "account":
            valA = MOCK_ACCOUNTS.find(acc => acc.id === a.accountId)?.name.toLowerCase() || "";
            valB = MOCK_ACCOUNTS.find(acc => acc.id === b.accountId)?.name.toLowerCase() || "";
            break;
          case "counterparty":
            valA = MOCK_COUNTERPARTIES.find(cp => cp.id === a.counterpartyId)?.name.toLowerCase() || "";
            valB = MOCK_COUNTERPARTIES.find(cp => cp.id === b.counterpartyId)?.name.toLowerCase() || "";
            break;
          default:
            valA = new Date(a.timestamp).getTime();
            valB = new Date(b.timestamp).getTime();
            break;
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      // Update total estimated count. In a real system, the API would return total count.
      // Here, we estimate based on if we received a full page.
      const newTotal = (currentPage - 1) * ITEMS_PER_PAGE + uniqueTransactions.length + (uniqueTransactions.length === ITEMS_PER_PAGE ? ITEMS_PER_PAGE : 0);
      setTotalEstimatedCount(newTotal);

      setTransactions(uniqueTransactions);
      setHasMore(uniqueTransactions.length === ITEMS_PER_PAGE); // Assumes if we get less than a page, there are no more
    } catch (err) {
      console.error("Failed to fetch transactions from all sources:", err);
      setError("An error occurred while loading transactions. Please refresh.");
      setTransactions([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchParams, currentPage, sortBy, sortOrder]); // Re-run effect if fetchParams or sorting/pagination changes

  // Trigger data fetch whenever parameters change
  useEffect(() => {
    fetchAllSources();
  }, [fetchAllSources]);

  return { transactions, isLoading, error, hasMore, totalEstimatedCount, refetch: fetchAllSources };
}

/**
 * `useTransactionFilters` hook
 * Manages the state and logic for dynamic filtering of transactions.
 * It provides methods to add, update, and remove filters, and manages the visibility
 * of the "add filter" dropdown. This pattern is inspired by the seed file's filter dropdown logic.
 */
function useTransactionFilters() {
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilterType[]>([]);
  const [availableFilterOptions, setAvailableFilterOptions] = useState<
    TransactionFilterOption[]
  >([]);
  const [showAddFilterDropdown, setShowAddFilterDropdown] = useState(false);
  const filterSelectorDropdownRef = useRef<HTMLButtonElement | null>(null); // Ref for global click handling

  // Initialize available filter options when the component mounts
  useEffect(() => {
    setAvailableFilterOptions([
      {
        key: "status",
        label: "Status",
        type: LogicalForm__InputTypeEnum.MultiSelect,
        options: Object.values(TransactionStatus).map((s) => ({
          label: s,
          value: s,
        })),
      },
      {
        key: "type",
        label: "Type",
        type: LogicalForm__InputTypeEnum.MultiSelect,
        options: Object.values(TransactionType).map((t) => ({
          label: t,
          value: t,
        })),
      },
      {
        key: "source",
        label: "Source",
        type: LogicalForm__InputTypeEnum.MultiSelect,
        options: Object.values(TransactionSource).map((s) => ({
          label: s,
          value: s,
        })),
      },
      {
        key: "currency",
        label: "Currency",
        type: LogicalForm__InputTypeEnum.MultiSelect,
        options: [
          { label: "USD - US Dollar", value: "USD" },
          { label: "EUR - Euro", value: "EUR" },
          // Add more currencies as supported
        ],
      },
      {
        key: "account",
        label: "Account",
        type: LogicalForm__InputTypeEnum.MultiAccountSelect, // Custom select for accounts
        options: MOCK_ACCOUNTS.map((acc) => ({
          label: `${acc.name} (${acc.currency} ...${acc.accountNumberLast4})`,
          value: acc.id,
        })),
      },
      {
        key: "counterparty",
        label: "Counterparty",
        type: LogicalForm__InputTypeEnum.MultiSelect, // Reusing multi-select for counterparties
        options: MOCK_COUNTERPARTIES.map((cp) => ({
          label: cp.name,
          value: cp.id,
        })),
      },
      {
        key: "amount",
        label: "Amount",
        type: LogicalForm__InputTypeEnum.NumberRangeInput, // For numerical ranges
      },
      {
        key: "date",
        label: "Date Range",
        type: LogicalForm__InputTypeEnum.DateInput, // For date selections, including durations
      },
      // Add more filter definitions here as the system grows
    ]);
  }, []);

  /**
   * Adds a new filter to the `appliedFilters` list or sets an existing one to 'applying' state.
   */
  const addFilter = useCallback((filterKey: string) => {
    const existingFilter = appliedFilters.find((f) => f.key === filterKey);
    if (existingFilter) {
      // If filter already exists, just activate its dropdown for editing
      setAppliedFilters(
        appliedFilters.map((f) =>
          f.key === filterKey ? { ...f, applying: true } : f,
        ),
      );
    } else {
      // If it's a new filter, create and add it, marking as 'applying'
      const option = availableFilterOptions.find((opt) => opt.key === filterKey);
      if (option) {
        setAppliedFilters([
          ...appliedFilters,
          {
            key: option.key,
            name: option.label,
            type: option.type,
            value: option.value || null, // Initialize value, could be null/empty array/object
            applying: true, // Mark as applying to automatically open its dropdown
          },
        ]);
      }
    }
    setShowAddFilterDropdown(false); // Close the "Add Filter" menu
  }, [appliedFilters, availableFilterOptions]);

  /**
   * Updates an existing filter's properties (e.g., its value or applying state).
   */
  const updateFilter = useCallback((updatedFilter: AppliedFilterType) => {
    setAppliedFilters((prevFilters) =>
      prevFilters.map((f) => (f.key === updatedFilter.key ? updatedFilter : f)),
    );
  }, []);

  /**
   * Removes a filter from the `appliedFilters` list.
   */
  const removeFilter = useCallback((filterKey: string) => {
    setAppliedFilters((prevFilters) =>
      prevFilters.filter((f) => f.key !== filterKey),
    );
  }, []);

  /**
   * Toggles the visibility of the "Add Filter" dropdown menu.
   */
  const handleClickAddFilter = useCallback(() => {
    setShowAddFilterDropdown((prev) => !prev);
  }, []);

  return {
    appliedFilters,
    availableFilterOptions,
    addFilter,
    updateFilter,
    removeFilter,
    showAddFilterDropdown,
    setShowAddFilterDropdown,
    filterSelectorDropdownRef,
    handleClickAddFilter,
  };
}

// --- SUB-COMPONENTS ---

interface TransactionRowProps {
  transaction: Transaction;
  accounts: Account[];
  counterparties: Counterparty[];
}

/**
 * `TransactionRow` component
 * Renders a single row of a financial transaction within the feed.
 * Optimized with `React.memo` to prevent unnecessary re-renders when parent state changes
 * but its own props remain stable. Displays detailed transaction information.
 */
const TransactionRow: React.FC<TransactionRowProps> = React.memo(
  ({ transaction, accounts, counterparties }) => {
    const account = accounts.find((acc) => acc.id === transaction.accountId);
    const counterparty = counterparties.find(
      (cp) => cp.id === transaction.counterpartyId,
    );

    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: transaction.currency,
    }).format(transaction.amount / 100); // Convert cents to major units for display

    const formattedDate = new Date(transaction.timestamp).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // Use AM/PM
      },
    );

    return (
      <div
        className="grid grid-cols-12 items-center gap-4 border-b border-gray-200 py-3 text-sm last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
        data-transaction-id={transaction.id}
      >
        <div className="col-span-2 flex flex-col pl-4">
          <span className="font-medium text-gray-800">
            {transaction.description.length > MAX_DESCRIPTION_LENGTH
              ? transaction.description.substring(0, MAX_DESCRIPTION_LENGTH) + "..."
              : transaction.description}
          </span>
          <span className="text-gray-500 text-xs">ID: {transaction.id.substring(0, 8)}...</span>
          {transaction.externalRefId && (
            <span className="text-gray-500 text-xs">Ext Ref: {transaction.externalRefId.substring(0, 8)}...</span>
          )}
        </div>
        <div className="col-span-1 text-gray-700">{transaction.type}</div>
        <div className="col-span-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              transaction.status === TransactionStatus.Completed &&
                "bg-green-100 text-green-800",
              transaction.status === TransactionStatus.Pending &&
                "bg-yellow-100 text-yellow-800",
              transaction.status === TransactionStatus.Failed &&
                "bg-red-100 text-red-800",
              transaction.status === TransactionStatus.Refunded &&
                "bg-blue-100 text-blue-800",
              transaction.status === TransactionStatus.Disputed &&
                "bg-orange-100 text-orange-800",
              transaction.status === TransactionStatus.Cancelled &&
                "bg-gray-100 text-gray-800",
            )}
          >
            {transaction.status}
          </span>
        </div>
        <div
          className={cn(
            "col-span-2 font-medium",
            [TransactionType.Refund, TransactionType.Withdrawal, TransactionType.Fee].includes(transaction.type)
              ? "text-red-600"
              : "text-green-600",
          )}
        >
          {formattedAmount}
        </div>
        <div className="col-span-2 text-gray-700">
          <div className="font-medium">{account?.name || "N/A"}</div>
          <div className="text-xs text-gray-500">
            {account?.bankName || ""}{" "}
            {account?.accountNumberLast4 ? `(...${account.accountNumberLast4})` : ""}
          </div>
        </div>
        <div className="col-span-1 text-gray-700">
          {counterparty?.name || "N/A"}
        </div>
        <div className="col-span-1 text-gray-700">
          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            {transaction.source}
          </span>
        </div>
        <div className="col-span-2 text-gray-700 text-right pr-4">
          {formattedDate}
        </div>
      </div>
    );
  },
);
TransactionRow.displayName = "TransactionRow"; // Essential for React DevTools and memo debugging

interface FilterPillProps {
  filter: AppliedFilterType;
  onRemove: (key: string) => void;
  onClick: (filter: AppliedFilterType) => void; // For re-opening filter dropdown
  availableFilterOptions: TransactionFilterOption[];
  updateFilter: (filter: AppliedFilterType) => void;
  filterSelectorDropdownRef: React.MutableRefObject<HTMLButtonElement | null>;
  handleClickAddFilter: () => void;
}

/**
 * `FilterPill` component
 * Renders an individual applied filter as a clickable pill, including a remove button
 * and its associated dropdown for editing. It intelligently formats the display value.
 */
const FilterPill: React.FC<FilterPillProps> = ({
  filter,
  onRemove,
  onClick,
  availableFilterOptions,
  updateFilter,
  filterSelectorDropdownRef,
  handleClickAddFilter,
}) => {
  const currentOption = availableFilterOptions.find((opt) => opt.key === filter.key);
  invariant(currentOption, `Filter option for key ${filter.key} not found.`); // Ensure option exists

  /**
   * Memoized display value for the filter pill, adapting to different filter types.
   */
  const displayValue = useMemo(() => {
    if (!filter.value) return "Any"; // Default display for empty filter value

    switch (filter.type) {
      case LogicalForm__InputTypeEnum.SingleSelect:
      case LogicalForm__InputTypeEnum.MultiSelect:
      case LogicalForm__InputTypeEnum.MultiAccountSelect:
      case LogicalForm__InputTypeEnum.CounterpartySelect:
        // Handle array of values for multi-selects
        if (Array.isArray(filter.value)) {
          const values = filter.value.map((v) => {
            // Special handling for account and counterparty IDs to show names
            if (filter.key === "account") {
              const acc = MOCK_ACCOUNTS.find(a => a.id === v);
              return acc ? acc.name : v;
            }
            if (filter.key === "counterparty") {
              const cp = MOCK_COUNTERPARTIES.find(c => c.id === v);
              return cp ? cp.name : v;
            }
            // For other select types, find the label from options
            return currentOption.options?.find(o => o.value === v)?.label || v;
          });
          return values.length > 2 ? `${values.length} selected` : values.join(", ");
        }
        // Handle single value for single-selects
        return currentOption.options?.find(o => o.value === filter.value)?.label || String(filter.value);
      case LogicalForm__InputTypeEnum.NumberRangeInput:
        invariant(typeof filter.value === "object" && !Array.isArray(filter.value), "NumberRangeInput expects object value.");
        const { gte, lte } = filter.value as { gte?: number; lte?: number };
        if (gte !== undefined && lte !== undefined) return `${gte} - ${lte}`;
        if (gte !== undefined) return `> ${gte}`;
        if (lte !== undefined) return `< ${lte}`;
        return "Any";
      case LogicalForm__InputTypeEnum.DateInput:
        invariant(typeof filter.value === "object" && !Array.isArray(filter.value), "DateInput expects object value.");
        const { gte: dateGte, lte: dateLte, format, value: durationValue } = filter.value as {
          gte?: string;
          lte?: string;
          format?: TimeFormatEnum;
          value?: string;
        };
        // Handle date durations (e.g., "Last 7 Days")
        if (format === TimeFormatEnum.Duration) {
          switch (durationValue) {
            case "LAST_7_DAYS": return "Last 7 Days";
            case "LAST_30_DAYS": return "Last 30 Days";
            case "LAST_90_DAYS": return "Last 90 Days";
            case "ALL_TIME": return "All Time";
            default: return "Custom Duration";
          }
        }
        // Handle specific date ranges
        if (dateGte && dateLte) return `${new Date(dateGte).toLocaleDateString()} - ${new Date(dateLte).toLocaleDateString()}`;
        if (dateGte) return `From ${new Date(dateGte).toLocaleDateString()}`;
        if (dateLte) return `To ${new Date(dateLte).toLocaleDateString()}`;
        return "Any Date";
      case LogicalForm__InputTypeEnum.TextInput:
        return String(filter.value);
      default:
        return String(filter.value);
    }
  }, [filter, currentOption]);

  const popoverButtonRef = useRef<HTMLButtonElement | null>(null);

  // The `applying` flag in the filter object signals `AppliedFilterDropdown` to open
  const isDropdownOpenForFilter = filter.applying;

  return (
    <div className="relative inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 mr-2 mb-2">
      <span
        onClick={() => onClick({ ...filter, applying: true })} // Mark as applying to open dropdown
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick({ ...filter, applying: true });
          }
        }}
      >
        {filter.name}: {displayValue}
      </span>
      <button
        type="button"
        className="ml-1 -mr-1 h-4 w-4 rounded-full p-1 inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={() => onRemove(filter.key)}
        aria-label={`Remove ${filter.name} filter`}
        data-dd-action-name={`remove filter: ${filter.name}`}
      >
        <svg
          className="h-2 w-2"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 8 8"
        >
          <path
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M1 1l6 6m0-6L1 7"
          />
        </svg>
      </button>

      {/* Render the AppliedFilterDropdown if this filter is in an 'applying' state */}
      {isDropdownOpenForFilter && (
        <AppliedFilterDropdown
          appliedFilter={filter}
          onChange={(changedFilter) => {
            // When filter value changes from dropdown, update it and stop applying
            updateFilter({ ...changedFilter, applying: false });
          }}
          onClose={() => {
            // When dropdown closes (e.g., via escape key or outside click),
            // unset 'applying' flag and remove filter if its value is empty/invalid
            updateFilter({ ...filter, applying: false });
            if (!filter.value || (Array.isArray(filter.value) && filter.value.length === 0)) {
              onRemove(filter.key);
            } else if (typeof filter.value === 'object' && !Array.isArray(filter.value)) {
              // For number/date ranges, check if all sub-fields are empty
              if (Object.values(filter.value).every(val => val === undefined || val === null || val === '')) {
                onRemove(filter.key);
              }
            }
          }}
          filterSelectorDropdownRef={filterSelectorDropdownRef} // Passed from parent for global click detection
          handleClickAddFilter={handleClickAddFilter} // Also passed for global click handling related to 'add filter' button
        >
          {({ popoverOpen }) => (
            <button
              ref={popoverButtonRef}
              type="button"
              className="absolute inset-0 w-full h-full opacity-0"
              aria-expanded={popoverOpen}
              aria-hidden="true" // This button acts as the anchor, but is hidden visually
              data-dd-action-name={`open filter dropdown: ${filter.name}`}
            >
              <span className="sr-only">Open filter options for {filter.name}</span>
            </button>
          )}
        </AppliedFilterDropdown>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

interface TransactionFeedProps {
  // No direct props specified, keeping it as a self-contained component for now.
  // Could accept initial configuration, e.g., default filters or specific view modes.
}

/**
 * `TransactionFeed` component
 * This is the main orchestrator component. It integrates the filter management,
 * data fetching, search, sorting, and displays the transaction feed using sub-components.
 * It's designed to be a comprehensive and interactive dashboard for financial transactions.
 */
const TransactionFeed: React.FC<TransactionFeedProps> = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_TIME_MS);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("timestamp"); // Default sort column
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // Default sort order (newest first)
  const [isLiveFeedEnabled, setIsLiveFeedEnabled] = useState(false); // Placeholder for a future real-time update feature

  // Custom hook to manage all filter-related state and logic
  const {
    appliedFilters,
    availableFilterOptions,
    addFilter,
    updateFilter,
    removeFilter,
    showAddFilterDropdown,
    setShowAddFilterDropdown,
    filterSelectorDropdownRef,
    handleClickAddFilter,
  } = useTransactionFilters();

  // Custom hook to fetch and manage transaction data based on current parameters
  const {
    transactions,
    isLoading,
    error,
    hasMore,
    totalEstimatedCount,
    refetch,
  } = useTransactionData(
    currentPage,
    appliedFilters,
    debouncedSearchQuery,
    sortBy,
    sortOrder,
  );

  // Reset page to 1 whenever filters, search query, sort column, or sort order changes
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, debouncedSearchQuery, sortBy, sortOrder]);

  // Effect for simulating a "live feed" or polling mechanism
  useEffect(() => {
    if (isLiveFeedEnabled) {
      const interval = setInterval(() => {
        // In a real application, this would trigger a more efficient incremental update
        // (e.g., via WebSockets or specific "new data" API endpoints) rather than a full refetch
        console.log("Live feed: Checking for new transactions...");
        // refetch(); // Commented out to prevent excessive refetches in demo mode
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval); // Clean up interval on component unmount or state change
    }
    return () => {}; // No-op if live feed is disabled
  }, [isLiveFeedEnabled, refetch]);

  /**
   * Handles changes in the search input field.
   * Uses `useDebounce` to delay the actual search query update.
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  /**
   * Handles changing the column to sort by. If the same column is clicked,
   * it toggles the sort order (asc/desc). Otherwise, it sets a new column
   * and defaults to descending order.
   */
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc"); // Default to desc for a new sort column (newest/highest first)
    }
  };

  /**
   * Loads more transactions by incrementing the current page number.
   * This triggers `useTransactionData` to fetch the next set of data.
   */
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  /**
   * Callback for adding a new filter from the "Add Filter" dropdown.
   */
  const handleAddFilter = (filterKey: string) => {
    addFilter(filterKey);
  };

  // Memoize mock data to prevent unnecessary re-creation on re-renders
  const currentAccounts = useMemo(() => MOCK_ACCOUNTS, []);
  const currentCounterparties = useMemo(() => MOCK_COUNTERPARTIES, []);

  // Compute available filter options that haven't been applied yet
  const availableFilterKeysForAdd = useMemo(() => {
    const appliedKeys = new Set(appliedFilters.map((f) => f.key));
    return availableFilterOptions.filter((opt) => !appliedKeys.has(opt.key));
  }, [appliedFilters, availableFilterOptions]);

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 citibank-demo-theme">
      {/* Header Section: Title, Search, Global Actions */}
      <div className="mb-6 bg-white shadow-sm rounded-lg p-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Transaction Feed
        </h1>

        {/* Search Input and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <div className="relative flex-grow w-full sm:w-auto">
            <label htmlFor="search-transactions" className="sr-only">
              Search transactions
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <Input
              id="search-transactions"
              name="search-transactions"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by description, ID, account, counterparty, amount..."
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              data-dd-action-name="search transactions input"
              aria-label="Search transactions"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Switch
                checked={isLiveFeedEnabled}
                onChange={setIsLiveFeedEnabled}
                name="live-feed-toggle"
                label="Live Feed"
                id="live-feed-toggle"
                data-dd-action-name="live feed toggle"
              />
            </div>
            <Button
              variant="primary"
              onClick={refetch}
              disabled={isLoading}
              data-dd-action-name="refresh transactions button"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2 text-white" />
              ) : (
                <svg
                  className="-ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0110.802 7.304A4.001 4.001 0 1010.5 15H10a1 1 0 110-2h.5a2.001 2.001 0 001.668-3.974 1.001 1.001 0 011.054-1.054 4.001 4.001 0 00-7.017-3.693V7a1 1 0 01-2 0V3a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Bar: Displays applied filters and "Add Filter" button */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Applied Filters:
          </span>
          {appliedFilters.length === 0 && (
            <span className="text-gray-500 text-sm">None</span>
          )}
          {appliedFilters.map((filter) => (
            <FilterPill
              key={filter.key} // Unique key for each filter pill
              filter={filter}
              onRemove={removeFilter}
              onClick={updateFilter} // Allows re-editing an existing filter
              availableFilterOptions={availableFilterOptions}
              updateFilter={updateFilter}
              filterSelectorDropdownRef={filterSelectorDropdownRef} // Passed through for global click detection
              handleClickAddFilter={handleClickAddFilter} // Passed through for global click detection
            />
          ))}

          {/* "Add Filter" Dropdown Button */}
          {availableFilterKeysForAdd.length > 0 && (
            <DropdownMenu onOpenChange={setShowAddFilterDropdown} open={showAddFilterDropdown}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  ref={filterSelectorDropdownRef} // Attach ref for `useOutsideAlerter` in AppliedFilterDropdown
                  onClick={handleClickAddFilter} // Toggle the dropdown visibility
                  data-dd-action-name="add filter button"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 z-20">
                {availableFilterKeysForAdd.map((option) => (
                  <DropdownMenuItem
                    key={option.key}
                    onSelect={() => handleAddFilter(option.key)} // Add selected filter
                    className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm text-gray-700"
                    data-dd-action-name={`add filter option: ${option.label}`}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main Transaction List Area */}
      <div className="flex-grow bg-white shadow-sm rounded-lg overflow-hidden flex flex-col">
        {/* Table Header with Sortable Columns */}
        <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 items-center gap-4 text-xs font-semibold uppercase text-gray-600">
            <div
              className="col-span-2 pl-4 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("description")}
            >
              Description{" "}
              {sortBy === "description" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
            <div
              className="col-span-1 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("type")}
            >
              Type {sortBy === "type" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
            <div
              className="col-span-1 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("status")}
            >
              Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("amount")}
            >
              Amount {sortBy === "amount" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
            <div
              className="col-span-2 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("account")}
            >
              Account {sortBy === "account" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
            <div
              className="col-span-1 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("counterparty")}
            >
              Counterparty{" "}
              {sortBy === "counterparty" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
            <div
              className="col-span-1 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("source")}
            >
              Source {sortBy === "source" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
            <div
              className="col-span-2 text-right pr-4 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => handleSortChange("timestamp")}
            >
              Date {sortBy === "timestamp" && (sortOrder === "asc" ? "▲" : "▼")}
            </div>
          </div>
        </div>

        {/* Transaction Rows - Content Area */}
        <div className="relative flex-grow min-h-[300px] overflow-y-auto">
          {/* Loading Overlay */}
          {isLoading && transactions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="error" title="Error loading transactions" message={error} className="m-4" />
          )}

          {/* Empty State */}
          {!isLoading && !error && transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No transactions found matching your criteria.
            </div>
          ) : (
            // Render Transaction Rows
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  accounts={currentAccounts}
                  counterparties={currentCounterparties}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination/Load More Section */}
        {(hasMore || isLoading) && !error && (
          <div className="p-4 border-t border-gray-200 flex justify-center bg-gray-50">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              disabled={isLoading || !hasMore}
              data-dd-action-name="load more transactions button"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Loading More...
                </>
              ) : hasMore ? (
                `Load More Transactions (${totalEstimatedCount} total)`
              ) : (
                "No More Transactions"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Footer / Summary Information */}
      <div className="mt-6 bg-white shadow-sm rounded-lg p-4 text-sm text-gray-600">
        <p>
          Currently displaying {transactions.length} transactions, from an estimated{" "}
          <span className="font-semibold">{totalEstimatedCount}</span> total matching your criteria.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Data aggregated conceptually from Stripe, Plaid, Modern Treasury, and Citibank Demo Business.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          All external routes and operations are conceptually owned and managed under{" "}
          <a href="https://citibankdemobusiness.dev" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
            citibankdemobusiness.dev
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default TransactionFeed;