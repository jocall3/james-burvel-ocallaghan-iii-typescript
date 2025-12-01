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
  city?: unknown;

  country?: unknown;

  state?: unknown;

  street?: unknown;

  zip?: unknown;
}

export interface User {
  /**
   * Unique identifier for the user.
   */
  id: unknown;

  /**
   * Primary email address of the user.
   */
  email: unknown;

  /**
   * Indicates if the user's identity has been verified (e.g., via KYC).
   */
  identityVerified: unknown;

  /**
   * Full name of the user.
   */
  name: unknown;

  address?: Address;

  /**
   * AI-identified financial persona for tailored advice.
   */
  aiPersona?: unknown;

  /**
   * Date of birth of the user (YYYY-MM-DD).
   */
  dateOfBirth?: unknown;

  /**
   * Current gamification level.
   */
  gamificationLevel?: unknown;

  /**
   * Current balance of loyalty points.
   */
  loyaltyPoints?: unknown;

  /**
   * Current loyalty program tier.
   */
  loyaltyTier?: unknown;

  /**
   * Primary phone number of the user.
   */
  phone?: unknown;

  /**
   * User's personalized preferences for the platform.
   */
  preferences?: PreferencesAPI.UserPreferences;

  /**
   * Security-related status for the user account.
   */
  securityStatus?: User.SecurityStatus;
}

export namespace User {
  /**
   * Security-related status for the user account.
   */
  export interface SecurityStatus {
    /**
     * Indicates if biometric authentication is enrolled.
     */
    biometricsEnrolled?: unknown;

    /**
     * Timestamp of the last successful login.
     */
    lastLogin?: unknown;

    /**
     * IP address of the last successful login.
     */
    lastLoginIp?: unknown;

    /**
     * Indicates if two-factor authentication (2FA) is enabled.
     */
    twoFactorEnabled?: unknown;
  }
}

export interface UserLoginResponse {
  /**
   * JWT access token to authenticate subsequent API requests.
   */
  accessToken: unknown;

  /**
   * Lifetime of the access token in seconds.
   */
  expiresIn: unknown;

  /**
   * Token used to obtain new access tokens without re-authenticating.
   */
  refreshToken: unknown;

  /**
   * Type of the access token.
   */
  tokenType: unknown;
}

export interface UserLoginParams {
  /**
   * User's email address.
   */
  email: unknown;

  /**
   * User's password.
   */
  password: unknown;

  /**
   * Optional: Multi-factor authentication code, if required.
   */
  mfaCode?: unknown;
}

export interface UserRegisterParams {
  /**
   * Email address for registration and login.
   */
  email: unknown;

  /**
   * Full name of the user.
   */
  name: unknown;

  /**
   * User's chosen password.
   */
  password: unknown;

  address?: Address;

  /**
   * Optional date of birth (YYYY-MM-DD).
   */
  dateOfBirth?: unknown;

  /**
   * Optional phone number for MFA or recovery.
   */
  phone?: unknown;
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
