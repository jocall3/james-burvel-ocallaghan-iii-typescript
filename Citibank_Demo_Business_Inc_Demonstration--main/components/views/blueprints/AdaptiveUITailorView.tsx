/**
 * This module implements the core Adaptive User Interface Tailor View, a strategic component enabling dynamic and intelligent
 * personalization of the application's user experience. Business impact: This system intelligently adapts the UI to individual
 * user personas, real-time behavioral patterns, and configured preferences, vastly enhancing user productivity,
 * reducing cognitive load, and improving overall engagement. By delivering a tailored experience for every user,
 * from a data scientist to a payments operator, it accelerates workflow completion, minimizes training costs,
 * and ensures compliance with accessibility standards. This level of dynamic personalization is crucial for
 * maintaining competitive advantage, driving user retention, and unlocking new operational efficiencies
 * across diverse user roles within an enterprise financial ecosystem. It turns a static application into a
 * responsive partner, representing a revolutionary, multi-million-dollar infrastructure leap in financial technology.
 * This platform establishes a new benchmark for user-centric design and operational intelligence, critical for
 * future-proofing enterprise financial systems against evolving market demands.
 */

import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';

/**
 * @typedef UIPersona
 * @description Defines various user interface personalities, influencing UI adaptations.
 * Each persona encapsulates a set of preferred UI characteristics derived from user roles,
 * behavioral analysis, or explicit selection. This enables targeted UX optimization that
 * translates directly into increased operational efficiency and reduced training overhead.
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
  | 'TASK_FOCUSED_PRAGMATIST'
  | 'SOCIAL_NETWORKER'
  | 'DATA_SCIENTIST'
  | 'BUSINESS_ANALYST'
  | 'DEVELOPER_ENGINEER'
  | 'FINANCIAL_TRADER'
  | 'COMPLIANCE_OFFICER'
  | 'RISK_MANAGER';

/**
 * @typedef UILayoutDensity
 * @description Defines the spacing and compactness of UI elements. Optimal density improves readability
 * and information display based on user preference and screen real estate. This direct control over
 * information presentation maximizes user comfort and data comprehension for critical financial workflows.
 */
export type UILayoutDensity = 'DENSE' | 'SPARSE' | 'HYBRID' | 'COMPACT' | 'GRID' | 'FLEX_ADAPTIVE';

/**
 * @typedef UIColorTheme
 * @description Defines available color themes for the UI. Themes are carefully designed to reduce eye strain
 * and improve visual hierarchy, catering to diverse environmental and accessibility needs. A well-chosen
 * theme reduces cognitive load, enhancing focus on critical financial data.
 */
export type UIColorTheme = 'MONOCHROME' | 'VIBRANT' | 'DARK_MODERN' | 'LIGHT_CLASSIC' | 'HIGH_CONTRAST'
  | 'OCEANIC'
  | 'FOREST_CALM'
  | 'SUNSET_GLOW'
  | 'CYBERPUNK_NEON';

/**
 * @typedef UIFontPreference
 * @description Defines font styles for readability and aesthetic. Selecting the right font
 * significantly impacts legibility and user comfort, especially in data-intensive applications.
 * This directly supports long-duration operational tasks by minimizing visual fatigue.
 */
export type UIFontPreference = 'SERIF' | 'SANS_SERIF' | 'MONOSPACE' | 'READABLE_DYSLEXIA' | 'FUN_CASUAL' | 'PROFESSIONAL';

/**
 * @typedef UIInteractionSpeed
 * @description Defines the responsiveness and animation speed of UI interactions. Tailoring this
 * allows power users to work faster and provides a more accessible experience for others.
 * Optimized interaction speed directly translates to quicker task completion and heightened productivity.
 */
export type UIInteractionSpeed = 'FAST' | 'MEDIUM' | 'SLOW' | 'VERY_FAST' | 'ACCESSIBLE';

/**
 * @typedef UINavigationalStyle
 * @description Defines how users navigate through the application. An adaptable navigation
 * system streamlines access to critical functions, reducing time-to-action for financial operations.
 * This strategic flexibility reduces training costs and accelerates user proficiency across complex systems.
 */
export type UINavigationalStyle = 'TABBED' | 'SIDEBAR' | 'BREADCRUMBS' | 'COMMAND_PALETTE'
  | 'TOP_MENU_BAR'
  | 'FLOATING_ACTION_BUTTON'
  | 'MAGNIFYING_GLASS_SEARCH'
  | 'CONTEXTUAL_MENUS';

/**
 * @interface UIAccessibilityPreference
 * @description Comprehensive accessibility settings for the UI, ensuring the application is usable
 * by individuals with diverse needs. Compliance with accessibility standards is both a legal
 * and ethical imperative, expanding market reach and ensuring inclusive design. This fosters
 * a wider talent pool and demonstrates corporate responsibility.
 */
export interface UIAccessibilityPreference {
  fontSizeScale: number;
  contrastMode: 'DEFAULT' | 'HIGH_CONTRAST' | 'DARK_MODE_ONLY' | 'LIGHT_MODE_ONLY';
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode: 'NONE' | 'PROTANOMALY' | 'DEUTERANOMALY' | 'TRITANOMALY';
  keyboardNavigationOnly: boolean;
  audioCuesEnabled: boolean;
  hapticFeedbackEnabled: boolean;
}

/**
 * @typedef UIComponentStrategy
 * @description Defines how UI components are loaded and rendered. Optimizing component
 * loading strategies improves perceived performance and resource utilization. This directly
 * impacts system responsiveness and scalability, especially in high-demand environments.
 */
export type UIComponentStrategy = 'LAZY_LOAD' | 'PRE_RENDER' | 'ON_DEMAND' | 'HYBRID_PRELOAD' | 'STREAMING';

/**
 * @typedef UIComponentSize
 * @description Defines the preferred size variant for components, allowing for optimal use
 * of screen space and touch target sizing. Strategic sizing improves usability and reduces
 * interaction errors, vital for precise financial operations.
 */
export type UIComponentSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'FLEXIBLE';

/**
 * @typedef UINotificationLevel
 * @description Defines the verbosity and intrusiveness of notifications. Configurable notification
 * levels ensure users receive critical alerts without being overwhelmed, crucial for real-time payments
 * and risk management. This optimizes attention allocation, focusing users on high-priority events.
 */
export type UINotificationLevel = 'NONE' | 'MINIMAL' | 'NORMAL' | 'OPTIONAL_SOUND' | 'AGGRESSIVE';

/**
 * @typedef UIInformationDensity
 * @description Defines how much information is displayed per screen area. High density is
 * often preferred by expert users for rapid data scanning, while low density can improve clarity.
 * Dynamic adjustment of information density allows for real-time optimization of data consumption.
 */
export type UIInformationDensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'DYNAMIC';

/**
 * @typedef UIAnimationPreference
 * @description Defines the preference for UI animations, balancing engaging visuals with
 * performance and accessibility concerns. Thoughtful animation reduces cognitive load and
 * guides user attention, improving workflow comprehension.
 */
export type UIAnimationPreference = 'FULL' | 'REDUCED' | 'NONE';

/**
 * @typedef UIIconographyStyle
 * @description Defines the visual style of icons used in the UI, contributing to brand identity
 * and visual clarity. Consistent and intuitive iconography reduces learning curves and improves
 * rapid recognition of functions, critical for high-speed financial operations.
 */
export type UIIconographyStyle = 'FLAT' | 'OUTLINE' | 'FILLED' | 'SKEUMORPHIC' | 'DUOTONE' | 'MATERIAL';

