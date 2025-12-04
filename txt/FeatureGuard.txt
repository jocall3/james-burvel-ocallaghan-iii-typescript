import React, { useContext, useState, useEffect, useCallback, createContext, useMemo } from 'react';
import { View } from '../types'; // Original View type from the codebase

// --- 1. Core Data Structures: The Universe of Features, Rules, and Contexts ---

/**
 * A unique identifier for a feature. In this universe, the `View` type from `../types`
 * is assumed to serve as the FeatureKey. This allows `FeatureGuard` to directly
 * interpret the `view` prop as the feature it's guarding.
 */
export type FeatureKey = View;

/**
 * Defines a single condition for a feature rule.
 * Can be simple or complex, supporting various operators and data types.
 */
export interface FeatureCondition {
    target: 'user' | 'organization' | 'device' | 'environment' | 'system' | 'ai_segment' | 'custom';
    property: string; // e.g., 'roles', 'subscriptionTier', 'country', 'browser', 'segmentTags'
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notin' | 'has' | 'nothas' | 'starts_with' | 'ends_with' | 'regex';
    value: any; // The value to compare against
    negate?: boolean; // If true, the condition is inverted (NOT operator)
}

/**
 * Represents a logical grouping of conditions.
 * Rules can be nested to form complex boolean expressions (AND/OR trees).
 */
export interface FeatureRule {
    conditions?: FeatureCondition[];
    rules?: FeatureRule[]; // Nested rules for AND/OR logic
    conjunction?: 'AND' | 'OR'; // How to combine conditions/nested rules
    description?: string; // Human-readable description of the rule
}

/**
 * Defines a complete feature, including its activation rules, dependencies, and metadata.
 * This is the central registry for all features in the application.
 */
export interface FeatureDefinition {
    key: FeatureKey; // The unique identifier, which is the View itself
    name: string;
    description: string;
    enabledByDefault: boolean;
    // Core access rules
    activationRules: FeatureRule[];
    // Dependencies: Features that MUST be active for this feature to be considered
    dependencies?: FeatureKey[];
    // Conflicts: Features that CANNOT be active if this feature is active
    conflicts?: FeatureKey[];
    // Rollout strategies for progressive delivery (e.g., percentage, segment-based)
    rolloutStrategy?: 'all' | 'percentage' | 'canary' | 'targeted_segment' | 'time_based';
    rolloutConfig?: {
        percentage?: number; // For percentage rollouts
        segmentTags?: string[]; // For targeted segments
        startTime?: Date; // For time-based activation
        endTime?: Date; // For time-based deactivation
        locationRestriction?: string[]; // e.g., ['US', 'CA']
    };
    // A/B testing integration
    abTestConfig?: {
        experimentId: string;
        variants: {
            variantKey: string;
            rules?: FeatureRule[]; // Specific rules for this variant
            configPayload?: Record<string, any>; // Configuration for this variant
        }[];
        defaultVariant: string;
    };
    // AI-driven personalization configurations
    personalizationConfig?: {
        aiModelId?: string; // Model to use for predictive personalization
        predictionThreshold?: number; // Confidence threshold for AI activation
        dynamicContentTags?: string[]; // Tags for content to be fetched by AI
        adaptiveUIComponents?: Record<string, string>; // Maps component slots to AI-selected components
    };
    // Feature configurations that can be dynamically loaded
    configPayload?: Record<string, any>;
    // Fallback behavior when a feature is not accessible
    fallbackBehavior?: 'hide' | 'disable' | 'redirect' | 'render_component' | 'show_message';
    fallbackComponent?: string; // Name of a registered fallback component
    fallbackMessage?: string;
    fallbackRedirectPath?: string;
    // Lifecycle and operational metrics
    creationDate?: Date;
    lastUpdated?: Date;
    status: 'draft' | 'active' | 'inactive' | 'deprecated';
    auditLogRetentionDays?: number;
    // Security & Compliance
    complianceCategories?: string[]; // e.g., 'GDPR', 'HIPAA', 'CCPA'
    dataAccessRequirements?: string[]; // e.g., 'PII_access_required'
    // Performance & Resource Management
    resourceConsumptionEstimate?: { cpu: number; memory: number; network: number; }; // For resource planning
    cached?: boolean; // If feature state can be cached
    cacheTTLSeconds?: number;
    // Inter-system communication
    eventHooks?: {
        onActivate?: string; // Webhook URL or internal event name
        onDeactivate?: string;
        onAccessDenied?: string;
        onAccessGranted?: string;
    };
}

/**
 * Represents the current user's profile and context.
 * This is a highly enriched profile, potentially compiled from multiple data sources.
 */
export interface UserProfile {
    id: string;
    email: string;
    roles: string[]; // e.g., 'admin', 'editor', 'viewer', 'guest'
    subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
    organizationId?: string;
    segmentTags: string[]; // Dynamically assigned tags by a segmentation engine
    geoLocation: { country: string; region: string; city: string; latitude?: number; longitude?: number; };
    device: {
        type: 'desktop' | 'mobile' | 'tablet' | 'wearable' | 'smart_tv';
        os: string;
        browser: string;
        language: string;
        screenResolution: string;
        isTouchEnabled: boolean;
    };
    preferences: Record<string, any>; // User-specific settings and choices
    behavioralScores: Record<string, number>; // e.g., 'engagement_score', 'conversion_likelihood', 'churn_risk'
    lastLogin: Date;
    featuresGrantedExplicitly: FeatureKey[]; // Features specifically granted to this user
    featuresDeniedExplicitly: FeatureKey[]; // Features specifically denied to this user
    sessionData: Record<string, any>; // Transient data for the current session
    isLoggedIn: boolean;
    demographics?: {
        ageGroup?: string;
        gender?: string;
        industry?: string;
        jobTitle?: string;
    };
    accountAgeDays: number;
    lastActivityTimestamp: Date;
}

/**
 * Represents the current global and runtime context for feature evaluation.
 */
export interface EvaluationContext {
    currentTime: Date;
    currentUrl: string;
    referrer?: string;
    isOffline: boolean;
    environment: 'development' | 'staging' | 'production' | 'test';
    appVersion: string;
    activeExperiments: { experimentId: string; variant: string; }[]; // Experiments the user is currently in
    systemLoadMetrics?: { cpuUsage: number; memoryUsage: number; networkLatency: number; }; // For system-level feature gating
    customContextData?: Record<string, any>; // Any other dynamic data needed for rules
}

/**
 * Represents a dynamic configuration payload for a specific feature,
 * potentially derived from an A/B test or personalization engine.
 */
export interface FeatureConfiguration {
    featureKey: FeatureKey;
    isActive: boolean;
    payload: Record<string, any>;
    variant?: string; // If part of an A/B test
    source?: 'default' | 'rollout' | 'ab_test' | 'personalization' | 'explicit_grant';
    effectiveRules?: string[]; // Which rules ultimately granted access
}

