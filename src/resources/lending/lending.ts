// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ApplicationsAPI from './applications';
import { ApplicationSubmitParams, Applications, LoanApplicationStatus } from './applications';
import * as OffersAPI from './offers';
import { LoanOffer, OfferListPreApprovedResponse, Offers } from './offers';

export class Lending extends APIResource {
  applications: ApplicationsAPI.Applications = new ApplicationsAPI.Applications(this._client);
  offers: OffersAPI.Offers = new OffersAPI.Offers(this._client);
}

Lending.Applications = Applications;
Lending.Offers = Offers;

export declare namespace Lending {
  export {
    Applications as Applications,
    type LoanApplicationStatus as LoanApplicationStatus,
    type ApplicationSubmitParams as ApplicationSubmitParams,
  };

  export {
    Offers as Offers,
    type LoanOffer as LoanOffer,
    type OfferListPreApprovedResponse as OfferListPreApprovedResponse,
  };
}
