// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as APIKeysAPI from './api-keys';
import { APIKey, APIKeyCreateParams, APIKeyListResponse, APIKeys } from './api-keys';
import * as WebhooksAPI from './webhooks';
import {
  WebhookCreateParams,
  WebhookListResponse,
  WebhookSubscription,
  WebhookUpdateParams,
  Webhooks,
} from './webhooks';

export class Developers extends APIResource {
  webhooks: WebhooksAPI.Webhooks = new WebhooksAPI.Webhooks(this._client);
  apiKeys: APIKeysAPI.APIKeys = new APIKeysAPI.APIKeys(this._client);
}

Developers.Webhooks = Webhooks;
Developers.APIKeys = APIKeys;

export declare namespace Developers {
  export {
    Webhooks as Webhooks,
    type WebhookSubscription as WebhookSubscription,
    type WebhookListResponse as WebhookListResponse,
    type WebhookCreateParams as WebhookCreateParams,
    type WebhookUpdateParams as WebhookUpdateParams,
  };

  export {
    APIKeys as APIKeys,
    type APIKey as APIKey,
    type APIKeyListResponse as APIKeyListResponse,
    type APIKeyCreateParams as APIKeyCreateParams,
  };
}
