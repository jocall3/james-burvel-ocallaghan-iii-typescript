// google/drive/index.tsx
// The Genesis Block for the Digital Archive. This summons the File Browser, the sovereign's personal library.

import React, {
    useState,
    useEffect,
    useContext,
    createContext,
    useMemo,
    useCallback,
    Component,
    useRef,
} from 'react';
import ReactDOM from 'react-dom/client';
import FileBrowser from './components/FileBrowser';

// --- Global Type Definitions (for cross-module interaction) ---
export type UserProfile = {
    id: string;
    username: string;
    email: string;
    roles: string[];
    permissions: string[];
    preferences: Record<string, any>;
    avatarUrl?: string;
    lastLogin: Date;
    twoFactorEnabled: boolean;
};

export type AuthState = {
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePalette = {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    // ... many more theme variables
};
export type ThemeConfig = {
    mode: ThemeMode;
    palette: ThemePalette;
    fontSize: 'small' | 'medium' | 'large';
    spacing: number; // base unit for UI spacing
    // ... endless customization options
};

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'urgent' | 'broadcast';
export type Notification = {
    id: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
    actions?: { label: string; handler: () => void }[];
    duration?: number; // ms, for transient notifications
    persistent?: boolean;
    targetUserIds?: string[]; // For targeted notifications
    sourceModule?: string;
};

export type AppConfig = {
    apiUrl: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    defaultLanguage: string;
    maxUploadSize: number; // bytes
    featureFlags: Record<string, boolean>;
    cdnBaseUrl: string;
    // ... thousands of configurable parameters
};

export type TelemetryEvent = {
    type: string; // e.g., 'page_view', 'click', 'error'
    payload: Record<string, any>;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    module?: string;
};

export type AIFeatureConfig = {
    enabled: boolean;
    modelProvider: 'openai' | 'anthropic' | 'custom';
    models: {
        documentSummarization: string;
        imageAnalysis: string;
        codeGeneration: string;
        searchOptimization: string;
        contentModeration: string;
        predictiveAnalytics: string;
        // ... many more specialized AI models
    };
    usageLimits: {
        dailyRequests: number;
        monthlyTokens: number;
    };
    contextWindowSize: number;
    realtimeProcessingEnabled: boolean;
    privacySettings: 'strict' | 'balanced' | 'lenient'; // Data usage for AI
};

export type PluginManifest = {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    entryPoint: string; // URL or path to the plugin bundle
    dependencies?: string[];
    permissions?: string[]; // Required permissions for the plugin
    configSchema?: Record<string, any>;
    activationEvents?: string[]; // e.g., ['onFileOpen', 'onAppStart']
    settingsUIComponent?: string; // Component name for plugin settings
};

export type FeatureFlag = {
    name: string;
    enabled: boolean;
    audience?: 'all' | 'staff' | 'beta_users' | string[]; // Target specific users/groups
    rolloutPercentage?: number;
    expiresAt?: Date;
    description?: string;
};

export type LanguageCode = string; // e.g., 'en-US', 'es-ES', 'ja-JP'
export type TranslationBundle = Record<string, string>; // { "key": "value" }

// --- Utility Functions (Exported for wider use) ---
export function generateUniqueId(prefix: string = 'id_'): string {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<T>) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

export function throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    let lastResult: any;
    return function (this: any, ...args: Parameters<T>) {
        const context = this;
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
            lastResult = func.apply(context, args);
        }
        return lastResult;
    };
}

// --- React Contexts and Providers ---

