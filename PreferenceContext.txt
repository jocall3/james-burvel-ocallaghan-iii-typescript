import React, { createContext, useState, useEffect, ReactNode } from 'react';

/**
 * @description Defines the structure of the user preference data and update functions
 * available through the PreferenceContext.
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
}

// Create the context with an undefined default value, which will be handled by the usePreferences hook.
const PreferenceContext = createContext<PreferenceContextType | undefined>(undefined);

interface PreferenceProviderProps {
    /** The React children to be rendered within the provider's scope. */
    children: ReactNode;
}

/**
 * @description A React Context Provider component that manages application-wide
 * user preferences. It initializes preferences from `localStorage` or default values,
 * persists changes back to `localStorage`, and provides these preferences and
 * their setter functions to any component within its scope.
 *
 * This provider should ideally wrap the root of your application or a significant
 * part of it to ensure global access to preferences.
 *
 * @param {PreferenceProviderProps} props - The props for the PreferenceProvider.
 * @returns {React.FC} The PreferenceProvider component.
 */
const PreferenceProvider: React.FC<PreferenceProviderProps> = ({ children }) => {
    // Initialize state with values from localStorage or sensible defaults, mirroring UserPreferenceManager
    const [theme, setTheme] = useState<string>(
        localStorage.getItem('userTheme') || 'dark'
    );
    const [language, setLanguage] = useState<string>(
        localStorage.getItem('userLanguage') || 'en'
    );
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
        JSON.parse(localStorage.getItem('notificationsEnabled') || 'true')
    );
    const [denseLayout, setDenseLayout] = useState<boolean>(
        JSON.parse(localStorage.getItem('denseLayout') || 'false')
    );
    const [animationEffects, setAnimationEffects] = useState<boolean>(
        JSON.parse(localStorage.getItem('animationEffects') || 'true')
    );
    const [fontSize, setFontSize] = useState<string>(
        localStorage.getItem('fontSize') || 'medium'
    );

    // Persist preferences to localStorage whenever they change, mirroring UserPreferenceManager
    useEffect(() => {
        localStorage.setItem('userTheme', theme);
        // In a full application, this would trigger a global theme change
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('userLanguage', language);
        // This would ideally trigger i18n changes globally
    }, [language]);

    useEffect(() => {
        localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    }, [notificationsEnabled]);

    useEffect(() => {
        localStorage.setItem('denseLayout', JSON.stringify(denseLayout));
    }, [denseLayout]);

    useEffect(() => {
        localStorage.setItem('animationEffects', JSON.stringify(animationEffects));
    }, [animationEffects]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    // The value object to be provided to consumers of the context
    const contextValue: PreferenceContextType = {
        theme,
        setTheme,
        language,
        setLanguage,
        notificationsEnabled,
        setNotificationsEnabled,
        denseLayout,
        setDenseLayout,
        animationEffects,
        setAnimationEffects,
        fontSize,
        setFontSize,
    };

    return (
        <PreferenceContext.Provider value={contextValue}>
            {children}
        </PreferenceContext.Provider>
    );
};

/**
 * @description Custom hook to access user preferences and their setters from the PreferenceContext.
 * It ensures that the hook is used within a `PreferenceProvider`, throwing an error otherwise.
 * This hook simplifies consumption of the context, providing direct access to the preference states and update functions.
 * @returns {PreferenceContextType} An object containing all user preferences and their corresponding setter functions.
 */
const usePreferences = (): PreferenceContextType => {
    const context = React.useContext(PreferenceContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferenceProvider');
    }
    return context;
};

export { PreferenceProvider, usePreferences };