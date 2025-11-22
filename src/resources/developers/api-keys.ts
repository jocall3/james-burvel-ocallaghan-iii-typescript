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
  list(options?: RequestOptions): APIPromise<APIKeyListResponse> {
    return this._client.get('/developers/api-keys', options);
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
   * A short, non-sensitive prefix of the API key for identification.
   */
  prefix: string;

  /**
   * A list of OAuth2 scopes granted to this API key.
   */
  scopes: Array<string>;

  /**
   * Current status of the API key.
   */
  status: 'active' | 'revoked' | 'expired';

  /**
   * Optional: Timestamp when the API key will expire.
   */
  expiresAt?: string | null;

  /**
   * Timestamp of the last successful API call made with this key.
   */
  lastUsed?: string | null;

  /**
   * A user-defined name or description for the API key.
   */
  name?: string | null;
}

export type APIKeyListResponse = Array<APIKey>;

export interface APIKeyCreateParams {
  /**
   * A descriptive name for the new API key.
   */
  name: string;

  /**
   * A list of OAuth2 scopes to grant to this API key.
   */
  scopes: Array<string>;

  /**
   * Optional: Number of days until the API key expires. If omitted, the key does not
   * expire.
   */
  expiresInDays?: number | null;
}

export declare namespace APIKeys {
  export {
    type APIKey as APIKey,
    type APIKeyListResponse as APIKeyListResponse,
    type APIKeyCreateParams as APIKeyCreateParams,
  };
}
