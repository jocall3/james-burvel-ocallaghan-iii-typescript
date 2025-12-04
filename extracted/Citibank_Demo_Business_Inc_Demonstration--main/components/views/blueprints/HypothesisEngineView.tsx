"""This module centralizes the management and intelligent automation of A/B tests and experimentation within the financial infrastructure. It provides a comprehensive view for designing, executing, monitoring, and analyzing hypotheses, leveraging agentic intelligence to drive data-informed product and operational enhancements. Business Impact: By streamlining the experimentation lifecycle, this system empowers rapid innovation, validates strategic initiatives with quantifiable metrics, and optimizes user experiences to maximize revenue, reduce operational friction, and secure market advantage in the digital finance landscape. It is a critical component for continuous value creation and adaptive strategy."""

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../Card';

// --- Utility Functions and Helper Types ---

/**
 * Generates a unique ID for entities, ensuring secure and distinct identifiers across the financial system.
 * Business Impact: Provides robust and collision-resistant identification for all entities, critical for audit trails,
 * tracking immutable transactions, and maintaining data integrity in a high-volume financial ecosystem.
 * @param prefix Optional prefix for the ID, enhancing traceability.
 * @returns A unique string ID suitable for enterprise-grade applications.
 */
export const generateUniqueId = (prefix: string = 'id'): string => {
    // Using cryptographic-grade random number generation if available or falling back to a robust timestamp-based approach.
    // For browser environment, Math.random is sufficient for UI IDs, but for backend entities, crypto.randomUUID would be preferred.
    return `${prefix}-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
};

/**
 * Formats a date string into a readable, standardized format for global financial reporting and user interfaces.
 * Business Impact: Ensures consistent and auditable timestamp representation across all platform operations,
 * supporting compliance requirements and clear communication of event timelines to stakeholders.
 * @param dateInput The date string or Date object to format.
 * @returns Formatted date string, or 'Invalid Date' if input is malformed.
 */
export const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Ensure 24-hour format for consistency in financial contexts
    });
};

/**
 * Capitalizes the first letter of a string, used for consistent UI presentation and data normalization.
 * Business Impact: Enhances user experience and data readability, contributing to the professional presentation
 * of financial data and reports.
 * @param str The input string.
 * @returns Capitalized string, or an empty string if input is null/empty.
 */
export const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Deep clones an object to prevent direct state mutation, ensuring immutability of critical data structures.
 * Business Impact: Safeguards against unintended side effects in complex state management, crucial for
 * maintaining data integrity and predictability in financial transaction processing and UI updates.
 * @param obj The object to clone.
 * @returns A deep clone of the object, preserving data state.
 */
export const deepClone = <T>(obj: T): T => {
    // Note: This JSON-based deep clone is suitable for simple data types.
    // For objects with functions, Dates, RegExps, or circular references, a more robust library or custom implementation would be required.
    // Given the data structures, JSON.parse(JSON.stringify(obj)) is sufficient here.
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Represents different types of metrics, classifying their role in evaluating financial or operational performance.
 * Business Impact: Enables clear prioritization and interpretation of data, allowing for focused analysis on
 * revenue-driving (primary), supporting (secondary), or risk-mitigating (guardrail) performance indicators.
 */
export type MetricType = 'primary' | 'secondary' | 'guardrail' | 'custom';

/**
 * Represents the lifecycle status of an experiment within the financial platform.
 * Business Impact: Provides granular control and visibility over experimental initiatives, enabling
 * agile deployment, monitoring, and iteration on new features or financial products while ensuring compliance
 * and managing risk effectively.
 */
export type ExperimentStatus = 'Draft' | 'Running' | 'Paused' | 'Completed' | 'Archived' | 'Scheduled';

/**
 * Represents the type of a variant in an A/B test, defining its role in the experimentation process.
 * Business Impact: Clearly distinguishes baseline (Control) from new (Treatment) or tailored (Personalized)
 * experiences, enabling precise measurement of incremental value and targeted optimization strategies.
 */
export type VariantType = 'Control' | 'Treatment' | 'Personalized';

/**
 * Basic interface for an entity that has an ID and name, serving as a foundational building block for all system entities.
 * Business Impact: Ensures consistent identification and referencing of components, users, or data across the platform,
 * facilitating integration and data traceability.
 */
export interface BaseEntity {
    id: string;
    name: string;
}

/**
 * Interface for a metric used in an experiment, defining key performance indicators for financial or operational success.
 * Business Impact: Drives data-driven decision-making by quantifying business objectives. Supports real-time monitoring,
 * risk management via guardrail thresholds, and clear reporting of value creation or operational health.
 */
export interface Metric extends BaseEntity {
    description: string;
    type: MetricType;
    unit: string; // e.g., 'percentage', 'count', 'USD' for financial metrics
    aggregationMethod: 'sum' | 'average' | 'median' | 'count';
    targetValue?: number; // Optional target for goal metrics
    guardrailThreshold?: { min?: number; max?: number }; // For critical operational or security thresholds
    lastUpdated: string;
}

/**
 * Interface for a variant in an A/B test, detailing a specific version of a feature or experience.
 * Business Impact: Enables granular control over experimental treatments, allowing for precise allocation
 * of traffic and detailed specification of changes, which is vital for isolating impact and optimizing
 * financial products or user journeys.
 */
export interface Variant extends BaseEntity {
    description: string;
    type: VariantType;
    trafficAllocation: number; // Percentage of traffic (0-100), ensuring deterministic routing.
    mockupUrl?: string; // URL to design mockup for visual review.
    implementationDetails?: string; // Technical details for developers, linking to engineering tasks.
    screenshotUrl?: string; // URL to a screenshot of the variant.
}

/**
 * Interface for a user segment or audience, defining specific groups for targeted experimentation.
 * Business Impact: Facilitates personalized financial product offerings and experiences, enabling
 * micro-segmentation for optimized marketing, risk assessment, and compliance enforcement tailored to
 * specific user groups, thus maximizing conversion and retention.
 */
export interface Segment extends BaseEntity {
    description: string;
    rules: string[]; // e.g., ['country = "US"', 'device = "mobile"', 'user_age > 18'] for rule-based segmentation.
    lastUpdated: string;
}

/**
 * Interface for the results of a single variant within an experiment, providing granular performance data.
 * Business Impact: Offers detailed insights into the performance of individual treatments, quantifying
 * their impact on key metrics like conversions and revenue. Critical for identifying winning strategies
 * and understanding user behavior nuances.
 */
export interface VariantResult {
    variantId: string;
    variantName: string;
    impressions: number;
    conversions: number;
    conversionRate: number; // Calculated: conversions / impressions
    revenue?: number; // For revenue-based metrics, directly reflecting financial impact.
    averageValue?: number; // For average-value metrics (e.g., AOV).
    participants: number; // Unique users in this variant, for sample size analysis.
    statisticalSignificance?: number; // p-value, for robust conclusion drawing.
    confidenceInterval?: [number, number]; // e.g., [0.02, 0.05] for lift.
    lift?: number; // Percentage lift compared to control, indicating incremental value.
    isWinner?: boolean;
    rawMetricData?: { [metricId: string]: { value: number; count: number; } }; // Detailed metric data for deeper analysis.
}

/**
 * Interface for the overall experiment results summary, providing a high-level overview of an experiment's outcome.
 * Business Impact: Offers a concise, auditable record of an experiment's success or failure, guiding strategic
 * decisions, confirming value creation, and informing future product development cycles.
 */
export interface ExperimentResultSummary {
    experimentId: string;
    primaryMetricId: string;
    overallStatus: 'Inconclusive' | 'Winner' | 'Loser' | 'GuardrailBreached';
    winningVariantId?: string;
    controlVariantId?: string;
    variantResults: VariantResult[];
    analysisDate: string;
    confidenceLevelAchieved?: number; // e.g., 0.95
    minimumDetectableEffect?: number; //MDE
    durationDays?: number;
    sampleSizeNeeded?: number;
}

/**
 * Interface for an experiment, encapsulating all details for a hypothesis test within the financial infrastructure.
 * Business Impact: This comprehensive structure serves as the blueprint for driving innovation, validating
 * business assumptions, and continuously optimizing the platform. It integrates governance, deployment, and
 * financial oversight to ensure experiments contribute directly to strategic objectives and value creation.
 */
export interface Experiment extends BaseEntity {
    hypothesis: string;
    problemStatement: string;
    goal: string;
    status: ExperimentStatus;
    startDate: string;
    endDate?: string;
    owner: string; // Refers to the ID of the Digital Identity owning the experiment.
    reviewerId?: string; // Refers to the ID of the Digital Identity reviewing the experiment.
    tags: string[]; // Categorization for discoverability and reporting.
    primaryMetricId: string;
    secondaryMetricIds: string[];
    variants: Variant[];
    segments: string[]; // IDs of segments, linking to the Digital Identity & Trust Layer for audience definition.
    trafficAllocationOverall: number; // Total traffic for the experiment (0-100), ensuring system stability.
    durationDays?: number; // Planned duration in days.
    confidenceLevel: number; // e.g., 0.95 for 95%.
    sampleSize?: number; // Calculated or estimated sample size.
    notes: string;
    createdAt: string;
    lastUpdated: string;
    results?: ExperimentResultSummary;
    reviewComments?: { userId: string; comment: string; timestamp: string }[]; // Audit trail for peer review.
    versionHistory?: { timestamp: string; changes: string }[]; // Audit trail for experiment modifications, linking to governance.
    deploymentStatus?: 'Pending' | 'Deployed' | 'Failed' | 'RolledBack'; // Status of feature flag deployment.
    deploymentDetails?: { tool: string; id: string; url: string }[]; // Links to external deployment systems (simulated).
    budget?: { currency: string; amount: number; spent: number }; // Financial oversight for experiment costs.
    stakeholders?: string[]; // User IDs or emails, linking to Digital Identity for collaboration.
    jiraTicketId?: string; // Integration with project management (simulated).
    confluencePageUrl?: string; // Integration with documentation (simulated).
    aiSuggestions?: AIDesignOutput | AIAnalysisOutput; // Stores AI generated suggestions or analysis.
    lastAIAudit?: string; // Timestamp of the last AI audit or analysis.
    governancePolicyId?: string; // Links to a specific governance policy from the Governance Layer.
}

/**
 * User interface for permissions, integrating with the Digital Identity and Trust Layer for secure access control.
 * Business Impact: Ensures that only authorized personnel can initiate, modify, or deploy experiments,
 * upholding the highest standards of operational integrity and preventing unauthorized financial system changes.
 */
export type UserRole = 'Viewer' | 'Editor' | 'Admin' | 'Analyst' | 'Deployer';
export interface User extends BaseEntity {
    email: string;
    role: UserRole;
    lastLogin: string;
    isActive: boolean;
}

/**
 * Global application settings, configuring the behavior of the financial infrastructure platform.
 * Business Impact: Provides centralized control over critical operational parameters, data governance rules,
 * and integration points, ensuring the platform operates efficiently, securely, and in compliance with
 * enterprise standards.
 */
export interface AppSettings {
    defaultConfidenceLevel: number;
    defaultMinimumDetectableEffect: number;
    dataRetentionDays: number;
    integrations: {
        jiraEnabled: boolean;
        slackEnabled: boolean;
        googleAnalyticsEnabled: boolean;
        googleAdsEnabled: boolean;
        crmEnabled: boolean;
        programmableTokenRailEnabled: boolean; // New: For financial system integration.
        digitalIdentityEnabled: boolean; // New: For identity layer integration.
    };
    deploymentProviders: {
        featureFlags: string[];
        cdn: string[];
    };
    notificationPreferences: {
        email: boolean;
        slack: boolean;
        inApp: boolean;
    };
    securityPolicies: { // New: Link to security policy framework.
        strictMFA: boolean;
        dataEncryptionAtRest: boolean;
    };
    governanceRulesetId: string; // New: Default governance ruleset.
}

/**
 * Represents a system notification, providing real-time alerts and feedback to users.
 * Business Impact: Enhances operational awareness by delivering critical information and warnings
 * directly to relevant users, facilitating rapid response to anomalies, security events, or
 * significant experiment outcomes, thereby improving overall system resilience and user engagement.
 */
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    isRead: boolean;
    actionLink?: string;
}

// --- Mock Data Generation Functions ---

export const mockMetrics: Metric[] = [
    { id: 'm1', name: 'Sign-ups', description: 'Number of new user registrations', type: 'primary', unit: 'count', aggregationMethod: 'sum', lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'm2', name: 'Conversion Rate', description: 'Percentage of users completing a purchase', type: 'primary', unit: 'percentage', aggregationMethod: 'average', targetValue: 0.05, lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'm3', name: 'Avg. Revenue Per User', description: 'Average revenue generated by a user', type: 'primary', unit: 'USD', aggregationMethod: 'average', lastUpdated: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: 'm4', name: 'Page Load Time', description: 'Average time for a page to load in seconds', type: 'guardrail', unit: 'seconds', aggregationMethod: 'average', guardrailThreshold: { max: 3 }, lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'm5', name: 'Error Rate', description: 'Percentage of requests resulting in an error', type: 'guardrail', unit: 'percentage', aggregationMethod: 'average', guardrailThreshold: { max: 0.01 }, lastUpdated: new Date().toISOString() },
    { id: 'm6', name: 'Bounce Rate', description: 'Percentage of single-page sessions', type: 'secondary', unit: 'percentage', aggregationMethod: 'average', lastUpdated: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: 'm7', name: 'Time on Site', description: 'Average duration a user spends on the site', type: 'secondary', unit: 'seconds', aggregationMethod: 'average', lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'm8', name: 'Click-Through Rate (CTR)', description: 'Percentage of impressions that result in a click', type: 'custom', unit: 'percentage', aggregationMethod: 'average', lastUpdated: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: 'm9', name: 'Add to Cart Rate', description: 'Percentage of users adding an item to their cart', type: 'custom', unit: 'percentage', aggregationMethod: 'average', lastUpdated: new Date(Date.now() - 86400000 * 6).toISOString() },
    { id: 'm10', name: 'Checkout Start Rate', description: 'Percentage of users initiating the checkout process', type: 'custom', unit: 'percentage', aggregationMethod: 'average', lastUpdated: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: 'm11', name: 'Transaction Throughput', description: 'Number of transactions processed per second', type: 'guardrail', unit: 'TPS', aggregationMethod: 'average', guardrailThreshold: { min: 100, max: 1000 }, lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'm12', name: 'Settlement Latency', description: 'Average time for a settlement to complete', type: 'guardrail', unit: 'ms', aggregationMethod: 'average', guardrailThreshold: { max: 500 }, lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString() },
];

export const mockSegments: Segment[] = [
    { id: 's1', name: 'All Users', description: 'All visitors to the site', rules: [], lastUpdated: new Date().toISOString() },
    { id: 's2', name: 'Mobile Users - US', description: 'Users accessing from a mobile device in the US', rules: ['device = "mobile"', 'country = "US"'], lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 's3', name: 'Returning Customers', description: 'Users who have made at least one purchase before', rules: ['has_purchased = true'], lastUpdated: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: 's4', name: 'New Signups (Last 30 Days)', description: 'Users who signed up in the last 30 days', rules: ['signup_date > (NOW() - 30 days)'], lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 's5', name: 'High-Value Shoppers', description: 'Users with average order value > $100', rules: ['average_order_value > 100'], lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 's6', name: 'International Payments', description: 'Users initiating cross-border payment transactions', rules: ['transaction_type = "international_payment"'], lastUpdated: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export const mockUsers: User[] = [
    { id: 'u1', name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), isActive: true },
    { id: 'u2', name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', lastLogin: new Date(Date.now() - 86400000 * 1).toISOString(), isActive: true },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Analyst', lastLogin: new Date(Date.now() - 86400000 * 5).toISOString(), isActive: true },
    { id: 'u4', name: 'Diana Prince', email: 'diana@example.com', role: 'Viewer', lastLogin: new Date(Date.now() - 86400000 * 10).toISOString(), isActive: true },
    { id: 'u5', name: 'Eve Adams', email: 'eve@example.com', role: 'Deployer', lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(), isActive: true },
    { id: 'u6', name: 'Frank Miller', email: 'frank@example.com', role: 'Editor', lastLogin: new Date(Date.now() - 86400000 * 14).toISOString(), isActive: true },
];

const createMockExperiment = (idPrefix: string, status: ExperimentStatus, hypothesis: string): Experiment => {
    const id = generateUniqueId(idPrefix);
    const primaryMetric = mockMetrics[Math.floor(Math.random() * mockMetrics.length)];
    const secondaryMetrics = mockMetrics.filter(m => m.type === 'secondary' || m.type === 'guardrail').slice(0, Math.floor(Math.random() * 2) + 1).map(m => m.id);
    const variants: Variant[] = [
        { id: generateUniqueId('var'), name: 'Control', description: 'Original experience', type: 'Control', trafficAllocation: 50, mockupUrl: 'https://example.com/mockups/control.png' },
        { id: generateUniqueId('var'), name: 'Treatment A', description: 'Modified experience for testing', type: 'Treatment', trafficAllocation: 50, mockupUrl: 'https://example.com/mockups/variantA.png' }
    ];
    if (Math.random() > 0.7) { // Sometimes add a third variant
        variants.push({ id: generateUniqueId('var'), name: 'Treatment B', description: 'Another modified experience', type: 'Treatment', trafficAllocation: 0 });
        variants[0].trafficAllocation = 33;
        variants[1].trafficAllocation = 34;
        variants[2].trafficAllocation = 33;
    }

    const segments = mockSegments.slice(0, Math.floor(Math.random() * 2) + 1).map(s => s.id);

    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString();
    const startDate = status !== 'Draft' ? new Date(Date.parse(createdAt) + Math.floor(Math.random() * 7 * 86400000)).toISOString() : undefined;
    const endDate = (status === 'Completed' || status === 'Archived') && startDate
        ? new Date(Date.parse(startDate) + Math.floor(Math.random() * 30 * 86400000) + 14 * 86400000).toISOString()
        : undefined;

    const owner = mockUsers[Math.floor(Math.random() * mockUsers.length)].id;
    const reviewerId = status !== 'Draft' && Math.random() > 0.5 ? mockUsers[Math.floor(Math.random() * mockUsers.length)].id : undefined;

    const experiment: Experiment = {
        id,
        name: capitalizeFirstLetter(hypothesis.split(' ')[0]) + ' Experiment ' + id.substring(id.length - 4),
        hypothesis,
        problemStatement: 'Users are not converting at the desired rate. We believe changing the UI will improve it.',
        goal: 'Increase ' + primaryMetric.name + ' by X%',
        status,
        startDate: startDate || createdAt,
        endDate: endDate,
        owner,
        reviewerId,
        tags: ['UI/UX', 'Conversion', 'Feature'],
        primaryMetricId: primaryMetric.id,
        secondaryMetricIds: secondaryMetrics,
        variants,
        segments,
        trafficAllocationOverall: 100,
        durationDays: status === 'Completed' || status === 'Archived' ? Math.floor((new Date(endDate!).getTime() - new Date(startDate!).getTime()) / 86400000) : 14,
        confidenceLevel: 0.95,
        sampleSize: 10000,
        notes: 'Initial design based on AI suggestion. Needs further refinement for variant details and implementation.',
        createdAt,
        lastUpdated: new Date().toISOString(),
        reviewComments: [],
        versionHistory: [],
        deploymentStatus: status === 'Running' || status === 'Completed' ? 'Deployed' : 'Pending',
        budget: { currency: 'USD', amount: 5000, spent: Math.random() * 5000 },
        stakeholders: [mockUsers[0].id, mockUsers[1].id],
        jiraTicketId: Math.random() > 0.5 ? 'PROJ-' + Math.floor(Math.random() * 1000) : undefined,
        governancePolicyId: 'POL-001-EXPERIMENTATION', // Mock governance policy ID
    };

    if (status === 'Completed') {
        const controlImpressions = Math.floor(Math.random() * 50000) + 10000;
        const controlConversions = Math.floor(controlImpressions * (Math.random() * 0.02 + 0.03)); // 3-5%
        const controlCR = controlConversions / controlImpressions;

        const variantResults: VariantResult[] = experiment.variants.map(v => {
            let impressions = controlImpressions;
            let conversions = controlConversions;
            let conversionRate = controlCR;
            let lift = 0;
            let isWinner = false;

            if (v.type === 'Treatment') {
                impressions = Math.floor(controlImpressions * (v.trafficAllocation / variants[0].trafficAllocation));
                const liftFactor = Math.random() * 0.2 - 0.1; // -10% to +10%
                conversions = Math.floor(impressions * (controlCR * (1 + liftFactor)));
                conversionRate = conversions / impressions;
                lift = (conversionRate / controlCR - 1) * 100;
                isWinner = lift > 5 && Math.random() > 0.5; // Randomly declare winner if > 5% lift
            }

            return {
                variantId: v.id,
                variantName: v.name,
                impressions: impressions,
                conversions: conversions,
                conversionRate: parseFloat(conversionRate.toFixed(4)),
                participants: Math.floor(impressions * (0.8 + Math.random() * 0.2)),
                statisticalSignificance: Math.random() * 0.1, // p-value
                confidenceInterval: [Math.random() * 0.01 - 0.05, Math.random() * 0.01 + 0.05],
                lift: parseFloat(lift.toFixed(2)),
                isWinner: isWinner,
            };
        });

        const overallStatus = variantResults.some(r => r.isWinner) ? 'Winner' : 'Inconclusive';
        const winningVariant = variantResults.find(r => r.isWinner);

        experiment.results = {
            experimentId: experiment.id,
            primaryMetricId: primaryMetric.id,
            overallStatus: overallStatus,
            winningVariantId: winningVariant?.variantId,
            controlVariantId: experiment.variants.find(v => v.type === 'Control')?.id,
            variantResults: variantResults,
            analysisDate: new Date().toISOString(),
            confidenceLevelAchieved: 0.95,
            minimumDetectableEffect: 0.01,
            durationDays: experiment.durationDays,
            sampleSizeNeeded: experiment.sampleSize,
        };
    }
    return experiment;
};

export const mockExperiments: Experiment[] = [
    createMockExperiment('exp', 'Running', 'Changing the main call-to-action button from blue to green will increase sign-ups'),
    createMockExperiment('exp', 'Draft', 'Adding a testimonial section on the homepage will improve conversion rate'),
    createMockExperiment('exp', 'Completed', 'Redesigning the checkout flow will reduce cart abandonment'),
    createMockExperiment('exp', 'Paused', 'Implementing a new recommendation engine will increase average order value'),
    createMockExperiment('exp', 'Archived', 'Changing the hero image on the landing page will increase bounce rate (failed experiment)'),
    createMockExperiment('exp', 'Running', 'Personalized product recommendations based on browsing history will boost CTR'),
    createMockExperiment('exp', 'Scheduled', 'Optimizing mobile navigation for easier access to categories'),
    createMockExperiment('exp', 'Completed', 'Offering free shipping for orders over $50 improves conversion'),
    createMockExperiment('exp', 'Draft', 'A/B test different headline options for product pages'),
    createMockExperiment('exp', 'Running', 'Experimenting with different pricing tiers for premium features'),
    createMockExperiment('exp', 'Running', 'Implementing dynamic fraud detection rules in real-time settlement will reduce financial loss.'),
    createMockExperiment('exp', 'Completed', 'A/B testing two programmable token rail configurations for transaction latency improvement.'),
];

export const initialAppSettings: AppSettings = {
    defaultConfidenceLevel: 0.95,
    defaultMinimumDetectableEffect: 0.02,
    dataRetentionDays: 365,
    integrations: {
        jiraEnabled: true,
        slackEnabled: true,
        googleAnalyticsEnabled: true,
        googleAdsEnabled: false,
        crmEnabled: false,
        programmableTokenRailEnabled: true,
        digitalIdentityEnabled: true,
    },
    deploymentProviders: {
        featureFlags: ['LaunchDarkly', 'Optimizely'],
        cdn: ['Cloudflare', 'Akamai'],
    },
    notificationPreferences: {
        email: true,
        slack: false,
        inApp: true,
    },
    securityPolicies: {
        strictMFA: true,
        dataEncryptionAtRest: true,
    },
    governanceRulesetId: 'FIN-GOV-001',
};

// --- Contexts for global state ---
interface AppContextType {
    currentUser: User | null;
    settings: AppSettings;
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markNotificationAsRead: (id: string) => void;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    setCurrentUser: (user: User | null) => void;
}

/**
 * React Context for global application state, providing access to current user, settings, and notifications.
 * Business Impact: Centralizes critical state management, enabling a consistent and responsive user experience
 * across the entire financial platform. Facilitates secure identity management and real-time operational alerts.
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Custom hook to access the global application context.
 * Business Impact: Simplifies state access patterns, promoting cleaner and more maintainable code
 * while ensuring all components can react to or trigger critical system-wide events securely.
 * @returns The application context.
 * @throws Error if used outside of an AppProvider.
 */
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

/**
 * Provides the global application context to its children components.
 * Business Impact: Establishes the foundational state management layer for the entire platform,
 * wrapping the application in a secure and performant data-sharing mechanism that scales
 * with enterprise requirements.
 * @param children The React nodes to be rendered within the provider's scope.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]); // Default to first mock user
    const [settings, setSettings] = useState<AppSettings>(initialAppSettings);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
        const newNotification: Notification = {
            ...notification,
            id: generateUniqueId('notif'),
            timestamp: new Date().toISOString(),
            isRead: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
    }, []);

    const markNotificationAsRead = useCallback((id: string) => {
        setNotifications((prev) =>
            prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
        );
    }, []);

    const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
        setSettings((prev) => ({ ...prev, ...newSettings }));
    }, []);

    const value = useMemo(() => ({
        currentUser,
        settings,
        notifications,
        addNotification,
        markNotificationAsRead,
        updateSettings,
        setCurrentUser
    }), [currentUser, settings, notifications, addNotification, markNotificationAsRead, updateSettings, setCurrentUser]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// --- AI Agent Simulation (Internal Module Replacement) ---

/**
 * Interface for AI-generated experiment design.
 */
export interface AIDesignOutput {
    problemStatement: string;
    goal: string;
    primaryMetricName: string;
    secondaryMetricNames: string[];
    tags: string[];
    variants: { name: string, description: string }[];
    estimatedDurationDays?: number;
    recommendedTrafficAllocation?: { name: string, allocation: number }[];
    securityConsiderations?: string[];
    governanceContext?: string[];
}

/**
 * Interface for AI-generated experiment analysis and recommendations.
 */
export interface AIAnalysisOutput {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    riskAssessment: { type: 'Low' | 'Medium' | 'High', description: string }[];
    futureExperimentSuggestions?: string[];
    governanceComplianceReport?: string[]; // Links to governance module
}

/**
 * Simulates an advanced AI agent for generating and analyzing experiment hypotheses and results.
 * Business Impact: This module embodies the "Agentic Intelligence Layer" by providing autonomous capabilities
 * for experiment design and analysis, significantly accelerating decision-making, reducing manual
 * effort, and ensuring optimal experiment configuration for maximum business impact and risk mitigation.
 * It directly contributes to the platform's intelligent automation capabilities, driving efficiency and innovation.
 */
export class HypothesisAgentSimulator {
    /**
     * Simulates the AI generation of an experiment design based on a hypothesis.
     * @param hypothesis The core hypothesis to design an experiment around.
     * @returns A promise resolving to an AIDesignOutput object.
     */
    static async generateExperimentDesign(hypothesis: string): Promise<AIDesignOutput> {
        return new Promise(resolve => {
            setTimeout(() => {
                const problemStatement = `Optimizing user engagement is critical. We hypothesize that by ${hypothesis.toLowerCase()}, we can significantly improve key performance indicators.`;
                const goal = `Increase user engagement rate by 15% and conversion rate by 5% over baseline through refined user experience.`;
                const primaryMetricName = 'User Engagement Rate';
                const secondaryMetricNames = ['Session Duration', 'Error Rate', 'Page Load Time', 'Transaction Throughput'];
                const tags = ['AI-Generated', 'Optimization', 'UX', 'Financial_Flow'];
                const variants = [
                    { name: 'Control', description: 'The existing user experience without modifications. Serves as the baseline for comparison.' },
                    { name: 'Treatment Alpha', description: `A redesigned interface element incorporating insights derived from the hypothesis: ${hypothesis.substring(0, Math.min(hypothesis.length, 50))}... This variant focuses on simplifying the payment initiation process.` },
                    { name: 'Treatment Beta', description: `An alternative treatment leveraging personalized content based on user segmentation and integrating a new programmable value rail for faster settlement.` }
                ];
                const estimatedDurationDays = 21;
                const recommendedTrafficAllocation = [
                    { name: 'Control', allocation: 33 },
                    { name: 'Treatment Alpha', allocation: 33 },
                    { name: 'Treatment Beta', allocation: 34 }
                ];
                const securityConsiderations = [
                    "Ensure robust data privacy for personalized content based on digital identity.",
                    "Validate cryptographic integrity for all A/B test participation logging and audit trails."
                ];
                const governanceContext = [
                    "Compliance with Payment Card Industry Data Security Standard (PCI DSS) for payment flow changes.",
                    "Adherence to regional financial regulations (e.g., GDPR, CCPA) for user data handling."
                ];

                resolve({
                    problemStatement,
                    goal,
                    primaryMetricName,
                    secondaryMetricNames,
                    tags,
                    variants,
                    estimatedDurationDays,
                    recommendedTrafficAllocation,
                    securityConsiderations,
                    governanceContext
                });
            }, 1500); // Simulate API call latency for realistic user experience
        });
    }

    /**
     * Simulates the AI analysis of experiment results, generating actionable insights and recommendations.
     * @param experiment The experiment data for analysis context.
     * @param results The summary of experiment results to be analyzed.
     * @returns A promise resolving to an AIAnalysisOutput object.
     */
    static async analyzeExperimentResults(experiment: Experiment, results: ExperimentResultSummary): Promise<AIAnalysisOutput> {
        return new Promise(resolve => {
            setTimeout(() => {
                const summary = `Comprehensive AI analysis of Experiment '${experiment.name}' provides critical insights into performance trends and actionable strategies for optimization within the financial ecosystem.`;
                const keyFindings: string[] = [];
                const recommendations: string[] = [];
                let riskType: AIAnalysisOutput['riskAssessment'][0]['type'] = 'Low';
                let riskDescription = 'No significant operational or security risks identified. The experiment ran within expected parameters and governance frameworks.';

                const winningVariant = results.variantResults.find(v => v.isWinner);
                if (winningVariant) {
                    keyFindings.push(`**Winning Variant Identified**: Variant '${winningVariant.variantName}' demonstrated a statistically significant ${winningVariant.lift}% lift in the primary metric (${mockMetrics.find(m => m.id === experiment.primaryMetricId)?.name}). This indicates a strong positive impact on business value.`);
                    recommendations.push(`**Immediate Action**: Initiate full production rollout of Variant '${winningVariant.variantName}' to capture enhanced business value. Prepare for post-deployment monitoring and impact assessment.`);
                } else {
                    keyFindings.push(`**Inconclusive Results**: The experiment did not yield a statistically significant winner. All variants performed similarly, or improvements were marginal. This suggests the tested changes did not provide a decisive competitive advantage.`);
                    recommendations.push(`**Strategic Next Steps**: Review detailed variant performance, conduct deeper qualitative user research, or iterate on the hypothesis with refined treatment designs. Consider re-targeting specific high-value segments for future tests.`);
                }

                const breachedGuardrails = mockMetrics.filter(m => m.type === 'guardrail' && experiment.secondaryMetricIds.includes(m.id) && Math.random() < 0.2); // Simulate random guardrail breach
                if (breachedGuardrails.length > 0) {
                    keyFindings.push(`**Critical Alert**: Guardrail metrics breached during execution: ${breachedGuardrails.map(m => m.name).join(', ')}. This indicates potential operational instability or security concerns.`);
                    recommendations.push(`**Urgent Remediation**: Immediately investigate the root causes of guardrail breaches. Consider pausing or rolling back the experiment to preserve system integrity. Consult the Security and Governance teams.`);
                    riskType = 'High';
                    riskDescription = 'Critical guardrail metrics were breached, indicating potential adverse effects on system stability or compliance. Requires immediate attention and resolution.';
                } else {
                    keyFindings.push('All critical guardrail metrics remained within acceptable operational thresholds, confirming experiment stability and adherence to performance baselines.');
                }

                recommendations.push(`**Further Optimization**: Explore granular segmentation analysis to understand how different user cohorts responded. This can unlock targeted optimization opportunities and future programmable value rail configurations.`);

                const governanceComplianceReport = [
                    "Experiment design compliant with 'FIN-GOV-001' experimentation policy.",
                    "User data handling within legal and ethical guidelines (Digital Identity & Trust Layer).",
                    "Immutable audit logs confirm all experiment changes and results.",
                    "Deployment integrity verified against established security protocols."
                ];

                resolve({
                    summary,
                    keyFindings,
                    recommendations,
                    riskAssessment: [{ type: riskType, description: riskDescription }],
                    futureExperimentSuggestions: [
                        `Optimize '${winningVariant?.variantName || 'current best variant'}' for specific high-value user segments to maximize financial impact.`,
                        'Test the impact of dynamic pricing strategies on conversion and average revenue per user within the new token rail system.',
                        'Investigate friction points in the real-time settlement process identified by detailed telemetry data.',
                        'Experiment with new digital identity verification flows for enhanced security and reduced onboarding friction.'
                    ],
                    governanceComplianceReport
                });
            }, 2000); // Simulate API call latency
        });
    }

    /**
     * Simulates the AI remediation suggestion for an anomaly detected within the financial infrastructure.
     * Business Impact: Enables rapid, intelligent response to operational disruptions or security incidents,
     * minimizing downtime and financial loss. Directly supports the remediation skill of agentic intelligence.
     * @param anomalyDescription Description of the anomaly detected, including context like metric, timestamp, and severity.
     * @returns A promise resolving to a string remediation suggestion.
     */
    static async suggestRemediation(anomalyDescription: string): Promise<string> {
        return new Promise(resolve => {
            setTimeout(() => {
                const suggestion = `Based on the detected anomaly: "${anomalyDescription}", the Agentic Intelligence Layer recommends the following actions:\n\n` +
                    `1. **Isolate Impact**: Immediately quarantine affected microservices or payment rails to prevent cascading failures.\n` +
                    `2. **Verify Integrity**: Initiate cryptographic integrity checks on affected data stores and transaction logs.\n` +
                    `3. **Rollback Strategy**: Prepare to roll back recent deployments if correlation is found. Leverage immutable versioning for rapid recovery.\n` +
                    `4. **Secure Communication**: Alert relevant security and operations teams via encrypted internal messaging, including risk assessment details.\n` +
                    `5. **Compliance Check**: Conduct an immediate audit against 'FIN-SEC-002' policy for incident response.\n` +
                    `6. **Monitor**: Intensify monitoring of related metrics (e.g., Transaction Throughput, Error Rate) for recovery validation.\n\n` +
                    `This proactive, deterministic approach ensures system resilience and maintains customer trust.`;
                resolve(suggestion);
            }, 1000); // Simulate processing time for complex remediation logic
        });
    }
}

// --- Reusable UI Components ---

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    className?: string;
    error?: string; // Add error prop for validation feedback.
}
/**
 * A reusable select input component for consistent UI and data entry in financial forms.
 * Business Impact: Improves data entry accuracy and user experience for critical selections
 * like experiment metrics, user roles, or governance policies, reducing operational errors.
 * @param label The label for the select input.
 * @param options An array of options to display in the select dropdown.
 * @param className Optional CSS classes for styling.
 * @param error Optional error message for validation feedback.
 */
export const SelectInput: React.FC<SelectInputProps> = ({ label, options, className, error, ...props }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-gray-300 text-sm">{label}</label>
        <select
            className={`w-full bg-gray-700/50 p-2 rounded text-white border ${error ? 'border-red-500' : 'border-gray-600'} focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${className}`}
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
    error?: string; // Add error prop for validation feedback.
}
/**
 * A reusable text input component, standardized for consistent data capture across the platform.
 * Business Impact: Ensures data consistency and reduces entry errors for crucial fields such as
 * experiment names, financial values, or digital identity attributes, enhancing data quality.
 * @param label The label for the text input.
 * @param className Optional CSS classes for styling.
 * @param error Optional error message for validation feedback.
 */
export const TextInput: React.FC<TextInputProps> = ({ label, className, error, ...props }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-gray-300 text-sm">{label}</label>
        <input
            type="text"
            className={`w-full bg-gray-700/50 p-2 rounded text-white border ${error ? 'border-red-500' : 'border-gray-600'} focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${className}`}
            {...props}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    className?: string;
    error?: string; // Add error prop for validation feedback.
}
/**
 * A reusable textarea input component for capturing extensive descriptions and narratives.
 * Business Impact: Facilitates detailed documentation for experiment hypotheses, problem statements,
 * or audit findings, supporting comprehensive record-keeping and knowledge transfer within the enterprise.
 * @param label The label for the textarea input.
 * @param className Optional CSS classes for styling.
 * @param error Optional error message for validation feedback.
 */
export const TextareaInput: React.FC<TextareaInputProps> = ({ label, className, error, ...props }) => (
    <div className="flex flex-col space-y-1">
        <label className="text-gray-300 text-sm">{label}</label>
        <textarea
            className={`w-full bg-gray-700/50 p-2 rounded text-white border ${error ? 'border-red-500' : 'border-gray-600'} focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${className}`}
            {...props}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);

interface CheckboxInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
}
/**
 * A reusable checkbox input component for binary selections and feature toggles.
 * Business Impact: Enables intuitive configuration of options like integration enablement or
 * notification preferences, supporting flexible system customization and user control.
 * @param label The label associated with the checkbox.
 * @param className Optional CSS classes for styling.
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({ label, className, ...props }) => (
    <label className={`inline-flex items-center space-x-2 cursor-pointer ${className}`}>
        <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700/50 border-gray-600 rounded focus:ring-cyan-500"
            {...props}
        />
        <span className="text-gray-300 text-sm">{label}</span>
    </label>
);

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    label?: string;
    className?: string;
}
/**
 * A standardized icon button component for actionable UI elements.
 * Business Impact: Streamlines user interaction by providing visually intuitive controls for
 * common actions, enhancing operational efficiency and reducing cognitive load.
 * @param icon The SVG icon or React node to display.
 * @param label Optional text label for the button.
 * @param className Optional CSS classes for styling.
 */
export const IconButton: React.FC<IconButtonProps> = ({ icon, label, className, children, ...props }) => (
    <button
        className={`inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 text-gray-400 hover:text-white transition-colors ${className}`}
        {...props}
    >
        {icon}
        {label && <span className="ml-2 text-sm">{label}</span>}
        {children}
    </button>
);

// SVG Icons (simplified for brevity, normally separate files or icon library)
/**
 * SVG icon for adding new entities.
 * Business Impact: Standardized iconography supports intuitive user interaction, reducing training needs.
 */
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for editing existing entities.
 * Business Impact: Clear visual cues for editing actions ensure users can quickly modify system configurations or data.
 */
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.646 3.646l-2.828 2.828-6.364 6.364a1 1 0 000 1.414V17h1.414l6.364-6.364 2.828-2.828L13.586 7.172z" />
    </svg>
);
/**
 * SVG icon for deleting entities.
 * Business Impact: Provides a standardized, recognizable action for removal, critical for data management.
 */
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for charts and analytics.
 * Business Impact: Represents access to performance metrics and analytical insights, crucial for data-driven decisions.
 */
const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
);
/**
 * SVG icon for settings and configurations.
 * Business Impact: Provides an intuitive entry point for managing system-wide parameters, critical for operational control.
 */
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.5 1.5 0 01-1.48 1.25H5a1.5 1.5 0 00-1.5 1.5v1.5c0 .76.5 1.44 1.24 1.63.15.04.3.07.45.09A1.5 1.5 0 018 10a1.5 1.5 0 01-2.28 1.45c-.15.02-.3.05-.45.09A1.5 1.5 0 003.5 13v1.5c0 .83.67 1.5 1.5 1.5h2.03c.38 1.56 2.6 1.56 2.98 0a1.5 1.5 0 011.48-1.25H15a1.5 1.5 0 001.5-1.5V13c0-.76-.5-1.44-1.24-1.63a1.5 1.5 0 01-2.28-1.45c.15-.02.3-.05.45-.09A1.5 1.5 0 0016.5 7V5.5c0-.83-.67-1.5-1.5-1.5h-2.03a1.5 1.5 0 01-1.48-1.25zM10 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for lists or general data views.
 * Business Impact: Supports clear navigation to structured data, essential for managing complex financial entities.
 */
const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for user groups or segments.
 * Business Impact: Visually represents user segmentation, key for targeted financial product delivery.
 */
const UserGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
);
/**
 * SVG icon for notifications.
 * Business Impact: Crucial for alerting users to critical system events, security warnings, or successful operations.
 */
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
);
/**
 * SVG icon for the home or dashboard view.
 * Business Impact: Provides quick access to the system's central operational overview, facilitating rapid situational awareness.
 */
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);
/**
 * SVG icon for search functionality.
 * Business Impact: Enables efficient discovery of information across the platform, accelerating investigation and data retrieval.
 */
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for information or details.
 * Business Impact: Directs users to contextual help or deeper data insights, improving understanding and operational effectiveness.
 */
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for success or confirmation.
 * Business Impact: Provides clear visual confirmation of successful operations, reinforcing user confidence.
 */
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for warnings or errors.
 * Business Impact: Immediately flags critical issues, drawing user attention to potential problems or required actions.
 */
const ExclamationTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.3 2.607-1.3 3.372 0l1.175 2.036a4.5 4.5 0 011.192 1.942l.24 1.096a4.5 4.5 0 01-.563 2.977l-.663 1.147a4.5 4.5 0 01-1.192 1.942l-1.175 2.036c-.765 1.3-2.607 1.3-3.372 0l-1.175-2.036a4.5 4.5 0 01-1.192-1.942l-.24-1.096a4.5 4.5 0 01.563-2.977l.663-1.147a4.5 4.5 0 011.192-1.942l1.175-2.036zM10 8a1 1 0 011 1v4a1 1 0 11-2 0V9a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);
/**
 * SVG icon for displaying logs or audit trails.
 * Business Impact: Provides visual reference to auditable records, crucial for compliance and forensic analysis.
 */
const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.064 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M14.25 5.25L16.5 7.5M4.5 18.75h9.75c.621 0 1.125-.504 1.125-1.125V11.25m6 4.5H18m0 0l-1.429 2.143M18 15l1.429 2.143m-4.322 1.291a8.48 8.48 0 01-.99 3.124h3.138A2.25 2.25 0 0021 18.75V10.5m-15.84 8.707a3 3 0 003 3H12m-9.75-9.375a3 3 0 013-3h1.372c.516 0 .966.351 1.04 .856l.67 4.157a4.5 4.5 0 00.862 1.987V19.5M4.5 18.75V8.25M4.5 18.75h-1.5m1.5 0H5.25" />
    </svg>
);
/**
 * SVG icon for an AI or brain-like entity, representing agentic intelligence.
 * Business Impact: Clearly denotes features leveraging AI, highlighting the platform's advanced automation capabilities.
 */
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9.006 17.5c-.21.403-.028.934.432 1.146l2.013 1.006c.488.244 1.08.134 1.37-.309l1.413-2.316 2.493.393c.381.06.747-.168.923-.523l.145-.292M9.813 15.904c-.783.047-1.45-.602-1.402-1.385l.048-.797m6.892 7.044l-2.585-1.166a1.125 1.125 0 01-.678-.953V5.75c0-1.026.93-1.855 1.855-1.855h1.315c1.027 0 1.855.829 1.855 1.855v11.892m0 0S9.813 15.904 12.016 12m0 0C5.148 12 3 5.5 3 5.5m7.029 5.838L9.006 17.5M10.5 8.25L10.279 6.33M10.5 8.25L9.664 7.03M10.5 8.25L8.983 9.497M12.75 8.25h1.75M4.5 9.75v-1.5c0-1.027.828-1.855 1.855-1.855h1.315c.664 0 1.25.334 1.576.838M12.75 8.25c.348-.11.696-.215 1.045-.32M4.5 9.75L4.032 6.6M4.5 9.75c-.173.003-.346.007-.52.011m0 0h-.44" />
    </svg>
);


// Global Notification Toast component
export const NotificationToast: React.FC = () => {
    const { notifications, markNotificationAsRead } = useAppContext();
    const visibleNotifications = notifications.filter(n => !n.isRead).slice(0, 3); // Show max 3 unread

    /**
     * Renders a global toast notification system.
     * Business Impact: Provides real-time, non-intrusive feedback on system operations, security alerts,
     * and transaction statuses. Enhances operational transparency and user confidence by immediately
     * communicating critical information across the financial platform.
     */
    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 w-full max-w-sm">
            {visibleNotifications.map((notif) => (
                <div
                    key={notif.id}
                    className={`p-4 rounded-lg shadow-lg flex items-start space-x-3 transition-all duration-300 ease-out transform
                                ${notif.type === 'success' ? 'bg-green-600 text-white' : ''}
                                ${notif.type === 'error' ? 'bg-red-600 text-white' : ''}
                                ${notif.type === 'warning' ? 'bg-yellow-600 text-white' : ''}
                                ${notif.type === 'info' ? 'bg-blue-600 text-white' : ''}`}
                    role="alert"
                >
                    <div className="flex-shrink-0">
                        {notif.type === 'success' && <CheckCircleIcon className="h-6 w-6" />}
                        {notif.type === 'error' && <ExclamationTriangleIcon className="h-6 w-6" />}
                        {notif.type === 'warning' && <ExclamationTriangleIcon className="h-6 w-6" />}
                        {notif.type === 'info' && <InfoIcon className="h-6 w-6" />}
                    </div>
                    <div className="flex-grow">
                        <p className="font-semibold">{capitalizeFirstLetter(notif.type)}</p>
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-opacity-75 mt-1">{formatDate(notif.timestamp)}</p>
                        {notif.actionLink && (
                            <a href={notif.actionLink} className="text-sm underline mt-2 block hover:text-opacity-80">View Details</a>
                        )}
                    </div>
                    <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="ml-auto -mr-1 -mt-1 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                        aria-label="Dismiss notification"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

/**
 * A loading spinner component for indicating ongoing asynchronous operations.
 * Business Impact: Improves user experience during data fetching or complex computations,
 * providing visual feedback that the system is active and responsive, especially crucial
 * for real-time financial data processing.
 */
export const Loader: React.FC = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-400">Loading...</span>
    </div>
);

interface PaginatorProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
/**
 * A pagination component for navigating through large datasets.
 * Business Impact: Enhances data manageability and user experience when dealing with extensive
 * lists of transactions, experiments, or audit logs, ensuring efficient access to critical information.
 * @param currentPage The current active page number.
 * @param totalPages The total number of pages available.
 * @param onPageChange Callback function triggered when the page changes.
 */
export const Paginator: React.FC<PaginatorProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav className="flex justify-center mt-4">
            <ul className="flex items-center space-x-1">
                <li>
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-md bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 disabled:opacity-50"
                    >
                        Previous
                    </button>
                </li>
                {pages.map(page => (
                    <li key={page}>
                        <button
                            onClick={() => onPageChange(page)}
                            className={`p-2 rounded-md ${currentPage === page ? 'bg-cyan-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'}`}
                        >
                            {page}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 disabled:opacity-50"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}
/**
 * A versatile modal component for displaying overlaid content requiring user interaction or attention.
 * Business Impact: Facilitates focused user workflows for critical actions like experiment configuration,
 * transaction approvals, or detailed alert displays, ensuring user focus and reducing distractions.
 * @param isOpen Boolean indicating if the modal is currently open.
 * @param onClose Callback function to close the modal.
 * @param title The title displayed at the top of the modal.
 * @param children The content to be rendered inside the modal body.
 * @param footer Optional React node for the modal's footer section.
 * @param className Optional CSS classes for custom styling of the modal.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, className }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className={`inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${className}`}>
                    <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                            <h3 className="text-xl leading-6 font-medium text-white" id="modal-title">
                                {title}
                            </h3>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 rounded-md"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-4">
                            {children}
                        </div>
                    </div>
                    {footer && (
                        <div className="bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Application Views ---

/**
 * Navigation bar component for the financial infrastructure platform.
 * Business Impact: Provides intuitive and secure access to key functional modules, ensuring users
 * can efficiently navigate and manage experiments, metrics, segments, and system settings.
 * Integrates real-time notification indicators for critical operational awareness.
 * @param onViewChange Callback to change the currently displayed view.
 * @param currentView The ID of the currently active view.
 */
export const NavBar: React.FC<{ onViewChange: (view: string) => void; currentView: string }> = ({ onViewChange, currentView }) => {
    const { currentUser, notifications } = useAppContext();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'experiments', label: 'Experiments', icon: <ListIcon /> },
        { id: 'metrics', label: 'Metrics', icon: <ChartBarIcon /> },
        { id: 'segments', label: 'Segments', icon: <UserGroupIcon /> },
        { id: 'ai-designer', label: 'AI Experimentation', icon: <SparklesIcon /> }, // Dedicated AI view
        { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    ];

    const handleLogout = () => {
        // Placeholder for secure logout logic, involving session invalidation and digital identity management.
        console.log('User logged out. Invalidate session and clear digital identity context.');
        onViewChange('login'); // Redirect to a login view or similar
    };

    return (
        <nav className="flex flex-col bg-gray-900 w-64 h-screen p-4 border-r border-gray-700 fixed top-0 left-0">
            <div className="flex items-center mb-6">
                <span className="text-2xl font-bold text-white tracking-wider">Blueprint Engine</span>
            </div>
            <ul className="space-y-2 flex-grow">
                {navItems.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => onViewChange(item.id)}
                            className={`flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200
                                ${currentView === item.id ? 'bg-cyan-800 text-white' : ''}`}
                        >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
            <div className="mt-auto pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-sm">Welcome, {currentUser?.name || 'Guest'}</span>
                    <IconButton icon={<BellIcon />} className="relative" onClick={() => onViewChange('notifications')}>
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </IconButton>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-3">Logout</span>
                </button>
            </div>
        </nav>
    );
};

/**
 * Displays a list of experiments, providing filtering, sorting, and pagination capabilities.
 * Business Impact: Offers a clear, actionable overview of all experimental initiatives, enabling
 * quick identification of critical tests, monitoring progress, and facilitating efficient management
 * of the innovation pipeline within the financial platform.
 * @param experiments Array of Experiment objects to display.
 * @param onSelectExperiment Callback triggered when an experiment is selected for viewing/editing.
 * @param onCreateExperiment Callback triggered to initiate the creation of a new experiment.
 * @param onDeleteExperiment Callback triggered to delete an experiment.
 */
export const ExperimentList: React.FC<{
    experiments: Experiment[];
    onSelectExperiment: (id: string) => void;
    onCreateExperiment: () => void;
    onDeleteExperiment: (id: string) => void;
}> = ({ experiments, onSelectExperiment, onCreateExperiment, onDeleteExperiment }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<ExperimentStatus | 'All'>('All');
    const [sortKey, setSortKey] = useState<'name' | 'status' | 'startDate' | 'lastUpdated'>('lastUpdated');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const experimentsPerPage = 10;

    const filteredExperiments = useMemo(() => {
        let filtered = experiments.filter(exp =>
            exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.hypothesis.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterStatus !== 'All') {
            filtered = filtered.filter(exp => exp.status === filterStatus);
        }
        return filtered;
    }, [experiments, searchTerm, filterStatus]);

    const sortedExperiments = useMemo(() => {
        return [...filteredExperiments].sort((a, b) => {
            let valA: any, valB: any;
            switch (sortKey) {
                case 'name':
                    valA = a.name.toLowerCase();
                    valB = b.name.toLowerCase();
                    break;
                case 'status':
                    valA = a.status.toLowerCase();
                    valB = b.status.toLowerCase();
                    break;
                case 'startDate':
                    valA = a.startDate ? new Date(a.startDate).getTime() : 0;
                    valB = b.startDate ? new Date(b.startDate).getTime() : 0;
                    break;
                case 'lastUpdated':
                    valA = new Date(a.lastUpdated).getTime();
                    valB = new Date(b.lastUpdated).getTime();
                    break;
                default:
                    valA = a.id;
                    valB = b.id;
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredExperiments, sortKey, sortDirection]);

    const totalPages = Math.ceil(sortedExperiments.length / experimentsPerPage);
    const paginatedExperiments = useMemo(() => {
        const startIndex = (currentPage - 1) * experimentsPerPage;
        return sortedExperiments.slice(startIndex, startIndex + experimentsPerPage);
    }, [sortedExperiments, currentPage, experimentsPerPage]);

    const handleSort = (key: 'name' | 'status' | 'startDate' | 'lastUpdated') => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const getSortIndicator = (key: string) => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
        return '';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-white">All Experiments</h2>
                <button
                    onClick={onCreateExperiment}
                    className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white transition-colors"
                >
                    <PlusIcon /> <span className="ml-2">Create New Experiment</span>
                </button>
            </div>

            <Card title="Experiment Filters">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextInput
                        label="Search"
                        placeholder="Search by name, hypothesis, or tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SelectInput
                        label="Status"
                        options={[{ value: 'All', label: 'All Statuses' }, ...Object.values(ExperimentStatus).map(s => ({ value: s, label: s }))]}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as ExperimentStatus | 'All')}
                    />
                     <SelectInput
                        label="Sort By"
                        options={[
                            { value: 'name', label: 'Name' },
                            { value: 'status', label: 'Status' },
                            { value: 'startDate', label: 'Start Date' },
                            { value: 'lastUpdated', label: 'Last Updated' },
                        ]}
                        value={sortKey}
                        onChange={(e) => handleSort(e.target.value as any)}
                    />
                </div>
            </Card>

            <Card title="Experiment Overview">
                {paginatedExperiments.length === 0 ? (
                    <p className="text-gray-400">No experiments match your criteria.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                                        Name {getSortIndicator('name')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Hypothesis</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                                        Status {getSortIndicator('status')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('startDate')}>
                                        Start Date {getSortIndicator('startDate')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('lastUpdated')}>
                                        Last Updated {getSortIndicator('lastUpdated')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {paginatedExperiments.map(exp => (
                                    <tr key={exp.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-cyan-400">
                                            <button onClick={() => onSelectExperiment(exp.id)} className="hover:underline">
                                                {exp.name}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-300 max-w-xs overflow-hidden text-ellipsis">{exp.hypothesis}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${exp.status === 'Running' ? 'bg-green-100 text-green-800' : ''}
                                                ${exp.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${exp.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${exp.status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                                                ${exp.status === 'Archived' ? 'bg-red-100 text-red-800' : ''}
                                                ${exp.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' : ''}
                                            `}>
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{exp.startDate ? formatDate(exp.startDate) : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(exp.lastUpdated)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <IconButton icon={<EditIcon />} onClick={() => onSelectExperiment(exp.id)} title="View/Edit" />
                                                <IconButton icon={<TrashIcon />} onClick={() => onDeleteExperiment(exp.id)} className="text-red-400 hover:text-red-300" title="Delete" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {totalPages > 1 && (
                    <Paginator currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                )}
            </Card>
        </div>
    );
};

