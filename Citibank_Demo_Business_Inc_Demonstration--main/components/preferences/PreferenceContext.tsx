/**
 * This module implements the core user preference management system for the Money20/20 platform.
 * Business value: This system centralizes and persists user-specific settings, enabling a highly
 * personalized and consistent user experience across the application. It supports critical features
 * like theme selection, language localization, notification settings, and vital security preferences
 * such as session timeouts and biometric authentication enablement. By ensuring user preferences
 * are seamlessly loaded and saved, it significantly enhances user satisfaction, drives feature adoption,
 * and reduces operational support costs associated with user interface inconsistencies. This robust
 * preference engine is foundational for building a sticky, intuitive, and secure financial application,
 * directly contributing to higher user retention and unlocking new levels of personalization for
 * enterprise clients.
 */

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

/**
 * Defines the structure of the user preference data and update functions
 * available through the PreferenceContext. This interface includes settings for
 * UI customization, notification control, and essential security features
 * like session management and authentication preferences, reflecting a commercial-grade
 * application's need for user control and secure operations.
 */
interface PreferenceContextType {
    theme: string;
    setTheme: (theme: string) => void;
    language: string;
    setLanguage: (language: string) => void;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void;
    denseLayout: boolean;
    setDenseLayout: (dense: boolean) => void;
    animationEffects: boolean;
    setAnimationEffects: (animated: boolean) => void;
    fontSize: string;
    setFontSize: (size: string) => void;
    sessionTimeoutMinutes: number;
    setSessionTimeoutMinutes: (minutes: number) => void;
    currencyDisplay: 'symbol' | 'code' | 'name';
    setCurrencyDisplay: (display: 'symbol' | 'code' | 'name') => void;
    transactionAlertsEnabled: boolean;
    setTransactionAlertsEnabled: (enabled: boolean) => void;
    biometricAuthEnabled: boolean;
    setBiometricAuthEnabled: (enabled: boolean) => void;
    developerModeEnabled: boolean;
    setDeveloperModeEnabled: (enabled: boolean) => void;
    dataSharingConsent: boolean;
    setDataSharingConsent: (consent: boolean) => void;
    securityPolicy: 'strict' | 'moderate' | 'relaxed';
    setSecurityPolicy: (policy: 'strict' | 'moderate' | 'relaxed') => void;
    lastLoginTimestamp: number | null; // Unix timestamp for tracking last login time for security and UX
    setLastLoginTimestamp: (timestamp: number | null) => void;
}

/**
 * Default preferences for a new user or when `localStorage` is empty.
 * This object ensures a consistent baseline user experience and defines
 * fallback values for all configurable settings, including critical security
 * and operational parameters.
 */
export const DEFAULT_PREFERENCES = {
    theme: 'dark',
    language: 'en',
    notificationsEnabled: true,
    denseLayout: false,
    animationEffects: true,
    fontSize: 'medium',
    sessionTimeoutMinutes: 30, // Default to 30 minutes for security
    currencyDisplay: 'symbol' as const, // 'symbol', 'code', 'name'
    transactionAlertsEnabled: true,
    biometricAuthEnabled: false, // Opt-in for security features
    developerModeEnabled: false,
    dataSharingConsent: false, // Opt-out for privacy by default
    securityPolicy: 'moderate' as const, // 'strict', 'moderate', 'relaxed'
    lastLoginTimestamp: null,
};

/**
 * The key used to store all user preferences in `localStorage`.
 * Centralizing this key prevents inconsistencies and simplifies persistence logic.
 */
export const LOCAL_STORAGE_KEY = 'money2020_user_preferences';

/**
 * Attempts to load user preferences from `localStorage`.
 * This function handles potential parsing errors and merges stored preferences
 * with default values to ensure a complete and valid preference set,
 * robustly managing data integrity for user settings.
 *
 * @returns {typeof DEFAULT_PREFERENCES} The loaded or default preferences.
 */
export const loadPreferencesFromLocalStorage = (): typeof DEFAULT_PREFERENCES => {
    try {
        const storedPrefs = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedPrefs) {
            const parsedPrefs = JSON.parse(storedPrefs);
            // Merge with defaults to ensure all fields are present and handle schema evolution
            return { ...DEFAULT_PREFERENCES, ...parsedPrefs };
        }
    } catch (error) {
        console.error('Failed to parse preferences from localStorage:', error);
        // Fallback to default preferences in case of corrupted data, ensuring system stability.
    }
    return DEFAULT_PREFERENCES;
};

