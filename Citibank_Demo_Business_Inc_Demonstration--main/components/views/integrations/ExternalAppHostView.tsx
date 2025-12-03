import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View } from '../../types'; // Assuming View enum is defined here
import FeatureGuard from '../FeatureGuard';

// --- START: New Type Definitions & Interfaces for Extended Functionality ---

/**
 * @typedef {string} AppId A unique identifier for an external application.
 */
export type AppId = string;

/**
 * @typedef {string} MessageId A unique identifier for a message or request in the communication channel.
 */
export type MessageId = string;

/**
 * @enum {string} AppCommunicationMessageType Defines the types of messages exchanged between host and app.
 */
export enum AppCommunicationMessageType {
    // Host to App
    INIT = 'HOST_INIT',
    UPDATE_CONFIG = 'HOST_UPDATE_CONFIG',
    UPDATE_THEME = 'HOST_UPDATE_THEME',
    UPDATE_USER_CONTEXT = 'HOST_UPDATE_USER_CONTEXT',
    REQUEST_APP_STATE = 'HOST_REQUEST_APP_STATE',
    CALL_APP_METHOD = 'HOST_CALL_APP_METHOD',
    HEARTBEAT_REQUEST = 'HOST_HEARTBEAT_REQUEST',

    // App to Host
    READY = 'APP_READY',
    NAVIGATE = 'APP_NAVIGATE',
    REPORT_ERROR = 'APP_REPORT_ERROR',
    REPORT_EVENT = 'APP_REPORT_EVENT',
    REQUEST_HOST_API = 'APP_REQUEST_HOST_API',
    SEND_APP_STATE = 'APP_SEND_APP_STATE',
    HEARTBEAT_RESPONSE = 'APP_HEARTBEAT_RESPONSE',
    UI_ACTION = 'APP_UI_ACTION', // e.g., show modal, notification
    DATA_REQUEST = 'APP_DATA_REQUEST', // Requesting data from host
    DATA_RESPONSE = 'APP_DATA_RESPONSE', // Responding to host data request
    INITIALIZED = 'APP_INITIALIZED', // App has finished its initial setup
}

/**
 * @interface AppMessageBase Represents the base structure for any message exchanged.
 * @property {MessageId} id Unique identifier for the message, useful for tracking request-response cycles.
 * @property {AppCommunicationMessageType} type The specific type of the message.
 * @property {number} timestamp Unix timestamp when the message was created.
 */
export interface AppMessageBase {
    id: MessageId;
    type: AppCommunicationMessageType;
    timestamp: number;
}

/**
 * @interface HostInitMessage Message sent from host to app upon initial load or re-initialization.
 * @extends AppMessageBase
 * @property {string} hostOrigin The origin of the host application.
 * @property {AppId} appId The ID of the external application.
 * @property {any} initialPayload Any initial data payload for the app.
 * @property {HostTheme} theme Current host theme settings.
 * @property {UserInfo} userContext Current user context (ID, permissions, etc.).
 * @property {AppConfiguration} appConfig Specific configuration for this app instance.
 */
export interface HostInitMessage extends AppMessageBase {
    type: AppCommunicationMessageType.INIT;
    hostOrigin: string;
    appId: AppId;
    initialPayload?: any;
    theme: HostTheme;
    userContext: UserInfo;
    appConfig: AppConfiguration;
    hostCapabilities: string[]; // List of capabilities/APIs exposed by the host
}

/**
 * @interface HostUpdateConfigMessage Message to update the app's configuration.
 * @extends AppMessageBase
 * @property {AppConfiguration} config The new configuration object.
 */
export interface HostUpdateConfigMessage extends AppMessageBase {
    type: AppCommunicationMessageType.UPDATE_CONFIG;
    config: AppConfiguration;
}

/**
 * @interface HostUpdateThemeMessage Message to update the app's theme.
 * @extends AppMessageBase
 * @property {HostTheme} theme The new theme object.
 */
export interface HostUpdateThemeMessage extends AppMessageBase {
    type: AppCommunicationMessageType.UPDATE_THEME;
    theme: HostTheme;
}

/**
 * @interface HostUpdateUserContextMessage Message to update the app's user context.
 * @extends AppMessageBase
 * @property {UserInfo} userContext The new user context object.
 */
export interface HostUpdateUserContextMessage extends AppMessageBase {
    type: AppCommunicationMessageType.UPDATE_USER_CONTEXT;
    userContext: UserInfo;
}

/**
 * @interface HostRequestAppStateMessage Message to request the current state of the app.
 * @extends AppMessageBase
 */
export interface HostRequestAppStateMessage extends AppMessageBase {
    type: AppCommunicationMessageType.REQUEST_APP_STATE;
}

/**
 * @interface HostCallAppMethodMessage Message to call a specific method within the external app.
 * @extends AppMessageBase
 * @property {string} methodName The name of the method to call.
 * @property {any[]} args Arguments to pass to the method.
 */
export interface HostCallAppMethodMessage extends AppMessageBase {
    type: AppCommunicationMessageType.CALL_APP_METHOD;
    methodName: string;
    args: any[];
}

/**
 * @interface HostHeartbeatRequest Message for the host to request a heartbeat response.
 * @extends AppMessageBase
 */
export interface HostHeartbeatRequest extends AppMessageBase {
    type: AppCommunicationMessageType.HEARTBEAT_REQUEST;
    payload: string; // e.g., a timestamp or random string to echo back
}

/**
 * @interface AppReadyMessage Message from app to host indicating it's ready for initialization.
 * @extends AppMessageBase
 * @property {string} appName The name of the app for display purposes.
 * @property {string} appVersion The version of the app.
 * @property {string[]} appCapabilities List of capabilities/APIs the app exposes or requires.
 */
export interface AppReadyMessage extends AppMessageBase {
    type: AppCommunicationMessageType.READY;
    appName: string;
    appVersion: string;
    appCapabilities: string[];
}

/**
 * @interface AppInitializedMessage Message from app to host indicating it has completed initial setup.
 * @extends AppMessageBase
 * @property {any} initialData Any data the app wants to send back after initialization.
 */
export interface AppInitializedMessage extends AppMessageBase {
    type: AppCommunicationMessageType.INITIALIZED;
    initialData?: any;
}

/**
 * @interface AppNavigateMessage Message from app to host requesting navigation within the host.
 * @extends AppMessageBase
 * @property {string} path The path to navigate to.
 * @property {boolean} newTab Whether to open in a new tab.
 * @property {any} state Optional state to pass to the navigated route.
 */
export interface AppNavigateMessage extends AppMessageBase {
    type: AppCommunicationMessageType.NAVIGATE;
    path: string;
    newTab?: boolean;
    state?: any;
}

/**
 * @interface AppReportErrorMessage Message from app to host reporting an error.
 * @extends AppMessageBase
 * @property {string} code An error code.
 * @property {string} message A human-readable error message.
 * @property {any} details Optional detailed error object (e.g., stack trace).
 * @property {string} severity 'info' | 'warn' | 'error' | 'critical'.
 */
export interface AppReportErrorMessage extends AppMessageBase {
    type: AppCommunicationMessageType.REPORT_ERROR;
    code: string;
    message: string;
    details?: any;
    severity: 'info' | 'warn' | 'error' | 'critical';
}

/**
 * @interface AppReportEventMessage Message from app to host reporting an analytics or telemetry event.
 * @extends AppMessageBase
 * @property {string} eventName The name of the event.
 * @property {any} properties Optional properties associated with the event.
 */
export interface AppReportEventMessage extends AppMessageBase {
    type: AppCommunicationMessageType.REPORT_EVENT;
    eventName: string;
    properties?: any;
}

/**
 * @interface AppRequestHostAPIMessage Message from app to host requesting to call a host API method.
 * @extends AppMessageBase
 * @property {string} apiMethod The name of the host API method to call.
 * @property {any[]} args Arguments to pass to the host API method.
 * @property {MessageId} responseId Optional ID for the host to use when sending a response.
 */
export interface AppRequestHostAPIMessage extends AppMessageBase {
    type: AppCommunicationMessageType.REQUEST_HOST_API;
    apiMethod: string;
    args: any[];
    responseId?: MessageId;
}

/**
 * @interface AppSendAppStateMessage Message from app to host sending its current state.
 * @extends AppMessageBase
 * @property {any} state The current state object of the app.
 */
export interface AppSendAppStateMessage extends AppMessageBase {
    type: AppCommunicationMessageType.SEND_APP_STATE;
    state: any;
}

/**
 * @interface AppHeartbeatResponse Message from app to host responding to a heartbeat request.
 * @extends AppMessageBase
 * @property {string} payload The payload echoed back from the heartbeat request.
 */
export interface AppHeartbeatResponse extends AppMessageBase {
    type: AppCommunicationMessageType.HEARTBEAT_RESPONSE;
    payload: string;
}

/**
 * @interface AppUIActionMessage Message from app to host requesting a host UI action (e.g., show modal).
 * @extends AppMessageBase
 * @property {string} actionType The type of UI action (e.g., 'showModal', 'showNotification').
 * @property {any} params Parameters for the UI action.
 * @property {MessageId} responseId Optional ID for host to use when sending response (e.g., modal close).
 */
export interface AppUIActionMessage extends AppMessageBase {
    type: AppCommunicationMessageType.UI_ACTION;
    actionType: string;
    params: any;
    responseId?: MessageId;
}