// --- 2. Core Services: The Brains Behind the Universe ---

/**
 * Service for managing and evaluating feature definitions.
 * This is the central authority for deciding feature access.
 */
export interface IFeatureService {
    /**
     * Retrieves the complete definition for a given feature key.
     * @param featureKey The identifier of the feature.
     */
    getFeatureDefinition(featureKey: FeatureKey): FeatureDefinition | undefined;

    /**
     * Evaluates whether a user has access to a specific feature based on all rules and contexts.
     * This is the most complex method, orchestrating rule evaluation, dependency checks,
     * rollout strategies, and A/B test assignments.
     * @param featureKey The identifier of the feature.
     * @param userProfile The current user's profile.
     * @param evaluationContext The current runtime context.
     * @returns True if the feature is accessible, false otherwise.
     */
    evaluateFeatureAccess(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean;

    /**
     * Retrieves the dynamic configuration payload for a feature.
     * This payload might change based on A/B tests or personalization.
     * @param featureKey The identifier of the feature.
     * @param userProfile The current user's profile.
     * @param evaluationContext The current runtime context.
     * @returns The feature's configuration payload.
     */
    getFeatureConfig(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): Record<string, any>;

    /**
     * Forces a feature to be active or inactive for a session (e.g., for debugging).
     * This typically overrides all other rules.
     */
    overrideFeatureState(featureKey: FeatureKey, state: boolean): void;

    /**
     * Clears any session-level feature overrides.
     */
    clearFeatureOverrides(): void;

    /**
     * Registers a set of feature definitions.
     */
    registerFeatureDefinitions(definitions: FeatureDefinition[]): void;
}

/**
 * Manages A/B and Multivariate experiments, assigning users to variants.
 */
export interface IExperimentManager {
    /**
     * Gets the experiment variant for a specific user and experiment.
     * @param userId The ID of the user.
     * @param experimentId The ID of the experiment.
     * @param defaultVariant The variant to return if user is not assigned.
     */
    getExperimentVariant(userId: string, experimentId: string, defaultVariant?: string): string;

    /**
     * Records an experiment exposure for a user.
     */
    recordExposure(userId: string, experimentId: string, variant: string, featureKey: FeatureKey): void;

    /**
     * Tracks a conversion event for an experiment.
     */
    trackConversion(userId: string, experimentId: string, variant: string, goalId: string, value?: number): void;

    /**
     * Retrieves all active experiments and their assigned variants for a user.
     */
    getUserExperiments(userId: string): { experimentId: string; variant: string; }[];
}

/**
 * Handles logging of feature-related events for auditing and analytics.
 */
export interface IAuditLogger {
    logFeatureEvent(eventType: 'FEATURE_ACCESSED' | 'FEATURE_DENIED' | 'FEATURE_ACTIVATED' | 'FEATURE_DEACTIVATED' | 'FEATURE_ROLLBACK' | 'FEATURE_MISCONFIGURED',
                    payload: Record<string, any>): void;
    logError(errorType: string, message: string, details?: Record<string, any>): void;
}

/**
 * Provides dynamic content based on feature context, user profile, and AI.
 */
export interface IDynamicContentService {
    getDynamicContent(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext, tags?: string[]): Promise<Record<string, any>>;
    renderDynamicComponent(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext, slot: string): React.ReactNode;
}

/**
 * AI-driven personalization engine, adjusting features, content, and UI.
 */
export interface IPersonalizationEngine {
    applyPersonalization(featureKey: FeatureKey, children: React.ReactNode, userProfile: UserProfile, evaluationContext: EvaluationContext): React.ReactNode;
    predictFeatureRelevance(userProfile: UserProfile, evaluationContext: EvaluationContext): Promise<{ featureKey: FeatureKey; score: number; }[]>;
    optimizeFeatureConfig(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext, baseConfig: Record<string, any>): Promise<Record<string, any>>;
}

/**
 * Monitors the health and performance of features in real-time.
 */
export interface IFeatureHealthMonitor {
    reportFeatureStatus(featureKey: FeatureKey, status: 'healthy' | 'degraded' | 'unresponsive', metrics?: Record<string, any>): void;
    getFeatureStatus(featureKey: FeatureKey): 'healthy' | 'degraded' | 'unresponsive';
    registerHealthCheck(featureKey: FeatureKey, checkFunction: () => Promise<boolean>): void;
}

/**
 * Manages regulatory compliance related to feature access and data handling.
 */
export interface IComplianceManager {
    checkCompliance(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean;
    getComplianceReport(featureKey: FeatureKey): Promise<Record<string, any>>;
    registerComplianceRule(featureKey: FeatureKey, rule: (user: UserProfile, context: EvaluationContext) => boolean, category: string): void;
}

/**
 * Handles feature rollout and rollback strategies.
 */
export interface IFeatureRolloutManager {
    canRollout(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean;
    monitorRolloutProgress(featureKey: FeatureKey): { progress: number; issuesDetected: number; };
    initiateRollback(featureKey: FeatureKey, reason: string): Promise<boolean>;
    scheduleRollout(featureKey: FeatureKey, config: FeatureDefinition['rolloutConfig']): Promise<boolean>;
}

/**
 * Manages and caches the entire feature state for performance.
 */
export interface IFeatureStateCache {
    get(key: string): FeatureConfiguration | undefined;
    set(key: string, value: FeatureConfiguration, ttlSeconds?: number): void;
    invalidate(key: string): void;
    invalidateAll(): void;
    warmCache(featureKeys: FeatureKey[]): Promise<void>;
}

/**
 * Represents a global context object for all feature-related services.
 * This is the nerve center of the feature universe.
 */
export interface FeatureSystemContextType {
    featureService: IFeatureService;
    userProfile: UserProfile; // This would typically be dynamic, fetched from auth/user service
    evaluationContext: EvaluationContext; // This would be dynamic, real-time context
    experimentManager: IExperimentManager;
    auditLogger: IAuditLogger;
    dynamicContentService: IDynamicContentService;
    personalizationEngine: IPersonalizationEngine;
    featureHealthMonitor: IFeatureHealthMonitor;
    complianceManager: IComplianceManager;
    featureRolloutManager: IFeatureRolloutManager;
    featureStateCache: IFeatureStateCache;
    // ... potentially hundreds more services or sub-managers
}

// --- 3. Mock Implementations (as if fetched from a backend or global state) ---
// In a real application, these would be sophisticated client-side SDKs interacting
// with backend microservices, event streams, and AI models.

const MOCK_FEATURE_DEFINITIONS: FeatureDefinition[] = [
    {
        key: 'DashboardView',
        name: 'Main Dashboard',
        description: 'The primary user dashboard with widgets.',
        enabledByDefault: true,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true },
                ]
            }
        ],
        configPayload: {
            defaultWidgetOrder: ['activity', 'notifications', 'recommendations'],
            refreshIntervalSeconds: 300,
        },
        personalizationConfig: {
            aiModelId: 'dashboard_layout_optimizer',
            predictionThreshold: 0.7,
            dynamicContentTags: ['dashboard_news', 'user_tips'],
            adaptiveUIComponents: {
                mainContent: 'DynamicDashboardContent',
                sidebar: 'PersonalizedSidebar',
            },
        },
        abTestConfig: {
            experimentId: 'DASHBOARD_V2_ROLLOUT',
            defaultVariant: 'control',
            variants: [
                { variantKey: 'control' },
                { variantKey: 'treatment_new_layout', configPayload: { layoutVersion: 'v2' } }
            ]
        }
    },
    {
        key: 'AdvancedAnalyticsView',
        name: 'Advanced Analytics Module',
        description: 'Comprehensive data analysis tools.',
        enabledByDefault: false,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true },
                    { target: 'user', property: 'subscriptionTier', operator: 'in', value: ['premium', 'enterprise'] },
                    { target: 'user', property: 'roles', operator: 'has', value: 'analyst' }
                ]
            }
        ],
        dependencies: ['ReportingTools'],
        complianceCategories: ['GDPR', 'HIPAA'],
        fallbackBehavior: 'show_message',
        fallbackMessage: 'Upgrade to Premium or Enterprise to access Advanced Analytics!',
        resourceConsumptionEstimate: { cpu: 0.7, memory: 0.8, network: 0.6 },
    },
    {
        key: 'BetaFeaturesToggle',
        name: 'Opt-in for Beta Features',
        description: 'Allows users to enable experimental features.',
        enabledByDefault: false,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true },
                    { target: 'user', property: 'accountAgeDays', operator: 'gt', value: 30 }
                ]
            }
        ],
        rolloutStrategy: 'percentage',
        rolloutConfig: { percentage: 75 },
    },
    {
        key: 'GDPRConsentManagement',
        name: 'GDPR Consent Settings',
        description: 'Tools for users to manage their data consent.',
        enabledByDefault: true,
        activationRules: [
            {
                conditions: [
                    { target: 'user', property: 'geoLocation.country', operator: 'in', value: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE'] }
                ]
            },
            {
                conditions: [
                    { target: 'user', property: 'complianceCategories', operator: 'has', value: 'GDPR' } // Explicitly marked as needing GDPR
                ]
            }
        ],
        conjunction: 'OR',
        complianceCategories: ['GDPR'],
        fallbackBehavior: 'hide'
    }
];

