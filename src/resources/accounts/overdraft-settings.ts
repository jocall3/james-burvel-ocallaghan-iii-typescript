// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import { APIPromise } from '../../core/api-promise';
import { RequestOptions } from '../../internal/request-options';
import { path } from '../../internal/utils/path';

/**
 * Real-time interaction with all linked financial accounts, including comprehensive balance sheets, predictive cash flow, and intelligent overdraft management.
 */
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
  retrieveSettings(accountID: unknown, options?: RequestOptions): APIPromise<OverdraftSettings> {
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
    accountID: unknown,
    body: OverdraftSettingUpdateSettingsParams,
    options?: RequestOptions,
  ): APIPromise<OverdraftSettings> {
    return this._client.put(path`/accounts/${accountID}/overdraft-settings`, { body, ...options });
  }
}

export interface OverdraftSettings {
  /**
   * The account ID these overdraft settings apply to.
   */
  accountId: unknown;

  /**
   * If true, overdraft protection is enabled.
   */
  enabled: unknown;

  /**
   * User's preference for how overdraft fees are handled or if transactions should
   * be declined.
   */
  feePreference: 'always_pay' | 'decline_if_over_limit' | 'ask_me_first';

  /**
   * The ID of the linked savings account, if `linkToSavings` is true.
   */
  linkedSavingsAccountId?: unknown;

  /**
   * If true, attempts to draw funds from a linked savings account.
   */
  linkToSavings?: unknown;

  /**
   * The maximum amount that can be covered by overdraft protection.
   */
  protectionLimit?: unknown;
}

export interface OverdraftSettingUpdateSettingsParams {
  /**
   * Enable or disable overdraft protection.
   */
  enabled?: unknown;

  /**
   * New preference for how overdraft fees are handled.
   */
  feePreference?: 'always_pay' | 'decline_if_over_limit' | 'ask_me_first';

  /**
   * New ID of the linked savings account, if `linkToSavings` is true. Set to null to
   * unlink.
   */
  linkedSavingsAccountId?: unknown;

  /**
   * Enable or disable linking to a savings account for overdraft coverage.
   */
  linkToSavings?: unknown;

  /**
   * New maximum amount for overdraft protection. Set to null to remove limit.
   */
  protectionLimit?: unknown;
}

export declare namespace OverdraftSettings {
  export {
    type OverdraftSettings as OverdraftSettings,
    type OverdraftSettingUpdateSettingsParams as OverdraftSettingUpdateSettingsParams,
  };
}
