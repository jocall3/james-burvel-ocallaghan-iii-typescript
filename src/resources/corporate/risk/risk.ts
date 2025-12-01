// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as FraudAPI from './fraud/fraud';
import { Fraud } from './fraud/fraud';

export class Risk extends APIResource {
  fraud: FraudAPI.Fraud = new FraudAPI.Fraud(this._client);
}

Risk.Fraud = Fraud;

export declare namespace Risk {
  export { Fraud as Fraud };
}
