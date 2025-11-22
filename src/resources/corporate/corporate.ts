// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as AnomaliesAPI from './anomalies';
import {
  Anomalies,
  AnomalyListParams,
  AnomalyListResponse,
  AnomalyUpdateStatusParams,
  FinancialAnomaly,
} from './anomalies';
import * as CardsAPI from './cards';
import {
  CardCreateVirtualParams,
  CardFreezeParams,
  CardListResponse,
  CardListTransactionsParams,
  CardUpdateControlsParams,
  Cards,
  CorporateCard,
  CorporateCardControls,
} from './cards';
import * as UsersAPI from '../users/users';
import * as ComplianceAPI from './compliance/compliance';
import { Compliance } from './compliance/compliance';
import * as RiskAPI from './risk/risk';
import { Risk } from './risk/risk';
import * as TreasuryAPI from './treasury/treasury';
import { Treasury, TreasuryGetLiquidityPositionsResponse } from './treasury/treasury';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Corporate extends APIResource {
  cards: CardsAPI.Cards = new CardsAPI.Cards(this._client);
  anomalies: AnomaliesAPI.Anomalies = new AnomaliesAPI.Anomalies(this._client);
  compliance: ComplianceAPI.Compliance = new ComplianceAPI.Compliance(this._client);
  treasury: TreasuryAPI.Treasury = new TreasuryAPI.Treasury(this._client);
  risk: RiskAPI.Risk = new RiskAPI.Risk(this._client);

  /**
   * Executes a real-time screening of an individual or entity against global
   * sanction lists and watchlists.
   *
   * @example
   * ```ts
   * const response =
   *   await client.corporate.performSanctionScreening({
   *     country: 'US',
   *     entityType: 'individual',
   *     name: 'John Doe',
   *     dateOfBirth: '1970-01-01',
   *   });
   * ```
   */
  performSanctionScreening(
    body: CorporatePerformSanctionScreeningParams,
    options?: RequestOptions,
  ): APIPromise<CorporatePerformSanctionScreeningResponse> {
    return this._client.post('/corporate/sanction-screening', { body, ...options });
  }
}

export interface CorporatePerformSanctionScreeningResponse {
  /**
   * True if a potential match was found on any sanction list.
   */
  matchFound: boolean;

  /**
   * Unique identifier for this screening request.
   */
  screeningId: string;

  /**
   * Timestamp when the screening was performed.
   */
  screeningTimestamp: string;

  /**
   * Overall status of the screening result.
   */
  status: 'clear' | 'potential_match' | 'high_match' | 'error';

  /**
   * AI-generated recommendation based on the screening result.
   */
  aiRecommendation?: string | null;

  /**
   * AI-calculated risk score for the screened entity (0-100).
   */
  aiRiskScore?: number | null;

  /**
   * Details of any potential matches found.
   */
  matchDetails?: Array<CorporatePerformSanctionScreeningResponse.MatchDetail> | null;
}

export namespace CorporatePerformSanctionScreeningResponse {
  export interface MatchDetail {
    additionalInfo?: string | null;

    listName?: string;

    matchedName?: string;

    reason?: string;

    score?: number;
  }
}

export interface CorporatePerformSanctionScreeningParams {
  /**
   * ISO 3166-1 alpha-2 country code relevant to the individual/entity.
   */
  country: string;

  /**
   * Type of entity being screened.
   */
  entityType: 'individual' | 'organization';

  /**
   * The full name of the individual or entity to screen.
   */
  name: string;

  /**
   * Optional: Address details for enhanced screening accuracy.
   */
  address?: UsersAPI.Address | null;

  /**
   * Date of birth, if screening an individual.
   */
  dateOfBirth?: string | null;

  /**
   * Optional: Any identification number (e.g., passport, EIN).
   */
  identificationNumber?: string | null;
}

Corporate.Cards = Cards;
Corporate.Anomalies = Anomalies;
Corporate.Compliance = Compliance;
Corporate.Treasury = Treasury;
Corporate.Risk = Risk;

export declare namespace Corporate {
  export {
    type CorporatePerformSanctionScreeningResponse as CorporatePerformSanctionScreeningResponse,
    type CorporatePerformSanctionScreeningParams as CorporatePerformSanctionScreeningParams,
  };

  export {
    Cards as Cards,
    type CorporateCard as CorporateCard,
    type CorporateCardControls as CorporateCardControls,
    type CardListResponse as CardListResponse,
    type CardCreateVirtualParams as CardCreateVirtualParams,
    type CardFreezeParams as CardFreezeParams,
    type CardListTransactionsParams as CardListTransactionsParams,
    type CardUpdateControlsParams as CardUpdateControlsParams,
  };

  export {
    Anomalies as Anomalies,
    type FinancialAnomaly as FinancialAnomaly,
    type AnomalyListResponse as AnomalyListResponse,
    type AnomalyListParams as AnomalyListParams,
    type AnomalyUpdateStatusParams as AnomalyUpdateStatusParams,
  };

  export { Compliance as Compliance };

  export {
    Treasury as Treasury,
    type TreasuryGetLiquidityPositionsResponse as TreasuryGetLiquidityPositionsResponse,
  };

  export { Risk as Risk };
}
