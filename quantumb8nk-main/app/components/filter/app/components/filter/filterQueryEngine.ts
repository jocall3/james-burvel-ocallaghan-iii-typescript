// Copyright James Burvel Oâ€™Callaghan III
// President Citibank Demo Business Inc.

/**
 * @file This utility builds complex API queries from applied filter states.
 * It translates user selections from a generic filter UI into precise parameters
 * for backend data retrieval across various integrated financial systems,
 * ensuring efficient and accurate data filtering for the Citibank Demo Business application.
 * This engine supports generating queries for a unified Citibank API, Stripe, Plaid, and Modern Treasury.
 */

// #region Type Definitions and Constants (Redefined due to "no imports code" constraint)

/**
 * Simplified LogicalForm__InputTypeEnum based on usage in FilterPill.tsx.
 * In a real-world scenario, this enum would be imported from a generated GraphQL schema.
 * It enumerates the different types of input components used for filters.
 */
enum LogicalForm__InputTypeEnum {
  /** Filter for numerical amount ranges. */
  AmountInput = "AMOUNT_INPUT",
  /** Filter for selecting a specific counterparty (e.g., a customer or vendor). */
  CounterpartySelect = "COUNTERPARTY_SELECT",
  /** Filter for selecting a specific invoice or invoice identifier. */
  InvoiceSelect = "INVOICE_SELECT",
  /** Filter for selecting a specific connection to an external financial service. */
  ConnectionSelect = "CONNECTION_SELECT",
  /** Filter for selecting a preview reconciliation rule (often for testing). */
  PreviewReconciliationRuleSelect = "PREVIEW_RECONCILIATION_RULE_SELECT",
  /** Filter for selecting an active reconciliation rule. */
  ReconciliationRuleSelect = "RECONCILIATION_RULE_SELECT",
  /** Filter for a single selection from a predefined list of options. */
  SingleSelect = "SINGLE_SELECT",
  /** Filter for selecting one or more internal bank accounts. */
  MultiAccountSelect = "MULTI_ACCOUNT_SELECT",
    /** Filter for multiple selections from a predefined list of options. */
  MultiSelect = "MULTI_SELECT",
  /** Filter for specifying a date or date range. */
  DateInput = "DATE_INPUT",
  /** Filter for custom metadata key-value pairs. */
  MetadataInput = "METADATA_INPUT",
  /** Default input type for generic text-based filtering. */
  StringInput = "STRING_INPUT",
}

/**
 * Defines the structure for date range values provided by the filter UI.
 * This allows for both relative (e.g., "in the last 30 days") and absolute (e.g., "from 2023-01-01 to 2023-01-31")
 * date specifications.
 * In a real-world scenario, this interface would be imported from a common type definition file.
 */
interface DateRangeFormValues {
  /** Specifies a relative date range looking backward from the current date. */
  inTheLast?: {
    /** The numerical value for the duration (e.g., 1, 7, 30). */
    value: number;
    /** The unit of time for the duration (e.g., DAYS, WEEKS, MONTHS, YEARS). */
    unit: "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
  };
  /** Specifies a relative date range looking forward from the current date. */
  inTheNext?: {
    /** The numerical value for the duration. */
    value: number;
    /** The unit of time for the duration. */
    unit: "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
  };
  /** The "greater than or equal to" boundary for an absolute date range, as an ISO 8601 string or Date object. */
  gte?: string | Date;
  /** The "less than or equal to" boundary for an absolute date range, as an ISO 8601 string or Date object. */
  lte?: string | Date;
}

/**
 * Defines the structure for a single option within a select-type filter (SingleSelect, MultiSelect).
 * This includes the internal value used for filtering and a human-readable display name.
 * In a real-world scenario, this interface would be imported.
 */
interface FilterOption {
  /** The internal, programmatic value of the option, used for backend queries. */
  valueName: string;
  /** The user-friendly display name of the option. */
  prettyValueName: string;
}

/**
 * Represents the state of a single filter that has been applied by the user.
 * This is a comprehensive type capturing all necessary information to translate
 * a UI filter into a backend query parameter.
 * In a real-world scenario, this interface would be imported from a type definition file.
 */
interface AppliedFilterType {
  /** A unique identifier for the filter instance. */
  id: string;
  /** The human-readable name of the filter (e.g., "Amount", "Status", "Counterparty"). */
  name: string;
  /** The type of input component used for this filter, dictating how its value is interpreted. */
  type: LogicalForm__InputTypeEnum;
  /** The value(s) selected or entered by the user for this filter. The type varies based on `LogicalForm__InputTypeEnum`. */
  value:
    | string
    | string[]
    | number
    | DateRangeFormValues
    | { gte: number | null; lte: number | null }
    | { key: string; value: string }
    | null;
  /** An optional icon name associated with the filter for UI display. */
  icon?: string;
  /** An optional array of predefined options for select-type filters. */
  options?: FilterOption[];
}

