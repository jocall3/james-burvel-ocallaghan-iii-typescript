import {
  NotificationSettings,
  NotificationSettingsUpdateRequest,
} from '../../models/notifications';
import {BaseResource} from '../base/BaseResource';

/**
 * Manages user notification preferences and settings.
 * Corresponds to the /notifications/settings endpoint.
 */
export class SettingsResource extends BaseResource {
  /**
   * Retrieves the user's granular notification preferences across different channels
   * (email, push, SMS, in-app) and event types.
   *
   * @returns A promise that resolves to the user's current NotificationSettings.
   * @throws {ApiError} If the request fails (e.g., 401 Unauthorized).
   */
  public get(): Promise<NotificationSettings> {
    const path = this.buildPath('/notifications/settings');
    return this.apiClient.request<NotificationSettings>({
      method: 'GET',
      url: path,
    });
  }

  /**
   * Updates the user's notification preferences, allowing control over channels,
   * event types, and quiet hours.
   *
   * @param settingsUpdatePayload The updated notification settings.
   * @returns A promise that resolves to the updated NotificationSettings object.
   * @throws {ApiError} If the request fails (e.g., 400 Bad Request, 401 Unauthorized).
   */
  public update(
    settingsUpdatePayload: NotificationSettingsUpdateRequest,
  ): Promise<NotificationSettings> {
    const path = this.buildPath('/notifications/settings');
    return this.apiClient.request<NotificationSettings>({
      method: 'PUT',
      url: path,
      data: settingsUpdatePayload,
    });
  }
}