// @/config/environment.ts
// This file dynamically loads and applies environment-specific configurations
// to override or extend the base constants defined in constants.tsx.
// It ensures that application behavior, API endpoints, and feature flags
// are correctly tailored for different deployment environments (development, production, etc.).

import {
    AppMetadata,
    FeatureFlags,
    AIModelSettings,
    APIEndpoints,
    APP_METADATA as BASE_APP_METADATA, // Alias to avoid naming collision
    GLOBAL_FEATURE_FLAGS as BASE_GLOBAL_FEATURE_FLAGS,
    AI_MODEL_SETTINGS as BASE_AI_MODEL_SETTINGS,
    // BASE_API_ENDPOINTS is not aliased as API_ENDPOINTS will be fully replaced
} from '../constants';

// ================================================================================================
// ENVIRONMENT-SPECIFIC OVERRIDES & FULL CONFIGURATIONS
// ================================================================================================

// --- Development Environment Configuration Overrides ---
// These values will override the base constants when NODE_ENV is not 'production'.
const DEVELOPMENT_METADATA_OVERRIDES: Partial<AppMetadata> = {
    appName: `${BASE_APP_METADATA.appName} (DEV)`, // Clearly mark as development
    appVersion: `3.0.0-dev-${Date.now()}`, // Dynamic version for development builds
    documentationUrl: "https://docs.dev.quantumnexus.com",
    supportUrl: "https://support.dev.quantumnexus.com",
    privacyPolicyUrl: "https://dev.quantumnexus.com/privacy",
    termsOfServiceUrl: "https://dev.quantumnexus.com/terms",
    aiGovernancePolicyUrl: "https://dev.quantumnexus.com/ai-governance",
    openSourceManifestUrl: "https://dev.quantumnexus.com/oss-manifest",
    contactEmail: "dev-contact@quantumnexus.com",
    releaseDate: new Date().toISOString().split('T')[0], // Current date for dev release
    brandColors: {
        ...BASE_APP_METADATA.brandColors,
        primary: "#FFA000", // A distinct color for dev environment
        accent: "#FFEB3B",
    },
    socialMediaLinks: {
        ...BASE_APP_METADATA.socialMediaLinks,
        twitter: "https://twitter.com/quantumnexusai_dev", // Dev specific social links if any
    },
};

const DEVELOPMENT_FEATURE_FLAGS_OVERRIDES: Partial<FeatureFlags> = {
    showBetaFeatures: true, // Always show beta features in development
    enableDecentralizedIdentity: true, // Enable for testing advanced features
    enableBlockchainSettlement: true,
    enableAutonomousScientistMode: true, // Full access to all dev features
};

const DEVELOPMENT_AI_MODEL_SETTINGS_OVERRIDES: Partial<AIModelSettings> = {
    defaultModel: "gpt-3.5-turbo", // Use a cheaper/faster model for development
    temperature: 0.8, // Allow more exploratory outputs in dev
    maxTokens: 1024, // Smaller max tokens for quicker responses
    rateLimits: {
        perUserPerHour: 500, // More generous limits for testing
        globalPerMinute: 1000,
    },
    safetyThresholds: {
        hateSpeech: 0.9, // Relaxed thresholds for testing edge cases
        sexualContent: 0.9,
        violence: 0.9,
        selfHarm: 0.9,
    },
    systemPrompts: {
        ...BASE_AI_MODEL_SETTINGS.systemPrompts, // Inherit base prompts
        generalAdvisor: "[DEV] Focus on rapid prototyping and mock data analysis. Prioritize speed over depth.",
        creativeGenerator: "[DEV] Generate highly experimental and diverse outputs for testing creative boundaries.",
    },
    fineTuningDataSources: [...BASE_AI_MODEL_SETTINGS.fineTuningDataSources, "dev_test_dataset"],
};