/**
 * Saves the current set of user preferences to `localStorage`.
 * This operation is critical for maintaining user-specific configurations
 * across sessions, ensuring a persistent and personalized application state.
 * It includes basic error handling for `localStorage` operations.
 *
 * @param {typeof DEFAULT_PREFERENCES} preferences - The preferences object to save.
 */
export const savePreferencesToLocalStorage = (preferences: typeof DEFAULT_PREFERENCES) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(preferences));
        // Simulate an audit log entry for preference changes for governance and observability.
        // In a production environment, this would integrate with a secure, tamper-evident audit logging system.
        console.log(`[AUDIT] User preferences updated: ${JSON.stringify(preferences)}`);
    } catch (error) {
        // Log errors, especially if localStorage quota is exceeded or other storage issues occur.
        console.error('Failed to save preferences to localStorage:', error);
        // Implement user-facing feedback or system-level alerts in a commercial application.
    }
};

// Create the context with an undefined default value, which will be handled by the usePreferences hook.
const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

interface PreferenceProviderProps {
    /** The React children to be rendered within the provider's scope. */
    children: ReactNode;
}

/**
 * A React Context Provider component that manages application-wide user preferences.
 * This provider initializes all user settings from a persistent local store (`localStorage`)
 * or sensible default values, and then automatically persists any changes back.
 *
 * This component is central to delivering a personalized, secure, and user-friendly
 * experience, enabling features critical for a commercial financial platform,
 * such as customizable UI, robust security settings (e.g., session timeout, biometric auth),
 * and compliance-related preferences (e.g., data sharing consent).
 * It ensures that user choices are respected across sessions, significantly enhancing
 * user engagement and trust, which are key drivers for enterprise adoption and value.
 *
 * @param {PreferenceProviderProps} props - The props for the PreferenceProvider.
 * @returns {React.FC} The PreferenceProvider component.
 */
