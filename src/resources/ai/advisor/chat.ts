// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as ChatAPI from './chat';
import * as InsightsAPI from '../../transactions/insights';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Chat extends APIResource {
  /**
   * Fetches the full conversation history with the Quantum AI Advisor for a given
   * session or user.
   *
   * @example
   * ```ts
   * const response =
   *   await client.ai.advisor.chat.retrieveHistory();
   * ```
   */
  retrieveHistory(
    query: ChatRetrieveHistoryParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<ChatRetrieveHistoryResponse> {
    return this._client.get('/ai/advisor/chat/history', { query, ...options });
  }

  /**
   * Initiates or continues a sophisticated conversation with Quantum, the AI
   * Advisor. Quantum can provide advanced financial insights, execute complex tasks
   * via an expanding suite of intelligent tools, and learn from user interactions to
   * offer hyper-personalized guidance.
   *
   * @example
   * ```ts
   * const response = await client.ai.advisor.chat.sendMessage({
   *   sessionId: 'session-quantum-xyz-789-alpha',
   *   message:
   *     'Can you analyze my recent spending patterns and suggest areas for saving, focusing on my dining expenses?',
   * });
   * ```
   */
  sendMessage(body: ChatSendMessageParams, options?: RequestOptions): APIPromise<ChatSendMessageResponse> {
    return this._client.post('/ai/advisor/chat', { body, ...options });
  }
}

export interface AIFunctionCall {
  /**
   * A unique identifier for this specific function call instance.
   */
  id: string;

  /**
   * The arguments to pass to the tool/function, as a JSON object.
   */
  args: unknown;

  /**
   * The name of the tool/function to call.
   */
  name: string;

  /**
   * A natural language explanation of why the AI wants to call this function, for
   * user confirmation.
   */
  description?: string | null;
}

export interface ChatRetrieveHistoryResponse {
  /**
   * The list of chat messages for the current page.
   */
  data: Array<ChatRetrieveHistoryResponse.Data>;

  /**
   * The maximum number of items returned per page.
   */
  limit: number;

  /**
   * The starting index of the list for pagination.
   */
  offset: number;

  /**
   * The total number of available items.
   */
  total: number;

  /**
   * The offset to use for the next page of results. Null if no more pages.
   */
  nextOffset?: number | null;
}

export namespace ChatRetrieveHistoryResponse {
  export interface Data {
    /**
     * The text content of the message.
     */
    content: string;

    /**
     * The sender of the message.
     */
    role: 'user' | 'assistant';

    /**
     * The timestamp when the message was sent.
     */
    timestamp: string;

    /**
     * Optional: Tool calls made by the assistant within this message.
     */
    toolCalls?: Array<ChatAPI.AIFunctionCall> | null;

    /**
     * Optional: Tool outputs provided by the user within this message.
     */
    toolOutputs?: Array<Data.ToolOutput> | null;
  }

  export namespace Data {
    export interface ToolOutput {
      /**
       * The name of the tool/function that was called.
       */
      name: string;

      /**
       * The JSON output returned by the execution of the tool/function.
       */
      response: unknown;

      /**
       * Optional: The `id` of the function call this response corresponds to.
       */
      callId?: string | null;
    }
  }
}

export interface ChatSendMessageResponse {
  /**
   * The ID of the conversation session.
   */
  sessionId: string;

  /**
   * Optional: A list of tool/function calls the AI wants the client to execute.
   */
  functionCalls?: Array<AIFunctionCall> | null;

  /**
   * Optional: A list of AI-generated insights or alerts related to the conversation.
   */
  proactiveInsights?: Array<InsightsAPI.AIInsight> | null;

  /**
   * The AI Advisor's natural language response.
   */
  text?: string | null;
}

export interface ChatRetrieveHistoryParams {
  /**
   * Maximum number of items to return in the response.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;

  /**
   * Optional: Filter history by a specific session ID. If omitted, recent
   * conversations will be returned.
   */
  sessionId?: string;
}

export interface ChatSendMessageParams {
  /**
   * The ID of the ongoing conversation session.
   */
  sessionId: string;

  /**
   * Optional: The output from a tool/function call that the AI previously requested.
   */
  functionResponse?: ChatSendMessageParams.FunctionResponse | null;

  /**
   * The user's textual input to the AI Advisor.
   */
  message?: string | null;
}

export namespace ChatSendMessageParams {
  /**
   * Optional: The output from a tool/function call that the AI previously requested.
   */
  export interface FunctionResponse {
    /**
     * The name of the tool/function that was called.
     */
    name: string;

    /**
     * The JSON output returned by the execution of the tool/function.
     */
    response: unknown;

    /**
     * Optional: The `id` of the function call this response corresponds to.
     */
    callId?: string | null;
  }
}

export declare namespace Chat {
  export {
    type AIFunctionCall as AIFunctionCall,
    type ChatRetrieveHistoryResponse as ChatRetrieveHistoryResponse,
    type ChatSendMessageResponse as ChatSendMessageResponse,
    type ChatRetrieveHistoryParams as ChatRetrieveHistoryParams,
    type ChatSendMessageParams as ChatSendMessageParams,
  };
}