/**
 * Constant representing the ID for "All Accounts".
 * Redefined here to adhere to the "no imports code" constraint.
 * In a real application, this would be imported from a constants file.
 */
const ALL_ACCOUNTS_ID_REDEFINED = "ALL_ACCOUNTS_CONSTANT_ID";

/**
 * Standard date range options used across the application for date search filters.
 * Redefined here due to the "no imports code" constraint, mirroring `DATE_SEARCH_FILTER_OPTIONS`
 * from the seed file's context.
 */
const DATE_SEARCH_FILTER_OPTIONS_REDEFINED = [
  { label: "Past 24h", dateRange: { inTheLast: { value: 1, unit: "DAYS" } } },
  { label: "Past 7d", dateRange: { inTheLast: { value: 7, unit: "DAYS" } } },
  { label: "Past 30d", dateRange: { inTheLast: { value: 30, unit: "DAYS" } } },
  { label: "Past 90d", dateRange: { inTheLast: { value: 90, unit: "DAYS" } } },
  { label: "Past 1y", dateRange: { inTheLast: { value: 1, unit: "YEARS" } } },
  { label: "Next 24h", dateRange: { inTheNext: { value: 1, unit: "DAYS" } } },
  { label: "Next 7d", dateRange: { inTheNext: { value: 7, unit: "DAYS" } } },
  { label: "Next 30d", dateRange: { inTheNext: { value: 30, unit: "DAYS" } } },
  { label: "Next 90d", dateRange: { inTheNext: { value: 90, unit: "DAYS" } } },
  { label: "Next 1y", dateRange: { inTheNext: { value: 1, unit: "YEARS" } } },
  { label: "Current Month", dateRange: { inTheLast: { value: new Date().getDate(), unit: "DAYS" } } },
  { label: "Last Month", dateRange: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(), lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59, 999).toISOString() } },
];

/**
 * Minimal utility function to check deep equality of objects.
 * This replaces `lodash.isEqual` to adhere to the "no dependencies" constraint.
 * Supports primitive values and simple object structures.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns True if the values are deeply equal, false otherwise.
 */
function _isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(b, key) || !_isEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Minimal utility function to pluralize a word.
 * This replaces `pluralize` library to adhere to the "no dependencies" constraint.
 * Provides basic 's' or 'ies' pluralization.
 * @param word The word to pluralize.
 * @param count The count to determine if pluralization is needed.
 * @returns The pluralized or singular word.
 */