const PreferenceProvider: React.FC<PreferenceProviderProps> = ({ children }) => {
    // Initialize all preferences by loading from localStorage or using defaults.
    // This provides a single source of truth for all user-configurable settings.
    const [preferences, setPreferences] = useState(loadPreferencesFromLocalStorage());

    // Effect to persist preferences whenever the `preferences` state object changes.
    // This consolidated approach ensures atomic updates to localStorage and simplifies
    // the persistence logic compared to individual `useEffect` hooks for each preference,
    // enhancing performance and data consistency.
    useEffect(() => {
        savePreferencesToLocalStorage(preferences);
    }, [preferences]); // Dependency array includes the entire preferences object

    // Helper function to create setters for individual preferences dynamically.
    // This pattern reduces boilerplate and ensures consistent logging and state update logic
    // across all preference types, supporting governance and observability.
    const createPreferenceSetter = useCallback(<K extends keyof typeof DEFAULT_PREFERENCES>(
        key: K,
        valueOrUpdater: (typeof DEFAULT_PREFERENCES)[K] | ((prev: (typeof DEFAULT_PREFERENCES)[K]) => (typeof DEFAULT_PREFERENCES)[K])
    ) => {
        setPreferences(prevPrefs => {
            const newValue = typeof valueOrUpdater === 'function'
                ? (valueOrUpdater as (prev: (typeof DEFAULT_PREFERENCES)[K]) => (typeof DEFAULT_PREFERENCES)[K])(prevPrefs[key])
                : valueOrUpdater;

            // Simulate detailed logging for specific preference changes, crucial for audit trails and analytics.
            if (prevPrefs[key] !== newValue) {
                console.log(`[LOG] Preference '${key}' changed from '${JSON.stringify(prevPrefs[key])}' to '${JSON.stringify(newValue)}'`);
                // In a real system, this log would be sent to a robust metrics/logging infrastructure.
            }
            return {
                ...prevPrefs,
                [key]: newValue
            };
        });
    }, []); // No dependencies needed for useCallback as `setPreferences` is stable

    // Destructure preferences for easier access within components.
    const {
        theme, language, notificationsEnabled, denseLayout, animationEffects, fontSize,
        sessionTimeoutMinutes, currencyDisplay, transactionAlertsEnabled, biometricAuthEnabled,
        developerModeEnabled, dataSharingConsent, securityPolicy, lastLoginTimestamp
    } = preferences;

    // Define individual setters using the generic helper for consistency and maintainability.
    const setTheme = useCallback((value: string) => createPreferenceSetter('theme', value), [createPreferenceSetter]);
    const setLanguage = useCallback((value: string) => createPreferenceSetter('language', value), [createPreferenceSetter]);
    const setNotificationsEnabled = useCallback((value: boolean) => createPreferenceSetter('notificationsEnabled', value), [createPreferenceSetter]);
    const setDenseLayout = useCallback((value: boolean) => createPreferenceSetter('denseLayout', value), [createPreferenceSetter]);
    const setAnimationEffects = useCallback((value: boolean) => createPreferenceSetter('animationEffects', value), [createPreferenceSetter]);
    const setFontSize = useCallback((value: string) => createPreferenceSetter('fontSize', value), [createPreferenceSetter]);
    const setSessionTimeoutMinutes = useCallback((value: number) => createPreferenceSetter('sessionTimeoutMinutes', value), [createPreferenceSetter]);
    const setCurrencyDisplay = useCallback((value: 'symbol' | 'code' | 'name') => createPreferenceSetter('currencyDisplay', value), [createPreferenceSetter]);
    const setTransactionAlertsEnabled = useCallback((value: boolean) => createPreferenceSetter('transactionAlertsEnabled', value), [createPreferenceSetter]);
    const setBiometricAuthEnabled = useCallback((value: boolean) => createPreferenceSetter('biometricAuthEnabled', value), [createPreferenceSetter]);
    const setDeveloperModeEnabled = useCallback((value: boolean) => createPreferenceSetter('developerModeEnabled', value), [createPreferenceSetter]);
    const setDataSharingConsent = useCallback((value: boolean) => createPreferenceSetter('dataSharingConsent', value), [createPreferenceSetter]);
    const setSecurityPolicy = useCallback((value: 'strict' | 'moderate' | 'relaxed') => createPreferenceSetter('securityPolicy', value), [createPreferenceSetter]);
    const setLastLoginTimestamp = useCallback((value: number | null) => createPreferenceSetter('lastLoginTimestamp', value), [createPreferenceSetter]);


    /**
     * The value object to be provided to consumers of the context.
     * This object aggregates all current preference states and their respective
     * update functions, providing a single, consistent interface for
     * accessing and modifying user settings throughout the application.
     */
    const contextValue: PreferenceContextType = {
        theme, setTheme,
        language, setLanguage,
        notificationsEnabled, setNotificationsEnabled,
        denseLayout, setDenseLayout,
        animationEffects, setAnimationEffects,
        fontSize, setFontSize,
        sessionTimeoutMinutes, setSessionTimeoutMinutes,
        currencyDisplay, setCurrencyDisplay,
        transactionAlertsEnabled, setTransactionAlertsEnabled,
        biometricAuthEnabled, setBiometricAuthEnabled,
        developerModeEnabled, setDeveloperModeEnabled,
        dataSharingConsent, setDataSharingConsent,
        securityPolicy, setSecurityPolicy,
        lastLoginTimestamp, setLastLoginTimestamp,
    };

    return (
        <PreferenceContext.Provider value={contextValue}>
            {children}
        </PreferenceContext.Provider>
    );
};

/**
 * Custom hook to access user preferences and their setters from the PreferenceContext.
 * It ensures that the hook is used within a `PreferenceProvider`, throwing an error otherwise.
 * This hook simplifies consumption of the context, providing direct access to the
 * preference states and update functions, fostering clean and maintainable component logic.
 *
 * @returns {PreferenceContextType} An object containing all user preferences and their corresponding setter functions.
 * @throws {Error} If `usePreferences` is not used within a `PreferenceProvider`.
 */
const usePreferences = (): PreferenceContextType => {
    const context = React.useContext(PreferenceContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferenceProvider');
    }
    return context;
};

// Export the provider and hook for consumption throughout the application,
// along with the preference type for broader type safety and development clarity.
export { PreferenceProvider, usePreferences };
export type { PreferenceContextType };