import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// --- START NEW INTERFACES & MOCK DATA ---
/**
 * Represents a single affiliate partner in the program.
 */
export interface Affiliate {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'pending' | 'suspended' | 'deactivated';
    joinDate: string; // ISO date string
    lastLogin: string; // ISO date string
    referralCode: string;
    trackingLink: string;
    paymentMethod: 'paypal' | 'bank_transfer' | 'crypto';
    paymentDetails: string; // partial for display, e.g., "paypal@example.com" or "Bank XXXX-XXXX-1234"
    commissionRate: number; // percentage, e.g., 0.15 for 15%
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    totalReferrals: number; // All referrals, regardless of conversion
    totalConversions: number; // Referrals that converted to a customer
    conversionRate: number; // (totalConversions / totalReferrals) * 100
    totalCommissionEarned: number; // Lifetime earnings
    totalCommissionPaid: number; // Lifetime paid out
    balanceDue: number; // Outstanding balance to be paid
    notes?: string;
    website?: string;
    socialMedia?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        youtube?: string;
    };
    productsPromoted?: string[]; // e.g., ['Checking Account', 'Savings Account', 'Credit Card']
}

/**
 * Represents a single referral made by an affiliate.
 */
export interface Referral {
    id: string;
    affiliateId: string;
    customerId: string; // ID of the referred customer
    customerName: string;
    referralDate: string; // ISO date string
    conversionDate?: string; // ISO date string, if converted
    status: 'pending' | 'converted' | 'rejected';
    commissionAmount: number; // Commission earned for this specific referral
    productPurchased?: string; // e.g., 'Premium Checking Account'
    value: number; // Value of the product/service purchased
    notes?: string;
}

/**
 * Represents a commission payout transaction to an affiliate.
 */
export interface CommissionPayout {
    id: string;
    affiliateId: string;
    amount: number;
    payoutDate: string; // ISO date string
    status: 'pending' | 'paid' | 'failed';
    paymentMethod: 'paypal' | 'bank_transfer' | 'crypto';
    transactionId?: string; // External transaction ID from payment gateway
    notes?: string;
}

/**
 * Represents a marketing campaign created or tracked by an affiliate.
 */
export interface AffiliateCampaign {
    id: string;
    affiliateId: string;
    name: string;
    startDate: string; // ISO date string
    endDate?: string; // ISO date string
    status: 'active' | 'paused' | 'completed';
    targetAudience?: string;
    promotionChannels?: string[]; // e.g., ['Blog', 'Social Media', 'Email List']
    trackingParameters?: { [key: string]: string }; // UTM parameters, etc.
    impressions?: number;
    clicks?: number;
    referralsGenerated?: number;
    conversionsGenerated?: number;
    budget?: number;
    notes?: string;
}

/**
 * Represents a marketing asset provided to affiliates.
 */
export interface MarketingAsset {
    id: string;
    name: string;
    type: 'banner' | 'email_template' | 'social_media_post' | 'video' | 'logo';
    category: 'branding' | 'product_specific' | 'promotional';
    description: string;
    fileUrl: string;
    thumbnailUrl?: string;
    size?: string; // e.g., "728x90", "1200x628"
    downloadCount: number;
    createdAt: string; // ISO date string
    lastUpdated: string; // ISO date string
}

/**
 * Represents an outreach message sent or drafted.
 */
export interface OutreachMessage {
    id: string;
    recipient: string; // Email or affiliate name
    subject: string;
    body: string;
    type: 'prospect' | 'existing_affiliate_update' | 'custom';
    status: 'draft' | 'sent' | 'failed';
    sentDate?: string; // ISO date string
    authorId: string; // ID of the user who sent/drafted
}

/**
 * Represents the configuration for different affiliate tiers.
 */
export interface AffiliateTierConfig {
    name: 'bronze' | 'silver' | 'gold' | 'platinum';
    minConversions: number;
    minCommissionRate: number; // e.g., 0.10
    maxCommissionRate: number; // e.g., 0.25
    benefits: string[];
}

/**
 * Global program settings.
 */
export interface ProgramSettings {
    id: string;
    defaultCommissionRate: number;
    minimumPayoutThreshold: number; // Minimum amount before a payout is triggered
    payoutFrequency: 'weekly' | 'bi-weekly' | 'monthly';
    cookieDurationDays: number; // How long referral cookies last
    welcomeEmailTemplateId?: string;
    termsAndConditionsUrl: string;
    contactEmail: string;
    supportPhone?: string;
    currency: string;
    autoApproveAffiliates: boolean;
}

// Helper to generate a random date within a range
const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Helper to generate a random number within a range
const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate more realistic mock data
const generateMockAffiliates = (count: number): Affiliate[] => {
    const affiliates: Affiliate[] = [];
    const names = [
        'Fintech Weekly', 'The AI Investor', 'Future Finance Blog', 'Crypto Insights',
        'Money Makers Hub', 'Smart Savings Daily', 'Wealth Wisdom', 'Digital Dollar Digest',
        'Investment Guru', 'Passive Income Pro', 'Banking Buzz', 'Credit Card King',
        'Loan Lookout', 'Mortgage Mavens', 'Stock Savvy', 'Forex Focus', 'Econ Explainer',
        'Global Growth Guide', 'Budget Boss', 'Debt Destroyer', 'Blockchain Bulletin',
        'Fund Flow News', 'Risk & Reward', 'Capital Connect', 'Market Mastery'
    ];
    const domains = [
        'fintechweekly.com', 'aiinvestor.com', 'futurefinance.blog', 'cryptoinsights.net',
        'moneymakershub.org', 'smartsavingsdaily.co', 'wealthwisdom.info', 'digitaldollardigest.biz',
        'investmentguru.app', 'passiveincomepro.io', 'bankingbuzz.club', 'creditcardking.xyz'
    ];
    const tiers: ('bronze' | 'silver' | 'gold' | 'platinum')[] = ['bronze', 'silver', 'gold', 'platinum'];
    const products = ['Checking Account', 'Savings Account', 'Credit Card', 'Investment Platform', 'Personal Loan'];

    for (let i = 0; i < count; i++) {
        const id = `aff-${String(i + 1).padStart(3, '0')}`;
        const name = names[i % names.length];
        const joinDate = getRandomDate(new Date(2020, 0, 1), new Date());
        const totalReferrals = getRandomInt(100, 5000);
        const totalConversions = getRandomInt(totalReferrals * 0.05, totalReferrals * 0.25);
        const conversionRate = totalReferrals > 0 ? parseFloat(((totalConversions / totalReferrals) * 100).toFixed(2)) : 0;
        const commissionRate = parseFloat((0.05 + Math.random() * 0.15).toFixed(2)); // 5% to 20%
        const totalCommissionEarned = totalConversions * getRandomInt(50, 200); // Avg commission per conversion
        const totalCommissionPaid = getRandomInt(totalCommissionEarned * 0.5, totalCommissionEarned * 0.95);
        const balanceDue = totalCommissionEarned - totalCommissionPaid;
        const tier = tiers[getRandomInt(0, tiers.length - 1)];

        affiliates.push({
            id,
            name,
            email: `${name.toLowerCase().replace(/ /g, '')}@${domains[i % domains.length]}`,
            status: ['active', 'active', 'active', 'pending', 'suspended'][getRandomInt(0, 4)] as 'active' | 'pending' | 'suspended' | 'deactivated',
            joinDate: joinDate,
            lastLogin: getRandomDate(new Date(joinDate), new Date()),
            referralCode: `DEMO${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            trackingLink: `https://demobank.com/ref?code=${id}`,
            paymentMethod: ['paypal', 'bank_transfer'][getRandomInt(0, 1)] as 'paypal' | 'bank_transfer',
            paymentDetails: i % 2 === 0 ? `paypal_${id}@example.com` : `Bank XXXX-XXXX-${String(getRandomInt(1000, 9999))}`,
            commissionRate: commissionRate,
            tier: tier,
            totalReferrals: totalReferrals,
            totalConversions: totalConversions,
            conversionRate: conversionRate,
            totalCommissionEarned: parseFloat(totalCommissionEarned.toFixed(2)),
            totalCommissionPaid: parseFloat(totalCommissionPaid.toFixed(2)),
            balanceDue: parseFloat(balanceDue.toFixed(2)),
            notes: i % 5 === 0 ? `Highly engaged partner. Strong social media presence.` : undefined,
            website: `https://${domains[i % domains.length]}`,
            socialMedia: {
                twitter: i % 3 === 0 ? `@${name.toLowerCase().replace(/ /g, '')}` : undefined,
                linkedin: i % 4 === 0 ? `linkedin.com/in/${name.toLowerCase().replace(/ /g, '')}` : undefined,
            },
            productsPromoted: Array.from({ length: getRandomInt(1, 3) }).map(() => products[getRandomInt(0, products.length - 1)]),
        });
    }
    return affiliates;
};

