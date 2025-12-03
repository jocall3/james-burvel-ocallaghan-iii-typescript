/**
 * This module defines the foundational data structures and schemata for the enterprise-grade Feature System.
 * It establishes a robust framework for dynamically controlling application behavior, user experience, and access to critical
 * functionalities based on a sophisticated rules engine, contextual data, and AI-driven insights.
 *
 * Business Value: This system is pivotal for driving rapid innovation and monetization. It allows product teams to
 * deploy, test, and iterate on features with unparalleled agility, enabling A/B testing, phased rollouts, and
 * personalized experiences without costly redeployments. By integrating with agentic AI, digital identity, and
 * real-time payments infrastructure, it provides granular control over transaction flows, compliance mandates,
 * and security protocols, reducing operational risk, ensuring regulatory adherence, and unlocking new revenue streams
 * through dynamic pricing and feature gating. This programmable control layer enhances competitive advantage by
 * accelerating time-to-market for new financial products and services, ensuring secure and performant delivery at scale.
 */

import { View } from '../../types'; // Original View type from the codebase
import { SignatureAlgorithm, HashAlgorithm } from '../../../vendor/crypto'; // Assuming these are now available or vendored

// --- 1. Core Data Structures: The Universe of Features, Rules, and Contexts ---

/**
 * A unique identifier for a feature. In this universe, the `View` type from `../../types`
 * is assumed to serve as the FeatureKey. This allows `FeatureGuard` to directly
 * interpret the `view` prop as the feature it's guarding.
 */
export type FeatureKey = View;

/**
 * Defines the comprehensive context available during feature evaluation.
 * This aggregates various data points from different systems to provide a holistic view
 * for granular access control and personalization.
 */
export interface FeatureEvaluationContext {
    user: UserContext;
    organization: OrganizationContext;
    device: DeviceContext;
    environment: EnvironmentContext;
    system: SystemContext;
    ai: AIContext; // Context from AI agents or models
    identity: IdentityContext; // Digital identity claims and verifiable credentials
    payment: PaymentFlowContext; // Real-time payment request details
    agent: AgentRuntimeContext; // Context provided by an orchestrating agent
    custom: Record<string, any>; // Flexible placeholder for any additional custom context
}

/**
 * Detailed context for the current user.
 */
export interface UserContext {
    id: string;
    isLoggedIn: boolean;
    roles: string[];
    subscriptionTier: 'free' | 'premium' | 'enterprise';
    accountAgeDays: number;
    geoLocation: {
        country: string;
        region?: string;
        city?: string;
    };
    preferences: Record<string, any>;
    segmentTags: string[]; // From marketing/behavioral segmentation
    riskScore?: number; // From fraud detection systems
    transactionHistorySummary?: {
        totalTxCount: number;
        highValueTxCount: number;
        avgTxValue: number;
        lastTxDate: Date;
    };
}

/**
 * Detailed context for the user's organization.
 */
export interface OrganizationContext {
    id: string;
    name: string;
    industry: string;
    size: number; // e.g., number of employees
    subscriptionTier: 'starter' | 'business' | 'corporate';
    complianceCertifications: string[]; // e.g., 'SOC2', 'PCI-DSS', 'ISO27001'
    trustScore?: number; // From enterprise risk assessment
}

/**
 * Detailed context for the accessing device.
 */
export interface DeviceContext {
    type: 'mobile' | 'desktop' | 'tablet' | 'iot' | 'server';
    os: string;
    browser: string;
    ipAddress: string;
    isTrusted: boolean; // From device security posture assessment
    location: {
        latitude: number;
        longitude: number;
    };
}

/**
 * Detailed context for the operating environment.
 */
