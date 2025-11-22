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
    subscriptionID: string,
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
   * const webhookSubscriptions =
   *   await client.developers.webhooks.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<WebhookListResponse> {
    return this._client.get('/developers/webhooks', options);
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
  delete(subscriptionID: string, options?: RequestOptions): APIPromise<void> {
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
  id: string;

  /**
   * The URL to which webhook events will be sent.
   */
  callbackUrl: string;

  /**
   * List of event types subscribed to (e.g., 'transaction.created',
   * 'user.login_failed').
   */
  events: Array<string>;

  /**
   * Number of consecutive failed delivery attempts.
   */
  failureCount: number;

  /**
   * Current status of the subscription.
   */
  status: 'active' | 'paused' | 'failed';

  /**
   * Timestamp when the webhook subscription was created.
   */
  createdAt?: string;

  /**
   * Timestamp of the last successful webhook delivery.
   */
  lastTriggered?: string | null;

  /**
   * The shared secret used to sign webhook payloads, null after creation for
   * security.
   */
  secret?: string | null;
}

export type WebhookListResponse = Array<WebhookSubscription>;

export interface WebhookCreateParams {
  /**
   * The URL to which webhook events will be sent.
   */
  callbackUrl: string;

  /**
   * List of event types to subscribe to (e.g., 'transaction.created',
   * 'account.updated').
   */
  events: Array<string>;

  /**
   * Optional: A secret string for signing webhook payloads. If not provided, one
   * will be auto-generated.
   */
  secret?: string | null;

  /**
   * Initial status of the subscription.
   */
  status?: 'active' | 'paused';
}

export interface WebhookUpdateParams {
  /**
   * New URL for the webhook endpoint.
   */
  callbackUrl?: string;

  /**
   * Updated list of event types to subscribe to.
   */
  events?: Array<string> | null;

  /**
   * Optional: A new secret string for signing webhook payloads. Providing this will
   * replace the existing secret.
   */
  secret?: string | null;

  /**
   * New status for the subscription.
   */
  status?: 'active' | 'paused';
}

export declare namespace Webhooks {
  export {
    type WebhookSubscription as WebhookSubscription,
    type WebhookListResponse as WebhookListResponse,
    type WebhookCreateParams as WebhookCreateParams,
    type WebhookUpdateParams as WebhookUpdateParams,
  };
}