/**
 * Form for creating or editing an experiment.
 * Business Impact: Centralizes the configuration of new experiments, ensuring all critical parameters
 * are defined consistently. Integrates AI assistance for hypothesis generation and variant design,
 * significantly accelerating the experimentation process and reducing manual configuration effort.
 * @param onSave Callback to save the experiment.
 * @param onCancel Callback to cancel the form submission.
 * @param initialData Optional initial data for editing an existing experiment.
 * @param metrics Available metrics for selection.
 * @param segments Available segments for targeting.
 * @param users Available users for owner/reviewer assignment.
 */
export const ExperimentCreationForm: React.FC<{
    onSave: (experiment: Experiment) => void;
    onCancel: () => void;
    initialData?: Experiment;
    metrics: Metric[];
    segments: Segment[];
    users: User[];
}> = ({ onSave, onCancel, initialData, metrics, segments, users }) => {
    const { addNotification, settings, currentUser } = useAppContext();
    const [formData, setFormData] = useState<Experiment>(
        initialData || {
            id: generateUniqueId('exp'),
            name: '',
            hypothesis: '',
            problemStatement: '',
            goal: '',
            status: 'Draft',
            startDate: new Date().toISOString(),
            owner: currentUser?.id || users[0]?.id || '',
            tags: [],
            primaryMetricId: metrics[0]?.id || '',
            secondaryMetricIds: [],
            variants: [{ id: generateUniqueId('var'), name: 'Control', description: 'Original experience', type: 'Control', trafficAllocation: 50 },
                       { id: generateUniqueId('var'), name: 'Treatment A', description: '', type: 'Treatment', trafficAllocation: 50 }],
            segments: [segments[0]?.id || ''],
            trafficAllocationOverall: 100,
            confidenceLevel: settings.defaultConfidenceLevel,
            notes: '',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            deploymentStatus: 'Pending',
            stakeholders: [],
            governancePolicyId: settings.governanceRulesetId,
        }
    );
    const [newTag, setNewTag] = useState('');
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(deepClone(initialData));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setFormErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue) || value === '') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : numericValue }));
        }
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleTagAdd = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            setNewTag('');
        }
    };

    const handleTagRemove = (tagToRemove: string) => {
        setFormData(prev => ({ ...prevWithTags, tags: prevWithTags.tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleMetricChange = (metricType: 'primary' | 'secondary', metricId: string, isChecked?: boolean) => {
        if (metricType === 'primary') {
            setFormData(prev => ({ ...prev, primaryMetricId: metricId }));
        } else {
            setFormData(prev => ({
                ...prev,
                secondaryMetricIds: isChecked
                    ? [...new Set([...prev.secondaryMetricIds, metricId])]
                    : prev.secondaryMetricIds.filter(id => id !== metricId)
            }));
        }
    };

    const handleSegmentChange = (segmentId: string, isChecked: boolean) => {
        setFormData(prev => ({
            ...prev,
            segments: isChecked
                ? [...new Set([...prev.segments, segmentId])]
                : prev.segments.filter(id => id !== segmentId)
        }));
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
        setFormData(prev => {
            const newVariants = [...prev.variants];
            newVariants[index] = { ...newVariants[index], [field]: value };
            // Ensure total traffic allocation is 100% or adjust others (simplistic for now)
            if (field === 'trafficAllocation' && typeof value === 'number') {
                const updatedAllocation = Math.max(0, Math.min(100, value)); // Clamp value
                newVariants[index].trafficAllocation = updatedAllocation;

                // Adjust other variants proportionally if it's a 2-variant setup, or leave for manual adjustment otherwise
                if (newVariants.length === 2) {
                    const otherIndex = index === 0 ? 1 : 0;
                    newVariants[otherIndex].trafficAllocation = 100 - updatedAllocation;
                }
            }
            return { ...prev, variants: newVariants };
        });
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, {
                id: generateUniqueId('var'),
                name: `Treatment ${String.fromCharCode(65 + prev.variants.filter(v => v.type === 'Treatment').length)}`, // B, C, D...
                description: '',
                type: 'Treatment',
                trafficAllocation: 0
            }]
        }));
    };

    const removeVariant = (index: number) => {
        if (formData.variants.length > 2) { // Always keep at least control and one treatment
            setFormData(prev => {
                const newVariants = prev.variants.filter((_, i) => i !== index);
                // Redistribute traffic equally if possible
                const remainingAlloc = 100;
                const allocationPerVariant = Math.floor(remainingAlloc / newVariants.length);
                const distributedVariants = newVariants.map((v, i) => ({
                    ...v,
                    trafficAllocation: i === newVariants.length - 1 ? remainingAlloc - (allocationPerVariant * (newVariants.length - 1)) : allocationPerVariant
                }));
                return { ...prev, variants: distributedVariants };
            });
        } else {
            addNotification({ type: 'warning', message: 'An experiment must have at least two variants (Control and one Treatment).' });
        }
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};
        if (!formData.name.trim()) errors.name = 'Experiment name is required.';
        if (!formData.hypothesis.trim()) errors.hypothesis = 'Hypothesis is required.';
        if (!formData.problemStatement.trim()) errors.problemStatement = 'Problem Statement is required.';
        if (!formData.goal.trim()) errors.goal = 'Goal is required.';
        if (!formData.owner) errors.owner = 'Owner is required.';
        if (!formData.primaryMetricId) errors.primaryMetricId = 'Primary Metric is required.';
        if (formData.variants.length < 2) errors.variants = 'At least two variants are required (Control and Treatment).';
        const totalTraffic = formData.variants.reduce((sum, v) => sum + (v.trafficAllocation || 0), 0);
        if (totalTraffic !== 100) errors.trafficAllocation = 'Total variant traffic allocation must be 100%. Current: ' + totalTraffic + '%.';
        formData.variants.forEach((v, i) => {
            if (!v.name.trim()) errors[`variant${i}Name`] = `Variant ${i + 1} name is required.`;
            if (!v.description.trim()) errors[`variant${i}Description`] = `Variant ${i + 1} description is required.`;
            if (typeof v.trafficAllocation !== 'number' || v.trafficAllocation < 0 || v.trafficAllocation > 100) {
                errors[`variant${i}Traffic`] = `Variant ${i + 1} traffic must be between 0 and 100.`;
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSave({ ...formData, lastUpdated: new Date().toISOString() });
            addNotification({ type: 'success', message: `Experiment '${formData.name}' saved successfully.` });
        } else {
            addNotification({ type: 'error', message: 'Please correct the errors in the form.' });
        }
    };

    const handleDesignWithAI = async () => {
        if (!formData.hypothesis.trim()) {
            addNotification({ type: 'warning', message: 'Please enter a hypothesis before designing with AI.' });
            return;
        }
        setIsGeneratingPlan(true);
        try {
            const aiResponse = await HypothesisAgentSimulator.generateExperimentDesign(formData.hypothesis);
            setFormData(prev => ({
                ...prev,
                problemStatement: aiResponse.problemStatement || prev.problemStatement,
                goal: aiResponse.goal || prev.goal,
                tags: [...new Set([...prev.tags, ...aiResponse.tags])],
                primaryMetricId: metrics.find(m => m.name === aiResponse.primaryMetricName)?.id || prev.primaryMetricId,
                secondaryMetricIds: [...new Set([...prev.secondaryMetricIds, ...aiResponse.secondaryMetricNames.map(name => metrics.find(m => m.name === name)?.id).filter(Boolean) as string[]])],
                variants: aiResponse.variants.map((v, idx) => ({
                    id: generateUniqueId('var'),
                    name: v.name,
                    description: v.description,
                    type: v.name === 'Control' ? 'Control' : 'Treatment',
                    trafficAllocation: aiResponse.recommendedTrafficAllocation?.find(alloc => alloc.name === v.name)?.allocation || Math.floor(100 / aiResponse.variants.length),
                    mockupUrl: `https://example.com/ai-mockups/${v.name.toLowerCase().replace(/\s/g, '-')}.png`,
                    implementationDetails: `AI-suggested implementation details for ${v.name}: ${v.description}. Review security considerations: ${aiResponse.securityConsiderations?.join('; ') || 'N/A'}.`
                })),
                durationDays: aiResponse.estimatedDurationDays || prev.durationDays,
                aiSuggestions: aiResponse,
                lastAIAudit: new Date().toISOString(),
            }));
            addNotification({ type: 'success', message: 'AI-generated design applied successfully!' });
        } catch (error) {
            console.error('AI design generation failed:', error);
            addNotification({ type: 'error', message: 'Failed to generate AI design. Please try again.' });
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const primaryMetricOptions = metrics.map(m => ({ value: m.id, label: `${m.name} (${m.type})` }));
    const secondaryMetricOptions = metrics
        .filter(m => m.type !== 'primary')
        .map(m => ({ value: m.id, label: `${m.name} (${m.type})` }));
    const segmentOptions = segments.map(s => ({ value: s.id, label: s.name }));
    const userOptions = users.map(u => ({ value: u.id, label: u.name }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">{initialData ? 'Edit Experiment' : 'Create New Experiment'}</h2>
            <Card title="Experiment Core Details">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <TextInput label="Experiment Name" name="name" value={formData.name} onChange={handleChange} error={formErrors.name} />
                    <TextareaInput label="Hypothesis" name="hypothesis" value={formData.hypothesis} onChange={handleChange} placeholder="e.g., Changing the main CTA button color from blue to green will increase sign-ups." rows={3} error={formErrors.hypothesis} />
                    <TextareaInput label="Problem Statement" name="problemStatement" value={formData.problemStatement} onChange={handleChange} rows={3} error={formErrors.problemStatement} />
                    <TextInput label="Goal" name="goal" value={formData.goal} onChange={handleChange} error={formErrors.goal} />

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleDesignWithAI}
                            disabled={isGeneratingPlan || !formData.hypothesis.trim()}
                            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors disabled:opacity-50"
                        >
                            {isGeneratingPlan ? <Loader /> : <SparklesIcon />}
                            <span className="ml-2">{isGeneratingPlan ? 'Generating...' : 'Design with AI'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SelectInput label="Owner" name="owner" options={userOptions} value={formData.owner} onChange={handleChange} error={formErrors.owner} />
                        <SelectInput label="Reviewer" name="reviewerId" options={[{ value: '', label: 'None' }, ...userOptions]} value={formData.reviewerId || ''} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label="Start Date" type="date" name="startDate" value={formData.startDate?.split('T')[0]} onChange={handleChange} />
                        <TextInput label="End Date (Optional)" type="date" name="endDate" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} />
                    </div>

                    <div className="flex flex-col space-y-1">
                        <label className="text-gray-300 text-sm">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {tag}
                                    <button type="button" onClick={() => handleTagRemove(tag)} className="ml-1 -mr-0.5 h-3 w-3 text-blue-500 hover:text-blue-700">
                                        <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex">
                            <TextInput
                                placeholder="Add new tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="flex-grow mr-2"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                            />
                            <button type="button" onClick={handleTagAdd} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white">Add Tag</button>
                        </div>
                    </div>
                </form>
            </Card>

            <Card title="Metrics Configuration">
                <SelectInput label="Primary Metric" name="primaryMetricId" options={primaryMetricOptions} value={formData.primaryMetricId} onChange={(e) => handleMetricChange('primary', e.target.value)} error={formErrors.primaryMetricId} />
                <div className="mt-4">
                    <label className="text-gray-300 text-sm block mb-2">Secondary/Guardrail Metrics</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {secondaryMetricOptions.map(option => (
                            <CheckboxInput
                                key={option.value}
                                label={option.label}
                                checked={formData.secondaryMetricIds.includes(option.value)}
                                onChange={(e) => handleMetricChange('secondary', option.value, e.target.checked)}
                            />
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <TextInput label="Confidence Level (e.g., 0.95)" type="number" step="0.01" name="confidenceLevel" value={formData.confidenceLevel} onChange={handleNumericChange} />
                    <TextInput label="Minimum Detectable Effect (e.g., 0.02)" type="number" step="0.01" name="minimumDetectableEffect" value={formData.minimumDetectableEffect} onChange={handleNumericChange} />
                </div>
            </Card>

            <Card title="Variants & Traffic Allocation">
                {formData.variants.map((variant, index) => (
                    <div key={variant.id} className="border border-gray-700 p-4 rounded-md mb-4 relative">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-lg font-medium text-white">{variant.type === 'Control' ? 'Control' : `Variant ${index}`}</h4>
                            {variant.type !== 'Control' && formData.variants.length > 2 && (
                                <IconButton icon={<TrashIcon />} onClick={() => removeVariant(index)} className="text-red-400 hover:text-red-300" title="Remove Variant" />
                            )}
                        </div>
                        <TextInput label="Variant Name" name="name" value={variant.name} onChange={(e) => handleVariantChange(index, 'name', e.target.value)} error={formErrors[`variant${index}Name`]} />
                        <TextareaInput label="Description" name="description" value={variant.description} onChange={(e) => handleVariantChange(index, 'description', e.target.value)} rows={2} className="mt-2" error={formErrors[`variant${index}Description`]} />
                        <TextInput label="Traffic Allocation (%)" type="number" step="1" name="trafficAllocation" value={variant.trafficAllocation} onChange={(e) => handleVariantChange(index, 'trafficAllocation', parseFloat(e.target.value))} className="mt-2" error={formErrors[`variant${index}Traffic`]} />
                        {variant.mockupUrl && <TextInput label="Mockup URL" name="mockupUrl" value={variant.mockupUrl} onChange={(e) => handleVariantChange(index, 'mockupUrl', e.target.value)} className="mt-2" />}
                    </div>
                ))}
                <button type="button" onClick={addVariant} className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white mt-4">
                    <PlusIcon /> <span className="ml-2">Add Variant</span>
                </button>
                {formErrors.variants && <p className="text-red-400 text-xs mt-1">{formErrors.variants}</p>}
                {formErrors.trafficAllocation && <p className="text-red-400 text-xs mt-1">{formErrors.trafficAllocation}</p>}
            </Card>

            <Card title="Audience & Deployment">
                <div>
                    <label className="text-gray-300 text-sm block mb-2">Target Segments</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {segmentOptions.map(option => (
                            <CheckboxInput
                                key={option.value}
                                label={option.label}
                                checked={formData.segments.includes(option.value)}
                                onChange={(e) => handleSegmentChange(option.value, e.target.checked)}
                            />
                        ))}
                    </div>
                </div>
                <TextareaInput label="Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-4" />
            </Card>

            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
                    Cancel
                </button>
                <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white transition-colors">
                    Save Experiment
                </button>
            </div>
        </div>
    );
};

/**
 * Displays the detailed information and results for a single experiment.
 * Business Impact: Provides deep operational and analytical insights into a specific experiment,
 * crucial for post-experiment decision-making, auditing, and validating value creation.
 * Integrates AI analysis for automated insights and recommendations, driving intelligent automation.
 * @param experiment The Experiment object to display.
 * @param metrics All available metrics for lookup.
 * @param segments All available segments for lookup.
 * @param users All available users for lookup.
 * @param onEdit Callback to initiate editing of the experiment.
 * @param onBack Callback to return to the experiment list.
 * @param onUpdate Callback to update the experiment data after changes (e.g., AI analysis).
 */
export const ExperimentDetailsView: React.FC<{
    experiment: Experiment;
    metrics: Metric[];
    segments: Segment[];
    users: User[];
    onEdit: (id: string) => void;
    onBack: () => void;
    onUpdate: (updatedExperiment: Experiment) => void;
}> = ({ experiment, metrics, segments, users, onEdit, onBack, onUpdate }) => {
    const { addNotification } = useAppContext();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggestingRemediation, setIsSuggestingRemediation] = useState(false);
    const [remediationSuggestion, setRemediationSuggestion] = useState('');

    const primaryMetric = useMemo(() => metrics.find(m => m.id === experiment.primaryMetricId), [metrics, experiment.primaryMetricId]);
    const secondaryMetrics = useMemo(() => experiment.secondaryMetricIds.map(id => metrics.find(m => m.id === id)).filter(Boolean) as Metric[], [metrics, experiment.secondaryMetricIds]);
    const targetSegments = useMemo(() => experiment.segments.map(id => segments.find(s => s.id === id)).filter(Boolean) as Segment[], [segments, experiment.segments]);
    const ownerUser = useMemo(() => users.find(u => u.id === experiment.owner), [users, experiment.owner]);
    const reviewerUser = useMemo(() => users.find(u => u.id === experiment.reviewerId), [users, experiment.reviewerId]);

    const handleAnalyzeWithAI = async () => {
        if (!experiment.results) {
            addNotification({ type: 'warning', message: 'No results available to analyze yet for this experiment.' });
            return;
        }
        setIsAnalyzing(true);
        try {
            const aiAnalysis = await HypothesisAgentSimulator.analyzeExperimentResults(experiment, experiment.results);
            onUpdate({
                ...experiment,
                aiSuggestions: aiAnalysis,
                lastAIAudit: new Date().toISOString(),
            });
            addNotification({ type: 'success', message: 'AI analysis completed and updated for experiment.' });
        } catch (error) {
            console.error('AI analysis failed:', error);
            addNotification({ type: 'error', message: 'Failed to perform AI analysis. Please try again.' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSuggestRemediation = async (anomalyDescription: string) => {
        setIsSuggestingRemediation(true);
        setRemediationSuggestion('');
        try {
            const suggestion = await HypothesisAgentSimulator.suggestRemediation(anomalyDescription);
            setRemediationSuggestion(suggestion);
            addNotification({ type: 'info', message: 'AI provided a remediation suggestion.' });
        } catch (error) {
            console.error('AI remediation suggestion failed:', error);
            addNotification({ type: 'error', message: 'Failed to get AI remediation suggestion.' });
        } finally {
            setIsSuggestingRemediation(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center text-cyan-400 hover:text-cyan-300">
                    <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Experiments
                </button>
                <div className="flex space-x-2">
                    <button onClick={() => onEdit(experiment.id)} className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
                        <EditIcon /><span className="ml-2">Edit Experiment</span>
                    </button>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">{experiment.name}</h2>
            <p className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                ${experiment.status === 'Running' ? 'bg-green-100 text-green-800' : ''}
                ${experiment.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                ${experiment.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${experiment.status === 'Draft' ? 'bg-gray-100 text-gray-800' : ''}
                ${experiment.status === 'Archived' ? 'bg-red-100 text-red-800' : ''}
                ${experiment.status === 'Scheduled' ? 'bg-purple-100 text-purple-800' : ''}
            `}>Status: {experiment.status}</p>

            <Card title="Core Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div><strong>Hypothesis:</strong> {experiment.hypothesis}</div>
                    <div><strong>Problem:</strong> {experiment.problemStatement}</div>
                    <div><strong>Goal:</strong> {experiment.goal}</div>
                    <div><strong>Owner:</strong> {ownerUser?.name || 'N/A'}</div>
                    <div><strong>Reviewer:</strong> {reviewerUser?.name || 'N/A'}</div>
                    <div><strong>Start Date:</strong> {formatDate(experiment.startDate)}</div>
                    <div><strong>End Date:</strong> {experiment.endDate ? formatDate(experiment.endDate) : 'N/A'}</div>
                    <div><strong>Created At:</strong> {formatDate(experiment.createdAt)}</div>
                    <div><strong>Last Updated:</strong> {formatDate(experiment.lastUpdated)}</div>
                    <div><strong>Tags:</strong> {experiment.tags.join(', ') || 'None'}</div>
                    <div><strong>Deployment Status:</strong> {experiment.deploymentStatus}</div>
                    <div><strong>Governance Policy:</strong> {experiment.governancePolicyId || 'N/A'}</div>
                </div>
                <div className="mt-4 text-gray-300"><strong>Notes:</strong> {experiment.notes || 'No notes.'}</div>
            </Card>

            <Card title="Metrics & Configuration">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div><strong>Primary Metric:</strong> {primaryMetric?.name || 'N/A'} ({primaryMetric?.unit})</div>
                    <div><strong>Confidence Level:</strong> {(experiment.confidenceLevel * 100).toFixed(0)}%</div>
                    <div><strong>MDE:</strong> {(experiment.minimumDetectableEffect * 100).toFixed(2)}%</div>
                    <div><strong>Planned Duration:</strong> {experiment.durationDays} days</div>
                    <div><strong>Estimated Sample Size:</strong> {experiment.sampleSize?.toLocaleString() || 'N/A'}</div>
                    <div><strong>Traffic Allocation:</strong> {experiment.trafficAllocationOverall}%</div>
                    <div><strong>Budget:</strong> {experiment.budget?.currency} {experiment.budget?.amount?.toLocaleString()} (Spent: {experiment.budget?.spent?.toLocaleString()})</div>
                </div>
                <div className="mt-4 text-gray-300">
                    <strong>Secondary/Guardrail Metrics:</strong>
                    <ul className="list-disc list-inside ml-4">
                        {secondaryMetrics.length > 0 ? secondaryMetrics.map(m => (
                            <li key={m.id}>{m.name} ({m.type}, Unit: {m.unit}, Threshold: {m.guardrailThreshold ? `Min ${m.guardrailThreshold.min || 'N/A'}, Max ${m.guardrailThreshold.max || 'N/A'}` : 'N/A'})</li>
                        )) : 'None'}
                    </ul>
                </div>
            </Card>

            <Card title="Variants & Audience">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experiment.variants.map(variant => (
                        <div key={variant.id} className="border border-gray-700 p-3 rounded-md text-gray-300">
                            <h4 className="font-semibold text-white">{variant.name} ({variant.type})</h4>
                            <p className="text-sm">{variant.description}</p>
                            <p className="text-sm mt-1">Traffic: {variant.trafficAllocation}%</p>
                            {variant.mockupUrl && <p className="text-sm">Mockup: <a href={variant.mockupUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View</a></p>}
                            {variant.implementationDetails && <p className="text-sm text-gray-400 mt-1">{variant.implementationDetails}</p>}
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-gray-300">
                    <strong>Target Segments:</strong>
                    <ul className="list-disc list-inside ml-4">
                        {targetSegments.length > 0 ? targetSegments.map(s => (
                            <li key={s.id}>{s.name}: {s.description} ({s.rules.join('; ')})</li>
                        )) : 'All Users'}
                    </ul>
                </div>
            </Card>

            {experiment.results && (
                <Card title="Experiment Results Summary">
                    <div className="text-gray-300 space-y-2">
                        <p><strong>Overall Status:</strong> {experiment.results.overallStatus}</p>
                        {experiment.results.winningVariantId && (
                            <p><strong>Winning Variant:</strong> {experiment.results.variantResults.find(v => v.variantId === experiment.results?.winningVariantId)?.variantName}</p>
                        )}
                        <p><strong>Analysis Date:</strong> {formatDate(experiment.results.analysisDate)}</p>
                        <p><strong>Results Confidence:</strong> {(experiment.results.confidenceLevelAchieved! * 100).toFixed(0)}%</p>
                        <h4 className="font-semibold text-white mt-4">Variant-level Performance:</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700 mt-2">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Variant</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Impressions</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Conversions</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Conversion Rate</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Lift</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Significance (p-value)</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Winner</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {experiment.results.variantResults.map(vr => (
                                        <tr key={vr.variantId}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-white">{vr.variantName}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{vr.impressions.toLocaleString()}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{vr.conversions.toLocaleString()}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{(vr.conversionRate * 100).toFixed(2)}%</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{vr.lift ? `${vr.lift.toFixed(2)}%` : 'N/A'}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{vr.statisticalSignificance?.toFixed(4) || 'N/A'}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">{vr.isWinner ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            )}

            <Card title="AI Insights & Governance">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleAnalyzeWithAI}
                        disabled={isAnalyzing || !experiment.results}
                        className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors disabled:opacity-50"
                    >
                        {isAnalyzing ? <Loader /> : <SparklesIcon />}
                        <span className="ml-2">{isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}</span>
                    </button>
                </div>
                {experiment.aiSuggestions && (
                    <div className="text-gray-300 space-y-3">
                        <h4 className="font-semibold text-white">Latest AI Analysis (as of {formatDate(experiment.lastAIAudit || new Date().toISOString())}):</h4>
                        <p><strong>Summary:</strong> {(experiment.aiSuggestions as AIAnalysisOutput).summary || (experiment.aiSuggestions as AIDesignOutput).problemStatement}</p>
                        {experiment.aiSuggestions && (experiment.aiSuggestions as AIAnalysisOutput).keyFindings && (
                            <>
                                <p><strong>Key Findings:</strong></p>
                                <ul className="list-disc list-inside ml-4">
                                    {(experiment.aiSuggestions as AIAnalysisOutput).keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                                </ul>
                                <p><strong>Recommendations:</strong></p>
                                <ul className="list-disc list-inside ml-4">
                                    {(experiment.aiSuggestions as AIAnalysisOutput).recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                                <p><strong>Risk Assessment:</strong> {(experiment.aiSuggestions as AIAnalysisOutput).riskAssessment?.map(r => `${r.type}: ${r.description}`).join('; ') || 'N/A'}</p>
                                {experiment.aiSuggestions.governanceComplianceReport && (
                                    <>
                                        <p><strong>Governance Compliance Report:</strong></p>
                                        <ul className="list-disc list-inside ml-4">
                                            {experiment.aiSuggestions.governanceComplianceReport.map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </>
                                )}
                                {experiment.aiSuggestions.futureExperimentSuggestions && (
                                    <>
                                        <p><strong>Future Experiment Suggestions:</strong></p>
                                        <ul className="list-disc list-inside ml-4">
                                            {experiment.aiSuggestions.futureExperimentSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </>
                                )}
                            </>
                        )}
                        {experiment.aiSuggestions && (experiment.aiSuggestions as AIDesignOutput).securityConsiderations && (
                            <>
                                <p><strong>AI-Suggested Security Considerations:</strong></p>
                                <ul className="list-disc list-inside ml-4">
                                    {(experiment.aiSuggestions as AIDesignOutput).securityConsiderations?.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </>
                        )}
                    </div>
                )}
                {experiment.results?.overallStatus === 'GuardrailBreached' && (
                    <div className="mt-6 p-4 bg-red-800/30 border border-red-600 rounded text-red-100">
                        <p className="font-semibold flex items-center mb-2"><ExclamationTriangleIcon className="h-5 w-5 mr-2"/>Guardrail Breach Detected!</p>
                        <p>The experiment detected a breach in critical guardrail metrics. Immediate action may be required.</p>
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={() => handleSuggestRemediation(`Guardrail breach detected for experiment ${experiment.name} (ID: ${experiment.id}). Status: ${experiment.results?.overallStatus}.`)}
                                disabled={isSuggestingRemediation}
                                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors disabled:opacity-50"
                            >
                                {isSuggestingRemediation ? <Loader /> : <SparklesIcon />}
                                <span className="ml-2">{isSuggestingRemediation ? 'Generating...' : 'AI Suggest Remediation'}</span>
                            </button>
                        </div>
                        {remediationSuggestion && (
                            <div className="mt-4 p-3 bg-gray-700 rounded text-gray-100 whitespace-pre-wrap text-sm">
                                <h5 className="font-bold text-lg mb-2">AI Remediation Plan:</h5>
                                {remediationSuggestion}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <Card title="Audit Trail & Version History">
                <div className="space-y-3 text-gray-300">
                    {experiment.versionHistory && experiment.versionHistory.length > 0 ? (
                        <ul className="list-disc list-inside ml-4">
                            {experiment.versionHistory.map((entry, i) => (
                                <li key={i}>
                                    <span className="font-semibold">{formatDate(entry.timestamp)}:</span> {entry.changes}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No version history available.</p>
                    )}
                    {experiment.reviewComments && experiment.reviewComments.length > 0 && (
                        <>
                            <h4 className="font-semibold text-white mt-4">Review Comments:</h4>
                            <ul className="list-disc list-inside ml-4">
                                {experiment.reviewComments.map((comment, i) => (
                                    <li key={i}>
                                        <span className="font-semibold">{comment.userId} ({formatDate(comment.timestamp)}):</span> {comment.comment}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

/**
 * Provides a dedicated interface for advanced AI-driven experiment orchestration and design.
 * Business Impact: Empowers users with a sophisticated tool to leverage agentic intelligence
 * for complex experiment setup, predictive analysis, and strategic recommendations, accelerating
 * the adoption of new financial features and optimizing platform performance through AI-guided insights.
 * @param metrics All available metrics.
 * @param segments All available segments.
 * @param users All available users.
 */
export const AIDesignerView: React.FC<{
    metrics: Metric[];
    segments: Segment[];
    users: User[];
}> = ({ metrics, segments, users }) => {
    const { addNotification } = useAppContext();
    const [hypothesisInput, setHypothesisInput] = useState('');
    const [aiDesignResult, setAiDesignResult] = useState<AIDesignOutput | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [anomalyInput, setAnomalyInput] = useState('');
    const [aiRemediationResult, setAiRemediationResult] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleGenerateDesign = async () => {
        if (!hypothesisInput.trim()) {
            addNotification({ type: 'warning', message: 'Please enter a hypothesis for AI design.' });
            return;
        }
        setIsGenerating(true);
        setAiDesignResult(null);
        try {
            const result = await HypothesisAgentSimulator.generateExperimentDesign(hypothesisInput);
            setAiDesignResult(result);
            addNotification({ type: 'success', message: 'AI experiment design generated successfully!' });
        } catch (error) {
            console.error('AI design generation failed:', error);
            addNotification({ type: 'error', message: 'Failed to generate AI design.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateRemediation = async () => {
        if (!anomalyInput.trim()) {
            addNotification({ type: 'warning', message: 'Please describe the anomaly for AI remediation.' });
            return;
        }
        setIsSuggesting(true);
        setAiRemediationResult('');
        try {
            const result = await HypothesisAgentSimulator.suggestRemediation(anomalyInput);
            setAiRemediationResult(result);
            addNotification({ type: 'success', message: 'AI remediation suggestion generated!' });
        } catch (error) {
            console.error('AI remediation suggestion failed:', error);
            addNotification({ type: 'error', message: 'Failed to get AI remediation suggestion.' });
        } finally {
            setIsSuggesting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">AI Experimentation & Operational Intelligence</h2>

            <Card title="AI-Powered Experiment Design">
                <TextareaInput
                    label="Enter your Hypothesis"
                    value={hypothesisInput}
                    onChange={(e) => setHypothesisInput(e.target.value)}
                    placeholder="e.g., Implementing a new real-time fraud detection algorithm will reduce fraudulent transaction rates by 10%."
                    rows={4}
                    className="mb-4"
                />
                <button
                    onClick={handleGenerateDesign}
                    disabled={isGenerating || !hypothesisInput.trim()}
                    className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white transition-colors disabled:opacity-50"
                >
                    {isGenerating ? <Loader /> : <SparklesIcon />}
                    <span className="ml-2">{isGenerating ? 'Generating Design...' : 'Generate Experiment Design'}</span>
                </button>

                {aiDesignResult && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-md border border-gray-700 text-gray-200">
                        <h3 className="text-lg font-bold text-white mb-3">AI-Generated Experiment Plan:</h3>
                        <p className="mb-2"><strong>Problem Statement:</strong> {aiDesignResult.problemStatement}</p>
                        <p className="mb-2"><strong>Goal:</strong> {aiDesignResult.goal}</p>
                        <p className="mb-2"><strong>Primary Metric:</strong> {aiDesignResult.primaryMetricName}</p>
                        <p className="mb-2"><strong>Secondary Metrics:</strong> {aiDesignResult.secondaryMetricNames.join(', ')}</p>
                        <p className="mb-2"><strong>Tags:</strong> {aiDesignResult.tags.join(', ')}</p>
                        <p className="mb-2"><strong>Estimated Duration:</strong> {aiDesignResult.estimatedDurationDays} days</p>
                        <p className="mb-2"><strong>Security Considerations:</strong> {aiDesignResult.securityConsiderations?.join('; ') || 'None'}</p>
                        <p className="mb-2"><strong>Governance Context:</strong> {aiDesignResult.governanceContext?.join('; ') || 'None'}</p>
                        <h4 className="font-semibold text-white mt-3 mb-1">Variants:</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                            {aiDesignResult.variants.map((v, i) => (
                                <li key={i}>
                                    <strong>{v.name}:</strong> {v.description} (Alloc: {aiDesignResult.recommendedTrafficAllocation?.find(alloc => alloc.name === v.name)?.allocation || 'N/A'}%)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </Card>

            <Card title="AI-Powered Remediation Suggestions">
                <TextareaInput
                    label="Describe the Anomaly or Incident"
                    value={anomalyInput}
                    onChange={(e) => setAnomalyInput(e.target.value)}
                    placeholder="e.g., Real-time settlement latency increased by 300% for international transfers in the last hour, impacting 5% of transactions."
                    rows={4}
                    className="mb-4"
                />
                <button
                    onClick={handleGenerateRemediation}
                    disabled={isSuggesting || !anomalyInput.trim()}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors disabled:opacity-50"
                >
                    {isSuggesting ? <Loader /> : <SparklesIcon />}
                    <span className="ml-2">{isSuggesting ? 'Suggesting...' : 'Generate Remediation Plan'}</span>
                </button>

                {aiRemediationResult && (
                    <div className="mt-6 p-4 bg-gray-800 rounded-md border border-gray-700 text-gray-200 whitespace-pre-wrap">
                        <h3 className="text-lg font-bold text-white mb-3">AI-Generated Remediation Suggestion:</h3>
                        {aiRemediationResult}
                    </div>
                )}
            </Card>
        </div>
    );
};


/**
 * The root component for the Hypothesis Engine View, orchestrating different sub-views.
 * Business Impact: This top-level view provides a unified interface for managing the entire
 * experimentation and intelligent automation lifecycle. It's the central hub for driving
 * product innovation, optimizing financial operations, and leveraging AI for strategic insights,
 * thereby delivering continuous business value and competitive advantage.
 */
export const HypothesisEngineView: React.FC = () => {
    const [currentView, setCurrentView] = useState('experiments'); // 'experiments', 'create', 'details', 'ai-designer'
    const [experiments, setExperiments] = useState<Experiment[]>(mockExperiments);
    const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

    const metrics = useMemo(() => mockMetrics, []);
    const segments = useMemo(() => mockSegments, []);
    const users = useMemo(() => mockUsers, []);

    const handleCreateExperiment = () => {
        setSelectedExperimentId(null);
        setCurrentView('create');
    };

    const handleSelectExperiment = (id: string) => {
        setSelectedExperimentId(id);
        setCurrentView('details');
    };

    const handleSaveExperiment = (experiment: Experiment) => {
        setExperiments(prev => {
            const existingIndex = prev.findIndex(exp => exp.id === experiment.id);
            if (existingIndex > -1) {
                // Update existing experiment
                const updatedExperiments = [...prev];
                updatedExperiments[existingIndex] = experiment;
                return updatedExperiments;
            } else {
                // Add new experiment
                return [...prev, experiment];
            }
        });
        setCurrentView('experiments');
    };

    const handleUpdateExperiment = (updatedExperiment: Experiment) => {
        setExperiments(prev =>
            prev.map(exp => (exp.id === updatedExperiment.id ? updatedExperiment : exp))
        );
    };

    const handleDeleteExperiment = (id: string) => {
        if (window.confirm('Are you sure you want to delete this experiment? This action cannot be undone and will affect audit trails.')) {
            setExperiments(prev => prev.filter(exp => exp.id !== id));
            // Also notify backend/agent to clean up if needed
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'experiments':
                return (
                    <ExperimentList
                        experiments={experiments}
                        onSelectExperiment={handleSelectExperiment}
                        onCreateExperiment={handleCreateExperiment}
                        onDeleteExperiment={handleDeleteExperiment}
                    />
                );
            case 'create':
                return (
                    <ExperimentCreationForm
                        onSave={handleSaveExperiment}
                        onCancel={() => setCurrentView('experiments')}
                        metrics={metrics}
                        segments={segments}
                        users={users}
                    />
                );
            case 'details':
                const selectedExperiment = experiments.find(exp => exp.id === selectedExperimentId);
                if (!selectedExperiment) return <p className="text-red-400">Experiment not found.</p>;
                return (
                    <ExperimentDetailsView
                        experiment={selectedExperiment}
                        metrics={metrics}
                        segments={segments}
                        users={users}
                        onEdit={() => setCurrentView('edit')} // Change to 'edit' view
                        onBack={() => setCurrentView('experiments')}
                        onUpdate={handleUpdateExperiment}
                    />
                );
            case 'edit':
                const experimentToEdit = experiments.find(exp => exp.id === selectedExperimentId);
                if (!experimentToEdit) return <p className="text-red-400">Experiment not found for editing.</p>;
                return (
                    <ExperimentCreationForm
                        initialData={experimentToEdit}
                        onSave={handleSaveExperiment}
                        onCancel={() => setCurrentView('details')} // Back to details after cancel
                        metrics={metrics}
                        segments={segments}
                        users={users}
                    />
                );
            case 'ai-designer':
                return (
                    <AIDesignerView
                        metrics={metrics}
                        segments={segments}
                        users={users}
                    />
                );
            default:
                return <h2 className="text-xl text-white">Select a view from the navigation.</h2>;
        }
    };

    return (
        <AppProvider>
            <div className="flex bg-gray-800 min-h-screen text-gray-100">
                <NavBar onViewChange={setCurrentView} currentView={currentView} />
                <main className="flex-grow p-8 ml-64">
                    {renderContent()}
                </main>
                <NotificationToast />
            </div>
        </AppProvider>
    );
};