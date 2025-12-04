// data/userProfiles.ts
import type { UserProfile, UserPreferences } from '../types';

/**
 * @description A list of mock user profiles within the organization. This data
 * is used in various administrative and security views to simulate a multi-user
 * environment.
 */
export const MOCK_USER_PROFILES: UserProfile[] = [
    { id: 'user_visionary', name: 'The Visionary', email: 'visionary@demobank.com', avatarUrl: '/avatars/visionary.png' },
    { id: 'user_alex_chen', name: 'Alex Chen', email: 'alex.c@quantum.corp', avatarUrl: '/avatars/alex.png' },
    { id: 'user_brenda_r', name: 'Brenda Rodriguez', email: 'brenda.r@quantum.corp', avatarUrl: '/avatars/brenda.png' },
    { id: 'user_analyst_1', name: 'Compliance Analyst 1', email: 'analyst1@demobank.com', avatarUrl: '/avatars/analyst1.png' },
];

/**
 * @description A map of user preferences, linking a user ID to their specific settings.
 * This demonstrates how personalization settings are stored and retrieved.
 */
export const MOCK_USER_PREFERENCES: Record<string, UserPreferences> = {
    'user_visionary': {
        theme: 'dark',
        notifications: { email: true, push: true },
    },
    'user_alex_chen': {
        theme: 'dark',
        notifications: { email: true, push: false },
    },
};
