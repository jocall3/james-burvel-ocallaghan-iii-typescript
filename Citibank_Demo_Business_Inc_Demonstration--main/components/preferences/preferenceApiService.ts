/**
 * This module implements a robust, commercial-grade user preference management service designed for high-availability
 * and secure configuration within a modern financial ecosystem. It provides atomic, idempotent, and authorized
 * operations for fetching and updating user-specific settings. Business value: This service underpins a superior
 * user experience by ensuring consistent, personalized application behavior across all touchpoints, reducing
 * user friction and support costs. By integrating with the digital identity and agentic AI systems, it enables
 * proactive, intelligent customization, boosting user engagement and driving feature adoption. Its secure,
 * auditable design ensures compliance and protects sensitive user data, while performance optimizations
 * (e.g., optimistic locking, batch updates) contribute to operational efficiency and responsiveness,
 * essential for enterprise-grade financial applications.
 */

// Standard library imports and previously included modules.
// No external dependencies are introduced.
import { webcrypto } from 'crypto'; // Using Node.js crypto for UUID generation; compatible with browser window.crypto

/**
 * Defines the structure for user preferences, matching the keys used in UserPreferenceManager.
 * These settings control the user interface and notification behaviors, allowing for a personalized experience.
 */
export interface UserPreferences {
    userTheme: string;
    userLanguage: string;
    notificationsEnabled: boolean;
    denseLayout: boolean;
    animationEffects: boolean;
    fontSize: string;
    transactionConfirmationRequired: boolean; // Added for financial context
    dataExportFormat: 'CSV' | 'JSON' | 'PDF'; // Added for financial context
}

/**
 * Interface for a single preference update operation.
 */
export interface PreferenceUpdatePayload<K extends keyof UserPreferences = keyof UserPreferences> {
    key: K;
    value: UserPreferences[K];
}

/**
 * Interface for a batch of preference updates, designed for atomic application.
 */
export interface PreferenceUpdateBatchPayload {
    updates: Array<PreferenceUpdatePayload>;
}

/**
 * Configuration for the PreferenceApiService.
 */
export interface PreferenceServiceConfig {
    simulationMode: boolean;
    apiDelayMs: number;
    idempotencyWindowMs: number;
}

/**
 * Minimal interface for an authentication and authorization service dependency.
 * This is a placeholder for a real IdentityService within the larger codebase.
 */
interface IAuthService {
    getAuthToken(): Promise<string | null>;
    getCurrentUserId(): Promise<string | null>;
    hasPermission(userId: string, permission: string): Promise<boolean>;
}

/**
 * Custom error class for preference-related API operations.
 * Provides more specific error identification for robust error handling.
 */
export class PreferenceError extends Error {
    constructor(message: string, public code: string = 'PREF_ERR_UNKNOWN') {
        super(message);
        this.name = 'PreferenceError';
    }
}

// Simulate an API response delay to mimic network latency for both success and error paths.
const API_SIMULATION_DELAY_DEFAULT = 700; // milliseconds
// Time window within which an idempotency key is considered valid and its result cached.
const IDEMPOTENCY_WINDOW_MS_DEFAULT = 5 * 60 * 1000; // 5 minutes

/**
 * A self-contained, in-memory simulator for a backend preference store.
 * It manages the mock state, handles optimistic locking, idempotency, and basic validation,
 * ensuring deterministic and testable behavior for the PreferenceApiService.
 */
class PreferenceSimulatorBackend {
    private currentPreferences: UserPreferences;
    private etag: string; // Version identifier for optimistic locking
    private idempotencyCache = new Map<string, { timestamp: number; result: any }>();

    constructor() {
        this.currentPreferences = {
            userTheme: 'dark',
            userLanguage: 'en',
            notificationsEnabled: true,
            denseLayout: false,
            animationEffects: true,
            fontSize: 'medium',
            transactionConfirmationRequired: true,
            dataExportFormat: 'CSV',
        };
        this.etag = this.generateEtag();
    }

