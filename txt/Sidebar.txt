import React, { useState, useMemo, useEffect, useCallback, createContext, useContext } from 'react';
import { View } from '../types';
import { NAV_ITEMS, NavItem } from '../constants';

// --- NEW TYPES AND INTERFACES (Simulating a larger ecosystem) ---

export type UserStatus = 'online' | 'away' | 'busy' | 'offline' | 'incognito';
export type ThemeMode = 'light' | 'dark' | 'system';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

export interface UserProfile {
    id: string;
    name: string;
    avatarUrl: string;
    status: UserStatus;
    unreadNotifications: number;
    achievementsCount: number;
    currentWorkspaceId: string;
    roles: string[]; // e.g., ['admin', 'analyst']
    lastLogin: string; // ISO string
    preferences: UserPreferences;
}

export interface UserPreferences {
    theme: ThemeMode;
    language: LanguageCode;
    notificationSettings: {
        email: boolean;
        sms: boolean;
        inApp: boolean;
    };
    accessibility: {
        fontSize: 'small' | 'medium' | 'large';
        highContrast: boolean;
    };
}

export interface SystemHealth {
    connection: 'online' | 'offline' | 'degraded';
    apiStatus: 'operational' | 'degraded' | 'maintenance';
    lastUpdateCheck: string; // ISO string
    pendingUpdates: number;
    resourceUsage: { cpu: number; memory: number; }; // Percentage
    securityAlerts: number;
}

export interface Workspace {
    id: string;
    name: string;
    icon: React.ReactElement;
    membersCount: number;
    isFavorite: boolean;
}

export interface QuickAction {
    id: string;
    label: string;
    icon: React.ReactElement;
    action: () => void;
    requiresPermission?: string[];
}

export interface RecentActivityItem {
    id: string;
    type: 'transaction' | 'document' | 'report' | 'message' | 'alert' | 'login';
    description: string;
    timestamp: string; // ISO string
    link?: string;
    read: boolean;
}

export interface AISuggestion {
    id: string;
    type: 'module' | 'action' | 'report' | 'insight' | 'proactive_alert';
    label: string;
    icon: React.ReactElement;
    action: () => void;
    confidence: number; // 0-1
    context: string; // e.g., "based on your recent activity"
}

export interface GlobalSearchConfig {
    placeholder: string;
    scopeOptions: { id: string; label: string; }[];
    defaultScope: string;
    onSearchSubmit: (term: string, scope: string) => void;
}

// Global App Context (simulated) for user preferences and system data
interface AppContextType {
    user: UserProfile | null;
    systemHealth: SystemHealth;
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    themeMode: ThemeMode;
    language: LanguageCode;
    setUser: (user: UserProfile) => void;
    setSystemHealth: (health: SystemHealth) => void;
    setCurrentWorkspace: (workspace: Workspace) => void;
    setThemeMode: (mode: ThemeMode) => void;
    setLanguage: (lang: LanguageCode) => void;
    openCommandPalette: () => void; // A function to trigger a global command palette
    triggerNotification: (message: string, type?: 'info' | 'warning' | 'error' | 'success') => void;
    trackEvent: (eventName: string, properties?: Record<string, any>) => void;
    availableQuickActions: QuickAction[];
    recentActivities: RecentActivityItem[];
    aiSuggestions: AISuggestion[];
    searchConfig: GlobalSearchConfig;
}