/**
 * @interface AppDataRequestMessage Message from app to host requesting data from the host's backend.
 * @extends AppMessageBase
 * @property {string} endpointIdentifier A string identifying the type of data or endpoint.
 * @property {any} params Parameters for the data request.
 * @property {MessageId} responseId Required ID for the host to use when sending data response.
 */
export interface AppDataRequestMessage extends AppMessageBase {
    type: AppCommunicationMessageType.DATA_REQUEST;
    endpointIdentifier: string;
    params?: any;
    responseId: MessageId;
}

/**
 * @interface HostDataResponseMessage Message from host to app providing requested data.
 * @extends AppMessageBase
 * @property {MessageId} requestId The ID of the original `AppDataRequestMessage`.
 * @property {any} data The data payload.
 * @property {boolean} success Whether the data request was successful.
 * @property {string} [error] Error message if the request failed.
 */
export interface HostDataResponseMessage extends AppMessageBase {
    type: AppCommunicationMessageType.DATA_RESPONSE;
    requestId: MessageId;
    data?: any;
    success: boolean;
    error?: string;
}

/**
 * @type AppMessage Union type for all possible messages from the app.
 */
export type AppMessage =
    | AppReadyMessage
    | AppInitializedMessage
    | AppNavigateMessage
    | AppReportErrorMessage
    | AppReportEventMessage
    | AppRequestHostAPIMessage
    | AppSendAppStateMessage
    | AppHeartbeatResponse
    | AppUIActionMessage
    | AppDataRequestMessage;

/**
 * @type HostMessage Union type for all possible messages from the host.
 */
export type HostMessage =
    | HostInitMessage
    | HostUpdateConfigMessage
    | HostUpdateThemeMessage
    | HostUpdateUserContextMessage
    | HostRequestAppStateMessage
    | HostCallAppMethodMessage
    | HostHeartbeatRequest
    | HostDataResponseMessage;

/**
 * @interface HostTheme Defines the theming properties that can be passed to the external app.
 */
export interface HostTheme {
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    fontFamily: string;
    darkMode: boolean;
    // Add more granular CSS variables or theme object properties
    button: {
        primaryBg: string;
        primaryText: string;
        secondaryBg: string;
        secondaryText: string;
    };
    typography: {
        h1: { fontSize: string; fontWeight: string; color: string };
        body: { fontSize: string; lineHeight: string; color: string };
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    // Example: Custom theme variables as a map
    customCssVariables: Record<string, string>;
}

/**
 * @interface UserInfo Defines the user context information passed to the external app.
 */
export interface UserInfo {
    userId: string;
    userName: string;
    email: string;
    tenantId: string;
    roles: string[];
    permissions: string[];
    language: string;
    timeZone: string;
    authToken?: string; // Token for the external app to authenticate with its own backend
    profilePictureUrl?: string;
}

/**
 * @interface AppConfiguration Defines dynamic configuration settings for a specific external app.
 */
export interface AppConfiguration {
    apiBaseUrl?: string;
    featureFlags?: Record<string, boolean>;
    settings?: Record<string, any>;
    // More complex configuration objects
    dataSources?: Array<{ id: string; type: string; endpoint: string; authRequired: boolean }>;
    integrations?: Array<{ name: string; enabled: boolean; config: Record<string, any> }>;
}

/**
 * @interface RequestTrackerEntry Tracks pending requests from the host to the app or vice-versa.
 */
interface RequestTrackerEntry {
    message: AppMessageBase | HostMessage;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout;
    sentAt: number;
}

/**
 * @interface HostAPIDefinition Defines the contract for Host API methods callable by external apps.
 */
export interface HostAPIDefinition {
    /**
     * Shows a notification message to the user in the host UI.
     * @param {string} message The notification message.
     * @param {'success' | 'info' | 'warn' | 'error'} type The type of notification.
     * @param {number} [duration=5000] How long the notification should be displayed in milliseconds.
     * @returns {Promise<boolean>} Resolves to true if notification was shown, false otherwise.
     */
    showNotification(message: string, type: 'success' | 'info' | 'warn' | 'error', duration?: number): Promise<boolean>;

    /**
     * Opens a modal dialog in the host UI.
     * @param {string} title The title of the modal.
     * @param {any} content A serializable content object to display in the modal (e.g., component name and props).
     * @param {object} [options] Modal options (e.g., width, height, dismissable).
     * @returns {Promise<any>} Resolves with data when the modal is closed, or rejects if dismissed without data.
     */
    openModal(title: string, content: any, options?: { width?: string; height?: string; dismissable?: boolean; buttons?: Array<{ label: string; value: string; variant?: string }> }): Promise<any>;

    /**
     * Requests data from the host's backend services. This acts as a proxy.
     * @param {string} endpointIdentifier Identifies the data endpoint or type.
     * @param {any} params Query parameters or body for the request.
     * @returns {Promise<any>} The requested data.
     */
    fetchHostData(endpointIdentifier: string, params?: any): Promise<any>;

    /**
     * Retrieves current user information from the host.
     * @returns {Promise<UserInfo>} Current user details.
     */
    getUserInfo(): Promise<UserInfo>;

    /**
     * Logs an event or metric to the host's telemetry system.
     * @param {string} eventName The name of the event.
     * @param {any} [properties] Additional properties for the event.
     * @returns {Promise<boolean>} True if logged successfully.
     */
    logTelemetry(eventName: string, properties?: any): Promise<boolean>;

    /**
     * Navigates the host application to a different internal route.
     * @param {string} path The target path.
     * @param {boolean} [newTab=false] Whether to open in a new browser tab.
     * @returns {Promise<void>}
     */
    navigateHost(path: string, newTab?: boolean): Promise<void>;

    /**
     * Updates a specific configuration setting for the external app on the host side.
     * This might trigger a `HOST_UPDATE_CONFIG` message back to the app if the host deems it necessary.
     * @param {string} key The configuration key.
     * @param {any} value The new value for the configuration.
     * @returns {Promise<boolean>} True if updated successfully.
     */
    updateAppSetting(key: string, value: any): Promise<boolean>;

    /**
     * Provides access to the host's theme data.
     * @returns {Promise<HostTheme>} The current host theme.
     */
    getTheme(): Promise<HostTheme>;

    /**
     * Initiates a file download from the host.
     * @param {string} fileUrl The URL of the file to download.
     * @param {string} [filename] Optional filename hint for the browser.
     * @returns {Promise<boolean>} True if the download was initiated.
     */
    downloadFile(fileUrl: string, filename?: string): Promise<boolean>;

    /**
     * Uploads a file to the host's storage, typically opening a file dialog.
     * This is a complex interaction and might involve host UI.
     * @param {object} [options] Options for the file upload, e.g., accepted file types.
     * @returns {Promise<Array<{fileName: string, url: string}>>} Resolves with details of uploaded files.
     */
    uploadFile(options?: { accept?: string; multiple?: boolean; maxSizeKb?: number }): Promise<Array<{ fileName: string; url: string; mimeType: string }>>;

    /**
     * Triggers a specific action on the host. This can be used for generic extensibility.
     * @param {string} actionName The name of the action to trigger.
     * @param {any} [payload] Optional payload for the action.
     * @returns {Promise<any>} Result of the action.
     */
    triggerHostAction(actionName: string, payload?: any): Promise<any>;

    /**
     * Registers a callback function on the host that can be invoked by host events.
     * This allows external apps to subscribe to host-level events.
     * @param {string} eventName The name of the host event to subscribe to.
     * @param {string} callbackId A unique ID for the callback, used by the host to identify the handler.
     * @returns {Promise<boolean>} True if subscription was successful.
     */
    subscribeToHostEvent(eventName: string, callbackId: string): Promise<boolean>;

    /**
     * Unregisters a previously registered callback.
     * @param {string} eventName The name of the host event.
     * @param {string} callbackId The unique ID of the callback to unsubscribe.
     * @returns {Promise<boolean>} True if unsubscribe was successful.
     */
    unsubscribeFromHostEvent(eventName: string, callbackId: string): Promise<boolean>;

    /**
     * Fetches current environment variables from the host.
     * @returns {Promise<Record<string, string>>} Environment variables.
     */
    getEnvironmentVariables(): Promise<Record<string, string>>;
}

/**
 * @interface ExternalAppAPIDefinition Defines the contract for External App API methods callable by the host.
 */
export interface ExternalAppAPIDefinition {
    /**
     * Triggers a specific action within the external application.
     * @param {string} actionName The name of the action to trigger.
     * @param {any} [payload] Optional payload for the action.
     * @returns {Promise<any>} Result of the action.
     */
    triggerAction(actionName: string, payload?: any): Promise<any>;

    /**
     * Requests the current state of the external application.
     * @returns {Promise<any>} The current state object.
     */
    getState(): Promise<any>;

    /**
     * Sets specific configuration settings within the external application.
     * @param {Record<string, any>} settings Key-value pairs of settings to update.
     * @returns {Promise<boolean>} True if settings were updated.
     */
    setSettings(settings: Record<string, any>): Promise<boolean>;

    /**
     * Instructs the external app to refresh its internal data.
     * @param {boolean} [force=false] If true, forces a full refresh ignoring cache.
     * @returns {Promise<boolean>} True if refresh was initiated.
     */
    refreshData(force?: boolean): Promise<boolean>;

