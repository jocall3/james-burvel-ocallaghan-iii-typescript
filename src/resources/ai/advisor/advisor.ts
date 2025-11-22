// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as ChatAPI from './chat';
import {
  AIFunctionCall,
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
  listTools(options?: RequestOptions): APIPromise<AdvisorListToolsResponse> {
    return this._client.get('/ai/advisor/tools', options);
  }
}

export type AdvisorListToolsResponse = Array<AdvisorListToolsResponse.AdvisorListToolsResponseItem>;

export namespace AdvisorListToolsResponse {
  export interface AdvisorListToolsResponseItem {
    /**
     * The OAuth2 scope required to execute this tool.
     */
    accessScope: string;

    /**
     * A description of what the tool does.
     */
    description: string;

    /**
     * The name of the tool function.
     */
    name: string;

    /**
     * An OpenAPI-compatible schema object for the tool's input parameters.
     */
    parameters: unknown;
  }
}

Advisor.Chat = Chat;

export declare namespace Advisor {
  export { type AdvisorListToolsResponse as AdvisorListToolsResponse };

  export {
    Chat as Chat,
    type AIFunctionCall as AIFunctionCall,
    type ChatRetrieveHistoryResponse as ChatRetrieveHistoryResponse,
    type ChatSendMessageResponse as ChatSendMessageResponse,
    type ChatRetrieveHistoryParams as ChatRetrieveHistoryParams,
    type ChatSendMessageParams as ChatSendMessageParams,
  };
}