// 1. Authentication Context
export interface AuthContextType {
    authState: AuthState;
    login: (credentials: Record<string, any>) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: Record<string, any>) => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
    hasPermission: (permission: string) => boolean;
    refreshSession: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: true,
        error: null,
    });

    useEffect(() => {
        // Simulate initial auth check (e.g., check localStorage for token)
        const checkAuth = async () => {
            try {
                // In a real app, this would call an API to validate token
                const storedToken = localStorage.getItem('authToken');
                if (storedToken) {
                    // Simulate API call to get user profile based on token
                    const response = await fetch('/api/auth/me', {
                        headers: { Authorization: `Bearer ${storedToken}` },
                    });
                    if (response.ok) {
                        const user: UserProfile = await response.json();
                        setAuthState({
                            isAuthenticated: true,
                            user,
                            token: storedToken,
                            isLoading: false,
                            error: null,
                        });
                    } else {
                        throw new Error('Session invalid');
                    }
                } else {
                    setAuthState((prev) => ({ ...prev, isLoading: false }));
                }
            } catch (err: any) {
                console.error('Auth check failed:', err);
                setAuthState({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    isLoading: false,
                    error: err.message || 'Authentication failed',
                });
                localStorage.removeItem('authToken');
            }
        };
        checkAuth();
    }, []);

    const login = useCallback(async (credentials: Record<string, any>) => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }
            const data = await response.json();
            localStorage.setItem('authToken', data.token);
            setAuthState({
                isAuthenticated: true,
                user: data.user,
                token: data.token,
                isLoading: false,
                error: null,
            });
        } catch (err: any) {
            setAuthState((prev) => ({
                ...prev,
                isAuthenticated: false,
                user: null,
                token: null,
                isLoading: false,
                error: err.message,
            }));
            throw err; // Re-throw for UI to handle
        }
    }, []);

    const logout = useCallback(async () => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            await fetch('/api/auth/logout', { method: 'POST' }); // Invalidate token server-side
            localStorage.removeItem('authToken');
            setAuthState({
                isAuthenticated: false,
                user: null,
                token: null,
                isLoading: false,
                error: null,
            });
        } catch (err: any) {
            console.error('Logout failed:', err);
            setAuthState((prev) => ({ ...prev, isLoading: false, error: err.message }));
            throw err;
        }
    }, []);

    const register = useCallback(async (data: Record<string, any>) => {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }
            const responseData = await response.json();
            // Optionally auto-login after registration
            localStorage.setItem('authToken', responseData.token);
            setAuthState({
                isAuthenticated: true,
                user: responseData.user,
                token: responseData.token,
                isLoading: false,
                error: null,
            });
        } catch (err: any) {
            setAuthState((prev) => ({
                ...prev,
                isAuthenticated: false,
                user: null,
                token: null,
                isLoading: false,
                error: err.message,
            }));
            throw err;
        }
    }, []);

    const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
        if (!authState.isAuthenticated || !authState.token) {
            throw new Error('Not authenticated to update profile.');
        }
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }
            const updatedUser: UserProfile = await response.json();
            setAuthState((prev) => ({
                ...prev,
                user: updatedUser,
                isLoading: false,
                error: null,
            }));
        } catch (err: any) {
            setAuthState((prev) => ({ ...prev, isLoading: false, error: err.message }));
            throw err;
        }
    }, [authState.isAuthenticated, authState.token]);

    const hasPermission = useCallback((permission: string): boolean => {
        return authState.user?.permissions?.includes(permission) || authState.user?.roles?.some(role => role === 'admin') || false;
    }, [authState.user]);

    const refreshSession = useCallback(async () => {
        // Implement token refresh logic here
        // This might involve sending a refresh token to the server to get a new access token
        console.log('Refreshing session...');
        if (!authState.token) return;
        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`, // Or use a refresh token
                },
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('authToken', data.token);
                setAuthState(prev => ({ ...prev, token: data.token, user: data.user }));
            } else {
                throw new Error('Failed to refresh token');
            }
        } catch (error) {
            console.error('Session refresh failed:', error);
            await logout(); // Force logout on refresh failure
        }
    }, [authState.token, logout]);

    const authContextValue = useMemo(() => ({
        authState,
        login,
        logout,
        register,
        updateProfile,
        hasPermission,
        refreshSession,
    }), [authState, login, logout, register, updateProfile, hasPermission, refreshSession]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// 2. Theme Context
export interface ThemeContextType {
    theme: ThemeConfig;
    setThemeMode: (mode: ThemeMode) => void;
    toggleThemeMode: () => void;
    // Potentially more granular setters for palette, fontSize etc.
    updateTheme: (updates: Partial<ThemeConfig>) => void;
}
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeConfig>(() => {
        // Initialize theme from localStorage or system preference
        try {
            const savedTheme = localStorage.getItem('appTheme');
            if (savedTheme) {
                return JSON.parse(savedTheme);
            }
        } catch (error) {
            console.warn("Could not parse saved theme, using default.", error);
        }
        return {
            mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            palette: {
                primary: '#4285F4', // Google Blue
                secondary: '#34A853', // Google Green
                background: '#FFFFFF',
                text: '#202124',
                accent: '#EA4335', // Google Red
            },
            fontSize: 'medium',
            spacing: 8,
        };
    });

    useEffect(() => {
        // Apply theme to body or root element
        const root = document.documentElement;
        root.setAttribute('data-theme-mode', theme.mode);
        // This is where a more robust styling system (like CSS variables, JSS, Emotion, Styled-components) would inject styles
        // For simplicity, we'll just set a few basic CSS variables
        root.style.setProperty('--primary-color', theme.palette.primary);
        root.style.setProperty('--secondary-color', theme.palette.secondary);
        root.style.setProperty('--background-color', theme.palette.background);
        root.style.setProperty('--text-color', theme.palette.text);
        root.style.setProperty('--accent-color', theme.palette.accent);
        root.style.setProperty('--font-size-base', theme.fontSize === 'small' ? '14px' : theme.fontSize === 'large' ? '18px' : '16px');
        root.style.setProperty('--spacing-unit', `${theme.spacing}px`);

        localStorage.setItem('appTheme', JSON.stringify(theme));
    }, [theme]);

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeState((prev) => ({ ...prev, mode }));
    }, []);

    const toggleThemeMode = useCallback(() => {
        setThemeState((prev) => ({
            ...prev,
            mode: prev.mode === 'light' ? 'dark' : 'light',
        }));
    }, []);

    const updateTheme = useCallback((updates: Partial<ThemeConfig>) => {
        setThemeState((prev) => ({ ...prev, ...updates, palette: { ...prev.palette, ...updates.palette } }));
    }, []);

    const themeContextValue = useMemo(() => ({
        theme,
        setThemeMode,
        toggleThemeMode,
        updateTheme,
    }), [theme, setThemeMode, toggleThemeMode, updateTheme]);

    return (
        <ThemeContext.Provider value={themeContextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// 3. Configuration Context
export interface ConfigContextType {
    config: AppConfig;
    getFeatureFlag: (flagName: string) => boolean;
    updateConfig: (updates: Partial<AppConfig>) => void;
    isProd: boolean;
    isDev: boolean;
}
export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<AppConfig>(() => {
        // Load initial config from environment variables, a global config file, or API
        const initialConfig: AppConfig = {
            apiUrl: process.env.REACT_APP_API_URL || '/api',
            version: process.env.REACT_APP_VERSION || '1.0.0-alpha',
            environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'staging' | 'production',
            defaultLanguage: 'en-US',
            maxUploadSize: 10 * 1024 * 1024 * 1024, // 10 GB
            featureFlags: {
                aiSearch: true,
                collaborativeEditing: true,
                offlineMode: true,
                versionHistory: true,
                advancedSecurityAudits: true,
                pluginMarketplace: true,
                smartRecommendations: true,
                generativeContent: true,
                voiceCommands: true,
                blockchainIntegrity: false, // Future feature
                quantumEncryption: false, // Distant future
                // ... hundreds more feature flags
            },
            cdnBaseUrl: process.env.REACT_APP_CDN_URL || 'https://cdn.example.com',
        };
        // In a real app, this might merge with a server-fetched config
        return initialConfig;
    });

    const getFeatureFlag = useCallback((flagName: string): boolean => {
        return config.featureFlags[flagName] || false;
    }, [config.featureFlags]);

    const updateConfig = useCallback((updates: Partial<AppConfig>) => {
        setConfig((prev) => ({
            ...prev,
            ...updates,
            featureFlags: { ...prev.featureFlags, ...updates.featureFlags },
        }));
    }, []);

    const isProd = useMemo(() => config.environment === 'production', [config.environment]);
    const isDev = useMemo(() => config.environment === 'development', [config.environment]);

    const configContextValue = useMemo(() => ({
        config,
        getFeatureFlag,
        updateConfig,
        isProd,
        isDev,
    }), [config, getFeatureFlag, updateConfig, isProd, isDev]);

    return (
        <ConfigContext.Provider value={configContextValue}>
            {children}
        </ConfigContext.Provider>
    );
};

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}

// 4. Notification Context
export interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'> & Partial<Pick<Notification, 'id' | 'timestamp' | 'read'>>) => string;
    removeNotification: (id: string) => void;
    markNotificationAsRead: (id: string) => void;
    clearAllNotifications: () => void;
}
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((
        notification: Omit<Notification, 'id' | 'timestamp' | 'read'> & Partial<Pick<Notification, 'id' | 'timestamp' | 'read'>>
    ): string => {
        const id = notification.id || generateUniqueId('notif_');
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: notification.timestamp || new Date(),
            read: notification.read || false,
        };
        setNotifications((prev) => [...prev, newNotification]);

        if (newNotification.duration && !newNotification.persistent) {
            setTimeout(() => removeNotification(id), newNotification.duration);
        }
        return id;
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const notificationContextValue = useMemo(() => ({
        notifications,
        addNotification,
        removeNotification,
        markNotificationAsRead,
        clearAllNotifications,
    }), [notifications, addNotification, removeNotification, markNotificationAsRead, clearAllNotifications]);

    return (
        <NotificationContext.Provider value={notificationContextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}

// 5. Internationalization (i18n) Context
export interface I18nContextType {
    currentLanguage: LanguageCode;
    t: (key: string, variables?: Record<string, string | number>) => string;
    changeLanguage: (lang: LanguageCode) => Promise<void>;
    supportedLanguages: LanguageCode[];
    isRTL: boolean;
}
export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { config } = useConfig(); // Access app config for default language
    const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(config.defaultLanguage);
    const [translations, setTranslations] = useState<TranslationBundle>({});
    const supportedLanguages: LanguageCode[] = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN', 'ar-SA', 'he-IL']; // Expanded list

    const fetchTranslations = useCallback(async (lang: LanguageCode) => {
        try {
            // In a real app, this would fetch from a translation service or locale files
            const response = await fetch(`/locales/${lang}.json`);
            if (response.ok) {
                const newTranslations = await response.json();
                setTranslations(newTranslations);
            } else {
                console.warn(`Failed to load translations for ${lang}, falling back to default.`);
                // Optionally fall back to a default language's translations
                const defaultResponse = await fetch(`/locales/${config.defaultLanguage}.json`);
                if (defaultResponse.ok) {
                    setTranslations(await defaultResponse.json());
                } else {
                    setTranslations({});
                }
            }
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            setTranslations({});
        }
    }, [config.defaultLanguage]);

    useEffect(() => {
        fetchTranslations(currentLanguage);
        document.documentElement.lang = currentLanguage;
        // Set document direction for RTL languages
        const isCurrentRTL = ['ar-SA', 'he-IL'].includes(currentLanguage);
        document.documentElement.dir = isCurrentRTL ? 'rtl' : 'ltr';
    }, [currentLanguage, fetchTranslations]);

    const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
        let translation = translations[key] || key; // Fallback to key if no translation
        if (variables) {
            for (const [varName, varValue] of Object.entries(variables)) {
                translation = translation.replace(`{{${varName}}}`, String(varValue));
            }
        }
        return translation;
    }, [translations]);

    const changeLanguage = useCallback(async (lang: LanguageCode) => {
        if (!supportedLanguages.includes(lang)) {
            console.warn(`Language ${lang} is not supported. Ignoring request.`);
            return;
        }
        setCurrentLanguage(lang);
        localStorage.setItem('appLanguage', lang); // Persist language choice
    }, [supportedLanguages]);

    const isRTL = useMemo(() => ['ar-SA', 'he-IL'].includes(currentLanguage), [currentLanguage]);

    const i18nContextValue = useMemo(() => ({
        currentLanguage,
        t,
        changeLanguage,
        supportedLanguages,
        isRTL,
    }), [currentLanguage, t, changeLanguage, supportedLanguages, isRTL]);

    return (
        <I18nContext.Provider value={i18nContextValue}>
            {children}
        </I18nContext.Provider>
    );
};

export function useI18n() {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

// 6. Telemetry/Analytics Context
export interface TelemetryContextType {
    trackEvent: (event: TelemetryEvent) => void;
    trackPageView: (pagePath: string, pageTitle: string) => void;
    trackError: (error: Error, info?: React.ErrorInfo | Record<string, any>) => void;
    setUserId: (userId: string) => void;
    setSessionId: (sessionId: string) => void;
}
export const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserIdState] = useState<string | undefined>(undefined);
    const [sessionId, setSessionIdState] = useState<string>(generateUniqueId('sess_'));
    const { authState } = useAuth();
    const { config } = useConfig();

    useEffect(() => {
        if (authState.isAuthenticated && authState.user?.id) {
            setUserIdState(authState.user.id);
        } else {
            setUserIdState(undefined);
        }
    }, [authState.isAuthenticated, authState.user?.id]);

    const sendToAnalyticsBackend = useCallback((event: TelemetryEvent) => {
        if (config.environment === 'development') {
            console.log('Telemetry Event (Dev Mode):', event);
            return;
        }
        // In a real app, send to an analytics service (e.g., Google Analytics, Amplitude, custom backend)
        fetch('/api/telemetry/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
        }).catch(err => console.error('Failed to send telemetry event:', err));
    }, [config.environment]);

    const trackEvent = useCallback((event: TelemetryEvent) => {
        sendToAnalyticsBackend({
            ...event,
            timestamp: event.timestamp || new Date(),
            userId: userId,
            sessionId: sessionId,
        });
    }, [sendToAnalyticsBackend, userId, sessionId]);

    const trackPageView = useCallback((pagePath: string, pageTitle: string) => {
        trackEvent({
            type: 'page_view',
            payload: { path: pagePath, title: pageTitle },
            module: 'Routing',
        });
    }, [trackEvent]);

    const trackError = useCallback((error: Error, info?: React.ErrorInfo | Record<string, any>) => {
        trackEvent({
            type: 'app_error',
            payload: {
                message: error.message,
                stack: error.stack,
                componentStack: (info as React.ErrorInfo)?.componentStack,
                additionalInfo: info,
            },
            module: 'ErrorBoundary',
        });
    }, [trackEvent]);

    const setUserId = useCallback((id: string) => setUserIdState(id), []);
    const setSessionId = useCallback((id: string) => setSessionIdState(id), []);

    const telemetryContextValue = useMemo(() => ({
        trackEvent,
        trackPageView,
        trackError,
        setUserId,
        setSessionId,
    }), [trackEvent, trackPageView, trackError, setUserId, setSessionId]);

    return (
        <TelemetryContext.Provider value={telemetryContextValue}>
            {children}
        </TelemetryContext.Provider>
    );
};

export function useTelemetry() {
    const context = useContext(TelemetryContext);
    if (context === undefined) {
        throw new Error('useTelemetry must be used within a TelemetryProvider');
    }
    return context;
}

// 7. AI Integration Context
export interface AIIntegrationContextType {
    aiConfig: AIFeatureConfig;
    isAIAvailable: boolean;
    updateAIConfig: (updates: Partial<AIFeatureConfig>) => void;
    callAIModel: <T>(modelName: keyof AIFeatureConfig['models'], prompt: any, options?: Record<string, any>) => Promise<T>;
    getAIRecommendation: <T>(context: Record<string, any>, type: string) => Promise<T>;
    streamAIResponse: (modelName: keyof AIFeatureConfig['models'], prompt: any, onChunk: (chunk: string) => void, onComplete: () => void) => Promise<void>;
}
export const AIIntegrationContext = createContext<AIIntegrationContextType | undefined>(undefined);

export const AIIntegrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { getFeatureFlag } = useConfig();
    const [aiConfig, setAIConfig] = useState<AIFeatureConfig>(() => ({
        enabled: getFeatureFlag('aiFeaturesEnabled'),
        modelProvider: 'openai',
        models: {
            documentSummarization: 'gpt-4o',
            imageAnalysis: 'gpt-4o',
            codeGeneration: 'codellama',
            searchOptimization: 'deepmind-search',
            contentModeration: 'google-perspective',
            predictiveAnalytics: 'google-vertex-ai-forecast',
        },
        usageLimits: {
            dailyRequests: 1000,
            monthlyTokens: 10_000_000,
        },
        contextWindowSize: 4096,
        realtimeProcessingEnabled: true,
        privacySettings: 'balanced',
    }));

    const isAIAvailable = useMemo(() => aiConfig.enabled && getFeatureFlag('aiFeaturesEnabled'), [aiConfig.enabled, getFeatureFlag]);

    const updateAIConfig = useCallback((updates: Partial<AIFeatureConfig>) => {
        setAIConfig((prev) => ({ ...prev, ...updates }));
    }, []);

    const callAIModel = useCallback(async <T,>(modelName: keyof AIFeatureConfig['models'], prompt: any, options?: Record<string, any>): Promise<T> => {
        if (!isAIAvailable) {
            throw new Error('AI features are not enabled or available.');
        }
        const model = aiConfig.models[modelName];
        if (!model) {
            throw new Error(`AI model "${String(modelName)}" is not configured.`);
        }
        console.log(`Calling AI model: ${model} with prompt:`, prompt, 'options:', options);
        try {
            const response = await fetch('/api/ai/invoke', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, options }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `AI model call failed: ${response.status}`);
            }
            return (await response.json()) as T;
        } catch (error) {
            console.error('Error calling AI model:', error);
            throw error;
        }
    }, [isAIAvailable, aiConfig.models]);

    const getAIRecommendation = useCallback(async <T,>(context: Record<string, any>, type: string): Promise<T> => {
        // Specialized AI call for recommendations
        return callAIModel<T>('predictiveAnalytics', { context, type, action: 'recommend' });
    }, [callAIModel]);

    const streamAIResponse = useCallback(async (modelName: keyof AIFeatureConfig['models'], prompt: any, onChunk: (chunk: string) => void, onComplete: () => void) => {
        if (!isAIAvailable) {
            throw new Error('AI features are not enabled or available.');
        }
        const model = aiConfig.models[modelName];
        if (!model) {
            throw new Error(`AI model "${String(modelName)}" is not configured.`);
        }

        try {
            const response = await fetch('/api/ai/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model, prompt, stream: true }),
            });

            if (!response.ok || !response.body) {
                const errorData = await response.json();
                throw new Error(errorData.message || `AI stream failed: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                result += chunk;
                onChunk(chunk); // Callback for each received chunk
            }
            onComplete();
        } catch (error) {
            console.error('Error streaming AI response:', error);
            throw error;
        }
    }, [isAIAvailable, aiConfig.models]);


    const aiIntegrationContextValue = useMemo(() => ({
        aiConfig,
        isAIAvailable,
        updateAIConfig,
        callAIModel,
        getAIRecommendation,
        streamAIResponse,
    }), [aiConfig, isAIAvailable, updateAIConfig, callAIModel, getAIRecommendation, streamAIResponse]);

    return (
        <AIIntegrationContext.Provider value={aiIntegrationContextValue}>
            {children}
        </AIIntegrationContext.Provider>
    );
};

