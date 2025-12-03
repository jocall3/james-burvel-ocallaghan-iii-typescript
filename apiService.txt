import {
    UserProfile,
    SystemHealth,
    Workspace,
    RecentActivityItem,
    AISuggestion,
    QuickAction,
    UserPreferences,
    ThemeMode,
    LanguageCode,
    UserStatus,
    getIcon, // To reuse icon mocking for placeholder
} from '../components/Sidebar'; // Import types and getIcon from Sidebar for consistency

/**
 * A mock base URL for the API. In a real application, this would point to a backend.
 */
const API_BASE_URL = 'https://api.galacticbank.com/v1';

/**
 * Simulates a network delay for asynchronous operations.
 * @param ms The delay in milliseconds.
 * @returns A promise that resolves after the specified delay.
 */
const simulateNetworkDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Provides a centralized API service for interacting with backend endpoints related
 * to user profiles, workspaces, system health, and other core application data.
 * This service uses mocked data and simulated network delays for demonstration.
 */
export class ApiService {

    /**
     * Fetches the user profile for a given user ID from the backend.
     * @param userId The ID of the user whose profile is to be fetched.
     * @returns A promise that resolves with the UserProfile data.
     * @throws Error if the user ID is not found in the mock data.
     */
    static async fetchUserProfile(userId: string): Promise<UserProfile> {
        await simulateNetworkDelay();
        if (userId === 'user-001') {
            return {
                id: 'user-001',
                name: 'Galactic Banker',
                avatarUrl: 'https://via.placeholder.com/150/00FFFF/FFFFFF?text=GB',
                status: 'online',
                unreadNotifications: 3,
                achievementsCount: 12,
                currentWorkspaceId: 'workspace-alpha',
                roles: ['admin', 'auditor', 'quantum-finance-specialist'],
                lastLogin: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                preferences: {
                    theme: 'dark',
                    language: 'en',
                    notificationSettings: { email: true, sms: false, inApp: true },
                    accessibility: { fontSize: 'medium', highContrast: false },
                },
            };
        } else if (userId === 'user-002') {
             return {
                id: 'user-002',
                name: 'Cosmic Accountant',
                avatarUrl: 'https://via.placeholder.com/150/800080/FFFFFF?text=CA',
                status: 'away',
                unreadNotifications: 1,
                achievementsCount: 8,
                currentWorkspaceId: 'workspace-beta',
                roles: ['analyst', 'treasurer'],
                lastLogin: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                preferences: {
                    theme: 'light',
                    language: 'es',
                    notificationSettings: { email: true, sms: true, inApp: false },
                    accessibility: { fontSize: 'small', highContrast: true },
                },
            };
        }
        throw new Error(`User with ID ${userId} not found.`);
    }

    /**
     * Updates an existing user profile with the provided partial data.
     * @param userId The ID of the user to update.
     * @param updates A partial object containing the fields to update in the user profile.
     * @returns A promise that resolves with the updated UserProfile data.
     * @throws Error if the user ID is not found.
     */
    static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        await simulateNetworkDelay();
        // In a real scenario, this would involve a PATCH or PUT request to the API.
        // For mock, we'll fetch an existing profile and merge updates.
        const existingProfile = await ApiService.fetchUserProfile(userId).catch(() => null);
        if (!existingProfile) {
            throw new Error(`User with ID ${userId} not found for update.`);
        }

        // Deep merge preferences to simulate realistic update behavior
        const updatedPreferences: UserPreferences = {
            ...existingProfile.preferences,
            ...(updates.preferences || {}),
            notificationSettings: {
                ...existingProfile.preferences.notificationSettings,
                ...(updates.preferences?.notificationSettings || {})
            },
            accessibility: {
                ...existingProfile.preferences.accessibility,
                ...(updates.preferences?.accessibility || {})
            }
        };

