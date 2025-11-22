// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as InsightsAPI from './insights';
import { AIInsight, InsightGetSpendingTrendsResponse, Insights } from './insights';
import * as RecurringAPI from './recurring';
import { Recurring, RecurringCreateParams, RecurringListResponse, RecurringTransaction } from './recurring';
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
   * The list of transactions for the current page.
   */
  data: Array<Transaction>;

  /**
   * The maximum number of items returned per page.
   */
  limit: number;

  /**
   * The starting index of the list for pagination.
   */
  offset: number;

  /**
   * The total number of available items.
   */
  total: number;

  /**
   * The offset to use for the next page of results. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface Transaction {
  /**
   * Unique identifier for the transaction.
   */
  id: string;

  /**
   * The ID of the account the transaction belongs to.
   */
  accountId: string;

  /**
   * The amount of the transaction.
   */
  amount: number;

  /**
   * AI-assigned or user-defined category for the transaction.
   */
  category: string;

  /**
   * The currency of the transaction (ISO 4217 code).
   */
  currency: string;

  /**
   * The date the transaction occurred (transaction date).
   */
  date: string;

  /**
   * Detailed description of the transaction (merchant name, etc.).
   */
  description: string;

  /**
   * Current status of any dispute related to this transaction.
   */
  disputeStatus:
    | 'none'
    | 'pending'
    | 'under_review'
    | 'resolved_in_favor_user'
    | 'resolved_in_favor_merchant'
    | 'rejected';

  /**
   * Type of the transaction (e.g., income, expense).
   */
  type: 'income' | 'expense' | 'transfer' | 'investment' | 'refund' | 'bill_payment' | 'fee';

  /**
   * AI's confidence score (0-1) for its category assignment.
   */
  aiCategoryConfidence?: number | null;

  /**
   * Estimated carbon footprint (in Kg CO2e) associated with the transaction.
   */
  carbonFootprint?: number | null;

  /**
   * Geographic location where the transaction took place.
   */
  location?: Transaction.Location | null;

  /**
   * Detailed information about the merchant involved in the transaction.
   */
  merchantDetails?: Transaction.MerchantDetails | null;

  /**
   * User-added personal notes for the transaction.
   */
  notes?: string | null;

  /**
   * The channel through which the payment was made.
   */
  paymentChannel?: 'in_store' | 'online' | 'atm' | 'transfer' | 'bill_payment' | 'recurring' | null;

  /**
   * The date the transaction was posted to the account (cleared date).
   */
  postedDate?: string | null;

  /**
   * URL to a digital receipt if available.
   */
  receiptUrl?: string | null;

  /**
   * User-defined tags for the transaction.
   */
  tags?: Array<string> | null;
}

export namespace Transaction {
  /**
   * Geographic location where the transaction took place.
   */
  export interface Location {
    /**
     * City name of the location.
     */
    city?: string | null;

    /**
     * Country of the location.
     */
    country?: string | null;

    /**
     * Latitude coordinate.
     */
    latitude?: number;

    /**
     * Longitude coordinate.
     */
    longitude?: number;

    /**
     * State or province of the location.
     */
    state?: string | null;
  }

  /**
   * Detailed information about the merchant involved in the transaction.
   */
  export interface MerchantDetails {
    /**
     * Physical address of the merchant.
     */
    address?: UsersAPI.Address | null;

    /**
     * URL to the merchant's logo.
     */
    logoUrl?: string | null;

    /**
     * Full name of the merchant.
     */
    name?: string;

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
   * Current status of the dispute.
   */
  status: 'pending' | 'under_review' | 'accepted' | 'rejected' | 'resolved';

  /**
   * Guidance on what will happen next or what action the user needs to take.
   */
  nextSteps?: string | null;

  /**
   * If the dispute was rejected, the reason for rejection.
   */
  rejectionReason?: string | null;
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
   * Maximum number of items to return in the response.
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
   * The new category to assign to the transaction. Supports hierarchical categories.
   */
  category: string;

  /**
   * If true, the AI will learn from this correction and apply it to similar future
   * transactions.
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
  reason:
    | 'unauthorized'
    | 'duplicate'
    | 'incorrect_amount'
    | 'service_not_received'
    | 'damaged_goods'
    | 'other';

  /**
   * Optional URLs to supporting documents (e.g., screenshots, photos).
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
  };

  export {
    Insights as Insights,
    type AIInsight as AIInsight,
    type InsightGetSpendingTrendsResponse as InsightGetSpendingTrendsResponse,
  };
}
