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
     * A description of what the AI tool does.
     */
    description: string;

    /**
     * The programmatic name of the AI tool.
     */
    name: string;

    /**
     * A JSON schema object defining the input parameters for the tool.
     */
    parameters: unknown;

    /**
     * The OAuth2 scope required to execute this tool, if applicable.
     */
    accessScope?: string | null;
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
