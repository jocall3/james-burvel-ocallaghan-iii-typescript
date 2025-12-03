```typescript
import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';

// --- Global Type Definitions (Expanded) ---

/**
 * @typedef UIPersona
 * @description Defines various user interface personalities, influencing UI adaptations.
 */
export type UIPersona =
  | 'ANALYTICAL_INTROVERT'
  | 'CREATIVE_EXTRAVERT'
  | 'DEFAULT'
  | 'DECISIVE_LEADER'
  | 'COLLABORATIVE_OPTIMIZER'
  | 'EXPLORATORY_LEARNER'
  | 'MINIMALIST_EFFICIENCY'
  | 'VISUAL_ARTIST'
  | 'TASK_FOCUSED_PRAGMATIST' // New Persona: Prefers clear tasks and progress
  | 'SOCIAL_NETWORKER' // New Persona: Focuses on communication and connections
  | 'DATA_SCIENTIST' // New Persona: Deep data analysis, coding, visualization
  | 'BUSINESS_ANALYST' // New Persona: Report-driven, search, market insights
  | 'DEVELOPER_ENGINEER'; // New Persona: Code-centric, terminal, error monitoring

/**
 * @typedef UILayoutDensity
 * @description Defines the spacing and compactness of UI elements.
 */
export type UILayoutDensity = 'DENSE' | 'SPARSE' | 'HYBRID' | 'COMPACT' | 'GRID' | 'FLEX_ADAPTIVE'; // New options

/**
 * @typedef UIColorTheme
 * @description Defines available color themes for the UI.
 */
export type UIColorTheme = 'MONOCHROME' | 'VIBRANT' | 'DARK_MODERN' | 'LIGHT_CLASSIC' | 'HIGH_CONTRAST'
  | 'OCEANIC' // New Theme: Cool blues and greens
  | 'FOREST_CALM' // New Theme: Earthy greens and browns
  | 'SUNSET_GLOW' // New Theme: Warm oranges, purples, reds
  | 'CYBERPUNK_NEON'; // New Theme: Dark backgrounds with bright, electric accents

/**
 * @typedef UIFontPreference
 * @description Defines font styles for readability and aesthetic.
 */
export type UIFontPreference = 'SERIF' | 'SANS_SERIF' | 'MONOSPACE' | 'READABLE_DYSLEXIA' | 'FUN_CASUAL' | 'PROFESSIONAL'; // New options

/**
 * @typedef UIInteractionSpeed
 * @description Defines the responsiveness and animation speed of UI interactions.
 */
export type UIInteractionSpeed = 'FAST' | 'MEDIUM' | 'SLOW' | 'VERY_FAST' | 'ACCESSIBLE'; // New options

/**
 * @typedef UINavigationalStyle
 * @description Defines how users navigate through the application.
 */
export type UINavigationalStyle = 'TABBED' | 'SIDEBAR' | 'BREADCRUMBS' | 'COMMAND_PALETTE'
  | 'TOP_MENU_BAR' // New Style: Horizontal menu at the top
  | 'FLOATING_ACTION_BUTTON' // New Style: Primary actions via a floating button
  | 'MAGNIFYING_GLASS_SEARCH'; // New Style: Search-driven navigation

/**
 * @interface UIAccessibilityPreference
 * @description Comprehensive accessibility settings for the UI.
 */
export interface UIAccessibilityPreference {
  fontSizeScale: number; // e.g., 1.0, 1.2, 1.5
  contrastMode: 'DEFAULT' | 'HIGH_CONTRAST' | 'DARK_MODE_ONLY' | 'LIGHT_MODE_ONLY'; // New option
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: 'NONE' | 'PROTANOMALY' | 'DEUTERANOMALY' | 'TRITANOMALY'; // New: Specific color blindness types
  keyboardNavigationOnly: boolean; // New: Optimize for keyboard users
  audioCuesEnabled: boolean; // New: Provide auditory feedback
}

/**
 * @typedef UIComponentStrategy
 * @description Defines how UI components are loaded and rendered.
 */
export type UIComponentStrategy = 'LAZY_LOAD' | 'PRE_RENDER' | 'ON_DEMAND' | 'HYBRID_PRELOAD' | 'STREAMING'; // New options

/**
 * @typedef UIComponentSize
 * @description Defines the preferred size variant for components.
 */
export type UIComponentSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'FLEXIBLE'; // New

/**
 * @typedef UINotificationLevel
 * @description Defines the verbosity and intrusiveness of notifications.
 */
export type UINotificationLevel = 'NONE' | 'MINIMAL' | 'NORMAL' | 'OPTIONAL_SOUND' | 'AGGRESSIVE'; // New

/**
 * @typedef UIInformationDensity
 * @description Defines how much information is displayed per screen area.
 */
export type UIInformationDensity = 'LOW' | 'MEDIUM' | 'HIGH'; // New

/**
 * @typedef UIAnimationPreference
 * @description Defines the preference for UI animations.
 */
export type UIAnimationPreference = 'FULL' | 'REDUCED' | 'NONE'; // New

/**
 * @typedef UIIconographyStyle
 * @description Defines the visual style of icons used in the UI.
 */
export type UIIconographyStyle = 'FLAT' | 'OUTLINE' | 'FILLED' | 'SKEUMORPHIC'; // New

/**
 * @interface UIState
 * @description Represents the comprehensive state of the User Interface preferences and dynamic adaptations.
 * This interface is central to how the application's UI is rendered and behaves.
 */
export interface UIState {
  persona: UIPersona;
  layout: UILayoutDensity;
  colorTheme: UIColorTheme;
  fontPreference: UIFontPreference;
  interactionSpeed: UIInteractionSpeed;
  navigationalStyle: UINavigationalStyle;
  accessibility: UIAccessibilityPreference;
  componentSet: string[]; // e.g., ["DataGrid", "Chart"] vs ["MoodBoard", "Chat"]
  componentStrategy: UIComponentStrategy;
  lastUpdated: number; // Timestamp of the last update
  debugMode: boolean;
  manualOverrides: Partial<UIState>; // User-set overrides that take precedence
  componentSize: UIComponentSize; // New: Overall component sizing
  notificationLevel: UINotificationLevel; // New: How notifications behave
  informationDensity: UIInformationDensity; // New: How much content is shown
  animationPreference: UIAnimationPreference; // New: Animation verbosity
  iconographyStyle: UIIconographyStyle; // New: Icon aesthetic
  dataRefreshRate: 'REALTIME' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MANUAL'; // New: How often data refreshes
  language: string; // e.g., 'en-US', 'es-ES' // New: Current UI language
  timezone: string; // e.g., 'America/New_York' // New: Current user timezone
  metricSystem: 'IMPERIAL' | 'METRIC'; // New: Units of measurement
}

/**
 * @interface UserPermission
 * @description Defines a single permission entry for a user, granting specific action on a resource.
 */
export interface UserPermission {
  permissionId: string;
  resource: string; // e.g., 'project:123', 'user:profile', 'admin_panel'
  action: 'read' | 'write' | 'delete' | 'execute' | 'manage'; // e.g., 'read', 'write'
  grantedAt: number;
  expiresAt?: number; // Optional expiration timestamp
}

/**
 * @interface UserRole
 * @description Represents a role assigned to a user, which aggregates a set of permissions.
 */
export interface UserRole {
  roleId: string;
  name: string; // e.g., 'admin', 'project_manager'
  description: string;
  permissions: string[]; // Array of permissionIds or patterns for simplicity
}

/**
 * @interface UserProfile
 * @description Comprehensive user profile extending basic information with adaptive UI and application preferences.
 */
export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  firstName?: string; // New
  lastName?: string; // New
  organizationId?: string; // New: For multi-tenant applications
  department?: string; // New
  jobTitle?: string; // New
  avatarUrl?: string; // New
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'LOCKED'; // New: More detailed user status
  lastLogin: number;
  createdAt: number;
  uiPreferencesHistory: UIState[]; // History of applied UI states
  behavioralLogs: UserEvent[]; // Reference or subset of behavioral events
  featureFlags: { [key: string]: boolean }; // User-specific feature flag overrides
  subscriptions: string[]; // e.g., ['premium', 'pro_analytics']
  accessLevels: string[]; // e.g., ['admin', 'viewer', 'editor'] - legacy, moving to roles/permissions
  roles: string[]; // Array of roleIds // New: Role-based access control
  explicitPermissions: UserPermission[]; // Direct permissions // New: Fine-grained permissions
  activeABTests: { [testId: string]: string }; // { 'test_layout_v2': 'variant_A' }
  manualOverrides: Partial<UIState>; // User-set UI overrides that take precedence
  adaptiveLearningEnabled: boolean; // Flag to enable/disable UI adaptation
  personalizationEnabled: boolean; // New: General switch for all adaptive features (UI, recommendations, etc.)
  notificationSettings: { // New: User-specific notification preferences
    email: boolean;
    inApp: boolean;
    push: boolean;
    level: UINotificationLevel;
    doNotDisturb: {
      enabled: boolean;
      startTime?: string; // HH:mm format
      endTime?: string; // HH:mm format
    }
  };
  languagePreference: string; // New: 'en-US', 'es-ES', etc.
  timezonePreference: string; // New: 'America/New_York', 'Europe/London'
  onboardingStatus: { // New: Tracks user onboarding progress
    completedSteps: string[];
    lastStep: string;
    isComplete: boolean;
  };
  dataRetentionPolicy?: '30_DAYS' | '90_DAYS' | '1_YEAR' | 'NEVER'; // New: For privacy compliance
  settingsVersion: number; // New: To manage migrations of user settings
}

/**
 * @enum UserEventType
 * @description Enumeration of various types of user interactions and system events for logging.
 */
export type UserEventType =
  | 'CLICK'
  | 'VIEW'
  | 'INPUT'
  | 'SEARCH'
  | 'ERROR'
  | 'NAVIGATE'
  | 'SCROLL'
  | 'SESSION_START'
  | 'SESSION_END'
  | 'UI_CHANGE'
  | 'API_CALL'
  | 'DATA_EXPORT' // New
  | 'DATA_IMPORT' // New
  | 'DRAG_AND_DROP' // New
  | 'FORM_SUBMIT' // New
  | 'FILE_UPLOAD' // New
  | 'AUTHENTICATION' // New
  | 'PERMISSION_CHANGE' // New
  | 'SYSTEM_ALERT' // New
  | 'RECOMMENDATION_INTERACTION' // New
  | 'WORKFLOW_ACTION'; //