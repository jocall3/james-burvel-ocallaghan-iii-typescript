```typescript
// types/ts
// This file has been refactored to act as a central barrel file.
// It aggregates and exports all type definitions from the new, modularized
// files located in the `/types/models` directory. This approach improves organization
// and maintainability while ensuring that all existing component imports
// continue to work without any changes.

/**
 * @file This module serves as the authoritative, comprehensive type library for the entire
 * application ecosystem. It consolidates all core data structures, configuration interfaces,
 * and domain-specific entities into a single, highly accessible point of reference.
 * Designed for enterprise-grade applications, it ensures type safety, consistency,
 * and facilitates robust API development across all services and client-side components.
 *
 * This file is continually expanded to support advanced features, detailed configurations,
 * and highly scalable operations, making it suitable for a "publisher edition" platform.
 * It encapsulates the essential building blocks for high-performance, secure, and globally
 * distributable applications, anticipating complex requirements for content management,
 * user engagement, monetization, and AI-driven capabilities.
 */

export * from './types/models'; // Existing re-export of modularized types

/**
 * ==============================================================================
 * GLOBAL APPLICATION CONFIGURATION TYPES
 * These types define the foundational settings and feature flags that govern
 * the application's behavior across various environments and user segments.
 * They are critical for dynamic system management and operational flexibility.
 * ==============================================================================
 */

/**
 * Defines the comprehensive global configuration settings for the entire application.
 * This interface is crucial for initializing and managing the application's global state,
 * integrating external services, and controlling dynamic feature rollouts. It supports
 * multi-environment deployments, advanced logging, and robust security policies.
 */
export interface AppConfig {
    /**
     * Unique identifier for the application instance or deployment.
     * Essential for multi-region or multi-tenant architectures.
     * @example "my-publisher-platform-prod-us-east-1"
     */
    instanceId: string;
    /**
     * The current operational environment (e.g., 'development', 'staging', 'production', 'test').
     * Dynamically adjusts logging verbosity, API endpoints, and feature availability.
     */
    environment: 'development' | 'staging' | 'production' | 'test' | 'local';
    /**
     * Base URL for the primary API services. This can be dynamically resolved based on environment.
     * @example "https://api.publisher.com/v1"
     */
    apiBaseUrl: string;
    /**
     * Configuration for external authentication and single sign-on (SSO) providers.
     * Supports various identity management solutions.
     */
    authProviders: {
        googleClientId?: string;
        microsoftTenantId?: string;
        oktaConfig?: { domain: string; clientId: string };
        // Expand with more providers as needed for enterprise clients
        customSsoUrl?: string;
    };
    /**
     * A highly granular map of feature flags, enabling or disabling specific functionalities
     * dynamically. Supports advanced rollout strategies, A/B testing, and user-segment targeting.
     */
    featureFlags: Record<string, boolean | FeatureFlagConfig>;
    /**
     * Internationalization (i18n) settings, including the default locale, supported locales,
     * and dynamic resource loading paths. Crucial for global audience reach.
     */
    i18n: {
        defaultLocale: string;
        supportedLocales: string[];
        resourcePath?: string; // Path to translation files, supports dynamic loading
        fallbackLocale?: string; // Locale to use if preferred is not available
    };
    /**
     * Configuration for logging and telemetry services. Defines log levels, destinations,
     * and integration points with centralized log management systems.
     */
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
        destination: 'console' | 'remote' | 'file' | 'datadog' | 'splunk';
        remoteEndpoint?: string; // e.g., for a log aggregation service
        includeUserContext?: boolean; // Whether to include user info in logs
    };
    /**
     * Comprehensive security-related configurations, such as Cross-Origin Resource Sharing (CORS)
     * policies, Content Security Policies (CSP), and token validation settings.
     */
    security: {
        corsEnabled: boolean;
        cspDirectives?: Record<string, string[]>;
        jwtSecretKeyId?: string; // Reference to a secret management system key
        tokenExpiryMinutes: number;
        allowImpersonation?: boolean; // For admin debugging, tightly controlled
    };
    /**
     * Branding and thematic settings for the user interface. Allows for white-labeling
     * or custom branding for enterprise clients or different product lines.
     */
    branding: {
        appName: LocalizedString; // Supports localized app names
        logoUrl: string;
        faviconUrl?: string;
        primaryColor: string; // Hex color code
        secondaryColor: string; // Hex color code
        fontFamily?: string;
        customCssUrl?: string; // For loading external stylesheets
    };
    /**
     * Timestamp indicating when this configuration was last updated in the system,
     * useful for cache invalidation and versioning.
     */
    lastUpdated: Date;
    /**
     * External service API keys or configurations that are not sensitive but need to be
     * managed globally (e.g., public analytics IDs).
     */
    externalServiceKeys?: Record<string, string>;
}

/**
 * Defines a more granular configuration for a specific feature flag.
 * This enables sophisticated feature management, allowing for staged rollouts,
 * A/B testing, regional activation, or specific user-group access.
 */
export interface FeatureFlagConfig {
    /** Whether the feature is generally enabled across all non-specific contexts. */
    enabled: boolean;
    /** Optional, detailed description of the feature's purpose and impact. */
    description?: LocalizedString;
    /** If specified, the feature is only active for users within these roles or defined groups. */
    targetAudiences?: UserRole[] | string[];
    /** A percentage (0-100) of users for whom the feature should be enabled, ideal for A/B testing or gradual rollouts. */
    rolloutPercentage?: number;
    /** Date and time when the feature should automatically become active. Supports scheduled releases. */
    activationDate?: Date;
    /** Date and time when the feature should automatically be disabled. Useful for temporary campaigns or deprecation. */
    expirationDate?: Date;
    /** Geographical regions (ISO 3166-1 alpha-2 codes) where the feature is active. */
    regions?: string[];
    /** Minimum subscription plan required to access this feature. */
    minSubscriptionPlanId?: string;
}

/**
 * Type representing various system-wide operational settings, potentially user-customizable
 * by administrators or governed by global policy.
 */
export interface SystemSettings {
    /** The global default timezone for server-side operations and date displays, e.g., 'America/New_York'. */
    defaultTimezone: string;
    /** Maximum number of concurrent users or API requests allowed on the platform, for capacity planning. */
    maxConcurrentUsersOrRequests: number;
    /** Data retention policies in days for various data types (e.g., 'auditLogs', 'analytics', 'userActivity'). */
    dataRetentionPolicies: Record<string, number>;
    /** Storage limits for user-generated content or digital assets, in gigabytes. */
    storageLimitGb: number;
    /** Defines scheduled maintenance window times, e.g., for database backups, system updates, or deployments. */
    maintenanceWindow: {
        enabled: boolean;
        startTime?: string; // e.g., "02:00 AM UTC"
        durationHours?: number;
        recurrence?: 'daily' | 'weekly' | 'monthly' | 'never';
        message?: LocalizedString; // i18n message for users about impending maintenance
    };
    /** Integrations with third-party services (e.g., CRM, marketing automation, payment gateways). */
    thirdPartyIntegrations: {
        crmProvider?: 'salesforce' | 'hubspot' | 'pipedrive' | 'none';
        emailServiceId?: string; // e.g., 'sendgrid_api_key', 'mailchimp_api_key'
        cdnProvider?: 'cloudfront' | 'cloudflare' | 'akamai' | 'none';
        analyticsProvider?: 'google_analytics' | 'mixpanel' | 'amplitude' | 'none';
        paymentGateway?: 'stripe' | 'paypal' | 'adyen' | 'none';
        // ... more integrations
    };
    /** SEO (Search Engine Optimization) specific global settings. */
    seo: {
        defaultMetaTitle: LocalizedString;
        defaultMetaDescription: LocalizedString;
        defaultKeywords: string[];
        robotTxtContent?: string;
        sitemapGenerationEnabled: boolean;
    };
}

/**
 * ==============================================================================
 * USER, AUTHENTICATION, AND AUTHORIZATION TYPES
 * These types govern user identities, roles, permissions, and access control
 * within the application, essential for multi-user, multi-role platforms
 * with robust security requirements.
 * ==============================================================================
 */

/**
 * Enumeration of standard user roles within the platform.
 * These roles define broad categories of access and capabilities, forming
 * the foundation of the authorization model. Roles can be combined.
 */
export enum UserRole {
    /** Super-administrator with full, unrestricted system access. */
    SuperAdmin = 'SUPER_ADMIN',
    /** General administrator with broad management capabilities over content, users, and settings. */
    Admin = 'ADMIN',
    /** Content editor responsible for reviewing, editing, and approving content. */
    Editor = 'EDITOR',
    /** Author who can create, submit, and manage their own content. */
    Author = 'AUTHOR',
    /** Standard authenticated user with basic access to platform features and content. */
    User = 'USER',
    /** Unauthenticated guest user with limited public access. */
    Guest = 'GUEST',
    /** Represents a paying subscriber or premium user with elevated content access. */
    Subscriber = 'SUBSCRIBER',
    /** A system account used for automated tasks, integrations, or background services. */
    System = 'SYSTEM',
    /** A role specifically for managing financial aspects and subscriptions. */
    BillingManager = 'BILLING_MANAGER',
    /** A role for technical staff managing infrastructure and deployments. */
    Developer = 'DEVELOPER',
    /** A role for customer support agents. */
    SupportAgent = 'SUPPORT_AGENT',
}

/**
 * Defines a detailed and extensible set of permissions that can be assigned to a user or role.
 * This granular control is vital for robust, attribute-based access control (ABAC) systems.
 */
export interface UserPermissions {
    /** Permission to read any content, regardless of status. */
    canReadAnyContent: boolean;
    /** Permission to create new content items of any type. */
    canCreateContent: boolean;
    /** Permission to edit existing content items, potentially limited by scope (e.g., 'own_content', 'any_content'). */
    canEditContent: 'none' | 'own_content' | 'any_content';
    /** Permission to delete content items, with similar scope limitations. */
    canDeleteContent: 'none' | 'own_content' | 'any_content';
    /** Permission to publish content, making it publicly visible or scheduled. */
    canPublishContent: boolean;
    /** Permission to manage user accounts, including creation, modification, and role assignment. */
    canManageUsers: boolean;
    /** Permission to manage global application settings and configurations. */
    canManageSettings: boolean;
    /** Permission to view sensitive analytics and reporting data. */
    canViewAnalytics: boolean;
    /** Permission to approve content submissions in a workflow. */
    canApproveContent: boolean;
    /** Permission to manage subscription plans, offerings, and customer subscriptions. */
    canManageSubscriptions: boolean;
    /** Permission to utilize and configure AI-powered features. */
    canUseAIFeatures: boolean;
    /** Permission to manage digital assets (upload, delete, organize). */
    canManageAssets: boolean;
    /** Permission to view or manage audit logs. */
    canViewAuditLogs: boolean;
    /** Permission to impersonate other users for debugging or support. Highly privileged. */
    canImpersonateUsers: boolean;
    /** An array of specific resource IDs, patterns, or content types the user has fine-grained access to.
     * @example ["content:article:123", "settings:general", "asset:images/*"]
     */
    accessToResources?: string[];
    /** Custom permissions, extensible for domain-specific actions. */
    customPermissions?: Record<string, boolean>;
}

/**
 * Represents the structure of a decoded authentication token (e.g., JWT claims).
 * Essential for verifying user identity, authorization, and session management.
 */
export interface AuthTokenClaims {
    /** User's unique identifier (subject of the token). */
    userId: string;
    /** User's email address, often used for identification. */
    email: string;
    /** The primary role assigned to the user, for quick access checks. */
    role: UserRole;
    /** List of all roles or groups the user belongs to, enabling multi-role access. */
    roles?: UserRole[];
    /** Timestamp when the token was issued (in seconds since epoch). */
    iat: number;
    /** Timestamp when the token expires (in seconds since epoch). */
    exp: number;
    /** Issuer of the token (e.g., the authentication service URL). */
    iss?: string;
    /** Audience the token is intended for (e.g., the client application ID). */
    aud?: string | string[];
    /** Detailed permissions granted by this token, derived from roles and policies. */
    permissions?: UserPermissions;
    /** Associated subscription plan ID, if the user is a subscriber. */
    subscriptionId?: string;
    /** Optional tenant ID for multi-tenant architectures. */
    tenantId?: string;
    /** Session ID for tracking user activity and revoking specific sessions. */
    sessionId?: string;
    /** Any custom claims specific to the application. */
    customClaims?: Record<string, any>;
}

/**
 * Represents a comprehensive user profile, combining identity, authentication details,
 * preferences, and subscription information. Designed for a rich user experience.
 */
export interface UserProfile {
    /** User's unique ID, immutable. */
    id: string;
    /** User's email address, often used as a primary login identifier. */
    email: string;
    /** User's display name, used across the platform. */
    displayName: string;
    /** First name of the user. */
    firstName?: string;
    /** Last name of the user. */
    lastName?: string;
    /** URL to the user's profile picture or avatar. */
    avatarUrl?: string;
    /** The primary role of the user. */
    role: UserRole;
    /** A list of all roles the user possesses. */
    roles: UserRole[];
    /** Detailed permissions derived from all assigned roles and specific overrides. */
    permissions: UserPermissions;
    /** Date when the user account was created. */
    createdAt: Date;
    /** Date when the user profile was last updated. */
    updatedAt: Date;
    /** User-specific preferences (e.g., theme, notification settings, content filters). */
    preferences?: UserPreferences;
    /** Current subscription status and detailed plan information. */
    subscription?: UserSubscription;
    /** The locale preferred by the user, for content and UI internationalization. */
    preferredLocale?: string;
    /** Geographic location data, potentially for personalized content or region-specific features. */
    location?: GeoCoordinate;
    /** Biography or "about me" section for authors/public profiles. */
    bio?: string;
    /** Professional affiliations or organization details. */
    organization?: string;
    /** Social media links. */
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
        website?: string;
    };
    /** Timestamp of the user's last login. */
    lastLoginAt?: Date;
    /** Status of the user account (e.g., 'active', 'suspended', 'deactivated'). */
    accountStatus: 'active' | 'suspended' | 'deactivated' | 'pending_verification';
}

/**
 * User-specific preferences that can be extensively customized by the user.
 */
export interface UserPreferences {
    /** Preferred UI theme (e.g., 'light', 'dark', 'system' for OS preference). */
    theme: 'light' | 'dark' | 'system';
    /** Granular notification settings for various channels. */
    notifications: {
        emailEnabled: boolean;
        pushEnabled: boolean;
        inAppEnabled: boolean;
        marketingEmails: boolean;
        contentUpdatesEnabled?: boolean;
        commentNotificationsEnabled?: boolean;
    };
    /** Timezone preference for displaying dates and times specific to the user. */
    timezone: string;
    /** Content filtering preferences, e.g., categories to exclude or preferred topics. */
    contentFilters?: string[];
    /** Opt-in for beta features or experimental functionalities. */
    betaFeaturesOptIn: boolean;
    /** Accessibility settings (e.g., high contrast, font size). */
    accessibilitySettings?: {
        highContrastMode: boolean;
        fontSizeScale: number; // e.g., 1.0, 1.2, 1.5
    };
    /** Preferred content categories or topics for personalized recommendations. */
    preferredTopics?: string[];
    /** Reading mode preferences (e.g., 'paginated', 'continuous_scroll'). */
    readingMode?: 'paginated' | 'continuous_scroll';
}

/**
 * Represents the detailed subscription status and plan for a user.
 * This includes billing cycle, entitlements, and payment history.
 */
export interface UserSubscription {
    /** Unique ID of the subscription instance. */
    id: string;
    /** ID of the associated subscription plan that defines features. */
    planId: string;
    /** Name of the subscription plan at the time of subscription. */
    planName: LocalizedString;
    /** Current status of the subscription in its lifecycle. */
    status: 'active' | 'cancelled' | 'trialing' | 'past_due' | 'unpaid' | 'expired' | 'pending';
    /** Date when the subscription started. */
    startDate: Date;
    /** Date when the current billing period ends. */
    currentPeriodEndDate: Date;
    /** Date when the subscription will next renew, if auto-renew is enabled. */
    nextRenewalDate?: Date;
    /** Whether the subscription is set to automatically renew at the end of the period. */
    autoRenew: boolean;
    /** Features or entitlements granted by this subscription, defining user capabilities. */
    entitlements: string[];
    /** Last payment details associated with this subscription. */
    lastPayment?: PaymentDetails;
    /** ID of the customer in the payment gateway system. */
    paymentGatewayCustomerId?: string;
    /** Price paid for the current billing period. */
    currentPeriodPrice: number;
    /** Currency of the subscription. */
    currency: string;
    /** Optional promotional code used for the subscription. */
    promoCode?: string;
    /** Date when the subscription was cancelled, if applicable. */
    cancelledAt?: Date;
}

/**
 * ==============================================================================
 * CONTENT MANAGEMENT AND PUBLISHING TYPES
 * These types define the structure of various content items, publishing workflows,
 * and associated assets, central to any publisher platform, enabling rich media
 * and structured content experiences.
 * ==============================================================================
 */

/**
 * Defines the current status of a content item within its publishing lifecycle.
 * This enum supports complex workflows from creation to archival.
 */
export enum PublicationStatus {
    /** Content is a work in progress, not yet ready for formal review. */
    Draft = 'DRAFT',
    /** Content has been submitted for review by an editor or administrator. */
    PendingReview = 'PENDING_REVIEW',
    /** Content has been reviewed and explicitly approved, ready for publication. */
    Approved = 'APPROVED',
    /** Content is currently live and publicly accessible. */
    Published = 'PUBLISHED',
    /** Content has been scheduled for future publication at a specific date/time. */
    Scheduled = 'SCHEDULED',
    /** Content has been removed from public view but is still editable and retrievable. */
    Archived = 'ARCHIVED',
    /** Content has been rejected during review and requires further revisions. */
    Rejected = 'REJECTED',
    /** Content has been permanently deleted from the system. */
    Deleted = 'DELETED',
    /** Content is undergoing revisions, while a previous version remains published. */
    Revising = 'REVISING',
    /** Content is awaiting translation or localization. */
    PendingLocalization = 'PENDING_LOCALIZATION',
}

/**
 * Defines the distinct categories of content items supported by the platform.
 * Enables specialized handling and display for different media types.
 */
export enum ContentType {
    Article = 'ARTICLE',
    Video = 'VIDEO',
    Image = 'IMAGE',
    Podcast = 'PODCAST',
    Page = 'PAGE', // Static page content
    Product = 'PRODUCT', // E-commerce product listings tied to content
    Advertisement = 'ADVERTISEMENT', // Sponsored content or native ads
    Collection = 'COLLECTION', // e.g., a curated list of articles, series, or playlists
    Recipe = 'RECIPE', // Structured content for food blogs
    Review = 'REVIEW', // Product or service reviews
    Event = 'EVENT', // Event listings
    Guide = 'GUIDE', // In-depth instructional content
}

/**
 * Base interface for any content item, providing common metadata and structural elements.
 * This ensures consistency and extensibility across diverse content types.
 */
export interface BaseContentItem {
    /** Unique immutable identifier for the content item. */
    id: ResourceId;
    /** The specific type of content, dictating its structure and rendering. */
    contentType: ContentType;
    /** Human-readable title of the content, localized. */
    title: LocalizedString;
    /** A brief summary or description of the content, localized. */
    description?: LocalizedString;
    /** Array of tags or keywords associated with the content for discoverability. */
    tags: string[];
    /** Array of categories the content belongs to, for organizational purposes. */
    categories: string[];
    /** URL slug for SEO-friendly URLs. Must be unique within its content type. */
    slug: string;
    /** Current publication status of the content within its workflow. */
    status: PublicationStatus;
    /** Unique ID of the author who originally created the content. */
    authorId: string;
    /** Display name of the author, for display purposes. */
    authorName?: string;
    /** Date and time when the content was first created. */
    createdAt: Date;
    /** Date and time when the content was last updated (any modification). */
    updatedAt: Date;
    /** Date and time when the content was published (first made publicly visible). */
    publishedAt?: Date;
    /** Optional date and time for content deprecation or unpublishing. */
    unpublishAt?: Date;
    /** URL to the primary thumbnail or cover image for the content. */
    thumbnailUrl?: string;
    /** URL to the main content asset (e.g., HTML page, video file), if applicable. */
    contentUrl?: string;
    /** Version number of the content, for revision control and history tracking. */
    version: number;
    /** The primary locale of this content item. */
    locale: string;
    /** Reference to the original content item for translations, if this is a localized version. */
    originalContentId?: string;
    /** Custom metadata object for flexible extension, allowing domain-specific attributes. */
    metadata?: Record<string, any>;
    /** ID of the last user who modified the content. */
    lastModifiedBy?: string;
    /** Workflow ID currently active for this content item. */
    workflowId?: string;
}

/**
 * Represents a rich text article or blog post, extending BaseContentItem.
 * Includes fields specific to textual content and SEO.
 */
export interface ArticleContent extends BaseContentItem {
    contentType: ContentType.Article;
    /** The main body of the article, typically in Markdown, HTML, or a rich text format. */
    body: LocalizedString;
    /** Estimated reading time in minutes, for user convenience. */
    readingTimeMinutes?: number;
    /** List of featured images or media assets embedded within the article. */
    featuredMedia?: AssetMetadata[];
    /** SEO-specific metadata for search engine discoverability. */
    seo: {
        metaTitle?: LocalizedString;
        metaDescription?: LocalizedString;
        keywords?: string[];
        ogImageUrl?: string; // Open Graph image URL for social sharing
        canonicalUrl?: string; // Canonical URL to prevent duplicate content issues
    };
    /** Related articles or content recommendations, typically by ID. */
    relatedContentIds?: ResourceId[];
    /** Table of contents generated from headings, for long articles. */
    tableOfContents?: { title: LocalizedString; slug: string; level: number }[];
}

/**
 * Represents a video content item, including streaming details and accessibility features.
 */
export interface VideoContent extends BaseContentItem {
    contentType: ContentType.Video;
    /** Primary URL to the video file or streaming service (e.g., YouTube, Vimeo, custom CDN). */
    videoUrl: string;
    /** Duration of the video in seconds. */
    durationSeconds: number;
    /** URL to transcripts or closed captions for accessibility. */
    captionsUrl?: LocalizedString;
    /** Embed code for external video players, if applicable. */
    embedCode?: string;
    /** Resolution of the video. */
    resolution?: { width: number; height: number };
    /** List of alternative video formats or resolutions available. */
    alternativeFormats?: { url: string; quality: string; mimeType: string }[];
    /** Status of video processing (e.g., 'pending', 'processed', 'failed'). */
    processingStatus: 'pending' | 'processed' | 'failed' | 'transcoding';
}

/**
 * Represents an image content item, with detailed metadata for web optimization and accessibility.
 */
export interface ImageContent extends BaseContentItem {
    contentType: ContentType.Image;
    /** URL to the high-resolution image file. */
    imageUrl: string;
    /** Alt text for accessibility and SEO, localized. */
    altText: LocalizedString;
    /** Dimensions of the image. */
    dimensions: { width: number; height: number };
    /** File size in bytes. */
    fileSizeKb: number;
    /** List of responsive image URLs (e.g., for different screen sizes). */
    responsiveImageUrls?: { srcSet: string; mediaQuery?: string }[];
    /** Copyright information for the image. */
    copyright?: string;
    /** Caption for the image, localized. */
    caption?: LocalizedString;
}

/**
 * Represents a collection of content items (e.g., a series, a playlist, a curated list).
 * Allows for grouping related content for enhanced discoverability.
 */
export interface ContentCollection extends BaseContentItem {
    contentType: ContentType.Collection;
    /** Array of content item IDs included in this collection, in a defined order. */
    itemIds: ResourceId[];
    /** Number of items currently in the collection. */
    itemCount: number;
    /** An optional image or banner URL for the collection. */
    collectionCoverUrl?: string;
    /** Specific type of collection (e.g., 'series', 'playlist', 'magazine_issue', 'featured_list'). */
    collectionType: string;
    /** Whether the collection is ordered or unordered. */
    isOrdered: boolean;
    /** Optional introduction or conclusion content for the collection. */
    introduction?: LocalizedString;
    conclusion?: LocalizedString;
}

/**
 * Defines comprehensive metadata for any digital asset (e.g., image, video file, document).
 * Supports detailed tracking and management of media resources.
 */
export interface AssetMetadata {
    /** Unique ID of the asset. */
    id: ResourceId;
    /** Original filename of the uploaded asset. */
    fileName: string;
    /** Type of the asset (e.g., 'image/jpeg', 'video/mp4', 'application/pdf'). */
    mimeType: string;
    /** Canonical URL where the asset is stored and accessible. */
    url: string;
    /** Size of the asset in bytes. */
    sizeBytes: number;
    /** Date and time when the asset was uploaded. */
    uploadedAt: Date;
    /** User ID of the uploader. */
    uploadedBy: string;
    /** Description or caption for the asset, localized. */
    description?: LocalizedString;
    /** Alt text for images, or transcription status for audio/video, localized. */
    altText?: LocalizedString;
    /** Dimensions for images/videos. */
    dimensions?: { width: number; height: number };
    /** Tags associated with the asset for categorization and search. */
    tags?: string[];
    /** Associated content item ID, if this asset is directly linked to content. */
    associatedContentId?: ResourceId;
    /** Source of the asset (e.g., 'internal_upload', 'unsplash', 'adobe_stock'). */
    source?: string;
    /** Copyright or licensing information for the asset. */
    copyright?: LocalizedString;
    /** Status of the asset processing (e.g., 'uploaded', 'processing', 'ready', 'failed'). */
    processingStatus: 'uploaded' | 'processing' | 'ready' | 'failed' | 'optimized';
    /** Hash of the file content for integrity checks. */
    fileHash?: string;
}

/**
 * Describes a single step in a content publishing workflow.
 * Enables definition of complex, multi-stage approval processes.
 */
export interface WorkflowStep {
    /** Unique ID of the workflow step. */
    id: string;
    /** Name of the step (e.g., "Drafting", "Editor Review", "Legal Approval", "Publish"). */
    name: LocalizedString;
    /** Description of what actions and checks are performed in this step. */
    description?: LocalizedString;
    /** The minimum role required to perform actions within this step. */
    requiredRole: UserRole;
    /** List of possible transitions from this step (e.g., "approve", "reject", "send_back_to_author", "schedule"). */
    nextTransitions: string[];
    /** Whether this step explicitly requires approval by a designated user. */
    requiresApproval: boolean;
    /** Automation rules associated with this step (e.g., send notification, trigger AI analysis). */
    automationRules?: string[];
    /** Specific fields that are editable or read-only in this step. */
    fieldPermissions?: Record<string, 'editable' | 'read_only' | 'hidden'>;
    /** Optional, ID of the user or group responsible for this step. */
    assignedTo?: string;
}

/**
 * Defines a complete content publishing workflow, orchestrating content progression.
 * Supports multiple workflows for different content types or business processes.
 */
export interface PublishingWorkflow {
    /** Unique ID for the workflow. */
    id: string;
    /** Name of the workflow (e.g., "Standard Article Workflow", "Video Production Workflow", "Enterprise Content Approval"). */
    name: LocalizedString;
    /** Detailed description of the workflow's purpose and scope. */
    description?: LocalizedString;
    /** Ordered list of steps that define the workflow progression. */
    steps: WorkflowStep[];
    /** The initial step where content enters the workflow upon creation. */
    initialStepId: string;
    /** The final step where content is considered published or completed. */
    publishedStepId: string;
    /** Timestamp of the last modification to this workflow definition. */
    lastModified: Date;
    /** User ID of the last person who updated this workflow. */
    lastModifiedBy?: string;
    /** Content types this workflow applies to. */
    appliesToContentTypes: ContentType[];
    /** Whether this workflow is active and can be assigned to new content. */
    isActive: boolean;
}

/**
 * Represents a localized string or text block, crucial for internationalization (i18n).
 * Allows content to be presented in multiple languages seamlessly.
 */
export type LocalizedString = {
    [locale: string]: string; // e.g., { "en-US": "Hello", "es-ES": "Hola", "fr-FR": "Bonjour" }
};

/**
 * ==============================================================================
 * MONETIZATION AND SUBSCRIPTION MANAGEMENT TYPES
 * These types are critical for platforms that offer premium content,
 * tiered subscriptions, or e-commerce functionalities, enabling robust
 * revenue generation strategies.
 * ==============================================================================
 */

/**
 * Enumeration of supported subscription plan billing frequencies.
 */
export enum BillingFrequency {
    Monthly = 'MONTHLY',
    Quarterly = 'QUARTERLY',
    Annually = 'ANNUALLY',
    Biennially = 'BIENNIALLY',
    OneTime = 'ONE_TIME', // For one-off payments for products, not recurring subscriptions
}

/**
 * Represents a single subscription plan offering, supporting tiered pricing,
 * feature bundling, trial periods, and promotional pricing.
 */
export interface SubscriptionPlan {
    /** Unique identifier for the subscription plan, typically from a payment gateway. */
    id: string;
    /** Display name of the plan (e.g., "Basic", "Premium", "Enterprise"), localized. */
    name: LocalizedString;
    /** Detailed description of the plan's benefits and features, localized. */
    description: LocalizedString;
    /** Base price of the plan in a specific currency. */
    basePrice: number;
    /** ISO 4217 currency code (e.g., "USD", "EUR", "GBP"). */
    currency: string;
    /** How often the subscription is billed. */
    billingFrequency: BillingFrequency;
    /** Duration of the free trial period in days, if any. */
    trialDays?: number;
    /** List of features or entitlements included in this plan, enabling feature gating. */
    features: string[];
    /** Whether the plan is currently active and available for purchase. */
    isActive: boolean;
    /** Optional URL for a promotional image or badge associated with the plan. */
    promoImageUrl?: string;
    /** Order in which this plan should appear in a list of offerings. */
    displayOrder: number;
    /** Any custom metadata specific to this plan, e.g., external payment gateway product IDs. */
    metadata?: Record<string, any>;
    /** Optional pricing for different durations/frequencies. */
    pricingTiers?: {
        frequency: BillingFrequency;
        price: number;
        currency: string;
        discountPercentage?: number;
    }[];
    /** Benefits or access grants provided by this plan. */
    accessGrants?: {
        contentTypes?: ContentType[];
        categories?: string[];
        specificContentIds?: ResourceId[];
        aiFeatureAccess?: string[]; // IDs of AI features accessible
    };
}

/**
 * Details of a payment transaction, including status, method, and amounts.
 * Essential for financial tracking and reconciliation.
 */
export interface PaymentDetails {
    /** Unique transaction ID from the payment gateway (e.g., Stripe charge ID). */
    transactionId: string;
    /** ID of the user or customer who made the payment. */
    userId: string;
    /** Total amount paid in the transaction. */
    amount: number;
    /** Currency of the payment (ISO 4217). */
    currency: string;
    /** Date and time of the payment. */
    paymentDate: Date;
    /** Status of the payment (e.g., 'succeeded', 'failed', 'pending', 'refunded'). */
    status: 'succeeded' | 'failed' | 'pending' | 'refunded' | 'charged_back';
    /** Payment method used (e.g., 'credit_card', 'paypal', 'apple_pay', 'bank_transfer'). */
    method: string;
    /** Optional invoice ID associated with the payment. */
    invoiceId?: string;
    /** Any error message if the payment failed. */
    errorMessage?: string;
    /** Last four digits of the card, if applicable, for display. */
    cardLast4?: string;
    /** Brand of the credit card (e.g., Visa, Mastercard). */
    cardBrand?: string;
    /** Metadata from the payment provider for debugging/auditing. */
    providerMetadata?: Record<string, any>;
    /** Type of transaction (e.g., 'subscription_payment', 'one_time_purchase', 'refund'). */
    transactionType: 'subscription_payment' | 'one_time_purchase' | 'refund' | 'trial_conversion';
}

/**
 * Represents a product that can be purchased (e.g., a one-time content unlock,
 * a digital good, or a physical item).
 */
export interface ProductOffering {
    /** Unique ID of the product. */
    id: string;
    /** Display name of the product, localized. */
    name: LocalizedString;
    /** Detailed description of the product, localized. */
    description: LocalizedString;
    /** Price of the product. */
    price: number;
    /** Currency of the product. */
    currency: string;
    /** Whether the product is currently available for purchase. */
    isAvailable: boolean;
    /** Type of product (e.g., 'digital_download', 'premium_content_unlock', 'physical_good', 'event_ticket'). */
    productType: string;
    /** Associated content item ID, if this product unlocks specific content. */
    associatedContentId?: ResourceId;
    /** URL to an image representing the product. */
    imageUrl?: string;
    /** Inventory count for physical or limited digital goods. */
    inventory?: number;
    /** SKU (Stock Keeping Unit) for inventory management. */
    sku?: string;
    /** Date and time when the product was added to the catalog. */
    createdAt: Date;
    /** Date and time when the product was last updated. */
    updatedAt: Date;
    /** Optional, ID of the subscription plan required to access this product at a discounted rate. */
    discountForPlanId?: string;
    /** Whether tax is applied to this product. */
    taxable: boolean;
    /** Shipping details for physical products. */
    shippingInfo?: {
        weightKg: number;
        dimensionsCm: { length: number; width: number; height: number };
        shippingZones: string[]; // e.g., 'US', 'EU'
    };
}

/**
 * Represents an invoice issued to a customer for services or products.
 */
export interface InvoiceDetails {
    /** Unique invoice ID. */
    id: string;
    /** Customer ID associated with the invoice. */
    customerId: string;
    /** Date the invoice was issued. */
    issueDate: Date;
    /** Due date for payment. */
    dueDate: Date;
    /** Total amount of the invoice. */
    totalAmount: number;
    /** Currency of the invoice. */
    currency: string;
    /** Status of the invoice (e.g., 'pending', 'paid', 'overdue', 'refunded'). */
    status: 'pending' | 'paid' | 'overdue' | 'refunded' | 'voided';
    /** URL to the PDF version of the invoice. */
    invoicePdfUrl?: string;
    /** List of line items on the invoice. */
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
        productId?: ResourceId;
        subscriptionId?: string;
    }[];
    /** Tax amount applied. */
    taxAmount?: number;
    /** Discount amount applied. */
    discountAmount?: number;
    /** Payment details if the invoice has been paid. */
    paymentInfo?: PaymentDetails;
}

/**
 * ==============================================================================
 * ANALYTICS, MONITORING, AND TELEMETRY TYPES
 * These types are crucial for gathering insights, tracking performance,
 * and ensuring the health, scalability, and optimal operation of the platform.
 * They enable data-driven decisions and proactive issue resolution.
 * ==============================================================================
 */

/**
 * Defines a single data point for an analytics metric.
 * Supports granular tracking of user behavior and system performance.
 */
export interface MetricDataPoint {
    /** Name of the metric (e.g., 'page_views', 'video_plays', 'subscription_conversions', 'api_latency'). */
    metricName: string;
    /** The numerical value of the metric. */
    value: number;
    /** Timestamp when the data point was recorded. */
    timestamp: Date;
    /** Optional dimensions or tags for the metric (e.g., 'browser', 'country', 'content_id', 'device_type'). */
    dimensions?: Record<string, string | number>;
    /** User ID associated with the metric, if applicable, for personalized analytics. */
    userId?: string;
    /** Session ID for correlating user activity tracking. */
    sessionId?: string;
    /** Event ID for tracing specific user interactions. */
    eventId?: string;
}

/**
 * Configuration for a dashboard widget, allowing dynamic rendering and customization
 * of analytics data visualizations. Enables personalized reporting for users/admins.
 */
export interface DashboardWidgetConfig {
    /** Unique ID for the widget configuration. */
    id: string;
    /** Title of the widget, localized. */
    title: LocalizedString;
    /** Type of visualization (e.g., 'line_chart', 'bar_chart', 'kpi', 'table', 'gauge'). */
    chartType: 'line_chart' | 'bar_chart' | 'area_chart' | 'pie_chart' | 'kpi' | 'table' | 'gauge' | 'heatmap';
    /** Metric(s) to display in the widget. Can be a single string or an array for multi-series charts. */
    metrics: string[];
    /** Time range for the data (e.g., '24h', '7d', '30d', '90d', '1y', 'all_time', 'custom'). */
    timeRange: '24h' | '7d' | '30d' | '90d' | '1y' | 'all_time' | 'custom';
    /** Custom date range if timeRange is 'custom'. */
    customDateRange?: DateRange;
    /** Filters to apply to the data (e.g., 'content_type=Article', 'country=US', 'browser=Chrome'). */
    filters?: Record<string, string | string[]>;
    /** Grouping dimensions for the data (e.g., 'by_hour', 'by_day', 'by_content_id', 'by_author'). */
    groupBy?: string[];
    /** Whether the data should be refreshed automatically. */
    autoRefresh: boolean;
    /** Refresh interval in seconds, if autoRefresh is true. */
    refreshIntervalSeconds?: number;
    /** Order of the widget on the dashboard layout. */
    order: number;
    /** Layout properties for grid-based dashboards. */
    layout?: {
        x: number;
        y: number;
        w: number;
        h: number;
        minW?: number;
        maxW?: number;
        minH?: number;
        maxH?: number;
    };
    /** Optional drill-down link or action for the widget. */
    drilldownLink?: string;
    /** Comparison period for showing changes (e.g., 'previous_period', 'previous_year'). */
    comparisonPeriod?: 'previous_period' | 'previous_year' | 'none';
}

/**
 * Represents a health status report for a specific service or microservice component.
 * Critical for system monitoring and incident response.
 */
export interface ServiceHealthStatus {
    /** Name of the service or component (e.g., 'API Gateway', 'Database Service', 'Content Microservice'). */
    serviceName: string;
    /** Current operational status of the service. */
    status: 'operational' | 'degraded' | 'major_outage' | 'maintenance' | 'unknown';
    /** Last checked timestamp for this status. */
    lastChecked: Date;
    /** Optional message or detailed explanation about the current status. */
    message?: string;
    /** Dependencies of this service and their statuses, for cascading impact analysis. */
    dependencies?: Record<string, 'operational' | 'degraded' | 'major_outage' | 'unknown'>;
    /** Response time in milliseconds (for API services), indicating performance. */
    responseTimeMs?: number;
    /** Error rate (percentage) if applicable, for identifying service degradation. */
    errorRate?: number;
    /** CPU utilization percentage. */
    cpuUtilization?: number;
    /** Memory utilization percentage. */
    memoryUtilization?: number;
    /** Number of active instances or pods. */
    activeInstances?: number;
}

/**
 * Represents a structured log entry for auditing changes, debugging issues,
 * and tracking critical system events. Supports comprehensive traceability.
 */
export interface AuditLogEntry {
    /** Unique ID of the log entry. */
    id: string;
    /** Timestamp of the event in UTC. */
    timestamp: Date;
    /** User ID who performed the action, or 'SYSTEM' for automated processes. */
    userId: string | 'SYSTEM';
    /** IP address of the user/system that initiated the action. */
    ipAddress?: string;
    /** Specific action performed (e.g., 'CREATE_CONTENT', 'UPDATE_USER_ROLE', 'LOGIN_SUCCESS', 'DELETE_ASSET'). */
    action: string;
    /** Type of resource affected by the action (e.g., 'Content', 'User', 'Settings', 'Subscription', 'Asset'). */
    resourceType: string;
    /** ID of the specific resource affected. */
    resourceId: ResourceId;
    /** Detailed payload of the change, including 'oldValue' and 'newValue' for state transitions. */
    details: Record<string, any>;
    /** Severity of the event (e.g., 'INFO', 'WARN', 'ERROR', 'CRITICAL', 'DEBUG'). */
    severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL' | 'DEBUG';
    /** Contextual information (e.g., 'browser', 'operating_system', 'client_application'). */
    context?: Record<string, string>;
    /** Optional, ID of the transaction or request that this log entry is part of. */
    transactionId?: string;
}

/**
 * Represents a system-generated notification to users, administrators, or external systems.
 * Supports various notification channels and priorities.
 */
export interface SystemNotification {
    /** Unique ID of the notification. */
    id: string;
    /** User ID to whom the notification is addressed (null for broadcast to all relevant users). */
    recipientId?: string;
    /** Type of notification (e.g., 'INFO', 'WARNING', 'SUCCESS', 'URGENT', 'PROMOTIONAL', 'CRITICAL_ALERT'). */
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT' | 'PROMOTIONAL' | 'CRITICAL_ALERT';
    /** Title of the notification, localized. */
    title: LocalizedString;
    /** Main message body of the notification, localized. */
    message: LocalizedString;
    /** URL the user should be directed to upon clicking the notification. */
    actionUrl?: string;
    /** Icon to display with the notification (e.g., 'bell', 'alert-triangle'). */
    icon?: string;
    /** Date and time when the notification was created. */
    createdAt: Date;
    /** Whether the notification has been read by the recipient. */
    isRead: boolean;
    /** Date and time when the notification should expire and no longer be shown. */
    expiresAt?: Date;
    /** Priority level (e.g., 1-5, 1 being highest), for ordering and prominence. */
    priority?: number;
    /** Channel(s) through which the notification should be delivered (e.g., 'in-app', 'email', 'push', 'sms'). */
    channels: ('in-app' | 'email' | 'push' | 'sms' | 'webhook')[];
    /** Optional, ID of the related content or entity. */
    relatedEntityId?: ResourceId;
    /** Optional, type of the related entity. */
    relatedEntityType?: string;
}

/**
 * Represents an item or task placed in a background job queue.
 * Essential for asynchronous processing and scalable operations.
 */
export interface JobQueueItem {
    /** Unique ID of the job. */
    id: string;
    /** Type of job to be performed (e.g., 'PROCESS_VIDEO', 'GENERATE_REPORT', 'SEND_EMAIL_BATCH'). */
    jobType: string;
    /** Status of the job lifecycle. */
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    /** Payload containing job-specific data. */
    payload: Record<string, any>;
    /** Date and time when the job was created. */
    createdAt: Date;
    /** Date and time when the job was last updated. */
    updatedAt: Date;
    /** Optional, date and time when the job should be executed. */
    executeAt?: Date;
    /** User ID who initiated the job, if applicable. */
    initiatedByUserId?: string;
    /** Number of attempts made to execute the job. */
    attempts: number;
    /** Max number of attempts before failing. */
    maxAttempts: number;
    /** Error message if the job failed. */
    errorMessage?: string;
    /** Progress percentage (0-100) for long-running jobs. */
    progress?: number;
    /** Reference to an external system or service, if this job is part of an integration. */
    externalReferenceId?: string;
}

/**
 * ==============================================================================
 * ARTIFICIAL INTELLIGENCE (AI) INTEGRATION TYPES
 * These types facilitate the configuration, interaction, and management
 * of AI-powered features within the platform, enabling advanced content creation,
 * personalization, and automation.
 * ==============================================================================
 */

/**
 * Enumeration of AI model types supported by the platform.
 * Categorizes models based on their primary function.
 */
export enum AIModelType {
    /** Large Language Model for text generation, summarization, translation, Q&A. */
    LLM = 'LLM',
    /** Vision Model for image analysis, object detection, image generation, captioning. */
    Vision = 'VISION',
    /** Speech-to-text or Text-to-speech model for audio processing. */
    Speech = 'SPEECH',
    /** Recommendation engine model for content personalization. */
    Recommendation = 'RECOMMENDATION',
    /** Search or RAG (Retrieval Augmented Generation) model for enhanced search and content synthesis. */
    Search = 'SEARCH',
    /** Specialized model for content generation (e.g., articles, headlines, marketing copy). */
    ContentGeneration = 'CONTENT_GENERATION',
    /** Model for data analysis, pattern recognition, or forecasting. */
    Analytics = 'ANALYTICS',
}

/**
 * Configuration for a specific AI model integrated into the platform.
 * Allows for dynamic switching between providers and fine-tuning parameters.
 */
export interface AIModelConfig {
    /** Unique ID for the AI model configuration. */
    id: string;
    /** Human-readable name of the model (e.g., "OpenAI GPT-4", "Anthropic Claude 3 Opus"). */
    name: string;
    /** Provider of the AI model (e.g., 'openai', 'anthropic', 'google', 'aws', 'huggingface'). */
    provider: string;
    /** The specific model identifier from the provider (e.g., 'gpt-4o', 'claude-3-opus-20240229', 'mistral-large'). */
    modelId: string;
    /** The type of AI model, aligning with `AIModelType`. */
    type: AIModelType;
    /** API endpoint for this model, possibly a proxy or direct URL. */
    apiUrl: string;
    /** Reference to an API key or authentication method in a secure secret store. */
    apiKeyRef?: string;
    /** Default temperature setting for generative models (0.0 - 2.0), controlling randomness. */
    defaultTemperature?: number;
    /** Maximum number of tokens for output generation. */
    maxOutputTokens?: number;
    /** Cost per token or per call, for billing, quota tracking, and cost optimization. */
    costPerUnit?: {
        inputToken: number;
        outputToken: number;
        currency: string;
    };
    /** Rate limits configured for this model, preventing abuse and managing spending. */
    rateLimits?: {
        requestsPerMinute?: number;
        tokensPerMinute?: number;
        burstRequests?: number;
    };
    /** Whether the model is currently active and available for use in the platform. */
    isActive: boolean;
    /** Features this model is capable of (e.g., 'text_generation', 'summarization', 'image_captioning', 'sentiment_analysis'). */
    capabilities: string[];
    /** Date and time when this configuration was last updated. */
    lastUpdated: Date;
    /** Any custom parameters specific to the model or provider. */
    customParameters?: Record<string, any>;
    /** Model version or specific training date. */
    version?: string;
}

/**
 * Represents a structured prompt template for AI models.
 * Essential for consistent, repeatable, and maintainable AI interactions,
 * supporting dynamic variable injection.
 */
export interface PromptTemplate {
    /** Unique ID for the prompt template. */
    id: string;
    /** Name of the template (e.g., "Summarize Article", "Generate Headline Ideas", "Translate Text"), localized. */
    name: LocalizedString;
    /** Detailed description of the template's purpose, expected input, and desired output, localized. */
    description: LocalizedString;
    /** The actual prompt text, including placeholders for dynamic variables.
     * @example "Summarize the following article: {{article_text}} in {{word_count}} words."
     */
    templateString: string;
    /** List of variables expected in the template string (e.g., 'article_text', 'word_count'). */
    variables: string[];
    /** Recommended AI model type for this prompt for optimal results. */
    recommendedModelType: AIModelType;
    /** Recommended AI model ID for optimal results with this specific prompt. */
    recommendedModelId?: string;
    /** Default values or examples for variables, useful for preview or initial setup. */
    defaultVariableValues?: Record<string, string>;
    /** Instructions for context or system messages to accompany the main prompt. */
    systemMessage?: LocalizedString;
    /** Output format expected (e.g., 'json', 'markdown', 'plain_text'). */
    outputFormat?: 'json' | 'markdown' | 'plain_text' | 'xml';
    /** Date and time when the template was last updated. */
    lastUpdated: Date;
    /** User ID of the last person who modified this template. */
    lastModifiedBy?: string;
    /** Whether this template is active and available for use. */
    isActive: boolean;
    /** Categories for organizing prompt templates. */
    categories?: string[];
}

/**
 * Represents a standardized response structure from an AI model.
 * Provides a consistent way to handle AI outputs, usage, and potential errors.
 */
export interface AIResponse<T = any> {
    /** Unique ID for this AI response, for tracking. */
    responseId: string;
    /** ID of the AI model configuration used to generate this response. */
    modelId: string;
    /** The input prompt or request sent to the AI model. Can be a string, template, or object. */
    input: string | PromptTemplate | Record<string, any>;
    /** The raw, unprocessed output string received directly from the AI model. */
    rawOutput: string;
    /** Parsed and structured output, if applicable (e.g., a JSON object from a structured prompt). */
    parsedOutput?: T;
    /** Token usage statistics for the request, crucial for cost analysis. */
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        cost?: number; // Estimated cost in currency
        currency?: string;
    };
    /** Timestamp of the response generation. */
    timestamp: Date;
    /** Status of the AI request (e.g., 'success', 'error', 'throttled', 'rate_limited'). */
    status: 'success' | 'error' | 'throttled' | 'rate_limited' | 'invalid_input';
    /** Error message if the request failed. */
    errorMessage?: string;
    /** Error code from the AI provider, if available. */
    errorCode?: string;
    /** Metadata from the AI provider for diagnostics. */
    providerMetadata?: Record<string, any>;
    /** Optional, user ID associated with the AI request. */
    userId?: string;
}

/**
 * Defines a specific AI-powered feature with its configuration, access controls,
 * and usage limits within the platform.
 */
export interface AIFeatureDefinition {
    /** Unique ID for the AI feature. */
    id: string;
    /** Display name of the feature (e.g., "AI Content Summarizer", "Image Tagging", "Headline Generator"), localized. */
    name: LocalizedString;
    /** Description of what the feature does and its benefits, localized. */
    description: LocalizedString;
    /** The specific AI model(s) and/or prompt template(s) used by this feature. */
    aiConfig: {
        modelId: string; // Refers to AIModelConfig.id
        promptTemplateId?: string; // Refers to PromptTemplate.id
        // ... more specific AI parameters or overrides
        customParameters?: Record<string, any>;
    };
    /** Whether this feature is currently enabled globally. */
    isEnabled: boolean;
    /** Whether this feature is a premium feature, requiring a specific subscription plan or entitlement. */
    isPremiumFeature: boolean;
    /** Roles that are allowed to use this feature. */
    allowedRoles: UserRole[];
    /** Usage limits for the feature (e.g., '10 calls/day', '10000 tokens/month', 'unlimited'). */
    usageLimits?: {
        callsPerPeriod?: number; // Maximum number of API calls
        tokensPerPeriod?: number; // Maximum number of tokens consumed
        periodUnit: 'day' | 'week' | 'month' | 'lifetime'; // Defines the billing/tracking period
    };
    /** Date and time when this feature definition was last updated. */
    lastUpdated: Date;
    /** Optional content types that this AI feature can process or generate. */
    appliesToContentTypes?: ContentType[];
    /** Example use cases or typical inputs/outputs. */
    examples?: { input: string; output: string }[];
}

/**
 * Represents a dataset used for fine-tuning AI models, for RAG (Retrieval Augmented Generation),
 * or for training purposes. Tracks data origin and processing status.
 */
export interface AIDataset {
    /** Unique ID of the dataset. */
    id: string;
    /** Name of the dataset (e.g., "Customer Support Docs", "Article Corpus for Summarization"). */
    name: string;
    /** Description of the dataset's content and its intended purpose. */
    description?: LocalizedString;
    /** Type of data contained in the dataset (e.g., 'text', 'image', 'audio', 'mixed'). */
    dataType: 'text' | 'image' | 'audio' | 'mixed' | 'structured';
    /** Source of the data (e.g., 'internal_database', 'external_api', 'uploaded_files', 'content_library'). */
    source: string;
    /** Number of items/records in the dataset. */
    itemCount: number;
    /** Last date when the dataset was updated or synchronized with its source. */
    lastUpdated: Date;
    /** Status of the dataset processing (e.g., 'pending', 'processing', 'ready', 'failed', 'training_model'). */
    status: 'pending' | 'processing' | 'ready' | 'failed' | 'training_model';
    /** Optional, ID of the AI model this dataset is primarily used with (e.g., for fine-tuning). */
    associatedModelId?: string;
    /** Storage location or path of the dataset. */
    storageLocation?: string;
    /** Size of the dataset in bytes or other relevant units. */
    sizeBytes?: number;
    /** Creator or owner of the dataset. */
    createdByUserId?: string;
    /** Access level for the dataset (e.g., 'public', 'private', 'restricted_to_team'). */
    accessLevel: 'public' | 'private' | 'restricted_to_team';
    /** Metadata about data quality or bias. */
    qualityMetrics?: {
        completeness?: number; // 0-1
        accuracy?: number; // 0-1
        biasAnalysisReportUrl?: string;
    };
}


/**
 * ==============================================================================
 * GENERIC UTILITY AND HELPER TYPES
 * Types that provide common structures for lists, responses, and errors,
 * ensuring consistency across API interfaces and data handling.
 * ==============================================================================
 */

/**
 * Generic interface for paginated list responses from an API.
 * Standardizes how collections of data are returned, facilitating UI rendering
 * and efficient data fetching.
 */
export interface PaginatedResponse<T> {
    /** Array of items for the current page. */
    items: T[];
    /** Total number of items across all pages, allowing clients to calculate total pages. */
    totalItems: number;
    /** Current page number (1-indexed). */
    currentPage: number;
    /** Total number of pages available, derived from totalItems and itemsPerPage. */
    totalPages: number;
    /** Number of items requested per page. */
    itemsPerPage: number;
    /** Optional link to the next page of results, for HATEOAS compliance. */
    nextPageLink?: string;
    /** Optional link to the previous page of results. */
    previousPageLink?: string;
    /** Optional link to the first page. */
    firstPageLink?: string;
    /** Optional link to the last page. */
    lastPageLink?: string;
}

/**
 * Standardized error response structure for API calls.
 * Provides clear, actionable error information for debugging and user feedback.
 */
export interface ErrorResponse {
    /** HTTP status code (e.g., 400, 401, 404, 500). */
    statusCode: number;
    /** A concise, human-readable error message, localized for user-facing errors. */
    message: LocalizedString | string;
    /** A machine-readable, consistent error code for programmatic handling. */
    errorCode: string;
    /** Optional, detailed error information (e.g., validation errors for specific fields). */
    details?: Record<string, any>;
    /** Timestamp of when the error occurred. */
    timestamp: Date;
    /** A unique request ID for tracing the error through logs and distributed systems. */
    requestId?: string;
    /** Optional, URL to more information about the error. */
    infoUrl?: string;
}

/**
 * Type for representing flexible key-value pairs, often used for dynamic settings,
 * metadata, or custom attributes. Supports various primitive and complex types.
 */
export type KeyValuePairs = Record<string, string | number | boolean | object | Array<any> | null | undefined>;

/**
 * Represents a geographic coordinate with optional altitude, crucial for location-aware applications.
 */
export interface GeoCoordinate {
    latitude: number;
    longitude: number;
    altitude?: number; // In meters
}

/**
 * Represents a date range, useful for filtering, scheduling, or reporting.
 */
export interface DateRange {
    /** The start date of the range (inclusive). */
    startDate: Date;
    /** The end date of the range (inclusive). */
    endDate: Date;
}

/**
 * Represents a generic resource identifier that could be a UUID string, a slug, or a numerical ID.
 * Provides flexibility for various resource naming conventions.
 */
export type ResourceId = string | number;

/**
 * Represents various states for an asynchronous operation, useful for UI feedback
 * and managing loading states.
 */
export type AsyncOperationStatus = 'idle' | 'pending' | 'success' | 'error' | 'cancelled';

/**
 * Defines a custom filter criterion for data queries.
 */
export interface FilterCriterion {
    field: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with';
    value: string | number | boolean | string[] | number[];
}

/**
 * Defines sorting parameters for data queries.
 */
export interface SortParameter {
    field: string;
    direction: 'asc' | 'desc';
}

/**
 * Represents a rich link object, for internal and external navigation.
 */
export interface LinkObject {
    /** The URL or path of the link. */
    href: string;
    /** The display text of the link, localized. */
    text: LocalizedString;
    /** Optional icon name for the link. */
    icon?: string;
    /** Target attribute for the link (e.g., '_blank', '_self'). */
    target?: '_self' | '_blank' | '_parent' | '_top';
    /** Relationship of the link (e.g., 'noopener', 'noreferrer'). */
    rel?: string;
}
```