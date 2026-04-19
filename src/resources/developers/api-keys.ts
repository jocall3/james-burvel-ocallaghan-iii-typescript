// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Manage advanced security settings, monitor login activity, control third-party application connections, and oversee API key access for external integrations.
 */
export class APIKeys extends APIResource {
  /**
   * Generates a new API key for the developer application with specified scopes and
   * an optional expiration.
   *
   * @example
   * ```ts
   * const apiKey = await client.developers.apiKeys.create({
   *   name: 'My Analytics Service Key',
   *   scopes: ['read:accounts', 'read:transactions'],
   *   expiresInDays: 90,
   * });
   * ```
   */
  create(body: APIKeyCreateParams, options?: RequestOptions): APIPromise<APIKey> {
    return this._client.post('/developers/api-keys', { body, ...options });
  }

  /**
   * Retrieves a list of API keys issued to the authenticated developer application.
   *
   * @example
   * ```ts
   * const apiKeys = await client.developers.apiKeys.list();
   * ```
   */
  list(
    query: APIKeyListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<APIKeyListResponse> {
    return this._client.get('/developers/api-keys', { query, ...options });
  }

  /**
   * Revokes an existing API key, disabling its access immediately.
   *
   * @example
   * ```ts
   * await client.developers.apiKeys.revoke(
   *   'api_key_dev_app_01',
   * );
   * ```
   */
  revoke(keyID: unknown, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/developers/api-keys/${keyID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface APIKey {
  /**
   * Unique identifier for the API key.
   */
  id: unknown;

  /**
   * Timestamp when the API key was created.
   */
  createdAt: unknown;

  /**
   * The non-secret prefix of the API key, used for identification.
   */
  prefix: unknown;

  /**
   * List of permissions granted to this API key.
   */
  scopes: Array<unknown>;

  /**
   * Current status of the API key.
   */
  status: 'active' | 'revoked' | 'expired';

  /**
   * Timestamp when the API key will expire, if set.
   */
  expiresAt?: unknown;

  /**
   * Timestamp of the last time this API key was used.
   */
  lastUsed?: unknown;
}

export interface APIKeyListResponse {
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

  data?: Array<APIKey>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: unknown;
}

export interface APIKeyCreateParams {
  /**
   * A descriptive name for the API key.
   */
  name: unknown;

  /**
   * List of permissions to grant to this API key.
   */
  scopes: Array<unknown>;

  /**
   * Optional: Number of days until the API key expires. If omitted, it will not
   * expire.
   */
  expiresInDays?: unknown;
}

export interface APIKeyListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: unknown;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: unknown;
}

export declare namespace APIKeys {
  export {
    type APIKey as APIKey,
    type APIKeyListResponse as APIKeyListResponse,
    type APIKeyCreateParams as APIKeyCreateParams,
    type APIKeyListParams as APIKeyListParams,
  };
}
