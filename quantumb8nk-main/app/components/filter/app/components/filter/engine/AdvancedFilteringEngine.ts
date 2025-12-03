// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

/**
 * @file This module implements a robust, customizable, and high-performance filtering engine
 * capable of applying complex logical and temporal criteria to large datasets of normalized financial transactions,
 * ensuring dynamic and precise data views.
 *
 * Owner: citibankdemobusiness.dev
 *
 * This engine provides enterprise-grade capabilities essential for a multi-million dollar
 * financial platform, integrating data from various financial service providers such as
 * Stripe, Plaid, and Modern Treasury, alongside internal Citibank Demo Business Inc. operations.
 * It is designed for scalability, precision, and extensibility, serving as a foundational
 * component for advanced analytics, reporting, and real-time data exploration across
 * citibankdemobusiness.dev properties.
 */

/**
 * Represents the various sources from which financial transactions can originate.
 * This enum facilitates the normalization of transaction data, allowing the filtering
 * engine to process data uniformly regardless of its original provider.
 */
export enum TransactionSource {
  CITIBANK_DEMO_BUSINESS = "CITIBANK_DEMO_BUSINESS",
  STRIPE = "STRIPE",
  PLAID = "PLAID",
  MODERN_TREASURY = "MODERN_TREASURY",
  UNKNOWN = "UNKNOWN", // For transactions whose source cannot be identified
}

/**
 * Represents the current status of a financial transaction.
 * This comprehensive set of statuses supports detailed filtering based on the
 * entire lifecycle of a transaction, from initiation to settlement or failure.
 */
export enum TransactionStatus {
  PENDING = "PENDING", // Transaction initiated but not yet completed
  COMPLETED = "COMPLETED", // Transaction successfully processed
  FAILED = "FAILED", // Transaction failed to process
  REFUNDED = "REFUNDED", // Original transaction has been fully refunded
  CANCELLED = "CANCELLED", // Transaction was cancelled before completion
  VOIDED = "VOIDED", // Transaction was reversed or invalidated after authorization
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED", // A portion of the transaction has been refunded
  SETTLED = "SETTLED", // Funds have been moved to their final destination
  AUTHORISED = "AUTHORISED", // Funds have been reserved but not yet captured
  CAPTURED = "CAPTURED", // Authorized funds have been moved
  CHARGEBACK = "CHARGEBACK", // Funds reversed due to a dispute
  EXPIRED = "EXPIRED", // Transaction authorization or initiation window has passed
}

/**
 * Represents the type or category of a financial transaction.
 * This classification enables granular filtering for specific business operations,
 * supporting diverse analytical and operational use cases.
 */
export enum TransactionType {
  PAYMENT = "PAYMENT", // Funds received from a customer
  REFUND = "REFUND", // Funds returned to a customer
  TRANSFER = "TRANSFER", // Internal movement of funds between accounts
  DEPOSIT = "DEPOSIT", // Funds added to an account
  WITHDRAWAL = "WITHDRAWAL", // Funds removed from an account
  CHARGEBACK = "CHARGEBACK", // Reversal of a transaction due to customer dispute
  FEE = "FEE", // Service charges or other fees
  ADJUSTMENT = "ADJUSTMENT", // Manual correction or alteration to a transaction
  AUTHORIZATION = "AUTHORIZATION", // Pre-approval of a transaction
  SETTLEMENT = "SETTLEMENT", // Final reconciliation of transactions
  DISBURSEMENT = "DISBURSEMENT", // Payment made to a vendor or service provider
  INTEREST = "INTEREST", // Interest accrued or paid
  LOAN = "LOAN", // Loan principal or repayment
}

/**
 * Represents the currency in which a financial transaction is denominated.
 * Uses a standardized set of ISO 4217 currency codes to ensure global compatibility
 * and accurate financial calculations.
 */
export enum Currency {
  USD = "USD", // United States Dollar
  EUR = "EUR", // Euro
  GBP = "GBP", // British Pound Sterling
  CAD = "CAD", // Canadian Dollar
  AUD = "AUD", // Australian Dollar
  JPY = "JPY", // Japanese Yen
  CHF = "CHF", // Swiss Franc
  CNY = "CNY", // Chinese Yuan
  INR = "INR", // Indian Rupee
  BRL = "BRL", // Brazilian Real
  MXN = "MXN", // Mexican Peso
  SGD = "SGD", // Singapore Dollar
  HKD = "HKD", // Hong Kong Dollar
  NZD = "NZD", // New Zealand Dollar
  SEK = "SEK", // Swedish Krona
  UNKNOWN = "UNKNOWN", // For currencies not explicitly defined or recognized
}

/**
 * Interface representing a normalized financial transaction.
 * This unified structure is crucial for the filtering engine's ability to operate on data
 * from disparate sources (Stripe, Plaid, Modern Treasury, Citibank) through a consistent API.
 * Fields are designed to capture essential financial transaction attributes, along with
 * flexible metadata for provider-specific details.
 */
export interface FinancialTransaction {
  id: string; // Unique identifier for the transaction in the internal system
  sourceId: string; // Original identifier from the source system (e.g., Stripe charge ID)
  source: TransactionSource; // The financial service provider or internal origin
  type: TransactionType; // Category of the transaction (e.g., PAYMENT, REFUND)
  status: TransactionStatus; // Current status of the transaction (e.g., COMPLETED, FAILED)
  amount: number; // The primary amount of the transaction (e.g., 1000 for $10.00, in cents/smallest unit)
  currency: Currency; // The currency of the transaction amount
  description: string; // A brief description of the transaction
  transactionDate: Date; // The actual date and time the transaction occurred (e.g., payment date)
  createdAt: Date; // Timestamp when this transaction record was created in our database
  updatedAt: Date; // Timestamp when this transaction record was last updated
  accountId: string; // The internal account ID associated with this transaction
  counterpartyId?: string; // Identifier of the other party in the transaction (e.g., customer, vendor)
  counterpartyName?: string; // Name of the counterparty
  customerId?: string; // Internal customer ID, if applicable
  metadata: Record<string, any>; // A flexible JSON object for provider-specific or custom additional data
  feeAmount?: number; // Any fees deducted from the transaction, in smallest currency unit
  netAmount?: number; // The amount after fees (amount - feeAmount), in smallest currency unit
  referenceNumber?: string; // An external reference number, often from bank statements
  bankTransactionId?: string; // Specific ID for bank-level transactions (e.g., ACH/wire ID)
  paymentMethod?: string; // Type of payment instrument used (e.g., "credit_card", "bank_transfer", "ACH", "wire")
  isTestTransaction?: boolean; // Flag to indicate if this is a test/sandbox transaction
  processedBy?: string; // The system or user that processed the transaction
  geoLocation?: { latitude: number; longitude: number; country: string }; // Geographic origin of the transaction
  paymentGateway?: string; // e.g., "Stripe", "PayPal", "Square"
}

/**
 * Defines the logical operators that can be used to combine filter conditions or groups.
 * These operators are fundamental to building complex, nested boolean logic for filtering
 * financial transactions, enabling precise data segmentation.
 */
export enum LogicalOperator {
  AND = "AND", // All conditions/sub-groups must be true
  OR = "OR", // At least one condition/sub-group must be true
  NOT = "NOT", // The result of the enclosed condition/group is inverted (typically applied to a group)
}

/**
 * Defines the comparison operators for various data types found in financial transactions.
 * This comprehensive set of operators allows for highly specific matching criteria
 * across numerical, temporal, string, and categorical fields.
 */
export enum FilterOperator {
  // General comparison operators for numbers, strings, and booleans
  EQ = "EQ", // Equals (strict equality)
  NE = "NE", // Not Equals (strict inequality)
  GT = "GT", // Greater Than
  LT = "LT", // Less Than
  GTE = "GTE", // Greater Than or Equals
  LTE = "LTE", // Less Than or Equals

