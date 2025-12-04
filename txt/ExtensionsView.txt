// components/views/megadashboard/developer/ExtensionsView.tsx
import React, { useState, useEffect, useCallback, createContext, useContext, useReducer } from 'react';
import Card from '../../../Card';

// --- Existing Interfaces and Mocks ---
interface Extension {
    id: string;
    name: string;
    publisher: string;
    description: string;
    icon: React.ReactNode;
    recommended?: boolean;
    category: string; // New field
    tags: string[]; // New field
    rating: number; // New field (1-5)
    installCount: number; // New field
    price: number; // New field (0 for free)
    lastUpdated: string; // New field (ISO date string)
    version: string; // New field
    screenshots: string[]; // New field (URLs)
    documentationUrl: string; // New field
    privacyPolicyUrl: string; // New field
    developerInfo: {
        id: string;
        name: string;
        contactEmail: string;
        website?: string;
    }; // New field
    pricingPlans?: PricingPlan[]; // New field for paid extensions
    changelog?: ExtensionVersionLog[]; // New field for version history
}

interface PricingPlan {
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceAnnually: number;
    features: string[];
}

interface ExtensionVersionLog {
    version: string;
    releaseDate: string;
    changes: string[];
}

// --- New Interfaces ---
interface ExtensionCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
}

interface ExtensionReview {
    id: string;
    extensionId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    timestamp: string;
}

interface InstalledExtension {
    id: string;
    extensionId: string;
    userId: string;
    installationDate: string;
    enabled: boolean;
    configuration: Record<string, any>; // Dynamic configuration
    subscription?: SubscriptionDetails;
}

interface SubscriptionDetails {
    planId: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'cancelled' | 'trial';
    autoRenew: boolean;
}

interface DeveloperExtension {
    id: string;
    name: string;
    status: 'published' | 'draft' | 'pending_review' | 'rejected' | 'archived';
    version: string;
    lastPublished: string;
    totalInstalls: number;
    reviewsCount: number;
    averageRating: number;
    monetizationStatus: 'free' | 'paid' | 'subscription';
    pendingUpdates: boolean;
}

interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: string; // e.g., 'INSTALL_EXTENSION', 'UPDATE_CONFIG', 'PUBLISH_EXTENSION'
    userId: string;
    extensionId?: string;
    details: Record<string, any>;
}

interface ExtensionAnalytics {
    extensionId: string;
    period: 'daily' | 'weekly' | 'monthly';
    data: {
        date: string;
        installs: number;
        uninstalls: number;
        activeUsers: number;
        revenue?: number; // For paid extensions
        errors?: number; // e.g., API errors
    }[];
}

// --- Utility Functions ---
export const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

export const getStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
        <div className="flex text-yellow-400">
            {Array(fullStars).fill('★')}
            {hasHalfStar && '½'}
            {Array(emptyStars).fill('☆')}
        </div>
    );
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// --- Mock Data Expansion ---
const generateRandomId = () => Math.random().toString(36).substring(2, 15);

const MOCK_CATEGORIES: ExtensionCategory[] = [
    { id: 'cat-dev-tools', name: 'Developer Tools', icon: <p>🛠️</p>, description: 'Tools for coding, debugging, and deployment.' },
    { id: 'cat-fin-ops', name: 'Financial Operations', icon: <p>💰</p>, description: 'Automate financial workflows and reporting.' },
    { id: 'cat-collaboration', name: 'Collaboration', icon: <p>🤝</p>, description: 'Enhance team communication and project management.' },
    { id: 'cat-design', name: 'Design & UI', icon: <p>🎨</p>, description: 'Integrate design tools and assets.' },
    { id: 'cat-reporting', name: 'Reporting & Analytics', icon: <p>📊</p>, description: 'Visualize data and generate reports.' },
    { id: 'cat-security', name: 'Security & Compliance', icon: <p>🔒</p>, description: 'Ensure data security and regulatory compliance.' },
    { id: 'cat-crm', name: 'CRM & Sales', icon: <p>📈</p>, description: 'Manage customer relations and sales pipelines.' },
    { id: 'cat-marketing', name: 'Marketing', icon: <p>📣</p>, description: 'Automate marketing campaigns and customer engagement.' },
    { id: 'cat-ai-ml', name: 'AI & Machine Learning', icon: <p>🧠</p>, description: 'Integrate AI models and machine learning workflows.' },
    { id: 'cat-iot', name: 'IoT & Edge Computing', icon: <p>📡</p>, description: 'Connect and manage IoT devices and data streams.' },
    { id: 'cat-data-eng', name: 'Data Engineering', icon: <p>⚙️</p>, description: 'Tools for data pipeline, ETL, and warehousing.' },
    { id: 'cat-ecommerce', name: 'E-commerce', icon: <p>🛒</p>, description: 'Enhance online store functionalities and payment gateways.' },
    { id: 'cat-hr', name: 'Human Resources', icon: <p>👨‍👩‍👧‍👦</p>, description: 'Streamline HR processes and employee management.' },
    { id: 'cat-project-mgmt', name: 'Project Management', icon: <p>📝</p>, description: 'Tools for planning, tracking, and executing projects.' },
    { id: 'cat-legal', name: 'Legal & Compliance', icon: <p>⚖️</p>, description: 'Manage legal documents, contracts, and regulatory adherence.' },
    { id: 'cat-education', name: 'Education & Training', icon: <p>🎓</p>, description: 'Learning platforms and educational content delivery.' },
    { id: 'cat-healthcare', name: 'Healthcare', icon: <p>🏥</p>, description: 'Solutions for patient management, diagnostics, and medical records.' },
    { id: 'cat-manufacturing', name: 'Manufacturing', icon: <p>🏭</p>, description: 'Tools for production planning, inventory, and quality control.' },
    { id: 'cat-transport', name: 'Logistics & Transport', icon: <p>🚚</p>, description: 'Optimize supply chain, fleet management, and delivery.' },
    { id: 'cat-media', name: 'Media & Entertainment', icon: <p>🎬</p>, description: 'Content creation, streaming, and digital rights management.' },
];

const EXTENSION_DESCRIPTIONS = [
    'Seamlessly integrate your workflow with our advanced API services, ensuring data consistency and real-time updates across all platforms.',
    'Boost your productivity with automated tasks and smart notifications, keeping you ahead of your project deadlines.',
    'Gain deeper insights into your financial data with comprehensive reporting and analytics capabilities, tailored for modern businesses.',
    'Streamline your customer support operations by linking customer queries directly to relevant financial transactions, improving resolution times.',
    'Enhance your team’s collaboration with shared dashboards and instant messaging, making project management effortless and effective.',
    'Secure your transactions with enterprise-grade encryption and compliance tools, meeting the highest industry standards.',
    'Personalize your customer engagement strategies using powerful CRM integrations, driving sales and fostering loyalty.',
    'Automate your marketing campaigns with data-driven insights, reaching the right audience at the right time.',
    'Leverage AI and machine learning to predict market trends and optimize resource allocation, giving you a competitive edge.',
    'Connect your IoT devices to our platform for real-time data streaming and predictive maintenance, minimizing downtime.',
    'Simplify complex data pipelines with intuitive ETL tools, transforming raw data into actionable intelligence.',
    'Improve your e-commerce conversion rates with dynamic pricing and personalized product recommendations, boosting your bottom line.',
    'Manage your human resources effectively with integrated payroll, time tracking, and employee performance modules.',
    'Execute projects with precision using advanced scheduling, resource allocation, and progress tracking features.',
    'Ensure legal compliance and streamline contract management with automated document generation and version control.',
    'Deliver engaging educational content with interactive lessons and progress tracking, fostering continuous learning.',
    'Optimize healthcare operations with secure patient data management, appointment scheduling, and telemedicine capabilities.',
    'Revolutionize manufacturing processes with predictive analytics for equipment maintenance and quality control.',
    'Enhance logistics efficiency with real-time tracking, route optimization, and inventory management solutions.',
    'Create stunning media content and manage digital assets with integrated creative tools and rights management.',
    'Manage all aspects of your supply chain, from procurement to delivery, with a unified platform for unparalleled visibility.',
    'Deploy and manage your cloud infrastructure directly from your dashboard, ensuring scalability and reliability.',
    'Automate your accounting processes, reconcile transactions, and generate financial statements with ease.',
    'Protect your digital assets with advanced threat detection, vulnerability scanning, and incident response tools.',
    'Integrate with popular communication platforms to centralize alerts and team discussions.',
];

const publishers = ['Demo Bank', 'Atlassian', 'Slack', 'Figma', 'Google', 'Microsoft', 'AWS', 'Stripe', 'Twilio', 'Zapier', 'Salesforce', 'HubSpot', 'Shopify', 'Adobe', 'Zoom', 'GitHub', 'GitLab', 'Datadog', 'New Relic', 'IBM', 'Oracle', 'SAP', 'Cisco', 'Palo Alto Networks', 'Fortinet'];

const generatePricingPlans = (id: string): PricingPlan[] => {
    const plans = [];
    if (Math.random() > 0.4) { // 60% chance of being paid
        plans.push({
            id: `${id}-basic`,
            name: 'Basic',
            description: 'Essential features for small teams.',
            priceMonthly: 9.99,
            priceAnnually: 99.99,
            features: ['Core Integration', '500 API calls/month', 'Standard Support'],
        });
        plans.push({
            id: `${id}-pro`,
            name: 'Pro',
            description: 'Advanced features for growing businesses.',
            priceMonthly: 29.99,
            priceAnnually: 299.99,
            features: ['All Basic Features', 'Unlimited API calls', 'Premium Support', 'Custom Reports', 'Multi-user Access'],
        });
        if (Math.random() > 0.6) { // 40% chance of enterprise tier
            plans.push({
                id: `${id}-enterprise`,
                name: 'Enterprise',
                description: 'Customizable solutions for large organizations.',
                priceMonthly: 99.99,
                priceAnnually: 999.99,
                features: ['All Pro Features', 'Dedicated Account Manager', 'SLA', 'On-premise Deployment Options', 'Advanced Security Audit'],
            });
        }
    }
    return plans;
};

