// types/models/user/preferences.ts
export interface UserPreferences {
    theme: 'dark' | 'light';
    notifications: {
        email: boolean;
        push: boolean;
    };
}