function _pluralize(word: string, count: number): string {
  if (count === 1) {
    return word;
  }
  // Basic pluralization rules for common cases
  if (word.endsWith('y') && !word.endsWith('ay') && !word.endsWith('ey') && !word.endsWith('oy') && !word.endsWith('uy')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
}

// #endregion

// #region Core Query Translation Logic

/**
 * Converts a DateRangeFormValues object into appropriate GTE/LTE date strings (ISO 8601 format).
 * This function handles both predefined relative ranges and absolute date inputs,
 * precisely calculating start and end boundaries for API queries. It incorporates
 * specific logic for common relative date presets (e.g., "Past 24h", "Next 7d").
 *
 * @param dateRange The date range object, potentially containing relative or absolute dates.
 * @returns An object with `gte` (greater than or equal) and `lte` (less than or equal) properties
 *          as ISO 8601 strings, or `null` if not applicable.
 */
function convertDateRangeToGteLte(dateRange: DateRangeFormValues): { gte: string | null; lte: string | null } {
  let gteDate: Date | null = null;
  let lteDate: Date | null = null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0); // Start of today (midnight)
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of today (23:59:59.999)

  // Check for predefined relative ranges first
  const matchedPreset = DATE_SEARCH_FILTER_OPTIONS_REDEFINED.find(option => _isEqual(option.dateRange, dateRange));

  if (matchedPreset?.dateRange.inTheLast) {
    const { value, unit } = matchedPreset.dateRange.inTheLast;
    lteDate = now; // For "in the last", upper bound is current time
    gteDate = new Date(now);

    switch (unit) {
      case "DAYS": gteDate.setDate(now.getDate() - value); break;
      case "WEEKS": gteDate.setDate(now.getDate() - (value * 7)); break;
      case "MONTHS": gteDate.setMonth(now.getMonth() - value); break;
      case "YEARS": gteDate.setFullYear(now.getFullYear() - value); break;
    }
  } else if (matchedPreset?.dateRange.inTheNext) {
    const { value, unit } = matchedPreset.dateRange.inTheNext;
    gteDate = now; // For "in the next", lower bound is current time
    lteDate = new Date(now);

    switch (unit) {
      case "DAYS": lteDate.setDate(now.getDate() + value); break;
      case "WEEKS": lteDate.setDate(now.getDate() + (value * 7)); break;
      case "MONTHS": lteDate.setMonth(now.getMonth() + value); break;
      case "YEARS": lteDate.setFullYear(now.getFullYear() + value); break;
    }
  } else if (dateRange.inTheLast) { // Custom "in the last" not matching a preset
    const { value, unit } = dateRange.inTheLast;
    lteDate = todayEnd; // Default to end of today for custom relative ranges if not 'now'
    gteDate = new Date(todayStart);

    switch (unit) {
      case "DAYS": gteDate.setDate(todayStart.getDate() - value); break;
      case "WEEKS": gteDate.setDate(todayStart.getDate() - (value * 7)); break;
      case "MONTHS": gteDate.setMonth(todayStart.getMonth() - value); break;
      case "YEARS": gteDate.setFullYear(todayStart.getFullYear() - value); break;
    }
  } else if (dateRange.inTheNext) { // Custom "in the next" not matching a preset
    const { value, unit } = dateRange.inTheNext;
    gteDate = todayStart; // Default to start of today
    lteDate = new Date(todayEnd);

    switch (unit) {
      case "DAYS": lteDate.setDate(todayEnd.getDate() + value); break;
      case "WEEKS": lteDate.setDate(todayEnd.getDate() + (value * 7)); break;
      case "MONTHS": lteDate.setMonth(todayEnd.getMonth() + value); break;
      case "YEARS": lteDate.setFullYear(todayEnd.getFullYear() + value); break;
    }
  } else { // Absolute GTE/LTE from form
    if (dateRange.gte) {
      gteDate = new Date(dateRange.gte);
      if (typeof dateRange.gte === 'string' && dateRange.gte.length === 10) { // YYYY-MM-DD
          gteDate.setHours(0,0,0,0); // Ensure start of day for date-only strings
      }
    }
    if (dateRange.lte) {
      lteDate = new Date(dateRange.lte);
      if (typeof dateRange.lte === 'string' && dateRange.lte.length === 10) { // YYYY-MM-DD
          lteDate.setHours(23,59,59,999); // Ensure end of day for date-only strings
      }
    }
  }

  // Fallback to "Past 24h" if no explicit date range is specified, mirroring UI default behavior
  if (!gteDate && !lteDate && !dateRange.inTheLast && !dateRange.inTheNext && !dateRange.gte && !dateRange.lte) {
    const defaultRange = DATE_SEARCH_FILTER_OPTIONS_REDEFINED[0].dateRange; // "Past 24h"
    return convertDateRangeToGteLte(defaultRange);
  }

  return {
    gte: gteDate ? gteDate.toISOString() : null,
    lte: lteDate ? lteDate.toISOString() : null,
  };
}

/**
 * Represents the structure of a query parameter for a single filter,
 * designed for a generic, unified backend API (like Citibank Demo Business's).
 */
interface GenericQueryFilterParam {
  /** The backend field name to filter on, e.g., "counterpartyId", "amount", "transactionDate". */
  field: string;
  /** The comparison operator, e.g., "eq" (equals), "in" (is one of), "gte" (greater than or equal), "lte" (less than or equal), "contains". */
  operator: string;
  /** The value(s) to apply the filter with. */
  value: any;
}

/**
 * The final query object structure expected by the Citibank Demo Business unified backend API.
 * This object can be serialized and sent as part of a request body or query string.
 * It provides a standardized way to apply filters across various data types.
 */
interface CitibankUnifiedQuery {
  /** An array of individual filter parameters to apply. All filters are typically combined with a logical 'AND'. */
  filters: GenericQueryFilterParam[];
  /** Optional pagination: the current page number (1-indexed). */
  page?: number;
  /** Optional pagination: the number of items per page. */
  pageSize?: number;
  /** Optional sorting: the field to sort by. */
  sortBy?: string;
  /** Optional sorting: the direction of sorting. */
  sortDirection?: "ASC" | "DESC";
  /** Optional: specifies which underlying financial systems should be included in the aggregated search. */
  sourceSystems?: TargetSystem[];
}

/**
 * Translates a single `AppliedFilterType` into one or more `GenericQueryFilterParam` objects.
 * This is the primary mapping function for converting UI filter states into a format
 * suitable for the Citibank Demo Business unified backend API.
 *
 * @param appliedFilter The filter applied in the UI.
 * @returns An array of `GenericQueryFilterParam` objects representing the backend query.
 */