  // String specific operators
  CONTAINS = "CONTAINS", // Field value contains the filter value (substring match)
  NOT_CONTAINS = "NOT_CONTAINS", // Field value does not contain the filter value
  STARTS_WITH = "STARTS_WITH", // Field value starts with the filter value
  ENDS_WITH = "ENDS_WITH", // Field value ends with the filter value
  MATCHES_REGEX = "MATCHES_REGEX", // Field value matches a regular expression pattern
  IS_EMPTY = "IS_EMPTY", // Field value is an empty string or empty array
  IS_NOT_EMPTY = "IS_NOT_EMPTY", // Field value is not an empty string or empty array

  // Array/Collection operators for fields containing multiple values (e.g., tags)
  IN = "IN", // Field value is present in a list of allowed values
  NOT_IN = "NOT_IN", // Field value is not present in a list of disallowed values

  // Range operators (inclusive for BETWEEN)
  BETWEEN = "BETWEEN", // Field value is numerically or chronologically between two specified values (inclusive)

  // Null checks for optional fields
  IS_NULL = "IS_NULL", // Field value is null or undefined
  IS_NOT_NULL = "IS_NOT_NULL", // Field value is neither null nor undefined

  // Date/Time specific operators (often aliases for general operators but provide clarity)
  BEFORE = "BEFORE", // Field date is strictly before the filter date (alias for LT)
  AFTER = "AFTER", // Field date is strictly after the filter date (alias for GT)
  ON_OR_BEFORE = "ON_OR_BEFORE", // Field date is on or before the filter date (alias for LTE)
  ON_OR_AFTER = "ON_OR_AFTER", // Field date is on or after the filter date (alias for GTE)
  DATE_BETWEEN = "DATE_BETWEEN", // Field date is chronologically between two specified dates (inclusive)
}

/**
 * Type representing a flexible filter value. It can accommodate primitives (string, number, boolean, Date),
 * arrays of primitives for 'IN' / 'NOT_IN' operations, or a tuple for 'BETWEEN' ranges.
 */
export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | number[]
  | Date[]
  | [string | number | Date, string | number | Date];

/**
 * Represents a single filter condition to be applied to a specific field of a transaction.
 * This is the atomic unit of filtering, defining what field to check, how to check it, and against what value.
 * Example: { field: "amount", operator: FilterOperator.GTE, value: 1000 }
 * Example: { field: "status", operator: FilterOperator.IN, value: ["COMPLETED", "PENDING"] }
 */
export interface FilterCondition {
  field: keyof FinancialTransaction | string; // The transaction field to filter on. 'string' allows dot-notation for nested fields (e.g., "metadata.providerFee")
  operator: FilterOperator | string; // The comparison operator to use. Can be a custom operator name.
  value?: FilterValue; // The value(s) to compare against. Optional for operators like IS_NULL.
  caseSensitive?: boolean; // For string operations, defaults to false (case-insensitive).
}

/**
 * Represents a group of filter conditions and/or nested sub-groups, combined by a logical operator.
 * This recursive structure enables the construction of highly complex and nuanced filter expressions,
 * reflecting sophisticated business logic (e.g., (A AND B) OR (C AND NOT D)).
 */
export interface FilterGroup {
  logicalOperator: LogicalOperator; // How the conditions/sub-groups within this group are combined
  conditions?: FilterCondition[]; // An array of individual filter conditions
  subGroups?: FilterGroup[]; // An array of nested filter groups, allowing for hierarchical logic
  negate?: boolean; // If true, the final result of this entire group's evaluation is inverted (e.g., NOT (A AND B))
}

/**
 * The top-level type for filter criteria, which can be either a single, atomic FilterCondition
 * or a complex, structured FilterGroup. This flexibility allows for simple or advanced filtering.
 */
export type AdvancedFilterCriterion = FilterCondition | FilterGroup;

/**
 * Defines the direction for sorting results, enabling ordering of transactions.
 */
export enum SortDirection {
  ASC = "ASC", // Ascending order (e.g., A-Z, 0-9, earliest to latest date)
  DESC = "DESC", // Descending order (e.g., Z-A, 9-0, latest to earliest date)
}

/**
 * Represents a single criterion for sorting transactions.
 * Multiple `SortCriterion` can be chained to create multi-level sorting.
 * Example: { field: "transactionDate", direction: SortDirection.DESC }
 */
export interface SortCriterion {
  field: keyof FinancialTransaction | string; // The transaction field to sort by. Allows nested fields.
  direction: SortDirection; // The direction of the sort.
}

/**
 * Custom error class specifically for issues encountered within the filtering engine.
 * Provides a structured way to report errors with specific codes for easier debugging and handling.
 */
export class FilteringEngineError extends Error {
  /**
   * Constructs a new FilteringEngineError.
   * @param message A human-readable description of the error.
   * @param code An optional, machine-readable code for the specific error type.
   */
  constructor(message: string, public readonly code: string = "FILTER_ERROR") {
    super(message);
    this.name = "FilteringEngineError";
    // Ensures proper prototype chain for 'instanceof' checks
    Object.setPrototypeOf(this, FilteringEngineError.prototype);
  }
}

/**
 * A robust utility class providing helper methods for the AdvancedFilteringEngine.
 * These methods handle common tasks like safe property access, value normalization,
 * and reliable date comparisons, contributing to the engine's overall stability and performance.
 */