    /**
     * Generates a new ETag based on the current preferences state.
     * In a real system, this might be a hash of the data or a version number from a database.
     */
    private generateEtag(): string {
        // Use a simple timestamp + random for simulation. For production, a cryptographic hash or version counter is better.
        return `v${Date.now()}-${(webcrypto as any).randomUUID().substring(0, 8)}`;
    }

    /**
     * Cleans up expired entries from the idempotency cache.
     */
    private cleanIdempotencyCache(windowMs: number): void {
        const now = Date.now();
        for (const [key, { timestamp }] of this.idempotencyCache.entries()) {
            if (now - timestamp > windowMs) {
                this.idempotencyCache.delete(key);
            }
        }
    }

    /**
     * Simulates fetching all user preferences from the backend.
     * @returns {Promise<{ preferences: UserPreferences; etag: string }>} A promise that resolves with the user's current preferences and ETag.
     */
    async fetchPreferences(): Promise<{ preferences: UserPreferences; etag: string }> {
        // Deep copy to prevent external modification of internal state
        return Promise.resolve({
            preferences: { ...this.currentPreferences },
            etag: this.etag,
        });
    }

    /**
     * Simulates updating preferences, including optimistic locking and idempotency.
     * @param {PreferenceUpdatePayload[]} updates - An array of preference updates.
     * @param {string} [expectedEtag] - The ETag provided by the client for optimistic locking.
     * @param {string} [idempotencyKey] - An optional key for ensuring the operation is performed only once.
     * @param {number} idempotencyWindowMs - The time window for idempotency.
     * @returns {Promise<{ etag: string }>} A promise that resolves with the new ETag upon successful update.
     */
    async updatePreferences(
        updates: PreferenceUpdatePayload[],
        expectedEtag?: string,
        idempotencyKey?: string,
        idempotencyWindowMs: number = IDEMPOTENCY_WINDOW_MS_DEFAULT
    ): Promise<{ etag: string }> {
        this.cleanIdempotencyCache(idempotencyWindowMs);

        if (idempotencyKey && this.idempotencyCache.has(idempotencyKey)) {
            const cachedResult = this.idempotencyCache.get(idempotencyKey);
            console.log(`SIMULATOR: Idempotent operation for key ${idempotencyKey} returned cached result.`);
            return cachedResult!.result;
        }

        if (expectedEtag && expectedEtag !== this.etag) {
            const error = new PreferenceError(
                `Optimistic locking failed. Current ETag is ${this.etag}, but received ${expectedEtag}.`,
                'PREF_ERR_CONFLICT'
            );
            if (idempotencyKey) this.idempotencyCache.set(idempotencyKey, { timestamp: Date.now(), result: Promise.reject(error) });
            throw error;
        }

        // Simulate validation
        for (const { key, value } of updates) {
            if (!(key in this.currentPreferences)) {
                const error = new PreferenceError(`Invalid preference key: ${key}.`, 'PREF_ERR_BAD_REQUEST');
                if (idempotencyKey) this.idempotencyCache.set(idempotencyKey, { timestamp: Date.now(), result: Promise.reject(error) });
                throw error;
            }
            // Add more specific type/value validation here if needed
            // e.g., if (key === 'fontSize' && !['small', 'medium', 'large'].includes(value as string)) { ... }
        }

        // Apply updates
        let changesMade = false;
        for (const { key, value } of updates) {
            if (this.currentPreferences[key] !== value) {
                (this.currentPreferences[key] as any) = value;
                changesMade = true;
            }
        }

        if (changesMade) {
            this.etag = this.generateEtag(); // Update ETag if changes were applied
        }

        const result = Promise.resolve({ etag: this.etag });
        if (idempotencyKey) {
            this.idempotencyCache.set(idempotencyKey, { timestamp: Date.now(), result: result });
        }
        return result;
    }
}

/**
 * A minimal mock implementation of `IAuthService` for self-contained testing within this module.
 * In a production environment, this would be injected from the core Identity subsystem.
 */
class MockAuthService implements IAuthService {
    private mockToken: string | null = 'mock-user-token-abcdef123';
    private mockUserId: string | null = 'user-uuid-12345'; // Example user ID
    private userPermissions: Map<string, string[]> = new Map();