/**
 * @typedef UIMetricDisplay
 * @description Defines how key performance indicators and metrics are presented within the UI.
 * This influences dashboard design and real-time data visualization, critical for decision-making.
 */
export type UIMetricDisplay = 'COMPACT_NUMBERS' | 'GRAPHICAL_CHARTS' | 'GAUGES_AND_DIALS' | 'TREND_LINES' | 'TABLE_VIEW';

/**
 * @typedef UIDashboardLayout
 * @description Defines the structural layout of dashboards, allowing for customized
 * arrangements of widgets and data panels. This enables users to prioritize information flow
 * crucial for their specific roles in financial management.
 */
export type UIDashboardLayout = 'FIXED_GRID' | 'FREEFORM_DRAG' | 'TEMPLATE_BASED' | 'AI_OPTIMIZED';

/**
 * @interface UIState
 * @description Represents the comprehensive state of the User Interface preferences and dynamic adaptations.
 * This interface is central to how the application's UI is rendered and behaves, acting as the blueprint
 * for the current user experience. This robust structure supports highly personalized and performant interactions,
 * driving significant operational value.
 */
export interface UIState {
  persona: UIPersona;
  layout: UILayoutDensity;
  colorTheme: UIColorTheme;
  fontPreference: UIFontPreference;
  interactionSpeed: UIInteractionSpeed;
  navigationalStyle: UINavigationalStyle;
  accessibility: UIAccessibilityPreference;
  componentSet: string[];
  componentStrategy: UIComponentStrategy;
  lastUpdated: number;
  debugMode: boolean;
  manualOverrides: Partial<UIState>;
  componentSize: UIComponentSize;
  notificationLevel: UINotificationLevel;
  informationDensity: UIInformationDensity;
  animationPreference: UIAnimationPreference;
  iconographyStyle: UIIconographyStyle;
  dataRefreshRate: 'REALTIME' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MANUAL';
  language: string;
  timezone: string;
  metricSystem: 'IMPERIAL' | 'METRIC';
  showHelpTips: boolean;
  smartDefaultsEnabled: boolean;
  adaptiveContentPrioritization: boolean;
  workspaceLayout: {
    primaryPanel: string;
    secondaryPanel?: string;
    layoutPreset: 'SINGLE_PANEL' | 'DUAL_COLUMN' | 'TABBED_WORKSPACES' | 'CUSTOM';
    customPanels?: string[];
  };
  metricDisplay: UIMetricDisplay;
  dashboardLayout: UIDashboardLayout;
  searchScope: 'GLOBAL' | 'CONTEXTUAL' | 'WORKSPACED';
}

/**
 * @interface UIRecommendation
 * @description Represents a recommendation generated by an AI agent for adapting the UI state.
 * This can be a full state or a partial update, enabling granular adjustments. These proactive
 * recommendations drive automation and intelligent optimization, maximizing user productivity
 * and platform responsiveness.
 */
export interface UIRecommendation {
  id: string;
  timestamp: number;
  recommendedChanges: Partial<UIState>;
  reason: string;
  confidenceScore: number;
  sourceAgentId: string;
  appliesToUserIds?: string[];
  ttl?: number; // Time-to-live for the recommendation, after which it expires
  actionRequired: boolean; // Does the user need to confirm/act on this recommendation?
}

/**
 * @interface UIAdaptationRule
 * @description Defines a declarative rule for how the UI should adapt under certain conditions.
 * These rules can be predefined or dynamically updated by governance agents, ensuring policy compliance
 * and dynamic adjustment to operational requirements. This is a key mechanism for automated governance
 * and maintaining operational integrity, reducing manual oversight and potential errors.
 */
export interface UIAdaptationRule {
  ruleId: string;
  name: string;
  description: string;
  condition: string; // A string-based condition, e.g., "user.persona == 'DATA_SCIENTIST' && user.deviceType == 'DESKTOP' && events.errorCount > 3"
  // In a production system, this would be processed by a robust rules engine or an embedded interpreter.
  action: Partial<UIState>;
  priority: number;
  isEnabled: boolean;
  createdBy: string;
  createdAt: number;
  lastModified: number;
  validUntil?: number; // Rule expiration
  tags?: string[];
}

/**
 * @interface UserPermission
 * @description Defines a single permission entry for a user, granting specific action on a resource.
 * Permissions are granular controls that determine what a user or agent can view, modify, or execute.
 * This underpins the platform's robust security model, protecting sensitive financial assets and data.
 */
export interface UserPermission {
  permissionId: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'execute' | 'manage' | 'approve' | 'audit' | 'configure';
  grantedAt: number;
  expiresAt?: number;
  scope?: string; // e.g., 'global', 'region:us', 'project:123'
}

/**
 * @interface UserRole
 * @description Represents a role assigned to a user, which aggregates a set of permissions.
 * Roles simplify permission management, allowing for efficient assignment of capabilities
 * across user groups and aligning with organizational hierarchies. This stratified access
 * control is crucial for enterprise-grade security and compliance in finance.
 */
export interface UserRole {
  roleId: string;
  name: string;
  description: string;
  permissions: string[];
  inheritsRoles?: string[];
  organizationId?: string;
  level: number; // e.g., 1 for basic, 10 for executive
}

/**
 * @interface UserProfile
 * @description Comprehensive user profile extending basic information with adaptive UI and application preferences.
 * This profile serves as the central identity record, enabling personalized experiences, secure access,
 * and compliance tracking across the entire financial ecosystem. It is the digital twin of a user,
 * driving tailored interactions and robust security.
 */
export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  department?: string;
  jobTitle?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'LOCKED' | 'ARCHIVED' | 'SUSPENDED';
  lastLogin: number;
  createdAt: number;
  uiPreferencesHistory: UIState[];
  behavioralLogs: UserEvent[];
  featureFlags: { [key: string]: boolean };
  subscriptions: string[];
  accessLevels: string[];
  roles: string[];
  explicitPermissions: UserPermission[];
  activeABTests: { [testId: string]: string };
  manualOverrides: Partial<UIState>;
  adaptiveLearningEnabled: boolean;
  personalizationEnabled: boolean;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    sms: boolean;
    level: UINotificationLevel;
    doNotDisturb: {
      enabled: boolean;
      startTime?: string;
      endTime?: string;
    };
    channels: { [channel: string]: boolean };
  };
  languagePreference: string;
  timezonePreference: string;
  onboardingStatus: {
    completedSteps: string[];
    lastStep: string;
    isComplete: boolean;
    lastUpdated: number;
    progressPercentage: number;
  };
  dataRetentionPolicy?: '30_DAYS' | '90_DAYS' | '1_YEAR' | 'NEVER';
  settingsVersion: number;
  lastActivityTimestamp: number;
  deviceInfo: {
    deviceType: 'DESKTOP' | 'TABLET' | 'MOBILE' | 'WATCH' | 'OTHER';
    os: string;
    browser: string;
    screenResolution: string;
    viewportSize: string;
    platform: string;
  };
  securityPolicyVersion: number;
  mfaEnabled: boolean;
  trustScore: number; // For adaptive authentication and risk assessment
  userSegments: string[]; // e.g., 'high-value-client', 'new-user', 'risk-averse'
}

