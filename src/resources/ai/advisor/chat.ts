// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
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
   *   message:
   *     'Can you analyze my recent spending patterns and suggest areas for saving, focusing on my dining expenses?',
   *   sessionId: 'session-quantum-xyz-789-alpha',
   * });
   * ```
   */
  sendMessage(body: ChatSendMessageParams, options?: RequestOptions): APIPromise<ChatSendMessageResponse> {
    return this._client.post('/ai/advisor/chat', { body, ...options });
  }
}

export interface AIFunctionCall {
  /**
   * A unique ID for this specific function call instance.
   */
  id: string;

  /**
   * Arguments to pass to the tool function.
   */
  args: { [key: string]: unknown };

  /**
   * The name of the tool function to be invoked.
   */
  name: string;
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
   * The total number of available items across all pages.
   */
  total: number;

  /**
   * The offset to use for the next page of results, if available.
   */
  nextOffset?: number | null;
}

export namespace ChatRetrieveHistoryResponse {
  export interface Data {
    /**
     * The content of the message.
     */
    content: string;

    /**
     * The role of the message sender.
     */
    role: 'user' | 'assistant' | 'system';

    /**
     * The timestamp when the message was sent/received.
     */
    timestamp: string;

    /**
     * Optional: Any additional metadata associated with the message, e.g., tool calls,
     * insights.
     */
    metadata?: { [key: string]: unknown } | null;
  }
}

export interface ChatSendMessageResponse {
  /**
   * The ID of the current conversation session.
   */
  sessionId: string;

  /**
   * The AI Advisor's natural language response.
   */
  text: string;

  /**
   * If the AI intends to use a tool, this provides the function call details.
   */
  functionCalls?: Array<AIFunctionCall> | null;

  /**
   * AI-generated proactive insights or recommendations.
   */
  proactiveInsights?: Array<InsightsAPI.AIInsight> | null;
}

export interface ChatRetrieveHistoryParams {
  /**
   * Maximum number of items to return.
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
   * The user's natural language message or query for the AI Advisor.
   */
  message: string;

  /**
   * Optional: If the user is responding to a tool call, this contains the output
   * from the tool's execution.
   */
  functionResponse?: ChatSendMessageParams.FunctionResponse | null;

  /**
   * Optional: The ID of an ongoing conversation session to maintain context.
   */
  sessionId?: string | null;
}

export namespace ChatSendMessageParams {
  /**
   * Optional: If the user is responding to a tool call, this contains the output
   * from the tool's execution.
   */
  export interface FunctionResponse {
    /**
     * The name of the tool function that was executed.
     */
    name?: string;

    /**
     * The structured output/result from the tool function execution.
     */
    response?: unknown;
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