class MockFeatureService implements IFeatureService {
    private definitions: Map<FeatureKey, FeatureDefinition>;
    private sessionOverrides = new Map<FeatureKey, boolean>();

    constructor(initialDefinitions: FeatureDefinition[] = []) {
        this.definitions = new Map(initialDefinitions.map(def => [def.key, def]));
    }

    registerFeatureDefinitions(definitions: FeatureDefinition[]): void {
        definitions.forEach(def => this.definitions.set(def.key, def));
    }

    getFeatureDefinition(featureKey: FeatureKey): FeatureDefinition | undefined {
        return this.definitions.get(featureKey);
    }

    private evaluateCondition(condition: FeatureCondition, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean {
        // This is a highly simplified evaluator. A real one would handle complex paths, types, etc.
        let targetObject: any;
        switch (condition.target) {
            case 'user': targetObject = userProfile; break;
            case 'organization': targetObject = userProfile.organizationId ? { id: userProfile.organizationId } : undefined; break; // Placeholder
            case 'device': targetObject = userProfile.device; break;
            case 'environment': targetObject = evaluationContext.environment; break; // Direct property
            case 'system': targetObject = evaluationContext.systemLoadMetrics; break;
            case 'ai_segment': targetObject = { segments: userProfile.segmentTags }; break; // Example
            case 'custom': targetObject = evaluationContext.customContextData; break;
            default: return false;
        }

        if (targetObject === undefined) return false;

        const actualValue = condition.property === 'environment'
            ? targetObject // For environment, targetObject is already the value
            : (targetObject as any)[condition.property];

        let result: boolean;
        switch (condition.operator) {
            case 'eq': result = actualValue === condition.value; break;
            case 'neq': result = actualValue !== condition.value; break;
            case 'gt': result = actualValue > condition.value; break;
            case 'lt': result = actualValue < condition.value; break;
            case 'gte': result = actualValue >= condition.value; break;
            case 'lte': result = actualValue <= condition.value; break;
            case 'in': result = Array.isArray(condition.value) && condition.value.includes(actualValue); break;
            case 'notin': result = Array.isArray(condition.value) && !condition.value.includes(actualValue); break;
            case 'has': result = Array.isArray(actualValue) && actualValue.includes(condition.value); break;
            case 'nothas': result = Array.isArray(actualValue) && !actualValue.includes(condition.value); break;
            case 'starts_with': result = typeof actualValue === 'string' && actualValue.startsWith(condition.value); break;
            case 'ends_with': result = typeof actualValue === 'string' && actualValue.endsWith(condition.value); break;
            case 'regex': result = typeof actualValue === 'string' && new RegExp(condition.value).test(actualValue); break;
            default: result = false; break;
        }
        return condition.negate ? !result : result;
    }

    private evaluateRule(rule: FeatureRule, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean {
        const conjunction = rule.conjunction || 'AND';

        if (rule.conditions && rule.conditions.length > 0) {
            if (conjunction === 'AND') {
                for (const condition of rule.conditions) {
                    if (!this.evaluateCondition(condition, userProfile, evaluationContext)) {
                        return false;
                    }
                }
            } else { // OR
                let anyTrue = false;
                for (const condition of rule.conditions) {
                    if (this.evaluateCondition(condition, userProfile, evaluationContext)) {
                        anyTrue = true;
                        break;
                    }
                }
                if (!anyTrue) return false;
            }
        }

        if (rule.rules && rule.rules.length > 0) {
            if (conjunction === 'AND') {
                for (const nestedRule of rule.rules) {
                    if (!this.evaluateRule(nestedRule, userProfile, evaluationContext)) {
                        return false;
                    }
                }
            } else { // OR
                let anyTrue = false;
                for (const nestedRule of rule.rules) {
                    if (this.evaluateRule(nestedRule, userProfile, evaluationContext)) {
                        anyTrue = true;
                        break;
                    }
                }
                if (!anyTrue) return false;
            }
        }
        return true;
    }


    evaluateFeatureAccess(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean {
        // 1. Session Overrides (highest precedence)
        if (this.sessionOverrides.has(featureKey)) {
            return this.sessionOverrides.get(featureKey)!;
        }

        // 2. Explicit Grants/Denials for user
        if (userProfile.featuresGrantedExplicitly.includes(featureKey)) return true;
        if (userProfile.featuresDeniedExplicitly.includes(featureKey)) return false;

        const definition = this.getFeatureDefinition(featureKey);
        if (!definition) {
            console.warn(`Feature definition for ${featureKey} not found.`);
            return false; // Or throw error, depending on policy
        }

        if (definition.status !== 'active') return false; // Feature not active globally

        // 3. Dependency Check
        if (definition.dependencies && definition.dependencies.length > 0) {
            for (const depKey of definition.dependencies) {
                if (!this.evaluateFeatureAccess(depKey, userProfile, evaluationContext)) { // Recursive check
                    return false;
                }
            }
        }

        // 4. Conflict Check
        if (definition.conflicts && definition.conflicts.length > 0) {
            for (const conflictKey of definition.conflicts) {
                if (this.evaluateFeatureAccess(conflictKey, userProfile, evaluationContext)) {
                    // If a conflicting feature is active, this one cannot be
                    return false;
                }
            }
        }

        // 5. A/B Test Assignment (if applicable)
        let abTestActive = false;
        if (definition.abTestConfig) {
            const variant = mockExperimentManager.getExperimentVariant(userProfile.id, definition.abTestConfig.experimentId, definition.abTestConfig.defaultVariant);
            const variantDef = definition.abTestConfig.variants.find(v => v.variantKey === variant);
            if (variantDef && variantDef.rules) {
                abTestActive = this.evaluateRule({ conjunction: 'AND', rules: [ { conditions: [], rules: variantDef.rules } ] }, userProfile, evaluationContext);
            } else if (variantDef && variant !== definition.abTestConfig.defaultVariant) {
                abTestActive = true; // Assume variant itself makes it active
            }
            if (abTestActive) {
                // If the user is in an A/B test variant that activates the feature, return true
                mockAuditLogger.logFeatureEvent('FEATURE_ACCESSED', { featureKey, userId: userProfile.id, source: 'ab_test', variant });
                return true;
            }
        }


        // 6. Rollout Strategy
        if (definition.rolloutStrategy) {
            if (!mockFeatureRolloutManager.canRollout(featureKey, userProfile, evaluationContext)) {
                return false;
            }
        }

        // 7. Compliance Check
        if (!mockComplianceManager.checkCompliance(featureKey, userProfile, evaluationContext)) {
            return false;
        }

        // 8. Health Check
        if (mockFeatureHealthMonitor.getFeatureStatus(featureKey) !== 'healthy') {
            return false; // Do not activate unhealthy features
        }

        // 9. Main Activation Rules
        // If no specific rules, rely on enabledByDefault
        if (!definition.activationRules || definition.activationRules.length === 0) {
            return definition.enabledByDefault;
        }

        const overallRulesResult = this.evaluateRule({
            conjunction: 'AND', // Features typically require ALL activation rules to pass unless specified
            rules: definition.activationRules
        }, userProfile, evaluationContext);

        if (overallRulesResult) {
            // Potentially trigger AI personalization here for final decision if rules are met
            // For now, if rules pass, it's active.
            mockAuditLogger.logFeatureEvent('FEATURE_ACCESSED', { featureKey, userId: userProfile.id, source: 'activation_rules' });
            return true;
        }

        return false;
    }

    getFeatureConfig(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): Record<string, any> {
        const definition = this.getFeatureDefinition(featureKey);
        if (!definition) return {};

        let config = { ...definition.configPayload };

        // Overlay A/B test config
        if (definition.abTestConfig) {
            const variant = mockExperimentManager.getExperimentVariant(userProfile.id, definition.abTestConfig.experimentId, definition.abTestConfig.defaultVariant);
            const variantDef = definition.abTestConfig.variants.find(v => v.variantKey === variant);
            if (variantDef && variantDef.configPayload) {
                config = { ...config, ...variantDef.configPayload };
            }
        }

        // Overlay personalization config (simulated)
        if (definition.personalizationConfig?.aiModelId) {
            // In a real scenario, this would call a personalization engine
            // For now, we simulate a simple dynamic adjustment
            if (userProfile.behavioralScores.engagement_score > 0.8) {
                config.personalizationLevel = 'high';
                config.adaptiveContent = ['premium_news_feed'];
            }
        }

        return config;
    }

    overrideFeatureState(featureKey: FeatureKey, state: boolean): void {
        this.sessionOverrides.set(featureKey, state);
        mockAuditLogger.logFeatureEvent('FEATURE_OVERRIDE', { featureKey, state, userId: 'debug_user' });
    }

    clearFeatureOverrides(): void {
        this.sessionOverrides.clear();
        mockAuditLogger.logFeatureEvent('FEATURE_OVERRIDES_CLEARED', { userId: 'debug_user' });
    }
}

class MockExperimentManager implements IExperimentManager {
    private userExperimentAssignments = new Map<string, { experimentId: string; variant: string; }[]>();

    constructor() {
        // Simulate some user assignments
        this.userExperimentAssignments.set('user-123', [{ experimentId: 'DASHBOARD_V2_ROLLOUT', variant: 'treatment_new_layout' }]);
        this.userExperimentAssignments.set('user-456', [{ experimentId: 'DASHBOARD_V2_ROLLOUT', variant: 'control' }]);
    }

    getExperimentVariant(userId: string, experimentId: string, defaultVariant: string = 'control'): string {
        const assignments = this.userExperimentAssignments.get(userId) || [];
        const assignment = assignments.find(a => a.experimentId === experimentId);
        return assignment ? assignment.variant : defaultVariant;
    }

    recordExposure(userId: string, experimentId: string, variant: string, featureKey: FeatureKey): void {
        console.log(`[ExperimentManager] User ${userId} exposed to experiment ${experimentId}, variant ${variant} for feature ${featureKey}`);
        mockAuditLogger.logFeatureEvent('EXPERIMENT_EXPOSURE', { userId, experimentId, variant, featureKey });
    }

    trackConversion(userId: string, experimentId: string, variant: string, goalId: string, value?: number): void {
        console.log(`[ExperimentManager] User ${userId} converted for experiment ${experimentId}, variant ${variant}, goal ${goalId}`);
        mockAuditLogger.logFeatureEvent('EXPERIMENT_CONVERSION', { userId, experimentId, variant, goalId, value });
    }

    getUserExperiments(userId: string): { experimentId: string; variant: string; }[] {
        return this.userExperimentAssignments.get(userId) || [];
    }
}

class MockAuditLogger implements IAuditLogger {
    logFeatureEvent(eventType: string, payload: Record<string, any>): void {
        const timestamp = new Date().toISOString();
        console.log(`[AUDIT:${timestamp}] ${eventType} - ${JSON.stringify(payload)}`);
        // In a real app, this would send to an analytics/logging service
    }
    logError(errorType: string, message: string, details?: Record<string, any>): void {
        const timestamp = new Date().toISOString();
        console.error(`[ERROR:${timestamp}] ${errorType}: ${message} - ${JSON.stringify(details)}`);
    }
}

class MockDynamicContentService implements IDynamicContentService {
    async getDynamicContent(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext, tags?: string[]): Promise<Record<string, any>> {
        console.log(`[DynamicContentService] Fetching content for ${featureKey} with tags ${tags?.join(', ')}`);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 50));
        // Return different content based on feature key or user profile
        if (featureKey === 'DashboardView' && userProfile.segmentTags.includes('high_spender')) {
            return {
                title: 'Welcome Back, Valued Customer!',
                message: 'Check out our exclusive offers.',
                widgets: [{ id: 'vip_deals' }, { id: 'market_insights' }]
            };
        }
        return {
            title: `Content for ${featureKey}`,
            message: `This is dynamic content for ${featureKey}.`,
            widgets: [{ id: 'default_news' }]
        };
    }

    renderDynamicComponent(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext, slot: string): React.ReactNode {
        console.log(`[DynamicContentService] Rendering dynamic component for ${featureKey} in slot ${slot}`);
        // In a real app, this would use a component registry and load components dynamically
        if (slot === 'mainContent' && featureKey === 'DashboardView' && userProfile.behavioralScores.engagement_score > 0.8) {
            // Simulate a component being rendered
            return <div className="dynamic-dashboard-content bg-blue-100 p-4 rounded-lg"><h3>AI-Optimized Dashboard Layout!</h3><p>Your content is specially curated for you.</p></div>;
        }
        return null;
    }
}

class MockPersonalizationEngine implements IPersonalizationEngine {
    applyPersonalization(featureKey: FeatureKey, children: React.ReactNode, userProfile: UserProfile, evaluationContext: EvaluationContext): React.ReactNode {
        console.log(`[PersonalizationEngine] Applying personalization for ${featureKey} to children...`);
        // This could involve:
        // - Modifying props of children components
        // - Wrapping children with personalized UI elements
        // - Swapping out children based on AI recommendations
        if (featureKey === 'DashboardView' && userProfile.behavioralScores.conversion_likelihood > 0.7) {
            // Example: Injecting a personalized banner if conversion likelihood is high
            return (
                <>
                    <div className="personalized-banner bg-yellow-100 p-2 text-center">
                        🔥 Special Offer Just For You! Complete Your Profile Now!
                    </div>
                    {children}
                </>
            );
        }
        return children; // No personalization applied
    }

