import { View } from '../../types'; // Original View type from the codebase

// --- 1. Core Data Structures: The Universe of Features, Rules, and Contexts ---

/**
 * A unique identifier for a feature. In this universe, the `View` type from `../../types`
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

// --- Mock Implementations (as if fetched from a backend or global state) ---
// In a real application, these would be sophisticated client-side SDKs interacting
// with backend microservices, event streams, and AI models.

export const MOCK_FEATURE_DEFINITIONS: FeatureDefinition[] = [
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