const MOCK_AFFILIATES_DATA: Affiliate[] = generateMockAffiliates(50); // Generate 50 mock affiliates

const generateMockReferrals = (affiliates: Affiliate[], count: number): Referral[] => {
    const referrals: Referral[] = [];
    const customerNames = ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank White', 'Grace Hall', 'Henry Green'];
    const products = ['Checking Account', 'Savings Account', 'Credit Card', 'Investment Platform', 'Personal Loan'];

    for (let i = 0; i < count; i++) {
        const affiliate = affiliates[getRandomInt(0, affiliates.length - 1)];
        const referralDate = getRandomDate(new Date(affiliate.joinDate), new Date());
        const status = ['pending', 'converted', 'rejected'][getRandomInt(0, 2)] as 'pending' | 'converted' | 'rejected';
        const conversionDate = status === 'converted' ? getRandomDate(new Date(referralDate), new Date()) : undefined;
        const value = getRandomInt(100, 10000); // Value of the referred customer's initial transaction/product
        const commissionAmount = status === 'converted' ? parseFloat((value * affiliate.commissionRate).toFixed(2)) : 0;

        referrals.push({
            id: `ref-${String(i + 1).padStart(5, '0')}`,
            affiliateId: affiliate.id,
            customerId: `cust-${Math.random().toString(36).substring(2, 10)}`,
            customerName: customerNames[getRandomInt(0, customerNames.length - 1)],
            referralDate: referralDate,
            conversionDate: conversionDate,
            status: status,
            commissionAmount: commissionAmount,
            productPurchased: products[getRandomInt(0, products.length - 1)],
            value: value,
        });
    }
    return referrals;
};

const MOCK_REFERRALS_DATA: Referral[] = generateMockReferrals(MOCK_AFFILIATES_DATA, 500); // 500 mock referrals

