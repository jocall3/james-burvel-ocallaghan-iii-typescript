// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TransactionsAPI from '../transactions/transactions';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Cards extends APIResource {
  /**
   * Retrieves a comprehensive list of all physical and virtual corporate cards
   * associated with the user's organization, including their status, assigned
   * holder, and current spending controls.
   *
   * @example
   * ```ts
   * const cards = await client.corporate.cards.list();
   * ```
   */
  list(
    query: CardListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<CardListResponse> {
    return this._client.get('/corporate/cards', { query, ...options });
  }

  /**
   * Creates and issues a new virtual corporate card with specified spending limits,
   * merchant restrictions, and expiration dates, ideal for secure online purchases
   * and temporary projects.
   *
   * @example
   * ```ts
   * const corporateCard =
   *   await client.corporate.cards.createVirtual({
   *     controls: {
   *       atmWithdrawals: false,
   *       contactlessPayments: false,
   *       onlineTransactions: true,
   *       internationalTransactions: false,
   *       monthlyLimit: 1000,
   *       dailyLimit: 500,
   *       singleTransactionLimit: 200,
   *       merchantCategoryRestrictions: ['Advertising'],
   *       vendorRestrictions: ['Facebook Ads', 'Google Ads'],
   *     },
   *     expirationDate: '2025-12-31',
   *     holderName: 'Marketing Campaign Q4',
   *     purpose: 'Online advertising for Q4 campaigns',
   *     associatedEmployeeId: 'emp_marketing_01',
   *   });
   * ```
   */
  createVirtual(body: CardCreateVirtualParams, options?: RequestOptions): APIPromise<CorporateCard> {
    return this._client.post('/corporate/cards/virtual', { body, ...options });
  }

  /**
   * Immediately changes the frozen status of a corporate card, preventing or
   * allowing transactions in real-time, critical for security and expense
   * management.
   *
   * @example
   * ```ts
   * const corporateCard = await client.corporate.cards.freeze(
   *   'corp_card_xyz987654',
   *   { freeze: true },
   * );
   * ```
   */
  freeze(cardID: string, body: CardFreezeParams, options?: RequestOptions): APIPromise<CorporateCard> {
    return this._client.post(path`/corporate/cards/${cardID}/freeze`, { body, ...options });
  }

  /**
   * Retrieves a paginated list of transactions made with a specific corporate card,
   * including AI categorization and compliance flags.
   *
   * @example
   * ```ts
   * const paginatedTransactions =
   *   await client.corporate.cards.listTransactions(
   *     'corp_card_xyz987654',
   *   );
   * ```
   */
  listTransactions(
    cardID: string,
    query: CardListTransactionsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<TransactionsAPI.PaginatedTransactions> {
    return this._client.get(path`/corporate/cards/${cardID}/transactions`, { query, ...options });
  }

  /**
   * Updates the sophisticated spending controls, limits, and policy overrides for a
   * specific corporate card, enabling real-time adjustments for security and budget
   * adherence.
   *
   * @example
   * ```ts
   * const corporateCard =
   *   await client.corporate.cards.updateControls(
   *     'corp_card_xyz987654',
   *     {
   *       dailyLimit: 750,
   *       internationalTransactions: true,
   *       merchantCategoryRestrictions: [
   *         'Software Subscriptions',
   *         'Conferences',
   *       ],
   *       monthlyLimit: 3000,
   *     },
   *   );
   * ```
   */
  updateControls(
    cardID: string,
    body: CardUpdateControlsParams,
    options?: RequestOptions,
  ): APIPromise<CorporateCard> {
    return this._client.put(path`/corporate/cards/${cardID}/controls`, { body, ...options });
  }
}

export interface CorporateCard {
  /**
   * Unique identifier for the corporate card.
   */
  id: string;

  /**
   * Masked card number for display purposes.
   */
  cardNumberMask: string;

  /**
   * Type of the card (physical or virtual).
   */
  cardType: 'physical' | 'virtual';

  /**
   * Granular spending controls for a corporate card.
   */
  controls: CorporateCardControls;

  /**
   * Timestamp when the card was created.
   */
  createdDate: string;

  /**
   * Currency of the card's limits and transactions.
   */
  currency: string;

  /**
   * Expiration date of the card (YYYY-MM-DD).
   */
  expirationDate: string;

  /**
   * If true, the card is temporarily frozen and cannot be used.
   */
  frozen: boolean;

  /**
   * Name of the card holder.
   */
  holderName: string;

  /**
   * Current status of the card.
   */
  status: 'Active' | 'Suspended' | 'Deactivated' | 'Pending Activation';

  /**
   * Optional: ID of the employee associated with this card.
   */
  associatedEmployeeId?: string | null;

  /**
   * Optional: ID of the overarching spending policy applied to this card.
   */
  spendingPolicyId?: string | null;
}

/**
 * Granular spending controls for a corporate card.
 */
export interface CorporateCardControls {
  /**
   * If true, ATM cash withdrawals are allowed.
   */
  atmWithdrawals?: boolean;

  /**
   * If true, contactless payments are allowed.
   */
  contactlessPayments?: boolean;

  /**
   * Maximum spending limit per day (null for no limit).
   */
  dailyLimit?: number | null;

  /**
   * If true, international transactions are allowed.
   */
  internationalTransactions?: boolean;

  /**
   * List of allowed merchant categories. If empty, all are allowed unless explicitly
   * denied.
   */
  merchantCategoryRestrictions?: Array<string> | null;

  /**
   * Maximum spending limit per month (null for no limit).
   */
  monthlyLimit?: number | null;

  /**
   * If true, online transactions are allowed.
   */
  onlineTransactions?: boolean;

  /**
   * Maximum amount for a single transaction (null for no limit).
   */
  singleTransactionLimit?: number | null;

  /**
   * List of allowed vendors/merchants by name.
   */
  vendorRestrictions?: Array<string> | null;
}

export interface CardListResponse {
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

  data?: Array<CorporateCard>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface CardListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export interface CardCreateVirtualParams {
  /**
   * Specific spending controls for this virtual card.
   */
  controls: CorporateCardControls;

  /**
   * Expiration date for the virtual card (YYYY-MM-DD).
   */
  expirationDate: string;

  /**
   * Name to appear on the virtual card.
   */
  holderName: string;

  /**
   * Brief description of the virtual card's purpose.
   */
  purpose: string;

  /**
   * Optional: ID of the employee or department this card is for.
   */
  associatedEmployeeId?: string | null;

  /**
   * Optional: ID of a spending policy to link with this virtual card.
   */
  spendingPolicyId?: string | null;
}

export interface CardFreezeParams {
  /**
   * Set to `true` to freeze the card, `false` to unfreeze.
   */
  freeze: boolean;
}

export interface CardListTransactionsParams {
  /**
   * End date for filtering results (inclusive, YYYY-MM-DD).
   */
  endDate?: string;

  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;

  /**
   * Start date for filtering results (inclusive, YYYY-MM-DD).
   */
  startDate?: string;
}

export interface CardUpdateControlsParams {
  /**
   * If true, ATM cash withdrawals are allowed.
   */
  atmWithdrawals?: boolean;

  /**
   * If true, contactless payments are allowed.
   */
  contactlessPayments?: boolean;

  /**
   * Maximum spending limit per day (null for no limit).
   */
  dailyLimit?: number | null;

  /**
   * If true, international transactions are allowed.
   */
  internationalTransactions?: boolean;

  /**
   * List of allowed merchant categories. If empty, all are allowed unless explicitly
   * denied.
   */
  merchantCategoryRestrictions?: Array<string> | null;

  /**
   * Maximum spending limit per month (null for no limit).
   */
  monthlyLimit?: number | null;

  /**
   * If true, online transactions are allowed.
   */
  onlineTransactions?: boolean;

  /**
   * Maximum amount for a single transaction (null for no limit).
   */
  singleTransactionLimit?: number | null;

  /**
   * List of allowed vendors/merchants by name.
   */
  vendorRestrictions?: Array<string> | null;
}

export declare namespace Cards {
  export {
    type CorporateCard as CorporateCard,
    type CorporateCardControls as CorporateCardControls,
    type CardListResponse as CardListResponse,
    type CardListParams as CardListParams,
    type CardCreateVirtualParams as CardCreateVirtualParams,
    type CardFreezeParams as CardFreezeParams,
    type CardListTransactionsParams as CardListTransactionsParams,
    type CardUpdateControlsParams as CardUpdateControlsParams,
  };
}