    async predictFeatureRelevance(userProfile: UserProfile, evaluationContext: EvaluationContext): Promise<{ featureKey: FeatureKey; score: number; }[]> {
        console.log(`[PersonalizationEngine] Predicting feature relevance for user ${userProfile.id}...`);
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate AI model inference time
        // Mock predictions
        const predictions: { featureKey: FeatureKey; score: number; }[] = [];
        if (userProfile.subscriptionTier === 'free') {
            predictions.push({ featureKey: 'AdvancedAnalyticsView', score: 0.1 }); // Low relevance
            predictions.push({ featureKey: 'BetaFeaturesToggle', score: 0.6 }); // Medium relevance
        } else if (userProfile.subscriptionTier === 'premium') {
            predictions.push({ featureKey: 'AdvancedAnalyticsView', score: 0.9 }); // High relevance
            predictions.push({ featureKey: 'BetaFeaturesToggle', score: 0.8 });
        }
        return predictions;
    }

    async optimizeFeatureConfig(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext, baseConfig: Record<string, any>): Promise<Record<string, any>> {
        console.log(`[PersonalizationEngine] Optimizing config for ${featureKey}...`);
        await new Promise(resolve => setTimeout(resolve, 50));
        if (featureKey === 'DashboardView' && userProfile.device.type === 'mobile') {
            return { ...baseConfig, defaultWidgetOrder: ['notifications', 'activity'], mobileOptimized: true };
        }
        return baseConfig;
    }
}

class MockFeatureHealthMonitor implements IFeatureHealthMonitor {
    private featureStatuses = new Map<FeatureKey, 'healthy' | 'degraded' | 'unresponsive'>();
    private healthChecks = new Map<FeatureKey, () => Promise<boolean>>();

