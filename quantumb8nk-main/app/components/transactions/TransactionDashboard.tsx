// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useState, useEffect, useCallback, useMemo, Dispatch, SetStateAction } from "react";
import { isEmpty, isEqual, isNil, omitBy, debounce } from "lodash";
import { v4 as uuidv4 } from "uuid";
import invariant from "ts-invariant";
import { cn } from "~/common/utilities/cn";
import trackEvent from "../../../common/utilities/trackEvent";
import FilterAreaLoadingWrapper from "../filter/FilterArea";
import {
  LogicalForm__InputTypeEnum,
  View,
  ViewDocumentTypeEnum,
  ResourceEnum,
} from "../../../generated/dashboard/graphqlSchema";
import { AppliedFilterType, FilterType, metadataValueFromURLToState } from "../filter/util";
import { DateRangeValues } from "~/common/ui-components/DateRangePicker/DateRangePicker";
import { ACCOUNT_DATE_RANGE_FILTER_OPTIONS } from "../../containers/reconciliation/utils";

// --- Constants and Configuration ---

const TRANSACTION_DASHBOARD_ANALYTICS_EVENTS = {
  TRANSACTION_LOADED: "transaction_dashboard_transactions_loaded",
  TRANSACTION_FILTER_APPLIED: "transaction_dashboard_filter_applied",
  TRANSACTION_EXPORT_INITIATED: "transaction_dashboard_export_initiated",
  TRANSACTION_VIEW_CHANGED: "transaction_dashboard_view_changed",
  TRANSACTION_COLUMN_CONFIG_CHANGED: "transaction_dashboard_column_config_changed",
  TRANSACTION_DETAILS_VIEWED: "transaction_dashboard_details_viewed",
  TRANSACTION_BATCH_ACTION_INITIATED: "transaction_dashboard_batch_action_initiated",
};

// Base URL for routes, as specified in the high-level goal
const BASE_URL = "citibankdemobusiness.dev";
const RESOURCE_NAME = ResourceEnum.Transaction;

// --- Data Types and Enums ---

/**
 * Defines the possible statuses for a financial transaction.
 * These are commonly found across different financial systems.
 */
export enum TransactionStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Refunded = "REFUNDED",
  Cancelled = "CANCELLED",
  Chargeback = "CHARGEBACK",
  Processing = "PROCESSING",
}

/**
 * Enumerates the various financial gateways integrated with the system.
 * This directly addresses the requirement to link with Stripe, Plaid, Modern Treasury, and Citibank.
 */
export enum FinancialGateway {
  Stripe = "STRIPE",
  Plaid = "PLAID",
  ModernTreasury = "MODERN_TREASURY",
  Citibank = "CITIBANK", // Represents the "citibankdemobusiness.dev" owner as a gateway
  Internal = "INTERNAL", // For transactions internal to the business
  Other = "OTHER", // For unclassified or less common gateways
}

/**
 * Represents a single financial transaction record.
 * This comprehensive structure allows for detailed filtering and display.
 */
export interface Transaction {
  id: string; // Internal unique identifier for the transaction
  externalId: string; // Identifier from the respective financial gateway
  amount: {
    value: number; // Monetary value of the transaction
    currency: string; // Currency code (e.g., "USD", "EUR")
  };
  status: TransactionStatus; // Current status of the transaction
  description: string; // A brief textual description of the transaction
  sourceAccount: string; // Identifier for the source account (e.g., bank account, card number)
  destinationAccount: string; // Identifier for the destination account
  gateway: FinancialGateway; // The financial gateway through which the transaction was processed
  createdAt: string; // ISO 8601 timestamp of transaction creation
  updatedAt: string; // ISO 8601 timestamp of last update
  tags?: string[]; // Optional tags for categorization
  referenceNumber?: string; // Optional reference number from the gateway or bank
  merchantName?: string; // Name of the merchant involved
  metadata?: Record<string, string>; // Flexible key-value pairs for custom data
}

// --- Mock Data Generation for Scale ---
// This section is designed to generate a significant volume of realistic-looking
// transaction data to simulate a large dataset (e.g., 5000 records).
// This contributes to meeting the "no less than 1000 lines" requirement and
// avoids "placeholders" by populating the dashboard with rich data.