export function useAIIntegration() {
    const context = useContext(AIIntegrationContext);
    if (context === undefined) {
        throw new Error('useAIIntegration must be used within an AIIntegrationProvider');
    }
    return context;
}

// 8. Plugin System Context
export interface PluginSystemContextType {
    plugins: PluginManifest[];
    activePlugins: string[]; // IDs of currently active plugins
    loadPlugin: (pluginId: string) => Promise<boolean>;
    unloadPlugin: (pluginId: string) => Promise<boolean>;
    getPluginInstance: (pluginId: string) => any | undefined;
    getAvailableIntegrations: (integrationPoint: string) => any[]; // e.g., 'fileContextMenu', 'dashboardWidgets'
    registerIntegration: (integrationPoint: string, component: React.ComponentType | Function, metadata?: Record<string, any>) => void;
}
export const PluginSystemContext = createContext<PluginSystemContextType | undefined>(undefined);

export const PluginSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [plugins, setPlugins] = useState<PluginManifest[]>([]);
    const [activePlugins, setActivePlugins] = useState<string[]>([]);
    const pluginInstances = useRef<Map<string, any>>(new Map()); // Map of pluginId to its loaded module
    const integrations = useRef<Map<string, Array<{ component: any, metadata?: Record<string, any> }>>>(new Map());

    const { addNotification, removeNotification } = useNotification();
    const { getFeatureFlag } = useConfig();
    const auth = useAuth(); // Pass auth context to plugins
    const config = useConfig(); // Pass config context to plugins
    const telemetry = useTelemetry(); // Pass telemetry context to plugins
    const ai = useAIIntegration(); // Pass AI context to plugins

    // This internal function is used by plugins to register their UI/logic extensions
    const registerIntegration = useCallback((integrationPoint: string, component: React.ComponentType | Function, metadata?: Record<string, any>) => {
        if (!integrations.current.has(integrationPoint)) {
            integrations.current.set(integrationPoint, []);
        }
        integrations.current.get(integrationPoint)?.push({ component, metadata });
        console.log(`Plugin registered integration point: ${integrationPoint}`);
    }, []);

    useEffect(() => {
        // Simulate fetching plugin manifests from a server/marketplace
        const fetchPlugins = async () => {
            if (!getFeatureFlag('pluginMarketplace')) {
                console.info('Plugin marketplace is disabled by feature flag.');
                return;
            }
            try {
                // In a real app, this would fetch from an API.
                // For "no placeholders" demonstration within this file, we'll hardcode one.
                const fetchedPlugins: PluginManifest[] = [
                    {
                        id: 'sample-plugin-widget',
                        name: 'Sample Dashboard Widget Plugin',
                        version: '1.0.0',
                        description: 'A sample plugin demonstrating dashboard widget integration.',
                        author: 'AI Expert',
                        entryPoint: 'internal:SamplePluginWidgetInitialize', // Special internal identifier
                        activationEvents: ['onAppStart'],
                    },
                    // ... more plugins from a real API
                ];
                setPlugins(fetchedPlugins);
                // Automatically activate some default plugins or user-configured ones
                const defaultActive = fetchedPlugins
                    .filter(p => p.id === 'sample-plugin-widget' || p.id === 'task-automator')
                    .map(p => p.id);
                for (const pluginId of defaultActive) {
                    loadPlugin(pluginId); // Load async
                }
            } catch (error) {
                console.error('Failed to fetch plugin manifests:', error);
                addNotification({
                    message: 'Failed to load plugin marketplace data.',
                    type: 'error',
                });
            }
        };
        fetchPlugins();
    }, [addNotification, getFeatureFlag]); // eslint-disable-line react-hooks/exhaustive-deps -- loadPlugin is a dep, but declared after
    // Adding loadPlugin to deps array creates a circular dependency warning because it uses addNotification/registerIntegration.
    // For this demonstration, we'll manually ensure `loadPlugin` is effectively stable or accept the warning.
    // In a production app, these would be external service calls or a more carefully managed dependency graph.


    const loadPlugin = useCallback(async (pluginId: string): Promise<boolean> => {
        if (activePlugins.includes(pluginId)) {
            addNotification({ message: `Plugin '${pluginId}' is already loaded.`, type: 'info', duration: 3000 });
            return true;
        }
        const pluginManifest = plugins.find(p => p.id === pluginId);
        if (!pluginManifest) {
            addNotification({ message: `Plugin '${pluginId}' not found.`, type: 'error' });
            return false;
        }

        addNotification({ message: `Loading plugin '${pluginId}'...`, type: 'info', duration: 3000 });
        try {
            let module: any;
            if (pluginManifest.entryPoint === 'internal:SamplePluginWidgetInitialize') {
                // This is a special case for a plugin defined directly within this file for "no placeholders"
                module = { initialize: initializeSamplePlugin, component: SamplePluginWidget }; // Referencing the exported function directly
            } else {
                // For external plugins, use dynamic import.
                // @ts-ignore - This dynamic import path is not resolvable at compile time.
                module = await import(/* @vite-ignore */ `${pluginManifest.entryPoint}`).then(m => m.default || m);
            }

            if (module && typeof module.initialize === 'function') {
                await module.initialize({
                    // Provide core services/APIs to the plugin
                    auth: { ...auth, hasPermission: auth.hasPermission },
                    config: { ...config, getFeatureFlag: config.getFeatureFlag },
                    notifications: { addNotification, removeNotification },
                    telemetry: { trackEvent: telemetry.trackEvent },
                    ai: { callAIModel: ai.callAIModel },
                    registerIntegration: (point: string, component: React.ComponentType | Function, meta?: Record<string, any>) => registerIntegration(point, component, { ...meta, sourcePluginId: pluginId }),
                    // ... other core APIs
                });
            }
            pluginInstances.current.set(pluginId, module);
            setActivePlugins((prev) => [...prev, pluginId]);
            addNotification({ message: `Plugin '${pluginId}' loaded successfully!`, type: 'success', duration: 3000 });
            return true;
        } catch (error) {
            console.error(`Failed to load plugin '${pluginId}':`, error);
            addNotification({ message: `Failed to load plugin '${pluginId}'. Check console for details.`, type: 'error' });
            return false;
        }
    }, [activePlugins, plugins, addNotification, auth, config, telemetry, ai, registerIntegration, removeNotification]);

    const unloadPlugin = useCallback(async (pluginId: string): Promise<boolean> => {
        if (!activePlugins.includes(pluginId)) {
            addNotification({ message: `Plugin '${pluginId}' is not active.`, type: 'info', duration: 3000 });
            return false;
        }

        addNotification({ message: `Unloading plugin '${pluginId}'...`, type: 'info', duration: 3000 });
        try {
            const pluginModule = pluginInstances.current.get(pluginId);
            if (pluginModule && typeof pluginModule.shutdown === 'function') {
                await pluginModule.shutdown();
            }
            pluginInstances.current.delete(pluginId);
            setActivePlugins((prev) => prev.filter((id) => id !== pluginId));
            // Also remove any integrations registered by this plugin
            integrations.current.forEach((value, key) => {
                integrations.current.set(key, value.filter(integration => integration.metadata?.sourcePluginId !== pluginId));
            });

            addNotification({ message: `Plugin '${pluginId}' unloaded.`, type: 'success', duration: 3000 });
            return true;
        } catch (error) {
            console.error(`Failed to unload plugin '${pluginId}':`, error);
            addNotification({ message: `Failed to unload plugin '${pluginId}'. Check console for details.`, type: 'error' });
            return false;
        }
    }, [activePlugins, addNotification, removeNotification]);

    const getPluginInstance = useCallback((pluginId: string) => {
        return pluginInstances.current.get(pluginId);
    }, []);

    const getAvailableIntegrations = useCallback((integrationPoint: string) => {
        return integrations.current.get(integrationPoint) || [];
    }, []);

    const pluginSystemContextValue = useMemo(() => ({
        plugins,
        activePlugins,
        loadPlugin,
        unloadPlugin,
        getPluginInstance,
        getAvailableIntegrations,
        registerIntegration, // This should be provided to plugins
    }), [plugins, activePlugins, loadPlugin, unloadPlugin, getPluginInstance, getAvailableIntegrations, registerIntegration]);

    return (
        <PluginSystemContext.Provider value={pluginSystemContextValue}>
            {children}
        </PluginSystemContext.Provider>
    );
};

