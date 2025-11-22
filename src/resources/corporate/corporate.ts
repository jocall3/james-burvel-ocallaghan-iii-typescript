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
   * True if any potential matches were found, false otherwise.
   */
  matchFound: boolean;

  /**
   * Unique identifier for this screening operation.
   */
  screeningId: string;

  /**
   * Timestamp when the screening was performed.
   */
  screeningTimestamp: string;

  /**
   * Overall status of the sanction screening.
   */
  status: 'clear' | 'potential_match' | 'confirmed_match' | 'error';

  /**
   * AI-calculated risk score (0-100) based on screening results.
   */
  aiRiskScore?: number | null;

  /**
   * Details of any potential matches found during screening.
   */
  matchDetails?: Array<CorporatePerformSanctionScreeningResponse.MatchDetail> | null;
}

export namespace CorporatePerformSanctionScreeningResponse {
  export interface MatchDetail {
    /**
     * Additional data from the sanctions list entry.
     */
    additionalInfo?: unknown | null;

    listName?: string;

    matchedName?: string;

    reason?: string;

    score?: number;
  }
}

export interface CorporatePerformSanctionScreeningParams {
  /**
   * Country of residence or operation (ISO 3166-1 alpha-2 code).
   */
  country: string;

  /**
   * The type of entity being screened.
   */
  entityType: 'individual' | 'organization';

  /**
   * Full name of the individual or organization to screen.
   */
  name: string;

  /**
   * Full address for enhanced screening.
   */
  address?: UsersAPI.Address | null;

  /**
   * Date of birth for individual screening (YYYY-MM-DD).
   */
  dateOfBirth?: string | null;
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