function translateFilterToQueryParams(appliedFilter: AppliedFilterType): GenericQueryFilterParam[] {
  const queryParams: GenericQueryFilterParam[] = [];

  switch (appliedFilter.type) {
    case LogicalForm__InputTypeEnum.AmountInput: {
      const value = appliedFilter.value as { gte: number | null; lte: number | null };
      // Amounts are typically stored in cents/smallest unit on the backend.
      // Assuming the UI displays in dollars, convert to cents by multiplying by 100 for backend query.
      if (value.gte !== null && value.gte !== undefined) {
        queryParams.push({
          field: "amount",
          operator: "gte",
          value: Math.round(value.gte * 100),
        });
      }
      if (value.lte !== null && value.lte !== undefined) {
        queryParams.push({
          field: "amount",
          operator: "lte",
          value: Math.round(value.lte * 100),
        });
      }
      break;
    }
    case LogicalForm__InputTypeEnum.CounterpartySelect: {
      queryParams.push({
        field: "counterpartyId",
        operator: "eq",
        value: appliedFilter.value as string,
      });
      break;
    }
    case LogicalForm__InputTypeEnum.InvoiceSelect: {
      // Assuming partial match for invoice numbers/IDs
      queryParams.push({
        field: "invoiceId",
        operator: "contains",
        value: appliedFilter.value as string,
      });
      break;
    }
    case LogicalForm__InputTypeEnum.ConnectionSelect: {
      queryParams.push({
        field: "connectionId",
        operator: "eq",
        value: appliedFilter.value as string,
      });
      break;
    }
    case LogicalForm__InputTypeEnum.PreviewReconciliationRuleSelect:
    case LogicalForm__InputTypeEnum.ReconciliationRuleSelect: {
      queryParams.push({
        field: "reconciliationRuleId",
        operator: "eq",
        value: appliedFilter.value as string,
      });
      break;
    }
    case LogicalForm__InputTypeEnum.SingleSelect: {
      const option = (appliedFilter.options || []).find(
        (selectOption) => selectOption.valueName === appliedFilter.value,
      );
      if (option) {
        // Assuming the filter's 'name' property maps to a backend field (e.g., "Status" -> "status")
        // and the option.valueName is the actual backend enum/string value.
        queryParams.push({
          field: appliedFilter.name.toLowerCase(),
          operator: "eq",
          value: option.valueName,
        });
      }
      break;
    }
    case LogicalForm__InputTypeEnum.MultiAccountSelect: {
      const accountIds = appliedFilter.value as string[];
      if (accountIds.length > 0 && !(accountIds.length === 1 && accountIds[0] === ALL_ACCOUNTS_ID_REDEFINED)) {
        queryParams.push({
          field: "internalAccountId",
          operator: "in",
          value: accountIds,
        });
      }
      // If "ALL_ACCOUNTS_ID_REDEFINED" or no accounts are selected, no filter is added for accounts,
      // implying all accounts are relevant for the query.
      break;
    }
    case LogicalForm__InputTypeEnum.MultiSelect: {
      const selectedValues = appliedFilter.value as string[];
      if (selectedValues.length > 0) {
        // Assuming the filter's 'name' property maps to a backend field,
        // often pluralized in UI but singular for backend field (e.g., "Categories" -> "category").
        queryParams.push({
          field: _pluralize(appliedFilter.name.toLowerCase(), 1), // Convert plural name like "Categories" to "category"
          operator: "in",
          value: selectedValues,
        });
      }
      break;
    }
    case LogicalForm__InputTypeEnum.DateInput: {
      const dateRange = appliedFilter.value as DateRangeFormValues;
      const { gte, lte } = convertDateRangeToGteLte(dateRange);
      if (gte) {
        queryParams.push({ field: "transactionDate", operator: "gte", value: gte });
      }
      if (lte) {
        queryParams.push({ field: "transactionDate", operator: "lte", value: lte });
      }
      break;
    }
    case LogicalForm__InputTypeEnum.MetadataInput: {
      const metadataValue = appliedFilter.value as { key: string; value: string };
      if (metadataValue?.key && metadataValue?.value) {
        // Assuming a `metadata` field that supports querying by key-value pairs (e.g., `metadata.keyName`).
        queryParams.push({
          field: `metadata.${metadataValue.key}`, // Nested field query syntax
          operator: "eq",
          value: metadataValue.value,
        });
      }
      break;
    }
    default: {
      // For generic string inputs or unhandled types, try to infer the field from filter name.
      const stringValue = appliedFilter.value?.toString();
      if (stringValue) {
        queryParams.push({
          field: appliedFilter.name.toLowerCase(), // e.g., "Description" -> "description"
          operator: "contains", // Default to 'contains' for general string search
          value: stringValue,
        });
      }
      break;
    }
  }

  return queryParams;
}

// #endregion