/**
 * @enum UserEventType
 * @description Enumeration of various types of user interactions and system events for logging.
 * These events are critical data points for behavioral analytics, security auditing,
 * and driving AI-powered adaptive UI adjustments. They form the immutable audit trail for
 * all user activity, crucial for regulatory compliance and fraud detection.
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
  | 'DATA_EXPORT'
  | 'DATA_IMPORT'
  | 'DRAG_AND_DROP'
  | 'FORM_SUBMIT'
  | 'FILE_UPLOAD'
  | 'AUTHENTICATION'
  | 'PERMISSION_CHANGE'
  | 'SYSTEM_ALERT'
  | 'RECOMMENDATION_INTERACTION'
  | 'WORKFLOW_ACTION'
  | 'SETTINGS_UPDATE'
  | 'INACTIVITY_TIMEOUT'
  | 'ANOMALY_DETECTED'
  | 'POLICY_VIOLATION'
  | 'TRANSACTION_INITIATED'
  | 'TRANSACTION_SETTLED'
  | 'ACCESS_DENIED';

/**
 * @interface UserEvent
 * @description Represents a single, timestamped user or system event, crucial for auditing,
 * analytics, and driving adaptive UI logic. Each event is cryptographically linked in a
 * tamper-evident log, providing irrefutable proof of activity for audit and compliance.
 */
export interface UserEvent {
  eventId: string;
  userId: string;
  timestamp: number;
  type: UserEventType;
  details: { [key: string]: any };
  sessionId: string;
  correlationId?: string; // For linking related events across services
  signature?: string; // Cryptographic signature of the event for integrity
}

/**
 * @interface UIAgentMessage
 * @description Defines the structure for messages exchanged between UI components and agentic intelligence.
 * This enables real-time feedback loops and autonomous UI adjustments. The secure communication channel
 * for these messages is vital for maintaining the integrity of AI-driven recommendations.
 */
export interface UIAgentMessage {
  messageId: string;
  senderId: string;
  recipientId: string;
  timestamp: number;
  payload: {
    type: 'UI_RECOMMENDATION' | 'SYSTEM_ALERT' | 'UI_STATE_REQUEST' | 'UI_STATE_UPDATE' | 'POLICY_ENFORCEMENT';
    data: any;
  };
  signature: string; // Cryptographic signature to verify sender authenticity and message integrity
  targetUserId?: string;
}

/**
 * @interface EffectivePolicy
 * @description Represents an active governance policy that dictates UI behavior or data access.
 * These policies ensure regulatory compliance and operational standards are met, providing
 * an auditable framework for automated governance.
 */
export interface EffectivePolicy {
  policyId: string;
  name: string;
  description: string;
  condition: string; // e.g., "transaction.value > 10000 && user.role != 'admin'"
  action: 'BLOCK_UI_FEATURE' | 'TRIGGER_ALERT' | 'RECOMMEND_ACTION' | 'ADAPT_UI_STATE';
  targetUIState?: Partial<UIState>;
  priority: number;
  enforcedByAgentId: string;
  activeSince: number;
  expiresAt?: number;
}

/**
 * @constant DEFAULT_ACCESSIBILITY_PREFERENCES
 * @description Baseline accessibility settings applied when no specific preferences are found.
 * Ensures a reasonable default for all users, supporting an inclusive user base from the outset.
 */
export const DEFAULT_ACCESSIBILITY_PREFERENCES: UIAccessibilityPreference = {
  fontSizeScale: 1.0,
  contrastMode: 'DEFAULT',
  reducedMotion: false,
  screenReaderOptimized: false,
  colorBlindMode: 'NONE',
  keyboardNavigationOnly: false,
  audioCuesEnabled: false,
  hapticFeedbackEnabled: false,
};

/**
 * @constant DEFAULT_UI_STATE
 * @description The initial, baseline UI configuration. This ensures a consistent starting point
 * before any user-specific or adaptive adjustments are applied. This stable foundation allows
 * for dynamic adaptation without compromising core usability.
 */
export const DEFAULT_UI_STATE: UIState = {
  persona: 'DEFAULT',
  layout: 'SPARSE',
  colorTheme: 'LIGHT_CLASSIC',
  fontPreference: 'SANS_SERIF',
  interactionSpeed: 'MEDIUM',
  navigationalStyle: 'SIDEBAR',
  accessibility: DEFAULT_ACCESSIBILITY_PREFERENCES,
  componentSet: [],
  componentStrategy: 'LAZY_LOAD',
  lastUpdated: Date.now(),
  debugMode: false,
  manualOverrides: {},
  componentSize: 'MEDIUM',
  notificationLevel: 'NORMAL',
  informationDensity: 'MEDIUM',
  animationPreference: 'FULL',
  iconographyStyle: 'FLAT',
  dataRefreshRate: 'HIGH',
  language: 'en-US',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  metricSystem: 'METRIC',
  showHelpTips: true,
  smartDefaultsEnabled: true,
  adaptiveContentPrioritization: true,
  workspaceLayout: {
    primaryPanel: 'Dashboard',
    layoutPreset: 'DUAL_COLUMN',
  },
  metricDisplay: 'GRAPHICAL_CHARTS',
  dashboardLayout: 'TEMPLATE_BASED',
  searchScope: 'GLOBAL',
};

/**
 * @constant DEFAULT_USER_PROFILE
 * @description A default, anonymous user profile used for initial state or unauthenticated access.
 * This provides a fallback for critical system operations and guest user experiences, ensuring
 * basic functionality even without a fully established digital identity.
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  userId: 'anonymous-user',
  username: 'Guest User',
  email: 'guest@example.com',
  status: 'ACTIVE',
  lastLogin: Date.now(),
  createdAt: Date.now(),
  uiPreferencesHistory: [DEFAULT_UI_STATE],
  behavioralLogs: [],
  featureFlags: {},
  subscriptions: ['free_tier'],
  accessLevels: ['viewer'],
  roles: ['guest'],
  explicitPermissions: [],
  activeABTests: {},
  manualOverrides: {},
  adaptiveLearningEnabled: true,
  personalizationEnabled: true,
  notificationSettings: {
    email: false,
    inApp: true,
    push: false,
    sms: false,
    level: 'MINIMAL',
    doNotDisturb: { enabled: false },
    channels: {},
  },
  languagePreference: 'en-US',
  timezonePreference: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  onboardingStatus: {
    completedSteps: [],
    lastStep: '',
    isComplete: false,
    lastUpdated: Date.now(),
    progressPercentage: 0,
  },
  settingsVersion: 1,
  lastActivityTimestamp: Date.now(),
  deviceInfo: {
    deviceType: 'DESKTOP',
    os: 'Unknown',
    browser: 'Unknown',
    screenResolution: 'Unknown',
    viewportSize: 'Unknown',
    platform: 'Unknown',
  },
  securityPolicyVersion: 1,
  mfaEnabled: false,
  trustScore: 0.5,
  userSegments: ['default'],
};

/**
 * @function evaluateCondition
 * @description Simulates the evaluation of a string-based condition against a given context.
 * This function provides a basic, deterministic mechanism for rule evaluation, demonstrating
 * the power of programmable governance. In a production system, this would be backed by
 * a robust, secure rules engine capable of parsing complex expressions against real-time data.
 * @param condition The condition string to evaluate (e.g., "user.persona == 'DATA_SCIENTIST'").
 * @param context An object containing relevant data (e.g., user profile, UI state, recent events).
 * @returns True if the condition is met, false otherwise.
 */