    constructor() {
        // Initialize all features as healthy
        MOCK_FEATURE_DEFINITIONS.forEach(def => this.featureStatuses.set(def.key, 'healthy'));
        // Simulate a degraded feature
        this.featureStatuses.set('AdvancedAnalyticsView', 'degraded');
    }

    reportFeatureStatus(featureKey: FeatureKey, status: 'healthy' | 'degraded' | 'unresponsive', metrics?: Record<string, any>): void {
        this.featureStatuses.set(featureKey, status);
        console.log(`[FeatureHealthMonitor] Feature ${featureKey} status updated to ${status}. Metrics: ${JSON.stringify(metrics)}`);
        mockAuditLogger.logFeatureEvent('FEATURE_STATUS_UPDATE', { featureKey, status, metrics });
    }

    getFeatureStatus(featureKey: FeatureKey): 'healthy' | 'degraded' | 'unresponsive' {
        return this.featureStatuses.get(featureKey) || 'healthy'; // Default to healthy if unknown
    }

    registerHealthCheck(featureKey: FeatureKey, checkFunction: () => Promise<boolean>): void {
        this.healthChecks.set(featureKey, checkFunction);
        console.log(`[FeatureHealthMonitor] Health check registered for ${featureKey}.`);
    }

    async runAllHealthChecks(): Promise<void> {
        for (const [key, check] of this.healthChecks.entries()) {
            try {
                const isHealthy = await check();
                this.reportFeatureStatus(key, isHealthy ? 'healthy' : 'degraded');
            } catch (error: any) {
                this.reportFeatureStatus(key, 'unresponsive', { error: error.message });
                mockAuditLogger.logError('HEALTH_CHECK_FAILURE', `Health check for ${key} failed.`, { error: error.message });
            }
        }
    }
}

class MockComplianceManager implements IComplianceManager {
    private complianceRules = new Map<FeatureKey, { rule: (user: UserProfile, context: EvaluationContext) => boolean, category: string }[]>();

    constructor() {
        // Example: GDPR rule for a specific feature
        this.registerComplianceRule('GDPRConsentManagement', (user, context) =>
            user.geoLocation.country === 'DE' || user.geoLocation.country === 'FR', 'GDPR'
        );
        this.registerComplianceRule('AdvancedAnalyticsView', (user, context) =>
            !user.segmentTags.includes('gdpr_restricted_data'), 'GDPR'
        );
    }