export function usePluginSystem() {
    const context = useContext(PluginSystemContext);
    if (context === undefined) {
        throw new Error('usePluginSystem must be used within a PluginSystemProvider');
    }
    return context;
}

// 9. Offline Sync & Capabilities Context
export interface OfflineSyncContextType {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    enableOfflineMode: () => Promise<void>;
    disableOfflineMode: () => Promise<void>;
    syncData: () => Promise<void>;
    getOfflineStatus: () => { indexedDBStatus: string; cacheStorageStatus: string };
    // Advanced features: conflict resolution, selective sync settings
}
export const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const { addNotification, removeNotification } = useNotification();
    const { getFeatureFlag } = useConfig();

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            addNotification({ message: 'You are back online!', type: 'success', duration: 3000 });
            // Potentially trigger a sync when back online
            if (getFeatureFlag('offlineMode')) {
                syncData();
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
            addNotification({ message: 'You are offline. Some features may be limited.', type: 'warning', duration: 5000, persistent: true });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [addNotification, getFeatureFlag, syncData]);

    const enableOfflineMode = useCallback(async () => {
        if (!getFeatureFlag('offlineMode')) {
            addNotification({ message: 'Offline mode is currently disabled.', type: 'info' });
            return;
        }
        addNotification({ message: 'Enabling offline mode...', type: 'info' });
        try {
            // This would register a service worker and precache assets/data
            if ('serviceWorker' in navigator) {
                await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered for offline mode.');
            }
            // Trigger initial data sync for offline access
            await syncData();
            addNotification({ message: 'Offline mode enabled successfully!', type: 'success', duration: 3000 });
        } catch (error) {
            console.error('Error enabling offline mode:', error);
            addNotification({ message: 'Failed to enable offline mode.', type: 'error' });
            throw error;
        }
    }, [addNotification, getFeatureFlag, syncData]);

    const disableOfflineMode = useCallback(async () => {
        addNotification({ message: 'Disabling offline mode...', type: 'info' });
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                console.log('Service Workers unregistered.');
            }
            // Clear indexedDB or other local caches if desired
            addNotification({ message: 'Offline mode disabled.', type: 'success', duration: 3000 });
        } catch (error) {
            console.error('Error disabling offline mode:', error);
            addNotification({ message: 'Failed to disable offline mode.', type: 'error' });
            throw error;
        }
    }, [addNotification]);

    const syncData = useCallback(async () => {
        if (!getFeatureFlag('offlineMode')) return;
        if (isSyncing) {
            addNotification({ message: 'Data sync already in progress.', type: 'info', duration: 2000 });
            return;
        }

        setIsSyncing(true);
        addNotification({ message: 'Initiating data sync...', type: 'info', duration: 0, persistent: true, id: 'sync-notif' });
        try {
            // Simulate complex sync logic:
            // 1. Fetch changes from server
            // 2. Apply local changes to server (resolve conflicts)
            // 3. Update local IndexedDB / Cache Storage
            // 4. Update file metadata, content, user preferences, etc.
            // This would typically involve multiple API calls and IndexedDB operations.
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network latency + processing

            // Example: Sync file metadata (imagine a 'fileSyncService' module)
            // await fileSyncService.syncMetadata();
            // await fileSyncService.syncContent();

            setLastSyncTime(new Date());
            addNotification({ message: 'Data synced successfully!', type: 'success', duration: 3000, id: 'sync-notif' });
            console.log('Data synced successfully.');
        } catch (error) {
            console.error('Data sync failed:', error);
            addNotification({ message: 'Data sync failed! Check console for details.', type: 'error', persistent: true, id: 'sync-notif' });
        } finally {
            setIsSyncing(false);
            removeNotification('sync-notif'); // Remove persistent notification
        }
    }, [isSyncing, addNotification, removeNotification, getFeatureFlag]);

    const getOfflineStatus = useCallback(() => {
        // Dummy implementation; actual would query IndexedDB/CacheStorage directly
        return {
            indexedDBStatus: 'Available (simulated)',
            cacheStorageStatus: 'Available (simulated)',
        };
    }, []);

    const offlineSyncContextValue = useMemo(() => ({
        isOnline,
        isSyncing,
        lastSyncTime,
        enableOfflineMode,
        disableOfflineMode,
        syncData,
        getOfflineStatus,
    }), [isOnline, isSyncing, lastSyncTime, enableOfflineMode, disableOfflineMode, syncData, getOfflineStatus]);

    return (
        <OfflineSyncContext.Provider value={offlineSyncContextValue}>
            {children}
        </OfflineSyncContext.Provider>
    );
};