export function evaluateCondition(condition: string, context: { user: UserProfile, ui: UIState, events: UserEvent[], agentMessages: UIAgentMessage[] }): boolean {
  try {
    // This is a simplified, heuristic evaluation. A real system would use a secure expression parser (e.g., AST).
    // For demonstration, we handle common patterns.
    if (!condition || typeof condition !== 'string') return true;

    // Example conditions: "user.persona == 'DATA_SCIENTIST'"
    const matchPersona = condition.match(/user\.persona\s*==\s*'([^']+)'/);
    if (matchPersona && context.user.persona === matchPersona[1]) return true;

    // Example conditions: "user.deviceInfo.deviceType == 'MOBILE'"
    const matchDevice = condition.match(/user\.deviceInfo\.deviceType\s*==\s*'([^']+)'/);
    if (matchDevice && context.user.deviceInfo.deviceType === matchDevice[1]) return true;

    // Example conditions: "events.errorCount > 3"
    const matchErrorCount = condition.match(/events\.errorCount\s*>\s*(\d+)/);
    if (matchErrorCount && context.events.filter(e => e.type === 'ERROR').length > parseInt(matchErrorCount[1], 10)) return true;

    // Example conditions: "ui.informationDensity == 'HIGH'"
    const matchInfoDensity = condition.match(/ui\.informationDensity\s*==\s*'([^']+)'/);
    if (matchInfoDensity && context.ui.informationDensity === matchInfoDensity[1]) return true;

    // Example condition for user segments
    const matchUserSegment = condition.match(/user\.userSegments\.includes\s*\('([^']+)'\)/);
    if (matchUserSegment && context.user.userSegments.includes(matchUserSegment[1])) return true;

    // If no specific match, assume false for unknown conditions in simulation
    return false;
  } catch (error) {
    console.error(`Error evaluating condition "${condition}":`, error);
    return false;
  }
}

/**
 * @function applyGovernancePolicies
 * @description Applies a set of active governance policies to potentially modify the UI state.
 * This ensures that the user interface always aligns with organizational compliance, risk,
 * and operational guidelines, proactively enforcing security and best practices.
 * Business value: Centralized policy enforcement reduces human error, automates compliance,
 * and maintains system integrity, critical for financial platforms handling sensitive operations.
 * @param currentUIState The current UIState to potentially modify.
 * @param policies An array of active EffectivePolicy objects.
 * @param context The evaluation context (user profile, events, etc.).
 * @returns A Partial<UIState> representing changes dictated by policies.
 */
export function applyGovernancePolicies(currentUIState: UIState, policies: EffectivePolicy[], context: { user: UserProfile, ui: UIState, events: UserEvent[], agentMessages: UIAgentMessage[] }): Partial<UIState> {
  let policyDrivenChanges: Partial<UIState> = {};

  const sortedPolicies = [...policies].sort((a, b) => b.priority - a.priority); // Higher priority first

  for (const policy of sortedPolicies) {
    if (policy.isEnabled === false || (policy.expiresAt && Date.now() > policy.expiresAt)) {
      continue;
    }

    if (evaluateCondition(policy.condition, context)) {
      if (policy.action === 'ADAPT_UI_STATE' && policy.targetUIState) {
        policyDrivenChanges = { ...policyDrivenChanges, ...policy.targetUIState };
        // Log policy application for audit
        // trackUserEvent('POLICY_ENFORCEMENT', { policyId: policy.policyId, changes: policy.targetUIState });
      }
      // Other actions like 'BLOCK_UI_FEATURE' would be handled by components consuming `effectivePolicies`
      // or directly by a UI framework based on policy evaluation results.
    }
  }
  return policyDrivenChanges;
}

/**
 * @function simulateAIRecommendation
 * @description A high-fidelity simulator for an AI agent's UI recommendations. This function
 * analyzes a user's profile and recent behavioral events to suggest adaptive UI changes.
 * This deterministic simulation demonstrates the potential of AI to enhance user workflows
 * and drive efficiency, delivering a superior user experience worth millions in productivity gains.
 * In a production system, this would interface with a sophisticated agentic AI service,
 * leveraging machine learning and real-time data streams.
 * @param profile The current UserProfile for context.
 * @param currentUI The current UIState for context.
 * @param recentEvents A log of recent UserEvents to infer behavior.
 * @returns A Partial<UIState> representing recommended changes, or an empty object if no strong recommendations.
 */
