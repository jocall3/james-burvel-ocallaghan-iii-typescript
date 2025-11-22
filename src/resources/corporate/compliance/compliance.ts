// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as AuditsAPI from './audits';
import { AuditRequestParams, AuditRequestResponse, AuditRetrieveReportResponse, Audits } from './audits';

export class Compliance extends APIResource {
  audits: AuditsAPI.Audits = new AuditsAPI.Audits(this._client);
}

Compliance.Audits = Audits;

export declare namespace Compliance {
  export {
    Audits as Audits,
    type AuditRequestResponse as AuditRequestResponse,
    type AuditRetrieveReportResponse as AuditRetrieveReportResponse,
    type AuditRequestParams as AuditRequestParams,
  };
}