export function useOfflineSync() {
    const context = useContext(OfflineSyncContext);
    if (context === undefined) {
        throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
    }
    return context;
}

// --- Global Error Boundary for Robustness ---
export class AppErrorBoundary extends Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
    static contextType = TelemetryContext;
    context!: React.ContextType<typeof TelemetryContext>;

    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error in component tree:', error, errorInfo);
        this.setState({ errorInfo });

        // Log the error to a telemetry service using the context
        if (this.context && this.context.trackError) {
            this.context.trackError(error, errorInfo);
        } else {
            console.warn('TelemetryContext not available in ErrorBoundary to log error.');
        }
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fee', border: '1px solid #fbb' }}>
                    <h1>Oops! Something went wrong.</h1>
                    <p>We're sorry for the inconvenience. Our team has been notified.</p>
                    <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', margin: '20px auto', maxWidth: '800px', backgroundColor: '#fff', padding: '15px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
                        {this.state.error && <p>{this.state.error.toString()}</p>}
                        {this.state.errorInfo && (
                            <pre style={{ overflowX: 'auto', padding: '10px', backgroundColor: '#eee', borderRadius: '3px', marginTop: '10px' }}>
                                {this.state.errorInfo.componentStack}
                            </pre>
                        )}
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px' }}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// --- Main Application Shell ---
// This component orchestrates all the providers and potentially handles routing, global layout, etc.
// It replaces the direct rendering of <FileBrowser />
export const DigitalArchiveApp: React.FC = () => {
    const { authState, refreshSession, logout } = useAuth();
    const { theme, toggleThemeMode } = useTheme();
    const { config, getFeatureFlag } = useConfig();
    const { addNotification, removeNotification } = useNotification();
    const { currentLanguage, t, changeLanguage, supportedLanguages: i18nSupportedLanguages, isRTL } = useI18n();
    const { trackPageView, trackEvent } = useTelemetry();
    const { isOnline, enableOfflineMode, syncData, isSyncing } = useOfflineSync();
    const { getAvailableIntegrations } = usePluginSystem();

    // Example: Periodically refresh authentication token
    useEffect(() => {
        if (authState.isAuthenticated && config.environment !== 'development') { // Don't refresh in dev if not needed
            const interval = setInterval(() => {
                refreshSession();
            }, 30 * 60 * 1000); // Refresh every 30 minutes
            return () => clearInterval(interval);
        }
    }, [authState.isAuthenticated, refreshSession, config.environment]);

    // Example: Track page views using a mock router context or manual calls
    useEffect(() => {
        // In a real app, this would integrate with a router (e.g., react-router-dom)
        // For now, simulate initial page view tracking
        trackPageView(window.location.pathname, document.title);
    }, [trackPageView]);

    // Apply global styling based on theme and i18n
    useEffect(() => {
        document.body.style.backgroundColor = theme.palette.background;
        document.body.style.color = theme.palette.text;
        document.body.style.direction = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = currentLanguage;
    }, [theme, isRTL, currentLanguage]);

    // Prompt user to enable offline mode if supported and not yet enabled
    useEffect(() => {
        if (getFeatureFlag('offlineMode') && 'serviceWorker' in navigator && !localStorage.getItem('offlineModeEnabled')) {
            const timer = setTimeout(() => {
                addNotification({
                    message: t('offline_mode_prompt', { appName: 'Digital Archive' }),
                    type: 'info',
                    persistent: true,
                    actions: [
                        { label: t('enable_now'), handler: async () => {
                            try {
                                await enableOfflineMode();
                                localStorage.setItem('offlineModeEnabled', 'true');
                            } catch (e) {
                                // Handled by enableOfflineMode notification
                            }
                        }},
                        { label: t('later'), handler: () => removeNotification('offline_mode_prompt_id') } // Manually remove after 'later' click
                    ],
                    id: 'offline_mode_prompt_id'
                });
            }, 5000); // Show prompt after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [getFeatureFlag, enableOfflineMode, addNotification, removeNotification, t]);

    // Check auth loading state
    if (authState.isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: theme.palette.primary }}>
                {t('loading_application')}...
            </div>
        );
    }

    // Basic routing logic simulation (in a real app, use React Router)
    const renderContent = () => {
        // If not authenticated, show a login screen or public view
        if (!authState.isAuthenticated) {
            // This would be a dedicated Login component from './components/Auth/Login'
            // For now, a placeholder message
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
                    <h1>{t('welcome_to_app', { appName: 'Digital Archive' })}</h1>
                    <p>{t('please_login_to_continue')}.</p>
                    <button onClick={() => alert('Simulated Login Call')} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: theme.palette.primary, color: 'white', border: 'none', borderRadius: '5px' }}>
                        {t('login_button')}
                    </button>
                    {getFeatureFlag('allowRegistration') && (
                        <button onClick={() => alert('Simulated Registration Call')} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: theme.palette.secondary, color: 'white', border: 'none', borderRadius: '5px' }}>
                            {t('register_button')}
                        </button>
                    )}
                </div>
            );
        }

        // Main application layout would go here
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* Global Header/Navbar (e.g., from './components/Layout/Header') */}
                <header style={{ padding: '10px 20px', borderBottom: `1px solid ${theme.palette.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.palette.background, color: theme.palette.text }}>
                    <h2 style={{ margin: 0 }}>{t('app_name', { appName: 'Digital Archive' })} v{config.version}</h2>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {/* Search Bar with AI integration hook */}
                        {getFeatureFlag('aiSearch') && (
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '250px' }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const query = (e.target as HTMLInputElement).value;
                                        if (query) {
                                            alert(`AI-Powered Search for: ${query}`);
                                            trackEvent({ type: 'ai_search', payload: { query } });
                                        }
                                    }
                                }}
                            />
                        )}
                        <button onClick={toggleThemeMode} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                            {theme.mode === 'dark' ? '☀️' : '🌙'}
                        </button>
                        <select
                            value={currentLanguage}
                            onChange={(e) => changeLanguage(e.target.value)}
                            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {i18nSupportedLanguages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                        <span style={{ fontWeight: 'bold' }}>{authState.user?.username || t('guest')}</span>
                        <button onClick={logout} style={{ padding: '8px 15px', backgroundColor: theme.palette.accent, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            {t('logout_button')}
                        </button>
                    </div>
                </header>

                <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
                    {/* Sidebar/Navigation (e.g., from './components/Layout/Sidebar') */}
                    <nav style={{ width: '200px', borderRight: `1px solid ${theme.palette.accent}`, padding: '15px', backgroundColor: theme.palette.background }}>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: theme.palette.primary, textDecoration: 'none' }}>{t('my_files')}</a></li>
                            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: theme.palette.primary, textDecoration: 'none' }}>{t('shared_with_me')}</a></li>
                            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: theme.palette.primary, textDecoration: 'none' }}>{t('recent')}</a></li>
                            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: theme.palette.primary, textDecoration: 'none' }}>{t('starred')}</a></li>
                            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: theme.palette.primary, textDecoration: 'none' }}>{t('trash')}</a></li>
                            {getFeatureFlag('pluginMarketplace') && (
                                <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: theme.palette.primary, textDecoration: 'none' }}>{t('plugins')}</a></li>
                            )}
                            <li style={{ marginBottom: '10px' }}><a href="#" style={{ color: theme.palette.primary, textDecoration: 'none' }}>{t('settings')}</a></li>
                            {isOnline ?
                                <li style={{ color: 'green', fontSize: '0.9em' }}>{t('online_status')} ✅</li> :
                                <li style={{ color: 'orange', fontSize: '0.9em' }}>{t('offline_status')} ⚠️</li>
                            }
                            <button
                                onClick={syncData}
                                disabled={!isOnline || isSyncing || !getFeatureFlag('offlineMode')}
                                style={{
                                    marginTop: '10px',
                                    padding: '8px 15px',
                                    backgroundColor: getFeatureFlag('offlineMode') ? theme.palette.secondary : '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: getFeatureFlag('offlineMode') ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {isSyncing ? t('syncing_data') : t('sync_data_now')}
                            </button>
                        </ul>
                    </nav>

                    {/* Main Content Area */}
                    <main style={{ flexGrow: 1, padding: '20px', overflowY: 'auto', backgroundColor: 'var(--background-color)' }}>
                        {/* The FileBrowser now lives within this rich application shell */}
                        <FileBrowser />

                        {/* Example of dynamically added content by a plugin */}
                        {getAvailableIntegrations('dashboardWidgets').map((integration, index) => {
                            const WidgetComponent = integration.component;
                            return (
                                <div key={index} style={{ border: '1px dashed #ccc', padding: '10px', margin: '10px 0' }}>
                                    <h3 style={{ color: theme.palette.primary }}>{integration.metadata?.title || 'Plugin Widget'}</h3>
                                    <WidgetComponent {...integration.metadata?.props} />
                                </div>
                            );
                        })}
                    </main>
                </div>
                {/* Global Notification Display (e.g., from './components/UI/NotificationToast') */}
                <NotificationDisplay />
            </div>
        );
    };

    return renderContent();
};

// Simple component to display notifications (would be more complex in a real app)
export const NotificationDisplay: React.FC = () => {
    const { notifications, removeNotification } = useNotification();
    const { theme } = useTheme();

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        }}>
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '5px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        backgroundColor: notif.type === 'error' ? theme.palette.accent :
                            notif.type === 'warning' ? 'orange' :
                                notif.type === 'success' ? theme.palette.secondary :
                                    theme.palette.primary, // Using primary for info/default
                        color: 'white',
                        minWidth: '250px',
                        maxWidth: '350px',
                        cursor: notif.persistent ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        opacity: notif.read ? 0.7 : 1, // Dim if read
                    }}
                    onClick={() => !notif.persistent && removeNotification(notif.id)}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{notif.message}</span>
                        {!notif.persistent && (
                            <button
                                onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px', lineHeight: '1', padding: '0 5px' }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    {notif.actions && notif.actions.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                            {notif.actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); action.handler(); removeNotification(notif.id); }}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.5)',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


// --- The root render call, now orchestrating the entire application ---
const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <AppErrorBoundary>
                <ConfigProvider>
                    <NotificationProvider>
                        <AuthProvider>
                            <I18nProvider>
                                <TelemetryProvider> {/* Telemetry needs Auth for user ID */}
                                    <ThemeProvider> {/* Theme needs Config for defaults */}
                                        <AIIntegrationProvider> {/* AI needs Config for feature flags */}
                                            <OfflineSyncProvider> {/* Offline needs Notification and Config */}
                                                <PluginSystemProvider> {/* Plugin needs all other contexts for initializing plugins */}
                                                    <DigitalArchiveApp />
                                                </PluginSystemProvider>
                                            </OfflineSyncProvider>
                                        </AIIntegrationProvider>
                                    </ThemeProvider>
                                </TelemetryProvider>
                            </I18nProvider>
                        </AuthProvider>
                    </NotificationProvider>
                </ConfigProvider>
            </AppErrorBoundary>
        </React.StrictMode>
    );
}

// Example Plugin component (would be defined in its own file, but for demonstration)
export const SamplePluginWidget: React.FC<{ initialValue?: string }> = ({ initialValue = "Hello from Sample Plugin!" }) => {
    const [value, setValue] = useState(initialValue);
    const { theme } = useTheme();
    const { addNotification } = useNotification();
    const { t } = useI18n();

    const handleClick = () => {
        setValue(t('plugin_interaction_message'));
        addNotification({ message: t('plugin_notification'), type: 'info', duration: 2000 });
    };

    return (
        <div style={{
            border: `1px solid ${theme.palette.secondary}`,
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0,128,0,0.05)',
            marginBottom: '10px'
        }}>
            <p style={{ color: theme.palette.text }}>{value}</p>
            <button
                onClick={handleClick}
                style={{
                    padding: '8px 12px',
                    backgroundColor: theme.palette.secondary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {t('plugin_action')}
            </button>
        </div>
    );
};

// Example of how a plugin would register itself (simulated)
// This code would typically be in the plugin's own entryPoint.js file
// and would be executed dynamically upon loading the plugin.
export const initializeSamplePlugin = (api: {
    registerIntegration: (point: string, component: React.ComponentType | Function, meta?: Record<string, any>) => void;
    addNotification: NotificationContextType['addNotification'];
}) => {
    console.log('SamplePlugin: Initializing...');
    api.registerIntegration('dashboardWidgets', SamplePluginWidget, {
        title: 'Sample Plugin Dashboard Widget',
        sourcePluginId: 'sample-plugin-widget', // Important for unloading
        props: { initialValue: 'This is a dynamic plugin widget!' }
    });
    api.addNotification({ message: 'Sample Plugin has registered a dashboard widget.', type: 'success', duration: 3000 });
};