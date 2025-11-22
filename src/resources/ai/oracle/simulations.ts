// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as SimulateAPI from './simulate';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Simulations extends APIResource {
  /**
   * Retrieves the full, detailed results of a specific financial simulation by its
   * ID.
   *
   * @example
   * ```ts
   * const simulation =
   *   await client.ai.oracle.simulations.retrieve(
   *     'simulationId',
   *   );
   * ```
   */
  retrieve(simulationID: string, options?: RequestOptions): APIPromise<SimulationRetrieveResponse> {
    return this._client.get(path`/ai/oracle/simulations/${simulationID}`, options);
  }

  /**
   * Retrieves a list of all financial simulations previously run by the user,
   * including their status and summaries.
   *
   * @example
   * ```ts
   * const simulations =
   *   await client.ai.oracle.simulations.list();
   * ```
   */
  list(
    query: SimulationListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<SimulationListResponse> {
    return this._client.get('/ai/oracle/simulations', { query, ...options });
  }

  /**
   * Deletes a previously run financial simulation and its results.
   *
   * @example
   * ```ts
   * await client.ai.oracle.simulations.delete('simulationId');
   * ```
   */
  delete(simulationID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/ai/oracle/simulations/${simulationID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export type SimulationRetrieveResponse =
  | SimulateAPI.SimulationResponse
  | SimulateAPI.AdvancedSimulationResponse;

export interface SimulationListResponse {
  data?: Array<SimulationListResponse.Data>;

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

export namespace SimulationListResponse {
  export interface Data {
    /**
     * Timestamp when the simulation was requested.
     */
    creationDate: string;

    /**
     * Timestamp when the simulation status or results were last updated.
     */
    lastUpdated: string;

    /**
     * Unique identifier for the simulation.
     */
    simulationId: string;

    /**
     * Current status of the simulation.
     */
    status: 'queued' | 'processing' | 'completed' | 'failed';

    /**
     * A brief summary of what the simulation evaluated.
     */
    summary: string;

    /**
     * A short, descriptive title for the simulation.
     */
    title: string;
  }
}

export interface SimulationListParams {
  /**
   * Maximum number of items to return in the response.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace Simulations {
  export {
    type SimulationRetrieveResponse as SimulationRetrieveResponse,
    type SimulationListResponse as SimulationListResponse,
    type SimulationListParams as SimulationListParams,
  };
}