    constructor() {
        // Simulate permissions for our mock user
        this.userPermissions.set(this.mockUserId!, ['manage:preferences', 'view:preferences']);
    }

    async getAuthToken(): Promise<string | null> {
        return Promise.resolve(this.mockToken);
    }

    async getCurrentUserId(): Promise<string | null> {
        return Promise.resolve(this.mockUserId);
    }

    async hasPermission(userId: string, permission: string): Promise<boolean> {
        if (!userId) return Promise.resolve(false);
        const permissions = this.userPermissions.get(userId) || [];
        return Promise.resolve(permissions.includes(permission));
    }
}

/**
 * Provides an API for managing user preferences with commercial-grade features
 * such as authentication, authorization, optimistic locking, and idempotency.
 * It abstracts the underlying storage mechanism (simulated backend in this case)
 * and provides a robust interface for client applications.
 */
export class PreferenceApiService {
    private config: PreferenceServiceConfig;
    private simulator: PreferenceSimulatorBackend;
    private authService: IAuthService; // Dependency on an authentication service

    /**
     * Constructs the PreferenceApiService.
     * @param {Partial<PreferenceServiceConfig>} [config] - Optional configuration overrides.
     * @param {IAuthService} [authService] - An optional authentication service instance.
     *                                       If not provided, a mock is used for simulation.
     */
    constructor(
        config?: Partial<PreferenceServiceConfig>,
        authService?: IAuthService
    ) {
        this.config = {
            simulationMode: true,
            apiDelayMs: API_SIMULATION_DELAY_DEFAULT,
            idempotencyWindowMs: IDEMPOTENCY_WINDOW_MS_DEFAULT,
            ...config,
        };
        this.simulator = new PreferenceSimulatorBackend();
        this.authService = authService || new MockAuthService(); // Use mock if no real service provided
    }

    /**
     * Introduces a simulated network delay.
     * @returns {Promise<void>} A promise that resolves after the configured delay.
     */
    private async simulateDelay(): Promise<void> {
        if (this.config.simulationMode) {
            return new Promise(resolve => setTimeout(resolve, this.config.apiDelayMs));
        }
        // In live mode, this would be replaced with actual network calls.
        return Promise.resolve();
    }

    /**
     * Performs authentication and authorization checks.
     * @param {string} permission - The required permission for the operation.
     * @returns {Promise<string>} The authenticated user ID.
     * @throws {PreferenceError} If authentication fails or permission is denied.
     */
    private async authenticateAndAuthorize(permission: string): Promise<string> {
        const userId = await this.authService.getCurrentUserId();
        if (!userId) {
            console.warn(`PreferenceApiService: Authentication failed for permission '${permission}'. No user ID found.`);
            throw new PreferenceError('Authentication required.', 'PREF_ERR_UNAUTHENTICATED');
        }

        const isAuthorized = await this.authService.hasPermission(userId, permission);
        if (!isAuthorized) {
            console.warn(`PreferenceApiService: Authorization failed for user ${userId} for permission '${permission}'.`);
            throw new PreferenceError('Unauthorized access.', 'PREF_ERR_UNAUTHORIZED');
        }
        return userId;
    }

    /**
     * Simulates fetching all user preferences from a backend API.
     * Requires 'view:preferences' permission.
     *
     * @returns {Promise<{ preferences: UserPreferences; etag: string }>} A promise that resolves with the user's current preferences
     *                                      as retrieved from the backend, along with an ETag for optimistic locking.
     * @throws {PreferenceError} For authentication, authorization, or network errors.
     */
    public async fetchUserPreferences(): Promise<{ preferences: UserPreferences; etag: string }> {
        try {
            await this.authenticateAndAuthorize('view:preferences');
            await this.simulateDelay(); // Simulate network latency

            const { preferences, etag } = await this.simulator.fetchPreferences();
            console.log('API Service: Successfully fetched user preferences.');
            // Simulate metrics: preference_fetch_success_total.inc()
            return { preferences, etag };
        } catch (error: any) {
            console.error('API Service: Error fetching user preferences:', error.message);
            // Simulate metrics: preference_fetch_failure_total.inc()
            if (error instanceof PreferenceError) {
                throw error;
            }
            throw new PreferenceError('Failed to fetch user preferences from the server.', 'PREF_ERR_FETCH_FAILED');
        }
    }

