// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as ChatAPI from './chat';
import {
  Chat,
  ChatRetrieveHistoryParams,
  ChatRetrieveHistoryResponse,
  ChatSendMessageParams,
  ChatSendMessageResponse,
} from './chat';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Advisor extends APIResource {
  chat: ChatAPI.Chat = new ChatAPI.Chat(this._client);

  /**
   * Retrieves a dynamic manifest of all integrated AI tools that Quantum can invoke
   * and execute, providing details on their capabilities, parameters, and access
   * requirements.
   *
   * @example
   * ```ts
   * const response = await client.ai.advisor.listTools();
   * ```
   */
  listTools(
    query: AdvisorListToolsParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<AdvisorListToolsResponse> {
    return this._client.get('/ai/advisor/tools', { query, ...options });
  }
}

export interface AdvisorListToolsResponse {
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

  data?: Array<AdvisorListToolsResponse.Data>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export namespace AdvisorListToolsResponse {
  export interface Data {
    /**
     * The OAuth2 scope required to execute this tool.
     */
    accessScope: unknown;

    /**
     * A description of what the tool does.
     */
    description: unknown;

    /**
     * The unique name of the AI tool (function name).
     */
    name: unknown;

    /**
     * OpenAPI schema object defining the input parameters for the tool function.
     */
    parameters: Data.Parameters;
  }

  export namespace Data {
    /**
     * OpenAPI schema object defining the input parameters for the tool function.
     */
    export interface Parameters {
      properties?: unknown;

      required?: Array<unknown>;

      type?: 'object';
    }
  }
}

export interface AdvisorListToolsParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

Advisor.Chat = Chat;

export declare namespace Advisor {
  export {
    type AdvisorListToolsResponse as AdvisorListToolsResponse,
    type AdvisorListToolsParams as AdvisorListToolsParams,
  };

  export {
    Chat as Chat,
    type ChatRetrieveHistoryResponse as ChatRetrieveHistoryResponse,
    type ChatSendMessageResponse as ChatSendMessageResponse,
    type ChatRetrieveHistoryParams as ChatRetrieveHistoryParams,
    type ChatSendMessageParams as ChatSendMessageParams,
  };
}
