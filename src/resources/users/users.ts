// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as PasswordResetAPI from './password-reset';
import {
  PasswordReset,
  PasswordResetConfirmParams,
  PasswordResetConfirmResponse,
  PasswordResetInitiateParams,
  PasswordResetInitiateResponse,
} from './password-reset';
import * as MeAPI from './me/me';
import { Me, MeUpdateParams } from './me/me';
import * as PreferencesAPI from './me/preferences';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class Users extends APIResource {
  passwordReset: PasswordResetAPI.PasswordReset = new PasswordResetAPI.PasswordReset(this._client);
  me: MeAPI.Me = new MeAPI.Me(this._client);

  /**
   * Authenticates a user and creates a secure session, returning access tokens. May
   * require MFA depending on user settings.
   *
   * @example
   * ```ts
   * const response = await client.users.login({
   *   email: 'quantum.visionary@demobank.com',
   *   password: 'YourSecurePassword123',
   * });
   * ```
   */
  login(body: UserLoginParams, options?: RequestOptions): APIPromise<UserLoginResponse> {
    return this._client.post('/users/login', { body, ...options });
  }

  /**
   * Registers a new user account with , initiating the onboarding process. Requires
   * basic user details.
   *
   * @example
   * ```ts
   * const user = await client.users.register({
   *   email: 'alice.w@example.com',
   *   name: 'Alice Wonderland',
   *   password: 'SecureP@ssw0rd2024!',
   *   phone: '+1-555-987-6543',
   * });
   * ```
   */
  register(body: UserRegisterParams, options?: RequestOptions): APIPromise<User> {
    return this._client.post('/users/register', { body, ...options });
  }
}

export interface Address {
  /**
   * City.
   */
  city?: string;

  /**
   * Country.
   */
  country?: string;

  /**
   * State or province (if applicable).
   */
  state?: string | null;

  /**
   * Street name and number.
   */
  street?: string;

  /**
   * Postal or ZIP code.
   */
  zip?: string;
}

export interface User {
  /**
   * Unique identifier for the user.
   */
  id: string;

  /**
   * Unique email address of the user.
   */
  email: string;

  /**
   * Full name of the user.
   */
  name: string;

  /**
   * User's residential address.
   */
  address?: Address;

  /**
   * AI-assigned financial persona based on user behavior and preferences.
   */
  aiPersona?: string;

  /**
   * User's date of birth.
   */
  dateOfBirth?: string | null;

  /**
   * Current gamification level of the user.
   */
  gamificationLevel?: number;

  /**
   * Indicates if the user's identity has been fully verified (KYC/AML).
   */
  identityVerified?: boolean;

  /**
   * Total loyalty points accumulated by the user.
   */
  loyaltyPoints?: number;

  /**
   * Current loyalty tier of the user.
   */
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Zenith Platinum';

  /**
   * Phone number of the user.
   */
  phone?: string | null;

  /**
   * User's personalization and experience preferences.
   */
  preferences?: PreferencesAPI.UserPreferences;

  /**
   * Current security status and settings for the user.
   */
  securityStatus?: User.SecurityStatus;
}

export namespace User {
  /**
   * Current security status and settings for the user.
   */
  export interface SecurityStatus {
    /**
     * Indicates if biometric authentication is enrolled.
     */
    biometricsEnrolled?: boolean;

    /**
     * Timestamp of the user's last successful login.
     */
    lastLogin?: string;

    /**
     * IP address from which the last successful login occurred.
     */
    lastLoginIp?: string;

    /**
     * Indicates if two-factor authentication is enabled.
     */
    twoFactorEnabled?: boolean;
  }
}

export interface UserLoginResponse {
  /**
   * JWT access token for authenticated API requests.
   */
  accessToken?: string;

  /**
   * Lifetime of the access token in seconds.
   */
  expiresIn?: number;

  /**
   * Token used to obtain a new access token without re-authenticating.
   */
  refreshToken?: string;

  /**
   * Type of the token, usually 'Bearer'.
   */
  tokenType?: string;
}

export interface UserLoginParams {
  /**
   * User's email address.
   */
  email: string;

  /**
   * User's password.
   */
  password: string;

  /**
   * Multi-factor authentication code, if required.
   */
  mfaCode?: string | null;
}

export interface UserRegisterParams {
  /**
   * Unique email address for the user.
   */
  email: string;

  /**
   * Full name of the user.
   */
  name: string;

  /**
   * Secure password for the user account.
   */
  password: string;

  /**
   * Phone number for SMS verification and communication.
   */
  phone: string;

  /**
   * User's residential address (optional for initial registration).
   */
  address?: Address;

  /**
   * User's date of birth (optional for initial registration).
   */
  dateOfBirth?: string | null;
}

Users.PasswordReset = PasswordReset;
Users.Me = Me;

export declare namespace Users {
  export {
    type Address as Address,
    type User as User,
    type UserLoginResponse as UserLoginResponse,
    type UserLoginParams as UserLoginParams,
    type UserRegisterParams as UserRegisterParams,
  };

  export {
    PasswordReset as PasswordReset,
    type PasswordResetConfirmResponse as PasswordResetConfirmResponse,
    type PasswordResetInitiateResponse as PasswordResetInitiateResponse,
    type PasswordResetConfirmParams as PasswordResetConfirmParams,
    type PasswordResetInitiateParams as PasswordResetInitiateParams,
  };

  export { Me as Me, type MeUpdateParams as MeUpdateParams };
}