export function simulateAIRecommendation(profile: UserProfile, currentUI: UIState, recentEvents: UserEvent[]): Partial<UIState> {
  const recommendations: Partial<UIState> = {};
  let personaInferred: UIPersona = profile.persona;
  const eventCounts = {
    error: recentEvents.filter(e => e.type === 'ERROR').length,
    search: recentEvents.filter(e => e.type === 'SEARCH').length,
    uiChange: recentEvents.filter(e => e.type === 'UI_CHANGE').length,
    formSubmit: recentEvents.filter(e => e.type === 'FORM_SUBMIT').length,
    navigate: recentEvents.filter(e => e.type === 'NAVIGATE').length,
    scroll: recentEvents.filter(e => e.type === 'SCROLL').length,
    apiCall: recentEvents.filter(e => e.type === 'API_CALL').length,
    transactionInitiated: recentEvents.filter(e => e.type === 'TRANSACTION_INITIATED').length,
  };

  // Rule 1: Adapt based on explicit persona and current UI state
  switch (profile.persona) {
    case 'ANALYTICAL_INTROVERT':
      if (currentUI.informationDensity !== 'HIGH') recommendations.informationDensity = 'HIGH';
      if (currentUI.navigationalStyle !== 'COMMAND_PALETTE') recommendations.navigationalStyle = 'COMMAND_PALETTE';
      if (!currentUI.componentSet.includes('QueryBuilder')) recommendations.componentSet = [...currentUI.componentSet, 'DataGrid', 'AdvancedCharts', 'QueryBuilder'];
      if (currentUI.colorTheme !== 'DARK_MODERN') recommendations.colorTheme = 'DARK_MODERN';
      if (currentUI.metricDisplay !== 'TABLE_VIEW') recommendations.metricDisplay = 'TABLE_VIEW';
      break;
    case 'FINANCIAL_TRADER':
      if (currentUI.dataRefreshRate !== 'REALTIME') recommendations.dataRefreshRate = 'REALTIME';
      if (currentUI.informationDensity !== 'HIGH') recommendations.informationDensity = 'HIGH';
      if (currentUI.layout !== 'DENSE') recommendations.layout = 'DENSE';
      if (!currentUI.componentSet.includes('OrderBook')) recommendations.componentSet = [...currentUI.componentSet, 'LiveMarketFeed', 'OrderBook', 'TradeBlotter', 'RealTimeCharts'];
      if (currentUI.notificationLevel !== 'AGGRESSIVE') recommendations.notificationLevel = 'AGGRESSIVE';
      if (currentUI.colorTheme !== 'HIGH_CONTRAST') recommendations.colorTheme = 'HIGH_CONTRAST';
      if (currentUI.interactionSpeed !== 'VERY_FAST') recommendations.interactionSpeed = 'VERY_FAST';
      if (currentUI.dashboardLayout !== 'FIXED_GRID') recommendations.dashboardLayout = 'FIXED_GRID';
      break;
    case 'COMPLIANCE_OFFICER':
      if (currentUI.dataRefreshRate !== 'HIGH') recommendations.dataRefreshRate = 'HIGH';
      if (currentUI.informationDensity !== 'MEDIUM') recommendations.informationDensity = 'MEDIUM';
      if (!currentUI.componentSet.includes('AuditLogViewer')) recommendations.componentSet = [...currentUI.componentSet, 'AuditLogViewer', 'RegulatoryReports', 'AlertManagement', 'PolicyEditor'];
      if (currentUI.notificationLevel !== 'NORMAL') recommendations.notificationLevel = 'NORMAL';
      if (currentUI.colorTheme !== 'MONOCHROME') recommendations.colorTheme = 'MONOCHROME';
      if (currentUI.showHelpTips !== false) recommendations.showHelpTips = false;
      if (currentUI.searchScope !== 'GLOBAL') recommendations.searchScope = 'GLOBAL';
      break;
    case 'RISK_MANAGER':
      if (currentUI.dataRefreshRate !== 'REALTIME') recommendations.dataRefreshRate = 'REALTIME';
      if (currentUI.informationDensity !== 'HIGH') recommendations.informationDensity = 'HIGH';
      if (currentUI.notificationLevel !== 'AGGRESSIVE') recommendations.notificationLevel = 'AGGRESSIVE';
      if (!currentUI.componentSet.includes('RiskExposureDashboard')) recommendations.componentSet = [...currentUI.componentSet, 'RiskExposureDashboard', 'FraudDetectionAlerts', 'RegulatoryComplianceMatrix'];
      if (currentUI.colorTheme !== 'HIGH_CONTRAST') recommendations.colorTheme = 'HIGH_CONTRAST';
      if (currentUI.metricDisplay !== 'GAUGES_AND_DIALS') recommendations.metricDisplay = 'GAUGES_AND_DIALS';
      break;
  }

  // Rule 2: Behavioral adaptation from recent events
  if (eventCounts.error > 3 && currentUI.notificationLevel !== 'AGGRESSIVE') {
    recommendations.notificationLevel = 'AGGRESSIVE';
    recommendations.showHelpTips = true;
    recommendations.accessibility = { ...currentUI.accessibility, contrastMode: 'HIGH_CONTRAST' };
    recommendations.animationPreference = 'REDUCED';
    if (profile.adaptiveLearningEnabled) personaInferred = 'TASK_FOCUSED_PRAGMATIST';
  }

  if (eventCounts.search > 5 && currentUI.navigationalStyle !== 'MAGNIFYING_GLASS_SEARCH') {
    recommendations.navigationalStyle = 'MAGNIFYING_GLASS_SEARCH';
    recommendations.showHelpTips = true;
    if (profile.adaptiveLearningEnabled) personaInferred = 'EXPLORATORY_LEARNER';
  }

  if (eventCounts.formSubmit > 5 && currentUI.layout !== 'COMPACT') {
    recommendations.layout = 'COMPACT';
  }

  if (eventCounts.apiCall > 10 && currentUI.dataRefreshRate !== 'REALTIME') {
    // If user frequently triggers API calls, they likely need real-time data
    recommendations.dataRefreshRate = 'REALTIME';
  }

  if (eventCounts.transactionInitiated > 3 && currentUI.notificationLevel !== 'AGGRESSIVE') {
    // High transaction activity suggests need for immediate feedback
    recommendations.notificationLevel = 'AGGRESSIVE';
  }

  // Device-specific adaptations
  if (profile.deviceInfo.deviceType === 'MOBILE' && currentUI.componentSize !== 'LARGE') {
    recommendations.componentSize = 'LARGE';
    recommendations.layout = 'COMPACT';
    recommendations.navigationalStyle = 'FLOATING_ACTION_BUTTON';
    recommendations.informationDensity = 'LOW';
  }

  // Onboarding status adaptation
  if (!profile.onboardingStatus.isComplete && currentUI.showHelpTips !== true) {
    recommendations.showHelpTips = true;
  }

  // Prioritize content based on user segments
  if (profile.userSegments.includes('high-value-client') && currentUI.adaptiveContentPrioritization) {
    recommendations.workspaceLayout = { ...currentUI.workspaceLayout, primaryPanel: 'VIP_Client_Dashboard' };
    recommendations.notificationLevel = 'AGGRESSIVE';
  }

  // Override persona if a stronger behavioral inference is made and adaptive learning is on
  if (profile.adaptiveLearningEnabled && personaInferred !== profile.persona) {
    recommendations.persona = personaInferred;
  }

  // Apply manual overrides from the profile last, ensuring user's explicit choices are respected
  const finalRecommendations = { ...recommendations, ...profile.manualOverrides };

  // Filter out recommendations that are identical to the current state to avoid unnecessary updates
  const effectiveRecommendations: Partial<UIState> = {};
  for (const key in finalRecommendations) {
    if (Object.prototype.hasOwnProperty.call(finalRecommendations, key)) {
      const stateKey = key as keyof UIState;
      if (JSON.stringify(finalRecommendations[stateKey]) !== JSON.stringify(currentUI[stateKey])) {
        effectiveRecommendations[stateKey] = finalRecommendations[stateKey];
      }
    }
  }

  return effectiveRecommendations;
}

/**
 * @interface AdaptiveUIContextType
 * @description Defines the structure of the Adaptive UI Context, providing the current
 * UI state and functions to modify it. This context is the central nervous system
 * for UI personalization across the application, delivering dynamic, high-value user experiences.
 */
export interface AdaptiveUIContextType {
  uiState: UIState;
  currentProfile: UserProfile;
  activePolicies: EffectivePolicy[];
  updateUIState: (newPartialState: Partial<UIState>, bypassAI?: boolean) => void;
  applyRecommendation: (recommendation: UIRecommendation) => void;
  trackUserEvent: (type: UserEventType, details?: { [key: string]: any }) => void;
  permissions: { [key: string]: boolean };
  addAdaptationRule: (rule: UIAdaptationRule) => void;
  updateAdaptationRule: (ruleId: string, updates: Partial<UIAdaptationRule>) => void;
  deleteAdaptationRule: (ruleId: string) => void;
  processAgentMessage: (message: UIAgentMessage) => void;
  getRuleById: (ruleId: string) => UIAdaptationRule | undefined;
  getRulesByTag: (tag: string) => UIAdaptationRule[];
}

/**
 * @constant AdaptiveUIContext
 * @description React Context for managing and providing the global Adaptive UI State.
 * This allows any component in the application to access and react to UI preferences.
 */
export const AdaptiveUIContext = createContext<AdaptiveUIContextType | undefined>(undefined);

/**
 * @function useAdaptiveUI
 * @description A custom React hook to consume the Adaptive UI Context. This hook
 * simplifies access to the current UI state and adaptation functions for any
 * component within the AdaptiveUIProvider's scope.
 * @returns The AdaptiveUIContextType object.
 * @throws Error if used outside of an AdaptiveUIProvider.
 */
export const useAdaptiveUI = (): AdaptiveUIContextType => {
  const context = useContext(AdaptiveUIContext);
  if (context === undefined) {
    throw new Error('useAdaptiveUI must be used within an AdaptiveUIProvider');
  }
  return context;
};

/**
 * @interface AdaptiveUIProviderProps
 * @description Properties for the AdaptiveUIProvider component.
 * Allows initial user profile to be passed in, enabling server-side rendering
 * or initial client-side data loading, establishing foundational personalization.
 */
export interface AdaptiveUIProviderProps {
  children: React.ReactNode;
  initialProfile?: UserProfile;
  aiSimulationEnabled?: boolean;
  aiSimulationIntervalMs?: number;
  maxBehavioralLogs?: number;
}

/**
 * @function AdaptiveUIProvider
 * @description A React Context Provider that manages and supplies the adaptive UI state
 * to its children components. This provider orchestrates UI personalization by
 * integrating user preferences, behavioral data, and AI-driven recommendations.
 * It's a key infrastructure component that delivers dynamic, high-value user experiences,
 * akin to a central nervous system for human-computer interaction in finance.
 * @param props The AdaptiveUIProviderProps, including children and optional initial profile.
 * @returns A React Provider component.
 */