    /**
     * Simulates updating a specific user preference on the backend API.
     * Supports optimistic locking and idempotency. Requires 'manage:preferences' permission.
     *
     * @param {keyof UserPreferences} key - The key of the preference to be updated.
     * @param {UserPreferences[K]} value - The new value for the specified preference.
     * @param {string} [etag] - Optional ETag for optimistic locking.
     * @param {string} [idempotencyKey] - An optional, unique key to ensure the operation is processed only once.
     * @returns {Promise<{ etag: string }>} A promise that resolves with the new ETag when the update is successful.
     * @throws {PreferenceError} For authentication, authorization, concurrency conflicts, validation, or network errors.
     */
    public async updateUserPreference<K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K],
        etag?: string,
        idempotencyKey?: string
    ): Promise<{ etag: string }> {
        return this.updateUserPreferencesBatch(
            { updates: [{ key, value }] },
            etag,
            idempotencyKey || (webcrypto as any).randomUUID() // Ensure an idempotency key is always used
        );
    }

    /**
     * Simulates atomically updating a batch of user preferences on the backend API.
     * Supports optimistic locking and idempotency. Requires 'manage:preferences' permission.
     * This provides transactional guarantees for multiple preference changes, ensuring all succeed or none do.
     *
     * @param {PreferenceUpdateBatchPayload} payload - An object containing an array of preference updates.
     * @param {string} [etag] - Optional ETag for optimistic locking.
     * @param {string} [idempotencyKey] - An optional, unique key to ensure the entire batch operation is processed only once.
     *                                      If not provided, a UUID will be generated.
     * @returns {Promise<{ etag: string }>} A promise that resolves with the new ETag when the batch update is successful.
     * @throws {PreferenceError} For authentication, authorization, concurrency conflicts, validation, or network errors.
     */
    public async updateUserPreferencesBatch(
        payload: PreferenceUpdateBatchPayload,
        etag?: string,
        idempotencyKey: string = (webcrypto as any).randomUUID()
    ): Promise<{ etag: string }> {
        try {
            await this.authenticateAndAuthorize('manage:preferences');
            await this.simulateDelay(); // Simulate network latency

            const { etag: newEtag } = await this.simulator.updatePreferences(
                payload.updates,
                etag,
                idempotencyKey,
                this.config.idempotencyWindowMs
            );

            console.log(`API Service: Successfully updated preferences for batch (idempotency key: ${idempotencyKey}).`);
            // Simulate metrics: preference_update_success_total.inc()
            return { etag: newEtag };
        } catch (error: any) {
            console.error(
                `API Service: Error updating preferences for batch (idempotency key: ${idempotencyKey}):`,
                error.message
            );
            // Simulate metrics: preference_update_failure_total.inc()
            if (error instanceof PreferenceError) {
                throw error;
            }
            throw new PreferenceError(
                `Failed to update preferences on the server for batch (idempotency key: ${idempotencyKey}).`,
                'PREF_ERR_UPDATE_FAILED'
            );
        }
    }
}

// Export a default instance for convenience, pre-configured for simulation.
// In a larger application, this would be managed by a dependency injection system.
export const preferenceApiService = new PreferenceApiService();

/**
 * Creates and returns a new instance of PreferenceApiService.
 * This factory function allows for flexible configuration and injection of dependencies,
 * making the service highly testable and adaptable to different environments (e.g., simulation vs. live).
 * @param {Partial<PreferenceServiceConfig>} [config] - Optional configuration overrides.
 * @param {IAuthService} [authService] - An optional authentication service instance.
 * @returns {PreferenceApiService} A new instance of the PreferenceApiService.
 */
export function createPreferenceApiService(
    config?: Partial<PreferenceServiceConfig>,
    authService?: IAuthService
): PreferenceApiService {
    return new PreferenceApiService(config, authService);
}