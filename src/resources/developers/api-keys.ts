// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { buildHeaders } from '../../internal/headers';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

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
  revoke(keyID: string, options?: RequestOptions): APIPromise<void> {
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
  id: string;

  /**
   * Timestamp when the API key was created.
   */
  createdAt: string;

  /**
   * The non-secret prefix of the API key, used for identification.
   */
  prefix: string;

  /**
   * List of permissions granted to this API key.
   */
  scopes: Array<string>;

  /**
   * Current status of the API key.
   */
  status: 'active' | 'revoked' | 'expired';

  /**
   * Timestamp when the API key will expire, if set.
   */
  expiresAt?: string | null;

  /**
   * Timestamp of the last time this API key was used.
   */
  lastUsed?: string | null;
}

export interface APIKeyListResponse {
  /**
   * The maximum number of items returned in the current page.
   */
  limit: number;

  /**
   * The number of items skipped before the current page.
   */
  offset: number;

  /**
   * The total number of items available across all pages.
   */
  total: number;

  data?: Array<APIKey>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface APIKeyCreateParams {
  /**
   * A descriptive name for the API key.
   */
  name: string;

  /**
   * List of permissions to grant to this API key.
   */
  scopes: Array<string>;

  /**
   * Optional: Number of days until the API key expires. If omitted, it will not
   * expire.
   */
  expiresInDays?: number | null;
}

export interface APIKeyListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export declare namespace APIKeys {
  export {
    type APIKey as APIKey,
    type APIKeyListResponse as APIKeyListResponse,
    type APIKeyCreateParams as APIKeyCreateParams,
    type APIKeyListParams as APIKeyListParams,
  };
}