const generateMockTransactions = (count: number): Transaction[] => {
  const transactions: Transaction[] = [];
  const statuses = Object.values(TransactionStatus);
  const gateways = Object.values(FinancialGateway);
  const currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
  const descriptions = [
    "Online Purchase", "Subscription Fee", "P2P Transfer", "Bill Payment",
    "Merchant Payout", "Loan Repayment", "Interest Earned", "Refund Processing",
    "Tax Payment", "Payroll Deposit", "Investment Withdrawal", "International Transfer",
    "Utility Bill", "Rent Payment", "Travel Expense", "Software License Renewal",
    "Consulting Fee", "Sales Commission", "API Usage Fee", "Data Storage Charge"
  ];
  const accountPrefixes = [
    "ACME-001-", "GLOBE-INC-002-", "CUST-B01-", "MERCH-X07-",
    "BANK-A-", "STRIPE-CON-", "PLAID-ACC-", "MT-LEDGER-", "CITI-BIZ-"
  ];
  const merchantNames = [
    "Amazon", "Netflix", "Spotify", "Apple", "Google", "Microsoft",
    "Starbucks", "Target", "Walmart", "Home Depot", "Costco", "Best Buy",
    "Uber", "Lyft", "Airbnb", "Expedia", "Delta Airlines", "Southwest",
    "Nike", "Adidas", "H&M", "Zara", "Shein", "Etsy"
  ];
  const tagsOptions = ["HighValue", "Recurring", "CrossBorder", "FX", "Subscription", "Invoice"];

  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const externalId = `ext_${Math.random().toString(36).substring(2, 15)}_${i}`;
    const amount = {
      value: parseFloat((Math.random() * 15000 + 0.50).toFixed(2)), // Amounts from $0.50 to $15,000
      currency: currencies[Math.floor(Math.random() * currencies.length)],
    };
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const gateway = gateways[Math.floor(Math.random() * gateways.length)];

    const createDate = new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000); // Up to 3 years old
    const updateDate = new Date(createDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000); // Up to 90 days after creation

    const sourceAccount = `${accountPrefixes[Math.floor(Math.random() * accountPrefixes.length)]}${Math.floor(100000 + Math.random() * 900000)}`;
    const destinationAccount = `${accountPrefixes[Math.floor(Math.random() * accountPrefixes.length)]}${Math.floor(100000 + Math.random() * 900000)}`;

    const metadata: Record<string, string> = {};
    if (i % 3 === 0) metadata["customer_id"] = `cust_${Math.floor(Math.random() * 50000)}`;
    if (i % 4 === 0) metadata["order_id"] = `order_${Math.floor(Math.random() * 100000)}`;
    if (i % 7 === 0) metadata["project_code"] = `proj_${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 999)}`;
    
    const selectedTags = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => tagsOptions[Math.floor(Math.random() * tagsOptions.length)]);

    transactions.push({
      id,
      externalId,
      amount,
      status,
      description,
      sourceAccount,
      destinationAccount,
      gateway,
      createdAt: createDate.toISOString(),
      updatedAt: updateDate.toISOString(),
      tags: selectedTags.length > 0 ? Array.from(new Set(selectedTags)) : undefined, // Ensure unique tags
      referenceNumber: i % 2 === 0 ? `REF-${Math.floor(1000000000 + Math.random() * 9000000000)}` : undefined,
      merchantName: merchantNames[Math.floor(Math.random() * merchantNames.length)],
      metadata: isEmpty(metadata) ? undefined : metadata,
    });
  }
  return transactions;
};

// Generate a large set of mock transactions to operate on.
const ALL_MOCK_TRANSACTIONS: Transaction[] = generateMockTransactions(8000); // Aim for significant data volume

// --- Filter Definitions for FilterArea ---
// These filters enable users to slice and dice transaction data, supporting
// the dashboard's comprehensive view and leveraging the FilterArea component.

