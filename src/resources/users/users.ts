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
  city?: string;

  country?: string;

  state?: string;

  street?: string;

  zip?: string;
}

export interface User {
  /**
   * Unique identifier for the user.
   */
  id: string;

  /**
   * Primary email address of the user.
   */
  email: string;

  /**
   * Indicates if the user's identity has been verified (e.g., via KYC).
   */
  identityVerified: boolean;

  /**
   * Full name of the user.
   */
  name: string;

  address?: Address;

  /**
   * AI-identified financial persona for tailored advice.
   */
  aiPersona?: string;

  /**
   * Date of birth of the user (YYYY-MM-DD).
   */
  dateOfBirth?: string | null;

  /**
   * Current gamification level.
   */
  gamificationLevel?: number;

  /**
   * Current balance of loyalty points.
   */
  loyaltyPoints?: number;

  /**
   * Current loyalty program tier.
   */
  loyaltyTier?: string;

  /**
   * Primary phone number of the user.
   */
  phone?: string | null;

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
    biometricsEnrolled?: boolean;

    /**
     * Timestamp of the last successful login.
     */
    lastLogin?: string;

    /**
     * IP address of the last successful login.
     */
    lastLoginIp?: string;

    /**
     * Indicates if two-factor authentication (2FA) is enabled.
     */
    twoFactorEnabled?: boolean;
  }
}

export interface UserLoginResponse {
  /**
   * JWT access token to authenticate subsequent API requests.
   */
  accessToken: string;

  /**
   * Lifetime of the access token in seconds.
   */
  expiresIn: number;

  /**
   * Token used to obtain new access tokens without re-authenticating.
   */
  refreshToken: string;

  /**
   * Type of the access token.
   */
  tokenType: string;
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
   * Optional: Multi-factor authentication code, if required.
   */
  mfaCode?: string | null;
}

export interface UserRegisterParams {
  /**
   * Email address for registration and login.
   */
  email: string;

  /**
   * Full name of the user.
   */
  name: string;

  /**
   * User's chosen password.
   */
  password: string;

  /**
   * Optional initial address details.
   */
  address?: Address;

  /**
   * Optional date of birth (YYYY-MM-DD).
   */
  dateOfBirth?: string | null;

  /**
   * Optional phone number for MFA or recovery.
   */
  phone?: string | null;
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