const generateChangelog = (version: string): ExtensionVersionLog[] => {
    const logs = [];
    let currentVersion = version.split('.').map(Number);
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const major = currentVersion[0];
        const minor = currentVersion[1];
        const patch = currentVersion[2];
        const newPatch = Math.max(0, patch - (i === 0 ? 0 : Math.floor(Math.random() * 5))); // Ensure patch doesn't go below 0 for older versions
        const newMinor = minor - (Math.random() > 0.8 && i !== 0 ? 1 : 0);
        const newMajor = major - (Math.random() > 0.95 && i !== 0 ? 1 : 0);

        currentVersion = [Math.max(0, newMajor), Math.max(0, newMinor), Math.max(0, newPatch)];

        logs.push({
            version: currentVersion.join('.'),
            releaseDate: new Date(Date.now() - (i * 30 + Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString(),
            changes: [
                `Improved performance for ${Math.random() > 0.5 ? 'large datasets' : 'real-time updates'}.`,
                `Fixed a bug where ${Math.random() > 0.5 ? 'notifications were not sent' : 'data sync failed intermittently'}.`,
                Math.random() > 0.3 ? `Added support for new ${Math.random() > 0.5 ? 'API endpoints' : 'integration partners'}.` : '',
            ].filter(Boolean),
        });
    }
    return logs.reverse(); // Newest version last
};

const generateMockExtensions = (count: number): Extension[] => {
    const extensions: Extension[] = [];
    for (let i = 0; i < count; i++) {
        const id = `ext-${generateRandomId()}`;
        const publisher = publishers[Math.floor(Math.random() * publishers.length)];
        const category = MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)];
        const tags = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => `tag-${generateRandomId().substring(0, 5)}`);
        const rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); // Between 3.0 and 5.0
        const installCount = Math.floor(Math.random() * 50000) + 100;
        const recommended = Math.random() > 0.7; // 30% chance
        const description = EXTENSION_DESCRIPTIONS[Math.floor(Math.random() * EXTENSION_DESCRIPTIONS.length)];
        const version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`;
        const lastUpdated = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString();
        const price = Math.random() > 0.6 ? parseFloat((Math.random() * 100).toFixed(2)) : 0;
        const pricingPlans = price > 0 ? generatePricingPlans(id) : undefined;
        const screenshots = Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, idx) => `https://via.placeholder.com/600x400?text=Screenshot+${idx + 1}`);
        const changelog = generateChangelog(version);

        extensions.push({
            id,
            name: `${publisher} ${category.name} ${i + 1}`,
            publisher,
            description,
            icon: category.icon, // Using category icon as extension icon
            recommended,
            category: category.name,
            tags,
            rating,
            installCount,
            price,
            lastUpdated,
            version,
            screenshots,
            documentationUrl: `https://docs.example.com/${id}`,
            privacyPolicyUrl: `https://privacy.example.com/${id}`,
            developerInfo: {
                id: `dev-${generateRandomId()}`,
                name: `${publisher} Team`,
                contactEmail: `contact@${publisher.toLowerCase().replace(/\s/g, '')}.com`,
                website: `https://${publisher.toLowerCase().replace(/\s/g, '')}.com`,
            },
            pricingPlans,
            changelog,
        });
    }
    return extensions;
};

// Start with existing mocks and add many more
const MOCK_EXTENSIONS: Extension[] = [
    { id: 'ext-vscode', name: 'Demo Bank for VS Code', publisher: 'Demo Bank', description: 'Manage your API resources and test webhooks directly from your editor.', icon: <p>VS</p>, recommended: true, category: 'Developer Tools', tags: ['IDE', 'APIs', 'Webhooks'], rating: 4.8, installCount: 120000, price: 0, lastUpdated: '2023-10-26T10:00:00Z', version: '1.5.2', screenshots: ['https://via.placeholder.com/600x400?text=VSCode+1', 'https://via.placeholder.com/600x400?text=VSCode+2'], documentationUrl: 'https://docs.demobank.com/vscode', privacyPolicyUrl: 'https://demobank.com/privacy', developerInfo: { id: 'dev-demobank', name: 'Demo Bank Team', contactEmail: 'dev@demobank.com', website: 'https://demobank.com' }, changelog: [{ version: '1.5.2', releaseDate: '2023-10-26', changes: ['Bug fixes', 'Performance improvements'] }] },
    { id: 'ext-jira', name: 'Jira Integration', publisher: 'Atlassian', description: 'Create and link Demo Bank transactions to Jira issues automatically.', icon: <p>JI</p>, recommended: false, category: 'Collaboration', tags: ['Project Management', 'Ticketing'], rating: 4.5, installCount: 85000, price: 0, lastUpdated: '2023-09-15T10:00:00Z', version: '2.1.0', screenshots: ['https://via.placeholder.com/600x400?text=Jira+1', 'https://via.placeholder.com/600x400?text=Jira+2'], documentationUrl: 'https://docs.atlassian.com/jira-demobank', privacyPolicyUrl: 'https://atlassian.com/privacy', developerInfo: { id: 'dev-atlassian', name: 'Atlassian', contactEmail: 'support@atlassian.com' }, pricingPlans: [{ id: 'jira-pro', name: 'Pro Plan', description: 'Advanced linking and automation', priceMonthly: 15.00, priceAnnually: 150.00, features: ['Unlimited automations', 'Custom fields mapping'] }] },
    { id: 'ext-slack', name: 'Slack Notifications', publisher: 'Slack', description: 'Get real-time alerts for payment approvals, compliance cases, and more.', icon: <p>SL</p>, recommended: true, category: 'Collaboration', tags: ['Communication', 'Alerts'], rating: 4.7, installCount: 200000, price: 0, lastUpdated: '2023-11-01T10:00:00Z', version: '3.0.1', screenshots: ['https://via.placeholder.com/600x400?text=Slack+1', 'https://via.placeholder.com/600x400?text=Slack+2'], documentationUrl: 'https://api.slack.com/demobank', privacyPolicyUrl: 'https://slack.com/privacy', developerInfo: { id: 'dev-slack', name: 'Slack Technologies', contactEmail: 'dev@slack.com' } },
    { id: 'ext-figma', name: 'Figma Card Designer', publisher: 'Figma', description: 'Sync your card designs from Figma directly to the Card Customization forge.', icon: <p>FI</p>, recommended: false, category: 'Design & UI', tags: ['Design', 'UX'], rating: 4.2, installCount: 30000, price: 2.99, lastUpdated: '2023-08-01T10:00:00Z', version: '1.1.0', screenshots: ['https://via.placeholder.com/600x400?text=Figma+1', 'https://via.placeholder.com/600x400?text=Figma+2'], documentationUrl: 'https://help.figma.com/demobank', privacyPolicyUrl: 'https://figma.com/privacy', developerInfo: { id: 'dev-figma', name: 'Figma Inc.', contactEmail: 'support@figma.com' } },
    { id: 'ext-sheets', name: 'Google Sheets Exporter', publisher: 'Google', description: 'Export transaction and report data to Google Sheets on a schedule.', icon: <p>GS</p>, recommended: false, category: 'Reporting & Analytics', tags: ['Data Export', 'Spreadsheets'], rating: 4.6, installCount: 95000, price: 0, lastUpdated: '2023-10-05T10:00:00Z', version: '1.8.3', screenshots: ['https://via.placeholder.com/600x400?text=Sheets+1', 'https://via.placeholder.com/600x400?text=Sheets+2'], documentationUrl: 'https://developers.google.com/sheets/demobank', privacyPolicyUrl: 'https://google.com/privacy', developerInfo: { id: 'dev-google', name: 'Google LLC', contactEmail: 'cloud-support@google.com' } },
    ...generateMockExtensions(495), // Add many more to reach the line count
];

const MOCK_REVIEWS: ExtensionReview[] = [];
MOCK_EXTENSIONS.forEach(ext => {
    for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) { // 5-14 reviews per extension
        MOCK_REVIEWS.push({
            id: generateRandomId(),
            extensionId: ext.id,
            userId: `user-${generateRandomId()}`,
            userName: `User ${generateRandomId().substring(0, 4)}`,
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 to 5.0
            comment: EXTENSION_DESCRIPTIONS[Math.floor(Math.random() * EXTENSION_DESCRIPTIONS.length)],
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 365 * 5) * 24 * 60 * 60 * 1000).toISOString(),
        });
    }
});