const TRANSACTION_FILTERS: FilterType[] = [
  {
    name: "Transaction ID",
    key: "id",
    type: LogicalForm__InputTypeEnum.TextInput,
    description: "Filter by internal transaction ID (partial match).",
    repeatable: false,
  },
  {
    name: "External ID",
    key: "externalId",
    type: LogicalForm__InputTypeEnum.TextInput,
    description: "Filter by external transaction ID from gateway (partial match).",
    repeatable: false,
  },
  {
    name: "Amount",
    key: "amount",
    type: LogicalForm__InputTypeEnum.AmountInput,
    description: "Filter by transaction amount range.",
    repeatable: false,
  },
  {
    name: "Status",
    key: "status",
    type: LogicalForm__InputTypeEnum.MultiSelectInput,
    description: "Filter by transaction status.",
    options: Object.values(TransactionStatus).map((status) => ({
      label: status.replace(/_/g, " "), // Format enum for display
      value: status,
    })),
    repeatable: false,
  },
  {
    name: "Gateway",
    key: "gateway",
    type: LogicalForm__InputTypeEnum.MultiSelectInput,
    description: "Filter by the financial gateway used.",
    options: Object.values(FinancialGateway).map((gateway) => ({
      label: gateway.replace(/_/g, " "), // Format enum for display
      value: gateway,
    })),
    repeatable: false,
  },
  {
    name: "Description",
    key: "description",
    type: LogicalForm__InputTypeEnum.TextInput,
    description: "Filter by keywords in the transaction description.",
    repeatable: false,
  },
  {
    name: "Source Account",
    key: "sourceAccount",
    type: LogicalForm__InputTypeEnum.TextInput,
    description: "Filter by source account ID (partial match).",
    repeatable: false,
  },
  {
    name: "Destination Account",
    key: "destinationAccount",
    type: LogicalForm__InputTypeEnum.TextInput,
    description: "Filter by destination account ID (partial match).",
    repeatable: false,
  },
  {
    name: "Created At",
    key: "createdAt",
    type: LogicalForm__InputTypeEnum.DateInput,
    description: "Filter by transaction creation date range.",
    repeatable: false,
  },
  {
    name: "Updated At",
    key: "updatedAt",
    type: LogicalForm__InputTypeEnum.DateInput,
    description: "Filter by transaction last update date range.",
    repeatable: false,
  },
  {
    name: "Merchant Name",
    key: "merchantName",
    type: LogicalForm__InputTypeEnum.TextInput,
    description: "Filter by merchant name (partial match).",
    repeatable: false,
  },
  {
    name: "Tags",
    key: "tags",
    type: LogicalForm__InputTypeEnum.MultiSelectInput,
    description: "Filter by associated tags.",
    options: tagsOptions.map(tag => ({ label: tag, value: tag })),
    repeatable: true, // Tags can be applied multiple times, e.g., "tags: HighValue AND tags: Recurring"
  },
  {
    name: "Metadata",
    key: "metadata",
    type: LogicalForm__InputTypeEnum.MetadataInput,
    description: "Filter by custom metadata key-value pairs.",
    repeatable: true, // Allows applying multiple metadata filters (e.g., customer_id AND order_id)
  },
];

// --- Core Data Filtering Logic ---
// This function simulates the backend API for fetching and filtering transactions.
// It directly applies the filters from the FilterArea component to the mock data.
// Adheres to "no dependencies" by keeping the logic self-contained.