// #region Third-Party System Specific Query Structures

/**
 * Supported target systems for which API queries can be built.
 * These represent the various financial integration partners of Citibank Demo Business.
 */
type TargetSystem = "CITIBANK" | "STRIPE" | "PLAID" | "MODERN_TREASURY";

/**
 * Helper function to convert a Date object or ISO string to a Unix timestamp (seconds).
 * This is particularly useful for APIs like Stripe that prefer Unix timestamps.
 * @param date A Date object or an ISO 8601 string representation of a date.
 * @returns Unix timestamp in seconds, or `undefined` if the input is null.
 */
function toUnixTimestampSeconds(date: string | Date | null): number | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  return Math.floor(d.getTime() / 1000);
}

/**
 * Query parameters specific to the Stripe API.
 * Stripe typically uses URL query parameters with specific naming conventions
 * (e.g., `created[gte]`, `amount[lte]`, `customer`). This interface represents
 * the structured object that would be serialized into such parameters.
 */
interface StripeQueryParams {
  [key: string]: any; // Allows for dynamic properties
  created?: { gte?: number; lte?: number }; // Unix timestamps in seconds
  amount?: { gte?: number; lte?: number }; // In cents
  customer?: string; // Counterparty ID might map to Stripe Customer ID
  invoice?: string; // Invoice ID
  metadata?: { [key: string]: string }; // Custom metadata filtering
  limit?: number; // Pagination limit
  starting_after?: string; // Pagination cursor
  ending_before?: string; // Pagination cursor
  status?: string; // Common filter for various Stripe objects (e.g., Payments, Invoices)
}

/**
 * Translates generic filter parameters into Stripe-specific query parameters.
 * This function handles the nuances of how Stripe expects filtering, including
 * field name mappings and data type conversions (e.g., dates to Unix timestamps, amounts to cents).
 * @param filter The applied filter.
 * @returns An object of Stripe-compatible query parameters.
 */
function translateFilterToStripeParams(filter: AppliedFilterType): StripeQueryParams {
  const stripeParams: StripeQueryParams = {};

  switch (filter.type) {
    case LogicalForm__InputTypeEnum.AmountInput: {
      const value = filter.value as { gte: number | null; lte: number | null };
      stripeParams.amount = {};
      if (value.gte !== null && value.gte !== undefined) {
        stripeParams.amount.gte = Math.round(value.gte * 100);
      }
      if (value.lte !== null && value.lte !== undefined) {
        stripeParams.amount.lte = Math.round(value.lte * 100);
      }
      break;
    }
    case LogicalForm__InputTypeEnum.CounterpartySelect: {
      // In Stripe, a counterparty often maps to a 'customer' ID or similar entity.
      stripeParams.customer = filter.value as string;
      break;
    }
    case LogicalForm__InputTypeEnum.InvoiceSelect: {
      // Direct mapping for invoice IDs.
      stripeParams.invoice = filter.value as string;
      break;
    }
    case LogicalForm__InputTypeEnum.DateInput: {
      const dateRange = filter.value as DateRangeFormValues;
      const { gte, lte } = convertDateRangeToGteLte(dateRange);
      stripeParams.created = {};
      if (gte) {
        stripeParams.created.gte = toUnixTimestampSeconds(gte);
      }
      if (lte) {
        stripeParams.created.lte = toUnixTimestampSeconds(lte);
      }
      break;
    }
    case LogicalForm__InputTypeEnum.MetadataInput: {
      const metadataValue = filter.value as { key: string; value: string };
      if (metadataValue?.key && metadataValue?.value) {
        if (!stripeParams.metadata) stripeParams.metadata = {};
        // Stripe expects metadata filters in the format `metadata[key]=value`.
        // This object structure reflects that for serialization.
        stripeParams.metadata[metadataValue.key] = metadataValue.value;
      }
      break;
    }
    case LogicalForm__InputTypeEnum.SingleSelect:
    case LogicalForm__InputTypeEnum.MultiSelect: {
      // Assuming 'status' as a common single/multi-select field for various Stripe objects.
      const fieldName = filter.name.toLowerCase();
      if (fieldName === "status") {
        if (Array.isArray(filter.value)) {
            // Stripe generally expects a single status string for a direct filter.
            // For simplicity, we'll use the first selected status, if multiple are present.
            if (filter.value.length > 0) {
                stripeParams.status = filter.value[0];
            }
        } else if (filter.value) {
            stripeParams.status = filter.value.toString();
        }
      }
      // Other generic multi/single selects might not have direct, generalized Stripe mappings.
      break;
    }
    // Note: MultiAccountSelect, ConnectionSelect, ReconciliationRuleSelect typically do not have
    // direct, generalized counterparts in standard Stripe APIs for common objects like charges or payments.
  }
  return stripeParams;
}