// Dummy context for demonstration
const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook to use the context (simulated)
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        // In a real app, this would be provided higher up
        // For this large expansion, we'll mock a default value to avoid runtime errors,
        // but note this is not ideal for actual application state management.
        console.warn('AppContext is not provided. Using dummy context values.');
        return {
            user: {
                id: 'user-001',
                name: 'Galactic Banker',
                avatarUrl: 'https://via.placeholder.com/150/00FFFF/FFFFFF?text=GB',
                status: 'online',
                unreadNotifications: 3,
                achievementsCount: 12,
                currentWorkspaceId: 'workspace-alpha',
                roles: ['admin', 'auditor', 'quantum-finance-specialist'],
                lastLogin: new Date().toISOString(),
                preferences: {
                    theme: 'dark',
                    language: 'en',
                    notificationSettings: { email: true, sms: false, inApp: true },
                    accessibility: { fontSize: 'medium', highContrast: false },
                },
            },
            systemHealth: {
                connection: 'online',
                apiStatus: 'operational',
                lastUpdateCheck: new Date().toISOString(),
                pendingUpdates: 0,
                resourceUsage: { cpu: 25, memory: 40 },
                securityAlerts: 0,
            },
            workspaces: [
                { id: 'workspace-alpha', name: 'Alpha Quadrant Ops', icon: getIcon('globe'), membersCount: 5, isFavorite: true },
                { id: 'workspace-beta', name: 'Beta Sector Analysis', icon: getIcon('chart'), membersCount: 12, isFavorite: false },
            ],
            currentWorkspace: { id: 'workspace-alpha', name: 'Alpha Quadrant Ops', icon: getIcon('globe'), membersCount: 5, isFavorite: true },
            themeMode: 'dark',
            language: 'en',
            setUser: () => {},
            setSystemHealth: () => {},
            setCurrentWorkspace: () => {},
            setThemeMode: () => {},
            setLanguage: () => {},
            openCommandPalette: () => alert('Command Palette would open!'),
            triggerNotification: (msg) => alert(`Notification: ${msg}`),
            trackEvent: (eventName, props) => console.log(`Event tracked: ${eventName}`, props),
            availableQuickActions: [
                { id: 'new-transaction', label: 'New Transaction', icon: getIcon('wallet'), action: () => alert('New Transaction!') },
                { id: 'upload-doc', label: 'Upload Document', icon: getIcon('upload'), action: () => alert('Upload Document!') },
                { id: 'create-report', label: 'Generate Report', icon: getIcon('chart'), action: () => alert('Generate Report!') },
            ],
            recentActivities: [
                { id: 'act-001', type: 'transaction', description: 'Processed interstellar transfer #34567', timestamp: '2023-10-27T10:00:00Z', read: false },
                { id: 'act-002', type: 'document', description: 'Updated quantum ledger protocol v2.1', timestamp: '2023-10-27T09:30:00Z', read: true },
            ],
            aiSuggestions: [
                { id: 'ai-001', type: 'report', label: 'Review Q3 Galactic Performance', icon: getIcon('chart'), action: () => alert('AI Suggestion: Q3 Report!'), confidence: 0.95, context: 'based on your executive role' },
                { id: 'ai-002', type: 'action', label: 'Optimize Mars Colony Investment', icon: getIcon('globe'), action: () => alert('AI Suggestion: Optimize Investment!'), confidence: 0.88, context: 'high-priority alert' },
            ],
            searchConfig: {
                placeholder: "Search the Multiverse...",
                scopeOptions: [
                    { id: 'all', label: 'All Systems' },
                    { id: 'documents', label: 'Documents' },
                    { id: 'transactions', label: 'Transactions' },
                    { id: 'personnel', label: 'Personnel' },
                    { id: 'knowledge', label: 'Knowledge Base' },
                    { id: 'quantum', label: 'Quantum Ledger' },
                ],
                defaultScope: 'all',
                onSearchSubmit: (term, scope) => alert(`Searching for "${term}" in "${scope}"`),
            }
        } as AppContextType; // Cast to ensure type compatibility
    }
    return context;
};

// --- NEW HELPER FUNCTIONS AND UTILITIES ---

export function getIcon(name: string, className?: string) {
    // A more advanced icon resolver that could load icons dynamically
    // For now, simple placeholders or common icons for visual expansion
    const defaultClass = className || 'h-5 w-5';
    switch (name) {
        case 'user': return <svg className={defaultClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
        case 'settings': return <svg className={defaultClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724