const MOCK_INSTALLED_EXTENSIONS: InstalledExtension[] = [
    { id: 'inst-vscode', extensionId: 'ext-vscode', userId: 'user-current', installationDate: '2023-01-15T10:00:00Z', enabled: true, configuration: { theme: 'dark', autoUpdate: true } },
    { id: 'inst-slack', extensionId: 'ext-slack', userId: 'user-current', installationDate: '2023-02-20T11:30:00Z', enabled: true, configuration: { channels: ['#payments', '#compliance'], notificationLevel: 'critical' } },
    { id: 'inst-jira', extensionId: 'ext-jira', userId: 'user-current', installationDate: '2023-03-01T14:00:00Z', enabled: false, configuration: { project: 'DEMO', linkPayments: false }, subscription: { planId: 'jira-pro', startDate: '2023-03-01T14:00:00Z', endDate: '2024-03-01T14:00:00Z', status: 'active', autoRenew: true } },
];
// Add more installed extensions, potentially for other users
for (let i = 0; i < 50; i++) {
    const randomExt = MOCK_EXTENSIONS[Math.floor(Math.random() * MOCK_EXTENSIONS.length)];
    if (!MOCK_INSTALLED_EXTENSIONS.some(ie => ie.extensionId === randomExt.id && ie.userId === 'user-current')) {
        MOCK_INSTALLED_EXTENSIONS.push({
            id: `inst-${generateRandomId()}`,
            extensionId: randomExt.id,
            userId: 'user-current',
            installationDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
            enabled: Math.random() > 0.1,
            configuration: {
                setting1: Math.random() > 0.5 ? 'valueA' : 'valueB',
                setting2: Math.random() * 100,
            },
            subscription: randomExt.pricingPlans && randomExt.pricingPlans.length > 0 && Math.random() > 0.3 ? {
                planId: randomExt.pricingPlans[0].id,
                startDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date(Date.now() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active',
                autoRenew: Math.random() > 0.5,
            } : undefined,
        });
    }
}


const MOCK_DEVELOPER_EXTENSIONS: DeveloperExtension[] = MOCK_EXTENSIONS
    .filter(ext => ext.developerInfo.id === 'dev-demobank' || Math.random() > 0.8) // Some random ones, plus demobank
    .map(ext => ({
        id: ext.id,
        name: ext.name,
        status: (['published', 'draft', 'pending_review'] as const)[Math.floor(Math.random() * 3)],
        version: ext.version,
        lastPublished: ext.lastUpdated,
        totalInstalls: ext.installCount,
        reviewsCount: MOCK_REVIEWS.filter(r => r.extensionId === ext.id).length,
        averageRating: ext.rating,
        monetizationStatus: ext.price > 0 ? (ext.pricingPlans ? 'subscription' : 'paid') : 'free',
        pendingUpdates: Math.random() > 0.7,
    }));

const MOCK_AUDIT_LOGS: AuditLogEntry[] = Array.from({ length: 200 }, () => {
    const action = (['INSTALL_EXTENSION', 'UNINSTALL_EXTENSION', 'UPDATE_CONFIG', 'SUBMIT_REVIEW', 'PUBLISH_EXTENSION', 'UPDATE_EXTENSION'] as const)[Math.floor(Math.random() * 6)];
    const randomExt = MOCK_EXTENSIONS[Math.floor(Math.random() * MOCK_EXTENSIONS.length)];
    const details: Record<string, any> = {};
    if (action === 'INSTALL_EXTENSION' || action === 'UNINSTALL_EXTENSION' || action === 'UPDATE_CONFIG' || action === 'SUBMIT_REVIEW' || action === 'UPDATE_EXTENSION') {
        details.extensionName = randomExt.name;
    }
    if (action === 'UPDATE_CONFIG') {
        details.oldConfig = { enabled: true };
        details.newConfig = { enabled: false };
    }
    if (action === 'SUBMIT_REVIEW') {
        details.rating = Math.floor(Math.random() * 5) + 1;
    }
    return {
        id: generateRandomId(),
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        action,
        userId: Math.random() > 0.5 ? 'user-current' : `user-${generateRandomId()}`,
        extensionId: randomExt.id,
        details,
    };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


const MOCK_ANALYTICS_DATA: ExtensionAnalytics[] = MOCK_DEVELOPER_EXTENSIONS.map(devExt => {
    const data = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        data.push({
            date,
            installs: Math.floor(Math.random() * 100),
            uninstalls: Math.floor(Math.random() * 10),
            activeUsers: Math.floor(Math.random() * devExt.totalInstalls * 0.5),
            revenue: devExt.monetizationStatus !== 'free' ? parseFloat((Math.random() * 500).toFixed(2)) : undefined,
            errors: Math.floor(Math.random() * 5),
        });
    }
    return {
        extensionId: devExt.id,
        period: 'daily',
        data: data.reverse(), // Newest last
    };
});


// --- Mock API Service (Simulates async calls) ---
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const mockApiService = {
    fetchExtensions: async (params: {
        query?: string;
        category?: string;
        publisher?: string;
        minRating?: number;
        priceFilter?: 'free' | 'paid' | 'any';
        page?: number;
        limit?: number;
        sortBy?: keyof Extension;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{ extensions: Extension[]; total: number }> => {
        await delay(300 + Math.random() * 500); // Simulate network delay
        let filtered = [...MOCK_EXTENSIONS];

        if (params.query) {
            const lowerQuery = params.query.toLowerCase();
            filtered = filtered.filter(ext =>
                ext.name.toLowerCase().includes(lowerQuery) ||
                ext.description.toLowerCase().includes(lowerQuery) ||
                ext.publisher.toLowerCase().includes(lowerQuery) ||
                ext.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
        }

        if (params.category && params.category !== 'all') {
            filtered = filtered.filter(ext => ext.category.toLowerCase() === params.category!.toLowerCase());
        }

        if (params.publisher && params.publisher !== 'all') {
            filtered = filtered.filter(ext => ext.publisher.toLowerCase() === params.publisher!.toLowerCase());
        }

        if (params.minRating) {
            filtered = filtered.filter(ext => ext.rating >= params.minRating!);
        }

        if (params.priceFilter) {
            if (params.priceFilter === 'free') {
                filtered = filtered.filter(ext => ext.price === 0);
            } else if (params.priceFilter === 'paid') {
                filtered = filtered.filter(ext => ext.price > 0);
            }
        }

        if (params.sortBy) {
            filtered.sort((a, b) => {
                const valA = a[params.sortBy!] as any;
                const valB = b[params.sortBy!] as any;
                if (typeof valA === 'string') {
                    return params.sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
                }
                return params.sortOrder === 'desc' ? valB - valA : valA - valB;
            });
        }

        const total = filtered.length;
        const page = params.page || 1;
        const limit = params.limit || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const extensions = filtered.slice(startIndex, endIndex);

        return { extensions, total };
    },

    fetchExtensionDetails: async (id: string): Promise<Extension | null> => {
        await delay(200 + Math.random() * 300);
        return MOCK_EXTENSIONS.find(ext => ext.id === id) || null;
    },

    fetchExtensionReviews: async (extensionId: string): Promise<ExtensionReview[]> => {
        await delay(150 + Math.random() * 250);
        return MOCK_REVIEWS.filter(review => review.extensionId === extensionId);
    },

    submitReview: async (review: Omit<ExtensionReview, 'id' | 'timestamp' | 'userId' | 'userName'>): Promise<ExtensionReview> => {
        await delay(400);
        const newReview: ExtensionReview = {
            ...review,
            id: generateRandomId(),
            userId: 'user-current', // Assume current user
            userName: 'Current User',
            timestamp: new Date().toISOString(),
        };
        MOCK_REVIEWS.push(newReview);
        // Update average rating and reviews count for the extension (in-memory mock)
        const ext = MOCK_EXTENSIONS.find(e => e.id === review.extensionId);
        if (ext) {
            const reviewsForExt = MOCK_REVIEWS.filter(r => r.extensionId === ext.id);
            ext.rating = reviewsForExt.reduce((sum, r) => sum + r.rating, 0) / reviewsForExt.length;
        }
        return newReview;
    },

    fetchInstalledExtensions: async (userId: string): Promise<InstalledExtension[]> => {
        await delay(250 + Math.random() * 400);
        return MOCK_INSTALLED_EXTENSIONS.filter(installed => installed.userId === userId);
    },

    installExtension: async (extensionId: string, userId: string): Promise<InstalledExtension> => {
        await delay(500);
        const existing = MOCK_INSTALLED_EXTENSIONS.find(inst => inst.extensionId === extensionId && inst.userId === userId);
        if (existing) {
            throw new Error('Extension already installed');
        }
        const ext = MOCK_EXTENSIONS.find(e => e.id === extensionId);
        if (!ext) throw new Error('Extension not found');

        const newInstall: InstalledExtension = {
            id: `inst-${generateRandomId()}`,
            extensionId,
            userId,
            installationDate: new Date().toISOString(),
            enabled: true,
            configuration: {},
            subscription: ext.pricingPlans && ext.pricingPlans.length > 0 ? {
                planId: ext.pricingPlans[0].id, // Default to first plan for mock
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
                status: 'trial',
                autoRenew: false,
            } : undefined,
        };
        MOCK_INSTALLED_EXTENSIONS.push(newInstall);
        ext.installCount++; // Update install count
        MOCK_AUDIT_LOGS.unshift({
            id: generateRandomId(), timestamp: new Date().toISOString(), action: 'INSTALL_EXTENSION', userId, extensionId, details: { extensionName: ext.name }
        });
        return newInstall;
    },

    uninstallExtension: async (installedExtensionId: string, userId: string): Promise<void> => {
        await delay(500);
        const index = MOCK_INSTALLED_EXTENSIONS.findIndex(inst => inst.id === installedExtensionId && inst.userId === userId);
        if (index === -1) {
            throw new Error('Installed extension not found');
        }
        const removed = MOCK_INSTALLED_EXTENSIONS.splice(index, 1)[0];
        const ext = MOCK_EXTENSIONS.find(e => e.id === removed.extensionId);
        if (ext) {
            ext.installCount = Math.max(0, ext.installCount - 1); // Decrement install count
            MOCK_AUDIT_LOGS.unshift({
                id: generateRandomId(), timestamp: new Date().toISOString(), action: 'UNINSTALL_EXTENSION', userId, extensionId: ext.id, details: { extensionName: ext.name }
            });
        }
    },

    updateExtensionConfiguration: async (installedExtensionId: string, userId: string, config: Record<string, any>): Promise<InstalledExtension> => {
        await delay(400);
        const installed = MOCK_INSTALLED_EXTENSIONS.find(inst => inst.id === installedExtensionId && inst.userId === userId);
        if (!installed) {
            throw new Error('Installed extension not found');
        }
        const oldConfig = { ...installed.configuration };
        installed.configuration = { ...installed.configuration, ...config };
        MOCK_AUDIT_LOGS.unshift({
            id: generateRandomId(), timestamp: new Date().toISOString(), action: 'UPDATE_CONFIG', userId, extensionId: installed.extensionId, details: { extensionName: MOCK_EXTENSIONS.find(e => e.id === installed.extensionId)?.name, oldConfig, newConfig: config }
        });
        return { ...installed };
    },

    // Developer-specific API
    fetchDeveloperExtensions: async (developerId: string): Promise<DeveloperExtension[]> => {
        await delay(300);
        return MOCK_DEVELOPER_EXTENSIONS.filter(devExt =>
            MOCK_EXTENSIONS.find(ext => ext.id === devExt.id)?.developerInfo.id === developerId
        );
    },

    publishNewExtension: async (newExt: Omit<Extension, 'id' | 'lastUpdated' | 'installCount' | 'rating' | 'version' | 'changelog'> & { initialVersion: string }): Promise<Extension> => {
        await delay(700);
        const id = `ext-${generateRandomId()}`;
        const version = newExt.initialVersion;
        const extension: Extension = {
            ...newExt,
            id,
            lastUpdated: new Date().toISOString(),
            installCount: 0,
            rating: 0,
            version,
            changelog: [{ version, releaseDate: new Date().toISOString(), changes: ['Initial release'] }],
        };
        MOCK_EXTENSIONS.unshift(extension); // Add to marketplace
        MOCK_DEVELOPER_EXTENSIONS.unshift({
            id,
            name: extension.name,
            status: 'pending_review', // Initially pending
            version: extension.version,
            lastPublished: extension.lastUpdated,
            totalInstalls: 0,
            reviewsCount: 0,
            averageRating: 0,
            monetizationStatus: extension.price > 0 ? (extension.pricingPlans ? 'subscription' : 'paid') : 'free',
            pendingUpdates: false,
        });
        MOCK_AUDIT_LOGS.unshift({
            id: generateRandomId(), timestamp: new Date().toISOString(), action: 'PUBLISH_EXTENSION', userId: extension.developerInfo.id, extensionId: id, details: { extensionName: extension.name, status: 'pending_review' }
        });
        return extension;
    },

    updatePublishedExtension: async (extensionId: string, updatedFields: Partial<Omit<Extension, 'id' | 'developerInfo'>>): Promise<Extension> => {
        await delay(700);
        const index = MOCK_EXTENSIONS.findIndex(ext => ext.id === extensionId);
        if (index === -1) throw new Error('Extension not found');
        const oldExt = MOCK_EXTENSIONS[index];
        const newVersion = updatedFields.version && updatedFields.version !== oldExt.version ? updatedFields.version : oldExt.version;
        const newChangelog = newVersion !== oldExt.version && updatedFields.changelog?.length ?
            [...oldExt.changelog || [], { version: newVersion, releaseDate: new Date().toISOString(), changes: updatedFields.changelog[0]?.changes || ['Version updated'] }] :
            oldExt.changelog;

        const updatedExtension: Extension = {
            ...oldExt,
            ...updatedFields,
            version: newVersion,
            changelog: newChangelog,
            lastUpdated: new Date().toISOString(),
        };
        MOCK_EXTENSIONS[index] = updatedExtension;

        const devExtIndex = MOCK_DEVELOPER_EXTENSIONS.findIndex(de => de.id === extensionId);
        if (devExtIndex !== -1) {
            MOCK_DEVELOPER_EXTENSIONS[devExtIndex] = {
                ...MOCK_DEVELOPER_EXTENSIONS[devExtIndex],
                name: updatedExtension.name,
                version: updatedExtension.version,
                lastPublished: updatedExtension.lastUpdated,
                status: 'pending_review', // After update, typically goes to review
                monetizationStatus: updatedExtension.price > 0 ? (updatedExtension.pricingPlans ? 'subscription' : 'paid') : 'free',
                pendingUpdates: false,
            };
        }
        MOCK_AUDIT_LOGS.unshift({
            id: generateRandomId(), timestamp: new Date().toISOString(), action: 'UPDATE_EXTENSION', userId: updatedExtension.developerInfo.id, extensionId, details: { extensionName: updatedExtension.name, fields: Object.keys(updatedFields) }
        });
        return updatedExtension;
    },

    deletePublishedExtension: async (extensionId: string, developerId: string): Promise<void> => {
        await delay(500);
        const index = MOCK_EXTENSIONS.findIndex(ext => ext.id === extensionId && ext.developerInfo.id === developerId);
        if (index === -1) throw new Error('Extension not found or not owned by developer');
        const [removedExt] = MOCK_EXTENSIONS.splice(index, 1);

        const devIndex = MOCK_DEVELOPER_EXTENSIONS.findIndex(de => de.id === extensionId);
        if (devIndex !== -1) {
            MOCK_DEVELOPER_EXTENSIONS.splice(devIndex, 1);
        }
        MOCK_AUDIT_LOGS.unshift({
            id: generateRandomId(), timestamp: new Date().toISOString(), action: 'DELETE_EXTENSION', userId: developerId, extensionId, details: { extensionName: removedExt.name }
        });
    },

    fetchExtensionAnalytics: async (extensionId: string): Promise<ExtensionAnalytics | null> => {
        await delay(300);
        return MOCK_ANALYTICS_DATA.find(data => data.extensionId === extensionId) || null;
    },

    fetchAuditLogs: async (params: { userId?: string; extensionId?: string; limit?: number }): Promise<AuditLogEntry[]> => {
        await delay(200);
        let logs = [...MOCK_AUDIT_LOGS];
        if (params.userId) {
            logs = logs.filter(log => log.userId === params.userId);
        }
        if (params.extensionId) {
            logs = logs.filter(log => log.extensionId === params.extensionId);
        }
        return logs.slice(0, params.limit || 50);
    },
};

// --- User Context (for simulating user roles) ---
type UserRole = 'standard_user' | 'developer' | 'admin';

interface UserContextType {
    currentUser: { id: string; name: string; role: UserRole };
    setCurrentUser: (user: { id: string; name: string; role: UserRole }) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: UserRole }>({
        id: 'user-current',
        name: 'John Doe',
        role: 'standard_user', // Default role
    });

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// --- Custom Hooks ---
export const useExtensions = (params: Parameters<typeof mockApiService.fetchExtensions>[0]) => {
    const [extensions, setExtensions] = useState<Extension[]>([]);
    const [totalExtensions, setTotalExtensions] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError(null);
            try {
                const { extensions: fetchedExtensions, total } = await mockApiService.fetchExtensions(params);
                setExtensions(fetchedExtensions);
                setTotalExtensions(total);
            } catch (err) {
                setError('Failed to fetch extensions.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [params]);

    return { extensions, totalExtensions, loading, error };
};

export const useExtensionDetails = (extensionId: string | null) => {
    const [extension, setExtension] = useState<Extension | null>(null);
    const [reviews, setReviews] = useState<ExtensionReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!extensionId) {
            setExtension(null);
            setReviews([]);
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedExtension = await mockApiService.fetchExtensionDetails(extensionId);
                setExtension(fetchedExtension);
                if (fetchedExtension) {
                    const fetchedReviews = await mockApiService.fetchExtensionReviews(extensionId);
                    setReviews(fetchedReviews);
                }
            } catch (err) {
                setError('Failed to fetch extension details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [extensionId]);

    return { extension, reviews, loading, error, setReviews };
};

export const useInstalledExtensions = (userId: string) => {
    const [installedExtensions, setInstalledExtensions] = useState<InstalledExtension[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshInstalled = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetched = await mockApiService.fetchInstalledExtensions(userId);
            setInstalledExtensions(fetched);
        } catch (err) {
            setError('Failed to fetch installed extensions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        refreshInstalled();
    }, [refreshInstalled]);

    return { installedExtensions, loading, error, refreshInstalled, setInstalledExtensions };
};

export const useDeveloperExtensions = (developerId: string) => {
    const [developerExtensions, setDeveloperExtensions] = useState<DeveloperExtension[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshDeveloperExtensions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const fetched = await mockApiService.fetchDeveloperExtensions(developerId);
            setDeveloperExtensions(fetched);
        } catch (err) {
            setError('Failed to fetch developer extensions.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [developerId]);

    useEffect(() => {
        refreshDeveloperExtensions();
    }, [refreshDeveloperExtensions]);

    return { developerExtensions, loading, error, refreshDeveloperExtensions };
};

// --- Generic Loading and Error Components ---
export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        <p className="ml-4 text-cyan-300">Loading...</p>
    </div>
);

export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900/30 text-red-300 p-4 rounded-lg flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Error: {message}</span>
    </div>
);

// --- Component: Rating Stars ---
export const RatingStars: React.FC<{ rating: number; maxStars?: number }> = ({ rating, maxStars = 5 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = maxStars - fullStars - halfStar;

    return (
        <div className="flex items-center text-yellow-400 text-lg">
            {Array(fullStars).fill(0).map((_, i) => <span key={`full-${i}`}>★</span>)}
            {halfStar === 1 && <span key="half">½</span>}
            {Array(emptyStars).fill(0).map((_, i) => <span key={`empty-${i}`}>☆</span>)}
            <span className="ml-2 text-sm text-gray-400">({rating.toFixed(1)})</span>
        </div>
    );
};

// --- Component: ExtensionCard (Existing, slightly enhanced) ---
export const ExtensionCard: React.FC<{ extension: Extension; onInstall?: (ext: Extension) => void; onUninstall?: (installedExt: InstalledExtension) => void; installed?: InstalledExtension; onViewDetails: (ext: Extension) => void }> = ({ extension, onInstall, onUninstall, installed, onViewDetails }) => {
    const { currentUser } = useUser();
    const isInstalled = !!installed;
    const [installing, setInstalling] = useState(false);
    const [uninstalling, setUninstalling] = useState(false);

    const handleInstall = async () => {
        if (!onInstall || installing) return;
        setInstalling(true);
        try {
            await mockApiService.installExtension(extension.id, currentUser.id);
            onInstall(extension);
        } catch (error: any) {
            alert(`Failed to install: ${error.message}`);
        } finally {
            setInstalling(false);
        }
    };

    const handleUninstall = async () => {
        if (!onUninstall || uninstalling || !installed) return;
        setUninstalling(true);
        try {
            await mockApiService.uninstallExtension(installed.id, currentUser.id);
            onUninstall(installed);
        } catch (error: any) {
            alert(`Failed to uninstall: ${error.message}`);
        } finally {
            setUninstalling(false);
        }
    };

    return (
        <Card variant="interactive" className="flex flex-col h-full hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-200">
            <div className="flex-grow flex flex-col">
                <div className="flex items-center gap-4 mb-3" onClick={() => onViewDetails(extension)} style={{ cursor: 'pointer' }}>
                    <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-xl font-bold text-cyan-300">{extension.icon}</div>
                    <div>
                        <h3 className="font-semibold text-white text-lg">{extension.name}</h3>
                        <p className="text-xs text-gray-400">by {extension.publisher}</p>
                    </div>
                </div>
                <div className="mb-2">
                    <RatingStars rating={extension.rating} />
                    <p className="text-xs text-gray-500">{extension.installCount.toLocaleString()} installs</p>
                </div>
                <p className="text-sm text-gray-400 flex-grow mb-3">{truncateText(extension.description, 100)}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-gray-700/30 text-gray-300 text-xs px-2 py-1 rounded-full">{extension.category}</span>
                    {extension.tags.map(tag => (
                        <span key={tag} className="bg-gray-700/30 text-gray-500 text-xs px-2 py-1 rounded-full">#{tag}</span>
                    ))}
                </div>
                {extension.price > 0 && (
                    <p className="text-sm text-cyan-300 font-semibold mt-auto">{extension.price === 0 ? 'Free' : `$${extension.price.toFixed(2)}`}</p>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50">
                {isInstalled ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onViewDetails(extension)}
                            className="flex-grow py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
                            disabled={installing || uninstalling}
                        >
                            Manage
                        </button>
                        <button
                            onClick={handleUninstall}
                            className="w-1/3 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-200"
                            disabled={uninstalling || installing}
                        >
                            {uninstalling ? '...' : 'Uninstall'}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleInstall}
                        className="w-full py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm transition-colors duration-200"
                        disabled={installing || uninstalling}
                    >
                        {installing ? 'Installing...' : 'Install'}
                    </button>
                )}
            </div>
        </Card>
    );
};

// --- Component: ExtensionDetailsModal ---
export const ExtensionDetailsModal: React.FC<{ extension: Extension; reviews: ExtensionReview[]; onClose: () => void; onInstall: (ext: Extension) => void; installed?: InstalledExtension; onUninstall: (installedExt: InstalledExtension) => void; onNewReview: (review: ExtensionReview) => void }> = ({
    extension,
    reviews,
    onClose,
    onInstall,
    installed,
    onUninstall,
    onNewReview,
}) => {
    const { currentUser } = useUser();
    const isInstalled = !!installed;
    const [installing, setInstalling] = useState(false);
    const [uninstalling, setUninstalling] = useState(false);
    const [currentTab, setCurrentTab] = useState<'overview' | 'reviews' | 'versions' | 'screenshots' | 'pricing'>('overview');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);
    const hasReviewed = reviews.some(r => r.userId === currentUser.id);

    const handleInstall = async () => {
        if (!onInstall || installing) return;
        setInstalling(true);
        try {
            const newInstalled = await mockApiService.installExtension(extension.id, currentUser.id);
            onInstall(extension); // Callback to update parent state
        } catch (error: any) {
            alert(`Failed to install: ${error.message}`);
        } finally {
            setInstalling(false);
        }
    };

    const handleUninstall = async () => {
        if (!onUninstall || uninstalling || !installed) return;
        setUninstalling(true);
        try {
            await mockApiService.uninstallExtension(installed.id, currentUser.id);
            onUninstall(installed); // Callback to update parent state
        } catch (error: any) {
            alert(`Failed to uninstall: ${error.message}`);
        } finally {
            setUninstalling(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewText || reviewRating === 0 || submittingReview) return;
        setSubmittingReview(true);
        try {
            const newReview = await mockApiService.submitReview({
                extensionId: extension.id,
                rating: reviewRating,
                comment: reviewText,
            });
            onNewReview(newReview); // Callback to update parent state
            setReviewText('');
            setReviewRating(0);
        } catch (error: any) {
            alert(`Failed to submit review: ${error.message}`);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (!extension) return null;

    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 overflow-y-auto">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border border-gray-700/50 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">
                    &times;
                </button>

                <div className="flex items-start gap-6 pb-6 border-b border-gray-700/50 mb-6">
                    <div className="w-20 h-20 bg-gray-700/50 rounded-lg flex items-center justify-center text-4xl font-bold text-cyan-300 flex-shrink-0">
                        {extension.icon}
                    </div>
                    <div className="flex-grow">
                        <h2 className="text-3xl font-bold text-white mb-1">{extension.name}</h2>
                        <p className="text-md text-gray-400 mb-2">by {extension.publisher}</p>
                        <div className="flex items-center gap-3">
                            <RatingStars rating={averageRating} />
                            <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                            <span className="text-sm text-gray-500">| {extension.installCount.toLocaleString()} installs</span>
                        </div>
                        <p className="text-sm text-cyan-300 font-semibold mt-2">{extension.price === 0 ? 'Free' : `$${extension.price.toFixed(2)}`}</p>
                    </div>
                    <div className="flex-shrink-0">
                        {isInstalled ? (
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => { /* Open settings modal */ alert('Open settings for this extension!'); }}
                                    className="px-6 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
                                    disabled={installing || uninstalling}
                                >
                                    Manage Settings
                                </button>
                                <button
                                    onClick={handleUninstall}
                                    className="px-6 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-200"
                                    disabled={uninstalling || installing}
                                >
                                    {uninstalling ? 'Uninstalling...' : 'Uninstall'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleInstall}
                                className="px-8 py-3 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-lg font-semibold transition-colors duration-200"
                                disabled={installing || uninstalling}
                            >
                                {installing ? 'Installing...' : 'Install Extension'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex border-b border-gray-700/50 mb-6 -mx-6 px-6">
                    {['overview', 'reviews', 'versions', 'screenshots', 'pricing'].filter(tab => tab !== 'pricing' || extension.pricingPlans?.length).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setCurrentTab(tab as any)}
                            className={`px-4 py-3 text-sm font-medium ${currentTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'reviews' && reviews.length > 0 && ` (${reviews.length})`}
                            {tab === 'versions' && extension.changelog && extension.changelog.length > 0 && ` (${extension.changelog.length})`}
                        </button>
                    ))}
                </div>

                <div className="prose prose-invert max-w-none text-gray-300">
                    {currentTab === 'overview' && (
                        <div>
                            <p className="text-lg text-gray-300 mb-4">{extension.description}</p>
                            <h3 className="text-xl font-semibold text-white mb-2">Key Features</h3>
                            <ul className="list-disc list-inside space-y-1 mb-4">
                                <li>Real-time data synchronization</li>
                                <li>Customizable dashboards and alerts</li>
                                <li>Secure API access and robust authentication</li>
                                <li>Developer-friendly documentation and SDKs</li>
                                <li>Scalable architecture for growing demands</li>
                                <li>Integration with popular third-party services</li>
                                <li>Comprehensive audit trails for compliance</li>
                            </ul>
                            <div className="flex gap-4 mb-4">
                                <div>
                                    <h4 className="font-semibold text-white">Last Updated</h4>
                                    <p className="text-gray-400">{formatDate(extension.lastUpdated)}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Version</h4>
                                    <p className="text-gray-400">{extension.version}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">Category</h4>
                                    <p className="text-gray-400">{extension.category}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 mb-4">
                                {extension.documentationUrl && (
                                    <a href={extension.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Documentation</a>
                                )}
                                {extension.privacyPolicyUrl && (
                                    <a href={extension.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Privacy Policy</a>
                                )}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Developer Information</h3>
                            <p className="text-gray-400"><strong>Name:</strong> {extension.developerInfo.name}</p>
                            <p className="text-gray-400"><strong>Contact:</strong> {extension.developerInfo.contactEmail}</p>
                            {extension.developerInfo.website && (
                                <p className="text-gray-400"><strong>Website:</strong> <a href={extension.developerInfo.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{extension.developerInfo.website}</a></p>
                            )}
                        </div>
                    )}

                    {currentTab === 'reviews' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">User Reviews</h3>
                            {reviews.length === 0 && <p className="text-gray-500">No reviews yet. Be the first to review!</p>}
                            <div className="space-y-6 mb-6">
                                {reviews.map(review => (
                                    <div key={review.id} className="border-b border-gray-700/50 pb-4 last:border-b-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-semibold text-white">{review.userName}</span>
                                            <RatingStars rating={review.rating} />
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{review.comment}</p>
                                        <p className="text-xs text-gray-500">Reviewed on {formatDate(review.timestamp)}</p>
                                    </div>
                                ))}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-4">Write a Review</h3>
                            {!hasReviewed ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-300">Your Rating:</span>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewRating(star)}
                                                className={`text-2xl ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        className="w-full p-3 bg-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                                        rows={4}
                                        placeholder="Share your experience..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                    ></textarea>
                                    <button
                                        onClick={handleSubmitReview}
                                        className="px-6 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200"
                                        disabled={submittingReview || reviewRating === 0 || !reviewText.trim()}
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500">You have already submitted a review for this extension.</p>
                            )}
                        </div>
                    )}

                    {currentTab === 'versions' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Version History</h3>
                            {extension.changelog && extension.changelog.length > 0 ? (
                                <div className="space-y-4">
                                    {extension.changelog.map((log, index) => (
                                        <div key={index} className="border-b border-gray-700/50 pb-3 last:border-b-0">
                                            <p className="font-semibold text-white">Version {log.version} <span className="text-sm text-gray-500">({formatDate(log.releaseDate)})</span></p>
                                            <ul className="list-disc list-inside text-sm text-gray-400 pl-4">
                                                {log.changes.map((change, i) => <li key={i}>{change}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No version history available.</p>
                            )}
                        </div>
                    )}

                    {currentTab === 'screenshots' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Screenshots</h3>
                            {extension.screenshots && extension.screenshots.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {extension.screenshots.map((src, index) => (
                                        <img key={index} src={src} alt={`Screenshot ${index + 1}`} className="rounded-lg object-cover w-full h-auto" />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No screenshots available.</p>
                            )}
                        </div>
                    )}

                    {currentTab === 'pricing' && extension.pricingPlans && extension.pricingPlans.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Pricing Plans</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {extension.pricingPlans.map(plan => (
                                    <Card key={plan.id} className="bg-gray-700/30 p-6 flex flex-col">
                                        <h4 className="text-xl font-bold text-cyan-300 mb-2">{plan.name}</h4>
                                        <p className="text-gray-400 mb-4 flex-grow">{plan.description}</p>
                                        <div className="mb-4">
                                            <p className="text-3xl font-bold text-white mb-1">${plan.priceMonthly.toFixed(2)}<span className="text-lg text-gray-400">/month</span></p>
                                            <p className="text-md text-gray-500">or ${plan.priceAnnually.toFixed(2)}/year</p>
                                        </div>
                                        <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
                                            {plan.features.map((feature, i) => <li key={i}>{feature}</li>)}
                                        </ul>
                                        <button className="w-full py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200 mt-auto">
                                            Select Plan
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};


// --- Component: InstalledExtensionCard (for the 'Installed' view) ---
export const InstalledExtensionCard: React.FC<{ installedExtension: InstalledExtension; onUninstall: (installedExt: InstalledExtension) => void; onManageSettings: (installedExt: InstalledExtension) => void }> = ({ installedExtension, onUninstall, onManageSettings }) => {
    const { currentUser } = useUser();
    const extension = MOCK_EXTENSIONS.find(ext => ext.id === installedExtension.extensionId);
    const [uninstalling, setUninstalling] = useState(false);

    if (!extension) return null; // Should not happen with valid data

    const handleUninstall = async () => {
        if (uninstalling) return;
        setUninstalling(true);
        try {
            await mockApiService.uninstallExtension(installedExtension.id, currentUser.id);
            onUninstall(installedExtension);
        } catch (error: any) {
            alert(`Failed to uninstall: ${error.message}`);
        } finally {
            setUninstalling(false);
        }
    };

    return (
        <Card className="flex flex-col h-full bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200">
            <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-xl font-bold text-cyan-300">{extension.icon}</div>
                <div>
                    <h3 className="font-semibold text-white text-lg">{extension.name}</h3>
                    <p className="text-xs text-gray-400">by {extension.publisher}</p>
                </div>
            </div>
            <p className="text-sm text-gray-400 flex-grow mb-3">{truncateText(extension.description, 80)}</p>
            <div className="text-xs text-gray-500 mb-2">
                <p>Installed: {formatDate(installedExtension.installationDate)}</p>
                <p>Status: <span className={`${installedExtension.enabled ? 'text-green-400' : 'text-red-400'}`}>{installedExtension.enabled ? 'Enabled' : 'Disabled'}</span></p>
                {installedExtension.subscription && (
                    <p>Plan: {installedExtension.subscription.planId} (Status: {installedExtension.subscription.status})</p>
                )}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-700/50 flex gap-2">
                <button
                    onClick={() => onManageSettings(installedExtension)}
                    className="flex-grow py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
                >
                    Settings
                </button>
                <button
                    onClick={handleUninstall}
                    className="w-1/3 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-200"
                    disabled={uninstalling}
                >
                    {uninstalling ? '...' : 'Uninstall'}
                </button>
            </div>
        </Card>
    );
};

// --- Component: ExtensionSettingsModal ---
export const ExtensionSettingsModal: React.FC<{ installedExtension: InstalledExtension; onClose: () => void; onSave: (installedExt: InstalledExtension) => void }> = ({ installedExtension, onClose, onSave }) => {
    const { currentUser } = useUser();
    const extension = MOCK_EXTENSIONS.find(ext => ext.id === installedExtension.extensionId);
    const [config, setConfig] = useState(installedExtension.configuration);
    const [enabled, setEnabled] = useState(installedExtension.enabled);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!extension) return null;

    const handleConfigChange = (key: string, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await mockApiService.updateExtensionConfiguration(installedExtension.id, currentUser.id, { ...config, enabled });
            onSave(updated);
            onClose();
        } catch (err: any) {
            setError(`Failed to save settings: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 overflow-y-auto">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border border-gray-700/50 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-white mb-4">Settings for {extension.name}</h2>

                {error && <ErrorMessage message={error} className="mb-4" />}

                <div className="space-y-6">
                    <div>
                        <label className="flex items-center space-x-3 cursor-pointer mb-2">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                            />
                            <span className="text-white text-lg">Enable Extension</span>
                        </label>
                        <p className="text-sm text-gray-500">Control whether this extension is actively running.</p>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">Configuration</h3>
                    {Object.keys(config).length === 0 && <p className="text-gray-500">No specific configurations available for this extension.</p>}

                    {Object.keys(config).map(key => (
                        <div key={key} className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 p-3 bg-gray-700/30 rounded-lg">
                            <label htmlFor={`config-${key}`} className="w-full md:w-1/3 text-white text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</label>
                            <div className="w-full md:w-2/3">
                                {typeof config[key] === 'boolean' ? (
                                    <input
                                        type="checkbox"
                                        id={`config-${key}`}
                                        className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                        checked={config[key]}
                                        onChange={(e) => handleConfigChange(key, e.target.checked)}
                                    />
                                ) : typeof config[key] === 'number' ? (
                                    <input
                                        type="number"
                                        id={`config-${key}`}
                                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                                        value={config[key]}
                                        onChange={(e) => handleConfigChange(key, parseFloat(e.target.value))}
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        id={`config-${key}`}
                                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                                        value={config[key]}
                                        onChange={(e) => handleConfigChange(key, e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    {installedExtension.subscription && (
                        <>
                            <h3 className="text-xl font-semibold text-white mb-2">Subscription Details</h3>
                            <div className="space-y-2 text-gray-300">
                                <p><strong>Plan:</strong> {installedExtension.subscription.planId}</p>
                                <p><strong>Status:</strong> <span className={`font-medium ${installedExtension.subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{installedExtension.subscription.status}</span></p>
                                <p><strong>Starts:</strong> {formatDate(installedExtension.subscription.startDate)}</p>
                                <p><strong>Ends:</strong> {formatDate(installedExtension.subscription.endDate)}</p>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                        checked={installedExtension.subscription.autoRenew}
                                        disabled // Mocked as disabled for now
                                    />
                                    <span className="text-white text-sm">Auto-renew</span>
                                </label>
                                <button className="py-2 px-4 bg-purple-600/50 hover:bg-purple-600 text-white rounded-lg text-sm mt-2 transition-colors duration-200" disabled>Manage Subscription</button>
                            </div>
                        </>
                    )}

                </div>

                <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </Card>
        </div>
    );
};


// --- Component: Search and Filter Panel ---
export const SearchFilterPanel: React.FC<{
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    priceFilter: 'free' | 'paid' | 'any';
    setPriceFilter: (filter: 'free' | 'paid' | 'any') => void;
    minRating: number;
    setMinRating: (rating: number) => void;
    sortBy: keyof Extension;
    setSortBy: (sortBy: keyof Extension) => void;
    sortOrder: 'asc' | 'desc';
    setSortOrder: (order: 'asc' | 'desc') => void;
}> = ({
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    priceFilter, setPriceFilter,
    minRating, setMinRating,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
}) => {
    const categories = ['all', ...MOCK_CATEGORIES.map(c => c.name.toLowerCase())];
    const sortOptions: { value: keyof Extension; label: string }[] = [
        { value: 'name', label: 'Name' },
        { value: 'lastUpdated', label: 'Last Updated' },
        { value: 'rating', label: 'Rating' },
        { value: 'installCount', label: 'Popularity' },
        { value: 'price', label: 'Price' },
    ];

    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Filter Extensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Search */}
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">Search</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by name, publisher, tag..."
                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <select
                        id="category"
                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Price Filter */}
                <div>
                    <label htmlFor="priceFilter" className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                    <select
                        id="priceFilter"
                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value as 'free' | 'paid' | 'any')}
                    >
                        <option value="any">Any Price</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>

                {/* Minimum Rating */}
                <div>
                    <label htmlFor="minRating" className="block text-sm font-medium text-gray-300 mb-1">Minimum Rating</label>
                    <select
                        id="minRating"
                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    >
                        <option value={0}>Any Rating</option>
                        <option value={4.5}>4.5 Stars & Up</option>
                        <option value={4}>4 Stars & Up</option>
                        <option value={3.5}>3.5 Stars & Up</option>
                        <option value={3}>3 Stars & Up</option>
                    </select>
                </div>

                {/* Sort By */}
                <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
                    <select
                        id="sortBy"
                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as keyof Extension)}
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>

                {/* Sort Order */}
                <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
                    <select
                        id="sortOrder"
                        className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>
        </Card>
    );
};

// --- Component: Pagination Controls ---
export const PaginationControls: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    const pagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    const pages = Array.from({ length: (endPage - startPage + 1) }, (_, i) => startPage + i);

    return (
        <div className="flex justify-center items-center space-x-2 py-6">
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                First
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-4 py-1 rounded-lg text-sm ${currentPage === page ? 'bg-cyan-600 text-white font-semibold' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'}`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Last
            </button>
        </div>
    );
};

// --- Component: PublishExtensionForm ---
export const PublishExtensionForm: React.FC<{ developerId: string; onSuccess: (ext: Extension) => void; onCancel: () => void }> = ({ developerId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Extension, 'id' | 'lastUpdated' | 'installCount' | 'rating' | 'version' | 'changelog'> & { initialVersion: string }>({
        name: '',
        publisher: '', // Will be overridden by developer's publisher info
        description: '',
        icon: '', // Represented as a string for now, e.g., 'VS', 'JI'
        category: MOCK_CATEGORIES[0].name,
        tags: [],
        price: 0,
        screenshots: [],
        documentationUrl: '',
        privacyPolicyUrl: '',
        developerInfo: {
            id: developerId,
            name: 'Demo Bank Team (Developer)', // Mocked, would fetch actual developer name
            contactEmail: 'developer@demobank.com',
        },
        initialVersion: '1.0.0',
        pricingPlans: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [screenshotInput, setScreenshotInput] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [pricingPlanInput, setPricingPlanInput] = useState<PricingPlan>({ id: '', name: '', description: '', priceMonthly: 0, priceAnnually: 0, features: [] });
    const [planFeatureInput, setPlanFeatureInput] = useState('');


    useEffect(() => {
        // Mock fetching developer info
        const dev = MOCK_EXTENSIONS.find(e => e.developerInfo.id === developerId)?.developerInfo || { id: developerId, name: 'Developer', contactEmail: 'dev@example.com' };
        setFormData(prev => ({
            ...prev,
            publisher: dev.name,
            developerInfo: dev,
        }));
    }, [developerId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleAddScreenshot = () => {
        if (screenshotInput.trim() && !formData.screenshots.includes(screenshotInput.trim())) {
            setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, screenshotInput.trim()] }));
            setScreenshotInput('');
        }
    };

    const handleRemoveScreenshot = (screenshotToRemove: string) => {
        setFormData(prev => ({ ...prev, screenshots: prev.screenshots.filter(s => s !== screenshotToRemove) }));
    };

    const handleAddPricingPlan = () => {
        if (pricingPlanInput.name && pricingPlanInput.priceMonthly > 0) {
            setFormData(prev => ({
                ...prev,
                pricingPlans: [...(prev.pricingPlans || []), { ...pricingPlanInput, id: generateRandomId() }],
            }));
            setPricingPlanInput({ id: '', name: '', description: '', priceMonthly: 0, priceAnnually: 0, features: [] });
        }
    };

    const handleRemovePricingPlan = (planId: string) => {
        setFormData(prev => ({
            ...prev,
            pricingPlans: (prev.pricingPlans || []).filter(p => p.id !== planId),
        }));
    };

    const handleAddPlanFeature = () => {
        if (planFeatureInput.trim()) {
            setPricingPlanInput(prev => ({
                ...prev,
                features: [...prev.features, planFeatureInput.trim()],
            }));
            setPlanFeatureInput('');
        }
    };

    const handleRemovePlanFeature = (featureToRemove: string) => {
        setPricingPlanInput(prev => ({
            ...prev,
            features: prev.features.filter(f => f !== featureToRemove),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPublishing(true);
        setError(null);

        // Basic validation
        if (!formData.name || !formData.description || !formData.category || !formData.icon || !formData.initialVersion) {
            setError('Please fill in all required fields.');
            setPublishing(false);
            return;
        }

        try {
            const finalFormData = {
                ...formData,
                price: isPaid ? formData.price : 0, // Ensure price is 0 if not paid
                pricingPlans: isPaid ? formData.pricingPlans : undefined, // Remove pricing plans if free
                // Mock icon element from string
                icon: <p>{formData.icon.toUpperCase().substring(0,2)}</p>
            };

            const publishedExtension = await mockApiService.publishNewExtension(finalFormData);
            onSuccess(publishedExtension);
        } catch (err: any) {
            setError(`Failed to publish extension: ${err.message}`);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Publish New Extension</h2>
            {error && <ErrorMessage message={error} className="mb-4" />}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Extension Name <span className="text-red-500">*</span></label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                           className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={4}
                              className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"></textarea>
                </div>
                <div>
                    <label htmlFor="icon" className="block text-sm font-medium text-gray-300 mb-1">Icon Text (e.g., VS, JI) <span className="text-red-500">*</span></label>
                    <input type="text" id="icon" name="icon" value={typeof formData.icon === 'string' ? formData.icon : ''} onChange={handleChange} required maxLength={2}
                           className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                    <p className="text-xs text-gray-500 mt-1">This will be used to generate a simple text icon. Max 2 characters.</p>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required
                            className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50">
                        {MOCK_CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                    <div className="flex gap-2 mb-2">
                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                               className="flex-grow p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                               placeholder="Add a tag..." />
                        <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <span key={tag} className="bg-gray-700/30 text-gray-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-gray-400 hover:text-white ml-1">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="initialVersion" className="block text-sm font-medium text-gray-300 mb-1">Initial Version <span className="text-red-500">*</span></label>
                    <input type="text" id="initialVersion" name="initialVersion" value={formData.initialVersion} onChange={handleChange} required
                           className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                </div>
                <div>
                    <label htmlFor="documentationUrl" className="block text-sm font-medium text-gray-300 mb-1">Documentation URL</label>
                    <input type="url" id="documentationUrl" name="documentationUrl" value={formData.documentationUrl} onChange={handleChange}
                           className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                </div>
                <div>
                    <label htmlFor="privacyPolicyUrl" className="block text-sm font-medium text-gray-300 mb-1">Privacy Policy URL</label>
                    <input type="url" id="privacyPolicyUrl" name="privacyPolicyUrl" value={formData.privacyPolicyUrl} onChange={handleChange}
                           className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                </div>

                {/* Screenshots */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Screenshots (URLs)</label>
                    <div className="flex gap-2 mb-2">
                        <input type="url" value={screenshotInput} onChange={(e) => setScreenshotInput(e.target.value)}
                               className="flex-grow p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                               placeholder="Add screenshot URL..." />
                        <button type="button" onClick={handleAddScreenshot} className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">Add</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {formData.screenshots.map((src, index) => (
                            <div key={index} className="relative group">
                                <img src={src} alt={`Screenshot ${index + 1}`} className="rounded-lg object-cover w-full h-24" />
                                <button type="button" onClick={() => handleRemoveScreenshot(src)}
                                        className="absolute top-1 right-1 bg-red-600/70 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monetization */}
                <div className="border-t border-gray-700/50 pt-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Monetization</h3>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                        />
                        <span className="text-white text-lg">This is a paid extension</span>
                    </label>

                    {isPaid && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">One-time Purchase Price (Set to 0 if subscription-only)</label>
                                <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01"
                                       className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                            </div>

                            <h4 className="text-lg font-semibold text-white mb-2">Pricing Plans (for Subscription)</h4>
                            <div className="space-y-3 p-4 bg-gray-700/30 rounded-lg">
                                {formData.pricingPlans && formData.pricingPlans.length > 0 && (
                                    <div className="mb-4">
                                        {formData.pricingPlans.map(plan => (
                                            <div key={plan.id} className="flex justify-between items-center bg-gray-800/50 p-2 rounded-lg mb-2">
                                                <span className="text-white">{plan.name} - ${plan.priceMonthly}/month</span>
                                                <button type="button" onClick={() => handleRemovePricingPlan(plan.id)} className="text-red-400 hover:text-red-200">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="planName" className="block text-sm font-medium text-gray-300 mb-1">Plan Name</label>
                                    <input type="text" id="planName" value={pricingPlanInput.name} onChange={(e) => setPricingPlanInput(prev => ({ ...prev, name: e.target.value }))}
                                           className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                                </div>
                                <div>
                                    <label htmlFor="planDescription" className="block text-sm font-medium text-gray-300 mb-1">Plan Description</label>
                                    <textarea id="planDescription" value={pricingPlanInput.description} onChange={(e) => setPricingPlanInput(prev => ({ ...prev, description: e.target.value }))} rows={2}
                                              className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"></textarea>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-grow">
                                        <label htmlFor="priceMonthly" className="block text-sm font-medium text-gray-300 mb-1">Price Monthly</label>
                                        <input type="number" id="priceMonthly" value={pricingPlanInput.priceMonthly} onChange={(e) => setPricingPlanInput(prev => ({ ...prev, priceMonthly: parseFloat(e.target.value) || 0 }))} min="0" step="0.01"
                                               className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                                    </div>
                                    <div className="flex-grow">
                                        <label htmlFor="priceAnnually" className="block text-sm font-medium text-gray-300 mb-1">Price Annually</label>
                                        <input type="number" id="priceAnnually" value={pricingPlanInput.priceAnnually} onChange={(e) => setPricingPlanInput(prev => ({ ...prev, priceAnnually: parseFloat(e.target.value) || 0 }))} min="0" step="0.01"
                                               className="w-full p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Plan Features</label>
                                    <div className="flex gap-2 mb-2">
                                        <input type="text" value={planFeatureInput} onChange={(e) => setPlanFeatureInput(e.target.value)}
                                               className="flex-grow p-2 bg-gray-700/50 rounded-lg text-gray-200 border border-gray-600 focus:border-cyan-500 focus:ring focus:ring-cyan-500 focus:ring-opacity-50"
                                               placeholder="Add a feature..." />
                                        <button type="button" onClick={handleAddPlanFeature} className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">Add</button>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 pl-4">
                                        {pricingPlanInput.features.map((feature, i) => (
                                            <li key={i} className="flex justify-between items-center">
                                                {feature}
                                                <button type="button" onClick={() => handleRemovePlanFeature(feature)} className="text-red-400 hover:text-red-200 ml-2">&times;</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button type="button" onClick={handleAddPricingPlan} className="w-full py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-sm font-semibold">Add Pricing Plan</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700/50">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold">
                        Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold" disabled={publishing}>
                        {publishing ? 'Publishing...' : 'Publish Extension'}
                    </button>
                </div>
            </form>
        </Card>
    );
};

// --- Component: DeveloperExtensionCard ---
export const DeveloperExtensionCard: React.FC<{ devExtension: DeveloperExtension; onViewDetails: (extId: string) => void; onEditExtension: (extId: string) => void; onDeleteExtension: (extId: string) => void; }> = ({ devExtension, onViewDetails, onEditExtension, onDeleteExtension }) => {
    const extension = MOCK_EXTENSIONS.find(e => e.id === devExtension.id); // Get full extension data

    if (!extension) return null; // Should not happen

    const statusColors = {
        'published': 'text-green-400',
        'draft': 'text-yellow-400',
        'pending_review': 'text-blue-400',
        'rejected': 'text-red-400',
        'archived': 'text-gray-500',
    };

    return (
        <Card className="flex flex-col h-full bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200">
            <div className="flex-grow">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center text-xl font-bold text-cyan-300">{extension.icon}</div>
                    <div>
                        <h3 className="font-semibold text-white text-lg">{devExtension.name}</h3>
                        <p className="text-xs text-gray-400">Version: {devExtension.version}</p>
                    </div>
                </div>
                <div className="mb-2">
                    <p className={`text-sm font-medium ${statusColors[devExtension.status]}`}>Status: {devExtension.status.replace('_', ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</p>
                    <p className="text-sm text-gray-500">Last Published: {formatDate(devExtension.lastPublished)}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <RatingStars rating={devExtension.averageRating} />
                    <span>({devExtension.reviewsCount} reviews)</span>
                    <span>| {devExtension.totalInstalls.toLocaleString()} installs</span>
                </div>
                {devExtension.pendingUpdates && (
                    <div className="bg-yellow-900/30 text-yellow-300 text-xs p-2 rounded-lg flex items-center gap-2 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Update available or required.</span>
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/50 flex gap-2">
                <button
                    onClick={() => onViewDetails(devExtension.id)}
                    className="flex-grow py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors duration-200"
                >
                    View Details
                </button>
                <button
                    onClick={() => onEditExtension(devExtension.id)}
                    className="flex-grow py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm transition-colors duration-200"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDeleteExtension(devExtension.id)}
                    className="w-1/4 py-2 bg-red-600/50 hover:bg-red-600 text-white rounded-lg text-sm transition-colors duration-200"
                >
                    Delete
                </button>
            </div>
        </Card>
    );
};

// --- Component: AnalyticsDashboard ---
export const AnalyticsDashboard: React.FC<{ extensionId: string; onClose: () => void }> = ({ extensionId, onClose }) => {
    const [analytics, setAnalytics] = useState<ExtensionAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await mockApiService.fetchExtensionAnalytics(extensionId);
                setAnalytics(data);
            } catch (err: any) {
                setError(`Failed to fetch analytics: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [extensionId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!analytics) return <p className="text-gray-400">No analytics data available for this extension.</p>;

    const totalInstalls = analytics.data.reduce((sum, entry) => sum + entry.installs, 0);
    const totalUninstalls = analytics.data.reduce((sum, entry) => sum + entry.uninstalls, 0);
    const totalRevenue = analytics.data.reduce((sum, entry) => sum + (entry.revenue || 0), 0);

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
                <h2 className="text-2xl font-bold text-white">Analytics for {MOCK_EXTENSIONS.find(e => e.id === extensionId)?.name}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
                    &times;
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Total Installs (last 30 days)</p>
                    <p className="text-3xl font-bold text-cyan-300">{totalInstalls.toLocaleString()}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Total Uninstalls (last 30 days)</p>
                    <p className="text-3xl font-bold text-red-400">{totalUninstalls.toLocaleString()}</p>
                </div>
                {analytics.data[0]?.revenue !== undefined && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-400">Total Revenue (last 30 days)</p>
                        <p className="text-3xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">Daily Metrics (Last 30 Days)</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700/30">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Installs</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Uninstalls</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Active Users</th>
                            {analytics.data[0]?.revenue !== undefined && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                            )}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Errors</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {analytics.data.map((entry, index) => (
                            <tr key={index} className="hover:bg-gray-700/20">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{entry.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{entry.installs}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">{entry.uninstalls}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-300">{entry.activeUsers}</td>
                                {entry.revenue !== undefined && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">${entry.revenue.toFixed(2)}</td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">{entry.errors}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// --- Component: AuditLogViewer ---
export const AuditLogViewer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { currentUser } = useUser();
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedLogs = await mockApiService.fetchAuditLogs({ userId: currentUser.id, limit: 100 });
                setLogs(fetchedLogs);
            } catch (err: any) {
                setError(`Failed to fetch audit logs: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [currentUser.id]);

    const getLogMessage = (log: AuditLogEntry) => {
        const extName = log.details.extensionName || 'an extension';
        switch (log.action) {
            case 'INSTALL_EXTENSION': return `Installed ${extName}.`;
            case 'UNINSTALL_EXTENSION': return `Uninstalled ${extName}.`;
            case 'UPDATE_CONFIG': return `Updated configuration for ${extName}.`;
            case 'SUBMIT_REVIEW': return `Submitted a ${log.details.rating}-star review for ${extName}.`;
            case 'PUBLISH_EXTENSION': return `Published new extension: ${extName}.`;
            case 'UPDATE_EXTENSION': return `Updated published extension: ${extName}.`;
            case 'DELETE_EXTENSION': return `Deleted published extension: ${extName}.`;
            default: return `Performed action: ${log.action} on ${extName}.`;
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
                <h2 className="text-2xl font-bold text-white">Recent Activity (Audit Logs)</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
                    &times;
                </button>
            </div>
            {logs.length === 0 ? (
                <p className="text-gray-400">No recent activity found.</p>
            ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {logs.map(log => (
                        <div key={log.id} className="bg-gray-700/30 p-3 rounded-lg flex items-center gap-4">
                            <span className="text-xs text-gray-500 flex-shrink-0 w-24">{formatDate(log.timestamp)}</span>
                            <span className="text-sm text-gray-300 flex-grow">{getLogMessage(log)}</span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};


// --- Main View Components ---

// Extensions Marketplace View
export const MarketplaceView: React.FC<{
    onViewDetails: (ext: Extension) => void;
    onInstallSuccess: (ext: Extension) => void;
    onUninstallSuccess: (installedExt: InstalledExtension) => void;
    installedExtensions: InstalledExtension[];
}> = ({ onViewDetails, onInstallSuccess, onUninstallSuccess, installedExtensions }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [priceFilter, setPriceFilter] = useState<'free' | 'paid' | 'any'>('any');
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState<keyof Extension>('installCount');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const extensionsPerPage = 12;

    const { extensions, totalExtensions, loading, error } = useExtensions({
        query: searchQuery,
        category: selectedCategory,
        priceFilter,
        minRating,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: extensionsPerPage,
    });

    const totalPages = Math.ceil(totalExtensions / extensionsPerPage);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Extensions Marketplace</h2>

            <SearchFilterPanel
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
                priceFilter={priceFilter} setPriceFilter={setPriceFilter}
                minRating={minRating} setMinRating={setMinRating}
                sortBy={sortBy} setSortBy={setSortBy}
                sortOrder={sortOrder} setSortOrder={setSortOrder}
            />

            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && extensions.length === 0 && (
                <Card><p className="text-gray-400 p-4">No extensions found matching your criteria.</p></Card>
            )}

            {!loading && !error && extensions.length > 0 && (
                <>
                    <Card title="Recommended for You">
                        <p className="text-sm text-gray-400 mb-4">Based on your role as a developer, our AI suggests these extensions.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {extensions.filter(e => e.recommended).slice(0, 3).map(ext => (
                                <ExtensionCard
                                    key={ext.id}
                                    extension={ext}
                                    onViewDetails={onViewDetails}
                                    onInstall={onInstallSuccess}
                                    onUninstall={onUninstallSuccess}
                                    installed={installedExtensions.find(i => i.extensionId === ext.id)}
                                />
                            ))}
                        </div>
                    </Card>

                    <Card title="All Extensions">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {extensions.map(ext => (
                                <ExtensionCard
                                    key={ext.id}
                                    extension={ext}
                                    onViewDetails={onViewDetails}
                                    onInstall={onInstallSuccess}
                                    onUninstall={onUninstallSuccess}
                                    installed={installedExtensions.find(i => i.extensionId === ext.id)}
                                />
                            ))}
                        </div>
                        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </Card>
                </>
            )}
        </div>
    );
};

// Installed Extensions View
export const InstalledView: React.FC<{
    userId: string;
    onViewDetails: (ext: Extension) => void;
    onManageSettings: (installedExt: InstalledExtension) => void;
    onUninstallSuccess: (installedExt: InstalledExtension) => void;
    installedExtensions: InstalledExtension[];
    loading: boolean;
    error: string | null;
}> = ({ userId, onViewDetails, onManageSettings, onUninstallSuccess, installedExtensions, loading, error }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">My Installed Extensions</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && installedExtensions.length === 0 && (
                <Card><p className="text-gray-400 p-4">You haven't installed any extensions yet.</p></Card>
            )}
            {!loading && !error && installedExtensions.length > 0 && (
                <Card title="Currently Installed">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {installedExtensions.map(installedExt => {
                            const ext = MOCK_EXTENSIONS.find(e => e.id === installedExt.extensionId);
                            if (!ext) return null; // Defensive check
                            return (
                                <InstalledExtensionCard
                                    key={installedExt.id}
                                    installedExtension={installedExt}
                                    onUninstall={onUninstallSuccess}
                                    onManageSettings={onManageSettings}
                                />
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
};

// Developer Dashboard View
export const DeveloperDashboardView: React.FC<{
    developerId: string;
    onPublishNew: () => void;
    onEditExtension: (extId: string) => void;
    onViewAnalytics: (extId: string) => void;
    onViewDetails: (ext: Extension) => void;
}> = ({ developerId, onPublishNew, onEditExtension, onViewAnalytics, onViewDetails }) => {
    const { developerExtensions, loading, error, refreshDeveloperExtensions } = useDeveloperExtensions(developerId);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteExtension = async (extensionId: string) => {
        if (!window.confirm('Are you sure you want to delete this extension? This action cannot be undone.')) {
            return;
        }
        setDeletingId(extensionId);
        try {
            await mockApiService.deletePublishedExtension(extensionId, developerId);
            refreshDeveloperExtensions();
        } catch (err: any) {
            alert(`Failed to delete extension: ${err.message}`);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Developer Dashboard</h2>

            <Card className="flex justify-between items-center">
                <p className="text-gray-400">Manage your published extensions, track performance, and publish new ones.</p>
                <button
                    onClick={onPublishNew}
                    className="px-6 py-2 bg-green-600/50 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200"
                >
                    Publish New Extension
                </button>
            </Card>

            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && developerExtensions.length === 0 && (
                <Card><p className="text-gray-400 p-4">You haven't published any extensions yet. Start by publishing one!</p></Card>
            )}

            {!loading && !error && developerExtensions.length > 0 && (
                <Card title="Your Published Extensions">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {developerExtensions.map(devExt => {
                            const ext = MOCK_EXTENSIONS.find(e => e.id === devExt.id);
                            if (!ext) return null; // Should not happen with consistent mocks
                            return (
                                <DeveloperExtensionCard
                                    key={devExt.id}
                                    devExtension={devExt}
                                    onViewDetails={extId => onViewDetails(ext)} // Pass full extension for details modal
                                    onEditExtension={onEditExtension}
                                    onDeleteExtension={() => handleDeleteExtension(devExt.id)}
                                />
                            );
                        })}
                    </div>
                </Card>
            )}

            <Card title="Extension Analytics Overview">
                <p className="text-sm text-gray-400 mb-4">Select an extension above to view detailed analytics.</p>
                {/* Could add aggregated metrics here or a dropdown to select an extension */}
            </Card>

            <Card title="Audit Log for Developer Actions">
                <AuditLogViewer onClose={() => { /* No-op for this embedded viewer */ }} />
            </Card>
        </div>
    );
};

// --- Main ExtensionsView Component ---
export type CurrentView = 'marketplace' | 'installed' | 'developer' | 'publish' | 'edit' | 'analytics' | 'audit_logs';

const ExtensionsView: React.FC = () => {
    const { currentUser, setCurrentUser } = useUser();
    const [currentView, setCurrentView] = useState<CurrentView>('marketplace');
    const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
    const [selectedInstalledExtension, setSelectedInstalledExtension] = useState<InstalledExtension | null>(null);
    const [extensionToEditId, setExtensionToEditId] = useState<string | null>(null);
    const [extensionToAnalyzeId, setExtensionToAnalyzeId] = useState<string | null>(null);

    const { installedExtensions, loading: installedLoading, error: installedError, refreshInstalled } = useInstalledExtensions(currentUser.id);

    // Callbacks for various actions
    const handleViewDetails = (ext: Extension) => {
        setSelectedExtension(ext);
    };

    const handleInstallSuccess = useCallback((ext: Extension) => {
        refreshInstalled();
        // Optional: show a toast notification
        console.log(`Extension ${ext.name} installed successfully!`);
        setSelectedExtension(null); // Close details modal if open
    }, [refreshInstalled]);

    const handleUninstallSuccess = useCallback((installedExt: InstalledExtension) => {
        refreshInstalled();
        console.log(`Extension ${MOCK_EXTENSIONS.find(e => e.id === installedExt.extensionId)?.name} uninstalled successfully!`);
        setSelectedInstalledExtension(null); // Close settings modal if open
        setSelectedExtension(null); // Close details modal if open
    }, [refreshInstalled]);

    const handleManageSettings = (installedExt: InstalledExtension) => {
        setSelectedInstalledExtension(installedExt);
    };

    const handleSaveSettings = useCallback((updatedInstalledExt: InstalledExtension) => {
        refreshInstalled();
        setSelectedInstalledExtension(null); // Close settings modal
        console.log(`Settings for ${MOCK_EXTENSIONS.find(e => e.id === updatedInstalledExt.extensionId)?.name} saved!`);
    }, [refreshInstalled]);

    const handlePublishNew = () => {
        setCurrentView('publish');
    };

    const handlePublishSuccess = useCallback((ext: Extension) => {
        setCurrentView('developer');
        // A temporary solution for refreshing, would ideally be handled by DeveloperDashboardView itself
        // MOCK_DEVELOPER_EXTENSIONS needs to be updated directly here or passed down through context.
        // For simplicity in this massive mock, we'll let the user navigate and assume a refresh.
        alert(`Extension "${ext.name}" published successfully! It will now undergo review.`);
        // To trigger a refresh in DeveloperDashboardView, we can temporarily change the view
        // then change it back, forcing the hook to re-run.
        // Or simply add a forceRefresh prop/callback.
    }, []);

    const handleEditExtension = (extId: string) => {
        setExtensionToEditId(extId);
        setCurrentView('edit');
    };

    const handleEditSuccess = useCallback((ext: Extension) => {
        setCurrentView('developer');
        setExtensionToEditId(null);
        alert(`Extension "${ext.name}" updated successfully!`);
    }, []);

    const handleViewAnalytics = (extId: string) => {
        setExtensionToAnalyzeId(extId);
        setCurrentView('analytics');
    };

    // Render the selected view
    let content;
    switch (currentView) {
        case 'marketplace':
            content = (
                <MarketplaceView
                    onViewDetails={handleViewDetails}
                    onInstallSuccess={handleInstallSuccess}
                    onUninstallSuccess={handleUninstallSuccess}
                    installedExtensions={installedExtensions}
                />
            );
            break;
        case 'installed':
            content = (
                <InstalledView
                    userId={currentUser.id}
                    onViewDetails={handleViewDetails}
                    onManageSettings={handleManageSettings}
                    onUninstallSuccess={handleUninstallSuccess}
                    installedExtensions={installedExtensions}
                    loading={installedLoading}
                    error={installedError}
                />
            );
            break;
        case 'developer':
            if (currentUser.role !== 'developer') {
                content = <ErrorMessage message="You do not have permission to access the Developer Dashboard." />;
            } else {
                content = (
                    <DeveloperDashboardView
                        developerId={currentUser.id} // Assuming developerId is tied to userId for this mock
                        onPublishNew={handlePublishNew}
                        onEditExtension={handleEditExtension}
                        onViewAnalytics={handleViewAnalytics}
                        onViewDetails={handleViewDetails}
                    />
                );
            }
            break;
        case 'publish':
            if (currentUser.role !== 'developer') {
                content = <ErrorMessage message="You do not have permission to publish extensions." />;
            } else {
                content = (
                    <PublishExtensionForm
                        developerId={currentUser.id}
                        onSuccess={handlePublishSuccess}
                        onCancel={() => setCurrentView('developer')}
                    />
                );
            }
            break;
        case 'edit':
            if (currentUser.role !== 'developer' || !extensionToEditId) {
                content = <ErrorMessage message="Invalid access or extension not found for editing." />;
            } else {
                const ext = MOCK_EXTENSIONS.find(e => e.id === extensionToEditId);
                if (!ext || ext.developerInfo.id !== currentUser.id) {
                    content = <ErrorMessage message="You are not authorized to edit this extension." />;
                } else {
                    // This would ideally be a separate EditExtensionForm similar to Publish
                    content = (
                        <Card className="p-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Edit Extension: {ext.name}</h2>
                            <p className="text-gray-400">
                                This would be a detailed form for editing extension metadata, pricing, screenshots, etc.
                                For now, simulating success.
                            </p>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700/50">
                                <button
                                    onClick={() => setCurrentView('developer')}
                                    className="px-6 py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleEditSuccess(ext)}
                                    className="px-6 py-2 bg-cyan-600/50 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold"
                                >
                                    Save Changes (Mock)
                                </button>
                            </div>
                        </Card>
                    );
                }
            }
            break;
        case 'analytics':
            if (!extensionToAnalyzeId) {
                content = <ErrorMessage message="No extension selected for analytics." />;
            } else {
                content = <AnalyticsDashboard extensionId={extensionToAnalyzeId} onClose={() => setCurrentView('developer')} />;
            }
            break;
        case 'audit_logs':
            content = <AuditLogViewer onClose={() => setCurrentView('marketplace')} />; // Can be accessed from anywhere
            break;
        default:
            content = <ErrorMessage message="Unknown view." />;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
                <div className="flex items-center gap-4">
                    <img src="https://via.placeholder.com/40" alt="Logo" className="h-10 w-10 rounded-full" />
                    <span className="text-2xl font-bold text-cyan-400">MegaDashboard</span>
                </div>
                <div className="flex items-center gap-4">
                    <nav>
                        <ul className="flex space-x-4">
                            <li><button onClick={() => setCurrentView('marketplace')} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentView === 'marketplace' ? 'bg-cyan-600' : 'text-gray-400 hover:text-white'}`}>Marketplace</button></li>
                            <li><button onClick={() => setCurrentView('installed')} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentView === 'installed' ? 'bg-cyan-600' : 'text-gray-400 hover:text-white'}`}>Installed</button></li>
                            {currentUser.role === 'developer' && (
                                <li><button onClick={() => setCurrentView('developer')} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentView === 'developer' || currentView === 'publish' || currentView === 'edit' || currentView === 'analytics' ? 'bg-cyan-600' : 'text-gray-400 hover:text-white'}`}>Developer</button></li>
                            )}
                            <li><button onClick={() => setCurrentView('audit_logs')} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentView === 'audit_logs' ? 'bg-cyan-600' : 'text-gray-400 hover:text-white'}`}>Audit Logs</button></li>
                        </ul>
                    </nav>
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-gray-300 hover:text-white">
                            <img src="https://i.pravatar.cc/300" alt="User Avatar" className="h-8 w-8 rounded-full" />
                            <span className="text-sm">{currentUser.name} ({currentUser.role})</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
                            <button
                                onClick={() => setCurrentUser({ id: 'user-current', name: 'John Doe', role: 'standard_user' })}
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                            >
                                Switch to Standard User
                            </button>
                            <button
                                onClick={() => setCurrentUser({ id: 'dev-demobank', name: 'Developer Admin', role: 'developer' })}
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                            >
                                Switch to Developer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {content}

            {/* Modals */}
            {selectedExtension && (
                <ExtensionDetailsModal
                    extension={selectedExtension}
                    reviews={MOCK_REVIEWS.filter(r => r.extensionId === selectedExtension.id)} // Pass actual reviews
                    onClose={() => setSelectedExtension(null)}
                    onInstall={handleInstallSuccess}
                    onUninstall={handleUninstallSuccess}
                    installed={installedExtensions.find(i => i.extensionId === selectedExtension.id)}
                    onNewReview={(newReview) => {
                        // This updates the local state of reviews for the modal
                        setSelectedExtension(prev => prev ? { ...prev, rating: (prev.rating * MOCK_REVIEWS.filter(r => r.extensionId === prev.id).length + newReview.rating) / (MOCK_REVIEWS.filter(r => r.extensionId === prev.id).length + 1) } : null);
                        // The actual MOCK_REVIEWS array is updated in mockApiService.submitReview
                    }}
                />
            )}

            {selectedInstalledExtension && (
                <ExtensionSettingsModal
                    installedExtension={selectedInstalledExtension}
                    onClose={() => setSelectedInstalledExtension(null)}
                    onSave={handleSaveSettings}
                />
            )}
        </div>
    );
};

export default () => (
    <UserProvider>
        <ExtensionsView />
    </UserProvider>
);