    /**
     * Retrieves specific data points or resources from the external app.
     * @param {string} resourcePath A path or identifier for the resource.
     * @param {any} [params] Optional parameters for resource retrieval.
     * @returns {Promise<any>} The requested resource data.
     */
    getResource(resourcePath: string, params?: any): Promise<any>;
}

/**
 * @interface GlobalTelemetryEvent Defines a standardized structure for telemetry events.
 */
export interface GlobalTelemetryEvent {
    id: string;
    timestamp: number;
    eventName: string;
    source: 'host' | 'app' | string;
    appId?: AppId;
    userId?: string;
    severity?: 'info' | 'warn' | 'error' | 'critical';
    properties: Record<string, any>;
}

// --- END: New Type Definitions & Interfaces ---

// --- START: Utility Functions ---

/**
 * Generates a Universal Unique Identifier (UUID v4).
 * @returns {string} A new UUID string.
 */
export const uuidv4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Debounces a function call.
 * @param {Function} func The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {Function} The debounced function.
 */
export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    }) as T;
};

/**
 * Throttles a function call.
 * @param {Function} func The function to throttle.
 * @param {number} limit The throttle limit in milliseconds.
 * @returns {Function} The throttled function.
 */
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    let lastResult: any;
    return ((...args: Parameters<T>): any => {
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
            lastResult = func(...args);
        }
        return lastResult;
    }) as T;
};

/**
 * Safely parses a JSON string, returning null on error.
 * @param {string} jsonString The JSON string to parse.
 * @returns {any | null} The parsed object or null if parsing fails.
 */
export const safeJsonParse = (jsonString: string): any | null => {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn('Failed to parse JSON string:', e);
        return null;
    }
};

/**
 * Safely stringifies an object to JSON, returning null on error.
 * @param {any} obj The object to stringify.
 * @returns {string | null} The JSON string or null if stringification fails.
 */
export const safeJsonStringify = (obj: any): string | null => {
    try {
        return JSON.stringify(obj);
    } catch (e) {
        console.warn('Failed to stringify object to JSON:', e);
        return null;
    }
};

/**
 * Extracts the origin from a URL.
 * @param {string} url The URL.
 * @returns {string} The origin (e.g., 'https://example.com').
 */
export const getOriginFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        return urlObj.origin;
    } catch (e) {
        console.error('Invalid URL provided:', url, e);
        return '';
    }
};

/**
 * Validates if an object conforms to a basic message structure (has 'id' and 'type').
 * @param {any} obj The object to validate.
 * @returns {boolean} True if it looks like a message.
 */
export const isAppMessageBase = (obj: any): obj is AppMessageBase => {
    return typeof obj === 'object' && obj !== null && typeof obj.id === 'string' && typeof obj.type === 'string';
};

/**
 * Provides a default host theme.
 * @returns {HostTheme} A default theme object.
 */