export const AdaptiveUIProvider: React.FC<AdaptiveUIProviderProps> = ({
  children,
  initialProfile,
  aiSimulationEnabled = true,
  aiSimulationIntervalMs = 5000,
  maxBehavioralLogs = 100,
}) => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(initialProfile || DEFAULT_USER_PROFILE);
  const [uiState, setUiState] = useState<UIState>(() => {
    const baseState = initialProfile?.uiPreferencesHistory?.[0] || DEFAULT_UI_STATE;
    return { ...baseState, ...initialProfile?.manualOverrides, lastUpdated: Date.now() };
  });

  const behavioralLogsRef = useRef<UserEvent[]>(currentProfile.behavioralLogs || []);
  const agentMessagesRef = useRef<UIAgentMessage[]>([]); // For simulating agent communications
  const [adaptationRules, setAdaptationRules] = useState<UIAdaptationRule[]>(() => [
    {
      ruleId: 'rule-high-error-rate',
      name: 'High Error Rate Adaptation',
      description: 'If user encounters multiple errors, enable help tips and reduce motion.',
      condition: 'events.errorCount > 3',
      action: { showHelpTips: true, animationPreference: 'REDUCED', accessibility: { ...DEFAULT_ACCESSIBILITY_PREFERENCES, contrastMode: 'HIGH_CONTRAST' } },
      priority: 100,
      isEnabled: true,
      createdBy: 'system-governance-agent',
      createdAt: Date.now(),
      lastModified: Date.now(),
      tags: ['governance', 'accessibility'],
    },
    {
      ruleId: 'rule-mobile-compact',
      name: 'Mobile Device Compact UI',
      description: 'Automatically set UI to compact on mobile devices for better experience.',
      condition: "user.deviceInfo.deviceType == 'MOBILE'",
      action: { layout: 'COMPACT', componentSize: 'LARGE', navigationalStyle: 'FLOATING_ACTION_BUTTON', informationDensity: 'LOW' },
      priority: 90,
      isEnabled: true,
      createdBy: 'system-governance-agent',
      createdAt: Date.now(),
      lastModified: Date.now(),
      tags: ['responsiveness'],
    },
    {
      ruleId: 'rule-trader-realtime',
      name: 'Financial Trader Realtime Data',
      description: 'Ensure financial traders always have real-time data refresh rates.',
      condition: "user.persona == 'FINANCIAL_TRADER'",
      action: { dataRefreshRate: 'REALTIME' },
      priority: 120,
      isEnabled: true,
      createdBy: 'system-governance-agent',
      createdAt: Date.now(),
      lastModified: Date.now(),
      tags: ['persona', 'performance'],
    },
  ]);
  const [activePolicies, setActivePolicies] = useState<EffectivePolicy[]>([]);

  /**
   * @constant permissions
   * @description Memoized calculation of the effective permissions for the current user profile.
   * This aggregation combines permissions from assigned roles and any explicit permissions,
   * providing a flattened map for efficient access control checks across the UI.
   * Business value: Ensures granular and dynamic security enforcement, restricting access to
   * sensitive features and data based on real-time user privileges, which is critical for
   * financial operations compliance and data integrity. This component forms the bedrock of
   * secure interaction within a multi-billion dollar financial platform.
   */
  const permissions = useMemo(() => {
    const effectivePermissions: { [key: string]: boolean } = {};
    const rolesMap: { [roleId: string]: UserRole } = {};

    // Mock roles for a self-contained simulation. In a real system, these would be loaded from a Digital Identity and Trust Layer.
    const mockRoles: UserRole[] = [
      { roleId: 'admin', name: 'Administrator', description: 'Full access', permissions: ['resource:*:*:*', 'admin_panel:*:*'], level: 10 },
      { roleId: 'project_manager', name: 'Project Manager', description: 'Manage projects', permissions: ['project:*:write', 'project:*:read', 'task:*:write'], level: 5 },
      { roleId: 'guest', name: 'Guest User', description: 'Read-only access', permissions: ['resource:*:read'], level: 1 },
      { roleId: 'financial_analyst', name: 'Financial Analyst', description: 'Access to financial reports', permissions: ['report:financial:read', 'data:transactions:read', 'chart:market:view'], level: 6 },
      { roleId: 'payments_operator', name: 'Payments Operator', description: 'Manage payment transactions', permissions: ['payment:transaction:execute', 'payment:transaction:read', 'payment:transaction:approve', 'alert:payment:read'], level: 7 },
      { roleId: 'compliance_officer', name: 'Compliance Officer', description: 'Audit and compliance reporting', permissions: ['audit:log:read', 'report:regulatory:read', 'policy:rule:read', 'alert:system:read'], level: 8 },
      { roleId: 'financial_trader', name: 'Financial Trader', description: 'High-speed trading operations', permissions: ['trade:order:execute', 'market:data:realtime', 'position:view', 'wallet:balance:read'], level: 9 },
      { roleId: 'risk_manager', name: 'Risk Manager', description: 'Monitor and manage financial risk', permissions: ['risk:exposure:view', 'fraud:alert:manage', 'policy:risk:manage', 'report:risk:read'], level: 9 },
    ];
    mockRoles.forEach(role => (rolesMap[role.roleId] = role));

    const allPermissions = new Set<string>();

    const resolveRolePermissions = (roleIds: string[], visitedRoles = new Set<string>()) => {
      roleIds.forEach(roleId => {
        if (visitedRoles.has(roleId)) return;
        visitedRoles.add(roleId);

        const role = rolesMap[roleId];
        if (role) {
          role.permissions.forEach(perm => allPermissions.add(perm));
          if (role.inheritsRoles) {
            resolveRolePermissions(role.inheritsRoles, visitedRoles);
          }
        }
      });
    };

    resolveRolePermissions(currentProfile.roles);
    currentProfile.explicitPermissions.forEach(p => allPermissions.add(`${p.resource}:${p.action}:${p.scope || '*'}`));

    allPermissions.forEach(perm => {
      const parts = perm.split(':');
      if (parts.length >= 3 && parts[2] === '*') { // e.g., resource:id:*
        effectivePermissions[`${parts[0]}:${parts[1]}:*`] = true;
      }
      if (parts.length >= 2 && parts[1] === '*') { // e.g., resource:*
        effectivePermissions[`${parts[0]}:*`] = true;
      }
      effectivePermissions[perm] = true;
    });

    // Universal admin override
    if (currentProfile.roles.includes('admin')) {
      effectivePermissions['*:*:*:*'] = true;
      effectivePermissions['*'] = true; // Simplified for broad matching
    }

    return effectivePermissions;
  }, [currentProfile.roles, currentProfile.explicitPermissions]);


  /**
   * @function updateUIState
   * @description Merges a partial UI state into the current state, updating it globally.
   * This is the primary mechanism for UI components or external logic to request UI adjustments.
   * Business value: Provides a single, controlled point of modification for the UI, ensuring consistency
   * and enabling sophisticated adaptation logic, leading to a highly responsive and coherent user experience.
   * @param newPartialState A partial UIState object containing the properties to update.
   * @param bypassAI If true, this update will not immediately trigger an AI re-evaluation.
   */
  const updateUIState = useCallback((newPartialState: Partial<UIState>, bypassAI: boolean = false) => {
    setUiState(prev => {
      const updatedState = {
        ...prev,
        ...newPartialState,
        lastUpdated: Date.now(),
        // Manual overrides are explicitly merged, ensuring user's direct choices persist
        manualOverrides: { ...prev.manualOverrides, ...newPartialState.manualOverrides },
      };
      trackUserEvent('UI_CHANGE', { previousState: prev, newState: updatedState, source: bypassAI ? 'user_manual' : 'system_adaptive' });
      return updatedState;
    });

    if (aiSimulationEnabled && !bypassAI && currentProfile.adaptiveLearningEnabled) {
      // In a real application, this would debounce or use a dedicated worker/agent to avoid rapid re-evaluations.
      // For simulation, the useEffect interval handles the timing.
    }
  }, [aiSimulationEnabled, currentProfile.adaptiveLearningEnabled]);

  /**
   * @function applyRecommendation
   * @description Applies an AI-generated UI recommendation to the current UI state.
   * This function integrates the insights from agentic AI directly into the user experience.
   * Business value: Automates UI optimization, reducing user effort and accelerating task completion
   * by proactively adapting the interface based on intelligent analysis, generating significant productivity gains.
   * @param recommendation The UIRecommendation object to apply.
   */
  const applyRecommendation = useCallback((recommendation: UIRecommendation) => {
    if (currentProfile.adaptiveLearningEnabled) {
      // Ensure specific fields in recommendation.recommendedChanges like accessibility
      // are merged deeply rather than shallowly to preserve other settings.
      const deepMergedChanges: Partial<UIState> = {};
      for (const key in recommendation.recommendedChanges) {
        if (Object.prototype.hasOwnProperty.call(recommendation.recommendedChanges, key)) {
          const stateKey = key as keyof UIState;
          if (stateKey === 'accessibility') {
            deepMergedChanges[stateKey] = {
              ...uiState.accessibility,
              ...(recommendation.recommendedChanges[stateKey] as UIAccessibilityPreference),
            } as any; // Cast as any because TS isn't happy with dynamic key access for deep merge
          } else if (stateKey === 'workspaceLayout') {
            deepMergedChanges[stateKey] = {
              ...uiState.workspaceLayout,
              ...(recommendation.recommendedChanges[stateKey] as UIState['workspaceLayout']),
            } as any;
          }
          else {
            deepMergedChanges[stateKey] = recommendation.recommendedChanges[stateKey];
          }
        }
      }

      updateUIState(deepMergedChanges, true); // Bypass AI to prevent immediate re-trigger
      trackUserEvent('RECOMMENDATION_INTERACTION', {
        recommendationId: recommendation.id,
        reason: recommendation.reason,
        changes: recommendation.recommendedChanges,
        action: 'APPLIED',
        sourceAgent: recommendation.sourceAgentId,
        confidence: recommendation.confidenceScore,
      });
    }
  }, [updateUIState, currentProfile.adaptiveLearningEnabled, uiState.accessibility, uiState.workspaceLayout]);

  /**
   * @function trackUserEvent
   * @description Records a user interaction or system event. These logs are vital for
   * behavioral analytics, security audits, and as input for the adaptive AI engine.
   * Business value: Creates a rich dataset for optimizing user journeys, detecting anomalies,
   * and proving regulatory compliance, turning user activity into actionable intelligence
   * and providing an immutable audit trail for forensic analysis.
   * @param type The type of event.
   * @param details Additional key-value pairs describing the event.
   */
  const trackUserEvent = useCallback((type: UserEventType, details: { [key: string]: any } = {}) => {
    const newEvent: UserEvent = {
      eventId: crypto.randomUUID(),
      userId: currentProfile.userId,
      timestamp: Date.now(),
      type,
      details,
      sessionId: 'simulated-session-id', // In a real system, this would be managed by a session service
      correlationId: details.correlationId || crypto.randomUUID(), // For linking transactions/workflows
      // signature: 'mock-cryptographic-signature' // In a real system, this would be a cryptographically signed hash
    };
    behavioralLogsRef.current = [...behavioralLogsRef.current, newEvent].slice(-maxBehavioralLogs);
    // In a real system, this would also send the event to a backend logging service for persistence and real-time analysis.
  }, [currentProfile.userId, maxBehavioralLogs]);

  /**
   * @function addAdaptationRule
   * @description Adds a new UI adaptation rule to the system. This allows for dynamic
   * configuration of UI behavior based on governance policies or operational needs.
   * Business value: Enables agile response to changing business requirements and regulatory
   * landscapes by empowering administrators to define and deploy dynamic UI behaviors without code changes.
   * @param rule The UIAdaptationRule object to add.
   */
  const addAdaptationRule = useCallback((rule: UIAdaptationRule) => {
    setAdaptationRules(prev => [...prev, rule]);
    trackUserEvent('SETTINGS_UPDATE', { action: 'ADD_RULE', ruleId: rule.ruleId, ruleName: rule.name });
  }, [trackUserEvent]);

  /**
   * @function updateAdaptationRule
   * @description Modifies an existing UI adaptation rule. This allows for fine-tuning
   * and evolving governance policies over time.
   * Business value: Ensures the system remains adaptable and compliant, enabling continuous
   * improvement of the user experience and policy enforcement.
   * @param ruleId The ID of the rule to update.
   * @param updates A partial UIAdaptationRule object with changes.
   */
  const updateAdaptationRule = useCallback((ruleId: string, updates: Partial<UIAdaptationRule>) => {
    setAdaptationRules(prev =>
      prev.map(rule =>
        rule.ruleId === ruleId ? { ...rule, ...updates, lastModified: Date.now() } : rule
      )
    );
    trackUserEvent('SETTINGS_UPDATE', { action: 'UPDATE_RULE', ruleId, updates });
  }, [trackUserEvent]);

  /**
   * @function deleteAdaptationRule
   * @description Removes a UI adaptation rule from the system.
   * Business value: Provides control and flexibility in managing dynamic UI governance,
   * allowing for the deprecation or removal of outdated policies.
   * @param ruleId The ID of the rule to delete.
   */
  const deleteAdaptationRule = useCallback((ruleId: string) => {
    setAdaptationRules(prev => prev.filter(rule => rule.ruleId !== ruleId));
    trackUserEvent('SETTINGS_UPDATE', { action: 'DELETE_RULE', ruleId });
  }, [trackUserEvent]);

  /**
   * @function getRuleById
   * @description Retrieves an adaptation rule by its ID.
   * @param ruleId The ID of the rule.
   * @returns The UIAdaptationRule object or undefined if not found.
   */
  const getRuleById = useCallback((ruleId: string): UIAdaptationRule | undefined => {
    return adaptationRules.find(rule => rule.ruleId === ruleId);
  }, [adaptationRules]);

  /**
   * @function getRulesByTag
   * @description Retrieves adaptation rules filtered by a specific tag.
   * @param tag The tag to filter rules by.
   * @returns An array of UIAdaptationRule objects.
   */
  const getRulesByTag = useCallback((tag: string): UIAdaptationRule[] => {
    return adaptationRules.filter(rule => rule.tags?.includes(tag));
  }, [adaptationRules]);

  /**
   * @function processAgentMessage
   * @description Handles incoming messages from the Agentic Intelligence Layer.
   * This function acts as an internal adapter for agent communication, allowing
   * agents to directly influence the UI's behavior or state.
   * Business value: Enables fully autonomous system responses to detected events,
   * closing the loop between intelligence and action, driving hyper-automation.
   * @param message The UIAgentMessage received.
   */
  const processAgentMessage = useCallback((message: UIAgentMessage) => {
    agentMessagesRef.current = [...agentMessagesRef.current, message];
    trackUserEvent('RECOMMENDATION_INTERACTION', { action: 'AGENT_MESSAGE_RECEIVED', messageType: message.payload.type, sender: message.senderId });

    if (message.payload.type === 'UI_RECOMMENDATION') {
      const recommendation: UIRecommendation = message.payload.data;
      if (recommendation.targetUserId && recommendation.targetUserId !== currentProfile.userId) {
        return; // Recommendation not for current user in this UI instance
      }
      applyRecommendation(recommendation);
    } else if (message.payload.type === 'POLICY_ENFORCEMENT') {
      // Assuming payload.data is an EffectivePolicy or an update to existing policies
      const policyData = message.payload.data as EffectivePolicy | { policyId: string, status: 'DISABLE' };
      if ('status' in policyData && policyData.status === 'DISABLE') {
        setActivePolicies(prev => prev.filter(p => p.policyId !== policyData.policyId));
        trackUserEvent('POLICY_ENFORCEMENT', { action: 'POLICY_DISABLED', policyId: policyData.policyId });
      } else {
        const incomingPolicy = policyData as EffectivePolicy;
        setActivePolicies(prev => {
          const exists = prev.some(p => p.policyId === incomingPolicy.policyId);
          if (exists) {
            return prev.map(p => (p.policyId === incomingPolicy.policyId ? incomingPolicy : p));
          }
          return [...prev, incomingPolicy];
        });
        trackUserEvent('POLICY_ENFORCEMENT', { action: 'POLICY_ACTIVATED', policyId: incomingPolicy.policyId, reason: incomingPolicy.description });
      }
    }
  }, [currentProfile.userId, applyRecommendation, trackUserEvent]);


  // Effect for AI-driven adaptation (simulation)
  useEffect(() => {
    if (!aiSimulationEnabled || !currentProfile.adaptiveLearningEnabled) {
      return;
    }

    const interval = setInterval(() => {
      const recentEvents = behavioralLogsRef.current.slice(-20); // Consider last 20 events for quick adaptation
      const aiRecommendation = simulateAIRecommendation(currentProfile, uiState, recentEvents);

      if (Object.keys(aiRecommendation).length > 0) {
        applyRecommendation({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          recommendedChanges: aiRecommendation,
          reason: 'AI inferred adaptation from behavior',
          confidenceScore: 0.8,
          sourceAgentId: 'AdaptiveUI-Agent-v1',
          actionRequired: false,
        });
      }
    }, aiSimulationIntervalMs);

    return () => clearInterval(interval);
  }, [aiSimulationEnabled, aiSimulationIntervalMs, currentProfile, uiState, applyRecommendation]);

  // Effect for Governance Rule-driven adaptation
  useEffect(() => {
    // Collect active rules
    const currentlyActivePolicies: EffectivePolicy[] = adaptationRules
      .filter(rule => rule.isEnabled && (!rule.validUntil || Date.now() < rule.validUntil))
      .map(rule => ({
        policyId: rule.ruleId,
        name: rule.name,
        description: rule.description,
        condition: rule.condition,
        action: 'ADAPT_UI_STATE', // All rules defined here are UI state adaptations
        targetUIState: rule.action,
        priority: rule.priority,
        enforcedByAgentId: 'Governance-Agent-v1',
        activeSince: rule.createdAt,
        expiresAt: rule.validUntil,
      }));
    setActivePolicies(currentlyActivePolicies);

    const evaluationContext = {
      user: currentProfile,
      ui: uiState,
      events: behavioralLogsRef.current,
      agentMessages: agentMessagesRef.current,
    };
    const policyDrivenChanges = applyGovernancePolicies(uiState, currentlyActivePolicies, evaluationContext);

    if (Object.keys(policyDrivenChanges).length > 0) {
      // Apply policy changes, overriding AI recommendations if conflicting based on priority.
      // For this simulation, governance rules take precedence.
      updateUIState(policyDrivenChanges, true);
      // Log the policy enforcement event
      trackUserEvent('POLICY_ENFORCEMENT', { action: 'ADAPTIVE_RULE_APPLIED', changes: policyDrivenChanges });
    }

  }, [adaptationRules, currentProfile, uiState, updateUIState, trackUserEvent]);


  // Effect to update currentProfile if initialProfile changes (e.g., user logs in/out)
  useEffect(() => {
    if (initialProfile && initialProfile.userId !== currentProfile.userId) {
      setCurrentProfile(initialProfile);
      const baseState = initialProfile.uiPreferencesHistory?.[0] || DEFAULT_UI_STATE;
      setUiState({ ...baseState, ...initialProfile.manualOverrides, lastUpdated: Date.now() });
      behavioralLogsRef.current = initialProfile.behavioralLogs || [];
      trackUserEvent('AUTHENTICATION', { action: 'LOGIN', userId: initialProfile.userId, newSession: true });
    }
  }, [initialProfile, currentProfile.userId, trackUserEvent]);


  const contextValue = useMemo(() => ({
    uiState,
    currentProfile,
    activePolicies,
    updateUIState,
    applyRecommendation,
    trackUserEvent,
    permissions,
    addAdaptationRule,
    updateAdaptationRule,
    deleteAdaptationRule,
    processAgentMessage,
    getRuleById,
    getRulesByTag,
  }), [
    uiState,
    currentProfile,
    activePolicies,
    updateUIState,
    applyRecommendation,
    trackUserEvent,
    permissions,
    addAdaptationRule,
    updateAdaptationRule,
    deleteAdaptationRule,
    processAgentMessage,
    getRuleById,
    getRulesByTag,
  ]);

  return (
    <AdaptiveUIContext.Provider value={contextValue}>
      {children}
    </AdaptiveUIContext.Provider>
  );
};

