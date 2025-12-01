// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Preferences extends APIResource {
  /**
   * Retrieves the user's deep personalization preferences, including AI
   * customization settings, notification channel priorities, thematic choices, and
   * data sharing consents.
   *
   * @example
   * ```ts
   * const userPreferences =
   *   await client.users.me.preferences.retrieve();
   * ```
   */
  retrieve(options?: RequestOptions): APIPromise<UserPreferences> {
    return this._client.get('/users/me/preferences', options);
  }

  /**
   * Updates the user's deep personalization preferences, allowing dynamic control
   * over AI behavior, notification delivery, thematic choices, and data privacy
   * settings.
   *
   * @example
   * ```ts
   * const userPreferences =
   *   await client.users.me.preferences.update({
   *     aiInteractionMode: 'proactive',
   *     theme: 'Dark-Quantum',
   *   });
   * ```
   */
  update(body: PreferenceUpdateParams, options?: RequestOptions): APIPromise<UserPreferences> {
    return this._client.put('/users/me/preferences', { body, ...options });
  }
}

/**
 * User's personalized preferences for the platform.
 */
export interface UserPreferences {
  /**
   * How the user prefers to interact with AI (proactive advice, balanced, or only on
   * demand).
   */
  aiInteractionMode?: 'proactive' | 'balanced' | 'on_demand';

  /**
   * Consent status for sharing anonymized data for AI improvement and personalized
   * offers.
   */
  dataSharingConsent?: unknown;

  /**
   * Preferred channels for receiving notifications.
   */
  notificationChannels?: UserPreferencesNotificationChannels;

  /**
   * Preferred language for the user interface.
   */
  preferredLanguage?: unknown;

  /**
   * Preferred UI theme (e.g., Light-Default, Dark-Quantum).
   */
  theme?: unknown;

  /**
   * Default grouping preference for transaction lists.
   */
  transactionGrouping?: 'category' | 'merchant' | 'date' | 'account';
}

/**
 * Preferred channels for receiving notifications.
 */
export interface UserPreferencesNotificationChannels {
  email?: unknown;

  inApp?: unknown;

  push?: unknown;

  sms?: unknown;
}

export interface PreferenceUpdateParams {
  /**
   * How the user prefers to interact with AI (proactive advice, balanced, or only on
   * demand).
   */
  aiInteractionMode?: 'proactive' | 'balanced' | 'on_demand';

  /**
   * Consent status for sharing anonymized data for AI improvement and personalized
   * offers.
   */
  dataSharingConsent?: unknown;

  /**
   * Preferred channels for receiving notifications.
   */
  notificationChannels?: UserPreferencesNotificationChannels;

  /**
   * Preferred language for the user interface.
   */
  preferredLanguage?: unknown;

  /**
   * Preferred UI theme (e.g., Light-Default, Dark-Quantum).
   */
  theme?: unknown;

  /**
   * Default grouping preference for transaction lists.
   */
  transactionGrouping?: 'category' | 'merchant' | 'date' | 'account';
}

export declare namespace Preferences {
  export {
    type UserPreferences as UserPreferences,
    type UserPreferencesNotificationChannels as UserPreferencesNotificationChannels,
    type PreferenceUpdateParams as PreferenceUpdateParams,
  };
}
