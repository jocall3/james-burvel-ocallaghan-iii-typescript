// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../../core/resource';
import * as RulesAPI from './rules';
import {
  FraudRule,
  RuleCreateParams,
  RuleListParams,
  RuleListResponse,
  RuleUpdateParams,
  Rules,
} from './rules';

export class Fraud extends APIResource {
  rules: RulesAPI.Rules = new RulesAPI.Rules(this._client);
}

Fraud.Rules = Rules;

export declare namespace Fraud {
  export {
    Rules as Rules,
    type FraudRule as FraudRule,
    type RuleListResponse as RuleListResponse,
    type RuleCreateParams as RuleCreateParams,
    type RuleUpdateParams as RuleUpdateParams,
    type RuleListParams as RuleListParams,
  };
}