/**
 * Request body parameters specific to the Plaid Transactions API.
 * Plaid's APIs are predominantly POST requests with JSON bodies.
 * The `/transactions/get` endpoint has specific requirements for filtering,
 * primarily supporting date ranges and account IDs.
 */
interface PlaidTransactionsRequestBody {
  /** Your Plaid client ID. This would typically come from secure configuration. */
  client_id: string;
  /** Your Plaid secret. This would typically come from secure configuration. */
  secret: string;
  /** The access token for the Plaid Item, obtained during Link flow, representing user's bank connection. */
  access_token: string;
  /** The earliest date for which to retrieve transactions, in YYYY-MM-DD format. */
  start_date: string;
  /** The latest date for which to retrieve transactions, in YYYY-MM-DD format. */
  end_date: string;
  /** Optional parameters for customizing the transaction retrieval. */
  options?: {
    /** A list of account IDs to retrieve transactions for. If omitted, transactions for all accounts are returned. */
    account_ids?: string[];
    /** The number of transactions to fetch, defaults to 100. */
    count?: number;
    /** The number of transactions to skip. */
    offset?: number;
  };
}

/**
 * Translates generic filter parameters into Plaid-specific request body structure.
 * This function primarily targets the Plaid `/transactions/get` endpoint, which has
 * limited direct filtering capabilities beyond date ranges and selected accounts.
 * Other filter types would typically require post-API call filtering.
 * @param filter The applied filter.
 * @param currentRequestBody The existing request body to merge new parameters into.
 * @returns An updated `PlaidTransactionsRequestBody` object.
 */
function translateFilterToPlaidParams(filter: AppliedFilterType, currentRequestBody: PlaidTransactionsRequestBody): PlaidTransactionsRequestBody {
  const plaidBody: PlaidTransactionsRequestBody = { ...currentRequestBody };

  switch (filter.type) {
    case LogicalForm__InputTypeEnum.DateInput: {
      const dateRange = filter.value as DateRangeFormValues;
      const { gte, lte } = convertDateRangeToGteLte(dateRange);
      if (gte) {
        plaidBody.start_date = gte.substring(0, 10); // Plaid expects YYYY-MM-DD
      }
      if (lte) {
        plaidBody.end_date = lte.substring(0, 10); // Plaid expects YYYY-MM-DD
      }
      break;
    }
    case LogicalForm__InputTypeEnum.MultiAccountSelect: {
      const accountIds = filter.value as string[];
      if (accountIds.length > 0 && !(accountIds.length === 1 && accountIds[0] === ALL_ACCOUNTS_ID_REDEFINED)) {
        if (!plaidBody.options) plaidBody.options = {};
        plaidBody.options.account_ids = accountIds;
      }
      break;
    }
    // Note: Other filter types like Amount, Counterparty, Metadata are generally
    // not directly supported for transaction filtering in Plaid's /transactions/get endpoint.
    // Implementing these would necessitate client-side filtering after data retrieval or
    // using more advanced Plaid APIs if available for specific products.
  }
  return plaidBody;
}

/**
 * Query parameters specific to the Modern Treasury API.
 * Modern Treasury's APIs typically use conventional URL query parameters,
 * often supporting range operators and array values for filters.
 */
interface ModernTreasuryQueryParams {
  [key: string]: any; // Allows for dynamic properties
  created_at_gte?: string; // ISO 8601 string for greater than or equal to creation date
  created_at_lte?: string; // ISO 8601 string for less than or equal to creation date
  amount_gte?: number; // In cents for greater than or equal to amount
  amount_lte?: number; // In cents for less than or equal to amount
  counterparty_id?: string; // Filter by a specific counterparty ID
  invoice_id?: string; // Filter by a specific invoice ID
  metadata?: { [key: string]: string }; // Filter by custom metadata key-value pairs
  status?: string | string[]; // Filter by status (supports single string or array of strings for multiple statuses)
  page?: number; // Pagination: current page number
  per_page?: number; // Pagination: number of items per page
  direction?: "asc" | "desc"; // Sorting direction
  type?: string | string[]; // Filter by type (e.g., payment order type, expected payment type)
  // Other potential filters depending on the specific Modern Treasury resource being queried
}

/**
 * Translates generic filter parameters into Modern Treasury-specific query parameters.
 * This function maps UI filter states to the field names and value formats expected
 * by the Modern Treasury API, supporting range queries, ID lookups, and metadata filters.
 * @param filter The applied filter.
 * @returns An object of Modern Treasury-compatible query parameters.
 */
