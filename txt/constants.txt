```typescript
// @/constants.tsx
// This file serves as the central repository for application-wide constants.
// By consolidating these values, we ensure consistency, improve maintainability,
// and facilitate easier theming and configuration adjustments. This file is 
// the pantheon of the application's identity, defining its navigable realms
// and the symbols that represent them. In this publisher edition, these constants
// are meticulously crafted to support a commercial-grade, scalable, and intelligent ecosystem.

import React from 'react';
import { View } from './types';
// FIX: Changed to named import to match the corrected export.
import { CONSTITUTIONAL_ARTICLES } from './data/constitutionalArticles';

// ================================================================================================
// TYPE DEFINITIONS FOR NAVIGATION & APPLICATION CONFIGURATION
// ================================================================================================
// FIX: Added `type?: never` to NavLink to fix type inference issues in Sidebar.tsx.
// This ensures that the 'type' property can be safely accessed on any NavItem.

// Enhanced NavLink type to include advanced UI features like badges, external linking capabilities, and feature flags.
export type NavLink = { 
    id: View; 
    label: string; 
    icon: React.ReactElement; 
    type?: 'link'; // Explicit type for clarity
    badge?: string | number; // Optional badge for notifications/counts, dynamically updated
    beta?: boolean; // Indicate if a feature is in beta phase, subject to change
    comingSoon?: boolean; // Indicate upcoming features, building anticipation
    externalUrl?: string; // For seamless navigation to external platforms or resources
    target?: '_blank' | '_self' | '_parent' | '_top'; // Link target for external URLs
    requiresSubscription?: boolean; // Gates access based on user's subscription tier
    featureFlag?: keyof FeatureFlags; // Connects directly to a feature flag for dynamic visibility
};

// NavHeader remains for simple, declarative section titles within the navigation hierarchy.
export type NavHeader = { type: 'header'; label: string; id?: never; icon?: never };

// NavDivider for elegant visual separation, enhancing readability and content grouping.
// FIX: Removed `label?: never` from NavDivider. This property was confusing the TypeScript type-checker when narrowing the NavItem union type, causing it to incorrectly infer 'never' for an item's type in some cases.
export type NavDivider = { type: 'divider'; id?: never; icon?: never };

// NavDropdown introduces nested navigation, allowing for a structured and expandable menu.
// This supports complex information architectures and future extensibility.
export type NavDropdown = {
    type: 'dropdown';
    label: string;
    icon: React.ReactElement;
    children: (NavLink | NavDivider | NavHeader)[]; // Can contain links, dividers, or even nested headers
    id?: never; // Dropdowns themselves do not have a direct view ID
    defaultOpen?: boolean; // Optionally expand the dropdown by default
};

// Union of all possible navigation item types, providing a flexible and robust navigation schema.
export type NavItem = NavLink | NavHeader | NavDivider | NavDropdown;

// Type definition for comprehensive application metadata, vital for branding, SEO, and regulatory compliance.
export type AppMetadata = {
    appName: string; // The official public name of the application
    appTagline: string; // A concise and compelling statement of the app's value proposition
    appVersion: string; // Current semantic versioning for releases
    copyrightInfo: string; // Legal copyright statement
    releaseDate: string; // Date of the latest major public release
    buildNumber: string; // Internal build identifier for tracking
    documentationUrl: string; // Link to comprehensive user and developer documentation
    supportUrl: string; // Direct link to customer support portal
    privacyPolicyUrl: string; // URL to the detailed privacy policy
    termsOfServiceUrl: string; // URL to the legal terms of service agreement
    aiGovernancePolicyUrl: string; // URL outlining ethical AI usage and governance
    openSourceManifestUrl: string; // Transparency into open-source component usage
    brandColors: { // Core brand palette for consistent theming
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        cta: string; // Call-to-action color
    };
    contactEmail: string; // Primary contact email for general inquiries
    socialMediaLinks: { // Essential social media presence
        twitter?: string;
        linkedin?: string;
        youtube?: string;
        blog?: string;
    };
    publisherLegalName: string; // Full legal name of the publishing entity
    publisherAddress: string; // Physical address for legal and compliance
    publisherJurisdiction: string; // Legal jurisdiction of the publisher
};

// Type definition for dynamic feature flags, enabling A/B testing, phased rollouts, and granular control.
export type FeatureFlags = {
    [key: string]: boolean; // Index signature for dynamic access
    // Core Platform Enhancements
    enableAIAgentMarketplace: boolean;
    enableQuantumOraclePredictions: boolean;
    enableDecentralizedIdentity: boolean;
    enableRealTimeAnalytics: boolean;
    enableSmartContractAudits: boolean;
    
    // UI/UX Customization
    enableAdvancedTheming: boolean;
    showBetaFeatures: boolean;
    enableDarkModeBanner: boolean;
    enableGuidedOnboarding: boolean;
    
    // Enterprise & Commercial Features
    enableMultiTenancy: boolean;
    enableAdvancedReporting: boolean;
    enableCustomIntegrations: boolean;
    enableBlockchainSettlement: boolean;
    
    // AI Specific Capabilities
    enableGenerativeJurisprudenceAI: boolean;
    enableHypothesisEngine: boolean;
    enableEthicalAIAssessment: boolean;
    enableAutonomousScientistMode: boolean;
};

// Type definition for AI model configuration parameters, meticulously tuned for optimal performance and safety.
export type AIModelSettings = {
    defaultModel: string; // Identifier for the primary generative AI model
    temperature: number; // Controls output randomness (0.0 for deterministic, 1.0 for highly creative)
    maxTokens: number; // Maximum length of generated response, balancing verbosity and cost
    topP: number; // Controls diversity via nucleus sampling; (0.0 to 1.0, 1.0 includes all tokens)
    frequencyPenalty: number; // Penalizes new tokens based on their existing frequency in text
    presencePenalty: number; // Penalizes new tokens based on whether they appear in the text so far
    systemPrompts: { // Curated system prompts to guide AI behavior across different modules
        generalAdvisor: string; // For broad financial and strategic advice
        creativeGenerator: string; // For content creation and innovative problem-solving
        riskAnalyst: string; // For identifying and mitigating potential risks
        legalInterpreter: string; // For parsing and explaining complex legal documents
        codeSynthesizer: string; // For generating and optimizing code
        narrativeArchitect: string; // For crafting compelling stories and user journeys
        economicForecaster: string; // For sophisticated economic trend predictions
    };
    rateLimits: { // API rate limits to ensure fair usage and prevent abuse
        perUserPerHour: number; // Limits AI requests for individual users
        globalPerMinute: number; // System-wide aggregate request limit
    };
    safetyThresholds: { // Configurable thresholds for content moderation and safety filters
        hateSpeech: number;
        sexualContent: number;
        violence: number;
        selfHarm: number;
    };
    fineTuningDataSources: string[]; // List of datasets used for fine-tuning specific models
};

// Type definition for API endpoint configurations, ensuring robust and scalable microservice architecture.
export type APIEndpoints = {
    authService: string; // Authentication and Authorization Gateway
    dataService: string; // Core Data Repository and Query Engine
    aiService: string; // Central AI Inference and Model Management
    orchestrationService: string; // Workflow Automation and Task Coordination
    financialService: string; // Transaction Processing and Account Management
    blockchainService: string; // Decentralized Ledger Interaction
    reportingService: string; // Analytics and Business Intelligence
    notificationService: string; // Real-time Alerts and Communication
    adminService: string; // Platform Administration and User Management
    marketIntelligenceService: string; // External Market Data Feeds
    complianceService: string; // Regulatory and Governance Checks
    identityService: string; // User and Entity Identity Management
};

// ================================================================================================
// APPLICATION-WIDE GLOBAL CONSTANTS
// ================================================================================================

// Centralized application metadata for consistent branding and legal information.
export const APP_METADATA: AppMetadata = {
    appName: "Quantum Nexus",
    appTagline: "Pioneering the Future of Intelligent Finance and Strategic Autonomy",
    appVersion: "3.0.0-PublisherEdition",
    copyrightInfo: "© 2024 Quantum Nexus Holdings Inc. All rights reserved.",
    releaseDate: "2024-07-26",
    buildNumber: "QNX-3.0.0-PE-BETA-7890",
    documentationUrl: "https://docs.quantumnexus.com",
    supportUrl: "https://support.quantumnexus.com",
    privacyPolicyUrl: "https://quantumnexus.com/privacy",
    termsOfServiceUrl: "https://quantumnexus.com/terms",
    aiGovernancePolicyUrl: "https://quantumnexus.com/ai-governance",
    openSourceManifestUrl: "https://quantumnexus.com/oss-manifest",
    brandColors: {
        primary: "#635BFF", // Deep Indigo for strength and sophistication
        secondary: "#36C5F0", // Aqua for innovation and clarity
        accent: "#ECB22E", // Gold for premium features and insights
        background: "#F9FAFB", // Light Grey for a clean, modern interface
        text: "#1F2937", // Dark Grey for readability
        cta: "#06AC38", // Vibrant Green for action and growth
    },
    contactEmail: "contact@quantumnexus.com",
    socialMediaLinks: {
        twitter: "https://twitter.com/quantumnexusai",
        linkedin: "https://www.linkedin.com/company/quantumnexus",
        youtube: "https://www.youtube.com/@quantumnexus",
        blog: "https://blog.quantumnexus.com",
    },
    publisherLegalName: "Quantum Nexus Global Technologies Corporation",
    publisherAddress: "1701 Financial Drive, Suite 300, Metropolis, CA 90210, USA",
    publisherJurisdiction: "Delaware, USA",
};

// Feature flags for dynamic control over application capabilities.
export const GLOBAL_FEATURE_FLAGS: FeatureFlags = {
    enableAIAgentMarketplace: true,
    enableQuantumOraclePredictions: true,
    enableDecentralizedIdentity: false, // Future roadmap item
    enableRealTimeAnalytics: true,
    enableSmartContractAudits: true,
    enableAdvancedTheming: true,
    showBetaFeatures: true, // For internal testing or early access programs
    enableDarkModeBanner: true,
    enableGuidedOnboarding: true,
    enableMultiTenancy: true, // For enterprise clients
    enableAdvancedReporting: true,
    enableCustomIntegrations: true,
    enableBlockchainSettlement: false, // Advanced feature, currently disabled
    enableGenerativeJurisprudenceAI: true,
    enableHypothesisEngine: true,
    enableEthicalAIAssessment: true