    checkCompliance(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean {
        const rules = this.complianceRules.get(featureKey);
        if (!rules || rules.length === 0) {
            return true; // No specific compliance rules, assume compliant
        }
        for (const { rule, category } of rules) {
            if (!rule(userProfile, evaluationContext)) {
                console.warn(`[ComplianceManager] Feature ${featureKey} failed compliance check for category ${category} for user ${userProfile.id}`);
                mockAuditLogger.logFeatureEvent('COMPLIANCE_FAILURE', { featureKey, userId: userProfile.id, category });
                return false;
            }
        }
        return true;
    }

    getComplianceReport(featureKey: FeatureKey): Promise<Record<string, any>> {
        console.log(`[ComplianceManager] Generating compliance report for ${featureKey}...`);
        return Promise.resolve({
            featureKey,
            gdprStatus: 'Compliant (mock)',
            hipaaStatus: 'N/A (mock)',
            lastAudit: new Date().toISOString()
        });
    }

    registerComplianceRule(featureKey: FeatureKey, rule: (user: UserProfile, context: EvaluationContext) => boolean, category: string): void {
        const currentRules = this.complianceRules.get(featureKey) || [];
        this.complianceRules.set(featureKey, [...currentRules, { rule, category }]);
    }
}

class MockFeatureRolloutManager implements IFeatureRolloutManager {
    private featureRolloutStates = new Map<FeatureKey, { currentProgress: number; issues: number; }>();

    canRollout(featureKey: FeatureKey, userProfile: UserProfile, evaluationContext: EvaluationContext): boolean {
        const definition = mockFeatureService.getFeatureDefinition(featureKey);
        if (!definition || !definition.rolloutStrategy) return true; // No specific strategy, allow

        switch (definition.rolloutStrategy) {
            case 'all': return true;
            case 'percentage':
                const percentage = definition.rolloutConfig?.percentage || 0;
                // Simple hash-based percentage rollout for a user
                const hash = userProfile.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                return (hash % 100) < percentage;
            case 'canary':
                // For canary, typically target specific segments or small internal groups
                return userProfile.segmentTags.includes('internal_tester') || userProfile.segmentTags.includes('canary_user');
            case 'targeted_segment':
                const targetSegments = definition.rolloutConfig?.segmentTags || [];
                return targetSegments.some(tag => userProfile.segmentTags.includes(tag));
            case 'time_based':
                const startTime = definition.rolloutConfig?.startTime;
                const endTime = definition.rolloutConfig?.endTime;
                const now = evaluationContext.currentTime;
                return (!startTime || now >= startTime) && (!endTime || now <= endTime);
            default: return true;
        }
    }

    monitorRolloutProgress(featureKey: FeatureKey): { progress: number; issuesDetected: number; } {
        return this.featureRolloutStates.get(featureKey) || { progress: 0, issuesDetected: 0 };
    }

    async initiateRollback(featureKey: FeatureKey, reason: string): Promise<boolean> {
        console.warn(`[FeatureRolloutManager] Initiating rollback for ${featureKey} due to: ${reason}`);
        mockAuditLogger.logFeatureEvent('FEATURE_ROLLBACK', { featureKey, reason });
        // In a real system, this would trigger CI/CD pipelines or config updates
        return true;
    }

    async scheduleRollout(featureKey: FeatureKey, config: FeatureDefinition['rolloutConfig']): Promise<boolean> {
        console.log(`[FeatureRolloutManager] Scheduling rollout for ${featureKey} with config: ${JSON.stringify(config)}`);
        mockAuditLogger.logFeatureEvent('FEATURE_ROLLOUT_SCHEDULED', { featureKey, config });
        return true;
    }
}

class MockFeatureStateCache implements IFeatureStateCache {
    private cache = new Map<string, { value: FeatureConfiguration, expires: number | null }>();

    get(key: string): FeatureConfiguration | undefined {
        const entry = this.cache.get(key);
        if (entry && (entry.expires === null || entry.expires > Date.now())) {
            return entry.value;
        }
        if (entry) { // Expired
            this.cache.delete(key);
        }
        return undefined;
    }

    set(key: string, value: FeatureConfiguration, ttlSeconds?: number): void {
        const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.cache.set(key, { value, expires });
    }

    invalidate(key: string): void {
        this.cache.delete(key);
        console.log(`[FeatureStateCache] Invalidated cache for ${key}`);
    }

    invalidateAll(): void {
        this.cache.clear();
        console.log('[FeatureStateCache] All cache invalidated.');
    }

