// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InsightsAPI from './insights';
import { AIInsight, InsightGetSpendingTrendsResponse, Insights } from './insights';
import * as RecurringAPI from './recurring';
import {
  Recurring,
  RecurringCreateParams,
  RecurringListParams,
  RecurringListResponse,
  RecurringTransaction,
} from './recurring';
import * as UsersAPI from '../users/users';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Transactions extends APIResource {
  recurring: RecurringAPI.Recurring = new RecurringAPI.Recurring(this._client);
  insights: InsightsAPI.Insights = new InsightsAPI.Insights(this._client);

  /**
   * Retrieves granular information for a single transaction by its unique ID,
   * including AI categorization confidence, merchant details, and associated carbon
   * footprint.
   *
   * @example
   * ```ts
   * const transaction = await client.transactions.retrieve(
   *   'txn_quantum-2024-07-21-A7B8C9',
   * );
   * ```
   */
  retrieve(transactionID: string, options?: RequestOptions): APIPromise<Transaction> {
    return this._client.get(path`/transactions/${transactionID}`, options);
  }

  /**
   * Retrieves a paginated list of the user's transactions, with extensive options
   * for filtering by type, category, date range, amount, and intelligent AI-driven
   * sorting and search capabilities.
   *
   * @example
   * ```ts
   * const paginatedTransactions =
   *   await client.transactions.list();
   * ```
   */
  list(
    query: TransactionListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<PaginatedTransactions> {
    return this._client.get('/transactions', { query, ...options });
  }

  /**
   * Allows the user to override or refine the AI's categorization for a transaction,
   * improving future AI accuracy and personal financial reporting.
   *
   * @example
   * ```ts
   * const transaction = await client.transactions.categorize(
   *   'txn_quantum-2024-07-21-A7B8C9',
   *   {
   *     category: 'Home > Groceries',
   *     applyToFuture: true,
   *     notes: 'Bulk purchase for party',
   *   },
   * );
   * ```
   */
  categorize(
    transactionID: string,
    body: TransactionCategorizeParams,
    options?: RequestOptions,
  ): APIPromise<Transaction> {
    return this._client.put(path`/transactions/${transactionID}/categorize`, { body, ...options });
  }

  /**
   * Begins the process of disputing a specific transaction, providing details and
   * supporting documentation for review by our compliance team and AI.
   *
   * @example
   * ```ts
   * const response = await client.transactions.dispute(
   *   'txn_quantum-2024-07-21-A7B8C9',
   *   {
   *     details:
   *       'I did not authorize this purchase. My card may have been compromised and I was traveling internationally on this date.',
   *     reason: 'unauthorized',
   *     supportingDocuments: [
   *       'https://demobank.com/uploads/flight_ticket.png',
   *     ],
   *   },
   * );
   * ```
   */
  dispute(
    transactionID: string,
    body: TransactionDisputeParams,
    options?: RequestOptions,
  ): APIPromise<TransactionDisputeResponse> {
    return this._client.post(path`/transactions/${transactionID}/dispute`, { body, ...options });
  }

  /**
   * Allows the user to add or update personal notes for a specific transaction.
   *
   * @example
   * ```ts
   * const transaction = await client.transactions.updateNotes(
   *   'txn_quantum-2024-07-21-A7B8C9',
   *   {
   *     notes:
   *       'This was a special coffee for a client meeting.',
   *   },
   * );
   * ```
   */
  updateNotes(
    transactionID: string,
    body: TransactionUpdateNotesParams,
    options?: RequestOptions,
  ): APIPromise<Transaction> {
    return this._client.put(path`/transactions/${transactionID}/notes`, { body, ...options });
  }
}

export interface PaginatedTransactions {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: number;

  /**
   * The number of items skipped before the current page.
   */
  offset: number;

  /**
   * The total number of items available across all pages.
   */
  total: number;

  data?: Array<Transaction>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface Transaction {
  /**
   * Unique identifier for the transaction.
   */
  id: string;

  /**
   * ID of the account from which the transaction occurred.
   */
  accountId: string;

  /**
   * Amount of the transaction.
   */
  amount: number;

  /**
   * AI-assigned or user-defined category of the transaction (e.g., 'Groceries',
   * 'Utilities').
   */
  category: string;

  /**
   * ISO 4217 currency code of the transaction.
   */
  currency: string;

  /**
   * Date the transaction occurred (local date).
   */
  date: string;

  /**
   * Detailed description of the transaction.
   */
  description: string;

  /**
   * Type of the transaction.
   */
  type: 'income' | 'expense' | 'transfer' | 'investment' | 'refund' | 'bill_payment';

  /**
   * AI confidence score for the assigned category (0-1).
   */
  aiCategoryConfidence?: number | null;

  /**
   * Estimated carbon footprint in kg CO2e for this transaction, derived by AI.
   */
  carbonFootprint?: number | null;

  /**
   * Current dispute status of the transaction.
   */
  disputeStatus?: 'none' | 'pending' | 'under_review' | 'resolved' | 'rejected';

  /**
   * Geographic location details for a transaction.
   */
  location?: Transaction.Location;

  /**
   * Detailed information about a merchant associated with a transaction.
   */
  merchantDetails?: Transaction.MerchantDetails;

  /**
   * Personal notes added by the user to the transaction.
   */
  notes?: string | null;

  /**
   * Channel through which the payment was made.
   */
  paymentChannel?: 'in_store' | 'online' | 'mobile' | 'ATM' | 'bill_payment' | 'transfer' | 'other' | null;

  /**
   * Date the transaction was posted to the account (local date).
   */
  postedDate?: string | null;

  /**
   * URL to a digital receipt for the transaction.
   */
  receiptUrl?: string | null;

  /**
   * User-defined tags for the transaction.
   */
  tags?: Array<string> | null;
}

export namespace Transaction {
  /**
   * Geographic location details for a transaction.
   */
  export interface Location {
    /**
     * City where the transaction occurred.
     */
    city?: string | null;

    /**
     * Latitude coordinate of the transaction.
     */
    latitude?: number;

    /**
     * Longitude coordinate of the transaction.
     */
    longitude?: number;

    /**
     * State where the transaction occurred.
     */
    state?: string | null;

    /**
     * Zip code where the transaction occurred.
     */
    zip?: string | null;
  }

  /**
   * Detailed information about a merchant associated with a transaction.
   */
  export interface MerchantDetails {
    /**
     * Physical address of the merchant.
     */
    address?: UsersAPI.Address;

    /**
     * URL to the merchant's logo.
     */
    logoUrl?: string | null;

    /**
     * Official name of the merchant.
     */
    name?: string;

    /**
     * Merchant's phone number.
     */
    phone?: string | null;

    /**
     * Merchant's website URL.
     */
    website?: string | null;
  }
}

export interface TransactionDisputeResponse {
  /**
   * Unique identifier for the dispute case.
   */
  disputeId: string;

  /**
   * Timestamp when the dispute status was last updated.
   */
  lastUpdated: string;

  /**
   * Guidance on what to expect next in the dispute process.
   */
  nextSteps: string;

  /**
   * Current status of the dispute.
   */
  status: 'pending' | 'under_review' | 'requires_more_info' | 'resolved' | 'rejected';
}

export interface TransactionListParams {
  /**
   * Filter transactions by their AI-assigned or user-defined category.
   */
  category?: string;

  /**
   * Retrieve transactions up to this date (inclusive).
   */
  endDate?: string;

  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Filter for transactions with an amount less than or equal to this value.
   */
  maxAmount?: number;

  /**
   * Filter for transactions with an amount greater than or equal to this value.
   */
  minAmount?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;

  /**
   * Free-text search across transaction descriptions, merchants, and notes.
   */
  searchQuery?: string;

  /**
   * Retrieve transactions from this date (inclusive).
   */
  startDate?: string;

  /**
   * Filter transactions by type (e.g., income, expense, transfer).
   */
  type?: 'income' | 'expense' | 'transfer' | 'investment' | 'refund' | 'bill_payment';
}

export interface TransactionCategorizeParams {
  /**
   * The new category for the transaction. Can be hierarchical.
   */
  category: string;

  /**
   * If true, the AI will learn from this correction and try to apply it to similar
   * future transactions.
   */
  applyToFuture?: boolean;

  /**
   * Optional notes to add to the transaction.
   */
  notes?: string | null;
}

export interface TransactionDisputeParams {
  /**
   * Detailed explanation of the dispute.
   */
  details: string;

  /**
   * The primary reason for disputing the transaction.
   */
  reason: 'unauthorized' | 'duplicate_charge' | 'incorrect_amount' | 'product_service_issue' | 'other';

  /**
   * URLs to supporting documents (e.g., receipts, communication).
   */
  supportingDocuments?: Array<string> | null;
}

export interface TransactionUpdateNotesParams {
  /**
   * The personal notes to add or update for the transaction.
   */
  notes: string;
}

Transactions.Recurring = Recurring;
Transactions.Insights = Insights;

export declare namespace Transactions {
  export {
    type PaginatedTransactions as PaginatedTransactions,
    type Transaction as Transaction,
    type TransactionDisputeResponse as TransactionDisputeResponse,
    type TransactionListParams as TransactionListParams,
    type TransactionCategorizeParams as TransactionCategorizeParams,
    type TransactionDisputeParams as TransactionDisputeParams,
    type TransactionUpdateNotesParams as TransactionUpdateNotesParams,
  };

  export {
    Recurring as Recurring,
    type RecurringTransaction as RecurringTransaction,
    type RecurringListResponse as RecurringListResponse,
    type RecurringCreateParams as RecurringCreateParams,
    type RecurringListParams as RecurringListParams,
  };

  export {
    Insights as Insights,
    type AIInsight as AIInsight,
    type InsightGetSpendingTrendsResponse as InsightGetSpendingTrendsResponse,
  };
}