        return {
            ...existingProfile,
            ...updates,
            preferences: updatedPreferences,
        };
    }

    /**
     * Fetches the current system health status from the backend.
     * @returns A promise that resolves with the SystemHealth data.
     */
    static async fetchSystemHealth(): Promise<SystemHealth> {
        await simulateNetworkDelay(500); // System health might involve more checks, thus a slightly longer delay
        return {
            connection: 'online',
            apiStatus: 'operational',
            lastUpdateCheck: new Date().toISOString(),
            pendingUpdates: Math.floor(Math.random() * 2), // 0 or 1 pending updates
            resourceUsage: { cpu: Math.floor(Math.random() * 50) + 15, memory: Math.floor(Math.random() * 30) + 25 },
            securityAlerts: Math.random() > 0.9 ? 1 : 0, // Rarely a security alert
        };
    }

    /**
     * Fetches a list of all available workspaces.
     * @returns A promise that resolves with an array of Workspace objects.
     */
    static async fetchAllWorkspaces(): Promise<Workspace[]> {
        await simulateNetworkDelay();
        return [
            { id: 'workspace-alpha', name: 'Alpha Quadrant Ops', icon: getIcon('globe'), membersCount: 5, isFavorite: true },
            { id: 'workspace-beta', name: 'Beta Sector Analysis', icon: getIcon('chart'), membersCount: 12, isFavorite: false },
            { id: 'workspace-omega', name: 'Omega Protocol Dev', icon: getIcon('code'), membersCount: 8, isFavorite: true },
            { id: 'workspace-z', name: 'Zenith Strategic Planning', icon: getIcon('flag'), membersCount: 3, isFavorite: false },
        ];
    }

    /**
     * Creates a new workspace.
     * @param workspaceData The data required to create a new workspace (e.g., name, icon hint).
     * @returns A promise that resolves with the newly created Workspace object.
     */
    static async createWorkspace(workspaceData: { name: string; iconName?: string; isFavorite?: boolean }): Promise<Workspace> {
        await simulateNetworkDelay();
        // In a real API, the backend would assign a unique ID and potentially default values.
        return {
            id: `workspace-${Math.random().toString(36).substring(2, 11)}`, // Generate a unique mock ID
            name: workspaceData.name,
            icon: getIcon(workspaceData.iconName || 'folder'), // Use a default folder icon if not specified
            membersCount: 1, // The creator is the first member
            isFavorite: workspaceData.isFavorite ?? false,
        };
    }

    /**
     * Fetches a list of recent activities for the current user or context.
     * @returns A promise that resolves with an array of RecentActivityItem objects.
     */
    static async fetchRecentActivities(): Promise<RecentActivityItem[]> {
        await simulateNetworkDelay();
        return [
            { id: 'act-007', type: 'transaction', description: 'Initiated inter-galactic funds transfer #98765', timestamp: '2023-10-27T12:05:00Z', read: false },
            { id: 'act-008', type: 'report', description: 'Generated Q4 galactic market forecast', timestamp: '2023-10-27T11:50:00Z', read: true, link: '/reports/q4-market-forecast' },
            { id: 'act-009', type: 'alert', description: 'High-priority security alert in sector X-5', timestamp: '2023-10-27T11:20:00Z', read: false },
            { id: 'act-010', type: 'message', description: 'Replied to board discussion on new expansion strategy', timestamp: '2023-10-27T10:45:00Z', read: true },
        ];
    }

    /**
     * Fetches AI suggestions tailored to the current user's activity or system state.
     * @returns A promise that resolves with an array of AISuggestion objects.
     */
    static async fetchAiSuggestions(): Promise<AISuggestion[]> {
        await simulateNetworkDelay(700); // AI processing might be slower
        return [
            { id: 'ai-006', type: 'report', label: 'Draft comprehensive risk assessment for asteroid mining venture', icon: getIcon('flask'), action: () => alert('AI Suggestion: Draft Risk Assessment!'), confidence: 0.93, context: 'based on recent project proposals' },
            { id: 'ai-007', type: 'action', label: 'Schedule quarterly performance review with Alpha team', icon: getIcon('calendar'), action: () => alert('AI Suggestion: Schedule Review!'), confidence: 0.89, context: 'upcoming administrative tasks' },
            { id: 'ai-008', type: 'insight', label: 'Identify optimal trade routes for Xenon gas', icon: getIcon('truck'), action: () => alert('AI Suggestion: Optimize Trade Routes!'), confidence: 0.96, context: 'market analysis detected opportunity' },
        ];
    }

    /**
     * Fetches a predefined list of quick actions available to the user.
     * @returns A promise that resolves with an array of QuickAction objects.
     */
    static async fetchQuickActions(): Promise<QuickAction[]> {
        await simulateNetworkDelay(200);
        return [
            { id: 'new-deposit', label: 'Initiate New Deposit', icon: getIcon('wallet'), action: () => alert('New Deposit Form!') },
            { id: 'view-ledger', label: 'Access Quantum Ledger', icon: getIcon('book'), action: () => alert('Quantum Ledger Opened!') },
            { id: 'contact-support', label: 'Contact Support', icon: getIcon('support'), action: () => alert('Opening Support Chat!') },
        ];
    }

    // Additional API methods could be added here for other domain-specific data.
    // E.g., fetchNotifications(), searchGlobal(), etc.
}