export const getDefaultHostTheme = (): HostTheme => ({
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    textColor: '#333333',
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto, sans-serif',
    darkMode: false,
    button: {
        primaryBg: '#007bff',
        primaryText: '#ffffff',
        secondaryBg: '#6c757d',
        secondaryText: '#ffffff',
    },
    typography: {
        h1: { fontSize: '2em', fontWeight: 'bold', color: '#333333' },
        body: { fontSize: '1em', lineHeight: '1.5', color: '#333333' },
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
    customCssVariables: {
        '--host-border-radius': '8px',
        '--host-shadow-elevation-1': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    }
});

/**
 * Provides a default user information object.
 * @returns {UserInfo} A default user info object.
 */
export const getDefaultUserInfo = (): UserInfo => ({
    userId: 'guest-user-123',
    userName: 'Guest User',
    email: 'guest@example.com',
    tenantId: 'default-tenant',
    roles: ['guest'],
    permissions: [],
    language: 'en-US',
    timeZone: 'America/New_York',
});

/**
 * Provides a default application configuration.
 * @returns {AppConfiguration} A default app configuration object.
 */
export const getDefaultAppConfiguration = (): AppConfiguration => ({
    apiBaseUrl: '/api/proxy/external-app',
    featureFlags: {
        betaFeaturesEnabled: false,
        darkModeToggle: true,
    },
    settings: {
        defaultDashboard: 'overview',
        refreshIntervalMinutes: 5,
    },
    dataSources: [
        { id: 'metrics', type: 'REST', endpoint: '/data/metrics', authRequired: true },
        { id: 'logs', type: 'WebSocket', endpoint: 'ws://localhost:8080/data/logs', authRequired: true },
    ],
    integrations: [],
});

// --- END: Utility Functions ---

// --- START: Global State & Service Definitions ---

/**
 * @class AppTelemetryService
 * @description Manages collection and reporting of telemetry events and performance metrics.
 * This would typically integrate with an external analytics/logging platform.
 */
export class AppTelemetryService {
    private static instance: AppTelemetryService;
    private logBuffer: GlobalTelemetryEvent[] = [];
    private isSending: boolean = false;
    private batchInterval: number = 5000; // ms
    private maxBatchSize: number = 50;

    private constructor() {
        if (typeof window !== 'undefined') { // Only start interval in browser environment
            setInterval(() => this.sendBatch(), this.batchInterval);
        }
    }

    public static getInstance(): AppTelemetryService {
        if (!AppTelemetryService.instance) {
            AppTelemetryService.instance = new AppTelemetryService();
        }
        return AppTelemetryService.instance;
    }

    /**
     * Records a telemetry event.
     * @param {GlobalTelemetryEvent} event The event object.
     */
    public recordEvent(event: GlobalTelemetryEvent): void {
        this.logBuffer.push(event);
        if (this.logBuffer.length >= this.maxBatchSize) {
            this.sendBatch();
        }
    }

    /**
     * Reports an error event.
     * @param {string} code Error code.
     * @param {string} message Error message.
     * @param {any} details Error details.
     * @param {'info' | 'warn' | 'error' | 'critical'} severity Error severity.
     * @param {AppId} [appId] Optional application ID.
     */
    public reportError(code: string, message: string, details: any, severity: 'info' | 'warn' | 'error' | 'critical', appId?: AppId): void {
        this.recordEvent({
            id: uuidv4(),
            timestamp: Date.now(),
            eventName: `error.${code}`,
            source: appId ? `app:${appId}` : 'host',
            appId: appId,
            userId: getDefaultUserInfo().userId, // Placeholder
            severity: severity,
            properties: { message, details, code },
        });
        if (severity === 'critical') {
            console.error(`CRITICAL ERROR [${appId || 'Host'}]: ${message}`, details);
        } else if (severity === 'error') {
            console.error(`ERROR [${appId || 'Host'}]: ${message}`, details);
        } else if (severity === 'warn') {
            console.warn(`WARNING [${appId || 'Host'}]: ${message}`, details);
        }
    }

    /**
     * Records a performance metric.
     * @param {string} metricName Name of the metric.
     * @param {number} value Value of the metric.
     * @param {AppId} [appId] Optional application ID.
     * @param {Record<string, any>} [properties] Additional properties.
     */
    public recordPerformanceMetric(metricName: string, value: number, appId?: AppId, properties?: Record<string, any>): void {
        this.recordEvent({
            id: uuidv4(),
            timestamp: Date.now(),
            eventName: `perf.${metricName}`,
            source: appId ? `app:${appId}` : 'host',
            appId: appId,
            userId: getDefaultUserInfo().userId, // Placeholder
            severity: 'info',
            properties: { value, ...properties },
        });
    }

    private async sendBatch(): Promise<void> {
        if (this.logBuffer.length === 0 || this.isSending) {
            return;
        }

        this.isSending = true;
        const batchToSend = [...this.logBuffer];
        this.logBuffer = []; // Clear buffer immediately

        // In a real application, this would send to an API endpoint
        // e.g., fetch('/api/telemetry', { method: 'POST', body: JSON.stringify(batchToSend) })
        try {
            // Simulate network request
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
            console.debug(`TelemetryService: Sent ${batchToSend.length} events.`);
            // console.debug(batchToSend); // For debugging purposes
        } catch (error) {
            console.error('TelemetryService: Failed to send batch:', error);
            // Re-add to buffer if sending failed (with retry logic in real app)
            this.logBuffer.unshift(...batchToSend);
        } finally {
            this.isSending = false;
        }
    }
}

export const telemetryService = AppTelemetryService.getInstance();

/**
 * @class HostAPIManager
 * @description Implements the HostAPIDefinition and routes requests from the external app to host functions.
 */
export class HostAPIManager implements HostAPIDefinition {
    private static instance: HostAPIManager;
    private hostFunctions: Map<string, Function> = new Map();
    private eventSubscribers: Map<string, Map<string, Function>> = new Map(); // eventName -> callbackId -> callbackFn

    private constructor() {
        this.registerHostFunction('showNotification', this.showNotification);
        this.registerHostFunction('openModal', this.openModal);
        this.registerHostFunction('fetchHostData', this.fetchHostData);
        this.registerHostFunction('getUserInfo', this.getUserInfo);
        this.registerHostFunction('logTelemetry', this.logTelemetry);
        this.registerHostFunction('navigateHost', this.navigateHost);
        this.registerHostFunction('updateAppSetting', this.updateAppSetting);
        this.registerHostFunction('getTheme', this.getTheme);
        this.registerHostFunction('downloadFile', this.downloadFile);
        this.registerHostFunction('uploadFile', this.uploadFile);
        this.registerHostFunction('triggerHostAction', this.triggerHostAction);
        this.registerHostFunction('subscribeToHostEvent', this.subscribeToHostEvent);
        this.registerHostFunction('unsubscribeFromHostEvent', this.unsubscribeFromHostEvent);
        this.registerHostFunction('getEnvironmentVariables', this.getEnvironmentVariables);
    }

    public static getInstance(): HostAPIManager {
        if (!HostAPIManager.instance) {
            HostAPIManager.instance = new HostAPIManager();
        }
        return HostAPIManager.instance;
    }

    /**
     * Registers a host function that can be called by external apps.
     * @param {string} methodName The name of the method.
     * @param {Function} func The actual function implementation.
     */
    public registerHostFunction(methodName: string, func: Function): void {
        if (this.hostFunctions.has(methodName)) {
            console.warn(`HostAPIManager: Method '${methodName}' already registered. Overwriting.`);
        }
        this.hostFunctions.set(methodName, func);
    }

    /**
     * Executes a host API method. This is the entry point for `AppRequestHostAPIMessage`.
     * @param {string} methodName The name of the method to execute.
     * @param {any[]} args Arguments for the method.
     * @returns {Promise<any>} The result of the method call.
     */
    public async executeHostAPI(methodName: string, args: any[]): Promise<any> {
        const func = this.hostFunctions.get(methodName);
        if (!func) {
            throw new Error(`HostAPIManager: Method '${methodName}' not found.`);
        }
        try {
            // Using `bind(this)` to ensure methods have correct `this` context if they are class methods
            return await func.bind(this)(...args);
        } catch (error) {
            telemetryService.reportError('HOST_API_EXEC_FAILED', `Failed to execute host API method '${methodName}'`, error, 'error');
            throw error;
        }
    }

    // --- HostAPIDefinition Implementations ---
    public async showNotification(message: string, type: 'success' | 'info' | 'warn' | 'error', duration: number = 5000): Promise<boolean> {
        console.log(`HOST_NOTIFICATION [${type.toUpperCase()}]: ${message} (Duration: ${duration}ms)`);
        // In a real app, this would dispatch to a global notification system (e.g., Redux, Context, EventEmitter)
        // Example: NotificationService.show(message, type, duration);
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.notification.shown',
            source: 'host', properties: { message, type, duration }
        });
        return true;
    }

    public async openModal(title: string, content: any, options?: { width?: string; height?: string; dismissable?: boolean; buttons?: Array<{ label: string; value: string; variant?: string }> }): Promise<any> {
        console.log(`HOST_MODAL: Opening modal with title "${title}", content:`, content, 'Options:', options);
        // This would interact with a global modal management system.
        // For simulation, we'll just resolve after a timeout or with a default value.
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`HOST_MODAL: Modal "${title}" closed.`);
                telemetryService.recordEvent({
                    id: uuidv4(), timestamp: Date.now(), eventName: 'host.modal.closed',
                    source: 'host', properties: { title, content, options, result: 'simulated_closed' }
                });
                resolve({ action: 'simulated_closed', value: null });
            }, 3000); // Simulate a 3-second modal interaction
        });
    }

    public async fetchHostData(endpointIdentifier: string, params?: any): Promise<any> {
        console.log(`HOST_DATA_REQUEST: Fetching data for '${endpointIdentifier}' with params:`, params);
        // This would call a host-specific data fetching service or API proxy.
        // Example: await fetch(`/api/host-data/${endpointIdentifier}`, { method: 'POST', body: JSON.stringify(params) }).then(res => res.json());
        try {
            const simulatedData = {
                'users': [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }],
                'products': [{ id: 'A', name: 'Product A' }, { id: 'B', name: 'Product B' }],
                'settings': { theme: 'dark', language: 'en' },
            };
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000)); // Simulate network latency
            const data = (simulatedData as any)[endpointIdentifier] || null;
            if (data) {
                telemetryService.recordEvent({
                    id: uuidv4(), timestamp: Date.now(), eventName: 'host.data.fetched',
                    source: 'host', properties: { endpointIdentifier, params, success: true }
                });
                return data;
            } else {
                throw new Error(`Data for endpoint '${endpointIdentifier}' not found.`);
            }
        } catch (error: any) {
            telemetryService.reportError('HOST_DATA_FETCH_FAILED', `Failed to fetch data for '${endpointIdentifier}'`, error, 'error');
            throw error;
        }
    }

    public async getUserInfo(): Promise<UserInfo> {
        console.log('HOST_GET_USER_INFO: Providing user information.');
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.user.info_retrieved',
            source: 'host', properties: {}
        });
        return getDefaultUserInfo(); // In a real app, this comes from an auth context.
    }

    public async logTelemetry(eventName: string, properties?: any): Promise<boolean> {
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: `app.via_host.${eventName}`,
            source: 'app', properties: properties
        });
        console.debug(`HOST_TELEMETRY: App logged event '${eventName}' with properties:`, properties);
        return true;
    }

    public async navigateHost(path: string, newTab: boolean = false): Promise<void> {
        console.log(`HOST_NAVIGATION: Navigating to ${path}${newTab ? ' in new tab' : ''}`);
        // In a real app, this would use a router (e.g., react-router-dom history object).
        if (newTab) {
            window.open(path, '_blank');
        } else {
            // window.location.href = path; // Or router.push(path)
            console.warn(`HOST_NAVIGATION: In a real app, host would navigate to '${path}'.`);
        }
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.navigation.triggered',
            source: 'host', properties: { path, newTab }
        });
    }

    public async updateAppSetting(key: string, value: any): Promise<boolean> {
        console.log(`HOST_UPDATE_APP_SETTING: Attempting to update app setting '${key}' to`, value);
        // This would typically involve persistence and then potentially sending an UPDATE_CONFIG message.
        // For simulation, assume success.
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.app_setting.updated',
            source: 'host', properties: { key, value }
        });
        return true;
    }

    public async getTheme(): Promise<HostTheme> {
        console.log('HOST_GET_THEME: Providing host theme information.');
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.theme.retrieved',
            source: 'host', properties: {}
        });
        return getDefaultHostTheme(); // In a real app, this comes from a theme context.
    }

    public async downloadFile(fileUrl: string, filename?: string): Promise<boolean> {
        console.log(`HOST_DOWNLOAD: Initiating download for ${fileUrl} (filename: ${filename || 'auto'})`);
        // This would typically trigger a server-side download endpoint or directly manipulate browser.
        try {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = filename || '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            telemetryService.recordEvent({
                id: uuidv4(), timestamp: Date.now(), eventName: 'host.file.download_initiated',
                source: 'host', properties: { fileUrl, filename, success: true }
            });
            return true;
        } catch (error) {
            telemetryService.reportError('HOST_DOWNLOAD_FAILED', `Failed to initiate download for ${fileUrl}`, error, 'error');
            return false;
        }
    }

    public async uploadFile(options?: { accept?: string; multiple?: boolean; maxSizeKb?: number }): Promise<Array<{ fileName: string; url: string; mimeType: string }>> {
        console.log('HOST_UPLOAD: Initiating file upload with options:', options);
        // This is highly complex. In a real app, it would open a host-controlled file picker modal,
        // handle upload to host backend, and return URLs.
        // For simulation, we'll return a dummy file.
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate user interaction and upload time.
        const dummyFile = {
            fileName: 'simulated_upload.txt',
            url: `https://example.com/uploads/${uuidv4()}.txt`,
            mimeType: 'text/plain',
        };
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.file.upload_completed',
            source: 'host', properties: { options, uploadedFiles: [dummyFile], success: true }
        });
        return [dummyFile];
    }

    public async triggerHostAction(actionName: string, payload?: any): Promise<any> {
        console.log(`HOST_ACTION: Triggering host action '${actionName}' with payload:`, payload);
        // This is a generic extension point. Host would have a dispatcher for custom actions.
        const mockActions: Record<string, Function> = {
            'reconfigureIntegration': async (p: any) => {
                console.log(`Host reconfiguring integration for: ${p?.integrationId}`);
                return { status: 'reconfigured', integrationId: p?.integrationId };
            },
            'triggerBackendWorkflow': async (p: any) => {
                console.log(`Host triggering backend workflow: ${p?.workflowId}`);
                return { status: 'workflow_started', workflowRunId: uuidv4() };
            },
        };

        const actionFn = mockActions[actionName];
        if (actionFn) {
            const result = await actionFn(payload);
            telemetryService.recordEvent({
                id: uuidv4(), timestamp: Date.now(), eventName: `host.action.${actionName}.executed`,
                source: 'host', properties: { payload, result, success: true }
            });
            return result;
        } else {
            telemetryService.reportError('HOST_UNKNOWN_ACTION', `Unknown host action '${actionName}' requested`, { actionName, payload }, 'warn');
            throw new Error(`Unknown host action: ${actionName}`);
        }
    }

    public async subscribeToHostEvent(eventName: string, callbackId: string): Promise<boolean> {
        console.log(`HOST_EVENT_BUS: App subscribed to host event '${eventName}' with ID '${callbackId}'`);
        if (!this.eventSubscribers.has(eventName)) {
            this.eventSubscribers.set(eventName, new Map());
        }
        this.eventSubscribers.get(eventName)!.set(callbackId, () => { /* placeholder, real callback logic handled by postMessage responses */ });
        // In a real system, you'd send a message back to the app with the event data.
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.event.subscribed',
            source: 'host', properties: { eventName, callbackId }
        });
        return true;
    }

    public async unsubscribeFromHostEvent(eventName: string, callbackId: string): Promise<boolean> {
        console.log(`HOST_EVENT_BUS: App unsubscribed from host event '${eventName}' with ID '${callbackId}'`);
        const subscribers = this.eventSubscribers.get(eventName);
        if (subscribers) {
            subscribers.delete(callbackId);
            if (subscribers.size === 0) {
                this.eventSubscribers.delete(eventName);
            }
        }
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.event.unsubscribed',
            source: 'host', properties: { eventName, callbackId }
        });
        return true;
    }

    public async getEnvironmentVariables(): Promise<Record<string, string>> {
        console.log('HOST_ENV: Providing environment variables.');
        telemetryService.recordEvent({
            id: uuidv4(), timestamp: Date.now(), eventName: 'host.env.retrieved',
            source: 'host', properties: {}
        });
        // In a real app, this would be derived from environment configs, not hardcoded.
        return {
            NODE_ENV: process.env.NODE_ENV || 'development',
            API_URL: process.env.API_URL || 'http://localhost:3000/api',
            APP_VERSION: '1.0.0-beta',
            // ... other safe-to-expose environment variables
        };
    }

    /**
     * Publishes a host event to all subscribed external apps.
     * @param {string} eventName The name of the event to publish.
     * @param {any} payload The event payload.
     * @param {function(HostMessage): void} sendMessageToAppCallback Callback to send messages to the app.
     * @param {string} targetOrigin The expected origin of the app for postMessage security.
     * @param {AppId} appId The ID of the app.
     */
    public publishHostEvent(eventName: string, payload: any, sendMessageToAppCallback: (message: HostMessage) => void, targetOrigin: string, appId: AppId): void {
        const subscribers = this.eventSubscribers.get(eventName);
        if (subscribers && subscribers.size > 0) {
            console.log(`HOST_EVENT_BUS: Publishing event '${eventName}' to ${subscribers.size} subscribers.`);
            subscribers.forEach((_, callbackId) => {
                const message: HostCallAppMethodMessage = {
                    id: uuidv4(),
                    type: AppCommunicationMessageType.CALL_APP_METHOD,
                    timestamp: Date.now(),
                    methodName: `onHostEvent_${callbackId}`, // App expects a method like this
                    args: [eventName, payload],
                };
                sendMessageToAppCallback(message);
            });
            telemetryService.recordEvent({
                id: uuidv4(), timestamp: Date.now(), eventName: `host.event.${eventName}.published`,
                source: 'host', properties: { payload, numSubscribers: subscribers.size }
            });
        }
    }
}

