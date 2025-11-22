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

export interface UserPreferences {
  /**
   * How actively the AI should provide advice and suggestions.
   */
  aiInteractionMode?: 'passive' | 'balanced' | 'proactive';

  /**
   * Consent for sharing anonymized data for AI improvements.
   */
  dataSharingConsent?: boolean;

  /**
   * Enabled notification channels.
   */
  notificationChannels?: UserPreferences.NotificationChannels;

  /**
   * User's preferred language for the interface.
   */
  preferredLanguage?: string;

  /**
   * User's selected UI theme.
   */
  theme?: 'Light-Default' | 'Dark-Quantum' | 'Eco-Green' | 'Minimalist';

  /**
   * Default grouping preference for transaction lists.
   */
  transactionGrouping?: 'category' | 'merchant' | 'date' | 'account';
}

export namespace UserPreferences {
  /**
   * Enabled notification channels.
   */
  export interface NotificationChannels {
    /**
     * Receive notifications via email.
     */
    email?: boolean;

    /**
     * Receive notifications within the application.
     */
    inApp?: boolean;

    /**
     * Receive push notifications to connected devices.
     */
    push?: boolean;

    /**
     * Receive notifications via SMS.
     */
    sms?: boolean;
  }
}

export interface PreferenceUpdateParams {
  /**
   * How actively the AI should provide advice and suggestions.
   */
  aiInteractionMode?: 'passive' | 'balanced' | 'proactive';

  /**
   * Consent for sharing anonymized data for AI improvements.
   */
  dataSharingConsent?: boolean;

  /**
   * Enabled notification channels.
   */
  notificationChannels?: PreferenceUpdateParams.NotificationChannels;

  /**
   * User's preferred language for the interface.
   */
  preferredLanguage?: string;

  /**
   * User's selected UI theme.
   */
  theme?: 'Light-Default' | 'Dark-Quantum' | 'Eco-Green' | 'Minimalist';

  /**
   * Default grouping preference for transaction lists.
   */
  transactionGrouping?: 'category' | 'merchant' | 'date' | 'account';
}

export namespace PreferenceUpdateParams {
  /**
   * Enabled notification channels.
   */
  export interface NotificationChannels {
    /**
     * Receive notifications via email.
     */
    email?: boolean;

    /**
     * Receive notifications within the application.
     */
    inApp?: boolean;

    /**
     * Receive push notifications to connected devices.
     */
    push?: boolean;

    /**
     * Receive notifications via SMS.
     */
    sms?: boolean;
  }
}

export declare namespace Preferences {
  export { type UserPreferences as UserPreferences, type PreferenceUpdateParams as PreferenceUpdateParams };
}
