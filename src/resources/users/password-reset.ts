// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';

export class PasswordReset extends APIResource {
  /**
   * Confirms the password reset using the received verification code and sets a new
   * password.
   *
   * @example
   * ```ts
   * const response = await client.users.passwordReset.confirm({
   *   identifier: 'reset.user@example.com',
   *   newPassword: 'MyNewStrongPassword@789',
   *   verificationCode: '654321',
   * });
   * ```
   */
  confirm(
    body: PasswordResetConfirmParams,
    options?: RequestOptions,
  ): APIPromise<PasswordResetConfirmResponse> {
    return this._client.post('/users/password-reset/confirm', { body, ...options });
  }

  /**
   * Starts the password reset flow by sending a verification code or link to the
   * user's registered email or phone.
   *
   * @example
   * ```ts
   * const response = await client.users.passwordReset.initiate({
   *   identifier: 'reset.user@example.com',
   * });
   * ```
   */
  initiate(
    body: PasswordResetInitiateParams,
    options?: RequestOptions,
  ): APIPromise<PasswordResetInitiateResponse> {
    return this._client.post('/users/password-reset/initiate', { body, ...options });
  }
}

export interface PasswordResetConfirmResponse {
  message?: string;
}

export interface PasswordResetInitiateResponse {
  message?: string;
}

export interface PasswordResetConfirmParams {
  /**
   * User's email or phone number used for verification.
   */
  identifier: string;

  /**
   * The new password for the user account.
   */
  newPassword: string;

  /**
   * The verification code received via email or SMS.
   */
  verificationCode: string;
}

export interface PasswordResetInitiateParams {
  /**
   * User's email or phone number for verification.
   */
  identifier: string;
}

export declare namespace PasswordReset {
  export {
    type PasswordResetConfirmResponse as PasswordResetConfirmResponse,
    type PasswordResetInitiateResponse as PasswordResetInitiateResponse,
    type PasswordResetConfirmParams as PasswordResetConfirmParams,
    type PasswordResetInitiateParams as PasswordResetInitiateParams,
  };
}
