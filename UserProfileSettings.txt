import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext, getIcon } from '../components/Sidebar'; // Assuming Sidebar.tsx is in the same parent directory, adjust path if necessary
import { UserProfile, UserStatus, ThemeMode, LanguageCode } from '../types'; // These types are defined in Sidebar.tsx

// Re-exporting for clarity, but they are defined in the seed file itself.
// In a real project, these would likely be in a shared 'types' file.

/**
 * A comprehensive React component for users to view and modify their profile information and application preferences.
 * It integrates with the global application context to fetch and update user data.
 */
const UserProfileSettings: React.FC = () => {
    const {
        user,
        setUser,
        themeMode,
        language,
        setThemeMode,
        setLanguage,
        triggerNotification,
        trackEvent
    } = useAppContext();

    // Local state to manage form inputs
    const [currentName, setCurrentName] = useState<string>(user?.name || '');
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>(user?.avatarUrl || '');
    const [currentStatus, setCurrentStatus] = useState<UserStatus>(user?.status || 'offline');
    const [currentTheme, setCurrentTheme] = useState<ThemeMode>(user?.preferences?.theme || 'system');
    const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(user?.preferences?.language || 'en');
    const [notificationEmail, setNotificationEmail] = useState<boolean>(user?.preferences?.notificationSettings?.email || false);
    const [notificationSms, setNotificationSms] = useState<boolean>(user?.preferences?.notificationSettings?.sms || false);
    const [notificationInApp, setNotificationInApp] = useState<boolean>(user?.preferences?.notificationSettings?.inApp || false);
    const [accessibilityFontSize, setAccessibilityFontSize] = useState<'small' | 'medium' | 'large'>(user?.preferences?.accessibility?.fontSize || 'medium');
    const [accessibilityHighContrast, setAccessibilityHighContrast] = useState<boolean>(user?.preferences?.accessibility?.highContrast || false);

    // Effect to synchronize local state with global user context when it changes
    useEffect(() => {
        if (user) {
            setCurrentName(user.name);
            setCurrentAvatarUrl(user.avatarUrl);
            setCurrentStatus(user.status);
            setCurrentTheme(user.preferences.theme);
            setCurrentLanguage(user.preferences.language);
            setNotificationEmail(user.preferences.notificationSettings.email);
            setNotificationSms(user.preferences.notificationSettings.sms);
            setNotificationInApp(user.preferences.notificationSettings.inApp);
            setAccessibilityFontSize(user.preferences.accessibility.fontSize);
            setAccessibilityHighContrast(user.preferences.accessibility.highContrast);
        }
    }, [user]);

    // Derived state to check if any changes have been made
    const hasChanges = useMemo(() => {
        if (!user) return false;
        return (
            currentName !== user.name ||
            currentAvatarUrl !== user.avatarUrl ||
            currentStatus !== user.status ||
            currentTheme !== user.preferences.theme ||
            currentLanguage !== user.preferences.language ||
            notificationEmail !== user.preferences.notificationSettings.email ||
            notificationSms !== user.preferences.notificationSettings.sms ||
            notificationInApp !== user.preferences.notificationSettings.inApp ||
            accessibilityFontSize !== user.preferences.accessibility.fontSize ||
            accessibilityHighContrast !== user.preferences.accessibility.highContrast
        );
    }, [
        user, currentName, currentAvatarUrl, currentStatus, currentTheme, currentLanguage,
        notificationEmail, notificationSms, notificationInApp,
        accessibilityFontSize, accessibilityHighContrast
    ]);

    // Handler to save changes to the global context
    const handleSave = useCallback(() => {
        if (user && setUser) {
            const updatedUser: UserProfile = {
                ...user,
                name: currentName,
                avatarUrl: currentAvatarUrl,
                status: currentStatus,
                preferences: {
                    ...user.preferences,
                    theme: currentTheme,
                    language: currentLanguage,
                    notificationSettings: {
                        email: notificationEmail,
                        sms: notificationSms,
                        inApp: notificationInApp,
                    },
                    accessibility: {
                        fontSize: accessibilityFontSize,
                        highContrast: accessibilityHighContrast,
                    },
                },
            };
            setUser(updatedUser);
            // Also update theme and language in the global context directly if available
            setThemeMode(currentTheme);
            setLanguage(currentLanguage);

            triggerNotification('Profile settings saved successfully!', 'success');
            trackEvent('user_profile_updated', { userId: user.id });
        }
    }, [
        user, setUser, setThemeMode, setLanguage, triggerNotification, trackEvent,
        currentName, currentAvatarUrl, currentStatus,
        currentTheme, currentLanguage,
        notificationEmail, notificationSms, notificationInApp,
        accessibilityFontSize, accessibilityHighContrast
    ]);

    if (!user) {
        return (
            <div className="p-6 text-gray-500">
                <p>Loading user profile...</p>
                <p>If you're seeing this for too long, please ensure the AppContext is properly provided.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
                {getIcon('settings', 'h-8 w-8 mr-3 text-cyan-400')}
                User Profile & Settings
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Profile Information Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {getIcon('user', 'h-6 w-6 mr-2 text-blue-400')}
                        Profile Information
                    </h2>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-400 mb-1">Avatar URL</label>
                        <input
                            type="text"
                            id="avatarUrl"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={currentAvatarUrl}
                            onChange={(e) => setCurrentAvatarUrl(e.target.value)}
                        />
                        {currentAvatarUrl && (
                            <div className="mt-2">
                                <img src={currentAvatarUrl} alt="User Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-600" />
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                        <select
                            id="status"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={currentStatus}
                            onChange={(e) => setCurrentStatus(e.target.value as UserStatus)}
                        >
                            {['online', 'away', 'busy', 'offline', 'incognito'].map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-sm text-gray-500">
                        <p>User ID: <span className="font-mono">{user.id}</span></p>
                        <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>
                        <p>Roles: {user.roles.join(', ')}</p>
                        <p>Achievements: {user.achievementsCount}</p>
                    </div>
                </div>

                {/* Application Preferences Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {getIcon('settings', 'h-6 w-6 mr-2 text-green-400')}
                        Application Preferences
                    </h2>
                    <div className="mb-4">
                        <label htmlFor="theme" className="block text-sm font-medium text-gray-400 mb-1">Theme Mode</label>
                        <select
                            id="theme"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={currentTheme}
                            onChange={(e) => setCurrentTheme(e.target.value as ThemeMode)}
                        >
                            {['light', 'dark', 'system'].map(theme => (
                                <option key={theme} value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-1">Language</label>
                        <select
                            id="language"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={currentLanguage}
                            onChange={(e) => setCurrentLanguage(e.target.value as LanguageCode)}
                        >
                            {['en', 'es', 'fr', 'de', 'ja', 'zh'].map(lang => (
                                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notification Settings */}
                    <div className="mt-6 mb-4">
                        <h3 className="text-lg font-medium text-gray-300 mb-2 flex items-center">
                            {getIcon('bell', 'h-5 w-5 mr-2 text-yellow-400')}
                            Notification Settings
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center text-gray-300">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-purple-600 rounded"
                                    checked={notificationEmail}
                                    onChange={(e) => setNotificationEmail(e.target.checked)}
                                />
                                <span className="ml-2">Email Notifications</span>
                            </label>
                            <label className="flex items-center text-gray-300">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-purple-600 rounded"
                                    checked={notificationSms}
                                    onChange={(e) => setNotificationSms(e.target.checked)}
                                />
                                <span className="ml-2">SMS Notifications</span>
                            </label>
                            <label className="flex items-center text-gray-300">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-purple-600 rounded"
                                    checked={notificationInApp}
                                    onChange={(e) => setNotificationInApp(e.target.checked)}
                                />
                                <span className="ml-2">In-App Notifications</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Accessibility Settings */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {getIcon('accessibility', 'h-6 w-6 mr-2 text-orange-400')}
                        Accessibility Settings
                    </h2>
                    <div className="mb-4">
                        <label htmlFor="fontSize" className="block text-sm font-medium text-gray-400 mb-1">Font Size</label>
                        <select
                            id="fontSize"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            value={accessibilityFontSize}
                            onChange={(e) => setAccessibilityFontSize(e.target.value as 'small' | 'medium' | 'large')}
                        >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-red-600 rounded"
                                checked={accessibilityHighContrast}
                                onChange={(e) => setAccessibilityHighContrast(e.target.checked)}
                            />
                            <span className="ml-2">High Contrast Mode</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`px-6 py-3 rounded-md text-lg font-semibold transition-all duration-200
                                ${hasChanges ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default UserProfileSettings;