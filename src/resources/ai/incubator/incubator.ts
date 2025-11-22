// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as PitchAPI from './pitch';
import {
  Pitch,
  PitchRetrieveDetailsResponse,
  PitchSubmitFeedbackParams,
  PitchSubmitParams,
  QuantumWeaverState,
} from './pitch';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Incubator extends APIResource {
  pitch: PitchAPI.Pitch = new PitchAPI.Pitch(this._client);

  /**
   * Retrieves a summary list of all business pitches submitted by the authenticated
   * user to Quantum Weaver.
   *
   * @example
   * ```ts
   * const response = await client.ai.incubator.listPitches();
   * ```
   */
  listPitches(
    query: IncubatorListPitchesParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<IncubatorListPitchesResponse> {
    return this._client.get('/ai/incubator/pitches', { query, ...options });
  }
}

export interface IncubatorListPitchesResponse {
  data?: Array<PitchAPI.QuantumWeaverState>;

  /**
   * The maximum number of items returned per page.
   */
  limit?: number;

  /**
   * The starting index of the list for pagination.
   */
  offset?: number;

  /**
   * The total number of available items.
   */
  total?: number;
}

export interface IncubatorListPitchesParams {
  /**
   * Maximum number of items to return.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;

  /**
   * Filter pitches by their current stage.
   */
  status?:
    | 'submitted'
    | 'initial_review'
    | 'ai_analysis'
    | 'feedback_required'
    | 'test_phase'
    | 'final_review'
    | 'approved_for_funding'
    | 'rejected'
    | 'incubated_graduated';
}

Incubator.Pitch = Pitch;

export declare namespace Incubator {
  export {
    type IncubatorListPitchesResponse as IncubatorListPitchesResponse,
    type IncubatorListPitchesParams as IncubatorListPitchesParams,
  };

  export {
    Pitch as Pitch,
    type QuantumWeaverState as QuantumWeaverState,
    type PitchRetrieveDetailsResponse as PitchRetrieveDetailsResponse,
    type PitchSubmitParams as PitchSubmitParams,
    type PitchSubmitFeedbackParams as PitchSubmitFeedbackParams,
  };
}
