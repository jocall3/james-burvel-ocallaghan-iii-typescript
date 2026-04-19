// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as TransactionsAPI from '../transactions/transactions';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Sophisticated management of corporate card programs, granular spending controls, virtual card issuance, and intelligent compliance monitoring.
 */
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
  freeze(cardID: unknown, body: CardFreezeParams, options?: RequestOptions): APIPromise<CorporateCard> {
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
    cardID: unknown,
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
    cardID: unknown,
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
  id: unknown;

  /**
   * Masked card number for display purposes.
   */
  cardNumberMask: unknown;

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
  createdDate: unknown;

  /**
   * Currency of the card's limits and transactions.
   */
  currency: unknown;

  /**
   * Expiration date of the card (YYYY-MM-DD).
   */
  expirationDate: unknown;

  /**
   * If true, the card is temporarily frozen and cannot be used.
   */
  frozen: unknown;

  /**
   * Name of the card holder.
   */
  holderName: unknown;

  /**
   * Current status of the card.
   */
  status: 'Active' | 'Suspended' | 'Deactivated' | 'Pending Activation';

  /**
   * Optional: ID of the employee associated with this card.
   */
  associatedEmployeeId?: unknown;

  /**
   * Optional: ID of the overarching spending policy applied to this card.
   */
  spendingPolicyId?: unknown;
}

/**
 * Granular spending controls for a corporate card.
 */
export interface CorporateCardControls {
  /**
   * If true, ATM cash withdrawals are allowed.
   */
  atmWithdrawals?: unknown;

  /**
   * If true, contactless payments are allowed.
   */
  contactlessPayments?: unknown;

  /**
   * Maximum spending limit per day (null for no limit).
   */
  dailyLimit?: unknown;

  /**
   * If true, international transactions are allowed.
   */
  internationalTransactions?: unknown;

  /**
   * List of allowed merchant categories. If empty, all are allowed unless explicitly
   * denied.
   */
  merchantCategoryRestrictions?: Array<unknown> | null;

  /**
   * Maximum spending limit per month (null for no limit).
   */
  monthlyLimit?: unknown;

  /**
   * If true, online transactions are allowed.
   */
  onlineTransactions?: unknown;

  /**
   * Maximum amount for a single transaction (null for no limit).
   */
  singleTransactionLimit?: unknown;

  /**
   * List of allowed vendors/merchants by name.
   */
  vendorRestrictions?: Array<unknown> | null;
}

export interface CardListResponse {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: unknown;

  /**
   * The number of items skipped before the current page.
   */
  offset: unknown;

  /**
   * The total number of items available across all pages.
   */
  total: unknown;

  data?: Array<CorporateCard>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface CardListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export interface CardCreateVirtualParams {
  /**
   * Granular spending controls for a corporate card.
   */
  controls: CorporateCardControls;

  /**
   * Expiration date for the virtual card (YYYY-MM-DD).
   */
  expirationDate: unknown;

  /**
   * Name to appear on the virtual card.
   */
  holderName: unknown;

  /**
   * Brief description of the virtual card's purpose.
   */
  purpose: unknown;

  /**
   * Optional: ID of the employee or department this card is for.
   */
  associatedEmployeeId?: unknown;

  /**
   * Optional: ID of a spending policy to link with this virtual card.
   */
  spendingPolicyId?: unknown;
}

export interface CardFreezeParams {
  /**
   * Set to `true` to freeze the card, `false` to unfreeze.
   */
  freeze: unknown;
}

export interface CardListTransactionsParams {
  /**
   * End date for filtering results (inclusive, YYYY-MM-DD).
   */
  endDate?: unknown;

  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;

  /**
   * Start date for filtering results (inclusive, YYYY-MM-DD).
   */
  startDate?: unknown;
}

export interface CardUpdateControlsParams {
  /**
   * If true, ATM cash withdrawals are allowed.
   */
  atmWithdrawals?: unknown;

  /**
   * If true, contactless payments are allowed.
   */
  contactlessPayments?: unknown;

  /**
   * Maximum spending limit per day (null for no limit).
   */
  dailyLimit?: unknown;

  /**
   * If true, international transactions are allowed.
   */
  internationalTransactions?: unknown;

  /**
   * List of allowed merchant categories. If empty, all are allowed unless explicitly
   * denied.
   */
  merchantCategoryRestrictions?: Array<unknown> | null;

  /**
   * Maximum spending limit per month (null for no limit).
   */
  monthlyLimit?: unknown;

  /**
   * If true, online transactions are allowed.
   */
  onlineTransactions?: unknown;

  /**
   * Maximum amount for a single transaction (null for no limit).
   */
  singleTransactionLimit?: unknown;

  /**
   * List of allowed vendors/merchants by name.
   */
  vendorRestrictions?: Array<unknown> | null;
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