const generateMockPayouts = (affiliates: Affiliate[], count: number): CommissionPayout[] => {
    const payouts: CommissionPayout[] = [];
    for (let i = 0; i < count; i++) {
        const affiliate = affiliates[getRandomInt(0, affiliates.length - 1)];
        const amount = parseFloat((affiliate.totalCommissionEarned * (0.05 + Math.random() * 0.2)).toFixed(2)); // Payouts are chunks of earned commission
        const payoutDate = getRandomDate(new Date(affiliate.joinDate), new Date());
        payouts.push({
            id: `pay-${String(i + 1).padStart(5, '0')}`,
            affiliateId: affiliate.id,
            amount: amount,
            payoutDate: payoutDate,
            status: ['paid', 'paid', 'pending', 'failed'][getRandomInt(0, 3)] as 'pending' | 'paid' | 'failed',
            paymentMethod: affiliate.paymentMethod,
            transactionId: `TXN${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        });
    }
    return payouts;
};
const MOCK_PAYOUTS_DATA: CommissionPayout[] = generateMockPayouts(MOCK_AFFILIATES_DATA, 200); // 200 mock payouts

const MOCK_CAMPAIGNS_DATA: AffiliateCampaign[] = [
    {
        id: 'camp-001', affiliateId: 'aff-001', name: 'Summer Savings Push', startDate: '2023-06-01', endDate: '2023-08-31', status: 'completed',
        targetAudience: 'Young adults, first-time savers', promotionChannels: ['Blog', 'Social Media'], impressions: 15000, clicks: 1200, referralsGenerated: 50, conversionsGenerated: 15
    },
    {
        id: 'camp-002', affiliateId: 'aff-002', name: 'AI Investment Webinar Promo', startDate: '2024-03-15', status: 'active',
        targetAudience: 'Tech-savvy investors', promotionChannels: ['Email List', 'Podcast'], impressions: 20000, clicks: 2500, referralsGenerated: 80, conversionsGenerated: 25
    },
    {
        id: 'camp-003', affiliateId: 'aff-003', name: 'Future of Finance Article Series', startDate: '2024-01-10', endDate: '2024-02-28', status: 'completed',
        targetAudience: 'Financial professionals', promotionChannels: ['Blog'], impressions: 10000, clicks: 800, referralsGenerated: 30, conversionsGenerated: 10
    }
];

const MOCK_MARKETING_ASSETS: MarketingAsset[] = [
    {
        id: 'asset-001', name: 'DemoBank Logo Pack', type: 'logo', category: 'branding',
        description: 'Various formats of the DemoBank logo for use on websites and marketing materials.',
        fileUrl: '/assets/demobank-logos.zip', thumbnailUrl: '/assets/demobank-logo-thumb.png',
        downloadCount: 150, createdAt: '2022-10-01T10:00:00Z', lastUpdated: '2023-01-15T14:30:00Z'
    },
    {
        id: 'asset-002', name: 'Credit Card Application Banner (728x90)', type: 'banner', category: 'product_specific',
        description: 'Standard banner ad for promoting the DemoBank Platinum Credit Card.',
        fileUrl: '/assets/banner_cc_728x90.jpg', thumbnailUrl: '/assets/banner_cc_728x90_thumb.jpg',
        size: '728x90', downloadCount: 320, createdAt: '2023-03-01T09:00:00Z', lastUpdated: '2023-03-01T09:00:00Z'
    },
    {
        id: 'asset-003', name: 'Savings Account Welcome Email Template', type: 'email_template', category: 'promotional',
        description: 'Pre-written email template for affiliates to introduce DemoBank Savings Accounts.',
        fileUrl: '/assets/email_savings_template.html',
        downloadCount: 85, createdAt: '2023-05-20T11:00:00Z', lastUpdated: '2023-05-20T11:00:00Z'
    }
];

const MOCK_OUTREACH_HISTORY: OutreachMessage[] = [
    {
        id: 'out-001', recipient: 'Fintech Weekly', subject: 'Partnership Opportunity with Demo Bank',
        body: 'Dear Fintech Weekly, We are impressed with your platform...', type: 'prospect',
        status: 'sent', sentDate: '2024-01-10T10:00:00Z', authorId: 'admin-1'
    },
    {
        id: 'out-002', recipient: 'The AI Investor', subject: 'Q2 Performance Update & New Incentives',
        body: 'Hi The AI Investor, Hope you are well. We wanted to share...', type: 'existing_affiliate_update',
        status: 'draft', sentDate: undefined, authorId: 'admin-1'
    }
];

const MOCK_TIER_CONFIG: AffiliateTierConfig[] = [
    { name: 'bronze', minConversions: 0, minCommissionRate: 0.05, maxCommissionRate: 0.10, benefits: ['Standard support', 'Basic reports'] },
    { name: 'silver', minConversions: 50, minCommissionRate: 0.10, maxCommissionRate: 0.15, benefits: ['Priority support', 'Advanced reports', 'Dedicated manager'] },
    { name: 'gold', minConversions: 200, minCommissionRate: 0.15, maxCommissionRate: 0.20, benefits: ['VIP support', 'Custom reports', 'Marketing co-funding'] },
    { name: 'platinum', minConversions: 500, minCommissionRate: 0.20, maxCommissionRate: 0.25, benefits: ['Executive support', 'Tailored analytics', 'Exclusive events'] }
];

const MOCK_PROGRAM_SETTINGS: ProgramSettings = {
    id: 'settings-001',
    defaultCommissionRate: 0.10,
    minimumPayoutThreshold: 50,
    payoutFrequency: 'monthly',
    cookieDurationDays: 30,
    welcomeEmailTemplateId: 'welcome-email-temp',
    termsAndConditionsUrl: 'https://demobank.com/affiliate-terms',
    contactEmail: 'affiliates@demobank.com',
    supportPhone: '+1-800-DEMO-AFF',
    currency: 'USD',
    autoApproveAffiliates: true,
};

// --- END NEW INTERFACES & MOCK DATA ---

// --- START HELPER FUNCTIONS & MOCK API SERVICE ---
/**
 * Formats a number as currency.
 * @param amount - The number to format.
 * @param currency - The currency code (e.g., 'USD').
 * @returns Formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Formats a date string into a more readable format.
 * @param dateString - The ISO date string.
 * @returns Formatted date string.
 */
export const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

/**
 * A mock API service to simulate data fetching and manipulation.
 */
export const AffiliateAPIService = {
    /**
     * Fetches all affiliates.
     * @returns A promise resolving to an array of Affiliates.
     */
    getAffiliates: async (
        filters: { status?: Affiliate['status'], tier?: Affiliate['tier'], search?: string } = {},
        pagination: { page: number, pageSize: number } = { page: 1, pageSize: 10 },
        sort: { field: keyof Affiliate, direction: 'asc' | 'desc' } = { field: 'name', direction: 'asc' }
    ): Promise<{ data: Affiliate[], total: number }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = MOCK_AFFILIATES_DATA.filter(aff => {
                    let match = true;
                    if (filters.status && filters.status !== 'all' && aff.status !== filters.status) match = false;
                    if (filters.tier && filters.tier !== 'all' && aff.tier !== filters.tier) match = false;
                    if (filters.search) {
                        const searchTerm = filters.search.toLowerCase();
                        if (!aff.name.toLowerCase().includes(searchTerm) && !aff.email.toLowerCase().includes(searchTerm)) {
                            match = false;
                        }
                    }
                    return match;
                });

                filtered.sort((a, b) => {
                    const aVal = a[sort.field];
                    const bVal = b[sort.field];

                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    }
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    return 0;
                });

                const total = filtered.length;
                const start = (pagination.page - 1) * pagination.pageSize;
                const end = start + pagination.pageSize;
                const data = filtered.slice(start, end);
                resolve({ data, total });
            }, getRandomInt(300, 800)); // Simulate network latency
        });
    },

    /**
     * Fetches a single affiliate by ID.
     * @param id - The ID of the affiliate.
     * @returns A promise resolving to an Affiliate or undefined.
     */
    getAffiliateById: async (id: string): Promise<Affiliate | undefined> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_AFFILIATES_DATA.find(a => a.id === id));
            }, getRandomInt(200, 500));
        });
    },

    /**
     * Updates an existing affiliate.
     * @param affiliate - The affiliate object with updated details.
     * @returns A promise resolving to the updated Affiliate.
     */
    updateAffiliate: async (updatedAffiliate: Affiliate): Promise<Affiliate> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = MOCK_AFFILIATES_DATA.findIndex(a => a.id === updatedAffiliate.id);
                if (index !== -1) {
                    MOCK_AFFILIATES_DATA[index] = { ...MOCK_AFFILIATES_DATA[index], ...updatedAffiliate };
                    resolve(MOCK_AFFILIATES_DATA[index]);
                } else {
                    throw new Error('Affiliate not found');
                }
            }, getRandomInt(500, 1000));
        });
    },

    /**
     * Fetches referrals for a specific affiliate or all referrals.
     * @param affiliateId - Optional affiliate ID.
     * @param pagination - Pagination options.
     * @returns A promise resolving to an array of Referrals.
     */
    getReferrals: async (
        affiliateId?: string,
        pagination: { page: number, pageSize: number } = { page: 1, pageSize: 10 },
        sort: { field: keyof Referral, direction: 'asc' | 'desc' } = { field: 'referralDate', direction: 'desc' }
    ): Promise<{ data: Referral[], total: number }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filtered = affiliateId
                    ? MOCK_REFERRALS_DATA.filter(r => r.affiliateId === affiliateId)
                    : MOCK_REFERRALS_DATA;

                filtered.sort((a, b) => {
                    const aVal = a[sort.field];
                    const bVal = b[sort.field];

                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    }
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    return 0;
                });

                const total = filtered.length;
                const start = (pagination.page - 1) * pagination.pageSize;
                const end = start + pagination.pageSize;
                const data = filtered.slice(start, end);
                resolve({ data, total });
            }, getRandomInt(300, 800));
        });
    },

    /**
     * Fetches commission payouts for a specific affiliate or all payouts.
     * @param affiliateId - Optional affiliate ID.
     * @param pagination - Pagination options.
     * @returns A promise resolving to an array of CommissionPayouts.
     */
    getPayouts: async (
        affiliateId?: string,
        pagination: { page: number, pageSize: number } = { page: 1, pageSize: 10 },
        sort: { field: keyof CommissionPayout, direction: 'asc' | 'desc' } = { field: 'payoutDate', direction: 'desc' }
    ): Promise<{ data: CommissionPayout[], total: number }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filtered = affiliateId
                    ? MOCK_PAYOUTS_DATA.filter(p => p.affiliateId === affiliateId)
                    : MOCK_PAYOUTS_DATA;

                filtered.sort((a, b) => {
                    const aVal = a[sort.field];
                    const bVal = b[sort.field];

                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    }
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    return 0;
                });

                const total = filtered.length;
                const start = (pagination.page - 1) * pagination.pageSize;
                const end = start + pagination.pageSize;
                const data = filtered.slice(start, end);
                resolve({ data, total });
            }, getRandomInt(300, 800));
        });
    },

    /**
     * Fetches all marketing assets.
     * @returns A promise resolving to an array of MarketingAssets.
     */
    getMarketingAssets: async (): Promise<MarketingAsset[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_MARKETING_ASSETS);
            }, getRandomInt(200, 500));
        });
    },

    /**
     * Fetches global program settings.
     * @returns A promise resolving to ProgramSettings.
     */
    getProgramSettings: async (): Promise<ProgramSettings> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_PROGRAM_SETTINGS);
            }, getRandomInt(100, 300));
        });
    },

    /**
     * Updates global program settings.
     * @param settings - The updated settings object.
     * @returns A promise resolving to the updated ProgramSettings.
     */
    updateProgramSettings: async (settings: ProgramSettings): Promise<ProgramSettings> => {
        return new Promise(resolve => {
            setTimeout(() => {
                Object.assign(MOCK_PROGRAM_SETTINGS, settings); // Update the mock object directly
                resolve(MOCK_PROGRAM_SETTINGS);
            }, getRandomInt(500, 1000));
        });
    },

    /**
     * Fetches all affiliate tier configurations.
     * @returns A promise resolving to an array of AffiliateTierConfig.
     */
    getAffiliateTiers: async (): Promise<AffiliateTierConfig[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_TIER_CONFIG);
            }, getRandomInt(100, 300));
        });
    },

    /**
     * Fetches outreach message history.
     * @returns A promise resolving to an array of OutreachMessages.
     */
    getOutreachHistory: async (): Promise<OutreachMessage[]> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(MOCK_OUTREACH_HISTORY);
            }, getRandomInt(200, 500));
        });
    },

    /**
     * Creates a new outreach message in history.
     * @param message - The outreach message to add.
     * @returns A promise resolving to the created OutreachMessage.
     */
    createOutreachMessage: async (message: Omit<OutreachMessage, 'id'>): Promise<OutreachMessage> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newId = `out-${String(MOCK_OUTREACH_HISTORY.length + 1).padStart(3, '0')}`;
                const newMessage: OutreachMessage = { ...message, id: newId };
                MOCK_OUTREACH_HISTORY.unshift(newMessage); // Add to the beginning
                resolve(newMessage);
            }, getRandomInt(500, 1000));
        });
    },

    /**
     * Fetches campaigns for a specific affiliate or all campaigns.
     * @param affiliateId - Optional affiliate ID.
     * @param pagination - Pagination options.
     * @returns A promise resolving to an array of AffiliateCampaigns.
     */
    getAffiliateCampaigns: async (
        affiliateId?: string,
        pagination: { page: number, pageSize: number } = { page: 1, pageSize: 10 },
        sort: { field: keyof AffiliateCampaign, direction: 'asc' | 'desc' } = { field: 'startDate', direction: 'desc' }
    ): Promise<{ data: AffiliateCampaign[], total: number }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                let filtered = affiliateId
                    ? MOCK_CAMPAIGNS_DATA.filter(c => c.affiliateId === affiliateId)
                    : MOCK_CAMPAIGNS_DATA;

                filtered.sort((a, b) => {
                    const aVal = a[sort.field];
                    const bVal = b[sort.field];

                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    }
                    if (typeof aVal === 'number' && typeof bVal === 'number') {
                        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
                    }
                    return 0;
                });

                const total = filtered.length;
                const start = (pagination.page - 1) * pagination.pageSize;
                const end = start + pagination.pageSize;
                const data = filtered.slice(start, end);
                resolve({ data, total });
            }, getRandomInt(300, 800));
        });
    },

    /**
     * Creates a new affiliate campaign.
     * @param campaign - The campaign object to create.
     * @returns A promise resolving to the created AffiliateCampaign.
     */
    createAffiliateCampaign: async (campaign: Omit<AffiliateCampaign, 'id'>): Promise<AffiliateCampaign> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const newId = `camp-${String(MOCK_CAMPAIGNS_DATA.length + 1).padStart(3, '0')}`;
                const newCampaign: AffiliateCampaign = { ...campaign, id: newId };
                MOCK_CAMPAIGNS_DATA.unshift(newCampaign); // Add to the beginning
                resolve(newCampaign);
            }, getRandomInt(500, 1000));
        });
    },

    /**
     * Updates an existing affiliate campaign.
     * @param campaign - The campaign object with updated details.
     * @returns A promise resolving to the updated AffiliateCampaign.
     */
    updateAffiliateCampaign: async (updatedCampaign: AffiliateCampaign): Promise<AffiliateCampaign> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const index = MOCK_CAMPAIGNS_DATA.findIndex(c => c.id === updatedCampaign.id);
                if (index !== -1) {
                    MOCK_CAMPAIGNS_DATA[index] = { ...MOCK_CAMPAIGNS_DATA[index], ...updatedCampaign };
                    resolve(MOCK_CAMPAIGNS_DATA[index]);
                } else {
                    throw new Error('Campaign not found');
                }
            }, getRandomInt(500, 1000));
        });
    },
};
// --- END HELPER FUNCTIONS & MOCK API SERVICE ---

// --- START REUSABLE UI COMPONENTS ---

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    totalItems: number;
}

/**
 * Renders pagination controls for tables.
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
    totalItems,
}) => {
    const pageNumbers = useMemo(() => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            if (currentPage > 2) pages.push(currentPage - 1);
            pages.push(currentPage);
            if (currentPage < totalPages - 1) pages.push(currentPage + 1);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return [...new Set(pages)]; // Remove duplicates from '...'
    }, [currentPage, totalPages]);

    return (
        <div className="flex justify-between items-center text-gray-300 text-sm mt-4 px-4 py-2 bg-gray-900/30 rounded-lg">
            <div className="flex items-center space-x-2">
                <span>Show:</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="bg-gray-700/50 rounded px-2 py-1 text-white text-xs focus:ring-cyan-600 focus:border-cyan-600"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
                <span>entries</span>
            </div>
            <div className="flex items-center space-x-2">
                <span>Showing {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} to {Math.min(totalItems, currentPage * pageSize)} of {totalItems} entries</span>
            </div>
            <div className="flex space-x-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                    Previous
                </button>
                {pageNumbers.map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        disabled={page === '...' || page === currentPage}
                        className={`px-3 py-1 rounded ${page === currentPage ? 'bg-cyan-600 text-white' : 'bg-gray-700/50 hover:bg-gray-600'} ${page === '...' ? 'cursor-default' : ''}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 bg-gray-700/50 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; // Added size option
}

/**
 * A generic modal component.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-3xl',
        '2xl': 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className={`bg-gray-800 rounded-lg shadow-2xl ${sizeClasses[size]} w-full border border-gray-700`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

interface TabProps {
    tabs: { id: string; label: string; content: React.ReactNode }[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

/**
 * A generic tab component.
 */
export const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div>
            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                                ${activeTab === tab.id
                                    ? 'border-cyan-500 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="py-6">
                {tabs.find(tab => tab.id === activeTab)?.content}
            </div>
        </div>
    );
};

// --- END REUSABLE UI COMPONENTS ---

// --- START NEW MAIN VIEW COMPONENTS ---

/**
 * Displays key summary metrics for the affiliate program.
 */
export const AffiliateSummaryMetrics: React.FC = () => {
    const [summary, setSummary] = useState({
        totalAffiliates: 0,
        activeAffiliates: 0,
        totalReferrals: 0,
        totalConversions: 0,
        totalCommissionEarned: 0,
        avgConversionRate: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data: affiliates } = await AffiliateAPIService.getAffiliates({}, { page: 1, pageSize: 9999 });
                const { data: referrals } = await AffiliateAPIService.getReferrals(undefined, { page: 1, pageSize: 9999 });

                const totalAffiliates = affiliates.length;
                const activeAffiliates = affiliates.filter(a => a.status === 'active').length;
                const totalReferrals = referrals.length;
                const totalConversions = referrals.filter(r => r.status === 'converted').length;
                const totalCommissionEarned = referrals.reduce((sum, r) => sum + r.commissionAmount, 0);
                const avgConversionRate = totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0;

                setSummary({
                    totalAffiliates,
                    activeAffiliates,
                    totalReferrals,
                    totalConversions,
                    totalCommissionEarned: parseFloat(totalCommissionEarned.toFixed(2)),
                    avgConversionRate: parseFloat(avgConversionRate.toFixed(2)),
                });
            } catch (err) {
                console.error("Failed to fetch affiliate summary:", err);
                setError("Failed to load summary data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (isLoading) {
        return <div className="text-gray-400 text-center py-8">Loading summary...</div>;
    }

    if (error) {
        return <div className="text-red-400 text-center py-8">Error: {error}</div>;
    }

    const metrics = [
        { label: 'Total Affiliates', value: summary.totalAffiliates.toLocaleString() },
        { label: 'Active Affiliates', value: summary.activeAffiliates.toLocaleString() },
        { label: 'Total Referrals', value: summary.totalReferrals.toLocaleString() },
        { label: 'Total Conversions', value: summary.totalConversions.toLocaleString() },
        { label: 'Commission Earned', value: formatCurrency(summary.totalCommissionEarned) },
        { label: 'Avg. Conversion Rate', value: `${summary.avgConversionRate}%` },
    ];

    return (
        <Card title="Program Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="bg-gray-900/40 p-5 rounded-lg border border-gray-700 hover:border-cyan-600 transition-colors duration-200">
                        <p className="text-sm text-gray-400">{metric.label}</p>
                        <p className="text-2xl font-semibold text-white mt-1">{metric.value}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};


interface AffiliateDetailModalProps {
    affiliateId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (affiliate: Affiliate) => void;
}

/**
 * Modal to view and edit details of a single affiliate.
 */
export const AffiliateDetailModal: React.FC<AffiliateDetailModalProps> = ({ affiliateId, isOpen, onClose, onSave }) => {
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAffiliate, setEditedAffiliate] = useState<Partial<Affiliate>>({});
    const [activeTab, setActiveTab] = useState('overview');

    const fetchAffiliate = useCallback(async () => {
        if (!affiliateId) {
            setAffiliate(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await AffiliateAPIService.getAffiliateById(affiliateId);
            setAffiliate(data || null);
            setEditedAffiliate(data || {});
        } catch (err) {
            setError('Failed to load affiliate details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [affiliateId]);

    useEffect(() => {
        if (isOpen) {
            fetchAffiliate();
            setActiveTab('overview'); // Reset tab on open
        }
    }, [isOpen, fetchAffiliate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setEditedAffiliate(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async () => {
        if (!affiliate || !editedAffiliate) return;
        setLoading(true);
        setError(null);
        try {
            const updated = await AffiliateAPIService.updateAffiliate({ ...affiliate, ...editedAffiliate });
            setAffiliate(updated);
            onSave(updated);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to save affiliate details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const OverviewTab = (
        <div>
            {affiliate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
                    <div className="col-span-2">
                        <label className="block text-gray-400 font-medium">Name</label>
                        {isEditing ? <input type="text" name="name" value={editedAffiliate.name || ''} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p className="text-white text-lg font-semibold">{affiliate.name}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-400 font-medium">Email</label>
                        {isEditing ? <input type="email" name="email" value={editedAffiliate.email || ''} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{affiliate.email}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 font-medium">Status</label>
                        {isEditing ? (
                            <select name="status" value={editedAffiliate.status} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                {['active', 'pending', 'suspended', 'deactivated'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        ) : <p>{affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-400 font-medium">Join Date</label>
                        <p>{formatDate(affiliate.joinDate)}</p>
                    </div>
                    <div>
                        <label className="block text-gray-400 font-medium">Last Login</label>
                        <p>{formatDate(affiliate.lastLogin)}</p>
                    </div>

                    <div>
                        <label className="block text-gray-400 font-medium">Referral Code</label>
                        {isEditing ? <input type="text" name="referralCode" value={editedAffiliate.referralCode || ''} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{affiliate.referralCode}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 font-medium">Tracking Link</label>
                        {isEditing ? <input type="text" name="trackingLink" value={editedAffiliate.trackingLink || ''} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p className="truncate"><a href={affiliate.trackingLink} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{affiliate.trackingLink}</a></p>}
                    </div>

                    <div>
                        <label className="block text-gray-400 font-medium">Commission Rate</label>
                        {isEditing ? <input type="number" step="0.01" name="commissionRate" value={editedAffiliate.commissionRate || 0} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{(affiliate.commissionRate * 100).toFixed(2)}%</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 font-medium">Tier</label>
                        {isEditing ? (
                            <select name="tier" value={editedAffiliate.tier} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                {['bronze', 'silver', 'gold', 'platinum'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        ) : <p>{affiliate.tier.charAt(0).toUpperCase() + affiliate.tier.slice(1)}</p>}
                    </div>

                    <div>
                        <label className="block text-gray-400 font-medium">Payment Method</label>
                        {isEditing ? (
                            <select name="paymentMethod" value={editedAffiliate.paymentMethod} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                {['paypal', 'bank_transfer', 'crypto'].map(p => <option key={p} value={p}>{p.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
                            </select>
                        ) : <p>{affiliate.paymentMethod.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 font-medium">Payment Details</label>
                        {isEditing ? <input type="text" name="paymentDetails" value={editedAffiliate.paymentDetails || ''} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{affiliate.paymentDetails}</p>}
                    </div>

                    <div className="col-span-2">
                        <label className="block text-gray-400 font-medium">Notes</label>
                        {isEditing ? <textarea name="notes" value={editedAffiliate.notes || ''} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white min-h-[80px]" /> : <p className="whitespace-pre-line">{affiliate.notes || 'No notes'}</p>}
                    </div>
                    <div className="col-span-2">
                        <label className="block text-gray-400 font-medium">Website</label>
                        {isEditing ? <input type="text" name="website" value={editedAffiliate.website || ''} onChange={handleInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p className="truncate"><a href={affiliate.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{affiliate.website || 'N/A'}</a></p>}
                    </div>

                    {affiliate.socialMedia && (
                        <div className="col-span-2">
                            <label className="block text-gray-400 font-medium mb-2">Social Media</label>
                            {Object.entries(affiliate.socialMedia).map(([platform, url]) => url && (
                                <p key={platform} className="ml-2">
                                    <span className="capitalize font-medium">{platform}:</span> <a href={`https://${platform}.com/${url.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{url}</a>
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div className="mt-6 flex justify-end space-x-2">
                {isEditing ? (
                    <>
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium" disabled={loading}>Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium" disabled={loading}>Edit Details</button>
                )}
            </div>
        </div>
    );

    const ReferralsTab: React.FC<{ affiliateId: string }> = ({ affiliateId }) => {
        const [referrals, setReferrals] = useState<Referral[]>([]);
        const [loadingReferrals, setLoadingReferrals] = useState(true);
        const [errorReferrals, setErrorReferrals] = useState<string | null>(null);
        const [currentPage, setCurrentPage] = useState(1);
        const [pageSize, setPageSize] = useState(10);
        const [totalReferrals, setTotalReferrals] = useState(0);

        const fetchReferrals = useCallback(async () => {
            setLoadingReferrals(true);
            setErrorReferrals(null);
            try {
                const { data, total } = await AffiliateAPIService.getReferrals(affiliateId, { page: currentPage, pageSize });
                setReferrals(data);
                setTotalReferrals(total);
            } catch (err) {
                setErrorReferrals("Failed to load referrals.");
                console.error(err);
            } finally {
                setLoadingReferrals(false);
            }
        }, [affiliateId, currentPage, pageSize]);

        useEffect(() => {
            fetchReferrals();
        }, [fetchReferrals]);

        const totalPages = Math.ceil(totalReferrals / pageSize);

        if (loadingReferrals) return <div className="text-gray-400 text-center py-8">Loading referrals...</div>;
        if (errorReferrals) return <div className="text-red-400 text-center py-8">Error: {errorReferrals}</div>;

        return (
            <div className="text-sm">
                {referrals.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No referrals found for this affiliate.</div>
                ) : (
                    <>
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-4 py-2">Customer</th>
                                    <th className="px-4 py-2">Referral Date</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2 text-right">Value</th>
                                    <th className="px-4 py-2 text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referrals.map((ref) => (
                                    <tr key={ref.id} className="border-b border-gray-700 hover:bg-gray-800">
                                        <td className="px-4 py-2 text-white">{ref.customerName}</td>
                                        <td className="px-4 py-2">{formatDate(ref.referralDate)}</td>
                                        <td className="px-4 py-2 capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ref.status === 'converted' ? 'bg-green-600/20 text-green-400' : ref.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}`}>
                                                {ref.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{ref.productPurchased || 'N/A'}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(ref.value)}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(ref.commissionAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                            totalItems={totalReferrals}
                        />
                    </>
                )}
            </div>
        );
    };

    const PayoutsTab: React.FC<{ affiliateId: string }> = ({ affiliateId }) => {
        const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
        const [loadingPayouts, setLoadingPayouts] = useState(true);
        const [errorPayouts, setErrorPayouts] = useState<string | null>(null);
        const [currentPage, setCurrentPage] = useState(1);
        const [pageSize, setPageSize] = useState(10);
        const [totalPayouts, setTotalPayouts] = useState(0);

        const fetchPayouts = useCallback(async () => {
            setLoadingPayouts(true);
            setErrorPayouts(null);
            try {
                const { data, total } = await AffiliateAPIService.getPayouts(affiliateId, { page: currentPage, pageSize });
                setPayouts(data);
                setTotalPayouts(total);
            } catch (err) {
                setErrorPayouts("Failed to load payouts.");
                console.error(err);
            } finally {
                setLoadingPayouts(false);
            }
        }, [affiliateId, currentPage, pageSize]);

        useEffect(() => {
            fetchPayouts();
        }, [fetchPayouts]);

        const totalPages = Math.ceil(totalPayouts / pageSize);

        if (loadingPayouts) return <div className="text-gray-400 text-center py-8">Loading payouts...</div>;
        if (errorPayouts) return <div className="text-red-400 text-center py-8">Error: {errorPayouts}</div>;

        return (
            <div className="text-sm">
                {payouts.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No payout history found for this affiliate.</div>
                ) : (
                    <>
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-4 py-2">Payout Date</th>
                                    <th className="px-4 py-2">Amount</th>
                                    <th className="px-4 py-2">Method</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((payout) => (
                                    <tr key={payout.id} className="border-b border-gray-700 hover:bg-gray-800">
                                        <td className="px-4 py-2 text-white">{formatDate(payout.payoutDate)}</td>
                                        <td className="px-4 py-2">{formatCurrency(payout.amount)}</td>
                                        <td className="px-4 py-2 capitalize">{payout.paymentMethod.replace('_', ' ')}</td>
                                        <td className="px-4 py-2 capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${payout.status === 'paid' ? 'bg-green-600/20 text-green-400' : payout.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}`}>
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{payout.transactionId || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                            totalItems={totalPayouts}
                        />
                    </>
                )}
            </div>
        );
    };

    const CampaignsTab: React.FC<{ affiliateId: string }> = ({ affiliateId }) => {
        const [campaigns, setCampaigns] = useState<AffiliateCampaign[]>([]);
        const [loadingCampaigns, setLoadingCampaigns] = useState(true);
        const [errorCampaigns, setErrorCampaigns] = useState<string | null>(null);
        const [currentPage, setCurrentPage] = useState(1);
        const [pageSize, setPageSize] = useState(10);
        const [totalCampaigns, setTotalCampaigns] = useState(0);

        const fetchCampaigns = useCallback(async () => {
            setLoadingCampaigns(true);
            setErrorCampaigns(null);
            try {
                const { data, total } = await AffiliateAPIService.getAffiliateCampaigns(affiliateId, { page: currentPage, pageSize });
                setCampaigns(data);
                setTotalCampaigns(total);
            } catch (err) {
                setErrorCampaigns("Failed to load campaigns.");
                console.error(err);
            } finally {
                setLoadingCampaigns(false);
            }
        }, [affiliateId, currentPage, pageSize]);

        useEffect(() => {
            fetchCampaigns();
        }, [fetchCampaigns]);

        const totalPages = Math.ceil(totalCampaigns / pageSize);

        if (loadingCampaigns) return <div className="text-gray-400 text-center py-8">Loading campaigns...</div>;
        if (errorCampaigns) return <div className="text-red-400 text-center py-8">Error: {errorCampaigns}</div>;

        return (
            <div className="text-sm">
                {campaigns.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No campaigns found for this affiliate.</div>
                ) : (
                    <>
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-4 py-2">Campaign Name</th>
                                    <th className="px-4 py-2">Status</th>
                                    <th className="px-4 py-2">Start Date</th>
                                    <th className="px-4 py-2">End Date</th>
                                    <th className="px-4 py-2 text-right">Referrals</th>
                                    <th className="px-4 py-2 text-right">Conversions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="border-b border-gray-700 hover:bg-gray-800">
                                        <td className="px-4 py-2 text-white">{campaign.name}</td>
                                        <td className="px-4 py-2 capitalize">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === 'active' ? 'bg-green-600/20 text-green-400' : campaign.status === 'paused' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-gray-600/20 text-gray-400'}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2">{formatDate(campaign.startDate)}</td>
                                        <td className="px-4 py-2">{formatDate(campaign.endDate)}</td>
                                        <td className="px-4 py-2 text-right">{campaign.referralsGenerated?.toLocaleString() || 0}</td>
                                        <td className="px-4 py-2 text-right">{campaign.conversionsGenerated?.toLocaleString() || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                            onPageSizeChange={setPageSize}
                            totalItems={totalCampaigns}
                        />
                    </>
                )}
            </div>
        );
    };

    const tabs = useMemo(() => [
        { id: 'overview', label: 'Overview', content: OverviewTab },
        { id: 'referrals', label: 'Referrals', content: affiliateId ? <ReferralsTab affiliateId={affiliateId} /> : null },
        { id: 'payouts', label: 'Payout History', content: affiliateId ? <PayoutsTab affiliateId={affiliateId} /> : null },
        { id: 'campaigns', label: 'Campaigns', content: affiliateId ? <CampaignsTab affiliateId={affiliateId} /> : null },
        { id: 'performance', label: 'Performance', content: <div className="text-gray-400">Placeholder for charts and detailed performance metrics. (Coming Soon!)</div> },
    ], [affiliateId, affiliate, editedAffiliate, isEditing, loading, error]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Affiliate Details: ${affiliate?.name || 'Loading...'}`} size="xl">
            {loading && !affiliate ? (
                <div className="text-gray-400 text-center py-8">Loading affiliate details...</div>
            ) : error ? (
                <div className="text-red-400 text-center py-8">Error: {error}</div>
            ) : affiliate ? (
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            ) : (
                <div className="text-gray-400 text-center py-8">No affiliate selected.</div>
            )}
        </Modal>
    );
};

/**
 * Main table for managing all affiliates, with filters and pagination.
 */
export const AffiliateManagementTable: React.FC = () => {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalAffiliates, setTotalAffiliates] = useState(0);
    const [filters, setFilters] = useState<{ status?: Affiliate['status'], tier?: Affiliate['tier'], search?: string }>({ status: 'all', tier: 'all', search: '' });
    const [sort, setSort] = useState<{ field: keyof Affiliate, direction: 'asc' | 'desc' }>({ field: 'totalCommissionEarned', direction: 'desc' });
    const [selectedAffiliateId, setSelectedAffiliateId] = useState<string | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchAffiliates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, total } = await AffiliateAPIService.getAffiliates(filters, { page: currentPage, pageSize }, sort);
            setAffiliates(data);
            setTotalAffiliates(total);
        } catch (err) {
            setError("Failed to load affiliates.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, filters, sort]);

    useEffect(() => {
        fetchAffiliates();
    }, [fetchAffiliates]);

    const totalPages = Math.ceil(totalAffiliates / pageSize);

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value as any }));
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleSortChange = (field: keyof Affiliate) => {
        setSort(prev => ({
            field: field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
        }));
        setCurrentPage(1);
    };

    const handleViewDetails = (affiliateId: string) => {
        setSelectedAffiliateId(affiliateId);
        setIsDetailModalOpen(true);
    };

    const handleAffiliateSaved = (updatedAffiliate: Affiliate) => {
        // Refresh data or update in state locally
        fetchAffiliates();
        // You could also update the specific affiliate in the `affiliates` state without refetching all
        setAffiliates(prev => prev.map(a => a.id === updatedAffiliate.id ? updatedAffiliate : a));
    };

    return (
        <Card title="Affiliate Management">
            <div className="mb-4 flex flex-wrap gap-4 items-center justify-between text-sm">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="bg-gray-700/50 p-2 rounded text-white placeholder-gray-400 focus:ring-cyan-600 focus:border-cyan-600"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <select
                        className="bg-gray-700/50 p-2 rounded text-white focus:ring-cyan-600 focus:border-cyan-600"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                        <option value="deactivated">Deactivated</option>
                    </select>
                    <select
                        className="bg-gray-700/50 p-2 rounded text-white focus:ring-cyan-600 focus:border-cyan-600"
                        value={filters.tier}
                        onChange={(e) => handleFilterChange('tier', e.target.value)}
                    >
                        <option value="all">All Tiers</option>
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Add New Affiliate</button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">Export Data</button>
                </div>
            </div>
            {loading ? (
                <div className="text-gray-400 text-center py-8">Loading affiliates...</div>
            ) : error ? (
                <div className="text-red-400 text-center py-8">Error: {error}</div>
            ) : affiliates.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No affiliates found matching your criteria.</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSortChange('name')}>
                                        Name {sort.field === 'name' && (sort.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSortChange('status')}>
                                        Status {sort.field === 'status' && (sort.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSortChange('tier')}>
                                        Tier {sort.field === 'tier' && (sort.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSortChange('totalReferrals')}>
                                        Referrals {sort.field === 'totalReferrals' && (sort.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSortChange('conversionRate')}>
                                        Conversion {sort.field === 'conversionRate' && (sort.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSortChange('totalCommissionEarned')}>
                                        Earned {sort.field === 'totalCommissionEarned' && (sort.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSortChange('balanceDue')}>
                                        Due {sort.field === 'balanceDue' && (sort.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {affiliates.map(a => (
                                    <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-800">
                                        <td className="px-6 py-4 text-white font-medium">{a.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === 'active' ? 'bg-green-600/20 text-green-400' : a.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{a.tier}</td>
                                        <td className="px-6 py-4">{a.totalReferrals.toLocaleString()}</td>
                                        <td className="px-6 py-4">{a.conversionRate}%</td>
                                        <td className="px-6 py-4 font-mono text-white">{formatCurrency(a.totalCommissionEarned)}</td>
                                        <td className="px-6 py-4 font-mono text-yellow-400">{formatCurrency(a.balanceDue)}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => handleViewDetails(a.id)} className="text-cyan-500 hover:text-cyan-400 text-sm font-medium mr-2">View</button>
                                            <button onClick={() => alert(`Initiate payout for ${a.name}`)} disabled={a.balanceDue <= 0} className="text-indigo-500 hover:text-indigo-400 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">Payout</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        totalItems={totalAffiliates}
                    />
                </>
            )}
            <AffiliateDetailModal
                affiliateId={selectedAffiliateId}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onSave={handleAffiliateSaved}
            />
        </Card>
    );
};

/**
 * Component to manage and display marketing assets for affiliates.
 */
export const MarketingAssetsLibrary: React.FC = () => {
    const [assets, setAssets] = useState<MarketingAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterType, setFilterType] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        const fetchAssets = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await AffiliateAPIService.getMarketingAssets();
                setAssets(data);
            } catch (err) {
                setError("Failed to load marketing assets.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            let matches = true;
            if (filterCategory !== 'all' && asset.category !== filterCategory) matches = false;
            if (filterType !== 'all' && asset.type !== filterType) matches = false;
            if (searchTerm && !asset.name.toLowerCase().includes(searchTerm.toLowerCase()) && !asset.description.toLowerCase().includes(searchTerm.toLowerCase())) matches = false;
            return matches;
        });
    }, [assets, filterCategory, filterType, searchTerm]);

    const allCategories = useMemo(() => ['all', ...Array.from(new Set(assets.map(a => a.category)))], [assets]);
    const allTypes = useMemo(() => ['all', ...Array.from(new Set(assets.map(a => a.type)))], [assets]);

    if (loading) {
        return <Card title="Marketing Assets Library"><div className="text-gray-400 text-center py-8">Loading assets...</div></Card>;
    }

    if (error) {
        return <Card title="Marketing Assets Library"><div className="text-red-400 text-center py-8">Error: {error}</div></Card>;
    }

    return (
        <Card title="Marketing Assets Library">
            <div className="mb-4 flex flex-wrap gap-4 items-center justify-between text-sm">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="bg-gray-700/50 p-2 rounded text-white placeholder-gray-400 focus:ring-cyan-600 focus:border-cyan-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="bg-gray-700/50 p-2 rounded text-white focus:ring-cyan-600 focus:border-cyan-600"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {allCategories.map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
                    </select>
                    <select
                        className="bg-gray-700/50 p-2 rounded text-white focus:ring-cyan-600 focus:border-cyan-600"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        {allTypes.map(type => <option key={type} value={type}>{type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
                    </select>
                </div>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Upload New Asset</button>
            </div>

            {filteredAssets.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No marketing assets found matching your criteria.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssets.map(asset => (
                        <div key={asset.id} className="bg-gray-900/40 p-5 rounded-lg border border-gray-700 flex flex-col justify-between hover:border-cyan-600 transition-colors duration-200">
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-2">{asset.name}</h4>
                                <p className="text-sm text-gray-400 mb-3">{asset.description}</p>
                                {asset.thumbnailUrl && (
                                    <div className="mb-3 rounded overflow-hidden">
                                        <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-32 object-cover" />
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 text-xs mb-3">
                                    <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">{asset.type.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                    <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">{asset.category.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                    {asset.size && <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">{asset.size}</span>}
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-sm">
                                <span className="text-gray-400">Downloads: {asset.downloadCount.toLocaleString()}</span>
                                <a href={asset.fileUrl} target="_blank" rel="noopener noreferrer" download className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Download</a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Component for global program settings and tier configurations.
 */
export const ProgramSettingsView: React.FC = () => {
    const [settings, setSettings] = useState<ProgramSettings | null>(null);
    const [tiers, setTiers] = useState<AffiliateTierConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditingSettings, setIsEditingSettings] = useState(false);
    const [editedSettings, setEditedSettings] = useState<Partial<ProgramSettings>>({});

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            setError(null);
            try {
                const programSettings = await AffiliateAPIService.getProgramSettings();
                const affiliateTiers = await AffiliateAPIService.getAffiliateTiers();
                setSettings(programSettings);
                setEditedSettings(programSettings);
                setTiers(affiliateTiers);
            } catch (err) {
                setError("Failed to load program settings.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSettingsInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setEditedSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
        }));
    };

    const handleSaveSettings = async () => {
        if (!settings || !editedSettings) return;
        setLoading(true);
        setError(null);
        try {
            const updated = await AffiliateAPIService.updateProgramSettings({ ...settings, ...editedSettings as ProgramSettings });
            setSettings(updated);
            setIsEditingSettings(false);
            alert('Settings updated successfully!');
        } catch (err) {
            setError('Failed to save settings.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Card title="Program Settings"><div className="text-gray-400 text-center py-8">Loading settings...</div></Card>;
    }

    if (error) {
        return <Card title="Program Settings"><div className="text-red-400 text-center py-8">Error: {error}</div></Card>;
    }

    return (
        <div className="space-y-6">
            <Card title="General Program Settings">
                {settings && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
                        <div>
                            <label className="block text-gray-400 font-medium">Default Commission Rate</label>
                            {isEditingSettings ? <input type="number" step="0.01" name="defaultCommissionRate" value={editedSettings.defaultCommissionRate || 0} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{(settings.defaultCommissionRate * 100).toFixed(2)}%</p>}
                        </div>
                        <div>
                            <label className="block text-gray-400 font-medium">Minimum Payout Threshold ({settings.currency})</label>
                            {isEditingSettings ? <input type="number" step="1" name="minimumPayoutThreshold" value={editedSettings.minimumPayoutThreshold || 0} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{formatCurrency(settings.minimumPayoutThreshold, settings.currency)}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-400 font-medium">Payout Frequency</label>
                            {isEditingSettings ? (
                                <select name="payoutFrequency" value={editedSettings.payoutFrequency} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white">
                                    {['weekly', 'bi-weekly', 'monthly'].map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                                </select>
                            ) : <p className="capitalize">{settings.payoutFrequency}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-400 font-medium">Cookie Duration (Days)</label>
                            {isEditingSettings ? <input type="number" step="1" name="cookieDurationDays" value={editedSettings.cookieDurationDays || 0} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{settings.cookieDurationDays} days</p>}
                        </div>
                        <div>
                            <label className="block text-gray-400 font-medium">Auto-Approve New Affiliates</label>
                            {isEditingSettings ? (
                                <input type="checkbox" name="autoApproveAffiliates" checked={editedSettings.autoApproveAffiliates} onChange={handleSettingsInputChange} className="form-checkbox h-5 w-5 text-cyan-600 bg-gray-700/50 border-gray-600 rounded" />
                            ) : <p>{settings.autoApproveAffiliates ? 'Yes' : 'No'}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-400 font-medium">Currency</label>
                            {isEditingSettings ? <input type="text" name="currency" value={editedSettings.currency || ''} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{settings.currency}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-400 font-medium">Terms & Conditions URL</label>
                            {isEditingSettings ? <input type="url" name="termsAndConditionsUrl" value={editedSettings.termsAndConditionsUrl || ''} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p><a href={settings.termsAndConditionsUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{settings.termsAndConditionsUrl}</a></p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-400 font-medium">Contact Email</label>
                            {isEditingSettings ? <input type="email" name="contactEmail" value={editedSettings.contactEmail || ''} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{settings.contactEmail}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-400 font-medium">Support Phone (Optional)</label>
                            {isEditingSettings ? <input type="tel" name="supportPhone" value={editedSettings.supportPhone || ''} onChange={handleSettingsInputChange} className="w-full bg-gray-700/50 p-2 rounded text-white" /> : <p>{settings.supportPhone || 'N/A'}</p>}
                        </div>

                        <div className="col-span-2 mt-6 flex justify-end space-x-2">
                            {isEditingSettings ? (
                                <>
                                    <button onClick={() => { setIsEditingSettings(false); setEditedSettings(settings); }} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium" disabled={loading}>Cancel</button>
                                    <button onClick={handleSaveSettings} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditingSettings(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium" disabled={loading}>Edit Settings</button>
                            )}
                        </div>
                    </div>
                )}
            </Card>

            <Card title="Affiliate Tiers Configuration">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Tier Name</th>
                                <th scope="col" className="px-6 py-3">Min. Conversions</th>
                                <th scope="col" className="px-6 py-3">Min. Commission Rate</th>
                                <th scope="col" className="px-6 py-3">Max. Commission Rate</th>
                                <th scope="col" className="px-6 py-3">Benefits</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tiers.map(tier => (
                                <tr key={tier.name} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="px-6 py-4 text-white font-medium capitalize">{tier.name}</td>
                                    <td className="px-6 py-4">{tier.minConversions.toLocaleString()}</td>
                                    <td className="px-6 py-4">{(tier.minCommissionRate * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4">{(tier.maxCommissionRate * 100).toFixed(2)}%</td>
                                    <td className="px-6 py-4">
                                        <ul className="list-disc list-inside text-xs space-y-1">
                                            {tier.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-cyan-500 hover:text-cyan-400 text-sm font-medium mr-2">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-right">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">Add New Tier</button>
                </div>
            </Card>
        </div>
    );
};


interface OutreachHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Displays a history of AI-generated outreach messages.
 */
export const OutreachHistoryModal: React.FC<OutreachHistoryModalProps> = ({ isOpen, onClose }) => {
    const [history, setHistory] = useState<OutreachMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchHistory = async () => {
                setLoading(true);
                setError(null);
                try {
                    const data = await AffiliateAPIService.getOutreachHistory();
                    setHistory(data);
                } catch (err) {
                    setError("Failed to load outreach history.");
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Outreach History" size="lg">
            {loading ? (
                <div className="text-gray-400 text-center py-8">Loading history...</div>
            ) : error ? (
                <div className="text-red-400 text-center py-8">Error: {error}</div>
            ) : history.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No outreach messages found.</div>
            ) : (
                <div className="space-y-4">
                    {history.map(msg => (
                        <div key={msg.id} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-md font-semibold text-white">{msg.subject}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${msg.status === 'sent' ? 'bg-green-600/20 text-green-400' : msg.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}`}>
                                    {msg.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">To: <span className="text-white">{msg.recipient}</span> | Type: <span className="capitalize">{msg.type.replace('_', ' ')}</span></p>
                            <p className="text-xs text-gray-400 mb-3">
                                {msg.sentDate ? `Sent on ${formatDate(msg.sentDate)}` : 'Draft'}
                            </p>
                            <div className="bg-gray-800 p-3 rounded text-gray-300 text-sm max-h-40 overflow-y-auto whitespace-pre-line">
                                {msg.body}
                            </div>
                            <div className="mt-3 text-right">
                                <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
};
// --- END NEW MAIN VIEW COMPONENTS ---

// Original AffiliatesView with added navigation and new components
const AffiliatesView: React.FC = () => {
    const [isOutreachModalOpen, setOutreachModalOpen] = useState(false);
    const [isOutreachHistoryModalOpen, setOutreachHistoryModalOpen] = useState(false);
    const [affiliateName, setAffiliateName] = useState("The AI Investor");
    const [outreachMsg, setOutreachMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'affiliates', 'assets', 'settings'

    const handleGenerate = async () => {
        setIsLoading(true);
        setOutreachMsg('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Write a friendly and professional outreach email to a potential new affiliate partner named "${affiliateName}". Introduce Demo Bank and highlight the benefits of our affiliate program. Ensure the tone is engaging and calls to action are clear.`;
            const response = await ai.models.generateContent({ model: 'gemini-1.5-flash', contents: [{ text: prompt }] }); // Changed model to 1.5-flash for potential richer output and adjusted contents format
            const generatedText = response.response.text();
            setOutreachMsg(generatedText);
            
            // Save to mock history
            await AffiliateAPIService.createOutreachMessage({
                recipient: affiliateName,
                subject: `Partnership Opportunity with Demo Bank - ${affiliateName}`,
                body: generatedText,
                type: 'prospect',
                status: 'draft', // User can decide to send later
                authorId: 'current-admin-user-id', // Placeholder
            });

        } catch (err) {
            console.error("Error generating outreach message:", err);
            setOutreachMsg("Error generating outreach message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOutreach = async () => {
        // In a real application, this would send the email.
        // For now, we'll mark the last generated draft as sent in mock history.
        setIsLoading(true);
        try {
            const lastDraft = MOCK_OUTREACH_HISTORY.find(msg => msg.recipient === affiliateName && msg.status === 'draft');
            if (lastDraft) {
                await AffiliateAPIService.updateAffiliate({
                    ...MOCK_AFFILIATES_DATA.find(a => a.name === affiliateName)!,
                    notes: (MOCK_AFFILIATES_DATA.find(a => a.name === affiliateName)?.notes || '') + '\n' + `AI Outreach sent on ${formatDate(new Date().toISOString())}`,
                })
                Object.assign(lastDraft, { status: 'sent', sentDate: new Date().toISOString() });
                alert('Email marked as sent (mock action).');
            } else {
                alert('No draft found to send for this affiliate.');
            }
        } catch (error) {
            console.error('Failed to send outreach (mock):', error);
            alert('Failed to mark email as sent.');
        } finally {
            setIsLoading(false);
        }
    };


    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <AffiliateSummaryMetrics />
                        <Card title="Affiliate Leaderboard">
                            <table className="w-full text-sm">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Referrals</th>
                                        <th className="px-6 py-3">Conversion</th>
                                        <th className="px-6 py-3">Commission (YTD)</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Tier</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_AFFILIATES_DATA.slice(0, 5).sort((a,b) => b.totalCommissionEarned - a.totalCommissionEarned).map(a => (
                                        <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-800">
                                            <td className="px-6 py-4 text-white">{a.name}</td>
                                            <td className="px-6 py-4">{a.totalReferrals.toLocaleString()}</td>
                                            <td className="px-6 py-4">{a.conversionRate}%</td>
                                            <td className="px-6 py-4 font-mono text-white">${a.totalCommissionEarned.toLocaleString()}</td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === 'active' ? 'bg-green-600/20 text-green-400' : a.status === 'pending' ? 'bg-yellow-600/20 text-yellow-400' : 'bg-red-600/20 text-red-400'}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 capitalize">{a.tier}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-4 text-right">
                                <button onClick={() => setActiveSection('affiliates')} className="text-cyan-500 hover:text-cyan-400 text-sm font-medium">View All Affiliates &rarr;</button>
                            </div>
                        </Card>
                    </div>
                );
            case 'affiliates':
                return <AffiliateManagementTable />;
            case 'assets':
                return <MarketingAssetsLibrary />;
            case 'settings':
                return <ProgramSettingsView />;
            case 'analytics':
                return <Card title="Analytics & Reports"><div className="text-gray-400 py-8 text-center">Detailed performance graphs and custom report generation will go here. (Under Development)</div></Card>;
            case 'outreach':
                return <Card title="Affiliate Outreach"><div className="text-gray-400 py-8 text-center">Comprehensive CRM for affiliate communication and automated campaigns. (Under Development)</div></Card>;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Affiliate Program</h2>
                    <div className="flex space-x-3">
                        <button onClick={() => setOutreachModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Outreach Writer</button>
                        <button onClick={() => setOutreachHistoryModalOpen(true)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Outreach History</button>
                        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">Integrations</button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveSection('dashboard')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeSection === 'dashboard' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveSection('affiliates')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeSection === 'affiliates' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            Affiliate Management
                        </button>
                        <button
                            onClick={() => setActiveSection('assets')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeSection === 'assets' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            Marketing Assets
                        </button>
                        <button
                            onClick={() => setActiveSection('analytics')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeSection === 'analytics' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            Analytics & Reports
                        </button>
                        <button
                            onClick={() => setActiveSection('settings')}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeSection === 'settings' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}
                        >
                            Settings
                        </button>
                    </nav>
                </div>

                {renderSection()}
            </div>

            {/* AI Outreach Writer Modal (Original, enhanced) */}
            {isOutreachModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setOutreachModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">AI Affiliate Outreach Writer</h3>
                            <button onClick={() => setOutreachModalOpen(false)} className="text-gray-400 hover:text-white transition-colors duration-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <label htmlFor="affiliateNameInput" className="block text-sm font-medium text-gray-300">Target Affiliate/Prospect Name:</label>
                            <input
                                id="affiliateNameInput"
                                type="text"
                                value={affiliateName}
                                onChange={e => setAffiliateName(e.target.value)}
                                className="w-full bg-gray-700/50 p-2 rounded text-white border border-gray-600 focus:ring-cyan-600 focus:border-cyan-600"
                                placeholder="e.g., Fintech Weekly"
                            />
                            <button onClick={handleGenerate} disabled={isLoading || !affiliateName} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors duration-200">
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </span>
                                ) : 'Generate Email'}
                            </button>
                            <Card title="Generated Email">
                                <div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line p-2 border border-gray-700 rounded bg-gray-900/40">
                                    {isLoading && !outreachMsg ? (
                                        <div className="text-center text-gray-500">Generating email content...</div>
                                    ) : outreachMsg ? (
                                        outreachMsg
                                    ) : (
                                        <div className="text-center text-gray-500">Click 'Generate Email' to create a new outreach message.</div>
                                    )}
                                </div>
                            </Card>
                            {outreachMsg && (
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => setOutreachMsg('')} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Clear</button>
                                    <button onClick={handleSendOutreach} disabled={isLoading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">Send Email (Mock)</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Outreach History Modal (New) */}
            <OutreachHistoryModal isOpen={isOutreachHistoryModalOpen} onClose={() => setOutreachHistoryModalOpen(false)} />
        </>
    );
};

export default AffiliatesView;