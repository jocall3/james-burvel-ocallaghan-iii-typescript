// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as KYCAPI from './kyc';
import { KYC, KYCStatus, KYCSubmitParams } from './kyc';

export class Identity extends APIResource {
  kyc: KYCAPI.KYC = new KYCAPI.KYC(this._client);
}

Identity.KYC = KYC;

export declare namespace Identity {
  export { KYC as KYC, type KYCStatus as KYCStatus, type KYCSubmitParams as KYCSubmitParams };
}
