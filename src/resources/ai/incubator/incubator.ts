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

/**
 * The AI-driven seed funding and incubation platform. Submit, refine, and track business plans, receive AI-generated feedback, and secure investment capital.
 */
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
  /**
   * The maximum number of items returned in the current page.
   */
  limit: unknown;

  /**
   * The number of items skipped before the current page.
   */
  offset: unknown;

  /**
   * The total number of items available across all pages.
   */
  total: unknown;

  data?: Array<PitchAPI.QuantumWeaverState>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface IncubatorListPitchesParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;

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
