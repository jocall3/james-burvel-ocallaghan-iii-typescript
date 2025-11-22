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
   *       atmWithdrawals: true,
   *       contactlessPayments: true,
   *       dailyLimit: 750,
   *       internationalTransactions: true,
   *       monthlyLimit: 3000,
   *       onlineTransactions: true,
   *       singleTransactionLimit: 1000,
   *       merchantCategoryRestrictions: [
   *         'Software Subscriptions',
   *         'Conferences',
   *       ],
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
   * Masked card number for display (e.g., last 4 digits).
   */
  cardNumberMask: string;

  /**
   * Type of card (physical or virtual).
   */
  cardType: 'physical' | 'virtual';

  /**
   * Granular spending controls and limits for the card.
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
   * Indicates if the card is temporarily frozen (no transactions allowed).
   */
  frozen: boolean;

  /**
   * Name of the employee or entity holding the card.
   */
  holderName: string;

  /**
   * Current status of the card.
   */
  status: 'Active' | 'Suspended' | 'Cancelled' | 'Expired';

  /**
   * Optional: ID of the employee associated with the card.
   */
  associatedEmployeeId?: string | null;

  /**
   * The primary currency of the card.
   */
  currency?: string;

  /**
   * Optional: ID of the corporate spending policy this card adheres to.
   */
  spendingPolicyId?: string | null;
}

export interface CorporateCardControls {
  /**
   * Allow or disallow ATM cash withdrawals.
   */
  atmWithdrawals: boolean;

  /**
   * Allow or disallow contactless payments.
   */
  contactlessPayments: boolean;

  /**
   * Maximum spending allowed per day.
   */
  dailyLimit: number;

  /**
   * Allow or disallow international transactions.
   */
  internationalTransactions: boolean;

  /**
   * Maximum spending allowed per month.
   */
  monthlyLimit: number;

  /**
   * Allow or disallow online transactions.
   */
  onlineTransactions: boolean;

  /**
   * Maximum amount allowed for a single transaction.
   */
  singleTransactionLimit: number;

  /**
   * List of merchant categories (MCCs) allowed or blocked.
   */
  merchantCategoryRestrictions?: Array<string> | null;

  timeBasedRestrictions?: CorporateCardControls.TimeBasedRestrictions | null;

  /**
   * Specific vendors allowed or blocked.
   */
  vendorRestrictions?: Array<string> | null;
}

export namespace CorporateCardControls {
  export interface TimeBasedRestrictions {
    /**
     * End time for allowed transactions (HH:MM).
     */
    dailyEndTime?: string;

    /**
     * Start time for allowed transactions (HH:MM).
     */
    dailyStartTime?: string;

    /**
     * Only allow transactions on weekdays.
     */
    weekdaysOnly?: boolean;
  }
}

export type CardListResponse = Array<CorporateCard>;

export interface CardCreateVirtualParams {
  /**
   * Specific spending controls and limits for this virtual card.
   */
  controls: CorporateCardControls;

  /**
   * Expiration date of the virtual card.
   */
  expirationDate: string;

  /**
   * Name of the entity or campaign for which the virtual card is issued.
   */
  holderName: string;

  /**
   * The purpose or use case for this virtual card.
   */
  purpose: string;

  /**
   * Optional: ID of the employee responsible for this virtual card.
   */
  associatedEmployeeId?: string | null;

  /**
   * The primary currency of the virtual card.
   */
  currency?: string;
}

export interface CardFreezeParams {
  /**
   * Set to `true` to freeze the card, `false` to unfreeze.
   */
  freeze: boolean;
}

export interface CardListTransactionsParams {
  /**
   * End date for filtering results (inclusive). Format: YYYY-MM-DD.
   */
  endDate?: string;

  /**
   * Maximum number of items to return in the response.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;

  /**
   * Start date for filtering results (inclusive). Format: YYYY-MM-DD.
   */
  startDate?: string;
}

export interface CardUpdateControlsParams {
  /**
   * Allow or disallow ATM cash withdrawals.
   */
  atmWithdrawals: boolean;

  /**
   * Allow or disallow contactless payments.
   */
  contactlessPayments: boolean;

  /**
   * Maximum spending allowed per day.
   */
  dailyLimit: number;

  /**
   * Allow or disallow international transactions.
   */
  internationalTransactions: boolean;

  /**
   * Maximum spending allowed per month.
   */
  monthlyLimit: number;

  /**
   * Allow or disallow online transactions.
   */
  onlineTransactions: boolean;

  /**
   * Maximum amount allowed for a single transaction.
   */
  singleTransactionLimit: number;

  /**
   * List of merchant categories (MCCs) allowed or blocked.
   */
  merchantCategoryRestrictions?: Array<string> | null;

  timeBasedRestrictions?: CardUpdateControlsParams.TimeBasedRestrictions | null;

  /**
   * Specific vendors allowed or blocked.
   */
  vendorRestrictions?: Array<string> | null;
}

export namespace CardUpdateControlsParams {
  export interface TimeBasedRestrictions {
    /**
     * End time for allowed transactions (HH:MM).
     */
    dailyEndTime?: string;

    /**
     * Start time for allowed transactions (HH:MM).
     */
    dailyStartTime?: string;

    /**
     * Only allow transactions on weekdays.
     */
    weekdaysOnly?: boolean;
  }
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
