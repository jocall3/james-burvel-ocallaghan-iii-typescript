import { useState, useEffect } from 'react';

/**
 * @description A custom React hook to centralize the state management and local
 * persistence logic for user preferences. It initializes preferences from
 * `localStorage` and persists them back whenever they are updated, ensuring
 * application-wide consistency and decoupling preference management from UI components.
 *
 * @returns {Object} An object containing the current preference values and setter functions.
 * @property {string} theme - The current selected theme ('dark', 'light', 'system').
 * @property {React.Dispatch<React.SetStateAction<string>>} setTheme - Setter for the theme preference.
 * @property {string} language - The current selected language ('en', 'es', 'fr', 'de').
 * @property {React.Dispatch<React.SetStateAction<string>>} setLanguage - Setter for the language preference.
 * @property {boolean} notificationsEnabled - Whether notifications are enabled.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setNotificationsEnabled - Setter for notifications preference.
 * @property {boolean} denseLayout - Whether a dense layout is enabled.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setDenseLayout - Setter for dense layout preference.
 * @property {boolean} animationEffects - Whether animation effects are enabled.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setAnimationEffects - Setter for animation effects preference.
 * @property {string} fontSize - The current selected font size ('small', 'medium', 'large').
 * @property {React.Dispatch<React.SetStateAction<string>>} setFontSize - Setter for font size preference.
 */
const usePreferences = () => {
    // Initialize state with values from localStorage or sensible defaults
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

    // Persist preferences to localStorage whenever they change
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

    return {
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
};

export default usePreferences;