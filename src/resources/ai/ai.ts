// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as AdsAPI from './ads/ads';
import { AdListGeneratedParams, AdListGeneratedResponse, Ads, VideoOperationStatus } from './ads/ads';
import * as AdvisorAPI from './advisor/advisor';
import { Advisor, AdvisorListToolsResponse } from './advisor/advisor';
import * as IncubatorAPI from './incubator/incubator';
import { Incubator, IncubatorListPitchesParams, IncubatorListPitchesResponse } from './incubator/incubator';
import * as OracleAPI from './oracle/oracle';
import { Oracle } from './oracle/oracle';

export class AI extends APIResource {
  advisor: AdvisorAPI.Advisor = new AdvisorAPI.Advisor(this._client);
  oracle: OracleAPI.Oracle = new OracleAPI.Oracle(this._client);
  incubator: IncubatorAPI.Incubator = new IncubatorAPI.Incubator(this._client);
  ads: AdsAPI.Ads = new AdsAPI.Ads(this._client);
}

AI.Advisor = Advisor;
AI.Oracle = Oracle;
AI.Incubator = Incubator;
AI.Ads = Ads;

export declare namespace AI {
  export { Advisor as Advisor, type AdvisorListToolsResponse as AdvisorListToolsResponse };

  export { Oracle as Oracle };

  export {
    Incubator as Incubator,
    type IncubatorListPitchesResponse as IncubatorListPitchesResponse,
    type IncubatorListPitchesParams as IncubatorListPitchesParams,
  };

  export {
    Ads as Ads,
    type VideoOperationStatus as VideoOperationStatus,
    type AdListGeneratedResponse as AdListGeneratedResponse,
    type AdListGeneratedParams as AdListGeneratedParams,
  };
}