export interface EnvironmentContext {
    name: 'development' | 'staging' | 'production' | 'test';
    region: string; // e.g., 'us-east-1'
    deployVersion: string;
    maintenanceMode: boolean;
    loadLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Detailed context from internal system states.
 */
export interface SystemContext {
    currentTime: Date;
    marketCondition: 'bull' | 'bear' | 'stable';
    exchangeRates: Record<string, number>; // e.g., { 'USD/EUR': 0.9 }
    serviceStatus: Record<string, 'operational' | 'degraded' | 'down'>;
}

/**
 * Context derived from AI agents or machine learning models.
 */
export interface AIContext {
    predictedUserIntent?: string;
    personalizationScore?: number; // Likelihood of engaging with a personalized element
    anomalyDetected?: boolean;
    anomalyScore?: number;
    segmentTags: string[]; // AI-driven segmentation
    recommendedActions?: string[];
    riskAssessment?: {
        score: number;
        category: 'low' | 'medium' | 'high' | 'critical';
        reasons: string[];
    };
}

/**
 * Context pertaining to digital identity claims and verifiable credentials.
 * Aligns with the digital identity infrastructure.
 */
export interface IdentityContext {
    hasVerifiedIdentity: boolean;
    verifiedCredentialClaims: Record<string, any>; // e.g., { 'name': 'John Doe', 'age': 30, 'KYC_level': 'AML3' }
    digitalSignatureValidity: boolean; // Indicates if current session is cryptographically signed
    trustFramework: 'DID' | 'SSI' | 'OAuth' | 'local';
    attestationLevel: 'low' | 'medium' | 'high'; // Strength of identity attestation
}

/**
 * Context for a real-time payment flow, crucial for payment-gated features.
 * Aligns with the real-time payments infrastructure.
 */
export interface PaymentFlowContext {
    transactionId?: string; // Unique ID for the payment request
    amount: number;
    currency: string;
    paymentMethodType: 'card' | 'bank_transfer' | 'crypto' | 'digital_wallet';
    recipientId: string;
    senderId: string;
    fraudScore: number; // Real-time fraud detection score
    isHighValue: boolean;
    isCrossBorder: boolean;
    paymentRailPreference?: 'rail_fast' | 'rail_batch' | 'best_effort';
    status?: 'pending' | 'approved' | 'declined';
}

/**
 * Context provided by an orchestrating agent.
 * Aligns with the agentic AI system.
 */
export interface AgentRuntimeContext {
    agentId: string;
    agentRole: string; // e.g., 'FraudDetectionAgent', 'ReconciliationAgent', 'TradingAgent'
    agentDecision: 'allow' | 'block' | 'flag' | 'recommend';
    decisionConfidence: number; // Confidence level of the agent's decision (0-1)
    triggeredSkills: string[]; // List of agent skills that were activated
    lastAgentInteraction?: Date;
    policyViolationDetected?: boolean;
}

/**
 * Defines a single condition for a feature rule.
 * Can be simple or complex, supporting various operators and data types,
 * now extended to include agent, identity, and payment contexts.
 */
export interface FeatureCondition {
    target: 'user' | 'organization' | 'device' | 'environment' | 'system' | 'ai' | 'identity' | 'payment' | 'agent' | 'custom';
    property: string; // e.g., 'roles', 'subscriptionTier', 'country', 'browser', 'segmentTags', 'verifiedCredentialClaims.KYC_level', 'fraudScore', 'agentDecision'
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notin' | 'has' | 'nothas' | 'starts_with' | 'ends_with' | 'regex';
    value: any; // The value to compare against
    negate?: boolean; // If true, the condition is inverted (NOT operator)
    description?: string; // Optional human-readable description for clarity
}

/**
 * Represents a logical grouping of conditions.
 * Rules can be nested to form complex boolean expressions (AND/OR trees).
 * Supports sophisticated policy definition for access and behavior.
 */
export interface FeatureRule {
    conditions?: FeatureCondition[];
    rules?: FeatureRule[]; // Nested rules for AND/OR logic
    conjunction?: 'AND' | 'OR'; // How to combine conditions/nested rules
    description?: string; // Human-readable description of the rule
}

/**
 * Defines a policy for auditing access and modification to a feature.
 * Critical for compliance, security, and operational governance.
 */
export interface AuditTrailPolicy {
    enabled: boolean;
    retentionDays: number; // How long audit logs are kept
    logLevel: 'minimal' | 'detailed' | 'debug'; // Granularity of logs
    includeContext: ('user' | 'device' | 'agent' | 'all')[]; // Which context to include in logs
    tamperDetection: {
        enabled: boolean;
        hashAlgorithm?: HashAlgorithm; // e.g., 'SHA256', 'SHA3'
        chainingEnabled?: boolean; // For immutable audit trails
    };
    alertOnFailedAccess?: boolean; // Trigger alerts if access is denied
}

/**
 * Defines security-related policies for a feature.
 * Integrates with digital identity and security infrastructure.
 */
export interface FeatureSecurityPolicy {
    accessControlMechanism: 'RBAC' | 'ABAC' | 'PBAC'; // Role-based, attribute-based, or policy-based access control
    requiredAuthenticationLevel: 'low' | 'medium' | 'high' | 'MFA_required';
    dataSensitivityLevel: 'public' | 'confidential' | 'restricted' | 'secret';
    encryptionRequired: boolean; // For any data associated with the feature
    threatDetectionIntegration: {
        enabled: boolean;
        blockingThreshold?: number; // Fraud/threat score that blocks access
        alertOnThreat?: boolean;
    };
    leastPrivilegeEnforcement: boolean;
    cryptographicSignaturesRequired: boolean; // For actions or data related to the feature
}

/**
 * Defines resource consumption and management policies for a feature.
 * Important for performance and cost control in cloud environments.
 */
export interface FeatureResourcePolicy {
    cpuEstimate: number; // Estimated CPU usage (e.g., in vCPU units)
    memoryEstimate: number; // Estimated memory usage (e.g., in MB)
    networkEstimate: number; // Estimated network bandwidth (e.g., in Mbps)
    peakConcurrencyEstimate: number; // Expected concurrent users/requests
    rateLimits?: {
        perUser?: number; // requests per second
        global?: number; // requests per second
    };
    cacheConfig?: {
        enabled: boolean;
        ttlSeconds?: number;
        revalidationStrategy?: 'stale-while-revalidate' | 'cache-first';
    };
}

/**
 * Defines data governance and compliance policies for a feature.
 * Essential for regulatory compliance and data privacy.
 */
export interface FeatureDataGovernancePolicy {
    complianceCategories: string[]; // e.g., 'GDPR', 'HIPAA', 'CCPA', 'PCI-DSS', 'AML'
    dataAccessRequirements: string[]; // e.g., 'PII_access_required', 'financial_data_access'
    jurisdictionRestrictions?: string[]; // e.g., ['EU', 'US']
    dataRetentionPolicy?: {
        policyId: string;
        details: string; // Link to detailed retention policy document
    };
    regulatoryApprovalRequired: boolean; // If feature deployment requires explicit regulatory sign-off
    dataSubjectRightsImpactAssessment?: string; // Link to DSRIA document
}

/**
 * Defines a structured event hook triggered by feature lifecycle events.
 * Integrates with internal event bus or external webhooks for observability and orchestration.
 */
export interface FeatureEventHook {
    type: 'webhook' | 'internal_event' | 'message_queue';
    endpoint?: string; // URL for webhook or topic/queue name for message queue
    eventName?: string; // Internal event identifier
    payloadSchema?: Record<string, any>; // JSON schema for the event payload
    authentication?: {
        type: 'apiKey' | 'oauth' | 'signature';
        secretRef?: string; // Reference to a secret in a secure vault
    };
    async?: boolean; // Whether the hook should be processed asynchronously
}

/**
 * Defines the schema for a feature's dynamic configuration payload.
 * Ensures type safety and validation for runtime configurations.
 */
export interface FeatureSchemaDefinition {
    type: 'object';
    properties: Record<string, {
        type: 'string' | 'number' | 'boolean' | 'array' | 'object';
        description?: string;
        required?: boolean;
        default?: any;
        enum?: any[];
        items?: FeatureSchemaDefinition; // For array types
        properties?: Record<string, FeatureSchemaDefinition>; // For object types
    }>;
    required?: string[];
    description?: string;
}

/**
 * Defines a complete feature, including its activation rules, dependencies, and metadata.
 * This is the central registry for all features in the application, now significantly
 * expanded for Money20/20 build phase requirements.
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
        deviceRestriction?: ('mobile' | 'desktop')[];
        organizationRolloutKey?: string; // For A/B testing across organizations
    };
    // A/B testing integration
    abTestConfig?: {
        experimentId: string;
        variants: {
            variantKey: string;
            rules?: FeatureRule[]; // Specific rules for this variant
            configPayload?: Record<string, any>; // Configuration for this variant
            trafficWeight?: number; // Percentage of traffic for this variant (0-1)
        }[];
        defaultVariant: string;
        stickinessKey?: 'user' | 'organization' | 'device'; // Ensures consistent variant assignment
    };
    // AI-driven personalization and agentic AI integration
    personalizationConfig?: {
        aiModelId?: string; // Model to use for predictive personalization
        predictionThreshold?: number; // Confidence threshold for AI activation (0-1)
        dynamicContentTags?: string[]; // Tags for content to be fetched/generated by AI
        adaptiveUIComponents?: Record<string, string>; // Maps component slots to AI-selected components
        agentDecisionIntegration?: {
            enabled: boolean;
            requiredConfidence?: number;
            agentRoles?: string[]; // Only agents with these roles can influence feature
            fallbackOnAgentFailure?: 'hide' | 'default_behavior';
        };
    };
    // Feature configurations that can be dynamically loaded, with schema validation
    configPayload?: Record<string, any>;
    configSchema?: FeatureSchemaDefinition; // Schema for validating configPayload
    // Fallback behavior when a feature is not accessible
    fallbackBehavior?: 'hide' | 'disable' | 'redirect' | 'render_component' | 'show_message' | 'default_value';
    fallbackComponent?: string; // Name of a registered fallback component
    fallbackMessage?: string;
    fallbackRedirectPath?: string;
    fallbackConfigPayload?: Record<string, any>; // Default config if feature disabled
    // Lifecycle and operational metrics
    creationDate?: Date;
    lastUpdated?: Date;
    status: 'draft' | 'active' | 'inactive' | 'deprecated' | 'scheduled';
    scheduledActivation?: Date;
    scheduledDeactivation?: Date;
    deploymentPhases?: {
        phaseName: string;
        startDate: Date;
        endDate?: Date;
        description?: string;
        rolloutStrategy?: 'percentage' | 'canary';
        rolloutConfig?: any;
    }[];
    sunsetDate?: Date; // Date when the feature is planned for removal
    // Security & Compliance policies
    securityPolicy?: FeatureSecurityPolicy;
    dataGovernancePolicy?: FeatureDataGovernancePolicy;
    auditPolicy?: AuditTrailPolicy;
    // Performance & Resource Management
    resourceManagementPolicy?: FeatureResourcePolicy;
    // Inter-system communication for orchestration and real-time events
    eventHooks?: {
        onActivate?: FeatureEventHook[];
        onDeactivate?: FeatureEventHook[];
        onAccessDenied?: FeatureEventHook[];
        onAccessGranted?: FeatureEventHook[];
        onConfigUpdate?: FeatureEventHook[];
        onAnomalyDetected?: FeatureEventHook[]; // Triggered by internal anomaly detection
    };
    // Token Rail Integration - specific requirements for token-gated features
    tokenRequirements?: {
        tokenType: string; // e.g., 'USD_STABLECOIN', 'ETH'
        minBalance?: number; // Minimum token balance required
        requiredNFTs?: string[]; // List of specific NFT IDs or collection addresses
        transactionHistoryConditions?: FeatureRule[]; // Rules based on token transaction history
        autoMintOnActivation?: {
            enabled: boolean;
            amount: number;
            currency: string;
            memo?: string;
        }; // Simulate auto-minting tokens for feature access
    };
    // Payment Rail Integration - specific requirements for payment-flow features
    paymentGatewayRestrictions?: string[]; // e.g., ['Stripe', 'PayPal'] - only allow certain gateways
    paymentRailEligibility?: ('rail_fast' | 'rail_batch')[]; // Which payment rails are eligible for features tied to payments
    fraudRiskThreshold?: number; // Minimum fraud score to block access to this feature
    transactionValueLimit?: {
        min?: number;
        max?: number;
        currency: string;
    };
}

// --- Mock Implementations (as if fetched from a backend or global state) ---
// In a real application, these would be sophisticated client-side SDKs interacting
// with backend microservices, event streams, and AI models, securely.

export const MOCK_FEATURE_DEFINITIONS: FeatureDefinition[] = [
    {
        key: 'DashboardView',
        name: 'Main Dashboard',
        description: 'The primary user dashboard with widgets, optimized for real-time insights.',
        enabledByDefault: true,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true, description: 'User must be logged in' },
                ]
            }
        ],
        configPayload: {
            defaultWidgetOrder: ['activity', 'notifications', 'recommendations', 'realTimePayments'],
            refreshIntervalSeconds: 30, // More frequent refresh for real-time
            displayAlerts: true,
        },
        configSchema: {
            type: 'object',
            properties: {
                defaultWidgetOrder: { type: 'array', items: { type: 'string' }, description: 'Order of dashboard widgets' },
                refreshIntervalSeconds: { type: 'number', description: 'Dashboard refresh interval' },
                displayAlerts: { type: 'boolean', description: 'Whether to display real-time alerts' },
            }
        },
        personalizationConfig: {
            aiModelId: 'dashboard_layout_optimizer_v2',
            predictionThreshold: 0.85,
            dynamicContentTags: ['dashboard_news', 'user_tips', 'market_trends'],
            adaptiveUIComponents: {
                mainContent: 'DynamicDashboardContentAI',
                sidebar: 'PersonalizedSidebarAgent',
            },
            agentDecisionIntegration: {
                enabled: true,
                requiredConfidence: 0.9,
                agentRoles: ['PersonalizationAgent', 'WealthManagementAgent'],
            }
        },
        abTestConfig: {
            experimentId: 'DASHBOARD_V2_ROLLOUT',
            defaultVariant: 'control',
            variants: [
                { variantKey: 'control', trafficWeight: 0.4 },
                { variantKey: 'treatment_new_layout', configPayload: { layoutVersion: 'v2', enableGraphqlAPI: true }, trafficWeight: 0.6 }
            ],
            stickinessKey: 'user',
        },
        securityPolicy: {
            accessControlMechanism: 'RBAC',
            requiredAuthenticationLevel: 'high',
            dataSensitivityLevel: 'confidential',
            encryptionRequired: true,
            threatDetectionIntegration: { enabled: true, blockingThreshold: 0.7 },
            leastPrivilegeEnforcement: true,
            cryptographicSignaturesRequired: true,
        },
        auditPolicy: {
            enabled: true,
            retentionDays: 365,
            logLevel: 'detailed',
            includeContext: ['user', 'device', 'agent'],
            tamperDetection: { enabled: true, hashAlgorithm: 'SHA256', chainingEnabled: true },
            alertOnFailedAccess: true,
        },
        eventHooks: {
            onAccessGranted: [{ type: 'internal_event', eventName: 'DASHBOARD_ACCESS_GRANTED' }],
            onAnomalyDetected: [{ type: 'webhook', endpoint: 'https://security-ops.example.com/alerts', authentication: { type: 'signature' } }],
        }
    },
    {
        key: 'AdvancedAnalyticsView',
        name: 'Advanced Analytics Module',
        description: 'Comprehensive data analysis tools for deep financial insights, requiring stringent compliance.',
        enabledByDefault: false,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true },
                    { target: 'user', property: 'subscriptionTier', operator: 'in', value: ['premium', 'enterprise'] },
                    { target: 'user', property: 'roles', operator: 'has', value: 'analyst' },
                    { target: 'organization', property: 'complianceCertifications', operator: 'has', value: 'ISO27001' }
                ]
            }
        ],
        dependencies: ['ReportingTools'],
        dataGovernancePolicy: {
            complianceCategories: ['GDPR', 'HIPAA', 'PCI-DSS', 'AML'],
            dataAccessRequirements: ['PII_access_required', 'financial_data_access'],
            jurisdictionRestrictions: ['EU', 'US'],
            regulatoryApprovalRequired: true,
        },
        fallbackBehavior: 'show_message',
        fallbackMessage: 'Upgrade to Premium or Enterprise with required compliance certifications to access Advanced Analytics!',
        resourceManagementPolicy: {
            cpuEstimate: 0.7, memoryEstimate: 0.8, networkEstimate: 0.6,
            peakConcurrencyEstimate: 100,
            rateLimits: { perUser: 5, global: 500 },
        },
    },
    {
        key: 'BetaFeaturesToggle',
        name: 'Opt-in for Beta Features',
        description: 'Allows users to enable experimental features, managed by AI for segment targeting.',
        enabledByDefault: false,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true },
                    { target: 'user', property: 'accountAgeDays', operator: 'gt', value: 30 },
                    { target: 'ai', property: 'segmentTags', operator: 'has', value: 'early_adopter_propensity_high' }
                ]
            }
        ],
        rolloutStrategy: 'targeted_segment',
        rolloutConfig: { segmentTags: ['early_adopter_propensity_high'] },
        securityPolicy: {
            accessControlMechanism: 'RBAC',
            requiredAuthenticationLevel: 'medium',
            dataSensitivityLevel: 'confidential',
            encryptionRequired: true,
            threatDetectionIntegration: { enabled: true, blockingThreshold: 0.5 },
            leastPrivilegeEnforcement: false, // More flexible for beta features
            cryptographicSignaturesRequired: false,
        },
    },
    {
        key: 'GDPRConsentManagement',
        name: 'GDPR Consent Settings',
        description: 'Tools for users to manage their data consent, geo-fenced for EU regions.',
        enabledByDefault: true,
        activationRules: [
            {
                conjunction: 'OR',
                rules: [
                    {
                        conditions: [
                            { target: 'user', property: 'geoLocation.country', operator: 'in', value: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE'], description: 'User in EU country' }
                        ]
                    },
                    {
                        conditions: [
                            { target: 'user', property: 'complianceCategories', operator: 'has', value: 'GDPR', description: 'User explicitly marked as needing GDPR' }
                        ]
                    }
                ]
            }
        ],
        dataGovernancePolicy: {
            complianceCategories: ['GDPR'],
            dataAccessRequirements: ['PII_access_required'],
            jurisdictionRestrictions: ['EU'],
            regulatoryApprovalRequired: false,
        },
        fallbackBehavior: 'hide'
    },
    {
        key: 'InstantPaymentFeature',
        name: 'Instant Payment Initiation',
        description: 'Enables users to initiate real-time, low-latency payments across preferred rails.',
        enabledByDefault: false,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true },
                    { target: 'identity', property: 'hasVerifiedIdentity', operator: 'eq', value: true },
                    { target: 'identity', property: 'verifiedCredentialClaims.KYC_level', operator: 'gte', value: 'AML2' },
                    { target: 'payment', property: 'fraudScore', operator: 'lt', value: 0.1, description: 'Low fraud risk for payment' },
                    { target: 'agent', property: 'agentDecision', operator: 'eq', value: 'allow', description: 'Fraud agent must allow transaction' }
                ]
            }
        ],
        dependencies: ['TwoFactorAuth'],
        tokenRequirements: {
            tokenType: 'USD_STABLECOIN',
            minBalance: 10,
            transactionHistoryConditions: [
                {
                    conditions: [
                        { target: 'user', property: 'transactionHistorySummary.totalTxCount', operator: 'gte', value: 5, description: 'Minimum 5 prior transactions' }
                    ]
                }
            ],
        },
        paymentRailEligibility: ['rail_fast'],
        fraudRiskThreshold: 0.05,
        transactionValueLimit: { min: 1, max: 10000, currency: 'USD' },
        securityPolicy: {
            accessControlMechanism: 'ABAC',
            requiredAuthenticationLevel: 'MFA_required',
            dataSensitivityLevel: 'secret',
            encryptionRequired: true,
            threatDetectionIntegration: { enabled: true, blockingThreshold: 0.05, alertOnThreat: true },
            leastPrivilegeEnforcement: true,
            cryptographicSignaturesRequired: true,
        },
        auditPolicy: {
            enabled: true,
            retentionDays: 730,
            logLevel: 'debug',
            includeContext: ['user', 'identity', 'payment', 'agent'],
            tamperDetection: { enabled: true, hashAlgorithm: 'SHA3', chainingEnabled: true },
            alertOnFailedAccess: true,
        },
        eventHooks: {
            onAccessGranted: [{ type: 'message_queue', endpoint: 'payment_initiation_queue', eventName: 'INSTANT_PAY_APPROVED', async: true }],
            onAccessDenied: [{ type: 'internal_event', eventName: 'INSTANT_PAY_DECLINED_HIGH_RISK' }],
        }
    },
    {
        key: 'AdvancedAgentConfiguration',
        name: 'Agent Configuration UI',
        description: 'Interface for configuring AI agents and their decision policies, accessible only by highly privileged users.',
        enabledByDefault: false,
        activationRules: [
            {
                conjunction: 'AND',
                conditions: [
                    { target: 'user', property: 'isLoggedIn', operator: 'eq', value: true },
                    { target: 'user', property: 'roles', operator: 'has', value: 'system_admin' },
                    { target: 'organization', property: 'subscriptionTier', operator: 'eq', value: 'corporate' }
                ]
            }
        ],
        securityPolicy: {
            accessControlMechanism: 'RBAC',
            requiredAuthenticationLevel: 'MFA_required',
            dataSensitivityLevel: 'secret',
            encryptionRequired: true,
            threatDetectionIntegration: { enabled: true, blockingThreshold: 0.9 },
            leastPrivilegeEnforcement: true,
            cryptographicSignaturesRequired: true,
        },
        auditPolicy: {
            enabled: true,
            retentionDays: 1095, // 3 years for critical system changes
            logLevel: 'debug',
            includeContext: ['user', 'device'],
            tamperDetection: { enabled: true, hashAlgorithm: 'SHA256', chainingEnabled: true },
            alertOnFailedAccess: true,
        },
        eventHooks: {
            onConfigUpdate: [{ type: 'internal_event', eventName: 'AGENT_CONFIG_UPDATED' }],
        }
    }
];