    async warmCache(featureKeys: FeatureKey[]): Promise<void> {
        console.log(`[FeatureStateCache] Warming cache for ${featureKeys.length} features...`);
        // In a real scenario, this would pre-fetch and evaluate features for common profiles
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('[FeatureStateCache] Cache warmed.');
    }
}


// Instantiate all mock services (these would be injected in a real app)
const mockFeatureService = new MockFeatureService(MOCK_FEATURE_DEFINITIONS);
const mockExperimentManager = new MockExperimentManager();
const mockAuditLogger = new MockAuditLogger();
const mockDynamicContentService = new MockDynamicContentService();
const mockPersonalizationEngine = new MockPersonalizationEngine();
const mockFeatureHealthMonitor = new MockFeatureHealthMonitor();
const mockComplianceManager = new MockComplianceManager();
const mockFeatureRolloutManager = new MockFeatureRolloutManager();
const mockFeatureStateCache = new MockFeatureStateCache();

// This context will be provided at a high level in the application
export const FeatureSystemContext = createContext<FeatureSystemContextType | undefined>(undefined);

/**
 * Provides the entire Feature System context to its children.
 * This component would typically wrap your entire application or a major section.
 */
export const FeatureSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // In a real app, userProfile and evaluationContext would be dynamic
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
        id: 'user-123',
        email: 'john.doe@example.com',
        roles: ['user', 'analyst'],
        subscriptionTier: 'premium',
        organizationId: 'org-abc',
        segmentTags: ['high_engagement', 'premium_user'],
        geoLocation: { country: 'US', region: 'CA', city: 'San Francisco' },
        device: {
            type: 'desktop',
            os: 'macOS',
            browser: 'chrome',
            language: 'en-US',
            screenResolution: '1920x1080',
            isTouchEnabled: false,
        },
        preferences: { theme: 'dark' },
        behavioralScores: { engagement_score: 0.9, conversion_likelihood: 0.75, churn_risk: 0.1 },
        lastLogin: new Date(),
        featuresGrantedExplicitly: [],
        featuresDeniedExplicitly: [],
        sessionData: {},
        isLoggedIn: true,
        accountAgeDays: 365,
        lastActivityTimestamp: new Date(),
    });

    const [currentEvaluationContext, setCurrentEvaluationContext] = useState<EvaluationContext>({
        currentTime: new Date(),
        currentUrl: window.location.href,
        environment: 'development', // In production, this would be 'production'
        appVersion: '1.0.0',
        activeExperiments: mockExperimentManager.getUserExperiments(currentUserProfile.id),
        isOffline: !navigator.onLine,
        systemLoadMetrics: { cpuUsage: 0.2, memoryUsage: 0.4, networkLatency: 50 },
    });

    // Update context on route changes or network status
    useEffect(() => {
        const handleOnline = () => setCurrentEvaluationContext(prev => ({ ...prev, isOffline: false }));
        const handleOffline = () => setCurrentEvaluationContext(prev => ({ ...prev, isOffline: true }));
        const handleUrlChange = () => setCurrentEvaluationContext(prev => ({ ...prev, currentUrl: window.location.href }));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('popstate', handleUrlChange); // Listen for browser navigation

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const featureContextValue = useMemo(() => ({
        featureService: mockFeatureService,
        userProfile: currentUserProfile,
        evaluationContext: currentEvaluationContext,
        experimentManager: mockExperimentManager,
        auditLogger: mockAuditLogger,
        dynamicContentService: mockDynamicContentService,
        personalizationEngine: mockPersonalizationEngine,
        featureHealthMonitor: mockFeatureHealthMonitor,
        complianceManager: mockComplianceManager,
        featureRolloutManager: mockFeatureRolloutManager,
        featureStateCache: mockFeatureStateCache,
    }), [currentUserProfile, currentEvaluationContext]);

    // Example of proactively warming cache and running health checks
    useEffect(() => {
        mockFeatureStateCache.warmCache(MOCK_FEATURE_DEFINITIONS.map(def => def.key));
        mockFeatureHealthMonitor.runAllHealthChecks();
        const healthCheckInterval = setInterval(() => mockFeatureHealthMonitor.runAllHealthChecks(), 5 * 60 * 1000); // Every 5 minutes
        return () => clearInterval(healthCheckInterval);
    }, []);

    return (
        <FeatureSystemContext.Provider value={featureContextValue}>
            {children}
        </FeatureSystemContext.Provider>
    );
};


// --- 4. The FeatureGuard Component: The Gatekeeper of the Universe ---

interface FeatureGuardProps {
    view: View; // The original prop, now interpreted as the FeatureKey
    children: React.ReactNode;
    fallback?: React.ReactNode; // Optional custom fallback UI
    fallbackComponentKey?: string; // Key to a registered fallback component
    hideIfDenied?: boolean; // If true, renders null instead of fallback
    disableInteractionIfDenied?: boolean; // If true, wraps children in a disabled state
    showLoadingState?: boolean; // If true, shows loading spinner while evaluating
}

/**
 * FeatureGuard is the central component for conditional rendering based on feature access.
 * It orchestrates checks across the entire feature management system, applying complex
 * rules, A/B tests, personalization, and compliance checks.
 */
const FeatureGuard: React.FC<FeatureGuardProps> = ({
    view,
    children,
    fallback,
    fallbackComponentKey,
    hideIfDenied = false,
    disableInteractionIfDenied = false,
    showLoadingState = false,
}) => {
    const context = useContext(FeatureSystemContext);

    if (!context) {
        // This indicates a misconfiguration where FeatureSystemProvider is not used.
        mockAuditLogger.logError('FEATURE_GUARD_ERROR', 'FeatureSystemContext not provided. FeatureGuard cannot operate.', { view });
        console.error("FeatureSystemContext not provided. Ensure FeatureSystemProvider wraps your application.");
        return (
            <div style={{ border: '1px solid red', padding: '10px', color: 'red' }}>
                Error: Feature system not initialized. (View: {view})
            </div>
        );
    }

    const {
        featureService,
        userProfile,
        evaluationContext,
        auditLogger,
        dynamicContentService,
        personalizationEngine,
        featureStateCache,
        experimentManager
    } = context;

    const featureKey: FeatureKey = view; // Treat the 'view' prop directly as the FeatureKey

    const [isLoading, setIsLoading] = useState(true);
    const [canAccess, setCanAccess] = useState(false);
    const [featureConfig, setFeatureConfig] = useState<Record<string, any>>({});
    const [dynamicContent, setDynamicContent] = useState<Record<string, any> | null>(null);

    // Memoize the expensive evaluation logic
    const evaluateAndFetchFeature = useCallback(async () => {
        setIsLoading(true);
        const cacheKey = `${featureKey}-${userProfile.id}-${evaluationContext.environment}`;
        let cachedState = featureStateCache.get(cacheKey);

        if (cachedState) {
            setCanAccess(cachedState.isActive);
            setFeatureConfig(cachedState.payload);
            setIsLoading(false);
            auditLogger.logFeatureEvent('FEATURE_EVALUATED', { featureKey, userId: userProfile.id, source: 'cache', isActive: cachedState.isActive });
            return;
        }

        const isAccessible = featureService.evaluateFeatureAccess(featureKey, userProfile, evaluationContext);
        setCanAccess(isAccessible);

        let config: Record<string, any> = {};
        let content: Record<string, any> | null = null;

        if (isAccessible) {
            config = featureService.getFeatureConfig(featureKey, userProfile, evaluationContext);
            config = await personalizationEngine.optimizeFeatureConfig(featureKey, userProfile, evaluationContext, config);

            const definition = featureService.getFeatureDefinition(featureKey);
            if (definition?.personalizationConfig?.dynamicContentTags?.length) {
                try {
                    content = await dynamicContentService.getDynamicContent(featureKey, userProfile, evaluationContext, definition.personalizationConfig.dynamicContentTags);
                    setDynamicContent(content);
                } catch (e: any) {
                    auditLogger.logError('DYNAMIC_CONTENT_FETCH_FAILED', `Failed to fetch dynamic content for ${featureKey}`, { error: e.message });
                }
            }

            // Record exposure to A/B tests if this feature is part of one
            if (definition?.abTestConfig) {
                const variant = experimentManager.getExperimentVariant(userProfile.id, definition.abTestConfig.experimentId);
                experimentManager.recordExposure(userProfile.id, definition.abTestConfig.experimentId, variant, featureKey);
            }

            auditLogger.logFeatureEvent('FEATURE_ACCESSED', { featureKey, userId: userProfile.id, config });
        } else {
            auditLogger.logFeatureEvent('FEATURE_DENIED', { featureKey, userId: userProfile.id, reason: 'policy_violation' });
        }

        const featureConfiguration: FeatureConfiguration = {
            featureKey,
            isActive: isAccessible,
            payload: config,
            source: 'runtime_evaluation', // Could be more specific
        };
        featureStateCache.set(cacheKey, featureConfiguration, mockFeatureService.getFeatureDefinition(featureKey)?.cacheTTLSeconds || 300); // Cache for 5 mins

        setFeatureConfig(config);
        setIsLoading(false);
    }, [featureKey, userProfile, evaluationContext, featureService, auditLogger, dynamicContentService, personalizationEngine, featureStateCache, experimentManager]);

    useEffect(() => {
        evaluateAndFetchFeature();
    }, [evaluateAndFetchFeature]);


    if (isLoading && showLoadingState) {
        return (
            <div className="feature-guard-loading p-4 text-center text-gray-500">
                <span className="animate-spin inline-block mr-2">⚙️</span>
                Loading feature: {featureKey}...
            </div>
        );
    }

    if (!canAccess) {
        const definition = featureService.getFeatureDefinition(featureKey);
        auditLogger.logFeatureEvent('FEATURE_RENDER_DENIED_FALLBACK', { featureKey, userId: userProfile.id });

        if (hideIfDenied) {
            return null; // Don't render anything
        }

        // Render custom fallback if provided
        if (fallback) {
            return <>{fallback}</>;
        }

        // Render fallback component by key
        if (fallbackComponentKey) {
            // In a real app, this would use a component registry/loader
            switch (fallbackComponentKey) {
                case 'AccessDeniedMessage': return <AccessDeniedMessage feature={featureKey} message="You do not have access to this feature." />;
                case 'UpgradePrompt': return <UpgradePrompt feature={featureKey} />;
                default: return <DefaultFallbackComponent feature={featureKey} message={`Feature Guard: Access Denied to ${featureKey}. Custom component missing.`} />;
            }
        }

        // Render fallback based on feature definition
        if (definition?.fallbackBehavior === 'render_component' && definition.fallbackComponent) {
            // Dynamic component loading logic here
            return <DefaultFallbackComponent feature={featureKey} message={`Feature Guard: Access Denied to ${featureKey}. Rendering fallback component: ${definition.fallbackComponent}`} />;
        }
        if (definition?.fallbackBehavior === 'redirect' && definition.fallbackRedirectPath) {
            // history.push(definition.fallbackRedirectPath); // Requires router access
            return <DefaultFallbackComponent feature={featureKey} message={`Redirecting to ${definition.fallbackRedirectPath}...`} />;
        }
        if (definition?.fallbackBehavior === 'show_message' && definition.fallbackMessage) {
            return <DefaultFallbackComponent feature={featureKey} message={definition.fallbackMessage} />;
        }

        // Default fallback
        return <DefaultFallbackComponent feature={featureKey} message={`Feature Guard: Access Denied to ${featureKey}.`} />;
    }

    // Feature is accessible!
    let renderedChildren = children;

    // Apply AI-driven personalization to children
    renderedChildren = personalizationEngine.applyPersonalization(featureKey, renderedChildren, userProfile, evaluationContext);

    // Inject dynamic content as props or context if needed.
    // This is a simple example, a robust system would use render props or a dedicated ContentContext.
    const childrenWithDynamicProps = React.Children.map(renderedChildren, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, {
                featureConfig,
                dynamicContent,
                userProfile,
                evaluationContext,
                // Pass a method to track conversions if the feature is tied to an experiment goal
                trackConversion: (goalId: string, value?: number) => {
                    const definition = featureService.getFeatureDefinition(featureKey);
                    if (definition?.abTestConfig) {
                        const variant = experimentManager.getExperimentVariant(userProfile.id, definition.abTestConfig.experimentId);
                        experimentManager.trackConversion(userProfile.id, definition.abTestConfig.experimentId, variant, goalId, value);
                    }
                }
            });
        }
        return child;
    });

    if (disableInteractionIfDenied && !canAccess) {
        // If feature becomes inaccessible dynamically (e.g., health monitor changes status),
        // or for testing, wrap children in a disabled state.
        return (
            <div className="feature-guard-disabled-overlay relative">
                <div className="absolute inset-0 bg-gray-200 opacity-50 z-10 cursor-not-allowed flex items-center justify-center">
                    <span className="text-gray-700 font-bold">Access Disabled</span>
                </div>
                <div className="pointer-events-none opacity-70">
                    {childrenWithDynamicProps}
                </div>
            </div>
        );
    }


    // Render children with all dynamic enhancements
    return <>{childrenWithDynamicProps}</>;
};

