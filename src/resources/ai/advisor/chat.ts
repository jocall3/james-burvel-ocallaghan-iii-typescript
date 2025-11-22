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
   * Unique identifier for this specific function call.
   */
  id: string;

  /**
   * A JSON object containing the arguments for the function call.
   */
  args: unknown;

  /**
   * The name of the tool function to be called.
   */
  name: string;
}

export interface ChatRetrieveHistoryResponse {
  data?: Array<ChatRetrieveHistoryResponse.Data>;

  /**
   * The maximum number of items returned per page.
   */
  limit?: number;

  /**
   * The offset to use for the next page of results. Null if no more pages.
   */
  nextOffset?: number | null;

  /**
   * The starting index of the list for pagination.
   */
  offset?: number;

  /**
   * The total number of available items.
   */
  total?: number;
}

export namespace ChatRetrieveHistoryResponse {
  export interface Data {
    /**
     * The content of the message.
     */
    content: string;

    /**
     * The role of the sender of the message.
     */
    role: 'user' | 'assistant' | 'tool';

    /**
     * The timestamp when the message was sent/generated.
     */
    timestamp: string;

    /**
     * If the role is 'assistant' and this is a tool call.
     */
    functionCall?: ChatAPI.AIFunctionCall | null;

    /**
     * If the role is 'tool', the output of the function call.
     */
    functionResponse?: unknown | null;
  }
}

export interface ChatSendMessageResponse {
  /**
   * Suggestions for next conversational turns or clarifications needed by the AI.
   */
  followUpQuestions?: Array<string> | null;

  /**
   * Requests for the client application to execute specific tool functions on behalf
   * of the AI.
   */
  functionCalls?: Array<AIFunctionCall> | null;

  /**
   * AI-generated proactive insights or recommendations.
   */
  proactiveInsights?: Array<InsightsAPI.AIInsight> | null;

  /**
   * The ID of the current conversation session.
   */
  sessionId?: string;

  /**
   * The AI Advisor's textual response.
   */
  text?: string;
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
   * The user's natural language input to the AI Advisor.
   */
  message: string;

  /**
   * Optional: The output from a tool function that the AI previously requested to be
   * executed by the client.
   */
  functionResponse?: ChatSendMessageParams.FunctionResponse | null;

  /**
   * Optional: The ID of an ongoing conversation session to maintain context.
   */
  sessionId?: string | null;
}

export namespace ChatSendMessageParams {
  /**
   * Optional: The output from a tool function that the AI previously requested to be
   * executed by the client.
   */
  export interface FunctionResponse {
    /**
     * The name of the function that was called.
     */
    name?: string;

    /**
     * The JSON object containing the result of the function call.
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
