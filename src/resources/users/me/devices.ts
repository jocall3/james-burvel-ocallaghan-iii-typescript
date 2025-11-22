// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Devices extends APIResource {
  /**
   * Retrieves a list of all devices linked to the user's account, including mobile
   * phones, tablets, and desktops, indicating their last active status and security
   * posture.
   *
   * @example
   * ```ts
   * const devices = await client.users.me.devices.list();
   * ```
   */
  list(
    query: DeviceListParams | null | undefined = {},
    options?: RequestOptions,
  ): APIPromise<DeviceListResponse> {
    return this._client.get('/users/me/devices', { query, ...options });
  }

  /**
   * Removes a specific device from the user's linked devices, revoking its access
   * and requiring re-registration for future use. Useful for lost or compromised
   * devices.
   *
   * @example
   * ```ts
   * await client.users.me.devices.deregister(
   *   'dev_mobile_ios_aabbcc',
   * );
   * ```
   */
  deregister(deviceID: string, options?: RequestOptions): APIPromise<void> {
    return this._client.delete(path`/users/me/devices/${deviceID}`, {
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * Registers a new device for secure access and multi-factor authentication,
   * associating it with the user's profile. This typically initiates a biometric or
   * MFA enrollment flow.
   *
   * @example
   * ```ts
   * const device = await client.users.me.devices.register({
   *   deviceType: 'mobile',
   *   model: 'Samsung Galaxy S24 Ultra',
   *   os: 'Android 14',
   *   biometricSignature:
   *     'base64encoded_android_biometric_proof',
   *   deviceName: "Alex's Work Phone",
   * });
   * ```
   */
  register(body: DeviceRegisterParams, options?: RequestOptions): APIPromise<Device> {
    return this._client.post('/users/me/devices', { body, ...options });
  }
}

/**
 * Information about a connected device.
 */
export interface Device {
  /**
   * Unique identifier for the device.
   */
  id: string;

  /**
   * Last known IP address of the device.
   */
  ipAddress: string;

  /**
   * Timestamp of the last activity from this device.
   */
  lastActive: string;

  /**
   * Model of the device.
   */
  model: string;

  /**
   * Operating system of the device.
   */
  os: string;

  /**
   * Security trust level of the device.
   */
  trustLevel: 'trusted' | 'pending_verification' | 'untrusted' | 'blocked';

  /**
   * Type of the device.
   */
  type: 'mobile' | 'desktop' | 'tablet' | 'smart_watch';

  /**
   * User-assigned name for the device.
   */
  deviceName?: string | null;

  /**
   * Push notification token for the device.
   */
  pushToken?: string | null;
}

export interface DeviceListResponse {
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

  data?: Array<Device>;

  /**
   * The offset for the next page of results, if available. Null if no more pages.
   */
  nextOffset?: number | null;
}

export interface DeviceListParams {
  /**
   * Maximum number of items to return in a single page.
   */
  limit?: number;

  /**
   * Number of items to skip before starting to collect the result set.
   */
  offset?: number;
}

export interface DeviceRegisterParams {
  /**
   * Type of the device being registered.
   */
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'smart_watch';

  /**
   * Model of the device.
   */
  model: string;

  /**
   * Operating system of the device.
   */
  os: string;

  /**
   * Optional: Base64 encoded biometric signature for initial enrollment (e.g., for
   * Passkey registration).
   */
  biometricSignature?: string | null;

  /**
   * Optional: A friendly name for the device.
   */
  deviceName?: string | null;

  /**
   * Optional: Push notification token for the device.
   */
  pushToken?: string | null;
}

export declare namespace Devices {
  export {
    type Device as Device,
    type DeviceListResponse as DeviceListResponse,
    type DeviceListParams as DeviceListParams,
    type DeviceRegisterParams as DeviceRegisterParams,
  };
}
