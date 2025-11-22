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
   * const corporateCards = await client.corporate.cards.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<CardListResponse> {
    return this._client.get('/corporate/cards', options);
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
   * Type of the corporate card.
   */
  cardType: 'physical' | 'virtual';

  /**
   * Granular spending controls applied to this card.
   */
  controls: CorporateCardControls;

  /**
   * Date when the card was created/issued.
   */
  createdDate: string;

  /**
   * Expiration date of the card.
   */
  expirationDate: string;

  /**
   * True if the card is currently frozen, preventing transactions.
   */
  frozen: boolean;

  /**
   * Name of the cardholder or purpose.
   */
  holderName: string;

  /**
   * Current status of the card.
   */
  status: 'Active' | 'Suspended' | 'Cancelled' | 'Expired';

  /**
   * Employee ID associated with the card (if applicable).
   */
  associatedEmployeeId?: string | null;

  /**
   * ID of the corporate spending policy this card adheres to (if any).
   */
  spendingPolicyId?: string | null;
}

export interface CorporateCardControls {
  /**
   * Allow ATM withdrawals.
   */
  atmWithdrawals?: boolean;

  /**
   * Allow contactless payments.
   */
  contactlessPayments?: boolean;

  /**
   * Maximum spending limit per day.
   */
  dailyLimit?: number | null;

  /**
   * Allow international transactions.
   */
  internationalTransactions?: boolean;

  /**
   * List of allowed or disallowed merchant categories.
   */
  merchantCategoryRestrictions?: Array<string> | null;

  /**
   * Maximum spending limit per month.
   */
  monthlyLimit?: number | null;

  /**
   * Allow online transactions.
   */
  onlineTransactions?: boolean;

  /**
   * Maximum amount for a single transaction.
   */
  singleTransactionLimit?: number | null;

  /**
   * List of specific allowed or disallowed vendors/merchants.
   */
  vendorRestrictions?: Array<string> | null;
}

export type CardListResponse = Array<CorporateCard>;

export interface CardCreateVirtualParams {
  /**
   * Specific spending controls for this virtual card.
   */
  controls: CorporateCardControls;

  /**
   * Expiration date for the virtual card.
   */
  expirationDate: string;

  /**
   * Name for the virtual card holder or its purpose.
   */
  holderName: string;

  /**
   * Brief description of the virtual card's intended use.
   */
  purpose: string;

  /**
   * Optional: Employee ID to associate with this virtual card.
   */
  associatedEmployeeId?: string | null;
}

export interface CardFreezeParams {
  /**
   * Set to `true` to freeze the card, `false` to unfreeze.
   */
  freeze: boolean;
}

export interface CardListTransactionsParams {
  /**
   * Filter results up to this date (inclusive, YYYY-MM-DD).
   */
  endDate?: string;

  /**
   * Maximum number of items to return.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;

  /**
   * Filter results from this date (inclusive, YYYY-MM-DD).
   */
  startDate?: string;
}

export interface CardUpdateControlsParams {
  /**
   * Allow ATM withdrawals.
   */
  atmWithdrawals?: boolean;

  /**
   * Allow contactless payments.
   */
  contactlessPayments?: boolean;

  /**
   * Maximum spending limit per day.
   */
  dailyLimit?: number | null;

  /**
   * Allow international transactions.
   */
  internationalTransactions?: boolean;

  /**
   * List of allowed or disallowed merchant categories.
   */
  merchantCategoryRestrictions?: Array<string> | null;

  /**
   * Maximum spending limit per month.
   */
  monthlyLimit?: number | null;

  /**
   * Allow online transactions.
   */
  onlineTransactions?: boolean;

  /**
   * Maximum amount for a single transaction.
   */
  singleTransactionLimit?: number | null;

  /**
   * List of specific allowed or disallowed vendors/merchants.
   */
  vendorRestrictions?: Array<string> | null;
}

export declare namespace Cards {
  export {
    type CorporateCard as CorporateCard,
    type CorporateCardControls as CorporateCardControls,
    type CardListResponse as CardListResponse,
    type CardCreateVirtualParams as CardCreateVirtualParams,
    type CardFreezeParams as CardFreezeParams,
    type CardListTransactionsParams as CardListTransactionsParams,
    type CardUpdateControlsParams as CardUpdateControlsParams,
  };
}
