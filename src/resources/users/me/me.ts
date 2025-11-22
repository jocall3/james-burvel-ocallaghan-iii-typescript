// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as UsersAPI from '../users';
import * as BiometricsAPI from './biometrics';
import {
  BiometricEnrollParams,
  BiometricStatus,
  BiometricVerifyParams,
  BiometricVerifyResponse,
  Biometrics,
} from './biometrics';
import * as DevicesAPI from './devices';
import { Device, DeviceListResponse, DeviceRegisterParams, Devices } from './devices';
import * as PreferencesAPI from './preferences';
import { PreferenceUpdateParams, Preferences, UserPreferences } from './preferences';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Me extends APIResource {
  preferences: PreferencesAPI.Preferences = new PreferencesAPI.Preferences(this._client);
  devices: DevicesAPI.Devices = new DevicesAPI.Devices(this._client);
  biometrics: BiometricsAPI.Biometrics = new BiometricsAPI.Biometrics(this._client);

  /**
   * Fetches the complete and dynamically updated profile information for the
   * currently authenticated user, encompassing personal details, security status,
   * gamification level, loyalty points, and linked identity attributes.
   *
   * @example
   * ```ts
   * const user = await client.users.me.retrieve();
   * ```
   */
  retrieve(options?: RequestOptions): APIPromise<UsersAPI.User> {
    return this._client.get('/users/me', options);
  }

  /**
   * Updates selected fields of the currently authenticated user's profile
   * information.
   *
   * @example
   * ```ts
   * const user = await client.users.me.update({
   *   name: 'Quantum Visionary Pro',
   *   phone: '+1-555-999-0000',
   * });
   * ```
   */
  update(body: MeUpdateParams, options?: RequestOptions): APIPromise<UsersAPI.User> {
    return this._client.put('/users/me', { body, ...options });
  }
}

export interface MeUpdateParams {
  /**
   * Updated residential address of the user.
   */
  address?: UsersAPI.Address;

  /**
   * User's self-selected or AI-adjusted financial persona.
   */
  aiPersona?: string;

  /**
   * Updated full name of the user.
   */
  name?: string;

  /**
   * Updated phone number of the user.
   */
  phone?: string;
}

Me.Preferences = Preferences;
Me.Devices = Devices;
Me.Biometrics = Biometrics;

export declare namespace Me {
  export { type MeUpdateParams as MeUpdateParams };

  export {
    Preferences as Preferences,
    type UserPreferences as UserPreferences,
    type PreferenceUpdateParams as PreferenceUpdateParams,
  };

  export {
    Devices as Devices,
    type Device as Device,
    type DeviceListResponse as DeviceListResponse,
    type DeviceRegisterParams as DeviceRegisterParams,
  };

  export {
    Biometrics as Biometrics,
    type BiometricStatus as BiometricStatus,
    type BiometricVerifyResponse as BiometricVerifyResponse,
    type BiometricEnrollParams as BiometricEnrollParams,
    type BiometricVerifyParams as BiometricVerifyParams,
  };
}