export default FeatureGuard;

// --- 5. Supporting UI Components for Fallbacks and Debugging ---

interface FallbackComponentProps {
    feature: FeatureKey;
    message: string;
    action?: { label: string; onClick: () => void; };
}

export const DefaultFallbackComponent: React.FC<FallbackComponentProps> = ({ feature, message, action }) => (
    <div className="feature-guard-fallback p-4 border border-red-300 bg-red-50 rounded-md text-red-700">
        <h4 className="font-bold">Feature Unavailable: {feature}</h4>
        <p>{message}</p>
        {action && (
            <button
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={action.onClick}
            >
                {action.label}
            </button>
        )}
    </div>
);

export const AccessDeniedMessage: React.FC<{ feature: FeatureKey; message: string; }> = ({ feature, message }) => (
    <div className="feature-guard-access-denied p-4 bg-yellow-50 border border-yellow-300 rounded text-yellow-800">
        <h4 className="font-bold">Access Denied!</h4>
        <p>You do not have the required permissions to access "{feature}": {message}</p>
        <button className="mt-2 text-blue-600 hover:underline" onClick={() => mockAuditLogger.logFeatureEvent('REQUEST_ACCESS', { feature })}>Request Access</button>
    </div>
);

export const UpgradePrompt: React.FC<{ feature: FeatureKey; }> = ({ feature }) => (
    <div className="feature-guard-upgrade-prompt p-4 bg-blue-50 border border-blue-300 rounded text-blue-800 text-center">
        <h4 className="font-bold">Unlock "{feature}"!</h4>
        <p>Upgrade your subscription to Premium to access this powerful feature and many more.</p>
        <button className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors" onClick={() => window.location.href = '/upgrade'}>
            Upgrade Now
        </button>
    </div>
);

export const FeatureDebugPanel: React.FC = () => {
    const context = useContext(FeatureSystemContext);
    if (!context || context.evaluationContext.environment !== 'development') return null;

    const [featureKey, setFeatureKey] = useState<FeatureKey>('');
    const [overrideState, setOverrideState] = useState<boolean | 'default'>('default');

    const handleOverride = () => {
        if (overrideState === 'default') {
            context.featureService.clearFeatureOverrides();
        } else {
            context.featureService.overrideFeatureState(featureKey, overrideState);
        }
    };

    return (
        <div className="feature-debug-panel fixed bottom-4 right-4 bg-white p-4 border border-gray-300 rounded shadow-lg z-50">
            <h5 className="font-bold text-lg mb-2">Feature Debug Panel</h5>
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Feature Key:</label>
                <input
                    type="text"
                    value={featureKey}
                    onChange={(e) => setFeatureKey(e.target.value as View)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., DashboardView"
                />
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">Override State:</label>
                <select
                    value={overrideState.toString()}
                    onChange={(e) => setOverrideState(e.target.value === 'default' ? 'default' : e.target.value === 'true')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="default">Default (clear override)</option>
                    <option value="true">Force Enabled</option>
                    <option value="false">Force Disabled</option>
                </select>
            </div>
            <button
                onClick={handleOverride}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Apply Override
            </button>
            <p className="text-xs text-gray-500 mt-2">Current User ID: {context.userProfile.id}</p>
        </div>
    );
};