const DEVELOPMENT_API_ENDPOINTS: APIEndpoints = {
    authService: "http://localhost:3001/api/auth",
    dataService: "http://localhost:3002/api/data",
    aiService: "http://localhost:3003/api/ai",
    orchestrationService: "http://localhost:3004/api/orchestration",
    financialService: "http://localhost:3005/api/finance",
    blockchainService: "http://localhost:3006/api/blockchain",
    reportingService: "http://localhost:3007/api/reports",
    notificationService: "http://localhost:3008/api/notifications",
    adminService: "http://localhost:3009/api/admin",
    marketIntelligenceService: "http://localhost:3010/api/market-intel",
    complianceService: "http://localhost:3011/api/compliance",
    identityService: "http://localhost:3012/api/identity",
};

// --- Production Environment Configuration Overrides ---
// These values ensure production settings are strict and stable.
const PRODUCTION_METADATA_OVERRIDES: Partial<AppMetadata> = {
    // Generally, production uses the base APP_METADATA, but specific overrides can be here
    // For example, if appName needed to be slightly different (e.g., no suffix).
    // In this case, most production values already align with BASE_APP_METADATA.
    // Explicitly re-stating for clarity that these are production-specific settings.
    appVersion: BASE_APP_METADATA.appVersion, // Ensure production version is clean
    documentationUrl: "https://docs.quantumnexus.com",
    supportUrl: "https://support.quantumnexus.com",
    privacyPolicyUrl: "https://quantumnexus.com/privacy",
    termsOfServiceUrl: "https://quantumnexus.com/terms",
    aiGovernancePolicyUrl: "https://quantumnexus.com/ai-governance",
    openSourceManifestUrl: "https://quantumnexus.com/oss-manifest",
    contactEmail: "contact@quantumnexus.com",
    // Brand colors and social links usually remain consistent in production.
};

const PRODUCTION_FEATURE_FLAGS_OVERRIDES: Partial<FeatureFlags> = {
    showBetaFeatures: false, // Beta features disabled in production
    enableDecentralizedIdentity: false, // Keep disabled until fully ready for public release
    enableBlockchainSettlement: false, // Keep disabled until fully ready
    enableAutonomousScientistMode: false, // Advanced features might be opt-in or tier-gated
};

const PRODUCTION_AI_MODEL_SETTINGS_OVERRIDES: Partial<AIModelSettings> = {
    defaultModel: "gpt-4-turbo", // Use premium model for production
    temperature: 0.2, // More deterministic and reliable outputs in production
    maxTokens: 2048,
    rateLimits: {
        perUserPerHour: 100, // Stricter rate limits for production
        globalPerMinute: 500,
    },
    safetyThresholds: {
        hateSpeech: 0.1, // Strict safety thresholds in production
        sexualContent: 0.1,
        violence: 0.1,
        selfHarm: 0.1,
    },
    systemPrompts: {
        ...BASE_AI_MODEL_SETTINGS.systemPrompts, // Inherit base prompts
        generalAdvisor: "Provide accurate, concise, and compliant financial and strategic advice to clients.",
        creativeGenerator: "Generate high-quality, professional, and brand-aligned content.",
    },
    fineTuningDataSources: BASE_AI_MODEL_SETTINGS.fineTuningDataSources, // Production data sources
};

const PRODUCTION_API_ENDPOINTS: APIEndpoints = {
    authService: "https://api.quantumnexus.com/v1/auth",
    dataService: "https://api.quantumnexus.com/v1/data",
    aiService: "https://api.quantumnexus.com/v1/ai",
    orchestrationService: "https://api.quantumnexus.com/v1/orchestration",
    financialService: "https://api.quantumnexus.com/v1/finance",
    blockchainService: "https://api.quantumnexus.com/v1/blockchain",
    reportingService: "https://api.quantumnexus.com/v1/reports",
    notificationService: "https://api.quantumnexus.com/v1/notifications",
    adminService: "https://api.quantumnexus.com/v1/admin",
    marketIntelligenceService: "https://api.quantumnexus.com/v1/market-intel",
    complianceService: "https://api.quantumnexus.com/v1/compliance",
    identityService: "https://api.quantumnexus.com/v1/identity",
};

