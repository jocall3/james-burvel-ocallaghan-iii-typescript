// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

export class OverdraftSettings extends APIResource {
  /**
   * Retrieves the current overdraft protection settings for a specific account.
   *
   * @example
   * ```ts
   * const overdraftSettings =
   *   await client.accounts.overdraftSettings.retrieveSettings(
   *     'acc_chase_checking_4567',
   *   );
   * ```
   */
  retrieveSettings(accountID: string, options?: RequestOptions): APIPromise<OverdraftSettings> {
    return this._client.get(path`/accounts/${accountID}/overdraft-settings`, options);
  }

  /**
   * Updates the overdraft protection settings for a specific account, enabling or
   * disabling protection and configuring preferences.
   *
   * @example
   * ```ts
   * const overdraftSettings =
   *   await client.accounts.overdraftSettings.updateSettings(
   *     'acc_chase_checking_4567',
   *     { feePreference: 'decline_if_over_limit' },
   *   );
   * ```
   */
  updateSettings(
    accountID: string,
    body: OverdraftSettingUpdateSettingsParams,
    options?: RequestOptions,
  ): APIPromise<OverdraftSettings> {
    return this._client.put(path`/accounts/${accountID}/overdraft-settings`, { body, ...options });
  }
}

export interface OverdraftSettings {
  /**
   * The ID of the account these settings apply to.
   */
  accountId: string;

  /**
   * Indicates if overdraft protection is enabled for this account.
   */
  enabled: boolean;

  /**
   * User preference for how overdrafts should be handled (e.g., always pay, decline
   * if over limit).
   */
  feePreference: 'always_pay' | 'decline_if_over_limit' | 'ask_me';

  /**
   * The ID of the savings account linked for overdraft protection.
   */
  linkedSavingsAccountId?: string | null;

  /**
   * If true, attempts to draw from a linked savings account to cover overdrafts.
   */
  linkToSavings?: boolean;

  /**
   * The maximum amount the account can be overdrawn if protection is enabled.
   */
  protectionLimit?: number | null;
}

export interface OverdraftSettingUpdateSettingsParams {
  /**
   * Set to `true` to enable, `false` to disable overdraft protection.
   */
  enabled?: boolean;

  /**
   * New user preference for how overdrafts should be handled.
   */
  feePreference?: 'always_pay' | 'decline_if_over_limit' | 'ask_me';

  /**
   * The ID of the savings account to link. Set to `null` if unlinking.
   */
  linkedSavingsAccountId?: string | null;

  /**
   * Set to `true` to link to savings, `false` to unlink.
   */
  linkToSavings?: boolean;

  /**
   * The new maximum overdraft amount. Set to `null` if disabling protection.
   */
  protectionLimit?: number | null;
}

export declare namespace OverdraftSettings {
  export {
    type OverdraftSettings as OverdraftSettings,
    type OverdraftSettingUpdateSettingsParams as OverdraftSettingUpdateSettingsParams,
  };
}