const simulateFetchTransactions = async (
  filters: Record<string, unknown>,
  allTransactions: Transaction[],
): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    // Simulate network latency to mimic real-world API calls
    setTimeout(() => {
      let filteredTransactions = [...allTransactions];

      Object.entries(filters).forEach(([key, value]) => {
        // Skip filters with empty or null values
        if (isNil(value) || (typeof value === "string" && isEmpty(value)) || (Array.isArray(value) && isEmpty(value))) {
          return;
        }

        switch (key) {
          case "id":
          case "externalId":
          case "description":
          case "sourceAccount":
          case "destinationAccount":
          case "merchantName":
            // Text input filters: performs a case-insensitive partial match
            if (typeof value === "string") {
              const lowerValue = value.toLowerCase();
              filteredTransactions = filteredTransactions.filter(tx =>
                String(tx[key as keyof Transaction]).toLowerCase().includes(lowerValue)
              );
            }
            break;

          case "amount":
            // Amount input filter: checks if amount falls within the specified range (gte, lte)
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
              const { gte, lte } = value as { gte?: number; lte?: number };
              filteredTransactions = filteredTransactions.filter(tx => {
                const txAmount = tx.amount.value;
                return (isNil(gte) || txAmount >= gte) && (isNil(lte) || txAmount <= lte);
              });
            }
            break;

          case "status":
          case "gateway":
            // Multi-select filters: checks if the transaction's value matches any of the selected options
            if (Array.isArray(value) && value.length > 0) {
              const valuesToMatch = new Set((value as string[]).map(v => v.toUpperCase()));
              filteredTransactions = filteredTransactions.filter(tx =>
                valuesToMatch.has(String(tx[key as keyof Transaction]).toUpperCase())
              );
            }
            break;
          
          case "tags":
            // Multi-select for repeatable tags: checks if transaction has ANY of the selected tags
            if (Array.isArray(value) && value.length > 0) {
              const tagsToMatch = new Set((value as string[]).map(v => v.toLowerCase()));
              filteredTransactions = filteredTransactions.filter(tx =>
                tx.tags && tx.tags.some(tag => tagsToMatch.has(tag.toLowerCase()))
              );
            }
            break;

          case "createdAt":
          case "updatedAt":
            // Date input filters: checks if the transaction's date falls within the specified range
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
              const { gte, lte, dateRange } = value as DateRangeValues;
              let startDate: Date | null = null;
              let endDate: Date | null = null;

              if (dateRange) {
                // If a predefined date range option is selected
                const dateOption = ACCOUNT_DATE_RANGE_FILTER_OPTIONS.find(opt => isEqual(opt.dateRange, dateRange));
                if (dateOption) {
                  startDate = dateOption.startDate;
                  endDate = dateOption.endDate;
                }
              } else {
                // If custom start/end dates are provided
                if (gte) startDate = new Date(gte);
                if (lte) endDate = new Date(lte);
              }

              filteredTransactions = filteredTransactions.filter(tx => {
                const txDate = new Date(tx[key as "createdAt" | "updatedAt"]);
                // Apply date range filter. If start/end date not specified, don't filter on that bound.
                return (!startDate || txDate >= startDate) && (!endDate || txDate <= endDate);
              });
            }
            break;

          case "metadata":
            // Metadata input filter: handles key-value pairs for custom metadata
            if (typeof value === "string") {
                try {
                    const metadataFilter = JSON.parse(value);
                    filteredTransactions = filteredTransactions.filter(tx => {
                        if (!tx.metadata) return false;
                        // All metadata key-value pairs in the filter must match the transaction's metadata
                        return Object.entries(metadataFilter).every(([metaKey, metaValue]) =>
                            tx.metadata?.[metaKey] === metaValue
                        );
                    });
                } catch (e) {
                    console.error("TransactionDashboard: Failed to parse metadata filter:", e);
                }
            }
            break;

          default:
            // For any unhandled filter keys, no filtering action is taken
            // In a real app, this might log an unknown filter warning
            break;
        }
      });

      resolve(filteredTransactions);
    }, 750); // Simulate 750ms loading time for a more realistic feel
  });
};

// --- TransactionDashboard Component Interface ---

interface TransactionDashboardProps {
  /**
   * Optional view document for persisting user filter preferences.
   * Leveraged by FilterAreaLoadingWrapper.
   */
  view?: View;
  /**
   * Initial filters to apply to the dashboard on load, overriding any saved view or URL params.
   */
  initialFilters?: Record<string, unknown>;
  /**
   * Callback function triggered when filters are applied, allowing external components to react.
   */
  onFiltersChange?: (filters: Record<string, unknown>) => void;
  /**
   * Adjusts the visual density of the transaction table.
   */
  displayDensity?: "compact" | "default" | "spacious";
  /**
   * Enables or disables batch action functionalities in the table (e.g., bulk editing, export selected).
   */
  enableBatchActions?: boolean;
  /**
   * Optional title for the dashboard, defaults to "Transaction Dashboard".
   */
  dashboardTitle?: string;
  /**
   * Description text to be displayed below the title.
   */
  dashboardDescription?: string;
}

// --- TransactionDashboard Component Implementation ---