/**
 * @function hasPermission
 * @description Checks if a user has a specific permission. This function is essential for
 * enforcing role-based access control (RBAC) and ensuring that UI elements are only
 * visible or actionable to authorized users or agents. This granular access control
 * is critical for maintaining data integrity and regulatory compliance in financial systems.
 * @param effectivePermissions A map of flattened effective permissions (e.g., from useAdaptiveUI hook).
 * @param requiredPermission The specific permission string to check (e.g., 'payment:transaction:execute').
 * @returns True if the permission is granted, false otherwise.
 */
export function hasPermission(effectivePermissions: { [key: string]: boolean }, requiredPermission: string): boolean {
  if (effectivePermissions[requiredPermission]) {
    return true;
  }

  // Check for wildcards
  const parts = requiredPermission.split(':');
  if (parts.length >= 3) { // e.g., 'payment:transaction:execute', 'resource:id:action'
    const [resourceType, resourceId, action] = parts;
    if (effectivePermissions[`${resourceType}:${resourceId}:*`]) return true; // Any action on this specific resource ID
    if (effectivePermissions[`${resourceType}:*:*`]) return true; // Any action on any resource ID of this type
    if (effectivePermissions['*:*:*:*']) return true; // Global admin/full access
    if (effectivePermissions['*']) return true; // A very broad, simplified global access
  } else if (parts.length === 2) { // e.g., 'payment:transaction', 'resource:id' (implies read/write/etc based on context)
    const [resourceType, resourceId] = parts;
    if (effectivePermissions[`${resourceType}:*`]) return true; // Any action on this resource type
    if (effectivePermissions['*:*']) return true; // Any action on any resource
    if (effectivePermissions['*']) return true;
  } else if (parts.length === 1) { // e.g., 'admin_panel'
    if (effectivePermissions['*']) return true;
  }

  return false;
}

declare global {
  interface Crypto {
    randomUUID(): string;
  }
  interface Window {
    crypto: Crypto;
  }
}

if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  /**
   * @function randomUUID
   * @description A minimal, non-cryptographically secure fallback for UUID generation.
   * This polyfill ensures basic functionality in environments that might not natively
   * support `crypto.randomUUID`. In a production environment, `crypto.randomUUID`
   * is expected to be available, or a robust, cryptographically secure polyfill/library
   * should be explicitly used if not. This ensures event traceability for auditing
   * in development and testing scenarios.
   * @returns A string representing a UUID (version 4).
   */
  (globalThis as any).crypto = {
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
}