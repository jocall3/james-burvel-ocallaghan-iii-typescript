import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Card from '../../Card';

// ===================================================================================
// TYPE DEFINITIONS FOR A REAL-WORLD APPLICATION
// ===================================================================================

export interface Developer {
    id: string;
    name: string;
    website: string;
    supportEmail: string;
    location: string;
    isVerified: boolean;
}

export interface Review {
    id: string;
    appId: number;
    author: string;
    avatarUrl: string;
    rating: number; // 1 to 5
    title: string;
    comment: string;
    date: string; // ISO 8601 format
    isVerifiedPurchase: boolean;
}

export interface Category {
    id: string;
    name: string;
    description: string;
}

export interface App {
    id: number;
    name: string;
    category: string;
    categoryId: string;
    installs: number;
    description: string;
    longDescription: string;
    icon: string; // SVG path data
    developerId: string;
    version: string;
    lastUpdated: string; // ISO 8601 format
    rating: number; // Average rating
    permissions: string[];
    screenshots: string[];
    tags: string[];
    pricing: 'Free' | 'Freemium' | 'Paid';
    featured: boolean;
}

export type SortOption = 'installs' | 'name' | 'rating' | 'newest';
export type ApiStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
export interface ApiError {
    message: string;
}

// ===================================================================================
// MOCK DATABASE & API SERVICE
// This simulates a real backend with a database and API endpoints.
// ===================================================================================

export const mockDevelopers: Developer[] = [
    { id: 'dev-001', name: 'QuantumLeap Solutions', website: 'https://quantumleap.dev', supportEmail: 'support@quantumleap.dev', location: 'San Francisco, USA', isVerified: true },
    { id: 'dev-002', name: 'ConnectFlow Inc.', website: 'https://connectflow.io', supportEmail: 'help@connectflow.io', location: 'New York, USA', isVerified: true },
    { id: 'dev-003', name: 'Insight BI Systems', website: 'https://insightbi.com', supportEmail: 'support@insightbi.com', location: 'London, UK', isVerified: true },
    { id: 'dev-004', name: 'SecureVault Co.', website: 'https://securevault.co', supportEmail: 'contact@securevault.co', location: 'Berlin, Germany', isVerified: false },
    { id: 'dev-005', name: 'PayStream Finance', website: 'https://paystream.finance', supportEmail: 'support@paystream.finance', location: 'Singapore', isVerified: true },
    { id: 'dev-006', name: 'HR Fusion', website: 'https://hrfusion.com', supportEmail: 'support@hrfusion.com', location: 'Toronto, Canada', isVerified: true },
    { id: 'dev-007', name: 'MarketSync', website: 'https://marketsync.ai', supportEmail: 'help@marketsync.ai', location: 'Tokyo, Japan', isVerified: true },
    { id: 'dev-008', name: 'Projectify', website: 'https://projectify.app', supportEmail: 'support@projectify.app', location: 'Sydney, Australia', isVerified: false },
    { id: 'dev-009', name: 'LegalEase', website: 'https://legalease.tech', supportEmail: 'contact@legalease.tech', location: 'Paris, France', isVerified: true },
    { id: 'dev-010', name: 'HealthMetrics', website: 'https://healthmetrics.io', supportEmail: 'support@healthmetrics.io', location: 'Boston, USA', isVerified: true },
];

export const mockCategories: Category[] = [
    { id: 'cat-01', name: 'Accounting', description: 'Tools for bookkeeping, invoicing, and financial management.' },
    { id: 'cat-02', name: 'Productivity', description: 'Apps to automate workflows and enhance team collaboration.' },
    { id: 'cat-03', name: 'Analytics', description: 'Business intelligence and data visualization tools.' },
    { id: 'cat-04', name: 'Security', description: 'Protect your financial data with advanced security apps.' },
    { id: 'cat-05', name: 'Payments', description: 'Integrate various payment gateways and manage transactions.' },
    { id: 'cat-06', name: 'Human Resources', description: 'Manage payroll, benefits, and employee data.' },
    { id: 'cat-07', name: 'Marketing', description: 'Tools for CRM, email marketing, and customer engagement.' },
    { id: 'cat-08', name: 'Project Management', description: 'Organize tasks, track progress, and manage projects.' },
    { id: 'cat-09', name: 'Legal & Compliance', description: 'Apps for contract management and regulatory compliance.' },
    { id: 'cat-10', name: 'Healthcare', description: 'Solutions for medical billing and patient data management.' },
];

