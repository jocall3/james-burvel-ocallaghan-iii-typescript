import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// --- Utility Functions and Helper Types (approx 500 lines) ---

/**
 * Generates a unique ID for entities.
 * @param prefix Optional prefix for the ID.
 * @returns A unique string ID.
 */
export const generateUniqueId = (prefix: string = 'id'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
};

/**
 * Formats a date string into a readable format.
 * @param dateInput The date string or Date object.
 * @returns Formatted date string.
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
        second: '2-digit'
    });
};

/**
 * Capitalizes the first letter of a string.
 * @param str The input string.
 * @returns Capitalized string.
 */
export const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Deep clones an object to prevent direct state mutation.
 * @param obj The object to clone.
 * @returns A deep clone of the object.
 */
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Represents different types of metrics.
 */
export type MetricType = 'primary' | 'secondary' | 'guardrail' | 'custom';

/**
 * Represents the status of an experiment.
 */
export type ExperimentStatus = 'Draft' | 'Running' | 'Paused' | 'Completed' | 'Archived' | 'Scheduled';

/**
 * Represents the type of a variant.
 */
export type VariantType = 'Control' | 'Treatment' | 'Personalized';

/**
 * Basic interface for an entity that has an ID and name.
 */
export interface BaseEntity {
    id: string;
    name: string;
}

/**
 * Interface for a metric used in an experiment.
 */
export interface Metric extends BaseEntity {
    description: string;
    type: MetricType;
    unit: string; // e.g., 'percentage', 'count', 'USD'
    aggregationMethod: 'sum' | 'average' | 'median' | 'count';
    targetValue?: number; // Optional target for goal metrics
    guardrailThreshold?: { min?: number; max?: number }; // For guardrail metrics
    lastUpdated: string;
}

/**
 * Interface for a variant in an A/B test.
 */
export interface Variant extends BaseEntity {
    description: string;
    type: VariantType;
    trafficAllocation: number; // Percentage of traffic (0-100)
    mockupUrl?: string; // URL to design mockup
    implementationDetails?: string; // Technical details for developers
    screenshotUrl?: string; // URL to a screenshot of the variant
}

/**
 * Interface for a user segment/audience.
 */
export interface Segment extends BaseEntity {
    description: string;
    rules: string[]; // e.g., ['country = "US"', 'device = "mobile"', 'user_age > 18']
    lastUpdated: string;
}

/**
 * Interface for the results of a single variant.
 */
export interface VariantResult {
    variantId: string;
    variantName: string;
    impressions: number;
    conversions: number;
    conversionRate: number; // Calculated: conversions / impressions
    revenue?: number; // For revenue-based metrics
    averageValue?: number; // For average-value metrics
    participants: number; // Unique users in this variant
    statisticalSignificance?: number; // p-value
    confidenceInterval?: [number, number]; // e.g., [0.02, 0.05] for lift
    lift?: number; // Percentage lift compared to control
    isWinner?: boolean;
    rawMetricData?: { [metricId: string]: { value: number; count: number; } }; // Detailed metric data
}

/**
 * Interface for the overall experiment results.
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
 * Interface for an experiment.
 */
export interface Experiment extends BaseEntity {
    hypothesis: string;
    problemStatement: string;
    goal: string;
    status: ExperimentStatus;
    startDate: string;
    endDate?: string;
    owner: string;
    reviewerId?: string;
    tags: string[];
    primaryMetricId: string;
    secondaryMetricIds: string[];
    variants: Variant[];
    segments: string[]; // IDs of segments
    trafficAllocationOverall: number; // Total traffic for the experiment (0-100)
    durationDays?: number; // Planned duration in days
    confidenceLevel: number; // e.g., 0.95 for 95%
    sampleSize?: number; // Calculated or estimated sample size
    notes: string;
    createdAt: string;
    lastUpdated: string;
    results?: ExperimentResultSummary;
    reviewComments?: { userId: string; comment: string; timestamp: string }[];
    versionHistory?: { timestamp: string; changes: string }[]; // Audit trail
    deploymentStatus?: 'Pending' | 'Deployed' | 'Failed' | 'RolledBack';
    deploymentDetails?: { tool: string; id: string; url: string }[];
    budget?: { currency: string; amount: number; spent: number };
    stakeholders?: string[]; // User IDs or emails
    jiraTicketId?: string;
    confluencePageUrl?: string;
}

/**
 * User interface for permissions.
 */
export type UserRole = 'Viewer' | 'Editor' | 'Admin' | 'Analyst' | 'Deployer';
export interface User extends BaseEntity {
    email: string;
    role: UserRole;
    lastLogin: string;
    isActive: boolean;
}

