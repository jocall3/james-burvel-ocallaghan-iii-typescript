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
  CardListParams,
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

/**
 * Advanced access to compliance cases, AI-powered financial anomaly detection, real-time risk assessments, and automated sanction screening for enterprise clients.
 */
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
   * Details of any potential or exact matches found.
   */
  matchDetails: Array<CorporatePerformSanctionScreeningResponse.MatchDetail>;

  /**
   * True if any potential matches were found on sanction lists.
   */
  matchFound: unknown;

  /**
   * Unique identifier for this screening operation.
   */
  screeningId: unknown;

  /**
   * Timestamp when the screening was performed.
   */
  screeningTimestamp: unknown;

  /**
   * Overall status of the screening result.
   */
  status: 'clear' | 'potential_match' | 'confirmed_match' | 'error';

  /**
   * An optional message providing more context on the status.
   */
  message?: unknown;
}

export namespace CorporatePerformSanctionScreeningResponse {
  export interface MatchDetail {
    /**
     * Name of the sanction list where a match was found.
     */
    listName?: unknown;

    /**
     * The name on the sanction list that matched.
     */
    matchedName?: unknown;

    /**
     * Optional: URL to public record of the sanction list entry.
     */
    publicUrl?: unknown;

    /**
     * Reason for the match (e.g., exact name, alias, partial match).
     */
    reason?: unknown;

    /**
     * Match confidence score (0-1).
     */
    score?: unknown;
  }
}

export interface CorporatePerformSanctionScreeningParams {
  /**
   * Two-letter ISO country code related to the entity (e.g., country of residence,
   * registration).
   */
  country: unknown;

  /**
   * The type of entity being screened.
   */
  entityType: 'individual' | 'organization';

  /**
   * Full name of the individual or organization to screen.
   */
  name: unknown;

  address?: UsersAPI.Address;

  /**
   * Date of birth for individuals (YYYY-MM-DD).
   */
  dateOfBirth?: unknown;

  /**
   * Optional: Any government-issued identification number (e.g., passport, national
   * ID).
   */
  identificationNumber?: unknown;
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
    type CardListParams as CardListParams,
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
