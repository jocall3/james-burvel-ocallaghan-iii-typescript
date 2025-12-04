/**
 * @description Defines the structure for user preferences, matching the keys used in UserPreferenceManager.
 */
export interface UserPreferences {
    userTheme: string;
    userLanguage: string;
    notificationsEnabled: boolean;
    denseLayout: boolean;
    animationEffects: boolean;
    fontSize: string;
}

// Simulate an API response delay to mimic network latency
const API_SIMULATION_DELAY = 700; // milliseconds

// In a real application, you would replace this with actual HTTP client configurations
// (e.g., Axios, Fetch API) and API endpoints.

/**
 * @description Simulates fetching all user preferences from a backend API.
 * This function would typically make an asynchronous HTTP GET request to a preferences endpoint.
 *
 * @returns {Promise<UserPreferences>} A promise that resolves with the user's current preferences
 *                                      as retrieved from the backend.
 */
export const fetchUserPreferences = async (): Promise<UserPreferences> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // Simulate a successful API call
                // In a real scenario, this data would come from the server
                const mockPreferences: UserPreferences = {
                    userTheme: 'dark',
                    userLanguage: 'en',
                    notificationsEnabled: true,
                    denseLayout: false,
                    animationEffects: true,
                    fontSize: 'medium',
                };
                console.log('API Service: Successfully fetched user preferences.');
                resolve(mockPreferences);
            } catch (error) {
                // Simulate an API error
                console.error('API Service: Error fetching user preferences:', error);
                reject(new Error('Failed to fetch user preferences from the server.'));
            }
        }, API_SIMULATION_DELAY);
    });
};

/**
 * @description Simulates updating a specific user preference on the backend API.
 * This function would typically make an asynchronous HTTP PUT or PATCH request
 * to update a single preference or a partial set of preferences.
 *
 * @param {keyof UserPreferences} key - The key of the preference to be updated (e.g., 'userTheme', 'fontSize').
 * @param {UserPreferences[K]} value - The new value for the specified preference.
 * @returns {Promise<void>} A promise that resolves when the update is successful, or rejects if an error occurs.
 */
export const updateUserPreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // Simulate a successful API call for updating
                console.log(`API Service: Successfully updated preference "${key}" to "${value}".`);
                // In a real application, you'd send this to your backend
                // e.g., axios.patch('/api/preferences', { [key]: value });
                resolve();
            } catch (error) {
                // Simulate an API error during update
                console.error(`API Service: Error updating preference "${key}":`, error);
                reject(new Error(`Failed to update preference "${key}" on the server.`));
            }
        }, API_SIMULATION_DELAY);
    });
};