export const hostAPIManager = HostAPIManager.getInstance();

// --- END: Global State & Service Definitions ---


/**
 * @interface ExternalAppHostViewProps
 * @property {AppId} appId Unique identifier for the external application.
 * @property {string} appUrl URL of the external application to embed.
 * @property {string[]} trustedOrigins An array of trusted origins for `postMessage` security.
 * @property {(data: any) => void} [onMessage] Callback for generic messages received from the external app.
 * @property {any} [initialPayload] Data to send to the app immediately after it loads.
 * @property {HostTheme} [hostTheme] Optional current theme of the host application.
 * @property {UserInfo} [userInfo] Optional current user information for the host.
 * @property {AppConfiguration} [appConfiguration] Optional specific configuration for this app instance.
 * @property {number} [heartbeatInterval=15000] Interval in milliseconds for sending heartbeat requests to the app.
 * @property {number} [heartbeatTimeout=5000] Timeout in milliseconds for expecting a heartbeat response.
 * @property {number} [communicationTimeout=10000] Default timeout for request/response communication.
 * @property {boolean} [enableAppLogging=true] Whether to enable logging of app messages to host console/telemetry.
 * @property {string} [sandboxAttributes] Override the default iframe sandbox attributes.
 * @property {string} [allowAttributes] Override the default iframe allow attributes (e.g., 'camera; microphone;').
 */
interface ExternalAppHostViewProps {
    appId: AppId;
    appUrl: string;
    trustedOrigins: string[]; // Crucial for enhanced security
    onMessage?: (data: any) => void;
    initialPayload?: any;
    hostTheme?: HostTheme;
    userInfo?: UserInfo;
    appConfiguration?: AppConfiguration;
    heartbeatInterval?: number;
    heartbeatTimeout?: number;
    communicationTimeout?: number;
    enableAppLogging?: boolean;
    sandboxAttributes?: string;
    allowAttributes?: string;
}

/**
 * @description This view component is designed to securely render and orchestrate
 * interactions with dynamically loaded third-party applications. It leverages
 * an iframe with strict sandbox attributes to ensure isolated execution, protecting
 * the main platform from potential vulnerabilities in external content.
 * Communication between the host application and the embedded external application
 * is facilitated via the `postMessage` API, allowing for a controlled and secure
 * exchange of data and events.
 *
 * This component provides a flexible and robust framework for integrating diverse
 * external servicesâ€”such as specialized analytics dashboards, partner portals,
 * or advanced visualization toolsâ€”directly into the main platform, while
 * upholding security standards and maintaining a cohesive user experience.
 *
 * It features:
 * - Enhanced `postMessage` security with origin validation.
 * - Structured message protocol for various interaction types.
 * - Request/response mechanism with timeout and error handling.
 * - Host API exposure to external apps.
 * - External App API client for host to interact with the app.
 * - Lifecycle management including app readiness and heartbeat monitoring.
 * - Theming and user context propagation.
 * - Telemetry and error reporting.
 * - Dynamic configuration updates.
 */