/**
 * Global application settings.
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
}

/**
 * Represents a system notification.
 */
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
    isRead: boolean;
    actionLink?: string;
}

// --- Mock Data Generation Functions (approx 500 lines) ---

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
];

export const mockSegments: Segment[] = [
    { id: 's1', name: 'All Users', description: 'All visitors to the site', rules: [], lastUpdated: new Date().toISOString() },
    { id: 's2', name: 'Mobile Users - US', description: 'Users accessing from a mobile device in the US', rules: ['device = "mobile"', 'country = "US"'], lastUpdated: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 's3', name: 'Returning Customers', description: 'Users who have made at least one purchase before', rules: ['has_purchased = true'], lastUpdated: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: 's4', name: 'New Signups (Last 30 Days)', description: 'Users who signed up in the last 30 days', rules: ['signup_date > (NOW() - 30 days)'], lastUpdated: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 's5', name: 'High-Value Shoppers', description: 'Users with average order value > $100', rules: ['average_order_value > 100'], lastUpdated: new Date(Date.now() - 86400000 * 5).toISOString() },
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
        { id: generateUniqueId('var'), name: 'Variant A', description: 'Modified experience for testing', type: 'Treatment', trafficAllocation: 50, mockupUrl: 'https://example.com/mockups/variantA.png' }
    ];
    if (Math.random() > 0.7) { // Sometimes add a third variant
        variants.push({ id: generateUniqueId('var'), name: 'Variant B', description: 'Another modified experience', type: 'Treatment', trafficAllocation: 0 });
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
};

// --- Contexts for global state (approx 100 lines) ---
interface AppContextType {
    currentUser: User | null;
    settings: AppSettings;
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
    markNotificationAsRead: (id: string) => void;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    setCurrentUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

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


// --- Reusable UI Components (approx 2000 lines) ---

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    className?: string;
    error?: string; // Add error prop
}
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
    error?: string; // Add error prop
}
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
    error?: string; // Add error prop
}
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
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-3.646 3.646l-2.828 2.828-6.364 6.364a1 1 0 000 1.414V17h1.414l6.364-6.364 2.828-2.828L13.586 7.172z" />
    </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
);
const ChartBarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.5 1.5 0 01-1.48 1.25H5a1.5 1.5 0 00-1.5 1.5v1.5c0 .76.5 1.44 1.24 1.63.15.04.3.07.45.09A1.5 1.5 0 018 10a1.5 1.5 0 01-2.28 1.45c-.15.02-.3.05-.45.09A1.5 1.5 0 003.5 13v1.5c0 .83.67 1.5 1.5 1.5h2.03c.38 1.56 2.6 1.56 2.98 0a1.5 1.5 0 011.48-1.25H15a1.5 1.5 0 001.5-1.5V13c0-.76-.5-1.44-1.24-1.63a1.5 1.5 0 01-2.28-1.45c.15-.02.3-.05.45-.09A1.5 1.5 0 0016.5 7V5.5c0-.83-.67-1.5-1.5-1.5h-2.03a1.5 1.5 0 01-1.48-1.25zM10 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);
const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);
const UserGroupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
);
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
);
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);
const ExclamationTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.3 2.607-1.3 3.372 0l1.175 2.036a4.5 4.5 0 011.192 1.942l.24 1.096a4.5 4.5 0 01-.563 2.977l-.663 1.147a4.5 4.5 0 01-1.192 1.942l-1.175 2.036c-.765 1.3-2.607 1.3-3.372 0l-1.175-2.036a4.5 4.5 0 01-1.192-1.942l-.24-1.096a4.5 4.5 0 01.563-2.977l.663-1.147a4.5 4.5 0 011.192-1.942l1.175-2.036zM10 8a1 1 0 011 1v4a1 1 0 11-2 0V9a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
);


// Global Notification Toast component
export const NotificationToast: React.FC = () => {
    const { notifications, markNotificationAsRead } = useAppContext();
    const visibleNotifications = notifications.filter(n => !n.isRead).slice(0, 3); // Show max 3 unread

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

// Loader component
export const Loader: React.FC = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-400">Loading...</span>
    </div>
);

// Paginator component
interface PaginatorProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
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

// Modal Component
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}
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


// --- Main Application Views (approx 7000 lines, broken down) ---