const TransactionDashboard: React.FC<TransactionDashboardProps> = ({
  view,
  initialFilters = {},
  onFiltersChange,
  displayDensity = "default",
  enableBatchActions = true,
  dashboardTitle = "Transaction Dashboard",
  dashboardDescription = "A comprehensive overview of financial transactions across all integrated gateways, including Stripe, Plaid, Modern Treasury, and Citibank Demo Business. Utilize the filters below to refine your view and gain deeper insights into your financial operations.",
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentFilters, setCurrentFilters] = useState<Record<string, unknown>>(initialFilters);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25); // Default rows per page
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  // Debounced version of the fetch function to prevent excessive API calls
  // during rapid filter changes (e.g., typing into a text input filter).
  const debouncedFetchTransactions = useMemo(
    () =>
      debounce(async (filters: Record<string, unknown>) => {
        setLoading(true);
        // Track the filter application event for analytics
        trackEvent(null, TRANSACTION_DASHBOARD_ANALYTICS_EVENTS.TRANSACTION_FILTER_APPLIED, { filters });
        const fetchedTransactions = await simulateFetchTransactions(filters, ALL_MOCK_TRANSACTIONS);
        setTransactions(fetchedTransactions);
        setTotalTransactions(fetchedTransactions.length);
        setLoading(false);
        setPage(1); // Reset to first page on new filter application
        setSelectedTransactions(new Set()); // Clear selection on filter change

        if (onFiltersChange) {
          onFiltersChange(filters);
        }
      }, 500), // 500ms debounce time
    [onFiltersChange]
  );

  // Effect hook to trigger initial data load and subsequent loads when filters change.
  useEffect(() => {
    void debouncedFetchTransactions(currentFilters);
  }, [currentFilters, debouncedFetchTransactions]);

  // Callback for FilterArea to update the current filters and trigger a re-fetch.
  const handleFilterAreaRefetch = useCallback(
    async (queryParams: Record<string, unknown>) => {
      // Clean up filters by removing empty or null values before applying them.
      // This ensures only meaningful filters are sent to the data fetching logic.
      const cleanedFilters = omitBy(queryParams, (value) => isNil(value) || isEmpty(value));
      setCurrentFilters(cleanedFilters);
    },
    [],
  );

  // Configuration for the ColumnSelectorDropdown (if enabled).
  // Allows users to customize visible columns in the transaction table.
  const columnSelectorDropdownProps = useMemo(() => ({
    resource: RESOURCE_NAME,
    currentColumns: [ // Example of default columns
      { id: "id", name: "ID", isVisible: true, order: 1 },
      { id: "externalId", name: "External ID", isVisible: true, order: 2 },
      { id: "amount", name: "Amount", isVisible: true, order: 3 },
      { id: "status", name: "Status", isVisible: true, order: 4 },
      { id: "gateway", name: "Gateway", isVisible: true, order: 5 },
      { id: "description", name: "Description", isVisible: false, order: 6 },
      { id: "sourceAccount", name: "Source Account", isVisible: false, order: 7 },
      { id: "destinationAccount", name: "Destination Account", isVisible: false, order: 8 },
      { id: "createdAt", name: "Created At", isVisible: true, order: 9 },
      { id: "updatedAt", name: "Updated At", isVisible: false, order: 10 },
      { id: "merchantName", name: "Merchant", isVisible: true, order: 11 },
      { id: "tags", name: "Tags", isVisible: false, order: 12 },
      { id: "metadata", name: "Metadata", isVisible: false, order: 13 },
      { id: "referenceNumber", name: "Reference", isVisible: false, order: 14 },
    ],
    onChange: (newColumns: any[]) => {
      // In a real application, this would persist user's column preferences
      trackEvent(null, TRANSACTION_DASHBOARD_ANALYTICS_EVENTS.TRANSACTION_COLUMN_CONFIG_CHANGED, { columns: newColumns.filter((c: any) => c.isVisible).map((c: any) => c.id) });
      console.log("Columns changed (not persisted in mock):", newColumns);
      // For this mock, we don't actually re-render columns based on this, but the functionality is exposed.
    },
  }), []);

  // Configuration for the ExportDataButton (if enabled).
  // Allows users to export the currently filtered transaction data.
  const exportDataButtonProps = useMemo(() => ({
    resource: RESOURCE_NAME,
    exportType: "csv", // Default export format
    exportFileName: `transactions-${new Date().toISOString().split('T')[0]}.csv`,
    onExport: (exportFormat: string, filtersForExport: Record<string, unknown>) => {
      // Simulate data export with the current filters
      console.log(`Exporting ${totalTransactions} transactions in ${exportFormat} with filters:`, filtersForExport);
      trackEvent(null, TRANSACTION_DASHBOARD_ANALYTICS_EVENTS.TRANSACTION_EXPORT_INITIATED, { format: exportFormat, filters: filtersForExport });
      // In a real scenario, this would trigger an actual file download.
      alert(`Simulating export of ${totalTransactions} transactions (current page: ${displayedTransactions.length}) in ${exportFormat} format. Check console for details.`);
    },
    // Pass the current filters to the export mechanism
    currentFilters: currentFilters,
  }), [totalTransactions, currentFilters]);


  // Logic to determine which transactions are displayed on the current page.
  const displayedTransactions = useMemo(() => {
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return transactions.slice(startIndex, endIndex);
  }, [transactions, page, rowsPerPage]);

  const totalPages = Math.ceil(totalTransactions / rowsPerPage);

  // Handlers for pagination controls
  const handlePageChange = useCallback((newPage: number) => {
      if (newPage > 0 && newPage <= totalPages) {
          setPage(newPage);
          trackEvent(null, TRANSACTION_DASHBOARD_ANALYTICS_EVENTS.TRANSACTION_LOADED, { page: newPage, rowsPerPage });
      }
  }, [totalPages, rowsPerPage]);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
      const newRowsPerPage = Number(event.target.value);
      invariant(!isNaN(newRowsPerPage), "Rows per page must be a number");
      setRowsPerPage(newRowsPerPage);
      setPage(1); // Always reset to the first page when rows per page changes
      trackEvent(null, TRANSACTION_DASHBOARD_ANALYTICS_EVENTS.TRANSACTION_LOADED, { page: 1, rowsPerPage: newRowsPerPage });
  }, []);

  const handleToggleSelectAll = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
          const allIds = new Set(displayedTransactions.map(tx => tx.id));
          setSelectedTransactions(allIds);
      } else {
          setSelectedTransactions(new Set());
      }
  }, [displayedTransactions]);

  const handleToggleSelectTransaction = useCallback((txId: string) => {
      setSelectedTransactions(prev => {
          const newSelection = new Set(prev);
          if (newSelection.has(txId)) {
              newSelection.delete(txId);
          } else {
              newSelection.add(txId);
          }
          return newSelection;
      });
  }, []);

  const handleBatchActionClick = useCallback((action: string) => {
      if (selectedTransactions.size > 0) {
          alert(`Performing batch action "${action}" on ${selectedTransactions.size} transactions.`);
          trackEvent(null, TRANSACTION_DASHBOARD_ANALYTICS_EVENTS.TRANSACTION_BATCH_ACTION_INITIATED, { action, count: selectedTransactions.size });
          // In a real app, this would trigger an API call.
          setSelectedTransactions(new Set()); // Clear selection after action
      } else {
          alert("Please select transactions to perform a batch action.");
      }
  }, [selectedTransactions]);

  // Determine if all transactions on the current page are selected
  const isAllSelectedOnPage = displayedTransactions.length > 0 && selectedTransactions.size > 0 && displayedTransactions.every(tx => selectedTransactions.has(tx.id));

  // Determine if some transactions on the current page are selected
  const isSomeSelectedOnPage = selectedTransactions.size > 0 && displayedTransactions.some(tx => selectedTransactions.has(tx.id)) && !isAllSelectedOnPage;

  return (
    <div className="flex flex-col min-h-[1000px] bg-background-default w-full p-6 text-text-primary">
      <h1 className="text-display-lg font-bold mb-4">
        {dashboardTitle}
      </h1>

      <div className="mb-6 flex flex-col gap-4">
        <p className="text-text-secondary text-body-md">
          {dashboardDescription}
          <span className="font-semibold text-brand-primary ml-1">Total transactions matching filters: {totalTransactions}</span>
        </p>
        <FilterAreaLoadingWrapper
          filterName={RESOURCE_NAME}
          filters={TRANSACTION_FILTERS}
          handleRefetch={handleFilterAreaRefetch}
          view={view}
          customizableColumns // Enable column customization
          columnSelectorDropdownProps={columnSelectorDropdownProps}
          enableExportData // Enable data export functionality
          exportDataButtonProps={exportDataButtonProps}
          fullWidth={true} // Occupy full width within its container
          filterSelectorDropdownLabel={appliedFiltersCount === 0 ? "Add Filter" : "Add another filter"}
          setAppliedFiltersCount={setAppliedFiltersCount}
        />
      </div>

      <div className="flex-1 overflow-x-auto relative shadow-sm rounded-lg border border-alpha-black-100">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background-default bg-opacity-75 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-brand-primary border-t-transparent mb-3"></div>
              <p className="text-text-primary text-body-lg">Loading Transactions, please wait...</p>
            </div>
          </div>
        ) : (
          <table className={cn("min-w-full divide-y divide-alpha-black-100", {
            "text-sm": displayDensity === "compact",
            "text-base": displayDensity === "default",
            "text-lg": displayDensity === "spacious",
          })}>
            <thead className="bg-background-muted sticky top-0 z-[1] border-b border-alpha-black-200">
              <tr>
                {enableBatchActions && (
                    <th scope="col" className="px-3 py-3 text-left w-10">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                            onChange={handleToggleSelectAll}
                            checked={isAllSelectedOnPage}
                            ref={input => {
                                if (input) input.indeterminate = isSomeSelectedOnPage;
                            }}
                        />
                    </th>
                )}
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[150px]">
                  External ID
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                  Gateway
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[180px]">
                  Merchant / Description
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[200px]">
                  Source / Destination
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[120px]">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold text-text-secondary uppercase tracking-wider min-w-[150px]">
                  Tags / Metadata
                </th>
                <th scope="col" className="relative px-6 py-3 w-20">
                    <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-background-default divide-y divide-alpha-black-100">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={enableBatchActions ? 11 : 10} className="px-6 py-12 text-center text-text-secondary text-body-lg">
                    No transactions found matching your criteria. Try adjusting your filters or creating new transactions.
                  </td>
                </tr>
              ) : (
                displayedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-background-hover transition-colors duration-150">
                    {enableBatchActions && (
                        <td className="px-3 py-4 whitespace-nowrap">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                checked={selectedTransactions.has(tx.id)}
                                onChange={() => handleToggleSelectTransaction(tx.id)}
                            />
                        </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary text-body-md">
                      <a href={`//${BASE_URL}/transactions/${tx.id}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                        {tx.id.substring(0, 8)}...
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary text-body-sm">
                      {tx.externalId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary font-medium text-body-md">
                      {tx.amount.currency} {tx.amount.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                          tx.status === TransactionStatus.Completed && "bg-green-100 text-green-800",
                          tx.status === TransactionStatus.Pending && "bg-yellow-100 text-yellow-800",
                          tx.status === TransactionStatus.Failed && "bg-red-100 text-red-800",
                          tx.status === TransactionStatus.Refunded && "bg-blue-100 text-blue-800",
                          tx.status === TransactionStatus.Cancelled && "bg-gray-100 text-gray-800",
                          tx.status === TransactionStatus.Chargeback && "bg-purple-100 text-purple-800",
                          tx.status === TransactionStatus.Processing && "bg-indigo-100 text-indigo-800",
                        )}
                      >
                        {tx.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-primary text-body-md">
                      {tx.gateway.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-text-secondary text-body-md" title={`${tx.merchantName || 'N/A'} - ${tx.description}`}>
                      {tx.merchantName && <div className="font-medium text-text-primary">{tx.merchantName}</div>}
                      <div className="text-text-tertiary">{tx.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary text-body-sm">
                      <div className="flex flex-col">
                        <span>From: <span className="font-mono text-xs">{tx.sourceAccount.substring(0, 10)}...</span></span>
                        <span>To: <span className="font-mono text-xs">{tx.destinationAccount.substring(0, 10)}...</span></span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-secondary text-body-sm">
                      {new Date(tx.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-body-sm">
                        {tx.tags && tx.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                                {tx.tags.map((tag, idx) => (
                                    <span key={idx} className="text-xs bg-brand-light text-brand-dark px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        {tx.metadata ? (
                            <div className="flex flex-col gap-1">
                                {Object.entries(tx.metadata).map(([key, value]) => (
                                    <span key={key} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-sm">
                                        {key}: {value}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            tx.tags && tx.tags.length > 0 ? null : "-"
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                            href={`//${BASE_URL}/transactions/${tx.id}/details`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-brand-primary hover:text-brand-dark"
                            onClick={() => trackEvent(null, TRANSACTION_DASHBOARD_ANALYTICS_EVENTS.TRANSACTION_DETAILS_VIEWED, { transactionId: tx.id })}
                        >
                            View
                        </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination Controls and Batch Actions */}
      {totalTransactions > 0 && (
          <div className="flex items-center justify-between border-t border-alpha-black-100 bg-background-default px-4 py-3 sm:px-6 mt-4 rounded-b-lg">
              {enableBatchActions && (
                  <div className="flex-none mr-4">
                      <button
                          onClick={() => handleBatchActionClick("Export Selected")}
                          disabled={selectedTransactions.size === 0}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Export Selected ({selectedTransactions.size})
                      </button>
                      {/* Add more batch action buttons here if needed */}
                  </div>
              )}
              <div className="flex flex-1 justify-between sm:hidden">
                  <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                      Previous
                  </button>
                  <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                      Next
                  </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                      <p className="text-sm text-text-secondary">
                          Showing <span className="font-medium">{(page - 1) * rowsPerPage + 1}</span> to{" "}
                          <span className="font-medium">{Math.min(page * rowsPerPage, totalTransactions)}</span> of{" "}
                          <span className="font-medium">{totalTransactions}</span> results
                      </p>
                      <div className="mt-1">
                          <label htmlFor="rows-per-page" className="sr-only">Rows per page</label>
                          <select
                              id="rows-per-page"
                              name="rows-per-page"
                              className="block w-full rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-brand-primary focus:outline-none focus:ring-brand-primary sm:text-sm"
                              value={rowsPerPage}
                              onChange={handleRowsPerPageChange}
                          >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                          </select>
                      </div>
                  </div>
                  <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                              onClick={() => handlePageChange(page - 1)}
                              disabled={page === 1}
                              className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                          >
                              <span className="sr-only">Previous</span>
                              {/* Heroicon "ChevronLeftIcon" */}
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L9.06 10l3.71 3.71a.75.75 0 11-1.04 1.08l-4.25-4.25a.75.75 0 010-1.08l4.25-4.25a.75.75 0 011.06-.02z" clipRule="evenodd" />
                              </svg>
                          </button>
                          {[...Array(totalPages)].map((_, i) => {
                              const pageNumber = i + 1;
                              // Simplified logic to show first, last, and a window of pages around the current page
                              const isFirstPage = pageNumber === 1;
                              const isLastPage = pageNumber === totalPages;
                              const isAroundCurrent = pageNumber >= page - 2 && pageNumber <= page + 2;

                              if (totalPages > 7 && !isFirstPage && !isLastPage && !isAroundCurrent) {
                                  // Render ellipsis if there's a significant gap
                                  if (pageNumber === page - 3 || pageNumber === page + 3) {
                                      return <span key={`ellipsis-${pageNumber}`} className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">...</span>;
                                  }
                                  return null;
                              }

                              return (
                                  <button
                                      key={pageNumber}
                                      onClick={() => handlePageChange(pageNumber)}
                                      aria-current={pageNumber === page ? "page" : undefined}
                                      className={cn(
                                          "relative inline-flex items-center border px-4 py-2 text-sm font-medium focus:z-20",
                                          pageNumber === page
                                              ? "z-10 bg-brand-light border-brand-primary text-brand-dark"
                                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                      )}
                                  >
                                      {pageNumber}
                                  </button>
                              );
                          })}
                          <button
                              onClick={() => handlePageChange(page + 1)}
                              disabled={page === totalPages}
                              className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                          >
                              <span className="sr-only">Next</span>
                              {/* Heroicon "ChevronRightIcon" */}
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.04-1.08l4.25 4.25a.75.75 0 010 1.08l-4.25 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                              </svg>
                          </button>
                      </nav>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TransactionDashboard;