const ExternalAppHostView: React.FC<ExternalAppHostViewProps> = ({
    appId,
    appUrl,
    trustedOrigins, // New: Explicit trusted origins for security
    onMessage,
    initialPayload,
    hostTheme = getDefaultHostTheme(),
    userInfo = getDefaultUserInfo(),
    appConfiguration = getDefaultAppConfiguration(),
    heartbeatInterval = 15000,
    heartbeatTimeout = 5000,
    communicationTimeout = 10000,
    enableAppLogging = true,
    sandboxAttributes = "allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-pointer-lock allow-presentation allow-downloads allow-top-navigation-by-user-activation",
    allowAttributes = "", // Default to empty
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAppReady, setIsAppReady] = useState(false);
    const [isAppInitialized, setIsAppInitialized] = useState(false);
    const [isAppResponsive, setIsAppResponsive] = useState(true); // Tracks heartbeat
    const [appTitle, setAppTitle] = useState(`External Application: ${appId}`);
    const [appVersion, setAppVersion] = useState('N/A');
    const [appCapabilities, setAppCapabilities] = useState<string[]>([]);
    const [appInternalState, setAppInternalState] = useState<any>(null); // State reported by the app

    // Map to track pending request-response messages
    const pendingRequests = useRef<Map<MessageId, RequestTrackerEntry>>(new Map());
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
    const appCommunicationOrigin = getOriginFromUrl(appUrl);

    // Assume View.ExternalAppHost exists in the View enum for feature guarding.
    const currentView = View.ExternalAppHost;

    /**
     * @description Validates if an incoming message event originates from a trusted source.
     * @param {MessageEvent} event The message event.
     * @returns {boolean} True if the origin is trusted.
     */
    const validateOrigin = useCallback((event: MessageEvent): boolean => {
        if (!trustedOrigins.includes(event.origin) && event.origin !== appCommunicationOrigin) {
            console.warn(`SECURITY ALERT: Message received from untrusted origin: ${event.origin}. Expected: ${appCommunicationOrigin} or one of ${trustedOrigins.join(', ')}`);
            telemetryService.reportError('UNTRUSTED_ORIGIN', 'Message from untrusted origin', { origin: event.origin, expected: trustedOrigins, appOrigin: appCommunicationOrigin }, 'critical', appId);
            return false;
        }
        if (event.source !== iframeRef.current?.contentWindow) {
            console.warn(`SECURITY ALERT: Message received from correct origin (${event.origin}) but unexpected source (not the iframe's contentWindow).`);
            telemetryService.reportError('UNEXPECTED_MESSAGE_SOURCE', 'Message from correct origin but wrong source', { origin: event.origin, appOrigin: appCommunicationOrigin }, 'error', appId);
            return false;
        }
        return true;
    }, [appId, appCommunicationOrigin, trustedOrigins]);

    /**
     * @description Sends a message to the embedded external application via postMessage.
     * It's crucial to specify the targetOrigin for security.
     * @param {HostMessage} message - The data payload to send.
     * @param {string} [targetOrigin] - Override the default target origin.
     */
    const sendMessageToApp = useCallback((message: HostMessage, targetOrigin: string = appCommunicationOrigin): void => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(message, targetOrigin);
            if (enableAppLogging) {
                console.log(`Host -> App (${appId}):`, message.type, message.id, message);
            }
            telemetryService.recordEvent({
                id: uuidv4(), timestamp: Date.now(), eventName: 'host.message.sent',
                source: 'host', appId: appId, properties: { messageType: message.type, messageId: message.id }
            });
        } else {
            console.warn(`Attempted to send message to app '${appId}' before iframe was ready. Message type: ${message.type}`);
            telemetryService.reportError('APP_COMM_NOT_READY', `Message '${message.type}' sent before iframe ready`, { appId, message }, 'warn');
        }
    }, [appId, appCommunicationOrigin, enableAppLogging]);

    /**
     * @description Sends a request message to the external app and waits for a response.
     * @param {HostMessage} requestMessage The message to send.
     * @param {number} [timeoutDuration] Timeout in milliseconds for this specific request.
     * @returns {Promise<any>} Resolves with the response data, rejects on timeout or error.
     */
    const sendRequestToApp = useCallback((requestMessage: HostMessage, timeoutDuration: number = communicationTimeout): Promise<any> => {
        return new Promise((resolve, reject) => {
            if (!isAppReady && requestMessage.type !== AppCommunicationMessageType.INIT) {
                reject(new Error(`App '${appId}' is not ready to receive requests.`));
                return;
            }

            const timeout = setTimeout(() => {
                pendingRequests.current.delete(requestMessage.id);
                telemetryService.reportError('APP_REQUEST_TIMEOUT', `Request to app '${appId}' timed out. Message ID: ${requestMessage.id}, Type: ${requestMessage.type}`, { requestMessage }, 'error');
                reject(new Error(`Request to app '${appId}' (ID: ${requestMessage.id}) timed out after ${timeoutDuration}ms.`));
            }, timeoutDuration);

            pendingRequests.current.set(requestMessage.id, {
                message: requestMessage,
                resolve,
                reject,
                timeout,
                sentAt: Date.now(),
            });

            sendMessageToApp(requestMessage);
        });
    }, [appId, communicationTimeout, isAppReady, sendMessageToApp]);

    /**
     * @description Processes a response from the external app, resolving/rejecting pending requests.
     * @param {MessageId} requestId The ID of the original request.
     * @param {boolean} success Whether the response indicates success.
     * @param {any} data The data payload of the response.
     * @param {string} [error] Optional error message.
     */
    const handleAppResponse = useCallback((requestId: MessageId, success: boolean, data: any, error?: string) => {
        const pendingRequest = pendingRequests.current.get(requestId);
        if (pendingRequest) {
            clearTimeout(pendingRequest.timeout);
            pendingRequests.current.delete(requestId);

            const duration = Date.now() - pendingRequest.sentAt;
            telemetryService.recordPerformanceMetric('app.response.latency', duration, appId, {
                messageType: pendingRequest.message.type,
                requestId,
                success,
            });

            if (success) {
                pendingRequest.resolve(data);
            } else {
                pendingRequest.reject(new Error(error || `App '${appId}' responded with an error for request ${requestId}.`));
            }
        } else {
            console.warn(`Host received response for unknown or already handled request ID: ${requestId} from app '${appId}'.`);
            telemetryService.reportError('UNKNOWN_APP_RESPONSE', 'Received response for unknown request ID', { appId, requestId, data, error }, 'warn');
        }
    }, [appId]);

    /**
     * @description ExternalAppAPIDefinition client for the host to call methods within the app.
     */
    const externalAppAPIClient: ExternalAppAPIDefinition = useRef({
        triggerAction: async (actionName: string, payload?: any) => {
            const request: HostCallAppMethodMessage = {
                id: uuidv4(),
                type: AppCommunicationMessageType.CALL_APP_METHOD,
                timestamp: Date.now(),
                methodName: actionName,
                args: [payload],
            };
            return sendRequestToApp(request);
        },
        getState: async () => {
            const request: HostRequestAppStateMessage = {
                id: uuidv4(),
                type: AppCommunicationMessageType.REQUEST_APP_STATE,
                timestamp: Date.now(),
            };
            return sendRequestToApp(request);
        },
        setSettings: async (settings: Record<string, any>) => {
            const request: HostUpdateConfigMessage = {
                id: uuidv4(),
                type: AppCommunicationMessageType.UPDATE_CONFIG,
                timestamp: Date.now(),
                config: { ...appConfiguration, settings: { ...(appConfiguration.settings || {}), ...settings } },
            };
            return sendRequestToApp(request); // App should confirm config update
        },
        refreshData: async (force?: boolean) => {
            const request: HostCallAppMethodMessage = { // Re-using CALL_APP_METHOD for generic actions
                id: uuidv4(),
                type: AppCommunicationMessageType.CALL_APP_METHOD,
                timestamp: Date.now(),
                methodName: 'refreshData',
                args: [force],
            };
            return sendRequestToApp(request);
        },
        getResource: async (resourcePath: string, params?: any) => {
            const request: HostCallAppMethodMessage = { // Re-using CALL_APP_METHOD for generic resource fetching
                id: uuidv4(),
                type: AppCommunicationMessageType.CALL_APP_METHOD,
                timestamp: Date.now(),
                methodName: 'getResource',
                args: [resourcePath, params],
            };
            return sendRequestToApp(request);
        }
    }).current;
    // Export this client for other components to use
    export const getExternalAppAPIClient = (appId: AppId) => externalAppAPIClient; // Simplified for this file, would be a map in reality


    /**
     * @description Handles messages received from the embedded external application.
     * It performs an origin check for security and routes messages based on their type.
     * @param {MessageEvent} event - The message event object.
     */
    useEffect(() => {
        const handleIframeMessage = async (event: MessageEvent) => {
            if (!validateOrigin(event)) {
                return;
            }

            const message = safeJsonParse(event.data);
            if (!isAppMessageBase(message)) {
                console.warn(`Host received non-standard message from app '${appId}':`, event.data);
                telemetryService.recordEvent({
                    id: uuidv4(), timestamp: Date.now(), eventName: 'app.message.malformed',
                    source: 'app', appId: appId, properties: { rawData: event.data }
                });
                return;
            }

            if (enableAppLogging) {
                console.debug(`App -> Host (${appId}):`, message.type, message.id, message);
            }
            telemetryService.recordEvent({
                id: uuidv4(), timestamp: Date.now(), eventName: 'app.message.received',
                source: 'app', appId: appId, properties: { messageType: message.type, messageId: message.id }
            });

            switch (message.type) {
                case AppCommunicationMessageType.READY: {
                    const readyMessage = message as AppReadyMessage;
                    setIsAppReady(true);
                    setAppTitle(readyMessage.appName || appTitle);
                    setAppVersion(readyMessage.appVersion || 'N/A');
                    setAppCapabilities(readyMessage.appCapabilities || []);
                    console.log(`External app '${appId}' signaled READY.`);
                    // Send initialisation payload to the app now that it's ready.
                    const initMsg: HostInitMessage = {
                        id: uuidv4(),
                        type: AppCommunicationMessageType.INIT,
                        timestamp: Date.now(),
                        hostOrigin: window.location.origin,
                        appId: appId,
                        initialPayload: initialPayload,
                        theme: hostTheme,
                        userContext: userInfo,
                        appConfig: appConfiguration,
                        hostCapabilities: Object.keys(hostAPIManager.hostFunctions),
                    };
                    sendRequestToApp(initMsg).then(() => {
                        console.log(`App '${appId}' successfully initialized with host context.`);
                    }).catch(err => {
                        console.error(`Failed to initialize app '${appId}' with host context:`, err);
                        setError(`Failed to initialize app context: ${err.message}`);
                        telemetryService.reportError('APP_INIT_FAILED', `Failed to initialize app '${appId}' context`, err, 'critical', appId);
                    });
                    break;
                }
                case AppCommunicationMessageType.INITIALIZED: {
                    const initializedMessage = message as AppInitializedMessage;
                    setIsAppInitialized(true);
                    console.log(`External app '${appId}' signaled INITIALIZED. Initial data:`, initializedMessage.initialData);
                    break;
                }
                case AppCommunicationMessageType.REPORT_ERROR: {
                    const errorMsg = message as AppReportErrorMessage;
                    telemetryService.reportError(errorMsg.code, errorMsg.message, errorMsg.details, errorMsg.severity, appId);
                    setError(prev => prev ? prev + `\nApp Error: ${errorMsg.message}` : `App Error: ${errorMsg.message}`);
                    break;
                }
                case AppCommunicationMessageType.REPORT_EVENT: {
                    const eventMsg = message as AppReportEventMessage;
                    telemetryService.recordEvent({
                        id: uuidv4(), timestamp: Date.now(), eventName: `app.${eventMsg.eventName}`,
                        source: 'app', appId: appId, properties: eventMsg.properties
                    });
                    break;
                }
                case AppCommunicationMessageType.REQUEST_HOST_API: {
                    const apiRequest = message as AppRequestHostAPIMessage;
                    try {
                        const result = await hostAPIManager.executeHostAPI(apiRequest.apiMethod, apiRequest.args);
                        const response: HostDataResponseMessage = {
                            id: uuidv4(),
                            type: AppCommunicationMessageType.DATA_RESPONSE,
                            timestamp: Date.now(),
                            requestId: apiRequest.id,
                            success: true,
                            data: result,
                        };
                        sendMessageToApp(response);
                    } catch (err: any) {
                        const response: HostDataResponseMessage = {
                            id: uuidv4(),
                            type: AppCommunicationMessageType.DATA_RESPONSE,
                            timestamp: Date.now(),
                            requestId: apiRequest.id,
                            success: false,
                            error: err.message,
                        };
                        sendMessageToApp(response);
                    }
                    break;
                }
                case AppCommunicationMessageType.SEND_APP_STATE: {
                    const stateMsg = message as AppSendAppStateMessage;
                    setAppInternalState(stateMsg.state);
                    // If this was a response to a HOST_REQUEST_APP_STATE message, resolve it
                    handleAppResponse(stateMsg.id, true, stateMsg.state);
                    break;
                }
                case AppCommunicationMessageType.HEARTBEAT_RESPONSE: {
                    const heartbeatResponse = message as AppHeartbeatResponse;
                    if (pendingRequests.current.has(heartbeatResponse.id)) {
                        handleAppResponse(heartbeatResponse.id, true, heartbeatResponse.payload);
                        setIsAppResponsive(true); // Mark as responsive
                    } else {
                        console.warn(`Received unexpected heartbeat response from app '${appId}' with ID ${heartbeatResponse.id}.`);
                    }
                    break;
                }
                case AppCommunicationMessageType.NAVIGATE: {
                    const navMessage = message as AppNavigateMessage;
                    hostAPIManager.navigateHost(navMessage.path, navMessage.newTab);
                    break;
                }
                case AppCommunicationMessageType.UI_ACTION: {
                    const uiAction = message as AppUIActionMessage;
                    if (uiAction.actionType === 'showModal') {
                        hostAPIManager.openModal(uiAction.params.title, uiAction.params.content, uiAction.params.options)
                            .then(result => {
                                if (uiAction.responseId) {
                                    handleAppResponse(uiAction.responseId, true, result);
                                }
                            })
                            .catch(err => {
                                if (uiAction.responseId) {
                                    handleAppResponse(uiAction.responseId, false, null, err.message);
                                }
                            });
                    } else if (uiAction.actionType === 'showNotification') {
                        hostAPIManager.showNotification(uiAction.params.message, uiAction.params.type, uiAction.params.duration);
                    } else {
                        console.warn(`App '${appId}' requested unknown UI action: ${uiAction.actionType}`);
                        telemetryService.reportError('UNKNOWN_APP_UI_ACTION', `Unknown UI action '${uiAction.actionType}'`, uiAction, 'warn', appId);
                    }
                    break;
                }
                case AppCommunicationMessageType.DATA_REQUEST: {
                    const dataRequest = message as AppDataRequestMessage;
                    try {
                        const data = await hostAPIManager.fetchHostData(dataRequest.endpointIdentifier, dataRequest.params);
                        const response: HostDataResponseMessage = {
                            id: uuidv4(),
                            type: AppCommunicationMessageType.DATA_RESPONSE,
                            timestamp: Date.now(),
                            requestId: dataRequest.id,
                            success: true,
                            data: data,
                        };
                        sendMessageToApp(response);
                    } catch (err: any) {
                        const response: HostDataResponseMessage = {
                            id: uuidv4(),
                            type: AppCommunicationMessageType.DATA_RESPONSE,
                            timestamp: Date.now(),
                            requestId: dataRequest.id,
                            success: false,
                            error: err.message,
                        };
                        sendMessageToApp(response);
                    }
                    break;
                }
                // Handle responses for host-initiated requests
                case AppCommunicationMessageType.DATA_RESPONSE: { // This type can also be used for generic responses
                    const responseMsg = message as HostDataResponseMessage; // Although named HostDataResponseMessage, it's a generic response structure
                    handleAppResponse(responseMsg.requestId, responseMsg.success, responseMsg.data, responseMsg.error);
                    break;
                }
                default: {
                    // For any other messages not specifically handled by our protocol,
                    // we can pass them to the generic `onMessage` prop.
                    console.log(`Host received unhandled message type '${message.type}' from app '${appId}'. Passing to onMessage prop.`);
                    if (onMessage) {
                        onMessage(message);
                    }
                    break;
                }
            }
        };

        window.addEventListener('message', handleIframeMessage);

        return () => {
            window.removeEventListener('message', handleIframeMessage);
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
            }
            // Clean up any pending requests if component unmounts
            pendingRequests.current.forEach(req => clearTimeout(req.timeout));
            pendingRequests.current.clear();
        };
    }, [
        appId,
        onMessage,
        validateOrigin,
        sendMessageToApp,
        sendRequestToApp,
        handleAppResponse,
        initialPayload,
        hostTheme,
        userInfo,
        appConfiguration,
        appTitle, // Dependencies from state/props
        enableAppLogging
    ]);

    /**
     * @description Effect to send heartbeat requests and monitor app responsiveness.
     */
    useEffect(() => {
        if (!isAppReady) {
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
                heartbeatTimerRef.current = null;
            }
            return;
        }

        const startHeartbeat = () => {
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
            }
            heartbeatTimerRef.current = setInterval(async () => {
                const heartbeatPayload = Date.now().toString();
                const heartbeatRequest: HostHeartbeatRequest = {
                    id: uuidv4(),
                    type: AppCommunicationMessageType.HEARTBEAT_REQUEST,
                    timestamp: Date.now(),
                    payload: heartbeatPayload,
                };
                try {
                    const response = await sendRequestToApp(heartbeatRequest, heartbeatTimeout);
                    if (response !== heartbeatPayload) {
                        throw new Error('Mismatched heartbeat payload.');
                    }
                    setIsAppResponsive(true);
                    telemetryService.recordEvent({
                        id: uuidv4(), timestamp: Date.now(), eventName: 'app.heartbeat.success',
                        source: 'host', appId: appId, properties: { responseTime: Date.now() - heartbeatRequest.timestamp }
                    });
                } catch (err) {
                    setIsAppResponsive(false);
                    setError(`App '${appId}' is unresponsive. Heartbeat failed.`);
                    telemetryService.reportError('APP_UNRESPONSIVE', `App '${appId}' is unresponsive via heartbeat`, err, 'error', appId);
                    console.error(`App '${appId}' heartbeat failed:`, err);
                }
            }, heartbeatInterval);
        };

        startHeartbeat();

        return () => {
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
                heartbeatTimerRef.current = null;
            }
        };
    }, [appId, isAppReady, heartbeatInterval, heartbeatTimeout, sendRequestToApp]);

    /**
     * @description Callback for when the iframe content has successfully loaded.
     * Sets loading state to false. Note: this doesn't mean the *app* is ready,
     * only that the iframe document loaded. App readiness is signaled by `APP_READY` message.
     */
    const handleIframeLoad = useCallback(() => {
        setIsLoading(false);
        setError(null); // Clear any previous errors
        console.log(`External iframe for app '${appId}' loaded successfully (document ready).`);
        telemetryService.recordPerformanceMetric('iframe.load.time', performance.now(), appId);
    }, [appId]);

    /**
     * @description Callback for when the iframe encounters an error during loading.
     * Sets loading state to false and displays an error message.
     */
    const handleIframeError = useCallback(() => {
        setIsLoading(false);
        const errMessage = `Failed to load external application from: ${appUrl}. Please check the URL, network, or server configuration (e.g., CORS, CSP).`;
        setError(errMessage);
        telemetryService.reportError('IFRAME_LOAD_ERROR', errMessage, { appId, appUrl }, 'critical', appId);
        console.error(`Error loading external app '${appId}' from ${appUrl}`);
    }, [appId, appUrl]);

    /**
     * @description React to changes in hostTheme and userInfo by sending update messages to the app.
     * Debounced to avoid excessive messages if updates happen rapidly.
     */
    const sendThemeUpdate = useCallback(debounce((theme: HostTheme) => {
        if (isAppReady) {
            const message: HostUpdateThemeMessage = {
                id: uuidv4(),
                type: AppCommunicationMessageType.UPDATE_THEME,
                timestamp: Date.now(),
                theme: theme,
            };
            sendMessageToApp(message);
            console.log(`Sent theme update to app '${appId}'.`);
        }
    }, 500), [appId, isAppReady, sendMessageToApp]);

    const sendUserContextUpdate = useCallback(debounce((user: UserInfo) => {
        if (isAppReady) {
            const message: HostUpdateUserContextMessage = {
                id: uuidv4(),
                type: AppCommunicationMessageType.UPDATE_USER_CONTEXT,
                timestamp: Date.now(),
                userContext: user,
            };
            sendMessageToApp(message);
            console.log(`Sent user context update to app '${appId}'.`);
        }
    }, 500), [appId, isAppReady, sendMessageToApp]);

    const sendAppConfigUpdate = useCallback(debounce((config: AppConfiguration) => {
        if (isAppReady) {
            const message: HostUpdateConfigMessage = {
                id: uuidv4(),
                type: AppCommunicationMessageType.UPDATE_CONFIG,
                timestamp: Date.now(),
                config: config,
            };
            sendMessageToApp(message);
            console.log(`Sent app configuration update to app '${appId}'.`);
        }
    }, 500), [appId, isAppReady, sendMessageToApp]);

    useEffect(() => {
        sendThemeUpdate(hostTheme);
    }, [hostTheme, sendThemeUpdate]);

    useEffect(() => {
        sendUserContextUpdate(userInfo);
    }, [userInfo, sendUserContextUpdate]);

    useEffect(() => {
        sendAppConfigUpdate(appConfiguration);
    }, [appConfiguration, sendAppConfigUpdate]);

    const hostCapabilitiesList = Object.keys(hostAPIManager.hostFunctions);

    // Dynamic styles for the iframe to apply host theme variables
    const iframeStyle: React.CSSProperties = {
        '--host-primary-color': hostTheme.primaryColor,
        '--host-secondary-color': hostTheme.secondaryColor,
        '--host-text-color': hostTheme.textColor,
        '--host-background-color': hostTheme.backgroundColor,
        '--host-font-family': hostTheme.fontFamily,
        '--host-button-primary-bg': hostTheme.button.primaryBg,
        '--host-button-primary-text': hostTheme.button.primaryText,
        '--host-button-secondary-bg': hostTheme.button.secondaryBg,
        '--host-button-secondary-text': hostTheme.button.secondaryText,
        '--host-h1-font-size': hostTheme.typography.h1.fontSize,
        '--host-h1-font-weight': hostTheme.typography.h1.fontWeight,
        '--host-h1-color': hostTheme.typography.h1.color,
        '--host-body-font-size': hostTheme.typography.body.fontSize,
        '--host-body-line-height': hostTheme.typography.body.lineHeight,
        '--host-body-color': hostTheme.typography.body.color,
        '--host-spacing-xs': hostTheme.spacing.xs,
        '--host-spacing-sm': hostTheme.spacing.sm,
        '--host-spacing-md': hostTheme.spacing.md,
        '--host-spacing-lg': hostTheme.spacing.lg,
        '--host-spacing-xl': hostTheme.spacing.xl,
        ...hostTheme.customCssVariables,
    } as React.CSSProperties; // Type assertion needed for custom CSS variables

    /**
     * @description Renders a comprehensive status indicator for the external app.
     * @returns {JSX.Element} The status indicator component.
     */
    const renderAppStatusIndicator = (): JSX.Element => (
        <div className="absolute top-2 right-2 flex items-center space-x-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${isAppResponsive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
            <span className="text-gray-400">
                {isAppResponsive ? 'Responsive' : 'Unresponsive'}
            </span>
            {isAppReady && (
                <span className={`px-2 py-1 rounded-full text-xs ${isAppInitialized ? 'bg-blue-600 text-blue-100' : 'bg-yellow-600 text-yellow-100'}`}>
                    {isAppInitialized ? 'Initialized' : 'Ready (Awaiting Init)'}
                </span>
            )}
            <span className="text-gray-500">v{appVersion}</span>
        </div>
    );

    /**
     * @description Renders the application details and capabilities if the app is ready.
     * @returns {JSX.Element | null} The details panel or null.
     */
    const renderAppDetailsPanel = (): JSX.Element | null => {
        if (!isAppReady || isLoading || error) {
            return null;
        }
        return (
            <div className="bg-gray-700 p-3 rounded-md mt-4 text-gray-300 text-sm">
                <p><strong>App Name:</strong> {appTitle}</p>
                <p><strong>App ID:</strong> {appId}</p>
                <p><strong>Status:</strong> {isAppInitialized ? 'Fully Initialized' : 'Ready (Waiting for Initialization)'}</p>
                <p><strong>App URL:</strong> <a href={appUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{appUrl}</a></p>
                <div className="mt-2">
                    <p className="font-semibold">App Capabilities:</p>
                    <ul className="list-disc list-inside text-xs mt-1">
                        {appCapabilities.length > 0 ? (
                            appCapabilities.map((cap, index) => <li key={index} className="ml-2">{cap}</li>)
                        ) : (
                            <li className="ml-2 italic text-gray-500">No capabilities reported.</li>
                        )}
                    </ul>
                </div>
                <div className="mt-2">
                    <p className="font-semibold">Host API Capabilities Offered:</p>
                    <ul className="list-disc list-inside text-xs mt-1">
                        {hostCapabilitiesList.length > 0 ? (
                            hostCapabilitiesList.map((cap, index) => <li key={index} className="ml-2">{cap}</li>)
                        ) : (
                            <li className="ml-2 italic text-gray-500">No host APIs are registered.</li>
                        )}
                    </ul>
                </div>
                {appInternalState && (
                    <div className="mt-2">
                        <p className="font-semibold">App Internal State (last reported):</p>
                        <pre className="bg-gray-800 p-2 rounded-sm text-xs mt-1 overflow-auto max-h-40">
                            {JSON.stringify(appInternalState, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        );
    };

    /**
     * @description Renders a simulated control panel for host interaction with the app.
     * This panel would contain buttons to trigger `externalAppAPIClient` methods.
     */
    const renderHostControlPanel = (): JSX.Element | null => {
        if (!isAppReady || isLoading || error) {
            return null;
        }

        const handleTriggerAction = async () => {
            try {
                const result = await externalAppAPIClient.triggerAction('doSomething', { value: 'host-initiated-data' });
                hostAPIManager.showNotification(`App action 'doSomething' completed: ${JSON.stringify(result)}`, 'success');
            } catch (e: any) {
                hostAPIManager.showNotification(`App action failed: ${e.message}`, 'error');
            }
        };

        const handleRequestState = async () => {
            try {
                const state = await externalAppAPIClient.getState();
                hostAPIManager.showNotification(`App state received: ${JSON.stringify(state)}`, 'info', 7000);
            } catch (e: any) {
                hostAPIManager.showNotification(`Failed to get app state: ${e.message}`, 'error');
            }
        };

        const handleRefreshData = async () => {
            try {
                await externalAppAPIClient.refreshData(true);
                hostAPIManager.showNotification('App refresh data initiated.', 'success');
            } catch (e: any) {
                hostAPIManager.showNotification(`App refresh failed: ${e.message}`, 'error');
            }
        };

        const handlePublishHostEvent = async () => {
            const eventName = 'hostDataUpdated';
            const eventPayload = { timestamp: Date.now(), data: 'new data available' };
            hostAPIManager.publishHostEvent(eventName, eventPayload, sendMessageToApp, appCommunicationOrigin, appId);
            hostAPIManager.showNotification(`Published host event '${eventName}'.`, 'info');
        };

        return (
            <div className="bg-gray-700 p-3 rounded-md mt-4 text-gray-300">
                <h3 className="font-semibold text-lg mb-2">Host Control Panel</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleTriggerAction}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                    >
                        Trigger App Action
                    </button>
                    <button
                        onClick={handleRequestState}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                    >
                        Request App State
                    </button>
                    <button
                        onClick={handleRefreshData}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                    >
                        Refresh App Data (Force)
                    </button>
                    <button
                        onClick={handlePublishHostEvent}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                    >
                        Publish Host Event
                    </button>
                    <button
                        onClick={() => hostAPIManager.showNotification('Hello from host!', 'info')}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                    >
                        Show Host Notification
                    </button>
                    <button
                        onClick={() => hostAPIManager.openModal('Host Modal', { component: 'WelcomeMessage', props: { message: 'This is a message from the host!' } })}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                    >
                        Open Host Modal
                    </button>
                    <button
                        onClick={() => hostAPIManager.navigateHost('/some-host-route')}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out text-sm"
                    >
                        Navigate Host
                    </button>
                </div>
            </div>
        );
    };

    /**
     * @description Provides a detailed error view for debugging.
     * @param {string} errorMsg The error message.
     * @returns {JSX.Element} The detailed error display.
     */
    const renderDetailedError = (errorMsg: string): JSX.Element => (
        <div className="flex flex-col items-center justify-center flex-1 text-red-400 p-8 rounded-lg bg-gray-900 border border-red-600">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-2xl font-bold mb-3">Integration Error</p>
            <p className="text-base text-center max-w-xl mb-4">{errorMsg}</p>
            <p className="text-sm text-gray-400 mt-2">
                Troubleshooting Steps:
            </p>
            <ul className="list-disc list-inside text-xs text-gray-500 mt-2 text-left">
                <li>Verify the <code>appUrl</code> property points to a valid external application.</li>
                <li>Check browser's console for any network errors (CORS, CSP violations).</li>
                <li>Ensure the external application is running and accessible from the host's domain.</li>
                <li>Confirm the <code>trustedOrigins</code> array includes the external app's origin for <code>postMessage</code> security.</li>
                <li>Review the external application's logs for initialization or communication failures.</li>
                <li>The external application might not be sending the initial `APP_READY` message.</li>
                <li>The external application might not be echoing heartbeat requests, indicating unresponsiveness.</li>
            </ul>
            <div className="bg-gray-800 p-3 rounded-md text-sm mt-6 w-full max-w-xl">
                <p className="font-semibold text-gray-300 mb-2">Current Configuration:</p>
                <pre className="whitespace-pre-wrap break-all text-xs text-gray-400">
                    App ID: {appId}<br />
                    App URL: {appUrl}<br />
                    Expected Origin: {appCommunicationOrigin}<br />
                    Trusted Origins: {trustedOrigins.join(', ') || 'None specified'}<br />
                    App Ready: {isAppReady ? 'Yes' : 'No'}<br />
                    App Initialized: {isAppInitialized ? 'Yes' : 'No'}<br />
                    App Responsive: {isAppResponsive ? 'Yes' : 'No'}<br />
                    Heartbeat Interval: {heartbeatInterval / 1000}s<br />
                    Heartbeat Timeout: {heartbeatTimeout / 1000}s
                </pre>
            </div>
        </div>
    );

    return (
        <FeatureGuard view={currentView}>
            <div className="relative flex flex-col h-full bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-semibold text-gray-200 mb-4">
                    {appTitle}
                </h2>

                {renderAppStatusIndicator()}

                {isLoading && (
                    <div className="flex flex-col items-center justify-center flex-1 text-cyan-400">
                        <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full animate-spin mb-4"></div>
                        <p className="text-lg">Loading {appId}...</p>
                        <p className="text-sm text-gray-400 mt-2">Establishing secure connection and initializing app context.</p>
                    </div>
                )}

                {error && renderDetailedError(error)}

                {!error && (
                    <iframe
                        ref={iframeRef}
                        src={appUrl}
                        title={appTitle}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        className={`flex-1 w-full border-0 rounded-md bg-transparent ${isLoading ? 'hidden' : ''}`}
                        sandbox={sandboxAttributes}
                        allow={allowAttributes}
                        style={iframeStyle}
                    ></iframe>
                )}
                {renderAppDetailsPanel()}
                {renderHostControlPanel()}
            </div>
        </FeatureGuard>
    );
};

export default ExternalAppHostView;