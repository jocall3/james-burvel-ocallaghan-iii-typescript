// File: src/resources/marketplace/offers.ts

import * as Core from '../../../core';
import { APIResource } from '../../../resource';
import { isRequestOptions } from '../../../core';
import * as OffersAPI from './offers';

export class Offers extends APIResource {
  /**
   * Redeems a personalized, exclusive offer from the Plato AI marketplace, often
   * resulting in a discount, special rate, or credit to the user's account.
   */
  redeem(
    offerId: string,
    body?: OfferRedeemParams,
    options?: Core.RequestOptions,
  ): Core.APIPromise<OfferRedemption>;
  redeem(offerId: string, options?: Core.RequestOptions): Core.APIPromise<OfferRedemption>;
  redeem(
    offerId: string,
    body?: OfferRedeemParams | Core.RequestOptions,
    options?: Core.RequestOptions,
  ): Core.APIPromise<OfferRedemption> {
    if (isRequestOptions(body)) {
      return this.redeem(offerId, {}, body);
    }
    return this._client.post(`/marketplace/offers/${offerId}/redeem`, { body, ...options });
  }
}

/**
 * Offer redeemed successfully. Details of the redemption are provided.
 */
export interface OfferRedemption {
  /**
   * Unique ID for this redemption.
   */
  redemptionId: string;

  /**
   * The ID of the redeemed offer.
   */
  offerId: string;

  /**
   * Status of the redemption.
   */
  status: 'success' | 'pending' | 'failed';

  /**
   * A descriptive message about the redemption.
   */
  message: string;

  /**
   * The timestamp when the offer was redeemed.
   */
  redemptionDate: string;

  /**
   * If applicable, the ID of any associated transaction (e.g., a credit or initial
   * payment).
   */
  associatedTransactionId?: string | null;
}

export interface OfferRedeemParams {
  /**
   * Optional: The ID of the account to use for any associated payment or credit.
   */
  paymentAccountId?: string;
}

export namespace Offers {
  export import OfferRedemption = OffersAPI.OfferRedemption;
  export import OfferRedeemParams = OffersAPI.OfferRedeemParams;
}