function translateFilterToModernTreasuryParams(filter: AppliedFilterType): ModernTreasuryQueryParams {
  const mtParams: ModernTreasuryQueryParams = {};

  switch (filter.type) {
    case LogicalForm__InputTypeEnum.AmountInput: {
      const value = filter.value as { gte: number | null; lte: number | null };
      if (value.gte !== null && value.gte !== undefined) {
        mtParams.amount_gte = Math.round(value.gte * 100);
      }
      if (value.lte !== null && value.lte !== undefined) {
        mtParams.amount_lte = Math.round(value.lte * 100);
      }
      break;
    }
    case LogicalForm__InputTypeEnum.CounterpartySelect: {
      mtParams.counterparty_id = filter.value as string;
      break;
    }
    case LogicalForm__InputTypeEnum.InvoiceSelect: {
      mtParams.invoice_id = filter.value as string;
      break;
    }
    case LogicalForm__InputTypeEnum.DateInput: {
      const dateRange = filter.value as DateRangeFormValues;
      const { gte, lte } = convertDateRangeToGteLte(dateRange);
      if (gte) {
        mtParams.created_at_gte = gte;
      }
      if (lte) {
        mtParams.created_at_lte = lte;
      }
      break;
    }
    case LogicalForm__InputTypeEnum.MetadataInput: {
      const metadataValue = filter.value as { key: string; value: string };
      if (metadataValue?.key && metadataValue?.value) {
        if (!mtParams.metadata) mtParams.metadata = {};
        mtParams.metadata[metadataValue.key] = metadataValue.value;
      }
      break;
    }
    case LogicalForm__InputTypeEnum.SingleSelect:
    case LogicalForm__InputTypeEnum.MultiSelect: {
      // For Modern Treasury, the filter's 'name' (e.g., "Status", "Type") often directly maps to a query parameter.
      const fieldName = filter.name.toLowerCase();
      if (Array.isArray(filter.value)) {
        // Modern Treasury APIs often support array values for parameters like `status[]` or `type[]`.
        mtParams[fieldName] = filter.value;
      } else if (filter.value) {
        mtParams[fieldName] = filter.value.toString();
      }
      break;
    }
    // Note: ConnectionSelect and ReconciliationRuleSelect might map to custom tags or external_id fields
    // in Modern Treasury depending on the specific resource and configuration.
  }
  return mtParams;
}

/**
 * Merges multiple query parameter objects into one, handling potential conflicts
 * for deeply nested properties and concatenating arrays. This is crucial for
 * combining parameters generated from different applied filters into a single
 * coherent request object.
 * @param target The object into which properties from the source will be merged.
 * @param source The object whose properties will be merged into the target.
 * @returns The merged object, representing a combination of all parameters.
 */
function deepMergeQueryParams(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            // Check if both properties are non-null, non-array objects
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                // Recursively merge nested objects
                if (!target[key]) target[key] = {}; // Initialize if target doesn't have it
                deepMergeQueryParams(target[key], source[key]);
            } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
                // Concatenate unique values if both are arrays
                target[key] = Array.from(new Set([...target[key], ...source[key]]));
            } else if (source[key] !== undefined && source[key] !== null) {
                // For primitives or when types don't match for deep merge, source overwrites target
                target[key] = source[key];
            }
        }
    }
    return target;
}

/**
 * A comprehensive union type encompassing all possible query outputs.
 * This allows the `buildFilterQuery` function to return a type-safe query
 * object specific to the chosen target financial system.
 */
type GeneratedQuery = CitibankUnifiedQuery | StripeQueryParams | PlaidTransactionsRequestBody | ModernTreasuryQueryParams;

// #endregion

/**
 * Builds a comprehensive API query object from a list of applied filters,
 * specifically tailored for a chosen target financial system.
 * This is the central function of the `filterQueryEngine`. It iterates through
 * all user-applied filters and translates them into a single, structured query
 * ready for submission to the specified backend API.
 *
 * This query engine is designed to support the unified Citibank Demo Business API
 * (likely hosted at `citibankdemobusiness.dev`) as well as direct integration
 * with various underlying financial systems like Stripe, Plaid, and Modern Treasury.
 * It ensures that filter logic is correctly translated into the specific
 * query formats and parameter names required by each platform.
 *
 * @param appliedFilters An array of `AppliedFilterType` objects, representing all active filters from the UI.
 * @param targetSystem The specific financial system for which to build the query.
 *                     Defaults to "CITIBANK" for the unified Citibank Demo Business API.
 * @returns A `GeneratedQuery` object structured appropriately for the specified API consumption.
 * @throws {Error} if an unsupported target system is provided, indicating a misconfiguration
 *                 or an attempt to query an unintegrated system.
 */