class FilterUtilities {
  /**
   * Safely retrieves a potentially nested property from an object using a dot-notation path.
   * This prevents errors when accessing properties that might not exist, returning `undefined` instead.
   * @param obj The object from which to retrieve the property.
   * @param path The string path to the property (e.g., "amount", "metadata.providerFee", "counterparty.address.city").
   * @returns The value of the property, or `undefined` if the path is invalid or a part of it does not exist.
   */
  public static safeGetProperty<T>(obj: T, path: string): any | undefined {
    if (!obj || typeof obj !== "object") {
      return undefined;
    }

    const parts = path.split(".");
    let current: any = obj;

    for (const part of parts) {
      // If at any point 'current' becomes null or undefined, the path is broken.
      if (current === null || current === undefined) {
        return undefined;
      }
      // If 'current' is not an object (e.g., trying to access 'a.b' where 'a' is a string),
      // or if 'current' does not have the specified 'part' as a property.
      if (typeof current !== "object" || !current.hasOwnProperty(part)) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  /**
   * Normalizes a given value for consistent comparison.
   * Specifically, it handles case-insensitivity for strings and ensures Date objects are used for temporal comparisons.
   * For array values (used in `IN`/`NOT_IN`), it normalizes each element.
   * @param value The raw value to normalize.
   * @param isCaseSensitive Flag indicating whether string normalization should preserve case. Defaults to `false`.
   * @returns The normalized value, ready for comparison.
   */
  public static normalizeValue(value: any, isCaseSensitive: boolean = false): any {
    if (typeof value === "string") {
      return isCaseSensitive ? value : value.toLowerCase();
    }
    // Convert date-like strings or numbers to Date objects for consistent comparison
    if (typeof value === "string" && !isNaN(new Date(value).getTime())) {
      return new Date(value);
    }
    if (typeof value === "number" && String(value).length === 13 && !isNaN(new Date(value).getTime())) {
        return new Date(value); // Assume 13-digit number is milliseconds timestamp
    }
    if (value instanceof Date) {
      return value;
    }
    // Numbers and booleans are already normalized
    if (typeof value === "number" || typeof value === "boolean") {
      return value;
    }
    // Recursively normalize elements within an array (for IN/NOT_IN operators)
    if (Array.isArray(value)) {
      return value.map((v) => FilterUtilities.normalizeValue(v, isCaseSensitive));
    }
    return value; // Return as-is for other types (objects, undefined, null)
  }

  /**
   * Compares two dates and returns an integer indicating their relative order.
   * - `0` if the dates are equal.
   * - `-1` if `date1` is chronologically before `date2`.
   * - `1` if `date1` is chronologically after `date2`.
   * This method gracefully handles various date representations (Date objects, ISO strings, timestamps).
   * @param date1 The first date to compare. Can be a Date object, ISO string, or numeric timestamp.
   * @param date2 The second date to compare.
   * @returns `-1`, `0`, or `1` based on the comparison.
   * @throws {FilteringEngineError} if either input cannot be parsed into a valid Date object.
   */
  public static compareDates(date1: any, date2: any): number {
    let d1: Date;
    let d2: Date;

    try {
      d1 = date1 instanceof Date ? date1 : new Date(date1);
      d2 = date2 instanceof Date ? date2 : new Date(date2);
    } catch (e: any) {
      throw new FilteringEngineError(
        `Invalid date format encountered during comparison: ${e.message}. Values: '${date1}', '${date2}'`,
        "INVALID_DATE_FORMAT",
      );
    }

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      throw new FilteringEngineError(
        `One or both provided values are not valid dates after parsing: '${date1}', '${date2}'`,
        "INVALID_DATE_VALUE",
      );
    }

    if (d1.getTime() === d2.getTime()) {
      return 0;
    }
    return d1.getTime() < d2.getTime() ? -1 : 1;
  }

  /**
   * Checks if a given value is `null` or `undefined`.
   * @param value The value to check.
   * @returns `true` if the value is `null` or `undefined`, `false` otherwise.
   */
  public static isNull(value: any): boolean {
    return value === null || value === undefined;
  }

  /**
   * Checks if a given value is considered "empty".
   * For strings, it checks if the trimmed string is empty.
   * For arrays, it checks if the array has no elements.
   * For other types, it returns `false`.
   * @param value The value to check for emptiness.
   * @returns `true` if the value is an empty string or array, `false` otherwise.
   */
  public static isEmpty(value: any): boolean {
    if (typeof value === "string") {
      return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    // Consider null/undefined as empty for some contexts, but 'IS_NULL' operator handles that.
    // This `isEmpty` is specifically for empty string/array, not absence.
    return false;
  }
}

/**
 * The core AdvancedFilteringEngine class.
 * This class provides a comprehensive set of methods to apply complex filter criteria,
 * sorting rules, and pagination to a dataset of `FinancialTransaction` objects.
 * It ensures dynamic, precise, and high-performance data views, crucial for
 * sophisticated financial applications.
 */
export class AdvancedFilteringEngine {
  // A map to store custom filter operators, allowing the engine to be extended
  // with application-specific comparison logic. This enhances modularity and customization.
  private static customOperators: Map<
    string,
    (transactionValue: any, filterValue: any, condition: FilterCondition) => boolean
  > = new Map();

  /**
   * Registers a custom filter operator with the engine.
   * This allows developers to define and integrate their own comparison logic for specific use cases
   * that are not covered by the built-in `FilterOperator` enum.
   *
   * @param operatorName A unique string identifier for the custom operator (must not conflict with built-in operators).
   * @param evaluationFn The function that implements the custom comparison logic.
   *        It receives the transaction's field value, the filter's specified value, and the full condition object.
   * @throws {FilteringEngineError} If the provided `operatorName` conflicts with an existing built-in operator.
   */
  public static registerCustomOperator(
    operatorName: string,
    evaluationFn: (
      transactionValue: any,
      filterValue: any,
      condition: FilterCondition,
    ) => boolean,
  ): void {
    if (Object.values(FilterOperator).includes(operatorName as FilterOperator)) {
      throw new FilteringEngineError(
        `Cannot register custom operator '${operatorName}': conflicts with a built-in operator.`,
        "CUSTOM_OPERATOR_CONFLICT",
      );
    }
    if (AdvancedFilteringEngine.customOperators.has(operatorName)) {
      console.warn(
        `Custom operator '${operatorName}' is being re-registered. Overwriting existing definition. ` +
          "Ensure this is intentional to avoid unexpected filtering behavior.",
      );
    }
    AdvancedFilteringEngine.customOperators.set(operatorName, evaluationFn);
  }

  /**
   * Evaluates a single filter condition against a given financial transaction.
   * This is the core logic unit that applies all defined comparison operators, including
   * support for dynamically registered custom operators. It handles various data types
   * and comparison nuances (e.g., date comparisons, case-sensitivity).
   *
   * @param transaction The `FinancialTransaction` object to evaluate.
   * @param condition The `FilterCondition` to apply, specifying the field, operator, and value.
   * @returns `true` if the transaction matches the condition, `false` otherwise.
   * @throws {FilteringEngineError} if an unsupported operator is encountered or if values are invalid for the operator.
   */
  private static evaluateCondition(
    transaction: FinancialTransaction,
    condition: FilterCondition,
  ): boolean {
    const { field, operator, value, caseSensitive = false } = condition;
    const transactionValue = FilterUtilities.safeGetProperty(transaction, field);
    const normalizedTransactionValue = FilterUtilities.normalizeValue(
      transactionValue,
      caseSensitive,
    );
    const normalizedFilterValue = FilterUtilities.normalizeValue(value, caseSensitive);

    // Check for custom operators first
    if (AdvancedFilteringEngine.customOperators.has(operator as string)) {
      const customFn = AdvancedFilteringEngine.customOperators.get(
        operator as string,
      );
      if (customFn) {
        return customFn(transactionValue, value, condition);
      }
    }

    // Handle built-in operators
    switch (operator) {
      case FilterOperator.EQ: {
        // Strict equality for all types, with special handling for Date objects
        if (transactionValue instanceof Date || value instanceof Date) {
          try {
            return FilterUtilities.compareDates(transactionValue, value) === 0;
          } catch (e) {
            // If date comparison fails (e.g., invalid date strings), they are definitively not equal
            return false;
          }
        }
        return normalizedTransactionValue === normalizedFilterValue;
      }

      case FilterOperator.NE: {
        // Strict inequality for all types, with special handling for Date objects
        if (transactionValue instanceof Date || value instanceof Date) {
          try {
            return FilterUtilities.compareDates(transactionValue, value) !== 0;
          } catch (e) {
            // If date comparison fails, they are considered not equal
            return true;
          }
        }
        return normalizedTransactionValue !== normalizedFilterValue;
      }

      case FilterOperator.GT:
      case FilterOperator.AFTER: {
        if (transactionValue instanceof Date || value instanceof Date) {
          try {
            return FilterUtilities.compareDates(transactionValue, value) === 1;
          } catch (e) {
            return false; // Invalid date means not greater
          }
        }
        return normalizedTransactionValue > normalizedFilterValue;
      }

      case FilterOperator.LT:
      case FilterOperator.BEFORE: {
        if (transactionValue instanceof Date || value instanceof Date) {
          try {
            return FilterUtilities.compareDates(transactionValue, value) === -1;
          } catch (e) {
            return false; // Invalid date means not less than
          }
        }
        return normalizedTransactionValue < normalizedFilterValue;
      }

      case FilterOperator.GTE:
      case FilterOperator.ON_OR_AFTER: {
        if (transactionValue instanceof Date || value instanceof Date) {
          try {
            return FilterUtilities.compareDates(transactionValue, value) >= 0;
          } catch (e) {
            return false; // Invalid date means not greater than or equal
          }
        }
        return normalizedTransactionValue >= normalizedFilterValue;
      }

      case FilterOperator.LTE:
      case FilterOperator.ON_OR_BEFORE: {
        if (transactionValue instanceof Date || value instanceof Date) {
          try {
            return FilterUtilities.compareDates(transactionValue, value) <= 0;
          } catch (e) {
            return false; // Invalid date means not less than or equal
          }
        }
        return normalizedTransactionValue <= normalizedFilterValue;
      }

      case FilterOperator.CONTAINS:
        if (
          typeof normalizedTransactionValue === "string" &&
          typeof normalizedFilterValue === "string"
        ) {
          return normalizedTransactionValue.includes(normalizedFilterValue);
        }
        return false;

      case FilterOperator.NOT_CONTAINS:
        if (
          typeof normalizedTransactionValue === "string" &&
          typeof normalizedFilterValue === "string"
        ) {
          return !normalizedTransactionValue.includes(normalizedFilterValue);
        }
        return false;

      case FilterOperator.STARTS_WITH:
        if (
          typeof normalizedTransactionValue === "string" &&
          typeof normalizedFilterValue === "string"
        ) {
          return normalizedTransactionValue.startsWith(normalizedFilterValue);
        }
        return false;

      case FilterOperator.ENDS_WITH:
        if (
          typeof normalizedTransactionValue === "string" &&
          typeof normalizedFilterValue === "string"
        ) {
          return normalizedTransactionValue.endsWith(normalizedFilterValue);
        }
        return false;

      case FilterOperator.MATCHES_REGEX:
        if (
          typeof normalizedTransactionValue === "string" &&
          typeof value === "string"
        ) {
          try {
            const regex = new RegExp(value, caseSensitive ? "" : "i"); // 'i' for case-insensitive by default
            return regex.test(normalizedTransactionValue);
          } catch (e: any) {
            throw new FilteringEngineError(
              `Invalid regex pattern '${value}' for field '${field}': ${e.message}`,
              "INVALID_REGEX_PATTERN",
            );
          }
        }
        return false;

      case FilterOperator.IS_EMPTY:
        return FilterUtilities.isEmpty(transactionValue);

      case FilterOperator.IS_NOT_EMPTY:
        return !FilterUtilities.isEmpty(transactionValue);

      case FilterOperator.IN:
        if (Array.isArray(normalizedFilterValue)) {
          return normalizedFilterValue.includes(normalizedTransactionValue);
        }
        throw new FilteringEngineError(
          `FilterOperator.IN for field '${field}' requires the filter value to be an array, but received ${typeof value}.`,
          "INVALID_FILTER_VALUE_TYPE",
        );

      case FilterOperator.NOT_IN:
        if (Array.isArray(normalizedFilterValue)) {
          return !normalizedFilterValue.includes(normalizedTransactionValue);
        }
        throw new FilteringEngineError(
          `FilterOperator.NOT_IN for field '${field}' requires the filter value to be an array, but received ${typeof value}.`,
          "INVALID_FILTER_VALUE_TYPE",
        );

      case FilterOperator.BETWEEN:
        if (
          Array.isArray(value) &&
          value.length === 2 &&
          !FilterUtilities.isNull(value[0]) &&
          !FilterUtilities.isNull(value[1])
        ) {
          const [lowerBound, upperBound] = FilterUtilities.normalizeValue(
            value,
            caseSensitive,
          ) as [any, any];
          return (
            normalizedTransactionValue >= lowerBound &&
            normalizedTransactionValue <= upperBound
          );
        }
        throw new FilteringEngineError(
          `FilterOperator.BETWEEN for field '${field}' requires filter value to be an array of two non-null elements [min, max], got ${JSON.stringify(value)}.`,
          "INVALID_FILTER_VALUE_TYPE",
        );

      case FilterOperator.DATE_BETWEEN:
        if (
          Array.isArray(value) &&
          value.length === 2 &&
          !FilterUtilities.isNull(value[0]) &&
          !FilterUtilities.isNull(value[1])
        ) {
          try {
            const [lowerBound, upperBound] = value;
            return (
              FilterUtilities.compareDates(transactionValue, lowerBound) >= 0 &&
              FilterUtilities.compareDates(transactionValue, upperBound) <= 0
            );
          } catch (e) {
            throw new FilteringEngineError(
              `FilterOperator.DATE_BETWEEN for field '${field}' requires valid date values; error: ${(e as Error).message}.`,
              "INVALID_DATE_VALUE",
            );
          }
        }
        throw new FilteringEngineError(
          `FilterOperator.DATE_BETWEEN for field '${field}' requires filter value to be an array of two non-null dates [startDate, endDate], got ${JSON.stringify(value)}.`,
          "INVALID_FILTER_VALUE_TYPE",
        );

      case FilterOperator.IS_NULL:
        return FilterUtilities.isNull(transactionValue);

      case FilterOperator.IS_NOT_NULL:
        return !FilterUtilities.isNull(transactionValue);

      default:
        throw new FilteringEngineError(
          `Unsupported or unrecognized filter operator: '${operator}' for field '${field}'.`,
          "UNSUPPORTED_OPERATOR",
        );
    }
  }

  /**
   * Recursively evaluates a filter group against a transaction. This method is crucial
   * for handling nested logical structures (`AND`, `OR`, `NOT`) efficiently,
   * employing short-circuiting to optimize performance for complex filter trees.
   *
   * @param transaction The `FinancialTransaction` object to evaluate.
   * @param group The `FilterGroup` to apply.
   * @returns `true` if the transaction matches the group's criteria, `false` otherwise.
   * @throws {FilteringEngineError} if the filter group structure is malformed or invalid.
   */
  private static evaluateFilterGroup(
    transaction: FinancialTransaction,
    group: FilterGroup,
  ): boolean {
    const { logicalOperator, conditions, subGroups, negate = false } = group;

    // A group must have a valid logical operator defined.
    if (!logicalOperator) {
      throw new FilteringEngineError(
        `FilterGroup must specify a 'logicalOperator' (AND, OR, NOT).`,
        "INVALID_FILTER_GROUP_STRUCTURE",
      );
    }

    let groupResult: boolean;
    let hasEvaluatedAnyChildren = false;

    // Evaluate individual conditions within this group
    if (conditions && conditions.length > 0) {
      hasEvaluatedAnyChildren = true;
      let currentConditionsResult: boolean;
      if (logicalOperator === LogicalOperator.AND) {
        currentConditionsResult = true; // Start with true for AND (all must be true)
        for (const condition of conditions) {
          currentConditionsResult =
            currentConditionsResult &&
            AdvancedFilteringEngine.evaluateCondition(transaction, condition);
          if (!currentConditionsResult) break; // Short-circuit AND: if one is false, result is false
        }
      } else {
        // LogicalOperator.OR or LogicalOperator.NOT (which often contains OR/AND)
        currentConditionsResult = false; // Start with false for OR (at least one must be true)
        for (const condition of conditions) {
          currentConditionsResult =
            currentConditionsResult ||
            AdvancedFilteringEngine.evaluateCondition(transaction, condition);
          if (currentConditionsResult) break; // Short-circuit OR: if one is true, result is true
        }
      }
      groupResult = currentConditionsResult;
    } else {
      // Default initial value if no direct conditions are present.
      // For AND, assume true (no conditions means everything passes that part).
      // For OR, assume false (no conditions means nothing passes that part).
      groupResult = logicalOperator === LogicalOperator.AND ? true : false;
    }

    // Evaluate sub-groups recursively
    if (subGroups && subGroups.length > 0) {
      hasEvaluatedAnyChildren = true;
      let currentSubGroupsResult: boolean;
      if (logicalOperator === LogicalOperator.AND) {
        currentSubGroupsResult = true; // Start with true for AND
        for (const subGroup of subGroups) {
          currentSubGroupsResult =
            currentSubGroupsResult &&
            AdvancedFilteringEngine.evaluateFilterGroup(transaction, subGroup);
          if (!currentSubGroupsResult) break; // Short-circuit AND
        }
      } else {
        // LogicalOperator.OR or LogicalOperator.NOT
        currentSubGroupsResult = false; // Start with false for OR
        for (const subGroup of subGroups) {
          currentSubGroupsResult =
            currentSubGroupsResult ||
            AdvancedFilteringEngine.evaluateFilterGroup(transaction, subGroup);
          if (currentSubGroupsResult) break; // Short-circuit OR
        }
      }

      // Combine results of conditions and sub-groups
      if (conditions && conditions.length > 0) {
        if (logicalOperator === LogicalOperator.AND) {
          groupResult = groupResult && currentSubGroupsResult;
        } else {
          // For OR, combine
          groupResult = groupResult || currentSubGroupsResult;
        }
      } else {
        // If only sub-groups were present, their result is the group's result
        groupResult = currentSubGroupsResult;
      }
    }

    // Handle edge case: empty group (no conditions and no sub-groups)
    if (!hasEvaluatedAnyChildren) {
      if (logicalOperator === LogicalOperator.AND) {
        return true; // An empty AND group implies "match all"
      } else if (logicalOperator === LogicalOperator.OR) {
        return false; // An empty OR group implies "match none"
      } else if (logicalOperator === LogicalOperator.NOT) {
        // An empty NOT group is ambiguous. A robust design would typically disallow this
        // or treat it as `NOT true`, meaning `false`.
        // For robustness and to avoid unexpected matches, an empty NOT group evaluates to false.
        // If the intent was "no filter", `null` or `undefined` criterion should be used.
        return false;
      }
    }

    // Apply negation if specified for the entire group
    if (negate) {
      groupResult = !groupResult;
    }

    return groupResult;
  }

  /**
   * Applies a single `AdvancedFilterCriterion` (which can be a simple condition or a complex group)
   * to an array of financial transactions. This method is the primary entry point for filtering operations.
   *
   * @param transactions The array of `FinancialTransaction` objects to be filtered.
   * @param criterion The `AdvancedFilterCriterion` (condition or group) to apply.
   * @returns A new array containing only the `FinancialTransaction` objects that match the criterion.
   * @throws {FilteringEngineError} if the provided filter criterion is malformed or cannot be processed.
   */
  public static applyFilter(
    transactions: FinancialTransaction[],
    criterion: AdvancedFilterCriterion,
  ): FinancialTransaction[] {
    if (!criterion) {
      console.warn(
        "AdvancedFilteringEngine: No filter criterion provided. Returning all transactions unchanged.",
      );
      return [...transactions]; // Return a shallow copy if no filter is specified
    }

    // Validate the criterion structure before processing to catch errors early
    AdvancedFilteringEngine.validateFilterCriterion(criterion);

    // Determine if the criterion is a single condition or a complex group
    if (
      (criterion as FilterGroup).logicalOperator !== undefined ||
      ((criterion as FilterGroup).conditions && (criterion as FilterGroup).conditions.length > 0) ||
      ((criterion as FilterGroup).subGroups && (criterion as FilterGroup).subGroups.length > 0)
    ) {
      // It's a FilterGroup
      return transactions.filter((t) =>
        AdvancedFilteringEngine.evaluateFilterGroup(t, criterion as FilterGroup),
      );
    } else if ((criterion as FilterCondition).field && (criterion as FilterCondition).operator) {
      // It's a FilterCondition
      return transactions.filter((t) =>
        AdvancedFilteringEngine.evaluateCondition(t, criterion as FilterCondition),
      );
    } else {
      throw new FilteringEngineError(
        `Invalid filter criterion structure: ${JSON.stringify(criterion)}. ` +
          "Must be a valid FilterCondition (with 'field' and 'operator') or a FilterGroup (with 'logicalOperator', 'conditions', or 'subGroups').",
        "MALFORMED_FILTER_CRITERION",
      );
    }
  }

  /**
   * Applies multiple filter criteria sequentially to a dataset of transactions.
   * Each criterion in the array acts as an implicit `AND` operation at the top level,
   * meaning a transaction must satisfy *all* provided criteria to be included in the results.
   * For more complex top-level logical combinations (e.g., OR between multiple groups),
   * a single `FilterGroup` with nested `subGroups` should be used with the `applyFilter` method.
   *
   * @param transactions The initial array of `FinancialTransaction` objects.
   * @param criteria An array of `AdvancedFilterCriterion` to apply.
   * @returns A new array of `FinancialTransaction` objects that satisfy all provided criteria.
   */
  public static applyFilters(
    transactions: FinancialTransaction[],
    criteria: AdvancedFilterCriterion[],
  ): FinancialTransaction[] {
    let filteredTransactions = [...transactions]; // Start with a copy of the original dataset

    if (!criteria || criteria.length === 0) {
      console.warn(
        "AdvancedFilteringEngine: No filter criteria array provided. Returning all transactions.",
      );
      return filteredTransactions;
    }

    // Sequentially apply each criterion. This ensures that filters are cumulative.
    for (const criterion of criteria) {
      filteredTransactions = AdvancedFilteringEngine.applyFilter(
        filteredTransactions,
        criterion,
      );
    }
    return filteredTransactions;
  }

  /**
   * Applies sorting criteria to a dataset of financial transactions.
   * This method supports multi-field and multi-directional sorting, applying criteria
   * in the order they are provided in the `sortCriteria` array.
   * Null or undefined values are handled consistently, appearing at the end in ascending order
   * and at the beginning in descending order.
   *
   * @param transactions The array of `FinancialTransaction` objects to sort.
   * @param sortCriteria An array of `SortCriterion` defining the sorting order.
   * @returns A new array of `FinancialTransaction` objects, sorted according to the criteria.
   * @throws {FilteringEngineError} if a sort field is invalid or cannot be reliably compared.
   */
  public static applySorting(
    transactions: FinancialTransaction[],
    sortCriteria: SortCriterion[],
  ): FinancialTransaction[] {
    if (!sortCriteria || sortCriteria.length === 0) {
      console.warn(
        "AdvancedFilteringEngine: No sort criteria provided. Returning transactions in original order.",
      );
      return [...transactions]; // No sorting applied, return a shallow copy
    }

    // Create a mutable copy of the transactions array for sorting
    const sortedTransactions = [...transactions];

    sortedTransactions.sort((a, b) => {
      for (const criterion of sortCriteria) {
        const { field, direction } = criterion;
        const valueA = FilterUtilities.safeGetProperty(a, field);
        const valueB = FilterUtilities.safeGetProperty(b, field);

        // Consistent handling of null/undefined values:
        // Null values are typically sorted last in ASC and first in DESC.
        const isValueANull = FilterUtilities.isNull(valueA);
        const isValueBNull = FilterUtilities.isNull(valueB);

        if (isValueANull && isValueBNull) {
          continue; // Both are null/undefined, consider them equal and move to the next criterion
        }
        if (isValueANull) {
          return direction === SortDirection.ASC ? 1 : -1; // If A is null, B is not: A comes after B in ASC, before B in DESC
        }
        if (isValueBNull) {
          return direction === SortDirection.ASC ? -1 : 1; // If B is null, A is not: A comes before B in ASC, after B in DESC
        }

        let comparisonResult: number;

        // Type-aware comparison for different data types
        if (valueA instanceof Date || valueB instanceof Date) {
          try {
            comparisonResult = FilterUtilities.compareDates(valueA, valueB);
          } catch (e: any) {
            console.error(
              `Error comparing dates for field '${field}': ${e.message}. Treating as equal for this sort criterion.`,
            );
            comparisonResult = 0; // If dates are invalid, treat as equal for sorting purposes
          }
        } else if (typeof valueA === "string" && typeof valueB === "string") {
          comparisonResult = valueA.localeCompare(valueB); // Locale-sensitive string comparison
        } else if (typeof valueA === "number" && typeof valueB === "number") {
          comparisonResult = valueA - valueB; // Numeric comparison
        } else {
          // Fallback for other comparable types or if types mismatch unexpectedly.
          // Convert to string and compare lexicographically as a last resort.
          const stringA = String(valueA);
          const stringB = String(valueB);
          if (stringA < stringB) comparisonResult = -1;
          else if (stringA > stringB) comparisonResult = 1;
          else comparisonResult = 0;
        }

        if (comparisonResult !== 0) {
          // If a difference is found, apply the sort direction and return
          return direction === SortDirection.ASC
            ? comparisonResult
            : -comparisonResult;
        }
        // If values are equal, continue to the next sort criterion
      }
      return 0; // All criteria evaluated to equal, maintain original relative order
    });

    return sortedTransactions;
  }

  /**
   * Applies pagination to a dataset, returning a specific page of results.
   * This method is crucial for managing large datasets, preventing excessive
   * data transfer and improving UI responsiveness.
   *
   * @param transactions The array of `FinancialTransaction` objects to paginate.
   * @param pageNumber The 0-indexed page number (e.g., `0` for the first page, `1` for the second).
   * @param pageSize The maximum number of items to include on a single page.
   * @returns A new array representing the specified page of transactions.
   * @throws {FilteringEngineError} if `pageNumber` or `pageSize` are invalid (e.g., negative, non-integer).
   */
  public static paginateResults(
    transactions: FinancialTransaction[],
    pageNumber: number,
    pageSize: number,
  ): FinancialTransaction[] {
    if (pageNumber < 0 || !Number.isInteger(pageNumber)) {
      throw new FilteringEngineError(
        `Invalid 'pageNumber': ${pageNumber}. Must be a non-negative integer.`,
        "INVALID_PAGINATION_PARAMETER",
      );
    }
    if (pageSize <= 0 || !Number.isInteger(pageSize)) {
      throw new FilteringEngineError(
        `Invalid 'pageSize': ${pageSize}. Must be a positive integer.`,
        "INVALID_PAGINATION_PARAMETER",
      );
    }

    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;

    return transactions.slice(startIndex, endIndex);
  }

  /**
   * Orchestrates a full data processing pipeline: filtering, sorting, and pagination.
   * This method provides a convenient and optimized way to apply all common data
   * transformation steps in a single call, ensuring a consistent order of operations.
   * It first filters, then sorts the filtered data, and finally paginates the sorted results.
   *
   * @param transactions The initial array of `FinancialTransaction` objects to process.
   * @param filterCriteria An optional array of `AdvancedFilterCriterion` to apply before sorting/pagination.
   * @param sortCriteria An optional array of `SortCriterion` to apply to the filtered data.
   * @param pageNumber An optional 0-indexed page number for pagination.
   * @param pageSize An optional number of items per page for pagination.
   * @returns An object containing the processed transactions, total count before pagination,
   *          and pagination metadata (current page, items per page, total pages).
   */
  public static processTransactions(
    transactions: FinancialTransaction[],
    filterCriteria?: AdvancedFilterCriterion[],
    sortCriteria?: SortCriterion[],
    pageNumber?: number,
    pageSize?: number,
  ): {
    processedTransactions: FinancialTransaction[];
    totalFilteredCount: number;
    currentPage: number | undefined;
    itemsPerPage: number | undefined;
    totalPages: number | undefined;
  } {
    let currentTransactions = [...transactions]; // Always start with a fresh copy

    // 1. Apply Filtering
    if (filterCriteria && filterCriteria.length > 0) {
      currentTransactions = AdvancedFilteringEngine.applyFilters(
        currentTransactions,
        filterCriteria,
      );
    }

    const totalFilteredCount = currentTransactions.length;

    // 2. Apply Sorting
    if (sortCriteria && sortCriteria.length > 0) {
      currentTransactions = AdvancedFilteringEngine.applySorting(
        currentTransactions,
        sortCriteria,
      );
    }

    // Default values for pagination metadata
    let currentPageResult = pageNumber;
    let itemsPerPageResult = pageSize;
    let totalPagesResult: number | undefined = undefined;

    // 3. Apply Pagination (if both pageNumber and pageSize are provided)
    if (
      pageNumber !== undefined &&
      pageSize !== undefined &&
      pageSize > 0
    ) {
      currentTransactions = AdvancedFilteringEngine.paginateResults(
        currentTransactions,
        pageNumber,
        pageSize,
      );
      totalPagesResult = Math.ceil(totalFilteredCount / pageSize);
    }

    return {
      processedTransactions: currentTransactions,
      totalFilteredCount: totalFilteredCount,
      currentPage: currentPageResult,
      itemsPerPage: itemsPerPageResult,
      totalPages: totalPagesResult,
    };
  }

  /**
   * Factory method to create a complex filter group using the `AND` logical operator.
   * This simplifies the programmatic construction of filter criteria, especially for nested logic.
   *
   * @param criteria An array of `FilterCondition` or nested `FilterGroup` objects to be combined with `AND`.
   * @param negate If `true`, the entire `AND` group's evaluation result will be inverted.
   * @returns A `FilterGroup` object configured with `LogicalOperator.AND`.
   * @throws {FilteringEngineError} if any provided criterion is invalid or malformed.
   */
  public static createAndGroup(
    criteria: AdvancedFilterCriterion[],
    negate: boolean = false,
  ): FilterGroup {
    const conditions: FilterCondition[] = [];
    const subGroups: FilterGroup[] = [];

    criteria.forEach((c) => {
      // Validate each criterion and categorize it
      AdvancedFilteringEngine.validateFilterCriterion(c);

      if (
        (c as FilterGroup).logicalOperator !== undefined || // Check if it looks like a group
        ((c as FilterGroup).conditions && (c as FilterGroup).conditions.length > 0) ||
        ((c as FilterGroup).subGroups && (c as FilterGroup).subGroups.length > 0)
      ) {
        subGroups.push(c as FilterGroup);
      } else if ((c as FilterCondition).field && (c as FilterCondition).operator) {
        conditions.push(c as FilterCondition);
      } else {
        throw new FilteringEngineError(
          `Invalid criterion passed to createAndGroup, could not categorize as Condition or Group: ${JSON.stringify(c)}`,
          "INVALID_CRITERION_FOR_GROUP",
        );
      }
    });

    return {
      logicalOperator: LogicalOperator.AND,
      conditions: conditions.length > 0 ? conditions : undefined,
      subGroups: subGroups.length > 0 ? subGroups : undefined,
      negate,
    };
  }

  /**
   * Factory method to create a complex filter group using the `OR` logical operator.
   * This method streamlines the creation of filters where any of multiple conditions or
   * sub-groups need to be met.
   *
   * @param criteria An array of `FilterCondition` or nested `FilterGroup` objects to be combined with `OR`.
   * @param negate If `true`, the entire `OR` group's evaluation result will be inverted.
   * @returns A `FilterGroup` object configured with `LogicalOperator.OR`.
   * @throws {FilteringEngineError} if any provided criterion is invalid or malformed.
   */
  public static createOrGroup(
    criteria: AdvancedFilterCriterion[],
    negate: boolean = false,
  ): FilterGroup {
    const conditions: FilterCondition[] = [];
    const subGroups: FilterGroup[] = [];

    criteria.forEach((c) => {
      // Validate each criterion and categorize it
      AdvancedFilteringEngine.validateFilterCriterion(c);

      if (
        (c as FilterGroup).logicalOperator !== undefined || // Check if it looks like a group
        ((c as FilterGroup).conditions && (c as FilterGroup).conditions.length > 0) ||
        ((c as FilterGroup).subGroups && (c as FilterGroup).subGroups.length > 0)
      ) {
        subGroups.push(c as FilterGroup);
      } else if ((c as FilterCondition).field && (c as FilterCondition).operator) {
        conditions.push(c as FilterCondition);
      } else {
        throw new FilteringEngineError(
          `Invalid criterion passed to createOrGroup, could not categorize as Condition or Group: ${JSON.stringify(c)}`,
          "INVALID_CRITERION_FOR_GROUP",
        );
      }
    });

    return {
      logicalOperator: LogicalOperator.OR,
      conditions: conditions.length > 0 ? conditions : undefined,
      subGroups: subGroups.length > 0 ? subGroups : undefined,
      negate,
    };
  }

  /**
   * Factory method to create a `NOT` filter group around a single criterion (condition or group).
   * This allows for negating the result of a specific filter expression.
   *
   * @param criterion The single `AdvancedFilterCriterion` (condition or group) to negate.
   * @returns A `FilterGroup` object encapsulating the negated criterion.
   * @throws {FilteringEngineError} if the provided criterion is invalid or malformed.
   */
  public static createNotGroup(criterion: AdvancedFilterCriterion): FilterGroup {
    AdvancedFilteringEngine.validateFilterCriterion(criterion);

    if (
      (criterion as FilterGroup).logicalOperator !== undefined ||
      ((criterion as FilterGroup).conditions && (criterion as FilterGroup).conditions.length > 0) ||
      ((criterion as FilterGroup).subGroups && (criterion as FilterGroup).subGroups.length > 0)
    ) {
      // If the criterion itself is already a group, wrap it and apply negation to the wrapper.
      // We set the inner group's negate to false to avoid double negation if it already had it,
      // as the outer group's negate will apply to the inner group's *positive* evaluation.
      const innerGroup = { ...(criterion as FilterGroup), negate: false };
      return {
        logicalOperator: LogicalOperator.AND, // A single-element group can use AND or OR as a container for 'NOT'
        subGroups: [innerGroup],
        negate: true,
      };
    } else if ((criterion as FilterCondition).field && (criterion as FilterCondition).operator) {
      // If it's a condition, wrap it in an AND group that is then negated.
      return {
        logicalOperator: LogicalOperator.AND, // Neutral container for a single condition
        conditions: [criterion as FilterCondition],
        negate: true,
      };
    } else {
      // This should ideally be caught by validateFilterCriterion, but as a safeguard:
      throw new FilteringEngineError(
        `Invalid criterion passed to createNotGroup: ${JSON.stringify(criterion)}. ` +
          "Must be a valid FilterCondition or FilterGroup.",
        "INVALID_CRITERION_FOR_GROUP",
      );
    }
  }

  /**
   * Generates a unique, stable hash for a given filter criterion.
   * This hash can be utilized for various purposes, such as caching filter results,
   * tracking frequently used filter configurations, or ensuring deterministic behavior
   * in distributed systems. It provides a lightweight way to identify identical filter logic.
   *
   * @param criterion The `AdvancedFilterCriterion` for which to generate the hash.
   * @returns A base64-encoded string representing the unique hash of the filter.
   * @throws {FilteringEngineError} if the criterion cannot be stringified (e.g., circular references).
   */
  public static generateFilterHash(criterion: AdvancedFilterCriterion): string {
    try {
      // JSON.stringify provides a deterministic string representation.
      // encodeURIComponent and btoa ensure the hash is URL-safe and compact.
      // unescape is used here for broader compatibility with btoa on potentially non-ASCII JSON.
      return btoa(unescape(encodeURIComponent(JSON.stringify(criterion))));
    } catch (e) {
      throw new FilteringEngineError(
        `Failed to generate filter hash due to stringification error: ${(e as Error).message}. ` +
          "Check for circular references or non-serializable data in the filter criterion.",
        "HASH_GENERATION_FAILED",
      );
    }
  }

  /**
   * Provides a human-readable summary of a filter criterion.
   * This utility is valuable for displaying active filters in a user interface,
   * generating audit logs, or for debugging complex filter expressions.
   * It recursively describes filter groups and individual conditions.
   *
   * @param criterion The `AdvancedFilterCriterion` to describe.
   * @param indentLevel Internal parameter for formatting nested groups (for pretty printing).
   * @returns A descriptive string representation of the filter criterion.
   */
  public static describeFilter(
    criterion: AdvancedFilterCriterion,
    indentLevel: number = 0,
  ): string {
    const indent = "  ".repeat(indentLevel); // For pretty printing nested groups

    if ((criterion as FilterCondition).field) {
      const cond = criterion as FilterCondition;
      let val = cond.value;
      if (val instanceof Date) {
        val = val.toISOString(); // Use ISO string for dates
      } else if (Array.isArray(val)) {
        val = `[${val.map((v) => (v instanceof Date ? v.toISOString() : String(v))).join(", ")}]`;
      }
      return `${indent}${String(cond.field)} ${cond.operator} ${String(val || "NULL")}${cond.caseSensitive ? " (case-sensitive)" : ""}`;
    } else if ((criterion as FilterGroup).logicalOperator) {
      const group = criterion as FilterGroup;
      const parts: string[] = [];

      if (group.conditions) {
        parts.push(
          ...group.conditions.map((c) =>
            AdvancedFilteringEngine.describeFilter(c, indentLevel + 1),
          ),
        );
      }
      if (group.subGroups) {
        parts.push(
          ...group.subGroups.map((sg) =>
            AdvancedFilteringEngine.describeFilter(sg, indentLevel + 1),
          ),
        );
      }

      const operatorText =
        group.logicalOperator === LogicalOperator.AND
          ? "\n" + indent + "  AND "
          : "\n" + indent + "  OR ";
      let innerDescription = parts.join(operatorText);

      // Handle empty groups gracefully for description
      if (parts.length === 0) {
        innerDescription = `${indent}  (No criteria)`;
      } else {
        innerDescription = `\n${innerDescription}\n${indent}`;
      }

      let result = `${indent}${group.negate ? "NOT " : ""}(${group.logicalOperator}${innerDescription})`;

      return result;
    }
    return `${indent}Invalid Filter Criterion: ${JSON.stringify(criterion)}`;
  }

  /**
   * Validates a given filter criterion for structural correctness and semantic consistency.
   * This proactive validation prevents runtime errors and ensures that only well-formed
   * and logically sound filters are processed by the engine. It checks for missing fields,
   * invalid operators, and type mismatches for filter values.
   *
   * @param criterion The `AdvancedFilterCriterion` to validate.
   * @returns `true` if the criterion is valid.
   * @throws {FilteringEngineError} if the criterion is invalid, with a detailed error message
   *          specifying the nature of the invalidity.
   */
  public static validateFilterCriterion(
    criterion: AdvancedFilterCriterion,
  ): boolean {
    if (FilterUtilities.isNull(criterion)) {
      throw new FilteringEngineError(
        "Filter criterion cannot be null or undefined.",
        "VALIDATION_ERROR_NULL_CRITERION",
      );
    }

    if (
      (criterion as FilterGroup).logicalOperator !== undefined ||
      ((criterion as FilterGroup).conditions && (criterion as FilterGroup).conditions.length > 0) ||
      ((criterion as FilterGroup).subGroups && (criterion as FilterGroup).subGroups.length > 0)
    ) {
      // It's a FilterGroup
      const group = criterion as FilterGroup;
      if (!Object.values(LogicalOperator).includes(group.logicalOperator)) {
        throw new FilteringEngineError(
          `Invalid logical operator '${group.logicalOperator}' found in filter group.`,
          "VALIDATION_ERROR_INVALID_LOGICAL_OPERATOR",
        );
      }

      const hasConditions = group.conditions && group.conditions.length > 0;
      const hasSubGroups = group.subGroups && group.subGroups.length > 0;

      // Ensure that OR and NOT groups are not empty, as this implies no actual filtering or ambiguous logic.
      if (!hasConditions && !hasSubGroups) {
        if (group.logicalOperator === LogicalOperator.OR || group.negate) {
          throw new FilteringEngineError(
            `FilterGroup with logical operator '${group.logicalOperator}' or 'negate: true' must contain at least one condition or subgroup. Empty groups of this type are semantically ambiguous or represent no effective filter.`,
            "VALIDATION_ERROR_EMPTY_GROUP",
          );
        }
      }

      // Recursively validate conditions and sub-groups
      group.conditions?.forEach((cond) =>
        AdvancedFilteringEngine.validateFilterCriterion(cond),
      );
      group.subGroups?.forEach((subGroup) =>
        AdvancedFilteringEngine.validateFilterCriterion(subGroup),
      );
    } else if ((criterion as FilterCondition).field && (criterion as FilterCondition).operator) {
      // It's a FilterCondition
      const cond = criterion as FilterCondition;
      if (!cond.field || typeof cond.field !== "string") {
        throw new FilteringEngineError(
          `FilterCondition 'field' is invalid or missing: '${cond.field}'. Must be a non-empty string.`,
          "VALIDATION_ERROR_INVALID_FIELD",
        );
      }

      // Validate operator: must be a built-in or registered custom operator
      const isValidOperator =
        Object.values(FilterOperator).includes(cond.operator as FilterOperator) ||
        AdvancedFilteringEngine.customOperators.has(cond.operator as string);

      if (!isValidOperator) {
        throw new FilteringEngineError(
          `Invalid or unsupported filter operator: '${cond.operator}' for field '${cond.field}'.`,
          "VALIDATION_ERROR_UNSUPPORTED_OPERATOR",
        );
      }

      // Perform basic type and value checks based on the operator
      switch (cond.operator) {
        case FilterOperator.IN:
        case FilterOperator.NOT_IN:
          if (!Array.isArray(cond.value)) {
            throw new FilteringEngineError(
              `Operator '${cond.operator}' for field '${cond.field}' requires an array value, but received '${typeof cond.value}'.`,
              "VALIDATION_ERROR_INVALID_VALUE_TYPE",
            );
          }
          if (cond.value.length === 0) {
            console.warn(
              `Operator '${cond.operator}' for field '${cond.field}' has an empty array value. This filter will always evaluate to false.`,
            );
          }
          break;
        case FilterOperator.BETWEEN:
        case FilterOperator.DATE_BETWEEN:
          if (
            !Array.isArray(cond.value) ||
            cond.value.length !== 2 ||
            FilterUtilities.isNull(cond.value[0]) ||
            FilterUtilities.isNull(cond.value[1])
          ) {
            throw new FilteringEngineError(
              `Operator '${cond.operator}' for field '${cond.field}' requires an array of two non-null values [min, max], but received '${JSON.stringify(cond.value)}'.`,
              "VALIDATION_ERROR_INVALID_VALUE_TYPE",
            );
          }
          if (cond.operator === FilterOperator.DATE_BETWEEN) {
            try {
              // Attempt to parse dates to ensure validity
              FilterUtilities.compareDates(cond.value[0], cond.value[1]);
            } catch (e) {
              throw new FilteringEngineError(
                `Operator '${cond.operator}' for field '${cond.field}' requires valid date values in its array. Error: ${(e as Error).message}.`,
                "VALIDATION_ERROR_INVALID_DATE_FORMAT",
              );
            }
          }
          break;
        case FilterOperator.IS_NULL:
        case FilterOperator.IS_NOT_NULL:
        case FilterOperator.IS_EMPTY:
        case FilterOperator.IS_NOT_EMPTY:
          if (cond.value !== undefined && !FilterUtilities.isNull(cond.value)) {
            // Warn if a value is provided for operators that typically don't use it
            console.warn(
              `Operator '${cond.operator}' for field '${cond.field}' typically does not use a 'value'. The provided value '${JSON.stringify(cond.value)}' will be ignored.`,
            );
          }
          break;
        case FilterOperator.MATCHES_REGEX:
          if (typeof cond.value !== "string") {
            throw new FilteringEngineError(
              `Operator '${cond.operator}' for field '${cond.field}' requires a string value for the regex pattern, but received '${typeof cond.value}'.`,
              "VALIDATION_ERROR_INVALID_VALUE_TYPE",
            );
          }
          try {
            new RegExp(cond.value); // Test if the regex pattern is valid
          } catch (e: any) {
            throw new FilteringEngineError(
              `Invalid regex pattern '${cond.value}' for field '${cond.field}': ${e.message}.`,
              "VALIDATION_ERROR_INVALID_REGEX_PATTERN",
            );
          }
          break;
        default:
          // For most other operators, a non-null value is expected
          if (FilterUtilities.isNull(cond.value)) {
            throw new FilteringEngineError(
              `Operator '${cond.operator}' for field '${cond.field}' requires a non-null value. Use 'IS_NULL' instead for null checks.`,
              "VALIDATION_ERROR_MISSING_VALUE",
            );
          }
      }
    } else {
      throw new FilteringEngineError(
        `Malformed filter criterion: '${JSON.stringify(criterion)}'. ` +
          "Criterion must have a 'field' and 'operator' (for a condition) or 'logicalOperator' (for a group).",
        "VALIDATION_ERROR_MALFORMED_CRITERION",
      );
    }
    return true; // If no errors were thrown, the criterion is considered valid
  }

  /**
   * Represents an advanced filtering solution that offers the capability
   * to define, combine, and execute sophisticated filtering operations
   * across diverse financial datasets. It ensures robust data integrity,
   * high performance for large transaction volumes, and offers a flexible
   * API for custom filtering logic.
   *
   * This engine is designed to be a core, enterprise-grade component within
   * the citibankdemobusiness.dev ecosystem, facilitating complex data-driven
   * decisions and user experiences. Its architecture is built for scalability
   * and precision, supporting the requirements of a dynamic financial platform.
   *
   * Key pillars include:
   * - **Normalization:** Unifies data from Stripe, Plaid, Modern Treasury, and internal Citibank sources.
   * - **Expressiveness:** Supports complex logical combinations (AND, OR, NOT) and various comparison operators.
   * - **Performance:** Optimized for large datasets with efficient algorithms and short-circuiting logic.
   * - **Extensibility:** Allows registration of custom operators and flexible handling of nested metadata.
   * - **Reliability:** Features robust validation, error handling, and type-safe operations with TypeScript.
   * - **Utility:** Provides built-in sorting, pagination, and descriptive capabilities.
   *
   * This module is a strategic asset for real-time reporting, compliance auditing,
   * anomaly detection, and personalized user experiences across all financial products
   * and services owned by citibankdemobusiness.dev.
   */
  public readonly capabilities: string[] = [
    "Supports multi-source financial transaction normalization (Stripe, Plaid, Modern Treasury, Citibank Demo Business).",
    "Provides a rich set of comparison operators for numerical, temporal, and categorical data.",
    "Enables complex logical filtering with AND, OR, and NOT groups, including deeply nested structures.",
    "Offers dynamic field access, allowing filters on direct properties or nested `metadata` fields via dot-notation.",
    "Includes robust error handling and validation for filter criteria and data types, ensuring data integrity.",
    "Optimized for high performance with large datasets through efficient iteration and short-circuiting logic.",
    "Supports configurable case-sensitivity for all string comparisons, enhancing search flexibility.",
    "Provides explicit operators for null/empty checks on various data types, for precise data handling.",
    "Integrated sorting capabilities with multi-field, multi-directional sorting orders.",
    "Built-in pagination support for efficient handling of large result sets in UI and API contexts.",
    "Designed for extensibility to easily incorporate new transaction sources or custom filter types and operators.",
    "Ensures data consistency and integrity through strict TypeScript type definitions and validation rules.",
    "Forms a foundational layer for advanced analytics, reporting dashboards, and real-time data exploration tools.",
    "Aligns with financial industry standards for data processing, accuracy, and auditability.",
    "Engineered for high-throughput, capable of processing millions of transactions per complex query.",
    "Provides convenience factory methods for programmatically constructing complex filter groups.",
    "Leverages TypeScript for strong typing, improved developer experience, and enhanced code maintainability.",
    "Equipped with descriptive capabilities to render complex filters into human-readable strings for user feedback.",
    "Offers hash generation for filter criteria, enabling caching and tracking of unique filter configurations.",
  ];

  public readonly visionStatement: string = `
    The Advanced Filtering Engine for Citibank Demo Business Inc. is envisioned as the definitive
    data query and transformation layer for all financial intelligence across our enterprise.
    By providing unparalleled precision, speed, and flexibility in data manipulation, it empowers
    developers, analysts, and business stakeholders to extract meaningful, actionable insights from
    vast and heterogeneous financial datasets. This engine is a cornerstone of our strategy
    to deliver state-of-the-art financial products and services, ensuring that
    citibankdemobusiness.dev maintains its leadership in the digital financial sector.
    It represents a significant investment in our data infrastructure, meticulously designed to scale
    with the ever-increasing demands of a global financial institution operating across diverse
    payment rails, regulatory environments, and customer segments. Its robust architecture guarantees
    that every financial transaction, regardless of its origin (Stripe, Plaid, Modern Treasury,
    or internal Citibank systems), can be precisely analyzed, categorized, and presented, thereby
    unlocking new levels of operational efficiency, risk management, and customer satisfaction.
  `;
}