// ================================================================================================
// DYNAMIC ENVIRONMENT SELECTION AND MERGING
// ================================================================================================

// Determine the current environment
const isProduction = process.env.NODE_ENV === 'production';

// Select the appropriate overrides for the current environment
const currentMetadataOverrides = isProduction ? PRODUCTION_METADATA_OVERRIDES : DEVELOPMENT_METADATA_OVERRIDES;
const currentFeatureFlagsOverrides = isProduction ? PRODUCTION_FEATURE_FLAGS_OVERRIDES : DEVELOPMENT_FEATURE_FLAGS_OVERRIDES;
const currentAIModelSettingsOverrides = isProduction ? PRODUCTION_AI_MODEL_SETTINGS_OVERRIDES : DEVELOPMENT_AI_MODEL_SETTINGS_OVERRIDES;
const currentAPIEndpoints = isProduction ? PRODUCTION_API_ENDPOINTS : DEVELOPMENT_API_ENDPOINTS;

// Merge App Metadata: Spread base first, then apply environment-specific overrides
export const APP_METADATA: AppMetadata = {
    ...BASE_APP_METADATA,
    ...currentMetadataOverrides,
    brandColors: {
        ...BASE_APP_METADATA.brandColors,
        ...currentMetadataOverrides.brandColors, // Deep merge for nested objects
    },
    socialMediaLinks: {
        ...BASE_APP_METADATA.socialMediaLinks,
        ...currentMetadataOverrides.socialMediaLinks, // Deep merge for nested objects
    },
};

// Merge Feature Flags: Spread base first, then apply environment-specific overrides
export const GLOBAL_FEATURE_FLAGS: FeatureFlags = {
    ...BASE_GLOBAL_FEATURE_FLAGS,
    ...currentFeatureFlagsOverrides,
};

// Merge AI Model Settings: Spread base first, then apply environment-specific overrides,
// with deep merges for nested objects like systemPrompts, rateLimits, and safetyThresholds.
export const AI_MODEL_SETTINGS: AIModelSettings = {
    ...BASE_AI_MODEL_SETTINGS,
    ...currentAIModelSettingsOverrides, // Apply top-level overrides
    systemPrompts: {
        ...BASE_AI_MODEL_SETTINGS.systemPrompts,
        ...(currentAIModelSettingsOverrides.systemPrompts || {}),
    },
    rateLimits: {
        ...BASE_AI_MODEL_SETTINGS.rateLimits,
        ...(currentAIModelSettingsOverrides.rateLimits || {}),
    },
    safetyThresholds: {
        ...BASE_AI_MODEL_SETTINGS.safetyThresholds,
        ...(currentAIModelSettingsOverrides.safetyThresholds || {}),
    },
    fineTuningDataSources: currentAIModelSettingsOverrides.fineTuningDataSources 
        ? [...currentAIModelSettingsOverrides.fineTuningDataSources] // Use the override directly
        : BASE_AI_MODEL_SETTINGS.fineTuningDataSources,
};

// Select API Endpoints: These are usually a full replacement based on environment, not a merge.
export const API_ENDPOINTS: APIEndpoints = currentAPIEndpoints;

// ================================================================================================
// ENVIRONMENT CHECKER UTILITIES
// ================================================================================================

/**
 * Checks if the current environment is production.
 * @returns {boolean} True if in production environment, false otherwise.
 */
export const isProd = (): boolean => isProduction;

/**
 * Checks if the current environment is development.
 * @returns {boolean} True if in development environment, false otherwise.
 */
export const isDev = (): boolean => !isProduction;

// Note: For additional environments (e.g., 'staging', 'test'), expand the logic
// with more `process.env.NODE_ENV` checks and corresponding configuration blocks.