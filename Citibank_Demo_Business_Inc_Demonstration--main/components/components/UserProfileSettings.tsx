/**
 * This module implements a sophisticated user profile and settings management interface, central to the digital identity and governance framework of the Money20/20 platform.
 * Business value: This component empowers users with granular control over their digital identity, security preferences, and application experience, directly impacting user trust, data security, and operational efficiency. By providing intuitive controls for multi-factor authentication, session management, and API key generation, it drastically reduces security risks associated with user accounts. Furthermore, comprehensive preference settings drive user engagement and accessibility, while integrated audit trails for user activity enhance transparency and compliance. This robust self-service capability reduces support overhead, accelerates user onboarding, and safeguards the platform against unauthorized access, delivering millions in retained value through enhanced security posture and operational scalability. It is a critical nexus for user-agent interaction, defining the parameters within which agentic AI operates on behalf of the user.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext, getIcon } from '../components/Sidebar'; // Assuming Sidebar.tsx is in the same parent directory, adjust path if necessary
import { UserProfile, UserStatus, ThemeMode, LanguageCode } from '../types'; // These types are defined in Sidebar.tsx

// Helper for generating simulated UUIDs
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Re-exporting for clarity, but they are defined in the seed file itself.
// In a real project, these would likely be in a shared 'types' file.

export const UserProfileSettings: React.FC = () => {
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

    // New security-related states (simulated)
    const [mfaEnabled, setMfaEnabled] = useState<boolean>(user?.securitySettings?.mfaEnabled || false);
    const [activeSessions, setActiveSessions] = useState<{ id: string, device: string, location: string, ip: string, lastActivity: string }[]>(() => [
        { id: generateUUID(), device: 'Chrome on MacOS', location: 'New York, US', ip: '192.168.1.100', lastActivity: new Date().toISOString() },
        { id: generateUUID(), device: 'Safari on iPhone', location: 'London, UK', ip: '8.8.8.8', lastActivity: new Date(Date.now() - 3600000).toISOString() }, // 1 hour ago
    ]);
    const [apiKeys, setApiKeys] = useState<{ id: string, prefix: string, createdAt: string, lastUsed: string | null }[]>(() => [
        { id: generateUUID(), prefix: 'sk_live_abc', createdAt: new Date(Date.now() - 86400000).toISOString(), lastUsed: null }, // 1 day ago
    ]);
    const [recentActivities, setRecentActivities] = useState<{ id: string, type: string, description: string, timestamp: string }[]>(() => [
        { id: generateUUID(), type: 'Login', description: 'Logged in from New York, US', timestamp: new Date().toISOString() },
        { id: generateUUID(), type: 'Settings Update', description: 'Updated profile name', timestamp: new Date(Date.now() - 600000).toISOString() }, // 10 minutes ago
        { id: generateUUID(), type: 'Payment Sent', description: 'Initiated a payment of $100 to Jane Doe', timestamp: new Date(Date.now() - 3600000).toISOString() }, // 1 hour ago
    ]);


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
            setMfaEnabled(user.securitySettings?.mfaEnabled || false);
            // For activeSessions, apiKeys, recentActivities, assuming they are fetched independently or are not part of basic UserProfile
            // In a real app, these would be separate API calls.
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
            accessibilityHighContrast !== user.preferences.accessibility.highContrast ||
            mfaEnabled !== (user.securitySettings?.mfaEnabled || false)
        );
    }, [
        user, currentName, currentAvatarUrl, currentStatus, currentTheme, currentLanguage,
        notificationEmail, notificationSms, notificationInApp,
        accessibilityFontSize, accessibilityHighContrast, mfaEnabled
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
                // Assuming securitySettings can be part of UserProfile
                securitySettings: {
                    ...(user.securitySettings || {}),
                    mfaEnabled: mfaEnabled,
                }
            };
            setUser(updatedUser);
            // Also update theme and language in the global context directly if available
            setThemeMode(currentTheme);
            setLanguage(currentLanguage);

            triggerNotification('Profile and security settings saved successfully!', 'success');
            trackEvent('user_profile_updated', { userId: user.id });

            // Simulate logging this activity
            setRecentActivities(prev => [{
                id: generateUUID(),
                type: 'Settings Update',
                description: 'User profile settings saved.',
                timestamp: new Date().toISOString()
            }, ...prev]);
        }
    }, [
        user, setUser, setThemeMode, setLanguage, triggerNotification, trackEvent,
        currentName, currentAvatarUrl, currentStatus,
        currentTheme, currentLanguage,
        notificationEmail, notificationSms, notificationInApp,
        accessibilityFontSize, accessibilityHighContrast, mfaEnabled,
    ]);

    // Handler for ending a specific session
    const handleEndSession = useCallback((sessionId: string) => {
        setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
        triggerNotification('Session ended successfully.', 'info');
        trackEvent('user_session_ended', { userId: user?.id, sessionId });

        setRecentActivities(prev => [{
            id: generateUUID(),
            type: 'Security Action',
            description: `Ended session ${sessionId.substring(0, 8)}...`,
            timestamp: new Date().toISOString()
        }, ...prev]);
    }, [triggerNotification, trackEvent, user?.id]);

    // Handler for ending all other sessions
    const handleEndAllOtherSessions = useCallback(() => {
        // In a real app, this would send an API call to invalidate all sessions except the current one.
        // For simulation, we'll keep the first session (assuming it's the current one)
        setActiveSessions(prev => [prev[0]]);
        triggerNotification('All other sessions have been ended.', 'info');
        trackEvent('user_all_sessions_ended', { userId: user?.id });

        setRecentActivities(prev => [{
            id: generateUUID(),
            type: 'Security Action',
            description: 'Ended all other active sessions.',
            timestamp: new Date().toISOString()
        }, ...prev]);
    }, [triggerNotification, trackEvent, user?.id]);

    // Handler for generating a new API Key
    const handleGenerateApiKey = useCallback(() => {
        const newKeyId = generateUUID();
        const newKeyPrefix = `sk_live_${Math.random().toString(36).substring(2, 8)}`;
        const newKey = { id: newKeyId, prefix: newKeyPrefix, createdAt: new Date().toISOString(), lastUsed: null };
        setApiKeys(prev => [...prev, newKey]);
        triggerNotification(`New API Key generated: ${newKeyPrefix}. Please copy it now, it will not be shown again!`, 'success', 10000); // Longer duration
        trackEvent('user_api_key_generated', { userId: user?.id, keyId: newKeyId });

        setRecentActivities(prev => [{
            id: generateUUID(),
            type: 'Developer Action',
            description: `Generated new API key ${newKeyPrefix}.`,
            timestamp: new Date().toISOString()
        }, ...prev]);
    }, [triggerNotification, trackEvent, user?.id]);

    // Handler for revoking an API Key
    const handleRevokeApiKey = useCallback((keyId: string) => {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        triggerNotification('API Key revoked successfully.', 'warning');
        trackEvent('user_api_key_revoked', { userId: user?.id, keyId });

        setRecentActivities(prev => [{
            id: generateUUID(),
            type: 'Developer Action',
            description: `Revoked API key ${keyId.substring(0, 8)}...`,
            timestamp: new Date().toISOString()
        }, ...prev]);
    }, [triggerNotification, trackEvent, user?.id]);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Profile Information Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1">
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
                    <div className="text-sm text-gray-500 mt-6">
                        <p>User ID: <span className="font-mono text-gray-400">{user.id}</span></p>
                        <p>Last Login: <span className="text-gray-400">{new Date(user.lastLogin).toLocaleString()}</span></p>
                        <p>Roles: <span className="text-gray-400">{user.roles.join(', ')}</span></p>
                        <p>Achievements: <span className="text-gray-400">{user.achievementsCount}</span></p>
                    </div>
                </div>

                {/* Application Preferences Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1">
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

                {/* Security Settings Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {getIcon('lock', 'h-6 w-6 mr-2 text-red-400')}
                        Security Settings
                    </h2>
                    <div className="mb-4">
                        <label className="flex items-center text-gray-300">
                            <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-red-600 rounded"
                                checked={mfaEnabled}
                                onChange={(e) => setMfaEnabled(e.target.checked)}
                            />
                            <span className="ml-2">Enable Multi-Factor Authentication (MFA)</span>
                        </label>
                        <p className="text-sm text-gray-500 mt-1 pl-6">MFA adds an extra layer of security to your account.</p>
                    </div>
                    <div className="mb-6">
                        <button
                            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors duration-200"
                            onClick={() => triggerNotification('Password reset link sent to your email (simulated).', 'info')}
                        >
                            Change Password
                        </button>
                        <p className="text-sm text-gray-500 mt-1">Last changed: <span className="text-gray-400">{(user.securitySettings?.lastPasswordChange ? new Date(user.securitySettings.lastPasswordChange).toLocaleDateString() : 'Never')}</span></p>
                    </div>

                    <div className="mt-6 mb-4">
                        <h3 className="text-lg font-medium text-gray-300 mb-2 flex items-center">
                            {getIcon('sessions', 'h-5 w-5 mr-2 text-pink-400')}
                            Active Sessions
                        </h3>
                        <ul className="space-y-3">
                            {activeSessions.map((session, index) => (
                                <li key={session.id} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-200">{session.device} <span className="text-xs text-gray-400">({session.ip})</span></p>
                                        <p className="text-sm text-gray-400">{session.location} - Last Activity: {new Date(session.lastActivity).toLocaleString()}</p>
                                    </div>
                                    {index !== 0 && ( // Assuming the first session is current, disable ending it
                                        <button
                                            onClick={() => handleEndSession(session.id)}
                                            className="text-red-500 hover:text-red-600 text-sm font-semibold"
                                        >
                                            End Session
                                        </button>
                                    )}
                                    {index === 0 && (
                                        <span className="text-green-500 text-sm">Current</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {activeSessions.length > 1 && (
                            <button
                                onClick={handleEndAllOtherSessions}
                                className="mt-4 bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 px-4 rounded-md text-sm w-full transition-colors duration-200"
                            >
                                End All Other Sessions
                            </button>
                        )}
                    </div>
                </div>

                {/* Developer Settings (API Keys) */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {getIcon('code', 'h-6 w-6 mr-2 text-purple-400')}
                        Developer Settings
                    </h2>
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-300 mb-2 flex items-center">
                            {getIcon('key', 'h-5 w-5 mr-2 text-indigo-400')}
                            API Keys
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">Manage API keys for programmatic access and agent integrations.</p>
                        <button
                            onClick={handleGenerateApiKey}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors duration-200"
                        >
                            Generate New API Key
                        </button>
                        <ul className="mt-4 space-y-3">
                            {apiKeys.map(key => (
                                <li key={key.id} className="bg-gray-700 p-3 rounded-md flex items-center justify-between">
                                    <div>
                                        <p className="font-mono text-sm text-gray-200">{key.prefix}...</p>
                                        <p className="text-xs text-gray-400">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                                        {key.lastUsed && <p className="text-xs text-gray-400">Last Used: {new Date(key.lastUsed).toLocaleDateString()}</p>}
                                    </div>
                                    <button
                                        onClick={() => handleRevokeApiKey(key.id)}
                                        className="text-red-500 hover:text-red-600 text-sm font-semibold"
                                    >
                                        Revoke
                                    </button>
                                </li>
                            ))}
                            {apiKeys.length === 0 && <p className="text-sm text-gray-500">No API keys active.</p>}
                        </ul>
                    </div>
                </div>

                {/* Accessibility Settings */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1">
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

                {/* Recent Activity Log */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 xl:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        {getIcon('activity', 'h-6 w-6 mr-2 text-cyan-400')}
                        Recent Activity Log
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">A record of your key actions and system events, ensuring auditability and transparency.</p>
                    <div className="max-h-80 overflow-y-auto pr-2">
                        <ul className="space-y-3">
                            {recentActivities.length > 0 ? recentActivities.map(activity => (
                                <li key={activity.id} className="bg-gray-700 p-3 rounded-md">
                                    <p className="font-medium text-gray-200 flex justify-between items-center">
                                        <span>{activity.type}</span>
                                        <span className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                                </li>
                            )) : (
                                <p className="text-gray-500">No recent activities.</p>
                            )}
                        </ul>
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