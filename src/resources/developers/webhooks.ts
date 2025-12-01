// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class Webhooks extends APIResource {
  /**
   * Establishes a new webhook subscription, allowing a developer application to
   * receive real-time notifications for specified events (e.g., new transaction,
   * account update) via a provided callback URL.
   *
   * @example
   * ```ts
   * const webhookSubscription =
   *   await client.developers.webhooks.create({
   *     callbackUrl:
   *       'https://my-analytics-app.com/webhooks/transactions',
   *     events: ['transaction.created', 'transaction.updated'],
   *     secret: 'my_custom_webhook_secret_123',
   *   });
   * ```
   */
  create(body: WebhookCreateParams, options?: RequestOptions): APIPromise<WebhookSubscription> {
    return this._client.post('/developers/webhooks', { body, ...options });
  }

  /**
   * Modifies an existing webhook subscription, allowing changes to the callback URL,
   * subscribed events, or activation status.
   *
   * @example
   * ```ts
   * const webhookSubscription =
   *   await client.developers.webhooks.update(
   *     'whsub_devtool_finance_events',
   *     { status: 'paused' },
   *   );
   * ```
   */
  update(
    subscriptionID: unknown,
    body: WebhookUpdateParams,
    options?: RequestOptions,
  ): APIPromise<WebhookSubscription> {
    return this._client.put(path`/developers/webhooks/${subscriptionID}`, { body, ...options });
  }

  /**
   * Retrieves a list of all active webhook subscriptions for the authenticated
   * developer application, detailing endpoint URLs, subscribed events, and current
   * status.
   *
   * @example
   * ```ts
   * const webhooks = await client.developers.webhooks.list();
   * ```
   */
  list(
    query: WebhookListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<WebhookListResponse> {
    return this._client.get('/developers/webhooks', { query, ...options });
  }

  /**
   * Deletes an existing webhook subscription, stopping all future event
   * notifications to the specified callback URL.
   *
   * @example
   * ```ts
   * await client.developers.webhooks.delete(
   *   'whsub_devtool_finance_events',
   * );
   * ```
   */
  delete(subscriptionID: unknown, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/developers/webhooks/${subscriptionID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface WebhookSubscription {
  /**
   * Unique identifier for the webhook subscription.
   */
  id: unknown;

  /**
   * The URL where webhook events will be sent.
   */
  callbackUrl: unknown;

  /**
   * Timestamp when the subscription was created.
   */
  createdAt: unknown;

  /**
   * List of event types subscribed to.
   */
  events: Array<unknown>;

  /**
   * Current status of the webhook subscription.
   */
  status: 'active' | 'paused' | 'suspended';

  /**
   * Number of consecutive failed delivery attempts.
   */
  failureCount?: unknown;

  /**
   * Timestamp of the last successful webhook delivery.
   */
  lastTriggered?: unknown;

  /**
   * The shared secret used to sign webhook payloads, for verification. Only returned
   * on creation.
   */
  secret?: unknown;
}

export interface WebhookListResponse {
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

  data?: Array<WebhookSubscription>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface WebhookCreateParams {
  /**
   * The URL to which webhook events will be sent.
   */
  callbackUrl: unknown;

  /**
   * List of event types to subscribe to.
   */
  events: Array<unknown>;

  /**
   * Optional: A custom shared secret for verifying webhook payloads. If omitted, one
   * will be generated.
   */
  secret?: unknown;
}

export interface WebhookUpdateParams {
  /**
   * Updated URL where webhook events will be sent.
   */
  callbackUrl?: unknown;

  /**
   * Updated list of event types subscribed to.
   */
  events?: Array<unknown>;

  /**
   * Updated status of the webhook subscription.
   */
  status?: 'active' | 'paused' | 'suspended';
}

export interface WebhookListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export declare namespace Webhooks {
  export {
    type WebhookSubscription as WebhookSubscription,
    type WebhookListResponse as WebhookListResponse,
    type WebhookCreateParams as WebhookCreateParams,
    type WebhookUpdateParams as WebhookUpdateParams,
    type WebhookListParams as WebhookListParams,
  };
}