// 1. Navbar/Sidebar (Navigation)
export const NavBar: React.FC<{ onViewChange: (view: string) => void; currentView: string }> = ({ onViewChange, currentView }) => {
    const { currentUser, notifications } = useAppContext();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
        { id: 'experiments', label: 'Experiments', icon: <ListIcon /> },
        { id: 'metrics', label: 'Metrics', icon: <ChartBarIcon /> },
        { id: 'segments', label: 'Segments', icon: <UserGroupIcon /> },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
        { id: 'ai-designer', label: 'AI Test Designer', icon: <InfoIcon /> }, // Original component
    ];

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
                    onClick={() => console.log('Logout')} // Placeholder for logout
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

// 2. Experiment List (Dashboard) (approx 1000 lines)
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

// 3. Experiment Creation Form (approx 1000 lines)
export const ExperimentCreationForm: React.FC<{
    onSave: (experiment: Experiment) => void;
    onCancel: () => void;
    initialData?: Experiment;
    metrics: Metric[];
    segments: Segment[];
    users: User[];
}> = ({ onSave, onCancel, initialData, metrics, segments, users }) => {
    const { addNotification, settings } = useAppContext();
    const [formData, setFormData] = useState<Experiment>(
        initialData || {
            id: generateUniqueId('exp'),
            name: '',
            hypothesis: '',
            problemStatement: '',
            goal: '',
            status: 'Draft',
            startDate: new Date().toISOString(),
            owner: users[0]?.id || '',
            tags: [],
            primaryMetricId: metrics[0]?.id || '',
            secondaryMetricIds: [],
            variants: [{ id: generateUniqueId('var'), name: 'Control', description: 'Original experience', type: 'Control', trafficAllocation: 50 },
                       { id: generateUniqueId('var'), name: 'Variant A', description: '', type: 'Treatment', trafficAllocation: 50 }],
            segments: [segments[0]?.id || ''],
            trafficAllocationOverall: 100,
            confidenceLevel: settings.defaultConfidenceLevel,
            notes: '',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            deploymentStatus: 'Pending',
            stakeholders: [],
        }
    );
    const [newTag, setNewTag] = useState('');
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
    const [aiDesignResponse, setAiDesignResponse] = useState<any>(null);

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
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleTagAdd = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
            setNewTag('');
        }
    };

    const handleTagRemove = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
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
            if (field === 'trafficAllocation') {
                const totalAlloc = newVariants.reduce((sum, v) => sum + (v.trafficAllocation || 0), 0);
                if (totalAlloc !== 100 && newVariants.length === 2) { // Auto-adjust for two variants
                    const otherIndex = index === 0 ? 1 : 0;
                    newVariants[otherIndex].trafficAllocation = 100 - (value || 0);
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
                name: `Variant ${String.fromCharCode(65 + prev.variants.length - 1)}`, // B, C, D...
                description: '',
                type: 'Treatment',
                trafficAllocation: 0
            }]
        }));
    };

    const removeVariant = (index: number) => {
        if (formData.variants.length > 2) { // Always keep at least control and one treatment
            setFormData(prev => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index)
            }));
        } else {
            addNotification({ type: 'warning', message: 'An experiment must have at least two variants (Control and Treatment).' });
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
        if (totalTraffic !== 100) errors.trafficAllocation = 'Total variant traffic allocation must be 100%.';
        formData.variants.forEach((v, i) => {
            if (!v.name.trim()) errors[`variant${i}Name`] = `Variant ${i + 1} name is required.`;
            if (!v.description.trim()) errors[`variant${i}Description`] = `Variant ${i + 1} description is required.`;
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
        setAiDesignResponse(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY as string }); // Use NEXT_PUBLIC for client-side
            const prompt = `You are an expert product analyst. Design an A/B test for this hypothesis: "${formData.hypothesis}".
                            Define a clear primary metric, 1-2 secondary (guardrail) metrics, and describe at least a Control and 1-2 Variant treatments.
                            Provide problem statement, a clear goal, and suggested tags. Output in JSON using the following schema:
                            {
                                problemStatement: string,
                                goal: string,
                                primaryMetricName: string,
                                secondaryMetricNames: string[],
                                tags: string[],
                                variants: [{ name: string, description: string }]
                            }`;
            const schema = {
                type: Type.OBJECT, properties: {
                    problemStatement: { type: Type.STRING },
                    goal: { type: Type.STRING },
                    primaryMetricName: { type: Type.STRING },
                    secondaryMetricNames: { type: Type.ARRAY, items: { type: Type.STRING } },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    variants: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                name: { type: Type.STRING }, description: { type: Type.STRING }
                            }
                        }
                    }
                }
            };
            const response = await ai.models.generateContent({
                