export const mockApps: App[] = [
    // Existing Apps Enhanced
    { id: 1, name: 'QuantumBooks', category: 'Accounting', categoryId: 'cat-01', installs: 1200, rating: 4.8, developerId: 'dev-001', version: '2.5.1', lastUpdated: '2023-10-26T10:00:00Z', pricing: 'Freemium', featured: true, description: 'AI-powered accounting and invoicing for small businesses.', longDescription: 'QuantumBooks is a comprehensive accounting solution that leverages artificial intelligence to automate bookkeeping, invoicing, and expense tracking. It provides real-time financial reports, tax preparation assistance, and seamless integration with your bank accounts. Perfect for freelancers and small to medium-sized businesses looking to streamline their financial operations.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permissions: ['Read account balance and transaction history', 'Create and manage invoices', 'Initiate payments (with user approval)'], screenshots: ['/img/screenshots/qb1.png', '/img/screenshots/qb2.png', '/img/screenshots/qb3.png'], tags: ['accounting', 'invoicing', 'AI', 'finance'] },
    { id: 2, name: 'ConnectFlow', category: 'Productivity', categoryId: 'cat-02', installs: 2500, rating: 4.9, developerId: 'dev-002', version: '1.9.0', lastUpdated: '2023-11-01T14:30:00Z', pricing: 'Paid', featured: true, description: 'Automate workflows between Demo Bank and your favorite apps.', longDescription: 'ConnectFlow is the ultimate automation tool. Create powerful "flows" that connect Demo Bank to over 500 other applications like Slack, Google Sheets, Salesforce, and more. Automate notifications for large transactions, sync sales data to your accounting software, or create custom alerts without writing a single line of code.', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', permissions: ['Read transaction data', 'Access account holder information', 'Send notifications', 'API access to third-party services'], screenshots: ['/img/screenshots/cf1.png', '/img/screenshots/cf2.png'], tags: ['automation', 'workflow', 'integration', 'productivity'] },
    { id: 3, name: 'Insight BI', category: 'Analytics', categoryId: 'cat-03', installs: 850, rating: 4.6, developerId: 'dev-003', version: '3.2.0', lastUpdated: '2023-10-15T09:00:00Z', pricing: 'Paid', featured: false, description: 'Advanced business intelligence and reporting on your financial data.', longDescription: 'Transform your Demo Bank data into actionable insights. Insight BI offers powerful data visualization tools, customizable dashboards, and predictive analytics. Track cash flow, analyze spending patterns, and forecast revenue with stunning, easy-to-understand charts and graphs.', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z', permissions: ['Read-only access to all financial data', 'Aggregate and analyze transaction history'], screenshots: ['/img/screenshots/ib1.png', '/img/screenshots/ib2.png', '/img/screenshots/ib3.png', '/img/screenshots/ib4.png'], tags: ['analytics', 'reporting', 'BI', 'data visualization'] },
    
    // New Apps for a larger marketplace
    { id: 4, name: 'SecureVault', category: 'Security', categoryId: 'cat-04', installs: 3200, rating: 4.9, developerId: 'dev-004', version: '4.0.1', lastUpdated: '2023-11-05T12:00:00Z', pricing: 'Freemium', featured: true, description: 'Advanced fraud detection and account protection.', longDescription: 'SecureVault provides an extra layer of security for your Demo Bank account. Using machine learning, it analyzes your transaction patterns to detect and flag suspicious activity in real-time. Get instant alerts and freeze your account with a single tap if you suspect fraud.', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', permissions: ['Monitor transaction stream in real-time', 'Send security alerts', 'Temporarily lock account access'], screenshots: ['/img/screenshots/sv1.png', '/img/screenshots/sv2.png'], tags: ['security', 'fraud detection', 'protection', 'AI'] },
    { id: 5, name: 'PayStream', category: 'Payments', categoryId: 'cat-05', installs: 1500, rating: 4.7, developerId: 'dev-005', version: '1.5.0', lastUpdated: '2023-09-28T18:00:00Z', pricing: 'Free', featured: false, description: 'Accept payments from anyone, anywhere. Instantly.', longDescription: 'PayStream allows you to easily accept credit card, ACH, and international payments directly into your Demo Bank account. Create payment links, embed checkout forms on your website, or use our virtual terminal. No monthly fees, just a small per-transaction charge.', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', permissions: ['Create and manage payment requests', 'Deposit funds into accounts', 'Read customer information'], screenshots: ['/img/screenshots/ps1.png', '/img/screenshots/ps2.png', '/img/screenshots/ps3.png'], tags: ['payments', 'invoicing', 'ecommerce', 'credit card'] },
    { id: 6, name: 'HR Fusion', category: 'Human Resources', categoryId: 'cat-06', installs: 600, rating: 4.5, developerId: 'dev-006', version: '2.1.3', lastUpdated: '2023-10-20T11:45:00Z', pricing: 'Paid', featured: false, description: 'Streamline payroll and HR management.', longDescription: 'Connect HR Fusion to Demo Bank to automate payroll, tax filings, and benefits administration. Manage employee records, time tracking, and expense reimbursements all in one place, with seamless integration for direct deposits.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.004 3.004 0 014.288 0M10 16a3 3 0 11-6 0 3 3 0 016 0zm10-6a3 3 0 11-6 0 3 3 0 016 0zM7 10a3 3 0 11-6 0 3 3 0 016 0z', permissions: ['Initiate payroll payments', 'Read account balance for payroll funding', 'Manage employee bank details'], screenshots: [], tags: ['hr', 'payroll', 'benefits', 'employees'] },
    { id: 7, name: 'MarketSync', category: 'Marketing', categoryId: 'cat-07', installs: 1800, rating: 4.8, developerId: 'dev-007', version: '3.0.0', lastUpdated: '2023-11-08T16:20:00Z', pricing: 'Freemium', featured: false, description: 'Connect sales data to your marketing campaigns.', longDescription: 'MarketSync links your Demo Bank transaction data with platforms like Mailchimp, HubSpot, and Facebook Ads. Automatically segment customers based on their spending habits, trigger targeted email campaigns after a purchase, and accurately measure the ROI of your marketing efforts.', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z', permissions: ['Read transaction data for marketing analysis', 'Access customer contact information'], screenshots: ['/img/screenshots/ms1.png'], tags: ['marketing', 'crm', 'automation', 'roi'] },
    { id: 8, name: 'Projectify', category: 'Project Management', categoryId: 'cat-08', installs: 950, rating: 4.4, developerId: 'dev-008', version: '2.4.5', lastUpdated: '2023-10-18T08:00:00Z', pricing: 'Paid', featured: false, description: 'Track project budgets and expenses seamlessly.', longDescription: 'Integrate your project management with your finances. Projectify links with your Demo Bank account to automatically track expenses against project budgets. Assign transactions to tasks, generate real-time budget reports, and simplify client billing.', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', permissions: ['Read transaction data', 'Categorize transactions', 'Generate financial reports'], screenshots: ['/img/screenshots/pr1.png', '/img/screenshots/pr2.png'], tags: ['project management', 'budgeting', 'expenses'] },
    { id: 9, name: 'LegalEase', category: 'Legal & Compliance', categoryId: 'cat-09', installs: 400, rating: 4.7, developerId: 'dev-009', version: '1.2.0', lastUpdated: '2023-09-15T14:00:00Z', pricing: 'Paid', featured: false, description: 'Automate contract management and compliance.', longDescription: 'LegalEase helps businesses manage legal documents and stay compliant. Connect with Demo Bank to verify financial details for contracts, track payments related to legal agreements, and generate compliance reports with up-to-date financial data.', icon: 'M9 13h6M11 17h2m-5-14l-1 4h12l-1-4M4 11h16M5 15h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z', permissions: ['Read account holder information for verification', 'Read specific transaction details for auditing'], screenshots: ['/img/screenshots/le1.png'], tags: ['legal', 'compliance', 'contracts', 'automation'] },
    { id: 10, name: 'HealthMetrics', category: 'Healthcare', categoryId: 'cat-10', installs: 250, rating: 4.3, developerId: 'dev-010', version: '1.0.5', lastUpdated: '2023-08-30T10:00:00Z', pricing: 'Paid', featured: false, description: 'Simplify medical billing and insurance claims.', longDescription: 'HealthMetrics is designed for healthcare providers. It integrates with Demo Bank to streamline patient billing, process insurance claims, and manage payments. It helps reduce administrative overhead and ensures HIPAA-compliant financial transactions.', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z', permissions: ['Process payments from patients and insurers', 'Manage healthcare-related financial data', 'Generate billing reports'], screenshots: ['/img/screenshots/hm1.png', '/img/screenshots/hm2.png'], tags: ['healthcare', 'medical billing', 'hipaa'] },
    // ... adding more apps to reach a substantial number
    { id: 11, name: 'CarbonTrack', category: 'Analytics', categoryId: 'cat-03', installs: 550, rating: 4.8, developerId: 'dev-003', version: '1.3.0', lastUpdated: '2023-11-10T11:00:00Z', pricing: 'Freemium', featured: false, description: 'Monitor the carbon footprint of your spending.', longDescription: 'CarbonTrack analyzes your Demo Bank transactions to estimate the carbon footprint of your purchases. Get insights into your environmental impact, discover sustainable alternatives, and contribute to carbon offset projects directly from the app.', icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0121 12c0 4.418-3.582 8-8 8h-2.657zM22 12a10 10 0 11-20 0 10 10 0 0120 0z', permissions: ['Read transaction data for analysis'], screenshots: [], tags: ['sustainability', 'carbon footprint', 'eco-friendly'] },
    { id: 12, name: 'SubscriptionShark', category: 'Productivity', categoryId: 'cat-02', installs: 4500, rating: 4.9, developerId: 'dev-002', version: '2.2.0', lastUpdated: '2023-10-29T19:00:00Z', pricing: 'Free', featured: true, description: 'Track and manage all your recurring subscriptions.', longDescription: 'Never get surprised by a subscription charge again. SubscriptionShark scans your transaction history to identify all your recurring payments. It lists them in a clean dashboard, reminds you before a payment is due, and lets you cancel unwanted subscriptions with one click.', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z', permissions: ['Read transaction history to identify subscriptions'], screenshots: ['/img/screenshots/ss1.png', '/img/screenshots/ss2.png'], tags: ['subscriptions', 'money management', 'productivity'] },
];

export const mockReviews: Review[] = [
    { id: 'rev-001', appId: 1, author: 'Alice', avatarUrl: '/avatars/alice.png', rating: 5, title: 'Game Changer!', comment: 'QuantumBooks automated everything for me. My accounting is now effortless. Highly recommend!', date: '2023-10-20T14:48:00Z', isVerifiedPurchase: true },
    { id: 'rev-002', appId: 1, author: 'Bob', avatarUrl: '/avatars/bob.png', rating: 4, title: 'Very Solid App', comment: 'Good features, but the UI could be a bit more intuitive. Still, it saves me a lot of time.', date: '2023-10-18T10:22:00Z', isVerifiedPurchase: true },
    { id: 'rev-003', appId: 2, author: 'Charlie', avatarUrl: '/avatars/charlie.png', rating: 5, title: 'Incredibly Powerful', comment: 'The possibilities with ConnectFlow are endless. I have automated so many parts of my business.', date: '2023-11-02T09:15:00Z', isVerifiedPurchase: true },
    { id: 'rev-004', appId: 3, author: 'Diana', avatarUrl: '/avatars/diana.png', rating: 5, title: 'Beautiful Visualizations', comment: 'Finally, I can actually understand my financial data. The charts are amazing.', date: '2023-10-16T11:05:00Z', isVerifiedPurchase: true },
    { id: 'rev-005', appId: 4, author: 'Eve', avatarUrl: '/avatars/eve.png', rating: 5, title: 'Peace of Mind', comment: 'I feel so much safer with SecureVault watching over my account. The instant alerts are fantastic.', date: '2023-11-06T18:30:00Z', isVerifiedPurchase: true },
    { id: 'rev-006', appId: 1, author: 'Frank', avatarUrl: '/avatars/frank.png', rating: 4, title: 'Good but needs more integrations', comment: 'I love the core product, but I wish it connected to my CRM.', date: '2023-09-11T12:00:00Z', isVerifiedPurchase: false },
    { id: 'rev-007', appId: 2, author: 'Grace', avatarUrl: '/avatars/grace.png', rating: 5, title: 'A Must-Have for Efficiency', comment: 'If you want to save time, get ConnectFlow. It paid for itself in the first week.', date: '2023-10-25T16:45:00Z', isVerifiedPurchase: true },
    // ... many more reviews can be added here
];


export const MockApiService = {
    fetchPaginatedApps: async ({ page = 1, limit = 9, categoryId, searchTerm, sortBy }: { page: number; limit: number; categoryId?: string; searchTerm?: string; sortBy?: SortOption }): Promise<{ apps: App[]; total: number }> => {
        console.log(`Fetching apps: page=${page}, limit=${limit}, categoryId=${categoryId}, searchTerm=${searchTerm}, sortBy=${sortBy}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let filteredApps = [...mockApps];

                    if (categoryId && categoryId !== 'all') {
                        filteredApps = filteredApps.filter(app => app.categoryId === categoryId);
                    }

                    if (searchTerm) {
                        const lowercasedTerm = searchTerm.toLowerCase();
                        filteredApps = filteredApps.filter(app =>
                            app.name.toLowerCase().includes(lowercasedTerm) ||
                            app.description.toLowerCase().includes(lowercasedTerm) ||
                            app.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
                        );
                    }

                    // Sorting logic
                    filteredApps.sort((a, b) => {
                        switch (sortBy) {
                            case 'installs':
                                return b.installs - a.installs;
                            case 'rating':
                                return b.rating - a.rating;
                            case 'newest':
                                return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
                            case 'name':
                            default:
                                return a.name.localeCompare(b.name);
                        }
                    });

                    const total = filteredApps.length;
                    const paginatedApps = filteredApps.slice((page - 1) * limit, page * limit);

                    resolve({ apps: paginatedApps, total });
                } catch (error) {
                    reject({ message: 'Failed to fetch apps.' });
                }
            }, 800); // Simulate network delay
        });
    },

    fetchAppDetails: async (appId: number): Promise<{ app: App; developer: Developer; reviews: Review[] }> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const app = mockApps.find(a => a.id === appId);
                if (!app) {
                    return reject({ message: `App with ID ${appId} not found.` });
                }
                const developer = mockDevelopers.find(d => d.id === app.developerId);
                const reviews = mockReviews.filter(r => r.appId === appId);
                if (!developer) {
                     return reject({ message: `Developer for App ID ${appId} not found.` });
                }
                resolve({ app, developer, reviews });
            }, 500);
        });
    },

    fetchCategories: async (): Promise<Category[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(mockCategories);
            }, 300);
        });
    },

    installApp: async (appId: number): Promise<{ success: boolean }> => {
        console.log(`Installing app ${appId}...`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1200);
        });
    },

    uninstallApp: async (appId: number): Promise<{ success: boolean }> => {
        console.log(`Uninstalling app ${appId}...`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true });
            }, 700);
        });
    },
};

// ===================================================================================
// UTILITY/HELPER FUNCTIONS
// ===================================================================================

export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export const formatInstalls = (installs: number): string => {
    if (installs >= 1000000) {
        return `${(installs / 1000000).toFixed(1)}m`;
    }
    if (installs >= 1000) {
        return `${(installs / 1000).toFixed(1)}k`;
    }
    return installs.toString();
};

export const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

// ===================================================================================
// REUSABLE UI COMPONENTS
// These components are self-contained and could be moved to separate files.
// ===================================================================================

export const AppIcon: React.FC<{ icon: string; className?: string }> = ({ icon, className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
);

export const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
    </div>
);

export const RatingStars: React.FC<{ rating: number; totalStars?: number }> = ({ rating, totalStars = 5 }) => (
    <div className="flex items-center">
        {[...Array(totalStars)].map((_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ))}
    </div>
);

export const AppCard: React.FC<{ app: App; onInstall: (appId: number) => void; onUninstall: (appId: number) => void; isInstalled: boolean; isProcessing: boolean; onClick: (app: App) => void }> = ({ app, onInstall, onUninstall, isInstalled, isProcessing, onClick }) => {
    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isInstalled) {
            onUninstall(app.id);
        } else {
            onInstall(app.id);
        }
    };
    
    return (
        <Card variant="interactive" className="flex flex-col cursor-pointer" onClick={() => onClick(app)}>
            <div className="flex-grow">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-300 flex-shrink-0">
                        <AppIcon icon={app.icon} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                        <p className="text-xs text-cyan-400">{app.category}</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-4 h-10 overflow-hidden">{app.description}</p>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                    <RatingStars rating={app.rating} />
                    <p className="text-xs text-gray-500">({formatInstalls(app.installs)})</p>
                </div>
                <button
                    onClick={handleButtonClick}
                    disabled={isProcessing}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors duration-200 ${
                        isProcessing
                            ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                            : isInstalled
                            ? 'bg-red-900/50 hover:bg-red-800/60 text-red-300'
                            : 'bg-gray-600/50 hover:bg-gray-600 text-white'
                    }`}
                >
                    {isProcessing ? '...' : isInstalled ? 'Uninstall' : 'Install'}
                </button>
            </div>
        </Card>
    );
};

export const AppDetailModal: React.FC<{
    app: App | null;
    developer: Developer | null;
    reviews: Review[];
    isOpen: boolean;
    onClose: () => void;
    onInstall: (appId: number) => void;
    onUninstall: (appId: number) => void;
    isInstalled: boolean;
    isProcessing: boolean;
}> = ({ app, developer, reviews, isOpen, onClose, onInstall, onUninstall, isInstalled, isProcessing }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };
    
    if (!isOpen || !app) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div ref={modalRef} className="bg-gray-800/90 border border-gray-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-700 flex justify-between items-start">
                    <div className="flex items-start gap-5">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-300 flex-shrink-0">
                            <AppIcon icon={app.icon} className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">{app.name}</h2>
                            <p className="text-sm text-cyan-400">by {developer?.name}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <RatingStars rating={app.rating} />
                                <span className="text-sm text-gray-400">{app.rating.toFixed(1)} stars</span>
                                <span className="text-sm text-gray-400">{formatInstalls(app.installs)} installs</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Description</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{app.longDescription}</p>
                            </div>

                            {app.screenshots.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Screenshots</h3>
                                    <div className="flex gap-4 overflow-x-auto p-1">
                                        {app.screenshots.map((src, index) => (
                                            <img key={index} src={src} alt={`Screenshot ${index + 1}`} className="h-40 rounded-md border border-gray-700" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">Reviews ({reviews.length})</h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-gray-900/50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <img src={review.avatarUrl} alt={review.author} className="w-8 h-8 rounded-full" />
                                                    <span className="font-semibold text-white">{review.author}</span>
                                                    {review.isVerifiedPurchase && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Verified</span>}
                                                </div>
                                                <span className="text-xs text-gray-500">{timeAgo(review.date)}</span>
                                            </div>
                                            <RatingStars rating={review.rating} />
                                            <h4 className="font-semibold text-gray-200 mt-1">{review.title}</h4>
                                            <p className="text-sm text-gray-400 mt-1">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <button
                                    onClick={() => isInstalled ? onUninstall(app.id) : onInstall(app.id)}
                                    disabled={isProcessing}
                                    className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                        isProcessing
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : isInstalled
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                                    }`}
                                >
                                    {isProcessing ? 'Processing...' : isInstalled ? 'Uninstall App' : 'Install App'}
                                </button>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Information</h3>
                                <ul className="text-sm text-gray-400 space-y-2">
                                    <li className="flex justify-between"><span>Version:</span> <span className="text-gray-200">{app.version}</span></li>
                                    <li className="flex justify-between"><span>Updated:</span> <span className="text-gray-200">{timeAgo(app.lastUpdated)}</span></li>
                                    <li className="flex justify-between"><span>Pricing:</span> <span className="text-gray-200">{app.pricing}</span></li>
                                    <li className="flex justify-between"><span>Category:</span> <span className="text-gray-200">{app.category}</span></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Permissions Required</h3>
                                <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
                                    {app.permissions.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">Developer</h3>
                                <ul className="text-sm text-gray-400 space-y-2">
                                    <li>{developer?.name} {developer?.isVerified && <span className="text-xs text-blue-300">(Verified)</span>}</li>
                                    <li><a href={developer?.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Website</a></li>
                                    <li><a href={`mailto:${developer?.supportEmail}`} className="text-cyan-400 hover:underline">Support</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CategorySidebar: React.FC<{
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => {
    return (
        <Card className="w-full md:w-64 flex-shrink-0">
            <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
                <li>
                    <button 
                        onClick={() => onSelectCategory('all')} 
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    >
                        All Apps
                    </button>
                </li>
                {categories.map(cat => (
                    <li key={cat.id}>
                        <button 
                            onClick={() => onSelectCategory(cat.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selectedCategory === cat.id ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                            {cat.name}
                        </button>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export const Pagination: React.FC<{
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700/50 rounded-md disabled:opacity-50 hover:bg-gray-600"
            >
                Prev
            </button>
            {pageNumbers.map(num => (
                <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    className={`px-3 py-1 rounded-md ${currentPage === num ? 'bg-cyan-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600'}`}
                >
                    {num}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700/50 rounded-md disabled:opacity-50 hover:bg-gray-600"
            >
                Next
            </button>
        </div>
    );
};


// ===================================================================================
// MAIN MARKETPLACE VIEW COMPONENT
// This is the orchestrator component that ties everything together.
// ===================================================================================

const DemoBankAppMarketplaceView: React.FC = () => {
    // State for app data and UI status
    const [apps, setApps] = useState<App[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [totalApps, setTotalApps] = useState(0);
    const [status, setStatus] = useState<ApiStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    // State for filtering, sorting, and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<SortOption>('installs');
    const [currentPage, setCurrentPage] = useState(1);
    const APPS_PER_PAGE = 9;

    // State for app installation management
    const [installedApps, setInstalledApps] = useState<Set<number>>(new Set([2])); // Pre-install one app
    const [processingAppId, setProcessingAppId] = useState<number | null>(null);

    // State for the modal detail view
    const [selectedApp, setSelectedApp] = useState<App | null>(null);
    const [selectedAppDetails, setSelectedAppDetails] = useState<{ developer: Developer; reviews: Review[] } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState<ApiStatus>('idle');
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch categories on component mount
    useEffect(() => {
        MockApiService.fetchCategories()
            .then(setCategories)
            .catch(() => console.error("Failed to fetch categories"));
    }, []);

    // Fetch apps whenever filters or page change
    useEffect(() => {
        const fetchApps = async () => {
            setStatus('loading');
            setError(null);
            try {
                const response = await MockApiService.fetchPaginatedApps({
                    page: currentPage,
                    limit: APPS_PER_PAGE,
                    categoryId: selectedCategory,
                    searchTerm: debouncedSearchTerm,
                    sortBy,
                });
                setApps(response.apps);
                setTotalApps(response.total);
                setStatus('succeeded');
            } catch (err) {
                const apiError = err as ApiError;
                setError(apiError.message);
                setStatus('failed');
            }
        };

        fetchApps();
    }, [currentPage, selectedCategory, debouncedSearchTerm, sortBy]);

    // Handlers for user interactions
    const handleCategoryChange = useCallback((categoryId: string) => {
        setSelectedCategory(categoryId);
        setCurrentPage(1);
    }, []);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortOption);
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleInstall = useCallback(async (appId: number) => {
        setProcessingAppId(appId);
        try {
            await MockApiService.installApp(appId);
            setInstalledApps(prev => new Set(prev).add(appId));
        } catch (e) {
            console.error(`Failed to install app ${appId}`);
        } finally {
            setProcessingAppId(null);
        }
    }, []);

    const handleUninstall = useCallback(async (appId: number) => {
        setProcessingAppId(appId);
        try {
            await MockApiService.uninstallApp(appId);
            setInstalledApps(prev => {
                const newSet = new Set(prev);
                newSet.delete(appId);
                return newSet;
            });
        } catch (e) {
            console.error(`Failed to uninstall app ${appId}`);
        } finally {
            setProcessingAppId(null);
        }
    }, []);

    const openAppModal = useCallback(async (app: App) => {
        setSelectedApp(app);
        setIsModalOpen(true);
        setModalStatus('loading');
        try {
            const details = await MockApiService.fetchAppDetails(app.id);
            setSelectedAppDetails(details);
            setModalStatus('succeeded');
        } catch (e) {
            setModalStatus('failed');
        }
    }, []);

    const closeAppModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedApp(null);
        setSelectedAppDetails(null);
    }, []);
    
    const featuredApps = useMemo(() => mockApps.filter(app => app.featured).slice(0, 3), []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank App Marketplace</h2>
                <p className="text-gray-400 mt-2">Extend the power of Demo Bank by connecting to third-party applications. All apps are reviewed for security and compliance.</p>
            </div>
            
            {/* Featured Apps Section */}
            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">Featured Apps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredApps.map(app => (
                        <AppCard
                            key={`featured-${app.id}`}
                            app={app}
                            onInstall={handleInstall}
                            onUninstall={handleUninstall}
                            isInstalled={installedApps.has(app.id)}
                            isProcessing={processingAppId === app.id}
                            onClick={openAppModal}
                        />
                    ))}
                </div>
            </Card>

            {/* Main Marketplace Content */}
            <div className="flex flex-col md:flex-row gap-8">
                <CategorySidebar 
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleCategoryChange}
                />
                
                <div className="flex-grow">
                    {/* Search and Sort Controls */}
                    <Card className="mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <input
                                type="text"
                                placeholder="Search apps..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full sm:w-2/3 bg-gray-900/50 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                            <select
                                value={sortBy}
                                onChange={handleSortChange}
                                className="w-full sm:w-1/3 bg-gray-900/50 border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            >
                                <option value="installs">Most Installs</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                                <option value="name">Alphabetical</option>
                            </select>
                        </div>
                    </Card>

                    {/* App Grid */}
                    {status === 'loading' && <LoadingSpinner />}
                    {status === 'failed' && <p className="text-red-400 text-center">{error}</p>}
                    {status === 'succeeded' && (
                        apps.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {apps.map(app => (
                                        <AppCard
                                            key={app.id}
                                            app={app}
                                            onInstall={handleInstall}
                                            onUninstall={handleUninstall}
                                            isInstalled={installedApps.has(app.id)}
                                            isProcessing={processingAppId === app.id}
                                            onClick={openAppModal}
                                        />
                                    ))}
                                </div>
                                <Pagination 
                                    currentPage={currentPage}
                                    totalItems={totalApps}
                                    itemsPerPage={APPS_PER_PAGE}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <Card>
                                <p className="text-center text-gray-400">No apps found matching your criteria.</p>
                            </Card>
                        )
                    )}
                </div>
            </div>

            {/* App Detail Modal */}
            <AppDetailModal
                app={selectedApp}
                developer={selectedAppDetails?.developer ?? null}
                reviews={selectedAppDetails?.reviews ?? []}
                isOpen={isModalOpen}
                onClose={closeAppModal}
                onInstall={handleInstall}
                onUninstall={handleUninstall}
                isInstalled={selectedApp ? installedApps.has(selectedApp.id) : false}
                isProcessing={selectedApp ? processingAppId === selectedApp.id : false}
            />
        </div>
    );
};

export default DemoBankAppMarketplaceView;