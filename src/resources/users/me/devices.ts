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
  list(options?: RequestOptions): APIPromise<DeviceListResponse> {
    return this._client.get('/users/me/devices', options);
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
   * Timestamp of last activity from this device.
   */
  lastActive: string;

  /**
   * Device model.
   */
  model: string;

  /**
   * Operating system and version.
   */
  os: string;

  /**
   * Security trust level of the device.
   */
  trustLevel: 'trusted' | 'untrusted' | 'pending_verification';

  /**
   * Type of device.
   */
  type: 'mobile' | 'desktop' | 'tablet' | 'smart_watch';

  /**
   * User-defined name for the device.
   */
  deviceName?: string | null;

  /**
   * Push notification token for the device.
   */
  pushToken?: string | null;
}

export type DeviceListResponse = Array<Device>;

export interface DeviceRegisterParams {
  /**
   * Type of device being registered.
   */
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'smart_watch';

  /**
   * Model of the device.
   */
  model: string;

  /**
   * Operating system and version of the device.
   */
  os: string;

  /**
   * Base64 encoded biometric signature for initial enrollment (if applicable).
   */
  biometricSignature?: string | null;

  /**
   * User-defined name for the device.
   */
  deviceName?: string | null;

  /**
   * Push notification token for the device.
   */
  pushToken?: string | null;
}

export declare namespace Devices {
  export {
    type Device as Device,
    type DeviceListResponse as DeviceListResponse,
    type DeviceRegisterParams as DeviceRegisterParams,
  };
}
