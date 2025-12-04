export interface UserPreferences {
    /**
     * @description The selected application theme, e.g., 'dark', 'light', 'system'.
     */
    theme: string;
    /**
     * @description The selected application language, e.g., 'en', 'es', 'fr'.
     */
    language: string;
    /**
     * @description A boolean indicating whether notifications are enabled.
     */
    notificationsEnabled: boolean;
    /**
     * @description A boolean indicating whether a dense layout is preferred.
     */
    denseLayout: boolean;
    /**
     * @description A boolean indicating whether animation effects are enabled.
     */
    animationEffects: boolean;
    /**
     * @description The selected font size, e.g., 'small', 'medium', 'large'.
     */
    fontSize: string;
}

/**
 * @description Represents the keys for all available user preferences.
 */
export type PreferenceKey = keyof UserPreferences;