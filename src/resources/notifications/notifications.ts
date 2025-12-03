import { BaseResource } from '../../internal/base';
import {
  Notification,
  PaginatedList,
  NotificationSettings,
  NotificationSettingsUpdateRequest,
  Error,
} from '../../types/api';
import {
  ListUserNotificationsQueryParams,
  MarkNotificationAsReadPathParams,
  GetNotificationSettingsQueryParams,
  UpdateNotificationSettingsQueryParams,
} from '../../types/operations';
import { Http } from '../../internal/http';

/**
 * The Notifications resource class provides access to user notifications,
 * proactive AI alerts, and notification settings, corresponding to the
 * "Notifications & Proactive Alerts" tag in the OpenAPI specification.
 */
export class NotificationsResource extends BaseResource {
  /**
   * Base path for the notifications resource.
   */
  private readonly basePath = 'notifications';

  constructor(http: Http) {
    super(http);
  }

  /**
   * Retrieves a paginated list of personalized notifications and proactive AI alerts
   * for the authenticated user.
   *
   * Corresponds to `GET /notifications/me`.
   *
   * @param query - Query parameters for filtering and pagination (limit, offset, status, severity).
   * @returns A promise that resolves to a paginated list of Notification objects.
   */
  public async listUserNotifications(
    query: ListUserNotificationsQueryParams = {}
  ): Promise<PaginatedList<Notification>> {
    return this.http.get<PaginatedList<Notification>>(`${this.basePath}/me`, {
      query,
    });
  }

  /**
   * Marks a specific user notification as read.
   *
   * Corresponds to `POST /notifications/{notificationId}/mark-read`.
   *
   * @param params - Path parameters containing the unique notification ID.
   * @returns A promise that resolves to the updated Notification object.
   */
  public async markNotificationAsRead(
    params: MarkNotificationAsReadPathParams
  ): Promise<Notification> {
    const { notificationId } = params;
    return this.http.post<Notification>(
      `${this.basePath}/${notificationId}/mark-read`
    );
  }

  /**
   * Retrieves the user's granular notification preferences across different channels
   * and event types.
   *
   * Corresponds to `GET /notifications/settings`.
   *
   * @param query - Optional query parameters (currently unused but included for future compatibility).
   * @returns A promise that resolves to the current NotificationSettings object.
   */
  public async getNotificationSettings(
    query: GetNotificationSettingsQueryParams = {}
  ): Promise<NotificationSettings> {
    return this.http.get<NotificationSettings>(`${this.basePath}/settings`, {
      query,
    });
  }

  /**
   * Updates the user's notification preferences, allowing control over channels,
   * event types, and quiet hours.
   *
   * Corresponds to `PUT /notifications/settings`.
   *
   * @param data - The updated notification settings payload.
   * @param query - Optional query parameters (currently unused).
   * @returns A promise that resolves to the updated NotificationSettings object.
   */
  public async updateNotificationSettings(
    data: NotificationSettingsUpdateRequest,
    query: UpdateNotificationSettingsQueryParams = {}
  ): Promise<NotificationSettings> {
    return this.http.put<NotificationSettings>(`${this.basePath}/settings`, data, {
      query,
    });
  }
}