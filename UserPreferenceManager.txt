import React, { useState, useEffect } from 'react';

/**
 * @description Provides a centralized interface for users to configure and manage
 * their application-wide display and behavior preferences. This component allows
 * for customization of various settings such as theme, language, notification
 * settings, layout density, and animation effects, persisting them locally
 * using `localStorage`.
 *
 * It retrieves initial preferences from `localStorage` and updates them
 * whenever a user changes a setting, ensuring a consistent experience across
 * sessions.
 *
 * @returns {React.FC} The UserPreferenceManager component.
 */
const UserPreferenceManager: React.FC = () => {
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

    const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTheme(event.target.value);
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(event.target.value);
    };

    const handleNotificationsToggle = () => {
        setNotificationsEnabled(prev => !prev);
    };

    const handleDenseLayoutToggle = () => {
        setDenseLayout(prev => !prev);
    };

    const handleAnimationEffectsToggle = () => {
        setAnimationEffects(prev => !prev);
    };

    const handleFontSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFontSize(event.target.value);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 max-w-4xl mx-auto my-8">
            <h2 className="text-3xl font-bold text-white mb-6">User Preferences</h2>

            {/* Display Settings */}
            <section className="mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
                <h3 className="text-2xl font-semibold text-cyan-400 mb-4">Display</h3>
                
                <div className="mb-4 flex items-center justify-between">
                    <label htmlFor="theme-select" className="text-gray-300 text-lg">Theme:</label>
                    <select
                        id="theme-select"
                        value={theme}
                        onChange={handleThemeChange}
                        className="bg-gray-600 border border-gray-500 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                    >
                        <option value="dark">Dark</option>
                        <option value="light">Light (Future)</option>
                        <option value="system">System (Future)</option>
                    </select>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <label htmlFor="font-size-select" className="text-gray-300 text-lg">Font Size:</label>
                    <select
                        id="font-size-select"
                        value={fontSize}
                        onChange={handleFontSizeChange}
                        className="bg-gray-600 border border-gray-500 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-300 text-lg">Dense Layout:</span>
                    <label htmlFor="dense-layout-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="dense-layout-toggle"
                            className="sr-only peer"
                            checked={denseLayout}
                            onChange={handleDenseLayoutToggle}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-lg">Animation Effects:</span>
                    <label htmlFor="animation-effects-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="animation-effects-toggle"
                            className="sr-only peer"
                            checked={animationEffects}
                            onChange={handleAnimationEffectsToggle}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
            </section>

            {/* Language & Region */}
            <section className="mb-8 p-6 bg-gray-700 rounded-lg border border-gray-600">
                <h3 className="text-2xl font-semibold text-cyan-400 mb-4">Language & Region</h3>
                <div className="flex items-center justify-between">
                    <label htmlFor="language-select" className="text-gray-300 text-lg">Language:</label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-gray-600 border border-gray-500 text-white rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>
            </section>

            {/* Notification Settings */}
            <section className="p-6 bg-gray-700 rounded-lg border border-gray-600">
                <h3 className="text-2xl font-semibold text-cyan-400 mb-4">Notifications</h3>
                <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-lg">Enable Notifications:</span>
                    <label htmlFor="notifications-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            id="notifications-toggle"
                            className="sr-only peer"
                            checked={notificationsEnabled}
                            onChange={handleNotificationsToggle}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-cyan-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                </div>
            </section>
        </div>
    );
};

export default UserPreferenceManager;