function buildFilterQuery(
  appliedFilters: AppliedFilterType[],
  targetSystem: TargetSystem = "CITIBANK",
): GeneratedQuery {

  // The primary logic branches based on the target financial system.
  // Each branch constructs a query object according to the respective API's specifications.
  switch (targetSystem) {
    case "CITIBANK": {
      // For the Citibank unified API, we aggregate all generic query parameters.
      const allQueryParams: GenericQueryFilterParam[] = [];
      for (const filter of appliedFilters) {
        const params = translateFilterToQueryParams(filter); // Use the generic translator
        allQueryParams.push(...params);
      }
      return {
        filters: allQueryParams,
        page: 1, // Default pagination settings for the unified API
        pageSize: 50,
        // By default, assume the unified API should query all integrated source systems
        sourceSystems: ["STRIPE", "PLAID", "MODERN_TREASURY"],
      };
    }
    case "STRIPE": {
      // For Stripe, we merge parameters generated from individual filters into a single
      // `StripeQueryParams` object, handling Stripe's specific naming conventions and formats.
      let stripeAccumulatedParams: StripeQueryParams = {};
      for (const filter of appliedFilters) {
        const newParams = translateFilterToStripeParams(filter);
        stripeAccumulatedParams = deepMergeQueryParams(stripeAccumulatedParams, newParams);
      }
      stripeAccumulatedParams.limit = stripeAccumulatedParams.limit || 100; // Apply a default limit if not specified
      return stripeAccumulatedParams;
    }
    case "PLAID": {
      // Plaid's APIs (e.g., `/transactions/get`) have a more structured request body.
      // We initialize a base request body with common defaults and placeholders for credentials.
      let plaidRequestBody: PlaidTransactionsRequestBody = {
        client_id: "PLAID_CLIENT_ID_PLACEHOLDER", // These should come from a secure configuration service
        secret: "PLAID_SECRET_PLACEHOLDER",       // not hardcoded or generated here.
        access_token: "USER_PLAID_ACCESS_TOKEN_PLACEHOLDER", // This is dynamic per user/Item.
        start_date: "1970-01-01", // Default to epoch if no date filter is applied
        end_date: new Date().toISOString().substring(0, 10), // Default to today's date
        options: {
            count: 100, // Default count for transactions
            offset: 0 // Default offset for pagination
        }
      };

      // Plaid's filtering for transactions is primarily via date range and account IDs in the request body.
      // We process these specific filter types.
      const dateFilters = appliedFilters.filter(f => f.type === LogicalForm__InputTypeEnum.DateInput);
      if (dateFilters.length > 0) {
        // Only the last applicable date filter is used, or a combined range.
        // For simplicity here, we'll assume the most recent date filter.
        plaidRequestBody = translateFilterToPlaidParams(dateFilters[dateFilters.length - 1], plaidRequestBody);
      }

      const accountFilters = appliedFilters.filter(f => f.type === LogicalForm__InputTypeEnum.MultiAccountSelect);
      if (accountFilters.length > 0) {
        plaidRequestBody = translateFilterToPlaidParams(accountFilters[accountFilters.length - 1], plaidRequestBody);
      }

      // Other filter types are not directly supported by Plaid's /transactions/get endpoint and
      // would require client-side processing after fetching the data.
      return plaidRequestBody;
    }
    case "MODERN_TREASURY": {
      // For Modern Treasury, we accumulate query parameters, merging them deeply to handle
      // nested structures or array-based filters.
      let mtAccumulatedParams: ModernTreasuryQueryParams = {};
      for (const filter of appliedFilters) {
        const newParams = translateFilterToModernTreasuryParams(filter);
        mtAccumulatedParams = deepMergeQueryParams(mtAccumulatedParams, newParams);
      }
      mtAccumulatedParams.per_page = mtAccumulatedParams.per_page || 50; // Apply default pagination settings
      mtAccumulatedParams.page = mtAccumulatedParams.page || 1;
      return mtAccumulatedParams;
    }
    default:
      // If an unrecognized target system is requested, throw an error to indicate invalid usage.
      throw new Error(`Unsupported target system: ${targetSystem}. Please provide a valid system like 'CITIBANK', 'STRIPE', 'PLAID', or 'MODERN_TREASURY'.`);
  }
}

// #region Exports

// Export all relevant types and the main `buildFilterQuery` function.
// This allows other parts of the application to interact with the query engine
// in a type-safe manner and understand its input/output structures.
export {
  LogicalForm__InputTypeEnum,
  DateRangeFormValues,
  FilterOption,
  AppliedFilterType,
  GenericQueryFilterParam,
  CitibankUnifiedQuery,
  StripeQueryParams,
  PlaidTransactionsRequestBody,
  ModernTreasuryQueryParams,
  GeneratedQuery,
  TargetSystem,
  buildFilterQuery,
};

// #endregion